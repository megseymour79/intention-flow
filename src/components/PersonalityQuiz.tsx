import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import {
  defaultMoment,
  resultById,
  type PackResult,
  type QuizPack,
} from "@/lib/quiz-packs";

interface PersonalityQuizProps {
  pack: QuizPack;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called when the user hangs an intention from the result screen. */
  onHangIntention?: (draft: {
    text: string;
    moment: string;
    colorKey: string;
  }) => void;
}

export function PersonalityQuiz({
  pack,
  open,
  onOpenChange,
  onHangIntention,
}: PersonalityQuizProps) {
  const saveResult = useMutation(api.personality.saveResult);
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [picks, setPicks] = useState<Record<number, string[]>>({});
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<PackResult | null>(null);

  const reset = () => {
    setStep(0);
    setScores({});
    setPicks({});
    setResult(null);
    setSaving(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (next) reset();
    onOpenChange(next);
  };

  const answer = (label: string, cats: string[]) => {
    const next = { ...scores };
    for (const c of cats) next[c] = (next[c] ?? 0) + 1;
    setScores(next);
    setPicks((p) => ({ ...p, [step]: cats }));
    if (step + 1 >= pack.questions.length) {
      finish(next);
    } else {
      setStep((s) => s + 1);
    }
  };

  const goBack = () => {
    const picked = picks[step];
    if (picked) {
      setScores((s) => {
        const next = { ...s };
        for (const c of picked) next[c] = Math.max(0, (next[c] ?? 0) - 1);
        return next;
      });
      setPicks((p) => {
        const rest = { ...p };
        delete rest[step];
        return rest;
      });
    }
    setStep((s) => Math.max(0, s - 1));
  };

  const finish = async (finalScores: Record<string, number>) => {
    setSaving(true);
    const resultId = pack.resolve(finalScores);
    const resolved = resultById(pack, resultId);
    try {
      await saveResult({ kind: pack.kind, resultId, scores: finalScores });
      setResult(resolved);
      setStep(-1);
    } catch (err) {
      console.error(err);
      toast("Couldn't save your result", {
        description: "Try that again in a second.",
      });
      setStep(pack.questions.length - 1);
    } finally {
      setSaving(false);
    }
  };

  const question = step >= 0 ? pack.questions[step] : null;
  const maxScore = result
    ? Math.max(
        ...pack.results.map((r) => scores[r.id] ?? 0),
        1,
      )
    : 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-white/14 bg-[#131b3e]/95 backdrop-blur-xl sm:max-w-lg">
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
                  {pack.emoji} {pack.title}
                </p>
                <p className="text-xs tabular-nums text-cyan-200/80">
                  {step + 1} / {pack.questions.length}
                </p>
              </div>

              <div className="flex gap-1.5">
                {pack.questions.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i <= step ? "bg-cyan-300" : "bg-white/10"
                    }`}
                  />
                ))}
              </div>

              <h3 className="text-xl font-bold tracking-tight text-foreground">
                {question.question}
              </h3>

              <div className="space-y-2">
                {question.answers.map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    disabled={saving}
                    onClick={() => answer(a.label, a.scores)}
                    className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-foreground/90 transition-all hover:border-cyan-300/45 hover:bg-cyan-300/10"
                  >
                    <span>{a.label}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-cyan-200/50 transition-transform group-hover:translate-x-0.5 group-hover:text-cyan-200" />
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
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 16,
                    delay: 0.1,
                  }}
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-white/10 to-white/5 text-5xl ring-1 ring-white/15"
                >
                  {result.emoji}
                </motion.div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {pack.title} · your result
                  </p>
                  <h3
                    className={`mt-1 text-3xl font-extrabold tracking-tight ${result.hue}`}
                  >
                    {result.name}
                  </h3>
                  <p className="mt-1 text-sm text-foreground/70">
                    {result.tagline}
                  </p>
                </div>

                <p className="mx-auto max-w-md text-sm leading-relaxed text-foreground/85">
                  {result.description}
                </p>

                {/* The shadow — every result has one */}
                <div className="w-full rounded-2xl border border-violet-300/25 bg-violet-300/[0.07] p-4 text-left">
                  <p className="text-xs font-bold uppercase tracking-wider text-violet-200/90">
                    🌑 Your shadow
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-violet-50/90">
                    {result.shadow}
                  </p>
                </div>

                {/* Score breakdown across all results */}
                <div className="w-full space-y-2.5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Your full reading
                  </p>
                  {[...pack.results]
                    .sort(
                      (a, b) =>
                        (scores[b.id] ?? 0) - (scores[a.id] ?? 0),
                    )
                    .map((r, i) => (
                      <div key={r.id} className="flex items-center gap-3">
                        <span
                          className={`w-28 shrink-0 truncate text-xs font-semibold ${
                            i === 0 ? result.hue : "text-muted-foreground"
                          }`}
                        >
                          {r.emoji} {r.name}
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/8">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${((scores[r.id] ?? 0) / maxScore) * 100}%`,
                            }}
                            transition={{
                              duration: 0.5,
                              delay: 0.2 + i * 0.08,
                            }}
                            className="h-full rounded-full bg-cyan-300"
                          />
                        </div>
                        <span className="w-4 text-right text-xs tabular-nums text-muted-foreground">
                          {scores[r.id] ?? 0}
                        </span>
                      </div>
                    ))}
                </div>

                {/* Hangable intentions */}
                <div className="w-full text-left">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    ✦ Intentions that fit {result.name}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {result.intentions.map(({ text, moment, colorKey }) => (
                      <button
                        key={text}
                        type="button"
                        onClick={() => {
                          onHangIntention?.({
                            text,
                            moment: moment ?? defaultMoment(),
                            colorKey,
                          });
                        }}
                        className="group flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-left text-sm text-foreground/90 transition-all hover:border-cyan-300/45 hover:bg-cyan-300/10"
                      >
                        <span>
                          {result.emoji} {text}
                        </span>
                        <span className="text-xs text-cyan-200/60 transition-colors group-hover:text-cyan-200">
                          Hang it →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <Button
                    onClick={() => onOpenChange(false)}
                    className="w-full rounded-full bg-foreground font-semibold text-background hover:bg-foreground/85"
                  >
                    Back to my sky
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={reset}
                    className="text-muted-foreground"
                  >
                    <RotateCcw className="mr-1.5 h-4 w-4" /> Retake
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
