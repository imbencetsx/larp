import { tracks, lessons } from "~/content/curriculum";
import { sql } from "drizzle-orm";
import { db } from "~/server/db";
import { courses, lessonCatalog } from "~/server/db/schema";
let initialization: Promise<void> | undefined;
export function ensureCatalog() {
  initialization ??= (async () => {
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
      db
        .insert(lessonCatalog)
        .values(
          lessons.map((lesson) => ({
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
    ]);
  })().catch((error: unknown) => {
    initialization = undefined;
    throw error;
  });
  return initialization;
}
