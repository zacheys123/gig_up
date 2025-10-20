// components/chat/ChatList.tsx
"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

interface Chat {
  _id: string;
  displayName?: string;
  lastMessage?: string;
  lastMessageAt?: number;
  unreadCount: number;
  participants: any[];
  otherParticipants: any[];
}

interface ChatListProps {
  chats: Chat[];
  selectedChat: string | null;
  onSelectChat: (chatId: string) => void;
}

export function ChatList({ chats, selectedChat, onSelectChat }: ChatListProps) {
  const { colors } = useThemeColors();

  if (chats.length === 0) {
    return (
      <div
        className={cn(
          "flex-1 flex items-center justify-center p-8",
          colors.background
        )}
      >
        <div className="text-center">
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
              colors.backgroundMuted
            )}
          >
            <MessageCircle className={cn("w-8 h-8", colors.textMuted)} />
          </div>
          <p className={cn("text-sm mb-2 font-medium", colors.text)}>
            No conversations yet
          </p>
          <p className={cn("text-xs", colors.textMuted)}>
            Start a conversation to see it here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      {chats.map((chat) => {
        const otherParticipant = chat.otherParticipants[0];
        const isSelected = selectedChat === chat._id;

        return (
          <button
            key={chat._id}
            onClick={() => onSelectChat(chat._id)}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 text-left",
              isSelected
                ? cn(
                    "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",
                    "shadow-sm"
                  )
                : cn(colors.hoverBg, "hover:shadow-sm"),
              "mb-1 last:mb-0"
            )}
          >
            <Avatar className="w-12 h-12 flex-shrink-0">
              <AvatarImage src={otherParticipant?.picture} />
              <AvatarFallback
                className={cn("text-sm font-medium", colors.text)}
              >
                {otherParticipant?.firstname?.[0]}
                {otherParticipant?.lastname?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3
                  className={cn(
                    "font-semibold text-sm truncate",
                    isSelected
                      ? "text-blue-600 dark:text-blue-400"
                      : colors.text
                  )}
                >
                  {chat.displayName}
                </h3>
                {chat.lastMessageAt && (
                  <span
                    className={cn(
                      "text-xs whitespace-nowrap flex-shrink-0 ml-2",
                      colors.textMuted
                    )}
                  >
                    {formatTime(chat.lastMessageAt)}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p
                  className={cn(
                    "text-sm truncate flex-1",
                    chat.unreadCount > 0
                      ? "font-medium text-gray-900 dark:text-white"
                      : colors.textMuted
                  )}
                >
                  {chat.lastMessage || "Start a conversation"}
                </p>
                {chat.unreadCount > 0 && (
                  <span
                    className={cn(
                      "bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center ml-2 flex-shrink-0",
                      "animate-pulse"
                    )}
                  >
                    {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diff < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString([], { weekday: "short" });
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
}
