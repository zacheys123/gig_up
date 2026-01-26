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
  Send, // Add this import
} from "lucide-react";

// Convex imports
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

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
import { getInterestWindowStatus } from "@/utils";
import { cn } from "@/lib/utils";
import { getUserGigStatus, type GigUserStatus } from "@/utils";
import { isUserQualifiedForRole } from "@/mapping/userRoleMapping";

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
          <Badge
            variant={badgeProps.variant}
            className={clsx(
              "inline-flex items-center gap-1 text-xs font-medium px-2 py-1",
              badgeProps.className,
            )}
          >
            <Icon className="w-3 h-3 flex-shrink-0" />
            <span className="hidden sm:inline truncate max-w-[80px]">
              {status.message}
            </span>
            <span className="sm:hidden">!</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{status.message}</p>
          {gig.acceptInterestStartTime && (
            <p className="text-xs text-gray-500 mt-1">
              Opens: {formatDate(gig.acceptInterestStartTime)}
            </p>
          )}
          {gig.acceptInterestEndTime && (
            <p className="text-xs text-gray-500 mt-1">
              Closes: {formatDate(gig.acceptInterestEndTime)}
            </p>
          )}
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

      case "client_band_creation":
        // Client band creation: each role has its own slots
        if (!gig.bandCategory || gig.bandCategory.length === 0) return false;
        return gig.bandCategory.every(
          (role) => role.filledSlots >= role.maxSlots,
        );

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

    return gig.bandCategory.filter(
      (role) =>
        role.filledSlots < role.maxSlots &&
        isUserQualifiedForRole(currentUser, role),
    );
  }, [currentUser, gig.bandCategory]);

  // const isRoleFull = (roleIndex: number) => {
  //   const role = gig.bandCategory?.[roleIndex];
  //   if (!role) return true;
  //   return role.filledSlots >= role.maxSlots;
  // };

  // const isUserQualifiedForSpecificRole = (roleIndex: number) => {
  //   if (!currentUser) return false;
  //   const role = gig.bandCategory?.[roleIndex];
  //   if (!role) return false;

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
      // Show a more informative message
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

    if (getUserQualifiedRoles.length === 1) {
      // Apply directly to the single role
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

      // Show confirmation modal or apply directly
      setSelectedRoleForApplication(role);
      setShowApplicationModal(true);
    } else {
      // Show role selection modal
      setShowRoleSelectionModal(true);
    }
  };

  // Regular gig interest handler - FIXED: Using userStatus instead of regularIsInterested
  const handleRegularInterest = async (notes?: string) => {
    if (!currentUserId) {
      toast.error("Sign in to show interest");
      return;
    }

    if (gig.isTaken) {
      toast.error("Gig already taken");
      return;
    }

    if (isFull) {
      toast.error("Fully booked!");
      return;
    }

    setLoading(true);
    try {
      if (userStatus.hasShownInterest) {
        // Changed from regularIsInterested
        await removeInterestFromGig({
          gigId: gig._id,
          clerkId: userId!,
          reason: "Withdrew interest",
        });
        toast.success("Interest removed");
      } else {
        await showInterestInGig({
          gigId: gig._id,
          userId: currentUserId,
          notes: notes || undefined,
        });

        toast.success(
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
              <UserCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="font-medium">Interest shown!</p>
              <p className="text-sm opacity-90">
                Position #{userPosition || "?"} • {availableSlots} left
              </p>
            </div>
          </div>,
        );
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setLoading(false);
      setShowInterestModal(false);
      setInterestNotes("");
    }
  };
  // Add this handleBandAction function after your other handlers
  const handleBandAction = useCallback(
    (bandRoleIndex: number): BandAction | null => {
      if (!gig.bandCategory || !gig.bandCategory[bandRoleIndex]) return null;

      const role = gig.bandCategory[bandRoleIndex];
      const currentUserId = currentUser?._id;

      if (!currentUserId) return null;

      const isGigPoster = currentUserId === gig.postedBy;
      const hasApplied = role.applicants.includes(currentUserId);
      const isBooked = role.bookedUsers.includes(currentUserId);
      const isRoleFull = role.filledSlots >= role.maxSlots;
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

  const getBadgeStyle = () => {
    const bgColor = gig.backgroundColor;
    const fontColor = gig.fontColor;

    const badgeColor = fontColor || "#ef4444";
    const textColor = getContrastColor(badgeColor);

    const hex = badgeColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    let finalBadgeColor = badgeColor;
    if (luminance > 0.7) {
      finalBadgeColor = "#dc2626";
    } else if (luminance < 0.3) {
      finalBadgeColor = "#f87171";
    }

    return {
      backgroundColor: finalBadgeColor,
      color: getContrastColor(finalBadgeColor),
      fontWeight: "bold" as const,
      boxShadow: "0 0 0 1px rgba(0,0,0,0.1)",
    };
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
  // Update your renderBandRoleActions function to this:
  const renderBandRoleActions = () => {
    if (!gig.bandCategory || gig.bandCategory.length === 0) return null;
    if (compact) return null; // Don't show in compact mode

    return (
      <div
        className="space-y-3 mt-4 pt-4 border-t"
        style={{
          borderTopColor: gig.fontColor ? `${gig.fontColor}20` : undefined,
        }}
      >
        <div
          className={cn(
            "text-sm font-semibold flex items-center gap-2",
            colors.text,
          )}
        >
          <Music className="w-4 h-4" />
          Band Roles ({gig.bandCategory.length})
        </div>
        <div className="space-y-2">
          {gig.bandCategory.map((role, index) => {
            const action = handleBandAction(index);
            const roleColors = getRoleColors(index);

            if (!action) return null;

            return (
              <div
                key={index}
                className={cn(
                  "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border transition-all hover:shadow-sm",
                  colors.border,
                  colors.hoverBg,
                )}
              >
                {/* Role Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                    style={{
                      backgroundColor: roleColors.bg,
                      color: roleColors.text,
                    }}
                  >
                    <span className="text-lg">{getRoleIcon(role.role)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4
                        className={cn(
                          "font-semibold text-sm truncate",
                          colors.text,
                        )}
                      >
                        {role.role}
                      </h4>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs flex-shrink-0 px-2 py-0.5",
                          colors.border,
                        )}
                      >
                        {role.filledSlots}/{role.maxSlots} slots
                      </Badge>
                      {role.price && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200"
                        >
                          ${role.price}
                        </Badge>
                      )}
                    </div>

                    {role.description && (
                      <p
                        className={cn("text-xs line-clamp-2", colors.textMuted)}
                      >
                        {role.description}
                      </p>
                    )}

                    {role.requiredSkills && role.requiredSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {role.requiredSkills.slice(0, 2).map((skill, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-xs border-purple-300 text-purple-600 dark:text-purple-400"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {role.requiredSkills.length > 2 && (
                          <Badge
                            variant="outline"
                            className="text-xs border-gray-300 text-gray-500"
                          >
                            +{role.requiredSkills.length - 2} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                {action && (
                  <div className="flex-shrink-0">
                    <Button
                      variant={action.variant}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (action.action) {
                          action.action();
                        }
                      }}
                      disabled={action.disabled}
                      className={cn(
                        "text-xs h-9 px-4 whitespace-nowrap",
                        action.className,
                        // Make edit button more prominent
                        action.type === "edit" &&
                          "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-sm",
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        {action.icon}
                        <span>{action.label}</span>
                      </span>
                    </Button>

                    {/* Tooltip for disabled buttons */}
                    {action.disabled && action.type === "full" && (
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        All slots filled
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
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
  const renderActionButton = () => {
    if (!showActions) return null;

    const responsiveButtonClasses = "w-full sm:w-auto px-3 py-1.5 h-9";

    // Check interest window
    const interestWindowStatus = getInterestWindowStatus(gig);
    const isInterestWindowOpen = interestWindowStatus.status === "open";

    // ===== GIG POSTER (OWNER) =====
    if (userStatus.isGigPoster) {
      return (
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // Route based on gig type
              switch (gigType) {
                case "full_band":
                  router.push(`/hub/gigs/client/${gig._id}/band-applicants`);
                  break;
                case "client_band_creation":
                  router.push(`/hub/gigs/client/${gig._id}/role-applicants`);
                  break;
                default:
                  router.push(`/hub/gigs/client/${gig._id}/applicants`);
                  break;
              }
            }}
            className={clsx(
              responsiveButtonClasses,
              "gap-2",
              "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all duration-200",
            )}
          >
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">
              {gig.isTaken ? "Manage Booking" : "Review Applicants"}
            </span>
          </Button>

          {/* Add Edit Button */}
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
    }

    // ===== USER HAS APPLIED/SHOWN INTEREST =====
    if (
      userStatus.hasShownInterest ||
      userStatus.isInApplicants ||
      userStatus.isInBandApplication
    ) {
      const handleManageClick = () => {
        // Route based on user status and gig type
        if (gigType === "client_band_creation" && userStatus.isInApplicants) {
          // Band role application
          router.push(`/gigs/${gig._id}/application`);
        } else if (gigType === "full_band" && userStatus.isInBandApplication) {
          // Full band application
          router.push(`/gigs/${gig._id}/band-application`);
        } else {
          // Individual gig or other
          router.push("/hub/gigs?tab=musician-prebooking");
        }
      };

      let buttonLabel = "View Application";
      let icon = <UserCheck className="w-4 h-4" />;
      let variant: "default" | "outline" | "secondary" | "destructive" =
        "outline";
      let customClasses = "";
      let showPosition = false;

      // Determine button style based on status and gig type
      if (gigType === "full_band" && userStatus.isInBandApplication) {
        // Full band application
        buttonLabel = "View Band Application";
        icon = <Building2 className="w-4 h-4" />;
        if (userStatus.isBooked) {
          variant = "default";
          customClasses =
            "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-md";
          buttonLabel = "Band Booked ✓";
        } else if (userStatus.isPending) {
          customClasses =
            "border-amber-500/40 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30";
          buttonLabel = "Band Application Pending";
        } else {
          customClasses =
            "border-purple-500/40 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30";
        }
      } else if (
        gigType === "client_band_creation" &&
        userStatus.isInApplicants
      ) {
        // Band role application
        const roleName = userStatus.bandRoleApplied || "Role";
        buttonLabel = `View ${roleName} Application`;
        icon = <Music className="w-4 h-4" />;
        if (userStatus.isBooked) {
          variant = "default";
          customClasses =
            "bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white border-0 shadow-md";
          buttonLabel = `Booked as ${roleName}`;
        } else if (userStatus.isPending) {
          customClasses =
            "border-orange-500/40 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30";
          buttonLabel = `Pending as ${roleName}`;
        } else {
          customClasses =
            "border-blue-500/40 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30";
          showPosition = userStatus.position !== null;
        }
      } else {
        // Individual gig interest
        if (userStatus.isBooked) {
          variant = "default";
          customClasses =
            "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-md";
          buttonLabel = "Booked ✓";
        } else if (userStatus.isPending) {
          customClasses =
            "border-orange-500/40 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30";
          buttonLabel = "Pending...";
        } else {
          customClasses =
            "border-blue-500/40 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30";
          showPosition = userStatus.position !== null;
          if (showPosition) {
            buttonLabel = `View (#${userStatus.position})`;
          }
        }
      }

      return (
        <Button
          variant={variant}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleManageClick();
          }}
          className={clsx(
            responsiveButtonClasses,
            "gap-2 transition-all duration-200 font-medium",
            customClasses,
            showPosition && "relative",
          )}
        >
          {icon}
          <span>{buttonLabel}</span>
          {showPosition && (
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold flex items-center justify-center border border-white dark:border-gray-800">
              {userStatus.position}
            </div>
          )}
        </Button>
      );
    }

    // ===== DEFAULT ACTION BUTTONS =====
    if (gig.isTaken) {
      return (
        <Button
          variant="secondary"
          size="sm"
          disabled
          className={clsx(responsiveButtonClasses, "gap-2")}
          style={getButtonStyles("secondary")}
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
          className={clsx(responsiveButtonClasses, "gap-2")}
          style={getButtonStyles("secondary")}
        >
          <AlertCircle className="w-4 h-4" />
          <span>{gigType === "full_band" ? "Bands Full" : "Fully Booked"}</span>
        </Button>
      );
    }

    // Get the button config based on gig type
    const getButtonConfig = () => {
      switch (gigType) {
        case "full_band":
          return {
            label: "Apply with Band",
            variant: "default" as const,
            icon: <Building2 className="w-4 h-4" />,
            action: () => setShowBandJoinModal(true),
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
                console.log("View Requirements button clicked");
                console.log("Available roles:", availableRoles);
                console.log("Current user:", currentUser);

                // Show requirements modal - NO ALERT
                toast.info(
                  <div className="max-w-md p-4">
                    <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">
                      Role Requirements
                    </h3>
                    <div className="space-y-3">
                      {availableRoles.length > 0 ? (
                        availableRoles.map((role, idx) => (
                          <div
                            key={idx}
                            className="p-3 border rounded-lg bg-white dark:bg-gray-800"
                          >
                            <p className="font-semibold text-blue-600 dark:text-blue-400">
                              {role.role}
                            </p>
                            {role.requiredSkills &&
                              role.requiredSkills.length > 0 && (
                                <>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    Required Skills:
                                  </p>
                                  <ul className="list-disc pl-4 text-sm space-y-1 mt-1">
                                    {role.requiredSkills.map((skill, i) => (
                                      <li
                                        key={i}
                                        className="text-gray-700 dark:text-gray-300"
                                      >
                                        {skill}
                                      </li>
                                    ))}
                                  </ul>
                                </>
                              )}
                            <div className="mt-2 text-xs">
                              <p className="text-gray-500">
                                Available slots:{" "}
                                {role.maxSlots - role.filledSlots} of{" "}
                                {role.maxSlots}
                              </p>
                              <p className="mt-1 font-medium">
                                Your instruments:{" "}
                                <span className="text-green-600">
                                  {Array.isArray(currentUser?.instrument)
                                    ? currentUser.instrument.join(", ")
                                    : currentUser?.instrument || "None"}
                                </span>
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-600">
                          All roles are filled or no roles available.
                        </p>
                      )}
                    </div>
                  </div>,
                  {
                    duration: 10000,
                    style: { maxWidth: "450px" },
                  },
                );
              },
              // ADD THIS PROP TO OVERRIDE THE DISABLED LOGIC
              overrideDisabled: true, // Custom prop to skip interest window check
            };
          }

          return {
            label:
              qualifiedRoles.length === 1
                ? `Apply as ${qualifiedRoles[0].role}`
                : "Apply for Role",
            variant: "default" as const,
            icon: <UserPlus className="w-4 h-4" />,
            action: handleBandApplication,
          };
        case "mc":
          return {
            label: "Apply as MC",
            variant: "default" as const,
            icon: <UserPlus className="w-4 h-4" />,
            action: () => setShowInterestModal(true),
          };

        case "dj":
          return {
            label: "Apply as DJ",
            variant: "default" as const,
            icon: <UserPlus className="w-4 h-4" />,
            action: () => setShowInterestModal(true),
          };

        case "vocalist":
          return {
            label: "Apply as Vocalist",
            variant: "default" as const,
            icon: <UserPlus className="w-4 h-4" />,
            action: () => setShowInterestModal(true),
          };

        case "individual_musician":
        default:
          return {
            label: "Show Interest",
            variant: "default" as const,
            icon: <UserPlus className="w-4 h-4" />,
            action: () => setShowInterestModal(true),
          };
      }
    };

    const buttonConfig = getButtonConfig();
    if (!buttonConfig) {
      return null;
    }

    const isViewRequirementsButton = buttonConfig.label === "View Requirements";

    return (
      <Button
        variant={buttonConfig.variant}
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          buttonConfig.action();
        }}
        disabled={
          loading || (!isInterestWindowOpen && !isViewRequirementsButton)
        }
        className={clsx(
          responsiveButtonClasses,
          "gap-2 shadow-sm hover:shadow transition-all duration-200 font-medium",
          buttonConfig.variant === "default"
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            : "border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20",
          !isInterestWindowOpen &&
            !isViewRequirementsButton &&
            "opacity-50 cursor-not-allowed",
        )}
        style={getButtonStyles(buttonConfig.variant)}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          buttonConfig.icon
        )}
        <span className="ml-2">{buttonConfig.label}</span>

        {interestWindowStatus.hasWindow &&
          !isInterestWindowOpen &&
          !isViewRequirementsButton && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Lock className="w-3 h-3 ml-1" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Interest window is {interestWindowStatus.status}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
      </Button>
    );
  };
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
          {/* Inside the main return statement, add: */}
          {isClientBand && gig.bandCategory && gig.bandCategory.length > 0 && (
            <div
              className="mt-4 pt-4 border-t"
              style={{
                borderTopColor: gig.fontColor
                  ? `${gig.fontColor}20`
                  : undefined,
              }}
            >
              {renderBandRoleActions()}
            </div>
          )}
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
    </>
  );
};

export default GigCard;
