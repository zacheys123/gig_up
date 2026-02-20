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
  CalendarDays,
  Activity,
  Briefcase,
  Send,
  Users2,
  Mic,
  Volume2,
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

  // In your component, combine all loading states
  const { allGigs: gigs, isLoading: gigsLoading } = useAllGigs({ limit: 100 });
  const { gigs: userGigs, isLoading: userGigsLoading } = useGigs(user?._id);
  const userPreferences = useQuery(
    api.controllers.userPrefferences.getUserPreferences,
    user?._id ? { userId: user._id } : "skip",
  );

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
  const bookGigMutation = useMutation(api.controllers.gigs.showInterestInGig);

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
  // Render functions for different display modes
  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
      <AnimatePresence mode="popLayout">
        {filteredGigs.map((gig: any, index: number) => {
          const statusConfig = getStatusConfig(gig);
          const priceDisplay = getPriceDisplay(gig);

          return (
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
              whileHover={{ y: -4 }}
              className="h-full"
            >
              <Card
                className={cn(
                  "cursor-pointer hover:shadow-md transition-all h-full",
                  isDarkMode
                    ? "bg-gray-900/50 border-gray-800"
                    : "bg-white border-gray-200",
                )}
                onClick={() =>
                  router.push(`/hub/gigs/musician/${gig._id}/gig-info`)
                }
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    {/* Icon - slightly smaller on mobile */}
                    <div
                      className={cn(
                        "p-1.5 sm:p-2 rounded-lg flex-shrink-0",
                        isDarkMode ? "bg-gray-800" : "bg-gray-100",
                      )}
                    >
                      {getGigIcon(gig)}
                    </div>

                    {/* Content - with proper spacing */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className={cn(
                          "font-semibold text-sm sm:text-base truncate",
                          isDarkMode ? "text-white" : "text-gray-900",
                        )}
                      >
                        {gig.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-0.5",
                            statusConfig.color,
                          )}
                        >
                          {statusConfig.label}
                        </Badge>

                        <span
                          className={cn(
                            "text-[10px] sm:text-xs",
                            isDarkMode ? "text-gray-400" : "text-gray-500",
                          )}
                        >
                          {formatDate(gig.date)}
                        </span>
                      </div>

                      {/* Price - only show on mobile if not 0 */}
                      {!gig.isHistorical && gig.price > 0 && (
                        <div className="mt-2 sm:hidden">
                          <span
                            className={cn(
                              "text-xs font-semibold",
                              priceDisplay.color,
                            )}
                          >
                            {priceDisplay.text}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Price - desktop only */}
                    {!gig.isHistorical && gig.price > 0 && (
                      <span
                        className={cn(
                          "hidden sm:inline-block font-semibold text-sm",
                          priceDisplay.color,
                        )}
                      >
                        {priceDisplay.text}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
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
            >
              <Card
                className={cn(
                  "cursor-pointer hover:shadow-md transition-all",
                  isDarkMode
                    ? "bg-gray-900/50 border-gray-800"
                    : "bg-white border-gray-200",
                )}
                onClick={() => handleOpenGigDescription(gig)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "p-3 rounded-xl",
                        isDarkMode ? "bg-gray-800" : "bg-gray-100",
                      )}
                    >
                      {getStatusIcon(userStatus)}
                    </div>
                    <div className="flex-1">
                      <h3
                        className={cn(
                          "font-semibold",
                          isDarkMode ? "text-white" : "text-gray-900",
                        )}
                      >
                        {gig.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm mt-1">
                        <span className="flex items-center gap-1 text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(gig.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {gig.location?.split(",")[0] || "TBD"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={cn(
                          userStatus.isBooked && "bg-green-100 text-green-700",
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
                      {gig?.price && gig?.price > 0 && (
                        <span className="font-semibold text-emerald-600">
                          ${gig.price}
                        </span>
                      )}
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

  // Show loading skeleton immediately - no blank space
  if (isInitialLoading) {
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

          {/* Search Bar */}
          <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />

          {/* Filter Bar */}
          <div className="flex gap-3">
            <div className="h-9 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-9 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          </div>
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

        {/* Header Section */}
        {!showHeader && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "relative overflow-hidden rounded-2xl p-6 md:p-8 border",
              isDarkMode
                ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black border-gray-700"
                : "bg-gradient-to-br from-orange-50 via-white to-gray-100 border-gray-200",
            )}
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
                  },
                  { label: "Booked", value: stats.booked, icon: Calendar },
                  {
                    label: "Avg. Price",
                    value: `$${stats.avgPrice}`,
                    icon: DollarSign,
                  },
                  { label: "Locations", value: locations.length, icon: MapPin },
                ].map((item) => (
                  <Card
                    key={item.label}
                    className={cn(
                      "backdrop-blur-sm",
                      isDarkMode
                        ? "bg-gray-800/80 border-gray-700"
                        : "bg-white/80 border-gray-200",
                    )}
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
                        <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20">
                          <item.icon className="w-5 h-5 text-orange-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {/* Category Tabs - Add this after Stats Cards */}
              <div className="mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filter by status
                </span>
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                  <TabsList
                    className={cn(
                      "grid grid-cols-5 p-1 rounded-xl w-full max-w-2xl mx-auto",
                      isDarkMode
                        ? "bg-gray-800/50 border border-gray-700"
                        : "bg-gray-100 border border-gray-200",
                    )}
                  >
                    {[
                      { value: "all", label: "All Gigs", icon: Music },
                      {
                        value: "available",
                        label: "Available",
                        icon: Sparkles,
                      },
                      { value: "interested", label: "Interested", icon: Heart },
                      { value: "applied", label: "Applied", icon: Send },
                      { value: "booked", label: "Booked", icon: CheckCircle },
                    ].map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className={cn(
                          "relative overflow-hidden transition-all duration-200",
                          "data-[state=active]:shadow-lg",
                          isDarkMode
                            ? "data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-amber-600 data-[state=active]:text-white"
                            : "data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white",
                        )}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <tab.icon className="w-4 h-4" />
                          <span className="hidden sm:inline">{tab.label}</span>
                        </div>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
              {/* Search Bar */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search gigs by title, description, location, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      "pl-12 pr-12 h-12 rounded-xl text-lg backdrop-blur-sm",
                      isDarkMode
                        ? "border-gray-600 bg-gray-800/90 text-white"
                        : "border-gray-300 bg-white/90 text-gray-900",
                    )}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className={cn(
                        "absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full",
                        isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100",
                      )}
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                </div>

                {/* Quick Filter Bar */}
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={() => setShowFiltersPanel(true)}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "gap-2",
                      isDarkMode
                        ? "border-gray-700 hover:bg-gray-800 text-gray-300"
                        : "border-gray-300 hover:bg-gray-50 text-gray-700",
                    )}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Filters</span>
                    {activeFiltersCount > 0 && (
                      <Badge className="ml-1 px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>

                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger
                      className={cn(
                        "w-[180px]",
                        isDarkMode
                          ? "border-gray-700 bg-gray-800 text-white"
                          : "border-gray-300 bg-white text-gray-900",
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
                      "gap-2",
                      isDarkMode
                        ? "text-gray-300 hover:bg-gray-800"
                        : "text-gray-700 hover:bg-gray-100",
                    )}
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
                      className={cn(
                        "gap-2",
                        isDarkMode
                          ? "text-red-400 hover:text-red-300 hover:bg-gray-800"
                          : "text-red-500 hover:text-red-600 hover:bg-gray-100",
                      )}
                    >
                      <X className="w-4 h-4" />
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

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
              <span className={cn("text-sm", colors.textMuted)}>View:</span>

              {/* View Mode Tabs (Grid/List) */}
              <Tabs
                value={viewMode}
                onValueChange={(v) => handleViewModeChange(v as ViewMode)}
                className="w-auto"
              >
                <TabsList className={cn("p-1", colors.backgroundMuted)}>
                  <TabsTrigger
                    value="grid"
                    className={cn(
                      "px-4 py-2 rounded-lg transition-all",
                      viewMode === "grid"
                        ? cn(colors.background, colors.text)
                        : colors.textMuted,
                    )}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="list"
                    className={cn(
                      "px-4 py-2 rounded-lg transition-all",
                      viewMode === "list"
                        ? cn(colors.background, colors.text)
                        : colors.textMuted,
                    )}
                  >
                    <List className="w-4 h-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Display Mode Toggle (All Views) */}
              <div
                className={cn(
                  "flex gap-1 p-1 rounded-lg ml-2",
                  colors.backgroundMuted,
                )}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDisplayModeChange("grid")}
                      className={cn(
                        "h-8 w-8 p-0",
                        displayMode === "grid"
                          ? cn("bg-blue-500 text-white hover:bg-blue-600")
                          : colors.textMuted,
                      )}
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Grid View</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDisplayModeChange("list")}
                      className={cn(
                        "h-8 w-8 p-0",
                        displayMode === "list"
                          ? cn("bg-blue-500 text-white hover:bg-blue-600")
                          : colors.textMuted,
                      )}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>List View</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDisplayModeChange("timeline")}
                      className={cn(
                        "h-8 w-8 p-0",
                        displayMode === "timeline"
                          ? cn("bg-blue-500 text-white hover:bg-blue-600")
                          : colors.textMuted,
                      )}
                    >
                      <Activity className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Timeline View</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDisplayModeChange("calendar")}
                      className={cn(
                        "h-8 w-8 p-0",
                        displayMode === "calendar"
                          ? cn("bg-blue-500 text-white hover:bg-blue-600")
                          : colors.textMuted,
                      )}
                    >
                      <CalendarDays className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Calendar View</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDisplayModeChange("kanban")}
                      className={cn(
                        "h-8 w-8 p-0",
                        displayMode === "kanban"
                          ? cn("bg-blue-500 text-white hover:bg-blue-600")
                          : colors.textMuted,
                      )}
                    >
                      <Kanban className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Kanban View</TooltipContent>
                </Tooltip>
              </div>
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
                {combinedGigs.length}
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
                Show Header
              </Button>
            )}
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
                    No Gigs Yet - Check your Notifications
                  </Button>
                )}
              </motion.div>
            ) : (
              renderGigs()
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

export default AllGigs;
