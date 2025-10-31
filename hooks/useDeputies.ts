// hooks/useDeputies.ts
import { useQuery, useMutation } from "convex/react";
import { useState, useCallback } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

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

  // Actions
  const sendDeputyRequest = useCallback(
    async (
      deputyId: Id<"users">,
      skill: string,
      gigType?: string,
      note?: string
    ) => {
      if (!currentUserId) throw new Error("No current user");

      const key = `send-${deputyId}`;
      setLoadingStates((prev) => ({ ...prev, [key]: true }));

      try {
        await sendRequestMutation({
          principalId: currentUserId,
          deputyId,
          forMySkill: skill,
          gigType,
          note,
        });
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      } finally {
        setLoadingStates((prev) => ({ ...prev, [key]: false }));
      }
    },
    [currentUserId, sendRequestMutation]
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
    [currentUserId, updateSettingsMutation]
  );

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
    respondToDeputyRequest,
    removeDeputy,
    updateDeputySettings,

    // State
    isLoading,
    hasPendingRequests,
    hasDeputies,
    totalDeputies: myDeputies?.length || 0,
    totalPending: pendingRequests?.length || 0,
  };
};
