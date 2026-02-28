// convex/controllers/payments.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { compareConfirmations, extractMpesaData } from "../payment";

// Helper to create notifications
async function createPaymentNotification(
  ctx: any,
  args: {
    userDocumentId: Id<"users">;
    type:
      | "payment_confirmed_musician"
      | "payment_confirmed_client"
      | "payment_verified"
      | "payment_dispute"
      | "payment_reminder";
    title: string;
    message: string;
    gigId: Id<"gigs">;
    relatedUserDocumentId?: Id<"users">;
    metadata?: any;
    image?: string;
  },
) {
  // Get gig for image if not provided
  let image = args.image;
  if (!image) {
    const gig = await ctx.db.get(args.gigId);
    image = gig?.logo;
  }

  // Get user's notification settings
  const settings = await ctx.db
    .query("notificationSettings")
    .withIndex("by_userId", (q: any) =>
      q.eq("userId", args.userDocumentId.toString()),
    )
    .first();

  // Map notification type to setting key
  const typeToSetting = {
    payment_confirmed_musician: "paymentConfirmations",
    payment_confirmed_client: "paymentConfirmations",
    payment_verified: "paymentConfirmations",
    payment_dispute: "paymentDisputes",
    payment_reminder: "paymentConfirmations",
  };

  const settingKey = typeToSetting[args.type];

  // Check if user has this notification type disabled
  if (settings && settings[settingKey as keyof typeof settings] === false) {
    return;
  }

  await ctx.db.insert("notifications", {
    userId: args.userDocumentId.toString(),
    type: args.type,
    title: args.title,
    message: args.message,
    image: image,
    actionUrl: `/hub/gigs/musician/${args.gigId}/gig-info`,
    actionLabel: "View Payment Details",
    relatedGigId: args.gigId.toString(),
    relatedUserId: args.relatedUserDocumentId?.toString(),
    metadata: {
      ...args.metadata,
      gigId: args.gigId.toString(),
    },
    isRead: false,
    isArchived: false,
    createdAt: Date.now(),
  });
}

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
    screenshot: v.string(), // Storage ID
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Get current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!currentUser) throw new Error("User not found");

    // Get the gig
    const gig = await ctx.db.get(args.gigId);
    if (!gig) throw new Error("Gig not found");

    // Get the other party (for notifications)
    const clientUser = await ctx.db.get(gig.postedBy);
    let musicianUser = null;

    // Find musician(s) - check if current user is booked or in band roles
    const isMusician =
      gig.bandCategory?.some((role: any) =>
        role.bookedUsers?.includes(currentUser._id),
      ) || gig.bookedBy === currentUser._id;

    const isClient = gig.postedBy === currentUser._id;

    // Find the other party
    if (gig.bookedBy) {
      musicianUser = await ctx.db.get(gig.bookedBy);
    } else if (gig.bandCategory) {
      // Find first booked musician in band roles
      for (const role of gig.bandCategory) {
        if (role.bookedUsers && role.bookedUsers.length > 0) {
          musicianUser = await ctx.db.get(role.bookedUsers[0]);
          break;
        }
      }
    }

    // Verify user is part of this gig
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
    };

    // Update the gig with confirmation
    if (args.role === "musician") {
      await ctx.db.patch(args.gigId, {
        musicianConfirmPayment: confirmation,
      });

      // Notify client that musician confirmed
      if (clientUser) {
        await createPaymentNotification(ctx, {
          userDocumentId: clientUser._id,
          type: "payment_confirmed_client",
          title: "💰 Payment Confirmed by Musician",
          message: `${currentUser.firstname || currentUser.username} confirmed receiving payment of KES ${args.amount} for ${gig.title}`,
          gigId: args.gigId,
          relatedUserDocumentId: currentUser._id,
          image: currentUser.picture,
          metadata: {
            amount: args.amount,
            paymentMethod: args.paymentMethod,
            role: "musician",
            confirmedAt: Date.now(),
          },
        });
      }

      // Notify musician that they successfully confirmed
      await createPaymentNotification(ctx, {
        userDocumentId: currentUser._id,
        type: "payment_confirmed_musician",
        title: "✅ Payment Confirmation Submitted",
        message: `You've confirmed receiving KES ${args.amount} for ${gig.title}. Waiting for client confirmation.`,
        gigId: args.gigId,
        metadata: {
          amount: args.amount,
          paymentMethod: args.paymentMethod,
          confirmedAt: Date.now(),
        },
      });
    } else {
      // Client confirmation
      await ctx.db.patch(args.gigId, {
        clientConfirmPayment: confirmation,
      });

      // Notify musician that client confirmed
      if (musicianUser) {
        await createPaymentNotification(ctx, {
          userDocumentId: musicianUser._id,
          type: "payment_confirmed_musician",
          title: "💰 Payment Confirmed by Client",
          message: `${currentUser.firstname || currentUser.username} confirmed sending payment of KES ${args.amount} for ${gig.title}. Please verify.`,
          gigId: args.gigId,
          relatedUserDocumentId: currentUser._id,
          image: currentUser.picture,
          metadata: {
            amount: args.amount,
            paymentMethod: args.paymentMethod,
            role: "client",
            confirmedAt: Date.now(),
          },
        });
      }

      // Notify client they successfully confirmed
      await createPaymentNotification(ctx, {
        userDocumentId: currentUser._id,
        type: "payment_confirmed_client",
        title: "✅ Payment Confirmation Submitted",
        message: `You've confirmed sending KES ${args.amount} for ${gig.title}. Waiting for musician confirmation.`,
        gigId: args.gigId,
        metadata: {
          amount: args.amount,
          paymentMethod: args.paymentMethod,
          confirmedAt: Date.now(),
        },
      });
    }

    // Check if both confirmations now exist
    const updatedGig = await ctx.db.get(args.gigId);
    if (
      updatedGig?.musicianConfirmPayment &&
      updatedGig?.clientConfirmPayment
    ) {
      const musicianConfirm = updatedGig.musicianConfirmPayment;
      const clientConfirm = updatedGig.clientConfirmPayment;

      // Run OCR on both screenshots
      try {
        console.log("Running OCR on payment screenshots...");
        const [musicianData, clientData] = await Promise.all([
          extractMpesaData(musicianConfirm.screenshot),
          extractMpesaData(clientConfirm.screenshot),
        ]);

        const comparison = compareConfirmations(
          musicianConfirm,
          clientConfirm,
          musicianData,
          clientData,
        );

        console.log("Payment comparison result:", comparison);
        const SYSTEM_USER_ID = "SYSTEM" as Id<"users">; // or your actual system user ID

        // Helper function to safely get extracted data
        function getSafeExtractedData(comparison: any, defaultAmount: number) {
          if (!comparison.extractedData) return undefined;

          const musician = comparison.extractedData.musician;
          const client = comparison.extractedData.client;

          // Use musician data if available, otherwise client data
          const primaryData = musician || client;

          if (!primaryData) return undefined;

          return {
            timestamp: primaryData.timestamp || Date.now(),
            amount: primaryData.amount || defaultAmount,
            transactionId: primaryData.transactionId || "",
            sender: primaryData.sender || "",
            receiver: primaryData.receiver || "",
          };
        }

        // Then use it:
        await ctx.db.patch(args.gigId, {
          paymentVerification: {
            gigId: args.gigId,
            verifiedAt: Date.now(),
            verifiedBy: SYSTEM_USER_ID,
            match: comparison.match,
            extractedData: getSafeExtractedData(comparison, args.amount),
            notes: comparison.reason,
            ocrConfidence: {
              musician: comparison.extractedData?.musician?.confidence ?? 0,
              client: comparison.extractedData?.client?.confidence ?? 0,
            },
          },
        });

        if (comparison.match) {
          // Amounts match - notify both parties
          if (musicianUser) {
            await createPaymentNotification(ctx, {
              userDocumentId: musicianUser._id,
              type: "payment_verified",
              title: "🎉 Payment Verified!",
              message: `Payment of KES ${musicianConfirm.amount} for ${gig.title} has been automatically verified. Transaction complete.`,
              gigId: args.gigId,
              image: gig.logo,
              metadata: {
                amount: musicianConfirm.amount,
                verified: true,
                method: "auto-ocr",
              },
            });
          }

          if (clientUser) {
            await createPaymentNotification(ctx, {
              userDocumentId: clientUser._id,
              type: "payment_verified",
              title: "🎉 Payment Verified!",
              message: `Payment of KES ${clientConfirm.amount} for ${gig.title} has been automatically verified. Transaction complete.`,
              gigId: args.gigId,
              image: gig.logo,
              metadata: {
                amount: clientConfirm.amount,
                verified: true,
                method: "auto-ocr",
              },
            });
          }
        } else {
          // Amount mismatch or OCR detected issues - dispute
          const disputeReason =
            comparison.reason || "Payment details don't match";

          if (musicianUser) {
            await createPaymentNotification(ctx, {
              userDocumentId: musicianUser._id,
              type: "payment_dispute",
              title: "⚠️ Payment Dispute Detected",
              message: `There's a discrepancy in payment for ${gig.title}. ${disputeReason}. Our team will review.`,
              gigId: args.gigId,
              image: gig.logo,
              metadata: {
                musicianAmount: musicianConfirm.amount,
                clientAmount: clientConfirm.amount,
                dispute: true,
                reasons: comparison.reasons,
                details: comparison.details,
              },
            });
          }

          if (clientUser) {
            await createPaymentNotification(ctx, {
              userDocumentId: clientUser._id,
              type: "payment_dispute",
              title: "⚠️ Payment Dispute Detected",
              message: `There's a discrepancy in payment for ${gig.title}. ${disputeReason}. Our team will review.`,
              gigId: args.gigId,
              image: gig.logo,
              metadata: {
                musicianAmount: musicianConfirm.amount,
                clientAmount: clientConfirm.amount,
                dispute: true,
                reasons: comparison.reasons,
                details: comparison.details,
              },
            });
          }

          // Also notify admins (optional - you'd need an admin query)
          // const admins = await ctx.db.query("users").withIndex("by_role", q => q.eq("role", "admin")).collect();
          // for (const admin of admins) {
          //   await createPaymentNotification(ctx, {
          //     userDocumentId: admin._id,
          //     type: "payment_dispute",
          //     title: "🚨 Payment Dispute Requires Review",
          //     message: `Dispute in gig ${gig.title}: ${disputeReason}`,
          //     gigId: args.gigId,
          //     metadata: comparison.details,
          //   });
          // }
        }
      } catch (ocrError) {
        console.error("OCR processing failed:", ocrError);

        // Still do basic amount comparison even if OCR fails
        if (musicianConfirm.amount === clientConfirm.amount) {
          // Amounts match but OCR failed - notify with warning
          if (musicianUser) {
            await createPaymentNotification(ctx, {
              userDocumentId: musicianUser._id,
              type: "payment_verified",
              title: "💰 Payment Amounts Match",
              message: `Both parties confirmed KES ${musicianConfirm.amount} for ${gig.title}. Please allow time for manual verification.`,
              gigId: args.gigId,
              metadata: {
                amount: musicianConfirm.amount,
                verified: false,
                method: "manual-review",
              },
            });
          }
        } else {
          // Basic amount mismatch
          const disputeMsg = `Amount mismatch: Musician KES ${musicianConfirm.amount}, Client KES ${clientConfirm.amount}`;

          if (musicianUser) {
            await createPaymentNotification(ctx, {
              userDocumentId: musicianUser._id,
              type: "payment_dispute",
              title: "⚠️ Payment Amount Mismatch",
              message: disputeMsg,
              gigId: args.gigId,
              metadata: {
                musicianAmount: musicianConfirm.amount,
                clientAmount: clientConfirm.amount,
              },
            });
          }
        }
      }
    }

    return {
      success: true,
      role: args.role,
      bothConfirmed: !!(
        updatedGig?.musicianConfirmPayment && updatedGig?.clientConfirmPayment
      ),
    };
  },
});

export const verifyPayment = mutation({
  args: {
    gigId: v.id("gigs"),
    verifiedAt: v.number(),
    match: v.boolean(),
    extractedData: v.optional(
      v.object({
        transactionId: v.string(),
        amount: v.number(),
        sender: v.string(),
        receiver: v.string(),
        timestamp: v.number(),
      }),
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Get admin user (or whoever is verifying)
    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!adminUser) throw new Error("User not found");

    const gig = await ctx.db.get(args.gigId);
    if (!gig) throw new Error("Gig not found");

    // Verify both confirmations exist
    if (!gig.musicianConfirmPayment || !gig.clientConfirmPayment) {
      throw new Error("Both parties must confirm first");
    }

    // Add verification
    await ctx.db.patch(args.gigId, {
      paymentVerification: {
        gigId: args.gigId,
        verifiedAt: args.verifiedAt,
        verifiedBy: adminUser._id,
        match: args.match,
        extractedData: args.extractedData,
        notes: args.notes,
      },
    });

    // Get users for notifications
    const musicianUser = gig.bookedBy ? await ctx.db.get(gig.bookedBy) : null;
    const clientUser = await ctx.db.get(gig.postedBy);

    if (args.match) {
      // Verification passed
      if (musicianUser) {
        await createPaymentNotification(ctx, {
          userDocumentId: musicianUser._id,
          type: "payment_verified",
          title: "✅ Payment Officially Verified",
          message: `Your payment for ${gig.title} has been officially verified by our team. Thank you!`,
          gigId: args.gigId,
          image: gig.logo,
          metadata: {
            amount: gig.musicianConfirmPayment.amount,
            verifiedBy: "admin",
            verifiedAt: args.verifiedAt,
          },
        });
      }

      if (clientUser) {
        await createPaymentNotification(ctx, {
          userDocumentId: clientUser._id,
          type: "payment_verified",
          title: "✅ Payment Officially Verified",
          message: `Your payment for ${gig.title} has been officially verified by our team. Thank you!`,
          gigId: args.gigId,
          image: gig.logo,
          metadata: {
            amount: gig.clientConfirmPayment.amount,
            verifiedBy: "admin",
            verifiedAt: args.verifiedAt,
          },
        });
      }
    } else {
      // Verification failed
      if (musicianUser) {
        await createPaymentNotification(ctx, {
          userDocumentId: musicianUser._id,
          type: "payment_dispute",
          title: "❌ Payment Verification Failed",
          message: `We couldn't verify your payment for ${gig.title}. ${args.notes || "Please contact support."}`,
          gigId: args.gigId,
          image: gig.logo,
          metadata: {
            amount: gig.musicianConfirmPayment.amount,
            reason: args.notes,
            verifiedBy: "admin",
          },
        });
      }

      if (clientUser) {
        await createPaymentNotification(ctx, {
          userDocumentId: clientUser._id,
          type: "payment_dispute",
          title: "❌ Payment Verification Failed",
          message: `We couldn't verify your payment for ${gig.title}. ${args.notes || "Please contact support."}`,
          gigId: args.gigId,
          image: gig.logo,
          metadata: {
            amount: gig.clientConfirmPayment.amount,
            reason: args.notes,
            verifiedBy: "admin",
          },
        });
      }
    }

    return { success: true, match: args.match };
  },
});

export const sendPaymentReminder = mutation({
  args: {
    gigId: v.id("gigs"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const gig = await ctx.db.get(args.gigId);
    if (!gig) throw new Error("Gig not found");

    const clientUser = await ctx.db.get(gig.postedBy);

    if (clientUser && !gig.clientConfirmPayment) {
      await createPaymentNotification(ctx, {
        userDocumentId: clientUser._id,
        type: "payment_reminder",
        title: "⏰ Payment Reminder",
        message: `Please remember to confirm payment for ${gig.title} if you haven't already.`,
        gigId: args.gigId,
        image: gig.logo,
        metadata: {
          reminder: true,
          dueDate: gig.date,
        },
      });
    }

    // Also remind musician if needed
    if (gig.bookedBy) {
      const musicianUser = await ctx.db.get(gig.bookedBy);
      if (musicianUser && !gig.musicianConfirmPayment) {
        await createPaymentNotification(ctx, {
          userDocumentId: musicianUser._id,
          type: "payment_reminder",
          title: "⏰ Payment Reminder",
          message: `Please remember to confirm receiving payment for ${gig.title} if you haven't already.`,
          gigId: args.gigId,
          image: gig.logo,
          metadata: {
            reminder: true,
            dueDate: gig.date,
          },
        });
      }
    }

    return { success: true };
  },
});

export const getPaymentStatus = mutation({
  args: {
    gigId: v.id("gigs"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const gig = await ctx.db.get(args.gigId);
    if (!gig) throw new Error("Gig not found");

    // Determine user's role in this gig
    let role = null;
    if (gig.postedBy === user._id) {
      role = "client";
    } else if (
      gig.bandCategory?.some((r: any) => r.bookedUsers?.includes(user._id)) ||
      gig.bookedBy === user._id
    ) {
      role = "musician";
    }

    // Run OCR comparison if both confirmations exist but no verification yet
    let autoVerification = null;
    if (
      gig.musicianConfirmPayment &&
      gig.clientConfirmPayment &&
      !gig.paymentVerification
    ) {
      try {
        const [musicianData, clientData] = await Promise.all([
          extractMpesaData(gig.musicianConfirmPayment.screenshot),
          extractMpesaData(gig.clientConfirmPayment.screenshot),
        ]);

        const comparison = compareConfirmations(
          gig.musicianConfirmPayment,
          gig.clientConfirmPayment,
          musicianData,
          clientData,
        );

        autoVerification = {
          match: comparison.match,
          reason: comparison.reason,
          ocrConfidence: {
            musician: musicianData?.confidence || 0,
            client: clientData?.confidence || 0,
          },
        };
      } catch (error) {
        console.error("Auto-verification failed:", error);
      }
    }

    return {
      role,
      musicianConfirmed: !!gig.musicianConfirmPayment,
      clientConfirmed: !!gig.clientConfirmPayment,
      verified: !!gig.paymentVerification,
      verificationMatch: gig.paymentVerification?.match,
      musicianConfirm: gig.musicianConfirmPayment,
      clientConfirm: gig.clientConfirmPayment,
      verification: gig.paymentVerification,
      autoVerification, // Include auto-verification results
    };
  },
});
