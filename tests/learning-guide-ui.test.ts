// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { LearningGuide } from "~/components/larp/learning-guide";
import { getLesson } from "~/content/curriculum";
afterEach(cleanup);
it("puts explanations, examples, and checkpoints beside each build step", () => {
  render(createElement(LearningGuide, { lesson: getLesson("html-1")! }));
  expect(
    screen.getByRole("heading", { name: "Start with your own document" }),
  ).toBeTruthy();
  expect(
    screen.getByRole("heading", { name: "Add a non-empty title inside head" }),
  ).toBeTruthy();
  expect(screen.getAllByText("Before you move on")).toHaveLength(5);
  expect(document.querySelectorAll(".guide-step")).toHaveLength(5);
  expect(document.querySelector(".guide-step pre")?.textContent).toContain(
    "<!DOCTYPE html>",
  );
  expect(document.querySelectorAll("[data-passed]")).toHaveLength(0);
  expect(screen.queryByRole("tab")).toBeNull();
});
it("marks only the step whose submitted requirement has passed", () => {
  render(
    createElement(LearningGuide, {
      lesson: getLesson("html-1")!,
      checks: [
        { label: "doctype", passed: true },
        { label: "title", passed: false },
      ],
    }),
  );
  expect(document.querySelectorAll(".guide-step[data-passed]")).toHaveLength(1);
  expect(
    document.querySelector(".guide-step[data-passed] h3")?.textContent,
  ).toBe("Declare the HTML doctype");
});
it("keeps project review guidance in the same guide", () => {
  const lesson = getLesson("html-31")!;
  render(createElement(LearningGuide, { lesson }));
  expect(
    screen.getByRole("heading", { name: "Review your finished project" }),
  ).toBeTruthy();
  expect(document.querySelectorAll(".guide-project-review li")).toHaveLength(
    lesson.projectBrief!.length,
  );
});
