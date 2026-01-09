// types/gig.ts

import { Id } from "@/convex/_generated/dataModel";

// UPDATE: Add price fields to BandRoleInput
export interface BandRoleInput {
  role: string;
  maxSlots: number;
  requiredSkills: string[];
  description?: string;
  // ADD THESE PRICE FIELDS:
  price?: string; // Price per slot for this role
  currency?: string; // Currency code (e.g., "KES", "USD")
  negotiable?: boolean; // Whether price is negotiable for this role
}

// UPDATE: Add price fields to BandRoleSchema
export interface BandRoleSchema {
  role: string;
  maxSlots: number;
  filledSlots: number;
  applicants: Id<"users">[];
  bookedUsers: Id<"users">[];
  requiredSkills?: string[];
  description?: string;
  isLocked?: boolean;
  // ADD THESE PRICE FIELDS:
  price?: number; // Price per slot (converted from string to number)
  currency?: string; // Currency code
  negotiable?: boolean; // Whether price is negotiable
  bookedPrice?: number; // Actual price agreed upon (when booked)
}

export interface BandMember {
  userId: Id<"users">;
  name: string;
  role: string;
  joinedAt: number;
  price?: number;
  bookedBy?: Id<"users">;
  status?: "pending" | "booked" | "confirmed" | "cancelled";
  notes?: string;
  email?: string;
  phone?: string;
  picture?: string;
  skills?: string;
  experience?: string;
}

// NEW: Add BandBookingEntry type to match Convex schema
export interface BandBookingEntry {
  bandRole: string;
  bandRoleIndex: number;
  userId: Id<"users">;
  userName: string;

  // Application phase
  appliedAt: number;
  applicationNotes?: string;
  applicationStatus:
    | "pending_review"
    | "under_review"
    | "interview_scheduled"
    | "interview_completed";

  // Booking phase
  bookedAt?: number;
  bookedBy?: Id<"users">;
  bookedPrice?: number;
  contractSigned?: boolean;

  // Completion phase
  completedAt?: number;
  completionNotes?: string;
  ratingGiven?: number;
  reviewLeft?: string;

  // Payment
  paymentStatus?: "pending" | "partial" | "paid" | "disputed" | "cancelled";
  paymentAmount?: number;
  paymentDate?: number;
}

// UPDATE: Add new fields to BookingHistoryEntry
export interface BookingHistoryEntry {
  // ADD THESE NEW FIELDS:
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
    | "rejected";

  // UPDATE gigType to match Convex schema
  gigType: "regular" | "band";

  // Financials
  proposedPrice?: number;
  agreedPrice?: number;
  currency?: string;

  // Parties involved
  actionBy: Id<"users">;
  actionFor?: Id<"users">;

  // Metadata
  notes?: string;
  metadata?: Record<string, any>;
  attachments?: string[];

  // For cancellations/rejections
  reason?: string;
  refundAmount?: number;
  refundStatus?: string;
}

// Business categories for gigs
export type BusinessCategory =
  | "full" // Full Band (existing band needs gigs)
  | "personal" // Individual musician needed
  | "other" // Create Band (forming new band)
  | "mc" // MC
  | "dj" // DJ
  | "vocalist" // Vocalist
  | null;

// Talent type (for specialized gigs)
export type TalentType = "mc" | "dj" | "vocalist" | null;

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
  prefferences: string[]; // Band instrument preferences
}

// UPDATE: GigProps interface to match Convex schema
export interface GigProps {
  _id: string;
  _creationTime: number;

  // Basic gig info
  postedBy: Id<"users">;
  bookedBy?: Id<"users">;
  title: string; // CHANGED: Made required (no ?)
  description?: string;
  location?: string;
  bussinesscat: string; // CHANGED: Made required (no ?)
  phone?: string; // CHANGED: Renamed from phoneNo to phone
  price?: number;
  currency?: string;

  // Optional fields
  secret: string; // CHANGED: Made required (no ?)
  logo: string; // CHANGED: Made required (no ?)

  // Time fields
  start?: string; // CHANGED: Not in Convex schema, use time.start
  end?: string; // CHANGED: Not in Convex schema, use time.end
  durationFrom?: string; // Not in Convex schema
  durationTo?: string; // Not in Convex schema
  date: number; // Unix timestamp

  // Timeline fields
  otherTimeline?: string;
  gigtimeline?: string;
  day?: string;

  // Band Category
  bandCategory?: BandRoleSchema[];

  // Talent-specific fields
  mcType?: string;
  mcLanguages?: string;
  djGenre?: string;
  djEquipment?: string;
  vocalistGenre?: string[];

  // Customization
  font?: string;
  fontColor?: string;
  backgroundColor?: string;

  // Status flags
  isTaken: boolean;
  isPending: boolean;
  isActive: boolean;
  isPublic: boolean;

  // Band-specific flags
  isClientBand?: boolean;
  maxSlots?: number;

  // Payment info
  paymentStatus: "pending" | "paid" | "refunded";

  // Rating
  gigRating: number;

  // Price range
  pricerange?: string;
  category?: string;

  // Arrays
  tags: string[];
  requirements: string[];
  benefits: string[];

  // Time object from Convex schema
  time: {
    start: string;
    end: string;
  };

  // UPDATE: Add these fields from Convex schema
  createdAt: number;
  updatedAt: number;

  // User arrays (optional in Convex)
  interestedUsers?: Id<"users">[];
  appliedUsers?: Id<"users">[];
  viewCount?: Id<"users">[];

  // Band arrays
  bookCount?: BandMember[];
  bookingHistory?: BookingHistoryEntry[];

  // ADD: New fields from Convex schema
  bandBookingHistory?: BandBookingEntry[];
  scheduleDate?: number;
  schedulingProcedure?: string;
  cancellationReason?: string;
  acceptInterestStartTime?: number;
  acceptInterestEndTime?: number;
  cancelledAt?: number;
  cancelledBy?: string;
  musicianConfirmPayment?: {
    gigId: Id<"gigs">;
    confirmPayment: boolean;
    confirmedAt?: number;
    code?: string;
    temporaryConfirm?: boolean;
    finalizedAt?: number;
  };
  clientConfirmPayment?: {
    gigId: Id<"gigs">;
    confirmPayment: boolean;
    confirmedAt?: number;
    code?: string;
    temporaryConfirm?: boolean;
    finalizedAt?: number;
  };
  negotiable?: boolean;
  finalizationNote?: string;
  finalizedBy?: "client" | "musician";
}

export interface CreateGigInput {
  // Required fields
  title: string;
  description?: string;
  price?: number;
  category?: string;
  isActive: boolean;
  isPublic: boolean;
  date: number;
  time: {
    start: string;
    end: string;
  };
  isTaken: boolean;
  isPending: boolean;

  // User info
  postedBy: Id<"users">;
  bookedBy?: Id<"users">;

  // Location & Contact
  location?: string;
  phone?: string;

  // Categorization
  tags: string[];
  requirements: string[];
  benefits: string[];

  // Band Category
  bandCategory?: BandRoleSchema[];

  bussinesscat: string;

  // Gig Type Specific
  gigtimeline?: string;
  otherTimeline?: string;
  day?: string;

  // MC Specific
  mcType?: string;
  mcLanguages?: string;

  // DJ Specific
  djGenre?: string;
  djEquipment?: string;

  // Vocalist Specific
  vocalistGenre?: string[];

  // Pricing & Payment
  pricerange?: string;
  currency?: string;
  negotiable?: boolean;
  depositRequired?: boolean;
  paymentStatus?: "pending" | "paid" | "refunded";

  // Scheduling
  scheduleDate?: number;
  schedulingProcedure?: string;

  // Travel
  travelIncluded?: boolean;
  travelFee?: string;

  // Styling
  font?: string;
  fontColor?: string;
  backgroundColor?: string;
  logo: string;

  // Engagement Metrics
  viewCount: Id<"users">[];
  bookCount: Id<"users">[];

  // Rating
  gigRating: number;

  // Security
  secret: string;

  // Band-specific fields
  isClientBand?: boolean;
  maxSlots?: number;

  // UPDATE: Add these Convex fields
  createdAt: number;
  updatedAt: number;
}

// For form input handling
export interface GigFormInputs {
  title: string;
  description: string;
  phoneNo?: string; // CHANGED: from phoneNo to phone
  price: string;
  category: string;
  location: string;
  secret: string;
  end: string;
  start: string;
  durationfrom: string; // Not in Convex schema
  durationto: string; // Not in Convex schema
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
  // ADD: Missing fields from Convex
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

// Gig creation/update payload
export interface GigPayload {
  title: string;
  description?: string;
  phone?: string; // CHANGED: from phoneNo to phone
  price?: number;
  category?: string;
  location?: string;
  secret: string;
  time?: {
    start: string;
    end: string;
  };
  durationFrom?: string; // Not in Convex schema
  durationTo?: string; // Not in Convex schema
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

  // ADD: Missing fields from Convex schema
  tags?: string[];
  requirements?: string[];
  benefits?: string[];
  paymentStatus?: "pending" | "paid" | "refunded";
  gigRating?: number;
  createdAt?: number;
  updatedAt?: number;
}

// Talent form data
export interface TalentFormData {
  mcType?: string;
  mcLanguages?: string;
  djGenre?: string;
  djEquipment?: string;
  vocalistGenre?: string[];
}

// Schedule data
export interface ScheduleData {
  type: string;
  date: Date;
}

// Uploaded file data
export interface FileData {
  fileUrl: string;
  imageUrl: string;
  isUploading: boolean;
}

// Validation errors
export interface GigValidationErrors {
  title?: string;
  description?: string;
  location?: string;
  bussinesscat?: string;
  phone?: string; // CHANGED: from phoneNo to phone
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
  errors?: GigValidationErrors;
}

// UPDATE: Draft gig data with band roles (removed GigDraft interface here since it's defined in utils)
export interface GigDraftData {
  formValues: GigFormInputs;
  bandRoles?: BandRoleInput[];
  customization?: CustomProps;
  imageUrl?: string;
  schedulingProcedure?: ScheduleData;
}

// Band Application Types
export interface BandApplication {
  userId: Id<"users">;
  role: string;
  message?: string;
  appliedAt: number;
  status: "pending" | "reviewed" | "accepted" | "rejected";
}

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
