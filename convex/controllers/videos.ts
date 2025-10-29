import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

// Define types for better TypeScript support
interface VideoDocument {
  _id: string;
  userId: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  duration: number;
  isPublic: boolean;
  videoType: "profile" | "gig" | "casual" | "promo" | "other";
  isProfileVideo: boolean;
  gigId?: string;
  gigName?: string;
  tags: string[];
  views: number;
  likes: number;
  createdAt: number;
  updatedAt: number;
}

export const getVideos = queryGeneric({
  args: {
    userId: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    videoType: v.optional(
      v.union(
        v.literal("profile"),
        v.literal("gig"),
        v.literal("casual"),
        v.literal("promo"),
        v.literal("other"),
        v.literal("all")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<VideoDocument[]> => {
    let videos: VideoDocument[];

    if (args.userId) {
      videos = await ctx.db
        .query("videos")
        .withIndex("by_userId", (q: any) => q.eq("userId", args.userId!))
        .collect();
    } else if (args.isPublic !== undefined) {
      videos = await ctx.db
        .query("videos")
        .withIndex("by_isPublic", (q: any) => q.eq("isPublic", args.isPublic))
        .collect();
    } else if (args.videoType && args.videoType !== "all") {
      const videoType = args.videoType as
        | "profile"
        | "gig"
        | "casual"
        | "promo"
        | "other";
      videos = await ctx.db
        .query("videos")
        .withIndex("by_videoType", (q: any) => q.eq("videoType", videoType))
        .collect();
    } else {
      videos = await ctx.db.query("videos").collect();
    }

    let filteredVideos = videos;

    if (args.isPublic !== undefined && args.userId) {
      filteredVideos = filteredVideos.filter(
        (video: VideoDocument) => video.isPublic === args.isPublic
      );
    }

    if (
      args.videoType &&
      args.videoType !== "all" &&
      !(args.videoType && !args.userId && args.isPublic === undefined)
    ) {
      filteredVideos = filteredVideos.filter(
        (video: VideoDocument) => video.videoType === args.videoType
      );
    }

    if (args.limit) {
      return filteredVideos.slice(0, args.limit);
    }

    return filteredVideos;
  },
});

export const getVideoById = queryGeneric({
  args: {
    videoId: v.string(),
  },
  handler: async (ctx, args): Promise<VideoDocument | null> => {
    const video = await ctx.db
      .query("videos")
      .filter((q: any) => q.eq(q.field("_id"), args.videoId))
      .first();

    return video;
  },
});

export const createVideo = mutationGeneric({
  args: {
    userId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    url: v.string(),
    thumbnail: v.optional(v.string()),
    duration: v.optional(v.number()),
    isPublic: v.boolean(),
    videoType: v.union(
      v.literal("profile"),
      v.literal("gig"),
      v.literal("casual"),
      v.literal("promo"),
      v.literal("other")
    ),
    gigId: v.optional(v.string()),
    gigName: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const isProfileVideo = args.videoType === "profile";

    const videoData = {
      userId: args.userId,
      title: args.title,
      description: args.description || "",
      url: args.url,
      thumbnail: args.thumbnail || "",
      duration: args.duration || 0,
      isPublic: args.isPublic,
      videoType: args.videoType,
      isProfileVideo: isProfileVideo,
      gigId: args.gigId,
      gigName: args.gigName,
      tags: args.tags || [],
      views: 0,
      likes: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const videoId = await ctx.db.insert("videos", videoData);

    await ctx.db.patch(user._id, {
      lastActive: Date.now(),
    });

    return videoId;
  },
});

export const updateVideo = mutationGeneric({
  args: {
    videoId: v.string(),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      thumbnail: v.optional(v.string()),
      isPublic: v.optional(v.boolean()),
      videoType: v.optional(
        v.union(
          v.literal("profile"),
          v.literal("gig"),
          v.literal("casual"),
          v.literal("promo"),
          v.literal("other")
        )
      ),
      gigId: v.optional(v.string()),
      gigName: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    const video = await ctx.db
      .query("videos")
      .filter((q: any) => q.eq(q.field("_id"), args.videoId))
      .first();

    if (!video) {
      throw new Error("Video not found");
    }

    const updateData: any = { ...args.updates };
    if (args.updates.videoType !== undefined) {
      updateData.isProfileVideo = args.updates.videoType === "profile";
    }

    await ctx.db.patch(video._id, {
      ...updateData,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const deleteVideo = mutationGeneric({
  args: {
    videoId: v.string(),
  },
  handler: async (ctx, args) => {
    const video = await ctx.db
      .query("videos")
      .filter((q: any) => q.eq(q.field("_id"), args.videoId))
      .first();

    if (!video) {
      throw new Error("Video not found");
    }

    await ctx.db.delete(video._id);

    const allUsers = await ctx.db.query("users").collect();
    const usersWithLikedVideo = allUsers.filter((user: any) =>
      user.likedVideos?.includes(args.videoId)
    );

    for (const user of usersWithLikedVideo) {
      const updatedLikedVideos = (user.likedVideos || []).filter(
        (id: string) => id !== args.videoId
      );
      await ctx.db.patch(user._id, {
        likedVideos: updatedLikedVideos,
      });
    }

    return { success: true };
  },
});

export const incrementVideoViews = mutationGeneric({
  args: {
    videoId: v.string(),
  },
  handler: async (ctx, args) => {
    const video = await ctx.db
      .query("videos")
      .filter((q: any) => q.eq(q.field("_id"), args.videoId))
      .first();

    if (!video) {
      throw new Error("Video not found");
    }

    await ctx.db.patch(video._id, {
      views: (video.views || 0) + 1,
    });

    return { success: true };
  },
});

export const likeVideo = mutationGeneric({
  args: {
    videoId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const [video, user] = await Promise.all([
      ctx.db
        .query("videos")
        .filter((q: any) => q.eq(q.field("_id"), args.videoId))
        .first(),
      ctx.db
        .query("users")
        .withIndex("by_clerkId", (q: any) => q.eq("clerkId", args.userId))
        .first(),
    ]);

    if (!video || !user) {
      throw new Error("Video or user not found");
    }

    const userLikedVideos = user.likedVideos || [];
    if (userLikedVideos.includes(args.videoId)) {
      throw new Error("Video already liked");
    }

    await ctx.db.patch(video._id, {
      likes: (video.likes || 0) + 1,
    });

    await ctx.db.patch(user._id, {
      likedVideos: [...userLikedVideos, args.videoId],
      lastActive: Date.now(),
    });

    return { success: true };
  },
});

export const unlikeVideo = mutationGeneric({
  args: {
    videoId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const [video, user] = await Promise.all([
      ctx.db
        .query("videos")
        .filter((q: any) => q.eq(q.field("_id"), args.videoId))
        .first(),
      ctx.db
        .query("users")
        .withIndex("by_clerkId", (q: any) => q.eq("clerkId", args.userId))
        .first(),
    ]);

    if (!video || !user) {
      throw new Error("Video or user not found");
    }

    const userLikedVideos = user.likedVideos || [];
    if (!userLikedVideos.includes(args.videoId)) {
      throw new Error("Video not liked");
    }

    await ctx.db.patch(video._id, {
      likes: Math.max(0, (video.likes || 0) - 1),
    });

    await ctx.db.patch(user._id, {
      likedVideos: userLikedVideos.filter((id: string) => id !== args.videoId),
      lastActive: Date.now(),
    });

    return { success: true };
  },
});

export const getUserProfileVideos = queryGeneric({
  args: {
    userId: v.string(),
    currentUserId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<VideoDocument[]> => {
    const [targetUser, currentUser] = await Promise.all([
      ctx.db
        .query("users")
        .withIndex("by_clerkId", (q: any) => q.eq("clerkId", args.userId))
        .first(),
      args.currentUserId
        ? ctx.db
            .query("users")
            .withIndex("by_clerkId", (q: any) =>
              q.eq("clerkId", args.currentUserId)
            )
            .first()
        : null,
    ]);

    if (!targetUser) {
      throw new Error("User not found");
    }

    const profileVideos = await ctx.db
      .query("videos")
      .withIndex("by_userId_and_profile", (q: any) =>
        q.eq("userId", args.userId).eq("isProfileVideo", true)
      )
      .collect();

    const isFollowing = currentUser
      ? targetUser.followers?.includes(currentUser.clerkId) || false
      : false;

    return profileVideos.filter((video: VideoDocument) => {
      if (video.isPublic) return true;
      if (!video.isPublic && isFollowing) return true;
      return false;
    });
  },
});

export const getPublicVideos = queryGeneric({
  args: {
    limit: v.optional(v.number()),
    videoType: v.optional(
      v.union(
        v.literal("profile"),
        v.literal("gig"),
        v.literal("casual"),
        v.literal("promo"),
        v.literal("other"),
        v.literal("all")
      )
    ),
  },
  handler: async (ctx, args): Promise<VideoDocument[]> => {
    const publicVideos = await ctx.db
      .query("videos")
      .withIndex("by_isPublic", (q: any) => q.eq("isPublic", true))
      .collect();

    let filteredVideos = publicVideos;
    if (args.videoType && args.videoType !== "all") {
      filteredVideos = publicVideos.filter(
        (video: VideoDocument) => video.videoType === args.videoType
      );
    }

    const sortedVideos = filteredVideos.sort(
      (a: VideoDocument, b: VideoDocument) => b.createdAt - a.createdAt
    );

    if (args.limit) {
      return sortedVideos.slice(0, args.limit);
    }

    return sortedVideos;
  },
});

export const getTrendingVideos = queryGeneric({
  args: {
    limit: v.optional(v.number()),
    timeframe: v.optional(
      v.union(
        v.literal("day"),
        v.literal("week"),
        v.literal("month"),
        v.literal("all")
      )
    ),
  },
  handler: async (ctx, args): Promise<VideoDocument[]> => {
    const videos = await ctx.db
      .query("videos")
      .withIndex("by_isPublic", (q: any) => q.eq("isPublic", true))
      .collect();

    let timeFilteredVideos = videos;
    if (args.timeframe && args.timeframe !== "all") {
      const now = Date.now();
      let timeAgo = now;

      switch (args.timeframe) {
        case "day":
          timeAgo = now - 24 * 60 * 60 * 1000;
          break;
        case "week":
          timeAgo = now - 7 * 24 * 60 * 60 * 1000;
          break;
        case "month":
          timeAgo = now - 30 * 24 * 60 * 60 * 1000;
          break;
      }

      timeFilteredVideos = videos.filter(
        (video: VideoDocument) => video.createdAt >= timeAgo
      );
    }

    const sortedVideos = timeFilteredVideos.sort(
      (a: VideoDocument, b: VideoDocument) => {
        const aEngagement = (a.views || 0) + (a.likes || 0);
        const bEngagement = (b.views || 0) + (b.likes || 0);

        if (bEngagement !== aEngagement) {
          return bEngagement - aEngagement;
        }

        return b.createdAt - a.createdAt;
      }
    );

    if (args.limit) {
      return sortedVideos.slice(0, args.limit);
    }

    return sortedVideos;
  },
});
