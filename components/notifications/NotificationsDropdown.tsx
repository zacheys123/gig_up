// components/notifications/NotificationDropdown.tsx
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
import { motion, AnimatePresence } from "framer-motion";

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

  const handleMarkAllRead = async () => {
    if (userId && unreadCount > 0) {
      await markAllAsRead();
    }
  };

  const dropdownWidth = variant === "mobile" ? "w-80" : "w-96";

  // Centralized theme configuration
  const themeConfig = {
    background: isDarkMode
      ? "bg-gray-900/95 backdrop-blur-xl"
      : "bg-white/95 backdrop-blur-xl",
    border: isDarkMode ? "border-gray-700/50" : "border-gray-200/80",
    text: {
      primary: isDarkMode ? "text-white" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-300" : "text-gray-700",
      muted: isDarkMode ? "text-gray-400" : "text-gray-500",
    },
    accent: {
      primary: isDarkMode ? "text-blue-400" : "text-blue-600",
      background: isDarkMode ? "bg-blue-500/20" : "bg-blue-500/10",
      hover: isDarkMode ? "hover:bg-blue-500/20" : "hover:bg-blue-500/10",
    },
    surface: {
      primary: isDarkMode ? "bg-gray-800/50" : "bg-gray-50/80",
      secondary: isDarkMode ? "bg-gray-800" : "bg-gray-100",
      hover: isDarkMode ? "hover:bg-gray-800/60" : "hover:bg-gray-100/80",
    },
    divider: isDarkMode ? "divide-gray-700/50" : "divide-gray-200/50",
  };

  // Updated icon configuration to match your backend notification types
  const iconConfig = {
    size: {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    },
    notification: (type: string) => {
      const baseClass = "w-4 h-4";
      switch (type) {
        // Profile & Social
        case "profile_view":
          return <Eye className={cn(baseClass, "text-blue-500")} />;
        case "new_follower":
        case "follow_request":
        case "follow_accepted":
          return <Users className={cn(baseClass, "text-purple-500")} />;
        case "like":
          return <Heart className={cn(baseClass, "text-red-500")} />;
        case "share":
          return <Share className={cn(baseClass, "text-indigo-500")} />;

        // Messages
        case "new_message":
          return <MessageCircle className={cn(baseClass, "text-green-500")} />;

        // Gigs & Bookings
        case "gig_invite":
        case "gig_application":
        case "gig_approved":
        case "gig_rejected":
        case "gig_cancelled":
        case "gig_reminder":
          return <Calendar className={cn(baseClass, "text-amber-500")} />;

        // Reviews
        case "new_review":
        case "review_received":
          return <Star className={cn(baseClass, "text-yellow-500")} />;

        // System
        case "system_alert":
          return <AlertTriangle className={cn(baseClass, "text-orange-500")} />;

        // Default
        default:
          return <Bell className={cn(baseClass, "text-gray-500")} />;
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
      initial: { opacity: 0, scale: 0.95, y: -8 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.95, y: -8 },
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
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dropdown Panel - Centered Theme */}
      <motion.div
        {...animationVariants.dropdown}
        transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
        className={cn(
          "absolute right-0 top-12 z-50 rounded-2xl shadow-2xl border transform-gpu",
          themeConfig.background,
          themeConfig.border,
          dropdownWidth
        )}
        style={{
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Header */}
        <div className={cn("p-6 border-b", themeConfig.border)}>
          <div className="flex items-center justify-between">
            {/* Title Section */}
            <div className="flex items-center gap-3">
              <div
                className={cn("p-2 rounded-xl", themeConfig.accent.background)}
              >
                <Bell
                  className={cn(iconConfig.size.md, themeConfig.accent.primary)}
                />
              </div>
              <div className="flex flex-col">
                <h3
                  className={cn(
                    "font-bold text-lg leading-tight",
                    themeConfig.text.primary
                  )}
                >
                  Notifications
                </h3>
                {unreadCount > 0 ? (
                  <p
                    className={cn(
                      "text-sm font-medium",
                      themeConfig.accent.primary
                    )}
                  >
                    {unreadCount} new notification{unreadCount !== 1 ? "s" : ""}
                  </p>
                ) : (
                  <p className={cn("text-sm", themeConfig.text.muted)}>
                    All caught up
                  </p>
                )}
              </div>
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMarkAllRead}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200 font-medium",
                    themeConfig.surface.hover,
                    themeConfig.accent.primary
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
                    "p-2 rounded-lg transition-all duration-200",
                    themeConfig.surface.hover,
                    themeConfig.text.muted
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
          {notifications.length > 0 ? (
            <div className={cn("divide-y", themeConfig.divider)}>
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification._id}
                  {...animationVariants.item}
                  transition={{ delay: index * 0.03 }}
                >
                  <NotificationItem
                    notification={notification}
                    onClose={onClose}
                    getNotificationIcon={iconConfig.notification}
                    themeConfig={themeConfig}
                    iconConfig={iconConfig}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center p-8 text-center"
            >
              <div
                className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center mb-4",
                  themeConfig.surface.secondary
                )}
              >
                <Sparkles
                  className={cn(iconConfig.size.lg, themeConfig.text.muted)}
                />
              </div>
              <h4
                className={cn(
                  "font-semibold text-lg mb-2",
                  themeConfig.text.primary
                )}
              >
                All caught up! 🎉
              </h4>
              <p
                className={cn("text-sm mb-6 max-w-xs", themeConfig.text.muted)}
              >
                You're all set! We'll notify you when something new happens.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                  "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg",
                  "hover:shadow-xl transform-gpu flex items-center gap-2"
                )}
              >
                <Zap className="w-4 h-4" />
                Explore Feed
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className={cn("p-4 border-t", themeConfig.border)}>
            <div className="flex items-center justify-between">
              <Link href="/notifications" onClick={onClose}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                    themeConfig.surface.hover,
                    themeConfig.accent.primary,
                    "flex items-center gap-2"
                  )}
                >
                  View all notifications
                  <MoreHorizontal className={iconConfig.size.sm} />
                </motion.div>
              </Link>

              <div className="flex items-center gap-2 text-xs">
                <span className={themeConfig.text.muted}>
                  {notifications.length} total
                </span>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
        }
        .custom-scrollbar:hover {
          scrollbar-color: auto;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          border-radius: 10px;
          transition: all 0.3s ease;
        }
        .scrollbar-light::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
        }
        .scrollbar-light::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.2);
        }
        .scrollbar-dark::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
        }
        .scrollbar-dark::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </AnimatePresence>
  );
}
