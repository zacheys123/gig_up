// components/VideoFilters.tsx
import React from "react";
import { VideoFilters as VideoFiltersType } from "@/hooks/useVideoSocial";

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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Filter Videos
        </h3>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            Clear All Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search
          </label>
          <input
            type="text"
            value={filters.searchQuery || ""}
            onChange={(e) => onUpdateFilter("searchQuery", e.target.value)}
            placeholder="Search videos..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        </div>

        {/* Video Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Video Type
          </label>
          <select
            value={filters.videoType || "all"}
            onChange={(e) => onUpdateFilter("videoType", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy || "newest"}
            onChange={(e) => onUpdateFilter("sortBy", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Timeframe
          </label>
          <select
            value={filters.timeframe || "all"}
            onChange={(e) => onUpdateFilter("timeframe", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            {timeframeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tags Filter */}
      {availableTags.length > 0 && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filter by Tags
          </label>
          <div className="flex flex-wrap gap-2">
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
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                #{tag}
              </button>
            ))}
            {availableTags.length > 10 && (
              <span className="px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                +{availableTags.length - 10} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
