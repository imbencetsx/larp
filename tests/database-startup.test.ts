import { afterEach, expect, it, vi } from "vitest";
import {
  databaseConfiguration,
  DatabaseConfigurationError,
} from "~/server/db/configuration";

vi.mock("@libsql/client", () => {
  throw new Error("The hosted database must not import native SQLite");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

it("rejects the local default on Vercel with actionable configuration guidance", () => {
  expect(() => databaseConfiguration({ url: undefined, vercel: true })).toThrow(
    DatabaseConfigurationError,
  );
  expect(() =>
    databaseConfiguration({ url: "file:./db.sqlite", vercel: true }),
  ).toThrow("Set DATABASE_URL");
});

it("keeps local SQLite available outside Vercel", () => {
  expect(databaseConfiguration({ url: undefined, vercel: false })).toEqual({
    url: "file:./db.sqlite",
    authToken: undefined,
  });
});

it("rejects incompatible database URLs without disclosing their credentials", () => {
  expect(() =>
    databaseConfiguration({
      url: "postgres://private:password@host/db",
      vercel: true,
    }),
  ).toThrow("DATABASE_URL must be a libSQL/Turso URL");
});

it("initializes a hosted database when the native SQLite module is unavailable", async () => {
  vi.stubEnv("VERCEL", "1");
  vi.stubEnv("DATABASE_URL", "libsql://startup-test.turso.io");
  vi.stubEnv("DATABASE_AUTH_TOKEN", "test-only-token");
  const { client, db } = await import("~/server/db");
  expect(db).toBeDefined();
  expect(client.closed).toBe(false);
  client.close();
});

it("uses the Vercel Turso integration instead of a stale local database URL", async () => {
  vi.stubEnv("DATABASE_URL", "file:./db.sqlite");
  vi.stubEnv("DATABASE_AUTH_TOKEN", "old-token");
  vi.stubEnv("TURSO_DATABASE_URL", "libsql://connected-database.turso.io");
  vi.stubEnv("TURSO_AUTH_TOKEN", "connected-token");
  const { env } = await import("~/env");
  expect(env.DATABASE_URL).toBe("libsql://connected-database.turso.io");
  expect(env.DATABASE_AUTH_TOKEN).toBe("connected-token");
});
