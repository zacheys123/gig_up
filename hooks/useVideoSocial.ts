// hooks/useVideoSocial.ts - OPTIMIZED
import { useQuery, useMutation } from "convex/react";
import { useState, useCallback, useMemo } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface VideoWithUser {
  _id: Id<"videos">;
  userId: string;
  title: string;
  description: string;
  videoUrl: string;
  videoType: "profile" | "gig" | "casual" | "promo" | "other";
  tags: string[];
  isPublic: boolean;
  likes: number;
  views: number;
  comments: number;
  createdAt: number;
  canSeeVideo?: boolean;
  user?: {
    _id: Id<"users">;
    username: string;
    firstname?: string;
    picture?: string;
    instrument?: string;
  };
}

interface VideoFilters {
  videoType?: VideoWithUser["videoType"] | "all";
  tags?: string[];
  sortBy?: "newest" | "popular" | "trending";
  timeframe?: "day" | "week" | "month" | "all";
  searchQuery?: string;
}

const PAGE_SIZE = 20;

export const useVideoSocial = (clerkId?: string) => {
  const { user: currentUser } = useCurrentUser();

  // State
  const [filters, setFilters] = useState<VideoFilters>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [offset, setOffset] = useState(0);

  // Memoize query params
  const queryParams = useMemo(
    () => ({
      limit: PAGE_SIZE,
      offset,
      videoType: filters.videoType === "all" ? undefined : filters.videoType,
      currentUserId: clerkId,
    }),
    [offset, filters.videoType, clerkId]
  );

  const trendingParams = useMemo(
    () => ({
      limit: 20,
      timeframe: filters.timeframe,
    }),
    [filters.timeframe]
  );

  // Queries
  const publicVideosData = useQuery(
    api.controllers.videos.getPublicVideos,
    queryParams
  );
  const trendingVideosData = useQuery(
    api.controllers.videos.getTrendingVideos,
    trendingParams
  );

  // Current user's liked videos
  const currentUserLikedVideos = useMemo(
    () => currentUser?.likedVideos || [],
    [currentUser?.likedVideos]
  );

  // Memoize videos with user data and like status
  const videosWithUserData = useMemo(() => {
    if (!publicVideosData) return [];

    return (publicVideosData as unknown as VideoWithUser[]).map((video) => ({
      ...video,
      isLiked: currentUserLikedVideos.includes(video._id),
    }));
  }, [publicVideosData, currentUserLikedVideos]);

  const trendingVideosWithUserData = useMemo(() => {
    if (!trendingVideosData) return [];

    return (trendingVideosData as unknown as VideoWithUser[]).map((video) => ({
      ...video,
      isLiked: currentUserLikedVideos.includes(video._id),
    }));
  }, [trendingVideosData, currentUserLikedVideos]);

  // Mutations (memoized)
  const likeMutation = useMutation(api.controllers.videos.likeVideo);
  const unlikeMutation = useMutation(api.controllers.videos.unlikeVideo);
  const addCommentMutation = useMutation(api.controllers.comments.addComment);
  const deleteCommentMutation = useMutation(
    api.controllers.comments.deleteComment
  );
  const incrementViewsMutation = useMutation(
    api.controllers.videos.incrementVideoViews
  );

  // Action wrappers
  const likeVideo = useCallback(
    async (videoId: Id<"videos">) => {
      if (!clerkId) return { success: false, error: "Not authenticated" };

      setLoadingStates((prev) => ({ ...prev, [`like-${videoId}`]: true }));
      try {
        await likeMutation({ videoId, userId: clerkId });
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      } finally {
        setLoadingStates((prev) => ({ ...prev, [`like-${videoId}`]: false }));
      }
    },
    [clerkId, likeMutation]
  );

  const unlikeVideo = useCallback(
    async (videoId: Id<"videos">) => {
      if (!clerkId) return { success: false, error: "Not authenticated" };

      setLoadingStates((prev) => ({ ...prev, [`unlike-${videoId}`]: true }));
      try {
        await unlikeMutation({ videoId, userId: clerkId });
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      } finally {
        setLoadingStates((prev) => ({ ...prev, [`unlike-${videoId}`]: false }));
      }
    },
    [clerkId, unlikeMutation]
  );

  // Filtered videos
  const filteredVideos = useMemo(() => {
    let videos = videosWithUserData.filter(
      (video) => video.canSeeVideo !== false
    );

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      videos = videos.filter(
        (v) =>
          v.title.toLowerCase().includes(query) ||
          v.description.toLowerCase().includes(query) ||
          v.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          v.user?.username.toLowerCase().includes(query) ||
          v.user?.firstname?.toLowerCase().includes(query)
      );
    }

    if (filters.tags?.length) {
      videos = videos.filter((v) =>
        filters.tags!.some((tag) => v.tags.includes(tag))
      );
    }

    // Sorting
    if (filters.sortBy === "popular") {
      videos.sort((a, b) => b.likes + b.views - (a.likes + a.views));
    } else if (filters.sortBy === "trending") {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      videos = videos.filter((v) => v.createdAt >= weekAgo);
      videos.sort((a, b) => b.likes * 2 + b.views - (a.likes * 2 + a.views));
    } else {
      videos.sort((a, b) => b.createdAt - a.createdAt);
    }

    return videos;
  }, [videosWithUserData, filters]);

  // Available tags
  const availableTags = useMemo(() => {
    const allTags = filteredVideos.flatMap((v) => v.tags).filter(Boolean);
    return Array.from(new Set(allTags)).sort();
  }, [filteredVideos]);

  // Pagination
  const hasMore = videosWithUserData.length === PAGE_SIZE;

  const loadMoreVideos = useCallback(() => {
    setOffset((prev) => prev + PAGE_SIZE);
  }, [PAGE_SIZE]);

  const updateFilter = useCallback((key: keyof VideoFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setOffset(0);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setOffset(0);
  }, []);

  const isLoading = useCallback(
    (key: string) => loadingStates[key] || false,
    [loadingStates]
  );

  const result = useMemo(
    () => ({
      videos: filteredVideos,
      trendingVideos: trendingVideosWithUserData,
      availableTags,
      filters,
      updateFilter,
      clearFilters,
      likeVideo,
      unlikeVideo,
      addComment: addCommentMutation,
      deleteComment: deleteCommentMutation,
      incrementViews: incrementViewsMutation,
      isLoading,
      hasVideos: filteredVideos.length > 0,
      totalVideos: filteredVideos.length,
      loadMoreVideos,
      hasMore,
    }),
    [
      filteredVideos,
      trendingVideosWithUserData,
      availableTags,
      filters,
      updateFilter,
      clearFilters,
      likeVideo,
      unlikeVideo,
      addCommentMutation,
      deleteCommentMutation,
      incrementViewsMutation,
      isLoading,
      loadMoreVideos,
      hasMore,
    ]
  );

  return result;
};
