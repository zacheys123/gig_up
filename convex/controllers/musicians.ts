// convex/musicians.ts - OPTIMIZED
import { query } from "../_generated/server";
import { v } from "convex/values";

// Tier order for sorting
const TIER_ORDER = { elite: 4, premium: 3, pro: 2, free: 1 };

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
  },
  handler: async (ctx, args) => {
    // Get all musicians first, then filter in JavaScript
    let musicians = await ctx.db
      .query("users")
      .filter((q) =>
        q.and(
          q.eq(q.field("isMusician"), true),
          q.eq(q.field("isBanned"), false),
          q.neq(q.field("onboardingComplete"), false)
        )
      )
      .collect();

    // Apply filters efficiently
    if (args.city) {
      const cityLower = args.city.toLowerCase();
      musicians = musicians.filter((m) =>
        m.city?.toLowerCase().includes(cityLower)
      );
    }

    if (args.tier) {
      musicians = musicians.filter((m) => m.tier === args.tier);
    }

    if (args.instrument) {
      const instrumentLower = args.instrument.toLowerCase();
      musicians = musicians.filter(
        (m) =>
          m.instrument?.toLowerCase().includes(instrumentLower) ||
          m.roleType?.toLowerCase().includes(instrumentLower)
      );
    }

    if (args.genre) {
      const genreLower = args.genre.toLowerCase();
      musicians = musicians.filter(
        (m) =>
          m.musiciangenres?.some((g) => g.toLowerCase().includes(genreLower)) ||
          m.genres?.toLowerCase().includes(genreLower) ||
          m.djGenre?.toLowerCase().includes(genreLower) ||
          m.vocalistGenre?.toLowerCase().includes(genreLower)
      );
    }

    if (args.minRating) {
      musicians = musicians.filter(
        (m) => (m.avgRating || 0) >= args.minRating!
      );
    }

    // Sort by tier (elite > premium > pro > free), then by rating
    musicians.sort((a, b) => {
      const tierDiff = TIER_ORDER[b.tier] - TIER_ORDER[a.tier];
      if (tierDiff !== 0) return tierDiff;

      return (b.avgRating || 0) - (a.avgRating || 0);
    });

    return args.limit ? musicians.slice(0, args.limit) : musicians;
  },
});

export const getFeaturedMusicians = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const musicians = await ctx.db
      .query("users")
      .filter((q) =>
        q.and(
          q.eq(q.field("isMusician"), true),
          q.eq(q.field("isBanned"), false),
          q.neq(q.field("onboardingComplete"), false),
          q.or(
            q.eq(q.field("tier"), "elite"),
            q.eq(q.field("tier"), "premium"),
            q.and(
              q.eq(q.field("tier"), "pro"),
              q.gte(q.field("avgRating"), 4.0)
            )
          )
        )
      )
      .collect();

    // Sort and limit
    return musicians
      .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
      .slice(0, args.limit || 12);
  },
});

export const getMusicianById = query({
  args: {
    musicianId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const musician = await ctx.db.get(args.musicianId);

    if (!musician || !musician.isMusician || musician.isBanned) {
      return null;
    }

    return musician;
  },
});

export const searchMusicians = query({
  args: {
    query: v.string(),
    city: v.optional(v.string()),
    instrument: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let musicians = await ctx.db
      .query("users")
      .filter((q) =>
        q.and(
          q.eq(q.field("isMusician"), true),
          q.eq(q.field("isBanned"), false),
          q.neq(q.field("onboardingComplete"), false)
        )
      )
      .collect();

    // Apply city filter if provided
    if (args.city) {
      const cityLower = args.city.toLowerCase();
      musicians = musicians.filter((m) =>
        m.city?.toLowerCase().includes(cityLower)
      );
    }

    // Apply instrument filter if provided
    if (args.instrument) {
      const instrumentLower = args.instrument.toLowerCase();
      musicians = musicians.filter(
        (m) =>
          m.instrument?.toLowerCase().includes(instrumentLower) ||
          m.roleType?.toLowerCase().includes(instrumentLower)
      );
    }

    const searchTerms = args.query
      .toLowerCase()
      .split(" ")
      .filter((term) => term.length > 0);

    if (searchTerms.length === 0) {
      return musicians.slice(0, 20);
    }

    const filteredMusicians = musicians.filter((musician) => {
      const searchableFields = [
        musician.firstname,
        musician.lastname,
        musician.username,
        musician.instrument,
        musician.roleType,
        musician.djGenre,
        musician.vocalistGenre,
        musician.bio,
        musician.talentbio,
        musician.city,
        ...(musician.musiciangenres || []),
        ...(musician.genres ? [musician.genres] : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchTerms.every((term) => searchableFields.includes(term));
    });

    return filteredMusicians.slice(0, 20);
  },
});
