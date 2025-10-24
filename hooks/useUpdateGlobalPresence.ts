// hooks/useUpdateGlobalPresence.ts - FIXED
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";
import { useCurrentUser } from "./useCurrentUser";

export function useUpdateGlobalPresence() {
  const { user: currentUser } = useCurrentUser();
  const updatePresence = useMutation(api.presence.updateUserPresence); // ✅ Fixed path

  useEffect(() => {
    if (!currentUser?._id) return;

    // Initial update
    updatePresence({ userId: currentUser._id });

    // Update every 2 minutes to stay "online"
    const interval = setInterval(
      () => {
        updatePresence({ userId: currentUser._id });
      },
      2 * 60 * 1000
    );

    return () => {
      clearInterval(interval);
    };
  }, [currentUser?._id, updatePresence]);

  return { updatePresence };
}
