// components/skeletons/SearchUserCardSkeleton.tsx
"use client";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";

interface SearchUserCardSkeletonProps {
  isDarkMode?: boolean;
}

export function SearchUserCardSkeleton({
  isDarkMode,
}: SearchUserCardSkeletonProps) {
  const { colors } = useThemeColors();

  return (
    <div
      className={cn(
        "group relative rounded-2xl p-5 border backdrop-blur-sm animate-pulse ",
        isDarkMode
          ? "bg-gray-800/50 border-gray-700"
          : "bg-white border-gray-200"
      )}
    >
      {/* Featured Badge Skeleton */}
      <div className="absolute -top-2 -right-2 z-10">
        <div
          className={cn(
            "w-16 h-6 rounded-full",
            isDarkMode ? "bg-gray-700" : "bg-gray-300"
          )}
        />
      </div>

      {/* Avatar Section Skeleton */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          <div
            className={cn(
              "w-14 h-14 rounded-2xl",
              isDarkMode ? "bg-gray-700" : "bg-gray-300"
            )}
          />
          {/* Online Badge Skeleton */}
          <div
            className={cn(
              "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2",
              isDarkMode
                ? "bg-gray-600 border-gray-800"
                : "bg-gray-400 border-white"
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-20 h-4 rounded",
                  isDarkMode ? "bg-gray-700" : "bg-gray-300"
                )}
              />
              <div
                className={cn(
                  "w-16 h-3 rounded",
                  isDarkMode ? "bg-gray-700" : "bg-gray-300"
                )}
              />
            </div>
            <div
              className={cn(
                "w-8 h-8 rounded-xl",
                isDarkMode ? "bg-gray-700" : "bg-gray-300"
              )}
            />
          </div>

          {/* Role Badge Skeleton */}
          <div
            className={cn(
              "w-24 h-6 rounded-full",
              isDarkMode ? "bg-gray-700" : "bg-gray-300"
            )}
          />
        </div>
      </div>

      {/* Location Skeleton */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className={cn(
            "w-4 h-4 rounded",
            isDarkMode ? "bg-gray-700" : "bg-gray-300"
          )}
        />
        <div
          className={cn(
            "w-16 h-3 rounded",
            isDarkMode ? "bg-gray-700" : "bg-gray-300"
          )}
        />
      </div>

      {/* Bio Skeleton */}
      <div className="space-y-2 mb-4">
        <div
          className={cn(
            "w-full h-3 rounded",
            isDarkMode ? "bg-gray-700" : "bg-gray-300"
          )}
        />
        <div
          className={cn(
            "w-3/4 h-3 rounded",
            isDarkMode ? "bg-gray-700" : "bg-gray-300"
          )}
        />
      </div>

      {/* Stats & Actions Skeleton */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div
              className={cn(
                "w-8 h-5 rounded mb-1",
                isDarkMode ? "bg-gray-700" : "bg-gray-300"
              )}
            />
            <div
              className={cn(
                "w-12 h-3 rounded",
                isDarkMode ? "bg-gray-700" : "bg-gray-300"
              )}
            />
          </div>
          <div className="text-center">
            <div
              className={cn(
                "w-6 h-5 rounded mb-1",
                isDarkMode ? "bg-gray-700" : "bg-gray-300"
              )}
            />
            <div
              className={cn(
                "w-8 h-3 rounded",
                isDarkMode ? "bg-gray-700" : "bg-gray-300"
              )}
            />
          </div>
          <div className="text-center">
            <div
              className={cn(
                "w-10 h-5 rounded mb-1",
                isDarkMode ? "bg-gray-700" : "bg-gray-300"
              )}
            />
            <div
              className={cn(
                "w-10 h-3 rounded",
                isDarkMode ? "bg-gray-700" : "bg-gray-300"
              )}
            />
          </div>
        </div>

        {/* Follow Button Skeleton */}
        <div
          className={cn(
            "w-20 h-8 rounded-xl",
            isDarkMode ? "bg-gray-700" : "bg-gray-300"
          )}
        />
      </div>
    </div>
  );
}
