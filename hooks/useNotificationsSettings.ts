// hooks/useNotificationSettings.ts
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useMemo } from "react";

export interface NotificationSettings {
  userId: string;
  // Profile & Social
  profileViews: boolean;
  followRequests: boolean;

  // Gigs & Bookings
  gigInvites: boolean;
  bookingRequests: boolean;
  bookingConfirmations: boolean;
  gigReminders: boolean;

  // Messages & Communication
  newMessages: boolean;
  messageRequests: boolean;

  // System & Updates
  systemUpdates: boolean;
  featureAnnouncements: boolean;
  securityAlerts: boolean;

  // Marketing
  promotionalEmails: boolean;
  newsletter: boolean;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  userId: "",
  // Profile & Social
  profileViews: true,
  followRequests: true,

  // Gigs & Bookings
  gigInvites: true,
  bookingRequests: true,
  bookingConfirmations: true,
  gigReminders: true,

  // Messages & Communication
  newMessages: true,
  messageRequests: true,

  // System & Updates
  systemUpdates: true,
  featureAnnouncements: false,
  securityAlerts: true,

  // Marketing
  promotionalEmails: false,
  newsletter: false,
};

export const useNotificationSettings = () => {
  const { userId } = useAuth();

  const settingsData = useQuery(
    api.controllers.notifications.getNotificationSettings,
    userId ? { userId } : "skip"
  );

  const updateSettingsMutation = useMutation(
    api.controllers.notifications.updateNotificationSettings
  );

  // Memoize the settings to prevent unnecessary re-renders
  const settings = useMemo(() => {
    if (!settingsData) {
      return { ...DEFAULT_NOTIFICATION_SETTINGS };
    }
    return settingsData;
  }, [settingsData]);

  // Memoize the update function
  const updateSettings = useCallback(
    async (newSettings: NotificationSettings) => {
      if (!userId) throw new Error("User not authenticated");

      // Remove userId if it exists (backend will handle it)
      const { userId: _, ...settingsToUpdate } = newSettings;

      return updateSettingsMutation({
        userId,
        settings: settingsToUpdate,
      });
    },
    [userId, updateSettingsMutation]
  );

  return {
    settings,
    updateSettings,
    isLoading: settingsData === undefined,
  };
};
