// app/gigs/invitations/[gigId]/page.tsx
"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import {
  FiCalendar,
  FiMapPin,
  FiDollarSign,
  FiClock,
  FiUser,
  FiCheck,
  FiX,
  FiArrowLeft,
} from "react-icons/fi";
import { useRouter } from "next/navigation";

export default function GigInvitation() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const { colors } = useThemeColors();

  const gigId = params.gigId as string;
  const inviterId = searchParams.get("inviter");
  const status = searchParams.get("status");

  // Fetch gig details
  const gig = useQuery(
    api.controllers.gigs.getGigById,
    gigId ? { gigId } : "skip",
  );

  // Fetch inviter details
  const inviter = useQuery(
    api.controllers.user.getUserById,
    inviterId ? { userId: inviterId } : "skip",
  );

  const acceptInvitation = useMutation(api.gigs.acceptGigInvitation);
  const declineInvitation = useMutation(api.gigs.declineGigInvitation);

  const handleAccept = async () => {
    if (!currentUser?._id || !gigId) return;

    try {
      await acceptInvitation({
        gigId: gigId,
        musicianId: currentUser._id,
      });
      // Redirect to gig details or confirmation page
      router.push(`/gigs/${gigId}?accepted=true`);
    } catch (error) {
      console.error("Failed to accept gig invitation:", error);
    }
  };

  const handleDecline = async () => {
    if (!currentUser?._id || !gigId) return;

    try {
      await declineInvitation({
        gigId: gigId,
        musicianId: currentUser._id,
      });
      router.push("/gigs/invitations?declined=true");
    } catch (error) {
      console.error("Failed to decline gig invitation:", error);
    }
  };

  if (!gig) {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center",
          colors.background,
        )}
      >
        <div className="text-center">
          <p className={cn("text-lg", colors.text)}>
            Loading gig invitation...
          </p>
        </div>
      </div>
    );
  }

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
                colors.textMuted,
              )}
            >
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h1 className={cn("text-xl font-bold", colors.text)}>
                Gig Invitation
              </h1>
              <p className={cn("text-sm", colors.textMuted)}>
                You've been invited to perform at this gig
              </p>
            </div>
            {status === "pending" && (
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
                )}
              >
                Pending Response
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Gig Details */}
          <div className="lg:col-span-2">
            <div
              className={cn(
                "p-6 rounded-xl border",
                colors.card,
                colors.border,
              )}
            >
              <h2 className={cn("text-xl font-bold mb-4", colors.text)}>
                {gig.title}
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FiCalendar className={cn("text-gray-500")} />
                  <div>
                    <p className={cn("text-sm font-medium", colors.text)}>
                      Date & Time
                    </p>
                    <p className={cn("text-sm", colors.textMuted)}>
                      {new Date(gig.date).toLocaleDateString()} at {gig.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FiMapPin className={cn("text-gray-500")} />
                  <div>
                    <p className={cn("text-sm font-medium", colors.text)}>
                      Location
                    </p>
                    <p className={cn("text-sm", colors.textMuted)}>
                      {gig.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FiDollarSign className={cn("text-gray-500")} />
                  <div>
                    <p className={cn("text-sm font-medium", colors.text)}>
                      Budget
                    </p>
                    <p className={cn("text-sm", colors.textMuted)}>
                      KES {gig.budget}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FiClock className={cn("text-gray-500")} />
                  <div>
                    <p className={cn("text-sm font-medium", colors.text)}>
                      Duration
                    </p>
                    <p className={cn("text-sm", colors.textMuted)}>
                      {gig.duration} hours
                    </p>
                  </div>
                </div>
              </div>

              {gig.description && (
                <div className="mt-6">
                  <h3 className={cn("text-lg font-semibold mb-2", colors.text)}>
                    Gig Description
                  </h3>
                  <p
                    className={cn("text-sm leading-relaxed", colors.textMuted)}
                  >
                    {gig.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Invitation Actions */}
          <div className="space-y-6">
            {/* Inviter Info */}
            {inviter && (
              <div
                className={cn(
                  "p-6 rounded-xl border",
                  colors.card,
                  colors.border,
                )}
              >
                <h3 className={cn("font-semibold mb-4", colors.text)}>
                  Invited by
                </h3>
                <div className="flex items-center gap-3">
                  {inviter.picture ? (
                    <img
                      src={inviter.picture}
                      alt={inviter.firstname || "Inviter"}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <FiUser size={16} />
                    </div>
                  )}
                  <div>
                    <p className={cn("font-medium", colors.text)}>
                      {inviter.firstname} {inviter.lastname}
                    </p>
                    <p className={cn("text-sm", colors.textMuted)}>
                      @{inviter.username}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div
              className={cn(
                "p-6 rounded-xl border",
                colors.card,
                colors.border,
              )}
            >
              <h3 className={cn("font-semibold mb-4", colors.text)}>
                Respond to Invitation
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handleAccept}
                  className={cn(
                    "w-full py-3 rounded-lg font-medium transition-colors",
                    "bg-green-500 hover:bg-green-600 text-white",
                    "flex items-center justify-center gap-2",
                  )}
                >
                  <FiCheck size={18} />
                  Accept Invitation
                </button>
                <button
                  onClick={handleDecline}
                  className={cn(
                    "w-full py-3 rounded-lg font-medium transition-colors",
                    "bg-gray-500 hover:bg-gray-600 text-white",
                    "flex items-center justify-center gap-2",
                  )}
                >
                  <FiX size={18} />
                  Decline Invitation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
