// app/hub/gigs/page.tsx
"use client";
import React, { useState, useEffect } from "react";
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
} from "./_components";
import { Applications } from "./_components/Application";
import { FavoriteGigs } from "./_components/FavouriteGigs";

export default function GigsHub() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();
  const [activeTab, setActiveTab] = useState("all");

  // Sync with URL params
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Update URL without page reload
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("tab", tab);
    router.push(`/hub/gigs?${newParams.toString()}`, { scroll: false });
  };

  if (isLoading || !user) {
    return <GigsLoadingSkeleton />;
  }

  // Get tabs based on user role (EXACTLY like community)
  const { tabs, defaultTab } = getUserGigTabs(user);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Gig Hub
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {getUserSubtitle(user)}
              </p>
            </div>
            {/* <GigStats user={user} /> */}
          </div>

          {/* Role Badge */}
          <div className="flex items-center gap-2 mb-6">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                user.isMusician
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  : user.isClient
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
              }`}
            >
              {user.isMusician
                ? "🎵 Musician"
                : user.isClient
                  ? "🎯 Client"
                  : "📊 Booker"}
            </span>
          </div>
        </div>
        // In your app/hub/gigs/page.tsx - UPDATE THE TABS SECTION
        {/* Tab Navigation - Hidden Scroll */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex-shrink-0 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        {/* Tab Content */}
        <div>{renderGigContent(user, activeTab)}</div>
      </div>
    </div>
  );
}

// Same helper functions as before but simplified
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

const getUserSubtitle = (user: any) => {
  if (user.isMusician)
    return "Find gigs, manage bookings, and grow your career";
  if (user.isClient) return "Post gigs, find talent, and manage your events";
  if (user.isBooker)
    return "Manage projects, build crews, and find opportunities";
  return "Manage your gigs and opportunities";
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

// Loading skeleton (same as community)
const GigsLoadingSkeleton = () => (
  <div className="animate-pulse">
    <GigsLoadingSkeleton />
  </div>
);
