// components/chat/ChatListModal.tsx
"use client";
import { useEffect } from "react";
import { X, Search, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@/app/context/ChatContext";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

interface ChatListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatListModal({ isOpen, onClose }: ChatListModalProps) {
  const { openChat } = useChat();
  const { user: currentUser } = useCurrentUser();
  const { colors } = useThemeColors();

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

  // Close when clicking backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleChatClick = (chatId: string) => {
    openChat(chatId);
    onClose(); // Close the list modal when a chat is selected
  };

  if (!isOpen) return null;

  // Filter chats to show only those with unread messages first, then sort by recent
  const sortedChats = chats?.sort((a, b) => {
    // First sort by unread count (chats with unread messages come first)
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
    if (a.unreadCount === 0 && b.unreadCount > 0) return 1;

    // Then sort by last message time (most recent first)
    return (b.lastMessageAt || 0) - (a.lastMessageAt || 0);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl h-[80vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <h3 className="text-xl font-semibold">Messages</h3>
            <p className={cn("text-sm mt-1", colors.textMuted)}>
              Your conversations
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              className="pl-10 bg-gray-50 dark:bg-gray-800 border-0"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-4">
          {sortedChats?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mb-4",
                  "bg-gray-100 dark:bg-gray-800"
                )}
              >
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className={cn("font-semibold mb-2", colors.text)}>
                No conversations yet
              </h4>
              <p className={cn("text-sm", colors.textMuted)}>
                Start a conversation with other users
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedChats?.map((chat) => {
                const otherParticipant = chat.otherParticipants[0];

                return (
                  <button
                    key={chat._id}
                    onClick={() => handleChatClick(chat._id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200",
                      "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                      "border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                    )}
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={otherParticipant?.picture} />
                      <AvatarFallback className="text-sm">
                        {otherParticipant?.firstname?.[0]}
                        {otherParticipant?.lastname?.[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <h4
                          className={cn(
                            "font-semibold text-sm truncate",
                            colors.text
                          )}
                        >
                          {chat.displayName}
                        </h4>
                        {chat.lastMessageAt && (
                          <span
                            className={cn(
                              "text-xs whitespace-nowrap",
                              colors.textMuted
                            )}
                          >
                            {formatTime(chat.lastMessageAt)}
                          </span>
                        )}
                      </div>

                      <p
                        className={cn(
                          "text-sm truncate",
                          chat.unreadCount > 0
                            ? "font-medium text-gray-900 dark:text-white"
                            : colors.textMuted
                        )}
                      >
                        {chat.lastMessage || "Start a conversation"}
                      </p>
                    </div>

                    {chat.unreadCount > 0 && (
                      <div className="flex-shrink-0">
                        <span
                          className={cn(
                            "bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center",
                            "animate-pulse"
                          )}
                        >
                          {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => {
              // You could add functionality to start a new conversation
              window.open("/messages", "_blank");
            }}
          >
            Open Full Messages
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper function to format time
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
