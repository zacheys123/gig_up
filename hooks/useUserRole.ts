// hooks/useUserRole.ts
import { useCurrentUser } from "./useCurrentUser";

export const useUserRole = () => {
  const { user } = useCurrentUser();

  const isMusician = user?.isMusician || false;
  const isClient = user?.isClient || false;
  const isBooker = user?.isBooker || false;

  // User can have multiple roles, but these are the primary ones
  const hasRole = isMusician || isClient || isBooker;

  // Get the primary role for display purposes
  const primaryRole = isMusician
    ? "musician"
    : isClient
      ? "client"
      : isBooker
        ? "booker"
        : "none";

  // Check if user has specific roles
  const hasRoles = (roles: Array<"musician" | "client" | "booker">) => {
    return roles.some((role) => {
      if (role === "musician") return isMusician;
      if (role === "client") return isClient;
      if (role === "booker") return isBooker;
      return false;
    });
  };

  // Get all active roles
  const activeRoles = [
    ...(isMusician ? ["musician"] : []),
    ...(isClient ? ["client"] : []),
    ...(isBooker ? ["booker"] : []),
  ];

  return {
    isMusician,
    isClient,
    isBooker,
    hasRole,
    primaryRole,
    hasRoles,
    activeRoles,
    // Aliases for convenience
    isArtist: isMusician,
    isVenue: isClient,
    isTalentManager: isBooker,
  };
};
