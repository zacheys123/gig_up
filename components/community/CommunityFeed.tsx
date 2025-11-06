// components/VideoFeed.tsx
"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { VideoCard } from "./VideoCard";
import { VideoFilters } from "./VideoFilters";
import { useVideoSocial } from "@/hooks/useVideoSocial";
import { Id } from "@/convex/_generated/dataModel";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Sparkles, TrendingUp, Music2 } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"for-you" | "trending">("for-you");

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

  // Intersection Observer for Lazy Loading
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

  const currentVideos = activeTab === "for-you" ? videos : trendingVideos;

  const VideoCardSkeleton = () => (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 rounded-2xl overflow-hidden",
        "border border-gray-100 dark:border-gray-800",
        "animate-pulse"
      )}
    >
      <div className="flex items-center gap-3 p-4">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        </div>
      </div>
      <div className="aspect-[4/5] bg-gray-200 dark:bg-gray-700" />
      <div className="p-4 space-y-3">
        <div className="flex gap-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"
            />
          ))}
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("min-h-screen", colors.background)}>
      {/* Header */}
      <div
        className={cn(
          "sticky top-0 z-50 border-b backdrop-blur-xl ",
          colors.border,
          colors.background
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          {/* Remove the fixed class from this div - that's what's breaking it */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Music2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className={cn("text-xl font-bold", colors.text)}>
                  Performances
                </h1>
                <p className={cn("text-sm", colors.textMuted)}>
                  {totalVideos} musical moments
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-1 max-w-2xl">
              {/* Search - Fixed width to prevent overflow */}
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search performances..."
                    value={filters.searchQuery || ""}
                    onChange={(e) =>
                      handleUpdateFilter("searchQuery", e.target.value)
                    }
                    className={cn(
                      "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-300",
                      "border-2",
                      "focus:ring-2 focus:ring-amber-500 focus:border-transparent",
                      colors.text,
                      colors.borderSecondary,
                      colors.backgroundMuted
                    )}
                  />
                </div>
              </div>

              {/* Filter Button */}
              <motion.button
                onClick={() => setFiltersOpen(!filtersOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-300 flex-shrink-0",
                  filtersOpen ||
                    Object.keys(filters).some(
                      (key) => filters[key as keyof typeof filters]
                    )
                    ? "text-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-sm"
                    : cn(
                        colors.textSecondary,
                        colors.backgroundMuted,
                        "hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-700"
                      )
                )}
              >
                <Filter className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Tabs */}
          <div
            className={cn(
              "flex gap-1 rounded-xl p-1 w-fit",
              colors.backgroundMuted,
              colors.border,
              "border"
            )}
          >
            {[
              { id: "for-you", label: "For You", icon: Sparkles },
              { id: "trending", label: "Trending", icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300",
                  activeTab === tab.id
                    ? cn(colors.activeBg, colors.text, "shadow-sm")
                    : cn(
                        colors.textMuted,
                        colors.hoverBg,
                        "hover:" + colors.text.replace("text-", "text-")
                      )
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={cn("border-b", colors.border, colors.background)}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
              <VideoFilters
                filters={filters}
                availableTags={availableTags}
                onUpdateFilter={handleUpdateFilter}
                onClearFilters={clearFilters}
                totalVideos={totalVideos}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Grid */}
      {/* Video Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {!hasVideos ? (
          <div className="text-center py-20">
            <Music2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className={cn("text-xl font-semibold mb-2", colors.text)}>
              No performances found
            </h3>
            <p className={cn("text-sm", colors.textMuted)}>
              {filters.searchQuery ||
              filters.tags?.length ||
              filters.videoType !== "all"
                ? "Try adjusting your filters"
                : "Check back later for new content"}
            </p>
          </div>
        ) : (
          <>
            {/* Responsive Layout */}
            <div className="grid grid-cols-1 md:grid-cols-1 lg:hidden gap-6 ">
              {currentVideos.map((video, index) => {
                const isLast = index === currentVideos.length - 1;
                return (
                  <VideoCard
                    key={video._id}
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
                    ref={isLast ? lastVideoRef : null}
                  />
                );
              })}
            </div>

            {/* Large Screen View – single wide card */}
            <div className="hidden  lg:flex flex-col items-center gap-12">
              {currentVideos.map((video, index) => (
                <div
                  key={video._id}
                  className="w-full max-w-4xl lg:px-6 xl:px-10"
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
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
