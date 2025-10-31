// components/community/VideoCard.tsx
import React, { useState, useCallback } from "react";
import { Id } from "@/convex/_generated/dataModel";

import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useVideoComments } from "@/hooks/useVideoComments.ts";
import { VideoComments } from "./VideoComment";

interface VideoCardProps {
  video: any;
  currentUserId?: Id<"users">;
  onLike: (videoId: Id<"videos">) => void;
  onUnlike: (videoId: Id<"videos">) => void;
  onView: (videoId: Id<"videos">) => void;
  onSelect?: (videoId: Id<"videos">) => void;
  isSelected?: boolean;
  isLoading?: boolean;
  variant?: "default" | "trending";
}

export const VideoCard: React.FC<VideoCardProps> = React.memo(
  ({
    video,
    currentUserId,
    onLike,
    onUnlike,
    onView,
    onSelect,
    isSelected = false,
    isLoading = false,
    variant = "default",
  }) => {
    const [showComments, setShowComments] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const { colors } = useThemeColors();

    const { comments, addComment, deleteComment, totalComments } =
      useVideoComments(showComments ? video._id : undefined, currentUserId);

    const handleLike = useCallback(() => {
      if (isLiked) {
        onUnlike(video._id);
        setIsLiked(false);
      } else {
        onLike(video._id);
        setIsLiked(true);
      }
    }, [video._id, isLiked, onLike, onUnlike]);

    const handleView = useCallback(() => {
      onView(video._id);
      if (onSelect) {
        onSelect(video._id);
      }
    }, [video._id, onView, onSelect]);

    const handleCommentSubmit = useCallback(
      async (content: string) => {
        const result = await addComment(content);
        return result.success;
      },
      [addComment]
    );

    const formatCount = (count: number): string => {
      if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + "M";
      }
      if (count >= 1000) {
        return (count / 1000).toFixed(1) + "K";
      }
      return count.toString();
    };

    const isTrending = variant === "trending";

    return (
      <motion.div
        whileHover={{ y: -4 }}
        className={cn(
          "rounded-2xl overflow-hidden transition-all duration-300 border",
          colors.card,
          colors.border,
          isSelected && "ring-2 ring-amber-500",
          isTrending && "border-2 border-amber-300 dark:border-amber-600",
          "shadow-sm hover:shadow-xl"
        )}
      >
        {/* Video Thumbnail */}
        <div
          className="aspect-video bg-black relative cursor-pointer group"
          onClick={handleView}
        >
          {video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
              <div className="text-center text-white p-4">
                <svg
                  className="w-12 h-12 mx-auto mb-2 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm font-medium">{video.title}</p>
              </div>
            </div>
          )}

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center backdrop-blur-sm"
            >
              <svg
                className="w-6 h-6 text-gray-900 ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </motion.div>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between">
            {isTrending && (
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg">
                🔥 Trending
              </span>
            )}
            <span
              className={cn(
                "text-xs px-2 py-1.5 rounded-full backdrop-blur-sm font-medium",
                colors.card,
                colors.text
              )}
            >
              {video.videoType}
            </span>
          </div>
        </div>

        {/* Video Content */}
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <h3
              className={cn(
                "font-semibold leading-tight flex-1 pr-2",
                colors.text
              )}
            >
              {video.title}
            </h3>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn("p-1 rounded-lg transition-colors", colors.hoverBg)}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm mb-3">
            <div className="flex items-center gap-1">
              <span className={colors.textMuted}>👁️</span>
              <span className={cn("font-medium", colors.text)}>
                {formatCount(video.views)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className={colors.textMuted}>❤️</span>
              <span className={cn("font-medium", colors.text)}>
                {formatCount(video.likes)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className={colors.textMuted}>💬</span>
              <span className={cn("font-medium", colors.text)}>
                {formatCount(totalComments)}
              </span>
            </div>
          </div>

          {/* Description */}
          {video.description && (
            <p className={cn("text-sm mb-3 line-clamp-2", colors.textMuted)}>
              {video.description}
            </p>
          )}

          {/* Tags */}
          {video.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {video.tags.slice(0, 3).map((tag: string, index: number) => (
                <span
                  key={index}
                  className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    colors.backgroundMuted,
                    colors.textMuted
                  )}
                >
                  #{tag}
                </span>
              ))}
              {video.tags.length > 3 && (
                <span className={cn("text-xs px-2 py-1", colors.textMuted)}>
                  +{video.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between border-t pt-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleLike}
              disabled={isLoading}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200",
                isLiked
                  ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                  : cn(colors.textMuted, colors.hoverBg),
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              <svg
                className="w-5 h-5"
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className="text-sm font-medium">Like</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowComments(!showComments)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200",
                showComments
                  ? "text-amber-500 bg-amber-50 dark:bg-amber-900/20"
                  : cn(colors.textMuted, colors.hoverBg)
              )}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span className="text-sm font-medium">Comment</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200",
                colors.textMuted,
                colors.hoverBg
              )}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              <span className="text-sm font-medium">Share</span>
            </motion.button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 border-t pt-4"
            >
              <VideoComments
                videoId={video._id}
                currentUserId={currentUserId}
                onAddComment={handleCommentSubmit}
                onDeleteComment={deleteComment}
                comments={comments || []}
              />
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }
);
