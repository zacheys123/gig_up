// app/hub/gigs/musician/[gigId]/gig-info/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Icons
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Music,
  Mic,
  Volume2,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Heart,
  Briefcase,
  User as UserIcon,
  Users2,
  Award,
  Shield,
  TrendingUp,
  Sparkles,
  Eye,
  Crown,
  Medal,
  BadgeCheck,
  UserRound,
  UserRoundCheck,
  UserRoundX,
  UserRoundPlus,
  UserRoundSearch,
  Loader2,
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  Linkedin,
  Globe,
  Mail,
  Phone,
  Github,
  Camera,
  Edit3,
  MoreHorizontal,
  Bookmark,
  Share2,
  Flag,
  Ban,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  Filter,
  Search,
  SlidersHorizontal,
  Grid,
  List,
  CalendarDays,
  Clock3,
  Timer,
  UsersRound,
  VerifiedIcon,
  ThumbsUp,
} from "lucide-react";

// Trust components
import { TrustStarsDisplay } from "@/components/trust/TrustStarsDisplay";
import { ChatIcon } from "@/components/chat/ChatIcon";

// Types
interface PageProps {
  params: Promise<{
    gigId: string;
  }>;
}

interface UserWithTrust {
  _id: Id<"users">;
  firstname?: string;
  username?: string;
  picture?: string;
  trustStars?: number;
  trustTier?: string;
  verifiedIdentity?: boolean;
  roleType?: string;
  city?: string;
  completedGigsCount?: number;
  followers?: string[];
  avgRating?: number;
  instrument?: string;
  experience?: string;
  phone?: string;
  email?: string;
  musicianhandles?: Array<{ platform: string; handle: string }>;
  _creationTime: number;
}

export default function GigDetailsPage({ params }: PageProps) {
  const { gigId } = React.use(params);

  const router = useRouter();
  const { colors, isDarkMode } = useThemeColors();
  const { user: currentUser } = useCurrentUser();
  const [activeTab, setActiveTab] = useState("all");
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Mutations
  const removeInterestFromGig = useMutation(
    api.controllers.gigs.removeInterestFromGig,
  );

  // Fetch gig data
  const gig = useQuery(api.controllers.gigs.getGigById, {
    gigId: gigId as Id<"gigs">,
  });

  // Fetch ALL users that are involved in this gig (competitors)
  const userIds = useMemo(() => {
    if (!gig) return [];

    const ids = new Set<Id<"users">>();

    // 1. Add poster (gig owner)
    ids.add(gig.postedBy);

    // 2. Add interested users (regular gigs)
    gig.interestedUsers?.forEach((id) => ids.add(id as Id<"users">));

    // 3. Add applied users (if they exist separately)
    gig.appliedUsers?.forEach((id) => ids.add(id as Id<"users">));

    // 4. Add shortlisted users
    gig.shortlistedUsers?.forEach((item) =>
      ids.add(item.userId as Id<"users">),
    );

    // 5. Add booked user (if any)
    if (gig.bookedBy) ids.add(gig.bookedBy as Id<"users">);

    // 6. Add band role applicants
    gig.bandCategory?.forEach((role) => {
      role.applicants?.forEach((id) => ids.add(id as Id<"users">));
      role.bookedUsers?.forEach((id) => ids.add(id as Id<"users">));
    });

    // 7. Add band booking applicants
    gig.bookCount?.forEach((booking) => {
      ids.add(booking.appliedBy as Id<"users">);
      booking.performingMembers?.forEach((member) =>
        ids.add(member.userId as Id<"users">),
      );
    });

    return Array.from(ids);
  }, [gig]);

  // Fetch all users data
  const users = useQuery(api.controllers.user.getUsersByIds, {
    userIds: userIds,
  });

  // Create user map for easy lookup
  const userMap = useMemo(() => {
    if (!users) return new Map();
    const map = new Map<Id<"users">, UserWithTrust>();
    users.forEach((user: any) => map.set(user._id, user));
    return map;
  }, [users]);

  // Get selected user data
  const selectedUser = useMemo(() => {
    if (!selectedUserId) return null;
    return userMap.get(selectedUserId);
  }, [selectedUserId, userMap]);

  // Get poster data
  const poster = useMemo(() => {
    return gig?.postedBy ? userMap.get(gig.postedBy as Id<"users">) : null;
  }, [gig, userMap]);

  // Get user's own application status
  const userApplication = useMemo(() => {
    if (!currentUser?._id || !gig) return null;

    // Check if user is the poster
    if (gig.postedBy === currentUser._id) {
      return { type: "poster", status: "owner" };
    }

    // Check if user is in interestedUsers
    if (gig.interestedUsers?.includes(currentUser._id)) {
      return { type: "interested", status: "pending" };
    }

    // Check if user is in appliedUsers
    if (gig.appliedUsers?.includes(currentUser._id)) {
      return { type: "applied", status: "pending" };
    }

    // Check if user is shortlisted
    const shortlistedEntry = gig.shortlistedUsers?.find(
      (item: any) => item.userId === currentUser._id,
    );
    if (shortlistedEntry) {
      return { type: "shortlisted", status: "active" };
    }

    // Check if user is booked
    if (gig.bookedBy === currentUser._id) {
      return { type: "booked", status: "confirmed" };
    }

    // Check band roles
    if (gig.bandCategory) {
      for (const role of gig.bandCategory) {
        if (role.applicants?.includes(currentUser._id)) {
          return { type: "band-applicant", status: "pending", role: role.role };
        }
        if (role.bookedUsers?.includes(currentUser._id)) {
          return { type: "band-booked", status: "booked", role: role.role };
        }
      }
    }

    // Check band bookings
    if (gig.bookCount) {
      for (const booking of gig.bookCount) {
        if (booking.appliedBy === currentUser._id) {
          return { type: "band-booking", status: "applied" };
        }
      }
    }

    return null;
  }, [gig, currentUser]);

  // Get user's role in this gig (for status display)
  const getUserRoleInGig = (userId: Id<"users">) => {
    if (!gig) return null;

    if (gig.postedBy === userId) return "poster";
    if (gig.bookedBy === userId) return "booked";

    if (gig.interestedUsers?.includes(userId)) return "interested";
    if (gig.appliedUsers?.includes(userId)) return "applied";

    const shortlisted = gig.shortlistedUsers?.find(
      (item) => item.userId === userId,
    );
    if (shortlisted) return "shortlisted";

    for (const role of gig.bandCategory || []) {
      if (role.applicants?.includes(userId)) return "band-applicant";
      if (role.bookedUsers?.includes(userId)) return "band-booked";
    }

    for (const booking of gig.bookCount || []) {
      if (booking.appliedBy === userId) return "band-booking";
      if (booking.performingMembers?.some((m) => m.userId === userId))
        return "band-member";
    }

    return null;
  };

  // Get status badge for a user
  const getUserStatusBadge = (userId: Id<"users">) => {
    const role = getUserRoleInGig(userId);

    // Professional color palette - muted, sophisticated
    const styles = {
      poster: {
        bg: isDarkMode ? "bg-indigo-900/30" : "bg-indigo-50",
        text: isDarkMode ? "text-indigo-300" : "text-indigo-700",
        border: isDarkMode ? "border-indigo-800" : "border-indigo-200",
        icon: <Crown className="w-3 h-3 mr-1" />,
        label: "Gig Owner",
      },
      booked: {
        bg: isDarkMode ? "bg-emerald-900/30" : "bg-emerald-50",
        text: isDarkMode ? "text-emerald-300" : "text-emerald-700",
        border: isDarkMode ? "border-emerald-800" : "border-emerald-200",
        icon: <CheckCircle className="w-3 h-3 mr-1" />,
        label: "Booked",
      },
      shortlisted: {
        bg: isDarkMode ? "bg-emerald-900/30" : "bg-emerald-50",
        text: isDarkMode ? "text-emerald-300" : "text-emerald-700",
        border: isDarkMode ? "border-emerald-800" : "border-emerald-200",
        icon: <Star className="w-3 h-3 mr-1" />,
        label: "Shortlisted",
      },
      interested: {
        bg: isDarkMode ? "bg-sky-900/30" : "bg-sky-50",
        text: isDarkMode ? "text-sky-300" : "text-sky-700",
        border: isDarkMode ? "border-sky-800" : "border-sky-200",
        icon: <Heart className="w-3 h-3 mr-1" />,
        label: "Interested",
      },
      applied: {
        bg: isDarkMode ? "bg-amber-900/30" : "bg-amber-50",
        text: isDarkMode ? "text-amber-300" : "text-amber-700",
        border: isDarkMode ? "border-amber-800" : "border-amber-200",
        icon: <Briefcase className="w-3 h-3 mr-1" />,
        label: "Applied",
      },
      "band-applicant": {
        bg: isDarkMode ? "bg-amber-900/30" : "bg-amber-50",
        text: isDarkMode ? "text-amber-300" : "text-amber-700",
        border: isDarkMode ? "border-amber-800" : "border-amber-200",
        icon: <Briefcase className="w-3 h-3 mr-1" />,
        label: "Applied",
      },
      "band-booking": {
        bg: isDarkMode ? "bg-amber-900/30" : "bg-amber-50",
        text: isDarkMode ? "text-amber-300" : "text-amber-700",
        border: isDarkMode ? "border-amber-800" : "border-amber-200",
        icon: <Users2 className="w-3 h-3 mr-1" />,
        label: "Band Applied",
      },
      "band-booked": {
        bg: isDarkMode ? "bg-emerald-900/30" : "bg-emerald-50",
        text: isDarkMode ? "text-emerald-300" : "text-emerald-700",
        border: isDarkMode ? "border-emerald-800" : "border-emerald-200",
        icon: <CheckCircle className="w-3 h-3 mr-1" />,
        label: "Booked",
      },
      "band-member": {
        bg: isDarkMode ? "bg-sky-900/30" : "bg-sky-50",
        text: isDarkMode ? "text-sky-300" : "text-sky-700",
        border: isDarkMode ? "border-sky-800" : "border-sky-200",
        icon: <Users className="w-3 h-3 mr-1" />,
        label: "Band Member",
      },
    };

    const style = styles[role as keyof typeof styles];
    if (!style) return null;

    return {
      ...style,
      className: cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        style.bg,
        style.text,
        style.border,
      ),
    };
  };

  // Check if user can message another user
  const canMessageUser = (targetUserId: Id<"users">) => {
    if (!currentUser?._id) return false;
    if (targetUserId === currentUser._id) return false;

    // Anyone can message the poster
    if (targetUserId === gig?.postedBy) return true;

    // Poster can message anyone
    if (gig?.postedBy === currentUser._id) return true;

    return false;
  };

  // Format helpers
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount?: number, currency?: string) => {
    if (!amount) return "Contact for price";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "just now";
  };

  // Get trust tier icon
  const getTrustTierIcon = (tier?: string) => {
    switch (tier) {
      case "elite":
        return <Crown className="w-4 h-4 text-amber-500" />;
      case "trusted":
        return <Medal className="w-4 h-4 text-sky-500" />;
      case "verified":
        return <BadgeCheck className="w-4 h-4 text-emerald-500" />;
      case "basic":
        return <Shield className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  // Get role icon
  const getRoleIcon = (roleType?: string) => {
    switch (roleType?.toLowerCase()) {
      case "vocalist":
        return <Mic className="w-4 h-4 text-rose-500" />;
      case "dj":
        return <Volume2 className="w-4 h-4 text-violet-500" />;
      case "mc":
        return <Mic className="w-4 h-4 text-amber-500" />;
      case "instrumentalist":
        return <Music className="w-4 h-4 text-sky-500" />;
      default:
        return <UserRound className="w-4 h-4 text-gray-400" />;
    }
  };

  // Handle view profile
  const handleViewProfile = (userId: Id<"users">) => {
    setSelectedUserId(userId);
    setShowProfileDialog(true);
  };

  // Handle withdraw
  const handleWithdraw = async () => {
    if (!currentUser?._id || !gig) return;

    setLoading(true);
    try {
      const isBooked =
        userApplication?.type === "booked" ||
        userApplication?.type === "band-booked";

      await removeInterestFromGig({
        gigId: gig._id,
        userId: currentUser._id,
        reason: withdrawReason || undefined,
        isFromBooked: isBooked,
      });

      toast.success(isBooked ? "Booking cancelled" : "Application withdrawn");

      setShowWithdrawDialog(false);
      setWithdrawReason("");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to withdraw");
    } finally {
      setLoading(false);
    }
  };

  // Get application status badge for current user
  const getMyStatusBadge = () => {
    if (!userApplication) return null;

    const badges = {
      poster: {
        bg: "bg-indigo-100 dark:bg-indigo-900/30",
        text: "text-indigo-700 dark:text-indigo-300",
        icon: Crown,
        label: "Gig Owner",
      },
      interested: {
        bg: "bg-sky-100 dark:bg-sky-900/30",
        text: "text-sky-700 dark:text-sky-300",
        icon: Heart,
        label: "Interested",
      },
      applied: {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-700 dark:text-amber-300",
        icon: Briefcase,
        label: "Applied",
      },
      shortlisted: {
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        text: "text-emerald-700 dark:text-emerald-300",
        icon: Star,
        label: "Shortlisted",
      },
      booked: {
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        text: "text-emerald-700 dark:text-emerald-300",
        icon: CheckCircle,
        label: "Booked",
      },
      "band-applicant": {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-700 dark:text-amber-300",
        icon: Briefcase,
        label: "Applied",
      },
      "band-booked": {
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        text: "text-emerald-700 dark:text-emerald-300",
        icon: CheckCircle,
        label: "Booked",
      },
      "band-booking": {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-700 dark:text-amber-300",
        icon: Users2,
        label: "Band Applied",
      },
    };

    const badge = badges[userApplication.type as keyof typeof badges];
    if (!badge) return null;

    const Icon = badge.icon;
    return (
      <Badge className={cn(badge.bg, badge.text, "border-0")}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.label}
        {userApplication.role && ` • ${userApplication.role}`}
      </Badge>
    );
  };

  // Group applicants by type
  const groupedApplicants = useMemo(() => {
    if (!gig || !userMap)
      return {
        interested: [],
        applied: [],
        shortlisted: [],
        booked: [],
        bandApplicants: [],
      };

    const groups = {
      interested: [] as UserWithTrust[],
      applied: [] as UserWithTrust[],
      shortlisted: [] as UserWithTrust[],
      booked: [] as UserWithTrust[],
      bandApplicants: [] as UserWithTrust[],
    };

    gig.interestedUsers?.forEach((id) => {
      const user = userMap.get(id as Id<"users">);
      if (user) groups.interested.push(user);
    });

    gig.appliedUsers?.forEach((id) => {
      const user = userMap.get(id as Id<"users">);
      if (user) groups.applied.push(user);
    });

    gig.shortlistedUsers?.forEach((item) => {
      const user = userMap.get(item.userId as Id<"users">);
      if (user) groups.shortlisted.push(user);
    });

    if (gig.bookedBy) {
      const user = userMap.get(gig.bookedBy as Id<"users">);
      if (user) groups.booked.push(user);
    }

    gig.bandCategory?.forEach((role) => {
      role.applicants?.forEach((id) => {
        const user = userMap.get(id as Id<"users">);
        if (user) groups.bandApplicants.push(user);
      });
    });

    // Filter out current user
    Object.keys(groups).forEach((key) => {
      groups[key as keyof typeof groups] = groups[
        key as keyof typeof groups
      ].filter((user) => user._id !== currentUser?._id);
    });

    return groups;
  }, [gig, userMap, currentUser]);

  // Filtered applicants based on search
  const filterUsers = (users: UserWithTrust[]) => {
    if (!searchQuery) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.firstname?.toLowerCase().includes(query) ||
        user.username?.toLowerCase().includes(query) ||
        user.roleType?.toLowerCase().includes(query) ||
        user.city?.toLowerCase().includes(query),
    );
  };

  // Loading state
  if (!gig || !users) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-32" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 rounded-xl lg:col-span-1" />
            <Skeleton className="h-96 rounded-xl lg:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen",
        isDarkMode
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
          : "bg-gradient-to-br from-slate-50 via-white to-slate-50",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "sticky top-0 z-40 border-b backdrop-blur-md",
          isDarkMode
            ? "bg-slate-900/80 border-slate-800"
            : "bg-white/80 border-slate-200",
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className={cn(
                  "gap-2",
                  isDarkMode
                    ? "text-slate-300 hover:text-white hover:bg-slate-800"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-100",
                )}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1
                  className={cn(
                    "text-2xl font-semibold tracking-tight",
                    isDarkMode ? "text-white" : "text-slate-900",
                  )}
                >
                  {gig.title}
                </h1>
                <p
                  className={cn(
                    "text-sm",
                    isDarkMode ? "text-slate-400" : "text-slate-500",
                  )}
                >
                  Viewing all applicants and gig details
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {getMyStatusBadge()}

              {userApplication &&
                userApplication.type !== "poster" &&
                userApplication.type !== "booked" && (
                  <Button
                    variant="outline"
                    onClick={() => setShowWithdrawDialog(true)}
                    className={cn(
                      "gap-2",
                      isDarkMode
                        ? "border-rose-800 text-rose-400 hover:bg-rose-950/30"
                        : "border-rose-200 text-rose-600 hover:bg-rose-50",
                    )}
                  >
                    <XCircle className="w-4 h-4" />
                    Withdraw
                  </Button>
                )}

              {userApplication?.type === "poster" && (
                <Button
                  variant="outline"
                  onClick={() => router.push(`/hub/gigs/edit/${gig._id}`)}
                  className={cn(
                    "gap-2",
                    isDarkMode
                      ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                      : "border-slate-200 text-slate-700 hover:bg-slate-100",
                  )}
                >
                  <Eye className="w-4 h-4" />
                  Manage
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN - All Musicians/Applicants */}
          <div className="lg:col-span-1 space-y-6">
            <Card
              className={cn(
                "border shadow-sm",
                isDarkMode
                  ? "bg-slate-900/50 border-slate-800"
                  : "bg-white border-slate-200",
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className={cn(
                      "font-semibold",
                      isDarkMode ? "text-white" : "text-slate-900",
                    )}
                  >
                    All Applicants
                  </h3>
                  <Badge
                    variant="outline"
                    className={cn(
                      isDarkMode
                        ? "border-slate-700 text-slate-300"
                        : "border-slate-200 text-slate-600",
                    )}
                  >
                    {userIds.length - 1} total
                  </Badge>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <Search
                    className={cn(
                      "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4",
                      isDarkMode ? "text-slate-500" : "text-slate-400",
                    )}
                  />
                  <Input
                    placeholder="Search applicants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      "pl-9",
                      isDarkMode
                        ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                        : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400",
                    )}
                  />
                </div>

                {/* Tabs for different applicant types */}
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-5 mb-4">
                    <TabsTrigger value="all" className="text-xs">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="interested" className="text-xs">
                      Interested
                    </TabsTrigger>
                    <TabsTrigger value="applied" className="text-xs">
                      Applied
                    </TabsTrigger>
                    <TabsTrigger value="shortlisted" className="text-xs">
                      Shortlisted
                    </TabsTrigger>
                    <TabsTrigger value="booked" className="text-xs">
                      Booked
                    </TabsTrigger>
                  </TabsList>

                  <ScrollArea className="h-[500px] pr-4">
                    {/* All Tab */}
                    <TabsContent value="all" className="space-y-3 mt-0">
                      {Object.entries(groupedApplicants).map(
                        ([category, users]) => {
                          const filtered = filterUsers(users);
                          if (filtered.length === 0) return null;

                          return (
                            <div key={category} className="space-y-2">
                              <h4
                                className={cn(
                                  "text-xs font-medium uppercase tracking-wider sticky top-0 py-1",
                                  isDarkMode
                                    ? "text-slate-400"
                                    : "text-slate-500",
                                )}
                              >
                                {category === "interested" && "Interested"}
                                {category === "applied" && "Applied"}
                                {category === "shortlisted" && "Shortlisted"}
                                {category === "booked" && "Booked"}
                                {category === "bandApplicants" &&
                                  "Band Applicants"}
                                <span className="ml-2 text-xs font-normal">
                                  ({filtered.length})
                                </span>
                              </h4>
                              {filtered.map((user) => {
                                const statusBadge = getUserStatusBadge(
                                  user._id,
                                );
                                return (
                                  <div
                                    key={user._id}
                                    className={cn(
                                      "flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer group",
                                      isDarkMode
                                        ? "bg-slate-800/50 hover:bg-slate-800"
                                        : "bg-slate-50 hover:bg-slate-100",
                                    )}
                                    onClick={() => handleViewProfile(user._id)}
                                  >
                                    <Avatar className="w-10 h-10">
                                      <AvatarImage src={user.picture} />
                                      <AvatarFallback
                                        className={cn(
                                          isDarkMode
                                            ? "bg-slate-700 text-slate-300"
                                            : "bg-slate-200 text-slate-600",
                                        )}
                                      >
                                        {user.firstname?.charAt(0) || "U"}
                                      </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <p
                                          className={cn(
                                            "font-medium text-sm truncate",
                                            isDarkMode
                                              ? "text-white"
                                              : "text-slate-900",
                                          )}
                                        >
                                          {user.firstname || user.username}
                                        </p>
                                        <TrustStarsDisplay
                                          trustStars={user.trustStars || 0}
                                          size="sm"
                                        />
                                      </div>

                                      <div className="flex items-center gap-2 mt-1">
                                        {statusBadge && (
                                          <span
                                            className={statusBadge.className}
                                          >
                                            {statusBadge.icon}
                                            {statusBadge.label}
                                          </span>
                                        )}
                                        {user.roleType && (
                                          <span
                                            className={cn(
                                              "text-xs",
                                              isDarkMode
                                                ? "text-slate-500"
                                                : "text-slate-400",
                                            )}
                                          >
                                            • {user.roleType}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleViewProfile(user._id);
                                        }}
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                      {canMessageUser(user._id) && (
                                        <ChatIcon
                                          userId={user._id}
                                          size="sm"
                                          variant="ghost"
                                          className="h-8 w-8"
                                        />
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        },
                      )}

                      {Object.values(groupedApplicants).every(
                        (arr) => arr.length === 0,
                      ) && (
                        <div className="text-center py-8">
                          <Users
                            className={cn(
                              "w-12 h-12 mx-auto mb-3",
                              isDarkMode ? "text-slate-700" : "text-slate-300",
                            )}
                          />
                          <p
                            className={cn(
                              "text-sm",
                              isDarkMode ? "text-slate-400" : "text-slate-500",
                            )}
                          >
                            No applicants yet
                          </p>
                        </div>
                      )}
                    </TabsContent>

                    {/* Individual Tabs */}
                    {["interested", "applied", "shortlisted", "booked"].map(
                      (tab) => (
                        <TabsContent
                          key={tab}
                          value={tab}
                          className="space-y-3 mt-0"
                        >
                          {filterUsers(
                            groupedApplicants[
                              tab as keyof typeof groupedApplicants
                            ],
                          ).length > 0 ? (
                            filterUsers(
                              groupedApplicants[
                                tab as keyof typeof groupedApplicants
                              ],
                            ).map((user) => {
                              const statusBadge = getUserStatusBadge(user._id);
                              return (
                                <div
                                  key={user._id}
                                  className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer group",
                                    isDarkMode
                                      ? "bg-slate-800/50 hover:bg-slate-800"
                                      : "bg-slate-50 hover:bg-slate-100",
                                  )}
                                  onClick={() => handleViewProfile(user._id)}
                                >
                                  <Avatar className="w-10 h-10">
                                    <AvatarImage src={user.picture} />
                                    <AvatarFallback
                                      className={cn(
                                        isDarkMode
                                          ? "bg-slate-700 text-slate-300"
                                          : "bg-slate-200 text-slate-600",
                                      )}
                                    >
                                      {user.firstname?.charAt(0) || "U"}
                                    </AvatarFallback>
                                  </Avatar>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p
                                        className={cn(
                                          "font-medium text-sm truncate",
                                          isDarkMode
                                            ? "text-white"
                                            : "text-slate-900",
                                        )}
                                      >
                                        {user.firstname || user.username}
                                      </p>
                                      <TrustStarsDisplay
                                        trustStars={user.trustStars || 0}
                                        size="sm"
                                      />
                                    </div>

                                    <div className="flex items-center gap-2 mt-1">
                                      {statusBadge && (
                                        <span className={statusBadge.className}>
                                          {statusBadge.icon}
                                          {statusBadge.label}
                                        </span>
                                      )}
                                      {user.city && (
                                        <span
                                          className={cn(
                                            "text-xs",
                                            isDarkMode
                                              ? "text-slate-500"
                                              : "text-slate-400",
                                          )}
                                        >
                                          • {user.city}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewProfile(user._id);
                                      }}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    {canMessageUser(user._id) && (
                                      <ChatIcon
                                        userId={user._id}
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8"
                                      />
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-center py-8">
                              <Users
                                className={cn(
                                  "w-12 h-12 mx-auto mb-3",
                                  isDarkMode
                                    ? "text-slate-700"
                                    : "text-slate-300",
                                )}
                              />
                              <p
                                className={cn(
                                  "text-sm",
                                  isDarkMode
                                    ? "text-slate-400"
                                    : "text-slate-500",
                                )}
                              >
                                No {tab} applicants
                              </p>
                            </div>
                          )}
                        </TabsContent>
                      ),
                    )}
                  </ScrollArea>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN - Gig Details & Poster */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gig Card */}
            <Card
              className={cn(
                "border shadow-sm overflow-hidden",
                isDarkMode
                  ? "bg-slate-900/50 border-slate-800"
                  : "bg-white border-slate-200",
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16 rounded-lg border-2 border-slate-200 dark:border-slate-700">
                    <AvatarImage src={gig.logo} />
                    <AvatarFallback
                      className={cn(
                        "bg-gradient-to-br from-slate-700 to-slate-800 text-white text-xl",
                        isDarkMode
                          ? "from-slate-700 to-slate-800"
                          : "from-slate-200 to-slate-300",
                      )}
                    >
                      {gig.title?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h2
                      className={cn(
                        "text-2xl font-semibold tracking-tight mb-2",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      {gig.title}
                    </h2>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div
                        className={cn(
                          "flex items-center gap-1",
                          isDarkMode ? "text-slate-400" : "text-slate-500",
                        )}
                      >
                        <MapPin className="w-4 h-4" />
                        {gig.location || "Remote"}
                      </div>
                      <div
                        className={cn(
                          "flex items-center gap-1",
                          isDarkMode ? "text-slate-400" : "text-slate-500",
                        )}
                      >
                        <Calendar className="w-4 h-4" />
                        {formatDate(gig.date)}
                      </div>
                      {gig.time?.start && (
                        <div
                          className={cn(
                            "flex items-center gap-1",
                            isDarkMode ? "text-slate-400" : "text-slate-500",
                          )}
                        >
                          <Clock className="w-4 h-4" />
                          {formatTime(gig.time.start)} -{" "}
                          {formatTime(gig.time.end)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={cn(
                        "text-2xl font-semibold",
                        isDarkMode ? "text-emerald-400" : "text-emerald-600",
                      )}
                    >
                      {formatCurrency(gig.price, gig.currency)}
                    </div>
                    {gig.negotiable && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "mt-1",
                          isDarkMode
                            ? "border-slate-700 text-slate-300"
                            : "border-slate-200 text-slate-600",
                        )}
                      >
                        Negotiable
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <p
                    className={cn(
                      "text-sm leading-relaxed whitespace-pre-line",
                      isDarkMode ? "text-slate-300" : "text-slate-600",
                    )}
                  >
                    {gig.description}
                  </p>
                </div>

                {gig.tags && gig.tags.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {gig.tags.map((tag, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className={cn(
                          isDarkMode
                            ? "bg-slate-800 text-slate-300 border-slate-700"
                            : "bg-slate-100 text-slate-600 border-slate-200",
                        )}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Poster Card */}
            {poster && (
              <Card
                className={cn(
                  "border shadow-sm",
                  isDarkMode
                    ? "bg-slate-900/50 border-slate-800"
                    : "bg-white border-slate-200",
                )}
              >
                <CardContent className="p-6">
                  <h3
                    className={cn(
                      "font-semibold mb-4",
                      isDarkMode ? "text-white" : "text-slate-900",
                    )}
                  >
                    Gig Owner
                  </h3>

                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-2 border-slate-200 dark:border-slate-700">
                      <AvatarImage src={poster.picture} />
                      <AvatarFallback
                        className={cn(
                          "bg-gradient-to-br from-slate-700 to-slate-800 text-white",
                          isDarkMode
                            ? "from-slate-700 to-slate-800"
                            : "from-slate-200 to-slate-300",
                        )}
                      >
                        {poster.firstname?.charAt(0) ||
                          poster.username?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4
                          className={cn(
                            "font-semibold",
                            isDarkMode ? "text-white" : "text-slate-900",
                          )}
                        >
                          {poster.firstname || poster.username}
                        </h4>
                        {canMessageUser(poster._id) && (
                          <ChatIcon
                            userId={poster._id}
                            size="sm"
                            variant="ghost"
                            showPulse
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <TrustStarsDisplay
                          trustStars={poster.trustStars || 0}
                          size="sm"
                        />
                        {poster.verifiedIdentity && (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        )}
                        {getTrustTierIcon(poster.trustTier)}
                      </div>
                      <div className="mt-2 text-sm">
                        {poster.city && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <MapPin className="w-3 h-3" />
                            {poster.city}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div
                        className={cn(
                          "text-lg font-semibold",
                          isDarkMode ? "text-white" : "text-slate-900",
                        )}
                      >
                        {poster.completedGigsCount || 0}
                      </div>
                      <div
                        className={
                          isDarkMode ? "text-slate-400" : "text-slate-500"
                        }
                      >
                        Gigs
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className={cn(
                          "text-lg font-semibold",
                          isDarkMode ? "text-white" : "text-slate-900",
                        )}
                      >
                        {poster.followers?.length || 0}
                      </div>
                      <div
                        className={
                          isDarkMode ? "text-slate-400" : "text-slate-500"
                        }
                      >
                        Followers
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className={cn(
                          "text-lg font-semibold",
                          isDarkMode ? "text-white" : "text-slate-900",
                        )}
                      >
                        {new Date().getFullYear() -
                          new Date(poster._creationTime).getFullYear()}
                      </div>
                      <div
                        className={
                          isDarkMode ? "text-slate-400" : "text-slate-500"
                        }
                      >
                        Years
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-4"
                    variant="outline"
                    onClick={() => handleViewProfile(poster._id)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Full Profile
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {gig.requirements && gig.requirements.length > 0 && (
              <Card
                className={cn(
                  "border shadow-sm",
                  isDarkMode
                    ? "bg-slate-900/50 border-slate-800"
                    : "bg-white border-slate-200",
                )}
              >
                <CardContent className="p-6">
                  <h3
                    className={cn(
                      "font-semibold mb-4 flex items-center gap-2",
                      isDarkMode ? "text-white" : "text-slate-900",
                    )}
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    Requirements
                  </h3>
                  <ul className="space-y-2">
                    {gig.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                        <span
                          className={
                            isDarkMode ? "text-slate-300" : "text-slate-600"
                          }
                        >
                          {req}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Band Roles */}
            {gig.bandCategory && gig.bandCategory.length > 0 && (
              <Card
                className={cn(
                  "border shadow-sm",
                  isDarkMode
                    ? "bg-slate-900/50 border-slate-800"
                    : "bg-white border-slate-200",
                )}
              >
                <CardContent className="p-6">
                  <h3
                    className={cn(
                      "font-semibold mb-4 flex items-center gap-2",
                      isDarkMode ? "text-white" : "text-slate-900",
                    )}
                  >
                    <Users className="w-5 h-5 text-violet-500" />
                    Available Roles
                  </h3>

                  <div className="space-y-4">
                    {gig.bandCategory.map((role, index) => {
                      const applicantCount = role.applicants?.length || 0;
                      const isUserApplied = role.applicants?.includes(
                        currentUser?._id as Id<"users">,
                      );

                      return (
                        <div
                          key={index}
                          className={cn(
                            "border rounded-lg p-4",
                            isDarkMode
                              ? "border-slate-800"
                              : "border-slate-200",
                          )}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4
                                className={cn(
                                  "font-medium",
                                  isDarkMode ? "text-white" : "text-slate-900",
                                )}
                              >
                                {role.role}
                              </h4>
                              {role.description && (
                                <p
                                  className={cn(
                                    "text-sm mt-1",
                                    isDarkMode
                                      ? "text-slate-400"
                                      : "text-slate-500",
                                  )}
                                >
                                  {role.description}
                                </p>
                              )}
                            </div>
                            <Badge
                              variant="outline"
                              className={cn(
                                isDarkMode
                                  ? "border-slate-700 text-slate-300"
                                  : "border-slate-200 text-slate-600",
                              )}
                            >
                              {applicantCount} applicant
                              {applicantCount !== 1 ? "s" : ""}
                            </Badge>
                          </div>

                          {role.requiredSkills &&
                            role.requiredSkills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {role.requiredSkills.map((skill, i) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className={cn(
                                      "text-xs",
                                      isDarkMode
                                        ? "bg-slate-800 text-slate-300 border-slate-700"
                                        : "bg-slate-100 text-slate-600 border-slate-200",
                                    )}
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            )}

                          {isUserApplied && (
                            <Badge className="mt-3 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                              You've applied for this role
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent
          className={cn(
            "sm:max-w-md",
            isDarkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200",
          )}
        >
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle
                  className={isDarkMode ? "text-white" : "text-slate-900"}
                >
                  User Profile
                </DialogTitle>
                <DialogDescription
                  className={isDarkMode ? "text-slate-400" : "text-slate-500"}
                >
                  {selectedUser.firstname || selectedUser.username}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20 border-2 border-slate-200 dark:border-slate-700">
                    <AvatarImage src={selectedUser.picture} />
                    <AvatarFallback
                      className={cn(
                        "bg-gradient-to-br from-slate-700 to-slate-800 text-white text-2xl",
                        isDarkMode
                          ? "from-slate-700 to-slate-800"
                          : "from-slate-200 to-slate-300",
                      )}
                    >
                      {selectedUser.firstname?.charAt(0) ||
                        selectedUser.username?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h3
                      className={cn(
                        "font-semibold text-xl",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      {selectedUser.firstname || selectedUser.username}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <TrustStarsDisplay
                        trustStars={selectedUser.trustStars || 0}
                        size="sm"
                      />
                      {selectedUser.verifiedIdentity && (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      )}
                      {getTrustTierIcon(selectedUser.trustTier)}
                    </div>
                  </div>
                </div>

                <Separator
                  className={isDarkMode ? "bg-slate-800" : "bg-slate-200"}
                />

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div
                      className={cn(
                        "text-lg font-semibold",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      {selectedUser.completedGigsCount || 0}
                    </div>
                    <div
                      className={
                        isDarkMode ? "text-slate-400" : "text-slate-500"
                      }
                    >
                      Gigs
                    </div>
                  </div>
                  <div>
                    <div
                      className={cn(
                        "text-lg font-semibold",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      {selectedUser.followers?.length || 0}
                    </div>
                    <div
                      className={
                        isDarkMode ? "text-slate-400" : "text-slate-500"
                      }
                    >
                      Followers
                    </div>
                  </div>
                  <div>
                    <div
                      className={cn(
                        "text-lg font-semibold",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      {selectedUser.avgRating?.toFixed(1) || "0.0"}
                    </div>
                    <div
                      className={
                        isDarkMode ? "text-slate-400" : "text-slate-500"
                      }
                    >
                      Rating
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {selectedUser.roleType && (
                    <div
                      className={cn(
                        "flex items-center gap-2 text-sm",
                        isDarkMode ? "text-slate-300" : "text-slate-600",
                      )}
                    >
                      {getRoleIcon(selectedUser.roleType)}
                      <span className="capitalize">
                        {selectedUser.roleType}
                      </span>
                    </div>
                  )}
                  {selectedUser.city && (
                    <div
                      className={cn(
                        "flex items-center gap-2 text-sm",
                        isDarkMode ? "text-slate-300" : "text-slate-600",
                      )}
                    >
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{selectedUser.city}</span>
                    </div>
                  )}
                  {selectedUser.instrument && (
                    <div
                      className={cn(
                        "flex items-center gap-2 text-sm",
                        isDarkMode ? "text-slate-300" : "text-slate-600",
                      )}
                    >
                      <Music className="w-4 h-4 text-slate-400" />
                      <span>{selectedUser.instrument}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setShowProfileDialog(false);
                      router.push(`/profile/${selectedUser._id}`);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Full Profile
                  </Button>
                  {canMessageUser(selectedUser._id) && (
                    <ChatIcon
                      userId={selectedUser._id}
                      size="md"
                      variant="default"
                      className="flex-1"
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent
          className={cn(
            isDarkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200",
          )}
        >
          <DialogHeader>
            <DialogTitle
              className={isDarkMode ? "text-white" : "text-slate-900"}
            >
              Withdraw Application
            </DialogTitle>
            <DialogDescription
              className={isDarkMode ? "text-slate-400" : "text-slate-500"}
            >
              Are you sure you want to withdraw your application? You can always
              reapply later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Reason (optional)"
              value={withdrawReason}
              onChange={(e) => setWithdrawReason(e.target.value)}
              rows={3}
              className={cn(
                isDarkMode
                  ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400",
              )}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowWithdrawDialog(false)}
              className={
                isDarkMode
                  ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                  : ""
              }
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleWithdraw}
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Withdraw
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
