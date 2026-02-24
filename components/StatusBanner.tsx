// components/user/StatusBanner.tsx - INTEGRATED WITH ZUSTAND
"use client";

import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Clock,
  ShieldAlert,
  X,
  AlertCircle,
  MessageCircle,
  HelpCircle,
  FileText,
  User,
  Mail,
  Lock,
  ExternalLink,
  ShieldBan,
  TriangleAlert,
  Info,
  Zap,
  Shield,
  Calendar,
  Bell,
  Globe,
  Users,
  FileWarning,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserStatus, useUserStatus } from "@/hooks/userStatus";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useStatusStore } from "@/app/stores/useStatusStore";

// Define ALL possible status types including "active"
type StatusType =
  | "active"
  | "banned"
  | "temp_ban"
  | "suspended"
  | "warning"
  | "restricted";

interface StatusConfig {
  icon: React.ReactNode;
  gradient: string;
  bgGradient: string;
  borderColor: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  iconBg: string;
  showAppeal: boolean;
  showTimer: boolean;
  isDismissible: boolean; // NEW: Only warnings can be dismissed
}

export function StatusBanner() {
  const { status, isLoading, user } = useUserStatus();
  const { colors, mounted } = useThemeColors();
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Use Zustand store instead of local state
  const { dismissedWarnings, addDismissedWarning, clearDismissedWarnings } =
    useStatusStore();
  const router = useRouter();

  // Use refs to track without causing re-renders
  const hasShownRef = useRef(false);
  const lastStatusRef = useRef<string>("");

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Remove the localStorage useEffect since Zustand handles persistence

  // Create a stable status identifier
  const getStatusIdentifier = (status: UserStatus | null): string => {
    if (!status) return "";
    return `${status.type}-${status.reason || ""}-${status.expiresAt || ""}`;
  };

  // FIXED: Generate a unique key for warnings based on reason
  const generateWarningKey = (warning: UserStatus): string => {
    if (warning.type !== "warning" || !warning.reason) return "";

    // Use the reason directly (sanitized)
    const reason = warning.reason.trim().toLowerCase().replace(/\s+/g, "-");

    // If there's a timestamp, use it, otherwise use current date
    const timestamp = warning._creationTime || Date.now();

    // Create key in format: warning-reason-timestamp
    return `warning-${reason}-${timestamp}`;
  };

  const handleDismissWarning = useCallback(() => {
    if (!status || status.type !== "warning") {
      console.log("Cannot dismiss: not a warning or no status");
      return;
    }

    const warningKey = generateWarningKey(status);
    console.log("Dismissing warning with key:", warningKey);

    if (warningKey) {
      // Use Zustand store to add dismissed warning
      addDismissedWarning(warningKey);

      // Hide the modal immediately
      setIsVisible(false);

      // Also update the ref so it doesn't show again during this session
      hasShownRef.current = true;

      console.log(`Successfully dismissed warning: ${warningKey}`);
    } else {
      console.error("Invalid warning key, cannot dismiss");
    }
  }, [status, addDismissedWarning]);
  const handleContactSupport = () => {
    router.push("/support");
  };

  const handleViewDetails = () => {
    router.push("/account/status");
  };

  const handleAppeal = () => {
    router.push("/support/appeal");
  };

  const handleLearnMore = () => {
    if (!status) return;

    switch (status.type) {
      case "banned":
      case "temp_ban":
        router.push("/help/account-bans");
        break;
      case "suspended":
        router.push("/help/account-suspensions");
        break;
      case "warning":
        router.push("/help/warnings-system");
        break;
      default:
        router.push("/help/account-status");
    }
  };

  // Close handler - different behavior for warnings vs bans/suspensions
  const handleClose = () => {
    if (!status) return;

    if (status.type === "warning") {
      // For warnings: dismiss permanently using Zustand
      handleDismissWarning();
    } else {
      // For bans/suspensions: just hide for now (will show again on next check)
      setIsVisible(false);
      hasShownRef.current = true;

      console.log(
        `${status.type} cannot be dismissed, only hidden temporarily.`,
      );
    }
  };
  const handleClearDismissedWarnings = () => {
    clearDismissedWarnings();
    console.log("Cleared dismissed warnings");
  };

  // Manual test: Add current warning to dismissed using Zustand
  // Manual test: Add current warning to dismissed
  const testDismissCurrentWarning = () => {
    if (!status || status.type !== "warning") {
      console.log("No warning to dismiss");
      return;
    }

    const warningKey = generateWarningKey(status);
    if (warningKey) {
      addDismissedWarning(warningKey);
      setIsVisible(false);
      console.log("Manually dismissed warning:", warningKey);
    }
  };

  // Don't render until theme is mounted and status checked
  if (!mounted || isLoading) {
    return null;
  }

  // Don't show if no status
  if (!status) {
    return null;
  }

  // Get banner configuration
  const getStatusConfig = (): StatusConfig => {
    // TypeScript knows status.type cannot be "active" here because we already checked above
    const statusType = status.type as Exclude<StatusType, "active">;

    switch (statusType) {
      case "banned":
        return {
          icon: <ShieldBan className="h-6 w-6" />,
          gradient: "from-red-600 to-rose-700",
          bgGradient: "bg-gradient-to-br from-red-600/10 to-rose-700/10",
          borderColor: "border-red-600/30 dark:border-red-500/30",
          title: "Account Banned",
          severity: "critical",
          iconBg: "bg-gradient-to-br from-red-600 to-rose-700",
          showAppeal: true,
          showTimer: false,
          isDismissible: false, // Cannot be dismissed
        };
      case "temp_ban":
        return {
          icon: <ShieldAlert className="h-6 w-6" />,
          gradient: "from-orange-600 to-red-600",
          bgGradient: "bg-gradient-to-br from-orange-600/10 to-red-600/10",
          borderColor: "border-orange-600/30 dark:border-orange-500/30",
          title: "Temporary Ban",
          severity: "critical",
          iconBg: "bg-gradient-to-br from-orange-600 to-red-600",
          showAppeal: true,
          showTimer: true,
          isDismissible: false, // Cannot be dismissed
        };
      case "suspended":
        return {
          icon: <Clock className="h-6 w-6" />,
          gradient: "from-amber-600 to-orange-600",
          bgGradient: "bg-gradient-to-br from-amber-600/10 to-orange-600/10",
          borderColor: "border-amber-600/30 dark:border-amber-500/30",
          title: "Account Suspended",
          severity: "high",
          iconBg: "bg-gradient-to-br from-amber-600 to-orange-600",
          showAppeal: true,
          showTimer: true,
          isDismissible: false, // Cannot be dismissed
        };
      case "warning":
        return {
          icon: <TriangleAlert className="h-6 w-6" />,
          gradient: "from-yellow-600 to-amber-600",
          bgGradient: "bg-gradient-to-br from-yellow-600/10 to-amber-600/10",
          borderColor: "border-yellow-600/30 dark:border-yellow-500/30",
          title: "Administrative Warning",
          severity: "medium",
          iconBg: "bg-gradient-to-br from-yellow-600 to-amber-600",
          showAppeal: false,
          showTimer: false,
          isDismissible: true, // Can be dismissed
        };
      case "restricted":
        return {
          icon: <Shield className="h-6 w-6" />,
          gradient: "from-purple-600 to-violet-700",
          bgGradient: "bg-gradient-to-br from-purple-600/10 to-violet-700/10",
          borderColor: "border-purple-600/30 dark:border-purple-500/30",
          title: "Account Restricted",
          severity: "medium",
          iconBg: "bg-gradient-to-br from-purple-600 to-violet-700",
          showAppeal: false,
          showTimer: false,
          isDismissible: false, // Cannot be dismissed
        };
    }
  };

  const config = getStatusConfig();

  // Format dates
  const formatDateTime = (timestamp?: number) => {
    if (!timestamp) return "Not specified";
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate days remaining
  const getDaysRemaining = (expiresAt?: number) => {
    if (!expiresAt) return null;
    const now = Date.now();
    const diff = expiresAt - now;
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = status.expiresAt
    ? getDaysRemaining(status.expiresAt)
    : null;

  // Get severity label
  const getSeverityLabel = () => {
    switch (config.severity) {
      case "critical":
        return {
          text: "CRITICAL",
          color: "bg-gradient-to-r from-red-600 to-rose-700 text-white",
        };
      case "high":
        return {
          text: "HIGH PRIORITY",
          color: "bg-gradient-to-r from-orange-600 to-amber-600 text-white",
        };
      case "medium":
        return {
          text: "MEDIUM PRIORITY",
          color: "bg-gradient-to-r from-yellow-600 to-amber-600 text-black",
        };
      default:
        return {
          text: "INFORMATION",
          color: "bg-gradient-to-r from-blue-600 to-cyan-600 text-white",
        };
    }
  };

  const severityLabel = getSeverityLabel();

  // Impact descriptions based on status type
  const getImpactItems = () => {
    // TypeScript knows status.type cannot be "active" here
    const statusType = status.type as Exclude<StatusType, "active">;

    switch (statusType) {
      case "banned":
      case "temp_ban":
        return [
          { icon: ShieldBan, text: "Complete loss of platform access" },
          { icon: Users, text: "Profile hidden from all users" },
          { icon: Mail, text: "No notifications or communications" },
        ];
      case "suspended":
        return [
          { icon: Lock, text: "Cannot post content or messages" },
          { icon: Bell, text: "Limited notification access" },
          { icon: Globe, text: "Read-only access to content" },
        ];
      case "warning":
        return [
          { icon: TriangleAlert, text: "Formal notice of policy violation" },
          { icon: Calendar, text: "Warning expires after 30 days" },
          { icon: Info, text: "Further violations may lead to suspension" },
        ];
      case "restricted":
        return [
          { icon: Lock, text: "Limited platform functionality" },
          { icon: Shield, text: "Content visibility restricted" },
          { icon: Bell, text: "Some features disabled" },
        ];
    }
  };

  const impactItems = getImpactItems();

  // Get current warning key for debugging
  const currentWarningKey =
    status.type === "warning" ? generateWarningKey(status) : "";

  // If not visible, don't render anything
  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop - Only close on click for warnings */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-lg z-[9998]"
            onClick={status.type === "warning" ? handleClose : undefined}
          />

          {/* Modal */}
          <motion.div
            key="status-modal"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
            className={cn(
              "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
              "w-[95vw] max-w-2xl",
              "max-h-[90vh] overflow-hidden",
              "rounded-2xl border-2 shadow-2xl z-[9999]",
              config.borderColor,
              colors.background,
              "backdrop-blur-xl",
              "flex flex-col",
            )}
          >
            {/* Modal Header */}
            <div
              className={cn(
                "relative p-6 border-b",
                config.borderColor,
                config.severity === "critical"
                  ? "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30"
                  : config.severity === "high"
                    ? "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30"
                    : "",
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 opacity-5 rounded-t-2xl",
                  `bg-gradient-to-br ${config.gradient}`,
                )}
              />

              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={cn(
                      "p-3 rounded-2xl shadow-lg flex-shrink-0",
                      config.iconBg,
                      "text-white",
                    )}
                  >
                    {config.icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h2 className="text-xl font-bold truncate">
                        {config.title}
                      </h2>
                      <Badge
                        className={cn(
                          "px-3 py-1 font-bold",
                          severityLabel.color,
                          "shadow-md",
                        )}
                      >
                        {severityLabel.text}
                      </Badge>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400">
                      Important account notification
                    </p>

                    {/* Debug info for warnings */}
                    {status.type === "warning" && (
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <div>Warning Key: {currentWarningKey}</div>
                        <div>
                          Is Dismissed in Store:{" "}
                          {dismissedWarnings.has(currentWarningKey)
                            ? "Yes"
                            : "No"}
                        </div>
                      </div>
                    )}

                    {config.showTimer && daysRemaining !== null && (
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}{" "}
                          remaining
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Close button - Show for warnings, hide for bans/suspensions */}
                {config.isDismissible && (
                  <button
                    onClick={handleClose}
                    className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200"
                    title="Dismiss warning"
                    aria-label="Dismiss warning"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Details */}
                <div className="space-y-6">
                  <div
                    className={cn(
                      "p-5 rounded-2xl border",
                      colors.border,
                      colors.backgroundMuted,
                    )}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Info className="h-5 w-5 text-gray-500" />
                      <h3 className="font-semibold">Status Details</h3>
                    </div>

                    <div className="space-y-4">
                      <p className="text-gray-700 dark:text-gray-300">
                        {status.message}
                      </p>

                      {status.reason && (
                        <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-200 dark:border-orange-800">
                          <div className="flex items-center gap-2 mb-2">
                            <FileWarning className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                              Violation Reason
                            </span>
                          </div>
                          <p className="text-sm text-orange-800 dark:text-orange-200">
                            {status.reason}
                          </p>
                        </div>
                      )}

                      {status.expiresAt && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4" />
                          <span>
                            Expires: {formatDateTime(status.expiresAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Account Impact */}
                  <div
                    className={cn(
                      "p-5 rounded-2xl border",
                      colors.border,
                      colors.backgroundMuted,
                    )}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Zap className="h-5 w-5 text-gray-500" />
                      <h3 className="font-semibold">Account Impact</h3>
                    </div>

                    <ul className="space-y-3">
                      {impactItems.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <item.icon className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {item.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Account Info & Actions */}
                <div className="space-y-6">
                  {/* Account Info */}
                  {user && (
                    <div
                      className={cn(
                        "p-5 rounded-2xl border",
                        colors.border,
                        colors.backgroundMuted,
                      )}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <User className="h-5 w-5 text-gray-500" />
                        <h3 className="font-semibold">Your Account</h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            Username
                          </p>
                          <p className="font-medium">@{user.username}</p>
                        </div>

                        {user.email && (
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                              Email
                            </p>
                            <p className="font-medium truncate">{user.email}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleContactSupport}
                      className={cn(
                        "w-full py-4 rounded-xl font-medium",
                        config.severity === "critical"
                          ? "bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800"
                          : config.severity === "high"
                            ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                            : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
                        "text-white shadow-lg hover:shadow-xl transition-all",
                      )}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact Support
                    </Button>

                    {config.showAppeal && (
                      <Button
                        onClick={handleAppeal}
                        className="w-full py-4 rounded-xl font-medium bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Submit Appeal
                      </Button>
                    )}

                    <Button
                      onClick={handleViewDetails}
                      variant="outline"
                      className="w-full py-4 rounded-xl font-medium border-2"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Full Details
                    </Button>

                    <Button
                      onClick={handleLearnMore}
                      variant="ghost"
                      className="w-full py-4 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400"
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Learn More
                    </Button>

                    {/* Dismiss Button - ONLY FOR WARNINGS */}
                    {config.isDismissible && (
                      <Button
                        onClick={handleClose}
                        variant="ghost"
                        className="w-full py-4 rounded-xl font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Dismiss Warning
                      </Button>
                    )}

                    {process.env.NODE_ENV === "development" && (
                      <>
                        <Button
                          onClick={handleClearDismissedWarnings} // Updated function
                          variant="ghost"
                          className="w-full py-2 text-xs text-gray-400 hover:text-gray-600"
                          size="sm"
                        >
                          Clear Dismissed Warnings (Debug)
                        </Button>

                        <div className="text-xs text-gray-500 p-2 border rounded">
                          <div>Current Key: {currentWarningKey}</div>
                          <div>
                            Dismissed Warnings:{" "}
                            {JSON.stringify([...dismissedWarnings])}{" "}
                            {/* From Zustand */}
                          </div>
                          <div>
                            Status:{" "}
                            {JSON.stringify({
                              type: status.type,
                              reason: status.reason,
                              _creationTime: (status as any)._creationTime,
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-6 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      This is an automated notification from gigUp's security
                      system
                    </p>
                    {status.type === "warning" && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Warnings can be dismissed and will not reappear
                      </p>
                    )}
                    {(status.type === "banned" ||
                      status.type === "temp_ban" ||
                      status.type === "suspended") && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        This status cannot be dismissed
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Case ID: {user?._id?.slice(-8) || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
