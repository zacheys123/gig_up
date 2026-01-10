// hooks/useGigs.ts
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { CreateGigInput } from "@/types/gig";
import { prepareGigDataForConvex } from "@/utils";
import { Id } from "@/convex/_generated/dataModel";
import { LocalGigInputs } from "@/drafts";

export const useGigs = (userId?: Id<"users">) => {
  // Memoize query args to prevent unnecessary re-runs
  const userGigsArgs = useMemo(() => (userId ? { userId } : "skip"), [userId]);

  const gigStatsArgs = useMemo(() => (userId ? { userId } : "skip"), [userId]);

  const userApplicationsArgs = useMemo(
    () => (userId ? { userId } : "skip"),
    [userId]
  );

  // Queries with stable args
  const userGigs = useQuery(api.controllers.gigs.getUserGigs, userGigsArgs);
  const exploreGigs = useQuery(api.controllers.gigs.exploreGigs, {});
  const gigStats = useQuery(api.controllers.gigs.getGigStats, gigStatsArgs);
  const userApplications = useQuery(
    api.controllers.gigs.getUserApplications,
    userApplicationsArgs
  );

  // Mutations - consider combining if they're related
  const createGigMutation = useMutation(api.controllers.gigs.createGig);
  const updateGigMutation = useMutation(api.controllers.gigs.updateGig);
  const deleteGigMutation = useMutation(api.controllers.gigs.deleteGig);

  // State - group related state
  const [mutationState, setMutationState] = useState({
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
  });

  // Delete gig - improved error messaging
  const deleteGig = useCallback(
    async (gigId: Id<"gigs">): Promise<boolean> => {
      setMutationState((prev) => ({ ...prev, isDeleting: true }));

      try {
        await deleteGigMutation({ gigId });
        toast.success("Gig deleted successfully!");
        return true;
      } catch (error) {
        console.error("Error deleting gig:", error);
        toast.error("Failed to delete gig. It may have already been removed.");
        return false;
      } finally {
        setMutationState((prev) => ({ ...prev, isDeleting: false }));
      }
    },
    [deleteGigMutation]
  );

  // Memoize the returned object to prevent unnecessary re-renders
  const result = useMemo(
    () => ({
      // Data
      gigs: userGigs || [],
      exploreGigs: exploreGigs || [],
      gigStats: gigStats || null,
      userApplications: userApplications || [],

      // Loading states
      isLoading: {
        gigs: userGigs === undefined,
        explore: exploreGigs === undefined,
        stats: gigStats === undefined,
        applications: userApplications === undefined,
      },

      // Overall loading
      isLoadingAny: userGigs === undefined || exploreGigs === undefined,

      // Mutation states
      ...mutationState,

      deleteGig,
    }),
    [
      userGigs,
      exploreGigs,
      gigStats,
      userApplications,
      mutationState,

      deleteGig,
    ]
  );

  return result;
};

// Optional: Create a more specialized hook for gig stats
export const useGigStats = (userId?: Id<"users">) => {
  const gigStatsArgs = useMemo(() => (userId ? { userId } : "skip"), [userId]);

  return useQuery(api.controllers.gigs.getGigStats, gigStatsArgs);
};
