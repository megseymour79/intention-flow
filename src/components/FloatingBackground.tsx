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

interface PageComet {
  top: string;
  delay: string;
  duration: string;
  size: number;
  tilt: number;
  silver: boolean;
}

const WISP_HUES = [
  "rgba(167,139,250,", // violet
  "rgba(125,211,252,", // sky
  "rgba(251,191,36,", // gold
  "rgba(244,164,255,", // orchid
];

/* ------------------------------------------------------------------ */
/* Deep-sky objects — realistic, photographic, never cartoonish        */
/* ------------------------------------------------------------------ */

/** A soft unresolved galaxy: layered nebulosity around a bright, tiny core. */
function GalaxyHaze() {
  return (
    <div
      aria-hidden
      className="animate-planet-drift pointer-events-none absolute left-[7%] top-[7%]"
      style={{ animationDuration: "46s" }}
    >
      <div
        className="animate-nebula-pulse relative h-56 w-72 opacity-70"
        style={{ animationDuration: "13s" }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(42% 34% at 62% 38%, rgba(196,186,236,0.12) 0%, transparent 100%)",
            filter: "blur(10px)",
          }}
        />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(30% 24% at 42% 58%, rgba(186,204,240,0.1) 0%, transparent 100%)",
            filter: "blur(12px)",
          }}
        />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(16% 13% at 54% 47%, rgba(244,238,220,0.32) 0%, transparent 100%)",
            filter: "blur(3px)",
          }}
        />
      </div>
    </div>
  );
}

/** A photographic-feel ringed planet: limb-shaded globe, bands, 3-D ring. */
function RealisticPlanet() {
  return (
    <div
      aria-hidden
      className="animate-planet-drift pointer-events-none absolute left-[10%] top-[26%]"
      style={{ animationDuration: "38s" }}
    >
      <div className="relative h-[120px] w-[120px]">
        {/* faint ambient glow so the disc sits in the sky, not on it */}
        <div
          className="absolute -inset-6 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(235,205,160,0.08) 0%, transparent 70%)",
          }}
        />
        <svg
          width="120"
          height="120"
          viewBox="0 0 100 100"
          className="relative block"
        >
          <defs>
            <radialGradient id="pg-body" cx="34%" cy="30%" r="80%">
              <stop offset="0%" stopColor="#e9e6d8" />
              <stop offset="38%" stopColor="#b3a68c" />
              <stop offset="66%" stopColor="#77705e" />
              <stop offset="88%" stopColor="#3d3a30" />
              <stop offset="100%" stopColor="#1d1b15" />
            </radialGradient>
            <radialGradient id="pg-shade" cx="64%" cy="42%" r="75%">
              <stop offset="0%" stopColor="rgba(2,3,10,0)" />
              <stop offset="55%" stopColor="rgba(2,3,10,0)" />
              <stop offset="82%" stopColor="rgba(2,3,10,0.55)" />
              <stop offset="100%" stopColor="rgba(2,3,10,0.85)" />
            </radialGradient>
            <linearGradient id="pg-ring" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(224,232,224,0.05)" />
              <stop offset="30%" stopColor="rgba(224,232,224,0.4)" />
              <stop offset="55%" stopColor="rgba(240,244,238,0.52)" />
              <stop offset="80%" stopColor="rgba(224,232,224,0.26)" />
              <stop offset="100%" stopColor="rgba(224,232,224,0.05)" />
            </linearGradient>
            <clipPath id="pg-clip">
              <circle cx="50" cy="50" r="34" />
            </clipPath>
            <clipPath id="pg-front">
              <rect x="0" y="50" width="100" height="50" />
            </clipPath>
          </defs>

          {/* far side of the ring, behind the globe */}
          <ellipse
            cx="50"
            cy="50"
            rx="56"
            ry="15"
            fill="none"
            stroke="url(#pg-ring)"
            strokeWidth="3.2"
            opacity="0.4"
            transform="rotate(-12 50 50)"
          />

          {/* the globe */}
          <circle cx="50" cy="50" r="34" fill="url(#pg-body)" />

          {/* latitudinal bands, clipped to the disc */}
          <g clipPath="url(#pg-clip)" transform="rotate(12 50 50)">
            <rect x="-20" y="22" width="140" height="4.5" fill="rgba(70,66,52,0.2)" />
            <rect x="-20" y="30" width="140" height="6" fill="rgba(228,228,214,0.1)" />
            <rect x="-20" y="40" width="140" height="4" fill="rgba(238,240,226,0.08)" />
            <rect x="-20" y="51" width="140" height="7" fill="rgba(62,58,46,0.18)" />
            <rect x="-20" y="62" width="140" height="5" fill="rgba(52,50,40,0.14)" />
          </g>

          {/* terminator — the night side creeps in from the right */}
          <circle cx="50" cy="50" r="34" fill="url(#pg-shade)" />

          {/* near side of the ring, passing in front of the globe */}
          <ellipse
            cx="50"
            cy="50"
            rx="56"
            ry="15"
            fill="none"
            stroke="url(#pg-ring)"
            strokeWidth="3.2"
            opacity="0.85"
            transform="rotate(-12 50 50)"
            clipPath="url(#pg-front)"
          />
        </svg>
      </div>
    </div>
  );
}

/** A cratered crescent moon rendered as a masked SVG disc. */
function RealisticMoon() {
  return (
    <div
      aria-hidden
      className="animate-planet-drift pointer-events-none absolute right-[29%] top-[20%]"
      style={{ animationDuration: "17s" }}
    >
      <svg
        width="66"
        height="66"
        viewBox="0 0 100 100"
        className="block drop-shadow-[0_0_14px_rgba(238,233,214,0.22)]"
      >
        <defs>
          <radialGradient id="pm-body" cx="30%" cy="32%" r="80%">
            <stop offset="0%" stopColor="#f5f2e6" />
            <stop offset="42%" stopColor="#e2dcc6" />
            <stop offset="100%" stopColor="#97917c" />
          </radialGradient>
          <radialGradient id="pm-night" cx="62%" cy="42%" r="72%">
            <stop offset="0%" stopColor="#05070f" />
            <stop offset="100%" stopColor="#0b1120" />
          </radialGradient>
          <mask id="pm-mask">
            <rect width="100" height="100" fill="black" />
            <circle cx="59" cy="50" r="24" fill="white" />
          </mask>
        </defs>
        {/* the sunlit disc */}
        <circle cx="50" cy="50" r="30" fill="url(#pm-body)" />
        {/* night shadow, masked so only a lit crescent survives */}
        <circle
          cx="50"
          cy="50"
          r="30"
          fill="url(#pm-night)"
          mask="url(#pm-mask)"
          opacity="0.94"
        />
        {/* faint maria on the lit sliver */}
        <g opacity="0.5">
          <circle cx="27" cy="43" r="4" fill="rgba(120,112,92,0.5)" />
          <circle cx="24" cy="55" r="2.4" fill="rgba(120,112,92,0.42)" />
          <circle cx="31" cy="59" r="1.6" fill="rgba(120,112,92,0.38)" />
        </g>
      </svg>
    </div>
  );
}

/** A dim far ice giant — small, cold, steady. */
function DistantPlanet() {
  return (
    <div
      aria-hidden
      className="animate-planet-drift pointer-events-none absolute right-[6%] top-[50%]"
      style={{ animationDuration: "41s" }}
    >
      <svg width="30" height="30" viewBox="0 0 100 100">
        <defs>
          <radialGradient id="pg-ice" cx="36%" cy="32%" r="80%">
            <stop offset="0%" stopColor="#cfe9f4" />
            <stop offset="45%" stopColor="#6fa3c7" />
            <stop offset="80%" stopColor="#2c5878" />
            <stop offset="100%" stopColor="#152e42" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="42" fill="url(#pg-ice)" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Comets — a bright head with a layered tapering tail                 */
/* ------------------------------------------------------------------ */

/** A realistic comet: tight glowing head, faint coma, tapered dust tail. */
function Comet({ silver, size }: { silver: boolean; size: number }) {
  const head = silver ? "rgba(236,242,255,0.95)" : "rgba(255,244,214,0.95)";
  const glow = silver ? "rgba(205,220,255,0.55)" : "rgba(255,226,150,0.55)";
  const tail = silver
    ? "linear-gradient(to right, rgba(226,236,255,0.8) 0%, rgba(190,208,250,0.3) 34%, rgba(160,180,235,0.1) 64%, transparent 100%)"
    : "linear-gradient(to right, rgba(255,238,190,0.82) 0%, rgba(255,220,150,0.32) 34%, rgba(240,190,120,0.1) 64%, transparent 100%)";
  return (
    <span aria-hidden className="relative block" style={{ width: 134, height: 12 }}>
      {/* the dust tail, tapering away behind the head */}
      <span
        className="absolute left-1 top-1/2 block h-[2px] w-[128px] -translate-y-1/2 rounded-full"
        style={{ background: tail, filter: "blur(0.4px)" }}
      />
      <span
        className="absolute left-1 top-1/2 block h-[7px] w-[64px] -translate-y-1/2 rounded-full"
        style={{ background: tail, filter: "blur(3px)", opacity: 0.65 }}
      />
      {/* the coma — soft light surrounding the nucleus */}
      <span
        className="absolute left-[-6px] top-1/2 block h-[18px] w-[18px] -translate-y-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle, ${glow} 0%, transparent 65%)`,
          opacity: 0.7,
        }}
      />
      {/* the nucleus itself */}
      <span
        className="absolute left-0 top-1/2 block -translate-y-1/2 rounded-full"
        style={{
          width: 6 * size,
          height: 6 * size,
          background: head,
          boxShadow: `0 0 9px 3px ${glow}, 0 0 24px 8px rgba(255,255,255,0.12)`,
        }}
      />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Starlit haze — barely-there vapor                                    */
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
            "radial-gradient(50% 60% at 35% 55%, rgba(196,208,235,0.55) 0%, rgba(196,208,235,0.22) 55%, transparent 100%)," +
            "radial-gradient(45% 55% at 68% 40%, rgba(210,220,242,0.4) 0%, transparent 90%)",
          filter: "blur(6px)",
        }}
      />
    </div>
  );
}

/**
 * The mystical night sky behind every page: a vivid twilight gradient from
 * deep space to rose dusk, a soft galaxy glow, a ringed planet, a cratered
 * crescent moon, an ice giant, tailed comets, rising wisps and drifting haze.
 * Everything is tuned to read as depth behind content — never over the words.
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

  const comets = useMemo<PageComet[]>(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        top: `${(seeded(i, 91) * 28 + 2).toFixed(1)}%`,
        delay: `${(seeded(i, 92) * 38).toFixed(1)}s`,
        duration: `${(14 + seeded(i, 93) * 8).toFixed(1)}s`,
        size: 0.9 + seeded(i, 94) * 0.5,
        tilt: 8 + seeded(i, 95) * 8,
        silver: seeded(i, 96) > 0.45,
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

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Sky base — deep space easing through royal blue into verdigris dusk */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #02040c 0%, #081231 34%, #122a5c 56%, #1d4a7e 76%, #2a6b7a 88%, #3d8382 96%, #5b9a8f 100%)",
        }}
      />

      {/* soft moonlit-teal bloom along the horizon */}
      <div
        className="absolute inset-x-0 bottom-0 h-[36%]"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 118%, rgba(140,220,205,0.2) 0%, rgba(90,160,190,0.12) 42%, transparent 75%)",
        }}
      />

      {/* gentle vignette — frames the viewport and keeps edges calm */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 42%, transparent 58%, rgba(2,3,9,0.32) 100%)",
        }}
      />

      <GalaxyHaze />
      <RealisticPlanet />
      <RealisticMoon />
      <DistantPlanet />

      {/* Milky Way band — unresolved starlight across the upper sky */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(140% 55% at 72% -12%, rgba(190,200,225,0.055) 0%, rgba(190,200,225,0.022) 38%, transparent 65%)",
        }}
      />

      {/* Starlit haze drifting across the whole sky */}
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

      {/* Rising starlight wisps — faint motes of colored light climbing the sky */}
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

      {/* Comets — tailed travelers crossing the upper sky every few seconds */}
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
          <Comet silver={c.silver} size={c.size} />
        </div>
      ))}
    </div>
  );
}
