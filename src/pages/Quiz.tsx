import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

import { FadeUp, PublicPage, Section } from "@/components/PublicShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { RESPONSE_STYLES } from "@/lib/shift-data";

/* ------------------------------------------------------------------ */
/* /quiz — the archetype quiz, previously landing section 05.          */
/* ------------------------------------------------------------------ */

export default function Quiz() {
  const { isAuthenticated } = useAuth();
  const authHref = isAuthenticated
    ? "/deeper"
    : "/auth?returnTo=%2Fdeeper";

  return (
    <PublicPage>
      <section className="relative mx-auto max-w-6xl px-4 pb-4 pt-32 sm:px-6 sm:pt-40">
        <FadeUp>
          <p className="font-eyebrow text-amber-200/85">The archetype quiz</p>
          <h1 className="text-clearing-soft mt-3 max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Which celestial body are you?
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-foreground/70">
            Eight introspective questions, one honest reading — your natural
            energy, its shadow, and a practice to keep it lit.
          </p>
        </FadeUp>
      </section>

      <Section
        index="01"
        eyebrow="Take the reading"
        title="Eight questions. No wrong answers — only honest ones."
        note="Discover your archetype: the way your energy naturally moves, the shadow that shadows it, and a practice to keep it lit."
      >
        <FadeUp>
          <div className="panel overflow-hidden p-8 sm:p-10">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-xl">
                <p className="text-sm leading-relaxed text-foreground/70 sm:text-base">
                  Your result also tunes the intentions your sky suggests —
                  stars that fit the way you actually move through a moment.
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
                  <div className="group h-full rounded-xl border border-white/10 bg-[#211448]/40 p-5 transition-all hover:-translate-y-1 hover:border-white/25">
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
    </PublicPage>
  );
}
