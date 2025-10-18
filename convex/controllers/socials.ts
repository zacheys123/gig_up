// convex/controllers/social.ts
import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

export const getFollowersWithDetails = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const followerIds = user.followers || [];
    if (followerIds.length === 0) return [];

    // Bulk get all followers
    const followers = await Promise.all(
      followerIds.map((id) => ctx.db.get(id as Id<"users">))
    );

    const validFollowers = followers.filter(Boolean);
    const userFollowings = user.followings || [];

    return validFollowers.map((follower) => {
      const mutualFollowers =
        follower?.followers?.filter((fid) => userFollowings.includes(fid))
          .length || 0;

      return {
        _id: follower?._id,
        clerkId: follower?.clerkId,
        firstname: follower?.firstname,
        lastname: follower?.lastname,
        username: follower?.username,
        picture: follower?.picture,
        city: follower?.city,
        instrument: follower?.instrument,
        isMusician: follower?.isMusician ?? false,
        isClient: follower?.isClient ?? false,
        tier: follower?.tier ?? "free",
        talentbio: follower?.talentbio,
        followers: follower?.followers?.length || 0,
        followings: follower?.followings?.length || 0,
        mutualFollowers,
        lastActive: follower?.lastActive,
        isPrivate: follower?.isPrivate ?? false,
        roleType: follower?.roleType,
        experience: follower?.experience,
      };
    });
  },
});

export const removeFollower = mutation({
  args: {
    userId: v.string(),
    followerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get both users in parallel
    const [currentUser, follower] = await Promise.all([
      ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
        .first(),
      ctx.db.get(args.followerId),
    ]);

    if (!currentUser || !follower) throw new Error("User not found");

    const now = Date.now();

    // Update both users in parallel
    await Promise.all([
      ctx.db.patch(currentUser._id, {
        followers: (currentUser.followers || []).filter(
          (id) => id !== args.followerId
        ),
        lastActive: now,
      }),
      ctx.db.patch(args.followerId, {
        followings: (follower?.followings || []).filter(
          (id) => id !== currentUser._id
        ),
        lastActive: now,
      }),
    ]);

    return { success: true };
  },
});

export const getFollowersStats = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const followerIds = user.followers || [];
    if (followerIds.length === 0) {
      return {
        total: 0,
        musicians: 0,
        clients: 0,
        proUsers: 0,
        mutualFollowers: 0,
      };
    }

    // Bulk get all followers
    const followers = await Promise.all(
      followerIds.map((id) => ctx.db.get(id as Id<"users">))
    );

    const validFollowers = followers.filter(Boolean);
    const userFollowings = user.followings || [];

    const stats = validFollowers.reduce(
      (acc, follower) => {
        acc.total++;
        if (follower?.isMusician) acc.musicians++;
        if (follower?.isClient) acc.clients++;
        if (follower?.tier === "pro") acc.proUsers++;

        const isMutual = follower?.followers?.some((fid) =>
          userFollowings.includes(fid)
        );
        if (isMutual) acc.mutualFollowers++;

        return acc;
      },
      {
        total: 0,
        musicians: 0,
        clients: 0,
        proUsers: 0,
        mutualFollowers: 0,
      }
    );

    return stats;
  },
});

export const bulkRemoveFollowers = mutation({
  args: {
    userId: v.string(),
    followerIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
      .first();

    if (!currentUser) throw new Error("User not found");

    // Bulk get all followers to remove
    const followers = await Promise.all(
      args.followerIds.map((id) => ctx.db.get(id))
    );

    const now = Date.now();
    const updates = [];

    // Prepare all updates
    for (let i = 0; i < args.followerIds.length; i++) {
      const followerId = args.followerIds[i];
      const follower = followers[i];

      if (!follower) continue;

      // Remove from current user's followers
      const updatedFollowers = (currentUser.followers || []).filter(
        (id) => id !== followerId
      );

      // Remove from follower's followings
      const updatedFollowerFollowings = (follower?.followings || []).filter(
        (id) => id !== currentUser._id
      );

      updates.push(
        ctx.db.patch(currentUser._id, {
          followers: updatedFollowers,
          lastActive: now,
        }),
        ctx.db.patch(followerId, {
          followings: updatedFollowerFollowings,
          lastActive: now,
        })
      );
    }

    // Execute all updates in parallel
    await Promise.all(updates);

    return {
      totalProcessed: args.followerIds.length,
      successful: updates.length / 2, // Each operation creates 2 updates
    };
  },
});

export const searchFollowers = query({
  args: {
    userId: v.id("users"),
    query: v.optional(v.string()),
    filterType: v.optional(
      v.union(v.literal("all"), v.literal("musicians"), v.literal("clients"))
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const followerIds = user.followers || [];
    if (followerIds.length === 0) return [];

    // Bulk get all followers
    const followers = await Promise.all(
      followerIds.map((id) => ctx.db.get(id as Id<"users">))
    );

    const validFollowers = followers.filter(Boolean);
    const userFollowings = user.followings || [];
    const searchTerm = (args.query || "").toLowerCase();

    return validFollowers
      .map((follower) => {
        const mutualFollowers =
          follower?.followers?.filter((fid) => userFollowings.includes(fid))
            .length || 0;

        return {
          _id: follower?._id,
          clerkId: follower?.clerkId,
          firstname: follower?.firstname,
          lastname: follower?.lastname,
          username: follower?.username,
          picture: follower?.picture,
          city: follower?.city,
          instrument: follower?.instrument,
          isMusician: follower?.isMusician ?? false,
          isClient: follower?.isClient ?? false,
          tier: follower?.tier ?? "free",
          talentbio: follower?.talentbio,
          followers: follower?.followers?.length || 0,
          followings: follower?.followings?.length || 0,
          mutualFollowers,
          lastActive: follower?.lastActive,
          isPrivate: follower?.isPrivate ?? false,
          roleType: follower?.roleType,
          experience: follower?.experience,
        };
      })
      .filter((follower) => {
        // Apply search filter
        const matchesSearch =
          !searchTerm ||
          follower?.firstname?.toLowerCase().includes(searchTerm) ||
          follower?.lastname?.toLowerCase().includes(searchTerm) ||
          (follower?.username &&
            follower?.username.toLowerCase().includes(searchTerm)) ||
          follower?.city?.toLowerCase().includes(searchTerm) ||
          follower?.instrument?.toLowerCase().includes(searchTerm);

        // Apply type filter
        const matchesFilter =
          !args.filterType ||
          args.filterType === "all" ||
          (args.filterType === "musicians" && follower?.isMusician) ||
          (args.filterType === "clients" && follower?.isClient);

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0)); // Default sort by recent
  },
});
