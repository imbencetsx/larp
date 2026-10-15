"use client";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  Route,
} from "lucide-react";
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
        <Badge variant="outline">5 paths / {tracks.reduce((count, track) => count + trackLessons(track.id).length, 0)} lessons</Badge>
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
        </div>
      </section>
      <div className="section-heading">
        <h2>Lessons</h2>
        <span>{trackLessons(track.id).length} lessons</span>
      </div>
      <div className="lesson-list">
        {trackLessons(track.id).map((l) => {
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
                <h3>{l.title}</h3>
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
      <div className="course-bottom-note">
        <span>Want to experiment?</span>
        <Link href="/playground" className="text-link">
          Open playground <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </>
  );
}
