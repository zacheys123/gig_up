// components/modals/MobileThemeModal.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Moon, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  toggleDarkMode: () => void;
  themeIsDark: boolean;
  colors: any;
}

export function MobileThemeModal({
  isOpen,
  onClose,
  toggleDarkMode,
  themeIsDark,
  colors,
}: MobileThemeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
          />

          {/* Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl p-5 shadow-xl",
              colors.background,
              colors.border,
              "border-t md:hidden",
            )}
            style={{ maxHeight: "90vh" }}
          >
            {/* Handle bar */}
            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-5" />

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className={cn("text-lg font-semibold", colors.text)}>
                Theme Settings
              </h3>
              <button
                onClick={onClose}
                className={cn("p-2 rounded-full", colors.hoverBg)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Theme options */}
            <div className="space-y-4">
              <button
                onClick={() => {
                  if (!themeIsDark) onClose();
                  toggleDarkMode();
                }}
                className={cn(
                  "w-full p-4 rounded-xl flex items-center gap-4 transition-all",
                  !themeIsDark
                    ? "bg-blue-500 text-white"
                    : colors.backgroundMuted,
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-full",
                    !themeIsDark
                      ? "bg-white/20"
                      : "bg-yellow-100 dark:bg-yellow-900/30",
                  )}
                >
                  <Sun
                    className={cn(
                      "w-5 h-5",
                      !themeIsDark
                        ? "text-white"
                        : "text-yellow-600 dark:text-yellow-400",
                    )}
                  />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">Light Mode</p>
                  <p className="text-xs opacity-70">
                    Bright and clean interface
                  </p>
                </div>
                {!themeIsDark && (
                  <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </button>

              <button
                onClick={() => {
                  if (themeIsDark) onClose();
                  toggleDarkMode();
                }}
                className={cn(
                  "w-full p-4 rounded-xl flex items-center gap-4 transition-all",
                  themeIsDark
                    ? "bg-indigo-600 text-white"
                    : colors.backgroundMuted,
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-full",
                    themeIsDark
                      ? "bg-white/20"
                      : "bg-indigo-100 dark:bg-indigo-900/30",
                  )}
                >
                  <Moon
                    className={cn(
                      "w-5 h-5",
                      themeIsDark
                        ? "text-white"
                        : "text-indigo-600 dark:text-indigo-400",
                    )}
                  />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-xs opacity-70">
                    Easy on the eyes at night
                  </p>
                </div>
                {themeIsDark && (
                  <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </button>
            </div>

            {/* Close button */}
            <Button onClick={onClose} variant="outline" className="w-full mt-5">
              Cancel
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
