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
  Sparkles,
  Target,
  BarChart3,
  Users,
  Shield,
  Star,
  Rocket,
  CalendarDays,
  CalendarClock,
  Circle,
  ArrowRight,
  Crown,
  Infinity,
  Trophy,
  MessageSquare,
  Gem,
  PieChart,
  X,
} from "lucide-react";

// Trust score imports
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
    <div className="mb-6">
      <div
        className={cn(
          "rounded-2xl p-6 backdrop-blur-sm border",
          theme === "purple"
            ? "border-purple-200/50 bg-gradient-to-br from-purple-50/90 via-white to-purple-25/90"
            : "border-red-200/50 bg-gradient-to-br from-red-50/90 via-white to-red-25/90"
        )}
      >
        <div className="flex flex-col lg:flex-row items-start gap-6">
          <div className="flex-shrink-0">
            <div
              className={cn(
                "w-16 h-16 rounded-xl flex items-center justify-center mb-4",
                theme === "purple"
                  ? "bg-gradient-to-br from-purple-500 to-purple-600"
                  : "bg-gradient-to-br from-red-500 to-red-600"
              )}
            >
              {isInGracePeriod ? (
                <Calendar className="w-8 h-8 text-white" />
              ) : (
                <Lock className="w-8 h-8 text-white" />
              )}
            </div>
          </div>
          <div className="flex-1">
            <h3
              className={cn(
                "text-xl font-bold mb-2",
                theme === "purple" ? "text-purple-900" : "text-red-900"
              )}
            >
              {isInGracePeriod ? "Grace Period Limit" : "Free Tier Limit"}
            </h3>
            <p
              className={cn(
                "mb-4",
                theme === "purple" ? "text-purple-700" : "text-red-700"
              )}
            >
              {isInGracePeriod
                ? "Upgrade to Pro for unlimited gigs and premium features."
                : "You've reached the free tier limit. Upgrade to Pro for unlimited gigs."}
            </p>
            <button
              onClick={() => window.open("/pricing", "_blank")}
              className={cn(
                "px-4 py-2 rounded-lg font-medium text-white",
                theme === "purple"
                  ? "bg-gradient-to-r from-purple-600 to-purple-700"
                  : "bg-gradient-to-r from-red-600 to-red-700"
              )}
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
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

  return (
    <div className="mb-6">
      <div className="rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50/90 via-white to-orange-25/90 p-6 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row items-start gap-6">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-amber-900 mb-2">
              Trust Score Required
            </h3>
            <p className="text-amber-700 mb-3">
              You need <strong>{scoreNeeded} more points</strong> (current:{" "}
              {currentScore}/{requiredScore})
            </p>
            <button
              onClick={() => window.open("/profile/edit", "_blank")}
              className="px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-amber-600 to-orange-600 text-white"
            >
              Improve Score
            </button>
          </div>
        </div>
      </div>
    </div>
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

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeOption, setActiveOption] = useState<
    "automatic" | "regular" | "create" | null
  >(null);
  const [currentStep, setCurrentStep] = useState<
    "eligibility" | "selection" | "confirmation"
  >("eligibility");

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

  // Trust score requirements
  const hasMinTrustForBasic = trustScore >= 10;
  const hasMinTrustForRegular = trustScore >= 40;
  const hasMinTrustForAutomatic = trustScore >= 60;

  // Gig creation limits
  const canCreateMoreGigs = isPaidUser || userGigs.length < 3;

  // Option availability
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

  // Stepper Component
  const Stepper = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        {[
          {
            id: "eligibility",
            label: "Eligibility",
            icon: <Shield className="w-4 h-4" />,
          },
          {
            id: "selection",
            label: "Schedule",
            icon: <CalendarDays className="w-4 h-4" />,
          },
          {
            id: "confirmation",
            label: "Confirm",
            icon: <CheckCircle className="w-4 h-4" />,
          },
        ].map((step, index) => (
          <React.Fragment key={step.id}>
            <button
              onClick={() => setCurrentStep(step.id as any)}
              className="flex flex-col items-center gap-2"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
                  currentStep === step.id
                    ? "bg-blue-500 border-blue-500 text-white shadow-lg"
                    : "border-gray-200 bg-white text-gray-400"
                )}
              >
                {step.icon}
              </div>
              <span
                className={cn(
                  "text-sm font-medium",
                  currentStep === step.id ? "text-blue-600" : "text-gray-500"
                )}
              >
                {step.label}
              </span>
            </button>
            {index < 2 && <div className="w-16 h-0.5 mx-2 bg-gray-200" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  // Status Cards Component
  const StatusCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {[
        {
          label: "Trust",
          value: trustScore,
          max: 100,
          icon: <Shield className="w-4 h-4" />,
          color:
            trustScore >= 60
              ? "bg-emerald-500"
              : trustScore >= 40
                ? "bg-blue-500"
                : "bg-amber-500",
        },
        {
          label: "Gigs",
          value: userGigs.length,
          max: 3,
          icon: <Calendar className="w-4 h-4" />,
          color: canCreateMoreGigs ? "bg-blue-500" : "bg-red-500",
        },
        {
          label: "Tier",
          value: isProUser ? "Pro" : isPremiumUser ? "Premium" : "Free",
          icon: <Star className="w-4 h-4" />,
          color: isProUser
            ? "bg-purple-500"
            : isPremiumUser
              ? "bg-amber-500"
              : "bg-gray-500",
        },
        {
          label: "Profile",
          value: isProfileComplete ? "Complete" : "Incomplete",
          icon: <Users className="w-4 h-4" />,
          color: isProfileComplete ? "bg-green-500" : "bg-red-500",
        },
      ].map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`w-8 h-8 rounded-lg ${card.color} flex items-center justify-center`}
            >
              <div className="text-white">{card.icon}</div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {typeof card.value === "number"
                ? `${card.value}/${card.max}`
                : card.value}
            </div>
          </div>
          <div className="text-xs text-gray-600">{card.label}</div>
        </div>
      ))}
    </div>
  );

  // Scheduling Options Component
  const SchedulingOptions = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Schedule Type
        </h3>
        <p className="text-gray-600">Select how you want to publish your gig</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            id: "create",
            title: "Instant",
            description: "Post immediately",
            icon: <Zap className="w-6 h-6" />,
            color: "border-blue-200",
            bg: "bg-blue-50",
            iconColor: "bg-blue-500",
            available: canUseCreate,
            requirements: [
              { met: isVerified, text: "Verified" },
              { met: hasMinTrustForBasic, text: "Trust 10+" },
              { met: canCreateMoreGigs, text: "Gig Slot" },
            ],
          },
          {
            id: "regular",
            title: "Draft",
            description: "Create now, publish later",
            icon: <Calendar className="w-6 h-6" />,
            color: "border-purple-200",
            bg: "bg-purple-50",
            iconColor: "bg-purple-500",
            available: canUseRegular,
            requirements: [
              { met: isProUser, text: "Pro Plan" },
              { met: hasMinTrustForRegular, text: "Trust 40+" },
            ],
          },
          {
            id: "automatic",
            title: "Auto",
            description: "Schedule for future",
            icon: <CalendarClock className="w-6 h-6" />,
            color: "border-emerald-200",
            bg: "bg-emerald-50",
            iconColor: "bg-emerald-500",
            available: canUseAutomatic,
            requirements: [
              { met: isProUser, text: "Pro Plan" },
              { met: hasMinTrustForAutomatic, text: "Trust 60+" },
            ],
          },
        ].map((option) => (
          <div
            key={option.id}
            onClick={() =>
              option.available && setActiveOption(option.id as any)
            }
            className={cn(
              "rounded-2xl border-2 p-6 cursor-pointer transition-all duration-300",
              activeOption === option.id
                ? "ring-2 ring-offset-2 ring-blue-500 shadow-lg"
                : "hover:shadow-md",
              option.available ? option.color : "border-gray-200 opacity-50",
              option.bg
            )}
          >
            <div className="flex flex-col items-center text-center h-full">
              <div
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mb-4",
                  option.iconColor
                )}
              >
                <div className="text-white">{option.icon}</div>
              </div>

              <h4 className="text-xl font-bold text-gray-900 mb-2">
                {option.title}
              </h4>

              <p className="text-gray-600 mb-4">{option.description}</p>

              <div className="space-y-2 mb-6 mt-auto">
                {option.requirements.map((req, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full",
                        req.met ? "bg-green-500" : "bg-gray-300"
                      )}
                    />
                    <span className="text-sm text-gray-700">{req.text}</span>
                  </div>
                ))}
              </div>

              {option.available ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveOption(option.id as any);
                  }}
                  className={cn(
                    "w-full py-3 rounded-lg font-medium text-white transition-colors",
                    activeOption === option.id
                      ? option.iconColor
                      : "bg-gray-800 hover:bg-gray-900"
                  )}
                >
                  {activeOption === option.id ? "Selected" : "Select"}
                </button>
              ) : (
                <div className="w-full py-3 rounded-lg font-medium text-center bg-gray-100 text-gray-500">
                  Locked
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {activeOption === "automatic" && (
        <div className="mt-6 p-6 bg-gray-50 rounded-2xl">
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Select Post Date & Time
          </label>
          <input
            type="datetime-local"
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            min={new Date().toISOString().slice(0, 16)}
          />
          <p className="text-sm text-gray-600 mt-2">
            Your gig will automatically publish at this time
          </p>
        </div>
      )}
    </div>
  );

  // Confirmation Component
  const ConfirmationView = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Go!</h3>
        <p className="text-gray-600">Review your selection and confirm</p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              {activeOption === "create"
                ? "Instant Creation"
                : activeOption === "regular"
                  ? "Scheduled Draft"
                  : "Auto-Schedule"}
            </h4>
            <p className="text-gray-600">All requirements are met ✓</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            {activeOption === "create" && (
              <Zap className="w-8 h-8 text-blue-600" />
            )}
            {activeOption === "regular" && (
              <Calendar className="w-8 h-8 text-purple-600" />
            )}
            {activeOption === "automatic" && (
              <CalendarClock className="w-8 h-8 text-emerald-600" />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
            <span className="text-gray-700">Posting Method</span>
            <span className="font-semibold">
              {activeOption === "create"
                ? "Live Immediately"
                : activeOption === "regular"
                  ? "Manual Publish"
                  : "Auto-Publish"}
            </span>
          </div>

          {activeOption === "automatic" && selectedDate && (
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
              <span className="text-gray-700">Scheduled For</span>
              <span className="font-semibold">
                {selectedDate.toLocaleDateString()} at{" "}
                {selectedDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
            <span className="text-gray-700">Status</span>
            <span className="text-green-600 font-semibold">
              Ready to Create
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => setCurrentStep("selection")}
          className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => handleSubmit(activeOption!)}
          disabled={isLoading}
          className={cn(
            "px-8 py-3 rounded-lg font-medium text-white transition-all flex items-center gap-2",
            isLoading
              ? "bg-gray-400"
              : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
          )}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
              Creating...
            </>
          ) : (
            <>
              <Rocket className="w-5 h-5" />
              Create Gig
            </>
          )}
        </button>
      </div>
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
      title="Schedule Your Gig"
      description="Choose how and when to publish"
    >
      <div className="p-4 md:p-6">
        {/* Stepper */}
        <Stepper />

        {/* Current Step Content */}
        {currentStep === "eligibility" && (
          <div className="space-y-6">
            {/* Status Cards */}
            <StatusCards />

            {/* Overlays */}
            {showVerificationOverlay && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <div className="flex items-center gap-4">
                  <Shield className="w-6 h-6 text-amber-600" />
                  <div>
                    <h4 className="font-bold text-amber-900">
                      Account Verification Required
                    </h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Please verify your account to create gigs.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {showProfileIncompleteOverlay && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <div className="flex items-center gap-4">
                  <Users className="w-6 h-6 text-red-600" />
                  <div>
                    <h4 className="font-bold text-red-900">
                      Profile Incomplete
                    </h4>
                    <p className="text-sm text-red-700 mt-1">
                      Please complete your profile before creating gigs.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {showTrustScoreOverlay && (
              <TrustScoreOverlay currentScore={trustScore} requiredScore={10} />
            )}

            {showGracePeriodOverlay && (
              <CreateLimitOverlay
                showCreateLimitOverlay={showCreateLimitOverlay}
                isInGracePeriod={false}
              />
            )}

            {showCreateLimitOverlay && isInGracePeriod && (
              <CreateLimitOverlay
                showCreateLimitOverlay={showCreateLimitOverlay}
                isInGracePeriod={true}
              />
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setCurrentStep("selection")}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {currentStep === "selection" && (
          <div className="space-y-6">
            <SchedulingOptions />

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep("eligibility")}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep("confirmation")}
                disabled={!activeOption}
                className={cn(
                  "px-6 py-3 rounded-lg font-medium text-white transition-colors flex items-center gap-2",
                  activeOption
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-300 cursor-not-allowed"
                )}
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {currentStep === "confirmation" && activeOption && <ConfirmationView />}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl backdrop-blur-sm">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
              <p className="text-gray-700">Creating your gig...</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SchedulerComponent;
