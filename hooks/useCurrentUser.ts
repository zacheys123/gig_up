// hooks/useCurrentUser.ts
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";

export function useCurrentUser() {
  const { userId, isLoaded } = useAuth();

  const user = useQuery(
    api.controllers.user.getCurrentUser,
    userId ? { clerkId: userId } : "skip"
  );

  console.log("useCurrentUser debug:", {
    clerkUserId: userId,
    convexUser: user,
    isLoaded,
  });

  return {
    user,
    isLoading: !isLoaded || (userId && user === undefined),
    isAuthenticated: !!userId,
  };
}
