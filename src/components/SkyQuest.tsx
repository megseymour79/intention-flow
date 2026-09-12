import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Lock, MoonStar, Sparkles, Star, X } from "lucide-react";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { dayKeyFor } from "@/lib/shift-data";
import {
  RANK_TIERS,
  UPGRADES,
  rankNameForLevel,
  useSkyRank,
} from "@/lib/unlocks";

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
          className="relative overflow-hidden rounded-3xl border border-emerald-300/20 bg-gradient-to-br from-emerald-300/[0.06] via-white/[0.03] to-transparent p-5"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-emerald-300/10 blur-3xl" />

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-300/12 text-lg ring-1 ring-emerald-300/25">
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
                  r.done ? "bg-emerald-300" : "bg-white/10"
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
                      r.done ? "text-foreground/70 line-through decoration-emerald-300/40" : ""
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
                    className="h-8 shrink-0 rounded-full bg-foreground text-xs font-semibold text-background hover:bg-foreground/85"
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

  // Celebrate a constellation milestone the first time it is reached — once
  // per browser. Night one is skipped: the First Light quest already toasts
  // that moment, so celebrations begin at The Triangle.
  const celebratedRef = useRef(false);
  useEffect(() => {
    if (recent === undefined || celebratedRef.current) return;
    const KEY = "sm-milestones-seen";
    let seen: string[] = [];
    try {
      seen = JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[];
    } catch {
      /* ignore */
    }
    const fresh = MILESTONES.filter(
      (m) => m.nights >= 3 && kept >= m.nights && !seen.includes(String(m.nights)),
    );
    if (fresh.length === 0) return;
    celebratedRef.current = true;
    const top = fresh[fresh.length - 1];
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify([...seen, ...fresh.map((m) => String(m.nights))]),
      );
    } catch {
      /* private mode — it may toast again next visit; fine */
    }
    toast(`🌟 ${top.name} — complete`, {
      description: `${top.nights} nights of keeping your word to yourself. The sky remembers.`,
    });
  }, [recent, kept]);

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
      <div className="mt-1.5 flex justify-between text-[9px] text-muted-foreground/75">
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
                  ? "border-emerald-300/45 bg-emerald-300/10 text-emerald-100"
                  : "border-white/10 bg-white/5 text-muted-foreground/70"
              }`}
            >
              {got ? <Sparkles className="h-3 w-3 text-emerald-300" /> : <MoonStar className="h-3 w-3 opacity-50" />}
              {m.nights} · {m.name}
            </span>
          );
        })}
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        {next ? (
          <>
            <ChevronDown className="h-3.5 w-3.5 text-emerald-200/70" />
            {next.nights - kept} more kept night{next.nights - kept === 1 ? "" : "s"} until{" "}
            <span className="font-semibold text-emerald-200/90">“{next.name}”</span>
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

/* ------------------------------------------------------------------ */
/* Welcome back — the returning-user vigil banner                      */
/* ------------------------------------------------------------------ */

export function WelcomeBack() {
  const rank = useSkyRank();
  const streakData = useQuery(api.stars.getStreak);

  if (rank.loading || streakData === undefined) return null;
  // Day-one skies get the First Light quest instead — this banner is for
  // the second visit onward, when the habit starts to take hold.
  if (rank.breakdown.visits <= 1 || streakData.total === 0) return null;

  const streak = streakData.streak;
  const total = streakData.total;
  const reached = [...MILESTONES].reverse().find((m) => streak >= m.nights) ?? null;
  const nextMilestone = MILESTONES.find((m) => m.nights > streak) ?? null;
  const progress = nextMilestone
    ? Math.min(100, Math.round((streak / nextMilestone.nights) * 100))
    : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-3xl border border-sky-300/20 bg-gradient-to-r from-indigo-500/[0.09] via-white/[0.03] to-transparent p-5"
    >
      <div className="pointer-events-none absolute -left-8 -top-10 h-32 w-32 rounded-full bg-indigo-400/10 blur-3xl" />

      <div className="flex flex-wrap items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-300/15 text-2xl ring-1 ring-sky-300/25">
          {streak > 0 ? "🌙" : "☁️"}
        </span>

        <div className="min-w-[220px] flex-1">
          <p className="text-sm font-bold tracking-tight">
            {streak > 0
              ? `Night ${streak} of your vigil`
              : "Your vigil is dimmed — not out"}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {streak > 0
              ? reached
                ? `${reached.name} complete. ${
                    nextMilestone
                      ? `${nextMilestone.nights - streak} more night${
                          nextMilestone.nights - streak === 1 ? "" : "s"
                        } until ${nextMilestone.name}.`
                      : "The full constellation is drawn — keep adding to it."
                  }`
                : "The sky noticed you came back."
              : "Hang tonight's star and the constellation picks up where it left off."}
          </p>
        </div>

        {nextMilestone && (
          <div className="w-full max-w-[220px]">
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <span>{reached ? reached.name : "First Light"}</span>
              <span>{nextMilestone.name}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-300 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground/70">
              {total} star{total === 1 ? "" : "s"} hung all-time · {rank.emoji} {rank.name}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Rank — sky ranks & upgrades, earned by coming back and engaging     */
/* ------------------------------------------------------------------ */

const BREAKDOWN = [
  { key: "stars", emoji: "✦", label: "stars hung" },
  { key: "keptNights", emoji: "🌙", label: "nights kept" },
  { key: "visits", emoji: "🔁", label: "days visited" },
  { key: "quizCount", emoji: "🧭", label: "quizzes taken" },
] as const;

export function RankPanel() {
  const rank = useSkyRank();
  if (rank.loading) return null;

  const progress = rank.next
    ? Math.min(100, Math.round((rank.score / rank.next.score) * 100))
    : 100;
  const maxScore = RANK_TIERS[RANK_TIERS.length - 1].score;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className="animate-glow-pulse flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-300/20 to-sky-400/12 text-xl ring-1 ring-emerald-300/25"
            title={`Rank ${rank.level} of ${RANK_TIERS.length}`}
          >
            {rank.emoji}
          </span>
          <div>
            <p className="font-bold">
              Sky rank ·{" "}
              <span className="text-emerald-200">{rank.name}</span>
            </p>
            <p className="mt-0.5 max-w-md text-xs leading-relaxed text-muted-foreground">
              {rank.blurb} Every star hung, night kept, day visited and quiz
              taken adds light to your rank.
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold tracking-tight text-emerald-200">
            {rank.score}
            <span className="ml-1 text-sm font-semibold text-muted-foreground">
              / {maxScore} light
            </span>
          </p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            engagement score
          </p>
        </div>
      </div>

      {/* Progress to the next rank */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            {rank.next ? (
              <>
                {rank.next.score - rank.score} light until{" "}
                <span className="font-semibold text-foreground/80">
                  {rank.next.name}
                </span>
              </>
            ) : (
              <span className="text-emerald-200/90">
                ✦ Final rank reached — the sky bends around you now.
              </span>
            )}
          </span>
          <span className="tabular-nums">{rank.next ? `${progress}%` : "100%"}</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400/80 to-emerald-200 shadow-[0_0_10px_rgba(110,231,183,0.45)] transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Where the light comes from */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {BREAKDOWN.map((b) => {
          const value = rank.breakdown[b.key];
          return (
            <span
              key={b.key}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground"
            >
              <span>{b.emoji}</span>
              <span className="font-semibold text-foreground/85">{value}</span>
              {b.label}
            </span>
          );
        })}
      </div>

      {/* Upgrades — unlocked vs still locked */}
      <div className="mt-5 border-t border-white/8 pt-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Upgrades your rank opens
        </p>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {UPGRADES.map((u) => {
            const open = rank.level >= u.level;
            return (
              <div
                key={u.id}
                className={`rounded-2xl border p-3.5 transition-colors ${
                  open
                    ? "border-emerald-300/30 bg-emerald-300/[0.05]"
                    : "border-white/8 bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xl ${open ? "" : "opacity-40 grayscale"}`}>
                    {u.emoji}
                  </span>
                  {open ? (
                    <span className="flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                      <Check className="h-3 w-3" /> Unlocked
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      <Lock className="h-3 w-3" /> {rankNameForLevel(u.level)}
                    </span>
                  )}
                </div>
                <p
                  className={`mt-2 text-sm font-bold tracking-tight ${
                    open ? "" : "text-muted-foreground"
                  }`}
                >
                  {u.title}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {u.body}
                </p>
              </div>
            );
          })}
        </div>
        {rank.next && (
          <p className="mt-3 text-xs text-muted-foreground">
            <Sparkles className="mr-1 inline h-3.5 w-3.5 text-emerald-300/80" />
            Come back tomorrow — even a visit alone feeds the next rank.
          </p>
        )}
      </div>
    </div>
  );
}
