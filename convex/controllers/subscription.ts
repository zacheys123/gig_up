// convex/controllers/subscription.ts
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// convex/controllers/subscription.ts - Update the query
export const getSubscription = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return null;

    // Return formatted subscription object
    return {
      tier: user.tier ?? "free",
      status: user.tierStatus ?? "active",
      currentPeriodStart: user._creationTime,
      currentPeriodEnd: user.nextBillingDate,
      cancelAtPeriodEnd: user.tierStatus === "canceled",
    };
  },
});

export const updateSubscription = mutation({
  args: {
    clerkId: v.string(),
    tier: v.union(v.literal("free"), v.literal("pro")),
    tierStatus: v.union(
      v.literal("active"),
      v.literal("pending"),
      v.literal("canceled"),
      v.literal("expired")
    ),
    nextBillingDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      tier: args.tier,
      tierStatus: args.tierStatus,
      nextBillingDate: args.nextBillingDate,
      lastActive: Date.now(),
    });

    return { success: true };
  },
});
