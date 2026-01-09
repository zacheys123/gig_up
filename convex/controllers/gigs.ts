// convex/controllers/gigs.ts
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import {
  createGigNotification,
  createNotificationInternal,
} from "../createNotificationInternal";
import { applyFirstGigBonusInternal } from "./trustScore";
import { Id } from "../_generated/dataModel";
import { checkGigLimit, updateWeeklyGigCount } from "../gigsLimit";
import { getUserByClerkId } from "./bookings";
interface ProcessedBandRole {
  role: string;
  maxSlots: number;
  filledSlots: number;
  applicants: Id<"users">[];
  bookedUsers: Id<"users">[];
  requiredSkills?: string[];
  description?: string;
  isLocked?: boolean;
  price?: number;
  currency?: string;
  negotiable?: boolean;
}
// Define proper types
interface BandMember {
  userId: Id<"users">;
  name: string;
  role: string;
  joinedAt: number;
  price?: number;
  bookedBy?: Id<"users">;
  status?: "pending" | "booked" | "confirmed" | "cancelled";
  notes?: string;
  email?: string;
  phone?: string;
  picture?: string;
  skills?: string;
  experience?: string;
}

interface BookingHistoryEntry {
  userId: Id<"users">;
  status: "pending" | "booked" | "completed" | "cancelled";
  timestamp: number;
  role: string;
  notes?: string;
  price?: number;
  bookedBy?: Id<"users">;
  action?: string;
  gigType?: "regular" | "band";
  metadata?: Record<string, any>;
}

// =================== REGULAR GIG FUNCTIONS ===================

/**
 * Show interest in a regular gig (for regular users)
 * Adds user to interestedUsers array
 */
export const showInterestInGig = mutation({
  args: {
    gigId: v.id("gigs"),
    userId: v.id("users"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { gigId, userId, notes } = args;

    const gig = await ctx.db.get(gigId);
    if (!gig) throw new Error("Gig not found");

    // Check if this is a band gig
    if (gig.isClientBand) {
      throw new Error(
        "This is a band gig - use joinBand or bookUserForBand instead"
      );
    }

    // Check if gig is active
    if (!gig.isActive) {
      throw new Error("This gig is no longer active");
    }

    // FINAL BOSS CHECK: isTaken means gig is completely booked
    if (gig.isTaken) {
      throw new Error("This gig has already been taken");
    }

    // For regular gigs, also check if bookedBy exists
    if (gig.bookedBy) {
      throw new Error("This gig has already been booked by another musician");
    }

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const currentInterestedUsers = gig.interestedUsers || [];

    // Check if user already showed interest
    if (currentInterestedUsers.includes(userId)) {
      throw new Error("You've already shown interest in this gig");
    }

    // Check if gig is full (for regular gigs) - maxSlots limits how many can show interest
    const maxSlots = gig.maxSlots || 10;
    if (currentInterestedUsers.length >= maxSlots) {
      throw new Error("This gig has reached maximum interest capacity");
    }

    // Add to interestedUsers
    const updatedInterestedUsers = [...currentInterestedUsers, userId];
    const position = updatedInterestedUsers.length; // User's position in queue

    // Use the enhanced booking entry format with "applied" status instead of "pending"
    const bookingEntry = {
      entryId: `${gigId}_${userId}_${Date.now()}`,
      timestamp: Date.now(),
      userId: userId,
      userRole: user.roleType || "musician",
      isBandRole: false,
      status: "applied" as const, // Changed from "pending" to "applied"
      gigType: "regular" as const,
      actionBy: userId,
      actionFor: userId,
      notes: notes || "",
      reason: "Showed interest in gig",
      metadata: {
        userRole: user.roleType,
        userName: user.firstname || user.username,
        position: position,
        totalSlots: maxSlots,
        availableSlots: maxSlots - position,
        // Include legacy fields in metadata for compatibility
        legacyAction: "interest_shown",
        legacyRole: user.roleType || "musician",
      },
      // Include price info if available
      proposedPrice: gig.price,
      currency: gig.currency,
    };

    await ctx.db.patch(gigId, {
      interestedUsers: updatedInterestedUsers,
      bookingHistory: [...(gig.bookingHistory || []), bookingEntry],
      updatedAt: Date.now(),
      // IMPORTANT: Don't set isTaken here! isTaken is only set when someone is actually booked
      // isTaken will be set in selectMusicianFromInterested when bookedBy is assigned
    });

    // Create notification for gig poster
    const gigPoster = await ctx.db.get(gig.postedBy);
    if (gigPoster) {
      await createNotificationInternal(ctx, {
        userDocumentId: gig.postedBy,
        type: "gig_interest",
        title: "🎵 New Interest in Your Gig!",
        message: `${user.firstname || user.username} is interested in your gig "${gig.title}"`,
        image: user.picture,
        actionUrl: `/gigs/${gigId}`,
        relatedUserDocumentId: userId,
        metadata: {
          gigId,
          gigTitle: gig.title,
          interestedUserId: userId,
          userName: user.firstname || user.username,
          userRole: user.roleType,
          availableSlots: maxSlots - updatedInterestedUsers.length,
          position: position,
          notes: notes || "",
        },
      });
    }

    // Create confirmation notification for the user
    await createNotificationInternal(ctx, {
      userDocumentId: userId,
      type: "interest_confirmation",
      title: "✅ Interest Recorded!",
      message: `Your interest in "${gig.title}" has been recorded. Position: #${position}`,
      image: gig.logo,
      actionUrl: `/gigs/${gigId}`,
      relatedUserDocumentId: gig.postedBy,
      metadata: {
        gigId,
        gigTitle: gig.title,
        position: position,
        totalSlots: maxSlots,
        availableSlots: maxSlots - position,
      },
    });

    try {
      await ctx.db.patch(userId, {
        totalInterests: (user.totalInterests || 0) + 1,
        lastInterestAt: Date.now(),
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error("Failed to update user stats:", error);
    }

    return {
      success: true,
      availableSlots: maxSlots - updatedInterestedUsers.length,
      position: position,
      totalSlots: maxSlots,
      totalInterested: updatedInterestedUsers.length,
    };
  },
});

/**
 * Remove interest from a gig
 */
export const removeInterestFromGig = mutation({
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

    if (gig.isClientBand) {
      throw new Error("This is a band gig - use leaveBand instead");
    }

    const currentInterestedUsers = gig.interestedUsers || [];

    if (!currentInterestedUsers.includes(musician._id)) {
      throw new Error("You haven't shown interest in this gig");
    }

    // Remove from interestedUsers
    const updatedInterestedUsers = currentInterestedUsers.filter(
      (id) => id !== musician._id
    );

    // Create enhanced booking history entry
    const cancellationEntry = {
      entryId: `${gigId}_${musician._id}_${Date.now()}`,
      timestamp: Date.now(),
      userId: musician._id,
      userRole: "musician",
      bandRole: musician.roleType || gig.category || "musician",
      isBandRole: false,
      status: "cancelled" as const,
      gigType: "regular" as const,
      actionBy: musician._id,
      actionFor: musician._id,
      reason: reason || "Withdrew interest from gig",
      metadata: {
        action: "interest_removed",
        gigTitle: gig.title,
        musicianName: musician.firstname || musician.username,
        previousInterestedCount: currentInterestedUsers.length,
        remainingInterestedCount: updatedInterestedUsers.length,
        gigPrice: gig.price,
        gigCurrency: gig.currency,
      },
    };

    await ctx.db.patch(gigId, {
      interestedUsers: updatedInterestedUsers,
      bookingHistory: [...(gig.bookingHistory || []), cancellationEntry],
      updatedAt: Date.now(),
      // Only reset taken status if the gig was actually taken
      ...(gig.isTaken && { isTaken: false }),
    });

    // NOTIFY GIG POSTER
    const gigPoster = await ctx.db.get(gig.postedBy);
    if (gigPoster) {
      await createNotificationInternal(ctx, {
        userDocumentId: gig.postedBy,
        type: "interest_removed",
        title: "🔄 Interest Withdrawn",
        message: `${musician.firstname || musician.username} withdrew interest from "${gig.title}"`,
        image: musician.picture,
        actionUrl: `/gigs/${gigId}`,
        relatedUserDocumentId: musician._id,
        metadata: {
          gigId,
          gigTitle: gig.title,
          removedUserId: musician._id,
          musicianName: musician.firstname || musician.username,
          reason: reason || "",
          remainingInterested: updatedInterestedUsers.length,
        },
      });
    }

    // Update musician's stats
    try {
      await ctx.db.patch(musician._id, {
        totalInterests: Math.max(0, (musician.totalInterests || 0) - 1),
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error("Failed to update user stats:", error);
    }

    return {
      success: true,
      availableSlots: (gig.maxSlots || 1) - updatedInterestedUsers.length,
      totalInterested: updatedInterestedUsers.length,
    };
  },
});

export const selectMusicianFromInterested = mutation({
  args: {
    gigId: v.id("gigs"),
    musicianId: v.id("users"),
    clerkId: v.string(), // Client's Clerk ID
    bookedPrice: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { gigId, musicianId, clerkId, bookedPrice, notes } = args;

    // Get client user from Clerk ID
    const clientUser = await getUserByClerkId(ctx, clerkId);
    if (!clientUser) throw new Error("Client not found");

    const gig = await ctx.db.get(gigId);
    if (!gig) throw new Error("Gig not found");

    // Check if caller is the gig poster
    if (gig.postedBy !== clientUser._id) {
      throw new Error("Only the gig creator can select musicians");
    }

    // Check if this is a band gig
    if (gig.isClientBand) {
      throw new Error("This is a band gig - use bookUserForBand instead");
    }

    // FINAL BOSS CHECK: isTaken means gig is completely booked
    if (gig.isTaken) {
      throw new Error("This gig has already been taken");
    }

    // Check if user is in interestedUsers
    const interestedUsers = gig.interestedUsers || [];
    if (!interestedUsers.includes(musicianId)) {
      throw new Error("This musician hasn't shown interest in the gig");
    }

    // Check if gig already has bookedBy
    if (gig.bookedBy) {
      throw new Error("This gig already has a booked musician");
    }

    const musician = await ctx.db.get(musicianId);
    if (!musician) throw new Error("Musician not found");

    // For regular gigs, usually maxSlots = 1 (single musician)
    const maxSlots = gig.maxSlots || 1;

    // Create enhanced booking history entry
    const bookingEntry = {
      entryId: `${gigId}_${musicianId}_${Date.now()}`,
      timestamp: Date.now(),
      userId: musicianId,
      userRole: "musician",
      bandRole: musician.roleType || gig.category || "musician",
      isBandRole: false,
      status: "booked" as const,
      gigType: "regular" as const,
      proposedPrice: gig.price,
      agreedPrice: bookedPrice || gig.price,
      currency: gig.currency,
      actionBy: clientUser._id,
      actionFor: musicianId,
      notes: notes || "",
      reason: "Selected from interested users",
      metadata: {
        selectedFromInterested: true,
        previousInterestedCount: interestedUsers.length,
        musicianRole: musician.roleType,
        musicianInstrument: musician.instrument,
        musicianExperience: musician.experience,
      },
    };

    // Update gig status - SET isTaken = true because gig is now booked!
    await ctx.db.patch(gigId, {
      isTaken: true, // FINAL BOSS: gig is now taken
      isPending: false,
      bookedBy: musicianId,
      interestedUsers: [], // Clear interested users since gig is taken
      bookingHistory: [...(gig.bookingHistory || []), bookingEntry],
      updatedAt: Date.now(),
    });

    // NOTIFY THE SELECTED MUSICIAN
    await createNotificationInternal(ctx, {
      userDocumentId: musicianId,
      type: "gig_selected",
      title: "🎉 You've Been Selected!",
      message: `You've been selected for the gig "${gig.title}"!`,
      image: gig.logo,
      actionUrl: `/gigs/${gigId}`,
      relatedUserDocumentId: clientUser._id,
      metadata: {
        gigId,
        gigTitle: gig.title,
        bookedPrice: bookedPrice || gig.price,
        currency: gig.currency,
        notes: notes || "",
        clientId: clientUser._id,
        selectedFromInterested: true,
      },
    });

    // NOTIFY OTHER INTERESTED MUSICIANS THEY WEREN'T SELECTED
    const otherInterestedUsers = interestedUsers.filter(
      (id) => id !== musicianId
    );

    await Promise.all(
      otherInterestedUsers.map(async (userId) => {
        try {
          await createNotificationInternal(ctx, {
            userDocumentId: userId,
            type: "gig_not_selected",
            title: "ℹ️ Update on Your Interest",
            message: `Another musician was selected for "${gig.title}". Keep applying for other gigs!`,
            image: gig.logo,
            actionUrl: `/gigs/explore`,
            relatedUserDocumentId: clientUser._id,
            metadata: {
              gigId,
              gigTitle: gig.title,
              totalApplicants: interestedUsers.length,
            },
          });
        } catch (error) {
          console.error("Failed to notify user:", error);
        }
      })
    );

    return { success: true };
  },
});

// =================== SAVE/FAVORITE/VIEW MUTATIONS ===================

/**
 * Save a gig for later viewing
 * Adds gig ID to user's savedGigs array
 */
export const saveGig = mutation({
  args: {
    userId: v.id("users"),
    gigId: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, gigId } = args;

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const savedGigs = user.savedGigs || [];

    // Check if already saved
    if (savedGigs.includes(gigId)) {
      throw new Error("Gig already saved");
    }

    // Add to saved gigs
    const updatedSavedGigs = [...savedGigs, gigId];

    await ctx.db.patch(userId, {
      savedGigs: updatedSavedGigs,
      updatedAt: Date.now(),
    });

    return { success: true, savedCount: updatedSavedGigs.length };
  },
});

/**
 * Remove a gig from saved list
 */
export const unsaveGig = mutation({
  args: {
    userId: v.id("users"),
    gigId: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, gigId } = args;

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const savedGigs = user.savedGigs || [];

    // Check if gig is saved
    if (!savedGigs.includes(gigId)) {
      throw new Error("Gig not found in saved list");
    }

    // Remove from saved gigs
    const updatedSavedGigs = savedGigs.filter((id) => id !== gigId);

    await ctx.db.patch(userId, {
      savedGigs: updatedSavedGigs,
      updatedAt: Date.now(),
    });

    return { success: true, savedCount: updatedSavedGigs.length };
  },
});

/**
 * Favorite a gig (different from saving - for quick access/starring)
 */
export const favoriteGig = mutation({
  args: {
    userId: v.id("users"),
    gigId: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, gigId } = args;

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const favoriteGigs = user.favoriteGigs || [];

    // Check if already favorited
    if (favoriteGigs.includes(gigId)) {
      throw new Error("Gig already favorited");
    }

    // Add to favorite gigs
    const updatedFavoriteGigs = [...favoriteGigs, gigId];

    await ctx.db.patch(userId, {
      favoriteGigs: updatedFavoriteGigs,
      updatedAt: Date.now(),
    });

    // Create notification/activity log if desired
    const gig = await ctx.db.get(gigId as Id<"gigs">);
    if (gig) {
      await createNotificationInternal(ctx, {
        userDocumentId: gig.postedBy,
        type: "gig_favorited",
        title: "⭐ Gig Favorited!",
        message: `${user.firstname || user.username} favorited your gig "${gig.title}"`,
        image: user.picture,
        actionUrl: `/gigs/${gigId}`,
        relatedUserDocumentId: userId,
        metadata: {
          gigId,
          gigTitle: gig.title,
        },
      });
    }

    return { success: true, favoriteCount: updatedFavoriteGigs.length };
  },
});

/**
 * Remove a gig from favorites
 */
export const unfavoriteGig = mutation({
  args: {
    userId: v.id("users"),
    gigId: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, gigId } = args;

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const favoriteGigs = user.favoriteGigs || [];

    // Check if gig is favorited
    if (!favoriteGigs.includes(gigId)) {
      throw new Error("Gig not found in favorites");
    }

    // Remove from favorite gigs
    const updatedFavoriteGigs = favoriteGigs.filter((id) => id !== gigId);

    await ctx.db.patch(userId, {
      favoriteGigs: updatedFavoriteGigs,
      updatedAt: Date.now(),
    });

    return { success: true, favoriteCount: updatedFavoriteGigs.length };
  },
});

/**
 * Increment view count for a gig
 * Tracks unique user views to prevent spam
 */
export const incrementViewCount = mutation({
  args: {
    gigId: v.id("gigs"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { gigId, userId } = args;

    const gig = await ctx.db.get(gigId);
    if (!gig) throw new Error("Gig not found");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const viewCount = gig.viewCount || [];

    // Check if user already viewed this gig
    if (viewCount.includes(userId)) {
      return { success: true, isNewView: false, totalViews: viewCount.length };
    }

    // Add user to view count
    const updatedViewCount = [...viewCount, userId];

    await ctx.db.patch(gigId, {
      viewCount: updatedViewCount,
      updatedAt: Date.now(),
    });

    // Create view activity log
    const viewEntry = {
      userId,
      timestamp: Date.now(),
      action: "viewed",
      gigType: gig.isClientBand ? "band" : "regular",
    };

    // Optional: Update user's viewed gigs history
    try {
      const userViewedGigs = user.viewedGigs || [];
      if (!userViewedGigs.includes(gigId)) {
        await ctx.db.patch(userId, {
          viewedGigs: [...userViewedGigs, gigId],
          lastViewedAt: Date.now(),
        });
      }
    } catch (error) {
      console.error("Failed to update user viewed gigs:", error);
    }

    // Optional: Notify gig poster about significant view milestones
    const totalViews = updatedViewCount.length;
    if (totalViews % 10 === 0) {
      const gigPoster = await ctx.db.get(gig.postedBy);
      if (gigPoster) {
        await createNotificationInternal(ctx, {
          userDocumentId: gig.postedBy,
          type: "gig_view_milestone",
          title: "👀 View Milestone!",
          message: `Your gig "${gig.title}" has reached ${totalViews} views!`,
          actionUrl: `/gigs/${gigId}`,
          metadata: {
            gigId,
            gigTitle: gig.title,
            viewCount: totalViews,
          },
        });
      }
    }

    return { success: true, isNewView: true, totalViews };
  },
});

// =================== QUERIES ===================

/**
 * Get interested users with details
 */
export const getInterestedUsersWithDetails = query({
  args: { gigId: v.id("gigs") },
  handler: async (ctx, args) => {
    const gig = await ctx.db.get(args.gigId);
    if (!gig) return [];

    const interestedUserIds = gig.interestedUsers || [];

    // Get user details for each interested user
    const interestedUsers = await Promise.all(
      interestedUserIds.map(async (userId) => {
        const user = await ctx.db.get(userId);
        if (!user) return null;

        // Type assertion for booking history
        const userBookingHistory = (gig.bookingHistory || [])
          .filter((entry: any) => entry.userId === userId)
          .sort((a: any, b: any) => b.timestamp - a.timestamp);

        const latestEntry = userBookingHistory[0];
        const latestStatus = latestEntry?.status || "pending";

        return {
          userId,
          user: {
            _id: user._id,
            firstname: user.firstname || "",
            lastname: user.lastname || "",
            username: user.username || "",
            email: user.email || "",
            picture: user.picture || "",
            phone: user.phone || "",
            city: user.city || "",
            roleType: user.roleType || "",
            instrument: user.instrument || [], // Changed from skills
            experience: user.experience || "",
            trustscore: user.trustScore || 0, // Changed from rating
            totalGigs: user.totalInterests || 0,
            // Add other fields that exist
            isMusician: user.isMusician || false,
          },
          status: latestStatus,
          interestedAt: latestEntry?.timestamp || gig.updatedAt,
          notes: latestEntry?.notes || "",
          position: interestedUserIds.indexOf(userId) + 1,
        };
      })
    );

    // Filter out null values
    return interestedUsers
      .filter((user) => user !== null)
      .sort((a, b) => a.position - b.position);
  },
});

/**
 * Get gigs user is interested in
 */
export const getUserInterestedGigs = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return [];

    // Get all active gigs
    const allGigs = await ctx.db
      .query("gigs")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Filter gigs where user is in interestedUsers
    const interestedGigs = allGigs.filter((gig) =>
      gig.interestedUsers?.includes(args.userId)
    );

    // Get detailed info for each gig
    const gigsWithDetails = await Promise.all(
      interestedGigs.map(async (gig) => {
        const poster = await ctx.db.get(gig.postedBy);
        const userBookingHistory = (gig.bookingHistory || [])
          .filter((entry: any) => entry.userId === args.userId)
          .sort((a: any, b: any) => b.timestamp - a.timestamp);

        const latestStatus = userBookingHistory[0]?.status || "pending";
        const position = gig.interestedUsers
          ? gig.interestedUsers.indexOf(args.userId) + 1
          : 0;

        return {
          ...gig,
          poster: poster
            ? {
                _id: poster._id,
                firstname: poster.firstname,
                picture: poster.picture,
                city: poster.city,
              }
            : null,
          userStatus: {
            status: latestStatus,
            interestedAt: userBookingHistory[0]?.timestamp || gig.updatedAt,
            position: position,
            totalApplicants: gig.interestedUsers?.length || 0,
            isClientBand: gig.isClientBand || false,
          },
        };
      })
    );

    // Sort by most recent interest
    return gigsWithDetails.sort(
      (a, b) => b.userStatus.interestedAt - a.userStatus.interestedAt
    );
  },
});

export const getBandDetails = query({
  args: { gigId: v.id("gigs") },
  handler: async (ctx, args) => {
    const gig = await ctx.db.get(args.gigId);
    if (!gig) return null;

    const isClientBand = gig.isClientBand || false;

    // Get detailed member info
    const bandMembersWithDetails = await Promise.all(
      (gig.bookCount || []).map(async (member: any) => {
        // Fetch user document for each member with type assertion
        const user = (await ctx.db.get(member.userId)) as any; // Type assertion

        if (!user) {
          return {
            ...member,
            userDetails: null,
          };
        }

        // Now you can access user fields:
        return {
          ...member,
          userDetails: {
            _id: user._id,
            // These are USER fields
            firstname: user.firstname || "",
            username: user.username || "",
            picture: user.picture || "",
            email: user.email || "",
            phone: user.phone || "",
            city: user.city || "",
            trustscore: user.trustscore || 0,
            totalGigs: user.totalGigs || 0,
            instrument: user.instrument || [],
            experience: user.experience || "",
            roleType: user.roleType || "",
            isMusician: user.isMusician || false,
            lastname: user.lastname || "",
          },
        };
      })
    );

    // Get band creator info - fetch user document with type assertion
    const bandCreator = (await ctx.db.get(gig.postedBy)) as any; // Type assertion

    return {
      ...gig,
      isClientBand,
      maxSlots: gig.maxSlots || 5,
      bandMembers: bandMembersWithDetails,
      bandCreator: bandCreator
        ? {
            _id: bandCreator._id,
            // These are USER fields
            firstname: bandCreator.firstname || "",
            username: bandCreator.username || "",
            picture: bandCreator.picture || "",
            trustscore: bandCreator.trustscore || 0,
            city: bandCreator.city || "",
          }
        : null,
      availableSlots: (gig.maxSlots || 5) - (gig.bookCount?.length || 0),
      filledRoles: (gig.bookCount || []).map((m: any) => m.role),
    };
  },
});

// Get gig type info
export const getGigTypeInfo = query({
  args: { gigId: v.id("gigs") },
  handler: async (ctx, args) => {
    const gig = await ctx.db.get(args.gigId);
    if (!gig) return null;

    const isClientBand = gig.isClientBand || false;

    if (isClientBand) {
      const bandMembers = gig.bookCount || [];
      const maxSlots = gig.maxSlots || 5;

      return {
        type: "band" as const,
        totalSlots: maxSlots,
        filledSlots: bandMembers.length,
        availableSlots: maxSlots - bandMembers.length,
        members: bandMembers,
        isFull: bandMembers.length >= maxSlots,
      };
    } else {
      const interestedUsers = gig.interestedUsers || [];
      const maxSlots = gig.maxSlots || 10;

      return {
        type: "regular" as const,
        totalSlots: maxSlots,
        filledSlots: interestedUsers.length,
        availableSlots: maxSlots - interestedUsers.length,
        interestedUsers: interestedUsers,
        isFull: interestedUsers.length >= maxSlots,
      };
    }
  },
});

// Check if user can join band (available roles)
export const getAvailableBandRoles = query({
  args: { gigId: v.id("gigs") },
  handler: async (ctx, args) => {
    const gig = await ctx.db.get(args.gigId);
    if (!gig || !gig.isClientBand) return [];

    const currentBandMembers = gig.bookCount || [];
    const maxSlots = gig.maxSlots || 5;

    if (currentBandMembers.length >= maxSlots) {
      return []; // No slots available
    }

    // Common music roles
    const allRoles = [
      "Vocalist",
      "Lead Guitarist",
      "Rhythm Guitarist",
      "Bassist",
      "Drummer",
      "Pianist/Keyboardist",
      "Saxophonist",
      "Trumpeter",
      "Violinist",
      "DJ",
      "MC",
      "Backup Vocalist",
      "Percussionist",
      "Other",
    ];

    // Get filled roles
    const filledRoles = new Set(
      currentBandMembers.map((member) => member.role)
    );

    // Return available roles
    return allRoles.filter((role) => !filledRoles.has(role));
  },
});

/**
 * Get user's saved gigs
 */
export const getSavedGigs = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return [];

    const savedGigIds = user.savedGigs || [];

    // Fetch all saved gigs
    const savedGigs = await Promise.all(
      savedGigIds.map(async (gigId) => {
        try {
          const gig = await ctx.db.get(gigId as Id<"gigs">);
          if (gig) {
            const poster = await ctx.db.get(gig.postedBy);
            return {
              ...gig,
              poster: poster
                ? {
                    _id: poster._id,
                    firstname: poster.firstname,
                    picture: poster.picture,
                  }
                : null,
              savedAt: user.updatedAt,
            };
          }
          return null;
        } catch (error) {
          return null;
        }
      })
    );

    // Filter out null values (deleted gigs)
    return savedGigs.filter((gig) => gig !== null);
  },
});

/**
 * Get user's favorite gigs
 */
export const getFavoriteGigs = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return [];

    const favoriteGigIds = user.favoriteGigs || [];

    // Fetch all favorite gigs
    const favoriteGigs = await Promise.all(
      favoriteGigIds.map(async (gigId) => {
        try {
          const gig = await ctx.db.get(gigId as Id<"gigs">);
          if (gig) {
            const poster = await ctx.db.get(gig.postedBy);
            return {
              ...gig,
              poster: poster
                ? {
                    _id: poster._id,
                    firstname: poster.firstname,
                    picture: poster.picture,
                  }
                : null,
              favoritedAt: user.updatedAt,
            };
          }
          return null;
        } catch (error) {
          return null;
        }
      })
    );

    // Filter out null values
    return favoriteGigs.filter((gig) => gig !== null);
  },
});

/**
 * Check if a gig is saved/favorited by user
 */
export const getUserGigStatus = query({
  args: {
    userId: v.id("users"),
    gigId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return { isSaved: false, isFavorited: false };

    const savedGigs = user.savedGigs || [];
    const favoriteGigs = user.favoriteGigs || [];

    return {
      isSaved: savedGigs.includes(args.gigId),
      isFavorited: favoriteGigs.includes(args.gigId),
      savedCount: savedGigs.length,
      favoriteCount: favoriteGigs.length,
    };
  },
});

/**
 * Clear all saved gigs
 */
export const clearSavedGigs = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(args.userId, {
      savedGigs: [],
      updatedAt: Date.now(),
    });

    return { success: true, clearedCount: user.savedGigs?.length || 0 };
  },
});

/**
 * Clear all favorite gigs
 */
export const clearFavoriteGigs = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(args.userId, {
      favoriteGigs: [],
      updatedAt: Date.now(),
    });

    return { success: true, clearedCount: user.favoriteGigs?.length || 0 };
  },
});

// =================== OTHER GIG FUNCTIONS ===================

export const createGig = mutation({
  args: {
    isClientBand: v.optional(v.boolean()),
    maxSlots: v.optional(v.number()),
    postedBy: v.id("users"),
    title: v.string(),
    secret: v.string(),
    bussinesscat: v.string(),
    date: v.number(),
    time: v.object({
      start: v.string(),
      end: v.string(),
    }),
    logo: v.string(),
    description: v.optional(v.string()),
    phone: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(v.string()),
    location: v.optional(v.string()),
    font: v.optional(v.string()),
    fontColor: v.optional(v.string()),
    backgroundColor: v.optional(v.string()),
    gigtimeline: v.optional(v.string()),
    otherTimeline: v.optional(v.string()),
    day: v.optional(v.string()),
    mcType: v.optional(v.string()),
    mcLanguages: v.optional(v.string()),
    djGenre: v.optional(v.string()),
    djEquipment: v.optional(v.string()),
    pricerange: v.optional(v.string()),
    currency: v.optional(v.string()),
    scheduleDate: v.optional(v.number()),
    schedulingProcedure: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    requirements: v.optional(v.array(v.string())),
    benefits: v.optional(v.array(v.string())),
    bandCategory: v.optional(
      v.array(
        v.object({
          role: v.string(),
          maxSlots: v.number(),
          filledSlots: v.number(),
          applicants: v.array(v.id("users")),
          bookedUsers: v.array(v.id("users")),
          requiredSkills: v.optional(v.array(v.string())),
          description: v.optional(v.string()),
          isLocked: v.optional(v.boolean()),
          // Add these price fields
          price: v.optional(v.number()),
          currency: v.optional(v.string()),
          negotiable: v.optional(v.boolean()),
        })
      )
    ),
    vocalistGenre: v.optional(v.array(v.string())),
    bookedBy: v.optional(v.id("users")),
    paymentStatus: v.optional(
      v.union(v.literal("pending"), v.literal("paid"), v.literal("refunded"))
    ),
    cancellationReason: v.optional(v.string()),
    phoneNo: v.optional(v.string()),
    negotiable: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const {
      postedBy,
      title,
      secret,
      bussinesscat,
      date,
      time,
      logo,
      description,
      phone,
      price,
      category,
      location,
      font,
      fontColor,
      backgroundColor,
      gigtimeline,
      otherTimeline,
      day,
      mcType,
      mcLanguages,
      djGenre,
      djEquipment,
      pricerange,
      currency,
      scheduleDate,
      schedulingProcedure,
      tags,
      requirements,
      benefits,
      bandCategory,
      vocalistGenre,
      bookedBy,
      paymentStatus,
      cancellationReason,
      phoneNo,
      negotiable,
      isClientBand,
      maxSlots,
    } = args;

    // Validate required fields
    if (
      !postedBy ||
      !title ||
      !secret ||
      !bussinesscat ||
      !date ||
      !time ||
      !logo
    ) {
      throw new Error("Missing required fields");
    }

    const user = await ctx.db.get(postedBy);
    if (!user) {
      throw new Error("User not found");
    }
    const accountAge = Date.now() - (user._creationTime || Date.now());
    const isInGracePeriod = accountAge <= 26 * 24 * 60 * 60 * 1000; // 26 days
    const limitCheck = checkGigLimit(user, isInGracePeriod);

    if (!limitCheck.canPost) {
      throw new Error(limitCheck.errorMessage);
    }
    let relevantUsersQuery = ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("isMusician"), true))
      .filter((q) => q.neq(q.field("clerkId"), user.clerkId));

    const isFirstGig = !user.gigsPosted || user.gigsPosted === 0;

    // Combine phone and phoneNo for backward compatibility
    const phoneNumber = phone || phoneNo || "";

    let processedBandCategory: ProcessedBandRole[] = [];
    let processedIsClientBand = false;
    let processedMaxSlots = maxSlots;
    let processedCategory = category || "";

    switch (bussinesscat) {
      case "full": // Full Band - Creates a normal gig (no band setup)
        processedIsClientBand = false;
        processedBandCategory = [];
        processedMaxSlots = processedMaxSlots || 1;
        processedCategory = category || "full-band";
        break;

      case "personal": // Individual musician - Use category as instrument
        processedIsClientBand = false;
        processedBandCategory = [];
        processedMaxSlots = processedMaxSlots || 1;
        processedCategory = category || "individual";
        break;

      case "other": // Create Band - This is where we create band setup
        processedIsClientBand = true;
        processedBandCategory = (bandCategory || []).map((role: any) => ({
          role: role.role,
          maxSlots: role.maxSlots,
          filledSlots: 0,
          applicants: [],
          bookedUsers: [],
          requiredSkills: role.requiredSkills || [],
          description: role.description || "",
          isLocked: false,
          price: role.price || undefined,
          currency: role.currency || currency || "KES",
          negotiable: role.negotiable ?? negotiable ?? true,
        }));
        const totalBandSlots = processedBandCategory.reduce(
          (sum: number, role: any) => sum + role.maxSlots,
          0
        );
        processedMaxSlots = totalBandSlots || 5;
        processedCategory = "band-creation";

        relevantUsersQuery = relevantUsersQuery.filter((q) =>
          q.or(
            q.eq(q.field("openToBandWork"), true),
            q.eq(q.field("interestedInBands"), true)
          )
        );
        break;

      case "mc": // MC
      case "dj": // DJ
      case "vocalist": // Vocalist
        processedIsClientBand = false;
        processedBandCategory = [];
        processedMaxSlots = processedMaxSlots || 1;
        processedCategory = bussinesscat;
        break;

      default:
        processedIsClientBand = false;
        processedBandCategory = [];
        processedMaxSlots = processedMaxSlots || 1;
        processedCategory = category || "";
    }

    // ============================================
    // CREATE GIG RECORD
    // ============================================

    const gigId = await ctx.db.insert("gigs", {
      // Arrays with defaults
      interestedUsers: [],
      appliedUsers: [],
      viewCount: [],
      bookCount: [],
      bookingHistory: [],

      // Business category specific fields
      isClientBand: processedIsClientBand,
      maxSlots: processedMaxSlots,
      bandCategory: processedBandCategory,

      // Required fields
      postedBy,
      title,
      secret,
      bussinesscat,
      date,
      time,
      logo,

      // Optional fields with defaults
      description: description || "",
      phone: phoneNumber,
      price: price || 0,
      category: processedCategory,
      location: location || "",
      font: font || "Arial, sans-serif",
      fontColor: fontColor || "#000000",
      backgroundColor: backgroundColor || "#FFFFFF",
      gigtimeline: gigtimeline || "",
      otherTimeline: otherTimeline || "",
      day: day || "",

      // Talent-specific fields
      ...(bussinesscat === "mc" && {
        mcType: mcType || "",
        mcLanguages: mcLanguages || "",
      }),
      ...(bussinesscat === "dj" && {
        djGenre: djGenre || "",
        djEquipment: djEquipment || "",
      }),
      ...(bussinesscat === "vocalist" && {
        vocalistGenre: vocalistGenre || [],
      }),

      // Other fields
      pricerange: bussinesscat === "other" ? undefined : pricerange,
      currency: currency || "KES",
      scheduleDate: scheduleDate || date,
      schedulingProcedure: schedulingProcedure || "manual",
      tags: tags || [],
      requirements: requirements || [],
      benefits: benefits || [],

      // Status fields
      isTaken: false,
      isPending: false,
      isActive: true,
      isPublic: true,

      // Payment fields
      paymentStatus: paymentStatus || "pending",
      cancellationReason: cancellationReason || "",
      musicianConfirmPayment: undefined,
      clientConfirmPayment: undefined,
      gigRating: 0,

      negotiable: bussinesscat === "other" ? undefined : negotiable,

      // Timestamps
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Get poster info for notifications
    const posterUser = await ctx.db.get(postedBy);
    if (!posterUser) {
      return gigId;
    }

    // ============================================
    // UPDATE USER'S WEEKLY GIG COUNT
    // ============================================

    const updateWeeklyGigCount = (currentWeeklyData: any) => {
      // Get current week start (Monday)
      const now = new Date();
      const currentWeekStart = new Date(now);
      currentWeekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
      currentWeekStart.setHours(0, 0, 0, 0);

      const weekStartTimestamp = currentWeekStart.getTime();
      const currentGigsThisWeek = currentWeeklyData || {
        count: 0,
        weekStart: 0,
      };

      // Reset if new week
      if (currentGigsThisWeek.weekStart !== weekStartTimestamp) {
        return {
          count: 1,
          weekStart: weekStartTimestamp,
        };
      }

      // Increment if same week
      return {
        count: currentGigsThisWeek.count + 1,
        weekStart: weekStartTimestamp,
      };
    };

    // Update user's weekly gig count
    const updatedWeeklyData = updateWeeklyGigCount(user.gigsPostedThisWeek);

    // Update user stats
    await ctx.db.patch(user._id, {
      gigsPosted: (user.gigsPosted || 0) + 1,
      gigsPostedThisWeek: updatedWeeklyData,
      updatedAt: Date.now(),
    });

    // ============================================
    // NOTIFICATION LOGIC (Keep existing)
    // ============================================

    let notificationCriteria = "";
    let notificationDetails = "";

    switch (bussinesscat) {
      case "full":
        notificationCriteria = "Full Band";
        notificationDetails = "Looking for a complete band";
        break;
      case "personal":
        notificationCriteria = "Individual Musician";
        notificationDetails = `Looking for ${category || "a musician"}`;
        break;
      case "other":
        notificationCriteria = "Band Formation";
        notificationDetails = `Creating a band with ${processedBandCategory.length} roles`;
        break;
      case "mc":
        notificationCriteria = "MC";
        notificationDetails = `Type: ${mcType || "General"}`;
        break;
      case "dj":
        notificationCriteria = "DJ";
        notificationDetails = `Genre: ${djGenre || "Various"}`;
        break;
      case "vocalist":
        notificationCriteria = "Vocalist";
        notificationDetails = `Genres: ${vocalistGenre?.join(", ") || "Various"}`;
        break;
      default:
        notificationCriteria = bussinesscat;
    }

    // Apply first gig bonus if applicable
    if (isFirstGig) {
      try {
        await applyFirstGigBonusInternal(ctx, posterUser._id);
      } catch (error) {
        console.error("First gig bonus error:", error);
      }
    }

    // Find relevant musicians for notifications
    try {
      // Filter based on business category
      switch (bussinesscat) {
        case "full":
          // For full band, look for band leaders or versatile musicians
          relevantUsersQuery = relevantUsersQuery.filter((q) =>
            q.eq(q.field("roleType"), "band-leader")
          );
          break;
        case "personal":
          // For individual, filter by instrument if specified
          if (category) {
            relevantUsersQuery = relevantUsersQuery.filter((q) =>
              q.eq(q.field("instrument"), category)
            );
          }
          break;
        case "other":
          // For band creation, look for musicians interested in band gigs
          // or check if they have skills matching band roles
          if (processedBandCategory.length > 0) {
            const requiredSkills = processedBandCategory.flatMap(
              (role: any) => role.requiredSkills || []
            );
            if (requiredSkills.length > 0) {
              // Note: This is a simple filter, you might need a more complex query
              // for matching skills to instruments
              relevantUsersQuery = relevantUsersQuery.filter((q) =>
                q.or(
                  ...requiredSkills.map((skill: string) =>
                    q.eq(q.field("instrument"), skill)
                  )
                )
              );
            }
          }
          break;
        case "mc":
        case "dj":
        case "vocalist":
          // For specific talents, filter by roleType
          relevantUsersQuery = relevantUsersQuery.filter((q) =>
            q.eq(q.field("roleType"), bussinesscat)
          );
          break;
      }

      // Filter by location if available
      if (location && posterUser.city) {
        relevantUsersQuery = relevantUsersQuery.filter((q) =>
          q.eq(q.field("city"), posterUser.city)
        );
      }

      const relevantUsers = await relevantUsersQuery.take(15);

      // Create notifications for relevant musicians
      if (relevantUsers.length > 0) {
        const notificationPromises = relevantUsers.map(async (user) => {
          return createGigNotification(ctx, {
            recipientDocumentId: user._id,
            senderDocumentId: posterUser._id,
            type: "gig_opportunity",
            gigId,
            gigTitle: title,
            additionalMetadata: {
              bussinesscat,
              location: location || "Unknown location",
              price: price || 0,
              currency: currency || "KES",
              details: notificationDetails,
              isBandGig: bussinesscat === "other",
              bandRoleCount: processedBandCategory.length,
              totalSlots: processedMaxSlots,
            },
          });
        });

        await Promise.all(notificationPromises);
      }

      // Create confirmation notification for poster
      await createGigNotification(ctx, {
        recipientDocumentId: posterUser._id,
        senderDocumentId: posterUser._id, // Self notification
        type: "gig_created",
        gigId,
        gigTitle: title,
        additionalMetadata: {
          notifiedCount: relevantUsers.length,
          gigType: notificationCriteria,
        },
      });

      // Band setup notification
      if (bussinesscat === "other") {
        await createGigNotification(ctx, {
          recipientDocumentId: posterUser._id,
          senderDocumentId: posterUser._id,
          type: "band_setup_info",
          gigId,
          gigTitle: title,
          additionalMetadata: {
            bandRoleCount: processedBandCategory.length,
            totalSlots: processedMaxSlots,
          },
        });
      }

      // Update user's gig count
      await ctx.db.patch(posterUser._id, {
        gigsPosted: (posterUser.gigsPosted || 0) + 1,
      });
    } catch (error) {
      console.error("Error creating notifications:", error);
    }

    return gigId;
  },
});
// Run this once in a migration
export const resetAllWeeklyCounts = mutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    for (const user of users) {
      await ctx.db.patch(user._id, {
        gigsPostedThisWeek: { count: 0, weekStart: 0 },
      });
    }

    return users.length;
  },
});
export const updateGig = mutation({
  args: {
    gigId: v.id("gigs"),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      location: v.optional(v.string()),
      phone: v.optional(v.string()),
      phoneNo: v.optional(v.string()),
      price: v.optional(v.number()),
      currency: v.optional(v.string()),
      secret: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
      isPublic: v.optional(v.boolean()),
      isTaken: v.optional(v.boolean()),
      isPending: v.optional(v.boolean()),
      paymentStatus: v.optional(
        v.union(v.literal("pending"), v.literal("paid"), v.literal("refunded"))
      ),
      gigRating: v.optional(v.number()),
      font: v.optional(v.string()),
      fontColor: v.optional(v.string()),
      backgroundColor: v.optional(v.string()),
      logo: v.optional(v.string()),
      gigtimeline: v.optional(v.string()),
      otherTimeline: v.optional(v.string()),
      day: v.optional(v.string()),
      mcType: v.optional(v.string()),
      mcLanguages: v.optional(v.string()),
      djGenre: v.optional(v.string()),
      djEquipment: v.optional(v.string()),
      pricerange: v.optional(v.string()),
      category: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      requirements: v.optional(v.array(v.string())),
      benefits: v.optional(v.array(v.string())),
      bandCategory: v.optional(v.array(v.string())),
      vocalistGenre: v.optional(v.array(v.string())),
      cancellationReason: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { gigId, updates } = args;

    // Handle phone/phoneNo backward compatibility
    const normalizedUpdates: any = { ...updates };

    // If phoneNo is provided, also set phone for consistency
    if (normalizedUpdates.phoneNo !== undefined) {
      normalizedUpdates.phone = normalizedUpdates.phoneNo;
    }

    // Add updated timestamp
    normalizedUpdates.updatedAt = Date.now();

    await ctx.db.patch(gigId, normalizedUpdates);

    return gigId;
  },
});

// Delete gig mutation
export const deleteGig = mutation({
  args: { gigId: v.id("gigs") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.gigId);
    return args.gigId;
  },
});

// Explore gigs query
export const exploreGigs = query({
  args: {
    location: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    bussinesscat: v.optional(v.string()),
    limit: v.optional(v.number()),
    isClientBand: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("gigs");

    // Apply filters
    if (args.isClientBand !== undefined) {
      query = query.filter((q) =>
        q.eq(q.field("isClientBand"), args.isClientBand)
      );
    }

    const gigs = await query.order("desc").take(args.limit || 20);

    const gigsWithPosters = await Promise.all(
      gigs.map(async (gig) => {
        const poster = await ctx.db.get(gig.postedBy);
        return {
          ...gig,
          // Ensure arrays exist
          interestedUsers: gig.interestedUsers || [],
          appliedUsers: gig.appliedUsers || [],
          viewCount: gig.viewCount || [],
          bookCount: gig.bookCount || [],
          bookingHistory: gig.bookingHistory || [],
          isClientBand: gig.isClientBand || false,
          maxSlots: gig.maxSlots || 10,
          poster: poster
            ? {
                _id: poster._id,
                firstname: poster.firstname,
                picture: poster.picture,
                city: poster.city,
              }
            : null,
        };
      })
    );

    return gigsWithPosters;
  },
});

// Query for gig stats
export const getGigStats = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    let gigsQuery = ctx.db.query("gigs");

    if (args.userId) {
      gigsQuery = gigsQuery.filter((q) =>
        q.eq(q.field("postedBy"), args.userId)
      );
    } else {
      gigsQuery = gigsQuery.filter((q) => q.eq(q.field("isActive"), true));
    }

    const gigs = await gigsQuery.collect();

    const stats = {
      totalGigs: gigs.length,
      activeGigs: gigs.filter((g) => g.isActive).length,
      takenGigs: gigs.filter((g) => g.isTaken).length,
      pendingGigs: gigs.filter((g) => g.isPending).length,
      totalEarnings: gigs
        .filter((g) => g.paymentStatus === "paid")
        .reduce((sum, gig) => sum + (gig.price || 0), 0),
      averageRating:
        gigs.length > 0
          ? gigs.reduce((sum, gig) => sum + (gig.gigRating || 0), 0) /
            gigs.length
          : 0,
      totalViews: gigs.reduce(
        (sum, gig) => sum + ((gig?.viewCount && gig?.viewCount.length) || 0),
        0
      ),
    };

    return stats;
  },
});

export const getGigsWithUsers = query({
  args: {},
  handler: async (ctx, args) => {
    const gigs = await ctx.db.query("gigs").collect();

    // Fetch user details for each gig
    const gigsWithUsers = await Promise.all(
      gigs.map(async (gig) => {
        const postedByUser = await ctx.db.get(gig.postedBy);
        const bookedByUser = gig.bookedBy
          ? await ctx.db.get(gig.bookedBy)
          : null;

        return {
          ...gig,
          postedByUser,
          bookedByUser,
        };
      })
    );

    return gigsWithUsers;
  },
});

// Query for user's gig applications
export const getUserApplications = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return [];

    // Get all gigs where user is in appliedUsers array
    const gigs = await ctx.db
      .query("gigs")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const userApplications = gigs
      .filter((gig) => gig.appliedUsers?.includes(args.userId))
      .map((gig) => ({
        gig,
        appliedAt: gig.updatedAt,
        status: "pending",
      }));

    return userApplications;
  },
});

// Add helper query for getting user's gigs
export const getUserGigs = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const gigs = await ctx.db
      .query("gigs")
      .filter((q) => q.eq(q.field("postedBy"), args.userId))
      .order("desc")
      .collect();

    return gigs;
  },
});

export const getGigById = query({
  args: { gigId: v.id("gigs") },
  handler: async (ctx, args) => {
    const gig = await ctx.db.get(args.gigId);
    if (!gig) return null;

    // Get poster info
    const poster = await ctx.db.get(gig.postedBy);

    return {
      ...gig,
      // Ensure arrays exist
      interestedUsers: gig.interestedUsers || [],
      appliedUsers: gig.appliedUsers || [],
      viewCount: gig.viewCount || [],
      bookCount: gig.bookCount || [],
      bookingHistory: gig.bookingHistory || [],
      isClientBand: gig.isClientBand || false,
      maxSlots: gig.maxSlots || 10,
      poster: poster
        ? {
            _id: poster._id,
            firstname: poster.firstname,
            lastname: poster.lastname,
            picture: poster.picture,
            city: poster.city,
            totalGigs: poster.gigsPosted || 0,
          }
        : null,
    };
  },
});
