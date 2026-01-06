"use client";

import React, { FormEvent, useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useGigs } from "@/hooks/useAllGigs";
import { useCheckTrial } from "@/hooks/useCheckTrial";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Modal } from "@/components/modals/Modal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  Zap,
  Lock,
  CheckCircle,
  ChevronRight,
  Shield,
  Star,
  Rocket,
  CalendarDays,
  CalendarClock,
  ArrowRight,
  Trophy,
  Gem,
  X,
  AlertCircle,
  ShieldCheck,
  Users,
  UserCheck,
  Loader2,
  Check,
  Timer,
  Bolt,
  CalendarCheck,
  FileText,
  Cloud,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Trust score imports
import {
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
import { useThemeColors } from "@/hooks/useTheme";

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

// Subcomponents
const CreateLimitOverlay = ({
  showCreateLimitOverlay,
  isInGracePeriod = false,
}: {
  showCreateLimitOverlay: boolean;
  isInGracePeriod?: boolean;
}) => {
  if (!showCreateLimitOverlay) return null;
  const theme = isInGracePeriod ? "purple" : "red";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <div
        className={cn(
          "rounded-xl p-4 backdrop-blur-sm border",
          theme === "purple"
            ? "border-purple-200 bg-gradient-to-br from-purple-50 to-white"
            : "border-red-200 bg-gradient-to-br from-red-50 to-white"
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
              theme === "purple"
                ? "bg-gradient-to-br from-purple-500 to-purple-600"
                : "bg-gradient-to-br from-red-500 to-red-600"
            )}
          >
            {isInGracePeriod ? (
              <Calendar className="w-5 h-5 text-white" />
            ) : (
              <Lock className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="flex-1">
            <h3
              className={cn(
                "text-sm font-semibold mb-1",
                theme === "purple" ? "text-purple-900" : "text-red-900"
              )}
            >
              {isInGracePeriod ? "Grace Period Active" : "Free Tier Limit"}
            </h3>
            <p
              className={cn(
                "text-xs mb-3",
                theme === "purple" ? "text-purple-700" : "text-red-700"
              )}
            >
              {isInGracePeriod
                ? "Upgrade to Pro for unlimited gigs"
                : "Free users limited to 3 gigs"}
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open("/pricing", "_blank")}
              className={cn(
                "px-4 py-2 text-xs rounded-lg font-medium text-white",
                theme === "purple"
                  ? "bg-gradient-to-r from-purple-600 to-purple-700"
                  : "bg-gradient-to-r from-red-600 to-red-700"
              )}
            >
              Upgrade Now
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const TrustScoreOverlay = ({
  currentScore,
  requiredScore,
}: {
  currentScore: number;
  requiredScore: number;
}) => {
  const scoreNeeded = requiredScore - currentScore;
  const percentage = Math.min((currentScore / requiredScore) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-amber-900 mb-1">
              Trust Score Required
            </h3>
            <p className="text-xs text-amber-700 mb-3">
              Need <strong>{scoreNeeded} more points</strong> to unlock this
              feature
            </p>

            <div className="mb-3">
              <div className="flex justify-between text-xs text-amber-700 mb-1">
                <span>
                  {currentScore}/{requiredScore} points
                </span>
                <span className="font-semibold">{percentage.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open("/profile/edit", "_blank")}
              className="px-4 py-2 text-xs rounded-lg font-medium bg-gradient-to-r from-amber-600 to-orange-600 text-white"
            >
              Improve Score
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main Component
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

  const [currentStep, setCurrentStep] = useState<
    "eligibility" | "selection" | "confirmation"
  >("eligibility");
  // Add this helper function in SchedulerComponent
  const getWeeklyGigStats = () => {
    // Get current week start (Monday)
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
    currentWeekStart.setHours(0, 0, 0, 0);

    const weekStartTimestamp = currentWeekStart.getTime();

    // Get weekly gigs posted from user data
    const gigsThisWeek = currentUser?.gigsPostedThisWeek || {
      count: 0,
      weekStart: 0,
    };
    const weeklyGigsPosted =
      gigsThisWeek.weekStart === weekStartTimestamp ? gigsThisWeek.count : 0;

    // Calculate weekly limit based on tier and trust score
    let weeklyLimit = 0;

    if (isFreeUser) {
      if (isInGracePeriod) {
        weeklyLimit = 3; // Grace period: 3 gigs per week
      } else {
        weeklyLimit = 0; // Post-grace period: 0 gigs
      }
    } else if (isProUser) {
      weeklyLimit = trustScore >= 40 ? 3 : 1; // 3 if trust ≥ 40, else 1
    } else if (isPremiumUser) {
      weeklyLimit = trustScore >= 40 ? 5 : 2; // 5 if trust ≥ 40, else 2
    }

    return {
      weeklyGigsPosted,
      weeklyLimit,
      remainingGigs: Math.max(0, weeklyLimit - weeklyGigsPosted),
      isNewWeek: gigsThisWeek.weekStart !== weekStartTimestamp,
    };
  };
  // Calculate trust score
  const calculateUserTrustScore = (user: any): number => {
    if (!user) return 0;
    try {
      const profileScore = calculateProfilePoints(user);
      const longevityScore = calculateLongevityPoints(user);
      const activityScore = calculateActivityPoints(user);
      const qualityScore = calculateQualityPoints(user);
      const contentScore = calculateContentPoints(user);
      const socialScore = calculateSocialPoints(user);
      const penalties = calculatePenalties(user);

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
      return Math.max(totalScore, 5);
    } catch (error) {
      return 10;
    }
  };

  // Filter user's gigs
  const userGigs =
    gigs?.filter((gig: any) => gig.postedBy?.clerkId === clerkUser?.id) || [];

  // User status calculations
  const trustScore = calculateUserTrustScore(currentUser);
  const trustTier = getTrustTierFromScore(trustScore);
  const isVerified = currentUser?.verified || false;
  const isFreeUser = currentUser?.tier === "free";
  const isProUser = currentUser?.tier === "pro";
  const isPremiumUser = ["premium", "elite"].includes(currentUser?.tier || "");
  const canCreateDuringGrace = isFreeUser && isInGracePeriod;
  const isPaidUser = isProUser || isPremiumUser;
  const isProfileComplete = checkProfileCompleteness(currentUser);
  const weeklyStats = getWeeklyGigStats();
  const canCreateMoreGigs = isPaidUser || weeklyStats.remainingGigs > 0;
  // Trust score requirements
  const hasMinTrustForBasic = trustScore >= 10;
  const hasMinTrustForRegular = trustScore >= 40;
  const hasMinTrustForAutomatic = trustScore >= 60;

  const canUseCreate =
    isVerified &&
    hasMinTrustForBasic &&
    canCreateMoreGigs &&
    (isPaidUser || canCreateDuringGrace) &&
    isProfileComplete;

  const canUseRegular =
    isVerified &&
    isProUser &&
    hasMinTrustForRegular &&
    canCreateMoreGigs &&
    isProfileComplete;

  const canUseAutomatic =
    isVerified &&
    isProUser &&
    hasMinTrustForAutomatic &&
    canCreateMoreGigs &&
    isProfileComplete;

  // Overlay conditions
  const showCreateLimitOverlay = !canCreateMoreGigs && isFreeUser;
  const showVerificationOverlay = !isVerified;
  const showTrustScoreOverlay = !hasMinTrustForBasic;
  const showGracePeriodOverlay = isFreeUser && !isInGracePeriod;
  const showProfileIncompleteOverlay = !isProfileComplete && isVerified;

  const handleSubmit = (type: "automatic" | "regular" | "create") => {
    if (isLoading) return;

    const validations = {
      create: () => {
        if (!isVerified) {
          toast.error("Please verify your account first");
          return false;
        }
        if (!isProfileComplete) {
          toast.error("Please complete your profile before creating gigs");
          return false;
        }
        if (!hasMinTrustForBasic) {
          toast.error(
            "Your trust score is too low. Build your reputation first."
          );
          return false;
        }
        if (!canCreateMoreGigs && isFreeUser) {
          toast.error(
            "Free users are limited to 3 gigs. Upgrade to create more."
          );
          return false;
        }
        if (isFreeUser && !isInGracePeriod) {
          toast.error(
            "Your grace period has ended. Upgrade to continue creating gigs."
          );
          return false;
        }
        return true;
      },
      regular: () => {
        if (!isProUser && !isPremiumUser) {
          toast.error("Regular scheduling requires Pro subscription");
          return false;
        }
        if (!hasMinTrustForRegular) {
          toast.error("Regular scheduling requires trust score 40+");
          return false;
        }
        return true;
      },
      automatic: () => {
        if (!isProUser && !isPremiumUser) {
          toast.error("Automatic scheduling requires Pro subscription");
          return false;
        }
        if (!hasMinTrustForAutomatic) {
          toast.error("Automatic scheduling requires trust score 60+");
          return false;
        }
        if (!selectedDate) {
          toast.error("Please select a date for automatic scheduling");
          return false;
        }
        return true;
      },
    };

    if (!validations[type]()) return;

    const e = { preventDefault: () => {} } as FormEvent<HTMLFormElement>;
    if (type === "automatic" && selectedDate) {
      getScheduleData("automatic", selectedDate);
    } else {
      getScheduleData(type);
    }
    onSubmit(e);
    setisSchedulerOpen(false);
  };

  // Stepper Component - IMPROVED FOR MOBILE
  const Stepper = () => (
    <div className="mb-6 px-1">
      <div className="flex items-center justify-between relative">
        {/* Connector line background */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 mx-10 md:mx-16" />

        {[
          {
            id: "eligibility",
            label: "Check Eligibility",
            icon: <ShieldCheck className="w-4 h-4" />,
            color: "blue",
          },
          {
            id: "selection",
            label: "Choose Method",
            icon: <CalendarCheck className="w-4 h-4" />,
            color: "purple",
          },
          {
            id: "confirmation",
            label: "Confirm",
            icon: <CheckCircle className="w-4 h-4" />,
            color: "green",
          },
        ].map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted =
            currentStep === "confirmation" ||
            (step.id === "eligibility" && currentStep !== "eligibility");

          return (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id as any)}
              className="relative flex flex-col items-center gap-2 z-10 flex-1 px-1"
            >
              {/* Step circle - responsive sizing */}
              <div className="relative">
                <div
                  className={cn(
                    "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    isActive
                      ? step.color === "blue"
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 border-transparent text-white shadow-lg"
                        : step.color === "purple"
                          ? "bg-gradient-to-br from-purple-500 to-purple-600 border-transparent text-white shadow-lg"
                          : "bg-gradient-to-br from-green-500 to-green-600 border-transparent text-white shadow-lg"
                      : isCompleted
                        ? step.color === "blue"
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 border-transparent text-white"
                          : step.color === "purple"
                            ? "bg-gradient-to-br from-purple-500 to-purple-600 border-transparent text-white"
                            : "bg-gradient-to-br from-green-500 to-green-600 border-transparent text-white"
                        : "border-gray-300 bg-white text-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 md:w-5 md:h-5" />
                  ) : (
                    React.cloneElement(step.icon, {
                      className: "w-4 h-4 md:w-5 md:h-5",
                    })
                  )}
                </div>

                {/* Connector line segment */}
                {index > 0 && (
                  <div
                    className={cn(
                      "absolute top-4 -left-1/2 w-full h-0.5",
                      isCompleted
                        ? "bg-gradient-to-r from-blue-500 to-purple-500"
                        : "bg-gray-200"
                    )}
                  />
                )}

                {/* Active pulse effect */}
                {isActive && (
                  <div className="absolute inset-0 rounded-full animate-ping bg-blue-500/20" />
                )}
              </div>

              {/* Step label - responsive text */}
              <div className="text-center max-w-[100px] md:max-w-none">
                <span
                  className={cn(
                    "text-[10px] md:text-xs font-medium block truncate",
                    isActive
                      ? step.color === "blue"
                        ? "text-blue-600"
                        : step.color === "purple"
                          ? "text-purple-600"
                          : "text-green-600"
                      : isCompleted
                        ? "text-gray-700"
                        : "text-gray-500"
                  )}
                >
                  {step.label.split(" ")[0]}
                </span>
                {step.label.includes(" ") && (
                  <span
                    className={cn(
                      "text-[10px] md:text-xs font-medium block truncate",
                      isActive
                        ? step.color === "blue"
                          ? "text-blue-600"
                          : step.color === "purple"
                            ? "text-purple-600"
                            : "text-green-600"
                        : isCompleted
                          ? "text-gray-700"
                          : "text-gray-500"
                    )}
                  >
                    {step.label.split(" ").slice(1).join(" ")}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // IMPROVED Status Cards Component - NO TEXT OVERFLOW
  const StatusCards = () => {
    const getTrustLevel = (score: number) => {
      if (score >= 60) return { label: "Excellent", color: "emerald" };
      if (score >= 40) return { label: "Good", color: "blue" };
      if (score >= 10) return { label: "Fair", color: "amber" };
      return { label: "Low", color: "red" };
    };

    // Add these calculations BEFORE the cards array
    const trustLevel = getTrustLevel(trustScore);

    // Calculate weekly gig stats
    const getWeeklyGigStats = () => {
      // Get current week start (Monday)
      const now = new Date();
      const currentWeekStart = new Date(now);
      currentWeekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
      currentWeekStart.setHours(0, 0, 0, 0);

      const weekStartTimestamp = currentWeekStart.getTime();

      // Get weekly gigs posted from user data
      const gigsThisWeek = currentUser?.gigsPostedThisWeek || {
        count: 0,
        weekStart: 0,
      };
      const weeklyGigsPosted =
        gigsThisWeek.weekStart === weekStartTimestamp ? gigsThisWeek.count : 0;

      // Calculate weekly limit based on tier and trust score
      let weeklyLimit = 0;

      if (isFreeUser) {
        if (isInGracePeriod) {
          weeklyLimit = 3; // Grace period: 3 gigs per week
        } else {
          weeklyLimit = 0; // Post-grace period: 0 gigs
        }
      } else if (isProUser) {
        weeklyLimit = trustScore >= 40 ? 3 : 1; // 3 if trust ≥ 40, else 1
      } else if (isPremiumUser) {
        weeklyLimit = trustScore >= 40 ? 5 : 2; // 5 if trust ≥ 40, else 2
      }

      return {
        weeklyGigsPosted,
        weeklyLimit,
        remainingGigs: Math.max(0, weeklyLimit - weeklyGigsPosted),
        isNewWeek: gigsThisWeek.weekStart !== weekStartTimestamp,
      };
    };

    const weeklyStats = getWeeklyGigStats();

    // User tier info for display
    const getTierInfo = () => {
      const tier = currentUser?.tier?.toLowerCase() || "free";
      return {
        displayName: tier.charAt(0).toUpperCase() + tier.slice(1),
        isPaid: isPaidUser,
        color: isProUser ? "purple" : isPremiumUser ? "amber" : "gray",
      };
    };

    const tierInfo = getTierInfo();

    // Check if user can create more gigs (weekly limit)
    const canCreateWeekly = weeklyStats.remainingGigs > 0 || isPaidUser;

    const cards = [
      {
        id: "trust",
        label: "Trust Score",
        value: trustScore,
        status: trustScore >= 10 ? "pass" : "fail",
        icon: <Shield className="w-4 h-4" />,
        color: `from-${trustLevel.color}-500 to-${trustLevel.color}-600`,
        badge: trustLevel.label,
        progress: trustScore,
        maxProgress: 100,
        tooltip: `Trust Score: ${trustScore}/100\n${trustScore >= 60 ? "Eligible for all features" : trustScore >= 40 ? "Can schedule manually" : "Basic creation only"}`,
        action: trustScore < 10 ? "Improve" : null,
        onClick: () => window.open("/profile/trust-score", "_blank"),
      },
      {
        id: "weekly-gigs",
        label: "Weekly Gig Slots",
        value: `${weeklyStats.weeklyGigsPosted}/${weeklyStats.weeklyLimit}`,
        status: canCreateWeekly ? "pass" : "fail",
        icon: <Calendar className="w-4 h-4" />,
        color: canCreateWeekly
          ? weeklyStats.weeklyGigsPosted === 0
            ? "from-gray-500 to-gray-600"
            : "from-blue-500 to-blue-600"
          : "from-red-500 to-red-600",
        badge: canCreateWeekly ? "Available" : "Full",
        progress: weeklyStats.weeklyGigsPosted,
        maxProgress: weeklyStats.weeklyLimit,
        tooltip: isPaidUser
          ? `🎉 ${tierInfo.displayName} plan: ${weeklyStats.weeklyLimit} gigs per week\n${weeklyStats.remainingGigs} slot${weeklyStats.remainingGigs === 1 ? "" : "s"} remaining`
          : isInGracePeriod
            ? `🆓 Grace period: ${weeklyStats.weeklyLimit} gigs per week\n${weeklyStats.remainingGigs} slot${weeklyStats.remainingGigs === 1 ? "" : "s"} remaining`
            : "Free tier limit reached. Upgrade to post gigs",
        action: !canCreateWeekly ? "Upgrade" : null,
        onClick: () => !canCreateWeekly && window.open("/pricing", "_blank"),
      },
      {
        id: "plan",
        label: "Plan",
        value: isProUser ? "Pro" : isPremiumUser ? "Premium" : "Free",
        status: isProUser || isPremiumUser ? "pass" : "neutral",
        icon: <Star className="w-4 h-4" />,
        color: isProUser
          ? "from-purple-500 to-purple-600"
          : isPremiumUser
            ? "from-amber-500 to-amber-600"
            : "from-gray-500 to-gray-600",
        badge: isProUser ? "Pro" : isPremiumUser ? "Premium" : "Free",
        tooltip: isProUser
          ? "Pro benefits unlocked"
          : isPremiumUser
            ? "Premium benefits unlocked"
            : "Upgrade for advanced features",
        action: !isProUser && !isPremiumUser ? "Upgrade" : null,
        onClick: () =>
          !isProUser && !isPremiumUser && window.open("/pricing", "_blank"),
      },
      {
        id: "profile",
        label: "Profile",
        value: isProfileComplete ? "Complete" : "Incomplete",
        status: isProfileComplete ? "pass" : "warning",
        icon: <UserCheck className="w-4 h-4" />,
        color: isProfileComplete
          ? "from-green-500 to-green-600"
          : "from-amber-500 to-amber-600",
        badge: isProfileComplete ? "Complete" : "Incomplete",
        progress: isProfileComplete ? 100 : 60,
        maxProgress: 100,
        tooltip: isProfileComplete
          ? "Profile meets all requirements"
          : "Complete profile to unlock gig creation",
        action: !isProfileComplete ? "Complete" : null,
        onClick: () =>
          !isProfileComplete && window.open("/profile/edit", "_blank"),
      },
    ];

    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={card.onClick}
            className={cn(
              "bg-white rounded-xl border p-3 hover:shadow-md transition-all duration-200 relative group",
              card.action ? "cursor-pointer" : "cursor-default",
              card.status === "pass" && "border-green-200",
              card.status === "warning" && "border-amber-200",
              card.status === "fail" && "border-red-200",
              card.status === "neutral" && "border-gray-200"
            )}
          >
            {/* Tooltip */}
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 bg-gray-900 text-white text-xs py-1.5 px-3 rounded-lg whitespace-pre-line text-center max-w-[180px] shadow-lg">
              {card.tooltip}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center shadow-sm`}
              >
                <div className="text-white">{card.icon}</div>
              </div>

              <div className="text-right">
                <div
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap",
                    card.status === "pass" && "bg-green-100 text-green-700",
                    card.status === "warning" && "bg-amber-100 text-amber-700",
                    card.status === "fail" && "bg-red-100 text-red-700",
                    card.status === "neutral" && "bg-gray-100 text-gray-700"
                  )}
                >
                  {card.badge}
                </div>
              </div>
            </div>

            {/* Content - NO OVERFLOW */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide truncate">
                {card.label}
              </div>

              <div className="flex items-baseline gap-1">
                <div className="text-xl font-bold text-gray-900 truncate">
                  {card.value}
                </div>
                {card.action && (
                  <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                )}
              </div>
            </div>

            {/* Progress bar for relevant cards */}
            {card.progress !== undefined && card.maxProgress !== undefined && (
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>Progress</span>
                  <span className="font-semibold">
                    {Math.round((card.progress / card.maxProgress) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(card.progress / card.maxProgress) * 100}%`,
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full bg-gradient-to-r ${card.color} rounded-full`}
                  />
                </div>
              </div>
            )}

            {/* Action hint */}
            {card.action && (
              <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2">
                <div className="text-[9px] font-medium text-gray-600 bg-white px-2 py-0.5 rounded-full border border-gray-200 shadow-xs whitespace-nowrap">
                  Click to {card.action}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  const SchedulingOptions = () => {
    const options = [
      {
        id: "create",
        title: "Publish Now",
        icon: <Bolt className="w-4 h-4" />,
        color: "from-orange-500 to-red-500",
        available: canUseCreate,
        badge: "Free",
        description: "Live immediately",
        ring: "#f97316",
      },
      {
        id: "regular",
        title: "Save as Draft",
        icon: <FileText className="w-4 h-4" />,
        color: "from-green-500 to-emerald-500",
        available: canUseRegular,
        badge: "Pro",
        description: "Post manually later",
        ring: "#10b981",
      },
      {
        id: "automatic",
        title: "Schedule",
        icon: <CalendarClock className="w-4 h-4" />,
        color: "from-purple-500 to-violet-500",
        available: canUseAutomatic,
        badge: "Pro+",
        description: "Auto-publish later/Platform posts automatically",
        ring: "#8b5cf6",
      },
    ];

    return (
      <>
        {/* Simple Header */}
        <div className="mb-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Publish Method
          </h3>
        </div>

        {/* Clean Cards */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() =>
                option.available && setActiveOption(option.id as any)
              }
              disabled={!option.available}
              className={cn(
                "relative p-3 rounded-lg border transition-all",
                option.available
                  ? "cursor-pointer hover:shadow"
                  : "opacity-50 cursor-not-allowed",
                activeOption === option.id
                  ? "ring-1 ring-offset-1 border-transparent"
                  : "border-gray-200 dark:border-gray-700"
              )}
              style={
                activeOption === option.id
                  ? ({
                      "--tw-ring-color": option.ring,
                    } as React.CSSProperties)
                  : {}
              }
            >
              <div className="flex flex-col items-center gap-2">
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${option.color} flex items-center justify-center`}
                >
                  <div className="text-white">{option.icon}</div>
                </div>

                {/* Text Content */}
                <div className="text-center space-y-1">
                  <div className="font-medium text-gray-900 dark:text-white text-xs">
                    {option.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {option.description}
                  </div>
                  <div
                    className={cn(
                      "text-xs px-2 py-0.5 rounded",
                      option.badge === "Free"
                        ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-300"
                        : "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300"
                    )}
                  >
                    {option.badge}
                  </div>
                </div>

                {/* Selection Dot */}
                {option.available && (
                  <div className="absolute top-2 right-2">
                    {activeOption === option.id ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                    )}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Simple Date Picker */}
        {activeOption === "automatic" && (
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Schedule for:
            </label>
            <input
              type="datetime-local"
              className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
        )}
      </>
    );
  };
  // Confirmation Component
  const ConfirmationView = () => {
    const getOptionDetails = () => {
      switch (activeOption) {
        case "create":
          return {
            title: "Instant Creation",
            description: "Publish immediately",
            icon: <Bolt className="w-5 h-5" />,
            gradient: "from-orange-500 to-red-500",
            color: "orange",
            badge: "Free",
          };
        case "regular":
          return {
            title: "Save as Draft",
            description: "Publish manually later",
            icon: <FileText className="w-5 h-5" />,
            gradient: "from-green-500 to-emerald-500",
            color: "green",
            badge: "Pro",
          };
        case "automatic":
          return {
            title: "Auto-Schedule",
            description: "Auto-publish at set time",
            icon: <CalendarClock className="w-5 h-5" />,
            gradient: "from-purple-500 to-violet-500",
            color: "purple",
            badge: "Pro+",
          };
        default:
          return {
            title: "",
            description: "",
            icon: null,
            gradient: "",
            color: "",
            badge: "",
          };
      }
    };

    const option = getOptionDetails();

    return (
      <div className="flex flex-col h-full">
        {/* Header - Fixed height */}
        <div className="flex-shrink-0 text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-sm mb-3 border border-gray-200 dark:border-gray-700">
            <div
              className={`w-9 h-9 rounded-lg bg-gradient-to-br ${option.gradient} flex items-center justify-center`}
            >
              <Check className="w-4 h-4 text-white" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Ready to Launch
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Confirm your publishing method
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-md mx-auto w-full px-2">
            {/* Main Card */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4">
              {/* Header Row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${option.gradient} flex items-center justify-center`}
                  >
                    {option.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {option.title}
                    </h4>
                    <div className="flex items-center gap-1 mt-0.5">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Ready to go
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    option.badge === "Free"
                      ? "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300"
                      : "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
                  }`}
                >
                  {option.badge}
                </div>
              </div>

              {/* Details Section */}
              <div className="space-y-2">
                {/* Method Info */}
                <div className="p-2 rounded bg-gray-50 dark:bg-gray-800">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                    Publishing Method
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white text-xs">
                    {option.description}
                  </div>
                </div>

                {/* Schedule Info (if auto) */}
                {activeOption === "automatic" && selectedDate && (
                  <div className="p-2 rounded bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/10 dark:to-violet-900/10 border border-purple-100 dark:border-purple-800">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                      Scheduled For
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-medium text-gray-900 dark:text-white text-xs">
                        {selectedDate.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {selectedDate.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Bar */}
                <div className="p-2 rounded bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs font-medium text-green-700 dark:text-green-300">
                        All checks passed
                      </span>
                    </div>
                    <ShieldCheck className="w-3 h-3 text-green-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer with Buttons */}
        <div className="flex-shrink-0 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-md mx-auto w-full px-2">
            <div className="flex flex-col gap-2">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setCurrentStep("selection")}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Back
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleSubmit(activeOption!)}
                disabled={isLoading}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-1.5",
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : `bg-gradient-to-r ${option.gradient} shadow-sm hover:shadow`
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-3 h-3" />
                    <span>Launch Gig</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Small Note */}
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                You can edit this gig later from your dashboard
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (userLoading) {
    return (
      <Modal
        isOpen={isSchedulerOpen}
        onClose={() => setisSchedulerOpen(false)}
        title="Checking Eligibility"
        description="Please wait while we verify your account status"
      >
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-3 border-blue-100 rounded-full" />
            <div className="absolute top-0 left-0 w-16 h-16 border-3 border-blue-500 rounded-full animate-spin border-t-transparent" />
          </div>
          <p className="text-gray-600 text-sm">Loading your profile...</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isSchedulerOpen}
      onClose={() => !isLoading && setisSchedulerOpen(false)}
      title="Schedule Your Gig"
      description="Choose how to publish your gig"
      className="max-w-8xl" // Smaller max width
    >
      <div className="h-[calc(80vh-80px)] flex flex-col overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Stepper */}
        <Stepper />
        {/* Current Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {currentStep === "eligibility" && (
              <>
                <StatusCards />

                {/* Overlays */}
                {showVerificationOverlay && (
                  <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-amber-900">
                          Verification Required
                        </h4>
                        <p className="text-xs text-amber-700">
                          Verify your account to create gigs
                        </p>
                      </div>
                      <button
                        onClick={() => window.open("/verify", "_blank")}
                        className="px-3 py-1.5 text-xs bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-medium"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                )}

                {showProfileIncompleteOverlay && (
                  <div className="rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-white p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-red-900">
                          Profile Incomplete
                        </h4>
                        <p className="text-xs text-red-700">
                          Complete your profile before creating gigs
                        </p>
                      </div>
                      <button
                        onClick={() => window.open("/profile/edit", "_blank")}
                        className="px-3 py-1.5 text-xs bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium"
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                )}

                {showTrustScoreOverlay && (
                  <TrustScoreOverlay
                    currentScore={trustScore}
                    requiredScore={10}
                  />
                )}

                {(showGracePeriodOverlay || showCreateLimitOverlay) && (
                  <CreateLimitOverlay
                    showCreateLimitOverlay={showCreateLimitOverlay}
                    isInGracePeriod={isInGracePeriod}
                  />
                )}

                <div className="flex justify-end pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentStep("selection")}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
                  >
                    Continue to Options
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </>
            )}

            {currentStep === "selection" && (
              <>
                <SchedulingOptions />

                <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-gray-100">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentStep("eligibility")}
                    className="px-5 py-3 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    Back to Status
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      activeOption && setCurrentStep("confirmation")
                    }
                    disabled={!activeOption}
                    className={cn(
                      "px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2",
                      !activeOption && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    Review & Confirm
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </>
            )}

            {currentStep === "confirmation" && <ConfirmationView />}
          </motion.div>
        </AnimatePresence>
      </div>
    </Modal>
  );
};

export default SchedulerComponent;
