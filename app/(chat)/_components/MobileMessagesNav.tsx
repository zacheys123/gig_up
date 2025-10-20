// components/chat/MobileMessagesNav.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  Users,
  MessageCircle,
  Calendar,
  Plus,
  User,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { useUnreadCount } from "@/hooks/useUnreadCount";

export function MobileMessagesNav() {
  const { user: currentUser } = useCurrentUser();
  const { colors } = useThemeColors();
  const pathname = usePathname();
  const unreadCount = useUnreadCount();

  const hasRole = currentUser?.isClient || currentUser?.isMusician;
  const isMusician = currentUser?.isMusician;

  const navigation = [
    {
      href: "/",
      label: "Home",
      icon: <Home size={20} />,
      active: pathname === "/",
    },
    {
      href: "/auth/search",
      label: "Search",
      icon: <Search size={20} />,
      active: pathname.startsWith("/auth/search"),
      condition: hasRole,
    },
    {
      href: "/community",
      label: "Community",
      icon: <Users size={20} />,
      active: pathname.startsWith("/community"),
    },
    {
      href: "/messages",
      label: "Messages",
      icon: <MessageCircle size={20} />,
      active: pathname.startsWith("/messages"),
      badge: unreadCount,
    },
    {
      href: "/gigs",
      label: "Gigs",
      icon: <Calendar size={20} />,
      active: pathname.startsWith("/gigs"),
      condition: hasRole,
    },
    {
      href: "/profile",
      label: "Profile",
      icon: <User size={20} />,
      active: pathname.startsWith("/profile"),
    },
  ].filter((item) => item.condition !== false);

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t bg-white dark:bg-gray-900 md:hidden",
        colors.border
      )}
    >
      <div className="flex justify-around items-center h-16 px-2">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 p-2 transition-colors relative",
              item.active
                ? "text-amber-600 dark:text-amber-400"
                : colors.textMuted
            )}
          >
            <div className="relative">
              {item.icon}
              {item.badge && item.badge > 0 && (
                <span
                  className={cn(
                    "absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center",
                    "animate-pulse"
                  )}
                >
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </div>
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}

        {/* Floating Action Button */}
        {hasRole && (
          <Link
            href={isMusician ? "/gigs" : "/create-gig"}
            className={cn(
              "absolute -top-6 left-1/2 transform -translate-x-1/2",
              "bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full p-3 shadow-lg",
              "hover:from-amber-600 hover:to-orange-600 transition-all duration-200"
            )}
          >
            <Plus size={20} />
          </Link>
        )}
      </div>
    </div>
  );
}
