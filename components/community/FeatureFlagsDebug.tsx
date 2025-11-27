// components/FeatureFlagDebugger.tsx
"use client";

import React, { useState } from "react";

import { useCurrentUser } from "@/hooks/useCurrentUser";

import { Copy, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { FEATURE_FLAGS } from "@/lib/controlled_blocking_features";
import { useFeatureFlagDebug } from "@/hooks/useFeatureDebug";

export const FeatureFlagDebugger: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { user } = useCurrentUser();
  const { debugFeature, debugAllFeatures, featureFlags, isLoading } =
    useFeatureFlagDebug(user?.clerkId, user?.roleType, user?.tier);

  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = async () => {
    const debugData = Object.entries(FEATURE_FLAGS)
      .map(([key, featureKey]) => {
        const result = debugFeature(key as keyof typeof FEATURE_FLAGS);
        return `${key}: ${result?.isEnabled ? "✅" : "❌"}`;
      })
      .join("\n");

    await navigator.clipboard.writeText(debugData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Feature Flag Debugger</h2>
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={debugAllFeatures}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded hover:bg-blue-200 disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh All
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-red-100 rounded hover:bg-red-200"
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-4 overflow-auto max-h-[70vh]">
          <div className="mb-4 p-3 bg-gray-100 rounded">
            <h3 className="font-semibold">User Context</h3>
            <pre className="text-sm">
              {JSON.stringify(
                {
                  userId: user?.clerkId,
                  role: user?.roleType,
                  tier: user?.tier,
                  isMusician: user?.isMusician,
                  isClient: user?.isClient,
                },
                null,
                2
              )}
            </pre>
          </div>

          <div className="grid gap-3">
            {Object.entries(FEATURE_FLAGS).map(([key, featureKey]) => {
              const result = debugFeature(key as keyof typeof FEATURE_FLAGS);

              return (
                <div
                  key={key}
                  className={cn(
                    "p-3 border rounded-lg",
                    result?.isEnabled
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {result?.isEnabled ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-mono text-sm">{key}</span>
                    </div>
                    <button
                      onClick={() =>
                        debugFeature(key as keyof typeof FEATURE_FLAGS)
                      }
                      className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                    >
                      Debug
                    </button>
                  </div>

                  {result?.flag && (
                    <div className="mt-2 text-xs text-gray-600">
                      <div>Target: {result.flag.targetUsers} users</div>
                      <div>
                        Roles: {result.flag.targetRoles?.join(", ") || "all"}
                      </div>
                      <div>Rollout: {result.flag.rolloutPercentage}%</div>
                      <div>
                        Global: {result.flag.enabled ? "Enabled" : "Disabled"}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
