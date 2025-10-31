// app/community/page.tsx
"use client";
import React, { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { VideoFeed } from "./CommunityFeed";
import { DeputySearch } from "./DeputySearch";
import { MyDeputies } from "./MyDeputies";
import { PendingRequests } from "./PendingRequests";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const CommunityMainPage = () => {
  const [activeTab, setActiveTab] = useState("videos");
  const { user } = useCurrentUser();
  const { colors, isDarkMode } = useThemeColors();

  const tabs = [
    { id: "videos", label: "🎵 Performance Videos", icon: "🎵" },
    { id: "deputies", label: "👥 Find Deputies", icon: "👥" },
    { id: "my-deputies", label: "🤝 My Deputies", icon: "🤝" },
    { id: "requests", label: "📥 Pending Requests", icon: "📥" },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case "videos":
        return <VideoFeed currentUserId={user?._id} />;
      case "deputies":
        return <DeputySearch user={user} />;
      case "my-deputies":
        return <MyDeputies user={user} />;
      case "requests":
        return <PendingRequests user={user} />;
      default:
        return <VideoFeed currentUserId={user?._id} />;
    }
  };

  return (
    <div className={cn("min-h-screen", colors.background)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center",
                "bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg"
              )}
            >
              <span className="text-2xl">🎵</span>
            </div>
            <div>
              <h1
                className={cn(
                  "text-4xl lg:text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent"
                )}
              >
                Community Hub
              </h1>
              <p
                className={cn(
                  "text-lg mt-3 max-w-2xl mx-auto leading-relaxed",
                  colors.textMuted
                )}
              >
                Connect with talented musicians, share performances, and build
                your professional network
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div
          className={cn(
            "rounded-2xl p-1 mb-8 sticky top-4 z-10 backdrop-blur-md border",
            colors.card,
            colors.border,
            "shadow-lg"
          )}
        >
          <nav className="flex flex-wrap gap-1">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 relative overflow-hidden group",
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                    : cn(
                        colors.textMuted,
                        colors.hoverBg,
                        "hover:text-amber-600 dark:hover:text-amber-400"
                      )
                )}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="whitespace-nowrap">{tab.label}</span>

                {/* Active indicator */}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Hover effect */}
                {activeTab !== tab.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl -z-10" />
                )}
              </motion.button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderActiveTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CommunityMainPage;
