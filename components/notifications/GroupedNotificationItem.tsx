"use client";

import { cn } from "@/lib/utils";
import { GroupedNotification } from "@/utils";
import { motion } from "framer-motion";

interface GroupedNotificationItemProps {
  group: GroupedNotification;
  onClose: () => void;
  onGroupClick: (group: GroupedNotification) => void;
  getNotificationIcon: (type: string) => React.ReactNode;
  themeConfig: any;
  iconConfig: any;
  variant?: "desktop" | "mobile";
}

export function GroupedNotificationItem({
  group,
  onClose,
  onGroupClick,
  getNotificationIcon,
  themeConfig,
  iconConfig,
  variant = "desktop",
}: GroupedNotificationItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onGroupClick(group);
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

  // Consistent width handling
  const widthClass = variant === "mobile" ? "w-full" : "w-[90%] mx-auto";

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.99 }}
      onClick={handleClick}
      className={cn(
        "p-3 transition-all duration-200 cursor-pointer rounded-xl", // ✅ Removed 'border'
        "hover:shadow-sm hover:border border-blue-300 dark:hover:border-blue-600", // ✅ Only show borde
        widthClass, // ✅ Consistent width handling
        group.isRead
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
        {/* Group Icon with Count Badge */}
        <div className="flex-shrink-0 relative">
          <div
            className={cn(
              "p-1.5 rounded-lg transition-colors duration-200",
              group.isRead
                ? "bg-gray-100/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-400"
                : "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            )}
          >
            {getNotificationIcon(group.type.replace("_group", ""))}
          </div>
          {group.count > 1 && (
            <div
              className={cn(
                "absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold border",
                group.isRead
                  ? "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-white dark:border-gray-800"
                  : "bg-blue-500 text-white border-white dark:border-gray-900 shadow-sm"
              )}
            >
              {group.count}
            </div>
          )}
        </div>

        {/* Group Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4
                  className={cn(
                    "font-semibold text-xs leading-tight truncate flex-1",
                    themeConfig.text.primary,
                    !group.isRead &&
                      "font-bold text-blue-700 dark:text-blue-300"
                  )}
                >
                  {group.title}
                </h4>
                {!group.isRead && (
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0",
                      "bg-blue-500 shadow-sm"
                    )}
                  />
                )}
              </div>

              <p
                className={cn(
                  "text-xs leading-relaxed line-clamp-1 mb-1",
                  themeConfig.text.secondary
                )}
              >
                {getGroupDescription()}
              </p>

              <div className="flex items-center gap-2">
                <span className={cn("text-[10px]", themeConfig.text.muted)}>
                  {getTimeAgo(group.latestTimestamp)}
                </span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                    group.isRead
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      : "bg-blue-500 text-white shadow-sm"
                  )}
                >
                  View details
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
