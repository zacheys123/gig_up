import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import {
  cleanupLikeNotification,
  cleanupVideoNotifications,
  createNotificationInternal,
} from "../createNotificationInternal";

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
    await cleanupVideoNotifications(ctx, video._id);

    return { success: true };
  },
});

export const likeVideo = mutationGeneric({
  args: {
    userId: v.string(),
    videoId: v.id("videos"),
    isViewerInGracePeriod: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!args.userId) throw new Error("Unauthorized");

    const [currentUser, video] = await Promise.all([
      ctx.db
        .query("users")
        .withIndex("by_clerkId", (q: any) => q.eq("clerkId", args.userId))
        .first(),
      ctx.db.get(args.videoId),
    ]);

    if (!currentUser) throw new Error("User not found");
    if (!video) throw new Error("Video not found");

    const videoOwner = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", video.userId))
      .first();

    if (!videoOwner) throw new Error("Video owner not found");

    // Check if already liked using likedVideos array
    const hasLiked = currentUser.likedVideos?.includes(args.videoId) || false;

    if (hasLiked) {
      // Unlike: Remove from likedVideos array
      const updatedLikedVideos =
        currentUser.likedVideos?.filter(
          (id: Id<"videos">) => id !== args.videoId
        ) || [];

      await ctx.db.patch(currentUser._id, {
        likedVideos: updatedLikedVideos,
      });

      // Update video likes count
      await ctx.db.patch(args.videoId, {
        likes: Math.max(0, (video.likes || 0) - 1),
      });

      // Cleanup like notification
      try {
        await cleanupLikeNotification(
          ctx,
          videoOwner._id,
          currentUser._id,
          args.videoId
        );
      } catch (cleanupError) {
        console.error("Failed to cleanup like notification:", cleanupError);
      }

      return { success: true, action: "unliked" };
    } else {
      // Like: Add to likedVideos array
      const updatedLikedVideos = [
        ...(currentUser.likedVideos || []),
        args.videoId,
      ];

      await ctx.db.patch(currentUser._id, {
        likedVideos: updatedLikedVideos,
      });

      // Update video likes count
      await ctx.db.patch(args.videoId, {
        likes: (video.likes || 0) + 1,
      });

      // Create like notification (only if not liking own video)
      if (currentUser._id !== videoOwner._id) {
        try {
          await createNotificationInternal(ctx, {
            userDocumentId: videoOwner._id,
            type: "like",
            title: "New Like",
            message: `${currentUser.firstname || currentUser.username} liked your video "${video.title}"`,
            image: currentUser.picture,
            actionUrl: `/video/${args.videoId}?liked=true`,
            relatedUserDocumentId: currentUser._id,
            isViewerInGracePeriod: args.isViewerInGracePeriod,
            metadata: {
              likerDocumentId: currentUser._id.toString(),
              likerClerkId: currentUser.clerkId,
              likerName: currentUser.firstname,
              likerUsername: currentUser.username,
              likerPicture: currentUser.picture,
              isLikerPro: currentUser.tier === "pro",
              isLikerMusician: currentUser.isMusician,
              isLikerClient: currentUser.isClient,
              instrument: currentUser.instrument,
              city: currentUser.city,
              videoId: args.videoId.toString(),
              videoTitle: video.title,
              videoThumbnail: video.thumbnail,
              videoType: video.videoType,
              isProfileVideo: video.isProfileVideo,
            },
          });
        } catch (notificationError) {
          console.error(
            "Failed to create like notification:",
            notificationError
          );
        }
      }

      return { success: true, action: "liked" };
    }
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
// Remove currentUserId from incrementVideoViews
export const incrementVideoViews = mutationGeneric({
  args: {
    videoId: v.string(),
  },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId as Id<"videos">);

    if (!video) {
      throw new Error("Video not found");
    }

    // For logged-in users, track in user document with proper duplicate prevention
    // This now uses the clerkId from the video context
    if (video.userId) {
      const currentUser = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q: any) => q.eq("clerkId", video.userId))
        .first();

      if (currentUser) {
        const viewedVideos = currentUser.viewedVideos || [];
        const viewedSet = new Set(viewedVideos);

        if (!viewedSet.has(args.videoId)) {
          await ctx.db.patch(currentUser._id, {
            viewedVideos: [...viewedVideos, args.videoId],
          });
        }
      }
    }

    // Increment video views
    await ctx.db.patch(video._id, {
      views: (video.views || 0) + 1,
    });

    return { success: true, action: "view_count_incremented" };
  },
});

// Update getUserProfileVideos to use clerkId only
export const getUserProfileVideos = queryGeneric({
  args: {
    userId: v.string(), // This is clerkId
  },
  handler: async (ctx, args): Promise<VideoDocument[]> => {
    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", args.userId))
      .first();

    if (!targetUser) {
      throw new Error("User not found");
    }

    // Get current user from context if available
    // This would need to be passed differently in your implementation
    // For now, we'll assume public access unless you implement proper auth context

    const profileVideos = await ctx.db
      .query("videos")
      .withIndex("by_userId_and_profile", (q: any) =>
        q.eq("userId", args.userId).eq("isProfileVideo", true)
      )
      .collect();

    // Filter based on privacy settings
    // You might want to implement proper following logic here
    const filteredVideos = profileVideos.filter((video: VideoDocument) => {
      return video.isPublic; // Simplified for now
    });

    // Get comment counts for each video
    const videosWithCommentCounts = await Promise.all(
      filteredVideos.map(async (video) => {
        const comments = await ctx.db
          .query("comments")
          .withIndex("by_videoId", (q) => q.eq("videoId", video._id))
          .collect();

        return {
          ...video,
          commentCount: comments.length,
        };
      })
    );

    return videosWithCommentCounts;
  },
});

// convex/videos.ts - Update getPublicVideos
export const getPublicVideos = queryGeneric({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
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
    currentUserId: v.optional(v.string()), // Add current user's clerkId
  },
  handler: async (
    ctx,
    args
  ): Promise<(VideoDocument & { user?: any; canSeeVideo?: boolean })[]> => {
    console.log("🎬 Convex Query Called:", {
      limit: args.limit,
      offset: args.offset,
      videoType: args.videoType,
      currentUserId: args.currentUserId,
    });

    // Get ALL public videos first
    const allPublicVideos = await ctx.db.query("videos").collect();
    console.log("📊 Total videos in DB:", allPublicVideos.length);

    // Get current user if provided
    let currentUser = null;
    if (args.currentUserId) {
      currentUser = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", args.currentUserId!))
        .first();
    }

    let filteredVideos = allPublicVideos;

    // Filter by video type if specified
    if (args.videoType && args.videoType !== "all") {
      filteredVideos = allPublicVideos.filter(
        (video: VideoDocument) => video.videoType === args.videoType
      );
    }

    console.log("🎯 After filtering:", filteredVideos.length, "videos");

    // Sort by creation date (newest first)
    const sortedVideos = filteredVideos.sort(
      (a: VideoDocument, b: VideoDocument) => b.createdAt - a.createdAt
    );

    // Apply pagination
    const start = args.offset || 0;
    const end = args.limit ? start + args.limit : sortedVideos.length;
    const paginatedVideos = sortedVideos.slice(start, end);

    console.log("📄 Pagination result:", {
      start,
      end,
      returned: paginatedVideos.length,
    });

    // Fetch user data and check visibility for paginated videos
    const videosWithUsers = await Promise.all(
      paginatedVideos.map(async (video) => {
        try {
          const videoOwner = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", video.userId))
            .first();

          // Check if current user can see this video
          const canSeeVideo = await checkVideoVisibility(
            ctx,
            video,
            videoOwner,
            currentUser
          );

          return {
            ...video,
            user: videoOwner
              ? {
                  _id: videoOwner._id,
                  clerkId: videoOwner.clerkId,
                  username: videoOwner.username,
                  firstname: videoOwner.firstname,
                  lastname: videoOwner.lastname,
                  picture: videoOwner.picture,
                  instrument: videoOwner.instrument,
                  city: videoOwner.city,
                }
              : null,
            canSeeVideo,
          };
        } catch (error) {
          console.error(`Error fetching user for video ${video._id}:`, error);
          return {
            ...video,
            user: null,
            canSeeVideo: false, // Default to false if there's an error
          };
        }
      })
    );

    console.log("✅ Final videos returned:", videosWithUsers.length);
    return videosWithUsers;
  },
});

// Add this helper function to check video visibility
async function checkVideoVisibility(
  ctx: any,
  video: VideoDocument,
  videoOwner: any,
  currentUser: any
): Promise<boolean> {
  // If video is public, anyone can see it
  if (video.isPublic) {
    return true;
  }

  // If no current user, can't see private videos
  if (!currentUser) {
    return false;
  }

  // User can always see their own videos
  if (currentUser.clerkId === video.userId) {
    return true;
  }

  // Check if current user follows the video owner
  if (videoOwner) {
    const isFollowing = await checkIfFollowing(
      ctx,
      currentUser._id,
      videoOwner._id
    );
    return isFollowing;
  }

  return false;
}

// Helper function to check follow status
// convex/videos.ts - Updated checkIfFollowing function
async function checkIfFollowing(
  ctx: any,
  currentUserId: Id<"users">,
  targetUserId: Id<"users">
): Promise<boolean> {
  try {
    // Get both users
    const [currentUser, targetUser] = await Promise.all([
      ctx.db.get(currentUserId),
      ctx.db.get(targetUserId),
    ]);

    if (!currentUser || !targetUser) {
      console.log("One or both users not found");
      return false;
    }

    // Check if current user follows target user
    // currentUser.following contains clerkIds of people the user follows
    const isFollowing =
      currentUser.followings?.includes(targetUser.clerkId) || false;

    console.log("🔍 Follow check:", {
      currentUser: currentUser.username,
      targetUser: targetUser.username,
      currentUserFollowing: currentUser.followings,
      isFollowing,
    });

    return isFollowing;
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
}

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
