// types/gig.ts
import { Id } from "@/convex/_generated/dataModel";

// ====== Core Types ======

// Time object
export interface GigTime {
  start: string;
  end: string;
  durationFrom?: string;
  durationTo?: string;
}

// Payment confirmation objects
export interface PaymentConfirmation {
  gigId: Id<"gigs">;
  confirmPayment: boolean;
  confirmedAt: number;
  paymentCode: string;
  fullTransactionId?: string;
  amountConfirmed: number;
  paymentMethod: "mpesa" | "cash" | "bank" | "other";
  temporaryConfirm?: boolean;
  finalizedAt?: number;
  verified?: boolean;
  notes?: string;
}

// Shortlisted user object
export interface ShortlistedUser {
  userId: Id<"users">;
  shortlistedAt: number;
  notes?: string;
  status?: "active" | "booked" | "removed";
  bandRole?: string;
  bandRoleIndex?: number;
  bookedAt?: number;
}

// Crew chat settings
export interface CrewChatSettings {
  clientRole: "admin" | "member";
  chatPermissions: {
    canSendMessages: boolean;
    canAddMembers: boolean;
    canRemoveMembers: boolean;
    canEditChatInfo: boolean;
  };
  createdBy: Id<"users">;
  createdAt: number;
}

// ====== Band Role Types ======

// Band Role Schema (for bandCategory)
export interface BandRoleSchema {
  role: string;
  maxSlots: number;
  filledSlots: number;
  applicants: Id<"users">[];
  bookedUsers: Id<"users">[];
  requiredSkills?: string[];
  description?: string;
  isLocked?: boolean;
  price?: number;
  currency?: string;
  negotiable?: boolean;
  bookedPrice?: number;
}

// Band Member (for performingMembers)
export interface PerformingMember {
  userId: Id<"users">;
  name: string;
  role: string;
  instrument: string;
}

// Band Application Entry (for bookCount)
export interface BandApplicationEntry {
  bandId: Id<"bands">;
  appliedAt: number;
  appliedBy: Id<"users">;
  status:
    | "applied"
    | "shortlisted"
    | "interviewed"
    | "offered"
    | "booked"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "rejected"
    | "updated"
    | "viewed";
  performingMembers: PerformingMember[];
  proposedFee?: number;
  notes?: string;
  bookedAt?: number;
  agreedFee?: number;
  contractSigned?: boolean;
  shortlistedAt?: number;
  shortlistNotes?: string;
}

// ====== Booking History Types ======

// Band Booking Entry (for bandBookingHistory)
export interface BandBookingEntry {
  bandRole: string;
  bandRoleIndex: number;
  userId: Id<"users">;
  userName: string;
  appliedAt: number;
  applicationNotes?: string;
  applicationStatus:
    | "pending_review"
    | "under_review"
    | "interview_scheduled"
    | "interview_completed";
  bookedAt?: number;
  bookedPrice?: number;
  contractSigned?: boolean;
  completedAt?: number;
  completionNotes?: string;
  ratingGiven?: number;
  reviewLeft?: string;
  paymentStatus?: "pending" | "partial" | "paid" | "disputed" | "cancelled";
  paymentAmount?: number;
  paymentDate?: number;
}

// Booking History Entry (for bookingHistory)
export interface BookingHistoryEntry {
  entryId: string;
  timestamp: number;
  userId: Id<"users">;
  userRole?: string;
  bandRole?: string;
  bandRoleIndex?: number;
  isBandRole?: boolean;
  status:
    | "applied"
    | "shortlisted"
    | "interviewed"
    | "offered"
    | "booked"
    | "confirmed"
    | "completed"
    | "cancelled"
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
  metadata?: Record<string, any>;
  attachments?: string[];
  reason?: string;
  refundAmount?: number;
  refundStatus?: string;
}

// ====== Main Gig Interface ======

export interface GigProps {
  // === BASIC GIG INFO ===
  _id: Id<"gigs">;
  _creationTime: number;
  postedBy: Id<"users">;
  bookedBy?: Id<"users">;
  title: string;
  secret: string;
  description?: string;
  phone?: string;
  price?: number;
  category?: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  isPublic: boolean;
  tags: string[];
  requirements: string[];
  benefits: string[];

  // === BAND-RELATED FIELDS ===
  bandCategory?: BandRoleSchema[];
  isClientBand?: boolean;
  bussinesscat: string;

  // === LOCATION AND TIMING ===
  location?: string;
  date: number;
  time: GigTime;

  // === BAND BOOKINGS ===
  bookedBandId?: Id<"bands">;
  bookedBandLeader?: Id<"users">;

  // === STATUS FLAGS ===
  isTaken: boolean;
  isPending: boolean;

  // === BOOKING HISTORIES ===
  bookingHistory?: BookingHistoryEntry[];
  bandBookingHistory?: BandBookingEntry[];

  // === USER ENGAGEMENT ===
  bookCount?: BandApplicationEntry[];
  interestedUsers?: Id<"users">[];
  appliedUsers?: Id<"users">[];
  viewCount?: Id<"users">[];

  // === BAND CHAT SYSTEM ===
  bandChatId?: Id<"chats">;
  crewChatSettings?: CrewChatSettings;

  // === GIG CAPACITY ===
  maxSlots?: number;

  // === STYLING ===
  font?: string;
  fontColor?: string;
  backgroundColor?: string;
  logo: string;

  // === TIMELINE ===
  gigtimeline?: string;
  otherTimeline?: string;
  day?: string;

  // === MUSICIAN-SPECIFIC FIELDS ===
  mcType?: string;
  mcLanguages?: string;
  djGenre?: string;
  djEquipment?: string;
  pricerange?: string;
  currency?: string;
  vocalistGenre?: string[];
  scheduleDate?: number;
  schedulingProcedure?: string;

  // === BOOKING TIMELINE ===
  bookedAt?: number;
  cancelledAt?: number;
  cancelledBy?: string;

  // === INTEREST PERIOD ===
  acceptInterestStartTime?: number;
  acceptInterestEndTime?: number;
  cancellationReason?: string;

  // === PAYMENT CONFIRMATION SYSTEM ===
  musicianConfirmPayment?: PaymentConfirmation;
  clientConfirmPayment?: PaymentConfirmation;

  // === PAYMENT STATUS ===
  paymentStatus:
    | "pending"
    | "partial"
    | "paid"
    | "disputed"
    | "refunded"
    | "verified_paid";

  // === FINALIZATION DETAILS ===
  finalizationNote?: string;
  finalizedBy?: "client" | "musician" | "both" | "system" | "admin";
  finalizedAt?: number;

  // === PRICING ===
  negotiable?: boolean;

  // === RATING ===
  gigRating: number;

  // === SHORTLISTED USERS ===
  shortlistedUsers?: ShortlistedUser[];
}

// ====== Supporting Types for Forms ======

// Business categories for gigs
export type BusinessCategory =
  | "full"
  | "personal"
  | "other"
  | "mc"
  | "dj"
  | "vocalist"
  | null;

// Talent type
export type TalentType = "mc" | "dj" | "vocalist" | null;

// Gig form inputs
export interface GigFormInputs {
  title: string;
  description: string;
  phone?: string;
  price: string;
  category: string;
  location: string;
  secret: string;
  end: string;
  start: string;
  durationfrom: string;
  durationto: string;
  bussinesscat: BusinessCategory;
  otherTimeline: string;
  gigtimeline: string;
  day: string;
  date: string;
  pricerange: string;
  currency: string;
  mcType?: string;
  mcLanguages?: string;
  djGenre?: string;
  djEquipment?: string;
  vocalistGenre?: string[];
  tags: string[];
  requirements: string[];
  benefits: string[];
  logo: string;
  isTaken: boolean;
  isPending: boolean;
  isActive: boolean;
  isPublic: boolean;
  negotiable: boolean;
  maxSlots?: number;
}

// Gig creation payload
export interface GigPayload {
  title: string;
  description?: string;
  phone?: string;
  price?: number;
  category?: string;
  location?: string;
  secret: string;
  time?: GigTime;
  bussinesscat: BusinessCategory;
  otherTimeline?: string;
  gigtimeline?: string;
  day?: string;
  date: number;
  pricerange?: string;
  currency?: string;
  mcType?: string;
  mcLanguages?: string;
  djGenre?: string;
  djEquipment?: string;
  vocalistGenre?: string[];
  bandCategory?: BandRoleSchema[];
  font?: string;
  fontColor?: string;
  backgroundColor?: string;
  logo?: string;
  isPublic?: boolean;
  isActive?: boolean;
  schedulingProcedure?: string;
  scheduleDate?: number;
  isClientBand?: boolean;
  maxSlots?: number;
  negotiable?: boolean;
  tags?: string[];
  requirements?: string[];
  benefits?: string[];
  paymentStatus?:
    | "pending"
    | "partial"
    | "paid"
    | "disputed"
    | "refunded"
    | "verified_paid";
  gigRating?: number;
  createdAt?: number;
  updatedAt?: number;
}

// ====== Additional Types ======

// Category visibility for form sections
export interface CategoryVisibility {
  title: boolean;
  description: boolean;
  business: boolean;
  gtimeline: boolean;
  othergig: boolean;
  gduration: boolean;
}

// Custom styling properties for gig card
export interface CustomProps {
  fontColor: string;
  font: string;
  backgroundColor: string;
}

// User information for gig creation
export interface UserInfo {
  prefferences: string[];
}

// Business category option
export interface BusinessCategoryOption {
  value: BusinessCategory;
  label: string;
  icon: React.ComponentType;
  color: "orange" | "blue" | "purple" | "red" | "pink" | "green";
}

// Instrument option
export interface InstrumentOption {
  value: string;
  label: string;
  icon?: React.ComponentType;
}

// Price range option
export interface PriceRangeOption {
  value: string;
  label: string;
}

// Day option
export interface DayOption {
  id: number;
  val: string;
  name: string;
}

// Gig statistics
export interface GigStats {
  totalViews: number;
  totalBookings: number;
  totalInterested: number;
  totalApplied: number;
  bookingRate: string;
}

// Gig filters
export interface GigFilters {
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  dateFrom?: number;
  dateTo?: number;
  isTaken?: boolean;
  isPending?: boolean;
  isActive?: boolean;
  bussinesscat?: BusinessCategory;
  tags?: string[];
  isClientBand?: boolean;
}

// Gig pagination
export interface GigPagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// Gig search results
export interface GigSearchResults {
  gigs: GigProps[];
  pagination: GigPagination;
  filters?: GigFilters;
}

// Gig creation response
export interface GigCreationResponse {
  success: boolean;
  gigId?: string;
  message?: string;
  errors?: Record<string, string>;
}

// Validation errors
export interface GigValidationErrors {
  title?: string;
  description?: string;
  location?: string;
  bussinesscat?: string;
  phone?: string;
  price?: string;
  secret?: string;
  mcType?: string;
  mcLanguages?: string;
  djGenre?: string;
  djEquipment?: string;
  vocalistGenre?: string;
  bandRoles?: string;
  [key: string]: string | undefined;
}

// Band Role Progress
export interface BandRoleProgress {
  role: string;
  filled: number;
  total: number;
  applicants: number;
  isComplete: boolean;
}

// Band Formation Status
export interface BandFormationStatus {
  totalRoles: number;
  totalPositions: number;
  filledPositions: number;
  progressPercentage: number;
  isComplete: boolean;
  missingRoles: string[];
}
// In your types/gig.ts file
export interface BandSetupRole {
  role: string;
  maxSlots: number;
  maxApplicants?: number; // Add this field
  currentApplicants?: number; // Add this field
  requiredSkills: string[];
  description: string;
  price?: string;
  currency: string;
  negotiable: boolean;
  filledSlots?: number;
  isLocked?: boolean;
}

export interface BandRoleInput {
  role: string;
  maxSlots: number;
  maxApplicants?: number; // Add this field
  currentApplicants?: number; // Add this field
  requiredSkills?: string[];
  description?: string;
  price?: number;
  currency?: string;
  negotiable?: boolean;
  filledSlots?: number;
  isLocked?: boolean;
}

// Also add these related types if needed:

// For BandApplication (deprecated but might be used elsewhere)
export interface BandApplication {
  userId: Id<"users">;
  role: string;
  message?: string;
  appliedAt: number;
  status: "pending" | "reviewed" | "accepted" | "rejected";
}

// Band Applicant
export interface BandApplicant {
  userId: Id<"users">;
  name: string;
  picture?: string;
  skills: string[];
  experience?: string;
  trustScore: number;
  appliedAt: number;
  message?: string;
}
