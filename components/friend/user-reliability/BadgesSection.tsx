// components/user-reliability/BadgesSection.tsx
import { motion } from "framer-motion";
import { FaAward, FaRegClock } from "react-icons/fa";
import { IoSparkles, IoShieldCheckmark, IoRibbon } from "react-icons/io5";
import { GiAchievement } from "react-icons/gi";
import {
  FaCrown,
  FaStar,
  FaHeart,
  FaFire,
  FaThumbsDown,
  FaFrownOpen,
} from "react-icons/fa";
import { useThemeColors } from "@/hooks/useTheme";

interface Badge {
  name: string;
  icon: React.ReactNode;
  description: string;
  tier?: "bronze" | "silver" | "gold" | "platinum";
  gradient?: string;
}

interface BadgesSectionProps {
  earnedBadges: Badge[];
  upcomingBadges: Badge[];
  trustTier: string;
  trustScore: number;
}

export const BadgesSection = ({
  earnedBadges,
  upcomingBadges,
  trustTier,
  trustScore,
}: BadgesSectionProps) => {
  const { colors, isDarkMode } = useThemeColors();

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case "bronze":
        return isDarkMode
          ? "from-amber-900 to-amber-700"
          : "from-amber-300 to-amber-500";
      case "silver":
        return isDarkMode
          ? "from-gray-700 to-gray-500"
          : "from-gray-300 to-gray-400";
      case "gold":
        return isDarkMode
          ? "from-yellow-900 to-yellow-700"
          : "from-yellow-300 to-yellow-500";
      case "platinum":
        return isDarkMode
          ? "from-purple-900 to-purple-700"
          : "from-purple-300 to-purple-500";
      default:
        return isDarkMode
          ? "from-blue-900 to-blue-700"
          : "from-blue-300 to-blue-500";
    }
  };

  const getTierText = (tier?: string) => {
    switch (tier) {
      case "bronze":
        return "text-amber-600";
      case "silver":
        return "text-gray-500";
      case "gold":
        return "text-yellow-500";
      case "platinum":
        return "text-purple-500";
      default:
        return "text-blue-500";
    }
  };

  return (
    <div
      className={`p-6 rounded-2xl ${isDarkMode ? "bg-gray-800/50" : "bg-gray-50/50"} backdrop-blur-sm border ${colors.border} mb-8`}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Achievements & Trust Status
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Badges earned through trust and performance
          </p>
        </div>

        {/* Trust Score Badge */}
        <div
          className={`px-4 py-2 rounded-full ${isDarkMode ? "bg-gray-900" : "bg-white"} border ${colors.border} shadow-sm`}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              Trust Score:{" "}
              <span className="text-blue-600 dark:text-blue-400">
                {trustScore}
              </span>
            </span>
            <span
              className={`px-2 py-1 text-xs rounded-full ${isDarkMode ? "bg-gray-800" : "bg-gray-100"} ${getTierText(trustTier)}`}
            >
              {trustTier.charAt(0).toUpperCase() + trustTier.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {earnedBadges.length > 0 ? (
        <>
          {/* Earned Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {earnedBadges.map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, rotate: 1 }}
                className={`relative overflow-hidden rounded-xl border ${colors.border} backdrop-blur-sm`}
              >
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${getTierColor(badge.tier)} opacity-10`}
                />

                <div className="relative p-5">
                  <div className="flex items-start gap-4">
                    {/* Badge Icon with Glow */}
                    <div
                      className={`relative p-3 rounded-full ${isDarkMode ? "bg-gray-800/80" : "bg-white/80"} border ${colors.border}`}
                    >
                      <div className={`text-xl ${getTierText(badge.tier)}`}>
                        {badge.icon}
                      </div>
                      {/* Glow Effect */}
                      <div
                        className={`absolute inset-0 rounded-full bg-gradient-to-r ${getTierColor(badge.tier)} opacity-20 blur-sm`}
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100">
                          {badge.name}
                        </h3>
                        {badge.tier && (
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${isDarkMode ? "bg-gray-900" : "bg-gray-100"} ${getTierText(badge.tier)}`}
                          >
                            {badge.tier.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${colors.textMuted}`}>
                        {badge.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Upcoming Badges */}
          {upcomingBadges.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-8 p-6 rounded-xl border ${colors.border} ${isDarkMode ? "bg-gray-800/30" : "bg-white/50"}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2 rounded-lg ${isDarkMode ? "bg-blue-900/20" : "bg-blue-100"} border ${colors.border}`}
                >
                  <FaRegClock className="text-blue-500 text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-100">
                    Next Level Badges
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Keep going to unlock these achievements
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {upcomingBadges.map((badge, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 5 }}
                    className={`p-4 rounded-lg border-2 border-dashed ${colors.border} hover:border-blue-300 transition-all duration-300 ${isDarkMode ? "hover:bg-gray-800/30" : "hover:bg-blue-50/30"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}
                      >
                        <div className="text-gray-400 text-xl">
                          {badge.icon}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300">
                          {badge.name}
                        </h4>
                        <p className={`text-xs ${colors.textMuted} mt-1`}>
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-12"
        >
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div
              className={`absolute inset-0 rounded-full ${isDarkMode ? "bg-gray-800" : "bg-gray-100"} border ${colors.border}`}
            />
            <div
              className={`absolute inset-2 rounded-full ${isDarkMode ? "bg-gray-900" : "bg-gray-200"} border ${colors.border}`}
            />
            <div className="absolute inset-4 rounded-full flex items-center justify-center">
              <FaAward className={`text-xl ${colors.textMuted}`} />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-100 mb-2">
            No badges earned yet
          </h3>
          <p className={`max-w-md mx-auto ${colors.textMuted} mb-6`}>
            Build your trust score, complete gigs, and maintain good ratings to
            start earning badges.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              className={`px-4 py-2 rounded-lg border ${colors.border} ${colors.hoverBg} transition-colors`}
            >
              How to improve trust score
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${colors.primaryBg} text-white ${colors.primaryBgHover} transition-colors`}
            >
              Explore available gigs
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
