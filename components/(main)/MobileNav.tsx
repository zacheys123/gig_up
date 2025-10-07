// app/(main)/components/MobileNavigation.tsx
"use client";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useThemeColors, useThemeToggle } from "@/hooks/useTheme";
import MobileSheet from "../MobileSheet";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function MobileNavigation() {
  const { isSignedIn, user: clerkUser } = useUser();
  const { user: currentUser } = useCurrentUser();
  const { colors, isDarkMode } = useThemeColors();
  const { toggleDarkMode } = useThemeToggle();

  // Check if user has a role (isClient or isMusician)
  const hasRole = currentUser?.isClient || currentUser?.isMusician;

  // Navigation links for users without roles
  const navigation = [
    { name: "Home", href: "/" },
    { name: "Contact", href: "/contact" },
  ];

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

            {/* Desktop Navigation - Show only if user has no role */}
            {!hasRole && (
              <div className="hidden md:flex items-center space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${`${colors.text} ${colors.hoverBg} ${colors.primary}`}`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Right side */}
            <div className="flex items-center space-x-4">
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
                  {/* Desktop User Button */}
                  <div className="hidden md:block">
                    <UserButton />
                  </div>

                  {/* Mobile */}
                  <div className="md:hidden flex items-center space-x-3">
                    <span className={`text-sm ${colors.text}`}>
                      Hi, {clerkUser?.firstName || clerkUser?.username}
                    </span>
                    <UserButton />

                    {/* Show MobileSheet only if user has a role */}
                    {hasRole ? (
                      <MobileSheet />
                    ) : (
                      // Show simple navigation for users without roles
                      <div className="flex items-center space-x-2">
                        {navigation.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`px-3 py-1 text-sm font-medium ${colors.text} ${colors.hoverBg} transition-colors`}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Desktop Sign In/Sign Up - Show only if user has no role */}
                  {!hasRole && (
                    <div className="hidden md:flex space-x-2">
                      <Link
                        href="/sign-in"
                        className={`px-4 py-2 text-sm font-medium ${colors.text} ${colors.primary} transition-colors`}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/sign-up"
                        className={`px-4 py-2 ${colors.primaryBg} text-white text-sm font-medium rounded-md ${colors.primaryBgHover} transition-colors`}
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}

                  {/* Mobile */}
                  <div className="md:hidden flex items-center space-x-2">
                    {hasRole ? (
                      // Show MobileSheet for users with roles
                      <MobileSheet />
                    ) : (
                      // Show navigation + auth for users without roles
                      <>
                        {navigation.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`px-3 py-1 text-sm font-medium ${colors.text} ${colors.hoverBg} transition-colors`}
                          >
                            {item.name}
                          </Link>
                        ))}
                        <Link
                          href="/sign-in"
                          className={`px-3 py-1 text-sm font-medium ${colors.text} ${colors.primary} transition-colors`}
                        >
                          Sign In
                        </Link>
                      </>
                    )}
                  </div>
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
