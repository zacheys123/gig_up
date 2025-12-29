// components/user-reliability/TrustScoreSection.tsx
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const tierColors = {
  new: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-300",
    progress: "bg-gray-400",
  },
  basic: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-300",
    progress: "bg-blue-400",
  },
  verified: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-300",
    progress: "bg-green-400",
  },
  trusted: {
    bg: "bg-purple-100",
    text: "text-purple-800",
    border: "border-purple-300",
    progress: "bg-purple-400",
  },
  elite: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-300",
    progress: "bg-yellow-400",
  },
};

const tierEmojis = {
  new: "🌱",
  basic: "⭐",
  verified: "✅",
  trusted: "🤝",
  elite: "🏆",
};

const tierNames = {
  new: "Newcomer",
  basic: "Basic",
  verified: "Verified",
  trusted: "Trusted",
  elite: "Elite",
};

interface TrustScoreSectionProps {
  trustData: {
    score: number;
    tier: string;
    nextTier?: {
      name: string;
      minScore: number;
      maxScore: number;
    } | null;
    tierData?: {
      minScore: number;
      maxScore: number;
    };
    bandEligible: boolean;
    lastUpdated?: number;
    isProfileComplete: boolean;
  };
  isMusician: boolean;
  canCreateBand: boolean;
}

export const TrustScoreSection: React.FC<TrustScoreSectionProps> = ({
  trustData,
  isMusician,
  canCreateBand,
}) => {
  const { score, tier, nextTier, tierData, bandEligible } = trustData;

  // Calculate progress to next tier
  const calculateProgress = () => {
    if (!score || !tierData) return 0;

    if (!nextTier) return 100;

    const range = nextTier.minScore - tierData.minScore;
    const progressInRange = score - tierData.minScore;

    return Math.min(100, Math.max(0, (progressInRange / range) * 100));
  };

  const progress = calculateProgress();
  const tierColor =
    tierColors[tier as keyof typeof tierColors] || tierColors.new;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border p-6 mb-6",
        tierColor.bg,
        tierColor.border
      )}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Trust Score</h2>
          <p className="text-gray-600">
            Platform-wide credibility score based on activity and performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold">{score}/100</div>
            <div className="text-sm text-gray-600">Overall Score</div>
          </div>
          <div
            className={cn(
              "px-4 py-2 rounded-full border",
              tierColor.border,
              tierColor.text
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {tierEmojis[tier as keyof typeof tierEmojis] || "📊"}
              </span>
              <span className="font-semibold">
                {tierNames[tier as keyof typeof tierNames] || tier}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>{tierNames[tier as keyof typeof tierNames]}</span>
          <span>
            {nextTier
              ? tierNames[nextTier.name as keyof typeof tierNames]
              : "Highest Tier"}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={cn("h-full rounded-full", tierColor.progress)}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>{tierData?.minScore || 0} points</span>
          <span>
            {nextTier
              ? `${nextTier.minScore} points to next tier`
              : "Max level achieved"}
          </span>
        </div>
      </div>

      {/* Band Eligibility for Musicians */}
      {isMusician && (
        <div
          className={cn(
            "p-4 rounded-lg border",
            bandEligible
              ? "bg-green-50 border-green-200"
              : "bg-amber-50 border-amber-200"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-lg",
                bandEligible ? "bg-green-100" : "bg-amber-100"
              )}
            >
              {bandEligible ? "✅" : "🎯"}
            </div>
            <div>
              <h3 className="font-semibold">
                {bandEligible
                  ? "Band Creation Eligible"
                  : "Band Creation Requirements"}
              </h3>
              <p className="text-sm text-gray-600">
                {bandEligible
                  ? "This musician can create and manage bands on the platform"
                  : `Requires 70+ trust score and complete profile (currently ${score}/70)`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Last Updated */}
      {trustData.lastUpdated && (
        <div className="text-xs text-gray-500 text-right mt-4">
          Last updated: {new Date(trustData.lastUpdated).toLocaleDateString()}
        </div>
      )}
    </motion.div>
  );
};
