"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Activity,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  ActiveProjects,
  AllGigs,
  ClientPreBooking,
  CrewManagement,
  MyGigs,
  PaymentHistory,
  ReviewedGigs,
  SavedGigs,
  InstantGigs,
  GigInvites,
  GigsLoadingSkeleton,
} from "./_components";
import { Applications } from "./_components/Application";
import { FavoriteGigs } from "./_components/FavouriteGigs";
import { ThemeModal } from "@/components/modals/ThemeModal";
import { useThemeColors, useThemeToggle } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { ArrowLeft, Moon, Video, RefreshCw, Clock, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCheckTrial } from "@/hooks/useCheckTrial";
import { UpgradeBanner } from "./_components/UpgradeBlock";
import Link from "next/link";
import { PendingGig } from "./_components/PendingGig";
import { BookedGigs } from "./_components/BookedGigs";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { LiveTv } from "@mui/icons-material";
import { usePathname } from "next/navigation";
import { MobileThemeModal } from "@/components/modals/MobileThemeModal";
// ============= HELPER FUNCTIONS =============

const getUserSubtitle = (user: any) => {
  if (!user) return "Manage your gigs and opportunities";

  const userTier = user?.tier || "free";
  const isFreeUser = userTier === "free";
  const isInGracePeriod = user?.isInGracePeriod || false;
  const tierDisplay = userTier.charAt(0).toUpperCase() + userTier.slice(1);

  // Musician only
  if (user.isMusician && !user.isClient && !user.isBooker) {
    return isFreeUser && !isInGracePeriod
      ? `Find gigs and manage bookings • ${tierDisplay} Plan • Upgrade for premium features`
      : `Find gigs, manage bookings, and grow your career • ${tierDisplay} Plan`;
  }

  // Client only
  if (user.isClient && !user.isMusician && !user.isBooker) {
    return isFreeUser && !isInGracePeriod
      ? `Post gigs and find talent • ${tierDisplay} Plan • Upgrade for instant booking & crew management`
      : `Post gigs, find talent, and manage your events • ${tierDisplay} Plan`;
  }

  // Booker only
  if (user.isBooker && !user.isMusician && !user.isClient) {
    return isFreeUser && !isInGracePeriod
      ? `Manage projects and find opportunities • ${tierDisplay} Plan • Upgrade for advanced features`
      : `Manage projects, build crews, and find opportunities • ${tierDisplay} Plan`;
  }

  // Multi-role users
  if (user.isMusician && user.isClient) {
    return isFreeUser && !isInGracePeriod
      ? `Switch between musician and client roles • ${tierDisplay} Plan • Upgrade for premium features`
      : `Switch between musician and client roles with full access • ${tierDisplay} Plan`;
  }

  if (user.isBooker && (user.isMusician || user.isClient)) {
    return isFreeUser && !isInGracePeriod
      ? `Multi-role access • ${tierDisplay} Plan • Upgrade for advanced management tools`
      : `Multi-role access with advanced management tools • ${tierDisplay} Plan`;
  }

  // Default fallback
  return isFreeUser && !isInGracePeriod
    ? `Manage your gigs and opportunities • ${tierDisplay} Plan • Upgrade for premium features`
    : `Manage your gigs and opportunities • ${tierDisplay} Plan`;
};
const getUserGigTabs = (user: any) => {
  const userTier = user?.tier || "free";
  const isFreeUser = userTier === "free";
  const showLockIcon = (feature: string) =>
    isFreeUser && !user?.isInGracePeriod;

  // Musician only
  if (user.isMusician && !user.isClient && !user.isBooker) {
    return {
      tabs: [
        { id: "pending", label: "⏳ Pending", icon: "⏳" },
        { id: "booked", label: "✅ Booked", icon: "✅" },
        { id: "all", label: "🎵 All Gigs", icon: "🎵" },
        { id: "favorites", label: "⭐ Favorites", icon: "⭐" },
        { id: "saved", label: "💾 Saved", icon: "💾" },
        { id: "reviewed", label: "📝 Reviewed", icon: "📝" },
        {
          id: "payments",
          label: "💰 Payments",
          icon: "💰",
          badge: "new",
        },
        {
          id: "invites",
          label: showLockIcon("gig-invites") ? "🔒 Invites" : "📨 Invites",
          icon: showLockIcon("gig-invites") ? "🔒" : "📨",
        },
      ],
      defaultTab: "pending",
    };
  }

  // Client only
  if (user.isClient && !user.isMusician && !user.isBooker) {
    return {
      tabs: [
        { id: "my-gigs", label: "📋 My Gigs", icon: "📋" },
        { id: "pre-booking", label: "👥 Pre-Booking", icon: "👥" },
        { id: "booked", label: "✅ Booked", icon: "✅" },
        { id: "reviewed", label: "⭐ Reviewed", icon: "⭐" },
        {
          id: "payments",
          label: "💰 Payments",
          icon: "💰",
          badge: "new",
        },
        {
          id: "invites",
          label: showLockIcon("gig-invites") ? "🔒 Invites" : "📨 Invites",
          icon: showLockIcon("gig-invites") ? "🔒" : "📨",
        },
        {
          id: "crew-management",
          label: showLockIcon("crew-management")
            ? "Crew Management"
            : " Management",
          icon: showLockIcon("crew-management") ? "🔒" : "👥",
        },
        {
          id: "create-gigs",
          label: showLockIcon("instant-gigs")
            ? "🔒 Create Gigs"
            : "⚡ Create Gigs",
          icon: showLockIcon("instant-gigs") ? "🔒" : "⚡",
        },
      ],
      defaultTab: "my-gigs",
    };
  }

  // Multi-role users (both musician and client)
  if (user.isBoth || (user.isMusician && user.isClient)) {
    return {
      tabs: [
        { id: "musician", label: "🎵 As Musician" },
        { id: "client", label: "🎯 As Client" },
        { id: "booker", label: "📊 As Booker" },
        { id: "involved", label: "✅ Involved" },
      ],
      defaultTab: "musician",
    };
  }

  // Default fallback
  return {
    tabs: [
      { id: "all", label: "🎵 All Gigs" },
      { id: "booked", label: "✅ Booked" },
    ],
    defaultTab: "all",
  };
};

const renderGigContent = (
  user: any,
  activeTab: string,
  isInGracePeriod: boolean,
) => {
  const userTier = user?.tier || "free";
  const isFreeUser = userTier === "free";

  const requiresUpgrade = (feature: string) => {
    return isFreeUser && !isInGracePeriod;
  };

  // Multi-role users
  if (user.isBoth) {
    switch (activeTab) {
      case "musician":
        return <AllGigs user={user} />;
      case "client":
        return <MyGigs user={user} />;
      case "involved":
        return <BookedGigs user={user} />;
      case "payments":
        return <PaymentHistory user={user} />; // Add payments for both roles
      case "booker":
        if (requiresUpgrade("applications")) {
          return (
            <UpgradeBanner
              featureName="applications"
              userTier={userTier}
              userRole="booker"
            />
          );
        }
        return <Applications user={user} />;
      default:
        return <AllGigs user={user} />;
    }
  }

  // Musicians (already has payments)
  if (user.isMusician) {
    switch (activeTab) {
      case "pending":
        return <PendingGig user={user} />;
      case "booked":
        return <BookedGigs user={user} />;
      case "all":
        return <AllGigs user={user} />;
      case "favorites":
        return <FavoriteGigs user={user} />;
      case "saved":
        return <SavedGigs user={user} />;
      case "reviewed":
        return <ReviewedGigs user={user} />;
      case "payments": // Already exists for musicians
        return <PaymentHistory user={user} />;
      case "invites":
        if (requiresUpgrade("gig-invites")) {
          return (
            <UpgradeBanner
              featureName="gig-invites"
              userTier={userTier}
              userRole="musician"
            />
          );
        }
        return <GigInvites user={user} />;
      case "involved":
        return <BookedGigs user={user} />;
      default:
        return <AllGigs user={user} />;
    }
  }

  // Clients (ADDED PAYMENTS TAB)
  if (user.isClient) {
    switch (activeTab) {
      case "my-gigs":
        return <MyGigs user={user} />;
      case "pre-booking":
        return <ClientPreBooking user={user} />;
      case "booked":
        return <BookedGigs user={user} />;
      case "reviewed":
        return <ReviewedGigs user={user} />;
      case "payments": // NEW: Payments for clients
        return <PaymentHistory user={user} />;
      case "crew-management":
        if (requiresUpgrade("crew-management")) {
          return (
            <UpgradeBanner
              featureName="crew-management"
              userTier={userTier}
              userRole="client"
            />
          );
        }
        return <CrewManagement user={user} />;
      case "invites":
        if (requiresUpgrade("gig-invites")) {
          return (
            <UpgradeBanner
              featureName="gig-invites"
              userTier={userTier}
              userRole="client"
            />
          );
        }
        return <GigInvites user={user} />;
      case "create-gigs":
        if (requiresUpgrade("instant-gigs")) {
          return (
            <UpgradeBanner
              featureName="instant-gigs"
              userTier={userTier}
              userRole="client"
            />
          );
        }
        return <InstantGigs user={user} />;
      case "involved":
        return <BookedGigs user={user} />;
      default:
        return <MyGigs user={user} />;
    }
  }

  // Bookers (already has payments)
  if (user.isBooker) {
    switch (activeTab) {
      case "applications":
        if (requiresUpgrade("applications")) {
          return (
            <UpgradeBanner
              featureName="applications"
              userTier={userTier}
              userRole="booker"
            />
          );
        }
        return <Applications user={user} />;
      case "active-projects":
        if (requiresUpgrade("active-projects")) {
          return (
            <UpgradeBanner
              featureName="active-projects"
              userTier={userTier}
              userRole="booker"
            />
          );
        }
        return <ActiveProjects user={user} />;
      case "crew-management":
        if (requiresUpgrade("crew-management")) {
          return (
            <UpgradeBanner
              featureName="crew-management"
              userTier={userTier}
              userRole="booker"
            />
          );
        }
        return <CrewManagement user={user} />;
      case "available-gigs":
        return <AllGigs user={user} />;
      case "payments":
        return <PaymentHistory user={user} />;
      case "involved":
        return <BookedGigs user={user} />;
      default:
        if (requiresUpgrade("applications")) {
          return (
            <UpgradeBanner
              featureName="applications"
              userTier={userTier}
              userRole="booker"
            />
          );
        }
        return <Applications user={user} />;
    }
  }

  return <div>No gig content available</div>;
};
// ============= LOADING SKELETON =============

const SimpleLoadingSkeleton = () => (
  <div className="space-y-6 p-4 animate-pulse">
    <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
    <div className="grid grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-24 bg-gray-200 dark:bg-gray-700 rounded"
        ></div>
      ))}
    </div>
    <div className="grid grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-40 bg-gray-200 dark:bg-gray-700 rounded"
        ></div>
      ))}
    </div>
  </div>
);

// ============= MAIN COMPONENT =============

export default function GigsHub() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();
  const [activeTab, setActiveTab] = useState("all");
  const [showThemeModal, setShowThemeModal] = useState(false);
  const { isInGracePeriod } = useCheckTrial();

  // Simple refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Use theme hooks
  const { colors, isDarkMode } = useThemeColors();
  const { toggleDarkMode } = useThemeToggle();
  const pathname = usePathname();
  // Auto-refresh every 30 seconds - SILENT (no toast)
  useEffect(() => {
    const interval = setInterval(() => {
      // Just update the timestamp and show spinner briefly
      setIsRefreshing(true);
      setLastRefresh(new Date());

      // Hide spinner after 500ms
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Manual refresh handler - WITH TOAST
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      setLastRefresh(new Date());
      toast.success("Refreshed!");
    } catch (error) {
      toast.error("Refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Memoize user data
  const memoizedUser = useMemo(
    () => user,
    [user?._id, user?.tier, user?.isMusician, user?.isClient, user?.isBooker],
  );

  // Memoize tabs
  const { tabs, defaultTab } = useMemo(
    () =>
      memoizedUser
        ? getUserGigTabs(memoizedUser)
        : { tabs: [], defaultTab: "all" },
    [memoizedUser],
  );

  // Handle URL tab
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tabs.some((t) => t.id === tab)) {
      setActiveTab(tab);
    } else if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [searchParams, defaultTab, tabs]);

  // Tab change handler
  const handleTabChange = useCallback(
    (tab: string) => {
      setActiveTab(tab);
      router.push(`/hub/gigs?tab=${tab}`, { scroll: false });
    },
    [router],
  );

  if (isLoading || !memoizedUser) {
    return <SimpleLoadingSkeleton />;
  }

  return (
    <div
      className={cn(
        "h-screen flex flex-col overflow-hidden",
        colors.background,
      )}
    >
      {/* FIXED HEADER - No scroll */}
      <div className="flex-shrink-0 z-50 ">
        {/* Top bar with back button and refresh */}
        <div
          className={cn(
            "hidden border-b md:flex justify-center items-center",
            colors.border,
            colors.navText,
            "backdrop-blur-md",
          )}
        >
          <ThemeModal
            isOpen={showThemeModal}
            onClose={() => setShowThemeModal(false)}
            toggleDarkMode={toggleDarkMode}
            themeIsDark={isDarkMode}
            colors={colors}
          />
        </div>

        {/* Mobile Theme Modal */}
        <MobileThemeModal
          isOpen={showThemeModal}
          onClose={() => setShowThemeModal(false)}
          toggleDarkMode={toggleDarkMode}
          themeIsDark={isDarkMode}
          colors={colors}
        />

        {/* Tabs section */}
        <div className={cn("border-b", colors.border, colors.card)}>
          <div className="max-w-7xl mx-auto px-4">
            {/* Regular header content */}
            <div className="py-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    colors.hoverBg,
                  )}
                >
                  <ArrowLeft className={cn("w-4 h-4", colors.text)} />
                </button>
                <h1 className={cn("text-xl font-bold mb-1", colors.text)}>
                  gigUp
                </h1>
              </div>

              <p className={cn("text-sm mb-4", colors.textMuted)}>
                {getUserSubtitle(memoizedUser)}
              </p>

              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
                  "border shadow-sm backdrop-blur-sm",
                  isDarkMode
                    ? "bg-slate-900/50 border-slate-700"
                    : "bg-white/50 border-slate-200",
                  memoizedUser.isMusician && [
                    isDarkMode
                      ? "text-emerald-300 bg-emerald-900/20 border-emerald-800/50"
                      : "text-emerald-700 bg-emerald-50 border-emerald-200",
                  ],
                  memoizedUser.isClient && [
                    isDarkMode
                      ? "text-blue-300 bg-blue-900/20 border-blue-800/50"
                      : "text-blue-700 bg-blue-50 border-blue-200",
                  ],
                  !memoizedUser.isMusician &&
                    !memoizedUser.isClient && [
                      isDarkMode
                        ? "text-purple-300 bg-purple-900/20 border-purple-800/50"
                        : "text-purple-700 bg-purple-50 border-purple-200",
                    ],
                )}
              >
                {/* Role icon */}
                <span className="text-base">
                  {memoizedUser.isMusician
                    ? "🎵"
                    : memoizedUser.isClient
                      ? "🎯"
                      : "📊"}
                </span>

                {/* Role text */}
                <span>
                  {memoizedUser.isMusician
                    ? "Musician"
                    : memoizedUser.isClient
                      ? "Client"
                      : "Booker"}
                </span>

                {/* Optional: Add a subtle dot indicator */}
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    memoizedUser.isMusician
                      ? "bg-emerald-500"
                      : memoizedUser.isClient
                        ? "bg-blue-500"
                        : "bg-purple-500",
                  )}
                />
              </span>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Refresh button with premium shadows */}
                  <div className="relative group">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className={cn(
                        "relative gap-2.5 px-4 rounded-xl transition-all duration-300",
                        "hover:scale-105 active:scale-95",
                        isDarkMode
                          ? "bg-slate-900/90 backdrop-blur-md border border-slate-800/80 text-slate-200 hover:text-white hover:bg-slate-800/90 hover:border-slate-700 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.8)] hover:shadow-[0_12px_20px_-8px_rgba(0,0,0,0.9)]"
                          : "bg-white/90 backdrop-blur-md border border-slate-200/80 text-slate-700 hover:text-slate-900 hover:bg-white hover:border-slate-300 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_20px_-8px_rgba(0,0,0,0.15)]",
                        isRefreshing &&
                          isDarkMode &&
                          "opacity-80 cursor-wait border-blue-800/50 shadow-blue-900/30",
                      )}
                    >
                      {/* Inner glow effect - only in dark mode */}
                      {isDarkMode && (
                        <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}

                      <RefreshCw
                        className={cn(
                          "w-4 h-4 transition-all duration-500",
                          isRefreshing
                            ? "animate-spin text-blue-400"
                            : "group-hover:rotate-180",
                          isDarkMode
                            ? "text-slate-400 group-hover:text-blue-400"
                            : "text-slate-500 group-hover:text-blue-500",
                        )}
                      />

                      <span className="text-sm font-medium">Refresh</span>

                      {/* Last refresh time with enhanced shadows */}
                      <span
                        className={cn(
                          "hidden md:inline-flex items-center text-xs ml-1.5 px-2.5 py-0.5 rounded-full",
                          isDarkMode
                            ? "bg-slate-800/90 backdrop-blur-sm border border-slate-700 text-slate-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"
                            : "bg-slate-100 border border-slate-200 text-slate-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]",
                        )}
                      >
                        <Clock
                          className={cn(
                            "w-3 h-3 mr-1.5",
                            isDarkMode ? "text-slate-500" : "text-slate-400",
                          )}
                        />
                        {lastRefresh.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      {/* Premium pulse indicator with enhanced shadow */}
                      {isRefreshing && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="absolute -top-1 -right-1"
                        >
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500/50"></span>
                            <span
                              className={cn(
                                "relative inline-flex rounded-full h-3 w-3 ring-2",
                                isDarkMode
                                  ? "bg-blue-500 ring-slate-900"
                                  : "bg-blue-500 ring-white",
                              )}
                            />
                          </span>
                        </motion.span>
                      )}
                    </Button>

                    {/* Tooltip with enhanced shadow */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
                      <div className="relative">
                        <div
                          className={cn(
                            "absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45",
                            isDarkMode ? "bg-slate-800" : "bg-white",
                          )}
                        />
                        <div
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs whitespace-nowrap",
                            "backdrop-blur-md",
                            isDarkMode
                              ? "bg-slate-800/90 border border-slate-700 text-slate-300 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.8)]"
                              : "bg-white/90 border border-slate-200 text-slate-600 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)]",
                          )}
                        >
                          Last sync: {lastRefresh.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Theme toggle with outstanding shadows */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowThemeModal(true)}
                    className={cn(
                      "relative p-3 rounded-xl transition-all duration-300",
                      "backdrop-blur-md",
                      isDarkMode
                        ? "bg-slate-900/90 border border-slate-800/80 hover:bg-slate-800/90 hover:border-slate-700 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.9)] hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,1)]"
                        : "bg-white/90 border border-slate-200/80 hover:bg-white hover:border-slate-300 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.15)]",
                    )}
                    title={
                      isDarkMode
                        ? "Switch to light mode"
                        : "Switch to dark mode"
                    }
                  >
                    {/* Glow overlay for dark mode */}
                    {isDarkMode && (
                      <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-purple-500/0 opacity-0 hover:opacity-100 transition-opacity" />
                    )}

                    {/* Icon with enhanced shadow */}
                    <motion.div
                      animate={{ rotate: isDarkMode ? 0 : 180 }}
                      transition={{ duration: 0.5 }}
                      className="relative"
                    >
                      {isDarkMode ? (
                        <Moon
                          className={cn(
                            "w-4 h-4 text-indigo-400",
                            "drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]",
                          )}
                        />
                      ) : (
                        <Sun
                          className={cn(
                            "w-4 h-4 text-amber-500 ",
                            "drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]",
                          )}
                        />
                      )}
                    </motion.div>
                  </motion.button>

                  {/* Connection indicator with enhanced shadow */}
                  <div
                    className={cn(
                      "hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl",
                      "backdrop-blur-md",
                      isDarkMode
                        ? "bg-slate-900/80 border border-slate-800/80 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.8)]"
                        : "bg-white/80 border border-slate-200/80 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.05)]",
                    )}
                  >
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full animate-pulse",
                        isDarkMode
                          ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                          : "bg-emerald-500",
                      )}
                    />
                    <span
                      className={cn(
                        "text-xs",
                        isDarkMode ? "text-slate-400" : "text-slate-500",
                      )}
                    >
                      connected
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Scrollable Tabs - Modern Design */}
            {/* Elegant Minimal Tabs with Sophisticated Motion */}
            <div className="relative">
              {/* Subtle ambient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-purple-50/30 dark:from-blue-950/20 dark:to-purple-950/20 rounded-3xl blur-2xl" />

              {/* Soft edge fades */}
              <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10 pointer-events-none" />

              {/* Main container with elegant padding */}
              <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar scroll-smooth px-6 py-2">
                {/* Community Tab - Minimal Elegance */}
                <motion.div
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/community?tab=videos"
                    className={cn(
                      "group relative px-5 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all duration-500",
                      "flex items-center gap-2.5",
                      pathname === "/community" &&
                        searchParams.get("tab") === "videos"
                        ? "text-white"
                        : cn(
                            isDarkMode
                              ? "text-slate-400 hover:text-white"
                              : "text-slate-600 hover:text-slate-900",
                          ),
                    )}
                  >
                    {/* Background layer with smooth transitions */}
                    <motion.div
                      className={cn(
                        "absolute inset-0 rounded-2xl transition-all duration-500",
                        pathname === "/community" &&
                          searchParams.get("tab") === "videos"
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 opacity-100"
                          : isDarkMode
                            ? "bg-slate-800/0 group-hover:bg-slate-800/50"
                            : "bg-slate-100/0 group-hover:bg-slate-100",
                      )}
                      layoutId={
                        pathname === "/community" &&
                        searchParams.get("tab") === "videos"
                          ? "activeBackground"
                          : undefined
                      }
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />

                    {/* Content */}
                    <span className="relative z-10">
                      <Video className="w-4 h-4" />
                    </span>
                    <span className="relative z-10">Community</span>

                    {/* Minimal indicator */}
                    {pathname === "/community" &&
                      searchParams.get("tab") === "videos" && (
                        <motion.span
                          layoutId="activeIndicator"
                          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-white"
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}
                  </Link>
                </motion.div>

                {/* Dynamic Tabs */}
                {tabs.map((tab, index) => {
                  const isActive = activeTab === tab.id;
                  const isPaymentTab = tab.id === "payments";

                  return (
                    <motion.div
                      key={tab.id}
                      custom={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="relative"
                    >
                      <button
                        onClick={() => handleTabChange(tab.id)}
                        className="relative px-5 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all duration-300"
                      >
                        {/* Animated background */}
                        <motion.div
                          className={cn(
                            "absolute inset-0 rounded-2xl transition-all duration-500",
                            isActive
                              ? cn(
                                  "bg-gradient-to-r",
                                  isPaymentTab
                                    ? "from-emerald-400 to-blue-500"
                                    : "from-blue-400 to-indigo-500",
                                )
                              : isDarkMode
                                ? "bg-slate-800/0 hover:bg-slate-800/40"
                                : "bg-slate-100/0 hover:bg-slate-100",
                          )}
                          animate={
                            isActive
                              ? {
                                  scale: [1, 1.02, 1],
                                }
                              : {}
                          }
                          transition={{ duration: 2, repeat: Infinity }}
                          layoutId={isActive ? "activeBackground" : undefined}
                        />

                        {/* Floating particles for active tab */}
                        {isActive && (
                          <>
                            {[...Array(3)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute w-1 h-1 bg-white/40 rounded-full"
                                initial={{
                                  x: Math.random() * 40 - 20,
                                  y: Math.random() * 40 - 20,
                                  opacity: 0,
                                }}
                                animate={{
                                  x: Math.random() * 60 - 30,
                                  y: Math.random() * 60 - 30,
                                  opacity: [0, 1, 0],
                                  scale: [0, 1, 0],
                                }}
                                transition={{
                                  duration: 2 + Math.random(),
                                  repeat: Infinity,
                                  delay: i * 0.3,
                                }}
                              />
                            ))}
                          </>
                        )}

                        {/* Content */}
                        <div className="relative z-10 flex items-center gap-2.5">
                          {/* Icon with gentle animation */}
                          <motion.span
                            animate={
                              isActive
                                ? {
                                    rotate: [0, 5, -5, 0],
                                  }
                                : {}
                            }
                            transition={{ duration: 3, repeat: Infinity }}
                            className={cn(
                              "text-lg transition-colors duration-300",
                              isActive
                                ? "text-white"
                                : isDarkMode
                                  ? "text-slate-400"
                                  : "text-slate-600",
                            )}
                          >
                            {isPaymentTab ? "💰" : "•"}
                          </motion.span>

                          <span
                            className={cn(
                              "transition-colors duration-300",
                              isActive
                                ? "text-white font-semibold"
                                : isDarkMode
                                  ? "text-slate-400 group-hover:text-white"
                                  : "text-slate-600 group-hover:text-slate-900",
                            )}
                          >
                            {tab.label}
                          </span>

                          {/* Elegant badge for payment tab */}
                          {isPaymentTab && !isActive && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", delay: 0.5 }}
                              className="px-1.5 py-0.5 text-[8px] font-medium rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/30"
                            >
                              ●
                            </motion.span>
                          )}
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {renderGigContent(memoizedUser, activeTab, isInGracePeriod)}
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        ,
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
