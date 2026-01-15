// convex/preBooking.ts - UPDATED WITH SHORTLIST SYSTEM
import { v } from "convex/values";
import { mutation, MutationCtx, query } from "../_generated/server";
import { createNotificationInternal } from "../createNotificationInternal";
import { Id } from "../_generated/dataModel";
import { getUserByClerkId } from "./bookings";

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
    bandRole: v.optional(v.string()),
    bandRoleIndex: v.optional(v.number()),
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
        bandRole: args.bandRole,
        bandRoleIndex: args.bandRoleIndex,
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
      bandRole: args.bandRole,
      bandRoleIndex: args.bandRoleIndex,
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
      "rejected",
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
      "rejected",
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

// Mark applicant profile as viewed
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
    const viewingEntry = createBookingEntry(
      gig,
      args.applicantId,
      applicantUser,
      user,
      "updated",
      "Profile viewed by client"
    );

    await ctx.db.patch(args.gigId, {
      bookingHistory: [...(gig.bookingHistory || []), viewingEntry],
    });

    return { success: true };
  },
});

// Book musician (regular, band-role, full-band, or shortlisted)
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
    bandId: v.optional(v.id("bands")),
    bandRoleIndex: v.optional(v.number()),
    bookedPrice: v.optional(v.number()),
    notes: v.optional(v.string()),
    replaceExisting: v.optional(v.boolean()),
    reason: v.optional(v.string()),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get current user (client)
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

    // Get musician to book
    const musician = await ctx.db.get(args.musicianId);
    if (!musician) throw new Error("Musician not found");

    let updatedGigData: any = {};
    let bookingEntry: any = {};
    let bandBookingEntry: any = null;
    let replacedUser = null;
    let allRolesFilled = false;
    let userDisplayName = musician.firstname || musician.username || "Musician";

    // Validate and handle based on source
    switch (args.source) {
      case "regular":
        // Check if musician is in interestedUsers
        if (!gig.interestedUsers?.includes(args.musicianId)) {
          throw new Error("Musician is not in interested users");
        }

        // Check if gig is already taken
        if (gig.isTaken) {
          throw new Error("Gig is already booked");
        }

        // Create booking history entry
        bookingEntry = {
          entryId: `${args.gigId}-${args.musicianId}-${Date.now()}`,
          timestamp: Date.now(),
          userId: args.musicianId,
          userRole: musician.roleType,
          status: "booked" as const,
          gigType: "regular" as const,
          actionBy: user._id,
          actionFor: args.musicianId,
          notes: args.notes || "Booked from regular applicants",
          agreedPrice: args.bookedPrice || gig.price,
        };

        updatedGigData = {
          isTaken: true,
          isActive: true,
          isPending: false,
          bookedBy: args.musicianId,
          interestedUsers: [],
          shortlistedUsers:
            gig.shortlistedUsers?.filter(
              (item: any) => item.userId !== args.musicianId
            ) || [],
          bookingHistory: [...(gig.bookingHistory || []), bookingEntry],
          updatedAt: Date.now(),
        };
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

        // Check if musician is in applicants or already booked
        const isApplicant = role.applicants?.includes(args.musicianId);
        const isAlreadyBooked = role.bookedUsers?.includes(args.musicianId);

        if (!isApplicant && !isAlreadyBooked) {
          throw new Error("Musician is not an applicant for this band role");
        }

        // Check if role is already filled
        const roleFilled = role.filledSlots >= role.maxSlots;

        // If role is full and we're not replacing, error
        if (roleFilled && !args.replaceExisting) {
          throw new Error(
            `The role "${role.role}" is already filled. Use replaceExisting=true to replace.`
          );
        }

        // Check if user is already booked for this role
        if (isAlreadyBooked && !args.replaceExisting) {
          throw new Error("This user is already booked for this role");
        }

        // Create updated band category
        let updatedBandCategory = [...gig.bandCategory];

        if (args.replaceExisting && role.bookedUsers.length > 0) {
          // Replace existing booking(s) for this role
          if (role.maxSlots === 1 && role.bookedUsers.length === 1) {
            // Single slot role - replace the existing user
            const existingUserId = role.bookedUsers[0];
            replacedUser = {
              userId: existingUserId,
              name: "Previous musician",
            };

            updatedBandCategory[args.bandRoleIndex] = {
              ...role,
              bookedUsers: [args.musicianId],
              bookedPrice: args.bookedPrice || role.bookedPrice || role.price,
            };
          } else {
            // Multiple slot role - add new user if slots available
            if (role.filledSlots < role.maxSlots) {
              updatedBandCategory[args.bandRoleIndex] = {
                ...role,
                filledSlots: role.filledSlots + 1,
                bookedUsers: [...role.bookedUsers, args.musicianId],
                bookedPrice: args.bookedPrice || role.bookedPrice || role.price,
              };
            } else {
              // Find someone to replace (first user)
              const toReplace = role.bookedUsers[0];
              replacedUser = {
                userId: toReplace,
                name: "Previous musician",
              };

              updatedBandCategory[args.bandRoleIndex] = {
                ...role,
                bookedUsers: role.bookedUsers
                  .filter((id) => id !== toReplace)
                  .concat(args.musicianId),
                bookedPrice: args.bookedPrice || role.bookedPrice || role.price,
              };
            }
          }
        } else {
          // Add new booking (if slot available)
          if (role.filledSlots >= role.maxSlots) {
            throw new Error(`No available slots for "${role.role}"`);
          }

          updatedBandCategory[args.bandRoleIndex] = {
            ...role,
            filledSlots: role.filledSlots + 1,
            bookedUsers: [...role.bookedUsers, args.musicianId],
            bookedPrice: args.bookedPrice || role.bookedPrice || role.price,
          };
        }

        // Create enhanced band booking history entry
        bandBookingEntry = {
          bandRole: role.role,
          bandRoleIndex: args.bandRoleIndex,
          userId: args.musicianId,
          userName: userDisplayName,
          appliedAt: Date.now(),
          applicationStatus: "pending_review" as const,
          bookedAt: Date.now(),
          bookedBy: user._id,
          bookedPrice: args.bookedPrice || role.price,
          contractSigned: false,
          paymentStatus: "pending" as const,
        };

        // Create regular booking history entry
        bookingEntry = {
          entryId: `${args.gigId}_${args.bandRoleIndex}_${args.musicianId}_${Date.now()}`,
          timestamp: Date.now(),
          userId: args.musicianId,
          userRole: "musician",
          bandRole: role.role,
          bandRoleIndex: args.bandRoleIndex,

          status: args.replaceExisting
            ? ("rejected" as const)
            : ("booked" as const),
          gigType: "band" as const,
          proposedPrice: role.price,
          agreedPrice: args.bookedPrice || role.price,
          currency: role.currency,
          actionBy: user._id,
          actionFor: args.musicianId,
          notes: args.notes || "",
          reason:
            args.reason ||
            (args.replaceExisting ? "Role replacement" : "New booking"),
          metadata: {
            roleDescription: role.description,
            requiredSkills: role.requiredSkills,
            maxSlots: role.maxSlots,
            negotiable: role.negotiable,
            isReplacement: args.replaceExisting,
            replacedUserId: replacedUser?.userId,
          },
        };

        // Check if all roles are filled
        allRolesFilled = updatedBandCategory.every(
          (r) => r.filledSlots >= r.maxSlots
        );

        updatedGigData = {
          bandCategory: updatedBandCategory,
          bookingHistory: [...(gig.bookingHistory || []), bookingEntry],
          bandBookingHistory: [
            ...(gig.bandBookingHistory || []),
            bandBookingEntry,
          ],
          updatedAt: Date.now(),
          ...(allRolesFilled && {
            isTaken: true,
            isPending: false,
            isActive: true,
          }),
        };

        // Remove from interestedUsers and shortlistedUsers
        if (gig.interestedUsers?.includes(args.musicianId)) {
          updatedGigData.interestedUsers = gig.interestedUsers.filter(
            (id) => id !== args.musicianId
          );
        }

        if (gig.shortlistedUsers) {
          updatedGigData.shortlistedUsers = gig.shortlistedUsers.filter(
            (item: any) => item.userId !== args.musicianId
          );
        }

        // Remove from applicants if they were in applicants
        if (isApplicant) {
          updatedBandCategory[args.bandRoleIndex] = {
            ...updatedBandCategory[args.bandRoleIndex],
            applicants: updatedBandCategory[
              args.bandRoleIndex
            ].applicants.filter((id) => id !== args.musicianId),
          };
          updatedGigData.bandCategory = updatedBandCategory;
        }
        break;

      case "full-band":
        if (!args.bandId) {
          throw new Error("bandId is required for full-band bookings");
        }

        // Check if this band has applied
        const bandHasApplied = gig.bookCount?.some(
          (item: any) => item.bandId === args.bandId
        );
        if (!bandHasApplied) {
          throw new Error("This band has not applied to this gig");
        }

        // Also check if the musician is part of the band
        const band = await ctx.db.get(args.bandId);
        if (!band) throw new Error("Band not found");

        const isBandMember = band.members?.some(
          (member: any) => member.userId === args.musicianId
        );
        if (!isBandMember) {
          throw new Error(
            "This musician is not a member of the specified band"
          );
        }

        // Check if gig is already taken
        if (gig.isTaken) {
          throw new Error("Gig is already booked");
        }

        // Create booking history entry
        bookingEntry = {
          entryId: `${args.gigId}-${args.musicianId}-${Date.now()}`,
          timestamp: Date.now(),
          userId: args.musicianId,
          userRole: musician.roleType,
          status: "booked" as const,
          gigType: "band" as const,
          actionBy: user._id,
          actionFor: args.musicianId,
          notes: args.notes || "Booked as full band",
          agreedPrice: args.bookedPrice,
          bandId: args.bandId,
        };

        // Update band applications in bookCount
        const updatedBookCount = (gig.bookCount || []).map((item: any) =>
          item.bandId === args.bandId
            ? { ...item, status: "booked" as const }
            : item
        );

        updatedGigData = {
          isTaken: true,
          isActive: false,
          isPending: false,
          bookedBandId: args.bandId,
          bookedBy: args.musicianId,
          bookCount: updatedBookCount,
          interestedUsers: [],
          shortlistedUsers:
            gig.shortlistedUsers?.filter(
              (item: any) => item.userId !== args.musicianId
            ) || [],
          bookingHistory: [...(gig.bookingHistory || []), bookingEntry],
          updatedAt: Date.now(),
        };
        break;

      case "shortlisted":
        // Check if musician is in shortlist
        const isInShortlist = gig.shortlistedUsers?.some(
          (item: any) => item.userId === args.musicianId
        );
        if (!isInShortlist) {
          throw new Error("Musician is not in shortlist");
        }

        // Check if gig is already taken
        if (gig.isTaken) {
          throw new Error("Gig is already booked");
        }

        // Create booking history entry
        bookingEntry = {
          entryId: `${args.gigId}-${args.musicianId}-${Date.now()}`,
          timestamp: Date.now(),
          userId: args.musicianId,
          userRole: musician.roleType,
          status: "booked" as const,
          gigType: gig.isClientBand ? ("band" as const) : ("regular" as const),
          actionBy: user._id,
          actionFor: args.musicianId,
          notes: args.notes || "Booked from shortlist",
          agreedPrice: args.bookedPrice,
        };

        updatedGigData = {
          isTaken: true,
          isActive: false,
          isPending: false,
          bookedBy: args.musicianId,
          interestedUsers: [],
          shortlistedUsers:
            gig.shortlistedUsers?.filter(
              (item: any) => item.userId !== args.musicianId
            ) || [],
          bookingHistory: [...(gig.bookingHistory || []), bookingEntry],
          updatedAt: Date.now(),
        };
        break;
    }

    // Update gig
    await ctx.db.patch(args.gigId, updatedGigData);

    // Create notification for the booked musician
    let notificationTitle = "🎉 You've Been Booked!";
    let notificationMessage = `${user.firstname || user.username} has booked you`;
    let notificationType = "gig_approved";

    if (args.source === "band-role") {
      const roleName =
        gig.bandCategory![args.bandRoleIndex!]?.role || "the band";
      notificationTitle = args.replaceExisting
        ? "🔄 Role Reassignment"
        : "🎵 Band Booking!";
      notificationMessage = args.replaceExisting
        ? `You've replaced another musician as ${roleName} for "${gig.title}"`
        : `You've been booked as ${roleName} for "${gig.title}"`;
    } else if (args.source === "full-band") {
      const band = await ctx.db.get(args.bandId!);
      notificationMessage = `${user.firstname || user.username} has booked your band "${band?.name}" for "${gig.title}"!`;
    } else {
      notificationMessage = `${user.firstname || user.username} has booked you for "${gig.title}"!`;
    }

    await createNotificationInternal(ctx, {
      userDocumentId: args.musicianId,
      type: notificationType,
      title: notificationTitle,
      message: notificationMessage,
      image: gig.logo,
      actionUrl: `/gigs/${args.gigId}`,
      relatedUserDocumentId: user._id,
      metadata: {
        gigId: args.gigId,
        gigTitle: gig.title,
        ...(args.source === "band-role" && {
          role: gig.bandCategory![args.bandRoleIndex!]?.role,
          bookedPrice: args.bookedPrice,
          currency: gig.bandCategory![args.bandRoleIndex!]?.currency,
          bookedBy: user._id,
          isReplacement: args.replaceExisting,
          replacedUser: replacedUser,
          bandRoleIndex: args.bandRoleIndex,
        }),
        ...(args.source === "full-band" && { bandId: args.bandId }),
      },
    });

    // NOTIFY REPLACED USER IF APPLICABLE
    if (replacedUser && replacedUser.userId && args.source === "band-role") {
      await createNotificationInternal(ctx, {
        userDocumentId: replacedUser.userId,
        type: "removed_from_band",
        title: "🔄 Role Replaced",
        message: `You've been replaced as ${gig.bandCategory![args.bandRoleIndex!]?.role} for "${gig.title}"`,
        actionUrl: `/gigs/${args.gigId}`,
        relatedUserDocumentId: user._id,
        metadata: {
          gigId: args.gigId,
          gigTitle: gig.title,
          role: gig.bandCategory![args.bandRoleIndex!]?.role,
          replacedBy: userDisplayName,
          reason: args.reason,
          bandRoleIndex: args.bandRoleIndex,
        },
      });
    }

    // NOTIFY BAND MEMBERS IF FULL-BAND BOOKING
    if (args.source === "full-band" && args.bandId) {
      const band = await ctx.db.get(args.bandId);
      if (band?.members) {
        for (const member of band.members) {
          if (member.userId === args.musicianId) continue;

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
    }

    return {
      success: true,
      message: "Booking successful",
      gigId: args.gigId,
      musicianId: args.musicianId,
      ...(args.source === "full-band" && { bandId: args.bandId }),
      ...(args.source === "band-role" && {
        allRolesFilled,
        replacedUser,
        bandBookingEntry,
        bookingEntry,
      }),
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

    // Get performing members from the band
    const performingMembers =
      band.members?.map((member: any) => ({
        userId: member.userId,
        name: member.name || "",
        role: member.role || "",
        instrument: member.instrument || member.role || "",
      })) || [];

    // Add band to bookCount with performingMembers
    const newApplication = {
      bandId: args.bandId,
      appliedAt: Date.now(),
      status: "applied" as const,
      appliedBy: user._id,
      proposedFee: args.proposedFee,
      notes: args.notes,
      performingMembers,
      bookedAt: undefined,
      contractSigned: false,
      agreedFee: args.proposedFee,
      shortlistedAt: undefined,
      shortlistNotes: undefined,
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

// Book gig and create crew chat
export const bookAndCreateCrewChat = mutation({
  args: {
    gigId: v.id("gigs"),
    clerkId: v.string(),
    clientRole: v.union(v.literal("admin"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    const client = await getUserByClerkId(ctx, args.clerkId);
    const gig = await ctx.db.get(args.gigId);

    if (!gig) throw new Error("Gig not found");
    if (!gig.isClientBand) throw new Error("Not a band gig");
    if (gig.postedBy !== client._id) {
      throw new Error("Only band creator can book and create crew chat");
    }

    // 1. Verify all roles are filled
    if (!gig.bandCategory || gig.bandCategory.length === 0) {
      throw new Error("No band roles defined");
    }

    const allRolesFilled = gig.bandCategory.every(
      (role: any) => role.filledSlots >= role.maxSlots
    );

    if (!allRolesFilled) {
      const unfilledRoles = gig.bandCategory
        .filter((role: any) => role.filledSlots < role.maxSlots)
        .map(
          (role: any) => `${role.role} (${role.filledSlots}/${role.maxSlots})`
        );

      throw new Error(
        `All roles must be filled. Still need: ${unfilledRoles.join(", ")}`
      );
    }

    // 2. Ensure gig is marked as booked
    if (!gig.isTaken) {
      await ctx.db.patch(args.gigId, {
        isTaken: true,
        isPending: false,
        isActive: true,
        updatedAt: Date.now(),
      });
    }

    // 3. Create crew chat DIRECTLY
    if (gig.bandChatId) {
      const existingChat = await ctx.db.get(gig.bandChatId);
      if (existingChat) {
        // Update settings if already exists
        await ctx.db.patch(gig._id, {
          crewChatSettings: {
            clientRole: args.clientRole,
            chatPermissions: {
              canSendMessages: true,
              canAddMembers: args.clientRole === "admin",
              canRemoveMembers: args.clientRole === "admin",
              canEditChatInfo: args.clientRole === "admin",
            },
            createdBy: client._id,
            createdAt: Date.now(),
          },
        });

        return {
          success: true,
          message: "Gig already booked - crew chat settings updated",
          chatId: gig.bandChatId,
          clientRole: args.clientRole,
          alreadyExists: true,
        };
      }
    }

    // Get all booked musicians from band roles
    const participants = new Set<Id<"users">>();
    participants.add(gig.postedBy); // Add client

    if (gig.bandCategory) {
      gig.bandCategory.forEach((role: any) => {
        role.bookedUsers?.forEach((userId: Id<"users">) => {
          participants.add(userId);
        });
      });
    }

    const participantArray = Array.from(participants);

    // Create the crew chat - USING participantIds FIELD
    const chatId = await ctx.db.insert("chats", {
      participantIds: participantArray, // Correct field name
      type: "group",
      name: `🎵 Crew: ${gig.title}`,
      createdBy: gig.postedBy,
      lastMessage: "Crew chat created!",
      lastMessageAt: Date.now(),
      unreadCounts: {},
      metadata: {
        isCrewChat: true,
        gigId: gig._id,
        clientRole: args.clientRole,
        permissions: {
          canSendMessages: true,
          canAddMembers: args.clientRole === "admin",
          canRemoveMembers: args.clientRole === "admin",
          canEditChatInfo: args.clientRole === "admin",
        },
      },
    });

    // Link chat to gig with settings
    await ctx.db.patch(gig._id, {
      bandChatId: chatId,
      crewChatSettings: {
        clientRole: args.clientRole,
        chatPermissions: {
          canSendMessages: true,
          canAddMembers: args.clientRole === "admin",
          canRemoveMembers: args.clientRole === "admin",
          canEditChatInfo: args.clientRole === "admin",
        },
        createdBy: client._id,
        createdAt: Date.now(),
      },
      updatedAt: Date.now(),
    });

    // Add welcome message
    await ctx.db.insert("messages", {
      chatId,
      senderId: client._id,
      content:
        args.clientRole === "admin"
          ? `🚀 Crew chat created! I'm the admin. All ${participantArray.length - 1} musicians can read and write here.`
          : `🚀 Crew chat created! I'm joining as a member. All ${participantArray.length} of us can read and write here.`,
      messageType: "text",
      attachments: [],
      readBy: [],
      deliveredTo: participantArray,
      status: "sent",
      isDeleted: false,
    });

    // 4. Create booking history entry for this action
    const bookingEntry = {
      entryId: `${args.gigId}_booked_with_chat_${Date.now()}`,
      timestamp: Date.now(),
      userId: client._id,
      userRole: "client",
      status: "confirmed" as const,
      gigType: "band" as const,
      actionBy: client._id,
      actionFor: client._id,
      notes: `Gig booked and crew chat created. Client role: ${args.clientRole}`,
      reason: "Booked gig with crew chat creation",
      metadata: {
        chatId,
        clientRole: args.clientRole,
        action: "book_and_create_chat",
      },
    };

    await ctx.db.patch(args.gigId, {
      bookingHistory: [...(gig.bookingHistory || []), bookingEntry],
      updatedAt: Date.now(),
    });

    // For crew chat creation notifications, use "band_setup_info" or "band_joined"
    for (const participantId of participantArray) {
      if (participantId === client._id) continue;

      await createNotificationInternal(ctx, {
        userDocumentId: participantId,
        type: "band_setup_info",
        title: "💬 New Crew Chat Created",
        message: `${client.firstname || client.username} created a crew chat for "${gig.title}"`,
        actionUrl: `/chat/${chatId}`,
        relatedUserDocumentId: client._id,
        metadata: {
          gigId: gig._id,
          gigTitle: gig.title,
          chatId: chatId,
          clientRole: args.clientRole,
        },
      });
    }

    // For gig booking notifications, keep using "gig_approved"
    for (const participantId of participantArray) {
      if (participantId === client._id) continue;

      await createNotificationInternal(ctx, {
        userDocumentId: participantId,
        type: "gig_approved",
        title: "✅ Gig Officially Booked!",
        message: `${client.firstname || client.username} has officially booked the gig "${gig.title}" and created a crew chat.`,
        actionUrl: `/gigs/${gig._id}`,
        relatedUserDocumentId: client._id,
      });
    }

    return {
      success: true,
      message: "Gig booked and crew chat created successfully",
      chatId,
      clientRole: args.clientRole,
      participantCount: participantArray.length,
      gigStatus: {
        isTaken: true,
        isPending: false,
        isActive: true,
      },
    };
  },
});

// Band chat functions section - UPDATED
export const getBandChat = query({
  args: { gigId: v.id("gigs") },
  handler: async (ctx, args) => {
    const gig = await ctx.db.get(args.gigId);
    if (!gig?.bandChatId) return null;

    const chat = await ctx.db.get(gig.bandChatId);
    if (!chat) return null;

    // Get last few messages
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", chat._id))
      .order("desc")
      .take(50);

    // Get participant details
    const participants = await Promise.all(
      chat.participantIds.map(async (userId: Id<"users">) => {
        const user = await ctx.db.get(userId);
        if (!user) return null;

        // For band gigs, get the user's role
        let role = "Member";
        if (gig.isClientBand && gig.bandCategory) {
          for (const bandRole of gig.bandCategory) {
            if (bandRole.bookedUsers?.includes(userId)) {
              role = bandRole.role;
              break;
            }
          }
        }

        return {
          _id: user._id,
          firstname: user.firstname,
          username: user.username,
          picture: user.picture,
          roleType: user.roleType,
          bandRole: role,
          isClient: gig.postedBy === user._id,
        };
      })
    );

    return {
      chat: {
        ...chat,
        participants: participants.filter(Boolean),
      },
      messages: messages.reverse(),
      gigInfo: {
        title: gig.title,
        date: gig.date,
        location: gig.location,
        clientRole: gig.crewChatSettings?.clientRole || "member",
      },
      permissions: gig.crewChatSettings?.chatPermissions || {
        canSendMessages: true,
        canAddMembers: false,
        canRemoveMembers: false,
        canEditChatInfo: false,
      },
    };
  },
});

// Add musician to band chat (for when new musicians get booked)
export const addToBandChat = mutation({
  args: {
    gigId: v.id("gigs"),
    musicianId: v.id("users"),
    clerkId: v.string(), // Client's Clerk ID
  },
  handler: async (ctx, args) => {
    const client = await getUserByClerkId(ctx, args.clerkId);
    const gig = await ctx.db.get(args.gigId);

    if (!gig) throw new Error("Gig not found");
    if (gig.postedBy !== client._id) {
      throw new Error("Only band creator can add to chat");
    }

    const chat = gig.bandChatId ? await ctx.db.get(gig.bandChatId) : null;
    if (!chat) {
      throw new Error("Band chat not created yet");
    }

    // Check if user is already in chat
    if (chat.participantIds.includes(args.musicianId)) {
      return { success: true, alreadyInChat: true };
    }

    // Get musician details
    const musician = await ctx.db.get(args.musicianId);
    if (!musician) throw new Error("Musician not found");

    // Get musician's role in the band
    let musicianRole = "Musician";
    if (gig.bandCategory) {
      for (const role of gig.bandCategory) {
        if (role.bookedUsers?.includes(args.musicianId)) {
          musicianRole = role.role;
          break;
        }
      }
    }

    // Add musician to chat participantIds
    const updatedParticipantIds = [...chat.participantIds, args.musicianId];
    await ctx.db.patch(chat._id, {
      participantIds: updatedParticipantIds,
      lastMessage: `${musician.firstname || musician.username} joined the crew`,
      lastMessageAt: Date.now(),
    });

    // Add system message
    await ctx.db.insert("messages", {
      chatId: chat._id,
      senderId: client._id,
      content: `${musician.firstname || musician.username} has joined the crew as ${musicianRole}!`,
      messageType: "text",
      attachments: [],
      readBy: [],
      deliveredTo: updatedParticipantIds,
      status: "sent",
      isDeleted: false,
    });

    // Notify the new musician
    await createNotificationInternal(ctx, {
      userDocumentId: args.musicianId,
      type: "added_to_crew_chat",
      title: "👋 Welcome to Crew Chat!",
      message: `You've been added to the crew chat for "${gig.title}"`,
      actionUrl: `/chat/${chat._id}`,
      relatedUserDocumentId: client._id,
      metadata: {
        gigId: gig._id,
        gigTitle: gig.title,
        chatId: chat._id,
      },
    });

    return { success: true };
  },
});

// Remove musician from band chat
export const removeFromBandChat = mutation({
  args: {
    gigId: v.id("gigs"),
    musicianId: v.id("users"),
    clerkId: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const client = await getUserByClerkId(ctx, args.clerkId);
    const gig = await ctx.db.get(args.gigId);

    if (!gig) throw new Error("Gig not found");

    // Check permissions
    const canRemove = await checkRemovePermission(ctx, gig, client._id);
    if (!canRemove) {
      throw new Error("Not authorized to remove members from chat");
    }

    const chat = gig.bandChatId ? await ctx.db.get(gig.bandChatId) : null;
    if (!chat) {
      throw new Error("Band chat not found");
    }

    // Check if user is in the chat
    if (!chat.participantIds.includes(args.musicianId)) {
      return { success: true, notInChat: true };
    }

    // Don't allow removing the client/creator
    if (args.musicianId === gig.postedBy) {
      throw new Error("Cannot remove the chat creator");
    }

    // Remove musician from chat participantIds
    const updatedParticipantIds = chat.participantIds.filter(
      (id) => id !== args.musicianId
    );

    await ctx.db.patch(chat._id, {
      participantIds: updatedParticipantIds,
      lastMessage: `${args.musicianId === client._id ? "You" : "A member"} left the crew`,
      lastMessageAt: Date.now(),
    });

    // Add system message
    const musician = await ctx.db.get(args.musicianId);
    await ctx.db.insert("messages", {
      chatId: chat._id,
      senderId: client._id,
      content: `${musician?.firstname || musician?.username || "A member"} has left the crew chat${args.reason ? ` (${args.reason})` : ""}.`,
      messageType: "text",
      attachments: [],
      readBy: [],
      deliveredTo: updatedParticipantIds,
      status: "sent",
      isDeleted: false,
    });

    // Notify the removed musician
    await createNotificationInternal(ctx, {
      userDocumentId: args.musicianId,
      type: "removed_from_crew_chat",
      title: "👋 Removed from Crew Chat",
      message: `You've been removed from the crew chat for "${gig.title}"`,
      actionUrl: `/gigs/${gig._id}`,
      relatedUserDocumentId: client._id,
      metadata: {
        gigId: gig._id,
        gigTitle: gig.title,
        reason: args.reason,
      },
    });

    return { success: true };
  },
});

// Helper: Check if user can remove members
const checkRemovePermission = async (
  ctx: any,
  gig: any,
  userId: Id<"users">
) => {
  // Client can remove if they're admin
  if (gig.postedBy === userId) {
    return (
      gig.crewChatSettings?.clientRole === "admin" &&
      gig.crewChatSettings?.chatPermissions?.canRemoveMembers
    );
  }
  return false;
};

// Update crew chat settings
export const updateCrewChatSettings = mutation({
  args: {
    gigId: v.id("gigs"),
    clerkId: v.string(),
    settings: v.object({
      clientRole: v.optional(v.union(v.literal("admin"), v.literal("member"))),
      chatPermissions: v.optional(
        v.object({
          canSendMessages: v.optional(v.boolean()),
          canAddMembers: v.optional(v.boolean()),
          canRemoveMembers: v.optional(v.boolean()),
          canEditChatInfo: v.optional(v.boolean()),
        })
      ),
    }),
  },
  handler: async (ctx, args) => {
    const client = await getUserByClerkId(ctx, args.clerkId);
    const gig = await ctx.db.get(args.gigId);

    if (!gig) throw new Error("Gig not found");
    if (gig.postedBy !== client._id) {
      throw new Error("Only band creator can update chat settings");
    }

    if (!gig.bandChatId) {
      throw new Error("Crew chat not created yet");
    }

    // Build updated settings
    const currentSettings = gig.crewChatSettings || {
      clientRole: "member",
      chatPermissions: {
        canSendMessages: true,
        canAddMembers: false,
        canRemoveMembers: false,
        canEditChatInfo: false,
      },
      createdBy: client._id,
      createdAt: Date.now(),
    };

    const updatedSettings = {
      ...currentSettings,
      ...args.settings,
      chatPermissions: {
        ...currentSettings.chatPermissions,
        ...(args.settings.chatPermissions || {}),
      },
    };

    // Update gig settings
    await ctx.db.patch(gig._id, {
      crewChatSettings: updatedSettings,
      updatedAt: Date.now(),
    });

    // Update chat metadata if chat exists
    const chat = await ctx.db.get(gig.bandChatId);
    if (chat) {
      await ctx.db.patch(chat._id, {
        metadata: {
          ...chat.metadata,
          clientRole: updatedSettings.clientRole,
          permissions: updatedSettings.chatPermissions,
        },
      });

      // Add system message about settings change
      await ctx.db.insert("messages", {
        chatId: chat._id,
        senderId: client._id,
        content: `Chat settings updated. Client is now ${updatedSettings.clientRole}.`,
        messageType: "text",
        attachments: [],
        readBy: [],
        deliveredTo: chat.participantIds,
        status: "sent",
        isDeleted: false,
      });
    }

    return { success: true, settings: updatedSettings };
  },
});

// Get all crew chats for a user
export const getUserCrewChats = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByClerkId(ctx, args.clerkId);
    if (!user) return [];

    // Find all chats where user is a participant and is a crew chat
    const allChats = await ctx.db
      .query("chats")
      .filter((q) => q.eq(q.field("type"), "group"))
      .collect();

    const crewChats = [];

    for (const chat of allChats) {
      // Check if this is a crew chat
      if (chat.metadata?.isCrewChat && chat.participantIds.includes(user._id)) {
        // Get gig info
        const gig = await ctx.db
          .query("gigs")
          .withIndex("by_bandChatId", (q) => q.eq("bandChatId", chat._id))
          .first();

        if (gig) {
          // Get unread count
          const unreadCount = chat.unreadCounts?.[user._id] || 0;

          // Get last message
          const lastMessage = await ctx.db
            .query("messages")
            .withIndex("by_chatId", (q) => q.eq("chatId", chat._id))
            .order("desc")
            .first();

          crewChats.push({
            chatId: chat._id,
            name: chat.name,
            gigTitle: gig.title,
            gigId: gig._id,
            lastMessage: lastMessage?.content || chat.lastMessage,
            lastMessageAt: lastMessage?._creationTime || chat.lastMessageAt,
            unreadCount,
            participantCount: chat.participantIds.length,
            clientRole: gig.crewChatSettings?.clientRole || "member",
            isClient: gig.postedBy === user._id,
          });
        }
      }
    }

    // Sort by most recent activity
    return crewChats.sort(
      (a: any, b: any) => b.lastMessageAt - a.lastMessageAt
    );
  },
});

// Check if crew chat can be created for a gig
export const canCreateCrewChat = query({
  args: { gigId: v.id("gigs"), clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByClerkId(ctx, args.clerkId);
    const gig = await ctx.db.get(args.gigId);

    if (!gig || !user) {
      return { canCreate: false, reason: "Gig or user not found" };
    }

    // Check if user is gig creator
    if (gig.postedBy !== user._id) {
      return {
        canCreate: false,
        reason: "Only gig creator can create crew chat",
      };
    }

    // Check if it's a band gig
    if (!gig.isClientBand) {
      return { canCreate: false, reason: "Not a band gig" };
    }

    // Check if chat already exists
    if (gig.bandChatId) {
      const existingChat = await ctx.db.get(gig.bandChatId);
      if (existingChat) {
        return {
          canCreate: false,
          reason: "Crew chat already exists",
          chatId: gig.bandChatId,
          alreadyExists: true,
        };
      }
    }

    // Check if all roles are filled
    if (!gig.bandCategory || gig.bandCategory.length === 0) {
      return { canCreate: false, reason: "No band roles defined" };
    }

    const allRolesFilled = gig.bandCategory.every(
      (role: any) => role.filledSlots >= role.maxSlots
    );

    if (!allRolesFilled) {
      const unfilledRoles = gig.bandCategory
        .filter((role: any) => role.filledSlots < role.maxSlots)
        .map((role: any) => role.role);

      return {
        canCreate: false,
        reason: "All roles must be filled",
        unfilledRoles,
      };
    }

    // Check if there are any booked musicians
    const hasBookedMusicians = gig.bandCategory.some(
      (role: any) => role.bookedUsers && role.bookedUsers.length > 0
    );

    if (!hasBookedMusicians) {
      return { canCreate: false, reason: "No musicians booked yet" };
    }

    return {
      canCreate: true,
      musicianCount: gig.bandCategory.reduce(
        (total: number, role: any) => total + (role.bookedUsers?.length || 0),
        0
      ),
    };
  },
});
