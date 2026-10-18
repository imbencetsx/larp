import type { Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import { env } from "~/env";
import * as schema from "./schema";
import { databaseConfiguration } from "./configuration";

const configuration = databaseConfiguration({
  url: env.DATABASE_URL,
  authToken: env.DATABASE_AUTH_TOKEN,
  vercel: Boolean(process.env.VERCEL),
});

// Hosted connections must not load SQLite's native binary. Load the local
// driver only when actually opening a local file.
const { createClient } = configuration.url.startsWith("file:")
  ? await import("@libsql/client")
  : await import("@libsql/client/web");

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  client: Client | undefined;
};

export const client = globalForDb.client ?? createClient(configuration);
if (env.NODE_ENV !== "production") globalForDb.client = client;

export const db = drizzle(client, { schema });
