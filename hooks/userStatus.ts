// hooks/useUserStatus.ts - Add more debugging
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";

export type UserStatus = {
  type: "banned" | "suspended" | "warning" | "restricted" | "temp_ban";
  message: string;
  reason?: string;
  expiresAt?: number;
  canDismiss: boolean;
  severity: "critical" | "high" | "medium" | "low";
  _creationTime?: number;
};

export const useUserStatus = () => {
  const { userId, isLoaded: authLoaded } = useAuth(); // Get auth loading state

  const user = useQuery(
    api.controllers.user.getCurrentUser,
    userId ? { clerkId: userId } : "skip"
  );

  console.log("useUserStatus debug:", {
    userId,
    authLoaded,
    user,
    isBanned: user?.isBanned,
    isSuspended: user?.isSuspended,
    warnings: user?.warnings,
    reportedCount: user?.reportedCount,
  });

  const getStatus = (): UserStatus | null => {
    if (!user || !userId) {
      console.log("No user or userId, returning null");
      return null;
    }

    const now = Date.now();

    // Check permanent ban
    if (user.isBanned && !user.banExpiresAt) {
      const status = {
        type: "banned" as const,
        message: "Your account has been permanently banned from the platform.",
        reason: user.banReason || "Violation of terms of service",
        canDismiss: false,
        severity: "critical" as const,
      };
      console.log("Banned status detected:", status);
      return status;
    }

    // Check temporary ban
    if (user.isBanned && user.banExpiresAt && user.banExpiresAt > now) {
      const daysLeft = Math.ceil(
        (user.banExpiresAt - now) / (1000 * 60 * 60 * 24)
      );
      const status = {
        type: "temp_ban" as const,
        message: `Your account has been temporarily banned for ${daysLeft} day${daysLeft !== 1 ? "s" : ""}.`,
        reason: user.banReason,
        expiresAt: user.banExpiresAt,
        canDismiss: false,
        severity: "critical" as const,
      };
      console.log("Temp ban status detected:", status);
      return status;
    }

    // Check suspended status
    if (
      user.isSuspended &&
      user.suspensionExpiresAt &&
      user.suspensionExpiresAt > now
    ) {
      const daysLeft = Math.ceil(
        (user.suspensionExpiresAt - now) / (1000 * 60 * 60 * 24)
      );
      const status = {
        type: "suspended" as const,
        message: `Your account is suspended. You will regain access in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}.`,
        reason: user.suspensionReason,
        expiresAt: user.suspensionExpiresAt,
        canDismiss: false,
        severity: "high" as const,
      };
      console.log("Suspended status detected:", status);
      return status;
    }

    // Check recent warnings (last 30 days)
    if (user.warnings && user.warnings.length > 0) {
      const recentWarnings = user.warnings.filter(
        (warning) => now - warning.timestamp < 30 * 24 * 60 * 60 * 1000
      );

      if (recentWarnings.length > 0) {
        const latestWarning = recentWarnings[recentWarnings.length - 1];
        const status = {
          type: "warning" as const,
          message: `You have ${recentWarnings.length} administrative warning${recentWarnings.length > 1 ? "s" : ""}.`,
          reason: latestWarning.warning,
          canDismiss: true,
          severity: "medium" as const,
        };
        console.log("Warning status detected:", status);
        return status;
      }
    }

    // Check if user is restricted (e.g., limited features)
    if (user.reportedCount && user.reportedCount >= 3) {
      const status = {
        type: "restricted" as const,
        message:
          "Your account features have been restricted due to multiple user reports.",
        canDismiss: false,
        severity: "medium" as const,
      };
      console.log("Restricted status detected:", status);
      return status;
    }

    console.log("No status detected for user");
    return null;
  };

  const isBanned = user?.isBanned || false;
  const isSuspended = user?.isSuspended || false;
  const hasWarnings = user?.warnings && user.warnings.length > 0;
  const isRestricted = (user?.reportedCount || 0) >= 3;

  const status = getStatus();

  return {
    status,
    user,
    isLoading: !authLoaded || user === undefined, // Wait for auth to load too
    isBanned,
    isSuspended,
    hasWarnings,
    isRestricted,
  };
};
