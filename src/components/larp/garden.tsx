"use client";
import Link from "next/link";
import { ArrowRight } from "pixelarticons/react/ArrowRight.js";
import { Check } from "pixelarticons/react/Check.js";
import { Leaf as Sprout } from "pixelarticons/react/Leaf.js";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardPanel, CardFooter } from "~/components/ui/card";
import { tracks } from "~/content/curriculum";
import { fullBloomStage, getCourseGrowth } from "~/lib/garden";
import { useLearning } from "./learning-provider";
import { GrowingPlant } from "./growing-plant";
import { LessonProgress } from "./lesson-progress";
import { GardenBed } from "./garden-bed";
import { GrowthGuide } from "./growth-guide";

export function Garden() {
  const { data } = useLearning();
  const plants = tracks.map((track) =>
    getCourseGrowth(track.id, data?.progress),
  );
  const bloomed = plants.filter((plant) => plant.bloomed).length;
  return (
    <>
      <section className="page-heading">
        <div>
          <span className="eyebrow">GROWN BY YOU</span>
          <h1>Your garden.</h1>
        </div>
        <Badge variant={bloomed === tracks.length ? "success" : "outline"}>
          {bloomed} / {tracks.length} flowers bloomed
        </Badge>
      </section>
      <Card className="garden-scene">
        <CardPanel>
          <div className="garden-scene-heading">
            <div>
              <h2>{data?.profile.gardenName ?? "Sprout"}</h2>
              <p>One course. One flower. A garden that grows with you.</p>
            </div>
            <GrowthGuide />
          </div>
          <GardenBed />
        </CardPanel>
        <CardFooter className="border-t">
          <LessonProgress
            completed={bloomed}
            total={tracks.length}
            label="Flowers in full bloom"
          />
        </CardFooter>
      </Card>
      <div className="section-heading">
        <h2>Your flowers</h2>
        <span>12 stages · 5 different flowers</span>
      </div>
      <div className="garden-collection">
        {tracks.map((track, variant) => {
          const growth = plants[variant]!;
          return (
            <Card
              key={track.id}
              render={<Link href={`/courses/${track.id}`} />}
              className="plant-collection-card"
              data-flower-course={track.id}
            >
              <CardPanel>
                <GrowingPlant variant={variant} stage={growth.stage} />
                <h3>{track.plant}</h3>
                <p>{track.name}</p>
                <Badge
                  variant={
                    growth.bloomed
                      ? "success"
                      : growth.stage > 0
                        ? "secondary"
                        : "outline"
                  }
                >
                  {growth.bloomed ? (
                    <>
                      <Check aria-hidden="true" />
                      Bloomed
                    </>
                  ) : (
                    growth.stageName
                  )}
                </Badge>
                <span className="growth-stage-count">
                  Stage {growth.stage + 1} / {fullBloomStage + 1}
                </span>
              </CardPanel>
              <CardFooter className="plant-progress border-t">
                <LessonProgress
                  completed={growth.completed}
                  total={growth.total}
                  label={
                    growth.bloomed ? "Course complete" : "Lessons complete"
                  }
                />
              </CardFooter>
            </Card>
          );
        })}
      </div>
      <p className="garden-footnote">
        <Sprout aria-hidden="true" />
        Passed checks grow your flowers. Finish a course to see it bloom.
      </p>
      <Button
        variant="ghost"
        className="mt-4"
        render={<Link href="/courses" />}
      >
        Keep growing
        <ArrowRight aria-hidden="true" />
      </Button>
    </>
  );
}
