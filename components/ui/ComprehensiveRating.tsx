// components/ComprehensiveRating?.tsx
import React from "react";
import { Star, StarHalf, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { MusicianRating } from "@/hooks/useCommunityUsers";

interface ComprehensiveRatingProps {
  rating: MusicianRating; // ✅ Use the specific type

  size?: "sm" | "md" | "lg";
  showBreakdown?: boolean;
  className?: string;
}

export const ComprehensiveRating: React.FC<ComprehensiveRatingProps> = ({
  rating,
  size = "md",
  showBreakdown = false,
  className,
}) => {
  const { colors } = useThemeColors();

  const sizeClasses = {
    sm: { star: "w-3 h-3", text: "text-xs", breakdown: "text-xs" },
    md: { star: "w-4 h-4", text: "text-sm", breakdown: "text-sm" },
    lg: { star: "w-5 h-5", text: "text-base", breakdown: "text-base" },
  };

  const renderStars = (score: number) => {
    const stars = [];
    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star
            key={i}
            className={cn(
              "fill-amber-500 text-amber-500",
              sizeClasses[size].star
            )}
          />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <StarHalf
            key={i}
            className={cn(
              "fill-amber-500 text-amber-500",
              sizeClasses[size].star
            )}
          />
        );
      } else {
        stars.push(
          <Star
            key={i}
            className={cn(
              "text-gray-300 dark:text-gray-600",
              sizeClasses[size].star
            )}
          />
        );
      }
    }

    return stars;
  };

  const getRatingLevel = (score: number) => {
    if (score >= 4.5) return { label: "Excellent", color: "text-green-600" };
    if (score >= 4.0) return { label: "Great", color: "text-green-500" };
    if (score >= 3.5) return { label: "Good", color: "text-amber-500" };
    if (score >= 3.0) return { label: "Average", color: "text-yellow-500" };
    return { label: "", color: "text-gray-500" };
  };

  const level = getRatingLevel(rating?.overall);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Main Rating */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {renderStars(rating?.overall)}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn("font-bold", colors.text, sizeClasses[size].text)}
          >
            {rating?.overall.toFixed(1)}
          </span>
          <span
            className={cn("font-medium", level.color, sizeClasses[size].text)}
          >
            {level.label}
          </span>
          {rating?.reviewCount !== undefined && (
            <span className={cn(colors.textMuted, sizeClasses[size].text)}>
              ({rating?.reviewCount} reviews)
            </span>
          )}
        </div>
      </div>

      {/* Breakdown (Optional) */}
      {showBreakdown && rating?.breakdown && (
        <div
          className={cn("grid grid-cols-2 gap-1", sizeClasses[size].breakdown)}
        >
          {Object.entries(rating?.breakdown).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className={colors.textMuted}>
                {key.replace(/([A-Z])/g, " $1").trim()}:
              </span>
              <span className={cn("font-medium", colors.text)}>{value}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
