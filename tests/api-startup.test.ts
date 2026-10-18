import { afterEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

afterEach(() => {
  vi.doUnmock("~/server/api/root");
  vi.doUnmock("~/server/api/trpc");
  vi.resetModules();
  vi.restoreAllMocks();
});

async function failedStartup(error: Error) {
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.doMock("~/server/api/root", () => ({
    get appRouter() {
      throw error;
    },
  }));
  vi.doMock("~/server/api/trpc", () => ({ createTRPCContext: vi.fn() }));
  const { GET } = await import("~/app/api/trpc/[trpc]/route");
  return GET(
    new NextRequest("http://localhost:3000/api/trpc/learning.overview?batch=1"),
  );
}

it("returns a tRPC JSON error and logs API module initialization failures", async () => {
  const response = await failedStartup(
    new Error("database module failed to initialize"),
  );
  expect(response.status).toBe(500);
  expect(response.headers.get("content-type")).toContain("application/json");
  expect(response.headers.get("cache-control")).toBe("private, no-store");
  expect(await response.json()).toMatchObject([
    {
      error: {
        json: {
          message:
            "The learning service could not start. Please try again shortly.",
          data: { code: "INTERNAL_SERVER_ERROR" },
        },
      },
    },
  ]);
  expect(console.error).toHaveBeenCalled();
});

it("returns specific setup guidance for a missing production database", async () => {
  const { DatabaseConfigurationError } =
    await import("~/server/db/configuration");
  const response = await failedStartup(
    new DatabaseConfigurationError(
      "The production database is not configured. Set DATABASE_URL.",
    ),
  );
  expect(console.error).toHaveBeenCalledWith(
    "Could not initialize the learning API:",
    expect.objectContaining({ name: "DatabaseConfigurationError" }),
  );
  expect(await response.json()).toMatchObject([
    {
      error: {
        json: {
          message:
            "The production database is not configured. Set DATABASE_URL.",
        },
      },
    },
  ]);
});
