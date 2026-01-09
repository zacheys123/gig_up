// types/gig.ts

import { Id } from "@/convex/_generated/dataModel";

export interface BandRoleInput {
  role: string;
  maxSlots: number;
  requiredSkills: string[];
  description?: string;
  // Add price fields
  price?: string; // Price for this specific role
  currency?: string; // Currency for this role
  negotiable?: boolean; // Whether price is negotiable for this role
}

export interface BandRoleSchema {
  role: string;
  maxSlots: number;
  filledSlots: number;
  applicants: Id<"users">[];
  bookedUsers: Id<"users">[];
  requiredSkills?: string[];
  description?: string;
  isLocked?: boolean;
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

export interface BookingHistoryEntry {
  userId: Id<"users">;
  status: "pending" | "booked" | "completed" | "cancelled";
  timestamp: number;
  role: string;
  notes?: string;
  price?: number;
  bookedBy?: Id<"users">;
  action?: string;
  gigType?: "regular" | "band";
  metadata?: Record<string, any>;
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

// Gig interface (main gig object)
export interface GigProps {
  _id: string;
  _creationTime: number;

  // Basic gig info
  postedBy: Id<"users">;
  bookedBy?: Id<"users">;
  title?: string;
  description?: string;
  location?: string;
  bussinesscat?: string;
  phoneNo?: string;
  price?: number;
  currency?: string;

  // Optional fields
  secret?: string;
  logo?: string;

  // Time fields
  start?: string;
  end?: string;
  durationFrom?: string;
  durationTo?: string;
  date: number; // Unix timestamp

  // Timeline fields
  otherTimeline?: string;
  gigtimeline?: string;
  day?: string;

  // Band Category - NEW: Array of band roles
  bandCategory?: BandRoleSchema[];

  // Talent-specific fields
  mcType?: string;
  mcLanguages?: string;
  djGenre?: string;
  djEquipment?: string;
  vocalistGenre: string[];

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
  isClientBand?: boolean; // true for "Create Band" gigs
  maxSlots?: number; // Total slots available for the gig

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

  // Payment confirmation
  musicianConfirmPayment?: {
    gigId: string;
    confirmPayment: boolean;
    confirmedAt?: number;
    code?: string;
    temporaryConfirm?: boolean;
    finalizedAt?: number;
  };

  clientConfirmPayment?: {
    gigId: string;
    confirmPayment: boolean;
    confirmedAt?: number;
    code?: string;
    temporaryConfirm?: boolean;
  };

  // Time
  time: {
    start: string;
    end: string;
  };

  negotiable?: boolean;

  // Scheduling
  schedulingProcedure?: string;
  scheduleDate?: number;
  cancellationReason?: string;

  // Stats
  totalViews?: number;
  totalApplications?: number;
  totalInterested?: number;

  // Timestamps
  createdAt: number;
  updatedAt: number;

  // User arrays
  interestedUsers?: Id<"users">[];
  appliedUsers?: Id<"users">[];
  viewCount?: Id<"users">[];

  // Band arrays
  bookCount?: BandMember[]; // Array of BandMember objects
  bookingHistory?: BookingHistoryEntry[]; // Array of BookingHistoryEntry objects
}

export interface CreateGigInput {
  // Required fields
  title: string;
  description?: string;
  price?: number;
  category?: string;
  isActive: boolean;
  isPublic: boolean;
  date: number; // timestamp
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

  // Band Category - UPDATED
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
  vocalistGenre: string[];

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
  logo: string; // URL or base64

  // Engagement Metrics
  viewCount: Id<"users">[]; // userIds
  bookCount: Id<"users">[]; // userIds

  // Rating
  gigRating: number;

  // Security
  secret?: string;

  // Payment Confirmations
  clientConfirmPayment?: any;
  musicianConfirmPayment?: any;

  // Band-specific fields - NEW
  isClientBand?: boolean;
  maxSlots?: number;
}

// For form input handling
export interface GigFormInputs {
  title: string;
  description: string;
  phoneNo?: string;
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
}

// Gig creation/update payload
export interface GigPayload {
  title: string;
  description: string;
  phone?: string;
  price?: number;
  category?: string;
  location?: string;
  secret: string;
  time?: {
    start: string;
    end: string;
  };
  durationFrom?: string;
  durationTo?: string;
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

  // UPDATED: Band category as BandRoleSchema array
  bandCategory?: BandRoleSchema[];

  font?: string;
  fontColor?: string;
  backgroundColor?: string;
  logo?: string;
  isPublic?: boolean;
  isActive?: boolean;
  schedulingProcedure?: string;
  scheduleDate?: number;

  // NEW: Band-specific fields
  isClientBand?: boolean;
  maxSlots?: number;
  negotiable?: boolean;
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
  phoneNo?: string;
  price?: string;
  secret?: string;
  mcType?: string;
  mcLanguages?: string;
  djGenre?: string;
  djEquipment?: string;
  vocalistGenre?: string;
  bandRoles?: string; // For band gig validation
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
  isClientBand?: boolean; // Filter for band formation gigs
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

// Draft gig data with band roles
export interface GigDraft {
  id: string;
  data: GigFormInputs &
    TalentFormData & {
      customization?: CustomProps;
      scheduling?: ScheduleData;
      uploadedFiles?: FileData;
      bandRoles?: BandRoleInput[]; // NEW: Band roles for "Create Band" gigs
    };
  createdAt: number;
  updatedAt: number;
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
