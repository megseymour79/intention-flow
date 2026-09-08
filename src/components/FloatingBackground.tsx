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

interface Cloud {
  top: string;
  delay: string;
  duration: string;
  scale: number;
  opacity: number;
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
      className="animate-planet-drift pointer-events-none absolute left-[6%] top-[10%]"
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
      className="animate-planet-drift pointer-events-none absolute right-[8%] top-[12%]"
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
        {/* the ring: back half behind the globe */}
        <div
          className="absolute left-1/2 top-1/2 h-[46px] w-[92px] -translate-x-1/2 -translate-y-1/2 rotate-[-16deg] rounded-[50%]"
          style={{
            border: "2.5px solid rgba(240,220,180,0.4)",
            clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)",
          }}
        />
        {/* front half of the ring, drawn over the planet */}
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
      className="animate-floaty pointer-events-none absolute right-[26%] top-[40%]"
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
      className="animate-planet-drift pointer-events-none absolute left-[30%] top-[8%]"
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

/* A hot-air lantern balloon floating up through the dusk with a swaying glow. */
function Lantern() {
  return (
    <div
      aria-hidden
      className="animate-lantern-rise pointer-events-none absolute bottom-0 left-[64%] z-[1]"
      style={{ animationDelay: "14s", animationDuration: "46s" }}
    >
      <div
        className="animate-sway relative h-12 w-8 rounded-[45%]"
        style={{
          background:
            "radial-gradient(circle at 40% 34%, #fff4c8 0%, #ffcf6e 40%, #d98a3a 78%, #8a4d1e 100%)",
          boxShadow:
            "0 0 22px 6px rgba(255,190,90,0.35), 0 0 48px 14px rgba(255,170,70,0.12)",
          animationDuration: "3.6s",
        }}
      >
        <span
          className="absolute bottom-1 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full"
          style={{ background: "rgba(120,60,20,0.8)" }}
        />
      </div>
    </div>
  );
}

/* A soft cloud puff — several overlapping discs, drifting the whole way. */
function CloudPuff({
  scale,
  opacity,
  delay,
  duration,
  top,
}: {
  scale: number;
  opacity: number;
  delay: string;
  duration: string;
  top: string;
}) {
  const w = 140 * scale;
  const h = 44 * scale;
  return (
    <div
      aria-hidden
      className="animate-cloud-drift pointer-events-none absolute z-[1]"
      style={{ top, animationDelay: delay, animationDuration: duration }}
    >
      <div className="animate-cloud-breathe relative" style={{ width: w, height: h, animationDuration: `${6 + scale * 4}s`, opacity }}>
        <span className="absolute left-0 top-1/3 h-2/3 w-2/5 rounded-full bg-[#cdd6ee]" />
        <span className="absolute left-1/5 top-0 h-full w-1/2 rounded-full bg-[#dfe6f7]" />
        <span className="absolute left-1/2 top-1/4 h-3/4 w-2/5 rounded-full bg-[#c3cde8]" />
        <span className="absolute inset-x-0 bottom-0 h-1/3 rounded-full bg-[#9aa8cd]" />
      </div>
    </div>
  );
}

/**
 * The mystical night sky behind every page: a vivid twilight gradient from
 * deep space to rose dusk, a turning spiral galaxy, ringed and ice planets,
 * a crescent moon, drifting starlit clouds, rising wisps and a floating
 * lantern, and a steady parade of comets.
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
      Array.from({ length: 6 }, (_, i) => ({
        top: `${(seeded(i, 91) * 34 + 2).toFixed(1)}%`,
        delay: `${(seeded(i, 92) * 40).toFixed(1)}s`,
        duration: `${(16 + seeded(i, 93) * 10).toFixed(1)}s`,
        size: 1.4 + seeded(i, 94) * 1.4,
        tilt: 10 + seeded(i, 95) * 10,
        silver: seeded(i, 96) > 0.5,
      })),
    [],
  );

  const clouds = useMemo<Cloud[]>(
    () =>
      Array.from({ length: 4 }, (_, i) => ({
        top: `${(18 + seeded(i, 61) * 45).toFixed(0)}%`,
        delay: `${(seeded(i, 62) * 90).toFixed(0)}s`,
        duration: `${(110 + seeded(i, 63) * 70).toFixed(0)}s`,
        scale: 0.7 + seeded(i, 64) * 0.9,
        opacity: 0.16 + seeded(i, 65) * 0.12,
      })),
    [],
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Sky base — deep space easing through royal blue into rose dusk */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #020309 0%, #071130 34%, #14295c 58%, #2c4a8f 78%, #46639f 89%, #6f6a9e 96%, #8a6f93 100%)",
        }}
      />

      {/* vivid dusk bloom along the horizon */}
      <div
        className="absolute inset-x-0 bottom-0 h-[36%]"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 118%, rgba(255,163,102,0.28) 0%, rgba(196,110,150,0.16) 42%, transparent 75%)",
        }}
      />

      <Galaxy />
      <RingedPlanet />
      <CrescentMoon />
      <DistantPlanet />
      <Lantern />

      {/* Milky Way band — unresolved starlight across the upper sky */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(140% 55% at 72% -12%, rgba(190,200,225,0.055) 0%, rgba(190,200,225,0.022) 38%, transparent 65%)",
        }}
      />

      {/* Starlit clouds drifting across the whole sky */}
      {clouds.map((c, i) => (
        <CloudPuff
          key={`cloud-${i}`}
          scale={c.scale}
          opacity={c.opacity}
          delay={c.delay}
          duration={c.duration}
          top={c.top}
        />
      ))}

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

      {/* Comets — silver and gold travelers crossing the sky every few seconds */}
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
