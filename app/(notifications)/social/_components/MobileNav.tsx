"use client";

import { useState } from "react";
import { useThemeColors, useThemeToggle } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import {
  Menu,
  Users,
  UserPlus,
  UserCheck,
  Bell,
  Search,
  Moon,
  Sun,
  Settings,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface MobileNavProps {
  onMenuClick: () => void;
}

// Make sure this is a named export
export function MobileNav({ onMenuClick }: MobileNavProps) {
  const { colors, isDarkMode } = useThemeColors();
  const { toggleDarkMode, isDarkMode: darkMode } = useThemeToggle();
  const pathname = usePathname();
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();

  // Get pending requests count for badge
  const pendingRequests = useQuery(
    api.controllers.user.getPendingFollowRequests,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  const pendingCount = pendingRequests?.length || 0;

  const navItems = [
    {
      name: "Followers",
      href: "/social/followers",
      icon: Users,
      badge: null,
    },
    {
      name: "Following",
      href: "/social/following",
      icon: UserCheck,
      badge: null,
    },
    {
      name: "Requests",
      href: "/social/follow-requests",
      icon: UserPlus,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      name: "Discover",
      href: "/social/discover",
      icon: Search,
      badge: null,
    },
  ];

  return (
    <div
      className={cn(
        "lg:hidden fixed top-0 left-0 right-0 z-50 border-b w-[82%]",
        colors.navBackground,
        colors.navBorder
      )}
    >
      <div className="flex items-center justify-between p-4">
        {/* Left side - Menu button and title */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className={cn("rounded-xl", colors.navHover)}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2">
            <div
              className={cn(
                "p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600"
              )}
            >
              <Users className="w-4 h-4 text-white" />
            </div>
            <span className={cn("font-semibold text-lg", colors.navText)}>
              Social
            </span>
          </div>
        </div>

        {/* Right side - Theme toggle and notifications */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className={cn("rounded-xl", colors.navHover)}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          {/* Notifications/Requests Badge */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/social/follow-requests")}
            className={cn("rounded-xl relative", colors.navHover)}
          >
            <Bell className="w-4 h-4" />
            {pendingCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                {pendingCount > 9 ? "9+" : pendingCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className={cn("border-t px-4 py-2", colors.navBorder)}>
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Button
                key={item.name}
                variant="ghost"
                size="sm"
                onClick={() => router.push(item.href)}
                className={cn(
                  "flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-xl relative",
                  isActive
                    ? cn(
                        "bg-blue-500/10 text-blue-600 border border-blue-500/20",
                        isDarkMode && "text-blue-400 border-blue-400/20"
                      )
                    : colors.navHover
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium">{item.name}</span>

                {item.badge && item.badge > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Add default export if needed
export default MobileNav;
