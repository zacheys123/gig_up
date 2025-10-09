import { UserProps } from "@/types/userinterfaces";

export const searchFunc = (users: UserProps[], searchQuery: string) => {
  if (!users) return [];

  // Calculate reliability and add additional metrics for sorting
  const usersWithMetrics = users.map((user) => {
    const completed = user.completedGigsCount || 0;
    const canceled = user.cancelgigCount || 0;
    const total = completed + canceled;

    return {
      ...user,
      reliabilityScore: calculateReliability(completed, canceled),
      completedGigs: completed,
      canceledGigs: canceled,
      totalGigs: total,
    };
  });

  let filteredData = usersWithMetrics;

  if (searchQuery) {
    const query = searchQuery.toLowerCase();

    filteredData = filteredData.filter((user: UserProps) => {
      return (
        user?.firstname?.toLowerCase().includes(query) ||
        user?.lastname?.toLowerCase().includes(query) ||
        user?.email?.toLowerCase().includes(query) ||
        user?.instrument?.toLowerCase().includes(query) ||
        user?.username?.toLowerCase().includes(query)
      );
    });
  }

  // Enhanced sorting logic
  return filteredData.sort((a, b) => {
    // First priority: Higher reliability score
    if (b.reliabilityScore !== a.reliabilityScore) {
      return b.reliabilityScore - a.reliabilityScore;
    }

    // Second priority: More completed gigs (among equally reliable users)
    if (b.completedGigs !== a.completedGigs) {
      return b.completedGigs - a.completedGigs;
    }

    // Third priority: Fewer canceled gigs (among equally reliable with same completed)
    if (a.canceledGigs !== b.canceledGigs) {
      return a.canceledGigs - b.canceledGigs;
    }

    // Final tiebreaker: More total gigs (more experienced)
    return b.totalGigs - a.totalGigs;
  });
};

export const calculateReliability = (
  completed: number,
  canceled: number
): number => {
  const total = completed + canceled;
  return total > 0 ? Math.round((completed / total) * 100) : 100;
};

export const getReliabilityBadge = (score: number) => {
  if (score >= 90) return { text: "Elite", color: "bg-purple-600" };
  if (score >= 80) return { text: "Pro", color: "bg-blue-600" };
  if (score >= 70) return { text: "Reliable", color: "bg-green-600" };
  if (score >= 50) return { text: "Emerging", color: "bg-yellow-600" };
  return { text: "New", color: "bg-gray-600" };
};

// utils/reliability.ts
export const getUserTier = (user: UserProps) => {
  const completed = user.completedGigsCount || 0;
  const canceled = user.cancelgigCount || 0;
  const reliability = calculateReliability(completed, canceled);

  // Tier thresholds
  if (canceled > 10 && reliability < 30) return "BANNED";
  if (reliability >= 90 && completed > 50) return "ELITE";
  if (reliability >= 80) return "PRO";
  if (reliability >= 60) return "STANDARD";
  if (reliability < 40) return "WARNING";
  return "NEW";
};
