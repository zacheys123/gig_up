"use client";
import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
} from "lucide-react";
import { MdDashboard } from "react-icons/md";
import { useAuth, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSubscriptionStore } from "@/app/stores/useSubscriptionStore";
import { useThemeColors, useThemeToggle } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { GigUpAssistant } from "../ai/GigupAssistant";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
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

interface NavigationLink {
  label: string;
  href: string;
  icon: React.ReactElement;
  badge?: number | null;
  condition?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  proOnly?: boolean;
}

interface DesktopNavItem {
  href: string;
  label: string;
  icon: React.ReactElement;
  condition?: boolean;
  badge?: number | null;
  pro?: boolean;
}

interface MobileSheetProps {
  isTrialEnded?: boolean;
}

interface ThemeOption {
  id: string;
  label: string;
  icon: React.ReactElement;
  description: string;
}

// Tier configuration with colors and icons
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
    gradient: "from-amber-500 to-orange-600",
    bg: "bg-gradient-to-r from-amber-500 to-orange-600",
    text: "text-amber-100",
    badge: "bg-amber-100 text-amber-800 border-amber-300",
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

// Helper function to safely get tier info
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

  // Pro-only features
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

    // Add pro links if user is pro
    if (isPro) {
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
  const { user: currentUser } = useCurrentUser();
  const { colors } = useThemeColors();
  const [searchFilter, setSearchFilter] = useState("");

  // Use the chat hook instead of direct query
  const { chats, unreadCounts, isUserOnline } = useUserCurrentChat();

  const filteredConversations = chats
    ?.filter(
      (conversation) =>
        conversation.displayName
          ?.toLowerCase()
          .includes(searchFilter.toLowerCase()) ||
        conversation.lastMessage
          ?.toLowerCase()
          .includes(searchFilter.toLowerCase())
    )
    .sort((a, b) => {
      const aUnread = unreadCounts.byChat[a._id] || 0;
      const bUnread = unreadCounts.byChat[b._id] || 0;

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
            "hover:bg-gray-100 dark:hover:bg-gray-800",
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
              "focus:bg-white dark:focus:bg-gray-800 transition-colors"
            )}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filteredConversations?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div
              className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center mb-4",
                "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700"
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
              const unreadCount = unreadCounts.byChat[conversation._id] || 0;
              const isOnline = otherUser ? isUserOnline(otherUser._id) : false;

              return (
                <button
                  key={conversation._id}
                  onClick={() => onConversationSelect(conversation._id)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group",
                    "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                    "border border-transparent hover:border-gray-200 dark:hover:border-gray-700",
                    "shadow-sm hover:shadow-md"
                  )}
                >
                  <div className="relative">
                    <Avatar className="w-14 h-14 rounded-2xl border-2 border-transparent group-hover:border-amber-200 dark:group-hover:border-amber-800 transition-colors">
                      <AvatarImage src={otherUser?.picture} />
                      <AvatarFallback className="text-base font-semibold rounded-2xl">
                        {otherUser?.firstname?.[0]}
                        {otherUser?.lastname?.[0]}
                      </AvatarFallback>
                    </Avatar>

                    {/* Online Status */}
                    {isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-gray-900" />
                    )}

                    {/* Tier Badge */}
                    {otherUser?.tier !== "free" && (
                      <div className="absolute -top-1 -right-1">
                        <TierIcon
                          className={cn(
                            "w-5 h-5 p-1 rounded-full border-2 border-white dark:border-gray-900",
                            tierInfo.text,
                            tierInfo.bg
                          )}
                        />
                      </div>
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
                            colors.textMuted
                          )}
                        >
                          {formatTimestamp(conversation.lastMessageAt)}
                        </span>
                      )}
                    </div>

                    <p
                      className={cn(
                        "text-sm truncate",
                        unreadCount > 0
                          ? "font-semibold text-gray-900 dark:text-white"
                          : colors.textMuted
                      )}
                    >
                      {conversation.lastMessage || "Start a conversation"}
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <div className="flex-shrink-0">
                      <span
                        className={cn(
                          "bg-blue-500 text-white text-xs font-semibold rounded-full px-2 py-1 min-w-[24px] text-center",
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

const MobileSheet: React.FC<MobileSheetProps> = ({ isTrialEnded }) => {
  const { userId } = useAuth();
  const { isSignedIn, user: clerkUser } = useUser();
  const currentPath = usePathname();
  const { user } = useCurrentUser();

  // ✅ Use subscription store properly
  const { isPro } = useSubscriptionStore();

  const { colors, theme } = useThemeColors();
  const { setTheme } = useThemeToggle();

  // Use the chat hook for unread counts and chat data
  const { totalUnread, markAllAsRead } = useUserCurrentChat();
  const { openChat } = useChat();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [activeView, setActiveView] = useState<"main" | "conversations">(
    "main"
  );
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

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

  // ✅ Pass isPro and isTrialEnded to getNavigationLinks
  const navigationLinks: NavigationLink[] = hasMinimumData(user)
    ? getNavigationLinks(userId as string, user, isPro(), isTrialEnded)
    : getEssentialLinks();

  // ✅ Calculate total unread from chats directly as fallback
  const { chats } = useUserCurrentChat();
  const calculatedTotalUnread =
    chats?.reduce((total, chat) => {
      return total + (chat.unreadCount || 0);
    }, 0) || 0;

  // ✅ Use the calculated total if the hook returns 0 but we have chats with unread counts
  const displayTotalUnread =
    totalUnread > 0 ? totalUnread : calculatedTotalUnread;

  const desktopItems: DesktopNavItem[] = [
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
      badge: displayTotalUnread > 0 ? displayTotalUnread : null,
    },
  ];

  const missingItems = desktopItems
    .filter((item) => item.condition !== false)
    .filter((item) => !navigationLinks.some((link) => link.href === item.href));

  const completeLinks: NavigationLink[] = [...navigationLinks, ...missingItems];

  const finalLinks = completeLinks.map((link) => {
    if (link.href === "/messages" && isSignedIn) {
      return {
        ...link,
        onClick: handleOpenMessages,
        badge: displayTotalUnread > 0 ? displayTotalUnread : null,
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

  // Get user tier from user data or fallback to free
  const userTier = user?.tier || "free";
  const currentTier = getTierInfo(userTier);
  const TierIcon = currentTier.icon;

  // ✅ Show upgrade prompt if trial ended or not pro
  const showUpgradePrompt = isTrialEnded || !isPro;

  return (
    <>
      <Sheet open={isSheetOpen} onOpenChange={handleSheetToggle}>
        <SheetTrigger asChild>
          <button className="p-2 rounded-xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Menu
              className={cn(
                "w-6 h-6 transition-colors duration-200",
                colors.text,
                "hover:text-amber-600 dark:hover:text-amber-400"
              )}
            />
          </button>
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
              {/* Header */}
              <div className={cn("p-6 border-b", colors.border)}>
                <div className="flex items-center justify-between mb-4">
                  <SheetTitle className={cn("text-2xl font-bold", colors.text)}>
                    {hasMinimumData(user) ? "Menu" : "GigUp"}
                  </SheetTitle>
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
                    <Avatar className="w-12 h-12 rounded-2xl border-2 border-amber-200 dark:border-amber-800">
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
                          <Lock className="w-3 h-3 text-amber-500" />
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                            {isTrialEnded ? "Trial Ended" : "Upgrade to Pro"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {isSignedIn && displayTotalUnread > 0 && (
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

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {finalLinks
                  .filter((link) => currentPath !== link.href)
                  .filter((link) => {
                    // ✅ Hide pro-only links if user is not pro
                    if (link.proOnly && !isPro) return false;
                    return true;
                  })
                  .map((link, index) => {
                    const isActive = currentPath === link.href;
                    const isProOnly = link.proOnly && !isPro;

                    const linkElement = (
                      <div
                        className={cn(
                          "flex items-center justify-between w-full px-4 py-4 rounded-2xl transition-all duration-200 group relative",
                          isActive
                            ? "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800"
                            : colors.hoverBg,
                          "hover:border-amber-200 dark:hover:border-amber-800",
                          "border border-transparent",
                          isProOnly && "opacity-60"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <span
                            className={cn(
                              "transition-colors duration-200",
                              isActive
                                ? "text-amber-600 dark:text-amber-400"
                                : "group-hover:text-amber-600 dark:group-hover:text-amber-400",
                              isProOnly && "text-gray-400"
                            )}
                          >
                            {link.icon}
                          </span>
                          <span
                            className={cn(
                              "text-base font-medium transition-colors duration-200",
                              isActive
                                ? "text-amber-600 dark:text-amber-400"
                                : colors.text,
                              isProOnly && "text-gray-500"
                            )}
                          >
                            {link.label}
                          </span>
                          {isProOnly && (
                            <Lock className="w-3 h-3 text-amber-500" />
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

                {/* ✅ Upgrade Prompt */}
                {showUpgradePrompt && (
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                    <div className="flex items-center gap-3 mb-2">
                      <Crown className="w-5 h-5" />
                      <h4 className="font-bold text-sm">Unlock Pro Features</h4>
                    </div>
                    <p className="text-xs text-amber-100 mb-3">
                      {isTrialEnded
                        ? "Your trial has ended. Upgrade to continue accessing premium features."
                        : "Upgrade to Pro for advanced analytics, priority support, and more."}
                    </p>
                    <Link
                      href="/upgrade"
                      onClick={() => setIsSheetOpen(false)}
                      className="block w-full text-center bg-white text-amber-600 py-2 px-4 rounded-xl text-sm font-semibold hover:bg-amber-50 transition-colors"
                    >
                      Upgrade Now
                    </Link>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className={cn("p-6 border-t space-y-4", colors.border)}>
                {!isSignedIn && (
                  <div className="space-y-3">
                    <Link
                      href="/sign-in"
                      onClick={() => setIsSheetOpen(false)}
                      className={cn(
                        "flex items-center justify-center gap-2 w-full px-4 py-3 rounded-2xl transition-all duration-200",
                        "border border-gray-200 dark:border-gray-700",
                        "hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400",
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
                        "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
                        "text-white font-semibold shadow-lg hover:shadow-xl",
                        "transform hover:scale-105"
                      )}
                    >
                      <span>Create Account</span>
                    </Link>
                  </div>
                )}

                {/* Theme Selector */}
                <div
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all duration-200",
                    "hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20",
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
                      "hover:bg-amber-100 dark:hover:bg-amber-900/30",
                      "hover:text-amber-600 dark:hover:text-amber-400"
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

                {/* AI Assistant */}
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

      {/* Theme Selection Modal */}
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
                  "hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20",
                  theme === option.id
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
                    : colors.border,
                  "transform hover:scale-105"
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    theme === option.id
                      ? "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30"
                      : "bg-gray-100 dark:bg-gray-800"
                  )}
                >
                  {option.icon}
                </div>
                <div className="flex-1 text-left">
                  <div
                    className={cn(
                      "font-semibold",
                      theme === option.id
                        ? "text-amber-600 dark:text-amber-400"
                        : colors.text
                    )}
                  >
                    {option.label}
                  </div>
                  <div className={cn("text-sm", colors.textMuted)}>
                    {option.description}
                  </div>
                </div>
                {theme === option.id && (
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MobileSheet;
