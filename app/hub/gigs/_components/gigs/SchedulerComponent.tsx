"use client";

import React, { FormEvent, useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useGigs } from "@/hooks/useAllGigs";
import { useCheckTrial } from "@/hooks/useCheckTrial";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Modal } from "@/components/modals/Modal";
import SubscriptionOverlay from "./SubscriptionOverlay";
import CreateLimitOverlay from "./CreateLimitOverlay";
import TrustScoreOverlay from "./TrustScoreOverlay";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";

// Import trust score helpers
import {
  scoreToStars,
  getTrustTierFromScore,
  calculateProfilePoints,
  calculateLongevityPoints,
  calculateActivityPoints,
  calculateQualityPoints,
  calculateContentPoints,
  calculateSocialPoints,
  calculatePenalties,
  checkProfileCompleteness,
} from "@/lib/trustScoreHelpers";
import { Id } from "@/convex/_generated/dataModel";
// Add this function to your component (before the SchedulerComponent function)
// Add this at the top of your SchedulerComponent.tsx, after the imports

// Feature score thresholds (copy from your trustScoreHelpers or convex file)
const FEATURE_SCORE_THRESHOLDS = {
  canPostBasicGigs: 10,
  canMessageUsers: 20,
  canVerifiedBadge: 40,
  canCompete: 45,
  canAccessAnalytics: 50,
  canPostPremiumGigs: 55,
  canBeDual: 60,
  canVideoCall: 65,
  canCreateBand: 70,
  canHireTeams: 75,
  canVerifyOthers: 80,
  canModerate: 85,
  canBetaFeatures: 90,
} as const;
// Get role-specific threshold
const getRoleThreshold = (
  feature: keyof typeof FEATURE_SCORE_THRESHOLDS,
  user: any
): number => {
  if (!user) return FEATURE_SCORE_THRESHOLDS[feature];

  // Role adjustments
  if (user.isClient || user.isBooker) {
    // Lower thresholds for clients and bookers
    const adjustments: Record<keyof typeof FEATURE_SCORE_THRESHOLDS, number> = {
      canPostBasicGigs: 10, // Same
      canMessageUsers: 15, // Lower
      canVerifiedBadge: 30, // Lower
      canCompete: 45, // Same
      canAccessAnalytics: 40, // Lower
      canPostPremiumGigs: 45, // Lower
      canBeDual: 50, // Lower
      canVideoCall: 60, // Lower
      canCreateBand: 999, // Not available
      canHireTeams: 55, // For clients/bookers
      canVerifyOthers: 999, // Not available
      canModerate: 75, // Higher
      canBetaFeatures: 70, // Lower
    };
    return adjustments[feature];
  }

  if (user.isMusician && user.roleType === "teacher") {
    // Teacher-specific adjustments
    const adjustments: Record<keyof typeof FEATURE_SCORE_THRESHOLDS, number> = {
      canPostBasicGigs: 10,
      canMessageUsers: 15,
      canVerifiedBadge: 35,
      canCompete: 999, // Not for teachers
      canAccessAnalytics: 45,
      canPostPremiumGigs: 50,
      canBeDual: 60,
      canVideoCall: 55,
      canCreateBand: 65,
      canHireTeams: 999,
      canVerifyOthers: 999,
      canModerate: 75,
      canBetaFeatures: 70,
    };
    return adjustments[feature];
  }

  // Default musician thresholds
  return FEATURE_SCORE_THRESHOLDS[feature];
};
interface SubmitProps {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  getScheduleData: (
    type: "automatic" | "regular" | "create",
    date?: Date
  ) => void;
  isLoading?: boolean;
  isSchedulerOpen: boolean;
  setisSchedulerOpen: (isSchedulerOpen: boolean) => void;
}

// Calculate comprehensive trust score using your helpers
const calculateUserTrustScore = (user: any): number => {
  if (!user) return 0;

  try {
    // Calculate all section scores
    const profileScore = calculateProfilePoints(user);
    const longevityScore = calculateLongevityPoints(user);
    const activityScore = calculateActivityPoints(user);
    const qualityScore = calculateQualityPoints(user);
    const contentScore = calculateContentPoints(user);
    const socialScore = calculateSocialPoints(user);
    const penalties = calculatePenalties(user);

    // Sum all scores and subtract penalties
    const totalScore = Math.min(
      profileScore +
        longevityScore +
        activityScore +
        qualityScore +
        contentScore +
        socialScore -
        penalties,
      100
    );

    // Ensure minimum score for basic users
    const finalScore = Math.max(totalScore, 5);

    console.log("🔍 [TRUST SCORE BREAKDOWN]:", {
      profileScore,
      longevityScore,
      activityScore,
      qualityScore,
      contentScore,
      socialScore,
      penalties,
      totalScore,
      finalScore,
      userTier: user.tier,
      isVerified: user.isVerified,
    });

    return finalScore;
  } catch (error) {
    console.error("Error calculating trust score:", error);
    return 10; // Default score for error cases
  }
};

const SchedulerComponent = ({
  onSubmit,
  getScheduleData,
  isLoading = false,
  isSchedulerOpen,
  setisSchedulerOpen,
}: SubmitProps) => {
  const { user: clerkUser } = useUser();
  const { user: currentUser, isLoading: userLoading } = useCurrentUser();
  const { gigs } = useGigs(currentUser?._id);
  const { isInGracePeriod } = useCheckTrial();
  const { colors } = useThemeColors();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeOption, setActiveOption] = useState<
    "automatic" | "regular" | "create" | null
  >(null);
  const [showTrustInfo, setShowTrustInfo] = useState(false);
  const [scoreBreakdown, setScoreBreakdown] = useState<any>(null);

  // Filter gigs created by the logged-in user
  const userGigs =
    gigs && gigs?.filter((gig: any) => gig.postedBy?.clerkId === clerkUser?.id);

  // Calculate user's trust score
  const trustScore = calculateUserTrustScore(currentUser);
  const trustStars = scoreToStars(trustScore);
  const trustTier = getTrustTierFromScore(trustScore);

  // Eligibility checks - ONLY BASED ON TRUST SCORE & VERIFICATION
  const isVerified = currentUser?.verified || false;
  const isFreeUser = currentUser?.tier === "free";

  // Free users in grace period have basic access
  const canCreateDuringGrace = isFreeUser && isInGracePeriod;

  const hasMinTrustForBasic =
    trustScore >= getRoleThreshold("canPostBasicGigs", currentUser);
  const hasMinTrustForPremium =
    trustScore >= getRoleThreshold("canPostPremiumGigs", currentUser);
  const hasMinTrustForCreate =
    trustScore >= getRoleThreshold("canCreateBand", currentUser);

  // Check if user can create more gigs
  // Free users: 3 gigs max (grace period or not)
  // Paid users: unlimited
  const isPaidUser =
    currentUser?.tier && ["pro", "premium", "elite"].includes(currentUser.tier);
  const canCreateMoreGigs = isPaidUser || userGigs.length < 3;

  // Determine which options are available
  // AUTOMATIC: Paid users only with high trust score
  const canUseAutomatic =
    isPaidUser && // Only paid users
    isVerified &&
    hasMinTrustForPremium &&
    canCreateMoreGigs;

  // REGULAR: Any verified user with basic trust score (free during grace, paid anytime)
  const canUseRegular =
    isVerified &&
    hasMinTrustForBasic &&
    canCreateMoreGigs &&
    (isPaidUser || canCreateDuringGrace);

  // CREATE: Any verified user with high trust score (free during grace, paid anytime)
  const canUseCreate =
    isVerified &&
    hasMinTrustForCreate &&
    canCreateMoreGigs &&
    (isPaidUser || canCreateDuringGrace);

  // Determine if we should show overlays
  const showCreateLimitOverlay = !canCreateMoreGigs && isFreeUser;
  const showVerificationOverlay = !isVerified;
  const showTrustScoreOverlay = !hasMinTrustForBasic;
  const showGracePeriodOverlay = isFreeUser && !isInGracePeriod;

  // Profile completeness check
  const isProfileComplete = checkProfileCompleteness(currentUser);

  const handleSubmit = (type: "automatic" | "regular" | "create") => {
    if (isLoading) return;

    // Double-check eligibility
    if (!isVerified) {
      alert("Please verify your account first");
      return;
    }

    if (!isProfileComplete) {
      alert("Please complete your profile before creating gigs");
      return;
    }

    if (!hasMinTrustForBasic) {
      alert("Your trust score is too low. Build your reputation first.");
      return;
    }

    if (!canCreateMoreGigs && isFreeUser) {
      alert("Free users are limited to 3 gigs. Upgrade to create more.");
      return;
    }

    if (isFreeUser && !isInGracePeriod) {
      alert("Your grace period has ended. Upgrade to continue creating gigs.");
      return;
    }

    const e = { preventDefault: () => {} } as FormEvent<HTMLFormElement>;

    if (type === "automatic" && selectedDate) {
      getScheduleData("automatic", selectedDate);
    } else {
      getScheduleData(type);
    }

    onSubmit(e);
    setisSchedulerOpen(false);
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case "elite":
        return "bg-purple-100 text-purple-800";
      case "premium":
        return "bg-blue-100 text-blue-800";
      case "pro":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTrustTierColor = (tier: string) => {
    switch (tier) {
      case "elite":
        return "bg-gradient-to-r from-purple-600 to-purple-800";
      case "trusted":
        return "bg-gradient-to-r from-green-600 to-emerald-800";
      case "verified":
        return "bg-gradient-to-r from-blue-600 to-blue-800";
      case "basic":
        return "bg-gradient-to-r from-amber-600 to-amber-800";
      default:
        return "bg-gradient-to-r from-gray-600 to-gray-800";
    }
  };

  const schedulerStyles = {
    automatic: {
      border: colors.border,
      bg: colors.card,
      activeBorder: "border-blue-600",
      activeBg: colors.hoverBg,
      button:
        "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
      text: colors.text,
      icon: "text-blue-500",
      disabledBg: colors.backgroundMuted,
      disabledText: colors.textMuted,
      disabledBorder: colors.border,
    },
    regular: {
      border: colors.border,
      bg: colors.card,
      activeBorder: "border-emerald-600",
      activeBg: colors.hoverBg,
      button:
        "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
      text: colors.text,
      icon: "text-emerald-500",
      disabledBg: colors.backgroundMuted,
      disabledText: colors.textMuted,
      disabledBorder: colors.border,
    },
    create: {
      border: colors.border,
      bg: colors.card,
      activeBorder: "border-amber-600",
      activeBg: colors.hoverBg,
      button:
        "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
      text: colors.text,
      icon: "text-amber-500",
      disabledBg: colors.backgroundMuted,
      disabledText: colors.textMuted,
      disabledBorder: colors.border,
    },
  };

  const optionsToRender = [
    {
      id: "automatic",
      label: "Automatic Scheduling",
      description: "Set a specific date to automatically post publicly.",
      available: canUseAutomatic,
      requires: "Pro subscription & high trust score",
      icon: "⏰",
    },
    {
      id: "regular",
      label: "Regular Scheduling",
      description: "Gig will be created but disabled until you activate it.",
      available: canUseRegular,
      requires: "Verified account & basic trust score",
      icon: "📅",
    },
    {
      id: "create",
      label: "Immediate Creation",
      description: "Create gig immediately without scheduling.",
      available: canUseCreate,
      requires: "Verified account & high trust score",
      icon: "⚡",
    },
  ] as const;

  // User info panel
  const UserStatusPanel = () => (
    <div
      className={cn(
        "mb-4 p-4 rounded-lg border",
        colors.border,
        colors.backgroundMuted
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-2">
          {/* Status badges row */}
          <div className="flex flex-wrap gap-2">
            {/* Verification badge */}
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                isVerified
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {isVerified ? "✓ Verified" : "⚠ Not Verified"}
            </span>

            {/* Tier badge */}
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getTierBadgeColor(
                currentUser?.tier || "free"
              )}`}
            >
              {currentUser?.tier
                ? `⭐ ${currentUser.tier.charAt(0).toUpperCase() + currentUser.tier.slice(1)}`
                : "Free"}
            </span>

            {/* Trust tier badge */}
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getTrustTierColor(trustTier)}`}
            >
              🛡️ {trustTier.charAt(0).toUpperCase() + trustTier.slice(1)}
            </span>

            {/* Grace period badge */}
            {isFreeUser && (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isInGracePeriod
                    ? "bg-purple-100 text-purple-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {isInGracePeriod ? "🕒 Grace Period" : "⏰ Grace Ended"}
              </span>
            )}

            {/* Profile completeness */}
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                isProfileComplete
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isProfileComplete ? "✓ Complete" : "✗ Incomplete"}
            </span>
          </div>

          {/* Trust score and gigs row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={cn("text-sm", colors.textMuted)}>
                Trust Score:
              </span>
              <div className="flex items-center gap-1">
                <div className="relative">
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 via-green-500 to-blue-500 transition-all duration-500"
                      style={{ width: `${trustScore}%` }}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-bold absolute -top-5 left-0",
                      colors.text
                    )}
                  >
                    {trustScore}/100
                  </span>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-3 h-3 ${i < Math.floor(trustStars) ? "text-amber-500" : "text-gray-300"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <button
                  onClick={() => setShowTrustInfo(!showTrustInfo)}
                  className="text-xs text-blue-500 hover:text-blue-700 ml-1"
                >
                  {showTrustInfo ? "Hide" : "Details"}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className={cn("text-sm", colors.textMuted)}>
                Gigs: {userGigs.length}/3
              </span>
              {isFreeUser && (
                <span className={cn("text-sm", colors.textMuted)}>
                  Status: {isInGracePeriod ? "In Grace Period" : "Grace Ended"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {!isProfileComplete && (
            <button
              onClick={() => window.open("/profile/edit", "_blank")}
              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
            >
              Complete Profile
            </button>
          )}

          {trustScore < FEATURE_SCORE_THRESHOLDS.canPostBasicGigs && (
            <button
              onClick={() => window.open("/profile/trust", "_blank")}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-lg transition-colors"
            >
              Improve Trust
            </button>
          )}
        </div>
      </div>

      {/* Trust score details */}
      {showTrustInfo && (
        <div className={cn("mt-3 pt-3 border-t", colors.border)}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
            {["canPostBasicGigs", "canPostPremiumGigs", "canCreateBand"].map(
              (feature) => {
                const threshold = getRoleThreshold(
                  feature as keyof typeof FEATURE_SCORE_THRESHOLDS,
                  currentUser
                );
                const isUnlocked = trustScore >= threshold;
                const featureNames: Record<string, string> = {
                  canPostBasicGigs: "Post Basic Gigs",
                  canPostPremiumGigs: "Post Premium Gigs",
                  canCreateBand: "Create Bands",
                };

                return (
                  <div
                    key={feature}
                    className={cn(
                      "p-2 rounded-lg border text-center",
                      colors.border
                    )}
                  >
                    <div className="text-xs text-gray-500 mb-1">
                      {featureNames[feature]}
                    </div>
                    <div
                      className={
                        isUnlocked ? "text-green-600 font-bold" : "text-red-600"
                      }
                    >
                      {isUnlocked
                        ? "✓ Unlocked"
                        : `Need ${threshold - trustScore}`}
                    </div>
                    {threshold === 999 && (
                      <div className="text-xs text-gray-400 mt-1">
                        Not for your role
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (userLoading) {
    return (
      <Modal
        isOpen={isSchedulerOpen}
        onClose={() => setisSchedulerOpen(false)}
        title="Loading..."
        description="Checking your eligibility"
      >
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isSchedulerOpen}
      onClose={() => !isLoading && setisSchedulerOpen(false)}
      title="Final Step: Gig Creation Options"
      description="Choose how you'd like to create your gig"
    >
      <div className="space-y-4 md:space-y-6 p-2 md:p-4 w-full">
        {/* User Status Panel */}
        <UserStatusPanel />

        {/* Verification Overlay */}
        {showVerificationOverlay && (
          <div
            className={cn(
              "mb-4 p-4 rounded-lg border",
              "border-amber-400 bg-amber-50"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-amber-600 text-xl">⚠</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-amber-900">
                  Account Verification Required
                </h4>
                <p className="text-sm text-amber-700">
                  Please verify your account to create gigs. This helps ensure a
                  safe community.
                </p>
                <button
                  onClick={() =>
                    window.open("/settings/verification", "_blank")
                  }
                  className="mt-2 px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg transition-colors"
                >
                  Verify Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Incomplete Overlay */}
        {!isProfileComplete && isVerified && (
          <div
            className={cn(
              "mb-4 p-4 rounded-lg border",
              "border-red-400 bg-red-50"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-xl">✗</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-red-900">
                  Profile Incomplete
                </h4>
                <p className="text-sm text-red-700">
                  Please complete your profile (name, location, phone, profile
                  picture) before creating gigs.
                </p>
                <button
                  onClick={() => window.open("/profile/edit", "_blank")}
                  className="mt-2 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                >
                  Complete Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Trust Score Overlay */}
        {showTrustScoreOverlay && isVerified && isProfileComplete && (
          <TrustScoreOverlay
            currentScore={trustScore}
            requiredScore={FEATURE_SCORE_THRESHOLDS.canPostBasicGigs}
          />
        )}

        {/* Grace Period Overlay */}
        {showGracePeriodOverlay &&
          isVerified &&
          isProfileComplete &&
          hasMinTrustForBasic && (
            <CreateLimitOverlay
              showCreateLimitOverlay={showCreateLimitOverlay}
              isInGracePeriod={false}
            />
          )}

        {/* Create Limit Overlay (not grace period related) */}
        {showCreateLimitOverlay && isInGracePeriod && (
          <CreateLimitOverlay
            showCreateLimitOverlay={showCreateLimitOverlay}
            isInGracePeriod={true}
          />
        )}

        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-30 rounded-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Scheduling Options */}
        {optionsToRender.map((option) => {
          const isActive = activeOption === option.id;
          const styles = schedulerStyles[option.id];
          const isDisabled =
            !option.available || isLoading || !isProfileComplete;

          const handleCardClick = () => {
            if (!isDisabled) setActiveOption(option.id);
          };

          return (
            <div
              key={option.id}
              className={cn(
                "p-4 md:p-6 border-2 rounded-xl transition-all duration-300 relative",
                isDisabled
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer hover:shadow-md",
                isActive
                  ? cn(styles.activeBorder, styles.activeBg, "shadow-lg")
                  : cn(styles.border, styles.bg)
              )}
              onClick={handleCardClick}
            >
              {/* Requirement Badge */}
              <div className="absolute top-3 right-3">
                {!option.available && (
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      "bg-gray-100 text-gray-700"
                    )}
                  >
                    🔒 {option.requires}
                  </span>
                )}
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center mr-3 text-lg",
                        option.id === "automatic" &&
                          "bg-blue-100 text-blue-600",
                        option.id === "regular" &&
                          "bg-emerald-100 text-emerald-600",
                        option.id === "create" && "bg-amber-100 text-amber-600"
                      )}
                    >
                      {option.icon}
                    </div>
                    <div>
                      <h3
                        className={cn(
                          "text-base md:text-lg font-semibold",
                          styles.text
                        )}
                      >
                        {option.label}
                      </h3>
                      <p className={cn("text-sm md:text-base", styles.text)}>
                        {option.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Date picker for automatic option */}
                {isActive && option.id === "automatic" && (
                  <div className="mt-4 md:mt-0 md:ml-4 w-full md:w-auto">
                    <label
                      className={cn(
                        "block text-xs md:text-sm font-medium mb-1",
                        styles.text
                      )}
                    >
                      Post Date
                    </label>
                    <input
                      type="datetime-local"
                      className={cn(
                        "w-full p-2 text-xs md:text-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        colors.border,
                        colors.background
                      )}
                      onChange={(e) =>
                        setSelectedDate(new Date(e.target.value))
                      }
                      min={new Date().toISOString().slice(0, 16)}
                      required
                      disabled={isDisabled}
                    />
                  </div>
                )}

                {/* Submit button */}
                {isActive && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (option.id === "automatic" && !selectedDate) return;
                      handleSubmit(option.id);
                    }}
                    disabled={
                      isDisabled || (option.id === "automatic" && !selectedDate)
                    }
                    className={cn(
                      "mt-4 md:mt-0 md:ml-4 w-full md:w-auto px-4 py-2 text-sm md:text-base rounded-lg text-white font-medium transition-all flex items-center justify-center",
                      isDisabled || (option.id === "automatic" && !selectedDate)
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : cn(styles.button, "shadow-md hover:shadow-lg")
                    )}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      `Use ${option.label}`
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Eligibility Summary */}
        <div
          className={cn(
            "mt-4 pt-4 border-t text-sm",
            colors.border,
            colors.textMuted
          )}
        >
          <p className="font-medium mb-2">Eligibility Summary:</p>
          <ul className="space-y-1">
            <li className="flex items-center gap-2">
              <span className={isVerified ? "text-green-600" : "text-red-600"}>
                {isVerified ? "✓" : "✗"}
              </span>
              <span>
                Account Verification: {isVerified ? "Verified" : "Required"}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span
                className={
                  isProfileComplete ? "text-green-600" : "text-red-600"
                }
              >
                {isProfileComplete ? "✓" : "✗"}
              </span>
              <span>
                Profile Completeness:{" "}
                {isProfileComplete ? "Complete" : "Incomplete"}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span
                className={
                  hasMinTrustForBasic ? "text-green-600" : "text-red-600"
                }
              >
                {hasMinTrustForBasic ? "✓" : "✗"}
              </span>
              <span>
                Trust Score: {trustScore}/100 (
                {hasMinTrustForBasic ? "Passed" : "Need 10+"})
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span
                className={
                  canCreateMoreGigs ? "text-green-600" : "text-red-600"
                }
              >
                {canCreateMoreGigs ? "✓" : "✗"}
              </span>
              <span>
                Gig Limit: {userGigs.length}/3 (
                {canCreateMoreGigs ? "OK" : "Limit Reached"})
              </span>
            </li>
            {isFreeUser && (
              <li className="flex items-center gap-2">
                <span
                  className={
                    isInGracePeriod ? "text-green-600" : "text-red-600"
                  }
                >
                  {isInGracePeriod ? "✓" : "✗"}
                </span>
                <span>
                  Grace Period: {isInGracePeriod ? "Active" : "Ended"}
                </span>
              </li>
            )}
          </ul>

          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Need help?</strong> Visit the{" "}
              <a
                href="/help/eligibility"
                className="text-blue-600 hover:underline font-medium"
              >
                eligibility guide
              </a>{" "}
              to learn how to unlock all features.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SchedulerComponent;
