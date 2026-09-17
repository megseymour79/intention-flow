import { useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowRight, Bell, Star } from "lucide-react";

import { BreathOrb } from "@/components/BreathOrb";
import {
  FadeUp,
  PublicPage,
  PUBLIC_LINKS,
  Section,
} from "@/components/PublicShell";
import { StarSky, SkyStarLike } from "@/components/StarSky";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { SUGGESTED_STARS } from "@/lib/shift-data";

/* ------------------------------------------------------------------ */
/* Home (/) — a focused landing: hero + observation deck, how it       */
/* works, the explore hub, field notes, final CTA. Deep content lives  */
/* on /practice, /tone-lab, /quiz and /breathe.                        */
/* ------------------------------------------------------------------ */

function seeded(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

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

const VOICES = [
  {
    star: "✦",
    color: "text-yellow-300",
    name: "Mara, product lead",
    text: "Hung “get curious before I get defensive” before a brutal review. Caught myself twice mid-meeting. Both times, I chose different.",
  },
  {
    star: "✺",
    color: "text-orange-300",
    name: "Dev, student",
    text: "The 19:00 nudge hits right when I'm about to doomscroll. Now I read the star instead. Small, but it compounds.",
  },
  {
    star: "✧",
    color: "text-amber-300",
    name: "Priya, nurse",
    text: "I set “leave the work at the door tonight” for the walk home. Six weeks in, I actually do.",
  },
];

const EXPLORE_LINKS = [
  ...PUBLIC_LINKS,
] as const;

function HeroSky() {
  const [typed, setTyped] = useState("");
  const [demos, setDemos] = useState<SkyStarLike[]>(() =>
    SUGGESTED_STARS.slice(0, 5).map((s, i) => ({
      _id: `demo-${i}` as SkyStarLike["_id"],
      text: s.text,
      moment: s.moment,
      emoji: s.emoji,
      colorKey: s.colorKey,
      x: 16 + seeded(i, 21) * 66,
      y: 18 + seeded(i, 22) * 52,
      active: i === 0,
    })),
  );

  const hang = (x?: number, y?: number) => {
    if (typed.trim().length === 0) return;
    const next: SkyStarLike = {
      _id: `demo-${Date.now()}` as SkyStarLike["_id"],
      text: typed.trim().slice(0, 120),
      moment: "mornings",
      emoji: "✦",
      colorKey: ["nova", "pulse", "wave", "surge", "ember", "orbit"][
        Math.floor(Math.random() * 6)
      ] as SkyStarLike["colorKey"],
      x: x ?? 14 + Math.random() * 70,
      y: y ?? 16 + Math.random() * 60,
      active: false,
    };
    setDemos((d) => [...d.slice(-7), next]);
    setTyped("");
  };

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
        <p className="font-eyebrow text-muted-foreground">Observation deck</p>
        <span className="flex items-center gap-1.5 font-eyebrow text-amber-200/80">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300" />
          live
        </span>
      </div>
      <StarSky
        stars={demos}
        onPick={() => undefined}
        onDrop={() => undefined}
        onRequestCreate={hang}
        className="h-[360px] w-full sky-gradient sm:h-[420px]"
        hint="tap the sky & type a way you want to be"
      />
      <div className="border-t border-white/8 p-2.5">
        <div className="flex items-center gap-2 rounded-lg bg-[#221644]/50 px-1">
          <span className="pl-2 text-lg">✍️</span>
          <Input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") hang();
            }}
            placeholder="I want to be patient when I'm interrupted…"
            maxLength={120}
            className="border-0 bg-transparent text-sm shadow-none placeholder:text-foreground/55 focus-visible:ring-0"
          />
          <Button
            onClick={() => hang()}
            disabled={typed.trim().length === 0}
            className="shrink-0 rounded-md bg-foreground font-semibold text-background hover:bg-foreground/85"
          >
            Hang it
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const { isAuthenticated } = useAuth();

  const authHref = isAuthenticated
    ? "/dashboard"
    : "/auth?returnTo=%2Fdashboard";

  const cta = (
    <Button
      asChild
      size="lg"
      className="h-12 rounded-full bg-foreground px-8 text-base font-semibold text-background shadow-[0_10px_36px_-14px_rgba(240,235,220,0.5)] transition-transform hover:scale-[1.02] hover:bg-foreground/90"
    >
      <Link to={authHref}>
        {isAuthenticated ? "Open my sky" : "Start your sky"}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  );

  return (
    <PublicPage>
      <div id="top" />

      {/* ---- Hero ---- */}
      <section className="relative mx-auto max-w-6xl px-4 pb-14 pt-32 sm:px-6 sm:pt-40">
        <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_1fr]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 font-eyebrow text-amber-200/80"
            >
              <span className="h-px w-8 border-amber-200/40 bg-amber-200/40" />
              A field guide to the moment
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="text-clearing-soft mt-5 font-display text-5xl font-semibold leading-[1.04] tracking-tight sm:text-6xl"
            >
              Choose how you{" "}
              <span className="bg-gradient-to-r from-amber-100 via-amber-100 to-rose-200 bg-clip-text text-transparent">
                show up
              </span>{" "}
              — before life chooses for you.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="mt-5 max-w-xl text-base leading-relaxed text-foreground/70 sm:text-lg"
            >
              ShiftedMind turns your intentions into stars. Pick the moment —
              the hard conversation, the slow morning, the meeting that drags —
              write who you want to be in it, and hang it in your sky. Then let
              gentle nudges bring you back.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.24 }}
              className="mt-8 flex flex-wrap items-center gap-5"
            >
              {cta}
              <Link
                to="/method"
                className="relative z-10 font-eyebrow text-foreground/75 transition-colors hover:text-amber-200"
              >
                See the practice →
              </Link>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-1 font-eyebrow text-muted-foreground"
            >
              <span>Free to start</span>
              <span>·</span>
              <span>No credit card</span>
              <span>·</span>
              <span>90 seconds a day</span>
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <HeroSky />
          </motion.div>
        </div>
      </section>

      {/* ---- 01 How it works ---- */}
      <Section
        id="how"
        index="01"
        eyebrow="How it works"
        title="Three small moves, one different day"
        note="Intentions stick when they point at a real moment. Everything here is built around that."
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
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="mr-1 font-eyebrow text-muted-foreground">
              Try it now, no account —
            </span>
            <Link
              to="/breathe"
              className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-foreground/85 transition-all hover:border-amber-300/40 hover:text-amber-100"
            >
              <Star className="h-3.5 w-3.5 text-amber-200/80" />
              Draw a star
            </Link>
            <Link
              to="/breathe#breathe-478"
              className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-foreground/85 transition-all hover:border-amber-300/40 hover:text-amber-100"
            >
              Breathe 4-7-8
            </Link>
          </div>
        </FadeUp>
      </Section>

      {/* ---- 02 Explore everything ---- */}
      <Section
        id="explore"
        index="02"
        eyebrow="Explore"
        title="One sky, four rooms"
        note="The full practice lives a click away — each room is small on purpose."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {EXPLORE_LINKS.map((l, i) => {
            const copy: Record<string, { emoji: string; body: string }> = {
              "/method": {
                emoji: "🌠",
                body: "The full method: moments, the constellation wall, pocket resets and sky ranks.",
              },
              "/tone-lab": {
                emoji: "📡",
                body: "Read the tone of any message, then train the gap between stimulus and response.",
              },
              "/quiz": {
                emoji: "🔮",
                body: "Eight honest questions → your archetype, its shadow, and a practice to keep it lit.",
              },
              "/breathe": {
                emoji: "🫧",
                body: "A surprise intention, grounding exercises, and a guided 4-7-8 reset. No account needed.",
              },
            };
            const c = copy[l.to] ?? { emoji: "✦", body: "" };
            return (
              <FadeUp key={l.to} delay={i * 0.07}>
                <Link
                  to={l.to}
                  className="panel panel-hover group flex h-full items-start gap-4 p-5"
                >
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-2xl">
                    {c.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-display text-base font-semibold tracking-tight">
                      {l.label}
                      <ArrowRight className="h-3.5 w-3.5 text-amber-200/70 transition-transform group-hover:translate-x-1" />
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-foreground/75">
                      {c.body}
                    </p>
                  </div>
                </Link>
              </FadeUp>
            );
          })}
        </div>
      </Section>

      {/* ---- 03 Breathe teaser ---- */}
      <Section
        index="03"
        eyebrow="Breathe with the sky"
        title="The 4-7-8 reset, right here"
        note="Reaction to choice, in about a minute. The full guided version lives on the Breathe page."
        center
      >
        <FadeUp>
          <div className="panel relative mx-auto max-w-3xl overflow-hidden p-10 text-center">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-amber-200/5 to-transparent" />
            <div className="flex justify-center">
              <BreathOrb />
            </div>
            <div className="mt-6 flex justify-center">
              <Button
                asChild
                variant="ghost"
                className="rounded-full border border-white/15 text-foreground/85 hover:bg-white/5 hover:text-amber-100"
              >
                <Link to="/breathe">Open the guided reset</Link>
              </Button>
            </div>
          </div>
        </FadeUp>
      </Section>

      {/* ---- 04 Field notes ---- */}
      <Section
        id="voices"
        index="04"
        eyebrow="Field notes"
        title="Small stars, hung daily, change how people meet their moments"
        center
      >
        <div className="grid gap-4 md:grid-cols-3">
          {VOICES.map((v, i) => (
            <FadeUp key={v.name} delay={i * 0.1}>
              <figure className="panel panel-hover flex h-full flex-col p-6">
                <span className={`text-2xl ${v.color}`}>{v.star}</span>
                <blockquote className="mt-4 flex-1 font-display text-[15px] italic leading-relaxed text-foreground/85">
                  “{v.text}”
                </blockquote>
                <figcaption className="mt-5 border-t hairline pt-3.5 font-eyebrow text-muted-foreground">
                  {v.name}
                </figcaption>
              </figure>
            </FadeUp>
          ))}
        </div>
      </Section>

      {/* ---- Final CTA ---- */}
      <section className="relative py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <FadeUp>
            <div className="panel relative overflow-hidden p-10 text-center sm:p-14">
              <div className="pointer-events-none absolute -top-16 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-amber-200/10 blur-3xl" />
              <p className="font-eyebrow text-amber-200/70">
                Last call · the sky is open
              </p>
              <h2 className="text-clearing-soft mx-auto mt-4 max-w-xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Your first star takes{" "}
                <span className="text-amber-200">ten seconds</span>
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-foreground/85 sm:text-base">
                {isAuthenticated
                  ? "Your sky is waiting. Go hang tonight's intention."
                  : "Make an account, hang one intention, and let tomorrow meet a slightly more intentional you."}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                {cta}
              </div>
              <div className="mt-7 flex items-center justify-center gap-6 font-eyebrow text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Star className="h-3 w-3 text-amber-300" /> Streaks & nudges
                </span>
                <span className="flex items-center gap-1.5">
                  <Bell className="h-3 w-3 text-amber-300" /> No ads, ever
                </span>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

    </PublicPage>
  );
}
