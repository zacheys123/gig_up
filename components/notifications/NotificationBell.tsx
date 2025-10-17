// components/notifications/NotificationBell.tsx
"use client";
import { Bell, BellRing } from "lucide-react";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { NotificationDropdown } from "./NotificationsDropdown";
import { useNotificationSystem } from "@/hooks/useNotifications";

interface NotificationBellProps {
  variant?: "desktop" | "mobile";
}

export function NotificationBell({
  variant = "desktop",
}: NotificationBellProps) {
  const { unreadCount } = useNotificationSystem(); // <-- USE NEW HOOK
  const { colors } = useThemeColors();
  const [isOpen, setIsOpen] = useState(false);

  const hasUnread = unreadCount > 0;
  const Icon = hasUnread ? BellRing : Bell;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-2 rounded-md transition-all duration-200 relative group",
          "hover:bg-gray-100 dark:hover:bg-gray-800",
          "focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50",
          colors.text,
          variant === "mobile" && "p-1"
        )}
        aria-label={`Notifications ${hasUnread ? `(${unreadCount} unread)` : ""}`}
      >
        <Icon
          className={cn(
            "transition-transform duration-200",
            "group-hover:text-amber-600 dark:group-hover:text-amber-400",
            variant === "mobile" ? "w-5 h-5" : "w-5 h-5"
          )}
        />

        {/* Animated Badge */}
        {hasUnread && (
          <span
            className={cn(
              "absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center",
              "animate-pulse-subtle",
              variant === "mobile" ? "w-4 h-4 text-[10px]" : "w-5 h-5 text-xs"
            )}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <NotificationDropdown
          onClose={() => setIsOpen(false)}
          variant={variant}
        />
      )}
    </div>
  );
}
