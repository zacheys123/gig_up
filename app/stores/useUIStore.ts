// stores/useUIStore.ts
import { create } from "zustand";

interface UIStore {
  // State
  theme: "light" | "dark" | "system";
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  modals: {
    login: boolean;
    register: boolean;
    profile: boolean;
    settings: boolean;
  };
  toast: {
    message: string;
    type: "success" | "error" | "warning" | "info";
    visible: boolean;
  } | null;

  // Actions
  setTheme: (theme: "light" | "dark" | "system") => void;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  openModal: (modal: keyof UIStore["modals"]) => void;
  closeModal: (modal: keyof UIStore["modals"]) => void;
  closeAllModals: () => void;
  showToast: (message: string, type?: UIStore["toast"]["type"]) => void;
  hideToast: () => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  // Initial state
  theme: "system",
  sidebarOpen: false,
  mobileMenuOpen: false,
  modals: {
    login: false,
    register: false,
    profile: false,
    settings: false,
  },
  toast: null,

  // Actions
  setTheme: (theme) => set({ theme }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  toggleMobileMenu: () =>
    set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),

  openModal: (modal) =>
    set((state) => ({
      modals: { ...state.modals, [modal]: true },
    })),

  closeModal: (modal) =>
    set((state) => ({
      modals: { ...state.modals, [modal]: false },
    })),

  closeAllModals: () =>
    set({
      modals: {
        login: false,
        register: false,
        profile: false,
        settings: false,
      },
    }),

  showToast: (message, type = "info") =>
    set({
      toast: { message, type, visible: true },
    }),

  hideToast: () => set({ toast: null }),
}));
