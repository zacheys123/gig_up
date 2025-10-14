import { Doc } from "@/convex/_generated/dataModel";

// types/notificationTypes.ts
export type NotificationType =
  | "profile_view"
  | "new_message"
  | "gig_application"
  | "gig_approved"
  | "gig_rejected"
  | "new_follower"
  | "review_received"
  | "system_alert";

export type Notification = Doc<"notifications">;

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
}

export interface UserNotificationSettings {
  userId: string; // clerkId
  preferences: {
    [key in NotificationType]: NotificationPreferences;
  };
  muteUntil?: number;
  quietHours?: {
    start: number; // 0-23
    end: number; // 0-23
    enabled: boolean;
  };
}
