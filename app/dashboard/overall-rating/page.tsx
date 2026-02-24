// components/TrustDashboard.tsx
import { useTrustScore } from "@/hooks/useTrustScore";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Lock } from "lucide-react";
import { FeatureName } from "@/lib/trustScoreHelpers";
import { getRoleSpecificFeatures } from "@/components/dashboard/SideBar";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function TrustDashboard() {
  const { trustScore, trustStars, tier, canAccess, improvements, nextFeature } =
    useTrustScore();
  const { user } = useCurrentUser();
  // Define all features in order of thresholds
  // components/TrustDashboard.tsx - Update the features array
  const features = (() => {
    const roleFeatures = getRoleSpecificFeatures(user);
    if (roleFeatures.length > 0) {
      return roleFeatures;
    }

    // Default features if user not loaded
    return [
      { name: "Post Basic Gigs", key: "canPostBasicGigs", score: 10 },
      { name: "Message Users", key: "canMessageUsers", score: 20 },
      { name: "Get Verified", key: "canVerifiedBadge", score: 40 },
      { name: "Enter Competitions", key: "canCompete", score: 45 },
      { name: "View Analytics", key: "canAccessAnalytics", score: 50 },
      { name: "Post Premium Gigs", key: "canPostPremiumGigs", score: 55 },
    ];
  })();

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Trust Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">
                {trustStars.toFixed(1)}
              </div>
              <div className="text-xl">⭐</div>
              <p className="text-sm text-gray-500 mt-2">Trust Stars</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{trustScore}</div>
              <div className="text-sm">/ 100</div>
              <p className="text-sm text-gray-500 mt-2">Detailed Score</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2 capitalize">{tier}</div>
              <Badge variant={tier === "elite" ? "default" : "outline"}>
                {tier.toUpperCase()} TIER
              </Badge>
              <p className="text-sm text-gray-500 mt-2">Current Tier</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Unlocks</CardTitle>
          {nextFeature && (
            <p className="text-sm text-gray-500">
              Next unlock: {nextFeature.feature} at {nextFeature.threshold}{" "}
              points
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {features.map((feature) => {
              const isUnlocked = canAccess(feature.key as FeatureName);
              const isNext = nextFeature?.key === feature.key;

              return (
                <div
                  key={feature.key}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {isUnlocked ? (
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <span
                        className={`font-medium ${isNext ? "text-blue-600" : ""}`}
                      >
                        {feature.name}
                      </span>
                      <p className="text-xs text-gray-500">
                        {feature.score} points required
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isNext && (
                      <Badge variant="outline" className="bg-blue-50">
                        Next
                      </Badge>
                    )}
                    <span
                      className={`text-sm ${isUnlocked ? "text-green-600" : "text-gray-400"}`}
                    >
                      {isUnlocked ? "Unlocked" : "Locked"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Progress Bar to Next Feature */}
      {nextFeature && (
        <Card>
          <CardHeader>
            <CardTitle>Progress to {nextFeature.feature}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Current: {trustScore} points</span>
                <span>Target: {nextFeature.threshold} points</span>
              </div>
              <Progress
                value={Math.min(
                  (trustScore / nextFeature.threshold) * 100,
                  100,
                )}
                className="h-3"
              />
              <p className="text-center text-sm text-gray-600">
                {nextFeature.pointsNeeded} more points needed
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Improvement Tips */}
      {improvements && improvements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Improvement Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {improvements.slice(0, 4).map((tip, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">{tip.action}</span>
                    <Badge variant="secondary">+{tip.points}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{tip.category}</p>
                  {tip.current !== undefined && tip.max !== undefined && (
                    <Progress
                      value={(tip.current / tip.max) * 100}
                      className="h-2"
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
