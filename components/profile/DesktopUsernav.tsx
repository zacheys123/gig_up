// components/profile/DesktopUserNav.tsx
"use client";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import {
  Home,
  User,
  BarChart3,
  Music,
  Settings,
  Video,
  Star,
  Calendar,
  DollarSign,
  BriefcaseIcon,
  Users2Icon,
  BuildingIcon,
  Lock,
  Sparkles,
} from "lucide-react";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import DesktopUserNavSkeleton from "../skeletons/DesktopProfileSkeleton";
import {
  calculateProfileCompletion,
  getMissingFields,
  getProfileCompletionMessage,
} from "@/utils";
import { getTierInfo, hasMinimumData } from "../pages/MobileSheet";

// Define the interface for navigation items
interface NavItem {
  href: string;
  icon: React.ReactElement;
  label: string;
  description: string;
  availableForTiers: string[];
  requiresCompleteProfile?: boolean;
  featured?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

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
    return <DesktopUserNavSkeleton colors={colors} isDarkMode={isDarkMode} />;
  }

  const userTier = user?.tier || "free";
  const currentTier = getTierInfo(userTier);
  const TierIcon = currentTier.icon;
  const isProfileComplete = hasMinimumData(user);
  const isMusician = user?.isMusician;
  const isBooker = user?.isBooker;
  const isClient = user?.isClient;

  const getRoleLabel = () => {
    if (isBooker) return "Booker Account";
    if (isMusician) return "Musician Account";
    if (isClient) return "Client Account";
    return "User Account";
  };

  // Free tier - basic profile sections
  const freeTierSections: NavSection[] = [
    {
      title: "Profile",
      items: [
        {
          href: `/profile`,
          icon: <Home size={20} />,
          label: "Overview",
          description: "Profile dashboard",
          availableForTiers: ["free", "pro", "premium", "elite"],
        },
        {
          href: `/profile/${userId}/user`,
          icon: <User size={20} />,
          label: "Account",
          description: "Personal information",
          availableForTiers: ["free", "pro", "premium", "elite"],
        },
      ],
    },
  ];

  // Pro tier - basic analytics
  const proTierSections: NavSection[] = [
    {
      title: "Analytics",
      items: [
        {
          href: `/profile/stats`,
          icon: <BarChart3 size={20} />,
          label: "Statistics",
          description: "Performance insights",
          availableForTiers: ["pro", "premium", "elite"],
          requiresCompleteProfile: true,
        },
      ],
    },
  ];

  // Role-specific pro features
  const musicianProLinks: NavItem[] = [
    {
      href: `/profile/musician`,
      icon: <Music size={20} />,
      label: "Musician Profile",
      description: "Performance settings",
      availableForTiers: ["pro", "premium", "elite"],
      requiresCompleteProfile: true,
    },
    {
      href: `/profile/videos`,
      icon: <Video size={20} />,
      label: "Videos",
      description: "Performance portfolio",
      availableForTiers: ["pro", "premium", "elite"],
      requiresCompleteProfile: true,
    },
  ];

  const clientProLinks: NavItem[] = [
    {
      href: `/profile/bookings`,
      icon: <Calendar size={20} />,
      label: "Bookings",
      description: "Your events",
      availableForTiers: ["pro", "premium", "elite"],
      requiresCompleteProfile: true,
    },
  ];

  const bookerProLinks: NavItem[] = [
    {
      href: `/profile/booker`,
      icon: <BriefcaseIcon size={20} />,
      label: "Booker Profile",
      description: "Booking management",
      availableForTiers: ["pro", "premium", "elite"],
      requiresCompleteProfile: true,
    },
    {
      href: `/profile/artists`,
      icon: <Users2Icon size={20} />,
      label: "My Artists",
      description: "Manage your artists",
      availableForTiers: ["pro", "premium", "elite"],
      requiresCompleteProfile: true,
    },
    {
      href: `/profile/musician`,
      icon: <Music size={20} />,
      label: "Musician Profile",
      description: "Performance settings",
      availableForTiers: ["pro", "premium", "elite"],
      requiresCompleteProfile: true,
    },
    {
      href: `/profile/commissions`,
      icon: <DollarSign size={20} />,
      label: "Commissions",
      description: "Booking earnings",
      availableForTiers: ["pro", "premium", "elite"],
      requiresCompleteProfile: true,
    },
  ];

  // Premium tier features
  const premiumTierSections: NavSection[] = [
    {
      title: "Premium Features",
      items: [
        // Musician premium features
        ...(isMusician
          ? [
              {
                href: `/profile/availability`,
                icon: <Calendar size={20} />,
                label: "Availability",
                description: "Your schedule",
                availableForTiers: ["premium", "elite"],
                featured: true,
              },
            ]
          : []),
        // Client premium features
        ...(isClient
          ? [
              {
                href: `/profile/favorites`,
                icon: <Star size={20} />,
                label: "Favorites",
                description: "Saved musicians",
                availableForTiers: ["premium", "elite"],
                featured: true,
              },
            ]
          : []),
        // Booker premium features
        ...(isBooker
          ? [
              {
                href: `/profile/coordination`,
                icon: <BuildingIcon size={20} />,
                label: "Coordination",
                description: "Event coordination tools",
                availableForTiers: ["premium", "elite"],
                featured: true,
              },
            ]
          : []),
      ],
    },
  ];

  // Settings for all tiers
  const settingsSection: NavSection = {
    title: "Settings",
    items: [
      {
        href: `/settings`,
        icon: <Settings size={20} />,
        label: "Settings",
        description: "Account preferences",
        availableForTiers: ["free", "pro", "premium", "elite"],
      },
    ],
  };

  // Combine sections based on user tier
  const getNavSections = (): NavSection[] => {
    let sections = [...freeTierSections];

    // Add pro features for pro and above tiers
    if (userTier === "pro" || userTier === "premium" || userTier === "elite") {
      sections = [...sections, ...proTierSections];

      // Add role-specific sections
      if (isMusician) {
        sections.push({
          title: "Musician Tools",
          items: musicianProLinks,
        });
      }
      if (isClient) {
        sections.push({
          title: "Client Tools",
          items: clientProLinks,
        });
      }
      if (isBooker) {
        sections.push({
          title: "Booker Tools",
          items: bookerProLinks,
        });
      }
    }

    // Add premium features for premium and elite tiers
    if (userTier === "premium" || userTier === "elite") {
      sections = [...sections, ...premiumTierSections];
    }

    // Add settings at the end
    sections.push(settingsSection);

    return sections;
  };

  const navSections = getNavSections();

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

  return (
    <div
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 border-r backdrop-blur-lg",
        colors.card,
        colors.border,
        "hidden lg:block"
      )}
    >
      <div className="h-full overflow-y-auto scrollbar-thin">
        {/* User Header */}
        <div className={cn("p-6 border-b", colors.border)}>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                currentTier.bg
              )}
            >
              <TierIcon className="text-white" size={24} />
            </div>
            <div>
              <h2 className={cn("text-lg font-bold", colors.text)}>
                My Profile
              </h2>
              <div className="flex items-center gap-2">
                <p className={cn("text-sm", colors.textMuted)}>
                  {getRoleLabel()}
                </p>
                <div
                  className={cn(
                    "px-2 py-1 text-xs rounded-full font-semibold",
                    currentTier.badge
                  )}
                >
                  {currentTier.label}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Completion */}
          <div className="mt-4 space-y-2">
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
            {!isProfileComplete && profileCompletion < 100 && (
              <p className={cn("text-xs", colors.textMuted)}>
                Complete profile for full access
              </p>
            )}
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="p-4 space-y-6">
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-3">
              <h3
                className={cn(
                  "text-md font-semibold uppercase tracking-wider px-3",
                  colors.textMuted
                )}
              >
                {section.title}
              </h3>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  const canAccess = canAccessLink(item);
                  const requiresCompleteProfile = item.requiresCompleteProfile;
                  const isBlockedByProfile =
                    requiresCompleteProfile && !isProfileComplete;
                  const isFeatured = item.featured;

                  const linkContent = (
                    <div
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group",
                        "hover:scale-[1.02] hover:shadow-sm",
                        (!canAccess || isBlockedByProfile) &&
                          "cursor-not-allowed opacity-60",
                        active
                          ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          : cn(
                              "hover:bg-gray-100 dark:hover:bg-gray-800",
                              "text-gray-700 dark:text-gray-300",
                              "hover:text-amber-600 dark:hover:text-amber-400"
                            ),
                        isFeatured &&
                          "ring-2 ring-purple-200 dark:ring-purple-800"
                      )}
                    >
                      <div
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          active
                            ? "bg-amber-500 text-white"
                            : !canAccess || isBlockedByProfile
                              ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                              : isFeatured
                                ? "bg-purple-500/10 text-purple-600"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-amber-500/10 group-hover:text-amber-600"
                        )}
                      >
                        {item.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "font-medium text-sm transition-colors duration-200",
                              active
                                ? "text-amber-600"
                                : !canAccess || isBlockedByProfile
                                  ? "text-gray-500 dark:text-gray-400"
                                  : isFeatured
                                    ? "text-purple-700 dark:text-purple-300"
                                    : "text-gray-700 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-400"
                            )}
                          >
                            {item.label}
                          </span>

                          {/* Show Lock for inaccessible features */}
                          {!canAccess && (
                            <Lock className="w-3 h-3 text-amber-500" />
                          )}

                          {/* Show Featured badge */}
                          {isFeatured && canAccess && (
                            <Sparkles className="w-3 h-3 text-purple-500" />
                          )}
                        </div>
                        <p
                          className={cn(
                            "text-xs truncate transition-colors duration-200",
                            active
                              ? "text-amber-500/80"
                              : !canAccess || isBlockedByProfile
                                ? "text-gray-400 dark:text-gray-500"
                                : isFeatured
                                  ? "text-purple-600/80 dark:text-purple-400/80"
                                  : "text-gray-500 dark:text-gray-400 group-hover:text-amber-500/80 dark:group-hover:text-amber-400/80"
                          )}
                        >
                          {item.description}
                        </p>
                      </div>

                      {/* Active indicator */}
                      {active && canAccess && !isBlockedByProfile && (
                        <div
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            isFeatured ? "bg-purple-500" : "bg-amber-500"
                          )}
                        />
                      )}
                    </div>
                  );

                  return (
                    <div key={item.href}>
                      {!canAccess || isBlockedByProfile ? (
                        // Inaccessible feature
                        <div
                          className="relative"
                          title={
                            !canAccess
                              ? `Upgrade to ${userTier === "free" ? "Pro" : "Premium"} to access this feature`
                              : "Complete your profile to access this feature"
                          }
                        >
                          {linkContent}
                        </div>
                      ) : (
                        // Accessible link
                        <Link href={item.href}>{linkContent}</Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DesktopUserNav;
