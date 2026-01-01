// hooks/useDeputies.ts - Optimized with proper trust integration
import { useQuery, useMutation } from "convex/react";
import { useState, useCallback, useMemo } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCheckTrial } from "./useCheckTrial";
import { useCurrentUser } from "./useCurrentUser";
import { useTrustScore } from "./useTrustScore";

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

// Constants for trust requirements
const TRUST_REQUIREMENTS = {
  MIN_STARS_TO_ADD_DEPUTY: 4.0,
  MIN_STARS_TO_BE_DEPUTY: 2.0,
  MIN_STARS_TO_BE_BOOKABLE: 3.0,
  MIN_SCORE_TO_BE_RELIABLE: 50,
  ONLINE_TIMEOUT_MS: 300000, // 5 minutes
} as const;

// Cache for eligibility checks
const eligibilityCache = new Map<string, { timestamp: number; result: any }>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export const useDeputies = (currentUserId?: Id<"users">) => {
  // Memoize query args
  const deputiesArgs = useMemo(
    () => (currentUserId ? { currentUserId } : "skip"),
    [currentUserId]
  );

  const myDeputiesArgs = useMemo(
    () => (currentUserId ? { principalId: currentUserId } : "skip"),
    [currentUserId]
  );

  const pendingRequestsArgs = useMemo(
    () => (currentUserId ? { userId: currentUserId } : "skip"),
    [currentUserId]
  );

  // Queries with stable args
  const deputiesQuery = useQuery(
    api.controllers.deputies.searchDeputies,
    deputiesArgs
  );
  const myDeputiesQuery = useQuery(
    api.controllers.deputies.getMyDeputies,
    myDeputiesArgs
  );
  const pendingRequestsQuery = useQuery(
    api.controllers.deputies.getPendingRequests,
    pendingRequestsArgs
  );

  // Memoize data
  const deputies = useMemo(() => deputiesQuery || [], [deputiesQuery]);
  const myDeputies = useMemo(() => myDeputiesQuery || [], [myDeputiesQuery]);
  const pendingRequests = useMemo(
    () => pendingRequestsQuery || [],
    [pendingRequestsQuery]
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
  const cancelRequestMutation = useMutation(
    api.controllers.deputies.cancelDeputyRequest
  );

  // State management
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );

  // External hooks
  const { isInGracePeriod } = useCheckTrial();
  const { user: currentUser } = useCurrentUser();
  const { canAccess, trustStars, trustScore } = useTrustScore();

  // Loading state helper
  const isLoading = useCallback(
    (key: string) => loadingStates[key] || false,
    [loadingStates]
  );

  // Set loading state with key deduplication
  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates((prev) => {
      if (prev[key] === loading) return prev;
      return { ...prev, [key]: loading };
    });
  }, []);

  // Eligibility check with caching
  const checkDeputyEligibility = useCallback(
    (
      deputy: DeputyUser,
      targetUser: any,
      skill: string
    ): {
      eligible: boolean;
      reason?: string;
      canBeBookable: boolean;
      isReliable: boolean;
    } => {
      const cacheKey = `eligibility-${deputy._id}-${skill}`;
      const cached = eligibilityCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
        return cached.result;
      }

      const deputyTrustStars = deputy.trustStars || 0.5;
      const deputyTrustScore = deputy.trustScore || 0;
      const targetTrustStars = targetUser?.trustStars || 0.5;

      // Check minimum deputy trust
      if (deputyTrustStars < TRUST_REQUIREMENTS.MIN_STARS_TO_BE_DEPUTY) {
        const result = {
          eligible: false,
          reason: `Deputy needs at least ${TRUST_REQUIREMENTS.MIN_STARS_TO_BE_DEPUTY} trust stars`,
          canBeBookable: false,
          isReliable: false,
        };
        eligibilityCache.set(cacheKey, { timestamp: Date.now(), result });
        return result;
      }

      // Check target user trust
      if (targetTrustStars < 2.0) {
        const result = {
          eligible: false,
          reason: "Your trust rating is too low to add deputies",
          canBeBookable: false,
          isReliable: false,
        };
        eligibilityCache.set(cacheKey, { timestamp: Date.now(), result });
        return result;
      }

      const canBeBookable =
        deputyTrustStars >= TRUST_REQUIREMENTS.MIN_STARS_TO_BE_BOOKABLE;
      const isReliable =
        deputyTrustScore >= TRUST_REQUIREMENTS.MIN_SCORE_TO_BE_RELIABLE;

      const result = {
        eligible: true,
        reason: canBeBookable
          ? "Can be directly booked"
          : "Needs approval for each booking",
        canBeBookable,
        isReliable,
      };

      eligibilityCache.set(cacheKey, { timestamp: Date.now(), result });
      return result;
    },
    []
  );

  // Permission check with caching
  const checkCanAddDeputy = useCallback(
    (
      targetTrustStars?: number
    ): {
      canAdd: boolean;
      reason?: string;
      requiredStars: number;
      currentStars: number;
    } => {
      const requiredStars = TRUST_REQUIREMENTS.MIN_STARS_TO_ADD_DEPUTY;
      const currentStars = trustStars;

      if (currentStars < requiredStars) {
        return {
          canAdd: false,
          reason: `You need at least ${requiredStars} trust stars to add deputies. You have ${currentStars.toFixed(1)}`,
          requiredStars,
          currentStars,
        };
      }

      if (
        targetTrustStars &&
        targetTrustStars < TRUST_REQUIREMENTS.MIN_STARS_TO_BE_DEPUTY
      ) {
        return {
          canAdd: false,
          reason: `Deputy needs at least ${TRUST_REQUIREMENTS.MIN_STARS_TO_BE_DEPUTY} trust stars. They have ${targetTrustStars.toFixed(1)}`,
          requiredStars: TRUST_REQUIREMENTS.MIN_STARS_TO_BE_DEPUTY,
          currentStars: targetTrustStars,
        };
      }

      return {
        canAdd: true,
        requiredStars,
        currentStars,
      };
    },
    [trustStars]
  );

  // Send deputy request with validation
  const sendDeputyRequest = useCallback(
    async (
      deputyId: Id<"users">,
      skill: string,
      gigType?: string,
      note?: string
    ): Promise<{ success: boolean; error?: string }> => {
      if (!currentUserId) {
        return { success: false, error: "No current user" };
      }

      const hasPermission = canAccess("canBeDual");
      if (!hasPermission) {
        return {
          success: false,
          error: "You need to reach trust level 4.0 stars to add deputies",
        };
      }

      if (trustStars < 4.0) {
        return {
          success: false,
          error: `You need at least 4.0 trust stars to add deputies. You have ${trustStars.toFixed(1)} stars`,
        };
      }

      const key = `send-${deputyId}`;
      setLoading(key, true);

      try {
        await sendRequestMutation({
          principalId: currentUserId,
          deputyId,
          forMySkill: skill,
          gigType,
          note,
          isViewerInGracePeriod: isInGracePeriod,
        });

        // Clear cache for this deputy
        Array.from(eligibilityCache.keys())
          .filter((k) => k.includes(deputyId))
          .forEach((k) => eligibilityCache.delete(k));

        return { success: true };
      } catch (error) {
        console.error("Deputy request failed:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      } finally {
        setLoading(key, false);
      }
    },
    [
      currentUserId,
      sendRequestMutation,
      isInGracePeriod,
      canAccess,
      trustStars,
      setLoading,
    ]
  );

  // Enhanced send with validation
  const sendDeputyRequestWithValidation = useCallback(
    async (
      deputy: DeputyUser,
      skill: string,
      gigType?: string,
      note?: string
    ): Promise<{ success: boolean; error?: string }> => {
      if (!currentUserId) {
        return { success: false, error: "No current user" };
      }

      // Check permissions
      const canAddResult = checkCanAddDeputy(deputy.trustStars);
      if (!canAddResult.canAdd) {
        return { success: false, error: canAddResult.reason };
      }

      // Check deputy eligibility
      const deputyEligibility = checkDeputyEligibility(
        deputy,
        currentUser,
        skill
      );
      if (!deputyEligibility.eligible) {
        return { success: false, error: deputyEligibility.reason };
      }

      return await sendDeputyRequest(deputy._id, skill, gigType, note);
    },
    [
      currentUserId,
      currentUser,
      checkCanAddDeputy,
      checkDeputyEligibility,
      sendDeputyRequest,
    ]
  );

  // Cancel request
  const cancelDeputyRequest = useCallback(
    async (
      deputyId: Id<"users">
    ): Promise<{ success: boolean; error?: string }> => {
      if (!currentUserId) {
        return { success: false, error: "No current user" };
      }

      const key = `cancel-${deputyId}`;
      setLoading(key, true);

      try {
        await cancelRequestMutation({
          principalId: currentUserId,
          deputyId,
        });
        return { success: true };
      } catch (error) {
        console.error("Deputy request cancellation failed:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      } finally {
        setLoading(key, false);
      }
    },
    [currentUserId, cancelRequestMutation, setLoading]
  );

  // Respond to request
  const respondToDeputyRequest = useCallback(
    async (
      principalId: Id<"users">,
      status: "accepted" | "rejected"
    ): Promise<{ success: boolean; error?: string }> => {
      if (!currentUserId) {
        return { success: false, error: "No current user" };
      }

      const key = `respond-${principalId}`;
      setLoading(key, true);

      try {
        await respondToRequestMutation({
          deputyId: currentUserId,
          principalId,
          status,
        });
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      } finally {
        setLoading(key, false);
      }
    },
    [currentUserId, respondToRequestMutation, setLoading]
  );

  // Remove deputy
  const removeDeputy = useCallback(
    async (
      deputyId: Id<"users">
    ): Promise<{ success: boolean; error?: string }> => {
      if (!currentUserId) {
        return { success: false, error: "No current user" };
      }

      const key = `remove-${deputyId}`;
      setLoading(key, true);

      try {
        await removeDeputyMutation({
          principalId: currentUserId,
          deputyId,
        });
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      } finally {
        setLoading(key, false);
      }
    },
    [currentUserId, removeDeputyMutation, setLoading]
  );

  // Update deputy settings
  const updateDeputySettings = useCallback(
    async (
      deputyId: Id<"users">,
      updates: {
        canBeBooked?: boolean;
        note?: string;
        gigType?: string;
      }
    ): Promise<{ success: boolean; error?: string }> => {
      if (!currentUserId) {
        return { success: false, error: "No current user" };
      }

      // Validate canBeBooked permission
      if (updates.canBeBooked === true) {
        const deputy = myDeputies.find((d) => d?._id === deputyId);
        if (
          deputy &&
          (deputy.trustStars || 0.5) <
            TRUST_REQUIREMENTS.MIN_STARS_TO_BE_BOOKABLE
        ) {
          return {
            success: false,
            error: `Deputy needs at least ${TRUST_REQUIREMENTS.MIN_STARS_TO_BE_BOOKABLE} trust stars to be directly bookable`,
          };
        }
      }

      const key = `update-${deputyId}`;
      setLoading(key, true);

      try {
        await updateSettingsMutation({
          principalId: currentUserId,
          deputyId,
          updates,
        });
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      } finally {
        setLoading(key, false);
      }
    },
    [currentUserId, updateSettingsMutation, myDeputies, setLoading]
  );

  // Helper functions
  const checkCanBeBooked = useCallback((deputyTrustStars: number): boolean => {
    return deputyTrustStars >= TRUST_REQUIREMENTS.MIN_STARS_TO_BE_BOOKABLE;
  }, []);

  const checkIsReliableDeputy = useCallback(
    (deputyTrustScore: number): boolean => {
      return deputyTrustScore >= TRUST_REQUIREMENTS.MIN_SCORE_TO_BE_RELIABLE;
    },
    []
  );

  const getTrustRequirements = useCallback(() => TRUST_REQUIREMENTS, []);

  // Derived state
  const hasPendingRequests = useMemo(
    () => pendingRequests.length > 0,
    [pendingRequests]
  );
  const hasDeputies = useMemo(() => myDeputies.length > 0, [myDeputies]);

  // Memoize return object
  const result = useMemo(
    () => ({
      // Data
      deputies,
      myDeputies,
      pendingRequests,

      // Actions
      sendDeputyRequest,
      sendDeputyRequestWithValidation,
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

      // State helpers
      isLoading,
      hasPendingRequests,
      hasDeputies,
      totalDeputies: myDeputies.length,
      totalPending: pendingRequests.length,

      // Trust state
      currentTrustStars: trustStars,
      currentTrustScore: trustScore,
      canAccessDualRole: canAccess("canBeDual"),

      // Loading states
      loadingStates,
    }),
    [
      deputies,
      myDeputies,
      pendingRequests,
      sendDeputyRequest,
      sendDeputyRequestWithValidation,
      respondToDeputyRequest,
      removeDeputy,
      updateDeputySettings,
      cancelDeputyRequest,
      checkDeputyEligibility,
      checkCanAddDeputy,
      checkCanBeBooked,
      checkIsReliableDeputy,
      getTrustRequirements,
      isLoading,
      hasPendingRequests,
      hasDeputies,
      trustStars,
      trustScore,
      canAccess,
      loadingStates,
    ]
  );

  return result;
};

// Optional: Hook for deputy filtering
export const useFilteredDeputies = (
  currentUserId?: Id<"users">,
  filters?: {
    minTrustScore?: number;
    instrument?: string;
    city?: string;
    canBeBooked?: boolean;
  }
) => {
  const { deputies, isLoading } = useDeputies(currentUserId);

  const filteredDeputies = useMemo(() => {
    if (!filters || Object.keys(filters).length === 0) {
      return deputies;
    }

    return deputies.filter((deputy) => {
      if (
        filters.minTrustScore &&
        (deputy.trustScore || 0) < filters.minTrustScore
      ) {
        return false;
      }
      if (filters.instrument && deputy.instrument !== filters.instrument) {
        return false;
      }
      if (filters.city && deputy.city !== filters.city) {
        return false;
      }
      if (filters.canBeBooked !== undefined) {
        const canBeBooked =
          (deputy.trustStars || 0.5) >=
          TRUST_REQUIREMENTS.MIN_STARS_TO_BE_BOOKABLE;
        if (canBeBooked !== filters.canBeBooked) {
          return false;
        }
      }
      return true;
    });
  }, [deputies, filters]);

  return {
    deputies: filteredDeputies,
    isLoading,
    count: filteredDeputies.length,
  };
};
