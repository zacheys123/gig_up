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
  AlertCircle,
  VideoIcon,
  Star,
  BookA,
  CreditCard,
  ArrowDown,
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
import Logo from "../Logo";

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ReactElement;
  availableForTiers?: string[];
  requiresCompleteProfile?: boolean;
  featured?: boolean;
}

// Tier configuration
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

// Profile completion check
export const hasMinimumData = (user: any): boolean => {
  if (!user) return false;
  if (user.firstTimeInProfile !== false) return false;

  const isMusician = user.isMusician;
  const isTeacher = user.roleType === "teacher";
  const isClient = user.isClient;
  const isBooker = user.isBooker;

  if (isMusician) {
    if (isTeacher) {
      return (
        !!user.firstname?.trim() &&
        !!user.lastname?.trim() &&
        !!user.city?.trim() &&
        !!user.phone?.trim() &&
        !!(user.date?.trim() && user.month?.trim() && user.year?.trim()) &&
        !!user.roleType
      );
    } else {
      return (
        !!user.firstname?.trim() &&
        !!user.lastname?.trim() &&
        !!user.city?.trim() &&
        !!user.phone?.trim() &&
        !!(user.date?.trim() && user.month?.trim() && user.year?.trim()) &&
        !!user.roleType
      );
    }
  } else if (isClient || isBooker) {
    return (
      !!user.firstname?.trim() &&
      !!user.lastname?.trim() &&
      !!user.city?.trim() &&
      !!user.phone?.trim()
    );
  }

  return false;
};

// Core links available to all tiers
const getCoreLinks = (): NavigationItem[] => [
  {
    href: "/",
    label: "Home",
    icon: <Home size={16} />,
    availableForTiers: ["free", "pro", "premium", "elite"],
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <MdDashboard size={16} />,
    availableForTiers: ["free", "pro", "premium", "elite"],
  },
];

// Pro tier features
const getProTierLinks = (user: any): NavigationItem[] => {
  const proLinks: NavigationItem[] = [
    {
      href: "/community",
      label: "Community",
      icon: <Users size={16} />,
      availableForTiers: ["pro", "premium", "elite"],
      requiresCompleteProfile: true,
    },
    {
      href: user?.isClient ? `/hub/gigs?tab=my-gigs` : `/hub/gigs?tab=all`,
      label: "Gigs",
      icon: <BriefcaseIcon size={16} />,
      availableForTiers: ["pro", "premium", "elite"],
      requiresCompleteProfile: true,
    },
    {
      href: "/auth/search",
      label: "Discover",
      icon: <Search size={16} />,
      availableForTiers: ["free", "pro", "premium", "elite"],
      requiresCompleteProfile: true,
    },
  ];

  // Urgent Gigs for pro clients
  if (!user?.isMusician && user?.isClient) {
    proLinks.push({
      href: "/hub/gigs?tab=create-gigs",
      label: "Instant Gigs",
      icon: <Zap size={14} />,
      availableForTiers: ["pro", "premium", "elite"],
      requiresCompleteProfile: true,
      featured: true,
    });
  }

  return proLinks;
};

// Premium tier features
const getPremiumTierLinks = (): NavigationItem[] => [
  {
    href: "/analytics",
    label: "Analytics",
    icon: <Sparkles size={14} />,
    availableForTiers: ["premium", "elite"],
    featured: true,
  },
  {
    href: "/game",
    label: "Games",
    icon: <Gamepad size={14} />,
    availableForTiers: ["premium", "elite"],
    featured: true,
  },
];

// Elite tier features
const getEliteTierLinks = (): NavigationItem[] => [
  {
    href: "/concierge",
    label: "VIP Concierge",
    icon: <Diamond size={14} />,
    availableForTiers: ["elite"],
    featured: true,
  },
  {
    href: "/account-manager",
    label: "Dedicated Manager",
    icon: <Rocket size={14} />,
    availableForTiers: ["elite"],
    featured: true,
  },
];

// Additional links for dropdown
const getAdditionalLinks = (user: any): NavigationItem[] => {
  const additionalLinks: NavigationItem[] = [
    {
      href: "/contact",
      label: "Contact",
      icon: <Mail size={14} />,
      availableForTiers: ["free", "pro", "premium", "elite"],
    },
  ];

  // Add reviews and videos if user exists and is musician
  if (user?._id) {
    additionalLinks.push({
      href: `/allreviews/${user._id}/*${user.firstname}${user.lastname}`,
      label: "Reviews",
      icon: <BookA size={14} />,
      availableForTiers: ["pro", "premium", "elite"],
      requiresCompleteProfile: true,
    });

    if (user?.isMusician && !user?.isClient) {
      additionalLinks.push({
        href: `/search/allvideos/${user._id}/*${user.firstname}/${user.lastname}`,
        label: "My Videos",
        icon: <VideoIcon size={14} />,
        availableForTiers: ["pro", "premium", "elite"],
        requiresCompleteProfile: true,
      });
    }
  }

  return additionalLinks;
};

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
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);

  const userTier = currentUser?.tier || "free";
  const currentTier = getTierInfo(userTier);
  const canAccessProFeature =
    userTier === "pro" ||
    userTier === "premium" ||
    userTier === "elite" ||
    isInGracePeriod;

  // Check if profile is complete for navigation
  const isProfileComplete = hasMinimumData(currentUser);

  // Get navigation links based on user tier
  const navigationLinks = getNavigationLinks(
    userTier,
    currentUser,
    isInGracePeriod
  );

  // Get additional links for dropdown
  const additionalLinks = getAdditionalLinks(currentUser);

  const handleOpenMessages = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowChatListModal(true);
  };

  // Check if user can access a link based on their tier
  const canAccessLink = (link: NavigationItem) => {
    if (!link.availableForTiers) return true;
    return link.availableForTiers.includes(userTier) || isInGracePeriod;
  };

  // Handle link click with profile restrictions
  const handleLinkClick = (link: NavigationItem, e: React.MouseEvent) => {
    // Block access if profile incomplete
    if (link.requiresCompleteProfile && !isProfileComplete && isSignedIn) {
      e.preventDefault();
      return;
    }
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
        icon: <BriefcaseIcon size={16} />,
      };
    }
    return null;
  };

  const actionButton = getActionButton();
  const getGreetingName = () => {
    if (currentUser?.isBooker) return "Booker";
    return clerkUser?.firstName || clerkUser?.username || "User";
  };

  // Render navigation link
  const renderNavLink = (item: NavigationItem) => {
    const canAccess = canAccessLink(item);
    const requiresCompleteProfile = item.requiresCompleteProfile;
    const isBlockedByProfile = requiresCompleteProfile && !isProfileComplete;
    const isFeatured = item.featured;

    // Updated navigation link with proper theme colors
    const linkContent = (
      <div
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-all duration-200 group relative whitespace-nowrap",
          colors.successBg,
          "p-3",
          `hover:text-amber-600 ${colors.hoverBg}`,
          (!canAccess || isBlockedByProfile) &&
            `${colors.disabledText} cursor-not-allowed`,
          isFeatured && `${colors.warningBorder} ring-1`
        )}
      >
        <div
          className={cn(
            "transition-colors duration-200",
            (!canAccess || isBlockedByProfile) && colors.disabledText,
            isFeatured && colors.warningText
          )}
        >
          {item.icon}
        </div>
        <span
          className={cn(
            "transition-colors duration-200",
            (!canAccess || isBlockedByProfile) && colors.disabledText
          )}
        >
          {item.label}
        </span>

        {/* Lock for inaccessible features */}
        {!canAccess && <Lock className="w-3 h-3 text-amber-500 ml-1" />}

        {/* Profile Alert for incomplete profile */}
        {isBlockedByProfile && (
          <AlertCircle className="w-3 h-3 text-orange-500 ml-1" />
        )}

        {/* Featured badge */}
        {isFeatured && canAccess && !isBlockedByProfile && (
          <Sparkles className="w-3 h-3 text-purple-500 ml-1" />
        )}
      </div>
    );

    return (
      <div key={item.href}>
        {isBlockedByProfile ? (
          // Profile incomplete - show tooltip or redirect to profile
          <Link
            href="/profile"
            title="Complete your profile to access this feature"
          >
            {linkContent}
          </Link>
        ) : !canAccess ? (
          // Tier restriction - redirect to billing
          <Link
            href="/dashboard/billing"
            title="Upgrade to access this feature"
          >
            {linkContent}
          </Link>
        ) : (
          // Accessible link
          <Link href={item.href} onClick={(e) => handleLinkClick(item, e)}>
            {linkContent}
          </Link>
        )}
      </div>
    );
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
          <div className="flex justify-between items-center h-14">
            {/* Left Section - Logo & Navigation */}
            <div className="flex items-center space-x-6">
              {/* Primary Navigation Items */}
              <Logo />
              <div className="hidden lg:flex items-center space-x-1">
                {isSignedIn && navigationLinks.map(renderNavLink)}
              </div>
            </div>

            {/* Right Section - Actions & User */}
            <div className="flex items-center space-x-2">
              {/* Profile Incomplete Warning */}
              {isSignedIn && !isProfileComplete && (
                <Link href="/profile" className="flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-xs h-8 px-2 whitespace-nowrap border-orange-200 text-orange-600 hover:bg-orange-50"
                  >
                    <AlertCircle className="w-3 h-3" />
                    <span className="hidden sm:inline">Complete Profile</span>
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
                      "flex items-center gap-1 p-2 rounded-md text-sm font-medium transition-all duration-200",
                      colors.textMuted,
                      "hover:text-amber-600 dark:hover:text-amber-400 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                      !isProfileComplete && "opacity-60 cursor-not-allowed"
                    )}
                    title={
                      !isProfileComplete
                        ? "Complete your profile to access messages"
                        : ""
                    }
                  >
                    <MessageCircle size={16} />
                    {unreadCount > 0 && isProfileComplete && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1 min-w-[16px] h-4 flex items-center justify-center animate-pulse text-[10px]">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              )}

              {/* Notifications */}
              {isSignedIn && canAccessProFeature && (
                <div
                  className={cn(
                    "hover:scale-105 transition-transform duration-200 flex-shrink-0",
                    !isProfileComplete && "opacity-60 cursor-not-allowed"
                  )}
                  title={
                    !isProfileComplete
                      ? "Complete your profile to access notifications"
                      : ""
                  }
                >
                  <NotificationBell />
                </div>
              )}

              {/* Action Button */}
              {isSignedIn && actionButton && canAccessProFeature && (
                <Link
                  href={isProfileComplete ? actionButton.href : "/profile"}
                  className="flex-shrink-0"
                  title={
                    !isProfileComplete
                      ? "Complete your profile to access this feature"
                      : ""
                  }
                >
                  <Button
                    size="sm"
                    className={cn(
                      "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
                      "text-white flex items-center gap-1 shadow-md hover:shadow-lg transition-all duration-200",
                      "text-xs h-8 px-2 whitespace-nowrap",
                      !isProfileComplete && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    {actionButton.icon}
                    <span className="hidden sm:inline">
                      {actionButton.label}
                    </span>
                  </Button>
                </Link>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className={cn(
                  "p-1.5 rounded-md transition-all duration-200 flex-shrink-0",
                  colors.text,
                  "hover:text-amber-600 dark:hover:text-amber-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                )}
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>

              {/* More Dropdown */}
              {isSignedIn && (
                <DropdownMenu
                  open={isMoreDropdownOpen}
                  onOpenChange={setIsMoreDropdownOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "flex items-center gap-1 p-2 rounded-md text-sm font-medium transition-all duration-200",
                        colors.text,
                        "hover:text-amber-600 dark:hover:text-amber-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      )}
                    >
                      <ArrowDown size={16} /> <Menu size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className={cn(
                      "w-56 mt-1 border-0 shadow-xl backdrop-blur-md",
                      colors.backgroundMuted
                    )}
                  >
                    {/* Additional Links */}
                    {additionalLinks.map((item) => {
                      const canAccess = canAccessLink(item);
                      const requiresCompleteProfile =
                        item.requiresCompleteProfile;
                      const isBlockedByProfile =
                        requiresCompleteProfile && !isProfileComplete;

                      return (
                        <DropdownMenuItem asChild key={item.href}>
                          {isBlockedByProfile ? (
                            <Link
                              href="/profile"
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors duration-200 w-full",
                                colors.hoverBg,
                                colors.textMuted,
                                "opacity-60 cursor-not-allowed"
                              )}
                              title="Complete your profile to access this feature"
                            >
                              {item.icon}
                              <span>{item.label}</span>
                              <AlertCircle className="w-3 h-3 text-orange-500 ml-auto" />
                            </Link>
                          ) : !canAccess ? (
                            <Link
                              href="/dashboard/billing"
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors duration-200 w-full",
                                colors.hoverBg,
                                colors.textMuted,
                                "opacity-60 cursor-not-allowed"
                              )}
                              title="Upgrade to access this feature"
                            >
                              {item.icon}
                              <span>{item.label}</span>
                              <Lock className="w-3 h-3 text-amber-500 ml-auto" />
                            </Link>
                          ) : (
                            <Link
                              href={item.href}
                              onClick={() => setIsMoreDropdownOpen(false)}
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors duration-200 w-full",
                                colors.hoverBg,
                                colors.textMuted
                              )}
                            >
                              {item.icon}
                              <span>{item.label}</span>
                            </Link>
                          )}
                        </DropdownMenuItem>
                      );
                    })}

                    {/* Upgrade Section */}
                    {isSignedIn && nextTier && (
                      <>
                        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                        <DropdownMenuItem asChild>
                          <Link
                            href="/dashboard/billing"
                            onClick={() => setIsMoreDropdownOpen(false)}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors duration-200 w-full",
                              "bg-gradient-to-r text-white font-medium",
                              nextTier.color === "orange" &&
                                "from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
                              nextTier.color === "purple" &&
                                "from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700",
                              nextTier.color === "yellow" &&
                                "from-yellow-500 to-red-600 hover:from-yellow-600 hover:to-red-700"
                            )}
                          >
                            <CreditCard className="w-4 h-4" />
                            <span>Upgrade to {nextTier.label}</span>
                            <Sparkles className="w-3 h-3 ml-auto" />
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    {/* User Info Section */}
                    <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/profile"
                        onClick={() => setIsMoreDropdownOpen(false)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors duration-200 w-full",
                          colors.hoverBg,
                          colors.textMuted
                        )}
                      >
                        <User className="w-4 h-4 text-amber-600" />
                        <span>Profile</span>
                        {!isProfileComplete && (
                          <AlertCircle className="w-3 h-3 text-orange-500 ml-auto" />
                        )}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/settings"
                        onClick={() => setIsMoreDropdownOpen(false)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors duration-200 w-full",
                          colors.hoverBg,
                          colors.textMuted
                        )}
                      >
                        <Settings className="w-4 h-4 text-amber-600" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>

                    {/* Current Tier Info */}
                    <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserButton />
                          <div className="min-w-0 flex-1">
                            <p
                              className={cn(
                                "text-xs font-medium truncate",
                                colors.text
                              )}
                            >
                              {currentUser?.firstname} {currentUser?.lastname}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] px-1.5 py-0 h-4",
                                  currentTier.badge
                                )}
                              >
                                {currentTier.label}
                              </Badge>
                              {!isProfileComplete && (
                                <span className="text-[10px] text-orange-600">
                                  Incomplete
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* User Button for signed in users */}
              {isSignedIn ? (
                <div className="flex items-center flex-shrink-0">
                  <UserButton />
                </div>
              ) : (
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Link
                    href="/sign-in"
                    className={cn(
                      "px-2 py-1 text-xs font-medium rounded-md transition-all duration-200",
                      colors.text,
                      "hover:text-amber-600 dark:hover:text-amber-400"
                    )}
                  >
                    <span className="whitespace-nowrap">Sign In</span>
                  </Link>
                  <Link
                    href="/sign-up"
                    className={cn(
                      "px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
                      "text-white text-xs font-medium rounded-md transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap",
                      "h-7 flex items-center justify-center"
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
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Skeleton className="w-7 h-7 rounded-lg" />
              <Skeleton className="w-12 h-4 rounded" />
            </div>
            <div className="hidden lg:flex items-center space-x-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-12 h-4 rounded" />
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="w-16 h-7 rounded-md" />
            <Skeleton className="w-6 h-6 rounded-md" />
            <Skeleton className="w-6 h-6 rounded-full" />
          </div>
        </div>
      </div>
    </nav>
  );
}
