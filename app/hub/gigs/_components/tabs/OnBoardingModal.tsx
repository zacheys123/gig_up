// app/hub/gigs/_components/OnboardingModal.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  X,
  Sparkles,
  Users,
  Zap,
  ArrowRight,
  Lightbulb,
  Rocket,
  Music,
  Calendar,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { HiTemplate } from "react-icons/hi";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGuidedCreation: () => void;
  onCustomCreation: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onGuidedCreation,
  onCustomCreation,
}) => {
  const { colors } = useThemeColors();

  if (!isOpen) return null;

  const features = [
    {
      icon: HiTemplate,
      title: "Create Custom Templates",
      description:
        "Design your perfect gig template once, use it multiple times",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Users,
      title: "Book Premium Musicians",
      description: "Connect with verified professional musicians across Kenya",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: Zap,
      title: "Instant Booking",
      description: "Send booking requests directly to musicians you love",
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-500/10",
    },
    {
      icon: Sparkles,
      title: "Save Time & Effort",
      description: "No more repetitive gig descriptions - focus on the music",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
    },
  ];

  const stats = [
    { value: "50+", label: "Pro Musicians" },
    { value: "4.8★", label: "Avg Rating" },
    { value: "24h", label: "Avg Response" },
    { value: "95%", label: "Success Rate" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={cn(
          "relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl border shadow-2xl",
          "animate-in zoom-in-95 duration-300",
          colors.card,
          colors.border
        )}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col lg:flex-row h-full">
          {/* Left Side - Hero Section */}
          <div className="flex-1 p-8 lg:p-12 lg:border-r lg:border-opacity-20">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <span
                  className={cn(
                    "text-sm font-semibold tracking-wider",
                    colors.text
                  )}
                >
                  INSTANT GIGS
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-xl hover:bg-background/50"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Main Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  New Feature
                </span>
              </div>

              <h1
                className={cn(
                  "text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent",
                  "leading-tight"
                )}
              >
                Book Musicians
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  In Seconds
                </span>
              </h1>

              <p
                className={cn(
                  "text-xl mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed",
                  colors.textMuted
                )}
              >
                Create custom gig templates and connect with premium Kenyan
                musicians instantly. Perfect for events, weddings, corporate
                functions, and more.
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 max-w-md mx-auto lg:mx-0">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className={cn(
                      "text-center p-4 rounded-2xl border backdrop-blur-sm",
                      colors.border,
                      "bg-background/50"
                    )}
                  >
                    <div className={cn("text-2xl font-bold mb-1", colors.text)}>
                      {stat.value}
                    </div>
                    <div
                      className={cn("text-xs font-medium", colors.textMuted)}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className={cn(
                      "group p-4 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105",
                      colors.border,
                      "bg-background/40 hover:bg-background/60",
                      "hover:shadow-lg"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                          "bg-gradient-to-br",
                          feature.color,
                          "shadow-lg group-hover:shadow-xl transition-shadow"
                        )}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className={cn("font-semibold mb-2", colors.text)}>
                          {feature.title}
                        </h3>
                        <p
                          className={cn(
                            "text-sm leading-relaxed",
                            colors.textMuted
                          )}
                        >
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side - Action Section */}
          <div className="flex-1 p-8 lg:p-12 flex flex-col">
            <div className="flex-1">
              {/* How It Works */}
              <div
                className={cn(
                  "rounded-2xl p-6 mb-8 border backdrop-blur-sm",
                  colors.border,
                  "bg-background/40"
                )}
              >
                <h3
                  className={cn(
                    "font-bold text-xl mb-6 text-center",
                    colors.text
                  )}
                >
                  How It Works
                </h3>
                <div className="flex items-center justify-between">
                  {[
                    { step: 1, label: "Create Template", icon: HiTemplate },
                    { step: 2, label: "Browse Musicians", icon: Users },
                    { step: 3, label: "Book Instantly", icon: Calendar },
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.step} className="text-center flex-1">
                        <div className="relative">
                          <div
                            className={cn(
                              "w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center",
                              "bg-gradient-to-br from-blue-500 to-purple-600 text-white",
                              "shadow-lg"
                            )}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          {index < 2 && (
                            <ArrowRight className="absolute top-1/2 right-[-40%] w-4 h-4 text-muted-foreground transform -translate-y-1/2" />
                          )}
                        </div>
                        <div className="w-2 h-2 mx-auto mb-2 bg-blue-500 rounded-full" />
                        <div className={cn("text-sm font-medium", colors.text)}>
                          {item.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Creation Options */}
              <div className="space-y-4">
                {/* Guided Creation */}
                <div
                  onClick={onGuidedCreation}
                  className={cn(
                    "group p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300",
                    "border-blue-500/20 hover:border-blue-500/40",
                    "bg-gradient-to-br from-blue-500/5 to-blue-500/10 backdrop-blur-sm",
                    "hover:shadow-xl hover:scale-105"
                  )}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Lightbulb className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className={cn("font-bold text-lg mb-1", colors.text)}>
                        Start with Examples
                      </h4>
                      <p className={cn("text-sm", colors.textMuted)}>
                        Perfect for beginners
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ArrowRight className="w-4 h-4 text-blue-500" />
                    </div>
                  </div>

                  <ul className={cn("space-y-2 mb-4", colors.textMuted)}>
                    {[
                      "Use pre-made templates as inspiration",
                      "Customize existing examples",
                      "Learn best practices quickly",
                    ].map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-3 text-sm"
                      >
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                    <Star className="w-3 h-3 fill-current" />
                    <span>Recommended for first-time users</span>
                  </div>
                </div>

                {/* Custom Creation */}
                <div
                  onClick={onCustomCreation}
                  className={cn(
                    "group p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300",
                    "border-purple-500/20 hover:border-purple-500/40",
                    "bg-gradient-to-br from-purple-500/5 to-pink-500/10 backdrop-blur-sm",
                    "hover:shadow-xl hover:scale-105"
                  )}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Rocket className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className={cn("font-bold text-lg mb-1", colors.text)}>
                        Create from Scratch
                      </h4>
                      <p className={cn("text-sm", colors.textMuted)}>
                        For experienced users
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ArrowRight className="w-4 h-4 text-purple-500" />
                    </div>
                  </div>

                  <ul className={cn("space-y-2 mb-4", colors.textMuted)}>
                    {[
                      "Complete creative freedom",
                      "Build exactly what you need",
                      "Skip the examples and templates",
                    ].map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-3 text-sm"
                      >
                        <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-opacity-20">
              <div className="text-center">
                <button
                  onClick={onClose}
                  className={cn(
                    "text-sm font-medium hover:underline transition-all",
                    colors.textMuted,
                    "hover:text-foreground"
                  )}
                >
                  I'll explore on my own
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
