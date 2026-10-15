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
export function LessonWorkspace({ lesson }: { lesson: Lesson }) {
  const { data, loading } = useLearning();
  if (loading)
    return (
      <div className="loading-panel">
        <Spinner className="size-4" />
        Loading lesson…
      </div>
    );
  return (
    <LessonContent
      key={lesson.id}
      lesson={lesson}
      initialCode={
        data?.progress.find((p) => p.lessonId === lesson.id)?.code ??
        lesson.starter
      }
    />
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
  const [code, setCode] = useState(initialCode);
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
  const current = useRef(code);
  current.current = code;
  useEffect(() => {
    if (!dirty) return;
    setStatus("Unsaved changes");
    const timer = setTimeout(() => {
      saveDraft({ lessonId: lesson.id, code });
      setDirty(false);
    }, 650);
    return () => clearTimeout(timer);
  }, [code, dirty, lesson.id, saveDraft]);
  const track = tracks.find((t) => t.id === lesson.track)!;
  const next = lessons[lessons.findIndex((l) => l.id === lesson.id) + 1];
  const run = async () => {
    if (submit.isPending) return;
    setDirty(false);
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
  const reset = () => {
    setCode(lesson.starter);
    setResult(null);
    setDirty(false);
    saveDraft({ lessonId: lesson.id, code: lesson.starter });
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
      code={code}
      onChange={(value) => {
        setCode(value);
        setDirty(true);
        if (result?.passed) setResult(null);
      }}
      filename={lesson.filename}
      onRun={() => void run()}
      onReset={reset}
      running={submit.isPending}
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
      result={result}
      running={submit.isPending}
      simulation={lesson.track === "nextjs"}
      withChecks
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
          <span className="lesson-meta">{lesson.number} / {lessons.filter((item) => item.track === lesson.track).length}</span>
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
                : result
                  ? "Check the feedback and try again."
                  : "Read the task. Write code. Run it."}
            </span>
            <Kbd>⌘ / Ctrl + Enter</Kbd>
          </>
        )}
      </div>
    </div>
  );
}
