"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useState, useMemo, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { IoCheckmarkDone } from "react-icons/io5";
import { Button } from "../ui/button";
import { MdAdd } from "react-icons/md";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { BsInstagram, BsTwitter, BsFacebook } from "react-icons/bs";
import { MdRateReview } from "react-icons/md";
import {
  ArrowLeftIcon,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  MenuIcon,
  Music,
  Video,
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

const FriendsComponent = () => {
  const { userId } = useAuth();
  const { username } = useParams();
  const { user: currentUser } = useCurrentUser();
  const router = useRouter();
  const { colors, isDarkMode } = useThemeColors();
  const [show, setShowMore] = useState(false);

  // Get user data from Convex
  const friend = useQuery(
    api.controllers.user.getUserByUsername,
    username ? { username: username as string } : "skip"
  );

  const { isInGracePeriod } = useCheckTrial();
  // Get profile videos for the friend with privacy filtering
  // UPDATED: Using the correct path now that videos are moved from controllers folder
  const profileVideos = useQuery(
    api.controllers.videos.getUserProfileVideos, // CHANGED: Removed .controllers
    friend?.clerkId
      ? {
          userId: friend.clerkId,
        }
      : friend?.clerkId
        ? {
            userId: friend.clerkId,
          }
        : "skip"
  );

  // Memoized expensive calculations
  const isFollowingFriend = useMemo(() => {
    if (!currentUser || !friend) return false;
    return friend.followers?.includes(currentUser.clerkId) || false;
  }, [currentUser, friend]);

  // Memoized theme styles
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

  // Memoized navigation handlers
  const navigationHandlers = useMemo(
    () => ({
      goBack: () => router.back(),
      goToMusicGigs: () =>
        router.push(
          currentUser?.isClient ? `/create/${userId}` : `/av_gigs/${userId}`
        ),
      goToVideos: () =>
        router.push(
          `/search/allvideos/${friend?._id}/*${friend?.firstname}/${friend?.lastname}`
        ),
      goToReviews: () =>
        router.push(
          `/search/reviews/${friend?._id}/*${friend?.firstname}${friend?.lastname}`
        ),
    }),
    [router, currentUser, userId, friend]
  );

  const isLoading = friend === undefined;
  const error = friend === null;

  // Memoized quick actions
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
    ],
    [currentUser, navigationHandlers]
  );

  // Memoized profile sections
  const profileSections = useMemo(() => {
    if (!friend) return [];

    const sections = [];

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

    // In your profileSections memo, update the videos section:
    if (profileVideos === undefined) {
      // Still loading
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
      // Has videos
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
                  themeStyles.secondaryBackground
                )}
                onClick={() => router.push(`/video/${video._id}`)}
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
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
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
                  {video.description && (
                    <p
                      className={cn(
                        "text-xs mt-1 line-clamp-2",
                        colors.textMuted
                      )}
                    >
                      {video.description}
                    </p>
                  )}
                  {video.tags && video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {video.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className={cn(
                            "text-xs px-1.5 py-0.5 rounded",
                            colors.secondaryBackground,
                            colors.textMuted
                          )}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {!video.isPublic && !isFollowingFriend && (
                    <p
                      className={cn(
                        "text-xs mt-1 text-amber-600 dark:text-amber-400"
                      )}
                    >
                      Follow to view private content
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ),
      });
    } else {
      // No videos or empty array
      const hasPrivateVideos = friend?.isPrivate && !isFollowingFriend;

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
            <Video className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            {hasPrivateVideos ? (
              <>
                <p className={cn("font-medium", colors.text)}>
                  Follow to view videos
                </p>
                <p className={cn("text-sm mt-1", colors.textMuted)}>
                  This user has private videos - follow them to see all content
                </p>
              </>
            ) : (
              <>
                <p className={cn("font-medium", colors.text)}>
                  No profile videos yet
                </p>
                <p className={cn("text-sm mt-1", colors.textMuted)}>
                  Check back later for new content
                </p>
              </>
            )}
          </div>
        ),
      });
    }

    // Professional Details (Updated to include teacher info)
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
            {friend.roleType === "instrumentalist" && (
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
                  {friend.instrument || "N/A"}
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

            {friend.roleType === "dj" && (
              <div
                className={cn(
                  "p-3 sm:p-4 rounded-lg",
                  themeStyles.secondaryBackground
                )}
              >
                <p
                  className={cn(
                    "font-medium text-sm sm:text-base",
                    colors.text
                  )}
                >
                  Deejay
                </p>
              </div>
            )}

            {friend.roleType === "vocalist" && (
              <div
                className={cn(
                  "p-3 sm:p-4 rounded-lg",
                  themeStyles.secondaryBackground
                )}
              >
                <p
                  className={cn(
                    "font-medium text-sm sm:text-base",
                    colors.text
                  )}
                >
                  Vocalist
                </p>
              </div>
            )}

            {friend.roleType === "mc" && (
              <div
                className={cn(
                  "p-3 sm:p-4 rounded-lg",
                  themeStyles.secondaryBackground
                )}
              >
                <p
                  className={cn(
                    "font-medium text-sm sm:text-base",
                    colors.text
                  )}
                >
                  EMcee
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

            {/* Teacher Instrument */}
            {friend.roleType === "teacher" && friend.instrument && (
              <div
                className={cn(
                  "p-3 sm:p-4 rounded-lg",
                  themeStyles.secondaryBackground
                )}
              >
                <p className={cn("text-xs sm:text-sm", colors.textMuted)}>
                  Instrument Taught
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
          </div>
        ),
      });
    }
    // Modern Rates Section (New Structure)
    if (friend.isMusician && friend.rate) {
      const hasNewRates =
        friend.rate.categories && friend.rate.categories.length > 0;
      const hasLegacyRates =
        friend.rate.regular ||
        friend.rate.function ||
        friend.rate.concert ||
        friend.rate.corporate;
      const hasBaseRate = friend.rate.baseRate;

      if (hasNewRates || hasLegacyRates || hasBaseRate) {
        sections.push({
          type: "rates",
          title: "Performance Rates",
          gradient: isDarkMode
            ? "bg-gradient-to-r from-amber-900/30 to-orange-900/30"
            : "bg-gradient-to-r from-amber-100 to-orange-100",
          titleColor: isDarkMode ? "text-amber-300" : "text-amber-700",
          content: (
            <div className="space-y-6">
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
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        isDarkMode ? "bg-amber-800" : "bg-amber-100"
                      )}
                    >
                      <DollarSign
                        className={cn(
                          "w-4 h-4",
                          isDarkMode ? "text-amber-300" : "text-amber-600"
                        )}
                      />
                    </div>
                    <div>
                      <p className={cn("font-semibold", colors.text)}>
                        Base Rate
                      </p>
                      <p className={cn("text-sm", colors.textMuted)}>
                        {friend.rate.rateType
                          ? `Per ${friend.rate.rateType.replace("per_", "")}`
                          : "Standard rate"}
                      </p>
                    </div>
                  </div>
                  <p
                    className={cn(
                      "text-2xl font-bold",
                      isDarkMode ? "text-amber-300" : "text-amber-600"
                    )}
                  >
                    {friend.rate.currency} {friend.rate.baseRate}
                  </p>
                  {friend.rate.negotiable && (
                    <p className={cn("text-sm mt-1", colors.textMuted)}>
                      Negotiable •{" "}
                      {friend.rate.depositRequired
                        ? "Deposit required"
                        : "No deposit required"}
                    </p>
                  )}
                </div>
              )}

              {/* Rate Categories */}
              {hasNewRates && (
                <div>
                  <h4 className={cn("font-semibold text-sm mb-4", colors.text)}>
                    Service Categories
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {friend?.rate?.categories?.map((category, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        className={cn(
                          "p-4 rounded-xl border transition-all duration-200",
                          category.rate
                            ? isDarkMode
                              ? "bg-green-900/20 border-green-800"
                              : "bg-green-50 border-green-200"
                            : isDarkMode
                              ? "bg-amber-900/20 border-amber-800"
                              : "bg-amber-50 border-amber-200"
                        )}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p
                              className={cn("font-medium text-sm", colors.text)}
                            >
                              {category.name}
                            </p>
                            {category.description && (
                              <p
                                className={cn("text-xs mt-1", colors.textMuted)}
                              >
                                {category.description}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs font-medium shrink-0 ml-2",
                              category.rate
                                ? isDarkMode
                                  ? "bg-green-900/50 text-green-300 border-green-700"
                                  : "bg-green-100 text-green-700 border-green-200"
                                : isDarkMode
                                  ? "bg-amber-900/50 text-amber-300 border-amber-700"
                                  : "bg-amber-100 text-amber-700 border-amber-200"
                            )}
                          >
                            {category.rateType ||
                              friend.rate?.rateType ||
                              "per_gig"}
                          </Badge>
                        </div>
                        <p
                          className={cn(
                            "text-lg font-semibold",
                            category.rate
                              ? isDarkMode
                                ? "text-green-300"
                                : "text-green-600"
                              : isDarkMode
                                ? "text-amber-300"
                                : "text-amber-600"
                          )}
                        >
                          {category.rate
                            ? `${friend.rate?.currency || "KES"} ${category.rate}`
                            : "Rate not set"}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Legacy Rates (Fallback) */}
              {!hasNewRates && hasLegacyRates && (
                <div>
                  <h4 className={cn("font-semibold text-sm mb-4", colors.text)}>
                    Event-Specific Rates
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {friend.rate.regular && (
                      <div
                        className={cn(
                          "p-3 rounded-lg text-center",
                          themeStyles.secondaryBackground
                        )}
                      >
                        <p className={cn("text-sm font-medium", colors.text)}>
                          Regular Events
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          KSh {friend.rate.regular}
                        </p>
                      </div>
                    )}
                    {friend.rate.function && (
                      <div
                        className={cn(
                          "p-3 rounded-lg text-center",
                          themeStyles.secondaryBackground
                        )}
                      >
                        <p className={cn("text-sm font-medium", colors.text)}>
                          Private Functions
                        </p>
                        <p className="text-lg font-bold text-blue-600">
                          KSh {friend.rate.function}
                        </p>
                      </div>
                    )}
                    {friend.rate.concert && (
                      <div
                        className={cn(
                          "p-3 rounded-lg text-center",
                          themeStyles.secondaryBackground
                        )}
                      >
                        <p className={cn("text-sm font-medium", colors.text)}>
                          Concerts
                        </p>
                        <p className="text-lg font-bold text-purple-600">
                          KSh {friend.rate.concert}
                        </p>
                      </div>
                    )}
                    {friend.rate.corporate && (
                      <div
                        className={cn(
                          "p-3 rounded-lg text-center",
                          themeStyles.secondaryBackground
                        )}
                      >
                        <p className={cn("text-sm font-medium", colors.text)}>
                          Corporate Events
                        </p>
                        <p className="text-lg font-bold text-indigo-600">
                          KSh {friend.rate.corporate}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rate Settings */}
              {(friend.rate.negotiable ||
                friend.rate.depositRequired ||
                friend.rate.travelIncluded) && (
                <div
                  className={cn(
                    "p-3 rounded-lg border",
                    isDarkMode
                      ? "bg-gray-700/50 border-gray-600"
                      : "bg-gray-100 border-gray-200"
                  )}
                >
                  <h4 className={cn("font-semibold text-sm mb-2", colors.text)}>
                    Rate Settings
                  </h4>
                  <div className="flex flex-wrap gap-4 text-sm">
                    {friend.rate.negotiable && (
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            isDarkMode ? "bg-green-400" : "bg-green-500"
                          )}
                        />
                        <span className={colors.text}>Negotiable Rates</span>
                      </div>
                    )}
                    {friend.rate.depositRequired && (
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            isDarkMode ? "bg-blue-400" : "bg-blue-500"
                          )}
                        />
                        <span className={colors.text}>Deposit Required</span>
                      </div>
                    )}
                    {friend.rate.travelIncluded && (
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            isDarkMode ? "bg-purple-400" : "bg-purple-500"
                          )}
                        />
                        <span className={colors.text}>Travel Included</span>
                      </div>
                    )}
                    {!friend.rate.travelIncluded && friend.rate.travelFee && (
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            isDarkMode ? "bg-amber-400" : "bg-amber-500"
                          )}
                        />
                        <span className={colors.text}>
                          Travel Fee: {friend.rate.currency}{" "}
                          {friend.rate.travelFee}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ),
        });
      }
    }

    // Availability & Booking
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
              <div className="text-right">
                <p className={cn("text-sm font-medium", colors.text)}>
                  Response Time
                </p>
                <p className={cn("text-sm", colors.textMuted)}>
                  {friend.performanceStats?.responseTime
                    ? `${friend.performanceStats.responseTime}h avg`
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Tier Status */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <p className={cn("text-sm font-medium", colors.text)}>
                  Membership Tier
                </p>
                <span
                  className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium capitalize",
                    friend.tier === "pro"
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                      : friend.tier === "premium"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                        : friend.tier === "elite"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  )}
                >
                  {friend.tier === "free" && isInGracePeriod
                    ? "Trial Month"
                    : friend.tier}
                </span>
              </div>
            </div>
          </div>
        ),
      });

      // Genres & Specialties (Updated to include teacher info)
      if (
        friend.genres ||
        friend.musiciangenres ||
        friend.roleType === "teacher"
      ) {
        sections.push({
          type: "genres",
          title:
            friend.roleType === "teacher"
              ? "Teaching Specialties"
              : "Genres & Specialties",
          gradient: isDarkMode
            ? "bg-gradient-to-r from-pink-900/30 to-rose-900/30"
            : "bg-gradient-to-r from-pink-100 to-rose-100",
          titleColor: isDarkMode ? "text-pink-300" : "text-pink-700",
          content: (
            <div className="space-y-4">
              {/* Teacher Specific Information */}
              {friend.roleType === "teacher" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {friend.teacherSpecialization && (
                    <div
                      className={cn(
                        "p-3 rounded-lg border",
                        isDarkMode
                          ? "bg-gray-700/50 border-gray-600"
                          : "bg-gray-100 border-gray-200"
                      )}
                    >
                      <p
                        className={cn(
                          "text-xs font-medium mb-1",
                          colors.textMuted
                        )}
                      >
                        Specialization
                      </p>
                      <p className={cn("font-medium", colors.text)}>
                        {friend.teacherSpecialization}
                      </p>
                    </div>
                  )}
                  {friend.teachingStyle && (
                    <div
                      className={cn(
                        "p-3 rounded-lg border",
                        isDarkMode
                          ? "bg-gray-700/50 border-gray-600"
                          : "bg-gray-100 border-gray-200"
                      )}
                    >
                      <p
                        className={cn(
                          "text-xs font-medium mb-1",
                          colors.textMuted
                        )}
                      >
                        Teaching Style
                      </p>
                      <p className={cn("font-medium", colors.text)}>
                        {friend.teachingStyle}
                      </p>
                    </div>
                  )}
                  {friend.lessonFormat && (
                    <div
                      className={cn(
                        "p-3 rounded-lg border",
                        isDarkMode
                          ? "bg-gray-700/50 border-gray-600"
                          : "bg-gray-100 border-gray-200"
                      )}
                    >
                      <p
                        className={cn(
                          "text-xs font-medium mb-1",
                          colors.textMuted
                        )}
                      >
                        Lesson Format
                      </p>
                      <p className={cn("font-medium", colors.text)}>
                        {friend.lessonFormat}
                      </p>
                    </div>
                  )}
                  {friend.studentAgeGroup && (
                    <div
                      className={cn(
                        "p-3 rounded-lg border",
                        isDarkMode
                          ? "bg-gray-700/50 border-gray-600"
                          : "bg-gray-100 border-gray-200"
                      )}
                    >
                      <p
                        className={cn(
                          "text-xs font-medium mb-1",
                          colors.textMuted
                        )}
                      >
                        Student Age Group
                      </p>
                      <p className={cn("font-medium", colors.text)}>
                        {friend.studentAgeGroup}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Music Genres */}
              {(friend.musiciangenres || friend.genres?.split(",") || [])
                .length > 0 && (
                <div>
                  <p className={cn("text-sm font-medium mb-2", colors.text)}>
                    {friend.roleType === "teacher"
                      ? "Music Styles Taught"
                      : "Music Genres"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      friend.musiciangenres ||
                      friend.genres?.split(",") ||
                      []
                    ).map((genre, index) => (
                      <span
                        key={index}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm font-medium border",
                          isDarkMode
                            ? "bg-gray-700/50 text-gray-300 border-gray-600"
                            : "bg-white text-gray-700 border-gray-300"
                        )}
                      >
                        {genre.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Teaching Experience */}
              {friend.roleType === "teacher" && friend.experience && (
                <div
                  className={cn(
                    "p-3 rounded-lg border",
                    isDarkMode
                      ? "bg-amber-900/20 border-amber-800"
                      : "bg-amber-50 border-amber-200"
                  )}
                >
                  <p className={cn("text-sm font-medium", colors.text)}>
                    Teaching Experience
                  </p>
                  <p
                    className={cn(
                      "text-lg font-bold mt-1",
                      isDarkMode ? "text-amber-300" : "text-amber-600"
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

      // Social Media Handles
      if (friend.musicianhandles && friend.musicianhandles.length > 0) {
        sections.push({
          type: "social",
          title: "Social Media & Portfolio",
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
                      return "bg-red-500 text-white";
                    case "instagram":
                      return "bg-pink-600 text-white";
                    case "tiktok":
                      return "bg-black text-white";
                    case "twitter":
                      return "bg-blue-500 text-white";
                    case "facebook":
                      return "bg-blue-600 text-white";
                    default:
                      return "bg-gray-500 text-white";
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
                      themeStyles.secondaryBackground,
                      "hover:shadow-md"
                    )}
                  >
                    <div
                      className={cn(
                        "p-2 rounded-lg",
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
    }

    // Recent Activity & Engagement
    sections.push({
      type: "activity",
      title: "Recent Activity",
      gradient: isDarkMode
        ? "bg-gradient-to-r from-gray-700/50 to-gray-800/50"
        : "bg-gradient-to-r from-gray-100 to-gray-200",
      titleColor: colors.text,
      content: (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className={cn("text-sm", colors.text)}>Last Active</p>
            <p className={cn("text-sm font-medium", colors.text)}>
              {friend.lastActive
                ? new Date(friend.lastActive).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className={cn("text-sm", colors.text)}>Profile Views</p>
            <p className={cn("text-sm font-medium", colors.text)}>
              {friend.profileViews?.totalCount || 0}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className={cn("text-sm", colors.text)}>Member Since</p>
            <p className={cn("text-sm font-medium", colors.text)}>
              {friend._creationTime
                ? new Date(friend._creationTime).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
        </div>
      ),
    });

    // Social Media (for non-musicians)
    if (friend.handles && friend.handles.length > 0) {
      sections.push({
        type: "social-general",
        title: "Social Media",
        content: (
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {friend.handles.split(",").map((handle, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="flex-shrink-0"
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shadow-lg",
                    isDarkMode ? "bg-gray-700" : "bg-gray-200"
                  )}
                >
                  <span className={cn("text-lg font-semibold", colors.text)}>
                    {handle.trim().charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className={cn("text-xs text-center mt-2", colors.text)}>
                  {handle.trim()}
                </p>
              </motion.div>
            ))}
          </div>
        ),
      });
    }

    // Engagement Statistics
    sections.push({
      type: "stats",
      title: "Engagement Statistics",
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
              <CountUp
                end={friend.followers?.length || 0}
                duration={2}
                delay={0.5}
              />
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
              <CountUp
                end={friend.followings?.length || 0}
                duration={2}
                delay={0.5}
              />
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
        <h6
          className={cn(
            "ml-4 text-xl font-semibold animate-pulse",
            colors.text
          )}
        >
          Loading user data...
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
            "p-6 sm:p-10 rounded-2xl shadow-xl border text-center",
            themeStyles.cardBackground
          )}
        >
          <p className={cn("text-lg sm:text-xl font-medium mb-4", colors.text)}>
            Oops! Couldn't load user data.
          </p>
          <Button
            onClick={navigationHandlers.goBack}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("overflow-y-auto h-screen w-full", colors.background)}>
      {/* Header Section */}
      <div
        className={cn(
          "relative h-[180px] sm:h-[210px] rounded-b-3xl shadow-lg",
          themeStyles.gradientBackground
        )}
      >
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
          {/* Name and Follow Button */}
          <div className="flex flex-col items-center mb-6">
            <h1
              className={cn(
                "text-xl sm:text-2xl capitalize font-extrabold tracking-tight",
                colors.text
              )}
            >
              {friend.firstname} {friend.lastname}
            </h1>
            {friend.experience && friend.instrument && (
              <p className={cn("text-xs sm:text-sm mb-4", colors.textMuted)}>
                <span className={cn("font-semibold", colors.text)}>
                  {friend.experience}
                </span>{" "}
                years of experience as a{" "}
                <span className="font-semibold text-purple-400">
                  {friend?.roleType === "teacher" && "Music Teacher"}
                  {friend?.roleType === "instrumentalist" && "Instrumentalist"}
                  {friend?.roleType === "dj" && "Deejay"}
                  {friend?.roleType === "mc" && "EMcee"}
                  {friend?.roleType === "vocalist" && "Vocalist"}
                </span>{" "}
                specializing in{" "}
                <span className={cn("font-semibold", colors.text)}>
                  {friend.instrument}
                </span>
              </p>
            )}
            <div className="flex gap-3 sm:gap-4 mt-2">
              <div onClick={(e) => e.stopPropagation()}>
                <FollowButton
                  _id={friend._id}
                  pendingFollowRequests={friend.pendingFollowRequests}
                  targetUserFollowings={friend.followings}
                  className={cn(
                    "flex items-center justify-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl",
                    "bg-neutral-300 hover:bg-red-500/10 border-red-400 border transition-all duration-200",
                    "text-neutral-500 hover:text-red-600 dark:text-neutral-500 dark:hover:text-neutral-500",
                    "backdrop-blur-sm"
                  )}
                />
              </div>
              <ReportButton userId={friend._id} />
              <Button
                variant="outline"
                className={cn(
                  "px-4 sm:px-6 py-1 sm:py-2 rounded-full text-xs sm:text-sm",
                  colors.border
                )}
                onClick={() => setShowMore(true)}
              >
                <span className={cn("flex items-center", colors.text)}>
                  <MenuIcon size={16} />
                </span>
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className={cn(
              "flex justify-center gap-4 sm:gap-6 mb-6 sm:mb-8 p-3 sm:p-4 rounded-xl shadow-sm border",
              themeStyles.secondaryBackground
            )}
          >
            {quickActions.map((action, index) => (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={action.onClick}
                className={cn(
                  "flex flex-col items-center transition-colors",
                  colors.text
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-sm border flex items-center justify-center",
                    isDarkMode
                      ? "bg-gray-700 border-gray-600"
                      : "bg-gray-200 border-gray-300"
                  )}
                >
                  <action.icon className={action.color} size={18} />
                </div>
                <span className="text-xs mt-1 sm:mt-2 font-medium">
                  {action.label}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Profile Sections */}
          <div className="space-y-4 sm:space-y-6">
            {profileSections.map((section, index) => (
              <div
                key={`${section.type}-${index}`}
                className={cn(
                  "rounded-xl shadow-sm overflow-hidden border",
                  themeStyles.cardBackground
                )}
              >
                {section.gradient ? (
                  <div
                    className={cn(
                      "px-4 sm:px-6 py-3 sm:py-4",
                      section.gradient
                    )}
                  >
                    <h2
                      className={cn(
                        "text-lg sm:text-xl font-bold flex items-center gap-2 sm:gap-3",
                        section.titleColor
                      )}
                    >
                      {section.type === "bio" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={cn(
                            "h-5 w-5 sm:h-6 sm:w-6",
                            section.titleColor
                          )}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {section.type === "pricing" && (
                        <DollarSign className="w-5 h-5" />
                      )}
                      {section.type === "availability" && (
                        <Calendar className="w-5 h-5" />
                      )}
                      {section.type === "genres" && (
                        <Music className="w-5 h-5" />
                      )}
                      {section.type === "social" && (
                        <FaYoutube className="w-5 h-5" />
                      )}
                      {section.type === "activity" && (
                        <Clock className="w-5 h-5" />
                      )}
                      {section.type === "videos" && (
                        <Video className="w-5 h-5" />
                      )}
                      {![
                        "bio",
                        "pricing",
                        "availability",
                        "genres",
                        "social",
                        "activity",
                        "videos",
                      ].includes(section.type) && null}
                      {section.title}
                    </h2>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "px-4 sm:px-6 py-3 sm:py-4 border-b",
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
              "mt-8 sm:mt-10 text-center text-xs sm:text-sm",
              colors.textMuted
            )}
          >
            <p>&copy; {new Date().getFullYear()} Gigup. All rights reserved.</p>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ x: "600px", opacity: 0 }}
          animate={{ x: ["0px", "-20px", "40px", "0px"], opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
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
