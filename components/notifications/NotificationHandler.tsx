// components/notifications/NotificationToast.tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Eye,
  Heart,
  MessageCircle,
  Users,
  Calendar,
  Bell,
} from "lucide-react";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ToastNotification } from "@/hooks/useNotifications";

interface NotificationToastProps {
  toast: ToastNotification;
  onClose: () => void;
}

export function NotificationToast({ toast, onClose }: NotificationToastProps) {
  const { colors, isDarkMode } = useThemeColors();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "profile_view":
        return <Eye className="w-4 h-4 text-blue-500" />;
      case "new_follower":
      case "follow_request":
      case "follow_accepted":
        return <Users className="w-4 h-4 text-purple-500" />;
      case "new_message":
        return <MessageCircle className="w-4 h-4 text-green-500" />;
      case "gig_invite":
      case "gig_application":
      case "gig_approved":
        return <Calendar className="w-4 h-4 text-amber-500" />;
      case "like":
        return <Heart className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getToastStyles = (type: string) => {
    const baseStyles = "rounded-lg border p-4 shadow-lg max-w-sm w-full";

    switch (type) {
      case "profile_view":
        return cn(
          baseStyles,
          isDarkMode
            ? "bg-blue-900/20 border-blue-700/50"
            : "bg-blue-50 border-blue-200"
        );
      case "new_follower":
        return cn(
          baseStyles,
          isDarkMode
            ? "bg-purple-900/20 border-purple-700/50"
            : "bg-purple-50 border-purple-200"
        );
      case "new_message":
        return cn(
          baseStyles,
          isDarkMode
            ? "bg-green-900/20 border-green-700/50"
            : "bg-green-50 border-green-200"
        );
      default:
        return cn(
          baseStyles,
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        );
    }
  };

  const ToastContent = () => (
    <div className={getToastStyles(toast.type)}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(toast.type)}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className={cn("font-semibold text-sm", colors.text)}>
            {toast.title}
          </h4>
          <p className={cn("text-sm mt-1", colors.textMuted)}>
            {toast.message}
          </p>

          {toast.actionUrl && (
            <Link
              href={toast.actionUrl}
              className={cn(
                "text-xs font-medium mt-2 inline-block",
                isDarkMode ? "text-blue-400" : "text-blue-600"
              )}
              onClick={onClose}
            >
              View details
            </Link>
          )}
        </div>

        <button
          onClick={onClose}
          className={cn(
            "flex-shrink-0 p-1 rounded-full transition-colors",
            isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-200/50"
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
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      <ToastContent />
    </motion.div>
  );
}
