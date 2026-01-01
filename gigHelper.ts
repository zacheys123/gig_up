import { GigProps } from "./types/gig";
import { UserProps } from "./types/userTypes";

interface GigConditions {
  isCurrentWhoCreatedGig: boolean;
  isCurrentWhoBooked: boolean;
  canEditGig: boolean;
  formattedPrice: string;
  canPostAScheduledGig: boolean;
  allowedToBookGig: boolean;
  isProOnlyForFreeUser: boolean;
  showUpgradePrompt: boolean;
  bookingLimitReached: boolean;
  isCreatorIsCurrentUserAndTaken: boolean;
  needsClientConfirmation: boolean;
  paymentConfirmed: boolean;
  canBookProGigs: boolean;
}

const PRO_PRICE_THRESHOLD = 10000; // 10k KES
const FREE_USER_MAX_BOOKINGS = 3;
const PRO_USER_MAX_BOOKINGS = 10;

export const getGigConditions = (
  gig: GigProps,
  currentUser: UserProps | null,
  myId: string | undefined
): GigConditions => {
  const userTier = currentUser?.tier || "free";
  const bookingsThisWeek = currentUser?.bookingsThisWeek || 0;
  const maxWeeklyBookings =
    currentUser?.maxWeeklyBookings ||
    (userTier === "free" ? FREE_USER_MAX_BOOKINGS : PRO_USER_MAX_BOOKINGS);

  // Basic conditions with safe null checks
  const isCurrentWhoCreatedGig = gig?.postedBy === myId;
  const isCurrentWhoBooked = gig?.bookedBy === myId;
  const isGigTaken = gig?.isTaken === true;
  const isGigPending = gig?.isPending === true;
  const isClient = gig?.postedBy === myId;

  // Can edit gig if: user created it AND gig is not taken AND gig is not pending
  const canEditGig = Boolean(
    isCurrentWhoCreatedGig && !isGigTaken && !isGigPending
  );

  // Format price
  const formattedPrice = gig?.price
    ? `${gig.currency || "KES"} ${gig.price.toLocaleString()}`
    : "Price on request";

  // Can post as scheduled gig if: user created it AND gig is pending
  const canPostAScheduledGig = Boolean(isCurrentWhoCreatedGig && isGigPending);

  // Pro-only check for free users
  const isProOnlyForFreeUser = Boolean(
    userTier === "free" && gig?.price && gig.price >= PRO_PRICE_THRESHOLD
  );

  // Booking availability
  const bookingLimitReached = bookingsThisWeek >= maxWeeklyBookings;
  const canBookProGigs = userTier !== "free";

  // Allowed to book gig conditions:
  // 1. Not the creator
  // 2. Gig is not taken
  // 3. Gig is not pending
  // 4. User is not the current booker (if any)
  // 5. For free users: gig price < 10k OR user can book pro gigs
  // 6. User hasn't reached booking limit
  const allowedToBookGig = Boolean(
    !isCurrentWhoCreatedGig &&
      !isGigTaken &&
      !isGigPending &&
      !isCurrentWhoBooked &&
      (!isProOnlyForFreeUser || canBookProGigs) &&
      !bookingLimitReached
  );

  // Show upgrade prompt if user is free and trying to book pro gig
  const showUpgradePrompt = Boolean(
    !isCurrentWhoCreatedGig &&
      !isGigTaken &&
      !isGigPending &&
      isProOnlyForFreeUser &&
      !canBookProGigs
  );

  // Check if current user is creator and gig is taken
  const isCreatorIsCurrentUserAndTaken = Boolean(
    gig?.postedBy === myId && gig?.isTaken && gig?.bookedBy !== myId
  );

  // Check if client needs to confirm payment
  const needsClientConfirmation = Boolean(gig?.isTaken && isClient);

  // Check if payment is confirmed
  const paymentConfirmed = gig?.paymentStatus === "paid";

  return {
    isCurrentWhoCreatedGig,
    isCurrentWhoBooked,
    canEditGig,
    formattedPrice,
    canPostAScheduledGig,
    allowedToBookGig,
    isProOnlyForFreeUser,
    showUpgradePrompt,
    bookingLimitReached,
    isCreatorIsCurrentUserAndTaken,
    needsClientConfirmation,
    paymentConfirmed,
    canBookProGigs,
  };
};

// Additional helper functions
export const calculateBookingAvailability = (
  currentUser: UserProps | null,
  gigPrice?: number
) => {
  const userTier = currentUser?.tier || "free";
  const bookingsThisWeek = currentUser?.bookingsThisWeek || 0;
  const maxWeeklyBookings =
    currentUser?.maxWeeklyBookings ||
    (userTier === "free" ? FREE_USER_MAX_BOOKINGS : PRO_USER_MAX_BOOKINGS);

  const slotsAvailable = Math.max(0, maxWeeklyBookings - bookingsThisWeek);
  const canBook = slotsAvailable > 0;
  const isProOnly = Boolean(
    userTier === "free" && gigPrice && gigPrice >= PRO_PRICE_THRESHOLD
  );

  return {
    canBook,
    slotsAvailable,
    isProOnly,
    userTier,
    bookingsThisWeek,
    maxWeeklyBookings,
  };
};

export const getGigStatus = (gig: GigProps, userId?: string) => {
  if (!gig) return "unknown";
  if (gig.isTaken) return "taken";
  if (gig.isPending) return "pending";
  if (gig.postedBy === userId) return "created";
  if (gig.bookedBy === userId) return "booked";
  return "available";
};

// Helper to check if gig is saved/favorited by current user
export const checkGigSavedStatus = (
  gig: GigProps,
  currentUser: UserProps | null
) => {
  const gigId = gig?._id;
  if (!gigId || !currentUser) {
    return {
      isSaved: false,
      isFavorite: false,
    };
  }

  return {
    isSaved: currentUser.savedGigs?.includes(gigId) || false,
    isFavorite: currentUser.favoriteGigs?.includes(gigId) || false,
  };
};

// Helper to get user role for a gig
export const getUserRoleForGig = (gig: GigProps, userId?: string) => {
  if (!userId || !gig) return "guest";
  if (gig.postedBy === userId) return "client";
  if (gig.bookedBy === userId) return "musician";
  return "viewer";
};

// Helper to check if user can review gig
export const canUserReviewGig = (
  gig: GigProps,
  currentUser: UserProps | null,
  userId?: string
) => {
  if (!userId || !currentUser || !gig) return false;

  const isClient = gig.postedBy === userId;
  const isMusician = gig.bookedBy === userId;
  const isTaken = gig.isTaken;
  const paymentConfirmed = gig.paymentStatus === "paid";

  if (isClient && isTaken && paymentConfirmed) return true;
  if (isMusician && isTaken) return true;

  return false;
};

// Helper to check if gig is still active/available
export const isGigActive = (gig: GigProps) => {
  if (!gig) return false;

  const now = Date.now();
  const gigDate = gig.date;

  return gig.isActive && !gig.isTaken && !gig.isPending && gigDate > now;
};

// Helper to format gig time for display
export const formatGigTime = (gig: GigProps) => {
  if (!gig) {
    return {
      date: "",
      time: "",
      day: "",
    };
  }

  const date = new Date(gig.date);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const startTime = gig.time?.start || "00:00";
  const endTime = gig.time?.end || "23:59";

  return {
    date: formattedDate,
    time: `${startTime} - ${endTime}`,
    day: gig.day || date.getDate().toString(),
  };
};

// Helper to calculate booking stats
export const getBookingStats = (gig: GigProps) => {
  if (!gig) {
    return {
      totalViews: 0,
      totalBookings: 0,
      totalInterested: 0,
      totalApplied: 0,
      bookingRate: "0",
    };
  }

  return {
    totalViews: gig.viewCount?.length || 0,
    totalBookings: gig.bookCount?.length || 0,
    totalInterested: gig.interestedUsers?.length || 0,
    totalApplied: gig.appliedUsers?.length || 0,
    bookingRate:
      gig.bookCount?.length > 0
        ? ((gig.bookCount.length / (gig.viewCount?.length || 1)) * 100).toFixed(
            1
          )
        : "0",
  };
};

// Helper to check payment confirmation status
export const getPaymentConfirmationStatus = (gig: GigProps) => {
  if (!gig) return "none-confirmed";

  const clientConfirmed = gig.clientConfirmPayment?.confirmPayment || false;
  const musicianConfirmed = gig.musicianConfirmPayment?.confirmPayment || false;

  if (clientConfirmed && musicianConfirmed) {
    return "both-confirmed";
  } else if (clientConfirmed) {
    return "client-confirmed";
  } else if (musicianConfirmed) {
    return "musician-confirmed";
  } else {
    return "none-confirmed";
  }
};

// Helper to check if user can access gig details
export const canAccessGigDetails = (
  gig: GigProps,
  userId?: string,
  isPublicRoute: boolean = false
) => {
  if (!gig) return false;

  // Anyone can see public gigs
  if (gig.isPublic) return true;

  // Private gigs can only be seen by:
  // 1. The client (postedBy)
  // 2. The musician (bookedBy)
  const isClient = gig.postedBy === userId;
  const isMusician = gig.bookedBy === userId;

  return isClient || isMusician;
};

// Helper to check if gig can be booked based on user tier and price
export const canBookGigBasedOnTier = (
  userTier: string,
  gigPrice?: number
): { canBook: boolean; requiresPro: boolean; reason?: string } => {
  const isFreeUser = userTier === "free";

  if (isFreeUser && gigPrice && gigPrice >= PRO_PRICE_THRESHOLD) {
    return {
      canBook: false,
      requiresPro: true,
      reason: "This gig requires a Pro subscription",
    };
  }

  return {
    canBook: true,
    requiresPro: false,
  };
};

// Helper to get remaining booking slots
export const getRemainingBookingSlots = (currentUser: UserProps | null) => {
  const userTier = currentUser?.tier || "free";
  const bookingsThisWeek = currentUser?.bookingsThisWeek || 0;
  const maxWeeklyBookings =
    currentUser?.maxWeeklyBookings ||
    (userTier === "free" ? FREE_USER_MAX_BOOKINGS : PRO_USER_MAX_BOOKINGS);

  return {
    remaining: Math.max(0, maxWeeklyBookings - bookingsThisWeek),
    used: bookingsThisWeek,
    total: maxWeeklyBookings,
    isLimitReached: bookingsThisWeek >= maxWeeklyBookings,
  };
};

// Helper to check if user can cancel gig
export const canUserCancelGig = (
  gig: GigProps,
  userId?: string,
  userRole?: string
): { canCancel: boolean; reason?: string } => {
  if (!gig || !userId) {
    return { canCancel: false, reason: "Invalid user or gig" };
  }

  const isClient = gig.postedBy === userId;
  const isMusician = gig.bookedBy === userId;
  const isTaken = gig.isTaken;
  const paymentConfirmed = gig.paymentStatus === "paid";

  if (!isTaken) {
    return { canCancel: false, reason: "Gig is not booked" };
  }

  if (paymentConfirmed) {
    return { canCancel: false, reason: "Payment already confirmed" };
  }

  if (isClient || isMusician) {
    return { canCancel: true };
  }

  return { canCancel: false, reason: "Only client or musician can cancel" };
};

interface BookingStatus {
  canBook: boolean;
  status:
    | "available"
    | "limit-reached"
    | "pro-only"
    | "inactive"
    | "not-allowed";
  reason?: string;
  desc?: string;
  isLoading: boolean;
  remainingSlots: number;
  usedSlots: number;
  totalSlots: number;
}

export const canStillBookThisWeekDetailed = (
  user: UserProps | null,
  gig: GigProps,
  myId: string | undefined
): BookingStatus => {
  // Default values for non-logged in users
  if (!user) {
    return {
      canBook: false,
      status: "inactive",
      reason: "Please sign in to book gigs",
      desc: "Sign in required",
      isLoading: false,
      remainingSlots: 0,
      usedSlots: 0,
      totalSlots: 0,
    };
  }

  // Use your existing getGigConditions function
  const conditions = getGigConditions(gig, user, myId);

  const bookingsThisWeek = user.bookingsThisWeek || 0;
  const maxWeeklyBookings =
    user.maxWeeklyBookings || (user.tier === "free" ? 3 : 10);

  const remainingSlots = Math.max(0, maxWeeklyBookings - bookingsThisWeek);

  // Determine status based on conditions
  if (!conditions.allowedToBookGig) {
    if (conditions.isProOnlyForFreeUser) {
      return {
        canBook: false,
        status: "pro-only",
        reason: "Pro subscription required",
        desc: "Upgrade to Pro to book premium gigs",
        isLoading: false,
        remainingSlots,
        usedSlots: bookingsThisWeek,
        totalSlots: maxWeeklyBookings,
      };
    }

    if (conditions.bookingLimitReached) {
      return {
        canBook: false,
        status: "limit-reached",
        reason: "Weekly booking limit reached",
        desc: `You've used ${bookingsThisWeek} of ${maxWeeklyBookings} weekly bookings`,
        isLoading: false,
        remainingSlots,
        usedSlots: bookingsThisWeek,
        totalSlots: maxWeeklyBookings,
      };
    }

    return {
      canBook: false,
      status: "not-allowed",
      reason: "Not eligible to book this gig",
      desc: "Check gig requirements",
      isLoading: false,
      remainingSlots,
      usedSlots: bookingsThisWeek,
      totalSlots: maxWeeklyBookings,
    };
  }

  // Everything is good, can book
  return {
    canBook: true,
    status: "available",
    reason: `You have ${remainingSlots} booking${remainingSlots !== 1 ? "s" : ""} remaining this week`,
    isLoading: false,
    remainingSlots,
    usedSlots: bookingsThisWeek,
    totalSlots: maxWeeklyBookings,
  };
};

// Simple version using your getGigConditions
export const canStillBookThisWeek = (
  user: UserProps | null,
  gig: GigProps,
  myId: string | undefined
): boolean => {
  if (!user) return false;

  const conditions = getGigConditions(gig, user, myId);
  return conditions.allowedToBookGig;
};
// utils/index.ts

/**
 * Formats view count to a readable string
 * @param count - The number of views
 * @returns Formatted string like "1.2k", "5.3m", "1,234", etc.
 */
export const formatViewCount = (count: number | undefined): string => {
  if (!count && count !== 0) return "0";

  const num = Number(count);

  if (num === 0) return "0";

  if (num < 1000) {
    return num.toString();
  }

  if (num < 10000) {
    // For numbers between 1,000 and 9,999, show with comma
    return num.toLocaleString();
  }

  if (num < 1000000) {
    // For numbers between 10,000 and 999,999, show as k
    return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }

  if (num < 1000000000) {
    // For numbers between 1,000,000 and 999,999,999, show as m
    return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")}m`;
  }

  // For billions and above
  return `${(num / 1000000000).toFixed(1).replace(/\.0$/, "")}b`;
};
