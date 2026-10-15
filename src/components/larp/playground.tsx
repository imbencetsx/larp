"use client";
import { useEffect, useState } from "react";
import { Sprout } from "lucide-react";
import { Button } from "~/components/ui/button";
import { tracks, lessons, type TrackId } from "~/content/curriculum";
import { api } from "~/trpc/react";
import { Editor, Preview } from "./code-workspace";
import type { RunResult } from "~/server/services/validate";
const defaults: Record<TrackId, string> = {
  html: '<h1>Small ideas belong here.</h1>\n<p>Try a tag. Change a word. See what happens.</p>\n<a href="https://developer.mozilla.org">Keep exploring</a>',
  css: ".plant {\n  color: #52734d;\n  background: #eef4e8;\n  padding: 24px;\n  border: 2px solid #b0c59d;\n  margin: 16px;\n}",
  javascript:
    'const ideas = ["learn", "experiment", "grow"];\n\nfor (const idea of ideas) {\n  console.log(`A little room to ${idea}.`);\n}',
  typescript:
    'type Plant = { name: string; leaves: number };\n\nconst fern: Plant = { name: "Fern", leaves: 4 };\nconsole.log(`${fern.name} has ${fern.leaves} leaves.`);',
  nextjs: lessons.find((l) => l.id === "nextjs-1")!.solution,
};
export function Playground() {
  const [track, setTrack] = useState<TrackId>("html");
  const [drafts, setDrafts] = useState(defaults);
  const [result, setResult] = useState<RunResult | null>(null);
  const [storage, setStorage] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const run = api.learning.playground.useMutation();
  useEffect(() => {
    try {
      const saved = localStorage.getItem("larp-playground-v1");
      if (saved) {
        const parsed = JSON.parse(saved) as Record<string, unknown>;
        setDrafts(
          Object.fromEntries(
            tracks.map((t) => [
              t.id,
              typeof parsed[t.id] === "string"
                ? String(parsed[t.id]).slice(0, 12000)
                : defaults[t.id],
            ]),
          ) as Record<TrackId, string>,
        );
      }
    } catch {
      setStorage(false);
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem("larp-playground-v1", JSON.stringify(drafts));
      } catch {
        setStorage(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [drafts, loaded]);
  const execute = async () => {
    if (run.isPending) return;
    try {
      setResult(await run.mutateAsync({ track, code: drafts[track] }));
    } catch (e) {
      setResult({
        passed: false,
        checks: [],
        output: [],
        preview: null,
        error: e instanceof Error ? e.message : "Could not run your code.",
      });
    }
  };
  return (
    <>
      <section className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="status-dot" /> THE SANDBOX
          </div>
          <h1>Playground.</h1>
          <p>Write. Run. Repeat.</p>
        </div>
      </section>
      <div
        className="playground-controls"
        aria-label="Choose programming language"
      >
        {tracks.map((t) => (
          <Button
            disabled={run.isPending}
            key={t.id}
            variant={track === t.id ? "secondary" : "outline"}
            size="sm"
            className="language-button"
            aria-pressed={track === t.id}
            onClick={() => {
              setTrack(t.id);
              setResult(null);
            }}
          >
            {t.name}
          </Button>
        ))}
      </div>
      <div className="playground-layout">
        <Editor
          code={drafts[track]}
          onChange={(code) => setDrafts((d) => ({ ...d, [track]: code }))}
          filename={
            track === "nextjs"
              ? "app/garden/page.tsx"
              : `experiment.${track === "javascript" ? "js" : track === "typescript" ? "ts" : track}`
          }
          onRun={() => void execute()}
          onReset={() => {
            setDrafts((d) => ({ ...d, [track]: defaults[track] }));
            setResult(null);
          }}
          running={run.isPending}
          saveStatus={
            storage
              ? "Draft stored on this device"
              : "Browser storage unavailable"
          }
        />
        <Preview
          key={track}
          track={track}
          code={drafts[track]}
          result={result}
          running={run.isPending}
          simulation={track === "nextjs"}
        />
      </div>
      <div className="playground-note">
        <Sprout aria-hidden="true" />
        <span>A scratchpad for your code.</span>
      </div>
    </>
  );
}
