import { UserProps } from "./userTypes";

// types/gig.ts
export interface Gig {
  _id: string;
  _creationTime: number;

  // Basic gig info
  postedBy: string; // This is the user ID (v.id("users"))
  bookedBy?: string; // This is the user ID (v.id("users"))
  title: string;
  secret: string;
  description?: string;
  phone?: string;
  price?: string;
  category?: string;

  // Categories and bands
  bandCategory: string[];
  bussinesscat: string;

  // Location and timing
  location?: string;
  date: number;
  time: {
    from: string;
    to: string;
  };

  // Status flags
  isTaken: boolean;
  isPending: boolean;

  // Engagement metrics
  viewCount: string[]; // Array of user IDs
  bookCount: string[]; // Array of user IDs

  // Styling
  font?: string;
  fontColor?: string;
  backgroundColor?: string;
  logo: string;

  // Timeline
  gigtimeline?: string;
  otherTimeline?: string;
  day?: string;

  // Musician-specific fields
  mcType?: string;
  mcLanguages?: string;
  djGenre?: string;
  djEquipment?: string;
  pricerange?: string;
  currency?: string;
  vocalistGenre: string[];
  scheduleDate?: number;

  // Booking history
  bookingHistory: Array<{
    userId: string;
    status: "pending" | "booked" | "completed" | "cancelled";
    date: number;
    role: string;
    notes?: string;
  }>;

  // Payment info
  paymentStatus: "pending" | "paid" | "refunded";
  cancellationReason?: string;

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

  // Rating
  gigRating: number;
}

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

export interface GigInputs {
  title: string;
  description: string;
  phoneNo: string;
  price: string;
  category: string;
  location: string;
  secret: string;
  end: string;
  start: string;
  durationto: string;
  durationfrom: string;
  bussinesscat: BusinessCategory;
  otherTimeline: string;
  gigtimeline: string;
  day: string;
  date: string;
  mcType?: string;
  mcLanguages?: string;
  djGenre?: string;
  djEquipment?: string;
  vocalistGenre?: string[];
  pricerange: string;
  currency: string;
}

export interface TalentModalProps {
  isOpen: boolean;
  onClose: () => void;
  talentType: Exclude<TalentType, null>;
  onSubmit: (data: Partial<GigInputs>) => void;
  initialData?: Partial<GigInputs>;
  errors: Record<string, string>;
  validateField: <K extends GigField>(field: K, value: FieldValue<K>) => string;
}

export type GigField =
  | "title"
  | "description"
  | "phoneNo"
  | "price"
  | "location"
  | "mcType"
  | "mcLanguages"
  | "djGenre"
  | "djEquipment"
  | "vocalistGenre";

export type FieldValue<T extends GigField> = T extends "vocalistGenre"
  ? string[]
  : T extends "mcLanguages"
    ? string
    : string;

export interface CustomProps {
  fontColor: string;
  font: string;
  backgroundColor: string;
}

export interface UserInfo {
  prefferences: string[];
}

export interface CategoryVisibility {
  title: boolean;
  description: boolean;
  business: boolean;
  gtimeline: boolean;
  othergig: boolean;
  gduration: boolean;
}
