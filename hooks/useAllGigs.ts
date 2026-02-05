// hooks/useGigs.ts - Fixed version
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { useCurrentUser } from "./useCurrentUser";

// Define types
interface UseGigsOptions {
  userId?: Id<"users">;
  gigId?: Id<"gigs">;
  limit?: number;
  skip?: boolean;
  filters?: {
    status?: string[];
    category?: string[];
    dateRange?: { start: Date; end: Date };
  };
}

// Update the interface to accept both types
interface UseGigsReturn {
  // Data
  gigs: any[];
  exploreGigs: any[];
  userApplications: any[]; // Always returns array
  selectedGig?: any;

  // Loading states
  isLoading: {
    gigs: boolean;
    explore: boolean;
    applications: boolean;
  };
  isLoadingAny: boolean;

  // Mutation states
  isDeleting: boolean;

  // Actions
  deleteGig: (gigId: Id<"gigs">) => Promise<boolean>;
  refreshGigs: () => void;
  getGigById: (id: Id<"gigs">) => any | undefined;
  filterGigs: (filters: Record<string, any>) => any[];
}

export const useGigs = (options?: UseGigsOptions): UseGigsReturn => {
  const { userId, gigId, limit, skip = false, filters } = options || {};
  const { user } = useCurrentUser();

  // Memoize query args
  const userGigsArgs = useMemo(
    () => (!skip && userId ? { userId, limit, filters } : "skip"),
    [skip, userId, limit, filters],
  );

  const exploreGigsArgs = useMemo(
    () => (!skip ? { limit, filters } : "skip"),
    [skip, limit, filters],
  );

  const userApplicationsArgs = useMemo(
    () => (!skip && userId ? { userId } : "skip"),
    [skip, userId],
  );

  const gigDetailsArgs = useMemo(
    () => (!skip && gigId ? { gigId } : "skip"),
    [skip, gigId],
  );

  // Queries
  const userGigs = useQuery(api.controllers.gigs.getUserGigs, userGigsArgs);
  const exploreGigs = useQuery(
    api.controllers.gigs.exploreGigs,
    exploreGigsArgs,
  );

  // Query that returns array format
  const categorizedData = useQuery(
    api.controllers.gigs.getUserApplications,
    userApplicationsArgs,
  );

  const gigDetails = useQuery(api.controllers.gigs.getGigById, gigDetailsArgs);

  // Convert categorized data to array format for useGigs hook
  const userApplicationsArray = useMemo(() => {
    if (!categorizedData) return [];

    // If it's already an array, return it
    if (Array.isArray(categorizedData)) {
      return categorizedData;
    }

    // If it's categorized object, return the 'all' array
    if (categorizedData.all && Array.isArray(categorizedData.all)) {
      return categorizedData.all;
    }

    return [];
  }, [categorizedData]);

  // Mutations
  const deleteGigMutation = useMutation(api.controllers.gigs.deleteGig);

  // State
  const [mutationState, setMutationState] = useState({
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
  });

  const [localFilters, setLocalFilters] = useState<Record<string, any>>({});

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
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to delete gig. It may have already been removed.",
        );
        return false;
      } finally {
        setMutationState((prev) => ({ ...prev, isDeleting: false }));
      }
    },
    [deleteGigMutation],
  );

  // Get gig by ID
  const getGigById = useCallback(
    (id: Id<"gigs">) => {
      if (id === gigId && gigDetails) return gigDetails;

      return [...(userGigs || []), ...(exploreGigs || [])].find(
        (gig) => gig._id === id,
      );
    },
    [gigId, gigDetails, userGigs, exploreGigs],
  );

  // Filter gigs locally
  const filterGigs = useCallback(
    (filters: Record<string, any>) => {
      setLocalFilters(filters);

      const allGigs = [...(userGigs || []), ...(exploreGigs || [])];

      return allGigs.filter((gig) => {
        if (filters.category && gig.bussinesscat !== filters.category) {
          return false;
        }

        if (filters.dateRange) {
          const gigDate = new Date(gig.date);
          if (
            gigDate < filters.dateRange.start ||
            gigDate > filters.dateRange.end
          ) {
            return false;
          }
        }

        if (filters.minPrice && gig?.price && gig?.price < filters.minPrice) {
          return false;
        }

        if (filters.maxPrice && gig?.price && gig?.price > filters.maxPrice) {
          return false;
        }

        if (
          filters.location &&
          !gig.location?.toLowerCase().includes(filters.location.toLowerCase())
        ) {
          return false;
        }

        return true;
      });
    },
    [userGigs, exploreGigs],
  );

  // Refresh function
  const refreshGigs = useCallback(() => {
    toast.info("Refreshing gigs...");
  }, []);

  // Memoize the returned object
  const result = useMemo(
    () => ({
      // Data - use the converted array
      gigs: userGigs || [],
      exploreGigs: exploreGigs || [],
      userApplications: userApplicationsArray, // Use the converted array
      selectedGig: gigDetails,

      // Loading states
      isLoading: {
        gigs: userGigs === undefined,
        explore: exploreGigs === undefined,
        applications: categorizedData === undefined, // Check the original query
      },

      isLoadingAny:
        userGigs === undefined ||
        exploreGigs === undefined ||
        categorizedData === undefined,

      // Mutation states
      ...mutationState,

      // Actions
      deleteGig,
      refreshGigs,
      getGigById,
      filterGigs,
    }),
    [
      userGigs,
      exploreGigs,
      userApplicationsArray, // Add the converted array to dependencies
      gigDetails,
      categorizedData, // Add categorizedData for loading state
      mutationState,
      deleteGig,
      refreshGigs,
      getGigById,
      filterGigs,
    ],
  );

  return result;
};

// Specialized hooks
export const useUserGigs = (userId?: Id<"users">) => {
  return useGigs({ userId, skip: !userId });
};

export const useExploreGigs = (limit?: number) => {
  return useGigs({ limit });
};

export const useGigDetails = (gigId?: Id<"gigs">) => {
  const { selectedGig, isLoading, ...rest } = useGigs({ gigId, skip: !gigId });
  return {
    gig: selectedGig,
    isLoading: isLoading.gigs,
    ...rest,
  };
};

// Separate hook for PendingGigsManager (returns categorized data)
export const useUserApplicationsCategorized = (userId?: Id<"users">) => {
  const userApplicationsArgs = useMemo(
    () => (userId ? { userId } : "skip"),
    [userId],
  );

  const categorizedApplications = useQuery(
    api.controllers.gigs.getUserApplications,
    userApplicationsArgs,
  );

  // Always return categorized structure
  const defaultResult = {
    all: [],
    interested: [],
    applied: [],
    shortlisted: [],
    history: [],
  };

  // If data is an array, convert it to categorized structure
  const processedData = useMemo(() => {
    if (!categorizedApplications) return defaultResult;

    if (Array.isArray(categorizedApplications)) {
      // Convert array to categorized structure
      return {
        all: categorizedApplications,
        interested: categorizedApplications.filter(
          (g) => g.userStatus === "interested",
        ),
        applied: categorizedApplications.filter(
          (g) => g.userStatus === "applied",
        ),
        shortlisted: categorizedApplications.filter(
          (g) => g.userStatus === "shortlisted",
        ),
        history: categorizedApplications.filter((g) => g.isHistorical),
      };
    }

    // Already categorized
    return categorizedApplications;
  }, [categorizedApplications]);

  return {
    categorizedApplications: processedData,
    isLoading: categorizedApplications === undefined,
  };
};

// Alias for backward compatibility
export const useUserApplications = useUserApplicationsCategorized;
