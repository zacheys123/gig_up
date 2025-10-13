// components/profile/DesktopUserNav.tsx
"use client";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import {
  Home,
  User,
  BarChart3,
  History,
  Music,
  Settings,
  Video,
  MessageCircle,
  Bell,
  Star,
  Calendar,
  DollarSign,
  Users,
  Globe,
} from "lucide-react";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import DesktopUserNavSkeleton from "./DesktopProfileSkeleton";
import {
  calculateProfileCompletion,
  getMissingFields,
  getProfileCompletionMessage,
} from "@/utils";

const DesktopUserNav = () => {
  const { userId } = useAuth();
  const pathname = usePathname();
  const { colors, isDarkMode } = useThemeColors();
  const { user, isLoading } = useCurrentUser();

  const profileCompletion = calculateProfileCompletion(user);
  const completionMessage = getProfileCompletionMessage(profileCompletion);
  const missingFields = getMissingFields(user);
  // Show skeleton while loading
  if (isLoading || !user) {
    return <DesktopUserNavSkeleton />;
  }

  const isMusician = user?.isMusician;

  const navSections = [
    {
      title: "Profile",
      items: [
        {
          href: `/profile`,
          icon: <Home size={20} />,
          label: "Overview",
          description: "Profile dashboard",
        },
        {
          href: `/profile/${userId}/user`,
          icon: <User size={20} />,
          label: "Account",
          description: "Personal information",
        },
        {
          href: `/profile/stats`,
          icon: <BarChart3 size={20} />,
          label: "Statistics",
          description: "Performance insights",
        },
        {
          href: `/profile/activity`,
          icon: <History size={20} />,
          label: "Activity",
          description: "Recent actions",
        },
      ],
    },
    {
      title: "Features",
      items: [
        {
          href: `/profile/messages`,
          icon: <MessageCircle size={20} />,
          label: "Messages",
          description: "Chat conversations",
          badge: 3,
        },
        {
          href: `/profile/notifications`,
          icon: <Bell size={20} />,
          label: "Notifications",
          description: "Alerts & updates",
        },
        ...(isMusician
          ? [
              {
                href: `/profile/musician`,
                icon: <Music size={20} />,
                label: "Musician Profile",
                description: "Performance settings",
              },
            ]
          : []),
      ],
    },
    {
      title: "Tools",
      items: [
        ...(isMusician
          ? [
              {
                href: `/profile/videos`,
                icon: <Video size={20} />,
                label: "Videos",
                description: "Performance portfolio",
              },
              {
                href: `/profile/rates`,
                icon: <DollarSign size={20} />,
                label: "Rates",
                description: "Pricing & fees",
              },
              {
                href: `/profile/availability`,
                icon: <Calendar size={20} />,
                label: "Availability",
                description: "Your schedule",
              },
            ]
          : [
              {
                href: `/profile/bookings`,
                icon: <Calendar size={20} />,
                label: "Bookings",
                description: "Your events",
              },
              {
                href: `/profile/favorites`,
                icon: <Star size={20} />,
                label: "Favorites",
                description: "Saved musicians",
              },
            ]),
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === "/profile") {
      return pathname === "/profile";
    }
    return pathname.startsWith(href);
  };

  return (
    <div
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 border-r backdrop-blur-lg",
        colors.card,
        colors.border,
        "hidden lg:block" // Only show on desktop
      )}
    >
      <div className="h-full overflow-y-auto scrollbar-thin">
        {/* User Header */}
        <div className={cn("p-6 border-b", colors.border)}>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                "bg-gradient-to-br from-amber-500 to-orange-500"
              )}
            >
              <User className="text-white" size={24} />
            </div>
            <div>
              <h2 className={cn("text-lg font-bold", colors.text)}>
                My Profile
              </h2>
              <p className={cn("text-sm", colors.textMuted)}>
                {isMusician ? "Musician Account" : "Client Account"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="p-4 space-y-6">
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-3">
              <h3
                className={cn(
                  "text-xs font-semibold uppercase tracking-wider px-3",
                  colors.textMuted
                )}
              >
                {section.title}
              </h3>

              <div className="space-y-1">
                {section.items.map((item, itemIndex) => {
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group",
                        "hover:scale-[1.02] hover:shadow-sm",
                        active
                          ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          : cn(
                              "hover:bg-gray-100 dark:hover:bg-gray-800",
                              colors.text
                            )
                      )}
                    >
                      <div
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          active
                            ? "bg-amber-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-amber-500/10 group-hover:text-amber-600"
                        )}
                      >
                        {item.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "font-medium text-sm",
                              active ? "text-amber-600" : colors.text
                            )}
                          >
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p
                          className={cn(
                            "text-xs truncate",
                            active ? "text-amber-500/80" : colors.textMuted
                          )}
                        >
                          {item.description}
                        </p>
                      </div>

                      {/* Active indicator */}
                      {active && (
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className={cn("p-6 border-t mt-auto", colors.border)}>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={cn("text-sm", colors.textMuted)}>
                Profile Complete
              </span>
              <span className={cn("text-sm font-medium", colors.text)}>
                {profileCompletion}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <p className={cn("text-xs", colors.textMuted)}>
              {completionMessage}
            </p>

            {/* Show missing fields if profile is incomplete */}
            {missingFields.length > 0 && profileCompletion < 100 && (
              <div className="mt-2">
                <p className={cn("text-xs font-medium mb-1", colors.text)}>
                  Missing:
                </p>
                <div className="flex flex-wrap gap-1">
                  {missingFields.slice(0, 3).map((field, index) => (
                    <span
                      key={index}
                      className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200"
                      )}
                    >
                      {field}
                    </span>
                  ))}
                  {missingFields.length > 3 && (
                    <span className={cn("text-xs px-2 py-1", colors.textMuted)}>
                      +{missingFields.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopUserNav;
