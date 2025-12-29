// components/user-reliability/PerformanceMetrics.tsx - UPDATED
import {
  FaCheck,
  FaTimes,
  FaShieldAlt,
  FaChartLine,
  FaUserCheck,
  FaClock,
  FaMoneyBill,
  FaMobile,
  FaCrown,
  FaReply,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useThemeColors } from "@/hooks/useTheme";

interface PerformanceMetricsProps {
  completedGigsCount: number;
  cancelgigCount: number;
  trustScore: number;
  trustTier: string;
  profileComplete: boolean;
  verifiedIdentity: boolean;
  phoneVerified: boolean;
  avgRating: number;
  mpesaPhoneNumber?: string;
  userTier: string;
  responseTime: number;
  gigsPosted: number;
  completionRate: number;
}

export const PerformanceMetrics = ({
  completedGigsCount,
  cancelgigCount,
  trustScore,
  trustTier,
  profileComplete,
  verifiedIdentity,
  phoneVerified,
  avgRating,
  mpesaPhoneNumber,
  userTier,
  responseTime,
  gigsPosted,
  completionRate,
}: PerformanceMetricsProps) => {
  const { colors, isDarkMode } = useThemeColors();

  const metrics = [
    {
      label: "Trust Score",
      value: trustScore,
      max: 100,
      icon: <FaShieldAlt className="text-blue-500" />,
      color: "bg-blue-500",
      bg: isDarkMode ? "bg-blue-900/20" : "bg-blue-50",
      border: "border-blue-200 dark:border-blue-800",
      description: "Overall trust level",
      progress: true,
    },
    {
      label: "Completed Gigs",
      value: completedGigsCount,
      icon: <FaCheck className="text-green-500" />,
      color: "bg-green-500",
      bg: isDarkMode ? "bg-green-900/20" : "bg-green-50",
      border: "border-green-200 dark:border-green-800",
      description: "Successful gigs",
    },
    {
      label: "Avg Rating",
      value: avgRating.toFixed(1),
      icon: <FaChartLine className="text-yellow-500" />,
      color: "bg-yellow-500",
      bg: isDarkMode ? "bg-yellow-900/20" : "bg-yellow-50",
      border: "border-yellow-200 dark:border-yellow-800",
      description: "User rating",
    },
    {
      label: "Trust Tier",
      value: trustTier.charAt(0).toUpperCase() + trustTier.slice(1),
      icon: (
        <FaCrown
          className={
            trustTier === "elite"
              ? "text-yellow-500"
              : trustTier === "trusted"
                ? "text-purple-500"
                : trustTier === "verified"
                  ? "text-green-500"
                  : trustTier === "basic"
                    ? "text-blue-500"
                    : "text-gray-400"
          }
        />
      ),
      color:
        trustTier === "elite"
          ? "bg-yellow-500"
          : trustTier === "trusted"
            ? "bg-purple-500"
            : trustTier === "verified"
              ? "bg-green-500"
              : trustTier === "basic"
                ? "bg-blue-500"
                : "bg-gray-400",
      bg: isDarkMode ? "bg-gray-800/20" : "bg-gray-50",
      border: "border-gray-200 dark:border-gray-700",
      description: "Current tier level",
    },
    {
      label: "Response Time",
      value: responseTime < 24 ? "<24h" : `${responseTime}h`,
      icon: (
        <FaReply
          className={
            responseTime < 24
              ? "text-green-500"
              : responseTime < 48
                ? "text-yellow-500"
                : "text-red-500"
          }
        />
      ),
      color:
        responseTime < 24
          ? "bg-green-500"
          : responseTime < 48
            ? "bg-yellow-500"
            : "bg-red-500",
      bg: isDarkMode ? "bg-gray-800/20" : "bg-gray-50",
      border: "border-gray-200 dark:border-gray-700",
      description: "Avg response time",
    },
    {
      label: "Payment Method",
      value: mpesaPhoneNumber ? "Verified" : "Not Set",
      icon: (
        <FaMoneyBill
          className={mpesaPhoneNumber ? "text-green-500" : "text-gray-400"}
        />
      ),
      color: mpesaPhoneNumber ? "bg-green-500" : "bg-gray-400",
      bg: isDarkMode ? "bg-gray-800/20" : "bg-gray-50",
      border: "border-gray-200 dark:border-gray-700",
      description: "Payment setup",
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Performance Metrics
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Key indicators of user reliability and trust
          </p>
        </div>
        <div
          className={`px-3 py-1.5 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-100"} border ${colors.border}`}
        >
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Updated daily
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className={`p-4 rounded-xl border ${metric.border} ${metric.bg} backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`p-2 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-white"} border ${colors.border}`}
              >
                {metric.icon}
              </div>
              {metric.max && (
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  /{metric.max}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {metric.value}
                {metric.max && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    /{metric.max}
                  </span>
                )}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {metric.label}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {metric.description}
              </div>
            </div>

            {/* Progress bar for trust score */}
            {metric.label === "Trust Score" && (
              <div className="mt-3">
                <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${trustScore}%` }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className={`h-full ${metric.color} rounded-full`}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>New</span>
                  <span>Elite</span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Additional Stats */}
      <div
        className={`mt-6 p-6 rounded-xl border ${colors.border} ${isDarkMode ? "bg-gray-900/20" : "bg-gray-50/50"}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FaUserCheck className="text-blue-500" />
              Verification Status
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Profile Complete
                </span>
                <span
                  className={`font-medium ${profileComplete ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {profileComplete ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Identity Verified
                </span>
                <span
                  className={`font-medium ${verifiedIdentity ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {verifiedIdentity ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Phone Verified
                </span>
                <span
                  className={`font-medium ${phoneVerified ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {phoneVerified ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FaChartLine className="text-green-500" />
              Gig Performance
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Completion Rate
                </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {completionRate}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Cancellations
                </span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  {cancelgigCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Gigs Posted
                </span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {gigsPosted}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FaCrown className="text-yellow-500" />
              Account Status
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Account Tier
                </span>
                <span
                  className={`font-medium ${
                    userTier === "elite"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : userTier === "premium"
                        ? "text-purple-600 dark:text-purple-400"
                        : userTier === "pro"
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {userTier.charAt(0).toUpperCase() + userTier.slice(1)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Band Eligible
                </span>
                <span
                  className={`font-medium ${trustScore >= 70 ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-400"}`}
                >
                  {trustScore >= 70 ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Payment Verified
                </span>
                <span
                  className={`font-medium ${mpesaPhoneNumber ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}`}
                >
                  {mpesaPhoneNumber ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FaClock className="text-orange-500" />
              Activity Metrics
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Avg Response Time
                </span>
                <span
                  className={`font-medium ${
                    responseTime < 24
                      ? "text-green-600 dark:text-green-400"
                      : responseTime < 48
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {responseTime}h
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Gigs per Month
                </span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {Math.round(completedGigsCount / 3)}{" "}
                  {/* Assuming 3 months activity */}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Trust Trend
                </span>
                <span
                  className={`font-medium ${
                    trustScore >= 70
                      ? "text-green-600 dark:text-green-400"
                      : trustScore >= 50
                        ? "text-blue-600 dark:text-blue-400"
                        : trustScore >= 30
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {trustScore >= 70
                    ? "High"
                    : trustScore >= 50
                      ? "Good"
                      : trustScore >= 30
                        ? "Average"
                        : "Low"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
