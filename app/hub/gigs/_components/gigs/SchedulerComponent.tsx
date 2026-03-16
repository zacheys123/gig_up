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
  Eye,
  EyeOff,
  Key,
  HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SecurityQuestionSetupModal } from "@/components/(main)/SecurityQuestionModal";

interface SubmitProps {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  getScheduleData: (
    type: "automatic" | "regular" | "create",
    date?: Date,
  ) => void;
  isLoading?: boolean;
  isSchedulerOpen: boolean;
  setisSchedulerOpen: (isSchedulerOpen: boolean) => void;
  isFormValid?: boolean;
  validationErrors?: string[];
  formValidationCheck?: () => boolean;
}

// Security Question Verification Modal
const SecurityVerificationModal = ({
  isOpen,
  onClose,
  onVerified,
  securityQuestion,
}: {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  securityQuestion: string;
}) => {
  const { user: clerkUser } = useUser();
  const [answer, setAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const verifySecurity = useMutation(api.controllers.verifyGig.verifySecAnswer);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setAnswer("");
      setError("");
      setAttempts(0);
      setIsLocked(false);
    }
  }, [isOpen]);

  const handleVerify = async () => {
    if (!answer.trim()) {
      setError("Please enter your answer");
      return;
    }

    if (isLocked) {
      toast.error("Too many attempts. Please try again later.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const isValid = await verifySecurity({
        clerkId: clerkUser?.id || "",
        answer: answer.trim(),
      });

      if (isValid) {
        toast.success("Security verified! You can now schedule your gig.", {
          icon: <ShieldCheck className="w-4 h-4 text-green-500" />,
        });
        onVerified();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= 3) {
          setIsLocked(true);
          setError(
            "Too many incorrect attempts. Please try again in 5 minutes.",
          );
          toast.error("Account temporarily locked for security", {
            description: "Too many failed attempts. Please wait 5 minutes.",
          });
        } else {
          setError(`Incorrect answer. ${3 - newAttempts} attempts remaining.`);
        }
      }
    } catch (error: any) {
      setError(error.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading && !isLocked) {
      handleVerify();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden bg-linear-to-b from-[#0B1120] to-[#0F172A] border border-[#1F2A3F] shadow-2xl">
        {/* Header */}
        <div className="relative p-6 border-b border-[#1F2A3F] bg-linear-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />

          <div className="relative flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0B1120]"
              />
            </div>

            <div>
              <DialogTitle className="text-xl font-bold text-white">
                Security Verification
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-400 mt-1">
                Answer your security question to continue
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Security Question Card */}
          <div className="p-4 rounded-xl bg-[#151F2E] border border-[#1F2A3F]">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-4 h-4 text-blue-400" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-400">
                  Security Question
                </p>
                <p className="text-sm font-medium text-white">
                  {securityQuestion}
                </p>
              </div>
            </div>
          </div>

          {/* Answer Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Your Answer
            </label>
            <div className="relative">
              <Input
                type={showAnswer ? "text" : "password"}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your answer"
                className={cn(
                  "pr-10 bg-[#151F2E] border-[#1F2A3F] text-white placeholder:text-gray-600",
                  "focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50",
                  error ? "border-red-500" : "",
                )}
                disabled={isLoading || isLocked}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowAnswer(!showAnswer)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition-colors"
              >
                {showAnswer ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-red-400 flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Attempts Indicator */}
            {attempts > 0 && !isLocked && (
              <div className="flex items-center gap-2 mt-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-all",
                      i <= attempts ? "bg-red-500" : "bg-[#1F2A3F]",
                    )}
                  />
                ))}
              </div>
            )}

            {/* Locked Message */}
            {isLocked && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-red-400 flex items-center gap-2">
                  <Lock className="w-3 h-3" />
                  Too many failed attempts. Please try again in 5 minutes.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleVerify}
              disabled={isLoading || isLocked || !answer.trim()}
              className={cn(
                "w-full h-11 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                "text-white font-medium shadow-lg shadow-blue-600/20",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Verify & Continue
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-[#151F2E]"
            >
              Cancel
            </Button>
          </div>

          {/* Security Note */}
          <div className="pt-4 border-t border-[#1F2A3F]">
            <p className="text-xs text-center text-gray-500">
              <Lock className="w-3 h-3 inline mr-1" />
              Your answer is encrypted and never stored in plain text
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

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
            ? "border-purple-200 bg-linear-to-br from-purple-50 to-white"
            : "border-red-200 bg-linear-to-br from-red-50 to-white",
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
              theme === "purple"
                ? "bg-linear-to-br from-purple-500 to-purple-600"
                : "bg-linear-to-br from-red-500 to-red-600",
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
                theme === "purple" ? "text-purple-900" : "text-red-900",
              )}
            >
              {isInGracePeriod ? "Grace Period Active" : "Free Tier Limit"}
            </h3>
            <p
              className={cn(
                "text-xs mb-3",
                theme === "purple" ? "text-purple-700" : "text-red-700",
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
                  ? "bg-linear-to-r from-purple-600 to-purple-700"
                  : "bg-linear-to-r from-red-600 to-red-700",
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
      <div className="rounded-xl border border-amber-200 bg-linear-to-br from-amber-50 to-white p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
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
                  className="h-full bg-linear-to-r from-amber-500 to-orange-500 rounded-full"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open("/profile", "_blank")}
              className="px-4 py-2 text-xs rounded-lg font-medium bg-linear-to-r from-amber-600 to-orange-600 text-white"
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
  isFormValid = true,
  validationErrors = [],
  formValidationCheck = () => true,
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
  const { isDarkMode } = useThemeColors();
  const [currentStep, setCurrentStep] = useState<
    "eligibility" | "selection" | "confirmation"
  >("eligibility");

  // Security states - ONLY these remain
  const [showSecuritySetup, setShowSecuritySetup] = useState(false);
  const [showSecurityVerification, setShowSecurityVerification] =
    useState(false);
  const [isSecurityVerified, setIsSecurityVerified] = useState(false);

  // Check if user has security question
  const hasSecurityQuestion = currentUser?.securityQuestion;

  // Handle scheduler open - check security first (ONLY verification)
  useEffect(() => {
    if (isSchedulerOpen) {
      if (!hasSecurityQuestion) {
        // No security question - show setup
        setShowSecuritySetup(true);
        setIsSecurityVerified(false);
      } else {
        // Has security question - show verification
        setShowSecurityVerification(true);
        setIsSecurityVerified(false);
      }
    } else {
      // Reset states when scheduler closes
      setShowSecuritySetup(false);
      setShowSecurityVerification(false);
      setIsSecurityVerified(false);
    }
  }, [isSchedulerOpen, hasSecurityQuestion]);

  // Handle security setup success
  const handleSecuritySetupSuccess = async () => {
    setShowSecuritySetup(false);
    // Now show verification with the new question
    setShowSecurityVerification(true);
  };

  // Handle security verification success
  const handleSecurityVerified = () => {
    setIsSecurityVerified(true);
    setShowSecurityVerification(false);
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
        100,
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
  const isFreeUser = currentUser?.tier === "free";
  const isProUser = currentUser?.tier === "pro";
  const isPremiumUser = ["premium", "elite"].includes(currentUser?.tier || "");
  const canCreateDuringGrace = isFreeUser && isInGracePeriod;
  const isPaidUser = isProUser || isPremiumUser;
  const isProfileComplete = checkProfileCompleteness(currentUser);

  // Trust score requirements
  const hasMinTrustForBasic = trustScore >= 10;
  const hasMinTrustForRegular = trustScore >= 40;
  const hasMinTrustForAutomatic = trustScore >= 60;

  // Get weekly gig stats
  const getWeeklyGigStats = () => {
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay() + 1);
    currentWeekStart.setHours(0, 0, 0, 0);

    const weekStartTimestamp = currentWeekStart.getTime();

    const gigsThisWeek = currentUser?.gigsPostedThisWeek || {
      count: 0,
      weekStart: 0,
    };
    const weeklyGigsPosted =
      gigsThisWeek.weekStart === weekStartTimestamp ? gigsThisWeek.count : 0;

    let weeklyLimit = 0;

    if (isFreeUser) {
      if (isInGracePeriod) {
        weeklyLimit = 3;
      } else {
        weeklyLimit = 0;
      }
    } else if (isProUser) {
      weeklyLimit = trustScore >= 40 ? 3 : 1;
    } else if (isPremiumUser) {
      weeklyLimit = trustScore >= 40 ? 5 : 2;
    }

    return {
      weeklyGigsPosted,
      weeklyLimit,
      remainingGigs: Math.max(0, weeklyLimit - weeklyGigsPosted),
      isNewWeek: gigsThisWeek.weekStart !== weekStartTimestamp,
    };
  };

  const weeklyStats = getWeeklyGigStats();
  const canCreateMoreGigs = isPaidUser || weeklyStats.remainingGigs > 0;

  // Base permissions for ALL users (NO verification)
  const canUseCreate =
    hasMinTrustForBasic && canCreateMoreGigs && isProfileComplete;
  const canUseRegular = isProUser && hasMinTrustForRegular;
  const canUseAutomatic = isProUser && hasMinTrustForAutomatic;

  const showCreateLimitOverlay = !canCreateMoreGigs && isFreeUser;
  const showTrustScoreOverlay = !hasMinTrustForBasic;
  const showGracePeriodOverlay = isFreeUser && !isInGracePeriod;
  const showProfileIncompleteOverlay = !isProfileComplete;

  const validateRequiredFields = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Base requirements for ALL users
    if (!isProfileComplete) {
      errors.push("Complete your profile first");
    }

    if (!hasMinTrustForBasic) {
      errors.push(`Trust score ${trustScore}/10 (minimum 10 required)`);
    }

    if (!canCreateMoreGigs && isFreeUser) {
      errors.push("Free tier limit reached. Upgrade to create more gigs");
    }

    if (isFreeUser && !isInGracePeriod) {
      errors.push("Grace period ended. Upgrade to continue");
    }

    // Check specific option requirements
    if (activeOption === "regular" && !hasMinTrustForRegular) {
      errors.push(
        `Trust score ${trustScore}/40 required for regular scheduling`,
      );
    }

    if (activeOption === "automatic") {
      if (!hasMinTrustForAutomatic) {
        errors.push(
          `Trust score ${trustScore}/60 required for automatic scheduling`,
        );
      }
      if (!selectedDate) {
        errors.push("Select a date for automatic scheduling");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const handleSubmit = (type: "automatic" | "regular" | "create") => {
    if (isLoading) return;

    const validations = {
      create: () => {
        if (!isProfileComplete) {
          toast.error("Please complete your profile before creating gigs");
          return false;
        }
        if (!hasMinTrustForBasic) {
          toast.error(
            "Your trust score is too low. Build your reputation first.",
          );
          return false;
        }
        if (!canCreateMoreGigs && isFreeUser) {
          toast.error(
            "Free users are limited to 3 gigs. Upgrade to create more.",
          );
          return false;
        }
        if (isFreeUser && !isInGracePeriod) {
          toast.error(
            "Your grace period has ended. Upgrade to continue creating gigs.",
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

    if (!type || !validations[type]) {
      console.error("Invalid type:", type);
      toast.error("Invalid submission type");
      return;
    }

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

  // Status Cards Component (NO verification card)
  const StatusCards = () => {
    const getTrustLevel = (score: number) => {
      if (score >= 60) return { label: "Excellent", color: "emerald" };
      if (score >= 40) return { label: "Good", color: "blue" };
      if (score >= 10) return { label: "Fair", color: "amber" };
      return { label: "Low", color: "red" };
    };

    const trustLevel = getTrustLevel(trustScore);
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
        tooltip: `Trust Score: ${trustScore}/100`,
        action: trustScore < 10 ? "Improve" : null,
        onClick: () =>
          trustScore < 10 && window.open("/profile/trust-score", "_blank"),
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
          ? `🎉 ${isProUser ? "Pro" : "Premium"} plan: ${weeklyStats.weeklyLimit} gigs per week`
          : isInGracePeriod
            ? `🆓 Grace period: ${weeklyStats.weeklyLimit} gigs per week`
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
        onClick: () => !isProfileComplete && window.open("/profile", "_blank"),
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
              card.status === "neutral" && "border-gray-200",
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
                className={`w-8 h-8 rounded-lg bg-linear-to-br ${card.color} flex items-center justify-center shadow-sm`}
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
                    card.status === "neutral" && "bg-gray-100 text-gray-700",
                  )}
                >
                  {card.badge}
                </div>
              </div>
            </div>

            {/* Content */}
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
                    className={`h-full bg-linear-to-r ${card.color} rounded-full`}
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

  // Scheduling Options (NO verification badges)
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
        description: "Auto-publish later",
        ring: "#8b5cf6",
      },
    ];

    return (
      <>
        <div className="mb-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Publish Method
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3 mx-1">
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
                  : "border-gray-200 dark:border-gray-700",
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
                <div
                  className={`w-10 h-10 rounded-lg bg-linear-to-br ${option.color} flex items-center justify-center`}
                >
                  <div className="text-white">{option.icon}</div>
                </div>

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
                        ? "bg-orange-100 text-orange-700"
                        : option.badge === "Pro"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-purple-100 text-purple-700",
                    )}
                  >
                    {option.badge}
                  </div>
                </div>

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

        {/* Date Picker for Automatic */}
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

  // Stepper Component
  const Stepper = () => (
    <div className="mb-6 px-1">
      <div className="flex items-center justify-between relative">
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
              <div className="relative">
                <div
                  className={cn(
                    "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    isActive
                      ? step.color === "blue"
                        ? "bg-linear-to-br from-blue-500 to-blue-600 border-transparent text-white shadow-lg"
                        : step.color === "purple"
                          ? "bg-linear-to-br from-purple-500 to-purple-600 border-transparent text-white shadow-lg"
                          : "bg-linear-to-br from-green-500 to-green-600 border-transparent text-white shadow-lg"
                      : isCompleted
                        ? step.color === "blue"
                          ? "bg-linear-to-br from-blue-500 to-blue-600 border-transparent text-white"
                          : step.color === "purple"
                            ? "bg-linear-to-br from-purple-500 to-purple-600 border-transparent text-white"
                            : "bg-linear-to-br from-green-500 to-green-600 border-transparent text-white"
                        : "border-gray-300 bg-white text-gray-400",
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

                {isActive && (
                  <div className="absolute inset-0 rounded-full animate-ping bg-blue-500/20" />
                )}
              </div>

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
                        : "text-gray-500",
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
                          : "text-gray-500",
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

  // Confirmation Component
  const ConfirmationView = () => {
    const [validation, setValidation] = useState<{
      isValid: boolean;
      errors: string[];
    }>({
      isValid: false,
      errors: [],
    });

    useEffect(() => {
      const validationResult = validateRequiredFields();
      setValidation(validationResult);
    }, [
      activeOption,
      selectedDate,
      isProfileComplete,
      trustScore,
      canCreateMoreGigs,
    ]);

    const getOptionDetails = () => {
      switch (activeOption) {
        case "create":
          return {
            title: "Instant Creation",
            description: "Publish immediately",
            icon: <Bolt className="w-5 h-5" />,
            linear: "from-orange-500 to-red-500",
            color: "orange",
            badge: "Free",
          };
        case "regular":
          return {
            title: "Save as Draft",
            description: "Post manually later",
            icon: <FileText className="w-5 h-5" />,
            linear: "from-green-500 to-emerald-500",
            color: "green",
            badge: "Pro",
          };
        case "automatic":
          return {
            title: "Auto-Schedule",
            description: "Auto-publish at set time",
            icon: <CalendarClock className="w-5 h-5" />,
            linear: "from-purple-500 to-violet-500",
            color: "purple",
            badge: "Pro+",
          };
        default:
          return {
            title: "",
            description: "",
            icon: null,
            linear: "",
            color: "",
            badge: "",
          };
      }
    };

    const option = getOptionDetails();

    if (!activeOption) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Option Selected
          </h3>
          <p className="text-gray-600 text-center mb-4">
            Please select a publishing method first.
          </p>
          <Button onClick={() => setCurrentStep("selection")}>
            Back to Selection
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        <div className="flex-shrink-0 text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-sm mb-3 border border-gray-200 dark:border-gray-700">
            <div
              className={`w-9 h-9 rounded-lg bg-linear-to-br ${option.linear} flex items-center justify-center`}
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

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-md mx-auto w-full px-2">
            <div
              className={cn(
                "rounded-lg border p-4",
                isDarkMode
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-200",
                "shadow-sm",
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg bg-linear-to-br ${option.linear} flex items-center justify-center`}
                  >
                    {option.icon}
                  </div>
                  <div>
                    <h4
                      className={cn(
                        "font-semibold text-sm",
                        isDarkMode ? "text-white" : "text-gray-900",
                      )}
                    >
                      {option.title}
                    </h4>
                    <div className="flex items-center gap-1 mt-0.5">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span
                        className={cn(
                          "text-xs",
                          isDarkMode ? "text-gray-400" : "text-gray-600",
                        )}
                      >
                        Ready to go
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    option.badge === "Free"
                      ? isDarkMode
                        ? "bg-orange-900/20 text-orange-300"
                        : "bg-orange-100 text-orange-700"
                      : option.badge === "Pro"
                        ? isDarkMode
                          ? "bg-purple-900/20 text-purple-300"
                          : "bg-purple-100 text-purple-700"
                        : isDarkMode
                          ? "bg-purple-900/20 text-purple-300"
                          : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {option.badge}
                </div>
              </div>

              <div className="space-y-2">
                <div
                  className={cn(
                    "p-2 rounded",
                    isDarkMode ? "bg-gray-800" : "bg-gray-50",
                  )}
                >
                  <div
                    className={cn(
                      "text-xs mb-0.5",
                      isDarkMode ? "text-gray-400" : "text-gray-500",
                    )}
                  >
                    Publishing Method
                  </div>
                  <div
                    className={cn(
                      "font-medium text-xs",
                      isDarkMode ? "text-white" : "text-gray-900",
                    )}
                  >
                    {option.description}
                  </div>
                </div>

                {activeOption === "automatic" && selectedDate && (
                  <div
                    className={cn(
                      "p-2 rounded border",
                      isDarkMode
                        ? "bg-linear-to-r from-purple-900/10 to-violet-900/10 border-purple-800"
                        : "bg-linear-to-r from-purple-50 to-violet-50 border-purple-100",
                    )}
                  >
                    <div
                      className={cn(
                        "text-xs mb-0.5",
                        isDarkMode ? "text-gray-400" : "text-gray-500",
                      )}
                    >
                      Scheduled For
                    </div>
                    <div className="space-y-0.5">
                      <div
                        className={cn(
                          "font-medium text-xs",
                          isDarkMode ? "text-white" : "text-gray-900",
                        )}
                      >
                        {selectedDate.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div
                        className={cn(
                          "text-xs",
                          isDarkMode ? "text-gray-400" : "text-gray-600",
                        )}
                      >
                        {selectedDate.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                )}

                <div
                  className={cn(
                    "p-2 rounded border",
                    validation.isValid
                      ? isDarkMode
                        ? "bg-linear-to-r from-green-900/10 to-emerald-900/10 border-green-800"
                        : "bg-linear-to-r from-green-50 to-emerald-50 border-green-200"
                      : isDarkMode
                        ? "bg-linear-to-r from-amber-900/10 to-orange-900/10 border-amber-800"
                        : "bg-linear-to-r from-amber-50 to-orange-50 border-amber-200",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          validation.isValid
                            ? "bg-green-500 animate-pulse"
                            : "bg-amber-500"
                        }`}
                      />
                      <span
                        className={cn(
                          "text-xs font-medium",
                          validation.isValid
                            ? isDarkMode
                              ? "text-green-300"
                              : "text-green-700"
                            : isDarkMode
                              ? "text-amber-300"
                              : "text-amber-700",
                        )}
                      >
                        {validation.isValid
                          ? "All checks passed"
                          : "Requirements pending"}
                      </span>
                    </div>
                    {validation.isValid ? (
                      <ShieldCheck className="w-3 h-3 text-green-500" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-amber-500" />
                    )}
                  </div>

                  {!validation.isValid && (
                    <div
                      className={cn(
                        "mt-2 pt-2 border-t",
                        isDarkMode ? "border-amber-800" : "border-amber-200",
                      )}
                    >
                      <ul className="space-y-1">
                        {validation.errors.map((error, index) => (
                          <li
                            key={index}
                            className={cn(
                              "flex items-start gap-1.5 text-xs",
                              isDarkMode ? "text-amber-300" : "text-amber-700",
                            )}
                          >
                            <X className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

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

              {validation.isValid && (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => activeOption && handleSubmit(activeOption)}
                  disabled={isLoading}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-1.5",
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : `bg-linear-to-r ${option.linear} shadow-sm hover:shadow`,
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
              )}

              {!validation.isValid && (
                <div className="px-3 py-2 rounded-lg text-sm font-medium text-center bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Complete all requirements to launch
                </div>
              )}
            </div>

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
  // Map your roles to the closest matching category in the modal
  const getSecurityRole = (user: any) => {
    if (user?.roleType) {
      // Map specific roles to modal's expected types
      switch (user.roleType) {
        case "instrumentalist":
        case "vocalist":
        case "dj":
        case "mc":
          return "musician"; // These are all musicians
        case "teacher":
          return "client"; // Teachers might be closer to clients
        default:
          return user.roleType; // fallback to whatever it is
      }
    }

    // Fallback to boolean checks
    if (user?.isClient) return "client";
    if (user?.isMusician) return "musician";

    return "musician"; // default
  };

  return (
    <>
      <SecurityQuestionSetupModal
        isOpen={showSecuritySetup}
        onClose={() => {
          setShowSecuritySetup(false);
          setisSchedulerOpen(false);
        }}
        onSuccess={handleSecuritySetupSuccess}
        userRole={getSecurityRole(currentUser)}
      />

      {/* Security Verification Modal */}

      <SecurityVerificationModal
        isOpen={showSecurityVerification}
        onClose={() => {
          // Only called when user clicks Cancel or X
          setShowSecurityVerification(false);
          setisSchedulerOpen(false); // Close scheduler only on cancel
        }}
        onVerified={() => {
          // Called on successful verification
          setIsSecurityVerified(true);
          setShowSecurityVerification(false);
          // DO NOT set isSchedulerOpen false here!
          // Let the scheduler stay open
        }}
        securityQuestion={currentUser?.securityQuestion || ""}
      />

      <SecurityQuestionSetupModal
        isOpen={showSecuritySetup}
        onClose={() => {
          setShowSecuritySetup(false);
          setisSchedulerOpen(false); // Only close on cancel
        }}
        onSuccess={() => {
          // After setting up question, show verification
          setShowSecuritySetup(false);
          setShowSecurityVerification(true);
          // DO NOT close scheduler
        }}
        userRole={getSecurityRole(currentUser)}
      />
      {/* Main Scheduler Modal - Only show if security is verified */}
      {isSecurityVerified && (
        <Modal
          isOpen={isSchedulerOpen}
          onClose={() => !isLoading && setisSchedulerOpen(false)}
          title="Schedule Your Gig"
          description="Choose how to publish your gig"
          className="max-w-7xl w-full" // Changed to match main form
        >
          <div
            className={cn(
              "h-[calc(90vh-120px)] flex flex-col overflow-auto p-6", // Increased height and added padding
              colors.background,
            )}
          >
            <Stepper />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8" // Increased spacing
              >
                {currentStep === "eligibility" && (
                  <>
                    <StatusCards />

                    {/* Other overlays (only show if they're blockers) */}
                    {showProfileIncompleteOverlay && (
                      <div
                        className={cn(
                          "rounded-xl border p-4",
                          isDarkMode
                            ? "border-red-700 bg-linear-to-br from-red-900/20 to-gray-900"
                            : "border-red-200 bg-linear-to-br from-red-50 to-white",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-red-500 to-red-600 flex items-center justify-center">
                            <UserCheck className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4
                              className={cn(
                                "text-sm font-semibold",
                                isDarkMode ? "text-red-200" : "text-red-900",
                              )}
                            >
                              Profile Incomplete
                            </h4>
                            <p
                              className={cn(
                                "text-xs",
                                isDarkMode ? "text-red-300" : "text-red-700",
                              )}
                            >
                              Complete your profile before creating gigs
                            </p>
                          </div>
                          <button
                            onClick={() => window.open("/profile", "_blank")}
                            className="px-3 py-1.5 text-xs bg-linear-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-all"
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
                        className={cn(
                          "px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:from-blue-700 hover:to-blue-800 transition-all",
                          !(
                            isProfileComplete &&
                            trustScore >= 10 &&
                            canCreateMoreGigs
                          ) && "opacity-50 cursor-not-allowed",
                        )}
                        disabled={
                          !(
                            isProfileComplete &&
                            trustScore >= 10 &&
                            canCreateMoreGigs
                          )
                        }
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

                    <div
                      className={cn(
                        "flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t",
                        isDarkMode ? "border-gray-700" : "border-gray-100",
                      )}
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCurrentStep("eligibility")}
                        className={cn(
                          "px-5 py-3 rounded-lg text-sm font-medium transition-all",
                          isDarkMode
                            ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50",
                        )}
                      >
                        Back to Status
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (!activeOption) {
                            toast.error("Please select a publishing method");
                            return;
                          }

                          const basicValidation = validateRequiredFields();
                          if (!basicValidation.isValid) {
                            toast.error(
                              "Please complete all requirements first",
                            );
                            return;
                          }

                          setCurrentStep("confirmation");
                        }}
                        disabled={!activeOption}
                        className={cn(
                          "px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all",
                          !activeOption && "opacity-50 cursor-not-allowed",
                          "hover:from-blue-700 hover:to-blue-800",
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
      )}
    </>
  );
};

export default SchedulerComponent;
