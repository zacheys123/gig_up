// components/notifications/NotificationToastContainer.tsx
"use client";

import { useNotificationSystem } from "@/hooks/useNotifications";
import { AnimatePresence } from "framer-motion";
import { NotificationToast } from "./NotificationHandler";

export function NotificationToastContainer() {
  const { toasts, removeToast } = useNotificationSystem();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <NotificationToast
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
