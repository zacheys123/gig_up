// components/user-reliability/RatingOverview.tsx - UPDATED
import {
  FaStar,
  FaUsers,
  FaGuitar,
  FaChartBar,
  FaShieldAlt,
  FaCrown,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useThemeColors } from "@/hooks/useTheme";

interface RatingOverviewProps {
  trustScore: number;
  trustTier: string;
  avgRating: number;
  completedGigsCount: number;
  userRole: string;
  roleMetrics: {
    primary: string;
    secondary: string;
    primaryValue: number | string;
    secondaryValue: number | string;
  };
}

export const RatingOverview = ({
  trustScore,
  trustTier,
  avgRating,
  completedGigsCount,
  userRole,
  roleMetrics,
}: RatingOverviewProps) => {
  const { colors, isDarkMode } = useThemeColors();

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-500";
    if (rating >= 4.0) return "text-yellow-500";
    if (rating >= 3.0) return "text-orange-500";
    return "text-red-500";
  };

  const getTierGradient = (tier: string) => {
    switch (tier) {
      case "elite":
        return "from-yellow-400 via-amber-500 to-orange-500";
      case "trusted":
        return "from-purple-400 via-pink-500 to-rose-500";
      case "verified":
        return "from-green-400 via-emerald-500 to-teal-500";
      case "basic":
        return "from-blue-400 via-cyan-500 to-sky-500";
      default:
        return "from-gray-400 via-gray-500 to-gray-600";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "musician":
        return <FaGuitar className="text-blue-500" />;
      case "client":
        return <FaUsers className="text-green-500" />;
      case "booker":
        return <FaCrown className="text-purple-500" />;
      default:
        return <FaUsers className="text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "musician":
        return "text-blue-600 dark:text-blue-400";
      case "client":
        return "text-green-600 dark:text-green-400";
      case "booker":
        return "text-purple-600 dark:text-purple-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="mb-8">
      {/* Main Rating Card */}
      <div
        className={`rounded-2xl overflow-hidden border ${colors.border} ${isDarkMode ? "bg-gray-900/50" : "bg-white/50"} backdrop-blur-sm`}
      >
        {/* Header with Gradient */}
        <div
          className={`bg-gradient-to-r ${getTierGradient(trustTier)} p-6 text-white`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold">Trust Overview</h3>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-2">
                  {getRoleIcon(userRole)}
                  <span className="text-white/90">
                    {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                  </span>
                </div>
                <span className="text-white/80">•</span>
                <span className="text-white/80">
                  {completedGigsCount} gigs completed
                </span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-sm opacity-80">Trust Tier</div>
                <div className="text-xl font-bold flex items-center gap-2">
                  {trustTier.charAt(0).toUpperCase() + trustTier.slice(1)}
                  <FaShieldAlt className="text-white/80" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm opacity-80">Trust Score</div>
                <div className="text-3xl font-bold">{trustScore}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Trust Score Progress */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`p-6 rounded-xl border ${colors.border} ${isDarkMode ? "bg-gray-800/30" : "bg-blue-50/30"}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FaShieldAlt className="text-blue-500" />
                  Trust Score Progress
                </h4>
                <div
                  className={`text-sm px-3 py-1 rounded-full ${isDarkMode ? "bg-gray-800" : "bg-blue-100"} text-blue-600 dark:text-blue-400`}
                >
                  {trustScore}/100
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-gray-600 dark:text-gray-400">
                        Progress to next tier
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-blue-600 dark:text-blue-400">
                        {trustScore}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-200 dark:bg-gray-700">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${trustScore}%` }}
                      transition={{ duration: 1 }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r ${getTierGradient(trustTier)}`}
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {trustTier === "elite"
                    ? "You've reached the highest trust tier! Maintain your score to keep Elite status."
                    : `Need ${100 - trustScore} more points to reach maximum trust score`}
                </div>
              </div>
            </motion.div>

            {/* Rating Display */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`p-6 rounded-xl border ${colors.border} ${isDarkMode ? "bg-gray-800/30" : "bg-yellow-50/30"}`}
            >
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FaStar className="text-yellow-500" />
                  Average Rating
                </h4>
                <div
                  className={`text-sm px-3 py-1 rounded-full ${isDarkMode ? "bg-gray-800" : "bg-yellow-100"} text-yellow-600 dark:text-yellow-400`}
                >
                  Based on all reviews
                </div>
              </div>

              <div className="text-center">
                <div
                  className={`text-5xl font-bold ${getRatingColor(avgRating)} mb-4`}
                >
                  {avgRating.toFixed(1)}
                  <span className="text-xl text-gray-500 dark:text-gray-400">
                    /5
                  </span>
                </div>
                <div className="flex justify-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={`text-2xl mx-1 ${star <= Math.round(avgRating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {avgRating >= 4.5
                    ? "Excellent rating!"
                    : avgRating >= 4.0
                      ? "Good rating"
                      : avgRating >= 3.0
                        ? "Average rating"
                        : "Needs improvement"}
                </div>
              </div>
            </motion.div>

            {/* Role-Specific Metrics */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`p-6 rounded-xl border ${colors.border} ${getRoleColor(userRole).replace("text-", "bg-").replace("dark:text-", "dark:bg-")}/10`}
            >
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  {getRoleIcon(userRole)}
                  <span className={getRoleColor(userRole)}>
                    {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Stats
                  </span>
                </h4>
                <div
                  className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? "bg-gray-800" : "bg-gray-100"} text-gray-600 dark:text-gray-400`}
                >
                  Role-specific
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {roleMetrics.primary}
                  </div>
                  <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                    {roleMetrics.primaryValue}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {roleMetrics.secondary}
                  </div>
                  <div className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
                    {roleMetrics.secondaryValue}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className={`p-4 rounded-lg border ${colors.border} ${isDarkMode ? "bg-gray-800/30" : "bg-gray-50/30"}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-100"} border ${colors.border}`}
                >
                  <FaChartBar className="text-gray-500" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Trust Tier
                  </div>
                  <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    {trustTier.charAt(0).toUpperCase() + trustTier.slice(1)}
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border ${colors.border} ${isDarkMode ? "bg-gray-800/30" : "bg-green-50/30"}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${isDarkMode ? "bg-green-900/20" : "bg-green-100"} border ${colors.border}`}
                >
                  <FaGuitar className="text-green-500" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Gigs Completed
                  </div>
                  <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    {completedGigsCount}
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border ${colors.border} ${isDarkMode ? "bg-gray-800/30" : "bg-purple-50/30"}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${isDarkMode ? "bg-purple-900/20" : "bg-purple-100"} border ${colors.border}`}
                >
                  <FaUsers className="text-purple-500" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    User Role
                  </div>
                  <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border ${colors.border} ${isDarkMode ? "bg-gray-800/30" : "bg-blue-50/30"}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${isDarkMode ? "bg-blue-900/20" : "bg-blue-100"} border ${colors.border}`}
                >
                  <FaShieldAlt className="text-blue-500" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Score Impact
                  </div>
                  <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    {trustScore >= 70
                      ? "Band Eligible"
                      : trustScore >= 50
                        ? "Premium Access"
                        : trustScore >= 30
                          ? "Basic Features"
                          : "Limited"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
