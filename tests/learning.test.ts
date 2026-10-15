import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { migrate } from "drizzle-orm/libsql/migrator";
import { eq } from "drizzle-orm";
import { rmSync } from "node:fs";
import { lessons } from "~/content/curriculum";
import {
  validateExercise,
  runPlayground,
  simulateComponent,
} from "~/server/services/validate";
import { ensureLearner, recordAttempt } from "~/server/services/progress";
import { db, client } from "~/server/db";
import { users, progress } from "~/server/db/schema";
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
describe("authored curriculum", () => {
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
      name: "Alex",
      plantName: "Fernanda",
      dailyGoal: 2,
    });
    expect(
      (await db.select().from(users).where(eq(users.id, "test-a")).get())
        ?.plantName,
    ).toBe("Fernanda");
    await expect(
      caller.learning.settings({ name: "", plantName: "", dailyGoal: 10 }),
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
    await caller.learning.submit({
      lessonId: course[1]!.id,
      code: course[1]!.solution,
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
