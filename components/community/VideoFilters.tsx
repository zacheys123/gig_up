"use client";
import React, { useState } from "react";
import { VideoFilters as VideoFiltersType } from "@/hooks/useVideoSocial";
import { useThemeColors } from "@/hooks/useTheme";
import { motion, AnimatePresence } from "framer-motion";

interface VideoFiltersProps {
  filters: VideoFiltersType;
  availableTags: string[];
  onUpdateFilter: (key: keyof VideoFiltersType, value: any) => void;
  onClearFilters: () => void;
  totalVideos: number;
}

export const VideoFilters: React.FC<VideoFiltersProps> = ({
  filters,
  availableTags,
  onUpdateFilter,
  onClearFilters,
  totalVideos,
}) => {
  const { colors } = useThemeColors();
  const [open, setOpen] = useState(true);

  const videoTypes = [
    { value: "all", label: "All Types" },
    { value: "profile", label: "Profile Showcase" },
    { value: "gig", label: "Gig Recordings" },
    { value: "casual", label: "Casual Performances" },
    { value: "promo", label: "Promotional" },
    { value: "other", label: "Other" },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "popular", label: "Most Popular" },
    { value: "trending", label: "Trending" },
  ];

  const timeframeOptions = [
    { value: "all", label: "All Time" },
    { value: "day", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
  ];

  const hasActiveFilters =
    (filters.videoType && filters.videoType !== "all") ||
    (filters.tags && filters.tags.length > 0) ||
    (filters.sortBy && filters.sortBy !== "newest") ||
    filters.searchQuery;

  const inputBaseClasses =
    "w-full px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent";

  return (
    <motion.div
      layout
      className={`p-4 mb-6 rounded-2xl border ${colors.border} ${colors.card} shadow-lg backdrop-blur-md`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold text-lg ${colors.text}`}>
          Filter Videos ({totalVideos})
        </h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className={`px-3 py-1 text-sm rounded-md border transition-colors ${colors.primaryBg} ${colors.primaryBgHover} ${colors.textInverted}`}
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setOpen(!open)}
            className={`px-2 py-1 rounded-md text-sm transition-colors ${colors.textMuted} hover:${colors.text}`}
          >
            {open ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {/* Search */}
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${colors.textSecondary}`}
              >
                Search
              </label>
              <input
                type="text"
                value={filters.searchQuery || ""}
                onChange={(e) => onUpdateFilter("searchQuery", e.target.value)}
                placeholder="Search videos..."
                className={`${inputBaseClasses} ${colors.backgroundSecondary} ${colors.text} ${colors.border}`}
              />
            </div>

            {/* Video Type */}
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${colors.textSecondary}`}
              >
                Video Type
              </label>
              <select
                value={filters.videoType || "all"}
                onChange={(e) => onUpdateFilter("videoType", e.target.value)}
                className={`${inputBaseClasses} ${colors.backgroundSecondary} ${colors.text} ${colors.border}`}
              >
                {videoTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${colors.textSecondary}`}
              >
                Sort By
              </label>
              <select
                value={filters.sortBy || "newest"}
                onChange={(e) => onUpdateFilter("sortBy", e.target.value)}
                className={`${inputBaseClasses} ${colors.backgroundSecondary} ${colors.text} ${colors.border}`}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Timeframe */}
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${colors.textSecondary}`}
              >
                Timeframe
              </label>
              <select
                value={filters.timeframe || "all"}
                onChange={(e) => onUpdateFilter("timeframe", e.target.value)}
                className={`${inputBaseClasses} ${colors.backgroundSecondary} ${colors.text} ${colors.border}`}
              >
                {timeframeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tags */}
      {availableTags.length > 0 && open && (
        <motion.div
          layout
          className="mt-4 flex flex-wrap gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {availableTags.slice(0, 10).map((tag) => (
            <button
              key={tag}
              onClick={() => {
                const currentTags = filters.tags || [];
                const newTags = currentTags.includes(tag)
                  ? currentTags.filter((t) => t !== tag)
                  : [...currentTags, tag];
                onUpdateFilter("tags", newTags);
              }}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                (filters.tags || []).includes(tag)
                  ? "bg-amber-500 text-white border-amber-500"
                  : `${colors.secondaryBackground} ${colors.textSecondary} ${colors.border} hover:${colors.hoverBackground}`
              }`}
            >
              #{tag}
            </button>
          ))}
          {availableTags.length > 10 && (
            <span className={`${colors.textSecondary} px-2 py-1 text-sm`}>
              +{availableTags.length - 10} more
            </span>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};
