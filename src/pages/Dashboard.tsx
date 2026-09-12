import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Bell,
  Clock,
  Edit3,
  Loader2,
  Lock,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/AppShell";
import { BreathOrb } from "@/components/BreathOrb";
import { DiveInDialog } from "@/components/DiveInDialog";
import { MindGym } from "@/components/MindGym";
import { PersonalityQuiz } from "@/components/PersonalityQuiz";
import { StarEditor } from "@/components/StarEditor";
import { StarSky, SkyStarLike } from "@/components/StarSky";
import { StyleQuiz } from "@/components/StyleQuiz";
import { ToneDetector } from "@/components/ToneDetector";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAuth } from "@/hooks/use-auth";
import {
  REMINDER_SLOTS,
  useReminders,
} from "@/hooks/use-reminders";
import { momentLabel, shiftOfTheDay, starColor, styleById } from "@/lib/shift-data";
import { QUIZ_PACKS, resultById } from "@/lib/quiz-packs";
import { randomWishStarter } from "@/lib/sky-events";
import { ReflectionHeroCard, ReflectionLedger } from "@/components/ReflectionLedger";
import {
  ConstellationProgress,
  FirstLight,
  RankPanel,
  WelcomeBack,
} from "@/components/SkyQuest";
import { rankNameForLevel, useSkyRank } from "@/lib/unlocks";

export default function Dashboard() {
  const { user } = useAuth();

  const starsData = useQuery(api.stars.listForUser);
  const streakData = useQuery(api.stars.getStreak);
  const quizData = useQuery(api.quiz.getMyResult);
  const todayReflection = useQuery(api.reflections.getToday);
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

  // Sky rank: the more you come back and engage, the more your sky opens up.
  const rank = useSkyRank();

  const reminders = useReminders(() => activeStar?.text ?? null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorTarget, setEditorTarget] = useState<{ x: number; y: number }>();
  const [editing, setEditing] = useState<SkyStarLike | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [deepOpen, setDeepOpen] = useState<string | null>(null);
  const [diveOpen, setDiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [section, setSection] = useState("tonight");
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

  // A caught falling wish opens the editor with its sentence starter.
  const handleCatchWish = (starter: string, x: number, y: number) => {
    setEditing(null);
    setEditorTarget({ x, y });
    setEditorDraft({ text: starter, colorKey: "nova" });
    setEditorOpen(true);
    toast("✨ Wish caught", {
      description: "Finish the sentence and hang it where it fell.",
    });
  };

  // Newborn stars (starbloom nights) open a fresh editor where they were tapped.
  const handleCatchBloom = (x: number, y: number) => {
    setEditing(null);
    setEditorTarget({ x, y });
    setEditorDraft({ text: randomWishStarter(), colorKey: "wave" });
    setEditorOpen(true);
    toast("🌟 Newborn star", {
      description: "It's brightest now — name what you want to grow.",
    });
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
      <div className="space-y-7">
        {/* Greeting row */}
        <div className="section-rule flex flex-wrap items-end justify-between gap-4 pb-5">
          <div>
            <p className="font-eyebrow text-muted-foreground">
              {new Date().toLocaleDateString([], {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <h1 className="text-clearing-soft mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {greeting}, <span className="text-emerald-200">{firstName}</span>{" "}
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
            className="rounded-full bg-foreground font-semibold text-background hover:bg-foreground/85"
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
              showMoon
              onCatchWish={handleCatchWish}
              onCatchBloom={handleCatchBloom}
              deepSky={rank.level >= 4}
              golden={rank.level >= 5}
              className="radius-sheet h-[54vh] min-h-[400px] w-full overflow-hidden border border-white/10 sky-gradient"
              hint={
                stars.length === 0
                  ? undefined
                  : "drag stars to move them · tap one to make it your focus"
              }
            />
            {loading && (
              <div className="radius-sheet absolute inset-0 z-20 flex items-center justify-center bg-[#0e1634]/70 backdrop-blur-sm">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-200" />
              </div>
            )}
            {!loading && stars.length === 0 && (
              <div
                className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
                aria-hidden
              >
                <div className="max-w-sm rounded-xl border border-white/14 bg-[#131b3e]/50 p-6 text-center backdrop-blur-sm">
                  <p className="text-3xl">🌌</p>
                  <p className="mt-2 text-lg font-bold tracking-tight">
                    Your sky is empty — for now
                  </p>
                  <p className="mt-1 text-sm text-foreground/80">
                    Tap anywhere up here to hang a star, or borrow one of the
                    ready-made intentions.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Welcome back for returning skies, then the first-light quest */}
        <WelcomeBack />

        <FirstLight
          hasStar={stars.length > 0}
          hasQuiz={quizData !== null && quizData !== undefined}
          hasReflection={todayReflection !== null && todayReflection !== undefined}
          onHangStar={openFreshEditor}
          onTakeQuiz={() => setQuizOpen(true)}
          onGoToLedger={() => setSection("evening")}
        />

        {/* Everything below the fold lives in sections — one glance per visit,
            not one endless scroll. */}
        <Tabs
          value={section}
          onValueChange={(v) => {
            setSection(v);
            requestAnimationFrame(() =>
              window.scrollTo({ top: 0, behavior: "smooth" }),
            );
          }}
        >
          <TabsList className="sticky top-16 z-30 lg:top-6">
            <TabsTrigger value="tonight">Tonight</TabsTrigger>
            <TabsTrigger value="deeper">Go deeper</TabsTrigger>
            <TabsTrigger value="evening">Evening</TabsTrigger>
          </TabsList>

          {/* ---- Section 1 · Tonight ---- */}
          <TabsContent value="tonight" className="mt-6 space-y-7 outline-none">
        {/* Ledger-so-far summary */}
        <ReflectionHeroCard />

        {/* Stat tiles */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* North star */}
          <div className="panel p-5">
            <p className="font-eyebrow text-muted-foreground">
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
                <p className="text-sm text-foreground/75">
                  No star is lit yet. Tap any star in your sky — or hang a new
                  one — to set today's focus.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={openFreshEditor}
                  className="border-emerald-300/40 bg-emerald-300/10 text-emerald-100 hover:bg-emerald-300/20"
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Hang my focus
                </Button>
              </div>
            )}
          </div>

          {/* Streak */}
          <div className="panel p-5">
            <p className="font-eyebrow text-muted-foreground">
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
              <span className="font-semibold text-emerald-200/90">
                {streakData?.total ?? stars.length}
              </span>{" "}
              stars in your sky so far
            </p>
          </div>

          {/* Shift of the day */}
          <div className="panel p-5">
            <p className="font-eyebrow text-muted-foreground">
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
          <div className="panel p-5">
            <p className="font-eyebrow text-muted-foreground">
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
                <p className="text-sm text-foreground/75">
                  Eight questions. One honest reading of where your energy
                  lives — and what shadows it.
                </p>
                <Button
                  size="sm"
                  onClick={() => setQuizOpen(true)}
                  className="h-8 rounded-full bg-foreground font-semibold text-background hover:bg-foreground/85"
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Find my style
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* The tone lab — read a message before you send it */}
        <ToneDetector compact />

        {/* Mind gym — daily reps between the reflection and the rank */}
        <div className="panel p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-eyebrow text-muted-foreground">The mind gym</p>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                One-minute reps for the choosing muscle — catch an urge, unhook
                a thought, ground your senses, turn a lens, find your pull.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <MindGym />
          </div>
        </div>

        {/* Pocket reset — the same guided breath, one tap away */}
        <div className="panel flex flex-wrap items-center justify-between gap-5 p-5">
          <div className="min-w-[220px] flex-1">
            <p className="font-eyebrow text-muted-foreground">Pocket reset · 4-7-8</p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Feeling the old pattern pull? One guided minute moves you from
              reaction to choice — in for four, hold for seven, out for eight.
            </p>
          </div>
          <BreathOrb compact />
        </div>

          </TabsContent>

          {/* ---- Section 2 · Go deeper ---- */}
          <TabsContent value="deeper" className="mt-6 space-y-7 outline-none">
        {/* Sky rank — the reason the sky keeps opening up */}
        <RankPanel />

        {/* The Observatory — the science behind the sky */}
        <Link
          to="/observatory"
          className="panel panel-hover group relative block overflow-hidden p-5"
        >
          <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-emerald-200/10 blur-3xl" />
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-200/25 bg-emerald-200/10 text-xl">
              🔭
            </span>
            <div className="min-w-[200px] flex-1">
              <p className="text-sm font-bold tracking-tight">
                The Observatory — star charts for a changing mind
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                Free, hand-picked science on neuroplasticity, breaking engrained
                loops, and why setting an intention actually rewires your brain. A
                new chart every night.
              </p>
            </div>
            <span className="font-eyebrow text-emerald-200/80 transition-transform group-hover:translate-x-0.5">
              Look through →
            </span>
          </div>
        </Link>

        {/* Go deeper — the personality quizzes */}
        <div className="panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-eyebrow text-muted-foreground">Go deeper</p>
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
                  className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left transition-all hover:border-emerald-300/30 hover:bg-emerald-300/[0.05]"
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
                  <p className="font-eyebrow mt-2 text-emerald-200/70 transition-colors group-hover:text-emerald-200">
                    {savedResult ? "Retake →" : "Take the quiz →"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reminders */}
        <div className="panel p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-200/25 bg-emerald-200/10">
                <Bell className="h-5 w-5 text-emerald-200" />
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
            {REMINDER_SLOTS.filter((s) => !s.level || rank.level >= s.level).map((slot) => {
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
                      ? "border-emerald-300/50 bg-emerald-300/12 text-emerald-100"
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
            {/* The vigil slot appears once the Ember rank is reached */}
            {rank.level < 3 && (
              <span
                title={`Reach the ${rankNameForLevel(3)} rank to unlock the 22:30 nudge`}
                className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground/75"
              >
                <Lock className="h-3 w-3" />
                Late vigil · 22:30
                <span className="text-[10px] uppercase tracking-wider opacity-70">
                  {rankNameForLevel(3)}
                </span>
              </span>
            )}
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
                className="text-muted-foreground transition-colors hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-40"
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

          </TabsContent>

          {/* ---- Section 3 · Evening ---- */}
          <TabsContent value="evening" className="mt-6 space-y-7 outline-none">
            {/* Evening reflection ledger */}
            <div id="evening-ledger">
              <ReflectionLedger intentionText={activeStar?.text ?? null} />
            </div>

            {/* Thirty nights, drawn as a constellation */}
            <ConstellationProgress />
          </TabsContent>
        </Tabs>
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
        <AlertDialogContent className="border-white/14 bg-[#131b3e]/95 backdrop-blur-xl">
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
