"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";
import { useNotificationSystem } from "@/hooks/useNotifications";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { useState } from "react";

interface NotificationItemProps {
  notification: any;
  onClose: () => void;
  getNotificationIcon: (type: string) => React.ReactNode;
  themeConfig: any;
  iconConfig: any;
}

export function NotificationItem({
  notification,
  onClose,
  getNotificationIcon,
  themeConfig,
  iconConfig,
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

  const NotificationContent = () => (
    <motion.div
      whileHover={{ scale: isClickable ? 1.02 : 1 }}
      whileTap={{ scale: isClickable ? 0.98 : 1 }}
      className={cn(
        "p-4 transition-all duration-200",
        isClickable && "cursor-pointer hover:shadow-md",
        notification.isRead
          ? themeConfig.surface.primary
          : cn(
              themeConfig.surface.secondary,
              "ring-1 ring-blue-500/20 dark:ring-blue-400/20"
            )
      )}
    >
      <div className="flex items-start gap-3">
        {/* Notification Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <div
            className={cn(
              "p-2 rounded-lg",
              notification.isRead
                ? "bg-gray-100 dark:bg-gray-800"
                : "bg-blue-100 dark:bg-blue-900"
            )}
          >
            {getNotificationIcon(notification.type)}
          </div>
        </div>

        {/* Notification Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div className="flex-1">
              <h4
                className={cn(
                  "font-semibold text-sm mb-1 leading-tight",
                  themeConfig.text.primary,
                  !notification.isRead && "font-bold"
                )}
              >
                {notification.title}
              </h4>
              <p
                className={cn(
                  "text-sm leading-relaxed",
                  themeConfig.text.secondary
                )}
              >
                {notification.message}
              </p>

              {/* Follow Request Actions */}
              {notification.type === "follow_request" && (
                <div className="flex items-center gap-2 mt-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleAcceptFollowRequest}
                      disabled={isProcessing}
                      size="sm"
                      className={cn(
                        "flex items-center gap-1.5 text-xs font-semibold",
                        "bg-green-500 hover:bg-green-600 text-white",
                        "transition-all duration-200"
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
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleDeclineFollowRequest}
                      disabled={isProcessing}
                      size="sm"
                      variant="outline"
                      className={cn(
                        "flex items-center gap-1.5 text-xs font-semibold",
                        "text-red-500 border-red-300 hover:bg-red-50 dark:hover:bg-red-950/20",
                        "transition-all duration-200"
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

              {/* Metadata */}
              <div className="flex items-center gap-3 mt-2">
                <span className={cn("text-xs", themeConfig.text.muted)}>
                  {getTimeAgo(notification.createdAt)}
                </span>

                {/* Action indicator for clickable notifications */}
                {isClickable && (
                  <span
                    className={cn(
                      "text-xs px-2 py-1 rounded-full font-medium",
                      notification.isRead
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        : "bg-blue-500 text-white"
                    )}
                  >
                    View details
                  </span>
                )}
              </div>
            </div>

            {/* Unread indicator */}
            {!notification.isRead && (
              <div className="flex-shrink-0 ml-2">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full animate-pulse",
                    themeConfig.accent.background
                  )}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Render clickable or non-clickable notification
  if (isClickable) {
    return (
      <div
        onClick={handleClick}
        className={cn(
          "transition-colors duration-200",
          isClickable && "hover:bg-gray-50 dark:hover:bg-gray-800/50"
        )}
      >
        <NotificationContent />
      </div>
    );
  }

  return <NotificationContent />;
}
