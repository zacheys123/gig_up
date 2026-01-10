import React, { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { motion } from "framer-motion";
import clsx from "clsx";
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

// Types
interface BandMember {
  userId: Id<"users">;
  name: string;
  role: string;
  joinedAt: number;
  price?: number;
  bookedBy?: Id<"users">;
  status?: string;
  notes?: string;
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
    bookCount?: BandMember[];
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
    // Add these styling fields:
    font?: string;
    fontColor?: string;
    backgroundColor?: string;
    fontFamily?: string; // You might have this too
  };
  onClick?: () => void;
  showActions?: boolean;
  compact?: boolean;
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
              badgeProps.className
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

  // Convex mutations
  const showInterestInGig = useMutation(api.controllers.gigs.showInterestInGig);
  const removeInterestFromGig = useMutation(
    api.controllers.gigs.removeInterestFromGig
  );
  const applyForBandRole = useMutation(
    api.controllers.bookings.applyForBandRole
  );
  const withdrawFromBandRole = useMutation(
    api.controllers.bookings.withdrawFromBandRole
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
    userId ? { clerkId: userId } : "skip"
  );

  // Derived state
  const isClientBand = gig.isClientBand || false;
  const currentUserId = currentUser?._id;

  // Regular gig stats
  const regularInterestedUsers = gig.interestedUsers || [];
  const regularInterestCount = regularInterestedUsers.length;
  const regularMaxSlots = gig.maxSlots || 10;
  const regularAvailableSlots = regularMaxSlots - regularInterestCount;
  const regularIsFull = regularInterestCount >= regularMaxSlots;
  const regularIsInterested = currentUserId
    ? regularInterestedUsers.includes(currentUserId)
    : false;

  // Band gig stats
  const bandMembers = gig.bookCount || [];
  const bandMemberCount = bandMembers.length;
  const bandMaxSlots = gig.maxSlots || 5;
  const bandAvailableSlots = bandMaxSlots - bandMemberCount;
  const bandIsFull = bandMemberCount >= bandMaxSlots;
  const userIsInBand = currentUserId
    ? bandMembers.some((member) => member.userId === currentUserId)
    : false;
  const userBandRole = currentUserId
    ? bandMembers.find((member) => member.userId === currentUserId)?.role
    : null;

  // Common stats
  const slotsUsed = isClientBand ? bandMemberCount : regularInterestCount;
  const maxSlots = isClientBand ? bandMaxSlots : regularMaxSlots;
  const availableSlots = isClientBand
    ? bandAvailableSlots
    : regularAvailableSlots;
  const isFull = isClientBand ? bandIsFull : regularIsFull;
  const userHasInterest = isClientBand ? userIsInBand : regularIsInterested;
  const progressPercentage = Math.min((slotsUsed / maxSlots) * 100, 100);

  // User position in interested users list
  const userPosition = regularIsInterested
    ? (gig.interestedUsers?.indexOf(currentUserId!) || 0) + 1
    : null;

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

  // Handle band action
  const handleBandAction = useCallback(
    (bandRoleIndex: number): BandAction | null => {
      if (!gig.bandCategory || !gig.bandCategory[bandRoleIndex]) return null;

      const role = gig.bandCategory[bandRoleIndex];
      const currentUserId = currentUser?._id;

      if (!currentUserId) return null;

      const isGigPoster = currentUserId === gig.postedBy;

      if (isGigPoster) {
        const hasApplicants = role.applicants.length > 0;
        const hasBookedUsers = role.bookedUsers.length > 0;

        if (hasApplicants && !hasBookedUsers) {
          return {
            type: "review",
            label: "Review",
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
          };
        } else if (hasBookedUsers) {
          return {
            type: "manage",
            label: "Manage",
            variant: "outline",
            action: () => {
              router.push(`/gigs/${gig._id}/manage?roleIndex=${bandRoleIndex}`);
              return Promise.resolve();
            },
            disabled: false,
            routing: {
              forMusician: "",
              forClient: `/gigs/${gig._id}/manage?roleIndex=${bandRoleIndex}`,
              message: "Manage musicians",
            },
          };
        } else {
          return {
            type: "edit",
            label: "Edit",
            variant: "outline",
            action: () => {
              router.push(`/hub/gigs/client/edit/${gig._id}`);
              return Promise.resolve();
            },
            disabled: false,
            routing: {
              forMusician: "",
              forClient: `/hub/gigs/client/edit/${gig._id}`,
              message: "Edit gig",
            },
            icon: <Edit className="w-4 h-4" />, // Add icon prop
            className:
              "border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20", // Add custom styling
          };
        }
      }

      const hasApplied = role.applicants.includes(currentUserId);
      const isBooked = role.bookedUsers.includes(currentUserId);
      const isRoleFull = role.filledSlots >= role.maxSlots;

      if (isBooked) {
        return {
          type: "leave",
          label: "Leave",
          variant: "destructive",
          action: async () => {
            try {
              await withdrawFromBandRole({
                gigId: gig._id,
                bandRoleIndex,
                clerkId: userId!,
                reason: "Left voluntarily",
              });
              toast.success("Left the role");
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : "Failed to leave"
              );
            }
          },
          disabled: false,
          routing: {
            forMusician: "/hub/gigs?tab=booked",
            forClient: "/hub/gigs?tab=my-gigs",
            message: "Booked for this role",
          },
        };
      }

      if (hasApplied && !isBooked) {
        return {
          type: "pending",
          label: "Pending",
          variant: "outline",
          action: null,
          disabled: true,
          routing: {
            forMusician: "/hub/gigs?tab=pending",
            forClient: "/hub/gigs?tab=my-gigs",
            message: "Application pending",
          },
        };
      }

      if (!isRoleFull && !hasApplied && !isBooked) {
        return {
          type: "apply",
          label: "Apply",
          variant: "default",
          action: async () => {
            try {
              await applyForBandRole({
                gigId: gig._id,
                bandRoleIndex,
                clerkId: userId!,
                applicationNotes: interestNotes,
              });
              toast.success("Application submitted!");
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : "Failed to apply"
              );
            }
          },
          disabled: false,
          routing: {
            forMusician: "/hub/gigs?tab=all",
            forClient: "/hub/gigs?tab=my-gigs",
            message: "Apply for role",
          },
        };
      }

      if (isRoleFull && !hasApplied && !isBooked) {
        return {
          type: "full",
          label: "Full",
          variant: "secondary",
          action: null,
          disabled: true,
          routing: {
            forMusician: "/hub/gigs?tab=all",
            forClient: "/hub/gigs?tab=my-gigs",
            message: "Role full",
          },
        };
      }

      return null;
    },
    [gig, currentUser, userId, interestNotes]
  );

  // Regular gig interest handler
  const handleRegularInterest = async () => {
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
      if (regularIsInterested) {
        await removeInterestFromGig({
          gigId: gig._id,
          clerkId: userId!,
          reason: "Withdrew interest",
        });
        toast.success("Interest removed");
      } else {
        setShowInterestModal(true);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  // Show interest with notes handler
  const handleShowInterestWithNotes = async () => {
    if (!currentUserId) {
      toast.error("Sign in to show interest");
      return;
    }

    setLoading(true);
    try {
      const result = await showInterestInGig({
        gigId: gig._id,
        userId: currentUserId,
      });

      setShowInterestModal(false);
      setInterestNotes("");

      toast.success(
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
            <UserCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="font-medium">Interest shown!</p>
            <p className="text-sm opacity-90">
              Position #{result.position} • {result.availableSlots} left
            </p>
          </div>
        </div>
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

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
    } else {
      router.push(`/gigs/${gig._id}`);
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
  const getCardStyles = () => {
    return {
      backgroundColor: gig.backgroundColor || undefined,
      color: gig.fontColor || undefined,
      fontFamily: gig.font || undefined,
      // Preserve the border styling from the original
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

  // Create a utility function for button styles
  const getButtonStyles = (
    variant: "default" | "outline" | "secondary" | "destructive" = "default"
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
          Pending
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

  // Render band members preview
  const renderBandMembersPreview = () => {
    if (!isClientBand || bandMembers.length === 0 || compact) return null;

    const displayMembers = bandMembers.slice(0, 3);
    const remainingCount = bandMembers.length - 3;

    return (
      <div className="flex items-center gap-1 mt-2">
        <div className="flex -space-x-2">
          {displayMembers.map((member, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Avatar className="w-6 h-6 border-2 border-white dark:border-gray-800">
                      <AvatarFallback className="text-xs">
                        {member.name?.charAt(0) || "M"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-[8px] text-white">
                        {getRoleIcon(member.role)}
                      </span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    {member.name} - {member.role}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        {remainingCount > 0 && (
          <span className="text-xs text-gray-500 ml-1">
            +{remainingCount} more
          </span>
        )}
      </div>
    );
  };

  // Check if current user is the gig poster
  const isGigPoster = currentUserId === gig.postedBy;

  // Check interest window status
  const interestWindowStatus = getInterestWindowStatus(gig);
  const isInterestWindowOpen = interestWindowStatus.status === "open";

  // Render action button
  const renderActionButton = () => {
    if (!showActions) return null;

    const responsiveButtonClasses = "w-full sm:w-auto px-3 py-1.5 h-9";

    // Helper to get button styles based on variant
    const getButtonStyle = (
      variant: "default" | "outline" | "secondary" | "destructive" = "default"
    ) => {
      const baseStyle = {
        color: gig.fontColor || undefined,
      };

      switch (variant) {
        case "default":
          return {
            ...baseStyle,
            backgroundColor: gig.backgroundColor
              ? `${gig.backgroundColor}40`
              : undefined,
            borderColor: gig.fontColor ? `${gig.fontColor}30` : undefined,
          };
        case "outline":
          return {
            ...baseStyle,
            backgroundColor: "transparent",
            borderColor: gig.fontColor ? `${gig.fontColor}40` : undefined,
          };
        case "secondary":
          return {
            ...baseStyle,
            backgroundColor: gig.backgroundColor
              ? `${gig.backgroundColor}20`
              : undefined,
            borderColor: gig.fontColor ? `${gig.fontColor}20` : undefined,
          };
        case "destructive":
          return {
            ...baseStyle,
            backgroundColor: gig.fontColor ? `${gig.fontColor}20` : undefined,
            borderColor: gig.fontColor ? `${gig.fontColor}30` : undefined,
            color: gig.fontColor || "#ef4444",
          };
        default:
          return baseStyle;
      }
    };

    // Gig is taken
    if (gig.isTaken) {
      if (isGigPoster) {
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/gigs/${gig._id}/manage`);
            }}
            className={clsx(
              responsiveButtonClasses,
              "shadow-sm hover:shadow transition-all duration-200",
              "text-xs sm:text-sm"
            )}
            style={getButtonStyle("outline")}
            onMouseEnter={(e) => {
              if (gig.backgroundColor) {
                e.currentTarget.style.backgroundColor = `${gig.backgroundColor}20`;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Manage</span>
            <span className="sm:hidden">Manage</span>
          </Button>
        );
      }
      return (
        <Button
          variant="outline"
          size="sm"
          disabled
          className={clsx(responsiveButtonClasses, "opacity-50 text-xs")}
          style={getButtonStyle("secondary")}
        >
          <UserCheck className="w-4 h-4 mr-2" />
          Booked
        </Button>
      );
    }

    // ===== REGULAR GIG =====
    if (!isClientBand) {
      if (isGigPoster) {
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/hub/gigs/client/edit/${gig._id}`);
            }}
            className={clsx(
              responsiveButtonClasses,
              "shadow-sm hover:shadow transition-all duration-200",
              "text-xs sm:text-sm"
            )}
            style={getButtonStyle("outline")}
            onMouseEnter={(e) => {
              if (gig.backgroundColor) {
                e.currentTarget.style.backgroundColor = `${gig.backgroundColor}20`;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Edit</span>
            <span className="sm:hidden">Edit</span>
          </Button>
        );
      }

      // Check interest window
      if (gig.acceptInterestStartTime || gig.acceptInterestEndTime) {
        switch (interestWindowStatus.status) {
          case "not_open":
            return (
              <Button
                variant="outline"
                size="sm"
                disabled
                className={clsx(
                  responsiveButtonClasses,
                  "opacity-50 cursor-not-allowed text-xs"
                )}
                style={getButtonStyle("secondary")}
              >
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Opens Soon</span>
                <span className="sm:hidden">Soon</span>
              </Button>
            );

          case "closed":
            return (
              <Button
                variant="outline"
                size="sm"
                disabled
                className={clsx(
                  responsiveButtonClasses,
                  "opacity-50 cursor-not-allowed text-xs"
                )}
                style={getButtonStyle("secondary")}
              >
                <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Closed</span>
                <span className="sm:hidden">Closed</span>
              </Button>
            );
        }
      }

      // Show interest button
      if (regularIsInterested) {
        return (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleRegularInterest();
            }}
            disabled={loading}
            variant="outline"
            size="sm"
            className={clsx(
              responsiveButtonClasses,
              "shadow-sm hover:shadow transition-all duration-200",
              "text-xs sm:text-sm"
            )}
            style={getButtonStyle("outline")}
            onMouseLeave={(e) => {
              if (!loading && !bandIsFull) {
                e.currentTarget.style.backgroundColor = gig.backgroundColor
                  ? `${gig.backgroundColor}40`
                  : "";
              }
            }}
            onMouseEnter={(e) => {
              if (!loading && !bandIsFull) {
                e.currentTarget.style.backgroundColor = gig.backgroundColor
                  ? `${gig.backgroundColor}60`
                  : ""; // Use empty string instead of undefined
              }
            }}
          >
            {loading ? (
              <>
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
                <span className="hidden sm:inline">Removing</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Interested</span>
                <span className="sm:hidden">✓</span>
              </>
            )}
          </Button>
        );
      }

      return (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            if (isFull) return;
            handleRegularInterest();
          }}
          disabled={loading || isFull}
          size="sm"
          className={clsx(
            responsiveButtonClasses,
            "shadow-sm hover:shadow transition-all duration-200",
            "text-xs sm:text-sm",
            isFull && "opacity-50 cursor-not-allowed"
          )}
          style={getButtonStyle("default")}
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
          {loading ? (
            <>
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
              <span className="hidden sm:inline">Processing</span>
              <span className="sm:hidden">...</span>
            </>
          ) : isFull ? (
            <>
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Full</span>
              <span className="sm:hidden">Full</span>
            </>
          ) : (
            <>
              <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Interest</span>
              <span className="sm:hidden">Join</span>
            </>
          )}
        </Button>
      );
    }

    // ===== BAND GIG =====
    if (isClientBand) {
      if (isGigPoster) {
        const hasApplicants =
          gig.bandCategory?.some((role) => role.applicants.length > 0) || false;
        const hasBookedUsers =
          gig.bandCategory?.some((role) => role.bookedUsers.length > 0) ||
          false;

        if (hasApplicants) {
          return (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/gigs/${gig._id}/review`);
              }}
              size="sm"
              className={clsx(
                responsiveButtonClasses,
                "shadow-sm hover:shadow transition-all duration-200",
                "text-xs sm:text-sm"
              )}
              style={getButtonStyle("default")}
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
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Review</span>
              <span className="sm:hidden">Review</span>
            </Button>
          );
        } else if (hasBookedUsers) {
          return (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/gigs/${gig._id}/manage`);
              }}
              variant="outline"
              size="sm"
              className={clsx(
                responsiveButtonClasses,
                "shadow-sm hover:shadow transition-all duration-200",
                "text-xs sm:text-sm"
              )}
              style={getButtonStyle("outline")}
              onMouseEnter={(e) => {
                if (gig.backgroundColor) {
                  e.currentTarget.style.backgroundColor = `${gig.backgroundColor}20`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Manage</span>
              <span className="sm:hidden">Manage</span>
            </Button>
          );
        } else {
          // Edit button for band gig with no applicants/bookings
          return (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/hub/gigs/client/edit/${gig._id}`);
              }}
              variant="outline"
              size="sm"
              className={clsx(
                responsiveButtonClasses,
                "shadow-sm hover:shadow transition-all duration-200",
                "text-xs sm:text-sm"
              )}
              style={getButtonStyle("outline")}
              onMouseEnter={(e) => {
                if (gig.backgroundColor) {
                  e.currentTarget.style.backgroundColor = `${gig.backgroundColor}20`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Edit</span>
              <span className="sm:hidden">Edit</span>
            </Button>
          );
        }
      }

      if (userIsInBand) {
        return (
          <Button
            variant="outline"
            size="sm"
            className={clsx(
              responsiveButtonClasses,
              "shadow-sm hover:shadow transition-all duration-200",
              "text-xs sm:text-sm"
            )}
            disabled={loading}
            style={getButtonStyle("secondary")}
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
            <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">In Band</span>
            <span className="sm:hidden">In Band</span>
          </Button>
        );
      }

      // Check interest window for band
      if (gig.acceptInterestStartTime || gig.acceptInterestEndTime) {
        switch (interestWindowStatus.status) {
          case "not_open":
            return (
              <Button
                variant="outline"
                size="sm"
                disabled
                className={clsx(
                  responsiveButtonClasses,
                  "opacity-50 cursor-not-allowed text-xs"
                )}
                style={getButtonStyle("secondary")}
              >
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Soon</span>
                <span className="sm:hidden">Soon</span>
              </Button>
            );

          case "closed":
            return (
              <Button
                variant="outline"
                size="sm"
                disabled
                className={clsx(
                  responsiveButtonClasses,
                  "opacity-50 cursor-not-allowed text-xs"
                )}
                style={getButtonStyle("secondary")}
              >
                <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Closed</span>
                <span className="sm:hidden">Closed</span>
              </Button>
            );
        }
      }

      if (bandIsFull) {
        return (
          <Button
            variant="outline"
            size="sm"
            disabled
            className={clsx(
              responsiveButtonClasses,
              "opacity-50 cursor-not-allowed text-xs"
            )}
            style={getButtonStyle("secondary")}
          >
            <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Full</span>
            <span className="sm:hidden">Full</span>
          </Button>
        );
      }

      return (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            if (gig.bandCategory && gig.bandCategory.length === 1) {
              const roleAction = handleBandAction(0);
              if (roleAction?.action) {
                roleAction.action();
              } else {
                setShowBandJoinModal(true);
              }
            } else {
              setShowBandJoinModal(true);
            }
          }}
          disabled={loading || bandIsFull}
          size="sm"
          className={clsx(
            responsiveButtonClasses,
            "shadow-sm hover:shadow transition-all duration-200",
            "text-xs sm:text-sm",
            bandIsFull && "opacity-50 cursor-not-allowed"
          )}
          style={getButtonStyle("default")}
          onMouseEnter={(e) => {
            if (!loading && !bandIsFull && gig.backgroundColor) {
              e.currentTarget.style.backgroundColor = `${gig.backgroundColor}60`;
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && !bandIsFull && gig.backgroundColor) {
              e.currentTarget.style.backgroundColor = `${gig.backgroundColor}40`;
            }
          }}
        >
          {loading ? (
            <>
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
              <span className="hidden sm:inline">...</span>
              <span className="sm:hidden">...</span>
            </>
          ) : bandIsFull ? (
            <>
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Full</span>
              <span className="sm:hidden">Full</span>
            </>
          ) : (
            <>
              <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Join Band</span>
              <span className="sm:hidden">Join</span>
            </>
          )}
        </Button>
      );
    }

    // Fallback
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className={clsx(responsiveButtonClasses, "text-xs")}
        style={getButtonStyle("secondary")}
      >
        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
        <span className="hidden sm:inline">N/A</span>
        <span className="sm:hidden">N/A</span>
      </Button>
    );
  };
  const renderProgressBar = () => {
    if (compact) return null;

    return (
      <div className="mt-3">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {slotsUsed}/{maxSlots} {isClientBand ? "members" : "spots"}
            </span>
            {userPosition && (
              <Badge
                variant="outline"
                className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-xs px-2 py-0"
              >
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />#{userPosition}
                </span>
              </Badge>
            )}
          </div>
          <span className="text-xs font-semibold">{availableSlots} left</span>
        </div>

        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className={clsx("h-full rounded-full", {
              "bg-gradient-to-r from-purple-500 to-pink-600": isClientBand,
              "bg-gradient-to-r from-green-500 to-emerald-600":
                !isClientBand && !isFull,
              "bg-gradient-to-r from-amber-500 to-orange-600":
                !isClientBand && progressPercentage >= 80 && !isFull,
              "bg-gradient-to-r from-red-500 to-rose-600": isFull,
            })}
            initial={{ width: "0%" }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {availableSlots <= 2 && availableSlots > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3 text-amber-500" />
            <span className="text-xs text-amber-600 dark:text-amber-400">
              Only {availableSlots} left!
            </span>
          </div>
        )}
      </div>
    );
  };

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
            "ring-1 ring-purple-500": isClientBand && userIsInBand,
            "ring-1 ring-green-500": !isClientBand && regularIsInterested,
          }
        )}
        onClick={handleClick}
        style={getCardStyles()} // Add this
      >
        {/* Status indicator - Keep original colors */}
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

          {/* Band members */}
          {renderBandMembersPreview()}

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
            {" "}
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

      {/* Show Interest Modal */}
      <Dialog open={showInterestModal} onOpenChange={setShowInterestModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Show Interest in "{gig.title}"</DialogTitle>
            <DialogDescription>
              Add an optional note to introduce yourself.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Interest Window Info */}
            {(gig.acceptInterestStartTime || gig.acceptInterestEndTime) && (
              <div
                className={clsx(
                  "p-3 rounded-lg border",
                  interestWindowStatus.status === "open"
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Interest Window</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {interestWindowStatus.message}
                </p>
              </div>
            )}

            {/* Available slots */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Available: {availableSlots}/{maxSlots}
                </span>
                {availableSlots <= 2 && (
                  <Badge variant="destructive" className="animate-pulse">
                    Almost Full!
                  </Badge>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium mb-2 block">Notes</label>
              <Textarea
                value={interestNotes}
                onChange={(e) => setInterestNotes(e.target.value)}
                placeholder="Tell the client why you're interested..."
                className="min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowInterestModal(false)}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleShowInterestWithNotes}
              disabled={loading}
              className="w-full sm:w-auto"
              style={getButtonStyles("default")}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Show Interest
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Band Join Modal */}
      <Dialog open={showBandJoinModal} onOpenChange={setShowBandJoinModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Join Band</DialogTitle>
            <DialogDescription>
              Select your role and enter your name.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Available slots */}
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Available: {availableSlots}/{maxSlots}
                </span>
                {availableSlots <= 2 && (
                  <Badge variant="destructive" className="animate-pulse">
                    Almost Full!
                  </Badge>
                )}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Your Name
              </label>
              <Input
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            {/* Role selection */}
            {gig.bandCategory && gig.bandCategory.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Role</label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {gig.bandCategory.map((role, index) => {
                      const isFull = role.filledSlots >= role.maxSlots;
                      const isBooked = role.bookedUsers.includes(
                        currentUserId!
                      );
                      const hasApplied = role.applicants.includes(
                        currentUserId!
                      );

                      return (
                        <SelectItem
                          key={index}
                          value={role.role}
                          disabled={isFull || isBooked || hasApplied}
                        >
                          <div className="flex items-center justify-between">
                            <span>{role.role}</span>
                            <span className="text-xs text-gray-500">
                              {role.filledSlots}/{role.maxSlots}
                              {isBooked && " • Booked"}
                              {hasApplied && !isBooked && " • Applied"}
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Current members */}
            {bandMembers.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Current Members
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {bandMembers.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {member.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.role}</p>
                        </div>
                      </div>
                      {member.userId === currentUserId && (
                        <Badge variant="outline">You</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowBandJoinModal(false)}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedRole) {
                  const roleIndex = gig.bandCategory?.findIndex(
                    (r) => r.role === selectedRole
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
              className="w-full sm:w-auto"
              style={getButtonStyles("default")}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Applying...
                </>
              ) : (
                <>
                  <Music className="w-4 h-4 mr-2" />
                  Apply
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GigCard;
