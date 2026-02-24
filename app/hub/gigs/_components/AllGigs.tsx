// components/gigs/AllGigs.tsx
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
  Kanban,
  ChevronDown,
  CalendarDays,
  Activity,
  Briefcase,
  Send,
  Users2,
  Mic,
  Volume2,
  ChevronUp,
} from "lucide-react";
import { useThemeColors } from "@/hooks/useTheme";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { GigProps } from "@/types/gig";
import GigDescription from "./gigs/GigDescription";
import GigCard, { BandApplication, BandRole } from "./gigs/GigCard";
import FiltersPanel from "./gigs/FilterPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ActionButtonConfig, getUserGigStatus, GigUserStatus } from "@/utils";
import { useAllGigs, useGigs } from "@/hooks/useAllGigs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Types
type DisplayMode = "grid" | "timeline" | "list" | "calendar" | "kanban";
type ViewMode = "grid" | "list";
type SortOption = "newest" | "oldest" | "price-high" | "price-low" | "popular";
type ActiveTab = "all" | "available" | "interested" | "applied" | "booked"; // ADD THIS LINE

interface ChildData {
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
}

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

export const AllGigs = ({ user }: { user: any }) => {
  const { colors, isDarkMode } = useThemeColors();
  const router = useRouter();

  // State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("grid");
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, any>>({
    showOnlyActive: true,
  });
  const [selectedGig, setSelectedGig] = useState<GigProps | null>(null);
  const [showGigDescription, setShowGigDescription] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isSavedMap, setIsSavedMap] = useState<Record<string, boolean>>({});
  const [isFavoriteMap, setIsFavoriteMap] = useState<Record<string, boolean>>(
    {},
  );
  const [selectedModalGig, setSelectedModalGig] = useState<ChildData | null>(
    null,
  );
  const [showGigModal, setShowGigModal] = useState(false);
  const [showHeader, setShowHeader] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("all"); // ADD THIS
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Get all gigs
  const { allGigs: gigs, isLoading: gigsLoading } = useAllGigs({ limit: 100 });

  // Get user's gigs - FIXED: isLoading is an object
  const { gigs: userGigs, isLoading: userGigsLoadingObject } = useGigs(
    user?._id,
  );

  // Extract the correct loading state
  const userGigsLoading = userGigsLoadingObject?.gigs ?? true;

  const userPreferences = useQuery(
    api.controllers.userPrefferences.getUserPreferences,
    user?._id ? { userId: user._id } : "skip",
  );
  const [isDataReady, setIsDataReady] = useState(false);

  useEffect(() => {
    // Check if we have actual data
    const hasGigs = Array.isArray(gigs);
    const hasUserGigs = Array.isArray(userGigs);
    const hasPreferences = userPreferences !== undefined;

    // Check loading states correctly
    const gigsDoneLoading = !gigsLoading;
    const userGigsDoneLoading = !userGigsLoading; // Now this is a boolean

    console.log("📊 Data Ready Check:", {
      hasGigs,
      hasUserGigs,
      hasPreferences,
      gigsDoneLoading,
      userGigsDoneLoading,
      ready:
        hasGigs &&
        hasUserGigs &&
        hasPreferences &&
        gigsDoneLoading &&
        userGigsDoneLoading,
    });

    if (
      hasGigs &&
      hasUserGigs &&
      hasPreferences &&
      gigsDoneLoading &&
      userGigsDoneLoading
    ) {
      console.log("✅ Data is ready! Showing content...");
      setIsDataReady(true);
    }
  }, [gigs, userGigs, userPreferences, gigsLoading, userGigsLoading]);
  // Set initial loading false when data is ready
  useEffect(() => {
    if (!gigsLoading && !userGigsLoading && userPreferences !== undefined) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsInitialLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [gigsLoading, userGigsLoading, userPreferences]);
  const updateComponentPrefs = useMutation(
    api.controllers.userPrefferences.updateComponentPreferences,
  );
  // Load preferences
  useEffect(() => {
    if (userPreferences?.preferences?.allGigs) {
      const prefs = userPreferences.preferences.allGigs;
      if (prefs.displayMode) setDisplayMode(prefs.displayMode as DisplayMode);
      if (prefs.viewMode) setViewMode(prefs.viewMode as ViewMode);
      if (prefs.sortBy) setSortBy(prefs.sortBy as SortOption);
      if (prefs.activeTab) setActiveTab(prefs.activeTab as ActiveTab); // ADD THIS LINE
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
          component: "allGigs",
          settings: { displayMode: mode },
        });
      } catch (error) {
        console.error("Error saving display mode:", error);
      }
    },
    [user?._id, updateComponentPrefs],
  );

  // Save view mode
  const handleViewModeChange = useCallback(
    async (mode: ViewMode) => {
      setViewMode(mode);

      if (!user?._id) return;

      try {
        await updateComponentPrefs({
          userId: user._id,
          component: "allGigs",
          settings: { viewMode: mode },
        });
      } catch (error) {
        console.error("Error saving view mode:", error);
      }
    },
    [user?._id, updateComponentPrefs],
  );

  // Save sort preference
  const handleSortChange = useCallback(
    async (sort: SortOption) => {
      setSortBy(sort);

      if (!user?._id) return;

      try {
        await updateComponentPrefs({
          userId: user._id,
          component: "allGigs",
          settings: { sortBy: sort },
        });
      } catch (error) {
        console.error("Error saving sort preference:", error);
      }
    },
    [user?._id, updateComponentPrefs],
  );
  // Add this handler after your other handlers (handleSortChange, etc.)
  const handleTabChange = useCallback(
    async (tab: string) => {
      setActiveTab(tab as ActiveTab);

      if (!user?._id) return;

      try {
        await updateComponentPrefs({
          userId: user._id,
          component: "allGigs",
          settings: { activeTab: tab },
        });
      } catch (error) {
        console.error("Error saving tab preference:", error);
      }
    },
    [user?._id, updateComponentPrefs],
  );
  // Convex queries
  const saveGig = useMutation(api.controllers.gigs.saveGig);
  const unsaveGig = useMutation(api.controllers.gigs.unsaveGig);
  const favoriteGig = useMutation(api.controllers.gigs.favoriteGig);
  const unfavoriteGig = useMutation(api.controllers.gigs.unfavoriteGig);
  const allNewGigs = gigs.filter((gig: any) => gig.isTaken === false);

  // Combine with user's posted gigs
  const combinedGigs = useMemo(() => {
    const allGigsArray = allNewGigs || [];
    const userGigsArray = userGigs || [];

    const combined = [...userGigsArray, ...allGigsArray];
    const unique = combined.filter(
      (gig, index, self) => index === self.findIndex((g) => g._id === gig._id),
    );

    return unique;
  }, [allNewGigs, userGigs]);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    combinedGigs.forEach((gig) => gig.category && unique.add(gig.category));
    return Array.from(unique);
  }, [combinedGigs]);

  const locations = useMemo(() => {
    const unique = new Set<string>();
    allNewGigs.forEach((gig) => gig.location && unique.add(gig.location));
    return Array.from(unique);
  }, [allNewGigs]);
  const convertGigToGigProps = (gig: any): GigProps => {
    const convertedBookingHistory = gig.bookingHistory?.map((entry: any) => ({
      ...entry,
      status: entry.status as any,
    }));

    const convertedBandBookingHistory = gig.bandBookingHistory?.map(
      (entry: any) => ({
        ...entry,
      }),
    );

    const convertedBookCount = gig.bookCount?.map((entry: any) => ({
      ...entry,
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
      bookCount: convertedBookCount,
      paymentStatus: gig.paymentStatus as any,
    };
  };
  // user status
  const getUserStatusForGig = (gig: any) => {
    const convertedGig = convertGigToGigProps(gig);
    return getUserGigStatus(convertedGig, user?._id);
  };
  // Optimized saved/favorite maps
  useEffect(() => {
    const currentGigIds = allNewGigs.map((gig) => gig._id).sort();
    const savedGigIds = Object.keys(isSavedMap).sort();

    if (JSON.stringify(currentGigIds) !== JSON.stringify(savedGigIds)) {
      const savedMap: Record<string, boolean> = {};
      const favoriteMap: Record<string, boolean> = {};

      allNewGigs.forEach((gig) => {
        savedMap[gig._id] = isSavedMap[gig._id] || false;
        favoriteMap[gig._id] = isFavoriteMap[gig._id] || false;
      });

      setIsSavedMap(savedMap);
      setIsFavoriteMap(favoriteMap);
    }
  }, [allNewGigs]);

  // Filter gigs
  const filteredGigs = useMemo(() => {
    let result = allNewGigs.filter((gig) => {
      if (gig.isPending) return false;

      const matchesSearch =
        !searchQuery ||
        gig.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gig.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gig.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gig.tags?.some((tag: any) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      let matchesFilters = true;

      if (Object.keys(filters).length > 0) {
        if (filters.category && filters.category !== "all") {
          matchesFilters = gig.category === filters.category;
          if (!matchesFilters) return false;
        }

        if (filters.location && filters.location !== "all") {
          matchesFilters = gig.location === filters.location;
          if (!matchesFilters) return false;
        }

        if (
          filters.talentTypes &&
          Array.isArray(filters.talentTypes) &&
          filters.talentTypes.length > 0
        ) {
          matchesFilters = filters.talentTypes.includes(gig.bussinesscat);
          if (!matchesFilters) return false;
        }

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

        if (filters.negotiable === true) {
          matchesFilters = gig.negotiable === true;
          if (!matchesFilters) return false;
        }

        if (filters.gigType && filters.gigType !== "all") {
          const gigCategory = gig.category?.toLowerCase() || "";
          matchesFilters = gigCategory.includes(filters.gigType.toLowerCase());
          if (!matchesFilters) return false;
        }

        if (filters.showOnlyActive !== false) {
          matchesFilters = gig.isActive === true;
          if (!matchesFilters) return false;
        }
      }

      return matchesSearch && matchesFilters;
    });

    // Apply tab filter
    if (activeTab !== "all") {
      result = result.filter((gig) => {
        const userStatus = getUserStatusForGig(gig);

        switch (activeTab) {
          case "available":
            return !gig.isTaken && !gig.isPending;
          case "interested":
            return userStatus.hasShownInterest && !userStatus.isBooked;
          case "applied":
            return userStatus.isInApplicants && !userStatus.isBooked;
          case "booked":
            return userStatus.isBooked;
          default:
            return true;
        }
      });
    }
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
    handleSortChange("newest");
    toast.info("Cleared all filters and search");
  };

  const handleOpenGigDescription = (gig: any) => {
    setSelectedGig(gig);
    setShowGigDescription(true);
  };

  const handleCloseGigDescription = () => {
    setShowGigDescription(false);
    setSelectedGig(null);
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

  const handleShowGigDetails = (gig: ChildData) => {
    setSelectedModalGig(gig);
    setShowGigModal(true);
  };
  // After getStatusConfig and before renderGridView
  const getPriceDisplay = (gig: any): { text: string; color: string } => {
    if (gig.price === undefined || gig.price === null) {
      return {
        text: "Price TBD",
        color: isDarkMode ? "text-gray-400" : "text-gray-500",
      };
    }
    if (gig.price === 0) {
      return {
        text: "Free",
        color: "text-emerald-600 dark:text-emerald-400",
      };
    }
    return {
      text: `$${gig.price.toLocaleString()}`,
      color: "text-emerald-600 dark:text-emerald-400",
    };
  }; // Add this after getPriceDisplay and before renderGridView
  const getStatusConfig = (gig: any) => {
    const userStatus = getUserStatusForGig(gig);

    if (userStatus.isBooked) {
      return {
        label: "Booked",
        color: isDarkMode
          ? "bg-green-900/50 text-green-300 border-green-800"
          : "bg-green-100 text-green-700 border-green-200",
      };
    }
    if (userStatus.isPending) {
      return {
        label: "Pending",
        color: isDarkMode
          ? "bg-yellow-900/50 text-yellow-300 border-yellow-800"
          : "bg-yellow-100 text-yellow-700 border-yellow-200",
      };
    }
    if (userStatus.isInApplicants) {
      return {
        label: "Applied",
        color: isDarkMode
          ? "bg-blue-900/50 text-blue-300 border-blue-800"
          : "bg-blue-100 text-blue-700 border-blue-200",
      };
    }
    if (userStatus.hasShownInterest) {
      return {
        label: "Interested",
        color: isDarkMode
          ? "bg-purple-900/50 text-purple-300 border-purple-800"
          : "bg-purple-100 text-purple-700 border-purple-200",
      };
    }
    if (userStatus.isGigPoster) {
      return {
        label: "Your Gig",
        color: isDarkMode
          ? "bg-orange-900/50 text-orange-300 border-orange-800"
          : "bg-orange-100 text-orange-700 border-orange-200",
      };
    }
    return {
      label: "Available",
      color: isDarkMode
        ? "bg-gray-800 text-gray-300 border-gray-700"
        : "bg-gray-100 text-gray-700 border-gray-200",
    };
  }; // Add this after getStatusConfig and before renderGridView
  const getGigIcon = (gig: any) => {
    const iconClass = "w-5 h-5";

    if (gig.isClientBand) {
      if (gig.bandCategory?.length > 0) {
        return <Users className={cn(iconClass, "text-purple-500")} />;
      }
      return <Users2 className={cn(iconClass, "text-blue-500")} />;
    }

    switch (gig.bussinesscat?.toLowerCase()) {
      case "mc":
        return <Mic className={cn(iconClass, "text-red-500")} />;
      case "dj":
        return <Volume2 className={cn(iconClass, "text-pink-500")} />;
      case "vocalist":
        return <Music className={cn(iconClass, "text-green-500")} />;
      case "full":
        return <Users className={cn(iconClass, "text-orange-500")} />;
      case "band":
        return <Users2 className={cn(iconClass, "text-indigo-500")} />;
      default:
        return <Briefcase className={cn(iconClass, "text-gray-500")} />;
    }
  }; // Add this after getGigIcon and before renderGridView
  const formatDate = (date: number) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Then replace your renderGridView function with:
  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
      <AnimatePresence mode="popLayout">
        {filteredGigs.map((gig: any, index: number) => (
          <motion.div
            key={gig._id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              duration: 0.3,
              delay: index * 0.05,
            }}
            className="h-full"
          >
            <GigCard
              gig={gig}
              showActions={true}
              compact={false}
              getGigFromChild={(selectedGig) => {
                // Handle the chevron click - show details modal
                handleShowGigDetails(selectedGig);
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  // Also update the renderListView if you want consistency:
  const renderListView = () => (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {filteredGigs.map((gig, index) => (
          <motion.div
            key={gig._id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{
              duration: 0.3,
              delay: index * 0.05,
            }}
          >
            <GigCard
              gig={gig}
              showActions={true}
              compact={true} // Use compact mode for list view
              getGigFromChild={(selectedGig) => {
                handleShowGigDetails(selectedGig);
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  const renderTimelineView = () => (
    <div className="space-y-6">
      <AnimatePresence mode="popLayout">
        {filteredGigs.map((gig, index) => {
          const userStatus = getUserStatusForGig(gig);

          return (
            <motion.div
              key={gig._id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                layout: { duration: 0.2 },
              }}
              className="relative"
            >
              {index < filteredGigs.length - 1 && (
                <div
                  className={cn(
                    "absolute left-5 top-12 bottom-0 w-0.5",
                    isDarkMode ? "bg-gray-800" : "bg-gray-200",
                  )}
                />
              )}

              <Card
                className={cn(
                  "cursor-pointer hover:shadow-md transition-all",
                  isDarkMode
                    ? "bg-gray-900/50 border-gray-800"
                    : "bg-white border-gray-200",
                )}
                onClick={() => handleOpenGigDescription(gig)}
              >
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="relative">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center border-2",
                          isDarkMode
                            ? "bg-gray-800 border-gray-700"
                            : "bg-gray-100 border-gray-200",
                        )}
                      >
                        {getStatusIcon(userStatus)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3
                            className={cn(
                              "text-lg font-semibold",
                              isDarkMode ? "text-white" : "text-gray-900",
                            )}
                          >
                            {gig.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge
                              className={cn(
                                userStatus.isBooked &&
                                  "bg-green-100 text-green-700",
                                userStatus.isPending &&
                                  "bg-yellow-100 text-yellow-700",
                                userStatus.hasShownInterest &&
                                  "bg-blue-100 text-blue-700",
                              )}
                            >
                              {userStatus.isBooked && "Booked"}
                              {userStatus.isPending && "Pending"}
                              {userStatus.hasShownInterest && "Interested"}
                              {!userStatus.isBooked &&
                                !userStatus.isPending &&
                                !userStatus.hasShownInterest &&
                                "Available"}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(gig.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {gig?.price && gig?.price > 0 && (
                          <div className="text-lg font-bold text-emerald-600">
                            ${gig.price}
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {gig.location && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span
                              className={
                                isDarkMode ? "text-gray-300" : "text-gray-600"
                              }
                            >
                              {gig.location}
                            </span>
                          </div>
                        )}
                        {gig.bussinesscat && (
                          <div className="flex items-center gap-2 text-sm">
                            <Briefcase className="w-4 h-4 text-gray-400" />
                            <span
                              className={
                                isDarkMode ? "text-gray-300" : "text-gray-600"
                              }
                            >
                              {gig.bussinesscat}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );

  const renderCalendarView = () => {
    const groupedByDate = filteredGigs.reduce((acc: any, gig: any) => {
      const dateKey = new Date(gig.date).toDateString();
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(gig);
      return acc;
    }, {});

    return (
      <div className="space-y-4">
        {Object.entries(groupedByDate).map(([date, gigs]: [string, any]) => (
          <Card
            key={date}
            className={cn(
              "overflow-hidden",
              isDarkMode
                ? "bg-gray-900/50 border-gray-800"
                : "bg-white border-gray-200",
            )}
          >
            <CardHeader
              className={cn(
                "py-3 px-4",
                isDarkMode ? "bg-gray-800/50" : "bg-gray-50",
              )}
            >
              <CardTitle className="text-sm font-medium">
                {new Date(date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {gigs.map((gig: any) => {
                  const userStatus = getUserStatusForGig(gig);
                  return (
                    <div
                      key={gig._id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => handleOpenGigDescription(gig)}
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          className={cn(
                            userStatus.isBooked &&
                              "bg-green-100 text-green-700",
                            userStatus.isPending &&
                              "bg-yellow-100 text-yellow-700",
                            userStatus.hasShownInterest &&
                              "bg-blue-100 text-blue-700",
                          )}
                        >
                          {userStatus.isBooked
                            ? "Booked"
                            : userStatus.isPending
                              ? "Pending"
                              : userStatus.hasShownInterest
                                ? "Interested"
                                : "Available"}
                        </Badge>
                        <span
                          className={cn(
                            "font-medium",
                            isDarkMode ? "text-white" : "text-gray-900",
                          )}
                        >
                          {gig.title}
                        </span>
                      </div>
                      {gig.time?.start && (
                        <span className="text-sm text-gray-500">
                          {gig.time.start}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderKanbanView = () => {
    const columns = [
      {
        id: "available",
        title: "Available",
        icon: Sparkles,
        filter: (g: any) => !g.isTaken && !g.isPending,
      },
      {
        id: "interested",
        title: "Interested",
        icon: Heart,
        filter: (g: any) => {
          const status = getUserStatusForGig(g);
          return status.hasShownInterest && !status.isBooked;
        },
      },
      {
        id: "applied",
        title: "Applied",
        icon: Send,
        filter: (g: any) => {
          const status = getUserStatusForGig(g);
          return status.isInApplicants && !status.isBooked;
        },
      },
      {
        id: "booked",
        title: "Booked",
        icon: CheckCircle,
        filter: (g: any) => {
          const status = getUserStatusForGig(g);
          return status.isBooked;
        },
      },
    ];

    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80">
            <Card
              className={cn(
                "h-full",
                isDarkMode
                  ? "bg-gray-900/50 border-gray-800"
                  : "bg-white border-gray-200",
              )}
            >
              <CardHeader
                className={cn(
                  "py-3 px-4 border-b",
                  isDarkMode ? "border-gray-800" : "border-gray-200",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <column.icon className="w-4 h-4" />
                    <CardTitle className="text-sm font-medium">
                      {column.title}
                    </CardTitle>
                  </div>
                  <Badge variant="outline">
                    {filteredGigs.filter(column.filter).length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
                {filteredGigs.filter(column.filter).map((gig: any) => (
                  <div
                    key={gig._id}
                    className="cursor-pointer"
                    onClick={() => handleOpenGigDescription(gig)}
                  >
                    <Card
                      className={cn(
                        "p-3 hover:shadow-md transition-all",
                        isDarkMode
                          ? "bg-gray-800/50 border-gray-700"
                          : "bg-white border-gray-200",
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "font-medium text-sm line-clamp-1",
                              isDarkMode ? "text-white" : "text-gray-900",
                            )}
                          >
                            {gig.title}
                          </p>
                          <p className="text-xs mt-1 text-gray-500">
                            {gig.location?.split(",")[0] || "TBD"}
                          </p>
                          {gig.price > 0 && (
                            <p className="text-xs font-medium text-emerald-600 mt-1">
                              ${gig.price}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  };

  const renderGigs = () => {
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

  // Show loading skeleton if data isn't ready
  if (!isDataReady) {
    return (
      <div className="space-y-6 p-4">
        {/* Header Skeleton */}
        <div className="rounded-2xl border p-6 space-y-4">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-4 w-96 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"
              />
            ))}
          </div>

          {/* Tabs Skeleton */}
          <div className="mb-2">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-2 animate-pulse" />
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />

          {/* Filter Bar */}
          <div className="flex gap-3">
            <div className="h-9 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-9 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          </div>
        </div>

        {/* View Controls Skeleton */}
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-10 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          </div>
          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="relative min-h-screen">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div
            className={cn(
              "absolute top-0 left-0 right-0 h-96 bg-gradient-to-b",
              isDarkMode
                ? "from-orange-500/5 via-transparent to-transparent"
                : "from-orange-500/10 via-transparent to-transparent",
            )}
          />
        </div>

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

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
          {/* Header Section - Collapsible */}
          {!showHeader ? (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "relative overflow-hidden rounded-2xl p-4 sm:p-6 md:p-8 border mb-6",
                isDarkMode
                  ? "bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border-slate-700/50 backdrop-blur-xl"
                  : "bg-gradient-to-br from-white/90 via-orange-50/50 to-white/90 border-slate-200/50 backdrop-blur-xl shadow-lg",
              )}
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full blur-3xl translate-y-32 -translate-x-32" />

              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="space-y-2">
                    <h1
                      className={cn(
                        "text-xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent",
                        "bg-gradient-to-r from-orange-500 via-red-500 to-pink-500",
                      )}
                    >
                      Discover Amazing Gigs
                    </h1>
                    <p
                      className={cn(
                        "text-sm md:text-base max-w-2xl",
                        isDarkMode ? "text-slate-400" : "text-slate-600",
                      )}
                    >
                      Find the perfect gig opportunity or talent for your next
                      event.
                      {filteredGigs.length > 0 && (
                        <span className="font-semibold text-orange-500">
                          {" "}
                          {filteredGigs.length} amazing opportunities available
                          now!
                        </span>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHeader(true)}
                    className={cn(
                      "self-start sm:self-center gap-2 rounded-full border-2",
                      isDarkMode
                        ? "border-slate-700 text-slate-300 hover:bg-slate-800/50 hover:border-slate-600"
                        : "border-slate-300 text-slate-700 hover:bg-slate-100/50 hover:border-slate-400",
                    )}
                  >
                    <ChevronUp className="w-4 h-4" />
                    Collapse Header
                  </Button>
                </div>

                {/* Stats Cards - Horizontal Scroll on Mobile */}
                <div className="relative mb-6">
                  {/* Desktop Grid */}
                  <div className="hidden md:grid grid-cols-4 gap-4">
                    {[
                      {
                        label: "Available",
                        value: stats.available,
                        icon: Sparkles,
                        gradient: "from-emerald-500 to-teal-500",
                        bg: isDarkMode ? "bg-slate-800/50" : "bg-white",
                      },
                      {
                        label: "Booked",
                        value: stats.booked,
                        icon: Calendar,
                        gradient: "from-blue-500 to-indigo-500",
                        bg: isDarkMode ? "bg-slate-800/50" : "bg-white",
                      },
                      {
                        label: "Avg. Price",
                        value: `$${stats.avgPrice}`,
                        icon: DollarSign,
                        gradient: "from-amber-500 to-orange-500",
                        bg: isDarkMode ? "bg-slate-800/50" : "bg-white",
                      },
                      {
                        label: "Locations",
                        value: locations.length,
                        icon: MapPin,
                        gradient: "from-purple-500 to-pink-500",
                        bg: isDarkMode ? "bg-slate-800/50" : "bg-white",
                      },
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -2 }}
                      >
                        <Card
                          className={cn(
                            "border shadow-sm hover:shadow-md transition-all duration-300",
                            isDarkMode
                              ? "bg-slate-900/80 border-slate-700/50"
                              : "bg-white/80 border-slate-200/50",
                          )}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <p
                                  className={cn(
                                    "text-xs font-medium uppercase tracking-wider mb-1",
                                    isDarkMode
                                      ? "text-slate-400"
                                      : "text-slate-500",
                                  )}
                                >
                                  {item.label}
                                </p>
                                <p
                                  className={cn(
                                    "text-xl font-bold",
                                    isDarkMode
                                      ? "text-white"
                                      : "text-slate-900",
                                  )}
                                >
                                  {item.value}
                                </p>
                              </div>
                              <div
                                className={cn(
                                  "p-2.5 rounded-xl bg-gradient-to-br",
                                  item.gradient,
                                  "shadow-lg",
                                )}
                              >
                                <item.icon className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Mobile Horizontal Scroll */}
                  <div className="md:hidden -mx-3 px-3 overflow-x-auto scrollbar-hide">
                    <div className="flex gap-3 pb-2 min-w-min">
                      {[
                        {
                          label: "Available",
                          value: stats.available,
                          icon: Sparkles,
                          gradient: "from-emerald-500 to-teal-500",
                        },
                        {
                          label: "Booked",
                          value: stats.booked,
                          icon: Calendar,
                          gradient: "from-blue-500 to-indigo-500",
                        },
                        {
                          label: "Avg. Price",
                          value: `$${stats.avgPrice}`,
                          icon: DollarSign,
                          gradient: "from-amber-500 to-orange-500",
                        },
                        {
                          label: "Locations",
                          value: locations.length,
                          icon: MapPin,
                          gradient: "from-purple-500 to-pink-500",
                        },
                      ].map((item, index) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex-shrink-0 w-36"
                        >
                          <Card
                            className={cn(
                              "border shadow-sm",
                              isDarkMode
                                ? "bg-slate-900/80 border-slate-700/50"
                                : "bg-white/80 border-slate-200/50",
                            )}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <p
                                  className={cn(
                                    "text-[10px] font-medium uppercase tracking-wider",
                                    isDarkMode
                                      ? "text-slate-400"
                                      : "text-slate-500",
                                  )}
                                >
                                  {item.label}
                                </p>
                                <div
                                  className={cn(
                                    "p-1.5 rounded-lg bg-gradient-to-br",
                                    item.gradient,
                                  )}
                                >
                                  <item.icon className="w-3 h-3 text-white" />
                                </div>
                              </div>
                              <p
                                className={cn(
                                  "text-lg font-bold",
                                  isDarkMode ? "text-white" : "text-slate-900",
                                )}
                              >
                                {item.value}
                              </p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Category Tabs */}
                <div className="mb-4">
                  <span
                    className={cn(
                      "text-xs font-medium uppercase tracking-wider mb-2 block",
                      isDarkMode ? "text-slate-400" : "text-slate-500",
                    )}
                  >
                    Filter by status
                  </span>
                  <Tabs value={activeTab} onValueChange={handleTabChange}>
                    <TabsList
                      className={cn(
                        "inline-flex h-auto p-1 rounded-xl",
                        isDarkMode
                          ? "bg-slate-800/50 border border-slate-700/50"
                          : "bg-white/50 border border-slate-200/50 backdrop-blur-sm",
                      )}
                    >
                      {[
                        { value: "all", label: "All Gigs", icon: Music },
                        {
                          value: "available",
                          label: "Available",
                          icon: Sparkles,
                        },
                        {
                          value: "interested",
                          label: "Interested",
                          icon: Heart,
                        },
                        { value: "applied", label: "Applied", icon: Send },
                      ].map((tab) => (
                        <TabsTrigger
                          key={tab.value}
                          value={tab.value}
                          className={cn(
                            "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                            "data-[state=active]:shadow-md",
                            isDarkMode
                              ? "data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-amber-600 data-[state=active]:text-white"
                              : "data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <tab.icon className="w-4 h-4" />
                            <span className="hidden sm:inline">
                              {tab.label}
                            </span>
                          </div>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>

                {/* Search and Filters */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search
                      className={cn(
                        "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4",
                        isDarkMode ? "text-slate-500" : "text-slate-400",
                      )}
                    />
                    <Input
                      placeholder="Search gigs by title, description, location, or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={cn(
                        "pl-9 pr-10 h-11 rounded-xl border-2 transition-all",
                        "focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500",
                        isDarkMode
                          ? "bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                          : "bg-white/50 border-slate-200 text-slate-900 placeholder:text-slate-400",
                      )}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className={cn(
                          "absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full",
                          isDarkMode
                            ? "hover:bg-slate-800"
                            : "hover:bg-slate-100",
                        )}
                      >
                        <X className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    )}
                  </div>

                  {/* Filter Chips */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      onClick={() => setShowFiltersPanel(true)}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "gap-2 rounded-full border-2",
                        isDarkMode
                          ? "border-slate-700 text-slate-300 hover:bg-slate-800/50"
                          : "border-slate-200 text-slate-700 hover:bg-slate-100/50",
                        activeFiltersCount > 0 && "border-orange-500",
                      )}
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      <span>Filters</span>
                      {activeFiltersCount > 0 && (
                        <Badge className="ml-1 px-1.5 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>

                    <Select value={sortBy} onValueChange={handleSortChange}>
                      <SelectTrigger
                        className={cn(
                          "w-[140px] h-9 rounded-full border-2",
                          isDarkMode
                            ? "border-slate-700 bg-slate-900/50 text-slate-200"
                            : "border-slate-200 bg-white/50 text-slate-700",
                        )}
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
                      className={cn(
                        "h-9 w-9 rounded-full p-0",
                        isDarkMode
                          ? "text-slate-400 hover:text-white hover:bg-slate-800"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
                      )}
                    >
                      <RefreshCw
                        className={cn(
                          "w-4 h-4",
                          isRefreshing && "animate-spin",
                        )}
                      />
                    </Button>

                    {(searchQuery || activeFiltersCount > 0) && (
                      <Button
                        onClick={handleClearAll}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 px-3 rounded-full text-xs gap-1",
                          isDarkMode
                            ? "text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
                            : "text-rose-600 hover:text-rose-700 hover:bg-rose-50",
                        )}
                      >
                        <X className="w-3 h-3" />
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex justify-end mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHeader(false)}
                className={cn(
                  "gap-2 rounded-full",
                  isDarkMode
                    ? "text-slate-400 hover:text-white hover:bg-slate-800"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
                )}
              >
                <ChevronDown className="w-4 h-4" />
                Show Header
              </Button>
            </div>
          )}

          {/* Active Filters Display */}
          {(searchQuery || activeFiltersCount > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "mb-6 p-4 rounded-xl border backdrop-blur-sm",
                isDarkMode
                  ? "bg-slate-900/50 border-slate-700/50"
                  : "bg-white/50 border-slate-200/50",
              )}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "p-1.5 rounded-lg",
                      isDarkMode ? "bg-blue-900/30" : "bg-blue-100",
                    )}
                  >
                    <Filter
                      className={cn(
                        "w-4 h-4",
                        isDarkMode ? "text-blue-400" : "text-blue-600",
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isDarkMode ? "text-white" : "text-slate-900",
                    )}
                  >
                    Active Filters
                  </span>
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                    {searchQuery ? activeFiltersCount + 1 : activeFiltersCount}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className={cn(
                    "h-7 px-2 rounded-full text-xs gap-1",
                    isDarkMode
                      ? "text-slate-400 hover:text-white hover:bg-slate-800"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
                  )}
                >
                  <X className="w-3 h-3" />
                  Clear all
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge
                    className={cn(
                      "gap-1.5 px-3 py-1.5 rounded-full text-xs font-normal",
                      isDarkMode
                        ? "bg-slate-800 text-slate-300 border border-slate-700"
                        : "bg-white text-slate-700 border border-slate-200",
                    )}
                  >
                    <Search className="w-3 h-3 mr-1" />"{searchQuery}"
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer hover:text-rose-500"
                      onClick={() => setSearchQuery("")}
                    />
                  </Badge>
                )}

                {filters.talentTypes?.length > 0 && (
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
                    {filters.priceRange}
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-sm font-medium hidden sm:block",
                    isDarkMode ? "text-slate-400" : "text-slate-500",
                  )}
                >
                  View:
                </span>

                {/* View Mode Toggle */}
                <div
                  className={cn(
                    "flex p-1 rounded-lg",
                    isDarkMode ? "bg-slate-800/50" : "bg-slate-100",
                  )}
                >
                  <Tabs
                    value={viewMode}
                    onValueChange={(v) => handleViewModeChange(v as ViewMode)}
                  >
                    <TabsList className="grid grid-cols-2 gap-1 bg-transparent">
                      <TabsTrigger
                        value="grid"
                        className={cn(
                          "px-3 py-1.5 rounded-md text-sm transition-all",
                          viewMode === "grid"
                            ? isDarkMode
                              ? "bg-orange-600 text-white shadow-lg"
                              : "bg-orange-500 text-white shadow-md"
                            : isDarkMode
                              ? "text-slate-400 hover:text-white hover:bg-slate-700"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200",
                        )}
                      >
                        <Grid3x3 className="w-4 h-4" />
                      </TabsTrigger>
                      <TabsTrigger
                        value="list"
                        className={cn(
                          "px-3 py-1.5 rounded-md text-sm transition-all",
                          viewMode === "list"
                            ? isDarkMode
                              ? "bg-orange-600 text-white shadow-lg"
                              : "bg-orange-500 text-white shadow-md"
                            : isDarkMode
                              ? "text-slate-400 hover:text-white hover:bg-slate-700"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200",
                        )}
                      >
                        <List className="w-4 h-4" />
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Display Mode Toggle */}
                <div
                  className={cn(
                    "flex gap-1 p-1 rounded-lg ml-2",
                    isDarkMode ? "bg-slate-800/50" : "bg-slate-100",
                  )}
                >
                  {[
                    { mode: "grid", icon: Grid3x3, label: "Grid" },
                    { mode: "list", icon: List, label: "List" },
                    { mode: "timeline", icon: Activity, label: "Timeline" },
                    { mode: "calendar", icon: CalendarDays, label: "Calendar" },
                    { mode: "kanban", icon: Kanban, label: "Kanban" },
                  ].map(({ mode, icon: Icon, label }) => (
                    <Tooltip key={mode}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleDisplayModeChange(mode as any)}
                          className={cn(
                            "h-8 w-8 rounded-md transition-all flex items-center justify-center",
                            displayMode === mode
                              ? isDarkMode
                                ? "bg-blue-600 text-white shadow-lg"
                                : "bg-blue-500 text-white shadow-md"
                              : isDarkMode
                                ? "text-slate-400 hover:text-white hover:bg-slate-700"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-200",
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        {label} View
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>

              <div
                className={cn(
                  "text-sm px-3 py-1.5 rounded-full",
                  isDarkMode
                    ? "bg-slate-800/50 text-slate-300"
                    : "bg-slate-100 text-slate-600",
                )}
              >
                <span className="font-semibold text-orange-500">
                  {filteredGigs.length}
                </span>
                <span className="mx-1">of</span>
                <span className="font-semibold">{combinedGigs.length}</span>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`gigs-${displayMode}-${sortBy}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {filteredGigs.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 px-4 text-center"
                >
                  <div className="relative mb-6">
                    <div
                      className={cn(
                        "w-24 h-24 rounded-full flex items-center justify-center",
                        isDarkMode ? "bg-slate-800" : "bg-slate-100",
                      )}
                    >
                      <Music
                        className={cn(
                          "w-12 h-12",
                          isDarkMode ? "text-slate-600" : "text-slate-400",
                        )}
                      />
                    </div>
                    <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                      <X className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <h3
                    className={cn(
                      "text-xl font-bold mb-2",
                      isDarkMode ? "text-white" : "text-slate-900",
                    )}
                  >
                    No gigs found
                  </h3>
                  <p
                    className={cn(
                      "text-sm max-w-md mb-6",
                      isDarkMode ? "text-slate-400" : "text-slate-500",
                    )}
                  >
                    {allNewGigs.length === 0
                      ? "Be the first to post a gig and start connecting with amazing talent!"
                      : "Try adjusting your search or filters to find what you're looking for."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {(searchQuery || activeFiltersCount > 0) && (
                      <Button
                        onClick={handleClearAll}
                        className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white"
                      >
                        <X className="w-4 h-4" />
                        Clear Filters
                      </Button>
                    )}
                    {allNewGigs.length === 0 && (
                      <Button
                        onClick={() => router.push("/hub/gigs?tab=invites")}
                        className="gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                      >
                        <Zap className="w-4 h-4" />
                        Create First Gig
                      </Button>
                    )}
                  </div>
                </motion.div>
              ) : (
                renderGigs()
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AllGigs;
