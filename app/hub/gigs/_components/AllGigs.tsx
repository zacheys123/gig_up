// components/gigs/AllGigs.tsx
import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
// Components
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Icons
import {
  Music,
  Filter,
  Search,
  RefreshCw,
  Grid3x3,
  List,
  Zap,
  X,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Calendar,
  MapPin,
  DollarSign,
  CheckCircle,
  Clock,
  User,
  UserCheck,
  UserPlus,
  AlertCircle,
  Building2,
  Bookmark,
  Heart,
  Users,
} from "lucide-react";
// Hooks
import { useThemeColors } from "@/hooks/useTheme";

// Convex
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
// Types & Components
import { GigProps } from "@/types/gig";
import GigDescription from "./gigs/GigDescription";
import GigCard, { BandApplication, BandRole } from "./gigs/GigCard";
import FiltersPanel from "./gigs/FilterPanel";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ActionButtonConfig, getUserGigStatus, GigUserStatus } from "@/utils";
import { useAllGigs, useGigs } from "@/hooks/useAllGigs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Helper function to get status icon
export const getStatusIcon = (status: GigUserStatus) => {
  if (status.isGigPoster) {
    return <Sparkles className="w-4 h-4" />;
  }
  if (status.isBooked) {
    return <CheckCircle className="w-4 h-4" />;
  }
  if (status.isPending) {
    return <Clock className="w-4 h-4" />;
  }
  if (status.isInApplicants) {
    return <UserCheck className="w-4 h-4" />;
  }
  if (status.hasShownInterest) {
    return <User className="w-4 h-4" />;
  }
  return <UserPlus className="w-4 h-4" />;
};

// Helper function to get action button configuration
export const getActionButtonConfig = (
  status: GigUserStatus,
  gig: { isClientBand?: boolean; isTaken?: boolean },
): ActionButtonConfig => {
  const isClientBand = gig.isClientBand || false;

  if (status.isGigPoster) {
    return {
      label: gig.isTaken ? "Manage" : "Review",
      variant: "default" as const,
      icon: <Sparkles className="w-4 h-4" />,
      action: "manage",
      disabled: false,
    };
  }

  if (status.isBooked) {
    return {
      label: "Booked",
      variant: "secondary" as const,
      icon: <CheckCircle className="w-4 h-4" />,
      action: "none",
      disabled: true,
    };
  }

  if (status.isPending || status.isInApplicants) {
    return {
      label: isClientBand ? "Pending" : "Applied",
      variant: "outline" as const,
      icon: <Clock className="w-4 h-4" />,
      action: "withdraw",
      disabled: false,
    };
  }

  if (status.canApply) {
    return {
      label: isClientBand ? "Apply with Band" : "Show Interest",
      variant: "default" as const,
      icon: isClientBand ? (
        <Building2 className="w-4 h-4" />
      ) : (
        <UserPlus className="w-4 h-4" />
      ),
      action: "apply",
      disabled: false,
    };
  }

  return {
    label: "Unavailable",
    variant: "secondary" as const,
    icon: <AlertCircle className="w-4 h-4" />,
    action: "none",
    disabled: true,
  };
};

// Main Component
export const AllGigs = ({ user }: { user: any }) => {
  const { colors, isDarkMode } = useThemeColors();
  const router = useRouter();
  // State variables
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState("");

  // Filters from panel
  const [filters, setFilters] = useState<Record<string, any>>({
    showOnlyActive: true,
  });

  // GigDescription modal state
  const [selectedGig, setSelectedGig] = useState<GigProps | null>(null);
  const [showGigDescription, setShowGigDescription] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isSavedMap, setIsSavedMap] = useState<Record<string, boolean>>({});
  const [isFavoriteMap, setIsFavoriteMap] = useState<Record<string, boolean>>(
    {},
  );

  // Convex mutations
  const saveGig = useMutation(api.controllers.gigs.saveGig);
  const unsaveGig = useMutation(api.controllers.gigs.unsaveGig);
  const favoriteGig = useMutation(api.controllers.gigs.favoriteGig);
  const unfavoriteGig = useMutation(api.controllers.gigs.unfavoriteGig);
  const bookGigMutation = useMutation(api.controllers.gigs.showInterestInGig);

  const { allGigs: gigs, isLoading } = useAllGigs({ limit: 100 });
  const allNewGigs = gigs.filter((gig: any) => gig.isTaken === false);
  // Still use the old hook for user's posted gigs and applications
  const { gigs: userGigs } = useGigs(user?._id);

  // Combine with user's posted gigs (to ensure they're included)
  const combinedGigs = useMemo(() => {
    const allGigsArray = allNewGigs || [];
    const userGigsArray = userGigs || [];

    // Merge and remove duplicates
    const combined = [...userGigsArray, ...allGigsArray];
    const unique = combined.filter(
      (gig, index, self) => index === self.findIndex((g) => g._id === gig._id),
    );

    return unique;
  }, [allNewGigs, userGigs]);

  // Then use combinedGigs instead of allNewGigs in your component
  const categories = useMemo(() => {
    const unique = new Set<string>();
    combinedGigs.forEach((gig) => gig.category && unique.add(gig.category));
    return Array.from(unique);
  }, [combinedGigs]);

  // Optimized version - only update when gig IDs actually change
  useEffect(() => {
    // Create arrays of gig IDs for comparison
    const currentGigIds = allNewGigs.map((gig) => gig._id).sort();
    const savedGigIds = Object.keys(isSavedMap).sort();
    const favoriteGigIds = Object.keys(isFavoriteMap).sort();

    // Only update if gig IDs have changed
    const hasNewGigs =
      JSON.stringify(currentGigIds) !== JSON.stringify(savedGigIds);
    const hasNewFavorites =
      JSON.stringify(currentGigIds) !== JSON.stringify(favoriteGigIds);

    if (hasNewGigs || hasNewFavorites) {
      const savedMap: Record<string, boolean> = {};
      const favoriteMap: Record<string, boolean> = {};

      allNewGigs.forEach((gig) => {
        // Preserve existing saved/favorite status if gig already exists
        savedMap[gig._id] = isSavedMap[gig._id] || false;
        favoriteMap[gig._id] = isFavoriteMap[gig._id] || false;
      });

      setIsSavedMap(savedMap);
      setIsFavoriteMap(favoriteMap);
    }
  }, [allNewGigs]); // Remove user?._id dependency if it's not needed for the check
  const locations = useMemo(() => {
    const unique = new Set<string>();
    allNewGigs.forEach((gig) => gig.location && unique.add(gig.location));
    return Array.from(unique);
  }, [allNewGigs]);

  // Filter gigs based on search and panel filters
  const filteredGigs = useMemo(() => {
    let result = allNewGigs.filter((gig) => {
      // Apply search filter
      if (gig.isPending) {
        return false;
      }
      const matchesSearch =
        !searchQuery ||
        gig.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gig.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gig.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gig.tags?.some((tag: any) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      // Apply filters from panel
      let matchesFilters = true;

      if (Object.keys(filters).length > 0) {
        // Category filter - FIX: Use optional chaining and check for undefined
        if (filters.category && filters.category !== "all") {
          matchesFilters = gig.category === filters.category;
          if (!matchesFilters) return false;
        }

        // Location filter
        if (filters.location && filters.location !== "all") {
          matchesFilters = gig.location === filters.location;
          if (!matchesFilters) return false;
        }

        // Talent type filter
        if (
          filters.talentTypes &&
          Array.isArray(filters.talentTypes) &&
          filters.talentTypes.length > 0
        ) {
          matchesFilters = filters.talentTypes.includes(gig.bussinesscat);
          if (!matchesFilters) return false;
        }

        // Status filter
        if (filters.status && filters.status !== "all") {
          if (filters.status === "available") {
            matchesFilters = !gig.isTaken && !gig.isPending;
          } else if (filters.status === "booked") {
            matchesFilters = gig.isTaken;
          } else if (filters.status === "pending") {
            matchesFilters = gig.isPending;
          }
          if (!matchesFilters) return false;
        }

        // Price filter
        if (filters.priceRange && filters.priceRange !== "all") {
          const price = gig.price || 0;
          let priceMatches = true;
          switch (filters.priceRange) {
            case "0-500":
              priceMatches = price <= 500;
              break;
            case "500-1000":
              priceMatches = price > 500 && price <= 1000;
              break;
            case "1000-2500":
              priceMatches = price > 1000 && price <= 2500;
              break;
            case "2500-5000":
              priceMatches = price > 2500 && price <= 5000;
              break;
            case "5000+":
              priceMatches = price > 5000;
              break;
          }
          if (!priceMatches) return false;
        }

        // Negotiable filter - FIX: Check if it exists and is true
        if (filters.negotiable === true) {
          matchesFilters = gig.negotiable === true;
          if (!matchesFilters) return false;
        }

        // Gig type filter - FIX: Check if it exists and handle undefined
        if (filters.gigType && filters.gigType !== "all") {
          // Check if gig.category exists and contains the filter
          const gigCategory = gig.category?.toLowerCase() || "";
          matchesFilters = gigCategory.includes(filters.gigType.toLowerCase());
          if (!matchesFilters) return false;
        }

        // Active filter (default to true)
        if (filters.showOnlyActive !== false) {
          matchesFilters = gig.isActive === true;
          if (!matchesFilters) return false;
        }
      }

      return matchesSearch && matchesFilters;
    });

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (b.date || 0) - (a.date || 0);
        case "oldest":
          return (a.date || 0) - (b.date || 0);
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        case "popular":
          return (b.viewCount?.length || 0) - (a.viewCount?.length || 0);
        default:
          return (b.date || 0) - (a.date || 0);
      }
    });

    return result;
  }, [allNewGigs, searchQuery, filters, sortBy]);
  // Calculate active filters count (excluding search)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (value && key !== "showOnlyActive") {
        if (Array.isArray(value)) {
          count += value.length;
        } else if (value !== "all" && value !== "" && value !== true) {
          count += 1;
        }
      }
    });
    return count;
  }, [filters]);

  // Get stats for display
  const stats = useMemo(() => {
    const available = filteredGigs.filter(
      (g) => !g.isTaken && !g.isPending,
    ).length;
    const booked = filteredGigs.filter((g) => g.isTaken).length;
    const pending = filteredGigs.filter((g) => g.isPending).length;
    const avgPrice =
      filteredGigs.reduce((sum, gig) => sum + (gig.price || 0), 0) /
        filteredGigs.length || 0;

    return { available, booked, pending, avgPrice: Math.round(avgPrice) };
  }, [filteredGigs]);

  // Handlers
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsRefreshing(false);
    toast.success("Gigs refreshed!");
  };

  const handleClearAll = () => {
    setSearchQuery("");
    setFilters({ showOnlyActive: true });
    setSortBy("newest");
    toast.info("Cleared all filters and search");
  };

  // GigDescription handlers
  const handleOpenGigDescription = (gig: any) => {
    setSelectedGig(gig);
    setShowGigDescription(true);
  };

  const handleCloseGigDescription = () => {
    setShowGigDescription(false);
    setSelectedGig(null);
  };

  const handleBookGig = async () => {
    if (!selectedGig || !user?._id) return;

    setIsBooking(true);
    try {
      await bookGigMutation({
        gigId: selectedGig._id as Id<"gigs">,
        userId: user._id,
      });

      toast.success("🎉 Successfully booked the gig!");
      handleCloseGigDescription();
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to book gig";
      toast.error(errorMessage);
    } finally {
      setIsBooking(false);
    }
  };

  const handleSaveGig = async () => {
    if (!selectedGig || !user?._id) return;

    const gigId = selectedGig._id;
    const isCurrentlySaved = isSavedMap[gigId];

    try {
      if (isCurrentlySaved) {
        await unsaveGig({
          userId: user._id,
          gigId: gigId,
        });
        setIsSavedMap((prev) => ({ ...prev, [gigId]: false }));
        toast.success("Removed from saved");
      } else {
        await saveGig({
          userId: user._id,
          gigId: gigId,
        });
        setIsSavedMap((prev) => ({ ...prev, [gigId]: true }));
        toast.success("⭐ Added to saved");
      }
    } catch (error: any) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update saved status";
      toast.error(errorMessage);
    }
  };

  const handleFavoriteGig = async () => {
    if (!selectedGig || !user?._id) return;

    const gigId = selectedGig._id;
    const isCurrentlyFavorited = isFavoriteMap[gigId];

    try {
      if (isCurrentlyFavorited) {
        await unfavoriteGig({
          userId: user._id,
          gigId: gigId,
        });
        setIsFavoriteMap((prev) => ({ ...prev, [gigId]: false }));
        toast.success("Removed from favorites");
      } else {
        await favoriteGig({
          userId: user._id,
          gigId: gigId,
        });
        setIsFavoriteMap((prev) => ({ ...prev, [gigId]: true }));
        toast.success("❤️ Added to favorites");
      }
    } catch (error: any) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update favorite status";
      toast.error(errorMessage);
    }
  };
  // In allNewGigs.tsx, add this converter:
  const convertGigToGigProps = (gig: any): GigProps => {
    // Cast the bookingHistory entries to fix status types
    const convertedBookingHistory = gig.bookingHistory?.map((entry: any) => ({
      ...entry,
      status: entry.status as any,
    }));

    // Also convert bandBookingHistory if needed
    const convertedBandBookingHistory = gig.bandBookingHistory?.map(
      (entry: any) => ({
        ...entry,
        // Handle any type mismatches here
      }),
    );

    // DO NOT convert bookCount - keep it as band applications
    const convertedBookCount = gig.bookCount?.map((entry: any) => ({
      ...entry,
      // Keep the original structure
      bandId: entry.bandId,
      appliedAt: entry.appliedAt,
      appliedBy: entry.appliedBy,
      status: entry.status,
      performingMembers: entry.performingMembers || [],
      proposedFee: entry.proposedFee,
      notes: entry.notes,
      bookedAt: entry.bookedAt,
      agreedFee: entry.agreedFee,
      contractSigned: entry.contractSigned,
      shortlistedAt: entry.shortlistedAt,
      shortlistNotes: entry.shortlistNotes,
    }));

    return {
      ...gig,
      bookingHistory: convertedBookingHistory,
      bandBookingHistory: convertedBandBookingHistory,
      bookCount: convertedBookCount, // This is now correctly typed
      // Cast other problematic fields
      paymentStatus: gig.paymentStatus as any,
    };
  };

  // Then use it:
  const getUserStatusForGig = (gig: any) => {
    const convertedGig = convertGigToGigProps(gig);
    return getUserGigStatus(convertedGig, user?._id);
  };
  const [showHeader, setShowHeader] = useState(false);
  type ChildData = {
    _id: Id<"gigs">;
    title: string;
    description?: string;
    location?: string;
    date: number;
    time: {
      start: string;
      end: string;
      durationFrom: string;
      durationTo: string;
    };
    price?: number;
    logo: string;
    postedBy: Id<"users">;
    isClientBand?: boolean;
    isTaken?: boolean;
    isPending?: boolean;
    isActive?: boolean;
    interestedUsers?: Id<"users">[];
    bookCount?: BandApplication[];
    maxSlots?: number;
    tags?: string[];
    category?: string;
    bussinesscat?: string;
    negotiable?: boolean;
    paymentStatus?: string;
    viewCount?: Id<"users">[];
    bookingHistory?: any[];
    acceptInterestStartTime?: number;
    acceptInterestEndTime?: number;
    bandCategory?: BandRole[];
    createdAt: number;
    updatedAt: number;
    font?: string;
    fontColor?: string;
    backgroundColor?: string;
    fontFamily?: string;
  };
  const [selectedModalGig, setSelectedModalGig] = useState<ChildData | null>(
    null,
  );
  const [showGigModal, setShowGigModal] = useState(false);

  const handleShowGigDetails = (gig: ChildData) => {
    setSelectedModalGig(gig);
    setShowGigModal(true);
  };

  if (isLoading) {
    // Changed from isLoading.gigs || isLoading.explore
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse" />
          <Skeleton className="h-14 w-full rounded-xl bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-20 rounded-xl bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse"
            />
          ))}
        </div>

        {/* Gig Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-80 rounded-2xl bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* GigDescription Modal */}
      {showGigModal && selectedModalGig && (
        <GigDescription
          gig={selectedModalGig}
          isOpen={showGigModal}
          onClose={() => setShowGigModal(false)}
          currentUserId={user?._id}
          user={user}
          isSaved={isSavedMap[selectedModalGig?._id]}
          isFavorite={isFavoriteMap[selectedModalGig?._id]}
          onSave={handleSaveGig}
          onFavorite={handleFavoriteGig}
        />
      )}
      {/* Filters Panel */}
      <FiltersPanel
        isOpen={showFiltersPanel}
        onClose={() => setShowFiltersPanel(false)}
        onApplyFilters={setFilters}
        currentFilters={filters}
        availableCategories={categories}
        availableLocations={locations}
      />
      {/* Header Section with Gradient */}
      {!showHeader && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`
    relative overflow-hidden rounded-2xl p-6 md:p-8 border
    ${
      isDarkMode
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black border-gray-700"
        : "bg-gradient-to-br from-orange-50 via-white to-gray-100 border-gray-200"
    }
  `}
        >
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
              <div className="space-y-2 flex justify-between items-center w-full">
                <div className="flex flex-col gap-3">
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    Discover Amazing Gigs
                  </h1>
                  <p
                    className={`${isDarkMode ? "text-gray-300" : "text-gray-600"} max-w-2xl`}
                  >
                    Find the perfect gig opportunity or talent for your next
                    event.
                    {filteredGigs.length > 0 &&
                      ` ${filteredGigs.length} amazing opportunities available now!`}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="m-1 border-red-400 bg-gradient-to-r from-red-500/10 to-orange-500/5"
                  onClick={() => setShowHeader((prev) => !prev)}
                >
                  {" "}
                  Collapse Header
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                {
                  label: "Available",
                  value: stats.available,
                  icon: Sparkles,
                  color: "green",
                },
                {
                  label: "Booked",
                  value: stats.booked,
                  icon: Calendar,
                  color: "blue",
                },
                {
                  label: "Avg. Price",
                  value: `$${stats.avgPrice}`,
                  icon: DollarSign,
                  color: "purple",
                },
                {
                  label: "Locations",
                  value: locations.length,
                  icon: MapPin,
                  color: "amber",
                },
              ].map((item) => (
                <Card
                  key={item.label}
                  className={`
            backdrop-blur-sm
            ${
              isDarkMode
                ? "bg-gray-800/80 border-gray-700"
                : "bg-white/80 border-gray-200"
            }
          `}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                          {item.label}
                        </p>
                        <p
                          className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {item.value}
                        </p>
                      </div>
                      <div
                        className={`
                p-2 rounded-lg
                ${
                  isDarkMode
                    ? `bg-${item.color}-900/20`
                    : `bg-${item.color}-100`
                }
              `}
                      >
                        <item.icon
                          className={`
                  w-5 h-5
                  ${
                    isDarkMode
                      ? `text-${item.color}-400`
                      : `text-${item.color}-600`
                  }
                `}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Search Bar with Advanced Options */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search gigs by title, description, location, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`
            pl-12 pr-12 h-12 rounded-xl text-lg backdrop-blur-sm
            ${
              isDarkMode
                ? "border-gray-600 bg-gray-800/90 text-white"
                : "border-gray-300 bg-white/90 text-gray-900"
            }
          `}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className={`
              absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full
              ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}
            `}
                  >
                    <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                )}
              </div>

              {/* Quick Filter Bar */}
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => setShowFiltersPanel(true)}
                  variant="outline"
                  size="sm"
                  className={`
            gap-2
            ${
              isDarkMode
                ? "border-gray-700 hover:bg-gray-800 text-gray-300"
                : "border-gray-300 hover:bg-gray-50 text-gray-700"
            }
          `}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-1 px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger
                    className={`
            w-[180px]
            ${
              isDarkMode
                ? "border-gray-700 bg-gray-800 text-white"
                : "border-gray-300 bg-white text-gray-900"
            }
          `}
                  >
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  variant="ghost"
                  size="sm"
                  className={`
            gap-2
            ${
              isDarkMode
                ? "text-gray-300 hover:bg-gray-800"
                : "text-gray-700 hover:bg-gray-100"
            }
          `}
                >
                  <RefreshCw
                    className={cn("w-4 h-4", isRefreshing && "animate-spin")}
                  />
                  Refresh
                </Button>

                {(searchQuery || activeFiltersCount > 0) && (
                  <Button
                    onClick={handleClearAll}
                    variant="ghost"
                    size="sm"
                    className={`
              gap-2
              ${
                isDarkMode
                  ? "text-red-400 hover:text-red-300 hover:bg-gray-800"
                  : "text-red-500 hover:text-red-600 hover:bg-gray-100"
              }
            `}
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}{" "}
      {/* Active Filters Display */}
      {(searchQuery || activeFiltersCount > 0) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="p-4 rounded-xl border border-blue-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-medium text-gray-900 dark:text-white">
                Active Filters
              </span>
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                {searchQuery ? activeFiltersCount + 1 : activeFiltersCount}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <X className="w-3 h-3" />
              Clear All Filters
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none">
                <Search className="w-3 h-3 mr-1" />
                Search: "{searchQuery}"
              </Badge>
            )}

            {filters.talentTypes && filters.talentTypes.length > 0 && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white border-none">
                <Music className="w-3 h-3 mr-1" />
                {filters.talentTypes.length} talent type
                {filters.talentTypes.length > 1 ? "s" : ""}
              </Badge>
            )}

            {filters.category && filters.category !== "all" && (
              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-none">
                {filters.category}
              </Badge>
            )}

            {filters.location && filters.location !== "all" && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-none">
                <MapPin className="w-3 h-3 mr-1" />
                {filters.location}
              </Badge>
            )}

            {filters.status && filters.status !== "all" && (
              <Badge className="bg-gradient-to-r from-cyan-500 to-sky-600 text-white border-none">
                Status: {filters.status}
              </Badge>
            )}

            {filters.priceRange && filters.priceRange !== "all" && (
              <Badge className="bg-gradient-to-r from-rose-500 to-red-600 text-white border-none">
                <DollarSign className="w-3 h-3 mr-1" />
                Price: {filters.priceRange}
              </Badge>
            )}

            {filters.negotiable && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none">
                Negotiable Only
              </Badge>
            )}
          </div>
        </motion.div>
      )}
      {/* View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 my-4">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <span
              className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              &nbsp;&nbsp; View:
            </span>
            <Tabs
              value={viewMode}
              onValueChange={(v) => setViewMode(v as any)}
              className="w-auto"
            >
              <TabsList
                className={`
          p-1 
          ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}
        `}
              >
                <TabsTrigger
                  value="grid"
                  className={`
              px-4 py-2 rounded-lg
              ${
                isDarkMode
                  ? "data-[state=active]:bg-gray-900"
                  : "data-[state=active]:bg-white"
              }
              data-[state=active]:shadow-sm
            `}
                >
                  <Grid3x3 className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger
                  value="list"
                  className={`
              px-4 py-2 rounded-lg
              ${
                isDarkMode
                  ? "data-[state=active]:bg-gray-900"
                  : "data-[state=active]:bg-white"
              }
              data-[state=active]:shadow-sm
            `}
                >
                  <List className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div
            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            <span
              className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
            >
              {filteredGigs.length}
            </span>{" "}
            of{" "}
            <span
              className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
            >
              {combinedGigs.length}{" "}
              {/* Use combinedGigs instead of allNewGigs */}
            </span>{" "}
            gigs
          </div>
        </div>

        <div className="flex items-center gap-3">
          {showHeader && (
            <Button
              variant="outline"
              className="m-1 border-red-400 bg-gradient-to-r from-red-500/10 to-orange-500/5"
              onClick={() => setShowHeader((prev) => !prev)}
            >
              {" "}
              Show Header
            </Button>
          )}
          <span
            className={`text-sm hidden sm:inline ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Sort by:
          </span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger
              className={`
        w-[160px]
        ${
          isDarkMode
            ? "border-gray-700 bg-gray-800 text-white"
            : "border-gray-200 bg-white text-gray-900"
        }
      `}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <SelectValue placeholder="Sort by" />
              </div>
            </SelectTrigger>
            <SelectContent
              className={`
        ${
          isDarkMode
            ? "bg-gray-800 border-gray-700 text-white"
            : "bg-white border-gray-200"
        }
      `}
            >
              <SelectItem
                value="newest"
                className={`
          ${
            isDarkMode
              ? "hover:bg-gray-700 focus:bg-gray-700"
              : "hover:bg-gray-100 focus:bg-gray-100"
          }
        `}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  Newest First
                </div>
              </SelectItem>
              <SelectItem
                value="oldest"
                className={`
          ${
            isDarkMode
              ? "hover:bg-gray-700 focus:bg-gray-700"
              : "hover:bg-gray-100 focus:bg-gray-100"
          }
        `}
              >
                Oldest First
              </SelectItem>
              <SelectItem
                value="price-high"
                className={`
          ${
            isDarkMode
              ? "hover:bg-gray-700 focus:bg-gray-700"
              : "hover:bg-gray-100 focus:bg-gray-100"
          }
        `}
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3 h-3" />
                  Price: High to Low
                </div>
              </SelectItem>
              <SelectItem
                value="price-low"
                className={`
          ${
            isDarkMode
              ? "hover:bg-gray-700 focus:bg-gray-700"
              : "hover:bg-gray-100 focus:bg-gray-100"
          }
        `}
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3 h-3" />
                  Price: Low to High
                </div>
              </SelectItem>
              <SelectItem
                value="popular"
                className={`
          ${
            isDarkMode
              ? "hover:bg-gray-700 focus:bg-gray-700"
              : "hover:bg-gray-100 focus:bg-gray-100"
          }
        `}
              >
                Most Popular
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Results Section */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${viewMode}-${sortBy}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6 }}
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" // Remove h-full
              : "space-y-4",
          )}
        >
          {filteredGigs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center"
            >
              <div className="mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                    <Music className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <X className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                No gigs found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
                {allNewGigs.length === 0
                  ? "Be the first to post a gig and start connecting with amazing talent!"
                  : "Try adjusting your search or filters to find what you're looking for."}
              </p>
              {(searchQuery || activeFiltersCount > 0) && (
                <Button
                  onClick={handleClearAll}
                  className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  <X className="w-4 h-4" />
                  Clear Search & Filters
                </Button>
              )}
              {allNewGigs.length === 0 && (
                <Button
                  onClick={() => router.push("/hub/gigs?tab=invites")}
                  className="gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
                >
                  <Zap className="w-4 h-4" />
                  No Gigs Yet - Check your Notifications maybe you have
                  instantGig!!!!!
                </Button>
              )}
            </motion.div>
          ) : (
            filteredGigs.map((gig, index) => {
              const userStatus = getUserStatusForGig(gig);

              return (
                <motion.div
                  key={gig._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={viewMode === "list" ? "w-full " : " "}
                  whileHover={{ scale: viewMode === "grid" ? 1.02 : 1 }}
                >
                  <GigCard
                    key={gig._id}
                    gig={gig}
                    userStatus={userStatus}
                    onClick={() => handleOpenGigDescription(gig)}
                    showFullGigs={false}
                    getGigFromChild={handleShowGigDetails}
                  />
                </motion.div>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>
      {/* Pagination / Load More */}
      {filteredGigs.length > 0 && filteredGigs.length < allNewGigs.length && (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Load More Gigs
          </Button>
        </div>
      )}
      {/* Fixed Action Buttons for Mobile */}
      {/* <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 md:hidden">
        <Button
          onClick={() => setShowFiltersPanel(true)}
          size="icon"
          className="rounded-full shadow-lg h-14 w-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
        >
          <Filter className="w-6 h-6" />
        </Button>
        <Button
          onClick={() => router.push("/post-gig")}
          size="icon"
          className="rounded-full shadow-lg h-14 w-14 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
        >
          <Zap className="w-6 h-6" />
        </Button>
      </div> */}
    </div>
  );
};

export default AllGigs;
