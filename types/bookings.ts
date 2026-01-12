import { Id } from "@/convex/_generated/dataModel";
import { BandMember, BandRoleSchema, BookingHistoryEntry } from "./gig";

export interface Applicant {
  userId: Id<"users">;
  appliedAt: number;
  status: "pending" | "shortlisted" | "rejected" | "viewed" | "booked";
  notes?: string;
  gigId: Id<"gigs">;
  bandRole?: string;
  bandRoleIndex?: number; // Add this for band role tracking
}

export interface ShortlistedUser {
  userId: Id<"users">;
  shortlistedAt: number;
  notes?: string;
  status?: string;
  bandRole?: string;
  bandRoleIndex?: number; // Add this for band role tracking
}

export interface GigWithApplicants {
  gig: {
    _id: Id<"gigs">;
    title: string;
    description?: string;
    location?: string;
    date: number;
    price?: number;
    isClientBand?: boolean;
    bandCategory?: BandRoleSchema[]; // Use imported type
    interestedUsers?: Id<"users">[];
    shortlistedUsers?: ShortlistedUser[];
    maxSlots?: number;
    isTaken?: boolean;
    isPending?: boolean;
    bookingHistory?: BookingHistoryEntry[]; // Use imported type
    bussinesscat?: string;
    bookCount?: BandMember[]; // Use imported type
    // Add other gig fields from your schema
    tags?: string[];
    requirements?: string[];
    benefits?: string[];
    phone?: string;
    category?: string;
    secret?: string;
    logo?: string;
    createdAt?: number;
    updatedAt?: number;
  };
  applicants: Applicant[];
  shortlisted: ShortlistedUser[];
  userDetails: Map<Id<"users">, any>;
}

export type GigTabType = "regular" | "band-roles" | "full-band" | "shortlist";
