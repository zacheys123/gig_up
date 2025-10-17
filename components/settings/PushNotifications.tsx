// components/settings/PushNotifications.tsx - ENHANCED VERSION
"use client";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Bell, BellOff, Smartphone, Loader2, Check, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function PushNotificationSettings() {
  const {
    isSupported,
    permission,
    isSubscribed,
    requestPermissionAndSubscribe,
    unsubscribe,
    serviceWorkerReady,
  } = usePushNotifications();

  const { colors } = useThemeColors();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    if (!isSupported) {
      setStatus("Not supported in this browser");
    } else if (permission === "denied") {
      setStatus("Permission denied - enable in browser settings");
    } else if (!serviceWorkerReady) {
      setStatus("Initializing...");
    } else if (isSubscribed) {
      setStatus("Enabled - receive notifications even when app is closed");
    } else {
      setStatus("Get notified even when you're not using the app");
    }
  }, [isSupported, permission, serviceWorkerReady, isSubscribed]);

  const handleTogglePush = async () => {
    if (!isSupported || !serviceWorkerReady) return;

    setIsLoading(true);
    try {
      if (isSubscribed) {
        await unsubscribe();
      } else {
        // Only request permission if not already granted
        if (permission !== "granted") {
          const result = await Notification.requestPermission();
          if (result !== "granted") {
            throw new Error("Permission denied");
          }
        }
        await requestPermissionAndSubscribe();
      }
    } catch (error) {
      console.error("Failed to toggle push notifications:", error);
      alert(
        "Failed to toggle push notifications. Please check browser settings."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (isLoading) {
      return (
        <Loader2 className={cn("w-5 h-5 animate-spin", colors.textMuted)} />
      );
    }

    if (!isSupported) {
      return <X className={cn("w-5 h-5", colors.destructive)} />;
    }

    if (isSubscribed) {
      return <Check className={cn("w-5 h-5", colors.successBg)} />;
    }

    return <BellOff className={cn("w-5 h-5", colors.textMuted)} />;
  };

  const getStatusText = () => {
    if (!isSupported) return "Unsupported Browser";
    if (permission === "denied") return "Permission Denied";
    if (!serviceWorkerReady) return "Initializing...";
    if (isSubscribed) return "Active";
    return "Inactive";
  };

  if (!isSupported) {
    return (
      <div className={cn("p-4 rounded-lg border", colors.border, colors.card)}>
        <div className="flex items-center gap-3">
          <Smartphone className={cn("w-5 h-5", colors.textMuted)} />
          <div>
            <h3 className={cn("font-semibold", colors.text)}>
              Push Notifications
            </h3>
            <p className={cn("text-sm", colors.textMuted)}>
              Not supported in this browser
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-4 rounded-lg border", colors.border, colors.card)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h3 className={cn("font-semibold", colors.text)}>
              Browser Push Notifications
            </h3>
            <p className={cn("text-sm", colors.textMuted)}>{status}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Status Badge */}
          <div
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
              isSubscribed
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
            )}
          >
            {getStatusText()}
          </div>

          {/* Toggle Button */}
          <button
            onClick={handleTogglePush}
            disabled={
              isLoading || permission === "denied" || !serviceWorkerReady
            }
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              isSubscribed ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600",
              (isLoading || permission === "denied" || !serviceWorkerReady) &&
                "opacity-50 cursor-not-allowed"
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                isSubscribed ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>
      </div>

      {permission === "denied" && (
        <div
          className={cn(
            "mt-3 p-3 rounded-lg text-sm",
            colors.warningBg,
            colors.warningText
          )}
        >
          <p className="font-medium">Push notifications are blocked</p>
          <p className="mt-1">
            To enable them, go to your browser settings and allow notifications
            for this site. Look for the lock icon in your address bar.
          </p>
        </div>
      )}

      {!serviceWorkerReady && isSupported && (
        <div
          className={cn(
            "mt-3 p-3 rounded-lg text-sm",
            colors.infoBg,
            colors.infoText
          )}
        >
          <p>Initializing push notifications service...</p>
        </div>
      )}

      {isSubscribed && (
        <div
          className={cn(
            "mt-3 p-3 rounded-lg text-sm",
            colors.successBg,
            colors.successText
          )}
        >
          <p>
            ✓ You'll receive browser notifications even when the app is closed.
          </p>
        </div>
      )}
    </div>
  );
}
