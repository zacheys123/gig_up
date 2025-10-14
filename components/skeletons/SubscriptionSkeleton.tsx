"use client";
import { motion } from "framer-motion";

export function SubscriptionCardSkeleton({
  isPro = false,
}: {
  isPro?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative w-full rounded-2xl border transition-all duration-300 overflow-hidden
        ${
          isPro
            ? "bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600 min-h-[460px]"
            : "bg-gray-800/50 border-gray-700 min-h-[360px]"
        } 
        p-4 sm:p-6 md:p-8 lg:p-8
        animate-pulse
      `}
    >
      {/* Popular Badge Skeleton */}
      {isPro && (
        <div className="absolute -top-2 sm:-top-3 left-1 transform z-10 pt-5">
          <div className="bg-gray-700 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs w-20 h-6"></div>
        </div>
      )}

      {/* Current Plan Badge Skeleton */}
      <div className="absolute -top-2 sm:-top-3 left-1 transform z-10 my-4">
        <div className="bg-gray-700 px-3 py-1 rounded-full text-xs w-16 h-6"></div>
      </div>

      {/* Header */}
      <div className="text-center mb-4 sm:mb-6 md:mb-8 relative z-20">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 rounded-xl"></div>
          <div className="h-6 w-20 bg-gray-700 rounded"></div>
        </div>

        <div className="mb-1 sm:mb-2">
          <div className="h-8 w-24 bg-gray-700 rounded-lg mx-auto"></div>
          <div className="h-4 w-32 bg-gray-700 rounded mx-auto mt-2"></div>
        </div>
      </div>

      {/* Features List */}
      <div className="space-y-2 sm:space-y-3 md:space-y-4 mb-4 sm:mb-6 md:mb-8 relative z-20">
        {[1, 2, 3, 4, 5].map((feature) => (
          <div
            key={feature}
            className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3"
          >
            <div className="w-5 h-5 bg-gray-700 rounded-full flex-shrink-0 mt-0.5"></div>
            <div className="h-4 bg-gray-700 rounded flex-1"></div>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <div className="h-12 bg-gray-700 rounded-xl w-full"></div>

      {/* Savings Badge Skeleton */}
      {isPro && (
        <div className="absolute -bottom-1 sm:-bottom-2 left-1/2 transform -translate-x-1/2 mt-[20px]">
          <div className="bg-gray-700 px-2 sm:px-3 py-1 rounded-full text-xs w-16 h-6"></div>
        </div>
      )}
    </motion.div>
  );
}

export default SubscriptionCardSkeleton;
