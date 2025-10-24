"use client";
import React, { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  BookA,
  BookCopy,
  Gamepad,
  Home,
  Menu,
  MessageCircle,
  Music,
  Search,
  Settings,
  User,
  VideoIcon,
  Mail,
  Users,
  Calendar,
  Plus,
  Sun,
  Moon,
  Monitor,
  Bell,
  ArrowLeft,
  Search as SearchIcon,
  Crown,
  Zap,
  Gem,
  Star,
  CheckCircle,
  Lock,
  Sparkles,
  X,
  UserPlus,
  Briefcase,
  MapPin,
  Pin,
  CheckCheck,
} from "lucide-react";
import { MdDashboard } from "react-icons/md";
import { useAuth, useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSubscriptionStore } from "@/app/stores/useSubscriptionStore";
import { useThemeColors, useThemeToggle } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { GigUpAssistant } from "../ai/GigupAssistant";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useUserCurrentChat } from "@/hooks/useCurrentUserChat";
import { useChat } from "@/app/context/ChatContext";
import { useCheckTrial } from "@/hooks/useCheckTrial";
import { useUnreadCount } from "@/hooks/useUnreadCount";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

interface NavigationLink {
  label: string;
  href: string;
  icon: React.ReactElement;
  badge?: number | null;
  condition?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  proOnly?: boolean;
}

interface ThemeOption {
  id: string;
  label: string;
  icon: React.ReactElement;
  description: string;
}

// UserSearchPanel Component for MobileSheet
function UserSearchPanel({
  isOpen,
  onClose,
  onUserSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUserSelect: (userId: string) => void;
}) {
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
  React.useEffect(() => {
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
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
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
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl border",
                    colors.border
                  )}
                >
                  <div
                    className={cn("w-12 h-12 rounded-2xl", colors.skeleton)}
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn("h-4 w-32 rounded", colors.skeleton)}
                      />
                      <div
                        className={cn("h-3 w-16 rounded", colors.skeleton)}
                      />
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
                      {/* Role Type */}
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

const tierConfig = {
  free: {
    label: "Free",
    icon: User,
    gradient: "from-gray-500 to-gray-700",
    bg: "bg-gradient-to-r from-gray-500 to-gray-700",
    text: "text-gray-100",
    badge: "bg-gray-100 text-gray-800 border-gray-300",
  },
  pro: {
    label: "Pro",
    icon: Zap,
    gradient: "from-orange-500 to-red-600",
    bg: "bg-gradient-to-r from-orange-500 to-red-600",
    text: "text-orange-100",
    badge: "bg-orange-100 text-orange-800 border-orange-300",
  },
  premium: {
    label: "Premium",
    icon: Gem,
    gradient: "from-purple-500 to-pink-600",
    bg: "bg-gradient-to-r from-purple-500 to-pink-600",
    text: "text-purple-100",
    badge: "bg-purple-100 text-purple-800 border-purple-300",
  },
  elite: {
    label: "Elite",
    icon: Crown,
    gradient: "from-yellow-500 to-red-600",
    bg: "bg-gradient-to-r from-yellow-500 to-red-600",
    text: "text-yellow-100",
    badge: "bg-yellow-100 text-yellow-800 border-yellow-300",
  },
};

const getTierInfo = (tier?: string) => {
  const userTier = tier || "free";
  return tierConfig[userTier as keyof typeof tierConfig];
};

const getNavigationLinks = (
  userId: string | undefined,
  user: any,
  isPro: boolean,
  isTrialEnded?: boolean
): NavigationLink[] => {
  const coreLinks: NavigationLink[] = [
    { label: "Home", href: "/", icon: <Home size={22} /> },
    { label: "Dashboard", href: "/dashboard", icon: <MdDashboard size={22} /> },
    { label: "Search", href: "/auth/search", icon: <Search size={22} /> },
    { label: "Profile", href: "/profile", icon: <User size={22} /> },
    { label: "Settings", href: "/settings", icon: <Settings size={22} /> },
    { label: "Games", href: "/game", icon: <Gamepad size={22} /> },
  ];

  const proLinks: NavigationLink[] = [
    {
      label: "Advanced Analytics",
      href: "/analytics",
      icon: <Sparkles size={22} />,
      proOnly: true,
    },
    {
      label: "Priority Support",
      href: "/support",
      icon: <Star size={22} />,
      proOnly: true,
    },
  ];

  if (user?._id) {
    coreLinks.splice(
      2,
      0,
      {
        label: "Reviews",
        href: `/allreviews/${user._id}/*${user.firstname}${user.lastname}`,
        icon: <BookA size={22} />,
      },
      {
        label: "Personal Reviews",
        href: `/reviews/${user._id}/*${user.firstname}${user.lastname}`,
        icon: <BookCopy size={22} />,
      }
    );

    if (user?.isMusician && !user?.isClient) {
      coreLinks.splice(5, 0, {
        label: "My Videos",
        href: `/search/allvideos/${user._id}/*${user.firstname}/${user.lastname}`,
        icon: <VideoIcon size={22} />,
      });
    }

    coreLinks.splice(6, 0, {
      label: "Gigs",
      href: user?.isClient ? `/create/${userId}` : `/av_gigs/${userId}`,
      icon: <Music size={22} />,
    });

    if (isPro && !isTrialEnded) {
      coreLinks.push(...proLinks);
    }
  }

  return coreLinks;
};

const hasMinimumData = (user: any): boolean => {
  if (!user) return false;
  const hasDateInfo = user.date || user.year || user.month;
  const hasVideoData = user.videoProfile;
  return hasDateInfo || hasVideoData;
};

const getEssentialLinks = (): NavigationLink[] => [
  { label: "Home", href: "/", icon: <Home size={22} /> },
  { label: "Contact", href: "/contact", icon: <Mail size={22} /> },
];

const ConversationList = ({
  onNavigateBack,
  onConversationSelect,
}: {
  onNavigateBack: () => void;
  onConversationSelect: (conversationId: string) => void;
}) => {
  const { colors } = useThemeColors();
  const [searchFilter, setSearchFilter] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { chats, isUserOnline } = useUserCurrentChat();
  const { byChat: unreadCounts } = useUnreadCount();

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
                "w-20 h-20 rounded-2xl flex items-center justify-center mb-4",
                "bg-gradient-to-br from-gray-100 to-gray-200"
              )}
            >
              <MessageCircle className={cn("w-8 h-8", colors.textMuted)} />
            </div>
            <h4 className={cn("font-bold text-lg mb-2", colors.text)}>
              {searchFilter ? "No matches found" : "No messages yet"}
            </h4>
            <p className={cn("text-sm max-w-xs", colors.textMuted)}>
              {searchFilter
                ? "Try adjusting your search terms"
                : "Start conversations with other users to see them here"}
            </p>
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
};

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

interface MobileSheetProps {
  children?: React.ReactNode;
  isTrialEnded?: boolean;
}

export function MobileSheet({ children, isTrialEnded }: MobileSheetProps) {
  const { userId } = useAuth();
  const { isSignedIn, user: clerkUser } = useUser();
  const { colors, theme } = useThemeColors();
  const { setTheme } = useThemeToggle();
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useCurrentUser();
  const { isInGracePeriod, isFirstMonthEnd } = useCheckTrial();

  const { isPro } = useSubscriptionStore();
  const { total: totalUnread, byChat: unreadCounts } = useUnreadCount();
  const { markAllAsRead, chats } = useUserCurrentChat();
  const { openChat } = useChat();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [activeView, setActiveView] = useState<"main" | "conversations">(
    "main"
  );
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);

  const handleOpenMessages = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSignedIn) {
      setActiveView("conversations");
    } else {
      window.location.href = "/messages";
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    openChat(conversationId);
    setIsSheetOpen(false);
  };

  const handleBackToMain = () => {
    setActiveView("main");
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleStartNewChat = () => {
    setShowUserSearch(true);
  };

  const handleUserSelect = (userId: string) => {
    setShowUserSearch(false);
    setIsSheetOpen(false);
  };

  // Enhanced trial experience
  const showTrialEnded = isTrialEnded || isFirstMonthEnd;
  const showGracePeriod = isInGracePeriod && !isPro;
  const showUpgradePrompt = showTrialEnded || showGracePeriod || !isPro;

  const navigationLinks: NavigationLink[] = hasMinimumData(user)
    ? getNavigationLinks(userId as string, user, isPro(), showTrialEnded)
    : getEssentialLinks();

  const displayTotalUnread = totalUnread > 0 ? totalUnread : null;

  const additionalItems: NavigationLink[] = [
    {
      href: "/community",
      label: "Community",
      icon: <Users size={22} />,
      condition: isSignedIn,
    },
    {
      href: "/messages",
      label: "Messages",
      icon: <MessageCircle size={22} />,
      condition: isSignedIn,
      badge:
        displayTotalUnread && displayTotalUnread > 0
          ? displayTotalUnread
          : null,
      onClick: handleOpenMessages,
    },
  ];

  const completeLinks: NavigationLink[] = [
    ...navigationLinks,
    ...additionalItems,
  ];

  const finalLinks = completeLinks.map((link) => {
    if (link.href === "/messages" && isSignedIn) {
      return {
        ...link,
        onClick: handleOpenMessages,
        badge:
          displayTotalUnread && displayTotalUnread > 0
            ? displayTotalUnread
            : null,
      };
    }
    return link;
  });

  const handleSheetToggle = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      setTimeout(() => setActiveView("main"), 300);
    }
  };

  const themeOptions: ThemeOption[] = [
    {
      id: "light",
      label: "Light",
      icon: <Sun className="w-5 h-5" />,
      description: "Bright and clean",
    },
    {
      id: "dark",
      label: "Dark",
      icon: <Moon className="w-5 h-5" />,
      description: "Easy on the eyes",
    },
    {
      id: "system",
      label: "System",
      icon: <Monitor className="w-5 h-5" />,
      description: "Match your device",
    },
  ];

  const userTier = user?.tier || "free";
  const currentTier = getTierInfo(userTier);
  const TierIcon = currentTier.icon;

  return (
    <>
      <Sheet open={isSheetOpen} onOpenChange={handleSheetToggle}>
        <SheetTrigger asChild>
          {children || (
            <button className="p-2 rounded-xl transition-all duration-200 hover:bg-gray-100">
              <Menu
                className={cn(
                  "w-6 h-6 transition-colors duration-200",
                  colors.text,
                  "hover:text-orange-600"
                )}
              />
            </button>
          )}
        </SheetTrigger>
        <SheetContent
          side="left"
          className={cn(
            "w-[85%] sm:w-[380px] h-full p-0 overflow-hidden border-0",
            colors.card,
            "shadow-xl"
          )}
        >
          {activeView === "main" && (
            <div className="h-full flex flex-col">
              <div className={cn("p-6 border-b", colors.border)}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={cn("text-2xl font-bold", colors.text)}>
                    {hasMinimumData(user) ? "Menu" : "GigUp"}
                  </h2>
                  <Badge
                    className={cn(
                      "px-3 py-1.5 text-sm font-bold border-0 shadow-lg",
                      currentTier.badge,
                      "flex items-center gap-1.5"
                    )}
                  >
                    <TierIcon className="w-3 h-3" />
                    {currentTier.label}
                  </Badge>
                </div>

                {isSignedIn && user && (
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 rounded-2xl border-2 border-orange-200">
                      <AvatarImage src={user.picture} />
                      <AvatarFallback className="rounded-2xl font-semibold">
                        {user.firstname?.[0]}
                        {user.lastname?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={cn(
                          "font-semibold text-base truncate",
                          colors.text
                        )}
                      >
                        {user.firstname} {user.lastname}
                      </h3>
                      <p className={cn("text-sm truncate", colors.textMuted)}>
                        @{user.username}
                      </p>
                      {showUpgradePrompt && (
                        <div className="flex items-center gap-1 mt-1">
                          <Lock className="w-3 h-3 text-orange-500" />
                          <span className="text-xs text-orange-600 font-medium">
                            {showTrialEnded
                              ? "Trial Ended"
                              : showGracePeriod
                                ? "Grace Period"
                                : "Upgrade to Pro"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {displayTotalUnread && isSignedIn && displayTotalUnread > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-blue-500 text-white border-0"
                    >
                      {displayTotalUnread} unread message
                      {displayTotalUnread !== 1 ? "s" : ""}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="text-xs h-6 px-2"
                    >
                      Mark all read
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {/* New Chat Button */}
                {isSignedIn && (
                  <Button
                    onClick={handleStartNewChat}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 px-4 py-4 rounded-2xl transition-all duration-200",
                      colors.primaryBg,
                      colors.primaryBgHover,
                      "text-white",
                      "font-semibold shadow-lg hover:shadow-xl",
                      "transform hover:scale-105"
                    )}
                  >
                    <UserPlus className="w-5 h-5" />
                    Start New Conversation
                  </Button>
                )}

                {finalLinks
                  .filter((link) => pathname !== link.href)
                  .filter((link) => {
                    // Hide pro-only features if trial ended or not pro
                    if (link.proOnly && (showTrialEnded || !isPro))
                      return false;
                    return link.condition !== false;
                  })
                  .map((link, index) => {
                    const isActive = pathname === link.href;
                    const isProOnly =
                      link.proOnly && (showTrialEnded || !isPro);

                    const linkElement = (
                      <div
                        className={cn(
                          "flex items-center justify-between w-full px-4 py-4 rounded-2xl transition-all duration-200 group relative",
                          isActive
                            ? "bg-orange-50 border border-orange-200"
                            : colors.hoverBg,
                          "hover:border-orange-200",
                          "border border-transparent",
                          isProOnly && "opacity-60"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <span
                            className={cn(
                              "transition-colors duration-200",
                              isActive
                                ? "text-orange-600"
                                : "group-hover:text-orange-600",
                              isProOnly && "text-gray-400"
                            )}
                          >
                            {link.icon}
                          </span>
                          <span
                            className={cn(
                              "text-base font-medium transition-colors duration-200",
                              isActive ? "text-orange-600" : colors.text,
                              isProOnly && "text-gray-500"
                            )}
                          >
                            {link.label}
                          </span>
                          {isProOnly && (
                            <Lock className="w-3 h-3 text-orange-500" />
                          )}
                        </div>

                        {link.badge && link.badge > 0 && (
                          <span
                            className={cn(
                              "bg-red-500 text-white text-xs font-semibold rounded-full px-2 py-1 min-w-[24px] text-center",
                              "animate-pulse shadow-sm"
                            )}
                          >
                            {link.badge > 99 ? "99+" : link.badge}
                          </span>
                        )}
                      </div>
                    );

                    if (link.onClick) {
                      return (
                        <button
                          key={index}
                          onClick={isProOnly ? undefined : link.onClick}
                          disabled={isProOnly}
                          className={cn(
                            "w-full text-left",
                            isProOnly && "cursor-not-allowed"
                          )}
                        >
                          {linkElement}
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={index}
                        href={isProOnly ? "/upgrade" : link.href}
                        onClick={() => !isProOnly && setIsSheetOpen(false)}
                        className={cn(isProOnly && "cursor-not-allowed")}
                      >
                        {linkElement}
                      </Link>
                    );
                  })}

                {showUpgradePrompt && (
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <div className="flex items-center gap-3 mb-2">
                      <Crown className="w-5 h-5" />
                      <h4 className="font-bold text-sm">
                        {showTrialEnded
                          ? "Trial Period Ended"
                          : showGracePeriod
                            ? "Grace Period Active"
                            : "Unlock Pro Features"}
                      </h4>
                    </div>
                    <p className="text-xs text-orange-100 mb-3">
                      {showTrialEnded
                        ? "Your trial has ended. Upgrade to continue accessing premium features."
                        : showGracePeriod
                          ? "You're in grace period. Upgrade now to maintain access to all features."
                          : "Upgrade to Pro for advanced analytics, priority support, and more."}
                    </p>
                    <Link
                      href="/upgrade"
                      onClick={() => setIsSheetOpen(false)}
                      className="block w-full text-center bg-white text-orange-600 py-2 px-4 rounded-xl text-sm font-semibold hover:bg-orange-50 transition-colors"
                    >
                      {showGracePeriod ? "Upgrade Now" : "Upgrade to Pro"}
                    </Link>
                  </div>
                )}
              </div>

              <div className={cn("p-6 border-t space-y-4", colors.border)}>
                {!isSignedIn && (
                  <div className="space-y-3">
                    <Link
                      href="/sign-in"
                      onClick={() => setIsSheetOpen(false)}
                      className={cn(
                        "flex items-center justify-center gap-2 w-full px-4 py-3 rounded-2xl transition-all duration-200",
                        "border border-gray-200",
                        "hover:border-orange-500 hover:text-orange-600",
                        colors.text
                      )}
                    >
                      <span className="font-semibold">Sign In</span>
                    </Link>
                    <Link
                      href="/sign-up"
                      onClick={() => setIsSheetOpen(false)}
                      className={cn(
                        "flex items-center justify-center gap-2 w-full px-4 py-3 rounded-2xl transition-all duration-200",
                        "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
                        "text-white font-semibold shadow-lg hover:shadow-xl",
                        "transform hover:scale-105"
                      )}
                    >
                      <span>Create Account</span>
                    </Link>
                  </div>
                )}

                <div
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all duration-200",
                    "hover:border-orange-500 hover:bg-orange-50",
                    colors.border
                  )}
                >
                  <div>
                    <div className={cn("font-medium text-sm", colors.text)}>
                      Appearance
                    </div>
                    <div className={cn("text-xs", colors.textMuted)}>
                      {theme.charAt(0).toUpperCase() + theme.slice(1)} mode
                    </div>
                  </div>
                  <button
                    onClick={() => setIsThemeModalOpen(true)}
                    className={cn(
                      "p-2 rounded-xl transition-all duration-200",
                      "hover:bg-orange-100",
                      "hover:text-orange-600"
                    )}
                  >
                    {theme === "dark" ? (
                      <Moon className="w-5 h-5" />
                    ) : theme === "light" ? (
                      <Sun className="w-5 h-5" />
                    ) : (
                      <Monitor className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <GigUpAssistant />
              </div>
            </div>
          )}

          {activeView === "conversations" && (
            <ConversationList
              onNavigateBack={handleBackToMain}
              onConversationSelect={handleSelectConversation}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* User Search Panel */}
      <UserSearchPanel
        isOpen={showUserSearch}
        onClose={() => setShowUserSearch(false)}
        onUserSelect={handleUserSelect}
      />

      <Dialog open={isThemeModalOpen} onOpenChange={setIsThemeModalOpen}>
        <DialogContent
          className={cn(
            "sm:max-w-md rounded-2xl border-0 shadow-2xl",
            colors.card
          )}
        >
          <DialogHeader>
            <DialogTitle className={cn("text-xl font-bold", colors.text)}>
              Choose Theme
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            {themeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setTheme(option.id as any);
                  setIsThemeModalOpen(false);
                }}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border transition-all duration-200",
                  "hover:border-orange-500 hover:bg-orange-50",
                  theme === option.id
                    ? "border-orange-500 bg-orange-50"
                    : colors.border,
                  "transform hover:scale-105"
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    theme === option.id
                      ? "text-orange-600 bg-orange-100"
                      : "bg-gray-100"
                  )}
                >
                  {option.icon}
                </div>
                <div className="flex-1 text-left">
                  <div
                    className={cn(
                      "font-semibold",
                      theme === option.id ? "text-orange-600" : colors.text
                    )}
                  >
                    {option.label}
                  </div>
                  <div className={cn("text-sm", colors.textMuted)}>
                    {option.description}
                  </div>
                </div>
                {theme === option.id && (
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default MobileSheet;
