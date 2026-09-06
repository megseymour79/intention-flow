import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function dayKeyFor(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Upsert today's reflection (one per user per local day). */
export const upsertToday = mutation({
  args: {
    honored: v.boolean(),
    mood: v.number(),
    note: v.optional(v.string()),
    intentionText: v.optional(v.string()),
  },
  handler: async (ctx, { honored, mood, note, intentionText }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");

    const dayKey = dayKeyFor(new Date());
    const existing = await ctx.db
      .query("reflections")
      .withIndex("by_user_day", (q) => q.eq("userId", userId).eq("dayKey", dayKey))
      .first();

    const cleanNote = note?.trim().slice(0, 400) ?? undefined;

    if (existing) {
      await ctx.db.patch(existing._id, {
        honored,
        mood: Math.min(5, Math.max(1, Math.round(mood))),
        note: cleanNote,
        intentionText:
          intentionText !== undefined
            ? intentionText.trim().slice(0, 120)
            : existing.intentionText,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("reflections", {
      userId,
      dayKey,
      honored,
      mood: Math.min(5, Math.max(1, Math.round(mood))),
      note: cleanNote,
      intentionText: intentionText?.trim().slice(0, 120),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/** Today's reflection, if any. */
export const getToday = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const dayKey = dayKeyFor(new Date());
    return await ctx.db
      .query("reflections")
      .withIndex("by_user_day", (q) => q.eq("userId", userId).eq("dayKey", dayKey))
      .first();
  },
});

/** Last 14 days of reflections, oldest first — for the history strip. */
export const getRecent = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, { days = 14 }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const n = Math.min(60, Math.max(1, Math.round(days)));
    const keys = new Set<string>();
    const now = new Date();
    for (let i = 0; i < n; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      keys.add(dayKeyFor(d));
    }

    const all = await ctx.db
      .query("reflections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(n * 2);
    return all
      .filter((r) => keys.has(r.dayKey))
      .sort((a, b) => a.dayKey.localeCompare(b.dayKey));
  },
});

/** Aggregate stats over all reflections: honored rate, average mood, count. */
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return { count: 0, honoredCount: 0, moodSum: 0 };
    const all = await ctx.db
      .query("reflections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return {
      count: all.length,
      honoredCount: all.filter((r) => r.honored).length,
      moodSum: all.reduce((sum, r) => sum + r.mood, 0),
    };
  },
});
