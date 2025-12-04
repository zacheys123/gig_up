// lib/feature-flags/types.ts
export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  targetUsers?: "all" | "premium" | "pro" | "free" | "elite";
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
  // ========== ROLE REGISTRATION FLAGS ==========
  | "teacher_role"
  | "booker_role"
  | "both_role"

  // ========== GIG CREATION FLAGS ==========
  | "normal_gig_creation"
  | "scratch_creation"
  | "AI_creation"
  | "deputy_creation"

  // ========== TEACHER FEATURES ==========
  | "teacher_dashboard"
  | "lesson_scheduling"
  | "student_management"

  // ========== DJ/MC FEATURES ==========
  | "dj_equipment_rental"
  | "mc_event_hosting"
  | "playlist_management"

  // ========== INSTRUMENTALIST FEATURES ==========
  | "sheet_music_library"
  | "practice_tools"

  // ========== VOCALIST FEATURES ==========
  | "vocal_warmups"
  | "vocal_exercises_library"
  | "vocal_health_tips"

  // ========== GENERAL MUSICIAN FEATURES ==========
  | "musician_portfolio"
  | "gig_history"

  // ========== INDIVIDUAL CLIENT FEATURES ==========
  | "personal_event_planner"
  | "quick_booking"

  // ========== EVENT PLANNER FEATURES ==========
  | "client_event_planner"
  | "vendor_management"

  // ========== VENUE FEATURES ==========
  | "venue_management"
  | "booking_calendar"

  // ========== CORPORATE FEATURES ==========
  | "corporate_tools"

  // ========== BOOKER FEATURES ==========
  | "artist_roster"
  | "contract_templates"

  // ========== CROSS-ROLE FEATURES ==========
  | "advanced_messaging"
  | "file_sharing"
  | "calendar_sync";

export const FEATURE_FLAGS_CONFIG: Record<
  FeatureFlagKey,
  Omit<FeatureFlag, "enabled" | "createdAt" | "updatedAt">
> = {
  // ==================== ROLE REGISTRATION FLAGS ====================
  teacher_role: {
    id: "teacher_role",
    name: "Teacher Role Registration",
    description: "Allow users to register as music teachers",

    targetRoles: ["all"],
    rolloutPercentage: 0,
  },
  booker_role: {
    id: "booker_role",
    name: "Booker Role Registration",
    description: "Allow users to register as talent bookers/managers",

    targetRoles: ["all"],
    rolloutPercentage: 0,
  },
  both_role: {
    id: "both_role",
    name: "Dual Role Registration",
    description: "Allow users to register as both client and talent",

    targetRoles: ["all"],
    rolloutPercentage: 0, // Start disabled
  },

  // ==================== GIG CREATION FLAGS ====================
  normal_gig_creation: {
    id: "normal_gig_creation",
    name: "Normal Gig Creation",
    description: "Traditional gig creation with full customization",

    targetRoles: [
      // Available to ALL client types
      "individual_client",
      "event_planner_client",
      "venue_client",
      "corporate_client",
      "all", // Or just use "all" to include everyone
    ],
    rolloutPercentage: 0,
  },
  scratch_creation: {
    id: "scratch_creation",
    name: "Scratch Gig Creation",
    description: "Create gigs from scratch with complete creative freedom",
    targetUsers: "premium",
    targetRoles: [
      // Available to ALL client types
      "individual_client",
      "event_planner_client",
      "venue_client",
      "corporate_client",
      "all", // Or just use "all" to include everyone
    ],
    rolloutPercentage: 0,
  },
  AI_creation: {
    id: "AI_creation",
    name: "AI Gig Creation",
    description: "AI-powered gig creation with smart suggestions",
    targetUsers: "elite",
    targetRoles: [
      // Available to ALL client types
      "individual_client",
      "event_planner_client",
      "venue_client",
      "corporate_client",
      "all", // Or just use "all" to include everyone
    ],
    rolloutPercentage: 0,
  },

  // other features
  deputy_creation: {
    id: "deputy_creation",
    name: "Deputy Creation for Musicians",
    description: "Adding deputies to take on your gigs",
    targetUsers: "pro", // Pro+ tier only
    targetRoles: [
      // Available to ALL client types
      "instrumentalist",
      "vocalist",
      "dj",
      "mc",
    ],
    rolloutPercentage: 0,
  },
  // ==================== TEACHER FEATURES ====================
  teacher_dashboard: {
    id: "teacher_dashboard",
    name: "Teacher Dashboard",
    description: "Dashboard for music teachers",

    targetRoles: ["teacher"],
    rolloutPercentage: 0,
  },
  lesson_scheduling: {
    id: "lesson_scheduling",
    name: "Lesson Scheduling",
    description: "Schedule music lessons",

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

    targetRoles: ["dj"],
    rolloutPercentage: 0,
  },
  mc_event_hosting: {
    id: "mc_event_hosting",
    name: "MC Event Hosting",
    description: "Tools for MCs to host events",

    targetRoles: ["mc"],
    rolloutPercentage: 0,
  },
  playlist_management: {
    id: "playlist_management",
    name: "Playlist Management",
    description: "Create and manage playlists",

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

    targetRoles: ["instrumentalist"],
    rolloutPercentage: 0,
  },

  // ==================== VOCALIST FEATURES ====================
  vocal_warmups: {
    id: "vocal_warmups",
    name: "Vocal Warmups",
    description: "Interactive vocal warmup exercises and routines",
    targetUsers: "premium",
    targetRoles: ["vocalist"],
    rolloutPercentage: 0,
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

    targetRoles: ["vocalist"],
    rolloutPercentage: 0,
  },

  // ==================== GENERAL MUSICIAN FEATURES ====================
  musician_portfolio: {
    id: "musician_portfolio",
    name: "Musician Portfolio",
    description: "Showcase your work",

    targetRoles: ["teacher", "instrumentalist", "vocalist", "dj", "mc"],
    rolloutPercentage: 0,
  },
  gig_history: {
    id: "gig_history",
    name: "Gig History",
    description: "Track performance history",

    targetRoles: ["instrumentalist", "vocalist", "dj", "mc"],
    rolloutPercentage: 0,
  },

  // ==================== INDIVIDUAL CLIENT FEATURES ====================
  personal_event_planner: {
    id: "personal_event_planner",
    name: "Personal Event Planner",
    description: "Event planning for individuals",

    targetRoles: ["individual_client"],
    rolloutPercentage: 0,
  },
  quick_booking: {
    id: "quick_booking",
    name: "Quick Booking",
    description: "Streamlined booking process",

    targetRoles: ["individual_client"],
    rolloutPercentage: 0,
  },

  // ==================== EVENT PLANNER FEATURES ====================
  client_event_planner: {
    id: "client_event_planner",
    name: "Event Planner Tools",
    description: "Professional event planning",

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
