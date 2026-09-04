import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getMyResult = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const row = await ctx.db
      .query("quizResults")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .first();
    return row ?? null;
  },
});

export const saveResult = mutation({
  args: {
    archetype: v.string(),
    scores: v.record(v.string(), v.number()),
  },
  handler: async (ctx, { archetype, scores }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    return await ctx.db.insert("quizResults", {
      userId,
      archetype,
      scores,
      createdAt: Date.now(),
    });
  },
});