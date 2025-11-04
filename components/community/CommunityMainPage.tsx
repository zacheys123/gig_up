"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useThemeColors, useThemeToggle } from "@/hooks/useTheme"; // Import both from same file

import { VideoFeed } from "./CommunityFeed";
import { DeputySearch } from "./DeputySearch";
import { MyDeputies } from "./MyDeputies";
import { PendingRequests } from "./PendingRequests";
import { TrendingMusiciansTab } from "./TrendingMusiciansTab";
import { NavigationTabs } from "./NavigationTabs";
import { ThemeModal } from "../modals/ThemeModal";
import { CommunitySidebar } from "./CommunitySidebar";
import { ArrowLeft, Home } from "lucide-react";
import { useRouter } from "next/navigation";

const CommunityMainPage = () => {
  const [activeTab, setActiveTab] = useState("videos");
  const [showThemeToggle, setShowThemeToggle] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const { user } = useCurrentUser();
  const { colors, isDarkMode, mounted } = useThemeColors();
  const { toggleDarkMode } = useThemeToggle();

  // Show loading state until theme is mounted
  if (!mounted) {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center",
          colors.background
        )}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const tabs = [
    { id: "videos", label: "Videos", icon: "🎵" },
    { id: "deputies", label: "Discover", icon: "🔍" },
    { id: "my-deputies", label: "My Team", icon: "🤝" },
    { id: "requests", label: "Requests", icon: "📥", hasNotification: true },
    { id: "trending-musicians", label: "Musicians", icon: "🎤" },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case "videos":
        return <VideoFeed clerkId={user?.clerkId as string} />;
      case "deputies":
        return <DeputySearch user={user} />;
      case "my-deputies":
        return <MyDeputies user={user} />;
      case "requests":
        return <PendingRequests user={user} />;
      case "trending-musicians":
        return <TrendingMusiciansTab user={user} />;
      default:
        return <VideoFeed clerkId={user?.clerkId as string} />;
    }
  };

  const handleThemeToggle = () => {
    toggleDarkMode();
    setShowThemeToggle(false);
  };
  const router = useRouter();
  return (
    <div className={cn("min-h-screen flex", colors.background)}>
      {/* Desktop Sidebar */}

      <CommunitySidebar
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleThemeToggle={handleThemeToggle}
        colors={colors}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isDarkMode={isDarkMode}
      />

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 px-4 sm:px-6 lg:px-8 py-8 overflow-auto",
          colors.background
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12 text-center sm:text-left flex gap-7"
        >
          {" "}
          <ArrowLeft
            className={cn("h-10 w-10 text-[20px]", colors.textMuted)}
            size={20}
            onClick={() => router.back()}
          />
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
              <span className="text-2xl">🎵</span>
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Community Hub
              </h1>
              <p
                className={cn(
                  "text-lg mt-3 max-w-2xl leading-relaxed",
                  colors.textMuted
                )}
              >
                Connect with talented musicians, share performances, and build
                your professional network
              </p>
            </div>
          </div>
        </motion.div>

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
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50">
        <NavigationTabs
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          showThemeToggle={showThemeToggle}
          setShowThemeToggle={setShowThemeToggle}
          themeIsDark={isDarkMode}
          handleThemeToggle={handleThemeToggle}
          colors={colors}
        />

        <ThemeModal
          isOpen={showThemeToggle}
          toggleDarkMode={handleThemeToggle}
          themeIsDark={isDarkMode}
          onClose={() => setShowThemeToggle(false)}
          colors={colors}
        />
      </div>
    </div>
  );
};

export default CommunityMainPage;
