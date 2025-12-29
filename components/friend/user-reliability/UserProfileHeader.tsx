// components/user-reliability/UserProfileHeader.tsx
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  IoArrowBack,
  IoStar,
  IoShieldCheckmark,
  IoCheckmarkCircle,
} from "react-icons/io5";
import { useThemeColors } from "@/hooks/useTheme";

interface UserProfileHeaderProps {
  username: string;
  displayName: string;
  picture?: string;
  trustScore: number;
  trustTier: string;
  isProfileComplete: boolean;
  verifiedIdentity: boolean;
  phoneVerified: boolean;
  setShow: (show: boolean) => void;
}

const tierGradients = {
  elite: "from-yellow-400 via-amber-500 to-orange-500",
  trusted: "from-purple-400 via-pink-500 to-rose-500",
  verified: "from-green-400 via-emerald-500 to-teal-500",
  basic: "from-blue-400 via-cyan-500 to-sky-500",
  new: "from-gray-400 via-gray-500 to-gray-600",
};

const tierEmojis = {
  elite: "🏆",
  trusted: "🤝",
  verified: "✅",
  basic: "⭐",
  new: "🌱",
};

export const UserProfileHeader = ({
  username,
  displayName,
  picture,
  trustScore,
  trustTier,
  isProfileComplete,
  verifiedIdentity,
  phoneVerified,
  setShow,
}: UserProfileHeaderProps) => {
  const { colors, isDarkMode } = useThemeColors();

  return (
    <div className="mb-8">
      {/* Back Button and Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          onClick={() => setShow(false)}
          variant="outline"
          size="sm"
          className="rounded-full border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <IoArrowBack className="w-4 h-4" />
          <span className="ml-2">Back</span>
        </Button>

        <div className="flex items-center gap-3">
          {verifiedIdentity && (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
              <IoCheckmarkCircle className="text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Verified
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`rounded-2xl overflow-hidden border ${colors.border} ${isDarkMode ? "bg-gray-900/50" : "bg-white/50"} backdrop-blur-sm`}
      >
        {/* Header Gradient */}
        <div
          className={`h-32 bg-gradient-to-r ${tierGradients[trustTier as keyof typeof tierGradients]}`}
        />

        <div className="relative px-6 pb-6">
          {/* Profile Picture */}
          <div className="absolute -top-12 left-6">
            <div className="relative">
              {picture ? (
                <img
                  src={picture}
                  alt={displayName}
                  className="w-24 h-24 rounded-2xl border-4 border-white dark:border-gray-900 shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-gray-900 bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {/* Online Status */}
              <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
            </div>
          </div>

          <div className="pt-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {displayName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  @{username}
                  {phoneVerified && (
                    <span className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400">
                      <IoCheckmarkCircle /> Phone verified
                    </span>
                  )}
                </p>
              </div>

              {/* Trust Score Display */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-6"
              >
                <div className="text-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Trust Score
                  </div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {trustScore}
                    <span className="text-lg text-gray-500 dark:text-gray-400">
                      /100
                    </span>
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`px-6 py-3 rounded-xl bg-gradient-to-r ${tierGradients[trustTier as keyof typeof tierGradients]} text-white shadow-lg`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {tierEmojis[trustTier as keyof typeof tierEmojis]}
                    </span>
                    <div className="text-center">
                      <div className="text-sm opacity-90">Trust Tier</div>
                      <div className="text-xl font-bold">
                        {trustTier.charAt(0).toUpperCase() + trustTier.slice(1)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Profile Status Indicators */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div
                className={`p-3 rounded-lg border ${colors.border} ${isDarkMode ? "bg-gray-800/30" : "bg-gray-50/50"}`}
              >
                <div className="flex items-center gap-2">
                  <IoShieldCheckmark
                    className={
                      isProfileComplete ? "text-green-500" : "text-gray-400"
                    }
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Profile {isProfileComplete ? "Complete" : "Incomplete"}
                  </span>
                </div>
              </div>

              <div
                className={`p-3 rounded-lg border ${colors.border} ${isDarkMode ? "bg-gray-800/30" : "bg-gray-50/50"}`}
              >
                <div className="flex items-center gap-2">
                  <IoStar className="text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {trustTier.charAt(0).toUpperCase() + trustTier.slice(1)}{" "}
                    Tier
                  </span>
                </div>
              </div>

              <div
                className={`p-3 rounded-lg border ${colors.border} ${isDarkMode ? "bg-gray-800/30" : "bg-gray-50/50"}`}
              >
                <div className="flex items-center gap-2">
                  <IoCheckmarkCircle
                    className={
                      verifiedIdentity ? "text-green-500" : "text-gray-400"
                    }
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ID {verifiedIdentity ? "Verified" : "Unverified"}
                  </span>
                </div>
              </div>

              <div
                className={`p-3 rounded-lg border ${colors.border} ${isDarkMode ? "bg-gray-800/30" : "bg-gray-50/50"}`}
              >
                <div className="flex items-center gap-2">
                  <IoCheckmarkCircle
                    className={
                      phoneVerified ? "text-blue-500" : "text-gray-400"
                    }
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone {phoneVerified ? "Verified" : "Unverified"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
