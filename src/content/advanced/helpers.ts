import type { Lesson, LessonCheck, QuizQuestion, TrackId } from "../curriculum";

type Goal = [label: string, check: LessonCheck];
export const html = (selector: string, text?: string): LessonCheck => ({
  kind: "html",
  selector,
  text,
});
export const css = (
  selector: string,
  property: string,
  value: string,
): LessonCheck => ({ kind: "css", selector, property, value });
export const run = (expression: string): LessonCheck => ({
  kind: "runtime",
  expression,
});
export const view = (
  tags: string[],
  text?: string,
  clicks = 0,
  button?: string,
): LessonCheck => ({ kind: "next", tags, text, clicks, button });

export function lab(
  track: TrackId,
  number: number,
  title: string,
  paragraphs: string[],
  task: string,
  starter: string,
  solution: string,
  goals: Goal[],
  options: Partial<Lesson> = {},
): Lesson {
  const extension = {
    html: "html",
    css: "css",
    javascript: "js",
    typescript: "ts",
    nextjs: "tsx",
  }[track];
  return {
    id: `${track}-${number}`,
    track,
    number,
    title,
    duration: options.kind === "project" ? 40 : 16,
    objective: task,
    paragraphs,
    example: solution,
    exampleNote:
      "Trace this worked implementation, then reset the editor and rebuild it. Try the edge cases from the task before running the checks.",
    task,
    starter,
    solution,
    requirements: goals.map(([label]) => label),
    checks: goals.map(([, check]) => check),
    hints: [goals[0]![0], paragraphs[1] ?? paragraphs[0]!],
    recap: paragraphs[0]!,
    filename: `workshop.${extension}`,
    ...options,
  };
}

export const q = (
  prompt: string,
  choices: string[],
  answer: number,
  explanation: string,
  code?: string,
): QuizQuestion => ({ prompt, choices, answer, explanation, code });
export function quiz(
  track: TrackId,
  number: number,
  title: string,
  questions: QuizQuestion[],
): Lesson {
  return {
    id: `${track}-${number}`,
    track,
    number,
    title,
    kind: "quiz",
    duration: 6,
    objective: "Reason about real code and explain the tradeoffs.",
    paragraphs: [
      "Choose one answer per question. You can move between questions before submitting. Feedback explains each decision, and retries keep your answers.",
    ],
    example: questions.find((question) => question.code)?.code ?? "",
    exampleNote: "Read the code before choosing.",
    task: "Answer every question correctly to complete this checkpoint.",
    requirements: questions.map((question) => question.prompt),
    starter: "[]",
    solution: JSON.stringify(questions.map((question) => question.answer)),
    hints: [
      "Trace the inputs and outputs instead of guessing from the syntax.",
    ],
    recap:
      "Use the explanations to revisit any concept that needs another pass.",
    filename: "checkpoint.json",
    quiz: questions,
  };
}
