// hooks/useConfirmPayment.ts
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useCurrentUser } from "./useCurrentUser";

interface ConfirmPaymentState {
  confirmedParty: "none" | "client" | "musician" | "both";
  canFinalize: boolean;
  clientConfirmed?: boolean;
  musicianConfirmed?: boolean;
}

export const getConfirmState = (gigId: string): ConfirmPaymentState => {
  if (typeof window === "undefined") {
    return { confirmedParty: "none", canFinalize: false };
  }

  const stored = localStorage.getItem(`payment-confirm-${gigId}`);
  if (stored) {
    return JSON.parse(stored);
  }

  return { confirmedParty: "none", canFinalize: false };
};

export const useConfirmPayment = () => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const { user } = useCurrentUser();
  // Convex mutations for payment confirmation
  const confirmPaymentMutation = useMutation(
    api.controllers.payments.confirmPayment
  );
  const finalizePaymentMutation = useMutation(
    api.controllers.payments.finalizePayment
  );

  const storeConfirmState = (gigId: string, state: ConfirmPaymentState) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`payment-confirm-${gigId}`, JSON.stringify(state));
    }
  };

  const confirmPayment = async (
    gigId: string,
    partyType: "client" | "musician",
    confirmationCode: string
  ): Promise<{ success: boolean; message?: string }> => {
    if (!gigId || !confirmationCode.trim()) {
      toast.error("Please provide a confirmation code");
      return { success: false, message: "Missing confirmation code" };
    }

    setIsConfirming(true);

    try {
      const result = await confirmPaymentMutation({
        gigId: gigId as Id<"gigs">,
        partyType,
        confirmationCode: confirmationCode.trim(),
        userId: user?._id as Id<"users">,
      });

      if (result.success) {
        // Update local storage
        const currentState = getConfirmState(gigId);
        const newState: ConfirmPaymentState = {
          confirmedParty: partyType === "client" ? "client" : "musician",
          canFinalize: false,
          clientConfirmed:
            partyType === "client" ? true : currentState.clientConfirmed,
          musicianConfirmed:
            partyType === "musician" ? true : currentState.musicianConfirmed,
        };

        // If both parties have confirmed, enable finalization
        if (newState.clientConfirmed && newState.musicianConfirmed) {
          newState.confirmedParty = "both";
          newState.canFinalize = true;
        }

        storeConfirmState(gigId, newState);

        toast.success("Payment confirmed successfully");
        return { success: true, message: result.message };
      } else {
        toast.error(result.message || "Failed to confirm payment");
        return { success: false, message: result.message };
      }
    } catch (error: any) {
      console.error("Error confirming payment:", error);
      toast.error(error.message || "Failed to confirm payment");
      return { success: false, message: error.message };
    } finally {
      setIsConfirming(false);
    }
  };

  const finalizePayment = async (
    gigId: string,
    finalizedBy: "client" | "musician",
    finalizationNote?: string
  ): Promise<{ success: boolean; message?: string }> => {
    if (!gigId) {
      toast.error("Invalid gig ID");
      return { success: false, message: "Invalid gig ID" };
    }

    setIsFinalizing(true);

    try {
      const result = await finalizePaymentMutation({
        gigId: gigId as Id<"gigs">,
        finalizedBy,
        finalizationNote,
      });

      if (result.success) {
        // Clear local storage after finalization
        if (typeof window !== "undefined") {
          localStorage.removeItem(`payment-confirm-${gigId}`);
        }

        toast.success("Payment finalized successfully");
        return { success: true, message: result.message };
      } else {
        toast.error(result.message || "Failed to finalize payment");
        return { success: false, message: result.message };
      }
    } catch (error: any) {
      console.error("Error finalizing payment:", error);
      toast.error(error.message || "Failed to finalize payment");
      return { success: false, message: error.message };
    } finally {
      setIsFinalizing(false);
    }
  };

  return {
    confirmPayment,
    finalizePayment,
    isConfirming,
    isFinalizing,
    getConfirmState,
  };
};
