import type { TrackId } from "~/content/curriculum";

type Point = readonly [number, number];
type Region = {
  kind: "water" | "foliage" | "grass" | "cloud";
  points: readonly Point[];
};
// Coordinates are fractions of the original artwork, so the masks stay aligned
// when the banner crops at different screen sizes. Lettered stones stay static.
const regions: Record<TrackId, Region[]> = {
  html: [
    {
      kind: "water",
      points: [
        [0.12, 1],
        [0, 0.83],
        [0.13, 0.62],
        [0.24, 0.52],
        [0.22, 0.48],
        [0.25, 0.49],
        [0.27, 0.54],
        [0.18, 0.66],
        [0.18, 0.77],
        [0.33, 1],
      ],
    },
    {
      kind: "foliage",
      points: [
        [0.005, 0.36],
        [0.03, 0.22],
        [0.07, 0.23],
        [0.09, 0.4],
        [0.065, 0.46],
        [0.02, 0.44],
      ],
    },
    {
      kind: "foliage",
      points: [
        [0.12, 0.38],
        [0.14, 0.28],
        [0.17, 0.32],
        [0.18, 0.43],
        [0.14, 0.45],
      ],
    },
    {
      kind: "foliage",
      points: [
        [0.92, 0.3],
        [0.94, 0.19],
        [0.98, 0.23],
        [1, 0.4],
        [0.96, 0.47],
      ],
    },
  ],
  css: [
    {
      kind: "foliage",
      points: [
        [0.89, 0.7],
        [0.94, 0.5],
        [0.99, 0.52],
        [1, 0.82],
        [0.95, 0.9],
      ],
    },
  ],
  javascript: [
    {
      kind: "water",
      points: [
        [0.28, 0.58],
        [0.45, 0.61],
        [0.52, 0.72],
        [0.62, 0.74],
        [0.69, 0.85],
        [0.85, 0.88],
        [0.91, 1],
        [0.65, 1],
        [0.57, 0.86],
        [0.48, 0.78],
        [0.4, 0.69],
        [0.3, 0.62],
      ],
    },
    {
      kind: "water",
      points: [
        [0.832, 0.31],
        [0.843, 0.31],
        [0.843, 0.83],
        [0.827, 0.84],
        [0.818, 0.76],
      ],
    },
    {
      kind: "foliage",
      points: [
        [0, 0],
        [0.14, 0],
        [0.15, 0.2],
        [0.08, 0.27],
        [0, 0.2],
      ],
    },
    {
      kind: "foliage",
      points: [
        [0.58, 0.05],
        [0.62, 0],
        [0.71, 0],
        [0.73, 0.14],
        [0.67, 0.24],
        [0.61, 0.23],
      ],
    },
    {
      kind: "foliage",
      points: [
        [0.84, 0],
        [1, 0],
        [1, 0.25],
        [0.93, 0.23],
        [0.87, 0.14],
      ],
    },
  ],
  typescript: [
    {
      kind: "water",
      points: [
        [0.04, 1],
        [0.07, 0.87],
        [0.15, 0.8],
        [0.22, 0.74],
        [0.22, 0.67],
        [0.3, 0.6],
        [0.33, 0.6],
        [0.28, 0.69],
        [0.29, 0.76],
        [0.2, 0.85],
        [0.24, 1],
      ],
    },
    {
      kind: "foliage",
      points: [
        [0.1, 0.36],
        [0.12, 0.25],
        [0.14, 0.47],
        [0.13, 0.61],
        [0.09, 0.6],
      ],
    },
  ],
  nextjs: [
    {
      kind: "water",
      points: [
        [0.32, 0.71],
        [0.46, 0.63],
        [0.6, 0.67],
        [0.66, 0.56],
        [0.72, 0.56],
        [0.8, 0.73],
        [0.89, 0.77],
        [1, 0.78],
        [1, 1],
        [0.72, 1],
        [0.7, 0.94],
        [0.58, 0.9],
        [0.56, 0.81],
        [0.4, 0.82],
      ],
    },
    {
      kind: "foliage",
      points: [
        [0.42, 0.22],
        [0.45, 0.05],
        [0.51, 0],
        [0.57, 0],
        [0.59, 0.18],
        [0.55, 0.29],
        [0.49, 0.19],
        [0.45, 0.28],
      ],
    },
    {
      kind: "foliage",
      points: [
        [0.39, 0.33],
        [0.42, 0.21],
        [0.46, 0.19],
        [0.49, 0.28],
        [0.48, 0.4],
        [0.44, 0.32],
      ],
    },
    {
      kind: "foliage",
      points: [
        [0.77, 0.16],
        [0.8, 0.05],
        [0.87, 0.06],
        [0.9, 0.2],
        [0.87, 0.31],
        [0.82, 0.23],
      ],
    },
    {
      kind: "foliage",
      points: [
        [0.91, 0.09],
        [0.95, 0.03],
        [1, 0.04],
        [1, 0.24],
        [0.96, 0.21],
      ],
    },
  ],
};

const grassRegions: Partial<Record<TrackId, Region[]>> = {
  html: [
    {
      kind: "grass",
      points: [
        [0, 0.47],
        [1, 0.47],
        [1, 1],
        [0, 1],
      ],
    },
  ],
  javascript: [
    {
      kind: "grass",
      points: [
        [0, 0.45],
        [1, 0.45],
        [1, 1],
        [0, 1],
      ],
    },
  ],
  nextjs: [
    {
      kind: "grass",
      points: [
        [0.27, 0.48],
        [1, 0.48],
        [1, 1],
        [0.27, 1],
      ],
    },
  ],
};
const cloudRegions: Record<TrackId, Region[]> = {
  html: [
    {
      kind: "cloud",
      points: [
        [0, 0],
        [0.64, 0],
        [0.64, 0.23],
        [0, 0.23],
      ],
    },
  ],
  css: [
    {
      kind: "cloud",
      points: [
        [0, 0],
        [0.58, 0],
        [0.58, 0.29],
        [0, 0.29],
      ],
    },
  ],
  javascript: [
    {
      kind: "cloud",
      points: [
        [0.16, 0],
        [0.58, 0],
        [0.58, 0.27],
        [0.16, 0.27],
      ],
    },
  ],
  typescript: [
    {
      kind: "cloud",
      points: [
        [0, 0],
        [0.3, 0],
        [0.3, 0.14],
        [0, 0.14],
      ],
    },
  ],
  nextjs: [
    {
      kind: "cloud",
      points: [
        [0, 0],
        [0.4, 0],
        [0.4, 0.28],
        [0, 0.28],
      ],
    },
  ],
};

const protectedAreas: Partial<Record<TrackId, readonly (readonly Point[])[]>> =
  {
    html: [
      [
        [0.63, 0.14],
        [0.9, 0.14],
        [0.9, 0.67],
        [0.63, 0.67],
      ],
      [
        [0.44, 0.67],
        [0.66, 0.67],
        [0.66, 0.9],
        [0.44, 0.9],
      ],
    ],
    typescript: [
      [
        [0.5, 0.18],
        [1, 0.18],
        [1, 0.94],
        [0.5, 0.94],
      ],
    ],
    css: [
      [
        [0.68, 0.26],
        [0.96, 0.26],
        [0.96, 0.62],
        [0.68, 0.62],
      ],
    ],
    javascript: [
      [
        [0.86, 0.44],
        [1, 0.44],
        [1, 0.64],
        [0.86, 0.64],
      ],
      [
        [0.52, 0.69],
        [0.67, 0.69],
        [0.68, 0.86],
        [0.52, 0.88],
      ],
      [
        [0.87, 0.72],
        [1, 0.72],
        [1, 1],
        [0.87, 1],
      ],
    ],
    nextjs: [
      [
        [0.63, 0.23],
        [0.81, 0.23],
        [0.81, 0.63],
        [0.63, 0.63],
      ],
      [
        [0.56, 0.76],
        [0.77, 0.76],
        [0.78, 0.96],
        [0.56, 0.96],
      ],
      [
        [0.89, 0.58],
        [1, 0.58],
        [1, 0.78],
        [0.89, 0.78],
      ],
    ],
  };

function inside(x: number, y: number, points: readonly Point[]) {
  let result = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i]!;
    const b = points[j]!;
    if (
      a[1] > y !== b[1] > y &&
      x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]
    )
      result = !result;
  }
  return result;
}

export function createBiomeAnimation(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  track: TrackId,
) {
  const width = 768;
  const height = Math.round((width * image.naturalHeight) / image.naturalWidth);
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.imageSmoothingEnabled = false;
  context.drawImage(image, 0, 0, width, height);
  const original = context.getImageData(0, 0, width, height);
  const frame = context.createImageData(width, height);
  const source = new Uint32Array(original.data.buffer);
  const pixels = new Uint32Array(frame.data.buffer);
  const motionRegions = [
    ...cloudRegions[track],
    ...regions[track],
    ...(grassRegions[track] ?? []),
  ];
  const masks = motionRegions.map((region, index) => {
    const points = region.points.map(
      ([x, y]) => [x * width, y * height] as const,
    );
    const minX = Math.min(...points.map(([x]) => x));
    const maxX = Math.max(...points.map(([x]) => x));
    const minY = Math.min(...points.map(([, y]) => y));
    const maxY = Math.max(...points.map(([, y]) => y));
    const rows: { y: number; xs: number[] }[] = [];
    for (
      let y = Math.max(0, Math.floor(minY));
      y < Math.min(height, maxY);
      y++
    ) {
      const xs: number[] = [];
      for (
        let x = Math.max(0, Math.floor(minX));
        x < Math.min(width, maxX);
        x++
      ) {
        const pixel = (y * width + x) * 4;
        const green = original.data[pixel + 1]!;
        const isGrass =
          green > original.data[pixel]! * 0.91 &&
          green > original.data[pixel + 2]! * 1.18 &&
          green > 55;
        // Leave a stationary edge so nearby stonework and sky never tear.
        if (
          (region.kind !== "grass" || isGrass) &&
          !protectedAreas[track]?.some((area) =>
            inside(x / width, y / height, area),
          ) &&
          inside(x, y, points) &&
          inside(x - 3, y, points) &&
          inside(x + 3, y, points) &&
          inside(x, y - 2, points) &&
          inside(x, y + 2, points)
        )
          xs.push(x);
      }
      if (xs.length) rows.push({ y, xs });
    }
    return { ...region, rows, minY, maxY, phase: index * 1.7 };
  });
  return (seconds: number) => {
    pixels.set(source);
    for (const mask of masks) {
      for (const { y, xs } of mask.rows) {
        const water = mask.kind === "water";
        const cloud = mask.kind === "cloud";
        const grass = mask.kind === "grass";
        const wind = (mask.maxY - y) / Math.max(1, mask.maxY - mask.minY);
        const gust = 0.75 + 0.25 * Math.sin(seconds * 0.65);
        const dx = water
          ? Math.sin(y * 0.3 - seconds * 2.8) * 3
          : cloud
            ? Math.sin(seconds * 0.16 + mask.phase) * 14
            : grass
              ? Math.sin(seconds * 2.7 + y * 0.11) * 3.5 * gust
              : Math.sin(seconds * 1.65 + mask.phase + y * 0.025) *
                5.5 *
                wind *
                gust;
        const dy = water ? Math.round(Math.sin(y * 0.19 - seconds * 2.2)) : 0;
        for (const x of xs) {
          const edge = Math.min(
            1,
            (x - xs[0]!) / 12,
            (xs[xs.length - 1]! - x) / 12,
          );
          const sx = Math.max(
            0,
            Math.min(width - 1, x + Math.round(dx * edge)),
          );
          const sy = Math.max(0, Math.min(height - 1, y + dy));
          pixels[y * width + x] = source[sy * width + sx]!;
        }
      }
    }
    context.putImageData(frame, 0, 0);
    // Foreground inscriptions occlude weather passing behind them.
    context.save();
    context.beginPath();
    context.rect(0, 0, width, height);
    for (const area of protectedAreas[track] ?? []) {
      context.moveTo(area[0]![0] * width, area[0]![1] * height);
      for (const [x, y] of area.slice(1)) context.lineTo(x * width, y * height);
      context.closePath();
    }
    context.clip("evenodd");
    const wrap = (value: number, size: number) =>
      ((value % size) + size) % size;
    const protectedPixel = (x: number, y: number) =>
      protectedAreas[track]?.some((area) =>
        inside(x / width, y / height, area),
      );
    // Autumn leaves tumble in three distinct pixel silhouettes.
    if (track === "javascript") {
      const colors = ["#cf8540", "#bd633c", "#e4ae54", "#a84f33"];
      for (let i = 0; i < 34; i++) {
        const depth = 0.55 + (i % 4) * 0.2;
        const x = Math.floor(
          wrap(
            i * 83 + seconds * 11 * depth + Math.sin(seconds * 1.7 + i) * 12,
            width,
          ),
        );
        const y = Math.floor(
          wrap(i * 47 + seconds * 13 * depth, height + 14) - 7,
        );
        if (protectedPixel(x, y)) continue;
        const flutter = Math.sin(seconds * 3 + i);
        context.globalAlpha = 0.65 + (i % 3) * 0.1;
        context.fillStyle = colors[i % colors.length]!;
        context.fillRect(x, y, flutter > 0.2 ? 3 : 1, 2);
        context.fillRect(x + (flutter > 0 ? 1 : -1), y + 2, 2, 1);
      }
    }
    if (track === "css" || track === "nextjs") {
      const storm = track === "css";
      const gust = 0.55 + 0.45 * Math.sin(seconds * 0.7);
      // Wide stepped veils make mesa gusts read as a sandstorm, not just specks.
      if (storm) {
        context.fillStyle = "#e8bc8b";
        for (let i = 0; i < 5; i++) {
          const x = wrap(i * 173 + seconds * 39, width + 260) - 260;
          const y =
            height * (0.35 + i * 0.13) + Math.sin(seconds * 0.8 + i) * 7;
          context.globalAlpha = 0.04 + gust * 0.045;
          context.fillRect(Math.floor(x), Math.floor(y), 220, 6);
          context.fillRect(Math.floor(x + 28), Math.floor(y - 4), 160, 4);
          context.fillRect(Math.floor(x + 45), Math.floor(y + 6), 150, 5);
        }
      }
      context.fillStyle = storm ? "#f0c692" : "#e9c99d";
      for (let i = 0; i < (storm ? 150 : 32); i++) {
        const depth = 0.45 + (i % 5) * 0.2;
        const speed = storm ? 58 : 24;
        const x = Math.floor(
          wrap(
            i * 71.3 + seconds * speed * depth + Math.sin(seconds + i) * 9,
            width,
          ),
        );
        const y = Math.floor(
          height * 0.28 +
            wrap(
              i * 31.7 - seconds * 3 * depth + Math.sin(seconds * 1.4 + i) * 5,
              height * 0.72,
            ),
        );
        if (protectedPixel(x, y)) continue;
        context.globalAlpha = (storm ? 0.26 : 0.22) + gust * 0.14;
        context.fillRect(x, y, storm ? 2 + (i % 5) : 1 + (i % 2), 1);
      }
    }
    if (track === "typescript") {
      context.fillStyle = "#eef3ff";
      for (let i = 0; i < 42; i++) {
        const depth = 0.5 + (i % 4) * 0.25;
        const x = Math.floor(
          wrap(
            i * 97.3 + seconds * 9 * depth + Math.sin(seconds + i) * 5,
            width,
          ),
        );
        const y = Math.floor(wrap(i * 43.7 + seconds * 11 * depth, height));
        if (protectedPixel(x, y)) continue;
        context.globalAlpha = 0.45 + depth * 0.2;
        context.fillRect(x, y, i % 5 === 0 ? 2 : 1, 1);
      }
    }
    context.restore();
    context.globalAlpha = 1;
  };
}
