"use client";

import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import {
  UserPlus,
  Check,
  X,
  Users,
  ArrowLeft,
  CheckCircle,
  MoreHorizontal,
  Shield,
  Music,
  Building,
  Crown,
  MapPin,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FollowRequest {
  _id: string;
  clerkId: string;
  firstname?: string;
  lastname?: string;
  username: string;
  picture?: string;
  city?: string;
  instrument?: string;
  isMusician: boolean;
  isClient: boolean;
  tier: string;
  talentbio?: string;
  followers: number;
  followings: number;
  lastActive?: number;
  isPrivate?: boolean;
  roleType?: string;
  experience?: string;
}

export default function FollowRequests() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const { colors, isDarkMode } = useThemeColors();

  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(
    new Set(),
  );
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
  const [showBulkDeclineDialog, setShowBulkDeclineDialog] = useState(false);
  const [showBulkAcceptDialog, setShowBulkAcceptDialog] = useState(false);

  const requesterId = searchParams.get("requester");
  const action = searchParams.get("action");

  // Fetch pending follow requests
  const pendingRequests = useQuery(
    api.controllers.user.getPendingFollowRequests,
    currentUser?._id ? { userId: currentUser._id } : "skip",
  ) as FollowRequest[] | undefined;

  const acceptRequest = useMutation(api.controllers.user.acceptFollowRequest);
  const declineRequest = useMutation(api.controllers.user.declineFollowRequest);

  // Handle single accept
  const handleAccept = async (requesterId: string, requesterName: string) => {
    if (!currentUser?.clerkId) return;

    try {
      await acceptRequest({
        userId: currentUser.clerkId,
        requesterId: requesterId as Id<"users">,
      });
      toast.success(`Accepted follow request from ${requesterName}`);
    } catch (error) {
      console.error("Failed to accept follow request:", error);
      toast.error("Failed to accept follow request");
    }
  };

  // Handle single decline
  const handleDecline = async (requesterId: string, requesterName: string) => {
    if (!currentUser?.clerkId) return;

    try {
      await declineRequest({
        userId: currentUser.clerkId,
        requesterId: requesterId as Id<"users">,
      });
      toast.success(`Declined follow request from ${requesterName}`);
    } catch (error) {
      console.error("Failed to decline follow request:", error);
      toast.error("Failed to decline follow request");
    }
  };

  // Handle bulk accept
  const handleBulkAccept = async () => {
    if (!currentUser?.clerkId || selectedRequests.size === 0) return;

    setIsBulkActionLoading(true);
    const results = [];

    for (const requestId of Array.from(selectedRequests)) {
      try {
        await acceptRequest({
          userId: currentUser.clerkId,
          requesterId: requestId as Id<"users">,
        });
        results.push({ requestId, success: true });
      } catch (error) {
        results.push({ requestId, success: false, error });
      }
    }

    setIsBulkActionLoading(false);
    setSelectedRequests(new Set());
    setShowBulkAcceptDialog(false);

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    if (successful > 0) {
      toast.success(
        `Accepted ${successful} follow request${successful !== 1 ? "s" : ""}`,
      );
    }
    if (failed > 0) {
      toast.error(
        `Failed to accept ${failed} request${failed !== 1 ? "s" : ""}`,
      );
    }
  };

  // Handle bulk decline
  const handleBulkDecline = async () => {
    if (!currentUser?.clerkId || selectedRequests.size === 0) return;

    setIsBulkActionLoading(true);
    const results = [];

    for (const requestId of Array.from(selectedRequests)) {
      try {
        await declineRequest({
          userId: currentUser.clerkId,
          requesterId: requestId as Id<"users">,
        });
        results.push({ requestId, success: true });
      } catch (error) {
        results.push({ requestId, success: false, error });
      }
    }

    setIsBulkActionLoading(false);
    setSelectedRequests(new Set());
    setShowBulkDeclineDialog(false);

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    if (successful > 0) {
      toast.success(
        `Declined ${successful} follow request${successful !== 1 ? "s" : ""}`,
      );
    }
    if (failed > 0) {
      toast.error(
        `Failed to decline ${failed} request${failed !== 1 ? "s" : ""}`,
      );
    }
  };

  // Toggle selection for a request
  const toggleRequestSelection = (requestId: string) => {
    const newSelected = new Set(selectedRequests);
    if (newSelected.has(requestId)) {
      newSelected.delete(requestId);
    } else {
      newSelected.add(requestId);
    }
    setSelectedRequests(newSelected);
  };

  // Select all requests
  const selectAllRequests = () => {
    if (!pendingRequests) return;

    if (selectedRequests.size === pendingRequests.length) {
      // If all are selected, deselect all
      setSelectedRequests(new Set());
    } else {
      // Select all
      const allRequestIds = pendingRequests
        .map((req) => req?._id)
        .filter(Boolean) as string[];
      setSelectedRequests(new Set(allRequestIds));
    }
  };

  // Check if all requests are selected
  const allSelected = useMemo(() => {
    if (!pendingRequests || pendingRequests.length === 0) return false;
    return selectedRequests.size === pendingRequests.length;
  }, [pendingRequests, selectedRequests]);

  // Check if any requests are selected
  const hasSelectedRequests = selectedRequests.size > 0;

  // Stats for selected requests
  const selectedStats = useMemo(() => {
    if (!pendingRequests || selectedRequests.size === 0) return null;

    const selected = pendingRequests.filter(
      (req) => req && selectedRequests.has(req._id),
    );

    return {
      count: selected.length,
      musicians: selected.filter((req) => req.isMusician).length,
      clients: selected.filter((req) => req.isClient).length,
      proUsers: selected.filter((req) => req.tier === "pro").length,
    };
  }, [pendingRequests, selectedRequests]);

  // Format last active time
  const formatLastActive = (timestamp?: number) => {
    if (!timestamp) return "Unknown";

    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div
      className={cn("min-h-screen w-full overflow-x-hidden", colors.background)}
    >
      {/* Enhanced Header */}
      <div
        className={cn(
          "border-b sticky top-0 z-40",
          colors.navBackground,
          colors.border,
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-4"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className={cn(
                  "p-2 rounded-lg transition-all duration-200 shrink-0",
                  "hover:bg-opacity-20",
                  colors.hoverBg,
                  colors.textMuted,
                )}
              >
                <ArrowLeft size={20} />
              </button>
              <div
                className={cn(
                  "p-2 sm:p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10",
                  "border shrink-0",
                  isDarkMode ? "border-amber-400/20" : "border-amber-500/20",
                )}
              >
                <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
              </div>
              <div className="min-w-0">
                <h1
                  className={cn(
                    "text-xl sm:text-xl font-bold truncate",
                    colors.text,
                  )}
                >
                  Follow Requests
                </h1>
                <p
                  className={cn(
                    "text-xs sm:text-sm truncate",
                    colors.textMuted,
                  )}
                >
                  Manage who can follow you and see your content
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium shrink-0",
                  "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
                )}
              >
                {pendingRequests?.length || 0} Pending
              </div>

              <Button
                onClick={() => router.push("/social/followers")}
                variant="outline"
                className="rounded-xl text-sm shrink-0"
                size="sm"
              >
                View Followers
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {hasSelectedRequests && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "border-b sticky top-[73px] sm:top-[81px] z-30",
              colors.border,
              "bg-gradient-to-r from-blue-500/5 to-purple-500/5",
            )}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0" />
                    <span
                      className={cn(
                        "font-medium text-sm sm:text-base",
                        colors.text,
                      )}
                    >
                      {selectedRequests.size} request
                      {selectedRequests.size !== 1 ? "s" : ""} selected
                    </span>
                  </div>

                  {selectedStats && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {selectedStats.musicians > 0 && (
                        <Badge
                          variant="outline"
                          className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-xs"
                        >
                          <Music className="w-3 h-3 mr-1" />
                          {selectedStats.musicians} musician
                          {selectedStats.musicians !== 1 ? "s" : ""}
                        </Badge>
                      )}
                      {selectedStats.clients > 0 && (
                        <Badge
                          variant="outline"
                          className="bg-green-500/10 text-green-600 border-green-500/20 text-xs"
                        >
                          <Building className="w-3 h-3 mr-1" />
                          {selectedStats.clients} client
                          {selectedStats.clients !== 1 ? "s" : ""}
                        </Badge>
                      )}
                      {selectedStats.proUsers > 0 && (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs"
                        >
                          <Crown className="w-3 h-3 mr-1" />
                          {selectedStats.proUsers} pro user
                          {selectedStats.proUsers !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    onClick={() => setShowBulkAcceptDialog(true)}
                    disabled={isBulkActionLoading}
                    className="bg-green-500 hover:bg-green-600 text-white rounded-xl gap-2 text-sm"
                    size="sm"
                  >
                    <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                    Accept All ({selectedRequests.size})
                  </Button>

                  <Button
                    onClick={() => setShowBulkDeclineDialog(true)}
                    disabled={isBulkActionLoading}
                    variant="outline"
                    className="text-red-600 border-red-500/30 hover:bg-red-500/10 rounded-xl gap-2 text-sm"
                    size="sm"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    Decline All ({selectedRequests.size})
                  </Button>

                  <Button
                    onClick={() => setSelectedRequests(new Set())}
                    variant="ghost"
                    className="rounded-xl text-sm"
                    size="sm"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {pendingRequests && pendingRequests.length > 0 ? (
          <div className="space-y-4">
            {/* Select All Header */}
            <div
              className={cn(
                "p-4 rounded-xl border",
                colors.card,
                colors.border,
                "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3",
              )}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={selectAllRequests}
                  className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                />
                <span
                  className={cn(
                    "font-medium text-sm sm:text-base",
                    colors.text,
                  )}
                >
                  {allSelected ? "Deselect all" : "Select all"}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm flex-wrap">
                <span className={colors.textMuted}>
                  {pendingRequests.length} total
                </span>
                <span className={colors.textMuted}>
                  {pendingRequests.filter((req) => req.isMusician).length}{" "}
                  musicians
                </span>
                <span className={colors.textMuted}>
                  {pendingRequests.filter((req) => req.isClient).length} clients
                </span>
              </div>
            </div>

            {/* Requests List */}
            <div className="space-y-3">
              {pendingRequests.map((request, index) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "p-4 sm:p-6 rounded-xl border transition-all duration-300",
                    colors.card,
                    colors.border,
                    selectedRequests.has(request._id) &&
                      "ring-2 ring-blue-500/50 bg-blue-500/5 border-blue-500/30",
                  )}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Selection Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedRequests.has(request._id)}
                        onChange={() => toggleRequestSelection(request._id)}
                        className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500 mt-3 flex-shrink-0"
                      />

                      {/* User Info */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          {request.picture ? (
                            <img
                              src={request.picture}
                              alt={request.firstname || "User"}
                              className="rounded-xl object-cover border-2 border-transparent h-[56px] w-[56px]"
                            />
                          ) : (
                            <div
                              className={cn(
                                "w-14 h-14 rounded-xl flex items-center justify-center",
                                colors.secondaryBackground,
                              )}
                            >
                              <UserPlus className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          {request.tier === "pro" && (
                            <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1">
                              <Crown className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>

                        {/* User Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                            <div className="min-w-0">
                              <h3
                                className={cn(
                                  "font-semibold text-base sm:text-lg truncate",
                                  colors.text,
                                )}
                              >
                                {request.firstname} {request.lastname}
                              </h3>
                              <p
                                className={cn(
                                  "text-sm truncate",
                                  colors.textMuted,
                                )}
                              >
                                @{request.username}
                              </p>
                            </div>

                            {/* Last Active */}
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {formatLastActive(request.lastActive)}
                            </div>
                          </div>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            <Badge
                              variant={
                                request.isMusician ? "default" : "secondary"
                              }
                              className={cn(
                                "text-xs",
                                request.isMusician
                                  ? "bg-purple-500 text-white"
                                  : "bg-green-500 text-white",
                              )}
                            >
                              {request.isMusician ? "Musician" : "Client"}
                            </Badge>
                            {request.tier === "pro" && (
                              <Badge
                                variant="outline"
                                className="bg-amber-500/20 text-amber-600 border-amber-500/30 text-xs"
                              >
                                PRO
                              </Badge>
                            )}
                            {request.isPrivate && (
                              <Badge
                                variant="outline"
                                className="text-xs border-gray-400"
                              >
                                <Shield className="w-3 h-3 mr-1" />
                                Private
                              </Badge>
                            )}
                          </div>

                          {/* Additional Info */}
                          <div className="flex flex-wrap items-center gap-3 text-sm mb-2">
                            {request.city && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                <span className={colors.textMuted}>
                                  {request.city}
                                </span>
                              </div>
                            )}
                            {request.instrument && (
                              <div className="flex items-center gap-1">
                                <Music className="w-3 h-3 text-purple-500" />
                                <span className={colors.textMuted}>
                                  {request.instrument}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-4 text-xs">
                            <span className={colors.textMuted}>
                              {request.followers} followers
                            </span>
                            <span className={colors.textMuted}>
                              {request.followings} following
                            </span>
                          </div>

                          {/* Bio */}
                          {request.talentbio && (
                            <div className="mt-3 pt-3 border-t">
                              <p
                                className={cn(
                                  "text-sm leading-relaxed line-clamp-2",
                                  colors.textMuted,
                                )}
                              >
                                {request.talentbio}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 justify-end lg:justify-start flex-shrink-0">
                      <Button
                        onClick={() =>
                          handleAccept(
                            request._id,
                            request.firstname || request.username,
                          )
                        }
                        className="bg-green-500 hover:bg-green-600 text-white rounded-xl gap-2 text-sm"
                        size="sm"
                      >
                        <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                        Accept
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-xl"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              handleDecline(
                                request._id,
                                request.firstname || request.username,
                              )
                            }
                            className="text-red-600"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Decline Request
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/profile/${request.username}`)
                            }
                          >
                            <Users className="w-4 h-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "text-center py-12 sm:py-16 rounded-xl border-2",
              colors.card,
              colors.border,
            )}
          >
            <Users className="mx-auto text-gray-400 w-12 h-12 sm:w-16 sm:h-16 mb-4" />
            <h3
              className={cn(
                "text-xl sm:text-xl font-bold mb-3 sm:mb-4",
                colors.text,
              )}
            >
              No Pending Requests
            </h3>
            <p
              className={cn(
                "text-sm sm:text-lg mb-6 sm:mb-8 max-w-md mx-auto px-4",
                colors.textMuted,
              )}
            >
              When someone requests to follow you, it will appear here for you
              to review. Share your profile to get more followers!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center px-4">
              <Button
                onClick={() => router.push("/profile")}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm sm:text-base"
                size="sm"
              >
                Share Profile
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/social/discover")}
                size="sm"
                className="text-sm sm:text-base"
              >
                Discover Users
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bulk Accept Dialog */}
      <Dialog
        open={showBulkAcceptDialog}
        onOpenChange={setShowBulkAcceptDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Accept Follow Requests</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to accept {selectedRequests.size} follow
              request{selectedRequests.size !== 1 ? "s" : ""}? These users will
              be able to see your content and you'll appear in their following
              list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowBulkAcceptDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkAccept}
              disabled={isBulkActionLoading}
              className="bg-green-500 hover:bg-green-600 text-white gap-2 flex-1"
            >
              <Check className="w-4 h-4" />
              {isBulkActionLoading
                ? "Accepting..."
                : `Accept ${selectedRequests.size} Request${selectedRequests.size !== 1 ? "s" : ""}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Decline Dialog */}
      <Dialog
        open={showBulkDeclineDialog}
        onOpenChange={setShowBulkDeclineDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Decline Follow Requests</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to decline {selectedRequests.size} follow
              request{selectedRequests.size !== 1 ? "s" : ""}? These users will
              not be notified, but they won't be able to follow you unless they
              send another request.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowBulkDeclineDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkDecline}
              disabled={isBulkActionLoading}
              variant="destructive"
              className="gap-2 flex-1"
            >
              <X className="w-4 h-4" />
              {isBulkActionLoading
                ? "Declining..."
                : `Decline ${selectedRequests.size} Request${selectedRequests.size !== 1 ? "s" : ""}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
