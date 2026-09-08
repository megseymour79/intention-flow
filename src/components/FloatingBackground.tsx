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

// Deterministic pseudo-random so the sky is stable across renders
function seeded(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Realistic night sky: a deep navy zenith fading through a thin layer of
 * atmosphere to a faint horizon glow, a diagonal Milky Way band of unresolved
 * stars, and three depth layers of tiny point stars — most steady, a few with
 * a barely-there scintillation, the way real stars twinkle.
 */
export function FloatingBackground({ count = 18 }: { count?: number }) {
  const stars = useMemo<SkyStar[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      left: `${(seeded(i, 1) * 96 + 2).toFixed(2)}%`,
      top: `${(seeded(i, 2) * 88 + 2).toFixed(2)}%`,
      delay: `${(seeded(i, 3) * 9).toFixed(2)}s`,
      duration: `${(4 + seeded(i, 4) * 7).toFixed(2)}s`,
      size: 1 + seeded(i, 5) * 1.8,
      bright: seeded(i, 6) > 0.82,
      blue: seeded(i, 7) > 0.25,
    }));
  }, [count]);

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

      {/* Milky Way band — unresolved starlight across the upper sky */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(140% 55% at 72% -12%, rgba(190,200,225,0.055) 0%, rgba(190,200,225,0.022) 38%, transparent 65%)",
        }}
      />

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
    </div>
  );
}
