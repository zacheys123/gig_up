// components/subscription/SubscriptionUpdateManager.tsx
"use client";
import { SubscriptionToast } from "./SubscriptionToast";
import { useSubscriptionUpdates } from "@/hooks/useSubscriptionUpdates";

export function SubscriptionUpdateManager() {
  const { toasts, removeToast } = useSubscriptionUpdates();

  return (
    <>
      {toasts.map((toast, index) => (
        <SubscriptionToast
          key={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          isVisible={true}
          onClose={() => removeToast(toast.id)}
          autoHideDuration={5000}
          style={{
            top: `${4 + index * 90}px`, // Stack toasts vertically
          }}
        />
      ))}
    </>
  );
}
