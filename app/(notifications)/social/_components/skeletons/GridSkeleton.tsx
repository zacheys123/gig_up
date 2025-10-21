import FollowerCardSkeleton from "./FollowersCardSkeleton";

interface FollowersGridSkeletonProps {
  colors: any;
  count?: number;
}

export default function FollowersGridSkeleton({
  colors,
  count = 6,
}: FollowersGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
      {[...Array(count)].map((_, index) => (
        <FollowerCardSkeleton key={index} colors={colors} />
      ))}
    </div>
  );
}
