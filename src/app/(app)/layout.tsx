import { AppShell } from "~/components/larp/app-shell";
import { LearningProvider } from "~/components/larp/learning-provider";
import { authConfigured } from "~/server/auth";
export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LearningProvider authEnabled={authConfigured}>
      <AppShell>{children}</AppShell>
    </LearningProvider>
  );
}
