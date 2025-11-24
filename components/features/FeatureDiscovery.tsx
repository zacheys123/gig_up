"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Sparkles, Crown, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { useUserFeatureFlags } from "@/hooks/useUserFeatureFalgs";
interface DiscoverableFeature {
  id: string; // Must match your FeatureFlagKey
  name: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge?: "NEW" | "COMING_SOON";
  category: "sidebar" | "dashboard" | "spotlight";
}

interface FeatureDiscoveryProps {
  features: DiscoverableFeature[];
  variant?: "sidebar" | "dashboard" | "spotlight";
  title?: string;
  showLocked?: boolean;
}

export function FeatureDiscovery({
  features,
  variant = "sidebar",
  title = "Featured Tools",
  showLocked = false,
}: FeatureDiscoveryProps) {
  const { isFeatureEnabled } = useUserFeatureFlags();
  const { user } = useCurrentUser();

  const userRole = (user?.roleType as string) || "all";
  const userTier = user?.tier || "free";

  // Filter features based on feature flags and user role
  const availableFeatures = features.filter((feature) => {
    const isEnabled = isFeatureEnabled(feature.id);
    if (!isEnabled && !showLocked) return false;
    return true;
  });

  if (availableFeatures.length === 0) return null;

  return (
    <div
      className={cn(
        variant === "sidebar" && "space-y-2",
        variant === "dashboard" && "grid grid-cols-1 md:grid-cols-2 gap-4",
        variant === "spotlight" && "grid grid-cols-1 md:grid-cols-3 gap-6"
      )}
    >
      {/* Title */}
      {variant !== "sidebar" && (
        <div
          className={cn(
            "flex items-center gap-2 mb-4",
            variant === "dashboard" && "col-span-full",
            variant === "spotlight" && "col-span-full text-center"
          )}
        >
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
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
        />
      ))}
    </div>
  );
}

function FeatureCard({
  feature,
  variant,
  isEnabled,
  userTier,
}: {
  feature: DiscoverableFeature;
  variant: string;
  isEnabled: boolean;
  userTier: string;
}) {
  const cardContent = (
    <div
      className={cn(
        "group transition-all duration-200 border rounded-lg",
        // Enabled state
        isEnabled && [
          "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
          "hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600",
          "cursor-pointer",
        ],
        // Disabled state
        !isEnabled && [
          "bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600",
          "cursor-not-allowed opacity-70",
        ],
        // Variant sizes
        variant === "sidebar" && "p-3",
        variant === "dashboard" && "p-4",
        variant === "spotlight" && "p-6 text-center"
      )}
    >
      {/* Icon and Badge */}
      <div
        className={cn(
          "flex items-start justify-between mb-3",
          variant === "spotlight" && "flex-col items-center"
        )}
      >
        <div
          className={cn(
            "p-2 rounded-lg",
            isEnabled
              ? "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400"
              : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
          )}
        >
          {feature.icon}
        </div>

        {feature.badge && (
          <span
            className={cn(
              "text-xs px-2 py-1 rounded-full font-semibold",
              feature.badge === "NEW" && "bg-green-500 text-white",
              feature.badge === "COMING_SOON" && "bg-blue-500 text-white"
            )}
          >
            {feature.badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className={variant === "spotlight" ? "space-y-2" : "space-y-1"}>
        <h4
          className={cn(
            "font-semibold",
            isEnabled
              ? "text-gray-900 dark:text-white"
              : "text-gray-500 dark:text-gray-400",
            variant === "sidebar" && "text-sm",
            variant === "dashboard" && "text-base",
            variant === "spotlight" && "text-lg"
          )}
        >
          {feature.name}
        </h4>

        <p
          className={cn(
            isEnabled
              ? "text-gray-600 dark:text-gray-300"
              : "text-gray-400 dark:text-gray-500",
            variant === "sidebar" && "text-xs",
            variant === "dashboard" && "text-sm",
            variant === "spotlight" && "text-base"
          )}
        >
          {feature.description}
        </p>
      </div>

      {/* Action */}
      <div
        className={cn(
          "flex items-center justify-between mt-3",
          variant === "spotlight" && "justify-center"
        )}
      >
        {isEnabled ? (
          <div
            className={cn(
              "flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold",
              variant === "sidebar" && "text-xs",
              variant === "dashboard" && "text-sm",
              variant === "spotlight" && "text-base"
            )}
          >
            Try Now
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        ) : (
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <Lock className="w-3 h-3" />
            <span
              className={cn(
                variant === "sidebar" && "text-xs",
                variant === "dashboard" && "text-sm",
                variant === "spotlight" && "text-sm"
              )}
            >
              Coming Soon
            </span>
          </div>
        )}
      </div>
    </div>
  );

  // Wrap in Link if enabled, otherwise just the card
  return isEnabled ? (
    <Link href={feature.href}>{cardContent}</Link>
  ) : (
    cardContent
  );
}
