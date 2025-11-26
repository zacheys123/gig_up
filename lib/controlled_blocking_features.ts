// lib/feature-flags/index.ts

import { FeatureFlagKey } from "./featureFlags";

// Centralized feature flag definitions
export const FEATURE_FLAGS = {
  // Role Registration Flags
  TEACHER_ROLE: "teacher_role" as FeatureFlagKey,
  BOOKER_ROLE: "booker_role" as FeatureFlagKey,
  BOTH_ROLE: "both_role" as FeatureFlagKey,

  // Gig Creation Flags
  NORMAL_GIG_CREATION: "normal_gig_creation" as FeatureFlagKey,
  SCRATCH_CREATION: "scratch_creation" as FeatureFlagKey,
  AI_CREATION: "AI_creation" as FeatureFlagKey,

  // Teacher Features
  TEACHER_DASHBOARD: "teacher_dashboard" as FeatureFlagKey,
  LESSON_SCHEDULING: "lesson_scheduling" as FeatureFlagKey,
  STUDENT_MANAGEMENT: "student_management" as FeatureFlagKey,

  // DJ/MC Features
  DJ_EQUIPMENT_RENTAL: "dj_equipment_rental" as FeatureFlagKey,
  MC_EVENT_HOSTING: "mc_event_hosting" as FeatureFlagKey,
  PLAYLIST_MANAGEMENT: "playlist_management" as FeatureFlagKey,

  // Instrumentalist Features
  SHEET_MUSIC_LIBRARY: "sheet_music_library" as FeatureFlagKey,
  PRACTICE_TOOLS: "practice_tools" as FeatureFlagKey,

  // Vocalist Features
  VOCAL_WARMUPS: "vocal_warmups" as FeatureFlagKey,
  VOCAL_EXERCISES_LIBRARY: "vocal_exercises_library" as FeatureFlagKey,
  VOCAL_HEALTH_TIPS: "vocal_health_tips" as FeatureFlagKey,

  // General Musician Features
  MUSICIAN_PORTFOLIO: "musician_portfolio" as FeatureFlagKey,
  GIG_HISTORY: "gig_history" as FeatureFlagKey,

  // Client Features
  PERSONAL_EVENT_PLANNER: "personal_event_planner" as FeatureFlagKey,
  QUICK_BOOKING: "quick_booking" as FeatureFlagKey,
  CLIENT_EVENT_PLANNER: "client_event_planner" as FeatureFlagKey,
  VENDOR_MANAGEMENT: "vendor_management" as FeatureFlagKey,

  // Venue Features
  VENUE_MANAGEMENT: "venue_management" as FeatureFlagKey,
  BOOKING_CALENDAR: "booking_calendar" as FeatureFlagKey,

  // Corporate Features
  CORPORATE_TOOLS: "corporate_tools" as FeatureFlagKey,

  // Booker Features
  ARTIST_ROSTER: "artist_roster" as FeatureFlagKey,
  CONTRACT_TEMPLATES: "contract_templates" as FeatureFlagKey,

  // Cross-Role Features
  ADVANCED_MESSAGING: "advanced_messaging" as FeatureFlagKey,
  FILE_SHARING: "file_sharing" as FeatureFlagKey,
  CALENDAR_SYNC: "calendar_sync" as FeatureFlagKey,
} as const;

// Feature flag groups for easy access
export const FEATURE_GROUPS = {
  // Role Registration
  ROLE_REGISTRATION: [
    FEATURE_FLAGS.TEACHER_ROLE,
    FEATURE_FLAGS.BOOKER_ROLE,
    FEATURE_FLAGS.BOTH_ROLE,
  ],

  // Gig Creation
  GIG_CREATION: [
    FEATURE_FLAGS.NORMAL_GIG_CREATION,
    FEATURE_FLAGS.SCRATCH_CREATION,
    FEATURE_FLAGS.AI_CREATION,
  ],

  // Teacher Features
  TEACHER_FEATURES: [
    FEATURE_FLAGS.TEACHER_DASHBOARD,
    FEATURE_FLAGS.LESSON_SCHEDULING,
    FEATURE_FLAGS.STUDENT_MANAGEMENT,
  ],

  // DJ/MC Features
  DJ_MC_FEATURES: [
    FEATURE_FLAGS.DJ_EQUIPMENT_RENTAL,
    FEATURE_FLAGS.MC_EVENT_HOSTING,
    FEATURE_FLAGS.PLAYLIST_MANAGEMENT,
  ],

  // Vocalist Features
  VOCALIST_FEATURES: [
    FEATURE_FLAGS.VOCAL_WARMUPS,
    FEATURE_FLAGS.VOCAL_EXERCISES_LIBRARY,
    FEATURE_FLAGS.VOCAL_HEALTH_TIPS,
  ],

  // Client Features
  CLIENT_FEATURES: [
    FEATURE_FLAGS.PERSONAL_EVENT_PLANNER,
    FEATURE_FLAGS.QUICK_BOOKING,
    FEATURE_FLAGS.CLIENT_EVENT_PLANNER,
    FEATURE_FLAGS.VENDOR_MANAGEMENT,
  ],

  // Booker Features
  BOOKER_FEATURES: [
    FEATURE_FLAGS.ARTIST_ROSTER,
    FEATURE_FLAGS.CONTRACT_TEMPLATES,
  ],
} as const;

// Helper functions
export const isRoleRegistrationEnabled = (featureKey: FeatureFlagKey) => {
  return FEATURE_GROUPS.ROLE_REGISTRATION.includes(featureKey);
};

export const isGigCreationEnabled = (featureKey: FeatureFlagKey) => {
  return FEATURE_GROUPS.GIG_CREATION.includes(featureKey);
};

// Type exports
export type FeatureFlag = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS];
export type FeatureGroup = keyof typeof FEATURE_GROUPS;
