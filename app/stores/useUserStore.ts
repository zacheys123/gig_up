// stores/useUserStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  // Basic user info
  _id: string;
  clerkId: string;
  picture?: string;
  firstname?: string;
  lastname?: string;
  email: string;
  city?: string;
  date?: string;
  month?: string;
  year?: string;
  address?: string;
  phone?: string;
  verification?: string;
  username: string;

  // Role and type
  isMusician: boolean;
  isClient: boolean;
  isAdmin: boolean;
  adminRole?: "super" | "content" | "support" | "analytics";
  adminPermissions?: string[];
  adminNotes?: string;

  // Musician specific fields
  instrument?: string;
  experience?: string;
  roleType?: string;
  djGenre?: string;
  djEquipment?: string;
  mcType?: string;
  mcLanguages?: string;
  vocalistGenre?: string;
  talentbio?: string;

  // Client specific fields
  organization?: string;

  // Profile and social
  bio?: string;
  handles?: string;
  genres?: string;
  musiciangenres?: string[];
  musicianhandles?: Array<{
    platform: string;
    handle: string;
  }>;

  // Videos and media
  videosProfile?: Array<{
    _id: string;
    url: string;
    createdAt?: number;
  }>;

  // Reviews
  allreviews?: Array<{
    _id: string;
    postedBy: string;
    postedTo: string;
    rating?: number;
    comment?: string;
    gigId?: string;
    updatedAt?: number;
    createdAt?: number;
  }>;

  myreviews?: Array<{
    _id: string;
    postedBy: string;
    postedTo: string;
    rating?: number;
    comment?: string;
    gigId?: string;
    videoId?: string[];
    updatedAt?: number;
    createdAt?: number;
  }>;

  // Social connections
  followers?: string[];
  followings?: string[];
  refferences?: string[];

  // Business and billing
  tier: "free" | "pro";
  tierStatus?: "active" | "pending" | "canceled" | "expired";
  earnings: number;
  totalSpent: number;
  nextBillingDate?: number;
  monthlyGigsPosted: number;
  monthlyMessages: number;
  monthlyGigsBooked: number;

  // Gig management
  gigsBookedThisWeek: {
    count: number;
    weekStart: number;
  };
  lastBookingDate?: number;
  cancelgigCount: number;
  completedGigsCount: number;

  // Booking history
  bookingHistory?: Array<{
    userId: string[];
    gigId: string[];
    status: string;
    date: number;
    role: string;
    notes?: string;
  }>;

  // Rates
  rate?: {
    regular?: string;
    function?: string;
    concert?: string;
    corporate?: string;
  };

  // Saved content
  savedGigs?: string[];
  favoriteGigs?: string[];
  likedVideos?: string[];

  // User status and activity
  firstLogin: boolean;
  onboardingComplete: boolean;
  lastActive: number;
  isBanned: boolean;
  banReason: string;
  bannedAt: number;
  banExpiresAt?: number;
  banReference?: string;

  // Reports and moderation
  reportsCount: number;

  // UI and preferences
  theme: "light" | "dark" | "system";

  // First time flags
  firstTimeInProfile?: boolean;

  // Payment info
  mpesaPhoneNumber?: string;
  renewalAttempts: number;
  lastRenewalAttempt?: number;

  // Timestamps
  lastAdminAction?: number;
  _creationTime: number;
}

interface UserStore {
  // State
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  searchQuery: string;
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  updateUser: (updates: Partial<User>) => void;
  setSearchQuery: (data: string) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isLoading: false,
      isAuthenticated: false,
      searchQuery: "",
      // Actions
      setSearchQuery: (data: string) => set(() => ({ searchQuery: data })),

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      isPro: () => {
        const { user } = get();
        return user?.tier === "pro" && user?.tierStatus === "active";
      },

      getUsage: () => {
        const { user } = get();
        return {
          gigsPosted: user?.monthlyGigsPosted || 0,
          messages: user?.monthlyMessages || 0,
        };
      },
    }),
    {
      name: "user-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // Optional: version to handle migrations
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Handle migrations from previous versions if needed
        }
        return persistedState as UserStore;
      },
    }
  )
);

// Convenience hooks
export const useUser = () => useUserStore((state) => state.user);
export const useIsAuthenticated = () =>
  useUserStore((state) => state.isAuthenticated);
export const useIsLoading = () => useUserStore((state) => state.isLoading);
export const useUserActions = () =>
  useUserStore((state) => ({
    setUser: state.setUser,
    updateUser: state.updateUser,

    setLoading: state.setLoading,
  }));

// Selector hooks for specific user data
