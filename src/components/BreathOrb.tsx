import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const PHASES = [
  { key: "in", label: "Breathe in", seconds: 4 },
  { key: "hold", label: "Hold it there", seconds: 7 },
  { key: "out", label: "Let it go", seconds: 8 },
] as const;

const CYCLE_SECONDS = PHASES.reduce((n, p) => n + p.seconds, 0); // 19
const CYCLES = 3;
const TOTAL_SECONDS = CYCLE_SECONDS * CYCLES; // 57

/** Which phase of the 4-7-8 cycle a given elapsed second sits in. */
function phaseAt(elapsed: number) {
  const m = elapsed % CYCLE_SECONDS;
  let acc = 0;
  for (const p of PHASES) {
    if (m < acc + p.seconds) {
      return { index: PHASES.indexOf(p), remaining: acc + p.seconds - m };
    }
    acc += p.seconds;
  }
  return { index: 0, remaining: PHASES[0].seconds };
}

const SCALE_BY_PHASE = [1.32, 1.32, 0.96] as const;

/**
 * A guided 4-7-8 breathing orb. Tap begin and the orb swells for four
 * seconds, holds for seven, and empties for eight — three rounds, about a
 * minute. The same reset the app nudges you with, playable anywhere.
 */
export function BreathOrb({ compact = false }: { compact?: boolean }) {
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (elapsed === null) return;
    if (elapsed >= TOTAL_SECONDS) {
      setElapsed(null);
      setDone(true);
      return;
    }
    const t = setTimeout(() => setElapsed((e) => (e ?? 0) + 1), 1000);
    return () => clearTimeout(t);
  }, [elapsed]);

  const running = elapsed !== null;
  const phase = elapsed !== null ? phaseAt(elapsed) : null;
  const current = phase ? PHASES[phase.index] : null;
  const size = compact ? 84 : 120;
  const scale = phase ? SCALE_BY_PHASE[phase.index] : 1;
  const cycleNum =
    elapsed !== null ? Math.floor(elapsed / CYCLE_SECONDS) + 1 : 0;

  const begin = () => {
    setDone(false);
    setElapsed(0);
  };

  return (
    <div
      className={`flex flex-col items-center ${compact ? "gap-2.5" : "gap-4"}`}
    >
      <div
        className="relative flex items-center justify-center"
        style={{ width: size * 1.5, height: size * 1.5 }}
      >
        {/* soft halo that breathes with the orb */}
        <span
          aria-hidden
          className="pointer-events-none absolute rounded-full"
          style={{
            inset: size * 0.1,
            background:
              "radial-gradient(circle, rgba(251,191,36,0.16) 0%, rgba(125,150,255,0.08) 55%, transparent 72%)",
            transform: `scale(${scale * 1.14})`,
            transition: `transform ${current?.seconds ?? 4}s cubic-bezier(0.37, 0, 0.63, 1)`,
          }}
        />
        {/* the orb itself */}
        <span
          aria-label={current ? current.label : "breathing orb, at rest"}
          role="img"
          className="relative block rounded-full"
          style={{
            width: size,
            height: size,
            background:
              "radial-gradient(circle at 36% 30%, rgba(255,244,214,0.95) 0%, rgba(251,191,36,0.6) 42%, rgba(168,120,255,0.28) 72%, rgba(90,110,220,0.12) 100%)",
            boxShadow:
              "0 0 34px 4px rgba(251,191,36,0.3), inset 0 0 24px rgba(255,255,255,0.28)",
            transform: `scale(${scale})`,
            transition: `transform ${current?.seconds ?? 4}s cubic-bezier(0.37, 0, 0.63, 1)`,
          }}
        >
          <span className="absolute inset-0 flex items-center justify-center">
            {phase && current ? (
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${phase.index}-${Math.ceil(phase.remaining)}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.22 }}
                  className={`font-bold tabular-nums text-[#241a06] ${
                    compact ? "text-base" : "text-xl"
                  }`}
                >
                  {Math.max(1, Math.ceil(phase.remaining))}
                </motion.span>
              </AnimatePresence>
            ) : (
              <span className={compact ? "text-xl" : "text-2xl"}>🫧</span>
            )}
          </span>
        </span>
      </div>

      <div className="text-center" aria-live="polite">
        {phase && current ? (
          <>
            <p
              className={`font-display font-semibold text-emerald-100 ${
                compact ? "text-base" : "text-lg"
              }`}
            >
              {current.label}
            </p>
            <p className="mt-0.5 text-[11px] uppercase tracking-widest text-muted-foreground">
              cycle {cycleNum} of {CYCLES}
            </p>
          </>
        ) : done ? (
          <>
            <p
              className={`font-display font-semibold text-emerald-100 ${
                compact ? "text-base" : "text-lg"
              }`}
            >
              ✨ That's the reset
            </p>
            <p className="mt-0.5 text-[11px] uppercase tracking-widest text-muted-foreground">
              notice what changed
            </p>
          </>
        ) : (
          <>
            <p
              className={`font-display font-semibold text-emerald-100 ${
                compact ? "text-base" : "text-lg"
              }`}
            >
              One-minute reset
            </p>
            <p className="mt-0.5 text-[11px] uppercase tracking-widest text-muted-foreground">
              4 · 7 · 8 breathing · three rounds
            </p>
          </>
        )}
      </div>

      {running ? (
        <button
          type="button"
          onClick={() => setElapsed(null)}
          className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          stop
        </button>
      ) : (
        <button
          type="button"
          onClick={begin}
          className="rounded-full border border-emerald-300/40 bg-emerald-300/10 px-5 py-2 text-sm font-semibold text-emerald-100 transition-all hover:scale-105 hover:bg-emerald-300/20"
        >
          {done ? "Once more ✦" : "Begin ✦"}
        </button>
      )}
    </div>
  );
}
