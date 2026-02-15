// convex/bookings.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { createNotificationInternal } from "../createNotificationInternal";
import { applyTrustScoreUpdate, updateUserTrust } from "../trustHelper";

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
    try {
      const { gigId, bandRoleIndex, userId, reason } = args;

      // Get musician directly by Convex ID
      const musician = await ctx.db.get(userId);
      if (!musician) throw new Error("MUSICIAN_NOT_FOUND:Musician not found");

      const gig = await ctx.db.get(gigId);
      if (!gig) throw new Error("GIG_NOT_FOUND:Gig not found");

      if (!gig.bandCategory || !gig.bandCategory[bandRoleIndex]) {
        throw new Error("INVALID_ROLE:Invalid band role");
      }

      const role = gig.bandCategory[bandRoleIndex];
      const isBooked = role.bookedUsers.includes(userId);
      const isApplicant = role.applicants.includes(userId);

      if (!isBooked && !isApplicant) {
        throw new Error("NOT_ASSOCIATED:You're not associated with this role");
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
        bandBookingHistory: [
          ...(gig.bandBookingHistory || []),
          bandBookingEntry,
        ],
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
                  updatedBandCategory[bandRoleIndex].bookedUsers.length,
              ),
            }),
          },
        });
      }

      return {
        success: true,
        wasBooked: isBooked,
        newApplicantsCount:
          updatedBandCategory[bandRoleIndex].applicants.length,
        maxApplicants: role.maxApplicants || 50,
        role: role.role,
        // Return if a slot opened up (useful for UI updates)
        openedSlot: isBooked,
        availableSlots: isBooked
          ? Math.max(
              0,
              role.maxSlots -
                updatedBandCategory[bandRoleIndex].bookedUsers.length,
            )
          : undefined,
      };
    } catch (error: any) {
      console.error("Error in withdrawFromBandRole:", error);

      // Re-throw structured errors
      if (
        error.message.startsWith("MUSICIAN_NOT_FOUND:") ||
        error.message.startsWith("GIG_NOT_FOUND:") ||
        error.message.startsWith("INVALID_ROLE:") ||
        error.message.startsWith("NOT_ASSOCIATED:")
      ) {
        throw error;
      }

      // Wrap unexpected errors
      throw new Error(
        `UNKNOWN_ERROR:${error.message || "Unknown withdrawal error"}`,
      );
    }
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

    // 🔴 FIX: Define these variables before using them
    const userInstrument = musician.instrument?.toLowerCase() || "";
    const userRoleType = musician.roleType?.toLowerCase() || "";
    const roleName = role.role.toLowerCase();

    // Check if user's instrument matches the role requirements
    const canUserApplyForRole = (
      roleName: string,
      userInstrument: string,
      userRoleType: string,
    ): boolean => {
      // Mapping of roles to possible instrument keywords
      const roleMappings = {
        vocalist: ["vocals", "vocalist", "singer", "vocal"],
        vocal: ["vocals", "vocalist", "singer", "vocal"],
        singer: ["vocals", "vocalist", "singer", "vocal"],
        pianist: ["piano", "pianist", "keyboard", "keys"],
        piano: ["piano", "pianist", "keyboard", "keys"],
        keyboardist: ["keyboard", "keys", "piano", "pianist"],
        keyboard: ["keyboard", "keys", "piano", "pianist"],
        guitarist: ["guitar", "guitarist"],
        guitar: ["guitar", "guitarist"],
        bassist: ["bass", "bassist"],
        bass: ["bass", "bassist"],
        drummer: ["drums", "drummer", "percussion"],
        drums: ["drums", "drummer", "percussion"],
        percussionist: ["percussion", "drums", "drummer"],
        percussion: ["percussion", "drums", "drummer"],
        saxophonist: ["saxophone", "sax", "saxophonist"],
        sax: ["saxophone", "sax", "saxophonist"],
        saxophone: ["saxophone", "sax", "saxophonist"],
        violinist: ["violin", "violinist"],
        violin: ["violin", "violinist"],
        cellist: ["cello", "cellist"],
        cello: ["cello", "cellist"],
        trumpet: ["trumpet", "trumpeter"],
        trumpeter: ["trumpet", "trumpeter"],
        dj: ["dj", "disc jockey"],
        mc: ["mc", "emcee", "master of ceremonies"],
      };

      // Check direct match
      if (
        userInstrument.includes(roleName) ||
        userRoleType.includes(roleName)
      ) {
        return true;
      }

      // Check role mappings
      const mappings = roleMappings[roleName as keyof typeof roleMappings];
      if (mappings) {
        return mappings.some(
          (keyword) =>
            userInstrument.includes(keyword) || userRoleType.includes(keyword),
        );
      }

      // If no specific validation, allow application
      return true;
    };

    // 🔴 FIX: Call the function with the defined variables
    if (!canUserApplyForRole(roleName, userInstrument, userRoleType)) {
      const userDisplay =
        userInstrument || userRoleType || "no specified instrument/role";
      throw new Error(
        `You cannot apply for the "${role.role}" role. ` +
          `This role requires skills/instruments related to "${role.role}". ` +
          `Your profile shows: ${userDisplay}. ` +
          `Please update your profile or apply for a different role.`,
      );
    }

    // Check if role is locked
    if (role.isLocked) {
      throw new Error(
        `The role "${role.role}" is no longer accepting applications`,
      );
    }

    // Check if role is already full (all slots booked)
    if (role.filledSlots >= role.maxSlots) {
      throw new Error(
        `The role "${role.role}" is already full (all ${role.maxSlots} slots booked)`,
      );
    }

    // CHECK MAX APPLICANTS - NEW LOGIC
    const maxApplicants = role.maxApplicants || 50; // Default to 50 if not set
    const currentApplicantsCount = role.applicants.length;

    if (currentApplicantsCount >= maxApplicants) {
      throw new Error(
        `This role has reached the maximum number of applicants (${maxApplicants}). ` +
          `Please try another role or check back later.`,
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
      updatedBandCategory[bandRoleIndex].applicants,
    );
    console.log(
      "  Current applicants count:",
      updatedBandCategory[bandRoleIndex].currentApplicants,
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
export const bookForBandRole = mutation({
  args: {
    gigId: v.id("gigs"),
    userId: v.id("users"),
    bandRoleIndex: v.number(),
    clerkId: v.string(),
    bookedPrice: v.optional(v.number()),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { gigId, userId, bandRoleIndex, clerkId, bookedPrice, reason } = args;

    try {
      // Get client user from Clerk ID
      const clientUser = await getUserByClerkId(ctx, clerkId);
      if (!clientUser) {
        throw new Error(
          "CLIENT_NOT_FOUND: Your account was not found. Please sign in again.",
        );
      }

      const gig = await ctx.db.get(gigId);
      if (!gig) {
        throw new Error(
          "GIG_NOT_FOUND: This gig does not exist or has been deleted.",
        );
      }

      // Verify this is a band gig
      if (!gig.isClientBand || gig.bussinesscat !== "other") {
        throw new Error(
          "NOT_BAND_GIG: This is not a band gig. Booking is only available for band roles.",
        );
      }

      // Verify caller is band creator
      if (gig.postedBy !== clientUser._id) {
        throw new Error(
          "PERMISSION_DENIED: Only the band creator can book musicians.",
        );
      }

      // Get band category and specific role
      if (!gig.bandCategory || !gig.bandCategory[bandRoleIndex]) {
        throw new Error(
          "INVALID_ROLE: This band role does not exist. Please refresh the page.",
        );
      }

      const role = gig.bandCategory[bandRoleIndex];

      if (role.filledSlots >= role.maxSlots) {
        throw new Error(
          `ROLE_FULL:${role.role}:${role.filledSlots}:${role.maxSlots}`,
        );
      }

      // Get musician details
      const musician = await ctx.db.get(userId);
      if (!musician) {
        throw new Error(
          "MUSICIAN_NOT_FOUND: This musician profile could not be found.",
        );
      }

      // Check if user is already booked for this role
      if (role.bookedUsers.includes(userId)) {
        throw new Error(
          "ALREADY_BOOKED: This musician is already booked for this role.",
        );
      }

      // Check if user has applied for this role
      const hasApplied = role.applicants.includes(userId);
      if (!hasApplied) {
        console.warn(
          `User ${userId} has not applied for role ${role.role}, but booking anyway`,
        );
      }

      // Create updated band category - move user from applicants to bookedUsers
      const updatedBandCategory = [...gig.bandCategory];
      updatedBandCategory[bandRoleIndex] = {
        ...role,
        filledSlots: (role.filledSlots || 0) + 1,
        bookedUsers: [...role.bookedUsers, userId],
        applicants: role.applicants.filter((id) => id !== userId),
        bookedPrice: bookedPrice || role.price || 0,
        currentApplicants: Math.max(0, role.applicants.length - 1),
      };

      // Check if all roles are now filled
      const allRolesFilled = updatedBandCategory.every(
        (r) => r.filledSlots >= r.maxSlots,
      );

      // Calculate final price
      const finalPrice = bookedPrice || role.price || 0;
      const now = Date.now();

      const bandBookingEntry = {
        bandRole: role.role,
        bandRoleIndex,
        userId,
        userName: musician.firstname || musician.username || "Musician",
        appliedAt: Date.now(),
        applicationStatus: "accepted" as const,
        applicationNotes: reason || `Booked as ${role.role}`,
        bookedAt: Date.now(),
        bookedPrice: finalPrice,
        contractSigned: false,
        paymentStatus: "pending" as const,
      };

      // Create regular booking history entry
      const bookingEntry = {
        entryId: `${gigId}_${bandRoleIndex}_${userId}_${now}`,
        timestamp: now,
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
        notes: reason || `Booked for ${role.role} role`,
        metadata: {
          wasApplicant: hasApplied,
          clientName: clientUser.firstname || clientUser.username,
          clientEmail: clientUser.email,
          musicianName: musician.firstname || musician.username,
          roleFilledSlots: role.filledSlots + 1,
          roleMaxSlots: role.maxSlots,
          allRolesFilled: allRolesFilled,
        },
      };

      // Update gig
      await ctx.db.patch(gigId, {
        bandCategory: updatedBandCategory,
        bookingHistory: [...(gig.bookingHistory || []), bookingEntry],
        bandBookingHistory: [
          ...(gig.bandBookingHistory || []),
          bandBookingEntry,
        ],
        updatedAt: now,
        ...(allRolesFilled && {
          isTaken: true,
          isActive: true,
        }),
        isPending: !allRolesFilled,
      });

      // Create booking entries for relationship tracking
      const musicianBookingEntry = {
        clientId: clientUser._id,
        gigId: gig._id,
        date: now,
        ratingReceived: undefined, // Use undefined instead of null
        cancelled: false,
        cancelledAt: undefined,
        cancellationReason: undefined,
        trustPenalty: undefined,
      };

      const clientBookingEntry = {
        musicianId: musician._id,
        gigId: gig._id,
        date: now,
        ratingGiven: undefined, // Use undefined instead of null
        cancelled: false,
        cancelledAt: undefined,
        cancellationReason: undefined,
        trustPenalty: undefined,
      };

      // Update musician - Add to bookedByClientIds (always add when booking)
      const updatedMusicianBookedByClientIds = [
        ...(musician.bookedByClientIds || []),
        clientUser._id,
      ];

      await ctx.db.patch(musician._id, {
        updatedAt: now,
        lastActive: now,
        bookingsCount: (musician.bookingsCount || 0) + 1,
        lastBooking: now,
        bookedByClients: [
          ...(musician.bookedByClients || []),
          musicianBookingEntry,
        ],
        bookedByClientIds: updatedMusicianBookedByClientIds,
      });

      // Update client - Add to bookedMusicianIds (always add when booking)
      const updatedClientBookedMusicianIds = [
        ...(clientUser.bookedMusicianIds || []),
        musician._id,
      ];

      const clientUpdates: any = {
        updatedAt: now,
        lastActive: now,
        hiredCount: (clientUser.hiredCount || 0) + 1,
        lastHired: now,
        bookedMusicians: [
          ...(clientUser.bookedMusicians || []),
          clientBookingEntry,
        ],
        bookedMusicianIds: updatedClientBookedMusicianIds,
      };

      // Update weekly bookings tracking
      if (!clientUser.bookingsThisWeek) {
        clientUpdates.bookingsThisWeek = 1;
      } else {
        clientUpdates.bookingsThisWeek = (clientUser.bookingsThisWeek || 0) + 1;
      }

      await ctx.db.patch(clientUser._id, clientUpdates);

      // NOTIFY MUSICIAN THAT THEY'VE BEEN BOOKED
      await createNotificationInternal(ctx, {
        userDocumentId: userId,
        type: "band_booking",
        title: "🎉 You've Been Booked!",
        message: `Congratulations! You've been booked as ${role.role} for "${gig.title}"`,
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
          clientEmail: clientUser.email,
          reason: reason || "",
          gigDate: gig.date,
          gigLocation: gig.location,
          bookingNumber: (musician.bookingsCount || 0) + 1,
        },
      });

      // Notify the band creator/leader
      await createNotificationInternal(ctx, {
        userDocumentId: clientUser._id,
        type: "musician_booked",
        title: "✅ Musician Booked Successfully",
        message: `You've booked ${musician.firstname || musician.username} as ${role.role} for "${gig.title}" (Your ${(clientUser.hiredCount || 0) + 1} hire)`,
        image: musician.picture,
        actionUrl: `/gigs/${gigId}/manage`,
        relatedUserDocumentId: userId,
        metadata: {
          gigId,
          gigTitle: gig.title,
          role: role.role,
          musicianName: musician.firstname || musician.username,
          bookedPrice: finalPrice,
          remainingSlots: role.maxSlots - (role.filledSlots + 1),
          allRolesFilled: allRolesFilled,
          hireNumber: (clientUser.hiredCount || 0) + 1,
        },
      });

      // Update trust scores using your comprehensive algorithm
      try {
        // Run algorithm for musician (will consider new bookingsCount)
        const musicianTrustResult = await updateUserTrust(ctx, musician._id);

        // Run algorithm for client (will consider new hiredCount)
        const clientTrustResult = await updateUserTrust(ctx, clientUser._id);

        console.log("🎯 Trust algorithm results after booking:", {
          musician: {
            name: musician.firstname,
            previousScore: musician.trustScore || 0,
            newScore: musicianTrustResult.trustScore,
            change: musicianTrustResult.trustScore - (musician.trustScore || 0),
            stars: musicianTrustResult.trustStars,
            tier: musicianTrustResult.tier,
            bookingsCount: (musician.bookingsCount || 0) + 1,
          },
          client: {
            name: clientUser.firstname,
            previousScore: clientUser.trustScore || 0,
            newScore: clientTrustResult.trustScore,
            change: clientTrustResult.trustScore - (clientUser.trustScore || 0),
            stars: clientTrustResult.trustStars,
            tier: clientTrustResult.tier,
            hiredCount: (clientUser.hiredCount || 0) + 1,
          },
          bookingDetails: {
            role: role.role,
            price: finalPrice,
            wasFromApplicants: hasApplied,
          },
        });
      } catch (error) {
        console.error("Failed to update trust scores:", error);
        // Don't fail the whole booking if trust updates fail
      }

      return {
        success: true,
        booked: {
          userId,
          musicianName: musician.firstname || musician.username,
          role: role.role,
          price: finalPrice,
          bookingDate: new Date().toISOString(),
          bookingNumber: (musician.bookingsCount || 0) + 1,
        },
        gigStatus: allRolesFilled ? "fully_booked" : "partially_booked",
        remainingSlots: role.maxSlots - (role.filledSlots + 1),
        totalSlots: role.maxSlots,
        totalRoles: gig.bandCategory.length,
        filledRoles: updatedBandCategory.filter(
          (r) => r.filledSlots >= r.maxSlots,
        ).length,
        metadata: {
          allRolesFilled,
          wasFromApplicants: hasApplied,
          clientName: clientUser.firstname || clientUser.username,
          musicianEmail: musician.email,
          musicianBookingsCount: (musician.bookingsCount || 0) + 1,
          clientHiredCount: (clientUser.hiredCount || 0) + 1,
          trustUpdated: true,
        },
      };
    } catch (error: any) {
      console.error("Error in bookForBandRole:", error);

      if (
        error.message.startsWith("CLIENT_NOT_FOUND") ||
        error.message.startsWith("GIG_NOT_FOUND") ||
        error.message.startsWith("NOT_BAND_GIG") ||
        error.message.startsWith("PERMISSION_DENIED") ||
        error.message.startsWith("INVALID_ROLE") ||
        error.message.startsWith("ROLE_FULL") ||
        error.message.startsWith("MUSICIAN_NOT_FOUND") ||
        error.message.startsWith("ALREADY_BOOKED")
      ) {
        throw error;
      }

      throw new Error(
        "BOOKING_FAILED: Unable to complete booking. Please try again or contact support.",
      );
    }
  },
});
export const unbookFromBandRole = mutation({
  args: {
    gigId: v.id("gigs"),
    userId: v.id("users"),
    bandRoleIndex: v.number(),
    clerkId: v.string(),
    reason: v.optional(v.string()),
    isFromBooked: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { gigId, userId, bandRoleIndex, clerkId, reason, isFromBooked } =
      args;

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

    // ALWAYS check time for penalties when cancelling booked musicians
    const gigDateTime = new Date(gig.date);
    const now = Date.now();
    const hoursDifference = (gigDateTime.getTime() - now) / (1000 * 60 * 60);

    let trustPenaltyApplied = 0;
    let context:
      | "last_minute_band_booking_cancellation"
      | "within_3_days_band_booking_cancellation"
      | "band_gig_cancellation" = "band_gig_cancellation";

    // Apply penalty based on timing
    if (hoursDifference < 24) {
      trustPenaltyApplied = 20;
      context = "last_minute_band_booking_cancellation";
    } else if (hoursDifference < 72) {
      trustPenaltyApplied = 10;
      context = "within_3_days_band_booking_cancellation";
    }

    // DO NOT decrement bookingsCount or hiredCount
    // DO update cancellation count and apply penalty

    if (trustPenaltyApplied > 0) {
      // Update musician's cancellation count
      await ctx.db.patch(musician._id, {
        cancelgigCount: (musician.cancelgigCount || 0) + 1,
        lastCancellation: now,
        updatedAt: now,
      });

      // Apply trust penalty using your algorithm
      await updateUserTrust(ctx, musician._id);

      // Log to trust history WITH metadata
      await ctx.db.insert("trustScoreHistory", {
        userId: userId,
        timestamp: now,
        amount: -trustPenaltyApplied,
        previousScore: musician.trustScore || 0,
        newScore: Math.max(0, (musician.trustScore || 0) - trustPenaltyApplied),
        reason: `Band booking cancelled by client (${hoursDifference < 24 ? "last-minute" : "within 3 days"}): ${gig.title}`,
        context,
        gigId: gig._id,
        actionBy: clientUser._id,
        note: `Cancelled by ${clientUser.firstname || clientUser.username}. Hours until gig: ${Math.floor(hoursDifference)}`,
        metadata: {
          gigTitle: gig.title,
          bandRole: role.role,
          clientName: clientUser.firstname || clientUser.username,
          musicianName: musician.firstname || musician.username,
          hoursUntilGig: Math.floor(hoursDifference),
          cancellationTiming:
            hoursDifference < 24
              ? "last_minute"
              : hoursDifference < 72
                ? "within_3_days"
                : "more_than_3_days",
          penaltyAmount: trustPenaltyApplied,
          cancellationSource: "unbookFromBandRole",
          isFromBookedSection: isFromBooked || false,
          reason: reason || "",
        },
        createdAt: now,
      });
    }

    // Move user from bookedUsers back to applicants
    const updatedBandCategory = [...gig.bandCategory];
    updatedBandCategory[bandRoleIndex] = {
      ...role,
      filledSlots: Math.max(0, (role.filledSlots || 0) - 1),
      bookedUsers: role.bookedUsers.filter((id) => id !== userId),
      applicants: [...role.applicants, userId],
    };

    // Helper function to convert price to number safely
    const getSafeBookedPrice = (): number | undefined => {
      if (role.bookedPrice !== undefined && role.bookedPrice !== null) {
        if (typeof role.bookedPrice === "number") {
          return role.bookedPrice;
        }
        if (typeof role.bookedPrice === "string") {
          const parsed = parseFloat(role.bookedPrice);
          return isNaN(parsed) ? undefined : parsed;
        }
      }
      if (role.price !== undefined && role.price !== null) {
        if (typeof role.price === "number") {
          return role.price;
        }
        if (typeof role.price === "string") {
          const parsed = parseFloat(role.price);
          return isNaN(parsed) ? undefined : parsed;
        }
      }
      return undefined;
    };

    const safeBookedPrice = getSafeBookedPrice();

    // Create band booking history entry
    const bandBookingEntry: any = {
      bandRole: role.role,
      bandRoleIndex,
      userId,
      userName: musician.firstname || musician.username || "Musician",
      appliedAt: Date.now(),
      applicationStatus: "pending_review" as const,
      bookedAt: Date.now(),
      completedAt: now,
      completionNotes: reason || "Unbooked by client",
      paymentStatus: "cancelled" as const,
      trustPenaltyApplied,
      cancelledFrom: "booked_section",
      hoursUntilGig: Math.floor(hoursDifference),
      cancellationReason: reason || "",
    };

    // Only add bookedPrice if we have a valid number
    if (safeBookedPrice !== undefined) {
      bandBookingEntry.bookedPrice = safeBookedPrice;
    }

    const unbookingEntry = {
      entryId: `${gigId}_${bandRoleIndex}_${userId}_${now}`,
      timestamp: now,
      userId,
      userRole: "musician",
      bandRole: role.role,
      bandRoleIndex,
      status: "cancelled" as const,
      gigType: "band" as const,
      actionBy: clientUser._id,
      actionFor: userId,
      reason: reason || "Unbooked from role by client",
      metadata: {
        previousPrice: safeBookedPrice,
        movedBackToApplicants: true,
        clientId: clientUser._id,
        clientName: clientUser.firstname || clientUser.username,
        trustPenaltyApplied,
        cancellationSource: "booked_gigs_page",
        hoursUntilGig: Math.floor(hoursDifference),
        penaltyApplied: trustPenaltyApplied > 0,
        penaltyAmount: trustPenaltyApplied,
        cancellationTiming:
          hoursDifference < 24
            ? "last_minute"
            : hoursDifference < 72
              ? "within_3_days"
              : "more_than_3_days",
        // Track that counts were NOT decremented
        statsPreserved: true,
        bookingsCountPreserved: true,
        hiredCountPreserved: true,
      },
    };

    await ctx.db.patch(gigId, {
      bandCategory: updatedBandCategory,
      bookingHistory: [...(gig.bookingHistory || []), unbookingEntry],
      bandBookingHistory: [...(gig.bandBookingHistory || []), bandBookingEntry],
      updatedAt: now,
      isTaken: false,
      isPending: false,
    });

    // Update the booking relationship arrays to mark as cancelled
    // Update musician's bookedByClients entry
    if (musician.bookedByClients) {
      const updatedBookings = musician.bookedByClients.map((booking: any) => {
        if (booking.gigId === gig._id && booking.clientId === clientUser._id) {
          return {
            ...booking,
            cancelled: true,
            cancelledAt: now,
            cancellationReason: reason || "Cancelled by client",
            trustPenalty: trustPenaltyApplied,
          };
        }
        return booking;
      });

      // Check if musician still has active bookings with this client
      const musicianStillHasActiveBookings = updatedBookings.some(
        (booking) => booking.clientId === clientUser._id && !booking.cancelled,
      );

      const updatedMusicianBookedByClientIds = musicianStillHasActiveBookings
        ? musician.bookedByClientIds || []
        : musician.bookedByClientIds?.filter((id) => id !== clientUser._id) ||
          [];

      await ctx.db.patch(musician._id, {
        bookedByClients: updatedBookings,
        bookedByClientIds: updatedMusicianBookedByClientIds,
        updatedAt: now,
      });
    }

    // Update client's bookedMusicians entry
    if (clientUser.bookedMusicians) {
      const updatedHires = clientUser.bookedMusicians.map((hire: any) => {
        if (hire.gigId === gig._id && hire.musicianId === userId) {
          return {
            ...hire,
            cancelled: true,
            cancelledAt: now,
            cancellationReason: reason || "Cancelled booking",
            trustPenalty: trustPenaltyApplied,
          };
        }
        return hire;
      });

      // Check if client still has active bookings with this musician
      const clientStillHasActiveBookings = updatedHires.some(
        (hiring: any) => hiring.musicianId === userId && !hiring.cancelled,
      );

      const updatedClientBookedMusicianIds = clientStillHasActiveBookings
        ? clientUser.bookedMusicianIds || []
        : clientUser.bookedMusicianIds?.filter((id: any) => id !== userId) ||
          [];

      await ctx.db.patch(clientUser._id, {
        bookedMusicians: updatedHires,
        bookedMusicianIds: updatedClientBookedMusicianIds,
        updatedAt: now,
      });
    }

    // Notify musician
    await createNotificationInternal(ctx, {
      userDocumentId: userId,
      type: "band_member_removed",
      title: "⚠️ Booking Cancelled",
      message: `Your booking as ${role.role} for "${gig.title}" has been cancelled${trustPenaltyApplied > 0 ? ` (-${trustPenaltyApplied} trust score)` : ""}`,
      actionUrl: `/gigs/${gigId}`,
      relatedUserDocumentId: clientUser._id,
      metadata: {
        gigId,
        gigTitle: gig.title,
        role: role.role,
        reason: reason || "",
        clientName: clientUser.firstname || clientUser.username,
        trustPenaltyApplied,
        trustScoreUpdate: trustPenaltyApplied > 0,
        hoursUntilGig: Math.floor(hoursDifference),
        penaltyNotice:
          trustPenaltyApplied > 0
            ? `Trust score decreased by ${trustPenaltyApplied} points due to ${hoursDifference < 24 ? "last-minute" : "within 3 days"} cancellation`
            : "No trust penalty applied",
        // Important: Let user know stats aren't lost
        statsNote: "Your booking history has been preserved.",
      },
    });

    return {
      success: true,
      trustPenaltyApplied,
      hoursUntilGig: Math.floor(hoursDifference),
      cancellationTiming:
        hoursDifference < 24
          ? "last_minute"
          : hoursDifference < 72
            ? "within_3_days"
            : "more_than_3_days",
      musicianPenalty: trustPenaltyApplied,
      updatedTrust: trustPenaltyApplied > 0,
      // Important: Tell frontend counts were NOT changed
      statsPreserved: true,
      message:
        trustPenaltyApplied > 0
          ? `Booking cancelled with ${trustPenaltyApplied} point trust penalty. Booking count preserved.`
          : "Booking cancelled. No trust penalty applied. Booking count preserved.",
    };
  },
});
export const completeBandPayment = mutation({
  args: {
    gigId: v.id("gigs"),
    userId: v.id("users"),
    bandRoleIndex: v.number(),
    clerkId: v.string(),
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

    const clientUser = await getUserByClerkId(ctx, clerkId);
    if (!clientUser) throw new Error("Client not found");

    const gig = await ctx.db.get(gigId);
    if (!gig) throw new Error("Gig not found");

    if (!gig.isClientBand || gig.bussinesscat !== "other") {
      throw new Error("This is not a band gig");
    }

    if (gig.postedBy !== clientUser._id) {
      throw new Error("Only the band creator can mark payments as complete");
    }

    if (!gig.bandCategory || !gig.bandCategory[bandRoleIndex]) {
      throw new Error("Invalid band role");
    }

    const role = gig.bandCategory[bandRoleIndex];

    if (!role.bookedUsers.includes(userId)) {
      throw new Error("User is not booked for this role");
    }

    const bandBookingEntry = {
      bandRole: role.role,
      bandRoleIndex,
      userId,
      userName: "Musician",
      appliedAt: Date.now(),
      applicationStatus: "pending_review" as const,
      paymentStatus: "paid" as const,
      paymentAmount,
      paymentDate,
      completedAt: Date.now(),
      completionNotes: "Payment completed",
    };

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

    await ctx.db.patch(gigId, {
      bookingHistory: [...(gig.bookingHistory || []), paymentEntry],
      bandBookingHistory: [...(gig.bandBookingHistory || []), bandBookingEntry],
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
