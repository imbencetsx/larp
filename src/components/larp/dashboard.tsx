"use client";
import Link from "next/link";
import { ContinueCarousel } from "./continue-carousel";
import { ArrowRight } from "pixelarticons/react/ArrowRight.js";
import { GardenBed } from "./garden-bed";
import { getCourseGrowth } from "~/lib/garden";
import { tracks } from "~/content/curriculum";
import { Plus } from "pixelarticons/react/Plus.js";
import { BookOpen } from "pixelarticons/react/BookOpen.js";
import { enrolledTracks } from "~/lib/course-enrollment";
import { ExternalLink as ArrowUpRight } from "pixelarticons/react/ExternalLink.js";
import { Card, CardHeader, CardPanel, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { LessonProgress } from "./lesson-progress";
import { Skeleton } from "~/components/ui/skeleton";
import { useLearning } from "./learning-provider";
import { trackLessons, type Track } from "~/content/curriculum";
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
  const selected = enrolledTracks(data?.enrollments);
  const courseLessons = selected.flatMap((track) => trackLessons(track.id));
  const completed = courseLessons.filter((lesson) =>
    data?.progress.some((row) => row.lessonId === lesson.id && row.completedAt),
  ).length;
  const hasNext = courseLessons.some(
    (lesson) =>
      !data?.progress.some(
        (row) => row.lessonId === lesson.id && row.completedAt,
      ),
  );
  const bloomed = tracks.filter(
    (track) => getCourseGrowth(track.id, data?.progress).bloomed,
  ).length;
  return (
    <>
      <section className="page-heading dashboard-heading">
        <div>
          <span className="eyebrow">YOUR WORKSPACE</span>
          <h1>Your learning.</h1>
        </div>
        <Button render={<Link href="/courses/new" />}>
          <Plus aria-hidden="true" />
          New course
        </Button>
      </section>
      {!loading &&
        selected.length > 0 &&
        (hasNext ? (
          <ContinueCarousel tracks={selected} />
        ) : (
          <Card className="resume-card">
            <CardPanel>
              <div>
                <span className="eyebrow">ALL YOUR COURSES COMPLETE</span>
                <h2>Look at how much you’ve grown.</h2>
                <p>Pick a new course and keep your garden growing.</p>
              </div>
              <Button render={<Link href="/courses/new" />}>
                Explore a new course <ArrowRight aria-hidden="true" />
              </Button>
            </CardPanel>
          </Card>
        ))}
      {selected.length > 0 && (
        <div className="section-heading">
          <h2>Your courses</h2>
          <Badge variant="outline">
            {completed} / {courseLessons.length} lessons
          </Badge>
        </div>
      )}
      {loading ? (
        <div className="course-grid dashboard-courses">
          <Skeleton className="track-skeleton" />
          <Skeleton className="track-skeleton" />
        </div>
      ) : selected.length ? (
        <nav
          className="course-grid dashboard-courses"
          aria-label="Your courses"
        >
          {selected.map((track) => (
            <TrackCard key={track.id} track={track} showIcons={false} />
          ))}
        </nav>
      ) : (
        <Card className="learning-empty">
          <CardPanel>
            <BookOpen aria-hidden="true" />
            <h2>Your next project starts here.</h2>
            <p>
              Add a course to make it yours. Work through every lesson at your
              own pace.
            </p>
            <Button render={<Link href="/courses/new" />}>
              <Plus aria-hidden="true" />
              Add your first course
            </Button>
          </CardPanel>
        </Card>
      )}
      {!loading && selected.length > 0 && (
        <section
          className="learning-overview"
          aria-label="Your learning progress"
        >
          <Card className="garden-strip">
            <CardPanel>
              <GardenBed compact />
              <div className="garden-growth">
                <div className="garden-name">
                  <h3>{data?.profile?.gardenName ?? "Your garden"}</h3>
                  <Badge variant="secondary">Your garden</Badge>
                </div>
                <LessonProgress
                  completed={bloomed}
                  total={tracks.length}
                  label="Flowers bloomed"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                render={<Link href="/garden" />}
              >
                Visit garden <ArrowUpRight aria-hidden="true" />
              </Button>
            </CardPanel>
          </Card>
        </section>
      )}
    </>
  );
}
