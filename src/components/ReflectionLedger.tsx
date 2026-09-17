import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { BookOpenCheck, Loader2, MoonStar } from "lucide-react";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { dayKeyFor } from "@/lib/shift-data";

const MOODS = [
  { value: 1, emoji: "😔", label: "Heavy" },
  { value: 2, emoji: "😕", label: "Meh" },
  { value: 3, emoji: "😐", label: "Steady" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "🤩", label: "Bright" },
];

const dayLabels = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toLocaleDateString([], { weekday: "short" }).slice(0, 2);
};

interface ReflectionLike {
  dayKey: string;
  honored: boolean;
  mood: number;
  note?: string;
}

export function ReflectionLedger({
  intentionText,
}: {
  intentionText?: string | null;
}) {
  const today = useQuery(api.reflections.getToday);
  const recent = useQuery(api.reflections.getRecent, { days: 14 });
  const save = useMutation(api.reflections.upsertToday);

  const [honored, setHonored] = useState<boolean | null>(null);
  const [mood, setMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  // Seed the form from an already-saved reflection for today.
  const seeded = today !== undefined && today !== null;
  const seededValues = useMemo(() => {
    if (!seeded || !today) return null;
    return { honored: today.honored, mood: today.mood, note: today.note ?? "" };
  }, [seeded, today]);

  const effHonored = honored ?? seededValues?.honored ?? null;
  const effMood = mood ?? seededValues?.mood ?? null;
  const effNote = note !== "" ? note : (seededValues?.note ?? "");

  const dirty =
    honored !== null ||
    mood !== null ||
    (note !== "" && note !== (seededValues?.note ?? ""));

  const canSave = effHonored !== null && effMood !== null && !saving;

  const handleSave = async () => {
    if (effHonored === null || effMood === null) return;
    setSaving(true);
    try {
      await save({
        honored: effHonored,
        mood: effMood,
        note: effNote.trim() ? effNote.trim() : undefined,
        intentionText: intentionText ?? undefined,
      });
      setHonored(null);
      setMood(null);
      setNote("");
      toast("Evening logged", {
        description: "Your ledger keeps the pattern — patterns are how shifts stick.",
      });
    } catch (err) {
      console.error(err);
      toast("Couldn't log tonight", { description: "Try again in a moment." });
    } finally {
      setSaving(false);
    }
  };

  // Build the 14-day strip (today last), overlaying saved reflections.
  const strip = useMemo(() => {
    const byDay = new Map<string, ReflectionLike>();
    for (const r of recent ?? []) byDay.set(r.dayKey, r);
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      const key = dayKeyFor(d);
      const r = byDay.get(key);
      return { key, label: dayLabels(13 - i), r, isToday: i === 13 };
    });
  }, [recent]);

  return (
    <div className="radius-sheet border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-300/15 ring-1 ring-violet-300/25">
            <MoonStar className="h-5 w-5 text-violet-200" />
          </span>
          <div>
            <p className="font-bold">The evening ledger</p>
            <p className="mt-0.5 max-w-md text-xs leading-relaxed text-muted-foreground">
              {intentionText
                ? `Did you show up as “${intentionText.slice(0, 60)}”? One honest note per night is how a shift becomes a trait.`
                : "One honest note per night is how a shift becomes a trait."}
            </p>
          </div>
        </div>
        {seeded && (
          <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-200">
            logged tonight ✓
          </span>
        )}
      </div>

      {/* Honored toggle */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Did I show up as intended?
        </span>
        {(
          [
            { v: true, label: "Yes", cls: "border-cyan-300/60 bg-cyan-300/15 text-cyan-100" },
            { v: false, label: "Not yet", cls: "border-rose-300/50 bg-rose-300/10 text-rose-100" },
          ] as const
        ).map((o) => (
          <button
            key={o.label}
            type="button"
            onClick={() => setHonored(o.v)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              effHonored === o.v
                ? o.cls
                : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/25"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Mood picker */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          How the day felt
        </span>
        {MOODS.map((m) => (
          <button
            key={m.value}
            type="button"
            title={m.label}
            aria-label={m.label}
            onClick={() => setMood(m.value)}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border text-lg transition-all ${
              effMood === m.value
                ? "scale-110 border-cyan-300/60 bg-cyan-300/10"
                : "border-white/10 bg-white/5 opacity-70 hover:opacity-100"
            }`}
          >
            {m.emoji}
          </button>
        ))}
      </div>

      {/* Note */}
      <Textarea
        value={effNote}
        onChange={(e) => setNote(e.target.value)}
        maxLength={400}
        rows={2}
        placeholder="One honest line about tonight… (optional)"
        className="mt-4 resize-none border-white/15 bg-white/5 text-sm placeholder:text-foreground/50"
      />

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-[11px] text-muted-foreground">
          {dirty ? "Unsaved changes" : seeded ? "Edit tonight's entry anytime" : "Takes ten seconds"}
        </p>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!canSave}
          className="rounded-full bg-foreground font-semibold text-background hover:bg-foreground/85"
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <BookOpenCheck className="mr-2 h-4 w-4" />
          )}
          {seeded ? "Update tonight" : "Log tonight"}
        </Button>
      </div>

      {/* 14-day strip */}
      {recent !== undefined && recent.length > 0 && (
        <div className="mt-5 border-t border-white/8 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            The last two weeks
          </p>
          <div className="mt-2 flex items-end gap-1.5">
            {strip.map((d) => {
              const m = d.r?.mood ?? 0;
              const height = d.r ? 8 + m * 6 : 4;
              const color = !d.r
                ? "bg-white/10"
                : d.r.honored
                  ? "bg-gradient-to-t from-cyan-400/80 to-cyan-200"
                  : "bg-gradient-to-t from-rose-400/70 to-rose-300";
              return (
                <div
                  key={d.key}
                  title={
                    d.r
                      ? `${d.key} — mood ${m}/5${d.r.note ? `: “${d.r.note}”` : ""}`
                      : `${d.key} — no entry`
                  }
                  className="group relative flex flex-1 flex-col items-center gap-1"
                >
                  <div
                    className={`w-full max-w-[18px] rounded-t-full ${color} transition-all group-hover:brightness-125`}
                    style={{ height }}
                  />
                  <span
                    className={`text-[9px] ${d.isToday ? "font-semibold text-cyan-200" : "text-muted-foreground/75"}`}
                  >
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground/70">
            Gold = showed up as intended · Rose = didn't, yet · Hover a bar for the note
          </p>
        </div>
      )}
    </div>
  );
}

export function ReflectionHeroCard() {
  const stats = useQuery(api.reflections.getStats);
  if (!stats || stats.count === 0) return null;
  const honoredPct = Math.round((stats.honoredCount / stats.count) * 100);
  const avgMood = (stats.moodSum / stats.count).toFixed(1);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="panel flex flex-wrap items-center justify-between gap-4 p-5"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">🌠</span>
        <div>
          <p className="text-sm font-bold">Your ledger so far</p>
          <p className="text-xs text-muted-foreground">
            {stats.count} night{stats.count === 1 ? "" : "s"} logged · you kept your
            intention {honoredPct}% of them · average mood {avgMood}/5
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-2xl font-extrabold tracking-tight text-cyan-200">
          {honoredPct}%
        </p>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          kept
        </p>
      </div>
    </motion.div>
  );
}
