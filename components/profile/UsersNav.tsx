// components/profile/UserNav.tsx
"use client";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { FaHome, FaUser } from "react-icons/fa";
import {
  User,
  Music,
  Video,
  Settings,
  Calendar,
  Star,
  BriefcaseIcon,
  Users2Icon,
  DollarSign,
  BuildingIcon,
  Lock,
} from "lucide-react";
import { IoHomeOutline } from "react-icons/io5";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getTierInfo, hasMinimumData } from "../pages/MobileSheet";

// Define the interface for navigation items
interface NavItem {
  href: string;
  icon: {
    active: React.ReactElement;
    inactive: React.ReactElement;
  };
  label: string;
  availableForTiers: string[];
  requiresCompleteProfile?: boolean;
  featured?: boolean;
}

const UserNav = () => {
  const { userId } = useAuth();
  const pathname = usePathname();
  const { colors } = useThemeColors();
  const { user } = useCurrentUser();

  const userTier = user?.tier || "free";
  const currentTier = getTierInfo(userTier);
  const isProfileComplete = hasMinimumData(user);
  const isMusician = user?.isMusician;
  const isBooker = user?.isBooker;
  const isClient = user?.isClient;

  // Free tier - basic profile links only
  const freeTierLinks: NavItem[] = [
    {
      href: `/profile`,
      icon: {
        active: <FaHome size={24} />,
        inactive: <IoHomeOutline size={24} />,
      },
      label: "Profile",
      availableForTiers: ["free", "pro", "premium", "elite"],
    },
    {
      href: `/profile/${userId}/user`,
      icon: {
        active: <FaUser size={22} />,
        inactive: <User size={22} />,
      },
      label: "Account",
      availableForTiers: ["free", "pro", "premium", "elite"],
    },
  ];

  // Pro tier - musician features
  const musicianProLinks: NavItem[] = [
    {
      href: `/profile/musician`,
      icon: {
        active: <Music size={22} className="fill-current" />,
        inactive: <Music size={22} />,
      },
      label: "Musician",
      availableForTiers: ["pro", "premium", "elite"],
      requiresCompleteProfile: true,
    },
    {
      href: `/profile/videos`,
      icon: {
        active: <Video size={22} className="fill-current" />,
        inactive: <Video size={22} />,
      },
      label: "Videos",
      availableForTiers: ["pro", "premium", "elite"],
      requiresCompleteProfile: true,
    },
  ];

  // Pro tier - client features
  const clientProLinks: NavItem[] = [
    {
      href: `/profile/bookings`,
      icon: {
        active: <Calendar size={22} className="fill-current" />,
        inactive: <Calendar size={22} />,
      },
      label: "Bookings",
      availableForTiers: ["pro", "premium", "elite"],
      requiresCompleteProfile: true,
    },
  ];

  // Premium tier - advanced features
  const clientPremiumLinks: NavItem[] = [
    {
      href: `/profile/favorites`,
      icon: {
        active: <Star size={22} className="fill-current" />,
        inactive: <Star size={22} />,
      },
      label: "Favorites",
      availableForTiers: ["premium", "elite"],
      featured: true,
    },
  ];

  // Pro tier - booker features
  const bookerProLinks: NavItem[] = [
    {
      href: `/profile/musician`,
      icon: {
        active: <Music size={22} className="fill-current" />,
        inactive: <Music size={22} />,
      },
      label: "Musician",
      availableForTiers: ["pro", "premium", "elite"],
      requiresCompleteProfile: true,
    },
  ];

  // Premium tier - booker advanced features
  const bookerPremiumLinks: NavItem[] = [
    {
      href: `/profile/coordination`,
      icon: {
        active: <BuildingIcon size={22} className="fill-current" />,
        inactive: <BuildingIcon size={22} />,
      },
      label: "Coordination",
      availableForTiers: ["premium", "elite"],
      featured: true,
    },
  ];

  // Premium tier - musician advanced features
  const musicianPremiumLinks: NavItem[] = [
    {
      href: `/profile/availability`,
      icon: {
        active: <Calendar size={22} className="fill-current" />,
        inactive: <Calendar size={22} />,
      },
      label: "Schedule",
      availableForTiers: ["premium", "elite"],
      featured: true,
    },
  ];

  // Settings link for all tiers
  const settingsLink: NavItem = {
    href: `/settings`,
    icon: {
      active: <Settings size={22} className="fill-current" />,
      inactive: <Settings size={22} />,
    },
    label: "Settings",
    availableForTiers: ["free", "pro", "premium", "elite"],
  };

  // Combine links based on user tier and role
  const getNavItems = (): NavItem[] => {
    let items = [...freeTierLinks];

    // Add pro features for pro and above tiers
    if (userTier === "pro" || userTier === "premium" || userTier === "elite") {
      if (isMusician) {
        items = [...items, ...musicianProLinks];
      }
      if (isClient) {
        items = [...items, ...clientProLinks];
      }
      if (isBooker) {
        items = [...items, ...bookerProLinks];
      }
    }

    // Add premium features for premium and elite tiers
    if (userTier === "premium" || userTier === "elite") {
      if (isMusician) {
        items = [...items, ...musicianPremiumLinks];
      }
      if (isClient) {
        items = [...items, ...clientPremiumLinks];
      }
      if (isBooker) {
        items = [...items, ...bookerPremiumLinks];
      }
    }

    // Add settings link at the end
    items.push(settingsLink);

    return items;
  };

  const navItems = getNavItems();

  // Check if user can access a link
  const canAccessLink = (link: NavItem) => {
    if (!link.availableForTiers) return true;
    return link.availableForTiers.includes(userTier);
  };

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
          const canAccess = canAccessLink(item);
          const requiresCompleteProfile = item.requiresCompleteProfile;
          const isBlockedByProfile =
            requiresCompleteProfile && !isProfileComplete;
          const isFeatured = item.featured;

          return (
            <div
              key={item.href}
              className={cn(
                "flex-1 flex justify-center min-w-[60px]",
                (!canAccess || isBlockedByProfile) && "opacity-60"
              )}
            >
              {!canAccess || isBlockedByProfile ? (
                // Inaccessible feature
                <div
                  className="flex flex-col items-center justify-center w-full py-2 relative cursor-not-allowed"
                  title={
                    !canAccess
                      ? `Upgrade to ${userTier === "free" ? "Pro" : "Premium"} to access this feature`
                      : "Complete your profile to access this feature"
                  }
                >
                  <div className="relative">
                    <div className="scale-100 opacity-60">
                      {item.icon.inactive}
                    </div>
                    <Lock className="absolute -top-1 -right-1 w-3 h-3 text-amber-500" />
                  </div>
                  <span className="text-xs mt-1 text-gray-400 text-center leading-tight max-w-[60px] truncate opacity-60">
                    {item.label}
                  </span>
                </div>
              ) : (
                // Accessible link
                <Link href={item.href} className="w-full flex justify-center">
                  <div
                    className={cn(
                      "flex flex-col items-center justify-center w-full py-2 transition-all duration-200 relative",
                      active
                        ? "text-yellow-400"
                        : "text-gray-400 hover:text-yellow-400",
                      isFeatured && "text-purple-400"
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
                      {isFeatured && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full" />
                      )}
                    </div>

                    <span
                      className={cn(
                        "text-xs mt-1 transition-colors duration-200 text-center leading-tight",
                        active
                          ? "text-yellow-400 font-medium"
                          : isFeatured
                            ? "text-purple-400"
                            : "text-gray-400",
                        "max-w-[60px] truncate"
                      )}
                    >
                      {item.label}
                    </span>

                    {/* Active indicator dot */}
                    {active && (
                      <div
                        className={cn(
                          "w-1 h-1 rounded-full mt-1",
                          isFeatured ? "bg-purple-400" : "bg-yellow-400"
                        )}
                      />
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
