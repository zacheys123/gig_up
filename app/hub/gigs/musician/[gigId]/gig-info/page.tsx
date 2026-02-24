// app/hub/gigs/musician/[gigId]/gig-info/page.tsx
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
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
  TrendingUp, // You already have this
  Sparkles, // You already have this
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
  Activity, // You already have this
  // ADD THESE NEW ONES
  TrendingDown,
  // You have Minus already, but adding for clarity
  BarChart3,
  LineChart,
  Zap,
  History,
  Info,
  FileText,
} from "lucide-react";
// Trust components
import { TrustStarsDisplay } from "@/components/trust/TrustStarsDisplay";
import { ChatIcon } from "@/components/chat/ChatIcon";
import { isUserQualifiedForRole } from "../../../utils";
import { useAllGigs } from "@/hooks/useAllGigs";
import PlatformActivitySidebar, {
  PlatformGig,
} from "../../_components/PlatformActivitySidebar";
import ComingSoonGigs from "../../_components/ComingSoon";
import { formatTimeAgo } from "@/utils";
import { EngagingGigCard } from "../../_components/GigCard";
import { SimilarGigCard } from "../../_components/SimilarGigCard";
import { InfoChip } from "../../_components/InfoChip";
import FollowButton from "@/components/pages/FollowButton";
import { OnlineBadge } from "@/components/chat/OnlineBadge";

// ============= COMPONENT PLACEHOLDERS =============

// GigInfoCard Component
const GigInfoCard = ({ gig, formatDate, formatTime, isDarkMode }: any) => (
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

      <CardContent className="p-4 md:p-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          {/* Logo/Avatar */}
          <div className="flex-shrink-0">
            <div className="relative">
              <Avatar className="w-16 h-16 md:w-20 md:h-20 rounded-xl border-4 border-white dark:border-slate-700 shadow-lg">
                <AvatarImage src={gig.logo} />
                <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white text-xl md:text-xl font-bold">
                  {gig.title?.charAt(0)}
                </AvatarFallback>
              </Avatar>

              {/* Live Badge */}
              {gig.isActive && (
                <div className="absolute -top-2 -right-2">
                  <span className="flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Title & Meta */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
              <div>
                <h2
                  className={cn(
                    "text-xl md:text-xl font-bold tracking-tight mb-2",
                    isDarkMode ? "text-white" : "text-slate-900",
                  )}
                >
                  {gig.title}
                </h2>

                <div className="flex flex-wrap gap-2">
                  {/* Location */}
                  <div
                    className={cn(
                      "flex items-center gap-1 text-[10px] md:text- px-2 py-1 rounded-full",
                      isDarkMode
                        ? "bg-slate-800 text-slate-300"
                        : "bg-slate-100 text-slate-600",
                    )}
                  >
                    <MapPin className="w-3 h-3" />
                    {gig.location || "Remote"}
                  </div>

                  {/* Date */}
                  <div
                    className={cn(
                      "flex items-center gap-1 text-[10px] md:text- px-2 py-1 rounded-full",
                      isDarkMode
                        ? "bg-slate-800 text-slate-300"
                        : "bg-slate-100 text-slate-600",
                    )}
                  >
                    <Calendar className="w-3 h-3" />
                    {formatDate(gig.date)}
                  </div>

                  {/* Time */}
                  {gig.time?.start && (
                    <div
                      className={cn(
                        "flex items-center gap-1 text-[10px] md:text- px-2 py-1 rounded-full",
                        isDarkMode
                          ? "bg-slate-800 text-slate-300"
                          : "bg-slate-100 text-slate-600",
                      )}
                    >
                      <Clock className="w-3 h-3" />
                      {gig.time.start} - {gig.time.end}
                    </div>
                  )}
                </div>
              </div>

              {/* Price Section */}
              <div className="flex flex-col items-start md:items-end">
                <div className="flex items-baseline gap-1">
                  <span
                    className={cn(
                      "text-[10px] font-medium",
                      isDarkMode ? "text-slate-400" : "text-slate-500",
                    )}
                  >
                    {gig.currency || "$"}
                  </span>
                  <span
                    className={cn(
                      "text-xl md:text-3xl font-bold",
                      isDarkMode ? "text-emerald-400" : "text-emerald-600",
                    )}
                  >
                    {gig.price?.toLocaleString()}
                  </span>
                </div>
                {gig.negotiable && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "mt-1 border-emerald-500 text-emerald-600 dark:text-emerald-400 text-xs",
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
        <div className="mt-6">
          <h3
            className={cn(
              "text-[10px] font-semibold uppercase tracking-wider mb-2",
              isDarkMode ? "text-slate-400" : "text-slate-500",
            )}
          >
            Description
          </h3>
          <p
            className={cn(
              "text- leading-relaxed whitespace-pre-line",
              isDarkMode ? "text-slate-300" : "text-slate-600",
            )}
          >
            {gig.description}
          </p>
        </div>

        {/* Tags */}
        {gig.tags && gig.tags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-2">
              {gig.tags.map((tag: string, i: number) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className={cn(
                    "px-2 py-1 text-[10px] font-medium",
                    isDarkMode
                      ? "bg-slate-800 text-slate-300 border-slate-700"
                      : "bg-slate-100 text-slate-600 border-slate-200",
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
);

// PosterInfoCard Component
const PosterInfoCard = ({
  poster,
  metrics,
  canMessageUser,
  handleViewProfile,
  getTrustTierIcon,
  isDarkMode,
}: any) => {
  const display = metrics?.display || {
    reliability: {
      value: 0,
      label: "Reliability",
      icon: "🛡️",
      color: "text-slate-500",
    },
    completion: {
      value: 0,
      label: "Completed",
      icon: "✅",
      color: "text-slate-500",
    },
    myCancellations: {
      value: 0,
      label: "My Cancellations",
      icon: "❌",
      color: "text-slate-500",
    },
    otherCancellations: {
      value: 0,
      label: "Other's Cancellations",
      icon: "🤷",
      color: "text-slate-500",
    },
    response: { hours: null, style: "unknown", icon: "⏳" },
    badge: {
      tier: "new",
      label: "New",
      emoji: "🌱",
      color: "from-purple-500 to-pink-500",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card
        className={cn(
          "border shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300",
          isDarkMode
            ? "bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700"
            : "bg-gradient-to-br from-white to-slate-50 border-slate-200",
        )}
      >
        {/* Badge gradient bar */}
        <div
          className={cn("h-1 w-full bg-gradient-to-r", display.badge.color)}
        />

        <CardContent className="p-4 md:p-6">
          {/* Header with badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users2 className="w-4 h-4 text-emerald-500" />
              <h3
                className={cn(
                  "text- font-semibold",
                  isDarkMode ? "text-white" : "text-slate-900",
                )}
              >
                Gig Owner
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {/* Reliability Badge */}
              <Badge
                className={cn(
                  "text-[10px] capitalize bg-gradient-to-r text-white border-0 flex items-center gap-1",
                  display.badge.color,
                )}
              >
                <span>{display.badge.emoji}</span>
                <span>{display.badge.label}</span>
              </Badge>

              {/* Verified Badge */}
              {poster.verifiedIdentity && (
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>

          {/* Avatar and Basic Info */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Avatar Section */}
            <div className="flex-shrink-0 text-center sm:text-left">
              <div className="relative inline-block">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 mx-auto sm:mx-0 border-4 border-white dark:border-slate-700 shadow-lg">
                  <AvatarImage src={poster.picture} />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white text-xl sm:text-2xl font-bold">
                    {poster.firstname?.charAt(0) || poster.username?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800" />
              </div>

              <div className="mt-3">
                <TrustStarsDisplay
                  trustStars={poster.trustStars || 0}
                  size="md"
                />
              </div>

              <p className="text-[10px] text-slate-500 mt-2">
                Member since {new Date(poster._creationTime).getFullYear()}
              </p>
            </div>

            {/* Info Section */}
            <div className="flex-1">
              {/* Name and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4
                    className={cn(
                      "text-lg sm:text-xl font-bold",
                      isDarkMode ? "text-white" : "text-slate-900",
                    )}
                  >
                    {poster.firstname || poster.username}
                  </h4>

                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {poster.roleType && (
                      <Badge variant="outline" className="text-xs">
                        {poster.roleType}
                      </Badge>
                    )}
                    {poster.city && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <MapPin className="w-3 h-3" />
                        {poster.city}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {canMessageUser(poster._id) && (
                    <ChatIcon
                      userId={poster._id}
                      size="sm"
                      variant="default"
                      showPulse
                    />
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewProfile(poster._id)}
                    className="gap-1 text-xs"
                  >
                    <Eye className="w-3 h-3" />
                    Profile
                  </Button>
                </div>
              </div>

              {/* Simple Metrics Grid */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Completion Rate */}
                <div
                  className={cn(
                    "text-center p-2 rounded-lg",
                    isDarkMode ? "bg-slate-800" : "bg-slate-50",
                  )}
                >
                  <div
                    className={cn(
                      "text-lg font-bold",
                      display.completion.color,
                    )}
                  >
                    {display.completion.value}%
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                    <span>{display.completion.icon}</span>
                    {display.completion.label}
                  </div>
                </div>

                {/* My Cancellations */}
                <div
                  className={cn(
                    "text-center p-2 rounded-lg",
                    isDarkMode ? "bg-slate-800" : "bg-slate-50",
                  )}
                >
                  <div
                    className={cn(
                      "text-lg font-bold",
                      display.myCancellations.color,
                    )}
                  >
                    {display.myCancellations.value}%
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                    <span>{display.myCancellations.icon}</span>
                    {display.myCancellations.label}
                  </div>
                </div>

                {/* Response Style */}
                <div
                  className={cn(
                    "text-center p-2 rounded-lg",
                    isDarkMode ? "bg-slate-800" : "bg-slate-50",
                  )}
                >
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {display.response.icon}
                  </div>
                  <div className="text-[10px] text-slate-500 capitalize">
                    {display.response.style === "quick" && "Quick"}
                    {display.response.style === "thoughtful" && "Thoughtful"}
                    {display.response.style === "fast" && "Fast"}
                    {display.response.style === "patient" && "Patient"}
                    {display.response.style === "unknown" && "—"}
                  </div>
                </div>
              </div>

              {/* Visual Breakdown Bar */}
              {metrics?.totalGigs > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span>Gig History</span>
                    <span>
                      {metrics.completedByMe} completed •{" "}
                      {metrics.cancelledByMe} cancelled by me •{" "}
                      {metrics.cancelledByOther} cancelled by others
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${metrics.completionRate}%` }}
                    />
                    <div
                      className="h-full bg-rose-500"
                      style={{ width: `${metrics.myCancellationRate}%` }}
                    />
                    <div
                      className="h-full bg-slate-400"
                      style={{ width: `${metrics.otherCancellationRate}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Simple Summary */}
              <p className="text-[10px] text-slate-500 mt-3">
                {metrics?.summary ||
                  `${display.reliability.value}% reliable • ${display.response.icon} ${display.response.style}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// RequirementsCard Component
const RequirementsCard = ({ requirements, isDarkMode }: any) => (
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
      <CardContent className="p-4 md:p-6">
        <h3
          className={cn(
            "text- font-semibold flex items-center gap-2 mb-4",
            isDarkMode ? "text-white" : "text-slate-900",
          )}
        >
          <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          Requirements
        </h3>

        <div className="space-y-2">
          {requirements.map((req: string, i: number) => (
            <div key={i} className="flex items-start gap-2 group">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                  {i + 1}
                </span>
              </div>
              <span
                className={cn(
                  "text- flex-1",
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
);

// Then in your RoleCard component, use it:
const RoleCard = ({ role, index, isDarkMode, currentUser, onApply }: any) => {
  const isQualified = isUserQualifiedForRole(currentUser, role);

  return (
    <div
      className={cn(
        "p-4 rounded-xl border",
        isDarkMode
          ? "bg-slate-800/30 border-slate-700/50"
          : "bg-white/30 border-slate-200/50",
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h4
          className={cn(
            "font-semibold text-[11px]",
            isDarkMode ? "text-white" : "text-slate-900",
          )}
        >
          {role.role}
        </h4>
        <Badge variant="outline" className="text-xs">
          {role.filledSlots}/{role.maxSlots}
        </Badge>
      </div>

      {role.description && (
        <p
          className={cn(
            "text-[10px] mb-3",
            isDarkMode ? "text-slate-400" : "text-slate-500",
          )}
        >
          {role.description}
        </p>
      )}

      {role.requiredSkills && role.requiredSkills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {role.requiredSkills.slice(0, 3).map((skill: string, i: number) => (
            <Badge
              key={i}
              variant="outline"
              className="text-[10px] px-1.5 py-0"
            >
              {skill}
            </Badge>
          ))}
        </div>
      )}

      {/* Qualification indicator */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            isQualified ? "bg-emerald-500" : "bg-amber-500",
          )}
        />
        <span
          className={cn(
            "text-xs",
            isQualified ? "text-emerald-500" : "text-amber-500",
          )}
        >
          {isQualified ? "You qualify" : "Missing requirements"}
        </span>
      </div>

      <Button
        size="sm"
        onClick={onApply}
        disabled={!isQualified}
        className={cn(
          "w-full text-xs",
          isQualified
            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
            : "opacity-50 cursor-not-allowed",
        )}
      >
        {isQualified ? "Apply Now" : "Not Qualified"}
      </Button>
    </div>
  );
};
// ============= MAIN COMPONENT =============
// Types
interface PageProps {
  params: Promise<{
    gigId: string;
  }>;
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
  const [showRoleDrawer, setShowRoleDrawer] = useState(false);
  const [showApplicantSidebar, setShowApplicantSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Mutations
  const removeInterestFromGig = useMutation(
    api.controllers.gigs.removeInterestFromGig,
  );

  // Fetch gig data
  const gig = useQuery(api.controllers.gigs.getGigById, {
    gigId: gigId as Id<"gigs">,
  });

  // Fetch ALL users that are involved in this gig
  const userIds = useMemo(() => {
    if (!gig) return [];

    const ids = new Set<Id<"users">>();

    // 1. Add poster (gig owner)
    ids.add(gig.postedBy);

    // 2. Add interested users
    gig.interestedUsers?.forEach((id) => ids.add(id as Id<"users">));

    // 3. Add applied users
    gig.appliedUsers?.forEach((id) => ids.add(id as Id<"users">));

    // 4. Add shortlisted users
    gig.shortlistedUsers?.forEach((item) =>
      ids.add(item.userId as Id<"users">),
    );

    // 5. Add booked user
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
    const map = new Map<Id<"users">, any>();
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

    if (gig.postedBy === currentUser._id) {
      return { type: "poster", status: "owner" };
    }

    if (gig.interestedUsers?.includes(currentUser._id)) {
      return { type: "interested", status: "pending" };
    }

    if (gig.appliedUsers?.includes(currentUser._id)) {
      return { type: "applied", status: "pending" };
    }

    const shortlistedEntry = gig.shortlistedUsers?.find(
      (item: any) => item.userId === currentUser._id,
    );
    if (shortlistedEntry) {
      return { type: "shortlisted", status: "active" };
    }

    if (gig.bookedBy === currentUser._id) {
      return { type: "booked", status: "confirmed" };
    }

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

    if (gig.bookCount) {
      for (const booking of gig.bookCount) {
        if (booking.appliedBy === currentUser._id) {
          return { type: "band-booking", status: "applied" };
        }
      }
    }

    return null;
  }, [gig, currentUser]);

  // Get user's role in this gig
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
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border",
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

    if (targetUserId === gig?.postedBy) return true;
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

  const { allGigs: allGigsData, isLoading: allGigsLoading } = useAllGigs({
    limit: 100,
  });

  // Add these handler functions inside your component:
  const handleViewGig = (gig: any) => {
    router.push(`/hub/gigs/musician/${gig._id}/gig-info`);
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
        <div
          className={cn(
            "absolute -inset-0.5 rounded-full opacity-75 group-hover:opacity-100",
            "bg-gradient-to-r blur transition duration-500 group-hover:duration-200",
            badge.gradient,
          )}
        />
        <Badge
          className={cn(
            "relative px-3 py-1.5 rounded-full border-0",
            "bg-slate-900 dark:bg-slate-950",
            "text-white",
            "flex items-center gap-1.5",
            "shadow-xl text-xs",
          )}
        >
          <Icon className="w-3.5 h-3.5" />
          <span className="font-medium">
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
      interested: [] as any[],
      applied: [] as any[],
      shortlisted: [] as any[],
      booked: [] as any[],
      bandApplicants: [] as any[],
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

    Object.keys(groups).forEach((key) => {
      groups[key as keyof typeof groups] = groups[
        key as keyof typeof groups
      ].filter((user) => user._id !== currentUser?._id);
    });

    return groups;
  }, [gig, userMap, currentUser]);

  // Filtered applicants based on search
  const filterUsers = (users: any[]) => {
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

  // Inside your GigDetailsPage component:

  // 1. DELETE these old states (they're causing issues)
  // const [priceChanges, setPriceChanges]...
  // const [tickerData, setTickerData]...
  // const [marketTrend, setMarketTrend]...

  // 2. ADD these new states for live activity
  const [liveActivity, setLiveActivity] = useState({
    recentInterests: 0,
    recentApplications: 0,
    recentViews: 0,
    activeUsers: 0,
    peakHour: "",
    topLocation: "",
  });

  const [liveFeed, setLiveFeed] = useState<
    Array<{
      id: string;
      type: "interest" | "apply" | "view";
      gigTitle: string;
      timestamp: number;
      category: string;
    }>
  >([]);

  // 3. Base metrics from real data (static baseline)
  const baseMetrics = useMemo(() => {
    if (!allGigsData) return null;

    // Calculate from REAL gig data
    const totalInterests = allGigsData.reduce(
      (sum, gig) => sum + (gig.interestedUsers?.length || 0),
      0,
    );

    const totalApplications = allGigsData.reduce(
      (sum, gig) => sum + (gig.appliedUsers?.length || 0),
      0,
    );

    // Category popularity
    const categoryCount: Record<string, number> = {};
    allGigsData.forEach((gig) => {
      const cat = gig.bussinesscat || "other";
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    const topCategory =
      Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "None";

    // Location popularity
    const locationCount: Record<string, number> = {};
    allGigsData.forEach((gig) => {
      if (gig.location) {
        const loc = gig.location.split(",")[0];
        locationCount[loc] = (locationCount[loc] || 0) + 1;
      }
    });

    const topLocation =
      Object.entries(locationCount).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "Remote";

    // Average price
    const prices = allGigsData.filter((g) => g.price).map((g) => g.price || 0);
    const avgPrice = prices.length
      ? Math.floor(prices.reduce((a, b) => a + b, 0) / prices.length)
      : 0;

    // Peak posting hour
    const hours = allGigsData.map((g) => new Date(g._creationTime).getHours());
    const hourCount: Record<number, number> = {};
    hours.forEach((h) => (hourCount[h] = (hourCount[h] || 0) + 1));
    const peakHourNum = Object.entries(hourCount).sort(
      (a, b) => b[1] - a[1],
    )[0]?.[0];

    const peakHour = peakHourNum
      ? `${parseInt(peakHourNum) > 12 ? parseInt(peakHourNum) - 12 : peakHourNum}${parseInt(peakHourNum) >= 12 ? "PM" : "AM"}`
      : "N/A";

    return {
      totalGigs: allGigsData.length,
      totalInterests,
      totalApplications,
      avgPrice,
      topCategory,
      topLocation,
      peakHour,
      bookedCount: allGigsData.filter((g) => g.isTaken).length,
    };
  }, [allGigsData]);

  // 4. Initialize live activity with baseline data (only once)
  useEffect(() => {
    if (!baseMetrics) return;

    // Only set initial values if they haven't been set yet
    setLiveActivity({
      recentInterests: Math.floor(baseMetrics.totalInterests * 0.1),
      recentApplications: Math.floor(baseMetrics.totalApplications * 0.1),
      recentViews: Math.floor(baseMetrics.totalGigs * 3),
      activeUsers: Math.floor(baseMetrics.totalGigs * 1.5),
      peakHour: baseMetrics.peakHour,
      topLocation: baseMetrics.topLocation,
    });

    // This should only run once when baseMetrics becomes available
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseMetrics?.totalGigs]); // Only depend on a single primitive value

  // 5. Simulate LIVE activity using real data patterns (separate effect)
  useEffect(() => {
    if (!baseMetrics || !allGigsData || allGigsData.length === 0) return;

    // Live feed simulation using REAL gig data
    const feedInterval = setInterval(() => {
      // Pick a random gig to "interact with"
      const randomGig =
        allGigsData[Math.floor(Math.random() * allGigsData.length)];
      if (!randomGig) return;

      // Random activity type
      const types = ["interest", "apply", "view"] as const;
      const randomType = types[Math.floor(Math.random() * types.length)];

      // Add to live feed
      const newFeedItem = {
        id: `${Date.now()}-${Math.random()}`,
        type: randomType,
        gigTitle: randomGig.title || "A gig",
        timestamp: Date.now(),
        category: randomGig.bussinesscat || "talent",
      };

      setLiveFeed((prev) => [newFeedItem, ...prev].slice(0, 5));

      // Update counters based on activity
      setLiveActivity((prev) => ({
        ...prev,
        recentInterests:
          prev.recentInterests + (randomType === "interest" ? 1 : 0),
        recentApplications:
          prev.recentApplications + (randomType === "apply" ? 1 : 0),
        recentViews: prev.recentViews + (randomType === "view" ? 1 : 0),
        activeUsers: Math.max(
          5,
          prev.activeUsers + (Math.random() > 0.7 ? 1 : -1),
        ),
      }));
    }, 8000);

    // Smooth counter updates (for the live numbers)
    const counterInterval = setInterval(() => {
      setLiveActivity((prev) => ({
        ...prev,
        recentInterests: Math.max(
          0,
          prev.recentInterests + (Math.random() > 0.5 ? 1 : -1),
        ),
        recentApplications: Math.max(
          0,
          prev.recentApplications + (Math.random() > 0.6 ? 1 : 0),
        ),
        recentViews: prev.recentViews + Math.floor(Math.random() * 3),
        activeUsers: Math.max(
          5,
          prev.activeUsers + (Math.random() > 0.5 ? 1 : -1),
        ),
      }));
    }, 3000);

    return () => {
      clearInterval(feedInterval);
      clearInterval(counterInterval);
    };
  }, [baseMetrics, allGigsData]); // Keep these dependencies
  // 5. Use these in your UI
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "interest":
        return <Heart className="w-3 h-3 text-rose-400" />;
      case "apply":
        return <Briefcase className="w-3 h-3 text-amber-400" />;
      default:
        return <Eye className="w-3 h-3 text-blue-400" />;
    }
  };

  // Memoize the filtered interest gigs
  const upcomingInterestGigs = useMemo(() => {
    if (!allGigsData) return [];

    const now = Date.now();

    return allGigsData
      .filter(
        (gig) =>
          gig._id !== gigId &&
          gig.acceptInterestStartTime &&
          gig.acceptInterestStartTime > now &&
          !gig.isTaken &&
          gig.isActive !== false,
      )
      .sort(
        (a, b) =>
          (a.acceptInterestStartTime || 0) - (b.acceptInterestStartTime || 0),
      )
      .slice(0, 8);
  }, [allGigsData, gigId]);

  // Memoize the filtered event gigs
  const upcomingEventGigs = useMemo(() => {
    if (!allGigsData) return [];

    const now = Date.now();

    return allGigsData
      .filter(
        (gig) =>
          gig._id !== gigId &&
          gig.date &&
          gig.date > now &&
          !gig.isTaken &&
          gig.isActive !== false,
      )
      .sort((a, b) => (a.date || 0) - (b.date || 0))
      .slice(0, 8);
  }, [allGigsData, gigId]);
  // REPLACE with this useMemo:
  const filteredGigs = useMemo(() => {
    if (!allGigsData) return [];

    let filtered = [...allGigsData];

    switch (activeTab) {
      case "trending":
        // Trending: Gigs with most total interactions
        filtered = allGigsData
          .map((gig) => ({
            ...gig,
            interactionScore:
              (gig.interestedUsers?.length || 0) * 2 +
              (gig.appliedUsers?.length || 0) * 3 +
              (gig.bookedBy ? 10 : 0) +
              (gig.viewCount?.length || 0),
          }))
          .sort((a, b) => b.interactionScore - a.interactionScore)
          .slice(0, 10);
        break;

      case "hot":
        // Hot: Gigs with most booking history entries
        filtered = allGigsData
          .map((gig) => {
            const bookingHistoryCount = gig.bookingHistory?.length || 0;
            const bandBookingCount = gig.bandBookingHistory?.length || 0;
            const bookCountEntries = gig.bookCount?.length || 0;
            const shortlistedCount = gig.shortlistedUsers?.length || 0;

            return {
              ...gig,
              engagementScore:
                bookingHistoryCount * 2 +
                bandBookingCount * 2 +
                bookCountEntries * 1.5 +
                shortlistedCount * 1.5,
            };
          })
          .sort((a, b) => b.engagementScore - a.engagementScore)
          .slice(0, 10);
        break;

      case "closing":
        // Closing: Gigs where interest window is closing soon
        const now = Date.now();
        const threeDaysFromNow = now + 3 * 24 * 60 * 60 * 1000;

        filtered = allGigsData
          .filter(
            (gig) =>
              gig.acceptInterestEndTime &&
              gig.acceptInterestEndTime > now &&
              gig.acceptInterestEndTime < threeDaysFromNow &&
              !gig.isTaken,
          )
          .sort(
            (a, b) =>
              (a.acceptInterestEndTime || 0) - (b.acceptInterestEndTime || 0),
          )
          .slice(0, 10);
        break;

      default:
        filtered = allGigsData.slice(0, 10);
    }

    return filtered;
  }, [activeTab, allGigsData]); // Dependencies

  // Add these queries near your other useQuery hooks
  const onlineUsers = useQuery(api.controllers.user.getOnlineUsers, {
    thresholdMinutes: 5,
    limit: 50,
  });

  const onlineStats = useQuery(api.controllers.user.getOnlineUsersStats, {
    thresholdMinutes: 5,
  });

  // Optional: Get current user's online status for "You're online" badge
  const isCurrentUserOnline = useMemo(() => {
    if (!currentUser?._id || !onlineUsers) return false;
    return onlineUsers.some((user: any) => user._id === currentUser._id);
  }, [currentUser?._id, onlineUsers]);
  // Add this before the return
  const getTrendIcon = (change: number) => {
    if (change > 0.5)
      return <TrendingUp className="w-3 h-3 text-emerald-500" />;
    if (change < -0.5)
      return <TrendingDown className="w-3 h-3 text-rose-500" />;
    return <Minus className="w-3 h-3 text-slate-400" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0.5) return "text-emerald-500";
    if (change < -0.5) return "text-rose-500";
    return "text-slate-400";
  };
  const canWithdraw =
    userApplication &&
    ["interested", "applied", "band-applicant", "band-booking"].includes(
      userApplication.type,
    );

  // Loading state
  if (!gig || !users) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="max-w-7xl mx-auto space-y-4 w-full">
          <Skeleton className="h-8 w-24" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Skeleton className="h-96 rounded-xl lg:col-span-1" />
            <Skeleton className="h-96 rounded-xl lg:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div
        className={cn(
          "min-h-screen relative",
          isDarkMode
            ? "bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-slate-950/90"
            : "bg-gradient-to-br from-slate-50/80 via-white/70 to-slate-50/80",
        )}
      >
        {/* Subtle background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={cn(
              "absolute top-0 left-0 right-0 h-96 bg-gradient-to-b",
              isDarkMode
                ? "from-indigo-500/5 via-transparent to-transparent"
                : "from-amber-500/5 via-transparent to-transparent",
            )}
          />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className={cn(
                "p-2 rounded-xl transition-all hover:scale-105",
                isDarkMode
                  ? "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50",
              )}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 justify-evenly">
              <div className="hidden md:block">
                {getMyStatusBadge && getMyStatusBadge()}
              </div>

              {/* Mobile menu buttons */}
              <button
                onClick={() => setShowApplicantSidebar(true)}
                className={cn(
                  "md:hidden p-2 rounded-xl",
                  isDarkMode
                    ? "bg-slate-800/50 text-slate-300"
                    : "bg-slate-100/50 text-slate-600",
                )}
              >
                <Activity className="w-5 h-5" />
              </button>

              {gig.bandCategory && gig.bandCategory.length > 0 && (
                <button
                  onClick={() => setShowRoleDrawer(true)}
                  className={cn(
                    "md:hidden p-2 rounded-xl",
                    isDarkMode
                      ? "bg-slate-800/50 text-slate-300"
                      : "bg-slate-100/50 text-slate-600",
                  )}
                >
                  <Music className="w-5 h-5" />
                </button>
              )}

              {/* Share Button */}
              <button
                className={cn(
                  "hidden md:flex p-2 rounded-xl",
                  isDarkMode
                    ? "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50",
                )}
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Gig Title - Enhanced styling */}
          <div className="mb-8">
            {/* Title with gradient accent */}
            <div className="relative mb-3">
              <h1
                className={cn(
                  "text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight",
                  isDarkMode ? "text-white" : "text-slate-900",
                )}
              >
                {gig.title}
              </h1>

              {/* Subtle underline accent */}
              <div
                className={cn(
                  "absolute -bottom-1 left-0 w-16 h-1 rounded-full",
                  "bg-gradient-to-r from-purple-500 to-pink-500",
                )}
              />
            </div>

            {/* Meta information chips */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {/* Category Chip */}
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                  "text-[10px] font-medium transition-all",
                  "border",
                  isDarkMode
                    ? "bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                    : "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100",
                )}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="capitalize">{gig.bussinesscat || "Gig"}</span>
              </div>

              {/* Location Chip */}
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                  "text-[10px] font-medium transition-all",
                  "border",
                  isDarkMode
                    ? "bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                    : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
                )}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{gig.location?.split(",")[0] || "Remote"}</span>
              </div>

              {/* Date Chip */}
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                  "text-[10px] font-medium transition-all",
                  "border",
                  isDarkMode
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                    : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100",
                )}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(gig.date)}</span>
              </div>

              {/* Time Chip - if available */}
              {gig.time?.start && (
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                    "text-[10px] font-medium transition-all",
                    "border",
                    isDarkMode
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                      : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100",
                  )}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {gig.time.start} - {gig.time.end}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Stats Row - Optional */}
            <div className="flex items-center gap-4 mt-4 text-xs">
              {/* Interested count */}
              {gig.interestedUsers && gig.interestedUsers.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded-full bg-rose-500/10">
                    <Heart className="w-3 h-3 text-rose-500" />
                  </div>
                  <span
                    className={isDarkMode ? "text-slate-300" : "text-slate-600"}
                  >
                    {gig.interestedUsers.length} interested
                  </span>
                </div>
              )}

              {/* Views count */}
              {gig.viewCount && gig.viewCount.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded-full bg-blue-500/10">
                    <Eye className="w-3 h-3 text-blue-500" />
                  </div>
                  <span
                    className={isDarkMode ? "text-slate-300" : "text-slate-600"}
                  >
                    {gig.viewCount.length} views
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Layout - Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LEFT COLUMN - The Vibe */}
            <div className="hidden md:block md:col-span-1">
              {allGigsLoading ? (
                <Card
                  className={cn(
                    "border shadow-sm p-3",
                    isDarkMode
                      ? "bg-slate-900/50 border-slate-800"
                      : "bg-white border-slate-200",
                  )}
                >
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </Card>
              ) : (
                <div className="space-y-3 sticky top-24">
                  {/* SECTION 1: THE BUZZ - What's happening now */}
                  <div
                    className={cn(
                      "rounded-xl border-2 overflow-hidden transition-all duration-300",
                      isDarkMode
                        ? "bg-gradient-to-b from-slate-900 via-slate-800/90 to-slate-900 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                        : "bg-gradient-to-b from-white via-purple-50/30 to-white border-purple-200 shadow-lg",
                    )}
                  >
                    {/* Header - Improved sizing */}
                    <div
                      className={cn(
                        "px-4 py-3 border-b flex items-center justify-between",
                        isDarkMode
                          ? "border-purple-500/20"
                          : "border-purple-200",
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        <h3
                          className={cn(
                            "text- font-bold uppercase tracking-wider",
                            isDarkMode ? "text-white" : "text-slate-900",
                          )}
                        >
                          The Buzz
                        </h3>
                      </div>

                      {/* Who's Here - Improved badge */}
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] h-6 px-2 font-mono",
                          isDarkMode
                            ? "border-purple-500/30 text-purple-300"
                            : "border-purple-300 text-purple-700",
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{onlineStats?.total || 0} here now</span>
                        </div>
                      </Badge>
                    </div>

                    {/* Pulse - Live counters - Improved sizing */}
                    <div
                      className={cn(
                        "px-4 py-2 border-b flex items-center gap-4 overflow-x-auto text-[10px] font-mono whitespace-nowrap",
                        isDarkMode
                          ? "bg-slate-800/50 border-slate-700"
                          : "bg-slate-100/50 border-slate-200",
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        <Heart className="w-4 h-4 text-rose-400" />
                        {liveActivity.recentInterests} feeling it
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-amber-400" />
                        {liveActivity.recentApplications} jumped in
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {liveActivity.topLocation} popping
                      </span>
                      <span className="text-slate-400">•</span>
                      {/* Price ticker - Improved */}
                      <span className="flex items-center gap-1.5 bg-slate-200/50 dark:bg-slate-700/50 px-2 py-0.5 rounded animate-pulse">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500 font-bold text-[11px]">
                          {baseMetrics?.avgPrice || 0}
                        </span>
                        <span className="text-[10px] text-slate-400">avg</span>
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                      </span>
                    </div>

                    {/* Fresh Drops - Live feed - Improved */}
                    <div className="px-4 py-2 border-b">
                      <div
                        className={cn(
                          "text-[10px] font-mono mb-2 font-semibold",
                          isDarkMode ? "text-slate-400" : "text-slate-500",
                        )}
                      >
                        FRESH DROPS
                      </div>
                      <div className="space-y-1.5 max-h-[70px] overflow-hidden">
                        {liveFeed.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-1.5 text-xs"
                          >
                            {getActivityIcon(item.type)}
                            <span
                              className={cn(
                                "truncate max-w-[120px]",
                                isDarkMode
                                  ? "text-slate-300"
                                  : "text-slate-700",
                              )}
                            >
                              {item.gigTitle}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span
                              className={cn(
                                "text-xs",
                                isDarkMode
                                  ? "text-slate-500"
                                  : "text-slate-400",
                              )}
                            >
                              {Math.floor((Date.now() - item.timestamp) / 1000)}
                              s ago
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mood Filters - Improved */}
                    <div className="px-4 pt-3">
                      <div
                        className={cn(
                          "flex gap-2 p-1 rounded-lg",
                          isDarkMode ? "bg-slate-800" : "bg-slate-100",
                        )}
                      >
                        {[
                          { id: "trending", label: "🔥 Fire", color: "rose" },
                          { id: "hot", label: "⚡ Lit", color: "amber" },
                          {
                            id: "closing",
                            label: "⏰ Last Call",
                            color: "purple",
                          },
                        ].map((filter) => (
                          <button
                            key={filter.id}
                            onClick={() => setActiveTab(filter.id)}
                            className={cn(
                              "flex-1 py-2 rounded-md text-[11px] font-medium transition-all",
                              activeTab === filter.id
                                ? isDarkMode
                                  ? `bg-${filter.color}-600 text-white`
                                  : `bg-${filter.color}-500 text-white`
                                : isDarkMode
                                  ? "text-slate-400 hover:text-white hover:bg-slate-700"
                                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200",
                            )}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Trending Picks - Improved header */}
                    <div className="p-3">
                      <h4
                        className={cn(
                          "text-[10px] font-mono mb-2 font-semibold",
                          isDarkMode ? "text-slate-400" : "text-slate-500",
                        )}
                      >
                        TRENDING PICKS
                      </h4>
                      <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto scrollbar-hide">
                        {filteredGigs
                          .slice(0, 6)
                          .map((gig: any, idx: number) => (
                            <EngagingGigCard
                              key={gig._id}
                              gig={gig}
                              activeTab={activeTab}
                              index={idx}
                              onViewGig={handleViewGig}
                            />
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: COMING THROUGH */}
                  <div className="space-y-4">
                    {/* Dropping Soon - Enhanced */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className={cn(
                        "rounded-xl border overflow-hidden transition-all duration-300",
                        "hover:shadow-xl hover:shadow-purple-500/5",
                        isDarkMode
                          ? "bg-slate-900/80 border-purple-500/30 backdrop-blur-sm"
                          : "bg-white/90 border-purple-200 shadow-lg hover:shadow-purple-500/10",
                      )}
                    >
                      {/* Header with gradient */}
                      <div
                        className={cn(
                          "px-4 py-3 border-b flex items-center justify-between",
                          "bg-gradient-to-r",
                          isDarkMode
                            ? "from-purple-500/10 to-transparent border-purple-500/20"
                            : "from-purple-50 to-transparent border-purple-200",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Timer className="w-5 h-5 text-purple-500" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-ping opacity-50" />
                          </div>
                          <div>
                            <span
                              className={cn(
                                "text-sm font-bold uppercase tracking-wider",
                                isDarkMode ? "text-white" : "text-slate-900",
                              )}
                            >
                              Dropping Soon
                            </span>
                            <p
                              className={cn(
                                "text-[10px] font-mono",
                                isDarkMode
                                  ? "text-purple-300/70"
                                  : "text-purple-600/70",
                              )}
                            >
                              applications opening
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={cn(
                            "text-xs h-6 px-3 font-bold shadow-lg",
                            isDarkMode
                              ? "bg-purple-500/20 text-purple-300 border-purple-500/30 backdrop-blur-sm"
                              : "bg-purple-100 text-purple-700 border-purple-200",
                          )}
                        >
                          {upcomingInterestGigs.length} upcoming
                        </Badge>
                      </div>

                      {/* Info Bar */}
                      <div
                        className={cn(
                          "px-4 py-2 border-b flex items-center gap-2",
                          isDarkMode
                            ? "bg-purple-500/5 border-purple-500/20"
                            : "bg-purple-50/50 border-purple-200",
                        )}
                      >
                        <Info className="w-3.5 h-3.5 text-purple-400" />
                        <span
                          className={cn(
                            "text-[11px] font-mono",
                            isDarkMode ? "text-slate-400" : "text-slate-500",
                          )}
                        >
                          ⏰ When you can apply • Interest window
                        </span>
                      </div>

                      {/* Cards Grid */}
                      <div className="p-4">
                        <div className="grid grid-cols-3 gap-3">
                          {upcomingInterestGigs.slice(0, 3).map((gig) => {
                            const startTime = gig.acceptInterestStartTime!;
                            const now = Date.now();
                            const daysUntil = Math.ceil(
                              (startTime - now) / (1000 * 60 * 60 * 24),
                            );
                            const hoursUntil = Math.floor(
                              (startTime - now) / (1000 * 60 * 60),
                            );

                            const timeDisplay =
                              daysUntil > 0
                                ? `${daysUntil}d`
                                : `${hoursUntil}h`;

                            return (
                              <motion.div
                                key={gig._id}
                                whileHover={{ y: -4, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleViewGig(gig)}
                                className={cn(
                                  "group relative flex flex-col items-center p-3 rounded-xl cursor-pointer transition-all",
                                  "border shadow-sm hover:shadow-xl",
                                  isDarkMode
                                    ? "bg-slate-800/40 border-purple-500/20 hover:border-purple-500/40 hover:bg-slate-800/60 hover:shadow-purple-500/10"
                                    : "bg-white/80 border-purple-200/60 hover:border-purple-300 hover:bg-white hover:shadow-purple-500/5",
                                )}
                              >
                                {/* Glow effect on hover */}
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:via-purple-500/5 group-hover:to-transparent transition-all duration-500" />

                                {/* Day circle with countdown */}
                                <div className="relative mb-2">
                                  <div
                                    className={cn(
                                      "w-12 h-12 rounded-full flex items-center justify-center",
                                      "bg-gradient-to-br shadow-lg",
                                      daysUntil <= 1
                                        ? "from-orange-500 to-red-500 shadow-orange-500/30"
                                        : "from-purple-500 to-pink-500 shadow-purple-500/30",
                                    )}
                                  >
                                    <span className="text-white text-sm font-bold">
                                      {timeDisplay}
                                    </span>
                                  </div>
                                  {/* Live pulse for soonest gig */}
                                  {daysUntil <= 1 && (
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                                      <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500" />
                                    </span>
                                  )}
                                </div>

                                {/* Gig title */}
                                <h5
                                  className={cn(
                                    "text-xs font-medium text-center line-clamp-2 mb-1",
                                    isDarkMode
                                      ? "text-slate-200"
                                      : "text-slate-800",
                                    "group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors",
                                  )}
                                >
                                  {gig.title}
                                </h5>

                                {/* Location tag */}
                                {gig.location && (
                                  <div className="flex items-center gap-0.5 text-[9px] text-slate-500">
                                    <MapPin className="w-2.5 h-2.5" />
                                    <span className="truncate max-w-[70px]">
                                      {gig.location.split(",")[0]}
                                    </span>
                                  </div>
                                )}

                                {/* Interest indicator */}
                                {gig.interestedUsers &&
                                  gig.interestedUsers.length > 0 && (
                                    <div className="absolute top-2 right-2">
                                      <div className="flex items-center gap-0.5 bg-rose-500/10 text-rose-500 rounded-full px-1.5 py-0.5 text-[8px] font-medium border border-rose-500/20">
                                        <Heart className="w-2.5 h-2.5" />
                                        <span>
                                          {gig.interestedUsers.length}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>

                    {/* On the Horizon - Enhanced */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className={cn(
                        "rounded-xl border overflow-hidden transition-all duration-300",
                        "hover:shadow-xl hover:shadow-emerald-500/5",
                        isDarkMode
                          ? "bg-slate-900/80 border-emerald-500/30 backdrop-blur-sm"
                          : "bg-white/90 border-emerald-200 shadow-lg hover:shadow-emerald-500/10",
                      )}
                    >
                      {/* Header with gradient */}
                      <div
                        className={cn(
                          "px-4 py-3 border-b flex items-center justify-between",
                          "bg-gradient-to-r",
                          isDarkMode
                            ? "from-emerald-500/10 to-transparent border-emerald-500/20"
                            : "from-emerald-50 to-transparent border-emerald-200",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Calendar className="w-5 h-5 text-emerald-500" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-50" />
                          </div>
                          <div>
                            <span
                              className={cn(
                                "text-sm font-bold uppercase tracking-wider",
                                isDarkMode ? "text-white" : "text-slate-900",
                              )}
                            >
                              On the Horizon
                            </span>
                            <p
                              className={cn(
                                "text-[10px] font-mono",
                                isDarkMode
                                  ? "text-emerald-300/70"
                                  : "text-emerald-600/70",
                              )}
                            >
                              event dates
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={cn(
                            "text-xs h-6 px-3 font-bold shadow-lg",
                            isDarkMode
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 backdrop-blur-sm"
                              : "bg-emerald-100 text-emerald-700 border-emerald-200",
                          )}
                        >
                          {upcomingEventGigs.length} upcoming
                        </Badge>
                      </div>

                      {/* Info Bar */}
                      <div
                        className={cn(
                          "px-4 py-2 border-b flex items-center gap-2",
                          isDarkMode
                            ? "bg-emerald-500/5 border-emerald-500/20"
                            : "bg-emerald-50/50 border-emerald-200",
                        )}
                      >
                        <Info className="w-3.5 h-3.5 text-emerald-400" />
                        <span
                          className={cn(
                            "text-[11px] font-mono",
                            isDarkMode ? "text-slate-400" : "text-slate-500",
                          )}
                        >
                          📅 When the gig happens • Event date
                        </span>
                      </div>

                      {/* Cards Grid */}
                      <div className="p-4">
                        <div className="grid grid-cols-3 gap-3">
                          {upcomingEventGigs.slice(0, 3).map((gig) => {
                            const eventDate = gig.date;
                            const now = Date.now();
                            const daysUntil = Math.ceil(
                              (eventDate - now) / (1000 * 60 * 60 * 24),
                            );

                            return (
                              <motion.div
                                key={gig._id}
                                whileHover={{ y: -4, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleViewGig(gig)}
                                className={cn(
                                  "group relative flex flex-col items-center p-3 rounded-xl cursor-pointer transition-all",
                                  "border shadow-sm hover:shadow-xl",
                                  isDarkMode
                                    ? "bg-slate-800/40 border-emerald-500/20 hover:border-emerald-500/40 hover:bg-slate-800/60 hover:shadow-emerald-500/10"
                                    : "bg-white/80 border-emerald-200/60 hover:border-emerald-300 hover:bg-white hover:shadow-emerald-500/5",
                                )}
                              >
                                {/* Glow effect on hover */}
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:via-emerald-500/5 group-hover:to-transparent transition-all duration-500" />

                                {/* Day circle with countdown */}
                                <div className="relative mb-2">
                                  <div
                                    className={cn(
                                      "w-12 h-12 rounded-full flex items-center justify-center",
                                      "bg-gradient-to-br shadow-lg",
                                      daysUntil <= 7
                                        ? "from-amber-500 to-orange-500 shadow-amber-500/30"
                                        : "from-emerald-500 to-teal-500 shadow-emerald-500/30",
                                    )}
                                  >
                                    <span className="text-white text-sm font-bold">
                                      {daysUntil}d
                                    </span>
                                  </div>
                                  {/* Soon indicator */}
                                  {daysUntil <= 3 && (
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                                    </span>
                                  )}
                                </div>

                                {/* Gig title */}
                                <h5
                                  className={cn(
                                    "text-xs font-medium text-center line-clamp-2 mb-1",
                                    isDarkMode
                                      ? "text-slate-200"
                                      : "text-slate-800",
                                    "group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors",
                                  )}
                                >
                                  {gig.title}
                                </h5>

                                {/* Location tag */}
                                {gig.location && (
                                  <div className="flex items-center gap-0.5 text-[9px] text-slate-500">
                                    <MapPin className="w-2.5 h-2.5" />
                                    <span className="truncate max-w-[70px]">
                                      {gig.location.split(",")[0]}
                                    </span>
                                  </div>
                                )}

                                {/* Interest indicator */}
                                {gig.interestedUsers &&
                                  gig.interestedUsers.length > 0 && (
                                    <div className="absolute top-2 right-2">
                                      <div className="flex items-center gap-0.5 bg-rose-500/10 text-rose-500 rounded-full px-1.5 py-0.5 text-[8px] font-medium border border-rose-500/20">
                                        <Heart className="w-2.5 h-2.5" />
                                        <span>
                                          {gig.interestedUsers.length}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* SECTION 3: THE SCENE - Improved */}
                  <div
                    className={cn(
                      "rounded-xl border overflow-hidden",
                      isDarkMode
                        ? "bg-slate-900/60 border-slate-700/50 backdrop-blur-sm"
                        : "bg-white/60 border-slate-200/50 backdrop-blur-sm",
                    )}
                  >
                    <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-700">
                      <div className="py-2 text-center">
                        <div
                          className={cn(
                            "text-[10px] mb-1",
                            isDarkMode ? "text-slate-400" : "text-slate-500",
                          )}
                        >
                          🎸 Artists
                        </div>
                        <div className="text-base font-bold text-blue-500">
                          {onlineStats?.musicians || 0}
                        </div>
                      </div>
                      <div className="py-2 text-center">
                        <div
                          className={cn(
                            "text-[10px] mb-1",
                            isDarkMode ? "text-slate-400" : "text-slate-500",
                          )}
                        >
                          🎩 Bookers
                        </div>
                        <div className="text-base font-bold text-purple-500">
                          {onlineStats?.clients || 0}
                        </div>
                      </div>
                      <div className="py-2 text-center">
                        <div
                          className={cn(
                            "text-[10px] mb-1",
                            isDarkMode ? "text-slate-400" : "text-slate-500",
                          )}
                        >
                          ✨ In the House
                        </div>
                        <div className="text-base font-bold text-emerald-500">
                          {onlineStats?.total || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* RIGHT COLUMN - Main Content - Enhanced */}
            <div className="md:col-span-2 space-y-6">
              {/* Gig Info Card - Enhanced */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative group"
              >
                {/* Background glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />

                <Card
                  className={cn(
                    "relative border-2 overflow-hidden transition-all duration-300",
                    "hover:shadow-2xl",
                    isDarkMode
                      ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 hover:border-purple-500/50"
                      : "bg-gradient-to-br from-white via-slate-50 to-white border-slate-200 hover:border-purple-300",
                  )}
                >
                  {/* Animated gradient bar */}
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"
                  />

                  <CardContent className="p-6">
                    {/* Header with Poster Info and Follow Button */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        {/* Poster Avatar with live indicator */}
                        <div className="relative">
                          <FollowButton
                            id={gig.postedBy}
                            showText={true}
                            className="animate-pulse"
                          />
                          <Avatar className="w-14 h-14 border-2 border-white dark:border-slate-700 shadow-xl">
                            <AvatarImage src={gig.poster?.picture} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                              {gig.poster?.firstname?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {/* Online indicator */}
                          <OnlineBadge
                            userId={gig.postedBy}
                            size="sm"
                            showText={false}
                            className="absolute -bottom-1 -right-1"
                          />
                        </div>

                        {/* Poster Info */}
                        <div>
                          <h4
                            className={cn(
                              "font-semibold",
                              isDarkMode ? "text-white" : "text-slate-900",
                            )}
                          >
                            {gig.poster?.firstname} {gig.poster?.lastname}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <TrustStarsDisplay
                              trustStars={
                                gig.poster?.trustStars
                                  ? gig.poster?.trustStars
                                  : 0
                              }
                              size="sm"
                            />
                            {(gig.poster?.verifiedIdentity
                              ? gig.poster?.verifiedIdentity
                              : "") && (
                              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-[10px]">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Sticky Poster Mini Profile (Mobile) */}
                      <div className="sticky top-0 z-40 md:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={poster?.picture} />
                            <AvatarFallback>
                              {poster?.firstname?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {poster?.firstname}
                            </p>
                            <TrustStarsDisplay
                              trustStars={poster?.trustStars || 0}
                              size="sm"
                            />
                          </div>
                        </div>
                        <FollowButton
                          _id={gig.postedBy}
                          showText={false}
                          size="sm"
                        />
                      </div>
                    </div>

                    {/* Gig Title & Stats Row */}
                    <div className="mb-4">
                      <h2
                        className={cn(
                          "text-2xl font-bold mb-2",
                          isDarkMode ? "text-white" : "text-slate-900",
                        )}
                      >
                        {gig.title}
                      </h2>

                      {/* Live Stats Ticker */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Eye className="w-4 h-4 text-blue-400" />
                          <span
                            className={cn(
                              "font-mono",
                              isDarkMode ? "text-slate-300" : "text-slate-600",
                            )}
                          >
                            {gig.viewCount?.length || 0} views
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Heart className="w-4 h-4 text-rose-400" />
                          <span
                            className={cn(
                              "font-mono",
                              isDarkMode ? "text-slate-300" : "text-slate-600",
                            )}
                          >
                            {gig.interestedUsers?.length || 0} interested
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4 text-amber-400" />
                          <span
                            className={cn(
                              "font-mono",
                              isDarkMode ? "text-slate-300" : "text-slate-600",
                            )}
                          >
                            {gig.appliedUsers?.length || 0} applied
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                      <InfoChip
                        icon={MapPin}
                        label="Location"
                        value={gig.location || "Remote"}
                        color="blue"
                        isDarkMode={isDarkMode}
                      />
                      <InfoChip
                        icon={Calendar}
                        label="Date"
                        value={formatDate(gig.date)}
                        color="emerald"
                        isDarkMode={isDarkMode}
                      />
                      <InfoChip
                        icon={Clock}
                        label="Time"
                        value={`${gig.time?.start || "TBD"} - ${gig.time?.end || "TBD"}`}
                        color="amber"
                        isDarkMode={isDarkMode}
                      />
                      <InfoChip
                        icon={DollarSign}
                        label="Budget"
                        value={
                          gig.price
                            ? `${gig.currency || "$"}${gig.price.toLocaleString()}`
                            : "Negotiable"
                        }
                        color="purple"
                        isDarkMode={isDarkMode}
                      />
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                      <h3
                        className={cn(
                          "text-sm font-semibold mb-3 flex items-center gap-2",
                          isDarkMode ? "text-white" : "text-slate-900",
                        )}
                      >
                        <FileText className="w-4 h-4 text-purple-500" />
                        Description
                      </h3>
                      <p
                        className={cn(
                          "text-sm leading-relaxed",
                          isDarkMode ? "text-slate-300" : "text-slate-600",
                        )}
                      >
                        {gig.description}
                      </p>
                    </div>

                    {/* Tags */}
                    {gig.tags && gig.tags.length > 0 && (
                      <div className="mb-6">
                        <h3
                          className={cn(
                            "text-sm font-semibold mb-3",
                            isDarkMode ? "text-white" : "text-slate-900",
                          )}
                        >
                          Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {gig.tags.map((tag: string, i: number) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className={cn(
                                "px-3 py-1 text-xs font-medium",
                                isDarkMode
                                  ? "bg-slate-800 text-slate-300 border-slate-700"
                                  : "bg-slate-100 text-slate-600 border-slate-200",
                              )}
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Requirements */}
                    {gig.requirements && gig.requirements.length > 0 && (
                      <div className="mb-6">
                        <h3
                          className={cn(
                            "text-sm font-semibold mb-3 flex items-center gap-2",
                            isDarkMode ? "text-white" : "text-slate-900",
                          )}
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          Requirements
                        </h3>
                        <ul className="space-y-2">
                          {gig.requirements.map((req: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                                  {i + 1}
                                </span>
                              </div>
                              <span
                                className={cn(
                                  "text-sm",
                                  isDarkMode
                                    ? "text-slate-300"
                                    : "text-slate-600",
                                )}
                              >
                                {req}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {/* Floating Action Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl flex items-center justify-center md:hidden"
                      >
                        <MessageSquare className="w-6 h-6" />
                      </motion.button>
                      <Button
                        variant="outline"
                        className="flex-1 border-2 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Similar Gigs Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <h3
                  className={cn(
                    "text-lg font-semibold mb-4",
                    isDarkMode ? "text-white" : "text-slate-900",
                  )}
                >
                  Similar Gigs You Might Like
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredGigs.slice(0, 2).map((similarGig: any) => (
                    <SimilarGigCard
                      key={similarGig._id}
                      gig={similarGig}
                      onView={handleViewGig}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Mobile Stats Bar */}
          <div className="md:hidden mt-4 flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-1.5 text-[10px] shrink-0">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span
                className={isDarkMode ? "text-slate-300" : "text-slate-700"}
              >
                {groupedApplicants?.interested?.length || 0}
              </span>
              <span
                className={isDarkMode ? "text-slate-500" : "text-slate-400"}
              >
                Interested
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] shrink-0">
              <Briefcase className="w-3.5 h-3.5 text-amber-500" />
              <span
                className={isDarkMode ? "text-slate-300" : "text-slate-700"}
              >
                {groupedApplicants?.applied?.length || 0}
              </span>
              <span
                className={isDarkMode ? "text-slate-500" : "text-slate-400"}
              >
                Applied
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] shrink-0">
              <Star className="w-3.5 h-3.5 text-emerald-500" />
              <span
                className={isDarkMode ? "text-slate-300" : "text-slate-700"}
              >
                {groupedApplicants?.shortlisted?.length || 0}
              </span>
              <span
                className={isDarkMode ? "text-slate-500" : "text-slate-400"}
              >
                Shortlisted
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] shrink-0">
              <CheckCircle className="w-3.5 h-3.5 text-purple-500" />
              <span
                className={isDarkMode ? "text-slate-300" : "text-slate-700"}
              >
                {groupedApplicants?.booked?.length || 0}
              </span>
              <span
                className={isDarkMode ? "text-slate-500" : "text-slate-400"}
              >
                Booked
              </span>
            </div>
          </div>

          {/* Bottom Action Bar - Mobile */}
          <div
            className={cn(
              "fixed bottom-0 left-0 right-0 z-30 md:hidden",
              "backdrop-blur-xl border-t",
              isDarkMode
                ? "bg-slate-900/80 border-slate-800/50"
                : "bg-white/80 border-slate-200/50",
            )}
          >
            <div className="flex items-center justify-around p-3">
              <button
                onClick={() => setShowApplicantSidebar(true)}
                className="flex flex-col items-center gap-1"
              >
                <Activity className="w-5 h-5" />
                <span className="text-[10px]">Activity</span>
              </button>
              {gig.bandCategory && gig.bandCategory.length > 0 && (
                <button
                  onClick={() => setShowRoleDrawer(true)}
                  className="flex flex-col items-center gap-1"
                >
                  <Music className="w-5 h-5" />
                  <span className="text-[10px]">Roles</span>
                </button>
              )}
              {canWithdraw && (
                <button
                  onClick={() => setShowWithdrawDialog(true)}
                  className="flex flex-col items-center gap-1 text-rose-500"
                >
                  <XCircle className="w-5 h-5" />
                  <span className="text-[10px]">Withdraw</span>
                </button>
              )}
              <button className="flex flex-col items-center gap-1">
                <Share2 className="w-5 h-5" />
                <span className="text-[10px]">Share</span>
              </button>
            </div>
          </div>

          {/* Mobile Platform Activity Drawer */}
          <AnimatePresence>
            {showApplicantSidebar && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowApplicantSidebar(false)}
                  className="fixed inset-0 bg-black/40 z-40 md:hidden"
                />
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 25 }}
                  className={cn(
                    "fixed left-0 top-0 bottom-0 w-[85%] max-w-sm z-50 md:hidden",
                    "backdrop-blur-xl border-r",
                    isDarkMode
                      ? "bg-slate-900/95 border-slate-800/50"
                      : "bg-white/95 border-slate-200/50",
                  )}
                >
                  <div className="p-4 h-full overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3
                        className={cn(
                          "font-semibold text-[11px]",
                          isDarkMode ? "text-white" : "text-slate-900",
                        )}
                      >
                        Platform Activity
                      </h3>
                      <button
                        onClick={() => setShowApplicantSidebar(false)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {allGigsLoading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* TOP - Gig Tabs (Platform Activity) */}
                        <PlatformActivitySidebar
                          allGigs={allGigsData}
                          currentGigId={gigId as Id<"gigs">}
                          isDarkMode={isDarkMode}
                          onViewGig={handleViewGig}
                        />

                        {/* BOTTOM - Coming Soon Gigs */}
                        <ComingSoonGigs
                          allGigs={allGigsData}
                          currentGigId={gigId as Id<"gigs">}
                          isDarkMode={isDarkMode}
                          onViewGig={handleViewGig}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Role Drawer - Mobile */}
          <AnimatePresence>
            {showRoleDrawer && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowRoleDrawer(false)}
                  className="fixed inset-0 bg-black/40 z-40 md:hidden"
                />
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25 }}
                  className={cn(
                    "fixed left-0 right-0 bottom-0 z-50 md:hidden",
                    "backdrop-blur-xl border-t rounded-t-3xl",
                    isDarkMode
                      ? "bg-slate-900/95 border-slate-800/50"
                      : "bg-white/95 border-slate-200/50",
                  )}
                >
                  <div className="p-4 max-h-[80vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3
                        className={cn(
                          "font-semibold text-[11px]",
                          isDarkMode ? "text-white" : "text-slate-900",
                        )}
                      >
                        Band Roles
                      </h3>
                      <button
                        onClick={() => setShowRoleDrawer(false)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {gig.bandCategory && gig.bandCategory.length > 0 ? (
                      <div className="space-y-3">
                        {gig.bandCategory.map((role, index) => (
                          <RoleCard
                            key={index}
                            role={role}
                            index={index}
                            isDarkMode={isDarkMode}
                            currentUser={currentUser}
                            onApply={() => {
                              // Handle role application
                              setShowRoleDrawer(false);
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-slate-500 py-8 text-[11px]">
                        No band roles available
                      </p>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Add bottom padding for mobile nav */}
          <div className="h-16 md:hidden" />
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

                <div className="space-y-4 py-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-16 h-16 border-2 border-slate-200 dark:border-slate-700">
                      <AvatarImage src={selectedUser.picture} />
                      <AvatarFallback
                        className={cn(
                          "bg-gradient-to-br from-slate-700 to-slate-800 text-white text-xl",
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
                          "font-semibold text-lg",
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
                          "text-base font-semibold",
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
                          "text-base font-semibold",
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
                          "text-base font-semibold",
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
                          "flex items-center gap-2 text-[11px]",
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
                          "flex items-center gap-2 text-[11px]",
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
                          "flex items-center gap-2 text-[11px]",
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
                      className="flex-1 text-[11px]"
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
              "sm:max-w-md",
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
                Are you sure you want to withdraw your application?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
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
                className={cn(
                  isDarkMode
                    ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                    : "",
                )}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleWithdraw}
                disabled={loading}
                className="text-[11px]"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Withdraw
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
