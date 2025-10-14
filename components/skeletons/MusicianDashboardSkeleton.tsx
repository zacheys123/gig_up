"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeColors } from "@/hooks/useTheme";

export function MusicianDashboardSkeleton({
  isPro = false,
  showUpgradeModal = false,
}: {
  isPro?: boolean;
  showUpgradeModal?: boolean;
}) {
  const { colors } = useThemeColors();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl border overflow-hidden ${colors.card} ${colors.border}`}
    >
      {/* Header Section Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 md:gap-4">
        <div className="space-y-1 sm:space-y-2">
          <div
            className={`h-6 sm:h-7 md:h-8 w-36 sm:w-40 md:w-48 bg-gray-400 rounded-lg animate-pulse ${colors.skeleton}`}
          ></div>
          <div
            className={`h-3 sm:h-4 w-28 sm:w-32 md:w-36 bg-gray-400 rounded animate-pulse ${colors.skeleton}`}
          ></div>
        </div>

        <div
          className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border animate-pulse ${colors.secondaryBackground} ${colors.border}`}
        >
          <div
            className={`h-2 sm:h-3 w-12 sm:w-14 md:w-16 bg-gray-400 rounded ${colors.skeleton}`}
          ></div>
          <div
            className={`h-4 sm:h-5 w-8 sm:w-10 md:w-12 bg-gray-400 rounded-full ${colors.skeleton}`}
          ></div>
        </div>
      </div>

      {/* Content Section Skeleton */}
      <AnimatePresence mode="wait">
        {isPro ? (
          <motion.div
            key="pro-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3 sm:space-y-4"
          >
            {/* Role Status Cards Skeleton */}
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className={`p-3 sm:p-4 rounded-lg border animate-pulse ${colors.card} ${colors.border}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div
                      className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gray-400 rounded-full ${colors.skeleton}`}
                    ></div>
                    <div className="space-y-1">
                      <div
                        className={`h-3 sm:h-4 w-16 sm:w-18 md:w-20 bg-gray-400 rounded ${colors.skeleton}`}
                      ></div>
                      <div
                        className={`h-4 sm:h-5 md:h-6 w-12 sm:w-14 md:w-16 bg-gray-400 rounded ${colors.skeleton}`}
                      ></div>
                    </div>
                  </div>
                  <div
                    className={`h-3 sm:h-4 w-8 sm:w-10 md:w-12 bg-gray-400 rounded ${colors.skeleton}`}
                  ></div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="free-content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex flex-col items-center justify-center p-4 sm:p-5 md:p-6 lg:p-8 rounded-lg border border-dashed text-center animate-pulse ${colors.secondaryBackground} ${colors.border}`}
          >
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-400 rounded-full mb-2 sm:mb-3 md:mb-4 ${colors.skeleton}`}
            ></div>
            <div
              className={`h-4 sm:h-5 w-24 sm:w-28 md:w-32 bg-gray-400 rounded mb-1 sm:mb-2 ${colors.skeleton}`}
            ></div>
            <div className="space-y-1 sm:space-y-2 w-full max-w-md">
              <div
                className={`h-2 sm:h-3 w-full bg-gray-400 rounded ${colors.skeleton}`}
              ></div>
              <div
                className={`h-2 sm:h-3 w-4/5 mx-auto bg-gray-400 rounded ${colors.skeleton}`}
              ></div>
            </div>
            <div
              className={`h-8 sm:h-9 md:h-10 w-24 sm:w-28 md:w-32 bg-gray-400 rounded-full mt-2 sm:mt-3 md:mt-4 ${colors.skeleton}`}
            ></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Skeleton */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className={`pt-3 sm:pt-4 border-t ${colors.border}`}
      >
        <div className="flex items-center justify-between">
          <div
            className={`h-2 sm:h-3 w-24 sm:w-28 md:w-32 bg-gray-400 rounded animate-pulse ${colors.skeleton}`}
          ></div>
          {isPro && (
            <div
              className={`h-2 sm:h-3 w-16 sm:w-20 md:w-24 bg-gray-400 rounded animate-pulse ${colors.skeleton}`}
            ></div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Quick loading state for musician dashboard
export function MusicianDashboardQuickSkeleton() {
  const { colors } = useThemeColors();

  return (
    <div
      className={`space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border ${colors.card} ${colors.border}`}
    >
      {/* Simplified header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1 sm:space-y-2">
          <div
            className={`h-5 sm:h-6 w-32 sm:w-36 md:w-40 bg-gray-400 rounded-lg animate-pulse ${colors.skeleton}`}
          ></div>
          <div
            className={`h-2 sm:h-3 w-24 sm:w-28 md:w-32 bg-gray-400 rounded animate-pulse ${colors.skeleton}`}
          ></div>
        </div>
        <div
          className={`h-5 sm:h-6 w-12 sm:w-14 md:w-16 bg-gray-400 rounded-full animate-pulse ${colors.skeleton}`}
        ></div>
      </div>

      {/* Simplified content */}
      <div className="space-y-2 sm:space-y-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className={`p-2 sm:p-3 rounded-lg border animate-pulse ${colors.card} ${colors.border}`}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className={`w-5 h-5 sm:w-6 sm:h-6 bg-gray-400 rounded-full ${colors.skeleton}`}
              ></div>
              <div className="space-y-1 flex-1">
                <div
                  className={`h-2 sm:h-3 w-12 sm:w-14 md:w-16 bg-gray-400 rounded ${colors.skeleton}`}
                ></div>
                <div
                  className={`h-3 sm:h-4 w-8 sm:w-10 md:w-12 bg-gray-400 rounded ${colors.skeleton}`}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
