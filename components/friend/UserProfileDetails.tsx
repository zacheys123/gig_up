// components/user-reliability/index.tsx - UPDATED MAIN COMPONENT
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UserProfileHeader } from "./user-reliability/UserProfileHeader";
import { RatingOverview } from "./user-reliability/RatingOverview";
import { PerformanceMetrics } from "./user-reliability/PerformanceMetrics";
import { BadgesSection } from "./user-reliability/BadgesSection";
import { PerformanceImpact } from "./user-reliability/PerformanceImapact";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FaAward, FaCrown, FaFire, FaRegClock, FaStar } from "react-icons/fa";
import { GiAchievement } from "react-icons/gi";
import { IoRibbon, IoShieldCheckmark, IoSparkles } from "react-icons/io5";

interface Badge {
  name: string;
  icon: React.ReactNode;
  description: string;
  condition: (
    user: any,
    trustScore: number,
    trustTier: string,
    metrics: any
  ) => boolean;
  upcomingCondition?: (
    user: any,
    trustScore: number,
    trustTier: string,
    metrics: any
  ) => boolean;
  tier?: "bronze" | "silver" | "gold" | "platinum";
}

interface UserProfileDetailsProps {
  friend: any;
  error: string | boolean;
  isLoading: boolean;
  setShow: (show: boolean) => void;
}

const UserProfileDetails = ({
  friend,
  error,
  isLoading,
  setShow,
}: UserProfileDetailsProps) => {
  const { colors, isDarkMode } = useThemeColors();

  // Get trust score data
  const trustData = useQuery(
    api.controllers.trustScore.getTrustScore,
    friend?._id ? { userId: friend._id } : "skip"
  );

  const trustScore = trustData?.score || 0;
  const trustTier = trustData?.tier || "new";
  const isProfileComplete = trustData?.isProfileComplete || false;
  const roleSpecificData = trustData?.roleSpecificData || {};

  // Get user role for context
  const userRole = trustData?.userRole || "unknown";

  // Define badges based on trust score and trust tier
  const ALL_BADGES: Badge[] = [
    {
      name: "Trust Newcomer",
      icon: <IoSparkles className="text-gray-400" />,
      description: "Joined the trust system",
      condition: (user, score, tier) => score > 0,
      tier: "bronze",
    },
    {
      name: "Basic Trust",
      icon: <IoShieldCheckmark className="text-blue-400" />,
      description: "Reached Basic trust tier",
      condition: (user, score, tier) => tier === "basic",
      upcomingCondition: (user, score, tier) => score >= 20 && score < 30,
      tier: "silver",
    },
    {
      name: "Verified Performer",
      icon: <IoShieldCheckmark className="text-green-400" />,
      description: "Reached Verified trust tier",
      condition: (user, score, tier) => tier === "verified",
      upcomingCondition: (user, score, tier) => score >= 40 && score < 50,
      tier: "gold",
    },
    {
      name: "Trusted Professional",
      icon: <IoShieldCheckmark className="text-purple-400" />,
      description: "Reached Trusted trust tier",
      condition: (user, score, tier) => tier === "trusted",
      upcomingCondition: (user, score, tier) => score >= 60 && score < 65,
      tier: "gold",
    },
    {
      name: "Elite Member",
      icon: <FaCrown className="text-yellow-400" />,
      description: "Reached Elite trust tier",
      condition: (user, score, tier) => tier === "elite",
      upcomingCondition: (user, score, tier) => score >= 75 && score < 80,
      tier: "platinum",
    },
    {
      name: "Band Leader",
      icon: <IoRibbon className="text-purple-500" />,
      description: "Eligible to create bands",
      condition: (user, score, tier, metrics) => score >= 70 && user.isMusician,
      upcomingCondition: (user, score, tier, metrics) =>
        score >= 60 && user.isMusician,
      tier: "platinum",
    },
    {
      name: "High Performer",
      icon: <FaStar className="text-amber-300" />,
      description: "Maintained 4.5+ average rating",
      condition: (user, score, tier, metrics) => metrics.avgRating >= 4.5,
      upcomingCondition: (user, score, tier, metrics) =>
        metrics.avgRating >= 4.3,
      tier: "gold",
    },
    {
      name: "Gig Veteran",
      icon: <GiAchievement className="text-blue-400" />,
      description: "Completed 10+ gigs",
      condition: (user, score, tier, metrics) => metrics.completedGigs >= 10,
      upcomingCondition: (user, score, tier, metrics) =>
        metrics.completedGigs >= 5,
      tier: "silver",
    },
    {
      name: "Gig Master",
      icon: <GiAchievement className="text-purple-400" />,
      description: "Completed 25+ gigs",
      condition: (user, score, tier, metrics) => metrics.completedGigs >= 25,
      upcomingCondition: (user, score, tier, metrics) =>
        metrics.completedGigs >= 15,
      tier: "platinum",
    },
    {
      name: "Quick Responder",
      icon: <FaRegClock className="text-green-400" />,
      description: "Fast response rate (<24h)",
      condition: (user, score, tier, metrics) => metrics.responseRate < 24,
      tier: "silver",
    },
    {
      name: "Gig Streak",
      icon: <FaFire className="text-orange-400" />,
      description: "Completed 5 gigs in a row",
      condition: (user, score, tier, metrics) => metrics.completedGigs >= 5,
      upcomingCondition: (user, score, tier, metrics) =>
        metrics.completedGigs >= 3,
      tier: "silver",
    },
    {
      name: "Verified Payment",
      icon: <IoShieldCheckmark className="text-green-500" />,
      description: "Payment method verified",
      condition: (user, score, tier, metrics) => user.mpesaPhoneNumber,
      tier: "bronze",
    },
    {
      name: "Profile Complete",
      icon: <FaAward className="text-blue-500" />,
      description: "Profile 100% complete",
      condition: (user, score, tier, metrics) => isProfileComplete,
      tier: "silver",
    },
    {
      name: "Premium Member",
      icon: <FaCrown className="text-yellow-500" />,
      description: "Premium or Elite subscription",
      condition: (user, score, tier, metrics) =>
        user.tier === "premium" || user.tier === "elite",
      tier: "gold",
    },
  ];

  // Extract metrics from user data
  const metrics = {
    avgRating: friend?.avgRating || 0,
    completedGigs: friend?.completedGigsCount || 0,
    responseRate: friend?.performanceStats?.responseTime || 99,
    isMusician: friend?.isMusician || false,
    gigsPosted: friend?.gigsPosted || 0,
    artistsManaged: friend?.artistsManaged?.length || 0,
    managedBands: friend?.managedBands?.length || 0,
    totalSpent: friend?.totalSpent || 0,
    earnings: friend?.earnings || 0,
  };

  // Role-based metrics display
  const roleMetrics = {
    musician: {
      primary: "Completed Gigs",
      secondary: "Average Rating",
      primaryValue: metrics.completedGigs,
      secondaryValue: metrics.avgRating.toFixed(1),
    },
    client: {
      primary: "Gigs Posted",
      secondary: "Completion Rate",
      primaryValue: metrics.gigsPosted,
      secondaryValue:
        friend?.completedGigsCount && metrics.gigsPosted
          ? `${Math.round((friend.completedGigsCount / metrics.gigsPosted) * 100)}%`
          : "0%",
    },
    booker: {
      primary: "Artists Managed",
      secondary: "Bands Managed",
      primaryValue: metrics.artistsManaged,
      secondaryValue: metrics.managedBands,
    },
  };

  const earnedBadges = ALL_BADGES.filter((badge) =>
    badge.condition(friend, trustScore, trustTier, metrics)
  );

  const upcomingBadges = ALL_BADGES.filter(
    (badge) =>
      !badge.condition(friend, trustScore, trustTier, metrics) &&
      badge.upcomingCondition?.(friend, trustScore, trustTier, metrics)
  );

  const getCardBackground = () => {
    return isDarkMode
      ? "bg-gray-800/80 border-gray-700"
      : "bg-white border-gray-200";
  };

  const getGradientBackground = () => {
    return isDarkMode
      ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
      : "bg-gradient-to-br from-gray-50 via-white to-gray-100";
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex justify-center items-center min-h-screen",
          colors.background
        )}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full shadow-lg"
        />
        <h6
          className={cn(
            "ml-4 text-xl font-semibold animate-pulse",
            colors.text
          )}
        >
          Loading user details...
        </h6>
      </div>
    );
  }

  if (error || !friend) {
    return (
      <div
        className={cn(
          "flex justify-center items-center min-h-screen",
          colors.background
        )}
      >
        <div
          className={cn(
            "p-10 rounded-2xl shadow-xl border text-center",
            getCardBackground()
          )}
        >
          <p className={cn("text-xl font-medium mb-4", colors.text)}>
            {error || "Couldn't load user details"}
          </p>
          <Button
            onClick={() => setShow(false)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 shadow-lg"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-y-auto h-screen w-full p-4 md:p-6",
        colors.background
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "max-w-6xl mx-auto rounded-2xl shadow-2xl p-4 md:p-8 mt-4 md:mt-10 border",
          getGradientBackground(),
          colors.border
        )}
      >
        <UserProfileHeader
          username={friend.username}
          displayName={
            `${friend.firstname || ""} ${friend.lastname || ""}`.trim() ||
            friend.username
          }
          picture={friend.picture}
          trustScore={trustScore}
          trustTier={trustTier}
          isProfileComplete={isProfileComplete}
          verifiedIdentity={friend.verifiedIdentity}
          phoneVerified={friend.phoneVerified}
          setShow={setShow}
        />

        <RatingOverview
          trustScore={trustScore}
          trustTier={trustTier}
          avgRating={metrics.avgRating}
          completedGigsCount={metrics.completedGigs}
          userRole={userRole}
          roleMetrics={
            roleMetrics[userRole as keyof typeof roleMetrics] ||
            roleMetrics.musician
          }
        />

        <PerformanceMetrics
          completedGigsCount={metrics.completedGigs}
          cancelgigCount={friend.cancelgigCount || 0}
          trustScore={trustScore}
          trustTier={trustTier}
          profileComplete={isProfileComplete}
          verifiedIdentity={friend.verifiedIdentity}
          phoneVerified={friend.phoneVerified}
          avgRating={metrics.avgRating}
          mpesaPhoneNumber={friend.mpesaPhoneNumber}
          userTier={friend.tier || "free"}
          responseTime={metrics.responseRate}
          gigsPosted={metrics.gigsPosted}
          completionRate={
            friend.completedGigsCount && metrics.gigsPosted
              ? Math.round(
                  (friend.completedGigsCount / metrics.gigsPosted) * 100
                )
              : 0
          }
        />

        <BadgesSection
          earnedBadges={earnedBadges}
          upcomingBadges={upcomingBadges}
          trustTier={trustTier}
          trustScore={trustScore}
        />

        <PerformanceImpact />

        <div
          className={cn(
            "mt-8 pt-6 border-t text-center text-sm",
            colors.border,
            colors.textMuted
          )}
        >
          {friend._creationTime && trustData?.lastUpdated && (
            <p>
              Trust score updated:{" "}
              {new Date(trustData.lastUpdated).toLocaleDateString()} • Member
              since: {new Date(friend._creationTime).toLocaleDateString()}
            </p>
          )}
          <p className="mt-1">
            Trust scores update daily based on activity and performance metrics
          </p>
          <p className="mt-2 text-xs opacity-75">
            Role: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfileDetails;
