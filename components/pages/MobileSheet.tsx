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
  Rocket,
  Award,
  Diamond,
  Book,
} from "lucide-react";
import { MdDashboard } from "react-icons/md";
import { useAuth, useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSubscriptionStore } from "@/app/stores/useSubscriptionStore";
import { useThemeColors, useThemeToggle } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserCurrentChat } from "@/hooks/useCurrentUserChat";
import { useChat } from "@/app/context/ChatContext";
import { useCheckTrial } from "@/hooks/useCheckTrial";
import { useUnreadCount } from "@/hooks/useUnreadCount";
import ConversationList from "../chat/ConversationDetails";
import { getUserTrialStatus } from "@/hooks/useUserTrialStatus";
import { GigUpAssistant } from "../ai/GigupAssistant";

interface NavigationLink {
  label: string;
  href: string;
  icon: React.ReactElement;
  badge?: number | null;
  condition?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  availableForTiers?: string[]; // Which tiers can access this link
  requiresCompleteProfile?: boolean;
  featured?: boolean; // Special highlight for premium features
}

interface ThemeOption {
  id: string;
  label: string;
  icon: React.ReactElement;
  description: string;
}

export const tierConfig = {
  free: {
    label: "Free",
    icon: User,
    gradient: "from-gray-500 to-gray-700",
    bg: "bg-gradient-to-r from-gray-500 to-gray-700",
    text: "text-gray-100",
    badge: "bg-gray-100 text-gray-800 border-gray-300",
    color: "gray",
    level: 0,
  },
  pro: {
    label: "Pro",
    icon: Zap,
    gradient: "from-orange-500 to-red-600",
    bg: "bg-gradient-to-r from-orange-500 to-red-600",
    text: "text-orange-100",
    badge: "bg-orange-100 text-orange-800 border-orange-300",
    color: "orange",
    level: 1,
  },
  premium: {
    label: "Premium",
    icon: Gem,
    gradient: "from-purple-500 to-pink-600",
    bg: "bg-gradient-to-r from-purple-500 to-pink-600",
    text: "text-purple-100",
    badge: "bg-purple-100 text-purple-800 border-purple-300",
    color: "purple",
    level: 2,
  },
  elite: {
    label: "Elite",
    icon: Crown,
    gradient: "from-yellow-500 to-red-600",
    bg: "bg-gradient-to-r from-yellow-500 to-red-600",
    text: "text-yellow-100",
    badge: "bg-yellow-100 text-yellow-800 border-yellow-300",
    color: "yellow",
    level: 3,
  },
};

export const getTierInfo = (tier?: string) => {
  const userTier = tier || "free";
  return tierConfig[userTier as keyof typeof tierConfig];
};

export const hasMinimumData = (user: any): boolean => {
  if (!user) return false;

  const isMusician = user.isMusician;
  const isTeacher = user.roleType === "teacher";
  const isClient = user.isClient;
  const isBooker = user.isBooker;

  // For musicians and bookers, date of birth is required
  if (isMusician || isBooker) {
    return (
      !!user.firstname?.trim() &&
      !!user.lastname?.trim() &&
      !!user.city?.trim() &&
      !!user.phone?.trim() &&
      !!(user.date?.trim() && user.month?.trim() && user.year?.trim()) &&
      !!user.roleType
    );
  }
  // For clients, date of birth is NOT required
  else if (isClient) {
    return (
      !!user.firstname?.trim() &&
      !!user.lastname?.trim() &&
      !!user.city?.trim() &&
      !!user.phone?.trim()
    );
  }

  return false;
};

export const canAccessFeature = (
  user: any,
  requiresCompleteProfile: boolean = false,
): boolean => {
  if (!user) return false;

  // If feature doesn't require complete profile, always allow access
  if (!requiresCompleteProfile) return true;

  // Check if user is in grace period
  const trialStatus = getUserTrialStatus(user);
  if (trialStatus.isInGracePeriod) {
    return true; // Allow access during grace period
  }

  // Otherwise, check if profile meets minimum requirements
  return hasMinimumData(user);
};

// Core links available to all tiers
const getCoreLinks = (): NavigationLink[] => [
  {
    label: "Home",
    href: "/",
    icon: <Home size={22} />,
    availableForTiers: ["free", "pro", "premium", "elite"],
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <MdDashboard size={22} />,
    availableForTiers: ["free", "pro", "premium", "elite"],
  },
  {
    label: "Contact",
    href: "/contact",
    icon: <Mail size={22} />,
    availableForTiers: ["free", "pro", "premium", "elite"],
  },
];

// Pro tier features
const getProTierLinks = (
  user: any,
  isInGracePeriod?: boolean,
): NavigationLink[] => {
  const proLinks: NavigationLink[] = [
    {
      label: "Gigs",
      href: user?.isClient ? `/hub/gigs?tab=my-gigs` : `/hub/gigs?tab=all`,
      icon: <Music size={22} />,
      availableForTiers: ["pro", "premium", "elite"],
      requiresCompleteProfile: true,
    },
    {
      label: "Games",
      href: "/game",
      icon: <Gamepad size={22} />,
      availableForTiers: ["pro", "premium", "elite"],
      requiresCompleteProfile: true,
      featured: true,
    },
    {
      label: "Discover",
      href: "/auth/search",
      icon: <Search size={22} />,
      availableForTiers: ["free", "pro", "premium", "elite"],
      requiresCompleteProfile: true,
    },
    {
      label: "Community",
      href: "/community",
      icon: <Users size={22} />,
      availableForTiers: ["pro", "premium", "elite"],
      requiresCompleteProfile: true,
    },
  ];

  // Add role-specific pro features
  if (user?._id) {
    proLinks.splice(
      0,
      0,
      {
        label: "Reviews",
        href: `/allreviews/${user._id}/*${user.firstname}${user.lastname}`,
        icon: <BookA size={22} />,
        availableForTiers: ["pro", "premium", "elite"],
        requiresCompleteProfile: true,
      },
      {
        label: "Personal Reviews",
        href: `/reviews/${user._id}/*${user.firstname}${user.lastname}`,
        icon: <BookCopy size={22} />,
        availableForTiers: ["pro", "premium", "elite"],
        requiresCompleteProfile: true,
      },
    );

    if (user?.isMusician && !user?.isClient) {
      proLinks.splice(3, 0, {
        label: "My Videos",
        href: `/search/allvideos/${user._id}/*${user.firstname}/${user.lastname}`,
        icon: <VideoIcon size={22} />,
        availableForTiers: ["pro", "premium", "elite"],
        requiresCompleteProfile: true,
      });
    }

    // Urgent Gigs for pro clients
    if (!user?.isMusician && user?.isClient) {
      proLinks.push({
        label: "Urgent Gigs",
        href: "/hub/gigs?tab=create-gigs",
        icon: <Zap size={22} />,
        availableForTiers: ["pro", "premium", "elite"],
        requiresCompleteProfile: true,
        featured: true,
      });
    }
  }

  return proLinks;
};

// Premium tier features
const getPremiumTierLinks = (): NavigationLink[] => [
  {
    label: "Advanced Analytics",
    href: "/analytics",
    icon: <Sparkles size={22} />,
    availableForTiers: ["premium", "elite"],
    featured: true,
  },
  {
    label: "Priority Support",
    href: "/support",
    icon: <Star size={22} />,
    availableForTiers: ["premium", "elite"],
    featured: true,
  },
  {
    label: "Exclusive Events",
    href: "/events",
    icon: <Award size={22} />,
    availableForTiers: ["premium", "elite"],
    featured: true,
  },
];

// Elite tier features
const getEliteTierLinks = (): NavigationLink[] => [
  {
    label: "VIP Concierge",
    href: "/concierge",
    icon: <Diamond size={22} />,
    availableForTiers: ["elite"],
    featured: true,
  },
  {
    label: "Dedicated Manager",
    href: "/account-manager",
    icon: <Rocket size={22} />,
    availableForTiers: ["elite"],
    featured: true,
  },
  {
    label: "Early Access",
    href: "/early-access",
    icon: <Crown size={22} />,
    availableForTiers: ["elite"],
    featured: true,
  },
];

// Messages link (special handling)
const getMessagesLink = (
  unreadCount: number | null,
  handleOpenMessages: (e: React.MouseEvent) => void,
): NavigationLink => ({
  label: "Messages",
  href: "/messages",
  icon: <MessageCircle size={22} />,
  badge: unreadCount,
  onClick: handleOpenMessages,
  availableForTiers: ["pro", "premium", "elite"],
  requiresCompleteProfile: true,
});

const InAppLinks = (): NavigationLink[] => [
  {
    href: "/dashboard/onboarding/trust-explained",
    label: "Trust & Scores",
    icon: <Book size={16} />,
    availableForTiers: ["free", "pro", "premium", "elite"],
  },
];
const getNavigationLinks = (
  userTier: string,
  user: any,
  isInGracePeriod?: boolean,
  unreadCount?: number | null,
  handleOpenMessages?: (e: React.MouseEvent) => void,
): NavigationLink[] => {
  const coreLinks = getCoreLinks();
  const proLinks = getProTierLinks(user, isInGracePeriod);
  const premiumLinks = getPremiumTierLinks();
  const eliteLinks = getEliteTierLinks();
  const trustLinks = InAppLinks();
  const messagesLink = handleOpenMessages
    ? [getMessagesLink(unreadCount || null, handleOpenMessages)]
    : [];

  // Combine links based on user tier
  let allLinks = [...coreLinks];
  allLinks = [...allLinks, ...trustLinks];
  if (
    userTier === "pro" ||
    userTier === "premium" ||
    userTier === "elite" ||
    isInGracePeriod
  ) {
    allLinks = [...allLinks, ...proLinks, ...messagesLink];
  }

  if (userTier === "premium" || userTier === "elite") {
    allLinks = [...allLinks, ...premiumLinks];
  }

  if (userTier === "elite") {
    allLinks = [...allLinks, ...eliteLinks];
  }
  return allLinks;
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
  const { isInGracePeriod } = useCheckTrial();

  const { isPro } = useSubscriptionStore();
  const { total: totalUnread, byChat: unreadCounts } = useUnreadCount();
  const { markAllAsRead, chats } = useUserCurrentChat();
  const { openChat } = useChat();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [activeView, setActiveView] = useState<"main" | "conversations">(
    "main",
  );

  const userTier = user?.tier || "free";
  const currentTier = getTierInfo(userTier);
  const TierIcon = currentTier.icon;

  // Check if profile is complete for navigation
  const isProfileComplete = hasMinimumData(user);

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

  // Get navigation links based on user tier
  const navigationLinks = getNavigationLinks(
    userTier,
    user,
    isInGracePeriod,
    totalUnread > 0 ? totalUnread : null,
    handleOpenMessages,
  );

  const displayTotalUnread = totalUnread > 0 ? totalUnread : null;

  const handleSheetToggle = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      setTimeout(() => setActiveView("main"), 300);
    }
  };

  // Handle link click with profile restrictions
  const handleLinkClick = (link: NavigationLink, e: React.MouseEvent) => {
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

  // Check if user can access a link based on their tier
  const canAccessLink = (link: NavigationLink) => {
    if (!link.availableForTiers) return true;
    return link.availableForTiers.includes(userTier) || isInGracePeriod;
  };

  // Get next tier info for upgrade prompts
  const getNextTierInfo = () => {
    switch (userTier) {
      case "free":
        return { tier: "pro", label: "Pro", icon: Zap, color: "orange" };
      case "pro":
        return {
          tier: "premium",
          label: "Premium",
          icon: Gem,
          color: "purple",
        };
      case "premium":
        return { tier: "elite", label: "Elite", icon: Crown, color: "yellow" };
      default:
        return null;
    }
  };

  const nextTier = getNextTierInfo();

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
                  "hover:text-orange-600",
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
            "shadow-xl",
          )}
        >
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

          {activeView === "main" && (
            <div className="h-full flex flex-col">
              <div className={cn("p-6 border-b", colors.border)}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={cn("text-xl font-bold", colors.text)}>
                    {hasMinimumData(user) ? "Menu" : "gigUp"}
                  </h2>
                  <Badge
                    className={cn(
                      "px-3 py-1.5 text-sm font-bold border-0 shadow-lg",
                      currentTier.badge,
                      "flex items-center gap-1.5",
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
                          colors.text,
                        )}
                      >
                        {user.firstname} {user.lastname}
                      </h3>
                      <p className={cn("text-sm truncate", colors.textMuted)}>
                        @{user.username}
                      </p>
                      {!isProfileComplete && (
                        <div className="flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3 text-orange-500" />
                          <span className="text-xs text-orange-600 font-medium">
                            Complete Profile to Access All Features
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
                {/* Upgrade Prompt for non-elite users */}
                {nextTier && (
                  <div
                    className={cn(
                      "mb-4 p-4 rounded-2xl bg-gradient-to-r text-white",
                      nextTier.color === "orange" &&
                        "from-orange-500 to-red-500",
                      nextTier.color === "purple" &&
                        "from-purple-500 to-pink-600",
                      nextTier.color === "yellow" &&
                        "from-yellow-500 to-red-600",
                    )}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <nextTier.icon className="w-5 h-5" />
                      <h4 className="font-bold text-sm">
                        Upgrade to {nextTier.label}
                      </h4>
                    </div>
                    <p className="text-xs text-white/90 mb-3">
                      Unlock exclusive {nextTier.label.toLowerCase()} features
                      and enhanced capabilities.
                    </p>
                    <Link
                      href="/dashboard/billing"
                      onClick={() => setIsSheetOpen(false)}
                      className="block w-full text-center bg-white text-gray-800 py-2 px-4 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Upgrade to {nextTier.label}
                    </Link>
                  </div>
                )}

                {/* Profile Incomplete Banner */}
                {!isProfileComplete && isSignedIn && (
                  <div className="mb-4 p-4 rounded-2xl bg-orange-50 border border-orange-200">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      <h4 className="font-bold text-sm text-orange-800">
                        Profile Incomplete
                      </h4>
                    </div>
                    <p className="text-xs text-orange-700 mb-3">
                      Complete your profile to access all features.
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

                {/* Navigation Links */}
                {navigationLinks
                  .filter((link) => pathname !== link.href)
                  .filter((link) => link.condition !== false)
                  .map((link, index) => {
                    const isActive = pathname === link.href;
                    const canAccess = canAccessLink(link);
                    const requiresCompleteProfile =
                      link.requiresCompleteProfile;
                    const isBlockedByProfile =
                      requiresCompleteProfile &&
                      !isProfileComplete &&
                      isSignedIn;
                    const isFeatured = link.featured;

                    const linkElement = (
                      <div
                        className={cn(
                          "flex items-center justify-between w-full px-4 py-4 rounded-2xl transition-all duration-200 group relative",
                          isActive
                            ? "bg-orange-50 border border-orange-200"
                            : colors.hoverBg,
                          "hover:border-orange-200",
                          "border border-transparent",
                          (!canAccess || isBlockedByProfile) && "opacity-60",
                          isFeatured &&
                            "ring-2 ring-purple-200 dark:ring-purple-800",
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <span
                            className={cn(
                              "transition-colors duration-200",
                              isActive
                                ? "text-orange-600"
                                : "group-hover:text-orange-600",
                              (!canAccess || isBlockedByProfile) &&
                                "text-gray-400",
                              isFeatured && "text-purple-600",
                            )}
                          >
                            {link.icon}
                          </span>
                          <span
                            className={cn(
                              "text-base font-medium transition-colors duration-200",
                              isActive ? "text-orange-600" : colors.text,
                              (!canAccess || isBlockedByProfile) &&
                                "text-gray-500",
                              isFeatured &&
                                "text-purple-700 dark:text-purple-300",
                            )}
                          >
                            {link.label}
                          </span>

                          {/* Show Lock for inaccessible features */}
                          {!canAccess && (
                            <Lock className="w-3 h-3 text-orange-500" />
                          )}

                          {/* Show Profile Alert for incomplete profile */}
                          {isBlockedByProfile && (
                            <AlertCircle className="w-3 h-3 text-orange-500" />
                          )}

                          {/* Show Featured badge */}
                          {isFeatured && canAccess && (
                            <Sparkles className="w-3 h-3 text-purple-500" />
                          )}
                        </div>

                        {link.badge &&
                          link.badge > 0 &&
                          canAccess &&
                          !isBlockedByProfile && (
                            <span className="bg-red-500 text-white text-xs font-semibold rounded-full px-2 py-1 min-w-[24px] text-center animate-pulse shadow-sm">
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
                            if (!canAccess || isBlockedByProfile) {
                              e.preventDefault();
                              if (!canAccess) {
                                router.push("/dashboard/billing");
                              } else {
                                router.push("/profile");
                              }
                            } else {
                              link.onClick?.(e);
                            }
                          }}
                          disabled={!canAccess || isBlockedByProfile}
                          className={cn(
                            "w-full text-left",
                            (!canAccess || isBlockedByProfile) &&
                              "cursor-not-allowed",
                          )}
                        >
                          {linkElement}
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={index}
                        href={
                          !canAccess || isBlockedByProfile
                            ? !canAccess
                              ? "/dashboard/billing"
                              : "/profile"
                            : link.href
                        }
                        onClick={(e) => handleLinkClick(link, e)}
                        className={cn(
                          (!canAccess || isBlockedByProfile) &&
                            "cursor-not-allowed",
                        )}
                      >
                        {linkElement}
                      </Link>
                    );
                  })}
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
                        colors.text,
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
                        "transform hover:scale-105",
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
                    colors.border,
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
                      "hover:text-orange-600",
                    )}
                    onClick={toggleDarkMode}
                  >
                    {theme === "dark" ? (
                      <Sun className="w-5 h-5" />
                    ) : theme === "light" ? (
                      <Moon className="w-5 h-5" />
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
    </>
  );
}

export default MobileSheet;
