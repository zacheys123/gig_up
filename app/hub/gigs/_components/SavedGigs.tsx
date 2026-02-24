"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Bookmark,
  MapPin,
  Calendar,
  Users,
  BookmarkMinus,
  ExternalLink,
  Clock,
  Search,
  AlertCircle,
  Grid3x3,
  List,
  DollarSign,
  Briefcase,
  Music,
  Filter,
  X,
  ChevronRight,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useThemeColors } from "@/hooks/useTheme";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getGigDateStatus } from "../helper/getGigDateStatus";

// Types
type DisplayMode = "grid" | "list";
type StatusFilter = "all" | "available" | "booked";
type DateFilter = "all" | "upcoming" | "past" | "today";

// Helper functions
const getStatusConfig = (gig: any, isDarkMode: boolean) => {
  const isAvailable = gig.isActive && !gig.isTaken;

  if (isAvailable) {
    return {
      label: "Available",
      color: isDarkMode
        ? "bg-green-900/30 text-green-400 border-green-800"
        : "bg-green-100 text-green-700 border-green-200",
      dot: "bg-green-500",
      icon: <div className="w-1.5 h-1.5 rounded-full bg-green-500" />,
    };
  }
  if (gig.isTaken) {
    return {
      label: "Booked",
      color: isDarkMode
        ? "bg-blue-900/30 text-blue-400 border-blue-800"
        : "bg-blue-100 text-blue-700 border-blue-200",
      dot: "bg-blue-500",
      icon: <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />,
    };
  }
  return {
    label: "Closed",
    color: isDarkMode
      ? "bg-gray-800 text-gray-400 border-gray-700"
      : "bg-gray-100 text-gray-600 border-gray-200",
    dot: "bg-gray-400",
    icon: <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />,
  };
};

const getGigIcon = (gig: any, isDarkMode: boolean) => {
  const iconClass = "w-4 h-4 sm:w-5 sm:h-5";

  if (gig.isClientBand) {
    return (
      <Users
        className={cn(
          iconClass,
          isDarkMode ? "text-purple-400" : "text-purple-500",
        )}
      />
    );
  }

  switch (gig.bussinesscat?.toLowerCase()) {
    case "mc":
      return (
        <Music
          className={cn(
            iconClass,
            isDarkMode ? "text-red-400" : "text-red-500",
          )}
        />
      );
    case "dj":
      return (
        <Music
          className={cn(
            iconClass,
            isDarkMode ? "text-pink-400" : "text-pink-500",
          )}
        />
      );
    case "vocalist":
      return (
        <Music
          className={cn(
            iconClass,
            isDarkMode ? "text-green-400" : "text-green-500",
          )}
        />
      );
    default:
      return (
        <Briefcase
          className={cn(
            iconClass,
            isDarkMode ? "text-blue-400" : "text-blue-500",
          )}
        />
      );
  }
};

const formatDate = (date: number) => {
  const d = new Date(date);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";

  const diffDays = Math.floor(
    (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays > 0 && diffDays < 7) {
    return d.toLocaleDateString("en-US", { weekday: "short" });
  }

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const timeAgo = (date: number) => {
  const seconds = Math.floor((new Date().getTime() - date) / 1000);
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export const SavedGigs = ({ user }: { user: any }) => {
  const { colors, isDarkMode } = useThemeColors();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("grid");
  const [isLoading, setIsLoading] = useState(true);

  // Queries
  const savedGigs = useQuery(api.controllers.gigs.getSavedGigs, {
    userId: user?._id,
  });

  const unsaveGig = useMutation(api.controllers.gigs.unsaveGig);

  // Filter gigs
  const filteredGigs = useMemo(() => {
    if (!savedGigs) return [];

    let filtered = [...savedGigs];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (gig: any) =>
          gig.title.toLowerCase().includes(term) ||
          gig.description?.toLowerCase().includes(term) ||
          gig.location?.toLowerCase().includes(term),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((gig: any) => {
        const isAvailable = gig.isActive && !gig.isTaken;
        if (statusFilter === "available") return isAvailable;
        if (statusFilter === "booked") return gig.isTaken;
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

    return filtered.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
  }, [savedGigs, searchTerm, statusFilter, dateFilter]);

  // Loading state
  useEffect(() => {
    if (savedGigs !== undefined) {
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [savedGigs]);

  // Stats - Mobile optimized
  const stats = useMemo(() => {
    if (!savedGigs?.length) return null;

    const active = savedGigs.filter(
      (g: any) => g.isActive && !g.isTaken,
    ).length;
    const upcoming = savedGigs.filter((g: any) => {
      const status = getGigDateStatus(g.date, g.time);
      return !status.exactPast;
    }).length;

    return {
      total: savedGigs.length,
      active,
      upcoming,
    };
  }, [savedGigs]);

  // Handlers
  const handleRemoveSaved = async (gigId: string) => {
    try {
      await unsaveGig({ userId: user._id, gigId });
      toast.success("Removed from saved");
    } catch (error) {
      toast.error("Failed to remove");
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFilter("all");
  };

  // Render grid view - Beautiful cards for mobile
  const renderGridView = () => (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4">
      <AnimatePresence mode="popLayout">
        {filteredGigs.map((gig: any, index: number) => {
          const statusConfig = getStatusConfig(gig, isDarkMode);
          const dateStatus = getGigDateStatus(gig.date, gig.time);
          const savedAt = gig.savedAt || gig.updatedAt;

          return (
            <motion.div
              key={gig._id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: index * 0.02 }}
              whileHover={{ y: -2 }}
              className="h-full"
            >
              <Card
                className={cn(
                  "h-full overflow-hidden transition-all duration-200",
                  "border hover:shadow-md",
                  isDarkMode
                    ? "bg-gray-900/50 border-gray-800 hover:border-blue-600/50"
                    : "bg-white border-gray-200 hover:border-blue-400",
                )}
              >
                <CardContent className="p-3">
                  {/* Header with icon, title and remove button */}
                  <div className="flex items-start gap-2">
                    {/* Icon with gradient background */}
                    <div
                      className={cn(
                        "p-2 rounded-lg bg-gradient-to-br",
                        isDarkMode
                          ? "from-gray-800 to-gray-900"
                          : "from-gray-100 to-gray-200",
                      )}
                    >
                      {getGigIcon(gig, isDarkMode)}
                    </div>

                    {/* Title and metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3
                          className={cn(
                            "font-semibold text-sm truncate",
                            isDarkMode ? "text-white" : "text-gray-900",
                          )}
                        >
                          {gig.title}
                        </h3>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveSaved(gig._id)}
                          className={cn(
                            "h-6 w-6 p-0 -mr-1",
                            "text-red-500 hover:text-red-600",
                            isDarkMode
                              ? "hover:bg-red-950/30"
                              : "hover:bg-red-50",
                          )}
                        >
                          <BookmarkMinus className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      {/* Status and saved time */}
                      <div className="flex items-center gap-1 mt-0.5">
                        {statusConfig.icon}
                        <span
                          className={cn(
                            "text-[10px]",
                            isDarkMode ? "text-gray-400" : "text-gray-500",
                          )}
                        >
                          {statusConfig.label}
                        </span>
                        <span className="text-[10px] text-gray-400">•</span>
                        <span
                          className={cn(
                            "text-[10px]",
                            isDarkMode ? "text-gray-400" : "text-gray-500",
                          )}
                        >
                          Saved {timeAgo(savedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Gig details with icons */}
                  <div className="mt-3 space-y-2">
                    {/* Date with status badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar
                          className={cn(
                            "w-3.5 h-3.5",
                            isDarkMode ? "text-gray-500" : "text-gray-400",
                          )}
                        />
                        <span
                          className={cn(
                            "text-xs",
                            isDarkMode ? "text-gray-300" : "text-gray-600",
                          )}
                        >
                          {formatDate(gig.date)}
                        </span>
                      </div>
                      {dateStatus.isToday && (
                        <Badge className="text-[8px] h-4 px-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                          TODAY
                        </Badge>
                      )}
                      {dateStatus.isUpcoming && (
                        <Badge className="text-[8px] h-4 px-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                          Coming
                        </Badge>
                      )}
                    </div>

                    {/* Location */}
                    {gig.location && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <MapPin
                          className={cn(
                            "w-3.5 h-3.5",
                            isDarkMode ? "text-gray-500" : "text-gray-400",
                          )}
                        />
                        <span
                          className={cn(
                            "text-xs truncate",
                            isDarkMode ? "text-gray-300" : "text-gray-600",
                          )}
                        >
                          {gig.location}
                        </span>
                      </div>
                    )}

                    {/* Price and category row */}
                    <div className="flex items-center justify-between">
                      {gig.price > 0 ? (
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          <DollarSign
                            className={cn(
                              "w-3.5 h-3.5",
                              isDarkMode
                                ? "text-emerald-400"
                                : "text-emerald-600",
                            )}
                          />
                          <span
                            className={cn(
                              "font-semibold",
                              isDarkMode
                                ? "text-emerald-400"
                                : "text-emerald-600",
                            )}
                          >
                            ${gig.price.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span
                          className={cn(
                            "text-xs",
                            isDarkMode ? "text-gray-500" : "text-gray-400",
                          )}
                        >
                          Price TBD
                        </span>
                      )}

                      {gig.bussinesscat && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[8px] px-1.5 py-0 h-4",
                            isDarkMode
                              ? "border-gray-700 text-gray-400"
                              : "border-gray-200 text-gray-500",
                          )}
                        >
                          <Tag className="w-2 h-2 mr-0.5" />
                          {gig.bussinesscat}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action button - Full width with gradient on hover */}
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                      "w-full mt-3 h-8 text-xs group transition-all",
                      isDarkMode
                        ? "border-gray-700 hover:border-blue-600 hover:bg-blue-600/10"
                        : "border-gray-200 hover:border-blue-400 hover:bg-blue-50",
                    )}
                    onClick={() => window.open(`/gigs/${gig._id}`, "_blank")}
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1 group-hover:scale-110 transition-transform" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );

  // Render list view - Sleek for mobile
  const renderListView = () => (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {filteredGigs.map((gig: any, index: number) => {
          const statusConfig = getStatusConfig(gig, isDarkMode);
          const dateStatus = getGigDateStatus(gig.date, gig.time);
          const savedAt = gig.savedAt || gig.updatedAt;

          return (
            <motion.div
              key={gig._id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2, delay: index * 0.02 }}
            >
              <Card
                className={cn(
                  "overflow-hidden",
                  isDarkMode
                    ? "bg-gray-900/50 border-gray-800"
                    : "bg-white border-gray-200",
                )}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    {/* Icon */}
                    <div
                      className={cn(
                        "p-2 rounded-lg flex-shrink-0",
                        isDarkMode ? "bg-gray-800" : "bg-gray-100",
                      )}
                    >
                      {getGigIcon(gig, isDarkMode)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3
                          className={cn(
                            "font-medium text-sm truncate",
                            isDarkMode ? "text-white" : "text-gray-900",
                          )}
                        >
                          {gig.title}
                        </h3>
                        <ChevronRight
                          className={cn(
                            "w-4 h-4 flex-shrink-0",
                            isDarkMode ? "text-gray-600" : "text-gray-400",
                          )}
                        />
                      </div>

                      <div className="flex items-center gap-2 text-xs mt-0.5">
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                            statusConfig.color,
                          )}
                        >
                          {statusConfig.label}
                        </span>
                        <span
                          className={cn(
                            "text-[10px]",
                            isDarkMode ? "text-gray-400" : "text-gray-500",
                          )}
                        >
                          {formatDate(gig.date)}
                        </span>
                        <span className="text-[10px] text-gray-400">•</span>
                        <span
                          className={cn(
                            "text-[10px]",
                            isDarkMode ? "text-gray-400" : "text-gray-500",
                          )}
                        >
                          {timeAgo(savedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Remove button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveSaved(gig._id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 flex-shrink-0"
                    >
                      <BookmarkMinus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );

  // Loading skeleton - Beautiful shimmer effect
  if (isLoading) {
    return (
      <div className="space-y-4 p-2 sm:p-4">
        {/* Mobile stats skeleton */}
        <div className="grid grid-cols-3 gap-2 sm:hidden">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
        {/* Desktop stats skeleton */}
        <div className="hidden sm:grid sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>

        {/* Controls skeleton */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Skeleton className="h-10 flex-1" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 sm:w-32" />
            <Skeleton className="h-10 w-24 sm:w-32" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>

        {/* Cards skeleton - with shimmer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Card
              key={i}
              className={cn(
                "p-3",
                isDarkMode
                  ? "bg-gray-900/50 border-gray-800"
                  : "bg-white border-gray-200",
              )}
            >
              <div className="flex items-start gap-2">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-full mt-3 rounded-md" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Empty state - Beautiful illustration
  if (!savedGigs?.length) {
    return (
      <Card className="text-center py-12 sm:py-16 border-2 border-dashed mx-2 sm:mx-0">
        <CardContent className="space-y-4">
          <div
            className={cn(
              "w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center",
              isDarkMode ? "bg-blue-900/20" : "bg-blue-50",
            )}
          >
            <Bookmark
              className={cn(
                "w-8 h-8 sm:w-10 sm:h-10",
                isDarkMode ? "text-blue-400" : "text-blue-500",
              )}
            />
          </div>
          <div>
            <h3
              className={cn(
                "text-lg sm:text-xl font-bold mb-2",
                isDarkMode ? "text-white" : "text-gray-900",
              )}
            >
              No saved gigs yet
            </h3>
            <p
              className={cn(
                "text-sm sm:text-base max-w-sm mx-auto",
                isDarkMode ? "text-gray-400" : "text-gray-500",
              )}
            >
              Save gigs you're interested in to review them later
            </p>
          </div>
          <Button
            onClick={() => (window.location.href = "/hub/gigs?tab=all")}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
          >
            Explore Gigs
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
        {/* Stats - Mobile optimized */}
        {stats && (
          <>
            {/* Mobile stats cards */}
            <div className="grid grid-cols-3 gap-2 sm:hidden">
              <Card className="text-center bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-0">
                <CardContent className="p-3">
                  <p
                    className={cn(
                      "text-xs uppercase tracking-wider mb-1",
                      isDarkMode ? "text-gray-400" : "text-gray-500",
                    )}
                  >
                    Total
                  </p>
                  <p
                    className={cn(
                      "text-xl font-bold",
                      isDarkMode ? "text-white" : "text-gray-900",
                    )}
                  >
                    {stats.total}
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-0">
                <CardContent className="p-3">
                  <p
                    className={cn(
                      "text-xs uppercase tracking-wider mb-1",
                      isDarkMode ? "text-gray-400" : "text-gray-500",
                    )}
                  >
                    Active
                  </p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {stats.active}
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-0">
                <CardContent className="p-3">
                  <p
                    className={cn(
                      "text-xs uppercase tracking-wider mb-1",
                      isDarkMode ? "text-gray-400" : "text-gray-500",
                    )}
                  >
                    Upcoming
                  </p>
                  <p
                    className={cn(
                      "text-xl font-bold",
                      isDarkMode ? "text-white" : "text-gray-900",
                    )}
                  >
                    {stats.upcoming}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Desktop stats */}
            <div className="hidden sm:grid sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(stats).map(([key, value]) => (
                <Card key={key} className="text-center">
                  <CardContent className="p-4">
                    <p
                      className={cn(
                        "text-xs uppercase tracking-wider mb-1",
                        isDarkMode ? "text-gray-400" : "text-gray-500",
                      )}
                    >
                      {key}
                    </p>
                    <p
                      className={cn(
                        "text-xl font-bold",
                        isDarkMode ? "text-white" : "text-gray-900",
                      )}
                    >
                      {value}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Controls - Mobile first */}
        <div className="space-y-2 sm:space-y-0 sm:flex sm:flex-row sm:gap-3">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search saved gigs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  "pl-9 h-10",
                  isDarkMode
                    ? "bg-gray-800/50 border-gray-700"
                    : "bg-white border-gray-200",
                )}
              />
            </div>
          </div>

          {/* Filter and view toggles */}
          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onValueChange={(v: any) => setStatusFilter(v)}
            >
              <SelectTrigger
                className={cn(
                  "w-24 sm:w-32 h-10",
                  isDarkMode
                    ? "bg-gray-800/50 border-gray-700"
                    : "bg-white border-gray-200",
                )}
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={dateFilter}
              onValueChange={(v: any) => setDateFilter(v)}
            >
              <SelectTrigger
                className={cn(
                  "w-24 sm:w-32 h-10",
                  isDarkMode
                    ? "bg-gray-800/50 border-gray-700"
                    : "bg-white border-gray-200",
                )}
              >
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="past">Past</SelectItem>
              </SelectContent>
            </Select>

            <div
              className={cn(
                "flex gap-1 p-1 rounded-lg",
                isDarkMode ? "bg-gray-800/50" : "bg-gray-100",
              )}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant={displayMode === "grid" ? "default" : "ghost"}
                    onClick={() => setDisplayMode("grid")}
                    className={cn(
                      "h-8 w-8 p-0",
                      displayMode === "grid" &&
                        "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600",
                    )}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Grid view</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant={displayMode === "list" ? "default" : "ghost"}
                    onClick={() => setDisplayMode("list")}
                    className={cn(
                      "h-8 w-8 p-0",
                      displayMode === "list" &&
                        "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600",
                    )}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>List view</TooltipContent>
              </Tooltip>
            </div>

            {(searchTerm || statusFilter !== "all" || dateFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className={cn(
                  "h-10 px-3",
                  isDarkMode ? "border-gray-700" : "border-gray-200",
                )}
              >
                <X className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p
            className={cn(
              "text-sm",
              isDarkMode ? "text-gray-400" : "text-gray-500",
            )}
          >
            Showing <span className="font-medium">{filteredGigs.length}</span>{" "}
            of {savedGigs.length}
          </p>
          {filteredGigs.length === 0 && (
            <Button
              variant="link"
              onClick={handleClearFilters}
              className="text-blue-500 h-auto p-0"
            >
              Clear filters
            </Button>
          )}
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${displayMode}-${filteredGigs.length}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {filteredGigs.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Filter className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p
                    className={cn(
                      "text-gray-500",
                      isDarkMode && "text-gray-400",
                    )}
                  >
                    No saved gigs match your filters
                  </p>
                </CardContent>
              </Card>
            ) : displayMode === "grid" ? (
              renderGridView()
            ) : (
              renderListView()
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};
