// components/modals/ThemeModal.tsx - MINIMAL GLASS
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sun, Moon, ChevronUp } from "lucide-react";

interface ThemeModalProps {
  isOpen: boolean;
  toggleDarkMode: () => void;
  themeIsDark: boolean;
  onClose: () => void;
  colors: Record<string, string>;
  position?: string;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  toggleDarkMode,
  themeIsDark,
  onClose,
  colors,
  position,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", damping: 25 }}
            className={cn(
              position === "top"
                ? "absolute -top-2 left-1/2 transform -translate-x-1/2"
                : "absolute top-full left-1/2 transform -translate-x-1/2 mt-2",
              "z-50 p-4 rounded-2xl min-w-[200px]",
              "bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl",
              "border border-white/20 dark:border-gray-800/50",
              "shadow-2xl shadow-black/10",
            )}
          >
            <div className="flex flex-col gap-4">
              {/* Simple Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Dark mode
                </span>
                <button
                  onClick={toggleDarkMode}
                  className={cn(
                    "relative w-12 h-6 rounded-full transition-all duration-300",
                    themeIsDark ? "bg-blue-600" : "bg-gray-300",
                  )}
                >
                  <motion.div
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg"
                    initial={false}
                    animate={{ x: themeIsDark ? 26 : 4 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              {/* Quick Preview */}
              <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-100/50 dark:bg-gray-800/50">
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    themeIsDark
                      ? "bg-gray-800 text-gray-300"
                      : "bg-white text-gray-700",
                  )}
                >
                  Aa
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Preview text contrast
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full py-2 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors"
              >
                Done
              </button>
            </div>

            {/* Arrow */}
            <div
              className={cn(
                "absolute -top-2 left-1/2 transform -translate-x-1/2",
                "text-white/90 dark:text-gray-900/90",
              )}
            >
              <ChevronUp className="w-4 h-4" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
