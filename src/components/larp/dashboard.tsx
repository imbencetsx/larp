"use client";
import Link from "next/link";
import { ArrowRight } from "pixelarticons/react/ArrowRight.js";
import { ExternalLink as ArrowUpRight } from "pixelarticons/react/ExternalLink.js";
import { Card, CardHeader, CardPanel, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { LessonProgress } from "./lesson-progress";
import { Skeleton } from "~/components/ui/skeleton";
import { useLearning } from "./learning-provider";
import { GardenBed } from "./garden-bed";
import { getCourseGrowth } from "~/lib/garden";
import {
  tracks,
  lessons,
  trackLessons,
  type Track,
} from "~/content/curriculum";
export function TrackCard({
  track,
  showIcons = true,
}: {
  track: Track;
  showIcons?: boolean;
}) {
  const { data } = useLearning();
  const courseLessons = trackLessons(track.id);
  const done = courseLessons.filter((lesson) =>
    data?.progress.some((p) => p.lessonId === lesson.id && p.completedAt),
  ).length;
  return (
    <Card
      render={<Link href={`/courses/${track.id}`} />}
      className={`track-card ${track.color} scene-${track.id}`}
    >
      <CardHeader className="track-card-top">
        {showIcons && (
          <>
            <span className="track-icon">{track.short}</span>
            <ArrowUpRight aria-hidden="true" />
          </>
        )}
      </CardHeader>
      <CardPanel className="track-card-body">
        <h3>{track.name}</h3>
        <span>{track.level === "Start here" ? "Beginner" : track.level}</span>
      </CardPanel>
      <CardFooter className="track-card-footer">
        <LessonProgress
          completed={done}
          total={courseLessons.length}
          label={
            done === courseLessons.length
              ? "Completed"
              : done
                ? "In progress"
                : "Not started"
          }
        />
      </CardFooter>
    </Card>
  );
}
export function Dashboard() {
  const { data, loading } = useLearning();
  const completed = data?.progress.filter((p) => p.completedAt) ?? [];
  const next = lessons.find((l) => !completed.some((p) => p.lessonId === l.id));
  const bloomed = tracks.filter(
    (track) => getCourseGrowth(track.id, data?.progress).bloomed,
  ).length;
  return (
    <>
      <section className="page-heading dashboard-heading">
        <div>
          <span className="eyebrow">YOUR WORKSPACE</span>
          <h1>Let’s build.</h1>
        </div>
        <Badge variant="outline">
          {completed.length} / {lessons.length} lessons
        </Badge>
      </section>
      <Card className="resume-card">
        <CardPanel>
          <div>
            <span className="eyebrow">
              {next
                ? `${next.track.toUpperCase()} / ${String(next.number).padStart(2, "0")}`
                : "ALL PATHS COMPLETE"}
            </span>
            <h2>{next?.title ?? "Your garden is in full bloom."}</h2>
            <p>
              {next
                ? `${next.duration} min · Hands-on lesson`
                : "Every course flower is ready to visit."}
            </p>
          </div>
          <Button
            render={
              <Link
                href={next ? `/learn/${next.track}/${next.number}` : "/garden"}
              />
            }
          >
            {next
              ? completed.length
                ? "Continue learning"
                : "Start lesson"
              : "Visit your garden"}
            <ArrowRight aria-hidden="true" />
          </Button>
        </CardPanel>
        <CardFooter className="resume-progress border-t">
          <LessonProgress
            completed={completed.length}
            total={lessons.length}
            label="Overall progress"
          />
        </CardFooter>
      </Card>
      <section className="paths-section">
        <div className="section-heading">
          <h2>Your paths</h2>
          <Button variant="ghost" size="sm" render={<Link href="/courses" />}>
            View all <ArrowRight aria-hidden="true" />
          </Button>
        </div>
        <nav className="course-grid dashboard-courses" aria-label="Courses">
          {loading
            ? tracks.map((t) => (
                <Skeleton key={t.id} className="track-skeleton" />
              ))
            : tracks.map((t) => (
                <TrackCard key={t.id} track={t} showIcons={false} />
              ))}
        </nav>
      </section>
      <Card className="garden-strip">
        <CardPanel>
          <GardenBed compact />
          <div className="garden-growth">
            <div className="plant-name">
              <h3>{data?.profile.plantName ?? "Sprout"}</h3>
              <Badge variant="secondary">Your garden</Badge>
            </div>
            <LessonProgress
              completed={bloomed}
              total={tracks.length}
              label="Flowers bloomed"
            />
          </div>
          <Button variant="ghost" size="sm" render={<Link href="/garden" />}>
            Visit garden
            <ArrowUpRight aria-hidden="true" />
          </Button>
        </CardPanel>
      </Card>
      {data?.guest && (
        <div className="guest-note">
          <span>Guest session · progress saved</span>
          <Link href="/sign-up">
            Create account <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      )}
    </>
  );
}
