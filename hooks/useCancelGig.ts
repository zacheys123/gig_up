// hooks/useCancelGig.ts
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

interface CancelGigParams {
  gigId: string;
  musicianId: string;
  reason: string;
  cancelerType: "client" | "musician";
}

export const useCancelGig = () => {
  const [isCanceling, setIsCanceling] = useState(false);

  // Convex mutation for canceling gig
  const cancelGigMutation = useMutation(api.controllers.gigs.cancelGig);

  const cancelGig = async (
    gigId: string,
    musicianId: string,
    reason: string,
    cancelerType: "client" | "musician"
  ): Promise<{ success: boolean; message?: string }> => {
    if (!gigId || !reason.trim()) {
      toast.error("Please provide a cancellation reason");
      return { success: false, message: "Missing required fields" };
    }

    setIsCanceling(true);

    try {
      const result = await cancelGigMutation({
        gigId: gigId as Id<"gigs">,
        musicianId: musicianId as Id<"users">,
        reason: reason.trim(),
        cancelerType,
      });

      if (result.success) {
        toast.success("Gig cancelled successfully");
        return { success: true, message: result.message };
      } else {
        toast.error(result.message || "Failed to cancel gig");
        return { success: false, message: result.message };
      }
    } catch (error: any) {
      console.error("Error cancelling gig:", error);
      toast.error(error.message || "Failed to cancel gig");
      return { success: false, message: error.message };
    } finally {
      setIsCanceling(false);
    }
  };

  return {
    cancelGig,
    isCanceling,
  };
};
