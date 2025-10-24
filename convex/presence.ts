// convex/presence.ts - FIXED VERSION
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Update user's global presence
export const updateUserPresence = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    // Check if presence record already exists
    const existing = await ctx.db
      .query("userPresence")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    const now = Date.now();

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, {
        lastSeen: now,
        isOnline: true,
      });
      return { success: true, lastSeen: now, updated: true };
    } else {
      // Create new record
      await ctx.db.insert("userPresence", {
        userId,
        lastSeen: now,
        isOnline: true,
      });
      return { success: true, lastSeen: now, created: true };
    }
  },
});

// Get user's global presence
export const getUserPresence = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const presence = await ctx.db
      .query("userPresence")
      .withIndex("by_userId", (q) => q.eq("userId", userId as any))
      .first();

    if (!presence) return null;

    return {
      userId: presence.userId,
      lastSeen: presence.lastSeen,
      isOnline: presence.isOnline,
    };
  },
});

// Get all users with their presence data - FIXED VERSION
export const getAllUsersWithPresence = query({
  args: {},
  handler: async (ctx) => {
    // Get all users
    const users = await ctx.db.query("users").collect();

    // Get all presence records
    const presenceRecords = await ctx.db.query("userPresence").collect();

    // Create a map for faster lookup
    const presenceMap = new Map();
    presenceRecords.forEach((record) => {
      presenceMap.set(record.userId, record);
    });

    // Combine users with their presence data
    const usersWithPresence = users.map((user) => {
      const presence = presenceMap.get(user._id);

      return {
        // User fields
        ...user,
        // Presence fields
        lastActive: presence?.lastSeen || null,
        isOnline: presence?.isOnline || false,
      };
    });

    return usersWithPresence;
  },
});

// Mark user as offline (optional - for cleanup)
export const markUserOffline = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const existing = await ctx.db
      .query("userPresence")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isOnline: false,
      });
      return { success: true };
    }
    return { success: false, message: "No presence record found" };
  },
});

// Get online users count
export const getOnlineUsersCount = query({
  args: {},
  handler: async (ctx) => {
    const onlineUsers = await ctx.db
      .query("userPresence")
      .withIndex("by_lastSeen", (q) =>
        q.gt("lastSeen", Date.now() - 5 * 60 * 1000)
      ) // Last 5 minutes
      .collect();

    return onlineUsers.length;
  },
});
