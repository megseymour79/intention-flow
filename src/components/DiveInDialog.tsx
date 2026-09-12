import { motion, AnimatePresence } from "framer-motion";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { QUIZ_PACKS } from "@/lib/quiz-packs";

interface DiveInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** kind === "style" is the archetype quiz; otherwise a QUIZ_PACKS kind. */
  onPickQuiz: (kind: string) => void;
}

const ALL_QUIZZES = [
  {
    kind: "style",
    emoji: "✨",
    title: "Response archetype",
    subtitle:
      "Spark, Anchor, Current or Bloom — where your energy lives under pressure.",
    meta: "6 questions",
  },
  ...QUIZ_PACKS.map((p) => ({
    kind: p.kind,
    emoji: p.emoji,
    title: p.title,
    subtitle: p.subtitle,
    meta: `${p.questions.length} questions`,
  })),
];

/** The list you fall into when you click the sky's black hole. */
export function DiveInDialog({
  open,
  onOpenChange,
  onPickQuiz,
}: DiveInDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-white/14 bg-[#131b3e]/95 backdrop-blur-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold tracking-tight">
            🕳️ You dove in
          </DialogTitle>
          <DialogDescription>
            Past the stars, the questions get more interesting. Pick a reading —
            each one ends with intentions you can hang.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence initial={false}>
          <div className="flex flex-col gap-2 pb-1">
            {ALL_QUIZZES.map((q, i) => (
              <motion.button
                key={q.kind}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.06 * i }}
                onClick={() => {
                  onOpenChange(false);
                  onPickQuiz(q.kind);
                }}
                className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition-all hover:border-amber-300/50 hover:bg-amber-300/10"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-xl ring-1 ring-white/10">
                  {q.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold tracking-tight">
                    {q.title}
                  </span>
                  <span className="mt-0.5 block line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {q.subtitle}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-[10px] uppercase tracking-wider text-muted-foreground/70">
                    {q.meta}
                  </span>
                  <span className="mt-0.5 block text-xs font-semibold text-amber-200/60 transition-colors group-hover:text-amber-200">
                    Start →
                  </span>
                </span>
              </motion.button>
            ))}
          </div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
