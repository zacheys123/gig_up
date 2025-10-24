// components/UserListItem.tsx
"use client";
import React from "react";
import { CheckCircle } from "lucide-react";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

interface UserListItemProps {
  user: {
    _id: string;
    picture?: string;
    firstname?: string;
    lastname?: string;
    username?: string;
    instrument?: string;
    roleType?: string;
    verified?: boolean;
  };
  onStartChat: (userId: string, userName: string) => void;
  isCreatingChat: boolean;
}

export function UserListItem({
  user,
  onStartChat,
  isCreatingChat,
}: UserListItemProps) {
  const { colors } = useThemeColors();

  // ✅ This hook will work for ALL users, not just chat participants
  const { isOnline, lastActiveText } = useOnlineStatus(user._id);
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 border-b",
        colors.border,
        "active:bg-orange-50/30 transition-colors duration-150"
      )}
    >
      {/* Avatar with Status */}
      <div className="relative">
        <Avatar className={cn("w-12 h-12 border", colors.border)}>
          <AvatarImage src={user.picture} />
          <AvatarFallback
            className={cn("font-medium", colors.backgroundMuted, colors.text)}
          >
            {user.firstname?.[0]}
          </AvatarFallback>
        </Avatar>

        {/* Online Status Indicator */}
        {isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-[1.5px] border-white animate-ping" />
        )}
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <h4 className={cn("font-semibold text-[15px] truncate", colors.text)}>
            {user.firstname} {user.lastname}
          </h4>
          {user.verified && (
            <CheckCircle className="w-3.5 h-3.5 text-blue-500 fill-current flex-shrink-0" />
          )}
        </div>

        <p className={cn("text-[13px] truncate mb-1", colors.textMuted)}>
          {user.instrument || user.roleType}
        </p>

        <div className="flex items-center gap-1.5">
          <span className={cn("text-[12px]", colors.textMuted)}>
            @{user.username}
          </span>

          {/* Online/Last Active Status */}
          <span className={cn("text-[10px]", colors.textMuted)}>•</span>
          <span
            className={cn(
              "text-[12px]",
              isOnline ? "text-green-600 font-medium" : colors.textMuted
            )}
          >
            {lastActiveText || "offline"}
          </span>
        </div>
      </div>

      {/* Message Button */}
      <Button
        onClick={() =>
          onStartChat(user._id, `${user.firstname} ${user.lastname}`)
        }
        disabled={isCreatingChat}
        className={cn(
          "text-[13px] font-semibold px-3 py-1.5 rounded-lg",
          "border transition-all duration-200",
          colors.border,
          isOnline ? colors.primaryBg : "bg-gray-400",
          "text-white",
          "active:scale-95 active:opacity-80",
          "disabled:opacity-40 disabled:active:scale-100"
        )}
      >
        {isCreatingChat ? "..." : "Message"}
      </Button>
    </div>
  );
}
