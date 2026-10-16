import { test, expect } from "@playwright/test";
import { fillCode, editorValue, expectCodeValue } from "./editor-helpers";

test("combined HTML/CSS playground starts with linked complete documents and live highlighting", async ({
  page,
}) => {
  await page.goto("/playground");
  await expect(
    page.getByRole("button", { name: "HTML & CSS", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "CSS", exact: true }),
  ).toHaveCount(0);
  const editor = page.getByRole("textbox", {
    name: "Code editor for index.html",
  });
  const document = await editorValue(editor);
  for (const part of [
    "<!DOCTYPE html>",
    "<html",
    "<head>",
    "<body>",
    "</html>",
    'href="styles.css"',
  ])
    expect(document).toContain(part);
  expect(document.split("\n").length).toBeGreaterThan(15);
  await expect(editor.locator(".code-tag").first()).toBeVisible();
  await page.getByRole("tab", { name: "styles.css", exact: true }).click();
  await expect(
    page.locator(".source-editor .code-property").first(),
  ).toBeVisible();
  await page.getByRole("link", { name: "Learn", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("HTML tags close at the cursor, void tags stay open, and Tab is escapable", async ({
  page,
}) => {
  await page.goto("/playground");
  const editor = page.getByRole("textbox", {
    name: "Code editor for index.html",
  });
  await fillCode(editor, "");
  await editor.pressSequentially("<h1>");
  await expectCodeValue(editor, "<h1></h1>");
  await editor.pressSequentially("A new idea");
  await expectCodeValue(editor, "<h1>A new idea</h1>");
  await expect(editor.locator(".code-tag")).toHaveCount(2);
  await fillCode(editor, "");
  await editor.pressSequentially('<input type="text">');
  await expectCodeValue(editor, '<input type="text">');
  await fillCode(editor, "");
  await editor.press("Tab");
  await expectCodeValue(editor, "  ");
  await expect(editor).toBeFocused();
  await editor.press("Backspace");
  await expectCodeValue(editor, "");
  await editor.press("Tab");
  await editor.press("Tab");
  await expectCodeValue(editor, "    ");
  await editor.press("Shift+Tab");
  await expectCodeValue(editor, "  ");
  await expect(editor.locator(".cm-highlightSpace")).toHaveCount(2);
  await editor.press("Escape");
  await page.keyboard.press("Tab");
  await expect(editor).not.toBeFocused();
});

test("IDE indentation, selection, backspace, undo, and run shortcuts work in exercises", async ({
  page,
}) => {
  await page.goto("/learn/javascript/1");
  const editor = page.getByRole("textbox", {
    name: "Code editor for garden.js",
  });
  await fillCode(editor, "    const leaves = 4;");
  await editor.press("End");
  await editor.press("Enter");
  await page.keyboard.insertText("console.log(leaves);");
  await expectCodeValue(
    editor,
    "    const leaves = 4;\n    console.log(leaves);",
  );
  await editor.press("ControlOrMeta+a");
  await editor.press("Tab");
  await expectCodeValue(
    editor,
    "      const leaves = 4;\n      console.log(leaves);",
  );
  await editor.press("Shift+Tab");
  await expectCodeValue(
    editor,
    "    const leaves = 4;\n    console.log(leaves);",
  );
  await editor.press("ControlOrMeta+z");
  await expectCodeValue(
    editor,
    "      const leaves = 4;\n      console.log(leaves);",
  );
  await fillCode(editor, "");
  await editor.pressSequentially("if (true) {");
  await expectCodeValue(editor, "if (true) {}");
  await editor.press("Enter");
  await page.keyboard.insertText('console.log("A working editor");');
  await expectCodeValue(
    editor,
    'if (true) {\n  console.log("A working editor");\n}',
  );
  await expect(editor.locator(".code-keyword").first()).toBeVisible();
  await editor.press("ControlOrMeta+Enter");
  await expect(page.locator(".console-output")).toContainText(
    "A working editor",
  );
  await expect(page.locator(".completion-panel")).toHaveCount(0);
  await page.reload();
  await expectCodeValue(
    editor,
    'if (true) {\n  console.log("A working editor");\n}',
  );
});
