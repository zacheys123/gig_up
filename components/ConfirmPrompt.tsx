"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  User,
  X,
  AlertCircle,
  Info,
  CheckCircle,
  HelpCircle,
} from "lucide-react";

interface UserInfo {
  id: string;
  name: string;
  username?: string;
  image?: string;
  type?: "musician" | "client" | "admin";
  instrument?: string;
  city?: string;
}

interface ConfirmPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userInfo: UserInfo) => void;
  onCancel?: () => void;
  title: string;
  question: string;
  userInfo: UserInfo;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "warning" | "info" | "success";
  size?: "sm" | "md" | "lg";
}

export default function ConfirmPrompt({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  title,
  question,
  userInfo,
  confirmText = "Yes, Continue",
  cancelText = "No, Cancel",
  variant = "default",
  size = "md",
}: ConfirmPromptProps) {
  const handleConfirm = () => {
    onConfirm(userInfo);
    onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  // Variant configurations
  const variantConfig = {
    default: {
      icon: <HelpCircle className="w-6 h-6 text-blue-600" />,
      confirmButton: "bg-blue-600 hover:bg-blue-700 text-white",
      accent: "text-blue-600",
    },
    warning: {
      icon: <AlertCircle className="w-6 h-6 text-amber-600" />,
      confirmButton: "bg-amber-600 hover:bg-amber-700 text-white",
      accent: "text-amber-600",
    },
    info: {
      icon: <Info className="w-6 h-6 text-blue-600" />,
      confirmButton: "bg-blue-600 hover:bg-blue-700 text-white",
      accent: "text-blue-600",
    },
    success: {
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      confirmButton: "bg-green-600 hover:bg-green-700 text-white",
      accent: "text-green-600",
    },
  };

  const sizeConfig = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-xl",
  };

  const currentVariant = variantConfig[variant];
  const currentSize = sizeConfig[size];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
            className={cn(
              "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
              "bg-white rounded-xl shadow-2xl border border-gray-200",
              "w-full mx-4",
              currentSize
            )}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-6 border-b border-gray-100">
              <div className="flex-shrink-0">{currentVariant.icon}</div>
              <div className="flex-1">
                <h3 className={cn("font-bold text-lg", currentVariant.accent)}>
                  {title}
                </h3>
                <p className="text-gray-600 text-sm mt-1">{question}</p>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* User Info Section */}
            <div className="p-6 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {userInfo.image ? (
                  <img
                    src={userInfo.image}
                    alt={userInfo.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    <User className="w-6 h-6" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {userInfo.name}
                  </h4>

                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {userInfo.username && (
                      <span className="text-sm text-gray-500">
                        @{userInfo.username}
                      </span>
                    )}

                    {userInfo.type && (
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded-full font-medium capitalize",
                          userInfo.type === "musician" &&
                            "bg-blue-100 text-blue-700",
                          userInfo.type === "client" &&
                            "bg-green-100 text-green-700",
                          userInfo.type === "admin" &&
                            "bg-purple-100 text-purple-700"
                        )}
                      >
                        {userInfo.type}
                      </span>
                    )}

                    {userInfo.instrument && (
                      <span className="text-xs text-gray-500">
                        {userInfo.instrument}
                      </span>
                    )}

                    {userInfo.city && (
                      <span className="text-xs text-gray-500">
                        {userInfo.city}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 p-6">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="px-6 py-2.5 text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                {cancelText}
              </Button>

              <Button
                onClick={handleConfirm}
                className={cn(
                  "px-6 py-2.5 font-semibold transition-all duration-200",
                  currentVariant.confirmButton
                )}
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
