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
  // Bundle DOM/CSS dependencies so the standalone worker does not depend on
  // Next.js tracing imports that are only present inside this generated file.
  // Keep TypeScript external for its standard-library files, and QuickJS for WASM.
  external: ["typescript", "quickjs-emscripten"],
  alias: { "~": resolve("src") },
  sourcemap: false,
  logLevel: "warning",
});
