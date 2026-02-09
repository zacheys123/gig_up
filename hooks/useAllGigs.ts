// hooks/useGigs.ts - UPDATED with consistent return types
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

interface CategorizedApplications {
  all: any[];
  interested: any[];
  applied: any[];
  shortlisted: any[];
  history: any[];
}

interface UseGigsReturn {
  // Data
  gigs: any[]; // User's posted gigs
  exploreGigs: any[]; // All gigs for exploring

  // Applications - always categorized object
  userApplications: CategorizedApplications;

  // Optional array version for backward compatibility
  userApplicationsArray?: any[];

  // Loading states
  isLoading: {
    gigs: boolean;
    explore: boolean;
    applications: boolean;
  };

  isLoadingAny: boolean;

  // Mutation states
  isDeleting: boolean;
  isCreating: boolean;
  isUpdating: boolean;

  // Actions
  deleteGig: (gigId: Id<"gigs">) => Promise<boolean>;
}

export const useGigs = (userId?: Id<"users">): UseGigsReturn => {
  const userGigsArgs = useMemo(() => (userId ? { userId } : "skip"), [userId]);
  const userApplicationsArgs = useMemo(
    () => (userId ? { userId } : "skip"),
    [userId],
  );

  // Queries
  const userGigs = useQuery(api.controllers.gigs.getUserGigs, userGigsArgs);
  const exploreGigs = useQuery(api.controllers.gigs.exploreGigs, {});

  // This returns the categorized object from your Convex query
  const categorizedData = useQuery(
    api.controllers.gigs.getUserApplications,
    userApplicationsArgs,
  );

  // Mutations
  const deleteGigMutation = useMutation(api.controllers.gigs.deleteGig);

  // State
  const [mutationState, setMutationState] = useState({
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
  });

  // Delete gig
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
    [deleteGigMutation],
  );

  // Normalize userApplications to always be categorized object
  const normalizedUserApplications = useMemo((): CategorizedApplications => {
    if (!categorizedData) {
      return {
        all: [],
        interested: [],
        applied: [],
        shortlisted: [],
        history: [],
      };
    }

    // If it's already a categorized object (your Convex query returns this)
    if (categorizedData.all && Array.isArray(categorizedData.all)) {
      return categorizedData;
    }

    // Fallback to empty categorized structure
    return {
      all: [],
      interested: [],
      applied: [],
      shortlisted: [],
      history: [],
    };
  }, [categorizedData]);

  // For backward compatibility - provide array version
  const userApplicationsArray = useMemo(
    () => normalizedUserApplications.all,
    [normalizedUserApplications],
  );

  const result = useMemo(
    () => ({
      // Data
      gigs: userGigs || [],
      exploreGigs: exploreGigs || [],

      // Always returns categorized object
      userApplications: normalizedUserApplications,

      // Optional array version for components that need it
      userApplicationsArray,

      // Loading states
      isLoading: {
        gigs: userGigs === undefined,
        explore: exploreGigs === undefined,
        applications: categorizedData === undefined,
      },

      isLoadingAny: userGigs === undefined || exploreGigs === undefined,

      // Mutation states
      ...mutationState,

      deleteGig,
    }),
    [
      userGigs,
      exploreGigs,
      normalizedUserApplications,
      userApplicationsArray,
      categorizedData,
      mutationState,
      deleteGig,
    ],
  );

  return result;
};

export const useUserApplications = (userId?: Id<"users">) => {
  const { userApplications, isLoading } = useGigs(userId);

  return {
    categorizedApplications: userApplications,
    isLoading: isLoading.applications,
    isEmpty: userApplications.all.length === 0,
  };
};

export const useAllGigs = (options?: { limit?: number }) => {
  const { limit = 100 } = options || {};

  const allGigs = useQuery(api.controllers.gigs.getAllActiveGigs, {
    limit,
  });

  return {
    allGigs: allGigs || [],
    isLoading: allGigs === undefined,
  };
};
