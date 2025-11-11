// convex/controllers/musicians.ts - COMPLETE UPDATED VERSION

import { v } from "convex/values";
import { query } from "../_generated/server";

// Gig type to rate field mapping
const GIG_TYPE_RATE_MAPPING = {
  wedding: "function",
  corporate: "corporate",
  "private-party": "function",
  concert: "concert",
  restaurant: "regular",
  church: "regular",
  festival: "concert",
  club: "regular",
  recording: "regular",
  individual: "regular",
  other: "regular",
} as const;

// Instrument compatibility matrix
const INSTRUMENT_COMPATIBILITY: Record<string, Record<string, number>> = {
  wedding: {
    violin: 100,
    piano: 95,
    vocalist: 90,
    guitar: 85,
    saxophone: 80,
    cello: 85,
    harp: 90,
    flute: 80,
    trumpet: 75,
    dj: 60,
  },
  corporate: {
    piano: 95,
    dj: 90,
    mc: 85,
    saxophone: 80,
    violin: 75,
    guitar: 70,
    vocalist: 75,
    bass: 65,
    drums: 60,
  },
  concert: {
    guitar: 100,
    drums: 95,
    bass: 90,
    vocalist: 85,
    piano: 80,
    saxophone: 75,
    violin: 70,
    keyboard: 85,
    dj: 50,
  },
  "private-party": {
    dj: 95,
    mc: 90,
    guitar: 85,
    vocalist: 80,
    saxophone: 75,
    piano: 80,
    drums: 85,
    bass: 80,
  },
  restaurant: {
    piano: 95,
    guitar: 90,
    violin: 85,
    saxophone: 80,
    vocalist: 75,
    cello: 80,
    flute: 75,
  },
  church: {
    piano: 95,
    violin: 90,
    vocalist: 85,
    organ: 95,
    guitar: 80,
    cello: 85,
    trumpet: 75,
  },
  festival: {
    dj: 95,
    guitar: 90,
    drums: 85,
    bass: 85,
    vocalist: 80,
    saxophone: 75,
    mc: 90,
  },
  club: {
    dj: 100,
    mc: 95,
    saxophone: 80,
    guitar: 75,
    drums: 70,
    bass: 70,
    vocalist: 75,
  },
  recording: {
    guitar: 95,
    piano: 90,
    bass: 90,
    drums: 85,
    violin: 80,
    vocalist: 85,
    saxophone: 75,
  },
  individual: {
    guitar: 90,
    piano: 85,
    violin: 80,
    vocalist: 85,
    saxophone: 75,
  },
  other: {
    guitar: 80,
    piano: 80,
    violin: 75,
    vocalist: 75,
    dj: 70,
  },
};

const calculateGigTypeCompatibility = (
  musician: any,
  gigType: string
): number => {
  let score = 0;

  // Role compatibility (20% of score)
  const roleCompatibility = {
    dj: {
      club: 100,
      festival: 95,
      "private-party": 90,
      corporate: 70,
      wedding: 30,
      church: 10,
      restaurant: 20,
    },
    mc: {
      club: 100,
      festival: 90,
      "private-party": 85,
      corporate: 75,
      wedding: 40,
      church: 15,
      restaurant: 25,
    },
    vocalist: {
      wedding: 95,
      concert: 90,
      church: 85,
      restaurant: 80,
      corporate: 75,
      "private-party": 85,
      club: 70,
      festival: 80,
    },
    instrumentalist: {
      wedding: 80,
      concert: 90,
      church: 85,
      restaurant: 80,
      corporate: 75,
      "private-party": 80,
      club: 70,
      festival: 85,
    },
  };

  const musicianRole = musician.role?.toLowerCase();

  // Safe role score calculation
  let roleScore = 50; // Default score
  if (
    musicianRole &&
    roleCompatibility[musicianRole as keyof typeof roleCompatibility]
  ) {
    const roleScores =
      roleCompatibility[musicianRole as keyof typeof roleCompatibility];
    // Use type assertion for the gigType access
    roleScore = (roleScores as any)[gigType] || 50;
  }
  score += roleScore * 0.2;

  // Instrument compatibility (30% of score) - reduced from 50%
  const instrument = musician.instrument?.toLowerCase();
  const instrumentScore =
    (INSTRUMENT_COMPATIBILITY as any)[gigType]?.[instrument] || 50;
  score += instrumentScore * 0.3;

  // Rest of your existing scoring (50%)
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

const getMusicianRateForGigType = (musician: any, gigType?: string): string => {
  if (!gigType || !musician.rate) {
    return musician.rate?.regular || "Contact for rate";
  }

  const rateField =
    GIG_TYPE_RATE_MAPPING[gigType as keyof typeof GIG_TYPE_RATE_MAPPING];
  const rate = musician.rate[rateField] || musician.rate.regular;

  return rate || "Contact for rate";
};

const calculateOptimalForGigType = (
  musician: any,
  gigType: string
): boolean => {
  const optimalInstruments: Record<string, string[]> = {
    wedding: [
      "violin",
      "piano",
      "vocalist",
      "guitar",
      "harp",
      "cello",
      "string quartet",
      "organ",
      "flute",
      "trumpet",
      "choir",
    ],
    corporate: [
      "piano",
      "dj",
      "mc",
      "saxophone",
      "jazz trio",
      "guitar",
      "violin",
      "keyboard",
      "background music",
      "string quartet",
    ],
    concert: [
      "guitar",
      "drums",
      "bass",
      "vocalist",
      "keyboard",
      "piano",
      "saxophone",
      "trumpet",
      "violin",
      "backing vocals",
      "band",
    ],
    "private-party": [
      "dj",
      "mc",
      "guitar",
      "vocalist",
      "saxophone",
      "bass",
      "drums",
      "keyboard",
      "piano",
      "band",
      "entertainer",
    ],
    restaurant: [
      "piano",
      "guitar",
      "violin",
      "saxophone",
      "cello",
      "flute",
      "jazz trio",
      "keyboard",
      "harp",
      "background music",
    ],
    church: [
      "piano",
      "violin",
      "vocalist",
      "organ",
      "cello",
      "choir",
      "trumpet",
      "flute",
      "harp",
      "guitar",
    ],
    festival: [
      "dj",
      "guitar",
      "drums",
      "bass",
      "mc",
      "vocalist",
      "keyboard",
      "saxophone",
      "trumpet",
      "band",
      "backing vocals",
    ],
    club: [
      "dj",
      "mc",
      "saxophone",
      "trumpet",
      "bass",
      "drums",
      "keyboard",
      "vocalist",
      "guitar",
      "electronic",
    ],
    recording: [
      "guitar",
      "piano",
      "bass",
      "drums",
      "violin",
      "cello",
      "vocalist",
      "saxophone",
      "trumpet",
      "keyboard",
      "session musician",
    ],
    individual: [
      "guitar",
      "piano",
      "violin",
      "vocalist",
      "saxophone",
      "keyboard",
    ],
    other: ["guitar", "piano", "violin", "vocalist", "keyboard", "dj"],
  };

  const instruments = optimalInstruments[gigType] || [];
  const musicianInstrument = musician.instrument?.toLowerCase();

  return instruments.includes(musicianInstrument);
};

// convex/controllers/musicians.ts - ADD INCOMPATIBLE INSTRUMENTS FILTER

const INCOMPATIBLE_ROLE_COMBINATIONS: Record<string, string[]> = {
  wedding: ["dj", "electronic"], // No DJs in weddings
  corporate: ["dj"], // Most roles okay in corporate (depends on style)
  church: ["dj", "mc", "electronic"], // No DJs/MCs in church
  restaurant: ["dj", "mc"], // No DJs/MCs in restaurants
  club: ["mc"], // All roles typically welcome in clubs
  festival: [], // All roles welcome in festivals
  concert: [], // All roles possible in concerts
  "private-party": [], // All roles welcome in private parties
  recording: ["mc", "dj"], // All roles possible in recording
  individual: ["dj", "mc"], // All roles possible
  other: [], // All roles possible
};

// Replace both functions with this single, improved version:
const isMusicianCompatibleWithGigType = (
  musician: any,
  gigType: string
): boolean => {
  if (!gigType) return true;

  const incompatibleRoles = INCOMPATIBLE_ROLE_COMBINATIONS[gigType] || [];
  const musicianRole = musician.role?.toLowerCase();

  // Check role compatibility first
  if (musicianRole && incompatibleRoles.includes(musicianRole)) {
    return false;
  }

  // Also check if instrument name contains incompatible terms
  const musicianInstrument = musician.instrument?.toLowerCase();
  if (musicianInstrument) {
    return !incompatibleRoles.some((incompatible) =>
      musicianInstrument.includes(incompatible)
    );
  }

  return true;
};

// Then update the mapping part to use the same function:

// Update your getProMusicians query to include compatibility filter
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
    gigType: v.optional(v.string()),
    availableOnly: v.optional(v.boolean()),
    enforceCompatibility: v.optional(v.boolean()), // NEW: Add this flag
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
      enforceCompatibility = true, // NEW: Default to true to enforce compatibility
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

    // In your getProMusicians query, update the compatibility check:
    if (gigType && enforceCompatibility) {
      musicians = musicians.filter(
        (musician) => isMusicianCompatibleWithGigType(musician, gigType) // Use enhanced function
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

    // Apply gig type compatibility scoring and sorting
    if (gigType) {
      musicians = musicians
        .map((musician) => {
          const enhancedMusician = {
            ...musician,
            gigTypeCompatibility: calculateGigTypeCompatibility(
              musician,
              gigType
            ),
            displayRate: getMusicianRateForGigType(musician, gigType),
            isOptimalForGigType: calculateOptimalForGigType(musician, gigType),
            isCompatible: isMusicianCompatibleWithGigType(musician, gigType),
          };
          return enhancedMusician;
        })
        .sort((a, b) => {
          // Sort compatible musicians first, then by compatibility score
          if (a.isCompatible !== b.isCompatible) {
            return a.isCompatible ? -1 : 1;
          }
          return b.gigTypeCompatibility - a.gigTypeCompatibility;
        });
    } else {
      musicians = musicians
        .map((musician) => {
          const enhancedMusician = {
            ...musician,
            gigTypeCompatibility: 50,
            displayRate: musician.rate?.regular || "Contact for rate",
            isOptimalForGigType: false,
            isCompatible: true, // No gig type specified, all are compatible
          };
          return enhancedMusician;
        })
        .sort((a, b) => {
          const scoreA = (a.avgRating || 0) * 20 + (a.reliabilityScore || 0);
          const scoreB = (b.avgRating || 0) * 20 + (b.reliabilityScore || 0);
          return scoreB - scoreA;
        });
    }

    return musicians.slice(0, limit);
  },
});

// Update featured musicians to be less restrictive
export const getFeaturedMusicians = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { limit = 8 } = args;

    // First try to get high-rated musicians
    let musicians = await ctx.db
      .query("users")
      .withIndex("by_is_musician", (q) => q.eq("isMusician", true))
      .filter((q) =>
        q.and(
          q.eq(q.field("isBanned"), false),
          q.gte(q.field("avgRating"), 4.0) // Lowered from 4.5
        )
      )
      .collect();

    // If not enough, get any pro+ musicians
    if (musicians.length < limit) {
      const additionalMusicians = await ctx.db
        .query("users")
        .withIndex("by_is_musician", (q) => q.eq("isMusician", true))
        .filter((q) =>
          q.and(
            q.eq(q.field("isBanned"), false),
            q.neq(q.field("tier"), "free")
          )
        )
        .collect();

      // Combine and remove duplicates
      const allMusicians = [...musicians, ...additionalMusicians];
      const uniqueMusicians = allMusicians.filter(
        (musician, index, self) =>
          index === self.findIndex((m) => m._id === musician._id)
      );
      musicians = uniqueMusicians;
    }

    // Sort by tier and rating
    const tierOrder = { elite: 4, premium: 3, pro: 2, free: 1 };
    musicians = musicians
      .sort((a, b) => {
        const tierScoreA = tierOrder[a.tier as keyof typeof tierOrder] || 0;
        const tierScoreB = tierOrder[b.tier as keyof typeof tierOrder] || 0;

        if (tierScoreB !== tierScoreA) {
          return tierScoreB - tierScoreA;
        }

        return (b.avgRating || 0) - (a.avgRating || 0);
      })
      .slice(0, limit);

    return musicians.map((musician) => ({
      ...musician,
      displayRate: musician.rate?.regular || "Contact for rate",
      gigTypeCompatibility: 50,
      isOptimalForGigType: false,
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
