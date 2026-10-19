import { lessonOutline } from "./lesson-outline.mjs";
import { build } from "esbuild";
import { format } from "prettier";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

await build({
  entryPoints: ["src/content/curriculum.ts"],
  outfile: "generated/curriculum-source.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  alias: { "~": resolve("src") },
  logLevel: "silent",
});
await build({
  entryPoints: ["src/lib/html-document.ts"],
  outfile: "generated/html-document.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  logLevel: "silent",
});
const { rawLessons } = await import(
  pathToFileURL(resolve("generated/curriculum-source.mjs")).href
);
const { htmlDocument } = await import(
  pathToFileURL(resolve("generated/html-document.mjs")).href
);
const options = {
  printWidth: 72,
  tabWidth: 2,
  useTabs: false,
  endOfLine: "lf",
};
async function code(source, filename) {
  try {
    return await format(source, { ...options, filepath: filename });
  } catch {
    // Some starters and quiz snippets intentionally contain incomplete syntax.
    return source;
  }
}
const formatted = {};
await build({
  entryPoints: ["src/lib/workspace.ts"],
  outfile: "generated/workspace-source.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  alias: { "~": resolve("src") },
  logLevel: "silent",
});
const { rawWorkspaceExamples } = await import(
  pathToFileURL(resolve("generated/workspace-source.mjs")).href
);
formatted.$workspace = {
  defaultFixture: await code(
    htmlDocument(rawWorkspaceExamples.defaultFixture, "A little fern"),
    "index.html",
  ),
  portfolioFixture: await code(
    htmlDocument(rawWorkspaceExamples.portfolioFixture, "Mira’s tiny studio"),
    "index.html",
  ),
  appStyles: await code(rawWorkspaceExamples.appStyles, "styles.css"),
};
for (const lesson of rawLessons) {
  const entry = {};
  if (lesson.kind !== "quiz") {
    entry.legacyStarter = await code(
      lesson.track === "html"
        ? htmlDocument(lesson.starter, lesson.title)
        : lesson.starter,
      lesson.filename,
    );
    entry.buildFiles = {
      [lesson.filename]: lessonOutline(lesson.starter, lesson.filename),
    };
    for (const field of ["starter", "solution", "example"]) {
      let source = lesson[field];
      if (field === "starter") source = "";
      else if (lesson.track === "html")
        source = htmlDocument(source, lesson.title);
      entry[field] = await code(source, lesson.filename);
    }
  }
  if (lesson.fixture)
    entry.fixture = await code(
      htmlDocument(
        lesson.fixture,
        lesson.title,
        lesson.track === "css" ? lesson.filename : "styles.css",
      ),
      "index.html",
    );
  if (lesson.files) {
    entry.files = {};
    entry.legacyFiles = {};
    const referenceFiles = {};
    for (const [name, source] of Object.entries(lesson.files)) {
      const formattedSource = await code(
        name.endsWith(".html") ? htmlDocument(source, lesson.title) : source,
        name,
      );
      const learnerCode = /\.(?:[cm]?[jt]sx?|css|html)$/.test(name);
      entry.files[name] = learnerCode ? "" : formattedSource;
      entry.legacyFiles[name] = formattedSource;
      referenceFiles[name] = formattedSource;
      if (learnerCode) entry.buildFiles[name] = lessonOutline(source, name);
    }
    entry.solution = JSON.stringify(
      {
        format: "larp-files-v2",
        files: { ...referenceFiles, [lesson.filename]: entry.solution },
      },
      null,
      2,
    );
  }
  if (lesson.quiz) {
    const extension = {
      html: "html",
      css: "css",
      javascript: "js",
      typescript: "ts",
      nextjs: "tsx",
    }[lesson.track];
    entry.quiz = await Promise.all(
      lesson.quiz.map(async (question) => ({
        ...question,
        ...(question.code
          ? { code: await code(question.code, `question.${extension}`) }
          : {}),
      })),
    );
    entry.example = entry.quiz.find((question) => question.code)?.code ?? "";
  }
  formatted[lesson.id] = entry;
}
const destination = "src/content/formatted-code.json";
const output = JSON.stringify(formatted, null, 2) + "\n";
if ((await readFile(destination, "utf8").catch(() => "")) !== output)
  await writeFile(destination, output);
