"use client";

import { OnboardingModal } from "@/components/dashboard/onboarding";
import BallLoader from "@/components/loaders/BallLoader";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSubscriptionStore } from "../stores/useSubscriptionStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ClientDashboard } from "@/components/dashboard/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffect } from "react";

import { useThemeColors } from "@/hooks/useTheme";
import { MusicianDashboard } from "@/components/dashboard/muscian";

export default function Dashboard() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const { isPro } = useSubscriptionStore();
  const { colors } = useThemeColors();

  // Use the Convex hook to get user data
  const { user, isLoading, isAuthenticated } = useCurrentUser();
  const { isMusician, isClient } = useUserRole();

  // Debug logging
  useEffect(() => {
    console.log("=== DASHBOARD DEBUG ===");
    console.log("isLoaded:", isLoaded);
    console.log("userId:", userId);
    console.log("isAuthenticated:", isAuthenticated);
    console.log("isLoading:", isLoading);
    console.log("user:", user);
    console.log("isMusician:", isMusician);
    console.log("isClient:", isClient);
    console.log("======================");
  }, [
    isLoaded,
    userId,
    isAuthenticated,
    isLoading,
    user,
    isMusician,
    isClient,
  ]);

  // Handle authentication and redirect
  if (isLoaded && !isAuthenticated) {
    console.log("Redirecting to sign-in: user not authenticated");
    router.push("/sign-in");
    return null;
  }

  // Show loading state
  if (!isLoaded || isLoading) {
    console.log("Showing loading state");
    return (
      <div
        className={`flex h-screen items-center justify-center ${colors.background}`}
      >
        <div className="flex flex-col items-center w-full">
          <BallLoader />
          <span className={`font-mono ${colors.text}`}>Loading ...</span>
        </div>
      </div>
    );
  }

  // If no user after loading
  if (!user) {
    console.log("No user data found after loading");
    return (
      <div
        className={`flex justify-center items-center min-h-screen ${colors.background} flex-col gap-4`}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-lime-400 border-t-transparent rounded-full"
        />
        <h6 className={`animate-pulse font-mono text-1xl ${colors.text}`}>
          Loading User's Data
        </h6>
        <button
          onClick={() => window.location.reload()}
          className={`mt-4 px-4 py-2 ${colors.primaryBg} text-white rounded-lg`}
        >
          Retry
        </button>
      </div>
    );
  }

  console.log("Rendering dashboard for user:", user);

  return (
    <main className={`min-h-screen ${colors.background}`}>
      {isMusician ? (
        <MusicianDashboard
          gigsBooked={user.gigsBooked ?? 0}
          earnings={user.userearnings ?? 0}
          firstLogin={user.firstLogin}
          onboarding={user.onboardingComplete}
          isPro={isPro()}
        />
      ) : isClient ? (
        <ClientDashboard
          gigsPosted={user.gigsPosted}
          total={user.total}
          isPro={isPro()}
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
              {isClient ? "Yes" : "No"}
            </p>
            <button
              onClick={() => router.push("/profile")}
              className={`${colors.primaryBg} hover:${colors.primaryBgHover} text-white px-6 py-2 rounded-lg`}
            >
              Complete Profile
            </button>
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

      {user.firstLogin && !user.onboardingComplete && <OnboardingModal />}
    </main>
  );
}
