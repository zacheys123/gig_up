// app/social/follow-requests/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { FiUserPlus, FiCheck, FiX, FiUsers, FiArrowLeft } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

export default function FollowRequests() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const { colors } = useThemeColors();

  const requesterId = searchParams.get("requester");
  const action = searchParams.get("action");

  // Fetch pending follow requests
  const pendingRequests = useQuery(
    api.controllers.user.getPendingFollowRequests,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  const acceptRequest = useMutation(api.controllers.user.acceptFollowRequest);
  const declineRequest = useMutation(api.controllers.user.declineFollowRequest);

  const handleAccept = async (requesterId: string) => {
    if (!currentUser?.clerkId) return;

    try {
      await acceptRequest({
        userId: currentUser.clerkId,
        requesterId: requesterId as Id<"users">,
      });
    } catch (error) {
      console.error("Failed to accept follow request:", error);
    }
  };

  const handleDecline = async (requesterId: string) => {
    if (!currentUser?.clerkId) return;

    try {
      await declineRequest({
        userId: currentUser.clerkId,
        requesterId: requesterId as Id<"users">,
      });
    } catch (error) {
      console.error("Failed to decline follow request:", error);
    }
  };

  return (
    <div className={cn("min-h-screen", colors.background)}>
      {/* Header */}
      <div className={cn("border-b", colors.border)}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-6">
            <button
              onClick={() => router.back()}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                "hover:bg-opacity-20",
                colors.hoverBg,
                colors.textMuted
              )}
            >
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h1 className={cn("text-2xl font-bold", colors.text)}>
                Follow Requests
              </h1>
              <p className={cn("text-sm", colors.textMuted)}>
                Manage who can follow you and see your content
              </p>
            </div>
            <div
              className={cn(
                "px-3 py-1 rounded-full text-sm font-medium",
                "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
              )}
            >
              {pendingRequests?.length || 0} Pending
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {pendingRequests && pendingRequests.length > 0 ? (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div
                key={request?._id}
                className={cn(
                  "p-6 rounded-xl border",
                  colors.card,
                  colors.border
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {request?.picture ? (
                      <img
                        src={request?.picture}
                        alt={request?.firstname || "User"}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                        <FiUserPlus size={20} />
                      </div>
                    )}
                    <div>
                      <p className={cn("font-semibold", colors.text)}>
                        {request?.firstname} {request?.lastname}
                      </p>
                      <p className={cn("text-sm", colors.textMuted)}>
                        @{request?.username}
                      </p>
                      {request?.instrument && (
                        <p className={cn("text-xs", colors.textMuted)}>
                          {request?.instrument}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(request?._id as string)}
                      className={cn(
                        "px-4 py-2 rounded-lg font-medium transition-colors",
                        "bg-green-500 hover:bg-green-600 text-white",
                        "flex items-center gap-2"
                      )}
                    >
                      <FiCheck size={16} />
                      Accept
                    </button>
                    <button
                      onClick={() => handleDecline(request?._id as Id<"users">)}
                      className={cn(
                        "px-4 py-2 rounded-lg font-medium transition-colors",
                        "bg-gray-500 hover:bg-gray-600 text-white",
                        "flex items-center gap-2"
                      )}
                    >
                      <FiX size={16} />
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className={cn(
              "text-center py-12 rounded-xl border",
              colors.card,
              colors.border
            )}
          >
            <FiUsers className="mx-auto text-gray-400 text-4xl mb-4" />
            <h3 className={cn("text-lg font-semibold mb-2", colors.text)}>
              No Pending Requests
            </h3>
            <p className={cn("text-sm max-w-md mx-auto", colors.textMuted)}>
              When someone requests to follow you, it will appear here for you
              to review.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
