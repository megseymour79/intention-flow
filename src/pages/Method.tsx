import { useMemo, useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { Shuffle } from "lucide-react";

import { FadeUp, PublicPage, Section } from "@/components/PublicShell";
import { cn } from "@/lib/utils";
import {
  MOMENTS,
  SHIFTS,
  STAR_COLORS,
  SUGGESTED_STARS,
} from "@/lib/shift-data";
import { RANK_EMOJI, RANK_TIERS, UPGRADES } from "@/lib/unlocks";

/* ------------------------------------------------------------------ */
/* /method — the public walkthrough of the ShiftedMind practice: the   */
/* three-move method, the constellation wall, pocket resets, and the   */
/* rank ladder. (The signed-in Practice deck lives at /practice.)      */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    emoji: "🎯",
    title: "Name the moment",
    body: "The meeting, the argument, the 6pm slump. Intentions stick when they point at a real moment — not at 'life' in general.",
  },
  {
    emoji: "🌠",
    title: "Write who you'll be",
    body: "Not a to-do. One sentence about how you want to show up: patient, curious, unhurried. Then hang it as a star in your sky.",
  },
  {
    emoji: "⏰",
    title: "Get nudged back",
    body: "Gentle reminders arrive at the moments you chose. A streak grows. Your sky becomes a mirror of who you keep choosing to be.",
  },
];

function ShiftCard({
  shift,
  index,
}: {
  shift: (typeof SHIFTS)[number];
  index: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <motion.button
      type="button"
      onClick={() => setOpen((o) => !o)}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.06 }}
      className="panel panel-hover flex h-full min-h-[104px] flex-col items-start gap-2 p-4 text-left"
    >
      <div className="flex w-full items-center justify-between gap-2">
        <span className="text-xl">{shift.emoji}</span>
        <span
          className={cn(
            "font-eyebrow transition-colors",
            open ? "text-amber-200/90" : "text-foreground/75",
          )}
        >
          {open ? "− close" : "+ tap"}
        </span>
      </div>
      <p className="text-sm font-semibold">{shift.title}</p>
      <p
        className={cn(
          "text-xs leading-relaxed transition-all",
          open ? "text-foreground/85 line-clamp-none" : "text-foreground/70 line-clamp-1",
        )}
      >
        {shift.body}
      </p>
    </motion.button>
  );
}

function ShiftWall() {
  const [seed, setSeed] = useState(0);
  const shown = useMemo(() => {
    const offset = (seed * 4) % SHIFTS.length;
    return [...SHIFTS.slice(offset), ...SHIFTS.slice(0, offset)].slice(0, 8);
  }, [seed]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <p className="font-eyebrow text-muted-foreground/70">
          tap to open · one lands in your sky daily
        </p>
        <button
          type="button"
          onClick={() => setSeed((s) => s + 1)}
          title="Show me four different ones"
          className="group inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-3.5 py-1.5 transition-all hover:border-amber-300/40"
        >
          <Shuffle className="h-3.5 w-3.5 text-amber-200/80 transition-transform duration-300 group-hover:rotate-180" />
          <span className="font-eyebrow text-foreground/70">shuffle</span>
        </button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {shown.map((s, i) => (
          <ShiftCard key={`${seed}-${s.title}`} shift={s} index={i} />
        ))}
      </div>
    </div>
  );
}

export default function Method() {
  return (
    <PublicPage>
      {/* Page head */}
      <section className="relative mx-auto max-w-6xl px-4 pb-4 pt-32 sm:px-6 sm:pt-40">
        <FadeUp>
          <p className="font-eyebrow text-amber-200/85">The method</p>
          <h1 className="text-clearing-soft mt-3 max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Three small moves, one different day
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-foreground/70">
            Intentions stick when they point at a real moment. Everything here
            is built around that — and none of it takes more than a minute.
          </p>
        </FadeUp>
      </section>

      {/* 01 How it works */}
      <Section
        id="how"
        index="01"
        eyebrow="How it works"
        title="Name the moment. Write who you'll be. Get nudged back."
        note="The whole loop, from thought to star to nudge."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <FadeUp key={step.title} delay={i * 0.1}>
              <div className="panel panel-hover relative h-full overflow-hidden p-6">
                <span className="font-eyebrow absolute right-4 top-4 text-muted-foreground/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-2xl">
                  {step.emoji}
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                  {step.body}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={0.15}>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="mr-1 font-eyebrow text-muted-foreground">
              Pick your moment —
            </span>
            {MOMENTS.map((m) => (
              <span
                key={m.id}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-foreground/75"
              >
                {m.emoji} {m.label.replace(/^(in|on|when|before|while)\s+/i, "")}
              </span>
            ))}
          </div>
        </FadeUp>
      </Section>

      {/* 02 Constellation wall */}
      <Section
        index="02"
        eyebrow="The constellation wall"
        title="Intentions people actually hang"
        note="Borrow one as-is, or make it yours. Every star here started as someone's honest answer to “who do I want to be in this?”"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SUGGESTED_STARS.map((s, i) => {
            const color = STAR_COLORS[s.colorKey];
            return (
              <FadeUp key={s.text} delay={(i % 3) * 0.08}>
                <div
                  className="panel panel-hover flex items-start gap-3 p-4"
                  style={{
                    borderColor: `${color.hex}2b`,
                    background: `linear-gradient(to bottom, ${color.hex}10, rgba(18,11,38,0.72))`,
                  }}
                >
                  <span
                    className="mt-0.5 text-lg leading-none"
                    style={{
                      color: color.hex,
                      textShadow: `0 0 12px ${color.glow}`,
                    }}
                  >
                    {s.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug text-foreground/90">
                      “{s.text}”
                    </p>
                    <p className="mt-1.5 font-eyebrow text-muted-foreground">
                      {MOMENTS.find((m) => m.id === s.moment)?.label}
                    </p>
                  </div>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </Section>

      {/* 03 Micro-shifts */}
      <Section
        index="03"
        eyebrow="Micro-shifts"
        title="Pocket resets for when it goes sideways"
        note="Tap one to open it. One lands in your sky every day."
      >
        <ShiftWall />
      </Section>

      {/* 04 Ranks */}
      <Section
        index="04"
        eyebrow="Sky ranks"
        title="The more you show up, the more your sky opens"
        note="Stars hung, nights kept, days visited, quizzes taken — every bit of light feeds your rank, and each rank unlocks something real."
      >
        <FadeUp>
          <div className="flex flex-wrap items-center gap-2.5">
            {RANK_TIERS.map((t) => (
              <div
                key={t.level}
                className="panel panel-hover flex items-center gap-2.5 px-4 py-3"
              >
                <span className="text-xl">{RANK_EMOJI[t.level]}</span>
                <div>
                  <p className="text-sm font-semibold tracking-tight">{t.name}</p>
                  <p className="font-eyebrow mt-0.5 text-muted-foreground">
                    {t.score}+ light
                  </p>
                </div>
              </div>
            ))}
          </div>
        </FadeUp>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {UPGRADES.slice(0, 3).map((u, i) => (
            <FadeUp key={u.id} delay={i * 0.07}>
              <div className="panel panel-hover flex h-full items-start gap-3 p-4">
                <span className="text-xl">{u.emoji}</span>
                <div>
                  <p className="text-sm font-semibold">{u.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-foreground/75">
                    {u.body}
                  </p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={0.1}>
          <p className="mt-6 font-eyebrow text-muted-foreground/80">
            Want the full ladder? It lives in your sky once you{" "}
            <Link
              to="/auth?returnTo=%2Fdashboard"
              className="text-amber-200/90 underline-offset-4 hover:underline"
            >
              start free
            </Link>
            .
          </p>
        </FadeUp>
      </Section>
    </PublicPage>
  );
}
