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

export function DesktopNavigation() {
  const { isSignedIn, user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { user: currentUser, isLoading: currentUserLoading } = useCurrentUser();
  const { colors, isDarkMode, mounted } = useThemeColors();
  const { toggleDarkMode } = useThemeToggle();

  const { isInGracePeriod } = useCheckTrial();
  const hasRole =
    currentUser?.isClient || currentUser?.isMusician || currentUser?.isBooker;
  const isMusician = currentUser?.isMusician;
  const isBooker = currentUser?.isBooker;
  const isClient = currentUser?.isClient;

  const { total: unreadCount, byChat: unreadCounts } = useUnreadCount();
  const [showChatListModal, setShowChatListModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    if (isBooker) {
      return {
        href: "/dashboard/gigs",
        label: "Find Gigs",
        icon: <BriefcaseIcon size={18} />,
      };
    }

    return null;
  };

  const actionButton = getActionButton();

  // Condition for showing Urgent Gigs
  const shouldShowUrgentGigs =
    !isMusician && isClient && (currentUser?.tier === "pro" || isInGracePeriod);

  const canAccessProFeature = currentUser?.tier === "pro" || isInGracePeriod;

  // Base navigation items
  const baseNavigationItems = [
    {
      href: "/",
      label: "Home",
      icon: <Home size={18} />,
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
      condition: isSignedIn && hasRole,
    },
    {
      href: "/community",
      label: "Community",
      icon: <Users size={18} />,
      condition: isSignedIn,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: <Settings size={16} />,
      condition: hasRole,
    },
  ];

  // Dropdown menu items
  const dropdownItems = [
    {
      href: "/profile",
      label: "Profile",
      icon: <User size={16} />,
      condition: isSignedIn,
    },
    {
      href: "/game",
      label: "Games",
      icon: <Gamepad size={16} />,
      proBadge: true,
      condition: true,
    },
    ...(shouldShowUrgentGigs
      ? [
          {
            href: "/hub/gigs?tab=urgent-gigs",
            label: "Instant Gigs",
            icon: <Zap size={16} />,
            proBadge: true,
            condition: true,
          },
        ]
      : []),
  ];

  const getGreetingName = () => {
    if (isBooker) return "Booker";
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
                    GigUp
                  </span>
                </motion.div>
              </Link>

              {/* Primary Navigation Items */}
              <div className="hidden lg:flex items-center space-x-6">
                {baseNavigationItems.map((item) => {
                  if (item.condition === false) return null;

                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative whitespace-nowrap",
                          colors.textMuted,
                          "hover:text-amber-600 dark:hover:text-amber-400"
                        )}
                      >
                        <div className="transition-colors duration-200">
                          {item.icon}
                        </div>
                        <span className="transition-colors duration-200">
                          {item.label}
                        </span>
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
              {/* Action Button */}
              {isSignedIn && actionButton && (
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

              {/* Messages */}
              {isSignedIn && (
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

              {/* Notifications */}
              {(isSignedIn && currentUser?.tier === "pro") ||
              isInGracePeriod ? (
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

                          return (
                            <DropdownMenuItem key={item.href} asChild>
                              <Link
                                href={
                                  shouldBlockAccess ? "/upgrade" : item.href
                                }
                                onClick={() => setIsDropdownOpen(false)}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer transition-colors duration-200",
                                  "hover:bg-amber-50 dark:hover:bg-amber-800",
                                  colors.textMuted,
                                  shouldBlockAccess &&
                                    "opacity-60 cursor-not-allowed"
                                )}
                              >
                                <div
                                  className={cn(
                                    "transition-colors duration-200",
                                    shouldBlockAccess
                                      ? "text-gray-400"
                                      : "text-amber-600"
                                  )}
                                >
                                  {item.icon}
                                </div>
                                <span
                                  className={cn(
                                    "flex-1",
                                    shouldBlockAccess && "text-gray-500"
                                  )}
                                >
                                  {item.label}
                                </span>

                                {/* Pro Badge */}
                                {shouldShowProBadge && (
                                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-1.5 py-0.5 border-0 font-semibold">
                                    PRO
                                  </Badge>
                                )}

                                {/* Lock for pro features without access */}
                                {hasProBadge && !canAccessProFeature && (
                                  <span className="text-amber-500">
                                    <svg
                                      className="w-3 h-3"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </span>
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
