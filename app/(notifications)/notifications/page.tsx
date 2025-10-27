// app/notifications/page.tsx - COMPLETELY REWRITTEN
"use client";

import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import {
  FiBell,
  FiCheck,
  FiX,
  FiEye,
  FiUserPlus,
  FiCalendar,
  FiMessageSquare,
  FiStar,
  FiMusic,
  FiSettings,
  FiArrowRight,
  FiClock,
  FiUsers,
  FiAlertCircle,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotificationSystem } from "@/hooks/useNotifications";
import { GroupedNotificationsModal } from "@/components/notifications/GroupedNotificationsModal";
import {
  GroupedNotification,
  groupNotifications,
  isGroupedNotification,
  NotificationItem,
} from "@/utils";
import { Notification } from "@/convex/notificationsTypes";

const NOTIFICATION_TYPE_CONFIG = {
  profile_view: {
    icon: FiEye,
    label: "Profile View",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    hoverBorderColor: "hover:border-blue-300 dark:hover:border-blue-700",
    ringColor: "ring-blue-100 dark:ring-blue-900",
    iconColor: "text-blue-600 dark:text-blue-400",
    textColor: "text-blue-700 dark:text-blue-300",
    badgeBg: "bg-blue-100 dark:bg-blue-800",
    badgeText: "text-blue-700 dark:text-blue-300",
    iconBg: "bg-blue-100 dark:bg-blue-800",
  },
  follow_request: {
    icon: FiUserPlus,
    label: "Follow Request",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    borderColor: "border-orange-200 dark:border-orange-800",
    hoverBorderColor: "hover:border-orange-300 dark:hover:border-orange-700",
    ringColor: "ring-orange-100 dark:ring-orange-900",
    iconColor: "text-orange-600 dark:text-orange-400",
    textColor: "text-orange-700 dark:text-orange-300",
    badgeBg: "bg-orange-100 dark:bg-orange-800",
    badgeText: "text-orange-700 dark:text-orange-300",
    iconBg: "bg-orange-100 dark:bg-orange-800",
  },
  new_follower: {
    icon: FiUsers,
    label: "New Follower",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
    hoverBorderColor: "hover:border-green-300 dark:hover:border-green-700",
    ringColor: "ring-green-100 dark:ring-green-900",
    iconColor: "text-green-600 dark:text-green-400",
    textColor: "text-green-700 dark:text-green-300",
    badgeBg: "bg-green-100 dark:bg-green-800",
    badgeText: "text-green-700 dark:text-green-300",
    iconBg: "bg-green-100 dark:bg-green-800",
  },
  follow_accepted: {
    icon: FiCheck,
    label: "Follow Accepted",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    hoverBorderColor: "hover:border-emerald-300 dark:hover:border-emerald-700",
    ringColor: "ring-emerald-100 dark:ring-emerald-900",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    textColor: "text-emerald-700 dark:text-emerald-300",
    badgeBg: "bg-emerald-100 dark:bg-emerald-800",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    iconBg: "bg-emerald-100 dark:bg-emerald-800",
  },
  gig_invite: {
    icon: FiMusic,
    label: "Gig Invite",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    borderColor: "border-purple-200 dark:border-purple-800",
    hoverBorderColor: "hover:border-purple-300 dark:hover:border-purple-700",
    ringColor: "ring-purple-100 dark:ring-purple-900",
    iconColor: "text-purple-600 dark:text-purple-400",
    textColor: "text-purple-700 dark:text-purple-300",
    badgeBg: "bg-purple-100 dark:bg-purple-800",
    badgeText: "text-purple-700 dark:text-purple-300",
    iconBg: "bg-purple-100 dark:bg-purple-800",
  },
  gig_approved: {
    icon: FiCheck,
    label: "Gig Approved",
    bgColor: "bg-teal-50 dark:bg-teal-900/20",
    borderColor: "border-teal-200 dark:border-teal-800",
    hoverBorderColor: "hover:border-teal-300 dark:hover:border-teal-700",
    ringColor: "ring-teal-100 dark:ring-teal-900",
    iconColor: "text-teal-600 dark:text-teal-400",
    textColor: "text-teal-700 dark:text-teal-300",
    badgeBg: "bg-teal-100 dark:bg-teal-800",
    badgeText: "text-teal-700 dark:text-teal-300",
    iconBg: "bg-teal-100 dark:bg-teal-800",
  },
  gig_reminder: {
    icon: FiClock,
    label: "Gig Reminder",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    borderColor: "border-amber-200 dark:border-amber-800",
    hoverBorderColor: "hover:border-amber-300 dark:hover:border-amber-700",
    ringColor: "ring-amber-100 dark:ring-amber-900",
    iconColor: "text-amber-600 dark:text-amber-400",
    textColor: "text-amber-700 dark:text-amber-300",
    badgeBg: "bg-amber-100 dark:bg-amber-800",
    badgeText: "text-amber-700 dark:text-amber-300",
    iconBg: "bg-amber-100 dark:bg-amber-800",
  },
  new_message: {
    icon: FiMessageSquare,
    label: "Message",
    bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
    borderColor: "border-indigo-200 dark:border-indigo-800",
    hoverBorderColor: "hover:border-indigo-300 dark:hover:border-indigo-700",
    ringColor: "ring-indigo-100 dark:ring-indigo-900",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    textColor: "text-indigo-700 dark:text-indigo-300",
    badgeBg: "bg-indigo-100 dark:bg-indigo-800",
    badgeText: "text-indigo-700 dark:text-indigo-300",
    iconBg: "bg-indigo-100 dark:bg-indigo-800",
  },
  new_review: {
    icon: FiStar,
    label: "Review",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    hoverBorderColor: "hover:border-yellow-300 dark:hover:border-yellow-700",
    ringColor: "ring-yellow-100 dark:ring-yellow-900",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    textColor: "text-yellow-700 dark:text-yellow-300",
    badgeBg: "bg-yellow-100 dark:bg-yellow-800",
    badgeText: "text-yellow-700 dark:text-yellow-300",
    iconBg: "bg-yellow-100 dark:bg-yellow-800",
  },
  review_received: {
    icon: FiStar,
    label: "Review Received",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    borderColor: "border-amber-200 dark:border-amber-800",
    hoverBorderColor: "hover:border-amber-300 dark:hover:border-amber-700",
    ringColor: "ring-amber-100 dark:ring-amber-900",
    iconColor: "text-amber-600 dark:text-amber-400",
    textColor: "text-amber-700 dark:text-amber-300",
    badgeBg: "bg-amber-100 dark:bg-amber-800",
    badgeText: "text-amber-700 dark:text-amber-300",
    iconBg: "bg-amber-100 dark:bg-amber-800",
  },
  system_updates: {
    icon: FiSettings,
    label: "System Update",
    bgColor: "bg-gray-50 dark:bg-gray-900/20",
    borderColor: "border-gray-200 dark:border-gray-800",
    hoverBorderColor: "hover:border-gray-300 dark:hover:border-gray-700",
    ringColor: "ring-gray-100 dark:ring-gray-900",
    iconColor: "text-gray-600 dark:text-gray-400",
    textColor: "text-gray-700 dark:text-gray-300",
    badgeBg: "bg-gray-100 dark:bg-gray-800",
    badgeText: "text-gray-700 dark:text-gray-300",
    iconBg: "bg-gray-100 dark:bg-gray-800",
  },
} as const;

const DEFAULT_CONFIG = {
  icon: FiBell,
  label: "Notification",
  bgColor: "bg-gray-50 dark:bg-gray-900/20",
  borderColor: "border-gray-200 dark:border-gray-800",
  hoverBorderColor: "hover:border-gray-300 dark:hover:border-gray-700",
  ringColor: "ring-gray-100 dark:ring-gray-900",
  iconColor: "text-gray-600 dark:text-gray-400",
  textColor: "text-gray-700 dark:text-gray-300",
  badgeBg: "bg-gray-100 dark:bg-gray-800",
  badgeText: "text-gray-700 dark:text-gray-300",
  iconBg: "bg-gray-100 dark:bg-gray-800",
};

const getNotificationConfig = (type: string) => {
  return (
    NOTIFICATION_TYPE_CONFIG[type as keyof typeof NOTIFICATION_TYPE_CONFIG] ||
    DEFAULT_CONFIG
  );
};

export default function NotificationsPage() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const [filter, setFilter] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] =
    useState<GroupedNotification | null>(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useNotificationSystem();

  // Filter notifications first
  const filteredNotifications =
    notifications?.filter((notification) => {
      if (filter === "all") return true;
      if (filter === "unread") return !notification.isRead;
      return notification.type === filter;
    }) || [];

  // Group the filtered notifications
  const groupedNotifications = groupNotifications(filteredNotifications);

  const handleNotificationClick = async (item: NotificationItem) => {
    if (isGroupedNotification(item)) {
      // Handle grouped notifications
      if (item.count > 1) {
        setSelectedGroup(item);
        setIsGroupModalOpen(true);
      } else if (item.notifications[0]) {
        // Single notification in group - handle as individual
        const notification = item.notifications[0];
        if (!notification.isRead) {
          await markAsRead(notification._id);
        }
        if (notification.actionUrl) {
          router.push(notification.actionUrl);
        }
      }
    } else {
      // Handle individual notifications
      if (!item.isRead) {
        await markAsRead(item._id);
      }
      if (item.actionUrl) {
        router.push(item.actionUrl);
      }
    }
  };

  const handleGroupNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
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

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "unread", label: "Unread" },
    { value: "new_message", label: "Messages" },
    { value: "new_follower", label: "Followers" },
    { value: "follow_request", label: "Follow Requests" },
    { value: "profile_view", label: "Profile Views" },
    { value: "gig_invite", label: "Gig Invites" },
  ];

  // Render grouped notification item
  const renderGroupedNotification = (
    group: GroupedNotification,
    index: number
  ) => {
    const config = getNotificationConfig(group.type.replace("_group", ""));
    const IconComponent = config.icon;

    return (
      <motion.div
        key={group._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={() => handleNotificationClick(group)}
        className={cn(
          "p-4 rounded-xl border cursor-pointer transition-all duration-200 group",
          "hover:shadow-md active:scale-[0.98]",
          group.isRead
            ? cn(config.bgColor, config.borderColor)
            : cn(
                config.bgColor,
                config.borderColor,
                "ring-1",
                config.ringColor
              ),
          config.hoverBorderColor
        )}
      >
        <div className="flex items-start gap-4">
          {/* Icon with group badge */}
          <div className="flex-shrink-0 mt-0.5 relative">
            <div
              className={cn("p-2 rounded-lg", config.iconBg, config.iconColor)}
            >
              <IconComponent size={18} />
            </div>
            {group.count > 1 && (
              <div
                className={cn(
                  "absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold",
                  config.badgeBg,
                  config.badgeText
                )}
              >
                {group.count}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3
                    className={cn(
                      "font-semibold text-sm",
                      group.isRead ? colors.text : config.textColor
                    )}
                  >
                    {group.title}
                  </h3>
                  {!group.isRead && (
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full animate-pulse",
                        config.badgeBg
                      )}
                    ></span>
                  )}
                </div>
                <p className={cn("text-sm leading-relaxed", colors.textMuted)}>
                  {group.description}
                </p>

                {/* Metadata */}
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span
                    className={cn("flex items-center gap-1", colors.textMuted)}
                  >
                    <FiClock size={12} />
                    {getTimeAgo(group.latestTimestamp)}
                  </span>
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      config.badgeBg,
                      config.badgeText
                    )}
                  >
                    {config.label} • Grouped
                  </span>
                  <span className={cn("text-xs", colors.textMuted)}>
                    {group.count} {group.count === 1 ? "item" : "items"}
                  </span>
                </div>
              </div>

              <FiArrowRight
                className={cn(
                  "flex-shrink-0 mt-1 transition-transform group-hover:translate-x-1",
                  group.isRead ? "text-gray-400" : config.iconColor
                )}
                size={16}
              />
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Render individual notification item
  const renderIndividualNotification = (
    notification: Notification,
    index: number
  ) => {
    const config = getNotificationConfig(notification.type);
    const IconComponent = config.icon;

    return (
      <motion.div
        key={notification._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={() => handleNotificationClick(notification)}
        className={cn(
          "p-4 rounded-xl border cursor-pointer transition-all duration-200 group",
          "hover:shadow-md active:scale-[0.98]",
          notification.isRead
            ? cn(config.bgColor, config.borderColor)
            : cn(
                config.bgColor,
                config.borderColor,
                "ring-1",
                config.ringColor
              ),
          config.hoverBorderColor
        )}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-0.5">
            <div
              className={cn("p-2 rounded-lg", config.iconBg, config.iconColor)}
            >
              <IconComponent size={18} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3
                    className={cn(
                      "font-semibold text-sm",
                      notification.isRead ? colors.text : config.textColor
                    )}
                  >
                    {notification.title}
                  </h3>
                  {!notification.isRead && (
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full animate-pulse",
                        config.badgeBg
                      )}
                    ></span>
                  )}
                </div>
                <p className={cn("text-sm leading-relaxed", colors.textMuted)}>
                  {notification.message}
                </p>

                {/* Metadata */}
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span
                    className={cn("flex items-center gap-1", colors.textMuted)}
                  >
                    <FiClock size={12} />
                    {getTimeAgo(notification.createdAt)}
                  </span>
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      config.badgeBg,
                      config.badgeText
                    )}
                  >
                    {config.label}
                  </span>
                </div>
              </div>

              <FiArrowRight
                className={cn(
                  "flex-shrink-0 mt-1 transition-transform group-hover:translate-x-1",
                  notification.isRead ? "text-gray-400" : config.iconColor
                )}
                size={16}
              />
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center",
          colors.background
        )}
      >
        <div className="text-center">
          <div
            className={cn(
              "w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4",
              colors.primaryBg
            )}
          ></div>
          <p className={cn("text-sm", colors.textMuted)}>
            Loading notifications...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen", colors.background)}>
      {/* Header */}
      <div
        className={cn(
          "border-b sticky top-0 z-10",
          colors.border,
          colors.background
        )}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-xl", colors.primaryBg)}>
                <FiBell className="text-white text-xl" />
              </div>
              <div>
                <h1 className={cn("text-2xl font-bold", colors.text)}>
                  Notifications
                </h1>
                <p className={cn("text-sm", colors.textMuted)}>
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                    : "All caught up!"}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  "bg-blue-500 hover:bg-blue-600 text-white",
                  "flex items-center gap-2"
                )}
              >
                <FiCheck size={16} />
                Mark All Read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className={cn(
          "border-b sticky top-[88px] z-10",
          colors.border,
          colors.background
        )}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-4 overflow-x-auto">
            {filterOptions.map((option) => {
              const isActive = filter === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 border",
                    "flex items-center gap-2 min-w-max",
                    isActive
                      ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                      : cn(
                          "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300",
                          "border-gray-300 dark:border-gray-600",
                          "hover:bg-gray-50 dark:hover:bg-gray-700"
                        )
                  )}
                >
                  {option.label}
                  {option.value === "unread" && unreadCount > 0 && (
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded-full text-xs min-w-5 flex items-center justify-center",
                        isActive
                          ? "bg-white bg-opacity-20 text-white"
                          : "bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300"
                      )}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}

            {filter !== "all" && (
              <button
                onClick={() => setFilter("all")}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium ml-auto",
                  "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
                  "border border-gray-300 dark:border-gray-600",
                  "bg-white dark:bg-gray-800",
                  "flex items-center gap-2 whitespace-nowrap"
                )}
              >
                <FiX size={14} />
                Clear Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {groupedNotifications.length > 0 ? (
            <motion.div
              key="notifications-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {groupedNotifications.map((item, index) => {
                if (isGroupedNotification(item)) {
                  return renderGroupedNotification(item, index);
                } else {
                  return renderIndividualNotification(item, index);
                }
              })}
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "text-center py-16 rounded-xl border",
                colors.card,
                colors.border
              )}
            >
              <FiBell className="mx-auto text-gray-400 text-4xl mb-4" />
              <h3 className={cn("text-lg font-semibold mb-2", colors.text)}>
                {filter === "all"
                  ? "No notifications"
                  : `No ${filter} notifications`}
              </h3>
              <p className={cn("text-sm max-w-md mx-auto", colors.textMuted)}>
                {filter === "all"
                  ? "You're all caught up! New notifications will appear here."
                  : `No ${filter === "unread" ? "unread" : filter} notifications found.`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grouped Notifications Modal */}
      {selectedGroup && (
        <GroupedNotificationsModal
          group={selectedGroup}
          isOpen={isGroupModalOpen}
          onClose={() => setIsGroupModalOpen(false)}
          onNotificationClick={handleGroupNotificationClick}
        />
      )}
    </div>
  );
}
