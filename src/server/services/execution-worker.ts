import { parentPort } from "node:worker_threads";
import * as engine from "./execution-core";
import { exportProject } from "./compiler";
const operations = { ...engine, exportProject };
async function handleMessage({
  operation,
  args,
}: {
  operation: keyof typeof operations;
  args: unknown[];
}) {
  try {
    const fn = operations[operation] as (...input: unknown[]) => unknown;
    if (typeof fn !== "function") throw Error("Unknown simulator operation.");
    const value = await fn(...args);
    if (JSON.stringify(value).length > 300000)
      throw Error(
        "Output is too large. Render fewer elements or print less data.",
      );
    parentPort!.postMessage({ ok: true, value });
  } catch (error) {
    parentPort!.postMessage({
      ok: false,
      error:
        error instanceof Error
          ? error.message.slice(0, 500)
          : "Execution failed.",
    });
  }
}
parentPort!.on("message", (payload: Parameters<typeof handleMessage>[0]) => {
  void handleMessage(payload);
});
