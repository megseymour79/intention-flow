import { useMemo } from "react";

interface SkyStar {
  left: string;
  top: string;
  delay: string;
  duration: string;
  size: number;
  bright: boolean;
  blue: boolean;
}

interface Wisp {
  left: string;
  delay: string;
  duration: string;
  size: number;
  hue: string;
  opacity: number;
}

interface PageComet {
  top: string;
  delay: string;
  duration: string;
  size: number;
  tilt: number;
  silver: boolean;
}

// Deterministic pseudo-random so the sky is stable across renders
function seeded(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const WISP_HUES = [
  "rgba(167,139,250,", // violet
  "rgba(125,211,252,", // sky
  "rgba(251,191,36,", // gold
  "rgba(244,164,255,", // orchid
];

/* A tiny spiral galaxy — two blurred conic arms on a bright core, turning once
   every few minutes. Sits high in the zenith where nothing competes with it. */
function Galaxy() {
  return (
    <div
      aria-hidden
      className="animate-planet-drift pointer-events-none absolute left-[7%] top-[16%]"
      style={{ animationDuration: "26s" }}
    >
      {/* the turning disc */}
      <div
        className="animate-galaxy-swirl relative h-40 w-40 rounded-full"
        style={{
          background:
            "conic-gradient(from 20deg, transparent 0deg, rgba(196,181,253,0.10) 60deg, rgba(255,244,214,0.16) 110deg, rgba(147,197,253,0.07) 180deg, transparent 240deg, rgba(196,181,253,0.09) 320deg, transparent 360deg)",
          filter: "blur(5px)",
        }}
      />
      {/* the bright core, slightly off-axis like a real barred spiral */}
      <div
        className="animate-nebula-pulse absolute left-1/2 top-1/2 h-8 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at 40% 45%, rgba(255,250,225,0.85) 0%, rgba(255,238,190,0.35) 45%, transparent 75%)",
          boxShadow: "0 0 28px 8px rgba(255,240,200,0.2)",
        }}
      />
    </div>
  );
}

/* A ringed sentinel planet — softly banded, tilted ring catching the light. */
function RingedPlanet() {
  return (
    <div
      aria-hidden
      className="animate-planet-drift pointer-events-none absolute right-[10%] top-[30%]"
      style={{ animationDuration: "34s" }}
    >
      <div className="relative h-16 w-16">
        {/* the planet: a dusk-lit marble */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 34% 30%, #f2d8a8 0%, #c98d4e 38%, #7a4a26 72%, #3c2413 100%)",
            boxShadow:
              "0 0 18px 3px rgba(230,170,110,0.22), inset -6px -6px 14px rgba(0,0,10,0.55)",
          }}
        />
        {/* faint latitudinal bands */}
        <div
          className="absolute inset-0 rounded-full opacity-50"
          style={{
            background:
              "repeating-linear-gradient(172deg, transparent 0 5px, rgba(255,235,200,0.10) 5px 7px, transparent 7px 12px)",
          }}
        />
        {/* the ring, drawn as a squashed ellipse slicing behind the globe */}
        <div
          className="absolute left-1/2 top-1/2 h-[46px] w-[92px] -translate-x-1/2 -translate-y-1/2 rotate-[-16deg] rounded-[50%]"
          style={{
            border: "2.5px solid rgba(240,220,180,0.4)",
            boxShadow:
              "0 0 10px rgba(240,220,180,0.18), inset 0 0 8px rgba(240,220,180,0.12)",
            clipPath:
              "polygon(0 0, 100% 0, 100% 100%, 100% 100%, 0 100%, 0 50%)",
          }}
        />
        {/* the front half of the ring, above the planet so it reads as passing in front */}
        <div
          className="absolute left-1/2 top-1/2 h-[46px] w-[92px] -translate-x-1/2 -translate-y-1/2 rotate-[-16deg] rounded-[50%]"
          style={{
            border: "2.5px solid rgba(250,235,200,0.65)",
            clipPath: "polygon(0 50%, 100% 50%, 100% 100%, 0 100%)",
          }}
        />
      </div>
    </div>
  );
}

/* A crisp crescent moon — the lit sliver of a shadowed disc. */
function CrescentMoon() {
  return (
    <div
      aria-hidden
      className="animate-floaty pointer-events-none absolute right-[24%] top-[9%]"
      style={{ animationDuration: "11s" }}
    >
      <div
        className="relative h-10 w-10 overflow-hidden rounded-full"
        style={{
          boxShadow: "0 0 16px 3px rgba(235,232,210,0.22)",
        }}
      >
        {/* the shadowed disc */}
        <div className="absolute inset-0 rounded-full bg-[#0a0f1e]" />
        {/* the lit crescent: an offset lit disc bleeding in */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 72% 40%, #fdf9ea 0%, #e8e0c2 34%, transparent 62%)",
          }}
        />
      </div>
    </div>
  );
}

/* A far blue ice giant — small, dim, patient. */
function DistantPlanet() {
  return (
    <div
      aria-hidden
      className="animate-planet-drift pointer-events-none absolute left-[26%] top-[42%]"
      style={{ animationDuration: "40s" }}
    >
      <div
        className="h-6 w-6 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 36% 32%, #bfe3f2 0%, #6fa7c9 45%, #2f5d7c 80%, #1b3a52 100%)",
          boxShadow:
            "0 0 12px 2px rgba(140,190,220,0.25), inset -3px -3px 8px rgba(0,0,15,0.5)",
        }}
      />
    </div>
  );
}

/**
 * The mystical night sky behind every page: a deep zenith easing to a lighter
 * horizon, a slowly turning spiral galaxy, a ringed planet and a distant ice
 * giant, a crisp crescent moon, drifting starlight wisps, and the occasional
 * silver-and-gold comet crossing the whole sky.
 */
export function FloatingBackground({ count = 18 }: { count?: number }) {
  const stars = useMemo<SkyStar[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${(seeded(i, 1) * 96 + 2).toFixed(2)}%`,
        top: `${(seeded(i, 2) * 88 + 2).toFixed(2)}%`,
        delay: `${(seeded(i, 3) * 9).toFixed(2)}s`,
        duration: `${(4 + seeded(i, 4) * 7).toFixed(2)}s`,
        size: 1 + seeded(i, 5) * 1.8,
        bright: seeded(i, 6) > 0.82,
        blue: seeded(i, 7) > 0.25,
      })),
    [count],
  );

  const wisps = useMemo<Wisp[]>(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        left: `${(seeded(i, 81) * 92 + 4).toFixed(1)}%`,
        delay: `${(seeded(i, 82) * 46).toFixed(1)}s`,
        duration: `${(44 + seeded(i, 83) * 30).toFixed(1)}s`,
        size: 2 + seeded(i, 84) * 2.4,
        hue: WISP_HUES[i % WISP_HUES.length],
        opacity: 0.28 + seeded(i, 85) * 0.3,
      })),
    [],
  );

  const comets = useMemo<PageComet[]>(
    () =>
      Array.from({ length: 3 }, (_, i) => ({
        top: `${(seeded(i, 91) * 30 + 4).toFixed(1)}%`,
        delay: `${(18 + seeded(i, 92) * 52).toFixed(1)}s`,
        duration: `${(24 + seeded(i, 93) * 14).toFixed(1)}s`,
        size: 1.4 + seeded(i, 94) * 1.2,
        tilt: 10 + seeded(i, 95) * 10,
        silver: seeded(i, 96) > 0.5,
      })),
    [],
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Sky base — deep zenith, easing through dusk to a lighter horizon */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #03050e 0%, #050a1c 32%, #0a1631 58%, #122142 80%, #1d3358 93%, #27406b 100%)",
        }}
      />

      <Galaxy />
      <RingedPlanet />
      <CrescentMoon />
      <DistantPlanet />

      {/* Milky Way band — unresolved starlight across the upper sky */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(140% 55% at 72% -12%, rgba(190,200,225,0.055) 0%, rgba(190,200,225,0.022) 38%, transparent 65%)",
        }}
      />

      {/* Rising starlight wisps — motes of colored light climbing the sky */}
      {wisps.map((w, i) => (
        <span
          key={`wisp-${i}`}
          className="animate-wisp-rise absolute rounded-full"
          style={{
            left: w.left,
            top: "100%",
            width: w.size,
            height: w.size,
            background: `${w.hue}${w.opacity.toFixed(2)})`,
            boxShadow: `0 0 ${w.size * 3}px 1px ${w.hue}${(w.opacity * 0.7).toFixed(2)})`,
            animationDelay: w.delay,
            animationDuration: w.duration,
            ["--wisp-opacity" as string]: w.opacity,
          }}
        />
      ))}

      {/* Horizon airglow — the faint light band a dark sky shows at ground level */}
      <div
        className="absolute inset-x-0 bottom-0 h-[28%]"
        style={{
          background:
            "linear-gradient(to top, rgba(28,42,66,0.55) 0%, rgba(20,32,52,0.22) 45%, transparent 100%)",
        }}
      />

      {/* Stars — three depth layers; smaller = farther */}
      {stars.map((s, i) => {
        const color = s.blue
          ? "rgba(214,226,255,"
          : "rgba(255,244,224,";
        return (
          <span
            key={`star-${i}`}
            className={`absolute rounded-full ${s.bright ? "animate-twinkle" : ""}`}
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              background: `${color}${s.bright ? 0.95 : 0.5})`,
              boxShadow: s.bright
                ? `0 0 ${s.size * 3}px 1px ${color}0.35)`
                : undefined,
              animationDelay: s.delay,
              animationDuration: s.duration,
            }}
          />
        );
      })}

      {/* Comets — long-tailed travelers crossing the sky every minute or so */}
      {comets.map((c, i) => (
        <div
          key={`comet-${i}`}
          className="animate-comet-drift absolute"
          style={{
            left: "105vw",
            top: c.top,
            animationDelay: c.delay,
            animationDuration: c.duration,
            ["--drift-tilt" as string]: `${c.tilt}deg`,
          }}
        >
          <span
            className="block rounded-full"
            style={{
              width: c.size,
              height: c.size,
              background: c.silver ? "#eef3ff" : "#fff3cf",
              boxShadow: c.silver
                ? "0 0 10px 2px rgba(220,232,255,0.8), 0 0 24px 6px rgba(190,210,255,0.3)"
                : "0 0 10px 2px rgba(255,235,170,0.8), 0 0 24px 6px rgba(255,215,130,0.3)",
            }}
          />
        </div>
      ))}
    </div>
  );
}
