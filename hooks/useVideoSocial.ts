import { useQuery, useMutation } from "convex/react";
import { useState, useCallback, useMemo, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export interface VideoFilters {
  videoType?: "profile" | "gig" | "casual" | "promo" | "other" | "all";
  tags?: string[];
  sortBy?: "newest" | "popular" | "trending";
  timeframe?: "day" | "week" | "month" | "all";
  searchQuery?: string;
}

export const useVideoSocial = (clerkId?: string) => {
  // ---------------- State ----------------
  const [filters, setFilters] = useState<VideoFilters>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [videos, setVideos] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // ---------------- Queries ----------------
  const trendingVideos = useQuery(api.controllers.videos.getTrendingVideos, {
    limit: 20,
    timeframe: filters.timeframe,
  });

  // ---------------- Mutations ----------------
  const likeMutation = useMutation(api.controllers.videos.likeVideo);
  const unlikeMutation = useMutation(api.controllers.videos.unlikeVideo);
  const addCommentMutation = useMutation(api.controllers.comments.addComment);
  const deleteCommentMutation = useMutation(
    api.controllers.comments.deleteComment
  );
  const incrementViewsMutation = useMutation(
    api.controllers.videos.incrementVideoViews
  );

  // ---------------- Fetch Videos ----------------
  const fetchVideos = useCallback(
    async (page: number) => {
      const limit = 20;
      try {
        const data = await api.controllers.videos.getPublicVideos({
          limit,
          offset: (page - 1) * limit,
          videoType:
            filters.videoType === "all" ? undefined : filters.videoType,
          searchQuery: filters.searchQuery,
          tags: filters.tags,
        });
        if (data.length < limit) setHasMore(false);
        setVideos((prev) => [...prev, ...data]);
      } catch (error) {
        console.error("Failed to load videos:", error);
      }
    },
    [filters]
  );

  // Load first page on filters change
  useEffect(() => {
    setVideos([]);
    setPage(1);
    setHasMore(true);
    fetchVideos(1);
  }, [filters, fetchVideos]);

  const loadMoreVideos = useCallback(() => {
    if (!hasMore) return;
    fetchVideos(page + 1);
    setPage((prev) => prev + 1);
  }, [fetchVideos, page, hasMore]);

  // ---------------- Actions ----------------
  const likeVideo = useCallback(
    async (videoId: Id<"videos">) => {
      if (!clerkId) return { success: false, error: "Not authenticated" };
      const key = `like-${videoId}`;
      setLoadingStates((prev) => ({ ...prev, [key]: true }));

      try {
        await likeMutation({
          videoId,
          userId: clerkId,
          isViewerInGracePeriod: false,
        });
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      } finally {
        setLoadingStates((prev) => ({ ...prev, [key]: false }));
      }
    },
    [clerkId, likeMutation]
  );

  const unlikeVideo = useCallback(
    async (videoId: Id<"videos">) => {
      if (!clerkId) return { success: false, error: "Not authenticated" };
      const key = `unlike-${videoId}`;
      setLoadingStates((prev) => ({ ...prev, [key]: true }));

      try {
        await unlikeMutation({ videoId: videoId.toString(), userId: clerkId });
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      } finally {
        setLoadingStates((prev) => ({ ...prev, [key]: false }));
      }
    },
    [clerkId, unlikeMutation]
  );

  const addComment = useCallback(
    async (
      videoId: Id<"videos">,
      content: string,
      parentCommentId?: Id<"comments">
    ) => {
      if (!clerkId) return { success: false, error: "Not authenticated" };
      const key = `comment-${videoId}`;
      setLoadingStates((prev) => ({ ...prev, [key]: true }));

      try {
        await addCommentMutation({
          userId: clerkId,
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
    [clerkId, addCommentMutation]
  );

  const deleteComment = useCallback(
    async (commentId: Id<"comments">) => {
      if (!clerkId) return { success: false, error: "Not authenticated" };
      const key = `delete-comment-${commentId}`;
      setLoadingStates((prev) => ({ ...prev, [key]: true }));

      try {
        await deleteCommentMutation({ commentId, userId: clerkId });
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      } finally {
        setLoadingStates((prev) => ({ ...prev, [key]: false }));
      }
    },
    [clerkId, deleteCommentMutation]
  );

  const incrementViews = useCallback(
    async (videoId: Id<"videos">) => {
      const key = `view-${videoId}`;
      setLoadingStates((prev) => ({ ...prev, [key]: true }));

      try {
        await incrementViewsMutation({ videoId: videoId.toString() });
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      } finally {
        setLoadingStates((prev) => ({ ...prev, [key]: false }));
      }
    },
    [incrementViewsMutation]
  );

  // ---------------- Filters ----------------
  const updateFilter = useCallback((key: keyof VideoFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const isLoading = (key: string) => loadingStates[key] || false;

  // ---------------- Available Tags ----------------
  const availableTags = useMemo(() => {
    const allTags = videos.flatMap((v) => v.tags).filter(Boolean);
    return Array.from(new Set(allTags)).sort();
  }, [videos]);

  return {
    // Data
    videos,
    trendingVideos: trendingVideos || [],
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
    hasVideos: videos.length > 0,
    totalVideos: videos.length,
    loadMoreVideos,
    hasMore,
  };
};
