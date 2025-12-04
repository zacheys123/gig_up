// app/(dashboard)/vocal-warmups/layout.tsx - FIXED
"use client";

import { FeatureGated } from "@/components/features/FeatureGated";
import { Volume2 } from "lucide-react";

export default function VocalWarmupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FeatureGated
      feature="vocal_warmups"
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 mb-6">
              <Volume2 className="h-10 w-10 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Vocal Warmups
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Professional vocal exercises are available for Premium vocalists.
              Upgrade your account to access these features.
            </p>
            <div className="space-y-3">
              <button className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all">
                Upgrade to Premium
              </button>
              <button className="w-full px-6 py-3 border border-orange-500 text-orange-500 rounded-lg font-semibold hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all">
                Learn More
              </button>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </FeatureGated>
  );
}
