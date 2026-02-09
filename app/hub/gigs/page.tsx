// app/hub/gigs/page.tsx - UPDATED WITH ALL UPGRADE BANNERS
"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import {
  ArrowLeft,
  Moon,
  Sun,
  Crown,
  Lock,
  Zap,
  Users,
  Briefcase,
  UserCheck,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCheckTrial } from "@/hooks/useCheckTrial";
import { UpgradeBanner } from "./_components/UpgradeBlock";
import Link from "next/link";
import { PendingGig } from "./_components/PendingGig";
import { InvolvedGigs } from "./_components/BookedGigs";

// Enhanced version with tier info
const getUserSubtitle = (user: any) => {
  if (!user) return "Manage your gigs and opportunities";

  const userTier = user?.tier || "free";
  const isFreeUser = userTier === "free";
  const isInGracePeriod = user?.isInGracePeriod || false;
  const tierDisplay = userTier.charAt(0).toUpperCase() + userTier.slice(1);

  // Base subtitles with tier info
  if (user.isMusician && !user.isClient && !user.isBooker) {
    return isFreeUser && !isInGracePeriod
      ? `Find gigs and manage bookings • ${tierDisplay} Plan • Upgrade for premium features`
      : `Find gigs, manage bookings, and grow your career • ${tierDisplay} Plan`;
  }

  if (user.isClient && !user.isMusician && !user.isBooker) {
    return isFreeUser && !isInGracePeriod
      ? `Post gigs and find talent • ${tierDisplay} Plan • Upgrade for instant booking & crew management`
      : `Post gigs, find talent, and manage your events • ${tierDisplay} Plan`;
  }

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

const renderGigContent = (
  user: any,
  activeTab: string,
  colors: any,
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
      case "involved": // ADD THIS NEW TAB
        return <InvolvedGigs user={user} />; // ADD THIS
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

  // Musicians
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
      case "payments":
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
      case "involved": // ADD THIS
        return <InvolvedGigs user={user} />; // ADD THIS
      default:
        return <AllGigs user={user} />;
    }
  }

  // Clients
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
      case "involved": // ADD THIS
        return <InvolvedGigs user={user} />; // ADD THIS
      default:
        return <MyGigs user={user} />;
    }
  }

  // Bookers
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
      case "involved": // ADD THIS
        return <InvolvedGigs user={user} />; // ADD THIS
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

// Update the getUserGigTabs function to show lock icons for restricted tabs

const getUserGigTabs = (user: any) => {
  const userTier = user?.tier || "free";
  const isFreeUser = userTier === "free";
  const showLockIcon = (feature: string) =>
    isFreeUser && !user?.isInGracePeriod;

  if (user.isMusician && !user.isClient && !user.isBooker) {
    return {
      tabs: [
        { id: "pending", label: "⏳ Pending" },
        { id: "booked", label: "✅ Booked" },
        { id: "all", label: "🎵 All Gigs" },
        { id: "involved", label: "👥 My Involvements" }, // ADD THIS
        { id: "favorites", label: "⭐ Favorites" },
        { id: "saved", label: "💾 Saved" },
        { id: "payments", label: "💰 Payments" },
        {
          id: "invites",
          label: showLockIcon("gig-invites") ? "🔒 Invites" : "📨 Invites",
        },
      ],
      defaultTab: "pending",
    };
  }

  if (user.isClient && !user.isMusician && !user.isBooker) {
    return {
      tabs: [
        { id: "my-gigs", label: "📋 My Gigs" },
        { id: "pre-booking", label: "👥 Pre-Booking" },
        { id: "booked", label: "✅ Booked" },
        { id: "involved", label: "👥 My Involvements" }, // ADD THIS
        { id: "reviewed", label: "⭐ Reviewed" },
        {
          id: "invites",
          label: showLockIcon("gig-invites") ? "🔒 Invites" : "📨 Invites",
        },
        {
          id: "crew-management",
          label: showLockIcon("crew-management")
            ? "🔒 Crew Management"
            : "👥 Crew Management",
        },
        {
          id: "create-gigs",
          label: showLockIcon("instant-gigs")
            ? "🔒 Create Gigs"
            : "⚡ Create Gigs",
        },
      ],
      defaultTab: "my-gigs",
    };
  }

  if (user.isBooker) {
    return {
      tabs: [
        {
          id: "applications",
          label: showLockIcon("applications")
            ? "🔒 Applications"
            : "⏳ Applications",
        },
        {
          id: "active-projects",
          label: showLockIcon("active-projects")
            ? "🔒 Active Projects"
            : "🚀 Active Projects",
        },
        {
          id: "crew-management",
          label: showLockIcon("crew-management")
            ? "🔒 Crew Management"
            : "👥 Crew Management",
        },
        { id: "available-gigs", label: "🎵 Available Gigs" },
        { id: "involved", label: "👥 My Involvements" }, // ADD THIS
        { id: "payments", label: "💰 Payments" },
      ],
      defaultTab: "applications",
    };
  }

  // Multi-role users
  return {
    tabs: [
      { id: "musician", label: "🎵 As Musician" },
      { id: "client", label: "🎯 As Client" },
      { id: "booker", label: "📊 As Booker" },
      { id: "involved", label: "👥 My Involvements" }, // ADD THIS
    ],
    defaultTab: "musician",
  };
};

export default function GigsHub() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();
  const [activeTab, setActiveTab] = useState("all");
  const [showThemeModal, setShowThemeModal] = useState(false);
  const { isInGracePeriod } = useCheckTrial();
  // Use theme hooks
  const { colors } = useThemeColors();
  const { toggleDarkMode, isDarkMode } = useThemeToggle();

  // Memoize user data to prevent unnecessary re-renders
  const memoizedUser = useMemo(
    () => user,
    [
      user?._id,
      user?.isMusician,
      user?.isClient,
      user?.isBooker,
      user?.tier,
      isInGracePeriod,
    ],
  );

  // Memoize tabs configuration
  const { tabs, defaultTab } = useMemo(
    () =>
      memoizedUser
        ? getUserGigTabs(memoizedUser)
        : { tabs: [], defaultTab: "all" },
    [memoizedUser],
  );

  // Sync with URL params - optimized with proper cleanup
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tabs.some((t) => t.id === tab)) {
      setActiveTab(tab);
    } else if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [searchParams, defaultTab, tabs]);

  // Memoize tab change handler
  const handleTabChange = useCallback(
    (tab: string) => {
      setActiveTab(tab);
      // Update URL without page reload
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("tab", tab);
      router.push(`/hub/gigs?${newParams.toString()}`, { scroll: false });
    },
    [searchParams, router],
  );

  // Memoize theme modal handlers
  const handleToggleThemeModal = useCallback(() => {
    setShowThemeModal((prev) => !prev);
  }, []);

  const handleCloseThemeModal = useCallback(() => {
    setShowThemeModal(false);
  }, []);

  const handleToggleDarkMode = useCallback(() => {
    toggleDarkMode();
    setShowThemeModal(false);
  }, [toggleDarkMode]);

  // Memoize tab content
  const tabContent = useMemo(() => {
    if (!memoizedUser) return null;
    return renderGigContent(memoizedUser, activeTab, colors, isInGracePeriod);
  }, [memoizedUser, activeTab]);

  if (isLoading || !memoizedUser) {
    return <GigsLoadingSkeleton />;
  }

  const subtitle = getUserSubtitle(memoizedUser);

  return (
    <div className={cn("min-h-screen", colors.background)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-6 mb-8">
            {/* Left Section */}
            <div className="flex items-center gap-4 flex-1">
              {/* Back Button */}
              <button
                onClick={() => router.back()}
                className={cn(
                  "group flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200",
                  colors.border,
                  colors.hoverBg,
                  "hover:border-blue-400 hover:shadow-md",
                )}
              >
                <ArrowLeft
                  className={cn(
                    "w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5",
                    colors.text,
                  )}
                />
              </button>

              {/* Title Section */}
              <div className="flex-1">
                <h1
                  className={cn(
                    "text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent",
                    "mb-1 drop-shadow-sm",
                  )}
                >
                  Gig Hub
                </h1>
                <p
                  className={cn(
                    "text-base lg:text-lg font-normal",
                    colors.textMuted,
                  )}
                >
                  {subtitle}
                </p>
              </div>
            </div>

            {/* Right Section - Optional Quick Actions */}
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border text-sm",
                  colors.border,
                  colors.backgroundMuted,
                )}
              >
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className={cn("font-medium", colors.text)}>Active</span>
              </div>
            </div>
          </div>

          {/* Role Badge */}
          <div className="flex items-center gap-2 mb-6">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                memoizedUser.isMusician
                  ? "bg-green-100 text-green-800"
                  : memoizedUser.isClient
                    ? "bg-blue-100 text-blue-800"
                    : "bg-purple-100 text-purple-800"
              }`}
            >
              {memoizedUser.isMusician
                ? "🎵 Musician"
                : memoizedUser.isClient
                  ? "🎯 Client"
                  : "📊 Booker"}
            </span>

            {/* Theme Toggle Button */}
            <div className="relative">
              <button
                onClick={handleToggleThemeModal}
                className={cn(
                  "p-2 rounded-lg border transition-all duration-200 hover:shadow-md",
                  colors.border,
                  colors.hoverBg,
                  "hover:border-blue-300",
                )}
              >
                {isDarkMode ? (
                  <span className="flex items-center gap-2">
                    Dark
                    <Moon className="w-4 h-4 text-amber-400" />
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Light
                    <Sun className="w-4 h-4 text-amber-500" />
                  </span>
                )}
              </button>

              {/* Theme Modal */}
              <ThemeModal
                isOpen={showThemeModal}
                toggleDarkMode={handleToggleDarkMode}
                themeIsDark={isDarkMode}
                onClose={handleCloseThemeModal}
                colors={colors}
                position="top"
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation - Hidden Scroll */}
        <div className={cn("border-b mb-8", colors.border)}>
          <nav
            className={cn(
              "-mb-px flex space-x-8 overflow-x-auto scrollbar-hide flex items-center",
              colors.background,
            )}
          >
            <Link
              href="/community?tab=videos"
              className={cn(
                "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex-shrink-0",

                "border-transparent text-gray-700 dark:text-gray-300  flex gap-1 items-center",

                " hover:border-gray-300 hover:shadow-md hover:scale-105 transition-all duration-200 hover:opacity-80",
                colors.warningHover,
                colors.hoverBg,
              )}
            >
              <Video /> Community
            </Link>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex-shrink-0",
                  activeTab === tab.id
                    ? cn("border-neutral-300 text-blue-600", colors.primary)
                    : cn(
                        "border-transparent text-gray-700 dark:text-gray-300 ",

                        " hover:border-gray-300 hover:shadow-md hover:scale-105 transition-all duration-200 hover:opacity-80",
                        colors.warningHover,
                        colors.hoverBg,
                      ),
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className={cn("rounded-lg", colors.card, colors.border, "border")}>
          {tabContent}
        </div>
      </div>
    </div>
  );
}

// after registration the users who have pro status they can request other with pro musicians inside  the app to become part of their band...when the appm limits members to 5...so after  5 musicians the app locks those musicians in as abandN/Bthis idea can restrict the other users to not book gigs that require a band to force them to upgrade to join a band...after locking in 5 members the app can prompt the user to create a band profile and manage their band members from there...maybe create in the musician who requested the others to join the band as the band leader with special permissions to manage gigs and members...also the criteria for this leader he should have amazing scores ratings long time user pro tier etc...now this leader can be booking the gigs and can be locked in in the  clients bookingLotto array where now he can chat with the client  after agreeing then a crew battleground is created with the client as the admin and all the other users as memebers...this place now they can plan the gig and discuss details.......also the booker can do ther same if they agree with a client they can then agree whether the client wants to join as a viewonly or a admin the another crew batleground can be created.....for normal single bookings is just a normal booking...

// so when a person in the app maybe has amazing credit scores continuous pro tier subscription....now they are ready to create a band right??in their profile they can have a band  creation button right??when they click it they are redirected to the band management route::::there can be different choices like create a resume....because they are also eleigible for becoming band memebers....later we can restrict people from nbeing part of more than 1 band....unless youre a premium user and even then we can still restrict to just 2 bands....so when they click on the maybe create band...we can still offer a template for that...just one since its a band....so in this page we can have them create first the band with the name and maybe profilepicture etc...after that they are redirected to that bands specific page where now they can add memebers...when they choosea memeber the invite is sent to that member ...where in their profile they can have a special place for invites...we can also use my notification system to notify them....
