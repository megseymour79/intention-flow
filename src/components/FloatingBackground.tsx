import { useMemo } from "react";

/* Deterministic pseudo-random so the sky is stable across renders */
function seeded(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

interface GlowMote {
  left: string;
  top: string;
  delay: string;
  duration: string;
  size: number;
  bright: boolean;
  teal: boolean;
}

interface Firefly {
  left: string;
  delay: string;
  duration: string;
  size: number;
  hue: string;
  opacity: number;
}

interface MistBank {
  top: string;
  delay: string;
  duration: string;
  scale: number;
  opacity: number;
}

const FIREFLY_HUES = [
  "rgba(126,231,135,", // aurora green
  "rgba(103,232,249,", // bioluminescent cyan
  "rgba(196,181,253,", // aurora violet
  "rgba(253,224,71,", // rare gold spore
];

/* ------------------------------------------------------------------ */
/* Lagoon atmosphere — soft light, never harsh                          */
/* ------------------------------------------------------------------ */

/**
 * Aurora ribbons: three layered translucent arcs that shimmer slowly.
 * Built as skewed gradient sheets, blurred, so they read as curtains of
 * light rather than shapes. Pure CSS — no images, GPU-cheap.
 */
function AuroraRibbons() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-[62%] overflow-hidden"
    >
      {/* primary curtain — green heart */}
      <div
        className="animate-aurora-sway absolute"
        style={{
          left: "-18%",
          top: "-14%",
          width: "80%",
          height: "78%",
          background:
            "linear-gradient(168deg, transparent 18%, rgba(110,231,183,0.14) 38%, rgba(56,189,248,0.11) 56%, transparent 78%)",
          filter: "blur(26px)",
          ["--sway-tilt" as string]: "-6deg",
          animationDuration: "17s",
        }}
      />
      {/* secondary curtain — cyan, crossing the first */}
      <div
        className="animate-aurora-sway absolute"
        style={{
          left: "30%",
          top: "-8%",
          width: "72%",
          height: "70%",
          background:
            "linear-gradient(196deg, transparent 22%, rgba(103,232,249,0.13) 42%, rgba(167,139,250,0.09) 62%, transparent 82%)",
          filter: "blur(30px)",
          ["--sway-tilt" as string]: "5deg",
          animationDuration: "23s",
          animationDelay: "-8s",
        }}
      />
      {/* high violet veil — slow, barely there */}
      <div
        className="animate-aurora-sway absolute"
        style={{
          left: "4%",
          top: "-20%",
          width: "90%",
          height: "60%",
          background:
            "linear-gradient(178deg, transparent 30%, rgba(167,139,250,0.08) 50%, transparent 70%)",
          filter: "blur(34px)",
          ["--sway-tilt" as string]: "-2deg",
          animationDuration: "31s",
          animationDelay: "-16s",
        }}
      />
    </div>
  );
}

/** The low glow of the lagoon itself, breathing at the horizon. */
function LagoonGlow() {
  return (
    <>
      <div
        aria-hidden
        className="animate-lagoon-breathe absolute inset-x-0 bottom-0 h-[34%]"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 128%, rgba(110,231,183,0.20) 0%, rgba(56,189,248,0.10) 42%, transparent 74%)",
          animationDuration: "11s",
        }}
      />
      <div
        aria-hidden
        className="animate-lagoon-breathe absolute inset-x-0 bottom-0 h-[22%]"
        style={{
          background:
            "radial-gradient(110% 90% at 22% 124%, rgba(167,139,250,0.10) 0%, transparent 66%)",
          animationDuration: "14s",
          animationDelay: "-5s",
        }}
      />
    </>
  );
}

/**
 * Layered ridgelines along the bottom — dawn silhouettes across the far
 * shore of the lagoon, with aerial perspective (nearer = darker, cooler).
 */
function ShoreRidges() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0">
      {/* far shore — pale teal, dissolved in mist */}
      <svg
        className="absolute inset-x-0 bottom-0 w-full"
        viewBox="0 0 1440 180"
        preserveAspectRatio="none"
        style={{ height: "15vh" }}
      >
        <path
          d="M0,118 L96,86 L178,106 L262,68 L344,100 L432,74 L522,96 L612,60 L702,88 L792,64 L882,92 L972,72 L1062,98 L1152,76 L1242,94 L1332,70 L1440,92 L1440,180 L0,180 Z"
          fill="rgba(110,231,183,0.16)"
        />
      </svg>
      {/* mid ridge — deeper teal */}
      <svg
        className="absolute inset-x-0 bottom-0 w-full"
        viewBox="0 0 1440 150"
        preserveAspectRatio="none"
        style={{ height: "11vh" }}
      >
        <path
          d="M0,108 L120,74 L222,98 L332,60 L442,92 L552,66 L662,90 L772,54 L882,84 L992,62 L1102,88 L1212,68 L1322,92 L1440,74 L1440,150 L0,150 Z"
          fill="rgba(20,85,90,0.42)"
        />
      </svg>
      {/* near shore — dark ink, closest to the viewer */}
      <svg
        className="absolute inset-x-0 bottom-0 w-full"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        style={{ height: "7vh" }}
      >
        <path
          d="M0,82 L112,54 L212,76 L322,42 L432,68 L542,46 L652,70 L762,38 L872,62 L982,44 L1092,66 L1202,48 L1312,70 L1440,56 L1440,120 L0,120 Z"
          fill="rgba(5,15,25,0.66)"
        />
      </svg>
    </div>
  );
}

/**
 * Drifting mist banks over the water — the old CloudHaze body, recolored
 * to lagoon tones and kept slow.
 */
function MistBank({
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
  return (
    <div
      aria-hidden
      className="animate-cloud-drift pointer-events-none absolute z-[1]"
      style={{ top, animationDelay: delay, animationDuration: duration }}
    >
      <div
        className="animate-cloud-breathe relative"
        style={{
          width: 340 * scale,
          height: 58 * scale,
          opacity,
          animationDuration: `${9 + scale * 5}s`,
          background:
            "radial-gradient(50% 60% at 35% 55%, rgba(154,230,215,0.5) 0%, rgba(154,230,215,0.2) 55%, transparent 100%)," +
            "radial-gradient(45% 55% at 68% 40%, rgba(180,220,235,0.35) 0%, transparent 90%)",
          filter: "blur(6px)",
        }}
      />
    </div>
  );
}

/** A puffy mist clump built from stacked radial lobes. */
function MistClump({ scale }: { scale: number }) {
  const w = 210 * scale;
  const h = 64 * scale;
  const lobe = (
    left: number,
    bottom: number,
    lw: number,
    lh: number,
    a: number,
  ) => (
    <span
      className="absolute rounded-full"
      style={{
        left,
        bottom,
        width: lw,
        height: lh,
        background: `radial-gradient(circle at 42% 38%, rgba(214,244,236,${a}) 0%, rgba(180,226,214,${a * 0.72}) 55%, rgba(150,210,196,0) 100%)`,
        filter: "blur(1.5px)",
      }}
    />
  );
  return (
    <span aria-hidden className="relative block" style={{ width: w, height: h }}>
      {lobe(0, 0, w * 0.62, h * 0.78, 0.85)}
      {lobe(w * 0.3, h * 0.12, w * 0.55, h * 0.88, 0.9)}
      {lobe(w * 0.58, 0, w * 0.42, h * 0.7, 0.78)}
      {/* aquamarine underlit base, like light from the water below */}
      <span
        className="absolute inset-x-1 bottom-0 h-[30%]"
        style={{
          background:
            "linear-gradient(to top, rgba(103,232,249,0.28) 0%, transparent 100%)",
          filter: "blur(4px)",
        }}
      />
    </span>
  );
}

/**
 * The bioluminescent lagoon behind every page: a deep night-teal gradient,
 * three aurora ribbons shimmering overhead, the lagoon's own glow breathing
 * at the horizon, dawn-silhouette shore ridges, drifting mist banks and
 * clumps, glow motes where stars used to be, and firefly spores rising from
 * the water. Everything tuned to read as depth behind content — never over
 * the words.
 */
export function FloatingBackground({ count = 18 }: { count?: number }) {
  const motes = useMemo<GlowMote[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${(seeded(i, 1) * 96 + 2).toFixed(2)}%`,
        top: `${(seeded(i, 2) * 88 + 2).toFixed(2)}%`,
        delay: `${(seeded(i, 3) * 9).toFixed(2)}s`,
        duration: `${(4 + seeded(i, 4) * 7).toFixed(2)}s`,
        size: 1 + seeded(i, 5) * 1.8,
        bright: seeded(i, 6) > 0.82,
        teal: seeded(i, 7) > 0.25,
      })),
    [count],
  );

  const fireflies = useMemo<Firefly[]>(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        left: `${(seeded(i, 81) * 92 + 4).toFixed(1)}%`,
        delay: `${(seeded(i, 82) * 46).toFixed(1)}s`,
        duration: `${(44 + seeded(i, 83) * 30).toFixed(1)}s`,
        size: 2 + seeded(i, 84) * 2.4,
        hue: FIREFLY_HUES[i % FIREFLY_HUES.length],
        opacity: 0.14 + seeded(i, 85) * 0.12,
      })),
    [],
  );

  const mists = useMemo<MistBank[]>(
    () =>
      Array.from({ length: 3 }, (_, i) => ({
        top: `${(16 + seeded(i, 61) * 28).toFixed(0)}%`,
        delay: `${(seeded(i, 62) * 90).toFixed(0)}s`,
        duration: `${(110 + seeded(i, 63) * 70).toFixed(0)}s`,
        scale: 0.9 + seeded(i, 64) * 0.5,
        opacity: 0.05 + seeded(i, 65) * 0.04,
      })),
    [],
  );

  const clumps = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => ({
        left: `${(seeded(i, 51) * 90 + 2).toFixed(1)}%`,
        top: `${(30 + seeded(i, 52) * 34).toFixed(1)}%`,
        scale: 0.8 + seeded(i, 53) * 0.7,
        delay: `${(seeded(i, 54) * 8).toFixed(1)}s`,
        duration: `${(26 + seeded(i, 55) * 22).toFixed(1)}s`,
      })),
    [],
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Water-sky base — deep night teal surface → aurora band → luminous
          lagoon horizon. Same stops as .sky-gradient, kept in parity. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #06131f 0%, #0a2233 16%, #0e3543 32%, #14555a 48%, #1c7a63 64%, #2aa27c 80%, #4dbd95 92%, #7fd8c4 100%)",
        }}
      />

      {/* gentle vignette — just enough to frame */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 42%, transparent 62%, rgba(4,14,22,0.18) 100%)",
        }}
      />

      <AuroraRibbons />
      <LagoonGlow />

      <ShoreRidges />

      {/* Drifting mist banks across the whole sky */}
      {mists.map((m, i) => (
        <MistBank
          key={`mist-${i}`}
          scale={m.scale}
          opacity={m.opacity}
          delay={m.delay}
          duration={m.duration}
          top={m.top}
        />
      ))}

      {/* Floating mist clumps on their own slow paths */}
      {clumps.map((c, i) => (
        <div
          key={`clump-${i}`}
          className="animate-planet-drift absolute"
          style={{
            left: c.left,
            top: c.top,
            animationDelay: c.delay,
            animationDuration: c.duration,
          }}
        >
          <MistClump scale={c.scale} />
        </div>
      ))}

      {/* Rising firefly spores — bioluminescent flecks climbing from the
          water into the night */}
      {fireflies.map((f, i) => (
        <span
          key={`firefly-${i}`}
          className="animate-wisp-rise absolute rounded-full"
          style={{
            left: f.left,
            top: "100%",
            width: f.size,
            height: f.size,
            background: `${f.hue}${f.opacity.toFixed(2)})`,
            boxShadow: `0 0 ${f.size * 3}px 1px ${f.hue}${(f.opacity * 0.7).toFixed(2)})`,
            animationDelay: f.delay,
            animationDuration: f.duration,
            ["--wisp-opacity" as string]: f.opacity,
          }}
        />
      ))}

      {/* Glow motes — still water catches light; brighter ones gently
          shimmer where stars used to be */}
      {motes.map((m, i) => {
        const color = m.teal
          ? "rgba(186,244,222,"
          : "rgba(224,242,254,";
        return (
          <span
            key={`mote-${i}`}
            className={`absolute rounded-full ${m.bright ? "animate-twinkle" : ""}`}
            style={{
              left: m.left,
              top: m.top,
              width: m.size,
              height: m.size,
              background: `${color}${m.bright ? 0.9 : 0.45})`,
              boxShadow: m.bright
                ? `0 0 ${m.size * 3}px 1px ${color}0.35)`
                : undefined,
              animationDelay: m.delay,
              animationDuration: m.duration,
            }}
          />
        );
      })}
    </div>
  );
}
