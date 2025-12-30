import React, { memo } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustStarsDisplayProps {
  trustStars: number;
  size?: "sm" | "md" | "lg";
  showScore?: boolean;
  showTier?: boolean;
  className?: string;
}

export const TrustStarsDisplay: React.FC<TrustStarsDisplayProps> = memo(
  ({
    trustStars,
    size = "md",
    showScore = true,
    showTier = true,
    className,
  }) => {
    // Normalize trust stars (0.5-5.0)
    const normalizedStars = Math.min(Math.max(trustStars, 0.5), 5.0);
    const fullStars = Math.floor(normalizedStars);
    const hasHalfStar = normalizedStars % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    // Size configurations
    const sizeConfig = {
      sm: { starSize: "w-3 h-3", textSize: "text-xs", gap: "gap-0.5" },
      md: { starSize: "w-4 h-4", textSize: "text-sm", gap: "gap-1" },
      lg: { starSize: "w-5 h-5", textSize: "text-base", gap: "gap-1.5" },
    }[size];

    // Get trust tier
    const getTrustTier = (stars: number) => {
      if (stars >= 4.5) return { label: "Elite", color: "text-purple-600" };
      if (stars >= 4.0) return { label: "Trusted", color: "text-green-600" };
      if (stars >= 3.0) return { label: "Verified", color: "text-blue-600" };
      if (stars >= 2.0) return { label: "Basic", color: "text-amber-600" };
      return { label: "New", color: "text-gray-600" };
    };

    const tier = getTrustTier(normalizedStars);

    return (
      <div className={cn("flex items-center", sizeConfig.gap, className)}>
        {/* Stars */}
        <div className="flex items-center">
          {/* Full stars */}
          {Array.from({ length: fullStars }).map((_, i) => (
            <Star
              key={`full-${i}`}
              className={cn(
                sizeConfig.starSize,
                "fill-amber-500 text-amber-500",
                "transition-all duration-200"
              )}
            />
          ))}

          {/* Half star */}
          {hasHalfStar && (
            <div className="relative">
              <Star
                className={cn(
                  sizeConfig.starSize,
                  "fill-gray-300 text-gray-300",
                  "transition-all duration-200"
                )}
              />
              <div
                className={cn(
                  "absolute left-0 top-0 overflow-hidden",
                  "w-1/2 h-full"
                )}
              >
                <Star
                  className={cn(
                    sizeConfig.starSize,
                    "fill-amber-500 text-amber-500",
                    "absolute left-0 top-0"
                  )}
                />
              </div>
            </div>
          )}

          {/* Empty stars */}
          {Array.from({ length: emptyStars }).map((_, i) => (
            <Star
              key={`empty-${i}`}
              className={cn(
                sizeConfig.starSize,
                "fill-gray-300 text-gray-300",
                "transition-all duration-200"
              )}
            />
          ))}
        </div>

        {/* Score and Tier */}
        <div className="flex items-center gap-1">
          {showScore && (
            <span
              className={cn("font-semibold", sizeConfig.textSize, tier.color)}
            >
              {normalizedStars.toFixed(1)}
            </span>
          )}

          {showTier && (
            <span
              className={cn("font-medium", sizeConfig.textSize, tier.color)}
            >
              {tier.label}
            </span>
          )}
        </div>
      </div>
    );
  }
);

TrustStarsDisplay.displayName = "TrustStarsDisplay";
