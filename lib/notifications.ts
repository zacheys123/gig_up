// convex/types/notificationTypes.ts
import { v } from "convex/values";

// ==================== NOTIFICATION TYPES ====================
// convex/types/notificationTypes.ts
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
  "feature_announcement", // ADD THIS
  "gig_opportunity",
  "gig_created",
  "gig_interest",
  "interest_confirmation",
  "gig_selected",
  "gig_not_selected",
  "gig_favorited",
  "band_setup_info",
  "band_joined",
  "band_booking",
  "removed_from_band",
  "gig_view_milestone",
  "interest_removed",
  "band_member_left",
  "band_member_removed",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

// ==================== NOTIFICATION SETTINGS SCHEMA ====================

export const notificationSettingsSchema = {
  userId: v.string(),

  // Profile & Social
  profileViews: v.boolean(),
  likes: v.boolean(),
  shares: v.boolean(),
  reviews: v.boolean(),
  followRequests: v.boolean(),
  comments: v.boolean(),

  // Gigs & Bookings (UPDATED - Add missing settings)
  gigInvites: v.boolean(),
  gigOpportunities: v.boolean(), // NEW: For gig_opportunity notifications
  gigUpdates: v.boolean(), // NEW: For most gig-related updates
  bookingRequests: v.boolean(),
  bookingConfirmations: v.boolean(),
  gigReminders: v.boolean(),
  bandInvites: v.boolean(), // NEW: For band-related notifications

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
// convex/types/notificationTypes.ts
export type NotificationSettings = {
  userId: string;

  // Profile & Social
  profileViews: boolean;
  likes: boolean;
  shares: boolean;
  reviews: boolean;
  followRequests: boolean;
  comments: boolean;

  // Gigs & Bookings (UPDATED)
  gigInvites: boolean;
  gigOpportunities: boolean; // NEW
  gigUpdates: boolean; // NEW
  bookingRequests: boolean;
  bookingConfirmations: boolean;
  gigReminders: boolean;
  bandInvites: boolean; // NEW

  // Messages & Communication
  newMessages: boolean;
  messageRequests: boolean;

  // System & Updates
  systemUpdates: boolean;
  featureAnnouncements: boolean;
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
// convex/types/notificationTypes.ts
export const DEFAULT_NOTIFICATION_SETTINGS: Omit<
  NotificationSettings,
  "userId"
> = {
  // Profile & Social
  profileViews: true,
  likes: true, // Changed from false
  shares: false,
  reviews: true, // Changed from false
  followRequests: true, // Changed from false
  comments: true, // Changed from false

  // Gigs & Bookings
  gigInvites: true,
  gigOpportunities: true, // NEW
  gigUpdates: true, // NEW
  bookingRequests: true,
  bookingConfirmations: true,
  gigReminders: true,
  bandInvites: true, // NEW

  // Messages & Communication
  newMessages: true,
  messageRequests: false,

  // System & Updates
  systemUpdates: true,
  featureAnnouncements: true,
};

// ==================== NOTIFICATION TYPE MAPPING ====================
// convex/types/notificationTypes.ts
export const NOTIFICATION_TYPE_TO_SETTING_MAP: Record<
  NotificationType,
  keyof NotificationSettings
> = {
  // Profile & Social
  profile_view: "profileViews",
  like: "likes",
  share: "shares",
  new_review: "reviews",
  review_received: "reviews",
  video_comment: "comments",

  // Follows
  new_follower: "followRequests",
  follow_request: "followRequests",
  follow_accepted: "followRequests",

  // Messages & Communication
  new_message: "newMessages",

  // Gigs & Bookings (ADD ALL THESE)
  gig_invite: "gigInvites",
  gig_opportunity: "gigOpportunities", // New gigs posted
  gig_created: "gigUpdates", // Gig created confirmation
  gig_application: "bookingRequests",
  gig_approved: "bookingConfirmations",
  gig_rejected: "bookingRequests",
  gig_cancelled: "bookingRequests",
  gig_interest: "gigUpdates",
  interest_confirmation: "gigUpdates",
  gig_selected: "gigUpdates",
  gig_not_selected: "gigUpdates",
  gig_favorited: "gigUpdates",
  gig_reminder: "gigReminders",
  gig_view_milestone: "gigUpdates",
  interest_removed: "gigUpdates",

  // Band-related (NEW)
  band_setup_info: "bandInvites",
  band_joined: "bandInvites",
  band_booking: "bandInvites",
  removed_from_band: "bandInvites",
  band_member_left: "bandInvites",
  band_member_removed: "bandInvites",

  // System
  system_updates: "systemUpdates",
  feature_announcement: "featureAnnouncements",
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
