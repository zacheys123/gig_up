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
  "video_comment",
  "review_received",
  "system_updates",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

// ==================== NOTIFICATION SETTINGS SCHEMA ====================
// Make all push notification fields optional since they're not being used yet
// Remove all push notification fields
export const notificationSettingsSchema = {
  userId: v.string(),

  // Profile & Social (UPDATED)
  profileViews: v.boolean(),
  likes: v.boolean(), // NEW
  shares: v.boolean(), // NEW
  reviews: v.boolean(), // NEW
  followRequests: v.boolean(),
  comments: v.boolean(),
  // Gigs & Bookings
  gigInvites: v.boolean(),
  bookingRequests: v.boolean(),
  bookingConfirmations: v.boolean(),
  gigReminders: v.boolean(),

  // Messages & Communication
  newMessages: v.boolean(),
  messageRequests: v.boolean(),

  // System & Updates
  systemUpdates: v.boolean(),
  featureAnnouncements: v.boolean(),
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

  // Profile & Social (UPDATED)
  profileViews: boolean;
  likes: boolean; // NEW
  shares: boolean; // NEW
  reviews: boolean; // NEW
  followRequests: boolean;
  comments: boolean;
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

  // REMOVED: promotionalEmails & newsletter
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
export const DEFAULT_NOTIFICATION_SETTINGS: Omit<
  NotificationSettings,
  "userId"
> = {
  // Profile & Social (UPDATED)
  profileViews: true,
  likes: false, // NEW
  shares: false, // NEW
  reviews: false, // NEW
  followRequests: false,
  comments: false,
  // Gigs & Bookings
  gigInvites: false,
  bookingRequests: false,
  bookingConfirmations: false,
  gigReminders: false,

  // Messages & Communication
  newMessages: false,
  messageRequests: false,

  // System & Updates
  systemUpdates: false,
  featureAnnouncements: false,

  // REMOVED: promotionalEmails & newsletter
};

// ==================== NOTIFICATION TYPE MAPPING ====================
export const NOTIFICATION_TYPE_TO_SETTING_MAP: Record<
  NotificationType,
  keyof NotificationSettings
> = {
  // Profile & Social (UPDATED)
  profile_view: "profileViews",
  like: "likes", // NEW - maps to "likes" setting
  share: "shares", // NEW - maps to "shares" setting
  new_review: "reviews", // NEW - maps to "reviews" setting
  review_received: "reviews", // NEW - maps to "reviews" setting
  video_comment: "comments",
  // Follows
  new_follower: "followRequests",
  follow_request: "followRequests",
  follow_accepted: "followRequests",

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
  system_updates: "systemUpdates",
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
