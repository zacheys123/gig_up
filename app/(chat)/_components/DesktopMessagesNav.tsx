// components/chat/DesktopMessagesNav.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  Home,
  Search,
  Users,
  Calendar,
  MessageCircle,
  Plus,
  Settings,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUnreadCount } from "@/hooks/useUnreadCount";

export function DesktopMessagesNav() {
  const { isSignedIn, user: clerkUser } = useUser();
  const { user: currentUser } = useCurrentUser();
  const { colors } = useThemeColors();
  const pathname = usePathname();
  const unreadCount = useUnreadCount();

  const hasRole = currentUser?.isClient || currentUser?.isMusician;
  const isMusician = currentUser?.isMusician;

  // Minimal navigation for messages page
  const navigation = [
    {
      href: "/",
      label: "Home",
      icon: <Home size={22} />,
      active: pathname === "/",
    },
    {
      href: "/auth/search",
      label: "Search",
      icon: <Search size={22} />,
      active: pathname.startsWith("/auth/search"),
      condition: isSignedIn && hasRole,
    },
    {
      href: "/community",
      label: "Community",
      icon: <Users size={22} />,
      active: pathname.startsWith("/community"),
      condition: isSignedIn,
    },
    {
      href: "/messages",
      label: "Messages",
      icon: <MessageCircle size={22} />,
      active: pathname.startsWith("/messages"),
      badge: unreadCount,
    },
    {
      href: "/gigs",
      label: isMusician ? "Find Gigs" : "Post Gig",
      icon: <Calendar size={22} />,
      active: pathname.startsWith("/gigs"),
      condition: hasRole,
    },
  ].filter((item) => item.condition !== false);

  return (
    <div
      className={cn(
        "w-20 lg:w-64 h-screen flex flex-col border-r transition-all duration-300",
        colors.border,
        colors.background,
        "hidden md:flex" // Only show on desktop
      )}
    >
      {/* Header - Minimal Logo */}
      <div className={cn("p-4 border-b", colors.border)}>
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <span
            className={cn("text-xl font-bold hidden lg:block", colors.text)}
          >
            GigUp
          </span>
        </Link>
      </div>

      {/* Create Button - Collapsed on small screens */}
      {isSignedIn && hasRole && (
        <div className="p-4">
          <Link href={isMusician ? "/gigs" : "/create-gig"} className="block">
            <Button
              className={cn(
                "w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
                "text-white flex items-center gap-3 justify-center lg:justify-start p-2 lg:px-4 lg:py-2",
                "shadow-md hover:shadow-lg transition-all duration-200"
              )}
            >
              <Plus size={20} />
              <span className="hidden lg:block font-semibold">
                {isMusician ? "Find Gigs" : "Post Gig"}
              </span>
            </Button>
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 lg:p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 group",
              item.active
                ? cn(
                    "bg-gradient-to-r from-amber-500/20 to-orange-500/10",
                    "text-amber-600 dark:text-amber-400"
                  )
                : cn(
                    colors.hoverBg,
                    colors.textMuted,
                    "hover:text-amber-600 dark:hover:text-amber-400"
                  )
            )}
          >
            <div className="relative flex-shrink-0">
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
            <span
              className={cn(
                "font-medium hidden lg:block",
                item.active ? "text-amber-600 dark:text-amber-400" : colors.text
              )}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className={cn("p-4 border-t", colors.border)}>
        {isSignedIn ? (
          <div className="flex items-center gap-3">
            <div className="hover:scale-105 transition-transform duration-200 flex-shrink-0">
              <UserButton />
            </div>
            <div className="hidden lg:block flex-1 min-w-0">
              <p className={cn("font-medium text-sm truncate", colors.text)}>
                {clerkUser?.firstName || clerkUser?.username}
              </p>
              <p className={cn("text-xs truncate", colors.textMuted)}>
                {currentUser?.isMusician ? "Artist" : "Client"}
              </p>
            </div>
            <Link
              href="/settings"
              className={cn(
                "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hidden lg:block",
                colors.textMuted
              )}
            >
              <Settings size={18} />
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            <Link
              href="/sign-in"
              className={cn(
                "flex items-center justify-center gap-2 w-full p-2 rounded-lg transition-all duration-200 text-sm",
                colors.hoverBg,
                colors.text,
                "hover:text-amber-600 dark:hover:text-amber-400"
              )}
            >
              <span className="hidden lg:inline">Sign In</span>
              <span className="lg:hidden">Login</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
