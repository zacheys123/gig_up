"use client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAuth, UserButton } from "@clerk/nextjs";
import {
  CalendarIcon,
  CreditCardIcon,
  DollarSignIcon,
  HomeIcon,
  MusicIcon,
  PlusIcon,
  UsersIcon,
  Sun,
  Moon,
  BellIcon,
  MessageSquareIcon,
  SettingsIcon,
  HelpCircleIcon,
  StarIcon,
  HeartIcon,
  BarChartIcon,
  FileTextIcon,
  ShieldIcon,
  XIcon,
  ChevronRightIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdDashboard } from "react-icons/md";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeColors, useThemeToggle } from "@/hooks/useTheme";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { MobileNavSkeleton } from "../skeletons/MobileNavSkeleton";

export default function MobileNav() {
  const { userId } = useAuth();
  const { user } = useCurrentUser();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const { colors, isDarkMode, mounted } = useThemeColors();
  const { toggleDarkMode } = useThemeToggle();
  const { unreadCount } = useNotifications(5, true);

  // // If no user, return skeleton
  if (!user) {
    return <MobileNavSkeleton />;
  }

  const musicianLinks = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <MdDashboard className="w-5 h-5" />,
      exact: true,
    },
    {
      name: "Gigs",
      href: "/dashboard/gigs",
      icon: <MusicIcon className="w-5 h-5" />,
      exact: false,
    },
    {
      name: "Bookings",
      href: "/dashboard/bookings",
      icon: <CalendarIcon className="w-5 h-5" />,
      exact: false,
    },
    {
      name: "Earnings",
      href: "/dashboard/earnings",
      icon: <DollarSignIcon className="w-5 h-5" />,
      exact: false,
    },
    {
      name: "Messages",
      href: "/dashboard/messages",
      icon: <MessageSquareIcon className="w-5 h-5" />,
      exact: false,
    },
    {
      name: "Reviews",
      href: "/dashboard/reviews",
      icon: <StarIcon className="w-5 h-5" />,
      exact: false,
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: <BarChartIcon className="w-5 h-5" />,
      exact: false,
    },
  ];

  const clientLinks = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <MdDashboard className="w-5 h-5" />,
      exact: true,
    },
    {
      name: "Post Gig",
      href: "/dashboard/create",
      icon: <PlusIcon className="w-5 h-5" />,
      exact: false,
    },
    {
      name: "Events",
      href: "/dashboard/events",
      icon: <CalendarIcon className="w-5 h-5" />,
      exact: false,
    },
    {
      name: "Artists",
      href: "/dashboard/artists",
      icon: <UsersIcon className="w-5 h-5" />,
      exact: false,
    },
    {
      name: "Messages",
      href: "/dashboard/messages",
      icon: <MessageSquareIcon className="w-5 h-5" />,
      exact: false,
    },
    {
      name: "Favorites",
      href: "/dashboard/favorites",
      icon: <HeartIcon className="w-5 h-5" />,
      exact: false,
    },
    {
      name: "Bookings",
      href: "/dashboard/bookings",
      icon: <CalendarIcon className="w-5 h-5" />,
      exact: false,
    },
  ];

  const commonLinks = [
    {
      name: "Documents",
      href: "/dashboard/documents",
      icon: <FileTextIcon className="w-5 h-5" />,
      exact: false,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: <SettingsIcon className="w-5 h-5" />,
      exact: false,
    },
    {
      name: "Help & Support",
      href: "/dashboard/support",
      icon: <HelpCircleIcon className="w-5 h-5" />,
      exact: false,
    },
    {
      name: "Privacy & Security",
      href: "/dashboard/privacy",
      icon: <ShieldIcon className="w-5 h-5" />,
      exact: false,
    },
  ];

  const baseLinks = [
    {
      name: "Home",
      href: "/",
      icon: <HomeIcon className="w-5 h-5" />,
      exact: true,
    },
    {
      name: "Notifications",
      href: "/notifications",
      icon: (
        <div className="relative">
          <BellIcon className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      ),
      exact: true,
    },
    {
      name: "Billing",
      href: "/dashboard/billing",
      icon: <CreditCardIcon className="w-5 h-5" />,
      exact: false,
    },
  ];

  const roleLinks = user?.isMusician
    ? musicianLinks
    : user?.isClient
      ? clientLinks
      : [];
  const allLinks = [...baseLinks, ...roleLinks, ...commonLinks];

  const isActive = (href: string, exact: boolean = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  // Prevent body scroll when nav is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 md:hidden" ref={navRef}>
      <div className="relative h-20">
        {/* Full Screen Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sliding Navigation Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className={cn(
                "fixed bottom-0 left-0 right-0 h-3/4 rounded-t-3xl border-b",
                colors.background,
                colors.border
              )}
            >
              {/* Header */}
              <div className={cn("p-6 border-b", colors.border)}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className={cn("text-xl font-bold", colors.text)}>
                      Navigation
                    </h2>
                    <p className={cn("text-sm mt-1", colors.textMuted)}>
                      {user?.isMusician ? "Artist" : "Client"} •{" "}
                      {user?.gigsBooked || 0}{" "}
                      {user?.isMusician ? "Gigs" : "Posts"}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "p-2 rounded-full",
                      colors.hoverBg,
                      colors.text
                    )}
                  >
                    <XIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Navigation Links - Vertical List */}
              <div className="h-[calc(100%-120px)] overflow-y-auto">
                <div className="p-4 space-y-2">
                  {allLinks.map((link, index) => {
                    const active = isActive(link.href, link.exact);
                    return (
                      <motion.div
                        key={link.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: index * 0.05,
                          type: "spring",
                          stiffness: 300,
                        }}
                      >
                        <Link
                          href={link.href}
                          className={cn(
                            "group flex items-center gap-3 w-full p-4 rounded-xl transition-all duration-200 border-l-4",
                            colors.hoverBg,
                            active
                              ? "bg-gradient-to-r from-amber-500/20 to-orange-500/10 border-amber-500 text-amber-100"
                              : cn(
                                  colors.text,
                                  "border-transparent",
                                  colors.hoverBg
                                )
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          <div
                            className={cn(
                              "transition-transform duration-200",
                              active
                                ? "text-amber-400"
                                : cn(
                                    "group-hover:text-amber-400",
                                    colors.textMuted
                                  )
                            )}
                          >
                            {link.icon}
                          </div>
                          <span
                            className={cn(
                              "font-medium flex-1",
                              active ? "text-amber-100" : colors.text
                            )}
                          >
                            {link.name}
                          </span>
                          <ChevronRightIcon
                            className={cn(
                              "w-4 h-4 transition-all duration-200",
                              active
                                ? "text-amber-400 opacity-100"
                                : cn(
                                    "opacity-0 group-hover:opacity-100",
                                    colors.textMuted
                                  )
                            )}
                          />
                        </Link>
                      </motion.div>
                    );
                  })}

                  {/* Theme Toggle */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: allLinks.length * 0.05,
                      type: "spring",
                      stiffness: 300,
                    }}
                  >
                    <button
                      onClick={toggleDarkMode}
                      className={cn(
                        "group flex items-center gap-3 w-full p-4 rounded-xl transition-all duration-200 border-l-4 border-transparent",
                        colors.hoverBg,
                        colors.text
                      )}
                    >
                      <div
                        className={cn(
                          "transition-colors duration-200",
                          "group-hover:text-amber-400",
                          colors.textMuted
                        )}
                      >
                        {isDarkMode ? (
                          <Sun className="w-5 h-5" />
                        ) : (
                          <Moon className="w-5 h-5" />
                        )}
                      </div>
                      <span className={cn("font-medium flex-1", colors.text)}>
                        {isDarkMode ? "Light Mode" : "Dark Mode"}
                      </span>
                      <div
                        className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          colors.card,
                          colors.textMuted
                        )}
                      >
                        Switch
                      </div>
                    </button>
                  </motion.div>

                  {/* User Profile */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: (allLinks.length + 1) * 0.05,
                      type: "spring",
                      stiffness: 300,
                    }}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-3 w-full p-4 rounded-xl transition-all duration-200 border-l-4 border-transparent",
                        colors.hoverBg
                      )}
                    >
                      <div className={cn("p-1", colors.textMuted)}>
                        <UserButton />
                      </div>
                      <span className={cn("font-medium flex-1", colors.text)}>
                        Profile & Settings
                      </span>
                      <ChevronRightIcon
                        className={cn("w-4 h-4", colors.textMuted)}
                      />
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Trigger Button */}
        <div className="absolute left-1/2 bottom-4 transform -translate-x-1/2 z-50 flex justify-center w-full">
          <div className="relative">
            {/* Floating Background Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full blur-md opacity-50"
              animate={{
                scale: isOpen ? 1.2 : 1,
                opacity: isOpen ? 0.6 : 0.3,
              }}
              transition={{ duration: 0.3 }}
            />

            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "relative flex items-center justify-center w-16 h-16 rounded-full",
                "bg-gradient-to-r from-amber-500 to-orange-500 shadow-2xl",
                "hover:from-amber-600 hover:to-orange-600 transition-all duration-300",
                "border-2 border-amber-400/30 z-10"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{
                  rotate: isOpen ? 45 : 0,
                  scale: isOpen ? 1.1 : 1,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <PlusIcon className="w-7 h-7 text-white" />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced version with loading states
