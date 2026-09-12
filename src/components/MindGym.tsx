import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Shared shells                                                       */
/* ------------------------------------------------------------------ */

function GymCard({
  title,
  emoji,
  sub,
  children,
  wide = false,
}: {
  title: string;
  emoji: string;
  sub: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5 transition-colors hover:border-emerald-300/25",
        wide && "sm:col-span-2",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-300/10 text-xl ring-1 ring-emerald-300/20">
          {emoji}
        </span>
        <div>
          <p className="font-display text-base font-bold tracking-tight">
            {title}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {sub}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-1 flex-col">{children}</div>
    </div>
  );
}

function PlayAgain({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mx-auto mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-emerald-300/40 hover:text-emerald-100"
    >
      <RotateCcw className="h-3 w-3" /> {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* 1 · The Impulse Catcher — tap the urge before it reaches the edge   */
/* ------------------------------------------------------------------ */

const URGE_WORDS = [
  "Snap back",
  "Check the phone",
  "Defend myself",
  "Say it NOW",
  "Buy it",
  "Refresh",
  "Win this",
  "Interrupt",
];

interface Urge {
  id: number;
  word: string;
  x: number;
  y: number;
}

function ImpulseCatcher() {
  const [running, setRunning] = useState(false);
  const [urges, setUrges] = useState<Urge[]>([]);
  const [caught, setCaught] = useState(0);
  const [escaped, setEscaped] = useState(0);
  const nextId = useRef(0);
  // Personal best lives in state (seeded from localStorage) so the UI can
  // read it during render without touching a ref.
  const [bestScore, setBestScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem("sm-gym-best") ?? 0);
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    if (!running) return;
    const spawn = setInterval(() => {
      setUrges((u) =>
        [
          ...u.slice(-5),
          {
            id: nextId.current++,
            word: URGE_WORDS[Math.floor(Math.random() * URGE_WORDS.length)],
            x: 8 + Math.random() * 70,
            y: 8 + Math.random() * 68,
          },
        ],
      );
    }, 900);
    return () => clearInterval(spawn);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const drain = setInterval(() => {
      setUrges((u) => {
        if (u.length === 0) return u;
        setEscaped((e) => e + 1);
        return u.slice(1);
      });
    }, 1150);
    return () => clearInterval(drain);
  }, [running]);

  const start = () => {
    setCaught(0);
    setEscaped(0);
    setUrges([]);
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      setUrges([]);
    }, 20000);
  };

  const score = caught;
  useEffect(() => {
    if (!running && score > bestScore) {
      setBestScore(score);
      try {
        localStorage.setItem("sm-gym-best", String(score));
      } catch {
        /* private mode */
      }
    }
  }, [running, score, bestScore]);

  const done = !running && caught + escaped > 0;

  return (
    <div className="flex flex-1 flex-col">
      <div className="relative h-44 overflow-hidden rounded-2xl border border-white/10 bg-[#1a2450]/45">
        {running &&
          urges.map((u) => (
            <motion.button
              key={u.id}
              type="button"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.3, opacity: 0 }}
              onClick={() => {
                setCaught((c) => c + 1);
                setUrges((list) => list.filter((x) => x.id !== u.id));
              }}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 touch-none select-none rounded-full border border-rose-300/40 bg-rose-400/15 px-3 py-1.5 text-[11px] font-bold text-rose-100 shadow-[0_0_14px_rgba(251,113,133,0.25)]"
              style={{ left: `${u.x}%`, top: `${u.y}%` }}
            >
              {u.word}
            </motion.button>
          ))}
        {!running && (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-sm font-semibold">
              {done ? `${caught} caught · ${escaped} slipped past` : "20 seconds"}
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {done
                ? caught > escaped
                  ? "You caught more than slipped. That's the muscle."
                  : "They move fast, don't they? In real life you get more than a second — you get a breath."
                : "Urges pop up fast and slip away faster. Tap each one before it reaches the edge — that's the whole skill of the gap."}
            </p>
            <button
              type="button"
              onClick={start}
              className="mt-1 rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background transition-transform hover:scale-105"
            >
              {done ? "Go again" : "Start the 20s"}
            </button>
            {bestScore > 0 && (
              <p className="text-[10px] uppercase tracking-widest text-foreground/70">
                personal best · {bestScore}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2 · Thought Unhook — watch the thought, don't fight it              */
/* ------------------------------------------------------------------ */

const LOOPS = [
  "I always mess this up",
  "They think I'm boring",
  "I'm behind in life",
  "This will go wrong",
  "I shouldn't feel this way",
  "I can't handle this",
];

function ThoughtUnhook() {
  const [thought, setThought] = useState(
    () => LOOPS[Math.floor(Math.random() * LOOPS.length)],
  );
  const [phase, setPhase] = useState<"hooked" | "watching" | "free">("hooked");

  const again = () => {
    setThought((cur) => {
      let next = Math.floor(Math.random() * LOOPS.length);
      if (LOOPS[next] === cur && LOOPS.length > 1) {
        next = (next + 1) % LOOPS.length;
      }
      return LOOPS[next];
    });
    setPhase("hooked");
  };

  // The thought drifts further away (and lighter) at each stage.
  const drift = { hooked: 0, watching: 34, free: 72 }[phase];
  const opacity = { hooked: 0.95, watching: 0.6, free: 0.25 }[phase];

  return (
    <div className="flex flex-1 flex-col">
      <div className="relative flex h-44 flex-col justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#1a2450]/45 px-4">
        <motion.p
          animate={{ x: `${drift}%`, opacity }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
          className="max-w-[240px] rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-sm font-medium italic leading-relaxed"
        >
          “{thought}”
        </motion.p>
        <p className="mt-4 text-[11px] uppercase tracking-widest text-muted-foreground/70">
          {phase === "hooked"
            ? "the thought, right in front of you"
            : phase === "watching"
              ? "notice it — don't argue with it"
              : "you are the sky, not the weather"}
        </p>
      </div>
      <div className="mt-3 flex justify-center gap-2">
        {phase === "hooked" && (
          <button
            type="button"
            onClick={() => setPhase("watching")}
            className="rounded-full border border-sky-300/40 bg-sky-300/10 px-4 py-1.5 text-xs font-semibold text-sky-100 transition-colors hover:bg-sky-300/20"
          >
            Just watch it
          </button>
        )}
        {phase === "watching" && (
          <button
            type="button"
            onClick={() => setPhase("free")}
            className="rounded-full border border-emerald-300/40 bg-emerald-300/10 px-4 py-1.5 text-xs font-semibold text-emerald-100 transition-colors hover:bg-emerald-300/20"
          >
            Let it drift
          </button>
        )}
        {phase === "free" && <PlayAgain onClick={again} label="Another thought" />}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3 · Grounding 5-4-3-2-1 — senses, stepped                           */
/* ------------------------------------------------------------------ */

const GROUND_STEPS = [
  { n: 5, sense: "things you can SEE", emoji: "👀" },
  { n: 4, sense: "things you can TOUCH", emoji: "✋" },
  { n: 3, sense: "things you can HEAR", emoji: "👂" },
  { n: 2, sense: "things you can SMELL", emoji: "👃" },
  { n: 1, sense: "thing you can TASTE", emoji: "👄" },
];

function GroundingSteps() {
  const [step, setStep] = useState(0);
  const [taps, setTaps] = useState(0);
  const [done, setDone] = useState(false);

  const s = GROUND_STEPS[step];
  const need = s.n;
  const remaining = Math.max(0, need - taps);

  const tap = () => {
    if (taps + 1 >= need) {
      if (step + 1 >= GROUND_STEPS.length) {
        setDone(true);
      } else {
        setStep((v) => v + 1);
        setTaps(0);
      }
    } else {
      setTaps((t) => t + 1);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="relative flex h-44 flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#1a2450]/45 px-4 text-center">
        {done ? (
          <>
            <motion.p
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl"
            >
              🌿
            </motion.p>
            <p className="text-sm font-semibold">Back in the room.</p>
            <p className="max-w-[220px] text-xs leading-relaxed text-muted-foreground">
              Five senses walked, one at a time. Anxiety lives in the future —
              senses only live here.
            </p>
            <PlayAgain
              onClick={() => {
                setStep(0);
                setTaps(0);
                setDone(false);
              }}
              label="Walk it again"
            />
          </>
        ) : (
          <>
            <p className="text-4xl">{s.emoji}</p>
            <p className="text-sm font-semibold">
              Notice{" "}
              <span className="text-emerald-200">
                {need} {s.sense}
              </span>
            </p>
            <button
              type="button"
              onClick={tap}
              className="rounded-full border border-emerald-300/40 bg-emerald-300/10 px-6 py-2.5 text-sm font-semibold text-emerald-100 transition-all hover:scale-105 active:scale-95"
            >
              Found one — {remaining} to go
            </button>
            <div className="flex gap-1">
              {Array.from({ length: need }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 w-5 rounded-full transition-colors",
                    i < taps ? "bg-emerald-300" : "bg-white/10",
                  )}
                />
              ))}
            </div>
            <p className="text-[10px] uppercase tracking-widest text-foreground/70">
              step {step + 1} of 5
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 4 · The Reframe Lens — spin the dial, see it different              */
/* ------------------------------------------------------------------ */

const REFRAME_SETS: { situation: string; lenses: string[] }[] = [
  {
    situation: "I have to give the presentation",
    lenses: [
      "…I get to share something I know.",
      "…I'm nervous, which means it matters to me.",
      "…the room wants me to do well, actually.",
    ],
  },
  {
    situation: "They haven't replied to my message",
    lenses: [
      "…their day is probably just full.",
      "…my worth isn't a read receipt.",
      "…I can use the wait to do something for me.",
    ],
  },
  {
    situation: "I made a mistake at work",
    lenses: [
      "…that's data, not identity.",
      "…I'm the kind of person who notices and repairs.",
      "…in a year, this won't even be a story.",
    ],
  },
  {
    situation: "Tomorrow is going to be hard",
    lenses: [
      "…and I've done hard before, on purpose.",
      "…I can pick one intention to carry into it.",
      "…hard days are where the good stories come from.",
    ],
  },
];

function ReframeLens() {
  const [i, setI] = useState(() => Math.floor(Math.random() * REFRAME_SETS.length));
  const [lens, setLens] = useState(0);
  const set = REFRAME_SETS[i];

  const spin = () => {
    setI((v) => (v + 1) % REFRAME_SETS.length);
    setLens(0);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex h-44 flex-col justify-center gap-3 rounded-2xl border border-white/10 bg-[#1a2450]/45 p-4">
        <p className="text-xs uppercase tracking-widest text-muted-foreground/70">
          the situation
        </p>
        <p className="text-sm font-semibold">“{set.situation}”</p>
        <AnimatePresence mode="wait">
          <motion.p
            key={`${i}-${lens}`}
            initial={{ opacity: 0, y: 8, rotateX: -40 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-violet-300/30 bg-violet-300/10 px-4 py-3 text-sm font-medium leading-relaxed text-violet-100"
          >
            {set.lenses[lens]}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="mt-3 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setLens((l) => (l + 1) % set.lenses.length)}
          className="rounded-full border border-violet-300/40 bg-violet-300/10 px-4 py-1.5 text-xs font-semibold text-violet-100 transition-colors hover:bg-violet-300/20"
        >
          Turn the lens 🔭
        </button>
        <PlayAgain onClick={spin} label="New situation" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 5 · The Moment Compass — this-or-that, values edition               */
/* ------------------------------------------------------------------ */

const COMPASS_PAIRS: { a: string; b: string }[] = [
  { a: "Be interesting", b: "Be interested" },
  { a: "Win the argument", b: "Keep the person" },
  { a: "Get it done fast", b: "Get it done true" },
  { a: "Protect the plan", b: "Protect the mood" },
  { a: "Be impressive", b: "Be honest" },
  { a: "Say the clever thing", b: "Say the kind thing" },
  { a: "Take up space", b: "Make space" },
  { a: "Be right", b: "Be at peace" },
];

function MomentCompass() {
  const [round, setRound] = useState(0);
  const [picks, setPicks] = useState<string[]>([]);
  const done = round >= COMPASS_PAIRS.length;
  const pair = done ? null : COMPASS_PAIRS[round];

  const pick = (side: string) => {
    setPicks((p) => [...p, side]);
    setRound((r) => r + 1);
  };

  const reset = () => {
    setRound(0);
    setPicks([]);
  };

  // The reading: whichever side you leaned toward more often.
  const aCount = picks.filter((p) => p === "a").length;
  const bCount = picks.length - aCount;
  const lean = aCount >= bCount ? "a" : "b";

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex h-44 flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#1a2450]/45 p-4 text-center">
        {done ? (
          <>
            <p className="text-3xl">🧭</p>
            <p className="text-sm font-semibold leading-relaxed">
              {lean === "a"
                ? `You lean toward the bold, self-forward pull — ${aCount} of ${picks.length}.`
                : `You lean toward the steady, connective pull — ${bCount} of ${picks.length}.`}
            </p>
            <p className="max-w-[230px] text-xs leading-relaxed text-muted-foreground">
              Neither side is wrong — but your honest pull is worth naming. Hang
              it as a star and it stops being a coin-flip.
            </p>
            <PlayAgain onClick={reset} label="Spin again" />
          </>
        ) : (
          <>
            <p className="text-[10px] uppercase tracking-widest text-foreground/70">
              when the moment squeezes · {round + 1}/{COMPASS_PAIRS.length}
            </p>
            <div className="flex w-full max-w-[280px] items-stretch gap-2">
              {(["a", "b"] as const).map((side) => (
                <button
                  key={side}
                  type="button"
                  onClick={() => pick(side)}
                  className="group flex-1 rounded-2xl border border-white/12 bg-white/5 px-2 py-4 text-xs font-semibold leading-snug transition-all hover:-translate-y-0.5 hover:border-emerald-300/40 hover:bg-emerald-300/10"
                >
                  {side === "a" ? pair!.a : pair!.b}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-foreground/70">
              pick the one you'd want to have chosen
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The gym itself                                                      */
/* ------------------------------------------------------------------ */

export function MindGym() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <GymCard
        emoji="🫳"
        title="The Impulse Catcher"
        sub="A 20-second game of catching urges before they slip past — the reflex gap, made playable."
      >
        <ImpulseCatcher />
      </GymCard>
      <GymCard
        emoji="🎈"
        title="Thought Unhook"
        sub="Don't wrestle the thought — watch it until it loosens. Three taps to defusion."
      >
        <ThoughtUnhook />
      </GymCard>
      <GymCard
        emoji="🌿"
        title="Grounding 5-4-3-2-1"
        sub="Walk your five senses one tap at a time and land back in the room."
      >
        <GroundingSteps />
      </GymCard>
      <GymCard
        emoji="🔭"
        title="The Reframe Lens"
        sub="Same situation, three lenses. Turn the dial and feel the frame shift."
      >
        <ReframeLens />
      </GymCard>
      <GymCard
        emoji="🧭"
        title="The Moment Compass"
        sub="Eight quick this-or-that pulls that map what you actually value when it counts."
        wide
      >
        <MomentCompass />
      </GymCard>
    </div>
  );
}
