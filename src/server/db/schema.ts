import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTableCreator,
  text,
} from "drizzle-orm/sqlite-core";
export const createTable = sqliteTableCreator((name) => `larp_${name}`);
export const posts = createTable("post", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text(),
  createdAt: integer({ mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});
export const users = createTable("user", {
  id: text().primaryKey(),
  name: text().notNull().default("Learner"),
  // Keep the existing column so saved names survive the terminology change.
  gardenName: text("plantName").notNull().default("Sprout"),
  dailyGoal: integer().notNull().default(1),
  learningTrack: text({
    enum: ["html", "css", "javascript", "typescript", "nextjs"],
  }),
  referralSource: text(),
  onboardingCompletedAt: integer({ mode: "timestamp" }),
  createdAt: integer({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});
export const courses = createTable("course", {
  id: text().primaryKey(),
  name: text().notNull(),
  description: text().notNull(),
  position: integer().notNull(),
});
export const lessonCatalog = createTable("lesson", {
  id: text().primaryKey(),
  courseId: text()
    .notNull()
    .references(() => courses.id),
  title: text().notNull(),
  position: integer().notNull(),
  content: text({ mode: "json" }).notNull(),
});
export const progress = createTable(
  "progress",
  {
    userId: text()
      .notNull()
      .references(() => users.id),
    lessonId: text()
      .notNull()
      .references(() => lessonCatalog.id),
    code: text().notNull().default(""),
    growth: integer().notNull().default(0),
    completedAt: integer({ mode: "timestamp" }),
    updatedAt: integer({ mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] })],
);
export const attempts = createTable(
  "attempt",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    userId: text()
      .notNull()
      .references(() => users.id),
    lessonId: text()
      .notNull()
      .references(() => lessonCatalog.id),
    code: text().notNull(),
    passed: integer({ mode: "boolean" }).notNull(),
    createdAt: integer({ mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [index("attempt_user_idx").on(t.userId)],
);

export const enrollments = createTable(
  "enrollment",
  {
    userId: text()
      .notNull()
      .references(() => users.id),
    trackId: text({
      enum: ["html", "css", "javascript", "typescript", "nextjs"],
    }).notNull(),
    experience: text({ enum: ["new", "some_basics", "comfortable"] }),
    source: text({ enum: ["onboarding", "new_course"] }).notNull(),
    createdAt: integer({ mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [primaryKey({ columns: [t.userId, t.trackId] })],
);
