// hooks/useUserRole.ts - OPTIONAL, only if you really need it
import { useCurrentUser } from "./useCurrentUser";

export function useUserRole() {
  const { user } = useCurrentUser();

  return {
    isMusician: user?.isMusician || false,
    isClient: user?.isClient || false,
    isAdmin: user?.isAdmin || false,
    hasRole: !!(user?.isMusician || user?.isClient || user?.isAdmin),
  };
}
