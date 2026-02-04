// components/gigs/RemoveInterestButton.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { XCircle, UserMinus } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

interface RemoveInterestButtonProps {
  gigId: Id<"gigs">;
  clerkId: string;
  onSuccess?: () => void;
  variant?: "default" | "outline" | "destructive" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
  userName?: string;
  gigTitle?: string;
  className?: string;
  iconOnly?: boolean;
}

export const RemoveInterestButton: React.FC<RemoveInterestButtonProps> = ({
  gigId,
  clerkId,
  onSuccess,
  variant = "outline",
  size = "sm",
  showText = true,
  userName = "You",
  gigTitle = "this gig",
  className = "",
  iconOnly = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const removeInterest = useMutation(
    api.controllers.gigs.removeInterestFromGig,
  );

  const handleRemoveInterest = async () => {
    if (!clerkId) {
      toast.error("Authentication Required", {
        description: "Please sign in to perform this action",
      });
      return;
    }

    // Confirmation dialog
    if (
      !window.confirm(
        `Are you sure you want to remove interest from "${gigTitle}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await removeInterest({
        gigId,
        clerkId,
        reason: `Removed interest by ${userName}`,
      });

      toast.success("Interest Removed", {
        description: `${userName} is no longer interested in "${gigTitle}"`,
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

      if (error.message.includes("Musician not found")) {
        toast.error("User Not Found", {
          description: "Your account could not be found. Please sign in again.",
        });
      } else if (error.message.includes("Gig not found")) {
        toast.error("Gig Not Found", {
          description: "This gig does not exist or has been deleted.",
        });
      } else if (error.message.includes("band gig")) {
        toast.error("Band Gig", {
          description: "For band gigs, please use the leave band option.",
        });
      } else if (error.message.includes("haven't shown interest")) {
        toast.error("No Interest Found", {
          description: "You haven't shown interest in this gig.",
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

  if (iconOnly) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleRemoveInterest}
        disabled={isLoading}
        className={`p-1.5 ${className}`}
        title="Remove Interest"
      >
        {isLoading ? (
          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <XCircle className="w-3 h-3" />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleRemoveInterest}
      disabled={isLoading}
      className={`gap-1.5 ${className}`}
    >
      {isLoading ? (
        <>
          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {showText && "Removing..."}
        </>
      ) : (
        <>
          <XCircle className="w-3 h-3" />
          {showText && "Remove Interest"}
        </>
      )}
    </Button>
  );
};
