"use client";

import BallLoader from "@/components/loaders/BallLoader";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSubscriptionStore } from "../stores/useSubscriptionStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffect, useState, useCallback } from "react";

import { useThemeColors } from "@/hooks/useTheme";
import MusicianDashboardWithLoading from "@/components/dashboard/muscian";
import GigLoader from "@/components/(main)/GigLoader";
import { ClientDashboardWithLoading } from "@/components/dashboard/client";

import { DashboardSkeleton } from "@/components/skeletons/DasboardSkeleton";
import BookerDashboardWithLoading from "@/components/dashboard/booker";
import { OnboardingModal } from "@/components/dashboard/onboarding";

export default function Dashboard() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const { isPro } = useSubscriptionStore();
  const { colors } = useThemeColors();

  // Use the Convex hook to get user data
  const { user, isLoading, isAuthenticated } = useCurrentUser();
  const { isMusician, isClient, isBooker } = useUserRole(); // Add isBooker
  const [isDataRefreshing, setIsDataRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render key

  // Manual refresh function - using key to force re-render
  const handleRefreshData = useCallback(async () => {
    if (isDataRefreshing) return;

    setIsDataRefreshing(true);
    try {
      // Force a re-render which will trigger Convex to refetch
      setRefreshKey((prev) => prev + 1);

      setLastRefreshed(new Date());
      console.log(
        "Dashboard data refreshed at:",
        new Date().toLocaleTimeString()
      );
    } catch (error) {
      console.error("Error refreshing dashboard data:", error);
    } finally {
      // Small delay to show loading state properly
      setTimeout(() => setIsDataRefreshing(false), 1000);
    }
  }, [isDataRefreshing]);

  // Auto-refresh data every 60 seconds when authenticated
  useEffect(() => {
    if (!isAuthenticated || isLoading) return;

    const interval = setInterval(() => {
      handleRefreshData();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, isLoading, handleRefreshData]);

  // Handle page visibility changes (refetch when tab becomes visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isAuthenticated) {
        // Refresh data when user comes back to the tab
        handleRefreshData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, handleRefreshData]);

  // Handle authentication and redirect
  if (isLoaded && !isAuthenticated) {
    console.log("Redirecting to sign-in: user not authenticated");
    router.push("/sign-in");
    return null;
  }

  if (!isLoaded || isLoading) {
    return <DashboardSkeleton />;
  }

  // If no user after loading
  if (!user) {
    console.log("No user data found after loading");
    return (
      <div
        className={`flex justify-center items-center min-h-screen ${colors.background} flex-col gap-4`}
      >
        <GigLoader
          title="Loading User's Data"
          size="md"
          color="border-amber-400"
        />
        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className={`mt-4 px-4 py-2 ${colors.primaryBg} text-white rounded-lg`}
          >
            Retry
          </button>
          <button
            onClick={handleRefreshData}
            disabled={isDataRefreshing}
            className={`mt-4 px-4 py-2 ${
              isDataRefreshing
                ? `${colors.secondaryBackground} ${colors.textMuted} cursor-not-allowed`
                : `${colors.primaryBg} text-white`
            } rounded-lg transition-colors`}
          >
            {isDataRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>
    );
  }

  console.log("Rendering dashboard for user:", user);

  return (
    <main className={`min-h-screen ${colors.background}`} key={refreshKey}>
      {/* Refresh Button */}
      <div className="fixed top-4 right-4 z-10">
        <motion.button
          onClick={handleRefreshData}
          disabled={isDataRefreshing}
          whileHover={{ scale: isDataRefreshing ? 1 : 1.05 }}
          whileTap={{ scale: isDataRefreshing ? 1 : 0.95 }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
            isDataRefreshing
              ? `${colors.secondaryBackground} ${colors.textMuted} cursor-not-allowed`
              : `${colors.primaryBg} text-white hover:opacity-90`
          } transition-all duration-200 shadow-lg`}
        >
          {isDataRefreshing ? (
            <>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Refreshing...
            </>
          ) : (
            <>
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh Data
            </>
          )}
        </motion.button>
      </div>
      {/* Last Refreshed Time
      <div className="fixed top-4 left-4 z-10 my-4">
        <p
          className={`text-xs ${colors.textMuted} bg-black/50 backdrop-blur-sm px-2 py-1 rounded`}
        >
          Last updated: {lastRefreshed.toLocaleTimeString()}
        </p>
      </div> */}
      {/* Main Dashboard Content */}
      {isMusician ? (
        <MusicianDashboardWithLoading
          gigsBooked={user.gigsBooked ?? 0}
          earnings={user.userearnings ?? 0}
          firstLogin={user.firstLogin}
          onboarding={user.onboardingComplete}
          isPro={isPro()}
          isLoading={false}
          isDataLoading={isDataRefreshing}
        />
      ) : isClient ? (
        <ClientDashboardWithLoading
          gigsPosted={user.gigsPosted}
          total={user.total}
          isPro={isPro()}
          isLoading={false}
          isDataLoading={isDataRefreshing}
        />
      ) : isBooker ? (
        <BookerDashboardWithLoading
          managedBands={user?.managedBands?.length || 0}
          artistsManaged={user?.artistsManaged?.length || 0}
          firstLogin={user.firstLogin}
          onboarding={user.onboardingComplete}
          isPro={isPro()}
          isLoading={false}
          isDataLoading={isDataRefreshing}
        />
      ) : (
        // Fallback for users without a role
        <div
          className={`flex flex-col items-center justify-center min-h-screen ${colors.text} p-8`}
        >
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Welcome to Your Dashboard</h1>
            <p className={colors.textMuted}>
              Please complete your profile setup to access dashboard features.
            </p>
            <p className={`text-sm ${colors.textMuted}`}>
              User roles: Musician: {isMusician ? "Yes" : "No"}, Client:{" "}
              {isClient ? "Yes" : "No"}, Booker: {isBooker ? "Yes" : "No"}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => router.push("/profile")}
                className={`${colors.primaryBg} hover:${colors.primaryBgHover} text-white px-6 py-2 rounded-lg`}
              >
                Complete Profile
              </button>
              <button
                onClick={handleRefreshData}
                className={`${colors.secondaryBackground} ${colors.text} border ${colors.border} px-4 py-2 rounded-lg`}
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Pro upgrade banner */}
      {!isPro() && (
        <div
          className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:max-w-md ${colors.warningBg} p-4 rounded-lg border ${colors.warningBorder}`}
        >
          <p className={colors.warningText}>
            Upgrade to Pro for unlimited features
          </p>
        </div>
      )}
      {user && !user.onboardingComplete && <OnboardingModal />}
    </main>
  );
}
