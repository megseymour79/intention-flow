import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// local date key, e.g. "2026-09-04"
export function dayKeyFor(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysAgoKey(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return dayKeyFor(d);
}

export const getToday = query({
  args: { dayKey: v.string() },
  handler: async (ctx, { dayKey }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const row = await ctx.db
      .query("intentions")
      .withIndex("by_user_day", (q) => q.eq("userId", userId).eq("dayKey", dayKey))
      .first();
    return row ?? null;
  },
});

export const listForUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    return await ctx.db
      .query("intentions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(30);
  },
});

export const setToday = mutation({
  args: {
    dayKey: v.string(),
    text: v.string(),
    emoji: v.string(),
    vibe: v.string(),
    isCustom: v.boolean(),
  },
  handler: async (ctx, { dayKey, text, emoji, vibe, isCustom }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const clean = text.trim().slice(0, 120);
    if (clean.length === 0) throw new Error("An intention needs a few words.");

    const existing = await ctx.db
      .query("intentions")
      .withIndex("by_user_day", (q) => q.eq("userId", userId).eq("dayKey", dayKey))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { text: clean, emoji, vibe, isCustom });
      return existing._id;
    }

    return await ctx.db.insert("intentions", {
      userId,
      dayKey,
      text: clean,
      emoji,
      vibe,
      isCustom,
      createdAt: Date.now(),
    });
  },
});

/** Consecutive-day glow streak. Counts back from today; if today isn't set yet, starts from yesterday. */
export const getStreak = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return { streak: 0, total: 0 };

    const all = await ctx.db
      .query("intentions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    if (all.length === 0) return { streak: 0, total: 0 };

    const keys = new Set(all.map((i) => i.dayKey));
    const today = dayKeyFor(new Date());

    let streak = 0;
    if (!keys.has(today)) {
      // today not set yet — a streak survives until the day ends
      if (!keys.has(daysAgoKey(new Date(), 1))) return { streak: 0, total: all.length };
      streak = 1;
    }
    let offset = streak === 1 ? 2 : 1;
    while (keys.has(daysAgoKey(new Date(), offset))) {
      streak += 1;
      offset += 1;
    }

    return { streak, total: all.length };
  },
});