// hooks/usePlatformStats.ts
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function usePlatformStats() {
  const stats = useQuery(api.controllers.testimonials.getPlatformStats); // Create this function in Convex

  return {
    totalArtists: stats?.totalArtists || 0,
    totalVenues: stats?.totalVenues || 0,
    totalEarnings: stats?.totalEarnings || "$0",
    successRate: stats?.successRate || "0%",
    totalUsers: stats?.totalUsers || 0,
    totalBookings: stats?.totalBookings || 0,
  };
}
