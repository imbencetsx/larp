import { afterEach, describe, expect, it, vi } from "vitest";
import { signGuest, verifyGuest } from "~/lib/guest-session";
import { contentPolicy } from "~/lib/content-policy";
import { isSameOrigin, RequestLimiter } from "~/server/security";
import { runPlayground, simulateBrowser } from "~/server/services/validate";
import { getLesson } from "~/content/curriculum";
import { isPreviewEvent } from "~/lib/preview-document";
afterEach(() => vi.unstubAllEnvs());

describe("signed guest sessions", () => {
  it("accepts only a server-signed, unexpired session", async () => {
    vi.stubEnv(
      "GUEST_SESSION_SECRET",
      "test-signing-key-with-more-than-32-characters",
    );
    const id = crypto.randomUUID();
    const issued = 1700000000;
    const token = await signGuest(id, issued);
    expect(await verifyGuest(token, issued + 30)).toBe(id);
    expect(await verifyGuest(id, issued + 30)).toBeNull();
    expect(
      await verifyGuest(token.replace(id, crypto.randomUUID()), issued + 30),
    ).toBeNull();
    expect(await verifyGuest(token, issued + 366 * 86400)).toBeNull();
    expect(
      await verifyGuest(await signGuest(id, issued + 100), issued),
    ).toBeNull();
    vi.stubEnv(
      "GUEST_SESSION_SECRET",
      "a-different-signing-key-with-more-than-32-characters",
    );
    expect(await verifyGuest(token, issued + 30)).toBeNull();
  });
});
describe("API boundaries", () => {
  it("rejects missing, malformed, cross-site, scheme-mismatched, and forwarded-host-spoofed origins", () => {
    vi.stubEnv("APP_ORIGIN", "https://learn.example.com");
    const headers = new Headers({
      host: "learn.example.com",
      origin: "https://learn.example.com",
    });
    expect(isSameOrigin(headers)).toBe(true);
    for (const value of [
      "null",
      "not a URL",
      "http://learn.example.com",
      "https://evil.example",
      "https://learn.example.com/",
    ]) {
      headers.set("origin", value);
      expect(isSameOrigin(headers)).toBe(false);
    }
    headers.delete("origin");
    expect(isSameOrigin(headers)).toBe(false);
    headers.set("origin", "https://evil.example");
    headers.set("x-forwarded-host", "evil.example");
    expect(isSameOrigin(headers)).toBe(false);
    headers.set("origin", "https://learn.example.com");
    headers.set("sec-fetch-site", "cross-site");
    expect(isSameOrigin(headers)).toBe(false);
  });
  it("bounds both request count and rate-limit key storage", () => {
    const limiter = new RequestLimiter(2);
    expect(limiter.allow("a", 2, 0)).toBe(true);
    expect(limiter.allow("a", 2, 1)).toBe(true);
    expect(limiter.allow("a", 2, 2)).toBe(false);
    expect(limiter.allow("b", 2, 3)).toBe(true);
    expect(limiter.allow("c", 2, 4)).toBe(false);
    expect(limiter.allow("c", 2, 60001)).toBe(true);
  });
  it("keeps production script policy nonce-based without eval", () => {
    vi.stubEnv("NODE_ENV", "production");
    const policy = contentPolicy("test-nonce");
    expect(policy).toContain("'nonce-test-nonce' 'strict-dynamic'");
    expect(policy).not.toContain("unsafe-eval");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("object-src 'none'");
  });
  it("checks preview message shape before accepting actions", () => {
    expect(isPreviewEvent({ id: 1, type: "click", fields: [] })).toBe(true);
    for (const invalid of [
      null,
      { id: -1, type: "click", fields: [] },
      { id: 1, type: "eval", fields: [] },
      {
        id: 1,
        type: "click",
        fields: [{ id: 2, value: "x".repeat(2001), checked: false }],
      },
    ])
      expect(isPreviewEvent(invalid)).toBe(false);
  });
});
describe("isolated execution", () => {
  it("interrupts learner work without blocking the host event loop", async () => {
    let finished = false;
    const execution = runPlayground("javascript", "while(true){}").then(
      (value) => {
        finished = true;
        return value;
      },
    );
    await new Promise((resolve) => setTimeout(resolve, 15));
    expect(finished).toBe(false);
    expect((await execution).error).toContain("stopped");
  });
  it("bounds endless asynchronous work and recovers for the next request", async () => {
    const output = await runPlayground(
      "javascript",
      "function repeat(){Promise.resolve().then(repeat)} repeat();",
    );
    expect(output.error).toContain("stopped");
    expect(
      (await runPlayground("javascript", "console.log(2+2)")).output,
    ).toEqual(["4"]);
  });
  it("bounds memory allocation and compiler filesystem access", async () => {
    expect(
      (
        await runPlayground(
          "javascript",
          "const huge = new Array(20000000).fill('large');console.log(huge.length);",
        )
      ).error,
    ).toBeTruthy();
    expect(
      (
        await runPlayground(
          "typescript",
          '/// <reference path="../../.env" />\nconsole.log("test");',
        )
      ).error,
    ).toBeTruthy();
  });
  it("models the DOM without exposing browser or host capabilities", async () => {
    const lesson = getLesson("javascript-31")!;
    const output = await simulateBrowser(
      lesson.id,
      lesson.solution +
        "\nconsole.log(typeof window,typeof location,typeof fetch,typeof process,typeof require);",
      [],
    );
    expect(output.error).toBeNull();
    expect(output.output).toContain(
      "undefined undefined undefined undefined undefined",
    );
    expect(output.preview).toContain("data-sim-id");
    expect(output.browserApp).toBe(true);
    expect(output).not.toHaveProperty("browserCode");
  });
});
