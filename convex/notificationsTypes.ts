// convex/types/notificationTypes.ts
import { v } from "convex/values";

// ==================== NOTIFICATION TYPES ====================
export const NOTIFICATION_TYPES = [
  "profile_view",
  "new_message",
  "gig_invite",
  "gig_application",
  "gig_approved",
  "gig_rejected",
  "gig_cancelled",
  "gig_reminder",
  "new_follower",
  "follow_request",
  "follow_accepted",
  "new_review",
  "like",
  "share",
  "review_received",
  "system_alert",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

// ==================== NOTIFICATION SETTINGS SCHEMA ====================
// Make all push notification fields optional since they're not being used yet
// Remove all push notification fields
export const notificationSettingsSchema = {
  userId: v.string(),

  // In-app notifications only
  bookingConfirmations: v.boolean(),
  bookingRequests: v.boolean(),
  featureAnnouncements: v.boolean(),
  followRequests: v.boolean(),
  gigInvites: v.boolean(),
  gigReminders: v.boolean(),
  messageRequests: v.boolean(),
  newMessages: v.boolean(),
  newsletter: v.boolean(),
  profileViews: v.boolean(),
  promotionalEmails: v.boolean(),
  securityAlerts: v.boolean(),
  systemUpdates: v.boolean(),

  // REMOVED: All push notification fields
};

// ==================== NOTIFICATION MODEL SCHEMA ====================
export const notificationModelSchema = {
  // Target user (who receives the notification)
  userId: v.string(),
  type: v.union(...(NOTIFICATION_TYPES.map((t) => v.literal(t)) as any)),

  // Notification content
  title: v.string(),
  message: v.string(),
  image: v.optional(v.string()),

  // Action data
  actionUrl: v.optional(v.string()),
  actionLabel: v.optional(v.string()),

  // Related entities
  relatedUserId: v.optional(v.string()),
  relatedGigId: v.optional(v.string()),
  relatedMessageId: v.optional(v.string()),

  // Metadata
  metadata: v.optional(v.any()),

  // Status
  isRead: v.boolean(),
  isArchived: v.boolean(),

  // Timestamps
  createdAt: v.number(),
  readAt: v.optional(v.number()),
};

// ==================== TYPE DEFINITIONS ====================
export type NotificationSettings = {
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
};

export type Notification = {
  _id: string;
  _creationTime: number;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  image?: string;
  actionUrl?: string;
  actionLabel?: string;
  relatedUserId?: string;
  relatedGigId?: string;
  relatedMessageId?: string;
  metadata?: any;
  isRead: boolean;
  isArchived: boolean;
  createdAt: number;
  readAt?: number;
};

// ==================== DEFAULT SETTINGS ====================
// convex/types/notificationTypes.ts - FIX DEFAULT SETTINGS
// Define default settings WITHOUT userId
export const DEFAULT_NOTIFICATION_SETTINGS: Omit<
  NotificationSettings,
  "userId"
> = {
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

// ==================== NOTIFICATION TYPE MAPPING ====================
export const NOTIFICATION_TYPE_TO_SETTING_MAP: Record<
  NotificationType,
  keyof NotificationSettings
> = {
  // Profile & Social
  profile_view: "profileViews",
  new_follower: "followRequests",
  follow_request: "followRequests",
  follow_accepted: "followRequests",
  like: "profileViews",
  new_review: "profileViews",
  review_received: "profileViews",
  share: "profileViews",

  // Messages & Communication
  new_message: "newMessages",

  // Gigs & Bookings
  gig_invite: "gigInvites",
  gig_application: "bookingRequests",
  gig_approved: "bookingConfirmations",
  gig_rejected: "bookingRequests",
  gig_cancelled: "bookingRequests",
  gig_reminder: "gigReminders",

  // System
  system_alert: "systemUpdates",
};

// ==================== HELPER TYPES ====================
export type CreateNotificationArgs = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  image?: string;
  actionUrl?: string;
  relatedUserId?: string;
  metadata?: any;
};

export type UpdateNotificationSettingsArgs = Omit<
  NotificationSettings,
  "userId"
>;
