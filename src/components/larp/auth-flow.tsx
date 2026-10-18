"use client";
import { useAuth, SignIn, SignUp } from "@clerk/nextjs";
import { useEffect } from "react";

export function AuthFlow({
  mode,
  continuation,
}: {
  mode: "sign-in" | "sign-up";
  continuation: string;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  useEffect(() => {
    // Use a fresh document after session activation so server layouts see the
    // new Clerk cookie, including when verification finishes on this page.
    if (isLoaded && isSignedIn) window.location.replace(continuation);
  }, [isLoaded, isSignedIn, continuation]);
  if (!isLoaded) return <p role="status">Loading sign-in…</p>;
  if (isSignedIn)
    return <p role="status">You’re signed in. Getting things ready…</p>;
  return mode === "sign-in" ? (
    <SignIn
      routing="path"
      path="/sign-in"
      signUpUrl="/sign-up"
      forceRedirectUrl={continuation}
      signUpForceRedirectUrl={continuation}
    />
  ) : (
    <SignUp
      routing="path"
      path="/sign-up"
      signInUrl="/sign-in"
      forceRedirectUrl={continuation}
      signInForceRedirectUrl={continuation}
    />
  );
}
