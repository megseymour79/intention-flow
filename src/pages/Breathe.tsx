import { useState } from "react";
import { motion } from "framer-motion";
import { Shuffle } from "lucide-react";

import { BreathOrb } from "@/components/BreathOrb";
import { GroundingExercises } from "@/components/MindGym";
import { FadeUp, PublicPage, Section } from "@/components/PublicShell";
import {
  SUGGESTED_STARS,
  STAR_COLORS,
} from "@/lib/shift-data";

/* ------------------------------------------------------------------ */
/* /breathe — the no-account micro-experiences: the surprise star      */
/* draw and the guided 4-7-8 reset. Previously landing sections 03/08. */
/* ------------------------------------------------------------------ */

function SurpriseStar() {
  const [pick, setPick] = useState<number | null>(null);

  const draw = () => {
    setPick((cur) => {
      let next = Math.floor(Math.random() * SUGGESTED_STARS.length);
      if (next === cur && SUGGESTED_STARS.length > 1) {
        next = (next + 1) % SUGGESTED_STARS.length;
      }
      return next;
    });
  };

  const star = pick !== null ? SUGGESTED_STARS[pick] : null;
  const color = star ? STAR_COLORS[star.colorKey] : null;

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`relative flex h-44 w-44 items-center justify-center overflow-hidden rounded-full border transition-all duration-500 sm:h-52 sm:w-52 ${
          star ? "" : "animate-glow-pulse"
        }`}
        style={
          star && color
            ? {
                borderColor: `${color.hex}55`,
                background: `radial-gradient(circle at 40% 34%, ${color.hex}22 0%, rgba(18,11,38,0.92) 68%)`,
                boxShadow: `0 0 40px -6px ${color.glow}`,
              }
            : {
                borderColor: "rgba(244,160,180,0.3)",
                background:
                  "radial-gradient(circle at 40% 34%, rgba(244,160,180,0.08) 0%, rgba(18,11,38,0.92) 68%)",
              }
        }
      >
        {star && color ? (
          <motion.div
            key={star.text}
            initial={{ scale: 0.4, opacity: 0, rotate: -14 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 15 }}
            className="px-6 text-center"
          >
            <span
              className="block text-3xl"
              style={{
                color: color.hex,
                textShadow: `0 0 18px ${color.glow}`,
              }}
            >
              {star.emoji}
            </span>
            <p className="mt-2 font-display text-[15px] font-medium leading-snug text-foreground/95">
              “{star.text}”
            </p>
          </motion.div>
        ) : (
          <div className="px-6 text-center">
            <span className="animate-floaty inline-block text-4xl">✦</span>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              One tap. One real intention. No sign-up.
            </p>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={draw}
        className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-foreground/85 transition-all hover:border-amber-300/40 hover:text-amber-100"
      >
        <Shuffle className="h-4 w-4 text-amber-200/80 transition-transform group-hover:rotate-180" />
        {star ? "Draw another" : "Surprise me"}
      </button>
      <p className="max-w-[220px] text-center font-eyebrow text-muted-foreground/70">
        {star
          ? "Steal it — or hang it in your own sky"
          : "Every draw is a real intention somebody hung"}
      </p>
    </div>
  );
}

export default function Breathe() {
  return (
    <PublicPage>
      <section className="relative mx-auto max-w-6xl px-4 pb-4 pt-32 sm:px-6 sm:pt-40">
        <FadeUp>
          <p className="font-eyebrow text-amber-200/85">Try it right now</p>
          <h1 className="text-clearing-soft mt-3 max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            One breath. One intention. No account needed.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-foreground/70">
            Pull a real intention out of the sky, ground yourself through your
            five senses, breathe through one guided reset. If any of it lands,
            that's the whole app in miniature.
          </p>
        </FadeUp>
      </section>

      <Section
        index="01"
        eyebrow="The surprise star"
        title="One tap — a real intention lights up"
        note="Every draw is a genuine intention someone hung in their sky. Borrow it or let it spark your own."
      >
        <FadeUp>
          <div className="panel mx-auto max-w-md p-8 text-center">
            <SurpriseStar />
          </div>
        </FadeUp>
      </Section>

      <Section
        index="02"
        eyebrow="Grounding exercises"
        title="Come back to the room, one sense at a time"
        note="Two body-first reps: walk your senses to land in the now, or turn the dial until the same moment reads different. No account, no score."
      >
        <FadeUp>
          <GroundingExercises />
        </FadeUp>
      </Section>

      <Section
        index="03"
        eyebrow="Breathe with the sky"
        title="The 4-7-8 reset, guided"
        note="The same pocket reset your sky nudges you with — in for four, hold for seven, out for eight. Reaction to choice, in about a minute."
        center
      >
        <FadeUp>
          <div className="panel relative mx-auto max-w-3xl overflow-hidden p-10 text-center">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-amber-200/5 to-transparent" />
            <div className="flex justify-center">
              <BreathOrb />
            </div>
          </div>
        </FadeUp>
      </Section>
    </PublicPage>
  );
}
