"use client";

// components/VideoCard.tsx
import React, {
  useState,
  useCallback,
  forwardRef,
  useEffect,
  useRef,
} from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Heart,
  MessageCircle,
  Share,
  Music,
  Clock,
  Eye,
  MoreHorizontal,
  X,
  Zap,
  TrendingUp,
  Calendar,
  Star,
  Users,
  Music2,
  MapPin,
  Award,
  Crown,
  Verified,
} from "lucide-react";

import { useVideoComments } from "@/hooks/useVideoComments.ts";
import { ViewTracker } from "@/lib/viewTracking";
import { VideoComments } from "./VideoComment";
import { formatTimeAgo } from "@/utils";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface VideoCardProps {
  video: any;
  currentUserId?: string;
  onLike: (videoId: Id<"videos">) => void;
  onUnlike: (videoId: Id<"videos">) => void;
  onView: (videoId: Id<"videos">) => void;
  onSelect?: (videoId: Id<"videos">) => void;
  isSelected?: boolean;
  isLoading?: boolean;
  className?: string;
}
interface UserStats {
  followerCount?: number;
  gigsCompleted?: number;
  rating?: number;
  isPro?: boolean;
  isVerified?: boolean;
  tier?: "free" | "pro" | "elite";
  instrument?: string;
  location?: string;
  memberSince?: number;
}
export const VideoCard = forwardRef<HTMLDivElement, VideoCardProps>(
  (
    {
      video,
      currentUserId,
      onLike,
      onUnlike,
      onView,
      onSelect,
      isSelected = false,
      isLoading = false,
      className,
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isLiked, setIsLiked] = useState(video.isLiked || false);
    const [hasViewed, setHasViewed] = useState(false);
    const [showComments, setShowComments] = useState(false); // Add comments state
    const { colors, isDarkMode } = useThemeColors();
    const router = useRouter();
    const { user: currentUser } = useCurrentUser();
    // Use the comments hook
    const { comments, addComment, deleteComment, totalComments } =
      useVideoComments(video._id, currentUserId, showComments);

    const handleLike = useCallback(() => {
      setIsLiked(!isLiked);
      if (isLiked) {
        onUnlike(video._id);
      } else {
        onLike(video._id);
      }
    }, [video._id, isLiked, onLike, onUnlike]);
    const handleView = useCallback(() => {
      let shouldRecord = true;

      if (currentUserId) {
        shouldRecord = ViewTracker.shouldRecordView(video._id, currentUserId);

        if (shouldRecord) {
          const viewRecorded = ViewTracker.recordView(video._id, currentUserId);
          if (viewRecorded) {
            onView(video._id);
            setHasViewed(true);
          }
        }
      } else {
        onView(video._id);
      }

      if (onSelect) onSelect(video._id);
    }, [video._id, currentUserId, onView, onSelect]);
    // Comment handlers
    const handleAddComment = useCallback(
      async (content: string, parentCommentId?: Id<"comments">) => {
        const result = await addComment(content, parentCommentId);
        return result;
      },
      [addComment]
    );

    const handleDeleteComment = useCallback(
      async (commentId: Id<"comments">) => {
        const result = await deleteComment(commentId);
        return result;
      },
      [deleteComment]
    );

    const handleToggleComments = useCallback(() => {
      setShowComments(!showComments);
    }, [showComments]);

    // Check on component mount if user has already viewed this video
    React.useEffect(() => {
      if (currentUserId) {
        const viewed = ViewTracker.hasViewedRecently(video._id, currentUserId);
        setHasViewed(viewed);
      }
    }, [video._id, currentUserId]);

    const formatCount = (count: number) => {
      if (count >= 1_000_000) return (count / 1_000_000).toFixed(1) + "M";
      if (count >= 1_000) return (count / 1_000).toFixed(1) + "K";
      return count.toString();
    };
    const [timeAgo, setTimeAgo] = useState(formatTimeAgo(video._creationTime));

    const handleUserClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!video.user) return;

        const { clerkId, firstname, lastname } = video.user;
        const isOwnProfile = clerkId === currentUser?.clerkId;

        // Smart routing based on context
        if (isOwnProfile) {
          // Current user: Go to videos with upload CTA prominent
          router.push(
            `/search/allvideos/${clerkId}/*${firstname}${lastname}?view=manage`
          );
        } else {
          // Other users: Go to videos with discovery focus
          router.push(
            `/search/allvideos/${clerkId}/*${firstname}${lastname}?view=browse`
          );
        }
      },
      [router, video.user, currentUser?.clerkId]
    );
    useEffect(() => {
      const interval = setInterval(() => {
        setTimeAgo(formatTimeAgo(video._creationTime));
      }, 60000);
      return () => clearInterval(interval);
    }, [video._creationTime]);

    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleVideoClick = useCallback(() => {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
        } else {
          videoRef.current.play();
          setIsPlaying(true);
        }
      }
      handleView(); // Track view on click
    }, [isPlaying, handleView]);

    // Auto-play on hover (optional)
    useEffect(() => {
      if (isHovered && videoRef.current) {
        videoRef.current.play().then(() => setIsPlaying(true));
      } else if (!isHovered && videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }, [isHovered]);

    function getVideoTypeStyle(videoType: string, isDarkMode: boolean) {
      const styles = {
        profile: isDarkMode
          ? "bg-blue-900/30 text-blue-300"
          : "bg-blue-100 text-blue-700",
        gig: isDarkMode
          ? "bg-purple-900/30 text-purple-300"
          : "bg-purple-100 text-purple-700",
        promo: isDarkMode
          ? "bg-amber-900/30 text-amber-300"
          : "bg-amber-100 text-amber-700",
        other: isDarkMode
          ? "bg-gray-900/30 text-gray-300"
          : "bg-gray-100 text-gray-700",
      };

      return styles[videoType as keyof typeof styles] || styles.other;
    }
    return (
      <>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "group rounded-2xl overflow-hidden transition-all duration-500 ease-out border",
            colors.card,
            colors.border,
            isDarkMode
              ? "hover:shadow-[0_4px_20px_rgba(255,255,255,0.05)]"
              : "hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)]",
            // Make the card consistent and Facebook-like
            "w-full max-w-[700px] mx-auto my-4 md:my-6",
            "lg:p-4 lg:rounded-3xl lg:border lg:bg-background/40 backdrop-blur-sm",
            className
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className={cn(
              "flex items-center justify-between px-4 py-3",
              "border-b cursor-pointer transition-all duration-200",
              colors.border,
              "hover:bg-gray-50 dark:hover:bg-gray-800/50 active:scale-[0.98]"
            )}
            onClick={handleUserClick}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Avatar with status indicator */}
              <div className="relative flex-shrink-0">
                <img
                  src={video.user?.picture || "/default-avatar.png"}
                  alt={video.user?.username}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm transition-transform duration-200 group-hover:scale-105"
                />
                {/* Online status indicator */}
                {video.user?.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>

              {/* User info with stats */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p
                    className={cn(
                      "font-bold text-sm truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors",
                      colors.text
                    )}
                  >
                    {video.user?.username}
                  </p>

                  {/* Verification & Badges */}
                  <div className="flex items-center gap-1">
                    {video.user?.isVerified && (
                      <Verified className="w-4 h-4 text-blue-500 fill-current" />
                    )}
                    {video.user?.tier === "pro" && (
                      <Crown className="w-4 h-4 text-amber-500 fill-current" />
                    )}
                    {video.user?.tier === "elite" && (
                      <Award className="w-4 h-4 text-purple-500 fill-current" />
                    )}
                  </div>
                </div>

                {/* Secondary info row */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Location */}
                  {video.user?.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-500" />
                      <span className={cn("text-xs", colors.textMuted)}>
                        {video.user.location}
                      </span>
                    </div>
                  )}

                  {/* Instrument */}
                  {video.user?.instrument && (
                    <div className="flex items-center gap-1">
                      <Music2 className="w-3 h-3 text-gray-500" />
                      <span className={cn("text-xs", colors.textMuted)}>
                        {video.user.instrument}
                      </span>
                    </div>
                  )}

                  {/* Time ago */}
                  <span className={cn("text-xs", colors.textMuted)}>
                    {timeAgo}
                  </span>

                  {/* Video type badge */}
                  {video.videoType && video.videoType !== "casual" && (
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-medium capitalize",
                        getVideoTypeStyle(video.videoType, isDarkMode)
                      )}
                    >
                      {video.videoType}
                    </span>
                  )}
                </div>

                {/* Stats row - only show on hover or for prominent users */}
                {(isHovered || video.user?.followerCount > 1000) && (
                  <div className="flex items-center gap-3 mt-1">
                    {/* Followers */}
                    {video.user?.followerCount !== undefined && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-gray-500" />
                        <span
                          className={cn("text-xs font-medium", colors.text)}
                        >
                          {formatCount(video.user.followerCount)}
                        </span>
                      </div>
                    )}

                    {/* Rating */}
                    {video.user?.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-current" />
                        <span
                          className={cn("text-xs font-medium", colors.text)}
                        >
                          {video.user.rating.toFixed(1)}
                        </span>
                      </div>
                    )}

                    {/* Gigs completed */}
                    {video.user?.gigsCompleted &&
                      video.user.gigsCompleted > 0 && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-500" />
                          <span
                            className={cn("text-xs font-medium", colors.text)}
                          >
                            {video.user.gigsCompleted} gigs
                          </span>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Action buttons and status */}
            <div
              className="flex items-center gap-2 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Performance metrics */}
              <div className="flex items-center gap-3 mr-2">
                {/* Engagement rate indicator */}
                {video.engagementRate > 10 && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className={cn("text-xs font-medium", colors.text)}>
                      Hot
                    </span>
                  </div>
                )}

                {/* Quick actions */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    colors.hoverBg,
                    colors.text
                  )}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </motion.button>
              </div>

              {/* View status badge */}
              {hasViewed ? (
                <div
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1",
                    isDarkMode
                      ? "bg-green-900/30 text-green-300 border border-green-800/50"
                      : "bg-green-100 text-green-700 border border-green-200"
                  )}
                >
                  <Eye className="w-3 h-3" />
                  Viewed
                </div>
              ) : (
                <div
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1",
                    isDarkMode
                      ? "bg-blue-900/30 text-blue-300 border border-blue-800/50"
                      : "bg-blue-100 text-blue-700 border border-blue-200"
                  )}
                >
                  <Zap className="w-3 h-3" />
                  New
                </div>
              )}
            </div>
          </div>
          {/* VIDEO AREA */}
          <div
            className={cn(
              "relative w-full overflow-hidden bg-black/10",
              // Aspect ratios for different devices
              "aspect-[9/16] sm:aspect-[16/9] lg:aspect-square"
            )}
          >
            {video.thumbnail ? (
              <motion.img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
                animate={{ scale: isHovered ? 1.05 : 1 }}
                transition={{ duration: 0.5 }}
              />
            ) : (
              <div
                className={cn(
                  "w-full h-full flex items-center justify-center",
                  isDarkMode
                    ? "bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900"
                    : "bg-gradient-to-br from-gray-100 via-blue-50 to-purple-50"
                )}
              >
                {" "}
                <video
                  ref={videoRef}
                  src={video.videoUrl} // Make sure this prop exists
                  poster={video.thumbnail}
                  className="w-full h-full object-cover"
                  controls={false}
                  playsInline
                  muted
                  loop
                  onClick={handleVideoClick}
                />
                {video.thumbnail && (
                  <Music
                    className={cn(
                      "w-14 h-14",
                      isDarkMode ? "text-gray-600" : "text-gray-400"
                    )}
                  />
                )}
              </div>
            )}

            {/* Overlay gradient */}
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity",
                isHovered ? "opacity-100" : "opacity-80"
              )}
            />

            {/* Play Button */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ opacity: isHovered || !isPlaying ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg"
                onClick={handleVideoClick}
              >
                {isPlaying ? (
                  <div className="flex gap-1">
                    <div className="w-2 h-6 bg-gray-900"></div>
                    <div className="w-2 h-6 bg-gray-900"></div>
                  </div>
                ) : (
                  <Play className="w-6 h-6 text-gray-900 ml-1 fill-current" />
                )}
              </motion.div>
            </motion.div>

            {/* Info chips */}
            <div className="absolute bottom-3 left-3 right-3 flex gap-2">
              <div className="flex items-center gap-1 bg-black/60 rounded-full px-2.5 py-1">
                <Eye className="w-3 h-3 text-white" />
                <span className="text-xs text-white">
                  {formatCount(video.views || 0)}
                </span>
              </div>
              {/* {video.duration && (
                <div className="flex items-center gap-1 bg-black/60 rounded-full px-2.5 py-1">
                  <Clock className="w-3 h-3 text-white" />
                  <span className="text-xs text-white">{video.duration}</span>
                </div>
              )} */}
            </div>

            <div
              className="absolute inset-0 cursor-pointer"
              onClick={handleView}
            />
          </div>

          {/* ACTION BAR */}
          <div
            className="px-4 py-3 border-t border-b"
            style={{ borderColor: isDarkMode ? "#333" : "#eee" }}
          >
            <div className="flex items-center justify-between">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleLike}
                className={cn(
                  "flex items-center gap-2",
                  isLiked ? "text-red-500" : colors.text
                )}
              >
                <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
                <span className="text-sm">{formatCount(video.likes || 0)}</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleToggleComments}
                className={cn(
                  "flex items-center gap-2",
                  showComments ? "text-blue-500" : colors.text
                )}
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">
                  {formatCount(totalComments || 0)}
                </span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                className={cn("flex items-center gap-2", colors.text)}
              >
                <Share className="w-5 h-5" />
                <span className="text-sm">Share</span>
              </motion.button>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="px-4 py-3">
            <p className={cn("text-sm leading-relaxed", colors.text)}>
              <span className="font-semibold">{video.user?.username}</span>{" "}
              {video.description}
            </p>

            {video.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {video.tags.slice(0, 3).map((tag: string, i: number) => (
                  <span
                    key={i}
                    className={cn(
                      "px-2 py-1 rounded-md text-xs",
                      isDarkMode
                        ? "bg-amber-900/30 text-amber-300"
                        : "bg-amber-100 text-amber-700"
                    )}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Comments Drawer - SLIDE UP from bottom (Best UX) */}
        <AnimatePresence>
          {showComments && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowComments(false)}
                className="fixed inset-0 bg-black/50 z-40 "
              />
              <div className="md:hidden">
                {/* Slide-up Drawer */}
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className={cn(
                    "fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl",
                    "max-h-[85vh] flex flex-col ",
                    colors.card,
                    colors.border,
                    "border-b-0 border-x border-t shadow-2xl"
                  )}
                >
                  {/* Drawer Header */}
                  <div
                    className={cn(
                      "flex items-center justify-between p-4 border-b",
                      colors.border
                    )}
                  >
                    <h3 className={cn("font-semibold text-lg", colors.text)}>
                      Comments ({comments.length})
                    </h3>
                    <button
                      onClick={() => setShowComments(false)}
                      className={cn(
                        "p-2 rounded-full transition-colors",
                        colors.hoverBg,
                        colors.text
                      )}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Comments Content - Scrollable */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-4">
                      <VideoComments
                        videoId={video._id}
                        currentUserId={currentUserId}
                        onAddComment={handleAddComment}
                        onDeleteComment={handleDeleteComment}
                        comments={comments}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
              <div className="hidden md:block">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowComments(false)}
                  className="fixed inset-0 bg-black/30 z-40"
                />

                {/* Side Panel */}
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className={cn(
                    "fixed top-0 right-0 bottom-0 z-50 w-96 max-w-full",
                    "flex flex-col border-l shadow-2xl",
                    colors.card,
                    colors.border
                  )}
                >
                  {/* Panel Header */}
                  <div
                    className={cn(
                      "flex items-center justify-between p-6 border-b",
                      colors.border
                    )}
                  >
                    <div>
                      <h3 className={cn("font-semibold text-lg", colors.text)}>
                        Comments
                      </h3>
                      <p className={cn("text-sm", colors.textMuted)}>
                        {comments.length} comments
                      </p>
                    </div>
                    <button
                      onClick={() => setShowComments(false)}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        colors.hoverBg,
                        colors.text
                      )}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Comments Content */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-6">
                      <VideoComments
                        videoId={video._id}
                        currentUserId={currentUserId}
                        onAddComment={handleAddComment}
                        onDeleteComment={handleDeleteComment}
                        comments={comments}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }
);

VideoCard.displayName = "VideoCard";

// // // Modal that centers on desktop
// <motion.div
//   initial={{ opacity: 0, scale: 0.95 }}
//   animate={{ opacity: 1, scale: 1 }}
//   exit={{ opacity: 0, scale: 0.95 }}
//   className={cn(
//     "fixed inset-4 md:inset-20 lg:inset-40 xl:inset-60 z-50",
//     "bg-white dark:bg-gray-900 rounded-2xl shadow-2xl",
//     "flex flex-col border",
//     colors.border
//   )}
// >
//   {/* Modal content */}
// </motion.div>
