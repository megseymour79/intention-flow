import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, MoonStar, Sparkles, Star, X } from "lucide-react";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { dayKeyFor } from "@/lib/shift-data";

/* ------------------------------------------------------------------ */
/* First Light — the three-move quest for a brand-new sky              */
/* ------------------------------------------------------------------ */

interface QuestRow {
  key: string;
  emoji: string;
  title: string;
  body: string;
  done: boolean;
  action?: { label: string; onClick: () => void };
}

const STORE_KEY = "sm-first-light";

export function FirstLight({
  hasStar,
  hasQuiz,
  hasReflection,
  onHangStar,
  onTakeQuiz,
}: {
  hasStar: boolean;
  hasQuiz: boolean;
  hasReflection: boolean;
  onHangStar: () => void;
  onTakeQuiz: () => void;
}) {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(STORE_KEY) !== null;
    } catch {
      return false;
    }
  });
  // Ref guard so the celebration fires exactly once, even under StrictMode.
  const celebratedRef = useRef(false);

  const allDone = hasStar && hasQuiz && hasReflection;

  // Celebrate once when the quest completes, then remember it forever.
  useEffect(() => {
    if (!allDone || celebratedRef.current) return;
    celebratedRef.current = true;
    try {
      localStorage.setItem(STORE_KEY, "done");
    } catch {
      /* private mode — the card just reappears next visit */
    }
    toast("🌌 First light complete", {
      description: "Your sky is lit. From here, one star a night keeps it burning.",
    });
    const t = setTimeout(() => setDismissed(true), 7000);
    return () => clearTimeout(t);
  }, [allDone]);

  const close = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORE_KEY, "closed");
    } catch {
      /* ignore */
    }
  };

  const rows: QuestRow[] = [
    {
      key: "star",
      emoji: "✦",
      title: "Hang your first star",
      body: "One way you want to be tonight — tap the sky, or borrow a ready-made one.",
      done: hasStar,
      action: hasStar
        ? undefined
        : { label: "Hang a star", onClick: onHangStar },
    },
    {
      key: "quiz",
      emoji: "🧭",
      title: "Meet your archetype",
      body: "Six honest questions. Comet, North Star, Moon or Nebula — find out which.",
      done: hasQuiz,
      action: hasQuiz
        ? undefined
        : { label: "Take the quiz", onClick: onTakeQuiz },
    },
    {
      key: "ledger",
      emoji: "🌙",
      title: "Log tonight in the ledger",
      body: "At day's end, one line about how the day went. That's how a shift sticks.",
      done: hasReflection,
      action: hasReflection
        ? undefined
        : {
            label: "Go to the ledger",
            onClick: () =>
              document
                .getElementById("evening-ledger")
                ?.scrollIntoView({ behavior: "smooth", block: "center" }),
          },
    },
  ];

  const doneCount = rows.filter((r) => r.done).length;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl border border-amber-300/25 bg-gradient-to-br from-amber-300/[0.08] via-white/[0.03] to-transparent p-5"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-amber-300/10 blur-3xl" />

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-300/15 text-lg ring-1 ring-amber-300/30">
                {allDone ? "🌌" : "🗺️"}
              </span>
              <div>
                <p className="text-sm font-bold tracking-tight">
                  {allDone ? "First light — complete" : "First light"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {allDone
                    ? "Your sky is lit. It only asks for one star a night now."
                    : `Three small moves to light your sky · ${doneCount} of 3 done`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Dismiss the first-light quest"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex gap-1.5">
            {rows.map((r) => (
              <span
                key={r.key}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
                  r.done ? "bg-amber-300" : "bg-white/10"
                }`}
              />
            ))}
          </div>

          <div className="mt-4 space-y-2.5">
            {rows.map((r, i) => (
              <motion.div
                key={r.key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.3 }}
                className={`flex items-center gap-3 rounded-2xl border px-3.5 py-2.5 transition-colors ${
                  r.done
                    ? "border-emerald-300/25 bg-emerald-300/[0.06]"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm ring-1 transition-colors ${
                    r.done
                      ? "bg-emerald-300/15 text-emerald-200 ring-emerald-300/30"
                      : "bg-white/5 text-foreground/80 ring-white/10"
                  }`}
                >
                  {r.done ? <Check className="h-4 w-4" /> : r.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-semibold tracking-tight ${
                      r.done ? "text-foreground/60 line-through decoration-emerald-300/40" : ""
                    }`}
                  >
                    {r.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {r.body}
                  </p>
                </div>
                {r.action && (
                  <Button
                    size="sm"
                    onClick={r.action.onClick}
                    className="h-8 shrink-0 rounded-full bg-amber-300 text-xs font-bold text-amber-950 hover:bg-amber-200"
                  >
                    {r.action.label}
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* Constellation — the last 30 nights, drawn as a sky                  */
/* ------------------------------------------------------------------ */

const MILESTONES = [
  { nights: 1, name: "First Light" },
  { nights: 3, name: "The Triangle" },
  { nights: 7, name: "The Little Dipper" },
  { nights: 14, name: "Half a Moon Cycle" },
  { nights: 30, name: "The Full Constellation" },
];

interface DayCell {
  key: string;
  label: string;
  honored?: boolean;
  mood?: number;
  note?: string;
  isToday: boolean;
}

export function ConstellationProgress() {
  const recent = useQuery(api.reflections.getRecent, { days: 30 });

  const cells = useMemo<DayCell[]>(() => {
    const byDay = new Map<string, { honored: boolean; mood: number; note?: string }>();
    for (const r of recent ?? []) {
      byDay.set(r.dayKey, { honored: r.honored, mood: r.mood, note: r.note ?? undefined });
    }
    const today = new Date();
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (29 - i));
      const key = dayKeyFor(d);
      const r = byDay.get(key);
      return {
        key,
        label: d.toLocaleDateString([], { month: "short", day: "numeric" }),
        honored: r?.honored,
        mood: r?.mood,
        note: r?.note,
        isToday: i === 29,
      };
    });
  }, [recent]);

  const logged = cells.filter((c) => c.honored !== undefined).length;
  const kept = cells.filter((c) => c.honored === true).length;
  const reached = MILESTONES.filter((m) => kept >= m.nights);
  const next = MILESTONES.find((m) => kept < m.nights);

  // Nothing logged yet at all — stay quiet until there's a story to show.
  if (recent !== undefined && recent.length === 0) return null;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-300/15 ring-1 ring-sky-300/25">
            <Star className="h-5 w-5 text-sky-200" />
          </span>
          <div>
            <p className="font-bold">Your constellation</p>
            <p className="mt-0.5 max-w-md text-xs leading-relaxed text-muted-foreground">
              Every night you show up adds a star. Thirty in a row draws a full
              constellation — a full moon cycle of choosing who you are.
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold tracking-tight text-sky-200">
            {kept}
            <span className="ml-1 text-sm font-semibold text-muted-foreground">
              / {Math.max(logged, kept)} kept
            </span>
          </p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            last 30 nights
          </p>
        </div>
      </div>

      {/* The sky strip — one cell per night */}
      <div className="mt-5 flex items-end gap-1">
        {cells.map((c) => {
          const title = c.honored === undefined
            ? `${c.label} — no entry`
            : `${c.label} — ${c.honored ? "kept" : "logged, not yet"}${c.note ? `: “${c.note}”` : ""}`;
          return (
            <div
              key={c.key}
              title={title}
              className="group relative flex flex-1 flex-col items-center"
            >
              <span
                className={`block w-full max-w-[16px] rounded-full transition-all group-hover:brightness-150 ${
                  c.honored === true
                    ? "h-3 bg-gradient-to-t from-amber-400/90 to-amber-200 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                    : c.honored === false
                      ? "h-3 bg-gradient-to-t from-rose-400/70 to-rose-300"
                      : "h-2 bg-white/10"
                } ${c.isToday ? "ring-1 ring-white/40" : ""}`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-[9px] text-muted-foreground/60">
        <span>30 nights ago</span>
        <span>today</span>
      </div>

      {/* Milestones */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/8 pt-4">
        {MILESTONES.map((m) => {
          const got = kept >= m.nights;
          return (
            <span
              key={m.nights}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                got
                  ? "border-amber-300/50 bg-amber-300/10 text-amber-100"
                  : "border-white/10 bg-white/5 text-muted-foreground/70"
              }`}
            >
              {got ? <Sparkles className="h-3 w-3 text-amber-300" /> : <MoonStar className="h-3 w-3 opacity-50" />}
              {m.nights} · {m.name}
            </span>
          );
        })}
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        {next ? (
          <>
            <ChevronDown className="h-3.5 w-3.5 text-amber-200/70" />
            {next.nights - kept} more kept night{next.nights - kept === 1 ? "" : "s"} until{" "}
            <span className="font-semibold text-amber-200/90">“{next.name}”</span>
          </>
        ) : (
          <>
            ✦ The full constellation is drawn — {reached.length > 0 && reached[reached.length - 1].name} complete.
            Keep tending your sky.
          </>
        )}
      </p>
    </div>
  );
}
