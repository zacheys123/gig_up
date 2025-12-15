// convex/adminTypes.ts
export type AdminPermission =
  | "all"
  | "content_management"
  | "feature_flags"
  | "user_management"
  | "analytics"
  | "content_moderation"
  | "payment_management"
  | "notification_management"
  | "support_management" // Changed from "support_tickets"
  | "system_settings"
  | "security" // Changed from "billing_management"
  | "api_management" // Changed from "api_access"
  | "infrastructure"
  | "moderation"
  | "user_support" // Changed from "marketing"
  | "reports"
  | "data_export"
  | "super" // These 4 might be admin roles, not permissions
  | "content" // Might want to remove these from permissions
  | "support" // and keep them only in adminRole
  | "analytics"; // Might want to remove these from permissions

export type AdminRole = "super" | "content" | "support" | "analytics";
export type AdminAccessLevel = "full" | "limited" | "restricted";
export interface AdminUser {
  clerkId: string;
  adminRole: AdminRole;
  adminPermissions: AdminPermission[];
  isAdmin: boolean;
}
