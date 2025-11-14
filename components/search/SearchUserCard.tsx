// components/search/SearchUserCard.tsx (MODERN - THEME ONLY)
"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MapPin, Users, Briefcase, Mic, Sparkles, Eye } from "lucide-react";
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

interface SearchUserCardProps {
  user: UserProps;
  isFeatured?: boolean;
}

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

  useEffect(() => {
    if (user?._id && currentUser?._id && !isLoading) {
      setIsDataReady(true);
    }
  }, [user, currentUser, isLoading]);

  const trackProfileView = useMutation(
    api.controllers.notifications.trackProfileView
  );

  const handleProfileClick = async () => {
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
    if (user.isClient) return { text: "Client", icon: <Briefcase size={14} /> };
    if (user.roleType && user.instrument) {
      return {
        text: `${user.roleType}`,
        icon: <Users size={14} />,
      };
    }
    if (user.instrument)
      return { text: user.instrument, icon: <Users size={14} /> };
    if (user.roleType === "vocalist")
      return { text: "Vocalist", icon: <Mic size={14} /> };
    if (user.roleType === "dj")
      return { text: "DJ", icon: <GiDjembe size={14} /> };
    if (user.roleType === "mc") return { text: "MC", icon: <Mic size={14} /> };

    return { text: "Member", icon: <Users size={14} /> };
  };

  const userRole = getRoleDisplay();

  if (isLoading || !isDataReady) {
    return <SearchUserCardSkeleton isDarkMode={isDarkMode} />;
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "group relative rounded-3xl p-6 cursor-pointer border transition-all duration-500",
          "flex flex-col h-full", // ← Add these
          "min-h-[320px]", // ← Set a minimum height
          colors.card,
          colors.border,
          colors.hoverBg,
          "hover:shadow-2xl",
          isFeatured && "ring-2 ring-purple-500/30 shadow-lg"
        )}
        onClick={handleProfileClick}
      >
        {/* Featured Badge */}
        {isFeatured && (
          <div className="absolute -top-3 -right-3 z-10">
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold",
                "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
                "shadow-lg"
              )}
            >
              <Sparkles size={12} />
              <span>Featured</span>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Avatar with Online Status */}
            <div className="relative">
              <div className="relative">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={`${user.firstname} ${user.lastname}`}
                    className={cn(
                      "w-12 h-12 rounded-2xl object-cover border-2 shadow-lg",
                      colors.border
                    )}
                  />
                ) : (
                  <div
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg",
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
                  size="sm"
                  className="absolute -bottom-1 -right-1"
                />
              </div>
            </div>

            {/* Name and Username */}
            <div className="min-w-0">
              <h3 className={cn("font-bold text-base truncate", colors.text)}>
                {user.firstname} {user.lastname}
              </h3>
              <p className={cn("text-sm truncate", colors.textMuted)}>
                @{user.username}
              </p>
            </div>
          </div>
        </div>

        {/* Role Badge and Location */}
        <div className="flex items-center justify-between mb-4">
          <Badge
            variant="secondary"
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold",
              user.isClient ? colors.infoBg : colors.warningBg,
              user.isClient ? colors.infoText : colors.warningText
            )}
          >
            {userRole.icon}
            {userRole.text}
          </Badge>

          {user.city && (
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg",
                colors.secondaryBackground,
                colors.textMuted
              )}
            >
              <MapPin size={12} />
              {user.city}
            </div>
          )}
        </div>

        {/* Bio */}
        {user.talentbio ||
          (user?.bookerBio && (
            <div className="mb-4">
              <p
                className={cn(
                  "text-[9px] leading-relaxed line-clamp-2",
                  colors.textMuted
                )}
              >
                {user.talentbio ? user.talentbio : user?.bookerBio}
              </p>
            </div>
          ))}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div
            className={cn(
              "text-center p-2 rounded-xl",
              colors.backgroundSecondary,
              colors.borderSecondary
            )}
          >
            <div className={cn("font-bold text-sm", colors.text)}>
              {user.followers?.length || 0}
            </div>
            <div className={cn("text-xs", colors.textMuted)}>Followers</div>
          </div>

          <div
            className={cn(
              "text-center p-2 rounded-xl",
              colors.backgroundSecondary,
              colors.borderSecondary
            )}
          >
            <div className={cn("font-bold text-sm", colors.text)}>
              {user.completedGigsCount || 0}
            </div>
            <div className={cn("text-xs", colors.textMuted)}>Gigs</div>
          </div>

          <div
            className={cn(
              "text-center p-2 rounded-xl",
              colors.backgroundSecondary,
              colors.borderSecondary
            )}
          >
            <div className="flex items-center justify-center gap-1">
              <Eye size={12} className={colors.textMuted} />
              <div className={cn("font-bold text-sm", colors.text)}>
                {user?.profileViews?.totalCount || 0}
              </div>
            </div>
            <div className={cn("text-xs", colors.textMuted)}>Views</div>
          </div>
        </div>

        {/* Follow Button - Always at bottom */}
        <div
          className="mt-auto" // ← This pushes the button to the bottom
          onClick={(e) => e.stopPropagation()}
        >
          <FollowButton
            _id={user._id}
            pendingFollowRequests={user.pendingFollowRequests}
            targetUserFollowings={user.followings}
            className={cn(
              "w-full rounded-xl py-2.5 text-sm font-semibold transition-all duration-300",

              "text-white shadow-lg hover:shadow-xl hover:scale-105"
            )}
            variant="default"
          />
        </div>
      </motion.div>
      {/* Modal */}
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
          }}
          userRole={userRole}
          onClose={() => setShowModal(false)}
          onProfileClick={handleProfileClick}
        />
      )}
      {/* Confirm Prompt */}
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
        }}
        confirmText="Yes, Proceed"
        cancelText="No, Thanks"
        variant="info"
      />
    </>
  );
}

export default SearchUserCard;
