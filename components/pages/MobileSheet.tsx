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
import { useUnreadCount } from "@/hooks/useUnreadCount";
import { useChat } from "@/app/context/ChatContext";
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

interface NavigationLink {
  label: string;
  href: string;
  icon: React.ReactElement;
  badge?: number;
  condition?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

interface DesktopNavItem {
  href: string;
  label: string;
  icon: React.ReactElement;
  condition?: boolean;
  badge?: number;
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

const getNavigationLinks = (
  userId: string | undefined,
  user: any
): NavigationLink[] => {
  const coreLinks: NavigationLink[] = [
    { label: "Home", href: "/", icon: <Home size={20} /> },
    { label: "Dashboard", href: "/dashboard", icon: <MdDashboard size={20} /> },
    { label: "Search", href: "/auth/search", icon: <Search size={20} /> },
    { label: "Profile", href: "/profile", icon: <User size={20} /> },
    {
      href: "/messages",
      icon: <MessageCircle size={20} />,
      label: "Messages",
      badge: 3,
    },
    { label: "Settings", href: "/settings", icon: <Settings size={20} /> },
    { label: "Games", href: "/game", icon: <Gamepad size={20} /> },
  ];

  if (user?._id) {
    coreLinks.splice(
      2,
      0,
      {
        label: "Reviews",
        href: `/allreviews/${user._id}/*${user.firstname}${user.lastname}`,
        icon: <BookA size={20} />,
      },
      {
        label: "Personal Reviews",
        href: `/reviews/${user._id}/*${user.firstname}${user.lastname}`,
        icon: <BookCopy size={20} />,
      }
    );

    if (user?.isMusician && !user?.isClient) {
      coreLinks.splice(5, 0, {
        label: "My Videos",
        href: `/search/allvideos/${user._id}/*${user.firstname}/${user.lastname}`,
        icon: <VideoIcon size={20} />,
      });
    }

    coreLinks.splice(6, 0, {
      label: "Gigs",
      href: user?.isClient ? `/create/${userId}` : `/av_gigs/${userId}`,
      icon: <Music size={20} />,
    });
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
  { label: "Home", href: "/", icon: <Home size={20} /> },
  { label: "Contact", href: "/contact", icon: <Mail size={20} /> },
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

  const conversations = useQuery(
    api.controllers.chat.getUserChats,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  const filteredConversations = conversations
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
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
      return (b.lastMessageAt || 0) - (a.lastMessageAt || 0);
    });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onNavigateBack}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">Conversations</h3>
          <p className={cn("text-sm", colors.textMuted)}>
            Your message threads
          </p>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Filter conversations..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="pl-10 bg-gray-50 dark:bg-gray-500 border-0 text-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filteredConversations?.length === 0 ? (
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
              {searchFilter ? "No results found" : "No conversations"}
            </h4>
            <p className={cn("text-sm", colors.textMuted)}>
              {searchFilter
                ? "Adjust your search terms"
                : "Begin messaging with other users"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredConversations?.map((conversation) => {
              const otherUser = conversation.otherParticipants[0];

              return (
                <button
                  key={conversation._id}
                  onClick={() => onConversationSelect(conversation._id)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200",
                    "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                    "border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                  )}
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={otherUser?.picture} />
                    <AvatarFallback className="text-sm">
                      {otherUser?.firstname?.[0]}
                      {otherUser?.lastname?.[0]}
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
                        {conversation.displayName}
                      </h4>
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
                        conversation.unreadCount > 0
                          ? "font-medium text-gray-900 dark:text-white"
                          : colors.textMuted
                      )}
                    >
                      {conversation.lastMessage || "New conversation"}
                    </p>
                  </div>

                  {conversation.unreadCount > 0 && (
                    <div className="flex-shrink-0">
                      <span
                        className={cn(
                          "bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center",
                          "animate-pulse"
                        )}
                      >
                        {conversation.unreadCount > 99
                          ? "99+"
                          : conversation.unreadCount}
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
  const { isPro } = useSubscriptionStore();
  const { colors, isDarkMode, theme } = useThemeColors();
  const { toggleDarkMode, setTheme } = useThemeToggle();

  const unreadMessageCount = useUnreadCount();
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

  const [userTier, setUserTier] = React.useState<string>("free");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTier = localStorage.getItem("tier");
      setUserTier(storedTier || "free");
    }
  }, []);

  const navigationLinks: NavigationLink[] = hasMinimumData(user)
    ? getNavigationLinks(userId as string, user)
    : getEssentialLinks();

  const hasUserRole = user?.isClient || user?.isMusician;
  const isUserMusician = user?.isMusician;

  const desktopItems: DesktopNavItem[] = [
    {
      href: "/community",
      label: "Community",
      icon: <Users size={20} />,
      condition: isSignedIn,
    },
    {
      href: "/messages",
      label: "Messages",
      icon: <MessageCircle size={20} />,
      condition: isSignedIn,
      badge: unreadMessageCount,
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
        badge: unreadMessageCount,
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
      description: "Bright light theme",
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
      description: "Match device settings",
    },
  ];

  return (
    <>
      <Sheet open={isSheetOpen} onOpenChange={handleSheetToggle}>
        <SheetTrigger asChild>
          <button className="p-2">
            <Menu
              className={cn(
                "text-3xl transition-colors duration-200 hover:text-teal-300",
                colors.text
              )}
            />
          </button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className={cn(
            "w-[85%] sm:w-[70%] h-full p-0 overflow-hidden",
            colors.card,
            colors.border
          )}
        >
          {activeView === "main" && (
            <div className="h-full flex flex-col">
              <div className={cn("p-6 border-b", colors.border)}>
                <SheetTitle
                  className={cn("text-2xl font-bold mb-2", colors.text)}
                >
                  {hasMinimumData(user)
                    ? "Navigation Menu"
                    : "Welcome to Gigup"}
                </SheetTitle>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                      userTier === "pro"
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    )}
                  >
                    {userTier === "pro" && <Crown className="w-3 h-3" />}
                    {userTier === "pro" ? "PRO" : "FREE"}
                  </div>
                  {isSignedIn && unreadMessageCount > 0 && (
                    <p className={cn("text-sm", colors.textMuted)}>
                      {unreadMessageCount} unread message
                      {unreadMessageCount !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {finalLinks
                  .filter((link) => currentPath !== link.href)
                  .map((link, index) => {
                    const linkElement = (
                      <div
                        className={cn(
                          "flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-200 group relative",
                          colors.hoverBg,
                          colors.text,
                          "hover:text-amber-600 dark:hover:text-amber-400"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <span
                            className={cn(
                              "transition-colors duration-200",
                              "group-hover:text-amber-600 dark:group-hover:text-amber-400"
                            )}
                          >
                            {link.icon}
                          </span>
                          <span
                            className={cn(
                              "text-lg font-medium transition-colors duration-200",
                              colors.text
                            )}
                          >
                            {link.label}
                          </span>
                        </div>

                        {link.badge && link.badge > 0 && (
                          <span
                            className={cn(
                              "bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center",
                              "animate-pulse"
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
                          onClick={link.onClick}
                          className="w-full text-left"
                        >
                          {linkElement}
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={index}
                        href={link.href}
                        onClick={() => setIsSheetOpen(false)}
                      >
                        {linkElement}
                      </Link>
                    );
                  })}
              </div>

              <div className="p-4 border-t space-y-4">
                {isSignedIn && hasUserRole && (
                  <Link
                    href={isUserMusician ? "/gigs" : "/create-gig"}
                    onClick={() => setIsSheetOpen(false)}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-4 w-full px-4 py-3 rounded-lg transition-all duration-200",
                        "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
                        "text-white font-medium shadow-md hover:shadow-lg"
                      )}
                    >
                      <Plus size={20} />
                      <span>
                        {isUserMusician ? "Discover Gigs" : "Create Gig"}
                      </span>
                    </div>
                  </Link>
                )}

                {!isSignedIn && (
                  <div className="space-y-2">
                    <Link
                      href="/sign-in"
                      onClick={() => setIsSheetOpen(false)}
                      className={cn(
                        "flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg transition-all duration-200",
                        colors.hoverBg,
                        colors.text,
                        "hover:text-amber-600 dark:hover:text-amber-400"
                      )}
                    >
                      <span>Sign In</span>
                    </Link>
                    <Link
                      href="/sign-up"
                      onClick={() => setIsSheetOpen(false)}
                      className={cn(
                        "flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg transition-all duration-200",
                        "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
                        "text-white font-medium shadow-md hover:shadow-lg"
                      )}
                    >
                      <span>Create Account</span>
                    </Link>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <span className={cn("text-sm", colors.text)}>
                    Appearance: {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </span>
                  <button
                    onClick={() => setIsThemeModalOpen(true)}
                    className={cn(
                      "p-2 rounded-md transition-all duration-200 relative group",
                      colors.text,
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

      <Dialog open={isThemeModalOpen} onOpenChange={setIsThemeModalOpen}>
        <DialogContent className={cn("sm:max-w-md", colors.card)}>
          <DialogHeader>
            <DialogTitle className={cn(colors.text)}>
              Select Theme Preference
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {themeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setTheme(option.id as any);
                  setIsThemeModalOpen(false);
                }}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border transition-all duration-200",
                  "hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20",
                  theme === option.id
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
                    : colors.border
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-md",
                    theme === option.id
                      ? "text-amber-600 dark:text-amber-400"
                      : colors.text
                  )}
                >
                  {option.icon}
                </div>
                <div className="flex-1 text-left">
                  <div
                    className={cn(
                      "font-medium",
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
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
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
