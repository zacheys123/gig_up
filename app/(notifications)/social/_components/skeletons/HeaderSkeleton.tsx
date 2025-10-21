// components/skeletons/followers/FollowersHeaderSkeleton.tsx
import { cn } from "@/lib/utils";

interface FollowersHeaderSkeletonProps {
  colors: any;
}

export default function FollowersHeaderSkeleton({
  colors,
}: FollowersHeaderSkeletonProps) {
  return (
    <div className="mb-6 md:mb-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 md:gap-6">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="md:hidden">
            <div
              className={cn(
                "w-12 h-12 rounded-xl animate-pulse",
                colors.secondaryBackground
              )}
            ></div>
          </div>
          <div className="hidden md:block">
            <div
              className={cn(
                "w-16 h-16 rounded-2xl animate-pulse",
                colors.secondaryBackground
              )}
            ></div>
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div
              className={cn(
                "h-8 w-48 rounded-lg animate-pulse",
                colors.secondaryBackground
              )}
            ></div>
            <div
              className={cn(
                "h-6 w-64 rounded-lg animate-pulse",
                colors.secondaryBackground
              )}
            ></div>
          </div>
        </div>

        <div className="flex gap-2 md:gap-3">
          <div className="md:hidden flex gap-2">
            <div
              className={cn(
                "w-10 h-10 rounded-xl animate-pulse",
                colors.secondaryBackground
              )}
            ></div>
            <div
              className={cn(
                "w-10 h-10 rounded-xl animate-pulse",
                colors.secondaryBackground
              )}
            ></div>
          </div>
          <div className="hidden md:flex gap-3">
            <div
              className={cn(
                "w-32 h-10 rounded-xl animate-pulse",
                colors.secondaryBackground
              )}
            ></div>
            <div
              className={cn(
                "w-32 h-10 rounded-xl animate-pulse",
                colors.secondaryBackground
              )}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
