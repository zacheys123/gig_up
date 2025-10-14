"use client";
import React from "react";
import { motion } from "framer-motion";

export function BillingComponentSkeleton() {
  return (
    <div className="w-full">
      <div
        className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 lg:gap-8 
        max-w-xs mx-auto 
        sm:max-w-2xl 
        md:max-w-4xl 
        lg:max-w-5xl xl:max-w-6xl
        sm:grid-cols-2
        px-3 sm:px-4 md:px-6 lg:px-8
      "
      >
        {[1, 2].map((item, index) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="w-full"
          >
            <div className="w-full rounded-xl sm:rounded-2xl border border-gray-600 sm:border-gray-700 bg-gray-800/50 p-4 sm:p-5 md:p-6 lg:p-8 animate-pulse min-h-[320px] sm:min-h-[380px] md:min-h-[420px] lg:min-h-[460px]">
              {/* Header */}
              <div className="text-center mb-4 sm:mb-5 md:mb-6">
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-600 sm:bg-gray-700 rounded-lg sm:rounded-xl"></div>
                  <div className="h-5 sm:h-6 w-16 sm:w-20 bg-gray-600 sm:bg-gray-700 rounded"></div>
                </div>
                <div className="h-6 sm:h-7 md:h-8 w-20 sm:w-24 bg-gray-600 sm:bg-gray-700 rounded-lg mx-auto mb-1 sm:mb-2"></div>
                <div className="h-3 sm:h-4 w-24 sm:w-28 md:w-32 bg-gray-600 sm:bg-gray-700 rounded mx-auto"></div>
              </div>

              {/* Features */}
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5 md:mb-6">
                {[1, 2, 3, 4].map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 sm:gap-3"
                  >
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-600 sm:bg-gray-700 rounded-full flex-shrink-0"></div>
                    <div className="h-3 sm:h-4 bg-gray-600 sm:bg-gray-700 rounded flex-1"></div>
                  </div>
                ))}
              </div>

              {/* Button */}
              <div className="h-10 sm:h-11 md:h-12 bg-gray-600 sm:bg-gray-700 rounded-lg sm:rounded-xl w-full"></div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default BillingComponentSkeleton;
