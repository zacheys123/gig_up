// app/how-it-works/layout.tsx - SIMPLE RELIABLE VERSION
"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaSun,
  FaMoon,
  FaHome,
  FaAward,
  FaStar,
  FaShieldAlt,
  FaRocket,
  FaChartLine,
  FaTrophy,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useThemeColors } from "@/hooks/useTheme";
import { UserButton } from "@clerk/nextjs";
import GigLoader from "@/components/(main)/GigLoader";

// Define navigation items outside component to prevent recreation
const NAVIGATION_ITEMS = [
  {
    name: "Overview",
    section: "overview",
    icon: <FaHome size={18} />,
  },
  {
    name: "Tiers",
    section: "tier-requirements",
    icon: <FaTrophy size={18} />,
  },
  {
    name: "Earn Points",
    section: "how-to-earn",
    icon: <FaChartLine size={18} />,
  },
  {
    name: "Badges",
    section: "badges",
    icon: <FaAward size={18} />,
  },
  {
    name: "Get Started",
    section: "getting-started",
    icon: <FaRocket size={18} />,
  },
];

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { colors, isDarkMode, mounted } = useThemeColors();
  const router = useRouter();
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("overview");

  // Handle URL parameters on load
  useEffect(() => {
    // Check for hash in URL
    const hash = window.location.hash.substring(1);
    if (hash && NAVIGATION_ITEMS.some((item) => item.section === hash)) {
      setActiveSection(hash);
    }

    // Check for query parameter
    const searchParams = new URLSearchParams(window.location.search);
    const sectionParam = searchParams.get("section");
    if (
      sectionParam &&
      NAVIGATION_ITEMS.some((item) => item.section === sectionParam)
    ) {
      setActiveSection(sectionParam);
    }
  }, []);

  // Simple navigation handler
  const handleNavigation = (section: string) => {
    setActiveSection(section);

    // Update URL without causing a page reload
    if (section === "overview") {
      router.push("/how-it-works");
    } else {
      router.push(`/how-it-works?section=${section}`);
    }

    // Notify the page component to scroll
    window.dispatchEvent(
      new CustomEvent("section-navigate", {
        detail: { section },
      })
    );
  };

  // Handle back/forward browser buttons
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.substring(1);
      if (hash && NAVIGATION_ITEMS.some((item) => item.section === hash)) {
        setActiveSection(hash);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  if (!mounted) {
    return <GigLoader color=" border-blue-500" />;
  }

  return (
    <div className={cn("min-h-screen", colors.background, colors.text)}>
      {/* Header */}
      <header
        className={cn(
          "border-b sticky top-0 z-40 backdrop-blur-sm",
          colors.navBorder,
          colors.navBackground
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left section */}
            <div className="flex items-center">
              <Link
                href="/"
                className={cn(
                  "text-xl font-bold hover:opacity-80 transition-opacity",
                  colors.navText
                )}
              >
                Gigup
              </Link>

              {/* Mobile Back to App Button */}
              <button
                onClick={() => router.push("/")}
                className="md:hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold mx-10 hover:opacity-90 transition-opacity shadow-lg"
              >
                Back To App
              </button>

              {/* Desktop Navigation */}
              <nav className="ml-8 hidden md:flex space-x-2">
                {NAVIGATION_ITEMS.map((item) => {
                  const isActive = activeSection === item.section;
                  return (
                    <motion.button
                      key={item.section}
                      onClick={() => handleNavigation(item.section)}
                      className={cn(
                        "px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive
                          ? cn(
                              colors.primaryBg,
                              colors.textInverted,
                              "shadow-lg"
                            )
                          : cn(
                              "hover:bg-gray-100 dark:hover:bg-gray-800",
                              colors.text,
                              "hover:shadow-md"
                            )
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {item.name}
                    </motion.button>
                  );
                })}
              </nav>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <UserButton afterSignOutUrl="/" />
              </div>

              <motion.button
                onClick={() => router.push("/")}
                className={cn(
                  "px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hidden md:block",
                  "bg-gradient-to-r from-blue-600 to-purple-600",
                  "text-white hover:opacity-90 shadow-lg",
                  "hover:scale-105 active:scale-95"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back to App
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <div
          className={cn(
            "border-t backdrop-blur-lg",
            colors.navBorder,
            colors.navBackground
          )}
        >
          <nav className="flex justify-around items-center">
            {NAVIGATION_ITEMS.map((item) => {
              const isActive = activeSection === item.section;
              return (
                <motion.button
                  key={item.section}
                  onClick={() => handleNavigation(item.section)}
                  className={cn(
                    "flex flex-col items-center py-3 px-2 flex-1 min-w-0 transition-all duration-200",
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : colors.textMuted
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  <div
                    className={cn(
                      "p-2 rounded-full transition-all duration-200 mb-1",
                      isActive
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                        : "bg-transparent"
                    )}
                  >
                    {item.icon}
                  </div>
                  <span className="text-xs font-medium">{item.name}</span>

                  {/* Active indicator dot */}
                  {isActive && (
                    <motion.div
                      className="h-1 w-1 rounded-full bg-blue-600 dark:bg-blue-400 mt-1"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer */}
      <footer
        className={cn("border-t py-12 mt-16", colors.border, colors.background)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className={cn("text-sm", colors.textMuted)}>
              &copy; {new Date().getFullYear()} Gigup. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link
                href="/privacy"
                className={cn(
                  "text-sm transition-colors duration-200 hover:underline",
                  colors.textMuted,
                  colors.hoverBg,
                  "px-2 py-1 rounded"
                )}
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className={cn(
                  "text-sm transition-colors duration-200 hover:underline",
                  colors.textMuted,
                  colors.hoverBg,
                  "px-2 py-1 rounded"
                )}
              >
                Terms
              </Link>
              <Link
                href="/contact"
                className={cn(
                  "text-sm transition-colors duration-200 hover:underline",
                  colors.textMuted,
                  colors.hoverBg,
                  "px-2 py-1 rounded"
                )}
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
