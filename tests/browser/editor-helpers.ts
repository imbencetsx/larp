import { expect, type Locator } from "@playwright/test";

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
