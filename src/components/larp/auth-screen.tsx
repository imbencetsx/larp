import { SignIn, SignUp } from "@clerk/nextjs";
import { Card, CardPanel } from "~/components/ui/card";
import { authConfigured } from "~/server/auth";
import { Topbar } from "./topbar";
export function AuthScreen({ mode }: { mode: "sign-in" | "sign-up" }) {
  return (
    <>
      <Topbar />
      <main className="auth-page">
        {authConfigured ? (
          mode === "sign-in" ? (
            <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
          ) : (
            <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
          )
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
