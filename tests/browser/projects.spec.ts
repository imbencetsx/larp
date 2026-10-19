import {
  fillCode,
  expectCodeValue,
  fillLessonSolution,
} from "./editor-helpers";
import { test, expect } from "@playwright/test";
import { getLesson } from "../../src/content/curriculum";

test("companion files persist and Run does not complete a CSS lesson", async ({
  page,
}) => {
  const lesson = getLesson("css-13")!;
  await page.goto("/learn/css/13");
  await fillCode(
    page.getByRole("textbox", { name: "Code editor for workshop.css" }),
    lesson.solution,
  );
  await page.getByRole("tab", { name: "index.html", exact: true }).click();
  const html =
    '<main><h1>My custom gallery</h1><div class="gallery"><article class="plant">A custom card</article></div></main>';
  await fillCode(
    page.getByRole("textbox", { name: "Code editor for index.html" }),
    html,
  );
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(
    page.getByText("Preview ready. Submit to check your work."),
  ).toBeVisible();
  await expect(page.locator(".completion-panel")).toHaveCount(0);
  await expect(
    page
      .frameLocator("iframe")
      .getByRole("heading", { name: "My custom gallery" }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("tab", { name: "index.html", exact: true }).click();
  await expectCodeValue(
    page.getByRole("textbox", { name: "Code editor for index.html" }),
    html,
  );
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(page.getByText("All checks passed.")).toBeVisible();
});

test("quiz answers survive reload and explain an incorrect attempt before retry", async ({
  page,
}) => {
  const lesson = getLesson("html-15")!;
  await page.goto("/learn/html/15");
  const first = lesson.quiz![0]!;
  await page
    .getByRole("radio")
    .nth((first.answer + 1) % first.choices.length)
    .check();
  await expect(page.getByText("1/4 answered", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Submit answers" }),
  ).toBeDisabled();
  // Navigate after the saved draft request finishes rather than relying on time.
  await expect
    .poll(async () => {
      const response = await page.request.get(
        "/api/trpc/learning.overview?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%2C%22meta%22%3A%7B%22values%22%3A%5B%22undefined%22%5D%7D%7D%7D",
      );
      return (await response.text()).includes("html-15");
    })
    .toBe(true);
  await page.reload();
  await expect(
    page.getByRole("radio").nth((first.answer + 1) % first.choices.length),
  ).toBeChecked();
  for (let i = 1; i < lesson.quiz!.length; i++) {
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await page.getByRole("radio").nth(lesson.quiz![i]!.answer).check();
  }
  await page.getByRole("button", { name: "Submit answers" }).click();
  await expect(
    page.getByText("3/4 correct. Review the explanations and try again."),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Question 1, answered", exact: true })
    .click();
  await expect(page.getByText("Review this one.")).toBeVisible();
  await page.getByRole("radio").nth(first.answer).check();
  await page.getByRole("button", { name: "Submit answers" }).click();
  await expect(page.getByText("Quiz complete.", { exact: true })).toBeVisible();
});

test("the JavaScript capstone is a working application in the isolated preview", async ({
  page,
}) => {
  const lesson = getLesson("javascript-31")!;
  await page.goto("/learn/javascript/31");
  await fillCode(
    page.getByRole("textbox", { name: "Code editor for tasks.js" }),
    lesson.solution,
  );
  await page.getByRole("button", { name: "Run", exact: true }).click();
  const app = page.frameLocator('iframe[title="Sandboxed code preview"]');
  await app.getByLabel("New task").fill("Build a real app");
  await app.getByRole("button", { name: "Add task", exact: true }).click();
  await expect(app.getByRole("status")).toHaveText("0 / 1 complete");
  await app
    .getByRole("button", { name: "○ Build a real app", exact: true })
    .click();
  await expect(app.getByRole("status")).toHaveText("1 / 1 complete");
  await app.getByLabel("Show tasks").selectOption("active");
  await expect(app.getByRole("listitem")).toHaveCount(0);
  await app.getByLabel("Show tasks").selectOption("all");
  await app
    .getByRole("button", { name: "Remove Build a real app", exact: true })
    .click();
  await expect(app.getByRole("status")).toHaveText("0 / 0 complete");
  await expect(page.locator(".completion-panel")).toHaveCount(0);
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(page.getByText("All checks passed.")).toBeVisible();
});

test("a multi-file Next.js app simulates imports and exports a complete ZIP", async ({
  page,
}) => {
  const lesson = getLesson("nextjs-31")!;
  await page.goto("/learn/nextjs/31");
  await fillLessonSolution(page, lesson);
  await page.getByRole("tab", { name: "lib/tasks.ts", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Code editor for lib/tasks.ts" }),
  ).toContainText("function toggle");
  await page.getByRole("button", { name: "Run", exact: true }).click();
  const app = page.frameLocator('iframe[title="Sandboxed code preview"]');
  await expect(app.getByRole("status")).toHaveText("3 tasks left");
  await page
    .getByRole("button", { name: "Simulate a click", exact: true })
    .click();
  await expect(app.getByRole("status")).toHaveText("2 tasks left");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download project ZIP" }).click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe("nextjs-31.zip");
  await download.saveAs("/tmp/larp-nextjs-capstone.zip");
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(page.getByText("All checks passed.")).toBeVisible();
});

test("quiz and multi-file workspace remain usable on a small screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/learn/css/13", "/learn/html/15", "/courses/nextjs"]) {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto("/learn/html/15");
  await expect(page.getByRole("radio").first()).toBeVisible();
  await page.getByRole("radio").first().focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("radio").first()).toBeChecked();
});
