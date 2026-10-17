"use client";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Sprout } from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyContent,
} from "~/components/ui/empty";
import { LessonProgress } from "./lesson-progress";
import { Button } from "~/components/ui/button";
import { Card, CardPanel } from "~/components/ui/card";
import { lessons, tracks, trackLessons } from "~/content/curriculum";
import { useLearning } from "./learning-provider";
export function ProgressPage() {
  const { data } = useLearning();
  const done =
    data?.progress
      .filter((p) => p.completedAt)
      .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime()) ??
    [];
  return (
    <>
      <section className="page-heading">
        <div>
          <span className="eyebrow">THE WORK ADDS UP</span>
          <h1>Your progress.</h1>
        </div>
      </section>
      <div className="progress-overview">
        <Card className="progress-stat">
          <CardPanel>
            <BookOpen />
            <strong>
              {done.length}
              <span> / {lessons.length}</span>
            </strong>
            <LessonProgress
              completed={done.length}
              total={lessons.length}
              label="Lessons completed"
            />
          </CardPanel>
        </Card>
        <Card className="progress-stat">
          <CardPanel>
            <Sprout />
            <strong>
              {
                tracks.filter(
                  (t) =>
                    trackLessons(t.id).every((lesson) => done.some((p) => p.lessonId === lesson.id)),
                ).length
              }
              <span> / 5</span>
            </strong>
            <span>Paths completed</span>
          </CardPanel>
        </Card>
      </div>
      <div className="section-heading">
        <h2>By path</h2>
      </div>
      {tracks.map((t) => {
        const count = done.filter((p) =>
          p.lessonId.startsWith(t.id + "-"),
        ).length;
        return (
          <Card
            key={t.id}
            render={<Link href={`/courses/${t.id}`} />}
            className={`progress-path ${t.color} scene-${t.id}`}
          >
            <CardPanel>
              <span className="progress-path-art" aria-hidden="true" />
              <div>
                <h3>{t.name}</h3>
                <LessonProgress
                  completed={count}
                  total={trackLessons(t.id).length}
                  label="Lessons completed"
                />
              </div>
              <ArrowRight aria-hidden="true" />
            </CardPanel>
          </Card>
        );
      })}
      <div className="section-heading" style={{ marginTop: 30 }}>
        <h2>Recent activity</h2>
      </div>
      {done.length ? (
        <Card className="recent-list">
          {done.map((p) => {
            const lesson = lessons.find((l) => l.id === p.lessonId);
            return (
              <div key={p.lessonId} className="recent-row">
                <CheckCircle2 aria-hidden="true" />
                <div>
                  <strong>{lesson?.title}</strong>
                  <small>
                    {tracks.find((t) => t.id === lesson?.track)?.name} ·{" "}
                    {p.completedAt?.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </small>
                </div>
                <span>Complete</span>
              </div>
            );
          })}
        </Card>
      ) : (
        <Card>
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No lessons completed. Yet.</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
              <Button render={<Link href="/learn/html/1" />}>
                Start lesson <ArrowRight aria-hidden="true" />
              </Button>
            </EmptyContent>
          </Empty>
        </Card>
      )}
    </>
  );
}
