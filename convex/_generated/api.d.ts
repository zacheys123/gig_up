/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as adminTypes from "../adminTypes.js";
import type * as cloudinary from "../cloudinary.js";
import type * as controllers_admin_users from "../controllers/admin/users.js";
import type * as controllers_adminFuncs from "../controllers/adminFuncs.js";
import type * as controllers_chat from "../controllers/chat.js";
import type * as controllers_comments from "../controllers/comments.js";
import type * as controllers_debug from "../controllers/debug.js";
import type * as controllers_deputies from "../controllers/deputies.js";
import type * as controllers_featureFlags from "../controllers/featureFlags.js";
import type * as controllers_gigs from "../controllers/gigs.js";
import type * as controllers_instantGigs from "../controllers/instantGigs.js";
import type * as controllers_musicians from "../controllers/musicians.js";
import type * as controllers_notifications from "../controllers/notifications.js";
import type * as controllers_ratings from "../controllers/ratings.js";
import type * as controllers_reviews from "../controllers/reviews.js";
import type * as controllers_socials from "../controllers/socials.js";
import type * as controllers_subscription from "../controllers/subscription.js";
import type * as controllers_testimonials from "../controllers/testimonials.js";
import type * as controllers_theme from "../controllers/theme.js";
import type * as controllers_user from "../controllers/user.js";
import type * as controllers_videos from "../controllers/videos.js";
import type * as createNotificationInternal from "../createNotificationInternal.js";
import type * as featureFlagsTypes from "../featureFlagsTypes.js";
import type * as gigTypes from "../gigTypes.js";
import type * as instantGigsTypes from "../instantGigsTypes.js";
import type * as models_commentsModel from "../models/commentsModel.js";
import type * as models_gigModel from "../models/gigModel.js";
import type * as models_instanGigsModel from "../models/instanGigsModel.js";
import type * as models_notificationSettings from "../models/notificationSettings.js";
import type * as models_notificationsModel from "../models/notificationsModel.js";
import type * as models_push from "../models/push.js";
import type * as models_userModel from "../models/userModel.js";
import type * as models_videoModel from "../models/videoModel.js";
import type * as musicianmetrics from "../musicianmetrics.js";
import type * as notHelpers from "../notHelpers.js";
import type * as notificationsTypes from "../notificationsTypes.js";
import type * as presence from "../presence.js";
import type * as test from "../test.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  adminTypes: typeof adminTypes;
  cloudinary: typeof cloudinary;
  "controllers/admin/users": typeof controllers_admin_users;
  "controllers/adminFuncs": typeof controllers_adminFuncs;
  "controllers/chat": typeof controllers_chat;
  "controllers/comments": typeof controllers_comments;
  "controllers/debug": typeof controllers_debug;
  "controllers/deputies": typeof controllers_deputies;
  "controllers/featureFlags": typeof controllers_featureFlags;
  "controllers/gigs": typeof controllers_gigs;
  "controllers/instantGigs": typeof controllers_instantGigs;
  "controllers/musicians": typeof controllers_musicians;
  "controllers/notifications": typeof controllers_notifications;
  "controllers/ratings": typeof controllers_ratings;
  "controllers/reviews": typeof controllers_reviews;
  "controllers/socials": typeof controllers_socials;
  "controllers/subscription": typeof controllers_subscription;
  "controllers/testimonials": typeof controllers_testimonials;
  "controllers/theme": typeof controllers_theme;
  "controllers/user": typeof controllers_user;
  "controllers/videos": typeof controllers_videos;
  createNotificationInternal: typeof createNotificationInternal;
  featureFlagsTypes: typeof featureFlagsTypes;
  gigTypes: typeof gigTypes;
  instantGigsTypes: typeof instantGigsTypes;
  "models/commentsModel": typeof models_commentsModel;
  "models/gigModel": typeof models_gigModel;
  "models/instanGigsModel": typeof models_instanGigsModel;
  "models/notificationSettings": typeof models_notificationSettings;
  "models/notificationsModel": typeof models_notificationsModel;
  "models/push": typeof models_push;
  "models/userModel": typeof models_userModel;
  "models/videoModel": typeof models_videoModel;
  musicianmetrics: typeof musicianmetrics;
  notHelpers: typeof notHelpers;
  notificationsTypes: typeof notificationsTypes;
  presence: typeof presence;
  test: typeof test;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
