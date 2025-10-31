// components/VideoFeed.tsx
import React, { useState, useCallback } from "react";
import { useVideoSocial } from "@/hooks/useVideoSocial";
import { Id } from "@/convex/_generated/dataModel";
import { VideoCard } from "./VideoCard";
import { VideoFilters } from "./VideoFilters";

interface VideoFeedProps {
  currentUserId?: Id<"users">;
  initialFilters?: {
    videoType?: "profile" | "gig" | "casual" | "promo" | "other" | "all";
    sortBy?: "newest" | "popular" | "trending";
  };
}

export const VideoFeed: React.FC<VideoFeedProps> = ({
  currentUserId,
  initialFilters = {},
}) => {
  const {
    videos,
    trendingVideos,
    availableTags,
    filters,
    updateFilter,
    clearFilters,
    likeVideo,
    unlikeVideo,
    incrementViews,
    isLoading,
    hasVideos,
    totalVideos,
  } = useVideoSocial(currentUserId);

  const [selectedVideo, setSelectedVideo] = useState<Id<"videos"> | null>(null);

  // Handle video actions
  const handleLike = useCallback(
    async (videoId: Id<"videos">) => {
      const result = await likeVideo(videoId);
      if (!result.success) {
        console.error("Failed to like video:", result.error);
      }
    },
    [likeVideo]
  );

  const handleUnlike = useCallback(
    async (videoId: Id<"videos">) => {
      const result = await unlikeVideo(videoId);
      if (!result.success) {
        console.error("Failed to unlike video:", result.error);
      }
    },
    [unlikeVideo]
  );

  const handleView = useCallback(
    async (videoId: Id<"videos">) => {
      const result = await incrementViews(videoId);
      if (!result.success) {
        console.error("Failed to increment views:", result.error);
      }
    },
    [incrementViews]
  );

  const handleVideoSelect = useCallback(
    (videoId: Id<"videos">) => {
      setSelectedVideo(videoId);
      handleView(videoId);
    },
    [handleView]
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Performance Videos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Discover amazing musical performances from talented artists
          </p>
        </div>

        {/* Filters */}
        <VideoFilters
          filters={filters}
          availableTags={availableTags}
          onUpdateFilter={updateFilter}
          onClearFilters={clearFilters}
          totalVideos={totalVideos}
        />

        {/* Video Grid */}
        {!hasVideos ? (
          <EmptyState
            title="No videos found"
            message="Try adjusting your filters or check back later for new content."
          />
        ) : (
          <>
            {/* Stats */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {totalVideos} video{totalVideos !== 1 ? "s" : ""}
              </p>

              {filters.sortBy && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Videos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <VideoCard
                  key={video._id}
                  video={video}
                  currentUserId={currentUserId}
                  onLike={handleLike}
                  onUnlike={handleUnlike}
                  onView={handleView}
                  onSelect={handleVideoSelect}
                  isSelected={selectedVideo === video._id}
                  isLoading={
                    isLoading(`like-${video._id}`) ||
                    isLoading(`unlike-${video._id}`)
                  }
                />
              ))}
            </div>
          </>
        )}

        {/* Trending Section */}
        {trendingVideos.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Trending Now
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingVideos.slice(0, 3).map((video) => (
                <VideoCard
                  key={video._id}
                  video={video}
                  currentUserId={currentUserId}
                  onLike={handleLike}
                  onUnlike={handleUnlike}
                  onView={handleView}
                  variant="trending"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ title: string; message: string }> = ({
  title,
  message,
}) => (
  <div className="text-center py-16">
    <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-400">{message}</p>
  </div>
);
