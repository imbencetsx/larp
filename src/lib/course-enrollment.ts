import { z } from "zod";
import { tracks } from "~/content/curriculum";

export const experienceChoices = [
  {
    id: "new",
    name: "I’m starting fresh",
    description: "I haven’t learned this before.",
  },
  {
    id: "some_basics",
    name: "I know a few basics",
    description: "I’ve tried it and want more practice.",
  },
  {
    id: "comfortable",
    name: "I’ve used it before",
    description: "I’m here to refresh and keep building.",
  },
] as const;
export const courseEnrollmentInput = z.object({
  trackId: z.enum(["html", "css", "javascript", "typescript", "nextjs"]),
  experience: z.enum(["new", "some_basics", "comfortable"]),
});
export type CourseEnrollmentInput = z.infer<typeof courseEnrollmentInput>;
export function enrolledTracks(
  enrollments: readonly { trackId: string }[] = [],
) {
  return enrollments.flatMap(({ trackId }) => {
    const track = tracks.find((track) => track.id === trackId);
    return track ? [track] : [];
  });
}
