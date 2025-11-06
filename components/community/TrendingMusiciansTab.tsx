"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  TrendingMusician,
  useTrendingMusicians,
} from "@/hooks/useCommunityUsers";
import { useThemeColors } from "@/hooks/useTheme";
import { ComprehensiveRating } from "../ui/ComprehensiveRating";
import { MapPin, Users, Calendar, Star, Music2, Disc3 } from "lucide-react";
import { OnlineBadge } from "../chat/OnlineBadge";
import { ChatIcon } from "../chat/ChatIcon";

interface TrendingMusiciansTabProps {
  user?: any;
}

export const TrendingMusiciansTab: React.FC<TrendingMusiciansTabProps> = ({
  user,
}) => {
  const musicians = useTrendingMusicians();
  const { colors, isDarkMode, mounted } = useThemeColors();

  // Show loading state until theme is mounted
  if (!mounted) {
    return (
      <div
        className={cn(
          "w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 pb-20"
        )}
      >
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className={cn(
              "rounded-3xl p-4 animate-pulse",
              colors.card,
              colors.border
            )}
          >
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div
                  className={cn("w-16 h-16 rounded-2xl", colors.disabledBg)}
                />
                <div className="flex-1 space-y-2">
                  <div className={cn("h-4 rounded", colors.disabledBg)} />
                  <div className={cn("h-3 rounded w-3/4", colors.disabledBg)} />
                </div>
              </div>
              <div className="space-y-2">
                <div className={cn("h-6 rounded", colors.disabledBg)} />
                <div className={cn("h-4 rounded", colors.disabledBg)} />
              </div>
              <div
                className={cn(
                  "grid grid-cols-3 gap-3 p-3 rounded-2xl",
                  colors.backgroundMuted
                )}
              >
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="text-center">
                    <div
                      className={cn("h-6 rounded mb-1", colors.disabledBg)}
                    />
                    <div className={cn("h-3 rounded", colors.disabledBg)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Modern Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 pb-20">
        {musicians
          .slice(0, 8)
          .map((musician: TrendingMusician, index: number) => (
            <motion.div
              key={musician._id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{
                scale: 1.02,
                y: -2,
                transition: { type: "spring", stiffness: 400, damping: 25 },
              }}
              className={cn(
                "group relative rounded-3xl p-4 transition-all duration-300 cursor-pointer",
                colors.card,
                colors.border,
                colors.hoverBg,
                "backdrop-blur-sm",
                "hover:shadow-xl"
              )}
            >
              {/* Background Gradient Effect */}
              <div
                className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl",
                  isDarkMode
                    ? "bg-gradient-to-br from-orange-500/5 to-red-500/5"
                    : "bg-gradient-to-br from-amber-500/3 to-orange-500/3"
                )}
              />

              {/* Top Badge */}
              {index < 3 && (
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="relative">
                    <div
                      className={cn(
                        "px-3 py-1 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1",
                        colors.gradientPrimary
                      )}
                    >
                      <Star className="w-3 h-3 fill-current" />
                      Top {index + 1}
                    </div>
                  </div>
                </div>
              )}

              <div className="relative z-10 space-y-4">
                {/* Header Section - Rating & Profile */}
                <div className="flex items-start justify-between gap-3">
                  {/* Profile Image */}
                  <div className="relative">
                    <div
                      className={cn(
                        "w-16 h-16 rounded-2xl overflow-hidden border-2 shadow-lg",
                        isDarkMode
                          ? "border-orange-400/80"
                          : "border-amber-400/80"
                      )}
                    >
                      <img
                        src={musician.picture || "/default-avatar.png"}
                        alt={musician.username}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                      />
                    </div>
                    {/* Online Status */}
                    <OnlineBadge
                      userId={musician?._id}
                      size="sm"
                      showText={true}
                      className="flex items-start"
                    />
                  </div>

                  {/* Rating & Basic Info */}
                  <div className="flex-1 min-w-0">
                    <ComprehensiveRating
                      rating={musician.rating}
                      size="sm"
                      showBreakdown={false}
                    />

                    {/* Name & Username */}
                    <div className="mt-2">
                      <h3
                        className={cn(
                          "font-bold text-lg leading-tight truncate",
                          colors.text,
                          isDarkMode
                            ? "group-hover:text-orange-400"
                            : "group-hover:text-amber-600"
                        )}
                      >
                        {musician.firstname || musician.username}{" "}
                        {musician.lastname || ""}
                      </h3>
                      <p className={cn("text-sm truncate", colors.textMuted)}>
                        @{musician.username}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Role & Specialization */}
                <div className="space-y-2">
                  {/* Primary Role */}
                  <div className="flex flex-wrap gap-1">
                    {musician.roleType && (
                      <RoleBadge
                        roleType={musician.roleType}
                        isBooker={musician.isBooker}
                        isDarkMode={isDarkMode}
                      />
                    )}
                    {musician.isBooker && (
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium border",
                          isDarkMode
                            ? "bg-purple-900/20 text-purple-400 border-purple-700/50"
                            : "bg-purple-500/10 text-purple-600 border-purple-500/20"
                        )}
                      >
                        Booker
                      </span>
                    )}
                  </div>

                  {/* Instruments/Skills */}
                  {musician.instrument && (
                    <div className="flex items-center gap-1 text-sm">
                      <Music2
                        className={cn(
                          "w-3 h-3",
                          isDarkMode ? "text-orange-400" : "text-amber-500"
                        )}
                      />
                      <span className={cn("font-medium", colors.text)}>
                        {musician.instrument}
                      </span>
                    </div>
                  )}

                  {/* Genres/Styles */}
                  {musician.genre && (
                    <div className="flex items-center gap-1 text-sm">
                      <Disc3 className={cn("w-3 h-3", colors.infoText)} />
                      <span className={cn("font-medium", colors.text)}>
                        {musician.genre}
                      </span>
                    </div>
                  )}
                </div>

                {/* Location & Contact */}
                <div className="space-y-2">
                  {musician.city && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin
                        className={cn(
                          "w-4 h-4",
                          isDarkMode ? "text-orange-400" : "text-amber-500"
                        )}
                      />
                      <span className={cn("font-medium", colors.text)}>
                        {musician.city}
                      </span>
                    </div>
                  )}

                  {/* Availability Status */}
                  {musician.availability && (
                    <div
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium text-center border",
                        musician.availability === "available"
                          ? cn(
                              colors.successBg,
                              colors.successText,
                              colors.successBorder
                            )
                          : cn(
                              colors.disabledBg,
                              colors.disabledText,
                              colors.disabledBorder
                            )
                      )}
                    >
                      {musician.availability === "available"
                        ? "Available"
                        : "Busy"}
                    </div>
                  )}
                </div>

                {/* Stats Grid */}
                <div
                  className={cn(
                    "grid grid-cols-3 gap-3 p-3 rounded-2xl",
                    colors.backgroundMuted
                  )}
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users
                        className={cn(
                          "w-3 h-3",
                          isDarkMode ? "text-orange-400" : "text-amber-500"
                        )}
                      />
                      <span className={cn("font-bold text-sm", colors.text)}>
                        {musician.followers?.length || 0}
                      </span>
                    </div>
                    <div
                      className={cn("text-xs font-medium", colors.textMuted)}
                    >
                      Followers
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Calendar className={cn("w-3 h-3", colors.successText)} />
                      <span className={cn("font-bold text-sm", colors.text)}>
                        {musician.completedGigsCount || 0}
                      </span>
                    </div>
                    <div
                      className={cn("text-xs font-medium", colors.textMuted)}
                    >
                      Gigs
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className={cn("w-3 h-3", colors.infoText)} />
                      <span className={cn("font-bold text-sm", colors.text)}>
                        {musician.followings?.length || 0}
                      </span>
                    </div>
                    <div
                      className={cn("text-xs font-medium", colors.textMuted)}
                    >
                      Following
                    </div>
                  </div>
                </div>

                {/* Tier & Experience */}
                <div className="flex items-center justify-between">
                  {/* Tier Badge */}
                  {musician.tier && musician.tier !== "free" && (
                    <TierBadge tier={musician.tier} isDarkMode={isDarkMode} />
                  )}

                  {/* Experience Level */}
                  {musician.experience && (
                    <div
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium border",
                        colors.disabledBg,
                        colors.disabledText,
                        colors.disabledBorder
                      )}
                    >
                      {musician.experience}
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div
                  className={cn("flex gap-2 pt-2 border-t", colors.borderMuted)}
                >
                  <button
                    className={cn(
                      "flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all border",
                      isDarkMode
                        ? "bg-orange-900/20 text-orange-400 border-orange-700/50 hover:bg-orange-900/30 hover:border-orange-600/50 whitespace-nowrap"
                        : "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40"
                    )}
                  >
                    View Profile
                  </button>
                  <button
                    className={cn(
                      "flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all border",
                      colors.infoBg,
                      colors.infoText,
                      colors.infoBorder,
                      isDarkMode
                        ? "hover:bg-blue-900/30 hover:border-blue-600/50"
                        : "hover:bg-blue-500/20 hover:border-blue-500/40"
                    )}
                  >
                    {" "}
                    <ChatIcon
                      userId={musician._id}
                      variant="ghost"
                      className="w-full justify-start hover:bg-transparent px-3 py-2"
                      showText={true}
                      size="lg"
                      text="Message Me"
                    />{" "}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  );
};

// Supporting Components
const RoleBadge: React.FC<{
  roleType: string;
  isBooker?: boolean;
  isDarkMode: boolean;
}> = ({ roleType, isBooker, isDarkMode }) => {
  const roleConfig = {
    dj: {
      label: "DJ",
      emoji: "🎧",
      color: isDarkMode
        ? "bg-blue-900/20 text-blue-400 border-blue-700/50"
        : "bg-blue-500/10 text-blue-600 border-blue-500/20",
    },
    mc: {
      label: "MC",
      emoji: "🎤",
      color: isDarkMode
        ? "bg-red-900/20 text-red-400 border-red-700/50"
        : "bg-red-500/10 text-red-600 border-red-500/20",
    },
    vocalist: {
      label: "Vocalist",
      emoji: "🎵",
      color: isDarkMode
        ? "bg-pink-900/20 text-pink-400 border-pink-700/50"
        : "bg-pink-500/10 text-pink-600 border-pink-500/20",
    },
    instrumentalist: {
      label: "Musician",
      emoji: "🎸",
      color: isDarkMode
        ? "bg-orange-900/20 text-orange-400 border-orange-700/50"
        : "bg-amber-500/10 text-amber-600 border-amber-500/20",
    },
    producer: {
      label: "Producer",
      emoji: "🎛️",
      color: isDarkMode
        ? "bg-purple-900/20 text-purple-400 border-purple-700/50"
        : "bg-purple-500/10 text-purple-600 border-purple-500/20",
    },
  };

  const config =
    roleConfig[roleType as keyof typeof roleConfig] ||
    roleConfig.instrumentalist;

  return (
    <span
      className={cn(
        "px-2 py-1 rounded-full text-xs font-medium border",
        config.color
      )}
    >
      {config.emoji} {config.label}
    </span>
  );
};

const TierBadge: React.FC<{ tier: string; isDarkMode: boolean }> = ({
  tier,
  isDarkMode,
}) => {
  const tierConfig = {
    pro: {
      label: "PRO",
      gradient: isDarkMode
        ? "from-orange-500 to-red-500"
        : "from-amber-500 to-orange-500",
      text: "text-white",
    },
    premium: {
      label: "PREMIUM",
      gradient: isDarkMode
        ? "from-purple-500 to-pink-500"
        : "from-purple-500 to-pink-500",
      text: "text-white",
    },
    elite: {
      label: "ELITE",
      gradient: isDarkMode
        ? "from-yellow-500 to-red-500"
        : "from-yellow-500 to-red-500",
      text: "text-white",
    },
  };

  const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig.pro;

  return (
    <div
      className={cn(
        "px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r shadow-lg",
        config.gradient,
        config.text
      )}
    >
      {config.label}
    </div>
  );
};
