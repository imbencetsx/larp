import { describe, expect, it } from "vitest";
import { lessons, rawLessons } from "~/content/curriculum";
import { initialFiles, readFiles, saveFiles } from "~/lib/workspace";
import { initialPlaygroundDrafts } from "~/lib/playground";
import { getCodeHelp } from "~/content/code-help";
import {
  getCodeHelpExamples,
  trackIntroductions,
} from "~/content/code-help-examples";

describe("supplied code", () => {
  it("provides named building blocks and prose guidance for every coding lesson", () => {
    for (const lesson of lessons.filter((item) => item.kind !== "quiz")) {
      const blocks = getCodeHelp(lesson);
      expect(trackIntroductions[lesson.track]).not.toBe("");
      const examples = getCodeHelpExamples(lesson);
      expect(examples.length, lesson.id).toBeGreaterThan(0);
      for (const [code, explanation, tryIt] of examples) {
        expect(code.trim(), lesson.id).not.toBe("");
        expect(explanation.trim(), lesson.id).not.toBe("");
        expect(tryIt.trim(), lesson.id).not.toBe("");
      }
      expect(blocks.length, lesson.id).toBeGreaterThanOrEqual(2);
      for (const [name, purpose] of blocks) {
        expect(name.trim(), lesson.id).not.toBe("");
        expect(purpose.trim(), lesson.id).not.toBe("");
        expect(`${name} ${purpose}`, lesson.id).not.toMatch(/[{}<>`\n]/);
      }
    }
  });
  it("starts every coding entry and project implementation empty, with linked preview fixtures", () => {
    for (const lesson of lessons.filter((lesson) => lesson.kind !== "quiz")) {
      const files = initialFiles(lesson);
      expect(files[lesson.filename], lesson.id).toBe("");
      for (const name of Object.keys(lesson.buildFiles ?? {}))
        expect(files[name], `${lesson.id}: ${name}`).toBe("");
      for (const [filename, code] of Object.entries(files)) {
        if (!filename.endsWith(".html")) continue;
        if (lesson.track === "html" && filename === lesson.filename) {
          expect(code, lesson.id).toBe("");
          continue;
        }
        expect(code, `${lesson.id} ${filename}`).toMatch(/<!doctype html>/i);
        for (const tag of ["head", "body", "html"])
          expect(code).toContain(`</${tag}>`);
        expect(code).toContain('<link rel="stylesheet"');
        expect(code.split("\n").length).toBeGreaterThan(10);
      }
    }
    const web = initialPlaygroundDrafts().web["index.html"]!;
    expect(web).toContain('href="styles.css"');
    expect(web).toContain('src="experiment.js"');
  });
  it("expands compact CSS, TypeScript, JavaScript, TSX, and project companion examples", () => {
    for (const id of [
      "css-31",
      "typescript-31",
      "javascript-31",
      "nextjs-31",
    ]) {
      const lesson = lessons.find((lesson) => lesson.id === id)!;
      expect(lesson.solution.split("\n").length).toBeGreaterThan(10);
      expect(lesson.starter).toBe("");
      expect(lesson.example.trim()).not.toBe("");
    }
  });
  it("upgrades unchanged supplied drafts while preserving learner edits exactly", () => {
    const lesson = lessons.find((lesson) => lesson.id === "html-13")!;
    const old = rawLessons.find((lesson) => lesson.id === "html-13")!;
    expect(readFiles(lesson, old.starter)[lesson.filename]).toBe(
      lesson.starter,
    );
    expect(readFiles(lesson, lesson.legacyStarter!)[lesson.filename]).toBe("");
    const oldFiles = { [lesson.filename]: lesson.legacyStarter! };
    expect(
      readFiles(
        lesson,
        JSON.stringify({ format: "larp-files-v1", files: oldFiles }),
      )[lesson.filename],
    ).toBe("");
    expect(readFiles(lesson, saveFiles(oldFiles))[lesson.filename]).toBe(
      lesson.legacyStarter,
    );
    const files = initialFiles(lesson);
    files[lesson.filename] =
      "<h1>My own   indentation</h1>\n   <!-- Keep it -->";
    expect(readFiles(lesson, saveFiles(files))[lesson.filename]).toBe(
      files[lesson.filename],
    );
  });
});

it("upgrades untouched old project files but preserves code written in the new draft format", () => {
  const lesson = lessons.find((lesson) => lesson.id === "nextjs-31")!;
  const old = {
    ...lesson.legacyFiles,
    [lesson.filename]: lesson.legacyStarter!,
  };
  const upgraded = readFiles(
    lesson,
    JSON.stringify({ format: "larp-files-v1", files: old }),
  );
  for (const name of Object.keys(lesson.buildFiles!))
    expect(upgraded[name], name).toBe("");
  const written = {
    ...initialFiles(lesson),
    "lib/tasks.ts": lesson.legacyFiles!["lib/tasks.ts"]!,
  };
  expect(readFiles(lesson, saveFiles(written))["lib/tasks.ts"]).toBe(
    written["lib/tasks.ts"],
  );
});
it("restores a legacy single-file project entry as source rather than inserting its reference bundle into the editor", () => {
  const lesson = lessons.find((lesson) => lesson.id === "nextjs-31")!;
  const raw = rawLessons.find((item) => item.id === lesson.id)!;
  const files = readFiles(lesson, raw.solution);
  expect(files[lesson.filename]).toBe(
    readFiles(lesson, lesson.solution)[lesson.filename],
  );
  expect(files[lesson.filename]).toContain("export default function Board");
  expect(files["lib/tasks.ts"]).toBe("");
});
