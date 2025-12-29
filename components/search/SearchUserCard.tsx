// components/search/SearchUserCard.tsx (FULLY RESPONSIVE)
"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  MapPin,
  Users,
  Briefcase,
  Mic,
  Sparkles,
  Eye,
  User,
  Star,
  Shield,
  Trophy,
  Zap,
  StarHalf,
} from "lucide-react";
import { UserProps } from "@/types/userTypes";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCheckTrial } from "@/hooks/useCheckTrial";
import FollowButton from "../pages/FollowButton";
import { OnlineBadge } from "../chat/OnlineBadge";
import ConfirmPrompt from "../ConfirmPrompt";
import { UserModal } from "./MainUserModal";
import { GiDjembe } from "react-icons/gi";
import { SearchUserCardSkeleton } from "../skeletons/SearchUserSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SearchUserCardProps {
  user: UserProps;
  isFeatured?: boolean;
}

// Helper function to get tier color
const getTierColor = (tier: string, isDarkMode: boolean) => {
  switch (tier) {
    case "elite":
      return isDarkMode
        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
        : "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
    case "trusted":
      return isDarkMode
        ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
        : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white";
    case "verified":
      return isDarkMode
        ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
        : "bg-gradient-to-r from-green-500 to-emerald-500 text-white";
    case "basic":
      return isDarkMode
        ? "bg-gradient-to-r from-yellow-600 to-orange-600 text-white"
        : "bg-gradient-to-r from-yellow-500 to-orange-500 text-white";
    default:
      return isDarkMode
        ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white"
        : "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
  }
};

// Helper function to get tier icon
const getTierIcon = (tier: string) => {
  switch (tier) {
    case "elite":
      return <Trophy className="w-3 h-3 md:w-3.5 md:h-3.5" />;
    case "trusted":
      return <Shield className="w-3 h-3 md:w-3.5 md:h-3.5" />;
    case "verified":
      return <Zap className="w-3 h-3 md:w-3.5 md:h-3.5" />;
    case "basic":
      return <Star className="w-3 h-3 md:w-3.5 md:h-3.5" />;
    default:
      return <Star className="w-3 h-3 md:w-3.5 md:h-3.5" />;
  }
};

// Responsive Star display component
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

  const starSize =
    size === "md" ? "w-4 h-4 md:w-4.5 md:h-4.5" : "w-3 h-3 md:w-3.5 md:h-3.5";
  const textSize =
    size === "md" ? "text-sm md:text-base" : "text-xs md:text-sm";

  return (
    <div className="flex items-center gap-0.5 md:gap-1">
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
          <StarHalf
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
      <span className={`ml-1 md:ml-1.5 font-medium ${textSize}`}>
        {stars.toFixed(1)}
      </span>
    </div>
  );
};

export function SearchUserCard({
  user,
  isFeatured = false,
}: SearchUserCardProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const { colors, isDarkMode } = useThemeColors();
  const { user: currentUser, isLoading } = useCurrentUser();
  const { isInGracePeriod } = useCheckTrial();
  const [isDataReady, setIsDataReady] = useState(false);

  // Extract trust data from user
  const trustScore = user.trustScore || 0;
  const trustStars = user.trustStars || 0.5;
  const trustTier = user.trustTier || "new";

  // Helper to convert score to tier if not already set
  const getTrustTier = (score: number): string => {
    if (score >= 80) return "elite";
    if (score >= 65) return "trusted";
    if (score >= 50) return "verified";
    if (score >= 30) return "basic";
    return "new";
  };

  const effectiveTier = trustTier || getTrustTier(trustScore);

  useEffect(() => {
    if (user?._id && currentUser?._id && !isLoading) {
      setIsDataReady(true);
    }
  }, [user, currentUser, isLoading]);

  const trackProfileView = useMutation(
    api.controllers.notifications.trackProfileView
  );

  const handleCardClick = async () => {
    setShowModal(true);

    if (currentUser?._id && user._id && currentUser._id !== user._id) {
      try {
        await trackProfileView({
          viewedUserDocId: user._id,
          viewerUserDocId: currentUser._id,
          isViewerInGracePeriod: isInGracePeriod,
        });
      } catch (error) {
        console.error("Failed to track profile view:", error);
      }
    }
  };

  const handleViewFullProfile = async () => {
    if (currentUser?._id && user._id && currentUser._id !== user._id) {
      try {
        const result = await trackProfileView({
          viewedUserDocId: user._id,
          viewerUserDocId: currentUser._id,
          isViewerInGracePeriod: isInGracePeriod,
        });

        if (result?.success) {
          router.push(`/search/${user.username}`);
        } else if (result?.reason === "already_viewed") {
          setShowPrompt(true);
        }
      } catch (error) {
        console.error("Failed to track profile view:", error);
        router.push(`/search/${user.username}`);
      }
    } else {
      router.push(`/search/${user.username}`);
    }
  };

  const getRoleDisplay = () => {
    if (user.isClient)
      return {
        text: "Client",
        icon: <Briefcase className="w-3 h-3 md:w-3.5 md:h-3.5" />,
      };
    if (user.roleType && user.instrument) {
      return {
        text: `${user.roleType}`,
        icon: <Users className="w-3 h-3 md:w-3.5 md:h-3.5" />,
      };
    }
    if (user.instrument)
      return {
        text: user.instrument,
        icon: <Users className="w-3 h-3 md:w-3.5 md:h-3.5" />,
      };
    if (user.roleType === "vocalist")
      return {
        text: "Vocalist",
        icon: <Mic className="w-3 h-3 md:w-3.5 md:h-3.5" />,
      };
    if (user.roleType === "dj")
      return {
        text: "DJ",
        icon: <GiDjembe className="w-3 h-3 md:w-3.5 md:h-3.5" />,
      };
    if (user.roleType === "mc")
      return {
        text: "MC",
        icon: <Mic className="w-3 h-3 md:w-3.5 md:h-3.5" />,
      };

    return {
      text: "Member",
      icon: <Users className="w-3 h-3 md:w-3.5 md:h-3.5" />,
    };
  };

  const userRole = getRoleDisplay();

  if (isLoading || !isDataReady) {
    return <SearchUserCardSkeleton isDarkMode={isDarkMode} />;
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          // Base styles
          "group relative rounded-2xl md:rounded-3xl p-4 md:p-6 cursor-pointer border transition-all duration-300",
          "flex flex-col h-full w-full",
          "min-h-[280px] sm:min-h-[300px] md:min-h-[320px] lg:min-h-[340px]",
          colors.card,
          colors.border,
          colors.hoverBg,
          "hover:shadow-xl md:hover:shadow-2xl",
          "active:scale-98",
          isFeatured &&
            "ring-1 md:ring-2 ring-purple-500/30 shadow-md md:shadow-lg"
        )}
        onClick={handleCardClick}
      >
        {/* Featured Badge - Responsive */}
        {isFeatured && (
          <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3 z-10">
            <div
              className={cn(
                "flex items-center gap-1 md:gap-1.5 px-2 py-1 md:px-3 md:py-1.5 rounded-full",
                "text-xs md:text-xs font-bold",
                "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
                "shadow-md md:shadow-lg"
              )}
            >
              <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5" />
              <span className="hidden xs:inline">Featured</span>
              <span className="xs:hidden">F</span>
            </div>
          </div>
        )}

        {/* Header Section - Responsive */}
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            {/* Avatar with Online Status */}
            <div className="relative flex-shrink-0">
              <div className="relative">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={`${user.firstname} ${user.lastname}`}
                    className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl object-cover border-2",
                      colors.border,
                      "shadow-md"
                    )}
                  />
                ) : (
                  <div
                    className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center",
                      "text-white font-bold text-base sm:text-lg shadow-md",
                      user.isClient
                        ? "bg-gradient-to-br from-blue-500 to-blue-600"
                        : "bg-gradient-to-br from-amber-500 to-orange-500"
                    )}
                  >
                    {user.firstname?.[0]}
                    {user.lastname?.[0]}
                  </div>
                )}
                <OnlineBadge
                  userId={user._id}
                  size="xs"
                  className="absolute -bottom-1 -right-1"
                />
              </div>
            </div>

            {/* Name and Username - Responsive */}
            <div className="min-w-0 flex-1">
              <h3
                className={cn(
                  "font-bold truncate",
                  "text-sm sm:text-base",
                  colors.text
                )}
              >
                {user.firstname} {user.lastname}
              </h3>
              <p
                className={cn(
                  "truncate",
                  "text-xs sm:text-sm",
                  colors.textMuted
                )}
              >
                @{user.username}
              </p>
            </div>
          </div>
        </div>

        {/* Trust Stars and Role Badge Row - Responsive Stacking */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 md:mb-4">
          {/* Trust Stars Display */}
          <div className="flex items-center gap-2">
            <StarDisplay stars={trustStars} size="sm" />
            {trustScore > 0 && (
              <Badge
                className={cn(
                  "px-2 py-1 text-xs font-semibold",
                  getTierColor(effectiveTier, isDarkMode)
                )}
              >
                <div className="flex items-center gap-1">
                  {getTierIcon(effectiveTier)}
                  <span className="hidden xs:inline capitalize">
                    {effectiveTier}
                  </span>
                  <span className="xs:hidden capitalize text-xs">
                    {effectiveTier === "elite"
                      ? "E"
                      : effectiveTier === "trusted"
                        ? "T"
                        : effectiveTier === "verified"
                          ? "V"
                          : effectiveTier === "basic"
                            ? "B"
                            : "N"}
                  </span>
                </div>
              </Badge>
            )}
          </div>

          {/* Role Badge */}
          <Badge
            variant="secondary"
            className={cn(
              "inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5",
              "rounded-full text-xs font-semibold w-fit",
              user.isClient ? colors.infoBg : colors.warningBg,
              user.isClient ? colors.infoText : colors.warningText
            )}
          >
            {userRole.icon}
            <span className="truncate max-w-[80px] sm:max-w-none">
              {userRole.text}
            </span>
          </Badge>
        </div>

        {/* Location and Mini Stats - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 md:mb-4">
          {user.city && (
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg w-fit",
                colors.secondaryBackground,
                colors.textMuted
              )}
            >
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[120px] sm:max-w-none">
                {user.city}
              </span>
            </div>
          )}

          {/* Mini Stats - Responsive Grid */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-center">
              <div className={cn("font-bold text-xs sm:text-sm", colors.text)}>
                {user.followers?.length || 0}
              </div>
              <div className={cn("text-[10px] sm:text-xs", colors.textMuted)}>
                Followers
              </div>
            </div>
            <div className="text-center">
              <div className={cn("font-bold text-xs sm:text-sm", colors.text)}>
                {user.completedGigsCount || 0}
              </div>
              <div className={cn("text-[10px] sm:text-xs", colors.textMuted)}>
                Gigs
              </div>
            </div>
            <div className="text-center hidden xs:block">
              <div
                className={cn(
                  "font-bold text-xs sm:text-sm flex items-center gap-1",
                  colors.text
                )}
              >
                <Eye className="w-3 h-3" />
                {user?.profileViews?.totalCount || 0}
              </div>
              <div className={cn("text-[10px] sm:text-xs", colors.textMuted)}>
                Views
              </div>
            </div>
          </div>
        </div>

        {/* Bio - Responsive */}
        {(user.talentbio || user?.bookerBio) && (
          <div className="mb-3 md:mb-4 flex-1">
            <p
              className={cn(
                "leading-relaxed line-clamp-2",
                "text-[10px] xs:text-xs sm:text-sm",
                colors.textMuted
              )}
            >
              {user.talentbio || user?.bookerBio}
            </p>
          </div>
        )}

        {/* Trust Score Progress Bar - Responsive */}
        {trustScore > 0 && (
          <div className="mb-3 md:mb-4">
            <div className="flex items-center justify-between mb-1">
              <div className={cn("text-xs font-medium", colors.text)}>
                Trust Score
              </div>
              <div className={cn("text-xs font-bold", colors.text)}>
                {trustScore}/100
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 md:h-2">
              <div
                className="h-1.5 md:h-2 rounded-full bg-gradient-to-r from-green-400 via-blue-400 to-purple-500 transition-all duration-500"
                style={{ width: `${trustScore}%` }}
              />
            </div>
          </div>
        )}

        {/* Verification Badges - Responsive */}
        {(user.verified || user.mpesaPhoneNumber) && (
          <div className="mb-3 md:mb-4 flex flex-wrap gap-1 md:gap-2">
            {user.verified && (
              <Badge
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-0.5 md:px-2 md:py-1 text-xs"
                variant="default"
              >
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span className="hidden xs:inline">Verified</span>
                  <span className="xs:hidden">✓</span>
                </div>
              </Badge>
            )}
            {user.mpesaPhoneNumber && (
              <Badge
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-0.5 md:px-2 md:py-1 text-xs"
                variant="default"
              >
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span className="hidden xs:inline">MPESA</span>
                  <span className="xs:hidden">M</span>
                </div>
              </Badge>
            )}
          </div>
        )}

        {/* Action Buttons - Responsive */}
        <div className="mt-auto flex flex-col xs:flex-row gap-2">
          <div className="flex-1 w-full" onClick={(e) => e.stopPropagation()}>
            <FollowButton
              _id={user._id}
              pendingFollowRequests={user.pendingFollowRequests}
              targetUserFollowings={user.followings}
              className={cn(
                "w-full rounded-xl py-2.5 text-sm font-semibold transition-all duration-300",
                "text-white shadow-lg hover:shadow-xl active:scale-95",
                "flex items-center justify-center gap-2"
              )}
              variant="default"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className={cn(
              "rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-300",
              "flex items-center justify-center gap-1.5",
              "w-full xs:w-auto",
              colors.border,
              colors.text,
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              "active:scale-95"
            )}
            onClick={(e) => {
              e.stopPropagation();
              handleViewFullProfile();
            }}
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Profile</span>
            <span className="sm:hidden">View</span>
          </Button>
        </div>
      </motion.div>

      {/* User Modal */}
      {showModal && (
        <UserModal
          user={{
            _id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            picture: user.picture,
            isClient: user.isClient,
            bio: user.bio,
            city: user.city,
            organization: user.organization,
            email: user.email,
            completedGigsCount: user.completedGigsCount,
            followers: user.followers,
            isFeatured: isFeatured,
            viewCount: user.profileViews?.totalCount || 0,
            trustScore: trustScore,
            trustStars: trustStars,
            trustTier: effectiveTier,
            verified: user.verified,
          }}
          userRole={userRole}
          onClose={() => setShowModal(false)}
          onProfileClick={handleViewFullProfile}
        />
      )}

      {/* Confirm Prompt for already viewed profile */}
      <ConfirmPrompt
        isOpen={showPrompt}
        onClose={() => setShowPrompt(false)}
        onConfirm={() => router.push(`/search/${user.username}`)}
        onCancel={() => null}
        title="View Profile"
        question="Already viewed this Profile"
        userInfo={{
          id: user._id,
          name: user.firstname + " " + user.lastname,
          username: user.username,
          image: user.picture,
          type: user.isMusician ? "musician" : "client",
          instrument: user.instrument,
          city: user.city,
          trustStars: trustStars,
          trustTier: effectiveTier,
        }}
        confirmText="Yes, Proceed"
        cancelText="No, Thanks"
        variant="info"
      />
    </>
  );
}
