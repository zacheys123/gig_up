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
import type * as cloudinary from "../cloudinary.js";
import type * as controllers_chat from "../controllers/chat.js";
import type * as controllers_debug from "../controllers/debug.js";
import type * as controllers_gigs from "../controllers/gigs.js";
import type * as controllers_notifications from "../controllers/notifications.js";
import type * as controllers_socials from "../controllers/socials.js";
import type * as controllers_subscription from "../controllers/subscription.js";
import type * as controllers_theme from "../controllers/theme.js";
import type * as controllers_user from "../controllers/user.js";
import type * as createNotificationInternal from "../createNotificationInternal.js";
import type * as models_gigModel from "../models/gigModel.js";
import type * as models_notificationSettings from "../models/notificationSettings.js";
import type * as models_notificationsModel from "../models/notificationsModel.js";
import type * as models_push from "../models/push.js";
import type * as models_userModel from "../models/userModel.js";
import type * as notificationsTypes from "../notificationsTypes.js";
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
  cloudinary: typeof cloudinary;
  "controllers/chat": typeof controllers_chat;
  "controllers/debug": typeof controllers_debug;
  "controllers/gigs": typeof controllers_gigs;
  "controllers/notifications": typeof controllers_notifications;
  "controllers/socials": typeof controllers_socials;
  "controllers/subscription": typeof controllers_subscription;
  "controllers/theme": typeof controllers_theme;
  "controllers/user": typeof controllers_user;
  createNotificationInternal: typeof createNotificationInternal;
  "models/gigModel": typeof models_gigModel;
  "models/notificationSettings": typeof models_notificationSettings;
  "models/notificationsModel": typeof models_notificationsModel;
  "models/push": typeof models_push;
  "models/userModel": typeof models_userModel;
  notificationsTypes: typeof notificationsTypes;
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
