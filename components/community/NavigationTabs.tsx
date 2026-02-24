"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Palette } from "lucide-react";
import { useRouter } from "next/navigation";
import { useThemeColors } from "@/hooks/useTheme";

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
  colors,
}) => {
  const router = useRouter();
  const { isDarkMode } = useThemeColors();
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    router.push(`/community?tab=${tabId}`, { scroll: false });
  };

  return (
    <div
      className={cn(
        "border-t backdrop-blur-lg",
        isDarkMode
          ? "border-slate-800 bg-slate-950/80"
          : "border-slate-200 bg-white/80",
      )}
    >
      {/* Navigation Items */}
      <nav className="relative flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
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
                  "bg-gradient-to-br from-blue-500 to-indigo-500",
                  "shadow-lg shadow-blue-500/25",
                )}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}

            {/* Icon */}
            <div
              className={cn(
                "relative z-10 text-lg transition-all duration-300",
                activeTab === tab.id
                  ? "text-white scale-110"
                  : isDarkMode
                    ? "text-slate-400 group-hover:text-blue-400"
                    : "text-slate-500 group-hover:text-blue-600",
              )}
            >
              {tab.icon}
              {tab.hasNotification && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 border-2 border-white dark:border-slate-900"
                />
              )}
            </div>

            {/* Label */}
            <span
              className={cn(
                "relative z-10 text-[10px] mt-1 transition-all duration-300 font-medium",
                activeTab === tab.id
                  ? "text-white"
                  : isDarkMode
                    ? "text-slate-400 group-hover:text-blue-400"
                    : "text-slate-500 group-hover:text-blue-600",
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
          {/* Active Background for Theme */}
          {showThemeToggle && (
            <motion.div
              layoutId="bottomNavActive"
              className={cn(
                "absolute inset-0 rounded-xl",
                "bg-gradient-to-br from-blue-500 to-indigo-500",
                "shadow-lg shadow-blue-500/25",
              )}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}

          <div
            className={cn(
              "relative z-10 transition-all duration-300",
              showThemeToggle
                ? "text-white scale-110"
                : isDarkMode
                  ? "text-slate-400 group-hover:text-blue-400"
                  : "text-slate-500 group-hover:text-blue-600",
            )}
          >
            <Palette className="w-5 h-5" />
          </div>
          <span
            className={cn(
              "relative z-10 text-[10px] mt-1 transition-all duration-300 font-medium",
              showThemeToggle
                ? "text-white"
                : isDarkMode
                  ? "text-slate-400 group-hover:text-blue-400"
                  : "text-slate-500 group-hover:text-blue-600",
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
