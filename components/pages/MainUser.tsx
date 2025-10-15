// "use client";
// import { motion } from "framer-motion";
// import { useRouter } from "next/navigation";
// import { useEffect, useMemo, useState } from "react";
// import {
//   FiUser,
//   FiMail,
//   FiAtSign,
//   FiStar,
//   FiCalendar,
//   FiXCircle,
//   FiDollarSign,
//   FiClock,
//   FiMoreVertical,
//   FiMapPin,
//   FiBriefcase,
//   FiAward,
// } from "react-icons/fi";
// import { useAllGigs } from "@/hooks/useAllGigs";
// import FollowButton from "./FollowButton";
// import { ArrowRight, X } from "lucide-react";
// import { UserProps } from "@/types/userTypes";
// import { useThemeColors } from "@/hooks/useTheme";
// import { cn } from "@/lib/utils";

// interface PaymentConfirmation {
//   gigId: string;
//   confirmPayment: boolean;
//   confirmedAt?: Date | string;
//   temporaryConfirm?: boolean;
//   code?: string;
// }

// interface GigWithUsers {
//   _id: string;
//   postedBy: string;
//   bookedBy?: string;
//   postedByUser: UserProps;
//   bookedByUser?: UserProps;
//   musicianConfirmPayment?: PaymentConfirmation;
//   clientConfirmPayment?: PaymentConfirmation;
// }

// const MainUser = ({
//   _id,
//   email,
//   firstname,
//   lastname,
//   username,
//   followers,
//   picture,
//   isClient,
//   isMusician,
//   organization,
//   roleType,
//   instrument,
//   completedGigsCount,
//   cancelgigCount,
//   city,
//   experience,
//   bio,
// }: UserProps) => {
//   const router = useRouter();
//   const { isLoading: gigsLoading, gigs } = useAllGigs();
//   const [rating, setRating] = useState<number>(0);
//   const [showModal, setShowModal] = useState(false);
//   const { colors, isDarkMode } = useThemeColors();

//   // Get gigs where this user is the poster
//   const postedGigs = useMemo(() => {
//     if (!_id || !gigs) return [];
//     return gigs.filter((gig) => gig.postedByUser?._id === _id);
//   }, [gigs, _id]);

//   // Get gigs where this user is the booker/musician
//   const bookedGigs = useMemo(() => {
//     if (!_id || !gigs) return [];
//     return gigs.filter((gig) => gig.bookedByUser?._id === _id);
//   }, [gigs, _id]);

//   // Calculate payment stats and rating
//   const stats = useMemo(() => {
//     const postedGigsPaymentStats = {
//       totalPosted: postedGigs.length,
//       bothConfirmed: postedGigs.filter(
//         (gig) =>
//           gig.musicianConfirmPayment?.confirmPayment &&
//           gig.clientConfirmPayment?.confirmPayment
//       ).length,
//     };

//     // Calculate rating
//     const reviews = bookedGigs.flatMap(
//       (gig) => gig.bookedByUser?.allreviews || []
//     );
//     // const calculatedRating = calculateRating(reviews, bookedGigs.length);
//     const calculatedRating = 5;

//     return { postedGigsPaymentStats, calculatedRating };
//   }, [postedGigs, bookedGigs]);

//   const handleCardClick = () => {
//     const path = isMusician
//       ? `/search/${username}`
//       : `/client/search/${username}`;
//     router.push(path);
//   };

//   const handleMoreClick = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     setShowModal(true);
//   };

//   // Simple card stats for the main view
//   const simpleStats = [
//     {
//       icon: <FiCalendar className="text-green-400" />,
//       value: completedGigsCount || 0,
//       label: "Completed",
//     },
//     {
//       icon: <FiStar className="text-amber-400" />,
//       value: isMusician
//         ? stats.calculatedRating.toFixed(1)
//         : stats.postedGigsPaymentStats.bothConfirmed,
//       label: isMusician ? "Rating" : "Paid",
//     },
//   ];

//   return (
//     <>
//       {/* Simple User Card */}
//       <motion.div
//         onClick={handleCardClick}
//         whileHover={{ y: -2, scale: 1.02 }}
//         whileTap={{ scale: 0.98 }}
//         transition={{ type: "spring", stiffness: 300, damping: 20 }}
//         className={cn(
//           "relative overflow-hidden rounded-xl p-4 cursor-pointer backdrop-blur-md border transition-all duration-300",
//           "bg-white/5 hover:bg-white/10",
//           colors.border
//         )}
//       >
//         <div className="flex items-center gap-3">
//           {/* Avatar */}
//           <div className="relative">
//             {picture ? (
//               <img
//                 src={picture}
//                 alt={`${firstname} ${lastname}`}
//                 className="w-12 h-12 rounded-full border-2 border-white/20 object-cover"
//               />
//             ) : (
//               <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-medium">
//                 {firstname?.[0]}
//                 {lastname?.[0]}
//               </div>
//             )}
//           </div>

//           {/* User Info */}
//           <div className="flex-1 min-w-0">
//             <div className="flex items-center justify-between">
//               <h3 className="text-sm font-semibold text-white truncate">
//                 {firstname} {lastname}
//               </h3>
//               <button
//                 onClick={handleMoreClick}
//                 className={cn(
//                   "p-1 rounded-md transition-colors",
//                   "hover:bg-white/10 text-gray-400 hover:text-white"
//                 )}
//               >
//                 <FiMoreVertical size={14} />
//               </button>
//             </div>

//             <div className="flex items-center gap-2 text-xs text-gray-300 mt-1">
//               <FiAtSign size={10} />
//               <span className="font-mono truncate">@{username}</span>
//             </div>

//             <div className="mt-2">
//               <span
//                 className={cn(
//                   "text-xs font-medium px-2 py-1 rounded-full",
//                   isClient
//                     ? "bg-blue-500/20 text-blue-300"
//                     : "bg-amber-500/20 text-amber-300"
//                 )}
//               >
//                 {isClient ? "Client" : instrument || "Musician"}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Simple Stats */}
//         <div className="flex justify-between mt-3 pt-3 border-t border-white/10">
//           {simpleStats.map((stat, index) => (
//             <div key={index} className="flex flex-col items-center">
//               {stat.icon}
//               <span className="text-white text-sm font-bold mt-1">
//                 {stat.value}
//               </span>
//               <span className="text-gray-400 text-xs">{stat.label}</span>
//             </div>
//           ))}
//         </div>

//         {/* Follow Button */}
//         <div className="mt-3 flex justify-center">
//           <motion.div
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <FollowButton _id={_id} followers={followers} />
//           </motion.div>
//         </div>
//       </motion.div>

//       {/* Detailed Modal */}
//       {showModal && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
//           onClick={() => setShowModal(false)}
//         >
//           <motion.div
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0.9, opacity: 0 }}
//             transition={{ type: "spring", stiffness: 300, damping: 25 }}
//             className={cn(
//               "relative rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto",
//               colors.card,
//               colors.border,
//               "border"
//             )}
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Close Button */}
//             <button
//               onClick={() => setShowModal(false)}
//               className={cn(
//                 "absolute top-4 right-4 p-2 rounded-full transition-colors",
//                 colors.hoverBg,
//                 "text-gray-400 hover:text-white"
//               )}
//             >
//               <X size={20} />
//             </button>

//             {/* Modal Content */}
//             <div className="flex flex-col items-center text-center mb-6">
//               {/* Avatar */}
//               <div className="relative mb-4">
//                 {picture ? (
//                   <img
//                     src={picture}
//                     alt={`${firstname} ${lastname}`}
//                     className="w-20 h-20 rounded-full border-2 border-white/20 object-cover"
//                   />
//                 ) : (
//                   <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-medium text-2xl">
//                     {firstname?.[0]}
//                     {lastname?.[0]}
//                   </div>
//                 )}
//               </div>

//               <h2 className={cn("text-xl font-bold mb-2", colors.text)}>
//                 {firstname} {lastname}
//               </h2>

//               <div
//                 className={cn("flex items-center gap-2 mb-1", colors.textMuted)}
//               >
//                 <FiAtSign size={14} />
//                 <span className="font-mono">@{username}</span>
//               </div>

//               <div
//                 className={cn(
//                   "text-sm px-3 py-1 rounded-full font-medium mb-4",
//                   isClient
//                     ? "bg-blue-500/20 text-blue-300"
//                     : "bg-amber-500/20 text-amber-300"
//                 )}
//               >
//                 {isClient ? "Client" : `${instrument} ${roleType}`}
//               </div>

//               {bio && (
//                 <p className={cn("text-sm mb-4 text-center", colors.textMuted)}>
//                   {bio}
//                 </p>
//               )}
//             </div>

//             {/* Detailed Stats Grid */}
//             <div className="grid grid-cols-2 gap-4 mb-6">
//               <StatCard
//                 icon={<FiCalendar className="text-green-400" />}
//                 value={completedGigsCount || 0}
//                 label="Completed Gigs"
//                 color="text-green-400"
//               />
//               <StatCard
//                 icon={<FiXCircle className="text-red-400" />}
//                 value={cancelgigCount || 0}
//                 label="Canceled Gigs"
//                 color="text-red-400"
//               />
//               <StatCard
//                 icon={<FiStar className="text-amber-400" />}
//                 value={
//                   isMusician
//                     ? stats.calculatedRating.toFixed(1)
//                     : stats.postedGigsPaymentStats.bothConfirmed
//                 }
//                 label={isMusician ? "Rating" : "Paid Gigs"}
//                 color="text-amber-400"
//               />
//               <StatCard
//                 icon={<FiBriefcase className="text-blue-400" />}
//                 value={stats.postedGigsPaymentStats.totalPosted}
//                 label="Total Gigs"
//                 color="text-blue-400"
//               />
//             </div>

//             {/* Additional Info */}
//             <div
//               className={cn(
//                 "space-y-3 p-4 rounded-lg",
//                 colors.secondaryBackground
//               )}
//             >
//               {city && (
//                 <div className="flex items-center gap-3">
//                   <FiMapPin className={cn("text-gray-400")} />
//                   <span className={cn("text-sm", colors.text)}>{city}</span>
//                 </div>
//               )}
//               {experience && (
//                 <div className="flex items-center gap-3">
//                   <FiAward className={cn("text-gray-400")} />
//                   <span className={cn("text-sm", colors.text)}>
//                     {experience} experience
//                   </span>
//                 </div>
//               )}
//               {email && (
//                 <div className="flex items-center gap-3">
//                   <FiMail className={cn("text-gray-400")} />
//                   <span className={cn("text-sm truncate", colors.text)}>
//                     {email}
//                   </span>
//                 </div>
//               )}
//             </div>

//             {/* Action Buttons */}
//             <div className="flex gap-3 mt-6">
//               <button
//                 onClick={handleCardClick}
//                 className={cn(
//                   "flex-1 py-2 px-4 rounded-lg font-medium transition-colors",
//                   "bg-blue-500 hover:bg-blue-600 text-white"
//                 )}
//               >
//                 View Profile
//               </button>
//               <div className="flex-1">
//                 <FollowButton _id={_id} followers={followers} />
//               </div>
//             </div>
//           </motion.div>
//         </motion.div>
//       )}
//     </>
//   );
// };

// // Stat Card Component for Modal
// const StatCard = ({
//   icon,
//   value,
//   label,
//   color,
// }: {
//   icon: React.ReactNode;
//   value: string | number;
//   label: string;
//   color: string;
// }) => (
//   <div
//     className={cn(
//       "bg-white/5 p-4 rounded-lg border border-white/10 text-center"
//     )}
//   >
//     <div className="flex justify-center mb-2">{icon}</div>
//     <div className={cn("text-lg font-bold", color)}>{value}</div>
//     <div className={cn("text-xs text-gray-400 mt-1")}>{label}</div>
//   </div>
// );

// // Utility function
// const calculateRating = (
//   reviews: { rating: number }[],
//   gigCount: number
// ): number => {
//   if (!reviews || reviews.length === 0) return 0;
//   const avgReviewRating =
//     reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
//   const experienceFactor = Math.log10(gigCount + 0.5) * 1.0;
//   return (
//     Math.round(
//       Math.min(5, avgReviewRating * 0.7 + experienceFactor * 0.3) * 10
//     ) / 10
//   );
// };

// export default MainUser;
"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  FiMapPin,
  FiBriefcase,
  FiMoreVertical,
  FiUser,
  FiMail,
  FiStar,
  FiMusic,
  FiEye,
} from "react-icons/fi";
import FollowButton from "./FollowButton";
import { X, Crown, Sparkles } from "lucide-react";
import { UserProps } from "@/types/userTypes";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCheckTrial } from "@/hooks/useCheckTrial";

interface MainUserProps extends UserProps {
  isFeatured?: boolean;
}

const MainUser = ({
  _id,
  firstname,
  lastname,
  username,
  followers,
  picture,
  isClient,
  instrument,
  roleType,
  completedGigsCount,
  city,
  bio,
  email,
  organization,
  isFeatured = false, // New prop
  profileViews, // For view count display
}: MainUserProps) => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showViewNotification, setShowViewNotification] = useState(false);
  const { colors, isDarkMode } = useThemeColors();
  const { userId } = useAuth();
  const { user: currentUser } = useCurrentUser();

  const { isInGracePeriod } = useCheckTrial();
  // Mutation to track profile views
  const trackProfileView = useMutation(api.controllers.user.trackProfileView);

  const handleProfileClick = () => {
    router.push(`/search/${username}`);
  };

  useEffect(() => {
    if ((showModal || showViewNotification) && userId && userId !== _id) {
      trackProfileView({
        viewedUserId: _id,
        viewerUserId: userId,
        isViewerInGracePeriod: isInGracePeriod, // Pass grace period status
      });
    }
  }, [
    showModal,
    showViewNotification,
    _id,
    userId,
    trackProfileView,
    isInGracePeriod,
  ]);

  // Show view notification for pro users
  const handleCardInteraction = () => {
    const shouldShowNotification =
      (currentUser?.tier === "pro" || isInGracePeriod) &&
      userId &&
      userId !== _id;

    if (shouldShowNotification) {
      setShowViewNotification(true);
      setTimeout(() => setShowViewNotification(false), 3000);
    }
  };

  const handleCardClick = () => {
    handleCardInteraction();
    handleProfileClick();
  };

  const handleModalOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleCardInteraction();
    setShowModal(true);
  };

  // Enhanced role display with theme-aware styling
  const getRoleDisplay = () => {
    if (isClient) return { text: "Client", icon: <FiBriefcase size={12} /> };

    if (roleType && instrument) {
      return {
        text: `${instrument} ${roleType}`,
        icon: <FiMusic size={12} />,
      };
    }
    if (instrument) return { text: instrument, icon: <FiMusic size={12} /> };
    if (roleType) return { text: roleType, icon: <FiUser size={12} /> };

    return { text: "Professional", icon: <FiUser size={12} /> };
  };

  const userRole = getRoleDisplay();

  // Theme-aware role badge styling
  const getRoleBadgeStyles = () => {
    const baseStyles =
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors";

    if (isClient) {
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

  // Theme-aware featured badge styling
  const getFeaturedBadgeStyles = () => {
    return cn(
      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border",
      "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-400",
      "shadow-lg shadow-purple-500/25"
    );
  };

  // Theme-aware card background
  const getCardBackground = () => {
    if (isFeatured) {
      return isDarkMode
        ? "bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-700/50 hover:border-purple-500/70"
        : "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:border-purple-300";
    }
    return isDarkMode
      ? "bg-gray-800/90 hover:bg-gray-700/90 border-gray-700"
      : "bg-white/95 hover:bg-gray-50/95 border-gray-200";
  };

  // Get view count for display
  const viewCount = profileViews?.totalCount || 0;

  return (
    <>
      {/* Clean User Card */}
      <motion.div
        whileHover={{ y: -2, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={cn(
          "relative rounded-xl p-4 cursor-pointer border transition-all duration-200 backdrop-blur-sm",
          getCardBackground(),
          "hover:shadow-md",
          isFeatured && "ring-1 ring-purple-500/30"
        )}
      >
        {/* Featured Badge */}
        {isFeatured && (
          <div className="absolute -top-2 -right-2 z-10">
            <span className={getFeaturedBadgeStyles()}>
              <Sparkles size={10} />
              Featured
            </span>
          </div>
        )}

        <div className="relative flex items-start gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0 relative">
            {picture ? (
              <div className="relative">
                <img
                  src={picture}
                  alt={`${firstname} ${lastname}`}
                  className={cn(
                    "w-12 h-12 rounded-xl object-cover border shadow-sm",
                    isDarkMode ? "border-gray-600" : "border-gray-200",
                    isFeatured && "ring-2 ring-purple-500/50"
                  )}
                />
                <div
                  className={cn(
                    "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2",
                    isClient
                      ? "bg-blue-500 border-white dark:border-gray-800"
                      : "bg-amber-500 border-white dark:border-gray-800",
                    isFeatured && "ring-1 ring-white"
                  )}
                />
              </div>
            ) : (
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-white font-medium shadow-sm border",
                  "bg-gradient-to-br",
                  isClient
                    ? "from-blue-500 to-blue-600 border-blue-400"
                    : "from-amber-500 to-amber-600 border-amber-400",
                  isFeatured && "ring-2 ring-purple-500/50"
                )}
              >
                {firstname?.[0]}
                {lastname?.[0]}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3
                  onClick={handleCardClick}
                  className={cn(
                    "font-semibold text-base mb-1 hover:opacity-80 transition-opacity cursor-pointer",
                    isDarkMode ? "text-white" : "text-gray-900"
                  )}
                >
                  {firstname} {lastname}
                </h3>
                <p
                  className={cn(
                    "text-sm",
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  @{username}
                </p>
              </div>
              <button
                onClick={handleModalOpen}
                className={cn(
                  "p-1.5 rounded-lg transition-all duration-200 flex-shrink-0 ml-2",
                  "hover:bg-opacity-20",
                  isDarkMode
                    ? "hover:bg-white text-gray-400"
                    : "hover:bg-gray-200 text-gray-600"
                )}
              >
                <FiMoreVertical size={16} />
              </button>
            </div>

            {/* Role Badge - Theme Enhanced */}
            <div className="mb-2">
              <span className={getRoleBadgeStyles()}>
                {userRole.icon}
                {userRole.text}
              </span>
            </div>

            {/* Bio */}
            {bio && (
              <p
                className={cn(
                  "text-sm leading-relaxed mb-3 line-clamp-2",
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                )}
              >
                {bio}
              </p>
            )}

            {/* Location */}
            {city && (
              <div
                className={cn(
                  "flex items-center gap-1.5 text-xs mb-3",
                  isDarkMode ? "text-gray-500" : "text-gray-500"
                )}
              >
                <FiMapPin size={12} className="flex-shrink-0" />
                <span>{city}</span>
              </div>
            )}

            {/* Stats & Action */}
            <div
              className={cn(
                "flex items-center justify-between pt-3 border-t",
                isDarkMode ? "border-gray-700" : "border-gray-200"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div
                    className={cn(
                      "font-bold text-sm",
                      isDarkMode ? "text-white" : "text-gray-900"
                    )}
                  >
                    {completedGigsCount || 0}
                  </div>
                  <div
                    className={cn(
                      "text-xs",
                      isDarkMode ? "text-gray-500" : "text-gray-600"
                    )}
                  >
                    Gigs
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className={cn(
                      "font-bold text-sm",
                      isDarkMode ? "text-white" : "text-gray-900"
                    )}
                  >
                    {followers?.length || 0}
                  </div>
                  <div
                    className={cn(
                      "text-xs",
                      isDarkMode ? "text-gray-500" : "text-gray-600"
                    )}
                  >
                    Followers
                  </div>
                </div>
                {/* View Count - Only show if user has views */}
                {viewCount > 0 && (
                  <div className="text-center">
                    <div
                      className={cn(
                        "font-bold text-sm flex items-center gap-1",
                        isDarkMode ? "text-white" : "text-gray-900"
                      )}
                    >
                      <FiEye size={10} />
                      {viewCount}
                    </div>
                    <div
                      className={cn(
                        "text-xs",
                        isDarkMode ? "text-gray-500" : "text-gray-600"
                      )}
                    >
                      Views
                    </div>
                  </div>
                )}
              </div>

              <div
                onClick={(e) => e.stopPropagation()}
                className="transform scale-90"
              >
                <FollowButton _id={_id} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Professional Modal */}
      {showModal && (
        <Modal
          user={{
            _id,
            firstname,
            lastname,
            username,
            picture,
            isClient,
            bio,
            city,
            organization,
            email,
            completedGigsCount,
            followers,
            isFeatured,
            viewCount,
          }}
          userRole={userRole}
          onClose={() => setShowModal(false)}
          onProfileClick={handleProfileClick}
        />
      )}

      {/* View Notification for Pro Users */}
      {showViewNotification && currentUser?.tier === "pro" && (
        <ViewNotification
          user={{ firstname, lastname, username, picture }}
          onClose={() => setShowViewNotification(false)}
          isPro={currentUser?.tier === "pro"}
        />
      )}
    </>
  );
};

// Modal Component
const Modal = ({
  user,
  userRole,
  onClose,
  onProfileClick,
}: {
  user: any;
  userRole: any;
  onClose: () => void;
  onProfileClick: () => void;
}) => {
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
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
          "relative rounded-2xl w-full max-w-md mx-auto border shadow-lg backdrop-blur-md",
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
                  alt={`${user.firstname} ${user.lastname}`}
                  className={cn(
                    "w-16 h-16 rounded-xl object-cover border shadow-sm",
                    isDarkMode ? "border-gray-600" : "border-gray-200",
                    user.isFeatured && "ring-2 ring-purple-500/50"
                  )}
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
                {user.firstname?.[0]}
                {user.lastname?.[0]}
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
                  {user.firstname} {user.lastname}
                </h3>
                {user.isFeatured && (
                  <Sparkles size={16} className="text-purple-500" />
                )}
              </div>
              <p
                className={cn(
                  "text-sm mb-2",
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                )}
              >
                @{user.username}
              </p>
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
                {user.completedGigsCount || 0}
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
                {user.followers?.length || 0}
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
          <div className="flex gap-3">
            <button
              onClick={onProfileClick}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-200",
                "bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md",
                "hover:scale-105 active:scale-95"
              )}
            >
              View Profile
            </button>
            <div
              onClick={(e) => e.stopPropagation()}
              className="transform scale-90"
            >
              <FollowButton _id={user._id} />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// View Notification Component for Pro Users and inGracePeriodUsers
const ViewNotification = ({
  user,
  onClose,
  isPro,
}: {
  user: any;
  onClose: () => void;
  isPro: boolean;
}) => {
  const getNotificationStyle = () => {
    if (isPro) {
      return "bg-gradient-to-r from-purple-500 to-pink-500 border-purple-400 shadow-purple-500/25";
    } else {
      return "bg-gradient-to-r from-blue-500 to-cyan-500 border-blue-400 shadow-blue-500/25";
    }
  };

  const getBadgeText = () => {
    if (isPro) return "Pro";
    return "Free Trial";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed top-4 right-4 z-50 max-w-sm"
    >
      <div
        className={cn(
          "rounded-lg p-4 shadow-lg border backdrop-blur-md text-white",
          getNotificationStyle()
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {user.picture ? (
              <img
                src={user.picture}
                alt={`${user.firstname} ${user.lastname}`}
                className="w-10 h-10 rounded-full border-2 border-white/50 object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-medium">
                {user.firstname?.[0]}
                {user.lastname?.[0]}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-sm">
                {user.firstname} viewed your profile
              </p>
              <span className="text-xs bg-white/30 px-2 py-0.5 rounded-full">
                {getBadgeText()}
              </span>
            </div>
            <p className="text-xs opacity-90">@{user.username}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MainUser;
