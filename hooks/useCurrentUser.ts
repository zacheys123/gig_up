// hooks/useCurrentUser.ts
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useCurrentUser() {
  const user = useQuery(api.controllers.user.getCurrentUser);
  
  return {
    user,
    isLoading: user === undefined, // undefined means still loading
    isAuthenticated: user !== null && user !== undefined,
  };
}