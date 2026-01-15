import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { createNotificationInternal } from "../createNotificationInternal";
import { updateUserTrust } from "../trustHelper";

// Helper function to provide improvement tips
function getBandCreationImprovementTips(
  user: any
): Array<{ action: string; priority: "high" | "medium" | "low" }> {
  const tips: Array<{ action: string; priority: "high" | "medium" | "low" }> =
    [];

  // Check trust score
  if ((user.trustScore || 0) < 70) {
    tips.push({
      action: `Increase your trust score from ${user.trustScore || 0} to 70+`,
      priority: "high",
    });
  }

  // Check trust tier
  const trustTier = user.trustTier || "new";
  const trustTierOrder = ["new", "basic", "verified", "trusted", "elite"];
  if (trustTierOrder.indexOf(trustTier) < trustTierOrder.indexOf("trusted")) {
    tips.push({
      action: `Reach "trusted" tier (currently ${trustTier})`,
      priority: "high",
    });
  }

  // Check completed gigs
  if ((user.completedGigsCount || 0) < 5) {
    const needed = 5 - (user.completedGigsCount || 0);
    tips.push({
      action: `Complete ${needed} more gig${needed > 1 ? "s" : ""}`,
      priority: "medium",
    });
  }

  // Check rating
  if ((user.avgRating || 0) < 4.3) {
    tips.push({
      action: `Improve your rating to 4.3+ (currently ${user.avgRating || 0})`,
      priority: "medium",
    });
  }

  // Check verification
  if (!user.verifiedIdentity) {
    tips.push({
      action: "Verify your identity",
      priority: "high",
    });
  }

  // Check profile completeness
  if (!checkProfileCompleteness(user)) {
    tips.push({
      action: "Complete your profile",
      priority: "high",
    });
  }

  // Check if user is musician
  if (!user.isMusician) {
    tips.push({
      action: "Only musicians can create bands",
      priority: "high",
    });
  }

  // Sort by priority (high first)
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return tips.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );
}

// Profile completeness function

// 1. CHECK ELIGIBILITY MUTATION (changed from query to mutation)
export const checkBandCreationEligibility = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // Requirements for band creation using trust score system
    const requirements = {
      minTrustScore: 70,
      minTrustTier: "trusted",
      minCompletedGigs: 5,
      minRating: 4.3,
      verifiedProfile: true,
      hasPaymentMethod: true,
      profileComplete: true,
    };

    // Get user's trust tier
    const trustTier = user.trustTier || "new";

    // Check if user meets trust tier requirement
    const trustTierOrder = ["new", "basic", "verified", "trusted", "elite"];
    const userTierIndex = trustTierOrder.indexOf(trustTier);
    const requiredTierIndex = trustTierOrder.indexOf(requirements.minTrustTier);
    const meetsTrustTier = userTierIndex >= requiredTierIndex;

    // Check each requirement
    const metRequirements = {
      trustScore: (user.trustScore || 0) >= requirements.minTrustScore,
      trustTier: meetsTrustTier,
      completedGigs:
        (user.completedGigsCount || 0) >= requirements.minCompletedGigs,
      rating: (user.avgRating || 0) >= requirements.minRating,
      verifiedProfile: user.verifiedIdentity === true,

      profileComplete: checkProfileCompleteness(user),
    };

    const canCreateBand = Object.values(metRequirements).every(Boolean);

    // Update user's eligibility status - this is now allowed in a mutation
    await ctx.db.patch(args.userId, {
      canCreateBand,
      ...(canCreateBand && !user.bandCreationUnlockedAt
        ? { bandCreationUnlockedAt: Date.now() }
        : {}),
    });

    return {
      canCreateBand,
      requirements,
      metRequirements,
      userStats: {
        trustScore: user.trustScore,
        trustTier: user.trustTier,
        completedGigs: user.completedGigsCount,
        rating: user.avgRating,
        verified: user.verifiedIdentity,

        isMusician: user.isMusician,
        profileComplete: checkProfileCompleteness(user),
      },
      improvementTips: canCreateBand
        ? []
        : getBandCreationImprovementTips(user),
    };
  },
});

// 2. CREATE A QUERY VERSION FOR READ-ONLY CHECKS
export const getBandCreationEligibility = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // Requirements for band creation using trust score system
    const requirements = {
      minTrustScore: 70,
      minTrustTier: "trusted",
      minCompletedGigs: 5,
      minRating: 4.3,
      verifiedProfile: true,
      hasPaymentMethod: true,
      profileComplete: true,
    };

    // Get user's trust tier
    const trustTier = user.trustTier || "new";

    // Check if user meets trust tier requirement
    const trustTierOrder = ["new", "basic", "verified", "trusted", "elite"];
    const userTierIndex = trustTierOrder.indexOf(trustTier);
    const requiredTierIndex = trustTierOrder.indexOf(requirements.minTrustTier);
    const meetsTrustTier = userTierIndex >= requiredTierIndex;

    // Check each requirement
    const metRequirements = {
      trustScore: (user.trustScore || 0) >= requirements.minTrustScore,
      trustTier: meetsTrustTier,
      completedGigs:
        (user.completedGigsCount || 0) >= requirements.minCompletedGigs,
      rating: (user.avgRating || 0) >= requirements.minRating,
      verifiedProfile: user.verifiedIdentity === true,
      profileComplete: checkProfileCompleteness(user),
    };

    const canCreateBand = Object.values(metRequirements).every(Boolean);

    return {
      canCreateBand,
      requirements,
      metRequirements,
      userStats: {
        trustScore: user.trustScore,
        trustTier: user.trustTier,
        completedGigs: user.completedGigsCount,
        rating: user.avgRating,
        verified: user.verifiedIdentity,

        isMusician: user.isMusician,
        profileComplete: checkProfileCompleteness(user),
      },
      improvementTips: canCreateBand
        ? []
        : getBandCreationImprovementTips(user),
    };
  },
});

// Add the profile completeness function (copy from trustScore.ts)
function checkProfileCompleteness(user: any): boolean {
  // BASIC REQUIREMENTS FOR ALL USERS
  const basicComplete = !!(user?.firstname && user?.city && user?.phone);

  // USER TYPE SPECIFIC REQUIREMENTS
  let typeComplete = true;

  if (user?.isMusician) {
    typeComplete = !!(
      user?.roleType &&
      user?.date &&
      user?.month &&
      user?.year
    );

    // Additional musician-specific requirements based on role
    if (user?.roleType === "dj" && !user?.djGenre) {
      typeComplete = false;
    } else if (user?.roleType === "mc" && !user?.mcType) {
      typeComplete = false;
    } else if (user?.roleType === "vocalist" && !user?.vocalistGenre) {
      typeComplete = false;
    } else if (user?.roleType === "teacher" && !user?.teacherSpecialization) {
      typeComplete = false;
    }
  } else if (user?.isClient) {
    typeComplete = !!user?.clientType;
  } else if (user?.isBooker) {
    typeComplete = !!user?.bookerType;
  }

  return basicComplete && typeComplete;
}

// 1. CHECK IF USER CAN CREATE BAND (Query)
export const checkUserCanCreateBand = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return {
        canCreateBand: false,
        reason: "User not found",
        requirements: {},
      };
    }

    const userTrustScore = user.trustScore || 0;
    const userCreatedAt = user._creationTime;
    const now = Date.now();
    const daysSinceCreation = (now - userCreatedAt) / (1000 * 60 * 60 * 24);

    // Check all requirements
    const requirements = {
      isMusician: user.isMusician,
      trustScore: userTrustScore,
      trustScoreRequired: 70,
      hasMinimumTrustScore: userTrustScore >= 70,
      accountAgeDays: Math.floor(daysSinceCreation),
      minimumAccountAgeDays: 30,
      hasMinimumAccountAge: daysSinceCreation >= 30,
      tier: user.tier,
      tierValid: ["pro", "premium", "elite"].includes(user.tier),
    };

    // Determine if user can create band
    const canCreateBand =
      user.isMusician &&
      userTrustScore >= 70 &&
      daysSinceCreation >= 30 &&
      ["pro", "premium", "elite"].includes(user.tier);

    return {
      canCreateBand,
      reason: canCreateBand ? "" : "Does not meet all requirements",
      requirements,
      userDetails: {
        firstname: user.firstname,
        username: user.username,
        tier: user.tier,
        trustScore: userTrustScore,
        accountAge: Math.floor(daysSinceCreation),
        completedGigsCount: user.completedGigsCount || 0,
        avgRating: user.avgRating || 0,
      },
    };
  },
});

// 2. CREATE BAND MUTATION
export const createBand = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    genre: v.array(v.string()),
    location: v.string(),
    type: v.union(
      v.literal("permanent"),
      v.literal("ad-hoc"),
      v.literal("cover")
    ),
    bandImageUrl: v.optional(v.string()),
    bannerImageUrl: v.optional(v.string()),
    socialLinks: v.optional(
      v.array(
        v.object({
          platform: v.string(),
          url: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const { clerkId, ...bandData } = args;

    // Get user from clerkId
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user) throw new Error("User not found");

    // ==================== VALIDATION CHECKS ====================

    // 1. Must be a musician
    if (!user.isMusician) {
      throw new Error(
        "Only musicians can create bands. Please update your profile to musician first."
      );
    }

    // 2. Trust score requirement (minimum 70)
    const userTrustScore = user.trustScore || 0;
    if (userTrustScore < 70) {
      throw new Error(`You need a trust score of at least 70 to create a band. Your current trust score is ${userTrustScore}. 
      Improve your score by: completing gigs, getting good ratings, and being active on the platform.`);
    }

    // 3. Account age requirement (minimum 30 days)
    const userCreatedAt = user._creationTime;
    const now = Date.now();
    const daysSinceCreation = (now - userCreatedAt) / (1000 * 60 * 60 * 24);

    if (daysSinceCreation < 30) {
      throw new Error(`Your account needs to be at least 30 days old to create bands. 
      Your account is ${Math.floor(daysSinceCreation)} days old. 
      Please wait ${Math.ceil(30 - daysSinceCreation)} more days.`);
    }

    // 4. Tier requirement - no free tier allowed
    if (user.tier === "free") {
      throw new Error(
        "Free tier users cannot create bands. Please upgrade to Pro, Premium, or Elite tier."
      );
    }

    // 5. Check if user is on eligible tier
    const eligibleTiers = ["pro", "premium", "elite"];
    if (!eligibleTiers.includes(user.tier)) {
      throw new Error(
        `Band creation is only available for Pro, Premium, and Elite tier users. Your current tier is: ${user.tier}`
      );
    }

    // 6. Check if user has reached band limit for their tier
    const userBandsAsLeader = await ctx.db
      .query("bands")
      .withIndex("by_creator", (q) => q.eq("creatorId", user._id))
      .collect();

    // Tier-based limits
    let maxBandsAllowed = 1;
    switch (user.tier) {
      case "pro":
        maxBandsAllowed = 3;
        break;
      case "premium":
        maxBandsAllowed = 5;
        break;
      case "elite":
        maxBandsAllowed = 10;
        break;
    }

    if (userBandsAsLeader.length >= maxBandsAllowed && user.tier !== "elite") {
      throw new Error(`You have reached the maximum number of bands for your tier (${user.tier}). 
      You can only create ${maxBandsAllowed} band(s). 
      ${user.tier === "pro" ? "Upgrade to Premium for 5 bands or Elite for unlimited bands." : "Upgrade to Elite for unlimited bands."}`);
    }

    // 7. Check if band name is unique
    const existingBand = await ctx.db
      .query("bands")
      .withIndex("by_name", (q) => q.eq("name", bandData.name))
      .first();

    if (existingBand) {
      throw new Error(
        `Band name "${bandData.name}" is already taken. Please choose a different name.`
      );
    }

    // ==================== CREATE BAND ====================
    const nowTimestamp = Date.now();

    // Create the band with proper schema structure
    const bandId = await ctx.db.insert("bands", {
      name: bandData.name,
      description: bandData.description || "",
      genre: bandData.genre,
      location: bandData.location,
      type: bandData.type,
      creatorId: user._id,
      status: "forming" as const,

      // Band members - creator is the leader
      members: [
        {
          userId: user._id,
          role: "band_leader",
          joinedAt: nowTimestamp,
          isLeader: true,
          status: "active" as const,
        },
      ],

      // Band statistics
      totalGigs: 0,
      completedGigs: 0,
      rating: 0,

      // Images and links
      bandImageUrl: bandData.bandImageUrl || "",
      bannerImageUrl: bandData.bannerImageUrl || "",
      socialLinks: bandData.socialLinks || [],

      // Availability
      isAvailable: true,
      availabilitySchedule: {
        weekdays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        weekends: ["Saturday", "Sunday"],
        timeSlots: ["Morning", "Afternoon", "Evening", "Night"],
      },

      // Timestamps
      createdAt: nowTimestamp,
      updatedAt: nowTimestamp,
      lastActive: nowTimestamp,
    });

    // ==================== UPDATE USER ====================
    await ctx.db.patch(user._id, {
      bandLeaderOf: [...(user.bandLeaderOf || []), bandId],
      bandMemberOf: [...(user.bandMemberOf || []), bandId],
      canCreateBand: true, // Set flag since they've successfully created one
      updatedAt: nowTimestamp,
    });

    // ==================== NOTIFICATIONS ====================

    // Success notification for user
    await createNotificationInternal(ctx, {
      userDocumentId: user._id,
      type: "band_created",
      title: "🎸 Band Created Successfully!",
      message: `Your band "${bandData.name}" has been created! You can now invite members, post band gigs, and start booking shows.`,
      actionUrl: `/bands/${bandId}`,
      relatedUserDocumentId: user._id,
      metadata: {
        bandId: bandId.toString(),
        bandName: bandData.name,
        bandType: bandData.type,
        memberCount: 1,
        creationDate: nowTimestamp,
      },
    });

    // Admin notification for new band creation
    const admins = await ctx.db
      .query("users")
      .withIndex("by_is_admin", (q) => q.eq("isAdmin", true))
      .collect();

    for (const admin of admins) {
      await createNotificationInternal(ctx, {
        userDocumentId: admin._id,
        type: "admin_band_created",
        title: "🎸 New Band Created",
        message: `${user.firstname || user.username} (${user.tier} tier) created a new band: "${bandData.name}"`,
        actionUrl: `/admin/bands/${bandId}`,
        relatedUserDocumentId: user._id,
        metadata: {
          bandId: bandId.toString(),
          bandName: bandData.name,
          creatorId: user._id,
          creatorTier: user.tier,
          creatorTrustScore: userTrustScore,
          creationDate: nowTimestamp,
        },
      });
    }

    // ==================== CREATE INITIAL ACTIVITY ====================
    try {
      await ctx.db.insert("bandActivities", {
        bandId,
        userId: user._id,
        action: "band_created",
        details: {
          bandName: bandData.name,
          creatorName: user.firstname || user.username,
          bandType: bandData.type,
          genre: bandData.genre,
          location: bandData.location,
        },
        timestamp: nowTimestamp,
      });
    } catch (error) {
      // Silent fail if bandActivities table doesn't exist
      console.log("Band activities logging not available");
    }

    return {
      success: true,
      bandId,
      bandName: bandData.name,
      bandType: bandData.type,
      memberCount: 1,
      message: `Band "${bandData.name}" created successfully!`,
      nextSteps: [
        "Invite other musicians to join your band",
        "Update band profile and add more details",
        "Create your first band gig",
        "Share your band profile to get more visibility",
      ],
      createdAt: nowTimestamp,
    };
  },
});

// 3. GET USER'S BANDS (Helper Query)
export const getUserBands = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return [];

    // Get bands where user is leader
    const leaderBands = await ctx.db
      .query("bands")
      .withIndex("by_creator", (q) => q.eq("creatorId", user._id))
      .collect();

    // Get bands where user is a member (not leader)
    const allBands = await ctx.db.query("bands").collect();
    const memberBands = allBands.filter((band) =>
      band.members.some(
        (member: any) => member.userId === user._id && !member.isLeader
      )
    );

    return {
      leaderOf: leaderBands,
      memberOf: memberBands,
      totalBands: leaderBands.length + memberBands.length,
      canCreateMoreBands: {
        currentCount: leaderBands.length,
        maxAllowed: user.tier === "pro" ? 3 : user.tier === "premium" ? 5 : 10,
        tier: user.tier,
      },
    };
  },
});

// 4. DELETE BAND (if needed)
export const deleteBand = mutation({
  args: {
    clerkId: v.string(),
    bandId: v.id("bands"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("User not found");

    const band = await ctx.db.get(args.bandId);
    if (!band) throw new Error("Band not found");

    // Check if user is the band creator
    if (band.creatorId !== user._id) {
      throw new Error("Only the band creator can delete the band");
    }

    // Check if band has active gigs
    const bandGigs = await ctx.db
      .query("gigs")
      .filter((q) => q.eq(q.field("bookedBandId"), args.bandId))
      .collect();

    if (bandGigs.length > 0) {
      const activeGigs = bandGigs.filter((gig) => !gig.isTaken);
      if (activeGigs.length > 0) {
        throw new Error(
          `Cannot delete band with ${activeGigs.length} active gig(s). Cancel or complete the gigs first.`
        );
      }
    }

    // Remove band from users' band lists
    const allUsers = await ctx.db.query("users").collect();
    for (const u of allUsers) {
      const updates: any = {};

      // Remove from bandLeaderOf
      if (u.bandLeaderOf?.includes(args.bandId)) {
        updates.bandLeaderOf = u.bandLeaderOf.filter(
          (id: any) => id !== args.bandId
        );
      }

      // Remove from bandMemberOf
      if (u.bandMemberOf?.includes(args.bandId)) {
        updates.bandMemberOf = u.bandMemberOf.filter(
          (id: any) => id !== args.bandId
        );
      }

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(u._id, updates);
      }
    }

    // Delete the band
    await ctx.db.delete(args.bandId);

    return {
      success: true,
      message: `Band "${band.name}" deleted successfully`,
      deletedBandId: args.bandId,
    };
  },
});

// Search for musicians to invite
export const searchMusiciansForBand = query({
  args: {
    bandId: v.id("bands"),
    searchQuery: v.optional(v.string()),
    instrument: v.optional(v.string()),
    location: v.optional(v.string()),
    minTrustScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Get band to know location preference
    const band = await ctx.db.get(args.bandId);
    if (!band) return [];

    // Start with a base query for musicians
    // We'll filter in JavaScript for now, or you can create a composite index
    const allUsers = await ctx.db.query("users").collect();

    // Apply filters in JavaScript
    const filteredMusicians = allUsers
      .filter((musician) => {
        // 1. Must be a musician
        if (!musician.isMusician) return false;

        // 2. Filter by location if specified
        const targetLocation = args.location || band.location;
        if (targetLocation && musician.city !== targetLocation) {
          return false;
        }

        // 3. Filter by search query
        if (args.searchQuery) {
          const searchLower = args.searchQuery.toLowerCase();
          const name =
            `${musician.firstname || ""} ${musician.lastname || ""}`.toLowerCase();
          const username = musician.username?.toLowerCase() || "";
          if (!name.includes(searchLower) && !username.includes(searchLower)) {
            return false;
          }
        }

        // 4. Filter by instrument
        if (args.instrument && musician.instrument !== args.instrument) {
          return false;
        }

        // 5. Filter by trust score
        if (
          args.minTrustScore &&
          (musician.trustScore || 0) < args.minTrustScore
        ) {
          return false;
        }

        // 6. Filter out musicians already in this band
        if (musician.bandMemberOf?.includes(args.bandId)) {
          return false;
        }

        // 7. Basic eligibility criteria
        const isEligible =
          (musician.trustScore || 0) >= 40 && // At least "basic" tier
          musician.verifiedIdentity === true;

        return isEligible;
      })
      .slice(0, 50) // Limit results
      .map((musician) => ({
        _id: musician._id,
        name: `${musician.firstname || ""} ${musician.lastname || ""}`.trim(),
        username: musician.username || "",
        picture: musician.picture || "",
        instrument: musician.instrument || "",
        trustScore: musician.trustScore || 0,
        trustTier: musician.trustTier || "new",
        location: musician.city || "",
        completedGigs: musician.completedGigsCount || 0,
        rating: musician.avgRating || 0,
      }));

    return filteredMusicians;
  },
});

export const getBandsByIds = query({
  args: {
    bandIds: v.array(v.id("bands")),
  },
  handler: async (ctx, args) => {
    if (args.bandIds.length === 0) return [];

    const bands = [];
    for (const bandId of args.bandIds) {
      const band = await ctx.db.get(bandId);
      if (band) {
        bands.push(band);
      }
    }
    return bands;
  },
});
