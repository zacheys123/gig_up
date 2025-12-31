// hooks/useInstantGigs.ts - OPTIMIZED
import { useMutation, useQuery } from "convex/react";
import { useCallback, useMemo } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const DEFAULT_STATS = {
  total: 0,
  pending: 0,
  accepted: 0,
  declined: 0,
  deputySuggested: 0,
} as const;

export const useInstantGigs = (userId?: Id<"users">) => {
  // Memoize query parameters
  const queryParams = useMemo(
    () => (userId ? { clientId: userId } : "skip"),
    [userId]
  );

  // Queries
  const gigs = useQuery(
    api.controllers.instantGigs.getClientInstantGigs,
    queryParams
  );

  const stats = useQuery(
    api.controllers.instantGigs.getClientInstantGigsStats,
    queryParams
  );

  // Mutations
  const createGigMutation = useMutation(
    api.controllers.instantGigs.createInstantGig
  );
  const updateGigStatusMutation = useMutation(
    api.controllers.instantGigs.updateInstantGigStatus
  );

  // Memoize data
  const memoizedGigs = useMemo(() => gigs || [], [gigs]);
  const memoizedStats = useMemo(() => stats || DEFAULT_STATS, [stats]);

  // Memoize actions
  const createGig = useCallback(
    async (gigData: any) => {
      return await createGigMutation(gigData);
    },
    [createGigMutation]
  );

  const updateGigStatus = useCallback(
    async (
      gigId: Id<"instantgigs">,
      status: string,
      musicianId: Id<"users">,
      actionBy: "musician" | "client" | "system",
      notes?: string,
      deputySuggestedId?: Id<"users">,
      deputysuggestedName?: string
    ) => {
      return await updateGigStatusMutation({
        gigId,
        status: status as any,
        musicianId,
        actionBy,
        notes,
        deputySuggestedId,
        deputysuggestedName,
      });
    },
    [updateGigStatusMutation]
  );

  const result = useMemo(
    () => ({
      gigs: memoizedGigs,
      stats: memoizedStats,
      createGig,
      updateGigStatus,
      isLoading: gigs === undefined || stats === undefined,
      hasGigs: memoizedGigs.length > 0,
      activeGigs: memoizedGigs.filter(
        (g) => g.status === "pending" || g.status === "accepted"
      ),
    }),
    [memoizedGigs, memoizedStats, createGig, updateGigStatus, gigs, stats]
  );

  return result;
};
