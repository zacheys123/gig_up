"use client";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sun, Moon } from "lucide-react";

interface ThemeModalProps {
  isOpen: boolean;
  toggleDarkMode: () => void;
  themeIsDark: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  toggleDarkMode,
  themeIsDark,
  onClose,
  colors,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={cn(
            "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4",
            "p-4 rounded-2xl border backdrop-blur-xl shadow-2xl",
            colors.card,
            colors.border
          )}
        >
          <div className="flex flex-col items-center gap-4">
            <h3 className={cn("font-semibold text-sm", colors.text)}>
              Theme Settings
            </h3>

            {/* Switch */}
            <div className="flex items-center gap-4">
              <Sun
                className={cn(
                  "w-5 h-5",
                  !themeIsDark ? "text-amber-500" : colors.textMuted
                )}
              />
              <button
                onClick={toggleDarkMode}
                className={cn(
                  "relative w-14 h-8 rounded-full transition-all duration-300",
                  themeIsDark ? "bg-amber-500" : "bg-gray-300 dark:bg-gray-600"
                )}
              >
                <motion.div
                  className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg"
                  initial={false}
                  animate={{ x: themeIsDark ? 26 : 4 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
              <Moon
                className={cn(
                  "w-5 h-5",
                  themeIsDark ? "text-amber-400" : colors.textMuted
                )}
              />
            </div>

            {/* Description */}
            <p className={cn("text-xs text-center max-w-xs", colors.textMuted)}>
              {themeIsDark
                ? "Dark mode is easier on the eyes in low light"
                : "Light mode provides better contrast in bright environments"}
            </p>

            <button
              onClick={onClose}
              className={cn(
                "px-4 py-2 text-xs rounded-lg transition-colors",
                colors.hoverBg,
                colors.text
              )}
            >
              Close
            </button>
          </div>

          {/* Arrow pointing down */}
          <div
            className={cn(
              "absolute -bottom-2 left-1/2 transform -translate-x-1/2",
              "w-4 h-4 rotate-45",
              colors.card,
              colors.border,
              "border-b border-r"
            )}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
