import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
process.env.DATABASE_URL = "file:./.larp-test.sqlite";
export default defineConfig({
  oxc: { jsx: { runtime: "automatic" } },
  resolve: { alias: { "~": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    include: ["tests/**/*.test.ts"],
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});
