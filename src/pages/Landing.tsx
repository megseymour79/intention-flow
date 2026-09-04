import { useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowRight, Bell, Sparkles, Star } from "lucide-react";

import { FloatingBackground } from "@/components/FloatingBackground";
import { StarMark } from "@/components/StarMark";
import { StarSky, SkyStarLike } from "@/components/StarSky";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useAuth } from "@/hooks/use-auth";
import {
  MOMENTS,
  RESPONSE_STYLES,
  SHIFTS,
  STAR_COLORS,
  SUGGESTED_STARS,
} from "@/lib/shift-data";

function FadeUp({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease: [0.21, 0.65, 0.35, 1] }}
    >
      {children}
    </motion.div>
  );
}

function seeded(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Interactive hero sky: type an intention, hang it, watch it twinkle. */
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
    <div>
      <StarSky
        stars={demos}
        onPick={() => undefined}
        onDrop={() => undefined}
        onRequestCreate={hang}
        className="h-[380px] w-full overflow-hidden rounded-[28px] border border-white/12 bg-gradient-to-b from-[#0e0924] via-[#1a1040] to-[#2b1654] sm:h-[440px]"
        hint="tap the sky & type a way you want to be"
      />
      <div className="relative z-10 -mt-8 mx-auto w-[92%] rounded-2xl border border-white/12 bg-[#201443]/90 p-2 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="pl-2 text-lg">✍️</span>
          <Input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") hang();
            }}
            placeholder="I want to be patient when I'm interrupted…"
            maxLength={120}
            className="border-0 bg-transparent text-sm shadow-none placeholder:text-foreground/40 focus-visible:ring-0"
          />
          <Button
            onClick={() => hang()}
            disabled={typed.trim().length === 0}
            className="shrink-0 rounded-xl bg-amber-300 font-bold text-amber-950 hover:bg-amber-200"
          >
            Hang it <span className="ml-1">✦</span>
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
      className="h-12 rounded-full bg-amber-300 px-7 text-base font-bold text-amber-950 shadow-[0_0_30px_-8px_rgba(251,191,36,0.7)] transition-transform hover:scale-[1.03] hover:bg-amber-200"
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

      {/* ---- Nav ---- */}
      <header className="absolute inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <a href="#top" className="flex items-center gap-2.5">
            <StarMark size={36} />
            <span className="text-lg font-extrabold tracking-tight">
              Shifted<span className="text-amber-300">Mind</span>
            </span>
          </a>
          <nav className="hidden items-center gap-6 text-sm text-foreground/70 md:flex">
            <a href="#how" className="transition-colors hover:text-amber-200">
              How it works
            </a>
            <a href="#moments" className="transition-colors hover:text-amber-200">
              Intentions
            </a>
            <a href="#quiz" className="transition-colors hover:text-amber-200">
              Your style
            </a>
            <a href="#voices" className="transition-colors hover:text-amber-200">
              Voices
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
              className="rounded-full bg-amber-300 font-bold text-amber-950 hover:bg-amber-200"
            >
              <Link to={authHref}>Start free</Link>
            </Button>
          </div>
        </div>
      </header>

      <div id="top" />

      {/* ---- Hero ---- */}
      <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-6 sm:pt-36">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3.5 py-1.5 text-xs font-semibold text-amber-100"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Intentions for real-life moments
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl"
            >
              Choose how you{" "}
              <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-fuchsia-300 bg-clip-text text-transparent">
                show up
              </span>{" "}
              — before life chooses for you.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="mt-5 max-w-xl text-base leading-relaxed text-foreground/75 sm:text-lg"
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
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              {cta}
              <a
                href="#how"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/70 transition-colors hover:text-amber-200"
              >
                See it in action
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground"
            >
              <span>Free to start</span>
              <span>·</span>
              <span>No credit card</span>
              <span>·</span>
              <span>About 90 seconds a day</span>
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <HeroSky />
          </motion.div>
        </div>
      </section>

      {/* ---- How it works ---- */}
      <section id="how" className="relative scroll-mt-20 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <FadeUp>
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-200/80">
                How it works
              </p>
              <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
                Three small moves, one different day
              </h2>
            </div>
          </FadeUp>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <FadeUp key={step.title} delay={i * 0.1}>
                <div className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition-all hover:-translate-y-1 hover:border-amber-300/30">
                  <span className="absolute -right-3 -top-5 text-[90px] font-extrabold text-white/[0.05] transition-colors group-hover:text-amber-300/10">
                    {i + 1}
                  </span>
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-white/10 to-white/[0.03] text-3xl ring-1 ring-white/10">
                    {step.emoji}
                  </span>
                  <h3 className="mt-5 text-lg font-bold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/65">
                    {step.body}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.15}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <span className="mr-1 text-xs uppercase tracking-widest text-muted-foreground">
                Pick your moment —
              </span>
              {MOMENTS.map((m) => (
                <span
                  key={m.id}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-foreground/70"
                >
                  {m.emoji} {m.label.replace(/^(in|on|when|before|while)\s+/i, "")}
                </span>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ---- Intentions people borrow ---- */}
      <section id="moments" className="relative scroll-mt-20 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <FadeUp>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-200/80">
                  The constellation wall
                </p>
                <h2 className="mt-3 max-w-xl text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Intentions people actually hang
                </h2>
              </div>
              <p className="max-w-sm text-sm text-foreground/60">
                Borrow one as-is, or make it yours. Every star here started as
                someone's honest answer to “who do I want to be in this?”
              </p>
            </div>
          </FadeUp>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SUGGESTED_STARS.map((s, i) => {
              const color = STAR_COLORS[s.colorKey];
              return (
                <FadeUp key={s.text} delay={(i % 3) * 0.08}>
                  <div
                    className="flex items-start gap-3 rounded-2xl border px-4 py-3.5 transition-all hover:-translate-y-0.5"
                    style={{
                      borderColor: `${color.hex}30`,
                      background: `${color.hex}0d`,
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
                      <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                        {MOMENTS.find((m) => m.id === s.moment)?.label}
                      </p>
                    </div>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---- Response style quiz teaser ---- */}
      <section id="quiz" className="relative scroll-mt-20 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <FadeUp>
            <div className="overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#1d1145] via-[#241a5c] to-[#3a1e5f] p-8 sm:p-12">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div className="max-w-xl">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-200/80">
                    The response-style quiz
                  </p>
                  <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                    You react a certain way. Do you know which?
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-foreground/70 sm:text-base">
                    Six playful questions, one honest mirror. Meet your response
                    style, see the pattern it tends to run, and get a practice
                    that gently reroutes it.
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="mt-7 h-12 rounded-full bg-amber-300 px-6 text-base font-bold text-amber-950 hover:bg-amber-200"
                  >
                    <Link to={authHref}>
                      Take the quiz <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {RESPONSE_STYLES.map((st, i) => (
                  <FadeUp key={st.id} delay={i * 0.07}>
                    <div className="group h-full rounded-3xl border border-white/10 bg-black/20 p-5 backdrop-blur-sm transition-all hover:-translate-y-1.5 hover:border-white/25">
                      <span className="text-4xl">{st.emoji}</span>
                      <h3 className={`mt-4 text-lg font-extrabold ${st.glow}`}>
                        {st.name}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-foreground/65">
                        {st.tagline}
                      </p>
                      <div
                        className={`mt-4 h-1 w-10 rounded-full ${st.bar} transition-all group-hover:w-full`}
                      />
                    </div>
                  </FadeUp>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ---- Micro-shifts ---- */}
      <section className="relative py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <FadeUp>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-200/80">
                  Micro-shifts
                </p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight">
                  Pocket resets for when it goes sideways
                </h2>
              </div>
              <p className="max-w-sm text-sm text-foreground/60">
                One lands in your sky every day. A tiny, weird, effective
                move — ninety seconds max.
              </p>
            </div>
          </FadeUp>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SHIFTS.slice(0, 8).map((s, i) => (
              <FadeUp key={s.title} delay={(i % 4) * 0.06}>
                <div className="flex h-full items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition-colors hover:border-amber-300/25 hover:bg-amber-300/[0.04]">
                  <span className="text-xl">{s.emoji}</span>
                  <div>
                    <p className="text-sm font-bold">{s.title}</p>
                    <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-foreground/60">
                      {s.body}
                    </p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Voices ---- */}
      <section id="voices" className="relative scroll-mt-20 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <FadeUp>
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-200/80">
                Voices from the sky
              </p>
              <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
                Small stars, hung daily, change how people meet their moments
              </h2>
            </div>
          </FadeUp>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {VOICES.map((v, i) => (
              <FadeUp key={v.name} delay={i * 0.1}>
                <figure className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                  <span className={`text-2xl ${v.color}`}>{v.star}</span>
                  <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/85">
                    “{v.text}”
                  </blockquote>
                  <figcaption className="mt-5 text-xs font-semibold text-muted-foreground">
                    {v.name}
                  </figcaption>
                </figure>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Final CTA ---- */}
      <section className="relative py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <FadeUp>
            <div className="relative overflow-hidden rounded-[32px] border border-amber-300/25 bg-gradient-to-br from-amber-300/15 via-[#2b1a55] to-[#46205f] p-10 text-center sm:p-14">
              <div className="pointer-events-none absolute -top-16 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-amber-300/20 blur-3xl" />
              <span className="animate-floaty inline-block text-4xl">🌌</span>
              <h2 className="mx-auto mt-4 max-w-xl text-3xl font-extrabold tracking-tight sm:text-5xl">
                Your first star takes{" "}
                <span className="text-amber-300">ten seconds</span>
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-foreground/75 sm:text-base">
                {isAuthenticated
                  ? "Your sky is waiting. Go hang tonight's intention."
                  : "Make an account, hang one intention, and let tomorrow meet a slightly more intentional you."}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                {cta}
              </div>
              <div className="mt-6 flex items-center justify-center gap-6 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Star className="h-3 w-3 text-amber-300" /> Streaks & gentle
                  nudges
                </span>
                <span className="flex items-center gap-1.5">
                  <Bell className="h-3 w-3 text-amber-300" /> No ads, ever
                </span>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="relative border-t border-white/8 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2.5">
            <StarMark size={30} />
            <div>
              <p className="text-sm font-extrabold tracking-tight">
                Shifted<span className="text-amber-300">Mind</span>
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                choose your responses
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-5 text-xs text-muted-foreground">
            <a href="#how" className="hover:text-amber-200">
              How it works
            </a>
            <a href="#quiz" className="hover:text-amber-200">
              Quiz
            </a>
            <a href="#voices" className="hover:text-amber-200">
              Voices
            </a>
            <Link to="/auth" className="hover:text-amber-200">
              Sign in
            </Link>
          </nav>
          <p className="text-[11px] text-muted-foreground/70">
            © {new Date().getFullYear()} ShiftedMind — one star at a time.
          </p>
        </div>
      </footer>
    </div>
  );
}
