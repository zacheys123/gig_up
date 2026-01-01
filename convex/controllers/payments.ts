import { v } from "convex/values";
import { mutation } from "../_generated/server";

// convex/payments.ts
export const confirmPayment = mutation({
  args: {
    gigId: v.id("gigs"),
    partyType: v.union(v.literal("client"), v.literal("musician")),
    confirmationCode: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.db.get(args.userId);
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const gig = await ctx.db.get(args.gigId);
    if (!gig) {
      throw new Error("Gig not found");
    }

    // Verify permissions
    if (args.partyType === "client") {
      throw new Error("Only the client can confirm payment");
    }

    if (args.partyType === "musician") {
      throw new Error("Only the musician can confirm payment");
    }

    // Update payment confirmation
    const updateData: any = {};
    if (args.partyType === "client") {
      updateData.clientConfirmPayment = {
        code: args.confirmationCode,
        confirmedAt: Date.now(),
        temporaryConfirm: true,
      };
    } else {
      updateData.musicianConfirmPayment = {
        code: args.confirmationCode,
        confirmedAt: Date.now(),
        temporaryConfirm: true,
      };
    }

    await ctx.db.patch(args.gigId, updateData);

    return {
      success: true,
      message: "Payment confirmed successfully",
    };
  },
});

export const finalizePayment = mutation({
  args: {
    gigId: v.id("gigs"),
    finalizedBy: v.union(v.literal("client"), v.literal("musician")),
    finalizationNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const gig = await ctx.db.get(args.gigId);
    if (!gig) {
      throw new Error("Gig not found");
    }

    // Verify both parties have confirmed
    if (
      !gig.clientConfirmPayment?.temporaryConfirm ||
      !gig.musicianConfirmPayment?.temporaryConfirm
    ) {
      throw new Error("Both parties must confirm payment before finalizing");
    }

    // Update payment status
    await ctx.db.patch(args.gigId, {
      paymentStatus: "paid",
      clientConfirmPayment: {
        ...gig.clientConfirmPayment,
        confirmPayment: true,
        finalizedAt: Date.now(),
      },
      musicianConfirmPayment: {
        ...gig.musicianConfirmPayment,
        confirmPayment: true,
        finalizedAt: Date.now(),
      },
      finalizationNote: args.finalizationNote,
      finalizedBy: args.finalizedBy,
    });

    return {
      success: true,
      message: "Payment finalized successfully",
    };
  },
});
