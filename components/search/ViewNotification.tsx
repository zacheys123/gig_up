// components/user/ViewNotification.tsx
"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewNotificationProps {
  user: {
    firstname?: string;
    lastname?: string;
    username?: string;
    picture?: string;
  };
  onClose: () => void;
  isPro: boolean;
}

export function ViewNotification({
  user,
  onClose,
  isPro,
}: ViewNotificationProps) {
  const getNotificationStyle = () => {
    if (isPro) {
      return "bg-gradient-to-r from-purple-500 to-pink-500 border-purple-400 shadow-purple-500/25";
    } else {
      return "bg-gradient-to-r from-blue-500 to-cyan-500 border-blue-400 shadow-blue-500/25";
    }
  };

  const getBadgeText = () => {
    if (isPro) return "Pro";
    return "Free Trial";
  };

  // Safe values with fallbacks
  const safeFirstname = user.firstname || "Someone";
  const safeLastname = user.lastname || "";
  const safeUsername = user.username || "unknown";

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed top-4 right-4 z-50 max-w-sm"
    >
      <div
        className={cn(
          "rounded-lg p-4 shadow-lg border backdrop-blur-md text-white",
          getNotificationStyle()
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {user.picture ? (
              <img
                src={user.picture}
                alt={`${safeFirstname} ${safeLastname}`}
                className="w-10 h-10 rounded-full border-2 border-white/50 object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-medium">
                {safeFirstname?.[0]}
                {safeLastname?.[0]}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-sm">
                {safeFirstname} viewed your profile
              </p>
              <span className="text-xs bg-white/30 px-2 py-0.5 rounded-full">
                {getBadgeText()}
              </span>
            </div>
            <p className="text-xs opacity-90">@{safeUsername}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
