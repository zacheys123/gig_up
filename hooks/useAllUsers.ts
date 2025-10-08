// hooks/useAllUsers.ts
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useMemo } from "react";
import { useCurrentUser } from "./useCurrentUser";
import { Doc } from "@/convex/_generated/dataModel";

type User = Doc<"users">;

export function useAllUsers() {
  const users = useQuery(api.controllers.user.getAllUsers);
  const { user: currentUser } = useCurrentUser();

  const musicians = useMemo(
    () => users?.filter((user) => user.isMusician) || [],
    [users]
  );

  // Filter musicians by role type
  const musiciansByRole = useMemo(() => {
    if (!users) return {};

    return users.reduce(
      (acc, user) => {
        if (user.isMusician && user.roleType) {
          const role = user.roleType;
          if (!acc[role]) acc[role] = [];
          acc[role].push(user);
        }
        return acc;
      },
      {} as Record<string, User[]>
    );
  }, [users]);

  // Get all musicians (without filtering out those without instruments)
  const allMusicians = useMemo(() => {
    if (!users) return [];
    return users.filter(
      (user) =>
        user.isMusician &&
        user._id !== currentUser?._id && // Exclude current user
        !user.isClient
    );
  }, [users, currentUser]);

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
      // Only show other musicians in the same city
      if (!myuser.isMusician || myuser._id === currentUser._id) {
        return false;
      }

      const targetCity = normalizeString(myuser.city);

      // Match by city if available
      if (currentCity && targetCity) {
        return targetCity === currentCity;
      }

      return false;
    });
  }, [users, currentUser]);

  // Get musicians by specific role
  const getMusiciansByRole = (roleType: string) => {
    if (!users) return [];
    return users.filter(
      (user) =>
        user.isMusician &&
        user.roleType === roleType &&
        user._id !== currentUser?._id
    );
  };

  return {
    // All users
    users: users || [],

    // Filtered users
    filteredMusicians: allMusicians, // Now includes all musicians
    nearbyMusicians,
    musicians: allMusicians,
    musiciansByRole,
    clients: users?.filter((user) => user.isClient) || [],
    proUsers:
      users?.filter(
        (user) => user.tier === "pro" && user.tierStatus === "active"
      ) || [],

    // Helper functions
    getMusiciansByRole,

    // Status
    isLoading: users === undefined,
    isEmpty: users?.length === 0,

    // Counts
    totalCount: users?.length || 0,
    musiciansCount: allMusicians.length,
    clientsCount: users?.filter((user) => user.isClient).length || 0,
    proUsersCount:
      users?.filter(
        (user) => user.tier === "pro" && user.tierStatus === "active"
      ).length || 0,
    nearbyMusiciansCount: nearbyMusicians.length,
  };
}
