import { useMemo, useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowRight, Bell, Shuffle, Star } from "lucide-react";

import { BreathOrb } from "@/components/BreathOrb";
import { FloatingBackground } from "@/components/FloatingBackground";
import { MindGym } from "@/components/MindGym";
import { StarMark } from "@/components/StarMark";
import { StarSky, SkyStarLike } from "@/components/StarSky";
import { ToneDetector } from "@/components/ToneDetector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { useAuth } from "@/hooks/use-auth";
import {
  MOMENTS,
  RESPONSE_STYLES,
  SHIFTS,
  STAR_COLORS,
  SUGGESTED_STARS,
} from "@/lib/shift-data";
import { RANK_EMOJI, RANK_TIERS, UPGRADES } from "@/lib/unlocks";

function FadeUp({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.5, delay, ease: [0.21, 0.65, 0.35, 1] }}
    >
      {children}
    </motion.div>
  );
}

function seeded(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/* ------------------------------------------------------------------ */
/* Layout: the numbered field-log section                              */
/* ------------------------------------------------------------------ */

function Section({
  id,
  index,
  eyebrow,
  title,
  note,
  center,
  children,
}: {
  id?: string;
  index?: string;
  eyebrow: string;
  title: React.ReactNode;
  note?: string;
  center?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="relative scroll-mt-24 py-12 sm:py-14">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="border-t hairline pt-9">
          <FadeUp>
            <div
              className={cn(
                "flex flex-wrap items-end gap-x-12 gap-y-4",
                center ? "justify-center text-center" : "justify-between",
              )}
            >
              <div className={cn(center && "max-w-2xl")}>
                <p className="font-eyebrow text-emerald-200/70">
                  {index ? `${index} · ` : ""}
                  {eyebrow}
                </p>
                <h2 className="text-clearing-soft mt-3 max-w-2xl font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                  {title}
                </h2>
              </div>
              {note && !center && (
                <p className="max-w-xs pb-1 text-sm leading-relaxed text-muted-foreground">
                  {note}
                </p>
              )}
              {note && center && (
                <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
                  {note}
                </p>
              )}
            </div>
          </FadeUp>
          <div className="mt-9">{children}</div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Hero observation deck: the interactive sky, framed cleanly          */
/* ------------------------------------------------------------------ */

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
      ],
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
        <span className="flex items-center gap-1.5 font-eyebrow text-emerald-200/80">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
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
        <div className="flex items-center gap-2 rounded-lg bg-[#141c40]/50 px-1">
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

/* ------------------------------------------------------------------ */
/* Interactive: the surprise star                                       */
/* ------------------------------------------------------------------ */

/** One tap — a random real intention lights up, ready to steal. */
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
                background: `radial-gradient(circle at 40% 34%, ${color.hex}22 0%, rgba(10,15,28,0.92) 68%)`,
                boxShadow: `0 0 40px -6px ${color.glow}`,
              }
            : {
                borderColor: "rgba(148,196,180,0.3)",
                background:
                  "radial-gradient(circle at 40% 34%, rgba(148,196,180,0.1) 0%, rgba(10,15,28,0.92) 68%)",
              }
        }
      >
        {star ? (
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
                color: color!.hex,
                textShadow: `0 0 18px ${color!.glow}`,
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
        className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-foreground/85 transition-all hover:border-emerald-300/40 hover:text-emerald-100"
      >
        <Shuffle className="h-4 w-4 text-emerald-200/80 transition-transform group-hover:rotate-180" />
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

/* ------------------------------------------------------------------ */
/* Interactive: tap-to-reveal micro-shifts with a shuffle               */
/* ------------------------------------------------------------------ */

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
            open ? "text-emerald-200/90" : "text-foreground/75",
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
          className="group inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-3.5 py-1.5 transition-all hover:border-emerald-300/40"
        >
          <Shuffle className="h-3.5 w-3.5 text-emerald-200/80 transition-transform duration-300 group-hover:rotate-180" />
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
    color: "text-cyan-300",
    name: "Priya, nurse",
    text: "I set “leave the work at the door tonight” for the walk home. Six weeks in, I actually do.",
  },
];

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();

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
    <div className="relative min-h-screen overflow-x-clip">
      <FloatingBackground count={22} />

      {/* top scrim — keeps the nav and hero readable under the moving sky */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-80"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,17,40,0.88) 0%, rgba(12,20,46,0.55) 45%, rgba(14,24,52,0) 100%)",
        }}
      />

      {/* ---- Nav: a thin instrument bar ---- */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#101737]/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="#top" className="flex items-center gap-2.5">
            <StarMark size={34} />
            <span className="font-display text-lg font-semibold tracking-tight">
              Shifted<span className="text-emerald-200/90">Mind</span>
            </span>
          </a>
          <nav className="hidden items-center gap-6 font-eyebrow text-muted-foreground md:flex">
            <a href="#how" className="transition-colors hover:text-emerald-200">
              01 Practice
            </a>
            <a href="#tone" className="transition-colors hover:text-emerald-200">
              02 Tone lab
            </a>
            <a href="#quiz" className="transition-colors hover:text-emerald-200">
              03 Archetype
            </a>
            <a href="#gym" className="transition-colors hover:text-emerald-200">
              04 Mind gym
            </a>
            <a href="#voices" className="transition-colors hover:text-emerald-200">
              05 Field notes
            </a>
          </nav>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Button asChild variant="ghost" className="text-foreground/80">
                <Link to={authHref}>My sky</Link>
              </Button>
            ) : (
              !isLoading && (
                <Button asChild variant="ghost" className="text-foreground/80">
                  <Link to="/auth">Sign in</Link>
                </Button>
              )
            )}
            <Button
              asChild
              className="rounded-full bg-foreground font-semibold text-background hover:bg-foreground/85"
            >
              <Link to={authHref}>Start free</Link>
            </Button>
          </div>
        </div>
      </header>

      <div id="top" />

      {/* ---- Hero ---- */}
      <section className="relative mx-auto max-w-6xl px-4 pb-14 pt-32 sm:px-6 sm:pt-40">
        <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_1fr]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 font-eyebrow text-emerald-200/80"
            >
              <span className="h-px w-8 bg-emerald-200/40" />
              A field guide to the moment
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="text-clearing-soft mt-5 font-display text-5xl font-semibold leading-[1.04] tracking-tight sm:text-6xl"
            >
              Choose how you{" "}
              <span className="bg-gradient-to-r from-emerald-100 via-teal-100 to-sky-200 bg-clip-text text-transparent">
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
              <a
                href="#how"
                className="relative z-10 font-eyebrow text-foreground/75 transition-colors hover:text-emerald-200"
              >
                See it in action ↓
              </a>
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

      {/* ---- 02 Tone lab ---- */}
      <Section
        id="tone"
        index="02"
        eyebrow="The tone lab"
        title="Read the room before you hit send"
        note="Type any message. The instrument reads its tone, flags the patterns, and offers ways to say it differently."
      >
        <FadeUp>
          <ToneDetector />
        </FadeUp>
      </Section>

      {/* ---- 03 Try it right now ---- */}
      <Section
        index="03"
        eyebrow="Try it right now"
        title="No account needed for this part"
        note="Pull a real intention out of the sky and breathe through one guided reset. If either lands, that's the whole app in miniature."
      >
        <FadeUp>
          <div className="panel grid items-center gap-10 p-8 sm:p-10 lg:grid-cols-2">
            <SurpriseStar />
            <BreathOrb />
          </div>
        </FadeUp>
      </Section>

      {/* ---- 04 Constellation wall ---- */}
      <Section
        id="moments"
        index="04"
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
                    background: `linear-gradient(to bottom, ${color.hex}10, rgba(10,15,28,0.72))`,
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

      {/* ---- 05 Archetype quiz ---- */}
      <Section
        id="quiz"
        index="05"
        eyebrow="The archetype quiz"
        title="Which celestial body are you?"
        note="Eight introspective questions, one honest reading — your natural energy, its shadow, and a practice to keep it lit."
      >
        <FadeUp>
          <div className="panel overflow-hidden p-8 sm:p-10">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-xl">
                <p className="text-sm leading-relaxed text-foreground/70 sm:text-base">
                  Discover your archetype — the way your energy naturally
                  moves, the shadow that shadows it, and a practice to keep it
                  lit.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="mt-7 h-11 rounded-full bg-foreground px-6 font-semibold text-background hover:bg-foreground/85"
                >
                  <Link to={authHref}>
                    Take the quiz <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {RESPONSE_STYLES.map((st, i) => (
                <FadeUp key={st.id} delay={i * 0.07}>
                  <div className="group h-full rounded-xl border border-white/10 bg-[#131b3e]/40 p-5 transition-all hover:-translate-y-1 hover:border-white/25">
                    <span className="text-4xl">{st.emoji}</span>
                    <h3 className={`mt-4 font-display text-lg font-semibold ${st.glow}`}>
                      {st.name}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-foreground/80">
                      {st.tagline}
                    </p>
                    <div
                      className={`mt-4 h-0.5 w-10 rounded-full ${st.bar} transition-all group-hover:w-full`}
                    />
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </FadeUp>
      </Section>

      {/* ---- 06 Mind gym ---- */}
      <Section
        id="gym"
        index="06"
        eyebrow="The mind gym"
        title="Five tiny workouts for the space between stimulus and response"
        note="Each one takes under a minute. No sign-up, no score to post — just reps for the part of you that chooses."
      >
        <FadeUp>
          <MindGym />
        </FadeUp>
      </Section>

      {/* ---- 07 Micro-shifts ---- */}
      <Section
        index="07"
        eyebrow="Micro-shifts"
        title="Pocket resets for when it goes sideways"
        note="Tap one to open it. One lands in your sky every day."
      >
        <FadeUp>
          <ShiftWall />
        </FadeUp>
      </Section>

      {/* ---- 08 Breathe ---- */}
      <Section
        index="08"
        eyebrow="Breathe with the sky"
        title="The 4-7-8 reset, guided"
        note="The same pocket reset your sky nudges you with — in for four, hold for seven, out for eight. Reaction to choice, in about a minute."
        center
      >
        <FadeUp>
          <div className="panel relative mx-auto max-w-3xl overflow-hidden p-10 text-center">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-emerald-200/5 to-transparent" />
            <div className="flex justify-center">
              <BreathOrb />
            </div>
          </div>
        </FadeUp>
      </Section>

      {/* ---- 09 Ranks ---- */}
      <Section
        index="09"
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
      </Section>

      {/* ---- 10 Field notes (voices) ---- */}
      <Section
        id="voices"
        index="10"
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
              <div className="pointer-events-none absolute -top-16 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-emerald-200/10 blur-3xl" />
              <p className="font-eyebrow text-emerald-200/70">
                Last call · the sky is open
              </p>
              <h2 className="text-clearing-soft mx-auto mt-4 max-w-xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Your first star takes{" "}
                <span className="text-emerald-200">ten seconds</span>
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-foreground/70 sm:text-base">
                {isAuthenticated
                  ? "Your sky is waiting. Go hang tonight's intention."
                  : "Make an account, hang one intention, and let tomorrow meet a slightly more intentional you."}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                {cta}
              </div>
              <div className="mt-7 flex items-center justify-center gap-6 font-eyebrow text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Star className="h-3 w-3 text-emerald-300" /> Streaks & nudges
                </span>
                <span className="flex items-center gap-1.5">
                  <Bell className="h-3 w-3 text-emerald-300" /> No ads, ever
                </span>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ---- Footer — dark ink silhouettes against the bright horizon ---- */}
      <footer className="relative border-t border-[#101737]/15 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2.5">
            <StarMark size={30} />
            <div>
              <p className="font-display text-sm font-semibold tracking-tight text-[#101737]">
                Shifted<span className="text-[#0c5a4e]">Mind</span>
              </p>
              <p className="font-eyebrow text-[#101737]/70">
                choose your responses
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-5 font-eyebrow text-[#101737]/75">
            <a href="#how" className="hover:text-[#0c5a4e]">
              Practice
            </a>
            <a href="#tone" className="hover:text-[#0c5a4e]">
              Tone lab
            </a>
            <a href="#quiz" className="hover:text-[#0c5a4e]">
              Archetype
            </a>
            <a href="#gym" className="hover:text-[#0c5a4e]">
              Mind gym
            </a>
            <Link to="/auth" className="hover:text-[#0c5a4e]">
              Sign in
            </Link>
          </nav>
          <p className="font-eyebrow text-[#101737]/60">
            © {new Date().getFullYear()} ShiftedMind
          </p>
        </div>
      </footer>
    </div>
  );
}
