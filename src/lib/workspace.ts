import type { Lesson } from "~/content/curriculum";

export const defaultFixture =
  '<main><section class="plant"><h2>A little fern</h2><p>Give me a little room to grow.</p></section></main>';
const portfolioFixture = '<main class="studio"><header><h1>Mira’s tiny studio</h1><p class="journal-copy">Small garden projects, built one idea at a time.</p></header><section class="project-grid"><article class="project-card featured-project"><div aria-hidden="true">✿</div><div class="project-card-copy"><h2 class="project-title">Seed keeper</h2><p class="journal-copy">A journal for the spring garden.</p><a class="project-link" href="#notes">Explore Seed keeper</a></div></article><article class="project-card"><div aria-hidden="true">✿</div><div class="project-card-copy"><h2 class="project-title">Field notes</h2><p class="journal-copy">Observations from the growing season.</p><a class="project-link" href="#notes">Read Field notes</a></div></article></section><footer id="notes"><p>Made slowly, with care.</p></footer></main>';
export const appStyles =
  "body{margin:0;padding:24px;background:#f4efdf;color:#302b22;font:16px/1.5 system-ui}main{max-width:760px;margin:auto}button,input,select{font:inherit;padding:8px;margin:4px}button{background:#355d42;color:white;border:0;cursor:pointer}article,li{padding:12px;margin-block:8px;border:1px solid #c9bea9}ul{padding:0;list-style:none}label{display:block}button:focus-visible,input:focus-visible{outline:3px solid #b46d3a;outline-offset:2px}";
type SavedFiles = { format: "larp-files-v1"; files: Record<string, string> };
export function initialFiles(lesson: Lesson): Record<string, string> {
  const files: Record<string, string> = {
    ...lesson.files,
    [lesson.filename]: lesson.starter,
  };
  if (lesson.track === "css")
    files["index.html"] = lesson.fixture ?? (lesson.number >= 3 && lesson.number <= 10 ? portfolioFixture : defaultFixture);
  if (lesson.track === "html")
    files["styles.css"] = "/* Add optional styles for your page. */";
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
  try {
    const parsed = JSON.parse(saved) as Partial<SavedFiles> | null;
    if (
      parsed?.format === "larp-files-v1" &&
      parsed.files &&
      typeof parsed.files === "object" &&
      !Array.isArray(parsed.files)
    ) {
      for (const name of Object.keys(defaults)) {
        const value = parsed.files[name];
        if (typeof value === "string") defaults[name] = value;
      }
      return defaults;
    }
  } catch {
    /* Older drafts store only the entry file. */
  }
  return { ...defaults, [lesson.filename]: saved };
}
export function saveFiles(files: Record<string, string>): string {
  return JSON.stringify({
    format: "larp-files-v1",
    files,
  } satisfies SavedFiles);
}
