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
        gradient: "from-indigo-600 via-purple-600 to-pink-600",
        icon: Crown,
        label: "Gig Owner",
      },
      interested: {
        gradient: "from-sky-600 via-blue-600 to-indigo-600",
        icon: Heart,
        label: "Interested",
      },
      applied: {
        gradient: "from-amber-600 via-orange-600 to-red-600",
        icon: Briefcase,
        label: "Applied",
      },
      shortlisted: {
        gradient: "from-emerald-600 via-teal-600 to-cyan-600",
        icon: Star,
        label: "Shortlisted ✨",
      },
      booked: {
        gradient: "from-emerald-600 via-teal-600 to-cyan-600",
        icon: CheckCircle,
        label: "Booked ✓",
      },
    };

    const badge = badges[userApplication.type as keyof typeof badges];
    if (!badge) return null;

    const Icon = badge.icon;

    return (
      <div className="relative group">
        {/* Animated gradient background */}
        <div
          className={cn(
            "absolute -inset-0.5 rounded-full opacity-75 group-hover:opacity-100",
            "bg-gradient-to-r blur transition duration-500 group-hover:duration-200",
            badge.gradient,
          )}
        />

        {/* Badge content */}
        <Badge
          className={cn(
            "relative px-4 py-2 rounded-full border-0",
            "bg-slate-900 dark:bg-slate-950",
            "text-white",
            "flex items-center gap-2",
            "shadow-xl",
          )}
        >
          <Icon className="w-4 h-4" />
          <span className="text-sm font-medium">
            {badge.label}
            {userApplication.role && ` • ${userApplication.role}`}
          </span>
        </Badge>
      </div>
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
          "sticky top-0 z-40 border-b",
          isDarkMode
            ? "bg-slate-950/95 border-slate-800/80"
            : "bg-white/95 border-slate-200/80",
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 md:py-4">
            {/* Left Section */}
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className={cn(
                  "group flex items-center gap-1.5 px-2 -ml-2",
                  isDarkMode
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                <span className="text-sm font-medium hidden sm:inline">
                  Back
                </span>
              </Button>

              <div className="flex flex-col">
                <div className="flex items-center flex-wrap gap-2">
                  <h1
                    className={cn(
                      "text-lg md:text-xl font-semibold tracking-tight truncate max-w-[200px] md:max-w-sm",
                      isDarkMode ? "text-white" : "text-slate-900",
                    )}
                  >
                    {gig.title}
                  </h1>

                  {/* Status Badge */}
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-normal",
                      gig.isActive
                        ? isDarkMode
                          ? "border-emerald-800 text-emerald-400"
                          : "border-emerald-200 text-emerald-600"
                        : isDarkMode
                          ? "border-slate-700 text-slate-400"
                          : "border-slate-200 text-slate-500",
                    )}
                  >
                    <span className="relative flex h-1.5 w-1.5 mr-1.5">
                      {gig.isActive && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      )}
                      <span
                        className={cn(
                          "relative inline-flex rounded-full h-1.5 w-1.5",
                          gig.isActive ? "bg-emerald-500" : "bg-slate-400",
                        )}
                      />
                    </span>
                    {gig.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{userIds?.length - 1 || 0} applicants</span>
                  <span>•</span>
                  <span>Posted {formatRelativeTime(gig._creationTime)}</span>
                </div>
              </div>
            </div>

            {/* Right Section - Action Buttons */}
            <div className="flex items-center gap-2">
              {/* My Status Badge */}
              <div className="hidden md:block">
                {getMyStatusBadge && getMyStatusBadge()}
              </div>

              {/* Withdraw Button */}
              {userApplication &&
                userApplication.type !== "poster" &&
                userApplication.type !== "booked" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowWithdrawDialog(true)}
                    className={cn(
                      "hidden sm:inline-flex items-center gap-2",
                      isDarkMode
                        ? "border-rose-800/50 text-rose-400 hover:bg-rose-950/50"
                        : "border-rose-200 text-rose-600 hover:bg-rose-50",
                    )}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Withdraw</span>
                  </Button>
                )}

              {/* Manage Button */}
              {userApplication?.type === "poster" && (
                <Button
                  size="sm"
                  onClick={() => router.push(`/hub/gigs/edit/${gig._id}`)}
                  className={cn(
                    "hidden sm:inline-flex items-center gap-2",
                    isDarkMode
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white",
                  )}
                >
                  <Eye className="w-4 h-4" />
                  <span>Manage</span>
                </Button>
              )}

              {/* Mobile Action Menu */}
              <div className="sm:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "rounded-full",
                    isDarkMode
                      ? "text-slate-400 hover:text-white hover:bg-slate-800"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                  )}
                >
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </div>

              {/* Share Button */}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-full hidden md:inline-flex",
                  isDarkMode
                    ? "text-slate-400 hover:text-white hover:bg-slate-800"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                )}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Applicant Stats Bar */}
          <div className="flex items-center gap-4 py-2 overflow-x-auto scrollbar-hide">
            {/* Interested */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span
                  className={isDarkMode ? "text-slate-300" : "text-slate-700"}
                >
                  {groupedApplicants?.interested?.length || 0}
                </span>
              </div>
              <span
                className={isDarkMode ? "text-slate-500" : "text-slate-400"}
              >
                Interested
              </span>
            </div>

            {/* Applied */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                <span
                  className={isDarkMode ? "text-slate-300" : "text-slate-700"}
                >
                  {groupedApplicants?.applied?.length || 0}
                </span>
              </div>
              <span
                className={isDarkMode ? "text-slate-500" : "text-slate-400"}
              >
                Applied
              </span>
            </div>

            {/* Shortlisted */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-emerald-500" />
                <span
                  className={isDarkMode ? "text-slate-300" : "text-slate-700"}
                >
                  {groupedApplicants?.shortlisted?.length || 0}
                </span>
              </div>
              <span
                className={isDarkMode ? "text-slate-500" : "text-slate-400"}
              >
                Shortlisted
              </span>
            </div>

            {/* Booked */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-purple-500" />
                <span
                  className={isDarkMode ? "text-slate-300" : "text-slate-700"}
                >
                  {groupedApplicants?.booked?.length || 0}
                </span>
              </div>
              <span
                className={isDarkMode ? "text-slate-500" : "text-slate-400"}
              >
                Booked
              </span>
            </div>

            {/* Total */}
            <div className="flex items-center gap-2 text-xs ml-auto">
              <span
                className={isDarkMode ? "text-slate-400" : "text-slate-500"}
              >
                Total
              </span>
              <Badge
                variant="secondary"
                className={cn(
                  "px-2 py-0.5 text-xs",
                  isDarkMode
                    ? "bg-slate-800 text-slate-300"
                    : "bg-slate-100 text-slate-600",
                )}
              >
                {userIds?.length - 1 || 0}
              </Badge>
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className={cn(
                  "border shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300",
                  isDarkMode
                    ? "bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700"
                    : "bg-gradient-to-br from-white to-slate-50 border-slate-200",
                )}
              >
                {/* Gradient Accent Bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />

                <CardContent className="p-6 md:p-8">
                  {/* Header Section */}
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Logo/Avatar */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <Avatar className="w-20 h-20 md:w-24 md:h-24 rounded-xl border-4 border-white dark:border-slate-700 shadow-lg">
                          <AvatarImage src={gig.logo} />
                          <AvatarFallback
                            className={cn(
                              "bg-gradient-to-br from-emerald-600 to-teal-600 text-white text-2xl font-bold",
                            )}
                          >
                            {gig.title?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        {/* Live Badge (if gig is active) */}
                        {gig.isActive && (
                          <div className="absolute -top-2 -right-2">
                            <span className="flex h-5 w-5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500 border-2 border-white"></span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Title & Meta */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                          <h2
                            className={cn(
                              "text-2xl md:text-3xl font-bold tracking-tight mb-2",
                              isDarkMode ? "text-white" : "text-slate-900",
                            )}
                          >
                            {gig.title}
                          </h2>

                          <div className="flex flex-wrap gap-3">
                            {/* Location */}
                            <div
                              className={cn(
                                "flex items-center gap-1.5 text-sm px-3 py-1 rounded-full",
                                isDarkMode
                                  ? "bg-slate-800 text-slate-300"
                                  : "bg-slate-100 text-slate-600",
                              )}
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              {gig.location || "Remote"}
                            </div>

                            {/* Date */}
                            <div
                              className={cn(
                                "flex items-center gap-1.5 text-sm px-3 py-1 rounded-full",
                                isDarkMode
                                  ? "bg-slate-800 text-slate-300"
                                  : "bg-slate-100 text-slate-600",
                              )}
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(gig.date)}
                            </div>

                            {/* Time */}
                            {gig.time?.start && (
                              <div
                                className={cn(
                                  "flex items-center gap-1.5 text-sm px-3 py-1 rounded-full",
                                  isDarkMode
                                    ? "bg-slate-800 text-slate-300"
                                    : "bg-slate-100 text-slate-600",
                                )}
                              >
                                <Clock className="w-3.5 h-3.5" />
                                {gig.time.start}
                                {gig.time.durationFrom} - {gig.time.end}
                                {gig.time.durationTo}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Price Section */}
                        <div className="flex flex-col items-end">
                          <div className="flex items-baseline gap-1">
                            <span
                              className={cn(
                                "text-sm font-medium",
                                isDarkMode
                                  ? "text-slate-400"
                                  : "text-slate-500",
                              )}
                            >
                              {gig.currency || "$"}
                            </span>
                            <span
                              className={cn(
                                "text-3xl md:text-4xl font-bold",
                                isDarkMode
                                  ? "text-emerald-400"
                                  : "text-emerald-600",
                              )}
                            >
                              {gig.price?.toLocaleString()}
                            </span>
                          </div>

                          {gig.negotiable && (
                            <Badge
                              variant="outline"
                              className={cn(
                                "mt-1 border-emerald-500 text-emerald-600 dark:text-emerald-400",
                              )}
                            >
                              Negotiable
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-8">
                    <h3
                      className={cn(
                        "text-sm font-semibold uppercase tracking-wider mb-3",
                        isDarkMode ? "text-slate-400" : "text-slate-500",
                      )}
                    >
                      Description
                    </h3>
                    <div
                      className={cn(
                        "prose prose-sm max-w-none",
                        isDarkMode ? "prose-invert" : "",
                      )}
                    >
                      <p
                        className={cn(
                          "text-base leading-relaxed whitespace-pre-line",
                          isDarkMode ? "text-slate-300" : "text-slate-600",
                        )}
                      >
                        {gig.description}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  {gig.tags && gig.tags.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex flex-wrap gap-2">
                        {gig.tags.map((tag, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className={cn(
                              "px-3 py-1 text-sm font-medium",
                              isDarkMode
                                ? "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200",
                            )}
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Poster Card */}
            {poster && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card
                  className={cn(
                    "border shadow-lg overflow-hidden",
                    isDarkMode
                      ? "bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700"
                      : "bg-gradient-to-br from-white to-slate-50 border-slate-200",
                  )}
                >
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3
                        className={cn(
                          "text-lg font-semibold flex items-center gap-2",
                          isDarkMode ? "text-white" : "text-slate-900",
                        )}
                      >
                        <Users2 className="w-5 h-5 text-emerald-500" />
                        Gig Owner
                      </h3>

                      {poster.verifiedIdentity && (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Avatar Section */}
                      <div className="flex-shrink-0 text-center md:text-left">
                        <Avatar className="w-20 h-20 md:w-24 md:h-24 mx-auto md:mx-0 border-4 border-white dark:border-slate-700 shadow-lg">
                          <AvatarImage src={poster.picture} />
                          <AvatarFallback
                            className={cn(
                              "bg-gradient-to-br from-emerald-600 to-teal-600 text-white text-xl font-bold",
                            )}
                          >
                            {poster.firstname?.charAt(0) ||
                              poster.username?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        {/* Trust Badge */}
                        <div className="mt-2">
                          <TrustStarsDisplay
                            trustStars={poster.trustStars || 0}
                            size="sm"
                          />
                        </div>
                      </div>

                      {/* Info Section */}
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h4
                              className={cn(
                                "text-xl font-semibold",
                                isDarkMode ? "text-white" : "text-slate-900",
                              )}
                            >
                              {poster.firstname || poster.username}
                            </h4>

                            {poster.city && (
                              <div className="flex items-center gap-1 mt-1 text-sm text-slate-500">
                                <MapPin className="w-3.5 h-3.5" />
                                {poster.city}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {canMessageUser(poster._id) && (
                              <ChatIcon
                                userId={poster._id}
                                size="md"
                                variant="default"
                                showPulse
                              />
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewProfile(poster._id)}
                              className="gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View Profile
                            </Button>
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="mt-6 grid grid-cols-3 gap-4">
                          <div
                            className={cn(
                              "text-center p-3 rounded-lg",
                              isDarkMode ? "bg-slate-800" : "bg-slate-50",
                            )}
                          >
                            <div
                              className={cn(
                                "text-xl font-bold",
                                isDarkMode ? "text-white" : "text-slate-900",
                              )}
                            >
                              {poster.completedGigsCount || 0}
                            </div>
                            <div
                              className={cn(
                                "text-xs",
                                isDarkMode
                                  ? "text-slate-400"
                                  : "text-slate-500",
                              )}
                            >
                              Gigs Completed
                            </div>
                          </div>

                          <div
                            className={cn(
                              "text-center p-3 rounded-lg",
                              isDarkMode ? "bg-slate-800" : "bg-slate-50",
                            )}
                          >
                            <div
                              className={cn(
                                "text-xl font-bold",
                                isDarkMode ? "text-white" : "text-slate-900",
                              )}
                            >
                              {poster.followers?.length || 0}
                            </div>
                            <div
                              className={cn(
                                "text-xs",
                                isDarkMode
                                  ? "text-slate-400"
                                  : "text-slate-500",
                              )}
                            >
                              Followers
                            </div>
                          </div>

                          <div
                            className={cn(
                              "text-center p-3 rounded-lg",
                              isDarkMode ? "bg-slate-800" : "bg-slate-50",
                            )}
                          >
                            <div
                              className={cn(
                                "text-xl font-bold",
                                isDarkMode ? "text-white" : "text-slate-900",
                              )}
                            >
                              {new Date().getFullYear() -
                                new Date(poster._creationTime).getFullYear()}
                            </div>
                            <div
                              className={cn(
                                "text-xs",
                                isDarkMode
                                  ? "text-slate-400"
                                  : "text-slate-500",
                              )}
                            >
                              Years Active
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Requirements */}
            {gig.requirements && gig.requirements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card
                  className={cn(
                    "border shadow-lg",
                    isDarkMode
                      ? "bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700"
                      : "bg-gradient-to-br from-white to-slate-50 border-slate-200",
                  )}
                >
                  <CardContent className="p-6 md:p-8">
                    <h3
                      className={cn(
                        "text-lg font-semibold flex items-center gap-2 mb-4",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      Requirements
                    </h3>

                    <div className="space-y-3">
                      {gig.requirements.map((req, i) => (
                        <div key={i} className="flex items-start gap-3 group">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                              {i + 1}
                            </span>
                          </div>
                          <span
                            className={cn(
                              "text-base flex-1",
                              isDarkMode ? "text-slate-300" : "text-slate-600",
                            )}
                          >
                            {req}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Band Roles */}
            {gig.bandCategory && gig.bandCategory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card
                  className={cn(
                    "border shadow-lg",
                    isDarkMode
                      ? "bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700"
                      : "bg-gradient-to-br from-white to-slate-50 border-slate-200",
                  )}
                >
                  <CardContent className="p-6 md:p-8">
                    <h3
                      className={cn(
                        "text-lg font-semibold flex items-center gap-2 mb-6",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                        <Users className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      Available Roles
                    </h3>

                    <div className="grid gap-4">
                      {gig.bandCategory.map((role, index) => {
                        const applicantCount = role.applicants?.length || 0;
                        const isUserApplied = role.applicants?.includes(
                          currentUser?._id as Id<"users">,
                        );

                        return (
                          <div
                            key={index}
                            className={cn(
                              "rounded-xl p-5 transition-all hover:shadow-md",
                              isDarkMode
                                ? "bg-slate-800/50 border border-slate-700 hover:bg-slate-800"
                                : "bg-white border border-slate-200 hover:border-violet-200",
                              isUserApplied && "ring-2 ring-amber-500/50",
                            )}
                          >
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4
                                    className={cn(
                                      "text-lg font-semibold",
                                      isDarkMode
                                        ? "text-white"
                                        : "text-slate-900",
                                    )}
                                  >
                                    {role.role}
                                  </h4>
                                  {isUserApplied && (
                                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                      Applied
                                    </Badge>
                                  )}
                                </div>

                                {role.description && (
                                  <p
                                    className={cn(
                                      "text-sm mb-3",
                                      isDarkMode
                                        ? "text-slate-400"
                                        : "text-slate-500",
                                    )}
                                  >
                                    {role.description}
                                  </p>
                                )}

                                {role.requiredSkills &&
                                  role.requiredSkills.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {role.requiredSkills.map((skill, i) => (
                                        <Badge
                                          key={i}
                                          variant="outline"
                                          className={cn(
                                            "text-xs",
                                            isDarkMode
                                              ? "border-slate-600 text-slate-300"
                                              : "border-slate-300 text-slate-600",
                                          )}
                                        >
                                          {skill}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                              </div>

                              <div className="flex items-center gap-3">
                                <div
                                  className={cn(
                                    "px-3 py-1 rounded-full text-sm font-medium",
                                    isDarkMode
                                      ? "bg-slate-700 text-slate-300"
                                      : "bg-slate-100 text-slate-600",
                                  )}
                                >
                                  {applicantCount}{" "}
                                  {applicantCount === 1
                                    ? "applicant"
                                    : "applicants"}
                                </div>

                                {!isUserApplied && (
                                  <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
                                  >
                                    Apply Now
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
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
