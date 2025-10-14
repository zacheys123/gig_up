// components/notifications/NotificationDropdown.tsx
"use client";
import {
  useNotifications,
  useNotificationActions,
} from "@/hooks/useNotifications";

import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Bell, Settings } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { NotificationItem } from "./NotificationsItem";

interface NotificationDropdownProps {
  onClose: () => void;
  variant?: "desktop" | "mobile";
}

export function NotificationDropdown({
  onClose,
  variant = "desktop",
}: NotificationDropdownProps) {
  const { notifications, unreadCount } = useNotifications(10); // Last 10 notifications
  const { markAllAsRead } = useNotificationActions();
  const { colors } = useThemeColors();
  const { userId } = useAuth();

  const handleMarkAllRead = async () => {
    if (userId && unreadCount > 0) {
      await markAllAsRead({ clerkId: userId });
    }
  };

  const dropdownWidth = variant === "mobile" ? "w-80" : "w-96";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dropdown Panel */}
      <div
        className={cn(
          "absolute right-0 top-12 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700",
          "animate-in fade-in-80 slide-in-from-top-2",
          dropdownWidth
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-600" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Mark all read
                </button>
              )}
              <Link
                href="/notifications/settings"
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                onClick={onClose}
              >
                <Settings className="w-4 h-4 text-gray-500" />
              </Link>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onClose={onClose}
                />
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No notifications yet
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                We'll notify you when something arrives
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/notifications"
              className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              onClick={onClose}
            >
              View all notifications
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
