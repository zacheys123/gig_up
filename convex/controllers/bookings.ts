// convex/bookings.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { createNotificationInternal } from "../createNotificationInternal";
import { updateUserTrust } from "../trustHelper";

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
// musician leaves the applicants array for a specific role - USING CONVEX IDs
export const withdrawFromBandRole = mutation({
  args: {
    gigId: v.id("gigs"),
    bandRoleIndex: v.number(),
    userId: v.id("users"), // Use Convex user ID instead of Clerk ID
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { gigId, bandRoleIndex, userId, reason } = args;

    // Get musician directly by Convex ID
    const musician = await ctx.db.get(userId);
    if (!musician) throw new Error("Musician not found");

    const gig = await ctx.db.get(gigId);
    if (!gig) throw new Error("Gig not found");

    if (!gig.bandCategory || !gig.bandCategory[bandRoleIndex]) {
      throw new Error("Invalid band role");
    }

    const role = gig.bandCategory[bandRoleIndex];
    const isBooked = role.bookedUsers.includes(userId);
    const isApplicant = role.applicants.includes(userId);

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
      const newBookedUsers = role.bookedUsers.filter((id) => id !== userId);
      const newApplicants = role.applicants.filter((id) => id !== userId);

      updatedBandCategory[bandRoleIndex] = {
        ...role,
        filledSlots: Math.max(0, role.filledSlots - 1),
        bookedUsers: newBookedUsers,
        applicants: newApplicants,
        // Update currentApplicants counter
        currentApplicants: newApplicants.length,
      };

      notificationType = "band_member_left";
      title = "🎵 Band Member Left";
      message = `${musician.firstname || musician.username} left as ${role.role}`;

      bandBookingEntry = {
        bandRole: role.role,
        bandRoleIndex,
        userId: userId,
        userName: musician.firstname || musician.username || "Musician",
        appliedAt: Date.now(),
        applicationStatus: "withdrawn" as const,
        bookedAt: Date.now(),
        bookedBy: userId,
        bookedPrice: role.bookedPrice || role.price,
        completedAt: Date.now(),
        completionNotes: reason || "Left the band",
        paymentStatus: "cancelled" as const,
      };

      bookingEntry = {
        entryId: `${gigId}_${bandRoleIndex}_${userId}_${Date.now()}`,
        timestamp: Date.now(),
        userId: userId,
        userRole: "musician",
        bandRole: role.role,
        bandRoleIndex,
        status: "cancelled" as const,
        gigType: "band" as const,
        actionBy: userId,
        actionFor: userId,
        reason: reason || "Left the band",
        metadata: {
          action: "left_band",
          wasBooked: true,
          bookedPrice: role.bookedPrice || role.price,
          previousApplicantsCount: role.applicants.length,
          newApplicantsCount: newApplicants.length,
        },
      };
    } else {
      // CASE 2: APPLICANT WITHDRAWING (ONLY IN applicants, NOT bookedUsers)
      const newApplicants = role.applicants.filter((id) => id !== userId);

      updatedBandCategory[bandRoleIndex] = {
        ...role,
        applicants: newApplicants,
        // Update currentApplicants counter
        currentApplicants: newApplicants.length,
        // bookedUsers remains unchanged
      };

      notificationType = "interest_removed";
      title = "🔄 Application Withdrawn";
      message = `${musician.firstname || musician.username} withdrew their application for ${role.role}`;

      bandBookingEntry = {
        bandRole: role.role,
        bandRoleIndex,
        userId: userId,
        userName: musician.firstname || musician.username || "Musician",
        appliedAt: Date.now(),
        applicationStatus: "withdrawn" as const,
        applicationNotes: reason || "Withdrew application",
      };

      bookingEntry = {
        entryId: `${gigId}_${bandRoleIndex}_${userId}_${Date.now()}`,
        timestamp: Date.now(),
        userId: userId,
        userRole: "musician",
        bandRole: role.role,
        bandRoleIndex,
        status: "cancelled" as const,
        gigType: "band" as const,
        actionBy: userId,
        actionFor: userId,
        reason: reason || "Withdrew application for band role",
        metadata: {
          action: "application_withdrawn",
          wasBooked: false,
          previousApplicantsCount: role.applicants.length,
          newApplicantsCount: newApplicants.length,
          maxApplicants: role.maxApplicants || 50,
        },
      };
    }

    // Update gig
    await ctx.db.patch(gigId, {
      bandCategory: updatedBandCategory,
      bookingHistory: [...(gig.bookingHistory || []), bookingEntry],
      bandBookingHistory: [...(gig.bandBookingHistory || []), bandBookingEntry],
      updatedAt: Date.now(),
      // Reset gig status if a booked musician leaves
      ...(isBooked && {
        isTaken: false,
        isPending: false,
      }),
    });

    // NOTIFY BAND CREATOR
    const bandCreator = await ctx.db.get(gig.postedBy);
    if (bandCreator) {
      const newApplicantsCount =
        updatedBandCategory[bandRoleIndex].applicants.length;
      const maxApplicants = role.maxApplicants || 50;

      await createNotificationInternal(ctx, {
        userDocumentId: gig.postedBy,
        type: notificationType,
        title,
        message: `${message} (${newApplicantsCount}/${maxApplicants} applicants remaining)`,
        image: musician.picture,
        actionUrl: `/gigs/${gigId}/band-applicants`,
        relatedUserDocumentId: userId,
        metadata: {
          gigId,
          gigTitle: gig.title,
          role: role.role,
          bandRoleIndex,
          reason: reason || "",
          wasBooked: isBooked,
          previousApplicantsCount: role.applicants.length,
          newApplicantsCount: newApplicantsCount,
          maxApplicants: maxApplicants,
          // If a slot opened up by a booked musician leaving
          ...(isBooked && {
            openedSlot: true,
            availableSlots: Math.max(
              0,
              role.maxSlots -
                updatedBandCategory[bandRoleIndex].bookedUsers.length
            ),
          }),
        },
      });
    }

    return {
      success: true,
      wasBooked: isBooked,
      newApplicantsCount: updatedBandCategory[bandRoleIndex].applicants.length,
      maxApplicants: role.maxApplicants || 50,
      role: role.role,
      // Return if a slot opened up (useful for UI updates)
      openedSlot: isBooked,
      availableSlots: isBooked
        ? Math.max(
            0,
            role.maxSlots -
              updatedBandCategory[bandRoleIndex].bookedUsers.length
          )
        : undefined,
    };
  },
});

export const removeApplicantFromRole = mutation({
  args: {
    gigId: v.id("gigs"),
    bandRoleIndex: v.number(),
    userId: v.id("users"),
    reason: v.optional(v.string()),
    clientUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const gig = await ctx.db.get(args.gigId);
    if (!gig) throw new Error("Gig not found");

    if (!gig.bandCategory || !gig.bandCategory[args.bandRoleIndex]) {
      throw new Error("Invalid band role");
    }

    const role = gig.bandCategory[args.bandRoleIndex];

    // Check if user is an applicant
    if (!role.applicants.includes(args.userId)) {
      throw new Error("User is not an applicant for this role");
    }

    // Remove from applicants
    const newApplicants = role.applicants.filter((id) => id !== args.userId);

    const updatedBandCategory = [...gig.bandCategory];
    updatedBandCategory[args.bandRoleIndex] = {
      ...role,
      applicants: newApplicants,
      currentApplicants: newApplicants.length, // Update counter
    };

    // Add to history
    const removalEntry = {
      entryId: `${args.gigId}_${args.bandRoleIndex}_${args.userId}_${Date.now()}`,
      timestamp: Date.now(),
      userId: args.userId,
      userRole: "musician",
      bandRole: role.role,
      bandRoleIndex: args.bandRoleIndex,
      status: "rejected" as const,
      gigType: "band" as const,
      actionBy: args.clientUserId, // Client who removed them
      actionFor: args.userId,
      reason: args.reason || "Removed by band leader",
      metadata: {
        action: "applicant_removed",
        previousApplicantsCount: role.applicants.length,
        newApplicantsCount: newApplicants.length,
        maxApplicants: role.maxApplicants || 50,
      },
    };

    await ctx.db.patch(args.gigId, {
      bandCategory: updatedBandCategory,
      bookingHistory: [...(gig.bookingHistory || []), removalEntry],
      updatedAt: Date.now(),
    });

    // Notify the removed musician
    const musician = await ctx.db.get(args.userId);
    if (musician) {
      await createNotificationInternal(ctx, {
        userDocumentId: args.userId,
        type: "application_removed",
        title: "📝 Application Removed",
        message: `Your application for ${role.role} in "${gig.title}" was removed by the band leader`,
        actionUrl: `/gigs/${args.gigId}`,
        metadata: {
          gigId: args.gigId,
          gigTitle: gig.title,
          role: role.role,
          reason: args.reason,
        },
      });
    }

    return {
      success: true,
      removedUserId: args.userId,
      newApplicantsCount: newApplicants.length,
      maxApplicants: role.maxApplicants || 50,
    };
  },
});
// APPLY FOR BAND ROLE (Musician applies) - USING CONVEX USER IDs
export const applyForBandRole = mutation({
  args: {
    gigId: v.id("gigs"),
    bandRoleIndex: v.number(),
    userId: v.id("users"), // Use Convex user ID directly
    applicationNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { gigId, bandRoleIndex, userId, applicationNotes } = args;

    // Get musician user directly by Convex ID
    const musician = await ctx.db.get(userId);
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

    console.log("  Role applicants before:", role.applicants);
    console.log("  Role bookedUsers before:", role.bookedUsers);

    // Check if role is locked
    if (role.isLocked) {
      throw new Error(
        `The role "${role.role}" is no longer accepting applications`
      );
    }

    // Check if role is already full (all slots booked)
    if (role.filledSlots >= role.maxSlots) {
      throw new Error(
        `The role "${role.role}" is already full (all ${role.maxSlots} slots booked)`
      );
    }

    // CHECK MAX APPLICANTS - NEW LOGIC
    const maxApplicants = role.maxApplicants || 50; // Default to 50 if not set
    const currentApplicantsCount = role.applicants.length;

    if (currentApplicantsCount >= maxApplicants) {
      throw new Error(
        `This role has reached the maximum number of applicants (${maxApplicants}). ` +
          `Please try another role or check back later.`
      );
    }

    // Check if user already applied (using Convex user ID)
    if (role.applicants.includes(userId)) {
      console.log("  User already applied with ID:", userId);
      throw new Error("You have already applied for this role");
    }

    // Check if user is already booked for this role
    if (role.bookedUsers.includes(userId)) {
      console.log("  User already booked with ID:", userId);
      throw new Error("You are already booked for this role");
    }

    // Create updated band category - add user to applicants
    const updatedBandCategory = [...gig.bandCategory];
    updatedBandCategory[bandRoleIndex] = {
      ...role,
      applicants: [...role.applicants, userId], // Store Convex user ID
      // Update currentApplicants count
      currentApplicants: currentApplicantsCount + 1,
    };

    console.log(
      "  Role applicants after:",
      updatedBandCategory[bandRoleIndex].applicants
    );
    console.log(
      "  Current applicants count:",
      updatedBandCategory[bandRoleIndex].currentApplicants
    );

    // Create band booking history entry for application
    const bandBookingEntry = {
      bandRole: role.role,
      bandRoleIndex,
      userId: userId, // Store Convex user ID
      userName: musician.firstname || musician.username || "Musician",
      appliedAt: Date.now(),
      applicationNotes: applicationNotes || "",
      applicationStatus: "pending_review" as const,
    };

    // Create regular booking history entry
    const applicationEntry = {
      entryId: `${gigId}_${bandRoleIndex}_${userId}_${Date.now()}`,
      timestamp: Date.now(),
      userId: userId,
      userRole: "musician",
      bandRole: role.role,
      bandRoleIndex,
      status: "applied" as const,
      gigType: "band" as const,
      actionBy: userId,
      actionFor: userId,
      notes: applicationNotes,
      metadata: {
        roleDescription: role.description,
        requiredSkills: role.requiredSkills,
        maxApplicants: maxApplicants,
        currentApplicantsCount: currentApplicantsCount + 1,
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
        message: `${musician.firstname || musician.username} applied for ${role.role} (${currentApplicantsCount + 1}/${maxApplicants} applicants)`,
        image: musician.picture,
        actionUrl: `/gigs/${gigId}/band-applicants`,
        relatedUserDocumentId: userId,
        metadata: {
          gigId,
          gigTitle: gig.title,
          role: role.role,
          bandRoleIndex,
          applicationNotes,
          applicantsCount: currentApplicantsCount + 1,
          maxApplicants: maxApplicants,
          isFull: currentApplicantsCount + 1 >= maxApplicants,
        },
      });
    }

    return {
      success: true,
      userId: userId,
      applicantsCount: currentApplicantsCount + 1,
      maxApplicants: maxApplicants,
      isRoleFull: currentApplicantsCount + 1 >= maxApplicants,
    };
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

// BOOK FOR BAND ROLE (Client books a musician for a role)
export const bookForBandRole = mutation({
  args: {
    gigId: v.id("gigs"),
    userId: v.id("users"), // Musician to book
    bandRoleIndex: v.number(),
    clerkId: v.string(), // Client's Clerk ID
    bookedPrice: v.optional(v.number()),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { gigId, userId, bandRoleIndex, clerkId, bookedPrice, reason } = args;

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
      throw new Error("Only the band creator can book musicians");
    }

    // Get band category and specific role
    if (!gig.bandCategory || !gig.bandCategory[bandRoleIndex]) {
      throw new Error("Invalid band role");
    }

    const role = gig.bandCategory[bandRoleIndex];

    // Get musician details
    const musician = await ctx.db.get(userId);
    if (!musician) throw new Error("Musician not found");

    // Check if role is already full
    if (role.filledSlots >= role.maxSlots) {
      throw new Error(`The role "${role.role}" is already full`);
    }

    // Check if user is already booked for this role
    if (role.bookedUsers.includes(userId)) {
      throw new Error("User is already booked for this role");
    }

    // Check if user has applied for this role (optional, but good practice)
    const hasApplied = role.applicants.includes(userId);
    if (!hasApplied) {
      console.warn(
        `User ${userId} has not applied for role ${role.role}, but booking anyway`
      );
    } // Create updated band category - move user from applicants to bookedUsers
    const updatedBandCategory = [...gig.bandCategory];
    const allRolesFilled = updatedBandCategory.every(
      (r) => r.filledSlots >= r.maxSlots
    );
    // Calculate final price (use provided price or role price)
    const finalPrice = bookedPrice || role.price || 0;

    updatedBandCategory[bandRoleIndex] = {
      ...role,
      filledSlots: (role.filledSlots || 0) + 1,
      bookedUsers: [...role.bookedUsers, userId],
      applicants: role.applicants.filter((id) => id !== userId), // Remove from applicants
      bookedPrice: finalPrice,
    };

    // Create band booking history entry for booking
    const bandBookingEntry = {
      bandRole: role.role,
      bandRoleIndex,
      userId,
      userName: musician.firstname || musician.username || "Musician",
      appliedAt: Date.now(),
      applicationStatus: "pending_review" as const,
      bookedAt: Date.now(),

      bookedPrice: finalPrice,
      contractSigned: false,
    };

    // Create regular booking history entry
    const bookingEntry = {
      entryId: `${gigId}_${bandRoleIndex}_${userId}_${Date.now()}`,
      timestamp: Date.now(),
      userId,
      userRole: "musician",
      bandRole: role.role,
      bandRoleIndex,
      status: "booked" as const,
      gigType: "band" as const,
      proposedPrice: role.price,
      agreedPrice: finalPrice,
      currency: role.currency,
      actionBy: clientUser._id,
      actionFor: userId,
      notes: reason || "Booked for band role",
      metadata: {
        wasApplicant: hasApplied,
        clientName: clientUser.firstname || clientUser.username,
        clientEmail: clientUser.email,
      },
    };

    // Update gig
    await ctx.db.patch(gigId, {
      bandCategory: updatedBandCategory,
      bookingHistory: [...(gig.bookingHistory || []), bookingEntry],
      bandBookingHistory: [...(gig.bandBookingHistory || []), bandBookingEntry],
      updatedAt: Date.now(),
      ...(allRolesFilled && {
        isTaken: true,
        isPending: false,
      }),
      isPending: allRolesFilled,
      ...(allRolesFilled && {
        isTaken: true,
        isActive: true,
      }),
    });

    // NOTIFY MUSICIAN THAT THEY'VE BEEN BOOKED
    await createNotificationInternal(ctx, {
      userDocumentId: userId,
      type: "band_booking", // Using your notification type
      title: "🎉 You've Been Booked!",
      message: `You've been booked as ${role.role} for "${gig.title}"`,
      image: clientUser.picture,
      actionUrl: `/gigs/${gigId}`,
      relatedUserDocumentId: clientUser._id,
      metadata: {
        gigId,
        gigTitle: gig.title,
        role: role.role,
        bandRoleIndex,
        bookedPrice: finalPrice,
        clientName: clientUser.firstname || clientUser.username,
        reason: reason || "",
      },
    });

    // Also send a notification to the client (optional)
    await createNotificationInternal(ctx, {
      userDocumentId: clientUser._id,
      type: "gig_approved", // Or create a new type like "booking_confirmed"
      title: "✅ Musician Booked",
      message: `You've booked ${musician.firstname || musician.username} as ${role.role}`,
      image: musician.picture,
      actionUrl: `/gigs/${gigId}/manage`,
      relatedUserDocumentId: userId,
      metadata: {
        gigId,
        gigTitle: gig.title,
        role: role.role,
        musicianName: musician.firstname || musician.username,
        bookedPrice: finalPrice,
      },
    });
    // Update trust scores for both parties
    try {
      // Update musician's trust score (completed gig)
      await updateUserTrust(ctx, musician?._id);

      // Update client's trust score (successful booking)
      await updateUserTrust(ctx, clientUser._id);
    } catch (error) {
      console.error("Failed to update trust scores:", error);
    }

    return {
      success: true,
      booked: {
        userId,
        musicianName: musician.firstname || musician.username,
        role: role.role,
        price: finalPrice,
      },
      gigStatus: allRolesFilled ? "fully_booked" : "partially_booked",
      remainingSlots: role.maxSlots - role.filledSlots - 1,
    };
  },
});

// OPTIONAL: Add a mutation to unbook/move back to applicants
export const unbookFromBandRole = mutation({
  args: {
    gigId: v.id("gigs"),
    userId: v.id("users"),
    bandRoleIndex: v.number(),
    clerkId: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { gigId, userId, bandRoleIndex, clerkId, reason } = args;

    const clientUser = await getUserByClerkId(ctx, clerkId);
    if (!clientUser) throw new Error("Client not found");

    const gig = await ctx.db.get(gigId);
    if (!gig) throw new Error("Gig not found");

    if (!gig.isClientBand || gig.bussinesscat !== "other") {
      throw new Error("This is not a band gig");
    }

    if (gig.postedBy !== clientUser._id) {
      throw new Error("Only the band creator can unbook musicians");
    }

    if (!gig.bandCategory || !gig.bandCategory[bandRoleIndex]) {
      throw new Error("Invalid band role");
    }

    const role = gig.bandCategory[bandRoleIndex];
    const musician = await ctx.db.get(userId);
    if (!musician) throw new Error("Musician not found");

    if (!role.bookedUsers.includes(userId)) {
      throw new Error("User is not booked for this role");
    }

    // Move user from bookedUsers back to applicants
    const updatedBandCategory = [...gig.bandCategory];
    updatedBandCategory[bandRoleIndex] = {
      ...role,
      filledSlots: Math.max(0, (role.filledSlots || 0) - 1),
      bookedUsers: role.bookedUsers.filter((id) => id !== userId),
      applicants: [...role.applicants, userId], // Add back to applicants
    };

    const bandBookingEntry = {
      bandRole: role.role,
      bandRoleIndex,
      userId,
      userName: musician.firstname || musician.username || "Musician",
      appliedAt: Date.now(),
      applicationStatus: "pending_review" as const,
      bookedAt: Date.now(),
      bookedBy: clientUser._id,
      bookedPrice: role.bookedPrice || role.price,
      completedAt: Date.now(),
      completionNotes: reason || "Unbooked by client",
      paymentStatus: "cancelled" as const,
    };

    const unbookingEntry = {
      entryId: `${gigId}_${bandRoleIndex}_${userId}_${Date.now()}`,
      timestamp: Date.now(),
      userId,
      userRole: "musician",
      bandRole: role.role,
      bandRoleIndex,
      status: "cancelled" as const,
      gigType: "band" as const,
      actionBy: clientUser._id,
      actionFor: userId,
      reason: reason || "Unbooked from role",
      metadata: {
        previousPrice: role.bookedPrice || role.price,
        movedBackToApplicants: true,
      },
    };

    await ctx.db.patch(gigId, {
      bandCategory: updatedBandCategory,
      bookingHistory: [...(gig.bookingHistory || []), unbookingEntry],
      bandBookingHistory: [...(gig.bandBookingHistory || []), bandBookingEntry],
      updatedAt: Date.now(),
      isTaken: false,
      isPending: false,
    });

    // Notify musician
    await createNotificationInternal(ctx, {
      userDocumentId: userId,
      type: "band_member_removed", // Using existing type
      title: "⚠️ Booking Cancelled",
      message: `Your booking as ${role.role} for "${gig.title}" has been cancelled`,
      actionUrl: `/gigs/${gigId}`,
      relatedUserDocumentId: clientUser._id,
      metadata: {
        gigId,
        gigTitle: gig.title,
        role: role.role,
        reason: reason || "",
      },
    });

    return { success: true };
  },
});
