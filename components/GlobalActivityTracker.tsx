// components/GlobalActivityTracker.tsx
"use client";
import { useGlobalActivity } from "@/hooks/useUpdateGlobalActivity";
import { useUpdateGlobalPresence } from "@/hooks/useUpdateGlobalPresence";

export function GlobalActivityTracker() {
  useGlobalActivity();
  useUpdateGlobalPresence(); // This will keep the current user's presence updated

  return null; // This component doesn't render anything
}
