import { Worker } from "node:worker_threads";
import { resolve } from "node:path";

type Job = {
  operation: string;
  args: unknown[];
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  queuedAt: number;
};
type Slot = {
  worker: Worker;
  job?: Job;
  timer?: ReturnType<typeof setTimeout>;
};
class ExecutionPool {
  private slots: Slot[] = [];
  private queue: Job[] = [];
  run<T>(operation: string, args: unknown[]): Promise<T> {
    if (this.queue.length >= 8)
      return Promise.reject(
        new Error("The simulator is busy. Try again in a moment."),
      );
    return new Promise<T>((resolveJob, reject) => {
      this.queue.push({
        operation,
        args,
        resolve: (value) => resolveJob(value as T),
        reject,
        queuedAt: Date.now(),
      });
      this.drain();
    });
  }
  private create() {
    const worker = new Worker(
      resolve(process.cwd(), "generated/simulator-worker.cjs"),
      {
        resourceLimits: {
          maxOldGenerationSizeMb: 192,
          maxYoungGenerationSizeMb: 32,
          stackSizeMb: 4,
        },
        env: { NODE_ENV: process.env.NODE_ENV ?? "production" },
      },
    );
    const slot: Slot = { worker };
    worker.unref();
    worker.on(
      "message",
      (message: { ok: boolean; value?: unknown; error?: string }) => {
        const job = slot.job;
        if (!job) return;
        clearTimeout(slot.timer);
        slot.job = undefined;
        worker.unref();
        if (message.ok) job.resolve(message.value);
        else job.reject(new Error(message.error ?? "Execution failed."));
        this.drain();
      },
    );
    worker.on("error", (error) => {
      console.error("Simulator worker failed:", error);
      this.remove(
        slot,
        "The simulator could not start. Please try again shortly.",
      );
    });
    worker.on("exit", () =>
      this.remove(slot, "The simulator restarted. Please run again."),
    );
    this.slots.push(slot);
    return slot;
  }
  private remove(slot: Slot, message: string) {
    const index = this.slots.indexOf(slot);
    if (index < 0) return;
    this.slots.splice(index, 1);
    clearTimeout(slot.timer);
    slot.job?.reject(new Error(message));
    slot.job = undefined;
    void slot.worker.terminate();
    this.drain();
  }
  private drain() {
    while (this.queue.length) {
      const slot =
        this.slots.find((candidate) => !candidate.job) ??
        (this.slots.length < 2 ? this.create() : undefined);
      if (!slot) return;
      const job = this.queue.shift()!;
      if (Date.now() - job.queuedAt > 10000) {
        job.reject(new Error("The simulator is busy. Try again."));
        continue;
      }
      slot.job = job;
      slot.worker.ref();
      // Type checking and WASM execution cannot hold the web server's event loop.
      slot.timer = setTimeout(
        () =>
          this.remove(
            slot,
            "Execution stopped after the simulator time limit. Simplify the code and try again.",
          ),
        3000,
      );
      slot.worker.postMessage({ operation: job.operation, args: job.args });
    }
  }
}
const state = globalThis as typeof globalThis & {
  larpExecutionPool?: ExecutionPool;
};
export const executionPool = (state.larpExecutionPool ??= new ExecutionPool());
