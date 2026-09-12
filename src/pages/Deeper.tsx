import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { AppShell, PageHeader } from "@/components/AppShell";
import { StarEditor } from "@/components/StarEditor";
import { PersonalityQuiz } from "@/components/PersonalityQuiz";
import { RankPanel } from "@/components/SkyQuest";
import { QUIZ_PACKS, resultById } from "@/lib/quiz-packs";
import { resolveQuizKind } from "@/lib/quiz-deep-link";

export default function Deeper() {
  // The black-hole dive on the Dashboard lands here with ?open=<kind> —
  // the param is validated before any dialog opens.
  const [searchParams, setSearchParams] = useSearchParams();
  const [deepOpen, setDeepOpen] = useState<string | null>(
    () => resolveQuizKind(searchParams.get("open")),
  );

  useEffect(() => {
    const kind = resolveQuizKind(searchParams.get("open"));
    if (kind && kind !== deepOpen) setDeepOpen(kind);
  }, [searchParams, deepOpen]);

  const closeDeep = (open: boolean) => {
    setDeepOpen(open ? deepOpen : null);
    if (!open && searchParams.get("open")) {
      setSearchParams({}, { replace: true });
    }
  };

  const deepResults = useQuery(api.personality.myResults) ?? [];

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorDraft, setEditorDraft] = useState<{
    text: string;
    moment: string;
    colorKey: string;
  } | null>(null);

  // A quiz suggestion becomes a real star in the sky.
  const handleQuizIntention = (draft: {
    text: string;
    moment: string;
    colorKey: string;
  }) => {
    setEditorDraft(draft);
    setEditorOpen(true);
  };

  return (
    <AppShell title="Go deeper">
      <div className="space-y-7">
        <PageHeader
          eyebrow="Section · go deeper"
          title={
            <>
              Go <span className="text-emerald-200/90">deeper</span>
            </>
          }
          sub="Where you are in the sky, the science behind why it works, and three honest readings of how you move through the world — each ending with intentions cut to fit what you learn."
        />

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

        {/* The personality quizzes */}
        <div className="panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-eyebrow text-muted-foreground">Know thyself</p>
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
      </div>

      <StarEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        draft={editorDraft}
        existing={null}
      />

      {QUIZ_PACKS.map((pack) => (
        <PersonalityQuiz
          key={pack.kind}
          pack={pack}
          open={deepOpen === pack.kind}
          onOpenChange={closeDeep}
          onHangIntention={handleQuizIntention}
        />
      ))}
    </AppShell>
  );
}
