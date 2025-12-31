// hooks/useGigs.ts
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { CreateGigInput, GigInputs } from "@/types/gig";
import { prepareGigDataForConvex } from "@/utils";
import { Id } from "@/convex/_generated/dataModel";

export const useGigs = (userId?: Id<"users">) => {
  // Queries - use conditional "skip" properly
  const userGigs = useQuery(
    api.controllers.gigs.getUserGigs,
    userId ? { userId } : "skip"
  );

  const exploreGigs = useQuery(api.controllers.gigs.exploreGigs, {});

  const gigStats = useQuery(
    api.controllers.gigs.getGigStats,
    userId ? { userId } : "skip"
  );

  const userApplications = useQuery(
    api.controllers.gigs.getUserApplications,
    userId ? { userId } : "skip"
  );

  // Mutations
  const createGigMutation = useMutation(api.controllers.gigs.createGig);
  const updateGigMutation = useMutation(api.controllers.gigs.updateGig);
  const deleteGigMutation = useMutation(api.controllers.gigs.deleteGig);

  // State
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create gig
  const createGig = useCallback(
    async (
      formData: GigInputs,
      customization: {
        fontColor: string;
        font: string;
        backgroundColor: string;
      },
      logo?: string,
      schedulingProcedure?: {
        type: string;
        date: Date;
      }
    ) => {
      if (!userId) {
        toast.error("You must be logged in to create a gig");
        return null;
      }

      setIsCreating(true);
      try {
        const gigData = prepareGigDataForConvex(
          formData,
          userId,
          customization,
          logo,
          schedulingProcedure
        );

        const gigId = await createGigMutation(gigData);

        toast.success("Gig created successfully!");
        return gigId;
      } catch (error) {
        console.error("Error creating gig:", error);
        toast.error("Failed to create gig. Please try again.");
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [createGigMutation, userId]
  );
  // hooks/useGigs.ts
  // hooks/useGigs.ts
  const updateGig = useCallback(
    async (gigId: Id<"gigs">, updates: Partial<CreateGigInput>) => {
      setIsUpdating(true);
      try {
        // Create a properly typed object for the mutation
        const mutationUpdates: Record<string, any> = { ...updates };

        // Handle price conversion separately
        if (mutationUpdates.price !== undefined) {
          mutationUpdates.price = mutationUpdates.price.toString();
        }

        await updateGigMutation({
          gigId,
          updates: mutationUpdates as Partial<CreateGigInput>,
        });

        toast.success("Gig updated successfully!");
        return true;
      } catch (error) {
        console.error("Error updating gig:", error);
        toast.error("Failed to update gig.");
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [updateGigMutation]
  );

  // Delete gig - use Id type
  const deleteGig = useCallback(
    async (gigId: Id<"gigs">) => {
      setIsDeleting(true);
      try {
        await deleteGigMutation({ gigId });
        toast.success("Gig deleted successfully!");
        return true;
      } catch (error) {
        console.error("Error deleting gig:", error);
        toast.error("Failed to delete gig.");
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [deleteGigMutation]
  );

  return {
    // Queries
    gigs: userGigs || [],
    exploreGigs,
    gigStats,
    userApplications,

    // State
    isCreating,
    isUpdating,
    isDeleting,

    // Actions
    createGig,
    updateGig,
    deleteGig,

    // Loading states
    isLoading: userGigs === undefined || exploreGigs === undefined,
  };
};
