"use client";
import { useState, useMemo, useCallback } from "react";
import { UserProps } from "@/types/userTypes";
import { searchFunc } from "@/utils";
import { useFeatureFlags } from "./useFeatureFlag";
import { read } from "fs";

interface UseUserSearchProps {
  users: UserProps[];
  currentUser?: any;
  searchQuery: string;
}

export function useUserSearch({
  users,
  currentUser,
  searchQuery,
}: UseUserSearchProps) {
  const [activeFilters, setActiveFilters] = useState({
    roleType: [] as string[],
    instrument: [] as string[],
    discoveryType: [] as string[],
    clientOnly: false,
    musicianOnly: false,
    bookerOnly: false,
  });

  const { isBookerEnabled } = useFeatureFlags();
  // Featured user algorithm
  const isFeaturedUser = useCallback((user: UserProps): boolean => {
    try {
      // For clients and bookers, use simpler criteria
      if (user.isClient || user.isBooker) {
        const views = user.profileViews?.totalCount || 0;
        // ✅ More lenient threshold for clients
        return views >= 3;
      }

      // For musicians, use engagement metrics
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
  }, []);

  // Trending instruments logic - only for musicians
  const getTrendingInstruments = useCallback((users: UserProps[]): string[] => {
    const instrumentViews: Record<string, number> = {};

    users.forEach((user) => {
      if (user.isMusician && user.instrument) {
        const views = user.profileViews?.totalCount || 0;
        instrumentViews[user.instrument] =
          (instrumentViews[user.instrument] || 0) + views;
      }
    });

    return Object.entries(instrumentViews)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([instrument]) => instrument);
  }, []);

  // Add in processedUsers
  const processedUsers = useMemo(() => {
    if (!users) {
      console.log("No users received");
      return [];
    }

    const result = users.filter((user: UserProps) => {
      const isNotCurrentUser = user.clerkId !== currentUser?.clerkId;
      const isNotAdmin = !user.isAdmin;
      const isValidType = user.isMusician || user.isClient || user.isBooker;

      const passes = isNotCurrentUser && isNotAdmin && isValidType;

      if (!passes) {
        console.log("User filtered out:", user.firstname, {
          isNotCurrentUser,
          isNotAdmin,
          isValidType,
        });
      }

      return passes;
    });

    console.log("Processed users count:", result.length);
    return result;
  }, [users, currentUser]);

  // Apply search
  const searchedUsers = useMemo(() => {
    if (searchQuery) {
      return searchFunc(processedUsers, searchQuery, isBookerEnabled());
    }
    return processedUsers;
  }, [processedUsers, searchQuery]);

  // ✅ FIXED: Complete filter logic with proper client handling
  const applyAdditionalFilters = useCallback(
    (usersToFilter: UserProps[]) => {
      return usersToFilter.filter((user) => {
        // ✅ FIXED: Account type filtering logic
        const { clientOnly, musicianOnly, bookerOnly } = activeFilters;

        // If no account type filter is selected, show all valid users
        if (!clientOnly && !musicianOnly && !bookerOnly) {
          // User must be at least one valid type
          const isValidUserType =
            user.isMusician || user.isClient || user.isBooker;
          if (!isValidUserType) return false;
        }
        // If "Clients Only" is selected
        else if (clientOnly) {
          if (!user.isClient) return false;
        }
        // If "Musicians Only" is selected
        else if (musicianOnly) {
          if (!user.isMusician) return false;
        }
        // If "Bookers Only" is selected
        else if (bookerOnly) {
          if (!user.isBooker) return false;
        }

        // ✅ FIXED: Role type filter - only apply to musicians
        if (activeFilters.roleType.length > 0) {
          // If user is a musician, check role type
          if (user.isMusician) {
            if (
              !user.roleType ||
              !activeFilters.roleType.includes(user.roleType)
            ) {
              return false;
            }
          }
          // If user is not a musician, but role filter is set, exclude them
          else if (activeFilters.roleType.length > 0) {
            return false;
          }
        }

        // ✅ FIXED: Instrument filter - only apply to musicians
        if (activeFilters.instrument.length > 0) {
          // If user is a musician, check instrument
          if (user.isMusician) {
            if (
              !user.instrument ||
              !activeFilters.instrument.includes(user.instrument)
            ) {
              return false;
            }
          }
          // If user is not a musician, but instrument filter is set, exclude them
          else if (activeFilters.instrument.length > 0) {
            return false;
          }
        }

        // ✅ FIXED: Discovery features - handle different user types
        // ✅ FIXED: Discovery features - handle different user types
        if (activeFilters.discoveryType.length > 0) {
          const matchesDiscovery = activeFilters.discoveryType.some(
            (discoveryType) => {
              switch (discoveryType) {
                case "new-talents":
                  return (
                    user._creationTime &&
                    // ✅ Allow clients too
                    (user?.isMusician || user?.isClient || user?.isBooker) &&
                    Date.now() - user._creationTime < 30 * 24 * 60 * 60 * 1000
                  );

                case "featured-this-week":
                  // ✅ Update isFeaturedUser to work better with clients
                  return isFeaturedUser(user);

                case "near-you":
                  return user.city === currentUser?.city;

                case "similar-style":
                  // For clients: match based on interests
                  if (user.isClient) {
                    // ✅ Return true for clients if they have clientType, or show all if not
                    return user.clientType ? user.clientType : true;
                  }
                  // For musicians: match based on genres
                  return user.musiciangenres?.some((genre) =>
                    currentUser?.musiciangenres?.includes(genre)
                  );

                case "trending-instruments":
                  // ✅ Skip this filter for non-musicians
                  if (!user.isMusician) return false;
                  const trendingInstruments =
                    getTrendingInstruments(usersToFilter);
                  return trendingInstruments.includes(user.instrument || "");

                default:
                  return false;
              }
            }
          );

          if (!matchesDiscovery) return false;
        }

        return true;
      });
    },
    [activeFilters, currentUser, isFeaturedUser, getTrendingInstruments]
  );

  // Apply all filters
  const filteredUsers = useMemo(() => {
    return applyAdditionalFilters(searchedUsers);
  }, [searchedUsers, applyAdditionalFilters]);

  const handleFilterChange = (filters: typeof activeFilters) => {
    console.log("Filters changed:", filters);
    setActiveFilters(filters);
  };

  const clearFilters = () => {
    setActiveFilters({
      roleType: [],
      instrument: [],
      discoveryType: [],
      clientOnly: false,
      musicianOnly: false,
      bookerOnly: false,
    });
  };

  // Active filter count
  const activeFilterCount = Object.values(activeFilters).filter((v) =>
    Array.isArray(v) ? v.length > 0 : v === true
  ).length;

  return {
    processedUsers,
    searchedUsers,
    filteredUsers,
    activeFilters,
    activeFilterCount,
    handleFilterChange,
    clearFilters,
    isFeaturedUser,
    totalUsers: processedUsers.length,
    filteredCount: filteredUsers.length,
  };
}
