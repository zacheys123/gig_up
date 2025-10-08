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
} from "lucide-react";
import { MdDashboard } from "react-icons/md";
import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSubscription } from "@/hooks/useSubscription";
import { UserProps } from "@/types/userinterfaces";
import { useCheckTrial } from "@/hooks/useCheckTrials";
import { Video } from "react-feather";
import { useTheme } from "@/hooks/useTheme";
import { ThemeToggle } from "../admin/theme/ThemeToggler";
import { cn } from "@/lib/utils";

const navLinks = (userId: string | undefined, user: UserProps) => [
  { label: "Home", href: "/", icon: <Home size={20} /> },
  { label: "Dashboard", href: "/dashboard", icon: <MdDashboard size={20} /> },
  {
    label: "Reviews",
    href: `/allreviews/${user?._id}/*${user?.firstname}${user?.lastname}`,
    icon: <BookA size={20} />,
  },
  { label: "Search", href: "/auth/search", icon: <Search size={20} /> },
  { label: "Profile", href: "/profile", icon: <User size={20} /> },
  {
    label: "Personal Reviews",
    href: `/reviews/${user?._id}/*${user?.firstname}${user?.lastname}`,
    icon: <BookCopy size={20} />,
  },
  { label: "My Chats", href: "/chats", icon: <MessageCircle size={20} /> },
  ...(user?.isMusician && !user?.isClient
    ? [
        {
          label: "My Videos",
          href: `/search/allvideos/${user?._id}/*${user?.firstname}/${user?.lastname}`,
          icon: <VideoIcon size={20} />,
        },
      ]
    : []),
  {
    label: "Gigs",
    href: user?.isClient ? `/create/${userId}` : `/av_gigs/${userId}`,
    icon: <Music size={20} />,
  },
  { label: "Settings", href: "/settings", icon: <Settings size={20} /> },
  { label: "Games", href: "/game", icon: <Gamepad size={20} /> },
];

const MobileSheet = () => {
  const { userId } = useAuth();
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const { subscription } = useSubscription(userId as string);
  const { isFirstMonthEnd } = useCheckTrial(user?.user);
  const tier = localStorage.getItem("tier");
  const { theme, resolvedTheme, isMounted, toggleTheme, useSystemTheme } =
    useTheme();

  if (!isMounted) {
    return (
      <header className="sticky top-0 z-40 border-b bg-white dark:bg-gray-900">
        {/* Loading skeleton */}
        <div className="container flex h-16 items-center justify-between">
          <div className="h-8 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
      </header>
    );
  }

  return (
    <Sheet>
      <SheetTrigger>
        <Menu
          className={cn(
            "text-3xl transition-colors duration-200 hover:text-teal-300",
            "text-gray-300 dark:text-white "
          )}
        />
      </SheetTrigger>
      <SheetContent
        side="left"
        className={cn(
          "w-[80%] sm:w-[60%] md:w-[40%] h-full",
          "backdrop-blur-2xl border-r px-6 py-6 flex flex-col gap-4 z-[999]",
          "rounded-br-[120px] shadow-2xl",
          "bg-white/80 dark:bg-gray-900/90",
          "border-gray-200 dark:border-gray-700",
          "transition-colors duration-200 ease-in-out"
        )}
      >
        {!isFirstMonthEnd ? (
          <>
            <SheetTitle className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Access More Info
            </SheetTitle>
            {navLinks(userId as string, user?.user)
              .filter((link) => pathname !== link.href)
              .map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-4 w-full px-4 py-3 rounded-lg transition-all duration-200",
                    "bg-gray-100 text-gray-900 hover:bg-teal-500 hover:text-white",
                    "dark:bg-gray-800 dark:text-white dark:hover:bg-teal-600"
                  )}
                >
                  <span className="text-gray-900 dark:text-white">
                    {link.icon}
                  </span>
                  <span className="md:text-lg font-medium text-gray-700 dark:text-neutral-300">
                    {link.label}
                  </span>
                </Link>
              ))}
            <div className="mt-6 p-2 w-fit text-sm rounded-md font-semibold shadow-md text-white bg-gradient-to-br from-purple-600 via-emerald-600 to-orange-600 dark:from-purple-400 dark:via-emerald-400 dark:to-orange-500">
              {tier} Version
            </div>
          </>
        ) : (
          <>
            <SheetTitle className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Try Gigup Now!!!!
            </SheetTitle>
            <div className="flex h-[80%] my-auto flex-col justify-between">
              <Link
                href={"/experience/v1/trial"}
                className={cn(
                  "flex items-center gap-4 w-full px-4 py-3 rounded-lg transition-all duration-200",
                  resolvedTheme === "dark"
                    ? "text-white bg-gray-800 hover:bg-teal-600"
                    : "text-gray-900 bg-gray-100 hover:bg-teal-500 hover:text-white"
                )}
              >
                <span className="">
                  <Video />
                </span>
                <div className="p-3 rounded-lg shadow-lg bg-gradient-to-r from-gray-200 via-indigo-200 to-green-200 dark:from-gray-900 dark:via-indigo-900 dark:to-green-800">
                  <span className="md:text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 via-purple-600 to-yellow-500 dark:from-cyan-400 dark:via-purple-400 dark:to-yellow-300">
                    Experience GiGup
                  </span>
                </div>
              </Link>

              {/* New informational text */}
              <p className="text-sm mt-4 mb-2 px-2 leading-relaxed text-gray-600 dark:text-gray-300">
                Unlock the full potential of GiGup with premium features such
                as:
              </p>
              <ul className="list-disc list-inside text-sm mb-4 px-4 space-y-1 text-gray-500 dark:text-gray-400">
                <li>Unlimited gigs & chats</li>
                <li>Advanced analytics & insights</li>
                <li>Priority support</li>
                <li>Exclusive video tools</li>
              </ul>

              {/* Trial days remaining or encourage upgrade */}
              {subscription?.subscription?.tier === "free" && (
                <div
                  className={cn(
                    "p-2 w-fit text-sm rounded-md font-semibold shadow-md",
                    resolvedTheme === "dark"
                      ? "bg-gradient-to-br from-purple-400 via-emerald-400 to-orange-500 text-white"
                      : "bg-gradient-to-br from-purple-600 via-emerald-600 to-orange-600 text-white"
                  )}
                >
                  <span>Upgrade to Pro</span> Version
                </div>
              )}

              {/* Optional: add a clear CTA button */}
              <Link
                href="/dashboard/billing"
                className={cn(
                  "mt-4 inline-block w-full text-center px-6 py-3 text-sm font-semibold rounded-lg",
                  "transition duration-200 hover:brightness-110",
                  "bg-gradient-to-r from-purple-700 via-pink-600 to-yellow-500 text-white",
                  "dark:from-purple-600 dark:via-pink-500 dark:to-yellow-400"
                )}
              >
                Upgrade Now
              </Link>
            </div>
          </>
        )}
        <ThemeToggle
          theme={theme}
          resolvedTheme={resolvedTheme}
          toggleTheme={toggleTheme}
          useSystemTheme={useSystemTheme}
        />
      </SheetContent>
    </Sheet>
  );
};

export default MobileSheet;
