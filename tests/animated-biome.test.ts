// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { AnimatedBiome } from "~/components/larp/animated-biome";

const draw = vi.hoisted(() => vi.fn());
vi.mock("~/lib/biome-animation", () => ({ createBiomeAnimation: () => draw }));
let image: { onload: (() => void) | null; src: string };
let intersection: IntersectionObserverCallback;
let preferenceChange: () => void;
let reduced: boolean;

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  reduced = false;
  vi.spyOn(document, "hidden", "get").mockReturnValue(false);
  vi.stubGlobal(
    "Image",
    vi.fn(function () {
      image = { onload: null, src: "" };
      return image;
    }),
  );
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: IntersectionObserverCallback) {
        intersection = callback;
      }
      observe = vi.fn();
      disconnect = vi.fn();
    },
  );
  vi.stubGlobal("matchMedia", () => ({
    get matches() {
      return reduced;
    },
    addEventListener: (_: string, callback: () => void) => {
      preferenceChange = callback;
    },
    removeEventListener: vi.fn(),
  }));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
function enterView() {
  image.onload?.();
  intersection(
    [{ isIntersecting: true } as IntersectionObserverEntry],
    {} as IntersectionObserver,
  );
}
it("animates only while visible, has no motion controls, and releases timers on unmount", () => {
  const view = render(createElement(AnimatedBiome, { track: "html" }));
  expect(image.src).toBe("/artwork/biomes/html-v2.webp");
  image.onload?.();
  vi.advanceTimersByTime(1000);
  expect(draw).not.toHaveBeenCalled();
  enterView();
  vi.advanceTimersByTime(1000);
  expect(draw).toHaveBeenCalled();
  draw.mockClear();
  intersection(
    [{ isIntersecting: false } as IntersectionObserverEntry],
    {} as IntersectionObserver,
  );
  vi.advanceTimersByTime(1000);
  expect(draw).not.toHaveBeenCalled();
  expect(screen.queryByRole("button")).toBeNull();
  view.unmount();
  expect(vi.getTimerCount()).toBe(0);
});
it("honors reduced motion at load and when the preference changes", () => {
  reduced = true;
  render(createElement(AnimatedBiome, { track: "nextjs" }));
  enterView();
  vi.advanceTimersByTime(1000);
  expect(draw).not.toHaveBeenCalled();
  reduced = false;
  preferenceChange();
  vi.advanceTimersByTime(1000);
  expect(draw).toHaveBeenCalled();
  draw.mockClear();
  reduced = true;
  preferenceChange();
  vi.advanceTimersByTime(1000);
  expect(draw).not.toHaveBeenCalled();
});
