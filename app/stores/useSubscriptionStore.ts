// stores/useSubscriptionStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SubscriptionTier {
  id: string;
  name: "free" | "pro";
  price: number;
  currency: string;
  features: string[];
  limits: {
    monthlyGigs: number;
    monthlyMessages: number;
    storageGB: number;
    analytics: boolean;
    prioritySupport: boolean;
  };
}

interface Subscription {
  tier: "free" | "pro";
  status: "active" | "pending" | "canceled" | "expired";
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  nextBillingDate?: number;
}

// stores/useSubscriptionStore.ts - Keep as functions but fix typing
interface SubscriptionStore {
  // State
  subscription: Subscription | null;
  availableTiers: SubscriptionTier[];
  isLoading: boolean;

  // Trial State
  showTrialModal: boolean;
  trialRemainingDays: number | null;

  // Actions
  setSubscription: (subscription: Subscription | null) => void;
  setLoading: (loading: boolean) => void;
  updateSubscription: (updates: Partial<Subscription>) => void;
  clearSubscription: () => void;

  // Trial Actions
  setShowTrialModal: (show: boolean) => void;
  setTrialRemainingDays: (days: number | null) => void;

  // Computed - Keep as functions but properly type them
  isPro: () => boolean;
  isActive: () => boolean;
  daysUntilRenewal: () => number;
  canUpgrade: () => boolean;

  // Get plans based on user role
  getPlansForUser: (
    isMusician?: boolean,
    isClient?: boolean
  ) => Array<{
    name: string;
    price: string;
    features: string[];
    cta: string;
    current: boolean;
  }>;
}

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set, get) => ({
      // Initial state
      subscription: null,
      isLoading: false,
      availableTiers: [
        {
          id: "free",
          name: "free",
          price: 0,
          currency: "KES",
          features: [
            "Basic profile",
            "5 gigs per month",
            "50 messages monthly",
            "1GB storage",
            "Community support",
          ],
          limits: {
            monthlyGigs: 5,
            monthlyMessages: 50,
            storageGB: 1,
            analytics: false,
            prioritySupport: false,
          },
        },
        {
          id: "pro",
          name: "pro",
          price: 19.99,
          currency: "KES",
          features: [
            "Premium profile",
            "Unlimited gigs",
            "Unlimited messages",
            "10GB storage",
            "Advanced analytics",
            "Priority support",
            "Featured listings",
          ],
          limits: {
            monthlyGigs: -1, // -1 means unlimited
            monthlyMessages: -1,
            storageGB: 10,
            analytics: true,
            prioritySupport: true,
          },
        },
      ],

      // Trial State
      showTrialModal: false,
      trialRemainingDays: null,

      // Actions
      setSubscription: (subscription) => set({ subscription }),
      setLoading: (isLoading) => set({ isLoading }),
      updateSubscription: (updates) =>
        set((state) => ({
          subscription: state.subscription
            ? { ...state.subscription, ...updates }
            : null,
        })),
      clearSubscription: () => set({ subscription: null }),
      setShowTrialModal: (showTrialModal) => set({ showTrialModal }),
      setTrialRemainingDays: (trialRemainingDays) =>
        set({ trialRemainingDays }),

      // ✅ FIX: Computed functions - properly typed
      isPro: (): boolean => {
        const { subscription } = get();
        return (
          subscription?.tier === "pro" && subscription?.status === "active"
        );
      },

      isActive: (): boolean => {
        const { subscription } = get();
        return subscription?.status === "active";
      },

      daysUntilRenewal: (): number => {
        const { subscription } = get();
        if (!subscription?.currentPeriodEnd) return 0;

        const now = Date.now();
        const end = subscription.currentPeriodEnd;
        const diffTime = end - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return Math.max(0, diffDays);
      },

      canUpgrade: (): boolean => {
        const { subscription } = get();
        return (
          subscription?.tier !== "pro" || subscription?.status !== "active"
        );
      },

      // ✅ FIX: Update getPlansForUser to call isPro() function
      getPlansForUser: (isMusician = false, isClient = false) => {
        const { isPro } = get(); // Get the function from store

        const musicianFreeFeatures = [
          "Book to 2 gigs/week",
          "Limited Messages to clients (50msgs a month)",
          "Performance analytics",
          "30 days of access",
        ];

        const musicianProFeatures = [
          "Unlimited gig applications",
          "Featured profile in search",
          "Priority in client searches",
          "Advanced analytics dashboard",
          "Direct booking options",
          "Unlimited messaging",
        ];

        const clientFreeFeatures = [
          "Post 2 gigs/week",
          "Browse musician profiles and musician reviews",
          "Limited Messages to musicians (50msgs a month)",
          "30 days of access",
          "No scheduling of gigs",
        ];

        const clientProFeatures = [
          "Unlimited gig postings",
          "Featured listing placement",
          "Advanced search filters",
          "Verified musician access",
          "Booking management tools",
          "Unlimited messaging",
          "Dedicated support",
          "Scheduling gigs (automatic, regular and more)",
        ];

        return [
          {
            name: "Free Tier",
            price: "$0",
            features: isMusician
              ? musicianFreeFeatures
              : isClient
                ? clientFreeFeatures
                : [],
            cta: isPro() ? "Downgrade" : "Current Plan", // ✅ Call isPro() function
            current: !isPro(), // ✅ Call isPro() function
          },
          {
            name: "Pro Tier",
            price: isMusician
              ? "1500 KES/month"
              : isClient
                ? "2000 KES/month"
                : "",
            features: isMusician
              ? musicianProFeatures
              : isClient
                ? clientProFeatures
                : [],
            cta: isPro() ? "Current Plan" : "Upgrade", // ✅ Call isPro() function
            current: isPro(), // ✅ Call isPro() function
          },
        ];
      },
    }),
    {
      name: "subscription-storage",
      partialize: (state) => ({
        subscription: state.subscription,
        availableTiers: state.availableTiers,
      }),
    }
  )
);
