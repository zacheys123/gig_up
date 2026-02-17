// app/hub/gigs/[gigId]/page.tsx
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
} from "lucide-react";

// Trust components
import { TrustStarsDisplay } from "@/components/trust/TrustStarsDisplay";
import { ChatIcon } from "@/components/chat/ChatIcon";
import { Textarea } from "@/components/ui/textarea";

interface PageProps {
  params: Promise<{
    // ✅ params is now a Promise
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
  const [activeTab, setActiveTab] = useState("overview");
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState("");

  // Mutations
  const removeInterestFromGig = useMutation(
    api.controllers.gigs.removeInterestFromGig,
  );

  // Fetch gig data
  const gig = useQuery(api.controllers.gigs.getGigById, {
    gigId: gigId as Id<"gigs">, // ✅ Use unwrapped gigId
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

    switch (role) {
      case "poster":
        return {
          label: "Gig Owner",
          color:
            "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300",
          icon: <Crown className="w-3 h-3 mr-1" />,
        };
      case "booked":
        return {
          label: "Booked",
          color:
            "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300",
          icon: <CheckCircle className="w-3 h-3 mr-1" />,
        };
      case "shortlisted":
        return {
          label: "Shortlisted",
          color:
            "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300",
          icon: <Star className="w-3 h-3 mr-1" />,
        };
      case "interested":
        return {
          label: "Interested",
          color:
            "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
          icon: <Heart className="w-3 h-3 mr-1" />,
        };
      case "applied":
      case "band-applicant":
      case "band-booking":
        return {
          label: "Applied",
          color:
            "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300",
          icon: <Briefcase className="w-3 h-3 mr-1" />,
        };
      case "band-booked":
        return {
          label: "Booked",
          color:
            "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300",
          icon: <CheckCircle className="w-3 h-3 mr-1" />,
        };
      case "band-member":
        return {
          label: "Band Member",
          color:
            "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
          icon: <Users className="w-3 h-3 mr-1" />,
        };
      default:
        return null;
    }
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
      weekday: "long",
      year: "numeric",
      month: "long",
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
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "trusted":
        return <Medal className="w-4 h-4 text-blue-500" />;
      case "verified":
        return <BadgeCheck className="w-4 h-4 text-green-500" />;
      case "basic":
        return <Shield className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  // Get role icon
  const getRoleIcon = (roleType?: string) => {
    switch (roleType?.toLowerCase()) {
      case "vocalist":
        return <Mic className="w-4 h-4 text-pink-500" />;
      case "dj":
        return <Volume2 className="w-4 h-4 text-purple-500" />;
      case "mc":
        return <Mic className="w-4 h-4 text-red-500" />;
      case "instrumentalist":
        return <Music className="w-4 h-4 text-blue-500" />;
      default:
        return <UserRound className="w-4 h-4 text-gray-500" />;
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
      interested: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: Heart,
        label: "Interested",
      },
      applied: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: Briefcase,
        label: "Applied",
      },
      shortlisted: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: Star,
        label: "Shortlisted",
      },
      booked: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        icon: CheckCircle,
        label: "Booked",
      },
      "band-applicant": {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: Briefcase,
        label: "Applied",
      },
      "band-booked": {
        bg: "bg-purple-100",
        text: "text-purple-800",
        icon: CheckCircle,
        label: "Booked",
      },
      "band-booking": {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: Users2,
        label: "Band Applied",
      },
    };

    const badge = badges[userApplication.type as keyof typeof badges];
    if (!badge) return null;

    const Icon = badge.icon;
    return (
      <Badge className={`${badge.bg} ${badge.text} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.label}
        {userApplication.role && ` • ${userApplication.role}`}
      </Badge>
    );
  };

  // Loading state
  if (!gig || !users) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 rounded-xl lg:col-span-2" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Group applicants by type for the competitors tab
  const competitors = useMemo(() => {
    if (!gig || !userMap) return [];

    const allUsers = new Map<
      Id<"users">,
      { user: UserWithTrust; role: string; type: string }
    >();

    // Add interested users
    gig.interestedUsers?.forEach((id) => {
      const user = userMap.get(id as Id<"users">);
      if (user && id !== currentUser?._id) {
        allUsers.set(id as Id<"users">, {
          user,
          role: "interested",
          type: "Interested",
        });
      }
    });

    // Add applied users
    gig.appliedUsers?.forEach((id) => {
      const user = userMap.get(id as Id<"users">);
      if (user && id !== currentUser?._id) {
        allUsers.set(id as Id<"users">, {
          user,
          role: "applied",
          type: "Applied",
        });
      }
    });

    // Add shortlisted users
    gig.shortlistedUsers?.forEach((item) => {
      const user = userMap.get(item.userId as Id<"users">);
      if (user && item.userId !== currentUser?._id) {
        allUsers.set(item.userId as Id<"users">, {
          user,
          role: "shortlisted",
          type: "Shortlisted",
        });
      }
    });

    // Add band applicants
    gig.bandCategory?.forEach((role) => {
      role.applicants?.forEach((id) => {
        const user = userMap.get(id as Id<"users">);
        if (user && id !== currentUser?._id) {
          allUsers.set(id as Id<"users">, {
            user,
            role: "band-applicant",
            type: `Applied for ${role.role}`,
          });
        }
      });
    });

    return Array.from(allUsers.values());
  }, [gig, userMap, currentUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {gig.title}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Posted by {poster?.firstname || poster?.username}
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
                    className="gap-2 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                  >
                    <XCircle className="w-4 h-4" />
                    Withdraw
                  </Button>
                )}

              {userApplication?.type === "poster" && (
                <Button
                  variant="outline"
                  onClick={() => router.push(`/hub/gigs/edit/${gig._id}`)}
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Manage
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Gig Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gig Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16 rounded-lg border-2 border-orange-500">
                    <AvatarImage src={gig.logo} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-xl">
                      {gig.title?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {gig.title}
                    </h2>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4" />
                        {gig.location || "Remote"}
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {formatDate(gig.date)}
                      </div>
                      {gig.time?.start && (
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          {formatTime(gig.time.start)} -{" "}
                          {formatTime(gig.time.end)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(gig.price, gig.currency)}
                    </div>
                    {gig.negotiable && (
                      <Badge variant="outline" className="mt-1">
                        Negotiable
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {gig.description}
                  </p>
                </div>

                {gig.tags && gig.tags.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {gig.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Requirements */}
            {gig.requirements && gig.requirements.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Requirements
                  </h3>
                  <ul className="space-y-2">
                    {gig.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                        <span className="text-gray-700 dark:text-gray-300">
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
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-500" />
                    Available Roles
                  </h3>

                  <div className="space-y-4">
                    {gig.bandCategory.map((role, index) => {
                      const applicantCount = role.applicants?.length || 0;
                      const isUserApplied = role.applicants?.includes(
                        currentUser?._id as Id<"users">,
                      );

                      return (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{role.role}</h4>
                              {role.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {role.description}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline">
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
                                    className="text-xs"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            )}

                          {isUserApplied && (
                            <Badge className="mt-3 bg-yellow-100 text-yellow-800">
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

          {/* Right Column - Poster & Competitors */}
          <div className="space-y-6">
            {/* Poster Card */}
            {poster && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4">Gig Owner</h3>

                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="w-16 h-16 border-2 border-orange-500">
                      <AvatarImage src={poster.picture} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
                        {poster.firstname?.charAt(0) ||
                          poster.username?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-lg">
                          {poster.firstname || poster.username}
                        </h4>
                        <ChatIcon
                          userId={poster._id}
                          size="sm"
                          variant="ghost"
                          showPulse
                        />
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <TrustStarsDisplay
                          trustStars={poster.trustStars || 0}
                          size="sm"
                        />
                        {poster.verifiedIdentity && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {getTrustTierIcon(poster.trustTier)}
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handleViewProfile(poster._id)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Your Competition - Other Applicants */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">Your Competition</h3>
                  <Badge variant="outline">{competitors.length} others</Badge>
                </div>

                {competitors.length > 0 ? (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {competitors.map(({ user, type }) => (
                        <div
                          key={user._id}
                          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                          onClick={() => handleViewProfile(user._id)}
                        >
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={user.picture} />
                            <AvatarFallback>
                              {user.firstname?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">
                                {user.firstname || user.username}
                              </p>
                              <TrustStarsDisplay
                                trustStars={user.trustStars || 0}
                                size="sm"
                              />
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {type}
                              </Badge>
                              {user.roleType && (
                                <Badge variant="outline" className="text-xs">
                                  {user.roleType}
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              <span>
                                ⚡ {user.completedGigsCount || 0} gigs
                              </span>
                              {user.city && (
                                <>
                                  <span>•</span>
                                  <span>{user.city}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
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
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No other applicants yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      You're the first!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Gig Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Applicants</span>
                    <span className="font-bold">
                      {competitors.length + (userApplication ? 1 : 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shortlisted</span>
                    <span className="font-bold">
                      {gig.shortlistedUsers?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Views</span>
                    <span className="font-bold">
                      {gig.viewCount?.length || 0}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Posted</span>
                    <span>{formatRelativeTime(gig._creationTime)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="sm:max-w-md">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>User Profile</DialogTitle>
                <DialogDescription>
                  {selectedUser.firstname || selectedUser.username}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20 border-2 border-orange-500">
                    <AvatarImage src={selectedUser.picture} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-2xl">
                      {selectedUser.firstname?.charAt(0) ||
                        selectedUser.username?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h3 className="font-bold text-xl">
                      {selectedUser.firstname || selectedUser.username}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <TrustStarsDisplay
                        trustStars={selectedUser.trustStars || 0}
                        size="sm"
                      />
                      {selectedUser.verifiedIdentity && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {getTrustTierIcon(selectedUser.trustTier)}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold">
                      {selectedUser.completedGigsCount || 0}
                    </div>
                    <div className="text-xs text-gray-500">Gigs</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">
                      {selectedUser.followers?.length || 0}
                    </div>
                    <div className="text-xs text-gray-500">Followers</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">
                      {selectedUser.avgRating?.toFixed(1) || "0.0"}
                    </div>
                    <div className="text-xs text-gray-500">Rating</div>
                  </div>
                </div>

                <div className="space-y-2">
                  {selectedUser.roleType && (
                    <div className="flex items-center gap-2 text-sm">
                      {getRoleIcon(selectedUser.roleType)}
                      <span className="capitalize">
                        {selectedUser.roleType}
                      </span>
                    </div>
                  )}
                  {selectedUser.city && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{selectedUser.city}</span>
                    </div>
                  )}
                  {selectedUser.instrument && (
                    <div className="flex items-center gap-2 text-sm">
                      <Music className="w-4 h-4 text-gray-400" />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Application</DialogTitle>
            <DialogDescription>
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
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowWithdrawDialog(false)}
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
