// components/profile/DesktopUserNavSkeleton.tsx
"use client";

import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const DesktopUserNavSkeleton = () => {
  const { colors, isDarkMode } = useThemeColors();

  return (
    <div
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 border-r backdrop-blur-lg",
        colors.card,
        colors.border,
        "hidden lg:block" // Only show on desktop
      )}
    >
      <div className="h-full overflow-y-auto scrollbar-thin">
        {/* User Header Skeleton */}
        <div className={cn("p-6 border-b", colors.border)}>
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
            </div>
          </div>
        </div>

        {/* Navigation Sections Skeleton */}
        <div className="p-4 space-y-6">
          {/* Profile Section */}
          <div className="space-y-3">
            <Skeleton className="h-3 w-20 rounded px-3" />
            <div className="space-y-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-3 w-32 rounded" />
                  </div>
                  <Skeleton className="w-1.5 h-1.5 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-3">
            <Skeleton className="h-3 w-24 rounded px-3" />
            <div className="space-y-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-20 rounded" />
                      {i === 0 && <Skeleton className="w-6 h-5 rounded-full" />}
                    </div>
                    <Skeleton className="h-3 w-28 rounded" />
                  </div>
                  <Skeleton className="w-1.5 h-1.5 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Tools Section */}
          <div className="space-y-3">
            <Skeleton className="h-3 w-16 rounded px-3" />
            <div className="space-y-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-22 rounded" />
                    <Skeleton className="h-3 w-28 rounded" />
                  </div>
                  <Skeleton className="w-1.5 h-1.5 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats Footer Skeleton */}
        <div className={cn("p-6 border-t mt-auto", colors.border)}>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 w-8 rounded" />
            </div>
            <Skeleton className="w-full h-2 rounded-full" />
            <Skeleton className="h-3 w-40 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopUserNavSkeleton;
