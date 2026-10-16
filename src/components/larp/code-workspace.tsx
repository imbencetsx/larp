"use client";
import { useEffect, useRef, useState } from "react";
import { Highlight, themes } from "prism-react-renderer";
import {
  Check,
  CheckCircle2,
  Code2,
  Copy,
  FlaskConical,
  Info,
  Play,
  RotateCcw,
  Save,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardPanel, CardFooter } from "~/components/ui/card";
import { SourceEditor } from "./source-editor";
import { Alert, AlertTitle, AlertDescription } from "~/components/ui/alert";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyDescription,
  EmptyContent,
} from "~/components/ui/empty";
import { Tabs, TabsList, TabsPanel, TabsTab } from "~/components/ui/tabs";
import { api } from "~/trpc/react";
import type { RunResult } from "~/server/services/validate";
import { previewDocument, isPreviewEvent } from "~/lib/preview-document";
import { MAX_PREVIEW_EVENTS, type PreviewEvent } from "~/lib/simulation";
import type { TrackId } from "~/content/curriculum";
export function CopyButton({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return (
    <Button
      variant="ghost"
      size="xs"
      aria-label={state === "copied" ? "Code copied" : "Copy code"}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setState("copied");
        } catch {
          setState("error");
        }
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setState("idle"), 2000);
      }}
    >
      {state === "copied" ? (
        <Check aria-hidden="true" />
      ) : (
        <Copy aria-hidden="true" />
      )}
      <span>
        {state === "copied"
          ? "Copied!"
          : state === "error"
            ? "Copy unavailable"
            : "Copy"}
      </span>
    </Button>
  );
}
export function Snippet({
  code,
  filename,
}: {
  code: string;
  filename: string;
}) {
  const language = filename.endsWith("css")
    ? "css"
    : filename.endsWith("html")
      ? "markup"
      : filename.endsWith("tsx")
        ? "tsx"
        : filename.endsWith("ts")
          ? "typescript"
          : "javascript";
  return (
    <Card className="snippet">
      <CardHeader className="snippet-header">
        <span>{filename}</span>
        <CopyButton text={code} />
      </CardHeader>
      <Highlight theme={themes.nightOwl} code={code} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={className}
            style={{ ...style, background: "var(--code)" }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, j) => (
                  <span key={j} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </Card>
  );
}
export function Editor({
  code,
  onChange,
  filename,
  onRun,
  onSubmit,
  onReset,
  running = false,
  submitting = false,
  files,
  onFileChange,
  saveStatus = "",
  onBlur,
  maxLength = 30000,
}: {
  code: string;
  onChange: (s: string) => void;
  filename: string;
  onRun: () => void;
  onSubmit?: () => void;
  onReset: () => void;
  running?: boolean;
  submitting?: boolean;
  files?: string[];
  onFileChange?: (filename: string) => void;
  saveStatus?: string;
  onBlur?: () => void;
  maxLength?: number;
}) {
  return (
    <Card render={<section />} className="editor-card" aria-label="Code editor">
      <CardHeader className="editor-toolbar border-b">
        <span className="editor-file">
          <Code2 aria-hidden="true" />
          {filename}
        </span>
        <div className="editor-actions">
          <CopyButton text={code} />
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Reset code to starter"
            disabled={running || submitting}
            onClick={onReset}
          >
            <RotateCcw aria-hidden="true" />
          </Button>
        </div>
      </CardHeader>
      {files && files.length > 1 && (
        <Tabs
          value={filename}
          onValueChange={(value) => onFileChange?.(String(value))}
          className="file-tabs"
        >
          <TabsList variant="underline" aria-label="Project files">
            {files.map((file) => (
              <TabsTab key={file} value={file} disabled={running || submitting}>
                {file}
              </TabsTab>
            ))}
          </TabsList>
        </Tabs>
      )}
      <CardPanel className="code-editor-wrapper">
        <SourceEditor
          code={code}
          filename={filename}
          onChange={onChange}
          onRun={onRun}
          onSubmit={onSubmit}
          onBlur={onBlur}
          readOnly={running || submitting}
          maxLength={maxLength}
        />
        <span id="editor-keyboard-help" className="sr-only">
          Tab indents. Shift+Tab unindents. Press Escape, then Tab to leave the
          editor. Control or Command+Enter runs your code; add Shift to submit.
        </span>
      </CardPanel>
      <CardFooter className="editor-bottom border-t">
        <span className="save-status" role="status">
          {saveStatus ? (
            <>
              <Save aria-hidden="true" />
              {saveStatus}
            </>
          ) : (
            <>
              <ShieldCheck aria-hidden="true" />
              Isolated environment
            </>
          )}
        </span>
        <div className="editor-run-actions">
          <Button
            variant={onSubmit ? "outline" : "default"}
            size="sm"
            loading={running}
            disabled={running || submitting}
            onClick={onRun}
          >
            <Play aria-hidden="true" />
            {onSubmit ? "Run" : "Run code"}
          </Button>
          {onSubmit && (
            <Button
              size="sm"
              loading={submitting}
              disabled={running || submitting}
              onClick={onSubmit}
            >
              <CheckCircle2 aria-hidden="true" />
              Submit
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
const fixture =
  '<div class="plant"><h2>A little fern</h2><p>Give me a little room to grow.</p></div>';
export function Preview({
  track,
  code,
  result,
  running = false,
  simulation = false,
  withChecks = false,
  fixture: lessonFixture,
  stylesheet,
  serializedCode,
  lessonId,
  playgroundTrack,
}: {
  track: string;
  code: string;
  result: RunResult | null;
  running?: boolean;
  simulation?: boolean;
  withChecks?: boolean;
  fixture?: string;
  stylesheet?: string;
  serializedCode?: string;
  lessonId?: string;
  playgroundTrack?: TrackId;
}) {
  const [live, setLive] = useState(code);
  const [clicks, setClicks] = useState(0);
  const [simulated, setSimulated] = useState<RunResult | null>(null);
  const simulator = api.learning.simulate.useMutation();
  useEffect(() => {
    setClicks(0);
    setSimulated(null);
  }, [code, result]);
  const stepSimulation = async (count: number) => {
    try {
      const output = await simulator.mutateAsync({
        code: serializedCode ?? code,
        clicks: count,
        lessonId,
      });
      setSimulated(output);
      if (!output.error) setClicks(count);
    } catch (error) {
      setSimulated({
        passed: false,
        checks: [],
        output: [],
        preview: null,
        error: error instanceof Error ? error.message : "Could not simulate.",
      });
    }
  };
  const [tab, setTab] = useState(
    track === "html" || track === "css" || track === "nextjs"
      ? "preview"
      : "console",
  );
  useEffect(() => {
    const id = setTimeout(() => setLive(code), 250);
    return () => clearTimeout(id);
  }, [code]);
  useEffect(() => {
    if (result?.error) setTab("console");
    else if (withChecks && result && !result.passed) setTab("checks");
    else if (result?.preview || result?.browserApp) setTab("preview");
  }, [result, withChecks]);
  const frame = useRef<HTMLIFrameElement>(null);
  const channel = useRef(crypto.randomUUID());
  const history = useRef<PreviewEvent[]>([]);
  const [browserPreview, setBrowserPreview] = useState<RunResult | null>(null);
  const [previewHTML, setPreviewHTML] = useState("");
  const [focusId, setFocusId] = useState<number | undefined>();
  const { mutateAsync: simulateBrowser } =
    api.learning.browserSimulate.useMutation();
  const { mutateAsync: simulatePlayground } =
    api.learning.playground.useMutation();
  const previewBusy = useRef(false);
  const generation = useRef(0);
  useEffect(() => {
    generation.current++;
    history.current = [];
    setBrowserPreview(null);
    setFocusId(undefined);
  }, [code, result, serializedCode]);
  useEffect(() => {
    const receive = async (event: MessageEvent<unknown>) => {
      const message = event.data as {
        kind?: unknown;
        channel?: unknown;
        event?: unknown;
      } | null;
      if (
        event.source !== frame.current?.contentWindow ||
        event.origin !== "null" ||
        message?.kind !== "larp-preview" ||
        message?.channel !== channel.current ||
        !isPreviewEvent(message?.event) ||
        (!lessonId && !playgroundTrack) ||
        !result?.browserApp ||
        previewBusy.current
      )
        return;
      if (history.current.length >= MAX_PREVIEW_EVENTS) {
        setBrowserPreview({
          passed: false,
          checks: [],
          output: [],
          preview: null,
          error: "Preview limit reached. Run again to restart the app.",
        });
        return;
      }
      previewBusy.current = true;
      const requestGeneration = generation.current;
      const action = message.event;
      const events = [...history.current, action];
      try {
        const output = playgroundTrack
          ? await simulatePlayground({
              track: playgroundTrack,
              code: serializedCode ?? code,
              events,
            })
          : await simulateBrowser({
              lessonId: lessonId!,
              code: serializedCode ?? code,
              events,
            });
        if (requestGeneration !== generation.current) return;
        if (!output.error) {
          history.current = events;
          setFocusId(action.type === "input" ? action.id : undefined);
        }
        setBrowserPreview(output);
      } catch {
        if (requestGeneration !== generation.current) return;
        setBrowserPreview({
          passed: false,
          checks: [],
          output: [],
          preview: null,
          error: "Could not update the preview. Run again to retry.",
        });
      } finally {
        previewBusy.current = false;
      }
    };
    const listener = (event: MessageEvent<unknown>) => {
      void receive(event);
    };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, [
    simulateBrowser,
    simulatePlayground,
    code,
    lessonId,
    result,
    serializedCode,
    playgroundTrack,
  ]);
  const consoleResult = browserPreview ?? simulated ?? result;
  const html = playgroundTrack
    ? (browserPreview?.preview ??
      simulated?.preview ??
      result?.preview ??
      lessonFixture)
    : track === "html"
      ? live
      : track === "css"
        ? (lessonFixture ?? fixture)
        : (browserPreview?.preview ?? simulated?.preview ?? result?.preview);
  useEffect(() => {
    if (!html) {
      setPreviewHTML("");
      return;
    }
    setPreviewHTML(
      previewDocument(html, track === "css" ? live : (stylesheet ?? ""), {
        channel: channel.current,
        origin: window.location.origin,
        interactive: !!result?.browserApp,
        focusId,
      }),
    );
  }, [html, track, live, stylesheet, result?.browserApp, focusId]);
  return (
    <Card
      render={<section />}
      className="preview-card"
      aria-label="Code output"
    >
      <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
        <CardHeader className="pane-tabs-header">
          <TabsList size="sm">
            <TabsTab value="preview">
              <FlaskConical aria-hidden="true" />
              Preview
            </TabsTab>
            <TabsTab value="console">
              <Terminal aria-hidden="true" />
              Console
              {consoleResult?.error && (
                <span className="bg-destructive size-1.5 rounded-full" />
              )}
            </TabsTab>
            {withChecks && (
              <TabsTab value="checks" disabled={!result}>
                Checks
              </TabsTab>
            )}
          </TabsList>
        </CardHeader>
        <TabsPanel value="preview" className="preview-panel">
          {html ? (
            <iframe
              title="Sandboxed code preview"
              className="preview-frame rounded-lg border"
              ref={frame}
              sandbox="allow-scripts allow-forms"
              referrerPolicy="no-referrer"
              allow="camera 'none'; microphone 'none'; geolocation 'none'; payment 'none'; clipboard-read 'none'; clipboard-write 'none'"
              srcDoc={previewHTML}
            />
          ) : (
            <Empty className="preview-placeholder">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Code2 aria-hidden="true" />
                </EmptyMedia>
                <EmptyDescription>
                  {track === "nextjs"
                    ? "Run to preview your component."
                    : "Output appears in the console."}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTab("console")}
                >
                  Open console
                </Button>
              </EmptyContent>
            </Empty>
          )}
        </TabsPanel>
        <TabsPanel value="console" className="preview-panel">
          <div className="console-output" aria-live="polite">
            {running ? (
              <span className="console-empty">Running your code…</span>
            ) : (
              <>
                {!consoleResult && (
                  <span className="console-empty">Run code to see output.</span>
                )}
                {consoleResult?.output.map((line, i) => (
                  <div key={i} className="console-line">
                    {line}
                  </div>
                ))}
                {consoleResult &&
                  !consoleResult.output.length &&
                  !consoleResult.error && (
                    <span className="console-empty">
                      Code ran without errors.{" "}
                      {track === "html" || track === "css"
                        ? "Open Preview to see your page."
                        : "Use console.log() to print a value."}
                    </span>
                  )}
                {consoleResult?.error && (
                  <Alert variant="error" className="run-error">
                    <AlertDescription>{consoleResult.error}</AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </div>
        </TabsPanel>
        {withChecks && (
          <TabsPanel value="checks" className="preview-panel">
            {result && <Results result={result} />}
          </TabsPanel>
        )}
      </Tabs>
      {simulation && code.includes("useState") && result?.preview && (
        <div className="simulation-controls">
          <span className="pixel-font">{clicks} SIMULATED CLICKS</span>
          <Button
            variant="outline"
            size="sm"
            loading={simulator.isPending}
            disabled={clicks >= 20 || running}
            onClick={() => void stepSimulation(clicks + 1)}
          >
            <Play aria-hidden="true" />
            Simulate a click
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Reset simulation"
            disabled={simulator.isPending}
            onClick={() => void stepSimulation(0)}
          >
            <RotateCcw aria-hidden="true" />
          </Button>
        </div>
      )}
      {(browserPreview?.error ?? simulated?.error) && (
        <Alert variant="error" className="run-error m-3 w-auto">
          <AlertDescription>
            {browserPreview?.error ?? simulated?.error}
          </AlertDescription>
        </Alert>
      )}
      {simulation && (
        <div className="simulator-note">
          <Info aria-hidden="true" />
          <span>
            Next.js concept simulator. Use the controls to test state. Not a
            full Next.js server.
          </span>
        </div>
      )}
      {track === "javascript" && result?.preview && (
        <div className="simulator-note">
          <Info aria-hidden="true" />
          <span>
            Safe DOM preview fixture: createElement, textContent, and append.
          </span>
        </div>
      )}
    </Card>
  );
}
export function Results({ result }: { result: RunResult }) {
  return (
    <section
      className={`results-panel ${result.passed ? "success" : ""}`}
      aria-live="polite"
    >
      <Alert variant={result.passed ? "success" : "default"}>
        {result.passed ? (
          <CheckCircle2 aria-hidden="true" />
        ) : (
          <FlaskConical aria-hidden="true" />
        )}
        <AlertTitle>
          {result.passed ? "All checks passed." : "Keep going."}
        </AlertTitle>
      </Alert>
      {result.error && (
        <Alert variant="error" className="run-error">
          <AlertDescription>
            {result.error}
            {result.output.length > 0 && (
              <>
                <br />
                {result.output.join("\n")}
              </>
            )}
          </AlertDescription>
        </Alert>
      )}
      <ul className="requirements">
        {result.checks.map((c) => (
          <li key={c.label} className={c.passed ? "passed" : ""}>
            {c.passed ? (
              <CheckCircle2 aria-hidden="true" />
            ) : (
              <span className="check-circle" />
            )}
            {c.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
