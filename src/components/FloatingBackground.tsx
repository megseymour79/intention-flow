import { useMemo } from "react";

interface Firefly {
  left: string;
  top: string;
  delay: string;
  duration: string;
  size: number;
  emoji: string | null;
  drift: string;
}

const EMOJIS = ["✦", "✧", "·", "✶", null, null, null, "✦"];

// Deterministic pseudo-random so the sky is stable across renders
function seeded(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function FloatingBackground({ count = 18 }: { count?: number }) {
  const fireflies = useMemo<Firefly[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      left: `${(seeded(i, 1) * 96 + 2).toFixed(2)}%`,
      top: `${(seeded(i, 2) * 90 + 4).toFixed(2)}%`,
      delay: `${(seeded(i, 3) * 8).toFixed(2)}s`,
      duration: `${(6 + seeded(i, 4) * 8).toFixed(2)}s`,
      size: 2 + seeded(i, 5) * 3,
      emoji: EMOJIS[i % EMOJIS.length],
      drift: seeded(i, 6) > 0.5 ? "drift-a" : "drift-b",
    }));
  }, [count]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* dusk gradient base */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1440] via-[#2b1d5e] to-[#5b2a5e]" />
      {/* soft glows */}
      <div className="absolute -top-32 left-1/2 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-amber-400/10 blur-3xl" />
      <div className="absolute top-1/3 -left-24 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-[30rem] rounded-full bg-rose-400/10 blur-3xl" />
      {/* stars */}
      {fireflies.map((f, i) =>
        f.emoji ? (
          <span
            key={`star-${i}`}
            className={`animate-twinkle absolute ${f.emoji === "·" ? "text-[10px]" : "text-sm"} text-amber-100/80`}
            style={{
              left: f.left,
              top: f.top,
              animationDelay: f.delay,
              animationDuration: `${(3 + seeded(i, 7) * 4).toFixed(2)}s`,
            }}
          >
            {f.emoji}
          </span>
        ) : (
          <span
            key={`dot-${i}`}
            className="animate-twinkle absolute rounded-full bg-amber-200/90"
            style={{
              left: f.left,
              top: f.top,
              width: f.size,
              height: f.size,
              boxShadow: "0 0 8px 2px rgba(251,191,36,0.35)",
              animationDelay: f.delay,
              animationDuration: `${(3 + seeded(i, 7) * 4).toFixed(2)}s`,
            }}
          />
        ),
      )}
      {/* drifting embers */}
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={`ember-${i}`}
          className={`animate-${i % 2 === 0 ? "drift-a" : "drift-b"} absolute rounded-full bg-gradient-to-br from-amber-300 to-orange-500/70`}
          style={{
            left: `${(12 + seeded(i, 8) * 70).toFixed(1)}%`,
            top: `${(55 + seeded(i, 9) * 35).toFixed(1)}%`,
            width: 4 + seeded(i, 10) * 4,
            height: 4 + seeded(i, 10) * 4,
            opacity: 0.7,
            boxShadow: "0 0 12px 3px rgba(251,146,60,0.35)",
            animationDelay: `${seeded(i, 11) * 6}s`,
          }}
        />
      ))}
    </div>
  );
}