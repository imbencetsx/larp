"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "pixelarticons/react/ArrowLeft.js";
import { ArrowRight } from "pixelarticons/react/ArrowRight.js";
import { ExternalLink } from "pixelarticons/react/ExternalLink.js";
import { Button } from "~/components/ui/button";
import { Card, CardPanel } from "~/components/ui/card";
import {
  Progress,
  ProgressLabel,
  ProgressTrack,
  ProgressIndicator,
  ProgressValue,
} from "~/components/ui/progress";
import { trackLessons, type Track } from "~/content/curriculum";
import { useMediaQuery } from "~/hooks/use-media-query";
import { AnimatedBiome } from "./animated-biome";
import { useLearning } from "./learning-provider";

export function ContinueCarousel({ tracks }: { tracks: Track[] }) {
  const { data } = useLearning();
  const slides = tracks.flatMap((track) => {
    const lessons = trackLessons(track.id);
    const completed = lessons.filter((lesson) =>
      data?.progress.some(
        (row) => row.lessonId === lesson.id && row.completedAt,
      ),
    ).length;
    const next = lessons.find(
      (lesson) =>
        !data?.progress.some(
          (row) => row.lessonId === lesson.id && row.completedAt,
        ),
    );
    return next ? [{ track, next, completed, total: lessons.length }] : [];
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [hidden, setHidden] = useState(false);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const root = useRef<HTMLElement>(null);
  const index = Math.max(
    0,
    slides.findIndex((slide) => slide.track.id === selectedId),
  );
  const slideIds = slides.map((slide) => slide.track.id).join(",");
  useEffect(() => {
    const sync = () => setHidden(document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(([entry]) =>
            setVisible(entry?.isIntersecting ?? false),
          );
    if (root.current) observer?.observe(root.current);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      observer?.disconnect();
    };
  }, []);
  useEffect(() => {
    const ids = slideIds.split(",").filter(Boolean);
    if (
      ids.length < 2 ||
      hovered ||
      focused ||
      !visible ||
      hidden ||
      reducedMotion
    )
      return;
    const timer = setTimeout(
      () => setSelectedId(ids[(index + 1) % ids.length]!),
      9000,
    );
    return () => clearTimeout(timer);
  }, [slideIds, index, hovered, focused, visible, hidden, reducedMotion]);
  const slide = slides[index];
  if (!slide) return null;
  function select(offset: number) {
    setSelectedId(
      slides[(index + offset + slides.length) % slides.length]!.track.id,
    );
  }
  return (
    <section
      ref={root}
      className="continue-carousel"
      aria-label="Continue learning"
      aria-roledescription="carousel"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      <div className="section-heading">
        <h2>Jump back in</h2>
        {slides.length > 1 && (
          <div className="continue-carousel-arrows">
            <Button
              type="button"
              variant="ghost"
              aria-label="Previous course"
              onClick={() => select(-1)}
            >
              <ArrowLeft aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              aria-label="Next course"
              onClick={() => select(1)}
            >
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>
      <div aria-live={focused || hovered ? "polite" : "off"}>
        <Card
          key={slide.track.id}
          className={`course-resume biome-${slide.track.id}`}
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${slides.length}: ${slide.track.name}`}
        >
          <AnimatedBiome track={slide.track.id} />
          <CardPanel>
            <Progress
              value={(slide.completed / slide.total) * 100}
              className="course-resume-progress"
            >
              <ProgressLabel className="sr-only">
                {slide.track.name} course progress
              </ProgressLabel>
              <ProgressTrack>
                <ProgressIndicator />
              </ProgressTrack>
              <ProgressValue />
            </Progress>
            <span className="eyebrow">COURSE</span>
            <h3>{slide.track.name}</h3>
            <p className="course-resume-next">
              Next exercise: <strong>{slide.next.title}</strong>
            </p>
            <div className="course-resume-actions">
              <Button
                size="lg"
                render={
                  <Link
                    href={`/learn/${slide.next.track}/${slide.next.number}`}
                  />
                }
              >
                Continue learning <ArrowRight aria-hidden="true" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="course-resume-view"
                render={<Link href={`/courses/${slide.track.id}`} />}
              >
                View course <ExternalLink aria-hidden="true" />
              </Button>
            </div>
          </CardPanel>
        </Card>
      </div>
      {slides.length > 1 && (
        <div
          className="continue-carousel-indicators"
          aria-label="Choose a course to continue"
        >
          {slides.map(({ track, next }, i) => (
            <button
              key={track.id}
              type="button"
              className="continue-carousel-dot"
              aria-label={`Continue ${track.name}: ${next.title}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => setSelectedId(track.id)}
            >
              <span aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
