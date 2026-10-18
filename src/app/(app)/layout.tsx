import { AppShell } from "~/components/larp/app-shell";
import { LearningProvider } from "~/components/larp/learning-provider";
import { redirect } from "next/navigation";
import { getClerkUserId } from "~/server/auth";
export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await getClerkUserId())) redirect("/sign-in");
  return (
    <LearningProvider authEnabled={true}>
      <AppShell>{children}</AppShell>
    </LearningProvider>
  );
}
