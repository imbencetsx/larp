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
import { Textarea } from "~/components/ui/textarea";
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
  onReset,
  running = false,
  saveStatus = "",
  onBlur,
}: {
  code: string;
  onChange: (s: string) => void;
  filename: string;
  onRun: () => void;
  onReset: () => void;
  running?: boolean;
  saveStatus?: string;
  onBlur?: () => void;
}) {
  const gutter = useRef<HTMLDivElement>(null);
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
            disabled={running}
            onClick={onReset}
          >
            <RotateCcw aria-hidden="true" />
          </Button>
        </div>
      </CardHeader>
      <CardPanel className="code-editor-wrapper">
        <div className="line-numbers" aria-hidden="true" ref={gutter}>
          {Array.from(
            { length: Math.max(14, code.split("\n").length) },
            (_, i) => (
              <span key={i}>{i + 1}</span>
            ),
          )}
        </div>
        <Textarea
          className="code-control"
          data-code-editor="true"
          readOnly={running}
          aria-label={`Code editor for ${filename}`}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          value={code}
          maxLength={12000}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onScroll={(event) => {
            if (gutter.current)
              gutter.current.scrollTop = event.currentTarget.scrollTop;
          }}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              e.preventDefault();
              onRun();
            }
          }}
        />
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
        <Button size="sm" loading={running} disabled={running} onClick={onRun}>
          <Play aria-hidden="true" />
          Run code
        </Button>
      </CardFooter>
    </Card>
  );
}
const fixture =
  '<div class="plant"><h2>A little fern</h2><p>Give me a little room to grow.</p></div>';
export function previewDocument(html: string, css = "") {
  const styles = css ? `<style>${css.replace(/<\/style/gi, " ")}</style>` : "";
  return `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; form-action 'none'; base-uri 'none'; script-src 'none'">${styles}</head><body>${html}</body></html>`;
}
export function Preview({
  track,
  code,
  result,
  running = false,
  simulation = false,
  withChecks = false,
}: {
  track: string;
  code: string;
  result: RunResult | null;
  running?: boolean;
  simulation?: boolean;
  withChecks?: boolean;
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
      const output = await simulator.mutateAsync({ code, clicks: count });
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
    else if (result?.preview) setTab("preview");
  }, [result, withChecks]);
  const html =
    track === "html"
      ? live
      : track === "css"
        ? fixture
        : (simulated?.preview ?? result?.preview);
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
              {result?.error && (
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
              sandbox=""
              srcDoc={previewDocument(html, track === "css" ? live : "")}
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
                {!result && (
                  <span className="console-empty">Run code to see output.</span>
                )}
                {result?.output.map((line, i) => (
                  <div key={i} className="console-line">
                    {line}
                  </div>
                ))}
                {result && !result.output.length && !result.error && (
                  <span className="console-empty">
                    Code ran without errors.{" "}
                    {track === "html" || track === "css"
                      ? "Open Preview to see your page."
                      : "Use console.log() to print a value."}
                  </span>
                )}
                {result?.error && (
                  <Alert variant="error" className="run-error">
                    <AlertDescription>{result.error}</AlertDescription>
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
      {simulated?.error && (
        <Alert variant="error" className="run-error m-3 w-auto">
          <AlertDescription>{simulated.error}</AlertDescription>
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
          <span>Safe DOM preview fixture: createElement, textContent, and append.</span>
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
