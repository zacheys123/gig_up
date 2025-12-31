"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Shield,
  TrendingUp,
  Star,
  Users,
  Calendar,
  CheckCircle,
} from "lucide-react";

interface TrustScoreOverlayProps {
  currentScore: number;
  requiredScore: number;
}

const TrustScoreOverlay: React.FC<TrustScoreOverlayProps> = ({
  currentScore,
  requiredScore,
}) => {
  const scoreNeeded = requiredScore - currentScore;

  const improvementTips = [
    {
      icon: <CheckCircle className="w-4 h-4" />,
      text: "Complete your profile (picture, bio, skills)",
      points: 15,
    },
    {
      icon: <Users className="w-4 h-4" />,
      text: "Get verified by connecting payment method",
      points: 20,
    },
    {
      icon: <Calendar className="w-4 h-4" />,
      text: "Complete 2+ gigs successfully",
      points: 10,
    },
    {
      icon: <Star className="w-4 h-4" />,
      text: "Maintain 4+ star average rating",
      points: 15,
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      text: "Stay active for 30+ days",
      points: 10,
    },
  ];

  return (
    <div
      className={cn(
        "mb-4 p-4 rounded-lg border",
        "border-amber-400 bg-amber-50"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-amber-600" />
          </div>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-amber-900 mb-1">
            Trust Score Required
          </h4>
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-amber-700">Your Score:</span>
              <div className="flex-1 h-2 bg-amber-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-600 transition-all duration-500"
                  style={{ width: `${(currentScore / 100) * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold text-amber-900">
                {currentScore}/100
              </span>
            </div>
            <p className="text-sm text-amber-700 mb-2">
              You need <strong>{scoreNeeded} more points</strong> to reach the
              required score of {requiredScore}.
            </p>
          </div>

          <div className="space-y-2 mb-4">
            <p className="text-sm font-medium text-amber-900">
              Ways to improve your trust score:
            </p>
            <div className="space-y-1">
              {improvementTips.map((tip, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="text-amber-600">{tip.icon}</div>
                  <span className="text-sm text-amber-700 flex-1">
                    {tip.text}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                    +{tip.points}pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-amber-600 text-amber-700 hover:bg-amber-50"
              onClick={() => window.open("/profile/trust/guide", "_blank")}
            >
              View Detailed Guide
            </Button>
            <Button
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => window.open("/profile/edit", "_blank")}
            >
              Complete Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustScoreOverlay;
