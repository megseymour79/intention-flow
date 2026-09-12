import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { useReminders } from "@/hooks/use-reminders";

type RemindersApi = ReturnType<typeof useReminders> & {
  /** The active intention text, or null when no star is focused. */
  intention: string | null;
};

const RemindersContext = createContext<RemindersApi | null>(null);

/**
 * Mounted once at the router root. The reminder scheduler only runs while
 * its hook is mounted, so it must live above page navigation — otherwise
 * nudges die the moment the user leaves the page that hosted them.
 */
export function RemindersProvider({ children }: { children: ReactNode }) {
  const starsData = useQuery(api.stars.listForUser);
  const intention = starsData?.find((s) => s.active)?.text ?? null;

  const reminders = useReminders(() => intention);

  return (
    <RemindersContext.Provider value={{ ...reminders, intention }}>
      {children}
    </RemindersContext.Provider>
  );
}

export function useRemindersContext(): RemindersApi {
  const ctx = useContext(RemindersContext);
  if (!ctx) {
    throw new Error(
      "useRemindersContext must be used inside <RemindersProvider>",
    );
  }
  return ctx;
}
