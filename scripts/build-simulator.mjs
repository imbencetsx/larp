import { build } from "esbuild";
import { resolve } from "node:path";
await import("./format-content.mjs");
await build({
  entryPoints: ["src/server/services/execution-worker.ts"],
  outfile: "generated/simulator-worker.cjs",
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node20",
  packages: "external",
  alias: { "~": resolve("src") },
  sourcemap: false,
  logLevel: "warning",
});
