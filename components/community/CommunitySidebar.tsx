"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Palette, ChevronLeft, ChevronRight } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon: string | React.ReactNode;
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
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 288 }} // 20/72 rem
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

      <nav className="relative flex flex-col items-start px-4 py-6 space-y-3">
        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-4 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg z-20"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative flex items-center gap-3 px-3 py-2 rounded-lg w-full transition-all overflow-hidden",
              activeTab === tab.id
                ? "text-white font-semibold"
                : "text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400"
            )}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="sidebarActiveTab"
                className="absolute inset-0 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25"
              />
            )}
            <span className="relative z-10">{tab.icon}</span>
            {!collapsed && <span className="relative z-10">{tab.label}</span>}
          </button>
        ))}

        {/* Theme Toggle */}
        <button
          onClick={handleThemeToggle}
          className="relative flex items-center gap-3 px-3 py-2 rounded-lg w-full text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-all"
        >
          <Palette className="w-5 h-5 relative z-10" />
          {!collapsed && <span className="relative z-10">Theme</span>}
        </button>
      </nav>
    </motion.aside>
  );
};
