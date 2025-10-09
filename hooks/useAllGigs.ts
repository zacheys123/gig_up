// hooks/useAllGigs.ts
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useMemo } from "react";

export function useAllGigs() {
  const gigs = useQuery(api.controllers.gigs.getGigsWithUsers);

  const activeGigs = useMemo(
    () => gigs?.filter((gig) => !gig.isTaken) || [],
    [gigs]
  );

  const takenGigs = useMemo(
    () => gigs?.filter((gig) => gig.isTaken) || [],
    [gigs]
  );

  const gigsByCategory = useMemo(
    () =>
      gigs?.reduce(
        (acc, gig) => {
          const category = gig.category || "uncategorized";
          if (!acc[category]) acc[category] = [];
          acc[category].push(gig);
          return acc;
        },
        {} as Record<string, typeof gigs>
      ) || {},
    [gigs]
  );

  return {
    // All gigs with user data
    gigs: gigs || [],

    // Filtered gigs
    activeGigs,
    takenGigs,
    gigsByCategory,

    // Status
    isLoading: gigs === undefined,
    isEmpty: gigs?.length === 0,

    // Counts
    totalCount: gigs?.length || 0,
    activeCount: activeGigs.length,
    takenCount: takenGigs.length,
  };
}
