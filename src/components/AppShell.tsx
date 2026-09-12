import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router";
import { LogOut, MessagesSquare, Send, Sparkles, Telescope } from "lucide-react";
import { FloatingBackground } from "@/components/FloatingBackground";
import { StarMark } from "@/components/StarMark";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useSkyRank } from "@/lib/unlocks";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "My Sky", icon: Sparkles },
  { to: "/observatory", label: "Observatory", icon: Telescope },
  { to: "/community", label: "Community", icon: MessagesSquare },
  { to: "/messages", label: "Messages", icon: Send },
] as const;

export function initialsOf(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

/** The one consistent page opening: mono eyebrow, serif title, quiet sub. */
export function PageHeader({
  eyebrow,
  title,
  sub,
  action,
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/12 pb-5">
      <div className="min-w-0">
        <p className="font-eyebrow text-muted-foreground">{eyebrow}</p>
        <h1 className="text-clearing-soft mt-1.5 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {title}
        </h1>
        {sub && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {sub}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function AppShell({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const rank = useSkyRank();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const sidebarLink = (item: (typeof NAV)[number]) => (
    <NavLink
      key={item.to}
      to={item.to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg border border-transparent px-3.5 py-2 text-sm font-medium transition-all",
          isActive
            ? "border-white/12 bg-white/[0.06] text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
            : "text-foreground/75 hover:bg-white/[0.03] hover:text-foreground",
        )
      }
    >
      <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      {item.label}
    </NavLink>
  );

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <FloatingBackground count={10} />
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col lg:flex-row">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-white/8 px-4 py-6 lg:flex">
          <NavLink to="/" className="mb-7 flex items-center gap-2.5">
            <StarMark size={36} />
            <div className="leading-tight">
              <p className="font-display text-[15px] font-semibold tracking-tight">
                Shifted<span className="text-emerald-200/90">Mind</span>
              </p>
              <p className="font-eyebrow text-muted-foreground">
                choose your responses
              </p>
            </div>
          </NavLink>

          <nav className="space-y-1">{NAV.map(sidebarLink)}</nav>

          <div className="mt-auto space-y-3">
            <div className="panel p-3 text-center">
              <p className="font-display text-[13px] italic leading-relaxed text-foreground/80">
                “Between stimulus and response there is a space. In that space is
                our power.”
              </p>
              <p className="font-eyebrow mt-1.5 text-emerald-200/60">
                — Viktor Frankl
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-left transition-colors hover:bg-white/8"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-200/25 bg-emerald-200/10 font-mono text-xs font-semibold text-emerald-100">
                    {initialsOf(user?.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {user?.name ?? "Stargazer"}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {user?.email ?? "anonymous star"}
                    </span>
                    {!rank.loading && (
                      <span className="font-eyebrow mt-0.5 block truncate text-emerald-200/70">
                        {rank.emoji} {rank.name}
                      </span>
                    )}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>My account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* Mobile header */}
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#101737]/85 backdrop-blur-md lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <NavLink to="/" className="flex items-center gap-2">
              <StarMark size={32} />
              <span className="font-display text-base font-semibold tracking-tight">
                Shifted<span className="text-emerald-200/90">Mind</span>
              </span>
            </NavLink>
            <div className="flex items-center gap-1.5">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                      isActive
                        ? "bg-white/[0.07] text-emerald-200"
                        : "text-foreground/70 hover:bg-white/5 hover:text-foreground",
                    )
                  }
                >
                  <item.icon className="h-5 w-5" />
                </NavLink>
              ))}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                aria-label="Sign out"
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <div className="page-col">
            {title && (
              <h1 className="sr-only">{title}</h1>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
