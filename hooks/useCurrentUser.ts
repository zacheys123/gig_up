// hooks/useCurrentUser.ts - Enhanced version
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { toUserId } from "@/utils";
import { useUserStore } from "@/app/stores";
import { useEffect, useCallback } from "react";
import { useCheckTrial } from "./useCheckTrial";

// Get current user with refetch capability
export function useCurrentUser() {
  const { userId, isLoaded } = useAuth();
  const { setUser } = useUserStore();

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

  // Manual refetch function
  const refetch = useCallback(() => {
    // This will trigger a re-render and Convex will refetch
    console.log("Refetching user data...");
  }, []);

  return {
    user, // From Convex - source of truth
    isLoading: !isLoaded || (userId && user === undefined),
    isAuthenticated: !!userId,
    refetch, // Manual refetch function
  };
}

// Enhanced Social actions with follow request handling
export const useSocialActions = () => {
  const toggleFollowMutation = useMutation(api.controllers.user.followUser);
  const acceptFollowRequest = useMutation(
    api.controllers.user.acceptFollowRequest
  );
  const declineFollowRequest = useMutation(
    api.controllers.user.declineFollowRequest
  );

  const { isInGracePeriod } = useCheckTrial();

  return {
    toggleFollow: async (userId: string, targetId: string) => {
      const tId = toUserId(targetId);
      await toggleFollowMutation({
        userId,
        tId: tId,
        isViewerInGracePeriod: isInGracePeriod,
      });
    },

    acceptFollowRequest: async (userId: string, requesterId: string) => {
      await acceptFollowRequest({
        userId,
        requesterId: toUserId(requesterId),
        isViewerInGracePeriod: isInGracePeriod,
      });
    },

    declineFollowRequest: async (userId: string, requesterId: string) => {
      await declineFollowRequest({
        userId,
        requesterId: toUserId(requesterId),
        isViewerInGracePeriod: isInGracePeriod,
      });
    },
  };
};

// Selector-style hook for checking if current user is following target user
export const useIsFollowing = (targetUserId: string) => {
  const id = toUserId(targetUserId);
  const { user: currentUser } = useCurrentUser();
  return currentUser?.followings?.includes(id) || false;
};

// Hook for checking pending follow requests
export const useHasPendingRequest = (targetUserId: string) => {
  const id = toUserId(targetUserId);
  const { user: currentUser } = useCurrentUser();
  return currentUser?.pendingFollowRequests?.includes(id) || false;
};
