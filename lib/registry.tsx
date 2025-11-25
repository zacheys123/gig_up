import { DiscoverableFeature } from "@/convex/featureFlagsTypes";
import {
  Volume2,
  Music,
  Users,
  Calendar,
  BookOpen,
  Mic2,
  Guitar,
  Headphones,
  FileText,
  BarChart3,
  Briefcase,
  GraduationCap,
  Building,
  ClipboardList,
  Search,
  Zap,
  Home,
  Crown,
} from "lucide-react";

export const ALL_FEATURES: DiscoverableFeature[] = [
  // ==================== VOCALIST FEATURES ====================
  {
    id: "vocal_warmups",
    name: "Vocal Warmups",
    description: "Professional vocal exercises and routines",
    href: "/dashboard/vocal-warmups",
    icon: <Volume2 className="w-5 h-5" />,
    badge: "NEW",
    category: "sidebar",
  },
  {
    id: "vocal_exercises_library",
    name: "Vocal Exercises",
    description: "50+ vocal techniques and exercises",
    href: "/dashboard/vocal-exercises",
    icon: <Mic2 className="w-5 h-5" />,
    category: "dashboard",
  },
  {
    id: "vocal_health_tips",
    name: "Vocal Health Guide",
    description: "Keep your voice healthy and strong",
    href: "/dashboard/vocal-health",
    icon: <Headphones className="w-5 h-5" />,
    category: "sidebar",
  },

  // ==================== TEACHER FEATURES ====================
  {
    id: "teacher_dashboard",
    name: "Teacher Dashboard",
    description: "Manage your teaching business",
    href: "/dashboard/teaching",
    icon: <GraduationCap className="w-5 h-5" />,
    badge: "NEW",
    category: "dashboard",
    requiresCompleteProfile: true,
  },
  {
    id: "lesson_scheduling",
    name: "Lesson Scheduler",
    description: "Schedule and manage music lessons",
    href: "/dashboard/lessons",
    icon: <Calendar className="w-5 h-5" />,
    category: "dashboard",
  },
  {
    id: "student_management",
    name: "Student Manager",
    description: "Track student progress and payments",
    href: "/dashboard/students",
    icon: <Users className="w-5 h-5" />,
    category: "dashboard",
  },
  {
    id: "curriculum_builder",
    name: "Curriculum Builder Manager",
    description: "Create the curriculum using AI generated ideas and more",
    href: "/dashboard/students",
    icon: <Users className="w-5 h-5" />,
    category: "dashboard",
  },

  // ==================== INSTRUMENTALIST FEATURES ====================
  {
    id: "sheet_music_library",
    name: "Sheet Music Library",
    description: "Thousands of music sheets and scores",
    href: "/dashboard/sheet-music",
    icon: <BookOpen className="w-5 h-5" />,
    category: "dashboard",
  },
  {
    id: "practice_tools",
    name: "Practice Tools",
    description: "Smart practice sessions with tracking",
    href: "/dashboard/practice",
    icon: <Guitar className="w-5 h-5" />,
    category: "sidebar",
  },

  // ==================== DJ/MC FEATURES ====================
  {
    id: "playlist_management",
    name: "Playlist Manager",
    description: "Create and manage event playlists",
    href: "/dashboard/playlists",
    icon: <Music className="w-5 h-5" />,
    category: "dashboard",
  },
  {
    id: "dj_equipment_rental",
    name: "Equipment Rental",
    description: "Rent professional DJ equipment",
    href: "/dashboard/equipment",
    icon: <Headphones className="w-5 h-5" />,
    category: "spotlight",
  },

  // ==================== CLIENT FEATURES ====================
  {
    id: "personal_event_planner",
    name: "Personal Event Planner",
    description: "Plan your perfect event with ease",
    href: "/dashboard/event-planner",
    icon: <Calendar className="w-5 h-5" />,
    category: "dashboard",
    badge: "NEW",
  },
  {
    id: "quick_booking",
    name: "Quick Booking",
    description: "Find and book talent instantly",
    href: "/dashboard/quick-book",
    icon: <Zap className="w-5 h-5" />,
    category: "sidebar",
  },
  {
    id: "client_event_planner",
    name: "Professional Event Planner",
    description: "Advanced tools for event professionals",
    href: "/dashboard/pro-events",
    icon: <ClipboardList className="w-5 h-5" />,
    category: "dashboard",
  },
  {
    id: "vendor_management",
    name: "Vendor Management",
    description: "Manage all your event vendors",
    href: "/dashboard/vendors",
    icon: <Users className="w-5 h-5" />,
    category: "dashboard",
  },
  {
    id: "venue_management",
    name: "Venue Management",
    description: "Manage your venue and bookings",
    href: "/dashboard/venue",
    icon: <Building className="w-5 h-5" />,
    category: "dashboard",
  },
  {
    id: "booking_calendar",
    name: "Booking Calendar",
    description: "Manage all your venue bookings",
    href: "/dashboard/venue-calendar",
    icon: <Calendar className="w-5 h-5" />,
    category: "dashboard",
  },
  {
    id: "corporate_tools",
    name: "Corporate Suite",
    description: "Enterprise tools for corporate clients",
    href: "/dashboard/corporate",
    icon: <Crown className="w-5 h-5" />,
    category: "dashboard",

    badge: "PREMIUM",
  },

  // ==================== BOOKER FEATURES ====================
  {
    id: "artist_roster",
    name: "Artist Roster",
    description: "Manage your talent and bookings",
    href: "/dashboard/roster",
    icon: <Briefcase className="w-5 h-5" />,
    category: "dashboard",
    requiresCompleteProfile: true,
  },
  {
    id: "contract_templates",
    name: "Contract Templates",
    description: "Professional gig contracts",
    href: "/dashboard/contracts",
    icon: <FileText className="w-5 h-5" />,
    category: "dashboard",
  },

  // ==================== GENERAL FEATURES ====================
  {
    id: "musician_portfolio",
    name: "Digital Portfolio",
    description: "Showcase your work and achievements",
    href: "/dashboard/portfolio",
    icon: <FileText className="w-5 h-5" />,
    category: "sidebar",
  },
  {
    id: "gig_history",
    name: "Gig History",
    description: "Track your performances and earnings",
    href: "/dashboard/gig-history",
    icon: <BarChart3 className="w-5 h-5" />,
    category: "dashboard",
  },
  {
    id: "advanced_messaging",
    name: "Advanced Messaging",
    description: "Enhanced communication tools",
    href: "/dashboard/messaging",
    icon: <Users className="w-5 h-5" />,
    category: "sidebar",
  },
  {
    id: "file_sharing",
    name: "File Sharing",
    description: "Share files securely with collaborators",
    href: "/dashboard/files",
    icon: <FileText className="w-5 h-5" />,
    category: "sidebar",
  },
  {
    id: "calendar_sync",
    name: "Calendar Sync",
    description: "Sync with your external calendars",
    href: "/dashboard/calendar-sync",
    icon: <Calendar className="w-5 h-5" />,
    category: "sidebar",
  },
];

// Helper functions
export const getFeaturesByCategory = (category: string) =>
  ALL_FEATURES.filter((feature) => feature.category === category);

export const getRoleFeatures = (roleType: string) => {
  const roleFeatureMap: Record<string, string[]> = {
    // Musician Roles
    vocalist: ["vocal_warmups", "vocal_exercises_library", "vocal_health_tips"],
    teacher: [
      "teacher_dashboard",
      "lesson_scheduling",
      "student_management",
      "curriculum_builder",
    ],
    instrumentalist: ["sheet_music_library", "practice_tools"],
    dj: ["playlist_management", "dj_equipment_rental"],
    mc: ["playlist_management"],

    // Client Roles
    individual_client: ["personal_event_planner", "quick_booking"],
    event_planner_client: ["client_event_planner", "vendor_management"],
    venue_client: ["venue_management", "booking_calendar"],
    corporate_client: ["corporate_tools", "vendor_management"],

    // Booker Roles
    talent_agent: ["artist_roster", "contract_templates"],
    booking_manager: ["artist_roster", "contract_templates"],
  };
  console.log("🔍 Role mapping check:", {
    roleType,
    mappedFeatures: roleFeatureMap[roleType] || [],
  });

  const roleFeatures = roleFeatureMap[roleType] || [];
  const generalFeatures = [
    "musician_portfolio",
    "gig_history",
    "file_sharing",
    "advanced_messaging",
    "calendar_sync",
  ];

  const allFeatureIds = [...roleFeatures, ...generalFeatures];
  return ALL_FEATURES.filter((feature) => allFeatureIds.includes(feature.id));
};

export const getNewFeatures = () =>
  ALL_FEATURES.filter((feature) => feature.badge === "NEW");
