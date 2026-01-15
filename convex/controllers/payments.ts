// convex/payments.ts - COMPLETE PAYMENT CONFIRMATION MUTATION
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { getUserByClerkId } from "./bookings";
import { createNotificationInternal } from "../createNotificationInternal";
import { Id } from "../_generated/dataModel";

export const confirmPayment = mutation({
  args: {
    gigId: v.id("gigs"),
    clerkId: v.string(),
    confirmPayment: v.boolean(), // true = payment received, false = dispute
    paymentCode: v.string(), // M-Pesa transaction code (first 4-6 chars) or cash code
    amountConfirmed: v.number(), // Amount they confirm receiving/sending
    paymentMethod: v.union(
      v.literal("mpesa"),
      v.literal("cash"),
      v.literal("bank"),
      v.literal("other")
    ),
    fullTransactionId: v.optional(v.string()), // Full transaction ID for M-Pesa
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUserByClerkId(ctx, args.clerkId);
    const gig = await ctx.db.get(args.gigId);

    if (!gig) throw new Error("Gig not found");

    // Determine if user is client or musician
    const isClient = gig.postedBy === user._id;
    let isMusician = false;
    let musicianId: Id<"users"> | null = null;

    // Check for regular gig musician
    if (gig.bookedBy === user._id) {
      isMusician = true;
      musicianId = user._id;
    }

    // Check for band gig musician (client-created band)
    if (gig.isClientBand && gig.bandCategory) {
      for (const role of gig.bandCategory) {
        if (role.bookedUsers?.includes(user._id)) {
          isMusician = true;
          musicianId = user._id;
          break;
        }
      }
    }

    // Check for full band leader
    if (gig.bookedBandId) {
      const band = await ctx.db.get(gig.bookedBandId);
      if (band) {
        const isBandLeader = band.members?.some(
          (member: any) => member.userId === user._id && member.isLeader
        );
        if (isBandLeader) {
          isMusician = true;
          musicianId = user._id;
        }
      }
    }

    if (!isClient && !isMusician) {
      throw new Error("Not authorized to confirm payment");
    }

    // Prepare confirmation data
    const confirmationData = {
      gigId: args.gigId,
      confirmPayment: args.confirmPayment,
      confirmedAt: Date.now(),
      paymentCode: args.paymentCode.toUpperCase().trim(), // Normalize to uppercase
      amountConfirmed: args.amountConfirmed,
      paymentMethod: args.paymentMethod,
      fullTransactionId: args.fullTransactionId,
      temporaryConfirm: false,
      finalizedAt: Date.now(),
      verified: false, // Will be set to true when codes match
      notes: args.notes || "",
    };

    // Update gig with confirmation
    let updateData: any = {
      updatedAt: Date.now(),
    };

    if (isClient) {
      updateData.clientConfirmPayment = confirmationData;
      if (args.notes) {
        updateData.finalizationNote = args.notes;
      }
    } else {
      updateData.musicianConfirmPayment = confirmationData;
    }

    await ctx.db.patch(args.gigId, updateData);

    // Get updated gig to check verification
    const updatedGig = await ctx.db.get(args.gigId);
    if (!updatedGig) throw new Error("Failed to update gig");

    // Check if both have confirmed
    const verificationResult = await verifyPaymentConfirmation(
      ctx,
      args.gigId,
      updatedGig
    );

    // Send notifications
    await sendPaymentConfirmationNotifications(
      ctx,
      args.gigId,
      updatedGig,
      user,
      isClient,
      verificationResult
    );

    return {
      success: true,
      confirmedBy: isClient ? "client" : "musician",
      verificationStatus: verificationResult.status,
      codesMatch: verificationResult.codesMatch,
      amountsMatch: verificationResult.amountsMatch,
      bothConfirmed: verificationResult.bothConfirmed,
    };
  },
});

// Helper: Verify payment confirmation
const verifyPaymentConfirmation = async (
  ctx: any,
  gigId: Id<"gigs">,
  gig: any
) => {
  const clientConf = gig.clientConfirmPayment;
  const musicianConf = gig.musicianConfirmPayment;

  if (!clientConf || !musicianConf) {
    return {
      status: "waiting",
      bothConfirmed: false,
      codesMatch: false,
      amountsMatch: false,
    };
  }

  // Both have confirmed
  const bothConfirmed =
    clientConf.confirmPayment && musicianConf.confirmPayment;

  if (!bothConfirmed) {
    // Check if either party disputed
    if (!clientConf.confirmPayment || !musicianConf.confirmPayment) {
      await ctx.db.patch(gigId, {
        paymentStatus: "disputed",
        updatedAt: Date.now(),
      });
      return {
        status: "disputed",
        bothConfirmed: false,
        codesMatch: false,
        amountsMatch: false,
      };
    }
    return {
      status: "waiting",
      bothConfirmed: false,
      codesMatch: false,
      amountsMatch: false,
    };
  }

  // Both confirmed positively - check verification
  const codesMatch = clientConf.paymentCode === musicianConf.paymentCode;

  // Check if amounts are within 10% of each other (for minor differences)
  const amountDifference = Math.abs(
    clientConf.amountConfirmed - musicianConf.amountConfirmed
  );
  const averageAmount =
    (clientConf.amountConfirmed + musicianConf.amountConfirmed) / 2;
  const amountsMatch = amountDifference / averageAmount < 0.1; // Within 10%

  const paymentMethodsMatch =
    clientConf.paymentMethod === musicianConf.paymentMethod;

  let verificationStatus = "pending";
  let shouldFinalize = false;

  if (codesMatch && amountsMatch && paymentMethodsMatch) {
    // Perfect match - auto verify
    verificationStatus = "verified";
    shouldFinalize = true;

    // Mark both confirmations as verified
    await ctx.db.patch(gigId, {
      "clientConfirmPayment.verified": true,
      "musicianConfirmPayment.verified": true,
      paymentStatus: "verified_paid",
      finalizedBy: "system",
      finalizedAt: Date.now(),
      isActive: false, // Gig is now complete
      updatedAt: Date.now(),
    });
  } else if (codesMatch && paymentMethodsMatch) {
    // Codes match but amounts differ - might need admin review
    verificationStatus = "needs_review";
  } else {
    // Codes don't match - disputed
    verificationStatus = "mismatch";
    await ctx.db.patch(gigId, {
      paymentStatus: "disputed",
      updatedAt: Date.now(),
    });
  }

  return {
    status: verificationStatus,
    bothConfirmed: true,
    codesMatch,
    amountsMatch,
    paymentMethodsMatch,
    shouldFinalize,
  };
};

// Helper: Send notifications
const sendPaymentConfirmationNotifications = async (
  ctx: any,
  gigId: Id<"gigs">,
  gig: any,
  confirmingUser: any,
  isClient: boolean,
  verificationResult: any
) => {
  const client = await ctx.db.get(gig.postedBy);
  let musician = null;

  // Get musician to notify (for regular gigs)
  if (gig.bookedBy) {
    musician = await ctx.db.get(gig.bookedBy);
  }

  // For band gigs, notify all booked musicians
  const bandMusicians: Id<"users">[] = [];
  if (gig.isClientBand && gig.bandCategory) {
    gig.bandCategory.forEach((role: any) => {
      role.bookedUsers?.forEach((userId: Id<"users">) => {
        bandMusicians.push(userId);
      });
    });
  }

  // Notification for the confirming user
  await createNotificationInternal(ctx, {
    userDocumentId: confirmingUser._id,
    type: "payment_confirmation_sent",
    title: isClient
      ? "💳 Payment Confirmation Sent"
      : "💰 Payment Receipt Sent",
    message: isClient
      ? `You confirmed sending payment of ${gig.currency || "KES"} ${verificationResult.amountConfirmed}`
      : `You confirmed receiving payment of ${gig.currency || "KES"} ${verificationResult.amountConfirmed}`,
    actionUrl: `/gigs/${gigId}`,
  });

  // Notification for the other party
  const otherPartyId = isClient
    ? gig.bookedBy || (bandMusicians.length > 0 ? bandMusicians[0] : null)
    : gig.postedBy;

  if (otherPartyId) {
    const notificationType = verificationResult.codesMatch
      ? "payment_verified"
      : "payment_awaiting";

    await createNotificationInternal(ctx, {
      userDocumentId: otherPartyId,
      type: notificationType,
      title: isClient ? "💰 Payment Sent" : "💳 Payment Received",
      message: isClient
        ? `${confirmingUser.firstname || confirmingUser.username} confirmed sending payment`
        : `${confirmingUser.firstname || confirmingUser.username} confirmed receiving payment`,
      actionUrl: `/gigs/${gigId}`,
    });
  }

  // For band gigs, notify all musicians
  if (bandMusicians.length > 0) {
    for (const musicianId of bandMusicians) {
      if (musicianId === confirmingUser._id) continue;

      await createNotificationInternal(ctx, {
        userDocumentId: musicianId,
        type: "band_payment_update",
        title: "🎵 Payment Update",
        message: `${confirmingUser.firstname || confirmingUser.username} ${isClient ? "sent" : "received"} payment for "${gig.title}"`,
        actionUrl: `/gigs/${gigId}`,
      });
    }
  }

  // If verified, send success notifications
  if (verificationResult.status === "verified") {
    // Notify client
    if (client) {
      await createNotificationInternal(ctx, {
        userDocumentId: gig.postedBy,
        type: "payment_verified",
        title: "✅ Payment Verified!",
        message: `Payment codes match! ${gig.currency || "KES"} ${verificationResult.amountConfirmed} verified for "${gig.title}".`,
        actionUrl: `/gigs/${gigId}`,
      });
    }

    // Notify musician(s)
    if (musician) {
      await createNotificationInternal(ctx, {
        userDocumentId: gig.bookedBy!,
        type: "payment_verified",
        title: "✅ Payment Verified!",
        message: `Payment codes match! ${gig.currency || "KES"} ${verificationResult.amountConfirmed} verified for "${gig.title}".`,
        actionUrl: `/gigs/${gigId}`,
      });
    }

    // For band gigs
    for (const musicianId of bandMusicians) {
      await createNotificationInternal(ctx, {
        userDocumentId: musicianId,
        type: "payment_verified",
        title: "✅ Payment Verified!",
        message: `Payment codes match! Payment verified for "${gig.title}".`,
        actionUrl: `/gigs/${gigId}`,
      });
    }
  }
};

// Query to get payment status
export const getPaymentStatus = query({
  args: { gigId: v.id("gigs") },
  handler: async (ctx, args) => {
    const gig = await ctx.db.get(args.gigId);
    if (!gig) return null;

    const clientConf = gig.clientConfirmPayment;
    const musicianConf = gig.musicianConfirmPayment;

    return {
      // Confirmation status
      clientConfirmed: clientConf?.confirmPayment || false,
      clientConfirmedAt: clientConf?.confirmedAt,
      clientPaymentCode: clientConf?.paymentCode,
      clientAmount: clientConf?.amountConfirmed,
      clientMethod: clientConf?.paymentMethod,

      musicianConfirmed: musicianConf?.confirmPayment || false,
      musicianConfirmedAt: musicianConf?.confirmedAt,
      musicianPaymentCode: musicianConf?.paymentCode,
      musicianAmount: musicianConf?.amountConfirmed,
      musicianMethod: musicianConf?.paymentMethod,

      // Verification status
      bothConfirmed: clientConf?.confirmPayment && musicianConf?.confirmPayment,
      codesMatch: clientConf?.paymentCode === musicianConf?.paymentCode,
      amountsMatch:
        clientConf?.amountConfirmed === musicianConf?.amountConfirmed,

      // Gig status
      paymentStatus: gig.paymentStatus,
      isActive: gig.isActive,
      finalizedBy: gig.finalizedBy,
      finalizedAt: gig.finalizedAt,
      finalizationNote: gig.finalizationNote,

      // For display
      canConfirm: !clientConf || !musicianConf,
      needsAttention:
        clientConf?.confirmPayment !== musicianConf?.confirmPayment,
      isDisputed: gig.paymentStatus === "disputed",
    };
  },
});
