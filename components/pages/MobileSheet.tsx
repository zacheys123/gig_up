"use client";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  BookA,
  BookCopy,
  Gamepad,
  Home,
  Menu,
  MessageCircle,
  Music,
  Search,
  Settings,
  User,
  VideoIcon,
  Mail,
  Users,
  Calendar,
  Plus,
  Sun,
  Moon,
  Bell,
} from "lucide-react";
import { MdDashboard } from "react-icons/md";
import { useAuth, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSubscriptionStore } from "@/app/stores/useSubscriptionStore";
import { useThemeColors, useThemeToggle } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { GigUpAssistant } from "../ai/GigupAssistant";

// Define interfaces
interface NavLink {
  label: string;
  href: string;
  icon: React.ReactElement;
  badge?: number;
  condition?: boolean;
}

interface DesktopNavigationItem {
  href: string;
  label: string;
  icon: React.ReactElement;
  condition?: boolean;
  badge?: number;
  pro?: boolean;
}

interface MobileSheetProps {
  isTrialEnded?: boolean;
}

// Define the nav links function with proper typing
const getNavLinks = (userId: string | undefined, user: any): NavLink[] => {
  const baseLinks: NavLink[] = [
    { label: "Home", href: "/", icon: <Home size={20} /> },
    { label: "Dashboard", href: "/dashboard", icon: <MdDashboard size={20} /> },
    { label: "Search", href: "/auth/search", icon: <Search size={20} /> },
    { label: "Profile", href: "/profile", icon: <User size={20} /> },
    {
      href: "/messages",
      icon: <MessageCircle size={20} />,
      label: "Messages",
      badge: 3,
    },
    { label: "Settings", href: "/settings", icon: <Settings size={20} /> },
    { label: "Games", href: "/game", icon: <Gamepad size={20} /> },
  ];

  // Add conditional links based on user data
  if (user?._id) {
    baseLinks.splice(
      2,
      0, // Insert at position 2
      {
        label: "Reviews",
        href: `/allreviews/${user._id}/*${user.firstname}${user.lastname}`,
        icon: <BookA size={20} />,
      },
      {
        label: "Personal Reviews",
        href: `/reviews/${user._id}/*${user.firstname}${user.lastname}`,
        icon: <BookCopy size={20} />,
      }
    );

    // Add musician-specific links
    if (user?.isMusician && !user?.isClient) {
      baseLinks.splice(
        5,
        0, // Insert at position 5
        {
          label: "My Videos",
          href: `/search/allvideos/${user._id}/*${user.firstname}/${user.lastname}`,
          icon: <VideoIcon size={20} />,
        }
      );
    }

    // Add gigs link
    baseLinks.splice(
      6,
      0, // Insert at position 6
      {
        label: "Gigs",
        href: user?.isClient ? `/create/${userId}` : `/av_gigs/${userId}`,
        icon: <Music size={20} />,
      }
    );
  }

  return baseLinks;
};

// Function to check if user has minimal data
const hasMinimalData = (user: any): boolean => {
  if (!user) return false;

  // Check if user has date, year, month, or videoProfile data
  const hasDateData = user.date || user.year || user.month;
  const hasVideoProfile = user.videoProfile;

  return hasDateData || hasVideoProfile;
};

// Basic links for users without minimal data
const getBasicLinks = (): NavLink[] => [
  { label: "Home", href: "/", icon: <Home size={20} /> },
  { label: "Contact", href: "/contact", icon: <Mail size={20} /> },
];

const MobileSheet: React.FC<MobileSheetProps> = ({ isTrialEnded }) => {
  const { userId } = useAuth();
  const { isSignedIn, user: clerkUser } = useUser();
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const { isPro } = useSubscriptionStore();
  const { colors, isDarkMode } = useThemeColors();
  const { toggleDarkMode } = useThemeToggle();

  // Safely get tier from localStorage
  const [tier, setTier] = React.useState<string>("free");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTier = localStorage.getItem("tier");
      setTier(storedTier || "free");
    }
  }, []);

  // Determine which links to show based on user data
  const navLinks: NavLink[] = hasMinimalData(user)
    ? getNavLinks(userId as string, user)
    : getBasicLinks();

  // Check if user has a role
  const hasRole = user?.isClient || user?.isMusician;
  const isMusician = user?.isMusician;

  // Add the missing navigation items from DesktopNavigation
  const desktopNavigationItems: DesktopNavigationItem[] = [
    {
      href: "/community",
      label: "Community",
      icon: <Users size={20} />,
      condition: isSignedIn,
    },
    {
      href: "/messages",
      label: "Messages",
      icon: <MessageCircle size={20} />,
      condition: isSignedIn,
      badge: 3,
    },
    {
      href: "/notifications",
      label: "Notifications",
      icon: <Bell size={20} />,
      condition: isSignedIn,
      pro: false,
    },
  ];

  // Filter and add missing desktop navigation items
  const missingDesktopItems = desktopNavigationItems
    .filter((item) => item.condition !== false)
    .filter((item) => !navLinks.some((link) => link.href === item.href));

  // Combine existing nav links with missing desktop items
  const allNavLinks: NavLink[] = [...navLinks, ...missingDesktopItems];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="p-2">
          <Menu
            className={cn(
              "text-3xl transition-colors duration-200 hover:text-teal-300",
              colors.text
            )}
          />
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className={cn(
          "w-[80%] sm:w-[60%] md:w-[40%] h-full",
          "backdrop-blur-2xl border-r px-6 py-6 flex flex-col gap-4 z-[999]",
          "rounded-br-[120px] shadow-2xl",
          colors.card,
          colors.border,
          "transition-colors duration-200 ease-in-out"
        )}
      >
        {!isTrialEnded ? (
          <>
            <SheetTitle className={cn("text-2xl font-bold mb-4", colors.text)}>
              {hasMinimalData(user) ? "Access More Info" : "Welcome to Gigup"}
            </SheetTitle>

            {/* Navigation Links */}
            <div className="space-y-2">
              {allNavLinks
                .filter((link) => pathname !== link.href)
                .map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    className={cn(
                      "flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-200 group relative",
                      colors.hoverBg,
                      colors.text,
                      "hover:text-amber-600 dark:hover:text-amber-400"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={cn(
                          "transition-colors duration-200",
                          "group-hover:text-amber-600 dark:group-hover:text-amber-400"
                        )}
                      >
                        {link.icon}
                      </span>
                      <span
                        className={cn(
                          "md:text-lg font-medium transition-colors duration-200",
                          colors.text
                        )}
                      >
                        {link.label}
                      </span>
                    </div>

                    {/* Badge - positioned to the right */}
                    {link.badge && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                ))}
            </div>

            {/* Create Button (for signed-in users with roles) */}
            {isSignedIn && hasRole && (
              <Link href={isMusician ? "/gigs" : "/create-gig"}>
                <div
                  className={cn(
                    "flex items-center gap-4 w-full px-4 py-3 rounded-lg transition-all duration-200",
                    "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
                    "text-white font-medium shadow-md hover:shadow-lg"
                  )}
                >
                  <Plus size={20} />
                  <span>{isMusician ? "Find Gigs" : "Post Gig"}</span>
                </div>
              </Link>
            )}

            {/* Sign In/Sign Up for non-signed in users */}
            {!isSignedIn && (
              <div className="space-y-2">
                <Link
                  href="/sign-in"
                  className={cn(
                    "flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg transition-all duration-200",
                    colors.hoverBg,
                    colors.text,
                    "hover:text-amber-600 dark:hover:text-amber-400"
                  )}
                >
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/sign-up"
                  className={cn(
                    "flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg transition-all duration-200",
                    "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
                    "text-white font-medium shadow-md hover:shadow-lg"
                  )}
                >
                  <span>Sign Up</span>
                </Link>
              </div>
            )}

            {/* Show version badge only if user has minimal data */}
            {hasMinimalData(user) && (
              <div
                className={cn(
                  "mt-6 p-2 w-fit text-sm rounded-md font-semibold shadow-md text-white",
                  isPro()
                    ? "bg-gradient-to-br from-purple-600 via-emerald-600 to-orange-600"
                    : "bg-gradient-to-br from-blue-600 via-green-600 to-yellow-600"
                )}
              >
                {isPro() ? "Pro" : "Free"} Version
              </div>
            )}

            {/* Show setup prompt if user doesn't have minimal data */}
            {!hasMinimalData(user) && user && (
              <div
                className={cn(
                  "mt-6 p-4 rounded-lg border",
                  colors.secondaryBackground,
                  colors.border
                )}
              >
                <p className={cn("text-sm mb-3", colors.text)}>
                  Complete your profile to access all features!
                </p>
                <Link
                  href="/profile"
                  className={cn(
                    "inline-block w-full text-center px-4 py-2 text-sm font-semibold rounded-lg",
                    "transition duration-200 hover:brightness-110",
                    "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white"
                  )}
                >
                  Complete Profile
                </Link>
              </div>
            )}

            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border mt-4">
              <span className={cn("text-sm", colors.text)}>
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </span>
              <button
                onClick={toggleDarkMode}
                className={cn(
                  "p-2 rounded-md transition-all duration-200 relative group",
                  colors.text,
                  "hover:text-amber-600 dark:hover:text-amber-400"
                )}
                aria-label={
                  isDarkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 transition-colors duration-200" />
                ) : (
                  <Moon className="w-5 h-5 transition-colors duration-200" />
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <SheetTitle className={cn("text-2xl font-bold mb-4", colors.text)}>
              Try Gigup Now!!!!
            </SheetTitle>
            <div className="flex flex-col justify-between h-full">
              <div className="space-y-4">
                <Link
                  href={"/experience/v1/trial"}
                  className={cn(
                    "flex items-center gap-4 w-full px-4 py-3 rounded-lg transition-all duration-200",
                    colors.hoverBg,
                    colors.text
                  )}
                >
                  <span className={colors.text}>
                    <VideoIcon size={20} />
                  </span>
                  <div
                    className={cn(
                      "p-3 rounded-lg shadow-lg",
                      colors.secondaryBackground
                    )}
                  >
                    <span className="md:text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 via-purple-600 to-yellow-500">
                      Experience GiGup
                    </span>
                  </div>
                </Link>

                {/* New informational text */}
                <p
                  className={cn(
                    "text-sm mt-4 mb-2 px-2 leading-relaxed",
                    colors.textMuted
                  )}
                >
                  Unlock the full potential of GiGup with premium features such
                  as:
                </p>
                <ul
                  className={cn(
                    "list-disc list-inside text-sm mb-4 px-4 space-y-1",
                    colors.textMuted
                  )}
                >
                  <li>Unlimited gigs & chats</li>
                  <li>Advanced analytics & insights</li>
                  <li>Priority support</li>
                  <li>Exclusive video tools</li>
                </ul>
              </div>

              <div className="space-y-4">
                {/* Upgrade prompt for free users */}
                {!isPro() && (
                  <div
                    className={cn(
                      "p-2 w-fit text-sm rounded-md font-semibold shadow-md text-white",
                      "bg-gradient-to-br from-purple-600 via-emerald-600 to-orange-600"
                    )}
                  >
                    Upgrade to Pro Version
                  </div>
                )}

                {/* CTA button */}
                <Link
                  href="/dashboard/billing"
                  className={cn(
                    "mt-4 inline-block w-full text-center px-6 py-3 text-sm font-semibold rounded-lg",
                    "transition duration-200 hover:brightness-110",
                    "bg-gradient-to-r from-purple-700 via-pink-600 to-yellow-500 text-white"
                  )}
                >
                  {isPro() ? "Manage Subscription" : "Upgrade Now"}
                </Link>

                {/* Theme Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <span className={cn("text-sm", colors.text)}>Dark Mode</span>
                  <button
                    onClick={toggleDarkMode}
                    className={cn(
                      "p-2 rounded-md transition-colors",
                      colors.hoverBg
                    )}
                    aria-label={
                      isDarkMode
                        ? "Switch to light mode"
                        : "Switch to dark mode"
                    }
                  >
                    {isDarkMode ? (
                      <span className="text-yellow-400">☀️</span>
                    ) : (
                      <span className="text-blue-400">🌙</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
        <GigUpAssistant />
      </SheetContent>
    </Sheet>
  );
};

export default MobileSheet;
