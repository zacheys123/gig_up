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
import { useNotifications } from "@/hooks/useNotifications";
import { useCheckTrial } from "@/hooks/useCheckTrial";

export function MobileNavigation() {
  const { isSignedIn, user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { user: currentUser, isLoading: currentUserLoading } = useCurrentUser();
  const { colors, isDarkMode, mounted } = useThemeColors();
  const { toggleDarkMode } = useThemeToggle();
  const { notifications } = useNotifications();
  // Check if user has a role
  const hasRole = currentUser?.isClient || currentUser?.isMusician;
  const { isFirstMonthEnd } = useCheckTrial();
  // Show loading state
  if (!clerkLoaded || (isSignedIn && currentUserLoading) || !mounted) {
    return (
      <>
        <nav
          className={`fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 backdrop-blur-md border-b border-gray-200 dark:border-gray-700`}
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
                  <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    GigUp
                  </span>
                </motion.div>
              </Link>

              {/* Right side loading state */}
              <div className="flex items-center space-x-4">
                <Skeleton className="w-8 h-8 rounded-md" />
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-16 h-4 rounded" />
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="w-8 h-8 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </nav>
        <div className="h-16" />
      </>
    );
  }

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

                  {/* Mobile Sheet - Only if user has role */}
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
