export type AdminPermission =
  | "user_management"
  | "content_management"
  | "payment_management"
  | "analytics"
  | "feature_flags"
  | "content_moderation"
  | "all";

export type AdminRole = "super" | "content" | "support" | "analytics";

export interface AdminUser {
  clerkId: string;
  adminRole: AdminRole;
  adminPermissions: AdminPermission[];
  isAdmin: boolean;
}
