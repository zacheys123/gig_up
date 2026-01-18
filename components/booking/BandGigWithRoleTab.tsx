// components/gigs/tabs/BandRolesTab.tsx
import React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Music,
  Award,
  CheckCircle,
  Sparkles,
  Target,
  AlertCircle,
  TrendingUp,
  Lock,
  Info,
  ChevronRight,
  UserPlus,
  Calendar,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GigWithApplicants } from "@/types/bookings";
import { Skeleton } from "@/components/ui/skeleton";
import { useThemeColors } from "@/hooks/useTheme";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface BandRolesTabProps {
  selectedGigData: GigWithApplicants;
  filteredApplicants: any[];
  clerkId?: string;
}

// Define easing functions
const EASE_OUT = [0.17, 0.67, 0.83, 0.67];
const EASE_IN_OUT = [0.42, 0, 0.58, 1];

export const BandRolesTab: React.FC<BandRolesTabProps> = ({
  selectedGigData,
  filteredApplicants,
  clerkId,
}) => {
  const router = useRouter();
  const { colors, isDarkMode, mounted } = useThemeColors();

  // Query to check if crew chat can be created
  const crewChatCheck = useQuery(
    api.controllers.prebooking.canCreateCrewChat,
    clerkId && selectedGigData?.gig._id
      ? { gigId: selectedGigData.gig._id, clerkId }
      : "skip"
  );

  // Mutation for bookAndCreateCrewChat
  const bookAndCreateCrewChat = useMutation(
    api.controllers.prebooking.bookAndCreateCrewChat
  );

  const handleBookAndCreateCrewChat = async () => {
    if (!selectedGigData || !clerkId) return;

    try {
      const result = await bookAndCreateCrewChat({
        gigId: selectedGigData.gig._id,
        clerkId: clerkId,
        clientRole: "admin",
      });

      toast.success(result.message || "Gig booked and crew chat created!");

      if (result.chatId) {
        window.open(`/chat/${result.chatId}`, "_blank");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to book gig and create crew chat");
      console.error(error);
    }
  };

  // Calculate role completion progress
  const getRoleCompletion = () => {
    if (!selectedGigData?.gig.bandCategory)
      return { filled: 0, total: 0, percentage: 0 };

    const filled = selectedGigData.gig.bandCategory.reduce(
      (total, role) => total + (role.filledSlots || 0),
      0
    );
    const total = selectedGigData.gig.bandCategory.reduce(
      (total, role) => total + (role.maxSlots || 1),
      0
    );

    return {
      filled,
      total,
      percentage: total > 0 ? Math.round((filled / total) * 100) : 0,
    };
  };

  const roleCompletion = getRoleCompletion();

  // Calculate applicants per role
  const getRoleApplicantsSummary = () => {
    if (!selectedGigData?.gig.bandCategory || !filteredApplicants) return [];

    return selectedGigData.gig.bandCategory.map((role, index) => {
      const roleApplicants = filteredApplicants.filter(
        (applicant) => applicant.bandRoleIndex === index
      );

      const shortlistedInRole =
        selectedGigData.shortlisted?.filter(
          (item: any) => item.bandRoleIndex === index
        ) || [];

      return {
        role: role.role,
        maxSlots: role.maxSlots,
        filledSlots: role.filledSlots,
        applicants: roleApplicants.length,
        shortlisted: shortlistedInRole.length,
        index,
      };
    });
  };

  const roleApplicantsSummary = getRoleApplicantsSummary();
  const totalApplicants = filteredApplicants?.length || 0;
  const totalShortlisted = selectedGigData.shortlisted?.length || 0;

  const handleViewApplicants = () => {
    router.push(`/gigs/${selectedGigData.gig._id}/band-applicants`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  if (!mounted) {
    return (
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Band Gig Overview Card */}
      <Card
        className={cn(
          "overflow-hidden border-0 shadow-lg",
          isDarkMode
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700"
            : "bg-gradient-to-br from-white via-gray-50 to-white border-gray-200"
        )}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className={cn("text-2xl font-bold", colors.text)}>
                    {selectedGigData.gig.title}
                  </h2>
                  <p className={cn("text-sm", colors.textMuted)}>
                    Band Gig • {selectedGigData.gig.bandCategory?.length || 0}{" "}
                    Roles Available
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge
                className={cn(
                  "px-4 py-2 text-base font-semibold",
                  isDarkMode
                    ? "bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-700/50 text-purple-200"
                    : "bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200 text-purple-800"
                )}
              >
                <Users className="w-4 h-4 mr-2" />
                {totalApplicants} Applicants
              </Badge>
              <Badge
                className={cn(
                  "px-4 py-2 text-base font-semibold",
                  isDarkMode
                    ? "bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-700/50 text-green-200"
                    : "bg-gradient-to-r from-green-100 to-emerald-100 border-green-200 text-green-800"
                )}
              >
                <Award className="w-4 h-4 mr-2" />
                {totalShortlisted} Shortlisted
              </Badge>
            </div>
          </div>

          {/* Progress Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-purple-500" />
                <div>
                  <h3 className={cn("text-lg font-bold", colors.text)}>
                    Band Formation Progress
                  </h3>
                  <p className={cn("text-sm", colors.textMuted)}>
                    {roleCompletion.filled}/{roleCompletion.total} roles filled
                  </p>
                </div>
              </div>
              <Badge
                className={cn(
                  "px-4 py-2 text-lg font-bold",
                  roleCompletion.percentage === 100
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                    : roleCompletion.percentage >= 50
                      ? "bg-gradient-to-r from-yellow-600 to-amber-600 text-white"
                      : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                )}
              >
                {roleCompletion.percentage}% Complete
              </Badge>
            </div>

            <Progress value={roleCompletion.percentage} className="h-3" />

            {/* Role Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {roleApplicantsSummary.map((role, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={cn(
                    "p-4 rounded-xl border",
                    isDarkMode
                      ? "bg-gray-800/50 border-gray-700 hover:bg-gray-800"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          isDarkMode
                            ? "bg-purple-900/30 text-purple-300"
                            : "bg-purple-100 text-purple-600"
                        )}
                      >
                        <Music className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className={cn("font-bold", colors.text)}>
                          {role.role}
                        </h4>
                        <p className={cn("text-xs", colors.textMuted)}>
                          {role.filledSlots}/{role.maxSlots} slots filled
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={role.applicants > 0 ? "default" : "secondary"}
                      className={cn(
                        "px-2 py-1",
                        role.applicants > 0
                          ? isDarkMode
                            ? "bg-green-900/50 text-green-200"
                            : "bg-green-100 text-green-800"
                          : ""
                      )}
                    >
                      {role.applicants} app
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={cn(colors.textMuted)}>Applicants:</span>
                      <span className={cn("font-semibold", colors.text)}>
                        {role.applicants}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={cn(colors.textMuted)}>Shortlisted:</span>
                      <span className={cn("font-semibold text-green-600")}>
                        {role.shortlisted}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Crew Chat Requirements */}
          {crewChatCheck && selectedGigData.gig.isClientBand && (
            <div className="mb-8">
              <Card
                className={cn(
                  "border-2",
                  crewChatCheck.canCreate
                    ? "border-green-500/30 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
                    : "border-yellow-500/30 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20"
                )}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      {crewChatCheck.canCreate ? (
                        <>
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4
                              className={cn("font-bold text-xl", colors.text)}
                            >
                              Ready to Book! 🎉
                            </h4>
                            <p className={cn("text-sm", colors.textMuted)}>
                              All requirements met for crew chat
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4
                              className={cn("font-bold text-xl", colors.text)}
                            >
                              Requirements Pending ⏳
                            </h4>
                            <p className={cn("text-sm", colors.textMuted)}>
                              {crewChatCheck.reason}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Score Badge */}
                    <Badge
                      className={cn(
                        "px-4 py-2 text-lg font-bold min-w-[100px] text-center",
                        crewChatCheck.canCreate
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                          : "bg-gradient-to-r from-amber-600 to-yellow-600 text-white"
                      )}
                    >
                      {crewChatCheck.score}/{crewChatCheck.maxScore}
                    </Badge>
                  </div>

                  {crewChatCheck.requirements && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                      {crewChatCheck.requirements.map((req, index) => (
                        <div
                          key={index}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg",
                            req.met
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                          )}
                        >
                          <div className="flex-shrink-0">
                            {req.met ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <AlertCircle className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-sm">
                              {req.requirement}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs px-2",
                              req.met
                                ? "border-green-300 text-green-700"
                                : "border-amber-300 text-amber-700"
                            )}
                          >
                            {req.points}pt
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Book Band Button */}
                  <Button
                    onClick={handleBookAndCreateCrewChat}
                    disabled={!crewChatCheck?.canCreate}
                    className={cn(
                      "w-full text-lg py-6 font-bold transition-all relative overflow-hidden group",
                      crewChatCheck?.canCreate
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl"
                        : "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed opacity-70"
                    )}
                    size="lg"
                  >
                    {crewChatCheck.canCreate && (
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    )}

                    <div className="relative z-10 flex items-center justify-center gap-3">
                      {crewChatCheck.canCreate ? (
                        <>
                          <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                          <span>Book Entire Band & Create Crew Chat</span>
                          <TrendingUp className="w-5 h-5" />
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          <span>Complete Requirements to Book Band</span>
                          <Info className="w-5 h-5" />
                        </>
                      )}
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* View Applicants Button */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleViewApplicants}
                className={cn(
                  "flex-1 text-lg py-7 font-bold transition-all relative overflow-hidden group",
                  "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl"
                )}
                size="lg"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <div className="relative z-10 flex items-center justify-center gap-4">
                  <Users className="w-7 h-7" />
                  <div className="text-left">
                    <div className="font-bold">View All Applicants</div>
                    <div className="text-sm opacity-90 font-normal">
                      See {totalApplicants} applicants across all roles
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </Button>

              <Button
                variant="outline"
                className={cn(
                  "flex-1 text-lg py-7 font-bold border-2",
                  isDarkMode
                    ? "border-purple-700 text-purple-300 hover:bg-purple-900/30"
                    : "border-purple-300 text-purple-700 hover:bg-purple-50"
                )}
                size="lg"
                onClick={() => {
                  // Share gig functionality
                  navigator.clipboard.writeText(
                    `${window.location.origin}/gigs/${selectedGigData.gig._id}`
                  );
                  toast.success("Gig link copied to clipboard!");
                }}
              >
                <UserPlus className="w-6 h-6 mr-3" />
                Share Gig
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className={cn(
            isDarkMode
              ? "bg-gradient-to-br from-gray-800 to-gray-900"
              : "bg-gradient-to-br from-blue-50 to-cyan-50"
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  isDarkMode
                    ? "bg-blue-900/50 text-blue-300"
                    : "bg-blue-100 text-blue-600"
                )}
              >
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className={cn("text-sm font-medium", colors.textMuted)}>
                  Gig Date
                </p>
                <p className={cn("text-lg font-bold", colors.text)}>
                  {new Date(selectedGigData.gig.date).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            isDarkMode
              ? "bg-gradient-to-br from-gray-800 to-gray-900"
              : "bg-gradient-to-br from-green-50 to-emerald-50"
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  isDarkMode
                    ? "bg-green-900/50 text-green-300"
                    : "bg-green-100 text-green-600"
                )}
              >
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className={cn("text-sm font-medium", colors.textMuted)}>
                  Time Slot
                </p>
                <p className={cn("text-lg font-bold", colors.text)}>
                  {selectedGigData.gig.time?.start} -{" "}
                  {selectedGigData.gig.time?.end}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            isDarkMode
              ? "bg-gradient-to-br from-gray-800 to-gray-900"
              : "bg-gradient-to-br from-purple-50 to-pink-50"
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  isDarkMode
                    ? "bg-purple-900/50 text-purple-300"
                    : "bg-purple-100 text-purple-600"
                )}
              >
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className={cn("text-sm font-medium", colors.textMuted)}>
                  Shortlist Rate
                </p>
                <p className={cn("text-lg font-bold", colors.text)}>
                  {totalApplicants > 0
                    ? Math.round((totalShortlisted / totalApplicants) * 100)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};
