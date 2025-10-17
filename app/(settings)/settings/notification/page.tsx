// app/notifications/page.tsx
"use client";

import { Switch } from "@/components/ui/switch";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useThemeColors } from "@/hooks/useTheme";
import { useEffect, useState, useCallback } from "react";
import { Bell, ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  useNotificationSettings,
} from "@/hooks/useNotificationsSettings";
import { motion } from "framer-motion";

const NotificationsPage = () => {
  const { user } = useCurrentUser();
  const { colors, isDarkMode } = useThemeColors();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const {
    settings: actualSettings,
    updateSettings,
    isLoading,
  } = useNotificationSettings();

  const [settings, setSettings] = useState(DEFAULT_NOTIFICATION_SETTINGS);

  // Fix: Add proper dependency and condition
  useEffect(() => {
    if (
      actualSettings &&
      JSON.stringify(actualSettings) !== JSON.stringify(settings)
    ) {
      setSettings(actualSettings);
    }
  }, [actualSettings]); // Remove settings from dependencies

  const handleToggle = useCallback(
    (key: keyof typeof DEFAULT_NOTIFICATION_SETTINGS) => {
      setSettings((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    },
    []
  );

  const handleSave = async () => {
    if (!user?.clerkId) {
      toast.error("You must be logged in to save settings");
      return;
    }

    setSaving(true);
    try {
      await updateSettings(settings);
      toast.success("Notification preferences saved!");
    } catch (error) {
      console.error("Failed to save notification settings:", error);
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_NOTIFICATION_SETTINGS);
    toast.success("Reset to default settings");
  }, []);

  const muteAll = useCallback(() => {
    setSettings({
      ...DEFAULT_NOTIFICATION_SETTINGS,
      profileViews: false,
      followRequests: false,
      gigInvites: false,
      bookingRequests: false,
      bookingConfirmations: false,
      gigReminders: false,
      newMessages: false,
      messageRequests: false,
      systemUpdates: false,
      featureAnnouncements: false,
      promotionalEmails: false,
      newsletter: false,
      // Keep security alerts on
      securityAlerts: true,
    });
    toast.success("Muted all non-essential notifications");
  }, []);

  // Memoize the components to prevent unnecessary re-renders
  const NotificationSection = useCallback(
    ({
      title,
      description,
      children,
    }: {
      title: string;
      description?: string;
      children: React.ReactNode;
    }) => (
      <div
        className={cn(
          "rounded-lg border p-6",
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        )}
      >
        <div className="mb-4">
          <h3
            className={cn(
              "text-lg font-semibold mb-1",
              isDarkMode ? "text-white" : "text-gray-900"
            )}
          >
            {title}
          </h3>
          {description && (
            <p
              className={cn(
                "text-sm",
                isDarkMode ? "text-gray-400" : "text-gray-600"
              )}
            >
              {description}
            </p>
          )}
        </div>
        <div className="space-y-4">{children}</div>
      </div>
    ),
    [isDarkMode]
  );
  const NotificationToggle = useCallback(
    ({
      label,
      description,
      enabled,
      onChange,
    }: {
      label: string;
      description?: string;
      enabled: boolean;
      onChange: () => void;
    }) => (
      <div
        className={cn(
          "group relative flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl border-2 transition-all duration-500 ease-out cursor-pointer overflow-hidden",
          "hover:scale-[1.02] hover:shadow-2xl transform-gpu min-h-[120px] sm:min-h-0",
          enabled
            ? [
                "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
                "border-green-200 dark:border-green-700/50",
                "shadow-lg shadow-green-500/10 dark:shadow-green-500/5",
                "hover:shadow-xl hover:shadow-green-500/20 dark:hover:shadow-green-500/10",
              ]
            : [
                "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50",
                "border-gray-200 dark:border-gray-700",
                "shadow-lg shadow-gray-500/5 dark:shadow-black/20",
                "hover:shadow-xl hover:shadow-gray-500/10 dark:hover:shadow-black/30",
              ]
        )}
        onClick={onChange}
      >
        {/* Background Glow Effect */}
        <div
          className={cn(
            "absolute inset-0 rounded-2xl transition-all duration-700 ease-out",
            enabled
              ? "bg-gradient-to-r from-green-500/5 to-emerald-500/5 dark:from-green-400/10 dark:to-emerald-400/10"
              : "bg-gradient-to-r from-gray-500/3 to-slate-500/3 dark:from-gray-400/5 dark:to-slate-400/5"
          )}
        />

        {/* Animated Border Glow */}
        <div
          className={cn(
            "absolute inset-0 rounded-2xl border-2 transition-all duration-700 ease-out",
            enabled
              ? "border-green-300/50 dark:border-green-500/30 scale-105 opacity-100"
              : "border-transparent scale-100 opacity-0"
          )}
        />

        {/* Content Container - Flex column on mobile, row on desktop */}
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 flex-1 z-10 w-full">
          {/* Icon Container */}
          <div
            className={cn(
              "relative flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-all duration-500 ease-out transform-gpu",
              "group-hover:scale-110 shadow-lg",
              enabled
                ? [
                    "bg-gradient-to-br from-green-500 to-emerald-600",
                    "shadow-green-500/25 dark:shadow-green-500/40",
                    "text-white",
                  ]
                : [
                    "bg-gradient-to-br from-gray-400 to-slate-500",
                    "shadow-gray-500/20 dark:shadow-gray-600/30",
                    "text-gray-100 dark:text-gray-300",
                  ]
            )}
          >
            {/* Animated Check/X Mark */}
            <div className="relative w-5 h-5 sm:w-6 sm:h-6">
              {enabled ? (
                // Check Mark
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 transition-all duration-500 ease-out transform-gpu"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  viewBox="0 0 24 24"
                >
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                // X Mark
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 transition-all duration-500 ease-out transform-gpu"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  viewBox="0 0 24 24"
                >
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </div>

            {/* Floating Particles */}
            <div
              className={cn(
                "absolute inset-0 rounded-xl overflow-hidden",
                enabled ? "opacity-100" : "opacity-0"
              )}
            >
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "absolute w-1 h-1 bg-white/30 rounded-full animate-pulse",
                    i === 0 && "top-1 left-2",
                    i === 1 && "top-3 right-2",
                    i === 2 && "bottom-2 left-3"
                  )}
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
          </div>

          {/* Text Content - Full width on mobile */}
          <div className="flex-1 min-w-0 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 w-full">
              <h4
                className={cn(
                  "font-bold text-lg sm:text-base lg:text-lg tracking-tight transition-all duration-300 break-words",
                  "flex-1 min-w-0",
                  enabled
                    ? "text-green-900 dark:text-green-100"
                    : "text-gray-900 dark:text-gray-100"
                )}
              >
                {label}
              </h4>

              {/* Status Badge */}
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold transition-all duration-500 ease-out transform-gpu",
                  "shadow-md backdrop-blur-sm w-fit sm:w-auto",
                  "flex items-center gap-1 self-start sm:self-auto",
                  enabled
                    ? [
                        "bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-200",
                        "shadow-green-500/20 dark:shadow-green-500/30",
                        "scale-100",
                      ]
                    : [
                        "bg-gray-500/20 text-gray-600 dark:bg-gray-500/30 dark:text-gray-300",
                        "shadow-gray-500/20 dark:shadow-gray-500/30",
                        "scale-95",
                      ]
                )}
              >
                {enabled ? (
                  <>
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
                    <span className="whitespace-nowrap">ACTIVE</span>
                  </>
                ) : (
                  <>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0" />
                    <span className="whitespace-nowrap">INACTIVE</span>
                  </>
                )}
              </span>
            </div>

            {description && (
              <p
                className={cn(
                  "text-sm leading-relaxed transition-all duration-300 break-words",
                  "w-full max-w-none",
                  enabled
                    ? "text-green-700/80 dark:text-green-300/80"
                    : "text-gray-600 dark:text-gray-400"
                )}
              >
                {description}
              </p>
            )}
          </div>

          {/* Enhanced Animated Switch - Positioned properly */}
          <div className="relative flex-shrink-0 mt-4 sm:mt-0 sm:ml-4 lg:ml-6 z-10 self-end sm:self-auto">
            <div
              className={cn(
                "relative w-14 sm:w-16 h-7 sm:h-8 rounded-full transition-all duration-700 ease-in-out transform-gpu",
                "border-2 shadow-lg backdrop-blur-sm",
                enabled
                  ? [
                      "bg-gradient-to-r from-green-400 to-emerald-500",
                      "border-green-300 dark:border-green-500",
                      "shadow-green-500/40 dark:shadow-green-500/50",
                      "scale-105",
                    ]
                  : [
                      "bg-gradient-to-r from-gray-400 to-slate-500",
                      "border-gray-300 dark:border-gray-600",
                      "shadow-gray-500/30 dark:shadow-gray-600/40",
                      "scale-100",
                    ]
              )}
            >
              {/* Switch Track Glow */}
              <div
                className={cn(
                  "absolute inset-0 rounded-full transition-all duration-500 ease-out",
                  enabled ? "bg-green-400/20 animate-pulse" : "bg-gray-400/10"
                )}
              />

              {/* Animated Knob */}
              <div
                className={cn(
                  "absolute top-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full transition-all duration-700 ease-in-out transform-gpu",
                  "shadow-xl border backdrop-blur-sm",
                  enabled
                    ? [
                        "left-7 sm:left-9 bg-white border-green-100",
                        "shadow-green-500/50 dark:shadow-green-400/50",
                        "rotate-12",
                      ]
                    : [
                        "left-1 bg-white border-gray-100",
                        "shadow-gray-500/40 dark:shadow-gray-400/40",
                        "rotate-0",
                      ]
                )}
              >
                {/* Knob Inner Glow */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-full transition-all duration-500 ease-out",
                    enabled ? "bg-green-400/20 animate-pulse" : "bg-gray-400/10"
                  )}
                />
              </div>

              {/* Switch Icons */}
              <div className="absolute inset-0 flex items-center justify-between px-2 sm:px-3">
                {/* Off Icon */}
                <svg
                  className={cn(
                    "w-2.5 h-2.5 sm:w-3 sm:h-3 transition-all duration-500 ease-out transform-gpu",
                    enabled ? "text-white/0 scale-0" : "text-white/90 scale-100"
                  )}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 13H5v-2h14v2z" />
                </svg>

                {/* On Icon */}
                <svg
                  className={cn(
                    "w-2.5 h-2.5 sm:w-3 sm:h-3 transition-all duration-500 ease-out transform-gpu",
                    enabled ? "text-white/90 scale-100" : "text-white/0 scale-0"
                  )}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
            </div>

            {/* Instruction Text */}
            <div
              className={cn(
                "text-xs font-medium text-center mt-2 transition-all duration-300 transform-gpu whitespace-nowrap",
                "hidden sm:block", // Hide on mobile to save space
                enabled
                  ? "text-green-600 dark:text-green-400 scale-100"
                  : "text-gray-500 dark:text-gray-400 scale-95"
              )}
            >
              {enabled ? "Click to disable" : "Click to enable"}
            </div>
          </div>
        </div>

        {/* Hover Ripple Effect */}
        <div
          className={cn(
            "absolute inset-0 rounded-2xl transition-all duration-500 ease-out opacity-0 pointer-events-none",
            "group-hover:opacity-100",
            enabled
              ? "bg-green-500/5 dark:bg-green-400/5"
              : "bg-gray-500/5 dark:bg-gray-400/5"
          )}
        />

        {/* Active Pulse Effect */}
        {enabled && (
          <div className="absolute inset-0 rounded-2xl bg-green-500/10 animate-pulse pointer-events-none" />
        )}
      </div>
    ),
    [isDarkMode]
  );

  if (isLoading) {
    return (
      <div
        className={cn(
          "min-h-screen py-8 flex items-center justify-center",
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        )}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p
            className={cn(
              "text-sm",
              isDarkMode ? "text-gray-400" : "text-gray-600"
            )}
          >
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen py-8",
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      )}
    >
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className={cn(
                "hover:bg-opacity-20",
                isDarkMode
                  ? "hover:bg-white text-white"
                  : "hover:bg-gray-200 text-gray-700"
              )}
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1
                className={cn(
                  "text-2xl font-bold",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}
              >
                Notifications
              </h1>
              <p
                className={cn(
                  "text-sm",
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                )}
              >
                Manage how you receive notifications
              </p>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save size={16} />
                Save Changes
              </div>
            )}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Profile & Social */}
          <NotificationSection
            title="Profile & Social"
            description="Notifications about your profile and social interactions"
          >
            <NotificationToggle
              label="Profile Views"
              description="When someone views your profile"
              enabled={settings.profileViews}
              onChange={() => handleToggle("profileViews")}
            />

            <NotificationToggle
              label="Follow Requests"
              description="When someone requests to follow you"
              enabled={settings.followRequests}
              onChange={() => handleToggle("followRequests")}
            />
          </NotificationSection>

          {/* Gigs & Bookings */}
          <NotificationSection
            title="Gigs & Bookings"
            description="Notifications about gig opportunities and bookings"
          >
            <NotificationToggle
              label="Gig Invites"
              description="When you receive new gig invitations"
              enabled={settings.gigInvites}
              onChange={() => handleToggle("gigInvites")}
            />
            <NotificationToggle
              label="Booking Requests"
              description="When someone wants to book you"
              enabled={settings.bookingRequests}
              onChange={() => handleToggle("bookingRequests")}
            />
            <NotificationToggle
              label="Booking Confirmations"
              description="When your bookings are confirmed"
              enabled={settings.bookingConfirmations}
              onChange={() => handleToggle("bookingConfirmations")}
            />
            <NotificationToggle
              label="Gig Reminders"
              description="Reminders for upcoming gigs"
              enabled={settings.gigReminders}
              onChange={() => handleToggle("gigReminders")}
            />
          </NotificationSection>

          {/* Messages */}
          <NotificationSection
            title="Messages & Communication"
            description="Notifications about messages and communication"
          >
            <NotificationToggle
              label="New Messages"
              description="When you receive new messages"
              enabled={settings.newMessages}
              onChange={() => handleToggle("newMessages")}
            />
            <NotificationToggle
              label="Message Requests"
              description="When you receive message requests"
              enabled={settings.messageRequests}
              onChange={() => handleToggle("messageRequests")}
            />
          </NotificationSection>

          {/* System & Updates */}
          <NotificationSection
            title="System & Updates"
            description="Important updates about the platform"
          >
            <NotificationToggle
              label="System Updates"
              description="Important platform updates and maintenance"
              enabled={settings.systemUpdates}
              onChange={() => handleToggle("systemUpdates")}
            />
            <NotificationToggle
              label="Feature Announcements"
              description="New features and improvements"
              enabled={settings.featureAnnouncements}
              onChange={() => handleToggle("featureAnnouncements")}
            />
            <NotificationToggle
              label="Security Alerts"
              description="Important security notifications"
              enabled={settings.securityAlerts}
              onChange={() => handleToggle("securityAlerts")}
            />
          </NotificationSection>

          {/* Marketing */}
          <NotificationSection
            title="Marketing & News"
            description="Promotional emails and newsletters"
          >
            <NotificationToggle
              label="Promotional Emails"
              description="Special offers and promotions"
              enabled={settings.promotionalEmails}
              onChange={() => handleToggle("promotionalEmails")}
            />
            <NotificationToggle
              label="Newsletter"
              description="Weekly newsletter and updates"
              enabled={settings.newsletter}
              onChange={() => handleToggle("newsletter")}
            />
          </NotificationSection>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex gap-4">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            className={cn(
              isDarkMode
                ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            )}
          >
            Reset to Defaults
          </Button>

          <Button
            variant="outline"
            onClick={muteAll}
            className={cn(
              isDarkMode
                ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            )}
          >
            Mute All
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
