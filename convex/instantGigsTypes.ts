import { Id } from "./_generated/dataModel";

export interface GigTemplateBase {
  title: string;
  description: string;
  date: string;
  venue: string;
  budget: string;
  gigType: string;
  duration: string;
  fromTime?: string;
  setlist?: string;
  icon: string;
}
// types/instantGigs.ts - SIMPLIFIED TYPE
export interface GigTemplate extends GigTemplateBase {
  id: string;
  // REMOVED: status field
  createdAt: number;
  _id?: Id<"instantGigsTemplate">;
  timesUsed?: number; // Optional usage tracking
}

export interface ConvexGigTemplate {
  _id: Id<"instantGigsTemplate">;
  _creationTime: number;
  title: string;
  description: string;
  date?: string;
  venue?: string;
  budget: string;
  gigType: string;
  duration: string;
  fromTime?: string;
  setlist?: string;
  icon: string;
  clientId: Id<"users">;
  clientName: string;
  status: "draft" | "active" | "archived";
  timesUsed: number;
  createdAt: number;
  updatedAt: number;
}
// Helper type for optimistic templates
export type OptimisticGigTemplate = GigTemplate & {
  _id?: never; // Ensure _id is not present in optimistic templates
};
