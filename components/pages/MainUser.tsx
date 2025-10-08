"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  FiUser,
  FiMail,
  FiAtSign,
  FiStar,
  FiCalendar,
  FiXCircle,
  FiDollarSign,
  FiClock,
} from "react-icons/fi";
import { useAllGigs } from "@/hooks/useAllGigs";
import FollowButton from "./FollowButton";
import { UserProps } from "@/types/userinterfaces";
import { ArrowRight } from "lucide-react";

interface PaymentConfirmation {
  gigId: string;
  confirmPayment: boolean;
  confirmedAt?: Date | string;
  temporaryConfirm?: boolean;
  code?: string;
}

interface MyGigProps {
  _id: string;
  postedBy: UserProps;
  bookedBy?: UserProps;
  musicianConfirmPayment?: PaymentConfirmation;
  clientConfirmPayment?: PaymentConfirmation;
}

const MainUser = ({
  _id,
  email,
  firstname,
  lastname,
  username,
  followers,
  picture,
  isClient,
  isMusician,
  organization,
  roleType,
  instrument,
  completedGigsCount,
  cancelgigCount,
}: UserProps) => {
  const router = useRouter();
  const { loading: gigsLoading, gigs } = useAllGigs();
  const [rating, setRating] = useState<number>(0);

  // Memoize calculations to prevent unnecessary recomputations
  // const { confirmedPayments } = useMemo(() => {
  //   if (gigsLoading || !gigs)
  //     return { confirmedPayments: 0, clientPaymentHistory: [] };

  //   return {
  //     confirmedPayments: calculateConfirmedPayments(gigs, _id || ""),
  //   };
  // }, [gigs, gigsLoading, _id]);

  // Inside your MainUser component
  const postedGigs = useMemo(() => {
    if (!_id || !gigs) return [];
    return calculateConfirmedPayments(gigs, _id);
  }, [gigs, _id]);

  // For debugging - log the results
  const postedGigsPaymentStats = useMemo(() => {
    const now = Date.now();
    const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000; // 5 days in milliseconds

    const musicianConfirmedOnly = postedGigs.filter((gig) => {
      const musicianConfirmed = gig.musicianConfirmPayment?.confirmPayment;
      const clientConfirmed = gig.clientConfirmPayment?.confirmPayment;
      const musicianConfirmDate = gig.musicianConfirmPayment?.confirmedAt
        ? new Date(gig.musicianConfirmPayment.confirmedAt).getTime()
        : null;
      const clientConfirmDate = gig.clientConfirmPayment?.confirmedAt
        ? new Date(gig.clientConfirmPayment.confirmedAt).getTime()
        : null;

      return (
        musicianConfirmed &&
        !clientConfirmed &&
        musicianConfirmDate &&
        now - musicianConfirmDate > fiveDaysInMs &&
        (!clientConfirmDate || clientConfirmDate < musicianConfirmDate)
      );
    });

    return {
      totalPosted: postedGigs.length,
      bothConfirmed: postedGigs.filter(
        (gig) =>
          gig.musicianConfirmPayment?.confirmPayment &&
          gig.clientConfirmPayment?.confirmPayment
      ).length,
      onlyMusicianConfirmed: postedGigs.filter(
        (gig) =>
          gig.musicianConfirmPayment?.temporaryConfirm &&
          !gig.clientConfirmPayment?.temporaryConfirm
      ).length,
      onlyClientConfirmed: postedGigs.filter(
        (gig) =>
          !gig.musicianConfirmPayment?.temporaryConfirm &&
          gig.clientConfirmPayment?.temporaryConfirm
      ).length,

      noneConfirmed: postedGigs.filter(
        (gig) =>
          !gig.musicianConfirmPayment?.confirmPayment &&
          !gig.clientConfirmPayment?.confirmPayment
      ).length,
      // New fields for date-based analysis
      musicianConfirmedOver5DaysAgo: musicianConfirmedOnly.length,
      musicianConfirmedOver5DaysAgoDetails: musicianConfirmedOnly.map(
        (gig) => ({
          gigId: gig._id,
          musicianConfirmedAt: gig.musicianConfirmPayment?.confirmedAt,
          daysSinceMusicianConfirmation: gig.musicianConfirmPayment?.confirmedAt
            ? Math.floor(
                (now -
                  new Date(gig.musicianConfirmPayment.confirmedAt).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : null,
          clientLastUpdated: gig.clientConfirmPayment?.confirmedAt,
        })
      ),
    };
  }, [postedGigs]);

  // Log these stats
  useEffect(() => {
    console.log("Posted Gigs Payment Stats:", postedGigsPaymentStats);
  }, [postedGigsPaymentStats]);

  // Log these stats

  // Combined effect for all gig-related calculations
  useEffect(() => {
    if (gigsLoading || !gigs || !isMusician) return;

    const bookedGigs =
      gigs.gigs?.filter((gig: MyGigProps) => gig?.bookedBy?._id === _id) || [];
    setRating(
      calculateRating(
        bookedGigs.flatMap((gig: MyGigProps) =>
          gig?.bookedBy?.allreviews && Array.isArray(gig?.bookedBy?.allreviews)
            ? gig?.bookedBy?.allreviews
            : []
        ),
        bookedGigs.length
      )
    );
  }, [_id, isMusician, gigs, gigsLoading]);

  const handleClick = () => {
    const path = isMusician
      ? `/search/${username}`
      : `/client/search/${username}`;
    router.push(path);
  };

  // Stats configuration for dynamic rendering
  // Update your stats configuration to include the new metrics
  const stats = [
    ...(isClient
      ? [
          {
            icon: <FiDollarSign className="text-green-400 mb-1" />,
            value: postedGigsPaymentStats.bothConfirmed,
            label: "Gigs Paid",
            color: "text-green-400",
            tooltip: "Gigs with both confirmations",
          },
          {
            icon: <FiClock className="text-amber-400 mb-1" />,
            value:
              postedGigsPaymentStats.musicianConfirmedOver5DaysAgo +
              postedGigsPaymentStats.onlyMusicianConfirmed,
            label: "Pending Payment",
            color: "text-amber-400",
            tooltip: "Musician confirmed but awaiting client (5+ days)",
          },
        ]
      : [
          {
            icon: <FiCalendar className="text-green-400 mb-1" />,
            value: completedGigsCount || 0,
            label: "Completed Gigs",
            color: "text-green-400",
            tooltip: "Successfully completed gigs",
          },
        ]),
    {
      icon: <FiXCircle className="text-red-400 mb-1" />,
      value: cancelgigCount || 0,
      label: "Canceled Gigs",
      color: "text-red-400",
      tooltip: "Canceled gigs",
    },
    {
      icon: (
        <FiStar
          className={isMusician ? "text-amber-400 mb-1" : "text-blue-400 mb-1"}
        />
      ),
      value: isMusician
        ? rating.toFixed(1)
        : `${postedGigsPaymentStats.bothConfirmed}/${postedGigs.length}`,
      label: isMusician ? "Rating" : "Paid/Total",
      color: isMusician ? "text-amber-400" : "text-blue-400",
      tooltip: isMusician
        ? "Performance rating"
        : `Paid: ${postedGigsPaymentStats.bothConfirmed} of ${postedGigs.length}`,
    },
  ];

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ y: -4, scale: 1.015 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`
        relative overflow-hidden rounded-xl p-6 cursor-pointer backdrop-blur-md border transition-all duration-300
        ${
          isMusician
            ? "bg-gradient-to-br from-amber-900/20 to-yellow-700/10 hover:shadow-amber-500/20 border-amber-900/30"
            : "bg-gradient-to-br from-slate-800/20 to-slate-700/10 hover:shadow-slate-500/10 border-slate-700/30"
        }
      `}
      aria-label={`View profile of ${firstname} ${lastname}`}
    >
      <div className="flex flex-col gap-4">
        {/* Header Section */}
        <div className="flex items-start gap-4">
          <Avatar
            picture={picture ? picture : ""}
            firstname={firstname}
            lastname={lastname}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white truncate">
                {firstname} {lastname}
              </h3>
              <h5
                className="font-mono text-[12px] items-center whitespace-nowrap text-neutral-400 flex  gap-2"
                onClick={handleClick}
              >
                View more <ArrowRight size={13} />
              </h5>
            </div>

            <UserInfo
              isClient={isClient}
              email={email}
              organization={organization}
              firstname={firstname}
              roleType={roleType}
              instrument={instrument}
            />
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-3 mt-2">
          {stats.map((stat, index) => (
            <Tooltip key={index} content={stat.tooltip}>
              <StatBox
                icon={stat.icon}
                value={stat.value}
                label={stat.label}
                color={stat.color}
              />
            </Tooltip>
          ))}
        </div>

        {/* Footer Section */}
        <div className="flex items-center justify-between mt-2 px-2 py-2 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <FiAtSign className="opacity-70" />
            <span className="font-mono">@{username}</span>
          </div>

          {_id && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(ev) => ev.stopPropagation()}
            >
              <FollowButton _id={_id} followers={followers} />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Sub-components for better readability
const Avatar = ({
  picture,
  firstname,
  lastname,
}: {
  picture?: string;
  firstname?: string;
  lastname?: string;
}) => (
  <div className="relative">
    {picture ? (
      <Image
        src={picture}
        alt={`${firstname} ${lastname}`}
        width={48}
        height={48}
        className="rounded-full border-2 border-white/20 object-cover"
      />
    ) : (
      <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-medium">
        {firstname?.[0]}
        {lastname?.[0]}
      </div>
    )}
  </div>
);

const UserInfo = ({
  isClient,
  email,
  organization,
  firstname,
  roleType,
  instrument,
}: {
  isClient?: boolean;
  email?: string;
  organization?: string;
  firstname?: string;
  roleType?: string;
  instrument?: string;
}) => (
  <>
    <div className="flex items-center gap-2 text-sm text-gray-300 mt-1 truncate">
      {isClient ? (
        <>
          <FiUser className="text-xs opacity-70" />
          <span>{organization || `${firstname}'s Organization`}</span>
        </>
      ) : (
        <>
          <FiMail className="text-xs opacity-70" />
          <span className="truncate">{email}</span>
        </>
      )}
    </div>

    <div className="mt-2">
      <span
        className={`text-xs font-medium ${
          isClient ? "text-blue-400" : "text-amber-400"
        }`}
      >
        {isClient
          ? "Client"
          : roleType === "instrumentalist"
          ? `${instrument} Player`
          : roleType === "dj"
          ? "DJ"
          : roleType === "mc"
          ? "MC"
          : roleType === "vocalist"
          ? "Vocalist"
          : "Musician"}
      </span>
    </div>
  </>
);

const StatBox = ({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
}) => (
  <div className="bg-white/5 p-3 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
    <div className="flex flex-col items-center">
      {icon}
      <span className={`${color} font-bold`}>{value}</span>
      <span className="text-xs text-gray-400 mt-0.5 whitespace-nowrap">
        {label}
      </span>
    </div>
  </div>
);

// Tooltip component remains the same as in your original code
const Tooltip = ({
  content,
  children,
  position = "top",
}: {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
    right: "left-full ml-2",
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-block"
      >
        {children}
      </div>
      {isVisible && (
        <div
          className={`absolute ${positionClasses[position]} z-50 px-3 py-2 text-sm text-white bg-gray-800 rounded-md shadow-lg whitespace-nowrap`}
        >
          {content}
          <div
            className={`absolute w-2 h-2 bg-gray-800 rotate-45 ${
              position === "top"
                ? "-bottom-1 left-1/2 -translate-x-1/2"
                : position === "bottom"
                ? "-top-1 left-1/2 -translate-x-1/2"
                : position === "left"
                ? "-right-1 top-1/2 -translate-y-1/2"
                : "-left-1 top-1/2 -translate-y-1/2"
            }`}
          />
        </div>
      )}
    </div>
  );
};

// Utility functions
const calculateRating = (
  reviews: { rating: number }[],
  gigCount: number
): number => {
  if (!reviews || reviews.length === 0) return 0;

  const avgReviewRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const experienceFactor = Math.log10(gigCount + 0.5) * 1.0;
  return (
    Math.round(
      Math.min(5, avgReviewRating * 0.7 + experienceFactor * 0.3) * 10
    ) / 10
  );
};

const calculateConfirmedPayments = (gigs: MyGigProps[], userId: string) => {
  if (!gigs || !Array.isArray(gigs)) return [];
  return gigs.filter((gig) => gig?.postedBy?._id === userId);
};

export default MainUser;
