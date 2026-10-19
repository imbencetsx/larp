import { expect, it } from "vitest";
import { lessons } from "~/content/curriculum";
import { getLearningGuide } from "~/content/learning-guide";
import { initialFiles } from "~/lib/workspace";

it("gives every coding lesson an ordered build guide covering every requirement", () => {
  for (const lesson of lessons.filter((lesson) => lesson.kind !== "quiz")) {
    const guide = getLearningGuide(lesson);
    expect(guide.introduction, lesson.id).toBe(lesson.task);
    expect(guide.steps[0]?.action, lesson.id).toContain(lesson.filename);
    const build = guide.steps.filter(
      (step) => step.requirementIndex !== undefined,
    );
    expect(
      build.map((step) => step.title),
      lesson.id,
    ).toEqual(lesson.requirements);
    expect(
      build.map((step) => step.requirementIndex),
      lesson.id,
    ).toEqual(lesson.requirements.map((_, index) => index));
    for (const step of guide.steps) {
      expect(step.action.length, `${lesson.id}: ${step.title}`).toBeGreaterThan(
        100,
      );
      expect(step.checkpoint.length, lesson.id).toBeGreaterThan(60);
      expect(step.explanation.length, lesson.id).toBeGreaterThan(0);
    }
    expect(
      guide.steps.some((step) => step.example),
      lesson.id,
    ).toBe(true);
    expect(guide.steps.at(-1)?.action).toContain(
      "Run previews your work; it does not complete the lesson",
    );
  }
});
it("opens every HTML build with an empty entry file and teaches the document outline", () => {
  for (const lesson of lessons.filter(
    (lesson) => lesson.track === "html" && lesson.kind !== "quiz",
  )) {
    expect(initialFiles(lesson)[lesson.filename], lesson.id).toBe("");
    const guide = getLearningGuide(lesson);
    expect(guide.steps[0]?.example?.code, lesson.id).toContain(
      "<body>\n  </body>",
    );
    expect(
      guide.steps
        .filter((step) => step.requirementIndex !== undefined)
        .every((step) => !step.action.startsWith(step.title + ".")),
      lesson.id,
    ).toBe(true);
  }
});
it("keeps checkpoints as quizzes rather than blank coding exercises", () => {
  for (const lesson of lessons.filter((lesson) => lesson.kind === "quiz")) {
    expect(lesson.starter).toBe("[]");
    expect(lesson.quiz?.length).toBeGreaterThan(0);
  }
});

it("starts every course from scratch and teaches the declarations learners must create", () => {
  for (const lesson of lessons.filter((lesson) => lesson.kind !== "quiz")) {
    expect(lesson.starter, lesson.id).toBe("");
    const files = initialFiles(lesson);
    for (const name of Object.keys(lesson.buildFiles ?? {}))
      expect(files[name], `${lesson.id}: ${name}`).toBe("");
    expect(getLearningGuide(lesson).steps[0]?.action, lesson.id).toMatch(
      /starts empty/,
    );
  }
});
it("teaches capstone helpers and layout instead of supplying implemented modules", () => {
  const lesson = lessons.find((lesson) => lesson.id === "nextjs-31")!;
  const guide = getLearningGuide(lesson);
  expect(initialFiles(lesson)["lib/tasks.ts"]).toBe("");
  expect(initialFiles(lesson)["app/layout.tsx"]).toBe("");
  expect(
    guide.steps.find((step) => step.title === "Create lib/tasks.ts")?.action,
  ).toContain("Export toggle");
  expect(
    guide.steps.find((step) => step.title === "Create app/layout.tsx")?.action,
  ).toContain("RootLayout");
});
