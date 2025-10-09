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
