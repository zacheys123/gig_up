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
  Bell,
  ArrowLeft,
  Search as SearchIcon,
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

// Define interfaces
interface NavLink {
  label: string;
  href: string;
  icon: React.ReactElement;
  badge?: number;
  condition?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

interface DesktopNavigationItem {
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

// Define the nav links function with proper typing
const getNavLinks = (userId: string | undefined, user: any): NavLink[] => {
  const baseLinks: NavLink[] = [
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

  // Add conditional links based on user data
  if (user?._id) {
    baseLinks.splice(
      2,
      0, // Insert at position 2
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

    // Add musician-specific links
    if (user?.isMusician && !user?.isClient) {
      baseLinks.splice(
        5,
        0, // Insert at position 5
        {
          label: "My Videos",
          href: `/search/allvideos/${user._id}/*${user.firstname}/${user.lastname}`,
          icon: <VideoIcon size={20} />,
        }
      );
    }

    // Add gigs link
    baseLinks.splice(
      6,
      0, // Insert at position 6
      {
        label: "Gigs",
        href: user?.isClient ? `/create/${userId}` : `/av_gigs/${userId}`,
        icon: <Music size={20} />,
      }
    );
  }

  return baseLinks;
};

// Function to check if user has minimal data
const hasMinimalData = (user: any): boolean => {
  if (!user) return false;

  // Check if user has date, year, month, or videoProfile data
  const hasDateData = user.date || user.year || user.month;
  const hasVideoProfile = user.videoProfile;

  return hasDateData || hasVideoProfile;
};

// Basic links for users without minimal data
const getBasicLinks = (): NavLink[] => [
  { label: "Home", href: "/", icon: <Home size={20} /> },
  { label: "Contact", href: "/contact", icon: <Mail size={20} /> },
];

// Chat List Component
const ChatList = ({
  onBack,
  onSelectChat,
}: {
  onBack: () => void;
  onSelectChat: (chatId: string) => void;
}) => {
  const { user: currentUser } = useCurrentUser();
  const { colors } = useThemeColors();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch user's chats
  const chats = useQuery(
    api.controllers.chat.getUserChats,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  // Filter and sort chats
  const filteredChats = chats
    ?.filter(
      (chat) =>
        chat.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Unread chats first, then by recent activity
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
      return (b.lastMessageAt || 0) - (a.lastMessageAt || 0);
    });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">Messages</h3>
          <p className={cn("text-sm", colors.textMuted)}>Your conversations</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 dark:bg-gray-800 border-0"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredChats?.length === 0 ? (
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
              {searchQuery ? "No matches found" : "No conversations yet"}
            </h4>
            <p className={cn("text-sm", colors.textMuted)}>
              {searchQuery
                ? "Try a different search term"
                : "Start a conversation with other users"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredChats?.map((chat) => {
              const otherParticipant = chat.otherParticipants[0];

              return (
                <button
                  key={chat._id}
                  onClick={() => onSelectChat(chat._id)}
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
    </div>
  );
};

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

const MobileSheet: React.FC<MobileSheetProps> = ({ isTrialEnded }) => {
  const { userId } = useAuth();
  const { isSignedIn, user: clerkUser } = useUser();
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const { isPro } = useSubscriptionStore();
  const { colors, isDarkMode } = useThemeColors();
  const { toggleDarkMode } = useThemeToggle();

  const unreadCount = useUnreadCount();
  const { openChat } = useChat();

  // State for sheet content
  const [sheetOpen, setSheetOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"main" | "chatList">("main");

  // Function to handle opening chat list
  const handleOpenMessages = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSignedIn) {
      setCurrentView("chatList");
    } else {
      // For non-signed-in users, navigate to messages page
      window.location.href = "/messages";
    }
  };

  // Function to handle chat selection
  const handleSelectChat = (chatId: string) => {
    openChat(chatId);
    setSheetOpen(false); // Close the sheet when chat opens
  };

  // Function to go back to main menu
  const handleBackToMain = () => {
    setCurrentView("main");
  };

  // Safely get tier from localStorage
  const [tier, setTier] = React.useState<string>("free");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTier = localStorage.getItem("tier");
      setTier(storedTier || "free");
    }
  }, []);

  // Determine which links to show based on user data
  const navLinks: NavLink[] = hasMinimalData(user)
    ? getNavLinks(userId as string, user)
    : getBasicLinks();

  // Check if user has a role
  const hasRole = user?.isClient || user?.isMusician;
  const isMusician = user?.isMusician;

  // Add the missing navigation items from DesktopNavigation
  const desktopNavigationItems: DesktopNavigationItem[] = [
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
      badge: unreadCount,
    },
  ];

  // Filter and add missing desktop navigation items
  const missingDesktopItems = desktopNavigationItems
    .filter((item) => item.condition !== false)
    .filter((item) => !navLinks.some((link) => link.href === item.href));

  // Combine existing nav links with missing desktop items
  const allNavLinks: NavLink[] = [...navLinks, ...missingDesktopItems];

  // Update Messages link to use toggle for signed-in users
  const updatedNavLinks = allNavLinks.map((link) => {
    if (link.href === "/messages" && isSignedIn) {
      return {
        ...link,
        onClick: handleOpenMessages,
        badge: unreadCount,
      };
    }
    return link;
  });

  // Reset to main view when sheet closes
  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open);
    if (!open) {
      // Small delay to ensure smooth transition
      setTimeout(() => setCurrentView("main"), 300);
    }
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
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
        {/* Main Navigation View */}
        {currentView === "main" && (
          <div className="h-full flex flex-col">
            <div className={cn("p-6 border-b", colors.border)}>
              <SheetTitle
                className={cn("text-2xl font-bold mb-2", colors.text)}
              >
                {hasMinimalData(user) ? "Access More Info" : "Welcome to Gigup"}
              </SheetTitle>
              {isSignedIn && unreadCount > 0 && (
                <p className={cn("text-sm", colors.textMuted)}>
                  You have {unreadCount} unread message
                  {unreadCount !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {updatedNavLinks
                .filter((link) => pathname !== link.href)
                .map((link, index) => {
                  const linkContent = (
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

                      {/* Badge - positioned to the right */}
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
                        {linkContent}
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={index}
                      href={link.href}
                      onClick={() => setSheetOpen(false)}
                    >
                      {linkContent}
                    </Link>
                  );
                })}
            </div>

            {/* Footer Section */}
            <div className="p-4 border-t space-y-4">
              {/* Create Button */}
              {isSignedIn && hasRole && (
                <Link
                  href={isMusician ? "/gigs" : "/create-gig"}
                  onClick={() => setSheetOpen(false)}
                >
                  <div
                    className={cn(
                      "flex items-center gap-4 w-full px-4 py-3 rounded-lg transition-all duration-200",
                      "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
                      "text-white font-medium shadow-md hover:shadow-lg"
                    )}
                  >
                    <Plus size={20} />
                    <span>{isMusician ? "Find Gigs" : "Post Gig"}</span>
                  </div>
                </Link>
              )}

              {/* Sign In/Sign Up */}
              {!isSignedIn && (
                <div className="space-y-2">
                  <Link
                    href="/sign-in"
                    onClick={() => setSheetOpen(false)}
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
                    onClick={() => setSheetOpen(false)}
                    className={cn(
                      "flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg transition-all duration-200",
                      "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
                      "text-white font-medium shadow-md hover:shadow-lg"
                    )}
                  >
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}

              {/* Theme Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <span className={cn("text-sm", colors.text)}>
                  {isDarkMode ? "Light Mode" : "Dark Mode"}
                </span>
                <button
                  onClick={toggleDarkMode}
                  className={cn(
                    "p-2 rounded-md transition-all duration-200 relative group",
                    colors.text,
                    "hover:text-amber-600 dark:hover:text-amber-400"
                  )}
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>
              </div>

              <GigUpAssistant />
            </div>
          </div>
        )}

        {/* Chat List View */}
        {currentView === "chatList" && (
          <ChatList onBack={handleBackToMain} onSelectChat={handleSelectChat} />
        )}
      </SheetContent>
    </Sheet>
  );
};

export default MobileSheet;
