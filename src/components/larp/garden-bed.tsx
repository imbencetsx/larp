"use client";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { tracks } from "~/content/curriculum";
import { getCourseGrowth } from "~/lib/garden";
import { cn } from "~/lib/utils";
import { useLearning } from "./learning-provider";
import { GrowingPlant } from "./growing-plant";

export function GardenBed({ compact = false }: { compact?: boolean }) {
  const { data } = useLearning();
  return (
    <div
      className={cn("garden-bed", compact && "garden-bed-compact")}
      aria-label="Your course flower garden"
    >
      {tracks.map((track, variant) => {
        const growth = getCourseGrowth(track.id, data?.progress);
        return (
          <Button
            key={track.id}
            variant="ghost"
            render={<Link href={`/courses/${track.id}`} />}
            className="garden-plot"
            aria-label={`${track.name}: ${track.plant}, ${growth.stageName}`}
            data-course={track.id}
            data-bloomed={growth.bloomed}
          >
            <GrowingPlant
              stage={growth.stage}
              variant={variant}
              className="size-auto opacity-100"
            />
            <span className="garden-label-full">
              {compact ? track.short : track.name}
            </span>
            {!compact && (
              <span className="garden-label-short">
                {track.id === "javascript"
                  ? "JS"
                  : track.id === "typescript"
                    ? "TS"
                    : track.name}
              </span>
            )}
            {!compact && <small>{growth.stageName}</small>}
          </Button>
        );
      })}
    </div>
  );
}
