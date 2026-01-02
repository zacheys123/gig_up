// types/gig.ts

import { Id } from "@/convex/_generated/dataModel";
export interface BandMember {
  userId: Id<"users">;
  name: string;
  role: string;
  joinedAt: number;
  price?: number;
  bookedBy?: Id<"users">;
  status?: "pending" | "booked" | "confirmed" | "cancelled";
  notes?: string;
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
  | "full" // Full Band
  | "personal" // Individual
  | "other" // Create Band
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
// In your types file (types/gig.ts or similar)
export interface BookingHistoryEntry {
  userId: Id<"users">;
  status: "pending" | "booked" | "completed" | "cancelled";
  timestamp: number; // Change from 'date' to 'timestamp' for consistency
  role: string;
  notes?: string;
  price?: number;
  bookedBy?: Id<"users">;
  action?: string;
  gigType?: "regular" | "band";
  metadata?: Record<string, any>;
}

// Gig interface (main gig object)
export interface GigProps {
  _id: string;
  _creationTime: number;

  // Basic gig info
  postedBy: string; // user ID
  bookedBy?: string; // user ID
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

  // Categories and bands
  bandCategory: string[];

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
  interestedUsers?: Id<"users">[];
  appliedUsers?: Id<"users">[];
  viewCount?: Id<"users">[];
  bookCount?: BandMember[]; // Array of BandMember objects
  bookingHistory?: BookingHistoryEntry[]; // Array of BookingHistoryEntry objects

  // New fields
  isClientBand?: boolean;
  maxSlots?: number;
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
  postedBy: string; // userId
  bookedBy?: string; // userId

  // Location & Contact
  location?: string;
  phone?: string;

  // Categorization
  tags: string[];
  requirements: string[];
  benefits: string[];
  bandCategory: string[];
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
  viewCount: string[]; // userIds
  bookCount: string[]; // userIds

  // Rating
  gigRating: number;

  // Security
  secret?: string;

  // Payment Confirmations
  clientConfirmPayment?: any;
  musicianConfirmPayment?: any;
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
  bandCategory?: string[];
  font?: string;
  fontColor?: string;
  backgroundColor?: string;
  logo?: string;
  isPublic?: boolean;
  isActive?: boolean;
  schedulingProcedure?: string;
  scheduleDate?: number;
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

// Draft gig data
export interface GigDraft {
  id: string;
  data: GigFormInputs &
    TalentFormData & {
      customization?: CustomProps;
      scheduling?: ScheduleData;
      uploadedFiles?: FileData;
    };
  createdAt: number;
  updatedAt: number;
}
