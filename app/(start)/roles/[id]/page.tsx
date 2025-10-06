"use client";
import FloatingNotesLoader from "@/components/loaders/FloatingNotes";
import ActionPage from "@/components/start/ActionPage";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Actions = () => {
  const router = useRouter();
  const { isLoaded: isAuthLoaded, userId } = useAuth();
  const { user, isLoading: loading } = useCurrentUser();
  const [status, setStatus] = useState<
    "loading" | "unregistered" | "registered" | "no-user"
  >("loading");

  console.log("🔍 DEBUG - User object:", user);
  console.log("🔍 DEBUG - Auth state:", { isAuthLoaded, userId, loading });

  useEffect(() => {
    console.log("🔍 useEffect running - Current state:", {
      isAuthLoaded,
      loading,
      user,
      userId,
      status,
    });

    // Only proceed when auth and user data are fully loaded
    if (!isAuthLoaded || loading) {
      console.log("🔍 Waiting for auth or user data to load");
      return;
    }

    // If user is null (no record in database) or undefined (still loading)
    if (user === undefined) {
      console.log("🔍 User data still loading (undefined)");
      return;
    }

    // Now we have auth loaded and user data loaded (could be null or user object)
    console.log("🔍 Processing user data:", user);

    if (user?.isAdmin) {
      console.log("🔍 User is admin, redirecting to admin dashboard");
      router.push("/admin/dashboard");
      return;
    }

    // Case 1: No userId means not logged in
    if (!userId) {
      console.log("🔍 No user ID, redirecting to sign-in");
      router.push("/sign-in");
      return;
    }

    // Case 2: We have a userId but no user record in database (user is null)
    if (user === null) {
      console.log("🔍 User authenticated but no database record");
      setStatus("unregistered");
      return;
    }

    // Case 3: User exists but missing basic info or roles
    if (
      !user?.firstname ||
      user?.isMusician === undefined ||
      user?.isClient === undefined ||
      (user?.isMusician === false && user?.isClient === false)
    ) {
      console.log("🔍 User needs registration:", {
        hasFirstname: !!user?.firstname,
        isMusician: user?.isMusician,
        isClient: user?.isClient,
      });
      setStatus("unregistered");
      return;
    }

    // Case 4: User has completed registration
    console.log("🔍 User is fully registered, redirecting...");
    setStatus("registered");

    // Handle first login onboarding
    if (user?.firstLogin && !user?.onboardingComplete && !user?.isAdmin) {
      router.push("/about");
    } else {
      router.push("/");
    }
  }, [isAuthLoaded, loading, user, userId, router, status]);

  // Show loading state while checking everything
  if (status === "loading" || !isAuthLoaded || loading) {
    console.log("🔍 RENDER: Loading state");
    return (
      <div className="h-full backdrop-blur-0 bg-black/90 flex justify-center items-center">
        <FloatingNotesLoader />
      </div>
    );
  }

  // Show registration page
  if (status === "unregistered") {
    console.log("🔍 RENDER: Unregistered state - showing ActionPage");
    return <ActionPage />;
  }

  // If we somehow reach here, show loading
  console.log("🔍 RENDER: Fallback loading state");
  return (
    <div className="h-full backdrop-blur-0 bg-black/90 flex justify-center items-center">
      <FloatingNotesLoader />
    </div>
  );
};

export default Actions;
