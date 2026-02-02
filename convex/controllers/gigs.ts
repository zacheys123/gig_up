// convex/controllers/gigs.ts
import { mutation, query, QueryCtx } from "../_generated/server";
import { v } from "convex/values";
import {
  createGigNotification,
  createNotificationInternal,
} from "../createNotificationInternal";
import { applyFirstGigBonusInternal } from "./trustScore";
import { Doc, Id } from "../_generated/dataModel";
import { checkGigLimit, updateWeeklyGigCount } from "../gigsLimit";
import { getUserByClerkId } from "./bookings";
import { updateUserTrust } from "../trustHelper";
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

// =================== REGULAR GIG FUNCTIONS ===================

/**
 * Show interest in a regular gig (for regular users)
 * Adds user to interestedUsers array
 */
export const showInterestInGig = mutation({
  args: {
    gigId: v.id("gigs"),
    userId: v.id("users"), // This should be Convex ID
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { gigId, userId, notes } = args;

    console.log("=== DEBUG Mutation ===");
    console.log("Received userId:", userId);
    console.log("Type of userId:", typeof userId);
    console.log("userId starts with 'jn':", userId.startsWith("jn"));

    const gig = await ctx.db.get(gigId);
    const user = await ctx.db.get(userId);

    console.log("Gig found:", !!gig);
    console.log("User found:", !!user);
    console.log("User from DB:", user);
    console.log("Current interestedUsers:", gig?.interestedUsers);

    if (!gig) throw new Error("Gig not found");
    if (!user)
      throw new Error(
        "User not found - make sure you're passing Convex ID, not Clerk ID",
      );

    // ... rest of your existing validation code ...

    // Check existing interest
    const currentInterestedUsers = gig.interestedUsers || [];
    console.log("Checking if user is already interested...");
    console.log("User ID to check:", userId);
    console.log("Interested users array:", currentInterestedUsers);
    console.log(
      "Is user already interested?",
      currentInterestedUsers.includes(userId),
    );

    if (currentInterestedUsers.includes(userId)) {
      throw new Error("You've already shown interest in this gig");
    }

    // ... rest of your code ...
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

    const updatedInterestedUsers = currentInterestedUsers.filter(
      (id) => id !== musician._id,
    );
    // Get max slots from gig (with default)
    const maxSlots = gig.maxSlots || 10;

    // Check if gig is no longer full
    const isStillFull = updatedInterestedUsers.length >= maxSlots;
    const cancellationEntry = {
      entryId: `${gigId}_${musician._id}_${Date.now()}`,
      timestamp: Date.now(),
      userId: musician._id,
      userRole: "musician",
      bandRole: musician.roleType || gig.category || "musician",

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
        wasFull: currentInterestedUsers.length >= maxSlots,
        isStillFull: isStillFull,
      },
    };

    await ctx.db.patch(gigId, {
      interestedUsers: updatedInterestedUsers,
      bookingHistory: [...(gig.bookingHistory || []), cancellationEntry],
      updatedAt: Date.now(),
      isPending: isStillFull, // Update isPending based on fullness
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
      isPending: false, // Change this to true when slots are filled
      bookedBy: musicianId,
      isActive: true,
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
      (id) => id !== musicianId,
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
      }),
    );
    // Update trust scores for both parties
    try {
      // Update musician's trust score (completed gig)
      await updateUserTrust(ctx, musicianId);

      // Update client's trust score (successful booking)
      await updateUserTrust(ctx, clientUser._id);
    } catch (error) {
      console.error("Failed to update trust scores:", error);
    }

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
      }),
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
      gig.interestedUsers?.includes(args.userId),
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
      }),
    );

    // Sort by most recent interest
    return gigsWithDetails.sort(
      (a, b) => b.userStatus.interestedAt - a.userStatus.interestedAt,
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
      }),
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
      // Fix: bandCategory is an array, need to aggregate bookedUsers from all roles
      const bandCategory = gig.bandCategory || [];
      const bandMembers = bandCategory.flatMap(
        (role) => role.bookedUsers || [],
      );
      const totalSlots = bandCategory.reduce(
        (sum, role) => sum + (role.maxSlots || 0),
        0,
      );
      const filledSlots = bandCategory.reduce(
        (sum, role) => sum + (role.filledSlots || 0),
        0,
      );
      const maxSlots = gig.maxSlots || totalSlots || 5;

      return {
        type: "band" as const,
        totalSlots: maxSlots,
        filledSlots: filledSlots,
        availableSlots: maxSlots - filledSlots,
        members: bandMembers,
        isFull: filledSlots >= maxSlots,
        bandRoles: bandCategory.map((role) => ({
          role: role.role,
          maxSlots: role.maxSlots || 0,
          filledSlots: role.filledSlots || 0,
          bookedUsers: role.bookedUsers || [],
          applicants: role.applicants || [],
        })),
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
// In convex/controllers/gigs.ts
export const getGigWithApplicants = query({
  args: { gigId: v.id("gigs") },
  handler: async (ctx, { gigId }) => {
    const gig = await ctx.db.get(gigId);
    if (!gig) throw new Error("Gig not found");

    const applicants: any[] = [];
    const bookedUsers: any[] = []; // NEW: Separate array for booked users
    const userDetails: Record<string, any> = {};
    const shortlisted: any[] = [];

    // Get applicants AND booked users directly from bandCategory
    if (gig.bandCategory && Array.isArray(gig.bandCategory)) {
      for (
        let bandRoleIndex = 0;
        bandRoleIndex < gig.bandCategory.length;
        bandRoleIndex++
      ) {
        const role = gig.bandCategory[bandRoleIndex];

        // Get APPLICANTS for this role (not yet booked)
        if (role.applicants && Array.isArray(role.applicants)) {
          for (const userId of role.applicants) {
            // Skip if user is already in bookedUsers (shouldn't happen, but just in case)
            if (role.bookedUsers && role.bookedUsers.includes(userId)) {
              continue;
            }

            try {
              const user = await ctx.db.get(userId);
              if (user) {
                applicants.push({
                  _id: `${userId}_${bandRoleIndex}`,
                  userId: userId,
                  bandRoleIndex: bandRoleIndex,
                  bandRole: role.role,
                  appliedAt: Date.now(), // You might want to track this from bookingHistory
                  applicationStatus: "applied",
                  type: "applicant",
                  isBooked: false,
                });

                userDetails[userId] = getUserDetails(user);
              }
            } catch (error) {
              console.error("Error fetching applicant:", userId, error);
            }
          }
        }

        // Get BOOKED USERS for this role
        if (role.bookedUsers && Array.isArray(role.bookedUsers)) {
          for (const userId of role.bookedUsers) {
            try {
              const user = await ctx.db.get(userId);
              if (user) {
                bookedUsers.push({
                  _id: `${userId}_${bandRoleIndex}_booked`,
                  userId: userId,
                  bandRoleIndex: bandRoleIndex,
                  bandRole: role.role,
                  bookedAt: Date.now(), // You might want to get this from bookingHistory
                  bookedPrice: role.bookedPrice || role.price,
                  type: "booked",
                  isBooked: true,
                });

                if (!userDetails[userId]) {
                  userDetails[userId] = getUserDetails(user);
                }
              }
            } catch (error) {
              console.error("Error fetching booked user:", userId, error);
            }
          }
        }
      }
    }

    // Get shortlisted users
    if (gig.shortlistedUsers && Array.isArray(gig.shortlistedUsers)) {
      for (const shortlistEntry of gig.shortlistedUsers) {
        if (shortlistEntry.status !== "removed") {
          shortlisted.push(shortlistEntry);
        }
      }
    }

    return {
      gig,
      applicants, // Users who applied but not booked yet
      bookedUsers, // Users who are already booked
      userDetails,
      shortlisted,
    };
  },
});

// Helper function to get user details
function getUserDetails(user: any) {
  return {
    ...user,
    avgRating: user.avgRating || 0,
    completedGigsCount: user.completedGigsCount || 0,
    rate: user.rate || { baseRate: "Contact" },
    firstname: user.firstname || user.username,
    username: user.username,
    picture: user.picture,
    city: user.city,
    verifiedIdentity: user.verifiedIdentity,
    trustTier: user.trustTier,
  };
}
// // Check if user can join band (available roles)
// export const getAvailableBandRoles = query({
//   args: { gigId: v.id("gigs") },
//   handler: async (ctx, args) => {
//     const gig = await ctx.db.get(args.gigId);
//     if (!gig || !gig.isClientBand) return [];

//     const currentBandMembers = gig.bookCount || [];
//     const maxSlots = gig.maxSlots || 5;

//     if (currentBandMembers.length >= maxSlots) {
//       return []; // No slots available
//     }

//     // Common music roles
//     const allRoles = [
//       "Vocalist",
//       "Lead Guitarist",
//       "Rhythm Guitarist",
//       "Bassist",
//       "Drummer",
//       "Pianist/Keyboardist",
//       "Saxophonist",
//       "Trumpeter",
//       "Violinist",
//       "DJ",
//       "MC",
//       "Backup Vocalist",
//       "Percussionist",
//       "Other",
//     ];

//     // Get filled roles
//     const filledRoles = new Set(
//       currentBandMembers.map((member) => member.role)
//     );

//     // Return available roles
//     return allRoles.filter((role) => !filledRoles.has(role));
//   },
// });

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
      }),
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
      }),
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
      durationFrom: v.optional(v.string()),
      durationTo: v.optional(v.string()),
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
          maxApplicants: v.optional(v.number()),
          currentApplicants: v.optional(v.number()),
        }),
      ),
    ),
    vocalistGenre: v.optional(v.array(v.string())),
    bookedBy: v.optional(v.id("users")),
    paymentStatus: v.optional(
      v.union(v.literal("pending"), v.literal("paid"), v.literal("refunded")),
    ),
    cancellationReason: v.optional(v.string()),
    phoneNo: v.optional(v.string()),
    negotiable: v.optional(v.boolean()),
    acceptInterestStartTime: v.optional(v.number()),
    acceptInterestEndTime: v.optional(v.number()),
    durationFrom: v.optional(v.string()), // Add this
    durationTo: v.optional(v.string()), // Add this
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
      acceptInterestStartTime,
      acceptInterestEndTime,
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
      console.log(postedBy, title, secret, bussinesscat, date, time, logo);
      throw new Error("Missing required fields");
    }
    console.log(postedBy, title, secret, bussinesscat, date, time, logo);
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

      case "other": // Create Band
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
          // ADD THESE:
          maxApplicants: role.maxApplicants || 20, // Default 20
          currentApplicants: 0, // Start at 0
        }));
        const totalBandSlots = processedBandCategory.reduce(
          (sum: number, role: any) => sum + role.maxSlots,
          0,
        );
        processedMaxSlots = totalBandSlots || 5;
        processedCategory = "band-creation";

        relevantUsersQuery = relevantUsersQuery.filter((q) =>
          q.or(
            q.eq(q.field("openToBandWork"), true),
            q.eq(q.field("interestedInBands"), true),
          ),
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
      acceptInterestStartTime: args.acceptInterestStartTime,
      acceptInterestEndTime: args.acceptInterestEndTime,
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

    // Add this type definition at the top of your file (after imports)
    type WeeklyGigData = {
      count: number;
      weekStart: number;
    };

    // Update the updateWeeklyGigCount function with explicit typing
    const updateWeeklyGigCount = (
      currentWeeklyData: WeeklyGigData | null,
    ): WeeklyGigData => {
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
    const updatedWeeklyData = updateWeeklyGigCount(
      user.gigsPostedThisWeek as WeeklyGigData | null,
    );

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
            q.eq(q.field("roleType"), "band-leader"),
          );
          break;
        case "personal":
          // For individual, filter by instrument if specified
          if (category) {
            relevantUsersQuery = relevantUsersQuery.filter((q) =>
              q.eq(q.field("instrument"), category),
            );
          }
          break;
        case "other":
          // For band creation, look for musicians interested in band gigs
          // or check if they have skills matching band roles
          if (processedBandCategory.length > 0) {
            const requiredSkills = processedBandCategory.flatMap(
              (role: any) => role.requiredSkills || [],
            );
            if (requiredSkills.length > 0) {
              // Note: This is a simple filter, you might need a more complex query
              // for matching skills to instruments
              relevantUsersQuery = relevantUsersQuery.filter((q) =>
                q.or(
                  ...requiredSkills.map((skill: string) =>
                    q.eq(q.field("instrument"), skill),
                  ),
                ),
              );
            }
          }
          break;
        case "mc":
        case "dj":
        case "vocalist":
          // For specific talents, filter by roleType
          relevantUsersQuery = relevantUsersQuery.filter((q) =>
            q.eq(q.field("roleType"), bussinesscat),
          );
          break;
      }

      // Filter by location if available
      if (location && posterUser.city) {
        relevantUsersQuery = relevantUsersQuery.filter((q) =>
          q.eq(q.field("city"), posterUser.city),
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
    try {
      await updateUserTrust(ctx, postedBy);
    } catch (error) {
      console.error("Failed to update trust score:", error);
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
        q.eq(q.field("isClientBand"), args.isClientBand),
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
      }),
    );

    return gigsWithPosters;
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
      }),
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
export const getGigsByUser = query({
  args: {
    clerkId: v.string(),
    // Optional filters
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("taken"),
        v.literal("pending"),
        v.literal("all"),
      ),
    ),
    gigType: v.optional(
      v.union(v.literal("regular"), v.literal("band"), v.literal("all")),
    ),
  },
  handler: async (ctx, args) => {
    const { clerkId, status = "all", gigType = "all" } = args;

    // Get user by clerkId
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user) {
      return [];
    }

    // Get all gigs posted by this user
    let gigs = await ctx.db
      .query("gigs")
      .withIndex("by_postedBy", (q) => q.eq("postedBy", user._id))
      .collect();

    // Apply filters
    if (status !== "all") {
      gigs = gigs.filter((gig) => {
        if (status === "active") return !gig.isTaken && !gig.isPending;
        if (status === "taken") return gig.isTaken;
        if (status === "pending") return gig.isPending;
        return true;
      });
    }

    if (gigType !== "all") {
      gigs = gigs.filter((gig) => {
        if (gigType === "regular") return !gig.isClientBand;
        if (gigType === "band") return gig.isClientBand;
        return true;
      });
    }

    // Sort by creation date (newest first)
    return gigs.sort((a, b) => b.createdAt - a.createdAt);
  },
});
// In your convex/controllers/gigs.ts file, update the bandRoleSchema definition
const bandRoleSchema = v.object({
  role: v.string(),
  maxSlots: v.float64(), // Changed from v.number() to v.float64()
  maxApplicants: v.optional(v.float64()),
  currentApplicants: v.optional(v.float64()), // ADD THIS
  applicants: v.optional(v.array(v.id("users"))),
  bookedPrice: v.optional(v.float64()),
  bookedUsers: v.optional(v.array(v.id("users"))),
  currency: v.optional(v.string()),
  description: v.optional(v.string()),
  filledSlots: v.optional(v.float64()),
  isLocked: v.optional(v.boolean()),
  negotiable: v.optional(v.boolean()),
  price: v.optional(v.float64()),
  requiredSkills: v.optional(v.array(v.string())),
});

// Helper function to get current user with clerkId
async function getCurrentUser(ctx: QueryCtx, subject?: string) {
  // Get user from database using clerkId
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", subject as string))
    .first();

  if (!user) {
    throw new Error("Unauthorized: Please log in to update gigs");
  }

  return { authUser: user, dbUser: user };
}

// Helper function to validate user ownership

// Type for gig document
type GigDoc = Doc<"gigs">;

async function validateGigOwnership(
  ctx: QueryCtx,
  gigId: Id<"gigs">,
  userId: Id<"users">,
): Promise<GigDoc> {
  const gig = await ctx.db.get(gigId);

  if (!gig) {
    throw new Error("Gig not found");
  }

  // Type guard to ensure it's a gig document
  if (!isGigDocument(gig)) {
    throw new Error("Invalid gig document");
  }

  if (gig.postedBy !== userId) {
    throw new Error("Unauthorized: You can only edit your own gigs");
  }

  return gig;
}

// Type guard function
function isGigDocument(doc: any): doc is GigDoc {
  return (
    doc &&
    typeof doc === "object" &&
    "postedBy" in doc &&
    "title" in doc &&
    "description" in doc
  );
}

const formatBandRolesForUpdate = (bandRoles: any[]) => {
  return bandRoles.map((role) => {
    // Remove currentApplicants if it exists
    const { currentApplicants, ...rest } = role;

    // Ensure applicants array exists
    const formattedRole = {
      ...rest,
      applicants: rest.applicants || [],
      bookedUsers: rest.bookedUsers || [],
      filledSlots: rest.filledSlots || 0,
      maxApplicants: rest.maxApplicants || 20,
      isLocked: rest.isLocked || false,
      negotiable: rest.negotiable ?? true,
      currency: rest.currency || "KES",
    };

    return formattedRole;
  });
};
export const updateGig = mutation({
  args: {
    clerkId: v.string(),
    gigId: v.id("gigs"),
    // Basic info
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    phone: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(v.string()),
    location: v.optional(v.string()),
    secret: v.optional(v.string()),

    // Time
    time: v.optional(
      v.object({
        start: v.string(),
        end: v.string(),
        durationFrom: v.optional(v.string()),
        durationTo: v.optional(v.string()),
      }),
    ),

    // Business category
    bussinesscat: v.optional(v.string()),

    // Timeline
    otherTimeline: v.optional(v.string()),
    gigtimeline: v.optional(v.string()),
    day: v.optional(v.string()),
    date: v.optional(v.number()),

    // Price info
    pricerange: v.optional(v.string()),
    currency: v.optional(v.string()),
    negotiable: v.optional(v.boolean()),

    // Talent-specific
    mcType: v.optional(v.string()),
    mcLanguages: v.optional(v.string()),
    djGenre: v.optional(v.string()),
    djEquipment: v.optional(v.string()),
    vocalistGenre: v.optional(v.array(v.string())),

    // Interest window
    acceptInterestEndTime: v.optional(v.number()),
    acceptInterestStartTime: v.optional(v.number()),

    // Capacity
    maxSlots: v.optional(v.number()),

    // Styling
    font: v.optional(v.string()),
    fontColor: v.optional(v.string()),
    backgroundColor: v.optional(v.string()),
    logo: v.optional(v.string()),

    // Band setup
    bandCategory: v.optional(v.array(bandRoleSchema)),

    // Other fields
    isActive: v.optional(v.boolean()),
    isPublic: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    requirements: v.optional(v.array(v.string())),
    benefits: v.optional(v.array(v.string())),
    isClientBand: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { gigId, bandCategory, ...otherArgs } = args;

    // DEBUG: Log incoming arguments
    console.log("=== DEBUG: updateGig Mutation ===");
    console.log("Gig ID:", gigId);
    console.log("Interest window data:", {
      acceptInterestStartTime: args.acceptInterestStartTime,
      acceptInterestEndTime: args.acceptInterestEndTime,
      startDate: args.acceptInterestStartTime
        ? new Date(args.acceptInterestStartTime).toLocaleString()
        : null,
      endDate: args.acceptInterestEndTime
        ? new Date(args.acceptInterestEndTime).toLocaleString()
        : null,
    });
    console.log("Band category data:", bandCategory);

    // Get current user with clerkId
    const { dbUser } = await getCurrentUser(ctx, args.clerkId);

    if (!dbUser) {
      throw new Error("User not found");
    }

    // Validate ownership
    const existingGig = await validateGigOwnership(ctx, gigId, dbUser._id);

    // DEBUG: Log existing gig data
    console.log("=== Existing Gig Data ===");
    console.log("Existing interest window:", {
      start: existingGig.acceptInterestStartTime,
      end: existingGig.acceptInterestEndTime,
      startDate: existingGig.acceptInterestStartTime
        ? new Date(existingGig.acceptInterestStartTime).toLocaleString()
        : null,
      endDate: existingGig.acceptInterestEndTime
        ? new Date(existingGig.acceptInterestEndTime).toLocaleString()
        : null,
    });
    console.log(
      "Current interested users:",
      existingGig.interestedUsers?.length || 0,
    );

    // Prepare update payload
    const payload: any = {
      updatedAt: Date.now(),
    };

    // Add regular fields
    Object.keys(otherArgs).forEach((key) => {
      const value = otherArgs[key as keyof typeof otherArgs];
      if (value !== undefined && key !== "clerkId") {
        payload[key] = value;
      }
    });

    // Handle band category updates
    if (bandCategory !== undefined) {
      console.log("=== Band Category Update ===");
      console.log("New band roles:", bandCategory);

      // Validate band roles don't have duplicate entries
      const roleNames = bandCategory.map((role) => role.role);
      const uniqueRoleNames = [...new Set(roleNames)];
      if (roleNames.length !== uniqueRoleNames.length) {
        throw new Error("Duplicate role names are not allowed in band setup");
      }

      // For each band role, ensure we preserve existing applicants
      const updatedBandCategory = bandCategory.map((newRole, index) => {
        // Find existing role with the same index or same role name
        const existingRole =
          existingGig.bandCategory?.[index] ||
          existingGig.bandCategory?.find((r) => r.role === newRole.role);

        if (existingRole) {
          console.log(`Role ${newRole.role} - preserving existing data:`);
          console.log(
            "Existing applicants:",
            existingRole.applicants?.length || 0,
          );
          console.log(
            "Existing booked users:",
            existingRole.bookedUsers?.length || 0,
          );

          // Preserve existing applicants and booked users
          return {
            ...newRole,
            currentApplicants: existingRole.currentApplicants || 0,
            applicants: existingRole.applicants || [],
            bookedUsers: existingRole.bookedUsers || [],
            filledSlots: existingRole.filledSlots || 0,
            // Preserve booked price if not being updated
            bookedPrice:
              newRole.bookedPrice !== undefined
                ? newRole.bookedPrice
                : existingRole.bookedPrice,
          };
        }

        // New role - initialize arrays
        return {
          ...newRole,
          currentApplicants: 0,
          applicants: [],
          bookedUsers: [],
          filledSlots: 0,
        };
      });

      payload.bandCategory = updatedBandCategory;
      console.log("Final band category to save:", updatedBandCategory);
    }

    // If time is being updated, ensure it has proper structure
    if (otherArgs.time) {
      payload.time = {
        start: otherArgs.time.start,
        end: otherArgs.time.end,
        durationFrom: otherArgs.time.durationFrom || "am",
        durationTo: otherArgs.time.durationTo || "pm",
      };
    }

    // DEBUG: Log final payload
    console.log("=== Final Update Payload ===");
    console.log("Payload to update:", JSON.stringify(payload, null, 2));

    // Update the gig
    await ctx.db.patch(gigId, payload);

    // DEBUG: Fetch and log the updated gig
    const updatedGig = await ctx.db.get(gigId);
    console.log("=== After Update ===");
    console.log("Updated interest window:", {
      start: updatedGig?.acceptInterestStartTime,
      end: updatedGig?.acceptInterestEndTime,
      startDate: updatedGig?.acceptInterestStartTime
        ? new Date(updatedGig.acceptInterestStartTime).toLocaleString()
        : null,
      endDate: updatedGig?.acceptInterestEndTime
        ? new Date(updatedGig.acceptInterestEndTime).toLocaleString()
        : null,
    });
    console.log("Updated band category:", updatedGig?.bandCategory);
    console.log(
      "Total interested users:",
      updatedGig?.interestedUsers?.length || 0,
    );

    // Log the update in booking history
    const historyEntry = {
      entryId: `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      userId: dbUser._id,
      userRole: "owner",
      status: "updated",
      gigType: bandCategory ? "band" : "regular",
      actionBy: dbUser._id,
      notes: "Gig details updated",
      metadata: {
        updatedFields: Object.keys(payload).filter(
          (key) => key !== "updatedAt" && key !== "bookingHistory",
        ),
        bandRolesUpdated: bandCategory ? bandCategory.length : 0,
        interestWindowUpdated: !!(
          args.acceptInterestStartTime || args.acceptInterestEndTime
        ),
      },
    };

    // Add to booking history
    const updatedHistory = existingGig.bookingHistory || [];
    updatedHistory.push(historyEntry as any);
    await ctx.db.patch(gigId, {
      bookingHistory: updatedHistory,
    });

    return {
      success: true,
      message: "Gig updated successfully",
      gigId,
      updatedAt: payload.updatedAt,
      bandRolesUpdated: bandCategory ? bandCategory.length : 0,
      interestWindowUpdated: !!(
        args.acceptInterestStartTime || args.acceptInterestEndTime
      ),
      // Return current stats for debugging
      stats: {
        interestedUsers: updatedGig?.interestedUsers?.length || 0,

        bandRoles: updatedGig?.bandCategory?.length || 0,
        totalApplicants:
          updatedGig?.bandCategory?.reduce(
            (sum, role) => sum + (role.applicants?.length || 0),
            0,
          ) || 0,
      },
    };
  },
});

export const getGigStats = query({
  args: {
    gigId: v.id("gigs"),
    userId: v.string(), // Keep this if you need clerkId
  },
  handler: async (ctx, args) => {
    // If you need to get user from userId instead of clerkId, change the args
    const { userId } = args; // Change this line based on what you're passing
    const gig = await ctx.db.get(args.gigId);

    if (!gig) {
      throw new Error("Gig not found");
    }

    // Get user by userId directly (if that's what you have)
    const user = await ctx.db.get(userId as Id<"users">);
    if (!user) {
      throw new Error("User not found");
    }

    // Check ownership
    const isOwner = gig.postedBy === user._id;
    if (!isOwner) {
      throw new Error("Unauthorized");
    }

    return {
      basicStats: {
        interestedUsers: gig.interestedUsers?.length || 0,

        totalViews: gig.viewCount || 0,
      },
      bandStats:
        gig.bandCategory?.map((role) => ({
          role: role.role,
          maxSlots: role.maxSlots,
          filledSlots: role.filledSlots || 0,
          currentApplicants: role.currentApplicants || 0,
          applicants: role.applicants?.length || 0,
          bookedUsers: role.bookedUsers?.length || 0,
          isLocked: role.isLocked || false,
        })) || [],
      interestWindow: {
        acceptInterestStartTime: gig.acceptInterestStartTime,
        acceptInterestEndTime: gig.acceptInterestEndTime,
        isActive:
          !gig.acceptInterestStartTime || !gig.acceptInterestEndTime
            ? true // If no window set, it's always active
            : Date.now() >= gig.acceptInterestStartTime &&
              Date.now() <= gig.acceptInterestEndTime,
        currentStatus:
          !gig.acceptInterestStartTime || !gig.acceptInterestEndTime
            ? "always open"
            : Date.now() < gig.acceptInterestStartTime
              ? `opens ${new Date(gig.acceptInterestStartTime).toLocaleString()}`
              : Date.now() > gig.acceptInterestEndTime
                ? `closed since ${new Date(gig.acceptInterestEndTime).toLocaleString()}`
                : "open now",
      },
    };
  },
});

// Optional: Separate mutation for specific field updates
export const updateGigField = mutation({
  args: {
    gigId: v.id("gigs"),
    field: v.string(),
    value: v.any(),
  },
  handler: async (ctx, args) => {
    const { gigId, field, value } = args;

    // Get current user
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Unauthorized: Please log in to update gigs");
    }

    // Get user from database
    const userRecord = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", user.subject))
      .first();

    if (!userRecord) {
      throw new Error("User not found");
    }

    // Validate ownership
    await validateGigOwnership(ctx, gigId, userRecord._id);

    // Update the specific field
    await ctx.db.patch(gigId, {
      [field]: value,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: `Field "${field}" updated successfully`,
    };
  },
});

// Mutation to update band role specifically
export const updateBandRole = mutation({
  args: {
    gigId: v.id("gigs"),
    roleIndex: v.number(),
    updates: v.object({
      role: v.optional(v.string()),
      maxSlots: v.optional(v.number()),
      description: v.optional(v.string()),
      requiredSkills: v.optional(v.array(v.string())),
      price: v.optional(v.number()),
      currency: v.optional(v.string()),
      negotiable: v.optional(v.boolean()),
      isLocked: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const { gigId, roleIndex, updates } = args;

    // Get current user
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Unauthorized: Please log in to update gigs");
    }

    // Get user from database
    const userRecord = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", user.subject))
      .first();

    if (!userRecord) {
      throw new Error("User not found");
    }

    // Validate ownership
    const gig = await validateGigOwnership(ctx, gigId, userRecord._id);

    // Check if gig has bandCategory
    if (!gig.bandCategory || gig.bandCategory.length === 0) {
      throw new Error("This gig doesn't have band roles setup");
    }

    // Check if roleIndex is valid
    if (roleIndex < 0 || roleIndex >= gig.bandCategory.length) {
      throw new Error("Invalid role index");
    }

    // Update the specific role
    const updatedBandCategory = [...gig.bandCategory];
    updatedBandCategory[roleIndex] = {
      ...updatedBandCategory[roleIndex],
      ...updates,
    };

    // Update the gig
    await ctx.db.patch(gigId, {
      bandCategory: updatedBandCategory,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Band role updated successfully",
      role: updatedBandCategory[roleIndex],
    };
  },
});

// Mutation to update gig status (active/inactive)
export const updateGigStatus = mutation({
  args: {
    gigId: v.id("gigs"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { gigId, isActive } = args;

    // Get current user
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Unauthorized: Please log in to update gigs");
    }

    // Get user from database
    const userRecord = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", user.subject))
      .first();

    if (!userRecord) {
      throw new Error("User not found");
    }

    // Validate ownership
    await validateGigOwnership(ctx, gigId, userRecord._id);

    // Update status
    await ctx.db.patch(gigId, {
      isActive,
      updatedAt: Date.now(),
    });

    // Add to booking history
    const gig = await ctx.db.get(gigId);
    if (gig) {
      const historyEntry = {
        entryId: `status_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        userId: userRecord._id,
        userRole: "owner",
        status: isActive ? "activated" : "deactivated",
        gigType: gig.bandCategory ? "band" : "regular",
        actionBy: userRecord._id,
        notes: isActive ? "Gig activated" : "Gig deactivated",
      };

      const updatedHistory = gig.bookingHistory || [];
      updatedHistory.push(historyEntry as any);
      await ctx.db.patch(gigId, {
        bookingHistory: updatedHistory,
      });
    }

    return {
      success: true,
      message: isActive
        ? "Gig activated successfully"
        : "Gig deactivated successfully",
    };
  },
});

// Mutation to update gig visibility
export const updateGigVisibility = mutation({
  args: {
    gigId: v.id("gigs"),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { gigId, isPublic } = args;

    // Get current user
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Unauthorized: Please log in to update gigs");
    }

    // Get user from database
    const userRecord = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", user.subject))
      .first();

    if (!userRecord) {
      throw new Error("User not found");
    }

    // Validate ownership
    await validateGigOwnership(ctx, gigId, userRecord._id);

    // Update visibility
    await ctx.db.patch(gigId, {
      isPublic,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: isPublic ? "Gig made public" : "Gig made private",
    };
  },
});

// Keep it as a query (current implementation is correct)
export const getGigBasicInfo = query({
  args: {
    gigId: v.id("gigs"),
  },
  handler: async (ctx, args) => {
    const gig = await ctx.db.get(args.gigId);
    if (!gig) {
      throw new Error("Gig not found");
    }

    return {
      title: gig.title,
      date: gig.date,
      time: gig.time,
      location: gig.location,
      price: gig.price,
      currency: gig.currency,
      bussinesscat: gig.bussinesscat,
      isActive: gig.isActive,
      isPublic: gig.isPublic,
    };
  },
});
