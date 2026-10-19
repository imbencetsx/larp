import { expect, type Locator, type Page } from "@playwright/test";
import type { Lesson } from "../../src/content/curriculum";

export async function fillCode(editor: Locator, code: string) {
  await expect(editor).toBeEditable();
  await editor.click();
  await editor.press("ControlOrMeta+a");
  await editor.press("Backspace");
  await editor.page().keyboard.insertText(code);
}

export async function editorValue(editor: Locator) {
  return editor
    .locator(".cm-line")
    .evaluateAll((lines) =>
      lines.map((line) => line.textContent ?? "").join("\n"),
    );
}

export async function expectCodeValue(editor: Locator, code: string) {
  await expect.poll(() => editorValue(editor)).toBe(code);
}

export async function fillLessonSolution(page: Page, lesson: Lesson) {
  const { readFiles } = await import("../../src/lib/workspace");
  const files = readFiles(lesson, lesson.solution);
  const names = [
    ...Object.keys(lesson.buildFiles ?? {}).filter(
      (name) => name !== lesson.filename,
    ),
    lesson.filename,
  ];
  for (const name of names) {
    await page.getByRole("tab", { name, exact: true }).click();
    await fillCode(
      page.getByRole("textbox", { name: `Code editor for ${name}` }),
      files[name]!,
    );
  }
}
