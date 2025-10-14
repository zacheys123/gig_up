"use client";
import { motion } from "framer-motion";
import BillingComponentSkeleton from "./BillingComponentSkeleton";

export function BillingPageSkeleton() {
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-6 sm:space-y-8 md:space-y-10">
        {/* Header Section Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0"
        >
          <div className="space-y-2">
            <div className="h-6 sm:h-7 md:h-8 w-40 sm:w-48 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="h-3 sm:h-4 w-56 sm:w-64 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 self-end sm:self-auto">
            <div className="h-8 sm:h-9 md:h-10 w-20 sm:w-24 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gray-700 rounded-full animate-pulse"></div>
          </div>
        </motion.div>

        {/* Billing Component Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <BillingComponentSkeleton />
        </motion.div>

        {/* Usage Analytics Section Skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4 sm:space-y-6"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-700 rounded"></div>
            <div className="h-5 sm:h-6 w-32 sm:w-40 bg-gray-700 rounded"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Usage Meter Skeleton */}
            <div className="space-y-4 sm:space-y-6 p-4 sm:p-5 md:p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
              <div className="space-y-1">
                <div className="h-4 sm:h-5 w-28 sm:w-32 bg-gray-700 rounded"></div>
                <div className="h-3 sm:h-4 w-40 sm:w-48 bg-gray-700 rounded"></div>
              </div>
              <div className="space-y-4 sm:space-y-5">
                {[1, 2].map((item) => (
                  <div key={item} className="space-y-2">
                    <div className="h-3 sm:h-4 w-full bg-gray-700 rounded"></div>
                    <div className="h-2 w-3/4 bg-gray-700 rounded-full"></div>
                    <div className="h-3 w-16 sm:w-20 bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart Skeleton - Hidden on mobile, shown on tablet+ */}
            <div className="hidden lg:block p-4 sm:p-5 md:p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
              <div className="space-y-1 mb-3 sm:mb-4">
                <div className="h-4 sm:h-5 w-28 sm:w-32 bg-gray-700 rounded"></div>
                <div className="h-3 sm:h-4 w-40 sm:w-48 bg-gray-700 rounded"></div>
              </div>
              <div className="h-32 sm:h-36 md:h-40 lg:h-48 bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </motion.div>

        {/* Upgrade Tip Skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gray-800/50 rounded-lg sm:rounded-xl border border-gray-700 animate-pulse"
        >
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gray-700 rounded-lg flex-shrink-0"></div>
            <div className="space-y-1 sm:space-y-2 flex-1">
              <div className="h-4 sm:h-5 w-20 sm:w-24 bg-gray-700 rounded"></div>
              <div className="h-3 sm:h-4 w-full bg-gray-700 rounded"></div>
              <div className="h-3 sm:h-4 w-3/4 bg-gray-700 rounded"></div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default BillingPageSkeleton;
