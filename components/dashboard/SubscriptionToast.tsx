// components/subscription/SubscriptionToast.tsx
"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  X,
  AlertCircle,
  Info,
  Crown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionToastProps {
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  isVisible: boolean;
  onClose: () => void;
  autoHideDuration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  style?: React.CSSProperties;
}

export function SubscriptionToast({
  type,
  title,
  message,
  isVisible,
  onClose,
  autoHideDuration = 5000,
  action,
  style,
}: SubscriptionToastProps) {
  useEffect(() => {
    if (isVisible && autoHideDuration > 0) {
      const timer = setTimeout(onClose, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoHideDuration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const backgroundColors = {
    success:
      "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
    error: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
    warning:
      "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
    info: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={cn(
            "fixed top-4 right-4 z-50 max-w-sm w-full p-4 rounded-lg border shadow-lg",
            backgroundColors[type]
          )}
          style={style}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">{icons[type]}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h4>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {message}
              </p>
              {action && (
                <button
                  onClick={action.onClick}
                  className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {action.label}
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
