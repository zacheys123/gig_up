// components/notifications/GroupedNotificationItem.tsx
"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useNotificationSystem } from "@/hooks/useNotifications";
import { GroupedNotification } from "@/utils";

interface GroupedNotificationItemProps {
  group: GroupedNotification;
  onClose: () => void;
  getNotificationIcon: (type: string) => React.ReactNode;
  themeConfig: any;
  iconConfig: any;
}

export function GroupedNotificationItem({
  group,
  onClose,
  getNotificationIcon,
  themeConfig,
  iconConfig,
}: GroupedNotificationItemProps) {
  const router = useRouter();
  const { markAsRead } = useNotificationSystem();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    // Mark all notifications in the group as read
    for (const notification of group.notifications) {
      if (!notification.isRead) {
        await markAsRead(notification._id);
      }
    }

    // Close dropdown
    onClose();

    // Navigate to notifications page for grouped view
    router.push("/notifications");
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

  const getGroupDescription = () => {
    if (group.type === "message_group") {
      if (group.count === 1) {
        return "1 new message";
      } else {
        return `${group.count} new messages from ${group.metadata.chatIds.length} chats`;
      }
    }
    return group.description;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={cn(
        "p-4 transition-all duration-200 cursor-pointer hover:shadow-md",
        group.isRead
          ? themeConfig.surface.primary
          : cn(
              themeConfig.surface.secondary,
              "ring-1 ring-blue-500/20 dark:ring-blue-400/20"
            )
      )}
    >
      <div className="flex items-start gap-3">
        {/* Group Icon with Count Badge */}
        <div className="flex-shrink-0 mt-0.5 relative">
          <div
            className={cn(
              "p-2 rounded-lg",
              group.isRead
                ? "bg-gray-100 dark:bg-gray-800"
                : "bg-blue-100 dark:bg-blue-900"
            )}
          >
            {getNotificationIcon(group.type.replace("_group", ""))}
          </div>
          {group.count > 1 && (
            <div
              className={cn(
                "absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold",
                group.isRead
                  ? "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                  : "bg-blue-500 text-white"
              )}
            >
              {group.count}
            </div>
          )}
        </div>

        {/* Group Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4
                  className={cn(
                    "font-semibold text-sm leading-tight",
                    themeConfig.text.primary,
                    !group.isRead && "font-bold"
                  )}
                >
                  {group.title}
                </h4>
                {!group.isRead && (
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full animate-pulse",
                      themeConfig.accent.background
                    )}
                  />
                )}
              </div>
              <p
                className={cn(
                  "text-sm leading-relaxed",
                  themeConfig.text.secondary
                )}
              >
                {getGroupDescription()}
              </p>

              {/* Metadata */}
              <div className="flex items-center gap-3 mt-2">
                <span className={cn("text-xs", themeConfig.text.muted)}>
                  {getTimeAgo(group.latestTimestamp)}
                </span>
                <span
                  className={cn(
                    "text-xs px-2 py-1 rounded-full font-medium",
                    group.isRead
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      : "bg-blue-500 text-white"
                  )}
                >
                  Grouped • View all
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
