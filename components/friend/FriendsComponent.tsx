"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useAuth, UserButton } from "@clerk/nextjs";
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

  const isLoading = friend === undefined;
  const error = friend === null;

  // Theme-aware styling functions
  const getCardBackground = () => {
    return isDarkMode
      ? "bg-gray-800/80 border-gray-700"
      : "bg-white border-gray-200";
  };

  const getSecondaryBackground = () => {
    return isDarkMode
      ? "bg-gray-700/50 border-gray-600"
      : "bg-gray-100 border-gray-200";
  };

  const getGradientBackground = () => {
    return isDarkMode
      ? "bg-gradient-to-br from-purple-900 to-indigo-800"
      : "bg-gradient-to-br from-purple-600 to-indigo-600";
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
            getCardBackground()
          )}
        >
          <p className={cn("text-lg sm:text-xl font-medium mb-4", colors.text)}>
            {`Oops! Couldn't load user data.`}
          </p>
          <Button
            onClick={() => router.back()}
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
          getGradientBackground()
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
            {friend?.picture ? (
              <img
                src={friend.picture}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-3xl capitalize font-bold">
                {friend?.firstname?.charAt(0)}
                {friend?.lastname?.charAt(0)}
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
              {friend?.firstname} {friend?.lastname}
            </h1>
            {friend?.experience && friend?.instrument && (
              <p className={cn("text-xs sm:text-sm mb-4", colors.textMuted)}>
                <span className={cn("font-semibold", colors.text)}>
                  {friend.experience}
                </span>{" "}
                years of experience as a{" "}
                <span className="font-semibold text-purple-400">
                  {friend.instrument && `${friend.instrument} player`}
                </span>
              </p>
            )}
            <div className="flex gap-3 sm:gap-4 mt-2">
              <div onClick={(e) => e.stopPropagation()}>
                <FollowButton
                  _id={friend._id}
                  pendingFollowRequests={friend?.pendingFollowRequests}
                  targetUserFollowings={friend?.followings}
                  className={cn(
                    "flex items-center justify-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl bg-neutral-300 hover:bg-red-500/10 border-red-400",
                    "border transition-all duration-200",

                    "text-neutral-500 hover:text-red-600 dark:text-neutral-500 dark:hover:text-neutral-500",

                    "backdrop-blur-sm"
                  )}
                />
              </div>
              <ReportButton userId={friend?._id || ""} />
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
              getSecondaryBackground()
            )}
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
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
                <ArrowLeftIcon className="text-purple-400" size={18} />
              </div>
              <span className="text-xs mt-1 sm:mt-2 font-medium">Back</span>
            </motion.button>

            {(currentUser?.isMusician || currentUser?.isClient) && (
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  router.push(
                    currentUser?.isClient
                      ? `/create/${userId}`
                      : `/av_gigs/${userId}`
                  )
                }
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
                  <Music className="text-purple-400" size={18} />
                </div>
                <span className="text-xs mt-1 sm:mt-2 font-medium">
                  Music Gigs
                </span>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                router.push(
                  `/search/allvideos/${friend?._id}/*${friend?.firstname}/${friend?.lastname}`
                )
              }
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
                <Video className="text-teal-400" size={18} />
              </div>
              <span className="text-xs mt-1 sm:mt-2 font-medium">Videos</span>
            </motion.button>

            {!currentUser?.isMusician && currentUser?.isClient && (
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  router.push(
                    `/search/reviews/${friend?._id}/*${friend?.firstname}${friend?.lastname}`
                  )
                }
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
                  <MdRateReview className="text-orange-400" size={18} />
                </div>
                <span className="text-xs mt-1 sm:mt-2 font-medium">
                  Reviews
                </span>
              </motion.button>
            )}
          </div>

          {/* Profile Sections */}
          <div className="space-y-4 sm:space-y-6">
            {/* Contact Info */}
            <div
              className={cn(
                "rounded-xl shadow-sm p-4 sm:p-6 border",
                getCardBackground()
              )}
            >
              <h2
                className={cn(
                  "text-lg sm:text-xl font-bold mb-3 sm:mb-4 border-b pb-2 sm:pb-3",
                  colors.text,
                  colors.border
                )}
              >
                Contact Information
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <p className={cn("text-xs sm:text-sm", colors.textMuted)}>
                    Email
                  </p>
                  <p
                    className={cn(
                      "font-medium text-sm sm:text-base",
                      colors.text
                    )}
                  >
                    {friend?.email || "Not provided"}
                  </p>
                </div>
                {friend?.city && (
                  <div>
                    <p className={cn("text-xs sm:text-sm", colors.textMuted)}>
                      Location
                    </p>
                    <p
                      className={cn(
                        "font-medium text-sm sm:text-base",
                        colors.text
                      )}
                    >
                      {friend?.city || "Not provided"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Professional Bio */}
            {friend?.talentbio && (
              <div
                className={cn(
                  "rounded-xl shadow-sm overflow-hidden border",
                  getCardBackground()
                )}
              >
                <div
                  className={cn(
                    "px-4 sm:px-6 py-3 sm:py-4",
                    isDarkMode
                      ? "bg-gradient-to-r from-purple-900/30 to-indigo-900/30"
                      : "bg-gradient-to-r from-purple-100 to-indigo-100"
                  )}
                >
                  <h2
                    className={cn(
                      "text-lg sm:text-xl font-bold flex items-center gap-2 sm:gap-3",
                      isDarkMode ? "text-purple-300" : "text-purple-700"
                    )}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={cn(
                        "h-5 w-5 sm:h-6 sm:w-6",
                        isDarkMode ? "text-purple-400" : "text-purple-600"
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
                    About Me
                  </h2>
                </div>
                <div className="p-4 sm:p-6">
                  <p className={cn("text-xs sm:text-sm", colors.textMuted)}>
                    Bio
                  </p>
                  <p
                    className={cn(
                      "leading-relaxed text-sm sm:text-base whitespace-pre-line",
                      colors.text
                    )}
                  >
                    {friend?.talentbio}
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
                    {friend?.username}
                  </p>
                </div>
              </div>
            )}

            {/* Role-Specific Info */}
            {(friend?.roleType === "instrumentalist" ||
              friend?.roleType === "dj" ||
              friend?.roleType === "mc" ||
              friend?.roleType === "vocalist") && (
              <div
                className={cn(
                  "rounded-xl shadow-sm p-4 sm:p-6 border",
                  getCardBackground()
                )}
              >
                <h2
                  className={cn(
                    "text-lg sm:text-xl font-bold mb-3 sm:mb-4 border-b pb-2 sm:pb-3",
                    colors.text,
                    colors.border
                  )}
                >
                  Professional Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {friend?.roleType === "instrumentalist" && (
                    <div
                      className={cn(
                        "p-3 sm:p-4 rounded-lg",
                        getSecondaryBackground()
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
                        {friend?.instrument || "N/A"}
                      </p>
                    </div>
                  )}
                  {friend?.roleType === "dj" && (
                    <div
                      className={cn(
                        "p-3 sm:p-4 rounded-lg",
                        getSecondaryBackground()
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
                  {friend?.roleType === "vocalist" && (
                    <div
                      className={cn(
                        "p-3 sm:p-4 rounded-lg",
                        getSecondaryBackground()
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
                  {friend?.roleType === "mc" && (
                    <div
                      className={cn(
                        "p-3 sm:p-4 rounded-lg",
                        getSecondaryBackground()
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
                  {/* ... rest of role-specific content with theme classes ... */}
                </div>
              </div>
            )}
            {/* Add these sections after the "About Me" section */}

            {/* Pricing & Rates */}
            {(friend?.rate?.regular ||
              friend?.rate?.function ||
              friend?.rate?.concert ||
              friend?.rate?.corporate) && (
              <div
                className={cn(
                  "rounded-xl shadow-sm overflow-hidden border",
                  getCardBackground()
                )}
              >
                <div
                  className={cn(
                    "px-4 sm:px-6 py-3 sm:py-4",
                    isDarkMode
                      ? "bg-gradient-to-r from-amber-900/30 to-orange-900/30"
                      : "bg-gradient-to-r from-amber-100 to-orange-100"
                  )}
                >
                  <h2
                    className={cn(
                      "text-lg sm:text-xl font-bold flex items-center gap-2 sm:gap-3",
                      isDarkMode ? "text-amber-300" : "text-amber-700"
                    )}
                  >
                    <DollarSign className="w-5 h-5" />
                    Pricing & Rates
                  </h2>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {friend?.rate?.regular && (
                      <div
                        className={cn(
                          "p-3 rounded-lg",
                          getSecondaryBackground()
                        )}
                      >
                        <p className={cn("text-sm font-medium", colors.text)}>
                          Regular Gig
                        </p>
                        <p className={cn("text-lg font-bold text-green-600")}>
                          KSh {friend.rate.regular}
                        </p>
                      </div>
                    )}
                    {friend?.rate?.function && (
                      <div
                        className={cn(
                          "p-3 rounded-lg",
                          getSecondaryBackground()
                        )}
                      >
                        <p className={cn("text-sm font-medium", colors.text)}>
                          Private Function
                        </p>
                        <p className={cn("text-lg font-bold text-blue-600")}>
                          KSh {friend.rate.function}
                        </p>
                      </div>
                    )}
                    {friend?.rate?.concert && (
                      <div
                        className={cn(
                          "p-3 rounded-lg",
                          getSecondaryBackground()
                        )}
                      >
                        <p className={cn("text-sm font-medium", colors.text)}>
                          Concert
                        </p>
                        <p className={cn("text-lg font-bold text-purple-600")}>
                          KSh {friend.rate.concert}
                        </p>
                      </div>
                    )}
                    {friend?.rate?.corporate && (
                      <div
                        className={cn(
                          "p-3 rounded-lg",
                          getSecondaryBackground()
                        )}
                      >
                        <p className={cn("text-sm font-medium", colors.text)}>
                          Corporate Event
                        </p>
                        <p className={cn("text-lg font-bold text-indigo-600")}>
                          KSh {friend.rate.corporate}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Availability & Booking */}
            {friend?.isMusician && (
              <>
                <div
                  className={cn(
                    "rounded-xl shadow-sm overflow-hidden border",
                    getCardBackground()
                  )}
                >
                  <div
                    className={cn(
                      "px-4 sm:px-6 py-3 sm:py-4",
                      isDarkMode
                        ? "bg-gradient-to-r from-blue-900/30 to-cyan-900/30"
                        : "bg-gradient-to-r from-blue-100 to-cyan-100"
                    )}
                  >
                    <h2
                      className={cn(
                        "text-lg sm:text-xl font-bold flex items-center gap-2 sm:gap-3",
                        isDarkMode ? "text-blue-300" : "text-blue-700"
                      )}
                    >
                      <Calendar className="w-5 h-5" />
                      Availability
                    </h2>
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={cn("text-sm font-medium", colors.text)}>
                          Booking Status
                        </p>
                        <p className={cn("text-sm", colors.textMuted)}>
                          {friend?.lastBookingDate
                            ? "Recently Booked"
                            : "Available for Gigs"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={cn("text-sm font-medium", colors.text)}>
                          Response Time
                        </p>
                        <p className={cn("text-sm", colors.textMuted)}>
                          {friend?.performanceStats?.responseTime
                            ? `${friend.performanceStats.responseTime}h avg`
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Tier Status */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <p className={cn("text-sm font-medium", colors.text)}>
                          Membership Tier
                        </p>
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium capitalize",
                            friend?.tier === "pro"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                              : friend?.tier === "premium"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                : friend?.tier === "elite"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          )}
                        >
                          {friend?.tier || "Free"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {(friend?.genres || friend?.musiciangenres) && (
                  <div
                    className={cn(
                      "rounded-xl shadow-sm overflow-hidden border",
                      getCardBackground()
                    )}
                  >
                    <div
                      className={cn(
                        "px-4 sm:px-6 py-3 sm:py-4",
                        isDarkMode
                          ? "bg-gradient-to-r from-pink-900/30 to-rose-900/30"
                          : "bg-gradient-to-r from-pink-100 to-rose-100"
                      )}
                    >
                      <h2
                        className={cn(
                          "text-lg sm:text-xl font-bold flex items-center gap-2 sm:gap-3",
                          isDarkMode ? "text-pink-300" : "text-pink-700"
                        )}
                      >
                        <Music className="w-5 h-5" />
                        Genres & Specialties
                      </h2>
                    </div>
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-wrap gap-2">
                        {(
                          friend?.musiciangenres ||
                          friend?.genres?.split(",") ||
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
                  </div>
                )}

                {/* Social Media Handles with Platform Icons */}
                {friend?.musicianhandles &&
                  friend.musicianhandles.length > 0 && (
                    <div
                      className={cn(
                        "rounded-xl shadow-sm overflow-hidden border",
                        getCardBackground()
                      )}
                    >
                      <div
                        className={cn(
                          "px-4 sm:px-6 py-3 sm:py-4",
                          isDarkMode
                            ? "bg-gradient-to-r from-indigo-900/30 to-violet-900/30"
                            : "bg-gradient-to-r from-indigo-100 to-violet-100"
                        )}
                      >
                        <h2
                          className={cn(
                            "text-lg sm:text-xl font-bold flex items-center gap-2 sm:gap-3",
                            isDarkMode ? "text-indigo-300" : "text-indigo-700"
                          )}
                        >
                          <FaYoutube className="w-5 h-5" />
                          Social Media & Portfolio
                        </h2>
                      </div>
                      <div className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {friend.musicianhandles.map((handle, index) => (
                            <a
                              key={index}
                              href={`https://${handle.platform}.com/${handle.handle}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:scale-105",
                                getSecondaryBackground(),
                                "hover:shadow-md"
                              )}
                            >
                              <div
                                className={cn(
                                  "p-2 rounded-lg",
                                  handle.platform === "youtube"
                                    ? "bg-red-500 text-white"
                                    : handle.platform === "instagram"
                                      ? "bg-pink-600 text-white"
                                      : handle.platform === "tiktok"
                                        ? "bg-black text-white"
                                        : handle.platform === "twitter"
                                          ? "bg-blue-500 text-white"
                                          : "bg-gray-500 text-white"
                                )}
                              >
                                {handle.platform === "youtube" && (
                                  <FaYoutube className="w-4 h-4" />
                                )}
                                {handle.platform === "instagram" && (
                                  <BsInstagram className="w-4 h-4" />
                                )}
                                {handle.platform === "tiktok" && (
                                  <FaTiktok className="w-4 h-4" />
                                )}
                                {handle.platform === "twitter" && (
                                  <BsTwitter className="w-4 h-4" />
                                )}
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
                                <p
                                  className={cn(
                                    "text-xs capitalize",
                                    colors.textMuted
                                  )}
                                >
                                  {handle.platform}
                                </p>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
              </>
            )}
            {/* Recent Activity & Engagement */}
            <div
              className={cn(
                "rounded-xl shadow-sm overflow-hidden border",
                getCardBackground()
              )}
            >
              <div
                className={cn(
                  "px-4 sm:px-6 py-3 sm:py-4",
                  isDarkMode
                    ? "bg-gradient-to-r from-gray-700/50 to-gray-800/50"
                    : "bg-gradient-to-r from-gray-100 to-gray-200"
                )}
              >
                <h2
                  className={cn(
                    "text-lg sm:text-xl font-bold flex items-center gap-2 sm:gap-3",
                    colors.text
                  )}
                >
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className={cn("text-sm", colors.text)}>Last Active</p>
                    <p className={cn("text-sm font-medium", colors.text)}>
                      {friend?.lastActive
                        ? new Date(friend.lastActive).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={cn("text-sm", colors.text)}>Profile Views</p>
                    <p className={cn("text-sm font-medium", colors.text)}>
                      {friend?.profileViews?.totalCount || 0}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={cn("text-sm", colors.text)}>Member Since</p>
                    <p className={cn("text-sm font-medium", colors.text)}>
                      {friend?._creationTime
                        ? new Date(friend._creationTime).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Social Media */}
            {friend?.handles && friend.handles.length > 0 && (
              <div
                className={cn(
                  "rounded-xl shadow-sm p-4 sm:p-6 border",
                  getCardBackground()
                )}
              >
                <h2
                  className={cn(
                    "text-lg sm:text-xl font-bold mb-3 sm:mb-4 border-b pb-2 sm:pb-3",
                    colors.text,
                    colors.border
                  )}
                >
                  Social Media
                </h2>
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                  {friend?.handles.split(",").map((handle, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex-shrink-0"
                    >
                      {/* Social media buttons with theme-aware styling */}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div
              className={cn(
                "rounded-xl shadow-sm p-4 sm:p-6 border",
                getCardBackground()
              )}
            >
              <h2
                className={cn(
                  "text-lg sm:text-xl font-bold mb-3 sm:mb-4 border-b pb-2 sm:pb-3",
                  colors.text,
                  colors.border
                )}
              >
                Engagement Statistics
              </h2>
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
                      end={friend?.followers?.length || 0}
                      duration={2}
                      delay={0.5}
                    />
                  </p>
                  <p
                    className={cn("text-xs sm:text-sm mt-1", colors.textMuted)}
                  >
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
                      end={friend?.followings?.length || 0}
                      duration={2}
                      delay={0.5}
                    />
                  </p>
                  <p
                    className={cn("text-xs sm:text-sm mt-1", colors.textMuted)}
                  >
                    Following
                  </p>
                </div>
              </div>
            </div>
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

export default FriendsComponent;
