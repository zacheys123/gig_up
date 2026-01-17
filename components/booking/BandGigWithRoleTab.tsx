// components/gigs/tabs/BandRolesTab.tsx
import React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Star,
  Eye,
  Bookmark,
  XCircle,
  Users,
  ShoppingBag,
  MapPin,
  Music,
  Award,
  CheckCircle,
  Sparkles,
  Target,
  AlertCircle,
  TrendingUp,
  Lock,
  Info,
  Calendar,
} from "lucide-react";
import { ChatIcon } from "@/components/chat/ChatIcon";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Applicant, GigWithApplicants } from "@/types/bookings";
import { Skeleton } from "@/components/ui/skeleton";
import { useThemeColors } from "@/hooks/useTheme";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

interface BandRolesTabProps {
  selectedGigData: GigWithApplicants;
  filteredApplicants: Applicant[];
  handleAddToShortlist: (
    gigId: Id<"gigs">,
    applicantId: Id<"users">,
    bandRole?: string,
    bandRoleIndex?: number
  ) => Promise<void>;
  handleRemoveFromShortlist: (
    gigId: Id<"gigs">,
    applicantId: Id<"users">,
    bandRoleIndex?: number
  ) => Promise<void>;
  handleViewProfile: (
    gigId: Id<"gigs">,
    applicantId: Id<"users">
  ) => Promise<void>;
  handleBookMusician: (
    userId: Id<"users">,
    userName: string,
    source?: "regular" | "band-role" | "full-band" | "shortlisted",
    bandId?: Id<"bands">,
    bandRoleIndex?: number
  ) => void;
  getStatusColor: (status: string) => string;
  getRoleIcon: (roleType: string) => string;
  clerkId?: string;
}

// Define easing functions
const EASE_OUT = [0.17, 0.67, 0.83, 0.67];
const EASE_IN_OUT = [0.42, 0, 0.58, 1];

export const BandRolesTab: React.FC<BandRolesTabProps> = ({
  selectedGigData,
  filteredApplicants,
  handleAddToShortlist,
  handleRemoveFromShortlist,
  handleViewProfile,
  handleBookMusician,
  getStatusColor,
  getRoleIcon,
  clerkId,
}) => {
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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        // Remove easing or use a simple string
        ease: "easeOut",
      },
    },
    hover: {
      y: -6,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const getRoleColor = (roleType?: string) => {
    if (!roleType) return colors.defaultText;

    switch (roleType.toLowerCase()) {
      case "client":
        return colors.clientText;
      case "vocalist":
        return colors.vocalistText;
      case "dj":
        return colors.djText;
      case "mc":
        return colors.mcText;
      case "musician":
      case "instrumentalist":
        return colors.musicianText;
      case "booker":
        return colors.bookerText;
      default:
        return colors.defaultText;
    }
  };

  const getRoleBg = (roleType?: string) => {
    if (!roleType) return colors.defaultBg;

    switch (roleType.toLowerCase()) {
      case "client":
        return colors.clientBg;
      case "vocalist":
        return colors.vocalistBg;
      case "dj":
        return colors.djBg;
      case "mc":
        return colors.mcBg;
      case "musician":
      case "instrumentalist":
        return colors.musicianBg;
      case "booker":
        return colors.bookerBg;
      default:
        return colors.defaultBg;
    }
  };

  const getRoleBorder = (roleType?: string) => {
    if (!roleType) return colors.defaultBorder;

    switch (roleType.toLowerCase()) {
      case "client":
        return colors.clientBorder;
      case "vocalist":
        return colors.vocalistBorder;
      case "dj":
        return colors.djBorder;
      case "mc":
        return colors.mcBorder;
      case "musician":
      case "instrumentalist":
        return colors.musicianBorder;
      case "booker":
        return colors.bookerBorder;
      default:
        return colors.defaultBorder;
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 rounded-lg" />
                  ))}
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Book Entire Band & Crew Chat Section */}
      {selectedGigData?.gig.isClientBand &&
        selectedGigData?.gig.bandCategory && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className={cn(
                    "text-lg font-bold flex items-center gap-2",
                    colors.text
                  )}
                >
                  <Target className="w-5 h-5 text-purple-500" />
                  Band Booking Status
                </h3>
                <p className={cn("text-sm", colors.textMuted)}>
                  Complete requirements to book the entire band
                </p>
              </div>
              <Badge variant="outline" className="px-3 py-1">
                {roleCompletion.filled}/{roleCompletion.total} Roles Filled
              </Badge>
            </div>

            {/* Progress bar and score display */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className={cn("font-medium", colors.text)}>
                    Role Completion
                  </span>
                  <span className="font-bold text-purple-600">
                    {roleCompletion.percentage}%
                  </span>
                </div>
                <Progress value={roleCompletion.percentage} className="h-2" />
              </div>

              {/* Crew Chat Requirements Score Card */}
              {crewChatCheck && (
                <Card
                  className={cn(
                    "border-2",
                    crewChatCheck.canCreate
                      ? "border-green-500/30 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
                      : "border-yellow-500/30 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {crewChatCheck.canCreate ? (
                          <>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4
                                className={cn("font-bold text-lg", colors.text)}
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
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center">
                              <AlertCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4
                                className={cn("font-bold text-lg", colors.text)}
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
                          "px-3 py-1.5 text-base font-bold",
                          crewChatCheck.canCreate
                            ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                            : "bg-gradient-to-r from-amber-600 to-yellow-600 text-white"
                        )}
                      >
                        {crewChatCheck.score}/{crewChatCheck.maxScore}
                      </Badge>
                    </div>

                    {crewChatCheck && crewChatCheck.requirements && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                        {crewChatCheck.requirements.map((req, index) => (
                          <div
                            key={index}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-lg text-sm",
                              req.met
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                            )}
                          >
                            <div className="w-2 h-2 rounded-full bg-current flex-shrink-0"></div>
                            <span className="font-medium">
                              {req.requirement}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "ml-auto text-xs px-1.5 py-0",
                                req.met
                                  ? "border-green-300 text-green-700"
                                  : "border-amber-300 text-amber-700"
                              )}
                            >
                              {req.points}pt{req.points > 1 ? "s" : ""}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="mt-4">
                      <Button
                        onClick={handleBookAndCreateCrewChat}
                        disabled={!crewChatCheck?.canCreate} // Safe check with optional chaining
                        className={cn(
                          "w-full text-lg py-6 font-bold transition-all relative overflow-hidden group",
                          crewChatCheck?.canCreate
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl"
                            : "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed opacity-70"
                        )}
                        size="lg"
                      >
                        {/* Shine effect for enabled button */}
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
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

      {/* Applicants Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredApplicants && filteredApplicants.length > 0 ? (
          filteredApplicants.map((applicant) => {
            const userData = selectedGigData.userDetails.get(applicant.userId);
            if (!userData) return null;

            const isShortlisted = selectedGigData.shortlisted.some(
              (item: any) =>
                item.userId === applicant.userId &&
                item.bandRoleIndex === applicant.bandRoleIndex
            );

            const roleTextColor = getRoleColor(userData.roleType);
            const roleBgColor = getRoleBg(userData.roleType);
            const roleBorderColor = getRoleBorder(userData.roleType);

            return (
              <motion.div
                key={`${applicant.userId}-${applicant.bandRoleIndex}`}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                layout
              >
                <Card
                  className={cn(
                    "group relative overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300",
                    colors.backgroundSecondary,
                    isDarkMode ? "shadow-gray-900/50" : "shadow-gray-400/20"
                  )}
                >
                  {/* Background gradient effect */}
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                      isDarkMode
                        ? "from-green-900/10 via-transparent to-emerald-900/10"
                        : "from-green-50/30 via-transparent to-emerald-50/30"
                    )}
                  />

                  {/* Role badge */}
                  {applicant.bandRole && (
                    <div className="absolute top-3 left-3 z-20">
                      <Badge
                        className={cn(
                          "px-3 py-1 text-xs font-semibold shadow-lg border",
                          isDarkMode
                            ? "bg-green-900/90 text-green-100 border-green-700"
                            : "bg-green-100 text-green-800 border-green-200"
                        )}
                      >
                        <span className="mr-1">
                          {getRoleIcon(applicant.bandRole)}
                        </span>
                        {applicant.bandRole}
                      </Badge>
                    </div>
                  )}

                  {/* Status indicator dot */}
                  <div
                    className={cn(
                      "absolute top-3 right-3 w-2 h-2 rounded-full animate-pulse",
                      getStatusColor(applicant.status).includes("bg-green")
                        ? "bg-green-500"
                        : getStatusColor(applicant.status).includes("bg-yellow")
                          ? "bg-yellow-500"
                          : getStatusColor(applicant.status).includes("bg-red")
                            ? "bg-red-500"
                            : "bg-blue-500"
                    )}
                  />

                  <CardContent className="p-6 relative z-10 pt-16">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <Avatar
                          className={cn(
                            "w-14 h-14 ring-2 ring-offset-2 shadow-lg",
                            isDarkMode ? "ring-gray-800" : "ring-white"
                          )}
                        >
                          <AvatarImage
                            src={userData.picture}
                            className="group-hover:scale-105 transition-transform duration-300"
                          />
                          <AvatarFallback
                            className={cn(
                              "bg-gradient-to-br text-white font-semibold",
                              userData.roleType?.toLowerCase() === "vocalist"
                                ? "from-pink-500 to-rose-500"
                                : userData.roleType?.toLowerCase() === "dj"
                                  ? "from-purple-500 to-violet-500"
                                  : userData.roleType?.toLowerCase() === "mc"
                                    ? "from-orange-500 to-amber-500"
                                    : userData.roleType?.toLowerCase() ===
                                        "musician"
                                      ? "from-amber-500 to-orange-500"
                                      : userData.roleType?.toLowerCase() ===
                                          "booker"
                                        ? "from-emerald-500 to-teal-500"
                                        : "from-blue-500 to-cyan-500"
                            )}
                          >
                            {userData.firstname?.charAt(0)?.toUpperCase() ||
                              userData.username?.charAt(0)?.toUpperCase() ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4
                              className={cn(
                                "font-bold text-lg group-hover:text-green-600 transition-colors",
                                colors.text
                              )}
                            >
                              {userData.firstname || userData.username}
                            </h4>
                            {userData.verifiedIdentity && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className="text-xs font-medium"
                              style={{
                                backgroundColor: roleBgColor,
                                borderColor: roleBorderColor,
                                color: roleTextColor,
                              }}
                            >
                              <Music className="w-3 h-3 mr-1" />
                              {userData.roleType || "Musician"}
                            </Badge>
                            {userData.trustTier &&
                              userData.trustTier !== "new" && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs"
                                  style={{
                                    backgroundColor: isDarkMode
                                      ? colors.proBadgeBg
                                      : colors.proBadgeBg,
                                    borderColor: isDarkMode
                                      ? colors.proBadgeBorder
                                      : colors.proBadgeBorder,
                                    color: isDarkMode
                                      ? colors.proBadgeText
                                      : colors.proBadgeText,
                                  }}
                                >
                                  <Award className="w-3 h-3 mr-1" />
                                  {userData.trustTier}
                                </Badge>
                              )}
                          </div>
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          "px-3 py-1 text-xs font-semibold shadow-sm",
                          getStatusColor(applicant.status)
                        )}
                      >
                        {applicant.status.charAt(0).toUpperCase() +
                          applicant.status.slice(1)}
                      </Badge>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-3 mb-6">
                      <div
                        className={cn(
                          "text-center p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow",
                          isDarkMode
                            ? "from-gray-800 to-gray-900"
                            : "from-white to-gray-50"
                        )}
                      >
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Star className="w-3.5 h-3.5 text-yellow-500" />
                          <p
                            className={cn(
                              "text-xs font-medium",
                              colors.textMuted
                            )}
                          >
                            Rating
                          </p>
                        </div>
                        <p className={cn("text-lg font-bold", colors.text)}>
                          {userData.avgRating?.toFixed(1) || "4.5"}
                        </p>
                      </div>

                      <div
                        className={cn(
                          "text-center p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow",
                          isDarkMode
                            ? "from-gray-800 to-gray-900"
                            : "from-white to-gray-50"
                        )}
                      >
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users className="w-3.5 h-3.5 text-blue-500" />
                          <p
                            className={cn(
                              "text-xs font-medium",
                              colors.textMuted
                            )}
                          >
                            Gigs
                          </p>
                        </div>
                        <p className={cn("text-lg font-bold", colors.text)}>
                          {userData.completedGigsCount || 0}
                        </p>
                      </div>

                      <div
                        className={cn(
                          "text-center p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow",
                          isDarkMode
                            ? "from-gray-800 to-gray-900"
                            : "from-white to-gray-50"
                        )}
                      >
                        <p
                          className={cn(
                            "text-xs font-medium mb-1",
                            colors.textMuted
                          )}
                        >
                          Rate
                        </p>
                        <p className={cn("text-lg font-bold", colors.text)}>
                          ${userData.rate?.baseRate || "Contact"}
                        </p>
                      </div>

                      <div
                        className={cn(
                          "text-center p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow",
                          isDarkMode
                            ? "from-gray-800 to-gray-900"
                            : "from-white to-gray-50"
                        )}
                      >
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <MapPin className="w-3.5 h-3.5 text-green-500" />
                          <p
                            className={cn(
                              "text-xs font-medium",
                              colors.textMuted
                            )}
                          >
                            Location
                          </p>
                        </div>
                        <p
                          className={cn(
                            "text-sm font-semibold truncate",
                            colors.text
                          )}
                        >
                          {userData.city || "Remote"}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      {/* Top row actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className={cn(
                            "flex-1 h-10 transition-all group/profile",
                            colors.border,
                            colors.hoverBg
                          )}
                          onClick={() =>
                            handleViewProfile(
                              selectedGigData.gig._id,
                              applicant.userId
                            )
                          }
                        >
                          <Eye className="w-4 h-4 mr-2 group-hover/profile:scale-110 transition-transform" />
                          Profile
                        </Button>

                        <ChatIcon
                          userId={applicant.userId}
                          size="sm"
                          variant="cozy"
                          className="flex-1 h-10"
                          showText={false}
                        />

                        {isShortlisted ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="flex-1 h-10 bg-gradient-to-r from-red-50 to-red-100 text-red-700 hover:from-red-100 hover:to-red-200 border-red-200"
                            onClick={() =>
                              handleRemoveFromShortlist(
                                selectedGigData.gig._id,
                                applicant.userId,
                                applicant.bandRoleIndex
                              )
                            }
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="flex-1 h-10 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all group/shortlist"
                            onClick={() =>
                              handleAddToShortlist(
                                selectedGigData.gig._id,
                                applicant.userId,
                                applicant.bandRole,
                                applicant.bandRoleIndex
                              )
                            }
                          >
                            <Bookmark className="w-4 h-4 mr-2 group-hover/shortlist:fill-white transition-all" />
                            Shortlist
                          </Button>
                        )}
                      </div>

                      {/* Book Now Button */}
                      <motion.div
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.1 }}
                      >
                        <Button
                          size="lg"
                          className={cn(
                            "w-full h-12 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] font-semibold group/book relative overflow-hidden",
                            "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                          )}
                          onClick={() =>
                            handleBookMusician(
                              applicant.userId,
                              userData.firstname || userData.username,
                              "band-role",
                              undefined,
                              applicant.bandRoleIndex
                            )
                          }
                        >
                          {/* Shine effect */}
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/book:translate-x-full transition-transform duration-1000" />

                          <ShoppingBag className="w-5 h-5 mr-2 relative z-10 group-hover/book:scale-110 transition-transform duration-300" />
                          <span className="relative z-10">Book This Role</span>
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full">
            <Card
              className={cn(
                "text-center py-12 border-dashed border-2",
                colors.backgroundSecondary,
                colors.border
              )}
            >
              <CardContent className="space-y-6">
                <div className="relative inline-block">
                  <div
                    className={cn(
                      "w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 shadow-inner bg-gradient-to-br",
                      isDarkMode
                        ? "from-gray-700 to-gray-800"
                        : "from-gray-200 to-gray-300"
                    )}
                  >
                    <Users className="w-10 h-10 text-gray-500" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center animate-pulse">
                    <Music className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3
                    className={cn(
                      "text-xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r",
                      isDarkMode
                        ? "from-gray-300 to-gray-100"
                        : "from-gray-700 to-gray-900"
                    )}
                  >
                    No band role applicants found
                  </h3>
                  <p className={cn("max-w-md mx-auto", colors.textMuted)}>
                    Share this gig or check back later. Great musicians are on
                    the way!
                  </p>
                </div>
                <Button
                  variant="outline"
                  className={cn(
                    "hover:bg-gray-50 dark:hover:bg-gray-800",
                    colors.border,
                    colors.hoverBg
                  )}
                  onClick={() => window.location.reload()}
                >
                  Refresh Applicants
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  );
};
