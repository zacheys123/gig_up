// components/search/SearchHeader.tsx (OPTIMIZED WITH REUSABLE INPUT)
"use client";
import { Users } from "lucide-react";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/app/stores";
import { useAllUsers } from "@/hooks/useAllUsers";
import { SearchInput, useSearchInput } from "@/components/ui/SearchInput";
import { useEffect } from "react";

export function SearchHeader() {
  const { isDarkMode } = useThemeColors();
  const { searchQuery, setSearchQuery } = useUserStore();
  const { users, isLoading: usersLoading } = useAllUsers();

  // Use the search input hook
  const { value, onValueChange, isSearching, clear } = useSearchInput(
    searchQuery,
    {
      debounceMs: 200,
      onSearch: setSearchQuery,
    }
  );

  // Sync with external changes
  useEffect(() => {
    if (searchQuery !== value) {
      onValueChange(searchQuery);
    }
  }, [searchQuery, value, onValueChange]);

  const totalUsers = users?.length || 0;
  const hasSearch = value.length > 0;

  return (
    <div
      className={cn(
        "sticky top-0 z-40 backdrop-blur-xl border-b transition-colors",
        isDarkMode
          ? "bg-gray-900/90 border-gray-800"
          : "bg-white/95 border-gray-200"
      )}
    >
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Main Search Bar */}
        <div className="flex items-center gap-4">
          <SearchInput
            value={value}
            onValueChange={onValueChange}
            placeholder="Search musicians, instruments, genres, locations..."
            size="md"
            variant="filled"
            showClearButton={true}
            showSearchIcon={true}
            isLoading={isSearching}
            className="flex-1"
            ariaLabel="Search musicians"
          />
        </div>

        {/* Enhanced Quick Stats */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Users
                className={cn(
                  "size-4 transition-colors",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )}
              />
              <span
                className={cn(
                  "text-sm font-medium transition-colors",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}
              >
                {usersLoading ? (
                  <span className="inline-flex items-center gap-1">
                    <div className="size-2 rounded-full bg-amber-500 animate-pulse" />
                    Loading musicians...
                  </span>
                ) : (
                  `${totalUsers} musician${totalUsers !== 1 ? "s" : ""}`
                )}
              </span>
            </div>

            {/* Search query indicator */}
            {hasSearch && (
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs px-2 py-1 rounded-full border transition-colors",
                    isDarkMode
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                  )}
                >
                  Searching: "{value}"
                </span>
              </div>
            )}
          </div>

          {/* Results count when searching */}
          {hasSearch && (
            <div
              className={cn(
                "text-xs font-medium transition-colors",
                isDarkMode ? "text-amber-400" : "text-amber-600"
              )}
            >
              {usersLoading ? "Searching..." : "Press Enter to search"}
            </div>
          )}
        </div>

        {/* Search progress indicator */}
        {(isSearching || usersLoading) && hasSearch && (
          <div className="mt-3">
            <div className="w-full h-0.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 animate-pulse transition-all duration-300"
                style={{ width: isSearching ? "60%" : "90%" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchHeader;
