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
  Sparkles,
  Gem,
  Rocket,
  Award,
  Diamond,
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

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ReactElement;
  availableForTiers?: string[];
  requiresCompleteProfile?: boolean;
  featured?: boolean;
}

// Tier configuration (same as MobileSheet)
const tierConfig = {
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

const getTierInfo = (tier?: string) => {
  const userTier = tier || "free";
  return tierConfig[userTier as keyof typeof tierConfig];
};

// Core links available to all tiers
const getCoreLinks = (): NavigationItem[] => [
  {
    href: "/",
    label: "Home",
    icon: <Home size={18} />,
    availableForTiers: ["free", "pro", "premium", "elite"],
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <MdDashboard size={18} />,
    availableForTiers: ["free", "pro", "premium", "elite"],
  },
  {
    href: "/auth/search",
    label: "Discover",
    icon: <Search size={18} />,
    availableForTiers: ["free", "pro", "premium", "elite"],
    requiresCompleteProfile: true,
  },
];

// Pro tier features
const getProTierLinks = (user: any): NavigationItem[] => {
  const proLinks: NavigationItem[] = [
    {
      href: "/community",
      label: "Community",
      icon: <Users size={18} />,
      availableForTiers: ["pro", "premium", "elite"],
      requiresCompleteProfile: true,
    },
    {
      href: user?.isClient ? `/hub/gigs?tab=my-gigs` : `/hub/gigs?tab=all`,
      label: "Gigs",
      icon: <BriefcaseIcon size={18} />,
      availableForTiers: ["pro", "premium", "elite"],
      requiresCompleteProfile: true,
    },
  ];

  // Add role-specific features
  if (user?._id) {
    proLinks.push(
      {
        href: `/allreviews/${user._id}/*${user.firstname}${user.lastname}`,
        label: "Reviews",
        icon: <Search size={18} />,
        availableForTiers: ["pro", "premium", "elite"],
        requiresCompleteProfile: true,
      },
      {
        href: `/reviews/${user._id}/*${user.firstname}${user.lastname}`,
        label: "Personal Reviews",
        icon: <Search size={18} />,
        availableForTiers: ["pro", "premium", "elite"],
        requiresCompleteProfile: true,
      }
    );

    if (user?.isMusician && !user?.isClient) {
      proLinks.push({
        href: `/search/allvideos/${user._id}/*${user.firstname}/${user.lastname}`,
        label: "My Videos",
        icon: <Search size={18} />,
        availableForTiers: ["pro", "premium", "elite"],
        requiresCompleteProfile: true,
      });
    }

    // Urgent Gigs for pro clients
    if (!user?.isMusician && user?.isClient) {
      proLinks.push({
        href: "/hub/gigs?tab=create-gigs",
        label: "Instant Gigs",
        icon: <Zap size={16} />,
        availableForTiers: ["pro", "premium", "elite"],
        requiresCompleteProfile: true,
        featured: true,
      });
    }
  }

  return proLinks;
};

// Premium tier features
const getPremiumTierLinks = (): NavigationItem[] => [
  {
    href: "/analytics",
    label: "Analytics",
    icon: <Sparkles size={16} />,
    availableForTiers: ["premium", "elite"],
    featured: true,
  },
  {
    href: "/game",
    label: "Games",
    icon: <Gamepad size={16} />,
    availableForTiers: ["premium", "elite"],
    featured: true,
  },
];

// Elite tier features
const getEliteTierLinks = (): NavigationItem[] => [
  {
    href: "/concierge",
    label: "VIP Concierge",
    icon: <Diamond size={16} />,
    availableForTiers: ["elite"],
    featured: true,
  },
  {
    href: "/account-manager",
    label: "Dedicated Manager",
    icon: <Rocket size={16} />,
    availableForTiers: ["elite"],
    featured: true,
  },
];

const getNavigationLinks = (
  userTier: string,
  user: any,
  isInGracePeriod?: boolean
): NavigationItem[] => {
  const coreLinks = getCoreLinks();
  const proLinks = getProTierLinks(user);
  const premiumLinks = getPremiumTierLinks();
  const eliteLinks = getEliteTierLinks();

  // Combine links based on user tier
  let allLinks = [...coreLinks];

  if (
    userTier === "pro" ||
    userTier === "premium" ||
    userTier === "elite" ||
    isInGracePeriod
  ) {
    allLinks = [...allLinks, ...proLinks];
  }

  if (userTier === "premium" || userTier === "elite") {
    allLinks = [...allLinks, ...premiumLinks];
  }

  if (userTier === "elite") {
    allLinks = [...allLinks, ...eliteLinks];
  }

  return allLinks;
};

export function DesktopNavigation() {
  const { isSignedIn, user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { user: currentUser, isLoading: currentUserLoading } = useCurrentUser();
  const { colors, isDarkMode, mounted } = useThemeColors();
  const { toggleDarkMode } = useThemeToggle();

  const { isInGracePeriod } = useCheckTrial();
  const { total: unreadCount } = useUnreadCount();
  const [showChatListModal, setShowChatListModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const userTier = currentUser?.tier || "free";
  const currentTier = getTierInfo(userTier);
  const canAccessProFeature =
    userTier === "pro" ||
    userTier === "premium" ||
    userTier === "elite" ||
    isInGracePeriod;

  // Get navigation links based on user tier
  const navigationLinks = getNavigationLinks(
    userTier,
    currentUser,
    isInGracePeriod
  );

  const handleOpenMessages = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowChatListModal(true);
  };

  // Check if user can access a link based on their tier
  const canAccessLink = (link: NavigationItem) => {
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

  if (!clerkLoaded || (isSignedIn && currentUserLoading) || !mounted) {
    return <NavigationSkeleton />;
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
                    GigUp
                  </span>
                </motion.div>
              </Link>

              {/* Primary Navigation Items */}
              <div className="hidden lg:flex items-center space-x-6">
                {navigationLinks.map((item) => {
                  const canAccess = canAccessLink(item);
                  const isFeatured = item.featured;

                  return (
                    <Link
                      key={item.href}
                      href={canAccess ? item.href : "/dashboard/billing"}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative whitespace-nowrap",
                          colors.textMuted,
                          "hover:text-amber-600 dark:hover:text-amber-400",
                          !canAccess && "opacity-60 cursor-not-allowed",
                          isFeatured &&
                            "ring-1 ring-purple-200 dark:ring-purple-800"
                        )}
                      >
                        <div
                          className={cn(
                            "transition-colors duration-200",
                            !canAccess && "text-gray-400",
                            isFeatured && "text-purple-600"
                          )}
                        >
                          {item.icon}
                        </div>
                        <span
                          className={cn(
                            "transition-colors duration-200",
                            !canAccess && "text-gray-500"
                          )}
                        >
                          {item.label}
                        </span>

                        {/* Lock for inaccessible features */}
                        {!canAccess && (
                          <Lock className="w-3 h-3 text-amber-500 ml-1" />
                        )}

                        {/* Featured badge */}
                        {isFeatured && canAccess && (
                          <Sparkles className="w-3 h-3 text-purple-500 ml-1" />
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
              {/* Upgrade Prompt for non-elite users */}
              {nextTier && (
                <Link href="/dashboard/billing" className="flex-shrink-0">
                  <Button
                    className={cn(
                      "bg-gradient-to-r text-white flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 text-sm h-9 px-3 whitespace-nowrap",
                      nextTier.color === "orange" &&
                        "from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
                      nextTier.color === "purple" &&
                        "from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700",
                      nextTier.color === "yellow" &&
                        "from-yellow-500 to-red-600 hover:from-yellow-600 hover:to-red-700"
                    )}
                  >
                    <nextTier.icon className="w-4 h-4" />
                    <span>Upgrade to {nextTier.label}</span>
                  </Button>
                </Link>
              )}

              {/* Messages */}
              {isSignedIn && canAccessProFeature && (
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

              {/* Action Button */}
              {isSignedIn && actionButton && canAccessProFeature && (
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

              {/* Notifications */}
              {isSignedIn && canAccessProFeature && (
                <div className="hover:scale-105 transition-transform duration-200 flex-shrink-0">
                  <NotificationBell variant="desktop" />
                </div>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className={cn(
                  "p-2 rounded-md transition-all duration-200 flex-shrink-0",
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
                  </span>

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
                      <DropdownMenuItem asChild>
                        <Link
                          href="/profile"
                          onClick={() => setIsDropdownOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer transition-colors duration-200",
                            colors.hoverBg,
                            colors.textMuted
                          )}
                        >
                          <User className="w-4 h-4 text-amber-600" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/settings"
                          onClick={() => setIsDropdownOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer transition-colors duration-200",
                            colors.hoverBg,
                            colors.textMuted
                          )}
                        >
                          <Settings className="w-4 h-4 text-amber-600" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
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
                                @{currentUser?.username} • {currentTier.label}
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

// Skeleton component
function NavigationSkeleton() {
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
