"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useThemeColors, useThemeToggle } from "@/hooks/useTheme";

import { VideoFeed } from "./CommunityFeed";
import { DeputySearch } from "./DeputySearch";
import { MyDeputies } from "./MyDeputies";
import { PendingRequests } from "./PendingRequests";
import { TrendingMusiciansTab } from "./TrendingMusiciansTab";
import { NavigationTabs } from "./NavigationTabs";
import { ThemeModal } from "../modals/ThemeModal";
import { CommunitySidebar } from "./CommunitySidebar";
import {
  ArrowLeft,
  Home,
  Info,
  Users,
  Search,
  Clock,
  TrendingUp,
  UserCheck,
} from "lucide-react";
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
    {
      id: "videos",
      label: "Videos",
      icon: "🎵",
      description:
        "Watch performances and connect through shared musical experiences",
      longDescription:
        "Discover amazing musical performances from our community. Watch videos, engage with content, and connect with musicians through their art.",
    },
    {
      id: "deputies",
      label: "Discover",
      icon: "🔍",
      description: "Find talented musicians to join your team as deputies",
      longDescription:
        "Search our network of skilled musicians ready to back you up. Filter by instrument, location, or specialty to find the perfect deputy for your needs.",
    },
    {
      id: "my-deputies",
      label: "My Team",
      icon: "🤝",
      description: "Manage your current deputies and team members",
      longDescription:
        "View and manage your existing deputy relationships. Coordinate schedules, communicate with your team, and track your musical collaborations.",
    },
    {
      id: "requests",
      label: "Pending Requests",
      icon: "📥",
      hasNotification: true,
      description: "Review and manage incoming deputy requests",
      longDescription:
        "Handle all pending deputy requests in one place. Accept or decline collaboration opportunities and manage your incoming invitations.",
    },
    {
      id: "trending-musicians",
      label: "Trending Musicians",
      icon: "🎤",
      description: "Discover popular and rising musicians in the community",
      longDescription:
        "Explore the most active and popular musicians in our network. Find inspiration and connect with trending artists and performers.",
    },
  ];

  const getTabDescription = (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    return (
      tab?.longDescription ||
      tab?.description ||
      "Explore our musical community"
    );
  };

  const getTabIcon = (tabId: string) => {
    switch (tabId) {
      case "videos":
        return <Home className="w-5 h-5" />;
      case "deputies":
        return <Search className="w-5 h-5" />;
      case "my-deputies":
        return <Users className="w-5 h-5" />;
      case "requests":
        return <Clock className="w-5 h-5" />;
      case "trending-musicians":
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

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
          className="mb-8 sm:mb-12"
        >
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className={cn(
                "p-2 rounded-lg border transition-all duration-200",
                "hover:bg-amber-500 hover:text-white hover:border-amber-500",
                colors.border,
                colors.textMuted
              )}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                  <span className="text-2xl">🎵</span>
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                    Community Hub
                  </h1>
                  <p
                    className={cn(
                      "text-lg mt-2 max-w-2xl leading-relaxed",
                      colors.textMuted
                    )}
                  >
                    Connect with talented musicians, share performances, and
                    build your professional network
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Description Section */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "rounded-2xl p-6 mb-8 border",
              colors.border,
              colors.card
            )}
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "p-3 rounded-xl",
                  "bg-amber-500/10 border border-amber-500/20"
                )}
              >
                {getTabIcon(activeTab)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className={cn("text-2xl font-bold", colors.text)}>
                    {tabs.find((t) => t.id === activeTab)?.label}
                  </h2>
                  <span className="text-2xl">
                    {tabs.find((t) => t.id === activeTab)?.icon}
                  </span>
                </div>
                <p className={cn("text-lg leading-relaxed", colors.textMuted)}>
                  {getTabDescription(activeTab)}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Active Tab Content */}
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
