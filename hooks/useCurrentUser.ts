// hooks/useCurrentUser.ts
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { toUserId } from "@/utils";
import { useUserStore } from "@/app/stores";
import { useEffect } from "react";

// Get current user
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

  return {
    user, // From Convex - source of truth
    isLoading: !isLoaded || (userId && user === undefined),
    isAuthenticated: !!userId,
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
