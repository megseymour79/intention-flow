import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_created")
      .order("desc")
      .take(40);

    const glowed = new Set(
      (
        await ctx.db
          .query("postGlows")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .collect()
      ).map((g) => g.postId),
    );

    return Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.userId);
        const imageUrl = post.imageId ? await ctx.storage.getUrl(post.imageId) : null;
        return {
          _id: post._id,
          text: post.text,
          emoji: post.emoji,
          colorKey: post.colorKey,
          imageUrl,
          glowCount: post.glowCount,
          commentCount: post.commentCount,
          createdAt: post.createdAt,
          author: {
            userId: post.userId,
            name: author?.name ?? "someone",
            image: author?.image ?? null,
          },
          glowed: glowed.has(post._id),
        };
      }),
    );
  },
});

export const create = mutation({
  args: {
    text: v.string(),
    emoji: v.string(),
    colorKey: v.string(),
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, { text, emoji, colorKey, imageId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");

    const clean = text.trim().slice(0, 500);
    if (clean.length === 0 && !imageId) {
      throw new Error("Add some words or an image.");
    }

    return await ctx.db.insert("posts", {
      userId,
      text: clean,
      emoji,
      colorKey,
      imageId,
      glowCount: 0,
      commentCount: 0,
      createdAt: Date.now(),
    });
  },
});

export const toggleGlow = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");

    const post = await ctx.db.get(postId);
    if (!post) throw new Error("Post not found");

    const existing = await ctx.db
      .query("postGlows")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(postId, { glowCount: Math.max(0, post.glowCount - 1) });
    } else {
      await ctx.db.insert("postGlows", { postId, userId, createdAt: Date.now() });
      await ctx.db.patch(postId, { glowCount: post.glowCount + 1 });
    }
  },
});

export const listComments = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .order("asc")
      .take(100);

    return Promise.all(
      comments.map(async (c) => {
        const author = await ctx.db.get(c.userId);
        return {
          _id: c._id,
          text: c.text,
          createdAt: c.createdAt,
          author: {
            userId: c.userId,
            name: author?.name ?? "someone",
            image: author?.image ?? null,
          },
        };
      }),
    );
  },
});

export const addComment = mutation({
  args: { postId: v.id("posts"), text: v.string() },
  handler: async (ctx, { postId, text }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");

    const post = await ctx.db.get(postId);
    if (!post) throw new Error("Post not found");

    const clean = text.trim().slice(0, 300);
    if (clean.length === 0) throw new Error("A comment needs a few words.");

    const id = await ctx.db.insert("comments", {
      postId,
      userId,
      text: clean,
      createdAt: Date.now(),
    });
    await ctx.db.patch(postId, { commentCount: post.commentCount + 1 });
    return id;
  },
});