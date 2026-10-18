import { afterEach, expect, it, vi } from "vitest";
import { fetchTRPC } from "~/lib/trpc-fetch";

afterEach(() => vi.unstubAllGlobals());

it("preserves JSON responses and request options for tRPC", async () => {
  const response = Response.json([{ result: { data: { json: true } } }]);
  const fetch = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetch);
  const options = { method: "POST", body: "{}" };
  expect(await fetchTRPC("/api/trpc/learning.save", options)).toBe(response);
  expect(fetch).toHaveBeenCalledWith("/api/trpc/learning.save", options);
});

it("reports a platform HTML 500 without exposing a JSON parsing error", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response("<!DOCTYPE html>", {
        status: 500,
        headers: { "content-type": "text/html" },
      }),
    ),
  );
  await expect(fetchTRPC("/api/trpc/learning.overview")).rejects.toThrow(
    "The learning service is unavailable (HTTP 500)",
  );
});

it("reports an authentication page as a session error", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response("Sign in", {
        status: 403,
        headers: { "content-type": "text/html" },
      }),
    ),
  );
  await expect(fetchTRPC("/api/trpc/learning.overview")).rejects.toThrow(
    "Your session could not be verified",
  );
});
