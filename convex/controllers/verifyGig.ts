// convex/controllers/verifyGig.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { generateRandomSecret, verifySecurityAnswer } from "../verifyUtil";

export const requestSecretReset = mutation({
  args: {
    gigId: v.id("gigs"),
    email: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User account not found");
    }

    if (user.email !== args.email.trim()) {
      throw new Error("Email does not match your account");
    }

    if (!user.securityQuestion || !user.securityAnswer) {
      throw new Error(
        "You haven't set up a security question. " +
          "Please set one up in your account settings first."
      );
    }

    const gig = await ctx.db.get(args.gigId);
    if (!gig) {
      throw new Error("Gig not found");
    }

    if (gig.postedBy !== user._id) {
      throw new Error("You don't have permission to edit this gig");
    }

    return {
      securityQuestion: user.securityQuestion,
      hasSecret: !!gig.secret,
      hasSecurityQuestion: true,
    };
  },
});

export const verifySecurityAnswerAndReset = mutation({
  args: {
    gigId: v.id("gigs"),
    securityAnswer: v.string(),
    newSecretKey: v.optional(v.string()),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.securityQuestion || !user.securityAnswer) {
      throw new Error("No security question set for this account");
    }

    // Verify the answer
    const isCorrect = verifySecurityAnswer(
      args.securityAnswer,
      user.securityAnswer
    );

    if (!isCorrect) {
      throw new Error("Incorrect security answer. Please try again.");
    }

    const gig = await ctx.db.get(args.gigId);
    if (!gig) {
      throw new Error("Gig not found");
    }

    if (gig.postedBy !== user._id) {
      throw new Error("You don't have permission to edit this gig");
    }

    let newSecret: string;
    if (args.newSecretKey) {
      if (args.newSecretKey.length < 4) {
        throw new Error("Secret key must be at least 4 characters");
      }
      if (args.newSecretKey.length > 32) {
        throw new Error("Secret key must be less than 32 characters");
      }
      newSecret = args.newSecretKey;
    } else {
      newSecret = generateRandomSecret();
    }

    await ctx.db.patch(gig._id, {
      secret: newSecret,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      newSecret,
    };
  },
});

export const verifyGigSecret = mutation({
  args: {
    gigId: v.id("gigs"),
    secretKey: v.string(),
  },
  handler: async (ctx, args) => {
    const gig = await ctx.db.get(args.gigId);
    if (!gig) {
      throw new Error("Gig not found");
    }
    return gig.secret === args.secretKey;
  },
});
