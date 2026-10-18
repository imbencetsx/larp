// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  act,
  fireEvent,
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { trackLessons } from "~/content/curriculum";
import { Dashboard } from "~/components/larp/dashboard";
import { NewCourse } from "~/components/larp/new-course";
import type { CourseEnrollmentInput } from "~/lib/course-enrollment";

const mocks = vi.hoisted(() => ({
  reducedMotion: false,
  progress: [] as { lessonId: string; completedAt: Date | null }[],
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
vi.mock("~/components/larp/animated-biome", () => ({
  AnimatedBiome: () => null,
}));
vi.mock("~/hooks/use-media-query", () => ({
  useMediaQuery: () => mocks.reducedMotion,
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("~/components/larp/learning-provider", () => ({
  useLearning: () => ({
    data: {
      enrollments: mocks.courses,
      progress: mocks.progress,
      profile: { gardenName: "The green patch" },
    },
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
  mocks.reducedMotion = false;
  mocks.courses = [];
  mocks.progress = [];
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});
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
  expect(
    within(screen.getByRole("navigation", { name: "Your courses" })).getByRole(
      "heading",
      { name: "CSS" },
    ),
  ).toBeTruthy();
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

it("continues an enrolled course and shows the named garden below the courses", () => {
  mocks.courses = [{ trackId: "css" }];
  mocks.progress = [{ lessonId: "css-1", completedAt: new Date() }];
  render(createElement(Dashboard));
  expect(
    screen
      .getByRole("link", { name: "Continue learning" })
      .getAttribute("href"),
  ).toBe("/learn/css/2");
  expect(
    screen.getByRole("link", { name: "View course" }).getAttribute("href"),
  ).toBe("/courses/css");
  expect(
    screen
      .getByRole("progressbar", { name: "CSS course progress" })
      .getAttribute("aria-valuenow"),
  ).toBe("3.125");
  expect(screen.getByRole("heading", { name: "The green patch" })).toBeTruthy();
  expect(
    screen.getByRole("link", { name: "Visit garden" }).getAttribute("href"),
  ).toBe("/garden");
  const courses = screen.getByRole("navigation", { name: "Your courses" });
  const summary = screen.getByRole("region", {
    name: "Your learning progress",
  });
  expect(
    courses.compareDocumentPosition(summary) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
});

it("places the carousel above courses and selects each course's next exercise", () => {
  mocks.courses = [{ trackId: "html" }, { trackId: "css" }];
  mocks.progress = [{ lessonId: "html-1", completedAt: new Date() }];
  render(createElement(Dashboard));
  const carousel = screen.getByRole("region", { name: "Continue learning" });
  const courses = screen.getByRole("navigation", { name: "Your courses" });
  expect(
    carousel.compareDocumentPosition(courses) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  expect(
    within(carousel)
      .getByRole("link", { name: "Continue learning" })
      .getAttribute("href"),
  ).toBe("/learn/html/2");
  fireEvent.click(screen.getByRole("button", { name: /^Continue CSS:/ }));
  expect(
    within(carousel)
      .getByRole("link", { name: "Continue learning" })
      .getAttribute("href"),
  ).toBe("/learn/css/1");
  expect(within(carousel).getByText(/Next exercise:/).textContent).toContain(
    trackLessons("css")[0]!.title,
  );
  expect(
    screen
      .getByRole("button", { name: /^Continue CSS:/ })
      .getAttribute("aria-current"),
  ).toBe("true");
  fireEvent.click(screen.getByRole("button", { name: "Previous course" }));
  expect(
    within(carousel)
      .getByRole("link", { name: "Continue learning" })
      .getAttribute("href"),
  ).toBe("/learn/html/2");
});
it("rotates every nine seconds, pauses during interaction, and respects reduced motion", async () => {
  vi.useFakeTimers();
  vi.spyOn(document, "hidden", "get").mockReturnValue(false);
  mocks.courses = [{ trackId: "html" }, { trackId: "css" }];
  const view = render(createElement(Dashboard));
  const carousel = screen.getByRole("region", { name: "Continue learning" });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(9000);
  });
  expect(
    screen
      .getByRole("button", { name: /^Continue CSS:/ })
      .getAttribute("aria-current"),
  ).toBe("true");
  fireEvent.mouseEnter(carousel);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(18000);
  });
  expect(
    screen
      .getByRole("button", { name: /^Continue CSS:/ })
      .getAttribute("aria-current"),
  ).toBe("true");
  fireEvent.mouseLeave(carousel);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(9000);
  });
  expect(
    screen
      .getByRole("button", { name: /^Continue HTML:/ })
      .getAttribute("aria-current"),
  ).toBe("true");
  fireEvent.focus(screen.getByRole("button", { name: /^Continue HTML:/ }));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(9000);
  });
  expect(
    screen
      .getByRole("button", { name: /^Continue HTML:/ })
      .getAttribute("aria-current"),
  ).toBe("true");
  view.unmount();
  mocks.reducedMotion = true;
  render(createElement(Dashboard));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(18000);
  });
  expect(
    screen
      .getByRole("button", { name: /^Continue HTML:/ })
      .getAttribute("aria-current"),
  ).toBe("true");
});
it("omits completed courses from the carousel and hides selectors for a single remaining course", () => {
  mocks.courses = [{ trackId: "html" }, { trackId: "css" }];
  mocks.progress = trackLessons("html").map((lesson) => ({
    lessonId: lesson.id,
    completedAt: new Date(),
  }));
  render(createElement(Dashboard));
  const carousel = screen.getByRole("region", { name: "Continue learning" });
  expect(
    within(carousel)
      .getByRole("link", { name: "Continue learning" })
      .getAttribute("href"),
  ).toBe("/learn/css/1");
  expect(within(carousel).queryByRole("button")).toBeNull();
});
