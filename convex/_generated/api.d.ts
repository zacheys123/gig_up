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
import type * as controllers_gigs from "../controllers/gigs.js";
import type * as controllers_subscription from "../controllers/subscription.js";
import type * as controllers_user from "../controllers/user.js";
import type * as models_gigModel from "../models/gigModel.js";
import type * as models_userModel from "../models/userModel.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "controllers/gigs": typeof controllers_gigs;
  "controllers/subscription": typeof controllers_subscription;
  "controllers/user": typeof controllers_user;
  "models/gigModel": typeof models_gigModel;
  "models/userModel": typeof models_userModel;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
