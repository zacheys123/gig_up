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
} from "lucide-react";

// Simple registry - just add features here and they automatically appear
export const ALL_FEATURES: DiscoverableFeature[] = [
  // Vocalist Features
  {
    id: "vocal_warmups",
    name: "Vocal Warmups",
    description: "Professional vocal exercises",
    href: "/dashboard/vocal-warmups",
    icon: <Volume2 className="w-5 h-5" />,
    badge: "NEW",
    category: "sidebar",
  },
  {
    id: "vocal_exercises_library",
    name: "Vocal Exercises Library",
    description: "50+ vocal techniques",
    href: "/dashboard/vocal-exercises",
    icon: <Mic2 className="w-5 h-5" />,
    category: "dashboard",
  },
  {
    id: "vocal_health_tips",
    name: "Vocal Health Guide",
    description: "Keep your voice healthy",
    href: "/dashboard/vocal-health",
    icon: <Headphones className="w-5 h-5" />,
    category: "sidebar",
  },

  // Teacher Features
  {
    id: "lesson_scheduling",
    name: "Lesson Scheduler",
    description: "Schedule and manage lessons",
    href: "/dashboard/lessons",
    icon: <Calendar className="w-5 h-5" />,
    badge: "NEW",
    category: "dashboard",
  },
  {
    id: "student_management",
    name: "Student Manager",
    description: "Track student progress",
    href: "/dashboard/students",
    icon: <Users className="w-5 h-5" />,
    category: "dashboard",
  },

  // Instrumentalist Features
  {
    id: "sheet_music_library",
    name: "Sheet Music Library",
    description: "Thousands of music sheets",
    href: "/dashboard/sheet-music",
    icon: <BookOpen className="w-5 h-5" />,
    category: "dashboard",
  },
  {
    id: "practice_tools",
    name: "Practice Tools",
    description: "Smart practice sessions",
    href: "/dashboard/practice",
    icon: <Guitar className="w-5 h-5" />,
    category: "sidebar",
  },

  // DJ/MC Features
  {
    id: "playlist_management",
    name: "Playlist Manager",
    description: "Create and manage playlists",
    href: "/dashboard/playlists",
    icon: <Music className="w-5 h-5" />,
    category: "dashboard",
  },
  {
    id: "dj_equipment_rental",
    name: "Equipment Rental",
    description: "Rent professional gear",
    href: "/dashboard/equipment",
    icon: <Headphones className="w-5 h-5" />,
    category: "spotlight",
  },

  // General Features
  {
    id: "musician_portfolio",
    name: "Digital Portfolio",
    description: "Showcase your work",
    href: "/dashboard/portfolio",
    icon: <FileText className="w-5 h-5" />,
    category: "sidebar",
  },
  {
    id: "gig_history",
    name: "Gig History",
    description: "Track your performances",
    href: "/dashboard/gig-history",
    icon: <BarChart3 className="w-5 h-5" />,
    category: "dashboard",
  },
];

// Helper to get features by category
export const getFeaturesByCategory = (category: string) =>
  ALL_FEATURES.filter((feature) => feature.category === category);

// Helper to get features for specific roles
export const getRoleFeatures = (roleType: string) => {
  const roleFeatureMap: Record<string, string[]> = {
    vocalist: ["vocal_warmups", "vocal_exercises_library", "vocal_health_tips"],
    teacher: ["lesson_scheduling", "student_management"],
    instrumentalist: ["sheet_music_library", "practice_tools"],
    dj: ["playlist_management", "dj_equipment_rental"],
    mc: ["playlist_management"],
  };

  const roleFeatures = roleFeatureMap[roleType] || [];
  const generalFeatures = ["musician_portfolio", "gig_history"];

  const allFeatureIds = [...roleFeatures, ...generalFeatures];
  return ALL_FEATURES.filter((feature) => allFeatureIds.includes(feature.id));
};
