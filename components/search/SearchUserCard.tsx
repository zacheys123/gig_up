// components/search/SearchUserCard.tsx (UPDATED)
"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiMapPin,
  FiUsers,
  FiBriefcase,
  FiMoreVertical,
  FiEye,
} from "react-icons/fi";
import { Mic, Sparkles } from "lucide-react";
import { UserProps } from "@/types/userTypes";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCheckTrial } from "@/hooks/useCheckTrial";
import { ChatIcon } from "../chat/ChatIcon";
import FollowButton from "../pages/FollowButton";
import { OnlineBadge } from "../chat/OnlineBadge";

import ConfirmPrompt from "../ConfirmPrompt";
import { UserModal } from "./MainUserModal";
import { GiDjembe } from "react-icons/gi";
import { SearchUserCardSkeleton } from "../skeletons/SearchUserSkeleton";

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
  const { isDarkMode } = useThemeColors();
  const { user: currentUser, isLoading } = useCurrentUser();
  const { isInGracePeriod } = useCheckTrial();
  const [isDataReady, setIsDataReady] = useState(false);

  // Wait for user data to be fully loaded
  useEffect(() => {
    if (user?._id && currentUser?._id && !isLoading) {
      setIsDataReady(true);
    }
  }, [user, currentUser, isLoading]);

  // KEEP YOUR CONVEX TRACKING

  const trackProfileView = useMutation(
    api.controllers.notifications.trackProfileView
  );

  // In SearchUserCard.tsx - fix the handleProfileClick function
  const handleProfileClick = async () => {
    // FIXED: Use currentUser from props/store instead of useAuth
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

  const handleModalOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(true);
  };

  const getRoleDisplay = () => {
    if (user.isClient)
      return { text: "Client", icon: <FiBriefcase size={12} /> };
    if (user.roleType && user.instrument) {
      return {
        text: `${user.instrument} ${user.roleType}`,
        icon: <FiUsers size={12} />,
      };
    }
    if (user.instrument)
      return { text: user.instrument, icon: <FiUsers size={12} /> };
    if (user.roleType === "vocalist")
      return { text: "Vocalist", icon: <Mic size={12} /> };
    if (user.roleType === "dj")
      return { text: "Deejay", icon: <GiDjembe size={12} /> };
    if (user.roleType === "mc")
      return { text: "Emcee", icon: <Mic size={12} /> };

    return { text: "Client", icon: <FiUsers size={12} /> };
  };

  const userRole = getRoleDisplay();

  if (isLoading || !isDataReady) {
    return <SearchUserCardSkeleton isDarkMode={isDarkMode} />;
  }
  return (
    <>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "group relative rounded-2xl p-5 cursor-pointer border backdrop-blur-sm transition-all duration-300",
          isDarkMode
            ? "bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-700/50"
            : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50",
          isFeatured && "ring-1 ring-purple-500/30"
        )}
        onClick={handleProfileClick}
      >
        {/* Featured Badge */}
        {isFeatured && (
          <div className="absolute -top-2 -right-2 z-10">
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
                "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
              )}
            >
              <Sparkles size={10} />
              <span>Featured</span>
            </div>
          </div>
        )}

        {/* Avatar Section */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            {user.picture ? (
              <img
                src={user.picture}
                alt={`${user.firstname} ${user.lastname}`}
                className="w-14 h-14 rounded-2xl object-cover border shadow-sm"
              />
            ) : (
              <div
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg",
                  user.isClient
                    ? "bg-gradient-to-br from-blue-500 to-blue-600"
                    : "bg-gradient-to-br from-amber-500 to-amber-600"
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

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <p
                  className={cn(
                    "text-sm sm:text-base font-medium truncate",
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  @{user.username}
                </p>
                <OnlineBadge
                  userId={user._id}
                  size="xs"
                  showText={true}
                  showLastActive={true} // 👈 Add this to see last active time
                />
              </div>
              <button
                onClick={handleModalOpen}
                className={cn(
                  "p-2 rounded-xl transition-all hover:scale-110",
                  isDarkMode
                    ? "hover:bg-gray-700 text-gray-400"
                    : "hover:bg-gray-200 text-gray-600"
                )}
              >
                <FiMoreVertical size={16} />
              </button>
            </div>

            {/* Role Badge */}
            <div
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
                user.isClient
                  ? isDarkMode
                    ? "bg-blue-500/20 text-blue-300"
                    : "bg-blue-100 text-blue-700"
                  : isDarkMode
                    ? "bg-amber-500/20 text-amber-300"
                    : "bg-amber-100 text-amber-700"
              )}
            >
              {userRole.icon}
              {userRole.text}
            </div>
          </div>
        </div>

        {/* Location */}
        {user.city && (
          <div
            className={cn(
              "flex items-center gap-2 text-sm mb-4",
              isDarkMode ? "text-gray-400" : "text-gray-600"
            )}
          >
            <FiMapPin size={14} />
            {user.city}
          </div>
        )}

        {/* Bio */}
        {user.bio && (
          <p
            className={cn(
              "text-sm leading-relaxed mb-4 line-clamp-2",
              isDarkMode ? "text-gray-400" : "text-gray-600"
            )}
          >
            {user.bio}
          </p>
        )}

        {/* Stats & Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div
                className={cn(
                  "font-bold text-lg",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}
              >
                {user.followers?.length || 0}
              </div>
              <div
                className={cn(
                  "text-xs",
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                )}
              >
                Followers
              </div>
            </div>
            <div className="text-center">
              <div
                className={cn(
                  "font-bold text-lg",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}
              >
                {user.completedGigsCount || 0}
              </div>
              <div
                className={cn(
                  "text-xs",
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                )}
              >
                Gigs
              </div>
            </div>

            {user?.profileViews && user?.profileViews?.totalCount > 0 && (
              <div className="text-center">
                <div
                  className={cn(
                    "font-bold text-lg flex items-center gap-1",
                    isDarkMode ? "text-white" : "text-gray-900"
                  )}
                >
                  <FiEye size={12} />
                  {user?.profileViews && user?.profileViews.totalCount}
                </div>
                <div
                  className={cn(
                    "text-xs",
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  Views
                </div>
              </div>
            )}
          </div>

          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* <ChatIcon userId={user._id} size="sm" variant="ghost" /> */}
            <FollowButton
              _id={user._id}
              pendingFollowRequests={user.pendingFollowRequests}
              targetUserFollowings={user.followings}
              className="rounded-xl px-4 py-2 text-sm"
              variant="outline"
            />
          </div>
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
        question="Do you want to visit their profile?"
        userInfo={{
          id: user._id,
          name: user.firstname + " " + user.lastname,
          username: user.username,
          image: user.picture,
          type: user.isMusician ? "musician" : "client",
          instrument: user.instrument,
          city: user.city,
        }}
        confirmText="Yes, View"
        cancelText="No, Thanks"
        variant="info"
      />
    </>
  );
}

export default SearchUserCard;
