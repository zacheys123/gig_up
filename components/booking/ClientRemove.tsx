// components/gigs/ClientRemoveInterestButton.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface ClientRemoveInterestButtonProps {
  gigId: Id<"gigs">;
  userIdToRemove: Id<"users">;
  musicianName: string;
  gigTitle: string;
  onSuccess?: () => void;
  variant?:
    | "link"
    | "default"
    | "outline"
    | "destructive"
    | "primary"
    | "secondary"
    | "ghost"
    | "closed"
    | "update";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
  className?: string;
}

export const ClientRemoveInterestButton: React.FC<
  ClientRemoveInterestButtonProps
> = ({
  gigId,
  userIdToRemove,
  musicianName,
  gigTitle,
  onSuccess,
  variant = "outline",
  size = "sm",
  showText = true,
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const removeUserInterest = useMutation(
    api.controllers.gigs.removeUserInterest,
  );
  const { user: currentUser } = useCurrentUser(); // Get current user with Convex ID

  const handleRemoveInterest = async () => {
    // Check if we have the current user's Convex ID
    const clientId = currentUser?._id;

    if (!clientId) {
      toast.error("Authentication Required", {
        description: "Please sign in to perform this action",
      });
      return;
    }

    // Confirmation dialog
    if (
      !window.confirm(
        `Are you sure you want to remove ${musicianName}'s interest from "${gigTitle}"?`,
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await removeUserInterest({
        gigId,
        userIdToRemove,
        clientId, // Pass Convex ID, not Clerk ID
        reason: `Interest removed by client`,
      });

      toast.success("Interest Removed", {
        description: `${musicianName} has been removed from interested list`,
        action: {
          label: "Refresh",
          onClick: () => window.location.reload(),
        },
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error removing interest:", error);

      if (error.message.includes("CLIENT_NOT_FOUND")) {
        toast.error("Authentication Error", {
          description: "Please sign in again",
        });
      } else if (error.message.includes("PERMISSION_DENIED")) {
        toast.error("Permission Denied", {
          description: "Only the gig owner can remove interest",
        });
      } else if (error.message.includes("NOT_INTERESTED")) {
        toast.error("Not Interested", {
          description: "This user hasn't shown interest",
        });
      } else if (error.message.includes("BAND_GIG")) {
        toast.error("Band Gig", {
          description: "For band gigs, manage through band roles",
        });
      } else {
        toast.error("Failed to Remove Interest", {
          description: error.message || "Please try again",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleRemoveInterest}
      disabled={isLoading}
      className={`gap-1.5 ${className}`}
      title={`Remove ${musicianName}'s interest`}
    >
      {isLoading ? (
        <>
          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {showText && "Removing..."}
        </>
      ) : (
        <>
          <X className="w-3 h-3" />
          {showText && "Remove Interest"}
        </>
      )}
    </Button>
  );
};
