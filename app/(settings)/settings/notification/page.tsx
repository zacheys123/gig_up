// app/settings/notification/page.tsx - IMPROVED & RESPONSIVE
"use client";

import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useNotificationSettings } from "@/hooks/useNotificationsSettings";
import {
  ArrowLeft,
  Lock,
  Bell,
  Users,
  Calendar,
  MessageSquare,
  Settings,
  Eye,
  UserPlus,
  Mail,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { NotificationSettings } from "@/convex/notificationsTypes";

export default function NotificationSettingsPage() {
  const { settings, updateSingleSetting, isLoading } =
    useNotificationSettings();
  const { colors } = useThemeColors();
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleToggle = async (
    key: keyof NotificationSettings,
    value: boolean
  ) => {
    setSaving(true);
    try {
      await updateSingleSetting(key, value);
    } catch (error) {
      console.error("Failed to update settings:", error);
    } finally {
      setSaving(false);
    }
  };

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
        "rounded-2xl border p-6 lg:p-8 mb-6 transition-all duration-300",
        "hover:shadow-lg hover:border-opacity-70",
        colors.border,
        colors.card,
        "backdrop-blur-sm bg-white/95 dark:bg-gray-900/95"
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
        <div
          className={cn(
            "p-3 rounded-xl flex-shrink-0",
            "bg-gradient-to-br from-blue-500 to-blue-600 text-white",
            "shadow-lg"
          )}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h2 className={cn("text-2xl font-bold mb-2", colors.text)}>
            {title}
          </h2>
          {description && (
            <p className={cn("text-base leading-relaxed", colors.textMuted)}>
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );

  // Only include the in-app notification settings we're actually using
  const validInAppKeys = [
    "profileViews",
    "followRequests",
    "gigInvites",
    "bookingRequests",
    "bookingConfirmations",
    "gigReminders",
    "newMessages",
    "systemUpdates",
  ] as const;

  type ValidInAppKey = (typeof validInAppKeys)[number];

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
  }) => (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between p-4 lg:p-6 rounded-xl transition-all duration-300",
        "hover:shadow-md border border-transparent hover:border-gray-200 dark:hover:border-gray-700",
        colors.hoverBg,
        "group"
      )}
    >
      <div className="flex items-start gap-4 flex-1 mb-4 sm:mb-0">
        {icon && (
          <div
            className={cn(
              "p-2 rounded-lg mt-1 flex-shrink-0 transition-colors duration-300",
              "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
              "group-hover:bg-blue-100 group-hover:text-blue-600 dark:group-hover:bg-blue-900/30 dark:group-hover:text-blue-400"
            )}
          >
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "font-semibold text-base lg:text-lg mb-2",
              colors.text
            )}
          >
            {label}
          </div>
          <div
            className={cn(
              "text-sm lg:text-base leading-relaxed",
              colors.textMuted
            )}
          >
            {description}
          </div>
        </div>
      </div>

      {/* Enhanced Switch Container */}
      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
        <div
          className={cn(
            "px-3 py-2 rounded-full text-sm font-semibold transition-all duration-300 min-w-[70px] text-center",
            settings[inAppKey]
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 shadow-sm"
              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          )}
        >
          {settings[inAppKey] ? "Enabled" : "Disabled"}
        </div>

        <div className="relative">
          <Switch
            checked={settings[inAppKey] as boolean}
            onCheckedChange={(checked) => handleToggle(inAppKey, checked)}
            disabled={saving || isLoading}
            className={cn(
              "data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-400",
              "dark:data-[state=unchecked]:bg-gray-600",
              "transition-all duration-300 transform",
              "scale-125 lg:scale-110",
              "hover:scale-135 lg:hover:scale-125",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          />
          {/* Loading indicator */}
          {(saving || isLoading) && (
            <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-80 rounded-full">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>
    </div>
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
      {/* Enhanced Full Width Header */}
      <div
        className={cn(
          "w-full border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm",
          colors.border,
          "sticky top-0 z-10"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 py-6 lg:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-8">
              <button
                onClick={() => router.back()}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 lg:px-6 lg:py-4 rounded-2xl transition-all duration-300",
                  "hover:bg-opacity-20 hover:scale-105 active:scale-95",
                  colors.textMuted,
                  colors.hoverBg,
                  "border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600",
                  "w-fit"
                )}
              >
                <ArrowLeft size={20} className="flex-shrink-0" />
                <span className="font-semibold text-base lg:text-lg">Back</span>
              </button>

              <div className="flex-1">
                <h1
                  className={cn(
                    "text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 lg:mb-3",
                    colors.primary
                  )}
                >
                  🔔 Notification Preferences
                </h1>
                <p className={cn("text-lg lg:text-xl", colors.textMuted)}>
                  Control how and when you receive notifications
                </p>
              </div>
            </div>

            <div
              className={cn(
                "px-4 py-3 lg:px-6 lg:py-4 rounded-2xl text-base lg:text-lg font-semibold",
                "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
                "shadow-lg border-2 border-blue-200 dark:border-blue-800",
                "flex items-center gap-3"
              )}
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>
                {enabledCount}/{totalCount} Enabled
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Enhanced Coming Soon Banner */}
        <div
          className={cn(
            "mb-8 lg:mb-12 p-6 lg:p-8 rounded-2xl border-2 border-dashed transition-all duration-300",
            "hover:shadow-xl hover:border-solid transform hover:-translate-y-1",
            colors.border,
            "bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20",
            "backdrop-blur-sm"
          )}
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div
              className={cn(
                "p-4 rounded-2xl flex-shrink-0",
                "bg-gradient-to-br from-blue-500 to-blue-600 text-white",
                "shadow-lg animate-pulse"
              )}
            >
              <Lock className="w-8 h-8" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3
                className={cn(
                  "font-bold text-2xl lg:text-3xl mb-3 lg:mb-4",
                  colors.text
                )}
              >
                🚀 Push Notifications - Coming Soon!
              </h3>
              <p
                className={cn(
                  "text-lg lg:text-xl leading-relaxed",
                  colors.textMuted
                )}
              >
                Browser push notifications are currently in development. You'll
                soon be able to receive notifications even when the app is
                closed. Stay tuned for exciting updates!
              </p>
            </div>
          </div>
        </div>

        {/* Grid Layout for Larger Screens */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Social & Profile Section */}
          <NotificationSection
            title="Social & Profile"
            icon={<Users className="w-6 h-6" />}
            description="Manage notifications about your profile and social interactions"
          >
            <ToggleRow
              label="Profile Views"
              description="Get notified when someone views your profile"
              inAppKey="profileViews"
              icon={<Eye className="w-4 h-4" />}
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
            icon={<Calendar className="w-6 h-6" />}
            description="Stay updated on your gig invitations and booking activities"
          >
            <ToggleRow
              label="Gig Invites"
              description="When you're invited to perform at a gig"
              inAppKey="gigInvites"
              icon={<Calendar className="w-4 h-4" />}
            />
            <ToggleRow
              label="Booking Requests"
              description="Notifications for new booking requests"
              inAppKey="bookingRequests"
              icon={<Mail className="w-4 h-4" />}
            />
            <ToggleRow
              label="Booking Confirmations"
              description="When your booking is confirmed"
              inAppKey="bookingConfirmations"
              icon={<Bell className="w-4 h-4" />}
            />
            <ToggleRow
              label="Gig Reminders"
              description="Reminders for upcoming gigs and events"
              inAppKey="gigReminders"
              icon={<Zap className="w-4 h-4" />}
            />
          </NotificationSection>

          {/* Messages Section */}
          <div className="xl:col-span-2">
            <NotificationSection
              title="Messages & Communication"
              icon={<MessageSquare className="w-6 h-6" />}
              description="Control your messaging notifications"
            >
              <ToggleRow
                label="New Messages"
                description="Notifications for new direct messages and conversations"
                inAppKey="newMessages"
                icon={<MessageSquare className="w-4 h-4" />}
              />
            </NotificationSection>
          </div>

          {/* System Section */}
          <div className="xl:col-span-2">
            <NotificationSection
              title="System & Updates"
              icon={<Settings className="w-6 h-6" />}
              description="Important app updates and system notifications"
            >
              <ToggleRow
                label="System Updates"
                description="Important app updates, maintenance, and announcements"
                inAppKey="systemUpdates"
                icon={<Settings className="w-4 h-4" />}
              />
            </NotificationSection>
          </div>
        </div>

        {/* Enhanced Save Button Section */}
        <div
          className={cn(
            "sticky bottom-6 mt-12 p-6 lg:p-8 rounded-2xl border-2 backdrop-blur-xl",
            colors.border,
            "bg-white/90 dark:bg-gray-900/90 border-opacity-50",
            "shadow-2xl transform transition-all duration-300",
            "hover:shadow-3xl hover:scale-105"
          )}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h3 className={cn("font-bold text-2xl mb-2", colors.text)}>
                ✅ Preferences Updated
              </h3>
              <p className={cn("text-lg", colors.textMuted)}>
                Your changes are automatically saved. You're all set!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.back()}
                className={cn(
                  "px-8 py-4 rounded-2xl border-2 font-semibold text-lg transition-all duration-300",
                  "hover:bg-opacity-20 hover:scale-105 active:scale-95",
                  colors.border,
                  colors.textSecondary,
                  colors.background,
                  "hover:shadow-lg"
                )}
              >
                Back to Settings
              </button>
              <button
                onClick={() => {
                  alert("✅ Your notification preferences have been saved!");
                  router.back();
                }}
                className={cn(
                  "px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300",
                  "hover:scale-105 active:scale-95 hover:shadow-2xl",
                  "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white",
                  "shadow-lg"
                )}
              >
                Done & Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
