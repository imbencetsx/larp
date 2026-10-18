import { afterEach, beforeEach, expect, it, vi } from "vitest";
const sdk = vi.hoisted(() => ({
  init: vi.fn(),
  identify: vi.fn(),
  capture: vi.fn(),
  reset: vi.fn(),
}));
vi.mock("posthog-js", () => ({ default: sdk }));
beforeEach(() => {
  vi.stubGlobal("window", {});
  vi.clearAllMocks();
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});
it("does not initialize or send analytics without a project key", async () => {
  vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "");
  const analytics = await import("~/lib/analytics");
  analytics.identifyLearner("user_example");
  analytics.trackEvent("onboarding_started", {});
  await Promise.resolve();
  expect(sdk.init).not.toHaveBeenCalled();
  expect(sdk.capture).not.toHaveBeenCalled();
});
it("initializes lazily once and uses explicit events and an account ID", async () => {
  vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test_public_key");
  vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", "https://eu.i.posthog.com");
  const analytics = await import("~/lib/analytics");
  analytics.identifyLearner("user_example");
  analytics.trackEvent("onboarding_completed", {
    learningTrack: "html",
    referralSource: "friend",
  });
  await vi.waitFor(() => expect(sdk.capture).toHaveBeenCalled());
  expect(sdk.init).toHaveBeenCalledExactlyOnceWith(
    "phc_test_public_key",
    expect.objectContaining({
      api_host: "https://eu.i.posthog.com",
      autocapture: false,
      disable_session_recording: true,
      capture_pageview: false,
    }),
  );
  expect(sdk.identify).toHaveBeenCalledExactlyOnceWith("user_example");
  expect(sdk.capture).toHaveBeenCalledExactlyOnceWith("onboarding_completed", {
    learningTrack: "html",
    referralSource: "friend",
  });
  analytics.identifyLearner(null);
  await vi.waitFor(() => expect(sdk.reset).toHaveBeenCalledOnce());
});
it("does not propagate analytics startup failures into the app", async () => {
  vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test_public_key");
  sdk.init.mockImplementationOnce(() => {
    throw new Error("analytics unavailable");
  });
  const analytics = await import("~/lib/analytics");
  expect(() => analytics.trackEvent("onboarding_started", {})).not.toThrow();
  await vi.waitFor(() => expect(sdk.init).toHaveBeenCalledOnce());
  expect(sdk.capture).not.toHaveBeenCalled();
});
