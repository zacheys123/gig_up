"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Palette } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon: string;
  hasNotification?: boolean;
}

interface NavigationTabsProps {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  showThemeToggle: boolean;
  setShowThemeToggle: (state: boolean) => void;
  themeIsDark: boolean;
  handleThemeToggle: () => void;
  colors: Record<string, string>;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  tabs,
  activeTab,
  setActiveTab,
  showThemeToggle,
  setShowThemeToggle,
  themeIsDark,
  handleThemeToggle,
  colors,
}) => {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 border-t z-50",
        "backdrop-blur-lg",
        colors.border,
        colors.card
      )}
    >
      {/* Glass background */}
      <div
        className={cn(
          "absolute inset-0 ",
          colors.background,
          "backdrop-blur-xl"
        )}
      />

      {/* Navigation Items */}
      <nav className="relative flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-col items-center justify-center relative flex-1 py-1 rounded-xl transition-all duration-300 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Active Background */}
            {activeTab === tab.id && (
              <motion.div
                layoutId="bottomNavActive"
                className={cn(
                  "absolute inset-0 rounded-xl",
                  "bg-gradient-to-br from-amber-500 to-orange-500",
                  "shadow-lg shadow-amber-500/25"
                )}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}

            {/* Icon */}
            <div
              className={cn(
                "relative z-10 text-lg",
                activeTab === tab.id
                  ? "text-white scale-110"
                  : "text-gray-500 dark:text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400"
              )}
            >
              {tab.icon}
              {tab.hasNotification && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 border-2 border-white dark:border-gray-900"
                />
              )}
            </div>

            {/* Label */}
            <span
              className={cn(
                "relative z-10 text-[10px] mt-1 transition-all duration-300",
                activeTab === tab.id
                  ? "text-white font-semibold"
                  : "text-gray-500 dark:text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400"
              )}
            >
              {tab.label}
            </span>
          </motion.button>
        ))}

        {/* Theme Button */}
        <motion.button
          onClick={() => setShowThemeToggle(!showThemeToggle)}
          className="flex flex-col items-center justify-center relative flex-1 py-1 rounded-xl transition-all duration-300 group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div
            className={cn(
              "relative z-10 p-1 rounded-xl transition-all duration-300",
              showThemeToggle
                ? "text-amber-600 dark:text-amber-400 scale-110"
                : "text-gray-500 dark:text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400"
            )}
          >
            <Palette className="w-5 h-5" />
          </div>
          <span
            className={cn(
              "relative z-10 text-[10px] mt-1 transition-all duration-300",
              showThemeToggle
                ? "text-amber-600 dark:text-amber-400 font-semibold"
                : "text-gray-500 dark:text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400"
            )}
          >
            Theme
          </span>
        </motion.button>
      </nav>

      {/* iOS safe area */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
};
