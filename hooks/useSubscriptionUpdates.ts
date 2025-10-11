// hooks/useSubscriptionUpdates.ts
import { useState, useCallback } from "react";

interface ToastState {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  timestamp: number;
}

export function useSubscriptionUpdates() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = useCallback(
    (type: ToastState["type"], title: string, message: string) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast: ToastState = {
        id,
        type,
        title,
        message,
        timestamp: Date.now(),
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 5000);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const subscriptionSuccess = useCallback(
    (action: "upgraded" | "downgraded" | "cancelled" | "renewed") => {
      const messages = {
        upgraded: {
          title: "🎉 Upgrade Successful!",
          message:
            "Welcome to Pro! You now have access to all premium features.",
        },
        downgraded: {
          title: "Subscription Updated",
          message: "Your subscription has been changed to the Free tier.",
        },
        cancelled: {
          title: "Subscription Cancelled",
          message:
            "Your subscription will remain active until the end of the billing period.",
        },
        renewed: {
          title: "Payment Successful",
          message: "Your subscription has been renewed for another month.",
        },
      };

      showToast("success", messages[action].title, messages[action].message);
    },
    [showToast]
  );

  const subscriptionError = useCallback(
    (action: string, error?: string) => {
      showToast(
        "error",
        "Subscription Update Failed",
        error || `We couldn't process your ${action}. Please try again.`
      );
    },
    [showToast]
  );

  const subscriptionInfo = useCallback(
    (title: string, message: string) => {
      showToast("info", title, message);
    },
    [showToast]
  );

  return {
    toasts,
    showToast,
    removeToast,
    subscriptionSuccess,
    subscriptionError,
    subscriptionInfo,
  };
}
