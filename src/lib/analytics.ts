"use client";
import type { PostHog } from "posthog-js";
import type { OnboardingAnswers } from "./onboarding";

type Events = {
  onboarding_started: Record<string, never>;
  onboarding_step_completed: { step: "learning_track" };
  onboarding_completed: OnboardingAnswers;
  learning_page_viewed: { path: string };
};
let client: Promise<PostHog | null> | undefined;
function getClient() {
  if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_POSTHOG_KEY)
    return Promise.resolve(null);
  client ??= import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host:
          process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        disable_session_recording: true,
        person_profiles: "identified_only",
        persistence: "memory",
      });
      return posthog;
    })
    .catch(() => null);
  return client;
}
export function identifyLearner(userId: string | null) {
  void getClient()
    .then((posthog) => {
      if (userId) posthog?.identify(userId);
      else posthog?.reset();
    })
    .catch(() => undefined);
}
export function trackEvent<K extends keyof Events>(
  event: K,
  properties: Events[K],
) {
  // Analytics must never delay or break authentication, saving, or navigation.
  void getClient()
    .then((posthog) => posthog?.capture(event, properties))
    .catch(() => undefined);
}
