import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StatusStore {
  dismissedWarnings: Set<string>;
  addDismissedWarning: (key: string) => void;
  clearDismissedWarnings: () => void;
}

export const useStatusStore = create<StatusStore>()(
  persist(
    (set) => ({
      dismissedWarnings: new Set<string>(),
      addDismissedWarning: (key: string) =>
        set((state) => ({
          dismissedWarnings: new Set(state.dismissedWarnings).add(key),
        })),
      clearDismissedWarnings: () => set({ dismissedWarnings: new Set() }),
    }),
    {
      name: "status-warnings-storage",
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          return {
            state: {
              ...parsed.state,
              dismissedWarnings: new Set(parsed.state?.dismissedWarnings || []),
            },
            version: parsed.version,
          };
        },
        setItem: (name, value) => {
          const state = {
            ...value.state,
            dismissedWarnings: Array.from(value.state.dismissedWarnings),
          };
          localStorage.setItem(
            name,
            JSON.stringify({ state, version: value.version })
          );
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
