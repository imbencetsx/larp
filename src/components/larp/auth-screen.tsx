import { redirect } from "next/navigation";
import { getClerkUserId } from "~/server/auth";
import { authContinuation } from "~/lib/onboarding";
import { AuthFlow } from "./auth-flow";
import { Card, CardPanel } from "~/components/ui/card";
import { authConfigured } from "~/server/auth";
import { Topbar } from "./topbar";
export async function AuthScreen({
  mode,
  destination,
}: {
  mode: "sign-in" | "sign-up";
  destination?: string;
}) {
  const continuation = authContinuation(destination);
  if (await getClerkUserId()) redirect(continuation);
  return (
    <>
      <Topbar />
      <main className="auth-page">
        {authConfigured ? (
          <AuthFlow mode={mode} continuation={continuation} />
        ) : (
          <Card className="auth-card">
            <CardPanel>
              <h1>Sign-in is unavailable.</h1>
              <p>Please try again shortly.</p>
            </CardPanel>
          </Card>
        )}
      </main>
    </>
  );
}
