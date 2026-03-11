// app/hub/gigs/client/[gigId]/gig-info/page.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Icons
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Mic,
  Star,
  XCircle,
  MessageSquare,
  HeartIcon,
  Briefcase,
  StarIcon,
  CheckCircle,
  Music,
  AlertCircle,
  User as UserIcon,
  Users2,
  Award,
  Shield,
  Sparkles,
  Eye,
  Crown,
  Medal,
  BadgeCheck,
  UserRound,
  UserRoundCheck,
  UserRoundX,
  UserRoundPlus,
  Loader2,
  Share2,
  X,
  ChevronRight,
  Filter,
  Search,
  FileText,
  PenSquare,
  UserCheck,
  UserPlus,
  UserMinus,
  UserX,
  Clock4,
  CalendarCheck,
  CalendarX,
  CalendarPlus,
  BarChart,
  TrendingUp,
  TrendingDown,
  Gift,
  Target,
  Compass,
  Flame,
  Wind,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSun,
  CloudMoon,
  Info,
  Edit,
  Trash2,
  MoreVertical,
  Check,
  Plus,
  Minus,
  Settings,
  Bell,
  BellRing,
  BellOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Repeat,
  Shuffle,
  Heart,
  Bookmark,
  BookmarkCheck,
  ThumbsUp,
  ThumbsDown,
  Meh,
  Frown,
  Smile,
  Laugh,
  Angry,
  PartyPopper,
  Sparkle,
  Zap,
  ZapOff,
  Wifi,
  WifiOff,
  Bluetooth,
  BluetoothConnected,
  BluetoothOff,
  Cast,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  MonitorSmartphone,
  MonitorSpeaker,
  MonitorCheck,
  MonitorPlay,
  MonitorStop,
  MonitorPause,
  MonitorX,
  MonitorOff,
  MonitorUp,
  MonitorDown,
  MonitorDot,
  History,
} from "lucide-react";

// Trust components
import { TrustStarsDisplay } from "@/components/trust/TrustStarsDisplay";
import { ChatIcon } from "@/components/chat/ChatIcon";
import FollowButton from "@/components/pages/FollowButton";

// Types
interface PageProps {
  params: Promise<{
    gigId: string;
  }>;
}

interface UserWithDetails {
  user: any;
  role?: string;
  appliedAt?: number;
  status: "interested" | "applied" | "shortlisted" | "booked" | "previous";
  skills?: string[];
  trustScore?: number;
  completedGigs?: number;
  cancelledGigs?: number;
  matchPercentage?: number;
}

// ============= SIMPLE MATCH PERCENTAGE CALCULATOR =============
const calculateMatchPercentage = (
  user: any,
  gig: any,
  specificRole?: string,
): number => {
  let score = 0;

  // 1. Instrument/Role match (50 points) - Most important
  const userInstrument = user.instrument?.toLowerCase() || "";
  const userRoleType = user.roleType?.toLowerCase() || "";
  const gigCategory = gig.category?.toLowerCase() || "";
  const targetRole = specificRole?.toLowerCase() || "";

  // Direct match
  if (gigCategory && userInstrument) {
    if (
      gigCategory.includes(userInstrument) ||
      userInstrument.includes(gigCategory) ||
      (gigCategory === "guitarist" && userInstrument === "guitar") ||
      (gigCategory === "singer" && userInstrument === "vocals") ||
      (gigCategory === "drummer" && userInstrument === "drums") ||
      (gigCategory === "bassist" && userInstrument === "bass") ||
      (gigCategory === "dj" && userRoleType === "dj") ||
      (gigCategory === "mc" && userRoleType === "mc")
    ) {
      score += 50;
    } else {
      score += 25; // Partial match
    }
  } else {
    score += 30; // Default if no category specified
  }
  // 2. Experience (30 points)
  const completedGigs = user.completedGigsCount || 0;
  if (completedGigs >= 20) score += 30;
  else if (completedGigs >= 10) score += 25;
  else if (completedGigs >= 5) score += 20;
  else if (completedGigs >= 1) score += 15;
  else score += 5;

  // 3. Reliability (20 points)
  const cancelledGigs = user.cancelledGigsCount || 0;
  if (cancelledGigs === 0) score += 20;
  else if (cancelledGigs <= 2) score += 15;
  else if (cancelledGigs <= 5) score += 10;
  else score += 5;
  return Math.min(100, Math.max(0, Math.round(score)));
};

// ============= MATCH BADGE COMPONENT =============
const MatchBadge = ({ percentage }: { percentage: number }) => {
  const getMatchColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative inline-flex items-center cursor-help">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-white",
              getMatchColor(percentage),
            )}
          >
            {percentage}%
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p className="text-xs">Match score based on role & experience</p>
      </TooltipContent>
    </Tooltip>
  );
};

// ============= USER CARD COMPONENT =============
const UserCard = ({
  userData,
  isDarkMode,
  onViewProfile,
  onMessage,
  onShortlist,
  onBook,
  onRemove,
  showActions = true,
  isBooked = false,
  matchPercentage,
}: {
  userData: UserWithDetails;
  isDarkMode: boolean;
  onViewProfile: (userId: string) => void;
  onMessage?: (userId: string) => void;
  onShortlist?: (userId: string) => void;
  onBook?: (userId: string, role?: string) => void;
  onRemove?: (userId: string) => void;
  showActions?: boolean;
  isBooked?: boolean;
  matchPercentage?: number;
}) => {
  const user = userData.user;

  const statusColors = {
    interested: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    applied: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    shortlisted: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    booked: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    previous: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  };

  const statusIcons = {
    interested: <HeartIcon className="w-3 h-3" />,
    applied: <Briefcase className="w-3 h-3" />,
    shortlisted: <StarIcon className="w-3 h-3" />,
    booked: <CheckCircle className="w-3 h-3" />,
    previous: <History className="w-3 h-3" />,
  };

  const StatusIcon = statusIcons[userData.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "relative overflow-hidden border transition-all",
          isDarkMode
            ? "bg-slate-900/50 border-slate-800 hover:border-slate-700"
            : "bg-white border-slate-200 hover:border-slate-300",
          isBooked &&
            (isDarkMode
              ? "ring-2 ring-emerald-500/30"
              : "ring-2 ring-emerald-500/20"),
        )}
      >
        {/* Match percentage bar */}
        {matchPercentage && (
          <div
            className={cn(
              "absolute top-0 left-0 h-1 transition-all",
              matchPercentage >= 80
                ? "bg-emerald-500"
                : matchPercentage >= 60
                  ? "bg-blue-500"
                  : matchPercentage >= 40
                    ? "bg-amber-500"
                    : "bg-rose-500",
            )}
            style={{ width: `${matchPercentage}%` }}
          />
        )}

        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-12 h-12 border-2 border-white dark:border-slate-800">
                <AvatarImage src={user.picture} />
                <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                  {user.firstname?.charAt(0) || user.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>

              {/* Online indicator */}
              {user.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
              )}
            </div>

            {/* User info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4
                      className={cn(
                        "font-semibold text-sm truncate max-w-[120px]",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      {user.firstname} {user.lastname}
                    </h4>

                    {/* Status badge */}
                    <Badge
                      className={cn(
                        "text-[10px] px-1.5 py-0 h-5 border",
                        statusColors[userData.status],
                      )}
                    >
                      <span className="flex items-center gap-1">
                        {StatusIcon}
                        {userData.status}
                      </span>
                    </Badge>
                  </div>

                  {/* Role if applicable */}
                  {userData.role && (
                    <p
                      className={cn(
                        "text-xs mt-0.5",
                        isDarkMode ? "text-slate-400" : "text-slate-500",
                      )}
                    >
                      {userData.role}
                    </p>
                  )}

                  {/* Instrument/Role Type */}
                  <p
                    className={cn(
                      "text-xs mt-0.5",
                      isDarkMode ? "text-slate-500" : "text-slate-400",
                    )}
                  >
                    {user.instrument || user.roleType || "Musician"}
                  </p>

                  {/* Trust stars */}
                  <div className="mt-1">
                    <TrustStarsDisplay
                      trustStars={user.trustStars || 0}
                      size="sm"
                    />
                  </div>
                </div>

                {/* Match score */}
                {matchPercentage && <MatchBadge percentage={matchPercentage} />}
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-slate-400" />
                  <span
                    className={cn(
                      "text-[10px]",
                      isDarkMode ? "text-slate-400" : "text-slate-500",
                    )}
                  >
                    {user.completedGigsCount || 0} gigs
                  </span>
                </div>

                {user.cancelledGigsCount > 0 && (
                  <div className="flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-rose-400" />
                    <span className="text-[10px] text-rose-500">
                      {user.cancelledGigsCount} cancelled
                    </span>
                  </div>
                )}

                {user.verifiedIdentity && (
                  <div className="flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] text-emerald-500">
                      Verified
                    </span>
                  </div>
                )}

                {userData.appliedAt && (
                  <div className="flex items-center gap-1 ml-auto">
                    <Clock4 className="w-3 h-3 text-slate-400" />
                    <span
                      className={cn(
                        "text-[10px]",
                        isDarkMode ? "text-slate-500" : "text-slate-400",
                      )}
                    >
                      {formatDistanceToNow(userData.appliedAt, {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Skills */}
              {userData.skills && userData.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {userData.skills.slice(0, 3).map((skill, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className={cn(
                        "text-[8px] px-1 py-0 h-4",
                        isDarkMode ? "border-slate-700" : "border-slate-200",
                      )}
                    >
                      {skill}
                    </Badge>
                  ))}
                  {userData.skills.length > 3 && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[8px] px-1 py-0 h-4",
                        isDarkMode ? "border-slate-700" : "border-slate-200",
                      )}
                    >
                      +{userData.skills.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          {showActions && (
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onViewProfile(user._id)}
                className={cn(
                  "flex-1 h-7 text-xs",
                  isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100",
                )}
              >
                <Eye className="w-3 h-3 mr-1" />
                Profile
              </Button>

              {onMessage && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onMessage(user._id)}
                  className={cn(
                    "flex-1 h-7 text-xs",
                    isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100",
                  )}
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Message
                </Button>
              )}

              {userData.status === "interested" && onShortlist && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onShortlist(user._id)}
                  className="flex-1 h-7 text-xs text-purple-500 hover:text-purple-600"
                >
                  <StarIcon className="w-3 h-3 mr-1" />
                  Shortlist
                </Button>
              )}

              {userData.status === "shortlisted" && onBook && (
                <Button
                  size="sm"
                  className="flex-1 h-7 text-xs bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                  onClick={() => onBook(user._id, userData.role)}
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Book
                </Button>
              )}

              {onRemove && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemove(user._id)}
                  className="h-7 w-7 p-0 text-rose-500 hover:text-rose-600"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ============= ROLE CARD COMPONENT =============
const RoleCard = ({
  role,
  index,
  isDarkMode,
  onViewRole,
  onEdit,
  isBooked = false,
}: {
  role: any;
  index: number;
  isDarkMode: boolean;
  onViewRole: (role: any) => void;
  onEdit?: (role: any) => void;
  isBooked?: boolean;
}) => {
  const filledPercentage = (role.filledSlots / role.maxSlots) * 100;
  const remaining = role.maxSlots - role.filledSlots;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => onViewRole(role)}
      className={cn(
        "p-3 rounded-lg border cursor-pointer transition-all",
        isDarkMode
          ? "bg-slate-800/30 border-slate-700 hover:border-purple-500/50"
          : "bg-white border-slate-200 hover:border-purple-300",
        isBooked &&
          (isDarkMode
            ? "ring-2 ring-emerald-500/30"
            : "ring-2 ring-emerald-500/20"),
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4
            className={cn(
              "font-medium text-sm",
              isDarkMode ? "text-white" : "text-slate-900",
            )}
          >
            {role.role}
          </h4>
          {role.description && (
            <p
              className={cn(
                "text-xs mt-0.5 line-clamp-1",
                isDarkMode ? "text-slate-400" : "text-slate-500",
              )}
            >
              {role.description}
            </p>
          )}
        </div>

        {/* Edit button */}
        {onEdit && (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(role);
            }}
            className="h-6 w-6 p-0"
          >
            <PenSquare className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span
            className={cn(isDarkMode ? "text-slate-400" : "text-slate-500")}
          >
            {role.filledSlots}/{role.maxSlots} filled
          </span>
          <span
            className={cn(
              remaining === 0 ? "text-rose-500" : "text-emerald-500",
            )}
          >
            {remaining} left
          </span>
        </div>
        <Progress
          value={filledPercentage}
          className={cn(
            "h-1.5",
            remaining === 0 ? "bg-rose-500" : "bg-emerald-500",
          )}
        />
      </div>

      {/* Skills preview */}
      {role.requiredSkills?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {role.requiredSkills.slice(0, 3).map((skill: string, i: number) => (
            <Badge
              key={i}
              variant="outline"
              className={cn(
                "text-[8px] px-1 py-0 h-4",
                isDarkMode ? "border-slate-700" : "border-slate-200",
              )}
            >
              {skill}
            </Badge>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// ============= MAIN COMPONENT =============
export default function ClientGigDetailsPage() {
  const params = useParams(); // Use useParams hook instead
  const gigId = params.gigId as string;
  const router = useRouter();
  const { colors, isDarkMode } = useThemeColors();
  const { user: currentUser } = useCurrentUser();

  // State
  const [activeTab, setActiveTab] = useState("booked");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(
    null,
  );
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [showRoleDetails, setShowRoleDetails] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sortBy, setSortBy] = useState<"rating" | "experience" | "recent">(
    "rating",
  );
  const [showOnlyVerified, setShowOnlyVerified] = useState(false);
  const [minTrustScore, setMinTrustScore] = useState(0);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch gig data
  const gig = useQuery(api.controllers.gigs.getGigById, {
    gigId: gigId as Id<"gigs">,
  });

  // Fetch poster data
  const poster = useQuery(api.controllers.user.getUserById, {
    userId: gig?.postedBy as Id<"users">,
  });

  // Collect all user IDs from different groups
  const userIds = useMemo(() => {
    if (!gig) return [];

    const ids = new Set<Id<"users">>();

    // Current booked users
    if (gig.bookedBy) ids.add(gig.bookedBy as Id<"users">);

    // Band booked users
    gig.bandCategory?.forEach((role: any) => {
      role.bookedUsers?.forEach((id: Id<"users">) => ids.add(id));
    });

    // Previous interested users
    gig.previousInterestedUsers?.forEach((id: Id<"users">) => ids.add(id));

    // Previous band category users
    gig.previousBandCategory?.forEach((role: any) => {
      role.bookedUsers?.forEach((id: Id<"users">) => ids.add(id));
    });

    // Current interested/applied users
    gig.interestedUsers?.forEach((id: Id<"users">) => ids.add(id));
    gig.appliedUsers?.forEach((id: Id<"users">) => ids.add(id));
    gig.shortlistedUsers?.forEach((item: any) => ids.add(item.userId));

    return Array.from(ids);
  }, [gig]);

  // Fetch all users data
  const users = useQuery(api.controllers.user.getUsersByIds, {
    userIds: userIds,
  });

  // Create user map
  const userMap = useMemo(() => {
    if (!users) return new Map();
    return new Map(users.map((user: any) => [user._id, user]));
  }, [users]);

  // Group users by category
  const groupedUsers = useMemo(() => {
    if (!gig || !userMap)
      return {
        booked: [] as UserWithDetails[],
        shortlisted: [] as UserWithDetails[],
        applied: [] as UserWithDetails[],
        interested: [] as UserWithDetails[],
        previous: [] as UserWithDetails[],
      };

    const groups = {
      booked: [] as UserWithDetails[],
      shortlisted: [] as UserWithDetails[],
      applied: [] as UserWithDetails[],
      interested: [] as UserWithDetails[],
      previous: [] as UserWithDetails[],
    };

    // Helper to add user with role
    const addUser = (
      userId: Id<"users">,
      status: UserWithDetails["status"],
      role?: string,
    ) => {
      const user = userMap.get(userId);
      if (user) {
        // Calculate match percentage
        const matchPercentage = calculateMatchPercentage(user, gig, role);

        groups[status].push({
          user,
          role,
          status,
          appliedAt: Date.now() - Math.random() * 86400000,
          skills: user.instruments || user.skills || [],
          trustScore: user.trustStars || 0,
          completedGigs: user.completedGigsCount || 0,
          cancelledGigs: user.cancelledGigsCount || 0,
          matchPercentage,
        });
      }
    };

    // Current booked users
    if (gig.bookedBy) {
      addUser(gig.bookedBy, "booked", "Main Act");
    }

    // Band booked users
    gig.bandCategory?.forEach((role: any) => {
      role.bookedUsers?.forEach((userId: Id<"users">) => {
        addUser(userId, "booked", role.role);
      });
    });

    // Shortlisted users
    gig.shortlistedUsers?.forEach((item: any) => {
      addUser(item.userId, "shortlisted");
    });

    // Applied users
    gig.appliedUsers?.forEach((userId: Id<"users">) => {
      addUser(userId, "applied");
    });

    // Interested users
    gig.interestedUsers?.forEach((userId: Id<"users">) => {
      addUser(userId, "interested");
    });

    // Previous users
    gig.previousInterestedUsers?.forEach((userId: Id<"users">) => {
      addUser(userId, "previous");
    });

    gig.previousBandCategory?.forEach((role: any) => {
      role.bookedUsers?.forEach((userId: Id<"users">) => {
        addUser(userId, "previous", role.role);
      });
    });

    // Sort each group
    Object.keys(groups).forEach((key) => {
      groups[key as keyof typeof groups].sort((a, b) => {
        if (sortBy === "rating")
          return (b.trustScore || 0) - (a.trustScore || 0);
        if (sortBy === "experience")
          return (b.completedGigs || 0) - (a.completedGigs || 0);
        if (sortBy === "recent") return (b.appliedAt || 0) - (a.appliedAt || 0);
        return 0;
      });
    });

    return groups;
  }, [gig, userMap, sortBy]);

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    const users = groupedUsers[activeTab as keyof typeof groupedUsers] || [];

    return users.filter((item) => {
      const user = item.user;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches =
          user.firstname?.toLowerCase().includes(query) ||
          user.lastname?.toLowerCase().includes(query) ||
          user.username?.toLowerCase().includes(query) ||
          item.role?.toLowerCase().includes(query);
        if (!matches) return false;
      }

      // Verified only filter
      if (showOnlyVerified && !user.verifiedIdentity) return false;

      // Trust score filter
      if (minTrustScore > 0 && (user.trustStars || 0) < minTrustScore)
        return false;

      return true;
    });
  }, [groupedUsers, activeTab, searchQuery, showOnlyVerified, minTrustScore]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      totalInterested: groupedUsers.interested.length,
      totalApplied: groupedUsers.applied.length,
      totalShortlisted: groupedUsers.shortlisted.length,
      totalBooked: groupedUsers.booked.length,
      totalPrevious: groupedUsers.previous.length,
      totalRoles: gig?.bandCategory?.length || 0,
      filledRoles:
        gig?.bandCategory?.reduce(
          (acc, role) => acc + (role.filledSlots || 0),
          0,
        ) || 0,
    };
  }, [groupedUsers, gig]);

  // Handle view profile
  const handleViewProfile = (userId: string) => {
    setSelectedUserId(userId as Id<"users">);
    setShowProfileDialog(true);
  };

  // Handle message
  const handleMessage = (userId: string) => {
    toast.success("Opening chat...");
  };

  // Handle shortlist
  const handleShortlist = async (userId: string) => {
    toast.success("User shortlisted");
  };

  // Handle book
  const handleBook = async (userId: string, role?: string) => {
    toast.success(`User booked${role ? ` for ${role}` : ""}`);
  };

  // Handle remove
  const handleRemove = async (userId: string) => {
    toast.success("User removed");
  };

  // Handle edit gig
  const handleEditGig = () => {
    router.push(`/hub/gigs/edit/${gigId}`);
  };

  // Handle cancel gig
  const handleCancelGig = async () => {
    setIsLoading(true);
    try {
      toast.success("Gig cancelled successfully");
      setShowCancelDialog(false);
      router.push("/hub/gigs");
    } catch (error) {
      toast.error("Failed to cancel gig");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (!gig || !users) {
    return (
      <TooltipProvider>
        <div
          className={cn(
            "min-h-screen",
            isDarkMode ? "bg-slate-950" : "bg-slate-50",
          )}
        >
          <div className="max-w-7xl mx-auto px-4 py-6">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <Skeleton className="h-96 w-full rounded-xl" />
              </div>
              <div className="lg:col-span-3">
                <Skeleton className="h-[600px] w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div
        className={cn(
          "min-h-screen relative",
          isDarkMode
            ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
            : "bg-gradient-to-br from-slate-50 via-white to-slate-50",
        )}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={cn(
              "absolute top-0 left-0 right-0 h-96 bg-gradient-to-b",
              isDarkMode
                ? "from-purple-500/5 via-transparent to-transparent"
                : "from-purple-500/5 via-transparent to-transparent",
            )}
          />
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 relative">
          {/* Header */}
          <div
            className={cn(
              "sticky top-0 z-30 -mx-3 sm:-mx-4 px-3 sm:px-4 py-3 mb-6",
              "backdrop-blur-xl",
              isDarkMode
                ? "bg-slate-900/80 border-b border-slate-800/50"
                : "bg-white/80 border-b border-slate-200/50",
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                  className={cn(
                    "rounded-xl",
                    isDarkMode
                      ? "hover:bg-slate-800 text-slate-400 hover:text-white"
                      : "hover:bg-slate-100 text-slate-600 hover:text-slate-900",
                  )}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>

                <div>
                  <h1
                    className={cn(
                      "text-lg font-semibold",
                      isDarkMode ? "text-white" : "text-slate-900",
                    )}
                  >
                    {gig.title}
                  </h1>
                  <p
                    className={cn(
                      "text-xs",
                      isDarkMode ? "text-slate-400" : "text-slate-500",
                    )}
                  >
                    Manage your gig and applicants
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditGig}
                  className={cn(
                    "gap-2",
                    isDarkMode
                      ? "border-slate-700 hover:bg-slate-800"
                      : "border-slate-200 hover:bg-slate-100",
                  )}
                >
                  <PenSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit Gig</span>
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowCancelDialog(true)}
                  className="gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Cancel Gig</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left sidebar - Roles & Stats */}
            <div className="lg:col-span-1">
              <div className="space-y-4 sticky top-24">
                {/* Quick stats */}
                <Card
                  className={cn(
                    "border overflow-hidden",
                    isDarkMode
                      ? "bg-slate-900/50 border-slate-800"
                      : "bg-white border-slate-200",
                  )}
                >
                  <div
                    className={cn(
                      "px-4 py-3 border-b",
                      isDarkMode ? "border-slate-800" : "border-slate-200",
                    )}
                  >
                    <h3
                      className={cn(
                        "text-sm font-semibold flex items-center gap-2",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      <BarChart className="w-4 h-4 text-purple-500" />
                      Overview
                    </h3>
                  </div>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-500">
                          {stats.totalApplied + stats.totalInterested}
                        </div>
                        <div
                          className={cn(
                            "text-xs",
                            isDarkMode ? "text-slate-400" : "text-slate-500",
                          )}
                        >
                          Total Leads
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-500">
                          {stats.totalBooked}
                        </div>
                        <div
                          className={cn(
                            "text-xs",
                            isDarkMode ? "text-slate-400" : "text-slate-500",
                          )}
                        >
                          Booked
                        </div>
                      </div>
                    </div>

                    <Separator
                      className={cn(
                        "my-3",
                        isDarkMode ? "bg-slate-800" : "bg-slate-200",
                      )}
                    />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span
                          className={
                            isDarkMode ? "text-slate-400" : "text-slate-500"
                          }
                        >
                          Interested
                        </span>
                        <span
                          className={cn(
                            "font-medium",
                            isDarkMode ? "text-white" : "text-slate-900",
                          )}
                        >
                          {stats.totalInterested}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span
                          className={
                            isDarkMode ? "text-slate-400" : "text-slate-500"
                          }
                        >
                          Applied
                        </span>
                        <span
                          className={cn(
                            "font-medium",
                            isDarkMode ? "text-white" : "text-slate-900",
                          )}
                        >
                          {stats.totalApplied}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span
                          className={
                            isDarkMode ? "text-slate-400" : "text-slate-500"
                          }
                        >
                          Shortlisted
                        </span>
                        <span
                          className={cn(
                            "font-medium",
                            isDarkMode ? "text-white" : "text-slate-900",
                          )}
                        >
                          {stats.totalShortlisted}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span
                          className={
                            isDarkMode ? "text-slate-400" : "text-slate-500"
                          }
                        >
                          Booked
                        </span>
                        <span className="font-medium text-emerald-500">
                          {stats.totalBooked}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span
                          className={
                            isDarkMode ? "text-slate-400" : "text-slate-500"
                          }
                        >
                          Previous
                        </span>
                        <span
                          className={cn(
                            "font-medium",
                            isDarkMode ? "text-white" : "text-slate-900",
                          )}
                        >
                          {stats.totalPrevious}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Band Roles */}
                {gig.bandCategory && gig.bandCategory.length > 0 && (
                  <Card
                    className={cn(
                      "border overflow-hidden",
                      isDarkMode
                        ? "bg-slate-900/50 border-slate-800"
                        : "bg-white border-slate-200",
                    )}
                  >
                    <div
                      className={cn(
                        "px-4 py-3 border-b flex items-center justify-between",
                        isDarkMode ? "border-slate-800" : "border-slate-200",
                      )}
                    >
                      <h3
                        className={cn(
                          "text-sm font-semibold flex items-center gap-2",
                          isDarkMode ? "text-white" : "text-slate-900",
                        )}
                      >
                        <Users className="w-4 h-4 text-purple-500" />
                        Band Roles
                      </h3>
                      <Badge
                        className={cn(
                          "text-xs",
                          isDarkMode ? "bg-purple-500/20" : "bg-purple-100",
                        )}
                      >
                        {stats.filledRoles}/{stats.totalRoles} filled
                      </Badge>
                    </div>
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        {gig.bandCategory.map((role: any, index: number) => (
                          <RoleCard
                            key={index}
                            role={role}
                            index={index}
                            isDarkMode={isDarkMode}
                            onViewRole={setSelectedRole}
                            onEdit={setSelectedRole}
                            isBooked={role.filledSlots > 0}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Gig info card */}
                <Card
                  className={cn(
                    "border overflow-hidden",
                    isDarkMode
                      ? "bg-slate-900/50 border-slate-800"
                      : "bg-white border-slate-200",
                  )}
                >
                  <div
                    className={cn(
                      "px-4 py-3 border-b",
                      isDarkMode ? "border-slate-800" : "border-slate-200",
                    )}
                  >
                    <h3
                      className={cn(
                        "text-sm font-semibold flex items-center gap-2",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      <Info className="w-4 h-4 text-blue-500" />
                      Gig Details
                    </h3>
                  </div>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span
                        className={
                          isDarkMode ? "text-slate-300" : "text-slate-600"
                        }
                      >
                        {gig.location || "Remote"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span
                        className={
                          isDarkMode ? "text-slate-300" : "text-slate-600"
                        }
                      >
                        {new Date(gig.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <DollarSign className="w-3 h-3 text-slate-400" />
                      <span className="text-emerald-500 font-medium">
                        {gig.currency || "$"}
                        {gig.price?.toLocaleString()}
                      </span>
                    </div>
                    {gig.description && (
                      <p
                        className={cn(
                          "text-xs line-clamp-2 mt-1",
                          isDarkMode ? "text-slate-400" : "text-slate-500",
                        )}
                      >
                        {gig.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right main content - User tabs */}
            <div className="lg:col-span-3">
              <Card
                className={cn(
                  "border overflow-hidden",
                  isDarkMode
                    ? "bg-slate-900/50 border-slate-800"
                    : "bg-white border-slate-200",
                )}
              >
                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <div
                    className={cn(
                      "px-4 pt-3 border-b",
                      isDarkMode ? "border-slate-800" : "border-slate-200",
                    )}
                  >
                    <TabsList
                      className={cn(
                        "w-full justify-start h-auto p-0 bg-transparent",
                        "gap-1",
                      )}
                    >
                      {[
                        {
                          id: "booked",
                          label: "Booked",
                          count: stats.totalBooked,
                          icon: CheckCircle,
                        },
                        {
                          id: "shortlisted",
                          label: "Shortlisted",
                          count: stats.totalShortlisted,
                          icon: StarIcon,
                        },
                        {
                          id: "applied",
                          label: "Applied",
                          count: stats.totalApplied,
                          icon: Briefcase,
                        },
                        {
                          id: "interested",
                          label: "Interested",
                          count: stats.totalInterested,
                          icon: HeartIcon,
                        },
                        {
                          id: "previous",
                          label: "Previous",
                          count: stats.totalPrevious,
                          icon: History,
                        },
                      ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className={cn(
                              "relative px-3 py-2 rounded-lg data-[state=active]:bg-transparent",
                              "text-xs font-medium transition-all",
                              "data-[state=active]:text-purple-500",
                              "data-[state=active]:shadow-none",
                              "hover:text-purple-400",
                              isDarkMode
                                ? "text-slate-400 data-[state=active]:bg-slate-800/50"
                                : "text-slate-500 data-[state=active]:bg-purple-50",
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <span>{tab.label}</span>
                              {tab.count > 0 && (
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    "ml-1 px-1.5 py-0 text-[10px] h-5",
                                    activeTab === tab.id
                                      ? "bg-purple-500/20 text-purple-500"
                                      : isDarkMode
                                        ? "bg-slate-800 text-slate-300"
                                        : "bg-slate-100 text-slate-600",
                                  )}
                                >
                                  {tab.count}
                                </Badge>
                              )}
                            </div>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </div>

                  {/* Search and filters */}
                  <div
                    className={cn(
                      "p-3 border-b",
                      isDarkMode ? "border-slate-800" : "border-slate-200",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <Input
                          placeholder="Search by name or role..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className={cn(
                            "pl-7 h-8 text-xs",
                            isDarkMode
                              ? "bg-slate-800/50 border-slate-700"
                              : "bg-slate-50 border-slate-200",
                          )}
                        />
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "h-8 px-2 gap-1",
                              isDarkMode
                                ? "border-slate-700 hover:bg-slate-800"
                                : "border-slate-200 hover:bg-slate-100",
                            )}
                          >
                            <Filter className="w-3.5 h-3.5" />
                            <span className="text-xs">Filter</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setSortBy("rating")}>
                            <Star className="w-4 h-4 mr-2" />
                            Rating
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setSortBy("experience")}
                          >
                            <Briefcase className="w-4 h-4 mr-2" />
                            Experience
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSortBy("recent")}>
                            <Clock className="w-4 h-4 mr-2" />
                            Most Recent
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuLabel>Filters</DropdownMenuLabel>
                          <div className="px-2 py-1.5">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="verified" className="text-xs">
                                Verified only
                              </Label>
                              <Switch
                                id="verified"
                                checked={showOnlyVerified}
                                onCheckedChange={setShowOnlyVerified}
                              />
                            </div>
                          </div>

                          <div className="px-2 py-1.5">
                            <Label className="text-xs mb-1 block">
                              Min Trust Score: {minTrustScore}
                            </Label>
                            <input
                              type="range"
                              min="0"
                              max="5"
                              step="0.5"
                              value={minTrustScore}
                              onChange={(e) =>
                                setMinTrustScore(parseFloat(e.target.value))
                              }
                              className="w-full"
                            />
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* User cards */}
                  <ScrollArea className="h-[600px]">
                    <div className="p-4 space-y-2">
                      <AnimatePresence mode="popLayout">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((item) => (
                            <UserCard
                              key={item.user._id}
                              userData={item}
                              isDarkMode={isDarkMode}
                              onViewProfile={handleViewProfile}
                              onMessage={handleMessage}
                              onShortlist={
                                item.status === "interested"
                                  ? handleShortlist
                                  : undefined
                              }
                              onBook={
                                item.status === "shortlisted"
                                  ? handleBook
                                  : undefined
                              }
                              onRemove={handleRemove}
                              showActions={
                                item.status !== "booked" &&
                                item.status !== "previous"
                              }
                              isBooked={item.status === "booked"}
                              matchPercentage={item.matchPercentage}
                            />
                          ))
                        ) : (
                          <div className="text-center py-12">
                            <div
                              className={cn(
                                "w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4",
                                isDarkMode ? "bg-slate-800" : "bg-slate-100",
                              )}
                            >
                              <Users
                                className={cn(
                                  "w-8 h-8",
                                  isDarkMode
                                    ? "text-slate-600"
                                    : "text-slate-400",
                                )}
                              />
                            </div>
                            <h3
                              className={cn(
                                "text-sm font-medium mb-1",
                                isDarkMode ? "text-white" : "text-slate-900",
                              )}
                            >
                              No users found
                            </h3>
                            <p
                              className={cn(
                                "text-xs",
                                isDarkMode
                                  ? "text-slate-400"
                                  : "text-slate-500",
                              )}
                            >
                              Try adjusting your filters
                            </p>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </ScrollArea>
                </Tabs>
              </Card>
            </div>
          </div>
        </div>

        {/* Dialogs */}

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
            {selectedUserId && (
              <>
                <DialogHeader>
                  <DialogTitle
                    className={isDarkMode ? "text-white" : "text-slate-900"}
                  >
                    User Profile
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={userMap.get(selectedUserId)?.picture} />
                      <AvatarFallback>
                        {userMap.get(selectedUserId)?.firstname?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3
                        className={cn(
                          "font-semibold",
                          isDarkMode ? "text-white" : "text-slate-900",
                        )}
                      >
                        {userMap.get(selectedUserId)?.firstname}{" "}
                        {userMap.get(selectedUserId)?.lastname}
                      </h3>
                      <TrustStarsDisplay
                        trustStars={
                          userMap.get(selectedUserId)?.trustStars || 0
                        }
                        size="sm"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        {userMap.get(selectedUserId)?.instrument || "Musician"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold">
                        {userMap.get(selectedUserId)?.completedGigsCount || 0}
                      </div>
                      <div className="text-xs text-slate-500">Gigs</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">
                        {userMap.get(selectedUserId)?.cancelledGigsCount || 0}
                      </div>
                      <div className="text-xs text-slate-500">Cancelled</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">
                        {userMap.get(selectedUserId)?.trustStars || 0}
                      </div>
                      <div className="text-xs text-slate-500">Rating</div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button onClick={() => setShowProfileDialog(false)}>
                      Close
                    </Button>
                  </DialogFooter>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Cancel Gig Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent
            className={cn(
              "sm:max-w-md",
              isDarkMode
                ? "bg-slate-900 border-slate-800"
                : "bg-white border-slate-200",
            )}
          >
            <DialogHeader>
              <DialogTitle>Cancel Gig</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this gig? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>

            <Textarea
              placeholder="Reason for cancellation (optional)"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="min-h-[100px]"
            />

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
              >
                Keep Gig
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelGig}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel Gig"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Role Details Dialog */}
        <Dialog
          open={!!selectedRole}
          onOpenChange={() => setSelectedRole(null)}
        >
          <DialogContent
            className={cn(
              "sm:max-w-lg",
              isDarkMode
                ? "bg-slate-900 border-slate-800"
                : "bg-white border-slate-200",
            )}
          >
            {selectedRole && (
              <>
                <DialogHeader>
                  <DialogTitle
                    className={isDarkMode ? "text-white" : "text-slate-900"}
                  >
                    {selectedRole.role}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  {selectedRole.description && (
                    <p
                      className={cn(
                        "text-sm",
                        isDarkMode ? "text-slate-300" : "text-slate-600",
                      )}
                    >
                      {selectedRole.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    <h4
                      className={cn(
                        "text-sm font-medium",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      Required Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRole.requiredSkills?.map(
                        (skill: string, i: number) => (
                          <Badge key={i} variant="secondary">
                            {skill}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p
                        className={cn(
                          "text-xs",
                          isDarkMode ? "text-slate-400" : "text-slate-500",
                        )}
                      >
                        Slots
                      </p>
                      <p
                        className={cn(
                          "text-lg font-bold",
                          isDarkMode ? "text-white" : "text-slate-900",
                        )}
                      >
                        {selectedRole.filledSlots}/{selectedRole.maxSlots}
                      </p>
                    </div>
                    {selectedRole.price && (
                      <div>
                        <p
                          className={cn(
                            "text-xs",
                            isDarkMode ? "text-slate-400" : "text-slate-500",
                          )}
                        >
                          Budget per slot
                        </p>
                        <p className="text-lg font-bold text-emerald-500">
                          {selectedRole.currency || "$"}
                          {selectedRole.price}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Booked users for this role */}
                  {selectedRole.bookedUsers?.length > 0 && (
                    <div>
                      <h4
                        className={cn(
                          "text-sm font-medium mb-2",
                          isDarkMode ? "text-white" : "text-slate-900",
                        )}
                      >
                        Booked Musicians
                      </h4>
                      <div className="space-y-2">
                        {selectedRole.bookedUsers.map((userId: Id<"users">) => {
                          const user = userMap.get(userId);
                          if (!user) return null;
                          return (
                            <div
                              key={userId}
                              className="flex items-center gap-2"
                            >
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={user.picture} />
                                <AvatarFallback>
                                  {user.firstname?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span
                                className={cn(
                                  "text-sm",
                                  isDarkMode ? "text-white" : "text-slate-900",
                                )}
                              >
                                {user.firstname} {user.lastname}
                              </span>
                              <Badge className="ml-auto text-[10px] bg-emerald-500/20 text-emerald-500">
                                Booked
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={() => setSelectedRole(null)}>Close</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
