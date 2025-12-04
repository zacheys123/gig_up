"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Palette, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { useRouter } from "next/navigation"; // ADD THIS IMPORT

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
  const router = useRouter(); // ADD THIS

  // Update this function to handle URL updates
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    // Update URL without reloading the page
    router.push(`/community?tab=${tabId}`, { scroll: false });
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 288 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={cn(
        "hidden sm:flex sm:flex-col relative border-r flex-shrink-0 h-screen sticky top-0",
        colors.border,
        colors.navBackground || colors.background
      )}
    >
      {/* Glass effect with theme colors */}
      <div
        className={cn(
          "absolute inset-0 backdrop-blur-xl",
          colors.navBackground || colors.background,
          "bg-opacity-95"
        )}
      />

      <nav className="relative flex flex-col items-start px-4 py-6 space-y-2 h-full">
        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "absolute -right-3 top-4 w-6 h-6 rounded-full flex items-center justify-center shadow-lg z-20 transition-colors",
            colors.primaryBg || "bg-amber-500",
            colors.primaryBgHover || "hover:bg-amber-600",
            "text-white"
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        {tabs.map((tab) => (
          <div key={tab.id} className="relative w-full">
            <button
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              onClick={() => handleTabClick(tab.id)} // CHANGED: Use handleTabClick
              className={cn(
                "relative flex items-center gap-3 px-3 py-3 rounded-lg w-full transition-all overflow-hidden group",
                activeTab === tab.id
                  ? cn(
                      "text-white font-semibold shadow-lg",
                      isDarkMode
                        ? "bg-amber-600 border-amber-500"
                        : "bg-amber-500 border-amber-400"
                    )
                  : cn(
                      colors.text,
                      colors.hoverBg,
                      "border border-transparent",
                      "hover:border-amber-200 dark:hover:border-amber-800",
                      "hover:text-amber-600 dark:hover:text-amber-400"
                    )
              )}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="sidebarActiveTab"
                  className={cn(
                    "absolute inset-0 rounded-lg",
                    isDarkMode
                      ? "bg-amber-600 shadow-amber-500/25"
                      : "bg-amber-500 shadow-amber-500/25"
                  )}
                />
              )}

              {/* Icon - Always visible with proper contrast */}
              <span
                className={cn(
                  "relative z-10 text-lg transition-colors",
                  activeTab === tab.id ? "text-white" : colors.text
                )}
              >
                {tab.icon}
              </span>

              {/* Text content - Only visible when not collapsed */}
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
                          ? "text-amber-100"
                          : colors.textMuted
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
                    colors.card || "bg-white dark:bg-gray-900",
                    colors.text || "text-gray-900 dark:text-gray-100",
                    "px-3 py-2 rounded-lg shadow-xl border text-sm font-medium whitespace-nowrap",
                    colors.border || "border-gray-200 dark:border-gray-700"
                  )}
                >
                  <div className="font-semibold">{tab.label}</div>
                  {tab.description && (
                    <div
                      className={cn(
                        "text-xs mt-1 max-w-xs",
                        colors.textMuted || "text-gray-600 dark:text-gray-400"
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
                      colors.card || "bg-white dark:bg-gray-900",
                      colors.border || "border-gray-200 dark:border-gray-700"
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
            "relative flex items-center gap-3 px-3 py-3 rounded-lg w-full transition-all group border",
            colors.text,
            colors.hoverBg,
            colors.border || "border-gray-200 dark:border-gray-700",
            "hover:border-amber-300 dark:hover:border-amber-600",
            "hover:text-amber-600 dark:hover:text-amber-400"
          )}
        >
          <Palette
            className={cn(
              "w-5 h-5 transition-colors",
              "group-hover:text-amber-600 dark:group-hover:text-amber-400"
            )}
          />
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
