import { redirect } from "next/navigation";
import { getClerkUserId } from "~/server/auth";
import { getLearnerProfile } from "~/server/services/onboarding";
import { learningDestination } from "~/lib/onboarding";
import { Onboarding } from "~/components/larp/onboarding";
import { Topbar } from "~/components/larp/topbar";
export const metadata = { title: "Welcome to LARP" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const userId = await getClerkUserId();
  if (!userId) redirect("/sign-in");
  const next = learningDestination((await searchParams).next);
  const profile = await getLearnerProfile(userId);
  if (profile.onboardingCompletedAt) redirect(next);
  return (
    <>
      <Topbar />
      <Onboarding next={next} />
    </>
  );
}
