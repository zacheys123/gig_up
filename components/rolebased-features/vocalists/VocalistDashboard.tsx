"use client";

import { FeatureGated } from "@/components/features/FeatureGated";
import { useFeatureFlags } from "@/hooks/useFeatureFlag";
import { VocalWarmups } from "./VocalWarmUps";
import { VocalHealthTips } from "./VocalHealthTips";

export const VocalistDashboard: React.FC = () => {
  const { isFeatureEnabled } = useFeatureFlags();

  const canAccessWarmups = isFeatureEnabled("vocal_warmups");
  const canAccessHealthTips = isFeatureEnabled("vocal_health_tips");
  const canAccessExercises = isFeatureEnabled("vocal_exercises_library");

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Vocalist Studio</h1>
          <p className="text-gray-400">Tools and exercises for vocalists</p>
        </div>
      </div>

      {/* Feature-gated sections */}
      <FeatureGated
        feature="vocal_warmups"
        role="vocalist"
        fallback={
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-600 text-center">
            <div className="text-gray-400 mb-2">🎤</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Vocal Warmups
            </h3>
            <p className="text-gray-400">This feature is coming soon!</p>
          </div>
        }
      >
        <VocalWarmups />
      </FeatureGated>

      {/* You can add more feature-gated sections */}
      {canAccessHealthTips && <VocalHealthTips />}

      {/* Show upgrade prompt for pro features */}
      {!canAccessExercises && (
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2">
            Unlock More Vocal Tools
          </h3>
          <p className="text-gray-300 mb-4">
            Upgrade to Pro for access to our full vocal exercises library with
            50+ exercises!
          </p>
          <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all">
            Upgrade to Pro
          </button>
        </div>
      )}
    </div>
  );
};
