"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Palette, ChevronLeft, ChevronRight, Info } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon: string | React.ReactNode;
  description?: string;
}

interface CommunitySidebarProps {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  handleThemeToggle: () => void;
  colors: Record<string, string>;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  isDarkMode: boolean;
}

export const CommunitySidebar: React.FC<CommunitySidebarProps> = ({
  tabs,
  activeTab,
  setActiveTab,
  handleThemeToggle,
  colors,
  collapsed,
  setCollapsed,
  isDarkMode,
}) => {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 288 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={cn(
        "hidden sm:flex sm:flex-col relative border-r flex-shrink-0 h-screen sticky top-0",
        colors.border // Apply border color from theme
      )}
    >
      {/* Glass effect with theme colors */}
      <div
        className={cn(
          "absolute inset-0 backdrop-blur-xl",
          colors.card, // Use theme card background
          "bg-opacity-80" // Maintain transparency
        )}
      />

      <nav className="relative flex flex-col items-start px-4 py-6 space-y-2 h-full">
        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-4 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg z-20 hover:bg-amber-600 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "relative flex items-center gap-3 px-3 py-3 rounded-lg w-full transition-all overflow-hidden group",
              activeTab === tab.id
                ? cn(
                    " font-semibold shadow-lg",
                    colors.textMuted,
                    colors.card,
                    // Use theme colors for active state
                    colors.activeBg ||
                      "bg-gradient-to-br from-amber-500 to-orange-500"
                  )
                : cn(
                    colors.textSecondary, // Use theme text color
                    colors.hoverBg, // Use theme hover background
                    colors.backGroundMuted // Keep amber accents
                  )
            )}
          >
            <button
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-3 px-3 py-3 rounded-lg w-full transition-all overflow-hidden group",
                activeTab === tab.id
                  ? cn(
                      " font-semibold shadow-lg",
                      colors.textMuted,
                      // Use theme colors for active state
                      colors.activeBg ||
                        "bg-gradient-to-br from-amber-500 to-orange-500"
                    )
                  : cn(
                      colors.textSecondary, // Use theme text color
                      colors.hoverBg, // Use theme hover background
                      "hover:text-amber-600 dark:hover:text-amber-400" // Keep amber accents
                    )
              )}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="sidebarActiveTab"
                  className={cn(
                    "absolute inset-0 rounded-lg shadow-lg",
                    colors.activeBg ||
                      "bg-gradient-to-br from-amber-500 to-orange-500",
                    colors.activeShadow || "shadow-amber-500/25"
                  )}
                />
              )}
              <span className="relative z-10 text-lg">{tab.icon}</span>
              {!collapsed && (
                <div className="relative z-10 flex-1 text-left">
                  <span
                    className={cn(
                      "block font-medium transition-colors",
                      activeTab === tab.id ? "text-white" : colors.text
                    )}
                  >
                    {tab.label}
                  </span>
                  {tab.description && (
                    <p
                      className={cn(
                        "text-xs mt-1 leading-tight transition-all duration-200",
                        activeTab === tab.id
                          ? "text-amber-100" // Light text for active state
                          : colors.textMuted // Use theme muted text
                      )}
                    >
                      {tab.description}
                    </p>
                  )}
                </div>
              )}
            </button>

            {/* Tooltip for collapsed state */}
            {collapsed && hoveredTab === tab.id && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 z-50"
              >
                <div
                  className={cn(
                    colors.tooltipBg || "bg-gray-900 dark:bg-gray-100",
                    colors.tooltipText || "text-white dark:text-gray-900",
                    "px-3 py-2 rounded-lg shadow-xl text-sm font-medium whitespace-nowrap"
                  )}
                >
                  <div className="font-semibold">{tab.label}</div>
                  {tab.description && (
                    <div
                      className={cn(
                        "text-xs mt-1 max-w-xs",
                        colors.tooltipTextMuted ||
                          "text-gray-300 dark:text-gray-600"
                      )}
                    >
                      {tab.description}
                    </div>
                  )}
                </div>
                <div className="absolute right-full top-1/2 transform -translate-y-1/2">
                  <div
                    className={cn(
                      "w-2 h-2 rotate-45",
                      colors.tooltipBg || "bg-gray-900 dark:bg-gray-100"
                    )}
                  />
                </div>
              </motion.div>
            )}
          </div>
        ))}

        {/* Spacer to push theme toggle to bottom */}
        <div className="flex-1" />

        {/* Theme Toggle */}
        <button
          onClick={handleThemeToggle}
          className={cn(
            "relative flex items-center gap-3 px-3 py-3 rounded-lg w-full transition-all group",
            colors.textSecondary,
            colors.hoverBg,
            "hover:text-amber-600 dark:hover:text-amber-400" // Keep amber accent on hover
          )}
        >
          <Palette className="w-5 h-5" />
          {!collapsed && (
            <div className="flex-1 text-left">
              <span className={cn("block font-medium", colors.text)}>
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </span>
              <p className={cn("text-xs mt-1 leading-tight", colors.textMuted)}>
                Switch to {isDarkMode ? "light" : "dark"} theme
              </p>
            </div>
          )}
        </button>
      </nav>
    </motion.aside>
  );
};
