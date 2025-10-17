// components/notifications/NotificationItem.tsx
"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";
import { useNotificationSystem } from "@/hooks/useNotifications";

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

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();

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
  const isClickable = Boolean(notification.actionUrl);

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
