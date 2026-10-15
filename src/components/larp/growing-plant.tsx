"use client";
import { useEffect, useState } from "react";
import { useMediaQuery } from "~/hooks/use-media-query";
import { PixelPlant } from "./pixel-art";

export function GrowingPlant({
  stage,
  variant,
  className,
}: {
  stage: number;
  variant: number;
  className?: string;
}) {
  const [visibleStage, setVisibleStage] = useState(stage);
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  useEffect(() => {
    if (visibleStage === stage) return;
    const timer = setTimeout(
      () =>
        setVisibleStage(
          reduceMotion || visibleStage > stage ? stage : visibleStage + 1,
        ),
      reduceMotion ? 0 : 110,
    );
    return () => clearTimeout(timer);
  }, [stage, visibleStage, reduceMotion]);
  return (
    <PixelPlant stage={visibleStage} variant={variant} className={className} />
  );
}
