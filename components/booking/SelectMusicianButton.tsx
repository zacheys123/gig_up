// components/gigs/SelectMusicianButton.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, ShoppingBag } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface SelectMusicianButtonProps {
  gigId: Id<"gigs">;
  musicianId: Id<"users">;
  musicianName: string;
  gigTitle: string;
  bookedPrice?: number;
  notes?: string;
  onSuccess?: () => void;
  variant?: "default" | "outline" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
  className?: string;
}

export const SelectMusicianButton: React.FC<SelectMusicianButtonProps> = ({
  gigId,
  musicianId,
  musicianName,
  gigTitle,
  bookedPrice,
  notes,
  onSuccess,
  variant = "default",
  size = "default",
  showText = true,
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const selectMusicianFromInterested = useMutation(
    api.controllers.gigs.selectMusicianFromInterested,
  );
  const { user: currentUser } = useCurrentUser();

  const handleSelectMusician = async () => {
    const clientId = currentUser?._id;

    if (!clientId) {
      toast.error("Authentication Required", {
        description: "Please sign in to select a musician",
      });
      return;
    }

    // Confirmation dialog
    if (
      !window.confirm(
        `Are you sure you want to select ${musicianName} for "${gigTitle}"?`,
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await selectMusicianFromInterested({
        gigId,
        musicianId,
        clientId, // Pass Convex ID
        bookedPrice,
        notes,
      });

      toast.success("Musician Selected!", {
        description: `${musicianName} has been selected for the gig`,
        action: {
          label: "View Booking",
          onClick: () => (window.location.href = `/gigs/${gigId}`),
        },
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error selecting musician:", error);

      if (error.message.includes("Client not found")) {
        toast.error("Authentication Error", {
          description: "Please sign in again",
        });
      } else if (error.message.includes("Only the gig creator")) {
        toast.error("Permission Denied", {
          description: "Only the gig owner can select musicians",
        });
      } else if (error.message.includes("This is a band gig")) {
        toast.error("Band Gig", {
          description: "For band gigs, use the band management interface",
        });
      } else if (error.message.includes("already been taken")) {
        toast.error("Gig Already Booked", {
          description: "This gig has already been booked",
        });
      } else if (error.message.includes("hasn't shown interest")) {
        toast.error("Not Interested", {
          description: "This musician hasn't shown interest in the gig",
        });
      } else {
        toast.error("Failed to Select Musician", {
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
      onClick={handleSelectMusician}
      disabled={isLoading}
      className={`gap-2 px-4 min-w-[150px] ${className}`}
      title={`Select ${musicianName} for this gig`}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {showText && "Selecting..."}
        </>
      ) : (
        <>
          <CheckCircle className="w-4 h-4" />
          {showText && `Select ${musicianName}`}
        </>
      )}
    </Button>
  );
};
