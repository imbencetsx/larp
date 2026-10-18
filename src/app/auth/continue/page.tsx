import { redirect } from "next/navigation";
import { learningDestination } from "~/lib/onboarding";
import { getClerkUserId } from "~/server/auth";
import { getLearnerProfile } from "~/server/services/onboarding";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const userId = await getClerkUserId();
  if (!userId) redirect("/sign-in");
  const next = learningDestination((await searchParams).next);
  const profile = await getLearnerProfile(userId);
  redirect(
    profile.onboardingCompletedAt
      ? next
      : `/onboarding?next=${encodeURIComponent(next)}`,
  );
}
