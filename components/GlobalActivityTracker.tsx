// components/GlobalActivityTracker.tsx
"use client";
import { useGlobalActivity } from "@/hooks/useUpdateGlobalActivity";

export function GlobalActivityTracker() {
  useGlobalActivity();
  return null; // This component doesn't render anything
}
