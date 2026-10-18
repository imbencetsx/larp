import { tracks, lessons } from "~/content/curriculum";
import { sql } from "drizzle-orm";
import { db } from "~/server/db";
import { courses, lessonCatalog } from "~/server/db/schema";
let initialization: Promise<void> | undefined;
export function ensureCatalog() {
  initialization ??= synchronizeCatalog(false).catch((error: unknown) => {
    initialization = undefined;
    throw error;
  });
  return initialization;
}

// Reads need no catalog writes. Only insert missing foreign-key records during
// learning; the seed command explicitly refreshes existing lesson content.
export async function synchronizeCatalog(updateExisting = true) {
  const existing = updateExisting
    ? new Set<string>()
    : new Set(
        (await db.select({ id: lessonCatalog.id }).from(lessonCatalog)).map(
          (row) => row.id,
        ),
      );
  const missing = lessons.filter((lesson) => !existing.has(lesson.id));
  if (!missing.length) return;
  await db.batch([
    db
      .insert(courses)
      .values(
        tracks.map((track, position) => ({
          id: track.id,
          name: track.name,
          description: track.description,
          position,
        })),
      )
      .onConflictDoUpdate({
        target: courses.id,
        set: {
          name: sql`excluded.name`,
          description: sql`excluded.description`,
          position: sql`excluded.position`,
        },
      }),
    ...Array.from({ length: Math.ceil(missing.length / 20) }, (_, index) =>
      db
        .insert(lessonCatalog)
        .values(
          missing.slice(index * 20, (index + 1) * 20).map((lesson) => ({
            id: lesson.id,
            courseId: lesson.track,
            title: lesson.title,
            position: lesson.number,
            content: lesson,
          })),
        )
        .onConflictDoUpdate({
          target: lessonCatalog.id,
          set: {
            title: sql`excluded.title`,
            position: sql`excluded.position`,
            content: sql`excluded.content`,
          },
        }),
    ),
  ]);
}
