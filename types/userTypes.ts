// types/user.types.ts

// Base User Interface
// types/userinterfaces.ts
import { Doc, Id } from "@/convex/_generated/dataModel";

// Use the exact Convex document type
export type UserProps = Doc<"users">;

// Or create a more flexible type that matches your getCurrentUser return
export type CurrentUserProps = Doc<"users"> | null | undefined;

// Review Interface
export interface Review {
  _id: string;
  postedBy: string; // User ID of reviewer
  postedTo: string; // User ID of reviewed user
  rating: number;
  comment?: string;
  gigId?: string; // Gig ID if related to a gig
  createdAt: number;
  updatedAt: number;
}

// User Create/Update Types
export interface CreateUserInput {
  clerkId: string;
  email: string;
  username: string;
  picture?: string;
  firstname?: string;
  lastname?: string;
}

export interface UpdateUserProfileInput {
  firstname?: string;
  lastname?: string;
  city?: string;
  address?: string;
  phone?: string;
  instrument?: string;
  experience?: string;
  bio?: string;
  roleType?: string;
  isMusician?: boolean;
  isClient?: boolean;
  musiciangenres?: string[];
  rate?: {
    regular?: string;
    function?: string;
    concert?: string;
    corporate?: string;
  };
}

// Search and Filter Types
export interface UserSearchFilters {
  query: string;
  isMusician?: boolean;
  city?: string;
  instrument?: string;
}

// In your userTypes.ts
export interface VideoProfileProps {
  _id: string;
  title: string;
  url: string;
  createdAt?: number;
  isPublic: boolean; // true = public, false = private (followers only)
  description?: string; // Optional description field
}

// You can create a types file for privacy settings
export type VideoPrivacy = "public" | "private";

export const VIDEO_PRIVACY_OPTIONS = {
  PUBLIC: {
    value: true,
    label: "Public",
    description: "Visible to everyone on the platform",
  },
  PRIVATE: {
    value: false,
    label: "Private",
    description: "Only visible to your mutual followers",
  },
} as const;
