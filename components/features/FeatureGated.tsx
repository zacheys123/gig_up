"use client";

import { useFeatureFlags } from "@/hooks/useFeatureFlag";

interface FeatureGatedProps {
  feature: string;
  role?: string;
  tier?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const FeatureGated: React.FC<FeatureGatedProps> = ({
  feature,
  role,
  tier = "free", // default tier
  fallback = null,
  children,
}) => {
  const { isFeatureEnabled } = useFeatureFlags();

  const canAccess = isFeatureEnabled(feature, role, tier);

  if (!canAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
