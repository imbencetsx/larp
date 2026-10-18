import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "~/server/db";
import { users, progress, attempts } from "~/server/db/schema";
import { ensureCatalog } from "./catalog";
export async function ensureLearner(id: string, guestId?: string | null) {
  await db.insert(users).values({ id }).onConflictDoNothing();
  if (guestId && guestId !== id) {
    // A single batch avoids holding an interactive SQLite transaction across
    // async calls. The merge and removal are atomic, including concurrent tabs.
    await db.batch([
      db
        .insert(progress)
        .select(
          db
            .select({
              userId: sql<string>`${id}`.as("user_id"),
              lessonId: progress.lessonId,
              code: progress.code,
              growth: progress.growth,
              completedAt: progress.completedAt,
              updatedAt: progress.updatedAt,
            })
            .from(progress)
            .where(eq(progress.userId, guestId)),
        )
        .onConflictDoUpdate({
          target: [progress.userId, progress.lessonId],
          set: {
            completedAt: sql`coalesce(${progress.completedAt}, excluded.completedAt)`,
            growth: sql`max(${progress.growth}, excluded.growth)`,
          },
        }),
      db
        .update(attempts)
        .set({ userId: id })
        .where(eq(attempts.userId, guestId)),
      db.delete(progress).where(eq(progress.userId, guestId)),
    ]);
  }
}
export async function recordAttempt(
  userId: string,
  lessonId: string,
  code: string,
  passed: boolean,
  growth = 0,
) {
  await ensureCatalog();
  const now = new Date();
  const earnedGrowth = passed
    ? 100
    : Math.min(99, Math.max(0, Math.round(growth)));
  // libSQL batches execute atomically. Conditional completion is the source of
  // truth for progress, so simultaneous submissions cannot duplicate completion.
  const [, , completed] = await db.batch([
    db.insert(attempts).values({ userId, lessonId, code, passed }),
    db
      .insert(progress)
      .values({ userId, lessonId, code, growth: earnedGrowth, updatedAt: now })
      .onConflictDoUpdate({
        target: [progress.userId, progress.lessonId],
        set: {
          code,
          updatedAt: now,
          growth: sql`max(${progress.growth}, excluded.growth)`,
        },
      }),
    db
      .update(progress)
      .set({ completedAt: now })
      .where(
        and(
          eq(progress.userId, userId),
          eq(progress.lessonId, lessonId),
          passed ? isNull(progress.completedAt) : sql`0`,
        ),
      )
      .returning({ lessonId: progress.lessonId }),
  ]);
  return completed.length > 0;
}
