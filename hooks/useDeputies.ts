// hooks/useDeputies.ts - Updated with proper trust integration
import { useQuery, useMutation } from "convex/react";
import { useState, useCallback } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCheckTrial } from "./useCheckTrial";
import { useCurrentUser } from "./useCurrentUser";
import { useTrustScore } from "./useTrustScore"; // ADD THIS IMPORT

interface handles {
  platform: string;
  handle: string;
}
export interface DeputyUser {
  _id: Id<"users">;
  clerkId: string;
  firstname?: string;
  lastname?: string;
  username: string;
  picture?: string;
  instrument?: string;
  roleType?: string;
  city?: string;
  avgRating?: number;
  completedGigsCount?: number;
  reliabilityScore?: number;
  backupCount: number;
  existingRelationship?: {
    status: "pending" | "accepted" | "rejected";
    forTheirSkill: string;
  };
  musicianhandles?: handles[];
  // ADD THESE TRUST FIELDS
  trustScore?: number;
  trustStars?: number;
  trustTier?: string;
}

export interface DeputyRelationship {
  deputyUserId: Id<"users">;
  forMySkill: string;
  gigType?: string;
  note?: string;
  status: "pending" | "accepted" | "rejected";
  canBeBooked: boolean;
  dateAdded: number;
}

export interface PendingDeputyRequest {
  principalUserId: Id<"users">;
  forTheirSkill: string;
  gigType?: string;
  status: "pending";
  dateAdded: number;
}

export interface PendingRequest {
  principal: DeputyUser;
  request: PendingDeputyRequest;
}

export const useDeputies = (currentUserId?: Id<"users">) => {
  // Queries
  const deputies = useQuery(
    api.controllers.deputies.searchDeputies,
    currentUserId ? { currentUserId } : "skip"
  );

  const myDeputies = useQuery(
    api.controllers.deputies.getMyDeputies,
    currentUserId ? { principalId: currentUserId } : "skip"
  );

  const pendingRequests = useQuery(
    api.controllers.deputies.getPendingRequests,
    currentUserId ? { userId: currentUserId } : "skip"
  );

  // Mutations
  const sendRequestMutation = useMutation(
    api.controllers.deputies.sendDeputyRequest
  );
  const respondToRequestMutation = useMutation(
    api.controllers.deputies.respondToDeputyRequest
  );
  const removeDeputyMutation = useMutation(
    api.controllers.deputies.removeDeputy
  );
  const updateSettingsMutation = useMutation(
    api.controllers.deputies.updateDeputySettings
  );

  // State
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const { isInGracePeriod } = useCheckTrial();
  const { user: currentUser } = useCurrentUser();

  // ADD THIS: Use the trust score hook
  const { canAccess, trustStars, trustScore } = useTrustScore();

  // Actions
  const cancelRequestMutation = useMutation(
    api.controllers.deputies.cancelDeputyRequest
  );

  // Add cancel function
  const cancelDeputyRequest = useCallback(
    async (deputyId: Id<"users">) => {
      if (!currentUserId) throw new Error("No current user");

      const key = `cancel-${deputyId}`;
      setLoadingStates((prev) => ({ ...prev, [key]: true }));

      try {
        console.log("🎯 [HOOK] Cancelling deputy request:", {
          currentUserId,
          deputyId,
        });

        await cancelRequestMutation({
          principalId: currentUserId,
          deputyId,
        });

        console.log("✅ [HOOK] Deputy request cancelled successfully");
        return { success: true };
      } catch (error) {
        console.error("❌ [HOOK] Deputy request cancellation failed:", error);
        return { success: false, error: (error as Error).message };
      } finally {
        setLoadingStates((prev) => ({ ...prev, [key]: false }));
      }
    },
    [currentUserId, cancelRequestMutation]
  );

  // Function to check if deputy is eligible based on trust
  const checkDeputyEligibility = (
    deputy: DeputyUser,
    currentUser: any,
    skill: string
  ): { eligible: boolean; reason?: string } => {
    // Get trust scores
    const deputyTrustScore = deputy.trustScore || 0;
    const deputyTrustStars = deputy.trustStars || 0.5;
    const currentUserTrustScore = currentUser?.trustScore || 0;
    const currentUserTrustStars = trustStars; // Use from hook instead

    // Minimum trust requirements for different scenarios
    const MIN_TRUST_STARS_FOR_DEPUTY = 2.0; // Basic trust required
    const MIN_TRUST_STARS_FOR_BOOKABLE = 3.0; // Can be directly booked
    const MIN_TRUST_SCORE_FOR_RELIABLE = 50; // Verified status

    // Check if deputy has minimum trust
    if (deputyTrustStars < MIN_TRUST_STARS_FOR_DEPUTY) {
      return {
        eligible: false,
        reason: `Deputy needs at least ${MIN_TRUST_STARS_FOR_DEPUTY} trust stars`,
      };
    }

    // Check if deputy can be bookable (higher trust required)
    const canBeBookable = deputyTrustStars >= MIN_TRUST_STARS_FOR_BOOKABLE;

    // Check if deputy is verified/trusted
    const isReliable = deputyTrustScore >= MIN_TRUST_SCORE_FOR_RELIABLE;

    // Additional checks based on current user's trust
    if (currentUserTrustStars < 2.0) {
      return {
        eligible: false,
        reason: "Your trust rating is too low to add deputies",
      };
    }

    return {
      eligible: true,
      reason: canBeBookable
        ? "Can be directly booked"
        : "Needs approval for each booking",
    };
  };

  // UPDATED: sendDeputyRequest function with proper trust checks
  const sendDeputyRequest = useCallback(
    async (
      deputyId: Id<"users">,
      skill: string,
      gigType?: string,
      note?: string
    ) => {
      if (!currentUserId) throw new Error("No current user");

      console.log("🎯 [HOOK DEBUG] Sending deputy request:", {
        currentUserId,
        deputyId,
        skill,
        gigType,
        isInGracePeriod,
        currentUserTier: currentUser?.tier,
        currentUserTrustStars: trustStars, // Add trust info
      });

      // FIXED: Use canAccess from useTrustScore hook
      const hasPermission = canAccess("canBeDual");
      if (!hasPermission) {
        return {
          success: false,
          error: "You need to reach trust level 4.0 stars to add deputies",
        };
      }

      // Also check minimum stars requirement
      if (trustStars < 4.0) {
        return {
          success: false,
          error: `You need at least 4.0 trust stars to add deputies. You have ${trustStars.toFixed(1)} stars`,
        };
      }

      const key = `send-${deputyId}`;
      setLoadingStates((prev) => ({ ...prev, [key]: true }));

      try {
        const result = await sendRequestMutation({
          principalId: currentUserId,
          deputyId,
          forMySkill: skill,
          gigType,
          note,
          isViewerInGracePeriod: isInGracePeriod,
        });

        console.log("✅ [HOOK DEBUG] Deputy request completed:", result);
        return { success: true };
      } catch (error) {
        console.error("❌ [HOOK DEBUG] Deputy request failed:", error);
        return { success: false, error: (error as Error).message };
      } finally {
        setLoadingStates((prev) => ({ ...prev, [key]: false }));
      }
    },
    [
      currentUserId,
      sendRequestMutation,
      isInGracePeriod,
      currentUser?.tier,
      canAccess,
      trustStars,
    ]
  );

  // UPDATED: Enhanced sendDeputyRequest with deputy trust validation
  const sendDeputyRequestWithValidation = useCallback(
    async (
      deputy: DeputyUser,
      skill: string,
      gigType?: string,
      note?: string
    ) => {
      if (!currentUserId) throw new Error("No current user");

      // Validate current user can add deputies
      const canAddResult = checkCanAddDeputy(deputy.trustStars);
      if (!canAddResult.canAdd) {
        return {
          success: false,
          error: canAddResult.reason || "Cannot add deputy",
        };
      }

      // Validate deputy eligibility
      const deputyEligibility = checkDeputyEligibility(
        deputy,
        currentUser,
        skill
      );
      if (!deputyEligibility.eligible) {
        return {
          success: false,
          error: deputyEligibility.reason || "Deputy not eligible",
        };
      }

      return await sendDeputyRequest(deputy._id, skill, gigType, note);
    },
    [currentUserId, currentUser, checkDeputyEligibility, sendDeputyRequest]
  );

  const respondToDeputyRequest = useCallback(
    async (principalId: Id<"users">, status: "accepted" | "rejected") => {
      if (!currentUserId) throw new Error("No current user");

      const key = `respond-${principalId}`;
      setLoadingStates((prev) => ({ ...prev, [key]: true }));

      try {
        await respondToRequestMutation({
          deputyId: currentUserId,
          principalId,
          status,
        });
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      } finally {
        setLoadingStates((prev) => ({ ...prev, [key]: false }));
      }
    },
    [currentUserId, respondToRequestMutation]
  );

  const removeDeputy = useCallback(
    async (deputyId: Id<"users">) => {
      if (!currentUserId) throw new Error("No current user");

      const key = `remove-${deputyId}`;
      setLoadingStates((prev) => ({ ...prev, [key]: true }));

      try {
        await removeDeputyMutation({
          principalId: currentUserId,
          deputyId,
        });
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      } finally {
        setLoadingStates((prev) => ({ ...prev, [key]: false }));
      }
    },
    [currentUserId, removeDeputyMutation]
  );

  const updateDeputySettings = useCallback(
    async (
      deputyId: Id<"users">,
      updates: {
        canBeBooked?: boolean;
        note?: string;
        gigType?: string;
      }
    ) => {
      if (!currentUserId) throw new Error("No current user");

      // Check if trying to set canBeBooked to true
      if (updates.canBeBooked === true) {
        const deputy = myDeputies?.find((d) => d?._id === deputyId);
        if (deputy && (deputy.trustStars || 0.5) < 3.0) {
          return {
            success: false,
            error:
              "Deputy needs at least 3.0 trust stars to be directly bookable",
          };
        }
      }

      const key = `update-${deputyId}`;
      setLoadingStates((prev) => ({ ...prev, [key]: true }));

      try {
        await updateSettingsMutation({
          principalId: currentUserId,
          deputyId,
          updates,
        });
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      } finally {
        setLoadingStates((prev) => ({ ...prev, [key]: false }));
      }
    },
    [currentUserId, updateSettingsMutation, myDeputies]
  );

  // Helper functions for trust checks
  const checkCanAddDeputy = (
    targetTrustStars?: number
  ): {
    canAdd: boolean;
    reason?: string;
    requiredStars: number;
    currentStars: number;
  } => {
    const requiredStars = 4.0; // Need 4.0 stars to add deputies
    const currentStars = trustStars;

    if (currentStars < requiredStars) {
      return {
        canAdd: false,
        reason: `You need at least ${requiredStars} trust stars to add deputies. You have ${currentStars.toFixed(1)}`,
        requiredStars,
        currentStars,
      };
    }

    // Check if target deputy is eligible
    if (targetTrustStars && targetTrustStars < 2.0) {
      return {
        canAdd: false,
        reason: `Deputy needs at least 2.0 trust stars. They have ${targetTrustStars.toFixed(1)}`,
        requiredStars: 2.0,
        currentStars: targetTrustStars,
      };
    }

    return {
      canAdd: true,
      requiredStars,
      currentStars,
    };
  };

  const checkCanBeBooked = (deputyTrustStars: number): boolean => {
    // Deputy needs at least 3.0 stars to be directly bookable
    return deputyTrustStars >= 3.0;
  };

  const checkIsReliableDeputy = (deputyTrustScore: number): boolean => {
    // Deputy needs at least 50 trust score to be considered reliable
    return deputyTrustScore >= 50;
  };

  const getTrustRequirements = () => ({
    toAddDeputy: 4.0,
    toBeDeputy: 2.0,
    toBeBookable: 3.0,
    toBeReliable: 50,
  });

  // Derived state
  const isLoading = (key: string) => loadingStates[key] || false;
  const hasPendingRequests = pendingRequests && pendingRequests.length > 0;
  const hasDeputies = myDeputies && myDeputies.length > 0;

  return {
    // Data
    deputies: deputies || [],
    myDeputies: myDeputies || [],
    pendingRequests: pendingRequests || [],

    // Actions
    sendDeputyRequest,
    sendDeputyRequestWithValidation, // New function with validation
    respondToDeputyRequest,
    removeDeputy,
    updateDeputySettings,
    cancelDeputyRequest,

    // Trust-related functions
    checkDeputyEligibility,
    checkCanAddDeputy,
    checkCanBeBooked,
    checkIsReliableDeputy,
    getTrustRequirements,

    // State
    isLoading,
    hasPendingRequests,
    hasDeputies,
    totalDeputies: myDeputies?.length || 0,
    totalPending: pendingRequests?.length || 0,

    // Trust state from hook
    currentTrustStars: trustStars,
    currentTrustScore: trustScore,
    canAccessDualRole: canAccess("canBeDual"),
  };
};
