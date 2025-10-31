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
    tier: v.union(
      v.literal("free"),
      v.literal("pro"),
      v.literal("premium"),
      v.literal("elite")
    ),
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

export const getAiSuggestions = query({
  args: {
    userRole: v.union(
      v.literal("musician"),
      v.literal("client"),
      v.literal("guest")
    ),
  },
  handler: async (ctx, args) => {
    const suggestions = await ctx.db
      .query("aiSuggestions")
      .order("desc")
      .first();

    const defaultQuestions = {
      musician: [
        "How can I make my profile stand out to clients?",
        "What should I include in my performance portfolio?",
        "How do I price my services for different gig types?",
        "Tips for writing compelling gig applications",
        "How to build a strong reputation on GigUp?",
      ],
      client: [
        "How do I write a clear gig description?",
        "What should I look for in musician profiles?",
        "How to budget for different event types?",
        "Best practices for communicating with musicians",
        "How to manage multiple gig bookings?",
      ],
      guest: [
        "How does GigUp work for musicians?",
        "What are the benefits of the Pro tier?",
        "How do I get started as a client?",
        "What's included in the free trial?",
      ],
    };

    if (suggestions?.updatesReady && suggestions.questions) {
      return {
        questions:
          suggestions.questions[args.userRole] ||
          defaultQuestions[args.userRole],
        version: suggestions.version || "default",
        lastUpdated: suggestions.lastUpdated || Date.now(),
      };
    }

    return {
      questions: defaultQuestions[args.userRole],
      version: "default",
      lastUpdated: Date.now(),
    };
  },
});

export const updateAISuggestions = mutation({
  args: {
    questions: v.object({
      musician: v.array(v.string()),
      client: v.array(v.string()),
      guest: v.array(v.string()),
    }),
    updatesReady: v.boolean(),
    version: v.string(),
  },
  handler: async (ctx, args) => {
    const newSuggestion = await ctx.db.insert("aiSuggestions", {
      questions: args.questions,
      updatesReady: args.updatesReady,
      version: args.version,
      lastUpdated: Date.now(),
    });

    return newSuggestion;
  },
});
