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

    // one intention per user per day
    intentions: defineTable({
      userId: v.id("users"),
      dayKey: v.string(), // local date "YYYY-MM-DD"
      text: v.string(),
      emoji: v.string(),
      vibe: v.string(), // color key from INTENTION_VIBES
      isCustom: v.boolean(),
      createdAt: v.number(),
    })
      .index("by_user_day", ["userId", "dayKey"])
      .index("by_user", ["userId"]),

    // latest quiz result per user (archetype)
    quizResults: defineTable({
      userId: v.id("users"),
      archetype: v.string(),
      scores: v.record(v.string(), v.number()),
      createdAt: v.number(),
    }).index("by_user", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
