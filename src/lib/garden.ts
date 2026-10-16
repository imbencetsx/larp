import { trackLessons, type TrackId } from "~/content/curriculum";

export const growthStages = [
  "Seed",
  "Taking root",
  "First shoot",
  "Tiny sprout",
  "First leaves",
  "Seedling",
  "Growing tall",
  "New branches",
  "First bud",
  "Petals forming",
  "Opening up",
  "Full bloom",
] as const;
export const fullBloomStage = growthStages.length - 1;

export type PlantProgress = {
  lessonId: string;
  completedAt: Date | null;
  growth?: number;
};

export function getCourseGrowth(
  track: TrackId,
  progress: PlantProgress[] = [],
) {
  const course = trackLessons(track);
  const saved = new Map(progress.map((row) => [row.lessonId, row]));
  const completed = course.filter(
    (lesson) => saved.get(lesson.id)?.completedAt,
  ).length;
  const bloomed = course.length > 0 && completed === course.length;
  const score = course.reduce((sum, lesson) => {
    const row = saved.get(lesson.id);
    return (
      sum +
      (row?.completedAt ? 100 : Math.min(99, Math.max(0, row?.growth ?? 0)))
    );
  }, 0);
  const percent = course.length ? Math.round(score / course.length) : 0;
  // The last stage is reserved for verified completion of the entire course.
  const stage = bloomed
    ? fullBloomStage
    : Math.min(
        fullBloomStage - 1,
        Math.ceil(
          (score / Math.max(1, course.length * 100)) * (fullBloomStage - 1),
        ),
      );
  return {
    completed,
    total: course.length,
    bloomed,
    percent,
    stage,
    stageName: growthStages[stage]!,
  };
}
