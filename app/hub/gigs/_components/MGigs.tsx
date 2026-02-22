// components/gigs/MyGigs.tsx
"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { useRouter } from "next/navigation";
import { useGigs } from "@/hooks/useAllGigs";
import clsx from "clsx";

// Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TrustStarsDisplay } from "@/components/trust/TrustStarsDisplay";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// Icons
import {
  Music,
  Search,
  RefreshCw,
  Grid3x3,
  List,
  Plus,
  X,
  Sparkles,
  TrendingUp,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  Zap,
  Users,
  Package,
  ChevronUp,
  ChevronDown,
  Activity,
  CalendarDays,
  Kanban,
  Filter,
  Info,
  History,
  Sun,
  Star,
  Briefcase,
  Eye,
  Edit,
  Copy,
  Trash2,
  MoreHorizontal,
  Heart,
  Send,
  Bookmark,
  User,
  Users2,
  Mic,
  Volume2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

// Types
type DisplayMode = "grid" | "list" | "timeline" | "calendar" | "kanban";
type ViewFilter = "all" | "client" | "musician";
type DateFilter = "all" | "upcoming" | "past" | "today";
type PaymentFilter = "all" | "paid" | "pending";

// Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
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

const filterVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
};

// Compact Gig Card Component
const CompactGigCard = ({
  gig,
  onClick,
}: {
  gig: any;
  onClick: () => void;
}) => {
  const { isDarkMode } = useThemeColors();
  const dateStatus = useMemo(() => {
    const gigDate = new Date(gig.date);
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));

    return {
      isToday: gigDate.toDateString() === today.toDateString(),
      isPast: gigDate < today,
      isFuture: gigDate > now,
    };
  }, [gig.date]);

  const getStatusColor = () => {
    if (gig.isTaken) return "bg-slate-500";
    if (gig.isPending) return "bg-amber-500";
    if (dateStatus.isToday) return "bg-emerald-500";
    if (dateStatus.isFuture) return "bg-blue-500";
    return "bg-slate-400";
  };

  const getStatusLabel = () => {
    if (gig.isTaken) return "Completed";
    if (gig.isPending) return "Pending";
    if (dateStatus.isToday) return "Today";
    if (dateStatus.isFuture) return "Upcoming";
    return "Past";
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card
        className={cn(
          "overflow-hidden border-2 transition-all duration-200",
          isDarkMode
            ? "bg-slate-900/90 border-slate-800 hover:border-slate-700"
            : "bg-white border-slate-200 hover:border-slate-300",
        )}
      >
        {/* Status indicator line */}
        <div className={cn("h-1 w-full", getStatusColor())} />

        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon/Avatar */}
            <Avatar className="w-10 h-10 rounded-lg">
              <AvatarImage src={gig.logo} />
              <AvatarFallback
                className={cn(
                  "text-lg",
                  isDarkMode ? "bg-slate-800" : "bg-slate-200",
                )}
              >
                {gig.title?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              {/* Title and Status */}
              <div className="flex items-start justify-between gap-2">
                <h3
                  className={cn(
                    "font-semibold text-sm truncate",
                    isDarkMode ? "text-white" : "text-slate-900",
                  )}
                >
                  {gig.title}
                </h3>
                <Badge
                  className={cn(
                    "text-[10px] px-1.5 py-0.5",
                    isDarkMode ? "bg-slate-800" : "bg-slate-100",
                  )}
                >
                  {getStatusLabel()}
                </Badge>
              </div>

              {/* Date & Location */}
              <div className="flex items-center gap-2 mt-1 text-xs">
                <div
                  className={cn(
                    "flex items-center gap-1",
                    isDarkMode ? "text-slate-400" : "text-slate-500",
                  )}
                >
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(gig.date).toLocaleDateString()}</span>
                </div>
                {gig.location && (
                  <>
                    <span className="text-slate-300 dark:text-slate-700">
                      •
                    </span>
                    <div
                      className={cn(
                        "flex items-center gap-1 truncate",
                        isDarkMode ? "text-slate-400" : "text-slate-500",
                      )}
                    >
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">
                        {gig.location.split(",")[0]}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Price & Role */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1">
                  {gig.isClientBand ? (
                    <Users2 className="w-3 h-3 text-purple-500" />
                  ) : (
                    <User className="w-3 h-3 text-blue-500" />
                  )}
                  <span
                    className={cn(
                      "text-xs",
                      isDarkMode ? "text-slate-300" : "text-slate-600",
                    )}
                  >
                    {gig.isClientBand ? "Band Gig" : "Regular Gig"}
                  </span>
                </div>
                {gig.price > 0 && (
                  <div className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                    <DollarSign className="w-3 h-3" />
                    <span className="text-xs">
                      {gig.price.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-rose-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {gig.interestedUsers?.length || 0}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Send className="w-3 h-3 text-amber-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {gig.appliedUsers?.length || 0}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-blue-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {gig.viewCount?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const MyGigs = ({ user }: { user: any }) => {
  const router = useRouter();
  const { colors, isDarkMode } = useThemeColors();

  // State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("grid");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showHeader, setShowHeader] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const [filterAnimationKey, setFilterAnimationKey] = useState(0);

  // Filter states
  const [viewFilter, setViewFilter] = useState<ViewFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");

  // Refs for horizontal scroll
  const statsScrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Check scroll position for arrows
  const checkScroll = () => {
    if (statsScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = statsScrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const scrollEl = statsScrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener("scroll", checkScroll);
      checkScroll();
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (scrollEl) scrollEl.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  // Get user's gigs
  const { gigs, isLoading } = useGigs(user?._id);

  // Calculate stats with enhanced fields
  const stats = useMemo(() => {
    if (!gigs) {
      return {
        total: 0,
        active: 0,
        completed: 0,
        pending: 0,
        upcoming: 0,
        past: 0,
        today: 0,
        client: 0,
        musician: 0,
        paid: 0,
        pendingPayment: 0,
        totalEarnings: 0,
        averageRating: 0,
        clientsScore: 0,
      };
    }

    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));

    const activeGigs = gigs.filter((gig) => gig.isActive && !gig.isTaken);
    const takenGigs = gigs.filter((gig) => gig.isTaken);
    const pendingGigs = gigs.filter((gig) => gig.isPending);

    // Date-based stats
    const upcoming = gigs.filter((gig) => {
      const gigDate = new Date(gig.date);
      return gigDate > now && !gig.isTaken;
    }).length;

    const past = gigs.filter((gig) => {
      const gigDate = new Date(gig.date);
      return gigDate < today;
    }).length;

    const todayGigs = gigs.filter((gig) => {
      const gigDate = new Date(gig.date);
      return gigDate.toDateString() === today.toDateString();
    }).length;

    // Role-based stats
    const client = gigs.filter((gig) => gig.postedBy === user?._id).length;
    const musician = gigs.filter((gig) => gig.bookedBy === user?._id).length;

    // Payment stats
    const paid = gigs.filter((gig) => gig.paymentStatus === "paid").length;
    const pendingPayment = gigs.filter(
      (gig) => gig.paymentStatus === "pending",
    ).length;

    const totalEarnings = gigs
      .filter((gig) => gig.paymentStatus === "paid")
      .reduce((sum, gig) => sum + (gig.price || 0), 0);

    const averageRating =
      gigs.length > 0
        ? gigs.reduce((sum, gig) => sum + (gig.gigRating || 0), 0) / gigs.length
        : 0;

    const clientsScore = user?.trustStars || 0;

    return {
      total: gigs.length,
      active: activeGigs.length,
      completed: takenGigs.length,
      pending: pendingGigs.length,
      upcoming,
      past,
      today: todayGigs,
      client,
      musician,
      paid,
      pendingPayment,
      totalEarnings,
      averageRating: parseFloat(averageRating.toFixed(1)),
      clientsScore: clientsScore || 0,
    };
  }, [gigs, user]);

  // Gig counts for UI
  const gigCounts = useMemo(() => {
    if (!gigs)
      return {
        total: 0,
        available: 0,
        withInterests: 0,
        withApplications: 0,
        taken: 0,
        pending: 0,
        draft: 0,
      };

    return {
      total: gigs.length,
      available: gigs.filter((gig) => {
        const isAvailable = gig.isActive && !gig.isTaken;
        const noInterests =
          !gig.interestedUsers || gig.interestedUsers.length === 0;
        const noApplications =
          !gig.appliedUsers || gig.appliedUsers.length === 0;
        const noBookCount = !gig.bookCount || gig.bookCount.length === 0;

        let noBandBookings = true;
        if (gig.bandCategory && gig.bandCategory.length > 0) {
          noBandBookings = gig.bandCategory.every(
            (role: any) =>
              role.filledSlots === 0 &&
              (!role.applicants || role.applicants.length === 0),
          );
        }

        return (
          isAvailable &&
          noInterests &&
          noApplications &&
          noBookCount &&
          noBandBookings
        );
      }).length,

      withInterests: gigs.filter((gig) => {
        const isAvailable = gig.isActive && !gig.isTaken;
        const hasInterests =
          gig.interestedUsers && gig.interestedUsers.length > 0;
        const noApplications =
          !gig.appliedUsers || gig.appliedUsers.length === 0;
        return isAvailable && hasInterests && noApplications;
      }).length,

      withApplications: gigs.filter((gig) => {
        const isAvailable = gig.isActive && !gig.isTaken;
        const hasApplications = gig.appliedUsers && gig.appliedUsers.length > 0;
        return isAvailable && hasApplications;
      }).length,

      taken: gigs.filter((gig) => gig.isTaken).length,
      pending: gigs.filter((gig) => gig.isPending).length,
      draft: gigs.filter((gig) => !gig.isActive).length,
    };
  }, [gigs]);

  // Filter gigs
  const filteredGigs = useMemo(() => {
    if (!gigs) return [];

    let filtered = gigs;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (gig) =>
          gig.title?.toLowerCase().includes(query) ||
          gig.description?.toLowerCase().includes(query) ||
          gig.location?.toLowerCase().includes(query) ||
          gig.tags?.some((tag: string) => tag.toLowerCase().includes(query)),
      );
    }

    // View filter (role)
    if (viewFilter !== "all" && user) {
      filtered = filtered.filter((gig) => {
        if (viewFilter === "client") return gig.postedBy === user._id;
        if (viewFilter === "musician") return gig.bookedBy === user._id;
        return true;
      });
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));

      filtered = filtered.filter((gig) => {
        const gigDate = new Date(gig.date);
        if (dateFilter === "today") {
          return gigDate.toDateString() === today.toDateString();
        }
        if (dateFilter === "upcoming") {
          return gigDate > now && !gig.isTaken;
        }
        if (dateFilter === "past") {
          return gigDate < today;
        }
        return true;
      });
    }

    // Payment filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter((gig) => {
        if (paymentFilter === "paid") return gig.paymentStatus === "paid";
        if (paymentFilter === "pending") return gig.paymentStatus === "pending";
        return true;
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      switch (statusFilter) {
        case "active":
          filtered = filtered.filter((gig) => gig.isActive && !gig.isTaken);
          break;
        case "taken":
          filtered = filtered.filter((gig) => gig.isTaken);
          break;
        case "pending":
          filtered = filtered.filter((gig) => gig.isPending);
          break;
        case "draft":
          filtered = filtered.filter((gig) => !gig.isActive);
          break;
      }
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (b.date || b.createdAt) - (a.date || a.createdAt);
        case "oldest":
          return (a.date || a.createdAt) - (b.date || b.createdAt);
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        case "popular":
          return (b.viewCount?.length || 0) - (a.viewCount?.length || 0);
        default:
          return (b.date || b.createdAt) - (a.date || a.createdAt);
      }
    });

    return filtered;
  }, [
    gigs,
    searchQuery,
    viewFilter,
    dateFilter,
    paymentFilter,
    statusFilter,
    sortBy,
    user,
  ]);

  // Handlers
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    toast.success("Gigs refreshed!");
  };

  const handleCreateGig = () => {
    router.push("/hub/gigs/client/create");
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setViewFilter("all");
    setDateFilter("all");
    setPaymentFilter("all");
    setStatusFilter("all");
    setFilterAnimationKey((prev) => prev + 1);
    toast.success("Filters cleared");
  };

  const handleViewFilterChange = (value: ViewFilter) => {
    setViewFilter(value);
    setFilterAnimationKey((prev) => prev + 1);
  };

  const handleDateFilterChange = (value: DateFilter) => {
    setDateFilter(value);
    setFilterAnimationKey((prev) => prev + 1);
  };

  const handlePaymentFilterChange = (value: PaymentFilter) => {
    setPaymentFilter(value);
    setFilterAnimationKey((prev) => prev + 1);
  };

  const handleDisplayModeChange = (mode: DisplayMode) => {
    setDisplayMode(mode);
  };

  // Render gigs function
  const renderGigs = () => {
    if (filteredGigs.length === 0) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center py-12">
          <div
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center mb-4",
              isDarkMode ? "bg-slate-800" : "bg-slate-100",
            )}
          >
            <Music
              className={cn(
                "w-8 h-8",
                isDarkMode ? "text-slate-400" : "text-slate-500",
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
              "text-sm mb-4",
              isDarkMode ? "text-slate-400" : "text-slate-500",
            )}
          >
            Try adjusting your filters or create a new gig
          </p>
          <Button onClick={handleCreateGig} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Create New Gig
          </Button>
        </div>
      );
    }

    if (displayMode === "grid") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredGigs.map((gig) => (
            <CompactGigCard
              key={gig._id}
              gig={gig}
              onClick={() => router.push(`/hub/gigs/client/edit/${gig._id}`)}
            />
          ))}
        </div>
      );
    }

    if (displayMode === "list") {
      return (
        <div className="space-y-3">
          {filteredGigs.map((gig) => (
            <CompactGigCard
              key={gig._id}
              gig={gig}
              onClick={() => router.push(`/hub/gigs/client/edit/${gig._id}`)}
            />
          ))}
        </div>
      );
    }

    // For other views, default to grid
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredGigs.map((gig) => (
          <CompactGigCard
            key={gig._id}
            gig={gig}
            onClick={() => router.push(`/hub/gigs/client/edit/${gig._id}`)}
          />
        ))}
      </div>
    );
  };

  // Loading skeleton
  if (isLoading.gigs) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-32 rounded-xl flex-shrink-0" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col">
        {/* Sticky Header Section - Fixed at top - MATCHING BOOKEDGIPS STYLE */}
        <div
          className={cn(
            "sticky top-0 z-30 backdrop-blur-md border-b",
            isDarkMode
              ? "bg-slate-950/80 border-slate-800/50"
              : "bg-white/80 border-slate-200/50",
          )}
        >
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
                      isDarkMode ? "bg-orange-500/20" : "bg-orange-100",
                    )}
                  >
                    <Briefcase
                      className={cn(
                        "w-4 h-4 md:w-5 md:h-5",
                        isDarkMode ? "text-orange-400" : "text-orange-600",
                      )}
                    />
                  </div>
                  <h2
                    className={cn(
                      "text-base md:text-xl font-bold tracking-tight truncate",
                      isDarkMode ? "text-white" : "text-slate-900",
                    )}
                  >
                    My Gigs
                  </h2>
                </div>
                <p
                  className={cn(
                    "text-xs truncate",
                    isDarkMode ? "text-slate-400" : "text-slate-500",
                  )}
                >
                  {showHeader
                    ? "Manage your gigs"
                    : `${filteredGigs.length} gigs found`}
                </p>
              </motion.div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCreateGig}
                  size="sm"
                  className="h-8 px-3 text-xs gap-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                >
                  <Plus className="w-3 h-3" />
                  <span className="hidden sm:inline">New Gig</span>
                </Button>

                {/* Header Collapse Button with Chevron - MATCHING BOOKEDGIPS */}
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
            </div>

            {/* Expandable Stats - MATCHING BOOKEDGIPS STYLE */}
            <AnimatePresence>
              {showHeader && stats && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 space-y-3">
                    {/* Stats Cards - Horizontal scroll on mobile - MATCHING BOOKEDGIPS */}
                    {stats && (
                      <>
                        {/* Desktop Grid - hidden on mobile */}
                        <div className="hidden md:grid grid-cols-4 lg:grid-cols-7 gap-2">
                          {Object.entries(stats).map(([key, value], index) => {
                            // Skip special stats that have their own cards
                            if (
                              key === "totalEarnings" ||
                              key === "averageRating" ||
                              key === "clientsScore"
                            ) {
                              return null;
                            }
                            return (
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
                                        : key === "active"
                                          ? "Active"
                                          : key === "completed"
                                            ? "Completed"
                                            : key === "pending"
                                              ? "Pending"
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
                                                          : key ===
                                                              "pendingPayment"
                                                            ? "Due"
                                                            : key}
                                    </p>
                                    <p
                                      className={cn(
                                        "text-lg font-bold",
                                        isDarkMode
                                          ? "text-white"
                                          : "text-slate-900",
                                      )}
                                    >
                                      {value}
                                    </p>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            );
                          })}
                        </div>

                        {/* Special Stats Row - Earnings, Rating, Score */}
                        <div className="hidden md:grid grid-cols-3 gap-2">
                          {/* Total Earnings */}
                          <Card
                            className={cn(
                              "border shadow-sm",
                              isDarkMode
                                ? "bg-gradient-to-br from-emerald-950/30 to-emerald-950/10 border-emerald-900/20"
                                : "bg-gradient-to-br from-emerald-50/50 to-emerald-50/30 border-emerald-200/50",
                            )}
                          >
                            <CardContent className="p-2 text-center">
                              <p
                                className={cn(
                                  "text-[10px] font-medium uppercase tracking-wider",
                                  isDarkMode
                                    ? "text-emerald-300/90"
                                    : "text-emerald-600/90",
                                )}
                              >
                                Earnings
                              </p>
                              <p
                                className={cn(
                                  "text-lg font-bold",
                                  isDarkMode
                                    ? "text-emerald-300"
                                    : "text-emerald-600",
                                )}
                              >
                                ${stats.totalEarnings.toLocaleString()}
                              </p>
                            </CardContent>
                          </Card>

                          {/* Average Rating */}
                          <Card
                            className={cn(
                              "border shadow-sm",
                              isDarkMode
                                ? "bg-gradient-to-br from-yellow-950/30 to-yellow-950/10 border-yellow-900/20"
                                : "bg-gradient-to-br from-yellow-50/50 to-yellow-50/30 border-yellow-200/50",
                            )}
                          >
                            <CardContent className="p-2 text-center">
                              <p
                                className={cn(
                                  "text-[10px] font-medium uppercase tracking-wider",
                                  isDarkMode
                                    ? "text-yellow-300/90"
                                    : "text-yellow-600/90",
                                )}
                              >
                                Rating
                              </p>
                              <div className="flex items-center justify-center gap-1">
                                <p
                                  className={cn(
                                    "text-lg font-bold",
                                    isDarkMode
                                      ? "text-yellow-300"
                                      : "text-yellow-600",
                                  )}
                                >
                                  {stats.averageRating}
                                </p>
                                <Star
                                  className={cn(
                                    "w-3 h-3",
                                    isDarkMode
                                      ? "fill-yellow-300/70 text-yellow-300/70"
                                      : "fill-yellow-500/70 text-yellow-500/70",
                                  )}
                                />
                              </div>
                            </CardContent>
                          </Card>

                          {/* Client Score */}
                          <Card
                            className={cn(
                              "border shadow-sm",
                              isDarkMode
                                ? "bg-gradient-to-br from-indigo-950/30 to-indigo-950/10 border-indigo-900/20"
                                : "bg-gradient-to-br from-indigo-50/50 to-indigo-50/30 border-indigo-200/50",
                            )}
                          >
                            <CardContent className="p-2 text-center">
                              <p
                                className={cn(
                                  "text-[10px] font-medium uppercase tracking-wider",
                                  isDarkMode
                                    ? "text-indigo-300/90"
                                    : "text-indigo-600/90",
                                )}
                              >
                                Score
                              </p>
                              <p
                                className={cn(
                                  "text-lg font-bold",
                                  isDarkMode
                                    ? "text-indigo-300"
                                    : "text-indigo-600",
                                )}
                              >
                                {stats.clientsScore}
                              </p>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Mobile Horizontal Scroll Stats - MATCHING BOOKEDGIPS */}
                        <div className="md:hidden -mx-3 px-3 overflow-x-auto scrollbar-hide">
                          <div className="flex gap-2 pb-1 min-w-min">
                            {Object.entries(stats).map(
                              ([key, value], index) => {
                                let bgColor = !isDarkMode
                                  ? "bg-slate-100"
                                  : "bg-slate-800";
                                let textColor = isDarkMode
                                  ? "text-slate-400"
                                  : "text-slate-500";
                                let valueColor = isDarkMode
                                  ? "text-white"
                                  : "text-slate-900";

                                if (key === "totalEarnings") {
                                  bgColor = isDarkMode
                                    ? "bg-emerald-950/30"
                                    : "bg-emerald-50/70";
                                  textColor = isDarkMode
                                    ? "text-emerald-300/80"
                                    : "text-emerald-600/80";
                                  valueColor = isDarkMode
                                    ? "text-emerald-300"
                                    : "text-emerald-600";
                                } else if (key === "averageRating") {
                                  bgColor = isDarkMode
                                    ? "bg-yellow-950/30"
                                    : "bg-yellow-50/70";
                                  textColor = isDarkMode
                                    ? "text-yellow-300/80"
                                    : "text-yellow-600/80";
                                  valueColor = isDarkMode
                                    ? "text-yellow-300"
                                    : "text-yellow-600";
                                } else if (key === "clientsScore") {
                                  bgColor = isDarkMode
                                    ? "bg-indigo-950/30"
                                    : "bg-indigo-50/70";
                                  textColor = isDarkMode
                                    ? "text-indigo-300/80"
                                    : "text-indigo-600/80";
                                  valueColor = isDarkMode
                                    ? "text-indigo-300"
                                    : "text-indigo-600";
                                }

                                return (
                                  <div
                                    key={key}
                                    className={cn(
                                      "flex-shrink-0 px-3 py-1.5 rounded-full",
                                      bgColor,
                                    )}
                                  >
                                    <span className="text-xs font-medium whitespace-nowrap">
                                      <span className={cn("mr-1", textColor)}>
                                        {key === "total"
                                          ? "Total"
                                          : key === "active"
                                            ? "Active"
                                            : key === "completed"
                                              ? "Done"
                                              : key === "pending"
                                                ? "Pending"
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
                                                            : key ===
                                                                "pendingPayment"
                                                              ? "Due"
                                                              : key ===
                                                                  "totalEarnings"
                                                                ? "💰"
                                                                : key ===
                                                                    "averageRating"
                                                                  ? "⭐"
                                                                  : key ===
                                                                      "clientsScore"
                                                                    ? "📊"
                                                                    : key}
                                        :
                                      </span>
                                      <span
                                        className={cn("font-bold", valueColor)}
                                      >
                                        {key === "totalEarnings"
                                          ? `$${value}`
                                          : value}
                                      </span>
                                    </span>
                                  </div>
                                );
                              },
                            )}
                          </div>
                        </div>

                        {/* Scroll hint for mobile - MATCHING BOOKEDGIPS */}
                        <div className="md:hidden flex items-center justify-center gap-1 mt-1">
                          <div className="flex gap-1">
                            <div className="w-1 h-1 rounded-full bg-slate-400/50 animate-pulse" />
                            <div className="w-1 h-1 rounded-full bg-slate-400/50 animate-pulse delay-150" />
                            <div className="w-1 h-1 rounded-full bg-slate-400/50 animate-pulse delay-300" />
                          </div>
                          <span className="text-[10px] text-slate-400/70">
                            scroll for more stats
                          </span>
                        </div>
                      </>
                    )}

                    {/* Search Bar - Compact - MATCHING BOOKEDGIPS */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <Input
                        placeholder="Search by title, location, or artist..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 h-9 text-sm rounded-full"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <X className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      )}
                    </div>

                    {/* Filter Chips - Horizontal Scroll - MATCHING BOOKEDGIPS */}
                    <div className="overflow-x-auto scrollbar-hide -mx-3 px-3">
                      <div className="flex gap-2 pb-1 min-w-min">
                        {/* Role Filter Chip */}
                        <Select
                          value={viewFilter}
                          onValueChange={handleViewFilterChange}
                        >
                          <SelectTrigger
                            className={cn(
                              "w-auto h-8 rounded-full text-xs gap-1 px-3 border",
                              isDarkMode
                                ? "bg-slate-900/40 border-slate-800/30 text-slate-200/90 hover:bg-slate-800/40"
                                : "bg-white/60 border-slate-200/40 text-slate-700/90 hover:bg-slate-50/70",
                              viewFilter !== "all" &&
                                (isDarkMode
                                  ? "border-blue-500/50"
                                  : "border-blue-400"),
                            )}
                          >
                            <Users className="w-3.5 h-3.5 opacity-70" />
                            <SelectValue placeholder="Role" />
                          </SelectTrigger>
                          <SelectContent
                            className={cn(
                              "border",
                              isDarkMode
                                ? "bg-slate-900/90 border-slate-800/50 backdrop-blur-md"
                                : "bg-white/90 border-slate-200/50 backdrop-blur-md",
                            )}
                          >
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="client">Client</SelectItem>
                            <SelectItem value="musician">Artist</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Date Filter Chip */}
                        <Select
                          value={dateFilter}
                          onValueChange={handleDateFilterChange}
                        >
                          <SelectTrigger
                            className={cn(
                              "w-auto h-8 rounded-full text-xs gap-1 px-3 border",
                              isDarkMode
                                ? "bg-slate-900/40 border-slate-800/30 text-slate-200/90 hover:bg-slate-800/40"
                                : "bg-white/60 border-slate-200/40 text-slate-700/90 hover:bg-slate-50/70",
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
                            <Calendar className="w-3.5 h-3.5 opacity-70" />
                            <SelectValue placeholder="Date" />
                          </SelectTrigger>
                          <SelectContent
                            className={cn(
                              "border",
                              isDarkMode
                                ? "bg-slate-900/90 border-slate-800/50 backdrop-blur-md"
                                : "bg-white/90 border-slate-200/50 backdrop-blur-md",
                            )}
                          >
                            <SelectItem value="all">All</SelectItem>
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
                              "w-auto h-8 rounded-full text-xs gap-1 px-3 border",
                              isDarkMode
                                ? "bg-slate-900/40 border-slate-800/30 text-slate-200/90 hover:bg-slate-800/40"
                                : "bg-white/60 border-slate-200/40 text-slate-700/90 hover:bg-slate-50/70",
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
                            <DollarSign className="w-3.5 h-3.5 opacity-70" />
                            <SelectValue placeholder="Payment" />
                          </SelectTrigger>
                          <SelectContent
                            className={cn(
                              "border",
                              isDarkMode
                                ? "bg-slate-900/90 border-slate-800/50 backdrop-blur-md"
                                : "bg-white/90 border-slate-200/50 backdrop-blur-md",
                            )}
                          >
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Refresh Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRefresh}
                          disabled={isRefreshing}
                          className={cn(
                            "h-8 rounded-full gap-1 px-3 text-xs border",
                            isDarkMode
                              ? "bg-slate-900/40 border-slate-800/30 text-slate-300/90 hover:bg-slate-800/40"
                              : "bg-white/60 border-slate-200/40 text-slate-600/90 hover:bg-slate-100/70",
                          )}
                        >
                          <RefreshCw
                            className={cn(
                              "w-3.5 h-3.5",
                              isRefreshing && "animate-spin",
                              isDarkMode
                                ? "text-slate-400/70"
                                : "text-slate-500/70",
                            )}
                          />
                          <span className="hidden sm:inline">Refresh</span>
                        </Button>

                        {/* Clear Filters */}
                        {(searchQuery ||
                          viewFilter !== "all" ||
                          dateFilter !== "all" ||
                          paymentFilter !== "all") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearFilters}
                            className={cn(
                              "h-8 rounded-full gap-1 px-3 text-xs border border-rose-500/30",
                              isDarkMode
                                ? "bg-rose-950/20 text-rose-400/90 hover:bg-rose-950/40"
                                : "bg-rose-50/50 text-rose-600/90 hover:bg-rose-100/70",
                            )}
                          >
                            <X className="w-3.5 h-3.5 opacity-70" />
                            <span>Clear</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Quick filter stats - MATCHING BOOKEDGIPS */}
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={cn(
                          "flex items-center gap-2 px-2 py-1 rounded-full border",
                          isDarkMode
                            ? "bg-slate-900/40 border-slate-800/30 text-slate-300/90"
                            : "bg-slate-100/50 border-slate-200/40 text-slate-600/90",
                        )}
                      >
                        <span className="font-semibold text-orange-500/90">
                          {filteredGigs.length}
                        </span>
                        <span className="opacity-70">of</span>
                        <span
                          className={cn(
                            "font-semibold",
                            isDarkMode ? "text-white/90" : "text-slate-900/90",
                          )}
                        >
                          {gigs?.length || 0}
                        </span>
                        <span className="opacity-70">gigs</span>
                      </span>

                      {(searchQuery ||
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

        {/* View Toggle - Below header - MATCHING BOOKEDGIPS */}
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
                        onClick={() =>
                          handleDisplayModeChange(mode as DisplayMode)
                        }
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

            {/* Sort - MATCHING BOOKEDGIPS */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[120px] h-8 text-xs rounded-full">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent
                className={cn(
                  isDarkMode
                    ? "bg-slate-900 border-slate-800"
                    : "bg-white border-slate-200",
                )}
              >
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="price-high">Price: High</SelectItem>
                <SelectItem value="price-low">Price: Low</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
              </SelectContent>
            </Select>
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

        {/* Gradient Legend Button - Fixed at Bottom Right - MATCHING BOOKEDGIPS */}
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

        {/* Legend Dialog - MATCHING BOOKEDGIPS */}
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

export default MyGigs;
