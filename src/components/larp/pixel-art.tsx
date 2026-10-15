import { cn } from "~/lib/utils";
import { fullBloomStage, growthStages } from "~/lib/garden";

const palettes = [
  {
    leaf: "#53ca73",
    light: "#a4f486",
    dark: "#288b57",
    flower: "#fff5e1",
    center: "#ffc53d",
    pot: "#e68765",
    rim: "#ffb58a",
  },
  {
    leaf: "#59cd88",
    light: "#a3f5aa",
    dark: "#2d905e",
    flower: "#bf83ff",
    center: "#e2bcff",
    pot: "#9d77d0",
    rim: "#d0a5ff",
  },
  {
    leaf: "#77ce4d",
    light: "#b6f575",
    dark: "#3a8e44",
    flower: "#ffd447",
    center: "#a95327",
    pot: "#d88e50",
    rim: "#ffc181",
  },
  {
    leaf: "#4bcb9a",
    light: "#98f4c4",
    dark: "#278b6a",
    flower: "#69b5ff",
    center: "#c2e5ff",
    pot: "#5c9fae",
    rim: "#91d5dc",
  },
  {
    leaf: "#4acb82",
    light: "#99f29b",
    dark: "#258457",
    flower: "#ff6fa5",
    center: "#ffbad1",
    pot: "#e79979",
    rim: "#ffc4a0",
  },
];

function FlowerHead({
  variant,
  opening,
}: {
  variant: number;
  opening: boolean;
}) {
  const p = palettes[variant]!;
  return (
    <g transform={opening ? "translate(10 7) scale(.7)" : undefined}>
      {variant === 0 && (
        <>
          <path
            d="M28 2h8v9h-8zM28 22h8v9h-8zM17 12h9v9h-9zM38 12h9v9h-9zM21 6h7v7h-7zM36 6h7v7h-7zM21 21h7v7h-7zM36 21h7v7h-7z"
            fill={p.flower}
          />
          <path d="M26 11h12v12H26z" fill={p.center} />
          <path d="M28 12h5v4h-5z" fill="#ffeaa0" />
        </>
      )}
      {variant === 1 && (
        <>
          <path d="M31 4h3v30h-3z" fill={p.dark} />
          <path
            d="M29 1h7v5h-7zM25 7h8v6h-8zM34 10h7v6h-7zM23 15h9v6h-9zM33 19h9v6h-9zM25 24h8v6h-8z"
            fill={p.flower}
          />
          <path
            d="M29 1h4v3h-4zM25 7h4v3h-4zM34 10h4v3h-4zM23 15h4v3h-4zM33 19h4v3h-4zM25 24h4v3h-4z"
            fill={p.center}
          />
        </>
      )}
      {variant === 2 && (
        <>
          <path
            d="M26 0h12v7H26zM26 27h12v7H26zM15 11h8v12h-8zM41 11h8v12h-8zM19 4h9v9h-9zM36 4h9v9h-9zM19 22h9v9h-9zM36 22h9v9h-9z"
            fill={p.flower}
          />
          <path d="M25 7h14v4h4v13h-4v4H25v-4h-4V11h4z" fill={p.center} />
          <path d="M26 11h4v4h-4zM34 17h4v4h-4zM26 22h4v3h-4z" fill="#e39439" />
        </>
      )}
      {variant === 3 && (
        <>
          <path
            d="M31 3h4v29h-4zM22 6h9v4h-9zM35 14h9v4h-9zM20 22h11v4H20z"
            fill={p.dark}
          />
          <path
            d="M19 8h8v5h3v8H16v-8h3zM40 16h8v5h3v8H37v-8h3zM17 24h8v5h3v8H14v-8h3z"
            fill={p.flower}
          />
          <path
            d="M19 10h3v7h-3zM40 18h3v7h-3zM17 26h3v7h-3zM16 20h14v3H16zM37 28h14v3H37zM14 36h14v3H14z"
            fill={p.center}
          />
        </>
      )}
      {variant === 4 && (
        <>
          <path d="M22 5h9v-3h10v6h6v15h-6v7H25v-5h-7V11h4z" fill={p.flower} />
          <path
            d="M25 7h13v4H25zM22 11h5v10h-5zM27 21h13v5H27zM38 11h5v10h-5z"
            fill="#e7407e"
          />
          <path
            d="M28 11h10v4H28zM28 15h4v6h-4zM32 17h6v4h-6zM22 5h7v3h-7z"
            fill={p.center}
          />
          <path d="M25 29h15l-7 7z" fill={p.dark} />
        </>
      )}
    </g>
  );
}

export function PixelPlant({
  variant = 0,
  stage = fullBloomStage,
  className = "",
}: {
  variant?: number;
  stage?: number;
  className?: string;
}) {
  const species =
    ((variant % palettes.length) + palettes.length) % palettes.length;
  const p = palettes[species]!;
  const growth = Math.min(fullBloomStage, Math.max(0, Math.floor(stage)));
  const stemTop = growth < 2 ? 53 : Math.max(22, 52 - (growth - 1) * 5);
  return (
    <svg
      className={cn("pixel-plant", className)}
      viewBox="0 0 64 84"
      fill="none"
      aria-hidden="true"
      shapeRendering="crispEdges"
      data-growth-stage={growth}
      data-species={species}
      data-growth-name={growthStages[growth]}
    >
      <path d="M12 77h41v3H12z" fill={p.dark} opacity=".2" />
      <path d="M21 59h24v5h-3v13H24V64h-3z" fill={p.pot} />
      <path d="M20 58h26v6H20z" fill={p.rim} />
      <path d="M24 58h18v3H24z" fill="#573929" />
      <path d="M26 65h4v9h-4z" fill="#fff" opacity=".2" />
      {growth <= 1 && (
        <path
          d={growth === 0 ? "M29 55h7v4h-7z" : "M28 53h5v3h4v3h-9z"}
          fill={growth === 0 ? "#f0c284" : p.light}
        />
      )}
      {growth >= 1 && (
        <path d="M31 59h3v6h-3zM34 63h3v4h-3z" fill="#ffe2ab" opacity=".65" />
      )}
      {growth >= 2 && (
        <path d={`M31 ${stemTop}h4v${59 - stemTop}h-4z`} fill={p.dark} />
      )}
      {growth >= 3 && <path d="M25 48h6v4h-6zM35 44h6v4h-6z" fill={p.light} />}
      {growth >= 4 && <path d="M19 42h9v4h5v7h-9v-4h-5z" fill={p.leaf} />}
      {growth >= 5 && <path d="M35 35h9v-5h7v8h-5v6H35z" fill={p.light} />}
      {growth >= 6 && <path d="M19 29h8v4h6v8h-8v-5h-6z" fill={p.leaf} />}
      {growth >= 7 && <path d="M35 25h8v-5h6v9h-6v5h-8z" fill={p.dark} />}
      {growth >= 8 && growth < 10 && (
        <>
          <path d="M28 15h9v5h3v8h-3v5h-9v-5h-3v-8h3z" fill={p.leaf} />
          <path
            d={growth === 8 ? "M30 17h5v8h-5z" : "M28 14h9v13h-9z"}
            fill={growth === 8 ? p.light : p.flower}
          />
          {growth === 9 && <path d="M30 14h4v7h-4z" fill={p.center} />}
        </>
      )}
      {growth >= 10 && <FlowerHead variant={species} opening={growth === 10} />}
      {growth === fullBloomStage && (
        <>
          <path d="M7 17h3v3H7zM52 41h3v3h-3z" fill={p.center} />
          <path d="M51 7h2v2h2v2h-2v2h-2v-2h-2V9h2z" fill={p.flower} />
        </>
      )}
    </svg>
  );
}
