// components/notifications/NotificationItem.tsx
"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check, MoreHorizontal, Clock } from "lucide-react";

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
  // Format time relative or absolute
  const formatTime = (timestamp: number) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.005 }}
      className={cn(
        "p-4 transition-all duration-200 cursor-pointer group",
        "border-l-4 hover:border-l-blue-400/50",
        !notification.isRead
          ? "border-l-blue-500 bg-blue-500/5"
          : "border-l-transparent",
        themeConfig.surface.hover
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon Container */}
        <div
          className={cn(
            "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center",
            themeConfig.surface.secondary,
            "group-hover:scale-105 transition-transform duration-200"
          )}
        >
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content Container */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Message */}
          <p
            className={cn(
              "text-sm leading-relaxed pr-2",
              !notification.isRead
                ? themeConfig.text.primary
                : themeConfig.text.secondary,
              !notification.isRead && "font-semibold"
            )}
          >
            {notification.message}
          </p>

          {/* Action Button & Time */}
          <div className="flex items-center justify-between">
            {notification.actionUrl && (
              <Link
                href={notification.actionUrl}
                onClick={onClose}
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                  "hover:shadow-sm transform-gpu",
                  themeConfig.accent.hover,
                  themeConfig.accent.primary
                )}
              >
                {notification.actionLabel || "View"}
                <Check className={iconConfig.size.sm} />
              </Link>
            )}

            <div
              className={cn(
                "flex items-center gap-1 text-xs",
                themeConfig.text.muted
              )}
            >
              <Clock className={iconConfig.size.sm} />
              <span>{formatTime(notification.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex flex-col items-center gap-2">
          {!notification.isRead && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-2 h-2 bg-blue-500 rounded-full shadow-sm shadow-blue-500/50"
            />
          )}
          <button
            className={cn(
              "p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200",
              themeConfig.surface.hover,
              themeConfig.text.muted
            )}
          >
            <MoreHorizontal className={iconConfig.size.sm} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
