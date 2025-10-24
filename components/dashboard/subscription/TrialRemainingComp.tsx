// components/sub/TrialRemainingModal.tsx
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader, // Add this import
  DialogTitle,
} from "@/components/ui/dialog";
import { useSubscriptionStore } from "@/app/stores/useSubscriptionStore";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";

export const TrialRemainingModal = () => {
  const { trialRemainingDays, setTrialRemainingDays } = useSubscriptionStore();
  const { colors, mounted } = useThemeColors();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Show modal every 12 hours when there are trial days remaining
    if (trialRemainingDays !== null && trialRemainingDays > 0) {
      const now = Date.now();
      const lastShownTime = localStorage.getItem("trialModalLastShownTime");
      const twelveHours = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

      // Show modal if we haven't shown it in the last 12 hours
      if (!lastShownTime || now - parseInt(lastShownTime) > twelveHours) {
        setShouldShow(true);
        localStorage.setItem("trialModalLastShownTime", now.toString());

        // Auto-hide after 15 seconds
        const timer = setTimeout(() => {
          setShouldShow(false);
        }, 15000);

        return () => clearTimeout(timer);
      }
    }
  }, [trialRemainingDays]);

  const closeModal = () => {
    setShouldShow(false);
    // Don't reset trialRemainingDays so it can show again tomorrow
  };

  const handleUpgrade = () => {
    closeModal();
    window.location.href = "/dashboard/billing";
  };

  // Don't render until theme is mounted
  if (!mounted) return null;
  if (!shouldShow || trialRemainingDays === null || trialRemainingDays <= 0)
    return null;

  // Dynamic colors based on remaining days
  const getProgressBarColor = () => {
    if (trialRemainingDays > 20) return "bg-green-500";
    if (trialRemainingDays > 10) return "bg-yellow-500";
    if (trialRemainingDays > 5) return "bg-orange-500";
    return "bg-red-500";
  };

  const getDaysTextColor = () => {
    if (trialRemainingDays <= 3) return colors.destructive;
    return colors.successText;
  };

  return (
    <Dialog open={true} onOpenChange={closeModal}>
      <DialogContent className="bg-transparent border-none p-0">
        <div
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center p-6",
            colors.overlay
          )}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
            className={cn(
              "w-[90%] max-w-md sm:max-w-lg rounded-2xl shadow-xl p-6 sm:p-8 text-center space-y-5",
              colors.card,
              colors.cardBorder,
              "border"
            )}
          >
            {/* Add DialogHeader wrapper */}
            <DialogHeader>
              <DialogTitle className={cn("text-2xl font-bold", colors.text)}>
                {trialRemainingDays <= 3
                  ? "Trial Ending Soon! ⏰"
                  : "Trial Active ✨"}
              </DialogTitle>
            </DialogHeader>

            <DialogDescription className={cn("text-base", colors.textMuted)}>
              You have{" "}
              <strong className={getDaysTextColor()}>
                {trialRemainingDays} day{trialRemainingDays > 1 ? "s" : ""}
              </strong>{" "}
              left in your free trial.
              <br />
              {trialRemainingDays <= 3
                ? "Upgrade now to avoid losing access to premium features!"
                : "Don't miss out — unlock premium features today."}
            </DialogDescription>

            {/* Progress bar for visual indication */}
            <div
              className={cn("w-full rounded-full h-2", colors.backgroundMuted)}
            >
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-500",
                  getProgressBarColor()
                )}
                style={{ width: `${(trialRemainingDays / 30) * 100}%` }}
              />
            </div>

            <div className={cn("text-xs", colors.textMuted)}>
              {trialRemainingDays}/30 days remaining
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={closeModal}
                className={cn(
                  "px-6 py-2.5 text-sm sm:text-base rounded-lg border transition-all",
                  colors.border,
                  colors.text,
                  colors.hoverBg
                )}
              >
                Continue Trial
              </button>

              <button
                onClick={handleUpgrade}
                className={cn(
                  "px-6 py-2.5 text-sm sm:text-base rounded-lg bg-gradient-to-r from-green-500 via-blue-500 to-indigo-500 text-white hover:brightness-110 transition-all",
                  colors.textInverted
                )}
              >
                Upgrade Now
              </button>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
