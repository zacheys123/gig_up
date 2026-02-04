// components/gigs/tabs/BandRolesTab.tsx
import React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Music,
  CheckCircle,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Building2,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GigWithApplicants } from "@/types/bookings";
import { Skeleton } from "@/components/ui/skeleton";
import { useThemeColors } from "@/hooks/useTheme";
import { useRouter } from "next/navigation";

interface BandRolesTabProps {
  selectedGigData: GigWithApplicants;
  filteredApplicants: any[];
  clerkId?: string;
}

export const BandRolesTab: React.FC<BandRolesTabProps> = ({
  selectedGigData,
  filteredApplicants,
}) => {
  const router = useRouter();
  const { colors, isDarkMode, mounted } = useThemeColors();

  // Get organization/venue name from gig description or location
  const getVenueName = () => {
    const gig = selectedGigData?.gig;
    if (gig?.description) {
      const match = gig.description.match(/(?:at|@|venue:)\s*([^.,!?]+)/i);
      if (match) return match[1].trim();
    }
    return gig?.location?.split(",")[0] || "Venue";
  };

  const venueName = getVenueName();

  // Calculate role completion
  const getRoleCompletion = () => {
    if (!selectedGigData?.gig.bandCategory)
      return { filled: 0, total: 0, percentage: 0 };

    const filled = selectedGigData.gig.bandCategory.reduce(
      (total, role) => total + (role.filledSlots || 0),
      0,
    );
    const total = selectedGigData.gig.bandCategory.reduce(
      (total, role) => total + (role.maxSlots || 1),
      0,
    );

    return {
      filled,
      total,
      percentage: total > 0 ? Math.round((filled / total) * 100) : 0,
    };
  };

  const roleCompletion = getRoleCompletion();
  const totalApplicants = filteredApplicants?.length || 0;
  const formatDate = (timestamp: number | undefined | null) => {
    // Handle undefined/null
    if (timestamp === undefined || timestamp === null) {
      return "Date not set";
    }

    // Convert to number
    const ts = Number(timestamp);

    // Check if it's a valid number
    if (isNaN(ts)) {
      return "Invalid date";
    }

    // Handle seconds vs milliseconds
    const date = ts < 10000000000 ? new Date(ts * 1000) : new Date(ts);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  };

  const formatTimeRange = (timeObj: any) => {
    if (!timeObj || !timeObj.start) return "Time not set";

    const formatSingleTime = (time: string) => {
      if (!time) return "";
      if (time.includes("PM") || time.includes("AM")) return time;

      try {
        const [hours, minutes] = time.split(":");
        const hour = parseInt(hours, 10);
        const suffix = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${suffix}`;
      } catch {
        return time;
      }
    };

    const start = formatSingleTime(timeObj.start);
    const end = timeObj.end ? formatSingleTime(timeObj.end) : "";
    const from = timeObj.durationFrom;
    const to = timeObj.durationTo;
    return end ? `${start}${from} - ${end}${to}` : start;
  };

  const handleViewAll = () => {
    router.push(`/hub/gigs/client/${selectedGigData.gig._id}/band-applicants`);
  };

  const handleViewGigDetails = () => {
    router.push(`/hub/gigs/client/${selectedGigData.gig._id}/band-applicants`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2 },
    },
  };

  if (!mounted) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Header Card - Gig Overview */}
      <Card
        className={cn(
          "overflow-hidden border-0 shadow-sm",
          isDarkMode
            ? "bg-gray-800/50 border-gray-700"
            : "bg-white border-gray-200",
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    isDarkMode
                      ? "bg-purple-900/30 text-purple-300"
                      : "bg-purple-100 text-purple-600",
                  )}
                >
                  <Music className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className={cn("font-bold text-lg truncate", colors.text)}>
                    {selectedGigData.gig.title}
                  </h3>
                  <p className={cn("text-sm truncate", colors.textMuted)}>
                    <Building2 className="w-3 h-3 inline mr-1" />
                    {venueName}
                  </p>
                </div>
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-500" />
                  <div>
                    {selectedGigData.gig.date
                      ? formatDate(selectedGigData.gig.date)
                      : "Date not set"}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className={colors.text}>
                    {formatTimeRange(selectedGigData.gig.time)}
                  </span>
                  ;
                </div>
                {selectedGigData.gig.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-500" />
                    <span className={cn("text-sm truncate", colors.text)}>
                      {selectedGigData.gig.location.split(",")[0]}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Status Badge */}
            <Badge
              className={cn(
                "px-3 py-1 text-sm font-semibold flex-shrink-0",
                isDarkMode
                  ? "bg-purple-900/30 text-purple-300 border-purple-700/50"
                  : "bg-purple-100 text-purple-800 border-purple-200",
              )}
            >
              {roleCompletion.percentage}% Complete
            </Badge>
          </div>

          {/* Custom Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1 text-xs">
              <span className={colors.textMuted}>Band Formation</span>
              <span className="font-semibold">
                {roleCompletion.filled}/{roleCompletion.total} roles
              </span>
            </div>
            <div className="relative w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${roleCompletion.percentage}%`,
                  backgroundColor:
                    roleCompletion.percentage === 100
                      ? "#10b981" // green-500
                      : roleCompletion.percentage >= 50
                        ? "#f59e0b" // yellow-500
                        : "#3b82f6", // blue-500
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roles Summary Card */}
      <Card
        className={cn(
          "overflow-hidden border-0 shadow-sm",
          isDarkMode
            ? "bg-gray-800/50 border-gray-700"
            : "bg-white border-gray-200",
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className={cn("font-bold", colors.text)}>Band Roles</h4>
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                isDarkMode
                  ? "border-gray-600 text-gray-300"
                  : "border-gray-300 text-gray-600",
              )}
            >
              {selectedGigData.gig.bandCategory?.length || 0} Roles
            </Badge>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {selectedGigData.gig.bandCategory?.map((role, index) => {
              const roleApplicants =
                filteredApplicants?.filter(
                  (applicant) => applicant.bandRoleIndex === index,
                ) || [];

              // Calculate current applicants (this should come from the role itself)
              const currentApplicants =
                role.currentApplicants || roleApplicants.length;
              const maxApplicants = role.maxApplicants || 20; // Default 20

              const applicantProgress =
                maxApplicants > 0
                  ? Math.min((currentApplicants / maxApplicants) * 100, 100)
                  : 0;

              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg",
                    isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-md flex items-center justify-center",
                        isDarkMode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-600",
                      )}
                    >
                      <Music className="w-3 h-3" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={cn("text-sm font-medium", colors.text)}
                        >
                          {role.role}
                        </span>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className="text-xs h-4 px-1 py-0 border-gray-300"
                          >
                            {role.maxSlots} slot{role.maxSlots > 1 ? "s" : ""}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="text-xs h-4 px-1 py-0 bg-blue-100 text-blue-700"
                          >
                            {maxApplicants} max
                          </Badge>
                        </div>
                      </div>

                      {/* Applicant Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className={colors.textMuted}>
                            {currentApplicants}/{maxApplicants} applicants
                          </span>
                          <span className={cn("text-xs", colors.textMuted)}>
                            {role.filledSlots}/{role.maxSlots} booked
                          </span>
                        </div>
                        <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${applicantProgress}%`,
                              backgroundColor:
                                applicantProgress < 30
                                  ? "#10b981" // green-500
                                  : applicantProgress < 70
                                    ? "#3b82f6" // blue-500
                                    : applicantProgress < 90
                                      ? "#f59e0b" // amber-500
                                      : "#ef4444", // red-500
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant={
                        role.filledSlots >= role.maxSlots
                          ? "destructive"
                          : currentApplicants >= maxApplicants
                            ? "secondary"
                            : "default"
                      }
                      className="text-xs h-5"
                    >
                      {role.filledSlots >= role.maxSlots
                        ? "Filled"
                        : currentApplicants >= maxApplicants
                          ? "Full"
                          : `${currentApplicants} app`}
                    </Badge>

                    {currentApplicants > 0 && maxApplicants > 0 && (
                      <div className="text-xs text-gray-500">
                        {Math.round(applicantProgress)}% capacity
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Applicants & Actions Card */}
      <Card
        className={cn(
          "overflow-hidden border-0 shadow-sm",
          isDarkMode
            ? "bg-gray-800/50 border-gray-700"
            : "bg-white border-gray-200",
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  isDarkMode
                    ? "bg-blue-900/30 text-blue-300"
                    : "bg-blue-100 text-blue-600",
                )}
              >
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className={cn("font-bold", colors.text)}>Applicants</h4>
                <p className={cn("text-sm", colors.textMuted)}>
                  {totalApplicants} total applications
                </p>
              </div>
            </div>
            {roleCompletion.percentage === 100 && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1">
                <CheckCircle className="w-3 h-3 mr-1" />
                Complete
              </Badge>
            )}
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleViewGigDetails}
              className={cn(
                "w-full",
                isDarkMode
                  ? "bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 border-purple-700/50"
                  : "bg-purple-100 hover:bg-purple-200 text-purple-800 border-purple-200",
              )}
              variant="outline"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              View Gig Details
            </Button>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t">
              <div
                className={cn(
                  "text-center p-2 rounded",
                  isDarkMode ? "bg-gray-700/50" : "bg-gray-50",
                )}
              >
                <div className="text-xs text-gray-500">Roles Open</div>
                <div className="font-bold">
                  {roleCompletion.total - roleCompletion.filled}
                </div>
              </div>
              <div
                className={cn(
                  "text-center p-2 rounded",
                  isDarkMode ? "bg-gray-700/50" : "bg-gray-50",
                )}
              >
                <div className="text-xs text-gray-500">Max Apps</div>
                <div className="font-bold">
                  {selectedGigData.gig.bandCategory?.reduce(
                    (sum, role) => sum + (role.maxApplicants || 20),
                    0,
                  )}
                </div>
              </div>
              <div
                className={cn(
                  "text-center p-2 rounded",
                  isDarkMode ? "bg-gray-700/50" : "bg-gray-50",
                )}
              >
                <div className="text-xs text-gray-500">Status</div>
                <div className="font-bold">
                  {roleCompletion.percentage === 100 ? "Ready" : "Hiring"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      {roleCompletion.percentage < 100 && (
        <Card
          className={cn(
            "overflow-hidden border-0 shadow-sm",
            isDarkMode
              ? "bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border-blue-800/30"
              : "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200",
          )}
        >
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium">Need more applicants?</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Share this gig to get more qualified musicians.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};
