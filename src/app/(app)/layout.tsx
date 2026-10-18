import { AppShell } from "~/components/larp/app-shell";
import { LearningProvider } from "~/components/larp/learning-provider";
import { headers } from "next/headers";
import { getLearnerProfile } from "~/server/services/onboarding";
import { learningDestination } from "~/lib/onboarding";
import { redirect } from "next/navigation";
import { getClerkUserId } from "~/server/auth";
export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getClerkUserId();
  if (!userId) redirect("/sign-in");
  const profile = await getLearnerProfile(userId);
  if (!profile.onboardingCompletedAt) {
    const next = learningDestination((await headers()).get("x-larp-path"));
    redirect(`/onboarding?next=${encodeURIComponent(next)}`);
  }
  return (
    <LearningProvider authEnabled={true}>
      <AppShell>{children}</AppShell>
    </LearningProvider>
  );
}
