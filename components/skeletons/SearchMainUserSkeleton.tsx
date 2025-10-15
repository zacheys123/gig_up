// components/skeletons/SearchUserSkeleton.tsx
"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SearchUserSkeletonProps {
  isDarkMode?: boolean;
}

const SearchUserSkeleton = ({
  isDarkMode = false,
}: SearchUserSkeletonProps) => {
  const skeletonColor = isDarkMode ? "bg-gray-700" : "bg-gray-300";
  const skeletonColorLight = isDarkMode ? "bg-gray-600" : "bg-gray-200";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "rounded-xl p-4 border animate-pulse",
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar Skeleton */}
        <div className={cn("w-12 h-12 rounded-full", skeletonColor)} />

        {/* Content */}
        <div className="flex-1 space-y-2">
          {/* Name and Username */}
          <div className="space-y-1">
            <div className={cn("h-4 rounded w-32", skeletonColor)} />
            <div className={cn("h-3 rounded w-24", skeletonColorLight)} />
          </div>

          {/* Role Badge */}
          <div className={cn("h-5 rounded-full w-20", skeletonColorLight)} />

          {/* Stats */}
          <div className="flex gap-4 pt-2">
            <div className={cn("h-3 rounded w-12", skeletonColorLight)} />
            <div className={cn("h-3 rounded w-12", skeletonColorLight)} />
          </div>
        </div>

        {/* Follow Button */}
        <div className={cn("w-16 h-8 rounded-lg", skeletonColor)} />
      </div>
    </motion.div>
  );
};

// Grid version for multiple skeletons
export const SearchUserSkeletonGrid = ({
  count = 8,
  isDarkMode = false,
}: {
  count?: number;
  isDarkMode?: boolean;
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <SearchUserSkeleton isDarkMode={isDarkMode} />
        </motion.div>
      ))}
    </div>
  );
};

export default SearchUserSkeleton;
