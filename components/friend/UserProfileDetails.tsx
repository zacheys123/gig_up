"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { useAllGigs } from "@/hooks/useAllGigs";
import { UserProfileHeader } from "./user-reliability/UserProfileHeader";
import { RatingOverview } from "./user-reliability/RatingOverview";
import { PerformanceMetrics } from "./user-reliability/PerformanceMetrics";
import { BadgesSection } from "./user-reliability/BadgesSection";
import { PerformanceImpact } from "./user-reliability/PerformanceImapact";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import {
  FaAward,
  FaCrown,
  FaFire,
  FaFrownOpen,
  FaHeart,
  FaRegClock,
  FaStar,
  FaThumbsDown,
} from "react-icons/fa";
import { GiAchievement } from "react-icons/gi";
import { IoRibbon, IoShieldCheckmark, IoSparkles } from "react-icons/io5";

interface Badge {
  name: string;
  icon: React.ReactNode;
  description: string;
  condition: (user: any) => boolean;
  upcomingCondition?: (user: any) => boolean;
  tier?: "bronze" | "silver" | "gold" | "platinum";
}

interface UserProfileDetailsProps {
  friend: any;
  error: string | boolean;
  isLoading: boolean;
  setShow: (show: boolean) => void;
}

// Utility functions
interface CombinedRatingOptions {
  directReviewsWeight: number;
  gigBasedWeight: number;
}

const combineRatings = (
  directRating: number,
  gigBasedRating: number,
  options: CombinedRatingOptions
): number => {
  const { directReviewsWeight, gigBasedWeight } = options;
  if (directRating === 0 && gigBasedRating === 0) return 0;
  if (gigBasedRating === 0) return directRating;
  if (directRating === 0) return gigBasedRating;
  const totalWeight = directReviewsWeight + gigBasedWeight;
  return (
    (directRating * directReviewsWeight + gigBasedRating * gigBasedWeight) /
    totalWeight
  );
};

type RatingSource = any | number;

interface RatingBreakdown {
  "5": number;
  "4": number;
  "3": number;
  "2": number;
  "1": number;
  [key: string]: number;
}

const getRatingBreakdown = (ratings: RatingSource[]): RatingBreakdown => {
  const breakdown: RatingBreakdown = { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 };
  ratings.forEach((item) => {
    let ratingValue: number;
    if (typeof item === "number") {
      ratingValue = item;
    } else {
      ratingValue = item.rating;
    }
    const roundedRating = Math.round(ratingValue);
    if (roundedRating >= 1 && roundedRating <= 5) {
      breakdown[roundedRating.toString()]++;
    }
  });
  return breakdown;
};

interface CalculateRatingResult {
  directRating: number;
  gigBasedRating: number;
  combinedRating: number;
  totalReviews: number;
  ratingBreakdown: RatingBreakdown;
}

const calculateAverageRating = (
  user: any,
  allGigs: any[] = []
): CalculateRatingResult => {
  const directReviews = user.allreviews ? user?.allreviews : [];
  const directRating =
    directReviews.length > 0
      ? directReviews.reduce(
          (sum: number, review: any) => sum + review.rating,
          0
        ) / directReviews.length
      : 0;

  const userGigs = allGigs.filter(
    (gig) =>
      gig.bookedBy === user._id &&
      gig.musicianConfirmPayment?.confirmPayment &&
      gig.clientConfirmPayment?.confirmPayment
  );

  const gigRatings = userGigs.flatMap((gig) =>
    typeof gig.gigRating === "number" ? [gig.gigRating] : []
  );

  const gigBasedRating =
    gigRatings.length > 0
      ? gigRatings.reduce((sum: number, rating: number) => sum + rating, 0) /
        gigRatings.length
      : 0;

  const combinedRating = combineRatings(directRating, gigBasedRating, {
    directReviewsWeight: 0.7,
    gigBasedWeight: 0.3,
  });

  const allIndividualRatings: RatingSource[] = [
    ...directReviews,
    ...gigRatings,
  ];

  return {
    directRating,
    gigBasedRating,
    combinedRating,
    totalReviews: directReviews.length + gigRatings.length,
    ratingBreakdown: getRatingBreakdown(allIndividualRatings),
  };
};

const UserProfileDetails = ({
  friend,
  error,
  isLoading,
  setShow,
}: UserProfileDetailsProps) => {
  const { colors, isDarkMode } = useThemeColors();
  const { gigs: allGigs } = useAllGigs();

  const {
    directRating,
    gigBasedRating,
    combinedRating,
    totalReviews,
    ratingBreakdown,
  } = calculateAverageRating(friend || {}, allGigs || []);

  const totalGigs =
    (friend.completedGigsCount || 0) + (friend.cancelgigCount || 0);
  const reliabilityScore =
    totalGigs > 0 ? ((friend.completedGigsCount || 0) / totalGigs) * 100 : 100;

  const averageRating = combinedRating;

  const ALL_BADGES: Badge[] = [
    {
      name: "Newcomer",
      icon: <IoSparkles className="text-gray-400" />,
      description: "Completed first gig",
      condition: (user) => (user.completedGigsCount || 0) >= 1,
      upcomingCondition: (user) => (user.completedGigsCount || 0) === 0,
      tier: "bronze",
    },
    {
      name: "Reliable Gigster",
      icon: <IoShieldCheckmark className="text-blue-400" />,
      description: "Completed 5+ gigs with 90%+ reliability",
      condition: (user) =>
        (user.completedGigsCount || 0) >= 5 && reliabilityScore >= 90,
      upcomingCondition: (user) =>
        (user.completedGigsCount || 0) >= 3 && reliabilityScore >= 85,
      tier: "silver",
    },
    {
      name: "Top Performer",
      icon: <FaAward className="text-yellow-400" />,
      description: "Completed 10+ gigs with 95%+ reliability",
      condition: (user) =>
        (user.completedGigsCount || 0) >= 10 && reliabilityScore >= 95,
      upcomingCondition: (user) =>
        (user.completedGigsCount || 0) >= 7 && reliabilityScore >= 90,
      tier: "gold",
    },
    {
      name: "Gig Champion",
      icon: <FaCrown className="text-purple-400" />,
      description: "Completed 25+ gigs with 98%+ reliability",
      condition: (user) =>
        (user.completedGigsCount || 0) >= 25 && reliabilityScore >= 98,
      upcomingCondition: (user) =>
        (user.completedGigsCount || 0) >= 18 && reliabilityScore >= 95,
      tier: "platinum",
    },
    {
      name: "Highly Rated",
      icon: <FaStar className="text-amber-300" />,
      description: "Maintained 4.5+ average rating across 5+ gigs",
      condition: (user) =>
        averageRating >= 4.5 && (user.completedGigsCount || 0) >= 5,
      upcomingCondition: (user) =>
        averageRating >= 4.3 && (user.completedGigsCount || 0) >= 3,
      tier: "gold",
    },
    {
      name: "Client Favorite",
      icon: <FaHeart className="text-pink-400" />,
      description: "Received 10+ positive reviews (4.8+ rating)",
      condition: (user) =>
        averageRating >= 4.8 && (user.allreviews?.length || 0) >= 10,
      upcomingCondition: (user) =>
        averageRating >= 4.6 && (user.allreviews?.length || 0) >= 7,
      tier: "gold",
    },
    {
      name: "Early Bird",
      icon: <FaRegClock className="text-green-400" />,
      description: "Consistently arrives early to gigs (tracked via check-ins)",
      condition: (user) => (user.completedGigsCount || 0) >= 90,
      upcomingCondition: (user) => (user.completedGigsCount || 0) >= 80,
      tier: "silver",
    },
    {
      name: "Cancellation Risk",
      icon: <FaThumbsDown className="text-red-400" />,
      description: "Cancelled 3+ gigs",
      condition: (user) => (user.cancelgigCount || 0) >= 3,
      upcomingCondition: (user) => (user.cancelgigCount || 0) >= 2,
      tier: "bronze",
    },
    {
      name: "Frequent Canceller",
      icon: <FaFrownOpen className="text-red-500" />,
      description: "Cancelled 5+ gigs",
      condition: (user) => (user.cancelgigCount || 0) >= 5,
      upcomingCondition: (user) => (user.cancelgigCount || 0) >= 4,
      tier: "bronze",
    },
    {
      name: "Gig Streak",
      icon: <FaFire className="text-orange-400" />,
      description: "Completed 5 gigs in a row without cancellations",
      condition: (user) => (user.completedGigsCount || 0) >= 5,
      upcomingCondition: (user) => (user.completedGigsCount || 0) >= 3,
      tier: "silver",
    },
    {
      name: "Seasoned Performer",
      icon: <GiAchievement className="text-blue-400" />,
      description: "Completed 50+ gigs with 90%+ reliability",
      condition: (user) =>
        (user.completedGigsCount || 0) >= 50 && reliabilityScore >= 90,
      upcomingCondition: (user) =>
        (user.completedGigsCount || 0) >= 35 && reliabilityScore >= 85,
      tier: "platinum",
    },
    {
      name: "Perfect Attendance",
      icon: <IoRibbon className="text-green-400" />,
      description: "100% reliability with 10+ gigs",
      condition: (user) =>
        reliabilityScore === 100 && (user.completedGigsCount || 0) >= 10,
      upcomingCondition: (user) =>
        reliabilityScore === 100 && (user.completedGigsCount || 0) >= 7,
      tier: "platinum",
    },
  ];

  const earnedBadges = ALL_BADGES.filter((badge) => badge.condition(friend));
  const upcomingBadges = ALL_BADGES.filter(
    (badge) => !badge.condition(friend) && badge.upcomingCondition?.(friend)
  );

  // Theme-aware styling functions
  const getCardBackground = () => {
    return isDarkMode
      ? "bg-gray-800/80 border-gray-700"
      : "bg-white border-gray-200";
  };

  const getGradientBackground = () => {
    return isDarkMode
      ? "bg-gradient-to-br from-gray-800 to-gray-900"
      : "bg-gradient-to-br from-gray-50 to-white";
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
      className={cn("overflow-y-auto h-screen w-full p-6", colors.background)}
    >
      <div
        className={cn(
          "max-w-3xl mx-auto rounded-xl shadow-2xl p-8 mt-10 border",
          getGradientBackground(),
          colors.border
        )}
      >
        <UserProfileHeader username={friend.username} setShow={setShow} />

        <RatingOverview
          directRating={directRating}
          gigBasedRating={gigBasedRating}
          combinedRating={combinedRating}
          totalReviews={totalReviews}
          ratingBreakdown={ratingBreakdown}
          completedGigsCount={friend.completedGigsCount || 0}
        />

        <PerformanceMetrics
          completedGigsCount={friend.completedGigsCount || 0}
          cancelgigCount={friend.cancelgigCount || 0}
          reliabilityScore={reliabilityScore}
        />

        <BadgesSection
          earnedBadges={earnedBadges}
          upcomingBadges={upcomingBadges}
        />

        <PerformanceImpact />

        <div
          className={cn(
            "mt-8 pt-6 border-t text-center text-sm",
            colors.border,
            colors.textMuted
          )}
        >
          {friend.createdAt && friend.updatedAt && (
            <p>
              Last updated: {new Date(friend.updatedAt).toLocaleDateString()} •
              Member since: {new Date(friend.createdAt).toLocaleDateString()}
            </p>
          )}
          <p className="mt-1">
            &copy; {new Date().getFullYear()} Gigup. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfileDetails;
