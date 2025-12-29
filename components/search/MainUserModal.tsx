// components/user/MainUserModal.tsx (UPDATED WITH TRUST SCORE & RESPONSIVENESS)
"use client";

import { motion } from "framer-motion";
import {
  X,
  Crown,
  Sparkles,
  ArrowRight,
  Star,
  Shield,
  Trophy,
  Zap,
  MapPin,
  Briefcase,
  Mail,
  Eye,
  Users,
  CheckCircle,
  CreditCard,
} from "lucide-react";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { ChatIcon } from "../chat/ChatIcon";
import { OnlineBadge } from "../chat/OnlineBadge";
import { Button } from "@/components/ui/button";

interface UserModalProps {
  user: {
    _id: string;
    firstname?: string;
    lastname?: string;
    username?: string;
    picture?: string;
    isClient: boolean;
    bio?: string;
    city?: string;
    organization?: string;
    email?: string;
    completedGigsCount?: number;
    followers?: any[];
    isFeatured: boolean;
    viewCount: number;
    trustScore?: number;
    trustStars?: number;
    trustTier?: string;
    verified?: boolean;
    mpesaPhoneNumber?: boolean;
  };
  userRole: {
    text: string;
    icon: React.ReactNode;
  };
  onClose: () => void;
  onProfileClick: () => void;
}

// Star display component
const StarDisplay = ({
  stars,
  size = "sm",
}: {
  stars: number;
  size?: "sm" | "md";
}) => {
  const fullStars = Math.floor(stars);
  const hasHalfStar = stars % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const starSize = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className={`${starSize} fill-yellow-400 text-yellow-400`}
          fill="currentColor"
        />
      ))}
      {hasHalfStar && (
        <div className="relative">
          <Star className={`${starSize} text-gray-300`} fill="currentColor" />
          <Star
            className={`${starSize} absolute left-0 top-0 fill-yellow-400 text-yellow-400`}
            fill="currentColor"
          />
        </div>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star
          key={`empty-${i}`}
          className={`${starSize} text-gray-300`}
          fill="none"
        />
      ))}
    </div>
  );
};

// Trust tier badge
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
    <div
      className={cn(
        "px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5",
        getTierColor(effectiveTier)
      )}
    >
      {getTierIcon(effectiveTier)}
      <span className="capitalize">{effectiveTier}</span>
      {score && <span className="ml-1 text-xs opacity-90">{score}/100</span>}
    </div>
  );
};

export function UserModal({
  user,
  userRole,
  onClose,
  onProfileClick,
}: UserModalProps) {
  const { colors, isDarkMode } = useThemeColors();

  // Safe value getters with fallbacks
  const safeFirstname = user.firstname || "Unknown";
  const safeLastname = user.lastname || "User";
  const safeUsername = user.username || "unknown";
  const safeCompletedGigsCount = user.completedGigsCount || 0;
  const safeFollowersCount = user.followers?.length || 0;
  const trustScore = user.trustScore || 0;
  const trustStars = user.trustStars || 0.5;
  const trustTier = user.trustTier || "new";

  const getModalBackground = () => {
    return isDarkMode
      ? "bg-gray-900 border-gray-800"
      : "bg-white border-gray-200";
  };

  const getSecondaryBackground = () => {
    return isDarkMode
      ? "bg-gray-800/50 border-gray-700"
      : "bg-gray-50 border-gray-100";
  };

  const getRoleBadgeStyles = () => {
    const baseStyles =
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors";

    if (user.isClient) {
      return cn(
        baseStyles,
        isDarkMode
          ? "bg-blue-900/30 text-blue-300 border-blue-700/30"
          : "bg-blue-100 text-blue-800 border-blue-200"
      );
    } else {
      return cn(
        baseStyles,
        isDarkMode
          ? "bg-amber-900/30 text-amber-300 border-amber-700/30"
          : "bg-amber-100 text-amber-800 border-amber-200"
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 backdrop-blur-sm",
          isDarkMode ? "bg-black/60" : "bg-black/40"
        )}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "relative rounded-xl md:rounded-2xl w-full max-w-2xl mx-auto border shadow-2xl backdrop-blur-md",
          getModalBackground(),
          "shadow-black/20"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={cn(
            "p-4 sm:p-6 border-b rounded-t-xl md:rounded-t-2xl",
            getSecondaryBackground()
          )}
        >
          <div className="flex items-center justify-between">
            <h2
              className={cn(
                "text-lg sm:text-xl font-semibold truncate",
                isDarkMode ? "text-white" : "text-gray-900"
              )}
            >
              Profile Preview
            </h2>
            <button
              onClick={onClose}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                "hover:bg-opacity-20",
                isDarkMode
                  ? "hover:bg-white/10 text-gray-300 hover:text-white"
                  : "hover:bg-gray-200 text-gray-600 hover:text-gray-900"
              )}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="max-h-[80vh] md:max-h-[70vh] overflow-y-auto">
          <div className="p-4 sm:p-6">
            {/* User Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {user.picture ? (
                  <div className="relative">
                    <img
                      src={user.picture}
                      alt={`${safeFirstname} ${safeLastname}`}
                      className={cn(
                        "w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl object-cover border-2 shadow-lg",
                        isDarkMode ? "border-gray-600" : "border-gray-200",
                        user.isFeatured && "ring-2 ring-purple-500/50"
                      )}
                    />
                    <OnlineBadge
                      userId={user._id}
                      size="md"
                      className="absolute -bottom-1 -right-1"
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <div
                      className={cn(
                        "w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center",
                        "text-white font-bold text-xl sm:text-2xl shadow-lg border-2",
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
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                {/* Name and Username */}
                <div className="flex items-center gap-2 mb-2">
                  <h3
                    className={cn(
                      "font-semibold text-lg sm:text-xl truncate",
                      isDarkMode ? "text-white" : "text-gray-900"
                    )}
                  >
                    {safeFirstname} {safeLastname}
                  </h3>
                  {user.isFeatured && (
                    <Sparkles
                      size={16}
                      className="text-purple-500 flex-shrink-0"
                    />
                  )}
                </div>

                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <p
                    className={cn(
                      "text-sm truncate",
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    @{safeUsername}
                  </p>
                  <OnlineBadge userId={user._id} size="sm" showText={true} />
                </div>

                {/* Role and Trust Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={getRoleBadgeStyles()}>
                    {userRole.icon}
                    {userRole.text}
                  </span>

                  {user.isFeatured && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
                        "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      )}
                    >
                      <Crown size={10} />
                      Featured
                    </span>
                  )}

                  {/* Trust Score Badge */}
                  {trustScore > 0 && (
                    <TrustTierBadge tier={trustTier} score={trustScore} />
                  )}
                </div>

                {/* Trust Stars Display */}
                {trustScore > 0 && (
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1.5">
                      <StarDisplay stars={trustStars} size="md" />
                      <span className="text-sm font-medium">
                        {trustStars.toFixed(1)} stars
                      </span>
                    </div>

                    {/* Verification Badges */}
                    <div className="flex items-center gap-2">
                      {user.verified && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded-full">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">
                            Verified
                          </span>
                        </div>
                      )}
                      {user.mpesaPhoneNumber && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 rounded-full">
                          <CreditCard className="w-3 h-3 text-blue-500" />
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                            MPESA
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Trust Score Progress Bar */}
                {trustScore > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Trust Score
                      </span>
                      <span className="text-xs font-bold">
                        {trustScore}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-green-400 via-blue-400 to-purple-500 transition-all duration-500"
                        style={{ width: `${trustScore}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bio Section */}
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
                  <Eye size={14} />
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
                  <MapPin className="flex-shrink-0" size={16} />
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
                  <Briefcase className="flex-shrink-0" size={16} />
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
                  <Mail className="flex-shrink-0" size={16} />
                  <span className="text-sm truncate">{user.email}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <ChatIcon
                userId={user._id}
                variant="secondary"
                showText={true}
                className="w-full sm:w-auto justify-center"
                showPulse={true}
              />
              <Button
                onClick={onProfileClick}
                size="sm"
                className={cn(
                  "w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium",
                  "transition-all duration-200 flex items-center justify-center gap-2",
                  "bg-gradient-to-r from-blue-500 to-purple-600 text-white",
                  "hover:from-blue-600 hover:to-purple-700 hover:shadow-lg",
                  "hover:scale-[1.02] active:scale-[0.98]"
                )}
              >
                View Full Profile
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
