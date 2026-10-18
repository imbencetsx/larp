import { afterEach, expect, it, vi } from "vitest";
import { NextRequest, type NextFetchEvent } from "next/server";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

it("routes Clerk proxy scripts through middleware while skipping normal static assets", async () => {
  const { config } = await import("~/middleware");
  for (const path of [
    "/__clerk",
    "/__clerk/v1/environment",
    "/__clerk/npm/@clerk/clerk-js@6/dist/clerk.browser.js",
  ]) {
    expect(
      unstable_doesMiddlewareMatch({
        config,
        url: `https://larplang.vercel.app${path}`,
      }),
    ).toBe(true);
  }
  expect(
    unstable_doesMiddlewareMatch({
      config,
      url: "https://larplang.vercel.app/artwork/html-scene.svg",
    }),
  ).toBe(false);
});

it("automatically proxies a production vercel.app request before the authentication handler", async () => {
  vi.stubEnv(
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    `pk_live_${btoa("clerk.larplang.vercel.app$")}`,
  );
  vi.stubEnv("CLERK_SECRET_KEY", "sk_live_local_proxy_test");
  vi.stubEnv("NEXT_PUBLIC_CLERK_PROXY_URL", "");
  vi.stubEnv("NEXT_PUBLIC_CLERK_DOMAIN", "");
  vi.stubEnv("CLERK_DISABLE_AUTO_PROXY", "false");
  const fetch = vi.fn().mockResolvedValue(Response.json({ proxied: true }));
  vi.stubGlobal("fetch", fetch);
  const { default: middleware } = await import("~/middleware");
  const response = await middleware(
    new NextRequest("https://larplang.vercel.app/__clerk/v1/environment"),
    { waitUntil: vi.fn() } as unknown as NextFetchEvent,
  );
  expect(response).toBeInstanceOf(Response);
  expect(await (response as Response).json()).toEqual({ proxied: true });
  expect(fetch).toHaveBeenCalledOnce();
  const headers = (fetch.mock.calls[0]![1] as RequestInit).headers as Headers;
  expect(headers.get("Clerk-Proxy-Url")).toBe(
    "https://larplang.vercel.app/__clerk",
  );
  expect((response as Response).headers.has("set-cookie")).toBe(false);
});
