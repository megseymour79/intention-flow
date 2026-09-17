import { AppShell, PageHeader } from "@/components/AppShell";
import { BreathOrb } from "@/components/BreathOrb";
import { MindGym } from "@/components/MindGym";
import { ToneDetector } from "@/components/ToneDetector";

/* ------------------------------------------------------------------ */
/* /practice (authenticated) — the practice deck: quick reps between   */
/* stimulus and response. Tone lab, mind gym, and the pocket reset.    */
/* ------------------------------------------------------------------ */

export default function Practice() {
  return (
    <AppShell title="Practice">
      <div className="space-y-7">
        <PageHeader
          eyebrow="Section · practice"
          title={
            <>
              The practice <span className="text-amber-200/90">deck</span>
            </>
          }
          sub="Short, real reps between stimulus and response — check your tone, train your attention, reset your breath. A few minutes here changes how the rest of the day goes."
        />

        {/* The tone lab — read the message before it leaves your hands */}
        <ToneDetector />

        {/* The mind gym — reps for the choosing muscle */}
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <p className="font-eyebrow text-muted-foreground">The mind gym</p>
          </div>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            One-minute reps for the choosing muscle — catch an urge, unhook a
            thought, ground your senses, turn a lens, find your pull.
          </p>
          <div className="mt-4">
            <MindGym />
          </div>
        </section>

        {/* Pocket reset — the 4-7-8 breath */}
        <div className="panel flex flex-wrap items-center justify-between gap-5 p-5">
          <div className="min-w-[220px] flex-1">
            <p className="font-eyebrow text-muted-foreground">
              Pocket reset · 4-7-8
            </p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Feeling the old pattern pull? One guided minute moves you from
              reaction to choice — in for four, hold for seven, out for eight.
            </p>
          </div>
          <BreathOrb />
        </div>
      </div>
    </AppShell>
  );
}
