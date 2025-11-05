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
}) => {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 288 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="hidden sm:flex sm:flex-col relative border-r flex-shrink-0"
    >
      {/* Glass effect */}
      <div
        className={cn(
          "absolute inset-0 bg-white/80 dark:bg-gray-900/80",
          "backdrop-blur-xl"
        )}
      />

      <nav className="relative flex flex-col items-start px-4 py-6 space-y-2">
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
          <div key={tab.id} className="relative w-full">
            <button
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-3 px-3 py-3 rounded-lg w-full transition-all overflow-hidden group",
                activeTab === tab.id
                  ? "text-white font-semibold"
                  : cn(
                      "text-gray-600 dark:text-gray-300",
                      "hover:text-amber-600 dark:hover:text-amber-400",
                      "hover:bg-amber-500/5 dark:hover:bg-amber-500/10"
                    )
              )}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="sidebarActiveTab"
                  className="absolute inset-0 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25"
                />
              )}
              <span className="relative z-10 text-lg">{tab.icon}</span>
              {!collapsed && (
                <div className="relative z-10 flex-1 text-left">
                  <span className="block font-medium">{tab.label}</span>
                  {tab.description && (
                    <p
                      className={cn(
                        "text-xs mt-1 leading-tight transition-all duration-200",
                        activeTab === tab.id
                          ? "text-amber-100"
                          : "text-gray-500 dark:text-gray-400"
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
                    "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900",
                    "px-3 py-2 rounded-lg shadow-xl text-sm font-medium whitespace-nowrap"
                  )}
                >
                  <div className="font-semibold">{tab.label}</div>
                  {tab.description && (
                    <div className="text-gray-300 dark:text-gray-600 text-xs mt-1 max-w-xs">
                      {tab.description}
                    </div>
                  )}
                </div>
                <div className="absolute right-full top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45" />
                </div>
              </motion.div>
            )}
          </div>
        ))}

        {/* Theme Toggle */}
        <button
          onClick={handleThemeToggle}
          className={cn(
            "relative flex items-center gap-3 px-3 py-3 rounded-lg w-full transition-all group",
            "text-gray-600 dark:text-gray-300",
            "hover:text-amber-600 dark:hover:text-amber-400",
            "hover:bg-amber-500/5 dark:hover:bg-amber-500/10"
          )}
        >
          <Palette className="w-5 h-5" />
          {!collapsed && (
            <div className="flex-1 text-left">
              <span className="block font-medium">Theme</span>
              <p
                className={cn(
                  "text-xs mt-1 leading-tight",
                  "text-gray-500 dark:text-gray-400"
                )}
              >
                Switch between light and dark mode
              </p>
            </div>
          )}
        </button>
      </nav>
    </motion.aside>
  );
};
