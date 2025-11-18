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
  AlertCircle,
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
  requiresCompleteProfile?: boolean;
  availableAfterTrial?: boolean; // New flag - available even after trial ends
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

const hasMinimumData = (user: any): boolean => {
  if (!user) {
    console.log("❌ No user found");
    return false;
  }

  // Check if user has completed first-time profile setup
  if (user.firstTimeInProfile !== false) {
    console.log("❌ User hasn't completed first-time profile setup");
    return false;
  }

  const isMusician = user.isMusician;
  const isTeacher = user.roleType === "teacher";
  const isClient = user.isClient;
  const isBooker = user.isBooker;

  console.log("🔍 User role check:", {
    isMusician,
    isTeacher,
    isClient,
    isBooker,
    roleType: user.roleType,
  });

  if (isMusician) {
    if (isTeacher) {
      // TEACHER: Basic required fields for navigation access
      const hasTeacherBasics =
        !!user.firstname?.trim() &&
        !!user.lastname?.trim() &&
        !!user.city?.trim() &&
        !!user.phone?.trim() &&
        !!(user.date?.trim() && user.month?.trim() && user.year?.trim()) &&
        !!user.roleType;

      console.log("👨‍🏫 Teacher basic requirements:", {
        firstname: !!user.firstname?.trim(),
        lastname: !!user.lastname?.trim(),
        city: !!user.city?.trim(),
        phone: !!user.phone?.trim(),
        dateOfBirth: !!(
          user.date?.trim() &&
          user.month?.trim() &&
          user.year?.trim()
        ),
        roleType: !!user.roleType,
        hasTeacherBasics,
      });

      return hasTeacherBasics;
    } else {
      // REGULAR MUSICIAN: Basic required fields for navigation access
      const hasMusicianBasics =
        !!user.firstname?.trim() &&
        !!user.lastname?.trim() &&
        !!user.city?.trim() &&
        !!user.phone?.trim() &&
        !!(user.date?.trim() && user.month?.trim() && user.year?.trim()) &&
        !!user.roleType;

      console.log("🎵 Musician basic requirements:", {
        firstname: !!user.firstname?.trim(),
        lastname: !!user.lastname?.trim(),
        city: !!user.city?.trim(),
        phone: !!user.phone?.trim(),
        dateOfBirth: !!(
          user.date?.trim() &&
          user.month?.trim() &&
          user.year?.trim()
        ),
        roleType: !!user.roleType,
        hasMusicianBasics,
      });

      return hasMusicianBasics;
    }
  } else if (isClient || isBooker) {
    // CLIENT/BOOKER: Basic required fields for navigation access
    const hasClientBasics =
      !!user.firstname?.trim() &&
      !!user.lastname?.trim() &&
      !!user.city?.trim() &&
      !!user.phone?.trim();

    console.log("👤 Client/Booker basic requirements:", {
      firstname: !!user.firstname?.trim(),
      lastname: !!user.lastname?.trim(),
      city: !!user.city?.trim(),
      phone: !!user.phone?.trim(),
      hasClientBasics,
    });

    return hasClientBasics;
  }

  console.log("❓ User role not recognized or incomplete:", {
    isClient,
    isMusician,
    isBooker,
    roleType: user.roleType,
    firstTimeInProfile: user.firstTimeInProfile,
  });

  return false;
};

const getBaseLinks = (): NavigationLink[] => [
  {
    label: "Home",
    href: "/",
    icon: <Home size={22} />,
    availableAfterTrial: true,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: <User size={22} />,
    availableAfterTrial: true,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <Settings size={22} />,
    availableAfterTrial: true,
  },
  {
    label: "Contact",
    href: "/contact",
    icon: <Mail size={22} />,
    availableAfterTrial: true,
  },
];

const getFullNavigationLinks = (
  userId: string | undefined,
  user: any,
  isInGracePeriod?: boolean
): NavigationLink[] => {
  const coreLinks: NavigationLink[] = [
    {
      label: "Home",
      href: "/",
      icon: <Home size={22} />,
      availableAfterTrial: true,
    },
    { label: "Dashboard", href: "/dashboard", icon: <MdDashboard size={22} /> },
    {
      label: "Search",
      href: "/auth/search",
      icon: <Search size={22} />,
      requiresCompleteProfile: true,
    },
    {
      label: "Profile",
      href: "/profile",
      icon: <User size={22} />,
      availableAfterTrial: true,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings size={22} />,
      availableAfterTrial: true,
    },
    {
      label: "Games",
      href: "/game",
      icon: <Gamepad size={22} />,
      proBadge: true,
      requiresCompleteProfile: true,
    },
  ];

  const proLinks: NavigationLink[] = [
    {
      label: "Advanced Analytics",
      href: "/analytics",
      icon: <Sparkles size={22} />,
      proOnly: true,
      requiresCompleteProfile: true,
    },
    {
      label: "Priority Support",
      href: "/support",
      icon: <Star size={22} />,
      proOnly: true,
      requiresCompleteProfile: true,
    },
  ];

  // Add Urgent Gigs with Pro badge
  const shouldShowUrgentGigs =
    !user?.isMusician &&
    user?.isClient &&
    (user?.tier === "pro" || isInGracePeriod);

  if (shouldShowUrgentGigs) {
    coreLinks.splice(4, 0, {
      label: "Urgent Gigs",
      href: "/hub/gigs?tab=create-gigs",
      icon: <Zap size={22} />,
      proBadge: true,
      requiresCompleteProfile: true,
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
        requiresCompleteProfile: true,
      },
      {
        label: "Personal Reviews",
        href: `/reviews/${user._id}/*${user.firstname}${user.lastname}`,
        icon: <BookCopy size={22} />,
        requiresCompleteProfile: true,
      }
    );

    if (user?.isMusician && !user?.isClient) {
      coreLinks.splice(5, 0, {
        label: "My Videos",
        href: `/search/allvideos/${user._id}/*${user.firstname}/${user.lastname}`,
        icon: <VideoIcon size={22} />,
        requiresCompleteProfile: true,
      });
    }

    coreLinks.splice(6, 0, {
      label: " Gigs",
      href: user?.isClient ? `/hub/gigs?tab=my-gigs` : `/hub/gigs?tab=all`,
      icon: <Music size={22} />,
      requiresCompleteProfile: true,
    });

    // Show pro links for pro users AND during grace period
    if (user?.tier === "pro" || isInGracePeriod) {
      coreLinks.push(...proLinks);
    }
  }

  return coreLinks;
};

interface MobileSheetProps {
  children?: React.ReactNode;
}

export function MobileSheet({ children }: MobileSheetProps) {
  const { userId } = useAuth();
  const { isSignedIn } = useUser();
  const { colors, theme } = useThemeColors();
  const { toggleDarkMode } = useThemeToggle();
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

  // Enhanced trial experience
  const showTrialEnded = isFirstMonthEnd;
  const showGracePeriod = isInGracePeriod;
  const showUpgradePrompt =
    showTrialEnded || showGracePeriod || user?.tier === "free";

  // Check if profile is complete for navigation
  const isProfileComplete = hasMinimumData(user);

  // Determine which links to show based on trial status
  const shouldShowLimitedLinks = showTrialEnded && !isInGracePeriod;

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
  // Get navigation links based on trial status
  const navigationLinks: NavigationLink[] = shouldShowLimitedLinks
    ? getBaseLinks() // Show only base links after trial ends
    : hasMinimumData(user)
      ? getFullNavigationLinks(userId as string, user, isInGracePeriod)
      : getBaseLinks();

  const displayTotalUnread = totalUnread > 0 ? totalUnread : null;

  const additionalItems: NavigationLink[] = [
    {
      href: "/community",
      label: "Community",
      icon: <Users size={22} />,
      condition: isSignedIn,
      requiresCompleteProfile: true,
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
      requiresCompleteProfile: true,
    },
  ];

  // Only add additional items if not in trial-ended state
  const completeLinks: NavigationLink[] = shouldShowLimitedLinks
    ? navigationLinks // Just base links
    : [...navigationLinks, ...additionalItems];

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

  // Handle link click with trial restrictions
  const handleLinkClick = (link: NavigationLink, e: React.MouseEvent) => {
    // Block access if trial ended and link is not available after trial
    if (shouldShowLimitedLinks && !link.availableAfterTrial) {
      e.preventDefault();
      return;
    }

    // Block access if profile incomplete
    if (link.requiresCompleteProfile && !isProfileComplete && isSignedIn) {
      e.preventDefault();
      setIsSheetOpen(false);
      router.push("/profile");
      return;
    }

    if (!link.onClick) {
      setIsSheetOpen(false);
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
          {/* Add accessibility title */}
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

          {activeView === "main" && (
            <div className="h-full flex flex-col">
              <div className={cn("p-6 border-b", colors.border)}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={cn("text-2xl font-bold", colors.text)}>
                    {shouldShowLimitedLinks
                      ? "Basic Menu"
                      : hasMinimumData(user)
                        ? "Menu"
                        : "GigUp"}
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
                      {shouldShowLimitedLinks && (
                        <div className="flex items-center gap-1 mt-1">
                          <Crown className="w-3 h-3 text-orange-500" />
                          <span className="text-xs text-orange-600 font-medium">
                            Trial Ended - Upgrade Required
                          </span>
                        </div>
                      )}
                      {!isProfileComplete && !shouldShowLimitedLinks && (
                        <div className="flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3 text-orange-500" />
                          <span className="text-xs text-orange-600 font-medium">
                            Complete Profile to Access All Features
                          </span>
                        </div>
                      )}
                      {showUpgradePrompt &&
                        isProfileComplete &&
                        !shouldShowLimitedLinks && (
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

                {displayTotalUnread &&
                  isSignedIn &&
                  displayTotalUnread > 0 &&
                  !shouldShowLimitedLinks && (
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
                {/* Trial Ended Banner */}
                {shouldShowLimitedLinks && (
                  <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <div className="flex items-center gap-3 mb-2">
                      <Crown className="w-5 h-5" />
                      <h4 className="font-bold text-sm">Trial Period Ended</h4>
                    </div>
                    <p className="text-xs text-orange-100 mb-3">
                      Your free trial has ended. Upgrade to Pro to regain access
                      to all features including Search, Gigs, Messages, and
                      more.
                    </p>
                    <Link
                      href="/dashboard/billing"
                      onClick={() => setIsSheetOpen(false)}
                      className="block w-full text-center bg-white text-orange-600 py-2 px-4 rounded-xl text-sm font-semibold hover:bg-orange-50 transition-colors"
                    >
                      Upgrade to Pro
                    </Link>
                  </div>
                )}

                {/* Profile Incomplete Banner (only show if not in trial-ended state) */}
                {!isProfileComplete &&
                  isSignedIn &&
                  !shouldShowLimitedLinks && (
                    <div className="mb-4 p-4 rounded-2xl bg-orange-50 border border-orange-200">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                        <h4 className="font-bold text-sm text-orange-800">
                          Profile Incomplete
                        </h4>
                      </div>
                      <p className="text-xs text-orange-700 mb-3">
                        Complete your profile to access all features including
                        Search, Gigs, Messages, and more.
                      </p>
                      <Link
                        href="/profile"
                        onClick={() => setIsSheetOpen(false)}
                        className="block w-full text-center bg-orange-600 text-white py-2 px-4 rounded-xl text-sm font-semibold hover:bg-orange-700 transition-colors"
                      >
                        Complete Profile
                      </Link>
                    </div>
                  )}

                {finalLinks
                  .filter((link) => pathname !== link.href)
                  .filter((link) => {
                    // During grace period, show ALL links including pro-only features
                    if (isInGracePeriod) return true;

                    // For non-grace period users, hide pro-only features if not pro
                    if (link.proOnly && !isPro()) return false;

                    return link.condition !== false;
                  })
                  .map((link, index) => {
                    const isActive = pathname === link.href;
                    const isProOnly = isInGracePeriod
                      ? false
                      : link.proOnly && !isPro();
                    const hasProBadge = link.proBadge;
                    const requiresCompleteProfile =
                      link.requiresCompleteProfile;
                    const isBlockedByProfile =
                      requiresCompleteProfile &&
                      !isProfileComplete &&
                      isSignedIn;
                    const isBlockedByTrial =
                      shouldShowLimitedLinks && !link.availableAfterTrial;

                    const linkElement = (
                      <div
                        className={cn(
                          "flex items-center justify-between w-full px-4 py-4 rounded-2xl transition-all duration-200 group relative",
                          isActive
                            ? "bg-orange-50 border border-orange-200"
                            : colors.hoverBg,
                          "hover:border-orange-200",
                          "border border-transparent",
                          // Apply opacity for blocked links
                          (isProOnly ||
                            isBlockedByProfile ||
                            isBlockedByTrial) &&
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
                              // Apply gray text for blocked links
                              (isProOnly ||
                                isBlockedByProfile ||
                                isBlockedByTrial) &&
                                "text-gray-400"
                            )}
                          >
                            {link.icon}
                          </span>
                          <span
                            className={cn(
                              "text-base font-medium transition-colors duration-200",
                              isActive ? "text-orange-600" : colors.text,
                              // Apply gray text for blocked links
                              (isProOnly ||
                                isBlockedByProfile ||
                                isBlockedByTrial) &&
                                "text-gray-500"
                            )}
                          >
                            {link.label}
                          </span>

                          {/* Show Lock for pro-only features */}
                          {isProOnly && !isInGracePeriod && (
                            <Lock className="w-3 h-3 text-orange-500" />
                          )}

                          {/* Show Profile Alert for incomplete profile */}
                          {isBlockedByProfile && !isBlockedByTrial && (
                            <AlertCircle className="w-3 h-3 text-orange-500" />
                          )}

                          {/* Show Crown for trial-ended blocked features */}
                          {isBlockedByTrial && (
                            <Crown className="w-3 h-3 text-orange-500" />
                          )}

                          {/* Show Pro badge for features with proBadge */}
                          {hasProBadge &&
                            (isPro() || isInGracePeriod) &&
                            !isBlockedByTrial && (
                              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-0.5 border-0">
                                PRO
                              </Badge>
                            )}

                          {/* Show Lock for proBadge features when user doesn't have access */}
                          {hasProBadge &&
                            !isPro() &&
                            !isInGracePeriod &&
                            !isBlockedByProfile &&
                            !isBlockedByTrial && (
                              <Lock className="w-3 h-3 text-orange-500" />
                            )}
                        </div>

                        {link.badge && link.badge > 0 && !isBlockedByTrial && (
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
                          onClick={(e) => {
                            if (isBlockedByTrial) {
                              e.preventDefault();
                              return;
                            }
                            if (isBlockedByProfile) {
                              e.preventDefault();
                              setIsSheetOpen(false);
                              router.push("/profile");
                            } else {
                              link.onClick?.(e);
                            }
                          }}
                          disabled={
                            isProOnly || isBlockedByProfile || isBlockedByTrial
                          }
                          className={cn(
                            "w-full text-left",
                            (isProOnly ||
                              isBlockedByProfile ||
                              isBlockedByTrial) &&
                              "cursor-not-allowed"
                          )}
                        >
                          {linkElement}
                        </button>
                      );
                    }

                    const shouldBlockAccess =
                      isProOnly || isBlockedByProfile || isBlockedByTrial;

                    return (
                      <Link
                        key={index}
                        href={
                          shouldBlockAccess
                            ? isBlockedByTrial
                              ? "/dashboard/billing"
                              : isBlockedByProfile
                                ? "/profile"
                                : "/dashboard/billing"
                            : link.href
                        }
                        onClick={(e) => handleLinkClick(link, e)}
                        className={cn(
                          shouldBlockAccess && "cursor-not-allowed"
                        )}
                      >
                        {linkElement}
                      </Link>
                    );
                  })}

                {showUpgradePrompt &&
                  isProfileComplete &&
                  !shouldShowLimitedLinks && (
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
                        href="/dashboard/billing"
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
