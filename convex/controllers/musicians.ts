import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import {
  GIG_TYPES_ARRAY,
  GigType,
  GIG_TYPE_VALUES,
  getCategoryForGigType,
  getInstrumentCompatibility,
  isInstrumentOptimalForGigType,
  isRoleCompatibleWithGigType,
  ROLE_COMPATIBILITY,
  isValidGigType,
} from "../gigTypes";

export { GIG_TYPES_ARRAY as GIG_TYPES };
export type { GigType };

// Create the gig type union for the query args
const gigTypeUnion = v.union(
  ...(GIG_TYPE_VALUES.map((value) => v.literal(value)) as any)
);

export const getProMusicians = query({
  args: {
    city: v.optional(v.string()),
    instrument: v.optional(v.string()),
    genre: v.optional(v.string()),
    limit: v.optional(v.number()),
    minRating: v.optional(v.number()),
    tier: v.optional(
      v.union(
        v.literal("free"),
        v.literal("pro"),
        v.literal("premium"),
        v.literal("elite")
      )
    ),
    gigType: v.optional(gigTypeUnion),
    availableOnly: v.optional(v.boolean()),
    enforceCompatibility: v.optional(v.boolean()),
    // Add sortBy parameter
    sortBy: v.optional(
      v.union(
        v.literal("trust"),
        v.literal("rating"),
        v.literal("experience"),
        v.literal("recent"),
        v.literal("rate")
      )
    ),
  },
  handler: async (ctx, args) => {
    const {
      city,
      instrument,
      genre,
      limit = 12,
      minRating,
      tier,
      gigType,
      availableOnly = false,
      enforceCompatibility = true,
      sortBy = "trust",
    } = args;

    let query = ctx.db
      .query("users")
      .withIndex("by_is_musician", (q) => q.eq("isMusician", true));

    // Apply filters
    if (city) {
      query = query.filter((q) => q.eq(q.field("city"), city));
    }

    if (instrument) {
      query = query.filter((q) => q.eq(q.field("instrument"), instrument));
    }

    if (tier) {
      query = query.filter((q) => q.eq(q.field("tier"), tier));
    }

    if (availableOnly) {
      query = query.filter((q) =>
        q.neq(q.field("availability"), "notavailable")
      );
    }

    if (minRating) {
      query = query.filter((q) => q.gte(q.field("avgRating"), minRating));
    }

    let musicians = await query.collect();

    // Filter out banned users
    musicians = musicians.filter((musician) => !musician.isBanned);

    // Enhanced compatibility check with new rate structure
    if (gigType && enforceCompatibility && isValidGigType(gigType)) {
      musicians = musicians.filter((musician) =>
        isMusicianCompatibleWithGigType(musician, gigType)
      );
    }

    // If no musicians found, try a broader search (without compatibility filter)
    if (musicians.length === 0 && enforceCompatibility) {
      console.log("No compatible musicians found, trying broader search...");
      const fallbackMusicians = await ctx.db
        .query("users")
        .withIndex("by_is_musician", (q) => q.eq("isMusician", true))
        .filter((q) => q.eq(q.field("isBanned"), false))
        .collect();

      musicians = fallbackMusicians;
    }

    // Apply gig type compatibility scoring and sorting with new rate structure
    if (gigType && isValidGigType(gigType)) {
      musicians = musicians
        .map((musician) => {
          const rateInfo = getMusicianRateForGigType(musician, gigType);
          const displayRate = formatRateForDisplay(
            rateInfo,
            musician.rate?.rateType
          );

          // Cast to any to add dynamic properties
          const enhancedMusician: any = {
            ...musician,
            gigTypeCompatibility: calculateGigTypeCompatibility(
              musician,
              gigType
            ),
            displayRate: displayRate,
            rateInfo: rateInfo,
            isOptimalForGigType: calculateOptimalForGigType(musician, gigType),
            isCompatible: isMusicianCompatibleWithGigType(musician, gigType),
          };
          return enhancedMusician;
        })
        .sort((a: any, b: any) => {
          // Sort compatible musicians first, then by compatibility score
          if (a.isCompatible !== b.isCompatible) {
            return a.isCompatible ? -1 : 1;
          }
          return b.gigTypeCompatibility - a.gigTypeCompatibility;
        });
    } else {
      musicians = musicians.map((musician) => {
        const generalRate = getGeneralDisplayRate(musician.rate);
        // Cast to any to add dynamic properties
        const enhancedMusician: any = {
          ...musician,
          gigTypeCompatibility: 50,
          displayRate: generalRate,
          rateInfo: null,
          isOptimalForGigType: false,
          isCompatible: true,
        };
        return enhancedMusician;
      });
    }

    // Apply sorting based on sortBy parameter
    if (sortBy) {
      musicians.sort((a: any, b: any) => {
        switch (sortBy) {
          case "trust":
            return (b.trustStars || 0.5) - (a.trustStars || 0.5);
          case "rating":
            return (b.avgRating || 0) - (a.avgRating || 0);
          case "experience":
            return (b.completedGigsCount || 0) - (a.completedGigsCount || 0);
          case "rate":
            const rateA = parseRate(a.displayRate);
            const rateB = parseRate(b.displayRate);
            return rateA - rateB;
          case "recent":
            return (b._creationTime || 0) - (a._creationTime || 0);
          default:
            return 0;
        }
      });
    }

    return musicians.slice(0, limit);
  },
});

// Helper function to parse rate from display string
const parseRate = (rateStr: string): number => {
  if (!rateStr || rateStr.includes("Contact")) return Infinity;
  const match = rateStr.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : Infinity;
};

// Helper functions for new rate structure
const getMusicianRateForGigType = (musician: any, gigType?: GigType): any => {
  if (!gigType || !musician.rate) {
    return musician.rate?.baseRate || "Contact for rate";
  }

  // For the new rate structure, look for categories first
  const category = getCategoryForGigType(gigType);

  if (musician.rate.categories && Array.isArray(musician.rate.categories)) {
    const categoryRate = musician.rate.categories.find(
      (cat: any) => cat.name.toLowerCase() === category.toLowerCase()
    );
    if (categoryRate) {
      return categoryRate.rate || categoryRate;
    }
  }

  // Fallback to base rate
  return musician.rate.baseRate || "Contact for rate";
};

const formatRateForDisplay = (rate: any, rateType?: string): string => {
  if (!rate || rate === "Contact for rate") {
    return "Contact for rate";
  }

  if (typeof rate === "string") {
    return rate;
  }

  if (typeof rate === "number") {
    return `KES ${rate}`;
  }

  if (typeof rate === "object") {
    // Handle the case where rate might be a category object
    if (rate.rate) {
      const typeSuffix = rate.rateType ? `/${rate.rateType}` : "";
      return `${rate.rate}${typeSuffix}`;
    }
  }

  return "Contact for rate";
};

const getGeneralDisplayRate = (rate: any): string => {
  if (!rate) return "Contact for rate";

  // New rate structure
  if (rate.baseRate) {
    const typeSuffix = rate.rateType ? `/${rate.rateType}` : "";
    return `${rate.baseRate}${typeSuffix}`;
  }

  // Legacy fallback
  if (typeof rate === "string") return rate;
  if (typeof rate === "number") return `KES ${rate}`;

  return "Contact for rate";
};

const calculateGigTypeCompatibility = (
  musician: any,
  gigType: GigType
): number => {
  let score = 0;

  // Role compatibility (20% of score)
  const musicianRole = musician.role?.toLowerCase();
  const roleScore = ROLE_COMPATIBILITY[musicianRole]?.[gigType] || 50;
  score += roleScore * 0.2;

  // Instrument compatibility (30% of score)
  const instrument = musician.instrument?.toLowerCase();
  const instrumentScore = getInstrumentCompatibility(gigType, instrument);
  score += instrumentScore * 0.3;

  // Rest of scoring (50%)
  const ratingScore = (musician.avgRating || 0) * 20;
  const reliabilityScore = musician.reliabilityScore || 50;
  score += (ratingScore + reliabilityScore) * 0.15;

  const experienceBonus = Math.min((musician.completedGigsCount || 0) / 2, 20);
  score += experienceBonus;

  const tierBonus = {
    elite: 20,
    premium: 15,
    pro: 10,
    free: 0,
  };
  score += tierBonus[musician.tier as keyof typeof tierBonus] || 0;

  return Math.min(Math.round(score), 100);
};

const calculateOptimalForGigType = (
  musician: any,
  gigType: GigType
): boolean => {
  const musicianInstrument = musician.instrument?.toLowerCase();
  return isInstrumentOptimalForGigType(gigType, musicianInstrument);
};

const isMusicianCompatibleWithGigType = (
  musician: any,
  gigType: GigType
): boolean => {
  const musicianRole = musician.role?.toLowerCase();
  return isRoleCompatibleWithGigType(musicianRole, gigType);
};

export const getFeaturedMusicians = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { limit = 8 } = args;

    const musicians = await ctx.db
      .query("users")
      .withIndex("by_is_musician", (q) => q.eq("isMusician", true))
      .filter((q) =>
        q.and(
          q.eq(q.field("isBanned"), false),
          q.neq(q.field("availability"), "notavailable"),
          q.gte(q.field("avgRating"), 4.0),
          q.gte(q.field("trustScore"), 40), // Trust score ≥ 40
          q.gte(q.field("trustStars"), 3.0) // ALSO: Trust stars ≥ 3.0 (minimum "verified" tier)
        )
      )
      .collect();

    // Sort by trust stars first, then trust score
    return musicians
      .sort((a, b) => {
        // Primary: Trust stars
        const starDiff = (b.trustStars || 0.5) - (a.trustStars || 0.5);
        if (Math.abs(starDiff) > 0.5) return starDiff;

        // Secondary: Trust score
        const scoreDiff = (b.trustScore || 0) - (a.trustScore || 0);
        if (scoreDiff !== 0) return scoreDiff;

        // Tertiary: Rating
        return (b.avgRating || 0) - (a.avgRating || 0);
      })
      .slice(0, limit)
      .map((musician) => ({
        ...musician,
        displayRate: getGeneralDisplayRate(musician.rate),
        isFeatured: true,
      }));
  },
});
export const searchMusicians = query({
  args: {
    query: v.string(),
    city: v.optional(v.string()),
    instrument: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { query: searchQuery, city, instrument } = args;

    let musicians = await ctx.db
      .query("users")
      .withIndex("by_is_musician", (q) => q.eq("isMusician", true))
      .filter((q) =>
        q.and(
          q.eq(q.field("isBanned"), false),
          q.neq(q.field("availability"), "notavailable")
        )
      )
      .collect();

    // Apply search filters
    const searchTerm = searchQuery.toLowerCase();
    musicians = musicians.filter((musician) => {
      const nameMatch =
        musician.firstname?.toLowerCase().includes(searchTerm) ||
        musician.lastname?.toLowerCase().includes(searchTerm) ||
        musician.username?.toLowerCase().includes(searchTerm);

      const instrumentMatch = musician.instrument
        ?.toLowerCase()
        .includes(searchTerm);
      const genreMatch = musician.musiciangenres?.some((genre: string) =>
        genre.toLowerCase().includes(searchTerm)
      );

      const cityMatch = city ? musician.city === city : true;
      const instrumentFilter = instrument
        ? musician.instrument === instrument
        : true;

      return (
        (nameMatch || instrumentMatch || genreMatch) &&
        cityMatch &&
        instrumentFilter
      );
    });

    return musicians.slice(0, 20).map((musician) => ({
      ...musician,
      displayRate: musician.rate?.regular || "Contact for rate",
      gigTypeCompatibility: 50,
      isOptimalForGigType: false,
    }));
  },
});

export const getMusicianById = query({
  args: { musicianId: v.id("users") },
  handler: async (ctx, args) => {
    const { musicianId } = args;

    const musician = await ctx.db.get(musicianId);

    if (!musician || !musician.isMusician || musician.isBanned) {
      return null;
    }

    // Enhance musician data with displayRate
    const enhancedMusician = {
      ...musician,
      displayRate: musician.rate?.regular || "Contact for rate",
      gigTypeCompatibility: 50,
      isOptimalForGigType: false,
    };

    return enhancedMusician;
  },
});
