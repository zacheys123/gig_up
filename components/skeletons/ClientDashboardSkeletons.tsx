"use client";
import { motion } from "framer-motion";

export function ClientDashboardSkeleton({
  isPro = false,
}: {
  isPro?: boolean;
}) {
  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-10 p-3 sm:p-4 md:p-6 lg:p-10 bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] text-white min-h-screen animate-pulse">
      {isPro ? (
        <>
          {/* Pro Badge Skeleton */}
          <div className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-purple-600/20 to-purple-900/10 border border-purple-700/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-md backdrop-blur-md">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-purple-400/30 rounded-full"></div>
            <div className="h-3 sm:h-4 bg-gray-600 rounded w-48 sm:w-56 md:w-64"></div>
          </div>

          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Usage Meter Skeleton */}
            <div className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl sm:rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden">
              <div className="h-4 sm:h-5 bg-gray-600 rounded w-20 sm:w-24 mb-3 sm:mb-4"></div>
              <div className="space-y-2 sm:space-y-3">
                <div className="h-3 sm:h-4 bg-gray-600 rounded w-full"></div>
                <div className="h-2 bg-gray-700 rounded-full w-3/4"></div>
                <div className="h-3 bg-gray-600 rounded w-16 sm:w-20"></div>
              </div>
            </div>

            {/* Gig Chart Skeleton */}
            <div className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl sm:rounded-2xl border border-gray-700 shadow-lg relative overflow-hidden">
              <div className="h-4 sm:h-5 bg-gray-600 rounded w-24 sm:w-28 mb-3 sm:mb-4"></div>
              <div className="space-y-2">
                <div className="h-24 sm:h-28 md:h-32 bg-gray-700 rounded-lg"></div>
                <div className="flex justify-between px-2">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div
                      key={item}
                      className="h-2 sm:h-3 bg-gray-600 rounded w-4 sm:w-5 md:w-6"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Header Skeleton */}
          <div className="space-y-2 group mt-4 sm:mt-6">
            <div className="h-6 sm:h-7 md:h-8 bg-gray-600 rounded w-40 sm:w-48"></div>
            <div className="h-3 sm:h-4 bg-gray-700 rounded w-56 sm:w-64"></div>
          </div>

          {/* Status Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl sm:rounded-2xl border border-slate-700 shadow-lg"
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gray-600 rounded-full"></div>
                    <div className="space-y-1">
                      <div className="h-3 sm:h-4 bg-gray-600 rounded w-24 sm:w-28 md:w-32"></div>
                      <div className="h-4 sm:h-5 md:h-6 bg-gray-500 rounded w-12 sm:w-14 md:w-16"></div>
                    </div>
                  </div>
                  <div className="h-3 sm:h-4 bg-gray-600 rounded w-8 sm:w-10 md:w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <UpgradePromptSkeleton />
      )}
    </div>
  );
}

export function UpgradePromptSkeleton() {
  return (
    <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 border border-gray-600 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl text-center space-y-3 sm:space-y-4 shadow-md animate-pulse">
      <div className="flex items-center justify-center gap-2">
        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-pink-400/30 rounded"></div>
        <div className="h-5 sm:h-6 bg-gray-600 rounded w-28 sm:w-32"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-600 rounded w-full"></div>
        <div className="h-3 bg-gray-600 rounded w-4/5 mx-auto"></div>
      </div>
      <div className="h-9 sm:h-10 bg-gradient-to-r from-pink-500/30 to-purple-600/30 rounded-lg w-28 sm:w-32 mx-auto"></div>
    </div>
  );
}

// Quick loading state for when only specific data is loading
export function ClientDashboardQuickSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-5 md:p-6 bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] rounded-xl sm:rounded-2xl border border-gray-700 animate-pulse">
      {/* Simplified header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1 sm:space-y-2">
          <div className="h-5 sm:h-6 bg-gray-600 rounded w-32 sm:w-36 md:w-40"></div>
          <div className="h-3 bg-gray-700 rounded w-24 sm:w-28 md:w-32"></div>
        </div>
        <div className="h-5 sm:h-6 bg-gray-600 rounded w-12 sm:w-14 md:w-16"></div>
      </div>

      {/* Simplified cards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="p-2 sm:p-3 md:p-4 bg-slate-800 rounded-lg border border-slate-700"
          >
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-gray-600 rounded-full"></div>
              <div className="space-y-1 flex-1">
                <div className="h-2 sm:h-3 bg-gray-600 rounded w-12 sm:w-14 md:w-16"></div>
                <div className="h-3 sm:h-4 bg-gray-500 rounded w-8 sm:w-10 md:w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ClientDashboardSkeleton;
