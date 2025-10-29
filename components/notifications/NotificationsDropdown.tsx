"use client";
import { useNotificationSystem } from "@/hooks/useNotifications";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Bell,
  Settings,
  CheckCheck,
  Sparkles,
  MoreHorizontal,
  Eye,
  Heart,
  MessageCircle,
  Users,
  Calendar,
  Zap,
  Star,
  Share,
  AlertTriangle,
  ChevronLeft,
  X,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { NotificationItem } from "./NotificationsItem";
import { GroupedNotificationItem } from "./GroupedNotificationItem";
import { motion, AnimatePresence } from "framer-motion";

import { useState } from "react";
import {
  GroupedNotification,
  groupNotifications,
  isGroupedNotification,
} from "@/utils";

interface NotificationDropdownProps {
  onClose: () => void;
  variant?: "desktop" | "mobile";
}

type ViewMode = "list" | "group";

export function NotificationDropdown({
  onClose,
  variant = "desktop",
}: NotificationDropdownProps) {
  const { notifications, unreadCount, markAllAsRead } = useNotificationSystem();
  const { userId } = useAuth();
  const { colors, isDarkMode } = useThemeColors();

  const [selectedGroup, setSelectedGroup] =
    useState<GroupedNotification | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isAnimating, setIsAnimating] = useState(false);

  // Apply grouping
  const groupedNotifications = groupNotifications(notifications || []);
  const groupedUnreadCount = groupedNotifications.reduce((count, item) => {
    return (
      count +
      (isGroupedNotification(item)
        ? item.isRead
          ? 0
          : 1
        : item.isRead
          ? 0
          : 1)
    );
  }, 0);

  const handleMarkAllRead = async () => {
    if (userId && groupedUnreadCount > 0) {
      await markAllAsRead();
    }
  };

  const handleGroupClick = async (group: GroupedNotification) => {
    if (isAnimating) return;

    setIsAnimating(true);
    setSelectedGroup(group);

    setTimeout(() => {
      setViewMode("group");
      setIsAnimating(false);
    }, 50);
  };

  const handleBackToList = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setViewMode("list");

    setTimeout(() => {
      setSelectedGroup(null);
      setIsAnimating(false);
    }, 300);
  };

  const handleGroupNotificationClick = async (notification: any) => {
    onClose();

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const dropdownWidth = variant === "mobile" ? "w-full" : "w-96"; // ✅ Increased from w-[90%] to w-96
  const expandedWidth = variant === "mobile" ? "w-full" : "w-[28rem]"; // ✅ Consistent expanded wid
  // Enhanced theme config that works with your color system
  const themeConfig = {
    background: colors.background,
    card: colors.card,
    border: colors.border,
    text: {
      primary: colors.text,
      secondary: colors.textMuted,
      accent: colors.primary,
      muted: colors.textMuted,
    },
    surface: {
      primary: isDarkMode ? "bg-gray-800/80" : "bg-gray-50/90",
      secondary: isDarkMode ? "bg-gray-800" : "bg-gray-100",
      hover: isDarkMode ? "hover:bg-gray-700/80" : "hover:bg-gray-200/80",
    },
    accent: {
      background: isDarkMode ? "bg-blue-500/20" : "bg-blue-500/10",
      border: isDarkMode ? "border-blue-400/30" : "border-blue-500/20",
      text: isDarkMode ? "text-blue-400" : "text-blue-600",
    },
  };

  const iconConfig = {
    size: { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" },
    notification: (type: string) => {
      const baseClass = "w-4 h-4";
      const config = {
        profile_view: { icon: Eye, color: "text-blue-500" },
        new_follower: { icon: Users, color: "text-purple-500" },
        follow_request: { icon: Users, color: "text-purple-500" },
        follow_accepted: { icon: Users, color: "text-purple-500" },
        like: { icon: Heart, color: "text-red-500" },
        share: { icon: Share, color: "text-indigo-500" },
        new_message: { icon: MessageCircle, color: "text-green-500" },
        gig_invite: { icon: Calendar, color: "text-amber-500" },
        gig_application: { icon: Calendar, color: "text-amber-500" },
        gig_approved: { icon: Calendar, color: "text-amber-500" },
        gig_rejected: { icon: Calendar, color: "text-amber-500" },
        gig_cancelled: { icon: Calendar, color: "text-amber-500" },
        gig_reminder: { icon: Calendar, color: "text-amber-500" },
        new_review: { icon: Star, color: "text-yellow-500" },
        review_received: { icon: Star, color: "text-yellow-500" },
        system_alert: { icon: AlertTriangle, color: "text-orange-500" },
      }[type] || { icon: Bell, color: "text-gray-500" };

      const IconComponent = config.icon;
      return <IconComponent className={cn(baseClass, config.color)} />;
    },
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

  return (
    <>
      <AnimatePresence mode="wait">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-60 bg-black/30 backdrop-blur-[1px]"
          onClick={onClose}
          aria-hidden="true"
        />

        <motion.div
          key={viewMode}
          initial={{
            opacity: 0,
            scale: 0.95,
            y: -8,
            x: variant === "mobile" ? "-50%" : 0,
            width: dropdownWidth,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            x: variant === "mobile" ? "-50%" : 0,
            width: viewMode === "list" ? dropdownWidth : "28rem", // ✅ Increased width for group view
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
            y: -8,
            x: variant === "mobile" ? "-50%" : 0,
          }}
          transition={{
            type: "spring",
            duration: 0.4,
            bounce: 0.1,
            width: { duration: 0.3 },
          }}
          className={cn(
            "absolute top-12 z-70 rounded-2xl shadow-2xl border transform-gpu overflow-hidden p-5",
            themeConfig.background,
            themeConfig.border,
            "ring-1",
            isDarkMode ? "ring-gray-700" : "ring-gray-200",
            variant === "mobile" ? "left-18 -translate-x-1/2 mx-4" : "right-0"
          )}
          style={{
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            maxWidth: variant === "mobile" ? "calc(100vw - 2rem)" : "none",
          }}
        >
          {/* HEADER */}
          <div
            className={cn("p-6 border-b", themeConfig.border, themeConfig.card)}
          >
            <div className="flex items-center justify-between">
              {/* Left side */}
              <div className="flex items-center gap-3">
                {viewMode === "group" ? (
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={handleBackToList}
                    className={cn(
                      "p-2 rounded-lg transition-all duration-200",
                      "hover:bg-opacity-80 active:scale-95",
                      themeConfig.accent.background,
                      themeConfig.accent.border,
                      "border"
                    )}
                  >
                    <ChevronLeft
                      className={cn("w-4 h-4", themeConfig.accent.text)}
                    />
                  </motion.button>
                ) : (
                  <div
                    className={cn(
                      "p-2 rounded-xl border",
                      themeConfig.accent.background,
                      themeConfig.accent.border
                    )}
                  >
                    <Bell className={cn("w-5 h-5", themeConfig.accent.text)} />
                  </div>
                )}

                {/* Title */}
                <div className="flex flex-col">
                  <h3
                    className={cn(
                      "font-bold text-lg",
                      themeConfig.text.primary
                    )}
                  >
                    {viewMode === "group"
                      ? selectedGroup?.title
                      : "Notifications"}
                  </h3>
                  {viewMode === "list" ? (
                    groupedUnreadCount > 0 ? (
                      <p
                        className={cn(
                          "text-sm font-semibold mt-1",
                          themeConfig.accent.text
                        )}
                      >
                        {groupedUnreadCount} new notification
                        {groupedUnreadCount !== 1 ? "s" : ""}
                      </p>
                    ) : (
                      <p
                        className={cn(
                          "text-sm mt-1",
                          themeConfig.text.secondary
                        )}
                      >
                        All caught up
                      </p>
                    )
                  ) : (
                    <p
                      className={cn("text-sm mt-1", themeConfig.text.secondary)}
                    >
                      {selectedGroup?.count}{" "}
                      {selectedGroup?.count === 1 ? "item" : "items"}
                    </p>
                  )}
                </div>
              </div>

              {/* Right side - Actions */}
              <div className="flex items-center gap-1">
                {viewMode === "list" && groupedUnreadCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleMarkAllRead}
                    className={cn(
                      "p-2 rounded-lg border transition-all duration-200 font-semibold",
                      themeConfig.surface.hover,
                      themeConfig.accent.text,
                      themeConfig.accent.border
                    )}
                  >
                    <CheckCheck className="w-4 h-4" />
                  </motion.button>
                )}

                {viewMode === "list" && (
                  <Link href="/settings/notification" onClick={onClose}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "p-2 rounded-lg border transition-all duration-200",
                        themeConfig.surface.hover,
                        themeConfig.text.secondary,
                        themeConfig.border
                      )}
                    >
                      <Settings className="w-4 h-4" />
                    </motion.div>
                  </Link>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className={cn(
                    "p-2 rounded-lg border transition-all duration-200",
                    themeConfig.surface.hover,
                    themeConfig.text.secondary,
                    themeConfig.border
                  )}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div
            className={cn(
              "max-h-80 overflow-y-auto",
              isDarkMode ? "scrollbar-dark" : "scrollbar-light"
            )}
          >
            <AnimatePresence mode="wait">
              {viewMode === "list" ? (
                // LIST VIEW
                <motion.div
                  key="list-view"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {groupedNotifications.length > 0 ? (
                    <div className={cn("space-y-2 p-4", themeConfig.border)}>
                      {groupedNotifications.map((item, index) => (
                        <motion.div
                          key={
                            isGroupedNotification(item) ? item._id : item._id
                          }
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                        >
                          {isGroupedNotification(item) ? (
                            <GroupedNotificationItem
                              group={item}
                              onClose={onClose}
                              onGroupClick={handleGroupClick}
                              getNotificationIcon={iconConfig.notification}
                              themeConfig={themeConfig}
                              iconConfig={iconConfig}
                            />
                          ) : (
                            <NotificationItem
                              notification={item}
                              onClose={onClose}
                              getNotificationIcon={iconConfig.notification}
                              themeConfig={themeConfig}
                              iconConfig={iconConfig}
                            />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    // Empty state
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <div
                        className={cn(
                          "w-20 h-20 rounded-2xl flex items-center justify-center mb-4 border",
                          themeConfig.card,
                          themeConfig.border
                        )}
                      >
                        <Sparkles
                          className={cn("w-6 h-6", themeConfig.text.secondary)}
                        />
                      </div>
                      <h4
                        className={cn(
                          "font-bold text-lg mb-2",
                          themeConfig.text.primary
                        )}
                      >
                        All caught up! 🎉
                      </h4>
                      <p
                        className={cn(
                          "text-sm mb-6 max-w-xs",
                          themeConfig.text.secondary
                        )}
                      >
                        You're all set! We'll notify you when something new
                        happens.
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                // GROUP VIEW - Updated to match NotificationItem styling
                <motion.div
                  key="group-view"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2 p-2" // ✅ Same spacing as list view
                >
                  {selectedGroup && (
                    <div className="space-y-2">
                      {" "}
                      {/* ✅ Consistent spacing */}
                      {selectedGroup.notifications.map(
                        (notification, index) => (
                          <motion.div
                            key={notification._id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={() =>
                              handleGroupNotificationClick(notification)
                            }
                            className={cn(
                              "transition-all duration-200 rounded-xl", // ✅ Same rounded-xl
                              "hover:shadow-sm hover:border border-blue-300 dark:hover:border-blue-600", // ✅ Same hover effects
                              variant === "mobile"
                                ? "w-full"
                                : "w-[90%] mx-auto", // ✅ Same width handling
                              "cursor-pointer", // ✅ Same cursor
                              notification.isRead
                                ? cn(
                                    themeConfig.card,
                                    themeConfig.border,
                                    "bg-white/50 dark:bg-gray-800/50" // ✅ Same background
                                  )
                                : cn(
                                    themeConfig.accent.background,
                                    "border-blue-200 dark:border-blue-800", // ✅ Same border colors
                                    "ring-1 ring-blue-500/20 shadow-sm" // ✅ Same ring effect
                                  )
                            )}
                          >
                            <div className="p-3">
                              {" "}
                              {/* ✅ Same padding as grouped items */}
                              <div className="flex items-start gap-2">
                                {" "}
                                {/* ✅ Same gap */}
                                {/* Notification Icon - matches grouped item styling */}
                                <div className="flex-shrink-0">
                                  <div
                                    className={cn(
                                      "p-1.5 rounded-lg transition-colors duration-200", // ✅ Same icon styling
                                      notification.isRead
                                        ? "bg-gray-100/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-400"
                                        : "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                                    )}
                                  >
                                    {iconConfig.notification(notification.type)}
                                  </div>
                                </div>
                                {/* Content - matches grouped item structure */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      {/* Title and status - same layout */}
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

                                      {/* Message - same compact styling */}
                                      <p
                                        className={cn(
                                          "text-xs leading-relaxed line-clamp-1 mb-1", // ✅ Same line clamp
                                          themeConfig.text.secondary
                                        )}
                                      >
                                        {notification.message}
                                      </p>

                                      {/* Metadata - same single line layout */}
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={cn(
                                            "text-[10px]",
                                            themeConfig.text.muted
                                          )}
                                        >
                                          {getTimeAgo(notification.createdAt)}
                                        </span>

                                        {/* Action indicator */}
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
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* FOOTER - Only show in list view */}
          {viewMode === "list" && groupedNotifications.length > 0 && (
            <div
              className={cn(
                "p-4 border-t",
                themeConfig.border,
                themeConfig.card
              )}
            >
              <div className="flex items-center justify-between">
                <Link href="/notifications" onClick={onClose}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border",
                      themeConfig.surface.hover,
                      themeConfig.accent.text,
                      themeConfig.accent.border,
                      "flex items-center gap-2"
                    )}
                  >
                    View all notifications
                    <MoreHorizontal className="w-4 h-4" />
                  </motion.div>
                </Link>
                <span
                  className={cn(
                    "text-xs font-semibold",
                    themeConfig.text.secondary
                  )}
                >
                  {groupedNotifications.length} total
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
