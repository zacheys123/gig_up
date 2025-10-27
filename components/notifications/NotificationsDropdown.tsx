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
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { NotificationItem } from "./NotificationsItem";
import { GroupedNotificationItem } from "./GroupedNotificationItem";
import { motion, AnimatePresence } from "framer-motion";
import { groupNotifications, isGroupedNotification } from "@/utils";

interface NotificationDropdownProps {
  onClose: () => void;
  variant?: "desktop" | "mobile";
}

export function NotificationDropdown({
  onClose,
  variant = "desktop",
}: NotificationDropdownProps) {
  const { notifications, unreadCount, markAllAsRead } = useNotificationSystem();
  const { userId } = useAuth();
  const { colors, isDarkMode } = useThemeColors();

  // ✅ APPLY GROUPING TO DROPDOWN NOTIFICATIONS
  const groupedNotifications = groupNotifications(notifications || []);

  // ✅ CALCULATE GROUPED UNREAD COUNT
  const groupedUnreadCount = groupedNotifications.reduce((count, item) => {
    if (isGroupedNotification(item)) {
      return count + (item.isRead ? 0 : 1); // Count groups as 1 unread item
    } else {
      return count + (item.isRead ? 0 : 1);
    }
  }, 0);

  const handleMarkAllRead = async () => {
    if (userId && groupedUnreadCount > 0) {
      await markAllAsRead();
    }
  };

  const dropdownWidth = variant === "mobile" ? "w-80" : "w-96";

  // Enhanced theme configuration for better visibility
  const themeConfig = {
    background: isDarkMode
      ? "bg-gray-900/98 backdrop-blur-xl"
      : "bg-white/98 backdrop-blur-xl",
    border: isDarkMode ? "border-gray-600" : "border-gray-300",
    text: {
      primary: isDarkMode ? "text-white" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-200" : "text-gray-700",
      muted: isDarkMode ? "text-gray-400" : "text-gray-600",
    },
    accent: {
      primary: isDarkMode ? "text-blue-400" : "text-blue-600",
      background: isDarkMode ? "bg-blue-500/30" : "bg-blue-500/15",
      hover: isDarkMode ? "hover:bg-blue-500/30" : "hover:bg-blue-500/15",
    },
    surface: {
      primary: isDarkMode ? "bg-gray-800/80" : "bg-gray-50/90",
      secondary: isDarkMode ? "bg-gray-800" : "bg-gray-100",
      hover: isDarkMode ? "hover:bg-gray-700/80" : "hover:bg-gray-200/80",
    },
    divider: isDarkMode ? "divide-gray-700" : "divide-gray-300",
  };

  // Enhanced icon configuration with better visibility
  const iconConfig = {
    size: {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    },
    notification: (type: string) => {
      const baseClass = "w-4 h-4";
      switch (type) {
        case "profile_view":
          return <Eye className={cn(baseClass, "text-blue-400")} />;
        case "new_follower":
        case "follow_request":
        case "follow_accepted":
          return <Users className={cn(baseClass, "text-purple-400")} />;
        case "like":
          return <Heart className={cn(baseClass, "text-red-400")} />;
        case "share":
          return <Share className={cn(baseClass, "text-indigo-400")} />;
        case "new_message":
          return <MessageCircle className={cn(baseClass, "text-green-400")} />;
        case "gig_invite":
        case "gig_application":
        case "gig_approved":
        case "gig_rejected":
        case "gig_cancelled":
        case "gig_reminder":
          return <Calendar className={cn(baseClass, "text-amber-400")} />;
        case "new_review":
        case "review_received":
          return <Star className={cn(baseClass, "text-yellow-400")} />;
        case "system_alert":
          return <AlertTriangle className={cn(baseClass, "text-orange-400")} />;
        default:
          return <Bell className={cn(baseClass, "text-gray-400")} />;
      }
    },
  };

  // Animation variants
  const animationVariants = {
    backdrop: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    dropdown: {
      initial: {
        opacity: 0,
        scale: 0.95,
        y: -8,
        x: variant === "mobile" ? "-50%" : 0,
      },
      animate: {
        opacity: 1,
        scale: 1,
        y: 0,
        x: variant === "mobile" ? "-50%" : 0,
      },
      exit: {
        opacity: 0,
        scale: 0.95,
        y: -8,
        x: variant === "mobile" ? "-50%" : 0,
      },
    },
    item: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
    },
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        {...animationVariants.backdrop}
        className="fixed inset-0 z-60 bg-black/30 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dropdown Panel - Enhanced for visibility */}
      <motion.div
        {...animationVariants.dropdown}
        transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
        className={cn(
          "absolute top-12 z-50 rounded-2xl shadow-2xl border transform-gpu",
          themeConfig.background,
          themeConfig.border,
          dropdownWidth,
          "ring-1",
          isDarkMode ? "ring-gray-700" : "ring-gray-200",
          // Mobile positioning - centered
          variant === "mobile"
            ? "left-18 -translate-x-1/2 mx-4" // Centered with margin
            : "right-0" // Desktop positioning
        )}
        style={{
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          // Ensure it doesn't go off-screen on mobile
          maxWidth: variant === "mobile" ? "calc(100vw - 2rem)" : "none",
        }}
      >
        {/* Header - Enhanced contrast */}
        <div className={cn("p-6 border-b", themeConfig.border)}>
          <div className="flex items-center justify-between">
            {/* Title Section */}
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-xl border",
                  themeConfig.accent.background,
                  isDarkMode ? "border-blue-400/30" : "border-blue-500/20"
                )}
              >
                <Bell
                  className={cn(
                    iconConfig.size.md,
                    themeConfig.accent.primary,
                    "drop-shadow-sm"
                  )}
                />
              </div>
              <div className="flex flex-col">
                <h3
                  className={cn(
                    "font-bold text-lg leading-tight drop-shadow-sm",
                    themeConfig.text.primary
                  )}
                >
                  Notifications
                </h3>
                {groupedUnreadCount > 0 ? (
                  <p
                    className={cn(
                      "text-sm font-semibold mt-1",
                      themeConfig.accent.primary,
                      "drop-shadow-sm"
                    )}
                  >
                    {groupedUnreadCount} new notification
                    {groupedUnreadCount !== 1 ? "s" : ""}
                  </p>
                ) : (
                  <p
                    className={cn(
                      "text-sm mt-1 font-medium",
                      themeConfig.text.muted
                    )}
                  >
                    All caught up
                  </p>
                )}
              </div>
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-1">
              {groupedUnreadCount > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMarkAllRead}
                  className={cn(
                    "p-2 rounded-lg border transition-all duration-200 font-semibold",
                    themeConfig.surface.hover,
                    themeConfig.accent.primary,
                    isDarkMode ? "border-blue-400/30" : "border-blue-500/20"
                  )}
                  title="Mark all as read"
                >
                  <CheckCheck className={iconConfig.size.sm} />
                </motion.button>
              )}
              <Link href="/settings/notifications" onClick={onClose}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "p-2 rounded-lg border transition-all duration-200",
                    themeConfig.surface.hover,
                    themeConfig.text.muted,
                    isDarkMode ? "border-gray-600" : "border-gray-300"
                  )}
                  title="Notification settings"
                >
                  <Settings className={iconConfig.size.sm} />
                </motion.div>
              </Link>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div
          className={cn(
            "max-h-80 overflow-y-auto custom-scrollbar",
            isDarkMode ? "scrollbar-dark" : "scrollbar-light"
          )}
        >
          {groupedNotifications.length > 0 ? (
            <div className={cn("divide-y", themeConfig.divider)}>
              {groupedNotifications.map((item, index) => (
                <motion.div
                  key={isGroupedNotification(item) ? item._id : item._id}
                  {...animationVariants.item}
                  transition={{ delay: index * 0.03 }}
                >
                  {isGroupedNotification(item) ? (
                    // ✅ RENDER GROUPED NOTIFICATION
                    <GroupedNotificationItem
                      group={item}
                      onClose={onClose}
                      getNotificationIcon={iconConfig.notification}
                      themeConfig={themeConfig}
                      iconConfig={iconConfig}
                    />
                  ) : (
                    // ✅ RENDER INDIVIDUAL NOTIFICATION (using your existing NotificationItem)
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
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center p-8 text-center"
            >
              <div
                className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center mb-4 border",
                  themeConfig.surface.secondary,
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                )}
              >
                <Sparkles
                  className={cn(
                    iconConfig.size.lg,
                    themeConfig.text.muted,
                    "drop-shadow-sm"
                  )}
                />
              </div>
              <h4
                className={cn(
                  "font-bold text-lg mb-2 drop-shadow-sm",
                  themeConfig.text.primary
                )}
              >
                All caught up! 🎉
              </h4>
              <p
                className={cn(
                  "text-sm mb-6 max-w-xs font-medium",
                  themeConfig.text.muted
                )}
              >
                You're all set! We'll notify you when something new happens.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 border",
                  "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg",
                  "hover:shadow-xl transform-gpu flex items-center gap-2",
                  "border-blue-400/30"
                )}
              >
                <Zap className="w-4 h-4" />
                Explore Feed
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Enhanced Footer */}
        {groupedNotifications.length > 0 && (
          <div className={cn("p-4 border-t", themeConfig.border)}>
            <div className="flex items-center justify-between">
              <Link href="/notifications" onClick={onClose}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border",
                    themeConfig.surface.hover,
                    themeConfig.accent.primary,
                    "flex items-center gap-2",
                    isDarkMode ? "border-blue-400/30" : "border-blue-500/20"
                  )}
                >
                  View all notifications
                  <MoreHorizontal className={iconConfig.size.sm} />
                </motion.div>
              </Link>

              <div className="flex items-center gap-2 text-xs">
                <span className={cn("font-semibold", themeConfig.text.muted)}>
                  {groupedNotifications.length} total
                </span>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Enhanced Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
        }
        .custom-scrollbar:hover {
          scrollbar-color: auto;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
          margin: 4px 0;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          border-radius: 10px;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .scrollbar-light::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.3);
          border: 2px solid rgba(255, 255, 255, 0.8);
        }
        .scrollbar-light::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.5);
        }
        .scrollbar-dark::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border: 2px solid rgba(0, 0, 0, 0.3);
        }
        .scrollbar-dark::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </AnimatePresence>
  );
}
