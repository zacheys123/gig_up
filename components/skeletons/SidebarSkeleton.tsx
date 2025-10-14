"use client";

import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";

export function SidebarSkeleton() {
  const { colors } = useThemeColors();

  return (
    <div
      className={cn(
        "w-full md:w-64 h-full flex flex-col border-r",
        colors.background,
        colors.border
      )}
    >
      {/* Header Skeleton */}
      <div className={cn("p-6 border-b", colors.border)}>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            {/* Logo skeleton */}
            <div
              className={cn(
                "h-7 w-24 bg-gray-400 rounded-lg animate-pulse",
                colors.skeleton
              )}
            ></div>
            {/* Badge and role skeletons */}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "h-5 w-10 bg-gray-400 rounded-full animate-pulse",
                  colors.skeleton
                )}
              ></div>
              <div
                className={cn(
                  "h-4 w-12 bg-gray-400 rounded animate-pulse",
                  colors.skeleton
                )}
              ></div>
            </div>
          </div>
          {/* Notification bell skeleton */}
          <div className="hidden lg:block">
            <div
              className={cn(
                "w-8 h-8 bg-gray-400 rounded-full animate-pulse",
                colors.skeleton
              )}
            ></div>
          </div>
        </div>
      </div>

      {/* Navigation Links Skeleton */}
      <nav className="flex-1 p-4 space-y-1">
        {/* Navigation items skeleton - 13 items total (8 role links + 5 common links) */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((item) => (
          <div
            key={item}
            className="flex items-center gap-3 w-full p-3 rounded-xl animate-pulse"
          >
            <div
              className={cn(
                "w-5 h-5 bg-gray-400 rounded-full",
                colors.skeleton
              )}
            ></div>
            <div
              className={cn("h-4 bg-gray-400 rounded flex-1", colors.skeleton)}
            ></div>
            <div
              className={cn("w-4 h-4 bg-gray-400 rounded", colors.skeleton)}
            ></div>
          </div>
        ))}

        {/* Theme Toggle Skeleton */}
        <div className="flex items-center gap-3 w-full p-3 rounded-xl animate-pulse">
          <div
            className={cn("w-5 h-5 bg-gray-400 rounded-full", colors.skeleton)}
          ></div>
          <div
            className={cn("h-4 bg-gray-400 rounded flex-1", colors.skeleton)}
          ></div>
          <div
            className={cn("h-3 bg-gray-400 rounded w-12", colors.skeleton)}
          ></div>
        </div>
      </nav>

      {/* Quick Stats Skeleton */}
      <div className={cn("p-4 border-t", colors.border)}>
        <div
          className={cn(
            "rounded-lg p-3 border animate-pulse",
            colors.card,
            colors.border
          )}
        >
          <div
            className={cn("h-3 bg-gray-400 rounded w-20 mb-3", colors.skeleton)}
          ></div>
          <div className="space-y-2">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex justify-between">
                <div
                  className={cn(
                    "h-3 bg-gray-400 rounded w-16",
                    colors.skeleton
                  )}
                ></div>
                <div
                  className={cn("h-3 bg-gray-400 rounded w-8", colors.skeleton)}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className={cn("px-4 py-2 border-t", colors.border)}>
        <div
          className={cn(
            "h-3 bg-gray-400 rounded w-16 mx-auto animate-pulse",
            colors.skeleton
          )}
        ></div>
      </div>
    </div>
  );
}

// Quick loading state for sidebar
export function SidebarQuickSkeleton() {
  const { colors } = useThemeColors();

  return (
    <div
      className={cn(
        "w-full md:w-64 h-full flex flex-col border-r",
        colors.background,
        colors.border
      )}
    >
      {/* Simplified header */}
      <div className={cn("p-4 border-b", colors.border)}>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "h-6 w-20 bg-gray-400 rounded animate-pulse",
              colors.skeleton
            )}
          ></div>
          <div
            className={cn(
              "h-4 w-16 bg-gray-400 rounded animate-pulse",
              colors.skeleton
            )}
          ></div>
        </div>
      </div>

      {/* Simplified navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="flex items-center gap-3 p-2 animate-pulse">
            <div
              className={cn(
                "w-4 h-4 bg-gray-400 rounded-full",
                colors.skeleton
              )}
            ></div>
            <div
              className={cn("h-3 bg-gray-400 rounded flex-1", colors.skeleton)}
            ></div>
          </div>
        ))}
      </nav>
    </div>
  );
}

export default SidebarSkeleton;
