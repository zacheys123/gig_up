// hooks/useAllUsers.ts
"use client";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useMemo } from "react";
import { useCurrentUser } from "./useCurrentUser";
import { Doc } from "@/convex/_generated/dataModel";
import { useCheckTrial } from "./useCheckTrial";
import { useUserTrialStatus } from "./useUserTrialStatus";

type User = Doc<"users">;

export function useAllUsers() {
  const users = useQuery(api.controllers.user.getAllUsers);
  const { user: currentUser } = useCurrentUser();
  const { isUserActive } = useUserTrialStatus(); // ← Use the new hook here

  // Filter function to exclude banned users and only include pro/grace period users
  const isValidUser = (user: User) => {
    return isUserActive(user);
  };

  const musicians = useMemo(
    () => users?.filter((user) => user.isMusician && isValidUser(user)) || [],
    [users, isValidUser]
  );

  // Filter musicians by role type
  const musiciansByRole = useMemo(() => {
    if (!users) return {};

    return users.reduce(
      (acc, user) => {
        if (user.isMusician && user.roleType && isValidUser(user)) {
          const role = user.roleType;
          if (!acc[role]) acc[role] = [];
          acc[role].push(user);
        }
        return acc;
      },
      {} as Record<string, User[]>
    );
  }, [users, isValidUser]);

  // Get all musicians (without filtering out those without instruments)
  const allMusicians = useMemo(() => {
    if (!users) return [];
    return users.filter(
      (user) =>
        user.isMusician &&
        isValidUser(user) &&
        user._id !== currentUser?._id && // Exclude current user
        !user.isClient
    );
  }, [users, currentUser, isValidUser]);

  // Nearby musicians based on location only
  const nearbyMusicians = useMemo(() => {
    if (!users || !currentUser) return [];

    const normalizeString = (str?: string) =>
      str
        ?.trim()
        ?.toLowerCase()
        ?.normalize("NFD")
        ?.replace(/[\u0300-\u036f]/g, "") || "";

    const currentCity = normalizeString(currentUser.city);

    return users.filter((myuser: User) => {
      // Only show other musicians in the same city who are valid
      if (
        !myuser.isMusician ||
        myuser._id === currentUser._id ||
        !isValidUser(myuser)
      ) {
        return false;
      }

      const targetCity = normalizeString(myuser.city);

      // Match by city if available
      if (currentCity && targetCity) {
        return targetCity === currentCity;
      }

      return false;
    });
  }, [users, currentUser, isValidUser]);

  // Get musicians by specific role
  const getMusiciansByRole = (roleType: string) => {
    if (!users) return [];
    return users.filter(
      (user) =>
        user.isMusician &&
        isValidUser(user) &&
        user.roleType === roleType &&
        user._id !== currentUser?._id
    );
  };

  return {
    // All users (filtered)
    users: users?.filter(isValidUser) || [],

    // Filtered users
    filteredMusicians: allMusicians, // Now includes all valid musicians
    nearbyMusicians,
    musicians: allMusicians,
    musiciansByRole,
    clients: users?.filter((user) => user.isClient && isValidUser(user)) || [],
    proUsers:
      users?.filter(
        (user) =>
          user.tier === "pro" &&
          user.tierStatus === "active" &&
          isValidUser(user)
      ) || [],

    // Helper functions
    getMusiciansByRole,

    // Status
    isLoading: users === undefined,
    isEmpty: users?.length === 0,

    // Counts
    totalCount: users?.filter(isValidUser).length || 0,
    musiciansCount: allMusicians.length,
    clientsCount:
      users?.filter((user) => user.isClient && isValidUser(user)).length || 0,
    proUsersCount:
      users?.filter(
        (user) =>
          user.tier === "pro" &&
          user.tierStatus === "active" &&
          isValidUser(user)
      ).length || 0,
    nearbyMusiciansCount: nearbyMusicians.length,
  };
}

export function useAllUsersWithPresence() {
  const { user: currentUser } = useCurrentUser();
  const users = useQuery(api.presence.getAllUsersWithPresence);
  const { isUserActive } = useUserTrialStatus(); // ← Use the new hook

  return users?.filter((u) => u?._id !== currentUser?._id && isUserActive(u));
}
