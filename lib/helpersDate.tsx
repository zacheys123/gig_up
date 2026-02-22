// helpers/getGigDateStatus.ts
import {
  differenceInDays,
  differenceInHours,
  isToday,
  isPast,
  isFuture,
} from "date-fns";

export interface GigDateStatus {
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  exactPast: boolean;
  daysUntil: number;
  hoursUntil: number;
  startTime?: string;
  endTime?: string;
  durationFrom?: string;
  durationTo?: string;
}

export const getGigDateStatus = (
  date: number,
  time?: {
    start?: string;
    end?: string;
    durationFrom?: string;
    durationTo?: string;
  },
): GigDateStatus => {
  const gigDate = new Date(date);
  const now = new Date();

  // Compare dates without time for exact past check
  const gigDateOnly = new Date(gigDate.setHours(0, 0, 0, 0));
  const todayDateOnly = new Date(now.setHours(0, 0, 0, 0));

  const isToday = gigDateOnly.getTime() === todayDateOnly.getTime();
  const isPast = gigDateOnly < todayDateOnly;
  const isFuture = gigDateOnly > todayDateOnly;

  // For exact past: if gig date is before today OR it's today and end time has passed
  let exactPast = isPast;
  if (isToday && time?.end) {
    const [hours, minutes] = time.end.split(":").map(Number);
    const gigEndTime = new Date(gigDate);
    gigEndTime.setHours(hours, minutes, 0, 0);
    exactPast = gigEndTime < now;
  }

  const daysUntil = differenceInDays(gigDate, now);
  const hoursUntil = differenceInHours(gigDate, now);

  return {
    isToday,
    isPast,
    isFuture,
    exactPast,
    daysUntil,
    hoursUntil,
    startTime: time?.start,
    endTime: time?.end,
    durationFrom: time?.durationFrom,
    durationTo: time?.durationTo,
  };
};

export const formatGigDate = (
  date: number,
  time?: { start?: string; end?: string },
): string => {
  const gigDate = new Date(date);
  const status = getGigDateStatus(date, time);

  if (status.isToday) {
    return `Today ${time?.start ? `at ${time.start}` : ""}`;
  }
  if (status.isFuture) {
    const days = status.daysUntil;
    if (days === 0) return "Tomorrow";
    if (days < 7) return `${days} days away`;
    return gigDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
  if (status.isPast) {
    const days = Math.abs(status.daysUntil);
    if (days === 0) return "Today (ended)";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return gigDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  return gigDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatTimeWithDuration = (
  time: string,
  duration?: string,
): string => {
  if (!time) return "";
  const timeStr = time.substring(0, 5); // HH:MM format
  return duration ? `${timeStr} (${duration})` : timeStr;
};

export const calculateGigDateStats = (gigs: any[]) => {
  return gigs.reduce(
    (acc, gig) => {
      const status = getGigDateStatus(gig.date, gig.time);
      if (status.isToday) acc.today++;
      else if (status.isFuture) acc.upcoming++;
      else if (status.isPast) acc.past++;
      return acc;
    },
    { today: 0, upcoming: 0, past: 0 },
  );
};
