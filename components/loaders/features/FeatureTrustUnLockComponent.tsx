// components/FeatureUnlockProgress.tsx
import { useTrustScore } from "@/hooks/useTrustScore";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Lock } from "lucide-react";
import { FEATURE_DESCRIPTIONS, FeatureName } from "@/lib/trustScoreHelpers";
import { cn } from "@/lib/utils";

interface FeatureUnlockProgressProps {
  feature: FeatureName;
  variant?: "default" | "compact" | "mini";
  className?: string;
}

export function FeatureUnlockProgress({
  feature,
  variant = "default",
  className,
}: FeatureUnlockProgressProps) {
  const { trustScore, trustStars, canAccess, getScoreNeeded, getStarsNeeded } =
    useTrustScore();

  const scoreNeeded = getScoreNeeded(feature);
  const starsNeeded = getStarsNeeded(feature);
  const isUnlocked = canAccess(feature);
  const progress = Math.min((trustScore / scoreNeeded) * 100, 100);

  // Mini variant - very compact (1 line)
  if (variant === "mini") {
    return (
      <div className={cn("flex items-center gap-2 text-xs", className)}>
        {isUnlocked ? (
          <CheckCircle className="w-3 h-3 text-green-500" />
        ) : (
          <Lock className="w-3 h-3 text-gray-400" />
        )}
        <span className="truncate font-medium">
          {FEATURE_DESCRIPTIONS[feature]}
        </span>
        {!isUnlocked && (
          <span className="ml-auto text-gray-500 text-[10px] font-medium bg-gray-100 px-1.5 py-0.5 rounded">
            {starsNeeded}⭐
          </span>
        )}
      </div>
    );
  }

  // Compact variant - 2 lines, no progress bar
  if (variant === "compact") {
    return (
      <div className={cn("space-y-1", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isUnlocked ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Lock className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-sm font-medium truncate">
              {FEATURE_DESCRIPTIONS[feature]}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {isUnlocked ? "✓" : `${starsNeeded}⭐`}
          </div>
        </div>

        {!isUnlocked && (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
              {trustScore}/{scoreNeeded}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Default variant - full details with progress bar
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isUnlocked ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <Lock className="w-5 h-5 text-gray-400" />
          )}
          <span className="font-medium">{FEATURE_DESCRIPTIONS[feature]}</span>
        </div>
        <div className="text-sm text-gray-500">
          {isUnlocked ? "Unlocked" : `${starsNeeded}⭐ required`}
        </div>
      </div>

      {!isUnlocked && (
        <>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm">
            <span>Current: {trustScore} points</span>
            <span>Needed: {scoreNeeded} points</span>
          </div>
          <p className="text-xs text-gray-500">
            {scoreNeeded - trustScore} more points needed
          </p>
        </>
      )}
    </div>
  );
}
