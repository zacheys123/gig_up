// app/onboarding/trust-checklist/page.tsx - UPDATED WITH NEW SCORING
"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Shield,
  User,
  Phone,
  CreditCard,
  Calendar,
  Building,
  MapPin,
  Camera,
  FileText,
  Award,
  TrendingUp,
  Users,
  Briefcase,
  Target,
  Zap,
  Clock,
  Crown,
  ThumbsUp,
  Video,
  Gem,
  BookOpen,
  DollarSign,
  MessageSquare,
  CheckSquare,
  Mail,
  Globe,
  Music,
  Headphones,
  Mic,
  Film,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import {
  checkProfileCompleteness,
  scoreToStars,
  calculateProfilePoints,
  calculateLongevityPoints,
  calculateActivityPoints,
  calculateQualityPoints,
  calculateContentPoints,
  calculateSocialPoints,
  SCORING_CONSTANTS,
  SECTION_CAPS,
} from "@/lib/trustScoreHelpers";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  points: number;
  icon: React.ElementType;
  category:
    | "profile"
    | "longevity"
    | "activity"
    | "quality"
    | "content"
    | "social"
    | "penalties";
  priority: "high" | "medium" | "low";
  actionUrl?: string;
  progress?: {
    current: number;
    max: number;
    unit?: string;
  };
}

interface ProgressStats {
  total: number;
  completed: number;
  pending: number;
  pointsEarned: number;
  pointsAvailable: number;
  completionRate: number;
  sectionBreakdown: {
    [key: string]: {
      earned: number;
      available: number;
      percentage: number;
    };
  };
}

export default function TrustChecklist() {
  const { user } = useCurrentUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Get trust score data
  const trustData = useQuery(
    api.controllers.trustScore.getTrustScore,
    user?.clerkId ? { clerkId: user.clerkId } : "skip"
  );

  // Get improvement suggestions
  const improvements = useQuery(
    api.controllers.trustScore.getTrustImprovements,
    user?.clerkId ? { clerkId: user.clerkId } : "skip"
  );

  // Get user's current data for checklist
  const userData = useQuery(
    api.controllers.user.getUserProfile,
    user?.clerkId ? { clerkId: user.clerkId } : "skip"
  );

  // Get user's videos for video scoring
  const userVideos = useQuery(
    api.controllers.videos.getUserVideos,
    user?.clerkId
      ? { userId: user.clerkId, currentUserId: user.clerkId }
      : "skip"
  );

  useEffect(() => {
    if (user && trustData !== undefined && userData !== undefined) {
      setIsLoading(false);
    }
  }, [user, trustData, userData]);

  // Update the generateChecklist function to ensure completed is always boolean:

  const generateChecklist = (): ChecklistItem[] => {
    if (!userData) return [];

    // Calculate metrics for content section
    const videoCount = userVideos?.length || 0;
    const totalVideoLikes =
      userVideos?.reduce((sum, video) => sum + (video.likes || 0), 0) || 0;
    const hasProfileVideo =
      userVideos?.some((video) => video.isProfileVideo) || false;
    const gigVideoCount =
      userVideos?.filter(
        (video) => video.videoType === "gig" || video.videoType === "promo"
      ).length || 0;

    const accountAgeDays = Math.floor(
      (Date.now() - userData._creationTime) / (1000 * 60 * 60 * 24)
    );

    const checklist: ChecklistItem[] = [
      // ========== PROFILE COMPLETENESS (MAX: 25) ==========
      {
        id: "firstname",
        title: "First Name",
        description: "Add your first name",
        completed: !!userData.firstname, // Ensure boolean
        points: SCORING_CONSTANTS.FIRSTNAME,
        icon: User,
        category: "profile",
        priority: "high",
        actionUrl: "/profile/edit?section=basic",
      },
      {
        id: "lastname",
        title: "Last Name",
        description: "Add your last name",
        completed: !!userData.lastname, // Ensure boolean
        points: SCORING_CONSTANTS.LASTNAME,
        icon: User,
        category: "profile",
        priority: "high",
        actionUrl: "/profile/edit?section=basic",
      },
      {
        id: "city",
        title: "City/Location",
        description: "Add your city location",
        completed: !!userData.city, // Ensure boolean
        points: SCORING_CONSTANTS.CITY,
        icon: MapPin,
        category: "profile",
        priority: "high",
        actionUrl: "/profile/edit?section=basic",
      },
      {
        id: "phone",
        title: "Phone Number",
        description: "Add your phone number",
        completed: !!userData.phone, // Ensure boolean
        points: SCORING_CONSTANTS.PHONE,
        icon: Phone,
        category: "profile",
        priority: "high",
        actionUrl: "/profile/edit?section=contact",
      },
      {
        id: "picture",
        title: "Profile Picture",
        description: "Add a profile picture",
        completed: !!userData.picture, // Ensure boolean
        points: SCORING_CONSTANTS.PICTURE,
        icon: Camera,
        category: "profile",
        priority: "medium",
        actionUrl: "/profile/edit?section=basic",
      },
      {
        id: "mpesa",
        title: "M-Pesa Payment Method",
        description: "Add M-Pesa for payments",
        completed: !!userData.mpesaPhoneNumber, // Ensure boolean
        points: SCORING_CONSTANTS.MPESA,
        icon: CreditCard,
        category: "profile",
        priority: "high",
        actionUrl: "/profile/edit?section=payment",
      },
      {
        id: "onboarding",
        title: "Complete Onboarding",
        description: "Finish the onboarding process",
        completed: !!userData.onboardingComplete, // Ensure boolean
        points: SCORING_CONSTANTS.ONBOARDING,
        icon: CheckCircle,
        category: "profile",
        priority: "medium",
        actionUrl: "/onboarding",
      },
      {
        id: "roleType",
        title: "Role Specification",
        description: "Specify your role on the platform",
        completed: Boolean(
          // Use Boolean() to ensure boolean
          (userData.isMusician && !!userData.roleType) ||
            (userData.isClient && !!userData.clientType) ||
            (userData.isBooker && !!userData.bookerType)
        ),
        points: SCORING_CONSTANTS.ROLE_TYPE,
        icon: Briefcase,
        category: "profile",
        priority: "high",
        actionUrl: "/profile/edit?section=role",
      },

      // ========== LONG-TERM ACTIVITY (MAX: 10) ==========
      {
        id: "accountAge",
        title: "Account Age",
        description:
          accountAgeDays < 30
            ? "Account less than 30 days old"
            : accountAgeDays < 90
              ? "Account 30-90 days old"
              : accountAgeDays < 180
                ? "Account 90-180 days old"
                : accountAgeDays < 365
                  ? "Account 180-365 days old"
                  : accountAgeDays < 730
                    ? "Account 1-2 years old"
                    : "Account over 2 years old",
        completed: accountAgeDays > 30, // Already boolean
        points: Math.min(
          accountAgeDays > 730
            ? 5
            : accountAgeDays > 365
              ? 4
              : accountAgeDays > 180
                ? 3
                : accountAgeDays > 90
                  ? 2
                  : accountAgeDays > 30
                    ? 1
                    : 0,
          SECTION_CAPS.LONGEVITY
        ),
        progress: {
          current: accountAgeDays,
          max: 730,
          unit: "days",
        },
        icon: Calendar,
        category: "longevity",
        priority: "low",
        actionUrl: "/dashboard",
      },
      {
        id: "recentActivity",
        title: "Recent Activity",
        description: "Be active on the platform",
        completed: Boolean(
          // Use Boolean()
          userData.lastActive &&
            Date.now() - userData.lastActive < 7 * 24 * 60 * 60 * 1000
        ),
        points: 3,
        icon: Zap,
        category: "longevity",
        priority: "medium",
        actionUrl: "/dashboard",
      },

      // ========== SOCIAL PROOF (MAX: 10) ==========
      {
        id: "followers",
        title: "Followers",
        description: "Build your follower base",
        completed: (userData.followers?.length || 0) >= 5, // Already boolean
        points: Math.min(
          (userData.followers?.length || 0) >= 100
            ? 4
            : (userData.followers?.length || 0) >= 50
              ? 2
              : (userData.followers?.length || 0) >= 20
                ? 1
                : (userData.followers?.length || 0) >= 5
                  ? 1
                  : 0,
          SECTION_CAPS.SOCIAL
        ),
        progress: {
          current: userData.followers?.length || 0,
          max: 100,
        },
        icon: Users,
        category: "social",
        priority: "low",
        actionUrl: "/profile",
      },
      {
        id: "subscriptionTier",
        title: "Subscription Tier",
        description: "Upgrade your subscription for more features",
        completed: userData.tier !== "free", // Already boolean
        points:
          userData.tier === "elite"
            ? SCORING_CONSTANTS.TIER_ELITE
            : userData.tier === "premium"
              ? SCORING_CONSTANTS.TIER_PREMIUM
              : userData.tier === "pro"
                ? SCORING_CONSTANTS.TIER_PRO
                : SCORING_CONSTANTS.TIER_FREE,
        icon: Crown,
        category: "social",
        priority: "low",
        actionUrl: "/subscription",
      },

      // ========== CONTENT CREATION (MAX: 15) ==========
      {
        id: "bio",
        title: userData.isMusician
          ? "Talent Bio"
          : userData.isBooker
            ? "Booker Bio"
            : "Profile Bio",
        description: "Write about your experience",
        completed: Boolean(
          // Use Boolean()
          (userData.isMusician && !!userData.talentbio) ||
            (userData.isBooker && !!userData.bookerBio) ||
            (userData.isClient &&
              (!!userData.organization || !!userData.companyName))
        ),
        points: SCORING_CONSTANTS.BIO,
        icon: FileText,
        category: "content",
        priority: "medium",
        actionUrl: "/profile/edit?section=bio",
      },
      {
        id: "skills",
        title: userData.isMusician ? "Music Genres" : "Skills",
        description: userData.isMusician
          ? "Add your music genres"
          : "Add your skills",
        completed: Boolean(
          // Use Boolean()
          (userData.isMusician && !!userData.musiciangenres?.length) ||
            (userData.isBooker && !!userData.bookerSkills?.length)
        ),
        points: SCORING_CONSTANTS.SKILLS,
        icon: userData.isMusician ? Music : Award,
        category: "content",
        priority: "medium",
        actionUrl: "/profile/edit?section=skills",
      },
      {
        id: "instrument",
        title: "Instrument/Expertise",
        description: userData.isMusician
          ? "Add your primary instrument"
          : "Add your expertise",
        completed: Boolean(userData.isMusician && !!userData.instrument), // Use Boolean()
        points: SCORING_CONSTANTS.INSTRUMENT,
        icon: userData.isMusician ? Headphones : Mic,
        category: "content",
        priority: "medium",
        actionUrl: "/profile/edit?section=skills",
      },
    ];

    // Add video content items
    if (userData.isMusician) {
      checklist.push(
        {
          id: "videos",
          title: "Upload Videos",
          description: "Add videos to showcase your talent",
          completed: videoCount > 0, // Already boolean
          points: Math.min(
            videoCount >= 5 ? 5 : videoCount >= 3 ? 4 : videoCount >= 1 ? 2 : 0,
            5
          ),
          progress: {
            current: videoCount,
            max: 5,
          },
          icon: Film,
          category: "content",
          priority: "medium",
          actionUrl: "/videos/upload",
        },
        {
          id: "videoEngagement",
          title: "Video Engagement",
          description: "Get likes on your videos",
          completed: totalVideoLikes >= 5, // Already boolean
          points: Math.min(
            totalVideoLikes >= 50
              ? 3
              : totalVideoLikes >= 20
                ? 2
                : totalVideoLikes >= 5
                  ? 1
                  : 0,
            3
          ),
          progress: {
            current: totalVideoLikes,
            max: 50,
          },
          icon: ThumbsUp,
          category: "content",
          priority: "low",
          actionUrl: "/videos",
        },
        {
          id: "profileVideo",
          title: "Profile Video",
          description: "Add a video introduction",
          completed: hasProfileVideo, // Already boolean
          points: SCORING_CONSTANTS.PROFILE_VIDEO,
          icon: Video,
          category: "content",
          priority: "medium",
          actionUrl: "/profile/edit?section=videos",
        },
        {
          id: "gigVideos",
          title: "Gig Videos",
          description: "Upload professional gig videos",
          completed: gigVideoCount > 0, // Already boolean
          points: Math.min(
            gigVideoCount >= 3 ? 2 : gigVideoCount >= 1 ? 1 : 0,
            2
          ),
          progress: {
            current: gigVideoCount,
            max: 3,
          },
          icon: Film,
          category: "content",
          priority: "low",
          actionUrl: "/videos/upload?type=gig",
        }
      );
    }

    // ========== CORE ACTIVITY ITEMS ==========
    if (userData.isMusician) {
      const completedGigs = userData.completedGigsCount || 0;
      const gigPoints = Math.min(
        completedGigs * SCORING_CONSTANTS.GIGS_COMPLETED_PER_POINT,
        SCORING_CONSTANTS.GIGS_COMPLETED_MAX
      );

      checklist.push(
        {
          id: "completedGigs",
          title: "Complete Gigs",
          description: "Successfully complete gigs",
          completed: completedGigs > 0, // Already boolean
          points: gigPoints,
          progress: {
            current: completedGigs,
            max: Math.ceil(
              SCORING_CONSTANTS.GIGS_COMPLETED_MAX /
                SCORING_CONSTANTS.GIGS_COMPLETED_PER_POINT
            ),
          },
          icon: Calendar,
          category: "activity",
          priority: "high",
          actionUrl: "/gigs",
        },
        {
          id: "rating",
          title: "High Rating",
          description: "Maintain a good rating from clients",
          completed: (userData.avgRating || 0) >= 4.0, // Already boolean
          points:
            (userData.avgRating || 0) >= 4.8
              ? SCORING_CONSTANTS.RATING_4_8
              : (userData.avgRating || 0) >= 4.5
                ? SCORING_CONSTANTS.RATING_4_5
                : (userData.avgRating || 0) >= 4.0
                  ? SCORING_CONSTANTS.RATING_4_0
                  : (userData.avgRating || 0) >= 3.5
                    ? SCORING_CONSTANTS.RATING_3_5
                    : (userData.avgRating || 0) > 0
                      ? SCORING_CONSTANTS.RATING_MIN
                      : 0,
          progress: {
            current: userData.avgRating || 0,
            max: 5.0,
          },
          icon: Star,
          category: "quality",
          priority: "high",
          actionUrl: "/reviews",
        },
        {
          id: "responseTime",
          title: "Quick Response",
          description: "Respond to messages within 24 hours",
          completed: Boolean(
            // Use Boolean()
            userData.performanceStats?.responseTime &&
              userData.performanceStats.responseTime < 24
          ),
          points: 3,
          icon: Clock,
          category: "quality",
          priority: "medium",
          actionUrl: "/messages",
        }
      );
    } else if (userData.isClient) {
      const gigsPosted = userData.gigsPosted || 0;
      const completedGigs = userData.completedGigsCount || 0;
      const completionRate = gigsPosted > 0 ? completedGigs / gigsPosted : 0;

      checklist.push(
        {
          id: "gigsPosted",
          title: "Post Gigs",
          description: "Post gigs on the platform",
          completed: gigsPosted > 0, // Already boolean
          points: Math.min(gigsPosted * 0.5, 10),
          progress: {
            current: gigsPosted,
            max: 20,
          },
          icon: Calendar,
          category: "activity",
          priority: "medium",
          actionUrl: "/gigs/post",
        },
        {
          id: "completionRate",
          title: "Gig Completion Rate",
          description: "Successfully complete posted gigs",
          completed: completionRate >= 0.8, // Already boolean
          points:
            completionRate === 1
              ? SCORING_CONSTANTS.COMPLETION_RATE_100
              : completionRate >= 0.9
                ? SCORING_CONSTANTS.COMPLETION_RATE_90
                : completionRate >= 0.8
                  ? SCORING_CONSTANTS.COMPLETION_RATE_80
                  : completionRate >= 0.7
                    ? SCORING_CONSTANTS.COMPLETION_RATE_70
                    : completionRate >= 0.6
                      ? SCORING_CONSTANTS.COMPLETION_RATE_60
                      : completionRate > 0
                        ? SCORING_CONSTANTS.COMPLETION_RATE_MIN
                        : 0,
          progress: {
            current: Math.round(completionRate * 100),
            max: 100,
            unit: "%",
          },
          icon: CheckSquare,
          category: "quality",
          priority: "high",
          actionUrl: "/gigs",
        },
        {
          id: "clientRating",
          title: "Client Rating",
          description: "Maintain a good rating from musicians",
          completed: (userData.avgRating || 0) >= 4.0, // Already boolean
          points:
            (userData.avgRating || 0) >= 4.9
              ? 5
              : (userData.avgRating || 0) >= 4.8
                ? 3
                : (userData.avgRating || 0) >= 4.5
                  ? 2
                  : (userData.avgRating || 0) >= 4.0
                    ? 1
                    : 0,
          progress: {
            current: userData.avgRating || 0,
            max: 5.0,
          },
          icon: Star,
          category: "quality",
          priority: "high",
          actionUrl: "/reviews",
        }
      );
    }

    // ========== PENALTIES ==========
    if (userData.isSuspended || userData.isBanned) {
      checklist.push({
        id: "accountStatus",
        title: "Account Status",
        description: userData.isBanned
          ? "Account is banned"
          : "Account is suspended",
        completed: false, // Always false for penalties
        points: userData.isBanned ? -100 : -20,
        icon: AlertCircle,
        category: "penalties",
        priority: "high",
        actionUrl: "/support",
      });
    }

    if ((userData.reportsCount || 0) > 0) {
      checklist.push({
        id: "reports",
        title: "User Reports",
        description: `Has ${userData.reportsCount || 0} report(s)`,
        completed: false, // Always false for penalties
        points: Math.min((userData.reportsCount || 0) * -3, -15),
        progress: {
          current: userData.reportsCount || 0,
          max: 5,
        },
        icon: AlertCircle,
        category: "penalties",
        priority: "high",
        actionUrl: "/support",
      });
    }

    if ((userData.cancelgigCount || 0) > 0) {
      checklist.push({
        id: "cancellations",
        title: "Gig Cancellations",
        description: `Has cancelled ${userData.cancelgigCount || 0} gig(s)`,
        completed: false, // Always false for penalties
        points: Math.min((userData.cancelgigCount || 0) * -2, -10),
        progress: {
          current: userData.cancelgigCount || 0,
          max: 5,
        },
        icon: AlertCircle,
        category: "penalties",
        priority: "medium",
        actionUrl: "/gigs",
      });
    }

    return checklist;
  };

  // Calculate progress stats with section breakdown
  const calculateStats = (checklist: ChecklistItem[]): ProgressStats => {
    const total = checklist.length;
    const completed = checklist.filter((item) => item.completed).length;
    const pending = total - completed;

    const pointsEarned = checklist
      .filter((item) => item.completed)
      .reduce((sum, item) => sum + Math.max(item.points, 0), 0);

    const pointsAvailable = checklist.reduce(
      (sum, item) => sum + Math.max(item.points, 0),
      0
    );

    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    // Calculate section breakdown
    const sectionBreakdown: ProgressStats["sectionBreakdown"] = {};
    const sections = [
      "profile",
      "longevity",
      "activity",
      "quality",
      "content",
      "social",
      "penalties",
    ];

    sections.forEach((section) => {
      const sectionItems = checklist.filter(
        (item) => item.category === section
      );
      const earned = sectionItems
        .filter((item) => item.completed)
        .reduce((sum, item) => sum + Math.max(item.points, 0), 0);
      const available = sectionItems.reduce(
        (sum, item) => sum + Math.max(item.points, 0),
        0
      );
      const percentage = available > 0 ? (earned / available) * 100 : 0;

      sectionBreakdown[section] = { earned, available, percentage };
    });

    return {
      total,
      completed,
      pending,
      pointsEarned,
      pointsAvailable,
      completionRate,
      sectionBreakdown,
    };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trust checklist...</p>
        </div>
      </div>
    );
  }

  const checklist = generateChecklist();
  const stats = calculateStats(checklist);
  const trustScore = trustData?.trustScore || 0;
  const trustStars = trustData?.trustStars || scoreToStars(trustScore);

  // Group by category
  const groupedChecklist = checklist.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, ChecklistItem[]>
  );

  const categoryIcons: Record<string, React.ElementType> = {
    profile: User,
    longevity: Calendar,
    activity: Zap,
    quality: Star,
    content: Film,
    social: Users,
    penalties: AlertCircle,
  };

  const categoryColors: Record<string, string> = {
    profile: "bg-blue-100 text-blue-800 border-blue-200",
    longevity: "bg-emerald-100 text-emerald-800 border-emerald-200",
    activity: "bg-purple-100 text-purple-800 border-purple-200",
    quality: "bg-amber-100 text-amber-800 border-amber-200",
    content: "bg-indigo-100 text-indigo-800 border-indigo-200",
    social: "bg-pink-100 text-pink-800 border-pink-200",
    penalties: "bg-red-100 text-red-800 border-red-200",
  };

  const categoryDescriptions: Record<string, string> = {
    profile: "Basic identity and verification",
    longevity: "Account age and activity history",
    activity: "Platform engagement and gigs",
    quality: "Performance ratings and reliability",
    content: "Profile completeness and media",
    social: "Community standing and tier",
    penalties: "Issues affecting trust score",
  };

  // Get category stats for display
  const categoryStats = Object.entries(groupedChecklist).map(
    ([category, items]) => {
      const completed = items.filter((item) => item.completed).length;
      const total = items.length;
      const completionRate = total > 0 ? (completed / total) * 100 : 0;
      const pointsEarned = items
        .filter((item) => item.completed)
        .reduce((sum, item) => sum + Math.max(item.points, 0), 0);
      const pointsAvailable = items.reduce(
        (sum, item) => sum + Math.max(item.points, 0),
        0
      );

      return {
        category,
        completed,
        total,
        completionRate,
        pointsEarned,
        pointsAvailable,
        description: categoryDescriptions[category] || "",
      };
    }
  );

  // Calculate potential score
  const getPotentialScore = () => {
    const currentScore = trustScore;
    const potentialFromChecklist = stats.pointsAvailable - stats.pointsEarned;
    return Math.min(100, currentScore + potentialFromChecklist);
  };

  const potentialScore = getPotentialScore();
  const potentialStars = scoreToStars(potentialScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation */}
          <div className="mb-8">
            <Link
              href="/onboarding/trust-explained"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Trust Score</span>
            </Link>
          </div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-6 bg-white/80 backdrop-blur-sm px-8 py-4 rounded-2xl shadow-lg mb-6">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < Math.floor(trustStars)
                          ? "fill-yellow-400 text-yellow-400"
                          : i < trustStars
                            ? "fill-yellow-200 text-yellow-200"
                            : "text-gray-300"
                      }`}
                      fill="currentColor"
                    />
                  ))}
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {trustStars.toFixed(1)} stars
                </div>
                <div className="text-sm text-gray-600">
                  {trustScore}/100 points
                </div>
              </div>

              <div className="h-12 w-px bg-gray-300" />

              <div className="flex flex-col items-center">
                <div className="text-sm text-gray-600 mb-1">Potential</div>
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(potentialStars)
                          ? "fill-green-400 text-green-400"
                          : i < potentialStars
                            ? "fill-green-200 text-green-200"
                            : "text-gray-300"
                      }`}
                      fill="currentColor"
                    />
                  ))}
                </div>
                <div className="text-xl font-bold text-green-600">
                  {potentialStars.toFixed(1)} stars
                </div>
                <div className="text-sm text-gray-600">
                  {potentialScore}/100 possible
                </div>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Your Trust Checklist
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Complete these items to boost your trust rating and unlock premium
              features
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Section Progress Overview */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Section Progress
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {categoryStats.map((catStat, index) => {
              const Icon = categoryIcons[catStat.category];
              const style = categoryColors[catStat.category].split(" ");

              return (
                <motion.div
                  key={catStat.category}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-xl border ${style[2]} ${style[0]} text-center`}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-lg ${style[0]} flex items-center justify-center mb-2`}
                    >
                      <Icon className={`w-5 h-5 ${style[1]}`} />
                    </div>
                    <h3 className="font-semibold capitalize text-sm mb-1">
                      {catStat.category}
                    </h3>
                    <div className="text-xs text-gray-600 mb-2">
                      {catStat.description}
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${catStat.completionRate}%` }}
                        className={`h-full ${style[1].replace("text-", "bg-")}`}
                      />
                    </div>
                    <div className="text-xs mt-1">
                      {catStat.completed}/{catStat.total} items
                    </div>
                    <div className="text-sm font-medium mt-1">
                      {catStat.pointsEarned}/{catStat.pointsAvailable} pts
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Checklist by Category */}
        <div className="space-y-8">
          {Object.entries(groupedChecklist).map(([category, items]) => {
            const Icon = categoryIcons[category];
            const completedItems = items.filter(
              (item) => item.completed
            ).length;
            const totalItems = items.length;
            const colorStyle = categoryColors[category].split(" ");

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
              >
                <div
                  className={`px-6 py-4 ${colorStyle[0]} border-b ${colorStyle[2]}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <div>
                        <h3 className="text-lg font-semibold capitalize">
                          {category}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {categoryDescriptions[category]}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold">{completedItems}</span>
                      <span className="text-gray-600">/{totalItems}</span>
                      <div className="text-xs text-gray-500 mt-1">
                        {stats.sectionBreakdown[category]?.earned || 0}/
                        {stats.sectionBreakdown[category]?.available || 0}{" "}
                        points
                      </div>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {items.map((item, index) => {
                    const ItemIcon = item.icon;
                    const isPenalty = item.points < 0;

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                          item.completed ? "bg-green-50/30" : ""
                        } ${isPenalty ? "bg-red-50/30" : ""}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div
                              className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center ${
                                item.completed
                                  ? "bg-green-100 text-green-600"
                                  : isPenalty
                                    ? "bg-red-100 text-red-600"
                                    : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {item.completed ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <ItemIcon className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900">
                                  {item.title}
                                </h4>
                                {item.priority === "high" && (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                    High Priority
                                  </span>
                                )}
                                {item.priority === "medium" && (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                    Medium
                                  </span>
                                )}
                                {isPenalty && (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                    Penalty
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {item.description}
                              </p>

                              {/* Progress indicator */}
                              {item.progress && (
                                <div className="mb-2">
                                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>
                                      {item.progress.current}
                                      {item.progress.unit || ""}
                                    </span>
                                    <span>
                                      {item.progress.max}
                                      {item.progress.unit || ""}
                                    </span>
                                  </div>
                                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{
                                        width: `${Math.min((item.progress.current / item.progress.max) * 100, 100)}%`,
                                      }}
                                      className={`h-full ${
                                        isPenalty ? "bg-red-500" : "bg-blue-500"
                                      }`}
                                    />
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center gap-4 mt-2">
                                <span
                                  className={`text-sm font-medium px-2 py-1 rounded-full ${
                                    item.completed
                                      ? "bg-green-100 text-green-800"
                                      : isPenalty
                                        ? "bg-red-100 text-red-800"
                                        : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {isPenalty ? "-" : "+"}
                                  {Math.abs(item.points)} points
                                </span>
                                {item.actionUrl &&
                                  !item.completed &&
                                  !isPenalty && (
                                    <button
                                      onClick={() =>
                                        router.push(item.actionUrl!)
                                      }
                                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                      Complete →
                                    </button>
                                  )}
                              </div>
                            </div>
                          </div>
                          <div className="ml-4">
                            {item.completed ? (
                              <div className="text-green-600">
                                <CheckCircle className="w-6 h-6" />
                              </div>
                            ) : (
                              <div className="text-gray-400">
                                <XCircle className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Boost Your Score?
            </h3>
            <p className="text-gray-700 mb-6">
              {stats.pending > 0
                ? `Complete ${stats.pending} more item${stats.pending !== 1 ? "s" : ""} to maximize your trust rating`
                : "You've completed all checklist items! 🎉"}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {stats.pending > 0 ? (
                <>
                  <button
                    onClick={() => {
                      const firstPending =
                        checklist.find(
                          (item) =>
                            !item.completed &&
                            item.priority === "high" &&
                            item.points > 0
                        ) ||
                        checklist.find(
                          (item) => !item.completed && item.points > 0
                        );
                      if (firstPending?.actionUrl) {
                        router.push(firstPending.actionUrl);
                      }
                    }}
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Zap className="w-5 h-5" />
                    Start with High Priority
                  </button>

                  <Link
                    href="/profile"
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-300"
                  >
                    <User className="w-5 h-5" />
                    Edit Profile
                  </Link>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <p className="text-2xl font-semibold text-gray-900 mb-2">
                    Congratulations!
                  </p>
                  <p className="text-gray-700 text-lg">
                    You've completed all checklist items! Your trust rating is
                    optimized.
                  </p>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              )}
            </div>

            {stats.pending > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">
                  Quickest ways to improve:
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {checklist
                    .filter((item) => !item.completed && item.points > 0)
                    .sort((a, b) => b.points - a.points)
                    .slice(0, 3)
                    .map((item) => (
                      <span
                        key={item.id}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-full text-sm"
                      >
                        <span className="text-blue-600 font-medium">
                          +{item.points}
                        </span>
                        <span className="text-gray-700">{item.title}</span>
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Score Impact Analysis */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Score Impact Analysis
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Current Trust Score
              </h3>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {trustStars.toFixed(1)} ⭐
                </div>
                <p className="text-gray-600">{trustScore} points</p>
                <div className="mt-4">
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${trustScore}%` }}
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>New (0)</span>
                    <span>Elite (100)</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {trustData?.featureEligibility && (
                  <>
                    <p className="font-medium text-gray-900 mb-2">
                      Current Features:
                    </p>
                    {Object.entries(trustData.featureEligibility)
                      .filter(([, enabled]) => enabled)
                      .map(([feature]) => (
                        <div key={feature} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-700">
                            {feature
                              .replace("can", "")
                              .replace(/([A-Z])/g, " $1")}
                          </span>
                        </div>
                      ))}
                  </>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Potential Trust Score
              </h3>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {potentialStars.toFixed(1)} ⭐
                </div>
                <p className="text-gray-600">
                  {potentialScore} points possible
                </p>
                <div className="mt-4">
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${potentialScore}%` }}
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>Current: {trustScore}</span>
                    <span>Potential: {potentialScore}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="font-medium text-gray-900 mb-2">
                  Features you could unlock:
                </p>
                {trustData?.featureEligibility && (
                  <>
                    {Object.entries(trustData.featureEligibility)
                      .filter(([, enabled]) => !enabled)
                      .slice(0, 4)
                      .map(([feature]) => (
                        <div key={feature} className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                          <span className="text-sm text-gray-700">
                            {feature
                              .replace("can", "")
                              .replace(/([A-Z])/g, " $1")}
                          </span>
                        </div>
                      ))}
                  </>
                )}
                {stats.pointsAvailable - stats.pointsEarned > 0 && (
                  <div className="mt-4 p-3 bg-white/50 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-700">
                      Complete your checklist items to earn{" "}
                      <span className="font-bold text-green-600">
                        +{stats.pointsAvailable - stats.pointsEarned} points
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
