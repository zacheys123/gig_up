// stores/useSubscriptionStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SubscriptionTierName = "free" | "pro" | "premium" | "elite";
type UserRole = "musician" | "client" | "booker";

interface SubscriptionTier {
  id: string;
  name: SubscriptionTierName;
  price: number;
  currency: string;
  features: string[];
  limits: {
    monthlyGigs: number;
    monthlyMessages: number;
    storageGB: number;
    analytics: boolean;
    prioritySupport: boolean;
    featuredListings: boolean;
    advancedAnalytics: boolean;
    dedicatedSupport: boolean;
    customBranding: boolean;
    apiAccess: boolean;
  };
}

interface Subscription {
  tier: SubscriptionTierName;
  status: "active" | "pending" | "canceled" | "expired";
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  nextBillingDate?: number;
}

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

  // Computed
  isPro: () => boolean;
  isPremium: () => boolean;
  isElite: () => boolean;
  isActive: () => boolean;
  daysUntilRenewal: () => number;
  canUpgrade: () => boolean;

  // Get plans based on user role
  getPlansForUser: (
    isMusician?: boolean,
    isClient?: boolean,
    isBooker?: boolean
  ) => Array<{
    name: string;
    price: string;
    features: string[];
    cta: string;
    current: boolean;
    comingSoon?: boolean;
    popular?: boolean;
  }>;
}

// Define feature types with proper typing
type TierFeatures = {
  [key in SubscriptionTierName]: string[];
};

type RoleFeatures = {
  [key in UserRole]: TierFeatures;
};

// Define pricing structure
type Pricing = {
  [key in UserRole]: {
    [key in SubscriptionTierName]: string;
  };
};

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
            "3 gigs per month",
            "30 messages monthly",
            "500MB storage",
            "Community support",
          ],
          limits: {
            monthlyGigs: 3,
            monthlyMessages: 30,
            storageGB: 0.5,
            analytics: false,
            prioritySupport: false,
            featuredListings: false,
            advancedAnalytics: false,
            dedicatedSupport: false,
            customBranding: false,
            apiAccess: false,
          },
        },
        {
          id: "pro",
          name: "pro",
          price: 19.99,
          currency: "KES",
          features: [
            "Enhanced profile",
            "15 gigs per month",
            "200 messages monthly",
            "5GB storage",
            "Priority support",
            "Basic analytics",
            "Featured listings",
          ],
          limits: {
            monthlyGigs: 15,
            monthlyMessages: 200,
            storageGB: 5,
            analytics: true,
            prioritySupport: true,
            featuredListings: true,
            advancedAnalytics: false,
            dedicatedSupport: false,
            customBranding: false,
            apiAccess: false,
          },
        },
        {
          id: "premium",
          name: "premium",
          price: 49.99,
          currency: "KES",
          features: [
            "Premium profile badge",
            "Unlimited gigs",
            "Unlimited messages",
            "25GB storage",
            "Advanced analytics",
            "Dedicated support",
            "Priority placement",
            "Custom branding",
          ],
          limits: {
            monthlyGigs: -1,
            monthlyMessages: -1,
            storageGB: 25,
            analytics: true,
            prioritySupport: true,
            featuredListings: true,
            advancedAnalytics: true,
            dedicatedSupport: true,
            customBranding: true,
            apiAccess: false,
          },
        },
        {
          id: "elite",
          name: "elite",
          price: 99.99,
          currency: "KES",
          features: [
            "Elite profile badge",
            "Unlimited everything",
            "100GB storage",
            "White-label solutions",
            "API access",
            "24/7 dedicated support",
            "Custom integrations",
            "Early feature access",
          ],
          limits: {
            monthlyGigs: -1,
            monthlyMessages: -1,
            storageGB: 100,
            analytics: true,
            prioritySupport: true,
            featuredListings: true,
            advancedAnalytics: true,
            dedicatedSupport: true,
            customBranding: true,
            apiAccess: true,
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

      // Computed functions
      isPro: (): boolean => {
        const { subscription } = get();
        return (
          subscription?.tier === "pro" && subscription?.status === "active"
        );
      },

      isPremium: (): boolean => {
        const { subscription } = get();
        return (
          subscription?.tier === "premium" && subscription?.status === "active"
        );
      },

      isElite: (): boolean => {
        const { subscription } = get();
        return (
          subscription?.tier === "elite" && subscription?.status === "active"
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
          subscription?.tier !== "elite" || subscription?.status !== "active"
        );
      },

      // Fixed getPlansForUser with proper typing
      getPlansForUser: (
        isMusician = false,
        isClient = false,
        isBooker = false
      ) => {
        const { isPro, isPremium, isElite, subscription } = get();

        // Define features with proper typing
        const baseFeatures: RoleFeatures = {
          musician: {
            free: [
              "Apply to 3 gigs/week",
              "30 messages monthly",
              "Basic profile visibility",
              "Performance tracking",
            ],
            pro: [
              "Apply to 15 gigs/month",
              "200 messages monthly",
              "Enhanced profile",
              "Featured in search results",
              "Basic analytics dashboard",
              "Priority client matching",
            ],
            premium: [
              "Unlimited gig applications",
              "Unlimited messaging",
              "Premium profile badge",
              "Top placement in searches",
              "Advanced analytics",
              "Custom profile branding",
              "Dedicated support",
            ],
            elite: [
              "Unlimited everything",
              "Elite profile badge",
              "White-label profile",
              "API access for integrations",
              "24/7 dedicated support",
              "Custom feature requests",
              "Early access to new features",
            ],
          },
          client: {
            free: [
              "Post 3 gigs/month",
              "Browse musician profiles",
              "30 messages monthly",
              "Basic scheduling tools",
            ],
            pro: [
              "Post 15 gigs/month",
              "Advanced search filters",
              "200 messages monthly",
              "Priority musician access",
              "Booking management tools",
              "Featured gig listings",
            ],
            premium: [
              "Unlimited gig postings",
              "Unlimited messaging",
              "Premium verification badge",
              "Advanced analytics dashboard",
              "Custom branding on posts",
              "Dedicated account manager",
              "Automated scheduling",
            ],
            elite: [
              "Unlimited everything",
              "Elite verification badge",
              "White-label solutions",
              "API access for automation",
              "24/7 dedicated support",
              "Custom workflow integrations",
              "Enterprise-grade features",
            ],
          },
          booker: {
            free: [
              "View 10 gigs/week",
              "Apply to 3 gigs/month",
              "30 messages monthly",
              "Basic profile",
              "Access to musician hub",
            ],
            pro: [
              "View unlimited gigs",
              "Apply to 15 gigs/month",
              "200 messages monthly",
              "Enhanced booker profile",
              "Priority gig access",
              "Advanced search filters",
              "Basic coordination tools",
            ],
            premium: [
              "Unlimited gig applications",
              "Unlimited messaging",
              "Premium booker badge",
              "Featured in client searches",
              "Advanced coordination suite",
              "Custom booking workflows",
              "Dedicated support line",
            ],
            elite: [
              "Unlimited everything",
              "Elite booker certification",
              "White-label booking system",
              "API access for integrations",
              "24/7 dedicated support",
              "Custom reporting tools",
              "Enterprise client management",
            ],
          },
        };

        // Define pricing with proper typing
        const pricing: Pricing = {
          musician: {
            free: "Free",
            pro: "1,500 KES/month",
            premium: "4,500 KES/month",
            elite: "9,000 KES/month",
          },
          client: {
            free: "Free",
            pro: "2,000 KES/month",
            premium: "5,000 KES/month",
            elite: "10,000 KES/month",
          },
          booker: {
            free: "Free",
            pro: "1,800 KES/month",
            premium: "4,800 KES/month",
            elite: "9,500 KES/month",
          },
        };

        // Determine user role with proper typing
        const userRole: UserRole = isMusician
          ? "musician"
          : isClient
            ? "client"
            : "booker";
        const currentTier: SubscriptionTierName = subscription?.tier || "free";

        // Create plans array with proper typing
        const plans: SubscriptionTierName[] = [
          "free",
          "pro",
          "premium",
          "elite",
        ];

        return plans.map((tier) => {
          const isCurrent = currentTier === tier;
          const isPopular = tier === "pro";

          return {
            name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Tier`,
            price: pricing[userRole][tier],
            features: baseFeatures[userRole][tier],
            cta: isCurrent
              ? "Current Plan"
              : tier === "free"
                ? "Downgrade"
                : "Upgrade",
            current: isCurrent,
            popular: isPopular,
            comingSoon: false, // Set to true for tiers you want to hide
          };
        });
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
