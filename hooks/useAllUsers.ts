// hooks/useAllUsers.ts
"use client";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useMemo } from "react";
import { useCurrentUser } from "./useCurrentUser";
import { Doc } from "@/convex/_generated/dataModel";
import { useUserTrialStatus } from "./useUserTrialStatus";

type User = Doc<"users">;

export function useAllUsers() {
  const users = useQuery(api.controllers.user.getAllUsers);
  const { user: currentUser } = useCurrentUser();
  const { isUserActive, getUserTierStatus } = useUserTrialStatus();

  // ✅ STRICT FILTER: Only include active users (paid or in grace period)
  const isValidUser = (user: User) => {
    const isActive = isUserActive(user);
    const tierStatus = getUserTierStatus(user);

    // Debug logging for filtered users
    if (!isActive && user.firstname) {
      console.log(`🚫 Filtered out user: ${user.firstname}`, {
        tier: user.tier,
        tierStatus: user.tierStatus,
        creationTime: user._creationTime,
        status: tierStatus.status,
      });
    }

    return isActive;
  };

  // ✅ FIXED: All users for search (with strict filtering)
  const allUsersForSearch = useMemo(() => {
    if (!users) return [];

    const filteredUsers = users.filter(
      (user) =>
        isValidUser(user) && user._id !== currentUser?._id && !user.isAdmin
    );

    console.log(
      `🔍 User filtering: ${users.length} total, ${filteredUsers.length} active`
    );

    return filteredUsers;
  }, [users, currentUser, isValidUser]);

  // Musicians only (filtered)
  const musicians = useMemo(
    () => users?.filter((user) => user.isMusician && isValidUser(user)) || [],
    [users, isValidUser]
  );

  // Clients only (filtered)
  const clients = useMemo(() => {
    if (!users) return [];
    return users.filter(
      (user) =>
        user.isClient && isValidUser(user) && user._id !== currentUser?._id
    );
  }, [users, currentUser, isValidUser]);

  // Bookers only (filtered)
  const bookers = useMemo(() => {
    if (!users) return [];
    return users.filter(
      (user) =>
        user.isBooker && isValidUser(user) && user._id !== currentUser?._id
    );
  }, [users, currentUser, isValidUser]);

  // ... rest of your existing code

  return {
    // All users (strictly filtered)
    users: users?.filter(isValidUser) || [],

    // ✅ Users for search (includes only active users of all types)
    searchUsers: allUsersForSearch,

    // Filtered users by type
    filteredMusicians: musicians,
    musicians,
    clients,
    bookers,

    // Status
    isLoading: users === undefined,
    isEmpty: users?.length === 0,

    // Counts
    totalCount: allUsersForSearch.length,
    musiciansCount: musicians.length,
    clientsCount: clients.length,
    bookersCount: bookers.length,
  };
}
export function useAllUsersWithPresence() {
  const { user: currentUser } = useCurrentUser();
  const users = useQuery(api.presence.getAllUsersWithPresence);
  const { isUserActive } = useUserTrialStatus();

  return users?.filter((u) => u?._id !== currentUser?._id && isUserActive(u));
}
