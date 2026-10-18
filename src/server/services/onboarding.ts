import { and, eq, isNull } from "drizzle-orm";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
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
  const saved = await db
    .update(users)
    .set({ ...input, onboardingCompletedAt: new Date() })
    .where(and(eq(users.id, userId), isNull(users.onboardingCompletedAt)))
    .returning({ learningTrack: users.learningTrack });
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
