// app/video/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Heart,
  Eye,
  Calendar,
  User,
  Globe,
  Users,
  Tag,
  Play,
  Share2,
  Download,
  ThumbsUp,
  MessageCircle,
  Send,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import GigLoader from "@/components/(main)/GigLoader";
import { useCheckTrial } from "@/hooks/useCheckTrial";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useVideoSocial } from "@/hooks/useVideoSocial";

export default function VideoDetailPage() {
  const { id } = useParams();
  const { userId: clerkId } = useAuth();
  const router = useRouter();
  const { colors, isDarkMode } = useThemeColors();
  const { user } = useCurrentUser();
  const [hasViewed, setHasViewed] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const { isInGracePeriod } = useCheckTrial();
  const [isTrackingView, setIsTrackingView] = useState(false);

  // Comment state
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Get video data
  const video = useQuery(
    api.controllers.videos.getVideoById,
    id ? { videoId: id as string } : "skip",
  );

  // Get comments
  const comments = useQuery(
    api.controllers.comments.getVideoComments,
    id ? { videoId: id as Id<"videos"> } : "skip",
  );

  // Get current user data for like status
  const currentUser = useQuery(
    api.controllers.user.getUserByClerkId,
    clerkId ? { clerkId } : "skip",
  );

  // Mutations
  const incrementViews = useMutation(
    api.controllers.videos.incrementVideoViews,
  );
  const likeVideo = useMutation(api.controllers.videos.likeVideo);
  const unlikeVideo = useMutation(api.controllers.videos.unlikeVideo);
  const addComment = useMutation(api.controllers.comments.addComment);
  const deleteComment = useMutation(api.controllers.comments.deleteComment);

  // Check if current user has liked this video
  const hasLiked = currentUser?.likedVideos?.includes(id as string) || false;

  // Increment views on page load (only once)
  useEffect(() => {
    if (video && !hasViewed && !isTrackingView && clerkId !== video.userId) {
      setIsTrackingView(true);
      incrementViews({
        videoId: id as string,
      })
        .then(() => {
          setHasViewed(true);
        })
        .catch((error) => {
          console.error("Failed to track view:", error);
        })
        .finally(() => {
          setIsTrackingView(false);
        });
    }
  }, [video, hasViewed, isTrackingView, id, incrementViews, clerkId]);

  // Handle like/unlike
  const handleLikeToggle = async () => {
    if (!clerkId || !video || !id) return;

    setIsLiking(true);
    try {
      if (hasLiked) {
        await unlikeVideo({ videoId: id as string, userId: clerkId });
        toast.success("Removed from liked videos");
      } else {
        await likeVideo({
          videoId: id as Id<"videos">,
          userId: clerkId,
          isViewerInGracePeriod: isInGracePeriod,
        });
        toast.success("Added to liked videos");
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like");
    } finally {
      setIsLiking(false);
    }
  };

  // Handle add comment
  const handleAddComment = async () => {
    if (!clerkId || !commentText.trim() || !id) return;

    setIsSubmittingComment(true);
    try {
      await addComment({
        userId: clerkId,
        videoId: id as Id<"videos">,
        content: commentText,
        isViewerInGracePeriod: isInGracePeriod,
      });
      setCommentText("");
      toast.success("Comment added");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId: Id<"comments">) => {
    if (!clerkId) return;

    try {
      await deleteComment({
        commentId,
        userId: clerkId,
      });
      toast.success("Comment deleted");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  // Get video owner data
  const videoOwner = useQuery(
    api.controllers.user.getUserByClerkId,
    video?.userId ? { clerkId: video.userId } : "skip",
  );

  // Show loading state while video is loading
  if (video === undefined) {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center",
          colors.background,
        )}
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <GigLoader title="Loading Video..." color="border-green-300" />
        </div>
      </div>
    );
  }

  // Show not found state if video is null
  if (video === null || !id) {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center",
          colors.background,
        )}
      >
        <div className="text-center">
          <p className={cn("text-xl font-semibold mb-4", colors.text)}>
            Video not found
          </p>
          <Button
            onClick={() => router.push("/")}
            className="bg-amber-500 hover:bg-amber-600"
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen", colors.background)}>
      {/* Header */}
      <div className={cn("border-b", colors.border)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <div className="flex items-center gap-4">
              <Badge
                variant={video.isPublic ? "default" : "secondary"}
                className={cn(
                  video.isPublic
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-blue-500 hover:bg-blue-600",
                )}
              >
                {video.isPublic ? (
                  <>
                    <Globe className="w-3 h-3 mr-1" />
                    Public
                  </>
                ) : (
                  <>
                    <Users className="w-3 h-3 mr-1" />
                    Followers Only
                  </>
                )}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player & Info - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "rounded-2xl overflow-hidden border",
                colors.border,
              )}
            >
              <div className="aspect-video bg-black relative">
                <video
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                  poster={video.thumbnail}
                >
                  <source src={video.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Play overlay for thumbnail */}
                {video.thumbnail && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Video Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={cn(
                "rounded-2xl p-6 border",
                colors.card,
                colors.border,
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <h1
                  className={cn("text-xl lg:text-3xl font-bold", colors.text)}
                >
                  {video.title}
                </h1>

                {/* Like Button */}
                <Button
                  variant={hasLiked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLikeToggle}
                  disabled={isLiking || !clerkId}
                  className={cn(
                    "flex items-center gap-2",
                    hasLiked
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : colors.border,
                  )}
                >
                  <Heart
                    className={cn("w-4 h-4", hasLiked ? "fill-current" : "")}
                  />
                  {video.likes || 0}
                </Button>
              </div>

              {video.description && (
                <p className={cn("text-lg mb-6 leading-relaxed", colors.text)}>
                  {video.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className={cn("text-sm font-medium", colors.text)}>
                    {video.views || 0} views
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-gray-500" />
                  <span className={cn("text-sm font-medium", colors.text)}>
                    {video.likes || 0} likes
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-gray-500" />
                  <span className={cn("text-sm font-medium", colors.text)}>
                    {comments?.length || 0} comments
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className={cn("text-sm font-medium", colors.text)}>
                    {new Date(video.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Tags */}
              {video.tags && video.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {video.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Comments Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={cn(
                "rounded-2xl p-6 border",
                colors.card,
                colors.border,
              )}
            >
              <h2 className={cn("text-xl font-semibold mb-6", colors.text)}>
                Comments ({comments?.length || 0})
              </h2>

              {/* Add Comment Form */}
              {clerkId && (
                <div className="mb-6">
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={currentUser?.picture} />
                      <AvatarFallback>
                        {currentUser?.firstname?.[0] ||
                          currentUser?.username?.[0] ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <Textarea
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className={cn(
                          "resize-none",
                          colors.background,
                          colors.text,
                        )}
                        rows={3}
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={handleAddComment}
                          disabled={!commentText.trim() || isSubmittingComment}
                          className="flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          {isSubmittingComment ? "Posting..." : "Post Comment"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {comments && comments.length > 0 ? (
                  comments.map((comment) => (
                    <div
                      key={comment._id}
                      className={cn("p-4 rounded-lg border", colors.border)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={comment.user?.picture} />
                            <AvatarFallback>
                              {comment.user?.firstname?.[0] ||
                                comment.user?.username?.[0] ||
                                "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className={cn("font-semibold", colors.text)}>
                              {comment.user?.firstname} {comment.user?.lastname}
                            </p>
                            <p className={cn("text-sm", colors.textMuted)}>
                              @{comment.user?.username}
                            </p>
                          </div>
                        </div>
                        {comment.userId === clerkId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <p className={cn("mt-2", colors.text)}>
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <p className={cn("text-xs", colors.textMuted)}>
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className={cn("text-lg font-medium", colors.text)}>
                      No comments yet
                    </p>
                    <p className={cn("text-sm", colors.textMuted)}>
                      Be the first to comment on this video
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Video Owner Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={cn(
                "rounded-2xl p-6 border",
                colors.card,
                colors.border,
              )}
            >
              <h2 className={cn("text-lg font-semibold mb-4", colors.text)}>
                Uploaded By
              </h2>

              {videoOwner ? (
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={videoOwner.picture} />
                    <AvatarFallback>
                      {videoOwner.firstname?.[0] ||
                        videoOwner.username?.[0] ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className={cn("font-semibold", colors.text)}>
                      {videoOwner.firstname} {videoOwner.lastname}
                    </p>
                    <p className={cn("text-sm", colors.textMuted)}>
                      @{videoOwner.username}
                    </p>
                    {videoOwner.city && (
                      <p className={cn("text-xs", colors.textMuted)}>
                        {videoOwner.city}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className={cn("text-sm", colors.textMuted)}>
                  Loading user info...
                </p>
              )}
            </motion.div>

            {/* Video Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className={cn(
                "rounded-2xl p-6 border",
                colors.card,
                colors.border,
              )}
            >
              <h2 className={cn("text-lg font-semibold mb-4", colors.text)}>
                Video Details
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={cn("text-sm", colors.textMuted)}>Type</span>
                  <Badge variant="outline" className="capitalize">
                    {video.videoType}
                  </Badge>
                </div>

                <div className="flex justify-between">
                  <span className={cn("text-sm", colors.textMuted)}>
                    Duration
                  </span>
                  <span className={cn("text-sm font-medium", colors.text)}>
                    {video.duration
                      ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, "0")}`
                      : "N/A"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className={cn("text-sm", colors.textMuted)}>
                    Uploaded
                  </span>
                  <span className={cn("text-sm font-medium", colors.text)}>
                    {new Date(video.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {video.gigName && (
                  <div className="flex justify-between">
                    <span className={cn("text-sm", colors.textMuted)}>Gig</span>
                    <span className={cn("text-sm font-medium", colors.text)}>
                      {video.gigName}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className={cn(
                "rounded-2xl p-6 border",
                colors.card,
                colors.border,
              )}
            >
              <h2 className={cn("text-lg font-semibold mb-4", colors.text)}>
                Actions
              </h2>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={handleLikeToggle}
                  disabled={isLiking || !clerkId}
                >
                  <Heart
                    className={cn(
                      "w-4 h-4",
                      hasLiked ? "fill-current text-red-500" : "",
                    )}
                  />
                  {hasLiked ? "Liked" : "Like Video"}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied to clipboard");
                  }}
                >
                  <Share2 className="w-4 h-4" />
                  Share Video
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = video.url;
                    link.download = video.title || "video";
                    link.click();
                  }}
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
