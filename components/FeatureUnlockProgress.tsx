// components/FeatureUnlockProgress.tsx
import { useTrustScore } from "@/hooks/useTrustScore";

import {
  CheckCircle,
  Lock,
  Shield,
  TrendingUp,
  Trophy,
  Users,
  Video,
} from "lucide-react";
import { StarDisplay } from "./StartDisplay";

interface FeatureCardProps {
  feature: string;
  description: string;
  requiredStars: number;
  unlocked: boolean;
  currentStars: number;
  icon: React.ReactNode;
}

function FeatureCard({
  feature,
  description,
  requiredStars,
  unlocked,
  currentStars,
  icon,
}: FeatureCardProps) {
  const progress = Math.min((currentStars / requiredStars) * 100, 100);

  return (
    <div
      className={`p-4 rounded-lg border ${unlocked ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${unlocked ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
          >
            {icon}
          </div>
          <div>
            <h4 className="font-medium flex items-center gap-2">
              {feature}
              {unlocked ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Lock className="h-4 w-4 text-gray-400" />
              )}
            </h4>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <StarDisplay stars={requiredStars} size="sm" showValue />
            <span className="text-xs text-gray-500">required</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {!unlocked && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function FeatureUnlockProgress() {
  const {
    trustStars,
    canCreateBand,
    canCompete,
    canVideoCall,
    canPostPremiumGigs,
    getStarsNeeded,
  } = useTrustScore();

  const features = [
    {
      id: "verified-badge",
      feature: "Verified Badge",
      description: "Gain credibility with verified status",
      requiredStars: getStarsNeeded("canVerifiedBadge"),
      unlocked: trustStars >= getStarsNeeded("canVerifiedBadge"),
      icon: <Shield className="h-5 w-5" />,
    },
    {
      id: "video-calls",
      feature: "Video Calls",
      description: "Conduct secure video interviews",
      requiredStars: getStarsNeeded("canVideoCall"),
      unlocked: canVideoCall,
      icon: <Video className="h-5 w-5" />,
    },
    {
      id: "create-bands",
      feature: "Create Bands",
      description: "Form and manage musical groups",
      requiredStars: getStarsNeeded("canCreateBand"),
      unlocked: canCreateBand,
      icon: <Users className="h-5 w-5" />,
    },
    {
      id: "compete",
      feature: "Compete",
      description: "Join competitions and battles",
      requiredStars: getStarsNeeded("canCompete"),
      unlocked: canCompete,
      icon: <Trophy className="h-5 w-5" />,
    },
    {
      id: "premium-gigs",
      feature: "Premium Gigs",
      description: "Post high-value gig opportunities",
      requiredStars: getStarsNeeded("canPostPremiumGigs"),
      unlocked: canPostPremiumGigs,
      icon: <TrendingUp className="h-5 w-5" />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Feature Unlocks</h3>
        <div className="flex items-center gap-2">
          <StarDisplay stars={trustStars} size="sm" showValue />
          <span className="text-sm text-gray-600">Current rating</span>
        </div>
      </div>

      <div className="space-y-3">
        {features.map((feat) => (
          <FeatureCard key={feat.id} {...feat} currentStars={trustStars} />
        ))}
      </div>
    </div>
  );
}
