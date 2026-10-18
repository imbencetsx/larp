import { expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
vi.mock("~/server/api/root", () => {
  throw new Error("database module failed to initialize");
});
vi.mock("~/server/api/trpc", () => ({ createTRPCContext: vi.fn() }));

it("returns a tRPC JSON error and logs API module initialization failures", async () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
  try {
    const { GET } = await import("~/app/api/trpc/[trpc]/route");
    const response = await GET(
      new NextRequest(
        "http://localhost:3000/api/trpc/learning.overview?batch=1",
      ),
    );
    expect(response.status).toBe(500);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.json()).toMatchObject([
      { error: { json: { data: { code: "INTERNAL_SERVER_ERROR" } } } },
    ]);
    expect(log).toHaveBeenCalled();
  } finally {
    log.mockRestore();
  }
});
