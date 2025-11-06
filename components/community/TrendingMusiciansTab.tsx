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
import {
  MapPin,
  Users,
  Calendar,
  Star,
  Music2,
  Mic2,
  Disc3,
} from "lucide-react";

interface TrendingMusiciansTabProps {
  user?: any;
}

export const TrendingMusiciansTab: React.FC<TrendingMusiciansTabProps> = ({
  user,
}) => {
  const musicians = useTrendingMusicians();
  const { colors } = useThemeColors();

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
                colors.card, // Theme card background
                colors.border, // Theme border
                "backdrop-blur-sm",
                "hover:shadow-xl",
                colors.hoverShadow || "hover:shadow-amber-500/5", // Theme hover shadow
                colors.hoverBorder ||
                  "hover:border-amber-300/50 dark:hover:border-amber-600/50" // Theme hover border
              )}
            >
              {/* Background Gradient Effect with Theme */}
              <div
                className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl",
                  colors.hoverGradient ||
                    "bg-gradient-to-br from-amber-500/3 to-orange-500/3"
                )}
              />

              {/* Top Badge */}
              {index < 3 && (
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="relative">
                    <div
                      className={cn(
                        "px-3 py-1 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1",
                        colors.accentGradient ||
                          "bg-gradient-to-r from-amber-500 to-orange-500"
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
                        colors.accentBorder || "border-amber-400/80"
                      )}
                    >
                      <img
                        src={musician.picture || "/default-avatar.png"}
                        alt={musician.username}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                      />
                    </div>
                    {/* Online Status */}
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
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
                          colors.hoverText ||
                            "group-hover:text-amber-600 dark:group-hover:text-amber-400"
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
                        colors={colors}
                      />
                    )}
                    {musician.isBooker && (
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium border",
                          colors.secondaryBg || "bg-purple-500/10",
                          colors.secondaryText ||
                            "text-purple-600 dark:text-purple-400",
                          colors.secondaryBorder || "border-purple-500/20"
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
                          colors.accentText || "text-amber-500"
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
                      <Disc3
                        className={cn(
                          "w-3 h-3",
                          colors.infoText || "text-blue-500"
                        )}
                      />
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
                          colors.accentText || "text-amber-500"
                        )}
                      />
                      <span className={cn("font-medium", colors.text)}>
                        {musician.city}
                        {musician.state && `, ${musician.state}`}
                        {musician.country && `, ${musician.country}`}
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
                              colors.successBg || "bg-green-500/10",
                              colors.successText || "text-green-600",
                              colors.successBorder || "border-green-500/20"
                            )
                          : cn(
                              colors.mutedBg || "bg-gray-500/10",
                              colors.mutedText || "text-gray-600",
                              colors.mutedBorder || "border-gray-500/20"
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
                    colors.backgroundMuted ||
                      "bg-gray-50/50 dark:bg-gray-800/50"
                  )}
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users
                        className={cn(
                          "w-3 h-3",
                          colors.accentText || "text-amber-500"
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
                      <Calendar
                        className={cn(
                          "w-3 h-3",
                          colors.successText || "text-green-500"
                        )}
                      />
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
                      <Star
                        className={cn(
                          "w-3 h-3",
                          colors.infoText || "text-blue-500"
                        )}
                      />
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
                    <TierBadge tier={musician.tier} colors={colors} />
                  )}

                  {/* Experience Level */}
                  {musician.experience && (
                    <div
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium border",
                        colors.mutedBg || "bg-gray-500/10",
                        colors.mutedText || "text-gray-600",
                        colors.mutedBorder || "border-gray-500/20"
                      )}
                    >
                      {musician.experience}
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div
                  className={cn(
                    "flex gap-2 pt-2 border-t",
                    colors.borderMuted ||
                      "border-gray-200/50 dark:border-gray-700/50"
                  )}
                >
                  <button
                    className={cn(
                      "flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all border",
                      colors.primaryBg || "bg-amber-500/10",
                      colors.primaryText || "text-amber-600",
                      colors.primaryBorder || "border-amber-500/20",
                      colors.primaryHover ||
                        "hover:bg-amber-500/20 hover:border-amber-500/40"
                    )}
                  >
                    View Profile
                  </button>
                  <button
                    className={cn(
                      "flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all border",
                      colors.secondaryBg || "bg-blue-500/10",
                      colors.secondaryText || "text-blue-600",
                      colors.secondaryBorder || "border-blue-500/20",
                      colors.secondaryHover ||
                        "hover:bg-blue-500/20 hover:border-blue-500/40"
                    )}
                  >
                    Message
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  );
};

// Supporting Components with Theme
const RoleBadge: React.FC<{
  roleType: string;
  isBooker?: boolean;
  colors: any;
}> = ({ roleType, isBooker, colors }) => {
  const roleConfig = {
    dj: {
      label: "DJ",
      emoji: "🎧",
      color: cn(
        colors.infoBg || "bg-blue-500/10",
        colors.infoText || "text-blue-600",
        colors.infoBorder || "border-blue-500/20"
      ),
    },
    mc: {
      label: "MC",
      emoji: "🎤",
      color: cn(
        colors.errorBg || "bg-red-500/10",
        colors.errorText || "text-red-600",
        colors.errorBorder || "border-red-500/20"
      ),
    },
    vocalist: {
      label: "Vocalist",
      emoji: "🎵",
      color: cn(
        colors.warningBg || "bg-pink-500/10",
        colors.warningText || "text-pink-600",
        colors.warningBorder || "border-pink-500/20"
      ),
    },
    instrumentalist: {
      label: "Musician",
      emoji: "🎸",
      color: cn(
        colors.accentBg || "bg-amber-500/10",
        colors.accentText || "text-amber-600",
        colors.accentBorder || "border-amber-500/20"
      ),
    },
    producer: {
      label: "Producer",
      emoji: "🎛️",
      color: cn(
        colors.secondaryBg || "bg-purple-500/10",
        colors.secondaryText || "text-purple-600",
        colors.secondaryBorder || "border-purple-500/20"
      ),
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

const TierBadge: React.FC<{ tier: string; colors: any }> = ({
  tier,
  colors,
}) => {
  const tierConfig = {
    pro: {
      label: "PRO",
      gradient: colors.accentGradient || "from-amber-500 to-orange-500",
      text: colors.accentTextInverse || "text-amber-100",
      shadow: colors.accentShadow || "shadow-amber-500/25",
    },
    premium: {
      label: "PREMIUM",
      gradient: colors.secondaryGradient || "from-purple-500 to-pink-500",
      text: colors.secondaryTextInverse || "text-purple-100",
      shadow: colors.secondaryShadow || "shadow-purple-500/25",
    },
    elite: {
      label: "ELITE",
      gradient: colors.premiumGradient || "from-yellow-500 to-red-500",
      text: colors.premiumTextInverse || "text-yellow-100",
      shadow: colors.premiumShadow || "shadow-yellow-500/25",
    },
  };

  const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig.pro;

  return (
    <div
      className={cn(
        "px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r shadow-lg",
        config.gradient,
        config.text,
        config.shadow
      )}
    >
      {config.label}
    </div>
  );
};
