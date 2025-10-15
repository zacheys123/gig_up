"use client";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { FaHome, FaUser, FaChartBar, FaHistory, FaMusic } from "react-icons/fa";
import {
  User,
  BarChart3,
  History,
  Music,
  Bell,
  Video,
  DollarSign,
  Calendar,
  Star,
} from "lucide-react";
import { IoHomeOutline } from "react-icons/io5";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const UserNav = () => {
  const { userId } = useAuth();
  const pathname = usePathname();
  const { colors } = useThemeColors();
  const { user } = useCurrentUser();

  const isMusician = user?.isMusician;
  const isProTier = user?.tier === "pro";

  const navItems = [
    {
      href: `/profile`,
      icon: {
        active: <FaHome size={24} />,
        inactive: <IoHomeOutline size={24} />,
      },
      label: "Profile",
    },
    {
      href: `/profile/${userId}/user`,
      icon: {
        active: <FaUser size={22} />,
        inactive: <User size={22} />,
      },
      label: "Account",
    },
    {
      href: `/profile/stats`,
      icon: {
        active: <FaChartBar size={22} />,
        inactive: <BarChart3 size={22} />,
      },
      label: "Stats",
    },
    {
      href: `/profile/activity`,
      icon: {
        active: <FaHistory size={22} />,
        inactive: <History size={22} />,
      },
      label: "Activity",
      pro: true, // Added pro tier
    },

    // Musician-specific items
    ...(isMusician
      ? [
          {
            href: `/profile/musician`,
            icon: {
              active: <FaMusic size={22} />,
              inactive: <Music size={22} />,
            },
            label: "Musician",
          },
          {
            href: `/profile/videos`,
            icon: {
              active: <Video size={22} className="fill-current" />,
              inactive: <Video size={22} />,
            },
            label: "Videos",
          },
          {
            href: `/profile/rates`,
            icon: {
              active: <DollarSign size={22} className="fill-current" />,
              inactive: <DollarSign size={22} />,
            },
            label: "Rates",
          },
          {
            href: `/profile/availability`,
            icon: {
              active: <Calendar size={22} className="fill-current" />,
              inactive: <Calendar size={22} />,
            },
            label: "Schedule",
            pro: true, // Added pro tier
          },
        ]
      : [
          // Client-specific items
          {
            href: `/profile/bookings`,
            icon: {
              active: <Calendar size={22} className="fill-current" />,
              inactive: <Calendar size={22} />,
            },
            label: "Bookings",
          },
          {
            href: `/profile/favorites`,
            icon: {
              active: <Star size={22} className="fill-current" />,
              inactive: <Star size={22} />,
            },
            label: "Favorites",
            pro: true, // Added pro tier
          },
        ]),
  ];

  const isActive = (href: string) => {
    if (href === "/profile") {
      return pathname === "/profile";
    }
    return pathname.startsWith(href);
  };

  const inactiveLink = cn(
    "text-gray-400 hover:text-yellow-400 transition-colors duration-200 flex flex-col items-center",
    colors.textMuted
  );

  const activeLink = cn(
    "text-yellow-400 transition duration-200 flex flex-col items-center",
    colors.border
  );

  return (
    <div
      className={cn(
        "fixed bottom-0 w-full z-50 border-t backdrop-blur-lg",
        colors.card,
        colors.border
      )}
    >
      <div className="flex justify-around items-center w-full h-[70px] px-2 mx-auto overflow-x-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const isProFeature = item.pro && !isProTier;

          return (
            <div
              key={item.href}
              className={cn(
                "flex-1 flex justify-center min-w-[60px]",
                isProFeature && "opacity-60"
              )}
            >
              {isProFeature ? (
                // Pro feature - visible but not clickable
                <div
                  className="flex flex-col items-center justify-center w-full py-2 relative cursor-not-allowed"
                  title="Upgrade to Pro to access this feature"
                >
                  <div className="relative">
                    <div className="scale-100 opacity-60">
                      {item.icon.inactive}
                    </div>

                    {/* Pro badge */}
                    <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center text-[8px]">
                      P
                    </span>
                  </div>

                  <span className="text-xs mt-1 text-gray-400 text-center leading-tight max-w-[60px] truncate opacity-60">
                    {item.label}
                  </span>
                </div>
              ) : (
                // Regular link - clickable
                <Link href={item.href} className="w-full flex justify-center">
                  <div
                    className={cn(
                      "flex flex-col items-center justify-center w-full py-2 transition-all duration-200 relative",
                      active
                        ? "text-yellow-400"
                        : "text-gray-400 hover:text-yellow-400"
                    )}
                  >
                    <div className="relative">
                      <div
                        className={cn(
                          "transition-transform duration-200",
                          active ? "scale-110" : "scale-100"
                        )}
                      >
                        {active ? item.icon.active : item.icon.inactive}
                      </div>

                      {item.pro && isProTier && (
                        <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center text-[8px]">
                          P
                        </span>
                      )}
                    </div>

                    <span
                      className={cn(
                        "text-xs mt-1 transition-colors duration-200 text-center leading-tight",
                        active
                          ? "text-yellow-400 font-medium"
                          : "text-gray-400",
                        "max-w-[60px] truncate"
                      )}
                    >
                      {item.label}
                    </span>

                    {/* Active indicator dot */}
                    {active && (
                      <div className="w-1 h-1 bg-yellow-400 rounded-full mt-1" />
                    )}
                  </div>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserNav;
