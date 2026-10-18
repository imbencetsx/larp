import { z } from "zod";

export const learningChoices = [
  {
    id: "html",
    name: "HTML",
    description: "Start from scratch. Build your first web page.",
  },
  {
    id: "css",
    name: "CSS",
    description: "Bring pages to life with layouts and styles.",
  },
  {
    id: "javascript",
    name: "JavaScript",
    description: "Make things happen with interactive code.",
  },
  {
    id: "typescript",
    name: "TypeScript",
    description: "Write more confident JavaScript with types.",
  },
  {
    id: "nextjs",
    name: "Next.js",
    description: "Build apps with React components and routes.",
  },
] as const;
export const referralChoices = [
  { id: "friend", name: "A friend or classmate" },
  { id: "search", name: "Search engine" },
  { id: "tiktok", name: "TikTok" },
  { id: "instagram", name: "Instagram" },
  { id: "youtube", name: "YouTube" },
  { id: "reddit", name: "Reddit" },
  { id: "other", name: "Somewhere else" },
  { id: "prefer_not_to_say", name: "Prefer not to say" },
] as const;
export const gardenNameInput = z
  .string()
  .trim()
  .min(1, "Give your garden a name.")
  .max(30);

export const onboardingInput = z.object({
  gardenName: gardenNameInput,
  learningTrack: z.enum(["html", "css", "javascript", "typescript", "nextjs"]),
  referralSource: z.enum([
    "friend",
    "search",
    "tiktok",
    "instagram",
    "youtube",
    "reddit",
    "other",
    "prefer_not_to_say",
  ]),
});
export type OnboardingAnswers = z.infer<typeof onboardingInput>;

// Only learning destinations can be resumed; auth/onboarding URLs would loop.
export function learningDestination(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u001f]/.test(value)
  )
    return "/";
  const url = new URL(value, "https://larp.invalid");
  if (
    !/^\/(?:learn\/(?:html|css|javascript|typescript|nextjs)\/\d+|courses(?:\/(?:new|html|css|javascript|typescript|nextjs))?|progress|garden|settings|playground)?$/.test(
      url.pathname,
    )
  )
    return "/";
  return url.pathname + url.search + url.hash;
}
export function authContinuation(destination: unknown): string {
  return `/auth/continue?next=${encodeURIComponent(learningDestination(destination))}`;
}
