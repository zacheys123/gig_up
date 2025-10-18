// convex/controllers/social.ts
import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { isUserDocument } from "../createNotificationInternal";

// Enhanced follower details interface
export interface FollowerDetails {
  _id: string;
  clerkId: string;
  firstname?: string;
  lastname?: string;
  username: string;
  picture?: string;
  city?: string;
  instrument?: string;
  isMusician: boolean;
  isClient: boolean;
  tier: string;
  talentbio?: string;
  followers: number;
  followings: number;
  mutualFollowers?: number;
  lastActive?: number;
  isPrivate?: boolean;
  roleType?: string;
  experience?: string;
}

export const getFollowersWithDetails = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<FollowerDetails[]> => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const followers = user.followers || [];
    const userFollowings = user.followings || [];

    const followersWithDetails: FollowerDetails[] = [];

    for (const followerId of followers) {
      const follower = await ctx.db.get(followerId as Id<"users">);

      // Skip if not a user document
      if (!follower || !isUserDocument(follower)) {
        continue;
      }

      // Calculate mutual followers
      const mutualFollowers =
        follower.followers?.filter((fid) => userFollowings.includes(fid))
          .length || 0;

      followersWithDetails.push({
        _id: follower._id,
        clerkId: follower.clerkId,
        firstname: follower.firstname,
        lastname: follower.lastname,
        username: follower.username,
        picture: follower.picture,
        city: follower.city,
        instrument: follower.instrument,
        isMusician: follower.isMusician ?? false,
        isClient: follower.isClient ?? false,
        tier: follower.tier ?? "free",
        talentbio: follower.talentbio,
        followers: follower.followers?.length || 0,
        followings: follower.followings?.length || 0,
        mutualFollowers,
        lastActive: follower.lastActive,
        isPrivate: follower.isPrivate ?? false,
        roleType: follower.roleType,
        experience: follower.experience,
      });
    }

    return followersWithDetails;
  },
});

// convex/controllers/social.ts
export const removeFollower = mutation({
  args: {
    userId: v.string(), // clerkId of the current user
    followerId: v.id("users"), // ID of the follower to remove
  },
  handler: async (ctx, args) => {
    // Get current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
      .first();

    if (!currentUser) throw new Error("User not found");

    // Get follower to remove
    const followerToRemove = await ctx.db.get(args.followerId);
    if (!followerToRemove) throw new Error("Follower not found");

    // Remove from current user's followers list
    const updatedFollowers = (currentUser.followers || []).filter(
      (id) => id !== args.followerId
    );

    // Remove from follower's followings list
    const updatedFollowerFollowings = (
      followerToRemove.followings || []
    ).filter((id) => id !== currentUser._id);

    // Update both users
    await ctx.db.patch(currentUser._id, {
      followers: updatedFollowers,
      lastActive: Date.now(),
    });

    await ctx.db.patch(args.followerId, {
      followings: updatedFollowerFollowings,
      lastActive: Date.now(),
    });

    return { success: true, removedFollowerId: args.followerId };
  },
});

// convex/controllers/social.ts
export const getFollowersStats = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const followers = user.followers || [];
    const userFollowings = user.followings || [];

    let musicians = 0;
    let clients = 0;
    let proUsers = 0;
    let mutualFollowers = 0;
    let totalFollowers = followers.length;

    for (const followerId of followers) {
      const follower = await ctx.db.get(followerId as Id<"users">);

      if (follower && isUserDocument(follower)) {
        if (follower.isMusician) musicians++;
        if (follower.isClient) clients++;
        if (follower.tier === "pro") proUsers++;

        // Check if mutual follower
        const isMutual = follower.followers?.some((fid) =>
          userFollowings.includes(fid)
        );
        if (isMutual) mutualFollowers++;
      }
    }

    return {
      total: totalFollowers,
      musicians,
      clients,
      proUsers,
      mutualFollowers,
      // Growth metrics (you might want to store these separately)
      growthThisWeek: 0, // Implement if you track weekly growth
      growthThisMonth: 0, // Implement if you track monthly growth
    };
  },
});

// convex/controllers/social.ts
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

    const results = [];
    const now = Date.now();

    for (const followerId of args.followerIds) {
      try {
        const follower = await ctx.db.get(followerId);
        if (!follower) continue;

        // Remove from current user's followers
        const updatedFollowers = (currentUser.followers || []).filter(
          (id) => id !== followerId
        );

        // Remove from follower's followings
        const updatedFollowerFollowings = (follower.followings || []).filter(
          (id) => id !== currentUser._id
        );

        // Update both users
        await ctx.db.patch(currentUser._id, {
          followers: updatedFollowers,
          lastActive: now,
        });

        await ctx.db.patch(followerId, {
          followings: updatedFollowerFollowings,
          lastActive: now,
        });

        results.push({
          followerId,
          success: true,
          followerName: follower.firstname || follower.username,
        });
      } catch (error) {
        results.push({
          followerId,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      totalProcessed: args.followerIds.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  },
});
// convex/controllers/social.ts
export const searchFollowers = query({
  args: {
    userId: v.id("users"),
    query: v.string(),
    filters: v.optional(
      v.object({
        isMusician: v.optional(v.boolean()),
        isClient: v.optional(v.boolean()),
        tier: v.optional(v.union(v.literal("free"), v.literal("pro"))),
        hasMutual: v.optional(v.boolean()),
        isPrivate: v.optional(v.boolean()),
      })
    ),
    sortBy: v.optional(
      v.union(
        v.literal("recent"),
        v.literal("mutual"),
        v.literal("name"),
        v.literal("followers")
      )
    ),
  },
  handler: async (ctx, args): Promise<FollowerDetails[]> => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const followers = user.followers || [];
    const userFollowings = user.followings || [];
    const searchTerm = args.query.toLowerCase();

    let followersWithDetails: FollowerDetails[] = [];

    for (const followerId of followers) {
      const follower = await ctx.db.get(followerId as Id<"users">);

      if (!follower || !isUserDocument(follower)) continue;

      // Calculate mutual followers
      const mutualFollowers =
        follower.followers?.filter((fid) => userFollowings.includes(fid))
          .length || 0;

      const followerData: FollowerDetails = {
        _id: follower._id,
        clerkId: follower.clerkId,
        firstname: follower.firstname,
        lastname: follower.lastname,
        username: follower.username,
        picture: follower.picture,
        city: follower.city,
        instrument: follower.instrument,
        isMusician: follower.isMusician ?? false,
        isClient: follower.isClient ?? false,
        tier: follower.tier ?? "free",
        talentbio: follower.talentbio,
        followers: follower.followers?.length || 0,
        followings: follower.followings?.length || 0,
        mutualFollowers,
        lastActive: follower.lastActive,
        isPrivate: follower.isPrivate ?? false,
        roleType: follower.roleType,
        experience: follower.experience,
      };

      // Apply search filter
      const matchesSearch =
        searchTerm === "" ||
        followerData.firstname?.toLowerCase().includes(searchTerm) ||
        followerData.lastname?.toLowerCase().includes(searchTerm) ||
        followerData.username.toLowerCase().includes(searchTerm) ||
        followerData.city?.toLowerCase().includes(searchTerm) ||
        followerData.instrument?.toLowerCase().includes(searchTerm) ||
        followerData.talentbio?.toLowerCase().includes(searchTerm);

      // Apply additional filters
      const matchesFilters =
        (!args.filters?.isMusician || followerData.isMusician) &&
        (!args.filters?.isClient || followerData.isClient) &&
        (!args.filters?.tier || followerData.tier === args.filters.tier) &&
        (!args.filters?.hasMutual || (followerData.mutualFollowers || 0) > 0) &&
        (!args.filters?.isPrivate || followerData.isPrivate);

      if (matchesSearch && matchesFilters) {
        followersWithDetails.push(followerData);
      }
    }

    // Apply sorting
    switch (args.sortBy) {
      case "recent":
        followersWithDetails.sort(
          (a, b) => (b.lastActive || 0) - (a.lastActive || 0)
        );
        break;
      case "mutual":
        followersWithDetails.sort(
          (a, b) => (b.mutualFollowers || 0) - (a.mutualFollowers || 0)
        );
        break;
      case "name":
        followersWithDetails.sort((a, b) =>
          (a.firstname || a.username).localeCompare(b.firstname || b.username)
        );
        break;
      case "followers":
        followersWithDetails.sort((a, b) => b.followers - a.followers);
        break;
      default:
        // Default sort by recent
        followersWithDetails.sort(
          (a, b) => (b.lastActive || 0) - (a.lastActive || 0)
        );
    }

    return followersWithDetails;
  },
});
// convex/controllers/social.ts
export const exportFollowersData = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const followers = await ctx.db.query("users").collect();

    const userFollowers = followers.filter((follower) =>
      user.followers?.includes(follower._id)
    );

    // Format data for export (CSV compatible)
    const exportData = userFollowers.map((follower) => ({
      name: `${follower.firstname || ""} ${follower.lastname || ""}`.trim(),
      username: follower.username,
      email: follower.email,
      type: follower.isMusician
        ? "Musician"
        : follower.isClient
          ? "Client"
          : "User",
      tier: follower.tier,
      city: follower.city || "",
      instrument: follower.instrument || "",
      followers: follower.followers?.length || 0,
      following: follower.followings?.length || 0,
      bio: follower.talentbio || "",
      joined: new Date(follower._creationTime).toISOString().split("T")[0],
    }));

    return {
      total: exportData.length,
      exportedAt: new Date().toISOString(),
      data: exportData,
    };
  },
});
