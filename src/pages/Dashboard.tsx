import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Edit3, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/AppShell";
import { DiveInDialog } from "@/components/DiveInDialog";
import { StarEditor } from "@/components/StarEditor";
import { StarSky, SkyStarLike } from "@/components/StarSky";
import { StyleQuiz } from "@/components/StyleQuiz";
import { Button } from "@/components/ui/button";
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
import { momentLabel, shiftOfTheDay, starColor, styleById } from "@/lib/shift-data";
import { randomWishStarter } from "@/lib/sky-events";
import { ReflectionHeroCard } from "@/components/ReflectionLedger";
import { FirstLight, WelcomeBack } from "@/components/SkyQuest";
import { useSkyRank } from "@/lib/unlocks";

type QuizDraft = { text?: string; moment?: string; colorKey?: string };

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const starsData = useQuery(api.stars.listForUser);
  const streakData = useQuery(api.stars.getStreak);
  const quizData = useQuery(api.quiz.getMyResult);
  const todayReflection = useQuery(api.reflections.getToday);
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

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorTarget, setEditorTarget] = useState<{ x: number; y: number }>();
  const [editing, setEditing] = useState<SkyStarLike | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [diveOpen, setDiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busyId, setBusyId] = useState<Id<"stars"> | null>(null);
  const [editorDraft, setEditorDraft] = useState<QuizDraft | null>(null);

  // A quiz suggestion from another page (Go deeper) opens the editor here,
  // prefilled — then the handoff state is cleared so refreshes stay clean.
  const quizDraft =
    (location.state as { quizDraft?: QuizDraft } | null)?.quizDraft ?? null;
  useEffect(() => {
    if (!quizDraft) return;
    setEditing(null);
    setEditorTarget(undefined);
    setEditorDraft(quizDraft);
    setEditorOpen(true);
    navigate(".", { replace: true, state: null });
  }, [quizDraft, navigate]);

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
      navigate(`/deeper?open=${encodeURIComponent(kind)}`);
    }
  };

  const openFreshEditor = () => {
    setEditing(null);
    setEditorDraft(null);
    setEditorTarget(undefined);
    setEditorOpen(true);
  };

  // Borrowing a style-quiz suggestion opens the editor prefilled at a random spot.
  const handleQuizIntention = (draft: QuizDraft) => {
    setQuizOpen(false);
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
              <div className="radius-sheet absolute inset-0 z-20 flex items-center justify-center bg-[#2a1830]/70 backdrop-blur-sm">
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
          onGoToLedger={() => navigate("/evening")}
        />

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
