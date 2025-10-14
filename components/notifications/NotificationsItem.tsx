// components/notifications/NotificationItem.tsx
"use client";
import Link from "next/link";

import { useNotificationActions } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { Check, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Notification } from "@/types/notifications";

interface NotificationItemProps {
  notification: Notification;
  onClose: () => void;
}

export function NotificationItem({
  notification,
  onClose,
}: NotificationItemProps) {
  const { markAsRead } = useNotificationActions();
  const { colors } = useThemeColors();

  const handleClick = async () => {
    if (!notification.isRead) {
      await markAsRead({
        notificationId: notification._id,
        read: true,
      });
    }
    onClose();
  };

  const handleMarkRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!notification.isRead) {
      await markAsRead({
        notificationId: notification._id,
        read: true,
      });
    }
  };

  return (
    <Link
      href={notification.actionUrl || "#"}
      onClick={handleClick}
      className={cn(
        "block p-4 transition-colors relative group",
        "hover:bg-gray-50 dark:hover:bg-gray-750",
        !notification.isRead && "bg-blue-50 dark:bg-blue-900/20"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {notification.image ? (
            <img
              src={notification.image}
              alt=""
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                "bg-gradient-to-br from-amber-500 to-orange-500 text-white text-sm font-medium"
              )}
            >
              {notification.title.charAt(0)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4
            className={cn(
              "text-sm font-medium pr-6",
              !notification.isRead
                ? "text-gray-900 dark:text-gray-100"
                : "text-gray-700 dark:text-gray-300"
            )}
          >
            {notification.title}
          </h4>
          <p className={cn("text-sm mt-1 line-clamp-2", colors.textMuted)}>
            {notification.message}
          </p>
          <p className={cn("text-xs mt-2", colors.textMuted)}>
            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!notification.isRead && (
            <button
              onClick={handleMarkRead}
              className={cn(
                "p-1 rounded transition-colors",
                "hover:bg-green-100 dark:hover:bg-green-900/30",
                "text-green-600 dark:text-green-400"
              )}
              title="Mark as read"
            >
              <Check className="w-3 h-3" />
            </button>
          )}
          <div className="w-3 h-3 text-gray-400">
            <ExternalLink className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
      )}
    </Link>
  );
}
