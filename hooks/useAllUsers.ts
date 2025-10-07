// hooks/useAllUsers.ts
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useMemo } from "react";
import { useCurrentUser } from "./useCurrentUser";
import { Doc } from "@/convex/_generated/dataModel";

// Use the correct table name - "users" not "user"
type User = Doc<"users">;

export function useAllUsers() {
  const users = useQuery(api.controllers.user.getAllUsers);
  const { user: currentUser } = useCurrentUser();

  const musicians = useMemo(
    () => users?.filter((user) => user.isMusician) || [],
    [users]
  );

  const clients = useMemo(
    () => users?.filter((user) => user.isClient) || [],
    [users]
  );

  const proUsers = useMemo(
    () =>
      users?.filter(
        (user) => user.tier === "pro" && user.tierStatus === "active"
      ) || [],
    [users]
  );

  const usersByTier = useMemo(
    () =>
      users?.reduce(
        (acc, user) => {
          const tier = user.tier;
          if (!acc[tier]) acc[tier] = [];
          acc[tier].push(user);
          return acc;
        },
        {} as Record<string, User[]>
      ) || {},
    [users]
  );

  // Memoized filtered musicians for current user
  const filteredMusicians = useMemo(() => {
    if (!users || !currentUser) return [];

    return users.filter((myuser: User) => {
      // Early returns for basic filtering
      if (
        myuser._id === currentUser._id ||
        !myuser.instrument ||
        myuser.isClient === true ||
        myuser.isMusician !== true
      ) {
        return false;
      }

      // Role-based filtering
      const currentUserRole = currentUser.roleType;
      if (currentUserRole && myuser.roleType !== currentUserRole) {
        return false;
      }

      return true;
    });
  }, [users, currentUser]);

  // Nearby musicians based on location
  const nearbyMusicians = useMemo(() => {
    if (!users || !currentUser) return [];

    const normalizeString = (str?: string) =>
      str
        ?.trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") || "";

    const currentCity = normalizeString(currentUser.city);
    const currentInstrument = normalizeString(currentUser.instrument);

    return users.filter((myuser: User) => {
      if (!myuser.isMusician || myuser._id === currentUser._id) {
        return false;
      }

      const targetCity = normalizeString(myuser.city);
      const targetInstrument = normalizeString(myuser.instrument);

      // Match by city if available
      if (currentCity && targetCity) {
        return targetCity === currentCity;
      }

      // Fallback: match by instrument if city not available
      if (!currentCity && currentInstrument && targetInstrument) {
        return targetInstrument === currentInstrument;
      }

      return false;
    });
  }, [users, currentUser]);

  return {
    // All users
    users: users || [],

    // Filtered users
    filteredMusicians,
    nearbyMusicians,
    musicians,
    clients,
    proUsers,
    usersByTier,

    // Status
    isLoading: users === undefined,
    isEmpty: users?.length === 0,

    // Counts
    totalCount: users?.length || 0,
    musiciansCount: musicians.length,
    clientsCount: clients.length,
    proUsersCount: proUsers.length,
    filteredMusiciansCount: filteredMusicians.length,
    nearbyMusiciansCount: nearbyMusicians.length,
  };
}
