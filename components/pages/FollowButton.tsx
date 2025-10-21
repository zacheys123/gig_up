import { IoMdAdd } from "react-icons/io";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSocialActions } from "@/hooks/useCurrentUser";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import {
  UserCheck,
  UserX,
  Clock,
  Loader2,
  CheckCheck,
  Trash,
} from "lucide-react";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

const FollowButton = ({
  _id,
  pendingFollowRequests,
  targetUserFollowings, // Add this prop - the target user's followings array
  variant,
  size,
  className,
}: {
  _id: string;
  pendingFollowRequests?: string[];
  targetUserFollowings?: string[]; // The target user's followings
  variant?:
    | "link"
    | "default"
    | "outline"
    | "destructive"
    | "primary"
    | "secondary"
    | "ghost"
    | "closed"
    | "update"
    | null
    | undefined;
  size?: "default" | "sm" | "lg" | "icon" | null | undefined;
  className?: string;
}) => {
  const { user: currentUser } = useCurrentUser();
  const { toggleFollow } = useSocialActions();
  const { isDarkMode } = useThemeColors();
  const { userId } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);

  const acceptFollowRequest = useMutation(
    api.controllers.user.acceptFollowRequest
  );
  const declineFollowRequest = useMutation(
    api.controllers.user.declineFollowRequest
  );

  // Current user is following target user
  const currentUserFollowingTarget =
    currentUser?.followings?.includes(_id) || false;

  // Target user is following current user
  const targetUserFollowingCurrent =
    targetUserFollowings?.includes(currentUser?._id as Id<"users">) || false;

  // Check if current user has a pending follow request FROM this target user
  // (someone wants to follow current user)
  const hasPendingRequestFromUser =
    currentUser?.pendingFollowRequests?.includes(_id as Id<"users">) || false;

  // Check if target user has pending request FROM current user
  // (current user sent request to target user)
  const hasSentRequestToUser =
    pendingFollowRequests?.includes(currentUser?._id as Id<"users">) || false;

  // Mutual follow relationship
  const isMutualFollow =
    currentUserFollowingTarget && targetUserFollowingCurrent;

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      await toggleFollow(currentUser?.clerkId as string, _id);
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptFollowRequest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId || accepting) return;

    setAccepting(true);
    try {
      await acceptFollowRequest({
        userId: userId,
        requesterId: _id as Id<"users">,
      });
    } catch (error) {
      console.error("Error accepting follow request:", error);
    } finally {
      setAccepting(false);
    }
  };

  const handleDeclineFollowRequest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId || declining) return;

    setDeclining(true);
    try {
      await declineFollowRequest({
        userId: userId,
        requesterId: _id as Id<"users">,
      });
    } catch (error) {
      console.error("Error declining follow request:", error);
    } finally {
      setDeclining(false);
    }
  };

  // Don't show follow button if user is viewing their own profile
  if (currentUser?._id === _id) {
    return null;
  }

  // LOGIC FLOW:
  // 1. First check pending requests (these take priority)
  // 2. Then check follow relationships
  // 3. Otherwise show regular follow button

  // If someone has sent us a follow request (and we haven't accepted it yet)
  if (hasPendingRequestFromUser && !targetUserFollowingCurrent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2"
      >
        {/* Accept Button */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleAcceptFollowRequest}
            disabled={accepting}
            size="sm"
            className={cn(
              "flex items-center gap-1.5 text-xs font-semibold",
              "bg-green-500 hover:bg-green-600 text-white",
              "transition-all duration-200 shadow-sm",
              className
            )}
          >
            {accepting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <UserCheck className="w-3 h-3" />
            )}
            <CheckCheck />
          </Button>
        </motion.div>

        {/* Decline Button */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleDeclineFollowRequest}
            disabled={declining}
            size="sm"
            variant="outline"
            className={cn(
              "flex items-center gap-1.5 text-xs font-semibold",
              "text-red-500 border-red-300 hover:bg-red-50 dark:hover:bg-red-950/20",
              "transition-all duration-200",
              className
            )}
          >
            {declining ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <UserX className="w-3 h-3" />
            )}
            <Trash />
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  // If we've sent a follow request to this user (waiting for their approval)
  if (hasSentRequestToUser && !currentUserFollowingTarget) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Button
          disabled
          className={cn(
            "flex items-center justify-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl",
            "border transition-all duration-200",
            "bg-gray-200 dark:bg-gray-700",
            "text-gray-500 dark:text-gray-400",
            "border-gray-300 dark:border-gray-600",
            "cursor-not-allowed",
            className
          )}
          variant={variant}
          size={size}
        >
          <Clock className="w-4 h-4" />
          <span>Request Sent</span>
        </Button>
      </motion.div>
    );
  }

  // If we're following the target user (regardless of whether they follow us back)
  if (currentUserFollowingTarget) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Button
          onClick={handleToggleFollow}
          disabled={isProcessing}
          className={
            className
              ? className
              : cn(
                  "flex items-center justify-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl bg-amber-500 hover:bg-red-500/10 border-red-400",
                  "border transition-all duration-200",

                  "text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300",

                  "backdrop-blur-sm"
                )
          }
          variant={variant}
          size={size}
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserX className="w-4 h-4" />
          )}
          <span>Unfollow</span>
        </Button>
      </motion.div>
    );
  }

  // If target user is following us but we're not following them back
  if (targetUserFollowingCurrent && !currentUserFollowingTarget) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <button
          onClick={handleToggleFollow}
          disabled={isProcessing}
          className={cn(
            "flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl",
            "transition-all duration-200 shadow-sm",
            "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600",
            "text-white hover:shadow-lg",
            isDarkMode
              ? "hover:shadow-green-500/25"
              : "hover:shadow-green-500/40",
            "backdrop-blur-sm",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Follow Back</span>
              <IoMdAdd className="text-base" />
            </>
          )}
        </button>
      </motion.div>
    );
  }

  // Regular follow button (no existing relationship)
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <button
        onClick={handleToggleFollow}
        disabled={isProcessing}
        className={cn(
          "flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl",
          "transition-all duration-200 shadow-sm",
          "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600",
          "text-white hover:shadow-lg",
          isDarkMode ? "hover:shadow-blue-500/25" : "hover:shadow-blue-500/40",
          "backdrop-blur-sm",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <span>Follow</span>
            <IoMdAdd className="text-base" />
          </>
        )}
      </button>
    </motion.div>
  );
};

export default FollowButton;
