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
  const { user, isLoading:loading } = useCurrentUser();
  const [status, setStatus] = useState<
    "loading" | "unregistered" | "registered" | "no-user"
  >("loading");

  console.log("my userdata here", user);
  useEffect(() => {
    // Only proceed when auth and user data are fully loaded
    if (!isAuthLoaded || loading || !user || user?.user === undefined) return;
    if (user?.isAdmin) {
      router.push("/admin/dashboard");
    } else {
      // Case 1: No userId means not logged in (should be caught by middleware)
      if (!userId) {
        router.push("/sign-in");
        return;
      }
      // Case 2: We have a userId but no user record in MongoDB
      if (!user?.firstname) {
        setStatus("unregistered");
        return;
      }

      // Case 3: User exists but hasn't completed registration (missing roles)
      if (
        user?.user &&
        (user?.isMusician === undefined ||
          user?.isClient === undefined ||
          (user?.isMusician === false && user?.isClient === false))
      ) {
        setStatus("unregistered");
        return;
      }

      // Case 4: User has completed registration
      if (
        typeof user?.isMusician === "boolean" &&
        typeof user?.isClient === "boolean"
      ) {
        setStatus("registered");

        // Handle first login onboarding
        if (
          user?.firstLogin &&
          !user?.onboardingComplete &&
          !user?.isAdmin
        ) {
          router.push("/about");
        } else {
          router.push("/");
        }
      }
      return;
    }

    // Final fallback - shouldn't normally reach here
    setStatus("no-user");
  }, [isAuthLoaded, loading, user, userId, router]);

  // Show loading state while checking everything
  if (status === "loading" || !isAuthLoaded || loading) {
    return (
      <div className="h-full backdrop-blur-0 bg-black/90 flex justify-center items-center">
        <FloatingNotesLoader />
      </div>
    );
  }

  // Show registration page if:
  // - We have userId but no user record (unregistered)
  // - Or user exists but hasn't set roles
  if (status === "unregistered") {
    return <ActionPage />;
  }

  // If we somehow reach here with no user, show loading
  // (better than redirecting incorrectly)
  return (
    <div className="h-full backdrop-blur-0 bg-black/90 flex justify-center items-center">
      <FloatingNotesLoader />
    </div>
  );
};

export default Actions;
