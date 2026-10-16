import { lessons, type TrackId } from "~/content/curriculum";
import { htmlDocument } from "./html-document";

export type PlaygroundProject = "web" | "typescript" | "nextjs";
export type PlaygroundDrafts = Record<
  PlaygroundProject,
  Record<string, string>
>;
export const playgroundFileLimit = 12000;
export const playgroundProject = (track: TrackId): PlaygroundProject =>
  track === "typescript" || track === "nextjs" ? track : "web";
export const playgroundEntry = (track: TrackId) =>
  ({
    html: "index.html",
    css: "styles.css",
    javascript: "experiment.js",
    typescript: "experiment.ts",
    nextjs: "app/garden/page.tsx",
  })[track];

const html = `<main class="plant">
  <p class="eyebrow">THE LITTLE GREENHOUSE</p>
  <h1>Small ideas grow here.</h1>
  <p id="message">Make something of your own.</p>
  <button id="grow" type="button">Grow an idea</button>
</main>`;
const css = `body {
  margin: 0;
  padding: 28px;
  background: #211e1b;
  color: #eee5d5;
  font: 16px/1.6 system-ui;
}
.plant {
  max-width: 420px;
  padding: 24px;
  border: 1px solid #575246;
}
.eyebrow {
  color: #b5ca8b;
  font-size: 12px;
}
button {
  padding: 10px 16px;
  background: #b5ca8b;
  color: #211e1b;
  border: 0;
  cursor: pointer;
}`;
const javascript = `const button = document.getElementById("grow");
const message = document.getElementById("message");
let ideas = 0;

button?.addEventListener("click", () => {
  ideas += 1;
  if (message) message.textContent = ideas + " ideas taking root.";
});

console.log("Your greenhouse is ready.");`;
const typescript = `const button = document.getElementById("grow");
const message = document.getElementById("message");
let ideas: number = 0;

button?.addEventListener("click", () => {
  ideas += 1;
  if (message) message.textContent = ideas + " ideas taking root.";
});

console.log("Your typed greenhouse is ready.");`;

export function initialPlaygroundDrafts(): PlaygroundDrafts {
  return {
    web: {
      "index.html": htmlDocument(
        html,
        "My greenhouse",
        "styles.css",
        "experiment.js",
      ),
      "styles.css": css,
      "experiment.js": javascript,
    },
    typescript: {
      "index.html": htmlDocument(html, "My typed greenhouse"),
      "styles.css": css,
      "experiment.ts": typescript,
    },
    nextjs: {
      "app/garden/page.tsx": lessons.find((lesson) => lesson.id === "nextjs-1")!
        .solution,
      "app/globals.css": css,
    },
  };
}

function restoreFiles(defaults: Record<string, string>, value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return defaults;
  const saved = value as Record<string, unknown>;
  for (const name of Object.keys(defaults))
    if (
      typeof saved[name] === "string" &&
      !(name === "index.html" && saved[name] === html)
    )
      defaults[name] = saved[name].slice(0, playgroundFileLimit);
  return defaults;
}

export function restorePlaygroundDrafts(
  saved: unknown,
  legacy = false,
): PlaygroundDrafts {
  const drafts = initialPlaygroundDrafts();
  if (!saved || typeof saved !== "object" || Array.isArray(saved))
    return drafts;
  const value = saved as Record<string, unknown>;
  if (legacy) {
    for (const track of [
      "html",
      "css",
      "javascript",
      "typescript",
      "nextjs",
    ] as const)
      if (typeof value[track] === "string")
        drafts[playgroundProject(track)][playgroundEntry(track)] = value[
          track
        ].slice(0, playgroundFileLimit);
  } else {
    for (const project of ["web", "typescript", "nextjs"] as const)
      drafts[project] = restoreFiles(drafts[project], value[project]);
  }
  return drafts;
}

// Only the fixed project files are accepted; arbitrary paths never reach a compiler.
export function readPlaygroundFiles(
  track: TrackId,
  saved: string,
): Record<string, string> | undefined {
  try {
    const parsed = JSON.parse(saved) as {
      format?: unknown;
      files?: unknown;
    } | null;
    if (
      parsed?.format === "larp-files-v1" &&
      parsed.files &&
      typeof parsed.files === "object" &&
      !Array.isArray(parsed.files)
    ) {
      for (const content of Object.values(parsed.files))
        if (typeof content === "string" && content.length > playgroundFileLimit)
          throw Error("Keep each playground file under 12,000 characters.");
      return restoreFiles(
        initialPlaygroundDrafts()[playgroundProject(track)],
        parsed.files,
      );
    }
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    /* Legacy API clients can still run a single source file. */
  }
}
