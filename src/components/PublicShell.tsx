import { useState } from "react";
import { Link, useLocation } from "react-router";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

import { FloatingBackground } from "@/components/FloatingBackground";
import { StarMark } from "@/components/StarMark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

/* ------------------------------------------------------------------ */
/* Shared public-page chrome: nav, footer, section layout, page wrap   */
/* Every public page renders inside PublicPage so navigation and the   */
/* ember-dusk atmosphere stay identical across the split pages.        */
/* ------------------------------------------------------------------ */

export const PUBLIC_LINKS = [
  { to: "/method", label: "Method" },
  { to: "/tone-lab", label: "Tone lab" },
  { to: "/quiz", label: "Archetype" },
  { to: "/breathe", label: "Breathe" },
] as const;

export function FadeUp({
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

export function Section({
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
                <p className="font-eyebrow text-amber-200/85">
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

export function PublicNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const authHref = isAuthenticated ? "/dashboard" : "/auth?returnTo=%2Fdashboard";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#171033]/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <StarMark size={34} />
          <span className="font-display text-lg font-semibold tracking-tight">
            Shifted<span className="text-amber-200/90">Mind</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 font-eyebrow text-muted-foreground md:flex">
          {PUBLIC_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "transition-colors hover:text-amber-200",
                pathname === l.to && "text-amber-200",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
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
            <Link to={authHref}>{isAuthenticated ? "Open my sky" : "Start free"}</Link>
          </Button>
        </div>
        {/* Mobile menu toggle */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-foreground/85 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="border-t border-white/10 bg-[#171033]/95 px-4 pb-5 pt-3 backdrop-blur-md md:hidden">
          <nav className="flex flex-col gap-1 font-eyebrow text-muted-foreground">
            {PUBLIC_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 tracking-[0.28em] transition-colors hover:bg-white/5 hover:text-amber-200",
                  pathname === l.to && "text-amber-200",
                )}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to={authHref}
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg px-3 py-2.5 tracking-[0.28em] text-foreground hover:bg-white/5"
            >
              {isAuthenticated ? "My sky" : "Sign in / Start free"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="relative border-t border-white/10 bg-gradient-to-b from-[#120b26]/0 via-[#120b26]/92 to-[#120b26] py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2.5">
          <StarMark size={30} />
          <div>
            <p className="font-display text-sm font-semibold tracking-tight text-foreground">
              Shifted<span className="text-amber-200/90">Mind</span>
            </p>
            <p className="font-eyebrow text-foreground/70">choose your responses</p>
          </div>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-5 font-eyebrow text-foreground/80">
          {PUBLIC_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="hover:text-amber-200">
              {l.label}
            </Link>
          ))}
          <Link to="/auth" className="hover:text-amber-200">
            Sign in
          </Link>
        </nav>
        <p className="font-eyebrow text-foreground/70">
          © {new Date().getFullYear()} ShiftedMind
        </p>
      </div>
    </footer>
  );
}

/** Full public page: atmosphere, fixed nav, content, footer. */
export function PublicPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <FloatingBackground count={22} />

      {/* top scrim — keeps the nav and page-top readable under the moving sky */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-80"
        style={{
          background:
            "linear-gradient(to bottom, rgba(17,9,38,0.88) 0%, rgba(23,13,46,0.55) 45%, rgba(30,17,54,0) 100%)",
        }}
      />

      <PublicNav />
      {children}
      <PublicFooter />
    </div>
  );
}
