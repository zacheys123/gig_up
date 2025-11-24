// components/FeatureSection.tsx - ENHANCED
"use client";

import { useFeatureFlags } from "@/hooks/useFeatureFlag";

export const FeatureSection: React.FC = () => {
  const { getAvailableFeatures, isFeatureEnabled } = useFeatureFlags();

  // Get newly enabled features (you might want to track "new" status differently)
  const newFeatures = getAvailableFeatures().filter(
    (feature) =>
      isFeatureEnabled(feature.id as any) && feature.rolloutPercentage === 100 // Only show fully rolled out features as "new"
  );

  if (newFeatures.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-6 mb-8">
      <h3 className="text-lg font-semibold text-white mb-4">
        🚀 New Features Available
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {newFeatures.map((feature) => (
          <div
            key={feature.id}
            className="bg-white/5 rounded-lg p-4 border border-white/10"
          >
            <h4 className="font-semibold text-white text-sm mb-2">
              {feature.name}
            </h4>
            <p className="text-gray-300 text-xs">{feature.description}</p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-xs">
                Available for {feature.targetRoles?.join(", ")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
