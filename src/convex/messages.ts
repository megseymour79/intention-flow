import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

function pair(a: Id<"users">, b: Id<"users">): [Id<"users">, Id<"users">] {
  return a < b ? [a, b] : [b, a];
}

export const startConversation = mutation({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, { otherUserId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");
    if (otherUserId === userId) throw new Error("That's you.");

    const [a, b] = pair(userId, otherUserId);
    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_pair", (q) => q.eq("participantA", a).eq("participantB", b))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("conversations", {
      participantA: a,
      participantB: b,
      updatedAt: Date.now(),
      createdAt: Date.now(),
    });
  },
});

export const listConversations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const [mineA, mineB] = await Promise.all([
      ctx.db
        .query("conversations")
        .withIndex("by_a", (q) => q.eq("participantA", userId))
        .collect(),
      ctx.db
        .query("conversations")
        .withIndex("by_b", (q) => q.eq("participantB", userId))
        .collect(),
    ]);

    const unique = new Map<string, (typeof mineA)[number]>();
    for (const c of [...mineA, ...mineB]) unique.set(c._id, c);

    const convos = [...unique.values()].sort((x, y) => y.updatedAt - x.updatedAt);

    return Promise.all(
      convos.map(async (c) => {
        const otherId = c.participantA === userId ? c.participantB : c.participantA;
        const other = await ctx.db.get(otherId);
        const last = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", c._id))
          .order("desc")
          .first();
        return {
          _id: c._id,
          otherUserId: otherId,
          otherName: other?.name ?? "someone",
          otherImage: other?.image ?? null,
          lastMessage: last?.text ?? null,
          lastAt: last?.createdAt ?? c.createdAt,
        };
      }),
    );
  },
});

export const listMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const convo = await ctx.db.get(conversationId);
    if (!convo) return [];
    if (convo.participantA !== userId && convo.participantB !== userId) return [];

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", conversationId))
      .order("asc")
      .take(200);

    return Promise.all(
      messages.map(async (m) => {
        const sender = await ctx.db.get(m.senderId);
        return {
          _id: m._id,
          senderId: m.senderId,
          senderName: sender?.name ?? "someone",
          text: m.text,
          createdAt: m.createdAt,
        };
      }),
    );
  },
});

export const sendMessage = mutation({
  args: { conversationId: v.id("conversations"), text: v.string() },
  handler: async (ctx, { conversationId, text }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");

    const convo = await ctx.db.get(conversationId);
    if (!convo) throw new Error("Conversation not found");
    if (convo.participantA !== userId && convo.participantB !== userId) {
      throw new Error("Conversation not found");
    }

    const clean = text.trim().slice(0, 1000);
    if (clean.length === 0) throw new Error("A message needs a few words.");

    const id = await ctx.db.insert("messages", {
      conversationId,
      senderId: userId,
      text: clean,
      createdAt: Date.now(),
    });
    await ctx.db.patch(conversationId, { updatedAt: Date.now() });
    return id;
  },
});