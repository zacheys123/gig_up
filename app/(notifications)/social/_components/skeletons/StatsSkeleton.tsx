// components/skeletons/followers/FollowersStatsSkeleton.tsx
import { cn } from "@/lib/utils";

interface FollowersStatsSkeletonProps {
  colors: any;
}

export default function FollowersStatsSkeleton({
  colors,
}: FollowersStatsSkeletonProps) {
  return (
    <div className="flex flex-wrap gap-2 md:gap-4 mt-4 mb-4 md:mt-6">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className={cn(
            "px-3 py-2 md:px-4 md:py-3 rounded-xl border-2 flex-1 min-w-[100px] animate-pulse",
            colors.secondaryBackground,
            colors.border
          )}
        >
          <div className="flex items-center gap-2 md:gap-3">
            <div
              className={cn(
                "w-2 h-2 md:w-3 md:h-3 rounded-full",
                colors.secondaryBackground
              )}
            ></div>
            <div className="min-w-0 flex-1 space-y-1">
              <div
                className={cn(
                  "h-6 md:h-8 rounded-lg",
                  colors.secondaryBackground
                )}
              ></div>
              <div
                className={cn("h-4 w-16 rounded", colors.secondaryBackground)}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
