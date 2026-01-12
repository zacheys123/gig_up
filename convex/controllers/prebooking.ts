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
  },
  handler: async (ctx, args) => {
    return addToShortlistLogic(ctx, args);
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

// convex/preBooking.ts - Universal booking mutation
export const bookMusician = mutation({
  args: {
    gigId: v.id("gigs"),
    musicianId: v.id("users"),
    source: v.union(
      v.literal("interested"),
      v.literal("shortlisted"),
      v.literal("regular")
    ),
    agreedPrice: v.optional(v.number()),
    notes: v.optional(v.string()),
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

    const musician = await ctx.db.get(args.musicianId);
    if (!musician) throw new Error("Musician not found");

    if (gig.isTaken) {
      throw new Error("Gig is already booked");
    }

    // Create booking history entry
    const bookingEntry = {
      entryId: `${args.gigId}-${args.musicianId}-${Date.now()}`,
      timestamp: Date.now(),
      userId: args.musicianId,
      userRole: musician.roleType,
      status: "booked" as "booked",
      gigType: gig.isClientBand ? ("band" as "band") : ("regular" as "regular"),
      actionBy: user._id,
      actionFor: args.musicianId,
      notes: args.notes || `Booked from ${args.source}`,
      agreedPrice: args.agreedPrice,
    };

    // Update gig - clear all arrays regardless of source
    await ctx.db.patch(args.gigId, {
      isTaken: true,
      isActive: false,
      isPending: false,
      bookedBy: args.musicianId,
      // Clear ALL arrays
      interestedUsers: [],
      shortlistedUsers: [],
      appliedUsers: [],
      bookingHistory: [...(gig.bookingHistory || []), bookingEntry],
      updatedAt: Date.now(),
    });

    // Create notification
    await createNotificationInternal(ctx, {
      userDocumentId: args.musicianId,
      type: "gig_approved",
      title: "🎉 You've Been Booked!",
      message: `${user.firstname || user.username} has booked you for "${gig.title}"!`,
      actionUrl: `/gigs/${args.gigId}`,
      relatedUserDocumentId: user._id,
    });

    return {
      success: true,
      message: "Musician booked successfully",
      gigId: args.gigId,
      musicianId: args.musicianId,
    };
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
