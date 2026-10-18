import { describe, expect, it } from "vitest";
import {
  authContinuation,
  learningDestination,
  onboardingInput,
} from "~/lib/onboarding";

describe("post-authentication destinations", () => {
  it.each([
    "/",
    "/learn/html/1",
    "/learn/nextjs/12?tab=code",
    "/courses/javascript",
    "/playground",
    "/progress",
  ])("resumes learning at %s", (path) => {
    expect(learningDestination(path)).toBe(path);
    expect(
      new URL(authContinuation(path), "https://larp.invalid").searchParams.get(
        "next",
      ),
    ).toBe(path);
  });
  it.each([
    undefined,
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/sign-in",
    "/sign-up/verify-email-address",
    "/onboarding",
    "/auth/continue",
    "/api/trpc/learning.overview",
    "/learn/html/1\n",
    "/%2f%2fevil.example",
  ])("rejects unsafe or looping destination %s", (path) => {
    expect(learningDestination(path)).toBe("/");
  });
});
it("requires recognized onboarding answers, including a private referral option", () => {
  expect(
    onboardingInput.safeParse({
      learningTrack: "css",
      referralSource: "prefer_not_to_say",
    }).success,
  ).toBe(true);
  expect(
    onboardingInput.safeParse({
      learningTrack: "unknown",
      referralSource: "friend",
    }).success,
  ).toBe(false);
  expect(
    onboardingInput.safeParse({ learningTrack: "html", referralSource: "" })
      .success,
  ).toBe(false);
});
