"use client";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { FaHome, FaUser, FaChartBar, FaHistory, FaMusic } from "react-icons/fa";
import { User, BarChart3, History, Music } from "lucide-react";
import { IoHomeOutline } from "react-icons/io5";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const UserNav = () => {
  const { userId } = useAuth();
  const pathname = usePathname();
  const { colors } = useThemeColors();

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
    },
    {
      href: `/profile/musician`,
      icon: {
        active: <FaMusic size={22} />,
        inactive: <Music size={22} />,
      },
      label: "Musician",
      condition: true, // You can dynamically set this based on user role
    },
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
      <div className="flex justify-around items-center w-full h-[70px] px-2 mx-auto">
        {navItems.map((item) => {
          if (item.condition === false) return null;

          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex justify-center"
            >
              <div
                className={cn(
                  "flex flex-col items-center justify-center w-full py-2 transition-all duration-200",
                  active
                    ? "text-yellow-400"
                    : "text-gray-400 hover:text-yellow-400"
                )}
              >
                <div
                  className={cn(
                    "transition-transform duration-200",
                    active ? "scale-110" : "scale-100"
                  )}
                >
                  {active ? item.icon.active : item.icon.inactive}
                </div>
                <span
                  className={cn(
                    "text-xs mt-1 transition-colors duration-200",
                    active ? "text-yellow-400 font-medium" : "text-gray-400"
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
          );
        })}
      </div>
    </div>
  );
};

export default UserNav;
