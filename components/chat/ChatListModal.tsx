"use client";
import { useEffect, useState } from "react";
import {
  X,
  Search,
  MessageCircle,
  Plus,
  CheckCheck,
  MoreHorizontal,
  Video,
  Phone,
  UserPlus,
  Filter,
  Archive,
  Delete,
  Pin,
  CheckCircle2,
  Crown,
  Zap,
  Users,
  Music,
  Briefcase,
  MapPin,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useUserCurrentChat } from "@/hooks/useCurrentUserChat";
import { useUnreadCount } from "@/hooks/useUnreadCount";

interface ChatListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserSearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onUserSelect: (userId: string) => void;
}

// UserSearchPanel Component
function UserSearchPanel({
  isOpen,
  onClose,
  onUserSelect,
}: UserSearchPanelProps) {
  const { colors } = useThemeColors();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "musicians" | "clients"
  >("all");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { smartCreateOrOpenChat, isLoading } = useUserCurrentChat();

  // Fetch all users for search
  const allUsers = useQuery(api.controllers.user.getAllUsers);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  const handleStartChat = async (userId: string) => {
    try {
      await smartCreateOrOpenChat(userId);
      toast.success("Chat started successfully!");
      onUserSelect(userId);
    } catch (error) {
      toast.error("Failed to start chat. Please try again.");
      console.error("Failed to create chat:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Search Panel */}
      <div
        className={cn(
          "relative w-full max-w-2xl h-[80vh] rounded-3xl shadow-2xl border flex flex-col",
          colors.card,
          colors.cardBorder,
          "backdrop-blur-sm bg-white/95"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-2xl",
                colors.warningBg,
                colors.warningBorder
              )}
            >
              <Users className={cn("w-5 h-5", colors.warningText)} />
            </div>
            <div>
              <h3 className={cn("text-xl font-bold", colors.text)}>
                Find People
              </h3>
              <p className={cn("text-sm", colors.textMuted)}>
                Connect with musicians and clients
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-2xl hover:bg-red-500/10 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="p-6 pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, username, location, or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "pl-11 pr-4 py-3 rounded-2xl border-0",
                colors.backgroundMuted,
                "focus:ring-2 focus:ring-orange-500/20"
              )}
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="px-6 pb-4">
          <div className="flex gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "rounded-full text-xs",
                selectedCategory === "all" && colors.primaryBg
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
                "rounded-full text-xs",
                selectedCategory === "musicians" && colors.primaryBg
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
                "rounded-full text-xs",
                selectedCategory === "clients" && colors.primaryBg
              )}
            >
              <Briefcase className="w-3 h-3 mr-1" />
              Clients
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {!allUsers ? (
            // Loading skeletons
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl border",
                    colors.border
                  )}
                >
                  <Skeleton
                    className={cn("w-12 h-12 rounded-2xl", colors.skeleton)}
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton
                        className={cn("h-4 w-32 rounded", colors.skeleton)}
                      />
                      <Skeleton
                        className={cn("h-3 w-16 rounded", colors.skeleton)}
                      />
                    </div>
                    <Skeleton
                      className={cn("h-3 w-48 rounded", colors.skeleton)}
                    />
                    <div className="flex gap-2">
                      <Skeleton
                        className={cn("h-5 w-20 rounded-full", colors.skeleton)}
                      />
                      <Skeleton
                        className={cn("h-5 w-24 rounded-full", colors.skeleton)}
                      />
                    </div>
                  </div>
                  <Skeleton
                    className={cn("w-20 h-9 rounded-xl", colors.skeleton)}
                  />
                </div>
              ))}
            </div>
          ) : filteredUsers?.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div
                className={cn(
                  "w-20 h-20 rounded-3xl flex items-center justify-center mb-4",
                  colors.warningBg,
                  colors.warningBorder
                )}
              >
                <Search className={cn("w-8 h-8", colors.warningText)} />
              </div>
              <h4 className={cn("font-bold text-lg mb-2", colors.text)}>
                No users found
              </h4>
              <p className={cn("text-sm max-w-xs", colors.textMuted)}>
                {debouncedQuery
                  ? "Try adjusting your search terms or browse different categories"
                  : "Start typing to search for users"}
              </p>
            </div>
          ) : (
            // User results
            <div className="space-y-3">
              {filteredUsers?.map((user) => (
                <div
                  key={user._id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                    colors.border,
                    "hover:shadow-lg hover:border-orange-200"
                  )}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar with tier badge */}
                    <div className="relative">
                      <Avatar className="w-14 h-14 rounded-2xl border-2 border-orange-200">
                        <AvatarImage src={user.picture} />
                        <AvatarFallback
                          className={cn(
                            "text-base font-semibold rounded-2xl",
                            "bg-gradient-to-br from-orange-500/10 to-red-500/10"
                          )}
                        >
                          {user.firstname?.[0]}
                          {user.lastname?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      {user.tier !== "free" && (
                        <div className="absolute -top-1 -right-1">
                          <div
                            className={cn(
                              "w-6 h-6 rounded-full border-2 border-white flex items-center justify-center",
                              user.tier === "pro" && "bg-orange-500",
                              user.tier === "premium" && "bg-purple-500",
                              user.tier === "elite" && "bg-yellow-500"
                            )}
                          >
                            <Crown className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* User info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4
                          className={cn("font-semibold text-lg", colors.text)}
                        >
                          {user.firstname} {user.lastname}
                        </h4>
                        {user.verified && (
                          <Badge
                            variant="secondary"
                            className="bg-blue-500 text-white text-xs"
                          >
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className={cn("text-sm", colors.textMuted)}>
                        @{user.username}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {/* Role badge */}
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            user.isMusician
                              ? "border-purple-200 text-purple-700"
                              : "border-blue-200 text-blue-700"
                          )}
                        >
                          {user.isMusician ? (
                            <>
                              <Music className="w-3 h-3 mr-1" />
                              Musician
                            </>
                          ) : (
                            <>
                              <Briefcase className="w-3 h-3 mr-1" />
                              Client
                            </>
                          )}
                        </Badge>

                        {/* Tier badge */}
                        {user.tier !== "free" && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              user.tier === "pro" &&
                                "border-orange-200 text-orange-700",
                              user.tier === "premium" &&
                                "border-purple-200 text-purple-700",
                              user.tier === "elite" &&
                                "border-yellow-200 text-yellow-700"
                            )}
                          >
                            <Crown className="w-3 h-3 mr-1" />
                            {user.tier.charAt(0).toUpperCase() +
                              user.tier.slice(1)}
                          </Badge>
                        )}

                        {/* Location */}
                        {user.city && (
                          <Badge
                            variant="outline"
                            className="text-xs border-gray-200 text-gray-700"
                          >
                            <MapPin className="w-3 h-3 mr-1" />
                            {user.city}
                          </Badge>
                        )}
                      </div>
                      {/* Specialization */}
                      {user.instrument && (
                        <p className={cn("text-sm", colors.textMuted)}>
                          {user.instrument}
                        </p>
                      )}
                      {/* Location */}
                      {user.roleType && (
                        <Badge
                          variant="outline"
                          className="text-xs border-gray-200 text-gray-700"
                        >
                          <MapPin className="w-3 h-3 mr-1" />
                          {user.roleType}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action button */}
                  <Button
                    onClick={() => handleStartChat(user._id)}
                    disabled={isLoading}
                    className={cn(
                      "rounded-xl transition-all duration-300",
                      colors.primaryBg,
                      colors.primaryBgHover,
                      "text-white",
                      "hover:scale-105 active:scale-95",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {isLoading ? "Starting..." : "Message"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className={cn("p-4 border-t", colors.border)}>
          <div className="flex justify-between text-sm">
            <span className={colors.textMuted}>
              Showing {filteredUsers?.length || 0} of {allUsers?.length || 0}{" "}
              users
            </span>
            <div className="flex gap-4">
              <span className={cn("flex items-center gap-1", colors.textMuted)}>
                <Music className="w-3 h-3" />
                {allUsers?.filter((u) => u.isMusician).length} musicians
              </span>
              <span className={cn("flex items-center gap-1", colors.textMuted)}>
                <Briefcase className="w-3 h-3" />
                {allUsers?.filter((u) => u.isClient).length} clients
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main ChatListModal Component
export function ChatListModal({ isOpen, onClose }: ChatListModalProps) {
  const { smartCreateOrOpenChat, chats, markAllAsRead } = useUserCurrentChat();
  const { user: currentUser } = useCurrentUser();
  const { colors } = useThemeColors();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);
  const [showUserSearch, setShowUserSearch] = useState(false);

  const totalUnreadCount = useUnreadCount();

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        if (showUserSearch) {
          setShowUserSearch(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, showUserSearch]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleChatClick = (chatId: string) => {
    smartCreateOrOpenChat(chatId); // This will open the existing chat
    onClose();
  };

  const handleStartNewChat = () => {
    setShowUserSearch(true);
  };

  const handleUserSelect = async (userId: string) => {
    // The chat creation and opening is handled in the UserSearchPanel
    setShowUserSearch(false);
    onClose(); // Close the main modal too
  };

  const handleVideoCall = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Starting video call for chat:", chatId);
  };

  const handleVoiceCall = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Starting voice call for chat:", chatId);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success("All messages marked as read");
    } catch (error) {
      toast.error("Failed to mark messages as read");
    }
  };

  // Filter and sort chats
  const filteredChats = chats?.filter((chat) => {
    const matchesSearch =
      chat.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase());

    const isArchived = chat.isArchived || false;

    if (activeTab === "unread") {
      return matchesSearch && chat.unreadCount > 0 && !isArchived;
    } else if (activeTab === "archived") {
      return matchesSearch && isArchived;
    }

    return matchesSearch && !isArchived;
  });

  const sortedChats = filteredChats?.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
    if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
    return (b.lastMessageAt || 0) - (a.lastMessageAt || 0);
  });

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300"
          onClick={handleBackdropClick}
        />

        {/* Modal Container */}
        <div
          className={cn(
            "relative w-full max-w-md h-[90vh] rounded-3xl shadow-2xl border flex flex-col",
            colors.card,
            colors.cardBorder,
            "backdrop-blur-sm bg-white/95"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-2xl",
                  colors.warningBg,
                  colors.warningBorder
                )}
              >
                <MessageCircle className={cn("w-5 h-5", colors.warningText)} />
              </div>
              <div>
                <h3 className={cn("text-xl font-bold", colors.text)}>
                  Messages
                </h3>
                <p className={cn("text-sm mt-0.5", colors.textMuted)}>
                  {sortedChats?.length || 0} conversations
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* New Chat Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleStartNewChat}
                className={cn(
                  "rounded-2xl transition-all duration-300",
                  colors.hoverBg,
                  colors.primary
                )}
                title="New conversation"
              >
                <UserPlus className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className={cn(
                  "rounded-2xl transition-all duration-300",
                  "hover:bg-red-500/10 hover:text-red-600"
                )}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-6 pb-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "pl-11 pr-4 py-3 rounded-2xl border-0",
                  colors.backgroundMuted,
                  "focus:ring-2 focus:ring-orange-500/20"
                )}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 pb-3">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
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
                  {chats?.some((chat) => chat.unreadCount > 0) && (
                    <Badge className="ml-1 h-4 w-4 p-0 text-[10px] bg-orange-500">
                      {chats?.filter((chat) => chat.unreadCount > 0).length}
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

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto px-3 pb-4">
            {!chats ? (
              // Loading skeletons
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-2xl"
                  >
                    <Skeleton
                      className={cn("w-12 h-12 rounded-2xl", colors.skeleton)}
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <Skeleton
                          className={cn("h-4 w-32 rounded", colors.skeleton)}
                        />
                        <Skeleton
                          className={cn("h-3 w-12 rounded", colors.skeleton)}
                        />
                      </div>
                      <Skeleton
                        className={cn("h-3 w-48 rounded", colors.skeleton)}
                      />
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
                    colors.warningBg,
                    colors.warningBorder
                  )}
                >
                  <MessageCircle
                    className={cn("w-8 h-8", colors.warningText)}
                  />
                </div>
                <h4 className={cn("font-bold text-lg mb-2", colors.text)}>
                  {searchQuery ? "No matches found" : "No conversations yet"}
                </h4>
                <p className={cn("text-sm max-w-xs mb-6", colors.textMuted)}>
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Start connecting with other users to see your conversations here"}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={handleStartNewChat}
                    className={cn(
                      "rounded-2xl px-6 py-3",
                      colors.primaryBg,
                      colors.primaryBgHover,
                      "text-white",
                      "font-semibold shadow-lg hover:shadow-xl"
                    )}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Start Your First Conversation
                  </Button>
                )}
              </div>
            ) : (
              // Chat list
              <div className="space-y-2">
                {sortedChats?.map((chat) => {
                  const otherUser = chat.otherParticipants?.[0];
                  const hasUnread = chat.unreadCount > 0;
                  const isPinned = chat.isPinned || false;
                  const isVerified = otherUser?.verified;
                  const isHovered = hoveredChat === chat._id;

                  return (
                    <div
                      key={chat._id}
                      className={cn(
                        "group relative rounded-2xl transition-all duration-300",
                        colors.hoverBg,
                        colors.border,
                        hasUnread && colors.warningBg
                      )}
                      onMouseEnter={() => setHoveredChat(chat._id)}
                      onMouseLeave={() => setHoveredChat(null)}
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

                      <button
                        onClick={() => handleChatClick(chat._id)}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl"
                      >
                        {/* Avatar */}
                        <div className="relative">
                          <Avatar className="w-12 h-12 rounded-2xl border-2 border-orange-200">
                            <AvatarImage src={otherUser?.picture} />
                            <AvatarFallback
                              className={cn(
                                "text-sm font-semibold rounded-2xl",
                                "bg-gradient-to-br from-orange-500/10 to-red-500/10"
                              )}
                            >
                              {otherUser?.firstname?.[0]}
                              {otherUser?.lastname?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          {hasUnread && (
                            <div
                              className={cn(
                                "absolute -top-1 -right-1 w-3 h-3 rounded-full ring-2 ring-white animate-pulse",
                                colors.warningText,
                                "bg-current"
                              )}
                            />
                          )}
                        </div>

                        {/* Chat content */}
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <h4
                                className={cn(
                                  "font-semibold text-sm truncate",
                                  colors.text
                                )}
                              >
                                {chat.displayName}
                              </h4>
                              {isVerified && (
                                <CheckCircle2 className="w-3 h-3 text-blue-500 fill-blue-500" />
                              )}
                            </div>
                            {chat.lastMessageAt && (
                              <span
                                className={cn(
                                  "text-xs whitespace-nowrap",
                                  hasUnread
                                    ? colors.warningText
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
                                  hasUnread
                                    ? colors.warningText
                                    : colors.textMuted
                                )}
                              />
                            )}
                            <p
                              className={cn(
                                "text-sm truncate",
                                hasUnread ? colors.text : colors.textMuted
                              )}
                            >
                              {chat.lastMessage || "Say hello! 👋"}
                            </p>
                          </div>
                        </div>

                        {/* Unread badge */}
                        {hasUnread && (
                          <Badge
                            className={cn(
                              "rounded-full px-2 min-w-[24px] h-6 text-xs font-semibold",
                              colors.primaryBg,
                              "text-white",
                              "animate-pulse"
                            )}
                          >
                            {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                          </Badge>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={cn("p-4 border-t", colors.border)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={showArchived}
                  onCheckedChange={setShowArchived}
                  className="data-[state=checked]:bg-orange-500"
                />
                <Label className={cn("text-sm", colors.textMuted)}>
                  Show Archived
                </Label>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-xs rounded-xl",
                  colors.hoverBg,
                  colors.primary
                )}
              >
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* User Search Panel */}
      <UserSearchPanel
        isOpen={showUserSearch}
        onClose={() => setShowUserSearch(false)}
        onUserSelect={handleUserSelect}
      />
    </>
  );
}

// Time formatting helper
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) {
    return "now";
  } else if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m`;
  } else if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h`;
  } else if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}d`;
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
}
