"use client";
import React, { useState, useEffect } from "react";
import {
  MessageCircle,
  ArrowLeft,
  Search as SearchIcon,
  CheckCircle,
  UserPlus,
  Pin,
  CheckCheck,
  Users,
  Crown,
  MapPin,
  Music,
  Briefcase,
} from "lucide-react";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserCurrentChat } from "@/hooks/useCurrentUserChat";
import { useUnreadCount } from "@/hooks/useUnreadCount";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTierInfo } from "../pages/MobileSheet";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "sonner";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useUpdateGlobalPresence } from "@/hooks/useUpdateGlobalPresence";
import { UserListItem } from "./UserListItem";
import { useChatToasts } from "@/hooks/useToasts";
import { formatLastMessage } from "@/utils";
import { Id } from "@/convex/_generated/dataModel";
import { useAllUsersWithPresence } from "@/hooks/useAllUsers";

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const timeDifference = now.getTime() - date.getTime();

  if (timeDifference < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (timeDifference < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString([], { weekday: "short" });
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
}

export default function ConversationList({
  onNavigateBack,
  onConversationSelect,
}: {
  onNavigateBack: () => void;
  onConversationSelect: (conversationId: string) => void;
}) {
  // updating the global activity of a user...
  useUpdateGlobalPresence();
  const { colors } = useThemeColors();
  const [searchFilter, setSearchFilter] = useState("");
  const [activeTab, setActiveTab] = useState("conversations"); // Changed default tab
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "musicians" | "clients"
  >("all");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const { chats, isUserOnline, smartCreateOrOpenChat } = useUserCurrentChat();
  const { byChat: unreadCounts } = useUnreadCount();
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const { user: currentUser } = useCurrentUser();
  // In your ConversationList component
  const allUsers = useAllUsersWithPresence();

  const { showChatCreationPromise } = useChatToasts();
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchFilter]);

  // Filter users based on search and category
  const filteredUsers = allUsers?.filter((user) => {
    const matchesSearch =
      user.firstname?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      user.lastname?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      user.instrument?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      user.city?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      user.roleType?.toLowerCase().includes(debouncedQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      (selectedCategory === "musicians" && user.isMusician) ||
      (selectedCategory === "clients" && user.isClient);

    return matchesSearch && matchesCategory;
  });

  // Enhanced filtering with tabs for conversations
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

  const [newlyCreatedChatId, setNewlyCreatedChatId] = useState<string | null>(
    null
  );

  const handleStartChat = async (userId: string, userName: string) => {
    try {
      setIsCreatingChat(true);
      const result = await showChatCreationPromise(
        smartCreateOrOpenChat(userId),
        userName
      );

      if (result) {
        setNewlyCreatedChatId(result);
        setTimeout(() => onConversationSelect(result), 500); // Small delay for visual feedback
      }
    } catch (error) {
      // Error handled by toast
    } finally {
      setIsCreatingChat(false);
    }
  };

  // Clear highlight after 3 seconds
  useEffect(() => {
    if (newlyCreatedChatId) {
      const timer = setTimeout(() => setNewlyCreatedChatId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [newlyCreatedChatId]);

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
          <p className={cn("text-sm", colors.textMuted)}>
            Your conversations and contacts
          </p>
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
            placeholder={
              activeTab === "users"
                ? "Search users by name, username, location..."
                : "Search conversations..."
            }
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

      {/* Main Tabs - Conversations vs Users */}
      <div className="px-4 pb-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList
            className={cn(
              "w-full grid grid-cols-2 rounded-2xl p-1",
              colors.backgroundMuted
            )}
          >
            <TabsTrigger
              value="conversations"
              className={cn(
                "text-xs rounded-xl",
                "data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              )}
            >
              Conversations
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
              value="users"
              className={cn(
                "text-xs rounded-xl",
                "data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              )}
            >
              Find Users
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Conversation-specific tabs */}
      {activeTab === "conversations" && (
        <div className="px-4 pb-3">
          <Tabs defaultValue="all" className="w-full">
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
      )}

      {/* User-specific filters */}
      {activeTab === "users" && (
        <div className="px-4 pb-3">
          <div className="flex gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "rounded-full text-xs transition-all duration-200",
                selectedCategory === "all"
                  ? colors.primaryBg + " scale-105"
                  : "hover:scale-105"
              )}
            >
              <UserPlus className="w-3 h-3 mr-1" />
              All Users
            </Button>
            <Button
              variant={selectedCategory === "musicians" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("musicians")}
              className={cn(
                "rounded-full text-xs transition-all duration-200",
                selectedCategory === "musicians"
                  ? colors.primaryBg + " scale-105"
                  : "hover:scale-105"
              )}
            >
              <Music className="w-3 h-3 mr-1" />
              Musicians
            </Button>
            <Button
              variant={selectedCategory === "clients" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("clients")}
              className={cn(
                "rounded-full text-xs transition-all duration-200",
                selectedCategory === "clients"
                  ? colors.primaryBg + " scale-105"
                  : "hover:scale-105"
              )}
            >
              <Briefcase className="w-3 h-3 mr-1" />
              Clients
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "conversations" ? (
          // CONVERSATIONS VIEW
          filteredConversations?.length === 0 ? (
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
                  onClick={() => setActiveTab("users")}
                  className={cn(
                    "rounded-2xl px-6 py-3",
                    colors.primaryBg,
                    colors.primaryBgHover,
                    "text-white",
                    "font-semibold shadow-lg hover:shadow-xl",
                    isCreatingChat && "animate-pulse" // Add this
                  )}
                  disabled={isCreatingChat} // And this
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {isCreatingChat ? "Creating..." : "Find Users to Chat With"}
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
                const isOnline = otherUser
                  ? isUserOnline(otherUser._id)
                  : false;
                const isPinned = conversation.isPinned || false;
                const lastMessagePreview = conversation.lastMessageWithSender
                  ? formatLastMessage(
                      conversation.lastMessageWithSender.content,
                      currentUser?._id as Id<"users">,
                      conversation.lastMessageWithSender.senderId
                    )
                  : "Start a conversation";
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
                          {lastMessagePreview}
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
          )
        ) : // USERS VIEW
        !allUsers ? (
          // Loading skeletons
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl border animate-pulse",
                  colors.border
                )}
              >
                <div className={cn("w-12 h-12 rounded-2xl", colors.skeleton)} />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-4 w-32 rounded", colors.skeleton)} />
                    <div className={cn("h-3 w-16 rounded", colors.skeleton)} />
                  </div>
                  <div className={cn("h-3 w-48 rounded", colors.skeleton)} />
                  <div className="flex gap-2">
                    <div
                      className={cn("h-5 w-20 rounded-full", colors.skeleton)}
                    />
                    <div
                      className={cn("h-5 w-24 rounded-full", colors.skeleton)}
                    />
                  </div>
                </div>
                <div className={cn("w-20 h-9 rounded-xl", colors.skeleton)} />
              </div>
            ))}
          </div>
        ) : filteredUsers?.length === 0 ? (
          // Empty state for users
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div
              className={cn(
                "w-20 h-20 rounded-3xl flex items-center justify-center mb-4",
                colors.warningBg,
                colors.warningBorder
              )}
            >
              <Users className={cn("w-8 h-8", colors.warningText)} />
            </div>
            <h4 className={cn("font-bold text-lg mb-2", colors.text)}>
              No users found
            </h4>
            <p className={cn("text-sm max-w-xs", colors.textMuted)}>
              {debouncedQuery
                ? "Try adjusting your search terms or browse different categories"
                : "No users match your current filters"}
            </p>
          </div>
        ) : (
          // User results
          <div className="space-y-0">
            {filteredUsers?.map((user, index) => (
              <UserListItem
                key={user._id}
                user={user}
                onStartChat={() =>
                  handleStartChat(
                    user._id,
                    `${user.firstname} ${user.lastname}`
                  )
                }
                isCreatingChat={isCreatingChat}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
