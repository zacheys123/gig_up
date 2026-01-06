// Add this helper function at the top of your createGig mutation file
export const checkGigLimit = (user: any, isInGracePeriod: boolean) => {
  const userTier = user?.tier?.toLowerCase() || "free";
  const trustScore = user?.trustScore || 0;

  // Get current week start (Monday)
  const now = new Date();
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
  currentWeekStart.setHours(0, 0, 0, 0);

  const weekStartTimestamp = currentWeekStart.getTime();

  // Get weekly gigs posted
  const gigsThisWeek = user?.gigsPostedThisWeek || { count: 0, weekStart: 0 };
  const weeklyGigsPosted =
    gigsThisWeek.weekStart === weekStartTimestamp ? gigsThisWeek.count : 0;

  // Check if grace period (26 days from account creation)
  const accountAge = Date.now() - (user._creationTime || Date.now());
  const isGracePeriod =
    isInGracePeriod || accountAge <= 26 * 24 * 60 * 60 * 1000; // 26 days in ms

  let canPost = true;
  let errorMessage = "";
  let weeklyLimit = 0;

  if (userTier === "free") {
    if (isGracePeriod) {
      // Grace period: 3 gigs PER WEEK (same as Pro with trust score >= 40)
      weeklyLimit = 3;
      if (weeklyGigsPosted >= 3) {
        canPost = false;
        errorMessage =
          "Grace period users are limited to 3 gigs per week. You've reached your weekly limit.";
      }
    } else {
      // Post-grace period free users: 0 gigs
      canPost = false;
      errorMessage =
        "Your grace period has ended. Upgrade to continue posting gigs.";
    }
  } else if (userTier === "pro") {
    if (trustScore >= 40) {
      // Pro with trust score >= 40: 3 gigs per week
      weeklyLimit = 3;
      if (weeklyGigsPosted >= 3) {
        canPost = false;
        errorMessage =
          "Pro users are limited to 3 gigs per week. You've reached your weekly limit.";
      }
    } else {
      // Pro with low trust score: 1 gig per week
      weeklyLimit = 1;
      if (weeklyGigsPosted >= 1) {
        canPost = false;
        errorMessage =
          "Pro users with trust score below 40 are limited to 1 gig per week.";
      }
    }
  } else if (userTier === "premium" || userTier === "elite") {
    if (trustScore >= 40) {
      // Premium/Elite with trust score >= 40: 5 gigs per week
      weeklyLimit = 5;
      if (weeklyGigsPosted >= 5) {
        canPost = false;
        errorMessage =
          "Premium/Elite users are limited to 5 gigs per week. You've reached your weekly limit.";
      }
    } else {
      // Premium/Elite with low trust score: 2 gigs per week
      weeklyLimit = 2;
      if (weeklyGigsPosted >= 2) {
        canPost = false;
        errorMessage =
          "Premium/Elite users with trust score below 40 are limited to 2 gigs per week.";
      }
    }
  }

  return {
    canPost,
    errorMessage,
    weeklyLimit,
    weeklyGigsPosted,
    isGracePeriod,
    userTier,
    trustScore,
  };
};

export const updateWeeklyGigCount = (currentWeeklyData: any) => {
  // Get current week start (Monday)
  const now = new Date();
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
  currentWeekStart.setHours(0, 0, 0, 0);

  const weekStartTimestamp = currentWeekStart.getTime();
  const currentGigsThisWeek = currentWeeklyData || { count: 0, weekStart: 0 };

  // Reset if new week
  if (currentGigsThisWeek.weekStart !== weekStartTimestamp) {
    return {
      count: 1,
      weekStart: weekStartTimestamp,
    };
  }

  // Increment if same week
  return {
    count: currentGigsThisWeek.count + 1,
    weekStart: weekStartTimestamp,
  };
};
