// app/hub/gigs/page.tsx - UPDATED WITH BACKGROUND COLORS
"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  ActiveProjects,
  AllGigs,
  BookedGigs,
  ClientPreBooking,
  CrewManagement,
  MyGigs,
  PaymentHistory,
  PendingGigs,
  ReviewedGigs,
  SavedGigs,
  InstantGigs,
  GigInvites,
} from "./_components";
import { Applications } from "./_components/Application";
import { FavoriteGigs } from "./_components/FavouriteGigs";
import { ThemeModal } from "@/components/modals/ThemeModal";
import { useThemeColors, useThemeToggle } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { ArrowLeft, Moon, Sun } from "lucide-react";

// Memoize static data to prevent recreation on every render
const GigsLoadingSkeleton = React.memo(() => (
  <div className="animate-pulse">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  </div>
));

GigsLoadingSkeleton.displayName = "GigsLoadingSkeleton";

// Memoize helper functions to prevent recreation
const getUserSubtitle = (user: any) => {
  if (user.isMusician)
    return "Find gigs, manage bookings, and grow your career";
  if (user.isClient) return "Post gigs, find talent, and manage your events";
  if (user.isBooker)
    return "Manage projects, build crews, and find opportunities";
  return "Manage your gigs and opportunities";
};

const getUserGigTabs = (user: any) => {
  if (user.isMusician && !user.isClient && !user.isBooker) {
    return {
      tabs: [
        { id: "pending", label: "⏳ Pending" },
        { id: "booked", label: "✅ Booked" },
        { id: "all", label: "🎵 All Gigs" },
        { id: "favorites", label: "⭐ Favorites" },
        { id: "saved", label: "💾 Saved" },
        { id: "payments", label: "💰 Payments" },
        { id: "invites", label: "💰 GigInvites" },
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
        { id: "reviewed", label: "⭐ Reviewed" },
        { id: "invites", label: "⭐ Invites" },
        { id: "crew-management", label: "👥 Crew Management" },
        { id: "urgent-gigs", label: "⭐ Urgent Gigs" },
      ],
      defaultTab: "my-gigs",
    };
  }

  if (user.isBooker) {
    return {
      tabs: [
        { id: "applications", label: "⏳ Applications" },
        { id: "active-projects", label: "🚀 Active Projects" },
        { id: "crew-management", label: "👥 Crew Management" },
        { id: "available-gigs", label: "🎵 Available Gigs" },
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
    ],
    defaultTab: "musician",
  };
};

const renderGigContent = (user: any, activeTab: string) => {
  // Multi-role users
  if (user.isBoth) {
    switch (activeTab) {
      case "musician":
        return <AllGigs user={user} />;
      case "client":
        return <MyGigs user={user} />;
      case "booker":
        return <Applications user={user} />;
      default:
        return <AllGigs user={user} />;
    }
  }

  // Musicians
  if (user.isMusician) {
    switch (activeTab) {
      case "pending":
        return <PendingGigs user={user} />;
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
        return <GigInvites user={user} />;
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
        return <CrewManagement user={user} />;
      case "invites":
        return <GigInvites user={user} />;
      case "urgent-gigs":
        return <InstantGigs user={user} />;
      default:
        return <MyGigs user={user} />;
    }
  }

  // Bookers
  if (user.isBooker) {
    switch (activeTab) {
      case "applications":
        return <Applications user={user} />;
      case "active-projects":
        return <ActiveProjects user={user} />;
      case "crew-management":
        return <CrewManagement user={user} />;
      case "available-gigs":
        return <AllGigs user={user} />;
      case "payments":
        return <PaymentHistory user={user} />;
      default:
        return <Applications user={user} />;
    }
  }

  return <div>No gig content available</div>;
};

export default function GigsHub() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();
  const [activeTab, setActiveTab] = useState("all");
  const [showThemeModal, setShowThemeModal] = useState(false);

  // Use theme hooks
  const { colors } = useThemeColors();
  const { toggleDarkMode, isDarkMode } = useThemeToggle();

  // Memoize user data to prevent unnecessary re-renders
  const memoizedUser = useMemo(
    () => user,
    [user?._id, user?.isMusician, user?.isClient, user?.isBooker]
  );

  // Memoize tabs configuration
  const { tabs, defaultTab } = useMemo(
    () =>
      memoizedUser
        ? getUserGigTabs(memoizedUser)
        : { tabs: [], defaultTab: "all" },
    [memoizedUser]
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
    [searchParams, router]
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
    return renderGigContent(memoizedUser, activeTab);
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
                  "hover:border-blue-400 hover:shadow-md"
                )}
              >
                <ArrowLeft
                  className={cn(
                    "w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5",
                    colors.text
                  )}
                />
              </button>

              {/* Title Section */}
              <div className="flex-1">
                <h1
                  className={cn(
                    "text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent",
                    "mb-1 drop-shadow-sm"
                  )}
                >
                  Gig Hub
                </h1>
                <p
                  className={cn(
                    "text-base lg:text-lg font-normal",
                    colors.textMuted
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
                  colors.backgroundMuted
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
                  "hover:border-blue-300"
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
              "-mb-px flex space-x-8 overflow-x-auto scrollbar-hide",
              colors.background
            )}
          >
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
                        colors.hoverBg
                      )
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
