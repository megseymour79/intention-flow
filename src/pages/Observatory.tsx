import { useMemo, useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, Compass, Sparkles } from "lucide-react";

import { AppShell } from "@/components/AppShell";
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
import { cn } from "@/lib/utils";

const KIND_STYLES: Record<ResourceKind, string> = {
  Watch: "bg-rose-300/10 text-rose-200 ring-rose-300/25",
  Listen: "bg-sky-300/10 text-sky-200 ring-sky-300/25",
  Read: "bg-amber-300/10 text-amber-200 ring-amber-300/25",
  Practice: "bg-emerald-300/10 text-emerald-200 ring-emerald-300/25",
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
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20 hover:bg-white/[0.05]"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-xl ring-1 ring-white/10">
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
      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
        {r.by} · {r.length}
      </p>

      <p className="mt-3 flex-1 text-xs leading-relaxed text-muted-foreground">{r.blurb}</p>

      <p className="mt-4 border-t border-white/8 pt-3 text-xs italic leading-relaxed text-amber-200/80">
        ✦ {r.take}
      </p>

      <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground/50">
        {cat.emoji} {cat.name}
      </p>
    </motion.a>
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
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            star charts for a changing mind
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
            The Observatory{" "}
            <span className="inline-block animate-sway">🔭</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            The science behind why this sky works. Every chart here is hand-picked and
            real — neuroscientists, psychologists, and researchers on rewiring your
            mind, catching engrained responses, and choosing who you are, moment by
            moment.
          </p>
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
          className="group relative block overflow-hidden rounded-3xl border border-amber-300/25 bg-gradient-to-r from-amber-300/[0.09] via-white/[0.03] to-transparent p-5"
        >
          <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-amber-300/10 blur-3xl" />
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 animate-glow-pulse items-center justify-center rounded-2xl bg-amber-300/15 text-2xl ring-1 ring-amber-300/30">
              {pick.emoji}
            </span>
            <div className="min-w-[220px] flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/80">
                tonight's chart · rotates at midnight
              </p>
              <p className="mt-1 text-base font-bold tracking-tight">{pick.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {pick.by} · {pick.length} · {pick.kind}
              </p>
              <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground">
                {pick.blurb}
              </p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-amber-200/60 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-amber-200" />
          </div>
        </motion.a>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
              filter === "all"
                ? "border-amber-300/50 bg-amber-300/15 text-amber-200"
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
                "rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
                filter === c.id
                  ? "border-amber-300/50 bg-amber-300/15 text-amber-200"
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
          className="relative overflow-hidden rounded-3xl border border-sky-300/20 bg-gradient-to-r from-indigo-500/[0.09] via-white/[0.03] to-transparent p-6"
        >
          <div className="pointer-events-none absolute -left-8 -bottom-10 h-32 w-32 rounded-full bg-indigo-400/10 blur-3xl" />
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-300/15 text-2xl ring-1 ring-sky-300/25">
              <Compass className="h-6 w-6 text-sky-200" />
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
              <Button className="rounded-full bg-amber-300 font-bold text-amber-950 hover:bg-amber-200">
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
