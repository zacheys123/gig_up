// components/community/VideoCardSkeleton.tsx
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { motion } from "framer-motion";

interface VideoCardSkeletonProps {
  variant?: "default" | "trending";
}

export const VideoCardSkeleton: React.FC<VideoCardSkeletonProps> = ({
  variant = "default",
}) => {
  const { colors } = useThemeColors();
  const [showComments, setShowComments] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.8 }}
      className={cn(
        "rounded-2xl overflow-hidden border shadow-sm animate-pulse",
        colors.card,
        colors.border,
        variant === "trending" &&
          "border-2 border-amber-300 dark:border-amber-600"
      )}
    >
      {/* Video Thumbnail */}
      <div className="aspect-video bg-gray-800 dark:bg-gray-700 relative cursor-pointer" />

      {/* Video Content */}
      <div className="p-5 space-y-3">
        {/* Title */}
        <div className="h-5 bg-gray-700 dark:bg-gray-600 rounded w-3/4" />

        {/* Stats */}
        <div className="flex gap-2">
          <div className="h-4 bg-gray-700 dark:bg-gray-600 rounded w-12" />
          <div className="h-4 bg-gray-700 dark:bg-gray-600 rounded w-12" />
          <div className="h-4 bg-gray-700 dark:bg-gray-600 rounded w-12" />
        </div>

        {/* Description */}
        <div className="h-3 bg-gray-700 dark:bg-gray-600 rounded w-full" />
        <div className="h-3 bg-gray-700 dark:bg-gray-600 rounded w-5/6" />

        {/* Tags */}
        <div className="flex gap-2 mt-3">
          <div className="h-6 w-16 bg-gray-700 dark:bg-gray-600 rounded-full" />
          <div className="h-6 w-16 bg-gray-700 dark:bg-gray-600 rounded-full" />
          <div className="h-6 w-16 bg-gray-700 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-3">
          <div
            className="h-8 w-20 bg-gray-700 dark:bg-gray-600 rounded-full cursor-pointer"
            onClick={() => setShowComments(!showComments)}
          />
          <div className="h-8 w-20 bg-gray-700 dark:bg-gray-600 rounded-full" />
          <div className="h-8 w-20 bg-gray-700 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Comments Skeleton */}
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 border-t pt-4 space-y-3"
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-700 dark:bg-gray-600" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-gray-700 dark:bg-gray-600 rounded w-3/4" />
                  <div className="h-3 bg-gray-700 dark:bg-gray-600 rounded w-1/2" />
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
