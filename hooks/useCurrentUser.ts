// hooks/useCurrentUser.ts
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useUserStore } from "@/stores/useUserStore";
import { useEffect } from "react";

export function useCurrentUser() {
  const { userId, isLoaded } = useAuth();
  const { setUser, setLoading, user: storeUser } = useUserStore();

  const user = useQuery(
    api.controllers.user.getCurrentUser,
    userId ? { clerkId: userId } : "skip"
  );

  console.log("useCurrentUser debug:", {
    clerkUserId: userId,
    convexUser: user,
    isLoaded,
    storeUser: storeUser?._id
  });

  // Sync user data to Zustand store
  useEffect(() => {
    if (isLoaded && userId && user) {
      console.log("🔄 Syncing user to Zustand store");
      setUser(user);
    } else if (isLoaded && !userId) {
      console.log("🔄 Clearing user from Zustand store (no userId)");
      setUser(null);
    }
  }, [user, userId, isLoaded, setUser]);

  // Sync loading state
  useEffect(() => {
    const isLoading = !isLoaded || (userId && user === undefined);
    setLoading(isLoading);
  }, [isLoaded, userId, user, setLoading]);

  return {
    user,
    isLoading: !isLoaded || (userId && user === undefined),
    isAuthenticated: !!userId,
  };
}
