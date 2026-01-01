// stores/useUserStore.ts
import { UserProps } from "@/types/userTypes";

import { Id } from "@/convex/_generated/dataModel";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GigProps } from "@/types/gig";

interface PaymentConfirmation {
  confirmedParty: "none" | "client" | "musician" | "both";
  canFinalize: boolean;
  clientConfirmed?: boolean;
  musicianConfirmed?: boolean;
}

interface UserStore {
  // User State
  user: UserProps | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  searchQuery: string;

  // Gig State
  currentgig: GigProps | null;
  loadingPostId: string;
  lastBookedGigId: string;

  // Modal States
  showConfetti: boolean;
  showConfirmation: boolean;
  showPaymentConfirmation: boolean;

  // Payment Confirmations
  paymentConfirmations: Record<string, PaymentConfirmation>;

  // Actions
  setUser: (user: UserProps | null) => void;
  setLoading: (loading: boolean) => void;
  updateUser: (updates: Partial<UserProps>) => void;
  setSearchQuery: (data: string) => void;

  // Gig Actions
  setCurrentGig: (gig: GigProps | null) => void;
  setLoadingPostId: (id: string) => void;
  setLastBookedGigId: (id: string) => void;

  // Modal Actions
  setShowConfetti: (show: boolean) => void;
  setShowConfirmation: (show: boolean) => void;
  setShowPaymentConfirmation: (show: boolean) => void;

  // Payment Confirmation Actions
  setConfirmedParty: (
    gigId: string,
    party: "none" | "client" | "musician" | "both"
  ) => void;
  setCanFinalize: (gigId: string, canFinalize: boolean) => void;
  clearPaymentConfirmation: (gigId: string) => void;

  // Utility Getters
  isPro: () => boolean;
  getUsage: () => { gigsPosted: number; messages: number };
  getPaymentConfirmation: (gigId: string) => PaymentConfirmation | undefined;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isLoading: false,
      isAuthenticated: false,
      searchQuery: "",

      // Gig initial state
      currentgig: null,
      loadingPostId: "",
      lastBookedGigId: "",

      // Modal initial state
      showConfetti: false,
      showConfirmation: false,
      showPaymentConfirmation: false,

      // Payment confirmations initial state
      paymentConfirmations: {},

      // User Actions
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

      // Gig Actions
      setCurrentGig: (gig) => set({ currentgig: gig }),

      setLoadingPostId: (id) => set({ loadingPostId: id }),

      setLastBookedGigId: (id) => set({ lastBookedGigId: id }),

      // Modal Actions
      setShowConfetti: (show) => set({ showConfetti: show }),

      setShowConfirmation: (show) => set({ showConfirmation: show }),

      setShowPaymentConfirmation: (show) =>
        set({ showPaymentConfirmation: show }),

      // Payment Confirmation Actions
      setConfirmedParty: (gigId, party) =>
        set((state) => ({
          paymentConfirmations: {
            ...state.paymentConfirmations,
            [gigId]: {
              ...state.paymentConfirmations[gigId],
              confirmedParty: party,
            },
          },
        })),

      setCanFinalize: (gigId, canFinalize) =>
        set((state) => ({
          paymentConfirmations: {
            ...state.paymentConfirmations,
            [gigId]: {
              ...state.paymentConfirmations[gigId],
              canFinalize,
            },
          },
        })),

      clearPaymentConfirmation: (gigId) =>
        set((state) => {
          const newConfirmations = { ...state.paymentConfirmations };
          delete newConfirmations[gigId];
          return { paymentConfirmations: newConfirmations };
        }),

      // Utility Getters
      isPro: () => {
        const { user } = get();
        return user?.tier === "pro" || user?.tier === "premium";
      },

      getUsage: () => {
        const { user } = get();
        return {
          gigsPosted: user?.monthlyGigsPosted || 0,
          messages: user?.monthlyMessages || 0,
        };
      },

      getPaymentConfirmation: (gigId: string) => {
        const { paymentConfirmations } = get();
        return paymentConfirmations[gigId];
      },
    }),
    {
      name: "user-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        paymentConfirmations: state.paymentConfirmations,
        lastBookedGigId: state.lastBookedGigId,
      }),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Handle migrations from previous versions
          return {
            ...persistedState,
            paymentConfirmations: {},
            lastBookedGigId: "",
            currentgig: null,
            loadingPostId: "",
            showConfetti: false,
            showConfirmation: false,
            showPaymentConfirmation: false,
          };
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
export const useCurrentGig = () => useUserStore((state) => state.currentgig);
export const useLoadingPostId = () =>
  useUserStore((state) => state.loadingPostId);
export const usePaymentConfirmations = () =>
  useUserStore((state) => state.paymentConfirmations);
export const useShowConfetti = () =>
  useUserStore((state) => state.showConfetti);
export const useShowConfirmation = () =>
  useUserStore((state) => state.showConfirmation);

// Action hooks
export const useUserActions = () =>
  useUserStore((state) => ({
    setUser: state.setUser,
    updateUser: state.updateUser,
    setLoading: state.setLoading,
    setSearchQuery: state.setSearchQuery,
  }));

export const useGigActions = () =>
  useUserStore((state) => ({
    setCurrentGig: state.setCurrentGig,
    setLoadingPostId: state.setLoadingPostId,
    setLastBookedGigId: state.setLastBookedGigId,
  }));

export const useModalActions = () =>
  useUserStore((state) => ({
    setShowConfetti: state.setShowConfetti,
    setShowConfirmation: state.setShowConfirmation,
    setShowPaymentConfirmation: state.setShowPaymentConfirmation,
  }));

export const usePaymentConfirmationActions = () =>
  useUserStore((state) => ({
    setConfirmedParty: state.setConfirmedParty,
    setCanFinalize: state.setCanFinalize,
    clearPaymentConfirmation: state.clearPaymentConfirmation,
    getPaymentConfirmation: state.getPaymentConfirmation,
  }));

// Selector hooks for specific user data
export const useUserTier = () =>
  useUserStore((state) => state.user?.tier || "free");
export const useUserBookings = () =>
  useUserStore((state) => ({
    bookingsThisWeek: state.user?.bookingsThisWeek || 0,
    maxWeeklyBookings: state.user?.maxWeeklyBookings || 3,
  }));
export const useUserSavedGigs = () =>
  useUserStore((state) => state.user?.savedGigs || []);
export const useUserFavoriteGigs = () =>
  useUserStore((state) => state.user?.favoriteGigs || []);
