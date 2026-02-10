"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  Users,
  Briefcase,
  User,
  CheckCircle,
  Filter,
  Clock,
  Search,
  Loader2,
  AlertCircle,
  Bookmark,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useThemeColors } from "@/hooks/useTheme";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
// Import date utilities
import {
  getGigDateStatus,
  formatGigDate,
  calculateGigDateStats,
  formatTimeWithDuration,
} from "../helper/getGigDateStatus";

// Define proper types for Framer Motion variants
import type { Variants } from "framer-motion";
import { formatDistanceToNow, differenceInHours } from "date-fns";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20,
    },
  },
  tap: {
    scale: 0.98,
  },
};

const statsVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  }),
};

const filterVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 30,
    },
  },
};

const emptyStateVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
    },
  },
};

export const BookedGigs = ({ user }: { user: any }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewFilter, setViewFilter] = useState<"all" | "client" | "musician">(
    "all",
  );
  const [dateFilter, setDateFilter] = useState<
    "all" | "upcoming" | "past" | "today"
  >("all");
  const [paymentFilter, setPaymentFilter] = useState<
    "all" | "paid" | "pending"
  >("all");
  const [cancellationReason, setCancellationReason] = useState("");
  const [selectedGig, setSelectedGig] = useState<any>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [filterAnimationKey, setFilterAnimationKey] = useState(0);

  const { colors, isDarkMode } = useThemeColors();

  // Fetch all gigs from Convex
  const allGigs = useQuery(api.controllers.gigs.getAllActiveGigs, {
    limit: 100,
  });

  // Define mutations
  const removeInterestFromGig = useMutation(
    api.controllers.gigs.removeInterestFromGig,
  );
  const unbookFromBandRole = useMutation(
    api.controllers.bookings.unbookFromBandRole,
  );

  const timeSinceSaved = (dateString: string | Date): string => {
    if (!dateString) return "Just now";
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Check if cancellation is within 3 days
  const isWithinThreeDayCancellation = (gig: any): boolean => {
    const gigDate = new Date(gig.date);
    const now = new Date();
    const hoursDifference = differenceInHours(gigDate, now);
    return hoursDifference < 72; // 3 days = 72 hours
  };

  // Check if it's last-minute cancellation (less than 24 hours)
  const isLastMinuteCancellation = (gig: any): boolean => {
    const gigDate = new Date(gig.date);
    const now = new Date();
    const hoursDifference = differenceInHours(gigDate, now);
    return hoursDifference < 24;
  };

  // Calculate trust score penalty based on timing
  const calculateTrustPenalty = (gig: any): number => {
    const gigDate = new Date(gig.date);
    const now = new Date();
    const hoursDifference = differenceInHours(gigDate, now);

    if (hoursDifference < 24) {
      return 20; // Last-minute cancellation
    } else if (hoursDifference < 72) {
      return 10; // Within 3 days
    }
    return 0; // More than 3 days - NO PENALTY
  };

  // Filter ONLY gigs that are isTaken AND user is involved
  const bookedGigs = useMemo(() => {
    if (!allGigs || !user) return [];

    const userId = user._id;

    // Filter only isTaken gigs (all booked gigs)
    const takenGigs = allGigs.filter((gig: any) => gig.isTaken === true);

    // Then filter where user is involved
    return takenGigs.filter((gig: any) => {
      const isClient = gig.postedBy === userId;
      const isBookedMusician = gig.bookedBy === userId;
      const isInBookedUsers =
        Array.isArray(gig.bookedUsers) && gig.bookedUsers.includes(userId);

      // For band gigs, check if user is booked in any role
      let isBookedInBand = false;
      if (gig.bandCategory && Array.isArray(gig.bandCategory)) {
        isBookedInBand = gig.bandCategory.some(
          (role: any) =>
            Array.isArray(role.bookedUsers) &&
            role.bookedUsers.includes(userId),
        );
      }

      return isClient || isBookedMusician || isInBookedUsers || isBookedInBand;
    });
  }, [allGigs, user]);

  // Update filtered gigs with animations
  const filteredGigs = useMemo(() => {
    if (!bookedGigs || bookedGigs.length === 0) return [];

    let filtered = [...bookedGigs];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (gig: any) =>
          gig.title.toLowerCase().includes(term) ||
          gig.description.toLowerCase().includes(term) ||
          (gig.location && gig.location.toLowerCase().includes(term)),
      );
    }

    // Apply view filter (client vs musician)
    if (viewFilter !== "all" && user) {
      const userId = user._id;
      filtered = filtered.filter((gig: any) => {
        const isClient = gig.postedBy === userId;
        const isBookedMusician = gig.bookedBy === userId;
        const isInBookedUsers =
          Array.isArray(gig.bookedUsers) && gig.bookedUsers.includes(userId);

        let isBookedInBand = false;
        if (gig.bandCategory && Array.isArray(gig.bandCategory)) {
          isBookedInBand = gig.bandCategory.some(
            (role: any) =>
              Array.isArray(role.bookedUsers) &&
              role.bookedUsers.includes(userId),
          );
        }

        const isMusician =
          isBookedMusician || isInBookedUsers || isBookedInBand;

        if (viewFilter === "client") return isClient;
        if (viewFilter === "musician") return isMusician;
        return true;
      });
    }

    // Apply date filter using gig date AND time
    if (dateFilter !== "all") {
      filtered = filtered.filter((gig: any) => {
        const dateStatus = getGigDateStatus(gig.date, gig.time);

        if (dateFilter === "upcoming") return !dateStatus.exactPast;
        if (dateFilter === "past") return dateStatus.exactPast;
        if (dateFilter === "today") return dateStatus.isToday;
        return true;
      });
    }

    // Apply payment filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter((gig: any) => {
        if (paymentFilter === "paid") return gig.isActive === false;
        if (paymentFilter === "pending") return gig.isActive === true;
        return true;
      });
    }

    // Sort by date (upcoming first, then past)
    return filtered.sort((a: any, b: any) => {
      const statusA = getGigDateStatus(a.date, a.time);
      const statusB = getGigDateStatus(b.date, b.time);

      // Upcoming gigs first
      if (!statusA.exactPast && statusB.exactPast) return -1;
      if (statusA.exactPast && !statusB.exactPast) return 1;

      // Then sort by date (closest first for upcoming, most recent first for past)
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      if (!statusA.exactPast) {
        // For upcoming: earliest date first
        return dateA - dateB;
      } else {
        // For past: most recent first
        return dateB - dateA;
      }
    });
  }, [bookedGigs, searchTerm, viewFilter, dateFilter, paymentFilter, user]);

  // Handle initial load animation
  useEffect(() => {
    if (allGigs && user) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [allGigs, user]);

  // Trigger animation when filters change
  useEffect(() => {
    setFilterAnimationKey((prev) => prev + 1);
  }, [searchTerm, viewFilter, dateFilter, paymentFilter]);

  const getUserRoleInGig = (
    gig: any,
  ): {
    role: string;
    badgeColor: string;
    icon: React.ReactNode;
    isPaid: boolean;
    paymentStatus: "paid" | "pending";
    canCancel: boolean;
    cancellationType: "regular" | "band" | "client";
  } => {
    const userId = user._id;
    const isPaid = gig.isActive === false;
    const paymentStatus = isPaid ? "paid" : "pending";

    // Determine if user can cancel (only for upcoming gigs)
    const dateStatus = getGigDateStatus(gig.date, gig.time);
    const canCancel = !dateStatus.exactPast;

    if (gig.postedBy === userId) {
      return {
        role: "Client",
        badgeColor: isPaid
          ? "bg-blue-100 text-blue-800 border-blue-300"
          : "bg-blue-100 text-blue-800 border-blue-200",
        icon: <Briefcase className="w-4 h-4" />,
        isPaid,
        paymentStatus,
        canCancel,
        cancellationType: "client",
      };
    }

    if (gig.bookedBy === userId) {
      return {
        role: "Booked Musician",
        badgeColor: isPaid
          ? "bg-green-100 text-green-800 border-green-300"
          : "bg-green-100 text-green-800 border-green-200",
        icon: <User className="w-4 h-4" />,
        isPaid,
        paymentStatus,
        canCancel,
        cancellationType: "regular",
      };
    }

    if (Array.isArray(gig.bookedUsers) && gig.bookedUsers.includes(userId)) {
      return {
        role: "Band Member",
        badgeColor: isPaid
          ? "bg-purple-100 text-purple-800 border-purple-300"
          : "bg-purple-100 text-purple-800 border-purple-200",
        icon: <Users className="w-4 h-4" />,
        isPaid,
        paymentStatus,
        canCancel,
        cancellationType: gig.isClientBand ? "band" : "regular",
      };
    }

    // Check for band role booking
    if (gig.bandCategory && Array.isArray(gig.bandCategory)) {
      for (const role of gig.bandCategory) {
        if (
          Array.isArray(role.bookedUsers) &&
          role.bookedUsers.includes(userId)
        ) {
          return {
            role: `${role.role}`,
            badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
            icon: <Users className="w-4 h-4" />,
            isPaid,
            paymentStatus,
            canCancel,
            cancellationType: "band",
          };
        }
      }
    }

    return {
      role: "Booked",
      badgeColor: "bg-gray-100 text-gray-800 border-gray-200",
      icon: <CheckCircle className="w-4 h-4" />,
      isPaid,
      paymentStatus,
      canCancel: false,
      cancellationType: "regular",
    };
  };

  // Get gig type
  const getGigType = (gig: any): string => {
    if (gig.isClientBand) {
      const bandRoles = gig.bandCategory?.length || 0;
      const bookedCount =
        gig.bandCategory?.reduce(
          (total: number, role: any) => total + (role.bookedUsers?.length || 0),
          0,
        ) || 0;
      return `Band Gig (${bookedCount}/${bandRoles} booked)`;
    }
    return "Regular Gig";
  };

  // Calculate stats with payment status
  const stats = useMemo(() => {
    if (!bookedGigs.length) return null;

    const userId = user?._id;

    const clientGigs = bookedGigs.filter(
      (g: any) => g.postedBy === userId,
    ).length;
    const musicianGigs = bookedGigs.filter((g: any) => {
      const isBookedMusician = g.bookedBy === userId;
      const isInBookedUsers =
        Array.isArray(g.bookedUsers) && g.bookedUsers.includes(userId);
      let isBookedInBand = false;
      if (g.bandCategory) {
        isBookedInBand = g.bandCategory.some(
          (r: any) =>
            Array.isArray(r.bookedUsers) && r.bookedUsers.includes(userId),
        );
      }
      return isBookedMusician || isInBookedUsers || isBookedInBand;
    }).length;

    const dateStats = calculateGigDateStats(bookedGigs);

    // Payment stats
    const paidGigs = bookedGigs.filter((g: any) => g.isActive === false).length;
    const pendingPaymentGigs = bookedGigs.filter(
      (g: any) => g.isActive === true,
    ).length;

    return {
      total: bookedGigs.length,
      client: clientGigs,
      musician: musicianGigs,
      upcoming: dateStats.upcoming,
      past: dateStats.past,
      today: dateStats.today,
      regularGigs: bookedGigs.filter((g: any) => !g.isClientBand).length,
      bandGigs: bookedGigs.filter((g: any) => g.isClientBand).length,
      paid: paidGigs,
      pendingPayment: pendingPaymentGigs,
    };
  }, [bookedGigs, user]);

  // Handle cancellation based on user role and gig type
  const handleCancelBooking = async () => {
    if (!selectedGig || !cancellationReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    setIsCancelling(true);
    try {
      const userRole = getUserRoleInGig(selectedGig);
      const within3Days = isWithinThreeDayCancellation(selectedGig);
      const lastMinute = isLastMinuteCancellation(selectedGig);
      const penaltyAmount = calculateTrustPenalty(selectedGig);

      let result;

      if (userRole.cancellationType === "client") {
        // Client cancelling the entire gig
        toast.info("Client cancellation logic would go here");
        // You would need a separate mutation for client cancellation
      } else if (userRole.cancellationType === "band") {
        // Musician cancelling from a band gig
        // Find the band role index for this user
        const roleIndex = selectedGig.bandCategory?.findIndex(
          (role: any) =>
            Array.isArray(role.bookedUsers) &&
            role.bookedUsers.includes(user._id),
        );

        if (roleIndex !== -1 && roleIndex !== undefined) {
          result = await unbookFromBandRole({
            gigId: selectedGig._id,
            userId: user._id,
            bandRoleIndex: roleIndex,
            clerkId: user.clerkId,
            reason: cancellationReason,
            isFromBooked: true,
          });
        } else {
          throw new Error("Could not find band role");
        }
      } else {
        // Regular musician cancelling from a regular gig
        result = await removeInterestFromGig({
          gigId: selectedGig._id,
          userId: user._id,
          reason: cancellationReason,
          isFromBooked: true,
        });
      }

      // Show appropriate message based on penalty
      if (within3Days && penaltyAmount > 0) {
        toast.warning(
          `Booking cancelled. Trust score penalty applied: -${penaltyAmount} points${
            lastMinute ? " (last-minute cancellation)" : " (within 3 days)"
          }`,
          { duration: 5000 },
        );
      } else {
        toast.success("Booking cancelled. No trust score penalty applied.");
      }

      // Reset form and close dialog
      setCancellationReason("");
      setSelectedGig(null);
      setCancelDialogOpen(false);
    } catch (error: any) {
      console.error("Error cancelling booking:", error);
      toast.error(
        error.message || "Failed to cancel booking. Please try again.",
      );
    } finally {
      setIsCancelling(false);
    }
  };

  // Open cancellation dialog
  const openCancelDialog = (gig: any) => {
    const userRole = getUserRoleInGig(gig);
    const within3Days = isWithinThreeDayCancellation(gig);
    const lastMinute = isLastMinuteCancellation(gig);
    const penaltyAmount = calculateTrustPenalty(gig);

    setSelectedGig(gig);
    setCancellationReason("");
    setCancelDialogOpen(true);

    // Show warning if within 3 days
    if (within3Days) {
      setTimeout(() => {
        toast.warning(
          `⚠️ Cancelling within ${lastMinute ? "24 hours" : "3 days"} will result in a trust score penalty of -${penaltyAmount} points`,
          { duration: 6000 },
        );
      }, 300);
    }
  };

  // Get cancellation button label based on user role
  const getCancelButtonLabel = (gig: any) => {
    const userRole = getUserRoleInGig(gig);

    if (userRole.cancellationType === "client") {
      return "Cancel Gig";
    } else if (userRole.cancellationType === "band") {
      return "Leave Band Role";
    } else {
      return "Cancel Booking";
    }
  };

  // Get cancellation penalty info
  const getCancellationPenaltyInfo = (gig: any) => {
    const within3Days = isWithinThreeDayCancellation(gig);
    const lastMinute = isLastMinuteCancellation(gig);
    const penaltyAmount = calculateTrustPenalty(gig);

    if (!within3Days || penaltyAmount === 0) {
      return {
        penalty: 0,
        description:
          "No trust score penalty (cancelled more than 3 days in advance)",
        color: "text-green-500",
        warning: false,
      };
    }

    if (lastMinute) {
      return {
        penalty: penaltyAmount,
        description: `Significant penalty: -${penaltyAmount} points (last-minute cancellation)`,
        color: "text-red-500",
        warning: true,
      };
    }

    return {
      penalty: penaltyAmount,
      description: `Moderate penalty: -${penaltyAmount} points (within 3 days)`,
      color: "text-yellow-500",
      warning: true,
    };
  };

  // Loading skeleton
  if (isInitialLoad && (!allGigs || !user)) {
    return (
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-4 w-96 max-w-full" />
        </motion.div>

        {/* Animated skeleton stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Skeleton className="h-24 rounded-xl" />
            </motion.div>
          ))}
        </div>

        {/* Animated skeleton filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Skeleton className="h-12" />
            </motion.div>
          ))}
        </div>

        {/* Animated skeleton cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Skeleton className="h-64 rounded-xl" />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Data loaded but no gigs
  if (bookedGigs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="p-6"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <h2 className="text-2xl font-bold">Booked Gigs</h2>
          </div>
          <p className={cn("text-muted-foreground", colors.textMuted)}>
            ✅ Successfully booked gigs where you're involved as a client or
            musician
          </p>
        </motion.div>

        <motion.div
          variants={emptyStateVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Booked Gigs Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't booked or been booked for any gigs yet
              </p>
              <div className="flex gap-3 justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => (window.location.href = "/gigs/explore")}
                    variant="outline"
                  >
                    Explore Gigs
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => (window.location.href = "/gigs/create")}
                  >
                    Create a Gig
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <h2 className="text-2xl font-bold">Booked Gigs</h2>
        </div>
        <p className={cn("text-muted-foreground", colors.textMuted)}>
          ✅ Successfully booked gigs where you're involved as a client or
          musician
        </p>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <motion.div
          key="stats"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4"
        >
          {Object.entries(stats).map(([key, value], index) => (
            <motion.div
              key={key}
              custom={index}
              variants={statsVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </p>
                    <p className="text-2xl font-bold">{value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        key={`filters-${filterAnimationKey}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4"
      >
        {/* Search */}
        <motion.div variants={filterVariants}>
          <div className="relative">
            <Input
              placeholder="Search booked gigs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </motion.div>

        {/* Role filter */}
        <motion.div variants={filterVariants}>
          <Select
            value={viewFilter}
            onValueChange={(value: any) => setViewFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="client">Client Only</SelectItem>
              <SelectItem value="musician">Musician Only</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Date filter */}
        <motion.div variants={filterVariants}>
          <Select
            value={dateFilter}
            onValueChange={(value: any) => setDateFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="past">Past</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Payment status filter */}
        <motion.div variants={filterVariants}>
          <Select
            value={paymentFilter}
            onValueChange={(value: any) => setPaymentFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="paid">Paid Only</SelectItem>
              <SelectItem value="pending">Pending Payment</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Clear filters button */}
        <AnimatePresence>
          {(searchTerm ||
            viewFilter !== "all" ||
            dateFilter !== "all" ||
            paymentFilter !== "all") && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              variants={filterVariants}
            >
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setViewFilter("all");
                  setDateFilter("all");
                  setPaymentFilter("all");
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Gig List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`gig-list-${filterAnimationKey}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredGigs.map((gig: any, index) => {
            const userRole = getUserRoleInGig(gig);
            const dateStatus = getGigDateStatus(gig.date, gig.time);
            const gigType = getGigType(gig);
            const isAvailable = gig.isActive && !gig.isTaken;
            const penaltyInfo = getCancellationPenaltyInfo(gig);
            const canCancel = userRole.canCancel && !dateStatus.exactPast;
            const cancelButtonLabel = getCancelButtonLabel(gig);

            return (
              <motion.div
                key={gig._id}
                layout
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                  delay: index * 0.02,
                }}
              >
                <Card
                  className={cn(
                    "h-full transition-all duration-200 border-2 relative hover:shadow-lg",
                    isDarkMode
                      ? dateStatus.exactPast
                        ? "border-gray-700/30 hover:border-gray-600/50 bg-gray-900/30"
                        : isAvailable
                          ? "border-green-700/30 hover:border-green-600/50 bg-gray-900/50"
                          : "border-blue-700/30 hover:border-blue-600/50 bg-gray-900/30"
                      : dateStatus.exactPast
                        ? "border-gray-200 hover:border-gray-300 bg-gray-50/50"
                        : isAvailable
                          ? "border-green-200 hover:border-green-300 bg-white"
                          : "border-blue-200 hover:border-blue-300 bg-white",
                    !gig.isActive && "opacity-90",
                  )}
                >
                  {/* Cancellation warning if within 3 days */}
                  {canCancel && penaltyInfo.warning && (
                    <div className="absolute top-2 right-2 z-10">
                      <div
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          isDarkMode
                            ? "bg-red-900/50 text-red-300 border border-red-700/50"
                            : "bg-red-100 text-red-700 border border-red-300",
                        )}
                      >
                        ⚠️ Penalty
                      </div>
                    </div>
                  )}

                  {/* Bookmark indicator - only if it's a saved gig */}
                  {gig.savedAt && (
                    <div className="absolute top-4 right-4">
                      <Bookmark className="w-5 h-5 text-blue-500 fill-blue-500" />
                    </div>
                  )}

                  {/* Saved time indicator */}
                  {gig.savedAt && (
                    <div className="absolute top-4 left-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs backdrop-blur-sm",
                          isDarkMode
                            ? "bg-gray-800/80 text-gray-300 border-gray-700"
                            : "bg-white/90 text-gray-700 border-gray-300",
                        )}
                      >
                        {timeSinceSaved(gig.savedAt || gig.updatedAt)}
                      </Badge>
                    </div>
                  )}

                  {/* Poster info */}
                  {gig.poster && (
                    <div className="absolute top-10 left-4">
                      <div className="flex items-center gap-2">
                        {gig.poster.picture && (
                          <img
                            src={gig.poster.picture}
                            alt={gig.poster.firstname}
                            className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800"
                          />
                        )}
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs backdrop-blur-sm",
                            isDarkMode
                              ? "bg-gray-800/80 text-gray-300 border-gray-700"
                              : "bg-white/90 text-gray-700 border-gray-300",
                          )}
                        >
                          {gig.poster.firstname}
                        </Badge>
                      </div>
                    </div>
                  )}

                  <CardHeader
                    className={cn(
                      gig.savedAt ? "pt-14" : "pt-6",
                      canCancel && penaltyInfo.warning ? "pb-2" : "",
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={cn(
                            userRole.badgeColor,
                            "flex items-center gap-1 border",
                            isDarkMode && userRole.badgeColor.includes("bg-")
                              ? userRole.badgeColor.replace(
                                  "bg-",
                                  "bg-gray-800/30 dark:",
                                )
                              : "",
                          )}
                        >
                          {userRole.icon}
                          {userRole.role}
                        </Badge>

                        {/* Payment status badge */}
                        {gig.isActive === false ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500 }}
                          >
                            <Badge
                              className={cn(
                                isDarkMode
                                  ? "bg-green-900/30 text-green-400 border-green-800"
                                  : "bg-green-100 text-green-800 border-green-300",
                              )}
                            >
                              ✅ Paid
                            </Badge>
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500 }}
                          >
                            <Badge
                              className={cn(
                                isDarkMode
                                  ? "bg-yellow-900/30 text-yellow-400 border-yellow-800"
                                  : "bg-yellow-100 text-yellow-800 border-yellow-300",
                              )}
                            >
                              ⏳ Pending
                            </Badge>
                          </motion.div>
                        )}
                      </div>

                      {/* Date status badge */}
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-2",
                          dateStatus.exactPast
                            ? isDarkMode
                              ? "bg-gray-800 text-gray-400 border-gray-700"
                              : "bg-gray-100 text-gray-800 border-gray-300"
                            : dateStatus.isToday
                              ? isDarkMode
                                ? "bg-green-900/30 text-green-400 border-green-800"
                                : "bg-green-100 text-green-800 border-green-300"
                              : isDarkMode
                                ? "bg-blue-900/30 text-blue-400 border-blue-800"
                                : "bg-blue-100 text-blue-800 border-blue-300",
                        )}
                      >
                        {dateStatus.exactPast ? (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            {dateStatus.isToday ? "Completed" : "Past"}
                          </>
                        ) : dateStatus.isToday ? (
                          <>
                            <Calendar className="w-3 h-3 mr-1" />
                            Today
                          </>
                        ) : (
                          <>
                            <Calendar className="w-3 h-3 mr-1" />
                            Upcoming
                          </>
                        )}
                      </Badge>
                    </div>

                    <CardTitle
                      className={cn(
                        "text-lg font-semibold line-clamp-1",
                        isDarkMode ? "text-white" : "text-gray-900",
                      )}
                    >
                      {gig.title}
                    </CardTitle>

                    <motion.div
                      className={cn(
                        "flex items-center text-sm mt-1",
                        isDarkMode ? "text-gray-400" : "text-muted-foreground",
                      )}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatGigDate(gig.date, gig.time)}
                    </motion.div>

                    {(dateStatus.startTime || dateStatus.endTime) && (
                      <div
                        className={cn(
                          "flex items-center text-xs mt-1",
                          isDarkMode ? "text-gray-500" : "text-gray-600",
                        )}
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {dateStatus.startTime &&
                          formatTimeWithDuration(
                            dateStatus.startTime,
                            dateStatus.durationFrom,
                          )}
                        {dateStatus.endTime &&
                          ` - ${formatTimeWithDuration(dateStatus.endTime, dateStatus.durationTo)}`}
                      </div>
                    )}

                    <Badge
                      variant="outline"
                      className={cn(
                        "mt-2 w-fit",
                        isDarkMode
                          ? gig.isClientBand
                            ? "border-purple-800 text-purple-400 bg-purple-900/20"
                            : "border-gray-700 text-gray-400 bg-gray-800/20"
                          : gig.isClientBand
                            ? "border-purple-300 text-purple-700 bg-purple-50"
                            : "border-gray-300 text-gray-700",
                      )}
                    >
                      {gig.isClientBand && <Users className="w-3 h-3 mr-1" />}
                      {gigType}
                    </Badge>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <MapPin
                          className={cn(
                            "w-4 h-4 mr-2 flex-shrink-0",
                            isDarkMode ? "text-gray-500" : "text-gray-500",
                          )}
                        />
                        <span
                          className={cn(
                            "line-clamp-1",
                            isDarkMode ? "text-gray-300" : "text-gray-700",
                          )}
                        >
                          {gig.location || "Location not specified"}
                        </span>
                      </div>

                      {gig.bussinesscat && (
                        <div className="flex items-center text-sm">
                          <Briefcase
                            className={cn(
                              "w-4 h-4 mr-2 flex-shrink-0",
                              isDarkMode ? "text-gray-500" : "text-gray-500",
                            )}
                          />
                          <span
                            className={
                              isDarkMode ? "text-gray-300" : "text-gray-700"
                            }
                          >
                            {gig.bussinesscat}
                          </span>
                        </div>
                      )}

                      {/* Show booked price */}
                      {gig.price > 0 && (
                        <motion.div
                          className={cn(
                            "flex items-center justify-between text-sm p-2 rounded",
                            isDarkMode
                              ? "bg-gray-800/50 text-gray-300"
                              : "bg-gray-50 text-gray-700",
                          )}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <span className="font-medium">Booked Price:</span>
                          <span className="font-bold">
                            {gig.currency || "KES"} {gig.price.toLocaleString()}
                          </span>
                        </motion.div>
                      )}

                      {/* Show booked users count for band gigs */}
                      {gig.isClientBand && gig.bandCategory && (
                        <div className="flex items-center text-sm">
                          <Users
                            className={cn(
                              "w-4 h-4 mr-2 flex-shrink-0",
                              isDarkMode ? "text-gray-500" : "text-gray-500",
                            )}
                          />
                          <span
                            className={
                              isDarkMode ? "text-gray-300" : "text-gray-700"
                            }
                          >
                            {gig.bandCategory.reduce(
                              (total: number, role: any) =>
                                total + (role.bookedUsers?.length || 0),
                              0,
                            )}{" "}
                            musicians booked
                          </span>
                        </div>
                      )}

                      <p
                        className={cn(
                          "text-sm line-clamp-2 pt-2 border-t",
                          isDarkMode
                            ? "text-gray-400 border-gray-800"
                            : "text-muted-foreground border-gray-200",
                        )}
                      >
                        {gig.description || "No description provided"}
                      </p>

                      <div className="pt-4 flex gap-2">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "w-full",
                              isDarkMode
                                ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                            )}
                            onClick={() =>
                              (window.location.href = `/gigs/${gig._id}`)
                            }
                          >
                            View Details
                          </Button>
                        </motion.div>

                        {/* Cancel Button - Only for upcoming gigs */}
                        {canCancel && (
                          <AlertDialog
                            open={
                              cancelDialogOpen && selectedGig?._id === gig._id
                            }
                            onOpenChange={setCancelDialogOpen}
                          >
                            <AlertDialogTrigger asChild>
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={cn(
                                    "text-red-500 border-red-300 hover:bg-red-50 hover:text-red-700",
                                    isDarkMode &&
                                      "border-red-700 hover:bg-red-900/30 hover:text-red-300",
                                  )}
                                  onClick={() => openCancelDialog(gig)}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  {cancelButtonLabel}
                                </Button>
                              </motion.div>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                                  Cancel Booking
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  <div className="space-y-3">
                                    <p>
                                      Are you sure you want to cancel your
                                      booking for "{selectedGig?.title}"?
                                    </p>

                                    {penaltyInfo.warning && (
                                      <div
                                        className={cn(
                                          "p-3 rounded-lg",
                                          isDarkMode
                                            ? "bg-red-900/20 border border-red-800/50"
                                            : "bg-red-50 border border-red-200",
                                        )}
                                      >
                                        <div className="flex items-start gap-2">
                                          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                          <div>
                                            <p className="font-medium text-red-700 dark:text-red-300">
                                              ⚠️ Trust Score Penalty
                                            </p>
                                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                              {penaltyInfo.description}
                                            </p>
                                            <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                                              Tip: Cancelling more than 3 days
                                              in advance avoids penalties.
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {!penaltyInfo.warning && (
                                      <div
                                        className={cn(
                                          "p-3 rounded-lg",
                                          isDarkMode
                                            ? "bg-green-900/20 border border-green-800/50"
                                            : "bg-green-50 border border-green-200",
                                        )}
                                      >
                                        <div className="flex items-start gap-2">
                                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                          <div>
                                            <p className="font-medium text-green-700 dark:text-green-300">
                                              ✅ No Penalty Applied
                                            </p>
                                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                              {penaltyInfo.description}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    <div className="mt-4">
                                      <label className="text-sm font-medium">
                                        Cancellation Reason (required)
                                      </label>
                                      <Textarea
                                        placeholder="Please provide a reason for cancellation..."
                                        value={cancellationReason}
                                        onChange={(e) =>
                                          setCancellationReason(e.target.value)
                                        }
                                        className="mt-1 min-h-[100px]"
                                        required
                                      />
                                    </div>
                                  </div>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel
                                  onClick={() => {
                                    setCancellationReason("");
                                    setSelectedGig(null);
                                  }}
                                >
                                  Keep Booking
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleCancelBooking}
                                  disabled={
                                    isCancelling || !cancellationReason.trim()
                                  }
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {isCancelling ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Cancelling...
                                    </>
                                  ) : (
                                    "Yes, Cancel Booking"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 pt-6 border-t"
      >
        <h4 className="text-sm font-semibold mb-3">Status Legend</h4>
        <div className="flex flex-wrap gap-4">
          {[
            {
              badge: "bg-green-100 text-green-800 border-green-200",
              text: "Gig happening today",
            },
            {
              badge: "bg-blue-100 text-blue-800 border-blue-200",
              text: "Future gig (after today)",
            },
            {
              badge: "bg-gray-100 text-gray-800 border-gray-200",
              text: "Gig date has passed or completed today",
            },
            {
              badge: "bg-green-100 text-green-800 border-green-300",
              text: "Payment completed",
            },
            {
              badge: "bg-yellow-100 text-yellow-800 border-yellow-300",
              text: "Awaiting payment completion",
            },
            {
              badge: "bg-amber-100 text-amber-800 border-amber-300",
              text: "⚠️ Cancelling within 3 days: Penalty applies",
            },
            {
              badge: "bg-red-100 text-red-800 border-red-300",
              text: "🚨 Cancelling within 24 hours: High penalty",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Badge className={item.badge}>
                {index === 0
                  ? "Today"
                  : index === 1
                    ? "Upcoming"
                    : index === 2
                      ? "Past/Completed"
                      : index === 3
                        ? "✅ Paid"
                        : index === 4
                          ? "⏳ Pending"
                          : index === 5
                            ? "⚠️ 3 Days"
                            : "🚨 24h"}
              </Badge>
              <span className="text-xs">{item.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
