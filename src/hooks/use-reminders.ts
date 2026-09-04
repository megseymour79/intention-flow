import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export interface ReminderSlot {
  time: string; // "HH:MM" 24h
  label: string;
  emoji: string;
}

export const REMINDER_SLOTS: ReminderSlot[] = [
  { time: "08:00", label: "Morning glow", emoji: "🌅" },
  { time: "13:00", label: "Midday spark", emoji: "☀️" },
  { time: "19:00", label: "Dusk reflection", emoji: "🌙" },
];

const PREFS_KEY = "shiftedmind-reminder-prefs";

interface Prefs {
  enabled: boolean;
  slots: string[]; // times
}

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Prefs;
      return {
        enabled: Boolean(parsed.enabled),
        slots: Array.isArray(parsed.slots) ? parsed.slots : [],
      };
    }
  } catch {
    // ignore corrupt prefs
  }
  return { enabled: false, slots: ["08:00", "19:00"] };
}

function minutesFromMidnight(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function nextOccurrence(time: string, now: Date): Date {
  const [h, m] = time.split(":").map(Number);
  const next = new Date(now);
  next.setHours(h || 0, m || 0, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

export function useReminders(getIntention: () => string | null) {
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "unsupported",
  );
  const [nextAt, setNextAt] = useState<Date | null>(null);
  const [lastNudged, setLastNudged] = useState<Date | null>(null);
  const [generation, setGeneration] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;
  const intentionRef = useRef(getIntention);
  intentionRef.current = getIntention;

  const persistPrefs = useCallback((next: Prefs) => {
    setPrefs(next);
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    } catch {
      // storage unavailable — keep in-memory state
    }
  }, []);

  const fire = useCallback((slot?: ReminderSlot) => {
    const intention = intentionRef.current();
    const slotText = slot ? `${slot.emoji} ${slot.label}` : "✨ Your intention check-in";
    const body = intention
      ? `Today you meant to: “${intention}”`
      : "You haven't set today's intention yet — it takes ten seconds.";
    toast(slotText, {
      description: body,
      duration: 8_000,
    });
    try {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(slotText, { body });
      }
    } catch {
      // notifications unavailable in this context — toast still fired
    }
    setLastNudged(new Date());
  }, []);

  // Request permission
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return "unsupported" as const;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const toggleEnabled = useCallback(
    async (enabled: boolean) => {
      if (enabled) {
        if (!("Notification" in window)) {
          setPermission("unsupported");
        } else if (Notification.permission !== "granted") {
          const result = await Notification.requestPermission();
          setPermission(result);
        }
      }
      persistPrefs({ ...prefsRef.current, enabled });
    },
    [persistPrefs],
  );

  const setSlots = useCallback(
    (slots: string[]) => {
      persistPrefs({ ...prefsRef.current, slots });
    },
    [persistPrefs],
  );

  const nudgeNow = useCallback(() => {
    fire();
  }, [fire]);

  // Keep the countdown fresh and re-arm the scheduler
  useEffect(() => {
    const id = setInterval(() => setGeneration((g) => g + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  // Schedule the next reminder whenever prefs or generation change
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setNextAt(null);

    if (!prefs.enabled || prefs.slots.length === 0) return;

    const now = new Date();
    const upcoming = prefs.slots
      .map((time) => ({ time, date: nextOccurrence(time, now) }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const next = upcoming[0];
    if (!next) return;

    const slot = REMINDER_SLOTS.find((s) => s.time === next.time);
    const delay = next.date.getTime() - now.getTime();
    setNextAt(next.date);

    timeoutRef.current = setTimeout(() => {
      fire(slot);
      // recompute for the following day
      setGeneration((g) => g + 1);
    }, Math.min(delay, 2_147_483_647));
  }, [prefs.enabled, prefs.slots, generation, fire]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const nextIn = useMemo(() => {
    if (!nextAt) return null;
    const ms = nextAt.getTime() - Date.now();
    if (ms <= 0) return "any moment now";
    const mins = Math.floor(ms / 60_000);
    if (mins < 1) return "less than a minute";
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    const rest = mins % 60;
    return rest > 0 ? `${hrs}h ${rest}m` : `${hrs}h`;
  }, [nextAt]);

  return {
    enabled: prefs.enabled,
    slots: prefs.slots,
    permission,
    nextAt,
    nextIn,
    lastNudged,
    requestPermission,
    toggleEnabled,
    setSlots,
    nudgeNow,
  };
}