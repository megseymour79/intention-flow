import { FloatingBackground } from "@/components/FloatingBackground";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { dayKeyFor } from "@/convex/intentions";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { REMINDER_SLOTS, useReminders } from "@/hooks/use-reminders";
import {
  ARCHETYPES,
  archetypeById,
  INTENTIONS,
  INTENTION_VIBES,
  QUIZ_QUESTIONS,
  tipOfTheDay,
  type Archetype,
  type VibeKey,
} from "@/lib/intention-data";
import { useMutation, useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  BellRing,
  Check,
  Flame,
  History,
  Lightbulb,
  LogOut,
  Pencil,
  RotateCcw,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const EASE = [0.22, 0.61, 0.36, 1] as const;

function EmberMark({ size = 36 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 via-orange-400 to-rose-500 shadow-[0_0_20px_rgba(251,146,60,0.4)]"
      style={{ width: size, height: size }}
    >
      <span className="text-white" style={{ fontSize: size * 0.55 }}>
        ✦
      </span>
    </div>
  );
}

function useTodayKey() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return dayKeyFor(now);
}

/* ------------------------------------------------------------------ */
/*  Intention card                                                     */
/* ------------------------------------------------------------------ */

function IntentionCard() {
  const dayKey = useTodayKey();
  const today = useQuery(api.intentions.getToday, { dayKey });
  const setToday = useMutation(api.intentions.setToday);
  const [editing, setEditing] = useState(false);
  const [custom, setCustom] = useState("");
  const [vibe, setVibe] = useState<VibeKey>("glow");
  const [saving, setSaving] = useState(false);

  const save = async (text: string, emoji: string, v: VibeKey, isCustom: boolean) => {
    setSaving(true);
    try {
      await setToday({ dayKey, text, emoji, vibe: v, isCustom });
      setEditing(false);
      setCustom("");
      toast("✨ Intention planted", {
        description: `Today you mean to: “${text}”`,
      });
    } catch (e) {
      toast.error("Couldn't plant that one", {
        description: e instanceof Error ? e.message : "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const vibes = INTENTION_VIBES[vibe];

  return (
    <Card className="relative overflow-hidden border-white/15 bg-white/6 backdrop-blur-md">
      <div
        className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full blur-3xl"
        style={{ background: `${vibes.hex}33` }}
      />
      <CardHeader>
        <CardTitle className="text-xl">
          {today ? "Today's glow" : "Set today's glow"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {today && !editing ? (
          <div className="relative flex flex-col gap-4">
            <div
              className="animate-glow-pulse flex items-center gap-4 rounded-2xl border p-5"
              style={{ borderColor: `${vibes.hex}55` }}
            >
              <span className="text-5xl">{today.emoji}</span>
              <div>
                <p className="text-xl font-extrabold leading-snug">{today.text}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest opacity-70">
                  {INTENTION_VIBES[today.vibe as VibeKey]?.label ?? "Your glow"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-white/20 bg-white/5 hover:bg-white/10"
                onClick={() => setEditing(true)}
              >
                <Pencil className="mr-1.5 size-3.5" /> Tweak it
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {INTENTIONS.map((int) => (
                <button
                  key={int.text}
                  type="button"
                  disabled={saving}
                  onClick={() => save(int.text, int.emoji, int.vibe, false)}
                  className={`flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-left text-sm font-bold transition-all hover:-translate-y-0.5 disabled:opacity-50 ${INTENTION_VIBES[int.vibe].chip}`}
                >
                  <span className="text-xl">{int.emoji}</span>
                  <span className="leading-tight">{int.text}</span>
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-dashed border-white/20 bg-white/4 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-foreground/55">
                Or write your own
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  placeholder="e.g. Be patient with the slow moments"
                  className="border-white/20 bg-white/5 placeholder:text-foreground/40"
                  maxLength={120}
                />
                <div className="flex items-center gap-2">
                  {(Object.keys(INTENTION_VIBES) as VibeKey[]).map((v) => (
                    <button
                      key={v}
                      type="button"
                      title={INTENTION_VIBES[v].label}
                      onClick={() => setVibe(v)}
                      className={`size-7 rounded-full border-2 transition-transform hover:scale-110 ${
                        vibe === v ? `ring-2 ring-offset-2 ring-offset-background ${INTENTION_VIBES[v].ring}` : "border-white/25"
                      }`}
                      style={{ background: INTENTION_VIBES[v].hex }}
                    />
                  ))}
                </div>
              </div>
              <Button
                className="mt-3 gap-2 rounded-full bg-amber-300 font-extrabold text-amber-950 hover:bg-amber-200"
                disabled={saving || custom.trim().length === 0}
                onClick={() => save(custom.trim(), "💫", vibe, true)}
              >
                {saving ? "Planting…" : "Plant it"} <Sparkles className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Reminders card                                                     */
/* ------------------------------------------------------------------ */

function RemindersCard({ getIntention }: { getIntention: () => string | null }) {
  const {
    enabled,
    slots,
    permission,
    nextIn,
    lastNudged,
    toggleEnabled,
    setSlots,
    nudgeNow,
  } = useReminders(getIntention);

  const toggleSlot = (time: string) => {
    if (slots.includes(time)) {
      setSlots(slots.filter((s) => s !== time));
    } else {
      setSlots([...slots, time].sort());
    }
  };

  const permissionHint =
    permission === "denied" ? (
      <p className="text-xs text-rose-300">
        Notifications are blocked in your browser. Allow them in your site
        settings to get real alerts — in-app nudges still work.
      </p>
    ) : permission === "unsupported" ? (
      <p className="text-xs text-foreground/55">
        This browser doesn't support notifications, so we'll nudge you in-app.
      </p>
    ) : null;

  return (
    <Card className="border-white/15 bg-white/6 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Bell className="size-5 text-amber-300" /> Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-bold">Let Ember remind you</p>
            <p className="text-sm text-foreground/60">
              {enabled
                ? nextIn
                  ? `Next nudge in about ${nextIn}`
                  : "Scheduled"
                : "A soft whisper of your intention, right when you need it"}
            </p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={(v) => void toggleEnabled(v)}
            className="data-[state=checked]:bg-amber-300"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {REMINDER_SLOTS.map((slot) => {
            const active = slots.includes(slot.time);
            return (
              <button
                key={slot.time}
                type="button"
                disabled={!enabled}
                onClick={() => toggleSlot(slot.time)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-all disabled:opacity-40 ${
                  active
                    ? "border-amber-300/60 bg-amber-300/15 text-amber-200"
                    : "border-white/15 bg-white/5 text-foreground/60 hover:border-white/30"
                }`}
              >
                {slot.emoji} {slot.label} · {slot.time}
                {active && <Check className="size-3.5" />}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            variant="outline"
            className="gap-2 rounded-full border-amber-300/40 bg-amber-300/10 font-bold text-amber-200 hover:bg-amber-300/20"
            onClick={nudgeNow}
          >
            <BellRing className="size-4" />
            Nudge me now
          </Button>
          {lastNudged && (
            <span className="text-xs text-foreground/55">
              Last nudged at{" "}
              {lastNudged.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
        {permissionHint}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz card                                                          */
/* ------------------------------------------------------------------ */

function QuizCard({ onSetIntention }: { onSetIntention: (t: string) => void }) {
  const result = useQuery(api.quiz.getMyResult);
  const saveResult = useMutation(api.quiz.saveResult);
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(ARCHETYPES.map((a) => [a.id, 0])),
  );
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);

  const winner: Archetype | null = useMemo(() => {
    if (!finished) return null;
    const max = Math.max(...Object.values(scores));
    const id = Object.entries(scores).find(([, v]) => v === max)?.[0] ?? "firefly";
    return archetypeById(id);
  }, [finished, scores]);

  const start = () => {
    setStarted(true);
    setStep(0);
    setFinished(false);
    setScores(Object.fromEntries(ARCHETYPES.map((a) => [a.id, 0])));
  };

  const answer = async (archetypeId: string) => {
    const next = { ...scores, [archetypeId]: (scores[archetypeId] ?? 0) + 1 };
    setScores(next);
    if (step + 1 >= QUIZ_QUESTIONS.length) {
      setFinished(true);
      const max = Math.max(...Object.values(next));
      const id = Object.entries(next).find(([, v]) => v === max)?.[0] ?? "firefly";
      setSaving(true);
      try {
        await saveResult({ archetype: id, scores: next });
      } catch {
        toast.error("Couldn't save your result", {
          description: "It's still yours — you can retake anytime.",
        });
      } finally {
        setSaving(false);
      }
    } else {
      setStep((s) => s + 1);
    }
  };

  const q = QUIZ_QUESTIONS[step];

  // Show the saved archetype if one exists and we're not mid-quiz
  const saved = result && !started ? archetypeById(result.archetype) : null;
  const showResult = finished ? winner : saved;

  return (
    <Card className="border-white/15 bg-white/6 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Wand2 className="size-5 text-violet-300" /> The Glow Quiz
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {!started && !finished && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              {showResult ? (
                <div>
                  <div className="flex flex-col items-center gap-4 text-center">
                    <span className="text-6xl">{showResult.emoji}</span>
                    <div>
                      <h3 className="text-2xl font-extrabold">
                        You are {showResult.name}
                      </h3>
                      <p className="mt-1 text-violet-200">{showResult.tagline}</p>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-foreground/75">
                    {showResult.description}
                  </p>
                  <div className="mt-4 rounded-2xl border border-white/12 bg-white/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-foreground/55">
                      Your micro-practice
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed">
                      {showResult.practice}
                    </p>
                  </div>
                  <div className="mt-5">
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-foreground/55">
                      Intentions that fit you
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {showResult.intentions.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => onSetIntention(t)}
                          className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm font-bold transition-colors hover:border-amber-300/50 hover:bg-amber-300/10"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-6 gap-2 rounded-full border-white/20 bg-white/5 hover:bg-white/10"
                    onClick={start}
                  >
                    <RotateCcw className="size-4" /> Retake the quiz
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                  <span className="text-6xl">✨</span>
                  <div>
                    <h3 className="text-2xl font-extrabold">
                      Which glow are you?
                    </h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-foreground/70">
                      Six quick questions. Meet your intention-archetype and get
                      practices + intentions that fit how you naturally shine.
                    </p>
                  </div>
                  <Button
                    className="gap-2 rounded-full bg-violet-300 font-extrabold text-amber-950 hover:bg-violet-200"
                    onClick={start}
                  >
                    <Sparkles className="size-4" /> Take the quiz
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {started && !finished && q && (
            <motion.div
              key={`q-${step}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-foreground/55">
                <span>
                  Question {step + 1} of {QUIZ_QUESTIONS.length}
                </span>
                <span className="text-violet-300">{q.emoji}</span>
              </div>
              <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-amber-300 to-violet-400"
                  animate={{ width: `${((step + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <h3 className="text-xl font-extrabold leading-snug">{q.question}</h3>
              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {q.answers.map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    disabled={saving}
                    onClick={() => void answer(a.archetype)}
                    className="rounded-2xl border border-white/12 bg-white/5 px-4 py-3.5 text-left text-sm font-semibold transition-all hover:-translate-y-0.5 hover:border-violet-300/50 hover:bg-violet-400/10"
                  >
                    {a.label}
                  </button>
                ))}
              </div>
              {saving && (
                <p className="mt-4 text-sm text-violet-300">
                  Saving your glow…
                </p>
              )}
            </motion.div>
          )}

          {finished && winner && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <motion.span
                  className="text-7xl"
                  initial={{ y: -16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                >
                  {winner.emoji}
                </motion.span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-foreground/55">
                    Your glow is
                  </p>
                  <h3 className="text-3xl font-extrabold">
                    {winner.name} <span className={winner.glow}>✦</span>
                  </h3>
                  <p className="mt-1 font-semibold text-foreground/70">
                    {winner.tagline}
                  </p>
                </div>
              </div>
              <div className="mt-6 space-y-2.5">
                {ARCHETYPES.map((a) => {
                  const score = scores[a.id] ?? 0;
                  const pct = (score / QUIZ_QUESTIONS.length) * 100;
                  return (
                    <div key={a.id} className="flex items-center gap-3">
                      <span className="w-28 shrink-0 text-sm font-bold">
                        {a.emoji} {a.name}
                      </span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className={`h-full rounded-full ${a.bar}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, ease: EASE }}
                        />
                      </div>
                      <span className="w-6 shrink-0 text-right text-xs text-foreground/55">
                        {score}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-5 text-sm leading-relaxed text-foreground/75">
                {winner.description}
              </p>
              <div className="mt-4 rounded-2xl border border-white/12 bg-white/5 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-foreground/55">
                  Your micro-practice
                </p>
                <p className="mt-1.5 text-sm leading-relaxed">
                  {winner.practice}
                </p>
              </div>
              <div className="mt-5">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-foreground/55">
                  Intentions that fit you
                </p>
                <div className="flex flex-wrap gap-2">
                  {winner.intentions.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => onSetIntention(t)}
                      className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm font-bold transition-colors hover:border-amber-300/50 hover:bg-amber-300/10"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                className="mt-6 gap-2 rounded-full border-white/20 bg-white/5 hover:bg-white/10"
                onClick={start}
              >
                <RotateCcw className="size-4" /> Retake
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  History card                                                       */
/* ------------------------------------------------------------------ */

function HistoryCard() {
  const history = useQuery(api.intentions.listForUser);
  const streak = useQuery(api.intentions.getStreak);

  const recent = history?.slice(0, 8) ?? [];

  return (
    <Card className="border-white/15 bg-white/6 backdrop-blur-md">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-xl">
          <History className="size-5 text-rose-300" /> Your glow history
        </CardTitle>
        <div className="flex items-center gap-1.5 rounded-full border border-orange-300/30 bg-orange-400/10 px-3.5 py-1.5">
          <Flame className="size-4 text-orange-300" />
          <span className="text-sm font-extrabold text-orange-200">
            {streak?.streak ?? 0}-day streak
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/4 p-6 text-center text-sm text-foreground/60">
            <p className="text-3xl">🌱</p>
            <p className="mt-2 font-bold">No intentions yet</p>
            <p>Set today's glow above and your little garden starts here.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {recent.map((int) => (
              <li
                key={int._id}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/4 px-4 py-2.5"
              >
                <span className="text-2xl">{int.emoji}</span>
                <span className="flex-1 text-sm font-semibold">{int.text}</span>
                <span className="text-xs tabular-nums text-foreground/50">
                  {new Date(`${int.dayKey}T12:00:00`).toLocaleDateString([], {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
        {streak && streak.total > 0 && (
          <p className="mt-4 text-xs text-foreground/55">
            {streak.total} intention{streak.total === 1 ? "" : "s"} planted so far
            {streak.streak > 0 ? " · keep the flame alive" : ""}.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const dayKey = useTodayKey();
  const today = useQuery(api.intentions.getToday, { dayKey });
  const setToday = useMutation(api.intentions.setToday);
  const tip = tipOfTheDay(new Date());

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const plantFromQuiz = async (text: string) => {
    const match = INTENTIONS.find((i) => i.text === text);
    const vibe = match?.vibe ?? "glow";
    const emoji = match?.emoji ?? "💫";
    try {
      await setToday({
        dayKey: dayKeyFor(new Date()),
        text,
        emoji,
        vibe,
        isCustom: !match,
      });
      toast("✨ Intention planted", {
        description: `Today you mean to: “${text}”`,
      });
    } catch (e) {
      toast.error("Couldn't plant that one", {
        description: e instanceof Error ? e.message : "Please try again.",
      });
    }
  };

  return (
    <main className="min-h-screen text-foreground">
      <FloatingBackground count={22} />
      <div className="relative z-10 mx-auto max-w-5xl px-5 py-8 sm:px-8">
        {/* Header */}
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <EmberMark />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-300/80">
                {new Date().toLocaleDateString([], {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                {user?.name ? `Hello, ${user.name.split(" ")[0]} 👋` : "Hello, glow-bringer 👋"}
              </h1>
            </div>
          </div>
          <Button
            variant="outline"
            className="gap-2 self-start rounded-full border-white/20 bg-white/5 hover:bg-white/10 sm:self-auto"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" /> Sign out
          </Button>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-8">
            <IntentionCard />
            <RemindersCard getIntention={() => today?.text ?? null} />
            <HistoryCard />
          </div>

          <div className="flex flex-col gap-8">
            <QuizCard onSetIntention={(t) => void plantFromQuiz(t)} />
            <Card className="border-white/15 bg-white/6 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Lightbulb className="size-5 text-emerald-300" /> Today's little
                  nudge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/8 p-5">
                  <div className="text-4xl">{tip.emoji}</div>
                  <h3 className="mt-3 text-lg font-extrabold">{tip.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground/75">
                    {tip.body}
                  </p>
                  <Badge className="mt-4 rounded-full bg-emerald-300/15 text-emerald-200">
                    Tip of the day
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}