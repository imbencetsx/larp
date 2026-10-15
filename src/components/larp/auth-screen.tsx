import Link from "next/link";
import { SignIn, SignUp } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardPanel } from "~/components/ui/card";
import { authConfigured } from "~/server/auth";
export function AuthScreen({ mode }: { mode: "sign-in" | "sign-up" }) {
  return (
    <main className="auth-page">
      <Link href="/" className="brand">
        <span className="wordmark">LARP</span>
        <span className="logo-pixel" />
      </Link>
      {authConfigured ? (
        mode === "sign-in" ? (
          <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
        ) : (
          <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
        )
      ) : (
        <Card className="auth-card">
          <CardPanel>
            <h1>Connect your account.</h1>
            <p>
              Add your Clerk keys to the project’s .env file, then restart the
              dev server.
            </p>
            <pre>
              NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_…{"\n"}
              CLERK_SECRET_KEY=sk_test_…
            </pre>
            <Button render={<Link href="/" />}>
              Continue as guest <ArrowRight aria-hidden="true" />
            </Button>
            <p className="auth-note">
              Guest progress is saved in this browser’s session.
            </p>
          </CardPanel>
        </Card>
      )}
    </main>
  );
}
