import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

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
// 2. CREATE BAND MUTATION
export const createBand = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    genre: v.array(v.string()),
    location: v.string(),
    type: v.union(
      v.literal("permanent"),
      v.literal("ad-hoc"),
      v.literal("cover")
    ),
    requiredInstruments: v.array(
      v.object({
        instrument: v.string(),
        quantity: v.number(),
      })
    ),
    bandImageUrl: v.optional(v.string()),
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Get user from clerkId
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    // Check if user is a musician
    if (!user.isMusician) {
      throw new Error("Only musicians can create bands");
    }

    if (!user.canCreateBand) throw new Error("Not eligible to create bands");

    // Check if band name is unique
    const existingBand = await ctx.db
      .query("bands")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existingBand) throw new Error("Band name already taken");

    // Create the band
    const bandId = await ctx.db.insert("bands", {
      ...args,
      creatorId: user._id,
      status: "forming",
      requiredInstruments: args.requiredInstruments.map((instr) => ({
        ...instr,
        filled: 0, // Initially no positions filled
      })),
      createdAt: Date.now(),
    });

    // Add creator as first member (leader)
    await ctx.db.insert("bandMembers", {
      bandId,
      userId: user._id,
      role: "band_leader", // Special role
      status: "accepted",
      isLeader: true,
      invitedAt: Date.now(),
      joinedAt: Date.now(),
    });

    // Update user's band leader list
    const currentBands = user.bandLeaderOf || [];
    await ctx.db.patch(user._id, {
      bandLeaderOf: [...currentBands, bandId],
    });

    // Create initial crew chat message
    await ctx.db.insert("crewMessages", {
      bandId,
      authorId: user._id,
      content: `Band "${args.name}" was created! Start inviting members.`,
      type: "system",
      readBy: [user._id],
      createdAt: Date.now(),
    });

    return { bandId, success: true };
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
