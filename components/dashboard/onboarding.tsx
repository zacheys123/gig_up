"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoadingGame } from "./LoadingGame";

export function OnboardingModal() {
  const router = useRouter();

  const { user } = useCurrentUser();
  const [loading, setLoading] = useState(false);

  // Determine the role based on isClient and isMusician booleans
  const isMusician = user?.user?.isMusician || false;
  const isClient = user?.user?.isClient || false;

  const steps = {
    musician: [
      "Complete your profile",
      "Set your availability",
      "Browse gig recommendations",
    ],
    client: [
      "Verify your account",
      "Set your budget preferences",
      "Post your first gig",
    ],
  };

  const markOnboardingComplete = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        setLoading(false);
        router.refresh();
        router.replace("/dashboard/billing");
      }, 60000);
      await fetch("/api/user/onboarding", { method: "POST" });
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingGame isLoading={loading} />}
      {user?.user?.firstLogin === true &&
        user?.user?.onboardingComplete === false &&
        !loading && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md">
              <h2 className="text-xl font-bold text-orange-400 mb-4">
                Welcome to GigUp!
              </h2>
              <ul className="space-y-3 mb-6">
                {(isMusician
                  ? steps.musician
                  : isClient
                  ? steps.client
                  : []
                ).map((step, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                      {i + 1}
                    </div>
                    <span className="text-gray-200">{step}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={markOnboardingComplete}
                className="w-full py-2 bg-orange-600 rounded-lg hover:bg-orange-700"
              >
                {loading ? (
                  <CircularProgress
                    size={24}
                    className="animate-spin text-white"
                  />
                ) : (
                  "Get Started"
                )}
              </button>
            </div>
          </div>
        )}
    </>
  );
}
