// components/skeletons/followers/FollowerCardSkeleton.tsx
import { cn } from "@/lib/utils";

interface FollowerCardSkeletonProps {
  colors: any;
  variant?: "mobile" | "tablet" | "desktop";
}

export default function FollowerCardSkeleton({
  colors,
  variant = "desktop",
}: FollowerCardSkeletonProps) {
  const isMobile = variant === "mobile";
  const isTablet = variant === "tablet";

  return (
    <div
      className={cn(
        "rounded-2xl p-4 md:p-5 lg:p-6 border-2 animate-pulse",
        colors.secondaryBackground,
        colors.border
      )}
    >
      <div
        className={`flex ${isMobile ? "items-start gap-3" : "flex-col h-full"}`}
      >
        {/* Header Section */}
        <div
          className={`flex items-start justify-between ${isMobile ? "mb-2" : "mb-4"}`}
        >
          <div className={`flex items-center ${isMobile ? "gap-3" : "gap-3"}`}>
            {/* Avatar Skeleton */}
            <div
              className={cn(
                "rounded-xl border-2",
                isMobile ? "w-12 h-12" : "w-14 h-14 rounded-2xl",
                colors.secondaryBackground,
                colors.border
              )}
            ></div>

            {/* Name & Username Skeleton */}
            <div className="min-w-0 flex-1 space-y-1">
              <div
                className={cn(
                  "rounded-lg",
                  isMobile ? "h-4 w-20" : "h-5 w-24",
                  colors.secondaryBackground
                )}
              ></div>
              <div
                className={cn(
                  "rounded",
                  isMobile ? "h-3 w-16" : "h-4 w-20",
                  colors.secondaryBackground
                )}
              ></div>
            </div>
          </div>

          {/* Menu Button Skeleton */}
          <div
            className={cn(
              "rounded-xl",
              isMobile ? "w-8 h-8" : "w-10 h-10",
              colors.secondaryBackground
            )}
          ></div>
        </div>

        {/* Badges Section */}
        <div
          className={`flex items-center gap-2 mb-3 flex-wrap ${isMobile ? "mb-3" : "mb-4"}`}
        >
          <div
            className={cn("w-16 h-6 rounded-full", colors.secondaryBackground)}
          ></div>
          <div
            className={cn("w-20 h-6 rounded-full", colors.secondaryBackground)}
          ></div>
        </div>

        {/* Bio Section (Desktop only) */}
        {!isMobile && (
          <div className="mb-4 space-y-1 flex-1">
            <div
              className={cn("h-4 w-full rounded", colors.secondaryBackground)}
            ></div>
            <div
              className={cn("h-4 w-3/4 rounded", colors.secondaryBackground)}
            ></div>
          </div>
        )}

        {/* Footer Section */}
        <div
          className={`flex items-center justify-between ${
            isMobile ? "" : "pt-4 border-t mt-auto"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "rounded",
                isMobile ? "h-3 w-16" : "h-4 w-20",
                colors.secondaryBackground
              )}
            ></div>
          </div>

          {/* Follow Button Skeleton */}
          <div
            className={cn(
              "rounded-lg",
              isMobile ? "w-20 h-8" : "w-24 h-9",
              colors.secondaryBackground
            )}
          ></div>
        </div>
      </div>
    </div>
  );
}
