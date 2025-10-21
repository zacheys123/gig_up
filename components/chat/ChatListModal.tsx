// components/chat/ChatListModal.tsx
"use client";
import { useEffect, useState } from "react";
import {
  X,
  Search,
  MessageCircle,
  Plus,
  MoreHorizontal,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@/app/context/ChatContext";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatListModal({ isOpen, onClose }: ChatListModalProps) {
  const { openChat } = useChat();
  const { user: currentUser } = useCurrentUser();
  const { colors, isDarkMode } = useThemeColors();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch user's chats
  const chats = useQuery(
    api.controllers.chat.getUserChats,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleChatClick = (chatId: string) => {
    openChat(chatId);
    onClose();
  };

  // Filter chats based on search
  const filteredChats = chats?.filter(
    (chat) =>
      chat.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort chats: unread first, then by recent activity
  const sortedChats = filteredChats?.sort((a, b) => {
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
    if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
    return (b.lastMessageAt || 0) - (a.lastMessageAt || 0);
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Enhanced Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300"
        onClick={handleBackdropClick}
      />

      {/* Modern Modal Container */}
      <div className="relative w-full max-w-md h-[85vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col transform transition-all duration-300 scale-100">
        {/* Sleek Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-2xl",
                isDarkMode ? "bg-blue-500/20" : "bg-blue-500/10"
              )}
            >
              <MessageCircle className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Messages
              </h3>
              <p className={cn("text-sm mt-0.5", colors.textMuted)}>
                {sortedChats?.length || 0} conversations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className="px-6 pb-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-blue-500" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "pl-11 pr-4 py-3 rounded-2xl border-0 bg-gray-50 dark:bg-gray-800/50",
                "transition-all duration-200 focus:ring-2 focus:ring-blue-500/20",
                "placeholder-gray-400 dark:placeholder-gray-500"
              )}
            />
          </div>
        </div>

        {/* Chat List with Modern Design */}
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {!chats ? (
            // Loading skeletons
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-2xl"
                >
                  <Skeleton className="w-12 h-12 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : sortedChats?.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div
                className={cn(
                  "w-20 h-20 rounded-3xl flex items-center justify-center mb-4",
                  "bg-gradient-to-br from-blue-500/10 to-purple-500/10",
                  "border border-blue-200/20 dark:border-blue-500/20"
                )}
              >
                <MessageCircle className="w-8 h-8 text-blue-500" />
              </div>
              <h4 className={cn("font-bold text-lg mb-2", colors.text)}>
                {searchQuery ? "No matches found" : "No conversations"}
              </h4>
              <p className={cn("text-sm max-w-xs", colors.textMuted)}>
                {searchQuery
                  ? "Try searching with different keywords"
                  : "Start connecting with other musicians and clients"}
              </p>
              {!searchQuery && (
                <Button className="mt-4 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white px-6">
                  Find People
                </Button>
              )}
            </div>
          ) : (
            // Chat list
            <div className="space-y-1">
              {sortedChats?.map((chat) => {
                const otherParticipant = chat.otherParticipants[0];
                const hasUnread = chat.unreadCount > 0;

                return (
                  <button
                    key={chat._id}
                    onClick={() => handleChatClick(chat._id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group",
                      "hover:bg-gray-50 dark:hover:bg-gray-800/60",
                      "border border-transparent hover:border-gray-100 dark:hover:border-gray-700",
                      hasUnread && "bg-blue-50/50 dark:bg-blue-500/10"
                    )}
                  >
                    {/* Avatar with status indicator */}
                    <div className="relative">
                      <Avatar className="w-12 h-12 rounded-2xl ring-2 ring-white dark:ring-gray-800 group-hover:ring-blue-100 dark:group-hover:ring-blue-500/20 transition-all duration-200">
                        <AvatarImage src={otherParticipant?.picture} />
                        <AvatarFallback
                          className={cn(
                            "text-sm font-semibold rounded-2xl",
                            isDarkMode ? "bg-gray-700" : "bg-gray-200"
                          )}
                        >
                          {otherParticipant?.firstname?.[0]}
                          {otherParticipant?.lastname?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      {hasUnread && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full ring-2 ring-white dark:ring-gray-900 animate-pulse" />
                      )}
                    </div>

                    {/* Chat content */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-1.5">
                        <h4
                          className={cn(
                            "font-semibold text-sm truncate transition-colors",
                            hasUnread
                              ? "text-gray-900 dark:text-white"
                              : colors.text
                          )}
                        >
                          {chat.displayName}
                        </h4>
                        {chat.lastMessageAt && (
                          <span
                            className={cn(
                              "text-xs whitespace-nowrap transition-colors",
                              hasUnread
                                ? "text-blue-600 dark:text-blue-400"
                                : colors.textMuted
                            )}
                          >
                            {formatTime(chat.lastMessageAt)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {chat.lastMessage && (
                          <CheckCheck
                            className={cn(
                              "w-3 h-3 flex-shrink-0",
                              hasUnread ? "text-blue-500" : "text-gray-400"
                            )}
                          />
                        )}
                        <p
                          className={cn(
                            "text-sm truncate transition-colors",
                            hasUnread
                              ? "text-gray-700 dark:text-gray-300 font-medium"
                              : colors.textMuted
                          )}
                        >
                          {chat.lastMessage || "Say hello! 👋"}
                        </p>
                      </div>
                    </div>

                    {/* Unread badge */}
                    {hasUnread && (
                      <Badge
                        variant="default"
                        className={cn(
                          "rounded-full px-2 min-w-[24px] h-6 text-xs font-semibold",
                          "bg-blue-500 hover:bg-blue-600 text-white",
                          "animate-pulse shadow-lg shadow-blue-500/25"
                        )}
                      >
                        {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Enhanced Footer */}
        <div className="p-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button
            className={cn(
              "w-full rounded-2xl py-3 font-semibold transition-all duration-200",
              "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600",
              "shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40",
              "text-white transform hover:scale-[1.02] active:scale-[0.98]"
            )}
            onClick={() => window.open("/messages", "_blank")}
          >
            Open Messages
            <MessageCircle className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Enhanced time formatting
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) {
    // Less than 1 minute
    return "now";
  } else if (diff < 3600000) {
    // Less than 1 hour
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m`;
  } else if (diff < 86400000) {
    // Less than 1 day
    const hours = Math.floor(diff / 3600000);
    return `${hours}h`;
  } else if (diff < 604800000) {
    // Less than 1 week
    const days = Math.floor(diff / 86400000);
    return `${days}d`;
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
}
