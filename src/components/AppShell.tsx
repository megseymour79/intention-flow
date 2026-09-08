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
          "flex items-center gap-3 rounded-xl border border-transparent px-3.5 py-2.5 text-sm font-medium transition-all",
          isActive
            ? "border-amber-300/25 bg-amber-300/10 text-amber-100 shadow-[0_0_18px_-6px_rgba(251,191,36,0.4)]"
            : "text-foreground/65 hover:bg-white/5 hover:text-foreground",
        )
      }
    >
      <item.icon className="h-4.5 w-4.5 shrink-0" />
      {item.label}
    </NavLink>
  );

  return (
    <div className="relative min-h-screen">
      <FloatingBackground count={10} />
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col lg:flex-row">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-white/8 px-4 py-6 lg:flex">
          <NavLink to="/" className="mb-8 flex items-center gap-2.5">
            <StarMark size={38} />
            <div className="leading-tight">
              <p className="font-display text-[15px] font-bold tracking-tight">
                Shifted<span className="text-amber-300">Mind</span>
              </p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                choose your responses
              </p>
            </div>
          </NavLink>

          <nav className="space-y-1.5">{NAV.map(sidebarLink)}</nav>

          <div className="mt-auto space-y-3">
            <div className="rounded-2xl border border-white/8 bg-white/4 p-3 text-center">
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                “Between stimulus and response there is a space. In that space is
                our power.”
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-amber-200/70">
                — Viktor Frankl
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-left transition-colors hover:bg-white/8"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300/70 to-sky-400/70 text-sm font-bold text-[#0a1120]">
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
                      <span className="mt-0.5 block truncate text-[10px] font-semibold uppercase tracking-wider text-amber-200/80">
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
        <header className="sticky top-0 z-40 border-b border-white/8 bg-[#070d1a]/85 backdrop-blur-md lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <NavLink to="/" className="flex items-center gap-2">
              <StarMark size={32} />
              <span className="font-display text-base font-bold tracking-tight">
                Shifted<span className="text-amber-300">Mind</span>
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
                        ? "bg-amber-300/15 text-amber-200"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
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
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {title && (
            <h1 className="sr-only">{title}</h1>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
