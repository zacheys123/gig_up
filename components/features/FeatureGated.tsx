// components/features/FeatureGated.tsx
"use client";

import { useUserFeatureFlags } from "@/hooks/useUserFeatureFalgs";

interface FeatureGatedProps {
  feature: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const FeatureGated: React.FC<FeatureGatedProps> = ({
  feature,
  fallback = null,
  children,
}) => {
  const { isFeatureEnabled, isLoading } = useUserFeatureFlags();

  // Show loading state
  if (isLoading) {
    return <div className="p-4 text-center">Checking access...</div>;
  }

  const canAccess = isFeatureEnabled(feature);

  if (!canAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
