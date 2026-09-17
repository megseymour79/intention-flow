import { useMemo, useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Compass, Sparkles, Youtube } from "lucide-react";

import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import {
  CATEGORIES,
  RESOURCES,
  categoryOf,
  pickOfTheDay,
  type CategoryId,
  type MindResource,
  type ResourceKind,
} from "@/lib/resources";
import {
  pickIntentionalWatch,
  type IntentionalWatch,
} from "@/lib/intentional-watch";
import { cn } from "@/lib/utils";

const KIND_STYLES: Record<ResourceKind, string> = {
  Watch: "bg-rose-300/10 text-rose-200 ring-rose-300/25",
  Listen: "bg-violet-300/10 text-violet-200 ring-violet-300/25",
  Read: "bg-amber-300/10 text-amber-200 ring-amber-300/25",
  Practice: "bg-amber-300/10 text-amber-200 ring-amber-300/25",
  Explore: "bg-violet-300/10 text-violet-200 ring-violet-300/25",
};

function ResourceCard({ r, index }: { r: MindResource; index: number }) {
  const cat = categoryOf(r.category);
  return (
    <motion.a
      href={r.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.35 }}
      whileHover={{ y: -3 }}
      className="panel panel-hover group relative flex flex-col overflow-hidden p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-xl ring-1 ring-white/10">
          {r.emoji}
        </span>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ring-1",
              KIND_STYLES[r.kind],
            )}
          >
            {r.kind}
          </span>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
        </div>
      </div>

      <p className="mt-4 text-sm font-bold leading-snug tracking-tight">{r.title}</p>
      <p className="font-eyebrow mt-0.5 text-muted-foreground/70">
        {r.by} · {r.length}
      </p>

      <p className="mt-3 flex-1 text-xs leading-relaxed text-foreground/75">{r.blurb}</p>

      <p className="mt-4 border-t hairline pt-3 font-display text-xs italic leading-relaxed text-amber-200/80">
        ✦ {r.take}
      </p>

      <p className="font-eyebrow mt-2 text-muted-foreground/70">
        {cat.emoji} {cat.name}
      </p>
    </motion.a>
  );
}

/* The wormhole — “take me somewhere intentional”: every click warps the
   stargazer to a different hand-picked talk, never the same one twice. */
function WormholeCard() {
  const [watch, setWatch] = useState<IntentionalWatch | null>(null);

  const warp = () => setWatch((cur) => pickIntentionalWatch(cur?.id ?? null));

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="panel panel-hover relative overflow-hidden p-5"
      aria-label="Take me somewhere intentional — a random talk on intentions"
    >
      <div className="pointer-events-none absolute -bottom-12 -right-10 h-40 w-40 rounded-full bg-violet-300/12 blur-3xl" />
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 animate-glow-pulse items-center justify-center rounded-xl bg-violet-300/12 text-2xl ring-1 ring-violet-300/30">
          🌀
        </span>
        <div className="min-w-[220px] flex-1">
          <p className="font-eyebrow text-violet-200/80">
            the wormhole · a new film every click
          </p>
          <p className="mt-1 text-base font-bold tracking-tight">
            Take me somewhere intentional
          </p>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
            Ten hand-picked talks on intentions, growth, and choosing who you
            are. The sky picks one at random — never the same film twice in a
            row.
          </p>
        </div>
        <Button
          onClick={warp}
          className="rounded-full bg-violet-300 font-semibold text-violet-950 hover:bg-violet-200"
        >
          <Sparkles className="mr-1.5 h-4 w-4" />
          {watch ? "Somewhere else" : "Warp me"}
        </Button>
      </div>

      <div aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {watch && (
            <motion.a
              key={watch.id}
              href={watch.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="group mt-4 flex items-center gap-3 rounded-2xl border border-violet-300/20 bg-violet-300/[0.06] p-3.5 transition-colors hover:border-violet-300/40"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-300/15 text-lg ring-1 ring-violet-300/25">
                {watch.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold tracking-tight">
                  {watch.title}
                </span>
                <span className="font-eyebrow mt-0.5 block text-muted-foreground">
                  {watch.by} · {watch.length} · opens on YouTube
                </span>
              </span>
              <Youtube className="h-5 w-5 shrink-0 text-violet-200/60 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-200" />
            </motion.a>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

type Filter = CategoryId | "all";

export default function Observatory() {
  const [filter, setFilter] = useState<Filter>("all");
  const pick = useMemo(() => pickOfTheDay(), []);

  const shown = useMemo(
    () => (filter === "all" ? RESOURCES : RESOURCES.filter((r) => r.category === filter)),
    [filter],
  );

  return (
    <AppShell title="The Observatory">
      <div className="space-y-7">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <PageHeader
            eyebrow="Section 02 · Star charts"
            title={
              <>
                The Observatory{" "}
                <span className="inline-block animate-sway">🔭</span>
              </>
            }
            sub="The science behind why this sky works — and it's all free to explore. Every chart is hand-picked and real: neuroscientists, psychologists, and researchers on rewiring your mind, catching engrained responses, and choosing who you are, moment by moment."
          />
        </motion.div>

        {/* Tonight's pick */}
        <motion.a
          href={pick.url}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          whileHover={{ y: -2 }}
          className="panel panel-hover group relative block overflow-hidden p-5"
        >
          <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-amber-300/10 blur-3xl" />
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 animate-glow-pulse items-center justify-center rounded-xl bg-amber-300/12 text-2xl ring-1 ring-amber-300/25">
              {pick.emoji}
            </span>
            <div className="min-w-[220px] flex-1">
              <p className="font-eyebrow text-amber-200/80">
                tonight's chart · rotates at midnight
              </p>
              <p className="mt-1 text-base font-bold tracking-tight">{pick.title}</p>
              <p className="font-eyebrow mt-0.5 text-muted-foreground">
                {pick.by} · {pick.length} · {pick.kind}
              </p>
              <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground">
                {pick.blurb}
              </p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-amber-200/60 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-amber-200" />
          </div>
        </motion.a>

        {/* The wormhole — a random intention talk on every click */}
        <WormholeCard />

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-full border px-4 py-1.5 font-eyebrow transition-colors",
              filter === "all"
                ? "border-amber-300/45 bg-amber-300/12 text-amber-200"
                : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/25 hover:text-foreground",
            )}
          >
            ✦ All charts
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setFilter(c.id)}
              className={cn(
                "rounded-full border px-4 py-1.5 font-eyebrow transition-colors",
                filter === c.id
                  ? "border-amber-300/45 bg-amber-300/12 text-amber-200"
                  : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/25 hover:text-foreground",
              )}
            >
              {c.emoji} {c.name}
            </button>
          ))}
        </div>

        {/* Category tagline (when filtered) */}
        {filter !== "all" && (
          <motion.p
            key={filter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl text-sm italic text-muted-foreground/90"
          >
            {categoryOf(filter).tagline}
          </motion.p>
        )}

        {/* The charts */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((r, i) => (
            <ResourceCard key={r.id} r={r} index={i} />
          ))}
        </div>

        {/* Footer CTA back into the practice */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="panel relative block overflow-hidden p-6"
        >
          <div className="pointer-events-none absolute -left-8 -bottom-10 h-32 w-32 rounded-full bg-violet-300/10 blur-3xl" />
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-300/15 text-2xl ring-1 ring-violet-300/25">
              <Compass className="h-6 w-6 text-violet-200" />
            </span>
            <div className="min-w-[220px] flex-1">
              <p className="text-sm font-bold tracking-tight">
                Reading changes minds. Practicing changes nights.
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                Take one idea from a chart and hang it as tonight's star — that's the
                whole method.
              </p>
            </div>
            <Link to="/dashboard">
              <Button className="rounded-full bg-foreground font-semibold text-background hover:bg-foreground/85">
                <Sparkles className="mr-1.5 h-4 w-4" />
                Hang a star in my sky
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}
