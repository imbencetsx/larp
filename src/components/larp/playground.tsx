"use client";
import { useEffect, useState } from "react";
import { Sprout } from "lucide-react";
import { Button } from "~/components/ui/button";
import { tracks, type TrackId } from "~/content/curriculum";
import { api } from "~/trpc/react";
import { Editor, Preview } from "./code-workspace";
import type { RunResult } from "~/server/services/validate";
import {
  initialPlaygroundDrafts,
  playgroundEntry,
  playgroundProject,
  playgroundFileLimit,
  restorePlaygroundDrafts,
} from "~/lib/playground";
import { saveFiles } from "~/lib/workspace";
export function Playground() {
  const [track, setTrack] = useState<TrackId>("html");
  const [drafts, setDrafts] = useState(initialPlaygroundDrafts);
  const [activeFile, setActiveFile] = useState("index.html");
  const [result, setResult] = useState<RunResult | null>(null);
  const [storage, setStorage] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const run = api.learning.playground.useMutation();
  const project = playgroundProject(track);
  const files = drafts[project];
  const draft = saveFiles(files);
  const code = files[playgroundEntry(track)]!;
  useEffect(() => {
    try {
      const saved = localStorage.getItem("larp-playground-v2");
      const legacy = saved ? null : localStorage.getItem("larp-playground-v1");
      if (saved || legacy)
        setDrafts(
          restorePlaygroundDrafts(
            JSON.parse(saved ?? legacy!) as unknown,
            !saved,
          ),
        );
    } catch {
      setStorage(false);
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem("larp-playground-v2", JSON.stringify(drafts));
      } catch {
        setStorage(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [drafts, loaded]);
  const execute = async () => {
    if (run.isPending) return;
    try {
      setResult(await run.mutateAsync({ track, code: draft }));
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
        {tracks
          .filter((t) => t.id !== "css")
          .map((t) => (
            <Button
              disabled={run.isPending}
              key={t.id}
              variant={track === t.id ? "secondary" : "outline"}
              size="sm"
              className="language-button"
              aria-pressed={track === t.id}
              onClick={() => {
                setTrack(t.id);
                setActiveFile(playgroundEntry(t.id));
                setResult(null);
              }}
            >
              {t.id === "html" ? "HTML & CSS" : t.name}
            </Button>
          ))}
      </div>
      <div className="playground-layout">
        <Editor
          code={files[activeFile]!}
          onChange={(value) => {
            setDrafts((previous) => ({
              ...previous,
              [project]: { ...previous[project], [activeFile]: value },
            }));
            setResult(null);
          }}
          filename={activeFile}
          files={Object.keys(files)}
          onFileChange={setActiveFile}
          maxLength={playgroundFileLimit}
          onRun={() => void execute()}
          onReset={() => {
            setDrafts((previous) => ({
              ...previous,
              [project]: {
                ...previous[project],
                [activeFile]: initialPlaygroundDrafts()[project][activeFile]!,
              },
            }));
            setResult(null);
          }}
          running={run.isPending || !loaded}
          saveStatus={
            storage
              ? "Draft stored on this device"
              : "Browser storage unavailable"
          }
        />
        <Preview
          key={track}
          track={track}
          code={code}
          fixture={files["index.html"]}
          stylesheet={files["styles.css"] ?? files["app/globals.css"]}
          serializedCode={draft}
          playgroundTrack={track}
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
