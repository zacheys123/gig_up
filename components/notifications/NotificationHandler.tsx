// components/notifications/NotificationToast.tsx
"use client";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ToastNotification } from "@/hooks/useNotifications";

// Notification type configuration using your theme colors
const NOTIFICATION_TYPE_CONFIG = {
  profile_view: {
    icon: "👁️",
    label: "Profile View",
    colorVariant: "info" as const,
  },
  follow_request: {
    icon: "👥",
    label: "Follow Request",
    colorVariant: "warning" as const,
  },
  new_follower: {
    icon: "❤️",
    label: "New Follower",
    colorVariant: "success" as const,
  },
  follow_accepted: {
    icon: "✅",
    label: "Follow Accepted",
    colorVariant: "success" as const,
  },
  gig_invite: {
    icon: "🎵",
    label: "Gig Invite",
    colorVariant: "primary" as const,
  },
  gig_approved: {
    icon: "🎉",
    label: "Gig Approved",
    colorVariant: "success" as const,
  },
  gig_reminder: {
    icon: "⏰",
    label: "Gig Reminder",
    colorVariant: "warning" as const,
  },
  new_message: {
    icon: "💬",
    label: "Message",
    colorVariant: "info" as const,
  },
  new_review: {
    icon: "⭐",
    label: "Review",
    colorVariant: "warning" as const,
  },
  review_received: {
    icon: "🌟",
    label: "Review Received",
    colorVariant: "success" as const,
  },
  system_alert: {
    icon: "⚠️",
    label: "System Alert",
    colorVariant: "danger" as const,
  },
  system_updates: {
    icon: "🔄",
    label: "System Update",
    colorVariant: "info" as const,
  },
} as const;

const DEFAULT_CONFIG = {
  icon: "🔔",
  label: "Notification",
  colorVariant: "info" as const,
};

const getNotificationConfig = (type: string) => {
  return (
    NOTIFICATION_TYPE_CONFIG[type as keyof typeof NOTIFICATION_TYPE_CONFIG] ||
    DEFAULT_CONFIG
  );
};

// Helper to get theme colors based on variant
const getThemeColors = (colors: any, variant: string, isDarkMode: boolean) => {
  const baseColors = {
    // Background colors
    bg: isDarkMode ? colors.card : colors.background,
    border: colors.border,

    // Text colors
    text: colors.text,
    textMuted: colors.textMuted,

    // Close button
    close: colors.textMuted,
    closeHover: isDarkMode ? "hover:bg-white/10" : "hover:bg-black/5",
  };

  switch (variant) {
    case "primary":
      return {
        ...baseColors,
        iconBg: isDarkMode ? "bg-orange-900/30" : "bg-orange-100",
        icon: isDarkMode ? "text-orange-400" : "text-orange-600",
        accent: isDarkMode ? "text-orange-400" : "text-orange-600",
        accentHover: isDarkMode
          ? "hover:text-orange-300"
          : "hover:text-orange-700",
        badge: isDarkMode
          ? "bg-orange-900/30 text-orange-300"
          : "bg-orange-100 text-orange-700",
      };
    case "success":
      return {
        ...baseColors,
        iconBg: isDarkMode ? "bg-green-900/30" : "bg-green-100",
        icon: isDarkMode ? "text-green-400" : "text-green-600",
        accent: isDarkMode ? "text-green-400" : "text-green-600",
        accentHover: isDarkMode
          ? "hover:text-green-300"
          : "hover:text-green-700",
        badge: isDarkMode
          ? "bg-green-900/30 text-green-300"
          : "bg-green-100 text-green-700",
      };
    case "warning":
      return {
        ...baseColors,
        iconBg: isDarkMode ? "bg-amber-900/30" : "bg-amber-100",
        icon: isDarkMode ? "text-amber-400" : "text-amber-600",
        accent: isDarkMode ? "text-amber-400" : "text-amber-600",
        accentHover: isDarkMode
          ? "hover:text-amber-300"
          : "hover:text-amber-700",
        badge: isDarkMode
          ? "bg-amber-900/30 text-amber-300"
          : "bg-amber-100 text-amber-700",
      };
    case "danger":
      return {
        ...baseColors,
        iconBg: isDarkMode ? "bg-red-900/30" : "bg-red-100",
        icon: isDarkMode ? "text-red-400" : "text-red-600",
        accent: isDarkMode ? "text-red-400" : "text-red-600",
        accentHover: isDarkMode ? "hover:text-red-300" : "hover:text-red-700",
        badge: isDarkMode
          ? "bg-red-900/30 text-red-300"
          : "bg-red-100 text-red-700",
      };
    case "info":
    default:
      return {
        ...baseColors,
        iconBg: isDarkMode ? "bg-blue-900/30" : "bg-blue-100",
        icon: isDarkMode ? "text-blue-400" : "text-blue-600",
        accent: isDarkMode ? "text-blue-400" : "text-blue-600",
        accentHover: isDarkMode ? "hover:text-blue-300" : "hover:text-blue-700",
        badge: isDarkMode
          ? "bg-blue-900/30 text-blue-300"
          : "bg-blue-100 text-blue-700",
      };
  }
};

interface NotificationToastProps {
  toast: ToastNotification;
  onClose: () => void;
}

export function NotificationToast({ toast, onClose }: NotificationToastProps) {
  const { colors, isDarkMode } = useThemeColors();
  const config = getNotificationConfig(toast.type);
  const themeColors = getThemeColors(colors, config.colorVariant, isDarkMode);

  const handleToastClick = () => {
    if (toast.actionUrl) {
      onClose();
    }
  };

  const ToastContent = () => (
    <div
      className={cn(
        "rounded-xl border p-4 shadow-lg max-w-sm w-full backdrop-blur-sm",
        "transition-all duration-200 hover:shadow-xl cursor-pointer",
        "border-2 hover:border-opacity-50",
        themeColors.bg,
        themeColors.border,
        "hover:scale-[1.02] transform transition-transform"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center text-lg",
              themeColors.iconBg,
              themeColors.icon
            )}
          >
            {config.icon}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h4
                className={cn("font-semibold text-sm mb-1", themeColors.text)}
              >
                {toast.title}
              </h4>
              <p
                className={cn("text-sm leading-relaxed", themeColors.textMuted)}
              >
                {toast.message}
              </p>
            </div>
          </div>

          {/* Action and Metadata */}
          <div className="flex items-center justify-between mt-2">
            {toast.actionUrl ? (
              <Link
                href={toast.actionUrl}
                className={cn(
                  "text-xs font-medium transition-colors hover:underline",
                  themeColors.accent,
                  themeColors.accentHover
                )}
                onClick={onClose}
              >
                View details →
              </Link>
            ) : (
              <span
                className={cn(
                  "text-xs px-2 py-1 rounded-full font-medium",
                  themeColors.badge
                )}
              >
                {config.label}
              </span>
            )}

            <span className={cn("text-xs", themeColors.textMuted)}>
              just now
            </span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className={cn(
            "flex-shrink-0 p-1 rounded-full transition-colors",
            themeColors.closeHover,
            themeColors.close
          )}
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        layout: { duration: 0.3 },
      }}
      onClick={handleToastClick}
      className="cursor-pointer"
    >
      {toast.actionUrl ? (
        <Link href={toast.actionUrl}>
          <ToastContent />
        </Link>
      ) : (
        <div>
          <ToastContent />
        </div>
      )}
    </motion.div>
  );
}
