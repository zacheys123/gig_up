"use client";

import { useThemeColors, useThemeToggle } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useNotificationSettings } from "@/hooks/useNotificationsSettings";
import {
  ArrowLeft,
  Bell,
  Users,
  Calendar,
  MessageSquare,
  Settings,
  Eye,
  UserPlus,
  Mail,
  Zap,
  Sun,
  Moon,
  CheckCircle,
  XCircle,
  Heart,
  Share2,
  Star,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FaComment } from "react-icons/fa";

export default function NotificationSettingsPage() {
  const { settings, updateSettings, isLoading } = useNotificationSettings();
  const { colors, isDarkMode } = useThemeColors();
  const { toggleDarkMode } = useThemeToggle();
  const router = useRouter();

  const NotificationSection = ({
    title,
    icon,
    description,
    children,
  }: {
    title: string;
    icon: React.ReactNode;
    description?: string;
    children: React.ReactNode;
  }) => (
    <div
      className={cn(
        "rounded-2xl p-6 mb-6 transition-all duration-300",
        colors.border,
        colors.card,
        "backdrop-blur-sm",
        "hover:shadow-lg hover:border-opacity-70"
      )}
    >
      <div className="flex items-center gap-4 mb-6">
        <div
          className={cn(
            "p-3 rounded-xl",
            "bg-gradient-to-br from-blue-500 to-purple-600 text-white",
            "shadow-lg shadow-blue-500/25"
          )}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h2 className={cn("text-xl font-semibold mb-1", colors.text)}>
            {title}
          </h2>
          {description && (
            <p className={cn("text-sm", colors.textMuted)}>{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );

  // In your NotificationSettingsPage component, update the valid keys:
  const validInAppKeys = [
    // Profile & Social
    "profileViews",
    "likes",
    "shares",
    "reviews",
    "followRequests",
    "comments",

    // Gigs & Bookings (ADD THESE)
    "gigInvites",
    "gigOpportunities", // NEW
    "gigUpdates", // NEW
    "bookingRequests",
    "bookingConfirmations",
    "gigReminders",
    "bandInvites", // NEW

    // Messages
    "newMessages",
    "messageRequests",

    // System
    "systemUpdates",
    "featureAnnouncements",
  ] as const;

  type ValidInAppKey = (typeof validInAppKeys)[number];

  // Modern ToggleRow component inspired by Instagram/Facebook
  const ToggleRow = ({
    label,
    description,
    inAppKey,
    icon,
  }: {
    label: string;
    description: string;
    inAppKey: ValidInAppKey;
    icon?: React.ReactNode;
  }) => {
    const [localSaving, setLocalSaving] = useState(false);

    const handleToggle = async (checked: boolean) => {
      setLocalSaving(true);
      try {
        await updateSettings({
          ...settings,
          [inAppKey]: checked,
        });
      } catch (error) {
        console.error("Failed to update settings:", error);
      } finally {
        setLocalSaving(false);
      }
    };

    const isEnabled = settings[inAppKey] as boolean;

    return (
      <div
        className={cn(
          "group flex items-center justify-between p-4 rounded-xl transition-all duration-300",
          "border border-transparent",
          colors.hoverBg,
          "hover:border-opacity-50",
          localSaving && "opacity-60 cursor-not-allowed"
        )}
      >
        {/* Left Content - Fixed layout */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {icon && (
            <div
              className={cn(
                "p-2.5 rounded-lg flex-shrink-0 transition-all duration-300 mt-0.5",
                isEnabled
                  ? cn("text-blue-600 bg-blue-50", colors.border)
                  : cn("text-gray-500 bg-gray-100", colors.border)
              )}
            >
              {icon}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex justify-between items-center w-full">
                    <h3
                      className={cn(
                        "font-medium text-base ",
                        colors.text,
                        localSaving && "opacity-70"
                      )}
                    >
                      {label}
                    </h3>

                    {/* Enabled/Disabled Status Badge */}
                    <div
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300",
                        isEnabled
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200",
                        localSaving && "opacity-70"
                      )}
                    >
                      {isEnabled ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          <span>Enabled</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          <span>Disabled</span>
                        </>
                      )}
                    </div>
                  </div>
                  {localSaving && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                      <span className="text-xs text-blue-600 font-medium whitespace-nowrap">
                        Saving...
                      </span>
                    </div>
                  )}
                </div>
                <p
                  className={cn(
                    "text-sm leading-relaxed line-clamp-2",
                    isEnabled ? colors.primary : colors.textMuted,
                    localSaving && "opacity-60"
                  )}
                >
                  {description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Switch - Compact layout */}
        <div className="flex items-center gap-3 pl-4 flex-shrink-0">
          {/* Status Indicator */}
          <div
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 whitespace-nowrap",
              "hidden sm:block",
              isEnabled
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : cn("bg-gray-100 text-gray-600", colors.border)
            )}
          >
            {isEnabled ? "On" : "Off"}
          </div>

          {/* Compact Switch Container */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Custom switch container */}
            <button
              onClick={() =>
                !localSaving && !isLoading && handleToggle(!isEnabled)
              }
              disabled={localSaving || isLoading}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ease-in-out flex-shrink-0",
                "border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                isEnabled
                  ? "bg-blue-500 border-blue-600 shadow-lg shadow-blue-500/30"
                  : "bg-gray-200 border-gray-300 shadow-lg shadow-gray-300/50",
                localSaving && "opacity-70 cursor-not-allowed",
                !localSaving && "hover:scale-105 hover:shadow-xl"
              )}
            >
              {/* Thumb with smooth animation */}
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-all duration-300 ease-in-out",
                  "border border-gray-200",
                  isEnabled ? "translate-x-5" : "translate-x-0.5",
                  localSaving && "animate-pulse"
                )}
              />
            </button>

            {/* Compact Status indicator */}
            <div
              className={cn(
                "px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 whitespace-nowrap",
                "border shadow-sm hidden md:block",
                isEnabled
                  ? "bg-green-100 text-green-700 border-green-200"
                  : "bg-gray-100 text-gray-600 border-gray-200",
                localSaving && "opacity-60"
              )}
            >
              {localSaving ? (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span>Saving</span>
                </div>
              ) : isEnabled ? (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Enabled</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  <span>Disabled</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Fixed Theme Toggle Component
  const ThemeToggle = () => (
    <button
      onClick={toggleDarkMode}
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "p-3 rounded-full transition-all duration-300",
        colors.card,
        colors.border,
        "shadow-lg hover:shadow-xl",
        "hover:scale-110 active:scale-95",
        "group"
      )}
      aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
    >
      <div className="relative w-6 h-6">
        <Sun
          className={cn(
            "w-5 h-5 absolute top-0.5 left-0.5 transition-all duration-300",
            isDarkMode
              ? "rotate-0 opacity-100 text-yellow-500"
              : "rotate-90 opacity-0 text-gray-400"
          )}
        />
        <Moon
          className={cn(
            "w-5 h-5 absolute top-0.5 left-0.5 transition-all duration-300",
            isDarkMode
              ? "rotate-90 opacity-0 text-gray-400"
              : "rotate-0 opacity-100 text-blue-600"
          )}
        />
      </div>

      {/* Tooltip */}
      <div
        className={cn(
          "absolute right-full mr-3 top-1/2 transform -translate-y-1/2",
          "px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap",
          colors.card,
          colors.text,
          colors.border,
          "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          "shadow-lg pointer-events-none"
        )}
      >
        Switch to {isDarkMode ? "light" : "dark"} mode
        <div
          className={cn(
            "absolute top-1/2 left-full -translate-y-1/2 border-8 border-transparent",
            colors.border
          )}
        />
      </div>
    </button>
  );

  if (isLoading) {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center",
          colors.background
        )}
      >
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className={cn("text-2xl font-bold mb-2", colors.text)}>
            Loading Preferences
          </h2>
          <p className={cn("text-lg", colors.textMuted)}>
            Getting your notification settings...
          </p>
        </div>
      </div>
    );
  }

  const enabledCount = Object.values(settings).filter(
    (val) => val === true
  ).length;
  const totalCount = validInAppKeys.length;

  return (
    <div className={cn("min-h-screen", colors.background)}>
      {/* Modern Header */}
      <div
        className={cn(
          "w-full border-b backdrop-blur-sm",
          colors.border,
          colors.card,
          "sticky top-0 z-10"
        )}
      >
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => router.back()}
                className={cn(
                  "md:hidden flex items-center gap-2 p-2 rounded-lg transition-all duration-300",
                  colors.hoverBg,
                  colors.textMuted,
                  "hover:text-opacity-100"
                )}
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Back</span>
              </button>

              <div>
                <h1 className={cn("text-2xl font-bold", colors.text)}>
                  Notifications
                </h1>
                <p className={cn("text-gray-600", colors.textMuted)}>
                  Manage your notification preferences
                </p>
              </div>
            </div>

            <div
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium",
                "bg-blue-100 text-blue-700 border border-blue-200"
              )}
            >
              {enabledCount}/{totalCount} enabled
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Grid Layout */}
        <div className="space-y-6">
          {/* Social & Profile Section */}
          <NotificationSection
            title="Social & Engagement"
            icon={<Users className="w-6 h-6" />}
            description="Manage notifications about your social interactions and engagement"
          >
            <ToggleRow
              label="Profile Views"
              description="Get notified when someone views your profile"
              inAppKey="profileViews"
              icon={<Eye className="w-4 h-4" />}
            />
            <ToggleRow
              label="Likes"
              description="When someone likes your posts or content"
              inAppKey="comments"
              icon={<Heart className="w-4 h-4" />} // Add Heart icon import
            />
            <ToggleRow
              label="Comments"
              description="Enable to create or recieve comments on videos"
              inAppKey="likes"
              icon={<FaComment className="w-4 h-4" />} // Add Heart icon import
            />
            <ToggleRow
              label="Shares"
              description="When someone shares your content"
              inAppKey="shares"
              icon={<Share2 className="w-4 h-4" />} // Add Share2 icon import
            />
            <ToggleRow
              label="Reviews"
              description="New reviews and ratings on your profile"
              inAppKey="reviews"
              icon={<Star className="w-4 h-4" />} // Add Star icon import
            />
            <ToggleRow
              label="Follow Requests"
              description="Notifications for new followers and follow requests"
              inAppKey="followRequests"
              icon={<UserPlus className="w-4 h-4" />}
            />
          </NotificationSection>
          {/* Gigs & Bookings Section */}

          <NotificationSection
            title="Gigs & Bookings"
            icon={<Calendar className="w-5 h-5" />}
            description="Gig invitations and booking activities"
          >
            <ToggleRow
              label="Gig Invites"
              description="When you're invited to perform or become a deputy"
              inAppKey="gigInvites"
              icon={<Calendar className="w-4 h-4" />}
            />
            <ToggleRow
              label="New Gig Opportunities"
              description="When new gigs matching your skills are posted"
              inAppKey="gigOpportunities"
              icon={<Zap className="w-4 h-4" />}
            />
            <ToggleRow
              label="Gig Updates"
              description="Updates on your posted gigs and applications"
              inAppKey="gigUpdates"
              icon={<Bell className="w-4 h-4" />}
            />
            <ToggleRow
              label="Booking Requests"
              description="New booking requests for your services"
              inAppKey="bookingRequests"
              icon={<Mail className="w-4 h-4" />}
            />
            <ToggleRow
              label="Booking Confirmations"
              description="When bookings are confirmed"
              inAppKey="bookingConfirmations"
              icon={<CheckCircle className="w-4 h-4" />}
            />
            <ToggleRow
              label="Gig Reminders"
              description="Reminders for upcoming gigs"
              inAppKey="gigReminders"
              icon={<Clock className="w-4 h-4" />}
            />
            <ToggleRow
              label="Band Invites & Updates"
              description="Invitations to join bands and band updates"
              inAppKey="bandInvites"
              icon={<Users className="w-4 h-4" />}
            />
          </NotificationSection>
          {/* Messages Section */}
          <NotificationSection
            title="Messages"
            icon={<MessageSquare className="w-5 h-5" />}
            description="Direct messages and conversations"
          >
            <ToggleRow
              label="New Messages"
              description="New direct messages"
              inAppKey="newMessages"
              icon={<MessageSquare className="w-4 h-4" />}
            />
          </NotificationSection>
          {/* System Section */}
          <NotificationSection
            title="System"
            icon={<Settings className="w-5 h-5" />}
            description="App updates and announcements"
          >
            <ToggleRow
              label="System Updates"
              description="Important app updates"
              inAppKey="systemUpdates"
              icon={<Settings className="w-4 h-4" />}
            />
          </NotificationSection>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className={cn("text-sm", colors.textMuted)}>
            Your preferences are automatically saved
          </p>
        </div>
      </div>

      {/* Fixed Theme Toggle */}
      <ThemeToggle />
    </div>
  );
}
