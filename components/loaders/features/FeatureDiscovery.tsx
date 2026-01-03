"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Sparkles, Crown, Lock, ArrowRight, UserCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { DiscoverableFeature } from "@/convex/featureFlagsTypes";

import { useUserFeatureFlags } from "@/hooks/useUserFeatureFalgs";
interface FeatureDiscoveryProps {
  features: DiscoverableFeature[];
  variant?: "sidebar" | "dashboard" | "spotlight" | "mobile";
  title?: string;
  showLocked?: boolean;
  maxFeatures?: number;
}

export function FeatureDiscovery({
  features,
  variant = "sidebar",
  title = "Featured Tools",
  showLocked = false,
  maxFeatures,
}: FeatureDiscoveryProps) {
  const { isFeatureEnabled } = useUserFeatureFlags();
  const { user } = useCurrentUser();
  const { colors } = useThemeColors();

  const userTier = user?.tier || "free";
  // ✅ Fix: Ensure this always returns a boolean

  console.log("🔍 FeatureDiscovery Debug:", {
    userTier,
    userRole: user?.roleType,
    totalFeatures: features.length,
    features: features.map((f) => ({ id: f.id, name: f.name })),
  });
  const isProfileComplete = Boolean(
    user &&
      user.firstTimeInProfile === false &&
      // For musicians: require date of birth + role type
      ((user.isMusician &&
        user.date &&
        user.month &&
        user.year &&
        user.roleType) ||
        // For teachers: require date of birth + role type
        (user.date && user.month && user.year && user.roleType) ||
        // For clients: only require basic profile completion
        (user.isClient && user.firstname) ||
        // For bookers: require basic profile completion
        (user.isBooker && user.firstname))
  );
  // Filter features based on feature flags and user context
  const availableFeatures = features
    .filter((feature) => {
      const isEnabled = isFeatureEnabled(feature.id);
      console.log(`🔍 Filtering ${feature.id}:`, {
        isEnabled,
        userTier,
        availableForTiers: feature.availableForTiers,
        tierMatch: feature.availableForTiers?.includes(userTier),
        showLocked,
      });
      // If not enabled and we're not showing locked features, skip
      if (!isEnabled && !showLocked) return false;

      // Check user tier if specified
      if (
        feature.availableForTiers &&
        !feature.availableForTiers.includes(userTier)
      ) {
        return false;
      }

      // Check profile completion if required
      if (feature.requiresCompleteProfile && !isProfileComplete) {
        return false;
      }

      return true;
    })
    .slice(0, maxFeatures);

  if (availableFeatures.length === 0) return null;

  return (
    <div
      className={cn(
        variant === "sidebar" && "space-y-2",
        variant === "dashboard" && "grid grid-cols-1 md:grid-cols-2 gap-4",
        variant === "spotlight" && "grid grid-cols-1 md:grid-cols-3 gap-6",
        variant === "mobile" && "space-y-3 p-4"
      )}
    >
      {/* Title */}
      {variant !== "sidebar" && (
        <div
          className={cn(
            "flex items-center gap-2 mb-4",
            variant === "dashboard" && "col-span-full",
            variant === "spotlight" && "col-span-full text-center",
            variant === "mobile" && "col-span-full px-2"
          )}
        >
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h3
            className={cn(
              "font-semibold",
              variant === "mobile"
                ? "text-base text-gray-900 dark:text-white"
                : "text-lg text-gray-900 dark:text-white"
            )}
          >
            {title}
          </h3>
        </div>
      )}

      {/* Feature Cards */}
      {availableFeatures.map((feature) => (
        <FeatureCard
          key={feature.id}
          feature={feature}
          variant={variant}
          isEnabled={isFeatureEnabled(feature.id)}
          userTier={userTier}
          isProfileComplete={isProfileComplete}
        />
      ))}
    </div>
  );
}

interface FeatureCardProps {
  feature: DiscoverableFeature;
  variant: string;
  isEnabled: boolean;
  userTier: string;
  isProfileComplete: boolean;
}

function FeatureCard({
  feature,
  variant,
  isEnabled,
  userTier,
  isProfileComplete,
}: FeatureCardProps) {
  const { colors } = useThemeColors();

  const canAccessByTier =
    !feature.availableForTiers || feature.availableForTiers.includes(userTier);
  const canAccessByProfile =
    !feature.requiresCompleteProfile || isProfileComplete;
  const canAccess = isEnabled && canAccessByTier && canAccessByProfile;

  const cardContent = (
    <div
      className={cn(
        "group transition-all duration-200 border rounded-lg",
        // Enabled and accessible state
        canAccess && [
          "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
          "hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600",
          "cursor-pointer",
        ],
        // Disabled or inaccessible state
        !canAccess && [
          "bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600",
          "cursor-not-allowed opacity-70",
        ],
        // Variant sizes
        variant === "sidebar" && "p-3",
        variant === "dashboard" && "p-4",
        variant === "spotlight" && "p-6 text-center",
        variant === "mobile" && "p-4"
      )}
    >
      {/* Icon and Badge */}
      <div
        className={cn(
          "flex items-start justify-between mb-3",
          variant === "spotlight" && "flex-col items-center",
          variant === "mobile" && "items-center mb-4"
        )}
      >
        <div
          className={cn(
            "p-2 rounded-lg",
            canAccess
              ? "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400"
              : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400",
            variant === "mobile" && "p-3"
          )}
        >
          {feature.icon}
        </div>

        {feature.badge && (
          <span
            className={cn(
              "text-xs px-2 py-1 rounded-full font-semibold",
              feature.badge === "NEW" && "bg-green-500 text-white",
              feature.badge === "COMING_SOON" && "bg-blue-500 text-white",
              feature.badge === "PRO" && "bg-amber-500 text-white",
              feature.badge === "PREMIUM" && "bg-purple-500 text-white",
              variant === "mobile" && "text-[10px] px-1.5 py-0.5"
            )}
          >
            {feature.badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          variant === "spotlight" ? "space-y-2" : "space-y-1",
          variant === "mobile" && "space-y-2"
        )}
      >
        <h4
          className={cn(
            "font-semibold",
            canAccess
              ? "text-gray-900 dark:text-white"
              : "text-gray-500 dark:text-gray-400",
            variant === "sidebar" && "text-sm",
            variant === "dashboard" && "text-base",
            variant === "spotlight" && "text-lg",
            variant === "mobile" && "text-base"
          )}
        >
          {feature.name}
        </h4>

        <p
          className={cn(
            canAccess
              ? "text-gray-600 dark:text-gray-300"
              : "text-gray-400 dark:text-gray-500",
            variant === "sidebar" && "text-xs",
            variant === "dashboard" && "text-sm",
            variant === "spotlight" && "text-base",
            variant === "mobile" && "text-sm leading-relaxed"
          )}
        >
          {feature.description}
        </p>
      </div>

      {/* Action & Status */}
      <div
        className={cn(
          "flex items-center justify-between mt-3",
          variant === "spotlight" && "justify-center",
          variant === "mobile" && "mt-4"
        )}
      >
        {canAccess ? (
          <div
            className={cn(
              "flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold",
              variant === "sidebar" && "text-xs",
              variant === "dashboard" && "text-sm",
              variant === "spotlight" && "text-base",
              variant === "mobile" && "text-sm"
            )}
          >
            Try Now
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        ) : (
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            {!isEnabled && <Lock className="w-3 h-3" />}
            {!canAccessByTier && <Crown className="w-3 h-3" />}
            {!canAccessByProfile && <UserCheck className="w-3 h-3" />}

            <span
              className={cn(
                variant === "sidebar" && "text-xs",
                variant === "dashboard" && "text-sm",
                variant === "spotlight" && "text-sm",
                variant === "mobile" && "text-xs"
              )}
            >
              {!isEnabled && "Coming Soon"}
              {!canAccessByTier && "Upgrade Required"}
              {!canAccessByProfile && "Complete Profile"}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  // Wrap in Link if fully accessible, otherwise show as disabled card
  return canAccess ? (
    <Link href={feature.href}>{cardContent}</Link>
  ) : (
    cardContent
  );
}
