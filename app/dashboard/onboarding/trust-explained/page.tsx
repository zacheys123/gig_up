// app/onboarding/trust-explained/page.tsx - UPDATED WITH TRUST STARS
"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Home,
  User,
  TrendingUp,
  Target,
  Star,
  Shield,
  CheckCircle,
  Zap,
  Award,
  Lock,
  Unlock,
  Phone,
  CreditCard,
  Users,
  Calendar,
  FileCheck,
  ThumbsUp,
  Clock,
  DollarSign,
  BarChart,
  Briefcase,
  Eye,
  Crown,
  Sparkles,
  Rocket,
  TargetIcon,
  Activity,
  Video,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

// Tier data with trust stars
const TIERS = [
  {
    id: "new",
    name: "Newcomer",
    displayName: "Newcomer",
    emoji: "🌱",
    scoreRange: "0-29",
    starRange: "0.5-1.9",
    color: "from-gray-400 to-gray-500",
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
    borderColor: "border-gray-300",
    description: "Just starting your journey",
    icon: Sparkles,
  },
  {
    id: "basic",
    name: "basic",
    displayName: "Basic",
    emoji: "⭐",
    scoreRange: "30-49",
    starRange: "2.0-2.4",
    color: "from-blue-400 to-blue-500",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    borderColor: "border-blue-300",
    description: "Building momentum and credibility",
    icon: TrendingUp,
  },
  {
    id: "verified",
    name: "verified",
    displayName: "Verified",
    emoji: "✅",
    scoreRange: "50-64",
    starRange: "2.5-3.4",
    color: "from-green-400 to-green-500",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    borderColor: "border-green-300",
    description: "Trusted with verified credentials",
    icon: Shield,
  },
  {
    id: "trusted",
    name: "trusted",
    displayName: "Trusted",
    emoji: "🤝",
    scoreRange: "65-79",
    starRange: "3.5-4.4",
    color: "from-purple-400 to-purple-500",
    bgColor: "bg-purple-100",
    textColor: "text-purple-800",
    borderColor: "border-purple-300",
    description: "Highly reliable and experienced",
    icon: Users,
  },
  {
    id: "elite",
    name: "elite",
    displayName: "Elite",
    emoji: "🏆",
    scoreRange: "80-100",
    starRange: "4.5-5.0",
    color: "from-yellow-400 to-amber-500",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    borderColor: "border-yellow-300",
    description: "Top-tier with proven excellence",
    icon: Crown,
  },
] as const;

type TierId = (typeof TIERS)[number]["id"];

interface EarningItem {
  action: string;
  points: string | number;
  icon: LucideIcon;
}

interface EarningCategory {
  category: string;
  items: EarningItem[];
}

// How to earn points - UPDATED WITH STAR RANGES
// How to earn points - UPDATED WITH PROPER WEIGHTING
const EARNING_METHODS: EarningCategory[] = [
  {
    category: "Core Activities",
    items: [
      {
        action: "Complete gigs",
        points: "+10-30 points per tier",
        icon: Calendar,
      },
      { action: "Post and complete gigs", points: "+25 max", icon: Calendar },
      { action: "Upload videos", points: "+5-15 points", icon: Video }, // Add Video icon
      {
        action: "Get video likes/views",
        points: "+2-10 points",
        icon: ThumbsUp,
      },
    ],
  },
  {
    category: "Performance",
    items: [
      { action: "Maintain 4.8+ rating", points: "+12-15 points", icon: Star },
      { action: "Quick response rate", points: "+5 points", icon: Clock },
      { action: "High completion rate", points: "+25 max", icon: CheckCircle },
    ],
  },
  {
    category: "Verification",
    items: [
      { action: "Add payment method", points: "+15 points", icon: CreditCard },
      { action: "Phone verification", points: "+5 points", icon: Phone },
      { action: "Profile completion", points: "+10 points total", icon: User },
    ],
  },
];

// Benefits by tier
const TIER_BENEFITS: Record<string, string[]> = {
  new: [
    "Basic gig browsing",
    "Standard search visibility",
    "Access to entry-level gigs",
  ],
  basic: [
    "Higher search ranking",
    "Increased application limits",
    "Basic analytics access",
  ],
  verified: [
    "Verified badge on profile",
    "Premium gig visibility",
    "Advanced analytics dashboard",
    "Priority support access",
  ],
  trusted: [
    "Top search placement",
    "Exclusive gig invitations",
    "Band creation eligibility",
    "Premium networking events",
    "Featured profile placement",
  ],
  elite: [
    "Elite badge and recognition",
    "Highest gig priority",
    "Elite performer directory",
    "VIP networking events",
    "Premium partnerships",
    "Revenue share opportunities",
  ],
};

interface Improvement {
  action: string;
  points: number | string;
  description?: string;
  category?: string;
}

// Star Display Component
const StarDisplay = ({
  stars,
  size = "md",
  showValue = true,
}: {
  stars: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}) => {
  const fullStars = Math.floor(stars);
  const hasHalfStar = stars % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const starSize = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }[size];

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className={`${starSize} fill-yellow-400 text-yellow-400`}
          fill="currentColor"
        />
      ))}
      {hasHalfStar && (
        <div className="relative">
          <Star className={`${starSize} text-gray-300`} fill="currentColor" />
          <Star
            className={`${starSize} absolute left-0 top-0 fill-yellow-400 text-yellow-400`}
            fill="currentColor"
          />
        </div>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star
          key={`empty-${i}`}
          className={`${starSize} text-gray-300`}
          fill="none"
        />
      ))}
      {showValue && (
        <span className="ml-2 font-medium">{stars.toFixed(1)} stars</span>
      )}
    </div>
  );
};

export default function TrustExplainedPage() {
  const { user } = useCurrentUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Get trust score data - UPDATED to use trustStars
  const trustData = useQuery(
    api.controllers.trustScore.getTrustScore,
    user?.clerkId ? { clerkId: user.clerkId } : "skip",
  );

  // Get improvement suggestions
  const improvements = useQuery(
    api.controllers.trustScore.getTrustImprovements,
    user?.clerkId ? { clerkId: user.clerkId } : "skip",
  ) as Improvement[] | undefined;

  useEffect(() => {
    if (user && trustData !== undefined) {
      setIsLoading(false);
    }
  }, [user, trustData]);

  // Check if user should be redirected
  // Only redirect if onboarding is NOT complete
  useEffect(() => {
    if (user && !user.onboardingComplete) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trust score information...</p>
        </div>
      </div>
    );
  }

  const trustScore = trustData?.trustScore || 0;
  const trustStars = trustData?.trustStars || 0.5;
  const tier = trustData?.tier || "new";
  const currentTier = TIERS.find((t) => t.id === tier) || TIERS[0];

  // Find next tier
  const currentIndex = TIERS.findIndex((t) => t.id === tier);
  const nextTierData =
    currentIndex < TIERS.length - 1 ? TIERS[currentIndex + 1] : null;

  // Calculate progress based on trust stars
  const calculateStarProgress = () => {
    if (!nextTierData) return 100;

    const currentStarRange = currentTier.starRange.split("-").map(Number);
    const nextStarRange = nextTierData.starRange.split("-").map(Number);

    const currentMin = currentStarRange[0];
    const nextMin = nextStarRange[0];
    const range = nextMin - currentMin;
    const progressInRange = trustStars - currentMin;

    return Math.min(100, Math.max(0, (progressInRange / range) * 100));
  };

  const starProgress = calculateStarProgress();

  // Helper function to check if improvement matches action
  const matchesImprovement = (action: string, imp: Improvement): boolean => {
    const firstWord = action.toLowerCase().split(" ")[0];
    return imp.action.toLowerCase().includes(firstWord);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation */}
          <div className="mb-8">
            <Link
              href={user?.firstLogin ? "/dashboard" : "/profile"}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">
                {user?.firstLogin ? "Back to Onboarding" : "Back to Profile"}
              </span>
            </Link>
          </div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg mb-6">
              <div className="text-xl">{currentTier.emoji}</div>
              <div className="flex flex-col items-center">
                <StarDisplay stars={trustStars} size="lg" showValue={false} />
                <div className="text-xl font-bold text-blue-600">
                  {trustStars.toFixed(1)} stars
                </div>
              </div>
              <div
                className={`px-3 py-1 rounded-full ${currentTier.bgColor} ${currentTier.textColor} border ${currentTier.borderColor}`}
              >
                <span className="font-semibold">{currentTier.displayName}</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Your Trust Score Journey
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Build credibility, unlock opportunities, and grow your music
              career with your trust rating
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Current Status & Next Tier */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Current Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`bg-gradient-to-br ${currentTier.color} rounded-2xl p-8 text-white shadow-xl`}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold mb-2">Your Current Status</h2>
                <p className="text-blue-100/90">{currentTier.description}</p>
              </div>
              <div className="text-5xl">{currentTier.emoji}</div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="text-sm text-blue-200/80 mb-2">
                  Trust Rating
                </div>
                <div className="mb-4">
                  <StarDisplay stars={trustStars} size="lg" showValue={false} />
                  <div className="text-3xl font-bold mt-2">
                    {trustStars.toFixed(1)} stars
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-blue-200/80 mb-2">
                    Star Range
                  </div>
                  <div className="text-xl font-bold">
                    {currentTier.starRange}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-blue-200/80 mb-2">
                    Score Equivalent
                  </div>
                  <div className="text-xl font-bold">{trustScore}/100</div>
                </div>
              </div>

              {/* Progress Bar */}
              {nextTierData && (
                <div className="pt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>{currentTier.starRange} stars</span>
                    <span>{nextTierData.starRange} stars</span>
                  </div>
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${starProgress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Next Tier */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-8 border border-gray-200 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <TargetIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Next Goal</h3>
                <p className="text-sm text-gray-600">Reach next tier</p>
              </div>
            </div>

            {nextTierData ? (
              <>
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`w-16 h-16 rounded-xl bg-gradient-to-br ${nextTierData.color} flex items-center justify-center`}
                    >
                      <span className="text-3xl">{nextTierData.emoji}</span>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-900">
                        {nextTierData.displayName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {nextTierData.description}
                      </div>
                      <div className="mt-2">
                        <div className="text-sm text-gray-500">
                          Target: {nextTierData.starRange} stars
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {TIER_BENEFITS[nextTierData.id]
                      ?.slice(0, 3)
                      .map((benefit: string, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-700">
                            {benefit}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <div className="text-sm text-gray-600 mb-2">
                    Stars needed to reach {nextTierData.displayName}:
                  </div>
                  <div className="text-xl font-bold text-blue-600">
                    {(
                      parseFloat(nextTierData.starRange.split("-")[0]) -
                      trustStars
                    ).toFixed(1)}{" "}
                    stars
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div className="text-xl font-bold text-gray-900 mb-2">
                  🏆 Elite Achieved!
                </div>
                <p className="text-gray-600">
                  You've reached the highest tier with {trustStars.toFixed(1)}{" "}
                  stars!
                </p>
              </div>
            )}
          </motion.div>
          {/* Add this button in the trust-explained page */}
          <Link
            href="/dashboard/onboarding/trust-checklist"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-lg"
          >
            <CheckCircle className="w-5 h-5" />
            View My Trust Checklist
          </Link>
        </div>

        {/* All Tiers */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trust Score Tiers
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Progress through tiers by building your reputation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {TIERS.map((tierInfo, index) => (
              <motion.div
                key={tierInfo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`relative rounded-xl p-4 text-center cursor-pointer transition-all duration-300 border-2 ${
                  tier === tierInfo.id
                    ? `${tierInfo.bgColor} ${tierInfo.textColor} ${tierInfo.borderColor} shadow-lg`
                    : "bg-white border-gray-200 hover:shadow-md"
                }`}
                onClick={() => router.push(`/how-it-works#tier-${tierInfo.id}`)}
              >
                {tier === tierInfo.id && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    Current
                  </div>
                )}

                <div
                  className={`text-3xl mb-3 ${tier === tierInfo.id ? "scale-110" : ""} transition-transform duration-300`}
                >
                  {tierInfo.emoji}
                </div>
                <div
                  className={`font-bold mb-1 ${tier === tierInfo.id ? "text-lg" : ""} transition-all duration-300`}
                >
                  {tierInfo.displayName}
                </div>
                <div
                  className={`text-xs px-2 py-1 rounded-full inline-block mb-2 ${
                    tier === tierInfo.id
                      ? "bg-white/20"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tierInfo.starRange} stars
                </div>
                <div className="text-xs opacity-70">{tierInfo.description}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* How to Earn Stars */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How to Earn Trust Stars
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Specific actions that increase your trust rating
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {EARNING_METHODS.map((category, index) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    {index === 0 && (
                      <Shield className="w-5 h-5 text-blue-600" />
                    )}
                    {index === 1 && (
                      <BarChart className="w-5 h-5 text-green-600" />
                    )}
                    {index === 2 && (
                      <Activity className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {category.category}
                    </h3>
                    <p className="text-sm text-blue-600 font-medium">
                      Total potential:{" "}
                      {category.items
                        .reduce((sum, item) => {
                          const points =
                            typeof item.points === "string"
                              ? parseFloat(item.points.split(" ")[1]) || 0
                              : item.points;
                          return sum + points;
                        }, 0)
                        .toFixed(1)}{" "}
                      stars
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {category.items.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + i * 0.05 }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => {
                          if (
                            improvements?.some((imp: Improvement) =>
                              matchesImprovement(item.action, imp),
                            )
                          ) {
                            router.push("/profile");
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-blue-500">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-gray-700">{item.action}</span>
                        </div>
                        <span className="font-bold text-blue-600">
                          {item.points}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Your Improvement Suggestions */}
        {improvements && improvements.length > 0 && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Quick Wins to Boost Your Rating
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Actions you can take right now to improve your trust stars
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {improvements
                  .slice(0, 6)
                  .map((improvement: Improvement, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          {improvement.action}
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          +{improvement.points}
                        </span>
                      </div>
                      {improvement.description && (
                        <p className="text-xs text-gray-600">
                          {improvement.description}
                        </p>
                      )}
                    </motion.div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Benefits Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Benefits of Higher Trust Ratings
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Unlock premium features and opportunities as your stars increase
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Eye,
                title: "Better Visibility",
                description: "Higher search rankings and featured placement",
                color: "text-blue-500",
                bg: "bg-blue-50",
                requiredStars: "2.0+",
              },
              {
                icon: Briefcase,
                title: "Premium Gigs",
                description: "Access to exclusive, high-paying opportunities",
                color: "text-green-500",
                bg: "bg-green-50",
                requiredStars: "3.5+",
              },
              {
                icon: Users,
                title: "Band Creation",
                description: "Create and manage bands",
                color: "text-purple-500",
                bg: "bg-purple-50",
                requiredStars: "4.5+",
              },
              {
                icon: Zap,
                title: "Priority Support",
                description: "Faster responses and dedicated assistance",
                color: "text-amber-500",
                bg: "bg-amber-50",
                requiredStars: "3.0+",
              },
              {
                icon: TrendingUp,
                title: "Higher Earnings",
                description:
                  "Clients trust and pay more for trusted performers",
                color: "text-emerald-500",
                bg: "bg-emerald-50",
                requiredStars: "4.0+",
              },
              {
                icon: Award,
                title: "Recognition",
                description: "Verified badges and elite status recognition",
                color: "text-red-500",
                bg: "bg-red-50",
                requiredStars: "2.5+",
              },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${benefit.bg} p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-300`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg ${benefit.bg} flex items-center justify-center`}
                    >
                      <benefit.icon className={`w-5 h-5 ${benefit.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {benefit.title}
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-white/50 rounded-full">
                    {benefit.requiredStars} ⭐
                  </span>
                </div>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white shadow-xl"
        >
          <div className="max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-4">
              Ready to Boost Your Career?
            </h3>
            <p className="text-blue-100 mb-8">
              Start building your trust rating today to unlock premium
              opportunities
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
              >
                <Rocket className="w-5 h-5" />
                Go to Dashboard
              </Link>

              <Link
                href="/profile/edit"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
              >
                <User className="w-5 h-5" />
                Improve Profile
              </Link>
            </div>

            <p className="text-sm text-blue-200/80 mt-6">
              Your trust rating updates automatically as you use the platform
            </p>
          </div>
        </motion.div>

        {/* Trust Tips */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <div className="text-3xl mb-3">📈</div>
            <h4 className="font-bold text-lg mb-2">Build Gradually</h4>
            <p className="text-gray-600 text-sm">
              Trust ratings grow naturally as you complete gigs and receive
              reviews
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-3xl mb-3">🔄</div>
            <h4 className="font-bold text-lg mb-2">Updated Regularly</h4>
            <p className="text-gray-600 text-sm">
              Ratings are recalculated based on your latest activity and
              performance
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-3xl mb-3">🎯</div>
            <h4 className="font-bold text-lg mb-2">Focus on Quality</h4>
            <p className="text-gray-600 text-sm">
              Consistent, high-quality service is key to building lasting trust
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
