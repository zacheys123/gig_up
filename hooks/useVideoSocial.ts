// hooks/useVideoSocial.ts
import { useQuery, useMutation } from "convex/react";
import { useState, useCallback, useMemo } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/useCurrentUser"; // Add this import

// Update your VideoWithUser interface to match Convex response
// hooks/useVideoSocial.ts
export interface VideoWithUser {
  _id: Id<"videos">;
  _creationTime: number;
  userId: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail?: string;
  videoType: "profile" | "gig" | "casual" | "promo" | "other";
  tags: string[];
  isPublic: boolean;
  likes: number;
  views: number;
  comments: number;
  createdAt: number;
  updatedAt: number;
  user?: {
    _id: Id<"users">;
    clerkId: string;
    username: string;
    firstname?: string;
    lastname?: string;
    picture?: string;
    instrument?: string;
    city?: string;
  };
  canSeeVideo?: boolean; // Add this
  isLiked?: boolean;
}

export interface VideoFilters {
  videoType?: "profile" | "gig" | "casual" | "promo" | "other" | "all";
  tags?: string[];
  sortBy?: "newest" | "popular" | "trending";
  timeframe?: "day" | "week" | "month" | "all";
  searchQuery?: string;
}

export const useVideoSocial = (clerkId?: string) => {
  const PAGE_SIZE = 20;
  const { user: currentUser } = useCurrentUser(); // Get current user with likedVideos

  // ---------------- State ----------------
  const [filters, setFilters] = useState<VideoFilters>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [offset, setOffset] = useState(0);

  // ---------------- Queries ----------------
  const publicVideosData = useQuery(api.controllers.videos.getPublicVideos, {
    limit: PAGE_SIZE,
    offset,
    videoType: filters.videoType === "all" ? undefined : filters.videoType,
    currentUserId: clerkId, // Pass current user ID for visibility checks
  });

  const trendingVideosData = useQuery(
    api.controllers.videos.getTrendingVideos,
    {
      limit: 20,
      timeframe: filters.timeframe,
    }
  );

  // Safely cast the data with proper fallbacks
  const publicVideos: VideoWithUser[] = useMemo(() => {
    if (!publicVideosData) return [];
    return publicVideosData as unknown as VideoWithUser[];
  }, [publicVideosData]);

  const trendingVideos: VideoWithUser[] = useMemo(() => {
    if (!trendingVideosData) return [];
    return trendingVideosData as unknown as VideoWithUser[];
  }, [trendingVideosData]);

  // Get current user's liked videos
  const currentUserLikedVideos = useMemo(() => {
    return currentUser?.likedVideos || [];
  }, [currentUser?.likedVideos]);

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

  // ---------------- Compute isLiked for videos ----------------
  const videosWithUserData = useMemo(() => {
    if (!publicVideosData) return [];

    return publicVideosData.map((video) => ({
      ...video,
      isLiked: currentUserLikedVideos.includes(video._id),
      // canSeeVideo is already computed in the backend
    }));
  }, [publicVideosData, currentUserLikedVideos]);
  const trendingVideosWithUserData = useMemo(() => {
    return trendingVideos.map((video) => ({
      ...video,
      isLiked: currentUserLikedVideos.includes(video._id),
    }));
  }, [trendingVideos, currentUserLikedVideos]);

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
    setOffset(0); // reset pagination on filter change
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setOffset(0);
  }, []);

  const isLoading = (key: string) => loadingStates[key] || false;

  // ---------------- Pagination Helpers ----------------
  // hooks/useVideoSocial.ts

  // Fix the hasMore calculation
  const hasMore = useMemo(() => {
    // If we got fewer videos than requested, we've reached the end
    return publicVideos.length === PAGE_SIZE;
  }, [publicVideos]);

  // Also fix the loadMoreVideos to reset properly
  const loadMoreVideos = useCallback(() => {
    console.log("🔄 Loading more videos, current offset:", offset);
    setOffset((prev) => prev + PAGE_SIZE);
  }, [PAGE_SIZE, offset]);
  // ---------------- Derived Data ----------------
  const availableTags = useMemo(() => {
    const allTags = (videosWithUserData || [])
      .flatMap((v) => v.tags)
      .filter(Boolean);
    return Array.from(new Set(allTags)).sort();
  }, [videosWithUserData]);

  const filteredVideos = useMemo(() => {
    let videos = videosWithUserData;

    // Only show videos that the user can see
    videos = videos.filter((video) => video.canSeeVideo !== false);

    // ... rest of your filtering logic
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      videos = videos.filter(
        (v) =>
          v.title.toLowerCase().includes(query) ||
          v.description.toLowerCase().includes(query) ||
          v.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          v.user?.username.toLowerCase().includes(query) ||
          v.user?.firstname?.toLowerCase().includes(query) ||
          v.user?.lastname?.toLowerCase().includes(query)
      );
    }

    if (filters.tags?.length) {
      videos = videos.filter((v) =>
        filters.tags!.some((tag) => v.tags.includes(tag))
      );
    }

    if (filters.sortBy === "popular") {
      videos = [...videos].sort(
        (a, b) => b.likes + b.views - (a.likes + a.views)
      );
    } else if (filters.sortBy === "trending") {
      const now = Date.now();
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      videos = [...videos]
        .filter((v) => v.createdAt >= weekAgo)
        .sort((a, b) => b.likes * 2 + b.views - (a.likes * 2 + a.views));
    } else {
      videos = [...videos].sort((a, b) => b.createdAt - a.createdAt);
    }

    return videos;
  }, [videosWithUserData, filters]);
  console.log("🔍 VIDEO DEBUG:", {
    offset,
    hasPublicVideosData: !!publicVideosData,
    publicVideosCount: publicVideosData?.length || 0,
    filters,
    hasMore,
    totalVideos: publicVideosData?.length || 0,
  });
  return {
    videos: filteredVideos,
    trendingVideos: trendingVideosWithUserData, // Use the computed trending videos
    availableTags,
    filters,
    updateFilter,
    clearFilters,
    likeVideo,
    unlikeVideo,
    addComment,
    deleteComment,
    incrementViews,
    isLoading,
    hasVideos: filteredVideos.length > 0,
    totalVideos: filteredVideos.length,
    loadMoreVideos,
    hasMore,
  };
};
