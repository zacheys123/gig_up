// convex/types.ts
export type FeatureFlagKey =
  | "teacher_dashboard"
  | "lesson_scheduling"
  | "student_management"
  | "dj_equipment_rental"
  | "mc_event_hosting"
  | "playlist_management"
  | "file_sharing"
  | "advanced_messaging"
  | "calendar_sync";

export type UserRole =
  | "all"
  | "teacher"
  | "instrumentalist"
  | "vocalist"
  | "dj"
  | "mc"
  | "individual_client"
  | "event_planner_client"
  | "venue_client"
  | "corporate_client"
  | "talent_agent"
  | "booking_manager";

import { ReactNode } from "react";

/**
 * Interface for discoverable features in the platform
 * Each feature corresponds to a feature flag and appears automatically
 * when the flag is enabled for the user's role and tier
 */
export interface DiscoverableFeature {
  /**
   * Unique identifier - MUST match the feature flag ID from lib/feature-flags/types.ts
   * Example: "vocal_warmups", "corporate_tools", "lesson_scheduling"
   */
  id: string;

  /**
   * Display name shown to users
   * Example: "Vocal Warmups", "Corporate Suite", "Lesson Scheduler"
   */
  name: string;

  /**
   * Brief description of the feature
   * Example: "Professional vocal exercises and routines"
   */
  description: string;

  /**
   * URL path where the feature is located
   * Example: "/dashboard/vocal-warmups", "/dashboard/corporate-tools"
   */
  href: string;

  /**
   * Icon component from Lucide React or custom React node
   * Example: <Volume2 className="w-5 h-5" />
   */
  icon: ReactNode;

  /**
   * Optional badge to highlight the feature
   * - "NEW": Recently launched feature
   * - "COMING_SOON": Feature in development
   * - "PRO": Requires Pro tier
   * - "PREMIUM": Requires Premium tier
   */
  badge?: "NEW" | "COMING_SOON" | "PRO" | "PREMIUM";

  /**
   * Where this feature should appear in the UI
   * - "sidebar": Quick access in sidebar (max 3-4 features)
   * - "dashboard": Main tools in dashboard grid
   * - "spotlight": Featured tools for marketing/promotion
   */
  category: "sidebar" | "dashboard" | "spotlight";

  /**
   * Optional: Restrict feature to specific user tiers
   * If undefined, feature is available to all tiers
   * Example: ["premium", "pro", "elite"] - only for paid tiers
   */
  availableForTiers?: string[];

  /**
   * Optional: Require complete user profile to access
   * If true, users must complete their profile before seeing this feature
   */
  requiresCompleteProfile?: boolean;
}
