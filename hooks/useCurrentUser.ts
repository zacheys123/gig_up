import { useUserStore } from "@/app/stores";
import { useSubscriptionStore } from "@/app/stores/useSubscriptionStore";
// Import your subscription store
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useEffect } from "react";

// hooks/useCurrentUser.ts
export function useCurrentUser() {
  const { userId, isLoaded } = useAuth();
  const { setUser } = useUserStore();
  const { setSubscription } = useSubscriptionStore(); // Get subscription store setter

  const user = useQuery(
    api.controllers.user.getCurrentUser,
    userId ? { clerkId: userId } : "skip"
  );

  // Sync to Zustand user store
  useEffect(() => {
    if (isLoaded && userId && user) {
      setUser(user);
    } else if (isLoaded && !userId) {
      setUser(null);
    }
  }, [user, userId, isLoaded, setUser]);

  // Sync subscription data to subscription store
  // Updated hook without plan/price IDs
  useEffect(() => {
    if (user) {
      const subscriptionData = {
        tier: user.tier,
        status: user.tierStatus,
        currentPeriodStart: user._creationTime,
        currentPeriodEnd: user.nextBillingDate,
        cancelAtPeriodEnd: user.tierStatus === "canceled",
      };
      setSubscription(subscriptionData);
    } else {
      setSubscription(null);
    }
  }, [user, setSubscription]);
  return {
    user, // From Convex - source of truth
    isLoading: !isLoaded || (userId && user === undefined),
    isAuthenticated: !!userId,
  };
}
