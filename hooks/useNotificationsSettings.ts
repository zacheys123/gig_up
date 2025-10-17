// hooks/useNotificationSettings.ts - UPDATED
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

  // Update single setting - sends only the changed field
  const updateSingleSetting = useCallback(
    async (key: keyof NotificationSettings, value: boolean) => {
      if (!userId) throw new Error("User not authenticated");

      return updateSettingsMutation({
        userId,
        settings: { [key]: value },
      });
    },
    [userId, updateSettingsMutation]
  );

  // Update multiple settings at once
  const updateSettings = useCallback(
    async (newSettings: Partial<NotificationSettings>) => {
      if (!userId) throw new Error("User not authenticated");

      // Remove userId if it exists
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
    updateSingleSetting,
    isLoading: settingsData === undefined,
  };
};
