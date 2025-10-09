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
import { useState } from "react";
import {
  FiMapPin,
  FiBriefcase,
  FiMoreVertical,
  FiUser,
  FiMail,
} from "react-icons/fi";
import FollowButton from "./FollowButton";
import { X } from "lucide-react";
import { UserProps } from "@/types/userTypes";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const MainUser = ({
  _id,
  firstname,
  lastname,
  username,
  followers,
  picture,
  isClient,
  instrument,
  completedGigsCount,
  city,
  bio,
  email,
  organization,
}: UserProps) => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const { colors, isDarkMode } = useThemeColors();

  const handleProfileClick = () => {
    router.push(`/search/${username}`);
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(true);
  };

  const userType = isClient ? "Client" : instrument || "Professional";

  return (
    <>
      {/* Clean User Card */}
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={cn(
          "relative rounded-2xl p-5 cursor-pointer border transition-all duration-300",
          colors.card,
          colors.border,
          "hover:shadow-xl backdrop-blur-sm",
          isDarkMode ? "hover:shadow-black/30" : "hover:shadow-gray-200/50"
        )}
      >
        {/* Background Accent */}
        <div
          className={cn(
            "absolute inset-0 rounded-2xl opacity-5",
            isClient
              ? "bg-gradient-to-br from-blue-500 to-cyan-500"
              : "bg-gradient-to-br from-amber-500 to-orange-500"
          )}
        />

        <div className="relative flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0 relative">
            {picture ? (
              <div className="relative">
                <img
                  src={picture}
                  alt={`${firstname} ${lastname}`}
                  className={cn(
                    "w-14 h-14 rounded-2xl object-cover border-2 shadow-lg",
                    colors.border
                  )}
                />
                <div
                  className={cn(
                    "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 shadow-sm",
                    isClient
                      ? "bg-blue-500 border-white dark:border-gray-900"
                      : "bg-amber-500 border-white dark:border-gray-900"
                  )}
                />
              </div>
            ) : (
              <div
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center text-white font-medium text-lg shadow-lg",
                  "bg-gradient-to-br",
                  isClient
                    ? "from-blue-500 to-cyan-500"
                    : "from-amber-500 to-orange-500"
                )}
              >
                {firstname?.[0]}
                {lastname?.[0]}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3
                  onClick={handleProfileClick}
                  className={cn(
                    "font-bold text-lg mb-1 hover:opacity-80 transition-opacity cursor-pointer",
                    colors.text
                  )}
                >
                  {firstname} {lastname}
                </h3>
                <p className={cn("text-sm font-medium", colors.textMuted)}>
                  @{username}
                </p>
              </div>
              <button
                onClick={handleMoreClick}
                className={cn(
                  "p-2 rounded-xl transition-all duration-200 flex-shrink-0 ml-2",
                  colors.hoverBg,
                  "hover:scale-110 active:scale-95",
                  colors.textMuted
                )}
              >
                <FiMoreVertical size={18} />
              </button>
            </div>

            {/* Bio */}
            {bio && (
              <p
                className={cn(
                  "text-sm leading-relaxed mb-4 line-clamp-2",
                  colors.textMuted
                )}
              >
                {bio}
              </p>
            )}

            {/* Location & Role */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border",
                  isClient
                    ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20"
                    : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
                )}
              >
                {userType}
              </div>

              {city && (
                <div
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-medium",
                    colors.textMuted
                  )}
                >
                  <FiMapPin size={12} className="flex-shrink-0" />
                  <span>{city}</span>
                </div>
              )}
            </div>

            {/* Stats & Action */}
            <div
              className={cn(
                "flex items-center justify-between pt-4 border-t",
                colors.border
              )}
            >
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className={cn("font-bold text-lg", colors.text)}>
                    {completedGigsCount || 0}
                  </div>
                  <div className={cn("text-xs font-medium", colors.textMuted)}>
                    Gigs
                  </div>
                </div>
                <div className="text-center">
                  <div className={cn("font-bold text-lg", colors.text)}>
                    {followers?.length || 0}
                  </div>
                  <div className={cn("text-xs font-medium", colors.textMuted)}>
                    Followers
                  </div>
                </div>
              </div>

              <div
                onClick={(e) => e.stopPropagation()}
                className="transform scale-90"
              >
                <FollowButton _id={_id} followers={followers} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Professional Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          {/* Backdrop */}
          <div
            className={cn(
              "absolute inset-0 backdrop-blur-md",
              isDarkMode ? "bg-black/60" : "bg-black/40"
            )}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "relative rounded-3xl w-full max-w-md mx-auto border shadow-2xl backdrop-blur-lg",
              colors.card,
              colors.border,
              isDarkMode ? "shadow-black/40" : "shadow-gray-400/20"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className={cn(
                "p-6 border-b rounded-t-3xl",
                colors.border,
                colors.secondaryBackground
              )}
            >
              <div className="flex items-center justify-between">
                <h2 className={cn("text-xl font-bold", colors.text)}>
                  Profile Details
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className={cn(
                    "p-2 rounded-xl transition-all duration-200",
                    colors.hoverBg,
                    "hover:scale-110 active:scale-95",
                    colors.textMuted
                  )}
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* User Header */}
              <div className="flex items-center gap-4 mb-6">
                {picture ? (
                  <div className="relative">
                    <img
                      src={picture}
                      alt={`${firstname} ${lastname}`}
                      className={cn(
                        "w-20 h-20 rounded-2xl object-cover border-2 shadow-lg",
                        colors.border
                      )}
                    />
                    <div
                      className={cn(
                        "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 shadow-md",
                        isClient
                          ? "bg-blue-500 border-white dark:border-gray-900"
                          : "bg-amber-500 border-white dark:border-gray-900"
                      )}
                    />
                  </div>
                ) : (
                  <div
                    className={cn(
                      "w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg",
                      "bg-gradient-to-br",
                      isClient
                        ? "from-blue-500 to-cyan-500"
                        : "from-amber-500 to-orange-500"
                    )}
                  >
                    {firstname?.[0]}
                    {lastname?.[0]}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className={cn("font-bold text-xl mb-1", colors.text)}>
                    {firstname} {lastname}
                  </h3>
                  <p className={cn("text-base font-medium", colors.textMuted)}>
                    @{username}
                  </p>
                  <div
                    className={cn(
                      "inline-flex px-3 py-1 rounded-full text-xs font-semibold mt-2 backdrop-blur-sm border",
                      isClient
                        ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
                    )}
                  >
                    {userType}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {bio && (
                <div
                  className={cn(
                    "text-sm leading-relaxed mb-6 p-4 rounded-xl backdrop-blur-sm",
                    colors.secondaryBackground,
                    colors.text
                  )}
                >
                  {bio}
                </div>
              )}

              {/* Key Metrics */}
              <div
                className={cn(
                  "grid grid-cols-3 gap-3 mb-6 p-4 rounded-2xl backdrop-blur-sm border",
                  colors.secondaryBackground,
                  colors.border
                )}
              >
                <div className="text-center">
                  <div className={cn("font-bold text-2xl mb-1", colors.text)}>
                    {completedGigsCount || 0}
                  </div>
                  <div
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wide",
                      colors.textMuted
                    )}
                  >
                    Gigs
                  </div>
                </div>
                <div className="text-center">
                  <div className={cn("font-bold text-2xl mb-1", colors.text)}>
                    {followers?.length || 0}
                  </div>
                  <div
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wide",
                      colors.textMuted
                    )}
                  >
                    Followers
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className={cn(
                      "font-bold text-2xl mb-1",
                      isClient ? "text-blue-500" : "text-amber-500"
                    )}
                  >
                    {isClient ? "Client" : "Pro"}
                  </div>
                  <div
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wide",
                      colors.textMuted
                    )}
                  >
                    Status
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-3 mb-6">
                {city && (
                  <div
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl backdrop-blur-sm",
                      colors.secondaryBackground,
                      colors.text
                    )}
                  >
                    <FiMapPin className="flex-shrink-0" size={16} />
                    <span className="text-sm font-medium">Based in {city}</span>
                  </div>
                )}

                {organization && isClient && (
                  <div
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl backdrop-blur-sm",
                      colors.secondaryBackground,
                      colors.text
                    )}
                  >
                    <FiBriefcase className="flex-shrink-0" size={16} />
                    <span className="text-sm font-medium">{organization}</span>
                  </div>
                )}

                {email && (
                  <div
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl backdrop-blur-sm",
                      colors.secondaryBackground,
                      colors.text
                    )}
                  >
                    <FiMail className="flex-shrink-0" size={16} />
                    <span className="text-sm font-medium truncate">
                      {email}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleProfileClick}
                  className={cn(
                    "flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200",
                    "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600",
                    "text-white shadow-lg hover:shadow-xl",
                    isDarkMode
                      ? "hover:shadow-blue-500/25"
                      : "hover:shadow-blue-500/40",
                    "hover:scale-105 active:scale-95"
                  )}
                >
                  View Profile
                </button>
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="transform scale-95"
                >
                  <FollowButton _id={_id} followers={followers} />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default MainUser;
