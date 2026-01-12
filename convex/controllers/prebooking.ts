// convex/preBooking.ts - UPDATED WITH SHORTLIST SYSTEM

import { v } from "convex/values";
import { mutation, MutationCtx } from "../_generated/server";
import { createNotificationInternal } from "../createNotificationInternal";

// Helper function to create consistent booking entries
const createBookingEntry = (
  gig: any,
  applicantId: any,
  applicantUser: any,
  user: any,
  status:
    | "applied"
    | "shortlisted"
    | "interviewed"
    | "offered"
    | "booked"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "rejected"
    | "updated",
  notes?: string,
  extraFields?: any
) => {
  return {
    entryId: `${gig._id}-${applicantId}-${Date.now()}`,
    timestamp: Date.now(),
    userId: applicantId,
    userRole: applicantUser?.roleType,
    status: status,
    gigType: gig.isClientBand ? "band" : "regular",
    actionBy: user._id,
    actionFor: applicantId,
    notes: notes || "",
    ...extraFields,
  };
};

// Shared logic for adding to shortlist
const addToShortlistLogic = async (
  ctx: any,
  args: { gigId: any; applicantId: any; notes?: string; clerkId: string }
) => {
  // Get current user (client)
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q: any) => q.eq("clerkId", args.clerkId))
    .first();
  if (!user) throw new Error("User not found");

  // Get the gig
  const gig = await ctx.db.get(args.gigId);
  if (!gig) throw new Error("Gig not found");

  // Verify user owns the gig
  if (gig.postedBy !== user._id) throw new Error("Not authorized");

  // Get applicant user
  const applicantUser = await ctx.db.get(args.applicantId);
  if (!applicantUser) throw new Error("Applicant user not found");

  // Check if already in shortlist
  const existingShortlist = gig.shortlistedUsers || [];
  const alreadyShortlisted = existingShortlist.some(
    (item: any) => item.userId === args.applicantId
  );

  if (alreadyShortlisted) {
    // Update existing entry
    const updatedShortlist = existingShortlist.map((item: any) =>
      item.userId === args.applicantId
        ? { ...item, shortlistedAt: Date.now(), notes: args.notes }
        : item
    );

    await ctx.db.patch(args.gigId, {
      shortlistedUsers: updatedShortlist,
    });
  } else {
    // Add new shortlist entry
    const newShortlistEntry = {
      userId: args.applicantId,
      shortlistedAt: Date.now(),
      notes: args.notes,
    };

    await ctx.db.patch(args.gigId, {
      shortlistedUsers: [...existingShortlist, newShortlistEntry],
    });
  }

  // Create booking history entry using the correct status
  const bookingEntry = createBookingEntry(
    gig,
    args.applicantId,
    applicantUser,
    user,
    "shortlisted",
    args.notes || "Added to shortlist"
  );

  await ctx.db.patch(args.gigId, {
    bookingHistory: [...(gig.bookingHistory || []), bookingEntry],
  });

  // Create notification for the musician
  await createNotificationInternal(ctx, {
    userDocumentId: args.applicantId,
    type: "gig_selected",
    title: "⭐ Added to Shortlist!",
    message: `${user.firstname || user.username} added you to their shortlist for "${gig.title}".`,
    actionUrl: `/gigs/${args.gigId}`,
    relatedUserDocumentId: user._id,
  });

  return { success: true };
};

// Add applicant to shortlist

export const addToShortlist = mutation({
  args: {
    gigId: v.id("gigs"),
    applicantId: v.id("users"),
    notes: v.optional(v.string()),
    clerkId: v.string(),
    bandRole: v.optional(v.string()), // Add this
    bandRoleIndex: v.optional(v.number()), // Add this
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
    if (!user) throw new Error("User not found");

    const gig = await ctx.db.get(args.gigId);
    if (!gig) throw new Error("Gig not found");

    if (gig.postedBy !== user._id) throw new Error("Not authorized");

    const applicantUser = await ctx.db.get(args.applicantId);
    if (!applicantUser) throw new Error("Applicant user not found");

    const existingShortlist = gig.shortlistedUsers || [];
    const alreadyShortlisted = existingShortlist.some(
      (item) => item.userId === args.applicantId
    );

    let updatedShortlist;
    let updatedInterestedUsers = gig.interestedUsers || [];

    if (alreadyShortlisted) {
      // Update existing entry
      updatedShortlist = existingShortlist.map((item) =>
        item.userId === args.applicantId
          ? {
              ...item,
              shortlistedAt: Date.now(),
              notes: args.notes,
              bandRole: args.bandRole,
              bandRoleIndex: args.bandRoleIndex,
            }
          : item
      );
    } else {
      // Add new shortlist entry with band role info
      const newShortlistEntry = {
        userId: args.applicantId,
        shortlistedAt: Date.now(),
        notes: args.notes,
        bandRole: args.bandRole, // Include band role
        bandRoleIndex: args.bandRoleIndex, // Include band role index
      };
      updatedShortlist = [...existingShortlist, newShortlistEntry];

      // Remove from interestedUsers
      updatedInterestedUsers = updatedInterestedUsers.filter(
        (userId) => userId !== args.applicantId
      );
    }

    // Create booking history entry
    const bookingEntry = {
      entryId: `${args.gigId}-${args.applicantId}-${Date.now()}`,
      timestamp: Date.now(),
      userId: args.applicantId,
      userRole: applicantUser.roleType,
      status: "shortlisted" as "shortlisted",
      gigType: gig.isClientBand ? ("band" as "band") : ("regular" as "regular"),
      actionBy: user._id,
      actionFor: args.applicantId,
      notes:
        args.notes ||
        (args.bandRole
          ? `Added to shortlist for ${args.bandRole} role`
          : "Added to shortlist"),
      bandRole: args.bandRole, // Include in booking history
      bandRoleIndex: args.bandRoleIndex, // Include in booking history
    };

    // Update gig
    await ctx.db.patch(args.gigId, {
      shortlistedUsers: updatedShortlist,
      interestedUsers: updatedInterestedUsers,
      bookingHistory: [...(gig.bookingHistory || []), bookingEntry],
    });

    // Create notification
    await createNotificationInternal(ctx, {
      userDocumentId: args.applicantId,
      type: "gig_selected",
      title: "⭐ Added to Shortlist!",
      message: `${user.firstname || user.username} added you to their shortlist${args.bandRole ? ` for ${args.bandRole} role` : ""} for "${gig.title}".`,
      actionUrl: `/gigs/${args.gigId}`,
      relatedUserDocumentId: user._id,
    });

    return { success: true };
  },
});

// Keep your existing mutations but update shortlistApplicant to use addToShortlist
export const shortlistApplicant = mutation({
  args: {
    gigId: v.id("gigs"),
    applicantId: v.id("users"),
    clerkId: v.string(),
  },
  handler: async (ctx: MutationCtx, args: any) => {
    // Call the shared logic directly
    return addToShortlistLogic(ctx, { ...args, notes: undefined });
  },
});

export const removeFromShortlist = mutation({
  args: {
    gigId: v.id("gigs"),
    applicantId: v.id("users"),
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

    if (gig.postedBy !== user._id) throw new Error("Not authorized");

    // Remove from shortlist
    const updatedShortlist =
      gig.shortlistedUsers?.filter(
        (item) => item.userId !== args.applicantId
      ) || [];

    await ctx.db.patch(args.gigId, {
      shortlistedUsers: updatedShortlist,
    });

    // Get applicant user
    const applicantUser = await ctx.db.get(args.applicantId);

    // Create booking history entry with all required fields
    const bookingEntry = createBookingEntry(
      gig,
      args.applicantId,
      applicantUser,
      user,
      "rejected", // Use "rejected" instead of "removed_from_shortlist"
      "Removed from shortlist"
    );

    await ctx.db.patch(args.gigId, {
      bookingHistory: [...(gig.bookingHistory || []), bookingEntry],
    });

    return { success: true };
  },
});

// Remove/reject an applicant (updated to also remove from shortlist)
export const removeApplicant = mutation({
  args: {
    gigId: v.id("gigs"),
    applicantId: v.id("users"),
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

    if (gig.postedBy !== user._id) throw new Error("Not authorized");

    // Remove applicant from interestedUsers
    const updatedInterestedUsers =
      gig.interestedUsers?.filter((id) => id !== args.applicantId) || [];

    // Remove from shortlist if present
    const updatedShortlist =
      gig.shortlistedUsers?.filter(
        (item) => item.userId !== args.applicantId
      ) || [];

    // Get applicant user
    const applicantUser = await ctx.db.get(args.applicantId);
    if (!applicantUser) throw new Error("Applicant user not found");

    // Create booking history entry for tracking
    const bookingEntry = createBookingEntry(
      gig,
      args.applicantId,
      applicantUser,
      user,
      "rejected", // Use "rejected" status
      "Applicant removed from consideration"
    );

    // Update gig
    await ctx.db.patch(args.gigId, {
      interestedUsers: updatedInterestedUsers,
      shortlistedUsers: updatedShortlist,
      bookingHistory: [...(gig.bookingHistory || []), bookingEntry],
    });

    // Create notification for the musician
    await createNotificationInternal(ctx, {
      userDocumentId: args.applicantId,
      type: "gig_not_selected",
      title: "Application Update",
      message: `Your application for "${gig.title}" was not selected this time. Keep applying for other opportunities!`,
      actionUrl: `/gigs`,
      relatedUserDocumentId: user._id,
    });

    return { success: true };
  },
});

// Mark applicant profile as viewed (keep as is)
export const markApplicantViewed = mutation({
  args: {
    gigId: v.id("gigs"),
    applicantId: v.id("users"),
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

    const applicantUser = await ctx.db.get(args.applicantId);
    if (!applicantUser) throw new Error("Applicant user not found");

    // Create booking history entry for viewing
    // Note: "viewed" is not a valid status in your schema.
    // You can use "updated" or create a new status in your schema
    const viewingEntry = createBookingEntry(
      gig,
      args.applicantId,
      applicantUser,
      user,
      "updated", // Use "updated" since "viewed" is not in your schema
      "Profile viewed by client"
    );

    await ctx.db.patch(args.gigId, {
      bookingHistory: [...(gig.bookingHistory || []), viewingEntry],
    });

    return { success: true };
  },
});

// Now update the bookMusician mutation:
export const bookMusician = mutation({
  args: {
    gigId: v.id("gigs"),
    musicianId: v.id("users"),
    source: v.union(
      v.literal("regular"),
      v.literal("band-role"),
      v.literal("full-band"),
      v.literal("shortlisted")
    ),
    bandId: v.optional(v.id("bands")), // Add bandId for full-band bookings
    bandRoleIndex: v.optional(v.number()), // For band-role bookings
    agreedPrice: v.optional(v.number()),
    notes: v.optional(v.string()),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get current user (client) using clerkId
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
    if (!user) throw new Error("User not found");

    // Get the gig
    const gig = await ctx.db.get(args.gigId);
    if (!gig) throw new Error("Gig not found");

    // Verify user owns the gig
    if (gig.postedBy !== user._id) throw new Error("Not authorized");

    // Check if gig is already taken
    if (gig.isTaken) {
      throw new Error("Gig is already booked");
    }

    // VALIDATE BASED ON SOURCE
    switch (args.source) {
      case "regular":
        if (!gig.interestedUsers?.includes(args.musicianId)) {
          throw new Error("Musician is not in interested users");
        }
        break;

      case "band-role":
        if (args.bandRoleIndex === undefined) {
          throw new Error("bandRoleIndex is required for band-role booking");
        }
        if (
          !gig.bandCategory ||
          args.bandRoleIndex >= gig.bandCategory.length
        ) {
          throw new Error("Invalid band role index");
        }
        const role = gig.bandCategory[args.bandRoleIndex];
        const isApplicant = role.applicants?.includes(args.musicianId);
        const isAlreadyBooked = role.bookedUsers?.includes(args.musicianId);
        if (!isApplicant && !isAlreadyBooked) {
          throw new Error("Musician is not an applicant for this band role");
        }
        if (role.filledSlots >= role.maxSlots) {
          throw new Error(`No slots available for ${role.role} role`);
        }
        break;

      case "full-band":
        if (!args.bandId) {
          throw new Error("bandId is required for full-band bookings");
        }
        const bandHasApplied = gig.bookCount?.some(
          (item) => item.bandId === args.bandId
        );
        if (!bandHasApplied) {
          throw new Error("This band has not applied to this gig");
        }
        break;

      case "shortlisted":
        const isInShortlist = gig.shortlistedUsers?.some(
          (item) => item.userId === args.musicianId
        );
        if (!isInShortlist) {
          throw new Error("Musician is not in shortlist");
        }
        break;
    }

    // Get musician to book (for individual bookings)
    const musician = await ctx.db.get(args.musicianId);

    // Create booking history entry
    const bookingEntry = {
      entryId: `${args.gigId}-${args.musicianId}-${Date.now()}`,
      timestamp: Date.now(),
      userId: args.musicianId,
      userRole: musician?.roleType,
      status: "booked" as "booked",
      gigType: gig.isClientBand ? ("band" as "band") : ("regular" as "regular"),
      actionBy: user._id,
      actionFor: args.musicianId,
      notes: args.notes || `Booked from ${args.source}`,
      agreedPrice: args.agreedPrice,
      bandRoleIndex: args.bandRoleIndex,
      bandId: args.bandId,
    };

    // HANDLE DIFFERENT SOURCES
    if (args.source === "band-role" && gig.bandCategory) {
      // BAND-ROLE: Move musician from applicants to bookedUsers
      const updatedBandCategory = gig.bandCategory.map((role, index) => {
        if (index === args.bandRoleIndex) {
          const updatedApplicants =
            role.applicants?.filter((id) => id !== args.musicianId) || [];
          const updatedBookedUsers = role.bookedUsers?.includes(args.musicianId)
            ? role.bookedUsers
            : [...(role.bookedUsers || []), args.musicianId];
          const wasAlreadyBooked = role.bookedUsers?.includes(args.musicianId);
          const newFilledSlots = wasAlreadyBooked
            ? role.filledSlots
            : (role.filledSlots || 0) + 1;

          return {
            ...role,
            applicants: updatedApplicants,
            bookedUsers: updatedBookedUsers,
            filledSlots: newFilledSlots,
          };
        }
        return role;
      });

      const allRolesFilled = updatedBandCategory.every(
        (role) => (role.filledSlots || 0) >= role.maxSlots
      );

      await ctx.db.patch(args.gigId, {
        isTaken: allRolesFilled,
        isActive: false,
        isPending: false,
        bookedBy: args.musicianId, // Single musician for band role
        bandCategory: updatedBandCategory,
        interestedUsers: [],
        shortlistedUsers: [],
        appliedUsers: [],
        bookingHistory: [...(gig.bookingHistory || []), bookingEntry],
        updatedAt: Date.now(),
      });

      let notificationMessage = "";
      // Create notification for individual musician
      // FIXED: Add proper null check for bandRoleIndex
      if (
        args.source === "band-role" &&
        gig.bandCategory &&
        args.bandRoleIndex !== undefined // Add this check
      ) {
        const roleName =
          gig.bandCategory[args.bandRoleIndex]?.role || "the band";
        notificationMessage = `${user.firstname || user.username} has booked you as ${roleName} for "${gig.title}"!`;
      }

      await createNotificationInternal(ctx, {
        userDocumentId: args.musicianId,
        type: "gig_approved",
        title: "🎉 You've Been Booked!",
        message: notificationMessage,
        actionUrl: `/gigs/${args.gigId}`,
        relatedUserDocumentId: user._id,
      });
    } else if (args.source === "full-band" && args.bandId) {
      // FULL-BAND: Update band application status to "booked"
      const updatedBookCount = (gig.bookCount || []).map((item) =>
        item.bandId === args.bandId
          ? { ...item, status: "booked" as const }
          : item
      );

      // Get the band to find the band leader
      const band = await ctx.db.get(args.bandId);
      const bandLeader = band?.members?.find(
        (member) => member.isLeader
      )?.userId;

      await ctx.db.patch(args.gigId, {
        isTaken: true,
        isActive: false,
        isPending: false,
        bookedBandId: args.bandId, // Track which band was booked
        bookedBandLeader: bandLeader, // Track band leader
        bookCount: updatedBookCount,
        interestedUsers: [],
        shortlistedUsers: [],
        appliedUsers: [],
        bookingHistory: [...(gig.bookingHistory || []), bookingEntry],
        updatedAt: Date.now(),
      });

      // Notify all band members
      if (band?.members) {
        for (const member of band.members) {
          await createNotificationInternal(ctx, {
            userDocumentId: member.userId,
            type: "gig_approved",
            title: "🎉 Band Booked!",
            message: `Your band "${band.name}" has been booked for "${gig.title}" by ${user.firstname || user.username}.`,
            actionUrl: `/gigs/${args.gigId}`,
            relatedUserDocumentId: user._id,
          });
        }
      }
    } else {
      // REGULAR & SHORTLISTED: Standard booking for single musician
      await ctx.db.patch(args.gigId, {
        isTaken: true,
        isActive: false,
        isPending: false,
        bookedBy: args.musicianId, // Single musician
        interestedUsers: [],
        shortlistedUsers: [],
        appliedUsers: [],
        bookingHistory: [...(gig.bookingHistory || []), bookingEntry],
        updatedAt: Date.now(),
      });

      // Create notification for individual musician
      let notificationMessage = `${user.firstname || user.username} has booked you for "${gig.title}"!`;

      await createNotificationInternal(ctx, {
        userDocumentId: args.musicianId,
        type: "gig_approved",
        title: "🎉 You've Been Booked!",
        message: notificationMessage,
        actionUrl: `/gigs/${args.gigId}`,
        relatedUserDocumentId: user._id,
      });
    }

    return {
      success: true,
      message: "Booking successful",
      gigId: args.gigId,
      musicianId: args.musicianId,
      bandId: args.source === "full-band" ? args.bandId : undefined,
    };
  },
});

// Add band to gig (when a band applies to a gig)
export const addBandToGig = mutation({
  args: {
    gigId: v.id("gigs"),
    bandId: v.id("bands"),
    clerkId: v.string(),
    proposedFee: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get user (band representative)
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
    if (!user) throw new Error("User not found");

    // Get the band
    const band = await ctx.db.get(args.bandId);
    if (!band) throw new Error("Band not found");

    // Get the gig
    const gig = await ctx.db.get(args.gigId);
    if (!gig) throw new Error("Gig not found");

    // Check if gig is already taken
    if (gig.isTaken) {
      throw new Error("Gig is already booked");
    }

    // Check if band has already applied
    const existingApplication = gig.bookCount?.find(
      (item) => item.bandId === args.bandId
    );
    if (existingApplication) {
      throw new Error("Band has already applied to this gig");
    }

    // Add band to bookCount
    const newApplication = {
      bandId: args.bandId,
      appliedAt: Date.now(),
      status: "applied" as const,
      appliedBy: user._id,
      proposedFee: args.proposedFee,
      notes: args.notes,
    };

    await ctx.db.patch(args.gigId, {
      bookCount: [...(gig.bookCount || []), newApplication],
    });

    // Get the gig creator (client)
    const clientUser = await ctx.db.get(gig.postedBy);

    // Create notification for the client
    await createNotificationInternal(ctx, {
      userDocumentId: gig.postedBy,
      type: "gig_interest",
      title: "🎸 New Band Application!",
      message: `${band.name} has applied for your gig "${gig.title}".`,
      actionUrl: `/gigs/${args.gigId}`,
      relatedUserDocumentId: user._id,
    });

    return { success: true, bandName: band.name };
  },
});
