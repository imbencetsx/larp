// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dashboard } from "~/components/larp/dashboard";
import { NewCourse } from "~/components/larp/new-course";
import type { CourseEnrollmentInput } from "~/lib/course-enrollment";

const mocks = vi.hoisted(() => ({
  courses: [] as { trackId: string }[],
  mutate: vi.fn(),
  push: vi.fn(),
  invalidate: vi.fn().mockResolvedValue(undefined),
  track: vi.fn(),
  onSuccess: undefined as
    | undefined
    | ((
        result: { added: boolean; trackId: string },
        input: CourseEnrollmentInput,
      ) => Promise<void>),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("~/components/larp/learning-provider", () => ({
  useLearning: () => ({
    data: { enrollments: mocks.courses, progress: [] },
    loading: false,
  }),
}));
vi.mock("~/lib/analytics", () => ({ trackEvent: mocks.track }));
vi.mock("~/trpc/react", () => ({
  api: {
    useUtils: () => ({
      learning: { overview: { invalidate: mocks.invalidate } },
    }),
    learning: {
      addCourse: {
        useMutation: (options: { onSuccess: typeof mocks.onSuccess }) => {
          mocks.onSuccess = options.onSuccess;
          return {
            mutate: mocks.mutate,
            reset: vi.fn(),
            isPending: false,
            error: null,
          };
        },
      },
    },
  },
}));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.courses = [];
});
afterEach(cleanup);
it("shows an empty learning dashboard with a New course entry point", () => {
  render(createElement(Dashboard));
  expect(
    screen.getByRole("link", { name: "New course" }).getAttribute("href"),
  ).toBe("/courses/new");
  expect(
    screen.getByRole("heading", { name: "Your next project starts here." }),
  ).toBeTruthy();
  expect(document.querySelectorAll(".track-card")).toHaveLength(0);
  expect(screen.queryByText("Start lesson")).toBeNull();
});
it("shows only explicitly added courses and opens their course pages", () => {
  mocks.courses = [{ trackId: "css" }];
  render(createElement(Dashboard));
  expect(document.querySelectorAll(".track-card")).toHaveLength(1);
  expect(document.querySelector(".track-card")?.getAttribute("href")).toBe(
    "/courses/css",
  );
  expect(screen.getByRole("heading", { name: "CSS" })).toBeTruthy();
  expect(screen.queryByRole("heading", { name: "HTML" })).toBeNull();
});
it("asks for experience, adds the chosen course, and opens its overview", async () => {
  const user = userEvent.setup();
  mocks.courses = [{ trackId: "html" }];
  render(createElement(NewCourse));
  expect(
    screen
      .getByRole("radio", { name: /HTML Already/ })
      .getAttribute("aria-disabled"),
  ).toBe("true");
  await user.click(screen.getByRole("radio", { name: /JavaScript Make/ }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
  expect(mocks.mutate).not.toHaveBeenCalled();
  expect(
    screen.getByRole<HTMLButtonElement>("button", { name: "Add course" })
      .disabled,
  ).toBe(true);
  await user.click(screen.getByRole("radio", { name: /I know a few basics/ }));
  await user.click(screen.getByRole("button", { name: "Back" }));
  expect(
    screen
      .getByRole("radio", { name: /JavaScript Make/ })
      .getAttribute("aria-checked"),
  ).toBe("true");
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.click(screen.getByRole("button", { name: "Add course" }));
  const input = {
    trackId: "javascript" as const,
    experience: "some_basics" as const,
  };
  expect(mocks.mutate).toHaveBeenCalledExactlyOnceWith(input);
  await mocks.onSuccess!({ added: true, trackId: "javascript" }, input);
  await waitFor(() =>
    expect(mocks.push).toHaveBeenCalledExactlyOnceWith("/courses/javascript"),
  );
  expect(mocks.invalidate).toHaveBeenCalledOnce();
  expect(mocks.track).toHaveBeenCalledExactlyOnceWith("course_added", input);
});
