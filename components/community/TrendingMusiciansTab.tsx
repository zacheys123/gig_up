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
  Disc3,
  Crown,
  Zap,
} from "lucide-react";
import { OnlineBadge } from "../chat/OnlineBadge";
import { ChatIcon } from "../chat/ChatIcon";

interface TrendingMusiciansTabProps {
  user?: any;
}

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 pb-20">
        {musicians
          .slice(0, 8)
          .map((musician: TrendingMusician, index: number) => (
            <motion.div
              key={musician._id}
              layout
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              whileHover={{
                scale: 1.02,
                y: -2,
                transition: { type: "spring", stiffness: 400, damping: 25 },
              }}
              className="group relative rounded-2xl p-3 transition-all duration-300 cursor-pointer bg-white border border-gray-200/80 shadow-xs hover:shadow-md backdrop-blur-sm"
            >
              {/* Top Trending Badge */}
              {index < 3 && (
                <div className="absolute -top-1 -right-1 z-10">
                  <div className="px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-full shadow-sm flex items-center gap-0.5">
                    {index === 0 ? (
                      <Crown className="w-2.5 h-2.5 fill-current" />
                    ) : (
                      <Zap className="w-2.5 h-2.5 fill-current" />
                    )}
                    #{index + 1}
                  </div>
                </div>
              )}

              <div className="relative z-10 space-y-2.5">
                {/* Header - Profile, Name, Rating & Location */}
                <div className="flex items-start gap-2.5">
                  {/* Profile Image */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-amber-400/60 shadow-xs group-hover:border-amber-500 transition-colors">
                      <img
                        src={musician.picture || "/default-avatar.png"}
                        alt={musician.username}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                      />
                    </div>
                    <OnlineBadge
                      userId={musician?._id}
                      size="xs"
                      showText={false}
                      className="absolute -bottom-0.5 -right-0.5"
                    />
                  </div>

                  {/* Name, Location & Rating */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm leading-tight truncate text-gray-900 group-hover:text-amber-600 transition-colors">
                          {musician.firstname || musician.username}
                        </h3>
                        <p className="text-xs text-gray-600 truncate">
                          @{musician.username}
                        </p>
                      </div>
                      {musician.tier && musician.tier !== "free" && (
                        <TierBadge tier={musician.tier} />
                      )}
                    </div>

                    {/* Location & Rating in one line */}
                    <div className="flex items-center justify-between gap-2 mt-1">
                      {musician.city && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <MapPin className="w-3 h-3 text-amber-500" />
                          <span className="truncate">{musician.city}</span>
                        </div>
                      )}
                      <ComprehensiveRating
                        rating={musician.rating}
                        showBreakdown={false}
                      />
                    </div>
                  </div>
                </div>

                {/* Role & Skills - Single line */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {musician.roleType && (
                    <RoleBadge roleType={musician.roleType} />
                  )}
                  {musician.instrument && (
                    <div className="flex items-center gap-1 text-xs text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded-md">
                      <Music2 className="w-3 h-3 text-amber-500" />
                      {musician.instrument}
                    </div>
                  )}
                </div>

                {/* Stats & Availability - Single row */}
                <div className="flex items-center justify-between gap-2">
                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-amber-500" />
                      <span className="font-semibold text-gray-900">
                        {musician.followers?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-green-500" />
                      <span className="font-semibold text-gray-900">
                        {musician.completedGigsCount || 0}
                      </span>
                    </div>
                  </div>

                  {/* Availability */}
                  {musician.availability && (
                    <div
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        musician.availability === "available"
                          ? "bg-green-500/10 text-green-600"
                          : "bg-gray-500/10 text-gray-600"
                      }`}
                    >
                      {musician.availability === "available" ? "✅" : "⏸️"}
                    </div>
                  )}
                </div>

                {/* Genre & Experience - Single line */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  {musician.genre && (
                    <div className="flex items-center gap-1 text-gray-700 truncate flex-1">
                      <Disc3 className="w-3 h-3 text-blue-500 flex-shrink-0" />
                      <span className="truncate">{musician.genre}</span>
                    </div>
                  )}
                  {musician.experience && (
                    <div className="text-gray-600 text-xs whitespace-nowrap">
                      {musician.experience} yrs
                    </div>
                  )}
                </div>

                {/* Actions - Compact */}
                <div className="flex gap-1.5 pt-2">
                  <button className="flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 hover:shadow-xs text-center">
                    Profile
                  </button>
                  <button className="flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 hover:shadow-xs text-center">
                    <ChatIcon
                      userId={musician._id}
                      variant="ghost"
                      className="w-full justify-center hover:bg-transparent"
                      showText={true}
                      size="sm"
                      text="Message"
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  );
};

const RoleBadge: React.FC<{
  roleType: string;
}> = ({ roleType }) => {
  const roleConfig = {
    dj: {
      label: "DJ",
      emoji: "🎧",
      color: "bg-blue-500/10 text-blue-600",
    },
    mc: {
      label: "MC",
      emoji: "🎤",
      color: "bg-red-500/10 text-red-600",
    },
    vocalist: {
      label: "Vocalist",
      emoji: "🎵",
      color: "bg-pink-500/10 text-pink-600",
    },
    instrumentalist: {
      label: "Musician",
      emoji: "🎸",
      color: "bg-amber-500/10 text-amber-600",
    },
    producer: {
      label: "Producer",
      emoji: "🎛️",
      color: "bg-purple-500/10 text-purple-600",
    },
  };

  const config =
    roleConfig[roleType as keyof typeof roleConfig] ||
    roleConfig.instrumentalist;

  return (
    <span
      className={`px-1.5 py-0.5 rounded text-xs font-medium ${config.color}`}
    >
      {config.emoji} {config.label}
    </span>
  );
};

const TierBadge: React.FC<{ tier: string }> = ({ tier }) => {
  const tierConfig = {
    pro: {
      label: "PRO",
      gradient: "from-amber-500 to-orange-500",
    },
    premium: {
      label: "PREMIUM",
      gradient: "from-purple-500 to-pink-500",
    },
    elite: {
      label: "ELITE",
      gradient: "from-yellow-500 to-red-500",
    },
  };

  const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig.pro;

  return (
    <div
      className={`px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r ${config.gradient} text-white shadow-xs`}
    >
      {config.label}
    </div>
  );
};
