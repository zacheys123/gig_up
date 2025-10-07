// stores/useAppStore.ts
import { create } from "zustand";

interface Gig {
  _id: string;
  title: string;
  description: string;
  city: string;
  budget: number;
  date: string;
  status: "open" | "filled" | "completed" | "cancelled";
  createdBy: string;
  // Add other gig fields as needed
}

interface AppStore {
  // State
  gigs: Gig[];
  featuredMusicians: any[];
  searchQuery: string;
  filters: {
    city: string;
    instrument: string;
    experience: string;
    minBudget: number;
    maxBudget: number;
  };

  // Actions
  setGigs: (gigs: Gig[]) => void;
  addGig: (gig: Gig) => void;
  updateGig: (gigId: string, updates: Partial<Gig>) => void;
  removeGig: (gigId: string) => void;
  setFeaturedMusicians: (musicians: any[]) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<AppStore["filters"]>) => void;
  clearFilters: () => void;

  // Computed
  filteredGigs: () => Gig[];
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Initial state
  gigs: [],
  featuredMusicians: [],
  searchQuery: "",
  filters: {
    city: "",
    instrument: "",
    experience: "",
    minBudget: 0,
    maxBudget: 10000,
  },

  // Actions
  setGigs: (gigs) => set({ gigs }),

  addGig: (gig) => set((state) => ({ gigs: [...state.gigs, gig] })),

  updateGig: (gigId, updates) =>
    set((state) => ({
      gigs: state.gigs.map((gig) =>
        gig._id === gigId ? { ...gig, ...updates } : gig
      ),
    })),

  removeGig: (gigId) =>
    set((state) => ({
      gigs: state.gigs.filter((gig) => gig._id !== gigId),
    })),

  setFeaturedMusicians: (musicians) => set({ featuredMusicians: musicians }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  clearFilters: () =>
    set({
      filters: {
        city: "",
        instrument: "",
        experience: "",
        minBudget: 0,
        maxBudget: 10000,
      },
    }),

  // Computed
  filteredGigs: () => {
    const { gigs, searchQuery, filters } = get();

    return gigs.filter((gig) => {
      const matchesSearch =
        searchQuery === "" ||
        gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gig.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gig.city.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCity = !filters.city || gig.city === filters.city;
      const matchesBudget =
        gig.budget >= filters.minBudget && gig.budget <= filters.maxBudget;

      return matchesSearch && matchesCity && matchesBudget;
    });
  },
}));
