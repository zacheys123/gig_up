// app/hub/gigs/[gigId]/gig-info/page.tsx
"use client";

import React from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import ClientGigDetailsPage from "../ClientGigDetailsPage";
import MusicianGigDetailsPage from "../MusicianGigDetailsPage";

export default function GigInfoPage() {
  const { user, isLoading: userLoading } = useCurrentUser();
  const { isDarkMode } = useThemeColors();

  // Show loading state while checking user
  if (userLoading) {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center",
          isDarkMode ? "bg-slate-950" : "bg-slate-50",
        )}
      >
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p
            className={cn(
              "text-sm",
              isDarkMode ? "text-slate-400" : "text-slate-600",
            )}
          >
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Return the appropriate component based on user role
  if (user?.isClient) {
    return <ClientGigDetailsPage />;
  }

  // Default to musician view for musicians or if role not specified
  return <MusicianGigDetailsPage />;
}
