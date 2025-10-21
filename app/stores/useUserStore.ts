// stores/useUserStore.ts
import { UserProps } from "@/types/userTypes";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserStore {
  // State
  user: UserProps | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  searchQuery: string;
  // Actions
  setUser: (user: UserProps | null) => void;
  setLoading: (loading: boolean) => void;
  updateUser: (updates: Partial<UserProps>) => void;
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
