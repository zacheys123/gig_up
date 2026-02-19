// convex/controllers/userPreferences.ts
import { v } from "convex/values";
import { query, mutation } from "../_generated/server";

// Get user preferences
export const getUserPreferences = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// Update specific component preferences
export const updateComponentPreferences = mutation({
  args: {
    userId: v.string(),
    component: v.union(
      v.literal("pendingGigs"),
      v.literal("allGigs"),
      v.literal("bookedGigs"),
      v.literal("favoriteGigs"),
      v.literal("savedGigs"),
      v.literal("clientPreBooking"),
    ),
    settings: v.object({
      displayMode: v.optional(v.string()),
      activeTab: v.optional(v.string()),
      viewMode: v.optional(v.string()),
      sortBy: v.optional(v.string()),
      viewFilter: v.optional(v.string()),
      dateFilter: v.optional(v.string()),
      paymentFilter: v.optional(v.string()),
      statusFilter: v.optional(v.string()),
      activeGigTab: v.optional(v.string()),
      applicantView: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { userId, component, settings } = args;

    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    const now = Date.now();

    if (existing) {
      const currentPrefs = existing.preferences || {};

      const updatedPrefs = {
        ...currentPrefs,
        [component]: {
          ...(currentPrefs[component as keyof typeof currentPrefs] || {}),
          ...settings,
        },
      };

      await ctx.db.patch(existing._id, {
        preferences: updatedPrefs,
        updatedAt: now,
      });
    } else {
      // Create new preferences with just this component
      await ctx.db.insert("userPreferences", {
        userId,
        preferences: {
          [component]: settings,
        },
        updatedAt: now,
      });
    }
  },
});

// Update multiple components at once
export const updateUserPreferences = mutation({
  args: {
    userId: v.string(),
    preferences: v.object({
      pendingGigs: v.optional(
        v.object({
          displayMode: v.optional(v.string()),
          activeTab: v.optional(v.string()),
        }),
      ),
      allGigs: v.optional(
        v.object({
          displayMode: v.optional(v.string()),
          viewMode: v.optional(v.string()),
          sortBy: v.optional(v.string()),
          activeTab: v.optional(v.string()), // ADD THIS
        }),
      ),
      bookedGigs: v.optional(
        v.object({
          displayMode: v.optional(v.string()),
          viewFilter: v.optional(v.string()),
          dateFilter: v.optional(v.string()),
          paymentFilter: v.optional(v.string()),
        }),
      ),
      favoriteGigs: v.optional(
        v.object({
          displayMode: v.optional(v.string()),
          statusFilter: v.optional(v.string()),
          dateFilter: v.optional(v.string()),
        }),
      ),
      savedGigs: v.optional(
        v.object({
          displayMode: v.optional(v.string()),
          statusFilter: v.optional(v.string()),
          dateFilter: v.optional(v.string()),
        }),
      ),
      clientPreBooking: v.optional(
        v.object({
          displayMode: v.optional(v.string()),
          activeGigTab: v.optional(v.string()),
          activeTab: v.optional(v.string()),
          applicantView: v.optional(v.string()),
        }),
      ),
    }),
  },
  handler: async (ctx, args) => {
    const { userId, preferences } = args;

    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    const now = Date.now();

    if (existing) {
      const currentPrefs = existing.preferences || {};

      const mergedPrefs = {
        ...currentPrefs,
        ...(preferences.pendingGigs && {
          pendingGigs: {
            ...currentPrefs.pendingGigs,
            ...preferences.pendingGigs,
          },
        }),
        ...(preferences.allGigs && {
          allGigs: { ...currentPrefs.allGigs, ...preferences.allGigs },
        }),
        ...(preferences.bookedGigs && {
          bookedGigs: { ...currentPrefs.bookedGigs, ...preferences.bookedGigs },
        }),
        ...(preferences.favoriteGigs && {
          favoriteGigs: {
            ...currentPrefs.favoriteGigs,
            ...preferences.favoriteGigs,
          },
        }),
        ...(preferences.savedGigs && {
          savedGigs: { ...currentPrefs.savedGigs, ...preferences.savedGigs },
        }),
        ...(preferences.clientPreBooking && {
          clientPreBooking: {
            ...currentPrefs.clientPreBooking,
            ...preferences.clientPreBooking,
          },
        }),
      };

      await ctx.db.patch(existing._id, {
        preferences: mergedPrefs,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("userPreferences", {
        userId,
        preferences: preferences as any,
        updatedAt: now,
      });
    }
  },
});
