// components/ConfirmPrompt.tsx (UPDATED WITH RESPONSIVENESS & TRUST SCORE)
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
  Star,
  Shield,
  Trophy,
  Zap,
  MapPin,
  Music,
  Briefcase,
} from "lucide-react";

interface UserInfo {
  id: string;
  name: string;
  username?: string;
  image?: string;
  type?: "musician" | "client" | "admin" | "booker";
  instrument?: string;
  city?: string;
  trustStars?: number;
  trustTier?: string;
  trustScore?: number;
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
  showTrustScore?: boolean;
}

// Star display component
const StarDisplay = ({ stars }: { stars: number }) => {
  const fullStars = Math.floor(stars);
  const hasHalfStar = stars % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400"
          fill="currentColor"
        />
      ))}
      {hasHalfStar && (
        <div className="relative">
          <Star className="w-3.5 h-3.5 text-gray-300" fill="currentColor" />
          <Star
            className="w-3.5 h-3.5 absolute left-0 top-0 fill-yellow-400 text-yellow-400"
            fill="currentColor"
          />
        </div>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star
          key={`empty-${i}`}
          className="w-3.5 h-3.5 text-gray-300"
          fill="none"
        />
      ))}
      <span className="ml-1.5 text-sm font-medium">{stars.toFixed(1)}</span>
    </div>
  );
};

// Helper function to get tier badge
const TrustTierBadge = ({ tier, score }: { tier?: string; score?: number }) => {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case "elite":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
      case "trusted":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white";
      case "verified":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white";
      case "basic":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "elite":
        return <Trophy className="w-3 h-3" />;
      case "trusted":
        return <Shield className="w-3 h-3" />;
      case "verified":
        return <Zap className="w-3 h-3" />;
      case "basic":
        return <Star className="w-3 h-3" />;
      default:
        return <Star className="w-3 h-3" />;
    }
  };

  const effectiveTier =
    tier ||
    (score
      ? score >= 80
        ? "elite"
        : score >= 65
          ? "trusted"
          : score >= 50
            ? "verified"
            : score >= 30
              ? "basic"
              : "new"
      : "new");

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1",
          getTierColor(effectiveTier)
        )}
      >
        {getTierIcon(effectiveTier)}
        <span className="capitalize">{effectiveTier}</span>
      </div>
      {score && (
        <div className="text-xs font-medium text-gray-500">
          Score: {score}/100
        </div>
      )}
    </div>
  );
};

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
  showTrustScore = true,
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
      icon: <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />,
      confirmButton: "bg-blue-600 hover:bg-blue-700 text-white",
      accent: "text-blue-600",
    },
    warning: {
      icon: <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />,
      confirmButton: "bg-amber-600 hover:bg-amber-700 text-white",
      accent: "text-amber-600",
    },
    info: {
      icon: <Info className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />,
      confirmButton: "bg-blue-600 hover:bg-blue-700 text-white",
      accent: "text-blue-600",
    },
    success: {
      icon: <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />,
      confirmButton: "bg-green-600 hover:bg-green-700 text-white",
      accent: "text-green-600",
    },
  };

  const sizeConfig = {
    sm: "max-w-sm sm:max-w-md",
    md: "max-w-md sm:max-w-lg",
    lg: "max-w-lg sm:max-w-xl",
  };

  const currentVariant = variantConfig[variant];
  const currentSize = sizeConfig[size];

  // Get type icon
  const getTypeIcon = (type?: string) => {
    switch (type) {
      case "musician":
        return <Music className="w-3.5 h-3.5" />;
      case "client":
        return <Briefcase className="w-3.5 h-3.5" />;
      case "booker":
        return <User className="w-3.5 h-3.5" />;
      default:
        return <User className="w-3.5 h-3.5" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
            className={cn(
              "fixed left-1/2 top-1/2 z-[10000] -translate-x-1/2 -translate-y-1/2",
              "bg-white dark:bg-gray-900 rounded-xl shadow-2xl border",
              "border-gray-200 dark:border-gray-700",
              "w-[calc(100%-2rem)] sm:w-auto",
              currentSize
            )}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex-shrink-0">{currentVariant.icon}</div>
              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    "font-bold text-base sm:text-lg truncate",
                    currentVariant.accent
                  )}
                >
                  {title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1 truncate">
                  {question}
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
              </button>
            </div>

            {/* User Info Section */}
            <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {userInfo.image ? (
                    <div className="relative">
                      <img
                        src={userInfo.image}
                        alt={userInfo.name}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border-2 border-white dark:border-gray-800 shadow-sm"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-sm">
                      <User className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                  )}
                </div>

                {/* User Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg truncate">
                    {userInfo.name}
                  </h4>

                  {/* User Metadata */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {userInfo.username && (
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        @{userInfo.username}
                      </span>
                    )}

                    {userInfo.type && (
                      <div
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium capitalize",
                          userInfo.type === "musician" &&
                            "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
                          userInfo.type === "client" &&
                            "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
                          userInfo.type === "booker" &&
                            "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
                          userInfo.type === "admin" &&
                            "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        )}
                      >
                        {getTypeIcon(userInfo.type)}
                        {userInfo.type}
                      </div>
                    )}

                    {userInfo.instrument && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-400">
                        <Music className="w-3 h-3" />
                        {userInfo.instrument}
                      </span>
                    )}

                    {userInfo.city && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-400">
                        <MapPin className="w-3 h-3" />
                        {userInfo.city}
                      </span>
                    )}
                  </div>

                  {/* Trust Score Display */}
                  {showTrustScore &&
                    (userInfo.trustStars || userInfo.trustScore) && (
                      <div className="mt-3 sm:mt-4 space-y-2">
                        {userInfo.trustStars && (
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              Trust Rating:
                            </span>
                            <div className="flex items-center gap-2">
                              <StarDisplay stars={userInfo.trustStars} />
                              <TrustTierBadge
                                tier={userInfo.trustTier}
                                score={userInfo.trustScore}
                              />
                            </div>
                          </div>
                        )}

                        {/* Trust Score Progress Bar */}
                        {userInfo.trustScore && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Trust Score Progress
                              </span>
                              <span className="text-xs font-medium">
                                {userInfo.trustScore}/100
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div
                                className="h-1.5 rounded-full bg-gradient-to-r from-green-400 via-blue-400 to-purple-500"
                                style={{ width: `${userInfo.trustScore}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6">
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className={cn(
                  "w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2.5",
                  "text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600",
                  "hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                {cancelText}
              </Button>

              <Button
                onClick={handleConfirm}
                size="sm"
                className={cn(
                  "w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2.5 font-semibold",
                  "transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
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
