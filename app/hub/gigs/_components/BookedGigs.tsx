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
  Clock,
  Search,
  Loader2,
  AlertCircle,
  XCircle,
  AlertTriangle,
  Star,
  Music,
  GraduationCap,
  Building2,
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
import {
  getGigDateStatus,
  formatGigDate,
  calculateGigDateStats,
  formatTimeWithDuration,
} from "../helper/getGigDateStatus";
import type { Variants } from "framer-motion";
import { differenceInHours } from "date-fns";

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
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
  hover: {
    scale: 1.02,
    transition: { type: "spring", stiffness: 400, damping: 20 },
  },
  tap: { scale: 0.98 },
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
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
};

const emptyStateVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 25 },
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

  const allGigs = useQuery(api.controllers.gigs.getAllGigs, {
    includeInactive: true,
    limit: 100,
  });

  const removeInterestFromGig = useMutation(
    api.controllers.gigs.removeInterestFromGig,
  );
  const unbookFromBandRole = useMutation(
    api.controllers.bookings.unbookFromBandRole,
  );

  // Filter booked gigs where user is involved
  const bookedGigs = useMemo(() => {
    if (!allGigs || !user) return [];

    const userId = user._id;
    const takenGigs = allGigs.filter((gig: any) => gig.isTaken === true);

    return takenGigs.filter((gig: any) => {
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

      return isClient || isBookedMusician || isInBookedUsers || isBookedInBand;
    });
  }, [allGigs, user]);

  // Apply filters
  const filteredGigs = useMemo(() => {
    if (!bookedGigs.length) return [];

    let filtered = [...bookedGigs];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (gig: any) =>
          gig.title.toLowerCase().includes(term) ||
          gig.description?.toLowerCase().includes(term) ||
          gig.location?.toLowerCase().includes(term),
      );
    }

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

    if (dateFilter !== "all") {
      filtered = filtered.filter((gig: any) => {
        const dateStatus = getGigDateStatus(gig.date, gig.time);
        if (dateFilter === "upcoming") return !dateStatus.exactPast;
        if (dateFilter === "past") return dateStatus.exactPast;
        if (dateFilter === "today") return dateStatus.isToday;
        return true;
      });
    }

    if (paymentFilter !== "all") {
      filtered = filtered.filter((gig: any) => {
        if (paymentFilter === "paid") return gig.isActive === false;
        if (paymentFilter === "pending") return gig.isActive === true;
        return true;
      });
    }

    return filtered.sort((a: any, b: any) => {
      const statusA = getGigDateStatus(a.date, a.time);
      const statusB = getGigDateStatus(b.date, b.time);

      if (!statusA.exactPast && statusB.exactPast) return -1;
      if (statusA.exactPast && !statusB.exactPast) return 1;

      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      if (!statusA.exactPast) {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });
  }, [bookedGigs, searchTerm, viewFilter, dateFilter, paymentFilter, user]);

  useEffect(() => {
    if (allGigs && user) {
      const timer = setTimeout(() => setIsInitialLoad(false), 300);
      return () => clearTimeout(timer);
    }
  }, [allGigs, user]);

  useEffect(() => {
    setFilterAnimationKey((prev) => prev + 1);
  }, [searchTerm, viewFilter, dateFilter, paymentFilter]);

  const getUserRoleInGig = (
    gig: any,
  ): {
    role: string;
    roleIcon: React.ReactNode;
    badgeColor: string;
    icon: React.ReactNode;
    isPaid: boolean;
    paymentStatus: "paid" | "pending";
    canCancel: boolean;
    cancellationType: "regular" | "band" | "client";
    counterpartyInfo?: {
      id: string;
      name: string;
      picture?: string;
      role: string;
    };
  } => {
    const userId = user._id;
    const isPaid = gig.isActive === false;
    const paymentStatus = isPaid ? "paid" : "pending";
    const dateStatus = getGigDateStatus(gig.date, gig.time);
    const canCancel = !dateStatus.exactPast;

    // User is the client (posted the gig)
    if (gig.postedBy === userId) {
      // Find the booked musician info
      let bookedMusician = null;
      if (gig.bookedBy) {
        // Find musician from allGigs or pass through from query
        bookedMusician = gig.bookedMusician || null;
      }

      return {
        role: "Client",
        roleIcon: <Briefcase className="w-4 h-4" />,
        badgeColor: isPaid
          ? "bg-blue-100 text-blue-800 border-blue-300"
          : "bg-blue-100 text-blue-800 border-blue-200",
        icon: <Briefcase className="w-4 h-4" />,
        isPaid,
        paymentStatus,
        canCancel,
        cancellationType: "client",
        counterpartyInfo: bookedMusician
          ? {
              id: gig.bookedBy,
              name: bookedMusician.firstname || bookedMusician.username,
              picture: bookedMusician.picture,
              role: "Booked Musician",
            }
          : undefined,
      };
    }

    // User is the booked musician (regular gig)
    if (gig.bookedBy === userId) {
      return {
        role: "Booked Musician",
        roleIcon: <User className="w-4 h-4" />,
        badgeColor: isPaid
          ? "bg-green-100 text-green-800 border-green-300"
          : "bg-green-100 text-green-800 border-green-200",
        icon: <User className="w-4 h-4" />,
        isPaid,
        paymentStatus,
        canCancel,
        cancellationType: "regular",
        counterpartyInfo: gig.poster
          ? {
              id: gig.postedBy,
              name: gig.poster.firstname || "Client",
              picture: gig.poster.picture,
              role: "Client",
            }
          : undefined,
      };
    }

    // User is in bookedUsers array (band member)
    if (Array.isArray(gig.bookedUsers) && gig.bookedUsers.includes(userId)) {
      return {
        role: "Band Member",
        roleIcon: <Users className="w-4 h-4" />,
        badgeColor: isPaid
          ? "bg-purple-100 text-purple-800 border-purple-300"
          : "bg-purple-100 text-purple-800 border-purple-200",
        icon: <Users className="w-4 h-4" />,
        isPaid,
        paymentStatus,
        canCancel,
        cancellationType: gig.isClientBand ? "band" : "regular",
        counterpartyInfo: gig.poster
          ? {
              id: gig.postedBy,
              name: gig.poster.firstname || "Client",
              picture: gig.poster.picture,
              role: "Client",
            }
          : undefined,
      };
    }

    // Check for specific band role
    if (gig.bandCategory && Array.isArray(gig.bandCategory)) {
      for (const role of gig.bandCategory) {
        if (
          Array.isArray(role.bookedUsers) &&
          role.bookedUsers.includes(userId)
        ) {
          return {
            role: role.role,
            roleIcon: <Music className="w-4 h-4" />,
            badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
            icon: <Users className="w-4 h-4" />,
            isPaid,
            paymentStatus,
            canCancel,
            cancellationType: "band",
            counterpartyInfo: gig.poster
              ? {
                  id: gig.postedBy,
                  name: gig.poster.firstname || "Client",
                  picture: gig.poster.picture,
                  role: "Client",
                }
              : undefined,
          };
        }
      }
    }

    return {
      role: "Booked",
      roleIcon: <CheckCircle className="w-4 h-4" />,
      badgeColor: "bg-gray-100 text-gray-800 border-gray-200",
      icon: <CheckCircle className="w-4 h-4" />,
      isPaid,
      paymentStatus,
      canCancel: false,
      cancellationType: "regular",
    };
  };

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

  const handleCancelBooking = async () => {
    if (!selectedGig || !cancellationReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    setIsCancelling(true);
    try {
      const userRole = getUserRoleInGig(selectedGig);
      const warning = getCancellationWarning(selectedGig);

      if (userRole.cancellationType === "client") {
        toast.info("Client cancellation logic would go here");
      } else if (userRole.cancellationType === "band") {
        const roleIndex = selectedGig.bandCategory?.findIndex(
          (role: any) =>
            Array.isArray(role.bookedUsers) &&
            role.bookedUsers.includes(user._id),
        );

        if (roleIndex !== -1 && roleIndex !== undefined) {
          await unbookFromBandRole({
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
        await removeInterestFromGig({
          gigId: selectedGig._id,
          userId: user._id,
          reason: cancellationReason,
          isFromBooked: true,
        });
      }

      if (warning.severity !== "none") {
        toast.warning(`Booking cancelled. ${warning.message}`, {
          duration: 5000,
        });
      } else {
        toast.success("Booking cancelled. No trust score penalty applied.");
      }

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

  const openCancelDialog = (gig: any) => {
    const warning = getCancellationWarning(gig);
    setSelectedGig(gig);
    setCancellationReason("");
    setCancelDialogOpen(true);

    if (warning.severity !== "none") {
      setTimeout(() => {
        toast.warning(warning.message, { duration: 6000 });
      }, 300);
    }
  };

  const getCancellationWarning = (gig: any) => {
    const hoursUntil = differenceInHours(new Date(gig.date), new Date());

    if (hoursUntil < 24) {
      return {
        severity: "high",
        message:
          "Last-minute cancellation will significantly impact your trust score",
        description:
          "Cancelling within 24 hours will be recorded as a last-minute cancellation and affect your reliability score",
        color: "text-red-500",
        bgColor: isDarkMode
          ? "bg-red-950/30 border-red-800/50"
          : "bg-red-50 border-red-200",
        icon: <AlertTriangle className="w-4 h-4" />,
        warning: true,
      };
    } else if (hoursUntil < 72) {
      return {
        severity: "medium",
        message: "Cancelling within 3 days will affect your trust score",
        description:
          "Cancelling within 3 days will be recorded and may impact future booking opportunities",
        color: "text-yellow-500",
        bgColor: isDarkMode
          ? "bg-yellow-950/30 border-yellow-800/50"
          : "bg-yellow-50 border-yellow-200",
        icon: <AlertTriangle className="w-4 h-4" />,
        warning: true,
      };
    }

    return {
      severity: "none",
      message: "No trust score penalty",
      description:
        "Cancelling more than 3 days in advance has no impact on your trust score",
      color: "text-green-500",
      bgColor: isDarkMode
        ? "bg-green-950/30 border-green-800/50"
        : "bg-green-50 border-green-200",
      icon: <CheckCircle className="w-4 h-4" />,
      warning: false,
    };
  };

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
            const cancellationWarning = getCancellationWarning(gig);
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
                    "h-full transition-all duration-300 relative overflow-hidden group",
                    isDarkMode
                      ? "bg-gradient-to-br from-gray-900 via-gray-900/95 to-gray-900/90 border-gray-800/50 hover:border-gray-700/80"
                      : "bg-gradient-to-br from-white via-white to-gray-50/50 border-gray-200/80 hover:border-gray-300/80",
                    !dateStatus.exactPast &&
                      !dateStatus.isToday &&
                      isDarkMode &&
                      "hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]",
                    !dateStatus.exactPast &&
                      !dateStatus.isToday &&
                      !isDarkMode &&
                      "hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]",
                    dateStatus.isToday &&
                      isDarkMode &&
                      "hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]",
                    dateStatus.isToday &&
                      !isDarkMode &&
                      "hover:shadow-[0_0_30px_rgba(34,197,94,0.1)]",
                    dateStatus.exactPast &&
                      isDarkMode &&
                      "hover:shadow-[0_0_30px_rgba(107,114,128,0.1)]",
                    dateStatus.exactPast &&
                      !isDarkMode &&
                      "hover:shadow-[0_0_30px_rgba(107,114,128,0.05)]",
                    !gig.isActive && "opacity-80",
                  )}
                >
                  {/* Animated gradient overlay */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: isDarkMode
                        ? "radial-gradient(circle at 50% 0%, rgba(59,130,246,0.1), transparent 70%)"
                        : "radial-gradient(circle at 50% 0%, rgba(59,130,246,0.05), transparent 70%)",
                    }}
                  />

                  {/* Top gradient bar */}
                  <div
                    className={cn(
                      "absolute top-0 left-0 right-0 h-1",
                      dateStatus.exactPast
                        ? isDarkMode
                          ? "bg-gradient-to-r from-gray-700 to-gray-600"
                          : "bg-gradient-to-r from-gray-400 to-gray-300"
                        : dateStatus.isToday
                          ? isDarkMode
                            ? "bg-gradient-to-r from-green-600 to-green-500"
                            : "bg-gradient-to-r from-green-500 to-green-400"
                          : isDarkMode
                            ? "bg-gradient-to-r from-blue-600 to-blue-500"
                            : "bg-gradient-to-r from-blue-500 to-blue-400",
                    )}
                  />

                  {/* Cancellation warning badge */}
                  {canCancel && cancellationWarning.severity !== "none" && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 20,
                      }}
                      className="absolute -top-1 -right-1 z-20"
                    >
                      <div
                        className={cn(
                          "px-3 py-1.5 rounded-bl-xl rounded-tr-xl text-xs font-bold flex items-center gap-1.5 shadow-lg",
                          cancellationWarning.severity === "high"
                            ? isDarkMode
                              ? "bg-gradient-to-r from-red-600 to-red-500 text-white border border-red-400/30"
                              : "bg-gradient-to-r from-red-500 to-red-400 text-white border border-red-300/50"
                            : isDarkMode
                              ? "bg-gradient-to-r from-yellow-600 to-yellow-500 text-white border border-yellow-400/30"
                              : "bg-gradient-to-r from-yellow-500 to-yellow-400 text-white border border-yellow-300/50",
                        )}
                      >
                        {cancellationWarning.icon}
                        <span>
                          {cancellationWarning.severity === "high"
                            ? "URGENT"
                            : "WARNING"}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Counterparty Info (shows the other person involved) */}
                  {userRole.counterpartyInfo && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="absolute top-4 left-4 z-10"
                    >
                      <div className="flex items-center gap-2">
                        {userRole.counterpartyInfo.picture ? (
                          <div className="relative">
                            <img
                              src={userRole.counterpartyInfo.picture}
                              alt={userRole.counterpartyInfo.name}
                              className={cn(
                                "w-8 h-8 rounded-full ring-2 ring-offset-2 ring-offset-transparent",
                                isDarkMode
                                  ? "ring-blue-500/50"
                                  : "ring-blue-500/30",
                              )}
                            />
                            <div
                              className={cn(
                                "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2",
                                isDarkMode ? "ring-gray-900" : "ring-white",
                                userRole.role === "Client"
                                  ? "bg-purple-500"
                                  : "bg-green-500",
                              )}
                            />
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full ring-2 ring-offset-2 ring-offset-transparent flex items-center justify-center",
                              isDarkMode
                                ? "bg-gray-800 ring-blue-500/50"
                                : "bg-gray-200 ring-blue-500/30",
                            )}
                          >
                            {userRole.role === "Client" ? (
                              <Briefcase className="w-4 h-4 text-gray-500" />
                            ) : (
                              <User className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                        )}
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs font-medium backdrop-blur-md border",
                            isDarkMode
                              ? "bg-gray-900/70 text-gray-200 border-gray-700/50"
                              : "bg-white/70 text-gray-700 border-gray-300/50",
                          )}
                        >
                          <span className="flex items-center gap-1">
                            {userRole.role === "Client" ? (
                              <Building2 className="w-3 h-3" />
                            ) : (
                              <Music className="w-3 h-3" />
                            )}
                            {userRole.counterpartyInfo.name}
                          </span>
                        </Badge>
                      </div>
                    </motion.div>
                  )}

                  <CardHeader
                    className={cn(
                      "pt-14 pb-4 px-5",
                      canCancel && cancellationWarning.warning ? "pt-16" : "",
                    )}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Role badge */}
                        <Badge
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1 border shadow-sm",
                            userRole.badgeColor,
                            isDarkMode && {
                              "bg-blue-500/20 text-blue-300 border-blue-500/30":
                                userRole.role === "Client",
                              "bg-green-500/20 text-green-300 border-green-500/30":
                                userRole.role === "Booked Musician",
                              "bg-purple-500/20 text-purple-300 border-purple-500/30":
                                userRole.role === "Band Member",
                            },
                          )}
                        >
                          {userRole.roleIcon}
                          <span>{userRole.role}</span>
                        </Badge>

                        {/* Payment status badge */}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            delay: 0.1,
                          }}
                        >
                          <Badge
                            className={cn(
                              "px-3 py-1 border-0 shadow-sm",
                              gig.isActive === false
                                ? isDarkMode
                                  ? "bg-gradient-to-r from-green-600/20 to-green-500/20 text-green-300"
                                  : "bg-gradient-to-r from-green-100 to-green-50 text-green-700"
                                : isDarkMode
                                  ? "bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 text-yellow-300"
                                  : "bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700",
                            )}
                          >
                            {gig.isActive === false ? (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Paid
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Pending
                              </span>
                            )}
                          </Badge>
                        </motion.div>
                      </div>

                      {/* Date status badge */}
                      <Badge
                        variant="outline"
                        className={cn(
                          "px-3 py-1 border-2 font-medium backdrop-blur-sm",
                          dateStatus.exactPast
                            ? isDarkMode
                              ? "bg-gray-800/50 text-gray-400 border-gray-700"
                              : "bg-gray-100/80 text-gray-600 border-gray-300"
                            : dateStatus.isToday
                              ? isDarkMode
                                ? "bg-green-500/20 text-green-300 border-green-500/30"
                                : "bg-green-100/80 text-green-700 border-green-300"
                              : isDarkMode
                                ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                : "bg-blue-100/80 text-blue-700 border-blue-300",
                        )}
                      >
                        {dateStatus.exactPast ? (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {dateStatus.isToday ? "Completed" : "Past"}
                          </span>
                        ) : dateStatus.isToday ? (
                          <span className="flex items-center gap-1">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                            </span>
                            Today
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Upcoming
                          </span>
                        )}
                      </Badge>
                    </div>

                    <CardTitle
                      className={cn(
                        "text-xl font-bold line-clamp-1 mb-1",
                        isDarkMode ? "text-white" : "text-gray-900",
                      )}
                    >
                      {gig.title}
                    </CardTitle>

                    <motion.div
                      className={cn(
                        "flex items-center text-sm",
                        isDarkMode ? "text-gray-400" : "text-gray-600",
                      )}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Calendar className="w-4 h-4 mr-1.5 flex-shrink-0" />
                      <span className="truncate">
                        {formatGigDate(gig.date, gig.time)}
                      </span>
                    </motion.div>

                    {(dateStatus.startTime || dateStatus.endTime) && (
                      <motion.div
                        className={cn(
                          "flex items-center text-xs mt-1",
                          isDarkMode ? "text-gray-500" : "text-gray-500",
                        )}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25 }}
                      >
                        <Clock className="w-3 h-3 mr-1.5 flex-shrink-0" />
                        <span>
                          {dateStatus.startTime &&
                            formatTimeWithDuration(
                              dateStatus.startTime,
                              dateStatus.durationFrom,
                            )}
                          {dateStatus.endTime &&
                            ` - ${formatTimeWithDuration(
                              dateStatus.endTime,
                              dateStatus.durationTo,
                            )}`}
                        </span>
                      </motion.div>
                    )}

                    <Badge
                      variant="outline"
                      className={cn(
                        "mt-3 w-fit px-3 py-1 text-xs font-medium",
                        isDarkMode
                          ? gig.isClientBand
                            ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                            : "bg-gray-800/50 text-gray-400 border-gray-700"
                          : gig.isClientBand
                            ? "bg-purple-50 text-purple-700 border-purple-300"
                            : "bg-gray-100 text-gray-600 border-gray-300",
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        {gig.isClientBand && <Users className="w-3 h-3" />}
                        {gigType}
                      </span>
                    </Badge>
                  </CardHeader>

                  <CardContent className="px-5 pb-5">
                    <div className="space-y-4">
                      {/* Location */}
                      <motion.div
                        className="flex items-start text-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <MapPin
                          className={cn(
                            "w-4 h-4 mr-2 mt-0.5 flex-shrink-0",
                            isDarkMode ? "text-gray-500" : "text-gray-400",
                          )}
                        />
                        <span
                          className={cn(
                            "line-clamp-1",
                            isDarkMode ? "text-gray-300" : "text-gray-600",
                          )}
                        >
                          {gig.location || "Location not specified"}
                        </span>
                      </motion.div>

                      {/* Business category */}
                      {gig.bussinesscat && (
                        <motion.div
                          className="flex items-start text-sm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.35 }}
                        >
                          <Briefcase
                            className={cn(
                              "w-4 h-4 mr-2 mt-0.5 flex-shrink-0",
                              isDarkMode ? "text-gray-500" : "text-gray-400",
                            )}
                          />
                          <span
                            className={cn(
                              "line-clamp-1",
                              isDarkMode ? "text-gray-300" : "text-gray-600",
                            )}
                          >
                            {gig.bussinesscat}
                          </span>
                        </motion.div>
                      )}

                      {/* Price */}
                      {gig.price > 0 && (
                        <motion.div
                          className={cn(
                            "flex items-center justify-between text-sm p-3 rounded-xl border",
                            isDarkMode
                              ? "bg-gray-800/50 text-gray-300 border-gray-700/50 backdrop-blur-sm"
                              : "bg-gray-50 text-gray-700 border-gray-200",
                          )}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <span className="font-medium flex items-center gap-1">
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                isDarkMode ? "bg-green-500" : "bg-green-400",
                              )}
                            />
                            Booked Price
                          </span>
                          <span className="font-bold text-lg">
                            {gig.currency || "KES"} {gig.price.toLocaleString()}
                          </span>
                        </motion.div>
                      )}

                      {/* Band members count */}
                      {gig.isClientBand && gig.bandCategory && (
                        <motion.div
                          className="flex items-center text-sm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.45 }}
                        >
                          <Users
                            className={cn(
                              "w-4 h-4 mr-2 flex-shrink-0",
                              isDarkMode ? "text-gray-500" : "text-gray-400",
                            )}
                          />
                          <span
                            className={cn(
                              "flex items-center gap-1",
                              isDarkMode ? "text-gray-300" : "text-gray-600",
                            )}
                          >
                            {gig.bandCategory.reduce(
                              (total: number, role: any) =>
                                total + (role.bookedUsers?.length || 0),
                              0,
                            )}{" "}
                            <span
                              className={
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }
                            >
                              musicians booked
                            </span>
                          </span>
                        </motion.div>
                      )}

                      {/* Description */}
                      <div
                        className={cn(
                          "pt-3 border-t",
                          isDarkMode ? "border-gray-800" : "border-gray-200",
                        )}
                      >
                        <p
                          className={cn(
                            "text-sm line-clamp-2 leading-relaxed",
                            isDarkMode ? "text-gray-400" : "text-gray-600",
                          )}
                        >
                          {gig.description || "No description provided"}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 flex gap-2">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "w-full font-medium transition-all duration-200",
                              isDarkMode
                                ? "bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-600"
                                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400",
                            )}
                            onClick={() =>
                              (window.location.href = `/gigs/${gig._id}`)
                            }
                          >
                            <span className="flex items-center gap-2">
                              <span>View Details</span>
                              <span className="text-xs opacity-60">→</span>
                            </span>
                          </Button>
                        </motion.div>

                        {/* Cancel Button */}
                        {canCancel && (
                          <AlertDialog
                            open={
                              cancelDialogOpen && selectedGig?._id === gig._id
                            }
                            onOpenChange={setCancelDialogOpen}
                          >
                            <AlertDialogTrigger asChild>
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={cn(
                                    "font-medium border-2 transition-all duration-200",
                                    isDarkMode
                                      ? "border-red-800/50 text-red-400 hover:bg-red-950/50 hover:text-red-300 hover:border-red-700"
                                      : "border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400",
                                  )}
                                  onClick={() => openCancelDialog(gig)}
                                >
                                  <XCircle className="w-4 h-4 mr-1.5" />
                                  {cancelButtonLabel}
                                </Button>
                              </motion.div>
                            </AlertDialogTrigger>

                            {/* Alert Dialog */}
                            <AlertDialogContent
                              className={cn(
                                "max-w-md border-2",
                                isDarkMode
                                  ? "bg-gradient-to-b from-gray-900 to-gray-900/95 border-gray-800"
                                  : "bg-white border-gray-200",
                              )}
                            >
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-3 text-xl">
                                  <div
                                    className={cn(
                                      "p-2 rounded-full",
                                      isDarkMode
                                        ? "bg-red-900/30"
                                        : "bg-red-50",
                                    )}
                                  >
                                    <AlertTriangle
                                      className={cn(
                                        "w-5 h-5",
                                        isDarkMode
                                          ? "text-red-400"
                                          : "text-red-500",
                                      )}
                                    />
                                  </div>
                                  <span>Cancel Booking</span>
                                </AlertDialogTitle>
                                <AlertDialogDescription className="space-y-4 pt-2">
                                  <p
                                    className={cn(
                                      "text-sm",
                                      isDarkMode
                                        ? "text-gray-300"
                                        : "text-gray-600",
                                    )}
                                  >
                                    Are you sure you want to cancel your booking
                                    for "
                                    <span className="font-semibold">
                                      {selectedGig?.title}
                                    </span>
                                    "?
                                  </p>

                                  {/* Penalty warning */}
                                  {cancellationWarning.warning ? (
                                    <motion.div
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className={cn(
                                        "p-4 rounded-xl border",
                                        cancellationWarning.bgColor,
                                      )}
                                    >
                                      <div className="flex items-start gap-3">
                                        <div
                                          className={cn(
                                            "p-1.5 rounded-full",
                                            isDarkMode
                                              ? "bg-red-900/50"
                                              : "bg-red-100",
                                          )}
                                        >
                                          {cancellationWarning.icon}
                                        </div>
                                        <div className="flex-1">
                                          <p
                                            className={cn(
                                              "font-semibold mb-1",
                                              cancellationWarning.color,
                                            )}
                                          >
                                            ⚠️ Trust Score Impact
                                          </p>
                                          <p
                                            className={cn(
                                              "text-sm",
                                              cancellationWarning.color,
                                            )}
                                          >
                                            {cancellationWarning.description}
                                          </p>
                                          <p
                                            className={cn(
                                              "text-xs mt-2",
                                              cancellationWarning.color.replace(
                                                "500",
                                                "400",
                                              ),
                                            )}
                                          >
                                            💡 Cancelling more than 3 days in
                                            advance avoids any impact.
                                          </p>
                                        </div>
                                      </div>
                                    </motion.div>
                                  ) : (
                                    <motion.div
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className={cn(
                                        "p-4 rounded-xl border",
                                        cancellationWarning.bgColor,
                                      )}
                                    >
                                      <div className="flex items-start gap-3">
                                        <div
                                          className={cn(
                                            "p-1.5 rounded-full",
                                            isDarkMode
                                              ? "bg-green-900/50"
                                              : "bg-green-100",
                                          )}
                                        >
                                          {cancellationWarning.icon}
                                        </div>
                                        <div>
                                          <p
                                            className={cn(
                                              "font-semibold mb-1",
                                              cancellationWarning.color,
                                            )}
                                          >
                                            ✅ No Trust Score Impact
                                          </p>
                                          <p
                                            className={cn(
                                              "text-sm",
                                              cancellationWarning.color,
                                            )}
                                          >
                                            {cancellationWarning.description}
                                          </p>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}

                                  {/* Cancellation reason */}
                                  <div className="space-y-2">
                                    <label
                                      className={cn(
                                        "text-sm font-medium flex items-center gap-1",
                                        isDarkMode
                                          ? "text-gray-300"
                                          : "text-gray-700",
                                      )}
                                    >
                                      <span>Cancellation Reason</span>
                                      <span className="text-red-500">*</span>
                                    </label>
                                    <Textarea
                                      placeholder="Please provide a reason for cancellation..."
                                      value={cancellationReason}
                                      onChange={(e) =>
                                        setCancellationReason(e.target.value)
                                      }
                                      className={cn(
                                        "min-h-[100px] resize-none transition-all",
                                        isDarkMode
                                          ? "bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:border-red-500/50"
                                          : "bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-red-400",
                                      )}
                                      required
                                    />
                                  </div>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="gap-2">
                                <AlertDialogCancel
                                  onClick={() => {
                                    setCancellationReason("");
                                    setSelectedGig(null);
                                  }}
                                  className={cn(
                                    "border-2 font-medium",
                                    isDarkMode
                                      ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50",
                                  )}
                                >
                                  Keep Booking
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleCancelBooking}
                                  disabled={
                                    isCancelling || !cancellationReason.trim()
                                  }
                                  className={cn(
                                    "font-medium border-2 transition-all",
                                    isDarkMode
                                      ? "bg-red-600 border-red-700 text-white hover:bg-red-700 disabled:opacity-50"
                                      : "bg-red-600 border-red-700 text-white hover:bg-red-700 disabled:opacity-50",
                                  )}
                                >
                                  {isCancelling ? (
                                    <span className="flex items-center gap-2">
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      Cancelling...
                                    </span>
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

                  {/* Bottom gradient accent */}
                  <div
                    className={cn(
                      "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r",
                      dateStatus.exactPast
                        ? isDarkMode
                          ? "from-gray-800 to-gray-700"
                          : "from-gray-300 to-gray-200"
                        : dateStatus.isToday
                          ? isDarkMode
                            ? "from-green-600/50 to-green-500/30"
                            : "from-green-400/50 to-green-300/30"
                          : isDarkMode
                            ? "from-blue-600/50 to-blue-500/30"
                            : "from-blue-400/50 to-blue-300/30",
                    )}
                  />
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
