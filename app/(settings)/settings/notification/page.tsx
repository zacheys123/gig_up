// app/settings/notifications/page.tsx - OPTIMIZED VERSION
"use client";

import { useState, useCallback, memo } from "react";
import { useThemeColors, useThemeToggle } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
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
  Sparkles,
  BellRing,
  MessageCircle,
  Music,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FaComment } from "react-icons/fa";
import { motion } from "framer-motion";

// Memoized ToggleRow component to prevent re-renders
const ToggleRow = memo(
  ({
    label,
    description,
    inAppKey,
    icon: IconComponent,
    color = "blue",
    isEnabled,
    isLoading,
    onToggle,
  }: {
    label: string;
    description: string;
    inAppKey: string;
    icon: React.ElementType;
    color?: "blue" | "green" | "purple" | "orange" | "pink";
    isEnabled: boolean;
    isLoading: boolean;
    onToggle: (key: string, checked: boolean) => void;
  }) => {
    const { colors, isDarkMode } = useThemeColors();
    const [localSaving, setLocalSaving] = useState(false);

    const colorClasses = {
      blue: {
        bg: isDarkMode ? "bg-blue-900/20" : "bg-blue-500/10",
        border: isDarkMode ? "border-blue-800" : "border-blue-500/20",
        text: isDarkMode ? "text-blue-400" : "text-blue-600",
        iconBg: isDarkMode ? "bg-blue-500/30" : "bg-blue-500/20",
        glow: "shadow-blue-500/25",
      },
      green: {
        bg: isDarkMode ? "bg-green-900/20" : "bg-green-500/10",
        border: isDarkMode ? "border-green-800" : "border-green-500/20",
        text: isDarkMode ? "text-green-400" : "text-green-600",
        iconBg: isDarkMode ? "bg-green-500/30" : "bg-green-500/20",
        glow: "shadow-green-500/25",
      },
      purple: {
        bg: isDarkMode ? "bg-purple-900/20" : "bg-purple-500/10",
        border: isDarkMode ? "border-purple-800" : "border-purple-500/20",
        text: isDarkMode ? "text-purple-400" : "text-purple-600",
        iconBg: isDarkMode ? "bg-purple-500/30" : "bg-purple-500/20",
        glow: "shadow-purple-500/25",
      },
      orange: {
        bg: isDarkMode ? "bg-orange-900/20" : "bg-orange-500/10",
        border: isDarkMode ? "border-orange-800" : "border-orange-500/20",
        text: isDarkMode ? "text-orange-400" : "text-orange-600",
        iconBg: isDarkMode ? "bg-orange-500/30" : "bg-orange-500/20",
        glow: "shadow-orange-500/25",
      },
      pink: {
        bg: isDarkMode ? "bg-pink-900/20" : "bg-pink-500/10",
        border: isDarkMode ? "border-pink-800" : "border-pink-500/20",
        text: isDarkMode ? "text-pink-400" : "text-pink-600",
        iconBg: isDarkMode ? "bg-pink-500/30" : "bg-pink-500/20",
        glow: "shadow-pink-500/25",
      },
    };

    const currentColor = colorClasses[color];

    const handleToggle = async () => {
      if (localSaving || isLoading) return;

      setLocalSaving(true);
      try {
        await onToggle(inAppKey, !isEnabled);
      } catch (error) {
        console.error("Failed to toggle setting:", error);
      } finally {
        setLocalSaving(false);
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "group flex items-center justify-between p-4 rounded-xl transition-all duration-300",
          "border",
          isEnabled ? currentColor.border : colors.border,
          isEnabled ? currentColor.bg : "bg-transparent",
          "hover:shadow-lg",
          localSaving && "opacity-70 cursor-not-allowed",
        )}
      >
        {/* Left Content */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className={cn(
              "p-2.5 rounded-lg flex-shrink-0 transition-all duration-300",
              isEnabled ? currentColor.iconBg : colors.backgroundSecondary,
              isEnabled ? currentColor.text : colors.textMuted,
            )}
          >
            <IconComponent className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-1">
              <h3
                className={cn(
                  "font-semibold text-base",
                  isEnabled ? currentColor.text : colors.text,
                  localSaving && "opacity-70",
                )}
              >
                {label}
              </h3>

              {/* Status Badge */}
              <div
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0",
                  "border",
                  isEnabled
                    ? cn("text-green-700 border-green-200", colors.successBg)
                    : cn(
                        "text-gray-600 border-gray-300",
                        colors.backgroundSecondary,
                      ),
                )}
              >
                {localSaving ? (
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                    Saving...
                  </span>
                ) : isEnabled ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Enabled
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    Disabled
                  </span>
                )}
              </div>
            </div>

            <p
              className={cn(
                "text-sm",
                isEnabled ? colors.text : colors.textMuted,
                localSaving && "opacity-60",
              )}
            >
              {description}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="pl-3 flex-shrink-0">
          <button
            onClick={handleToggle}
            disabled={localSaving || isLoading}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300",
              "border-2 focus:outline-none focus:ring-2",
              isEnabled
                ? cn("bg-orange-500 border-orange-600", colors.primaryRing)
                : cn("bg-gray-300 border-gray-400", colors.borderSecondary),
              localSaving && "opacity-70 cursor-not-allowed",
              !localSaving && "hover:shadow-md",
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-all duration-300",
                "border",
                isEnabled
                  ? cn("translate-x-5 border-orange-600", colors.primaryRing)
                  : cn(
                      "translate-x-0.5 border-gray-400",
                      colors.borderSecondary,
                    ),
              )}
            />
          </button>
        </div>
      </motion.div>
    );
  },
);

ToggleRow.displayName = "ToggleRow";

// Memoized Notification Section
const NotificationSection = memo(
  ({
    title,
    icon: IconComponent,
    description,
    children,
    gradient = "from-blue-500 to-purple-600",
  }: {
    title: string;
    icon: React.ElementType;
    description?: string;
    children: React.ReactNode;
    gradient?: string;
  }) => {
    const { colors } = useThemeColors();

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "rounded-2xl p-6 mb-6 transition-all duration-300",
          colors.card,
          colors.border,
          "border",
          "hover:shadow-lg",
        )}
      >
        <div className="flex items-center gap-4 mb-6">
          <div
            className={cn(
              "p-3 rounded-xl",
              `bg-gradient-to-br ${gradient} text-white`,
              "shadow-lg",
            )}
          >
            <IconComponent className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className={cn("text-xl font-bold mb-1", colors.text)}>
              {title}
            </h2>
            {description && (
              <p className={cn("text-sm", colors.textMuted)}>{description}</p>
            )}
          </div>
        </div>
        <div className="space-y-3">{children}</div>
      </motion.div>
    );
  },
);

NotificationSection.displayName = "NotificationSection";

export default function NotificationSettingsPage() {
  const { settings, updateSettings, isLoading } = useNotificationSettings();
  const { colors, isDarkMode } = useThemeColors();
  const { toggleDarkMode } = useThemeToggle();
  const router = useRouter();

  // Use useCallback to prevent function recreation on every render
  const handleToggle = useCallback(
    async (key: string, checked: boolean) => {
      try {
        await updateSettings({
          ...settings,
          [key]: checked,
        });
      } catch (error) {
        console.error("Failed to update setting:", error);
      }
    },
    [settings, updateSettings],
  );

  // Calculate enabled count once
  const enabledCount = Object.values(settings).filter(
    (val) => val === true,
  ).length;
  const totalCount = Object.keys(settings).length;

  const validInAppKeys = [
    // Profile & Social
    "profileViews",
    "likes",
    "shares",
    "reviews",
    "followRequests",
    "comments",

    // Gigs & Bookings (ADD THESE TWO)
    "gigInvites",
    "gigOpportunities",
    "gigUpdates",
    "bookingRequests",
    "bookingConfirmations",
    "gigReminders",
    "bandInvites",
    "paymentConfirmations", // ADD THIS
    "paymentDisputes", // ADD THIS

    // Messages
    "newMessages",
    "messageRequests",

    // System
    "systemUpdates",
    "featureAnnouncements",
  ] as const;

  if (isLoading) {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center",
          colors.background,
        )}
      >
        <div className="text-center">
          <div
            className={cn(
              "w-12 h-12 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4",
              colors.primaryRing,
            )}
          />
          <h2 className={cn("text-xl font-bold mb-2", colors.text)}>
            Loading Preferences
          </h2>
          <p className={cn("text-lg", colors.textMuted)}>
            Getting your notification settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen", colors.background)}>
      {/* Header */}
      <div
        className={cn(
          "w-full border-b",
          colors.border,
          colors.background,
          "sticky top-0 z-10",
        )}
      >
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => router.back()}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg transition-all duration-300",
                  colors.hoverBg,
                  colors.textMuted,
                  "hover:text-opacity-100",
                )}
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Back</span>
              </button>

              <div>
                <h1 className={cn("text-xl font-bold", colors.text)}>
                  Notification Settings
                </h1>
                <p className={cn("text-sm", colors.textMuted)}>
                  Choose which notifications you want to receive
                </p>
              </div>
            </div>

            <div
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium",
                colors.successBg,
                "border",
                colors.successBorder,
              )}
            >
              {enabledCount}/{totalCount} active
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Helpful Tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "rounded-xl p-4 mb-8",
            colors.card,
            colors.border,
            "border",
          )}
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className={cn("text-sm font-medium mb-1", colors.text)}>
                💡 How to use these settings
              </p>
              <p className={cn("text-sm", colors.textMuted)}>
                Turn ON notifications you want to stay updated about. Turn OFF
                notifications you find distracting. Your choices save
                automatically.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Social & Engagement */}
          <NotificationSection
            title="Social & Engagement"
            icon={Users}
            description="Notifications about your profile and social interactions"
            gradient="from-pink-500 to-rose-600"
          >
            <ToggleRow
              label="Profile Views"
              description="Get notified when someone visits your profile page"
              inAppKey="profileViews"
              icon={Eye}
              color="pink"
              isEnabled={settings.profileViews}
              isLoading={isLoading}
              onToggle={handleToggle}
            />
            <ToggleRow
              label="Likes"
              description="When someone likes your videos, posts, or profile"
              inAppKey="likes"
              icon={Heart}
              color="pink"
              isEnabled={settings.likes}
              isLoading={isLoading}
              onToggle={handleToggle}
            />
            <ToggleRow
              label="Comments"
              description="Get notified about comments on your videos and posts"
              inAppKey="comments"
              icon={FaComment}
              color="pink"
              isEnabled={settings.comments}
              isLoading={isLoading}
              onToggle={handleToggle}
            />
            <ToggleRow
              label="Shares"
              description="When someone shares your content with others"
              inAppKey="shares"
              icon={Share2}
              color="pink"
              isEnabled={settings.shares}
              isLoading={isLoading}
              onToggle={handleToggle}
            />
            <ToggleRow
              label="Reviews & Ratings"
              description="When clients or musicians leave reviews about your work"
              inAppKey="reviews"
              icon={Star}
              color="pink"
              isEnabled={settings.reviews}
              isLoading={isLoading}
              onToggle={handleToggle}
            />
            <ToggleRow
              label="Follow Requests"
              description="New followers and requests to connect with you"
              inAppKey="followRequests"
              icon={UserPlus}
              color="pink"
              isEnabled={settings.followRequests}
              isLoading={isLoading}
              onToggle={handleToggle}
            />
          </NotificationSection>

          {/* Gigs & Bookings */}
          <NotificationSection
            title="Gigs & Bookings"
            icon={Calendar}
            description="Notifications about gig opportunities and bookings"
            gradient="from-green-500 to-emerald-600"
          >
            <ToggleRow
              label="Gig Invitations"
              description="When someone invites you directly to perform at their gig"
              inAppKey="gigInvites"
              icon={Calendar}
              color="green"
              isEnabled={settings.gigInvites}
              isLoading={isLoading}
              onToggle={handleToggle}
            />
            <ToggleRow
              label="New Gigs Matching You"
              description="Gigs posted that match your skills and preferences"
              inAppKey="gigOpportunities"
              icon={Zap}
              color="green"
              isEnabled={settings.gigOpportunities}
              isLoading={isLoading}
              onToggle={handleToggle}
            />
            <ToggleRow
              label="Gig Application Updates"
              description="Updates when you apply for gigs or show interest"
              inAppKey="gigUpdates"
              icon={Bell}
              color="green"
              isEnabled={settings.gigUpdates}
              isLoading={isLoading}
              onToggle={handleToggle}
            />
            <ToggleRow
              label="Booking Inquiries"
              description="When someone wants to book you for a gig"
              inAppKey="bookingRequests"
              icon={Mail}
              color="green"
              isEnabled={settings.bookingRequests}
              isLoading={isLoading}
              onToggle={handleToggle}
            />
            <ToggleRow
              label="Booking Confirmations"
              description="When your gig bookings are officially confirmed"
              inAppKey="bookingConfirmations"
              icon={CheckCircle}
              color="green"
              isEnabled={settings.bookingConfirmations}
              isLoading={isLoading}
              onToggle={handleToggle}
            />
            <ToggleRow
              label="Gig Reminders"
              description="Reminders about upcoming gigs you're booked for"
              inAppKey="gigReminders"
              icon={Clock}
              color="green"
              isEnabled={settings.gigReminders}
              isLoading={isLoading}
              onToggle={handleToggle}
            />
            <ToggleRow
              label="Band Opportunities"
              description="Invitations to join bands or group performances"
              inAppKey="bandInvites"
              icon={Users}
              color="green"
              isEnabled={settings.bandInvites}
              isLoading={isLoading}
              onToggle={handleToggle}
            />
            {/* ADD THESE TWO NEW TOGGLES */}
            <ToggleRow
              label="Payment Confirmations"
              description="Get notified when payments are confirmed or verified"
              inAppKey="paymentConfirmations"
              icon={CheckCircle}
              color="green"
              isEnabled={settings.paymentConfirmations}
              isLoading={isLoading}
              onToggle={handleToggle}
            />

            <ToggleRow
              label="Payment Disputes"
              description="Important alerts about payment mismatches or disputes"
              inAppKey="paymentDisputes"
              icon={AlertCircle}
              color="green"
              isEnabled={settings.paymentDisputes}
              isLoading={isLoading}
              onToggle={handleToggle}
            />
          </NotificationSection>

          {/* Messages */}
          <NotificationSection
            title="Messages & Conversations"
            icon={MessageCircle}
            description="Notifications about your direct messages"
            gradient="from-blue-500 to-cyan-600"
          >
            <ToggleRow
              label="New Messages"
              description="When you receive new direct messages from other users"
              inAppKey="newMessages"
              icon={MessageSquare}
              color="blue"
              isEnabled={settings.newMessages}
              isLoading={isLoading}
              onToggle={handleToggle}
            />
            <ToggleRow
              label="Message Requests"
              description="Messages from users who aren't in your contacts yet"
              inAppKey="messageRequests"
              icon={Mail}
              color="blue"
              isEnabled={settings.messageRequests}
              isLoading={isLoading}
              onToggle={handleToggle}
            />
          </NotificationSection>

          {/* System */}
          <NotificationSection
            title="Platform & Updates"
            icon={Settings}
            description="Notifications about the app itself"
            gradient="from-purple-500 to-violet-600"
          >
            <ToggleRow
              label="System Updates"
              description="Important updates about the platform (always important)"
              inAppKey="systemUpdates"
              icon={Settings}
              color="purple"
              isEnabled={settings.systemUpdates}
              isLoading={isLoading}
              onToggle={handleToggle}
            />
            <ToggleRow
              label="New Features"
              description="Announcements about new features added to the app"
              inAppKey="featureAnnouncements"
              icon={Sparkles}
              color="purple"
              isEnabled={settings.featureAnnouncements}
              isLoading={isLoading}
              onToggle={handleToggle}
            />
          </NotificationSection>
        </div>

        {/* Helpful Guides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div
            className={cn(
              "rounded-xl p-5",
              colors.card,
              colors.border,
              "border",
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("p-2 rounded-lg", colors.successBg)}>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h3 className={cn("font-semibold", colors.text)}>
                Recommended Settings
              </h3>
            </div>
            <ul className={cn("space-y-2 text-sm", colors.textMuted)}>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-green-500 mt-2" />
                <span>
                  Keep <strong>Gig Invitations</strong> ON to not miss
                  opportunities
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-green-500 mt-2" />
                <span>
                  Keep <strong>Gig Reminders</strong> ON to remember your
                  bookings
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-green-500 mt-2" />
                <span>
                  Keep <strong>System Updates</strong> ON for important
                  announcements
                </span>
              </li>
            </ul>
          </div>

          <div
            className={cn(
              "rounded-xl p-5",
              colors.card,
              colors.border,
              "border",
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("p-2 rounded-lg", colors.warningBg)}>
                <XCircle className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className={cn("font-semibold", colors.text)}>
                Too Many Notifications?
              </h3>
            </div>
            <ul className={cn("space-y-2 text-sm", colors.textMuted)}>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-amber-500 mt-2" />
                <span>
                  Turn OFF <strong>Profile Views</strong> if you get too many
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-amber-500 mt-2" />
                <span>
                  Turn OFF <strong>New Gigs</strong> if you're not actively
                  looking
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-amber-500 mt-2" />
                <span>You can always change these later!</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className={cn("text-sm", colors.textMuted)}>
            ✅ Your preferences are automatically saved
          </p>
          <p className={cn("text-xs mt-2", colors.textMuted)}>
            Changes take effect immediately
          </p>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 py-3",
          colors.card,
          colors.border,
          "border-t backdrop-blur-sm",
        )}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => {
                // Enable all notifications
                const allEnabled = validInAppKeys.reduce((acc, key) => {
                  acc[key] = true;
                  return acc;
                }, {} as any);
                updateSettings(allEnabled);
              }}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300",
                "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
                "hover:shadow-lg",
              )}
            >
              Turn All ON
            </button>
            <button
              onClick={() => {
                // Disable all non-critical notifications
                const mostlyDisabled = validInAppKeys.reduce((acc, key) => {
                  // Keep critical notifications on by default
                  const criticalKeys = [
                    "systemUpdates",
                    "featureAnnouncements",
                    "gigReminders",
                    "gigInvites",
                  ];
                  acc[key] = criticalKeys.includes(key);
                  return acc;
                }, {} as any);
                updateSettings(mostlyDisabled);
              }}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300",
                colors.backgroundSecondary,
                colors.text,
                "border",
                colors.border,
                "hover:shadow-lg",
              )}
            >
              Turn Most OFF
            </button>
          </div>
        </div>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleDarkMode}
        className={cn(
          "fixed bottom-20 right-6 z-50",
          "p-3 rounded-full transition-all duration-300",
          colors.card,
          colors.border,
          "border",
          "shadow-lg hover:shadow-xl",
          "hover:scale-110 active:scale-95",
        )}
        aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
      >
        <div className="relative w-6 h-6">
          <Sun
            className={cn(
              "w-5 h-5 absolute top-0.5 left-0.5 transition-all duration-300",
              isDarkMode
                ? "rotate-0 opacity-100 text-yellow-500"
                : "rotate-90 opacity-0",
            )}
          />
          <Moon
            className={cn(
              "w-5 h-5 absolute top-0.5 left-0.5 transition-all duration-300",
              isDarkMode
                ? "rotate-90 opacity-0"
                : "rotate-0 opacity-100 text-blue-600",
            )}
          />
        </div>
      </button>
    </div>
  );
}
