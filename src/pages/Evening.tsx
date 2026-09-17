import { useState } from "react";
import { useQuery } from "convex/react";
import { Bell, Clock, Lock, Plus, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";

import { api } from "@/convex/_generated/api";
import { AppShell, PageHeader } from "@/components/AppShell";
import { ReflectionLedger } from "@/components/ReflectionLedger";
import { ConstellationProgress } from "@/components/SkyQuest";
import { REMINDER_SLOTS } from "@/hooks/use-reminders";
import { useRemindersContext } from "@/hooks/reminders-provider";
import { rankNameForLevel, useSkyRank } from "@/lib/unlocks";

export default function Evening() {
  const starsData = useQuery(api.stars.listForUser);
  const activeStar = (starsData ?? []).find((s) => s.active) ?? null;

  // Sky rank gates the late-vigil reminder slot.
  const rank = useSkyRank();
  // The scheduler lives app-wide in RemindersProvider; this page just
  // renders and controls it.
  const reminders = useRemindersContext();
  const [customTime, setCustomTime] = useState("07:30");

  return (
    <AppShell title="Evening">
      <div className="space-y-7">
        <PageHeader
          eyebrow="Section · evening"
          title={
            <>
              The evening <span className="text-amber-200/90">ledger</span>
            </>
          }
          sub="How the day actually went — one honest line at a time. This is where a shift stops being an idea and starts being a pattern."
        />

        {/* Nudges — the intention coming back to find you */}
        <div className="panel p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-200/25 bg-amber-200/10">
                <Bell className="h-5 w-5 text-amber-200" />
              </span>
              <div>
                <p className="font-bold">Nudge me back to my intention</p>
                <p className="mt-0.5 max-w-md text-xs leading-relaxed text-muted-foreground">
                  {activeStar
                    ? `We'll check in and remind you: “${activeStar.text.slice(0, 70)}”`
                    : "Set a focus star and we'll remind you how you meant to show up."}{" "}
                  Reminders arrive as toasts — and as system notifications when
                  you allow them.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {reminders.enabled
                  ? reminders.nextIn
                    ? `Next nudge in ~${reminders.nextIn}`
                    : "scheduled"
                  : "off"}
              </span>
              <Switch
                checked={reminders.enabled}
                onCheckedChange={(v) => void reminders.toggleEnabled(v)}
                disabled={
                  reminders.permission === "denied" && !reminders.enabled
                }
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/8 pt-4">
            {REMINDER_SLOTS.filter((s) => !s.level || rank.level >= s.level).map((slot) => {
              const on = reminders.slots.includes(slot.time);
              return (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!reminders.enabled}
                  onClick={() =>
                    reminders.setSlots(
                      on
                        ? reminders.slots.filter((t) => t !== slot.time)
                        : [...reminders.slots, slot.time].sort(),
                    )
                  }
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    on
                      ? "border-amber-300/50 bg-amber-300/12 text-amber-100"
                      : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/25"
                  }`}
                >
                  <span>{slot.emoji}</span>
                  {slot.label}
                  <span className="tabular-nums text-[10px] opacity-70">
                    {slot.time}
                  </span>
                </button>
              );
            })}
            {/* The vigil slot appears once the Ember rank is reached */}
            {rank.level < 3 && (
              <span
                title={`Reach the ${rankNameForLevel(3)} rank to unlock the 22:30 nudge`}
                className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground/75"
              >
                <Lock className="h-3 w-3" />
                Late vigil · 22:30
                <span className="text-[10px] uppercase tracking-wider opacity-70">
                  {rankNameForLevel(3)}
                </span>
              </span>
            )}
            {/* Custom time */}
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="time"
                value={customTime}
                disabled={!reminders.enabled}
                onChange={(e) => setCustomTime(e.target.value)}
                aria-label="Custom reminder time"
                className="bg-transparent text-xs tabular-nums outline-none [color-scheme:dark] disabled:opacity-40"
              />
              <button
                type="button"
                disabled={!reminders.enabled || !customTime}
                onClick={() =>
                  reminders.setSlots(
                    reminders.slots.includes(customTime)
                      ? reminders.slots.filter((t) => t !== customTime)
                      : [...reminders.slots, customTime].sort(),
                  )
                }
                aria-label={
                  reminders.slots.includes(customTime)
                    ? "Remove this custom time"
                    : "Add this custom time"
                }
                className="text-muted-foreground transition-colors hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {reminders.slots.includes(customTime) ? (
                  <X className="h-3.5 w-3.5" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {reminders.permission === "default" && (
                <button
                  type="button"
                  onClick={() => void reminders.requestPermission()}
                  className="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Allow notifications
                </button>
              )}
              <button
                type="button"
                disabled={!reminders.enabled}
                onClick={() => reminders.nudgeNow()}
                className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-xs transition-colors hover:bg-white/10 disabled:opacity-40"
              >
                Test a nudge
              </button>
            </div>
          </div>
          {reminders.permission === "denied" && (
            <p className="mt-3 text-xs text-rose-200/80">
              Notifications are blocked in your browser — toasts will still
              reach you while this tab is open.
            </p>
          )}
        </div>

        {/* Evening reflection ledger */}
        <div id="evening-ledger">
          <ReflectionLedger intentionText={activeStar?.text ?? null} />
        </div>

        {/* Thirty nights, drawn as a constellation */}
        <ConstellationProgress />
      </div>
    </AppShell>
  );
}
