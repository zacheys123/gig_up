// convex/controllers/theme.ts
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const getUserTheme = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    return user?.theme || "system";
  },
});

export const updateUserTheme = mutation({
  args: {
    clerkId: v.string(),
    theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      theme: args.theme,
      lastActive: Date.now(),
    });

    return { success: true };
  },
});
