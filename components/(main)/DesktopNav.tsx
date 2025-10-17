"use client";
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
} from "lucide-react";
import { useThemeColors, useThemeToggle } from "@/hooks/useTheme";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useCheckTrial } from "@/hooks/useCheckTrial";

export function DesktopNavigation() {
  const { isSignedIn, user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { user: currentUser, isLoading: currentUserLoading } = useCurrentUser();
  const { colors, isDarkMode, mounted } = useThemeColors();
  const { toggleDarkMode } = useThemeToggle();

  const { isInGracePeriod } = useCheckTrial();
  // Check if user has a role
  const hasRole = currentUser?.isClient || currentUser?.isMusician;
  const isMusician = currentUser?.isMusician;

  // Show loading state while data is being fetched
  if (!clerkLoaded || (isSignedIn && currentUserLoading) || !mounted) {
    return (
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b",
          colors.navBackground,
          colors.navBorder
        )}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-10">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">G</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  GigUp
                </span>
              </Link>

              {/* Navigation Links Skeleton */}
              <div className="hidden lg:flex items-center space-x-8">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="w-20 h-4 rounded" />
                ))}
              </div>
            </div>

            {/* Right side loading state */}
            <div className="flex items-center space-x-4">
              <Skeleton className="w-10 h-10 rounded-md" />
              <div className="flex items-center space-x-3">
                <Skeleton className="w-24 h-4 rounded" />
                <Skeleton className="w-8 h-8 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const navigationItems = [
    {
      href: "/",
      label: "Home",
      icon: <Home size={18} />,
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
      href: "/gigs",
      label: isMusician ? "Find Gigs" : "Post Gig",
      icon: <Calendar size={18} />,
      condition: hasRole,
    },
    {
      href: `/messages`,
      icon: <MessageCircle size={20} />,
      label: "Messages",
      description: "Chat conversations",
      badge: 3,
    },
  ];

  return (
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
          {/* Left: Logo + Navigation */}
          <div className="flex items-center space-x-10">
            {/* Logo */}
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

            {/* Navigation Links */}
            <div className="flex items-center space-x-8">
              {navigationItems.map((item) => {
                if (item.condition === false) return null;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
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
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {item.badge}
                      </span>
                    )}
                    {/* Subtle background on hover */}
                    <div
                      className={cn(
                        "absolute inset-0 rounded-lg bg-gray-50 dark:bg-gray-800/50",
                        "opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"
                      )}
                    />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: Actions & User */}
          <div className="flex items-center space-x-4">
            {/* Create Button (for signed-in users with roles) */}
            {isSignedIn && hasRole && (
              <Link href={isMusician ? "/gigs" : "/create-gig"}>
                <Button
                  className={cn(
                    "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
                    "text-white flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
                  )}
                >
                  <Plus size={16} />
                  <span>{isMusician ? "Find Gigs" : "Post Gig"}</span>
                </Button>
              </Link>
            )}

            {/* Notifications Bell */}
            {(isSignedIn && currentUser?.tier === "pro") ||
              (isInGracePeriod && (
                <div className="hover:scale-105 transition-transform duration-200">
                  <NotificationBell variant="desktop" />
                </div>
              ))}

            {/* Theme Toggle */}
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

              {/* Subtle background on hover */}
              <div
                className={cn(
                  "absolute inset-0 rounded-md bg-gray-50 dark:bg-gray-800/50",
                  "opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"
                )}
              />
            </button>

            {isSignedIn ? (
              <div className="flex items-center space-x-4">
                {/* User Greeting */}
                <span className={cn("text-sm", colors.textMuted)}>
                  Hi, {clerkUser?.firstName || clerkUser?.username}
                </span>

                {/* Profile Link */}
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

                  {/* Subtle background on hover */}
                  <div
                    className={cn(
                      "absolute inset-0 rounded-lg bg-gray-50 dark:bg-gray-800/50",
                      "opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"
                    )}
                  />
                </Link>

                {/* User Button */}
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

                  {/* Subtle background on hover */}
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
  );
}
