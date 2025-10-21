// components/user/MainUserModal.tsx
"use client";

import { motion } from "framer-motion";
import { X, Crown, Sparkles, ArrowRight } from "lucide-react";
import { FiMapPin, FiBriefcase, FiMail, FiEye } from "react-icons/fi";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { ChatIcon } from "../chat/ChatIcon";
import { OnlineBadge } from "../chat/OnlineBadge";

interface UserModalProps {
  user: {
    _id: string;
    firstname?: string; // Make optional
    lastname?: string; // Make optional
    username?: string; // Make optional
    picture?: string;
    isClient: boolean;
    bio?: string;
    city?: string;
    organization?: string;
    email?: string;
    completedGigsCount?: number; // Make optional
    followers?: any[]; // Make optional
    isFeatured: boolean;
    viewCount: number;
  };
  userRole: {
    text: string;
    icon: React.ReactNode;
  };
  onClose: () => void;
  onProfileClick: () => void;
}

export function UserModal({
  user,
  userRole,
  onClose,
  onProfileClick,
}: UserModalProps) {
  const { colors, isDarkMode } = useThemeColors();

  const getModalBackground = () => {
    return isDarkMode
      ? "bg-gray-800 border-gray-700"
      : "bg-white border-gray-200";
  };

  const getSecondaryBackground = () => {
    return isDarkMode
      ? "bg-gray-700/50 border-gray-600"
      : "bg-gray-100 border-gray-200";
  };

  const getRoleBadgeStyles = () => {
    const baseStyles =
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors";

    if (user.isClient) {
      return cn(
        baseStyles,
        isDarkMode
          ? "bg-blue-900/40 text-blue-300 border-blue-700/50 hover:bg-blue-900/60"
          : "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
      );
    } else {
      return cn(
        baseStyles,
        isDarkMode
          ? "bg-amber-900/40 text-amber-300 border-amber-700/50 hover:bg-amber-900/60"
          : "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200"
      );
    }
  };

  // Safe value getters with fallbacks
  const safeFirstname = user.firstname || "Unknown";
  const safeLastname = user.lastname || "User";
  const safeUsername = user.username || "unknown";
  const safeCompletedGigsCount = user.completedGigsCount || 0;
  const safeFollowersCount = user.followers?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 "
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 backdrop-blur-sm",
          isDarkMode ? "bg-black/50" : "bg-black/30"
        )}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "relative rounded-2xl w-[86%] md:max-w-md mx-auto border shadow-lg backdrop-blur-md",
          getModalBackground(),
          "shadow-black/10"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={cn("p-6 border-b rounded-t-2xl", getSecondaryBackground())}
        >
          <div className="flex items-center justify-between">
            <h2
              className={cn(
                "text-lg font-semibold",
                isDarkMode ? "text-white" : "text-gray-900"
              )}
            >
              Profile Details
            </h2>
            <button
              onClick={onClose}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                "hover:bg-opacity-20",
                isDarkMode
                  ? "hover:bg-white text-gray-400"
                  : "hover:bg-gray-200 text-gray-600"
              )}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* User Header */}
          <div className="flex items-center gap-4 mb-6">
            {user.picture ? (
              <div className="relative">
                <img
                  src={user.picture}
                  alt={`${safeFirstname} ${safeLastname}`}
                  className={cn(
                    "w-16 h-16 rounded-xl object-cover border shadow-sm",
                    isDarkMode ? "border-gray-600" : "border-gray-200",
                    user.isFeatured && "ring-2 ring-purple-500/50"
                  )}
                />
                <OnlineBadge
                  userId={user._id}
                  size="md"
                  className="absolute -bottom-1 -right-1"
                />
                <div
                  className={cn(
                    "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2",
                    user.isClient
                      ? "bg-blue-500 border-white dark:border-gray-800"
                      : "bg-amber-500 border-white dark:border-gray-800",
                    user.isFeatured && "ring-1 ring-white"
                  )}
                />
              </div>
            ) : (
              <div className="relative">
                <div
                  className={cn(
                    "w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm border",
                    "bg-gradient-to-br",
                    user.isClient
                      ? "from-blue-500 to-blue-600 border-blue-400"
                      : "from-amber-500 to-amber-600 border-amber-400",
                    user.isFeatured && "ring-2 ring-purple-500/50"
                  )}
                >
                  {safeFirstname?.[0]}
                  {safeLastname?.[0]}
                </div>
                <OnlineBadge
                  userId={user._id}
                  size="md"
                  className="absolute -bottom-1 -right-1"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className={cn(
                    "font-semibold text-lg",
                    isDarkMode ? "text-white" : "text-gray-900"
                  )}
                >
                  {safeFirstname} {safeLastname}
                </h3>
                {user.isFeatured && (
                  <Sparkles size={16} className="text-purple-500" />
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <p
                  className={cn(
                    "text-sm",
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  @{safeUsername}
                </p>
                <OnlineBadge userId={user._id} size="sm" showText={true} />
              </div>
              <div className="flex items-center gap-2">
                <span className={getRoleBadgeStyles()}>
                  {userRole.icon}
                  {userRole.text}
                </span>
                {user.isFeatured && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
                      "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    )}
                  >
                    <Crown size={10} />
                    Featured
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <div
              className={cn(
                "text-sm leading-relaxed mb-6 p-4 rounded-lg",
                getSecondaryBackground(),
                isDarkMode ? "text-gray-300" : "text-gray-700"
              )}
            >
              {user.bio}
            </div>
          )}

          {/* Key Metrics */}
          <div
            className={cn(
              "grid grid-cols-3 gap-3 mb-6 p-4 rounded-xl border",
              getSecondaryBackground()
            )}
          >
            <div className="text-center">
              <div
                className={cn(
                  "font-bold text-xl mb-1",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}
              >
                {safeCompletedGigsCount}
              </div>
              <div
                className={cn(
                  "text-xs font-medium",
                  isDarkMode ? "text-gray-500" : "text-gray-600"
                )}
              >
                Gigs
              </div>
            </div>
            <div className="text-center">
              <div
                className={cn(
                  "font-bold text-xl mb-1",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}
              >
                {safeFollowersCount}
              </div>
              <div
                className={cn(
                  "text-xs font-medium",
                  isDarkMode ? "text-gray-500" : "text-gray-600"
                )}
              >
                Followers
              </div>
            </div>
            <div className="text-center">
              <div
                className={cn(
                  "font-bold text-xl mb-1 flex items-center justify-center gap-1",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}
              >
                <FiEye size={14} />
                {user.viewCount || 0}
              </div>
              <div
                className={cn(
                  "text-xs font-medium",
                  isDarkMode ? "text-gray-500" : "text-gray-600"
                )}
              >
                Views
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-3 mb-6">
            {user.city && (
              <div
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg",
                  getSecondaryBackground(),
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}
              >
                <FiMapPin className="flex-shrink-0" size={16} />
                <span className="text-sm">Based in {user.city}</span>
              </div>
            )}

            {user.organization && user.isClient && (
              <div
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg",
                  getSecondaryBackground(),
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}
              >
                <FiBriefcase className="flex-shrink-0" size={16} />
                <span className="text-sm">{user.organization}</span>
              </div>
            )}

            {user.email && (
              <div
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg",
                  getSecondaryBackground(),
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}
              >
                <FiMail className="flex-shrink-0" size={16} />
                <span className="text-sm truncate">{user.email}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 items-center justify-between">
            <ChatIcon
              userId={user._id}
              variant="secondary"
              showText={true}
              className="flex-1 justify-center"
              showPulse={true}
            />
            <button
              onClick={onProfileClick}
              className={cn(
                "py-2.5 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-between",
                "bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md",
                "hover:scale-105 active:scale-95"
              )}
            >
              View Profile <ArrowRight />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
