"use client";
import { useThemeColors } from "@/hooks/useTheme";
import { motion } from "framer-motion";

export function DashboardSkeleton() {
  const { colors } = useThemeColors();

  return (
    <main className={`min-h-screen ${colors.background}`}>
      {/* Refresh Button Skeleton */}
      <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-10">
        <div
          className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-sm font-medium ${colors.secondaryBackground} animate-pulse`}
        >
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-400 rounded-full"></div>
          <div className="h-2 sm:h-3 w-16 sm:w-20 bg-gray-400 rounded"></div>
        </div>
      </div>

      {/* Last Updated Skeleton */}
      <div className="fixed top-3 left-3 sm:top-4 sm:left-4 z-10">
        <div
          className={`text-xs bg-black/50 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded animate-pulse`}
        >
          <div className="h-2 sm:h-3 w-24 sm:w-28 md:w-32 bg-gray-400 rounded"></div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div
            className={`h-6 sm:h-7 md:h-8 w-48 sm:w-56 md:w-64 bg-gray-400 rounded-lg mb-1 sm:mb-2 animate-pulse ${colors.skeleton}`}
          ></div>
          <div
            className={`h-3 sm:h-4 w-36 sm:w-40 md:w-48 bg-gray-400 rounded animate-pulse ${colors.skeleton}`}
          ></div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className={`p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border ${colors.card} ${colors.border} animate-pulse`}
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                <div
                  className={`h-3 sm:h-4 w-16 sm:w-20 md:w-24 bg-gray-400 rounded ${colors.skeleton}`}
                ></div>
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gray-400 rounded-full ${colors.skeleton}`}
                ></div>
              </div>
              <div
                className={`h-4 sm:h-5 md:h-6 w-12 sm:w-14 md:w-16 bg-gray-400 rounded-lg mb-1 sm:mb-2 ${colors.skeleton}`}
              ></div>
              <div
                className={`h-2 sm:h-3 w-14 sm:w-16 md:w-20 bg-gray-400 rounded ${colors.skeleton}`}
              ></div>
            </div>
          ))}
        </div>

        {/* Charts/Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div
            className={`p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border ${colors.card} ${colors.border} animate-pulse`}
          >
            <div
              className={`h-4 sm:h-5 w-24 sm:w-28 md:w-32 bg-gray-400 rounded mb-2 sm:mb-3 md:mb-4 ${colors.skeleton}`}
            ></div>
            <div
              className={`h-32 sm:h-36 md:h-40 lg:h-48 bg-gray-400 rounded-lg ${colors.skeleton}`}
            ></div>
          </div>
          <div
            className={`p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border ${colors.card} ${colors.border} animate-pulse`}
          >
            <div
              className={`h-4 sm:h-5 w-24 sm:w-28 md:w-32 bg-gray-400 rounded mb-2 sm:mb-3 md:mb-4 ${colors.skeleton}`}
            ></div>
            <div
              className={`h-32 sm:h-36 md:h-40 lg:h-48 bg-gray-400 rounded-lg ${colors.skeleton}`}
            ></div>
          </div>
        </div>

        {/* Recent Activity Skeleton */}
        <div
          className={`p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border ${colors.card} ${colors.border} animate-pulse`}
        >
          <div
            className={`h-4 sm:h-5 w-32 sm:w-36 md:w-40 bg-gray-400 rounded mb-2 sm:mb-3 md:mb-4 ${colors.skeleton}`}
          ></div>
          <div className="space-y-2 sm:space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center gap-2 sm:gap-3">
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gray-400 rounded-full ${colors.skeleton}`}
                ></div>
                <div className="flex-1 space-y-1 sm:space-y-2">
                  <div
                    className={`h-2 sm:h-3 w-3/4 bg-gray-400 rounded ${colors.skeleton}`}
                  ></div>
                  <div
                    className={`h-2 sm:h-3 w-1/2 bg-gray-400 rounded ${colors.skeleton}`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pro Banner Skeleton */}
      <div
        className={`fixed bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 md:left-auto md:right-4 md:bottom-4 md:max-w-md p-2 sm:p-3 md:p-4 rounded-lg border animate-pulse ${colors.skeleton}`}
      >
        <div
          className={`h-3 sm:h-4 w-full bg-gray-400 rounded ${colors.skeleton}`}
        ></div>
      </div>
    </main>
  );
}

// Quick loading version for data refreshes
export function DashboardQuickSkeleton() {
  const { colors } = useThemeColors();

  return (
    <div className={`min-h-screen ${colors.background} relative`}>
      {/* Subtle overlay with loading indicator */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-1 sm:mb-2"></div>
          <div className={`text-xs sm:text-sm ${colors.text}`}>
            Updating data...
          </div>
        </div>
      </div>
    </div>
  );
}
