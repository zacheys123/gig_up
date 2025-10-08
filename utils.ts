import { Id } from "@/convex/_generated/dataModel";

export const toUserId = (id: string): Id<"users"> => {
  return id as Id<"users">;
};

export const toGigId = (id: string): Id<"gigs"> => {
  return id as Id<"gigs">;
};
