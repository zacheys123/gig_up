"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { TrustStarsDisplay } from "@/components/trust/TrustStarsDisplay";
import { useTrendingMusicians } from "@/hooks/useCommunityUsers";
import { TrendingMusician } from "@/types/trendingUser";
import { OnlineBadge } from "../chat/OnlineBadge";
import { ChatIcon } from "../chat/ChatIcon";
import {
  MapPin,
  Users,
  Calendar,
  Star,
  Music2,
  Disc3,
  Crown,
  Zap,
  Shield,
  Check,
  Trophy,
  Award,
  Clock,
  Eye,
  MessageSquare,
  Mic,
  Guitar,
  Settings,
  Pause,
  CheckCircle,
  Music,
  Sparkles,
  Target,
  TrendingUp,
  Award as AwardIcon,
} from "lucide-react";

interface TrendingMusiciansTabProps {
  user?: any;
}

// Helper function to get trust tier description
const getTrustTierDescription = (tier: string, score: number) => {
  const tierConfig = {
    elite: {
      title: "Elite Professional",
      description: "Top-rated with exceptional trust score",
      icon: Sparkles,
      level: "Highest Trust",
    },
    trusted: {
      title: "Trusted Professional",
      description: "Highly reliable with excellent track record",
      icon: Shield,
      level: "High Trust",
    },
    verified: {
      title: "Verified Member",
      description: "Established and verified performer",
      icon: CheckCircle,
      level: "Verified",
    },
    basic: {
      title: "Active Member",
      description: "Building their reputation on the platform",
      icon: Star,
      level: "Building Trust",
    },
    new: {
      title: "New Member",
      description: "Getting started on the platform",
      icon: TrendingUp,
      level: "Getting Started",
    },
  };

  const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig.new;
  return {
    ...config,
    scoreRange: getScoreRange(tier),
  };
};

// Helper function to get score range description
const getScoreRange = (tier: string) => {
  const ranges = {
    elite: "90-100",
    trusted: "65-89",
    verified: "50-64",
    basic: "30-49",
    new: "0-29",
  };
  return ranges[tier as keyof typeof ranges] || ranges.new;
};

// Helper function to get trust status text
const getTrustStatusText = (score: number) => {
  if (score >= 90) return "Exceptional Trust";
  if (score >= 80) return "Highly Trusted";
  if (score >= 70) return "Very Reliable";
  if (score >= 60) return "Reliable";
  if (score >= 50) return "Trustworthy";
  if (score >= 40) return "Growing Trust";
  if (score >= 30) return "Building Trust";
  return "New Member";
};

export const TrendingMusiciansTab: React.FC<TrendingMusiciansTabProps> = ({
  user,
}) => {
  const musicians = useTrendingMusicians();
  const { colors, mounted } = useThemeColors();

  // Show loading state until theme is mounted
  if (!mounted) {
    return (
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-20">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="rounded-3xl p-5 animate-pulse bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/60"
          >
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gray-300" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 rounded bg-gray-300" />
                  <div className="h-3 rounded w-3/4 bg-gray-300" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-6 rounded bg-gray-300" />
                <div className="h-4 rounded bg-gray-300" />
              </div>
              <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-gray-200/50">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="text-center">
                    <div className="h-6 rounded mb-1 bg-gray-300" />
                    <div className="h-3 rounded bg-gray-300" />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20 px-4 md:px-6">
        {musicians
          .slice(0, 8)
          .map((musician: TrendingMusician, index: number) => {
            const trustScore = musician.trustScore || 0;
            const trustStars = musician.trustStars || 0.5;
            const trustTier = musician.trustTier || "new";
            const trustInfo = getTrustTierDescription(trustTier, trustScore);
            const TrustIcon = trustInfo.icon;

            return (
              <motion.div
                key={musician._id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{
                  y: -8,
                  boxShadow:
                    "0 20px 40px -12px rgba(0, 0, 0, 0.1), 0 8px 16px -4px rgba(0, 0, 0, 0.06)",
                  transition: { type: "spring", stiffness: 400, damping: 25 },
                }}
                className={cn(
                  "group relative rounded-2xl p-5 transition-all duration-300 cursor-pointer",
                  "shadow-sm hover:shadow-xl backdrop-blur-sm",
                  colors.card,
                  "border",
                  colors.border,
                  "hover:border-orange-200 dark:hover:border-orange-700" // Fixed: Use static classes
                )}
              >
                {/* Ranking Badge - Subtle */}
                {index < 3 && (
                  <div className="absolute -top-3 -right-3 z-20">
                    <div
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5",
                        index === 0
                          ? cn("text-white", colors.gradientPrimary)
                          : index === 1
                            ? "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                            : "bg-gradient-to-r from-amber-600 to-orange-600 text-white"
                      )}
                    >
                      {index === 0 ? (
                        <>
                          <Crown className="w-3.5 h-3.5 fill-current" />
                          <span>#1</span>
                        </>
                      ) : index === 1 ? (
                        <>
                          <Trophy className="w-3.5 h-3.5 fill-current" />
                          <span>#2</span>
                        </>
                      ) : (
                        <>
                          <AwardIcon className="w-3.5 h-3.5" />
                          <span>#3</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Trust Tier Badge - Subtle */}
                {trustTier !== "new" && (
                  <div className="absolute top-4 left-4 z-10 transform -translate-x-1 -translate-y-1">
                    <TrustTierRibbon tier={trustTier} colors={colors} />
                  </div>
                )}

                <div className="relative z-10">
                  {/* Header Section */}
                  <div className="flex items-start gap-4 mb-4">
                    {/* Profile Avatar with Online Status */}
                    <div className="relative flex-shrink-0">
                      <div
                        className={cn(
                          "w-16 h-16 rounded-xl overflow-hidden border-2 shadow-md transition-all duration-300",
                          "border-gray-300 dark:border-gray-600 group-hover:border-orange-400 dark:group-hover:border-orange-500"
                        )}
                      >
                        <img
                          src={musician.picture || "/default-avatar.png"}
                          alt={musician.username}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {/* Premium tier glow effect */}
                        {musician.tier && musician.tier !== "free" && (
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-orange-500/10 to-transparent pointer-events-none" />
                        )}
                      </div>
                      <OnlineBadge
                        userId={musician?._id}
                        size="sm"
                        showText={false}
                        className="absolute -bottom-1.5 -right-1.5 border-2 border-white dark:border-gray-800"
                      />
                    </div>

                    {/* Name and Basic Info */}
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <h3
                            className={cn(
                              "font-bold text-lg leading-tight truncate transition-colors",
                              colors.text,
                              "group-hover:text-orange-600 dark:group-hover:text-orange-400"
                            )}
                          >
                            {musician.firstname || musician.username}
                          </h3>
                          <p
                            className={cn("text-sm truncate", colors.textMuted)}
                          >
                            @{musician.username}
                          </p>
                        </div>
                        {/* Subscription Tier */}
                        {musician.tier && musician.tier !== "free" && (
                          <TierPill tier={musician.tier} colors={colors} />
                        )}
                      </div>

                      {/* Location and Trust Status */}
                      <div className="flex items-center justify-between gap-3 mt-3">
                        {musician.city && (
                          <div
                            className={cn(
                              "flex items-center gap-2 text-sm",
                              colors.textMuted
                            )}
                          >
                            <div
                              className={cn(
                                "p-1.5 rounded-lg",
                                colors.backgroundMuted
                              )}
                            >
                              <MapPin className="w-4 h-4" />
                            </div>
                            <span className="font-medium">{musician.city}</span>
                          </div>
                        )}
                        {/* Trust Status */}
                        <div
                          className={cn(
                            "flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-medium",
                            colors.backgroundMuted
                          )}
                        >
                          <TrustIcon className="w-4 h-4" />
                          <span>{trustInfo.level}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trust Information Section */}
                  <div
                    className={cn(
                      "mb-4 p-3 rounded-xl border",
                      colors.backgroundMuted,
                      colors.border
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TrustIcon className="w-4 h-4" />
                        <span className="text-sm font-semibold">
                          {trustInfo.title}
                        </span>
                      </div>
                      <TrustStarsDisplay
                        trustStars={trustStars}
                        size="sm"
                        showScore={true}
                        showTier={false}
                      />
                    </div>
                    <p className={cn("text-xs mb-2", colors.textMuted)}>
                      {trustInfo.description}
                    </p>
                  </div>

                  {/* Role and Instrument Section */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      {musician.roleType && (
                        <RoleChip
                          roleType={musician.roleType}
                          colors={colors}
                        />
                      )}
                      {musician.instrument && (
                        <div
                          className={cn(
                            "flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full border",
                            colors.text,
                            colors.backgroundMuted,
                            colors.border
                          )}
                        >
                          <Music2 className="w-4 h-4" />
                          {musician.instrument}
                        </div>
                      )}
                    </div>
                    {musician.genre && (
                      <div
                        className={cn(
                          "flex items-center gap-2 text-sm",
                          colors.textMuted
                        )}
                      >
                        <Disc3 className="w-4 h-4" />
                        <span className="truncate">{musician.genre}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats Grid - Subtle */}
                  <div
                    className={cn(
                      "grid grid-cols-3 gap-3 mb-4 p-3 rounded-xl border",
                      colors.backgroundMuted,
                      colors.border
                    )}
                  >
                    <StatBlock
                      icon={<Users className="w-4 h-4" />}
                      value={musician.followers?.length || 0}
                      label="Followers"
                      color="blue"
                      colors={colors}
                    />
                    <StatBlock
                      icon={<Calendar className="w-4 h-4" />}
                      value={musician.completedGigsCount || 0}
                      label="Gigs"
                      color="green"
                      colors={colors}
                    />
                  </div>

                  {/* Experience and Availability */}
                  <div
                    className={cn(
                      "flex items-center justify-between gap-3 mb-4 p-3 rounded-xl",
                      colors.backgroundSecondary
                    )}
                  >
                    {musician.experience && (
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "p-1.5 rounded-lg",
                            colors.backgroundMuted
                          )}
                        >
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className={cn("text-xs", colors.textMuted)}>
                            Experience
                          </div>
                          <div className={cn("font-bold", colors.text)}>
                            {musician.experience}{" "}
                            {musician.experience === "1" ? "year" : "years"}
                          </div>
                        </div>
                      </div>
                    )}
                    {musician.availability && (
                      <AvailabilityBadge
                        availability={musician.availability}
                        colors={colors}
                      />
                    )}
                  </div>

                  {/* Action Buttons - Using theme colors */}
                  <div className="flex gap-3 pt-2">
                    <button
                      className={cn(
                        "flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold",
                        "transition-all duration-300 hover:shadow-lg",
                        "hover:-translate-y-0.5 active:translate-y-0",
                        "flex items-center justify-center gap-2",
                        colors.primaryBg,
                        colors.textInverted,
                        "hover:bg-orange-700 dark:hover:bg-orange-600" // Fixed: Use static hover classes
                      )}
                    >
                      <Eye className="w-4 h-4" />
                      View Profile
                    </button>
                    <button
                      className={cn(
                        "flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold",
                        "transition-all duration-300 hover:shadow-lg",
                        "hover:-translate-y-0.5 active:translate-y-0",
                        "flex items-center justify-center gap-2",
                        colors.infoBg,
                        colors.infoText,
                        "hover:bg-blue-100 dark:hover:bg-blue-900/30" // Fixed: Use static hover classes
                      )}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
      </div>
    </div>
  );
};

// Helper function to get trust tier from score (mock implementation)
function getTrustTierFromScore(score: number): string {
  if (score >= 80) return "elite";
  if (score >= 65) return "trusted";
  if (score >= 50) return "verified";
  if (score >= 30) return "basic";
  return "new";
}

// TrustTierRibbon component
const TrustTierRibbon: React.FC<{ tier: string; colors: any }> = ({
  tier,
  colors,
}) => {
  const tierConfig = {
    elite: {
      label: "ELITE",
      bgColor: "bg-gradient-to-r from-yellow-500 to-orange-500",
      icon: Sparkles,
    },
    trusted: {
      label: "TRUSTED",
      bgColor: "bg-gradient-to-r from-green-500 to-emerald-500",
      icon: Shield,
    },
    verified: {
      label: "VERIFIED",
      bgColor: "bg-gradient-to-r from-blue-500 to-cyan-500",
      icon: CheckCircle,
    },
    basic: {
      label: "ACTIVE",
      bgColor: "bg-gradient-to-r from-amber-500 to-yellow-500",
      icon: Star,
    },
    new: {
      label: "NEW",
      bgColor: "bg-gradient-to-r from-gray-500 to-gray-600",
      icon: TrendingUp,
    },
  };

  const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig.new;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "px-3 py-1.5 rounded-r-lg rounded-bl-lg text-white text-xs font-bold",
        "shadow-sm flex items-center gap-1.5 transform -rotate-2 origin-left",
        config.bgColor
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </div>
  );
};

// StatBlock component
const StatBlock: React.FC<{
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: "amber" | "green" | "blue";
  colors: any;
}> = ({ icon, value, label, color, colors }) => {
  const colorConfig = {
    amber: {
      text: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-900/20",
    },
    green: {
      text: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/20",
    },
    blue: {
      text: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/20",
    },
  };

  const config = colorConfig[color] || colorConfig.amber;

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 mb-1">
        <div className={cn("p-1 rounded-lg", config.bg)}>{icon}</div>
      </div>
      <div className={cn("text-xl font-bold", config.text)}>{value}</div>
      <div className={cn("text-xs", colors.textMuted)}>{label}</div>
    </div>
  );
};

// AvailabilityBadge component
const AvailabilityBadge: React.FC<{
  availability: "available" | "notavailable";
  colors: any;
}> = ({ availability, colors }) => {
  const isAvailable = availability === "available";

  return (
    <div
      className={cn(
        "px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 border",
        isAvailable
          ? cn(
              "text-green-600 dark:text-green-400",
              "bg-green-50 dark:bg-green-900/20",
              "border-green-200 dark:border-green-800"
            )
          : cn(colors.textMuted, colors.backgroundMuted, colors.border)
      )}
    >
      {isAvailable ? (
        <>
          <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
          <span>Available</span>
        </>
      ) : (
        <>
          <Pause className="w-3.5 h-3.5" />
          <span>Busy</span>
        </>
      )}
    </div>
  );
};

// RoleChip component
const RoleChip: React.FC<{ roleType: string; colors: any }> = ({
  roleType,
  colors,
}) => {
  const roleConfig = {
    dj: {
      emoji: "🎧",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800",
      icon: Music,
    },
    mc: {
      emoji: "🎤",
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-600 dark:text-red-400",
      border: "border-red-200 dark:border-red-800",
      icon: Mic,
    },
    vocalist: {
      emoji: "🎵",
      bg: "bg-pink-100 dark:bg-pink-900/30",
      text: "text-pink-600 dark:text-pink-400",
      border: "border-pink-200 dark:border-pink-800",
      icon: Music,
    },
    instrumentalist: {
      emoji: "🎸",
      bg: "bg-amber-100 dark:bg-amber-900/30",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-800",
      icon: Guitar,
    },
    producer: {
      emoji: "🎛️",
      bg: "bg-purple-100 dark:bg-purple-900/30",
      text: "text-purple-600 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-800",
      icon: Settings,
    },
  };

  const config =
    roleConfig[roleType as keyof typeof roleConfig] ||
    roleConfig.instrumentalist;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm flex items-center gap-1.5 border",
        config.bg,
        config.text,
        config.border
      )}
    >
      <span className="text-base">{config.emoji}</span>
      <Icon className="w-3.5 h-3.5" />
      <span>{roleType.charAt(0).toUpperCase() + roleType.slice(1)}</span>
    </div>
  );
};

// TierPill component
const TierPill: React.FC<{ tier: string; colors: any }> = ({
  tier,
  colors,
}) => {
  const tierConfig = {
    pro: {
      gradient: "bg-gradient-to-r from-amber-500 to-orange-500",
      glow: "shadow-md",
      icon: Star,
    },
    premium: {
      gradient: "bg-gradient-to-r from-purple-500 to-pink-500",
      glow: "shadow-md",
      icon: Zap,
    },
    elite: {
      gradient: "bg-gradient-to-r from-yellow-500 to-orange-500",
      glow: "shadow-lg",
      icon: Crown,
    },
  };

  const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig.pro;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "px-2 py-1 rounded-lg text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1",
        config.glow,
        config.gradient
      )}
    >
      <Icon className="w-2.5 h-2.5" />
      {tier}
    </div>
  );
};
