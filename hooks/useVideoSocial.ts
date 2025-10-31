// hooks/useVideoSocial.ts
import { useQuery, useMutation } from "convex/react";
import { useState, useCallback, useMemo } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export interface VideoSocialActions {
  likeVideo: (
    videoId: Id<"videos">
  ) => Promise<{ success: boolean; error?: string }>;
  unlikeVideo: (
    videoId: Id<"videos">
  ) => Promise<{ success: boolean; error?: string }>;
  addComment: (
    videoId: Id<"videos">,
    content: string,
    parentCommentId?: Id<"comments">
  ) => Promise<{ success: boolean; error?: string }>;
  deleteComment: (
    commentId: Id<"comments">
  ) => Promise<{ success: boolean; error?: string }>;
  incrementViews: (
    videoId: Id<"videos">
  ) => Promise<{ success: boolean; error?: string }>;
}

export interface VideoFilters {
  videoType?: "profile" | "gig" | "casual" | "promo" | "other" | "all";
  tags?: string[];
  sortBy?: "newest" | "popular" | "trending";
  timeframe?: "day" | "week" | "month" | "all";
  searchQuery?: string;
}

export const useVideoSocial = (currentUserId?: Id<"users">) => {
  // State
  const [filters, setFilters] = useState<VideoFilters>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );

  // Queries
  const publicVideos = useQuery(api.controllers.videos.getPublicVideos, {
    limit: 50,
    videoType: filters.videoType === "all" ? undefined : filters.videoType,
  });

  const trendingVideos = useQuery(api.controllers.videos.getTrendingVideos, {
    limit: 20,
    timeframe: filters.timeframe,
  });

  const userVideos = useQuery(
    api.controllers.videos.getUserProfileVideos,
    currentUserId ? { userId: currentUserId.toString() } : "skip"
  );

  // Mutations
  const likeMutation = useMutation(api.controllers.videos.likeVideo);
  const unlikeMutation = useMutation(api.controllers.videos.unlikeVideo);
  const addCommentMutation = useMutation(api.controllers.comments.addComment);
  const deleteCommentMutation = useMutation(
    api.controllers.comments.deleteComment
  );
  const incrementViewsMutation = useMutation(
    api.controllers.videos.incrementVideoViews
  );

  // Filtered videos
  const filteredVideos = useMemo(() => {
    let videos = publicVideos || [];

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      videos = videos.filter(
        (video) =>
          video.title.toLowerCase().includes(query) ||
          video.description.toLowerCase().includes(query) ||
          video.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply tag filter
    if (filters.tags && filters.tags.length > 0) {
      videos = videos.filter((video) =>
        filters.tags!.some((tag) => video.tags.includes(tag))
      );
    }

    // Apply sorting
    if (filters.sortBy === "popular") {
      videos = [...videos].sort(
        (a, b) => b.likes + b.views - (a.likes + a.views)
      );
    } else if (filters.sortBy === "trending") {
      // Recent videos with high engagement
      const now = Date.now();
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      videos = [...videos]
        .filter((video) => video.createdAt >= weekAgo)
        .sort((a, b) => {
          const aEngagement = a.likes * 2 + a.views;
          const bEngagement = b.likes * 2 + b.views;
          return bEngagement - aEngagement;
        });
    } else {
      // Default: newest first
      videos = [...videos].sort((a, b) => b.createdAt - a.createdAt);
    }

    return videos;
  }, [publicVideos, filters]);

  // Available tags from all videos
  const availableTags = useMemo(() => {
    const allTags = (publicVideos || [])
      .flatMap((video) => video.tags)
      .filter(Boolean);

    return Array.from(new Set(allTags)).sort();
  }, [publicVideos]);

  // Actions
  const likeVideo = useCallback(
    async (videoId: Id<"videos">) => {
      if (!currentUserId) return { success: false, error: "Not authenticated" };

      const key = `like-${videoId}`;
      setLoadingStates((prev) => ({ ...prev, [key]: true }));

      try {
        await likeMutation({
          videoId,
          userId: currentUserId.toString(),
          isViewerInGracePeriod: false, // You can pass this based on user tier
        });
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      } finally {
        setLoadingStates((prev) => ({ ...prev, [key]: false }));
      }
    },
    [currentUserId, likeMutation]
  );

  const unlikeVideo = useCallback(
    async (videoId: Id<"videos">) => {
      if (!currentUserId) return { success: false, error: "Not authenticated" };

      const key = `unlike-${videoId}`;
      setLoadingStates((prev) => ({ ...prev, [key]: true }));

      try {
        await unlikeMutation({
          videoId: videoId.toString(),
          userId: currentUserId.toString(),
        });
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      } finally {
        setLoadingStates((prev) => ({ ...prev, [key]: false }));
      }
    },
    [currentUserId, unlikeMutation]
  );

  const addComment = useCallback(
    async (
      videoId: Id<"videos">,
      content: string,
      parentCommentId?: Id<"comments">
    ) => {
      if (!currentUserId) return { success: false, error: "Not authenticated" };

      const key = `comment-${videoId}`;
      setLoadingStates((prev) => ({ ...prev, [key]: true }));

      try {
        await addCommentMutation({
          userId: currentUserId.toString(),
          videoId,
          content,
          parentCommentId,
          isViewerInGracePeriod: false,
        });
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      } finally {
        setLoadingStates((prev) => ({ ...prev, [key]: false }));
      }
    },
    [currentUserId, addCommentMutation]
  );

  const deleteComment = useCallback(
    async (commentId: Id<"comments">) => {
      if (!currentUserId) return { success: false, error: "Not authenticated" };

      const key = `delete-comment-${commentId}`;
      setLoadingStates((prev) => ({ ...prev, [key]: true }));

      try {
        await deleteCommentMutation({
          commentId,
          userId: currentUserId.toString(),
        });
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      } finally {
        setLoadingStates((prev) => ({ ...prev, [key]: false }));
      }
    },
    [currentUserId, deleteCommentMutation]
  );

  const incrementViews = useCallback(
    async (videoId: Id<"videos">) => {
      const key = `view-${videoId}`;
      setLoadingStates((prev) => ({ ...prev, [key]: true }));

      try {
        await incrementViewsMutation({
          videoId: videoId.toString(),
          currentUserId,
        });
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      } finally {
        setLoadingStates((prev) => ({ ...prev, [key]: false }));
      }
    },
    [currentUserId, incrementViewsMutation]
  );

  // Helper functions
  const updateFilter = useCallback((key: keyof VideoFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const isLoading = (key: string) => loadingStates[key] || false;

  return {
    // Data
    videos: filteredVideos,
    trendingVideos: trendingVideos || [],
    userVideos: userVideos || [],
    availableTags,

    // Filters
    filters,
    updateFilter,
    clearFilters,

    // Actions
    likeVideo,
    unlikeVideo,
    addComment,
    deleteComment,
    incrementViews,

    // State
    isLoading,
    hasVideos: filteredVideos.length > 0,
    totalVideos: filteredVideos.length,
  };
};
