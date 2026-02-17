// types/bookings.ts
import { Id } from "@/convex/_generated/dataModel";

export interface Applicant {
  userId: Id<"users">;
  appliedAt: number;
  status:
    | "pending"
    | "shortlisted"
    | "rejected"
    | "viewed"
    | "booked"
    | "updated"
    | "cancelled"; // ADD THIS
  notes?: string;
  gigId: Id<"gigs">;
  bandRole?: string;
  bandRoleIndex?: number;
}

// Update the BookingHistoryEntry interface
export interface BookingHistoryEntry {
  entryId: string;
  timestamp: number;
  userId: Id<"users">;
  userRole?: string;
  bandRole?: string;
  bandRoleIndex?: number;

  // ADD "cancelled" to the status list
  status:
    | "applied"
    | "shortlisted"
    | "interviewed"
    | "offered"
    | "booked"
    | "confirmed"
    | "completed"
    | "cancelled" // Already here - good!
    | "rejected"
    | "updated"
    | "viewed";

  gigType: "regular" | "band";
  proposedPrice?: number;
  agreedPrice?: number;
  currency?: string;
  actionBy: Id<"users">;
  actionFor?: Id<"users">;
  notes?: string;
  metadata?: any;
  attachments?: string[];
  reason?: string;
  refundAmount?: number;
  refundStatus?: string;
}

export interface ShortlistedUser {
  userId: Id<"users">;
  shortlistedAt: number;
  notes?: string;
  status?: "active" | "booked" | "removed" | "cancelled"; // ADD THIS if needed
  bandRole?: string;
  bandRoleIndex?: number;
  bookedAt?: number;
}

// Add these types based on your schema
export interface BandRoleSchema {
  role: string;
  maxSlots: number;
  filledSlots: number;
  // ADD THESE:
  maxApplicants: number;
  currentApplicants: number;
  requiredSkills?: string[];
  description?: string;
  price?: number;
  currency?: string;
  negotiable?: boolean;
  isLocked?: boolean;
  applicants?: Id<"users">[];
  bookedUsers?: Id<"users">[];
}

// types/bookings.ts
export interface BandMember {
  bandId: Id<"bands">;
  appliedAt: number;
  status:
    | "applied"
    | "shortlisted"
    | "interviewed"
    | "offered"
    | "booked"
    | "confirmed"
    | "completed"
    | "cancelled" // Already here - good!
    | "rejected"
    | "updated"
    | "viewed";
  appliedBy: Id<"users">;
  proposedFee?: number;
  notes?: string;
  // Add these fields that are actually in your data
  bookedAt?: number;
  contractSigned?: boolean;
  agreedFee?: number;
  shortlistedAt?: number;
  shortlistNotes?: string;
  performingMembers?: {
    userId: Id<"users">;
    name: string;
    role: string;
    instrument: string;
  }[];
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
    bandCategory?: BandRoleSchema[];
    interestedUsers?: Id<"users">[];
    shortlistedUsers?: ShortlistedUser[];
    maxSlots?: number;
    isTaken?: boolean;
    isPending?: boolean;
    bookingHistory?: BookingHistoryEntry[]; // Now matches
    bussinesscat?: string;
    bookCount?: BandMember[];
    tags?: string[];
    requirements?: string[];
    benefits?: string[];
    phone?: string;
    category?: string;
    secret?: string;
    logo?: string;
    createdAt?: number;
    updatedAt?: number;
    time?: {
      start: string;
      end: string;
      durationFrom?: string;
      durationTo?: string;
    };
  };
  applicants: Applicant[];
  shortlisted: ShortlistedUser[];
  userDetails: Map<Id<"users">, any>;
}

export type GigTabType = "regular" | "band-roles" | "full-band" | "shortlist";
