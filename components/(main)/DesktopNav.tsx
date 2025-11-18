"use client";
import { useState } from "react";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  Sun,
  Moon,
  Search,
  Plus,
  Home,
  Users,
  Calendar,
  MessageCircle,
  Settings,
  BriefcaseIcon,
  Gamepad,
  Zap,
  Menu,
  ChevronDown,
  User,
  Mail,
  Crown,
  Lock,
} from "lucide-react";
import { useThemeColors, useThemeToggle } from "@/hooks/useTheme";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useCheckTrial } from "@/hooks/useCheckTrial";
import { useUnreadCount } from "@/hooks/useUnreadCount";
import { useChat } from "@/app/context/ChatContext";
import { ChatListModal } from "@/components/chat/ChatListModal";
import { MdDashboard } from "react-icons/md";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useSubscriptionStore } from "@/app/stores/useSubscriptionStore";

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ReactElement;
  condition?: boolean;
  proOnly?: boolean;
  proBadge?: boolean;
  requiresCompleteProfile?: boolean;
  availableAfterTrial?: boolean;
}

const getBaseLinks = (): NavigationItem[] => [
  {
    href: "/",
    label: "Home",
    icon: <Home size={18} />,
    availableAfterTrial: true,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: <User size={16} />,
    availableAfterTrial: true,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: <Settings size={16} />,
    availableAfterTrial: true,
  },
  {
    href: "/contact",
    label: "Contact",
    icon: <Mail size={16} />,
    availableAfterTrial: true,
  },
];

const getFullNavigationLinks = (
  user: any,
  isInGracePeriod?: boolean,
  isProUser?: boolean
): NavigationItem[] => {
  const hasRole = user?.isClient || user?.isMusician || user?.isBooker;
  const isMusician = user?.isMusician;
  const isBooker = user?.isBooker;
  const isClient = user?.isClient;

  // Condition for showing Urgent Gigs
  const shouldShowUrgentGigs =
    !isMusician && isClient && (user?.tier === "pro" || isInGracePeriod);

  const baseNavigationItems: NavigationItem[] = [
    {
      href: "/",
      label: "Home",
      icon: <Home size={18} />,
      availableAfterTrial: true,
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <MdDashboard size={18} />,
      condition: hasRole,
    },
    {
      href: "/auth/search",
      label: "Discover",
      icon: <Search size={18} />,
      condition: hasRole,
      requiresCompleteProfile: true,
    },
    {
      href: "/community",
      label: "Community",
      icon: <Users size={18} />,
      condition: true,
      requiresCompleteProfile: true,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: <Settings size={16} />,
      availableAfterTrial: true,
    },
  ];

  const dropdownItems: NavigationItem[] = [
    {
      href: "/profile",
      label: "Profile",
      icon: <User size={16} />,
      availableAfterTrial: true,
    },
    {
      href: "/game",
      label: "Games",
      icon: <Gamepad size={16} />,
      proBadge: true,
      requiresCompleteProfile: true,
    },
    ...(shouldShowUrgentGigs
      ? [
          {
            href: "/hub/gigs?tab=create-gigs",
            label: "Instant Gigs",
            icon: <Zap size={16} />,
            proBadge: true,
            requiresCompleteProfile: true,
          },
        ]
      : []),
  ];

  // Add Reviews and Gigs if user has ID
  if (user?._id) {
    baseNavigationItems.splice(
      2,
      0,
      {
        href: `/allreviews/${user._id}/*${user.firstname}${user.lastname}`,
        label: "Reviews",
        icon: <Search size={18} />,
        requiresCompleteProfile: true,
      },
      {
        href: `/reviews/${user._id}/*${user.firstname}${user.lastname}`,
        label: "Personal Reviews",
        icon: <Search size={18} />,
        requiresCompleteProfile: true,
      }
    );

    // Add My Videos for musicians
    if (isMusician && !isClient) {
      baseNavigationItems.splice(5, 0, {
        href: `/search/allvideos/${user._id}/*${user.firstname}/${user.lastname}`,
        label: "My Videos",
        icon: <Search size={18} />,
        requiresCompleteProfile: true,
      });
    }

    // Add Gigs
    baseNavigationItems.splice(6, 0, {
      href: isClient ? `/hub/gigs?tab=my-gigs` : `/hub/gigs?tab=all`,
      label: "Gigs",
      icon: <BriefcaseIcon size={18} />,
      requiresCompleteProfile: true,
    });
  }

  return [...baseNavigationItems, ...dropdownItems];
};

export function DesktopNavigation() {
  const { isSignedIn, user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { user: currentUser, isLoading: currentUserLoading } = useCurrentUser();
  const { colors, isDarkMode, mounted } = useThemeColors();
  const { toggleDarkMode } = useThemeToggle();

  const { isInGracePeriod, isFirstMonthEnd } = useCheckTrial();
  const hasRole =
    currentUser?.isClient || currentUser?.isMusician || currentUser?.isBooker;

  const { total: unreadCount, byChat: unreadCounts } = useUnreadCount();
  const [showChatListModal, setShowChatListModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Enhanced trial experience
  const showTrialEnded = isFirstMonthEnd;
  const showGracePeriod = isInGracePeriod;
  const showUpgradePrompt =
    showTrialEnded || showGracePeriod || currentUser?.tier === "free";

  // Determine which links to show based on trial status
  const shouldShowLimitedLinks =
    showTrialEnded && currentUser?.tier !== "pro" && !isInGracePeriod;
  const canAccessProFeature = currentUser?.tier === "pro" || isInGracePeriod;

  // Get navigation links based on trial status
  const navigationLinks: NavigationItem[] = shouldShowLimitedLinks
    ? getBaseLinks() // Show only base links after trial ends
    : getFullNavigationLinks(
        currentUser,
        isInGracePeriod,
        currentUser?.tier === "pro"
      );

  const handleOpenMessages = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowChatListModal(true);
  };

  if (!clerkLoaded || (isSignedIn && currentUserLoading) || !mounted) {
    return (
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b",
          "bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-700",
          "hidden lg:block"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="w-16 h-6 rounded" />
              </div>
              <div className="hidden lg:flex items-center space-x-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="w-16 h-4 rounded" />
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="w-20 h-9 rounded-md" />
              <Skeleton className="w-8 h-8 rounded-md" />
              <Skeleton className="w-8 h-8 rounded-full" />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const getActionButton = () => {
    if (currentUser?.isBooker) {
      return {
        href: "/dashboard/gigs",
        label: "Find Gigs",
        icon: <BriefcaseIcon size={18} />,
      };
    }
    return null;
  };

  const actionButton = getActionButton();

  const getGreetingName = () => {
    if (currentUser?.isBooker) return "Booker";
    return clerkUser?.firstName || clerkUser?.username || "User";
  };

  // Filter and process navigation links
  const baseNavigationItems = navigationLinks.filter(
    (item) => !item.proBadge && !item.proOnly && item.condition !== false
  );

  const dropdownItems = navigationLinks.filter(
    (item) => item.proBadge || item.proOnly || item.href === "/profile"
  );

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b",
          colors.navBackground,
          colors.navBorder,
          "hidden lg:block"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Section - Logo & Navigation */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <Link
                href="/"
                className="flex items-center space-x-2 flex-shrink-0"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">G</span>
                  </div>
                  <span
                    className={cn(
                      "text-xl font-bold whitespace-nowrap",
                      colors.text
                    )}
                  >
                    {shouldShowLimitedLinks ? "GigUp Basic" : "GigUp"}
                  </span>
                </motion.div>
              </Link>

              {/* Primary Navigation Items */}
              <div className="hidden lg:flex items-center space-x-6">
                {baseNavigationItems.map((item) => {
                  if (item.condition === false) return null;

                  const isBlockedByTrial =
                    shouldShowLimitedLinks && !item.availableAfterTrial;

                  return (
                    <Link
                      key={item.href}
                      href={isBlockedByTrial ? "/dashboard/billing" : item.href}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative whitespace-nowrap",
                          colors.textMuted,
                          "hover:text-amber-600 dark:hover:text-amber-400",
                          isBlockedByTrial && "opacity-60 cursor-not-allowed"
                        )}
                      >
                        <div
                          className={cn(
                            "transition-colors duration-200",
                            isBlockedByTrial && "text-gray-400"
                          )}
                        >
                          {item.icon}
                        </div>
                        <span
                          className={cn(
                            "transition-colors duration-200",
                            isBlockedByTrial && "text-gray-500"
                          )}
                        >
                          {item.label}
                        </span>

                        {/* Crown icon for trial-blocked features */}
                        {isBlockedByTrial && (
                          <Crown className="w-3 h-3 text-amber-500 ml-1" />
                        )}

                        <div
                          className={cn(
                            "absolute inset-0 rounded-lg bg-gray-50 dark:bg-gray-800/50",
                            "opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"
                          )}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right Section - Actions & User */}
            <div className="flex items-center space-x-3">
              {/* Trial Ended Banner */}
              {shouldShowLimitedLinks && (
                <Link href="/dashboard/billing" className="flex-shrink-0">
                  <Button
                    className={cn(
                      "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
                      "text-white flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200",
                      "text-sm h-9 px-3 whitespace-nowrap"
                    )}
                  >
                    <Crown className="w-4 h-4" />
                    <span>Upgrade to Pro</span>
                  </Button>
                </Link>
              )}

              {/* Action Button (only show if not in trial-ended state) */}
              {isSignedIn && actionButton && !shouldShowLimitedLinks && (
                <Link href={actionButton.href} className="flex-shrink-0">
                  <Button
                    className={cn(
                      "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
                      "text-white flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200",
                      "text-sm h-9 px-3 whitespace-nowrap"
                    )}
                  >
                    {actionButton.icon}
                    <span className="hidden sm:inline">
                      {actionButton.label}
                    </span>
                  </Button>
                </Link>
              )}

              {/* Messages (only show if not in trial-ended state) */}
              {isSignedIn && !shouldShowLimitedLinks && (
                <button
                  onClick={handleOpenMessages}
                  className="relative group flex-shrink-0"
                >
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative",
                      colors.textMuted,
                      "hover:text-amber-600 dark:hover:text-amber-400"
                    )}
                  >
                    <MessageCircle size={18} />
                    <span className="hidden sm:inline">Messages</span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center animate-pulse">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              )}

              {/* Notifications (only show if not in trial-ended state) */}
              {isSignedIn && canAccessProFeature && !shouldShowLimitedLinks ? (
                <div className="hover:scale-105 transition-transform duration-200 flex-shrink-0">
                  <NotificationBell variant="desktop" />
                </div>
              ) : null}

              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className={cn(
                  "p-2 rounded-md transition-all duration-200 flex-shrink-0",
                  colors.text,
                  "hover:text-amber-600 dark:hover:text-amber-400"
                )}
                aria-label={
                  isDarkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 transition-colors duration-200" />
                ) : (
                  <Moon className="w-5 h-5 transition-colors duration-200" />
                )}
              </button>

              {/* User Section with Dropdown */}
              {isSignedIn ? (
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <span
                    className={cn(
                      "text-sm whitespace-nowrap hidden md:inline",
                      colors.textMuted
                    )}
                  >
                    Hi, {getGreetingName()}
                    {shouldShowLimitedLinks && (
                      <span className="text-amber-600 ml-1">• Trial Ended</span>
                    )}
                  </span>

                  {/* Dropdown Menu */}
                  <DropdownMenu
                    open={isDropdownOpen}
                    onOpenChange={setIsDropdownOpen}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                          colors.text,
                          "hover:text-amber-600 dark:hover:text-amber-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        )}
                      >
                        <Menu size={18} />
                        <ChevronDown
                          size={16}
                          className={cn(
                            "transition-transform duration-200",
                            isDropdownOpen && "rotate-180"
                          )}
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className={cn(
                        "w-56 mt-2 border-0 shadow-xl backdrop-blur-md",
                        colors.backgroundMuted
                      )}
                    >
                      {dropdownItems
                        .filter((item) => item.condition !== false)
                        .map((item, index) => {
                          const hasProBadge = item.proBadge;
                          const shouldShowProBadge =
                            hasProBadge && canAccessProFeature;
                          const shouldBlockAccess =
                            hasProBadge && !canAccessProFeature;
                          const isBlockedByTrial =
                            shouldShowLimitedLinks && !item.availableAfterTrial;

                          return (
                            <DropdownMenuItem key={item.href} asChild>
                              <Link
                                href={
                                  isBlockedByTrial
                                    ? "/dashboard/billing"
                                    : shouldBlockAccess
                                      ? "/dashboard/billing"
                                      : item.href
                                }
                                onClick={() => setIsDropdownOpen(false)}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer transition-colors duration-200",
                                  colors.hoverBg,
                                  colors.textMuted,
                                  (shouldBlockAccess || isBlockedByTrial) &&
                                    "opacity-60 cursor-not-allowed"
                                )}
                              >
                                <div
                                  className={cn(
                                    "transition-colors duration-200",
                                    shouldBlockAccess || isBlockedByTrial
                                      ? "text-gray-400"
                                      : "text-amber-600"
                                  )}
                                >
                                  {item.icon}
                                </div>
                                <span
                                  className={cn(
                                    "flex-1",
                                    (shouldBlockAccess || isBlockedByTrial) &&
                                      "text-gray-500"
                                  )}
                                >
                                  {item.label}
                                </span>

                                {/* Pro Badge */}
                                {shouldShowProBadge && !isBlockedByTrial && (
                                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-1.5 py-0.5 border-0 font-semibold">
                                    PRO
                                  </Badge>
                                )}

                                {/* Crown for trial-blocked features */}
                                {isBlockedByTrial && (
                                  <Crown className="w-3 h-3 text-amber-500" />
                                )}

                                {/* Lock for pro features without access */}
                                {hasProBadge &&
                                  !canAccessProFeature &&
                                  !isBlockedByTrial && (
                                    <Lock className="w-3 h-3 text-amber-500" />
                                  )}
                              </Link>
                            </DropdownMenuItem>
                          );
                        })}

                      <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

                      <DropdownMenuItem asChild>
                        <div className="flex items-center justify-between px-3 py-2.5">
                          <div className="flex items-center gap-3">
                            <UserButton />
                            <div>
                              <p
                                className={
                                  "text-sm font-medium " + colors.textMuted
                                }
                              >
                                {currentUser?.firstname} {currentUser?.lastname}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                @{currentUser?.username}
                              </p>
                            </div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Link
                    href="/sign-in"
                    className={cn(
                      "px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                      colors.text,
                      "hover:text-amber-600 dark:hover:text-amber-400"
                    )}
                  >
                    <span className="whitespace-nowrap">Sign In</span>
                  </Link>
                  <Link
                    href="/sign-up"
                    className={cn(
                      "px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
                      "text-white text-sm font-medium rounded-md transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap",
                      "h-9 flex items-center justify-center"
                    )}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <ChatListModal
        isOpen={showChatListModal}
        onClose={() => setShowChatListModal(false)}
      />
    </>
  );
}
