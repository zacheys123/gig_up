// hooks/useCurrentUser.ts (Enhanced version)
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { toUserId } from "@/utils";
import { useUserStore } from "@/app/stores";
import { useEffect, useCallback } from "react";

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
    // You could also use queryClient.invalidateQueries here if needed
    console.log("Refetching user data...");
  }, []);

  return {
    user, // From Convex - source of truth
    isLoading: !isLoaded || (userId && user === undefined),
    isAuthenticated: !!userId,
    refetch, // Manual refetch function
  };
}

// Social actions as custom hooks
export const useSocialActions = () => {
  const toggleFollowMutation = useMutation(api.controllers.user.followUser);
  const likeVideo = useMutation(api.controllers.user.likeVideo);
  const unlikeVideo = useMutation(api.controllers.user.unlikeVideo);

  return {
    toggleFollow: async (userId: string, targetId: string) => {
      const tId = toUserId(targetId);
      await toggleFollowMutation({ userId, targetUserId: tId });
    },

    toggleVideoLike: async (videoId: string) => {
      const { user: currentUser } = useCurrentUser();
      const isLiked = currentUser?.likedVideos?.includes(videoId);

      if (isLiked) {
        await unlikeVideo({ videoId });
      } else {
        await likeVideo({ videoId });
      }
    },
  };
};

// Selector-style hook for checking if current user is following target user
export const useIsFollowing = (targetUserId: string) => {
  const id = toUserId(targetUserId);
  const { user: currentUser } = useCurrentUser();
  return currentUser?.followings?.includes(id) || false;
};
