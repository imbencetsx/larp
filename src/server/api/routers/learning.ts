import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  learnerProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { users, progress } from "~/server/db/schema";
import { ensureLearner, recordAttempt } from "~/server/services/progress";
import {
  validateExercise,
  runPlayground,
  simulateComponent,
  runLesson,
  exportProject,
  simulateBrowser,
} from "~/server/services/validate";
import { getLesson } from "~/content/curriculum";
import { MAX_PREVIEW_EVENTS } from "~/lib/simulation";
const lessonInput = z.object({
  lessonId: z.string().refine((id) => Boolean(getLesson(id)), "Unknown lesson"),
  code: z.string().max(60000),
});
const previewEvents = z
  .array(
    z.object({
      id: z.number().int().min(0).max(100000),
      type: z.enum(["click", "submit", "input", "change"]),
      fields: z
        .array(
          z.object({
            id: z.number().int().min(0).max(100000),
            value: z.string().max(2000),
            checked: z.boolean(),
          }),
        )
        .max(100),
    }),
  )
  .max(MAX_PREVIEW_EVENTS);
const initialized = learnerProcedure.use(async ({ ctx, next }) => {
  await ensureLearner(ctx.learnerId, ctx.userId ? ctx.guestId : null);
  return next({ ctx });
});
export const learningRouter = createTRPCRouter({
  overview: initialized.query(async ({ ctx }) => {
    const [profile, rows] = await Promise.all([
      ctx.db.select().from(users).where(eq(users.id, ctx.learnerId)).get(),
      ctx.db.select().from(progress).where(eq(progress.userId, ctx.learnerId)),
    ]);
    return {
      profile: profile!,
      progress: rows,
      guest: !ctx.userId,
    };
  }),
  save: initialized.input(lessonInput).mutation(async ({ ctx, input }) => {
    await ctx.db
      .insert(progress)
      .values({ userId: ctx.learnerId, ...input, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: [progress.userId, progress.lessonId],
        set: { code: input.code, updatedAt: new Date() },
      });
    return { saved: true };
  }),
  submit: initialized.input(lessonInput).mutation(async ({ ctx, input }) => {
    const evaluation = await validateExercise(input.lessonId, input.code);
    const newlyCompleted = await recordAttempt(
      ctx.learnerId,
      input.lessonId,
      input.code,
      evaluation.passed,
      evaluation.checks.length
        ? (evaluation.checks.filter((check) => check.passed).length /
            evaluation.checks.length) *
            100
        : 0,
    );
    return {
      ...evaluation,
      newlyCompleted,
    };
  }),
  run: initialized.input(lessonInput).mutation(async ({ input }) => {
    const evaluation = await runLesson(input.lessonId, input.code);
    // Preview runs never write attempts, scores, or completion.
    return { ...evaluation, passed: false, checks: [] };
  }),
  exportProject: initialized
    .input(lessonInput)
    .mutation(({ input }) => exportProject(input.lessonId, input.code)),
  playground: initialized
    .input(
      z.object({
        track: z.enum(["html", "css", "javascript", "typescript", "nextjs"]),
        code: z.string().max(60000),
        events: previewEvents.default([]),
      }),
    )
    .mutation(({ input }) =>
      runPlayground(input.track, input.code, input.events),
    ),
  settings: initialized
    .input(
      z.object({
        name: z.string().trim().min(1).max(40),
        plantName: z.string().trim().min(1).max(30),
        dailyGoal: z.number().int().min(1).max(5),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(users).set(input).where(eq(users.id, ctx.learnerId));
      return { saved: true };
    }),
  resetDraft: initialized
    .input(z.object({ lessonId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const lesson = getLesson(input.lessonId);
      if (!lesson) throw new TRPCError({ code: "NOT_FOUND" });
      await ctx.db
        .update(progress)
        .set({ code: lesson.starter, updatedAt: new Date() })
        .where(
          and(
            eq(progress.userId, ctx.learnerId),
            eq(progress.lessonId, input.lessonId),
          ),
        );
      return { code: lesson.starter };
    }),
  simulate: initialized
    .input(
      z.object({
        code: z.string().max(60000),
        clicks: z.number().int().min(0).max(20),
        lessonId: z.string().optional(),
      }),
    )
    .mutation(({ input }) =>
      simulateComponent(input.code, input.clicks, input.lessonId),
    ),
  browserSimulate: initialized
    .input(
      lessonInput.extend({
        events: previewEvents,
      }),
    )
    .mutation(({ input }) =>
      simulateBrowser(input.lessonId, input.code, input.events),
    ),
  account: protectedProcedure.query(({ ctx }) => ({ userId: ctx.userId })),
});
