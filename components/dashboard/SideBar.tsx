"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  CreditCardIcon,
  BellIcon,
  ChevronRightIcon,
  MessageSquareIcon,
  SettingsIcon,
  HelpCircleIcon,
  BarChartIcon,
  FileTextIcon,
  ShieldIcon,
  Sun,
  Moon,
  Crown,
  Lock,
  Sparkles,
  Zap,
  Gem,
  Star,
  Rocket,
  Award,
  Diamond,
  CalendarIcon,
  DollarSignIcon,
  HeartIcon,
  UsersIcon,
  BriefcaseIcon,
  BuildingIcon,
  Shield,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MdDashboard } from "react-icons/md";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useThemeColors, useThemeToggle } from "@/hooks/useTheme";
import { SidebarSkeleton } from "../skeletons/SidebarSkeleton";
import { useNotificationSystem } from "@/hooks/useNotifications";
import { useCheckTrial } from "@/hooks/useCheckTrial";
import { useChat } from "@/app/context/ChatContext";
import { useState } from "react";
import { useUnreadCount } from "@/hooks/useUnreadCount";
import { ChatListModal } from "../chat/ChatListModal";
import { getTierInfo, hasMinimumData } from "../pages/MobileSheet";
import { FeatureDiscovery } from "../features/FeatureDiscovery";
import { getRoleFeatures } from "@/lib/registry";
import { useUserFeatureFlags } from "@/hooks/useUserFeatureFalgs";
import { FeatureUnlockProgress } from "../FeatureUnlockProgress";
import { useTrustScore } from "@/hooks/useTrustScore";
import {
  FeatureName,
  getFeatureThresholdsForRole,
  getMostRelevantFeature,
  getNextTier,
  getRoleSpecificFeatures,
  getScoreNeeded,
  getTierThreshold,
} from "@/lib/trustScoreHelpers";

interface NavLink {
  name: string;
  href: string;
  icon: React.ReactElement;
  exact: boolean;
  availableForTiers?: string[];
  requiresCompleteProfile?: boolean;
  featured?: boolean;
  badge?: number;
  onClick?: (e: React.MouseEvent) => void;
}

export function Sidebar() {
  const { user } = useCurrentUser();
  const pathname = usePathname();
  const router = useRouter();
  const { unreadCount: notCount } = useNotificationSystem();
  const { colors, isDarkMode, mounted } = useThemeColors();
  const { toggleDarkMode } = useThemeToggle();
  const { isInGracePeriod, isFirstMonthEnd } = useCheckTrial();
  const [showTrustFeatures, setShowTrustFeatures] = useState(false);

  const { openChat } = useChat();
  const [showChatListModal, setShowChatListModal] = useState(false);
  const { total: unReadCount, byChat: unreadCounts } = useUnreadCount();

  const userTier = user?.tier || "free";
  const currentTier = getTierInfo(userTier);
  const TierIcon = currentTier.icon;
  const isProfileComplete = hasMinimumData(user);

  // Enhanced trial experience
  const showTrialEnded = isFirstMonthEnd;
  const showGracePeriod = isInGracePeriod;
  const showUpgradePrompt =
    showTrialEnded || showGracePeriod || user?.tier === "free";

  // Determine which links to show based on trial status
  const shouldShowLimitedLinks =
    showTrialEnded && user?.tier !== "pro" && !isInGracePeriod;
  const canAccessProFeature = user?.tier === "pro" || isInGracePeriod;
  const { trustScore, trustStars, tier } = useTrustScore();

  const handleOpenMessages = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowChatListModal(true);
  };

  if (!user) {
    return <SidebarSkeleton />;
  }

  const isActive = (href: string, exact: boolean = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Dashboard-specific core links
  const dashboardCoreLinks: NavLink[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <MdDashboard className="w-5 h-5" />,
      exact: true,
      availableForTiers: ["free", "pro", "premium", "elite"],
    },
    {
      name: "Billing & Plans",
      href: "/dashboard/billing",
      icon: <CreditCardIcon className="w-5 h-5" />,
      exact: false,
      availableForTiers: ["free", "pro", "premium", "elite"],
    },
    {
      name: "Overall Rating Info",
      href: "/dashboard/overall-rating",
      icon: <Award className="w-5 h-5" />,
      exact: false,
      availableForTiers: ["pro", "premium", "elite"],
    },
  ];

  // Dashboard analytics and tools
  const dashboardToolsLinks: NavLink[] = [
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: <BarChartIcon className="w-5 h-5" />,
      exact: false,
      availableForTiers: ["pro", "premium", "elite"],
      featured: true,
    },
    {
      name: "Documents",
      href: "/dashboard/documents",
      icon: <FileTextIcon className="w-5 h-5" />,
      exact: false,
      availableForTiers: ["pro", "premium", "elite"],
    },
    {
      name: "Notifications",
      href: "/notifications",
      icon: (
        <div className="relative">
          <BellIcon className="w-5 h-5" />
          {notCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
              {notCount > 9 ? "9+" : notCount}
            </span>
          )}
        </div>
      ),
      exact: true,
      availableForTiers: ["pro", "premium", "elite"],
      badge: notCount,
    },
  ];

  // Role-specific dashboard links
  const getRoleDashboardLinks = (): NavLink[] => {
    if (user?.isBooker) {
      return [
        {
          name: "Coordination",
          href: "/dashboard/coordination",
          icon: <BuildingIcon className="w-5 h-5" />,
          exact: false,
          availableForTiers: ["premium", "elite"],
          featured: true,
        },
        {
          name: "Earnings",
          href: "/dashboard/earnings",
          icon: <DollarSignIcon className="w-5 h-5" />,
          exact: false,
          availableForTiers: ["pro", "premium", "elite"],
        },
        {
          name: "Bookings",
          href: "/hub/gigs?tab=booked",
          icon: <CalendarIcon className="w-5 h-5" />,
          exact: false,
          availableForTiers: ["pro", "premium", "elite"],
          requiresCompleteProfile: true,
        },

        {
          name: "Managed Talent",
          href: "/community?tab=managed-talent",
          icon: <Star className="w-5 h-5" />,
          exact: false,
          availableForTiers: ["pro", "premium", "elite"],
          requiresCompleteProfile: true,
        },
      ];
    }

    if (user?.isMusician) {
      return [
        {
          name: "Bookings",
          href: "/hub/gigs?tab=booked",
          icon: <CalendarIcon className="w-5 h-5" />,
          exact: false,
          availableForTiers: ["pro", "premium", "elite"],
          requiresCompleteProfile: true,
        },
        {
          name: "Earnings",
          href: "/dashboard/earnings",
          icon: <DollarSignIcon className="w-5 h-5" />,
          exact: false,
          availableForTiers: ["pro", "premium", "elite"],
        },
        {
          name: "Reviews",
          href: "/dashboard/reviews",
          icon: <Star className="w-5 h-5" />,
          exact: false,
          availableForTiers: ["pro", "premium", "elite"],
          requiresCompleteProfile: true,
        },
        {
          name: "Favorites",
          href: "/hub/gigs?tab=favorites",
          icon: <HeartIcon className="w-5 h-5" />,
          exact: false,
          availableForTiers: ["pro", "premium", "elite"],
        },
      ];
    }

    if (user?.isClient) {
      return [
        {
          name: "Bookings",
          href: "/hub/gigs?tab=booked",
          icon: <CalendarIcon className="w-5 h-5" />,
          exact: false,
          availableForTiers: ["pro", "premium", "elite"],
        },
      ];
    }

    return [];
  };

  // Premium/Elite exclusive dashboard features
  const premiumDashboardLinks: NavLink[] = [
    {
      name: "Priority Support",
      href: "/dashboard/priority-support",
      icon: <ShieldIcon className="w-5 h-5" />,
      exact: false,
      availableForTiers: ["premium", "elite"],
      featured: true,
    },
    {
      name: "Advanced Reports",
      href: "/dashboard/advanced-reports",
      icon: <BarChartIcon className="w-5 h-5" />,
      exact: false,
      availableForTiers: ["premium", "elite"],
      featured: true,
    },
  ];

  // Elite exclusive dashboard features
  const eliteDashboardLinks: NavLink[] = [
    {
      name: "Dedicated Manager",
      href: "/dashboard/account-manager",
      icon: <Rocket className="w-5 h-5" />,
      exact: false,
      availableForTiers: ["elite"],
      featured: true,
    },
    {
      name: "VIP Dashboard",
      href: "/dashboard/vip",
      icon: <Crown className="w-5 h-5" />,
      exact: false,
      availableForTiers: ["elite"],
      featured: true,
    },
  ];

  // Common dashboard links
  const commonDashboardLinks: NavLink[] = [
    {
      name: "Messages",
      href: "/messages",
      icon: (
        <div className="relative">
          <MessageSquareIcon className="w-5 h-5" />
          {unReadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
              {unReadCount > 9 ? "9+" : unReadCount}
            </span>
          )}
        </div>
      ),
      exact: false,
      availableForTiers: ["pro", "premium", "elite"],
      requiresCompleteProfile: true,
      badge: unReadCount,
      onClick: handleOpenMessages,
    },
    {
      name: "Profile Settings",
      href: "/profile",
      icon: <SettingsIcon className="w-5 h-5" />,
      exact: false,
      availableForTiers: ["pro", "premium", "elite"],
    },
    {
      name: "Help & Support",
      href: "/dashboard/support",
      icon: <HelpCircleIcon className="w-5 h-5" />,
      exact: false,
      availableForTiers: ["free", "pro", "premium", "elite"],
    },
    {
      name: "Privacy & Security",
      href: "/dashboard/privacy",
      icon: <ShieldIcon className="w-5 h-5" />,
      exact: false,
      availableForTiers: ["free", "pro", "premium", "elite"],
    },
  ];

  // Combine dashboard-specific links based on user tier
  const getAllLinks = (): NavLink[] => {
    if (shouldShowLimitedLinks) {
      // After trial ended: only show core dashboard links
      return [
        ...dashboardCoreLinks,
        ...commonDashboardLinks.filter((link) =>
          link.availableForTiers?.includes("free")
        ),
      ];
    }

    let allLinks = [...dashboardCoreLinks, ...commonDashboardLinks];

    // Add role-specific dashboard links for pro and above
    if (
      userTier === "pro" ||
      userTier === "premium" ||
      userTier === "elite" ||
      isInGracePeriod
    ) {
      allLinks = [
        ...allLinks,
        ...getRoleDashboardLinks(),
        ...dashboardToolsLinks,
      ];
    }

    // Add premium dashboard features
    if (userTier === "premium" || userTier === "elite") {
      allLinks = [...allLinks, ...premiumDashboardLinks];
    }

    // Add elite dashboard features
    if (userTier === "elite") {
      allLinks = [...allLinks, ...eliteDashboardLinks];
    }

    return allLinks;
  };

  const links = getAllLinks();

  // Check if user can access a link based on their tier
  const canAccessLink = (link: NavLink) => {
    if (!link.availableForTiers) return true;
    return link.availableForTiers.includes(userTier) || isInGracePeriod;
  };

  // Get next tier info for upgrade prompts
  const getNextTierInfo = () => {
    switch (userTier) {
      case "free":
        return { tier: "pro", label: "Pro", icon: Zap, color: "orange" };
      case "pro":
        return {
          tier: "premium",
          label: "Premium",
          icon: Gem,
          color: "purple",
        };
      case "premium":
        return { tier: "elite", label: "Elite", icon: Crown, color: "yellow" };
      default:
        return null;
    }
  };

  const nextTier = getNextTierInfo();

  const getUserRoleLabel = () => {
    if (user?.isBooker) return "Booker/Talent Manager";
    if (user?.isMusician) return "Artist/Musician";
    if (user?.isMusician && user?.roleType === "teacher") return "Teacher";
    if (user?.isClient) return "Client";
    return "User";
  };

  const getUserStatsLabel = () => {
    if (user?.isBooker) return "Artists Managed";
    if (user?.isMusician) return "Gigs Booked";
    if (user?.isClient) return "Posts Created";
    return "Activity";
  };

  const getUserStatsValue = () => {
    if (user?.isBooker) return user.artistsManaged?.length || 0;
    if (user?.isMusician) return user.gigsBooked || 0;
    if (user?.isClient) return user.gigsPosted || 0;
    return 0;
  };

  // Handle link click with profile and tier restrictions
  const handleLinkClick = (link: NavLink, e: React.MouseEvent) => {
    // Block access if profile incomplete
    if (link.requiresCompleteProfile && !isProfileComplete) {
      e.preventDefault();
      router.push("/profile");
      return;
    }

    // Block access if trial ended and link is not available
    if (shouldShowLimitedLinks && !link.availableForTiers?.includes("free")) {
      e.preventDefault();
      router.push("/dashboard/billing");
      return;
    }

    // Block access if not in correct tier
    if (!canAccessLink(link)) {
      e.preventDefault();
      router.push("/dashboard/billing");
      return;
    }

    if (link.onClick) {
      link.onClick(e);
    }
  };

  return (
    <>
      <div
        className={cn(
          "w-full md:w-64 h-full flex flex-col border-r",
          colors.background,
          colors.border
        )}
      >
        {/* Header */}
        <div className={cn("p-6 border-b", colors.border)}>
          <div className="flex items-center justify-between">
            <div>
              <h2
                className={cn(
                  "text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent"
                )}
              >
                {shouldShowLimitedLinks ? "Dashboard Basic" : "Dashboard"}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <div
                  className={cn(
                    "px-2 py-1 text-xs rounded-full font-semibold",
                    currentTier.badge
                  )}
                >
                  <TierIcon className="w-3 h-3 inline mr-1" />
                  {currentTier.label}
                </div>
                <span className={cn("text-xs font-medium", colors.textMuted)}>
                  {getUserRoleLabel()}
                </span>
              </div>
            </div>

            {/* Notifications for Desktop Sidebar (only show if not in trial-ended state) */}
            {!shouldShowLimitedLinks && (
              <div className="hidden lg:block">
                <NotificationBell variant="desktop" />
              </div>
            )}
          </div>
          {/* Upgrade Prompt */}
          {nextTier && user?.isMusician && (
            <div
              className={cn(
                "mt-3 p-3 rounded-xl bg-gradient-to-r text-white",
                nextTier.color === "orange" && "from-orange-500 to-red-500",
                nextTier.color === "purple" && "from-purple-500 to-pink-600",
                nextTier.color === "yellow" && "from-yellow-500 to-red-600"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <nextTier.icon className="w-4 h-4" />
                <h4 className="font-bold text-sm">
                  Upgrade to {nextTier.label}
                </h4>
              </div>
              <p className="text-xs text-white/90 mb-2">
                Unlock exclusive {nextTier.label.toLowerCase()} dashboard
                features.
              </p>

              {/* Add trust score progress for relevant features */}
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="text-xs font-medium mb-2">
                  Also unlock with trust:
                </div>
                <div className="space-y-2">
                  <FeatureUnlockProgress feature="canCompete" variant="mini" />
                  <FeatureUnlockProgress
                    feature="canCreateBand"
                    variant="mini"
                  />
                </div>
              </div>

              <Link
                href="/dashboard/billing"
                className="block w-full text-center bg-white text-gray-800 py-1.5 px-3 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors mt-3"
              >
                Upgrade to {nextTier.label}
              </Link>
            </div>
          )}
          {/* Profile Incomplete Banner */}
          {!isProfileComplete && (
            <div className="mt-3 p-3 rounded-xl bg-orange-50 border border-orange-200">
              <div className="flex items-center gap-2 mb-1">
                <HelpCircleIcon className="w-4 h-4 text-orange-600" />
                <h4 className="font-bold text-sm text-orange-800">
                  Profile Incomplete
                </h4>
              </div>
              <p className="text-xs text-orange-700 mb-2">
                Complete your profile to access all dashboard features.
              </p>
              <Link
                href="/profile"
                className="block w-full text-center bg-orange-600 text-white py-1.5 px-3 rounded-lg text-xs font-semibold hover:bg-orange-700 transition-colors"
              >
                Complete Profile
              </Link>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto py-20">
          {links.map((link) => {
            const active = isActive(link.href, link.exact);
            const canAccess = canAccessLink(link);
            const requiresCompleteProfile = link.requiresCompleteProfile;
            const isBlockedByProfile =
              requiresCompleteProfile && !isProfileComplete;
            const isFeatured = link.featured;

            const linkContent = (
              <div
                className={cn(
                  "group flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 border-l-4 first:my-3",
                  colors.hoverBg,
                  (!canAccess || isBlockedByProfile) &&
                    "cursor-not-allowed opacity-60",
                  active
                    ? "bg-gradient-to-r from-amber-500/20 to-orange-500/10 border-amber-500 text-amber-100"
                    : cn(colors.text, "border-transparent", colors.hoverBg),
                  isFeatured && "ring-2 ring-purple-200 dark:ring-purple-800"
                )}
              >
                <div
                  className={cn(
                    "transition-transform duration-200",
                    active
                      ? "text-amber-400"
                      : !canAccess || isBlockedByProfile
                        ? "text-gray-400 dark:text-gray-500"
                        : cn("group-hover:text-amber-400", colors.textMuted),
                    isFeatured && "text-purple-600"
                  )}
                >
                  {link.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-medium flex-1",
                        active ? "text-amber-600" : colors.text,
                        (!canAccess || isBlockedByProfile) &&
                          "text-gray-500 dark:text-gray-400",
                        isFeatured && "text-purple-700 dark:text-purple-300"
                      )}
                    >
                      {link.name}
                    </span>

                    {/* Show Lock for inaccessible features */}
                    {!canAccess && <Lock className="w-3 h-3 text-amber-500" />}

                    {/* Show Profile Alert for incomplete profile */}
                    {isBlockedByProfile && (
                      <HelpCircleIcon className="w-3 h-3 text-orange-500" />
                    )}

                    {/* Show Featured badge */}
                    {isFeatured && canAccess && (
                      <Sparkles className="w-3 h-3 text-purple-500" />
                    )}

                    {link.badge &&
                      link.badge > 0 &&
                      canAccess &&
                      !isBlockedByProfile && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {link.badge > 9 ? "9+" : link.badge}
                        </span>
                      )}
                  </div>
                </div>

                <ChevronRightIcon
                  className={cn(
                    "w-4 h-4 transition-all duration-200",
                    active
                      ? "text-amber-400 opacity-100"
                      : !canAccess || isBlockedByProfile
                        ? "text-gray-400 dark:text-gray-500 opacity-50"
                        : cn(
                            "opacity-0 group-hover:opacity-100",
                            colors.textMuted
                          )
                  )}
                />
              </div>
            );

            return link.onClick ? (
              <button
                key={link.name}
                onClick={(e) => handleLinkClick(link, e)}
                className="w-full text-left"
                disabled={!canAccess || isBlockedByProfile}
              >
                {linkContent}
              </button>
            ) : (
              <Link
                key={link.name}
                href={
                  !canAccess
                    ? "/dashboard/billing"
                    : isBlockedByProfile
                      ? "/profile"
                      : link.href
                }
                onClick={(e) => handleLinkClick(link, e)}
              >
                {linkContent}
              </Link>
            );
          })}
          <div className="mt-8">
            <FeatureDiscovery
              features={getRoleFeatures(user?.roleType || "all")}
              variant="sidebar"
              title="Your Tools"
              showLocked={true} // Show coming soon features
            />
          </div>
          {/* TRUST SCORE UI IN SIDEBAR STARTS HERE */}
          <div className="mt-4 border-t pt-4">
            {/* Trust Score Header */}
            <button
              onClick={() => setShowTrustFeatures(!showTrustFeatures)}
              className={cn(
                "flex items-center justify-between w-full p-3 rounded-xl transition-all duration-200",
                colors.hoverBg,
                colors.text
              )}
            >
              <div className="flex items-center gap-2">
                <Shield className={cn("w-4 h-4", colors.primary)} />
                <div>
                  <div className="text-sm font-medium">Trust Score</div>
                  <div className="text-xs flex items-center gap-1">
                    <span className={colors.textMuted}>{trustScore}/100</span>
                    <span className="text-yellow-500 flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-yellow-500" />
                      {trustStars.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
              {showTrustFeatures ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {/* Collapsed view (shows only the most relevant feature) */}
            {!showTrustFeatures && trustScore < 100 && user && (
              <div className="px-3 pb-2">
                <FeatureUnlockProgress
                  feature={getMostRelevantFeature(user)}
                  variant="compact"
                  className="text-xs"
                />
              </div>
            )}

            {/* Expanded view (shows role-specific features) */}
            {showTrustFeatures && user && (
              <div className="space-y-3 px-3 pb-3">
                {/* Show role-specific features within 20 points of current score */}
                {getRoleSpecificFeatures(user)
                  .filter((feature) => {
                    const scoreNeeded = getScoreNeeded(feature.key, user);
                    // Only show features that are within 20 points of current score
                    return (
                      scoreNeeded - trustScore <= 20 && scoreNeeded !== 999
                    );
                  })
                  .map((feature) => (
                    <FeatureUnlockProgress
                      key={feature.key}
                      feature={feature.key}
                      variant="compact"
                    />
                  ))}

                {/* Show next tier progress */}
                {getTierThreshold(tier) > trustScore && (
                  <div className="pt-2 border-t">
                    <div className="text-xs font-medium mb-2">
                      Next Tier: {getNextTier(tier)}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full"
                          style={{
                            width: `${(trustScore / getTierThreshold(tier)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {trustScore}/{getTierThreshold(tier)}
                      </span>
                    </div>
                  </div>
                )}

                <Link
                  href="/dashboard/overall-rating"
                  className="block text-center text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 py-1.5 rounded-lg transition-colors"
                >
                  View trust dashboard →
                </Link>
              </div>
            )}
          </div>
          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className={cn(
              "group flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 border-l-4 border-transparent",
              colors.hoverBg,
              colors.text
            )}
          >
            <div
              className={cn(
                "transition-colors duration-200",
                "group-hover:text-amber-400",
                colors.textMuted
              )}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </div>
            <span className={cn("font-medium flex-1", colors.text)}>
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </span>
            <div
              className={cn(
                "text-xs px-2 py-1 rounded-full",
                colors.card,
                colors.textMuted
              )}
            >
              Switch
            </div>
          </button>
        </nav>

        {/* Quick Stats (only show if not in trial-ended state) */}
        {!shouldShowLimitedLinks && (
          <div className={cn("p-4 border-t", colors.border)}>
            <div
              className={cn(
                "rounded-lg p-3 border",
                colors.card,
                colors.border
              )}
            >
              <div className={cn("text-xs mb-2 font-medium", colors.textMuted)}>
                Quick Stats
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className={cn(colors.text)}>{getUserStatsLabel()}</div>
                  <div className="text-amber-400 font-medium">
                    {getUserStatsValue()}
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <div className={cn(colors.text)}>Messages</div>
                  <div className="text-blue-400 font-medium">{unReadCount}</div>
                </div>
                <div className="flex justify-between text-sm">
                  <div className={cn(colors.text)}>Notifications</div>
                  <div className="text-green-400 font-medium">{notCount}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* App Version */}
        <div className={cn("px-4 py-2 border-t", colors.border)}>
          <div className={cn("text-xs text-center", colors.textMuted)}>
            GigUppv2.0.0
            {shouldShowLimitedLinks && (
              <span className="text-amber-600 ml-1">• Trial Ended</span>
            )}
          </div>
        </div>
      </div>
      <ChatListModal
        isOpen={showChatListModal}
        onClose={() => setShowChatListModal(false)}
      />
    </>
  );
}
// Add this temporary debug component
// export function FeatureFlagDebug() {
//   const { isFeatureEnabled } = useUserFeatureFlags();
//   const { user } = useCurrentUser();

//   return (
//     <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
//       <h3 className="font-bold">Feature Flag Debug</h3>
//       <p>User Tier: {user?.tier}</p>
//       <p>User Role: {user?.roleType}</p>
//       <p>
//         Vocal Warmups Enabled:{" "}
//         {isFeatureEnabled("vocal_warmups") ? "✅ Yes" : "❌ No"}
//       </p>
//     </div>
//   );
// }
