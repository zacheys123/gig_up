"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Crown, Lock, Calendar } from "lucide-react";

interface CreateLimitOverlayProps {
  showCreateLimitOverlay: boolean;
  isInGracePeriod?: boolean;
}

const CreateLimitOverlay: React.FC<CreateLimitOverlayProps> = ({
  showCreateLimitOverlay,
  isInGracePeriod = false,
}) => {
  if (!showCreateLimitOverlay) return null;

  return (
    <div
      className={cn(
        "mb-4 p-4 rounded-lg border",
        isInGracePeriod
          ? "border-purple-400 bg-purple-50"
          : "border-red-400 bg-red-50"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isInGracePeriod ? "bg-purple-100" : "bg-red-100"
            )}
          >
            {isInGracePeriod ? (
              <Calendar className="w-5 h-5 text-purple-600" />
            ) : (
              <Lock className="w-5 h-5 text-red-600" />
            )}
          </div>
        </div>
        <div className="flex-1">
          <h4
            className={cn(
              "font-semibold mb-1",
              isInGracePeriod ? "text-purple-900" : "text-red-900"
            )}
          >
            {isInGracePeriod
              ? "Grace Period Limit Reached"
              : "Gig Creation Limit Reached"}
          </h4>
          <p
            className={cn(
              "text-sm mb-3",
              isInGracePeriod ? "text-purple-700" : "text-red-700"
            )}
          >
            {isInGracePeriod
              ? "Free users in grace period can only create up to 3 gigs. Upgrade to Pro for unlimited gig creation."
              : "Free users are limited to 3 gigs. Upgrade to Pro for unlimited gig creation and premium features."}
          </p>

          <div
            className={cn(
              "mb-4 p-3 rounded-lg",
              isInGracePeriod ? "bg-purple-100" : "bg-red-100"
            )}
          >
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "text-sm font-medium",
                  isInGracePeriod ? "text-purple-800" : "text-red-800"
                )}
              >
                Pro Tier Benefits:
              </span>
              <Crown
                className={cn(
                  "w-4 h-4",
                  isInGracePeriod ? "text-purple-600" : "text-red-600"
                )}
              />
            </div>
            <ul className="mt-2 space-y-1">
              <li
                className={cn(
                  "text-xs flex items-center gap-1",
                  isInGracePeriod ? "text-purple-700" : "text-red-700"
                )}
              >
                <div className="w-1 h-1 rounded-full bg-current" />
                Unlimited gig creation
              </li>
              <li
                className={cn(
                  "text-xs flex items-center gap-1",
                  isInGracePeriod ? "text-purple-700" : "text-red-700"
                )}
              >
                <div className="w-1 h-1 rounded-full bg-current" />
                Priority visibility
              </li>
              <li
                className={cn(
                  "text-xs flex items-center gap-1",
                  isInGracePeriod ? "text-purple-700" : "text-red-700"
                )}
              >
                <div className="w-1 h-1 rounded-full bg-current" />
                Advanced scheduling options
              </li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "border-current",
                isInGracePeriod
                  ? "text-purple-600 hover:bg-purple-50"
                  : "text-red-600 hover:bg-red-50"
              )}
              onClick={() => window.open("/features/pro", "_blank")}
            >
              View Features
            </Button>
            <Button
              size="sm"
              className={cn(
                "text-white",
                isInGracePeriod
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-red-600 hover:bg-red-700"
              )}
              onClick={() => window.open("/pricing", "_blank")}
            >
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLimitOverlay;
