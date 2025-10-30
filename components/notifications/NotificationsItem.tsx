"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useNotificationSystem } from "@/hooks/useNotifications";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, Clock, ArrowRight } from "lucide-react";
import { useState } from "react";

interface NotificationItemProps {
  notification: any;
  onClose: () => void;
  getNotificationIcon: (type: string) => React.ReactNode;
  themeConfig: any;
  iconConfig: any;
  variant?: "desktop" | "mobile";
}

export function NotificationItem({
  notification,
  onClose,
  getNotificationIcon,
  themeConfig,
  iconConfig,
  variant = "desktop",
}: NotificationItemProps) {
  const router = useRouter();
  const { markAsRead } = useNotificationSystem();
  const { userId } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  // Convex mutations for follow request actions
  const acceptFollowRequest = useMutation(
    api.controllers.user.acceptFollowRequest
  );
  const declineFollowRequest = useMutation(
    api.controllers.user.declineFollowRequest
  );

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    // Don't navigate if it's a follow request with action buttons
    if (notification.type === "follow_request") {
      return;
    }

    // Mark as read if unread
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    // Close dropdown
    onClose();

    // Navigate to actionUrl if it exists
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleAcceptFollowRequest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId || isProcessing) return;

    setIsProcessing(true);
    try {
      const requesterId = notification.metadata?.requesterDocumentId;
      if (requesterId) {
        await acceptFollowRequest({
          userId,
          requesterId,
        });

        // Mark notification as read
        await markAsRead(notification._id);

        // Close dropdown after successful action
        setTimeout(onClose, 500);
      }
    } catch (error) {
      console.error("Error accepting follow request:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineFollowRequest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId || isProcessing) return;

    setIsProcessing(true);
    try {
      const requesterId = notification.metadata?.requesterDocumentId;
      if (requesterId) {
        await declineFollowRequest({
          userId,
          requesterId,
        });

        // Mark notification as read
        await markAsRead(notification._id);

        // Close dropdown after successful action
        setTimeout(onClose, 500);
      }
    } catch (error) {
      console.error("Error declining follow request:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return new Date(timestamp).toLocaleDateString();
  };

  // Determine if this notification should be clickable
  const isClickable =
    Boolean(notification.actionUrl) && notification.type !== "follow_request";

  // Consistent width handling - matches GroupedNotificationItem exactly
  const widthClass = variant === "mobile" ? "w-full" : "w-[90%] mx-auto";

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.99 }}
      onClick={isClickable ? handleClick : undefined}
      className={cn(
        "p-3 transition-all duration-200 rounded-xl", // ✅ Removed 'border'
        "hover:shadow-sm hover:border border-blue-300 dark:hover:border-blue-600", // ✅ Only show border on hover
        widthClass,
        widthClass, // ✅ Matches GroupedNotificationItem exactly
        isClickable && "cursor-pointer",
        notification.isRead
          ? cn(
              themeConfig.card,
              themeConfig.border,
              "bg-white/50 dark:bg-gray-800/50"
            )
          : cn(
              themeConfig.accent.background,
              "border-blue-200 dark:border-blue-800",
              "ring-1 ring-blue-500/20 shadow-sm"
            )
      )}
    >
      <div className="flex items-start gap-2">
        {/* Notification Icon - Matches GroupedNotificationItem styling */}
        <div className="flex-shrink-0">
          <div
            className={cn(
              "p-1.5 rounded-lg transition-colors duration-200",
              notification.isRead
                ? "bg-gray-100/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-400"
                : "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            )}
          >
            {getNotificationIcon(notification.type)}
          </div>
        </div>

        {/* Notification Content - Matches GroupedNotificationItem structure */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Title and status in one line - matches grouped style */}
              <div className="flex items-center gap-2 mb-1">
                <h4
                  className={cn(
                    "font-semibold text-xs leading-tight truncate flex-1",
                    themeConfig.text.primary,
                    !notification.isRead &&
                      "font-bold text-blue-700 dark:text-blue-300"
                  )}
                >
                  {notification.title}
                </h4>
                {!notification.isRead && (
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0",
                      "bg-blue-500 shadow-sm"
                    )}
                  />
                )}
              </div>

              {/* Message - more compact like grouped items */}
              <p
                className={cn(
                  "text-xs leading-relaxed line-clamp-1 mb-1",
                  themeConfig.text.secondary
                )}
              >
                {notification.message}
              </p>

              {/* Follow Request Actions - compact styling */}
              {notification.type === "follow_request" && (
                <div className="flex items-center gap-2 mt-2">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button
                      onClick={handleAcceptFollowRequest}
                      disabled={isProcessing}
                      size="sm"
                      className={cn(
                        "flex items-center gap-1 text-xs font-semibold h-7 px-2",
                        "bg-green-500 hover:bg-green-600 text-white shadow-sm",
                        "transition-all duration-200 rounded-lg"
                      )}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                      Accept
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button
                      onClick={handleDeclineFollowRequest}
                      disabled={isProcessing}
                      size="sm"
                      variant="outline"
                      className={cn(
                        "flex items-center gap-1 text-xs font-semibold h-7 px-2",
                        "text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30",
                        "transition-all duration-200 rounded-lg"
                      )}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                      Decline
                    </Button>
                  </motion.div>
                </div>
              )}

              {/* Metadata - Single line like grouped items */}
              <div className="flex items-center gap-2 mt-1">
                <span className={cn("text-[10px]", themeConfig.text.muted)}>
                  {getTimeAgo(notification.createdAt)}
                </span>

                {/* Action indicator for clickable notifications */}
                {isClickable && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                      notification.isRead
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        : "bg-blue-500 text-white shadow-sm"
                    )}
                  >
                    View details
                  </span>
                )}

                {/* Type badge for better context */}
                {!isClickable && notification.type !== "follow_request" && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                      notification.isRead
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        : "bg-blue-500 text-white shadow-sm"
                    )}
                  >
                    {notification.type.replace("_", " ")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// https://chat.deepseek.com/share/ep1nys5lucnbx3hljt
// clients can create their own bands from using users profiles
// the app can use ai to generate the program based on the clients suggestions
// usig gig Playbook for guidance ,when users come in first in the crew battleground:::
// first section is guided and already structured from ther gig info itself:
// section two?:crew chat(dynamic meaning it neads the users interactions)
// when i send a deputy request its liike a follow request:::when they accept i get a notification and in my profile i gaet in my list of deputies they are added...when you are a deputy to alot of people you get perks under the hood of cos
// a gig schema add reffered by::optional
// add a confirmedRefferedGig:number increament after a a successful gig:::get the reffredById in the gigSchema and use it to update their  confirmedRefferedGig...form this count the user can get incentives like more priority to gigs...and also clients based on the confirmedREfferedGigs:
