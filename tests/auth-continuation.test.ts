import { beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { getClerkUserId, getLearnerProfile } = vi.hoisted(() => ({
  getClerkUserId: vi.fn(),
  getLearnerProfile: vi.fn(),
}));
vi.mock("~/server/auth", () => ({ getClerkUserId }));
vi.mock("~/server/services/onboarding", () => ({ getLearnerProfile }));
import { GET } from "~/app/auth/continue/route";

beforeEach(() => {
  vi.resetAllMocks();
  getClerkUserId.mockResolvedValue("user_signed_in");
  getLearnerProfile.mockResolvedValue({ onboardingCompletedAt: null });
});

function request(next = "/") {
  return GET(
    new NextRequest(
      `http://localhost:3000/auth/continue?next=${encodeURIComponent(next)}`,
    ),
  );
}

it("sends a new learner directly to onboarding without rendering a page", async () => {
  const response = await request();
  expect(response.status).toBe(307);
  expect(response.headers.get("location")).toBe(
    "http://localhost:3000/onboarding?next=%2F",
  );
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(await response.text()).toBe("");
  expect(getLearnerProfile).toHaveBeenCalledWith("user_signed_in");
});

it("preserves the learning destination through onboarding", async () => {
  const destination = "/learn/css/3?tab=code";
  const response = await request(destination);
  const location = new URL(response.headers.get("location")!);
  expect(location.pathname).toBe("/onboarding");
  expect(location.searchParams.get("next")).toBe(destination);
});

it("sends an onboarded learner directly to their learning destination", async () => {
  getLearnerProfile.mockResolvedValue({ onboardingCompletedAt: new Date() });
  const response = await request("/learn/html/1");
  expect(response.headers.get("location")).toBe(
    "http://localhost:3000/learn/html/1",
  );
});

it("keeps an expired session's destination when returning to sign-in", async () => {
  getClerkUserId.mockResolvedValue(null);
  const response = await request("/progress");
  const location = new URL(response.headers.get("location")!);
  expect(location.pathname).toBe("/sign-in");
  expect(location.searchParams.get("redirect_url")).toBe(
    "/auth/continue?next=%2Fprogress",
  );
  expect(getLearnerProfile).not.toHaveBeenCalled();
});

it.each([
  "https://evil.example",
  "//evil.example",
  "/auth/continue",
  "/onboarding",
])("does not redirect back into auth or outside the app: %s", async (next) => {
  getLearnerProfile.mockResolvedValue({ onboardingCompletedAt: new Date() });
  const response = await request(next);
  expect(response.headers.get("location")).toBe("http://localhost:3000/");
});
