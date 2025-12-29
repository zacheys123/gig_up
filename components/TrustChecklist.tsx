// app/onboarding/trust-checklist/page.tsx - NEW COMPONENT
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
  Clock, // Add this
  Crown,
  ThumbsUp,
  Video, // Add this
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import {
  checkProfileCompleteness,
  scoreToStars,
} from "@/lib/trustScoreHelpers";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  points: number;
  icon: React.ElementType;
  category: "profile" | "verification" | "activity" | "performance";
  priority: "high" | "medium" | "low";
  actionUrl?: string;
}

interface ProgressStats {
  total: number;
  completed: number;
  pending: number;
  pointsEarned: number;
  pointsAvailable: number;
  completionRate: number;
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

  useEffect(() => {
    if (user && trustData !== undefined && userData !== undefined) {
      setIsLoading(false);
    }
  }, [user, trustData, userData]);

  // Generate checklist based on user data
  // Update the generateChecklist function with proper type assertions:

  // Update the generateChecklist function to use the actual scoring logic:

  const generateChecklist = (): ChecklistItem[] => {
    if (!userData) return [];

    // Calculate account age in days
    const accountAgeDays = Math.floor(
      (Date.now() - userData._creationTime) / (1000 * 60 * 60 * 24)
    );

    const checklist: ChecklistItem[] = [
      // ========== PROFILE COMPLETENESS ==========
      {
        id: "firstname",
        title: "First Name",
        description: "Add your first name",
        completed: !!userData.firstname,
        points: 5, // From: if (user.firstname) score += 5;
        icon: User,
        category: "profile" as const,
        priority: "high" as const,
        actionUrl: "/profile/edit?section=basic",
      },
      {
        id: "city",
        title: "City/Location",
        description: "Add your city location",
        completed: !!userData.city,
        points: 5, // From: if (user.city) score += 5;
        icon: MapPin,
        category: "profile" as const,
        priority: "high" as const,
        actionUrl: "/profile/edit?section=basic",
      },
      {
        id: "phone",
        title: "Phone Number",
        description: "Add your phone number",
        completed: !!userData.phone,
        points: 5, // From: if (user.phone) score += 5;
        icon: Phone,
        category: "profile" as const,
        priority: "high" as const,
        actionUrl: "/profile/edit?section=contact",
      },
      {
        id: "picture",
        title: "Profile Picture",
        description: "Add a profile picture",
        completed: !!userData.picture,
        points: 5, // From: if (user.picture) score += 5;
        icon: Camera,
        category: "profile" as const,
        priority: "medium" as const,
        actionUrl: "/profile/edit?section=basic",
      },
      {
        id: "onboarding",
        title: "Complete Onboarding",
        description: "Finish the onboarding process",
        completed: !!userData.onboardingComplete,
        points: 5, // From: if (user.onboardingComplete) score += 5;
        icon: CheckCircle,
        category: "profile" as const,
        priority: "medium" as const,
        actionUrl: "/onboarding",
      },
      {
        id: "profileComplete",
        title: "Profile Completeness",
        description: "Complete all required profile fields",
        completed: checkProfileCompleteness(userData),
        points: 0, // This affects multiplier, not direct points
        icon: User,
        category: "profile" as const,
        priority: "high" as const,
        actionUrl: `/profile/${userData._id}/user`,
      },
      // ========== VERIFICATION ==========
      {
        id: "mpesa",
        title: "M-Pesa Payment Method",
        description: "Add M-Pesa for payments",
        completed: !!userData.mpesaPhoneNumber,
        points: 15, // From: if (user.mpesaPhoneNumber) score += 15;
        icon: CreditCard,
        category: "verification" as const,
        priority: "high" as const,
        actionUrl: "/profile/edit?section=payment",
      },
      // ========== ACCOUNT ACTIVITY ==========
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
                  : "Account over 1 year old",
        completed: accountAgeDays > 0,
        points:
          accountAgeDays > 365
            ? 10
            : accountAgeDays > 180
              ? 7
              : accountAgeDays > 90
                ? 5
                : accountAgeDays > 30
                  ? 3
                  : 1, // From: daysOld scoring
        icon: Calendar,
        category: "activity" as const,
        priority: "low" as const,
        actionUrl: "/dashboard",
      },
      {
        id: "lastActive",
        title: "Recent Activity",
        description: "Be active on the platform",
        completed:
          !!userData.lastActive &&
          Date.now() - userData.lastActive < 30 * 24 * 60 * 60 * 1000, // Active within 30 days
        points: 5, // From: if (user.lastActive) daysSinceActive < 1/7/30 scoring
        icon: Zap,
        category: "activity" as const,
        priority: "medium" as const,
        actionUrl: "/dashboard",
      },
      // ========== FOLLOWERS ==========
      {
        id: "followers",
        title: "Followers",
        description: "Build your follower base",
        completed: (userData.followers?.length || 0) >= 5,
        points:
          (userData.followers?.length || 0) >= 100
            ? 10
            : (userData.followers?.length || 0) >= 50
              ? 7
              : (userData.followers?.length || 0) >= 20
                ? 4
                : (userData.followers?.length || 0) >= 5
                  ? 2
                  : 0, // From: followerCount scoring
        icon: Users,
        category: "activity" as const,
        priority: "low" as const,
        actionUrl: "/profile",
      },

      // ========== VIDEO CONTENT ==========
      {
        id: "videos",
        title: "Upload Videos",
        description: "Add videos to showcase your talent or gigs",
        completed: false, // We'll need to query videos
        points: 5, // Base points for having videos
        icon: Video, // Need to import Video icon
        category: "activity" as const,
        priority: "medium" as const,
        actionUrl: "/videos/upload",
      },
      {
        id: "profileVideo",
        title: "Profile Video",
        description: "Add a video introduction to your profile",
        completed: false, // Check if user has profile video
        points: 5, // Bonus for profile video
        icon: User,
        category: "profile" as const,
        priority: "medium" as const,
        actionUrl: "/profile/edit?section=videos",
      },
      {
        id: "videoEngagement",
        title: "Video Engagement",
        description: "Get likes and views on your videos",
        completed: false, // Check video engagement
        points: 2, // Points for engagement
        icon: ThumbsUp,
        category: "performance" as const,
        priority: "low" as const,
        actionUrl: "/videos",
      },
    ];

    // ========== ROLE-SPECIFIC ITEMS ==========
    if (userData.isMusician) {
      const musicianItems: ChecklistItem[] = [
        {
          id: "roleType",
          title: "Musician Role",
          description: "Specify your musician role",
          completed: !!userData.roleType,
          points: 0, // Not in score calculation directly
          icon: Award,
          category: "profile" as const,
          priority: "high" as const,
          actionUrl: "/profile/edit?section=role",
        },
        {
          id: "instrument",
          title: "Instrument",
          description: "Add your primary instrument",
          completed: !!userData.instrument,
          points: 5, // From: if (user.instrument) score += 5;
          icon: Award,
          category: "profile" as const,
          priority: "medium" as const,
          actionUrl: "/profile/edit?section=skills",
        },
        {
          id: "talentbio",
          title: "Talent Bio",
          description: "Write about your musical talent",
          completed: !!userData.talentbio,
          points: 5, // From: if (user.talentbio) score += 5;
          icon: FileText,
          category: "profile" as const,
          priority: "low" as const,
          actionUrl: "/profile/edit?section=bio",
        },
        {
          id: "genres",
          title: "Music Genres",
          description: "Add your music genres",
          completed: !!userData.musiciangenres?.length,
          points: 5, // From: if (user.musiciangenres?.length) score += 5;
          icon: TrendingUp,
          category: "profile" as const,
          priority: "medium" as const,
          actionUrl: "/profile/edit?section=skills",
        },
        {
          id: "completedGigs",
          title: "Complete Gigs",
          description: "Successfully complete gigs",
          completed: (userData.completedGigsCount || 0) >= 1,
          points: Math.min((userData.completedGigsCount || 0) * 3, 15), // From: score += Math.min((user.completedGigsCount || 0) * 3, 15);
          icon: Calendar,
          category: "performance" as const,
          priority: "medium" as const,
          actionUrl: "/gigs",
        },
        {
          id: "rating",
          title: "High Rating",
          description: "Maintain a good rating from clients",
          completed: (userData.avgRating || 0) >= 4.0,
          points:
            (userData.avgRating || 0) >= 4.5
              ? 10
              : (userData.avgRating || 0) >= 4.0
                ? 7
                : (userData.avgRating || 0) >= 3.5
                  ? 4
                  : (userData.avgRating || 0) > 0
                    ? 2
                    : 0, // From: avgRating scoring for musicians
          icon: Star,
          category: "performance" as const,
          priority: "high" as const,
          actionUrl: "/reviews",
        },
        {
          id: "responseTime",
          title: "Quick Response",
          description: "Respond to messages within 24 hours",
          completed: false, // You'd need to check userData.performanceStats?.responseTime
          points: 5, // From: if (user.performanceStats?.responseTime < 24) score += 5;
          icon: Clock, // Need to import Clock
          category: "performance" as const,
          priority: "medium" as const,
          actionUrl: "/messages",
        },
      ];
      checklist.push(...musicianItems);
    } else if (userData.isClient) {
      const clientItems: ChecklistItem[] = [
        {
          id: "clientType",
          title: "Client Type",
          description: "Specify what type of client you are",
          completed: !!userData.clientType,
          points:
            userData.clientType === "corporate_client"
              ? 10
              : userData.clientType === "venue_client"
                ? 8
                : userData.clientType === "event_planner_client"
                  ? 6
                  : userData.clientType === "individual_client"
                    ? 4
                    : 0, // From: clientType scoring
          icon: Building,
          category: "profile" as const,
          priority: "high" as const,
          actionUrl: "/profile/edit?section=role",
        },
        {
          id: "organization",
          title: "Organization",
          description: "Add your organization name",
          completed: !!userData.organization || !!userData.companyName,
          points: 5, // From: if (user.organization) score += 5;
          icon: Building,
          category: "profile" as const,
          priority: "medium" as const,
          actionUrl: "/profile/edit?section=basic",
        },
        {
          id: "gigsPosted",
          title: "Post Gigs",
          description: "Post gigs on the platform",
          completed: (userData.gigsPosted || 0) >= 1,
          points: 0, // Points depend on completion rate
          icon: Calendar,
          category: "activity" as const,
          priority: "medium" as const,
          actionUrl: "/gigs/post",
        },
        {
          id: "completionRate",
          title: "Gig Completion Rate",
          description: "Successfully complete posted gigs",
          completed:
            (userData.gigsPosted || 0) > 0 &&
            (userData.completedGigsCount || 0) > 0,
          points: (() => {
            if (!userData.gigsPosted || !userData.completedGigsCount) return 0;
            const completionRate =
              userData.completedGigsCount / userData.gigsPosted;
            return completionRate === 1
              ? 20
              : completionRate >= 0.8
                ? 15
                : completionRate >= 0.6
                  ? 10
                  : completionRate >= 0.4
                    ? 5
                    : completionRate > 0
                      ? 2
                      : 0;
          })(), // From: completionRate scoring
          icon: CheckCircle,
          category: "performance" as const,
          priority: "high" as const,
          actionUrl: "/gigs",
        },
        {
          id: "clientRating",
          title: "Client Rating",
          description: "Maintain a good rating from musicians",
          completed: (userData.avgRating || 0) >= 4.0,
          points:
            (userData.avgRating || 0) >= 4.8
              ? 10
              : (userData.avgRating || 0) >= 4.5
                ? 7
                : (userData.avgRating || 0) >= 4.0
                  ? 4
                  : (userData.avgRating || 0) > 0
                    ? 2
                    : 0, // From: avgRating scoring for clients
          icon: Star,
          category: "performance" as const,
          priority: "high" as const,
          actionUrl: "/reviews",
        },
        {
          id: "noSpam",
          title: "Avoid Spam Posting",
          description: "Maintain healthy gig posting ratio",
          completed: true, // Default to true, will be penalized if spam
          points: 0, // Negative points for spam - shows as penalty
          icon: Shield,
          category: "performance" as const,
          priority: "medium" as const,
          actionUrl: "/gigs",
        },
      ];
      checklist.push(...clientItems);
    } else if (userData.isBooker) {
      const bookerItems: ChecklistItem[] = [
        {
          id: "bookerType",
          title: "Booker Type",
          description: "Specify your booker role",
          completed: !!userData.bookerType,
          points: 0, // Not in score calculation directly
          icon: Briefcase,
          category: "profile" as const,
          priority: "high" as const,
          actionUrl: "/profile/edit?section=role",
        },
        {
          id: "agencyName",
          title: "Agency/Company",
          description: "Add your agency or company name",
          completed: !!userData.agencyName || !!userData.companyName,
          points: 5, // From: if (user.agencyName) score += 5; if (user.companyName) score += 5;
          icon: Building,
          category: "profile" as const,
          priority: "medium" as const,
          actionUrl: "/profile/edit?section=basic",
        },
        {
          id: "bookerBio",
          title: "Booker Bio",
          description: "Describe your booking experience",
          completed: !!userData.bookerBio,
          points: 5, // From: if (user.bookerBio) score += 5;
          icon: FileText,
          category: "profile" as const,
          priority: "low" as const,
          actionUrl: "/profile/edit?section=bio",
        },
        {
          id: "bookerSkills",
          title: "Booking Skills",
          description: "Add your booking skills",
          completed: !!userData.bookerSkills?.length,
          points: 5, // From: if (user.bookerSkills?.length) score += 5;
          icon: Award,
          category: "profile" as const,
          priority: "medium" as const,
          actionUrl: "/profile/edit?section=skills",
        },
        {
          id: "artistsManaged",
          title: "Artists Managed",
          description: "Manage multiple artists",
          completed: (userData.artistsManaged?.length || 0) >= 1,
          points: Math.min((userData.artistsManaged?.length || 0) * 2, 10), // From: score += Math.min((user.artistsManaged?.length || 0) * 2, 10);
          icon: Users,
          category: "activity" as const,
          priority: "medium" as const,
          actionUrl: "/artists",
        },
        {
          id: "bandsManaged",
          title: "Bands Managed",
          description: "Manage multiple bands",
          completed: (userData.managedBands?.length || 0) >= 1,
          points: Math.min((userData.managedBands?.length || 0) * 3, 9), // From: score += Math.min((user.managedBands?.length || 0) * 3, 9);
          icon: Users,
          category: "activity" as const,
          priority: "medium" as const,
          actionUrl: "/bands",
        },
        {
          id: "successfulBookings",
          title: "Successful Bookings",
          description: "Complete successful bookings",
          completed: false, // You'd need to check userData.bookingHistory
          points: 0, // Based on bookingHistory
          icon: CheckCircle,
          category: "performance" as const,
          priority: "high" as const,
          actionUrl: "/bookings",
        },
      ];
      checklist.push(...bookerItems);
    }

    // ========== SUBSCRIPTION TIER ==========
    checklist.push({
      id: "tier",
      title: "Subscription Tier",
      description: "Upgrade your subscription tier",
      completed: userData.tier !== "free",
      points:
        userData.tier === "elite"
          ? 15
          : userData.tier === "premium"
            ? 10
            : userData.tier === "pro"
              ? 5
              : userData.tier === "free"
                ? 1
                : 0, // From: tier scoring
      icon: Crown, // Need to import Crown
      category: "verification" as const,
      priority: "low" as const,
      actionUrl: "/subscription",
    });

    // ========== PENALTIES (show as warnings) ==========
    if (userData.isSuspended || userData.isBanned) {
      checklist.push({
        id: "accountStatus",
        title: "Account Status",
        description: userData.isBanned
          ? "Account is banned"
          : "Account is suspended",
        completed: false,
        points: userData.isBanned ? -100 : -30, // Negative points
        icon: AlertCircle,
        category: "performance" as const,
        priority: "high" as const,
        actionUrl: "/support",
      });
    }

    if ((userData.reportsCount || 0) > 0) {
      checklist.push({
        id: "reports",
        title: "User Reports",
        description: `Has ${userData.reportsCount || 0} report(s)`,
        completed: false,
        points: Math.min((userData.reportsCount || 0) * -5, -30), // Negative points
        icon: AlertCircle,
        category: "performance" as const,
        priority: "high" as const,
        actionUrl: "/support",
      });
    }

    if ((userData.cancelgigCount || 0) > 0) {
      checklist.push({
        id: "cancellations",
        title: "Gig Cancellations",
        description: `Has cancelled ${userData.cancelgigCount || 0} gig(s)`,
        completed: false,
        points: Math.min((userData.cancelgigCount || 0) * -3, -20), // Negative points
        icon: AlertCircle,
        category: "performance" as const,
        priority: "medium" as const,
        actionUrl: "/gigs",
      });
    }

    return checklist;
  };

  // Calculate progress stats
  const calculateStats = (checklist: ChecklistItem[]): ProgressStats => {
    const total = checklist.length;
    const completed = checklist.filter((item) => item.completed).length;
    const pending = total - completed;
    const pointsEarned = checklist
      .filter((item) => item.completed)
      .reduce((sum, item) => sum + item.points, 0);
    const pointsAvailable = checklist.reduce(
      (sum, item) => sum + item.points,
      0
    );
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      pending,
      pointsEarned,
      pointsAvailable,
      completionRate,
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
  const trustStars = trustData?.trustStars || 0.5;

  // Group by category
  const groupedChecklist = checklist.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, ChecklistItem[]>
  );

  // Get category completion rates
  const categoryStats = Object.entries(groupedChecklist).map(
    ([category, items]) => {
      const completed = items.filter((item) => item.completed).length;
      const total = items.length;
      const completionRate = total > 0 ? (completed / total) * 100 : 0;
      const pointsEarned = items
        .filter((item) => item.completed)
        .reduce((sum, item) => sum + item.points, 0);
      const pointsAvailable = items.reduce((sum, item) => sum + item.points, 0);

      return {
        category,
        completed,
        total,
        completionRate,
        pointsEarned,
        pointsAvailable,
      };
    }
  );

  const categoryIcons: Record<string, React.ElementType> = {
    profile: User,
    verification: Shield,
    activity: Zap,
    performance: TrendingUp,
  };

  const categoryColors: Record<string, string> = {
    profile: "bg-blue-100 text-blue-800 border-blue-200",
    verification: "bg-green-100 text-green-800 border-green-200",
    activity: "bg-purple-100 text-purple-800 border-purple-200",
    performance: "bg-amber-100 text-amber-800 border-amber-200",
  };

  const categoryBgColors: Record<string, string> = {
    profile: "from-blue-50 to-blue-100",
    verification: "from-green-50 to-green-100",
    activity: "from-purple-50 to-purple-100",
    performance: "from-amber-50 to-amber-100",
  };

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
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg mb-6">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(trustStars)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                    />
                  ))}
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {trustStars.toFixed(1)} stars
                </div>
              </div>
              <div className="h-6 w-px bg-gray-300" />
              <div className="text-2xl font-bold text-gray-800">
                {trustScore}/100
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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.completionRate}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-blue-600 rounded-full"
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {stats.completed}/{stats.total} completed
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Points Earned</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.pointsEarned}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Out of {stats.pointsAvailable} available
              </p>
              <p className="text-xs text-gray-500">
                Earn {stats.pointsAvailable - stats.pointsEarned} more points
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Actions</p>
                <p className="text-3xl font-bold text-amber-600">
                  {stats.pending}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">Items to complete</p>
              <p className="text-xs text-gray-500">
                {stats.completed === stats.total
                  ? "All done! 🎉"
                  : "Keep going!"}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.completionRate.toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">Overall progress</p>
              <p className="text-xs text-gray-500">
                {stats.completionRate >= 75
                  ? "Excellent! ⭐"
                  : stats.completionRate >= 50
                    ? "Good progress"
                    : "Keep going!"}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Category Stats */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Progress by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryStats.map((catStat, index) => {
              const Icon = categoryIcons[catStat.category];

              // Define category-specific styling based on your theme
              const getCategoryStyle = (category: string) => {
                switch (category) {
                  case "profile":
                    return {
                      bgGradient: "from-blue-50 to-blue-100/80",
                      borderColor: "border-blue-200",
                      iconBg: "bg-blue-100",
                      iconColor: "text-blue-600",
                      progressBar: "bg-blue-500",
                      textColor: "text-blue-800",
                    };
                  case "verification":
                    return {
                      bgGradient: "from-emerald-50 to-emerald-100/80",
                      borderColor: "border-emerald-200",
                      iconBg: "bg-emerald-100",
                      iconColor: "text-emerald-600",
                      progressBar: "bg-emerald-500",
                      textColor: "text-emerald-800",
                    };
                  case "activity":
                    return {
                      bgGradient: "from-purple-50 to-purple-100/80",
                      borderColor: "border-purple-200",
                      iconBg: "bg-purple-100",
                      iconColor: "text-purple-600",
                      progressBar: "bg-purple-500",
                      textColor: "text-purple-800",
                    };
                  case "performance":
                    return {
                      bgGradient: "from-amber-50 to-amber-100/80",
                      borderColor: "border-amber-200",
                      iconBg: "bg-amber-100",
                      iconColor: "text-amber-600",
                      progressBar: "bg-amber-500",
                      textColor: "text-amber-800",
                    };
                  default:
                    return {
                      bgGradient: "from-gray-50 to-gray-100/80",
                      borderColor: "border-gray-200",
                      iconBg: "bg-gray-100",
                      iconColor: "text-gray-600",
                      progressBar: "bg-gray-500",
                      textColor: "text-gray-800",
                    };
                }
              };

              const style = getCategoryStyle(catStat.category);

              return (
                <motion.div
                  key={catStat.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{
                    scale: 1.03,
                    boxShadow:
                      "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  }}
                  className={`bg-gradient-to-br ${style.bgGradient} rounded-xl p-6 border ${style.borderColor} transition-all duration-300 hover:border-opacity-70`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-10 h-10 rounded-lg ${style.iconBg} flex items-center justify-center shadow-sm`}
                    >
                      <Icon className={`w-5 h-5 ${style.iconColor}`} />
                    </div>
                    <div>
                      <h3
                        className={`font-bold capitalize text-lg ${style.textColor}`}
                      >
                        {catStat.category}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {catStat.completed}/{catStat.total} items
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Progress</span>
                      <span className={`font-bold ${style.textColor}`}>
                        {catStat.completionRate.toFixed(1)}%
                      </span>
                    </div>

                    <div className="h-2 bg-white/70 rounded-full overflow-hidden shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${catStat.completionRate}%` }}
                        transition={{
                          duration: 1.2,
                          ease: "easeOut",
                          delay: index * 0.05,
                        }}
                        className={`h-full ${style.progressBar} rounded-full shadow-sm`}
                      />
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-2 h-2 rounded-full ${style.progressBar}`}
                        />
                        <span className="text-xs text-gray-600">
                          Points:{" "}
                          <span className={`font-bold ${style.textColor}`}>
                            {catStat.pointsEarned}
                          </span>
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        /{catStat.pointsAvailable}
                      </span>
                    </div>

                    {/* Completion status badge */}
                    {catStat.completionRate === 100 ? (
                      <div className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Complete
                      </div>
                    ) : catStat.completionRate >= 75 ? (
                      <div className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        <TrendingUp className="w-3 h-3" />
                        Good progress
                      </div>
                    ) : catStat.completionRate >= 50 ? (
                      <div className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                        <Clock className="w-3 h-3" />
                        Halfway there
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        Needs work
                      </div>
                    )}
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

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <div
                  className={`px-6 py-4 ${categoryColors[category].split(" ")[0]} border-b ${categoryColors[category].split(" ")[2]}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <h3 className="text-lg font-semibold capitalize">
                        {category}
                      </h3>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold">{completedItems}</span>
                      <span className="text-gray-600">/{totalItems}</span>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {items.map((item, index) => {
                    const ItemIcon = item.icon;
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                          item.completed ? "bg-green-50/30" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div
                              className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center ${
                                item.completed
                                  ? "bg-green-100 text-green-600"
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
                              <div className="flex items-center gap-2">
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
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {item.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                <span
                                  className={`text-sm font-medium px-2 py-1 rounded-full ${
                                    item.completed
                                      ? "bg-green-100 text-green-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  +{item.points} points
                                </span>
                                {item.actionUrl && !item.completed && (
                                  <button
                                    onClick={() => router.push(item.actionUrl!)}
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
            <p className="text-gray-700 mb-8">
              Complete high-priority items first to quickly increase your trust
              rating
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {stats.pending > 0 ? (
                <>
                  <button
                    onClick={() => {
                      const firstPending =
                        checklist.find(
                          (item) => !item.completed && item.priority === "high"
                        ) ||
                        checklist.find((item) => !item.completed) ||
                        checklist[0];
                      if (firstPending?.actionUrl) {
                        router.push(firstPending.actionUrl);
                      }
                    }}
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    <Zap className="w-5 h-5" />
                    Start with High Priority
                  </button>

                  <Link
                    href="/profile/edit"
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    Edit Profile
                  </Link>
                </>
              ) : (
                <div className="text-center">
                  <div className="text-5xl mb-4">🎉</div>
                  <p className="text-xl font-semibold text-gray-900 mb-2">
                    Congratulations!
                  </p>
                  <p className="text-gray-700">
                    You've completed all checklist items!
                  </p>
                </div>
              )}
            </div>

            {stats.pending > 0 && (
              <p className="text-sm text-gray-600 mt-6">
                Complete {stats.pending} more item{stats.pending !== 1 && "s"}{" "}
                to maximize your trust rating
              </p>
            )}
          </div>
        </motion.div>

        {/* Estimated Impact */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Estimated Impact
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Current Trust Score
              </h3>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {trustStars.toFixed(1)} ⭐
                </div>
                <p className="text-gray-600">{trustScore} points</p>
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
            // Replace the Potential Trust Score section with this:
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Potential Trust Score
              </h3>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {(() => {
                    const potentialScore = Math.min(
                      100,
                      trustScore + stats.pointsAvailable - stats.pointsEarned
                    );
                    const potentialStars = scoreToStars(potentialScore);
                    return `${potentialStars.toFixed(1)} ⭐`;
                  })()}
                </div>
                <p className="text-gray-600">
                  {Math.min(
                    100,
                    trustScore + stats.pointsAvailable - stats.pointsEarned
                  )}{" "}
                  points possible
                </p>
              </div>
              {/* ... rest of the component ... */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
