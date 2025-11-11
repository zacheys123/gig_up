"use client";

import { useSubscriptionStore } from "@/app/stores/useSubscriptionStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  CalendarIcon,
  CreditCardIcon,
  DollarSignIcon,
  MusicIcon,
  PlusIcon,
  UsersIcon,
  BellIcon,
  MessageSquareIcon,
  SettingsIcon,
  HelpCircleIcon,
  StarIcon,
  HeartIcon,
  BarChartIcon,
  FileTextIcon,
  ShieldIcon,
  HomeIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdDashboard } from "react-icons/md";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useThemeColors } from "@/hooks/useTheme";
import { useNotificationSystem } from "@/hooks/useNotifications";
import { useCheckTrial } from "@/hooks/useCheckTrial";
import { useChat } from "@/app/context/ChatContext";
import { useState } from "react";
import { useUnreadCount } from "@/hooks/useUnreadCount";
import { ChatListModal } from "../chat/ChatListModal";

interface NavLink {
  name: string;
  href: string;
  icon: React.ReactElement;
  exact?: boolean;
  pro?: boolean;
  badge?: number;
  onClick?: (e: React.MouseEvent) => void;
}

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const { user } = useCurrentUser();
  const { isPro } = useSubscriptionStore();
  const pathname = usePathname();
  const { unreadCount: notCount } = useNotificationSystem();
  const { colors } = useThemeColors();
  const { isInGracePeriod } = useCheckTrial();

  const { openChat } = useChat();
  const [showChatListModal, setShowChatListModal] = useState(false);
  const [isSlideUpOpen, setIsSlideUpOpen] = useState(false);
  const { total: unReadCount, byChat: unreadCounts } = useUnreadCount();

  const handleOpenMessages = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowChatListModal(true);
  };

  const toggleSlideUp = () => {
    setIsSlideUpOpen(!isSlideUpOpen);
  };

  if (!user) {
    return null;
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
      icon: <MdDashboard className="w-6 h-6" />,
      exact: true,
    },
    {
      name: "Gigs",
      href: "/dashboard/gigs",
      icon: <MusicIcon className="w-6 h-6" />,
    },
    {
      name: "Bookings",
      href: "/dashboard/bookings",
      icon: <CalendarIcon className="w-6 h-6" />,
    },
    {
      name: "Earnings",
      href: "/dashboard/earnings",
      icon: <DollarSignIcon className="w-6 h-6" />,
    },
    {
      name: "Reviews",
      href: "/dashboard/reviews",
      icon: <StarIcon className="w-6 h-6" />,
    },
  ];

  const clientLinks: NavLink[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <MdDashboard className="w-6 h-6" />,
      exact: true,
    },
    {
      name: "Post Gig",
      href: "/dashboard/create",
      icon: <PlusIcon className="w-6 h-6" />,
    },
    {
      name: "Events",
      href: "/dashboard/events",
      icon: <CalendarIcon className="w-6 h-6" />,
    },
    {
      name: "Artists",
      href: "/dashboard/artists",
      icon: <UsersIcon className="w-6 h-6" />,
    },
    {
      name: "Favorites",
      href: "/dashboard/favorites",
      icon: <HeartIcon className="w-6 h-6" />,
    },
  ];

  const bookerLinks: NavLink[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <MdDashboard className="w-6 h-6" />,
      exact: true,
    },
    {
      name: "Find Gigs",
      href: "/dashboard/gigs",
      icon: <MusicIcon className="w-6 h-6" />,
    },
    {
      name: "My Artists",
      href: "/dashboard/artists",
      icon: <UsersIcon className="w-6 h-6" />,
    },
    {
      name: "Bookings",
      href: "/dashboard/bookings",
      icon: <CalendarIcon className="w-6 h-6" />,
    },
    {
      name: "Earnings",
      href: "/dashboard/earnings",
      icon: <DollarSignIcon className="w-6 h-6" />,
    },
  ];

  // Common links for all roles
  const commonLinks: NavLink[] = [
    {
      href: "/messages",
      icon: (
        <div className="relative">
          <MessageSquareIcon className="w-6 h-6" />
          {unReadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
              {unReadCount > 9 ? "9+" : unReadCount}
            </span>
          )}
        </div>
      ),
      name: "Messages",
      badge: unReadCount,
      onClick: handleOpenMessages,
    },
    {
      name: "Notifications",
      href: "/notifications",
      icon: (
        <div className="relative">
          <BellIcon className="w-6 h-6" />
          {notCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
              {notCount > 9 ? "9+" : notCount}
            </span>
          )}
        </div>
      ),
      badge: notCount,
    },
  ];

  // Base links (available to all users)
  const baseLinks: NavLink[] = [
    {
      name: "Home",
      href: "/",
      icon: <HomeIcon className="w-6 h-6" />,
      exact: true,
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: <UserIcon className="w-6 h-6" />,
    },
  ];

  // Additional links for slide-up panel
  const additionalLinks: NavLink[] = [
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: <SettingsIcon className="w-6 h-6" />,
    },
    {
      name: "Billing",
      href: "/dashboard/billing",
      icon: <CreditCardIcon className="w-6 h-6" />,
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: <BarChartIcon className="w-6 h-6" />,
      pro: true,
    },
    {
      name: "Help & Support",
      href: "/dashboard/support",
      icon: <HelpCircleIcon className="w-6 h-6" />,
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

  // Main nav links (limited for better mobile UX)
  const mainLinks = [...baseLinks, ...roleLinks.slice(0, 3), ...commonLinks];

  return (
    <>
      {/* Main Bottom Navigation */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          colors.border,
          colors.background,
          className
        )}
      >
        <nav className="flex items-center justify-around p-2">
          {mainLinks.map((link) => {
            const active = isActive(link.href, link.exact);
            const isProFeature = link.pro && !isPro();

            const linkContent = (
              <div
                className={cn(
                  "relative flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 min-w-[60px]",
                  active
                    ? "text-amber-500 bg-amber-500/10"
                    : cn(
                        "text-muted-foreground hover:text-foreground",
                        colors.hoverBg
                      ),
                  isProFeature && "cursor-not-allowed opacity-60"
                )}
              >
                <div className="relative">
                  {link.icon}
                  {link.badge && link.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {link.badge > 9 ? "9+" : link.badge}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium",
                    active ? "text-amber-500" : colors.textMuted,
                    isProFeature && "text-gray-500"
                  )}
                >
                  {link.name}
                </span>

                {link.pro && (
                  <span
                    className={cn(
                      "absolute -top-1 -right-1 text-[8px] rounded-full px-1",
                      isProFeature
                        ? "bg-gray-400 text-white"
                        : "bg-green-500 text-white"
                    )}
                  >
                    PRO
                  </span>
                )}
              </div>
            );

            if (isProFeature) {
              return (
                <div
                  key={link.name}
                  className="relative"
                  title="Upgrade to Pro to access this feature"
                >
                  {linkContent}
                </div>
              );
            }

            if (link.onClick) {
              return (
                <button
                  key={link.name}
                  onClick={link.onClick}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 min-w-[60px]"
                >
                  {linkContent}
                </button>
              );
            }

            return (
              <Link key={link.name} href={link.href} className="flex-1">
                {linkContent}
              </Link>
            );
          })}

          {/* More Options Trigger Button */}
          <button
            onClick={toggleSlideUp}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 min-w-[60px]",
              isSlideUpOpen
                ? "text-amber-500 bg-amber-500/10"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="relative">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">More</span>
          </button>
        </nav>
      </div>

      {/* Slide-up Panel */}
      {isSlideUpOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsSlideUpOpen(false)}
          />

          {/* Slide-up Content */}
          <div className="fixed bottom-16 left-4 right-4 z-50 bg-background border rounded-xl shadow-lg animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">More Options</h3>
              <button
                onClick={() => setIsSlideUpOpen(false)}
                className="p-1 rounded-lg hover:bg-accent"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Additional Links */}
            <div className="p-2">
              {additionalLinks.map((link) => {
                const active = isActive(link.href, link.exact);
                const isProFeature = link.pro && !isPro();

                const linkContent = (
                  <div
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                      active
                        ? "text-amber-500 bg-amber-500/10"
                        : "text-foreground hover:bg-accent",
                      isProFeature && "cursor-not-allowed opacity-60"
                    )}
                  >
                    <div
                      className={cn(
                        active ? "text-amber-500" : "text-muted-foreground",
                        isProFeature && "text-gray-400"
                      )}
                    >
                      {link.icon}
                    </div>
                    <span
                      className={cn(
                        "font-medium flex-1",
                        isProFeature && "text-gray-500"
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
                );

                if (isProFeature) {
                  return (
                    <div
                      key={link.name}
                      className="relative"
                      title="Upgrade to Pro to access this feature"
                    >
                      {linkContent}
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsSlideUpOpen(false)}
                  >
                    {linkContent}
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Chat List Modal */}
      <ChatListModal
        isOpen={showChatListModal}
        onClose={() => setShowChatListModal(false)}
      />
    </>
  );
}
