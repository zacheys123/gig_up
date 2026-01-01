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

  // Create gig - simplified with async/await pattern
  const createGig = useCallback(
    async (
      formData: LocalGigInputs,
      customization: {
        fontColor: string;
        font: string;
        backgroundColor: string;
      },
      logo?: string | undefined,
      schedulingProcedure?: {
        type: string;
        date: Date;
      }
    ): Promise<Id<"gigs"> | null> => {
      if (!userId) {
        toast.error("You must be logged in to create a gig");
        return null;
      }

      setMutationState((prev) => ({ ...prev, isCreating: true }));

      try {
        const gigData = prepareGigDataForConvex(
          formData,
          userId,
          customization,
          logo,
          schedulingProcedure
        );

        const gigId = await createGigMutation(gigData);

        if (!gigId) {
          throw new Error("Failed to create gig - no ID returned");
        }

        toast.success("Gig created successfully!");
        return gigId;
      } catch (error) {
        console.error("Error creating gig:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to create gig. Please try again."
        );
        return null;
      } finally {
        setMutationState((prev) => ({ ...prev, isCreating: false }));
      }
    },
    [createGigMutation, userId]
  );

  // Update gig - better error handling
  const updateGig = useCallback(
    async (
      gigId: Id<"gigs">,
      updates: Partial<CreateGigInput>
    ): Promise<boolean> => {
      setMutationState((prev) => ({ ...prev, isUpdating: true }));

      try {
        // Prepare updates ensuring proper typing
        const mutationUpdates: Record<string, unknown> = { ...updates };

        // Handle specific field transformations
        if (mutationUpdates.price !== undefined) {
          mutationUpdates.price = String(mutationUpdates.price);
        }

        await updateGigMutation({
          gigId,
          updates: mutationUpdates as Partial<CreateGigInput>,
        });

        toast.success("Gig updated successfully!");
        return true;
      } catch (error) {
        console.error("Error updating gig:", error);
        toast.error("Failed to update gig. Please check your input.");
        return false;
      } finally {
        setMutationState((prev) => ({ ...prev, isUpdating: false }));
      }
    },
    [updateGigMutation]
  );

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

      // Actions
      createGig,
      updateGig,
      deleteGig,
    }),
    [
      userGigs,
      exploreGigs,
      gigStats,
      userApplications,
      mutationState,
      createGig,
      updateGig,
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
