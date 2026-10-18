// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { OnboardingAnswers } from "~/lib/onboarding";
import { Onboarding } from "~/components/larp/onboarding";
import { AuthFlow } from "~/components/larp/auth-flow";

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  reset: vi.fn(),
  track: vi.fn(),
  signedIn: false,
  pending: false,
  error: null as Error | null,
  onSuccess: undefined as
    | undefined
    | ((
        result: { firstCompletion: boolean; learningTrack: string },
        input: OnboardingAnswers,
      ) => void),
}));
vi.mock("~/lib/analytics", () => ({ trackEvent: mocks.track }));
vi.mock("~/trpc/react", () => ({
  api: {
    learning: {
      completeOnboarding: {
        useMutation: (options: { onSuccess: typeof mocks.onSuccess }) => {
          mocks.onSuccess = options.onSuccess;
          return {
            mutate: mocks.mutate,
            reset: mocks.reset,
            isPending: mocks.pending,
            error: mocks.error,
          };
        },
      },
    },
  },
}));
vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: mocks.signedIn }),
  SignIn: (props: { forceRedirectUrl: string }) =>
    createElement("div", {
      "data-testid": "sign-in",
      "data-destination": props.forceRedirectUrl,
    }),
  SignUp: (props: { forceRedirectUrl: string }) =>
    createElement("div", {
      "data-testid": "sign-up",
      "data-destination": props.forceRedirectUrl,
    }),
}));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.pending = false;
  mocks.error = null;
  mocks.signedIn = false;
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("keeps both answers when going back and submits only after both questions", async () => {
  const user = userEvent.setup();
  render(createElement(Onboarding));
  const continueButton = screen.getByRole("button", { name: "Continue" });
  expect((continueButton as HTMLButtonElement).disabled).toBe(true);
  await user.click(
    screen.getByRole("radio", { name: /JavaScript Make things/ }),
  );
  await user.click(continueButton);
  expect(document.activeElement).toBe(
    screen.getByRole("heading", { name: /How did you hear/ }),
  );
  expect(
    screen.getByRole<HTMLButtonElement>("button", {
      name: "View my course",
    }).disabled,
  ).toBe(true);
  await user.click(screen.getByRole("radio", { name: "Prefer not to say" }));
  await user.click(screen.getByRole("button", { name: "Back" }));
  expect(
    screen
      .getByRole("radio", { name: /JavaScript Make things/ })
      .getAttribute("aria-checked"),
  ).toBe("true");
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.click(screen.getByRole("button", { name: "View my course" }));
  expect(mocks.mutate).toHaveBeenCalledExactlyOnceWith({
    learningTrack: "javascript",
    referralSource: "prefer_not_to_say",
  });
});
it("shows a recoverable save error", async () => {
  const user = userEvent.setup();
  mocks.error = new Error("network");
  render(createElement(Onboarding));
  expect(screen.getByRole("alert").textContent).toContain("Please try again");
  await user.click(screen.getByRole("radio", { name: /HTML Start/ }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.click(screen.getByRole("radio", { name: "YouTube" }));
  await user.click(screen.getByRole("button", { name: "View my course" }));
  expect(mocks.mutate).toHaveBeenCalledWith({
    learningTrack: "html",
    referralSource: "youtube",
  });
});
it("sets an explicit authentication handoff for sign-in and sign-up", async () => {
  const view = render(
    createElement(AuthFlow, {
      mode: "sign-in",
      continuation: "/auth/continue?next=%2Fprogress",
    }),
  );
  expect(screen.getByTestId("sign-in").getAttribute("data-destination")).toBe(
    "/auth/continue?next=%2Fprogress",
  );
  view.rerender(
    createElement(AuthFlow, {
      mode: "sign-up",
      continuation: "/auth/continue?next=%2F",
    }),
  );
  await waitFor(() =>
    expect(screen.getByTestId("sign-up").getAttribute("data-destination")).toBe(
      "/auth/continue?next=%2F",
    ),
  );
});

it("leaves the verification screen as soon as the session becomes active", async () => {
  const replace = vi.fn();
  const browserWindow = Object.create(window) as Window;
  Object.defineProperty(browserWindow, "location", { value: { replace } });
  vi.stubGlobal("window", browserWindow);
  const view = render(
    createElement(AuthFlow, {
      mode: "sign-in",
      continuation: "/auth/continue?next=%2Fprogress",
    }),
  );
  expect(replace).not.toHaveBeenCalled();
  mocks.signedIn = true;
  view.rerender(
    createElement(AuthFlow, {
      mode: "sign-in",
      continuation: "/auth/continue?next=%2Fprogress",
    }),
  );
  await waitFor(() =>
    expect(replace).toHaveBeenCalledExactlyOnceWith(
      "/auth/continue?next=%2Fprogress",
    ),
  );
  expect(screen.getByRole("status").textContent).toContain("You’re signed in");
  expect(screen.queryByTestId("sign-in")).toBeNull();
});

it("opens the selected course overview after onboarding", () => {
  const replace = vi.fn();
  const browserWindow = Object.create(window) as Window;
  Object.defineProperty(browserWindow, "location", { value: { replace } });
  vi.stubGlobal("window", browserWindow);
  render(createElement(Onboarding));
  mocks.onSuccess!(
    { firstCompletion: true, learningTrack: "css" },
    { learningTrack: "css", referralSource: "friend" },
  );
  expect(replace).toHaveBeenCalledExactlyOnceWith("/courses/css");
});
