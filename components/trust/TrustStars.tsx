// components/TrustBasedRateDisplay.tsx - Hybrid RateDisplay with Trust Stars
import React, { memo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { Star, Shield, Zap, Target, CheckCircle } from "lucide-react";
import { TrustStarsDisplay } from "./TrustStarsDisplay";

interface TrustBasedRateDisplayProps {
  musician: any;
  selectedGigType?: string;
  roleType?: string;
  showTrustInfo?: boolean;
  compact?: boolean;
}

export const TrustBasedRateDisplay: React.FC<TrustBasedRateDisplayProps> = memo(
  ({
    musician,
    selectedGigType,
    roleType,
    showTrustInfo = true,
    compact = false,
  }) => {
    const { colors } = useThemeColors();

    // Trust information
    const trustStars = musician.trustStars || 0.5;
    const trustScore = musician.trustScore || 0;
    const canBeBookedDirectly = musician.canBeBookedDirectly || false;
    const isVerified = musician.isVerified || false;
    const isReliable = musician.isReliable || false;

    // Rate information
    const displayRate = musician.displayRate || "Contact for rates";
    const rateConfidence = musician.rateConfidence || "low";

    // Helper function to get rate modifiers based on trust
    const getRateModifiers = useCallback(() => {
      const modifiers = [];

      if (musician.rate?.negotiable) modifiers.push("Negotiable");
      if (musician.rate?.depositRequired) modifiers.push("Deposit Required");
      if (musician.rate?.travelIncluded) modifiers.push("Travel Included");
      if (musician.rate?.travelFee)
        modifiers.push(`+${musician.rate.travelFee} travel`);

      // Trust-based modifiers
      if (canBeBookedDirectly) modifiers.push("Direct Booking");
      if (isVerified) modifiers.push("Verified");
      if (isReliable) modifiers.push("Reliable");

      return modifiers;
    }, [musician, canBeBookedDirectly, isVerified, isReliable]);

    // Get rate confidence color
    const getRateConfidenceColor = () => {
      switch (rateConfidence) {
        case "high":
          return "text-green-600";
        case "medium":
          return "text-amber-600";
        case "low":
          return "text-gray-600";
        default:
          return colors.text;
      }
    };

    // Get trust badge based on trust tier
    const getTrustBadge = () => {
      if (trustStars >= 4.5)
        return {
          icon: Zap,
          label: "Elite",
          color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
          description: "Top-rated professional",
        };
      if (trustStars >= 4.0)
        return {
          icon: Target,
          label: "Trusted",
          color: "bg-green-500/10 text-green-600 border-green-500/20",
          description: "Highly reliable",
        };
      if (trustStars >= 3.0)
        return {
          icon: Shield,
          label: "Verified",
          color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
          description: "Established member",
        };
      if (trustStars >= 2.0)
        return {
          icon: Star,
          label: "Basic",
          color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
          description: "Active member",
        };
      return {
        icon: Star,
        label: "New",
        color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
        description: "Getting started",
      };
    };

    const trustBadge = getTrustBadge();
    const rateModifiers = getRateModifiers();

    if (compact) {
      return (
        <div className="text-right">
          {/* Main Rate */}
          <div className={cn("font-bold", getRateConfidenceColor())}>
            {displayRate}
          </div>

          {/* Trust Stars */}
          <div className="flex items-center justify-end gap-1 mt-1">
            <TrustStarsDisplay
              trustStars={trustStars}
              size="sm"
              showScore={false}
              showTier={false}
            />
            {canBeBookedDirectly && (
              <CheckCircle className="w-3 h-3 text-green-500" />
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {/* Header with Rate and Trust */}
        <div className="flex items-start justify-between">
          <div>
            <div className={cn("font-bold text-lg", getRateConfidenceColor())}>
              {displayRate}
            </div>
            {selectedGigType && (
              <div className={cn("text-xs", colors.textMuted)}>
                for {selectedGigType}
              </div>
            )}
          </div>

          {showTrustInfo && (
            <TrustStarsDisplay
              trustStars={trustStars}
              size="md"
              showScore={true}
              showTier={false}
            />
          )}
        </div>

        {/* Trust Badge */}
        <div
          className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border",
            trustBadge.color
          )}
        >
          <trustBadge.icon className="w-3 h-3" />
          <span className="text-xs font-semibold">{trustBadge.label}</span>
          <span className="text-xs opacity-80">{trustBadge.description}</span>
        </div>

        {/* Trust Score Info */}
        {trustScore > 0 && (
          <div className={cn("text-xs", colors.textMuted)}>
            Trust Score: <span className="font-semibold">{trustScore}</span>
            {isReliable && " • Reliable performer"}
          </div>
        )}

        {/* Rate Modifiers */}
        {rateModifiers.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {rateModifiers.map((modifier, index) => (
              <span
                key={index}
                className={cn(
                  "px-2 py-1 rounded text-xs font-medium border",
                  modifier === "Direct Booking" ||
                    modifier === "Verified" ||
                    modifier === "Reliable"
                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                    : modifier === "Negotiable"
                      ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                      : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                )}
              >
                {modifier}
              </span>
            ))}
          </div>
        )}

        {/* Booking Eligibility */}
        <div
          className={cn(
            "text-xs p-2 rounded-lg border",
            canBeBookedDirectly
              ? "bg-green-500/5 text-green-700 border-green-500/20"
              : "bg-amber-500/5 text-amber-700 border-amber-500/20"
          )}
        >
          <div className="flex items-center gap-2">
            {canBeBookedDirectly ? (
              <>
                <CheckCircle className="w-3 h-3" />
                <span>
                  Direct booking available - {trustStars.toFixed(1)}★ trust
                  rating
                </span>
              </>
            ) : (
              <>
                <Shield className="w-3 h-3" />
                <span>
                  Contact to book - Needs {3.0 - trustStars.toFixed(1)} more
                  stars for direct booking
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
);

TrustBasedRateDisplay.displayName = "TrustBasedRateDisplay";
