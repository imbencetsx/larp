"use client";

import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "~/components/ui/progress";
import { cn } from "~/lib/utils";

export function LessonProgress({
  completed,
  total,
  label,
  className,
}: {
  completed: number;
  total: number;
  label: string;
  className?: string;
}) {
  return (
    <Progress
      value={total > 0 ? (completed / total) * 100 : 0}
      className={cn("lesson-progress", className)}
    >
      <div className="progress-caption">
        <ProgressLabel>{label}</ProgressLabel>
        <span className="progress-count">
          {completed} / {total}
        </span>
        <ProgressValue className="font-heading text-primary text-xl" />
      </div>
      <ProgressTrack className="h-2 rounded-sm">
        <ProgressIndicator />
      </ProgressTrack>
    </Progress>
  );
}
