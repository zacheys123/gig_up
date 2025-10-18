"use client";

import { useThemeColors, useThemeToggle } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import {
  Users,
  UserPlus,
  UserCheck,
  Search,
  User,
  Settings,
  X,
  Moon,
  Sun,
  Monitor,
  Bell,
  Crown,
  Music,
  Building,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Make sure this is a named export
export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { colors, isDarkMode } = useThemeColors();
  const {
    toggleDarkMode,
    setTheme,
    isDarkMode: darkMode,
    currentTheme,
  } = useThemeToggle();
  const pathname = usePathname();
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();

  // Get pending requests count for badge
  const pendingRequests = useQuery(
    api.controllers.user.getPendingFollowRequests,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  const pendingCount = pendingRequests?.length || 0;

  const mainNavItems = [
    {
      name: "Discover Users",
      href: "/social/discover",
      icon: Search,
      description: "Find new people to follow",
      badge: null,
    },
    {
      name: "My Followers",
      href: "/social/followers",
      icon: Users,
      description: "People who follow you",
      badge: null,
    },
    {
      name: "I'm Following",
      href: "/social/following",
      icon: UserCheck,
      description: "People you follow",
      badge: null,
    },
    {
      name: "Follow Requests",
      href: "/social/follow-requests",
      icon: UserPlus,
      description: "Manage incoming requests",
      badge: pendingCount > 0 ? pendingCount : null,
    },
  ];

  const secondaryNavItems = [
    {
      name: "My Profile",
      href: "/profile",
      icon: User,
      description: "View your profile",
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      description: "Account settings",
    },
  ];

  const NavItem = ({
    item,
    isActive,
  }: {
    item: (typeof mainNavItems)[0];
    isActive: boolean;
  }) => {
    const Icon = item.icon;

    return (
      <Button
        variant="ghost"
        onClick={() => {
          router.push(item.href);
          onClose();
        }}
        className={cn(
          "w-full justify-start gap-3 h-auto py-3 px-4 rounded-xl transition-all duration-200 relative",
          isActive
            ? cn(
                "bg-blue-500/10 text-blue-600 border border-blue-500/20",
                isDarkMode && "text-blue-400 border-blue-400/20 bg-blue-500/10"
              )
            : cn("hover:bg-opacity-50", colors.hoverBg)
        )}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="font-medium">{item.name}</span>
            {item.badge && item.badge > 0 && (
              <Badge className="bg-red-500 text-white text-xs h-5 px-1.5">
                {item.badge}
              </Badge>
            )}
          </div>
          <p className={cn("text-sm mt-0.5", colors.textMuted)}>
            {item.description}
          </p>
        </div>
      </Button>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 border-r z-30",
          colors.navBackground,
          colors.navBorder
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b">
          <div
            className={cn(
              "p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600"
            )}
          >
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className={cn("font-bold text-lg", colors.navText)}>
              Social Hub
            </h2>
            <p className={cn("text-sm", colors.textMuted)}>
              Connect with others
            </p>
          </div>
        </div>

        {/* User Info */}
        {currentUser && (
          <div className={cn("p-4 border-b", colors.border)}>
            <div className="flex items-center gap-3">
              {currentUser.picture ? (
                <img
                  src={currentUser.picture}
                  alt={currentUser.firstname || "User"}
                  className="w-10 h-10 rounded-xl object-cover"
                />
              ) : (
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    colors.secondaryBackground
                  )}
                >
                  <User className="w-5 h-5 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className={cn("font-medium text-sm truncate", colors.text)}>
                  {currentUser.firstname} {currentUser.lastname}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      currentUser.isMusician
                        ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                        : "bg-green-500/10 text-green-600 border-green-500/20"
                    )}
                  >
                    {currentUser.isMusician ? (
                      <Music className="w-3 h-3 mr-1" />
                    ) : (
                      <Building className="w-3 h-3 mr-1" />
                    )}
                    {currentUser.isMusician ? "Musician" : "Client"}
                  </Badge>
                  {currentUser.tier === "pro" && (
                    <Crown className="w-3 h-3 text-amber-500" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-2">
            {mainNavItems.map((item) => (
              <NavItem
                key={item.name}
                item={item}
                isActive={pathname === item.href}
              />
            ))}
          </div>
        </div>

        {/* Footer with Theme Toggle and Settings */}
        <div className={cn("p-4 border-t space-y-3", colors.border)}>
          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-auto py-3 rounded-xl",
                  colors.hoverBg
                )}
              >
                {darkMode ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
                <div className="flex-1 text-left">
                  <span className="font-medium">Theme</span>
                  <p className={cn("text-sm", colors.textMuted)}>
                    {currentTheme === "system" && "System"}
                    {currentTheme === "light" && "Light"}
                    {currentTheme === "dark" && "Dark"}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="w-4 h-4 mr-2" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="w-4 h-4 mr-2" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="w-4 h-4 mr-2" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Secondary Navigation */}
          <div className="space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Button
                  key={item.name}
                  variant="ghost"
                  onClick={() => {
                    router.push(item.href);
                    onClose();
                  }}
                  className={cn(
                    "w-full justify-start gap-3 h-auto py-2 rounded-xl text-sm",
                    isActive
                      ? cn(
                          "bg-blue-500/10 text-blue-600",
                          isDarkMode && "text-blue-400"
                        )
                      : colors.hoverBg
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "lg:hidden fixed left-0 top-0 h-screen w-80 max-w-[calc(100vw-80px)] border-r z-50 transform transition-transform duration-300 ease-in-out",
          colors.navBackground,
          colors.navBorder,
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600"
              )}
            >
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={cn("font-bold text-lg", colors.navText)}>
                Social Hub
              </h2>
              <p className={cn("text-sm", colors.textMuted)}>
                Connect with others
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-xl"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Mobile Navigation Content */}
        <div className="h-full overflow-y-auto">
          {/* User Info */}
          {currentUser && (
            <div className={cn("p-4 border-b", colors.border)}>
              <div className="flex items-center gap-3">
                {currentUser.picture ? (
                  <img
                    src={currentUser.picture}
                    alt={currentUser.firstname || "User"}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                ) : (
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      colors.secondaryBackground
                    )}
                  >
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className={cn("font-semibold truncate", colors.text)}>
                    {currentUser.firstname} {currentUser.lastname}
                  </p>
                  <p className={cn("text-sm truncate", colors.textMuted)}>
                    @{currentUser.username}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        currentUser.isMusician
                          ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                          : "bg-green-500/10 text-green-600 border-green-500/20"
                      )}
                    >
                      {currentUser.isMusician ? "Musician" : "Client"}
                    </Badge>
                    {currentUser.tier === "pro" && (
                      <Crown className="w-3 h-3 text-amber-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <div className="p-4 space-y-2">
            {mainNavItems.map((item) => (
              <NavItem
                key={item.name}
                item={item}
                isActive={pathname === item.href}
              />
            ))}
          </div>

          {/* Theme Toggle for Mobile */}
          <div className={cn("p-4 border-t", colors.border)}>
            <Button
              variant="outline"
              onClick={toggleDarkMode}
              className={cn(
                "w-full justify-center gap-2 rounded-xl",
                colors.hoverBg
              )}
            >
              {darkMode ? (
                <>
                  <Sun className="w-4 h-4" />
                  Switch to Light
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  Switch to Dark
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// Add default export if needed
export default Sidebar;
