"use client";

import React, { useState } from "react";

import { useSubscription } from "@/hooks/useSubscription";
import { updateSubscription } from "@/lib/mutations";
import useStore from "@/app/zustand/useStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";

interface Plan {
  name: string;
  price: string;
  features: string[];
  cta: string;
  current: boolean;
  tier: "free" | "pro";
}

export interface SubscriptionCardProps {
  plan: Plan;
}

export default function SubscriptionCardBase({ plan }: SubscriptionCardProps) {
  const { user } = useUser();
  const { subscription, mutateSubscription } = useSubscription(
    user?.id as string,
  );
  const { showConfirmModal, setShowConfirmModal } = useStore();
  const [isMutating, setIsMutating] = useState(false);
  const [pendingTier, setPendingTier] = useState<"free" | "pro">("free");

  const handleSubscriptionChange = async (newTier: "free" | "pro") => {
    if (!user?.id) return;
    setIsMutating(true);
    setShowConfirmModal(false);

    const now = new Date();
    const nextBillingDate =
      newTier === "pro" ? new Date(now.setMonth(now.getMonth() + 1)) : null;

    const optimisticData = {
      tier: newTier,
      isPro: newTier === "pro",
      nextBillingDate,
    };

    try {
      await mutateSubscription(
        async () => {
          return await updateSubscription(user.id, newTier);
        },
        {
          optimisticData,
          rollbackOnError: true,
          populateCache: true,
          revalidate: false,
        },
      );
    } catch (error) {
      console.error("Error updating subscription:", error);
    } finally {
      setIsMutating(false);
    }
  };

  const handleClick = () => {
    if (!plan.current && plan.tier === "free") {
      setPendingTier("free");
      setShowConfirmModal(true);
    } else if (!plan.current && plan.tier === "pro") {
      handleSubscriptionChange("pro");
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "border rounded-lg p-4 md:p-6 w-full max-w-md mx-auto",
        plan.current
          ? "border-orange-500 bg-orange-900/10"
          : "border-gray-700 bg-gray-900",
      )}
    >
      <h3 className="text-lg md:text-xl font-semibold text-white">
        {plan.name}
      </h3>
      <p className="text-xl md:text-xl font-bold my-3 md:my-4 text-white">
        {plan.price}
      </p>

      <ul className="space-y-1.5 md:space-y-2 mb-4 md:mb-6">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start text-sm md:text-base">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0">
              <path
                fill="currentColor"
                d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
              />
            </svg>
            <p className="text-xs text-gray-400">{feature}</p>
          </li>
        ))}
      </ul>

      <Button
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        disabled={isMutating || plan.current}
        className={cn(
          "w-full py-1.5 md:py-2 px-3 md:px-4 text-sm md:text-base rounded-md font-medium",
          plan.current
            ? "bg-gray-100 text-gray-600 cursor-default"
            : "bg-blue-600 hover:bg-blue-700 text-white",
          isMutating && "opacity-70 cursor-wait",
        )}
      >
        {isMutating ? "Processing..." : plan.cta}
      </Button>

      {plan.current && (
        <p className="mt-2 text-xs md:text-sm text-green-600 text-center">
          Your current plan
          {subscription?.nextBillingDate && (
            <span className="block text-[10px] md:text-xs text-gray-500">
              Renews on{" "}
              {new Date(subscription?.nextBillingDate).toLocaleDateString()}
            </span>
          )}
        </p>
      )}

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="w-[90%] sm:w-full max-w-md rounded-lg bg-gray-900 p-4 md:p-6 border border-gray-700">
          <DialogTitle className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-white">
            Confirm Downgrade
          </DialogTitle>
          <DialogDescription className="mb-4 md:mb-6 text-gray-300">
            Are you sure you want to switch to the{" "}
            {pendingTier === "free" ? "Free" : "Pro"} Tier?
            {pendingTier === "free" &&
              " You'll lose access to Pro features immediately."}
          </DialogDescription>

          <div className="flex justify-end space-x-2 md:space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleSubscriptionChange(pendingTier)}
              disabled={isMutating}
              className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base"
            >
              {isMutating ? "Processing..." : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
