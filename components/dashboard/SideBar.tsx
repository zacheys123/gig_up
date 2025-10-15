"use client";

import { useSubscriptionStore } from "@/app/stores/useSubscriptionStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useNotifications } from "@/hooks/useNotifications";
import {
  CalendarIcon,
  CreditCardIcon,
  DollarSignIcon,
  MusicIcon,
  PlusIcon,
  UsersIcon,
  BellIcon,
  ChevronRightIcon,
  MessageSquareIcon,
  SettingsIcon,
  HelpCircleIcon,
  StarIcon,
  HeartIcon,
  BarChartIcon,
  FileTextIcon,
  ShieldIcon,
  Sun,
  Moon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdDashboard } from "react-icons/md";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useThemeColors, useThemeToggle } from "@/hooks/useTheme";
import { SidebarSkeleton } from "../skeletons/SidebarSkeleton";

interface NavLink {
  name: string;
  href: string;
  icon: React.ReactElement;
  exact?: boolean;
  pro?: boolean;
  description?: string;
}

export function Sidebar() {
  const { user } = useCurrentUser();
  const { isPro } = useSubscriptionStore();
  const pathname = usePathname();
  const { unreadCount } = useNotifications(5, true);
  const { colors, isDarkMode, mounted } = useThemeColors();
  const { toggleDarkMode } = useThemeToggle();

  if (!user) {
    return <SidebarSkeleton />;
  }

  const isActive = (href: string, exact: boolean = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
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
      href: "/dashboard/gigs",
      icon: <MusicIcon className="w-5 h-5" />,
    },
    {
      name: "Bookings",
      href: "/dashboard/bookings",
      icon: <CalendarIcon className="w-5 h-5" />,
    },
    {
      name: "Earnings",
      href: "/dashboard/earnings",
      icon: <DollarSignIcon className="w-5 h-5" />,
    },
    {
      name: "Messages",
      href: "/dashboard/messages",
      icon: <MessageSquareIcon className="w-5 h-5" />,
    },
    {
      name: "Reviews",
      href: "/dashboard/reviews",
      icon: <StarIcon className="w-5 h-5" />,
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: <BarChartIcon className="w-5 h-5" />,
    },
    {
      name: "Billing",
      href: "/dashboard/billing",
      icon: <CreditCardIcon className="w-5 h-5" />,
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
      name: "Post Gig",
      href: "/dashboard/create",
      icon: <PlusIcon className="w-5 h-5" />,
    },
    {
      name: "Events",
      href: "/dashboard/events",
      icon: <CalendarIcon className="w-5 h-5" />,
    },
    {
      name: "Artists",
      href: "/dashboard/artists",
      icon: <UsersIcon className="w-5 h-5" />,
    },
    {
      name: "Messages",
      href: "/dashboard/messages",
      icon: <MessageSquareIcon className="w-5 h-5" />,
    },
    {
      name: "Favorites",
      href: "/dashboard/favorites",
      icon: <HeartIcon className="w-5 h-5" />,
    },
    {
      name: "Bookings",
      href: "/dashboard/bookings",
      icon: <CalendarIcon className="w-5 h-5" />,
    },
    {
      name: "Billing",
      href: "/dashboard/billing",
      icon: <CreditCardIcon className="w-5 h-5" />,
    },
  ];

  // Common links for both roles
  const commonLinks: NavLink[] = [
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: <SettingsIcon className="w-5 h-5" />,
    },
    {
      name: "Help & Support",
      href: "/dashboard/support",
      icon: <HelpCircleIcon className="w-5 h-5" />,
    },
    {
      name: "Privacy & Security",
      href: "/dashboard/privacy",
      icon: <ShieldIcon className="w-5 h-5" />,
    },
  ];

  // Base links (available to all users)
  const baseLinks: NavLink[] = [
    {
      name: "Home",
      href: "/",
      icon: <BellIcon className="w-5 h-5" />,
      exact: true,
    },
  ];

  // Pro links (only for pro users)
  const proLinks: NavLink[] = [
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
      pro: false,
      description: "Notifications with priority alerts",
    },
    {
      name: "Documents",
      href: "/dashboard/documents",
      icon: <FileTextIcon className="w-5 h-5" />,
      pro: true,
      description: "Professional gig templates",
    },
    {
      name: "Priority Support",
      href: "/dashboard/priority-support",
      icon: <ShieldIcon className="w-5 h-5" />,
      pro: true,
      description: "24/7 dedicated support",
    },
  ];

  const roleLinks = user?.isMusician
    ? musicianLinks
    : user?.isClient
      ? clientLinks
      : [];

  // Combine all links in the same order as MobileNav
  const links = [...baseLinks, ...roleLinks, ...commonLinks, ...proLinks];

  return (
    <div
      className={cn(
        "w-full md:w-64 h-full flex flex-col border-r",
        colors.background,
        colors.border
      )}
    >
      {/* Header */}
      <div className={cn("p-6 border-b", colors.border)}>
        <div className="flex items-center justify-between">
          <div>
            <h2
              className={cn(
                "text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent"
              )}
            >
              GigUp
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={cn(
                  "px-2 py-1 text-xs font-medium rounded-full border",
                  isPro()
                    ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-purple-400"
                    : cn(
                        "bg-gray-100 dark:bg-gray-700",
                        colors.text,
                        colors.border
                      )
                )}
              >
                {isPro() ? "PRO" : "FREE"}
              </span>
              <span className={cn("text-xs font-medium", colors.textMuted)}>
                {user?.isMusician ? "Artist" : "Client"}
              </span>
            </div>
          </div>

          {/* Notifications for Desktop Sidebar */}
          <div className="hidden lg:block">
            <NotificationBell variant="desktop" />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const active = isActive(link.href, link.exact);
          const isProFeature = link.pro && !isPro();

          const linkContent = (
            <div
              className={cn(
                "group flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 border-l-4",
                colors.hoverBg,
                isProFeature && "cursor-not-allowed opacity-60",
                active
                  ? "bg-gradient-to-r from-amber-500/20 to-orange-500/10 border-amber-500 text-amber-100"
                  : cn(colors.text, "border-transparent", colors.hoverBg)
              )}
            >
              <div
                className={cn(
                  "transition-transform duration-200",
                  active
                    ? "text-amber-400"
                    : isProFeature
                      ? "text-gray-400 dark:text-gray-500"
                      : cn("group-hover:text-amber-400", colors.textMuted)
                )}
              >
                {link.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-medium flex-1",
                      active ? "text-amber-100" : colors.text,
                      isProFeature && "text-gray-500 dark:text-gray-400"
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
                </div>
                {link.description && (
                  <p
                    className={cn(
                      "text-xs truncate",
                      active ? "text-amber-500/80" : colors.textMuted,
                      isProFeature && "text-gray-400 dark:text-gray-500"
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

          return isProFeature ? (
            // Pro feature - visible but not clickable
            <div
              key={link.name}
              className="relative"
              title="Upgrade to Pro to access this feature"
            >
              {linkContent}
            </div>
          ) : (
            // Regular link - clickable (including pro links for pro users)
            <Link key={link.name} href={link.href}>
              {linkContent}
            </Link>
          );
        })}

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className={cn(
            "group flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 border-l-4 border-transparent",
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
      </nav>

      {/* Quick Stats */}
      <div className={cn("p-4 border-t", colors.border)}>
        <div
          className={cn("rounded-lg p-3 border", colors.card, colors.border)}
        >
          <div className={cn("text-xs mb-2 font-medium", colors.textMuted)}>
            Quick Stats
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <div className={cn(colors.text)}>
                {user?.isMusician ? "Gigs Booked" : "Posts Created"}
              </div>
              <div className="text-amber-400 font-medium">
                {user?.gigsBooked || 0}
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <div className={cn(colors.text)}>Messages</div>
              <div className="text-blue-400 font-medium">
                {
                  // user?.unreadMessages
                  0
                }
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <div className={cn(colors.text)}>Notifications</div>
              <div className="text-green-400 font-medium">{unreadCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* App Version */}
      <div className={cn("px-4 py-2 border-t", colors.border)}>
        <div className={cn("text-xs text-center", colors.textMuted)}>
          GigUp v1.0.0
        </div>
      </div>
    </div>
  );
}
