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
  Sun,
  Moon,
  Monitor,
  Crown,
  Zap,
  Gem,
  Star,
  Lock,
  Sparkles,
  Plus,
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
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { useUserCurrentChat } from "@/hooks/useCurrentUserChat";
import { useChat } from "@/app/context/ChatContext";
import { useCheckTrial } from "@/hooks/useCheckTrial";
import { useUnreadCount } from "@/hooks/useUnreadCount";
import ConversationList from "../chat/ConversationDetails";

interface NavigationLink {
  label: string;
  href: string;
  icon: React.ReactElement;
  badge?: number | null;
  condition?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  proOnly?: boolean;
  proBadge?: boolean;
}

interface ThemeOption {
  id: string;
  label: string;
  icon: React.ReactElement;
  description: string;
}

// UserSearchPanel Component for MobileSheet

export const tierConfig = {
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

export const getTierInfo = (tier?: string) => {
  const userTier = tier || "free";
  return tierConfig[userTier as keyof typeof tierConfig];
};

const getNavigationLinks = (
  userId: string | undefined,
  user: any,
  isPro: boolean,
  isTrialEnded?: boolean,
  isInGracePeriod?: boolean
): NavigationLink[] => {
  const coreLinks: NavigationLink[] = [
    { label: "Home", href: "/", icon: <Home size={22} /> },
    { label: "Dashboard", href: "/dashboard", icon: <MdDashboard size={22} /> },
    { label: "Search", href: "/auth/search", icon: <Search size={22} /> },
    { label: "Profile", href: "/profile", icon: <User size={22} /> },
    { label: "Settings", href: "/settings", icon: <Settings size={22} /> },
    {
      label: "Games",
      href: "/game",
      icon: <Gamepad size={22} />,
      proBadge: true, // Add Pro badge to Games
    },
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

  // Add Urgent Gigs with Pro badge (same condition as DesktopNavigation)
  const shouldShowUrgentGigs =
    !user?.isMusician &&
    user?.isClient &&
    (user?.tier === "pro" || isInGracePeriod);

  if (shouldShowUrgentGigs) {
    coreLinks.splice(4, 0, {
      // Insert before Games
      label: "Urgent Gigs",
      href: "/hub/gigs?tab=create-gigs",
      icon: <Zap size={22} />,
      proBadge: true, // Add Pro badge to Urgent Gigs
    });
  }

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
      label: " Gigs",
      href: user?.isClient ? `/hub/gigs?tab=my-gigs` : `/hub/gigs?tab=all`,
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

  // Clients only need phone number to access full features
  if (user.isClient) {
    return !!user.phone;
  }

  // Musicians need more complete profile data
  if (user.isMusician) {
    const hasDateInfo = user.date || user.year || user.month;
    const hasVideoData = user.videoProfile;
    return hasDateInfo || (hasVideoData && user.isMusician);
  }

  // Default case
  return false;
};

const getEssentialLinks = (): NavigationLink[] => [
  { label: "Home", href: "/", icon: <Home size={22} /> },
  { label: "Contact", href: "/contact", icon: <Mail size={22} /> },
];

interface MobileSheetProps {
  children?: React.ReactNode;
  isTrialEnded?: boolean;
}

export function MobileSheet({ children, isTrialEnded }: MobileSheetProps) {
  const { userId } = useAuth();
  const { isSignedIn } = useUser();
  const { colors, theme } = useThemeColors();
  const { toggleDarkMode } = useThemeToggle();
  const pathname = usePathname();
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

  // Enhanced trial experience
  const showTrialEnded = isTrialEnded || isFirstMonthEnd;
  const showGracePeriod = isInGracePeriod;
  const showUpgradePrompt =
    showTrialEnded || showGracePeriod || user?.tier === "free";

  const navigationLinks: NavigationLink[] = hasMinimumData(user)
    ? getNavigationLinks(
        userId as string,
        user,
        isPro(),
        showTrialEnded,
        isInGracePeriod
      )
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
                    const hasProBadge = link.proBadge;

                    const linkElement = (
                      <div
                        className={cn(
                          "flex items-center justify-between w-full px-4 py-4 rounded-2xl transition-all duration-200 group relative",
                          isActive
                            ? "bg-orange-50 border border-orange-200"
                            : colors.hoverBg,
                          "hover:border-orange-200",
                          "border border-transparent",
                          (isProOnly ||
                            (hasProBadge && !isPro && !isInGracePeriod)) &&
                            "opacity-60"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <span
                            className={cn(
                              "transition-colors duration-200",
                              isActive
                                ? "text-orange-600"
                                : "group-hover:text-orange-600",
                              (isProOnly ||
                                (hasProBadge && !isPro && !isInGracePeriod)) &&
                                "text-gray-400"
                            )}
                          >
                            {link.icon}
                          </span>
                          <span
                            className={cn(
                              "text-base font-medium transition-colors duration-200",
                              isActive ? "text-orange-600" : colors.text,
                              (isProOnly ||
                                (hasProBadge && !isPro && !isInGracePeriod)) &&
                                "text-gray-500"
                            )}
                          >
                            {link.label}
                          </span>

                          {/* Show Lock for pro-only features */}
                          {isProOnly && (
                            <Lock className="w-3 h-3 text-orange-500" />
                          )}

                          {/* Show Pro badge for features with proBadge */}
                          {hasProBadge && (isPro || isInGracePeriod) && (
                            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-0.5 border-0">
                              PRO
                            </Badge>
                          )}

                          {/* Show Lock for proBadge features when user doesn't have access */}
                          {hasProBadge && !isPro && !isInGracePeriod && (
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
                          disabled={
                            isProOnly ||
                            (hasProBadge && !isPro && !isInGracePeriod)
                          }
                          className={cn(
                            "w-full text-left",
                            (isProOnly ||
                              (hasProBadge && !isPro && !isInGracePeriod)) &&
                              "cursor-not-allowed"
                          )}
                        >
                          {linkElement}
                        </button>
                      );
                    }

                    const shouldBlockAccess =
                      isProOnly || (hasProBadge && !isPro && !isInGracePeriod);

                    return (
                      <Link
                        key={index}
                        href={shouldBlockAccess ? "/upgrade" : link.href}
                        onClick={() =>
                          !shouldBlockAccess && setIsSheetOpen(false)
                        }
                        className={cn(
                          shouldBlockAccess && "cursor-not-allowed"
                        )}
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
                    className={cn(
                      "p-2 rounded-xl transition-all duration-200",
                      "hover:bg-orange-100",
                      "hover:text-orange-600"
                    )}
                  >
                    {theme === "dark" ? (
                      <Sun className="w-5 h-5" onClick={toggleDarkMode} />
                    ) : theme === "light" ? (
                      <Moon className="w-5 h-5" onClick={toggleDarkMode} />
                    ) : (
                      <Monitor className="w-5 h-5" onClick={toggleDarkMode} />
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
        </SheetContent>{" "}
      </Sheet>
    </>
  );
}

export default MobileSheet;
