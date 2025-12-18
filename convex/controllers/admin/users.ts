// convex/admin/users.ts
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { createNotificationInternal } from "../createNotificationInternal";

// Get users with filters
export const getUsersForAdmin = query({
  args: {
    filters: v.optional(
      v.object({
        search: v.optional(v.string()),
        isBanned: v.optional(v.boolean()),
        isSuspended: v.optional(v.boolean()),
        isMusician: v.optional(v.boolean()),
        isClient: v.optional(v.boolean()),
        isBooker: v.optional(v.boolean()),
        tier: v.optional(v.union(v.literal("free"), v.literal("pro"))),
        roleType: v.optional(v.string()),
        minReports: v.optional(v.number()),
        maxReports: v.optional(v.number()),
        lastActiveDays: v.optional(v.number()),
        sortBy: v.optional(
          v.union(
            v.literal("created"),
            v.literal("lastActive"),
            v.literal("reportedCount"),
            v.literal("earnings")
          )
        ),
        sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
        limit: v.optional(v.number()),
        offset: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const filters = args.filters || {};
    let users = await ctx.db.query("users").collect();

    // Apply filters
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      users = users.filter(
        (user) =>
          user.firstname?.toLowerCase().includes(searchTerm) ||
          user.lastname?.toLowerCase().includes(searchTerm) ||
          user.username.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          user.city?.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.isBanned !== undefined) {
      users = users.filter((user) => user.isBanned === filters.isBanned);
    }

    if (filters.isSuspended !== undefined) {
      users = users.filter((user) => user.isSuspended === filters.isSuspended);
    }

    if (filters.isMusician !== undefined) {
      users = users.filter((user) => user.isMusician === filters.isMusician);
    }

    if (filters.isClient !== undefined) {
      users = users.filter((user) => user.isClient === filters.isClient);
    }

    if (filters.isBooker !== undefined) {
      users = users.filter((user) => user.isBooker === filters.isBooker);
    }

    if (filters.tier) {
      users = users.filter((user) => user.tier === filters.tier);
    }

    if (filters.roleType) {
      users = users.filter((user) => user.roleType === filters.roleType);
    }

    if (filters.minReports !== undefined) {
      users = users.filter(
        (user) => (user.reportedCount || 0) >= filters.minReports!
      );
    }

    if (filters.maxReports !== undefined) {
      users = users.filter(
        (user) => (user.reportedCount || 0) <= filters.maxReports!
      );
    }

    if (filters.lastActiveDays) {
      const cutoff = Date.now() - filters.lastActiveDays * 24 * 60 * 60 * 1000;
      users = users.filter((user) => (user.lastActive || 0) > cutoff);
    }

    // Sort
    if (filters.sortBy) {
      users.sort((a, b) => {
        let aVal: any, bVal: any;

        switch (filters.sortBy) {
          case "created":
            aVal = a._creationTime;
            bVal = b._creationTime;
            break;
          case "lastActive":
            aVal = a.lastActive || 0;
            bVal = b.lastActive || 0;
            break;
          case "reportedCount":
            aVal = a.reportedCount || 0;
            bVal = b.reportedCount || 0;
            break;
          case "earnings":
            aVal = a.earnings || 0;
            bVal = b.earnings || 0;
            break;
          default:
            aVal = a._creationTime;
            bVal = b._creationTime;
        }

        const order = filters.sortOrder === "asc" ? 1 : -1;
        return (aVal < bVal ? -1 : aVal > bVal ? 1 : 0) * order;
      });
    }

    // Apply pagination
    const offset = filters.offset || 0;
    const limit = filters.limit || 50;
    const paginatedUsers = users.slice(offset, offset + limit);

    return {
      users: paginatedUsers,
      total: users.length,
      hasMore: offset + limit < users.length,
    };
  },
});

// Ban user
export const banUser = mutation({
  args: {
    adminId: v.string(),
    userId: v.string(),
    reason: v.string(),
    durationDays: v.optional(v.number()),
    permanent: v.optional(v.boolean()),
    notifyUser: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.adminId))
      .first();

    if (!admin || !admin.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();
    const banExpiresAt = args.permanent
      ? undefined
      : args.durationDays
        ? now + args.durationDays * 24 * 60 * 60 * 1000
        : undefined;

    await ctx.db.patch(user._id, {
      isBanned: true,
      banReason: args.reason,
      bannedAt: now,
      bannedBy: args.adminId,
      banExpiresAt,
      lastAdminAction: now,
      actionHistory: [
        ...(user.actionHistory || []),
        {
          action: "banned",
          adminId: args.adminId,
          timestamp: now,
          details: `Reason: ${args.reason}, Duration: ${args.durationDays ? args.durationDays + " days" : "permanent"}`,
        },
      ],
    });

    // Notify user if requested
    if (args.notifyUser && args.notifyUser === true) {
      try {
        await createNotificationInternal(ctx, {
          userDocumentId: user._id,
          type: "admin_action",
          title: "Account Banned",
          message: `Your account has been banned. Reason: ${args.reason}`,
          actionUrl: "/support",
          metadata: {
            action: "ban",
            reason: args.reason,
            expiresAt: banExpiresAt,
            adminName: admin.firstname || "Admin",
          },
        });
      } catch (error) {
        console.error("Failed to send ban notification:", error);
      }
    }

    return { success: true, userId: user._id };
  },
});

// Suspend user
export const suspendUser = mutation({
  args: {
    adminId: v.string(),
    userId: v.string(),
    reason: v.string(),
    durationDays: v.number(),
    notifyUser: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.adminId))
      .first();

    if (!admin || !admin.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();
    const expiresAt = now + args.durationDays * 24 * 60 * 60 * 1000;

    await ctx.db.patch(user._id, {
      isSuspended: true,
      suspensionReason: args.reason,
      suspensionExpiresAt: expiresAt,
      lastAdminAction: now,
      actionHistory: [
        ...(user.actionHistory || []),
        {
          action: "suspended",
          adminId: args.adminId,
          timestamp: now,
          details: `Reason: ${args.reason}, Duration: ${args.durationDays} days`,
        },
      ],
    });

    if (args.notifyUser) {
      try {
        await createNotificationInternal(ctx, {
          userDocumentId: user._id,
          type: "admin_action",
          title: "Account Suspended",
          message: `Your account has been suspended for ${args.durationDays} days. Reason: ${args.reason}`,
          actionUrl: "/support",
          metadata: {
            action: "suspension",
            reason: args.reason,
            expiresAt,
            adminName: admin.firstname || "Admin",
          },
        });
      } catch (error) {
        console.error("Failed to send suspension notification:", error);
      }
    }

    return { success: true, userId: user._id };
  },
});

// Unban/Unsuspend user
export const unbanUser = mutation({
  args: {
    adminId: v.string(),
    userId: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.adminId))
      .first();

    if (!admin || !admin.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();
    const updates: any = {
      lastAdminAction: now,
      actionHistory: [
        ...(user.actionHistory || []),
        {
          action: "unbanned",
          adminId: args.adminId,
          timestamp: now,
          details: args.reason ? `Reason: ${args.reason}` : "Manual unbanned",
        },
      ],
    };

    if (user.isBanned) {
      updates.isBanned = false;
      updates.banReason = undefined;
      updates.bannedAt = undefined;
      updates.bannedBy = undefined;
      updates.banExpiresAt = undefined;
    }

    if (user.isSuspended) {
      updates.isSuspended = false;
      updates.suspensionReason = undefined;
      updates.suspensionExpiresAt = undefined;
    }

    await ctx.db.patch(user._id, updates);

    return { success: true, userId: user._id };
  },
});

// Add admin note
export const addAdminNote = mutation({
  args: {
    adminId: v.string(),
    userId: v.string(),
    note: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.adminId))
      .first();

    if (!admin || !admin.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();
    const newNote = {
      note: args.note,
      adminId: args.adminId,
      timestamp: now,
    };

    await ctx.db.patch(user._id, {
      adminNotes: [...(user.adminNotes || []), newNote],
      lastAdminAction: now,
    });

    return { success: true, note: newNote };
  },
});

// Add warning to user
export const addWarning = mutation({
  args: {
    adminId: v.string(),
    userId: v.string(),
    warning: v.string(),
    notifyUser: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.adminId))
      .first();

    if (!admin || !admin.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();
    const newWarning = {
      warning: args.warning,
      adminId: args.adminId,
      timestamp: now,
      acknowledged: false,
    };

    await ctx.db.patch(user._id, {
      warnings: [...(user.warnings || []), newWarning],
      lastAdminAction: now,
      actionHistory: [
        ...(user.actionHistory || []),
        {
          action: "warning_added",
          adminId: args.adminId,
          timestamp: now,
          details: `Warning: ${args.warning}`,
        },
      ],
    });

    // Notify user
    if (args.notifyUser) {
      try {
        await createNotificationInternal(ctx, {
          userDocumentId: user._id,
          type: "admin_action",
          title: "Administrative Warning",
          message: `You have received a warning: ${args.warning}`,
          actionUrl: "/profile",
          metadata: {
            action: "warning",
            warning: args.warning,
            adminName: admin.firstname || "Admin",
          },
        });
      } catch (error) {
        console.error("Failed to send warning notification:", error);
      }
    }

    return { success: true, warning: newWarning };
  },
});

// Delete user account (admin)
export const adminDeleteUser = mutation({
  args: {
    adminId: v.string(),
    userId: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.adminId))
      .first();

    if (!admin || !admin.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Record the action before deletion
    const now = Date.now();

    // You might want to create an audit log entry here
    await ctx.db.insert("audit_logs", {
      action: "user_deleted",
      adminId: args.adminId,
      targetUserId: args.userId,
      targetUsername: user.username,
      reason: args.reason,
      timestamp: now,
      details: `User deleted by admin. Reason: ${args.reason}`,
    });

    // Delete the user
    await ctx.db.delete(user._id);

    return { success: true, deletedUserId: args.userId };
  },
});

// Get user stats for dashboard
export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    const total = users.length;
    const active = users.filter((u) => {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      return (u.lastActive || 0) > thirtyDaysAgo;
    }).length;

    const banned = users.filter((u) => u.isBanned).length;
    const suspended = users.filter((u) => u.isSuspended).length;
    const musicians = users.filter((u) => u.isMusician).length;
    const clients = users.filter((u) => u.isClient).length;
    const bookers = users.filter((u) => u.isBooker).length;
    const proUsers = users.filter((u) => u.tier === "pro").length;
    const freeUsers = users.filter((u) => u.tier === "free").length;
    const reported = users.filter((u) => (u.reportedCount || 0) > 0).length;

    // Recent signups (last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentSignups = users.filter(
      (u) => u._creationTime > sevenDaysAgo
    ).length;

    return {
      total,
      active,
      inactive: total - active,
      banned,
      suspended,
      musicians,
      clients,
      bookers,
      proUsers,
      freeUsers,
      reported,
      recentSignups,
    };
  },
});
