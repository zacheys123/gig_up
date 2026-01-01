"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Shield,
  TrendingUp,
  Star,
  Users,
  Calendar,
  CheckCircle,
  Target,
  Award,
  BarChart3,
  Clock,
  Zap,
  ArrowRight,
  Rocket,
  Gem,
  LockOpen,
  PieChart,
} from "lucide-react";

interface TrustScoreOverlayProps {
  currentScore: number;
  requiredScore: number;
}

const TrustScoreOverlay: React.FC<TrustScoreOverlayProps> = ({
  currentScore,
  requiredScore,
}) => {
  const scoreNeeded = requiredScore - currentScore;
  const progressPercentage = Math.min(
    (currentScore / requiredScore) * 100,
    100
  );

  const improvementAreas = [
    {
      category: "Profile",
      tasks: [
        { text: "Complete profile picture", points: 5, completed: false },
        { text: "Add detailed bio", points: 5, completed: false },
        { text: "List your skills", points: 5, completed: false },
      ],
      icon: <Users className="w-5 h-5" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      category: "Verification",
      tasks: [
        { text: "Verify email", points: 5, completed: false },
        { text: "Connect payment method", points: 10, completed: false },
        { text: "Verify identity", points: 5, completed: false },
      ],
      icon: <Shield className="w-5 h-5" />,
      color: "from-emerald-500 to-green-500",
    },
    {
      category: "Activity",
      tasks: [
        { text: "Complete first gig", points: 10, completed: false },
        { text: "Maintain 30-day streak", points: 5, completed: false },
        { text: "Add portfolio items", points: 5, completed: false },
      ],
      icon: <Calendar className="w-5 h-5" />,
      color: "from-amber-500 to-orange-500",
    },
  ];

  const unlockedFeatures = [
    {
      score: 10,
      feature: "Basic Gig Creation",
      icon: "🎯",
      unlocked: currentScore >= 10,
    },
    {
      score: 40,
      feature: "Regular Scheduling",
      icon: "📅",
      unlocked: currentScore >= 40,
    },
    {
      score: 60,
      feature: "Automatic Scheduling",
      icon: "⚡",
      unlocked: currentScore >= 60,
    },
    {
      score: 80,
      feature: "Premium Placement",
      icon: "🏆",
      unlocked: currentScore >= 80,
    },
  ];

  return (
    <div className="mb-8">
      <div className="relative overflow-hidden rounded-3xl border border-amber-200/50 bg-gradient-to-br from-amber-50/90 via-white to-orange-25/90 p-8 backdrop-blur-sm shadow-2xl shadow-amber-100/30 md:p-10">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,#f59e0b_0%,transparent_50%)]" />
        </div>

        {/* Header Section */}
        <div className="relative mb-10">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            {/* Left Column - Score Display */}
            <div className="flex-shrink-0 lg:w-2/5">
              <div className="relative group">
                {/* Score Circle */}
                <div className="relative w-48 h-48 md:w-56 md:h-56 mx-auto">
                  {/* Background Circle */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 border-8 border-amber-200/50" />

                  {/* Progress Ring */}
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-amber-200"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-amber-500 transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                      strokeDasharray={`${progressPercentage * 2.83} 1000`}
                    />
                  </svg>

                  {/* Score Display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-5xl md:text-6xl font-bold text-gray-900">
                      {currentScore}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">out of 100</div>
                    <div
                      className={cn(
                        "mt-4 px-4 py-1.5 rounded-full text-sm font-medium",
                        currentScore >= requiredScore
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      )}
                    >
                      {currentScore >= requiredScore
                        ? "✓ Qualified"
                        : `${scoreNeeded} points needed`}
                    </div>
                  </div>
                </div>

                {/* Required Score Indicator */}
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border shadow-sm">
                    <Target className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium">
                      Required: {requiredScore} points
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="flex-1">
              <div className="max-w-2xl">
                {/* Title */}
                <div className="mb-6">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                    Build Your Trust Score
                  </h1>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Your trust score reflects your reputation on the platform.
                    Higher scores unlock premium features and increase your
                    visibility.
                  </p>
                </div>

                {/* Features Grid */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Gem className="w-5 h-5 text-amber-600" />
                    Unlockable Features
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {unlockedFeatures.map((feature, index) => (
                      <div
                        key={index}
                        className={cn(
                          "p-4 rounded-xl border transition-all duration-300",
                          feature.unlocked
                            ? "border-green-200 bg-green-50/50"
                            : "border-gray-200 bg-white/50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl",
                              feature.unlocked
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-400"
                            )}
                          >
                            {feature.icon}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {feature.feature}
                            </div>
                            <div className="text-sm text-gray-600">
                              {feature.score}+ points
                            </div>
                          </div>
                          <div className="ml-auto">
                            {feature.unlocked ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <LockOpen className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-12 gap-3 border-amber-300 text-amber-700 hover:bg-amber-50"
                      onClick={() => window.open("/profile/edit", "_blank")}
                    >
                      <Users className="w-4 h-4" />
                      Complete Profile
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-12 gap-3 border-blue-300 text-blue-700 hover:bg-blue-50"
                      onClick={() => window.open("/verification", "_blank")}
                    >
                      <Shield className="w-4 h-4" />
                      Get Verified
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-12 gap-3 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                      onClick={() => window.open("/gigs", "_blank")}
                    >
                      <Calendar className="w-4 h-4" />
                      Find Gigs
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Improvement Areas */}
        <div className="relative mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Areas for Improvement
            </h3>
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">
                Total potential: +75 points
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {improvementAreas.map((area, areaIndex) => (
              <div
                key={areaIndex}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
              >
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${area.color} flex items-center justify-center shadow-md`}
                  >
                    <div className="text-white">{area.icon}</div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{area.category}</h4>
                    <div className="text-sm text-gray-600">
                      {area.tasks.reduce((sum, task) => sum + task.points, 0)}{" "}
                      points available
                    </div>
                  </div>
                </div>

                {/* Task List */}
                <div className="space-y-3">
                  {area.tasks.map((task, taskIndex) => (
                    <div
                      key={taskIndex}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center",
                            task.completed
                              ? "bg-green-100 text-green-600"
                              : "bg-amber-100 text-amber-600"
                          )}
                        >
                          {task.completed ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-current" />
                          )}
                        </div>
                        <span className="text-sm text-gray-700">
                          {task.text}
                        </span>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-800 rounded">
                        +{task.points}pts
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-4 gap-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                  onClick={() =>
                    window.open(
                      `/profile/${area.category.toLowerCase()}`,
                      "_blank"
                    )
                  }
                >
                  <ArrowRight className="w-3 h-3" />
                  Improve {area.category}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="relative">
          <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 p-6 border border-amber-200/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Ready to boost your score?
                </h3>
                <p className="text-gray-700">
                  Start completing tasks now to unlock premium features and
                  increase your visibility.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-3 border-amber-300 text-amber-700 hover:bg-amber-50"
                  onClick={() => window.open("/profile/trust/guide", "_blank")}
                >
                  <Target className="w-4 h-4" />
                  View Guide
                </Button>
                <Button
                  size="lg"
                  className="gap-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg"
                  onClick={() => window.open("/profile/edit", "_blank")}
                >
                  <Rocket className="w-4 h-4" />
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustScoreOverlay;
