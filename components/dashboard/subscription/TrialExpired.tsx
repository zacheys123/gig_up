// components/sub/TrialExpiredModal.tsx
"use client";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useSubscriptionStore } from "@/app/stores/useSubscriptionStore";

import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";

export const TrialExpiredModal = () => {
  const { showTrialModal, setShowTrialModal } = useSubscriptionStore();
  const { colors, mounted } = useThemeColors();
  const router = useRouter();

  const handleUpgrade = () => {
    setShowTrialModal(false);
    router.push("/dashboard/billing");
  };

  const handleClose = () => {
    setShowTrialModal(false);
  };

  // Don't render until theme is mounted
  if (!mounted) return null;

  return (
    <Dialog open={showTrialModal} onOpenChange={handleClose}>
      <DialogContent className="bg-transparent border-none p-0">
        <div
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center p-6",
            colors.overlay
          )}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className={cn(
              "w-[90%] max-w-md sm:max-w-lg rounded-2xl shadow-xl p-6 sm:p-8 text-center space-y-5",
              colors.card,
              colors.cardBorder,
              "border"
            )}
          >
            <DialogTitle className={cn("text-2xl font-bold", colors.text)}>
              Free Trial Ended 🎉
            </DialogTitle>

            <DialogDescription className={cn("text-base", colors.textMuted)}>
              Your 1-month free trial has ended.
              <br />
              Upgrade now to keep enjoying all premium features.
            </DialogDescription>

            <div className="flex gap-3 justify-center">
              <button
                onClick={handleClose}
                className={cn(
                  "px-6 py-2.5 text-sm sm:text-base rounded-lg border transition-all",
                  colors.border,
                  colors.text,
                  colors.hoverBg
                )}
              >
                Maybe Later
              </button>

              <button
                onClick={handleUpgrade}
                className={cn(
                  "px-6 py-2.5 text-sm sm:text-base rounded-lg bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 text-white hover:brightness-110 transition-all",
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
