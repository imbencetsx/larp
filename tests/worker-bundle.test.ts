import { expect, it } from "vitest";
import { cpSync, mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Worker } from "node:worker_threads";

it("runs the deployed worker with only its explicitly shipped runtime packages", async () => {
  const directory = mkdtempSync(join(tmpdir(), "larp-worker-"));
  mkdirSync(join(directory, "node_modules"));
  cpSync("generated/simulator-worker.cjs", join(directory, "worker.cjs"));
  // No DOM/CSS packages: those and their dependencies must be in the bundle.
  for (const name of [
    "typescript",
    "quickjs-emscripten",
    "quickjs-emscripten-core",
    "@jitl",
  ]) {
    cpSync(join("node_modules", name), join(directory, "node_modules", name), {
      recursive: true,
    });
  }
  const worker = new Worker(join(directory, "worker.cjs"));
  const run = (track: string, code: string) =>
    new Promise<{
      ok: boolean;
      value: { error: string | null; output: string[] };
    }>((resolve, reject) => {
      worker.once("message", resolve);
      worker.once("error", reject);
      worker.postMessage({
        operation: "runPlayground",
        args: [track, code, []],
      });
    });
  try {
    const javascript = await run("javascript", 'console.log("worker ready");');
    expect(javascript.ok).toBe(true);
    expect(javascript.value.error).toBeNull();
    expect(javascript.value.output).toEqual(["worker ready"]);
    const typescript = await run(
      "typescript",
      "const count: number = 3; console.log(count);",
    );
    expect(typescript.ok).toBe(true);
    expect(typescript.value.error).toBeNull();
    expect(typescript.value.output).toEqual(["3"]);
  } finally {
    await worker.terminate();
    rmSync(directory, { recursive: true, force: true });
  }
});
