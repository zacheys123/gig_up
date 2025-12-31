import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface GigStore {
  // Form state
  isSchedulerOpen: boolean;
  showOfflineNotification: boolean;
  shouldRefetchData: boolean;
  lastSubmittedGigId: string | null;
  recentGigTemplates: Array<{
    id: string;
    title: string;
    category: string;
    timestamp: number;
  }>;

  // Actions
  setisSchedulerOpen: (isOpen: boolean) => void;
  setShowOfflineNotification: (show: boolean) => void;
  setRefetchData: (shouldRefetch: boolean) => void;
  setLastSubmittedGigId: (id: string | null) => void;
  addRecentTemplate: (template: {
    id: string;
    title: string;
    category: string;
  }) => void;
  clearRecentTemplates: () => void;
}

export const useGigStore = create<GigStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isSchedulerOpen: false,
      showOfflineNotification: false,
      shouldRefetchData: false,
      lastSubmittedGigId: null,
      recentGigTemplates: [],

      // Actions
      setisSchedulerOpen: (isOpen: boolean) => set({ isSchedulerOpen: isOpen }),

      setShowOfflineNotification: (show: boolean) =>
        set({ showOfflineNotification: show }),

      setRefetchData: (shouldRefetch: boolean) =>
        set({ shouldRefetchData: shouldRefetch }),

      setLastSubmittedGigId: (id: string | null) =>
        set({ lastSubmittedGigId: id }),

      addRecentTemplate: (template) =>
        set((state) => ({
          recentGigTemplates: [
            { ...template, timestamp: Date.now() },
            ...state.recentGigTemplates.slice(0, 4), // Keep only last 5
          ],
        })),

      clearRecentTemplates: () => set({ recentGigTemplates: [] }),
    }),
    {
      name: "gig-store",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        recentGigTemplates: state.recentGigTemplates,
        lastSubmittedGigId: state.lastSubmittedGigId,
      }),
    }
  )
);

// FIXED: Create stable selector hooks that don't return new objects on every render
// Option 1: Simple selector hooks (recommended)
export const useIsSchedulerOpen = () =>
  useGigStore((state) => state.isSchedulerOpen);
export const useSetIsSchedulerOpen = () =>
  useGigStore((state) => state.setisSchedulerOpen);

export const useShowOfflineNotification = () =>
  useGigStore((state) => state.showOfflineNotification);
export const useSetShowOfflineNotification = () =>
  useGigStore((state) => state.setShowOfflineNotification);

export const useShouldRefetchData = () =>
  useGigStore((state) => state.shouldRefetchData);
export const useSetRefetchData = () =>
  useGigStore((state) => state.setRefetchData);

export const useLastSubmittedGigId = () =>
  useGigStore((state) => state.lastSubmittedGigId);
export const useSetLastSubmittedGigId = () =>
  useGigStore((state) => state.setLastSubmittedGigId);

// Option 2: Combined hooks with memoization (if you need multiple values)
import { useMemo } from "react";

// For scheduler state
export const useGigScheduler = () => {
  const isSchedulerOpen = useIsSchedulerOpen();
  const setisSchedulerOpen = useSetIsSchedulerOpen();

  // Return a memoized object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      isSchedulerOpen,
      setisSchedulerOpen,
    }),
    [isSchedulerOpen, setisSchedulerOpen]
  );
};

// For notification state
export const useGigNotifications = () => {
  const showOfflineNotification = useShowOfflineNotification();
  const setShowOfflineNotification = useSetShowOfflineNotification();

  return useMemo(
    () => ({
      showOfflineNotification,
      setShowOfflineNotification,
    }),
    [showOfflineNotification, setShowOfflineNotification]
  );
};

// For data state
export const useGigData = () => {
  const shouldRefetchData = useShouldRefetchData();
  const setRefetchData = useSetRefetchData();
  const lastSubmittedGigId = useLastSubmittedGigId();
  const setLastSubmittedGigId = useSetLastSubmittedGigId();

  return useMemo(
    () => ({
      shouldRefetchData,
      setRefetchData,
      lastSubmittedGigId,
      setLastSubmittedGigId,
    }),
    [
      shouldRefetchData,
      setRefetchData,
      lastSubmittedGigId,
      setLastSubmittedGigId,
    ]
  );
};

// For template state
export const useRecentTemplates = () => {
  const recentGigTemplates = useGigStore((state) => state.recentGigTemplates);
  const addRecentTemplate = useGigStore((state) => state.addRecentTemplate);
  const clearRecentTemplates = useGigStore(
    (state) => state.clearRecentTemplates
  );

  return useMemo(
    () => ({
      recentGigTemplates,
      addRecentTemplate,
      clearRecentTemplates,
    }),
    [recentGigTemplates, addRecentTemplate, clearRecentTemplates]
  );
};
