// components/chat/OnlineBadge.tsx (ENHANCED)
"use client";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface OnlineBadgeProps {
  userId: string;
  size?: "sm" | "md" | "lg" | "xs";
  className?: string;
  showText?: boolean;
  showLastActive?: boolean; // New prop to show last active time
}

export function OnlineBadge({
  userId,
  size = "md",
  className,
  showText = false,
  showLastActive = false,
}: OnlineBadgeProps) {
  // Fetch user data including lastActive
  const user = useQuery(api.controllers.user.getUserById, {
    userId: userId as Id<"users">,
  });

  const getOnlineStatus = () => {
    if (!user?.lastActive) return { isOnline: false, lastSeen: null };

    const now = Date.now();
    const lastActive = user.lastActive;
    const fiveMinutesAgo = now - 5 * 60 * 1000; // 5 minutes threshold

    const isOnline = lastActive > fiveMinutesAgo;

    return {
      isOnline,
      lastSeen: lastActive,
    };
  };

  const { isOnline, lastSeen } = getOnlineStatus();

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
    xs: "w-5 h-5",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xs: "text-xs",
  };

  if (!user) {
    return (
      <div
        className={cn(
          "flex items-center gap-1",
          textSizeClasses[size],
          className,
        )}
      >
        <div
          className={cn(
            "rounded-full bg-gray-400 animate-pulse",
            sizeClasses[size],
          )}
        />
        {showText && <span className="text-gray-500">checking.....</span>}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5",
        textSizeClasses[size],
        className,
      )}
    >
      <div
        className={cn(
          "rounded-full border-2 border-white dark:border-gray-800 transition-all",
          sizeClasses[size],
          isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400",
        )}
        title={isOnline ? "Online now" : `Last seen ${getTimeAgo(lastSeen!)}`}
      />

      {showText && (
        <span
          className={cn(
            "font-medium",
            isOnline ? "text-green-600" : "text-gray-500",
          )}
        >
          {isOnline ? "Online" : `Last seen ${getTimeAgo(lastSeen!)}`}
        </span>
      )}

      {showLastActive && !isOnline && lastSeen && !showText && (
        <span className="text-xs text-gray-400">{getTimeAgo(lastSeen)}</span>
      )}
    </div>
  );
}
