"use client";
import React, { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  MessageCircle,
  ArrowLeft,
  Search as SearchIcon,
  CheckCircle,
  UserPlus,
  Pin,
  CheckCheck,
} from "lucide-react";
import { useThemeColors, useThemeToggle } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { useUserCurrentChat } from "@/hooks/useCurrentUserChat";

import { useUnreadCount } from "@/hooks/useUnreadCount";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTierInfo } from "../pages/MobileSheet";

export default function ConversationList({
  onNavigateBack,
  onConversationSelect,
  setShowUserSearch,
}: {
  onNavigateBack: () => void;
  onConversationSelect: (conversationId: string) => void;
  setShowUserSearch: (data: boolean) => void;
}) {
  const { colors } = useThemeColors();
  const [searchFilter, setSearchFilter] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { chats, isUserOnline } = useUserCurrentChat();
  const { byChat: unreadCounts } = useUnreadCount();
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const handleStartNewChat = () => {
    setShowUserSearch(true);
  };
  // Enhanced filtering with tabs
  const filteredConversations = chats
    ?.filter((conversation) => {
      const matchesSearch =
        conversation.displayName
          ?.toLowerCase()
          .includes(searchFilter.toLowerCase()) ||
        conversation.lastMessage
          ?.toLowerCase()
          .includes(searchFilter.toLowerCase());

      const isArchived = conversation.isArchived || false;
      const hasUnread = (unreadCounts[conversation._id] || 0) > 0;

      if (activeTab === "unread") {
        return matchesSearch && hasUnread && !isArchived;
      } else if (activeTab === "archived") {
        return matchesSearch && isArchived;
      }

      return matchesSearch && !isArchived;
    })
    .sort((a, b) => {
      const aUnread = unreadCounts[a._id] || 0;
      const bUnread = unreadCounts[b._id] || 0;

      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (aUnread > 0 && bUnread === 0) return -1;
      if (aUnread === 0 && bUnread > 0) return 1;
      return (b.lastMessageAt || 0) - (a.lastMessageAt || 0);
    });

  return (
    <div className="flex flex-col h-full">
      <div
        className={cn("flex items-center gap-3 p-6 border-b", colors.border)}
      >
        <button
          onClick={onNavigateBack}
          className={cn(
            "p-2 rounded-xl transition-all duration-200",
            "hover:bg-gray-100",
            colors.text
          )}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h3 className={cn("font-bold text-lg", colors.text)}>Messages</h3>
          <p className={cn("text-sm", colors.textMuted)}>Your conversations</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className={cn("p-4 border-b", colors.border)}>
        <div className="relative">
          <SearchIcon
            className={cn(
              "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4",
              colors.textMuted
            )}
          />
          <Input
            placeholder="Search conversations..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className={cn(
              "pl-10 border-0 rounded-xl",
              colors.backgroundMuted,
              "focus:bg-white transition-colors"
            )}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pb-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList
            className={cn(
              "w-full grid grid-cols-3 rounded-2xl p-1",
              colors.backgroundMuted
            )}
          >
            <TabsTrigger
              value="all"
              className={cn(
                "text-xs rounded-xl",
                "data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              )}
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="unread"
              className={cn(
                "text-xs rounded-xl",
                "data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              )}
            >
              Unread
              {chats?.some((chat) => (unreadCounts[chat._id] || 0) > 0) && (
                <Badge className="ml-1 h-4 w-4 p-0 text-[10px] bg-orange-500">
                  {
                    chats?.filter((chat) => (unreadCounts[chat._id] || 0) > 0)
                      .length
                  }
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="archived"
              className={cn(
                "text-xs rounded-xl",
                "data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              )}
            >
              Archived
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filteredConversations?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div
              className={cn(
                "w-20 h-20 rounded-3xl flex items-center justify-center mb-4",
                colors.warningBg,
                colors.warningBorder
              )}
            >
              <MessageCircle className={cn("w-8 h-8", colors.warningText)} />
            </div>
            <h4 className={cn("font-bold text-lg mb-2", colors.text)}>
              {searchFilter ? "No matches found" : "No conversations yet"}
            </h4>
            <p className={cn("text-sm max-w-xs mb-6", colors.textMuted)}>
              {searchFilter
                ? "Try adjusting your search terms"
                : "Start connecting with other users to see your conversations here"}
            </p>
            {!searchFilter && (
              <Button
                onClick={handleStartNewChat}
                disabled={isCreatingChat}
                className={cn(
                  "rounded-2xl px-6 py-3",
                  colors.primaryBg,
                  colors.primaryBgHover,
                  "text-white",
                  "font-semibold shadow-lg hover:shadow-xl",
                  "disabled:opacity-50"
                )}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {isCreatingChat
                  ? "Creating..."
                  : "Start Your First Conversation"}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConversations?.map((conversation) => {
              const otherUser = conversation.otherParticipants?.[0];
              const tierInfo = getTierInfo(otherUser?.tier);
              const TierIcon = tierInfo.icon;
              const unreadCount = unreadCounts[conversation._id] || 0;
              const isOnline = otherUser ? isUserOnline(otherUser._id) : false;
              const isPinned = conversation.isPinned || false;

              return (
                <button
                  key={conversation._id}
                  onClick={() => onConversationSelect(conversation._id)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group relative",
                    "hover:bg-gray-50",
                    "border border-transparent hover:border-gray-200",
                    "shadow-sm hover:shadow-md",
                    unreadCount > 0 && colors.warningBg
                  )}
                >
                  {/* Pin Indicator */}
                  {isPinned && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Pin
                        className={cn(
                          "w-3 h-3",
                          colors.warningText,
                          "fill-current"
                        )}
                      />
                    </div>
                  )}

                  <div className="relative">
                    <Avatar className="w-14 h-14 rounded-2xl border-2 border-transparent group-hover:border-orange-200 transition-colors">
                      <AvatarImage src={otherUser?.picture} />
                      <AvatarFallback className="text-base font-semibold rounded-2xl">
                        {otherUser?.firstname?.[0]}
                        {otherUser?.lastname?.[0]}
                      </AvatarFallback>
                    </Avatar>

                    {isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
                    )}

                    {otherUser?.tier !== "free" && (
                      <div className="absolute -top-1 -right-1">
                        <TierIcon
                          className={cn(
                            "w-5 h-5 p-1 rounded-full border-2 border-white",
                            tierInfo.text,
                            tierInfo.bg
                          )}
                        />
                      </div>
                    )}

                    {unreadCount > 0 && (
                      <div
                        className={cn(
                          "absolute -top-1 -right-1 w-3 h-3 rounded-full ring-2 ring-white animate-pulse",
                          colors.warningText,
                          "bg-current"
                        )}
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4
                          className={cn(
                            "font-semibold text-base truncate",
                            colors.text
                          )}
                        >
                          {conversation.displayName}
                        </h4>
                        {otherUser?.verified && (
                          <CheckCircle className="w-4 h-4 text-blue-500 fill-current" />
                        )}
                      </div>
                      {conversation.lastMessageAt && (
                        <span
                          className={cn(
                            "text-xs whitespace-nowrap",
                            unreadCount > 0
                              ? colors.warningText
                              : colors.textMuted
                          )}
                        >
                          {formatTimestamp(conversation.lastMessageAt)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {conversation.lastMessage && (
                        <CheckCheck
                          className={cn(
                            "w-3 h-3 flex-shrink-0",
                            unreadCount > 0
                              ? colors.warningText
                              : colors.textMuted
                          )}
                        />
                      )}
                      <p
                        className={cn(
                          "text-sm truncate",
                          unreadCount > 0
                            ? "font-semibold text-gray-900"
                            : colors.textMuted
                        )}
                      >
                        {conversation.lastMessage || "Start a conversation"}
                      </p>
                    </div>
                  </div>

                  {unreadCount > 0 && (
                    <div className="flex-shrink-0">
                      <span
                        className={cn(
                          "bg-orange-500 text-white text-xs font-semibold rounded-full px-2 py-1 min-w-[24px] text-center",
                          "animate-pulse shadow-sm"
                        )}
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
