import React, { useState, useEffect, useCallback, useMemo } from "react"; // Added useMemo
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { motion } from "framer-motion";
import clsx from "clsx";
// Add ChevronRight to the imports
import {
  Users,
  UserCheck,
  UserPlus,
  MapPin,
  Calendar,
  Clock,
  Music,
  Eye,
  Bookmark,
  Heart,
  AlertCircle,
  User,
  Lock,
  CheckCircle,
  Edit,
  MoreVertical,
  Sparkles,
  Users2,
  Building2,
  ChevronRight,
  DollarSign,
  Send,
  Check, // Add this import
  UserX,
  MicOff,
  VolumeX,
  X,
  Volume2,
  Mic,
  XCircle,
} from "lucide-react";

// Convex imports
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Custom hooks
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useThemeColors } from "@/hooks/useTheme";
import { getInterestWindowStatus, UserProfile } from "@/utils";
import { cn } from "@/lib/utils";
import { getUserGigStatus, type GigUserStatus } from "@/utils";
import {
  isUserQualifiedForGig,
  isUserQualifiedForRole,
  userQualifiedRoles,
} from "../../utils";
import { CountdownTimer } from "./CountDown";
import { MdMusicOff } from "react-icons/md";

// Types
interface PerformingMember {
  userId: Id<"users">;
  name: string;
  role: string;
  instrument: string;
}

interface BandApplication {
  bandId: Id<"bands">;
  appliedAt: number;
  appliedBy: Id<"users">;
  performingMembers: PerformingMember[];
  status?: string;
  proposedFee?: number;
  notes?: string;
  bookedAt?: number;
  contractSigned?: boolean;
  agreedFee?: number;
  shortlistedAt?: number;
  shortlistNotes?: string;
}

interface BandRole {
  role: string;
  maxSlots: number;
  filledSlots: number;
  applicants: Id<"users">[];
  bookedUsers: Id<"users">[];
  requiredSkills?: string[];
  description?: string;
  isLocked?: boolean;
  price?: number;
  currency?: string;
  negotiable?: boolean;
  bookedPrice?: number;
}

interface GigCardProps {
  gig: {
    _id: Id<"gigs">;
    title: string;
    description?: string;
    location?: string;
    date: number;
    time: { start: string; end: string };
    price?: number;
    logo: string;
    postedBy: Id<"users">;
    isClientBand?: boolean;
    isTaken?: boolean;
    isPending?: boolean;
    isActive?: boolean;
    interestedUsers?: Id<"users">[];
    bookCount?: BandApplication[];
    maxSlots?: number;
    tags?: string[];
    category?: string;
    bussinesscat?: string;
    negotiable?: boolean;
    paymentStatus?: string;
    viewCount?: Id<"users">[];
    bookingHistory?: any[];
    acceptInterestStartTime?: string | number | Date;
    acceptInterestEndTime?: string | number | Date;
    bandCategory?: BandRole[];
    createdAt: number;
    updatedAt: number;
    font?: string;
    fontColor?: string;
    backgroundColor?: string;
    fontFamily?: string;
  };
  onClick?: () => void;
  showActions?: boolean;
  compact?: boolean;
  userStatus?: GigUserStatus;
  showFullGigs?: boolean; // Add this prop
}

type BandActionType =
  | "leave"
  | "pending"
  | "apply"
  | "full"
  | "withdraw"
  | "review"
  | "manage"
  | "edit";

interface BandAction {
  type: BandActionType;
  label: string;
  variant: "default" | "destructive" | "outline" | "secondary";
  action: (() => Promise<void>) | null;
  disabled: boolean;
  routing: {
    forMusician: string;
    forClient: string;
    message: string;
  };
  icon?: React.ReactNode;
  className?: string;
}

// Add this ActionButtonConfig type
type ActionButtonConfig = {
  label: string;
  variant: "default" | "outline" | "secondary" | "destructive";
  icon: React.ReactNode;
  action: "apply" | "withdraw" | "manage" | "none";
  disabled: boolean;
  className?: string;
};

const InterestWindowBadge = ({ gig }: { gig: GigCardProps["gig"] }) => {
  const status = getInterestWindowStatus(gig);

  if (!status.hasWindow) return null;

  // Parse the start date
  const startDate = gig.acceptInterestStartTime
    ? new Date(gig.acceptInterestStartTime)
    : null;

  const getBadgeProps = () => {
    switch (status.status) {
      case "not_open":
        return {
          variant: "outline" as const,
          className:
            "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
          icon: Calendar,
        };
      case "closed":
        return {
          variant: "outline" as const,
          className:
            "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
          icon: Lock,
        };
      case "open":
        return {
          variant: "outline" as const,
          className:
            "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
          icon: Clock,
        };
      default:
        return {
          variant: "outline" as const,
          className: "bg-gray-50 text-gray-600 border-gray-200",
          icon: Clock,
        };
    }
  };

  const badgeProps = getBadgeProps();
  const Icon = badgeProps.icon;

  const formatDate = (dateValue: string | number | Date | undefined) => {
    if (!dateValue) return "Not set";

    try {
      const date =
        typeof dateValue === "string"
          ? new Date(dateValue)
          : typeof dateValue === "number"
            ? new Date(dateValue)
            : dateValue;

      return date.toLocaleString();
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col gap-1">
            {/* Badge */}
            <Badge
              variant={badgeProps.variant}
              className={clsx(
                "inline-flex items-center gap-1 text-xs font-medium px-2 py-1",
                badgeProps.className,
              )}
            >
              <Icon className="w-3 h-3 flex-shrink-0" />
              <span className="truncate max-w-[80px]">{status.message}</span>
            </Badge>

            {/* Clean, Text-only Countdown */}
            {status.status === "not_open" && startDate && (
              <div className="flex items-center gap-3 px-1 py-1 transition-all duration-300">
                {/* Status Indicator Glow */}
                <div className="relative flex items-center justify-center h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400/60 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                </div>
                <CountdownTimer
                  targetDate={startDate}
                  className={"text-neutral-300 font-bold"}
                />
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium">{status.message}</p>

            {gig.acceptInterestStartTime && (
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span className="text-sm font-medium">Opens:</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 pl-4">
                  {formatDate(gig.acceptInterestStartTime)}
                </p>
              </div>
            )}

            {gig.acceptInterestEndTime && (
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span className="text-sm font-medium">Closes:</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 pl-4">
                  {formatDate(gig.acceptInterestEndTime)}
                </p>
              </div>
            )}

            {status.status === "not_open" && startDate && (
              <div className="pt-2 border-t">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-500" />
                  <span className="text-xs font-medium text-blue-600">
                    Countdown to opening:
                  </span>
                </div>
                <div className="flex items-center justify-center gap-3 mt-1 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <CountdownTimer targetDate={startDate} className="text-xs" />
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const GigCard: React.FC<GigCardProps> = ({
  gig,
  onClick,
  showActions = true,
  compact = false,
  userStatus: propUserStatus,
  showFullGigs = false, // Default to false (hide fully booked gigs)
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { userId } = useAuth();
  const { user: currentUser } = useCurrentUser();
  const { colors, isDarkMode } = useThemeColors();

  // State
  const [loading, setLoading] = useState(false);
  const [showBandJoinModal, setShowBandJoinModal] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [memberName, setMemberName] = useState("");
  const [interestNotes, setInterestNotes] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [showRoleSelectionModal, setShowRoleSelectionModal] = useState(false);
  const [selectedRoleForApplication, setSelectedRoleForApplication] =
    useState<BandRole | null>(null);

  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningReason, setWarningReason] = useState("");
  // Add this to your existing state declarations
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  // Convex mutations
  const showInterestInGig = useMutation(api.controllers.gigs.showInterestInGig);
  const removeInterestFromGig = useMutation(
    api.controllers.gigs.removeInterestFromGig,
  );
  const applyForBandRole = useMutation(
    api.controllers.bookings.applyForBandRole,
  );
  const withdrawFromBandRole = useMutation(
    api.controllers.bookings.withdrawFromBandRole,
  );
  const saveGig = useMutation(api.controllers.gigs.saveGig);
  const unsaveGig = useMutation(api.controllers.gigs.unsaveGig);
  const favoriteGig = useMutation(api.controllers.gigs.favoriteGig);
  const unfavoriteGig = useMutation(api.controllers.gigs.unfavoriteGig);
  const incrementView = useMutation(api.controllers.gigs.incrementViewCount);

  // Convex queries
  const gigPoster = useQuery(api.controllers.user.getUserById, {
    userId: gig.postedBy,
  });

  const userData = useQuery(
    api.controllers.user.getCurrentUser,
    userId ? { clerkId: userId } : "skip",
  );

  const currentUserId = currentUser?._id;

  // Compute user status using the utility function
  const userStatus = useMemo(() => {
    return getUserGigStatus(gig as any, currentUserId as Id<"users">);
  }, [gig, currentUserId]);

  // Use the status to derive values
  const isClientBand = gig.isClientBand || false;
  const isGigPoster = userStatus.isGigPoster;
  const isPending = gig.isPending || false;
  const userHasInterest =
    userStatus.hasShownInterest ||
    userStatus.isInApplicants ||
    userStatus.isInBandApplication;
  const userPosition = userStatus.position;

  if (isPending && !showFullGigs) {
    // Instead of returning null, you could return a "Fully Booked" card:
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg p-4 border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800/30 opacity-70 cursor-not-allowed"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold line-through text-gray-500 dark:text-gray-400">
              {gig.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Fully Booked
            </p>
          </div>
          <Badge
            variant="outline"
            className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
          >
            Fully Booked
          </Badge>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          This gig has reached maximum capacity
        </p>
      </motion.div>
    );
  }
  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    if (isClientBand) {
      const roleDetails = userStatus.roleDetails;
      if (roleDetails) {
        return Math.min(
          (roleDetails.filledSlots / roleDetails.maxSlots) * 100,
          100,
        );
      }
      return 0;
    } else {
      const interestedCount = gig.interestedUsers?.length || 0;
      const maxSlots = gig.maxSlots || 10;
      return Math.min((interestedCount / maxSlots) * 100, 100);
    }
  }, [isClientBand, userStatus.roleDetails, gig.interestedUsers, gig.maxSlots]);
  // Get available slots count
  const availableSlots = useMemo(() => {
    if (isClientBand) {
      const roleDetails = userStatus.roleDetails;
      if (roleDetails) {
        return Math.max(0, roleDetails.maxSlots - roleDetails.filledSlots);
      }
      return 0;
    } else {
      const interestedCount = gig.interestedUsers?.length || 0;
      const maxSlots = gig.maxSlots || 10;
      return Math.max(0, maxSlots - interestedCount);
    }
  }, [isClientBand, userStatus.roleDetails, gig.interestedUsers, gig.maxSlots]);

  // Get slots used count
  const slotsUsed = useMemo(() => {
    if (isClientBand) {
      return userStatus.roleDetails?.filledSlots || 0;
    } else {
      return gig.interestedUsers?.length || 0;
    }
  }, [isClientBand, userStatus.roleDetails, gig.interestedUsers]);

  const maxSlots = useMemo(() => {
    if (isClientBand) {
      return userStatus.roleDetails?.maxSlots || 10;
    } else {
      return gig.maxSlots || 10;
    }
  }, [isClientBand, userStatus.roleDetails, gig.maxSlots]);

  // Band applications info
  const bandApplications = gig.bookCount || [];
  const bandCount = bandApplications.length;
  const bandIsFull = bandCount >= (gig.maxSlots || 5);
  const totalBandMembers = bandApplications.reduce(
    (total, band) => total + (band.performingMembers?.length || 0),
    0,
  );
  // Add this debug function at the top of your component
  const debugGigState = () => {
    console.log("=== DEBUG: Gig State ===");
    console.log("Gig ID:", gig._id);
    console.log("Gig Type:", gigType);
    console.log("Is Client Band:", isClientBand);
    console.log("Is Taken:", gig.isTaken);
    console.log("Is Full:", isFull);
    console.log("Current User ID:", currentUserId);
    console.log("Current User:", currentUser?.username);
    console.log("User instruments:", currentUser?.instrument);

    // Check interestedUsers
    if (gig.interestedUsers) {
      console.log("Interested Users:", gig.interestedUsers);
      const isInInterested = gig.interestedUsers.includes(currentUserId!);
      console.log("Is user in interestedUsers?", isInInterested);
    }

    // Check bandCategory
    if (gig.bandCategory) {
      console.log("Band Roles:", gig.bandCategory.length);
      gig.bandCategory.forEach((role, i) => {
        console.log(`Role ${i}: ${role.role}`, {
          requiredSkills: role.requiredSkills,
          filledSlots: role.filledSlots,
          maxSlots: role.maxSlots,
          applicants: role.applicants.length,
          isUserApplicant: role.applicants.includes(currentUserId!),
          isUserBooked: role.bookedUsers.includes(currentUserId!),
        });
      });
    }
  };

  // Call it in useEffect
  useEffect(() => {
    if (currentUser) {
      debugGigState();
    }
  }, [currentUser, gig]);
  const getGigType = () => {
    switch (gig.bussinesscat) {
      case "full":
        // "Full" = Need an ENTIRE BAND (not individual roles)
        // This uses bookCount for band applications
        return "full_band"; // Changed from just "band"

      case "other":
        // "Other" = Client creating THEIR OWN BAND with specific roles
        // This ALWAYS has bandCategory with roles
        return "client_band_creation"; // Changed from "band_roles"

      case "personal":
        // "Personal" = Need an INDIVIDUAL musician (solo)
        // This uses interestedUsers array
        return "individual_musician";

      case "mc":
        // "MC" = Need an MC/Master of Ceremonies
        return "mc";

      case "dj":
        // "DJ" = Need a DJ
        return "dj";

      case "vocalist":
        // "Vocalist" = Need a vocalist/singer
        return "vocalist";

      default:
        // Fallback
        return "individual_musician";
    }
  };

  const gigType = getGigType();

  // ===== SLOT CALCULATIONS FOR EACH TYPE =====
  const isFull = useMemo(() => {
    switch (gigType) {
      case "full_band":
        // Full band gig: bands apply via bookCount
        const bandCount = gig.bookCount?.length || 0;
        const maxBands = gig.maxSlots || 1; // Usually 1 full band needed
        return bandCount >= maxBands;

      // Replace the isFull calculation for client_band_creation
      case "client_band_creation":
        if (!gig.bandCategory || gig.bandCategory.length === 0) return false;

        // TEMPORARY: Only consider full if there are actually slots defined
        const hasDefinedSlots = gig.bandCategory.some((role) => {
          const max = Number(role.maxSlots) || 0;
          return max > 0;
        });

        if (!hasDefinedSlots) return false;

        return gig.bandCategory.every((role) => {
          const max = Number(role.maxSlots) || 0;
          const filled = Number(role.filledSlots) || 0;
          return max === 0 || filled >= max;
        });

      case "individual_musician":
      case "mc":
      case "dj":
      case "vocalist":
        // Individual talent gigs: musicians show interest
        const interestedCount = gig.interestedUsers?.length || 0;
        const maxSlots = gig.maxSlots || 1; // Usually 1 musician needed
        return interestedCount >= maxSlots;

      default:
        return false;
    }
  }, [
    gigType,
    gig.bandCategory,
    gig.bookCount,
    gig.interestedUsers,
    gig.maxSlots,
  ]);

  const getActionButtonConfig = (
    userStatus: GigUserStatus,
    gigInfo: {
      isClientBand?: boolean;
      isTaken?: boolean;
      bookCount?: any[];
      maxSlots?: number;
    },
  ) => {
    // Add this check at the top of getActionButtonConfig
    const windowStatus = getInterestWindowStatus(gig);
    const isWindowLocked =
      windowStatus.hasWindow && windowStatus.status !== "open";

    if (isWindowLocked) {
      return {
        label:
          windowStatus.status === "not_open"
            ? "Opening Soon"
            : "Applications Closed",
        variant: "secondary" as const,
        disabled: true, // This stops the click
        icon: <Lock className="w-4 h-4" />,
        action: "none" as const,
      };
    }
    if (gig.isTaken) {
      return {
        label: "Booked",
        variant: "secondary" as const,
        disabled: true,
        icon: <Lock className="w-4 h-4" />,
        action: "none" as const,
      };
    }

    if (isFull) {
      return {
        label: "Fully Booked",
        variant: "secondary" as const,
        disabled: true,
        icon: <AlertCircle className="w-4 h-4" />,
        action: "none" as const,
      };
    }

    switch (gigType) {
      case "full_band":
        return {
          label: "Apply with Band",
          variant: "default" as const,
          disabled: false,
          icon: <Building2 className="w-4 h-4" />,
          action: "apply" as const,
        };

      case "client_band_creation":
        // Check if user can apply to any role
        const qualifiedRoles =
          gig.bandCategory?.filter(
            (role) =>
              role.filledSlots < role.maxSlots &&
              isUserQualifiedForRole(currentUser!, role),
          ) || [];

        if (qualifiedRoles.length === 0) {
          const allRoles = gig.bandCategory || [];
          const availableRoles = allRoles.filter(
            (role) => role.filledSlots < role.maxSlots,
          );

          return {
            label: "View Requirements",
            variant: "outline" as const,
            disabled: false,
            icon: <AlertCircle className="w-4 h-4" />,
            action: () => {
              // Show requirements modal
              toast.info(
                <div className="p-4">
                  <p className="font-semibold">Role Requirements</p>
                  {availableRoles.map((role, idx) => (
                    <div key={idx} className="mt-2 p-2 border rounded-lg">
                      <p className="font-medium">{role.role}</p>
                      <p className="text-sm text-gray-600">Requirements:</p>
                      <ul className="list-disc pl-4 text-sm">
                        {role.requiredSkills?.map((skill, i) => (
                          <li key={i}>{skill}</li>
                        ))}
                      </ul>
                      <p className="text-xs mt-1">
                        Your instruments:{" "}
                        {Array.isArray(currentUser?.instrument)
                          ? currentUser.instrument.join(", ")
                          : currentUser?.instrument}
                      </p>
                    </div>
                  ))}
                </div>,
                { duration: 10000 },
              );
            },
          };
        }

        // THIS IS THE MISSING RETURN STATEMENT
        return {
          label:
            qualifiedRoles.length === 1
              ? `Apply as ${qualifiedRoles[0].role}`
              : "Apply for Role",
          variant: "default" as const,
          icon: <UserPlus className="w-4 h-4" />,
          action: handleBandApplication,
        };
      case "individual_musician":
      case "mc":
      case "dj":
      case "vocalist":
        return {
          label:
            gigType === "mc"
              ? "Apply as MC"
              : gigType === "dj"
                ? "Apply as DJ"
                : gigType === "vocalist"
                  ? "Apply as Vocalist"
                  : "Show Interest",
          variant: "default" as const,
          disabled: false,
          icon: <UserPlus className="w-4 h-4" />,
          action: "apply" as const,
        };

      default:
        return {
          label: "Show Interest",
          variant: "default" as const,
          disabled: false,
          icon: <UserPlus className="w-4 h-4" />,
          action: "apply" as const,
        };
    }
  };
  // Format date and time
  const formattedDate = new Date(gig.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const formattedTime = gig.time?.start
    ? new Date(`2000-01-01T${gig.time.start}`).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  // Initialize saved/favorite state and member name from user data
  useEffect(() => {
    if (userData) {
      setIsSaved(userData.savedGigs?.includes(gig._id) || false);
      setIsFavorite(userData.favoriteGigs?.includes(gig._id) || false);
      if (!memberName && userData.username) {
        setMemberName(userData.username);
      }
    }
  }, [userData, gig._id]);

  // Handle view increment
  useEffect(() => {
    const incrementViewCount = async () => {
      if (currentUserId) {
        try {
          await incrementView({
            gigId: gig._id,
            userId: currentUserId,
          });
        } catch (error) {
          console.error("Failed to increment view count:", error);
        }
      }
    };

    incrementViewCount();
  }, [gig._id, currentUserId]);
  // In GigCard component
  const canUserApplyToRole = useMemo(() => {
    if (!currentUser || !gig.bandCategory || gig.bandCategory.length === 0) {
      return false;
    }

    // Find roles that are available AND user is qualified for
    const availableRoles = gig.bandCategory.filter(
      (role) => role.filledSlots < role.maxSlots,
    );

    if (availableRoles.length === 0) return false;

    // Check if user is qualified for any available role
    return availableRoles.some((role) =>
      isUserQualifiedForRole(currentUser, role),
    );
  }, [currentUser, gig.bandCategory]);

  const getUserQualifiedRoles = useMemo(() => {
    if (!currentUser || !gig.bandCategory) return [];

    return gig.bandCategory.filter((role) => {
      const max = Number(role.maxSlots) || 0;
      const filled = Number(role.filledSlots) || 0;
      const hasAvailableSlots = max === 0 || filled < max;

      return hasAvailableSlots && isUserQualifiedForRole(currentUser, role);
    });
  }, [currentUser, gig.bandCategory]);
  const handleBandApplication = () => {
    if (!currentUser) {
      toast.error("Please sign in first");
      return;
    }

    // Check if there are any available roles at all
    const availableRoles =
      gig.bandCategory?.filter((role) => role.filledSlots < role.maxSlots) ||
      [];

    if (availableRoles.length === 0) {
      toast.error("All roles are currently filled");
      return;
    }

    // Check if user has skills for any available role
    if (getUserQualifiedRoles.length === 0) {
      toast.error(
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <p className="font-medium">Skills Required</p>
            <p className="text-sm">
              You don't have the required skills for any available role
            </p>
            <p className="text-xs mt-1">
              Update your skills in your profile to apply
            </p>
          </div>
        </div>,
      );
      return;
    }

    // Since we're now showing role cards, we can either:
    // 1. Auto-select the first qualified role
    // 2. Show the role selection modal
    // 3. Just do nothing and let users click role cards

    // OPTION 1: Auto-select first qualified role (simpler)
    if (getUserQualifiedRoles.length === 1) {
      const role = getUserQualifiedRoles[0];
      const roleIndex =
        gig.bandCategory?.findIndex((r) => r.role === role.role) || 0;

      // Check if user is already in applicants for this role
      const isAlreadyApplied = gig.bandCategory?.[
        roleIndex
      ]?.applicants.includes(currentUser._id);
      if (isAlreadyApplied) {
        toast.info("You have already applied for this role");
        return;
      }

      // Apply directly
      applyForBandRole({
        gigId: gig._id,
        bandRoleIndex: roleIndex,
        userId: currentUser._id,
        applicationNotes: "",
      })
        .then(() => {
          toast.success(
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium">Applied successfully!</p>
                <p className="text-sm">For role: {role.role}</p>
              </div>
            </div>,
          );
        })
        .catch((error) => {
          toast.error(error.message || "Failed to apply");
        });
    } else {
      // OPTION 2: Show role selection modal (for multiple qualified roles)
      setShowRoleSelectionModal(true);
    }
  };
  const handleRegularInterest = async (notes?: string) => {
    console.log("=== CLIENT DEBUG: handleRegularInterest START ===");

    // Get the correct user ID - use Convex ID, not Clerk ID
    const convexUserId = currentUser?._id;
    console.log("1. User IDs:", {
      clerkId: userId, // From useAuth()
      convexId: convexUserId,
      currentUserHasId: !!convexUserId,
    });

    if (!convexUserId) {
      console.error("No convex user ID found");
      toast.error("Please sign in to show interest");
      return;
    }

    if (!currentUser) {
      console.error("No current user data");
      toast.error("User data not loaded. Please try again.");
      return;
    }

    console.log("2. Gig details:", {
      gigId: gig._id,
      title: gig.title,
      gigType: gigType,
      category: gig.category,
      isTaken: gig.isTaken,
      isPending: gig.isPending,
      interestedUsers: gig.interestedUsers?.length || 0,
      maxSlots: gig.maxSlots || 10,
    });

    console.log("3. User status:", {
      isGigPoster: userStatus.isGigPoster,
      hasShownInterest: userStatus.hasShownInterest,
      isInApplicants: userStatus.isInApplicants,
      isInBandApplication: userStatus.isInBandApplication,
      position: userStatus.position,
    });

    // Check if user is the gig poster
    if (userStatus.isGigPoster) {
      console.log("DEBUG: User is gig poster");
      toast.error("You cannot show interest in your own gig");
      return;
    }

    // Check if user already showed interest
    if (userHasInterest) {
      console.log("DEBUG: User already has interest");
      toast.info("You have already shown interest in this gig");
      return;
    }

    // Check if gig is taken or full
    if (gig.isTaken) {
      console.log("DEBUG: Gig is already taken");
      toast.error("This gig has already been booked");
      return;
    }

    if (gig.isPending) {
      console.log("DEBUG: Gig is pending/fully booked");
      toast.error("This gig is no longer accepting applications");
      return;
    }

    // Time Lock Check
    const windowStatus = getInterestWindowStatus(gig);
    console.log("4. Interest window:", windowStatus);

    if (windowStatus.hasWindow && windowStatus.status !== "open") {
      toast.error(
        `Interest window is ${windowStatus.status}. ${windowStatus.message}`,
      );
      return;
    }

    // Qualification Check
    console.log("5. Qualification check starting...");
    console.log("User profile:", {
      isMusician: currentUser.isMusician,
      instrument: currentUser.instrument,
      roleType: currentUser.roleType,
    });

    let qualified = false;
    let reason = "";

    if (gigType === "client_band_creation") {
      // For band gigs, check specific roles
      if (gig.bandCategory && gig.bandCategory.length > 0) {
        const qualifiedRoles = userQualifiedRoles(
          currentUser as Doc<"users">,
          gig.bandCategory || [],
        );
        qualified = qualifiedRoles.some(
          (role) => role.isQualified && !role.isFull,
        );
        console.log(
          "Band gig - qualified roles:",
          qualifiedRoles.filter((r) => r.isQualified).length,
        );

        if (!qualified) {
          reason = `This band gig requires specific roles. You play: ${currentUser?.instrument || "no instrument specified"}.`;
        }
      } else {
        // No roles defined, any musician can apply
        qualified = currentUser?.isMusician || false;
        if (!qualified) {
          reason = "You need to be a musician to apply for band gigs.";
        }
      }
    } else if (gigType === "individual_musician") {
      // For individual musician gigs
      if (!currentUser?.isMusician) {
        qualified = false;
        reason =
          "You need to be registered as a musician to apply for this gig.";
      } else if (gig.category) {
        // Gig has specific instrument requirement
        const gigInstrument = gig.category.toLowerCase();
        const userInstrument = (currentUser?.instrument || "").toLowerCase();

        console.log("Instrument match:", {
          gigInstrument,
          userInstrument,
          includesGig: userInstrument.includes(gigInstrument),
          includesUser: gigInstrument.includes(userInstrument),
        });

        qualified =
          userInstrument.includes(gigInstrument) ||
          gigInstrument.includes(userInstrument) ||
          userInstrument === gigInstrument;

        if (!qualified) {
          reason = `This gig is looking for a ${gig.category}, but your profile shows: ${currentUser?.instrument || "no instrument specified"}.`;
        }
      } else {
        // No specific requirement - any musician can apply
        qualified = currentUser?.isMusician || false;
        console.log("No category requirement, qualified:", qualified);
      }
    } else if (gigType === "mc" || gigType === "dj" || gigType === "vocalist") {
      // For specific role gigs
      const gigRole = gigType;
      const userRole = currentUser?.roleType?.toLowerCase();

      console.log(`Role check - Gig needs: ${gigRole}, User is: ${userRole}`);

      qualified = userRole === gigRole;

      if (!qualified) {
        if (gigRole === "mc") {
          reason =
            "This gig is looking for an MC. You need to be registered as an MC to apply.";
        } else if (gigRole === "dj") {
          reason =
            "This gig is looking for a DJ. You need to be registered as a DJ to apply.";
        } else if (gigRole === "vocalist") {
          reason =
            "This gig is looking for a vocalist. You need to be registered as a vocalist to apply.";
        }
      }
    } else {
      // Default case
      qualified = isUserQualifiedForRole(currentUser, gig);
      if (!qualified) {
        reason = "You don't meet the requirements for this gig.";
      }
    }

    console.log("6. Qualification result:", { qualified, reason });

    if (!qualified) {
      console.log("Showing qualification warning");
      setWarningReason(reason);
      setShowWarningModal(true);
      return;
    }

    // Check available slots for non-band gigs
    if (gigType !== "client_band_creation" && gigType !== "full_band") {
      const interestedCount = gig.interestedUsers?.length || 0;
      const maxSlots = gig.maxSlots || 10;
      const availableSlots = Math.max(0, maxSlots - interestedCount);

      console.log("7. Slot availability:", {
        interestedCount,
        maxSlots,
        availableSlots,
      });

      if (availableSlots <= 0) {
        toast.error("No available slots for this gig");
        return;
      }
    }

    // All checks passed - proceed
    console.log("8. All checks passed, calling mutation...");

    setLoading(true);
    try {
      console.log("9. Calling showInterestInGig with:", {
        gigId: gig._id,
        userId: convexUserId,
        notes: notes || "",
      });

      const result = await showInterestInGig({
        gigId: gig._id,
        userId: convexUserId, // Use Convex ID here!
        notes: notes || "",
      });

      console.log("10. Mutation successful:", result);

      // Show success message
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <div>
            <p className="font-semibold">Interest shown successfully!</p>
            <p className="text-sm">
              You are now in position #{gig.interestedUsers?.length || 0 + 1}
            </p>
          </div>
        </div>,
      );

      // Close the modal if open
      setShowInterestModal(false);

      // Refresh the page or update state
      setTimeout(() => {
        router.refresh(); // If using Next.js
      }, 1000);
    } catch (err: any) {
      console.error("11. Mutation error:", err);
      console.error("Error details:", {
        message: err.message,
        stack: err.stack,
        name: err.name,
      });

      // Handle specific error messages
      if (
        err.message?.includes("already shown interest") ||
        err.message?.includes("already interested")
      ) {
        toast.info("You have already shown interest in this gig");
      } else if (err.message?.includes("Gig not found")) {
        toast.error("This gig no longer exists");
      } else if (
        err.message?.includes("User not found") ||
        err.message?.includes("logged in")
      ) {
        toast.error("Please log in to show interest");
      } else if (err.message?.includes("maximum capacity")) {
        toast.error("This gig has reached maximum capacity");
      } else if (err.message?.includes("your own gig")) {
        toast.error("You cannot show interest in your own gig");
      } else {
        toast.error(
          err.message || "Failed to show interest. Please try again.",
        );
      }
    } finally {
      setLoading(false);
      console.log("=== CLIENT DEBUG: handleRegularInterest END ===");
    }
  };

  const handleBandAction = useCallback(
    (bandRoleIndex: number): BandAction | null => {
      if (!gig.bandCategory || !gig.bandCategory[bandRoleIndex]) return null;

      const role = gig.bandCategory[bandRoleIndex];
      const currentUserId = currentUser?._id as Id<"users">;

      if (!currentUserId) return null;

      const isGigPoster = currentUserId === gig.postedBy;
      const hasApplied = role.applicants.includes(currentUserId);
      const isBooked = role.bookedUsers.includes(currentUserId);
      const isRoleFull = (() => {
        if (!role) return false;
        const max = Number(role.maxSlots) || 0;
        const filled = Number(role.filledSlots) || 0;
        // Role is only full if it has slots defined AND they're all filled
        return max > 0 && filled >= max;
      })();
      const hasApplicants = role.applicants.length > 0;
      const hasBookedUsers = role.bookedUsers.length > 0;

      // ========== GIG POSTER (OWNER) ACTIONS ==========
      if (isGigPoster) {
        // If there are booked users, show manage button
        if (hasBookedUsers) {
          return {
            type: "manage",
            label: "Manage Booked",
            variant: "default",
            action: () => {
              router.push(`/gigs/${gig._id}/manage?roleIndex=${bandRoleIndex}`);
              return Promise.resolve();
            },
            disabled: false,
            routing: {
              forMusician: "",
              forClient: `/gigs/${gig._id}/manage?roleIndex=${bandRoleIndex}`,
              message: "Manage booked musicians",
            },
            icon: <Users className="w-4 h-4" />,
            className:
              "bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0",
          };
        }

        // If there are applicants, show review button
        if (hasApplicants) {
          return {
            type: "review",
            label: "Review Applicants",
            variant: "default",
            action: async () => {
              router.push(`/gigs/${gig._id}/review?roleIndex=${bandRoleIndex}`);
              return Promise.resolve();
            },
            disabled: false,
            routing: {
              forMusician: "",
              forClient: `/gigs/${gig._id}/review?roleIndex=${bandRoleIndex}`,
              message: "Review applicants",
            },
            icon: <UserCheck className="w-4 h-4" />,
            className:
              "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0",
          };
        }

        // Default for gig owners - EDIT button (always shown)
        return {
          type: "edit",
          label: "Edit Role",
          variant: "outline",
          action: () => {
            router.push(`/hub/gigs/edit/${gig._id}?roleIndex=${bandRoleIndex}`);
            return Promise.resolve();
          },
          disabled: false,
          routing: {
            forMusician: "",
            forClient: `/hub/gigs/edit/${gig._id}?roleIndex=${bandRoleIndex}`,
            message: "Edit this role",
          },
          icon: <Edit className="w-4 h-4" />,
          className:
            "border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-600",
        };
      }

      // ========== MUSICIAN (NON-OWNER) ACTIONS ==========

      // ===== BOOKED =====
      if (isBooked) {
        return {
          type: "leave",
          label: "Booked - Leave",
          variant: "outline",
          action: async () => {
            try {
              await withdrawFromBandRole({
                gigId: gig._id,
                bandRoleIndex,
                userId: currentUser?._id!,
                reason: "Left voluntarily",
              });
              toast.success("Left the role");
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : "Failed to leave",
              );
            }
          },
          disabled: false,
          routing: {
            forMusician: "/hub/gigs?tab=booked",
            forClient: "/hub/gigs?tab=my-gigs",
            message: "Booked for this role",
          },
          icon: <CheckCircle className="w-4 h-4" />,
          className:
            "border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20",
        };
      }

      // ===== APPLIED (PENDING) =====
      if (hasApplied && !isBooked) {
        return {
          type: "pending",
          label: "Applied - Pending",
          variant: "outline",
          action: async () => {
            // Optional: Add withdraw functionality here
            try {
              await withdrawFromBandRole({
                gigId: gig._id,
                bandRoleIndex,
                userId: currentUser?._id!,
                reason: "Withdrew application",
              });
              toast.success("Application withdrawn");
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : "Failed to withdraw",
              );
            }
          },
          disabled: false,
          routing: {
            forMusician: "/hub/gigs?tab=pending",
            forClient: "/hub/gigs?tab=my-gigs",
            message: "Application pending",
          },
          icon: <Clock className="w-4 h-4" />,
          className:
            "border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20",
        };
      }

      // ===== ROLE FULL =====
      if (isRoleFull && !hasApplied && !isBooked) {
        return {
          type: "full",
          label: "Role Full",
          variant: "secondary",
          action: null,
          disabled: true,
          routing: {
            forMusician: "/hub/gigs?tab=all",
            forClient: "/hub/gigs?tab=my-gigs",
            message: "Role full",
          },
          icon: <AlertCircle className="w-4 h-4" />,
          className: "bg-gray-100 text-gray-500 border-gray-300",
        };
      }

      // ===== CAN APPLY =====
      if (!isRoleFull && !hasApplied && !isBooked) {
        // Check if user is qualified for this role
        const isQualified = isUserQualifiedForRole(currentUser!, role);

        return {
          type: "apply",
          label: isQualified ? "Apply" : "View Requirements",
          variant: isQualified ? "default" : "outline",
          action: async () => {
            if (!isQualified) {
              toast.error("You don't meet the requirements for this role");
              return;
            }

            try {
              await applyForBandRole({
                gigId: gig._id,
                bandRoleIndex,
                userId: currentUser?._id!,
                applicationNotes: interestNotes,
              });
              toast.success("Application submitted!");
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : "Failed to apply",
              );
            }
          },
          disabled: !isQualified,
          routing: {
            forMusician: "/hub/gigs?tab=all",
            forClient: "/hub/gigs?tab=my-gigs",
            message: "Apply for role",
          },
          icon: isQualified ? (
            <UserPlus className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          ),
          className: isQualified
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 hover:from-blue-700 hover:to-indigo-700"
            : "border-gray-400 text-gray-500 hover:bg-gray-50",
        };
      }

      // ===== DEFAULT (VIEW DETAILS) =====
      return {
        type: "review",
        label: "View Details",
        variant: "outline",
        action: () => {
          router.push(`/gigs/${gig._id}?roleIndex=${bandRoleIndex}`);
          return Promise.resolve();
        },
        disabled: false,
        routing: {
          forMusician: `/gigs/${gig._id}?roleIndex=${bandRoleIndex}`,
          forClient: `/gigs/${gig._id}?roleIndex=${bandRoleIndex}`,
          message: "View role details",
        },
        icon: <Eye className="w-4 h-4" />,
        className:
          "border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20",
      };
    },
    [gig, currentUser, userId, interestNotes, router],
  );
  // Save/favorite handlers
  const handleSave = async () => {
    if (!currentUserId) {
      toast.error("Sign in to save gigs");
      return;
    }

    try {
      if (isSaved) {
        await unsaveGig({
          userId: currentUserId,
          gigId: gig._id,
        });
        setIsSaved(false);
        toast.success("Removed from saved");
      } else {
        await saveGig({
          userId: currentUserId,
          gigId: gig._id,
        });
        setIsSaved(true);
        toast.success("Gig saved");
      }
    } catch (error) {
      toast.error("Failed to update saved gigs");
    }
  };

  const handleFavorite = async () => {
    if (!currentUserId) {
      toast.error("Sign in to favorite gigs");
      return;
    }

    try {
      if (isFavorite) {
        await unfavoriteGig({
          userId: currentUserId,
          gigId: gig._id,
        });
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        await favoriteGig({
          userId: currentUserId,
          gigId: gig._id,
        });
        setIsFavorite(true);
        toast.success("Added to favorites");
      }
    } catch (error) {
      toast.error("Failed to update favorites");
    }
  };

  // Handle gig click
  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    const roleLower = role.toLowerCase();
    if (roleLower.includes("vocal")) return "🎤";
    if (roleLower.includes("guitar")) return "🎸";
    if (roleLower.includes("piano") || roleLower.includes("keyboard"))
      return "🎹";
    if (roleLower.includes("drum")) return "🥁";
    if (roleLower.includes("bass")) return "🎸";
    if (roleLower.includes("dj")) return "🎧";
    if (roleLower.includes("sax")) return "🎷";
    if (roleLower.includes("violin")) return "🎻";
    if (roleLower.includes("trumpet")) return "🎺";
    if (roleLower.includes("mc")) return "🎤";
    return "🎵";
  };

  const getContrastColor = (hexColor: string) => {
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#ffffff";
  };

  const getCardStyles = () => {
    return {
      backgroundColor: gig.backgroundColor || undefined,
      color: gig.fontColor || undefined,
      fontFamily: gig.font || undefined,
      borderColor: gig.fontColor ? `${gig.fontColor}20` : undefined,
      "--button-bg": gig.backgroundColor
        ? `${gig.backgroundColor}40`
        : undefined,
      "--button-hover": gig.backgroundColor
        ? `${gig.backgroundColor}60`
        : undefined,
      "--button-text": gig.fontColor || undefined,
    } as React.CSSProperties;
  };

  const getButtonStyles = (
    variant: "default" | "outline" | "secondary" | "destructive" = "default",
  ) => {
    const bgColor = gig.backgroundColor;
    const fontColor = gig.fontColor;

    const baseStyle = {
      color: fontColor || undefined,
    };

    switch (variant) {
      case "default":
        return {
          ...baseStyle,
          backgroundColor: bgColor ? `${bgColor}40` : undefined,
          borderColor: fontColor ? `${fontColor}30` : undefined,
        };
      case "outline":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
          borderColor: fontColor ? `${fontColor}40` : undefined,
        };
      case "secondary":
        return {
          ...baseStyle,
          backgroundColor: bgColor ? `${bgColor}20` : undefined,
          borderColor: fontColor ? `${fontColor}20` : undefined,
        };
      case "destructive":
        return {
          ...baseStyle,
          backgroundColor: fontColor ? `${fontColor}20` : undefined,
          borderColor: fontColor ? `${fontColor}30` : undefined,
          color: fontColor || "#ef4444",
        };
      default:
        return baseStyle;
    }
  };

  // Get status badge
  const getStatusBadge = () => {
    if (gig.isTaken) {
      return (
        <Badge
          className="px-2 py-1 text-xs"
          style={{
            backgroundColor: gig.backgroundColor
              ? `${gig.backgroundColor}40`
              : undefined,
            color: gig.fontColor || undefined,
            borderColor: gig.fontColor ? `${gig.fontColor}30` : undefined,
          }}
        >
          Booked
        </Badge>
      );
    }
    if (gig.isPending) {
      return (
        <Badge
          className="px-2 py-1 text-xs"
          style={{
            backgroundColor: gig.backgroundColor
              ? `${gig.backgroundColor}30`
              : undefined,
            color: gig.fontColor || "#f59e0b",
            borderColor: gig.fontColor ? `${gig.fontColor}20` : "#f59e0b30",
          }}
        >
          Fully Booked
        </Badge>
      );
    }
    if (isFull) {
      return (
        <Badge
          className="px-2 py-1 text-xs"
          style={{
            backgroundColor: gig.backgroundColor
              ? `${gig.backgroundColor}30`
              : undefined,
            color: gig.fontColor || "#ef4444",
            borderColor: gig.fontColor ? `${gig.fontColor}20` : "#ef444430",
          }}
        >
          Full
        </Badge>
      );
    }
    if (isClientBand) {
      return (
        <Badge
          className="px-2 py-1 text-xs"
          style={{
            backgroundColor: gig.backgroundColor
              ? `${gig.backgroundColor}40`
              : undefined,
            color: gig.fontColor || "#8b5cf6",
            borderColor: gig.fontColor ? `${gig.fontColor}30` : "#8b5cf630",
          }}
        >
          <Sparkles className="w-3 h-3 mr-1" />
          Band
        </Badge>
      );
    }
    return (
      <Badge
        className="px-2 py-1 text-xs"
        style={{
          backgroundColor: gig.backgroundColor
            ? `${gig.backgroundColor}40`
            : undefined,
          color: gig.fontColor || undefined,
          borderColor: gig.fontColor ? `${gig.fontColor}30` : undefined,
        }}
      >
        Available
      </Badge>
    );
  };
  // Add this function inside your GigCard component, after other functions
  const getRoleColors = (roleIndex: number) => {
    const roleColors = [
      {
        bg: isDarkMode ? colors.clientBg : colors.clientBg,
        text: isDarkMode ? colors.clientText : colors.clientText,
        border: isDarkMode ? colors.clientBorder : colors.clientBorder,
      },
      {
        bg: isDarkMode ? colors.bookerBg : colors.bookerBg,
        text: isDarkMode ? colors.bookerText : colors.bookerText,
        border: isDarkMode ? colors.bookerBorder : colors.bookerBorder,
      },
      {
        bg: isDarkMode ? colors.vocalistBg : colors.vocalistBg,
        text: isDarkMode ? colors.vocalistText : colors.vocalistText,
        border: isDarkMode ? colors.vocalistBorder : colors.vocalistBorder,
      },
      {
        bg: isDarkMode ? colors.djBg : colors.djBg,
        text: isDarkMode ? colors.djText : colors.djText,
        border: isDarkMode ? colors.djBorder : colors.djBorder,
      },
      {
        bg: isDarkMode ? colors.mcBg : colors.mcBg,
        text: isDarkMode ? colors.mcText : colors.mcText,
        border: isDarkMode ? colors.mcBorder : colors.mcBorder,
      },
      {
        bg: isDarkMode ? colors.musicianBg : colors.musicianBg,
        text: isDarkMode ? colors.musicianText : colors.musicianText,
        border: isDarkMode ? colors.musicianBorder : colors.musicianBorder,
      },
      {
        bg: isDarkMode ? colors.defaultBg : colors.defaultBg,
        text: isDarkMode ? colors.defaultText : colors.defaultText,
        border: isDarkMode ? colors.defaultBorder : colors.defaultBorder,
      },
    ];

    // Use the role index to get colors, with fallback to default colors
    const colorSet = roleColors[roleIndex] || roleColors[6]; // Fallback to default

    // Apply opacity for backgrounds in light mode
    if (!isDarkMode) {
      return {
        ...colorSet,
        bg: colorSet.bg.replace("0.1", "0.08"), // Make lighter in light mode
      };
    }

    return colorSet;
  };
  // Render band applications preview
  const renderBandApplicationsPreview = () => {
    if (!isClientBand || bandApplications.length === 0 || compact) return null;

    const displayBands = bandApplications.slice(0, 3);
    const remainingCount = bandApplications.length - 3;

    return (
      <div className="flex items-center gap-1 mt-2">
        <div className="flex -space-x-2">
          {displayBands.map((band, index) => {
            const firstMember = band.performingMembers?.[0];
            const bandName = firstMember?.name || `Band ${index + 1}`;
            const memberCount = band.performingMembers?.length || 0;
            const mainRole = firstMember?.role || "Member";

            return (
              <TooltipProvider key={band.bandId || index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <Avatar className="w-6 h-6 border-2 border-white dark:border-gray-800">
                        <AvatarFallback className="text-xs">
                          {bandName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-[8px] text-white">
                          {memberCount}
                        </span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <p className="font-medium">{bandName}'s Band</p>
                      <p className="text-gray-600">{memberCount} members</p>
                      <p className="text-gray-600 capitalize">
                        {band.status || "Applied"}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
        {remainingCount > 0 && (
          <span className="text-xs text-gray-500 ml-1">
            +{remainingCount} more bands
          </span>
        )}
      </div>
    );
  };
  // const renderBandRoleActions = () => {
  //   if (!gig.bandCategory || gig.bandCategory.length === 0) return null;
  //   if (compact) return null;

  //   return (
  //     <div className="space-y-3 mt-4 pt-4 border-t">
  //       <div className="text-sm font-semibold flex items-center justify-between">
  //         <span>Band Roles ({gig.bandCategory.length})</span>
  //         <Badge variant="outline" className="text-xs">
  //           {
  //             gig.bandCategory.filter((role) =>
  //               isUserQualifiedForRole(currentUser!, role),
  //             ).length
  //           }{" "}
  //           match your skills
  //         </Badge>
  //       </div>

  //       <div className="space-y-2">
  //         {gig.bandCategory.map((role, index) => {
  //           const isQualified = isUserQualifiedForRole(currentUser!, role);
  //           const isRoleFull = role.filledSlots >= role.maxSlots;
  //           const hasApplied =
  //             currentUser?._id && role.applicants.includes(currentUser._id);
  //           const isBooked =
  //             currentUser?._id && role.bookedUsers.includes(currentUser._id);

  //           // Get proper action for this specific role
  //           const roleAction = handleBandAction(index);

  //           return (
  //             <div
  //               key={index}
  //               className={cn(
  //                 "p-3 rounded-xl border transition-all",
  //                 isQualified
  //                   ? "border-green-200 bg-green-50 dark:bg-green-900/20"
  //                   : "opacity-60 border-gray-200",
  //               )}
  //             >
  //               {/* Role header */}
  //               <div className="flex items-center justify-between mb-2">
  //                 <div className="flex items-center gap-2">
  //                   <h4 className="font-semibold">{role.role}</h4>
  //                   {!isQualified && (
  //                     <Badge variant="outline" className="text-xs">
  //                       Requires:{" "}
  //                       {role.requiredSkills?.[0] || "specific skills"}
  //                     </Badge>
  //                   )}
  //                 </div>
  //                 <div className="flex items-center gap-2">
  //                   {/* Slot info badge */}
  //                   <Badge variant="outline" className="text-xs">
  //                     {role.filledSlots}/{role.maxSlots} filled
  //                   </Badge>

  //                   {isQualified ? (
  //                     isBooked ? (
  //                       <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
  //                         ✓ Booked
  //                       </Badge>
  //                     ) : hasApplied ? (
  //                       <Badge className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
  //                         ✓ Applied
  //                       </Badge>
  //                     ) : (
  //                       <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
  //                         ✓ Qualified
  //                       </Badge>
  //                     )
  //                   ) : (
  //                     <Badge variant="secondary" className="text-xs">
  //                       Skills needed
  //                     </Badge>
  //                   )}
  //                 </div>
  //               </div>

  //               {/* Role description */}
  //               {role.description && (
  //                 <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
  //                   {role.description}
  //                 </p>
  //               )}

  //               {/* Required skills */}
  //               {role.requiredSkills && role.requiredSkills.length > 0 && (
  //                 <div className="flex flex-wrap gap-1 mb-3">
  //                   {role.requiredSkills.slice(0, 3).map((skill, i) => (
  //                     <Badge
  //                       key={i}
  //                       variant="outline"
  //                       className="text-xs bg-gray-100 dark:bg-gray-800"
  //                     >
  //                       {skill}
  //                     </Badge>
  //                   ))}
  //                   {role.requiredSkills.length > 3 && (
  //                     <Badge variant="outline" className="text-xs">
  //                       +{role.requiredSkills.length - 3} more
  //                     </Badge>
  //                   )}
  //                 </div>
  //               )}

  //               {/* Compensation */}
  //               <div className="flex items-center justify-between mb-3">
  //                 <div className="flex items-center gap-2">
  //                   <DollarSign className="w-4 h-4 text-green-500" />
  //                   <span className="font-medium">
  //                     {role.price ? `$${role.price}` : "Contact for rate"}
  //                   </span>
  //                   {role.negotiable && (
  //                     <Badge
  //                       variant="outline"
  //                       className="text-xs border-amber-500/30 text-amber-600 dark:text-amber-400"
  //                     >
  //                       Negotiable
  //                     </Badge>
  //                   )}
  //                 </div>
  //                 <div className="text-sm text-gray-500 dark:text-gray-400">
  //                   {role.currency || "KES"}
  //                 </div>
  //               </div>

  //               {/* Action button - ONLY WAY TO APPLY */}
  //               {roleAction && (
  //                 <Button
  //                   variant={
  //                     isQualified && !isRoleFull && !hasApplied && !isBooked
  //                       ? "default"
  //                       : "outline"
  //                   }
  //                   size="sm"
  //                   disabled={
  //                     !isQualified || isRoleFull || hasApplied || isBooked
  //                   }
  //                   onClick={(e) => {
  //                     e.stopPropagation();
  //                     if (roleAction.action) {
  //                       roleAction.action();
  //                     }
  //                   }}
  //                   className={cn(
  //                     "w-full",
  //                     !isQualified && "cursor-not-allowed opacity-50",
  //                   )}
  //                 >
  //                   {isBooked
  //                     ? "Booked ✓"
  //                     : hasApplied
  //                       ? "Application Pending"
  //                       : isRoleFull
  //                         ? "Role Full"
  //                         : isQualified
  //                           ? "Apply for this Role"
  //                           : "Not Qualified"}
  //                 </Button>
  //               )}
  //             </div>
  //           );
  //         })}
  //       </div>
  //     </div>
  //   );
  // };
  const PositionBadge = ({
    position,
    className = "",
  }: {
    position: number;
    className?: string;
  }) => {
    return (
      <div
        className={clsx(
          "absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full",
          "bg-gradient-to-r from-blue-600 to-indigo-600 text-white",
          "text-[10px] font-bold flex items-center justify-center",
          "border border-white dark:border-gray-800",
          className,
        )}
      >
        {position}
      </div>
    );
  };

  // And also create a QualificationBadge for reuse
  const QualificationBadge = ({ className = "" }: { className?: string }) => {
    return (
      <div
        className={clsx(
          "absolute -top-1 -right-1 w-4 h-4 rounded-full",
          "bg-green-500 border border-white dark:border-gray-800",
          "flex items-center justify-center",
          className,
        )}
      >
        <Check className="w-2.5 h-2.5 text-white" />
      </div>
    );
  };
  const getUnqualifiedButtonConfig = () => {
    const isMusician = currentUser?.isMusician || false;
    const roleType = currentUser?.roleType || "";

    const { isQualified, missingQualifications } = isUserQualifiedForGig(
      {
        isMusician,
        roleType,
        instrument: currentUser?.instrument,
        mcType: currentUser?.mcType,
        mcLanguages: currentUser?.mcLanguages,
        djGenre: currentUser?.djGenre,
        djEquipment: currentUser?.djEquipment,
        vocalistGenre: currentUser?.vocalistGenre,
      } as any,
      gig,
    );

    // Special handling based on gig type
    let specificMessage = "";
    let buttonLabel = "Not Qualified";
    let icon: React.ReactNode = <XCircle className="w-4 h-4" />;

    if (gigType === "mc") {
      if (roleType !== "mc") {
        specificMessage = "You are not registered as an MC";
        buttonLabel = "Not an MC";
        icon = <MicOff className="w-4 h-4" />;
      } else {
        specificMessage =
          missingQualifications?.join(", ") || "Missing MC qualifications";
      }
    } else if (gigType === "dj") {
      if (roleType !== "dj") {
        specificMessage = "You are not registered as a DJ";
        buttonLabel = "Not a DJ";
        icon = <VolumeX className="w-4 h-4" />;
      } else {
        specificMessage =
          missingQualifications?.join(", ") || "Missing DJ qualifications";
      }
    } else if (gigType === "vocalist") {
      if (roleType !== "vocalist") {
        specificMessage = "You are not registered as a vocalist";
        buttonLabel = "Not a Vocalist";
        icon = <MicOff className="w-4 h-4" />;
      } else {
        specificMessage =
          missingQualifications?.join(", ") ||
          "Missing vocalist qualifications";
      }
    } else if (gigType === "individual_musician") {
      if (!isMusician) {
        specificMessage = "You are not a musician";
        buttonLabel = "Not a Musician";
        icon = <Music className="w-4 h-4" />;
      } else if (roleType !== "instrumentalist") {
        specificMessage = "You are not registered as an instrumentalist";
        buttonLabel = "Not Instrumentalist";
        icon = <Music className="w-4 h-4" />;
      } else {
        const requiredInstrument = gig.category || "instrument";
        specificMessage = `Instrument mismatch. Gig requires: ${requiredInstrument}`;
        buttonLabel = `Needs ${requiredInstrument}`;
        icon = <X className="w-4 h-4" />;
      }
    } else {
      // Default case
      specificMessage =
        missingQualifications?.join(", ") || "You don't meet the requirements";
    }

    return {
      label: buttonLabel,
      variant: "outline" as const,
      icon: icon,
      action: () => {
        toast.error(buttonLabel, {
          description: specificMessage,
          duration: 5000,
        });
      },
      disabled: true,
      tooltip: specificMessage,
      // FIXED: Added background color for better contrast
      className: clsx(
        "border-red-300 dark:border-red-700",
        "bg-red-50/90 dark:bg-red-950/80", // Added background
        "text-red-700 dark:text-red-300",
        "hover:bg-red-100 dark:hover:bg-red-900/60",
        "cursor-not-allowed backdrop-blur-sm",
      ),
      isQualified: false,
    };
  };

  const getQualifiedButtonConfig = () => {
    switch (gigType) {
      case "full_band":
        return {
          label: "Apply with Band",
          variant: "default" as const,
          icon: <Building2 className="w-4 h-4" />,
          action: () => setShowBandJoinModal(true),
          disabled: false,
          className: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
          isQualified: true,
        };

      case "mc":
        return {
          label: "Apply as MC",
          variant: "default" as const,
          icon: <Mic className="w-4 h-4" />,
          action: () => setShowInterestModal(true),
          disabled: false,
          className: "bg-gradient-to-r from-red-600 to-orange-600 text-white",
          isQualified: true,
        };

      case "dj":
        return {
          label: "Apply as DJ",
          variant: "default" as const,
          icon: <Volume2 className="w-4 h-4" />,
          action: () => setShowInterestModal(true),
          disabled: false,
          className: "bg-gradient-to-r from-pink-600 to-rose-600 text-white",
          isQualified: true,
        };

      case "vocalist":
        return {
          label: "Apply as Vocalist",
          variant: "default" as const,
          icon: <Mic className="w-4 h-4" />,
          action: () => setShowInterestModal(true),
          disabled: false,
          className:
            "bg-gradient-to-r from-green-600 to-emerald-600 text-white",
          isQualified: true,
        };

      case "individual_musician":
        const instrumentName = gig.category
          ? gig.category.charAt(0).toUpperCase() + gig.category.slice(1)
          : "Musician";

        return {
          label: `Apply as ${instrumentName}`,
          variant: "default" as const,
          icon: <Music className="w-4 h-4" />,
          action: () => setShowInterestModal(true),
          disabled: false,
          className: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white",
          isQualified: true,
        };

      default:
        return {
          label: "Show Interest",
          variant: "default" as const,
          icon: <UserPlus className="w-4 h-4" />,
          action: () => setShowInterestModal(true),
          disabled: false,
          className: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white",
          isQualified: true,
        };
    }
  };

  const getDefaultButtonConfig = () => {
    const isMusician = currentUser?.isMusician || false;
    const roleType = currentUser?.roleType || "";

    const { isQualified } = isUserQualifiedForGig(
      {
        isMusician,
        roleType,
        instrument: currentUser?.instrument,
        mcType: currentUser?.mcType,
        mcLanguages: currentUser?.mcLanguages,
        djGenre: currentUser?.djGenre,
        djEquipment: currentUser?.djEquipment,
        vocalistGenre: currentUser?.vocalistGenre,
      } as any,
      gig,
    );

    if (!isQualified) {
      return getUnqualifiedButtonConfig();
    }

    return getQualifiedButtonConfig();
  };

  const renderActionButton = () => {
    if (!showActions) return null;

    const responsiveButtonClasses = "w-full sm:w-auto px-3 py-1.5 h-9";

    // Early return for gig poster
    if (userStatus.isGigPoster) {
      return renderGigPosterButtons();
    }

    // Early return for users who have already applied
    if (
      userStatus.hasShownInterest ||
      userStatus.isInApplicants ||
      userStatus.isInBandApplication
    ) {
      return renderAppliedUserButton();
    }

    // Handle client band creation specifically
    if (gigType === "client_band_creation") {
      return renderClientBandCreationButton();
    }

    // Handle other gig types
    return renderDefaultGigButton();
  };

  // ===== Helper Components =====
  const handleGigPosterManageClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    switch (gigType) {
      case "full_band":
        router.push(`/hub/gigs/client/${gig._id}/band-applicants`);
        break;
      case "client_band_creation":
        router.push(`/hub/gigs/client/${gig._id}/band-applicants`);
        break;
      default:
        router.push(`/hub/gigs/client/${gig._id}/band_applicants`);
        break;
    }
  };
  const renderGigPosterButtons = () => {
    const responsiveButtonClasses = "w-full sm:w-auto px-3 py-1.5 h-9";

    return (
      <div className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={(e) => handleGigPosterManageClick(e)}
          className={clsx(
            responsiveButtonClasses,
            "gap-2",
            "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all duration-200",
          )}
        >
          <Sparkles className="w-4 h-4" />
          <span className="font-medium">
            {gig.isTaken ? "Manage Booking" : "Manage Roles"}
          </span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/hub/gigs/client/edit/${gig._id}`);
          }}
          className={clsx(
            responsiveButtonClasses,
            "gap-2",
            "border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-600",
          )}
        >
          <Edit className="w-4 h-4" />
          <span>Edit</span>
        </Button>
      </div>
    );
  };

  const renderAppliedUserButton = () => {
    const { buttonConfig, showPosition } = getAppliedUserButtonConfig();
    const responsiveButtonClasses = "w-full sm:w-auto px-3 py-1.5 h-9";

    return (
      <Button
        variant={buttonConfig.variant}
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          buttonConfig.onClick();
        }}
        className={clsx(
          responsiveButtonClasses,
          buttonConfig.className,
          showPosition && "relative",
        )}
      >
        {buttonConfig.icon}
        <span>{buttonConfig.label}</span>
        {showPosition && buttonConfig.position && (
          <PositionBadge position={buttonConfig.position} />
        )}
      </Button>
    );
  };

  const renderClientBandCreationButton = () => {
    const responsiveButtonClasses = "w-full sm:w-auto px-3 py-1.5 h-9";

    // Always show for client_band_creation gigs, even if no bandCategory
    if (!gig.bandCategory || gig.bandCategory.length === 0) {
      // Even if no roles defined, show a button to indicate this is a band gig
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setShowRolesModal(true);
          }}
          className={clsx(
            responsiveButtonClasses,
            "gap-2 border-gray-300 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400",
          )}
          title="No roles defined for this band gig"
        >
          <AlertCircle className="w-4 h-4" />
          <span>Band Gig (No Roles)</span>
        </Button>
      );
    }

    const isMusician = currentUser?.isMusician || false;

    // Get qualified roles
    const qualifiedRoles = userQualifiedRoles(
      currentUser as Doc<"users">,
      gig.bandCategory,
    );

    const qualifiedCount = qualifiedRoles.filter(
      (r) => r.isQualified && !r.isFull,
    ).length;
    const totalRoles = gig.bandCategory.length;

    // ALWAYS show button, just with different styles based on qualification
    let buttonVariant: "default" | "outline" = "default";
    let buttonClassName = "";
    let buttonIcon = <Users className="w-4 h-4" />;
    let buttonTitle = `View ${totalRoles} roles`;

    if (!isMusician) {
      buttonVariant = "outline";
      buttonClassName =
        "border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400";
      buttonIcon = <UserX className="w-4 h-4" />;
      buttonTitle = "You must be a musician to apply for band roles";
    } else if (qualifiedCount === 0) {
      buttonVariant = "outline";
      buttonClassName =
        "border-amber-300 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-400";
      buttonIcon = <AlertCircle className="w-4 h-4" />;
      buttonTitle = `You play: ${currentUser?.instrument || "No instrument"}. None of the ${totalRoles} roles match.`;
    } else {
      buttonClassName =
        "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white";
      buttonTitle = `You qualify for ${qualifiedCount} of ${totalRoles} roles`;
    }

    return (
      <Button
        variant={buttonVariant}
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          setShowRolesModal(true);
        }}
        className={clsx(
          responsiveButtonClasses,
          "gap-2 shadow-sm hover:shadow transition-all duration-200 font-medium",
          buttonClassName,
        )}
        title={buttonTitle}
      >
        {buttonIcon}
        <span>
          View Roles ({qualifiedCount}/{totalRoles})
        </span>
      </Button>
    );
  };

  const renderLockedButton = (interestWindowStatus: any) => {
    const responsiveButtonClasses = "w-full sm:w-auto px-3 py-1.5 h-9";

    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className={clsx(
          responsiveButtonClasses,
          "gap-2 border-gray-300 text-gray-500 cursor-not-allowed",
        )}
        title={`Interest window ${interestWindowStatus.status}. Opens: ${interestWindowStatus.opensIn}`}
      >
        <Lock className="w-4 h-4" />
        <span>Opening Soon</span>
      </Button>
    );
  };
  const renderDefaultGigButton = () => {
    const responsiveButtonClasses = "w-full sm:w-auto px-3 py-1.5 h-9";

    if (gig.isTaken) {
      return (
        <Button
          variant="secondary"
          size="sm"
          disabled
          className={clsx(
            responsiveButtonClasses,
            "gap-2",
            "bg-gray-100 dark:bg-gray-800", // Explicit background
            "text-gray-600 dark:text-gray-400",
          )}
        >
          <Lock className="w-4 h-4" />
          <span>Booked</span>
        </Button>
      );
    }

    if (isFull) {
      return (
        <Button
          variant="secondary"
          size="sm"
          disabled
          className={clsx(
            responsiveButtonClasses,
            "gap-2",
            "bg-gray-100 dark:bg-gray-800", // Explicit background
            "text-gray-600 dark:text-gray-400",
          )}
        >
          <AlertCircle className="w-4 h-4" />
          <span>{gigType === "full_band" ? "Bands Full" : "Fully Booked"}</span>
        </Button>
      );
    }

    const buttonConfig = getDefaultButtonConfig();
    if (!buttonConfig) return null;

    const interestWindowStatus = getInterestWindowStatus(gig);
    const isLocked =
      interestWindowStatus.hasWindow && interestWindowStatus.status !== "open";

    if (isLocked) {
      return renderLockedButton(interestWindowStatus);
    }

    return (
      <Button
        variant={buttonConfig.variant}
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          buttonConfig.action();
        }}
        disabled={loading || buttonConfig.disabled}
        className={clsx(
          responsiveButtonClasses,
          "gap-2 font-medium transition-all relative",
          buttonConfig.className,
          buttonConfig.disabled && "cursor-not-allowed", // Ensure cursor shows as disabled
        )}
      >
        {buttonConfig.icon}
        <span>{buttonConfig.label}</span>
        {buttonConfig.isQualified && !buttonConfig.disabled && (
          <QualificationBadge />
        )}
      </Button>
    );
  };

  // ===== Helper Functions =====

  const getAppliedUserButtonConfig = () => {
    const isMusician = currentUser?.isMusician || false;
    const isClient = currentUser?.isClient || false;
    const roleType = currentUser?.roleType || "";

    // Determine user type with fallbacks
    const determineUserType = () => {
      if (isMusician) return "musician";
      if (isClient) return "client";

      // Fallback: check role type
      if (["instrumentalist", "vocalist", "mc", "dj"].includes(roleType)) {
        return "musician";
      }

      // Check if user is gig poster
      if (userStatus.isGigPoster) {
        return "client";
      }

      // Default to musician if they have instrument
      if (currentUser?.instrument) {
        return "musician";
      }

      return "unknown";
    };

    const userType = determineUserType();

    const handleManageClick = () => {
      switch (userType) {
        case "musician":
          // Musicians go to their pending applications
          router.push("/hub/gigs?tab=pending");
          break;

        case "client":
          // Clients (gig posters) go to manage applicants
          switch (gigType) {
            case "client_band_creation":
              router.push(`/hub/gigs/client/${gig._id}/band-applicants`);
              break;
            case "full_band":
              router.push(`/hub/gigs/client/${gig._id}/band-applicants`);
              break;
            default:
              router.push(`/hub/gigs/client/${gig._id}/applicants`);
              break;
          }
          break;

        default:
          // Fallback route
          if (userStatus.isGigPoster) {
            router.push(`/hub/gigs/client/${gig._id}/applicants`);
          } else {
            router.push("/hub/gigs?tab=pending");
          }
          break;
      }
    };

    // Determine button appearance
    let label = "View Application";
    let icon = <UserCheck className="w-4 h-4" />;
    let className = "";
    let position = null;
    let showPosition = false;
    let variant: "outline" | "default" | "secondary" = "outline";

    // Customize based on user type and status
    if (userType === "musician") {
      if (userStatus.isBooked) {
        label = "Booked ✓";
        icon = <CheckCircle className="w-4 h-4" />;
        className =
          "border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20";
        variant = "outline";
      } else if (userStatus.position && userStatus.position > 0) {
        label = `Position #${userStatus.position}`;
        position = userStatus.position;
        showPosition = true;
        className =
          "relative border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20";
        variant = "outline";
      } else if (userStatus.hasShownInterest || userStatus.isInApplicants) {
        label = "Application Pending";
        icon = <Clock className="w-4 h-4" />;
        className =
          "border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20";
        variant = "outline";
      }
    } else if (userType === "client") {
      label = "Manage Applicants";
      icon = <Users className="w-4 h-4" />;
      className =
        "border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20";
      variant = "outline";

      // If gig is taken, show different label
      if (gig.isTaken) {
        label = "Manage Booking";
        icon = <UserCheck className="w-4 h-4" />;
        className =
          "border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20";
      }
    }

    const config = {
      label,
      icon,
      variant,
      className: clsx(
        "gap-2 transition-all duration-200 font-medium",
        className,
      ),
      onClick: handleManageClick,
      position,
      showPosition,
    };

    return { buttonConfig: config, showPosition: config.showPosition };
  };

  // Additional helper functions for button configurations...
  // Check interest window status
  const interestWindowStatus = getInterestWindowStatus(gig);
  const isInterestWindowOpen = interestWindowStatus.status === "open";
  // Add this useEffect to debug
  useEffect(() => {
    if (currentUser && gig.bandCategory) {
      console.log("=== DEBUG: Role Qualification ===");
      console.log("User instruments:", currentUser.instrument);
      console.log("User role type:", currentUser.roleType);
      console.log("Available roles:", gig.bandCategory);

      gig.bandCategory.forEach((role, index) => {
        const isQualified = isUserQualifiedForRole(currentUser, role);
        console.log(`Role ${role.role}:`, {
          requiredSkills: role.requiredSkills,
          isQualified,
          slots: `${role.filledSlots}/${role.maxSlots}`,
        });
      });
    }
  }, [currentUser, gig.bandCategory]);

  const renderProgressBar = () => {
    if (compact) return null;

    const getProgressInfo = () => {
      switch (gigType) {
        case "full_band":
          const bandCount = gig.bookCount?.length || 0;
          const maxBands = gig.maxSlots || 1;
          return {
            used: bandCount,
            total: maxBands,
            label: "bands",
            color: "from-purple-500 to-pink-600",
          };

        case "client_band_creation":
          if (!gig.bandCategory) return null;
          const totalSlots = gig.bandCategory.reduce(
            (sum, role) => sum + role.maxSlots,
            0,
          );
          const filledSlots = gig.bandCategory.reduce(
            (sum, role) => sum + role.filledSlots,
            0,
          );
          return {
            used: filledSlots,
            total: totalSlots,
            label: "roles",
            color: "from-blue-500 to-indigo-600",
          };

        default:
          const interestedCount = gig.interestedUsers?.length || 0;
          const maxSlots = gig.maxSlots || 1;
          return {
            used: interestedCount,
            total: maxSlots,
            label: "applicants",
            color: "from-green-500 to-emerald-600",
          };
      }
    };

    const progress = getProgressInfo();
    if (!progress) return null;

    const percentage = Math.min((progress.used / progress.total) * 100, 100);
    const available = Math.max(0, progress.total - progress.used);

    return (
      <div className="mt-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium">
            {progress.used}/{progress.total} {progress.label}
          </span>
          <span className="text-xs font-semibold">{available} left</span>
        </div>
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${progress.color}`}
            initial={{ width: "0%" }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    );
  };
  // Add this function to debug interest window specifically
  const debugInterestWindowDetails = () => {
    console.log("=== DEBUG: Interest Window Details ===");
    console.log("Gig ID:", gig._id);

    // Check if gig has interest window properties
    console.log("acceptInterestStartTime:", gig.acceptInterestStartTime);
    console.log("acceptInterestEndTime:", gig.acceptInterestEndTime);

    // Parse dates if they exist
    if (gig.acceptInterestStartTime) {
      const startDate = new Date(gig.acceptInterestStartTime);
      console.log("Start Date parsed:", {
        ISO: startDate.toISOString(),
        Local: startDate.toLocaleString(),
        Timestamp: startDate.getTime(),
        Now: Date.now(),
        IsPast: startDate.getTime() < Date.now(),
        IsFuture: startDate.getTime() > Date.now(),
      });
    }

    if (gig.acceptInterestEndTime) {
      const endDate = new Date(gig.acceptInterestEndTime);
      console.log("End Date parsed:", {
        ISO: endDate.toISOString(),
        Local: endDate.toLocaleString(),
        Timestamp: endDate.getTime(),
        Now: Date.now(),
        IsPast: endDate.getTime() < Date.now(),
        IsFuture: endDate.getTime() > Date.now(),
      });
    }

    // Check getInterestWindowStatus result
    const windowStatus = getInterestWindowStatus(gig);
    console.log("Window Status Result:", windowStatus);

    // Manual check
    const now = Date.now();
    console.log("Manual Check:", {
      hasStartTime: !!gig.acceptInterestStartTime,
      hasEndTime: !!gig.acceptInterestEndTime,
      now: new Date(now).toLocaleString(),
      nowTimestamp: now,
    });

    if (gig.acceptInterestStartTime) {
      const start = new Date(gig.acceptInterestStartTime).getTime();
      console.log("Start vs Now:", {
        start,
        now,
        difference: start - now,
        isOpen: now >= start,
      });
    }

    if (gig.acceptInterestEndTime) {
      const end = new Date(gig.acceptInterestEndTime).getTime();
      console.log("End vs Now:", {
        end,
        now,
        difference: now - end,
        isClosed: now > end,
      });
    }
  };
  // Add this function near your other debug functions
  const debugInterestWindow = () => {
    console.log("=== DEBUG Interest Window ===");
    console.log("Gig:", {
      id: gig._id,
      startTime: gig.acceptInterestStartTime,
      endTime: gig.acceptInterestEndTime,
    });

    const now = new Date();
    console.log("Current time:", now.toISOString());

    if (gig.acceptInterestStartTime) {
      const start = new Date(gig.acceptInterestStartTime);
      console.log("Start time parsed:", start.toISOString());
      console.log("Is now >= start?", now >= start);
    }

    if (gig.acceptInterestEndTime) {
      const end = new Date(gig.acceptInterestEndTime);
      console.log("End time parsed:", end.toISOString());
      console.log("Is now <= end?", now <= end);
    }

    const status = getInterestWindowStatus(gig);
    console.log("Window status:", status);
    return status;
  };

  // Call it in useEffect
  useEffect(() => {
    debugInterestWindow();
  }, [gig]);
  // Call it in useEffect
  useEffect(() => {
    debugGigState();
    debugInterestWindowDetails(); // Add this
  }, [currentUser, gig]);
  // ===== MAIN RETURN STATEMENT =====
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        whileHover={{ y: -2 }}
        className={clsx(
          "group relative rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200",
          "cursor-pointer overflow-hidden w-full",
          {
            "ring-1 ring-purple-500":
              isClientBand && userStatus.isInBandApplication,
            "ring-1 ring-green-500":
              !isClientBand && userStatus.hasShownInterest,
          },
        )}
        onClick={handleClick}
        style={getCardStyles()}
      >
        {/* Status indicator */}
        <div
          className={clsx("absolute top-0 left-0 h-1 w-full", {
            "bg-gradient-to-r from-purple-500 to-pink-600": isClientBand,
            "bg-gradient-to-r from-green-500 to-emerald-600":
              !isClientBand && !isFull && !gig.isTaken,
            "bg-gradient-to-r from-yellow-500 to-orange-600": gig.isPending,
            "bg-gradient-to-r from-red-500 to-rose-600": isFull || gig.isTaken,
          })}
        />

        <div className="flex flex-col h-full">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start gap-2 mb-2">
                <h3
                  className="text-base sm:text-lg font-semibold truncate flex-1"
                  style={{ color: gig.fontColor || undefined }}
                >
                  {gig.title}
                </h3>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {getStatusBadge()}
                  {isClientBand && (
                    <Badge
                      variant="outline"
                      className="border-purple-500 text-purple-600 dark:text-purple-400 text-xs"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      Band
                    </Badge>
                  )}
                  {(gig.acceptInterestStartTime ||
                    gig.acceptInterestEndTime) && (
                    <div className="hidden sm:block">
                      <InterestWindowBadge gig={gig} />
                    </div>
                  )}
                </div>
              </div>

              {/* Tags - Responsive */}
              {(gig.bussinesscat || gig.category) && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {gig.bussinesscat && (
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      style={{
                        backgroundColor: gig.backgroundColor
                          ? `${gig.backgroundColor}30`
                          : undefined,
                        color: gig.fontColor || undefined,
                      }}
                    >
                      {gig.bussinesscat}
                    </Badge>
                  )}
                  {gig.category && (
                    <Badge variant="secondary" className="text-xs">
                      {gig.category}
                    </Badge>
                  )}
                  {gig.negotiable && (
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{
                        borderColor: gig.fontColor
                          ? `${gig.fontColor}50`
                          : undefined,
                        color: gig.fontColor || undefined,
                      }}
                    >
                      Negotiable
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex-shrink-0 self-end sm:self-start">
              <div
                className="text-xl sm:text-2xl font-bold whitespace-nowrap"
                style={{ color: gig.fontColor || undefined }}
              >
                {gig.price ? `$${gig.price}` : "Contact"}
              </div>
              {gig.paymentStatus && (
                <Badge
                  variant="outline"
                  className={clsx("text-xs mt-1 w-full justify-center", {
                    "border-green-500 text-green-600":
                      gig.paymentStatus === "paid",
                    "border-yellow-500 text-yellow-600":
                      gig.paymentStatus === "pending",
                    "border-red-500 text-red-600":
                      gig.paymentStatus === "refunded",
                  })}
                >
                  {gig.paymentStatus}
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          {!compact && gig.description && (
            <p
              className="text-sm mb-3 line-clamp-2"
              style={{
                color: gig.fontColor ? `${gig.fontColor}CC` : undefined,
              }}
            >
              {gig.description}
            </p>
          )}
          {/* Band applications preview */}
          {renderBandApplicationsPreview()}
          {/* Progress bar */}
          {renderProgressBar()}
          {/* Location and time */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3 mb-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {gig.location && (
                <div className="flex items-center gap-1 min-w-0">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span
                    className="truncate max-w-[120px] sm:max-w-[150px]"
                    style={{
                      color: gig.fontColor ? `${gig.fontColor}CC` : undefined,
                    }}
                  >
                    {gig.location}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">{formattedDate}</span>
              </div>
              {gig.time?.start && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">{formattedTime}</span>
                </div>
              )}
            </div>

            {/* View count */}
            <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 self-start sm:self-center">
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{gig.viewCount?.length || 0}</span>
            </div>
          </div>
          {/* FOOTER */}
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t"
            style={{
              borderTopColor: gig.fontColor ? `${gig.fontColor}20` : undefined,
            }}
          >
            {/* Poster info */}
            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0">
                <AvatarImage src={gigPoster?.picture} />
                <AvatarFallback className="text-xs">
                  {gigPoster?.firstname?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p
                  className="text-xs sm:text-sm font-medium truncate"
                  style={{
                    color: gig.fontColor ? `${gig.fontColor}CC` : undefined,
                  }}
                >
                  {gigPoster?.firstname || "User"}
                </p>
                {gigPoster?.city && (
                  <p className="text-xs text-gray-500 truncate">
                    {gigPoster.city}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex items-center gap-2 self-stretch sm:self-center">
                {/* Save/Favorite - Hidden on mobile */}
                <div className="hidden sm:flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSave();
                          }}
                          className="p-1.5 rounded-md transition-colors"
                          title={isSaved ? "Remove from saved" : "Save"}
                          style={{
                            backgroundColor: gig.backgroundColor
                              ? `${gig.backgroundColor}20`
                              : undefined,
                            color: gig.fontColor
                              ? `${gig.fontColor}80`
                              : undefined,
                          }}
                          onMouseEnter={(e) => {
                            if (gig.backgroundColor) {
                              e.currentTarget.style.backgroundColor = `${gig.backgroundColor}40`;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (gig.backgroundColor) {
                              e.currentTarget.style.backgroundColor = `${gig.backgroundColor}20`;
                            } else {
                              e.currentTarget.style.backgroundColor = "";
                            }
                          }}
                        >
                          {isSaved ? (
                            <Bookmark
                              className="w-4 h-4"
                              style={{ fill: gig.fontColor || "#fbbf24" }}
                            />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isSaved ? "Remove from saved" : "Save"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFavorite();
                          }}
                          className={`p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                          title={isFavorite ? "Remove favorite" : "Favorite"}
                        >
                          {isFavorite ? (
                            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                          ) : (
                            <Heart className="w-4 h-4" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isFavorite ? "Remove favorite" : "Favorite"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Mobile save/favorite button */}
                <div className="sm:hidden">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSave();
                          }}
                          className={`p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                        >
                          {isSaved ? (
                            <Bookmark className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isSaved ? "Remove saved" : "Save"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Primary action */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 sm:flex-none"
                >
                  {renderActionButton()}
                </div>
              </div>
            )}
          </div>
          {/* Mobile interest window badge */}
          {(gig.acceptInterestStartTime || gig.acceptInterestEndTime) && (
            <div className="sm:hidden mt-2 flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span className="truncate">{interestWindowStatus.message}</span>
            </div>
          )}
        </div>
      </motion.div>
      <Dialog open={showInterestModal} onOpenChange={setShowInterestModal}>
        <DialogContent
          className={cn(
            "sm:max-w-md rounded-xl shadow-xl",
            colors.background,
            colors.border,
            "border-2",
          )}
        >
          <DialogHeader className={cn("pb-3", colors.border)}>
            <DialogTitle className={cn("text-xl font-bold", colors.text)}>
              Show Interest in "{gig.title}"
            </DialogTitle>
            <DialogDescription className={cn(colors.textMuted)}>
              Add an optional note to introduce yourself.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Interest Window Info */}
            {(gig.acceptInterestStartTime || gig.acceptInterestEndTime) && (
              <div
                className={cn(
                  "p-3 rounded-lg border",
                  interestWindowStatus.status === "open"
                    ? cn(
                        colors.successBg,
                        colors.successBorder,
                        "border",
                        colors.text,
                      )
                    : cn(
                        colors.infoBg,
                        colors.infoBorder,
                        "border",
                        colors.text,
                      ),
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Clock
                    className={cn(
                      "w-4 h-4",
                      interestWindowStatus.status === "open"
                        ? colors.successText
                        : colors.infoText,
                    )}
                  />
                  <span
                    className={cn(
                      "font-medium",
                      interestWindowStatus.status === "open"
                        ? colors.successText
                        : colors.infoText,
                    )}
                  >
                    Interest Window
                  </span>
                </div>
                <p
                  className={cn(
                    "text-sm",
                    interestWindowStatus.status === "open"
                      ? colors.successText
                      : colors.infoText,
                  )}
                >
                  {interestWindowStatus.message}
                </p>
              </div>
            )}

            {/* Available slots */}
            <div
              className={cn(
                "p-3 rounded-lg border",
                isDarkMode
                  ? "bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/30"
                  : "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200",
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-sm font-medium",
                    isDarkMode ? "text-blue-300" : "text-blue-700",
                  )}
                >
                  Available: {availableSlots}/{maxSlots}
                </span>
                {availableSlots <= 2 && (
                  <Badge
                    variant="destructive"
                    className="animate-pulse bg-gradient-to-r from-red-500 to-orange-500"
                  >
                    Almost Full!
                  </Badge>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label
                className={cn("text-sm font-medium mb-2 block", colors.text)}
              >
                Notes
              </label>
              <Textarea
                value={interestNotes}
                onChange={(e) => setInterestNotes(e.target.value)}
                placeholder="Tell the client why you're interested..."
                className={cn(
                  "min-h-[80px] rounded-xl border-2 transition-all",
                  colors.border,
                  colors.background,
                  "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20",
                  colors.text,
                )}
              />
            </div>
          </div>

          <DialogFooter
            className={cn(
              "flex-col sm:flex-row gap-3 pt-4",
              colors.border,
              "border-t",
            )}
          >
            <Button
              variant="outline"
              onClick={() => setShowInterestModal(false)}
              disabled={loading}
              className={cn(
                "w-full sm:w-auto rounded-xl",
                colors.border,
                colors.hoverBg,
                colors.text,
              )}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleRegularInterest(interestNotes)}
              disabled={loading}
              className={cn(
                "w-full sm:w-auto rounded-xl font-semibold",
                colors.gradientPrimary,
                "text-white shadow-lg",
                colors.primaryBgHover,
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Show Interest</span>
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBandJoinModal} onOpenChange={setShowBandJoinModal}>
        <DialogContent
          className={cn(
            "sm:max-w-md rounded-xl shadow-xl",
            colors.background,
            colors.border,
            "border-2",
          )}
        >
          <DialogHeader className={cn("pb-3", colors.border)}>
            <DialogTitle className={cn("text-xl font-bold", colors.text)}>
              Apply with Band
            </DialogTitle>
            <DialogDescription className={cn(colors.textMuted)}>
              Select a role and apply with your band members.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Available slots */}
            <div
              className={cn(
                "p-3 rounded-lg border",
                isDarkMode
                  ? "bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-800/30"
                  : "bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200",
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-sm font-medium",
                    isDarkMode ? "text-purple-300" : "text-purple-700",
                  )}
                >
                  Available: {availableSlots}/{maxSlots} bands
                </span>
                {availableSlots <= 2 && (
                  <Badge
                    variant="destructive"
                    className="animate-pulse bg-gradient-to-r from-red-500 to-orange-500"
                  >
                    Almost Full!
                  </Badge>
                )}
              </div>
              {bandCount > 0 && (
                <p
                  className={cn(
                    "text-xs mt-1",
                    isDarkMode ? "text-purple-400" : "text-purple-600",
                  )}
                >
                  {bandCount} bands applied • {totalBandMembers} total musicians
                </p>
              )}
            </div>

            {/* Name */}
            <div>
              <label
                className={cn("text-sm font-medium mb-2 block", colors.text)}
              >
                Band Name / Your Name
              </label>
              <Input
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="Enter band name or your name"
                className={cn(
                  "rounded-xl border-2 transition-all",
                  colors.border,
                  "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20",
                  colors.background,
                  colors.text,
                )}
              />
            </div>

            {/* Role selection */}
            {gig.bandCategory && gig.bandCategory.length > 0 && (
              <div>
                <label
                  className={cn("text-sm font-medium mb-2 block", colors.text)}
                >
                  Band Role
                </label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger
                    className={cn(
                      "rounded-xl border-2 transition-all",
                      colors.border,
                      colors.background,
                      colors.text,
                      "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20",
                    )}
                  >
                    <SelectValue placeholder="Choose a role for your band" />
                  </SelectTrigger>
                  <SelectContent
                    className={cn(
                      colors.background,
                      colors.border,
                      "rounded-xl shadow-lg border-2",
                    )}
                  >
                    {gig.bandCategory.map((role, index) => {
                      const isFull = role.filledSlots >= role.maxSlots;
                      const isBooked = role.bookedUsers.includes(
                        currentUserId!,
                      );
                      const hasApplied = role.applicants.includes(
                        currentUserId!,
                      );

                      return (
                        <SelectItem
                          key={index}
                          value={role.role}
                          disabled={isFull || isBooked || hasApplied}
                          className={cn(
                            "py-3 px-4 rounded-lg my-1 transition-colors",
                            colors.hoverBg,
                            colors.text,
                            isFull && "opacity-50 cursor-not-allowed",
                            hasApplied &&
                              !isBooked &&
                              cn(colors.infoBg, colors.infoText),
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{role.role}</span>
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "text-xs px-2 py-1 rounded-full",
                                  isDarkMode
                                    ? "bg-gray-800 text-gray-300"
                                    : "bg-gray-100 text-gray-700",
                                )}
                              >
                                {role.filledSlots}/{role.maxSlots}
                              </span>
                              {isBooked && (
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-xs",
                                    colors.successBg,
                                    colors.successBorder,
                                    colors.successText,
                                  )}
                                >
                                  Booked
                                </Badge>
                              )}
                              {hasApplied && !isBooked && (
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-xs",
                                    colors.infoBg,
                                    colors.infoBorder,
                                    colors.infoText,
                                  )}
                                >
                                  Applied
                                </Badge>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Applied bands */}
            {bandApplications.length > 0 && (
              <div>
                <label
                  className={cn("text-sm font-medium mb-2 block", colors.text)}
                >
                  Applied Bands ({bandApplications.length})
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                  {bandApplications.map((band, index) => {
                    const firstMember = band.performingMembers?.[0];
                    const bandName = firstMember?.name || `Band ${index + 1}`;
                    const memberCount = band.performingMembers?.length || 0;
                    const isCurrentUserBand = band.appliedBy === currentUserId;

                    return (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl border transition-all",
                          colors.backgroundMuted,
                          colors.border,
                          colors.text,
                          "hover:shadow-md",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar
                            className={cn(
                              "w-9 h-9 border-2",
                              isDarkMode
                                ? "bg-gradient-to-br from-purple-700/30 to-pink-700/30 border-purple-600/30"
                                : "bg-gradient-to-br from-purple-100 to-pink-100 border-purple-200",
                            )}
                          >
                            <AvatarFallback
                              className={cn(
                                "font-semibold",
                                isDarkMode
                                  ? "text-purple-300"
                                  : "text-purple-600",
                              )}
                            >
                              {bandName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p
                                className={cn(
                                  "text-sm font-medium",
                                  colors.text,
                                )}
                              >
                                {bandName}'s Band
                              </p>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs",
                                  isDarkMode
                                    ? "border-purple-700 text-purple-300 bg-purple-900/20"
                                    : "border-purple-300 text-purple-700 bg-purple-50",
                                )}
                              >
                                {memberCount}{" "}
                                {memberCount === 1 ? "member" : "members"}
                              </Badge>
                            </div>
                            <p className={cn("text-xs", colors.textMuted)}>
                              Status: {band.status || "Applied"}
                            </p>
                          </div>
                        </div>
                        {isCurrentUserBand && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              colors.primary,
                              colors.border,
                              isDarkMode ? "bg-orange-900/20" : "bg-orange-50",
                            )}
                          >
                            Your Band
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter
            className={cn(
              "flex-col sm:flex-row gap-3 pt-4",
              colors.border,
              "border-t",
            )}
          >
            <Button
              variant="outline"
              onClick={() => setShowBandJoinModal(false)}
              disabled={loading}
              className={cn(
                "w-full sm:w-auto rounded-xl",
                colors.border,
                colors.hoverBg,
                colors.text,
              )}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedRole) {
                  const roleIndex = gig.bandCategory?.findIndex(
                    (r) => r.role === selectedRole,
                  );
                  if (roleIndex !== undefined && roleIndex >= 0) {
                    const action = handleBandAction(roleIndex);
                    if (action?.action) {
                      action.action().then(() => setShowBandJoinModal(false));
                    }
                  }
                }
              }}
              disabled={
                loading || !selectedRole || !memberName.trim() || bandIsFull
              }
              className={cn(
                "w-full sm:w-auto rounded-xl font-semibold",
                colors.gradientPrimary,
                "text-white shadow-lg hover:shadow-xl transition-all duration-200",
                colors.primaryBgHover,
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Applying...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>Apply with Band</span>
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Selection Modal */}
      <Dialog
        open={showRoleSelectionModal}
        onOpenChange={setShowRoleSelectionModal}
      >
        <DialogContent
          className={cn(
            "sm:max-w-md",
            colors.background,
            colors.border,
            "rounded-xl shadow-xl",
          )}
        >
          <DialogHeader className={cn("pb-3", colors.border)}>
            <DialogTitle className={cn("text-xl font-bold", colors.text)}>
              Select Role to Apply For
            </DialogTitle>
            <DialogDescription className={cn(colors.textMuted)}>
              You're qualified for multiple roles. Choose one to apply:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {getUserQualifiedRoles.map((role, index) => {
              const roleIndex =
                gig.bandCategory?.findIndex((r) => r.role === role.role) || 0;
              const bandRole = gig.bandCategory?.[roleIndex];
              const roleColors = getRoleColors(roleIndex);

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "p-4 rounded-xl border cursor-pointer transition-all duration-200",
                    "hover:scale-[1.02] hover:shadow-lg",
                    colors.border,
                    colors.hoverBg,
                  )}
                  onClick={() => {
                    setSelectedRoleForApplication(role);
                    setShowRoleSelectionModal(false);
                    setShowApplicationModal(true);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className={cn("font-semibold text-base", colors.text)}
                          style={{ color: roleColors.text }}
                        >
                          {role.role}
                        </h4>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            "bg-gradient-to-r from-purple-50 to-pink-50",
                            "dark:from-purple-900/20 dark:to-pink-900/20",
                          )}
                        >
                          {bandRole?.filledSlots || 0}/{bandRole?.maxSlots || 1}{" "}
                          slots
                        </Badge>
                      </div>

                      {bandRole?.description && (
                        <p
                          className={cn("text-sm mb-2", colors.textMuted)}
                          style={{ color: `${roleColors.text}CC` }}
                        >
                          {bandRole.description}
                        </p>
                      )}

                      {bandRole?.requiredSkills &&
                        bandRole.requiredSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {bandRole.requiredSkills
                              .slice(0, 3)
                              .map((skill, i) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="text-xs"
                                  style={{
                                    backgroundColor: roleColors.bg,
                                    color: roleColors.text,
                                    borderColor: roleColors.border,
                                  }}
                                >
                                  {skill}
                                </Badge>
                              ))}
                            {bandRole.requiredSkills.length > 3 && (
                              <Badge
                                variant="outline"
                                className="text-xs"
                                style={{
                                  backgroundColor: roleColors.bg,
                                  color: roleColors.text,
                                  borderColor: roleColors.border,
                                }}
                              >
                                +{bandRole.requiredSkills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}

                      {bandRole?.price && (
                        <div className="flex items-center gap-2 mt-2">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span
                            className={cn("text-sm font-medium", colors.text)}
                            style={{ color: colors.successText }}
                          >
                            ${bandRole.price}
                          </span>
                          {bandRole.negotiable && (
                            <Badge
                              variant="outline"
                              className="text-xs border-amber-500/30 text-amber-600 dark:text-amber-400"
                            >
                              Negotiable
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <ChevronRight
                      className="w-5 h-5 ml-2 flex-shrink-0"
                      style={{ color: roleColors.text }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          <DialogFooter
            className={cn(
              "flex-col sm:flex-row gap-3 pt-4",
              colors.border,
              "border-t",
            )}
          >
            <Button
              variant="outline"
              onClick={() => setShowRoleSelectionModal(false)}
              className={cn(
                "w-full sm:w-auto rounded-xl",
                colors.border,
                colors.hoverBg,
                colors.text,
              )}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (getUserQualifiedRoles.length > 0) {
                  // Auto-select the first role if user doesn't manually select
                  setSelectedRoleForApplication(getUserQualifiedRoles[0]);
                  setShowRoleSelectionModal(false);
                  setShowApplicationModal(true);
                }
              }}
              className={cn(
                "w-full sm:w-auto rounded-xl font-semibold",
                "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
                "text-white shadow-lg",
              )}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Quick Apply (First Role)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Application Modal */}
      <Dialog
        open={showApplicationModal}
        onOpenChange={setShowApplicationModal}
      >
        <DialogContent
          className={cn(
            "sm:max-w-md",
            colors.background,
            colors.border,
            "rounded-xl shadow-xl",
          )}
        >
          <DialogHeader className={cn("pb-3", colors.border)}>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: selectedRoleForApplication
                    ? getRoleColors(
                        gig.bandCategory?.findIndex(
                          (r) => r.role === selectedRoleForApplication.role,
                        ) || 0,
                      ).bg
                    : colors.backgroundMuted,
                }}
              >
                <Music
                  className="w-6 h-6"
                  style={{
                    color: selectedRoleForApplication
                      ? getRoleColors(
                          gig.bandCategory?.findIndex(
                            (r) => r.role === selectedRoleForApplication.role,
                          ) || 0,
                        ).text
                      : colors.text,
                  }}
                />
              </div>
              <div>
                <DialogTitle className={cn("text-xl font-bold", colors.text)}>
                  Apply for {selectedRoleForApplication?.role}
                </DialogTitle>
                <DialogDescription className={cn(colors.textMuted)}>
                  Submit your application for this role
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label
                className={cn("text-sm font-medium mb-2 block", colors.text)}
              >
                Application Notes
              </label>
              <Textarea
                placeholder="Tell the client why you're a good fit for this role..."
                className={cn(
                  "min-h-[100px] rounded-xl border-2 transition-all",
                  colors.border,
                  "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20",
                  colors.background,
                )}
                value={interestNotes}
                onChange={(e) => setInterestNotes(e.target.value)}
              />
              <p className={cn("text-xs mt-1", colors.textMuted)}>
                Optional. Share your experience or special skills.
              </p>
            </div>

            {selectedRoleForApplication && (
              <div
                className={cn(
                  "p-4 rounded-xl border",
                  "bg-gradient-to-r from-blue-50/50 to-cyan-50/50",
                  "dark:from-blue-900/10 dark:to-cyan-900/10",
                  colors.border,
                )}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Music className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className={cn("font-semibold", colors.text)}>
                      Role Details
                    </h4>
                    <p className={cn("text-xs", colors.textMuted)}>
                      Review requirements before applying
                    </p>
                  </div>
                </div>

                {selectedRoleForApplication.requiredSkills &&
                  selectedRoleForApplication.requiredSkills.length > 0 && (
                    <div className="mb-3">
                      <p
                        className={cn("text-sm font-medium mb-2", colors.text)}
                      >
                        Required Skills:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedRoleForApplication.requiredSkills.map(
                          (skill, i) => {
                            const userHasSkill = isUserQualifiedForRole(
                              currentUser!,
                              selectedRoleForApplication!,
                            );
                            return (
                              <Badge
                                key={i}
                                variant={userHasSkill ? "default" : "outline"}
                                className={cn(
                                  "text-xs",
                                  userHasSkill
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                    : "border-amber-500/30 text-amber-600 dark:text-amber-400",
                                )}
                              >
                                {skill}
                                {userHasSkill && (
                                  <CheckCircle className="w-3 h-3 ml-1" />
                                )}
                              </Badge>
                            );
                          },
                        )}
                      </div>
                    </div>
                  )}

                {selectedRoleForApplication.description && (
                  <div className="mb-3">
                    <p className={cn("text-sm font-medium mb-1", colors.text)}>
                      Description:
                    </p>
                    <p className={cn("text-sm", colors.textMuted)}>
                      {selectedRoleForApplication.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                  <div>
                    <p className={cn("text-xs font-medium", colors.textMuted)}>
                      Slots Available
                    </p>
                    <p className={cn("text-lg font-bold", colors.text)}>
                      {selectedRoleForApplication.maxSlots -
                        selectedRoleForApplication.filledSlots}
                      /{selectedRoleForApplication.maxSlots}
                    </p>
                  </div>
                  <div>
                    <p className={cn("text-xs font-medium", colors.textMuted)}>
                      Rate
                    </p>
                    <p className={cn("text-lg font-bold", colors.text)}>
                      ${selectedRoleForApplication.price || "Contact"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter
            className={cn(
              "flex-col sm:flex-row gap-3 pt-4",
              colors.border,
              "border-t",
            )}
          >
            <Button
              variant="outline"
              onClick={() => {
                setShowApplicationModal(false);
                setSelectedRoleForApplication(null);
                setInterestNotes("");
              }}
              className={cn(
                "w-full sm:w-auto rounded-xl",
                colors.border,
                colors.hoverBg,
                colors.text,
              )}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedRoleForApplication && currentUser) {
                  const roleIndex =
                    gig.bandCategory?.findIndex(
                      (r) => r.role === selectedRoleForApplication.role,
                    ) || 0;

                  // Apply for the role
                  applyForBandRole({
                    gigId: gig._id,
                    bandRoleIndex: roleIndex,
                    userId: currentUser._id,
                    applicationNotes: interestNotes,
                  })
                    .then(() => {
                      toast.success(
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold">
                              Application Submitted!
                            </p>
                            <p className="text-sm opacity-90">
                              Applied for {selectedRoleForApplication.role}
                            </p>
                          </div>
                        </div>,
                      );
                      setShowApplicationModal(false);
                      setSelectedRoleForApplication(null);
                      setInterestNotes("");
                    })
                    .catch((error) => {
                      toast.error(
                        error.message || "Failed to submit application",
                        {
                          style: {
                            background: colors.destructiveBg,
                            color: colors.destructive,
                            borderColor: colors.destructive,
                          },
                        },
                      );
                    });
                }
              }}
              className={cn(
                "w-full sm:w-auto rounded-xl font-semibold",
                "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
                "text-white shadow-lg hover:shadow-xl transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Applying...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  <span>Apply Now</span>
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* View Roles Modal */}
      <Dialog open={showRolesModal} onOpenChange={setShowRolesModal}>
        <DialogContent
          className={cn(
            "sm:max-w-lg max-h-[80vh] overflow-y-auto",
            colors.background,
            colors.border,
            "rounded-xl shadow-xl",
          )}
        >
          <DialogHeader className={cn("pb-3", colors.border)}>
            <DialogTitle
              className={cn(
                "text-xl font-bold flex items-center gap-2",
                colors.text,
              )}
            >
              <Users className="w-5 h-5" />
              Available Roles
            </DialogTitle>
            <DialogDescription className={cn(colors.textMuted)}>
              {gig.bandCategory?.length || 0} total roles • Select one to apply
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Summary stats */}
            <div
              className={cn(
                "p-3 rounded-xl border",
                isDarkMode
                  ? "bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-800/30"
                  : "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200",
              )}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={cn("text-xs font-medium", colors.textMuted)}>
                    Your Skills
                  </p>
                  <p className={cn("text-lg font-bold", colors.text)}>
                    {currentUser?.instrument || "No instrument set"}
                  </p>
                </div>
                <div>
                  <p className={cn("text-xs font-medium", colors.textMuted)}>
                    Matches
                  </p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {getUserQualifiedRoles.length} role
                    {getUserQualifiedRoles.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* All Roles List */}
            <div className="space-y-3">
              {gig.bandCategory?.map((role, index) => {
                const isQualified = isUserQualifiedForRole(currentUser!, role);
                const isRoleFull = role.filledSlots >= role.maxSlots;
                const hasApplied =
                  currentUser?._id && role.applicants.includes(currentUser._id);
                const isBooked =
                  currentUser?._id &&
                  role.bookedUsers.includes(currentUser._id);
                const roleAction = handleBandAction(index);
                const roleColors = getRoleColors(index);

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "p-4 rounded-xl border transition-all duration-200",
                      colors.border,
                      isQualified && !isRoleFull && !hasApplied && !isBooked
                        ? "cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                        : "cursor-not-allowed opacity-60",
                      isQualified &&
                        "border-green-200 bg-green-50/50 dark:bg-green-900/10",
                      !isQualified && "border-gray-200 dark:border-gray-800",
                    )}
                    onClick={() => {
                      if (
                        isQualified &&
                        !isRoleFull &&
                        !hasApplied &&
                        !isBooked
                      ) {
                        setShowRolesModal(false);
                        if (roleAction?.action) {
                          roleAction.action();
                        }
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Role Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                              isQualified
                                ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
                            )}
                          >
                            {getRoleIcon(role.role)}
                          </div>
                          <div className="min-w-0">
                            <h4
                              className={cn(
                                "font-semibold truncate",
                                colors.text,
                              )}
                            >
                              {role.role}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {role.filledSlots}/{role.maxSlots} slots
                              </Badge>
                              {role.price && (
                                <Badge
                                  variant="outline"
                                  className="text-xs border-green-500/30 text-green-600 dark:text-green-400"
                                >
                                  ${role.price}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        {role.description && (
                          <p
                            className={cn(
                              "text-sm mb-2 line-clamp-2",
                              colors.textMuted,
                            )}
                          >
                            {role.description}
                          </p>
                        )}

                        {/* Required Skills */}
                        {role.requiredSkills &&
                          role.requiredSkills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {role.requiredSkills
                                .slice(0, 3)
                                .map((skill, i) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className={cn(
                                      "text-xs",
                                      isQualified
                                        ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
                                        : "bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700",
                                    )}
                                  >
                                    {skill}
                                    {isQualified && (
                                      <CheckCircle className="w-3 h-3 ml-1 inline" />
                                    )}
                                  </Badge>
                                ))}
                              {role.requiredSkills.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{role.requiredSkills.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                      </div>

                      {/* Status/Action */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {isBooked ? (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            Booked ✓
                          </Badge>
                        ) : hasApplied ? (
                          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            Applied ✓
                          </Badge>
                        ) : isRoleFull ? (
                          <Badge
                            variant="secondary"
                            className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                          >
                            Role Full
                          </Badge>
                        ) : isQualified ? (
                          <div className="flex flex-col items-end gap-1">
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                              ✓ Qualified
                            </Badge>
                            <Button
                              size="sm"
                              className={cn(
                                "text-xs h-7 px-3",
                                "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
                                "text-white border-0 shadow-sm",
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowRolesModal(false);
                                if (roleAction?.action) {
                                  roleAction.action();
                                }
                              }}
                            >
                              Apply Now
                            </Button>
                          </div>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-gray-500 border-gray-300"
                          >
                            Not Qualified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {(!gig.bandCategory || gig.bandCategory.length === 0) && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className={cn("font-medium mb-1", colors.text)}>
                    No Roles Available
                  </h4>
                  <p className={cn("text-sm", colors.textMuted)}>
                    This gig doesn't have any defined roles yet.
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter
            className={cn(
              "flex-col sm:flex-row gap-3 pt-4 mt-4",
              colors.border,
              "border-t",
            )}
          >
            <div className="text-center sm:text-left flex-1">
              <p className={cn("text-xs", colors.textMuted)}>
                Need different skills? Update your profile.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRolesModal(false)}
                className={cn(
                  "rounded-xl",
                  colors.border,
                  colors.hoverBg,
                  colors.text,
                )}
              >
                Close
              </Button>
              <Button
                onClick={() => router.push("/hub/profile/edit")}
                variant="outline"
                className={cn(
                  "rounded-xl border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20",
                )}
              >
                Update Profile
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showWarningModal} onOpenChange={setShowWarningModal}>
        <DialogContent className="sm:max-w-[400px] border-orange-200 bg-orange-50/50 dark:bg-zinc-950 dark:border-orange-900/30">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-2">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-orange-800 dark:text-orange-400">
              Role Mismatch
            </DialogTitle>
            <DialogDescription className="text-zinc-600 dark:text-zinc-400 pt-2">
              {warningReason}
            </DialogDescription>
          </DialogHeader>

          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-orange-100 dark:border-orange-900/20 my-2">
            <p className="text-xs leading-relaxed text-zinc-500">
              To maintain quality, clients prefer musicians who match the
              requested category. If you have multiple skills, please update
              your **Profile Settings** before applying.
            </p>
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/settings/profile")}
              className="w-full border-orange-200 hover:bg-orange-100"
            >
              Update My Profile
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowWarningModal(false)}
              className="w-full text-zinc-500"
            >
              Got it, thanks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GigCard;
