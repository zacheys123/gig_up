// components/notifications/NotificationToast.tsx
"use client";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ToastNotification } from "@/hooks/useNotifications";

// Import the same color configuration from your notifications page
const NOTIFICATION_TYPE_CONFIG = {
  profile_view: {
    icon: "👁️",
    label: "Profile View",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
    textColor: "text-blue-700 dark:text-blue-300",
    actionColor: "text-blue-600 dark:text-blue-400",
  },
  follow_request: {
    icon: "👥",
    label: "Follow Request",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    borderColor: "border-orange-200 dark:border-orange-800",
    iconColor: "text-orange-600 dark:text-orange-400",
    textColor: "text-orange-700 dark:text-orange-300",
    actionColor: "text-orange-600 dark:text-orange-400",
  },
  new_follower: {
    icon: "❤️",
    label: "New Follower",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
    iconColor: "text-green-600 dark:text-green-400",
    textColor: "text-green-700 dark:text-green-300",
    actionColor: "text-green-600 dark:text-green-400",
  },
  follow_accepted: {
    icon: "✅",
    label: "Follow Accepted",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    textColor: "text-emerald-700 dark:text-emerald-300",
    actionColor: "text-emerald-600 dark:text-emerald-400",
  },
  gig_invite: {
    icon: "🎵",
    label: "Gig Invite",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    borderColor: "border-purple-200 dark:border-purple-800",
    iconColor: "text-purple-600 dark:text-purple-400",
    textColor: "text-purple-700 dark:text-purple-300",
    actionColor: "text-purple-600 dark:text-purple-400",
  },
  gig_approved: {
    icon: "🎉",
    label: "Gig Approved",
    bgColor: "bg-teal-50 dark:bg-teal-900/20",
    borderColor: "border-teal-200 dark:border-teal-800",
    iconColor: "text-teal-600 dark:text-teal-400",
    textColor: "text-teal-700 dark:text-teal-300",
    actionColor: "text-teal-600 dark:text-teal-400",
  },
  gig_reminder: {
    icon: "⏰",
    label: "Gig Reminder",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    borderColor: "border-amber-200 dark:border-amber-800",
    iconColor: "text-amber-600 dark:text-amber-400",
    textColor: "text-amber-700 dark:text-amber-300",
    actionColor: "text-amber-600 dark:text-amber-400",
  },
  new_message: {
    icon: "💬",
    label: "Message",
    bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
    borderColor: "border-indigo-200 dark:border-indigo-800",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    textColor: "text-indigo-700 dark:text-indigo-300",
    actionColor: "text-indigo-600 dark:text-indigo-400",
  },
  new_review: {
    icon: "⭐",
    label: "Review",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    textColor: "text-yellow-700 dark:text-yellow-300",
    actionColor: "text-yellow-600 dark:text-yellow-400",
  },
  review_received: {
    icon: "🌟",
    label: "Review Received",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    borderColor: "border-amber-200 dark:border-amber-800",
    iconColor: "text-amber-600 dark:text-amber-400",
    textColor: "text-amber-700 dark:text-amber-300",
    actionColor: "text-amber-600 dark:text-amber-400",
  },
  system_alert: {
    icon: "⚠️",
    label: "System Alert",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
    iconColor: "text-red-600 dark:text-red-400",
    textColor: "text-red-700 dark:text-red-300",
    actionColor: "text-red-600 dark:text-red-400",
  },
  system_updates: {
    icon: "🔄",
    label: "System Update",
    bgColor: "bg-gray-50 dark:bg-gray-900/20",
    borderColor: "border-gray-200 dark:border-gray-800",
    iconColor: "text-gray-600 dark:text-gray-400",
    textColor: "text-gray-700 dark:text-gray-300",
    actionColor: "text-gray-600 dark:text-gray-400",
  },
} as const;

const DEFAULT_CONFIG = {
  icon: "🔔",
  label: "Notification",
  bgColor: "bg-gray-50 dark:bg-gray-900/20",
  borderColor: "border-gray-200 dark:border-gray-800",
  iconColor: "text-gray-600 dark:text-gray-400",
  textColor: "text-gray-700 dark:text-gray-300",
  actionColor: "text-gray-600 dark:text-gray-400",
};

const getNotificationConfig = (type: string) => {
  return (
    NOTIFICATION_TYPE_CONFIG[type as keyof typeof NOTIFICATION_TYPE_CONFIG] ||
    DEFAULT_CONFIG
  );
};

interface NotificationToastProps {
  toast: ToastNotification;
  onClose: () => void;
}

export function NotificationToast({ toast, onClose }: NotificationToastProps) {
  const { colors } = useThemeColors();
  const config = getNotificationConfig(toast.type);

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
        config.bgColor,
        config.borderColor
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center text-lg",
              config.bgColor.replace("50", "100").replace("900/20", "800"),
              config.iconColor
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
                className={cn("font-semibold text-sm mb-1", config.textColor)}
              >
                {toast.title}
              </h4>
              <p className={cn("text-sm leading-relaxed", colors.textMuted)}>
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
                  config.actionColor
                )}
                onClick={onClose}
              >
                View details →
              </Link>
            ) : (
              <span
                className={cn(
                  "text-xs px-2 py-1 rounded-full font-medium",
                  config.bgColor.replace("50", "100").replace("900/20", "800"),
                  config.textColor
                )}
              >
                {config.label}
              </span>
            )}

            <span className={cn("text-xs", colors.textMuted)}>just now</span>
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
            "hover:bg-black/5 dark:hover:bg-white/10",
            colors.textMuted
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
