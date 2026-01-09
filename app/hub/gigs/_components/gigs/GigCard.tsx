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
  X,
  Eye,
  Bookmark,
  Heart,
  Star,
  DollarSign,
  MessageCircle,
  Phone,
  Mail,
  Check,
  AlertCircle,
  User,
  Lock,
  Video,
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
    acceptInterestStartTime?: string;
    acceptInterestEndTime?: string;
    bandCategory?: BandRole[];
    createdAt: number;
    updatedAt: number;
  };
  onClick?: () => void;
  showActions?: boolean;
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
  action: (() => Promise<void> | void) | null;
  disabled: boolean;
  routing: {
    forMusician: string;
    forClient: string;
    message: string;
  };
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

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={badgeProps.variant}
            className={clsx(
              "inline-flex items-center gap-1 text-xs font-medium",
              badgeProps.className
            )}
          >
            <Icon className="w-3 h-3" />
            <span className="hidden sm:inline">
              {status.message.length > 20
                ? status.message.substring(0, 20) + "..."
                : status.message}
            </span>
            <span className="sm:hidden">!</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{status.message}</p>
          {gig.acceptInterestStartTime && (
            <p className="text-xs text-gray-500">
              Opens: {new Date(gig.acceptInterestStartTime).toLocaleString()}
            </p>
          )}
          {gig.acceptInterestEndTime && (
            <p className="text-xs text-gray-500">
              Closes: {new Date(gig.acceptInterestEndTime).toLocaleString()}
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
  const progressPercentage = (slotsUsed / maxSlots) * 100;

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

  // Updated handleBandAction function
  const handleBandAction = useCallback(
    (bandRoleIndex: number): BandAction | null => {
      if (!gig.bandCategory || !gig.bandCategory[bandRoleIndex]) return null;

      const role = gig.bandCategory[bandRoleIndex];
      const currentUserId = currentUser?._id;

      if (!currentUserId) return null;

      // Check if current user is the gig poster (client)
      const isGigPoster = currentUserId === gig.postedBy;

      // For client viewing their own gig
      if (isGigPoster) {
        // Check if role has applicants
        const hasApplicants = role.applicants.length > 0;
        // Check if role has booked users
        const hasBookedUsers = role.bookedUsers.length > 0;

        if (hasApplicants && !hasBookedUsers) {
          // Role has applicants waiting for review
          return {
            type: "review",
            label: "Review Applicants",
            variant: "default",
            action: () => {
              router.push(`/gigs/${gig._id}/review?roleIndex=${bandRoleIndex}`);
            },
            disabled: false,
            routing: {
              forMusician: "", // Not applicable for client
              forClient: `/gigs/${gig._id}/review?roleIndex=${bandRoleIndex}`,
              message: "Review applicants for this role",
            },
          };
        } else if (hasBookedUsers) {
          // Role already has booked musicians
          return {
            type: "manage",
            label: "Manage Role",
            variant: "outline",
            action: () => {
              router.push(`/gigs/${gig._id}/manage?roleIndex=${bandRoleIndex}`);
            },
            disabled: false,
            routing: {
              forMusician: "",
              forClient: `/gigs/${gig._id}/manage?roleIndex=${bandRoleIndex}`,
              message: "Manage booked musicians for this role",
            },
          };
        } else {
          // No applicants yet
          return {
            type: "edit",
            label: "Edit Role",
            variant: "outline",
            action: () => {
              router.push(`/gigs/edit/${gig._id}`);
            },
            disabled: false,
            routing: {
              forMusician: "",
              forClient: `/gigs/edit/${gig._id}`,
              message: "Edit this role details",
            },
          };
        }
      }

      // For non-client users (musicians)
      // Check if user is in applicants array
      const hasApplied = role.applicants.includes(currentUserId);
      // Check if user is in bookedUsers array
      const isBooked = role.bookedUsers.includes(currentUserId);
      // Check if role is full
      const isRoleFull = role.filledSlots >= role.maxSlots;

      // Case 1: User is already booked
      if (isBooked) {
        return {
          type: "leave",
          label: "Leave Role",
          variant: "destructive",
          action: async () => {
            try {
              await withdrawFromBandRole({
                gigId: gig._id,
                bandRoleIndex,
                clerkId: userId!,
                reason: "Left the role voluntarily",
              });
              toast.success("Successfully left the role");
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : "Failed to leave role"
              );
            }
          },
          disabled: false,
          routing: {
            forMusician: "/hub/gigs?tab=booked",
            forClient: "/hub/gigs?tab=my-gigs",
            message: "You're booked for this role",
          },
        };
      }

      // Case 2: User has applied but not booked yet
      if (hasApplied && !isBooked) {
        return {
          type: "pending",
          label: "Application Pending",
          variant: "outline",
          action: null,
          disabled: true,
          routing: {
            forMusician: "/hub/gigs?tab=pending",
            forClient: "/hub/gigs?tab=my-gigs",
            message: "Application submitted - waiting for review",
          },
        };
      }

      // Case 3: User hasn't applied AND role has available slots
      if (!isRoleFull && !hasApplied && !isBooked) {
        return {
          type: "apply",
          label: "Apply for Role",
          variant: "default",
          action: async () => {
            try {
              await applyForBandRole({
                gigId: gig._id,
                bandRoleIndex,
                clerkId: userId!,
                applicationNotes: interestNotes,
              });
              toast.success("Application submitted successfully!");
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
            message: "Apply for this band role",
          },
        };
      }

      // Case 4: Role is full and user hasn't applied
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
            message: "This role is already filled",
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
      toast.error("Please sign in to show interest");
      return;
    }

    if (gig.isTaken) {
      toast.error("This gig has already been taken");
      return;
    }

    if (isFull) {
      toast.error("This gig is fully booked!");
      return;
    }

    setLoading(true);
    try {
      if (regularIsInterested) {
        // Remove interest
        await removeInterestFromGig({
          gigId: gig._id,
          clerkId: userId!,
          reason: "Withdrew interest",
        });
        toast.success("Interest removed");
      } else {
        // Show interest with modal
        setShowInterestModal(true);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  // Show interest with notes handler
  const handleShowInterestWithNotes = async () => {
    if (!currentUserId) {
      toast.error("Please sign in to show interest");
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
            <p className="font-medium">Interest shown successfully!</p>
            <p className="text-sm opacity-90">
              Position #{result.position} • {result.availableSlots} slots left
            </p>
          </div>
        </div>
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  // Save/favorite handlers
  const handleSave = async () => {
    if (!currentUserId) {
      toast.error("Please sign in to save gigs");
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
      toast.error(
        error instanceof Error ? error.message : "Failed to update saved gigs"
      );
    }
  };

  const handleFavorite = async () => {
    if (!currentUserId) {
      toast.error("Please sign in to favorite gigs");
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
      toast.error(
        error instanceof Error ? error.message : "Failed to update favorites"
      );
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

  // Get status badge
  const getStatusBadge = () => {
    if (gig.isTaken) {
      return <Badge className="bg-green-500 hover:bg-green-600">Booked</Badge>;
    }
    if (gig.isPending) {
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
      );
    }
    if (isFull) {
      return <Badge className="bg-red-500 hover:bg-red-600">Full</Badge>;
    }
    if (isClientBand) {
      return (
        <Badge className="bg-purple-500 hover:bg-purple-600">
          Band Forming
        </Badge>
      );
    }
    return <Badge className="bg-blue-500 hover:bg-blue-600">Available</Badge>;
  };

  // Render band members preview
  const renderBandMembersPreview = () => {
    if (!isClientBand || bandMembers.length === 0) return null;

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
                      <AvatarFallback>
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

  // Check if current user is the gig poster (client)
  const isGigPoster = currentUserId === gig.postedBy;

  // Check if gig has applicants
  const hasApplicants = gig.bandCategory?.some(
    (role) => role.applicants && role.applicants.length > 0
  );

  // Check interest window status
  const interestWindowStatus = getInterestWindowStatus(gig);
  const isInterestWindowOpen = interestWindowStatus.status === "open";

  // Render action button based on gig type
  const renderActionButton = () => {
    if (!showActions) return null;

    if (gig.isTaken) {
      if (currentUser?.isMusician) {
        return (
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push("/community?tab=videos")}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
          >
            <Video className="w-4 h-4 mr-2" />
            Add Videos
          </Button>
        );
      } else if (isGigPoster) {
        return (
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push(`/gigs/${gig._id}/review`)}
            className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Review Musician
          </Button>
        );
      }

      return (
        <Button
          variant="outline"
          size="sm"
          disabled
          className="w-full sm:w-auto"
        >
          <UserCheck className="w-4 h-4 mr-2" />
          Booked
        </Button>
      );
    }

    // Regular gig button
    if (!isClientBand) {
      if (!isInterestWindowOpen) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="w-full sm:w-auto opacity-50 cursor-not-allowed"
                >
                  {interestWindowStatus.status === "closed" ? (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Closed
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Not Open
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{interestWindowStatus.message}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }

      return (
        <Button
          onClick={handleRegularInterest}
          disabled={loading || isFull}
          variant={regularIsInterested ? "outline" : "default"}
          size="sm"
          className="w-full sm:w-auto"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Processing...
            </>
          ) : regularIsInterested ? (
            <>
              <UserCheck className="w-4 h-4 mr-2" />
              Interested
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              {isFull ? "Full" : "Show Interest"}
            </>
          )}
        </Button>
      );
    }

    // Band gig button
    if (isClientBand) {
      // For gig poster (client)
      if (isGigPoster) {
        if (hasApplicants) {
          return (
            <Button
              onClick={() => router.push("/hub/gigs?tab=my-gigs")}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            >
              <Users className="w-4 h-4 mr-2" />
              Review Applicants
            </Button>
          );
        }

        return (
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            disabled
          >
            <Users className="w-4 h-4 mr-2" />
            No Applicants Yet
          </Button>
        );
      }

      // For musicians viewing band gig
      if (gig.bandCategory && gig.bandCategory.length > 0) {
        // Get first available role or show general band action
        const firstRoleAction = handleBandAction(0);

        if (firstRoleAction) {
          return (
            <Button
              onClick={() => {
                if (firstRoleAction.action) {
                  firstRoleAction.action();
                } else if (firstRoleAction.type === "pending") {
                  router.push(firstRoleAction.routing.forMusician);
                }
              }}
              variant={firstRoleAction.variant}
              size="sm"
              disabled={firstRoleAction.disabled || loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : firstRoleAction.type === "apply" ? (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Apply for Band
                </>
              ) : firstRoleAction.type === "pending" ? (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Application Pending
                </>
              ) : firstRoleAction.type === "leave" ? (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Leave Band
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  {firstRoleAction.label}
                </>
              )}
            </Button>
          );
        }
      }

      // Fallback band button
      return (
        <Button
          onClick={() => setShowBandJoinModal(true)}
          disabled={loading || isFull}
          className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
        >
          <Music className="w-4 h-4 mr-2" />
          {isFull ? "Band Full" : "Join Band"}
        </Button>
      );
    }

    return null;
  };

  // Render progress bar
  const renderProgressBar = () => (
    <div className="mt-3">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {slotsUsed} of {maxSlots} {isClientBand ? "band members" : "spots"}{" "}
            filled
          </span>
          {userPosition && (
            <Badge
              variant="outline"
              className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800"
            >
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                Position #{userPosition}
              </span>
            </Badge>
          )}
        </div>
        <span className="text-xs font-semibold">
          {availableSlots} {isClientBand ? "spots" : "slots"} left
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
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

      {/* Low slots warning */}
      {availableSlots <= 2 && availableSlots > 0 && (
        <div className="flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3 text-amber-500" />
          <span className="text-xs text-amber-600 dark:text-amber-400">
            Only {availableSlots} {availableSlots === 1 ? "spot" : "spots"}{" "}
            left!
          </span>
        </div>
      )}
    </div>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -4 }}
        className={clsx(
          "group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800",
          "rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300",
          "cursor-pointer overflow-hidden",
          {
            "ring-2 ring-purple-500 ring-offset-2":
              isClientBand && userIsInBand,
            "ring-2 ring-green-500 ring-offset-2":
              !isClientBand && regularIsInterested,
          }
        )}
        onClick={handleClick}
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
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {gig.title}
                </h3>
                {getStatusBadge()}
                {isClientBand && (
                  <Badge
                    variant="outline"
                    className="border-purple-500 text-purple-600 dark:text-purple-400"
                  >
                    🎵 Band
                  </Badge>
                )}
                {gig.acceptInterestStartTime || gig.acceptInterestEndTime ? (
                  <InterestWindowBadge gig={gig} />
                ) : null}
              </div>

              {/* Category tags */}
              <div className="flex flex-wrap gap-1 mb-2">
                {gig.bussinesscat && (
                  <Badge variant="secondary" className="text-xs">
                    {gig.bussinesscat}
                  </Badge>
                )}
                {gig.category && (
                  <Badge variant="secondary" className="text-xs">
                    {gig.category}
                  </Badge>
                )}
                {gig.negotiable && (
                  <Badge variant="outline" className="text-xs">
                    Negotiable
                  </Badge>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="flex-shrink-0 ml-2">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {gig.price ? `$${gig.price}` : "Contact"}
              </div>
              {gig.paymentStatus && (
                <Badge
                  variant="outline"
                  className={clsx("text-xs mt-1", {
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

          {/* Description preview */}
          {gig.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {gig.description}
            </p>
          )}

          {/* Band members preview */}
          {renderBandMembersPreview()}

          {/* Progress bar */}
          {renderProgressBar()}

          {/* Location and time */}
          <div className="flex items-center justify-between mt-4 mb-4">
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span className="truncate max-w-[120px]">
                  {gig.location || "Location not specified"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
              </div>
              {gig.time?.start && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formattedTime}</span>
                </div>
              )}
            </div>

            {/* View count */}
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Eye className="w-4 h-4" />
              <span>{gig.viewCount?.length || 0}</span>
            </div>
          </div>

          {/* Footer with user info and actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
            {/* Poster info */}
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={gigPoster?.picture} />
                <AvatarFallback>
                  {gigPoster?.firstname?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {gigPoster?.firstname || "User"}
                </p>
                {gigPoster?.city && (
                  <p className="text-xs text-gray-500">{gigPoster.city}</p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            {showActions && (
              <div className="flex items-center gap-2">
                {/* Save and favorite buttons */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSave();
                        }}
                        className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                        title={isSaved ? "Remove from saved" : "Save for later"}
                      >
                        {isSaved ? (
                          <Bookmark className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                        ) : (
                          <Bookmark className="w-5 h-5" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isSaved ? "Remove from saved" : "Save for later"}
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
                        className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                        title={
                          isFavorite
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                      >
                        {isFavorite ? (
                          <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                        ) : (
                          <Heart className="w-5 h-5" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isFavorite
                        ? "Remove from favorites"
                        : "Add to favorites"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Primary action button */}
                <div onClick={(e) => e.stopPropagation()}>
                  {renderActionButton()}
                </div>
              </div>
            )}
          </div>

          {/* Interest window info */}
          {(gig.acceptInterestStartTime || gig.acceptInterestEndTime) && (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{interestWindowStatus.message}</span>
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
              Add an optional note to introduce yourself to the client.
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
                {gig.acceptInterestEndTime && (
                  <p className="text-xs text-gray-500 mt-1">
                    Closes:{" "}
                    {new Date(gig.acceptInterestEndTime).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Available slots info */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Available Slots: {availableSlots} / {maxSlots}
                </span>
                {availableSlots <= 2 && (
                  <Badge variant="destructive" className="animate-pulse">
                    Almost Full!
                  </Badge>
                )}
              </div>
              {userPosition && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Your current position: #{userPosition}
                </p>
              )}
            </div>

            {/* Notes input */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Notes (Optional)
              </label>
              <Textarea
                value={interestNotes}
                onChange={(e) => setInterestNotes(e.target.value)}
                placeholder="Tell the client why you're interested..."
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInterestModal(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleShowInterestWithNotes}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
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
            <DialogTitle>Join Band as Musician</DialogTitle>
            <DialogDescription>
              Join the band "{gig.title}" by selecting your role and entering
              your name.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Available slots info */}
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Available Spots: {availableSlots} / {maxSlots}
                </span>
                {availableSlots <= 2 && (
                  <Badge variant="destructive" className="animate-pulse">
                    Almost Full!
                  </Badge>
                )}
              </div>
            </div>

            {/* Member name */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Your Display Name
              </label>
              <Input
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="Enter your name"
                className="w-full"
              />
            </div>

            {/* Role selection */}
            {gig.bandCategory && gig.bandCategory.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Select Role
                </label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {gig.bandCategory.map((role, index) => {
                      const roleAction = handleBandAction(index);
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
                              {role.filledSlots}/{role.maxSlots} slots
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

            {/* Current band members */}
            {bandMembers.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Current Band Members
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {bandMembers.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {member.name?.charAt(0) || "M"}
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

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBandJoinModal(false)}
              disabled={loading}
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
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Music className="w-4 h-4 mr-2" />
                  Apply for Role
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
