"use client";
import React, { useState, useCallback, useRef } from "react";
import { VideoCard } from "./VideoCard";
import { VideoFilters } from "./VideoFilters";
import { useVideoSocial } from "@/hooks/useVideoSocial";
import { Id } from "@/convex/_generated/dataModel";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ---------------- Debounce Hook ----------------
function useDebounce(callback: (...args: any[]) => void, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  return useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  );
}

interface VideoFeedProps {
  clerkId?: string;
}

export const VideoFeed: React.FC<VideoFeedProps> = ({ clerkId }) => {
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
    loadMoreVideos,
    hasMore,
  } = useVideoSocial(clerkId);

  const { colors } = useThemeColors();
  const [selectedVideo, setSelectedVideo] = useState<Id<"videos"> | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // ---------------- Debounced Search ----------------
  const debouncedUpdateFilter = useDebounce(updateFilter, 300);
  const handleUpdateFilter = useCallback(
    (key: keyof typeof filters, value: any) => {
      if (key === "searchQuery") debouncedUpdateFilter(key, value);
      else updateFilter(key, value);
    },
    [updateFilter, debouncedUpdateFilter]
  );

  const handleLike = useCallback(
    async (videoId: Id<"videos">) => {
      const result = await likeVideo(videoId);
      if (!result.success) console.error(result.error);
    },
    [likeVideo]
  );

  const handleUnlike = useCallback(
    async (videoId: Id<"videos">) => {
      const result = await unlikeVideo(videoId);
      if (!result.success) console.error(result.error);
    },
    [unlikeVideo]
  );

  const handleView = useCallback(
    async (videoId: Id<"videos">) => {
      const result = await incrementViews(videoId);
      if (!result.success) console.error(result.error);
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

  // ---------------- Intersection Observer for Lazy Loading ----------------
  const observer = useRef<IntersectionObserver | null>(null);
  const lastVideoRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading("load-more")) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreVideos();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loadMoreVideos, hasMore, isLoading]
  );

  return (
    <div className="pb-safe relative space-y-8 px-4 md:px-6 lg:px-8">
      {/* ---------- Filter Toggle ---------- */}
      <div
        className={cn(
          "sticky top-0 z-50 flex justify-between items-center py-2 px-4 backdrop-blur-md shadow-md rounded-xl",
          colors.background,
          colors.border
        )}
      >
        <div className={cn("text-sm font-medium", colors.text)}>
          <span className="font-bold text-amber-500 text-lg">
            {totalVideos}
          </span>{" "}
          video{totalVideos !== 1 ? "s" : ""} found
        </div>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="px-3 py-1 rounded-md text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 shadow-sm transition"
        >
          {filtersOpen ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {/* ---------- Filters Panel ---------- */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <VideoFilters
              filters={filters}
              availableTags={availableTags}
              onUpdateFilter={handleUpdateFilter}
              onClearFilters={clearFilters}
              totalVideos={totalVideos}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- Video Masonry Feed ---------- */}
      {!hasVideos ? (
        <EmptyState
          title="No videos found"
          message="Try adjusting your filters or check back later for new content."
        />
      ) : (
        <div
          className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4"
          style={{ columnGap: "1rem" }}
        >
          {videos.map((video, index) => {
            const isLast = index === videos.length - 1;
            return (
              <div
                key={video._id}
                ref={isLast ? lastVideoRef : null}
                className="mb-4 break-inside-avoid relative"
              >
                <VideoCard
                  video={video}
                  currentUserId={clerkId}
                  onLike={handleLike}
                  onUnlike={handleUnlike}
                  onView={handleView}
                  onSelect={handleVideoSelect}
                  isSelected={selectedVideo === video._id}
                  isLoading={
                    isLoading(`like-${video._id}`) ||
                    isLoading(`unlike-${video._id}`)
                  }
                  className="w-full rounded-lg overflow-hidden shadow-sm cursor-pointer hover:shadow-lg transition"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* ---------- Trending Section ---------- */}
      {trendingVideos.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-16"
        >
          <h2 className={cn("text-2xl font-bold mb-6", colors.text)}>
            Trending Now 🔥
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingVideos.slice(0, 3).map((video) => (
              <VideoCard
                key={video._id}
                video={video}
                currentUserId={clerkId}
                onLike={handleLike}
                onUnlike={handleUnlike}
                onView={handleView}
                className="hover:scale-105 hover:shadow-lg transition-transform duration-200 cursor-pointer"
              />
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
};

// ---------- Empty State ----------
const EmptyState: React.FC<{ title: string; message: string }> = ({
  title,
  message,
}) => {
  const { colors } = useThemeColors();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "text-center py-16 px-4 sm:px-8 rounded-2xl border-2 border-dashed",
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
