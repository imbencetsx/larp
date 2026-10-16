import { describe, expect, it } from "vitest";
import { lessons, rawLessons } from "~/content/curriculum";
import { initialFiles, readFiles, saveFiles } from "~/lib/workspace";
import { initialPlaygroundDrafts } from "~/lib/playground";

describe("supplied code", () => {
  it("provides complete, linked, formatted HTML files throughout the curriculum", () => {
    for (const lesson of lessons.filter((lesson) => lesson.kind !== "quiz")) {
      const files = initialFiles(lesson);
      for (const [filename, code] of Object.entries(files)) {
        if (!filename.endsWith(".html")) continue;
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
      expect(lesson.example).toBe(lesson.solution);
    }
  });
  it("upgrades unchanged supplied drafts while preserving learner edits exactly", () => {
    const lesson = lessons.find((lesson) => lesson.id === "html-13")!;
    const old = rawLessons.find((lesson) => lesson.id === "html-13")!;
    expect(readFiles(lesson, old.starter)[lesson.filename]).toBe(
      lesson.starter,
    );
    const files = initialFiles(lesson);
    files[lesson.filename] =
      "<h1>My own   indentation</h1>\n   <!-- Keep it -->";
    expect(readFiles(lesson, saveFiles(files))[lesson.filename]).toBe(
      files[lesson.filename],
    );
  });
});
