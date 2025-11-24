import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

export const getFeatureFlags = query({
  args: {},
  handler: async (ctx) => {
    try {
      const flags = await ctx.db.query("featureFlags").collect();
      return flags;
    } catch (error) {
      console.error("Error fetching feature flags:", error);
      return [];
    }
  },
});

export const getFeatureFlagById = query({
  args: { flagId: v.string() },
  handler: async (ctx, args) => {
    const flag = await ctx.db
      .query("featureFlags")
      .filter((q) => q.eq(q.field("id"), args.flagId))
      .first();

    return flag;
  },
});

export const getEnabledFeatureFlags = query({
  args: {},
  handler: async (ctx) => {
    const flags = await ctx.db
      .query("featureFlags")
      .filter((q) => q.eq(q.field("enabled"), true))
      .collect();

    return flags;
  },
});

export const getFeatureFlagsByUserType = query({
  args: { userType: v.string() },
  handler: async (ctx, args) => {
    const flags = await ctx.db
      .query("featureFlags")
      .filter((q) =>
        q.or(
          q.eq(q.field("targetUsers"), "all"),
          q.eq(q.field("targetUsers"), args.userType)
        )
      )
      .collect();

    return flags;
  },
});

export const setFeatureFlag = mutation({
  args: {
    flagId: v.string(),
    enabled: v.optional(v.boolean()),
    targetUsers: v.optional(
      v.union(
        v.literal("all"),
        v.literal("free"),
        v.literal("pro"),
        v.literal("premium")
      )
    ),
    targetRoles: v.optional(v.array(v.string())),
    rolloutPercentage: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("featureFlags")
      .filter((q) => q.eq(q.field("id"), args.flagId))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        enabled: args.enabled ?? existing.enabled,
        targetUsers: args.targetUsers ?? existing.targetUsers,
        targetRoles: args.targetRoles ?? existing.targetRoles,
        rolloutPercentage: args.rolloutPercentage ?? existing.rolloutPercentage,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("featureFlags", {
        id: args.flagId,
        name: args.flagId,
        description: "",
        enabled: args.enabled ?? false,
        targetUsers: args.targetUsers ?? "all",
        targetRoles: args.targetRoles ?? [],
        rolloutPercentage: args.rolloutPercentage ?? 0,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

export const initializeFeatureFlags = mutation({
  args: {},
  handler: async (ctx) => {
    const defaultFlags = [
      {
        id: "teacher_role",
        name: "Teacher Role",
        description: "Enable teacher role registration and features",
        enabled: false,
        targetUsers: "all" as const,
        targetRoles: ["all"],
        rolloutPercentage: 0,
      },
      {
        id: "booker_role",
        name: "Booker Role",
        description: "Enable booker role registration and features",
        enabled: false,
        targetUsers: "all" as const,
        targetRoles: ["all"],
        rolloutPercentage: 0,
      },
      {
        id: "file_sharing",
        name: "File Sharing",
        description: "Enable file sharing features",
        enabled: true,
        targetUsers: "all" as const,
        targetRoles: ["all"],
        rolloutPercentage: 100,
      },
    ];

    for (const flag of defaultFlags) {
      const existing = await ctx.db
        .query("featureFlags")
        .filter((q) => q.eq(q.field("id"), flag.id))
        .first();

      if (!existing) {
        await ctx.db.insert("featureFlags", {
          ...flag,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }

    return { success: true };
  },
});

export const deleteFeatureFlag = mutation({
  args: { flagId: v.string() },
  handler: async (ctx, args) => {
    const flag = await ctx.db
      .query("featureFlags")
      .filter((q) => q.eq(q.field("id"), args.flagId))
      .first();

    if (flag) {
      await ctx.db.delete(flag._id);
      return { success: true };
    }

    return { success: false, error: "Flag not found" };
  },
});

export const updateFeatureFlagRollout = mutation({
  args: {
    flagId: v.string(),
    rolloutPercentage: v.number(),
  },
  handler: async (ctx, args) => {
    const flag = await ctx.db
      .query("featureFlags")
      .filter((q) => q.eq(q.field("id"), args.flagId))
      .first();

    if (flag) {
      await ctx.db.patch(flag._id, {
        rolloutPercentage: args.rolloutPercentage,
        updatedAt: Date.now(),
      });
      return { success: true };
    }

    return { success: false, error: "Flag not found" };
  },
});

export const getFeatureFlagsForUser = query({
  args: {
    userType: v.string(),
    userRoles: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const flags = await ctx.db
      .query("featureFlags")
      .filter((q) => q.eq(q.field("enabled"), true))
      .collect();

    // Filter flags based on user type and roles
    const filteredFlags = flags.filter((flag) => {
      // Check user type
      const userTypeMatch =
        flag.targetUsers === "all" || flag.targetUsers === args.userType;

      // Check roles
      const roleMatch =
        (flag?.targetRoles && flag.targetRoles.length === 0) ||
        (flag?.targetRoles && flag.targetRoles.includes("all")) ||
        args.userRoles.some(
          (role) => flag?.targetRoles && flag.targetRoles.includes(role)
        );

      return userTypeMatch && roleMatch;
    });

    return filteredFlags;
  },
});
