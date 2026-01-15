// components/gigs/tabs/RegularGigsTab.tsx
import React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Star,
  Eye,
  Bookmark,
  XCircle,
  Users,
  ShoppingBag,
  MapPin,
  Calendar,
  Music,
  Award,
  CheckCircle,
} from "lucide-react";
import { ChatIcon } from "@/components/chat/ChatIcon";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Applicant, GigWithApplicants } from "@/types/bookings";
import { Skeleton } from "@/components/ui/skeleton";
import { useThemeColors } from "@/hooks/useTheme";

interface RegularGigsTabProps {
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
  handleBookMusician: (userId: Id<"users">, userName: string) => void;
  getStatusColor: (status: string) => string;
  isLoading?: boolean;
}

export const RegularGigsTab: React.FC<RegularGigsTabProps> = ({
  selectedGigData,
  filteredApplicants,
  handleAddToShortlist,
  handleRemoveFromShortlist,
  handleViewProfile,
  handleBookMusician,
  getStatusColor,
  isLoading = false,
}) => {
  const { colors, isDarkMode, mounted } = useThemeColors();

  if (!mounted) {
    return (
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
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // FIX: Use proper easing types for Framer Motion
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut" as const, // Use string literal type
      },
    },
    hover: {
      y: -6,
      transition: {
        duration: 0.2,
        ease: "easeInOut" as const, // Use string literal type
      },
    },
  };

  if (isLoading) {
    return (
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
    );
  }

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

  return (
    <AnimatePresence mode="wait">
      {filteredApplicants && filteredApplicants.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredApplicants.map((applicant) => {
            const userData = selectedGigData.userDetails.get(applicant.userId);
            if (!userData) return null;

            const isShortlisted = selectedGigData.shortlisted.some(
              (item: any) => item.userId === applicant.userId
            );

            const roleTextColor = getRoleColor(userData.roleType);
            const roleBgColor = getRoleBg(userData.roleType);
            const roleBorderColor = getRoleBorder(userData.roleType);

            return (
              <motion.div
                key={applicant.userId}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                exit="hidden"
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
                        ? "from-purple-900/10 via-transparent to-pink-900/10"
                        : "from-purple-50/30 via-transparent to-pink-50/30"
                    )}
                  />

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

                  <CardContent className="p-6 relative z-10">
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
                                "font-bold text-lg group-hover:text-purple-600 transition-colors",
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
                          "text-center p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow group/stat",
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
                          "text-center p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow group/stat",
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
                          "text-center p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow group/stat",
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
                          "text-center p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow group/stat",
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
                            "flex-1 h-10  transition-all ",
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
                            className="flex-1 h-10 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 text-rose-700 dark:text-rose-300 hover:from-rose-100 hover:to-pink-100 dark:hover:from-rose-800/30 dark:hover:to-pink-800/30 border-rose-200 dark:border-rose-800"
                            onClick={() =>
                              handleRemoveFromShortlist(
                                selectedGigData.gig._id,
                                applicant.userId
                              )
                            }
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="flex-1 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-md hover:shadow-lg transition-all group/shortlist"
                            onClick={() =>
                              handleAddToShortlist(
                                selectedGigData.gig._id,
                                applicant.userId
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
                        transition={{ duration: 0.1, ease: "easeInOut" }}
                      >
                        <Button
                          size="lg"
                          className={cn(
                            "w-full h-12 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] font-semibold group/book relative overflow-hidden",
                            colors.gradientPrimary
                          )}
                          onClick={() =>
                            handleBookMusician(
                              applicant.userId,
                              userData.firstname || userData.username
                            )
                          }
                        >
                          {/* Shine effect */}
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/book:translate-x-full transition-transform duration-1000" />

                          <ShoppingBag className="w-5 h-5 mr-2 relative z-10 group-hover/book:scale-110 transition-transform duration-300" />
                          <span className="relative z-10">Book Now</span>
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Card
            className={cn(
              "text-center py-16 border-dashed border-2",
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
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center animate-pulse">
                  <Calendar className="w-5 h-5 text-white" />
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
                  No applicants found
                </h3>
                <p className={cn("max-w-md mx-auto", colors.textMuted)}>
                  Share this gig or check back later. Great talent is on the
                  way!
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};
