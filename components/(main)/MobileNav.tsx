// app/(main)/components/MobileNavigation.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser, SignOutButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, Sun, Moon } from "lucide-react";
import { useThemeColors, useThemeToggle } from "@/hooks/useTheme";


export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();
  const { colors, isDarkMode } = useThemeColors();
  const { toggleDarkMode } = useThemeToggle();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 ${colors.navBackground} backdrop-blur-md border-b ${colors.navBorder}`}>
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

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? `${colors.primary} ${colors.activeBg} border ${colors.border}`
                      : `${colors.text} ${colors.hoverBg} ${colors.primary}`
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-md ${colors.text} ${colors.hoverBg} transition-colors`}
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {isSignedIn ? (
                <>
                  <div className="hidden md:block">
                    <UserButton />
                  </div>
                  <div className="md:hidden flex items-center space-x-2">
                    <span className={`text-sm ${colors.text}`}>
                      Hi, {user?.firstName || user?.username}
                    </span>
                    <UserButton />
                  </div>
                </>
              ) : (
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

              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`md:hidden p-2 rounded-md ${colors.text} ${colors.hoverBg} transition-colors`}
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`md:hidden ${colors.background} border-b ${colors.border}`}
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      pathname === item.href
                        ? `${colors.primary} ${colors.activeBg}`
                        : `${colors.text} ${colors.hoverBg} ${colors.primary}`
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}

                <button
                  onClick={() => {
                    toggleDarkMode();
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${colors.text} ${colors.hoverBg} ${colors.primary} transition-colors`}
                >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                  <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
                </button>

                {isSignedIn ? (
                  <div className={`border-t ${colors.border} pt-4 mt-4`}>
                    <div className={`px-3 py-2 text-sm ${colors.textMuted}`}>
                      Signed in as <span className={colors.primary}>{user?.firstName || user?.username}</span>
                    </div>
                    <SignOutButton>
                      <button
                        onClick={() => setIsOpen(false)}
                        className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${colors.destructive} ${colors.destructiveHover} transition-colors`}
                      >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                      </button>
                    </SignOutButton>
                  </div>
                ) : (
                  <div className={`border-t ${colors.border} pt-4 mt-4`}>
                    <Link
                      href="/sign-in"
                      onClick={() => setIsOpen(false)}
                      className={`block px-3 py-2 rounded-md text-base font-medium ${colors.text} ${colors.hoverBg} ${colors.primary} transition-colors`}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/sign-up"
                      onClick={() => setIsOpen(false)}
                      className={`block px-3 py-2 rounded-md text-base font-medium ${colors.primaryBg} text-white ${colors.primaryBgHover} transition-colors mt-2`}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <div className="h-16" />
    </>
  );
}