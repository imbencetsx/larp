import type { TrackId } from "~/content/curriculum";
import type { RunResult } from "./execution-core";
import { executionPool } from "./execution-pool";
import type { PreviewEvent } from "~/lib/simulation";
export type { RunResult, Check } from "./execution-core";

async function execute(operation: string, args: unknown[]): Promise<RunResult> {
  try {
    return await executionPool.run<RunResult>(operation, args);
  } catch (error) {
    return {
      passed: false,
      checks: [],
      output: [],
      preview: null,
      error: error instanceof Error ? error.message : "Execution failed.",
    };
  }
}
export const validateExercise = (lessonId: string, code: string) =>
  execute("validateExercise", [lessonId, code]);
export const runLesson = (lessonId: string, code: string) =>
  execute("runLesson", [lessonId, code]);
export const runPlayground = (
  track: TrackId,
  code: string,
  events: PreviewEvent[] = [],
) => execute("runPlayground", [track, code, events]);
export const simulateComponent = (
  code: string,
  clicks: number,
  lessonId?: string,
) => execute("simulateComponent", [code, clicks, lessonId]);
export const exportProject = (lessonId: string, code: string) =>
  executionPool.run<Record<string, string>>("exportProject", [lessonId, code]);
export const simulateBrowser = (
  lessonId: string,
  code: string,
  events: PreviewEvent[],
) => execute("simulateBrowser", [lessonId, code, events]);
