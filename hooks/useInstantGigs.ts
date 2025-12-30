// hooks/useInstantGigs.ts - OPTIMIZED
import { useMutation, useQuery } from "convex/react";
import { useCallback, useMemo } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Default stats to prevent undefined errors
const DEFAULT_STATS = {
  total: 0,
  pending: 0,
  accepted: 0,
  declined: 0,
  deputySuggested: 0,
};

export const useInstantGigs = (userId: Id<"users">) => {
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

  // Mutations (only gig operations, no template operations)
  const createGig = useMutation(api.controllers.instantGigs.createInstantGig);
  const updateGigStatus = useMutation(
    api.controllers.instantGigs.updateInstantGigStatus
  );

  // Memoize data to prevent unnecessary re-renders
  const memoizedGigs = useMemo(() => gigs || [], [gigs]);
  const memoizedStats = useMemo(() => stats || DEFAULT_STATS, [stats]);

  // Memoize mutation wrappers
  const createGigWrapper = useCallback(
    async (gigData: any) => {
      console.log("Creating gig with data:", gigData);
      return await createGig(gigData);
    },
    [createGig]
  );

  const updateGigStatusWrapper = useCallback(
    async (
      gigId: Id<"instantgigs">,
      status: string,
      musicianId: Id<"users">,
      actionBy: "musician" | "client" | "system",
      notes?: string,
      deputySuggestedId?: Id<"users">,
      deputysuggestedName?: string
    ) => {
      return await updateGigStatus({
        gigId,
        status: status as any,
        musicianId,
        actionBy,
        notes,
        deputySuggestedId,
        deputysuggestedName,
      });
    },
    [updateGigStatus]
  );

  return {
    // Data
    gigs: memoizedGigs,
    stats: memoizedStats,

    // Mutations
    createGig: createGigWrapper,
    updateGigStatus: updateGigStatusWrapper,
  };
};
