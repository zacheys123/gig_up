// components/StarDisplay.tsx
import { Star, StarHalf } from "lucide-react";

interface StarDisplayProps {
  stars: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  showLabel?: boolean;
}

export function StarDisplay({
  stars,
  size = "md",
  showValue = false,
  showLabel = false,
}: StarDisplayProps) {
  // Get size classes
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  // Get star description based on your convex function
  const getDescription = (starsNum: number): string => {
    if (starsNum >= 4.5) return "Elite";
    if (starsNum >= 4.0) return "Trusted";
    if (starsNum >= 3.0) return "Verified";
    if (starsNum >= 2.0) return "Basic";
    return "New";
  };

  // Calculate full and half stars
  const fullStars = Math.floor(stars);
  const hasHalfStar = stars % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`}
            fill="currentColor"
          />
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star
              className={`${sizeClasses[size]} text-gray-300`}
              fill="currentColor"
            />
            <StarHalf
              className={`${sizeClasses[size]} absolute left-0 top-0 fill-yellow-400 text-yellow-400`}
              fill="currentColor"
            />
          </div>
        )}

        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className={`${sizeClasses[size]} text-gray-300`}
            fill="none"
          />
        ))}

        {/* Show value */}
        {showValue && (
          <span className="ml-2 text-sm font-medium">{stars.toFixed(1)}</span>
        )}
      </div>

      {/* Show label */}
      {showLabel && (
        <span className="text-xs text-gray-500">
          {getDescription(stars)} • {stars.toFixed(1)} stars
        </span>
      )}
    </div>
  );
}
