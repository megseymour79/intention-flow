import { FadeUp, PublicPage, Section } from "@/components/PublicShell";
import { MindGym } from "@/components/MindGym";
import { ToneDetector } from "@/components/ToneDetector";

/* ------------------------------------------------------------------ */
/* /tone-lab — the two "sharpen your instrument" tools, previously     */
/* landing sections 02 and 06.                                         */
/* ------------------------------------------------------------------ */

export default function ToneLab() {
  return (
    <PublicPage>
      <section className="relative mx-auto max-w-6xl px-4 pb-4 pt-32 sm:px-6 sm:pt-40">
        <FadeUp>
          <p className="font-eyebrow text-amber-200/85">The tone lab</p>
          <h1 className="text-clearing-soft mt-3 max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Sharpen the message. Sharpen the mind.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-foreground/70">
            Two instruments, no account needed: one reads the room before you
            hit send, one trains the space between stimulus and response.
          </p>
        </FadeUp>
      </section>

      <Section
        index="01"
        eyebrow="The tone lab"
        title="Read the room before you hit send"
        note="Type any message. The instrument reads its tone, flags the patterns, and offers ways to say it differently."
      >
        <FadeUp>
          <ToneDetector />
        </FadeUp>
      </Section>

      <Section
        index="02"
        eyebrow="The mind gym"
        title="Five tiny workouts for the space between stimulus and response"
        note="Each one takes under a minute. No sign-up, no score to post — just reps for the part of you that chooses."
      >
        <FadeUp>
          <MindGym />
        </FadeUp>
      </Section>
    </PublicPage>
  );
}
