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
  Heart,
  Building,
  UserPlus,
  FolderOpen,
  Bug,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFeatureFlags } from "@/hooks/useFeatureFlag";
import { useFeatureFlagDebug } from "@/hooks/useFeatureDebug";
import { FeatureFlagDebugger } from "./FeatureFlagsDebug";

// Define proper types for tabs
interface Tab {
  id: string;
  label: string;
  icon: string;
  description: string;
  longDescription: string;
  hasNotification?: boolean;
}

const CommunityMainPage = () => {
  const [activeTab, setActiveTab] = useState("videos");
  const [showThemeToggle, setShowThemeToggle] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const searchParams = useSearchParams();

  const { user } = useCurrentUser();
  const { isDeputyCreationEnabled } = useFeatureFlags();
  useFeatureFlagDebug();
  const { colors, isDarkMode, mounted } = useThemeColors();
  const { toggleDarkMode } = useThemeToggle();
  const [debugOpen, setDebugOpen] = useState(false);

  const urlTab = searchParams.get("tab");

  // Update URL when tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Update URL without reloading the page
    router.push(`/community?tab=${tabId}`, { scroll: false });
  };
  // Also sync state when URL changes (optional but good for direct links)
  React.useEffect(() => {
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab, activeTab]);
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

  const isClient = user?.isClient && !user?.isMusician;
  const isMusician = user?.isMusician;
  const isBooker = user?.isBooker;

  // Base tabs that everyone sees
  const baseTabs: Tab[] = [
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
      id: "trending-musicians",
      label: "Trending Musicians",
      icon: "🎤",
      description: "Discover popular and rising musicians in the community",
      longDescription:
        "Explore the most active and popular musicians in our network. Find inspiration and connect with trending artists and performers.",
    },
  ];

  // Musician-only tabs - Fixed the array structure
  const musicianTabs: Tab[] = [
    ...(isDeputyCreationEnabled(user?.roleType, user?.tier)
      ? [
          {
            id: "deputies",
            label: "Discover",
            icon: "🔍",
            description:
              "Find talented musicians to join your team as deputies",
            longDescription:
              "Search our network of skilled musicians ready to back you up. Filter by instrument, location, or specialty to find the perfect deputy for your needs.",
          } as Tab,

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
        ]
      : []),
  ];

  // Client-only tabs (regular clients)
  const clientTabs: Tab[] = [
    {
      id: "favorites",
      label: "My Favorites",
      icon: "⭐",
      description: "Your saved musicians and preferred performers",
      longDescription:
        "Access your favorite musicians and performers. Quick access to the talent you love working with for future bookings.",
    },
  ];

  // Booker/Manager specific tabs
  const bookerTabs: Tab[] = [
    {
      id: "talent-pool",
      label: "My Talent Pool",
      icon: "👥",
      description: "Manage your curated list of trusted musicians",
      longDescription:
        "Build and maintain your personal talent pool. Save musicians you frequently work with and organize them by skills or projects.",
    },
    {
      id: "band-profiles",
      label: "Band Profiles",
      icon: "🎸",
      description: "Create and manage band lineups and profiles",
      longDescription:
        "Build professional band profiles with specific lineups. Save your go-to combinations for different types of gigs and events.",
    },
    {
      id: "quick-assemble",
      label: "Quick Assemble",
      icon: "⚡",
      description: "Quickly assemble bands for last-minute gigs",
      longDescription:
        "Rapidly put together bands using your talent pool. Filter by availability, location, and instrument to fill gigs efficiently.",
    },
  ];

  // Combine tabs based on user type - Fixed type issues
  const tabs: Tab[] = [
    ...baseTabs,
    ...(isMusician ? musicianTabs : []),
    ...(isClient && !isBooker ? clientTabs : []),
    ...(isBooker ? bookerTabs : []),
  ].filter(Boolean) as Tab[]; // Ensure we filter out any undefined values

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
      case "favorites":
        return <Heart className="w-5 h-5" />;
      case "talent-pool":
        return <UserPlus className="w-5 h-5" />;
      case "band-profiles":
        return <Building className="w-5 h-5" />;
      case "quick-assemble":
        return <FolderOpen className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "videos":
        return <VideoFeed clerkId={user?.clerkId as string} />;
      case "deputies":
        return isMusician ? <DeputySearch user={user} /> : null;
      case "my-deputies":
        return isMusician ? <MyDeputies user={user} /> : null;
      case "requests":
        return isMusician ? <PendingRequests user={user} /> : null;
      case "trending-musicians":
        return <TrendingMusiciansTab user={user} />;
      case "favorites":
        return isClient ? (
          <div className="p-4 text-center">
            <p className={cn("text-lg", colors.textMuted)}>
              Favorites feature coming soon!
            </p>
          </div>
        ) : null;
      case "talent-pool":
        return isBooker ? (
          <div className="p-4 text-center">
            <p className={cn("text-lg", colors.textMuted)}>
              Talent Pool feature coming soon!
            </p>
          </div>
        ) : null;
      case "band-profiles":
        return isBooker ? (
          <div className="p-4 text-center">
            <p className={cn("text-lg", colors.textMuted)}>
              Band Profiles feature coming soon!
            </p>
          </div>
        ) : null;
      case "quick-assemble":
        return isBooker ? (
          <div className="p-4 text-center">
            <p className={cn("text-lg", colors.textMuted)}>
              Quick Assemble feature coming soon!
            </p>
          </div>
        ) : null;
      default:
        return <VideoFeed clerkId={user?.clerkId as string} />;
    }
  };

  const handleThemeToggle = () => {
    toggleDarkMode();
    setShowThemeToggle(false);
  };

  const router = useRouter();

  const getWelcomeMessage = () => {
    if (isBooker) {
      return "Discover talent, build bands, and manage your musical roster efficiently";
    } else if (isClient) {
      return "Discover amazing musicians, save favorites, and find perfect performers";
    } else if (isMusician) {
      return "Connect with talented musicians, share performances, and build your professional network";
    } else {
      return "Connect with talented musicians and share performances";
    }
  };

  return (
    <div className={cn("min-h-screen flex", colors.background)}>
      {/* Desktop Sidebar */}
      <CommunitySidebar
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        handleThemeToggle={handleThemeToggle}
        colors={colors}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isDarkMode={isDarkMode}
      />
      {/* <DebugButton /> */}
      <FeatureFlagDebugger
        isOpen={debugOpen}
        onClose={() => setDebugOpen(false)}
      />
      {/* Main Content */}
      <main
        className={cn("flex-1 px-4 sm:px-6 lg:px-8 py-8", colors.background)}
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
                  <span className="text-2xl">
                    {isBooker ? "📋" : isClient ? "🎭" : "🎵"}
                  </span>
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                    {isBooker ? "Talent Hub" : "Community Hub"}
                  </h1>
                  <p
                    className={cn(
                      "text-lg mt-2 max-w-2xl leading-relaxed",
                      colors.textMuted
                    )}
                  >
                    {getWelcomeMessage()}
                  </p>
                </div>
              </div>
            </div>
          </div>
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
          setActiveTab={handleTabChange}
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
