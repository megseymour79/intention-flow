import { useMemo } from "react";

/* Deterministic pseudo-random so the sky is stable across renders */
function seeded(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

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

interface Contrail {
  top: string;
  delay: string;
  duration: string;
  scale: number;
  opacity: number;
  silver: boolean;
}

const WISP_HUES = [
  "rgba(251,191,36,", // gold — lantern / firefly warmth
  "rgba(253,224,71,", // sunbeam
  "rgba(255,237,213,", // peach haze
  "rgba(196,181,253,", // dusk violet — echoes the sky's top
];

/* ------------------------------------------------------------------ */
/* Travel sky — photographic, never cartoonish                          */
/* ------------------------------------------------------------------ */

/** A low sun sitting on the horizon, half-hazed by atmosphere. */
function LowSun() {
  return (
    <div
      aria-hidden
      className="animate-planet-drift pointer-events-none absolute top-[74%]"
      // Centered by left-offset (not -translate-x-1/2): the drift animation
      // animates `transform` and would override a translate-based centering.
      style={{ left: "calc(50% - 5rem)", animationDuration: "52s" }}
    >
      <div className="relative h-40 w-40">
        {/* atmospheric halo around the disc */}
        <div
          className="absolute -inset-16 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,214,150,0.30) 0%, rgba(255,190,130,0.12) 45%, transparent 72%)",
            filter: "blur(6px)",
          }}
        />
        <div
          className="absolute inset-6 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 42% 38%, #fff3d6 0%, #ffdc9a 45%, #f5b45f 80%, #e8964a 100%)",
            boxShadow: "0 0 42px 12px rgba(255,205,130,0.35)",
          }}
        />
      </div>
    </div>
  );
}

/**
 * Layered mountain ridges along the bottom — a ridgeline silhouette with
 * aerial perspective (nearer = darker). SVG paths, no images needed.
 */
function MountainRidges() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0"
    >
      {/* far ridge — pale, dissolved in haze */}
      <svg
        className="absolute inset-x-0 bottom-0 w-full"
        viewBox="0 0 1440 180"
        preserveAspectRatio="none"
        style={{ height: "16vh" }}
      >
        <path
          d="M0,120 L90,84 L170,108 L260,66 L340,102 L430,72 L520,96 L610,58 L700,88 L790,62 L880,92 L970,70 L1060,98 L1150,74 L1240,94 L1330,68 L1440,90 L1440,180 L0,180 Z"
          fill="rgba(255,214,170,0.28)"
        />
      </svg>
      {/* mid ridge — warmer, stronger */}
      <svg
        className="absolute inset-x-0 bottom-0 w-full"
        viewBox="0 0 1440 150"
        preserveAspectRatio="none"
        style={{ height: "12vh" }}
      >
        <path
          d="M0,110 L120,72 L220,98 L330,58 L440,92 L550,64 L660,90 L770,52 L880,84 L990,60 L1100,88 L1210,66 L1320,92 L1440,72 L1440,150 L0,150 Z"
          fill="rgba(196,124,88,0.42)"
        />
      </svg>
      {/* near ridge — dark plum, closest to the viewer */}
      <svg
        className="absolute inset-x-0 bottom-0 w-full"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        style={{ height: "8vh" }}
      >
        <path
          d="M0,84 L110,52 L210,76 L320,40 L430,68 L540,44 L650,70 L760,36 L870,62 L980,42 L1090,66 L1200,46 L1310,70 L1440,54 L1440,120 L0,120 Z"
          fill="rgba(66,38,66,0.55)"
        />
      </svg>
    </div>
  );
}

/** A contrail: bright needle nose, tapered fading tail, soft bloom. */
function Contrail({ silver, scale }: { silver: boolean; scale: number }) {
  const body = silver
    ? "linear-gradient(to right, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.75) 6%, rgba(255,240,220,0.4) 40%, rgba(255,225,200,0.14) 70%, transparent 100%)"
    : "linear-gradient(to right, rgba(255,236,210,0.95) 0%, rgba(255,236,210,0.7) 6%, rgba(250,220,190,0.36) 40%, rgba(245,210,180,0.12) 70%, transparent 100%)";
  const bloom = silver ? "rgba(255,255,255,0.55)" : "rgba(255,230,190,0.55)";
  return (
    <span
      aria-hidden
      className="relative block"
      style={{ width: 150 * scale, height: 14 }}
    >
      {/* trailing line, thickening blur behind the nose */}
      <span
        className="absolute right-0 top-1/2 block h-[2.5px] w-full -translate-y-1/2 rounded-full"
        style={{ background: body, filter: "blur(0.4px)" }}
      />
      <span
        className="absolute right-0 top-1/2 block h-[8px] w-[45%] -translate-y-1/2 rounded-full"
        style={{ background: body, filter: "blur(4px)", opacity: 0.6 }}
      />
      {/* the glinting nose */}
      <span
        className="absolute right-0 top-1/2 block -translate-y-1/2 rounded-full"
        style={{
          width: 7 * scale,
          height: 7 * scale,
          background: "#fff",
          boxShadow: `0 0 10px 3px ${bloom}, 0 0 26px 9px rgba(255,255,255,0.14)`,
        }}
      />
    </span>
  );
}

/** A small flock of birds — chevron strokes with a flap keyframe. */
function BirdFlock({ flip }: { flip: boolean }) {
  const bird = (x: number, y: number, s: number, k: string) => (
    <svg
      key={k}
      width={22 * s}
      height={10 * s}
      viewBox="0 0 22 10"
      className="animate-bird-flap absolute"
      style={{ left: x, top: y }}
    >
      <path
        d="M1 6 Q6 1 11 6 Q16 1 21 6"
        fill="none"
        stroke="rgba(60,40,56,0.65)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
  // The flip lives on this wrapper: the birds' flap animation animates
  // `transform`, which would override an inline transform on the same node.
  return (
    <span
      aria-hidden
      className="relative block h-12 w-24"
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
    >
      {bird(0, 14, 1, "b1")}
      {bird(26, 4, 0.9, "b2")}
      {bird(50, 16, 1.05, "b3")}
      {bird(74, 6, 0.85, "b4")}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Ambient haze — barely-there vapor                                    */
/* ------------------------------------------------------------------ */

function CloudHaze({
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
            "radial-gradient(50% 60% at 35% 55%, rgba(255,214,190,0.6) 0%, rgba(255,206,190,0.24) 55%, transparent 100%)," +
            "radial-gradient(45% 55% at 68% 40%, rgba(255,226,206,0.45) 0%, transparent 90%)",
          filter: "blur(6px)",
        }}
      />
    </div>
  );
}

/** A puffy cumulus built from stacked radial lobes. */
function Cumulus({ scale }: { scale: number }) {
  const w = 210 * scale;
  const h = 64 * scale;
  return (
    <span
      aria-hidden
      className="relative block"
      style={{ width: w, height: h }}
    >
      <span
        className="absolute rounded-full"
        style={{
          left: 0,
          bottom: 0,
          width: w * 0.62,
          height: h * 0.78,
          background:
            "radial-gradient(circle at 40% 38%, rgba(255,246,236,0.92) 0%, rgba(255,231,210,0.72) 55%, rgba(255,215,190,0) 100%)",
          filter: "blur(1.5px)",
        }}
      />
      <span
        className="absolute rounded-full"
        style={{
          left: w * 0.3,
          bottom: h * 0.12,
          width: w * 0.55,
          height: h * 0.88,
          background:
            "radial-gradient(circle at 45% 35%, rgba(255,250,242,0.95) 0%, rgba(255,236,214,0.8) 52%, rgba(255,215,190,0) 100%)",
          filter: "blur(1.5px)",
        }}
      />
      <span
        className="absolute rounded-full"
        style={{
          left: w * 0.58,
          bottom: 0,
          width: w * 0.42,
          height: h * 0.7,
          background:
            "radial-gradient(circle at 45% 40%, rgba(255,244,230,0.88) 0%, rgba(255,226,200,0.6) 55%, rgba(255,215,190,0) 100%)",
          filter: "blur(2px)",
        }}
      />
      {/* warm underlit base */}
      <span
        className="absolute inset-x-1 bottom-0 h-[30%]"
        style={{
          background:
            "linear-gradient(to top, rgba(240,164,92,0.35) 0%, transparent 100%)",
          filter: "blur(4px)",
        }}
      />
    </span>
  );
}

/**
 * The travel-sky backdrop behind every page: a dusk-to-golden-hour gradient
 * (violet dusk → plum → rose → coral → amber horizon), a low hazed sun,
 * layered mountain ridges, drifting cloud banks, puffy cumulus, contrails
 * drawing lines across the sky, migrating birds, rising lantern motes and
 * soft haze. Everything is tuned to read as depth behind content — never
 * over the words.
 */
export function FloatingBackground({ count = 18 }: { count?: number }) {
  const stars = useMemo<SkyStar[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${(seeded(i, 1) * 96 + 2).toFixed(2)}%`,
        // Dusk realism: the first “stars” linger only in the darker upper sky
        // and fade out before the bright horizon — never glitter on gold.
        top: `${(seeded(i, 2) * 52 + 2).toFixed(2)}%`,
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
      Array.from({ length: 5 }, (_, i) => ({
        left: `${(seeded(i, 81) * 92 + 4).toFixed(1)}%`,
        delay: `${(seeded(i, 82) * 46).toFixed(1)}s`,
        duration: `${(44 + seeded(i, 83) * 30).toFixed(1)}s`,
        size: 2 + seeded(i, 84) * 2.4,
        hue: WISP_HUES[i % WISP_HUES.length],
        opacity: 0.14 + seeded(i, 85) * 0.12,
      })),
    [],
  );

  const contrails = useMemo<Contrail[]>(
    () =>
      Array.from({ length: 4 }, (_, i) => ({
        top: `${(seeded(i, 91) * 26 + 3).toFixed(1)}%`,
        delay: `${(seeded(i, 92) * 42).toFixed(1)}s`,
        duration: `${(26 + seeded(i, 93) * 14).toFixed(1)}s`,
        scale: 0.85 + seeded(i, 94) * 0.6,
        opacity: 0.5 + seeded(i, 95) * 0.3,
        silver: seeded(i, 96) > 0.5,
      })),
    [],
  );

  const clouds = useMemo(
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

  const flocks = useMemo(
    () =>
      Array.from({ length: 2 }, (_, i) => ({
        top: `${(seeded(i, 71) * 22 + 8).toFixed(1)}%`,
        delay: `${(seeded(i, 72) * 36).toFixed(1)}s`,
        duration: `${(34 + seeded(i, 73) * 16).toFixed(1)}s`,
        flip: seeded(i, 74) > 0.5,
        left: "105vw" as const,
      })),
    [],
  );

  const cumuli = useMemo(
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
      {/* Sky base — the horizon journey: violet dusk → plum → rose →
          coral → amber → golden haze. Warm, travel-poster sky. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #1b1f4b 0%, #45256e 14%, #7d3a72 30%, #b85a6a 46%, #dd8358 60%, #f0a95c 74%, #f6c37e 88%, #fbe0a8 100%)",
        }}
      />

      {/* warm bloom around the sun's position + faint rose afterglow */}
      <div
        className="absolute inset-x-0 bottom-0 h-[46%]"
        style={{
          background:
            "radial-gradient(130% 100% at 50% 118%, rgba(255,224,170,0.22) 0%, rgba(255,190,140,0.10) 40%, transparent 75%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[28%]"
        style={{
          background:
            "radial-gradient(120% 90% at 24% 116%, rgba(255,150,120,0.08) 0%, transparent 65%)",
        }}
      />

      {/* gentle vignette — just enough to frame */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 42%, transparent 62%, rgba(27,20,40,0.16) 100%)",
        }}
      />

      <LowSun />

      {/* sunbeam shafts — wide faint diagonals from the horizon upward */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, transparent 40%, rgba(255,236,200,0.06) 50%, transparent 58%)," +
            "linear-gradient(122deg, transparent 56%, rgba(255,236,200,0.045) 64%, transparent 72%)",
        }}
      />

      <MountainRidges />

      {/* Starlit haze → warm drifting haze across the whole sky */}
      {clouds.map((c, i) => (
        <CloudHaze
          key={`cloud-${i}`}
          scale={c.scale}
          opacity={c.opacity}
          delay={c.delay}
          duration={c.duration}
          top={c.top}
        />
      ))}

      {/* Puffy cumulus clouds floating on their own drift paths */}
      {cumuli.map((c, i) => (
        <div
          key={`cumulus-${i}`}
          className="animate-planet-drift absolute"
          style={{
            left: c.left,
            top: c.top,
            animationDelay: c.delay,
            animationDuration: c.duration,
          }}
        >
          <Cumulus scale={c.scale} />
        </div>
      ))}

      {/* Rising lantern motes — warm flecks of light climbing the sky */}
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

      {/* Dusk sparkles — faint glints where the last starlight lingers up high */}
      {stars.map((s, i) => {
        const color = s.blue
          ? "rgba(255,238,214,"
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
              background: `${color}${s.bright ? 0.9 : 0.45})`,
              boxShadow: s.bright
                ? `0 0 ${s.size * 3}px 1px ${color}0.3)`
                : undefined,
              animationDelay: s.delay,
              animationDuration: s.duration,
            }}
          />
        );
      })}

      {/* Contrails — high-altitude travelers crossing the upper sky */}
      {contrails.map((c, i) => (
        <div
          key={`contrail-${i}`}
          className="animate-contrail-drift absolute"
          style={{
            left: "110vw",
            top: c.top,
            opacity: c.opacity,
            animationDelay: c.delay,
            animationDuration: c.duration,
          }}
        >
          <Contrail silver={c.silver} scale={c.scale} />
        </div>
      ))}

      {/* Bird flocks crossing on long slow paths */}
      {flocks.map((f, i) => (
        <div
          key={`flock-${i}`}
          className="animate-flock-flight absolute"
          style={{
            left: f.left,
            top: f.top,
            animationDelay: f.delay,
            animationDuration: f.duration,
          }}
        >
          <BirdFlock flip={f.flip} />
        </div>
      ))}
    </div>
  );
}
