// components/search/SearchResultsGrid.tsx (FIXED)
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/app/stores";
import { useAllUsers } from "@/hooks/useAllUsers";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { SearchUserCard } from "./SearchUserCard";
import { useEffect, useState } from "react";
import SearchFilters from "./SearchFilters";

import { SearchUserCardSkeleton } from "../skeletons/SearchUserSkeleton";
import { useUserSearch } from "@/hooks/useUserSearch";

export function SearchResultsGrid() {
  const { users, isLoading: usersLoading } = useAllUsers();
  const { searchQuery, user: currentUser } = useUserStore();
  const { isDarkMode } = useThemeColors();
  const [isLoading, setIsLoading] = useState(true);

  // Fix: Pass currentUser safely (it might be null from the store)
  const {
    filteredUsers,
    activeFilters,
    activeFilterCount, // Get this from hook
    processedUsers, // Get this from hook
    handleFilterChange,
  } = useUserSearch({
    users: users || [],
    currentUser: currentUser || undefined, // Handle null case
    searchQuery,
  });

  // Your featured user algorithm (moved inside component)
  const isFeaturedUser = (user: any): boolean => {
    try {
      const views = user.profileViews?.totalCount || 0;
      const followers = Math.max(user.followers?.length || 1, 1);
      const engagementRate = views / followers;

      let isActive = false;
      if (user.lastActive && typeof user.lastActive === "number") {
        isActive = Date.now() - user.lastActive < 7 * 24 * 60 * 60 * 1000;
      }

      const isFeatured = views >= 10 && engagementRate > 0.3 && isActive;
      return isFeatured;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    if (users && !usersLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [users, usersLoading]);

  const showLoading = isLoading || usersLoading || !users;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Filters */}
      <div className="flex justify-end my-3">
        <SearchFilters onFilterChange={handleFilterChange} />
      </div>

      {/* Search Status */}
      <div className="flex items-center justify-between mb-6">
        {/* Active Filters Indicator */}
        {!showLoading && activeFilterCount > 0 && (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-sm font-medium px-3 py-1 rounded-full border",
                isDarkMode
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  : "bg-amber-500/10 text-amber-700 border-amber-500/20"
              )}
            >
              {activeFilterCount} active filter
              {activeFilterCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Results Count */}
        {!showLoading && (
          <div
            className={cn(
              "text-sm font-medium",
              isDarkMode ? "text-gray-400" : "text-gray-600"
            )}
          >
            {filteredUsers.length} of {processedUsers.length} musician
            {filteredUsers.length !== 1 ? "s" : ""}
            {searchQuery && (
              <span className="ml-1">matching "{searchQuery}"</span>
            )}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {showLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <SearchUserCardSkeleton isDarkMode={isDarkMode} />
              </motion.div>
            ))}
          </motion.div>
        ) : filteredUsers.length > 0 ? (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <SearchUserCard user={user} isFeatured={isFeaturedUser(user)} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div
              className={cn(
                "text-6xl mb-4 opacity-20",
                isDarkMode ? "text-gray-400" : "text-gray-300"
              )}
            >
              {searchQuery ? "🔍" : "👥"}
            </div>
            <h3
              className={cn(
                "text-xl font-semibold mb-2",
                isDarkMode ? "text-white" : "text-gray-900"
              )}
            >
              {searchQuery ? "No matches found" : "No musicians available"}
            </h3>
            <p
              className={cn(
                "text-sm max-w-md mx-auto",
                isDarkMode ? "text-gray-400" : "text-gray-600"
              )}
            >
              {searchQuery
                ? `No musicians found for "${searchQuery}". Try different keywords or check your filters.`
                : activeFilterCount > 0
                  ? "No musicians match your current filters. Try adjusting them."
                  : "Check back later for new musicians or try a different search."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SearchResultsGrid;
