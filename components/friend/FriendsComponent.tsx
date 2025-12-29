"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useState, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { BsInstagram, BsTwitter, BsFacebook } from "react-icons/bs";
import { MdRateReview } from "react-icons/md";
import {
  ArrowLeftIcon,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  Info,
  Lock,
  MenuIcon,
  Music,
  Video,
  Target,
  Shield,
  TrendingUp,
  CheckCircle,
  Star,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { FaTiktok, FaYoutube } from "react-icons/fa";

import UserProfileDetails from "./UserProfileDetails";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import FollowButton from "../pages/FollowButton";
import ReportButton from "../report/ReportButton";
import { useCheckTrial } from "@/hooks/useCheckTrial";
import { Badge } from "../ui/badge";

// Tier configuration
const TRUST_TIERS = {
  new: {
    name: "Newcomer",
    emoji: "🌱",
    color: "bg-gray-100 text-gray-800 border-gray-300",
    gradient: "from-gray-400 to-gray-500",
  },
  basic: {
    name: "Basic",
    emoji: "⭐",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    gradient: "from-blue-400 to-blue-500",
  },
  verified: {
    name: "Verified",
    emoji: "✅",
    color: "bg-green-100 text-green-800 border-green-300",
    gradient: "from-green-400 to-green-500",
  },
  trusted: {
    name: "Trusted",
    emoji: "🤝",
    color: "bg-purple-100 text-purple-800 border-purple-300",
    gradient: "from-purple-400 to-purple-500",
  },
  elite: {
    name: "Elite",
    emoji: "🏆",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    gradient: "from-yellow-400 to-amber-500",
  },
} as const;

const FriendsComponent = () => {
  const { userId } = useAuth();
  const { username } = useParams();
  const { user: currentUser } = useCurrentUser();
  const router = useRouter();
  const { colors, isDarkMode } = useThemeColors();
  const [show, setShowMore] = useState(false);

  // Get user data
  const friend = useQuery(
    api.controllers.user.getUserByUsername,
    username ? { username: username as string } : "skip"
  );

  // Get trust score data
  const trustData = useQuery(
    api.controllers.trustScore.getTrustScore,
    friend?._id ? { userId: friend._id } : "skip"
  );

  // Get improvement suggestions
  const improvements = useQuery(
    api.controllers.trustScore.getTrustImprovements,
    friend?._id ? { userId: friend._id } : "skip"
  );

  // Get profile videos
  const profileVideos = useQuery(
    api.controllers.videos.getUserProfileVideos,
    friend?.clerkId && currentUser?.clerkId
      ? {
          userId: friend.clerkId,
          currentUserId: currentUser.clerkId,
        }
      : friend?.clerkId
        ? {
            userId: friend.clerkId,
          }
        : "skip"
  );

  const { isInGracePeriod } = useCheckTrial();

  // Memoized calculations
  const isFollowingFriend = useMemo(() => {
    if (!currentUser || !friend) return false;
    return friend.followers?.includes(currentUser._id) || false;
  }, [currentUser, friend]);

  const hasPrivateVideos =
    profileVideos?.some((video) => !video.isPublic) &&
    !isFollowingFriend &&
    friend?.isPrivate;
  const hasAnyVideos = profileVideos && profileVideos.length > 0;

  // Theme styles
  const themeStyles = useMemo(
    () => ({
      cardBackground: isDarkMode
        ? "bg-gray-800/80 border-gray-700"
        : "bg-white border-gray-200",
      secondaryBackground: isDarkMode
        ? "bg-gray-700/50 border-gray-600"
        : "bg-gray-100 border-gray-200",
      gradientBackground: isDarkMode
        ? "bg-gradient-to-br from-purple-900 to-indigo-800"
        : "bg-gradient-to-br from-purple-600 to-indigo-600",
    }),
    [isDarkMode]
  );

  // Navigation handlers
  const navigationHandlers = useMemo(
    () => ({
      goBack: () => router.back(),
      goToMusicGigs: () =>
        router.push(
          currentUser?.isClient ? `/create/${userId}` : `/av_gigs/${userId}`
        ),
      goToVideos: () => {
        if (friend?.clerkId) {
          router.push(
            `/search/allvideos/${friend.clerkId}/*${friend.firstname}${friend.lastname}`
          );
        }
      },
      goToReviews: () =>
        router.push(
          `/search/reviews/${friend?._id}/*${friend?.firstname}${friend?.lastname}`
        ),
      goToTrustScore: () => {
        if (currentUser?._id === friend?._id) {
          router.push("/onboarding/trust-explained");
        } else if (friend?._id) {
          router.push(`/user/trust-score/${friend._id}`);
        }
      },
    }),
    [router, currentUser, userId, friend]
  );

  const isLoading = friend === undefined;
  const error = friend === null;

  // Quick actions
  const quickActions = useMemo(
    () => [
      {
        icon: ArrowLeftIcon,
        label: "Back",
        onClick: navigationHandlers.goBack,
        color: "text-purple-400",
      },
      ...(currentUser?.isMusician || currentUser?.isClient
        ? [
            {
              icon: Music,
              label: "Music Gigs",
              onClick: navigationHandlers.goToMusicGigs,
              color: "text-purple-400",
            },
          ]
        : []),
      {
        icon: Video,
        label: "Videos",
        onClick: navigationHandlers.goToVideos,
        color: "text-teal-400",
      },
      ...(!currentUser?.isMusician && currentUser?.isClient
        ? [
            {
              icon: MdRateReview,
              label: "Reviews",
              onClick: navigationHandlers.goToReviews,
              color: "text-orange-400",
            },
          ]
        : []),
      ...(trustData
        ? [
            {
              icon: Shield,
              label: "Trust Score",
              onClick: navigationHandlers.goToTrustScore,
              color: "text-blue-400",
            },
          ]
        : []),
    ],
    [currentUser, navigationHandlers, trustData]
  );

  // Profile sections
  const profileSections = useMemo(() => {
    if (!friend) return [];

    const sections = [];

    // Trust Score Section (New)
    if (trustData) {
      const tier = trustData.tier || "new";
      const tierConfig = TRUST_TIERS[tier as keyof typeof TRUST_TIERS];

      sections.push({
        type: "trust",
        title: "Trust Score",
        gradient: isDarkMode
          ? `bg-gradient-to-r ${tierConfig.gradient.replace("from-", "from-").replace("to-", "to-")}/30`
          : `bg-gradient-to-r ${tierConfig.gradient.replace("from-", "from-").replace("to-", "to-")}`,
        titleColor: isDarkMode
          ? tier === "new"
            ? "text-gray-300"
            : tier === "basic"
              ? "text-blue-300"
              : tier === "verified"
                ? "text-green-300"
                : tier === "trusted"
                  ? "text-purple-300"
                  : "text-yellow-300"
          : tier === "new"
            ? "text-gray-700"
            : tier === "basic"
              ? "text-blue-700"
              : tier === "verified"
                ? "text-green-700"
                : tier === "trusted"
                  ? "text-purple-700"
                  : "text-yellow-700",
        content: (
          <div className="space-y-4">
            {/* Score Overview */}
            <div className="flex items-center justify-between">
              <div>
                <p className={cn("text-sm", colors.textMuted)}>
                  Overall Trust Score
                </p>
                <div className="flex items-baseline gap-2">
                  <p className={cn("text-3xl font-bold", colors.text)}>
                    {trustData.score}
                  </p>
                  <span className={cn("text-sm", colors.textMuted)}>/100</span>
                </div>
              </div>
              <div
                className={cn(
                  "px-4 py-2 rounded-full border",
                  tierConfig.color
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{tierConfig.emoji}</span>
                  <span className="font-semibold">{tierConfig.name}</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {trustData.nextTier && trustData.tierData && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={cn("font-medium", colors.text)}>
                    Progress to {trustData.nextTier.name}
                  </span>
                  <span className={cn("font-semibold", colors.text)}>
                    {Math.round(
                      ((trustData.score - trustData.tierData.minScore) /
                        (trustData.nextTier.minScore -
                          trustData.tierData.minScore)) *
                        100
                    )}
                    %
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${tierConfig.gradient}`}
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          ((trustData.score - trustData.tierData.minScore) /
                            (trustData.nextTier.minScore -
                              trustData.tierData.minScore)) *
                            100
                        )
                      )}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{trustData.tierData.minScore} points</span>
                  <span>{trustData.nextTier.minScore} points needed</span>
                </div>
              </div>
            )}

            {/* Band Eligibility */}
            {friend.isMusician && (
              <div
                className={cn(
                  "p-3 rounded-lg border",
                  trustData.bandEligible
                    ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                    : "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      trustData.bandEligible
                        ? "bg-green-100 dark:bg-green-800"
                        : "bg-amber-100 dark:bg-amber-800"
                    )}
                  >
                    {trustData.bandEligible ? (
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Target className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <div>
                    <h4 className={cn("font-semibold text-sm", colors.text)}>
                      {trustData.bandEligible
                        ? "Band Creation Eligible"
                        : "Band Creation Requirements"}
                    </h4>
                    <p className={cn("text-xs mt-1", colors.textMuted)}>
                      {trustData.bandEligible
                        ? "This musician can create and manage bands"
                        : `Requires 70+ trust score (currently ${trustData.score}/70)`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div
                className={cn(
                  "p-3 rounded-lg border",
                  themeStyles.secondaryBackground
                )}
              >
                <p className={cn("text-xs", colors.textMuted)}>
                  Profile Complete
                </p>
                <p className={cn("text-lg font-semibold mt-1", colors.text)}>
                  {trustData.isProfileComplete ? "Yes" : "No"}
                </p>
              </div>
              <div
                className={cn(
                  "p-3 rounded-lg border",
                  themeStyles.secondaryBackground
                )}
              >
                <p className={cn("text-xs", colors.textMuted)}>Last Updated</p>
                <p className={cn("text-sm font-medium mt-1", colors.text)}>
                  {trustData.lastUpdated
                    ? new Date(trustData.lastUpdated).toLocaleDateString()
                    : "Never"}
                </p>
              </div>
            </div>

            {/* Improvement Suggestions */}
            {improvements && improvements.length > 0 && (
              <div>
                <h4 className={cn("font-semibold text-sm mb-3", colors.text)}>
                  Ways to Improve Score
                </h4>
                <div className="space-y-2">
                  {improvements.slice(0, 3).map((improvement, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-3 h-3 text-blue-500" />
                        <span className={cn("text-sm", colors.text)}>
                          {improvement.action}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-blue-600">
                        +{improvement.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ),
      });
    }

    // Contact Info
    sections.push({
      type: "contact",
      title: "Contact Information",
      content: (
        <div className="space-y-3 sm:space-y-4">
          <div>
            <p className={cn("text-xs sm:text-sm", colors.textMuted)}>Email</p>
            <p className={cn("font-medium text-sm sm:text-base", colors.text)}>
              {friend?.email || "Not provided"}
            </p>
          </div>
          {friend?.city && (
            <div>
              <p className={cn("text-xs sm:text-sm", colors.textMuted)}>
                Location
              </p>
              <p
                className={cn("font-medium text-sm sm:text-base", colors.text)}
              >
                {friend.city}
              </p>
            </div>
          )}
        </div>
      ),
    });

    // Professional Bio
    if (friend.talentbio) {
      sections.push({
        type: "bio",
        title: "About Me",
        gradient: isDarkMode
          ? "bg-gradient-to-r from-purple-900/30 to-indigo-900/30"
          : "bg-gradient-to-r from-purple-100 to-indigo-100",
        titleColor: isDarkMode ? "text-purple-300" : "text-purple-700",
        content: (
          <>
            <div className="p-4 sm:p-6">
              <p className={cn("text-xs sm:text-sm", colors.textMuted)}>Bio</p>
              <p
                className={cn(
                  "leading-relaxed text-sm sm:text-base whitespace-pre-line",
                  colors.text
                )}
              >
                {friend.talentbio}
              </p>
            </div>
            <div className="px-4 sm:px-6 py-2">
              <p className={cn("text-xs sm:text-sm", colors.textMuted)}>
                Username
              </p>
              <p
                className={cn(
                  "leading-relaxed text-sm sm:text-base whitespace-pre-line",
                  colors.text
                )}
              >
                {friend.username}
              </p>
            </div>
          </>
        ),
      });
    }

    // Videos Section
    if (profileVideos === undefined) {
      sections.push({
        type: "videos",
        title: "Profile Videos",
        gradient: isDarkMode
          ? "bg-gradient-to-r from-green-900/30 to-emerald-900/30"
          : "bg-gradient-to-r from-green-100 to-emerald-100",
        titleColor: isDarkMode ? "text-green-300" : "text-green-700",
        content: (
          <div
            className={cn(
              "text-center py-8 rounded-lg",
              themeStyles.secondaryBackground
            )}
          >
            <div className="animate-pulse">
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        ),
      });
    } else if (profileVideos && profileVideos.length > 0) {
      sections.push({
        type: "videos",
        title: "Profile Videos",
        gradient: isDarkMode
          ? "bg-gradient-to-r from-green-900/30 to-emerald-900/30"
          : "bg-gradient-to-r from-green-100 to-emerald-100",
        titleColor: isDarkMode ? "text-green-300" : "text-green-700",
        content: (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profileVideos.map((video) => (
              <motion.div
                key={video._id}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "rounded-lg overflow-hidden border cursor-pointer",
                  themeStyles.secondaryBackground,
                  !video.isPublic && !isFollowingFriend && "opacity-60"
                )}
                onClick={() => {
                  if (video.isPublic || isFollowingFriend) {
                    router.push(`/video/${video._id}`);
                  }
                }}
              >
                <div className="aspect-video bg-gray-300 dark:bg-gray-600 relative">
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  {!video.isPublic && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Private
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p
                    className={cn("font-medium text-sm truncate", colors.text)}
                  >
                    {video.title}
                  </p>
                  <p className={cn("text-xs mt-1", colors.textMuted)}>
                    {video.views || 0} views • {video.likes || 0} likes
                  </p>
                  {!video.isPublic && !isFollowingFriend && (
                    <div
                      className={cn(
                        "text-xs mt-2 p-2 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200"
                      )}
                    >
                      🔒 Follow each other to view private content
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ),
      });
    }

    // Professional Details
    if (
      friend.roleType === "instrumentalist" ||
      friend.roleType === "dj" ||
      friend.roleType === "mc" ||
      friend.roleType === "vocalist" ||
      friend.roleType === "teacher"
    ) {
      sections.push({
        type: "professional",
        title:
          friend.roleType === "teacher"
            ? "Teaching Profile"
            : "Professional Details",
        content: (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* Role-specific fields */}
            {friend.roleType === "instrumentalist" && friend.instrument && (
              <div
                className={cn(
                  "p-3 sm:p-4 rounded-lg",
                  themeStyles.secondaryBackground
                )}
              >
                <p className={cn("text-xs sm:text-sm", colors.textMuted)}>
                  Instrument
                </p>
                <p
                  className={cn(
                    "font-medium text-sm sm:text-base",
                    colors.text
                  )}
                >
                  {friend.instrument}
                </p>
              </div>
            )}

            {friend.roleType === "teacher" && (
              <div
                className={cn(
                  "p-3 sm:p-4 rounded-lg",
                  themeStyles.secondaryBackground
                )}
              >
                <p className={cn("text-xs sm:text-sm", colors.textMuted)}>
                  Role
                </p>
                <p
                  className={cn(
                    "font-medium text-sm sm:text-base",
                    colors.text
                  )}
                >
                  Music Teacher
                </p>
              </div>
            )}

            {friend.experience && (
              <div
                className={cn(
                  "p-3 sm:p-4 rounded-lg",
                  themeStyles.secondaryBackground
                )}
              >
                <p className={cn("text-xs sm:text-sm", colors.textMuted)}>
                  {friend.roleType === "teacher"
                    ? "Teaching Experience"
                    : "Experience"}
                </p>
                <p
                  className={cn(
                    "font-medium text-sm sm:text-base",
                    colors.text
                  )}
                >
                  {friend.experience} years
                </p>
              </div>
            )}
          </div>
        ),
      });
    }

    // Rates Section
    if (friend.isMusician && friend.rate) {
      const hasBaseRate = friend.rate.baseRate;
      const hasCategories =
        friend.rate.categories?.length && friend.rate.categories?.length > 0;

      if (hasBaseRate || hasCategories) {
        sections.push({
          type: "rates",
          title: "Performance Rates",
          gradient: isDarkMode
            ? "bg-gradient-to-r from-amber-900/30 to-orange-900/30"
            : "bg-gradient-to-r from-amber-100 to-orange-100",
          titleColor: isDarkMode ? "text-amber-300" : "text-amber-700",
          content: (
            <div className="space-y-4">
              {/* Base Rate */}
              {hasBaseRate && (
                <div
                  className={cn(
                    "p-4 rounded-xl border-2",
                    isDarkMode
                      ? "bg-amber-900/20 border-amber-800"
                      : "bg-amber-50 border-amber-200"
                  )}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className={cn("font-semibold", colors.text)}>
                        Individual Rate
                      </p>
                      <p className={cn("text-sm", colors.textMuted)}>
                        {friend.rate.rateType
                          ? `Per ${friend.rate.rateType.replace("per_", "")}`
                          : "Standard rate"}
                      </p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {friend.rate.currency} {friend.rate.baseRate}
                  </p>
                </div>
              )}

              {/* Rate Categories */}
              {hasCategories && (
                <div>
                  <h4 className={cn("font-semibold text-sm mb-3", colors.text)}>
                    Service Categories
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {friend.rate.categories &&
                      friend.rate.categories.map((category, index) => (
                        <div
                          key={index}
                          className={cn(
                            "p-3 rounded-lg border",
                            themeStyles.secondaryBackground
                          )}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <p
                              className={cn("font-medium text-sm", colors.text)}
                            >
                              {category.name}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {category.rateType || "per_gig"}
                            </Badge>
                          </div>
                          <p className="text-lg font-semibold text-green-600">
                            {friend?.rate?.currency && friend?.rate?.currency}{" "}
                            {category.rate}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ),
        });
      }
    }

    // Availability
    if (friend.isMusician) {
      sections.push({
        type: "availability",
        title: "Availability",
        gradient: isDarkMode
          ? "bg-gradient-to-r from-blue-900/30 to-cyan-900/30"
          : "bg-gradient-to-r from-blue-100 to-cyan-100",
        titleColor: isDarkMode ? "text-blue-300" : "text-blue-700",
        content: (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn("text-sm font-medium", colors.text)}>
                  Booking Status
                </p>
                <p className={cn("text-sm", colors.textMuted)}>
                  {friend.lastBookingDate
                    ? "Recently Booked"
                    : "Available for Gigs"}
                </p>
              </div>
            </div>
          </div>
        ),
      });
    }

    // Social Media
    if (friend.musicianhandles?.length && friend.musicianhandles?.length > 0) {
      sections.push({
        type: "social",
        title: "Social Media",
        gradient: isDarkMode
          ? "bg-gradient-to-r from-indigo-900/30 to-violet-900/30"
          : "bg-gradient-to-r from-indigo-100 to-violet-100",
        titleColor: isDarkMode ? "text-indigo-300" : "text-indigo-700",
        content: (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {friend.musicianhandles.map((handle, index) => {
              const getPlatformIcon = (platform: string) => {
                switch (platform) {
                  case "youtube":
                    return <FaYoutube className="w-4 h-4" />;
                  case "instagram":
                    return <BsInstagram className="w-4 h-4" />;
                  case "tiktok":
                    return <FaTiktok className="w-4 h-4" />;
                  case "twitter":
                    return <BsTwitter className="w-4 h-4" />;
                  case "facebook":
                    return <BsFacebook className="w-4 h-4" />;
                  default:
                    return null;
                }
              };

              const getPlatformStyle = (platform: string) => {
                switch (platform) {
                  case "youtube":
                    return "bg-red-500";
                  case "instagram":
                    return "bg-pink-600";
                  case "tiktok":
                    return "bg-black";
                  case "twitter":
                    return "bg-blue-500";
                  case "facebook":
                    return "bg-blue-600";
                  default:
                    return "bg-gray-500";
                }
              };

              return (
                <a
                  key={index}
                  href={`https://${handle.platform}.com/${handle.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:scale-105",
                    themeStyles.secondaryBackground
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-lg text-white",
                      getPlatformStyle(handle.platform)
                    )}
                  >
                    {getPlatformIcon(handle.platform)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium truncate",
                        colors.text
                      )}
                    >
                      @{handle.handle}
                    </p>
                    <p className={cn("text-xs capitalize", colors.textMuted)}>
                      {handle.platform}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        ),
      });
    }

    // Engagement Statistics
    sections.push({
      type: "stats",
      title: "Engagement",
      content: (
        <div className="flex flex-col sm:flex-row justify-around gap-3 sm:gap-4">
          <div
            className={cn(
              "text-center p-3 sm:p-4 rounded-lg shadow-sm",
              isDarkMode ? "bg-indigo-900/30" : "bg-indigo-100"
            )}
          >
            <p
              className={cn(
                "text-2xl sm:text-3xl font-extrabold",
                isDarkMode ? "text-indigo-400" : "text-indigo-600"
              )}
            >
              <CountUp end={friend.followers?.length || 0} duration={2} />
            </p>
            <p className={cn("text-xs sm:text-sm mt-1", colors.textMuted)}>
              Followers
            </p>
          </div>
          <div
            className={cn(
              "text-center p-3 sm:p-4 rounded-lg shadow-sm",
              isDarkMode ? "bg-purple-900/30" : "bg-purple-100"
            )}
          >
            <p
              className={cn(
                "text-2xl sm:text-3xl font-extrabold",
                isDarkMode ? "text-purple-400" : "text-purple-600"
              )}
            >
              <CountUp end={friend.followings?.length || 0} duration={2} />
            </p>
            <p className={cn("text-xs sm:text-sm mt-1", colors.textMuted)}>
              Following
            </p>
          </div>
        </div>
      ),
    });

    return sections;
  }, [
    friend,
    trustData,
    improvements,
    profileVideos,
    isFollowingFriend,
    themeStyles,
    colors,
    isDarkMode,
    router,
  ]);

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
            "p-6 sm:p-10 rounded-2xl shadow-xl border text-center",
            themeStyles.cardBackground
          )}
        >
          <p className={cn("text-lg sm:text-xl font-medium mb-4", colors.text)}>
            Couldn't load user data
          </p>
          <Button
            onClick={() => router.back()}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Get tier info for the header
  const tier = trustData?.tier || "new";
  const tierConfig = TRUST_TIERS[tier as keyof typeof TRUST_TIERS];

  return (
    <div className={cn("overflow-y-auto h-screen w-full", colors.background)}>
      {/* Header with Trust Badge */}
      <div
        className={cn(
          "relative h-[200px] rounded-b-3xl shadow-lg",
          themeStyles.gradientBackground
        )}
      >
        {/* Trust Score Badge */}
        {trustData && (
          <div className="absolute top-4 right-4 z-10">
            <div
              className={cn(
                "px-4 py-2 rounded-full border backdrop-blur-sm shadow-lg",
                tierConfig.color
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{tierConfig.emoji}</span>
                <div className="text-center">
                  <div className="font-bold text-lg">{trustData.score}</div>
                  <div className="text-xs opacity-80">{tierConfig.name}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
          <div
            className={cn(
              "w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 shadow-xl flex items-center justify-center overflow-hidden",
              isDarkMode
                ? "border-gray-800 bg-gray-800"
                : "border-white bg-white"
            )}
          >
            {friend.picture ? (
              <img
                src={friend.picture}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-3xl capitalize font-bold">
                {friend.firstname?.charAt(0)}
                {friend.lastname?.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      {!show ? (
        <div className="mt-20 px-4 sm:px-6 pb-10 max-w-3xl mx-auto">
          {/* Header Info */}
          <div className="flex flex-col items-center mb-6">
            <h1
              className={cn(
                "text-xl sm:text-2xl capitalize font-extrabold tracking-tight",
                colors.text
              )}
            >
              {friend.firstname} {friend.lastname}
            </h1>

            {/* Trust Score Quick Info */}
            {trustData && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span className={cn("text-sm font-medium", colors.text)}>
                    Trust Score:
                  </span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {trustData.score}/100
                </span>
                <span
                  className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    tierConfig.color
                  )}
                >
                  {tierConfig.emoji} {tierConfig.name}
                </span>
              </div>
            )}

            {/* Role Info */}
            {friend.experience && friend.instrument && (
              <p
                className={cn(
                  "text-xs sm:text-sm mt-2 text-center",
                  colors.textMuted
                )}
              >
                {friend.experience} years as {friend.instrument}{" "}
                {friend.roleType === "teacher" ? "Teacher" : ""}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 sm:gap-4 mt-4">
              <div onClick={(e) => e.stopPropagation()}>
                <FollowButton
                  _id={friend._id}
                  pendingFollowRequests={friend.pendingFollowRequests}
                  targetUserFollowings={friend.followings}
                  className={cn(
                    "flex items-center justify-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl",
                    "bg-neutral-300 hover:bg-red-500/10 border-red-400 border",
                    "text-neutral-500 hover:text-red-600"
                  )}
                />
              </div>
              <ReportButton userId={friend.clerkId} />
              <Button
                variant="outline"
                className={cn("px-4 sm:px-6 py-2 rounded-full", colors.border)}
                onClick={() => setShowMore(true)}
              >
                <MenuIcon size={16} />
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className={cn(
              "flex justify-center gap-4 sm:gap-6 mb-8 p-4 rounded-xl border",
              themeStyles.secondaryBackground
            )}
          >
            {quickActions.map((action, index) => (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={action.onClick}
                className="flex flex-col items-center"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full shadow-sm border flex items-center justify-center",
                    isDarkMode
                      ? "bg-gray-700 border-gray-600"
                      : "bg-gray-200 border-gray-300"
                  )}
                >
                  <action.icon className={action.color} size={18} />
                </div>
                <span className="text-xs mt-2 font-medium">{action.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Profile Sections */}
          <div className="space-y-6">
            {profileSections.map((section, index) => (
              <div
                key={`${section.type}-${index}`}
                className={cn(
                  "rounded-xl shadow-sm overflow-hidden border",
                  themeStyles.cardBackground
                )}
              >
                {section.gradient ? (
                  <div className={cn("px-4 sm:px-6 py-4", section.gradient)}>
                    <h2
                      className={cn(
                        "text-lg sm:text-xl font-bold flex items-center gap-2",
                        section.titleColor
                      )}
                    >
                      {section.type === "trust" && (
                        <Shield className="w-5 h-5" />
                      )}
                      {section.type === "bio" && <Users className="w-5 h-5" />}
                      {section.type === "videos" && (
                        <Video className="w-5 h-5" />
                      )}
                      {section.type === "rates" && (
                        <DollarSign className="w-5 h-5" />
                      )}
                      {section.type === "availability" && (
                        <Calendar className="w-5 h-5" />
                      )}
                      {section.type === "social" && (
                        <BsInstagram className="w-5 h-5" />
                      )}
                      {section.title}
                    </h2>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "px-4 sm:px-6 py-4 border-b",
                      isDarkMode ? "border-gray-700" : "border-gray-200"
                    )}
                  >
                    <h2
                      className={cn(
                        "text-lg sm:text-xl font-bold",
                        colors.text
                      )}
                    >
                      {section.title}
                    </h2>
                  </div>
                )}
                <div className="p-4 sm:p-6">{section.content}</div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            className={cn(
              "mt-8 text-center text-xs sm:text-sm",
              colors.textMuted
            )}
          >
            <p>&copy; {new Date().getFullYear()} Gigup. All rights reserved.</p>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          transition={{ type: "spring", damping: 20 }}
        >
          <UserProfileDetails
            friend={friend}
            error={error}
            isLoading={isLoading}
            setShow={setShowMore}
          />
        </motion.div>
      )}
    </div>
  );
};

export default React.memo(FriendsComponent);
