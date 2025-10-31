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

  const handleOpenMessages = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowChatListModal(true);
  };

  if (!clerkLoaded || (isSignedIn && currentUserLoading) || !mounted) {
    return (
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b",
          "bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-700"
        )}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-10">
              <div className="flex items-center space-x-2">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="w-16 h-6 rounded" />
              </div>

              <div className="hidden lg:flex items-center space-x-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="w-16 h-4 rounded" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Skeleton className="w-24 h-9 rounded-md" />
              <Skeleton className="w-20 h-9 rounded-lg" />
              <Skeleton className="w-8 h-8 rounded-md" />
              <div className="flex items-center space-x-3">
                <Skeleton className="w-20 h-4 rounded" />
                <Skeleton className="w-16 h-9 rounded-lg" />
                <Skeleton className="w-8 h-8 rounded-full" />
              </div>
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
        icon: <BriefcaseIcon size={16} />,
      };
    }
    if (isMusician) {
      return {
        href: "/gigs",
        label: "Find Gigs",
        icon: <Plus size={16} />,
      };
    }
    if (isClient) {
      return {
        href: "/create-gig",
        label: "Post Gig",
        icon: <Plus size={16} />,
      };
    }
    return null;
  };

  const actionButton = getActionButton();

  const navigationItems = [
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
      icon: <Settings size={18} />,
      condition: hasRole,
    },
  ];

  const getGreetingName = () => {
    if (isBooker) return "Booker";
    return clerkUser?.firstName || clerkUser?.username;
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
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-10">
              <Link href="/" className="flex items-center space-x-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">G</span>
                  </div>
                  <span className={cn("text-xl font-bold", colors.text)}>
                    GigUp
                  </span>
                </motion.div>
              </Link>

              <div className="flex items-center space-x-8">
                {navigationItems.map((item) => {
                  if (item.condition === false) return null;

                  const linkContent = (
                    <div
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                        colors.textMuted,
                        "hover:text-amber-600 dark:hover:text-amber-400"
                      )}
                    >
                      <div
                        className={cn(
                          "transition-colors duration-200",
                          "group-hover:text-amber-600 dark:group-hover:text-amber-400",
                          colors.textMuted
                        )}
                      >
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
                  );

                  return (
                    <Link key={item.href} href={item.href}>
                      {linkContent}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {isSignedIn && actionButton && (
                <Link href={actionButton.href}>
                  <Button
                    className={cn(
                      "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
                      "text-white flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
                    )}
                  >
                    {actionButton.icon}
                    <span>{actionButton.label}</span>
                  </Button>
                </Link>
              )}

              {isSignedIn && (
                <button onClick={handleOpenMessages} className="relative group">
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative",
                      colors.textMuted,
                      "hover:text-amber-600 dark:hover:text-amber-400"
                    )}
                  >
                    <MessageCircle size={18} />
                    <span>Messages</span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center animate-pulse">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}

                    <div
                      className={cn(
                        "absolute inset-0 rounded-lg bg-gray-50 dark:bg-gray-800/50",
                        "opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"
                      )}
                    />
                  </div>
                </button>
              )}

              {(isSignedIn && currentUser?.tier === "pro") ||
                (isInGracePeriod && (
                  <div className="hover:scale-105 transition-transform duration-200">
                    <NotificationBell variant="desktop" />
                  </div>
                ))}

              <button
                onClick={toggleDarkMode}
                className={cn(
                  "p-2 rounded-md transition-all duration-200 relative group",
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

                <div
                  className={cn(
                    "absolute inset-0 rounded-md bg-gray-50 dark:bg-gray-800/50",
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"
                  )}
                />
              </button>

              {isSignedIn ? (
                <div className="flex items-center space-x-4">
                  <span className={cn("text-sm", colors.textMuted)}>
                    Hi, {getGreetingName()}
                  </span>

                  <Link
                    href="/profile"
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative group",
                      colors.text,
                      "hover:text-amber-600 dark:hover:text-amber-400"
                    )}
                  >
                    <span className="transition-colors duration-200">
                      Profile
                    </span>

                    <div
                      className={cn(
                        "absolute inset-0 rounded-lg bg-gray-50 dark:bg-gray-800/50",
                        "opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"
                      )}
                    />
                  </Link>

                  <div className="hover:scale-105 transition-transform duration-200">
                    <UserButton />
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/sign-in"
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 relative group",
                      colors.text,
                      "hover:text-amber-600 dark:hover:text-amber-400"
                    )}
                  >
                    <span className="transition-colors duration-200">
                      Sign In
                    </span>

                    <div
                      className={cn(
                        "absolute inset-0 rounded-md bg-gray-50 dark:bg-gray-800/50",
                        "opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"
                      )}
                    />
                  </Link>
                  <Link
                    href="/sign-up"
                    className={cn(
                      "px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
                      "text-white text-sm font-medium rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
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
