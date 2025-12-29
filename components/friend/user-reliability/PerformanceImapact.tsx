// components/user-reliability/PerformanceImpact.tsx
import {
  FaThumbsUp,
  FaExclamationTriangle,
  FaCheck,
  FaTimes,
  FaChartLine,
  FaShieldAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useThemeColors } from "@/hooks/useTheme";

export const PerformanceImpact = () => {
  const { colors, isDarkMode } = useThemeColors();

  return (
    <div className={`rounded-2xl overflow-hidden border ${colors.border} mb-8`}>
      {/* Header with Gradient */}
      <div
        className={`bg-gradient-to-r ${isDarkMode ? "from-blue-900/30 to-purple-900/30" : "from-blue-50 to-purple-50"} p-6 border-b ${colors.border}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${isDarkMode ? "bg-blue-900/20" : "bg-blue-100"} border ${colors.border}`}
          >
            <FaShieldAlt className="text-blue-500 text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Trust Score Impact
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              How your trust score affects your experience
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-0">
        {/* Benefits Column */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`p-6 ${isDarkMode ? "bg-gray-900/20" : "bg-green-50/30"} border-r ${colors.border}`}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
              <FaThumbsUp className="text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-semibold text-green-600 dark:text-green-400">
              Benefits of High Trust
            </h4>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: "⭐",
                title: "Premium Visibility",
                desc: "Top search ranking and featured listings",
              },
              {
                icon: "⚡",
                title: "Faster Payments",
                desc: "Instant payouts and reduced processing times",
              },
              {
                icon: "🎯",
                title: "Priority Access",
                desc: "First access to premium gigs and opportunities",
              },
              {
                icon: "🛡️",
                title: "Verified Status",
                desc: "Trust badge displayed on your profile",
              },
              {
                icon: "🤝",
                title: "Band Creation",
                desc: "Eligible to create and manage bands",
              },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-colors"
              >
                <div className="text-xl">{benefit.icon}</div>
                <div>
                  <h5 className="font-medium text-gray-700 dark:text-gray-300">
                    {benefit.title}
                  </h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {benefit.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Consequences Column */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`p-6 ${isDarkMode ? "bg-gray-900/20" : "bg-red-50/30"}`}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
              <FaExclamationTriangle className="text-red-600 dark:text-red-400" />
            </div>
            <h4 className="font-semibold text-red-600 dark:text-red-400">
              Impact of Low Trust
            </h4>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: "👁️",
                title: "Reduced Visibility",
                desc: "Lower search ranking and limited exposure",
              },
              {
                icon: "⏳",
                title: "Slower Payments",
                desc: "Delayed payouts and longer processing",
              },
              {
                icon: "🔒",
                title: "Limited Access",
                desc: "Restricted from premium features",
              },
              {
                icon: "⚠️",
                title: "Warning Labels",
                desc: "Low trust indicators on profile",
              },
              {
                icon: "🚫",
                title: "Feature Blocks",
                desc: "Cannot create bands or access networking",
              },
            ].map((impact, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-colors"
              >
                <div className="text-xl">{impact.icon}</div>
                <div>
                  <h5 className="font-medium text-gray-700 dark:text-gray-300">
                    {impact.title}
                  </h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {impact.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Stats */}
      <div
        className={`p-6 border-t ${colors.border} ${isDarkMode ? "bg-gray-900/30" : "bg-gray-50/50"}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaChartLine className="text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Trust score updates daily based on activity
            </span>
          </div>
          <button
            className={`text-sm px-4 py-2 rounded-lg border ${colors.border} ${colors.hoverBg} transition-colors`}
          >
            View full trust breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
