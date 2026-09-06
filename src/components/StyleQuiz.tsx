import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import {
  buildQuiz,
  ColorKey,
  momentForHour,
  QUIZ_LENGTH,
  RESPONSE_STYLES,
  SUGGESTED_STARS,
  styleById,
  type QuizQuestion,
  type ResponseStyle,
} from "@/lib/shift-data";

interface StyleQuizProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called when the user borrows a suggested intention from the result screen. */
  onHangIntention?: (draft: { text: string; moment: string; colorKey: string }) => void;
}

/** Star look matching each archetype — mirrors the pulse question. */
const STYLE_STAR: Record<
  ResponseStyle["id"],
  { emoji: string; colorKey: ColorKey }
> = {
  spark: { emoji: "☄️", colorKey: "nova" },
  anchor: { emoji: "🌟", colorKey: "wave" },
  current: { emoji: "🌙", colorKey: "pulse" },
  bloom: { emoji: "🌌", colorKey: "surge" },
};

function emptyScores(): Record<string, number> {
  return Object.fromEntries(RESPONSE_STYLES.map((s) => [s.id, 0]));
}

/** Sort the four styles from strongest to weakest for a set of scores. */
function rankedStyles(scores: Record<string, number>): ResponseStyle[] {
  return [...RESPONSE_STYLES].sort(
    (a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0),
  );
}


export function StyleQuiz({
  open,
  onOpenChange,
  onHangIntention,
}: StyleQuizProps) {
  const saveResult = useMutation(api.quiz.saveResult);
  // A fresh, shuffled deck is drawn for every run.
  const [deck, setDeck] = useState<QuizQuestion[]>(() =>
    buildQuiz(QUIZ_LENGTH),
  );
  const [step, setStep] = useState(0); // 0..n-1 questions, then -1 = result
  const [scores, setScores] = useState<Record<string, number>>(emptyScores);
  const [picks, setPicks] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [finished, setFinished] = useState<string | null>(null);

  const reset = () => {
    setDeck(buildQuiz(QUIZ_LENGTH));
    setStep(0);
    setScores(emptyScores());
    setPicks({});
    setFinished(null);
    setSaving(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (next) reset();
    onOpenChange(next);
  };

  const answer = (styleId: string) => {
    const next = { ...scores, [styleId]: (scores[styleId] ?? 0) + 1 };
    setScores(next);
    setPicks((p) => ({ ...p, [step]: styleId }));
    if (step + 1 >= deck.length) {
      finish(next);
    } else {
      setStep((s) => s + 1);
    }
  };

  // Going back un-scores the answer on the current question.
  const goBack = () => {
    const picked = picks[step];
    if (picked) {
      setScores((s) => ({
        ...s,
        [picked]: Math.max(0, (s[picked] ?? 0) - 1),
      }));
      setPicks((p) => {
        const { [step]: _removed, ...rest } = p;
        return rest;
      });
    }
    setStep((s) => Math.max(0, s - 1));
  };

  const finish = async (finalScores: Record<string, number>) => {
    setSaving(true);
    const ranked = rankedStyles(finalScores);
    const top = ranked[0];
    try {
      await saveResult({ styleId: top.id, scores: finalScores });
      setFinished(top.id);
      setStep(-1);
      const style = styleById(top.id);
      toast(`You are ${style.name.toLowerCase()}`, {
        description: style.tagline,
      });
    } catch (err) {
      console.error(err);
      toast("Couldn't save your result", {
        description: "Try that again in a second.",
      });
      setStep(deck.length - 1);
    } finally {
      setSaving(false);
    }
  };

  const question =
    step >= 0 && step < deck.length ? deck[step] : null;
  const result = finished ? styleById(finished) : null;
  const ranked = finished
    ? rankedStyles(scores).map((style) => ({
        style,
        score: scores[style.id] ?? 0,
      }))
    : [];
  const maxScore = ranked[0]?.score ?? 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-white/12 bg-[#1c1242]/95 backdrop-blur-xl sm:max-w-lg">
        <AnimatePresence mode="wait">
          {question ? (
            <motion.div
              key={`q-${step}`}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
              className="space-y-5 py-1"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Where does your energy live?
                </p>
                <p className="text-xs tabular-nums text-amber-200/80">
                  {step + 1} / {deck.length}
                </p>
              </div>

              <div className="flex gap-1.5">
                {deck.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i <= step ? "bg-amber-300" : "bg-white/10"
                    }`}
                  />
                ))}
              </div>

              <h3 className="text-xl font-bold tracking-tight text-foreground">
                <span className="mr-2">{question.emoji}</span>
                {question.question}
              </h3>

              <div className="space-y-2">
                {question.answers.map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    disabled={saving}
                    onClick={() => answer(a.style)}
                    className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-foreground/90 transition-all hover:border-amber-300/50 hover:bg-amber-300/10"
                  >
                    <span>{a.label}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-amber-200/50 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-200" />
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between">
                {step > 0 ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goBack}
                    className="text-muted-foreground"
                  >
                    <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
                  </Button>
                ) : (
                  <span />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="text-muted-foreground"
                >
                  Save for later
                </Button>
              </div>
            </motion.div>
          ) : (
            result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-5 py-1 text-center"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-white/10 to-white/5 text-5xl ring-1 ring-white/15"
                >
                  {result.emoji}
                </motion.div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Your archetype
                  </p>
                  <h3 className="mt-1 text-3xl font-extrabold tracking-tight">
                    <span className={result.glow}>{result.name}</span>
                  </h3>
                  <p className="mt-1 text-sm text-foreground/70">
                    {result.element} · {result.tagline}
                  </p>
                </div>

                <p className="mx-auto max-w-md text-sm leading-relaxed text-foreground/85">
                  {result.description}
                </p>

                {/* The shadow — every archetype has one */}
                <div className="w-full rounded-2xl border border-violet-300/25 bg-violet-300/[0.07] p-4 text-left">
                  <p className="text-xs font-bold uppercase tracking-wider text-violet-200/90">
                    🌑 Your shadow
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-violet-50/90">
                    {result.shadow}
                  </p>
                </div>

                {/* Score breakdown */}
                <div className="w-full space-y-2.5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Your full reading
                  </p>
                  {ranked.map(({ style, score }, i) => (
                    <div key={style.id} className="flex items-center gap-3">
                      <span
                        className={`w-24 shrink-0 truncate text-xs font-semibold ${
                          i === 0 ? style.glow : "text-muted-foreground"
                        }`}
                      >
                        {style.emoji} {style.name.replace("The ", "")}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/8">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${maxScore > 0 ? (score / maxScore) * 100 : 0}%`,
                          }}
                          transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
                          className={`h-full rounded-full ${style.bar}`}
                        />
                      </div>
                      <span className="w-4 text-right text-xs tabular-nums text-muted-foreground">
                        {score}
                      </span>
                    </div>
                  ))}
                  <p className="pt-0.5 text-[10px] text-muted-foreground/70">
                    Most of us are a blend — your strongest is just where you
                    start.
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-300/25 bg-amber-300/8 p-4 text-left">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-200/90">
                    Try this practice
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-amber-50/90">
                    {result.practice}
                  </p>
                </div>

                {/* Style-tuned intentions to hang */}
                <div className="w-full text-left">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    ✦ Intentions that fit {result.name.replace("The ", "")}s
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {result.intentions.map((text) => {
                      const preset = SUGGESTED_STARS.find((s) => s.text === text);
                      const look = STYLE_STAR[result.id];
                      return (
                        <button
                          key={text}
                          type="button"
                          onClick={() => {
                            onHangIntention?.({
                              text,
                              moment: preset?.moment ?? momentForHour(),
                              colorKey: preset?.colorKey ?? look.colorKey,
                            });
                          }}
                          className="group flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-left text-sm text-foreground/90 transition-all hover:border-amber-300/50 hover:bg-amber-300/10"
                        >
                          <span>
                            {look.emoji} {text}
                          </span>
                          <span className="text-xs text-amber-200/60 transition-colors group-hover:text-amber-200">
                            Hang it →
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <Button
                    onClick={() => onOpenChange(false)}
                    className="w-full rounded-full bg-amber-300 font-bold text-amber-950 hover:bg-amber-200"
                  >
                    Light up my sky
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={reset}
                    className="text-muted-foreground"
                  >
                    <RotateCcw className="mr-1.5 h-4 w-4" /> Retake the quiz
                  </Button>
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>
        {saving && (
          <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Reading your stars…
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
