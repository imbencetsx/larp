"use client";
import Link from "next/link";
import { ArrowLeft } from "pixelarticons/react/ArrowLeft.js";
import { ArrowRight } from "pixelarticons/react/ArrowRight.js";
import { Check } from "pixelarticons/react/Check.js";
import { ChevronRight } from "pixelarticons/react/ChevronRight.js";
import { Clock as Clock3 } from "pixelarticons/react/Clock.js";
import { Map as Route } from "pixelarticons/react/Map.js";
import { tracks, trackLessons, type Track } from "~/content/curriculum";
import { Card, CardPanel } from "~/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyContent,
} from "~/components/ui/empty";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsList, TabsTab, TabsPanel } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { TrackCard } from "./dashboard";
import { useLearning } from "./learning-provider";
export function Courses() {
  const { data } = useLearning();
  const started = tracks.filter((t) =>
    data?.progress.some((p) => p.lessonId.startsWith(t.id + "-")),
  );
  return (
    <>
      <section className="page-heading">
        <div>
          <span className="eyebrow">THE CURRICULUM</span>
          <h1>Pick your path.</h1>
        </div>
        <Badge variant="outline">
          5 paths /{" "}
          {tracks.reduce(
            (count, track) => count + trackLessons(track.id).length,
            0,
          )}{" "}
          lessons
        </Badge>
      </section>
      <Tabs defaultValue="all" className="paths-tabs">
        <TabsList>
          <TabsTab value="all">All paths</TabsTab>
          <TabsTab value="started">In progress</TabsTab>
        </TabsList>
        <TabsPanel value="all">
          <div className="course-grid large-course-grid">
            {tracks.map((t) => (
              <TrackCard key={t.id} track={t} />
            ))}
          </div>
        </TabsPanel>
        <TabsPanel value="started">
          {started.length ? (
            <div className="course-grid large-course-grid">
              {started.map((t) => (
                <TrackCard key={t.id} track={t} />
              ))}
            </div>
          ) : (
            <Card>
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>A fresh start.</EmptyTitle>
                </EmptyHeader>
                <EmptyContent>
                  <Button render={<Link href="/learn/html/1" />}>
                    Start with HTML <ArrowRight aria-hidden="true" />
                  </Button>
                </EmptyContent>
              </Empty>
            </Card>
          )}
        </TabsPanel>
      </Tabs>
      <div className="path-hint">
        <Route aria-hidden="true" />
        <span>Suggested: HTML → CSS → JavaScript → TypeScript → Next.js</span>
      </div>
    </>
  );
}
export function CourseDetail({ track }: { track: Track }) {
  const { data } = useLearning();
  const course = trackLessons(track.id);
  const chapters = [...new Set(course.map((lesson) => lesson.chapter!))];
  const completed = course.filter((lesson) =>
    data?.progress.some((row) => row.lessonId === lesson.id && row.completedAt),
  ).length;
  return (
    <>
      <Link href="/courses" className="back-link">
        <ArrowLeft aria-hidden="true" />
        All paths
      </Link>
      <section className={`track-detail-hero scene-${track.id}`}>
        <span className={`track-icon ${track.color}`}>{track.short}</span>
        <div>
          <h1>{track.name}</h1>
          <div className="track-detail-meta">
            <Badge variant="outline">{track.level}</Badge>
            <span>{track.prerequisite}</span>
          </div>
          <p className="course-summary">
            {course.length} lessons ·{" "}
            {course.filter((lesson) => lesson.kind === "quiz").length} quizzes ·{" "}
            {course.filter((lesson) => lesson.kind === "project").length}{" "}
            projects
          </p>
        </div>
      </section>
      <div className="section-heading">
        <h2>Your course</h2>
        <span>
          {completed} / {course.length} complete
        </span>
      </div>
      <nav className="chapter-nav" aria-label="Course chapters">
        {chapters.map((chapter, i) => (
          <a key={chapter} href={`#chapter-${i}`}>
            {String(i + 1).padStart(2, "0")} {chapter}
          </a>
        ))}
      </nav>
      {chapters.map((chapter, index) => (
        <section
          className="course-chapter"
          key={chapter}
          id={`chapter-${index}`}
          aria-labelledby={`chapter-title-${index}`}
        >
          <div className="chapter-heading">
            <span className="chapter-index">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h2 id={`chapter-title-${index}`}>{chapter}</h2>
            <span>
              {course.filter((lesson) => lesson.chapter === chapter).length}{" "}
              lessons
            </span>
          </div>
          <div className="lesson-list">
            {course
              .filter((lesson) => lesson.chapter === chapter)
              .map((l) => {
                const done = data?.progress.some(
                  (p) => p.lessonId === l.id && p.completedAt,
                );
                return (
                  <Card
                    key={l.id}
                    render={<Link href={`/learn/${l.track}/${l.number}`} />}
                    className="lesson-row"
                  >
                    <CardPanel>
                      <span className="lesson-number">
                        {done ? (
                          <Check aria-hidden="true" />
                        ) : (
                          String(l.number).padStart(2, "0")
                        )}
                      </span>
                      <div className="lesson-row-title">
                        <h3>{l.title}</h3>
                        {l.kind !== "exercise" && (
                          <Badge
                            variant={
                              l.kind === "quiz" ? "outline" : "secondary"
                            }
                          >
                            {l.kind === "quiz"
                              ? `${l.quiz?.length ?? 0} questions`
                              : "Project"}
                          </Badge>
                        )}
                      </div>
                      <div className="lesson-row-end">
                        <span>
                          <Clock3 aria-hidden="true" />
                          {l.duration} min
                        </span>
                        <span>{done ? "Complete" : "Start"}</span>
                        <ChevronRight aria-hidden="true" />
                      </div>
                    </CardPanel>
                  </Card>
                );
              })}
          </div>
        </section>
      ))}
      <div className="course-bottom-note">
        <span>Want to experiment?</span>
        <Link href="/playground" className="text-link">
          Open playground <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </>
  );
}
