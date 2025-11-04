// components/VideoFilters.tsx
"use client";
import React, { useState } from "react";
import { VideoFilters as VideoFiltersType } from "@/hooks/useVideoSocial";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Tag,
  Clock,
  SortAsc,
  Type,
  Search,
} from "lucide-react";

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
  const { colors, isDarkMode } = useThemeColors();
  const [isOpen, setIsOpen] = useState(false);

  const videoTypes = [
    { value: "all", label: "All Types", icon: Type },
    { value: "profile", label: "Profile Showcase", icon: Type },
    { value: "gig", label: "Gig Recordings", icon: Clock },
    { value: "casual", label: "Casual Performances", icon: Clock },
    { value: "promo", label: "Promotional", icon: Tag },
    { value: "other", label: "Other", icon: Type },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First", icon: SortAsc },
    { value: "popular", label: "Most Popular", icon: SortAsc },
    { value: "trending", label: "Trending", icon: SortAsc },
  ];

  const timeframeOptions = [
    { value: "all", label: "All Time", icon: Clock },
    { value: "day", label: "Today", icon: Clock },
    { value: "week", label: "This Week", icon: Clock },
    { value: "month", label: "This Month", icon: Clock },
  ];

  const hasActiveFilters =
    (filters.videoType && filters.videoType !== "all") ||
    (filters.tags && filters.tags.length > 0) ||
    (filters.sortBy && filters.sortBy !== "newest") ||
    (filters.timeframe && filters.timeframe !== "all") ||
    (filters.searchQuery && filters.searchQuery.length > 0);

  // Properly themed input classes
  const inputBaseClasses = cn(
    "w-full px-3 py-2.5 rounded-xl text-sm transition-all duration-300",
    "focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent",
    "border placeholder-gray-500",
    isDarkMode
      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500",
    "disabled:opacity-50 disabled:cursor-not-allowed"
  );

  // Properly themed select classes
  const selectBaseClasses = cn(
    "w-full px-3 py-2.5 rounded-xl text-sm transition-all duration-300",
    "focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent",
    "border appearance-none bg-no-repeat bg-right pr-10",
    isDarkMode
      ? "bg-gray-800 border-gray-700 text-white"
      : "bg-white border-gray-300 text-gray-900",
    "disabled:opacity-50 disabled:cursor-not-allowed"
  );

  // Custom select arrow that works with theme
  const selectArrowColor = isDarkMode ? "rgb(156,163,175)" : "rgb(107,114,128)";
  const selectBackgroundStyle = {
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='${selectArrowColor}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: "right 0.5rem center",
    backgroundSize: "1.5em 1.5em",
  };

  return (
    <div
      className={cn(
        "w-full rounded-2xl p-4 border",
        colors.card,
        colors.border,
        "shadow-sm"
      )}
    >
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-xl", colors.primaryBg)}>
            <Filter className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className={cn("font-semibold text-lg", colors.text)}>
              Filter Videos
            </h3>
            <p className={cn("text-sm", colors.textMuted)}>
              {totalVideos} {totalVideos === 1 ? "video" : "videos"} found
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClearFilters}
              className={cn(
                "px-4 py-2 text-sm rounded-xl font-medium transition-all duration-300",
                "flex items-center gap-2",
                "bg-amber-500 text-white hover:bg-amber-600",
                "shadow-sm hover:shadow-md"
              )}
            >
              <X className="w-4 h-4" />
              Clear All
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "p-2 rounded-xl transition-all duration-300",
              colors.hoverBg,
              colors.text,
              "hover:shadow-sm"
            )}
          >
            {isOpen ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="space-y-6 overflow-hidden"
          >
            {/* Search Input */}
            <div className="space-y-2">
              <label
                className={cn(
                  "flex items-center gap-2 text-sm font-medium",
                  colors.text
                )}
              >
                <Search className="w-4 h-4" />
                Search Videos
              </label>
              <div className="relative">
                <Search
                  className={cn(
                    "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4",
                    isDarkMode ? "text-red-400" : "text-red-500"
                  )}
                />
                <input
                  type="text"
                  value={filters.searchQuery || ""}
                  onChange={(e) =>
                    onUpdateFilter("searchQuery", e.target.value)
                  }
                  placeholder="Search by title, description, or tags..."
                  className={cn(inputBaseClasses, "pl-10")}
                />
              </div>
            </div>

            {/* Filter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Video Type */}
              <div className="space-y-2">
                <label
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium",
                    colors.text
                  )}
                >
                  <Type className="w-4 h-4" />
                  Video Type
                </label>
                <div className="relative">
                  <select
                    value={filters.videoType || "all"}
                    onChange={(e) =>
                      onUpdateFilter("videoType", e.target.value)
                    }
                    className={selectBaseClasses}
                    style={selectBackgroundStyle}
                  >
                    {videoTypes.map((type) => (
                      <option
                        key={type.value}
                        value={type.value}
                        className={
                          isDarkMode
                            ? "bg-gray-800 text-white"
                            : "bg-white text-gray-900"
                        }
                      >
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <label
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium",
                    colors.text
                  )}
                >
                  <SortAsc className="w-4 h-4" />
                  Sort By
                </label>
                <div className="relative">
                  <select
                    value={filters.sortBy || "newest"}
                    onChange={(e) => onUpdateFilter("sortBy", e.target.value)}
                    className={selectBaseClasses}
                    style={selectBackgroundStyle}
                  >
                    {sortOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className={
                          isDarkMode
                            ? "bg-gray-800 text-white"
                            : "bg-white text-gray-900"
                        }
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Timeframe */}
              <div className="space-y-2">
                <label
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium",
                    colors.text
                  )}
                >
                  <Clock className="w-4 h-4" />
                  Timeframe
                </label>
                <div className="relative">
                  <select
                    value={filters.timeframe || "all"}
                    onChange={(e) =>
                      onUpdateFilter("timeframe", e.target.value)
                    }
                    className={selectBaseClasses}
                    style={selectBackgroundStyle}
                  >
                    {timeframeOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className={
                          isDarkMode
                            ? "bg-gray-800 text-white"
                            : "bg-white text-gray-900"
                        }
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Tags Section */}
            {availableTags.length > 0 && (
              <div className="space-y-3">
                <label
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium",
                    colors.text
                  )}
                >
                  <Tag className="w-4 h-4" />
                  Filter by Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.slice(0, 12).map((tag) => (
                    <motion.button
                      key={tag}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const currentTags = filters.tags || [];
                        const newTags = currentTags.includes(tag)
                          ? currentTags.filter((t) => t !== tag)
                          : [...currentTags, tag];
                        onUpdateFilter("tags", newTags);
                      }}
                      className={cn(
                        "px-3 py-2 text-sm rounded-xl font-medium transition-all duration-300",
                        "border hover:shadow-sm",
                        (filters.tags || []).includes(tag)
                          ? cn(
                              "bg-amber-500 text-white border-amber-500",
                              "shadow-md hover:shadow-lg hover:bg-amber-600"
                            )
                          : cn(
                              isDarkMode
                                ? "bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700"
                                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200",
                              "hover:border-gray-400"
                            )
                      )}
                    >
                      #{tag}
                    </motion.button>
                  ))}
                  {availableTags.length > 12 && (
                    <span className={cn("px-3 py-2 text-sm", colors.textMuted)}>
                      +{availableTags.length - 12} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("pt-4 border-t", colors.border)}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("text-sm font-medium", colors.text)}>
                    Active filters:
                  </span>

                  {filters.videoType && filters.videoType !== "all" && (
                    <FilterBadge
                      label={
                        videoTypes.find((t) => t.value === filters.videoType)
                          ?.label || ""
                      }
                      type="type"
                      onRemove={() => onUpdateFilter("videoType", "all")}
                      isDarkMode={isDarkMode}
                    />
                  )}

                  {filters.sortBy && filters.sortBy !== "newest" && (
                    <FilterBadge
                      label={
                        sortOptions.find((s) => s.value === filters.sortBy)
                          ?.label || ""
                      }
                      type="sort"
                      onRemove={() => onUpdateFilter("sortBy", "newest")}
                      isDarkMode={isDarkMode}
                    />
                  )}

                  {filters.timeframe && filters.timeframe !== "all" && (
                    <FilterBadge
                      label={
                        timeframeOptions.find(
                          (t) => t.value === filters.timeframe
                        )?.label || ""
                      }
                      type="time"
                      onRemove={() => onUpdateFilter("timeframe", "all")}
                      isDarkMode={isDarkMode}
                    />
                  )}

                  {(filters.tags || []).map((tag) => (
                    <FilterBadge
                      key={tag}
                      label={tag}
                      type="tag"
                      onRemove={() => {
                        const newTags = (filters.tags || []).filter(
                          (t) => t !== tag
                        );
                        onUpdateFilter("tags", newTags);
                      }}
                      isDarkMode={isDarkMode}
                    />
                  ))}

                  {filters.searchQuery && (
                    <FilterBadge
                      label={`Search: "${filters.searchQuery}"`}
                      type="search"
                      onRemove={() => onUpdateFilter("searchQuery", "")}
                      isDarkMode={isDarkMode}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Filter Badge Component with Proper Theme
const FilterBadge: React.FC<{
  label: string;
  type: "type" | "sort" | "time" | "tag" | "search";
  onRemove: () => void;
  isDarkMode: boolean;
}> = ({ label, type, onRemove, isDarkMode }) => {
  const getBadgeColors = (type: string, darkMode: boolean) => {
    if (darkMode) {
      switch (type) {
        case "type":
          return {
            bg: "bg-amber-900/80",
            text: "text-amber-100",
            border: "border-amber-700",
            hover: "hover:bg-amber-800",
          };
        case "sort":
          return {
            bg: "bg-blue-900/80",
            text: "text-blue-100",
            border: "border-blue-700",
            hover: "hover:bg-blue-800",
          };
        case "time":
          return {
            bg: "bg-green-900/80",
            text: "text-green-100",
            border: "border-green-700",
            hover: "hover:bg-green-800",
          };
        case "tag":
          return {
            bg: "bg-purple-900/80",
            text: "text-purple-100",
            border: "border-purple-700",
            hover: "hover:bg-purple-800",
          };
        case "search":
          return {
            bg: "bg-gray-700",
            text: "text-gray-100",
            border: "border-gray-600",
            hover: "hover:bg-gray-600",
          };
        default:
          return {
            bg: "bg-gray-700",
            text: "text-gray-100",
            border: "border-gray-600",
            hover: "hover:bg-gray-600",
          };
      }
    } else {
      switch (type) {
        case "type":
          return {
            bg: "bg-amber-100",
            text: "text-amber-800",
            border: "border-amber-300",
            hover: "hover:bg-amber-200",
          };
        case "sort":
          return {
            bg: "bg-blue-100",
            text: "text-blue-800",
            border: "border-blue-300",
            hover: "hover:bg-blue-200",
          };
        case "time":
          return {
            bg: "bg-green-100",
            text: "text-green-800",
            border: "border-green-300",
            hover: "hover:bg-green-200",
          };
        case "tag":
          return {
            bg: "bg-purple-100",
            text: "text-purple-800",
            border: "border-purple-300",
            hover: "hover:bg-purple-200",
          };
        case "search":
          return {
            bg: "bg-gray-100",
            text: "text-gray-800",
            border: "border-gray-300",
            hover: "hover:bg-gray-200",
          };
        default:
          return {
            bg: "bg-gray-100",
            text: "text-gray-800",
            border: "border-gray-300",
            hover: "hover:bg-gray-200",
          };
      }
    }
  };

  const badgeColors = getBadgeColors(type, isDarkMode);

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-300",
        badgeColors.bg,
        badgeColors.text,
        badgeColors.border,
        badgeColors.hover,
        "hover:shadow-sm"
      )}
    >
      {label}
      <button
        onClick={onRemove}
        className={cn(
          "ml-1 p-0.5 rounded-full transition-colors duration-200",
          isDarkMode ? "hover:bg-white/20" : "hover:bg-black/10"
        )}
      >
        <X className="w-3 h-3" />
      </button>
    </motion.span>
  );
};

export default VideoFilters;
