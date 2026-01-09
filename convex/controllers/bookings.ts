// convex/bookings.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { createNotificationInternal } from "../createNotificationInternal";

// Helper to get Convex user ID from Clerk ID
export const getUserByClerkId = async (ctx: any, clerkId: string) => {
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q: any) => q.eq("clerkId", clerkId))
    .first();

  if (!user) {
    throw new Error("User not found. Please complete your profile.");
  }

  return user;
};

export const withdrawFromBandRole = mutation({
  args: {
    gigId: v.id("gigs"),
    bandRoleIndex: v.number(),
    clerkId: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { gigId, bandRoleIndex, clerkId, reason } = args;

    const musician = await getUserByClerkId(ctx, clerkId);
    if (!musician) throw new Error("Musician not found");

    const gig = await ctx.db.get(gigId);
    if (!gig) throw new Error("Gig not found");

    if (!gig.bandCategory || !gig.bandCategory[bandRoleIndex]) {
      throw new Error("Invalid band role");
    }

    const role = gig.bandCategory[bandRoleIndex];
    const isBooked = role.bookedUsers.includes(musician._id);
    const isApplicant = role.applicants.includes(musician._id);

    if (!isBooked && !isApplicant) {
      throw new Error("You're not associated with this role");
    }

    let updatedBandCategory = [...gig.bandCategory];
    let notificationType = "";
    let title = "";
    let message = "";
    let bandBookingEntry: any = null;
    let bookingEntry: any = null;

    if (isBooked) {
      // CASE 1: BOOKED MUSICIAN LEAVING (ALREADY IN bookedUsers)
      updatedBandCategory[bandRoleIndex] = {
        ...role,
        filledSlots: Math.max(0, role.filledSlots - 1),
        bookedUsers: role.bookedUsers.filter((id) => id !== musician._id),
        // Remove from applicants too if they're still there
        applicants: role.applicants.filter((id) => id !== musician._id),
      };

      notificationType = "band_member_left";
      title = "🎵 Band Member Left";
      message = `${musician.firstname || musician.username} left as ${role.role}`;

      bandBookingEntry = {
        bandRole: role.role,
        bandRoleIndex,
        userId: musician._id,
        userName: musician.firstname || musician.username || "Musician",
        appliedAt: Date.now(),
        applicationStatus: "pending_review" as const,
        bookedAt: Date.now(),
        bookedBy: musician._id,
        bookedPrice: role.bookedPrice || role.price,
        completedAt: Date.now(),
        completionNotes: reason || "Left the band",
        paymentStatus: "cancelled" as const,
      };

      bookingEntry = {
        entryId: `${gigId}_${bandRoleIndex}_${musician._id}_${Date.now()}`,
        timestamp: Date.now(),
        userId: musician._id,
        userRole: "musician",
        bandRole: role.role,
        bandRoleIndex,
        isBandRole: true,
        status: "cancelled" as const,
        gigType: "band" as const,
        actionBy: musician._id,
        actionFor: musician._id,
        reason: reason || "Left the band",
        metadata: {
          action: "left_band",
          wasBooked: true,
          bookedPrice: role.bookedPrice || role.price,
        },
      };
    } else {
      // CASE 2: APPLICANT WITHDRAWING (ONLY IN applicants, NOT bookedUsers)
      updatedBandCategory[bandRoleIndex] = {
        ...role,
        applicants: role.applicants.filter((id) => id !== musician._id),
        // bookedUsers remains unchanged
      };

      notificationType = "interest_removed";
      title = "🔄 Application Withdrawn";
      message = `${musician.firstname || musician.username} withdrew their application for ${role.role}`;

      bandBookingEntry = {
        bandRole: role.role,
        bandRoleIndex,
        userId: musician._id,
        userName: musician.firstname || musician.username || "Musician",
        appliedAt: Date.now(),
        applicationStatus: "withdrawn" as const,
        applicationNotes: reason || "Withdrew application",
      };

      bookingEntry = {
        entryId: `${gigId}_${bandRoleIndex}_${musician._id}_${Date.now()}`,
        timestamp: Date.now(),
        userId: musician._id,
        userRole: "musician",
        bandRole: role.role,
        bandRoleIndex,
        isBandRole: true,
        status: "cancelled" as const,
        gigType: "band" as const,
        actionBy: musician._id,
        actionFor: musician._id,
        reason: reason || "Withdrew application for band role",
        metadata: {
          action: "application_withdrawn",
          wasBooked: false,
          remainingApplicants: role.applicants.length - 1,
        },
      };
    }

    // Update gig
    await ctx.db.patch(gigId, {
      bandCategory: updatedBandCategory,
      bookingHistory: [...(gig.bookingHistory || []), bookingEntry],
      bandBookingHistory: [...(gig.bandBookingHistory || []), bandBookingEntry],
      updatedAt: Date.now(),
      ...(isBooked && {
        isTaken: false,
        isPending: false,
      }),
    });

    // NOTIFY BAND CREATOR
    const bandCreator = await ctx.db.get(gig.postedBy);
    if (bandCreator) {
      await createNotificationInternal(ctx, {
        userDocumentId: gig.postedBy,
        type: notificationType,
        title,
        message,
        image: musician.picture,
        actionUrl: `/gigs/${gigId}`,
        relatedUserDocumentId: musician._id,
        metadata: {
          gigId,
          gigTitle: gig.title,
          role: role.role,
          bandRoleIndex,
          reason: reason || "",
          wasBooked: isBooked,
          ...(isApplicant &&
            !isBooked && {
              remainingApplicants: role.applicants.length - 1,
            }),
        },
      });
    }

    return {
      success: true,
      wasBooked: isBooked,
      ...(isApplicant &&
        !isBooked && {
          remainingApplicants: role.applicants.length - 1,
        }),
      role: role.role,
    };
  },
});

// REMOVE THE DUPLICATE FUNCTION AT THE BOTTOM OF convex/bookings.ts
// BOOK USER FOR SPECIFIC BAND ROLE
export const bookUserForBand = mutation({
  args: {
    gigId: v.id("gigs"),
    userId: v.id("users"),
    bandRoleIndex: v.number(),
    clerkId: v.string(), // Client's Clerk ID
    bookedPrice: v.optional(v.number()), // Changed from agreedPrice to bookedPrice
    notes: v.optional(v.string()),
    replaceExisting: v.optional(v.boolean()),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const {
      gigId,
      userId,
      bandRoleIndex,
      clerkId,
      bookedPrice,
      notes,
      replaceExisting,
      reason,
    } = args;

    // Get client user from Clerk ID
    const clientUser = await getUserByClerkId(ctx, clerkId);
    if (!clientUser) throw new Error("Client not found");

    const gig = await ctx.db.get(gigId);
    if (!gig) throw new Error("Gig not found");

    // Verify this is a band gig
    if (!gig.isClientBand || gig.bussinesscat !== "other") {
      throw new Error("This is not a band creation gig");
    }

    // Verify caller is the band creator
    if (gig.postedBy !== clientUser._id) {
      throw new Error("Only the band creator can book musicians");
    }

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Get band category and specific role
    if (!gig.bandCategory || !gig.bandCategory[bandRoleIndex]) {
      throw new Error("Invalid band role");
    }

    const role = gig.bandCategory[bandRoleIndex];
    const userDisplayName = user.firstname || user.username || "Musician";

    // Check if role is already filled
    const roleFilled = role.filledSlots >= role.maxSlots;

    // If role is full and we're not replacing, error
    if (roleFilled && !replaceExisting) {
      throw new Error(
        `The role "${role.role}" is already filled. Use replaceExisting=true to replace.`
      );
    }

    // Check if user is already booked for this role
    const userAlreadyBooked = role.bookedUsers.includes(userId);
    if (userAlreadyBooked && !replaceExisting) {
      throw new Error("This user is already booked for this role");
    }

    // Create updated band category
    let updatedBandCategory = [...gig.bandCategory];
    let replacedUser = null;

    if (replaceExisting && role.bookedUsers.length > 0) {
      // Replace existing booking(s) for this role
      if (role.maxSlots === 1 && role.bookedUsers.length === 1) {
        // Single slot role - replace the existing user
        const existingUserId = role.bookedUsers[0];
        replacedUser = {
          userId: existingUserId,
          name: "Previous musician",
        };

        // Remove old user, add new user
        updatedBandCategory[bandRoleIndex] = {
          ...role,
          bookedUsers: [userId], // Replace with new user
          // filledSlots remains 1 (replacing, not adding)
          bookedPrice: bookedPrice || role.bookedPrice || role.price, // Use bookedPrice
        };
      } else {
        // Multiple slot role - add new user if slots available
        if (role.filledSlots < role.maxSlots) {
          updatedBandCategory[bandRoleIndex] = {
            ...role,
            filledSlots: role.filledSlots + 1,
            bookedUsers: [...role.bookedUsers, userId],
            bookedPrice: bookedPrice || role.bookedPrice || role.price, // Use bookedPrice
          };
        } else {
          // Find someone to replace (first user)
          const toReplace = role.bookedUsers[0];
          replacedUser = {
            userId: toReplace,
            name: "Previous musician",
          };

          updatedBandCategory[bandRoleIndex] = {
            ...role,
            bookedUsers: role.bookedUsers
              .filter((id) => id !== toReplace)
              .concat(userId),
            // filledSlots remains same (replacing)
            bookedPrice: bookedPrice || role.bookedPrice || role.price, // Use bookedPrice
          };
        }
      }
    } else {
      // Add new booking (if slot available)
      if (role.filledSlots >= role.maxSlots) {
        throw new Error(`No available slots for "${role.role}"`);
      }

      updatedBandCategory[bandRoleIndex] = {
        ...role,
        filledSlots: role.filledSlots + 1,
        bookedUsers: [...role.bookedUsers, userId],
        bookedPrice: bookedPrice || role.bookedPrice || role.price, // Use bookedPrice
      };
    }

    // Create enhanced band booking history entry
    const bandBookingEntry = {
      bandRole: role.role,
      bandRoleIndex,
      userId,
      userName: userDisplayName,
      appliedAt: Date.now(),
      applicationStatus: "pending_review" as const,
      bookedAt: Date.now(),
      bookedBy: clientUser._id,
      bookedPrice: bookedPrice || role.price, // Use bookedPrice
      contractSigned: false,
      paymentStatus: "pending" as const,
    };

    // Create regular booking history entry
    const bookingEntry = {
      entryId: `${gigId}_${bandRoleIndex}_${userId}_${Date.now()}`,
      timestamp: Date.now(),
      userId,
      userRole: "musician",
      bandRole: role.role,
      bandRoleIndex,
      isBandRole: true,
      status: replaceExisting ? ("rejected" as const) : ("booked" as const),
      gigType: "band" as const, // ADD 'as const' HERE
      proposedPrice: role.price,
      agreedPrice: bookedPrice || role.price,
      currency: role.currency,
      actionBy: clientUser._id,
      actionFor: userId,
      notes: notes || "",
      reason: reason || (replaceExisting ? "Role replacement" : "New booking"),
      metadata: {
        roleDescription: role.description,
        requiredSkills: role.requiredSkills,
        maxSlots: role.maxSlots,
        negotiable: role.negotiable,
        isReplacement: replaceExisting,
        replacedUserId: replacedUser?.userId,
      },
    };

    // Check if all roles are filled
    const allRolesFilled = updatedBandCategory.every(
      (r) => r.filledSlots >= r.maxSlots
    );

    // Update gig - ONLY updating bandCategory
    await ctx.db.patch(gigId, {
      bandCategory: updatedBandCategory,
      bookingHistory: [...(gig.bookingHistory || []), bookingEntry],
      bandBookingHistory: [...(gig.bandBookingHistory || []), bandBookingEntry],
      updatedAt: Date.now(),
      ...(allRolesFilled && { isTaken: true, isPending: true }),
    });

    // NOTIFY THE BOOKED MUSICIAN
    await createNotificationInternal(ctx, {
      userDocumentId: userId,
      type: "band_booking",
      title: replaceExisting ? "🔄 Role Reassignment" : "🎵 Band Booking!",
      message: replaceExisting
        ? `You've replaced another musician as ${role.role} for "${gig.title}"`
        : `You've been booked as ${role.role} for "${gig.title}"`,
      image: gig.logo,
      actionUrl: `/gigs/${gigId}`,
      relatedUserDocumentId: clientUser._id,
      metadata: {
        gigId,
        gigTitle: gig.title,
        role: role.role,
        bookedPrice: bookedPrice || role.price, // Use bookedPrice
        currency: role.currency,
        bookedBy: clientUser._id,
        isReplacement: replaceExisting,
        replacedUser: replacedUser,
        bandRoleIndex,
      },
    });

    // NOTIFY REPLACED USER IF APPLICABLE
    if (replacedUser && replacedUser.userId) {
      await createNotificationInternal(ctx, {
        userDocumentId: replacedUser.userId,
        type: "removed_from_band",
        title: "🔄 Role Replaced",
        message: `You've been replaced as ${role.role} for "${gig.title}"`,
        actionUrl: `/gigs/${gigId}`,
        relatedUserDocumentId: clientUser._id,
        metadata: {
          gigId,
          gigTitle: gig.title,
          role: role.role,
          replacedBy: userDisplayName,
          reason: reason,
          bandRoleIndex,
        },
      });
    }

    return {
      success: true,
      bandBookingEntry,
      bookingEntry,
      allRolesFilled,
      replacedUser,
    };
  },
});

// LEAVE BAND (Musician leaves voluntarily)
export const leaveBand = mutation({
  args: {
    gigId: v.id("gigs"),
    clerkId: v.string(), // Musician's Clerk ID
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { gigId, clerkId, reason } = args;

    // Get musician user from Clerk ID
    const musician = await getUserByClerkId(ctx, clerkId);
    if (!musician) throw new Error("Musician not found");

    const gig = await ctx.db.get(gigId);
    if (!gig) throw new Error("Gig not found");

    if (!gig.isClientBand || gig.bussinesscat !== "other") {
      throw new Error("This is not a band gig");
    }

    if (!gig.bandCategory) {
      throw new Error("No band roles found");
    }

    // Find which role the musician is booked for
    let bandRoleIndex = -1;
    let userRole = null;

    for (let i = 0; i < gig.bandCategory.length; i++) {
      const role = gig.bandCategory[i];
      if (role.bookedUsers.includes(musician._id)) {
        bandRoleIndex = i;
        userRole = role;
        break;
      }
    }

    if (bandRoleIndex === -1 || !userRole) {
      throw new Error("You're not a member of this band");
    }

    // Create updated band category - remove user from bookedUsers
    const updatedBandCategory = [...gig.bandCategory];
    updatedBandCategory[bandRoleIndex] = {
      ...userRole,
      filledSlots: Math.max(0, userRole.filledSlots - 1),
      bookedUsers: userRole.bookedUsers.filter((id) => id !== musician._id),
    };

    // Create band booking history entry for leaving
    const bandBookingEntry = {
      bandRole: userRole.role,
      bandRoleIndex,
      userId: musician._id,
      userName: musician.firstname || musician.username || "Musician",
      bookedAt: Date.now(),
      bookedBy: musician._id,
      appliedAt: Date.now(), // ADD THIS - required field
      applicationStatus: "pending_review" as const, // ADD THIS - required field
      bookedPrice: userRole.bookedPrice || userRole.price,
      completedAt: Date.now(),
      completionNotes: reason || "Voluntarily left the band",
      paymentStatus: "cancelled" as const, // Use "cancelled" now that it's in schema
    };

    // Create regular booking history entry
    const cancellationEntry = {
      entryId: `${gigId}_${bandRoleIndex}_${musician._id}_${Date.now()}`,
      timestamp: Date.now(),
      userId: musician._id,
      userRole: "musician",
      bandRole: userRole.role,
      bandRoleIndex,
      isBandRole: true,
      status: "cancelled" as const,
      gigType: "band" as const, // ADD 'as const' HERE
      actionBy: musician._id,
      actionFor: musician._id,
      reason: reason || "Voluntarily left the band",
      metadata: {
        previousPrice: userRole.bookedPrice || userRole.price,
        leftVoluntarily: true,
      },
    };

    // Update gig
    await ctx.db.patch(gigId, {
      bandCategory: updatedBandCategory,
      bookingHistory: [...(gig.bookingHistory || []), cancellationEntry],
      bandBookingHistory: [...(gig.bandBookingHistory || []), bandBookingEntry],
      updatedAt: Date.now(),
      isTaken: false, // Reset taken status
      isPending: false,
    });

    // NOTIFY BAND CREATOR
    const bandCreator = await ctx.db.get(gig.postedBy);
    if (bandCreator) {
      await createNotificationInternal(ctx, {
        userDocumentId: gig.postedBy,
        type: "band_member_left",
        title: "🎵 Band Member Left",
        message: `${musician.firstname || musician.username} left as ${userRole.role}`,
        image: musician.picture,
        actionUrl: `/gigs/${gigId}`,
        relatedUserDocumentId: musician._id,
        metadata: {
          gigId,
          gigTitle: gig.title,
          role: userRole.role,
          reason: reason,
          bandRoleIndex,
        },
      });
    }

    return { success: true };
  },
});

// REMOVE FROM BAND (Client removes musician)
export const removeFromBand = mutation({
  args: {
    gigId: v.id("gigs"),
    userId: v.id("users"),
    clerkId: v.string(), // Client's Clerk ID
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { gigId, userId, clerkId, reason } = args;

    // Get client user from Clerk ID
    const clientUser = await getUserByClerkId(ctx, clerkId);
    if (!clientUser) throw new Error("Client not found");

    const gig = await ctx.db.get(gigId);
    if (!gig) throw new Error("Gig not found");

    if (!gig.isClientBand || gig.bussinesscat !== "other") {
      throw new Error("This is not a band gig");
    }

    // Verify caller is band creator
    if (gig.postedBy !== clientUser._id) {
      throw new Error("Only the band creator can remove members");
    }

    if (!gig.bandCategory) {
      throw new Error("No band roles found");
    }

    // Find which role the user is booked for
    let bandRoleIndex = -1;
    let userRole = null;

    for (let i = 0; i < gig.bandCategory.length; i++) {
      const role = gig.bandCategory[i];
      if (role.bookedUsers.includes(userId)) {
        bandRoleIndex = i;
        userRole = role;
        break;
      }
    }

    if (bandRoleIndex === -1 || !userRole) {
      throw new Error("User is not in this band");
    }

    const removedUser = await ctx.db.get(userId);
    const removedUserName =
      removedUser?.firstname || removedUser?.username || "User";

    // Create updated band category - remove user from bookedUsers
    const updatedBandCategory = [...gig.bandCategory];
    updatedBandCategory[bandRoleIndex] = {
      ...userRole,
      filledSlots: Math.max(0, userRole.filledSlots - 1),
      bookedUsers: userRole.bookedUsers.filter((id) => id !== userId),
    };

    // Create band booking history entry for removal
    const bandBookingEntry = {
      bandRole: userRole.role,
      bandRoleIndex,
      userId,
      userName: removedUserName,
      bookedAt: Date.now(),
      bookedBy: clientUser._id,
      appliedAt: Date.now(), // ADD THIS - required field
      applicationStatus: "pending_review" as const, // ADD THIS - required field
      bookedPrice: userRole.bookedPrice || userRole.price,
      completedAt: Date.now(),
      completionNotes: reason || "Removed by band creator",
      paymentStatus: "cancelled" as const, // Use "cancelled" now that it's in schema
    };

    // Create regular booking history entry
    const removalEntry = {
      entryId: `${gigId}_${bandRoleIndex}_${userId}_${Date.now()}`,
      timestamp: Date.now(),
      userId,
      userRole: "musician",
      bandRole: userRole.role,
      bandRoleIndex,
      isBandRole: true,
      status: "cancelled" as const,
      gigType: "band" as const, // ADD 'as const' HERE
      actionBy: clientUser._id,
      actionFor: userId,
      reason: reason || "Removed by band creator",
      metadata: {
        previousPrice: userRole.bookedPrice || userRole.price,
        removedBy: "band_creator",
      },
    };

    // Update gig
    await ctx.db.patch(gigId, {
      bandCategory: updatedBandCategory,
      bookingHistory: [...(gig.bookingHistory || []), removalEntry],
      bandBookingHistory: [...(gig.bandBookingHistory || []), bandBookingEntry],
      updatedAt: Date.now(),
      isTaken: false,
      isPending: false,
    });

    // NOTIFY REMOVED USER
    if (removedUser) {
      await createNotificationInternal(ctx, {
        userDocumentId: userId,
        type: "removed_from_band",
        title: "❌ Removed from Band",
        message: `You've been removed from "${gig.title}" as ${userRole.role}`,
        actionUrl: `/gigs/${gigId}`,
        relatedUserDocumentId: clientUser._id,
        metadata: {
          gigId,
          gigTitle: gig.title,
          role: userRole.role,
          reason: reason,
          bandRoleIndex,
        },
      });
    }

    return { success: true };
  },
});

// APPLY FOR BAND ROLE (Musician applies)
export const applyForBandRole = mutation({
  args: {
    gigId: v.id("gigs"),
    bandRoleIndex: v.number(),
    clerkId: v.string(), // Musician's Clerk ID
    applicationNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { gigId, bandRoleIndex, clerkId, applicationNotes } = args;

    // Get musician user from Clerk ID
    const musician = await getUserByClerkId(ctx, clerkId);
    if (!musician) throw new Error("Musician not found");

    const gig = await ctx.db.get(gigId);
    if (!gig) throw new Error("Gig not found");

    if (!gig.isClientBand || gig.bussinesscat !== "other") {
      throw new Error("This is not a band gig");
    }

    // Get band category and specific role
    if (!gig.bandCategory || !gig.bandCategory[bandRoleIndex]) {
      throw new Error("Invalid band role");
    }

    const role = gig.bandCategory[bandRoleIndex];

    // Check if role is already full
    if (role.filledSlots >= role.maxSlots) {
      throw new Error(`The role "${role.role}" is already full`);
    }

    // Check if user already applied
    if (role.applicants.includes(musician._id)) {
      throw new Error("You have already applied for this role");
    }

    // Check if user is already booked for this role
    if (role.bookedUsers.includes(musician._id)) {
      throw new Error("You are already booked for this role");
    }

    // Create updated band category - add user to applicants
    const updatedBandCategory = [...gig.bandCategory];
    updatedBandCategory[bandRoleIndex] = {
      ...role,
      applicants: [...role.applicants, musician._id],
    };

    // Create band booking history entry for application
    const bandBookingEntry = {
      bandRole: role.role,
      bandRoleIndex,
      userId: musician._id,
      userName: musician.firstname || musician.username || "Musician",
      appliedAt: Date.now(),
      applicationNotes: applicationNotes || "",
      applicationStatus: "pending_review" as const,
    };

    // Create regular booking history entry
    const applicationEntry = {
      entryId: `${gigId}_${bandRoleIndex}_${musician._id}_${Date.now()}`,
      timestamp: Date.now(),
      userId: musician._id,
      userRole: "musician",
      bandRole: role.role,
      bandRoleIndex,
      isBandRole: true,
      status: "applied" as const,
      gigType: "band" as const,
      actionBy: musician._id,
      actionFor: musician._id,
      notes: applicationNotes,
      metadata: {
        roleDescription: role.description,
        requiredSkills: role.requiredSkills,
      },
    };

    // Update gig
    await ctx.db.patch(gigId, {
      bandCategory: updatedBandCategory,
      bookingHistory: [...(gig.bookingHistory || []), applicationEntry],
      bandBookingHistory: [...(gig.bandBookingHistory || []), bandBookingEntry],
      updatedAt: Date.now(),
    });

    // NOTIFY BAND CREATOR
    const bandCreator = await ctx.db.get(gig.postedBy);
    if (bandCreator) {
      await createNotificationInternal(ctx, {
        userDocumentId: gig.postedBy,
        type: "gig_application",
        title: "🎵 New Band Role Application",
        message: `${musician.firstname || musician.username} applied for ${role.role}`,
        image: musician.picture,
        actionUrl: `/gigs/${gigId}`,
        relatedUserDocumentId: musician._id,
        metadata: {
          gigId,
          gigTitle: gig.title,
          role: role.role,
          bandRoleIndex,
          applicationNotes,
        },
      });
    }

    return { success: true };
  },
});

// COMPLETE BAND PAYMENT (Mark payment as completed)
export const completeBandPayment = mutation({
  args: {
    gigId: v.id("gigs"),
    userId: v.id("users"),
    bandRoleIndex: v.number(),
    clerkId: v.string(), // Client's Clerk ID
    paymentAmount: v.number(),
    paymentDate: v.number(),
  },
  handler: async (ctx, args) => {
    const {
      gigId,
      userId,
      bandRoleIndex,
      clerkId,
      paymentAmount,
      paymentDate,
    } = args;

    // Get client user from Clerk ID
    const clientUser = await getUserByClerkId(ctx, clerkId);
    if (!clientUser) throw new Error("Client not found");

    const gig = await ctx.db.get(gigId);
    if (!gig) throw new Error("Gig not found");

    // Verify this is a band gig
    if (!gig.isClientBand || gig.bussinesscat !== "other") {
      throw new Error("This is not a band gig");
    }

    // Verify caller is band creator
    if (gig.postedBy !== clientUser._id) {
      throw new Error("Only the band creator can mark payments as complete");
    }

    // Get band category and specific role
    if (!gig.bandCategory || !gig.bandCategory[bandRoleIndex]) {
      throw new Error("Invalid band role");
    }

    const role = gig.bandCategory[bandRoleIndex];

    // Check if user is booked for this role
    if (!role.bookedUsers.includes(userId)) {
      throw new Error("User is not booked for this role");
    }

    const bandBookingEntry = {
      bandRole: role.role,
      bandRoleIndex,
      userId,
      userName: "Musician", // Would need to fetch user name
      appliedAt: Date.now(), // ADD THIS
      applicationStatus: "pending_review" as const, // ADD THIS
      paymentStatus: "paid" as const,
      paymentAmount,
      paymentDate,
      completedAt: Date.now(),
      completionNotes: "Payment completed",
    };

    // Create regular booking history entry
    const paymentEntry = {
      entryId: `${gigId}_${bandRoleIndex}_${userId}_${Date.now()}`,
      timestamp: Date.now(),
      userId,
      userRole: "musician",
      bandRole: role.role,
      bandRoleIndex,
      isBandRole: true,
      status: "completed" as const,
      gigType: "band" as const,
      actionBy: clientUser._id,
      actionFor: userId,
      reason: "Payment completed",
      metadata: {
        paymentAmount,
        paymentDate,
        bookedPrice: role.bookedPrice || role.price,
      },
    };

    // Add to band booking history
    await ctx.db.patch(gigId, {
      bookingHistory: [...(gig.bookingHistory || []), paymentEntry],
      bandBookingHistory: [...(gig.bandBookingHistory || []), bandBookingEntry],
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
