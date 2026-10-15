import { test, expect } from "@playwright/test";
import { lessons } from "../../src/content/curriculum";

test("complete the curriculum, preserve progress, and avoid duplicate completion", async ({
  page,
}) => {
  test.setTimeout(300_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const lesson of lessons) {
    await page.goto(`/learn/${lesson.track}/${lesson.number}`);
    const editor = page.getByRole("textbox", {
      name: `Code editor for ${lesson.filename}`,
    });
    await expect(editor).toBeVisible();
    await editor.fill(lesson.solution);
    await page.getByRole("button", { name: "Run code", exact: true }).click();
    await expect(page.getByText("All checks passed.")).toBeVisible();
    await expect(page.locator(".completion-panel")).toBeVisible();
  }
  await page.getByRole("button", { name: "Run code", exact: true }).click();
  await expect(page.getByText("Already completed")).toBeVisible();
  await page.goto("/progress");
  await expect(page.locator(".progress-stat").first()).toContainText(String(lessons.length));
  await expect(page.locator(".recent-row")).toHaveCount(lessons.length);
  await page.reload();
  await expect(page.locator(".recent-row")).toHaveCount(lessons.length);
  await page.goto("/garden");
  await expect(page.getByText("5 / 5 flowers bloomed")).toBeVisible();
  await expect(page.locator('.garden-plot[data-bloomed="true"]')).toHaveCount(
    5,
  );
  await page.goto("/learn/html/1");
  await expect(
    page.getByRole("textbox", { name: "Code editor for index.html" }),
  ).toHaveValue(lessons[0]!.solution);
  expect(errors).toEqual([]);
});

test("save drafts, use hints, copy snippets, and persist settings", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/learn/javascript/1");
  const editor = page.getByRole("textbox", {
    name: "Code editor for garden.js",
  });
  await expect(editor).toBeVisible();
  await editor.fill('const myDraft = "a little progress";');
  await expect(page.locator(".save-status")).toHaveText("All changes saved");
  await page.reload();
  await expect(editor).toHaveValue('const myDraft = "a little progress";');
  await page.getByRole("button", { name: "Show hint" }).click();
  await expect(page.locator(".hint-text")).toHaveCount(1);
  await page.getByRole("tab", { name: "Example", exact: true }).click();
  await page
    .locator(".snippet")
    .getByRole("button", { name: "Copy code" })
    .click();
  await expect(page.locator(".snippet")).toContainText("Copied!");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    lessons.find((l) => l.id === "javascript-1")!.example,
  );
  await page.goto("/settings");
  await page.getByLabel("Your name", { exact: true }).fill("Alex");
  await page.getByLabel("Your plant’s name").fill("Fernanda");
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "2 lessons a day" }).click();
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(page.getByText("Preferences saved.")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Your plant’s name")).toHaveValue("Fernanda");
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Alex");
  await expect(page.locator(".plant-name")).toContainText("Fernanda");
});

test("playground reports errors and interrupts loops", async ({ page }) => {
  await page.goto("/playground");
  await page.getByRole("button", { name: "JavaScript", exact: true }).click();
  const editor = page.getByRole("textbox", {
    name: "Code editor for experiment.js",
  });
  await editor.fill('console.log("Hello from the sandbox");');
  await page.getByRole("button", { name: "Run code", exact: true }).click();
  await expect(page.locator(".console-output")).toContainText(
    "Hello from the sandbox",
  );
  await editor.fill("while (true) {}");
  await page.getByRole("button", { name: "Run code", exact: true }).click();
  await expect(page.locator(".run-error")).toContainText("stopped");
});

test("mobile navigation, search, and layouts stay usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of [
    "/",
    "/courses",
    "/courses/html",
    "/garden",
    "/progress",
    "/settings",
    "/learn/html/1",
    "/playground",
    "/welcome",
    "/sign-in",
  ]) {
    await page.goto(path);
    await expect(page.locator("h1"), `Heading on ${path}`).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true);
  }
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("menuitem", { name: "Learning paths", exact: true })
    .click();
  await expect(page).toHaveURL(/\/courses$/);
  await page.getByRole("button", { name: "Find a lesson" }).click();
  await page.getByRole("textbox", { name: "Search lessons" }).fill("variables");
  await page.getByRole("link", { name: /Meet your variables/ }).click();
  await expect(page).toHaveURL(/\/learn\/javascript\/1$/);
});

test("Next.js simulator responds to explicit click controls", async ({
  page,
}) => {
  await page.goto("/learn/nextjs/2");
  const lesson = lessons.find((l) => l.id === "nextjs-2")!;
  await page
    .getByRole("textbox", { name: `Code editor for ${lesson.filename}` })
    .fill(lesson.solution);
  await page.getByRole("button", { name: "Run code", exact: true }).click();
  await expect(page.getByText("All checks passed.")).toBeVisible();
  await expect(
    page
      .frameLocator('iframe[title="Sandboxed code preview"]')
      .getByRole("button"),
  ).toContainText("0 drops");
  await page.getByRole("button", { name: "Simulate a click" }).click();
  await expect(
    page
      .frameLocator('iframe[title="Sandboxed code preview"]')
      .getByRole("button"),
  ).toContainText("1 drops");
  await page.getByRole("button", { name: "Simulate a click" }).click();
  await expect(
    page
      .frameLocator('iframe[title="Sandboxed code preview"]')
      .getByRole("button"),
  ).toContainText("2 drops");
});

test("coding workspaces keep editor and preview in the viewport", async ({
  page,
}) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1280, height: 720 },
    { width: 1024, height: 768 },
    { width: 768, height: 900 },
    { width: 390, height: 844 },
    { width: 375, height: 667 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(viewport);
    for (const path of ["/learn/html/1", "/playground"]) {
      await page.goto(path);
      await expect(page.locator("textarea[data-code-editor]")).toBeVisible();
      await expect(page.locator(".preview-frame")).toBeVisible();
      const check = await page.evaluate(() => {
        const editor = document
          .querySelector("textarea[data-code-editor]")!
          .getBoundingClientRect();
        const preview = document
          .querySelector(".preview-card")!
          .getBoundingClientRect();
        return {
          documentFits:
            document.documentElement.scrollHeight <= innerHeight + 1,
          editorFits: editor.top >= 0 && editor.bottom <= innerHeight,
          previewFits: preview.top >= 0 && preview.bottom <= innerHeight,
          editorHeight: editor.height,
          previewHeight: preview.height,
        };
      });
      expect(
        check.documentFits,
        `${path} document at ${viewport.width}x${viewport.height}`,
      ).toBe(true);
      expect(check.editorFits).toBe(true);
      expect(check.previewFits).toBe(true);
      expect(check.editorHeight).toBeGreaterThan(60);
      expect(check.previewHeight).toBeGreaterThan(100);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/learn/html/1");
  await page.getByRole("button", { name: "Lesson & hints" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Show hint" }).click();
  await expect(page.locator(".hint-text")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  const editor = page.locator("textarea[data-code-editor]");
  await editor.fill(
    Array.from({ length: 150 }, (_, i) => `<!-- line ${i} -->`).join("\n"),
  );
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollHeight <= innerHeight + 1,
      ),
    )
    .toBe(true);
  await expect(page.locator(".preview-frame")).toBeVisible();
});

test("each course flower grows from checks and blooms only after course completion", async ({
  page,
}) => {
  await page.goto("/garden");
  await expect(page.getByText("0 / 5 flowers bloomed")).toBeVisible();
  await page.getByRole("button", { name: "Growth stages" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".growth-stage-grid li")).toHaveCount(12);
  await page.getByRole("tab", { name: "CSS", exact: true }).click();
  await expect(page.getByText("CSS · Lavender")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.goto("/learn/html/1");
  await page
    .getByRole("textbox", { name: "Code editor for index.html" })
    .fill("<!DOCTYPE html>");
  await page.getByRole("button", { name: "Run code", exact: true }).click();
  await expect(page.locator(".lesson-plant-growth")).toContainText("Seed");
  await page.goto("/garden");
  const daisy = page.locator('[data-flower-course="html"]');
  await expect(daisy).toContainText("Stage 1 / 12");
  await expect(page.locator('.garden-plot[data-bloomed="true"]')).toHaveCount(
    0,
  );
  await page.reload();
  await expect(daisy).toContainText("Stage 1 / 12");
  for (const lesson of lessons.filter((lesson) => lesson.track === "html")) {
    await page.goto(`/learn/html/${lesson.number}`);
    await page
      .getByRole("textbox", { name: `Code editor for ${lesson.filename}` })
      .fill(lesson.solution);
    await page.getByRole("button", { name: "Run code", exact: true }).click();
    await expect(page.getByText("All checks passed.")).toBeVisible();
  }
  await page.goto("/garden");
  await expect(page.getByText("1 / 5 flowers bloomed")).toBeVisible();
  await expect(daisy).toContainText("Stage 12 / 12");
  await expect(
    page.locator('.garden-plot[data-course="html"]'),
  ).toHaveAttribute("data-bloomed", "true");
  await expect(page.locator('[data-flower-course="css"]')).toContainText(
    "Stage 1 / 12",
  );
  await page.reload();
  await expect(daisy).toContainText("Stage 12 / 12");
});
