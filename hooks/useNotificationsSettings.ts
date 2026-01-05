// hooks/useNotificationSettings.ts - UPDATED TO SEND ALL SETTINGS
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useMemo } from "react";
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  NotificationSettings,
} from "@/lib/notifications";
// hooks/useNotificationSystem.ts - Update the mapping
const notificationTypeToSettingMap = {
  // Profile & Social
  profile_view: "profileViews",
  new_follower: "followRequests",
  follow_request: "followRequests",
  follow_accepted: "followRequests",
  like: "likes",
  new_review: "reviews",
  review_received: "reviews",
  share: "shares",
  video_comment: "comments",

  // Messages
  new_message: "newMessages",

  // Gigs & Bookings (ADD THESE)
  gig_invite: "gigInvites",
  gig_opportunity: "gigOpportunities", // NEW
  gig_created: "gigUpdates", // NEW
  gig_application: "bookingRequests",
  gig_approved: "bookingConfirmations",
  gig_rejected: "bookingRequests",
  gig_cancelled: "bookingRequests",
  gig_interest: "gigUpdates", // NEW
  interest_confirmation: "gigUpdates", // NEW
  gig_selected: "gigUpdates", // NEW
  gig_not_selected: "gigUpdates", // NEW
  gig_favorited: "gigUpdates", // NEW
  gig_reminder: "gigReminders",
  gig_view_milestone: "gigUpdates", // NEW
  interest_removed: "gigUpdates", // NEW

  // Band-related (NEW)
  band_setup_info: "bandInvites", // NEW
  band_joined: "bandInvites", // NEW
  band_booking: "bandInvites", // NEW
  removed_from_band: "bandInvites", // NEW
  band_member_left: "bandInvites", // NEW
  band_member_removed: "bandInvites", // NEW

  // System
  system_updates: "systemUpdates",
  feature_announcement: "featureAnnouncements",
} as const;
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
      // hooks/useNotificationSettings.ts - Update the cleanSettings object
      const cleanSettings = {
        // Profile & Social
        profileViews: updatedSettings.profileViews,
        likes: updatedSettings.likes,
        shares: updatedSettings.shares,
        reviews: updatedSettings.reviews,
        followRequests: updatedSettings.followRequests,
        comments: updatedSettings.comments,

        // Gigs & Bookings (ADD THESE)
        gigInvites: updatedSettings.gigInvites,
        gigOpportunities: updatedSettings.gigOpportunities || false, // NEW
        gigUpdates: updatedSettings.gigUpdates || false, // NEW
        bookingRequests: updatedSettings.bookingRequests,
        bookingConfirmations: updatedSettings.bookingConfirmations,
        gigReminders: updatedSettings.gigReminders,
        bandInvites: updatedSettings.bandInvites || false, // NEW

        // Messages
        newMessages: updatedSettings.newMessages,
        messageRequests: updatedSettings.messageRequests,

        // System
        systemUpdates: updatedSettings.systemUpdates,
        featureAnnouncements: updatedSettings.featureAnnouncements,
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
