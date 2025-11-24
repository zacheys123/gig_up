// lib/feature-flags/types.ts
export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  targetUsers?: "all" | "premium" | "pro" | "free";
  targetRoles?: UserRole[];
  rolloutPercentage?: number;
}

// Simplified user roles - only essential ones
export type UserRole =
  | "all"
  // Musician roles
  | "teacher"
  | "instrumentalist"
  | "vocalist"
  | "dj"
  | "mc"
  // Client roles
  | "individual_client"
  | "event_planner_client"
  | "venue_client"
  | "corporate_client"
  // Booker roles
  | "talent_agent"
  | "booking_manager";

export type FeatureFlagKey =
  // Teacher features
  | "teacher_dashboard"
  | "lesson_scheduling"
  | "student_management"

  // DJ/MC features
  | "dj_equipment_rental"
  | "mc_event_hosting"
  | "playlist_management"

  // Instrumentalist features
  | "sheet_music_library"
  | "practice_tools"

  // Vocalist features
  | "vocal_warmups"
  | "vocal_exercises_library" // You might want both
  | "vocal_health_tips"

  // General musician features
  | "musician_portfolio"
  | "gig_history"

  // Individual Client features
  | "personal_event_planner"
  | "quick_booking"

  // Event Planner features
  | "client_event_planner"
  | "vendor_management"

  // Venue features
  | "venue_management"
  | "booking_calendar"

  // Corporate features
  | "corporate_tools"

  // Booker features
  | "artist_roster"
  | "contract_templates"

  // Cross-role features
  | "advanced_messaging"
  | "file_sharing"
  | "calendar_sync";

export const FEATURE_FLAGS_CONFIG: Record<
  FeatureFlagKey,
  Omit<FeatureFlag, "enabled" | "createdAt" | "updatedAt">
> = {
  // ==================== TEACHER FEATURES ====================
  teacher_dashboard: {
    id: "teacher_dashboard",
    name: "Teacher Dashboard",
    description: "Dashboard for music teachers",
    targetUsers: "all",
    targetRoles: ["teacher"],
    rolloutPercentage: 0,
  },
  lesson_scheduling: {
    id: "lesson_scheduling",
    name: "Lesson Scheduling",
    description: "Schedule music lessons",
    targetUsers: "all",
    targetRoles: ["teacher"],
    rolloutPercentage: 0,
  },
  student_management: {
    id: "student_management",
    name: "Student Management",
    description: "Manage student profiles",
    targetUsers: "pro",
    targetRoles: ["teacher"],
    rolloutPercentage: 0,
  },

  // ==================== DJ/MC FEATURES ====================
  dj_equipment_rental: {
    id: "dj_equipment_rental",
    name: "DJ Equipment Rental",
    description: "Rent DJ equipment",
    targetUsers: "all",
    targetRoles: ["dj"],
    rolloutPercentage: 0,
  },
  mc_event_hosting: {
    id: "mc_event_hosting",
    name: "MC Event Hosting",
    description: "Tools for MCs to host events",
    targetUsers: "all",
    targetRoles: ["mc"],
    rolloutPercentage: 0,
  },
  playlist_management: {
    id: "playlist_management",
    name: "Playlist Management",
    description: "Create and manage playlists",
    targetUsers: "all",
    targetRoles: ["dj", "mc"],
    rolloutPercentage: 0,
  },

  // ==================== INSTRUMENTALIST FEATURES ====================
  sheet_music_library: {
    id: "sheet_music_library",
    name: "Sheet Music Library",
    description: "Access to sheet music",
    targetUsers: "pro",
    targetRoles: ["instrumentalist"],
    rolloutPercentage: 0,
  },
  practice_tools: {
    id: "practice_tools",
    name: "Practice Tools",
    description: "Practice session management",
    targetUsers: "all",
    targetRoles: ["instrumentalist", "vocalist"],
    rolloutPercentage: 0,
  },

  // ==================== VOCALIST FEATURES ====================
  vocal_warmups: {
    id: "vocal_warmups",
    name: "Vocal Warmups",
    description: "Interactive vocal warmup exercises and routines",
    targetUsers: "premium",
    targetRoles: ["vocalist"],
    rolloutPercentage: 0, // Start disabled
  },

  vocal_exercises_library: {
    id: "vocal_exercises_library",
    name: "Vocal Exercises Library",
    description: "Library of vocal exercises and techniques",
    targetUsers: "pro",
    targetRoles: ["vocalist"],
    rolloutPercentage: 0,
  },

  vocal_health_tips: {
    id: "vocal_health_tips",
    name: "Vocal Health Tips",
    description: "Tips for maintaining vocal health",
    targetUsers: "all",
    targetRoles: ["vocalist"],
    rolloutPercentage: 0, // You can enable this immediately
  },

  // ==================== GENERAL MUSICIAN FEATURES ====================
  musician_portfolio: {
    id: "musician_portfolio",
    name: "Musician Portfolio",
    description: "Showcase your work",
    targetUsers: "all",
    targetRoles: ["teacher", "instrumentalist", "vocalist", "dj", "mc"],
    rolloutPercentage: 0,
  },
  gig_history: {
    id: "gig_history",
    name: "Gig History",
    description: "Track performance history",
    targetUsers: "all",
    targetRoles: ["instrumentalist", "vocalist", "dj", "mc"],
    rolloutPercentage: 0,
  },

  // ==================== INDIVIDUAL CLIENT FEATURES ====================
  personal_event_planner: {
    id: "personal_event_planner",
    name: "Personal Event Planner",
    description: "Event planning for individuals",
    targetUsers: "all",
    targetRoles: ["individual_client"],
    rolloutPercentage: 0,
  },
  quick_booking: {
    id: "quick_booking",
    name: "Quick Booking",
    description: "Streamlined booking process",
    targetUsers: "all",
    targetRoles: ["individual_client"],
    rolloutPercentage: 0,
  },

  // ==================== EVENT PLANNER FEATURES ====================
  client_event_planner: {
    id: "client_event_planner",
    name: "Event Planner Tools",
    description: "Professional event planning",
    targetUsers: "all",
    targetRoles: ["event_planner_client"],
    rolloutPercentage: 0,
  },
  vendor_management: {
    id: "vendor_management",
    name: "Vendor Management",
    description: "Manage vendor relationships",
    targetUsers: "pro",
    targetRoles: ["event_planner_client"],
    rolloutPercentage: 0,
  },

  // ==================== VENUE FEATURES ====================
  venue_management: {
    id: "venue_management",
    name: "Venue Management",
    description: "Venue management tools",
    targetUsers: "all",
    targetRoles: ["venue_client"],
    rolloutPercentage: 0,
  },
  booking_calendar: {
    id: "booking_calendar",
    name: "Booking Calendar",
    description: "Manage venue bookings",
    targetUsers: "pro",
    targetRoles: ["venue_client"],
    rolloutPercentage: 0,
  },

  // ==================== CORPORATE FEATURES ====================
  corporate_tools: {
    id: "corporate_tools",
    name: "Corporate Tools",
    description: "Tools for corporate clients",
    targetUsers: "pro",
    targetRoles: ["corporate_client"],
    rolloutPercentage: 0,
  },

  // ==================== BOOKER FEATURES ====================
  artist_roster: {
    id: "artist_roster",
    name: "Artist Roster",
    description: "Manage artist roster",
    targetUsers: "all",
    targetRoles: ["talent_agent", "booking_manager"],
    rolloutPercentage: 0,
  },
  contract_templates: {
    id: "contract_templates",
    name: "Contract Templates",
    description: "Pre-built contract templates",
    targetUsers: "pro",
    targetRoles: ["talent_agent", "booking_manager"],
    rolloutPercentage: 0,
  },

  // ==================== CROSS-ROLE FEATURES ====================
  advanced_messaging: {
    id: "advanced_messaging",
    name: "Advanced Messaging",
    description: "Enhanced communication",
    targetUsers: "pro",
    targetRoles: ["all"],
    rolloutPercentage: 0,
  },
  file_sharing: {
    id: "file_sharing",
    name: "File Sharing",
    description: "Share files securely",
    targetUsers: "all",
    targetRoles: ["all"],
    rolloutPercentage: 0,
  },
  calendar_sync: {
    id: "calendar_sync",
    name: "Calendar Sync",
    description: "Sync with external calendars",
    targetUsers: "pro",
    targetRoles: ["all"],
    rolloutPercentage: 0,
  },
};
