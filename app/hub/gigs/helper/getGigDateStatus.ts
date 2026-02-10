// utils/dateUtils.ts

/**
 * Parse time string with AM/PM support
 */
export const parseTime = (
  timeString: string,
  duration?: string,
): { hour: number; minute: number } => {
  if (!timeString) return { hour: 0, minute: 0 };

  // Handle formats like "9:00", "14:30", "9:00 PM", "9:00pm"
  const time = timeString.trim().toLowerCase();

  // Extract hours and minutes
  let hour = 0;
  let minute = 0;

  // Check for AM/PM in the time string itself
  const hasAm = time.includes("am");
  const hasPm = time.includes("pm");
  const timeWithoutAmPm = time.replace(/am|pm/g, "").trim();

  // Parse hour and minute
  const parts = timeWithoutAmPm.split(":");
  hour = parseInt(parts[0]) || 0;
  minute = parseInt(parts[1]) || 0;

  // Adjust for AM/PM
  if (hasPm && hour < 12) {
    hour += 12;
  } else if (hasAm && hour === 12) {
    hour = 0;
  }

  // Also check durationFrom if provided
  if (duration === "pm" && hour < 12) {
    hour += 12;
  } else if (duration === "am" && hour === 12) {
    hour = 0;
  }

  return { hour, minute };
};

/**
 * Convert gig time to total minutes for comparison
 */
export const timeToMinutes = (
  timeString: string,
  duration?: string,
): number => {
  const { hour, minute } = parseTime(timeString, duration);
  return hour * 60 + minute;
};

/**
 * Get gig date status based on gig date and time
 * Determines if gig is past, upcoming, or today
 */
export const getGigDateStatus = (
  gigDate: string | number | Date,
  time?: {
    start?: string;
    end?: string;
    durationFrom?: string;
    durationTo?: string;
  },
) => {
  const now = new Date();
  const gigDateTime = new Date(gigDate);

  // Reset to midnight for date comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const gigDay = new Date(
    gigDateTime.getFullYear(),
    gigDateTime.getMonth(),
    gigDateTime.getDate(),
  );

  // Check if same day
  const isToday = gigDay.getTime() === today.getTime();

  // Check if past (date is before today)
  const isPastDate = gigDay < today;

  // Check if upcoming (date is after today)
  const isUpcomingDate = gigDay > today;

  // If same day, check time
  if (isToday && time?.start) {
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    // Parse gig start time
    const gigStartMinutes = timeToMinutes(time.start, time.durationFrom);

    // Check if gig has already started
    const isPastToday = currentTotalMinutes > gigStartMinutes;
    const isUpcomingToday = currentTotalMinutes <= gigStartMinutes;

    return {
      isPast: isPastDate || isPastToday,
      isUpcoming: isUpcomingDate || isUpcomingToday,
      isToday,
      status: isPastDate || isPastToday ? "past" : "upcoming",
      todayTimeStatus: isPastToday ? "completed" : "scheduled",
      exactPast: isPastDate || isPastToday,
      startTime: time.start,
      endTime: time.end,
      durationFrom: time.durationFrom,
      durationTo: time.durationTo,
    };
  }

  return {
    isPast: isPastDate,
    isUpcoming: isUpcomingDate,
    isToday,
    status: isPastDate ? "past" : isToday ? "today" : "upcoming",
    todayTimeStatus: null,
    exactPast: isPastDate,
    startTime: time?.start,
    endTime: time?.end,
    durationFrom: time?.durationFrom,
    durationTo: time?.durationTo,
  };
};

/**
 * Format time with duration indicator
 */
export const formatTimeWithDuration = (
  timeString: string,
  duration?: string,
): string => {
  if (!timeString) return "";

  const { hour, minute } = parseTime(timeString, duration);

  // Format as 12-hour time
  let displayHour = hour % 12;
  if (displayHour === 0) displayHour = 12;

  const displayMinute = minute.toString().padStart(2, "0");
  const amPm = hour >= 12 ? "PM" : "AM";

  return `${displayHour}:${displayMinute} ${amPm}`;
};

/**
 * Format gig time range
 */
export const formatTimeRange = (time: {
  start?: string;
  end?: string;
  durationFrom?: string;
  durationTo?: string;
}): string => {
  if (!time?.start && !time?.end) return "";

  const startFormatted = formatTimeWithDuration(
    time.start ? time.start : "",
    time.durationFrom,
  );

  if (time.end) {
    const endFormatted = formatTimeWithDuration(time.end, time.durationTo);
    return `${startFormatted} - ${endFormatted}`;
  }

  return startFormatted;
};

/**
 * Format gig date for display
 */
export const formatGigDate = (
  date: string | number | Date,
  time?: {
    start?: string;
    end?: string;
    durationFrom?: string;
    durationTo?: string;
  },
): string => {
  const gigDate = new Date(date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const gigDay = new Date(
    gigDate.getFullYear(),
    gigDate.getMonth(),
    gigDate.getDate(),
  );

  // Date prefix
  let datePrefix = "";

  if (gigDay.getTime() === today.getTime()) {
    datePrefix = "Today";
  } else {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (gigDay.getTime() === tomorrow.getTime()) {
      datePrefix = "Tomorrow";
    } else {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (gigDay.getTime() === yesterday.getTime()) {
        datePrefix = "Yesterday";
      } else {
        // Within 7 days
        const daysDiff = Math.floor(
          (gigDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysDiff >= 0 && daysDiff < 7) {
          const dayNames = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ];
          datePrefix = dayNames[gigDate.getDay()];
        } else if (daysDiff >= -7 && daysDiff < 0) {
          const dayNames = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ];
          datePrefix = `Last ${dayNames[gigDate.getDay()]}`;
        } else {
          // More than a week away
          datePrefix = gigDate.toLocaleDateString();
        }
      }
    }
  }

  const timeSuffix = time ? formatTimeRange(time) : "";
  if (timeSuffix) {
    return `${datePrefix} • ${timeSuffix}`;
  }

  return datePrefix;
};

/**
 * Calculate date-based stats for gigs
 */
export const calculateGigDateStats = (gigs: any[]) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const upcomingGigs = gigs.filter((gig: any) => {
    const gigDate = new Date(gig.date);
    const gigDay = new Date(
      gigDate.getFullYear(),
      gigDate.getMonth(),
      gigDate.getDate(),
    );
    return gigDay >= today;
  }).length;

  const pastGigs = gigs.filter((gig: any) => {
    const gigDate = new Date(gig.date);
    const gigDay = new Date(
      gigDate.getFullYear(),
      gigDate.getMonth(),
      gigDate.getDate(),
    );
    return gigDay < today;
  }).length;

  const todayGigs = gigs.filter((gig: any) => {
    const gigDate = new Date(gig.date);
    const gigDay = new Date(
      gigDate.getFullYear(),
      gigDate.getMonth(),
      gigDate.getDate(),
    );
    return gigDay.getTime() === today.getTime();
  }).length;

  return {
    upcoming: upcomingGigs,
    past: pastGigs,
    today: todayGigs,
  };
};
