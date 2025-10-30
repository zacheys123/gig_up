// convex/comments.ts
import { v } from "convex/values";
import { query } from "../_generated/server";
import { mutationGeneric } from "convex/server";
import { createNotificationInternal } from "../createNotificationInternal";

export const getVideoComments = query({
  args: {
    videoId: v.id("videos"),
    parentCommentId: v.optional(v.id("comments")), // For replies
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_videoId", (q) => q.eq("videoId", args.videoId))
      .filter((q) =>
        args.parentCommentId
          ? q.eq(q.field("parentCommentId"), args.parentCommentId)
          : q.eq(q.field("parentCommentId"), undefined)
      )
      .order("desc")
      .collect();

    // Get user data for each comment
    const commentsWithUsers = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", comment.userId))
          .first();

        return {
          ...comment,
          user: user
            ? {
                _id: user._id,
                clerkId: user.clerkId,
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                picture: user.picture,
                tier: user.tier,
                isMusician: user.isMusician,
                isClient: user.isClient,
                instrument: user.instrument,
                city: user.city,
              }
            : null,
        };
      })
    );

    return commentsWithUsers;
  },
});

export const addComment = mutationGeneric({
  args: {
    userId: v.string(),
    videoId: v.id("videos"),
    content: v.string(),
    parentCommentId: v.optional(v.id("comments")),
    isViewerInGracePeriod: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!args.userId) throw new Error("Unauthorized");
    if (!args.content.trim()) throw new Error("Comment cannot be empty");

    const [currentUser, video] = await Promise.all([
      ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
        .first(),
      ctx.db.get(args.videoId),
    ]);

    if (!currentUser) throw new Error("User not found");
    if (!video) throw new Error("Video not found");

    // Create the comment
    const commentId = await ctx.db.insert("comments", {
      userId: args.userId,
      videoId: args.videoId,
      content: args.content.trim(),
      parentCommentId: args.parentCommentId,
      likes: 0,
      createdAt: Date.now(),
    });

    // Get video owner for notification
    const videoOwner = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", video.userId))
      .first();

    // Create notification (only if not commenting on own video)
    if (videoOwner && currentUser._id !== videoOwner._id) {
      try {
        await createNotificationInternal(ctx, {
          userDocumentId: videoOwner._id,
          type: "video_comment",
          title: "New Comment",
          message: `${currentUser.firstname || currentUser.username} commented on your video "${video.title}"`,
          image: currentUser.picture,
          actionUrl: `/video/${args.videoId}?comment=true`,
          relatedUserDocumentId: currentUser._id,
          isViewerInGracePeriod: args.isViewerInGracePeriod,
          metadata: {
            commenterDocumentId: currentUser._id.toString(),
            commenterClerkId: currentUser.clerkId,
            commenterName: currentUser.firstname,
            commenterUsername: currentUser.username,
            commenterPicture: currentUser.picture,
            isCommenterPro: currentUser.tier === "pro",
            isCommenterMusician: currentUser.isMusician,
            isCommenterClient: currentUser.isClient,
            instrument: currentUser.instrument,
            city: currentUser.city,
            videoId: args.videoId.toString(),
            videoTitle: video.title,
            videoThumbnail: video.thumbnail,
            commentId: commentId.toString(),
            commentContent: args.content.trim(),
          },
        });
      } catch (notificationError) {
        console.error(
          "Failed to create comment notification:",
          notificationError
        );
      }
    }

    return { success: true, commentId };
  },
});

export const deleteComment = mutationGeneric({
  args: {
    commentId: v.id("comments"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");

    // Check if user owns the comment
    if (comment.userId !== args.userId) {
      throw new Error("Unauthorized to delete this comment");
    }

    await ctx.db.delete(args.commentId);
    return { success: true };
  },
});
