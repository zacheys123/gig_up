// app/hub/gigs/_components/UpgradeBlock.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Crown, Zap, Users, Star, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";

export const UpgradeBlock = ({ user }: { user: any }) => {
  const { colors } = useThemeColors();

  const features = [
    "50+ Professional Templates",
    "Instant Musician Matching",
    "Custom Template Creation",
    "Priority Booking Access",
    "Unlimited Template Storage",
    "Advanced Customization",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div
        className={cn(
          "max-w-2xl w-full rounded-3xl p-8 text-center",
          colors.card,
          colors.border,
          "border shadow-2xl"
        )}
      >
        {/* Header */}
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
          <Zap className="w-10 h-10 text-white" />
        </div>

        <h1 className={cn("text-4xl font-bold mb-4", colors.text)}>
          Instant Gigs Locked
        </h1>

        <p className={cn("text-xl mb-8 max-w-md mx-auto", colors.textMuted)}>
          Upgrade to Pro to access instant booking, professional templates, and
          premium features
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3 text-left">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className={cn("text-sm", colors.text)}>{feature}</span>
            </div>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
          {/* Pro Card */}
          <div
            className={cn(
              "border-2 rounded-2xl p-6 text-center",
              "border-green-200 dark:border-green-800",
              colors.card
            )}
          >
            <div className="px-4 py-1 rounded-full text-sm font-bold bg-green-500 text-white inline-block mb-3">
              PRO
            </div>
            <h3 className={cn("font-bold text-2xl mb-2", colors.text)}>
              KES 1,500
            </h3>
            <p className={cn("text-sm mb-4", colors.textMuted)}>per month</p>
            <Button
              onClick={() => window.open("/pricing", "_blank")}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          </div>

          {/* Premium Card */}
          <div
            className={cn(
              "border-2 rounded-2xl p-6 text-center",
              "border-amber-200 dark:border-amber-800",
              colors.card
            )}
          >
            <div className="px-4 py-1 rounded-full text-sm font-bold bg-amber-500 text-white inline-block mb-3">
              PREMIUM
            </div>
            <h3 className={cn("font-bold text-2xl mb-2", colors.text)}>
              KES 3,500
            </h3>
            <p className={cn("text-sm mb-4", colors.textMuted)}>per month</p>
            <Button
              onClick={() => window.open("/pricing", "_blank")}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Star className="w-4 h-4 mr-2" />
              Go Premium
            </Button>
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          className={cn(
            "rounded-2xl p-6",
            colors.primaryBg,
            colors.textInverted
          )}
        >
          <h4 className="text-xl font-bold mb-2">Ready to Get Started?</h4>
          <p className="mb-4 opacity-90">
            Join thousands of musicians using Instant Gigs
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => window.open("/pricing", "_blank")}
              className="bg-white text-green-600 hover:bg-gray-100 font-semibold"
            >
              View All Plans
            </Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-green-600"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
