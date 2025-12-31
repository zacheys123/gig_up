"use client";

import React from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { CreateNormalGigs, GigsLoadingSkeleton } from "../../_components";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const CreateGigPage = () => {
  const { user, isLoading } = useCurrentUser();
  const { colors } = useThemeColors();

  if (isLoading) {
    return <GigsLoadingSkeleton />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div
          className={cn(
            "text-center p-8 rounded-2xl border shadow-lg max-w-md w-full",
            colors.card,
            colors.border
          )}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center">
            <span className="text-white text-2xl">🔒</span>
          </div>
          <h2 className={cn("text-xl font-bold mb-3", colors.text)}>
            Authentication Required
          </h2>
          <p className={cn("mb-6", colors.textMuted)}>
            Please log in to create and manage gigs
          </p>
          <button
            onClick={() => (window.location.href = "/sign-in")}
            className={cn(
              "w-full py-3 rounded-lg font-medium transition-all",
              "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
              "text-white shadow-lg hover:shadow-xl"
            )}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return <CreateNormalGigs user={user} />;
};

export default CreateGigPage;
