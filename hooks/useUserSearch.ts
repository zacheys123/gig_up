// hooks/useUserSearch.ts
import { useState, useMemo, useCallback } from "react";
import { UserProps } from "@/types/userTypes";
import { searchFunc } from "@/utils";

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
  });

  // YOUR FEATURED USER ALGORITHM - useCallback to memoize it
  const isFeaturedUser = useCallback((user: UserProps): boolean => {
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
  }, []);

  // YOUR TRENDING INSTRUMENTS LOGIC
  const getTrendingInstruments = useCallback((users: UserProps[]): string[] => {
    const instrumentViews: Record<string, number> = {};

    users.forEach((user) => {
      if (user.instrument) {
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

  // Process users
  const processedUsers = useMemo(() => {
    if (!users) return [];

    return users.filter((user: UserProps) => {
      const isNotCurrentUser = user.clerkId !== currentUser?.clerkId;
      const isNotAdmin = !user.isAdmin;
      return isNotCurrentUser && isNotAdmin;
    });
  }, [users, currentUser]);

  // Apply search
  const searchedUsers = useMemo(() => {
    if (searchQuery) {
      return searchFunc(processedUsers, searchQuery);
    }
    return processedUsers;
  }, [processedUsers, searchQuery]);

  // YOUR COMPLETE FILTER LOGIC WITH DISCOVERY FEATURES
  const applyAdditionalFilters = useCallback(
    (usersToFilter: UserProps[]) => {
      return usersToFilter.filter((user) => {
        // Client/Musician filter
        if (activeFilters.clientOnly && !user.isClient) return false;
        if (activeFilters.musicianOnly && !user.isMusician) return false;

        // Role type filter
        if (
          activeFilters.roleType.length > 0 &&
          (!user.roleType || !activeFilters.roleType.includes(user.roleType))
        ) {
          return false;
        }

        // Instrument filter
        if (
          activeFilters.instrument.length > 0 &&
          (!user.instrument ||
            !activeFilters.instrument.includes(user.instrument))
        ) {
          return false;
        }

        // DISCOVERY FEATURES - YOUR ORIGINAL LOGIC
        if (activeFilters.discoveryType.length > 0) {
          const matchesDiscovery = activeFilters.discoveryType.some(
            (discoveryType) => {
              switch (discoveryType) {
                case "new-talents":
                  return (
                    user._creationTime &&
                    Date.now() - user._creationTime < 30 * 24 * 60 * 60 * 1000
                  );

                case "featured-this-week":
                  return isFeaturedUser(user); // Using the function here

                case "near-you":
                  return user.city === currentUser?.city;

                case "similar-style":
                  return user.musiciangenres?.some((genre) =>
                    currentUser?.musiciangenres?.includes(genre)
                  );

                case "trending-instruments":
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
    setActiveFilters(filters);
  };

  const clearFilters = () => {
    setActiveFilters({
      roleType: [],
      instrument: [],
      discoveryType: [],
      clientOnly: false,
      musicianOnly: false,
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
    isFeaturedUser, // ✅ Make sure this is returned
    totalUsers: processedUsers.length,
    filteredCount: filteredUsers.length,
  };
}
