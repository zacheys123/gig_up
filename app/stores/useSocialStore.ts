// stores/useSocialStore.ts
import { create } from "zustand";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";

interface SocialState {
  // State
  following: string[];
  followers: string[];
  likedVideos: string[];
  likedGigs: string[];

  // Actions
  followUser: (targetUserId: string) => Promise<void>;
  unfollowUser: (targetUserId: string) => Promise<void>;
  likeVideo: (videoId: string) => Promise<void>;
  unlikeVideo: (videoId: string) => Promise<void>;
  likeGig: (gigId: string) => Promise<void>;
  unlikeGig: (gigId: string) => Promise<void>;

  // Getters
  isFollowing: (userId: string) => boolean;
  isVideoLiked: (videoId: string) => boolean;
  isGigLiked: (gigId: string) => boolean;

  // Sync with Convex
  syncWithConvex: (userId: string) => void;
}

export const useSocialStore = create<SocialState>((set, get) => ({
  // Initial state
  following: [],
  followers: [],
  likedVideos: [],
  likedGigs: [],

  // Follow/Unfollow actions
  followUser: async (targetUserId: string) => {
    try {
      const { following } = get();

      // Optimistic update
      set({ following: [...following, targetUserId] });

      // Call Convex mutation
      // Note: You'll need to implement this mutation in your Convex backend
      // await useMutation(api.social.followUser)({ targetUserId });
    } catch (error) {
      // Revert optimistic update on error
      const { following } = get();
      set({ following: following.filter((id) => id !== targetUserId) });
      console.error("Error following user:", error);
      throw error;
    }
  },

  unfollowUser: async (targetUserId: string) => {
    try {
      const { following } = get();

      // Optimistic update
      set({ following: following.filter((id) => id !== targetUserId) });

      // Call Convex mutation
      // await useMutation(api.social.unfollowUser)({ targetUserId });
    } catch (error) {
      // Revert optimistic update on error
      const { following } = get();
      set({ following: [...following, targetUserId] });
      console.error("Error unfollowing user:", error);
      throw error;
    }
  },

  // Like/Unlike actions for videos
  likeVideo: async (videoId: string) => {
    try {
      const { likedVideos } = get();

      // Optimistic update
      set({ likedVideos: [...likedVideos, videoId] });

      // Call Convex mutation
      // await useMutation(api.social.likeVideo)({ videoId });
    } catch (error) {
      const { likedVideos } = get();
      set({ likedVideos: likedVideos.filter((id) => id !== videoId) });
      console.error("Error liking video:", error);
      throw error;
    }
  },

  unlikeVideo: async (videoId: string) => {
    try {
      const { likedVideos } = get();

      // Optimistic update
      set({ likedVideos: likedVideos.filter((id) => id !== videoId) });

      // Call Convex mutation
      // await useMutation(api.social.unlikeVideo)({ videoId });
    } catch (error) {
      const { likedVideos } = get();
      set({ likedVideos: [...likedVideos, videoId] });
      console.error("Error unliking video:", error);
      throw error;
    }
  },

  // Like/Unlike actions for gigs
  likeGig: async (gigId: string) => {
    try {
      const { likedGigs } = get();

      // Optimistic update
      set({ likedGigs: [...likedGigs, gigId] });

      // Call Convex mutation
      // await useMutation(api.social.likeGig)({ gigId });
    } catch (error) {
      const { likedGigs } = get();
      set({ likedGigs: likedGigs.filter((id) => id !== gigId) });
      console.error("Error liking gig:", error);
      throw error;
    }
  },

  unlikeGig: async (gigId: string) => {
    try {
      const { likedGigs } = get();

      // Optimistic update
      set({ likedGigs: likedGigs.filter((id) => id !== gigId) });

      // Call Convex mutation
      // await useMutation(api.social.unlikeGig)({ gigId });
    } catch (error) {
      const { likedGigs } = get();
      set({ likedGigs: [...likedGigs, gigId] });
      console.error("Error unliking gig:", error);
      throw error;
    }
  },

  // Getters
  isFollowing: (userId: string) => {
    return get().following.includes(userId);
  },

  isVideoLiked: (videoId: string) => {
    return get().likedVideos.includes(videoId);
  },

  isGigLiked: (gigId: string) => {
    return get().likedGigs.includes(gigId);
  },

  // Sync with Convex data
  syncWithConvex: (userId: string) => {
    // This would be called when user data is loaded from Convex
    // to sync the local state with the server state
    // const userData = useQuery(api.user.getCurrentUser, { userId });
    // if (userData) {
    //   set({
    //     following: userData.followings || [],
    //     followers: userData.followers || [],
    //     likedVideos: userData.likedVideos || [],
    //   });
    // }
  },
}));
