// types/gig.ts
import { UserProps } from "./userTypes";

// Core Gig Interface matching Convex schema
export interface Gig {
  _id: string;
  _creationTime: number;

  // Required fields for Convex mutation
  postedBy: string; // user ID
  title: string;
  description: string;
  location: string;
  bussinesscat: string;
  phoneNo: string;
  price: number;
  currency: string;

  // Optional fields
  secret?: string;
  logo?: string;

  // Time fields
  start?: string;
  end?: string;
  durationFrom?: string;
  durationTo?: string;
  date: number;

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
  viewCount: string[];
  bookCount: string[];
  interestedUsers: string[];
  appliedUsers: string[];
  tags: string[];
  requirements: string[];
  benefits: string[];

  // Booking history
  bookingHistory: Array<{
    userId: string;
    status: "pending" | "booked" | "completed" | "cancelled";
    date: number;
    role: string;
    notes?: string;
  }>;

  // Payment confirmation
  musicianConfirmPayment?: {
    gigId: string;
    confirmPayment: boolean;
    confirmedAt?: number;
    code?: string;
    temporaryConfirm?: boolean;
  };
  clientConfirmPayment?: {
    gigId: string;
    confirmPayment: boolean;
    confirmedAt?: number;
    code?: string;
    temporaryConfirm?: boolean;
  };

  // Scheduling
  schedulingProcedure?: string;
  scheduleDate?: number;
  cancellationReason?: string;

  // Stats
  totalViews: number;
  totalApplications: number;
  totalInterested: number;

  // Timestamps
  createdAt: number;
  updatedAt: number;
}

// Extended gig with user data
export interface GigWithUsers extends Gig {
  postedByUser: UserProps | null;
  bookedByUser: UserProps | null;
}

// Type definitions for the NormalGigsForm component
export type TalentType = "mc" | "dj" | "vocalist" | null;
export type BusinessCategory =
  | "full"
  | "personal"
  | "other"
  | "mc"
  | "dj"
  | "vocalist"
  | null;

// types/gig.ts
export interface GigInputs {
  // Required fields
  title: string;
  secret: string;
  bussinesscat: BusinessCategory;
  date: string; // Date string for input

  // Time fields
  startTime: string;
  endTime: string;

  // Optional fields
  description?: string;
  phoneNo?: string;
  price?: string;
  category?: string;
  location?: string;

  // Customization
  font?: string;
  fontColor?: string;
  backgroundColor?: string;

  // Timeline
  gigTimeline?: string;
  otherTimeline?: string;
  day?: string;

  // Musician-specific
  mcType?: string;
  mcLanguages?: string;
  djGenre?: string;
  djEquipment?: string;
  priceRange?: string;
  currency?: string;
  vocalistGenre?: string[];
  bandCategory?: string[];

  // Arrays
  tags?: string[];
  requirements?: string[];
  benefits?: string[];
}

// Create gig input for Convex mutation
export interface CreateGigInput {
  // Required
  postedBy: string; // user ID
  title: string;
  description: string;
  location: string;
  bussinesscat: string;
  phoneNo: string;
  price: number;
  currency: string;

  // Optional
  secret?: string;
  logo?: string;
  start?: string;
  end?: string;
  durationFrom?: string;
  durationTo?: string;
  otherTimeline?: string;
  gigtimeline?: string;
  day?: string;
  date?: string;
  pricerange?: string;
  category?: string;

  // Talent
  mcType?: string;
  mcLanguages?: string;
  djGenre?: string;
  djEquipment?: string;
  vocalistGenre?: string[];
  bandCategory?: string[];

  // Customization
  font?: string;
  fontColor?: string;
  backgroundColor?: string;

  // Scheduling
  schedulingProcedure?: string;
  scheduleDate?: number;
}

// Update gig input
export interface UpdateGigInput extends Partial<CreateGigInput> {
  _id: string;
  isTaken?: boolean;
  isPending?: boolean;
  isActive?: boolean;
  isPublic?: boolean;
  paymentStatus?: "pending" | "paid" | "refunded";
  gigRating?: number;
}

// Gig filters for searching
export interface GigFilters {
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bussinesscat?: string;
  talentType?: TalentType;
  isActive?: boolean;
  isPublic?: boolean;
}

// Gig stats
export interface GigStats {
  totalGigs: number;
  activeGigs: number;
  completedGigs: number;
  totalEarnings: number;
  averageRating: number;
  totalViews: number;
  totalApplications: number;
}

// Talent modal props
export interface TalentModalProps {
  isOpen: boolean;
  onClose: () => void;
  talentType: Exclude<TalentType, null>;
  onSubmit: (data: Partial<GigInputs>) => void;
  initialData?: Partial<GigInputs>;
  errors: Record<string, string>;
  validateField: <K extends GigField>(field: K, value: FieldValue<K>) => string;
}

// Customization props
export interface CustomProps {
  fontColor: string;
  font: string;
  backgroundColor: string;
}

// User info for gig creation
export interface UserInfo {
  prefferences: string[];
}

// Category visibility for form sections
export interface CategoryVisibility {
  title: boolean;
  description: boolean;
  business: boolean;
  gtimeline: boolean;
  othergig: boolean;
  gduration: boolean;
}

// Type utilities for form fields
export type GigField = keyof GigInputs;
export type FieldValue<T extends GigField> = T extends keyof GigInputs
  ? GigInputs[T]
  : never;

// Gig status types
export type GigStatus =
  | "pending"
  | "active"
  | "taken"
  | "completed"
  | "cancelled";
export type PaymentStatus = "pending" | "partial" | "paid" | "refunded";

// Notification types for gigs
export interface GigNotification {
  _id: string;
  userId: string;
  type:
    | "gig_created"
    | "gig_updated"
    | "gig_applied"
    | "gig_approved"
    | "gig_completed";
  title: string;
  message: string;
  gigId: string;
  read: boolean;
  createdAt: number;
}

// Booking request
export interface BookingRequest {
  _id: string;
  gigId: string;
  musicianId: string;
  clientId: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  message?: string;
  proposedPrice?: number;
  proposedDate?: number;
  createdAt: number;
  updatedAt: number;
}

// Review interface
export interface GigReview {
  _id: string;
  gigId: string;
  reviewerId: string;
  reviewedId: string;
  rating: number;
  comment?: string;
  type: "client_to_musician" | "musician_to_client";
  createdAt: number;
}

// Payment interface
export interface GigPayment {
  _id: string;
  gigId: string;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "completed" | "failed";
  method: "mpesa" | "card" | "bank_transfer" | "cash";
  transactionId?: string;
  payerId: string;
  payeeId: string;
  createdAt: number;
  completedAt?: number;
}

// Helper type for gig cards
export interface GigCardProps {
  gig: Gig;
  showActions?: boolean;
  onView?: (gigId: string) => void;
  onApply?: (gigId: string) => void;
  onSave?: (gigId: string) => void;
  className?: string;
}

// Type for gig form validation errors
export interface GigFormErrors {
  [key: string]: string;
}

// Type for gig creation response
export interface GigCreationResponse {
  success: boolean;
  gigId?: string;
  error?: string;
  message?: string;
}

// Type for gig search response
export interface GigSearchResponse {
  gigs: GigWithUsers[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Type for user's gig dashboard
export interface UserGigDashboard {
  postedGigs: GigWithUsers[];
  bookedGigs: GigWithUsers[];
  savedGigs: GigWithUsers[];
  applications: Array<{
    gig: GigWithUsers;
    status: string;
    appliedAt: number;
  }>;
  stats: GigStats;
}
