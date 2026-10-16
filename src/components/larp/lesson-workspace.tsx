"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Download,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardHeader } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Kbd } from "~/components/ui/kbd";
import { Spinner } from "~/components/ui/spinner";
import { Tabs, TabsList, TabsPanel, TabsTab } from "~/components/ui/tabs";
import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogPanel,
  DialogTrigger,
} from "~/components/ui/dialog";
import { useMediaQuery } from "~/hooks/use-media-query";
import { api } from "~/trpc/react";
import { lessons, tracks, type Lesson } from "~/content/curriculum";
import { useLearning } from "./learning-provider";
import { GrowingPlant } from "./growing-plant";
import { fullBloomStage, getCourseGrowth } from "~/lib/garden";
import { Badge } from "~/components/ui/badge";
import { Editor, Preview, Snippet } from "./code-workspace";
import type { RunResult } from "~/server/services/validate";
import { initialFiles, readFiles, saveFiles } from "~/lib/workspace";
import { downloadProject } from "~/lib/download-project";
import { QuizWorkspace } from "./quiz-workspace";
export function LessonWorkspace({ lesson }: { lesson: Lesson }) {
  const { data, loading } = useLearning();
  if (loading)
    return (
      <div className="loading-panel">
        <Spinner className="size-4" />
        Loading lesson…
      </div>
    );
  const initialCode =
    data?.progress.find((p) => p.lessonId === lesson.id)?.code ??
    lesson.starter;
  if (lesson.kind === "quiz")
    return (
      <QuizWorkspace
        key={lesson.id}
        lesson={lesson}
        initialCode={initialCode}
      />
    );
  return (
    <LessonContent key={lesson.id} lesson={lesson} initialCode={initialCode} />
  );
}
function LessonContent({
  lesson,
  initialCode,
}: {
  lesson: Lesson;
  initialCode: string;
}) {
  const { data, refresh } = useLearning();
  const growth = getCourseGrowth(lesson.track, data?.progress);
  const mobile = useMediaQuery("(max-width: 1000px)");
  const [lessonOpen, setLessonOpen] = useState(false);
  const [instructionTab, setInstructionTab] = useState("task");
  const [readingStep, setReadingStep] = useState(0);
  const [files, setFiles] = useState(() => readFiles(lesson, initialCode));
  const [activeFile, setActiveFile] = useState(lesson.filename);
  const code = files[lesson.filename]!;
  const draft = saveFiles(files);
  const [lastAction, setLastAction] = useState<"run" | "submit" | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [result, setResult] = useState<
    (RunResult & { newlyCompleted: boolean }) | null
  >(null);
  const [hint, setHint] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState("All changes saved");
  const { mutate: saveDraft, isPending: saving } =
    api.learning.save.useMutation({
      onSuccess: () => setStatus("All changes saved"),
      onError: () => setStatus("Save failed — edit to retry"),
    });
  const submit = api.learning.submit.useMutation();
  const runner = api.learning.run.useMutation();
  const exporter = api.learning.exportProject.useMutation();
  const busy = runner.isPending || submit.isPending;
  const current = useRef(draft);
  current.current = draft;
  useEffect(() => {
    if (!dirty) return;
    setStatus("Unsaved changes");
    const timer = setTimeout(() => {
      saveDraft({ lessonId: lesson.id, code: draft });
      setDirty(false);
    }, 650);
    return () => clearTimeout(timer);
  }, [draft, dirty, lesson.id, saveDraft]);
  const track = tracks.find((t) => t.id === lesson.track)!;
  const next = lessons[lessons.findIndex((l) => l.id === lesson.id) + 1];
  const submitCode = async () => {
    if (busy) return;
    setDirty(false);
    setLastAction("submit");
    try {
      const response = await submit.mutateAsync({
        lessonId: lesson.id,
        code: current.current,
      });
      setResult(response);
      setStatus("All changes saved");
      await refresh();
    } catch (error) {
      setResult({
        passed: false,
        checks: [],
        output: [],
        preview: null,
        error:
          error instanceof Error
            ? error.message
            : "Could not run. Please try again.",
        newlyCompleted: false,
      });
    }
  };
  const run = async () => {
    if (busy) return;
    setDirty(false);
    setLastAction("run");
    saveDraft({ lessonId: lesson.id, code: current.current });
    try {
      const response = await runner.mutateAsync({
        lessonId: lesson.id,
        code: current.current,
      });
      setResult({ ...response, newlyCompleted: false });
    } catch (error) {
      setResult({
        passed: false,
        checks: [],
        output: [],
        preview: null,
        error:
          error instanceof Error ? error.message : "Could not run. Try again.",
        newlyCompleted: false,
      });
    }
  };
  const reset = () => {
    const resetFiles = initialFiles(lesson);
    setFiles(resetFiles);
    setResult(null);
    setLastAction(null);
    setDirty(false);
    saveDraft({ lessonId: lesson.id, code: saveFiles(resetFiles) });
  };
  const instructions = (
    <Card
      render={<section />}
      className="workspace-pane instruction-pane"
      aria-label="Lesson instructions"
    >
      <Tabs
        value={instructionTab}
        onValueChange={(v) => setInstructionTab(String(v))}
        className="instruction-tabs"
      >
        <CardHeader className="pane-tabs-header">
          <TabsList size="sm" aria-label="Lesson content">
            <TabsTab value="task">Task</TabsTab>
            <TabsTab value="read">Read</TabsTab>
            <TabsTab value="example">Example</TabsTab>
            {lesson.projectBrief && <TabsTab value="brief">Ship</TabsTab>}
          </TabsList>
        </CardHeader>
        <TabsPanel value="task">
          <div className="instruction-content">
            <p className="lesson-objective">{lesson.task}</p>
            <ul className="requirements">
              {lesson.requirements.map((r, i) => (
                <li
                  key={r}
                  className={result?.checks[i]?.passed ? "passed" : ""}
                >
                  {result?.checks[i]?.passed ? (
                    <CheckCircle2 aria-hidden="true" />
                  ) : (
                    <span className="check-circle" />
                  )}
                  {r}
                </li>
              ))}
            </ul>
            <div
              className="lesson-plant-growth"
              aria-label={`${track.plant}: ${growth.stageName}`}
            >
              <GrowingPlant
                variant={tracks.findIndex((t) => t.id === lesson.track)}
                stage={growth.stage}
              />
              <div>
                <strong>{track.plant}</strong>
                <span>
                  {growth.stageName} · {growth.stage + 1}/{fullBloomStage + 1}
                </span>
              </div>
              {growth.bloomed && <Badge variant="success">Bloomed</Badge>}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="hint-button"
              onClick={() =>
                setHint((h) => Math.min(h + 1, lesson.hints.length))
              }
            >
              <Lightbulb aria-hidden="true" />
              {hint === lesson.hints.length
                ? "All hints shown"
                : hint
                  ? "Next hint"
                  : "Show hint"}
            </Button>
            {hint > 0 && (
              <Alert className="hint-text">
                <Lightbulb />
                <AlertDescription>{lesson.hints[hint - 1]}</AlertDescription>
              </Alert>
            )}
          </div>
        </TabsPanel>
        {lesson.projectBrief && (
          <TabsPanel value="brief">
            <div className="instruction-content">
              <span className="eyebrow">PROJECT REVIEW</span>
              <h2>Before you ship</h2>
              <ul className="project-brief">
                {lesson.projectBrief.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Button
                variant="outline"
                loading={exporter.isPending}
                onClick={async () => {
                  setDownloadError(null);
                  try {
                    downloadProject(
                      await exporter.mutateAsync({
                        lessonId: lesson.id,
                        code: current.current,
                      }),
                      lesson.id,
                    );
                  } catch (error) {
                    setDownloadError(
                      error instanceof Error
                        ? error.message
                        : "Could not export project.",
                    );
                  }
                }}
              >
                <Download aria-hidden="true" />
                Download project ZIP
              </Button>
              {downloadError && <p role="alert">{downloadError}</p>}
            </div>
          </TabsPanel>
        )}
        <TabsPanel value="read">
          <div className="instruction-content read-content">
            <span className="eyebrow">THE CONCEPT</span>
            <h2>{lesson.objective}</h2>
            <p className="lesson-paragraph">{lesson.paragraphs[readingStep]}</p>
            <div className="reading-pagination">
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Previous explanation"
                disabled={readingStep === 0}
                onClick={() => setReadingStep((s) => s - 1)}
              >
                <ChevronLeft aria-hidden="true" />
              </Button>
              <span>
                {readingStep + 1} / {lesson.paragraphs.length}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Next explanation"
                disabled={readingStep === lesson.paragraphs.length - 1}
                onClick={() => setReadingStep((s) => s + 1)}
              >
                <ChevronRight aria-hidden="true" />
              </Button>
            </div>
          </div>
        </TabsPanel>
        <TabsPanel value="example">
          <div className="instruction-content example-content">
            <Snippet code={lesson.example} filename={lesson.filename} />
            <p className="snippet-note">{lesson.exampleNote}</p>
          </div>
        </TabsPanel>
      </Tabs>
    </Card>
  );
  const editor = (
    <Editor
      code={files[activeFile]!}
      onChange={(value) => {
        setFiles((previous) => ({ ...previous, [activeFile]: value }));
        setDirty(true);
        setResult(null);
        setLastAction(null);
      }}
      filename={activeFile}
      files={Object.keys(files)}
      onFileChange={setActiveFile}
      onRun={() => void run()}
      onSubmit={() => void submitCode()}
      onReset={reset}
      running={runner.isPending}
      submitting={submit.isPending}
      saveStatus={saving ? "Saving…" : status}
      onBlur={() => {
        if (dirty) {
          setDirty(false);
          saveDraft({ lessonId: lesson.id, code: current.current });
        }
      }}
    />
  );
  const output = (
    <Preview
      track={lesson.track}
      code={code}
      fixture={files["index.html"]}
      stylesheet={files["styles.css"] ?? files["app/globals.css"]}
      serializedCode={draft}
      lessonId={lesson.id}
      result={result}
      running={busy}
      simulation={lesson.track === "nextjs"}
      withChecks={lastAction === "submit"}
    />
  );
  return (
    <div className="lesson-workbench">
      <div className="lesson-topline">
        <div>
          <Link href={`/courses/${lesson.track}`} className="back-link">
            <ArrowLeft aria-hidden="true" />
            {track.name}
          </Link>
          <h1>{lesson.title}</h1>
        </div>
        <div className="lesson-topline-actions">
          <span className="lesson-meta">
            {lesson.number} /{" "}
            {lessons.filter((item) => item.track === lesson.track).length}
          </span>
          {lesson.kind === "project" && (
            <Badge variant="outline">PROJECT</Badge>
          )}
          {mobile && (
            <Dialog open={lessonOpen} onOpenChange={setLessonOpen}>
              <DialogTrigger render={<Button variant="outline" />}>
                Lesson & hints
              </DialogTrigger>
              <DialogPopup className="lesson-dialog">
                <DialogHeader>
                  <DialogTitle>{lesson.title}</DialogTitle>
                  <DialogDescription>
                    {track.name} · Lesson {lesson.number}
                  </DialogDescription>
                </DialogHeader>
                <DialogPanel>{instructions}</DialogPanel>
              </DialogPopup>
            </Dialog>
          )}
        </div>
      </div>
      <div className="workbench-grid">
        {!mobile && instructions}
        {editor}
        {output}
      </div>
      <div
        className={`lesson-statusbar ${result?.passed ? "completion-panel" : ""}`}
        role="status"
      >
        {result?.passed ? (
          <>
            <span>
              <CheckCircle2 aria-hidden="true" />
              All checks passed.
              {!result.newlyCompleted && <small>Already completed</small>}
            </span>
            <Button
              size="sm"
              render={
                <Link
                  href={
                    next ? `/learn/${next.track}/${next.number}` : "/courses"
                  }
                />
              }
            >
              {next ? "Next lesson" : "Back to courses"}
              <ArrowRight aria-hidden="true" />
            </Button>
          </>
        ) : (
          <>
            <span>
              {result?.error
                ? "Fix the error and run again."
                : lastAction === "run" && result
                  ? "Preview ready. Submit to check your work."
                  : result
                    ? "Check the feedback and try again."
                    : "Run to test. Submit to save completion."}
            </span>
            <Kbd>⌘ / Ctrl + Enter</Kbd>
          </>
        )}
      </div>
    </div>
  );
}
