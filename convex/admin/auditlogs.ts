// convex/admin/audit.ts
import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

// Create audit log entry
export const createAuditLog = mutation({
  args: {
    action: v.string(),
    adminId: v.string(),
    adminName: v.optional(v.string()),
    targetUserId: v.string(),
    targetUsername: v.string(),
    reason: v.optional(v.string()),
    details: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("audit_logs", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

// Get audit logs with filters
export const getAuditLogs = query({
  args: {
    adminId: v.optional(v.string()),
    targetUserId: v.optional(v.string()),
    action: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let logs = await ctx.db.query("audit_logs").order("desc").collect();

    // Apply filters
    if (args.adminId) {
      logs = logs.filter((log) => log.adminId === args.adminId);
    }

    if (args.targetUserId) {
      logs = logs.filter((log) => log.targetUserId === args.targetUserId);
    }

    if (args.action) {
      logs = logs.filter((log) => log.action === args.action);
    }

    if (args.startDate) {
      logs = logs.filter((log) => log.timestamp >= args.startDate!);
    }

    if (args.endDate) {
      logs = logs.filter((log) => log.timestamp <= args.endDate!);
    }

    // Apply pagination
    const offset = args.offset || 0;
    const limit = args.limit || 50;

    return {
      logs: logs.slice(offset, offset + limit),
      total: logs.length,
      hasMore: offset + limit < logs.length,
    };
  },
});
