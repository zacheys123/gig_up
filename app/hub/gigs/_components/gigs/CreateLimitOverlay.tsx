"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Crown,
  Lock,
  Calendar,
  Sparkles,
  Zap,
  Check,
  ArrowRight,
  Infinity,
  Trophy,
  BarChart,
  MessageSquare,
  X,
} from "lucide-react";

interface CreateLimitOverlayProps {
  showCreateLimitOverlay: boolean;
  isInGracePeriod?: boolean;
}

const CreateLimitOverlay: React.FC<CreateLimitOverlayProps> = ({
  showCreateLimitOverlay,
  isInGracePeriod = false,
}) => {
  if (!showCreateLimitOverlay) return null;

  const theme = isInGracePeriod ? "purple" : "red";

  return (
    <div className="mb-8">
      {/* Main Card */}
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl p-8 backdrop-blur-sm border",
          "md:p-10",
          theme === "purple"
            ? "border-purple-200/50 bg-gradient-to-br from-purple-50/90 via-white to-purple-25/90 shadow-2xl shadow-purple-100/30"
            : "border-red-200/50 bg-gradient-to-br from-red-50/90 via-white to-red-25/90 shadow-2xl shadow-red-100/30"
        )}
      >
        {/* Abstract Background */}
        <div className="absolute inset-0 opacity-5">
          <div
            className={cn(
              "absolute inset-0",
              theme === "purple"
                ? "bg-[radial-gradient(circle_at_30%_20%,#8b5cf6_0%,transparent_50%)]"
                : "bg-[radial-gradient(circle_at_30%_20%,#ef4444_0%,transparent_50%)]"
            )}
          />
        </div>

        {/* Content Layout */}
        <div className="relative flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Side - Icon & Stats */}
          <div className="flex-shrink-0 lg:w-1/3">
            <div
              className={cn(
                "relative group",
                theme === "purple" ? "text-purple-600" : "text-red-600"
              )}
            >
              {/* Floating Icon */}
              <div className="absolute -top-4 -left-4 opacity-20">
                <div className="w-24 h-24">
                  {isInGracePeriod ? (
                    <Calendar className="w-full h-full" />
                  ) : (
                    <Lock className="w-full h-full" />
                  )}
                </div>
              </div>

              {/* Main Icon Container */}
              <div
                className={cn(
                  "relative w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center mb-6",
                  "transition-transform duration-500 group-hover:scale-110",
                  theme === "purple"
                    ? "bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/25"
                    : "bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/25"
                )}
              >
                {isInGracePeriod ? (
                  <Calendar className="w-10 h-10 md:w-12 md:h-12 text-white" />
                ) : (
                  <Lock className="w-10 h-10 md:w-12 md:h-12 text-white" />
                )}
              </div>

              {/* Stats */}
              <div className="space-y-4">
                <div
                  className={cn(
                    "px-4 py-3 rounded-xl border backdrop-blur-sm",
                    theme === "purple"
                      ? "border-purple-200/50 bg-purple-50/50"
                      : "border-red-200/50 bg-red-50/50"
                  )}
                >
                  <div className="text-sm opacity-75 mb-1">Current Limit</div>
                  <div className="text-2xl md:text-3xl font-bold">3 Gigs</div>
                </div>

                <div
                  className={cn(
                    "px-4 py-3 rounded-xl border backdrop-blur-sm",
                    theme === "purple"
                      ? "border-purple-200/50 bg-white/50"
                      : "border-red-200/50 bg-white/50"
                  )}
                >
                  <div className="text-sm opacity-75 mb-1">Pro Limit</div>
                  <div className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                    <Infinity className="w-6 h-6" />
                    Unlimited
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 bg-white/80 backdrop-blur-sm border shadow-sm">
                <Crown className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {isInGracePeriod ? "Grace Period Active" : "Free Tier"}
                </span>
              </div>

              <h2
                className={cn(
                  "text-3xl md:text-4xl font-bold tracking-tight mb-4",
                  theme === "purple" ? "text-purple-900" : "text-red-900"
                )}
              >
                {isInGracePeriod
                  ? "Your Grace Period Limit is Here"
                  : "You've Reached Your Limit"}
              </h2>

              <p
                className={cn(
                  "text-lg md:text-xl leading-relaxed max-w-2xl",
                  theme === "purple" ? "text-purple-700" : "text-red-700"
                )}
              >
                {isInGracePeriod
                  ? "While your grace period has allowed you to explore, it's time to unlock unlimited potential with Pro."
                  : "The free tier is just the beginning. Upgrade to Pro and experience gig creation without limits."}
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {[
                {
                  icon: <Infinity className="w-5 h-5" />,
                  title: "Unlimited Gigs",
                  desc: "Create as many gigs as you need",
                },
                {
                  icon: <Trophy className="w-5 h-5" />,
                  title: "Priority Placement",
                  desc: "Top of search results",
                },
                {
                  icon: <BarChart className="w-5 h-5" />,
                  title: "Advanced Analytics",
                  desc: "Track performance & insights",
                },
                {
                  icon: <Sparkles className="w-5 h-5" />,
                  title: "Premium Features",
                  desc: "Scheduling & automation",
                },
                {
                  icon: <MessageSquare className="w-5 h-5" />,
                  title: "Dedicated Support",
                  desc: "Priority customer service",
                },
                {
                  icon: <Zap className="w-5 h-5" />,
                  title: "No Ads",
                  desc: "Clean, uninterrupted experience",
                },
              ].map((benefit, index) => (
                <div
                  key={index}
                  className={cn(
                    "group p-5 rounded-xl border transition-all duration-300 hover:translate-y-[-4px]",
                    theme === "purple"
                      ? "border-purple-100 bg-white/50 hover:bg-white hover:shadow-lg hover:border-purple-200"
                      : "border-red-100 bg-white/50 hover:bg-white hover:shadow-lg hover:border-red-200"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center",
                        theme === "purple"
                          ? "bg-purple-100 text-purple-600"
                          : "bg-red-100 text-red-600"
                      )}
                    >
                      {benefit.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {benefit.title}
                      </h4>
                      <p className="text-sm text-gray-600">{benefit.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  className={cn(
                    "flex-1 h-14 rounded-xl text-base font-semibold gap-3",
                    theme === "purple"
                      ? "border-purple-300 text-purple-700 hover:bg-purple-50"
                      : "border-red-300 text-red-700 hover:bg-red-50"
                  )}
                  onClick={() => window.open("/features/pro", "_blank")}
                >
                  <Sparkles className="w-5 h-5" />
                  Explore Features
                </Button>

                <Button
                  size="lg"
                  className={cn(
                    "flex-1 h-14 rounded-xl text-base font-semibold gap-3 shadow-lg",
                    theme === "purple"
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                      : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                  )}
                  onClick={() => window.open("/pricing", "_blank")}
                >
                  <Crown className="w-5 h-5" />
                  Upgrade Now
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
              </div>

              {/* Special Offer */}
              {isInGracePeriod && (
                <div
                  className={cn(
                    "p-4 rounded-xl border backdrop-blur-sm",
                    "border-purple-200/50 bg-gradient-to-r from-purple-50/50 to-white/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white font-bold">20%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-900">
                        Special Grace Period Offer
                      </p>
                      <p className="text-xs text-purple-700">
                        Upgrade within your grace period for 20% off your first
                        month!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLimitOverlay;
