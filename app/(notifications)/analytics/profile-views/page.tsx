// app/analytics/profile-views/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import {
  FiEye,
  FiUsers,
  FiTrendingUp,
  FiCalendar,
  FiArrowLeft,
  FiUser,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { toUserId } from "@/utils";
import { Id } from "@/convex/_generated/dataModel";

export default function ProfileViewsAnalytics() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const { colors } = useThemeColors();

  const viewerId = searchParams.get("viewer");
  const source = searchParams.get("source");

  // Fetch current user's profile views data
  const profileData = useQuery(
    api.controllers.user.getProfileViews,
    currentUser?._id ? { userId: currentUser._id } : "skip",
  );
  const myId = toUserId(currentUser?._id as Id<"users">);
  // Fetch specific viewer details if viewerId is provided
  const viewerDetails = useQuery(
    api.controllers.user.getUserById,
    viewerId ? { userId: myId } : "skip",
  );

  const recentViewers = profileData?.recentViewers || [];
  const totalViews = profileData?.totalCount || 0;

  return (
    <div className={cn("min-h-screen", colors.background)}>
      {/* Header */}
      <div className={cn("border-b", colors.border)}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-6">
            <button
              onClick={() => router.back()}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                "hover:bg-opacity-20",
                colors.hoverBg,
                colors.textMuted,
              )}
            >
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h1 className={cn("text-xl font-bold", colors.text)}>
                Profile View Analytics
              </h1>
              <p className={cn("text-sm", colors.textMuted)}>
                Track who's viewing your profile and analyze your visibility
              </p>
            </div>
            {source === "notification" && (
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
                )}
              >
                From Notification
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            className={cn("p-6 rounded-xl border", colors.card, colors.border)}
          >
            <div className="flex items-center gap-3">
              <div className={cn("p-3 rounded-lg", colors.primaryBg)}>
                <FiEye className="text-white text-lg" />
              </div>
              <div>
                <p className={cn("text-sm", colors.textMuted)}>Total Views</p>
                <p className={cn("text-xl font-bold", colors.text)}>
                  {totalViews}
                </p>
              </div>
            </div>
          </div>

          <div
            className={cn("p-6 rounded-xl border", colors.card, colors.border)}
          >
            <div className="flex items-center gap-3">
              <div className={cn("p-3 rounded-lg bg-green-500")}>
                <FiTrendingUp className="text-white text-lg" />
              </div>
              <div>
                <p className={cn("text-sm", colors.textMuted)}>This Week</p>
                <p className={cn("text-xl font-bold", colors.text)}>
                  {
                    recentViewers.filter(
                      (v) => Date.now() - v.timestamp < 7 * 24 * 60 * 60 * 1000,
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>

          <div
            className={cn("p-6 rounded-xl border", colors.card, colors.border)}
          >
            <div className="flex items-center gap-3">
              <div className={cn("p-3 rounded-lg bg-purple-500")}>
                <FiUsers className="text-white text-lg" />
              </div>
              <div>
                <p className={cn("text-sm", colors.textMuted)}>
                  Unique Viewers
                </p>
                <p className={cn("text-xl font-bold", colors.text)}>
                  {new Set(recentViewers.map((v) => v.userId)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Specific Viewer Section (if coming from notification) */}
        {viewerId && viewerDetails && (
          <div
            className={cn(
              "mb-8 p-6 rounded-xl border",
              colors.card,
              colors.border,
            )}
          >
            <h2 className={cn("text-lg font-semibold mb-4", colors.text)}>
              Recent Viewer
            </h2>
            <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              {viewerDetails.picture ? (
                <img
                  src={viewerDetails.picture}
                  alt={viewerDetails.firstname || "Viewer"}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                  <FiUser size={20} />
                </div>
              )}
              <div>
                <p className={cn("font-semibold", colors.text)}>
                  {viewerDetails.firstname} {viewerDetails.lastname}
                </p>
                <p className={cn("text-sm", colors.textMuted)}>
                  @{viewerDetails.username}
                </p>
                <p className={cn("text-xs", colors.textMuted)}>
                  Viewed your profile recently
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Viewers List */}
        <div className={cn("rounded-xl border", colors.card, colors.border)}>
          <div className="p-6 border-b">
            <h2 className={cn("text-lg font-semibold", colors.text)}>
              Recent Viewers
            </h2>
          </div>
          <div className="p-6">
            {recentViewers.length > 0 ? (
              <div className="space-y-4">
                {recentViewers.slice(0, 10).map((view, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <FiUser size={14} />
                      </div>
                      <div>
                        <p className={cn("text-sm font-medium", colors.text)}>
                          User {view.userId.slice(0, 8)}...
                        </p>
                        <p className={cn("text-xs", colors.textMuted)}>
                          {new Date(view.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/user/${view.userId}`)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-sm transition-colors",
                        "bg-blue-500 hover:bg-blue-600 text-white",
                      )}
                    >
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiEye className="mx-auto text-gray-400 text-3xl mb-3" />
                <p className={cn("text-sm", colors.textMuted)}>
                  No profile views yet. Your analytics will appear here when
                  people view your profile.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
