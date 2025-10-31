// app/gigs/page.tsx
"use client";
import React, { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Id } from "@/convex/_generated/dataModel";

// Import gig components (we'll create these next)
// import { MusicianGigs } from "@/components/gigs/MusicianGigs";
// import { ClientGigs } from "@/components/gigs/ClientGigs";
// import { BookerGigs } from "@/components/gigs/BookerGigs";
// import { GigStats } from "@/components/gigs/GigStats";

export default function GigsPage() {
  const { user, isLoading: userLoading } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<string>("pending");

  if (userLoading) {
    return <GigsLoadingSkeleton />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please sign in to access gigs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You need to be authenticated to view and manage gigs.
          </p>
        </div>
      </div>
    );
  }

  // Determine user role and available tabs
  const { tabs, defaultTab } = getUserGigTabs(user);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Stats */}
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
            {user.isBoth && (
              <span className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded-full text-sm font-medium">
                Both Musician & Client
              </span>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
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

// Helper functions

const getUserGigTabs = (user: any) => {
  if (user.isMusician && !user.isClient && !user.isBooker) {
    return {
      tabs: [
        { id: "pending", label: "⏳ Applications" }, // Gigs they've applied to
        { id: "booked", label: "✅ Booked Gigs" }, // Gigs they got
        { id: "all", label: "🎵 Available Gigs" }, // All gigs they can apply to
        { id: "favorites", label: "⭐ Favorite Gigs" },
        { id: "saved", label: "💾 Saved Gigs" },
        { id: "payments", label: "💰 Payments" },
      ],
      defaultTab: "pending",
    };
  }

  if (user.isClient && !user.isMusician && !user.isBooker) {
    return {
      tabs: [
        { id: "my-gigs", label: "📋 My Posted Gigs" }, // Gigs they created
        { id: "pre-booking", label: "👥 Pre-Booking" }, // Where they see applicants
        { id: "booked", label: "✅ Booked Talent" }, // Final bookings
        { id: "reviewed", label: "⭐ Reviewed" },
      ],
      defaultTab: "my-gigs",
    };
  }

  if (user.isBooker) {
    return {
      tabs: [
        { id: "applications", label: "⏳ My Applications" }, // Gigs they've applied to as booker
        { id: "active-projects", label: "🚀 Active Projects" }, // Gigs they got hired for
        { id: "crew-management", label: "👥 Crew Management" }, // Where they form crews
        { id: "available-gigs", label: "🎵 Available Gigs" }, // Gigs they can apply to
        { id: "payments", label: "💰 Payments" },
      ],
      defaultTab: "applications",
    };
  }

  // For multi-role users
  return {
    tabs: [
      { id: "musician", label: "🎵 As Musician" },
      { id: "client", label: "🎯 As Client" },
      { id: "booker", label: "📊 As Booker" },
      { id: "all-booked", label: "✅ All Booked" },
    ],
    defaultTab: "musician",
  };
};

const getUserSubtitle = (user: any) => {
  if (user.isMusician && !user.isClient && !user.isBooker) {
    return "Find gigs, manage bookings, and track your performance career";
  }
  if (user.isClient && !user.isMusician && !user.isBooker) {
    return "Post gigs, book musicians, and manage your events";
  }
  if (user.isBooker) {
    return "Manage all gigs, track bookings, and analyze performance";
  }
  if (user.isBoth) {
    return "Switch between musician and client roles to manage your musical journey";
  }
  return "Manage your gigs and musical opportunities";
};

const renderGigContent = (user: any, activeTab: string) => {
  // For users with multiple roles
  if (user.isBoth) {
    switch (activeTab) {
      case "musician":
        return <MusicianGigs user={user} />;
      case "client":
        return <ClientGigs user={user} />;
      case "booked":
        return <BookedGigsUniversal user={user} />;
      case "payments":
        return <PaymentHistoryUniversal user={user} />;
      default:
        return <MusicianGigs user={user} />;
    }
  }

  // For single-role users
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
        return <PendingGigs user={user} />;
    }
  }

  if (user.isClient) {
    switch (activeTab) {
      case "my-gigs":
        return <MyPostedGigs user={user} />;
      case "booked":
        return <ClientBookedGigs user={user} />;
      case "reviewed":
        return <ReviewedGigs user={user} />;
      default:
        return <MyPostedGigs user={user} />;
    }
  }

  if (user.isBooker) {
    switch (activeTab) {
      case "all":
        return <BookerAllGigs user={user} />;
      case "booked":
        return <BookerBookedGigs user={user} />;
      case "analytics":
        return <BookerAnalytics user={user} />;
      default:
        return <BookerAllGigs user={user} />;
    }
  }

  return <div>No gig content available for your role.</div>;
};

// Loading skeleton
const GigsLoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/6"></div>
        </div>

        {/* Tabs skeleton */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex space-x-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20"
              ></div>
            ))}
          </div>
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow"
            >
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Placeholder components (we'll create these properly next)
const PendingGigs = ({ user }: { user: any }) => (
  <GigSection title="⏳ Pending Gigs" user={user} type="pending" />
);

const BookedGigs = ({ user }: { user: any }) => (
  <GigSection title="✅ Booked Gigs" user={user} type="booked" />
);

const AllGigs = ({ user }: { user: any }) => (
  <GigSection title="🎵 All Available Gigs" user={user} type="all" />
);

const FavoriteGigs = ({ user }: { user: any }) => (
  <GigSection title="⭐ Favorite Gigs" user={user} type="favorites" />
);

const SavedGigs = ({ user }: { user: any }) => (
  <GigSection title="💾 Saved Gigs" user={user} type="saved" />
);

const PaymentHistory = ({ user }: { user: any }) => (
  <GigSection title="💰 Payment History" user={user} type="payments" />
);

const MyPostedGigs = ({ user }: { user: any }) => (
  <GigSection title="📋 My Posted Gigs" user={user} type="my-gigs" />
);

const ClientBookedGigs = ({ user }: { user: any }) => (
  <GigSection title="🎯 Booked Musicians" user={user} type="client-booked" />
);

const ReviewedGigs = ({ user }: { user: any }) => (
  <GigSection title="⭐ Reviewed Gigs" user={user} type="reviewed" />
);

const BookerAllGigs = ({ user }: { user: any }) => (
  <GigSection title="📊 All Gigs" user={user} type="booker-all" />
);

const BookerBookedGigs = ({ user }: { user: any }) => (
  <GigSection title="✅ Booked Gigs" user={user} type="booker-booked" />
);

const BookerAnalytics = ({ user }: { user: any }) => (
  <GigSection title="📈 Analytics" user={user} type="analytics" />
);

const MusicianGigs = ({ user }: { user: any }) => (
  <GigSection
    title="🎵 Musician View - All Gigs"
    user={user}
    type="musician-all"
  />
);

const ClientGigs = ({ user }: { user: any }) => (
  <GigSection title="🎯 Client View - My Gigs" user={user} type="client-all" />
);

const BookedGigsUniversal = ({ user }: { user: any }) => (
  <GigSection title="✅ All Booked Gigs" user={user} type="universal-booked" />
);

const PaymentHistoryUniversal = ({ user }: { user: any }) => (
  <GigSection title="💰 All Payments" user={user} type="universal-payments" />
);

// Temporary section component
const GigSection = ({
  title,
  user,
  type,
}: {
  title: string;
  user: any;
  type: string;
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
      {title}
    </h2>
    <p className="text-gray-600 dark:text-gray-400 mb-6">
      This is the {title.toLowerCase()} section for{" "}
      {user.isMusician ? "musicians" : user.isClient ? "clients" : "bookers"}.
    </p>
    <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
      <p className="text-gray-500 dark:text-gray-400">
        {type.charAt(0).toUpperCase() + type.slice(1)} content will be displayed
        here
      </p>
    </div>
  </div>
);

export { GigsLoadingSkeleton };
