// components/gigs/tabs/RegularGigsTab.tsx
import React, { useState, useMemo } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Star,
  Eye,
  XCircle,
  Users,
  ShoppingBag,
  MapPin,
  Award,
  CheckCircle,
  Clock,
  DollarSign,
  Heart,
  Filter,
  Search,
  Sparkles,
  TrendingUp,
  User,
  Briefcase,
  ChevronDown,
} from "lucide-react";
import { ChatIcon } from "@/components/chat/ChatIcon";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { Applicant, GigWithApplicants } from "@/types/bookings";
import { Skeleton } from "@/components/ui/skeleton";
import { useThemeColors } from "@/hooks/useTheme";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrustStarsDisplay } from "../trust/TrustStarsDisplay";
import { getRateSummary } from "@/lib/rates";
import { SelectMusicianButton } from "./SelectMusicianButton";
import { useCurrentUser } from "@/hooks/useCurrentUser"; // Added import
import { ClientRemoveInterestButton } from "./ClientRemove";

interface RegularGigsTabProps {
  selectedGigData: GigWithApplicants;
  filteredApplicants: Applicant[];
  handleAddToShortlist: (
    gigId: Id<"gigs">,
    applicantId: Id<"users">,
    bandRole?: string,
    bandRoleIndex?: number,
  ) => Promise<void>;
  handleRemoveFromShortlist: (
    gigId: Id<"gigs">,
    applicantId: Id<"users">,
    bandRoleIndex?: number,
  ) => Promise<void>;
  handleViewProfile: (
    gigId: Id<"gigs">,
    applicantId: Id<"users">,
  ) => Promise<void>;
  handleBookMusician: (userId: Id<"users">, userName: string) => void; // Add this line
  getStatusColor: (status: string) => string;
  isLoading?: boolean;
}

export const RegularGigsTab: React.FC<RegularGigsTabProps> = ({
  selectedGigData,
  filteredApplicants,
  handleAddToShortlist,
  handleRemoveFromShortlist,
  handleViewProfile,
  handleBookMusician, // Add this
  getStatusColor,
  isLoading = false,
}) => {
  const { colors, mounted } = useThemeColors();
  const { user: currentUser } = useCurrentUser(); // Get current user
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");

  // Get user details for the selected applicant
  const selectedUserData = useMemo(() => {
    if (!selectedApplicant) return null;
    return selectedGigData.userDetails.get(selectedApplicant.userId);
  }, [selectedApplicant, selectedGigData]);

  // Filter and sort applicants
  const processedApplicants = useMemo(() => {
    let results = [...filteredApplicants];

    // Apply search filter
    if (searchQuery) {
      results = results.filter((applicant) => {
        const user = selectedGigData.userDetails.get(applicant.userId);
        if (!user) return false;

        const searchLower = searchQuery.toLowerCase();
        return (
          user.firstname?.toLowerCase().includes(searchLower) ||
          user.username?.toLowerCase().includes(searchLower) ||
          user.city?.toLowerCase().includes(searchLower) ||
          user.roleType?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      results = results.filter(
        (applicant) => applicant.status === statusFilter,
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      results = results.filter((applicant) => {
        const user = selectedGigData.userDetails.get(applicant.userId);
        return user?.roleType?.toLowerCase() === roleFilter.toLowerCase();
      });
    }

    // Apply sorting
    results.sort((a, b) => {
      const userA = selectedGigData.userDetails.get(a.userId);
      const userB = selectedGigData.userDetails.get(b.userId);

      switch (sortBy) {
        case "rating":
          return (userB?.avgRating || 0) - (userA?.avgRating || 0);
        case "experience":
          return (
            (userB?.completedGigsCount || 0) - (userA?.completedGigsCount || 0)
          );
        case "rate":
          const rateA = parseFloat(userA?.rate?.baseRate || "0");
          const rateB = parseFloat(userB?.rate?.baseRate || "0");
          return rateA - rateB;
        case "recent":
        default:
          return (
            new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
          );
      }
    });

    return results;
  }, [
    filteredApplicants,
    selectedGigData,
    searchQuery,
    statusFilter,
    roleFilter,
    sortBy,
  ]);

  // Get unique roles for filter
  const uniqueRoles = useMemo(() => {
    const roles = new Set<string>();
    filteredApplicants.forEach((applicant) => {
      const user = selectedGigData.userDetails.get(applicant.userId);
      if (user?.roleType) {
        roles.add(user.roleType);
      }
    });
    return Array.from(roles);
  }, [filteredApplicants, selectedGigData]);

  // Get role color utilities
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

  const formatRateSummary = (userData?: any) => {
    // Use the provided userData or fall back to selectedUserData
    const targetUserData = userData || selectedUserData;

    // Get the average rate from the user's rate data
    const avgRate =
      targetUserData?.rate?.baseRate ||
      targetUserData?.rate?.averageRate ||
      targetUserData?.averageRate ||
      0;

    // Convert to number if it's a string
    let numericValue = 0;

    if (typeof avgRate === "number") {
      numericValue = avgRate;
    } else if (typeof avgRate === "string") {
      // Remove any formatting (commas, currency symbols)
      const cleaned = avgRate.replace(/[^\d.]/g, "");
      numericValue = parseFloat(cleaned) || 0;
    }

    // Round up to nearest thousand
    const roundedValue = Math.ceil(numericValue / 1000) * 1000;

    // Format with KES currency
    return `KES ${roundedValue.toLocaleString()}`;
  };

  // Check if applicant is shortlisted
  const isShortlisted = (applicantId: Id<"users">) => {
    return selectedGigData.shortlisted.some(
      (item: any) => item.userId === applicantId,
    );
  };

  if (!mounted || isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left sidebar skeleton */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-2 w-16" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-8 rounded-lg" />
                    ))}
                  </div>
                  <Skeleton className="h-8 w-full rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        {/* Right panel skeleton */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
        type: "tween",
      },
    },
    hover: {
      y: -4,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Sidebar - Applicant Cards */}
      <div className="lg:w-2/3">
        {/* Header with filters */}
        <div className={cn("p-4 rounded-xl mb-6", colors.backgroundSecondary)}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search applicants by name, role, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] rounded-xl">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                </SelectContent>
              </Select>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[140px] rounded-xl">
                  <User className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {uniqueRoles.map((role) => (
                    <SelectItem key={role} value={role.toLowerCase()}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sort Tabs */}
          <div className="mt-4">
            <Tabs value={sortBy} onValueChange={setSortBy}>
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="recent" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Recent
                </TabsTrigger>
                <TabsTrigger value="rating" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Rating
                </TabsTrigger>
                <TabsTrigger value="experience" className="text-xs">
                  <Briefcase className="w-3 h-3 mr-1" />
                  Experience
                </TabsTrigger>
                <TabsTrigger value="rate" className="text-xs">
                  <DollarSign className="w-3 h-3 mr-1" />
                  Rate
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Applicant Cards Grid */}
        <AnimatePresence mode="wait">
          {processedApplicants.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {processedApplicants.map((applicant) => {
                const userData = selectedGigData.userDetails.get(
                  applicant.userId,
                );
                if (!userData) return null;

                const shortlisted = isShortlisted(applicant.userId);
                const isSelected =
                  selectedApplicant?.userId === applicant.userId;

                return (
                  <motion.div
                    key={applicant.userId}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    layout
                  >
                    <Card
                      className={cn(
                        "group cursor-pointer transition-all duration-300",
                        colors.border,
                        "hover:shadow-lg",
                        isSelected && "ring-2 ring-orange-500 shadow-xl",
                      )}
                    >
                      <CardContent className="p-4">
                        {/* Minimal Card View - Always Visible */}
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <Avatar className="w-12 h-12 border-2 border-white shadow-lg flex-shrink-0">
                            <AvatarImage src={userData.picture} />
                            <AvatarFallback
                              className={cn(
                                "bg-gradient-to-br text-white font-semibold",
                                userData.roleType?.toLowerCase() === "vocalist"
                                  ? "from-pink-500 to-rose-500"
                                  : userData.roleType?.toLowerCase() === "dj"
                                    ? "from-purple-500 to-violet-500"
                                    : userData.roleType?.toLowerCase() === "mc"
                                      ? "from-orange-500 to-amber-500"
                                      : "from-blue-500 to-cyan-500",
                              )}
                            >
                              {userData.firstname?.charAt(0)?.toUpperCase() ||
                                "U"}
                            </AvatarFallback>
                          </Avatar>

                          {/* Minimal Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-sm truncate">
                                {`${userData.firstname || ""} ${userData.username || ""}`.trim()}
                              </h4>
                              {userData.verifiedIdentity && (
                                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                              )}
                              {shortlisted && (
                                <Heart className="w-3 h-3 fill-red-500 text-red-500 flex-shrink-0" />
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant="outline"
                                className="text-xs"
                                style={{
                                  backgroundColor: getRoleBg(userData.roleType),
                                  borderColor: getRoleBorder(userData.roleType),
                                  color: getRoleColor(userData.roleType),
                                }}
                              >
                                {userData.roleType || "Musician"}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-xs",
                                  getStatusColor(applicant.status),
                                )}
                              >
                                {applicant.status}
                              </Badge>
                            </div>
                          </div>

                          {/* More Icon - Click to Expand */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedApplicant(
                                isSelected ? null : applicant,
                              );
                            }}
                          >
                            <motion.div
                              animate={{ rotate: isSelected ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </motion.div>
                          </Button>
                        </div>

                        {/* Expanded View - Shows when selected */}
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-4 mt-3 border-t space-y-3">
                                {/* Stats */}
                                <div className="grid grid-cols-4 gap-2">
                                  <div className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <Star className="w-3 h-3 text-yellow-500" />
                                      <span className="text-xs font-bold">
                                        <TrustStarsDisplay
                                          trustStars={
                                            userData.trustStars?.toFixed(1) ||
                                            "4.5"
                                          }
                                          size="sm"
                                          className="-ml-5 text-orange-400"
                                        />
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-gray-500">
                                      Rating
                                    </span>
                                  </div>

                                  <div className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <Briefcase className="w-3 h-3 text-blue-500" />
                                      <span className="text-xs font-bold">
                                        {userData.completedGigsCount || 0}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-gray-500">
                                      Gigs
                                    </span>
                                  </div>

                                  <div className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <DollarSign className="w-3 h-3 text-green-500" />
                                      <span className="text-xs font-bold">
                                        {formatRateSummary(userData)
                                          .split(" ")[1]
                                          ?.slice(0, 3) || "N/A"}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-gray-500">
                                      Rate
                                    </span>
                                  </div>

                                  <div className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <MapPin className="w-3 h-3 text-purple-500" />
                                      <span className="text-xs font-bold truncate">
                                        {userData.city?.slice(0, 3) || "RMT"}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-gray-500">
                                      Loc
                                    </span>
                                  </div>
                                </div>

                                {/* Action Buttons - Three columns layout */}
                                <div className="grid grid-cols-3 gap-2">
                                  {/* View Profile */}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewProfile(
                                        selectedGigData.gig._id,
                                        applicant.userId,
                                      );
                                    }}
                                  >
                                    <Eye className="w-3 h-3 mr-1" />
                                    View
                                  </Button>

                                  {/* Select Musician */}
                                  <SelectMusicianButton
                                    gigId={selectedGigData.gig._id}
                                    musicianId={applicant.userId}
                                    musicianName={
                                      userData.firstname || userData.username
                                    }
                                    gigTitle={selectedGigData.gig.title}
                                    variant="default"
                                    size="sm"
                                    showText={true}
                                    className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                                  />
                                </div>

                                {/* Remove Interest Button - Full width */}
                                <div className="mt-2 flex flex-col gap-2">
                                  {/* Shortlist/Unshortlist */}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      shortlisted
                                        ? handleRemoveFromShortlist(
                                            selectedGigData.gig._id,
                                            applicant.userId,
                                          )
                                        : handleAddToShortlist(
                                            selectedGigData.gig._id,
                                            applicant.userId,
                                          );
                                    }}
                                  >
                                    {shortlisted ? (
                                      <>
                                        <XCircle className="w-3 h-3 mr-1" />
                                        Unlist
                                      </>
                                    ) : (
                                      <>
                                        <Heart className="w-3 h-3 mr-1" />
                                        Shortlist
                                      </>
                                    )}
                                  </Button>
                                  <ClientRemoveInterestButton
                                    gigId={selectedGigData.gig._id}
                                    userIdToRemove={applicant.userId}
                                    musicianName={
                                      userData.firstname || userData.username
                                    }
                                    gigTitle={selectedGigData.gig.title}
                                    variant="destructive"
                                    size="sm"
                                    showText={true}
                                    className="w-full h-8 text-xs"
                                    onSuccess={() => {
                                      // Refresh or update state after removal
                                      setSelectedApplicant(null);
                                    }}
                                  />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <Card className={cn("text-center p-8", colors.backgroundSecondary)}>
              <CardContent className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
                  <Users className="w-8 h-8 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">
                    No applicants found
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Try adjusting your filters or share the gig to attract more
                    applicants.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </AnimatePresence>
      </div>

      {/* Right Panel - Selected Applicant Details */}
      <div className="lg:w-1/3">
        <Card className={cn("sticky top-6", colors.border)}>
          <CardContent className="p-6">
            {selectedUserData && selectedApplicant ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 border-4 border-white shadow-xl">
                    <AvatarImage src={selectedUserData.picture} />
                    <AvatarFallback
                      className={cn(
                        "bg-gradient-to-br text-white font-bold text-xl",
                        selectedUserData.roleType?.toLowerCase() === "vocalist"
                          ? "from-pink-500 to-rose-500"
                          : selectedUserData.roleType?.toLowerCase() === "dj"
                            ? "from-purple-500 to-violet-500"
                            : selectedUserData.roleType?.toLowerCase() === "mc"
                              ? "from-orange-500 to-amber-500"
                              : "from-blue-500 to-cyan-500",
                      )}
                    >
                      {selectedUserData.firstname?.charAt(0)?.toUpperCase() ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-xl">
                        {selectedUserData.firstname ||
                          selectedUserData.username}
                      </h2>
                      {selectedUserData.verifiedIdentity && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        className="font-medium"
                        style={{
                          backgroundColor: getRoleBg(selectedUserData.roleType),
                          borderColor: getRoleBorder(selectedUserData.roleType),
                          color: getRoleColor(selectedUserData.roleType),
                        }}
                      >
                        {selectedUserData.roleType || "Musician"}
                      </Badge>
                      {selectedUserData.trustTier &&
                        selectedUserData.trustTier !== "new" && (
                          <Badge variant="outline" className="text-xs">
                            <Award className="w-3 h-3 mr-1" />
                            {selectedUserData.trustTier}
                          </Badge>
                        )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="text-xl font-bold">
                        {selectedUserData.trustStars?.toFixed(1) || "4.5"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">Trust Rating/Stars</p>
                  </div>

                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Briefcase className="w-5 h-5 text-blue-500" />
                      <span className="text-xl font-bold">
                        {selectedUserData.completedGigsCount || 0}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">Gigs Completed</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="font-medium">Avg Rate</span>
                    </div>
                    <span className="font-bold text-lg">
                      {formatRateSummary()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-500" />
                      <span className="font-medium">Location</span>
                    </div>
                    <span className="font-medium">
                      {selectedUserData.city || "Remote"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">Applied</span>
                    </div>
                    <span className="font-medium">
                      {new Date(
                        selectedApplicant.appliedAt,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Bio */}
                {selectedUserData.bio && (
                  <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      About
                    </h4>
                    <p className="text-sm">{selectedUserData.bio}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() =>
                        handleViewProfile(
                          selectedGigData.gig._id,
                          selectedApplicant.userId,
                        )
                      }
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Full Profile
                    </Button>
                    <ChatIcon
                      userId={selectedApplicant.userId}
                      size="sm"
                      variant="cozy"
                      className="flex-1"
                      showText={false}
                    />
                  </div>

                  {/* Select Musician Button */}
                  <SelectMusicianButton
                    gigId={selectedGigData.gig._id}
                    musicianId={selectedApplicant.userId}
                    musicianName={
                      selectedUserData.firstname || selectedUserData.username
                    }
                    gigTitle={selectedGigData.gig.title}
                    className="w-full h-12 text-white font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    showText={true}
                  />

                  {/* Remove Interest Button */}
                  <ClientRemoveInterestButton
                    gigId={selectedGigData.gig._id}
                    userIdToRemove={selectedApplicant.userId}
                    musicianName={
                      selectedUserData.firstname || selectedUserData.username
                    }
                    gigTitle={selectedGigData.gig.title}
                    variant="destructive"
                    size="default"
                    showText={true}
                    className="w-full"
                    onSuccess={() => {
                      setSelectedApplicant(null);
                    }}
                  />

                  {/* Shortlist Button */}
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() =>
                      isShortlisted(selectedApplicant.userId)
                        ? handleRemoveFromShortlist(
                            selectedGigData.gig._id,
                            selectedApplicant.userId,
                          )
                        : handleAddToShortlist(
                            selectedGigData.gig._id,
                            selectedApplicant.userId,
                          )
                    }
                  >
                    {isShortlisted(selectedApplicant.userId) ? (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Remove from Shortlist
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 mr-2" />
                        Add to Shortlist
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 mb-6">
                  <User className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="font-bold text-xl mb-2">Select an Applicant</h3>
                <p className="text-gray-500 mb-6">
                  Click on any applicant card to view their detailed profile and
                  take action.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 text-orange-700 dark:text-orange-300">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {processedApplicants.length} applicants available
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
