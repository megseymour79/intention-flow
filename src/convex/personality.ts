import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Latest saved result per quiz kind for the signed-in user. */
export const myResults = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const rows = await ctx.db
      .query("personalityResults")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    // keep only the newest row per kind
    const seen = new Set<string>();
    const latest: {
      kind: string;
      resultId: string;
      scores: Record<string, number>;
      createdAt: number;
    }[] = [];
    for (const row of rows) {
      if (seen.has(row.kind)) continue;
      seen.add(row.kind);
      latest.push({
        kind: row.kind,
        resultId: row.resultId,
        scores: row.scores,
        createdAt: row.createdAt,
      });
    }
    return latest;
  },
});

/** Insert or update the result for one quiz kind. */
export const saveResult = mutation({
  args: {
    kind: v.string(),
    resultId: v.string(),
    scores: v.record(v.string(), v.number()),
  },
  handler: async (ctx, { kind, resultId, scores }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("personalityResults")
      .withIndex("by_user_kind", (q) =>
        q.eq("userId", userId).eq("kind", kind),
      )
      .first();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        resultId,
        scores,
        createdAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert("personalityResults", {
      userId,
      kind,
      resultId,
      scores,
      createdAt: now,
    });
  },
});
