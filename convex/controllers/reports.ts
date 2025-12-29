// convex/reports.ts

import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const createReport = mutation({
  args: {
    reportedUserId: v.string(), // The ID of the user being reported
    reason: v.string(),
    additionalInfo: v.optional(v.string()),
    category: v.optional(v.string()),
    createdByClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the reporter (current user)
    const reporter = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.createdByClerkId))
      .first();

    if (!reporter) {
      throw new Error("Reporter not found");
    }

    // Check if the reported user exists
    const reportedUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.reportedUserId))
      .first();

    if (!reportedUser) {
      throw new Error("Reported user not found");
    }

    // Prevent users from reporting themselves
    if (reporter.clerkId === args.reportedUserId) {
      throw new Error("You cannot report yourself");
    }

    // Check if user has already reported this user recently (optional)
    const existingReport = await ctx.db
      .query("reports")
      .withIndex("by_reporter", (q) =>
        q.eq("reporterId", args.createdByClerkId)
      )
      .collect();

    const recentReport = existingReport.find(
      (report) =>
        report.reportedUserId === args.reportedUserId &&
        Date.now() - report.createdAt < 24 * 60 * 60 * 1000 // 24 hours
    );

    if (recentReport) {
      throw new Error(
        "You have already reported this user recently. Please wait 24 hours."
      );
    }

    // Create the report
    const now = Date.now();
    const reportId = await ctx.db.insert("reports", {
      reporterId: args.createdByClerkId,
      reportedUserId: args.reportedUserId,
      reason: args.reason,
      additionalInfo: args.additionalInfo || "",
      status: "pending",
      createdAt: now,
      updatedAt: now,
      category: args.category || "user_report",
      priority: "medium", // Default priority
    });

    await ctx.db.patch(reportedUser._id, {
      reportedCount: (reportedUser.reportedCount ?? 0) + 1,
    });

    // Create notification for admins (optional)
    try {
      const admins = await ctx.db
        .query("users")
        .withIndex("by_is_admin", (q) => q.eq("isAdmin", true))
        .collect();

      // You can create notifications for admins here if you have a notification system
      // await createNotificationForAdmins(...);
    } catch (error) {
      console.error("Failed to notify admins:", error);
      // Don't throw - we don't want report creation to fail if admin notification fails
    }

    return { success: true, reportId };
  },
});

export const getReportsByUser = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin or the user themselves
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Only admins can view all reports
    if (!currentUser.isAdmin && identity.subject !== args.userId) {
      throw new Error("Unauthorized");
    }

    const reports = await ctx.db
      .query("reports")
      .withIndex("by_reported_user", (q) => q.eq("reportedUserId", args.userId))
      .collect();

    return reports;
  },
});

export const updateReportStatus = mutation({
  args: {
    reportId: v.id("reports"),
    status: v.union(
      v.literal("pending"),
      v.literal("reviewing"),
      v.literal("resolved"),
      v.literal("dismissed")
    ),
    resolutionNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser || !currentUser.isAdmin) {
      throw new Error("Unauthorized - Admins only");
    }

    const report = await ctx.db.get(args.reportId);
    if (!report) {
      throw new Error("Report not found");
    }

    const updates: any = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.status === "resolved" || args.status === "dismissed") {
      updates.resolvedBy = identity.subject;
      updates.resolvedAt = Date.now();
      updates.resolutionNote = args.resolutionNote;
    }

    await ctx.db.patch(args.reportId, updates);

    return { success: true };
  },
});
