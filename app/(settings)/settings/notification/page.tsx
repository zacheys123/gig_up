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
import { color } from "framer-motion";

export default function NotificationSettingsPage() {
  const { settings, updateSettings, isLoading } = useNotificationSettings();
  const { colors } = useThemeColors();
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
        "rounded-2xl border p-6 lg:p-8 mb-6 transition-all duration-300",
        "hover:shadow-lg hover:border-opacity-70",
        colors.border,
        colors.card,
        "backdrop-blur-sm bg-card/95"
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
        <div
          className={cn(
            "p-3 rounded-xl flex-shrink-0",
            "bg-primary text-primary-foreground",
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

  // Individual ToggleRow component with its own loading state
  // Individual ToggleRow component with its own loading state
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
          "flex flex-col sm:flex-row sm:items-center justify-between p-4 lg:p-6 rounded-xl transition-all duration-300",
          "hover:shadow-md border",
          isEnabled
            ? cn(
                "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10",
                "shadow-sm"
              )
            : cn(
                colors.background + colors.borderMuted,
                "hover:border-gray-300 dark:hover:border-gray-600"
              ),
          "group relative overflow-hidden",
          localSaving && "opacity-70 cursor-wait"
        )}
      >
        {/* Subtle background gradient for enabled state */}
        {isEnabled && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-sky-50/10 dark:from-blue-900/5 dark:to-sky-900/5" />
        )}

        <div className="flex items-start gap-4 flex-1 mb-4 sm:mb-0 relative z-10">
          {icon && (
            <div
              className={cn(
                "p-2.5 rounded-xl mt-0.5 flex-shrink-0 transition-all duration-300 border",
                isEnabled
                  ? cn(
                      "text-blue-600 bg-blue-100 border-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-800",
                      "shadow-sm group-hover:scale-105"
                    )
                  : cn(
                      "text-gray-600 bg-gray-100 border-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700",
                      "group-hover:bg-gray-200 dark:group-hover:bg-gray-700 group-hover:scale-105"
                    ),
                localSaving && "animate-pulse"
              )}
            >
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <div
                className={cn(
                  "font-semibold text-base lg:text-lg transition-colors duration-300",
                  isEnabled ? colors.textMuted : colors.infoText
                )}
              >
                {label}
              </div>
              <div className="flex items-center gap-2">
                {isEnabled && (
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full border transition-all duration-300",
                      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800",
                      "group-hover:scale-105"
                    )}
                  >
                    ACTIVE
                  </span>
                )}
                {localSaving && (
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full border animate-pulse",
                      "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800"
                    )}
                  >
                    SAVING...
                  </span>
                )}
              </div>
            </div>
            <div
              className={cn(
                "text-sm lg:text-base leading-relaxed transition-colors duration-300",
                isEnabled ? colors.textMuted : colors.infoBorder
              )}
            >
              {description}
            </div>
          </div>
        </div>

        {/* Enhanced Switch Container */}
        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto relative z-10">
          {/* Status Badge */}
          <div
            className={cn(
              "px-3 py-2 rounded-full text-sm font-semibold transition-all duration-300 min-w-[80px] text-center border",
              isEnabled
                ? cn(
                    "text-blue-800 bg-blue-100 border-blue-300 dark:text-blue-200 dark:bg-blue-900/40 dark:border-blue-700",
                    "shadow-sm group-hover:shadow-md"
                  )
                : cn(
                    "text-gray-600 bg-gray-100 border-gray-300 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-600",
                    "group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                  ),
              localSaving && "opacity-70"
            )}
          >
            {isEnabled ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span>Enabled</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full" />
                <span>Disabled</span>
              </div>
            )}
          </div>

          {/* Enhanced Switch */}
          <div className="relative">
            <div
              className={cn(
                "p-1 rounded-2xl transition-all duration-200",
                isEnabled
                  ? "bg-blue-100/50 dark:bg-blue-900/20 group-hover:bg-blue-200/50 dark:group-hover:bg-blue-800/20"
                  : "bg-gray-100/50 dark:bg-gray-800/20 group-hover:bg-gray-200/50 dark:group-hover:bg-gray-700/20"
              )}
            >
              <Switch
                checked={isEnabled}
                onCheckedChange={handleToggle}
                disabled={localSaving || isLoading}
                className={cn(
                  // Base styles
                  "relative transition-all duration-200",
                  "scale-110 lg:scale-100",
                  "hover:scale-115 lg:hover:scale-105",
                  "disabled:opacity-50 disabled:cursor-not-allowed",

                  // Switch colors - using blue instead of green for better visibility
                  "data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600",
                  "data-[state=unchecked]:bg-gray-400 data-[state=unchecked]:border-gray-400",
                  "dark:data-[state=unchecked]:bg-gray-600 dark:data-[state=unchecked]:border-gray-600",

                  // Border
                  "border-2 border-transparent",

                  // Enhanced effects
                  isEnabled &&
                    cn("shadow-lg shadow-blue-200/50 dark:shadow-blue-800/30"),

                  // Hover effects
                  "hover:data-[state=checked]:bg-blue-700 hover:data-[state=unchecked]:bg-gray-500",
                  "dark:hover:data-[state=unchecked]:bg-gray-500",

                  localSaving && "opacity-70"
                )}
              />
            </div>

            {/* Enhanced Loading Overlay */}
            {localSaving && (
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center rounded-2xl backdrop-blur-sm",
                  "bg-white/90 dark:bg-gray-900/90 border",
                  isEnabled
                    ? "border-blue-200 dark:border-blue-800"
                    : "border-gray-200 dark:border-gray-700"
                )}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                    Saving...
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center",
          colors.background
        )}
      >
        <div className="text-center">
          <div
            className={cn(
              "w-12 h-12 border-3 border-t-transparent rounded-full animate-spin mx-auto mb-4",
              colors.primaryBg
            )}
          ></div>
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
          "w-full border-b bg-background/95 backdrop-blur-sm",
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
                  "border-2 border-transparent hover:border-border",
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
                "bg-primary text-primary-foreground",
                "shadow-lg border-2 border-primary/20",
                "flex items-center gap-3 transition-transform duration-300 hover:scale-105"
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
            "bg-muted/50",
            "backdrop-blur-sm"
          )}
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div
              className={cn(
                "p-4 rounded-2xl flex-shrink-0",
                "bg-primary text-primary-foreground",
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
            "bg-card/90 border-opacity-50",
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
                  "bg-primary text-primary-foreground hover:bg-primary/90",
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
