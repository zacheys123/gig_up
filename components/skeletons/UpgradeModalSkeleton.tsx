"use client";
import { motion } from "framer-motion";
import { useThemeColors } from "@/hooks/useTheme";

export function UpgradeModalSkeleton() {
  const { colors } = useThemeColors();

  return (
    <motion.div
      initial={{ scale: 0.95, y: 10, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 0.95, y: 10, opacity: 0 }}
      transition={{
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
        bounce: 0.4,
      }}
      className={`bg-gradient-to-br rounded-xl sm:rounded-2xl w-[90%] sm:w-[85%] max-w-xs sm:max-w-sm md:max-w-md overflow-hidden border shadow-2xl animate-pulse ${colors.card} ${colors.border}`}
    >
      {/* Header with close button skeleton */}
      <div className="flex justify-end p-3 sm:p-4">
        <div
          className={`w-4 h-4 sm:w-5 sm:h-5 bg-gray-400 rounded-full ${colors.skeleton}`}
        ></div>
      </div>

      {/* Content skeleton */}
      <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8 pt-1 sm:pt-2">
        <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4 md:space-y-5">
          {/* Icon skeleton */}
          <div
            className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-400 rounded-full ${colors.skeleton}`}
          ></div>

          {/* Title and description skeleton */}
          <div className="space-y-2 sm:space-y-3 w-full">
            {/* Title skeleton */}
            <div
              className={`h-5 sm:h-6 w-32 sm:w-36 md:w-40 lg:w-48 mx-auto bg-gray-400 rounded ${colors.skeleton}`}
            ></div>

            {/* Description skeleton */}
            <div className="space-y-1 sm:space-y-2">
              <div
                className={`h-3 sm:h-4 w-full bg-gray-400 rounded ${colors.skeleton}`}
              ></div>
              <div
                className={`h-3 sm:h-4 w-4/5 mx-auto bg-gray-400 rounded ${colors.skeleton}`}
              ></div>
              <div
                className={`h-3 sm:h-4 w-3/5 mx-auto bg-gray-400 rounded ${colors.skeleton}`}
              ></div>
            </div>
          </div>

          {/* Features list skeleton */}
          <div className="w-full space-y-2 sm:space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-gray-700/30"
              >
                <div
                  className={`w-4 h-4 sm:w-5 sm:h-5 bg-gray-400 rounded-full ${colors.skeleton}`}
                ></div>
                <div
                  className={`h-3 sm:h-4 bg-gray-400 rounded flex-1 ${colors.skeleton}`}
                ></div>
              </div>
            ))}
          </div>

          {/* Button skeleton */}
          <div
            className={`h-10 sm:h-11 md:h-12 w-32 sm:w-36 md:w-40 bg-gray-400 rounded-full ${colors.skeleton}`}
          ></div>
        </div>
      </div>

      {/* Footer skeleton */}
      <div
        className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 border-t text-center ${colors.secondaryBackground} ${colors.border}`}
      >
        <div
          className={`h-2 sm:h-3 w-36 sm:w-40 md:w-48 mx-auto bg-gray-400 rounded ${colors.skeleton}`}
        ></div>
      </div>
    </motion.div>
  );
}

// Alternative: More detailed modal skeleton matching your actual modal structure
export function DetailedUpgradeModalSkeleton() {
  const { colors } = useThemeColors();

  return (
    <motion.div
      initial={{ scale: 0.95, y: 10, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 0.95, y: 10, opacity: 0 }}
      transition={{
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
        bounce: 0.4,
      }}
      className={`bg-gradient-to-br rounded-xl sm:rounded-2xl w-[90%] sm:w-[85%] max-w-xs sm:max-w-sm md:max-w-md overflow-hidden border shadow-2xl animate-pulse ${colors.card} ${colors.border}`}
    >
      {/* Header with close button */}
      <div className="flex justify-end p-3 sm:p-4">
        <div
          className={`w-4 h-4 sm:w-5 sm:h-5 bg-gray-400 rounded-full ${colors.skeleton}`}
        ></div>
      </div>

      {/* Main content */}
      <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8 pt-1 sm:pt-2">
        <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4 md:space-y-5">
          {/* Alert icon */}
          <div className="p-2 sm:p-3 bg-yellow-500/10 rounded-full">
            <div
              className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gray-400 rounded-full ${colors.skeleton}`}
            ></div>
          </div>

          {/* Title and text */}
          <div className="space-y-2 sm:space-y-3">
            <div
              className={`h-5 sm:h-6 md:h-7 w-40 sm:w-44 md:w-48 bg-gray-400 rounded-lg mx-auto ${colors.skeleton}`}
            ></div>
            <div className="space-y-1 sm:space-y-2">
              <div
                className={`h-3 sm:h-4 w-full bg-gray-400 rounded ${colors.skeleton}`}
              ></div>
              <div
                className={`h-3 sm:h-4 w-4/5 mx-auto bg-gray-400 rounded ${colors.skeleton}`}
              ></div>
              <div
                className={`h-3 sm:h-4 w-3/4 mx-auto bg-gray-400 rounded ${colors.skeleton}`}
              ></div>
            </div>
          </div>

          {/* Features highlight */}
          <div
            className={`w-full p-3 sm:p-4 rounded-lg sm:rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800`}
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <div
                className={`w-4 h-4 sm:w-5 sm:h-5 bg-gray-400 rounded-full mt-0.5 ${colors.skeleton}`}
              ></div>
              <div className="flex-1 space-y-1 sm:space-y-2 text-left">
                <div
                  className={`h-4 sm:h-5 w-24 sm:w-28 bg-gray-400 rounded ${colors.skeleton}`}
                ></div>
                <div className="space-y-1">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className={`h-3 w-full bg-gray-400 rounded ${colors.skeleton}`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
            {/* Cancel button skeleton */}
            <div
              className={`flex-1 h-10 sm:h-11 bg-gray-400 rounded-lg sm:rounded-xl ${colors.skeleton}`}
            ></div>
            {/* Confirm button skeleton */}
            <div
              className={`flex-1 h-10 sm:h-11 bg-gray-400 rounded-lg sm:rounded-xl ${colors.skeleton}`}
            ></div>
          </div>

          {/* Disclaimer text */}
          <div
            className={`h-2 sm:h-3 w-full bg-gray-400 rounded ${colors.skeleton}`}
          ></div>
        </div>
      </div>

      {/* Footer */}
      <div
        className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 border-t text-center ${colors.secondaryBackground} ${colors.border}`}
      >
        <div
          className={`h-2 sm:h-3 w-40 sm:w-44 md:w-48 mx-auto bg-gray-400 rounded ${colors.skeleton}`}
        ></div>
      </div>
    </motion.div>
  );
}

export default UpgradeModalSkeleton;
