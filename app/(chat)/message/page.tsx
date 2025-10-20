// app/messages/page.tsx
"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  Search,
  MessageCircle,
  Plus,
  Users,
  ArrowLeft,
  Home,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/chat/ChatInterface";

import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { ChatList } from "../_components/ChatLists";

export default function MessagesPage() {
  const { user: currentUser } = useCurrentUser();
  const { colors } = useThemeColors();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
      {/* Chat List Sidebar - Hidden on mobile when chat is selected */}
      <div
        className={cn(
          "flex flex-col border-r transition-all duration-300",
          colors.border,
          colors.background,
          "w-full md:w-96",
          selectedChat ? "hidden md:flex" : "flex"
        )}
      >
        {/* Minimal Header */}
        <div className={cn("p-4 border-b", colors.border)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Back to Home */}
              <Link
                href="/"
                className={cn(
                  "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                  colors.text
                )}
              >
                <Home className="w-5 h-5" />
              </Link>
              <h1 className={cn("text-xl font-bold", colors.text)}>Messages</h1>
            </div>
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

      {/* Right Sidebar - Desktop Only (Facebook-style) */}
      {!selectedChat && (
        <div
          className={cn(
            "w-80 border-l hidden xl:flex flex-col",
            colors.border,
            colors.background
          )}
        >
          <div className={cn("p-6 border-b", colors.border)}>
            <h3 className={cn("font-semibold", colors.text)}>
              Suggested Connections
            </h3>
          </div>
          <div className="flex-1 p-4">
            <div className="text-center">
              <p className={cn("text-sm", colors.textMuted)}>
                People you may know will appear here
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
