import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // one star = one intention for one life moment, hung in the user's sky
    stars: defineTable({
      userId: v.id("users"),
      text: v.string(),
      moment: v.string(), // moment id from MOMENTS
      emoji: v.string(),
      colorKey: v.string(), // color key from STAR_COLORS
      x: v.number(), // 0-100 horizontal position in the sky
      y: v.number(), // 0-100 vertical position in the sky
      active: v.boolean(), // the star the user is currently focusing on
      dayKey: v.string(), // local day created (for streaks)
      createdAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_user_active", ["userId", "active"]),

    // latest response-style quiz result per user
    quizResults: defineTable({
      userId: v.id("users"),
      styleId: v.string(),
      scores: v.record(v.string(), v.number()),
      createdAt: v.number(),
    }).index("by_user", ["userId"]),

    // community posts (text + optional uploaded image)
    posts: defineTable({
      userId: v.id("users"),
      text: v.string(),
      emoji: v.string(),
      colorKey: v.string(),
      imageId: v.optional(v.id("_storage")),
      glowCount: v.number(),
      commentCount: v.number(),
      createdAt: v.number(),
    }).index("by_created", ["createdAt"]),

    // one row per user glow on a post
    postGlows: defineTable({
      postId: v.id("posts"),
      userId: v.id("users"),
      createdAt: v.number(),
    })
      .index("by_post", ["postId"])
      .index("by_user", ["userId"]),

    comments: defineTable({
      postId: v.id("posts"),
      userId: v.id("users"),
      text: v.string(),
      createdAt: v.number(),
    })
      .index("by_post", ["postId"])
      .index("by_user", ["userId"]),

    // direct message conversations between two users
    conversations: defineTable({
      participantA: v.id("users"), // always the lexicographically smaller id
      participantB: v.id("users"),
      updatedAt: v.number(),
      createdAt: v.number(),
    })
      .index("by_a", ["participantA"])
      .index("by_b", ["participantB"])
      .index("by_pair", ["participantA", "participantB"]),

    messages: defineTable({
      conversationId: v.id("conversations"),
      senderId: v.id("users"),
      text: v.string(),
      createdAt: v.number(),
    }).index("by_conversation", ["conversationId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
