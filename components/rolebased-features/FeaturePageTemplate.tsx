// components/FeaturePageTemplate.tsx
"use client";

import { FeatureGated } from "../features/FeatureGated";

interface FeaturePageTemplateProps {
  featureId: string;
  title: string;
  description: string;
  requiredTier?: string;
  children: React.ReactNode;
}

export function FeaturePageTemplate({
  featureId,
  title,
  description,
  requiredTier,
  children,
}: FeaturePageTemplateProps) {
  return (
    <div className="p-6">
      <FeatureGated
        feature={featureId}
        // In your FeaturePageTemplate, replace the empty fallback:
        fallback={
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">
              Feature Not Available
            </h3>
            <p className="text-gray-600">
              This feature is not available for your account.
            </p>
          </div>
        }
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{description}</p>
        </div>
        {children}
      </FeatureGated>
    </div>
  );
}
