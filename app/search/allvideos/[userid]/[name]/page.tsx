"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCheckTrial } from "@/hooks/useCheckTrial";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  ArrowLeft,
  Eye,
  Heart,
  Lock,
  MessageCircle,
  MoreVertical,
  Music2,
  Play,
  Share2,
  Upload,
} from "lucide-react";
import VideoUploadModal from "@/components/VideoUpload";

// ... imports

const AllVideosPage = () => {
  const { userid, name } = useParams();
  const router = useRouter();
  const { userId: currentUserId } = useAuth();
  const { colors, isDarkMode } = useThemeColors();
  const { isInGracePeriod } = useCheckTrial();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Id<"videos"> | null>(null);
  const [videoActions, setVideoActions] = useState<string | null>(null);
  const { user: currentUser } = useCurrentUser();
  // Fetch user videos using Convex
  const videos = useQuery(
    api.controllers.videos.getUserVideos,
    userid
      ? {
          userId: userid as string,
          currentUserId: currentUserId || undefined,
        }
      : "skip"
  );

  // Mutations
  const likeVideo = useMutation(api.controllers.videos.likeVideo);
  const unlikeVideo = useMutation(api.controllers.videos.unlikeVideo);
  const deleteVideo = useMutation(api.controllers.videos.deleteVideo);

  const isLoading = videos === undefined;
  const isOwnProfile = currentUserId === userid;

  // Memoized like handler
  const handleLike = useCallback(
    async (videoId: Id<"videos">) => {
      const isLiked = currentUser?.likedVideos?.includes(videoId) || false;
      if (!currentUserId) {
        toast.error("Please sign in to like videos");
        return;
      }

      try {
        const video = videos?.find((v) => v._id === videoId);

        if (isLiked) {
          await unlikeVideo({
            videoId,
            userId: currentUserId,
          });
          toast.success("Removed from liked videos");
        } else {
          await likeVideo({
            videoId,
            userId: currentUserId,
            isViewerInGracePeriod: isInGracePeriod,
          });
          toast.success("Added to liked videos");
        }
      } catch (error) {
        console.error("Error toggling like:", error);
        toast.error("Failed to update like");
      }
    },
    [currentUserId, videos, unlikeVideo, likeVideo, isInGracePeriod]
  );

  // Memoized delete handler
  const handleDelete = useCallback(
    async (videoId: Id<"videos">) => {
      if (!confirm("Are you sure you want to delete this video?")) return;

      try {
        await deleteVideo({ videoId });
        toast.success("Video deleted successfully");
        setVideoActions(null);
      } catch (error) {
        console.error("Error deleting video:", error);
        toast.error("Failed to delete video");
      }
    },
    [deleteVideo]
  );

  // Memoized share handler
  const handleShare = useCallback(async (videoId: Id<"videos">) => {
    const url = `${window.location.origin}/video/${videoId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this performance!",
          text: "I found this amazing performance you might like",
          url: url,
        });
      } catch (error) {
        await copyToClipboard(url);
      }
    } else {
      await copyToClipboard(url);
    }
  }, []);

  // Memoized copy to clipboard
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy link");
    }
  }, []);

  // Memoized video stats
  const videoStats = useMemo(() => {
    if (!videos) return null;

    const totalVideos = videos.length;
    const totalViews = videos.reduce(
      (sum, video) => sum + (video.views || 0),
      0
    );
    const totalLikes = videos.reduce(
      (sum, video) => sum + (video.likes || 0),
      0
    );
    const publicVideos = videos.filter((video) => video.isPublic).length;

    return { totalVideos, totalViews, totalLikes, publicVideos };
  }, [videos]);

  // Memoized format functions
  const formatCount = useCallback((count: number) => {
    if (count >= 1_000_000) return (count / 1_000_000).toFixed(1) + "M";
    if (count >= 1_000) return (count / 1_000).toFixed(1) + "K";
    return count.toString();
  }, []);

  const formatTimeAgo = useCallback((timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  }, []);

  if (isLoading) {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center",
          colors.background
        )}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className={cn("text-lg font-medium", colors.text)}>
            Loading videos...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen", colors.background)}>
      <VideoUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={() => {
          // Refresh your videos list or show success message
          console.log("Video uploaded successfully!");
        }}
      />

      {/* Enhanced Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "sticky top-0 z-50 border-b backdrop-blur-xl",
          colors.border,
          colors.background
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Back Button and Title */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.back()}
                className={cn(
                  "p-2 rounded-xl transition-all duration-200",
                  colors.hoverBg,
                  colors.text
                )}
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>

              <div>
                <h1 className={cn("text-2xl font-bold", colors.text)}>
                  {isOwnProfile ? "My Video Gallery" : `${name}'s Performances`}
                </h1>
                <p className={cn("text-sm", colors.textMuted)}>
                  {videoStats
                    ? `${videoStats.totalVideos} performances • ${formatCount(videoStats.totalViews)} views`
                    : "Loading..."}
                </p>
              </div>
            </div>

            {/* Stats and Actions */}
            <div className="flex items-center gap-6">
              {/* Quick Stats */}
              {videoStats && (
                <div className="hidden md:flex items-center gap-6">
                  <div className="text-center">
                    <p className={cn("text-lg font-bold", colors.text)}>
                      {formatCount(videoStats.totalViews)}
                    </p>
                    <p className={cn("text-xs", colors.textMuted)}>Views</p>
                  </div>
                  <div className="text-center">
                    <p className={cn("text-lg font-bold", colors.text)}>
                      {formatCount(videoStats.totalLikes)}
                    </p>
                    <p className={cn("text-xs", colors.textMuted)}>Likes</p>
                  </div>
                  {!isOwnProfile && (
                    <div className="text-center">
                      <p className={cn("text-lg font-bold", colors.text)}>
                        {videoStats.publicVideos}
                      </p>
                      <p className={cn("text-xs", colors.textMuted)}>Public</p>
                    </div>
                  )}
                </div>
              )}

              {/* Upload Button */}
              {isOwnProfile && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsUploadModalOpen(true)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl font-medium",
                    "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
                    "shadow-lg hover:shadow-amber-500/25 transition-all"
                  )}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {!videos || videos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="max-w-md mx-auto">
              <Music2
                className={cn("w-16 h-16 mx-auto mb-4", colors.textMuted)}
              />
              <h3 className={cn("text-xl font-semibold mb-2", colors.text)}>
                {isOwnProfile ? "No Performances Yet" : "No Videos Available"}
              </h3>
              <p className={cn("text-sm mb-6", colors.textMuted)}>
                {isOwnProfile
                  ? "Start sharing your musical journey by uploading your first performance."
                  : "This artist hasn't shared any performances yet."}
              </p>
              {isOwnProfile && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsUploadModalOpen(true)}
                  className={cn(
                    "px-6 py-3 rounded-xl font-medium",
                    "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
                    "shadow-lg hover:shadow-amber-500/25 transition-all"
                  )}
                >
                  Upload First Video
                </motion.button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {videos.map((video, index) => {
              const isLiked =
                currentUser?.likedVideos?.includes(video._id) || false;
              return (
                <motion.div
                  key={video._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className={cn(
                    "group rounded-2xl overflow-hidden transition-all duration-300",
                    "border shadow-sm hover:shadow-xl",
                    colors.card,
                    colors.border
                  )}
                >
                  {/* Video Thumbnail */}
                  <div className="relative aspect-[9/16] bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-12 h-12 text-gray-400" />
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

                    {/* Video Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                          <Eye className="w-3 h-3" />
                          <span className="text-xs font-medium">
                            {formatCount(video.views || 0)}
                          </span>
                        </div>
                        {!video.isPublic && (
                          <div className="flex items-center gap-1 bg-black/60 rounded-full px-2 py-1">
                            <Lock className="w-3 h-3" />
                            <span className="text-xs">Private</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                        onClick={() => router.push(`/video/${video._id}`)}
                      >
                        <Play className="w-6 h-6 text-gray-900 ml-1 fill-current" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Video Details */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3
                        className={cn(
                          "font-semibold text-sm line-clamp-2 flex-1",
                          colors.text
                        )}
                      >
                        {video.title}
                      </h3>

                      {/* Video Actions */}
                      {isOwnProfile && (
                        <div className="relative">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              setVideoActions(
                                videoActions === video._id ? null : video._id
                              )
                            }
                            className={cn(
                              "p-1 rounded-lg transition-colors",
                              colors.hoverBg,
                              colors.text
                            )}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </motion.button>

                          <AnimatePresence>
                            {videoActions === video._id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={cn(
                                  "absolute right-0 top-full mt-1 py-2 rounded-xl shadow-lg border z-10",
                                  colors.card,
                                  colors.border
                                )}
                              >
                                <button
                                  onClick={() =>
                                    handleDelete(video._id as Id<"videos">)
                                  }
                                  className={cn(
                                    "w-full px-4 py-2 text-left text-sm transition-colors",
                                    "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  )}
                                >
                                  Delete Video
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>

                    <p
                      className={cn(
                        "text-xs line-clamp-2 mb-3",
                        colors.textMuted
                      )}
                    >
                      {video.description}
                    </p>

                    {/* Video Stats */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLike(video._id as Id<"videos">)}
                          className={cn(
                            "flex items-center gap-1 transition-colors",
                            isLiked ? "text-red-500" : colors.text
                          )}
                        >
                          <Heart
                            className={cn("w-4 h-4", isLiked && "fill-current")}
                          />
                          <span>{formatCount(video.likes || 0)}</span>
                        </button>

                        <div
                          className={cn("flex items-center gap-1", colors.text)}
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{formatCount(video.commentCount || 0)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleShare(video._id as Id<"videos">)}
                        className={cn(
                          "p-1 rounded-lg transition-colors",
                          colors.hoverBg
                        )}
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Video Metadata */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className={cn("text-xs", colors.textMuted)}>
                        {formatTimeAgo(video.createdAt)}
                      </span>
                      {video.videoType && video.videoType !== "casual" && (
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-medium capitalize",
                            isDarkMode
                              ? "bg-amber-900/30 text-amber-300"
                              : "bg-amber-100 text-amber-700"
                          )}
                        >
                          {video.videoType}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Floating Upload Button for Mobile */}
      {isOwnProfile && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsUploadModalOpen(true)}
          className={cn(
            "fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-2xl",
            "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
            "flex items-center justify-center md:hidden"
          )}
        >
          <Upload className="w-6 h-6" />
        </motion.button>
      )}
    </div>
  );
};

export default AllVideosPage;
