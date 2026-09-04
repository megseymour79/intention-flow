import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "./_generated/server";

/** Returns an upload URL for storing a post image in Convex file storage. */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");
    return await ctx.storage.generateUploadUrl();
  },
});