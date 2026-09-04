import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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

export const listForUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    return await ctx.db
      .query("stars")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(60);
  },
});

export const create = mutation({
  args: {
    text: v.string(),
    moment: v.string(),
    emoji: v.string(),
    colorKey: v.string(),
    x: v.number(),
    y: v.number(),
  },
  handler: async (ctx, { text, moment, emoji, colorKey, x, y }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");

    const clean = text.trim().slice(0, 120);
    if (clean.length === 0) throw new Error("A star needs a few words.");

    const existing = await ctx.db
      .query("stars")
      .withIndex("by_user_active", (q) => q.eq("userId", userId).eq("active", true))
      .first();
    const hasActive = existing !== null;

    const id = await ctx.db.insert("stars", {
      userId,
      text: clean,
      moment,
      emoji,
      colorKey,
      x: Math.min(94, Math.max(6, x)),
      y: Math.min(88, Math.max(10, y)),
      active: !hasActive,
      dayKey: dayKeyFor(new Date()),
      createdAt: Date.now(),
    });
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("stars"),
    text: v.optional(v.string()),
    moment: v.optional(v.string()),
    emoji: v.optional(v.string()),
    colorKey: v.optional(v.string()),
    x: v.optional(v.number()),
    y: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");

    const star = await ctx.db.get(id);
    if (!star || star.userId !== userId) throw new Error("Star not found");

    const next: Record<string, unknown> = {};
    if (patch.text !== undefined) {
      const clean = patch.text.trim().slice(0, 120);
      if (clean.length === 0) throw new Error("A star needs a few words.");
      next.text = clean;
    }
    if (patch.moment !== undefined) next.moment = patch.moment;
    if (patch.emoji !== undefined) next.emoji = patch.emoji;
    if (patch.colorKey !== undefined) next.colorKey = patch.colorKey;
    if (patch.x !== undefined) next.x = Math.min(94, Math.max(6, patch.x));
    if (patch.y !== undefined) next.y = Math.min(88, Math.max(10, patch.y));

    await ctx.db.patch(id, next);
    return id;
  },
});

export const setActive = mutation({
  args: { id: v.id("stars") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");

    const star = await ctx.db.get(id);
    if (!star || star.userId !== userId) throw new Error("Star not found");

    const mine = await ctx.db
      .query("stars")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const s of mine) {
      if (s.active) await ctx.db.patch(s._id, { active: false });
    }
    await ctx.db.patch(id, { active: true });
  },
});

export const remove = mutation({
  args: { id: v.id("stars") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");

    const star = await ctx.db.get(id);
    if (!star || star.userId !== userId) throw new Error("Star not found");

    const wasActive = star.active;
    await ctx.db.delete(id);

    if (wasActive) {
      const rest = await ctx.db
        .query("stars")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .order("desc")
        .take(1);
      if (rest.length > 0) {
        await ctx.db.patch(rest[0]._id, { active: true });
      }
    }
  },
});

/** Consecutive-day shift streak, counting back from today (or yesterday if today has no stars yet). */
export const getStreak = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return { streak: 0, total: 0 };

    const all = await ctx.db
      .query("stars")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    if (all.length === 0) return { streak: 0, total: 0 };

    const keys = new Set(all.map((s) => s.dayKey));
    const today = dayKeyFor(new Date());

    let streak = 0;
    if (!keys.has(today)) {
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