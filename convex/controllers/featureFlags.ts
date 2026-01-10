import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { canUserSendOrReceiveNotifications } from "../notHelpers";
import { createNotificationInternal } from "../createNotificationInternal";

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

// convex/featureFlags.ts
// convex/featureFlags.ts - COMPLETE UPDATED VERSION
export const setFeatureFlag = mutation({
  args: {
    flagId: v.string(),
    enabled: v.optional(v.boolean()),
    targetUsers: v.optional(
      v.union(
        v.literal("all"),
        v.literal("free"),
        v.literal("pro"),
        v.literal("premium"),
        v.literal("elite")
      )
    ),
    targetRoles: v.optional(v.array(v.string())),
    rolloutPercentage: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { flagId, enabled, ...otherArgs } = args;

    const existing = await ctx.db
      .query("featureFlags")
      .filter((q) => q.eq(q.field("id"), flagId))
      .first();

    const now = Date.now();
    const previousEnabledState = existing?.enabled ?? false;

    if (existing) {
      await ctx.db.patch(existing._id, {
        enabled: enabled ?? existing.enabled,
        targetUsers: otherArgs.targetUsers ?? existing.targetUsers,
        targetRoles: otherArgs.targetRoles ?? existing.targetRoles,
        rolloutPercentage:
          otherArgs.rolloutPercentage ?? existing.rolloutPercentage,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("featureFlags", {
        id: flagId,
        name: flagId,
        description: "",
        enabled: enabled ?? false,
        targetUsers: otherArgs.targetUsers ?? "all",
        targetRoles: otherArgs.targetRoles ?? [],
        rolloutPercentage: otherArgs.rolloutPercentage ?? 0,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Send notification when feature is enabled (and it wasn't already enabled)
    if (enabled === true && !previousEnabledState) {
      console.log(`🎯 [FEATURE FLAG] Feature ${flagId} was just enabled`);

      // Get all users
      const allUsers = await ctx.db.query("users").collect();

      // Get the targeting settings (use existing or new args)
      const targetUsers =
        otherArgs.targetUsers ?? existing?.targetUsers ?? "all";
      const targetRoles = otherArgs.targetRoles ?? existing?.targetRoles ?? [];
      const rolloutPercentage =
        otherArgs.rolloutPercentage ?? existing?.rolloutPercentage ?? 100;

      console.log(
        `🎯 [FEATURE FLAG] Targeting: ${targetUsers} users, roles: ${targetRoles}, rollout: ${rolloutPercentage}%`
      );

      let notificationCount = 0;
      let totalEligibleUsers = 0;

      // Log all users and their eligibility
      console.log(
        `👥 [FEATURE FLAG] Total users in system: ${allUsers.length}`
      );

      // Create an array to log eligibility details
      const eligibilityLog: Array<{
        username: string;
        tier: string;
        isMusician: boolean;
        isClient: boolean;
        isBooker: boolean;
        roleType?: string;
        clientType?: string;
        bookerType?: string;
        roles: string[];
        isProOrGracePeriod: boolean;
        isEligibleForFeature: boolean;
        notificationSent: boolean;
        reason?: string;
      }> = [];

      // Send notification to each eligible user
      for (const user of allUsers) {
        try {
          // Get user roles
          const userRoles = getUserRoles(user);

          // Check if user meets ALL criteria (WITH GRACE PERIOD BYPASS)
          const isEligible = isUserEligibleForFeature(user, {
            targetUsers,
            targetRoles,
            rolloutPercentage,
          });

          // Check if user can receive notifications (Pro/grace period)
          const canReceiveNotifications =
            canUserSendOrReceiveNotifications(user);

          // Log user details
          const userLog = {
            username: user.username || user.clerkId,
            tier: user.tier || "free",
            isMusician: user.isMusician || false,
            isClient: user.isClient || false,
            isBooker: user.isBooker || false,
            roleType: user.roleType || "none",
            clientType: user.clientType || "none",
            bookerType: user.bookerType || "none",
            roles: userRoles,
            isProOrGracePeriod: canReceiveNotifications,
            isEligibleForFeature: isEligible,
            notificationSent: false,
            reason: "",
          };

          if (isEligible) {
            totalEligibleUsers++;

            if (canReceiveNotifications) {
              // Use feature_announcement type which bypasses user settings
              const notificationId = await createNotificationInternal(ctx, {
                userDocumentId: user._id,
                type: "feature_announcement", // CHANGED from system_updates
                title: "New Feature Available! 🎉",
                message: `${existing?.name || flagId} is now live!`,
                image: "/images/feature-flags.png",
                actionUrl: "/settings/notifications",
                relatedUserDocumentId: undefined,
                isViewerInGracePeriod: user.tier !== "pro",
                metadata: {
                  featureFlagId: flagId,
                  featureName: existing?.name || flagId,
                  featureDescription: existing?.description || "",
                  targetUsers,
                  targetRoles,
                  rolloutPercentage,
                  notificationType: "feature_enabled",
                },
              });

              if (notificationId) {
                notificationCount++;
                userLog.notificationSent = true;
              } else {
                userLog.reason =
                  "Notification creation failed (unexpected error)";
              }
            } else {
              userLog.reason =
                "User cannot receive notifications (not Pro/grace period)";
            }
          } else {
            userLog.reason =
              "User not eligible for feature (wrong tier/role/rollout)";
          }

          eligibilityLog.push(userLog);
        } catch (error) {
          console.error(
            `❌ [FEATURE FLAG] Failed to process user ${user._id}:`,
            error
          );
        }
      }

      // Log detailed eligibility summary
      console.log(`📊 [FEATURE FLAG] ELIGIBILITY SUMMARY:`);
      console.log(`📊 Total users: ${allUsers.length}`);
      console.log(`📊 Eligible for feature: ${totalEligibleUsers}`);
      console.log(`📊 Notifications sent: ${notificationCount}`);

      // Log each user's eligibility details
      console.log(`📊 [FEATURE FLAG] DETAILED USER ELIGIBILITY:`);
      eligibilityLog.forEach((log) => {
        const statusEmoji = log.notificationSent
          ? "✅"
          : log.isEligibleForFeature
            ? "⚠️"
            : "❌";
        console.log(`${statusEmoji} ${log.username} (${log.tier}):`);
        console.log(
          `   Role: ${log.roleType}${log.clientType !== "none" ? `, Client: ${log.clientType}` : ""}${log.bookerType !== "none" ? `, Booker: ${log.bookerType}` : ""}`
        );
        console.log(`   User Roles: ${log.roles.join(", ")}`);
        console.log(`   Pro/Grace: ${log.isProOrGracePeriod ? "Yes" : "No"}`);
        console.log(
          `   Feature Eligible: ${log.isEligibleForFeature ? "Yes" : "No"}`
        );
        console.log(
          `   Notification: ${log.notificationSent ? "Sent" : "Not sent"}${log.reason ? ` (${log.reason})` : ""}`
        );
        console.log(`   ---`);
      });

      console.log(
        `✅ [FEATURE FLAG] Sent ${notificationCount} notifications (${totalEligibleUsers} eligible users)`
      );
    }

    return { success: true };
  },
});

// Helper function to check if a user is eligible for a feature WITH GRACE PERIOD BYPASS
function isUserEligibleForFeature(
  user: any,
  targeting: {
    targetUsers: string;
    targetRoles: string[];
    rolloutPercentage: number;
  }
): boolean {
  const { targetUsers, targetRoles, rolloutPercentage } = targeting;

  console.log(
    `🔍 [ELIGIBILITY] Checking user ${user.username || user.clerkId}:`
  );

  // Get user's tier and grace period status
  const userTier = user.tier || "free";
  const isInGracePeriod =
    canUserSendOrReceiveNotifications(user) && userTier !== "pro";

  console.log(`   User tier: ${userTier}, In grace period: ${isInGracePeriod}`);

  // 1. Check tier targeting WITH GRACE PERIOD BYPASS
  if (targetUsers !== "all") {
    const isProPremiumElite = ["pro", "premium", "elite"].includes(userTier);
    const isEligibleTier = targetUsers === userTier || isInGracePeriod;

    console.log(
      `   Tier check: Target=${targetUsers}, User=${userTier}, Pro/Premium/Elite=${isProPremiumElite}, GracePeriod=${isInGracePeriod}`
    );

    // User is eligible if:
    // - They match the target tier exactly, OR
    // - They are in grace period (bypass tier requirement)
    if (!isEligibleTier) {
      console.log(`   ❌ Tier mismatch and not in grace period`);
      return false;
    }
    console.log(`   ✅ Tier/grace period match`);
  }

  // 2. Check role targeting
  if (targetRoles && targetRoles.length > 0) {
    const userRoles = getUserRoles(user);
    const hasMatchingRole = targetRoles.some((role) =>
      userRoles.includes(role)
    );

    console.log(
      `   Role check: Target roles=${targetRoles.join(", ")}, User roles=${userRoles.join(", ")}`
    );

    // If no matching role AND targetRoles is not empty, user is not eligible
    if (!hasMatchingRole) {
      console.log(`   ❌ No matching role`);
      return false;
    }
    console.log(`   ✅ Role match`);
  }

  // 3. Check rollout percentage
  if (rolloutPercentage < 100) {
    // Simple deterministic rollout based on user ID
    const userHash = simpleHash(user._id);
    const rolloutThreshold = rolloutPercentage / 100;
    console.log(
      `   Rollout: ${rolloutPercentage}%, User hash=${userHash.toFixed(3)}, Threshold=${rolloutThreshold}`
    );

    if (userHash > rolloutThreshold) {
      console.log(`   ❌ Outside rollout percentage`);
      return false;
    }
    console.log(`   ✅ Within rollout percentage`);
  }

  console.log(`   ✅ User is eligible for feature`);
  return true;
}

// Helper to get user roles
function getUserRoles(user: any): string[] {
  const roles: string[] = ["all"];

  if (user.isMusician) {
    roles.push("musician");
    if (user.roleType) roles.push(user.roleType);
  }

  if (user.isClient) {
    roles.push("client");
    if (user.clientType) {
      // Client types already have "_client" suffix in database
      roles.push(user.clientType);
    }
  }

  if (user.isBooker) {
    roles.push("booker");
    if (user.bookerType) {
      roles.push(user.bookerType);
    }
  }

  return [...new Set(roles)];
}

// Simple hash function for deterministic rollout
function simpleHash(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash % 100) / 100;
}

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
export const updateFeatureFlag = mutation({
  args: {
    flagId: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    targetUsers: v.optional(
      v.union(
        v.literal("all"),
        v.literal("free"),
        v.literal("premium"),
        v.literal("pro"),
        v.literal("elite")
      )
    ),
    targetRoles: v.optional(v.array(v.string())),
    rolloutPercentage: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { flagId, ...updates } = args;

    console.log("🎯 [FEATURE FLAG UPDATE] Received:", { flagId, updates });

    // Get all flags and find the matching one
    const allFlags = await ctx.db.query("featureFlags").collect();
    const existingFlag = allFlags.find((flag) => flag.id === flagId);

    if (!existingFlag) {
      throw new Error(`Feature flag ${flagId} not found`);
    }

    console.log("📋 [FEATURE FLAG UPDATE] Existing flag:", existingFlag);
    console.log("🔄 [FEATURE FLAG UPDATE] Applying updates:", updates);

    await ctx.db.patch(existingFlag._id, {
      ...updates,
      updatedAt: Date.now(),
    });

    console.log("✅ [FEATURE FLAG UPDATE] Successfully updated");
  },
});
// convex/featureFlags.ts