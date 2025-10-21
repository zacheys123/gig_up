// app/messages/page.tsx
"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Search, MessageCircle, Plus, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { ChatList } from "../_components/ChatLists";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useChat } from "@/app/context/ChatContext";
export default function MessagesPage() {
  const { user: currentUser } = useCurrentUser();
  const { colors } = useThemeColors();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearchParams();
  const { disableMobileModal } = useChat();
  useEffect(() => {
    disableMobileModal();
  }, [disableMobileModal]);

  useEffect(() => {
    const chatId = searchParams.get("chat");
    if (chatId) {
      setSelectedChat(chatId);
    }
  }, [searchParams]);

  // Fetch user's chats
  const chats = useQuery(
    api.controllers.chat.getUserChats,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  // Filter chats based on search
  const filteredChats =
    chats?.filter(
      (chat) =>
        chat.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <div className={cn("flex h-screen", colors.background, colors.text)}>
      {/* Chat List Sidebar */}
      <div
        className={cn(
          "flex flex-col border-r transition-all duration-300",
          colors.border,
          colors.background,
          "w-full md:w-96",
          selectedChat ? "hidden md:flex" : "flex"
        )}
      >
        <div className={cn("p-4 border-b", colors.border)}>
          <div className="flex items-center justify-between">
            <h1 className={cn("text-xl font-bold", colors.text)}>Messages</h1>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full p-2"
              title="New conversation"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative mt-4">
            <Search
              className={cn(
                "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4",
                colors.textMuted
              )}
            />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "pl-10 border-0 bg-gray-50 dark:bg-gray-800/50",
                "focus:bg-white dark:focus:bg-gray-800 transition-colors"
              )}
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          <ChatList
            chats={filteredChats}
            selectedChat={selectedChat}
            onSelectChat={(chatId) => setSelectedChat(chatId)}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          selectedChat ? "flex" : "hidden md:flex"
        )}
      >
        {selectedChat ? (
          <ChatInterface
            chatId={selectedChat}
            isModal={false}
            onBack={() => setSelectedChat(null)}
          />
        ) : (
          <div
            className={cn(
              "flex-1 flex flex-col items-center justify-center p-8 text-center",
              colors.background
            )}
          >
            <div className="max-w-md">
              <div
                className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6",
                  "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700"
                )}
              >
                <MessageCircle className={cn("w-10 h-10", colors.textMuted)} />
              </div>
              <h2 className={cn("text-2xl font-bold mb-3", colors.text)}>
                Your Messages
              </h2>
              <p className={cn("text-sm mb-6", colors.textMuted)}>
                Send private messages and connect with other users on GigUp.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  className={cn(
                    "bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
                  )}
                >
                  <Users className="w-4 h-4" />
                  Find People
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
