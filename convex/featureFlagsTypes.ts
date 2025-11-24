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
