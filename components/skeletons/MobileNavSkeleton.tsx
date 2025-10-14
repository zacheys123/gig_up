"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function MobileNavSkeleton() {
  // Remove useThemeColors hook call - use static colors instead
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 md:hidden">
      <div className="relative h-20">
        {/* Bottom Trigger Button Skeleton */}
        <div className="absolute left-1/2 bottom-4 transform -translate-x-1/2 z-50 flex justify-center w-full">
          <div className="relative">
            <div className="w-16 h-16 bg-gray-400 rounded-full animate-pulse shadow-2xl"></div>
          </div>
        </div>

        {/* Modal Skeleton */}
        <AnimatePresence>
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed bottom-0 left-0 right-0 h-3/4 rounded-t-3xl border-b bg-gray-900 border-gray-700"
          >
            {/* Header Skeleton */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-6 w-32 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-48 bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="w-6 h-6 bg-gray-700 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Navigation Links Skeleton - Vertical */}
            <div className="h-[calc(100%-120px)] overflow-y-auto">
              <div className="p-4 space-y-2">
                {/* Navigation items skeleton */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 w-full p-4 rounded-xl animate-pulse"
                  >
                    <div className="w-5 h-5 bg-gray-700 rounded-full"></div>
                    <div className="h-4 bg-gray-700 rounded flex-1"></div>
                    <div className="w-4 h-4 bg-gray-700 rounded"></div>
                  </div>
                ))}

                {/* Theme Toggle Skeleton */}
                <div className="flex items-center gap-3 w-full p-4 rounded-xl animate-pulse">
                  <div className="w-5 h-5 bg-gray-700 rounded-full"></div>
                  <div className="h-4 bg-gray-700 rounded flex-1"></div>
                  <div className="h-3 bg-gray-700 rounded w-12"></div>
                </div>

                {/* User Profile Skeleton */}
                <div className="flex items-center gap-3 w-full p-4 rounded-xl animate-pulse">
                  <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                  <div className="h-4 bg-gray-700 rounded flex-1"></div>
                  <div className="w-4 h-4 bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default MobileNavSkeleton;
