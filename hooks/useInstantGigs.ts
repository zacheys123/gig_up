// hooks/useInstantGigs.ts - SIMPLIFIED
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export const useInstantGigs = (userId: Id<"users">) => {
  // Queries
  const gigs = useQuery(api.controllers.instantGigs.getClientInstantGigs, {
    clientId: userId,
  });

  const stats = useQuery(
    api.controllers.instantGigs.getClientInstantGigsStats,
    {
      clientId: userId,
    }
  );

  // Mutations (only gig operations, no template operations)
  const createGig = useMutation(api.controllers.instantGigs.createInstantGig);
  const updateGigStatus = useMutation(
    api.controllers.instantGigs.updateInstantGigStatus
  );

  return {
    // Data
    gigs: gigs || [],
    stats: stats || {
      total: 0,
      pending: 0,
      accepted: 0,
      declined: 0,
      deputySuggested: 0,
    },

    // Mutations
    createGig: async (gigData: any) => {
      return await createGig(gigData);
    },

    updateGigStatus: async (
      gigId: Id<"instantgigs">,
      status: string,
      musicianId: Id<"users">
    ) => {
      return await updateGigStatus({
        gigId,
        status: status as any,
        musicianId,
      });
    },
  };
};
