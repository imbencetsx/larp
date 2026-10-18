import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { NextRequest, type NextFetchEvent } from "next/server";

const session = vi.hoisted(() => ({ userId: null as string | null }));
vi.mock("@clerk/nextjs/server", () => ({
  clerkMiddleware:
    (
      handler: (
        auth: () => Promise<typeof session>,
        request: NextRequest,
      ) => unknown,
    ) =>
    (request: NextRequest) =>
      handler(async () => session, request),
}));
beforeEach(() => {
  session.userId = null;
  vi.stubEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "pk_test_configured");
  vi.stubEnv("CLERK_SECRET_KEY", "sk_test_configured");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});
async function request(path: string) {
  const { default: middleware } = await import("~/middleware");
  return (await middleware(
    new NextRequest(`https://larplang.vercel.app${path}`),
    {} as NextFetchEvent,
  )) as Response;
}
it.each(["/", "/learn/html/1", "/progress", "/playground", "/settings"])(
  "requires sign-in for %s and preserves the destination",
  async (path) => {
    const response = await request(path);
    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location")!);
    expect(location.pathname).toBe("/sign-in");
    expect(location.searchParams.get("redirect_url")).toBe(
      `https://larplang.vercel.app${path}`,
    );
  },
);
it("rejects anonymous API access as JSON instead of redirecting to HTML", async () => {
  const response = await request("/api/trpc/learning.overview");
  expect(response.status).toBe(401);
  expect(await response.json()).toEqual({
    error: "Sign in to continue learning.",
  });
  expect(response.headers.has("location")).toBe(false);
});
it.each([
  "/sign-in",
  "/sign-in/factor-one",
  "/sign-up",
  "/sign-up/verify-email-address",
  "/welcome",
])("allows public auth and welcome page %s", async (path) => {
  const response = await request(path);
  expect(response.headers.get("x-middleware-next")).toBe("1");
  expect(response.headers.has("content-security-policy")).toBe(true);
  expect(response.headers.has("set-cookie")).toBe(false);
});
it("allows authenticated learning requests with the content policy", async () => {
  session.userId = "user_signed_in";
  const response = await request("/learn/html/1");
  expect(response.headers.get("x-middleware-next")).toBe("1");
  expect(response.headers.has("content-security-policy")).toBe(true);
});
it("keeps learning closed when Clerk is not configured", async () => {
  vi.stubEnv("CLERK_SECRET_KEY", "");
  expect((await request("/")).status).toBe(307);
  expect((await request("/api/trpc/learning.overview")).status).toBe(401);
  expect((await request("/sign-in")).headers.get("x-middleware-next")).toBe(
    "1",
  );
});
