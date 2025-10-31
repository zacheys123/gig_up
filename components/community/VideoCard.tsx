// components/VideoCard.tsx
import React, { useState, useCallback } from "react";

import { Id } from "@/convex/_generated/dataModel";
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
    const [isLiked, setIsLiked] = useState(false); // You'd get this from user context

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
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-md ${
          isSelected ? "ring-2 ring-blue-500" : ""
        } ${isTrending ? "border-2 border-amber-200 dark:border-amber-800" : ""}`}
      >
        {/* Video Thumbnail */}
        <div
          className="aspect-video bg-black relative cursor-pointer"
          onClick={handleView}
        >
          {video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover"
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
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity">
            <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center transform hover:scale-110 transition-transform">
              <svg
                className="w-6 h-6 text-gray-900 ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {/* Trending Badge */}
          {isTrending && (
            <div className="absolute top-2 left-2">
              <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                🔥 Trending
              </span>
            </div>
          )}

          {/* Video Type Badge */}
          <div className="absolute top-2 right-2">
            <span className="bg-gray-900 bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              {video.videoType}
            </span>
          </div>
        </div>

        {/* Video Info */}
        <div className="p-4">
          {/* Title and Stats */}
          <div className="mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
              {video.title}
            </h3>

            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>👁️ {formatCount(video.views)}</span>
              <span>❤️ {formatCount(video.likes)}</span>
              <span>💬 {formatCount(totalComments)}</span>
            </div>
          </div>

          {/* Description */}
          {video.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
              {video.description}
            </p>
          )}

          {/* Tags */}
          {video.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {video.tags.slice(0, 3).map((tag: string, index: number) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                >
                  #{tag}
                </span>
              ))}
              {video.tags.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{video.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
            <button
              onClick={handleLike}
              disabled={isLoading}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isLiked
                  ? "text-red-500 hover:text-red-600"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
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
              <span className="text-sm">Like</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg transition-colors"
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
              <span className="text-sm">Comment</span>
            </button>

            <button className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg transition-colors">
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
              <span className="text-sm">Share</span>
            </button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              <VideoComments
                videoId={video._id}
                currentUserId={currentUserId}
                onAddComment={handleCommentSubmit}
                onDeleteComment={deleteComment}
                comments={comments || []}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);
