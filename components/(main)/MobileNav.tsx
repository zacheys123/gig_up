// components/(main)/MobileNavigation.tsx
"use client";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useThemeColors, useThemeToggle } from "@/hooks/useTheme";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import MobileSheet from "../pages/MobileSheet";

import { useCheckTrial } from "@/hooks/useCheckTrial";
import { useNotificationSystem } from "@/hooks/useNotifications";
import Logo from "../Logo";

export function MobileNavigation() {
  const { isSignedIn, user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { user: currentUser, isLoading: currentUserLoading } = useCurrentUser();
  const { colors, isDarkMode, mounted } = useThemeColors();
  const { toggleDarkMode } = useThemeToggle();
  const { notifications } = useNotificationSystem();

  // Check if user has a role - now includes booker
  const hasRole =
    currentUser?.isClient || currentUser?.isMusician || currentUser?.isBooker;
  const { isFirstMonthEnd } = useCheckTrial();

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
            {/* Logo & Navigation Skeleton */}
            <div className="flex items-center space-x-10">
              {/* Logo Skeleton */}
              <div className="flex items-center space-x-2">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="w-16 h-6 rounded" />
              </div>

              {/* Navigation Links Skeleton */}
              <div className="hidden lg:flex items-center space-x-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="w-16 h-4 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right side loading state */}
            <div className="flex items-center space-x-4">
              <Skeleton className="w-24 h-9 rounded-md" /> {/* Create button */}
              <Skeleton className="w-20 h-9 rounded-lg" /> {/* Messages */}
              <Skeleton className="w-8 h-8 rounded-md" /> {/* Theme */}
              <div className="flex items-center space-x-3">
                <Skeleton className="w-20 h-4 rounded" /> {/* Greeting */}
                <Skeleton className="w-16 h-9 rounded-lg" /> {/* Profile */}
                <Skeleton className="w-8 h-8 rounded-full" />{" "}
                {/* User button */}
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const getRoleSpecificGreeting = () => {
    if (currentUser?.isBooker) return "Booker";
    return clerkUser?.firstName || clerkUser?.username;
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 ${colors.navBackground} backdrop-blur-md border-b ${colors.navBorder}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
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
                <span className={`text-xl font-bold ${colors.text}`}>
                  GigUp
                </span>
              </motion.div>
            </Link>

            {/* Right side */}
            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-md ${colors.text} ${colors.hoverBg} transition-colors`}
                aria-label={
                  isDarkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {isSignedIn ? (
                <>
                  {!isFirstMonthEnd && notifications.length > 0 && (
                    <NotificationBell variant="mobile" />
                  )}
                  {/* User Button */}
                  <UserButton />

                  {/* Mobile Sheet - Only if user has role (now includes booker) */}
                  {hasRole && (
                    <MobileSheet
                      isTrialEnded={
                        isFirstMonthEnd && currentUser?.tier !== "pro"
                      }
                    />
                  )}
                </>
              ) : (
                <>
                  {/* Sign In for mobile */}
                  <Link
                    href="/sign-in"
                    className={`px-3 py-1 text-sm font-medium ${colors.text} ${colors.primary} transition-colors`}
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="h-16" />
    </>
  );
}
