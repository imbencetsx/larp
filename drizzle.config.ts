import { type Config } from "drizzle-kit";

import { env } from "~/env";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: env.DATABASE_URL.startsWith("file:") ? "sqlite" : "turso",
  dbCredentials: {
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN,
  },
  tablesFilter: ["larp_*"],
} satisfies Config;
