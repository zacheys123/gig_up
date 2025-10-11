// app/how-it-works/layout.tsx
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
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useThemeColors } from "@/hooks/useTheme";
import { UserButton } from "@clerk/nextjs";
import { Box } from "@mui/material";
import GigLoader from "@/components/(main)/GigLoader";

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { colors, isDarkMode, mounted } = useThemeColors();
  const router = useRouter();
  const [activeHash, setActiveHash] = useState("");

  const navigation = [
    {
      name: "Overview",
      href: "/how-it-works",
      hash: "",
      icon: <FaHome size={18} />,
    },
    {
      name: "Badges",
      href: "/how-it-works",
      hash: "#badges",
      icon: <FaAward size={18} />,
    },
    {
      name: "Ratings",
      href: "/how-it-works",
      hash: "#ratings",
      icon: <FaStar size={18} />,
    },
    {
      name: "Reliability",
      href: "/how-it-works",
      hash: "#reliability",
      icon: <FaShieldAlt size={18} />,
    },
    {
      name: "Get Started",
      href: "/how-it-works",
      hash: "#getting-started",
      icon: <FaRocket size={18} />,
    },
  ];

  // Handle hash changes and scroll to section
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      setActiveHash(hash);

      if (hash) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          const element = document.getElementById(hash.substring(1));
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    };

    // Initial hash check
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Handle navigation with proper history
  const handleNavigation = (href: string, hash: string) => {
    const fullPath = `${href}${hash}`;

    // Use Next.js router for SPA navigation with history
    router.push(fullPath, { scroll: false });

    // Update active hash
    setActiveHash(hash);

    // Scroll to section after navigation
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      // Scroll to top if no hash
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!mounted) {
    return <GigLoader color=" border-blue-500" />;
  }

  return (
    <div
      className={cn(
        "min-h-screen pb-20 md:pb-0",
        colors.background,
        colors.text
      )}
    >
      {/* Header */}
      {/* Header */}
      <header
        className={cn(
          "border-b sticky top-0 z-40 backdrop-blur-sm z-9999",
          colors.navBorder,
          colors.navBackground
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left section - Logo and Navigation */}
            <div className="flex items-center">
              <Link
                href="/"
                className={cn("text-xl font-bold", colors.navText)}
              >
                Gigup
              </Link>

              {/* Mobile Back to App Button */}
              <button
                onClick={() => router.push("/")}
                className="md:hidden bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold mx-10 hover:bg-red-600 transition-colors"
              >
                Back To App
              </button>

              <nav className="ml-8 hidden md:flex space-x-2">
                {navigation.map((item) => {
                  const isActive = activeHash === item.hash;
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavigation(item.href, item.hash)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive
                          ? cn(
                              colors.primaryBg,
                              colors.textInverted,
                              "shadow-md"
                            )
                          : cn(colors.text, colors.hoverBg, "hover:shadow-sm")
                      )}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Right section - Actions */}
            <div className="flex items-center gap-4">
              {/* Desktop UserButton would go here */}
              <div className="hidden md:block">
                <UserButton />
              </div>

              {/* Desktop Back to App Button */}
              <button
                onClick={() => router.push("/")}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hidden md:block",
                  colors.primaryBg,
                  colors.primaryBgHover,
                  colors.textInverted,
                  "hover:scale-105 shadow-lg"
                )}
              >
                Back to App
              </button>
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
            {navigation.map((item) => {
              const isActive = activeHash === item.hash;
              return (
                <motion.button
                  key={item.name}
                  onClick={() => handleNavigation(item.href, item.hash)}
                  className={cn(
                    "flex flex-col items-center py-3 px-2 flex-1 min-w-0 transition-all duration-200",
                    isActive ? colors.primary : colors.textMuted
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  <div
                    className={cn(
                      "p-2 rounded-full transition-all duration-200 mb-1",
                      isActive ? cn(colors.primaryBg, "scale-110") : "scale-100"
                    )}
                  >
                    {item.icon}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium transition-all duration-200",
                      isActive
                        ? cn(colors.primary, "font-semibold")
                        : colors.textMuted
                    )}
                  >
                    {item.name}
                  </span>

                  {/* Active indicator dot */}
                  {isActive && (
                    <motion.div
                      className={cn(
                        "w-1 h-1 rounded-full mt-1",
                        colors.primaryBg
                      )}
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

          {/* Additional footer content */}
          <div className={cn("mt-8 pt-8 border-t text-center", colors.border)}>
            <p className={cn("text-xs", colors.textMuted)}>
              Building trust through transparency in the gig economy
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
