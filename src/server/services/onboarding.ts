import { and, eq, isNull, sql } from "drizzle-orm";
import type { TrackId } from "~/content/curriculum";
import { db } from "~/server/db";
import { users, enrollments } from "~/server/db/schema";
import { onboardingInput, type OnboardingAnswers } from "~/lib/onboarding";
import { ensureLearner } from "./progress";

export async function getLearnerProfile(userId: string) {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .get();
  if (existing) return existing;
  await ensureLearner(userId);
  return (await db.select().from(users).where(eq(users.id, userId)).get())!;
}
export async function completeOnboarding(
  userId: string,
  answers: OnboardingAnswers,
) {
  const input = onboardingInput.parse(answers);
  await ensureLearner(userId);
  const [saved] = await db.batch([
    db
      .update(users)
      .set({ ...input, onboardingCompletedAt: new Date() })
      .where(and(eq(users.id, userId), isNull(users.onboardingCompletedAt)))
      .returning({ learningTrack: users.learningTrack }),
    db
      .insert(enrollments)
      .select(
        db
          .select({
            userId: users.id,
            trackId: sql<TrackId>`${users.learningTrack}`.as("trackId"),
            experience: sql<null>`null`.as("experience"),
            source: sql<"onboarding">`'onboarding'`.as("source"),
            createdAt: sql<Date>`unixepoch()`.as("createdAt"),
          })
          .from(users)
          .where(
            and(eq(users.id, userId), sql`${users.learningTrack} is not null`),
          ),
      )
      .onConflictDoNothing(),
  ]);
  const profile =
    saved[0] ??
    (await db
      .select({ learningTrack: users.learningTrack })
      .from(users)
      .where(eq(users.id, userId))
      .get());
  return {
    firstCompletion: saved.length > 0,
    learningTrack: profile!.learningTrack!,
  };
}
