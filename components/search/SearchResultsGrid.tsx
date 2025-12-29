// components/search/SearchResultsGrid.tsx (FULLY RESPONSIVE)
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/app/stores";
import { useAllUsers } from "@/hooks/useAllUsers";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { SearchUserCardSkeleton } from "../skeletons/SearchUserSkeleton";
import { useEffect, useState, useMemo } from "react";
import SearchFilters from "./SearchFilters";
import { useUserSearch } from "@/hooks/useUserSearch";
import { SearchUserCard } from "./SearchUserCard";
import {
  Filter,
  Search,
  AlertCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SearchResultsGrid() {
  const { searchUsers, isLoading: usersLoading } = useAllUsers();
  const { searchQuery, user: currentUser } = useUserStore();
  const { colors, isDarkMode } = useThemeColors();
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Use the hook with all your logic
  const {
    filteredUsers,
    activeFilters,
    activeFilterCount,
    processedUsers,
    handleFilterChange,
    isFeaturedUser,
  } = useUserSearch({
    users: searchUsers || [],
    currentUser: currentUser,
    searchQuery,
  });

  // Calculate trust score statistics
  const trustStats = useMemo(() => {
    if (!filteredUsers.length) return null;

    const scores = filteredUsers
      .map((u) => u.trustScore || 0)
      .filter((score) => score > 0);

    if (!scores.length) return null;

    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    // Count users by tier
    const tierCounts = {
      elite: 0,
      trusted: 0,
      verified: 0,
      basic: 0,
      new: 0,
    };

    filteredUsers.forEach((user) => {
      const score = user.trustScore || 0;
      const tier =
        score >= 80
          ? "elite"
          : score >= 65
            ? "trusted"
            : score >= 50
              ? "verified"
              : score >= 30
                ? "basic"
                : "new";
      tierCounts[tier]++;
    });

    return {
      averageScore,
      maxScore,
      minScore,
      totalUsers: filteredUsers.length,
      tierCounts,
    };
  }, [filteredUsers]);

  useEffect(() => {
    if (searchUsers && !usersLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchUsers, usersLoading]);

  const showLoading = isLoading || usersLoading || !searchUsers;

  // ✅ Update the results count text to be generic
  const getResultsText = () => {
    if (!searchUsers) return "";

    const isClientFilter = activeFilters.clientOnly;
    const isMusicianFilter = activeFilters.musicianOnly;
    const isBookerFilter = activeFilters.bookerOnly;

    let typeText = "user";
    if (isClientFilter) typeText = "client";
    if (isMusicianFilter) typeText = "musician";
    if (isBookerFilter) typeText = "booker/manager";

    const hasFilters = activeFilterCount > 0 || searchQuery;

    return (
      <div className="flex flex-wrap items-center gap-1 md:gap-2">
        <span className="font-semibold text-base md:text-lg">
          {filteredUsers.length}
        </span>
        <span className={cn("text-sm md:text-base", colors.textMuted)}>
          {typeText}
          {filteredUsers.length !== 1 ? "s" : ""} found
        </span>
        {hasFilters && (
          <span className={cn("text-xs md:text-sm", colors.textMuted)}>
            (of {processedUsers.length} total)
          </span>
        )}
      </div>
    );
  };

  // Mobile filter button
  const MobileFilterButton = () => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowMobileFilters(!showMobileFilters)}
      className="lg:hidden flex items-center gap-2"
    >
      <Filter className="w-4 h-4" />
      <span>Filters</span>
      {activeFilterCount > 0 && (
        <Badge
          variant="secondary"
          className="ml-1 px-1.5 py-0.5 min-w-5 h-5 text-xs"
        >
          {activeFilterCount}
        </Badge>
      )}
    </Button>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Header Section - Responsive */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Title and Search Info */}
          <div className="flex-1 min-w-0">
            <h1
              className={cn(
                "text-2xl sm:text-3xl md:text-4xl font-bold mb-2",
                colors.text
              )}
            >
              Discover Talent
            </h1>
            {searchQuery && (
              <p className={cn("text-sm sm:text-base", colors.textMuted)}>
                Search results for:{" "}
                <span className="font-semibold text-primary">
                  "{searchQuery}"
                </span>
              </p>
            )}
          </div>

          {/* Mobile Filter Button */}
          <div className="sm:hidden">
            <MobileFilterButton />
          </div>
        </div>

        {/* Trust Score Stats Banner - Responsive */}
        {trustStats && filteredUsers.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-xl p-4 mb-6",
              "bg-gradient-to-r from-blue-500/10 to-purple-500/10",
              "border border-blue-500/20 dark:border-blue-400/20"
            )}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                  <h3
                    className={cn(
                      "text-sm md:text-base font-semibold",
                      colors.text
                    )}
                  >
                    Trust Score Insights
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Avg Score
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                      {trustStats.averageScore.toFixed(0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Highest
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                      {trustStats.maxScore}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Elite Users
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-400">
                      {trustStats.tierCounts.elite}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Verified
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {trustStats.tierCounts.verified}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters Row - Responsive */}
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          {/* Desktop Filters */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <SearchFilters onFilterChange={handleFilterChange} />
          </div>

          {/* Mobile Filters Overlay */}
          {showMobileFilters && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="lg:hidden fixed inset-0 z-50"
            >
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setShowMobileFilters(false)}
              />
              <div
                className={cn(
                  "absolute left-0 top-0 h-full w-80 max-w-full",
                  "bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto"
                )}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Filters</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMobileFilters(false)}
                    >
                      ✕
                    </Button>
                  </div>
                  <SearchFilters onFilterChange={handleFilterChange} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Results Header - Responsive */}
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-4 md:mb-6">
              {/* Results Count */}
              <div className="flex items-center gap-2">
                {getResultsText()}
                {/* Active Filters Badges */}
                {activeFilterCount > 0 && (
                  <div className="hidden xs:flex items-center gap-1">
                    {activeFilters.musicianOnly && (
                      <Badge variant="secondary" className="text-xs">
                        🎵 Musicians
                      </Badge>
                    )}
                    {activeFilters.clientOnly && (
                      <Badge variant="secondary" className="text-xs">
                        💼 Clients
                      </Badge>
                    )}
                    {activeFilters.bookerOnly && (
                      <Badge variant="secondary" className="text-xs">
                        📅 Bookers
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Stats and Desktop Filter Toggle */}
              <div className="flex items-center gap-3">
                {/* Active Filter Count */}
                {activeFilterCount > 0 && (
                  <div
                    className={cn(
                      "text-sm font-medium px-2 py-1 rounded-full",
                      isDarkMode
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-amber-500/10 text-amber-700"
                    )}
                  >
                    {activeFilterCount} filter
                    {activeFilterCount !== 1 ? "s" : ""}
                  </div>
                )}

                {/* Desktop Clear Filters (if any) */}
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleFilterChange({
                        roleType: [],
                        instrument: [],
                        discoveryType: [],
                        clientOnly: false,
                        musicianOnly: false,
                        bookerOnly: false,
                      })
                    }
                    className="hidden sm:inline-flex"
                  >
                    Clear all
                  </Button>
                )}

                {/* Mobile Filter Toggle */}
                <div className="sm:hidden">
                  <MobileFilterButton />
                </div>
              </div>
            </div>

            {/* Featured Users Section */}
            {filteredUsers.some(isFeaturedUser) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 md:mb-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <h3
                    className={cn(
                      "text-lg md:text-xl font-semibold",
                      colors.text
                    )}
                  >
                    Featured Users
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredUsers
                    .filter(isFeaturedUser)
                    .slice(0, 3)
                    .map((user) => (
                      <motion.div
                        key={user._id}
                        whileHover={{ y: -4 }}
                        className="h-full"
                      >
                        <SearchUserCard user={user} isFeatured={true} />
                      </motion.div>
                    ))}
                </div>
              </motion.div>
            )}

            {/* Main Results Grid */}
            <AnimatePresence mode="wait">
              {showLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6"
                >
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="h-full"
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
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6 auto-rows-fr"
                >
                  {filteredUsers
                    .filter((user) => !isFeaturedUser || !isFeaturedUser(user))
                    .map((user, index) => (
                      <motion.div
                        key={user._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: index * 0.05,
                          type: "spring",
                          stiffness: 100,
                        }}
                        className="h-full"
                      >
                        <SearchUserCard
                          user={user}
                          isFeatured={
                            isFeaturedUser ? isFeaturedUser(user) : false
                          }
                        />
                      </motion.div>
                    ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    "text-center py-12 md:py-16 lg:py-20 rounded-2xl",
                    "border-2 border-dashed",
                    colors.border
                  )}
                >
                  <div className="max-w-md mx-auto px-4">
                    <div
                      className={cn(
                        "text-5xl md:text-6xl mb-4 md:mb-6",
                        isDarkMode ? "text-gray-400" : "text-gray-300"
                      )}
                    >
                      {searchQuery ? "🔍" : "👥"}
                    </div>
                    <h3
                      className={cn(
                        "text-xl md:text-2xl font-semibold mb-3 md:mb-4",
                        isDarkMode ? "text-white" : "text-gray-900"
                      )}
                    >
                      {searchQuery ? "No matches found" : "No users available"}
                    </h3>
                    <p
                      className={cn(
                        "text-sm md:text-base mb-6 md:mb-8 max-w-md mx-auto",
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      )}
                    >
                      {searchQuery
                        ? `No users found for "${searchQuery}". Try different keywords or check your filters.`
                        : activeFilterCount > 0
                          ? "No users match your current filters. Try adjusting them."
                          : "Check back later for new users or try a different search."}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      {activeFilterCount > 0 && (
                        <Button
                          variant="default"
                          onClick={() =>
                            handleFilterChange({
                              roleType: [],
                              instrument: [],
                              discoveryType: [],
                              clientOnly: false,
                              musicianOnly: false,
                              bookerOnly: false,
                            })
                          }
                        >
                          Clear all filters
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => {
                          // Add logic to refresh or show suggestions
                        }}
                      >
                        Show all users
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination/Load More (Optional) */}
            {filteredUsers.length > 0 && !showLoading && (
              <div className="mt-8 md:mt-12 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                  <span className={cn("text-sm px-4", colors.textMuted)}>
                    Showing {Math.min(filteredUsers.length, 20)} of{" "}
                    {filteredUsers.length} users
                  </span>
                  <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                </div>
                {filteredUsers.length > 20 && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 py-6 text-base"
                  >
                    Load More Users
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchResultsGrid;
