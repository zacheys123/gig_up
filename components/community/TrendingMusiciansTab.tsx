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

interface TrendingMusiciansTabProps {
  user?: any;
}

export const TrendingMusiciansTab: React.FC<TrendingMusiciansTabProps> = ({
  user,
}) => {
  const musicians = useTrendingMusicians();
  const { colors } = useThemeColors();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-6 mb-10 pb-20">
      {musicians
        .slice(0, 4)
        .map((musician: TrendingMusician, index: number) => (
          <motion.div
            key={musician._id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03 }}
            className={cn(
              "relative flex flex-col items-center rounded-2xl p-5 shadow-lg hover:shadow-xl transition",
              colors.card,
              colors.border
            )}
          >
            {/* 🔥 Top 3 Badge */}
            {index < 3 && (
              <div className="absolute w-full  -top-3 -right-3 my-5 rounded-full font-semibold shadow-md flex  items-center gap-3">
                <ComprehensiveRating
                  rating={musician.rating}
                  size="sm"
                  className="flex-1"
                />
                <span className="px-3 py-1  bg-gradient-to-br from-amber-500 to-orange-500 text-white text-xs">
                  🔥 Top {index + 1}
                </span>
              </div>
            )}

            {/* Profile Picture */}
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-amber-400 mb-4">
              <img
                src={musician.picture || "/default-avatar.png"}
                alt={musician.username}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Name */}
            <p className={cn("font-semibold text-lg text-center", colors.text)}>
              {musician.firstname || musician.username}{" "}
              {musician.lastname || ""}
            </p>

            {/* Role */}
            {musician.roleType && (
              <p className={cn("text-sm mt-1 text-center", colors.textMuted)}>
                {musician.roleType === "dj"
                  ? "Deejay"
                  : musician?.roleType === "mc"
                    ? "EMCee"
                    : musician?.roleType === "vocalist"
                      ? "Vocalist"
                      : "Instrumentalist"}
              </p>
            )}
            {musician.isBooker && (
              <p className={cn("text-sm mt-1 text-center", colors.textMuted)}>
                Booker/Manager
              </p>
            )}
            {/* City */}
            {musician.city && (
              <p className={cn("text-xs mt-1 text-center", colors.textMuted)}>
                📍 {musician.city}
              </p>
            )}

            {/* Tier */}
            {musician.tier && (
              <span
                className={cn(
                  "mt-2 px-3 py-1 rounded-full text-xs font-medium",
                  musician.tier === "pro"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-gray-100 text-gray-700"
                )}
              >
                {musician.tier?.toUpperCase()}
              </span>
            )}

            {/* Stats Footer */}
            <div
              className={cn(
                "mt-4 w-full flex justify-around border-t pt-3 text-xs",
                colors.border
              )}
            >
              <div className="flex flex-col items-center">
                <span className={cn("font-medium", colors.text)}>
                  {musician.followers?.length || 0}
                </span>
                <span className={colors.textMuted}>Followers</span>
              </div>
              <div className="flex flex-col items-center">
                <span className={cn("font-medium", colors.text)}>
                  {musician.completedGigsCount}
                </span>
                <span className={colors.textMuted}>Gigs</span>
              </div>
              <div className="flex flex-col items-center">
                <span className={cn("font-medium", colors.text)}>
                  {musician.followings?.length || 0}
                </span>
                <span className={colors.textMuted}>Followings</span>
              </div>
            </div>
          </motion.div>
        ))}
    </div>
  );
};
