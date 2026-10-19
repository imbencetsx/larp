import { rawLessons, type Lesson } from "~/content/curriculum";
import formattedCode from "~/content/formatted-code.json" with { type: "json" };

const rawDefaultFixture =
  '<main><section class="plant"><h2>A little fern</h2><p>Give me a little room to grow.</p></section></main>';
const rawPortfolioFixture =
  '<main class="studio"><header><h1>Mira’s tiny studio</h1><p class="journal-copy">Small garden projects, built one idea at a time.</p></header><section class="project-grid"><article class="project-card featured-project"><div aria-hidden="true">✿</div><div class="project-card-copy"><h2 class="project-title">Seed keeper</h2><p class="journal-copy">A journal for the spring garden.</p><a class="project-link" href="#notes">Explore Seed keeper</a></div></article><article class="project-card"><div aria-hidden="true">✿</div><div class="project-card-copy"><h2 class="project-title">Field notes</h2><p class="journal-copy">Observations from the growing season.</p><a class="project-link" href="#notes">Read Field notes</a></div></article></section><footer id="notes"><p>Made slowly, with care.</p></footer></main>';
const rawAppStyles =
  "body{margin:0;padding:24px;background:#f4efdf;color:#302b22;font:16px/1.5 system-ui}main{max-width:760px;margin:auto}button,input,select{font:inherit;padding:8px;margin:4px}button{background:#355d42;color:white;border:0;cursor:pointer}article,li{padding:12px;margin-block:8px;border:1px solid #c9bea9}ul{padding:0;list-style:none}label{display:block}button:focus-visible,input:focus-visible{outline:3px solid #b46d3a;outline-offset:2px}";
export const rawWorkspaceExamples = {
  defaultFixture: rawDefaultFixture,
  portfolioFixture: rawPortfolioFixture,
  appStyles: rawAppStyles,
};
const formatted = formattedCode as unknown as {
  $workspace?: typeof rawWorkspaceExamples;
};
export const { defaultFixture, portfolioFixture, appStyles } =
  formatted.$workspace ?? rawWorkspaceExamples;
type SavedFiles = {
  format: "larp-files-v1" | "larp-files-v2";
  files: Record<string, string>;
};
export function initialFiles(lesson: Lesson): Record<string, string> {
  const files: Record<string, string> = {
    ...lesson.files,
    [lesson.filename]: lesson.starter,
  };
  if (lesson.track === "css")
    files["index.html"] =
      lesson.fixture ??
      (lesson.number >= 3 && lesson.number <= 10
        ? portfolioFixture
        : defaultFixture
      ).replaceAll('href="styles.css"', `href="${lesson.filename}"`);
  if (lesson.track === "html") files["styles.css"] = "";
  if (
    lesson.fixture &&
    (lesson.track === "javascript" || lesson.track === "typescript")
  ) {
    files["index.html"] = lesson.fixture;
    files["styles.css"] = appStyles;
  }
  return files;
}
export function readFiles(
  lesson: Lesson,
  saved: string,
): Record<string, string> {
  const defaults = initialFiles(lesson);
  const raw = rawLessons.find((item) => item.id === lesson.id);
  const restore = (name: string, value: string) => {
    if (name !== lesson.filename && value === lesson.legacyFiles?.[name])
      return defaults[name]!;
    if (name === lesson.filename && value === lesson.legacyStarter)
      return lesson.starter;
    if (name === lesson.filename && value === raw?.starter)
      return lesson.starter;
    if (name === lesson.filename && value === raw?.solution) {
      try {
        const reference = JSON.parse(lesson.solution) as SavedFiles;
        if (reference.format === "larp-files-v2")
          return reference.files[name] ?? value;
      } catch {
        /* Single-file reference implementations are plain source. */
      }
      return lesson.solution;
    }
    if (
      value === raw?.files?.[name] ||
      (name === "index.html" && value === raw?.fixture)
    )
      return defaults[name]!;
    if (
      name === "index.html" &&
      [rawDefaultFixture, rawPortfolioFixture].includes(value)
    )
      return defaults[name]!;
    if (name === "styles.css" && value === rawAppStyles) return appStyles;
    return value;
  };
  try {
    const parsed = JSON.parse(saved) as Partial<SavedFiles> | null;
    if (
      (parsed?.format === "larp-files-v1" ||
        parsed?.format === "larp-files-v2") &&
      parsed.files &&
      typeof parsed.files === "object" &&
      !Array.isArray(parsed.files)
    ) {
      for (const name of Object.keys(defaults)) {
        const value = parsed.files[name];
        if (typeof value === "string")
          defaults[name] =
            parsed.format === "larp-files-v2" ? value : restore(name, value);
      }
      return defaults;
    }
  } catch {
    /* Older drafts store only the entry file. */
  }
  return { ...defaults, [lesson.filename]: restore(lesson.filename, saved) };
}
export function saveFiles(files: Record<string, string>): string {
  return JSON.stringify({
    format: "larp-files-v2",
    files,
  } satisfies SavedFiles);
}
