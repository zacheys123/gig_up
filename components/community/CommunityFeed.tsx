// components/community/VideoFeed.tsx
import React, { useState, useCallback } from "react";
import { useVideoSocial } from "@/hooks/useVideoSocial";
import { Id } from "@/convex/_generated/dataModel";
import { VideoCard } from "./VideoCard";
import { VideoFilters } from "./VideoFilters";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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

  const { colors } = useThemeColors();
  const [selectedVideo, setSelectedVideo] = useState<Id<"videos"> | null>(null);

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
    <div className="space-y-8">
      {/* Filters Section */}
      <VideoFilters
        filters={filters}
        availableTags={availableTags}
        onUpdateFilter={updateFilter}
        onClearFilters={clearFilters}
        totalVideos={totalVideos}
      />

      {/* Content Section */}
      {!hasVideos ? (
        <EmptyState
          title="No videos found"
          message="Try adjusting your filters or check back later for new content."
        />
      ) : (
        <>
          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl",
              colors.card,
              colors.border,
              "border shadow-sm"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn("text-sm font-medium", colors.text)}>
                <span className="text-2xl font-bold text-amber-500">
                  {totalVideos}
                </span>
                <span className={cn("ml-2", colors.textMuted)}>
                  video{totalVideos !== 1 ? "s" : ""} found
                </span>
              </div>
            </div>

            {Object.keys(filters).some(
              (key) =>
                filters[key as keyof typeof filters] &&
                !["sortBy", "timeframe"].includes(key)
            ) && (
              <button
                onClick={clearFilters}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  "bg-amber-500 text-white hover:bg-amber-600",
                  "shadow-md hover:shadow-lg"
                )}
              >
                Clear All Filters
              </button>
            )}
          </motion.div>

          {/* Videos Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
          >
            {videos.map((video, index) => (
              <motion.div
                key={video._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <VideoCard
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
              </motion.div>
            ))}
          </motion.div>
        </>
      )}

      {/* Trending Section */}
      {trendingVideos.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <div className="flex items-center gap-4 mb-8">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                "bg-gradient-to-br from-amber-500 to-orange-500"
              )}
            >
              <span className="text-xl">🔥</span>
            </div>
            <div>
              <h2 className={cn("text-2xl font-bold", colors.text)}>
                Trending Now
              </h2>
              <p className={cn("text-sm", colors.textMuted)}>
                Most popular performances this week
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingVideos.slice(0, 3).map((video, index) => (
              <motion.div
                key={video._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2 }}
              >
                <VideoCard
                  video={video}
                  currentUserId={currentUserId}
                  onLike={handleLike}
                  onUnlike={handleUnlike}
                  onView={handleView}
                  variant="trending"
                />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
};

const EmptyState: React.FC<{ title: string; message: string }> = ({
  title,
  message,
}) => {
  const { colors } = useThemeColors();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "text-center py-16 px-8 rounded-2xl border-2 border-dashed",
        colors.border
      )}
    >
      <div className="w-24 h-24 mx-auto mb-6 text-amber-400">
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 9.5V5.5C18 4.4 17.1 3.5 16 3.5H8C6.9 3.5 6 4.4 6 5.5V9.5C6 10.6 6.9 11.5 8 11.5H16C17.1 11.5 18 10.6 18 9.5ZM16 9.5H8V5.5H16V9.5ZM18 14.5V18.5C18 19.6 17.1 20.5 16 20.5H8C6.9 20.5 6 19.6 6 18.5V14.5C6 13.4 6.9 12.5 8 12.5H16C17.1 12.5 18 13.4 18 14.5ZM16 18.5V14.5H8V18.5H16Z" />
        </svg>
      </div>
      <h3 className={cn("text-xl font-semibold mb-3", colors.text)}>{title}</h3>
      <p className={cn("text-lg", colors.textMuted)}>{message}</p>
    </motion.div>
  );
};
