import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FloatingBackground } from "@/components/FloatingBackground";
import { ARCHETYPES, INTENTIONS, QUIZ_QUESTIONS, TIPS } from "@/lib/intention-data";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  Flame,
  Moon,
  Sparkles,
  Sprout,
  Wand2,
} from "lucide-react";
import { useNavigate } from "react-router";

const EASE = [0.22, 0.61, 0.36, 1] as const;

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function EmberMark({ size = 40 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-orange-400 to-rose-500 shadow-[0_0_24px_rgba(251,146,60,0.45)]"
      style={{ width: size, height: size }}
    >
      <span className="text-white" style={{ fontSize: size * 0.55 }}>
        ✦
      </span>
    </div>
  );
}

const FLOATERS = [
  { emoji: "✨", label: "Be curious today", cls: "left-[6%] top-[22%] animate-floaty", delay: "0s" },
  { emoji: "🌊", label: "Go with the flow", cls: "right-[7%] top-[28%] animate-floaty", delay: "1.2s" },
  { emoji: "🌼", label: "Bloom anyway", cls: "left-[12%] bottom-[24%] animate-floaty", delay: "2s" },
  { emoji: "🕊️", label: "Move with grace", cls: "right-[10%] bottom-[30%] animate-floaty", delay: "0.6s" },
  { emoji: "🪔", label: "Light the way", cls: "left-[38%] top-[14%] animate-floaty", delay: "1.6s" },
];

export default function Landing() {
  const navigate = useNavigate();
  const sampleQ = QUIZ_QUESTIONS[1];
  const tip = TIPS[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen text-foreground"
    >
      <FloatingBackground />

      {/* ---- Nav ---- */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-3"
        >
          <EmberMark />
          <span className="text-2xl font-extrabold tracking-tight">
            Ember<span className="text-amber-300">.</span>
          </span>
        </button>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-foreground/80 md:flex">
          <a href="#how" className="transition-colors hover:text-amber-300">
            How it works
          </a>
          <a href="#quiz" className="transition-colors hover:text-amber-300">
            Glow quiz
          </a>
          <a href="#nudges" className="transition-colors hover:text-amber-300">
            Little nudges
          </a>
        </nav>
        <Button
          onClick={() => navigate("/auth")}
          className="gap-2 rounded-full bg-amber-300 text-amber-950 hover:bg-amber-200"
        >
          Open the app <ArrowRight className="size-4" />
        </Button>
      </header>

      {/* ---- Hero ---- */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pt-16 pb-24 sm:px-8 sm:pt-24">
        <div className="pointer-events-none absolute -top-6 right-[8%] hidden animate-sway text-6xl lg:block">
          🌙
        </div>
        {FLOATERS.map((f) => (
          <div
            key={f.label}
            className={`pointer-events-none absolute hidden rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold backdrop-blur-md md:block ${f.cls}`}
            style={{ animationDelay: f.delay }}
          >
            {f.emoji} {f.label}
          </div>
        ))}

        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-1.5 text-sm font-bold text-amber-200">
              <Flame className="size-4 text-amber-300" />
              One tiny intention. One glowing day.
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="text-balance text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-7xl">
              Set your intention.
              <br />
              <span className="bg-gradient-to-r from-amber-200 via-orange-300 to-rose-300 bg-clip-text text-transparent">
                Let it glow.
              </span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-6 max-w-xl text-balance text-lg leading-relaxed text-foreground/75">
              Ember is a gentle home for how you want to show up today — curious,
              steady, playful, free. Choose a feeling, plant it, and let a soft
              reminder bring it back when the day gets loud.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="w-full gap-2 rounded-full bg-amber-300 px-8 text-base font-extrabold text-amber-950 shadow-[0_0_30px_rgba(251,191,36,0.35)] hover:bg-amber-200 sm:w-auto"
              >
                <Sparkles className="size-5" />
                Start glowing today
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth")}
                className="w-full rounded-full border-white/20 bg-white/5 px-8 text-base font-bold backdrop-blur-sm hover:bg-white/10 sm:w-auto"
              >
                <Wand2 className="size-5 text-amber-300" />
                Find your glow
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="mt-6 text-sm text-foreground/55">
              Free to start · Takes 10 seconds · No streaks shaming you, promise
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---- How it works ---- */}
      <section id="how" className="relative z-10 mx-auto max-w-6xl scroll-mt-24 px-5 py-20 sm:px-8">
        <Reveal>
          <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-5xl">
            Three tiny steps to a <span className="text-amber-300">brighter</span> day
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              emoji: "🪄",
              title: "Set it",
              body: "Pick a feeling for your day — from 'be brave in one small way' to 'let joy be louder than worry'. Or write your own.",
              icon: <Wand2 className="size-6 text-amber-300" />,
            },
            {
              emoji: "🔔",
              title: "Get reminded",
              body: "Choose when you want a gentle nudge. We'll send a whisper of your intention — morning glow, midday spark, or dusk reflection.",
              icon: <Bell className="size-6 text-amber-300" />,
            },
            {
              emoji: "🌱",
              title: "Bloom",
              body: "Watch your glow-streak grow as the days stack up. Peek at little practices that make intentions stick.",
              icon: <Sprout className="size-6 text-amber-300" />,
            },
          ].map((step, i) => (
            <Reveal key={step.title} delay={i * 0.1}>
              <div className="group h-full rounded-3xl border border-white/12 bg-white/5 p-7 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-300/40 hover:bg-white/8 hover:shadow-[0_18px_50px_-12px_rgba(251,146,60,0.25)]">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-300/15 text-amber-300">
                    {step.icon}
                  </div>
                  <span className="text-5xl opacity-25 transition-opacity group-hover:opacity-50">
                    {step.emoji}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-foreground/70">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- Intention gallery ---- */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <Reveal>
          <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-5xl">
            A pocketful of <span className="text-rose-300">intentions</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-foreground/70">
            Little promises you can make to your day. Each one floats with its own
            color and mood — tap one and it's yours.
          </p>
        </Reveal>
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {INTENTIONS.map((int, i) => (
            <motion.div
              key={int.text}
              className={`animate-floaty rounded-full border px-5 py-2.5 text-sm font-bold backdrop-blur-sm ${int.vibe ? "border-white/15 bg-white/6" : ""}`}
              style={{
                animationDelay: `${(i % 5) * 0.7}s`,
                animationDuration: `${5.5 + (i % 4)}s`,
              }}
              whileHover={{ scale: 1.06, rotate: i % 2 === 0 ? 1.5 : -1.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
            >
              {int.emoji} {int.text}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---- Quiz teaser ---- */}
      <section id="quiz" className="relative z-10 mx-auto max-w-6xl scroll-mt-24 px-5 py-20 sm:px-8">
        <Reveal>
          <div className="overflow-hidden rounded-[2rem] border border-white/12 bg-gradient-to-br from-white/8 via-white/4 to-transparent backdrop-blur-md">
            <div className="grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-2">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-300/30 bg-violet-400/10 px-4 py-1.5 text-sm font-bold text-violet-200">
                  ✨ The Glow Quiz
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Which <span className="text-violet-300">glow</span> are you?
                </h2>
                <p className="mt-4 leading-relaxed text-foreground/70">
                  Six whimsical questions, one luminous answer. Meet your
                  intention-archetype — Firefly, River, Mountain, or
                  Wildflower — and get practices + intentions tailored to how you
                  naturally shine.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {ARCHETYPES.map((a) => (
                    <span
                      key={a.id}
                      className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold"
                    >
                      {a.emoji} {a.name}
                    </span>
                  ))}
                </div>
                <Button
                  onClick={() => navigate("/auth")}
                  className="mt-8 gap-2 rounded-full bg-violet-300 px-7 text-amber-950 hover:bg-violet-200"
                >
                  Take the quiz <ArrowRight className="size-4" />
                </Button>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 rounded-[2rem] bg-violet-400/10 blur-2xl" />
                <div className="relative rounded-3xl border border-white/15 bg-[#221a4d]/90 p-7 shadow-2xl">
                  <div className="mb-4 flex items-center justify-between text-sm font-bold text-foreground/60">
                    <span>Question {sampleQ ? "2 of 6" : ""}</span>
                    <span className="text-violet-300">{sampleQ?.emoji}</span>
                  </div>
                  <p className="text-lg font-extrabold leading-snug">
                    {sampleQ?.question}
                  </p>
                  <div className="mt-5 space-y-2.5">
                    {sampleQ?.answers.map((a) => (
                      <div
                        key={a.label}
                        className="flex items-center justify-between rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold"
                      >
                        {a.label}
                        <span className="text-foreground/35">◯</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---- Little nudges ---- */}
      <section id="nudges" className="relative z-10 mx-auto max-w-6xl scroll-mt-24 px-5 py-20 sm:px-8">
        <Reveal>
          <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-5xl">
            Little <span className="text-emerald-300">nudges</span>, big shifts
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-foreground/70">
            Micro-practices that take under a minute and quietly change your whole
            day. Today's, free of charge:
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <Card className="mx-auto mt-10 max-w-2xl border-white/15 bg-white/6 p-8 text-center backdrop-blur-md animate-glow-pulse">
            <div className="text-6xl">{tip.emoji}</div>
            <h3 className="mt-4 text-2xl font-extrabold">{tip.title}</h3>
            <p className="mx-auto mt-3 max-w-md leading-relaxed text-foreground/75">
              {tip.body}
            </p>
            <p className="mt-5 text-xs font-bold uppercase tracking-widest text-amber-300/80">
              Tip of the day
            </p>
          </Card>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TIPS.slice(1, 9).map((t, i) => (
            <Reveal key={t.title} delay={i * 0.05}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/4 p-5 transition-colors hover:border-amber-300/35">
                <div className="text-3xl">{t.emoji}</div>
                <h4 className="mt-3 font-extrabold">{t.title}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/65">
                  {t.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- Final CTA ---- */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-amber-300/25 bg-gradient-to-br from-amber-300/15 via-rose-400/10 to-violet-400/15 px-8 py-16 text-center backdrop-blur-md">
            <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 text-7xl animate-sway">
              🪔
            </div>
            <h2 className="mx-auto max-w-2xl text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
              Tomorrow's you is waiting
              <br />
              for one small intention.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-foreground/75">
              Set it tonight, and let Ember carry the glow for you.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="mt-8 gap-2 rounded-full bg-amber-300 px-10 text-base font-extrabold text-amber-950 shadow-[0_0_30px_rgba(251,191,36,0.4)] hover:bg-amber-200"
            >
              <Moon className="size-5" />
              Set my intention
            </Button>
          </div>
        </Reveal>
      </section>

      {/* ---- Footer ---- */}
      <footer className="relative z-10 border-t border-white/10 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-foreground/55 sm:flex-row sm:px-8">
          <div className="flex items-center gap-2 font-extrabold text-foreground/80">
            <EmberMark size={26} />
            Ember — set your intention, let it glow
          </div>
          <p>Made with ✨ for everyone trying their best</p>
        </div>
      </footer>
    </motion.div>
  );
}