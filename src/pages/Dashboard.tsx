import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Bell,
  Clock,
  Edit3,
  Flame,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/AppShell";
import { DiveInDialog } from "@/components/DiveInDialog";
import { PersonalityQuiz } from "@/components/PersonalityQuiz";
import { StarEditor } from "@/components/StarEditor";
import { StarSky, SkyStarLike } from "@/components/StarSky";
import { StyleQuiz } from "@/components/StyleQuiz";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useAuth } from "@/hooks/use-auth";
import {
  REMINDER_SLOTS,
  useReminders,
} from "@/hooks/use-reminders";
import { momentLabel, shiftOfTheDay, starColor, styleById } from "@/lib/shift-data";
import { QUIZ_PACKS, resultById } from "@/lib/quiz-packs";
import { ReflectionHeroCard, ReflectionLedger } from "@/components/ReflectionLedger";

export default function Dashboard() {
  const { user } = useAuth();

  const starsData = useQuery(api.stars.listForUser);
  const streakData = useQuery(api.stars.getStreak);
  const quizData = useQuery(api.quiz.getMyResult);
  const deepResults = useQuery(api.personality.myResults) ?? [];
  const setActiveStar = useMutation(api.stars.setActive);
  const moveStar = useMutation(api.stars.update);
  const removeStar = useMutation(api.stars.remove);

  const stars: SkyStarLike[] = useMemo(
    () =>
      (starsData ?? []).map((s) => ({
        _id: s._id,
        text: s.text,
        moment: s.moment,
        emoji: s.emoji,
        colorKey: s.colorKey,
        x: s.x,
        y: s.y,
        active: s.active,
      })),
    [starsData],
  );

  const activeStar = stars.find((s) => s.active) ?? null;
  const shift = useMemo(() => shiftOfTheDay(new Date()), []);
  const style = quizData ? styleById(quizData.styleId) : null;
  const loading = starsData === undefined;

  const reminders = useReminders(() => activeStar?.text ?? null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorTarget, setEditorTarget] = useState<{ x: number; y: number }>();
  const [editing, setEditing] = useState<SkyStarLike | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [deepOpen, setDeepOpen] = useState<string | null>(null);
  const [diveOpen, setDiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busyId, setBusyId] = useState<Id<"stars"> | null>(null);
  const [customTime, setCustomTime] = useState("07:30");
  const [editorDraft, setEditorDraft] = useState<{
    text?: string;
    moment?: string;
    colorKey?: string;
  } | null>(null);

  const hour = new Date().getHours();
  const greeting =
    hour < 5
      ? "Up late, still stargazing"
      : hour < 12
        ? "Good morning"
        : hour < 18
          ? "Good afternoon"
          : "Good evening";
  const firstName = user?.name?.split(" ")[0] ?? "Stargazer";
  const focusColor = starColor(activeStar?.colorKey ?? "nova");

  // The black hole in the sky opens the quiz list; a pick launches that quiz.
  const handleDivePick = (kind: string) => {
    if (kind === "style") {
      setQuizOpen(true);
    } else {
      setDeepOpen(kind);
    }
  };

  const openFreshEditor = () => {
    setEditing(null);
    setEditorDraft(null);
    setEditorTarget(undefined);
    setEditorOpen(true);
  };

  // Borrowing a quiz suggestion opens the editor prefilled at a random spot.
  const handleQuizIntention = (draft: {
    text: string;
    moment: string;
    colorKey: string;
  }) => {
    setQuizOpen(false);
    setDeepOpen(null);
    setEditing(null);
    setEditorTarget(undefined);
    setEditorDraft(draft);
    setEditorOpen(true);
  };

  const handlePick = (id: Id<"stars">) => {
    const star = stars.find((s) => s._id === id);
    if (!star || star.active) return;
    void setActiveStar({ id }).catch((err) => {
      console.error(err);
      toast("Couldn't focus that star", { description: "Try again in a moment." });
    });
  };

  const handleDrop = (id: Id<"stars">, x: number, y: number) => {
    setBusyId(id);
    void moveStar({ id, x, y })
      .catch((err) => {
        console.error(err);
        toast("Star slipped", { description: "Couldn't save its new spot." });
      })
      .finally(() => setBusyId(null));
  };

  const handleRemove = async () => {
    if (!activeStar) return;
    try {
      await removeStar({ id: activeStar._id });
      toast("Star released", {
        description: "“" + activeStar.text.slice(0, 60) + "” drifted out of your sky.",
      });
    } catch (err) {
      console.error(err);
      toast("Couldn't release that star", { description: "Try again in a moment." });
    } finally {
      setDeleteOpen(false);
    }
  };

  return (
    <AppShell title="My Sky">
      <div className="space-y-6">
        {/* Greeting row */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {new Date().toLocaleDateString([], {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {greeting}, <span className="text-amber-300">{firstName}</span>{" "}
              <span className="inline-block animate-sway">✦</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeStar
                ? `Tonight you're being: “${activeStar.text}”`
                : "Pick how you want to show up — then hang it in your sky."}
            </p>
          </div>
          <Button
            onClick={openFreshEditor}
            className="rounded-full bg-amber-300 font-bold text-amber-950 hover:bg-amber-200"
          >
            <Plus className="mr-1.5 h-4 w-4" /> New intention
          </Button>
        </div>

        {/* The sky */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="relative">
            <StarSky
              stars={stars}
              onPick={handlePick}
              onDrop={handleDrop}
              onRequestCreate={(x, y) => {
                setEditing(null);
                setEditorDraft(null);
                setEditorTarget({ x, y });
                setEditorOpen(true);
              }}
              onDiveIn={() => setDiveOpen(true)}
              className="h-[54vh] min-h-[400px] w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#03050e] via-[#071026] to-[#0d1a33]"
              hint={
                stars.length === 0
                  ? undefined
                  : "drag stars to move them · tap one to make it your focus"
              }
            />
            {loading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-[#03050e]/70 backdrop-blur-sm">
                <Loader2 className="h-6 w-6 animate-spin text-amber-200" />
              </div>
            )}
            {!loading && stars.length === 0 && (
              <div
                className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
                aria-hidden
              >
                <div className="max-w-sm rounded-3xl border border-white/12 bg-black/35 p-6 text-center backdrop-blur-sm">
                  <p className="text-3xl">🌌</p>
                  <p className="mt-2 text-lg font-bold tracking-tight">
                    Your sky is empty — for now
                  </p>
                  <p className="mt-1 text-sm text-foreground/70">
                    Tap anywhere up here to hang a star, or borrow one of the
                    ready-made intentions.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Ledger-so-far summary */}
        <ReflectionHeroCard />

        {/* Stat tiles */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* North star */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              North star · right now
            </p>
            {activeStar ? (
              <div className="mt-3 space-y-3">
                <div className="flex items-start gap-3">
                  <span
                    className="animate-star-pop flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-2xl ring-1 ring-white/10"
                    style={{
                      color: focusColor.hex,
                      textShadow: `0 0 14px ${focusColor.glow}`,
                    }}
                  >
                    {activeStar.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold leading-snug">
                      “{activeStar.text}”
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      For: {momentLabel(activeStar.moment)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(activeStar);
                      setEditorDraft(null);
                      setEditorTarget(undefined);
                      setEditorOpen(true);
                    }}
                    className="h-8 border-white/15 bg-white/5 text-xs hover:bg-white/10"
                  >
                    <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteOpen(true)}
                    className="h-8 border-rose-400/20 bg-rose-400/5 text-xs text-rose-200 hover:bg-rose-400/15"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Release
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <p className="text-sm text-foreground/60">
                  No star is lit yet. Tap any star in your sky — or hang a new
                  one — to set today's focus.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={openFreshEditor}
                  className="border-amber-300/40 bg-amber-300/10 text-amber-100 hover:bg-amber-300/20"
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Hang my focus
                </Button>
              </div>
            )}
          </div>

          {/* Streak */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Streak
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400/25 to-rose-400/20 text-2xl ring-1 ring-orange-300/20">
                {streakData?.streak ? "🔥" : "🌱"}
              </span>
              <div>
                <p className="text-2xl font-extrabold tracking-tight">
                  {streakData?.streak ?? 0}
                  <span className="ml-1 text-sm font-semibold text-muted-foreground">
                    day{streakData?.streak === 1 ? "" : "s"}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {streakData?.streak
                    ? "showing up for yourself"
                    : "hang a star today to start"}
                </p>
              </div>
            </div>
            <p className="mt-3 border-t border-white/8 pt-3 text-xs text-muted-foreground">
              <span className="font-semibold text-amber-200/90">
                {streakData?.total ?? stars.length}
              </span>{" "}
              stars in your sky so far
            </p>
          </div>

          {/* Shift of the day */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Today's micro-shift
            </p>
            <div className="mt-3 flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-2xl ring-1 ring-white/10">
                {shift.emoji}
              </span>
              <div className="min-w-0">
                <p className="font-semibold leading-snug">{shift.title}</p>
                <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                  {shift.body}
                </p>
              </div>
            </div>
          </div>

          {/* Response style */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Your archetype
            </p>
            {style ? (
              <div className="mt-3 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-2xl ring-1 ring-white/10">
                    {style.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className={`font-bold ${style.glow}`}>
                      {style.emoji} {style.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground/80">
                      {style.element}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {style.tagline}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setQuizOpen(true)}
                  className="h-8 border-white/15 bg-white/5 text-xs hover:bg-white/10"
                >
                  Retake the quiz
                </Button>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <p className="text-sm text-foreground/60">
                  Eight questions. One honest reading of where your energy
                  lives — and what shadows it.
                </p>
                <Button
                  size="sm"
                  onClick={() => setQuizOpen(true)}
                  className="h-8 rounded-full bg-amber-300 font-bold text-amber-950 hover:bg-amber-200"
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Find my style
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Go deeper — the personality quizzes */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Go deeper
              </p>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Three honest readings of how you move through the world — each
                one ends with intentions cut to fit what you learn.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {QUIZ_PACKS.map((pack) => {
              const saved = deepResults.find((r) => r.kind === pack.kind);
              const savedResult = saved ? resultById(pack, saved.resultId) : null;
              return (
                <button
                  key={pack.kind}
                  type="button"
                  onClick={() => setDeepOpen(pack.kind)}
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition-all hover:border-amber-300/40 hover:bg-amber-300/[0.06]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-2xl">{pack.emoji}</span>
                    {savedResult && (
                      <span
                        className={`rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold ${savedResult.hue}`}
                      >
                        {savedResult.name}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 font-bold tracking-tight">{pack.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {savedResult
                      ? savedResult.tagline
                      : `${pack.questions.length} questions · ${pack.subtitle}`}
                  </p>
                  <p className="mt-2 text-[11px] font-semibold text-amber-200/70 transition-colors group-hover:text-amber-200">
                    {savedResult ? "Retake →" : "Take the quiz →"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reminders */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300/15 text-xl ring-1 ring-amber-300/25">
                <Bell className="h-5 w-5 text-amber-200" />
              </span>
              <div>
                <p className="font-bold">Nudge me back to my intention</p>
                <p className="mt-0.5 max-w-md text-xs leading-relaxed text-muted-foreground">
                  {activeStar
                    ? `We'll check in and remind you: “${activeStar.text.slice(0, 70)}”`
                    : "Set a focus star and we'll remind you how you meant to show up."}{" "}
                  Reminders arrive as toasts — and as system notifications when
                  you allow them.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {reminders.enabled
                  ? reminders.nextIn
                    ? `Next nudge in ~${reminders.nextIn}`
                    : "scheduled"
                  : "off"}
              </span>
              <Switch
                checked={reminders.enabled}
                onCheckedChange={(v) => void reminders.toggleEnabled(v)}
                disabled={
                  reminders.permission === "denied" && !reminders.enabled
                }
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/8 pt-4">
            {REMINDER_SLOTS.map((slot) => {
              const on = reminders.slots.includes(slot.time);
              return (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!reminders.enabled}
                  onClick={() =>
                    reminders.setSlots(
                      on
                        ? reminders.slots.filter((t) => t !== slot.time)
                        : [...reminders.slots, slot.time].sort(),
                    )
                  }
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    on
                      ? "border-amber-300/60 bg-amber-300/15 text-amber-100"
                      : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/25"
                  }`}
                >
                  <span>{slot.emoji}</span>
                  {slot.label}
                  <span className="tabular-nums text-[10px] opacity-70">
                    {slot.time}
                  </span>
                </button>
              );
            })}
            {/* Custom time */}
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="time"
                value={customTime}
                disabled={!reminders.enabled}
                onChange={(e) => setCustomTime(e.target.value)}
                aria-label="Custom reminder time"
                className="bg-transparent text-xs tabular-nums outline-none [color-scheme:dark] disabled:opacity-40"
              />
              <button
                type="button"
                disabled={!reminders.enabled || !customTime}
                onClick={() =>
                  reminders.setSlots(
                    reminders.slots.includes(customTime)
                      ? reminders.slots.filter((t) => t !== customTime)
                      : [...reminders.slots, customTime].sort(),
                  )
                }
                aria-label={
                  reminders.slots.includes(customTime)
                    ? "Remove this custom time"
                    : "Add this custom time"
                }
                className="text-muted-foreground transition-colors hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {reminders.slots.includes(customTime) ? (
                  <X className="h-3.5 w-3.5" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {reminders.permission === "default" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void reminders.requestPermission()}
                  className="h-8 text-xs text-muted-foreground"
                >
                  Allow notifications
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                disabled={!reminders.enabled}
                onClick={() => reminders.nudgeNow()}
                className="h-8 border-white/15 bg-white/5 text-xs hover:bg-white/10"
              >
                Test a nudge
              </Button>
            </div>
          </div>
          {reminders.permission === "denied" && (
            <p className="mt-3 text-xs text-rose-200/80">
              Notifications are blocked in your browser — toasts will still
              reach you while this tab is open.
            </p>
          )}
        </div>

        {/* Evening reflection ledger */}
        <ReflectionLedger intentionText={activeStar?.text ?? null} />
      </div>

      <StarEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        target={editorTarget}
        draft={editorDraft}
        existing={
          editing
            ? {
                _id: editing._id,
                text: editing.text,
                moment: editing.moment,
                emoji: editing.emoji,
                colorKey: editing.colorKey,
              }
            : null
        }
      />

      <StyleQuiz
        open={quizOpen}
        onOpenChange={setQuizOpen}
        onHangIntention={handleQuizIntention}
      />

      <DiveInDialog
        open={diveOpen}
        onOpenChange={setDiveOpen}
        onPickQuiz={handleDivePick}
      />

      {QUIZ_PACKS.map((pack) => (
        <PersonalityQuiz
          key={pack.kind}
          pack={pack}
          open={deepOpen === pack.kind}
          onOpenChange={(next) => setDeepOpen(next ? pack.kind : null)}
          onHangIntention={handleQuizIntention}
        />
      ))}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="border-white/12 bg-[#0b1322]/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Release this star?</AlertDialogTitle>
            <AlertDialogDescription>
              “{activeStar?.text}” will drift out of your sky. Its glow is gone
              for good — unless you hang it again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleRemove();
              }}
              className="rounded-full bg-rose-400/90 font-bold text-rose-950 hover:bg-rose-300"
            >
              Release it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {busyId && <span className="sr-only">moving star</span>}
    </AppShell>
  );
}
