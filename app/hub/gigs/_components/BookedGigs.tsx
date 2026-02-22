// app/hub/gigs/_components/BookedGigs.tsx
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence, Variants } from "framer-motion";
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
  Grid3x3,
  List,
  Kanban,
  CalendarDays,
  Activity,
  DollarSign,
  History,
  X,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown,
  Plus,
  Eye,
  ChevronRight,
  Filter,
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
import { differenceInHours } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";
import { GiSpiralThrust } from "react-icons/gi";
// Types
type DisplayMode = "grid" | "timeline" | "list" | "calendar" | "kanban";
type ViewFilter = "all" | "client" | "musician";
type DateFilter = "all" | "upcoming" | "past" | "today";
type PaymentFilter = "all" | "paid" | "pending";
type CancellationSeverity = "high" | "medium" | "none";

interface UserRoleInfo {
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
}

interface CancellationWarning {
  severity: CancellationSeverity;
  message: string;
  description: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  warning: boolean;
}

interface Stats {
  total: number;
  client: number;
  musician: number;
  upcoming: number;
  past: number;
  today: number;
  regularGigs: number;
  bandGigs: number;
  paid: number;
  pendingPayment: number;
}

// Variants
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
  const [viewFilter, setViewFilter] = useState<ViewFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [cancellationReason, setCancellationReason] = useState("");
  const [selectedGig, setSelectedGig] = useState<any>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [filterAnimationKey, setFilterAnimationKey] = useState(0);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("grid");

  const { colors, isDarkMode } = useThemeColors();

  // Convex queries and mutations
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

  // Preferences
  const userPreferences = useQuery(
    api.controllers.userPrefferences.getUserPreferences,
    user?._id ? { userId: user._id } : "skip",
  );
  const updateComponentPrefs = useMutation(
    api.controllers.userPrefferences.updateComponentPreferences,
  );

  // Load preferences
  useEffect(() => {
    if (userPreferences?.preferences?.bookedGigs) {
      const prefs = userPreferences.preferences.bookedGigs;
      if (prefs.displayMode) setDisplayMode(prefs.displayMode as DisplayMode);
      if (prefs.viewFilter) setViewFilter(prefs.viewFilter as ViewFilter);
      if (prefs.dateFilter) setDateFilter(prefs.dateFilter as DateFilter);
      if (prefs.paymentFilter)
        setPaymentFilter(prefs.paymentFilter as PaymentFilter);
    }
  }, [userPreferences]);

  // Save display mode
  const handleDisplayModeChange = useCallback(
    async (mode: DisplayMode) => {
      setDisplayMode(mode);

      if (!user?._id) return;

      try {
        await updateComponentPrefs({
          userId: user._id,
          component: "bookedGigs",
          settings: { displayMode: mode },
        });
        toast.success("Display mode saved");
      } catch (error) {
        console.error("Error saving display mode:", error);
      }
    },
    [user?._id, updateComponentPrefs],
  );

  // Save view filter
  const handleViewFilterChange = useCallback(
    async (value: ViewFilter) => {
      setViewFilter(value);

      if (!user?._id) return;

      try {
        await updateComponentPrefs({
          userId: user._id,
          component: "bookedGigs",
          settings: { viewFilter: value },
        });
      } catch (error) {
        console.error("Error saving view filter:", error);
      }
    },
    [user?._id, updateComponentPrefs],
  );

  // Save date filter
  const handleDateFilterChange = useCallback(
    async (value: DateFilter) => {
      setDateFilter(value);

      if (!user?._id) return;

      try {
        await updateComponentPrefs({
          userId: user._id,
          component: "bookedGigs",
          settings: { dateFilter: value },
        });
      } catch (error) {
        console.error("Error saving date filter:", error);
      }
    },
    [user?._id, updateComponentPrefs],
  );

  // Save payment filter
  const handlePaymentFilterChange = useCallback(
    async (value: PaymentFilter) => {
      setPaymentFilter(value);

      if (!user?._id) return;

      try {
        await updateComponentPrefs({
          userId: user._id,
          component: "bookedGigs",
          settings: { paymentFilter: value },
        });
      } catch (error) {
        console.error("Error saving payment filter:", error);
      }
    },
    [user?._id, updateComponentPrefs],
  );

  // Clear all filters
  const handleClearFilters = useCallback(async () => {
    setSearchTerm("");
    setViewFilter("all");
    setDateFilter("all");
    setPaymentFilter("all");

    if (!user?._id) return;

    try {
      await updateComponentPrefs({
        userId: user._id,
        component: "bookedGigs",
        settings: {
          viewFilter: "all",
          dateFilter: "all",
          paymentFilter: "all",
        },
      });
      toast.success("Filters cleared");
    } catch (error) {
      console.error("Error clearing filters:", error);
    }
  }, [user?._id, updateComponentPrefs]);

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
  }, [searchTerm, viewFilter, dateFilter, paymentFilter, displayMode]);

  const getUserRoleInGig = (gig: any): UserRoleInfo => {
    const userId = user._id;
    const isPaid = gig.isActive === false;
    const paymentStatus = isPaid ? "paid" : "pending";
    const dateStatus = getGigDateStatus(gig.date, gig.time);
    const canCancel = !dateStatus.exactPast;

    // User is the client (posted the gig)
    if (gig.postedBy === userId) {
      let bookedMusician = null;
      if (gig.bookedBy) {
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
            roleIcon: <Music className="w-4 h-10" />,
            badgeColor: isDarkMode
              ? "bg-indigo-100 text-red-800 border-indigo-200"
              : "bg-indigo-800 text-blue-200 border-indigo-700",
            icon: <Music className="w-4 h-4" />,
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
  const [legendOpen, setLegendOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(false);

  const stats = useMemo((): Stats | null => {
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

  const getCancellationWarning = (gig: any): CancellationWarning => {
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

  const getCancelButtonLabel = (gig: any): string => {
    const userRole = getUserRoleInGig(gig);

    if (userRole.cancellationType === "client") {
      return "Cancel Gig";
    } else if (userRole.cancellationType === "band") {
      return "Leave Band Role";
    } else {
      return "Cancel Booking";
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

  // Modern Grid View - Clean cards with subtle interactions
  const renderGridView = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
    >
      {filteredGigs.map((gig: any, index) => {
        const userRole = getUserRoleInGig(gig);
        const dateStatus = getGigDateStatus(gig.date, gig.time);

        return (
          <motion.div
            key={gig._id}
            variants={cardVariants}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card
              className={cn(
                "group relative overflow-hidden transition-all duration-300",
                "border-0 bg-gradient-to-b",
                isDarkMode
                  ? "from-slate-900 to-slate-800/50 hover:from-slate-800 hover:to-slate-700/50"
                  : "from-white to-slate-50/50 hover:from-white hover:to-slate-100/50",
                "shadow-sm hover:shadow-md",
              )}
            >
              {/* Subtle status indicator line */}
              <div
                className={cn(
                  "absolute top-0 left-0 right-0 h-1",
                  dateStatus.isToday
                    ? "bg-emerald-500"
                    : dateStatus.exactPast
                      ? "bg-slate-400"
                      : "bg-blue-500",
                )}
              />

              <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {/* Role badge - minimal */}
                    <Badge
                      className={cn(
                        "px-2 py-0.5 text-xs font-normal border-0",
                        userRole.badgeColor,
                      )}
                    >
                      {userRole.role}
                    </Badge>

                    {/* Payment indicator */}
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        gig.isActive === false
                          ? "bg-emerald-500"
                          : "bg-amber-500",
                      )}
                    />
                  </div>

                  {/* Date - minimal */}
                  <span
                    className={cn(
                      "text-xs",
                      isDarkMode ? "text-slate-500" : "text-slate-400",
                    )}
                  >
                    {formatGigDate(gig.date, gig.time)}
                  </span>
                </div>

                {/* Title */}
                <h3
                  className={cn(
                    "font-semibold text-lg mb-3 line-clamp-1",
                    isDarkMode ? "text-white" : "text-slate-900",
                  )}
                >
                  {gig.title}
                </h3>

                {/* Info grid - minimal */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span
                      className={cn(
                        "truncate",
                        isDarkMode ? "text-slate-300" : "text-slate-600",
                      )}
                    >
                      {gig.location || "Location TBD"}
                    </span>
                  </div>

                  {gig.price > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {gig.currency || "KES"} {gig.price.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => (window.location.href = `/gigs/${gig._id}`)}
                    className={cn(
                      "text-xs gap-1 px-2",
                      isDarkMode
                        ? "text-slate-400 hover:text-white"
                        : "text-slate-500 hover:text-slate-900",
                    )}
                  >
                    View details
                    <ChevronRight className="w-3 h-3" />
                  </Button>

                  {userRole.canCancel && !dateStatus.exactPast && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openCancelDialog(gig)}
                      className={cn(
                        "text-xs text-rose-500 hover:text-rose-600 px-2",
                        isDarkMode
                          ? "hover:bg-rose-950/30"
                          : "hover:bg-rose-50",
                      )}
                    >
                      Cancel Gig
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );

  // Modern List View - Clean rows
  const renderListView = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {filteredGigs.map((gig: any, index) => {
        const userRole = getUserRoleInGig(gig);
        const dateStatus = getGigDateStatus(gig.date, gig.time);

        return (
          <motion.div
            key={gig._id}
            variants={cardVariants}
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card
              className={cn(
                "border-0 bg-gradient-to-r transition-all duration-200",
                isDarkMode
                  ? "from-slate-900 to-slate-800/50 hover:from-slate-800"
                  : "from-white to-slate-50/50 hover:from-white",
                "shadow-sm hover:shadow",
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Status dot */}
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      dateStatus.isToday
                        ? "bg-emerald-500"
                        : dateStatus.exactPast
                          ? "bg-slate-400"
                          : "bg-blue-500",
                    )}
                  />

                  {/* Role badge */}
                  <Badge
                    className={cn(
                      "px-2 py-0.5 text-xs font-normal border-0",
                      userRole.badgeColor,
                    )}
                  >
                    {userRole.role}
                  </Badge>

                  {/* Title */}
                  <span
                    className={cn(
                      "font-medium flex-1",
                      isDarkMode ? "text-white" : "text-slate-900",
                    )}
                  >
                    {gig.title}
                  </span>

                  {/* Date */}
                  <span
                    className={cn(
                      "text-sm",
                      isDarkMode ? "text-slate-400" : "text-slate-500",
                    )}
                  >
                    {formatGigDate(gig.date, gig.time)}
                  </span>

                  {/* Price */}
                  {gig.price > 0 && (
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {gig.currency || "KES"} {gig.price.toLocaleString()}
                    </span>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        (window.location.href = `/gigs/${gig._id}`)
                      }
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    {userRole.canCancel && !dateStatus.exactPast && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openCancelDialog(gig)}
                        className="h-8 w-8 p-0 text-rose-500"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );

  // Modern Timeline View - Clean vertical flow
  const renderTimelineView = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      {filteredGigs.map((gig: any, index) => {
        const userRole = getUserRoleInGig(gig);
        const dateStatus = getGigDateStatus(gig.date, gig.time);

        return (
          <motion.div
            key={gig._id}
            variants={cardVariants}
            className="relative pl-8 pb-8 last:pb-0"
          >
            {/* Timeline line */}
            {index < filteredGigs.length - 1 && (
              <div
                className={cn(
                  "absolute left-3 top-6 bottom-0 w-0.5",
                  isDarkMode ? "bg-slate-800" : "bg-slate-200",
                )}
              />
            )}

            {/* Timeline dot */}
            <div className="absolute left-0 top-1">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center",
                  dateStatus.isToday
                    ? "bg-emerald-500/20"
                    : dateStatus.exactPast
                      ? "bg-slate-500/20"
                      : "bg-blue-500/20",
                )}
              >
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    dateStatus.isToday
                      ? "bg-emerald-500"
                      : dateStatus.exactPast
                        ? "bg-slate-400"
                        : "bg-blue-500",
                  )}
                />
              </div>
            </div>

            {/* Content */}
            <Card
              className={cn(
                "border-0 bg-gradient-to-br",
                isDarkMode
                  ? "from-slate-900 to-slate-800/50"
                  : "from-white to-slate-50/50",
                "shadow-sm",
              )}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        className={cn(
                          "px-2 py-0.5 text-xs font-normal border-0",
                          userRole.badgeColor,
                        )}
                      >
                        {userRole.role}
                      </Badge>
                      <span
                        className={cn(
                          "text-xs",
                          isDarkMode ? "text-slate-500" : "text-slate-400",
                        )}
                      >
                        {formatGigDate(gig.date, gig.time)}
                      </span>
                    </div>
                    <h3
                      className={cn(
                        "font-semibold text-lg",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      {gig.title}
                    </h3>
                  </div>

                  {gig.price > 0 && (
                    <span className="text-lg font-medium text-emerald-600 dark:text-emerald-400">
                      {gig.currency || "KES"} {gig.price.toLocaleString()}
                    </span>
                  )}
                </div>

                <p
                  className={cn(
                    "text-sm line-clamp-2 mb-4",
                    isDarkMode ? "text-slate-400" : "text-slate-500",
                  )}
                >
                  {gig.description || "No description"}
                </p>

                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => (window.location.href = `/gigs/${gig._id}`)}
                    className={cn(
                      "text-xs",
                      isDarkMode
                        ? "border-slate-700 text-slate-300"
                        : "border-slate-200 text-slate-600",
                    )}
                  >
                    View details
                  </Button>

                  {userRole.canCancel && !dateStatus.exactPast && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openCancelDialog(gig)}
                      className="text-xs text-rose-500"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );

  // Modern Calendar View - Minimal date grouping
  const renderCalendarView = () => {
    const groupedByDate = filteredGigs.reduce((acc: any, gig: any) => {
      const dateKey = new Date(gig.date).toDateString();
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(gig);
      return acc;
    }, {});

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {Object.entries(groupedByDate).map(([date, gigs]: [string, any]) => (
          <motion.div key={date} variants={cardVariants}>
            <div className="mb-3">
              <h3
                className={cn(
                  "text-sm font-medium",
                  isDarkMode ? "text-slate-400" : "text-slate-500",
                )}
              >
                {new Date(date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </h3>
            </div>

            <div className="space-y-2">
              {gigs.map((gig: any) => {
                const userRole = getUserRoleInGig(gig);
                return (
                  <Card
                    key={gig._id}
                    className={cn(
                      "border-0 bg-gradient-to-r cursor-pointer",
                      isDarkMode
                        ? "from-slate-900 to-slate-800/50 hover:from-slate-800"
                        : "from-white to-slate-50/50 hover:from-white",
                      "shadow-sm",
                    )}
                    onClick={() => (window.location.href = `/gigs/${gig._id}`)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <Badge
                          className={cn(
                            "px-2 py-0.5 text-xs font-normal border-0",
                            userRole.badgeColor,
                          )}
                        >
                          {userRole.role}
                        </Badge>
                        <span
                          className={cn(
                            "font-medium",
                            isDarkMode ? "text-white" : "text-slate-900",
                          )}
                        >
                          {gig.title}
                        </span>
                        {gig.time?.start && (
                          <span
                            className={cn(
                              "text-xs ml-auto",
                              isDarkMode ? "text-slate-500" : "text-slate-400",
                            )}
                          >
                            {gig.time.start}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  // Modern Kanban View - Clean column layout
  const renderKanbanView = () => {
    const columns = [
      { id: "today", title: "Today", icon: Calendar },
      { id: "upcoming", title: "Upcoming", icon: Clock },
      { id: "past", title: "Past", icon: CheckCircle },
    ];

    const getColumnGigs = (columnId: string) => {
      return filteredGigs.filter((gig: any) => {
        const status = getGigDateStatus(gig.date, gig.time);
        if (columnId === "today") return status.isToday;
        if (columnId === "upcoming")
          return !status.exactPast && !status.isToday;
        if (columnId === "past") return status.exactPast;
        return false;
      });
    };

    return (
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-72">
            {/* Column header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <column.icon
                  className={cn(
                    "w-4 h-4",
                    isDarkMode ? "text-slate-400" : "text-slate-500",
                  )}
                />
                <h3
                  className={cn(
                    "text-sm font-medium",
                    isDarkMode ? "text-slate-300" : "text-slate-700",
                  )}
                >
                  {column.title}
                </h3>
              </div>
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  isDarkMode
                    ? "bg-slate-800 text-slate-300"
                    : "bg-slate-100 text-slate-600",
                )}
              >
                {getColumnGigs(column.id).length}
              </span>
            </div>

            {/* Column cards */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {getColumnGigs(column.id).map((gig: any) => {
                const userRole = getUserRoleInGig(gig);
                return (
                  <motion.div
                    key={gig._id}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card
                      className={cn(
                        "border-0 bg-gradient-to-r cursor-pointer",
                        isDarkMode
                          ? "from-slate-900 to-slate-800/50 hover:from-slate-800"
                          : "from-white to-slate-50/50 hover:from-white",
                        "shadow-sm",
                      )}
                      onClick={() =>
                        (window.location.href = `/gigs/${gig._id}`)
                      }
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            className={cn(
                              "px-2 py-0.5 text-xs font-normal border-0",
                              userRole.badgeColor,
                            )}
                          >
                            {userRole.role}
                          </Badge>
                        </div>
                        <p
                          className={cn(
                            "text-sm font-medium line-clamp-2",
                            isDarkMode ? "text-white" : "text-slate-900",
                          )}
                        >
                          {gig.title}
                        </p>
                        {gig.time?.start && (
                          <p
                            className={cn(
                              "text-xs mt-2",
                              isDarkMode ? "text-slate-500" : "text-slate-400",
                            )}
                          >
                            {gig.time.start}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Main render function
  const renderGigs = () => {
    if (filteredGigs.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="mb-4">
            <Calendar
              className={cn(
                "w-12 h-12 mx-auto",
                isDarkMode ? "text-slate-700" : "text-slate-300",
              )}
            />
          </div>
          <h3
            className={cn(
              "text-lg font-medium mb-2",
              isDarkMode ? "text-white" : "text-slate-900",
            )}
          >
            No gigs found
          </h3>
          <p
            className={cn(
              "text-sm",
              isDarkMode ? "text-slate-400" : "text-slate-500",
            )}
          >
            Try adjusting your filters
          </p>
        </motion.div>
      );
    }

    switch (displayMode) {
      case "list":
        return renderListView();
      case "timeline":
        return renderTimelineView();
      case "calendar":
        return renderCalendarView();
      case "kanban":
        return renderKanbanView();
      default:
        return renderGridView();
    }
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
      <>
        {showHeader && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="min-h-[80vh] flex items-center justify-center p-4"
          >
            <div className="w-full max-w-3xl mx-auto">
              {/* Header with toggle */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 text-center"
              >
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
                    <CheckCircle
                      className={cn(
                        "w-10 h-10 relative",
                        isDarkMode ? "text-emerald-400" : "text-emerald-600",
                      )}
                    />
                  </div>
                  <h2
                    className={cn(
                      "text-3xl md:text-4xl font-bold tracking-tight",
                      isDarkMode ? "text-white" : "text-slate-900",
                    )}
                  >
                    Booked Gigs
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowHeader(false)}
                    className={cn(
                      "p-1.5 rounded-full transition-colors",
                      isDarkMode
                        ? "hover:bg-slate-800 text-slate-400"
                        : "hover:bg-slate-100 text-slate-500",
                    )}
                  >
                    {showHeader ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </motion.button>
                </div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className={cn(
                    "text-sm md:text-base max-w-lg mx-auto",
                    isDarkMode ? "text-slate-400" : "text-slate-500",
                  )}
                >
                  Successfully booked gigs where you're involved as a client or
                  musician
                </motion.p>
              </motion.div>

              {/* Empty State Card */}
              <motion.div
                variants={emptyStateVariants}
                initial="hidden"
                animate="visible"
              >
                <Card
                  className={cn(
                    "border-2 overflow-hidden",
                    isDarkMode
                      ? "bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-800"
                      : "bg-gradient-to-br from-white to-slate-50/50 border-slate-200",
                  )}
                >
                  {/* Decorative top gradient */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                  <CardContent className="p-8 md:p-12">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.2,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className="relative mb-8"
                    >
                      {/* Animated background circles */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className={cn(
                            "w-32 h-32 rounded-full opacity-20 animate-pulse",
                            isDarkMode ? "bg-blue-500/30" : "bg-blue-500/20",
                          )}
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center animate-spin-slow">
                        <div
                          className={cn(
                            "w-40 h-40 rounded-full border-2 border-dashed",
                            isDarkMode
                              ? "border-slate-700"
                              : "border-slate-200",
                          )}
                        />
                      </div>

                      {/* Main icon */}
                      <div className="relative flex justify-center">
                        <div
                          className={cn(
                            "w-24 h-24 rounded-full flex items-center justify-center",
                            isDarkMode
                              ? "bg-gradient-to-br from-slate-800 to-slate-700"
                              : "bg-gradient-to-br from-slate-100 to-white",
                          )}
                        >
                          <Calendar
                            className={cn(
                              "w-12 h-12",
                              isDarkMode ? "text-slate-400" : "text-slate-400",
                            )}
                          />
                        </div>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.4 }}
                          className="absolute -bottom-2 -right-2"
                        >
                          <div
                            className={cn(
                              "p-2 rounded-full",
                              isDarkMode ? "bg-slate-800" : "bg-white",
                              "shadow-lg",
                            )}
                          >
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>

                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className={cn(
                        "text-2xl md:text-3xl font-bold text-center mb-3",
                        isDarkMode ? "text-white" : "text-slate-900",
                      )}
                    >
                      No Booked Gigs Yet
                    </motion.h3>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className={cn(
                        "text-center mb-8 max-w-md mx-auto",
                        isDarkMode ? "text-slate-400" : "text-slate-500",
                      )}
                    >
                      You haven't booked or been booked for any gigs yet. Start
                      exploring opportunities or create your own gig!
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex flex-col sm:flex-row gap-3 justify-center"
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={() =>
                            (window.location.href = "/hub/gigs?tab=all")
                          }
                          variant="outline"
                          size="lg"
                          className={cn(
                            "gap-2 px-6 py-5 text-base font-medium",
                            "border-2 transition-all duration-200",
                            isDarkMode
                              ? "border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                              : "border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300",
                          )}
                        >
                          <Search className="w-5 h-5" />
                          Explore Gigs
                        </Button>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={() =>
                            (window.location.href = "/gigs/create")
                          }
                          size="lg"
                          className={cn(
                            "gap-2 px-6 py-5 text-base font-medium",
                            "bg-gradient-to-r transition-all duration-200",
                            isDarkMode
                              ? "from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                              : "from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white",
                          )}
                        >
                          <Plus className="w-5 h-5" />
                          Create a Gig
                        </Button>
                      </motion.div>
                    </motion.div>

                    {/* Quick tips */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className={cn(
                        "mt-8 pt-6 border-t text-sm text-center",
                        isDarkMode
                          ? "border-slate-800 text-slate-500"
                          : "border-slate-200 text-slate-400",
                      )}
                    >
                      <p>💡 Quick tips:</p>
                      <div className="flex flex-wrap gap-3 justify-center mt-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-3 py-1",
                            isDarkMode
                              ? "border-slate-700"
                              : "border-slate-200",
                          )}
                        >
                          Browse available gigs
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-3 py-1",
                            isDarkMode
                              ? "border-slate-700"
                              : "border-slate-200",
                          )}
                        >
                          Show interest in gigs
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-3 py-1",
                            isDarkMode
                              ? "border-slate-700"
                              : "border-slate-200",
                          )}
                        >
                          Wait for confirmation
                        </Badge>
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}
      </>
    );
  }

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col">
        {/* Sticky Header Section - Fixed at top */}
        <div
          className={cn(
            "sticky top-0 z-30 backdrop-blur-md border-b",
            isDarkMode
              ? "bg-slate-950/80 border-slate-800/50"
              : "bg-white/80 border-slate-200/50",
          )}
        >
          {" "}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="px-3 py-2 md:px-6 md:py-3"
          >
            {/* Header with Chevron Toggle - More compact on mobile */}
            <div className="flex items-start justify-between gap-2">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex-1 min-w-0"
              >
                <div className="flex items-center gap-1.5 md:gap-2 mb-0.5">
                  <div
                    className={cn(
                      "p-1.5 md:p-2 rounded-lg shrink-0",
                      isDarkMode ? "bg-emerald-500/20" : "bg-emerald-100",
                    )}
                  >
                    <CheckCircle
                      className={cn(
                        "w-4 h-4 md:w-5 md:h-5",
                        isDarkMode ? "text-emerald-400" : "text-emerald-600",
                      )}
                    />
                  </div>
                  <h2
                    className={cn(
                      "text-base md:text-xl font-bold tracking-tight truncate",
                      isDarkMode ? "text-white" : "text-slate-900",
                    )}
                  >
                    Booked Gigs
                  </h2>
                </div>
                <p
                  className={cn(
                    "text-xs truncate",
                    isDarkMode ? "text-slate-400" : "text-slate-500",
                  )}
                >
                  {showHeader
                    ? "Manage your booked gigs"
                    : "Tap to expand filters"}
                </p>
              </motion.div>

              {/* Header Collapse Button with Chevron */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowHeader(!showHeader)}
                className={cn(
                  "p-1.5 md:p-2 rounded-full transition-all duration-200 shrink-0",
                  isDarkMode
                    ? "text-slate-400 hover:text-white hover:bg-slate-800"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
                )}
              >
                {showHeader ? (
                  <ChevronUp className="w-4 h-4 md:w-5 md:h-5" />
                ) : (
                  <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
                )}
              </motion.button>
            </div>

            {/* Expandable Content */}
            <AnimatePresence>
              {showHeader && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 space-y-3">
                    {/* Stats Cards - Horizontal scroll on mobile */}
                    {stats && (
                      <>
                        {/* Desktop Grid - hidden on mobile */}
                        <div className="hidden md:grid grid-cols-4 lg:grid-cols-8 gap-2">
                          {Object.entries(stats).map(([key, value], index) => (
                            <motion.div
                              key={key}
                              custom={index}
                              variants={statsVariants}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Card
                                className={cn(
                                  "border shadow-sm transition-all duration-200",
                                  isDarkMode
                                    ? "bg-slate-900/80 border-slate-800"
                                    : "bg-white border-slate-200",
                                )}
                              >
                                <CardContent className="p-2 text-center">
                                  <p
                                    className={cn(
                                      "text-[10px] font-medium uppercase tracking-wider",
                                      isDarkMode
                                        ? "text-slate-400"
                                        : "text-slate-500",
                                    )}
                                  >
                                    {key === "total"
                                      ? "Total"
                                      : key === "upcoming"
                                        ? "Upcoming"
                                        : key === "past"
                                          ? "Past"
                                          : key === "today"
                                            ? "Today"
                                            : key === "client"
                                              ? "Client"
                                              : key === "musician"
                                                ? "Artist"
                                                : key === "paid"
                                                  ? "Paid"
                                                  : key === "pendingPayment"
                                                    ? "Pending"
                                                    : key}
                                  </p>
                                  <p
                                    className={cn(
                                      "text-lg font-bold",
                                      isDarkMode
                                        ? "text-white"
                                        : "text-slate-900",
                                      key === "paid" &&
                                        (isDarkMode
                                          ? "text-emerald-400"
                                          : "text-emerald-600"),
                                      key === "pendingPayment" &&
                                        (isDarkMode
                                          ? "text-amber-400"
                                          : "text-amber-600"),
                                    )}
                                  >
                                    {value}
                                  </p>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>

                        {/* Mobile Horizontal Scroll */}
                        <div className="md:hidden -mx-3 px-3 overflow-x-auto scrollbar-hide">
                          <div className="flex gap-2 pb-1 min-w-min">
                            {Object.entries(stats).map(
                              ([key, value], index) => (
                                <div
                                  key={key}
                                  className="flex-shrink-0 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800"
                                >
                                  <span className="text-xs font-medium">
                                    <span className="text-slate-500 dark:text-slate-400 mr-1">
                                      {key === "total"
                                        ? "Total"
                                        : key === "upcoming"
                                          ? "Up"
                                          : key === "past"
                                            ? "Past"
                                            : key === "today"
                                              ? "Now"
                                              : key === "client"
                                                ? "Client"
                                                : key === "musician"
                                                  ? "Art"
                                                  : key === "paid"
                                                    ? "Paid"
                                                    : key === "pendingPayment"
                                                      ? "Due"
                                                      : key}
                                      :
                                    </span>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                      {value}
                                    </span>
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Search Bar - Compact */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <Input
                        placeholder="Search by title, location, or artist..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 h-9 text-sm rounded-full"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <X className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      )}
                    </div>

                    {/* Filter Chips - Horizontal Scroll */}
                    <div className="overflow-x-auto scrollbar-hide -mx-3 px-3">
                      <div className="flex gap-2 pb-1 min-w-min">
                        {/* Role Filter Chip */}
                        <Select
                          value={viewFilter}
                          onValueChange={handleViewFilterChange}
                        >
                          <SelectTrigger
                            className={cn(
                              "w-auto h-8 rounded-full border text-xs gap-1 px-3",
                              isDarkMode
                                ? "bg-slate-900/90 border-slate-700 text-slate-200"
                                : "bg-white border-slate-200 text-slate-700",
                              viewFilter !== "all" &&
                                (isDarkMode
                                  ? "border-blue-500/50"
                                  : "border-blue-400"),
                            )}
                          >
                            <Users className="w-3.5 h-3.5" />
                            <SelectValue placeholder="Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="client">Client Only</SelectItem>
                            <SelectItem value="musician">
                              Musician Only
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Date Filter Chip */}
                        <Select
                          value={dateFilter}
                          onValueChange={handleDateFilterChange}
                        >
                          <SelectTrigger
                            className={cn(
                              "w-auto h-8 rounded-full border text-xs gap-1 px-3",
                              isDarkMode
                                ? "bg-slate-900/90 border-slate-700 text-slate-200"
                                : "bg-white border-slate-200 text-slate-700",
                              dateFilter !== "all" &&
                                (dateFilter === "today"
                                  ? isDarkMode
                                    ? "border-emerald-500/50"
                                    : "border-emerald-400"
                                  : dateFilter === "upcoming"
                                    ? isDarkMode
                                      ? "border-blue-500/50"
                                      : "border-blue-400"
                                    : isDarkMode
                                      ? "border-slate-500/50"
                                      : "border-slate-400"),
                            )}
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <SelectValue placeholder="Date" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Dates</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="past">Past</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Payment Filter Chip */}
                        <Select
                          value={paymentFilter}
                          onValueChange={handlePaymentFilterChange}
                        >
                          <SelectTrigger
                            className={cn(
                              "w-auto h-8 rounded-full border text-xs gap-1 px-3",
                              isDarkMode
                                ? "bg-slate-900/90 border-slate-700 text-slate-200"
                                : "bg-white border-slate-200 text-slate-700",
                              paymentFilter !== "all" &&
                                (paymentFilter === "paid"
                                  ? isDarkMode
                                    ? "border-emerald-500/50"
                                    : "border-emerald-400"
                                  : isDarkMode
                                    ? "border-amber-500/50"
                                    : "border-amber-400"),
                            )}
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <SelectValue placeholder="Payment" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Payments</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Clear Filters - Only when active */}
                        {(viewFilter !== "all" ||
                          dateFilter !== "all" ||
                          paymentFilter !== "all") && (
                          <button
                            onClick={handleClearFilters}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap",
                              isDarkMode
                                ? "bg-rose-950/30 text-rose-400 border border-rose-800/30"
                                : "bg-rose-50 text-rose-600 border border-rose-200",
                            )}
                          >
                            <X className="w-3 h-3 inline mr-1" />
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Quick filter stats */}
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={
                          isDarkMode ? "text-slate-400" : "text-slate-500"
                        }
                      >
                        {filteredGigs.length} of {bookedGigs.length} gigs
                      </span>
                      {(searchTerm ||
                        viewFilter !== "all" ||
                        dateFilter !== "all" ||
                        paymentFilter !== "all") && (
                        <button
                          onClick={handleClearFilters}
                          className="text-rose-500 hover:text-rose-600 font-medium"
                        >
                          Reset all
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Display Mode Toggle - Below header */}
        <div className="px-3 md:px-6 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-xs font-medium",
                  isDarkMode ? "text-slate-400" : "text-slate-500",
                )}
              >
                View:
              </span>
              <div
                className={cn(
                  "flex p-0.5 rounded-lg",
                  isDarkMode ? "bg-slate-800/50" : "bg-slate-100",
                )}
              >
                {[
                  { mode: "grid", icon: Grid3x3 },
                  { mode: "list", icon: List },
                  { mode: "timeline", icon: Activity },
                  { mode: "calendar", icon: CalendarDays },
                  { mode: "kanban", icon: Kanban },
                ].map(({ mode, icon: Icon }) => (
                  <Tooltip key={mode}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleDisplayModeChange(mode as any)}
                        className={cn(
                          "p-1.5 rounded-md transition-all",
                          displayMode === mode
                            ? isDarkMode
                              ? "bg-blue-600 text-white"
                              : "bg-blue-500 text-white"
                            : isDarkMode
                              ? "text-slate-400 hover:text-white hover:bg-slate-700"
                              : "text-slate-500 hover:text-slate-900 hover:bg-slate-200",
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      {mode.charAt(0).toUpperCase() + mode.slice(1)} View
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* Results count pill */}
            <div
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs",
                isDarkMode
                  ? "bg-slate-800/50 text-slate-300"
                  : "bg-slate-100 text-slate-600",
              )}
            >
              <div
                className={cn(
                  "w-1.5 h-1.5 rounded-full animate-pulse",
                  isDarkMode ? "bg-emerald-400" : "bg-emerald-500",
                )}
              />
              <span>
                {filteredGigs.length} of {bookedGigs.length}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Gig Cards Section */}
        <div className="flex-1 overflow-y-auto px-3 md:px-6 pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`gig-list-${displayMode}-${filterAnimationKey}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="py-4"
            >
              {renderGigs()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Gradient Legend Button - Fixed at Bottom Right */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLegendOpen(true)}
          className={cn(
            "fixed bottom-4 right-4 z-50 gap-1.5 rounded-full",
            "backdrop-blur-md border",
            "transition-all duration-300",
            "hover:scale-110 active:scale-95",
            "shadow-lg hover:shadow-xl",
            "group",
            isDarkMode
              ? "bg-slate-900/80 border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:text-white"
              : "bg-white/80 border-slate-200/50 text-slate-600 hover:bg-white hover:text-slate-900",
          )}
        >
          <div className="relative">
            <span
              className={cn(
                "absolute inset-0 rounded-full opacity-0 group-hover:opacity-100",
                "bg-gradient-to-r from-red-500/30 via-yellow-500/30 via-green-500/30 via-blue-500/30 to-purple-500/30",
                "animate-ping",
              )}
            />
            <Info className="w-4 h-4" />
          </div>
          <span className="hidden sm:inline text-xs">Guide</span>
        </Button>

        {/* Legend Dialog */}
        <Dialog open={legendOpen} onOpenChange={setLegendOpen}>
          <DialogContent
            className={cn(
              "sm:max-w-md p-0 overflow-hidden",
              isDarkMode
                ? "bg-slate-900 border-slate-800"
                : "bg-white border-slate-200",
            )}
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            <div className="p-4">
              <DialogHeader className="mb-3">
                <DialogTitle
                  className={cn(
                    "text-base font-bold",
                    isDarkMode ? "text-white" : "text-slate-900",
                  )}
                >
                  Status Legend
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {[
                  {
                    badge: "bg-green-100 text-green-800",
                    icon: "🎤",
                    text: "Gig happening today",
                  },
                  {
                    badge: "bg-blue-100 text-blue-800",
                    icon: "📅",
                    text: "Future gig",
                  },
                  {
                    badge: "bg-gray-100 text-gray-800",
                    icon: "✅",
                    text: "Past gig",
                  },
                  {
                    badge: "bg-green-100 text-green-800",
                    icon: "💰",
                    text: "Payment completed",
                  },
                  {
                    badge: "bg-yellow-100 text-yellow-800",
                    icon: "⏳",
                    text: "Payment pending",
                  },
                  {
                    badge: "bg-amber-100 text-amber-800",
                    icon: "⚠️",
                    text: "Cancel within 3 days",
                  },
                  {
                    badge: "bg-red-100 text-red-800",
                    icon: "🚨",
                    text: "Cancel within 24h",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <Badge className={cn(item.badge, "px-2 py-0")}>
                      {i === 0
                        ? "Today"
                        : i === 1
                          ? "Future"
                          : i === 2
                            ? "Past"
                            : i === 3
                              ? "Paid"
                              : i === 4
                                ? "Pending"
                                : i === 5
                                  ? "3d"
                                  : "24h"}
                    </Badge>
                    <span
                      className={
                        isDarkMode ? "text-slate-300" : "text-slate-600"
                      }
                    >
                      {item.icon} {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};
