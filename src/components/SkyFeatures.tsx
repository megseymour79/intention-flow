import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SkyEvent } from "@/lib/sky-events";

// Local re-implementation of the deterministic seeded PRNG used in StarSky
function seeded(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/* ------------------------------------------------------------------ */
/* Moon — real phase, rendered as a lit disc                           */
/* ------------------------------------------------------------------ */

/**
 * Real moon phase. The disc is lit; the dark part is an overlaid shadow whose
 * horizontal extent follows the phase, waxing from the right like the real thing.
 */
export function MoonPhase({ phase }: { phase: number }) {
  const shadow = useMemo(() => {
    // 0 → new (fully dark), 1 → full (fully lit)
    const t = (1 - Math.cos(2 * Math.PI * phase)) / 2;
    // full disc is 22px wide; shadow inset from the left as the moon waxes
    const insetLeft = phase <= 0.5 ? (1 - t) * 22 : 0;
    // waning: shadow creeps in from the right
    const insetRight = phase > 0.5 ? (1 - t) * 22 : 0;
    return { insetLeft, insetRight, t };
  }, [phase]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute right-[9%] top-[10%] z-[2]"
    >
      <div
        className="h-[22px] w-[22px] rounded-full"
        style={{
          background: "radial-gradient(circle at 38% 35%, #f4f1e6, #cfc9b4)",
          boxShadow:
            "0 0 10px 2px rgba(235,230,210,0.28), 0 0 24px 6px rgba(220,215,190,0.12)",
        }}
      >
        {/* the dark part of the disc */}
        <div
          className="h-full w-full rounded-full"
          style={{
            background: "rgba(5,8,17,0.9)",
            clipPath: `inset(0 ${shadow.insetRight.toFixed(1)}px 0 ${shadow.insetLeft.toFixed(1)}px)`,
          }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tonight's event card                                                */
/* ------------------------------------------------------------------ */

export function TonightEvent({
  event,
  onDismiss,
}: {
  event: SkyEvent;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="pointer-events-auto absolute left-3 top-3 z-20 max-w-[280px]"
    >
      <div className="rounded-2xl border border-white/10 bg-black/55 p-3 backdrop-blur-md">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200/80">
              Tonight's sky
            </p>
            <p className="mt-0.5 text-sm font-bold tracking-tight text-foreground">
              {event.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss tonight's sky event"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            ✕
          </button>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-foreground/70">
          {event.body}
        </p>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Aurora shimmer — horizon band for aurora nights                     */
/* ------------------------------------------------------------------ */

export function AuroraBand() {
  return (
    <div
      aria-hidden
      className="animate-aura pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-2/5"
      style={{
        background:
          "linear-gradient(to top, rgba(52,211,153,0.16) 0%, rgba(45,180,160,0.09) 30%, rgba(56,130,190,0.05) 60%, transparent 100%)",
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Wish comet — crosses the sky once per session; catch it             */
/* ------------------------------------------------------------------ */

interface CometState {
  id: number;
  top: number; // % vertical lane
  duration: number; // seconds to cross
}

export function WishComet({
  onCatch,
}: {
  onCatch: (starter: string, e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  // One comet per mount (per visit to the sky), on a seeded lane.
  const comet = useMemo<CometState | null>(() => {
    const h = Date.now() % 100000;
    if (seeded(h, 3) <= 0.15) return null;
    return {
      id: 1,
      top: 12 + seeded(h, 5) * 45,
      duration: 16 + seeded(h, 9) * 8,
    };
  }, []);
  const [gone, setGone] = useState(false);
  if (!comet || gone) return null;

  return (
    <button
      key={comet.id}
      type="button"
      aria-label="Catch the falling wish"
      title="Catch the falling wish ✦"
      onClick={(e) => onCatch("I want to be someone who…", e)}
      onAnimationEnd={() => setGone(true)}
      className="animate-comet group absolute z-30 h-10 w-10 -translate-y-1/2 outline-none hover:[animation-play-state:paused]"
      style={{
        top: `${comet.top}%`,
        animationDuration: `${comet.duration}s`,
      }}
    >
      <span
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg transition-transform duration-150 group-hover:scale-150"
        style={{
          color: "#fff7d6",
          textShadow: "0 0 10px rgba(255,240,180,0.9), 0 0 22px rgba(255,220,140,0.5)",
        }}
      >
        ✦
      </span>
      <span
        aria-hidden
        className="absolute right-1/2 top-1/2 h-px w-14 -translate-y-1/2 rounded-full"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,240,180,0.85), rgba(255,220,140,0.3), transparent)",
        }}
      />
      <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-[10px] text-amber-50/90 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
        a falling wish — catch it
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Star bloom — tap-able newborn stars on starbloom nights             */
/* ------------------------------------------------------------------ */

interface BloomStar {
  left: number;
  top: number;
  delay: number;
}

export function StarBloom({
  onCatch,
}: {
  onCatch: (x: number, y: number) => void;
}) {
  const stars = useMemo<BloomStar[]>(
    () =>
      Array.from({ length: 3 }, (_, i) => ({
        left: 12 + seeded(i, 41) * 70,
        top: 16 + seeded(i, 42) * 50,
        delay: 1.2 + seeded(i, 43) * 4,
      })),
    [],
  );

  return (
    <>
      {stars.map((s, i) => (
        <motion.button
          key={i}
          type="button"
          aria-label="Catch the newborn star"
          title="A newborn star — tap to catch it"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0, 1.3, 1, 0.6] }}
          transition={{ duration: 14, delay: s.delay, times: [0, 0.15, 0.75, 1] }}
          onClick={() => onCatch(s.left, s.top)}
          className="absolute z-30 h-9 w-9 -translate-x-1/2 -translate-y-1/2 outline-none"
          style={{ left: `${s.left}%`, top: `${s.top}%` }}
        >
          <span
            className="block h-2.5 w-2.5 rounded-full"
            style={{
              background: "radial-gradient(circle, #ffffff 0%, #cfe0ff 60%, transparent 100%)",
              boxShadow: "0 0 10px 2px rgba(210,225,255,0.8)",
            }}
          />
        </motion.button>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Planet — a bright, steady point that never twinkles                 */
/* ------------------------------------------------------------------ */

export function PlanetPoint({ name }: { name: string }) {
  const pos = useMemo(
    () => ({ left: 18 + seeded(name.length * 7, 51) * 60, top: 20 + seeded(name.length * 13, 52) * 30 }),
    [name],
  );
  return (
    <div
      aria-hidden
      title={`${name} — bright, steady, unblinking`}
      className="pointer-events-none absolute z-[2] -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
    >
      <span
        className="block h-1.5 w-1.5 rounded-full"
        style={{
          background: "#ffe9c4",
          boxShadow: "0 0 8px 2px rgba(255,225,170,0.65), 0 0 18px 6px rgba(255,210,150,0.2)",
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* WishCaught — the reward dialog when a falling wish is caught        */
/* ------------------------------------------------------------------ */

export function WishCaught({
  starter,
  open,
  onClose,
}: {
  starter: string | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && starter && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-40 flex items-center justify-center rounded-3xl bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.85, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="mx-4 max-w-xs rounded-3xl border border-amber-300/30 bg-[#0b1322]/95 p-5 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-3xl">✨</p>
            <p className="mt-2 text-lg font-extrabold tracking-tight">
              You caught it
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground/75">
              Falling wishes only cross the sky once a night. Finish the
              sentence — it'll hang as a star where you caught it.
            </p>
            <p className="mt-3 rounded-2xl border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-sm font-semibold text-amber-100">
              “{starter}”
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full rounded-full bg-amber-300 px-4 py-2 text-sm font-bold text-amber-950 transition-colors hover:bg-amber-200"
            >
              Finish the wish
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
