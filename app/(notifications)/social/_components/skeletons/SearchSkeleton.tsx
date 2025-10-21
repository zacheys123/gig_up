// components/skeletons/followers/FollowersSearchSkeleton.tsx
import { cn } from "@/lib/utils";

interface FollowersSearchSkeletonProps {
  colors: any;
}

export default function FollowersSearchSkeleton({
  colors,
}: FollowersSearchSkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8 border-2 animate-pulse",
        colors.secondaryBackground,
        colors.border
      )}
    >
      <div className="flex flex-col gap-4">
        <div
          className={cn("h-12 rounded-lg", colors.secondaryBackground)}
        ></div>
        <div className="md:hidden">
          <div
            className={cn("h-10 rounded-lg", colors.secondaryBackground)}
          ></div>
        </div>
        <div className="hidden md:flex gap-2 p-1 rounded-xl w-fit">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className={cn("w-24 h-8 rounded-lg", colors.secondaryBackground)}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
