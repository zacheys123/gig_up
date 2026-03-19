// convex/payments.ts
import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";
import { extractedDataValidator } from "../payment";

// Helper to send gig mail
async function sendGigMail(
  ctx: any,
  args: {
    userId: Id<"users">;
    senderId?: Id<"users">;
    gigId?: Id<"gigs">;
    type:
      | "payment_confirmed"
      | "payment_verified"
      | "payment_dispute"
      | "payment_reminder"
      | "gig_completed";
    subject: string;
    message: string;
    amount?: number;
    transactionId?: string | null;
    paymentMethod?: string;
    extractedData?: any;
    requiresAction?: boolean;
    actionUrl?: string;
    actionLabel?: string;
    metadata?: any;
  },
) {
  await ctx.db.insert("gigMail", {
    userId: args.userId,
    senderId: args.senderId,
    gigId: args.gigId,
    type: args.type,
    subject: args.subject,
    message: args.message,
    amount: args.amount,
    transactionId: args.transactionId ?? undefined,
    paymentMethod: args.paymentMethod,
    extractedData: args.extractedData,
    isRead: false,
    isArchived: false,
    requiresAction: args.requiresAction,
    actionUrl: args.actionUrl,
    actionLabel: args.actionLabel,
    metadata: args.metadata,
    createdAt: Date.now(),
  });
}

// Main payment confirmation mutation
// convex/controllers/payments.ts

// Main payment confirmation mutation
export const confirmPayment = mutation({
  args: {
    gigId: v.id("gigs"),
    role: v.union(v.literal("musician"), v.literal("client")),
    confirmed: v.boolean(),
    amount: v.number(),
    paymentMethod: v.union(
      v.literal("mpesa"),
      v.literal("cash"),
      v.literal("bank"),
      v.literal("other"),
    ),
    clerkId: v.string(),
    screenshot: v.string(),
    notes: v.optional(v.string()),
    extractedData: v.optional(extractedDataValidator),
  },
  handler: async (ctx, args) => {
    // Get current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
    if (!currentUser) throw new Error("User not found");

    // Get the gig
    const gig = await ctx.db.get(args.gigId);
    if (!gig) throw new Error("Gig not found");

    // Verify user is part of this gig
    const isMusician =
      gig.bookedBy === currentUser._id ||
      gig.bandCategory?.some((role: any) =>
        role.bookedUsers?.includes(currentUser._id),
      );
    const isClient = gig.postedBy === currentUser._id;

    if (args.role === "musician" && !isMusician) {
      throw new Error("You are not a musician for this gig");
    }
    if (args.role === "client" && !isClient) {
      throw new Error("You are not the client for this gig");
    }

    // Create confirmation object
    const confirmation = {
      gigId: args.gigId,
      confirmed: args.confirmed,
      confirmedAt: Date.now(),
      amount: args.amount,
      paymentMethod: args.paymentMethod,
      screenshot: args.screenshot,
      notes: args.notes,
      extractedData: args.extractedData,
    };

    // Update the gig with confirmation
    if (args.role === "musician") {
      await ctx.db.patch(args.gigId, {
        musicianConfirmPayment: confirmation,
      });

      // Send mail to client
      await sendGigMail(ctx, {
        userId: gig.postedBy,
        senderId: currentUser._id,
        gigId: args.gigId,
        type: "payment_confirmed",
        subject: "💰 Payment Confirmed by Musician",
        message: `${currentUser.firstname || currentUser.username} confirmed receiving payment of KES ${args.amount} for ${gig.title}`,
        amount: args.amount,
        paymentMethod: args.paymentMethod,
        transactionId: args.extractedData?.transactionId,
        extractedData: args.extractedData,
        requiresAction: true,
        actionUrl: `/hub/gigs/${args.gigId}/payment`,
        actionLabel: "View Details",
      });

      // Send mail to musician
      await sendGigMail(ctx, {
        userId: currentUser._id,
        gigId: args.gigId,
        type: "payment_confirmed",
        subject: "✅ Your Payment Confirmation",
        message: `You've confirmed receiving KES ${args.amount} for ${gig.title}. Waiting for client confirmation.`,
        amount: args.amount,
        paymentMethod: args.paymentMethod,
        transactionId: args.extractedData?.transactionId,
        extractedData: args.extractedData,
        actionUrl: `/hub/gigs/${args.gigId}/payment`,
        actionLabel: "Track Status",
      });
    } else {
      // Client confirmation
      await ctx.db.patch(args.gigId, {
        clientConfirmPayment: confirmation,
      });

      // Send mail to musician
      if (gig.bookedBy) {
        await sendGigMail(ctx, {
          userId: gig.bookedBy,
          senderId: currentUser._id,
          gigId: args.gigId,
          type: "payment_confirmed",
          subject: "💰 Payment Confirmed by Client",
          message: `${currentUser.firstname || currentUser.username} confirmed sending payment of KES ${args.amount} for ${gig.title}. Please verify.`,
          amount: args.amount,
          paymentMethod: args.paymentMethod,
          transactionId: args.extractedData?.transactionId,
          extractedData: args.extractedData,
          requiresAction: true,
          actionUrl: `/hub/gigs/${args.gigId}/payment`,
          actionLabel: "Verify Payment",
        });
      }

      // Send mail to client
      await sendGigMail(ctx, {
        userId: currentUser._id,
        gigId: args.gigId,
        type: "payment_confirmed",
        subject: "✅ Your Payment Confirmation",
        message: `You've confirmed sending KES ${args.amount} for ${gig.title}. Waiting for musician confirmation.`,
        amount: args.amount,
        paymentMethod: args.paymentMethod,
        transactionId: args.extractedData?.transactionId,
        extractedData: args.extractedData,
        actionUrl: `/hub/gigs/${args.gigId}/payment`,
        actionLabel: "Track Status",
      });
    }
    // Check if both confirmations now exist
    const updatedGig = await ctx.db.get(args.gigId);
    if (
      updatedGig?.musicianConfirmPayment &&
      updatedGig?.clientConfirmPayment
    ) {
      // Get both confirmations
      const musicianConfirm = updatedGig.musicianConfirmPayment;
      const clientConfirm = updatedGig.clientConfirmPayment;

      // 1. Compare amounts (always required)
      const amountMatch = musicianConfirm.amount === clientConfirm.amount;

      // 2. Compare transaction IDs - more flexible for manual entry
      const musicianTx = musicianConfirm.extractedData?.transactionId;
      const clientTx = clientConfirm.extractedData?.transactionId;

      // Transaction IDs match if:
      // - Both exist and are equal, OR
      // - At least one is missing (manual entry) - we'll rely on amount match
      // - Both are missing (no OCR used)
      const txMatch =
        // If both have transaction IDs, they must match
        musicianTx && clientTx
          ? musicianTx === clientTx
          : // If one or both are missing, don't fail the match based on transaction ID
            true;

      // 3. Check confidence thresholds - only if OCR data exists
      const musicianConfidence = musicianConfirm.extractedData?.confidence;
      const clientConfidence = clientConfirm.extractedData?.confidence;

      // Only enforce confidence check if BOTH users used OCR
      // If either user entered manually (no extractedData), skip confidence check
      const confidenceOk =
        musicianConfidence && clientConfidence
          ? musicianConfidence >= 70 && clientConfidence >= 70
          : true; // Skip confidence check if manual entry

      // 4. Final match determination
      // Amount must always match
      // Transaction ID and confidence are flexible for manual entry
      const match = amountMatch && txMatch && confidenceOk;

      // Build reason for mismatch - more descriptive
      let reason = "";
      if (!amountMatch) reason += "Amount mismatch. ";
      if (musicianTx && clientTx && musicianTx !== clientTx)
        reason += "Transaction ID mismatch. ";
      if (
        musicianConfidence &&
        clientConfidence &&
        (musicianConfidence < 70 || clientConfidence < 70)
      )
        reason += "Low OCR confidence. ";

      // If only one has transaction ID, add a note
      if ((musicianTx && !clientTx) || (!musicianTx && clientTx)) {
        reason += "One party entered transaction ID manually. ";
      }

      // Update payment verification
      // Note: You'll need to fix the "SYSTEM" issue separately
      await ctx.db.patch(args.gigId, {
        paymentVerification: {
          gigId: args.gigId,
          verifiedAt: Date.now(),
          verifiedBy: "SYSTEM" as any, // Fix this separately
          match: match,
          notes: match
            ? "Payment verified automatically"
            : reason || "Payment details mismatch",
          ocrConfidence: {
            musician: musicianConfidence || 0,
            client: clientConfidence || 0,
          },
        },
        paymentStatus: match ? "verified_paid" : "disputed",
      });

      // ========== HANDLE MATCH ==========
      if (match) {
        // Update musician stats
        if (gig.bookedBy) {
          const musician = await ctx.db.get(gig.bookedBy);
          await ctx.db.patch(gig.bookedBy, {
            earnings: (musician?.earnings || 0) + musicianConfirm.amount,
            completedGigsCount: (musician?.completedGigsCount || 0) + 1,
            userearnings:
              (musician?.userearnings || 0) + musicianConfirm.amount,
            // Update performance stats
            performanceStats: {
              totalGigsCompleted:
                (musician?.performanceStats?.totalGigsCompleted || 0) + 1,
              onTimeRate: musician?.performanceStats?.onTimeRate || 100,
              clientSatisfaction:
                musician?.performanceStats?.clientSatisfaction || 100,
              responseTime: musician?.performanceStats?.responseTime,
              lastUpdated: Date.now(),
            },
          });
        }

        // Update client stats
        const client = await ctx.db.get(gig.postedBy);
        await ctx.db.patch(gig.postedBy, {
          totalSpent: (client?.totalSpent || 0) + clientConfirm.amount,
          // Track this booking in their history
          bookedByClients: [
            ...(client?.bookedByClients || []),
            {
              clientId: gig.postedBy,
              gigId: args.gigId,
              date: Date.now(),
            },
          ],
        });

        // Send verification mails
        if (gig.bookedBy) {
          await sendGigMail(ctx, {
            userId: gig.bookedBy,
            gigId: args.gigId,
            type: "payment_verified",
            subject: "🎉 Payment Verified!",
            message: `Payment of KES ${musicianConfirm.amount} for ${gig.title} has been verified. Transaction complete.`,
            amount: musicianConfirm.amount,
            transactionId: musicianConfirm.extractedData?.transactionId,
            extractedData: musicianConfirm.extractedData,
            actionUrl: `/hub/gigs/${args.gigId}`,
            actionLabel: "View Gig",
          });
        }

        await sendGigMail(ctx, {
          userId: gig.postedBy,
          gigId: args.gigId,
          type: "payment_verified",
          subject: "🎉 Payment Verified!",
          message: `Payment of KES ${clientConfirm.amount} for ${gig.title} has been verified. Transaction complete.`,
          amount: clientConfirm.amount,
          transactionId: clientConfirm.extractedData?.transactionId,
          extractedData: clientConfirm.extractedData,
          actionUrl: `/hub/gigs/${args.gigId}`,
          actionLabel: "View Gig",
        });
      }
      // ========== HANDLE MISMATCH/DISPUTE ==========
      else {
        // Update musician dispute count
        if (gig.bookedBy) {
          const musician = await ctx.db.get(gig.bookedBy);
          await ctx.db.patch(gig.bookedBy, {
            disputesCount: (musician?.disputesCount || 0) + 1,
          });
        }

        // Update client dispute count
        const client = await ctx.db.get(gig.postedBy);
        await ctx.db.patch(gig.postedBy, {
          disputesCount: (client?.disputesCount || 0) + 1,
        });

        // Send dispute mails to musician
        if (gig.bookedBy) {
          await sendGigMail(ctx, {
            userId: gig.bookedBy,
            gigId: args.gigId,
            type: "payment_dispute",
            subject: "⚠️ Payment Dispute",
            message: `There's a payment discrepancy for ${gig.title}. ${reason}Our team will review.`,
            amount: musicianConfirm.amount,
            transactionId: musicianConfirm.extractedData?.transactionId,
            extractedData: musicianConfirm.extractedData,
            requiresAction: true,
            actionUrl: `/hub/gigs/${args.gigId}/dispute`,
            actionLabel: "View Dispute",
            metadata: {
              musicianAmount: musicianConfirm.amount,
              clientAmount: clientConfirm.amount,
              musicianTx: musicianTx,
              clientTx: clientTx,
              musicianConfidence: musicianConfidence,
              clientConfidence: clientConfidence,
              reason: reason.trim(),
              amountMatch,
              txMatch,
              confidenceOk,
            },
          });
        }

        // Send dispute mails to client
        await sendGigMail(ctx, {
          userId: gig.postedBy,
          gigId: args.gigId,
          type: "payment_dispute",
          subject: "⚠️ Payment Dispute",
          message: `There's a payment discrepancy for ${gig.title}. ${reason}Our team will review.`,
          amount: clientConfirm.amount,
          transactionId: clientConfirm.extractedData?.transactionId,
          extractedData: clientConfirm.extractedData,
          requiresAction: true,
          actionUrl: `/hub/gigs/${args.gigId}/dispute`,
          actionLabel: "View Dispute",
          metadata: {
            musicianAmount: musicianConfirm.amount,
            clientAmount: clientConfirm.amount,
            musicianTx: musicianTx,
            clientTx: clientTx,
            musicianConfidence: musicianConfidence,
            clientConfidence: clientConfidence,
            reason: reason.trim(),
            amountMatch,
            txMatch,
            confidenceOk,
          },
        });
      }
    }

    return {
      success: true,
      bothConfirmed: !!(
        updatedGig?.musicianConfirmPayment && updatedGig?.clientConfirmPayment
      ),
    };
  },
});

// Mark mail as read
export const markGigMailAsRead = mutation({
  args: {
    mailId: v.id("gigMail"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.mailId, {
      isRead: true,
      readAt: Date.now(),
    });
  },
});

// convex/controllers/payments.ts

export const getGigPaymentStatus = query({
  args: {
    gigId: v.id("gigs"),
  },
  handler: async (ctx, args) => {
    const gig = await ctx.db.get(args.gigId);
    if (!gig) return null;

    // Get user info for display
    const musician = gig.bookedBy ? await ctx.db.get(gig.bookedBy) : null;
    const client = await ctx.db.get(gig.postedBy);

    return {
      gigId: gig._id,
      gigTitle: gig.title,
      musicianConfirmed: !!gig.musicianConfirmPayment,
      clientConfirmed: !!gig.clientConfirmPayment,
      verified: !!gig.paymentVerification,
      match: gig.paymentVerification?.match,
      paymentStatus: gig.paymentStatus,
      // Return the FULL musicianConfirm object with extractedData
      musicianConfirm: gig.musicianConfirmPayment
        ? {
            amount: gig.musicianConfirmPayment.amount,
            method: gig.musicianConfirmPayment.paymentMethod,
            confirmedAt: gig.musicianConfirmPayment.confirmedAt,
            transactionId:
              gig.musicianConfirmPayment.extractedData?.transactionId,
            confidence: gig.musicianConfirmPayment.extractedData?.confidence,
            // ADD THIS - include the full extractedData object
            extractedData: gig.musicianConfirmPayment.extractedData
              ? {
                  transactionId:
                    gig.musicianConfirmPayment.extractedData.transactionId,
                  amount: gig.musicianConfirmPayment.extractedData.amount,
                  date: gig.musicianConfirmPayment.extractedData.date,
                  time: gig.musicianConfirmPayment.extractedData.time,
                  phoneNumber:
                    gig.musicianConfirmPayment.extractedData.phoneNumber,
                  sender: gig.musicianConfirmPayment.extractedData.sender,
                  receiver: gig.musicianConfirmPayment.extractedData.receiver,
                  fullText: gig.musicianConfirmPayment.extractedData.fullText,
                  confidence:
                    gig.musicianConfirmPayment.extractedData.confidence,
                }
              : null,
          }
        : null,
      // Return the FULL clientConfirm object with extractedData
      clientConfirm: gig.clientConfirmPayment
        ? {
            amount: gig.clientConfirmPayment.amount,
            method: gig.clientConfirmPayment.paymentMethod,
            confirmedAt: gig.clientConfirmPayment.confirmedAt,
            transactionId:
              gig.clientConfirmPayment.extractedData?.transactionId,
            confidence: gig.clientConfirmPayment.extractedData?.confidence,
            // ADD THIS - include the full extractedData object
            extractedData: gig.clientConfirmPayment.extractedData
              ? {
                  transactionId:
                    gig.clientConfirmPayment.extractedData.transactionId,
                  amount: gig.clientConfirmPayment.extractedData.amount,
                  date: gig.clientConfirmPayment.extractedData.date,
                  time: gig.clientConfirmPayment.extractedData.time,
                  phoneNumber:
                    gig.clientConfirmPayment.extractedData.phoneNumber,
                  sender: gig.clientConfirmPayment.extractedData.sender,
                  receiver: gig.clientConfirmPayment.extractedData.receiver,
                  fullText: gig.clientConfirmPayment.extractedData.fullText,
                  confidence: gig.clientConfirmPayment.extractedData.confidence,
                }
              : null,
          }
        : null,
      verification: gig.paymentVerification
        ? {
            match: gig.paymentVerification.match,
            verifiedAt: gig.paymentVerification.verifiedAt,
            notes: gig.paymentVerification.notes,
            ocrConfidence: gig.paymentVerification.ocrConfidence,
          }
        : null,
      musician: musician
        ? {
            name: musician.firstname || musician.username,
            picture: musician.picture,
          }
        : null,
      client: client
        ? {
            name: client.firstname || client.username,
            picture: client.picture,
          }
        : null,
    };
  },
});

// Get user's payment summary
export const getUserPaymentSummary = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // Get all gigs where user is involved
    let gigs: Doc<"gigs">[] = [];

    if (user.isMusician) {
      const musicianGigs = await ctx.db
        .query("gigs")
        .filter((q) =>
          q.or(
            q.eq(q.field("bookedBy"), args.userId),
            q.neq(q.field("bandCategory"), undefined),
          ),
        )
        .collect();

      gigs = [
        ...gigs,
        ...musicianGigs.filter(
          (g) =>
            g.bookedBy === args.userId ||
            g.bandCategory?.some((r: any) =>
              r.bookedUsers?.includes(args.userId),
            ),
        ),
      ];
    }

    if (user.isClient) {
      const clientGigs = await ctx.db
        .query("gigs")
        .withIndex("by_postedBy", (q) => q.eq("postedBy", args.userId))
        .collect();

      gigs = [...gigs, ...clientGigs];
    }

    // Deduplicate
    gigs = gigs.filter((g, i, a) => a.findIndex((t) => t._id === g._id) === i);

    // Calculate summary
    let totalEarned = 0;
    let totalPaid = 0;
    let pendingAmount = 0;
    let verifiedAmount = 0;
    let disputedAmount = 0;
    let unreadMails = 0;

    // Get unread count
    unreadMails = await ctx.db
      .query("gigMail")
      .withIndex("by_userId_unread", (q) =>
        q.eq("userId", args.userId).eq("isRead", false),
      )
      .collect()
      .then((m) => m.length);

    for (const gig of gigs) {
      const isGigMusician =
        gig.bookedBy === args.userId ||
        gig.bandCategory?.some((r: any) =>
          r.bookedUsers?.includes(args.userId),
        );

      if (isGigMusician && gig.musicianConfirmPayment) {
        totalEarned += gig.musicianConfirmPayment.amount;

        if (gig.paymentVerification?.match) {
          verifiedAmount += gig.musicianConfirmPayment.amount;
        } else if (gig.paymentStatus === "disputed") {
          disputedAmount += gig.musicianConfirmPayment.amount;
        } else if (!gig.clientConfirmPayment) {
          pendingAmount += gig.musicianConfirmPayment.amount;
        }
      }

      if (gig.postedBy === args.userId && gig.clientConfirmPayment) {
        totalPaid += gig.clientConfirmPayment.amount;

        if (gig.paymentVerification?.match) {
          verifiedAmount += gig.clientConfirmPayment.amount;
        } else if (gig.paymentStatus === "disputed") {
          disputedAmount += gig.clientConfirmPayment.amount;
        } else if (!gig.musicianConfirmPayment) {
          pendingAmount += gig.clientConfirmPayment.amount;
        }
      }
    }

    return {
      summary: {
        totalEarned,
        totalPaid,
        pendingAmount,
        verifiedAmount,
        disputedAmount,
        netBalance: totalEarned - totalPaid,
      },
      counts: {
        totalGigs: gigs.length,
        verifiedGigs: gigs.filter((g) => g.paymentVerification?.match).length,
        disputedGigs: gigs.filter((g) => g.paymentStatus === "disputed").length,
        pendingGigs: gigs.filter(
          (g) =>
            (g.musicianConfirmPayment || g.clientConfirmPayment) &&
            !g.paymentVerification,
        ).length,
        unreadMails,
      },
    };
  },
});
// convex/payments.ts (add these queries)

// Get unread count for user
export const getUnreadCount = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const mails = await ctx.db
      .query("gigMail")
      .withIndex("by_userId_unread", (q) =>
        q.eq("userId", args.userId).eq("isRead", false),
      )
      .collect();

    return mails.length;
  },
});

// Get gig mail for a specific gig
export const getGigMail = query({
  args: {
    userId: v.id("users"),
    gigId: v.optional(v.id("gigs")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("gigMail")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc");

    if (args.gigId) {
      query = ctx.db
        .query("gigMail")
        .withIndex("by_gigId", (q) => q.eq("gigId", args.gigId))
        .order("desc");
    }

    const mails = await query.take(args.limit || 50);

    // Enhance with sender info if needed
    return Promise.all(
      mails.map(async (mail) => {
        if (mail.senderId) {
          const sender = await ctx.db.get(mail.senderId);
          return {
            ...mail,
            senderName: sender?.firstname || sender?.username,
            senderPicture: sender?.picture,
          };
        }
        return mail;
      }),
    );
  },
});
// convex/gigs.ts (add or update this query)

// convex/controllers/payments.ts

export const getUserGigsWithPaymentStatus = query({
  args: {
    userId: v.id("users"),
    includeAll: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return [];

    let gigs: Doc<"gigs">[] = [];

    // Get gigs where user is musician
    if (user.isMusician) {
      // Get directly booked gigs
      const bookedGigs = await ctx.db
        .query("gigs")
        .withIndex("by_bookedBy", (q) => q.eq("bookedBy", args.userId))
        .collect();

      // Get all gigs with bandCategory
      const allGigs = await ctx.db
        .query("gigs")
        .filter((q) => q.neq(q.field("bandCategory"), undefined))
        .collect();

      // Filter band gigs where user is in bookedUsers
      const bandGigs = allGigs.filter((gig) =>
        gig.bandCategory?.some((role: any) =>
          role.bookedUsers?.includes(args.userId),
        ),
      );

      gigs = [...gigs, ...bookedGigs, ...bandGigs];
    }

    // Get gigs where user is client
    if (user.isClient) {
      const clientGigs = await ctx.db
        .query("gigs")
        .withIndex("by_postedBy", (q) => q.eq("postedBy", args.userId))
        .collect();

      gigs = [...gigs, ...clientGigs];
    }

    // Deduplicate by ID
    const uniqueGigs = Array.from(
      new Map(gigs.map((gig) => [gig._id.toString(), gig])).values(),
    );

    // Sort by most recent
    uniqueGigs.sort((a, b) => {
      const dateA = a.date || a.createdAt;
      const dateB = b.date || b.createdAt;
      return dateB - dateA;
    });

    // Filter for payment activity if needed
    if (!args.includeAll) {
      return uniqueGigs.filter(
        (gig) =>
          gig.musicianConfirmPayment ||
          gig.clientConfirmPayment ||
          gig.paymentVerification,
      );
    }

    // Return all gigs with payment status info
    return uniqueGigs.map((gig) => {
      // Determine if current user is musician for this gig
      const isGigMusician =
        gig.bookedBy === args.userId ||
        gig.bandCategory?.some((role: any) =>
          role.bookedUsers?.includes(args.userId),
        );

      const isGigClient = gig.postedBy === args.userId;

      // Determine which amount to show
      let displayAmount = null;
      if (isGigMusician) {
        displayAmount = gig.musicianConfirmPayment?.amount || gig.price;
      } else if (isGigClient) {
        displayAmount = gig.clientConfirmPayment?.amount || gig.price;
      }

      // Calculate payment status
      let paymentStatus = "pending";
      if (gig.paymentVerification?.match) {
        paymentStatus = "verified";
      } else if (gig.musicianConfirmPayment && gig.clientConfirmPayment) {
        paymentStatus = "both_confirmed";
      } else if (gig.musicianConfirmPayment) {
        paymentStatus = "musician_confirmed";
      } else if (gig.clientConfirmPayment) {
        paymentStatus = "client_confirmed";
      }

      return {
        ...gig,
        displayAmount,
        paymentStatus,
        myRole: isGigMusician ? "musician" : isGigClient ? "client" : null,
        needsAction: isGigMusician
          ? !gig.musicianConfirmPayment && !!gig.clientConfirmPayment
          : isGigClient
            ? !gig.clientConfirmPayment && !!gig.musicianConfirmPayment
            : false,
        isComplete: !!gig.paymentVerification?.match,
        myConfirmation: isGigMusician
          ? gig.musicianConfirmPayment
          : gig.clientConfirmPayment,
        otherConfirmation: isGigMusician
          ? gig.clientConfirmPayment
          : gig.musicianConfirmPayment,
        verification: gig.paymentVerification,
      };
    });
  },
});
