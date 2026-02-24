// app/hub/gigs/_components/tabs/OnBoardingModal.tsx - UPDATED WITH THEME COLORS
"use client";

import React, { useMemo, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  X,
  Zap,
  Clock,
  Users,
  Star,
  Crown,
  CheckCircle,
  ArrowRight,
  BookOpen,
  TrendingUp,
  Shield,
  Wand2,
  Settings,
  Rocket,
  Target,
  Calendar,
  Sparkles,
  Lock,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCheckTrial } from "@/hooks/useCheckTrial";
import { useSubscriptionStore } from "@/app/stores/useSubscriptionStore";
import { useFeatureFlags } from "@/hooks/useFeatureFlag";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNormalCreation: () => void; // ADD THIS
  onGuidedCreation: () => void;
  onCustomCreation: () => void;
  onScratchCreation?: () => void;
  scrollToTemplates?: () => void;
  scrollToNormal?: () => void;
  onAICreation?: () => void;
}

// Memoize feature cards data - updated with theme colors
const getFeatureCards = (colors: any) => [
  {
    icon: Zap,
    title: "Instant Booking",
    description:
      "Book premium musicians in seconds with pre-approved templates",
    color: "text-blue-500",
    bgColor: colors.infoBg,
  },
  {
    icon: Clock,
    title: "Save Time",
    description: "No more back-and-forth negotiations for similar events",
    color: "text-green-500",
    bgColor: colors.successBg,
  },
  {
    icon: Crown,
    title: "Premium Talent",
    description: "Access verified pro musicians with proven track records",
    color: "text-amber-500",
    bgColor: colors.warningBg,
  },
  {
    icon: Shield,
    title: "Reliable Service",
    description: "95% booking success rate with backup options available",
    color: "text-purple-500",
    bgColor: colors.card,
  },
];

// Memoize benefit items
const BENEFIT_ITEMS = [
  "Create reusable templates for different event types",
  "Get instant responses from available musicians",
  "Fixed pricing with no hidden costs",
  "24/7 support for urgent bookings",
  "Rating system ensures quality musicians",
  "Secure payments and contracts",
];

// Memoize stat items
const STAT_ITEMS = [
  { value: "50+", label: "Pro Musicians", icon: Users },
  { value: "4.8★", label: "Avg Rating", icon: Star },
  { value: "24h", label: "Avg Response", icon: Clock },
  { value: "95%", label: "Success Rate", icon: TrendingUp },
];

// Memoize creation options - updated with theme colors

// utils/tierAccess.ts - RESTRICTIVE APPROACH
export const getTierAccess = (userTier: string, isInGracePeriod: boolean) => {
  const baseTier = userTier || "free";

  return {
    // Free tier gets NO instant gigs access
    canAccessInstantGigs: baseTier !== "free" || isInGracePeriod,

    // Pro tier features
    canAccessTemplates:
      baseTier === "pro" ||
      baseTier === "premium" ||
      baseTier === "elite" ||
      isInGracePeriod,
    canAccessCustomCreation:
      baseTier === "pro" ||
      baseTier === "premium" ||
      baseTier === "elite" ||
      isInGracePeriod,

    // Premium tier features
    canAccessScratchCreation:
      baseTier === "premium" || baseTier === "elite" || isInGracePeriod,

    // Elite tier features
    canAccessAICreation: baseTier === "elite" || isInGracePeriod,

    // Current effective access
    effectiveAccess: {
      instantGigs: baseTier !== "free" || isInGracePeriod, // KEY CHANGE
      templates:
        baseTier === "pro" ||
        baseTier === "premium" ||
        baseTier === "elite" ||
        isInGracePeriod,
      custom:
        baseTier === "pro" || baseTier === "premium" || baseTier === "elite",
      scratch: baseTier === "premium" || baseTier === "elite",
      ai: baseTier === "elite",
    },
  };
};
const getCreationOptions = (
  colors: any,
  user: any,
  isInGracePeriod: boolean,
  ishiddenormal: boolean,
  ishiddenscratch: boolean,
  ishiddenAI: boolean,
) => {
  const userTier = user?.tier || "free";
  const access = getTierAccess(userTier, isInGracePeriod);

  // If free user with no trial, show preview card + upgrade options
  if (!access.effectiveAccess.instantGigs) {
    return [
      {
        id: "preview",
        title: "Instant Gigs Preview",
        description: "See how instant booking works (upgrade to use)",
        icon: Eye,
        features: [
          "Browse template gallery",
          "See available musicians",
          "Preview booking process",
          "Upgrade to start booking",
        ],
        color: "from-gray-500 to-gray-700",
        buttonText: "Preview Features",
        tier: "free",
        available: false, // NOT available - just a preview
        isPreviewCard: true, // Mark as preview card
        iconBg: "bg-gray-100 dark:bg-gray-800",
        iconColor: "text-gray-500 dark:text-gray-400",
      },
      {
        id: "upgrade-pro",
        title: "Unlock Instant Gigs",
        description: "Upgrade to start booking musicians instantly",
        icon: Zap,
        features: [
          "50+ professional templates",
          "Instant musician matching",
          "Save 80% booking time",
          "Priority access to top talent",
        ],
        color: "from-blue-500 to-purple-500",
        buttonText: "View Plans & Pricing",
        tier: "pro",
        available: true,
        isUpgradeCard: true,
        iconBg: colors.infoBg,
        iconColor: colors.infoText,
      },
      {
        id: "upgrade-premium",
        title: "Premium Creation Tools",
        description: "Advanced features for professional event planners",
        icon: Crown,
        features: [
          "Start from scratch",
          "Advanced customization",
          "White-glove support",
          "Early access to new features",
        ],
        color: "from-amber-500 to-orange-500",
        buttonText: "Explore Premium",
        tier: "premium",
        available: true,
        isUpgradeCard: true,
        iconBg: colors.warningBg,
        iconColor: colors.warningText,
      },
    ];
  }

  // Paid/trial users see the normal options
  return [
    {
      id: "normal",
      title: "Create Normal Gig",
      description: "Traditional gig creation with full customization",
      icon: Calendar, // Using Calendar icon for normal gigs
      features: [
        "Full gig customization",
        "Manual musician selection",
        "Flexible scheduling",
        "Detailed requirements",
        "Custom pricing negotiation",
        "Direct messaging",
      ],
      color: "from-blue-500 to-cyan-500",
      buttonText: "Create Gig",
      available: true, // Always available
      iconBg: colors.infoBg,
      iconColor: colors.infoText,
      hidden: !ishiddenormal,
    },
    {
      id: "guided",
      title: "Browse Templates",
      description: "Start with professionally designed templates",
      icon: BookOpen,
      features: [
        "50+ pre-built templates",
        "Quick 2-minute setup",
        "Best practices included",
        "Perfect for common events",
      ],
      color: "from-blue-500 to-purple-500",
      buttonText: "Browse Templates",
      tier: "pro",
      available: access.effectiveAccess.templates,
      iconBg: colors.infoBg,
      iconColor: colors.infoText,
    },
    {
      id: "custom",
      title: "Custom Creation",
      description: "Modify templates to fit your exact needs",
      icon: Settings,
      features: [
        "Modify any template extensively",
        "Advanced field options",
        "Save custom variations",
        "Priority template access",
      ],
      color: "from-green-500 to-emerald-500",
      buttonText: "Customize Templates",
      tier: "pro",
      available: access.effectiveAccess.custom,
      iconBg: colors.successBg,
      iconColor: colors.successText,
    },
    {
      id: "scratch",
      title: "Start from Scratch",
      description: "Complete creative freedom for unique events",
      icon: Sparkles,
      features: [
        "Blank canvas experience",
        "Total design control",
        "Advanced customization",
        "White-glove support",
      ],
      color: "from-amber-500 to-orange-500",
      buttonText: "Start Creating",
      tier: "premium",
      available: access.effectiveAccess.scratch,
      iconBg: colors.warningBg,
      iconColor: colors.warningText,
      hidden: !ishiddenscratch,
    },
    {
      id: "ai",
      title: "AI Gig Creator",
      description: "AI-powered gig creation with smart suggestions",
      icon: Wand2,
      features: [
        "AI-powered template generation",
        "Smart field suggestions",
        "Auto-optimization for engagement",
        "Predictive musician matching",
      ],
      color: "from-purple-500 to-pink-500",
      buttonText: "Create with AI",
      tier: "elite",
      available: access.effectiveAccess.ai,
      iconBg: "bg-purple-50 dark:bg-purple-950/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      hidden: !ishiddenAI,
    },
  ].filter((t) => !t.hidden);
};

// Memoize FeatureCard component
const FeatureCard = memo(({ feature, colors }: any) => {
  const Icon = feature.icon;
  return (
    <div
      className={cn(
        "p-4 rounded-xl border transition-all duration-200 hover:scale-105",
        colors.border,
        feature.bgColor,
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("p-2 rounded-lg", feature.bgColor)}>
          <Icon className={cn("w-5 h-5", feature.color)} />
        </div>
        <h4 className={cn("font-semibold text-sm", colors.text)}>
          {feature.title}
        </h4>
      </div>
      <p className={cn("text-xs leading-relaxed", colors.textMuted)}>
        {feature.description}
      </p>
    </div>
  );
});

FeatureCard.displayName = "FeatureCard";

// Memoize BenefitItem component
const BenefitItem = memo(({ benefit, colors }: any) => (
  <div className="flex items-center gap-3 group">
    <div className="flex-shrink-0">
      <CheckCircle className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform" />
    </div>
    <span
      className={cn(
        "text-sm group-hover:text-green-600 transition-colors",
        colors.text,
      )}
    >
      {benefit}
    </span>
  </div>
));

BenefitItem.displayName = "BenefitItem";

// Memoize StatItem component
const StatItem = memo(({ stat, colors }: any) => {
  const Icon = stat.icon;
  return (
    <div
      className={cn(
        "text-center p-3 rounded-xl border transition-all duration-200 hover:scale-105",
        colors.border,
        colors.backgroundMuted,
      )}
    >
      <Icon className={cn("w-6 h-6 mx-auto mb-2", colors.infoText)} />
      <div className={cn("text-lg font-bold mb-1", colors.text)}>
        {stat.value}
      </div>
      <div className={cn("text-xs font-medium", colors.textMuted)}>
        {stat.label}
      </div>
    </div>
  );
});

StatItem.displayName = "StatItem";

const CreationOption = memo(
  ({
    option,
    onSelect,
    colors,
    user,
    isInGracePeriod,
    daysLeft,
    onUpgrade,
  }: any) => {
    const Icon = option.icon;

    const handleClick = useCallback(() => {
      // PREVIEW CARD: Completely non-clickable
      if (option.isPreviewCard) {
        return; // Do nothing when clicked
      }

      if (option.isUpgradeCard) {
        onUpgrade?.(option.tier);
        return;
      }

      if (!option.available) {
        onUpgrade?.(option.tier);
        return;
      }

      onSelect(option.id);
    }, [option, onSelect, onUpgrade]);
    const getTierBadgeConfig = (
      tier: string,
      isTrial: boolean,
      isPreviewCard: boolean,
      isUpgradeCard: boolean,
      daysLeft: number | null,
    ) => {
      // Handle special cases first
      if (isPreviewCard) {
        return { bg: "bg-gray-500", text: "PREVIEW" };
      }

      if (isUpgradeCard) {
        return {
          bg: "bg-gradient-to-r from-blue-500 to-purple-500",
          text: "UPGRADE",
        };
      }

      if (isTrial) {
        return {
          bg: "bg-gradient-to-r from-purple-500 to-blue-500",
          text: `TRIAL${daysLeft ? ` (${daysLeft}d)` : ""}`,
        };
      }

      // Use type-safe approach for tier config
      const config = {
        pro: { bg: "bg-green-500", text: "PRO" },
        premium: { bg: "bg-amber-500", text: "PREMIUM" },
        elite: {
          bg: "bg-gradient-to-r from-purple-500 to-pink-500",
          text: "ELITE",
        },
        free: { bg: "bg-blue-500", text: "FREE" }, // Added free tier for completeness
      } as const;

      // Type-safe access - default to pro if tier not found
      const tierConfig = config[tier as keyof typeof config] || config.pro;

      return tierConfig;
    };

    const badgeConfig = getTierBadgeConfig(
      option.tier,
      isInGracePeriod,
      option.isPreviewCard,
      option.isUpgradeCard,
      daysLeft, // Make sure to pass daysLeft
    );

    return (
      <div
        className={cn(
          "rounded-2xl p-6 border-2 transition-all duration-300 group relative",
          colors.border,
          colors.card,
          // PREVIEW CARD: Subtle styling, no hover effects, not clickable
          option.isPreviewCard
            ? "border-dashed opacity-80 cursor-default"
            : option.isUpgradeCard
              ? "border-dashed hover:border-solid hover:scale-105 cursor-pointer"
              : option.available
                ? "hover:scale-105 hover:shadow-xl hover:border-blue-300 cursor-pointer"
                : "opacity-70 cursor-not-allowed",
        )}
      >
        {/* Tier Badge */}
        <div
          className={cn(
            "absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-bold text-white",
            badgeConfig.bg,
          )}
        >
          {badgeConfig.text}
        </div>

        {/* Special badge for upgrade cards */}
        {option.isUpgradeCard && (
          <div className="absolute -top-2 -left-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white">
            NEW
          </div>
        )}

        {/* Preview card overlay */}
        {option.isPreviewCard && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-gray-900/80 dark:to-gray-800/80 rounded-2xl flex items-center justify-center">
            <div className="text-center p-4">
              <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Upgrade to Unlock
              </p>
            </div>
          </div>
        )}

        {/* Option Content */}
        <div
          className={cn(
            "text-center mb-6",
            option.isPreviewCard && "opacity-70", // Make content slightly faded for preview
          )}
        >
          <div
            className={cn(
              "w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300",
              option.isPreviewCard
                ? "" // No hover for preview
                : option.isUpgradeCard
                  ? "group-hover:scale-110"
                  : option.available
                    ? "group-hover:scale-110"
                    : "opacity-60",
              option.iconBg,
            )}
          >
            <Icon className={cn("w-8 h-8", option.iconColor)} />
          </div>
          <h3 className={cn("text-xl font-bold mb-2", colors.text)}>
            {option.title}
          </h3>
          <p className={cn("text-sm mb-4", colors.textMuted)}>
            {option.description}
          </p>
        </div>

        {/* Features List */}
        <div className="space-y-3 mb-6">
          {option.features.map((feature: string, index: number) => (
            <div key={index} className="flex items-center gap-3">
              <div
                className={cn(
                  "w-2 h-2 rounded-full flex-shrink-0",
                  option.isPreviewCard
                    ? "bg-gray-400"
                    : option.isUpgradeCard
                      ? "bg-blue-500"
                      : option.available
                        ? "bg-blue-500"
                        : "bg-gray-400",
                )}
              />
              <span className={cn("text-xs", colors.textMuted)}>{feature}</span>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <Button
          onClick={handleClick}
          className={cn(
            "w-full transition-all duration-300 font-semibold",
            option.isPreviewCard
              ? "bg-gray-400 text-gray-700 cursor-default" // Grayed out, non-interactive
              : option.isUpgradeCard
                ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 text-white"
                : option.available
                  ? `bg-gradient-to-r hover:scale-105 ${option.color} text-white`
                  : "bg-gray-400 text-gray-800 cursor-not-allowed",
          )}
          size="lg"
          disabled={option.isPreviewCard} // Actually disable the button for preview
        >
          {option.buttonText}
          {(option.isUpgradeCard ||
            (option.available && !option.isPreviewCard)) && (
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          )}
        </Button>

        {/* Additional upgrade prompt for preview card */}
        {option.isPreviewCard && (
          <div className="text-center mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpgrade?.("pro")}
              className="text-xs border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <Zap className="w-3 h-3 mr-1" />
              Upgrade to Unlock
            </Button>
          </div>
        )}
      </div>
    );
  },
);

CreationOption.displayName = "CreationOption";

export const OnboardingModal: React.FC<OnboardingModalProps> = memo(
  ({
    isOpen,
    onClose,
    onGuidedCreation,
    onCustomCreation,
    onScratchCreation,
    scrollToTemplates,
    onAICreation,
    onNormalCreation, // ADD THIS
    scrollToNormal,
  }) => {
    const { colors } = useThemeColors();
    const { user } = useCurrentUser(); // ADD THIS TO GET USER INFO
    const { isInGracePeriod, daysLeft: trialRemainingDays } = useCheckTrial();
    const {
      isNormalGigCreationEnabled,
      isScratchCreationEnabled,
      isAICreationEnabled,
    } = useFeatureFlags();

    // Use the centralized flags
    const isnormalcreation = isNormalGigCreationEnabled(
      user?.clientType,
      user?.tier,
    );
    const isscratchcreation = isScratchCreationEnabled();
    const isAIcreation = isAICreationEnabled();
    const handleUpgrade = useCallback(() => {
      // Redirect to pricing or show upgrade modal
      window.location.href = `/dashboard/billing`;
    }, []);
    // Memoize dynamic data based on theme
    const featureCards = useMemo(() => getFeatureCards(colors), [colors]);
    const creationOptions = useMemo(
      () =>
        getCreationOptions(
          colors,
          user,
          isInGracePeriod,
          isnormalcreation,
          isscratchcreation,
          isAIcreation,
        ),
      [
        colors,
        user,
        isInGracePeriod,
        trialRemainingDays,
        isnormalcreation,
        isscratchcreation,
        isAIcreation,
      ], // Add all dependencies
    );

    // Memoize event handlers
    const handleClose = useCallback(() => {
      onClose();
    }, [onClose]);

    const handleGuidedCreation = useCallback(() => {
      onGuidedCreation();
      if (scrollToTemplates) {
        scrollToTemplates();
      }
    }, [onGuidedCreation]);

    const handleCustomCreation = useCallback(() => {
      onCustomCreation();
      if (scrollToTemplates) {
        scrollToTemplates();
      }
    }, [onCustomCreation]);

    const handleScratchCreation = useCallback(() => {
      if (onScratchCreation) {
        onScratchCreation();
        if (scrollToTemplates) {
          scrollToTemplates();
        }
      }
    }, [onScratchCreation]);
    const handleAICreation = useCallback(() => {
      if (onAICreation) {
        onAICreation();
      }
    }, [onAICreation]);
    const handleNormalCreation = useCallback(() => {
      if (onNormalCreation) {
        onNormalCreation();
        if (scrollToNormal) {
          scrollToNormal();
        }
      }
    }, [onNormalCreation]);
    const handleCreationSelect = useCallback(
      (type: "normal" | "guided" | "custom" | "scratch" | "ai") => {
        console.log("🎯 Creation type selected:", type);

        // Close the modal first
        onClose();

        // Use a small timeout to ensure modal is closed before tab change
        setTimeout(() => {
          if (type === "normal") {
            console.log("🚀 Calling handleNormalCreation");
            handleNormalCreation();
          } else if (type === "guided") {
            handleGuidedCreation();
          } else if (type === "custom") {
            handleCustomCreation();
          } else if (type === "scratch" && onScratchCreation) {
            handleScratchCreation();
          } else if (type === "ai" && onAICreation) {
            handleAICreation();
          }
        }, 100);
      },
      [
        onClose,
        handleNormalCreation,
        handleGuidedCreation,
        handleCustomCreation,
        handleScratchCreation,
        onScratchCreation,
        onAICreation,
      ],
    );

    // Memoize modal content to prevent unnecessary re-renders
    const modalContent = useMemo(() => {
      if (!isOpen) return null;

      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={cn(
              "rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col",
              colors.card,
              colors.border,
              "border-2 shadow-2xl",
            )}
          >
            {/* Header */}
            <div
              className={cn(
                "p-8 border-b",
                colors.border,
                colors.backgroundMuted,
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className={cn("text-3xl font-bold", colors.text)}>
                      Welcome to Instant Gigs!
                    </h2>
                    <p className={cn("text-lg mt-2", colors.textMuted)}>
                      Streamline your musician booking process
                    </p>
                  </div>
                </div>
                {/* <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className={cn(
                    "rounded-xl",
                    colors.hoverBg,
                    "hover:text-red-600"
                  )}
                >
                  <X className="w-6 h-6" />
                </Button> */}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-8 space-y-12">
                {/* Hero Section */}
                <div className="text-center">
                  <div
                    className={cn(
                      "w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center shadow-lg",
                      colors.backgroundMuted,
                    )}
                  >
                    <Rocket className={cn("w-12 h-12", colors.infoText)} />
                  </div>
                  <h3 className={cn("text-xl font-bold mb-4", colors.text)}>
                    Book Musicians Faster Than Ever
                  </h3>
                  <p
                    className={cn(
                      "text-xl mb-8 max-w-3xl mx-auto leading-relaxed",
                      colors.textMuted,
                    )}
                  >
                    Create reusable templates and instantly connect with premium
                    musicians. Perfect for event planners, venues, and recurring
                    gigs.
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto mb-8">
                    {STAT_ITEMS.map((stat, index) => (
                      <StatItem key={index} stat={stat} colors={colors} />
                    ))}
                  </div>
                </div>

                {/* Creation Options */}
                <div>
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <Target className={cn("w-8 h-8", colors.infoText)} />
                      <h4 className={cn("text-xl font-bold", colors.text)}>
                        Choose Your Creation Style
                      </h4>
                    </div>
                    <p
                      className={cn(
                        "text-lg max-w-2xl mx-auto",
                        colors.textMuted,
                      )}
                    >
                      Select how you'd like to create your first gig template
                    </p>
                  </div>

                  {/* In the Creation Options section - Dynamic grid based on number of options */}
                  <div
                    className={`grid gap-8 max-w-6xl mx-auto ${
                      creationOptions.length === 3
                        ? "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
                        : "grid-cols-1 lg:grid-cols-2"
                    }`}
                  >
                    {creationOptions.map((option) => (
                      <CreationOption
                        key={option.id}
                        option={option}
                        onSelect={handleCreationSelect}
                        colors={colors}
                        isInGracePeriod={isInGracePeriod}
                        user={user}
                        daysLeft={trialRemainingDays}
                        onUpgrade={handleUpgrade}
                      />
                    ))}
                  </div>
                </div>

                {/* Features Grid */}
                <div>
                  <div className="flex items-center gap-3 justify-center mb-8">
                    <TrendingUp className={cn("w-8 h-8", colors.infoText)} />
                    <h4
                      className={cn(
                        "text-xl font-bold text-center",
                        colors.text,
                      )}
                    >
                      Why Use Instant Gigs?
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featureCards.map((feature, index) => (
                      <FeatureCard
                        key={index}
                        feature={feature}
                        colors={colors}
                      />
                    ))}
                  </div>
                </div>

                {/* Benefits List */}
                <div>
                  <div className="flex items-center gap-3 justify-center mb-8">
                    <Star className="w-8 h-8 text-amber-500" />
                    <h4
                      className={cn(
                        "text-xl font-bold text-center",
                        colors.text,
                      )}
                    >
                      Key Benefits
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                    {BENEFIT_ITEMS.map((benefit, index) => (
                      <BenefitItem
                        key={index}
                        benefit={benefit}
                        colors={colors}
                      />
                    ))}
                  </div>
                </div>

                {/* How It Works */}
                <div>
                  <div className="flex items-center gap-3 justify-center mb-8">
                    <BookOpen className="w-8 h-8 text-green-500" />
                    <h4
                      className={cn(
                        "text-xl font-bold text-center",
                        colors.text,
                      )}
                    >
                      How It Works
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <div className="text-center group">
                      <div
                        className={cn(
                          "w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300",
                          colors.backgroundMuted,
                        )}
                      >
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          1
                        </div>
                      </div>
                      <h5
                        className={cn(
                          "font-bold text-lg mb-3 group-hover:text-blue-600 transition-colors",
                          colors.text,
                        )}
                      >
                        Create Templates
                      </h5>
                      <p
                        className={cn(
                          "text-sm leading-relaxed",
                          colors.textMuted,
                        )}
                      >
                        Design reusable gig templates for weddings, corporate
                        events, parties, and more
                      </p>
                    </div>
                    <div className="text-center group">
                      <div
                        className={cn(
                          "w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300",
                          colors.backgroundMuted,
                        )}
                      >
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          2
                        </div>
                      </div>
                      <h5
                        className={cn(
                          "font-bold text-lg mb-3 group-hover:text-green-600 transition-colors",
                          colors.text,
                        )}
                      >
                        Browse Musicians
                      </h5>
                      <p
                        className={cn(
                          "text-sm leading-relaxed",
                          colors.textMuted,
                        )}
                      >
                        Discover premium verified musicians with ratings,
                        reviews, and audio samples
                      </p>
                    </div>
                    <div className="text-center group">
                      <div
                        className={cn(
                          "w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300",
                          colors.backgroundMuted,
                        )}
                      >
                        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          3
                        </div>
                      </div>
                      <h5
                        className={cn(
                          "font-bold text-lg mb-3 group-hover:text-purple-600 transition-colors",
                          colors.text,
                        )}
                      >
                        Instant Booking
                      </h5>
                      <p
                        className={cn(
                          "text-sm leading-relaxed",
                          colors.textMuted,
                        )}
                      >
                        Send booking requests and get instant confirmations with
                        secure payments
                      </p>
                    </div>
                  </div>
                </div>

                {/* Use Cases */}
                <div>
                  <div className="flex items-center gap-3 justify-center mb-8">
                    <Calendar className="w-8 h-8 text-purple-500" />
                    <h4
                      className={cn(
                        "text-xl font-bold text-center",
                        colors.text,
                      )}
                    >
                      Perfect For These Events
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                    {[
                      {
                        icon: "💒",
                        name: "Weddings",
                        desc: "Ceremonies & Receptions",
                      },
                      { icon: "🏢", name: "Corporate", desc: "Events & Galas" },
                      {
                        icon: "🎉",
                        name: "Private Parties",
                        desc: "Birthdays & Celebrations",
                      },
                      {
                        icon: "🎪",
                        name: "Festivals",
                        desc: "Concerts & Events",
                      },
                    ].map((event, index) => (
                      <div
                        key={index}
                        className={cn(
                          "text-center p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg",
                          colors.border,
                          colors.card,
                          "hover:border-blue-300",
                        )}
                      >
                        <div className="text-3xl mb-3">{event.icon}</div>
                        <div className={cn("font-bold mb-1", colors.text)}>
                          {event.name}
                        </div>
                        <div className={cn("text-xs", colors.textMuted)}>
                          {event.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className={cn(
                "p-6 border-t text-center",
                colors.border,
                colors.backgroundMuted,
              )}
            >
              <p className={cn("text-sm", colors.textMuted)}>
                Join{" "}
                <span className={cn("font-bold", colors.infoText)}>
                  500+ event planners
                </span>{" "}
                already using Instant Gigs
              </p>
            </div>
          </div>
        </div>
      );
    }, [
      isOpen,
      handleClose,
      handleCreationSelect,
      colors,
      featureCards,
      creationOptions,
    ]);

    return modalContent;
  },
);

OnboardingModal.displayName = "OnboardingModal";
