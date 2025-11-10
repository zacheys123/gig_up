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

// Helper functions
const calculateGigTypeCompatibility = (
  musician: any,
  gigType: string
): number => {
  let score = 0;

  // Instrument compatibility (50% of score)
  const instrument = musician.instrument?.toLowerCase();
  const instrumentScore = INSTRUMENT_COMPATIBILITY[gigType]?.[instrument] || 50;
  score += instrumentScore * 0.5;

  // Rating and reliability (30% of score)
  const ratingScore = (musician.avgRating || 0) * 20;
  const reliabilityScore = musician.reliabilityScore || 50;
  score += (ratingScore + reliabilityScore) * 0.15;

  // Experience bonus (10% of score)
  const experienceBonus = Math.min((musician.completedGigsCount || 0) / 2, 20);
  score += experienceBonus;

  // Tier bonus (10% of score)
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
    wedding: ["violin", "piano", "vocalist", "guitar", "harp", "cello"],
    corporate: ["piano", "dj", "mc", "saxophone"],
    concert: ["guitar", "drums", "bass", "vocalist", "keyboard"],
    "private-party": ["dj", "mc", "guitar", "vocalist"],
    restaurant: ["piano", "guitar", "violin", "saxophone"],
    church: ["piano", "violin", "vocalist", "organ"],
    festival: ["dj", "guitar", "drums", "bass", "mc"],
    club: ["dj", "mc", "saxophone"],
    recording: ["guitar", "piano", "bass", "drums", "violin"],
  };

  const instruments = optimalInstruments[gigType] || [];
  const musicianInstrument = musician.instrument?.toLowerCase();

  return instruments.includes(musicianInstrument);
};

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
  },
  handler: async (ctx, args) => {
    const {
      city,
      instrument,
      genre,
      limit = 12,
      minRating = 4.0,
      tier,
      gigType,
      availableOnly = true,
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
          };
          return enhancedMusician;
        })
        .sort((a, b) => b.gigTypeCompatibility - a.gigTypeCompatibility);
    } else {
      // Default sorting by rating and reliability
      musicians = musicians
        .map((musician) => {
          const enhancedMusician = {
            ...musician,
            gigTypeCompatibility: 50,
            displayRate: musician.rate?.regular || "Contact for rate",
            isOptimalForGigType: false,
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

export const getFeaturedMusicians = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { limit = 8 } = args;

    let musicians = await ctx.db
      .query("users")
      .withIndex("by_is_musician", (q) => q.eq("isMusician", true))
      .filter((q) =>
        q.and(
          q.eq(q.field("isBanned"), false),
          q.neq(q.field("availability"), "notavailable"),
          q.neq(q.field("tier"), "free"),
          q.gte(q.field("avgRating"), 4.5)
        )
      )
      .collect();

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
