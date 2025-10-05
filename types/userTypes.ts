// types/user.types.ts

// Base User Interface
export interface User {
  _id: string;
  _creationTime: number;
  
  // Required fields from createOrUpdateUser
  clerkId: string;
  email: string;
  username: string;
  picture?: string;
  firstname?: string;
  lastname?: string;
  
  // Profile fields from updateUserProfile
  city?: string;
  address?: string;
  phone?: string;
  instrument?: string;
  experience?: string;
  bio?: string;
  roleType?: string;
  
  // Boolean flags
  isMusician: boolean;
  isClient: boolean;
  isAdmin: boolean;
  isBanned: boolean;
  
  // Arrays
  followers: string[]; // User IDs
  followings: string[]; // User IDs
  refferences: string[];
  allreviews: Review[];
  myreviews: Review[];
  videosProfile: string[];
  musicianhandles: string[];
  musiciangenres: string[];
  savedGigs: string[]; // Gig IDs
  favoriteGigs: string[]; // Gig IDs
  likedVideos: string[];
  bookingHistory: string[]; // Gig IDs
  adminPermissions: string[];
  
  // Tier and subscription
  tier: "free" | "pro" |"elite";
  tierStatus?: "active" | "pending" | "canceled" | "expired";
  nextBillingDate?: number;
  
  // Financial stats
  earnings: number;
  totalSpent: number;
  
  // Monthly stats
  monthlyGigsPosted: number;
  monthlyMessages: number;
  monthlyGigsBooked: number;
  
  // Counters
  completedGigsCount: number;
  reportsCount: number;
  cancelgigCount: number;
  renewalAttempts: number;
  
  // Weekly booking stats
  gigsBookedThisWeek: {
    count: number;
    weekStart: number;
  };
  
  // Rate structure
  rate?: {
    regular?: string;
    function?: string;
    concert?: string;
    corporate?: string;
  };
  
  // UI/UX preferences
  theme: "system" | "light" | "dark";
  firstLogin: boolean;
  onboardingComplete: boolean;
  firstTimeInProfile: boolean;
  
  // Timestamps
  lastActive: number;
  createdAt: number;
  updatedAt: number;
}

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

// Tier Update Types
export interface UpdateTierInput {
  tier: "free" | "pro" | "elite";
  tierStatus: "active" | "pending" | "canceled" | "expired";
  nextBillingDate?: number;
}

// Follow/Review Types
export interface FollowUserInput {
  targetUserId: string;
}

export interface AddReviewInput {
  targetUserId: string;
  rating: number;
  comment?: string;
  gigId?: string;
}

// User Stats Interface (for dashboards)
export interface UserStats {
  totalEarnings: number;
  totalSpent: number;
  completedGigs: number;
  monthlyBookings: number;
  followerCount: number;
  followingCount: number;
  reviewCount: number;
  averageRating: number;
}

// Partial User for updates
export type PartialUser = Partial<Omit<User, '_id' | '_creationTime'>>;

// User with stats (for profile pages)
export interface UserWithStats extends User {
  stats: UserStats;
}

// Musician-specific interface
export interface MusicianUser extends User {
  isMusician: true;
  instrument: string;
  musiciangenres: string[];
  rate: {
    regular?: string;
    function?: string;
    concert?: string;
    corporate?: string;
  };
  experience: string;
  bio: string;
}

// Client-specific interface
export interface ClientUser extends User {
  isClient: true;
  bio:string
  // Add client-specific fields here if needed
}

// Type guards
export const isMusicianUser = (user: User): user is MusicianUser => {
  return user.isMusician === true;
};

export const isClientUser = (user: User): user is ClientUser => {
  return user.isClient === true;
};

// Utility types for form handling
export type UserFormData = Partial<CreateUserInput & UpdateUserProfileInput>;