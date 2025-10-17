// hooks/useNotificationSettings.ts - UPDATED TO SEND ALL SETTINGS
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useMemo } from "react";
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  NotificationSettings,
} from "@/convex/notificationsTypes";

export const useNotificationSettings = () => {
  const { userId } = useAuth();

  const settingsData = useQuery(
    api.controllers.notifications.getNotificationSettings,
    userId ? { userId } : "skip"
  );

  const updateSettingsMutation = useMutation(
    api.controllers.notifications.updateNotificationSettings
  );

  const settings = useMemo((): NotificationSettings => {
    if (!settingsData) {
      return { ...DEFAULT_NOTIFICATION_SETTINGS, userId: userId || "" };
    }
    return settingsData as NotificationSettings;
  }, [settingsData, userId]);

  // Update single setting - sends ALL settings with the updated field
  const updateSingleSetting = useCallback(
    async (key: keyof NotificationSettings, value: boolean) => {
      if (!userId) throw new Error("User not authenticated");

      // Create updated settings with ALL fields
      const updatedSettings: NotificationSettings = {
        ...settings, // Current settings (all fields)
        [key]: value, // Update the specific field
        userId, // Ensure userId is included
      };

      // Remove userId before sending (backend will handle it)
      const { userId: _, ...settingsToUpdate } = updatedSettings;

      return updateSettingsMutation({
        userId,
        settings: settingsToUpdate,
      });
    },
    [userId, updateSettingsMutation, settings] // Add settings to dependencies
  );

  // Update multiple settings at once
  // Alternative: Simple filtering in the update function
  const updateSettings = useCallback(
    async (newSettings: Partial<NotificationSettings>) => {
      if (!userId) throw new Error("User not authenticated");

      // Merge with current settings
      const updatedSettings = { ...settings, ...newSettings };

      // Create clean object with only the fields your validator expects
      const cleanSettings = {
        profileViews: updatedSettings.profileViews,
        followRequests: updatedSettings.followRequests,
        gigInvites: updatedSettings.gigInvites,
        bookingRequests: updatedSettings.bookingRequests,
        bookingConfirmations: updatedSettings.bookingConfirmations,
        gigReminders: updatedSettings.gigReminders,
        newMessages: updatedSettings.newMessages,
        messageRequests: updatedSettings.messageRequests,
        systemUpdates: updatedSettings.systemUpdates,
        featureAnnouncements: updatedSettings.featureAnnouncements,
        securityAlerts: updatedSettings.securityAlerts,
        promotionalEmails: updatedSettings.promotionalEmails,
        newsletter: updatedSettings.newsletter,
        // Add push settings if your validator expects them
        pushEnabled: updatedSettings.pushEnabled,
        pushProfileViews: updatedSettings.pushProfileViews,
        pushFollowRequests: updatedSettings.pushFollowRequests,
        pushGigInvites: updatedSettings.pushGigInvites,
        pushBookingRequests: updatedSettings.pushBookingRequests,
        pushBookingConfirmations: updatedSettings.pushBookingConfirmations,
        pushGigReminders: updatedSettings.pushGigReminders,
        pushNewMessages: updatedSettings.pushNewMessages,
        pushSystemUpdates: updatedSettings.pushSystemUpdates,
      };

      return updateSettingsMutation({
        userId,
        settings: cleanSettings,
      });
    },
    [userId, updateSettingsMutation, settings]
  );

  return {
    settings,
    updateSettings,
    updateSingleSetting,
    isLoading: settingsData === undefined,
  };
};
