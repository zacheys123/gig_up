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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGuidedCreation: () => void;
  onCustomCreation: () => void;
  onScratchCreation?: () => void; // ADD THIS
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
const getCreationOptions = (colors: any) => [
  {
    id: "guided",
    title: "Guided Creation",
    description: "Perfect for first-time users",
    icon: Wand2,
    features: [
      "Step-by-step template builder",
      "Pre-built examples",
      "Best practices guidance",
      "Quick setup",
    ],
    color: "from-violet-300 to-yellow-500",
    buttonText: "Start Guided Creation",
    iconBg: colors.infoBg,
    iconColor: colors.infoText,
  },
  {
    id: "scratch", // NEW OPTION
    title: "Start from Scratch",
    description: "For complete creative freedom",
    icon: Sparkles, // Make sure to import Sparkles
    features: [
      "Blank canvas",
      "No templates or examples",
      "Total customization",
      "Advanced options",
    ],
    color: "from-purple-500 to-pink-500",
    buttonText: "Start from Scratch",
    iconBg: colors.card,
    iconColor: colors.primary,
  },
  {
    id: "custom",
    title: "Custom Creation",
    description: "For experienced users",
    icon: Settings,
    features: [
      "Full customization",
      "Advanced options",
      "Flexible templates",
      "Complete control",
    ],
    color: "from-blue-500 to-green-500",
    buttonText: "Start Custom Creation",
    iconBg: colors.successBg,
    iconColor: colors.successText,
  },
];

// Memoize FeatureCard component
const FeatureCard = memo(({ feature, colors }: any) => {
  const Icon = feature.icon;
  return (
    <div
      className={cn(
        "p-4 rounded-xl border transition-all duration-200 hover:scale-105",
        colors.border,
        feature.bgColor
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
        colors.text
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
        colors.backgroundMuted
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

// Memoize CreationOption component
const CreationOption = memo(({ option, onSelect, colors }: any) => {
  const Icon = option.icon;

  const handleClick = useCallback(() => {
    onSelect(option.id); // This can now be "guided", "scratch", or "custom"
  }, [option.id, onSelect]);

  return (
    <div
      className={cn(
        "rounded-2xl p-6 border-2 transition-all duration-300 group cursor-pointer",
        colors.border,
        colors.card,
        "hover:scale-105 hover:shadow-xl",
        "hover:border-blue-300"
      )}
    >
      <div className="text-center mb-6">
        <div
          className={cn(
            "w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
            option.iconBg
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

      <div className="space-y-3 mb-6">
        {option.features.map((feature: string, index: number) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
            <span className={cn("text-xs", colors.textMuted)}>{feature}</span>
          </div>
        ))}
      </div>

      <Button
        onClick={handleClick}
        className={cn(
          "w-full bg-gradient-to-r transition-all duration-300 hover:scale-105",
          option.color
        )}
        size="lg"
      >
        {option.buttonText}
        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  );
});

CreationOption.displayName = "CreationOption";

export const OnboardingModal: React.FC<OnboardingModalProps> = memo(
  ({
    isOpen,
    onClose,
    onGuidedCreation,
    onCustomCreation,
    onScratchCreation,
  }) => {
    const { colors } = useThemeColors();

    // Memoize dynamic data based on theme
    const featureCards = useMemo(() => getFeatureCards(colors), [colors]);
    const creationOptions = useMemo(() => getCreationOptions(colors), [colors]);

    // Memoize event handlers
    const handleClose = useCallback(() => {
      onClose();
    }, [onClose]);

    const handleGuidedCreation = useCallback(() => {
      onGuidedCreation();
    }, [onGuidedCreation]);

    const handleCustomCreation = useCallback(() => {
      onCustomCreation();
    }, [onCustomCreation]);

    const handleScratchCreation = useCallback(() => {
      if (onScratchCreation) {
        onScratchCreation();
      }
    }, [onScratchCreation]);

    // UPDATE: Fix the creation select handler to include scratch
    const handleCreationSelect = useCallback(
      (type: "guided" | "custom" | "scratch") => {
        if (type === "guided") {
          handleGuidedCreation();
        } else if (type === "custom") {
          handleCustomCreation();
        } else if (type === "scratch" && onScratchCreation) {
          handleScratchCreation();
        }
      },
      [
        handleGuidedCreation,
        handleCustomCreation,
        handleScratchCreation,
        onScratchCreation,
      ]
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
              "border-2 shadow-2xl"
            )}
          >
            {/* Header */}
            <div
              className={cn(
                "p-8 border-b",
                colors.border,
                colors.backgroundMuted
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
                <Button
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
                </Button>
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
                      colors.backgroundMuted
                    )}
                  >
                    <Rocket className={cn("w-12 h-12", colors.infoText)} />
                  </div>
                  <h3 className={cn("text-2xl font-bold mb-4", colors.text)}>
                    Book Musicians Faster Than Ever
                  </h3>
                  <p
                    className={cn(
                      "text-xl mb-8 max-w-3xl mx-auto leading-relaxed",
                      colors.textMuted
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
                      <h4 className={cn("text-2xl font-bold", colors.text)}>
                        Choose Your Creation Style
                      </h4>
                    </div>
                    <p
                      className={cn(
                        "text-lg max-w-2xl mx-auto",
                        colors.textMuted
                      )}
                    >
                      Select how you'd like to create your first gig template
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {creationOptions.map((option) => (
                      <CreationOption
                        key={option.id}
                        option={option}
                        onSelect={handleCreationSelect}
                        colors={colors}
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
                        "text-2xl font-bold text-center",
                        colors.text
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
                        "text-2xl font-bold text-center",
                        colors.text
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
                        "text-2xl font-bold text-center",
                        colors.text
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
                          colors.backgroundMuted
                        )}
                      >
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          1
                        </div>
                      </div>
                      <h5
                        className={cn(
                          "font-bold text-lg mb-3 group-hover:text-blue-600 transition-colors",
                          colors.text
                        )}
                      >
                        Create Templates
                      </h5>
                      <p
                        className={cn(
                          "text-sm leading-relaxed",
                          colors.textMuted
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
                          colors.backgroundMuted
                        )}
                      >
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          2
                        </div>
                      </div>
                      <h5
                        className={cn(
                          "font-bold text-lg mb-3 group-hover:text-green-600 transition-colors",
                          colors.text
                        )}
                      >
                        Browse Musicians
                      </h5>
                      <p
                        className={cn(
                          "text-sm leading-relaxed",
                          colors.textMuted
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
                          colors.backgroundMuted
                        )}
                      >
                        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          3
                        </div>
                      </div>
                      <h5
                        className={cn(
                          "font-bold text-lg mb-3 group-hover:text-purple-600 transition-colors",
                          colors.text
                        )}
                      >
                        Instant Booking
                      </h5>
                      <p
                        className={cn(
                          "text-sm leading-relaxed",
                          colors.textMuted
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
                        "text-2xl font-bold text-center",
                        colors.text
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
                          "hover:border-blue-300"
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
                colors.backgroundMuted
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
  }
);

OnboardingModal.displayName = "OnboardingModal";
