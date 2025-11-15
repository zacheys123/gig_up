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
  User,
  BriefcaseIcon,
  Users2Icon,
  BuildingIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdDashboard } from "react-icons/md";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeColors, useThemeToggle } from "@/hooks/useTheme";

import { cn } from "@/lib/utils";
import { MobileNavSkeleton } from "../skeletons/MobileNavSkeleton";
import { useRouter } from "next/navigation";
import { useNotificationSystem } from "@/hooks/useNotifications";
import { useCheckTrial } from "@/hooks/useCheckTrial";
import { useChat } from "@/app/context/ChatContext";
import { useUnreadCount } from "@/hooks/useUnreadCount";
import { ChatListModal } from "../chat/ChatListModal";

interface NavLink {
  name: string;
  href: string;
  icon: React.ReactElement;
  exact: boolean;
  pro?: boolean;
  description?: string;
  badge?: number;
  onClick?: (e: React.MouseEvent) => void;
}

export default function MobileNav() {
  const { userId } = useAuth();
  const { user } = useCurrentUser();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const { colors, isDarkMode, mounted } = useThemeColors();
  const { toggleDarkMode } = useThemeToggle();
  const { unreadCount: notCount } = useNotificationSystem();
  const { isInGracePeriod: canSeeNotification } = useCheckTrial();
  const router = useRouter();

  const { openChat } = useChat();
  const [showChatListModal, setShowChatListModal] = useState(false);
  const { total: unReadCount, byChat: unreadCounts } = useUnreadCount();

  const handleOpenMessages = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(!isOpen);
    setShowChatListModal(true);
  };

  const musicianLinks: NavLink[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <MdDashboard className="w-5 h-5" />,
      exact: true,
    },
    {
      name: "Gigs",
      href: "/hub/gigs?tab=all",
      icon: <MusicIcon className="w-5 h-5" />,
      exact: false,
    },
    {
      name: "Favorites",
      href: "/hub/gigs?tab=favorites",
      icon: <HeartIcon className="w-5 h-5" />,
      exact: false,
    },
    {
      name: "Bookings",
      href: "/hub/gigs?tab=booked",
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

  const clientLinks: NavLink[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <MdDashboard className="w-5 h-5" />,
      exact: true,
    },
    {
      name: "My Gigs",
      href: "/hub/gigs?tab=my-gigs",
      icon: <MusicIcon className="w-5 h-5" />,
      exact: false,
    },
    {
      name: "Instant Gigs",
      href: "/hub/gigs?tab=create-gigs",
      icon: <PlusIcon className="w-5 h-5" />,
      exact: false,
    },
    {
      name: "Bookings",
      href: "/hub/gigs?tab=booked",
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
      name: "Favorites",
      href: "/hub/gigs?tab=favorites",
      icon: <HeartIcon className="w-5 h-5" />,
      exact: false,
    },
  ];

  const bookerLinks: NavLink[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <MdDashboard className="w-5 h-5" />,
      exact: true,
    },
    {
      name: "Find Gigs",
      href: "/hub/gigs?tab=available-gigs",
      icon: <BriefcaseIcon className="w-5 h-5" />,
      exact: false,
      description: "Browse available gigs",
    },
    {
      name: "My Artists",
      href: "/dashboard/artists",
      icon: <Users2Icon className="w-5 h-5" />,
      exact: false,
      description: "Manage your artists",
    },
    {
      name: "Bookings",
      href: "/hub/gigs?tab=booked",
      icon: <CalendarIcon className="w-5 h-5" />,
      exact: false,
      description: "Manage bookings",
    },
    {
      name: "Coordination",
      href: "/dashboard/coordination",
      icon: <BuildingIcon className="w-5 h-5" />,
      exact: false,
      description: "Event coordination",
      pro: true,
    },
    {
      name: "Earnings",
      href: "/dashboard/earnings",
      icon: <DollarSignIcon className="w-5 h-5" />,
      exact: false,
      description: "Booking commissions",
    },
  ];

  // Common links with badges and chat functionality
  const commonLinks: NavLink[] = [
    {
      name: "Messages",
      href: "/messages",
      icon: (
        <div className="relative">
          <MessageSquareIcon className="w-5 h-5" />
          {unReadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
              {unReadCount > 9 ? "9+" : unReadCount}
            </span>
          )}
        </div>
      ),
      exact: false,
      description: "Chat conversations",
      badge: unReadCount,
      onClick: handleOpenMessages,
    },
    {
      name: "Community",
      href: "/community",
      icon: <UsersIcon className="w-5 h-5" />,
      exact: false,
      description: "Connect with others",
    },
    {
      name: "Profile",
      href: "/profile",
      icon: <User className="w-5 h-5" />,
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

  const baseLinks: NavLink[] = [
    {
      name: "Home",
      href: "/",
      icon: <HomeIcon className="w-5 h-5" />,
      exact: true,
    },
    {
      name: "Billing",
      href: "/dashboard/billing",
      icon: <CreditCardIcon className="w-5 h-5" />,
      exact: false,
    },
  ];

  const isProTier = user?.tier === "pro";

  // Pro links with notification badge
  const proLinks: NavLink[] = [
    {
      name: "Notifications",
      href: "/notifications",
      icon: (
        <div className="relative">
          <BellIcon className="w-5 h-5" />
          {notCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
              {notCount > 9 ? "9+" : notCount}
            </span>
          )}
        </div>
      ),
      exact: true,
      pro: canSeeNotification,
      description: "Notifications with priority alerts",
      badge: notCount,
    },
    {
      name: "Documents",
      href: "/dashboard/documents",
      icon: <FileTextIcon className="w-5 h-5" />,
      exact: false,
      pro: true,
      description: "Professional gig templates",
    },
    {
      name: "Priority Support",
      href: "/dashboard/priority-support",
      icon: <ShieldIcon className="w-5 h-5" />,
      exact: false,
      pro: true,
      description: "24/7 dedicated support",
    },
  ];

  // Determine role-specific links
  const getRoleLinks = () => {
    if (user?.isBooker) return bookerLinks;
    if (user?.isMusician) return musicianLinks;
    if (user?.isClient) return clientLinks;
    return [];
  };

  const roleLinks = getRoleLinks();

  // Combine all links
  const allLinks = [...baseLinks, ...roleLinks, ...commonLinks, ...proLinks];

  const isActive = (href: string, exact: boolean = false, pro?: boolean) => {
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

  const getUserRoleLabel = () => {
    if (user?.isBooker) return "Booker";
    if (user?.isMusician) return "Artist";
    if (user?.isClient) return "Client";
    return "User";
  };

  const getUserStatsLabel = () => {
    if (user?.isBooker) return "Artists Managed";
    if (user?.isMusician) return "Gigs Booked";
    if (user?.isClient) return "Posts Created";
    return "Activity";
  };

  const getUserStatsValue = () => {
    if (user?.isBooker) return user.artistsManaged?.length || 0;
    if (user?.isMusician) return user.gigsBooked || 0;
    if (user?.isClient) return user.gigsPosted || 0;
    return 0;
  };

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-9999 md:hidden" ref={navRef}>
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
                        {getUserRoleLabel()} • {getUserStatsValue()}{" "}
                        {getUserStatsLabel()}
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
                      const active = isActive(link.href, link.exact, link.pro);
                      const isProFeature = link.pro && !isProTier;

                      const linkContent = (
                        <div
                          className={cn(
                            "group flex items-center gap-3 w-full p-4 rounded-xl transition-all duration-200 border-l-4",
                            colors.hoverBg,
                            isProFeature && "cursor-not-allowed opacity-60",
                            active
                              ? "bg-gradient-to-r from-amber-500/20 to-orange-500/10 border-amber-500 text-amber-100"
                              : cn(
                                  colors.text,
                                  "border-transparent",
                                  colors.hoverBg
                                )
                          )}
                        >
                          <div
                            className={cn(
                              "transition-transform duration-200",
                              active
                                ? "text-amber-400"
                                : isProFeature
                                  ? "text-gray-400 dark:text-gray-500"
                                  : cn(
                                      "group-hover:text-amber-400",
                                      colors.textMuted
                                    )
                            )}
                          >
                            {link.icon}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "font-medium text-sm",
                                  active ? "text-amber-600" : colors.text,
                                  isProFeature &&
                                    "text-gray-500 dark:text-gray-400"
                                )}
                              >
                                {link.name}
                              </span>
                              {link.pro && (
                                <span
                                  className={cn(
                                    "text-xs rounded-full px-2 py-1",
                                    isProFeature
                                      ? "bg-gray-400 text-white"
                                      : "bg-green-500 text-white"
                                  )}
                                >
                                  PRO
                                </span>
                              )}
                              {link.badge && link.badge > 0 && (
                                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                  {link.badge > 9 ? "9+" : link.badge}
                                </span>
                              )}
                            </div>
                            {link.description && (
                              <p
                                className={cn(
                                  "text-xs truncate",
                                  active
                                    ? "text-amber-500/80"
                                    : colors.textMuted,
                                  isProFeature &&
                                    "text-gray-400 dark:text-gray-500"
                                )}
                              >
                                {link.description}
                              </p>
                            )}
                          </div>

                          <ChevronRightIcon
                            className={cn(
                              "w-4 h-4 transition-all duration-200",
                              active
                                ? "text-amber-400 opacity-100"
                                : isProFeature
                                  ? "text-gray-400 dark:text-gray-500 opacity-50"
                                  : cn(
                                      "opacity-0 group-hover:opacity-100",
                                      colors.textMuted
                                    )
                            )}
                          />
                        </div>
                      );

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
                          {isProFeature ? (
                            <div
                              className="relative"
                              title="Upgrade to Pro to access this feature"
                            >
                              {linkContent}
                            </div>
                          ) : link.onClick ? (
                            <button
                              onClick={link.onClick}
                              className="w-full text-left"
                            >
                              {linkContent}
                            </button>
                          ) : (
                            <Link
                              href={link.href}
                              onClick={() => setIsOpen(false)}
                            >
                              {linkContent}
                            </Link>
                          )}
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

      {/* Chat List Modal */}
      <ChatListModal
        isOpen={showChatListModal}
        onClose={() => setShowChatListModal(false)}
      />
    </>
  );
}
