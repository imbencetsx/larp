"use client";

import { useEffect, useRef } from "react";
import type { TrackId } from "~/content/curriculum";
import { createBiomeAnimation } from "~/lib/biome-animation";

export function AnimatedBiome({ track }: { track: TrackId }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    delete canvas.dataset.ready;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const image = new Image();
    let draw: ReturnType<typeof createBiomeAnimation> = null;
    let visible = false;
    let disposed = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    let elapsed = 0;
    function sync() {
      clearInterval(timer);
      timer = undefined;
      if (!draw || !visible || document.hidden || reducedMotion.matches) return;
      timer = setInterval(() => {
        elapsed += 1 / 12;
        draw?.(elapsed);
      }, 1000 / 12);
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      sync();
    });
    observer.observe(canvas);
    image.onload = () => {
      if (disposed) return;
      draw = createBiomeAnimation(canvas, image, track);
      if (draw) canvas.dataset.ready = "true";
      sync();
    };
    image.src = `/artwork/biomes/${track}-v2.webp`;
    reducedMotion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      disposed = true;
      clearInterval(timer);
      observer.disconnect();
      reducedMotion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [track]);
  return (
    <canvas
      key={track}
      ref={ref}
      className="animated-biome"
      aria-hidden="true"
    />
  );
}
