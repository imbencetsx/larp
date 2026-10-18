import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { migrate } from "drizzle-orm/libsql/migrator";
import { eq } from "drizzle-orm";
import { rmSync } from "node:fs";
import { lessons, getLesson, trackLessons, tracks } from "~/content/curriculum";
import { getCodeHelpExamples } from "~/content/code-help-examples";
import { readFiles, saveFiles } from "~/lib/workspace";
import { exportProject } from "~/server/services/compiler";
import {
  validateExercise,
  runPlayground,
  simulateComponent,
} from "~/server/services/validate";
import { ensureCatalog, synchronizeCatalog } from "~/server/services/catalog";
import { ensureLearner, recordAttempt } from "~/server/services/progress";
import { db, client } from "~/server/db";
import { users, progress, attempts } from "~/server/db/schema";
import { createCaller } from "~/server/api/root";
import { fullBloomStage, getCourseGrowth } from "~/lib/garden";
beforeAll(async () => {
  await migrate(db, { migrationsFolder: "drizzle" });
});
afterAll(() => {
  client.close();
  for (const suffix of ["", "-wal", "-shm", "-journal"])
    rmSync(`.larp-test.sqlite${suffix}`, { force: true });
});
describe("learning startup", () => {
  it("loads progress without synchronizing the lesson catalog", async () => {
    const batch = vi.spyOn(db, "batch");
    try {
      const caller = createCaller({
        db,
        headers: new Headers(),
        learnerId: "startup-learner",
        userId: null,
        guestId: "startup-learner",
      });
      expect((await caller.learning.overview()).profile.id).toBe(
        "startup-learner",
      );
      expect(batch).not.toHaveBeenCalled();
    } finally {
      batch.mockRestore();
    }
  });
  it("does not rewrite an existing catalog on a new server initialization", async () => {
    await ensureCatalog();
    const batch = vi.spyOn(db, "batch");
    try {
      await synchronizeCatalog(false);
      expect(batch).not.toHaveBeenCalled();
    } finally {
      batch.mockRestore();
    }
  });
});

describe("authored curriculum", () => {
  it("has sequential, complete paths with advanced projects and quiz checkpoints", () => {
    expect(new Set(lessons.map((lesson) => lesson.id)).size).toBe(
      lessons.length,
    );
    for (const track of tracks) {
      const course = trackLessons(track.id);
      expect(course).toHaveLength(32);
      expect(course.map((lesson) => lesson.number)).toEqual(
        Array.from({ length: 32 }, (_, i) => i + 1),
      );
      expect(course.filter((lesson) => lesson.kind === "quiz")).toHaveLength(4);
      expect(
        course.slice(-2).every((lesson) => lesson.kind === "project"),
      ).toBe(true);
    }
  });
  for (const lesson of lessons) {
    it(`${lesson.id}: accepts its complete solution`, async () => {
      const result = await validateExercise(lesson.id, lesson.solution);
      expect(result.error).toBeNull();
      expect(result.checks.filter((c) => !c.passed)).toEqual([]);
      expect(result.passed).toBe(true);
    });
    it(`${lesson.id}: does not award completion for its starter`, async () => {
      const result = await validateExercise(lesson.id, lesson.starter);
      expect(result.passed).toBe(false);
    });
    if (lesson.kind !== "quiz") {
      it(`${lesson.id}: teaching examples leave the exercise to the learner`, async () => {
        for (const [code] of getCodeHelpExamples(lesson)) {
          const result = await validateExercise(lesson.id, code);
          expect(result.passed).toBe(false);
        }
      });
    }
  }
  it("accepts an alternative function implementation", async () => {
    expect(
      (
        await validateExercise(
          "javascript-2",
          'const waterPlant = m => m < 30 ? "Water me" : "I am happy";',
        )
      ).passed,
    ).toBe(true);
  });
  it("checks the condition boundary", async () => {
    expect(
      (
        await validateExercise(
          "javascript-2",
          'function waterPlant(m) { return m <= 30 ? "Water me" : "I am happy"; }',
        )
      ).passed,
    ).toBe(false);
  });
  it("rejects invalid TypeScript with useful diagnostics", async () => {
    const r = await validateExercise(
      "typescript-1",
      "const plantName: string = 42;",
    );
    expect(r.passed).toBe(false);
    expect(r.output.join(" ")).toContain("not assignable");
  });
});

describe("quizzes and multi-file projects", () => {
  it("validates quiz answers on the server and explains failed answers", async () => {
    const lesson = getLesson("javascript-15")!;
    const wrong = lesson.quiz!.map(
      (question) => (question.answer + 1) % question.choices.length,
    );
    const failed = await validateExercise(lesson.id, JSON.stringify(wrong));
    expect(failed.passed).toBe(false);
    expect(failed.output).toHaveLength(4);
    expect((await validateExercise(lesson.id, "[0]")).error).toContain(
      "every question",
    );
    expect((await validateExercise(lesson.id, lesson.solution)).passed).toBe(
      true,
    );
  });
  it("retains companion HTML and CSS while grading the entry stylesheet", async () => {
    const lesson = getLesson("css-13")!;
    const files = readFiles(lesson, lesson.solution);
    files["index.html"] =
      '<main><div class="gallery"><article class="plant">Custom plant</article></div></main>';
    const saved = saveFiles(files);
    expect(readFiles(lesson, saved)).toEqual(files);
    expect((await validateExercise(lesson.id, saved)).passed).toBe(true);
    expect(exportProject(lesson.id, saved)["index.html"]).toContain(
      'href="workshop.css"',
    );
  });
  it("checks imported project modules instead of using fixed helper solutions", async () => {
    const lesson = getLesson("nextjs-31")!;
    const files = readFiles(lesson, lesson.solution);
    expect((await validateExercise(lesson.id, saveFiles(files))).passed).toBe(
      true,
    );
    files["lib/tasks.ts"] =
      "export type Task={id:number;title:string;done:boolean};export function toggle(tasks:Task[],id:number){return tasks;}export function remaining(tasks:Task[]){return tasks.length;}";
    expect((await validateExercise(lesson.id, saveFiles(files))).passed).toBe(
      false,
    );
  });
  it("exports runnable TypeScript browser projects with compiled JavaScript", () => {
    const lesson = getLesson("typescript-32")!;
    const files = exportProject(lesson.id, lesson.solution);
    expect(files["reservations.ts"]).toContain("type Session");
    expect(files["reservations.js"]).not.toContain("type Session");
    expect(files["index.html"]).toContain('src="reservations.js"');
  });
  it("preview runs execute without tests, attempts, or completion", async () => {
    const caller = createCaller({
      db,
      headers: new Headers({
        host: "localhost:3000",
        origin: "http://localhost:3000",
      }),
      learnerId: "preview-only",
      userId: null,
      guestId: "preview-only",
    });
    const preview = await caller.learning.run({
      lessonId: "javascript-12",
      code: 'console.log("I can experiment without solving the task");',
    });
    expect(preview.error).toBeNull();
    expect(preview.output).toContain(
      "I can experiment without solving the task",
    );
    expect(preview.checks).toEqual([]);
    await caller.learning.run({
      lessonId: "html-1",
      code: getLesson("html-1")!.solution,
    });
    expect((await caller.learning.overview()).progress).toHaveLength(0);
    expect(
      await db
        .select()
        .from(attempts)
        .where(eq(attempts.userId, "preview-only")),
    ).toHaveLength(0);
    const submitted = await caller.learning.submit({
      lessonId: "html-1",
      code: getLesson("html-1")!.solution,
    });
    expect(submitted.newlyCompleted).toBe(true);
  });
  it("keeps quiz attempts, retry scores, and completion in the normal progress model", async () => {
    const caller = createCaller({
      db,
      headers: new Headers({
        host: "localhost:3000",
        origin: "http://localhost:3000",
      }),
      learnerId: "quiz-learner",
      userId: null,
      guestId: "quiz-learner",
    });
    const lesson = getLesson("html-15")!;
    const answers = lesson.quiz!.map((question) => question.answer);
    answers[0] = (answers[0]! + 1) % 4;
    await caller.learning.submit({
      lessonId: lesson.id,
      code: JSON.stringify(answers),
    });
    let saved = (await caller.learning.overview()).progress[0]!;
    expect(saved.completedAt).toBeNull();
    expect(saved.growth).toBe(75);
    await caller.learning.submit({
      lessonId: lesson.id,
      code: lesson.solution,
    });
    saved = (await caller.learning.overview()).progress[0]!;
    expect(saved.completedAt).toBeInstanceOf(Date);
    expect(saved.growth).toBe(100);
  });
});
describe("component simulator", () => {
  it("replays interactive component state without awarding lesson progress", async () => {
    const code = lessons.find((l) => l.id === "nextjs-2")!.solution;
    const initial = await simulateComponent(code, 0);
    const clicked = await simulateComponent(code, 3);
    expect(initial.preview).toContain("0 drops");
    expect(clicked.preview).toContain("3 drops");
    expect(clicked.passed).toBe(false);
  });
  it("does not allow compiler imports to read project source", async () => {
    const value = await runPlayground(
      "typescript",
      'import { env } from "./src/env"; console.log(env);',
    );
    expect(value.error).toBeTruthy();
    expect(value.output.join(" ")).toContain("Cannot find module");
  });
});

describe("code isolation", () => {
  it("stops infinite loops", async () => {
    const r = await runPlayground("javascript", "while (true) {}");
    expect(r.error).toContain("stopped");
  });
  it("does not expose Node, network, or host filesystem APIs", async () => {
    const r = await runPlayground(
      "javascript",
      "console.log(typeof process, typeof fetch, typeof require);",
    );
    expect(r.output).toEqual(["undefined undefined undefined"]);
  });
  it("caps console output", async () => {
    const r = await runPlayground(
      "javascript",
      "for(let i=0;i<1000;i++)console.log(i);",
    );
    expect(r.output).toHaveLength(30);
  });
  it("reports syntax errors", async () => {
    expect((await runPlayground("javascript", "const =")).error).toBeTruthy();
  });
});
describe("persistent progress and authorization", () => {
  const headers = new Headers({
    host: "localhost:3000",
    origin: "http://localhost:3000",
  });
  const context = (id: string | null, userId: string | null = null) => ({
    db,
    headers,
    learnerId: id,
    userId,
    guestId: userId ? null : id,
  });
  it("awards completion once, including concurrent retries", async () => {
    await ensureLearner("test-a");
    const values = await Promise.all([
      recordAttempt("test-a", "html-1", "first", true),
      recordAttempt("test-a", "html-1", "retry", true),
    ]);
    expect(values.filter(Boolean)).toHaveLength(1);
    const saved = await db
      .select()
      .from(progress)
      .where(eq(progress.userId, "test-a"));
    expect(saved).toHaveLength(1);
    expect(saved[0]?.completedAt).toBeInstanceOf(Date);
  });
  it("does not erase completion when saving or failing later", async () => {
    await recordAttempt("test-a", "html-1", "incomplete attempt", false);
    await createCaller(context("test-a")).learning.save({
      lessonId: "html-1",
      code: "new draft",
    });
    const state = await createCaller(context("test-a")).learning.overview();
    expect(state.progress.filter((p) => p.completedAt)).toHaveLength(1);
    expect(state.progress[0]?.code).toBe("new draft");
  });
  it("isolates drafts and progress between learners", async () => {
    const b = createCaller(context("test-b"));
    await b.learning.save({ lessonId: "css-1", code: "my private draft" });
    const state = await b.learning.overview();
    expect(state.progress.filter((p) => p.completedAt)).toHaveLength(0);
    expect(state.progress.map((p) => p.lessonId)).toEqual(["css-1"]);
    const a = await createCaller(context("test-a")).learning.overview();
    expect(a.progress.some((p) => p.lessonId === "css-1")).toBe(false);
  });
  it("validates on the server before marking completion", async () => {
    const caller = createCaller(context("test-c"));
    const bad = await caller.learning.submit({
      lessonId: "javascript-2",
      code: "function waterPlant() {return 'Water me'}",
    });
    expect(bad.newlyCompleted).toBe(false);
    const good = await caller.learning.submit({
      lessonId: "javascript-2",
      code: lessons.find((l) => l.id === "javascript-2")!.solution,
    });
    expect(good.newlyCompleted).toBe(true);
    const again = await caller.learning.submit({
      lessonId: "javascript-2",
      code: lessons.find((l) => l.id === "javascript-2")!.solution,
    });
    expect(again.newlyCompleted).toBe(false);
  });
  it("requires a session and protects account data from guests", async () => {
    await expect(
      createCaller(context(null)).learning.overview(),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(
      createCaller(context("guest_abc")).learning.account(),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
  it("rejects cross-origin changes and unknown lessons", async () => {
    const ctx = {
      ...context("test-a"),
      headers: new Headers({
        host: "localhost:3000",
        origin: "https://other.example",
      }),
    };
    await expect(
      createCaller(ctx).learning.save({ lessonId: "html-1", code: "changed" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      createCaller(context("test-a")).learning.submit({
        lessonId: "missing",
        code: "",
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
  it("merges guest completion into an account without double-counting", async () => {
    await ensureLearner("guest_merge");
    await recordAttempt("guest_merge", "html-1", "guest code", true);
    await recordAttempt("guest_merge", "html-2", "guest code 2", true);
    await ensureLearner("account_merge");
    await recordAttempt("account_merge", "html-1", "account code", true);
    await ensureLearner("account_merge", "guest_merge");
    await ensureLearner("account_merge", "guest_merge");
    const state = await createCaller(
      context("account_merge", "account_merge"),
    ).learning.overview();
    expect(state.progress.filter((p) => p.completedAt)).toHaveLength(2);
    expect(state.progress.find((p) => p.lessonId === "html-1")?.code).toBe(
      "account code",
    );
  });
  it("persists settings and validates their bounds", async () => {
    const caller = createCaller(context("test-a"));
    await caller.learning.settings({
      plantName: "Fernanda",
      dailyGoal: 2,
    });
    expect(
      (await db.select().from(users).where(eq(users.id, "test-a")).get())
        ?.plantName,
    ).toBe("Fernanda");
    await expect(
      caller.learning.settings({ plantName: "", dailyGoal: 10 }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("course flower growth", () => {
  const context = (id: string) => ({
    db,
    headers: new Headers({
      host: "localhost:3000",
      origin: "http://localhost:3000",
    }),
    learnerId: id,
    userId: null,
    guestId: id,
  });
  it("saves verified partial growth without completing the lesson or another flower", async () => {
    const caller = createCaller(context("garden-partial"));
    const result = await caller.learning.submit({
      lessonId: "html-1",
      code: "<!DOCTYPE html>",
    });
    expect(result.passed).toBe(false);
    const state = await caller.learning.overview();
    expect(state.progress[0]?.growth).toBe(33);
    expect(state.progress[0]?.completedAt).toBeNull();
    expect(getCourseGrowth("html", state.progress).stage).toBeGreaterThan(0);
    expect(getCourseGrowth("html", state.progress).bloomed).toBe(false);
    expect(getCourseGrowth("css", state.progress).stage).toBe(0);
  });
  it("keeps earned growth through failed attempts, draft edits, resets, and retries", async () => {
    const caller = createCaller(context("garden-partial"));
    await caller.learning.submit({ lessonId: "html-1", code: "" });
    await caller.learning.save({
      lessonId: "html-1",
      code: "a different draft",
    });
    await caller.learning.resetDraft({ lessonId: "html-1" });
    await caller.learning.submit({
      lessonId: "html-1",
      code: "<!DOCTYPE html>",
    });
    expect((await caller.learning.overview()).progress[0]?.growth).toBe(33);
  });
  it("reserves full bloom for every lesson in the language course", async () => {
    const caller = createCaller(context("garden-bloom"));
    const course = lessons.filter((lesson) => lesson.track === "html");
    await caller.learning.submit({
      lessonId: course[0]!.id,
      code: course[0]!.solution,
    });
    let state = await caller.learning.overview();
    const halfway = getCourseGrowth("html", state.progress);
    expect(halfway.stage).toBeLessThan(fullBloomStage);
    expect(halfway.bloomed).toBe(false);
    for (const lesson of course.slice(1))
      await caller.learning.submit({
        lessonId: lesson.id,
        code: lesson.solution,
      });
    state = await caller.learning.overview();
    expect(getCourseGrowth("html", state.progress)).toMatchObject({
      stage: fullBloomStage,
      percent: 100,
      bloomed: true,
    });
    expect(getCourseGrowth("nextjs", state.progress)).toMatchObject({
      stage: 0,
      bloomed: false,
    });
    expect(
      getCourseGrowth(
        "css",
        course.map((lesson) => ({
          lessonId: lesson.id.replace("html", "css"),
          completedAt: null,
          growth: 100,
        })),
      ),
    ).toMatchObject({ stage: fullBloomStage - 1, bloomed: false });
  });
  it("merges the best guest growth into the account while preserving its draft", async () => {
    await ensureLearner("garden-guest");
    await recordAttempt("garden-guest", "css-1", "guest draft", false, 67);
    await ensureLearner("garden-account");
    await recordAttempt("garden-account", "css-1", "account draft", false, 33);
    await ensureLearner("garden-account", "garden-guest");
    const rows = await db
      .select()
      .from(progress)
      .where(eq(progress.userId, "garden-account"));
    expect(rows[0]).toMatchObject({
      code: "account draft",
      growth: 67,
      completedAt: null,
    });
  });
});
