// Instead of useUserStore, use this:
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth, useUser } from "@clerk/nextjs";
import { toUserId } from "@/utils";
import { useUserStore } from "@/app/stores";
import { useSubscriptionStore } from "@/app/stores/useSubscriptionStore";
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
  const follow = useMutation(api.controllers.user.followUser);
  const likeVideo = useMutation(api.controllers.user.likeVideo);
  const unlikeVideo = useMutation(api.controllers.user.unlikeVideo);

  return {
    toggleFollow: async (targetId: string) => {
      const targetUserId = toUserId(targetId);
      await follow({ targetUserId });
    },
    toggleVideoLike: async (videoId: string) => {
      // You'd need to check current state or create a toggle mutation
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

// Selector-style hooks
export const useIsFollowing = (targetUserId: string) => {
  const { user: currentUser } = useCurrentUser();
  return currentUser?.followings?.includes(targetUserId) || false;
};
