// components/notifications/NotificationDropdown.tsx
"use client";
import {
  useNotifications,
  useNotificationActions,
} from "@/hooks/useNotifications";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Bell,
  Settings,
  CheckCheck,
  Sparkles,
  MoreHorizontal,
  User,
  Calendar,
  MessageCircle,
  Heart,
  Users,
  Eye,
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
  const { notifications, unreadCount } = useNotifications(10);
  const { markAllAsRead } = useNotificationActions();
  const { userId } = useAuth();
  const { colors, isDarkMode } = useThemeColors();

  const handleMarkAllRead = async () => {
    if (userId && unreadCount > 0) {
      await markAllAsRead({ clerkId: userId });
    }
  };

  const dropdownWidth = variant === "mobile" ? "w-80" : "w-96";

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    const iconClass = "w-4 h-4";

    switch (type) {
      case "profile_view":
        return <Eye className={cn(iconClass, "text-blue-500")} />;
      case "like":
        return <Heart className={cn(iconClass, "text-red-500")} />;
      case "comment":
        return <MessageCircle className={cn(iconClass, "text-green-500")} />;
      case "follow":
        return <Users className={cn(iconClass, "text-purple-500")} />;
      case "booking":
        return <Calendar className={cn(iconClass, "text-amber-500")} />;
      default:
        return <Bell className={cn(iconClass, "text-gray-500")} />;
    }
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dropdown Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -8 }}
        transition={{ type: "spring", duration: 0.3 }}
        className={cn(
          "absolute right-0 top-12 z-50 rounded-2xl shadow-2xl border backdrop-blur-xl",
          "transform-gpu", // Better performance for animations
          dropdownWidth,
          isDarkMode
            ? "bg-gray-900/95 border-gray-700/50 shadow-black/40"
            : "bg-white/95 border-gray-200/80 shadow-gray-400/20"
        )}
        style={{
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Header - Instagram/TikTok Inspired */}
        <div
          className={cn(
            "p-4 border-b",
            isDarkMode ? "border-gray-700/60" : "border-gray-200/60"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-xl",
                  isDarkMode ? "bg-blue-500/20" : "bg-blue-500/10"
                )}
              >
                <Bell
                  className={cn(
                    "w-5 h-5",
                    isDarkMode ? "text-blue-400" : "text-blue-600"
                  )}
                />
              </div>
              <div>
                <h3
                  className={cn(
                    "font-bold text-lg",
                    isDarkMode ? "text-white" : "text-gray-900"
                  )}
                >
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <p
                    className={cn(
                      "text-sm",
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    {unreadCount} unread
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMarkAllRead}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200 font-medium text-sm",
                    "hover:shadow-sm",
                    isDarkMode
                      ? "text-blue-400 hover:bg-blue-500/20"
                      : "text-blue-600 hover:bg-blue-500/10"
                  )}
                >
                  <CheckCheck className="w-4 h-4" />
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "p-2 rounded-lg transition-all duration-200",
                  isDarkMode
                    ? "hover:bg-gray-700/60 text-gray-400"
                    : "hover:bg-gray-100 text-gray-600"
                )}
              >
                <MoreHorizontal className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Notifications List - TikTok Smooth Scrolling */}
        <div
          className={cn(
            "max-h-80 overflow-y-auto custom-scrollbar",
            isDarkMode ? "scrollbar-dark" : "scrollbar-light"
          )}
        >
          {notifications.length > 0 ? (
            <div className="divide-y divide-gray-100/30 dark:divide-gray-700/30">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <NotificationItem
                    notification={notification}
                    onClose={onClose}
                    // getNotificationIcon={getNotificationIcon}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            /* Empty State - Facebook Inspired */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center"
            >
              <div
                className={cn(
                  "w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center",
                  isDarkMode ? "bg-gray-800" : "bg-gray-100"
                )}
              >
                <Sparkles
                  className={cn(
                    "w-8 h-8",
                    isDarkMode ? "text-gray-600" : "text-gray-400"
                  )}
                />
              </div>
              <h4
                className={cn(
                  "font-semibold text-lg mb-2",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}
              >
                All caught up! 🎉
              </h4>
              <p
                className={cn(
                  "text-sm mb-4",
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                )}
              >
                You're up to date with your notifications
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg",
                  "hover:shadow-xl transform-gpu"
                )}
              >
                Explore Feed
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Footer - Professional Clean Look */}
        {notifications.length > 0 && (
          <div
            className={cn(
              "p-4 border-t",
              isDarkMode ? "border-gray-700/60" : "border-gray-200/60"
            )}
          >
            <div className="flex items-center justify-between">
              <Link
                href="/notifications"
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  "hover:shadow-sm",
                  isDarkMode
                    ? "text-blue-400 hover:bg-blue-500/20"
                    : "text-blue-600 hover:bg-blue-500/10"
                )}
                onClick={onClose}
              >
                View all notifications
              </Link>

              <Link
                href="/notifications/settings"
                className={cn(
                  "p-2 rounded-lg transition-all duration-200",
                  isDarkMode
                    ? "hover:bg-gray-700/60 text-gray-400"
                    : "hover:bg-gray-100 text-gray-600"
                )}
                onClick={onClose}
              >
                <Settings className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </motion.div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          border-radius: 10px;
        }
        .scrollbar-light::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
        }
        .scrollbar-light::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
        .scrollbar-dark::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
        }
        .scrollbar-dark::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </AnimatePresence>
  );
}
