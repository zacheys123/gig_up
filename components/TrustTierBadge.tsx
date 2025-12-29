// components/TrustScoreBadge.tsx
import { useTrustScore } from "@/hooks/useTrustScore";

import { Shield, Zap, Trophy, Users } from "lucide-react";
import { StarDisplay } from "./StartDisplay";

export function TrustScoreBadge() {
  const { trustStars, tier, getStarsDescription, canAccess } = useTrustScore();

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "elite":
        return "bg-gradient-to-r from-purple-500 to-pink-500";
      case "trusted":
        return "bg-gradient-to-r from-blue-500 to-cyan-500";
      case "verified":
        return "bg-gradient-to-r from-green-500 to-emerald-500";
      case "basic":
        return "bg-gradient-to-r from-yellow-500 to-orange-500";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-600";
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "elite":
        return <Trophy className="h-4 w-4" />;
      case "trusted":
        return <Shield className="h-4 w-4" />;
      case "verified":
        return <Zap className="h-4 w-4" />;
      case "basic":
        return <Users className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border shadow-sm">
      <div className="flex flex-col items-center">
        <StarDisplay stars={trustStars} size="lg" showValue />
        <span className="text-xs text-gray-500 mt-1">
          {getStarsDescription()}
        </span>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getTierColor(tier)}`}
          >
            <div className="flex items-center gap-1">
              {getTierIcon(tier)}
              <span className="capitalize">{tier}</span>
            </div>
          </div>

          {/* Show unlocked features */}
          {canAccess("canVerifiedBadge") && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              ✓ Verified
            </span>
          )}
          {canAccess("canVideoCall") && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              🎥 Video Calls
            </span>
          )}
        </div>

        {/* Feature progress */}
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Next unlock:</span>
            <span className="font-medium">4.5 stars for Elite</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-yellow-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(trustStars / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
