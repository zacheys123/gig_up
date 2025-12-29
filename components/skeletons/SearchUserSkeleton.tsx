// components/skeletons/SearchUserSkeleton.tsx
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
        "group relative rounded-2xl p-5 animate-pulse",
        "flex flex-col h-full"
      )}
      style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          {/* Avatar skeleton */}
          <div className="relative">
            <div
              className="w-14 h-14 rounded-xl"
              style={{ backgroundColor: colors.skeletonBg }}
            />
          </div>

          {/* Name skeleton */}
          <div className="min-w-0 flex-1">
            <div
              className="h-5 w-24 mb-2 rounded"
              style={{ backgroundColor: colors.skeletonBg }}
            />
            <div
              className="h-3 w-16 rounded"
              style={{ backgroundColor: colors.skeletonBg }}
            />
          </div>
        </div>
      </div>

      {/* Role badge skeleton */}
      <div className="mb-4">
        <div
          className="h-7 w-20 rounded-full"
          style={{ backgroundColor: colors.skeletonBg }}
        />
      </div>

      {/* Location skeleton */}
      <div className="mb-4">
        <div
          className="h-4 w-28 rounded"
          style={{ backgroundColor: colors.skeletonBg }}
        />
      </div>

      {/* Bio skeleton */}
      <div className="mb-5 space-y-2">
        <div
          className="h-3 w-full rounded"
          style={{ backgroundColor: colors.skeletonBg }}
        />
        <div
          className="h-3 w-3/4 rounded"
          style={{ backgroundColor: colors.skeletonBg }}
        />
      </div>

      {/* Tags skeleton */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-6 w-16 rounded-lg"
            style={{ backgroundColor: colors.skeletonBg }}
          />
        ))}
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-2 rounded-lg border"
            style={{
              backgroundColor: colors.skeletonBg,
              borderColor: colors.borderLight,
            }}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors.skeletonBgDark }}
              />
              <div
                className="h-4 w-6 rounded"
                style={{ backgroundColor: colors.skeletonBgDark }}
              />
            </div>
            <div
              className="h-3 w-8 mx-auto rounded"
              style={{ backgroundColor: colors.skeletonBgDark }}
            />
          </div>
        ))}
      </div>

      {/* Buttons skeleton */}
      <div className="mt-auto flex gap-2">
        <div
          className="flex-1 h-10 rounded-lg"
          style={{ backgroundColor: colors.skeletonBg }}
        />
        <div
          className="w-10 h-10 rounded-lg"
          style={{ backgroundColor: colors.skeletonBg }}
        />
      </div>
    </div>
  );
}
