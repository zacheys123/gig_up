// hooks/useSearch.ts
import { useState, useMemo } from "react";
import { UserProps } from "@/types/userTypes";
import { searchFunc } from "@/utils";

interface UseUserSearchProps {
  users: UserProps[];
  currentUser?: UserProps; // Make it optional
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

  // Process users (remove current user and admins)
  const processedUsers = useMemo(() => {
    return users.filter((user: UserProps) => {
      const isNotCurrentUser = user.clerkId !== currentUser?.clerkId; // Use optional chaining
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

  // Apply filters
  const filteredUsers = useMemo(() => {
    return searchedUsers.filter((user) => {
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

      return true;
    });
  }, [searchedUsers, activeFilters]);

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

  // Calculate active filter count
  const activeFilterCount = Object.values(activeFilters).filter((v) =>
    Array.isArray(v) ? v.length > 0 : v === true
  ).length;

  return {
    processedUsers,
    searchedUsers,
    filteredUsers,
    activeFilters,
    activeFilterCount, // Add this
    handleFilterChange,
    clearFilters,
    totalUsers: processedUsers.length,
    filteredCount: filteredUsers.length,
  };
}
