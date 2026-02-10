// app/hub/gigs/_components/SavedGigs.tsx - FIXED ANIMATIONS
"use client";

import React, { useMemo, useState, useEffect } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  calculateGigDateStats,
  formatGigDate,
  getGigDateStatus,
  formatTimeWithDuration,
} from "../helper/getGigDateStatus";

export const SavedGigs = ({ user }: { user: any }) => {
  const { colors, isDarkMode } = useThemeColors();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "available" | "booked"
  >("all");
  const [dateFilter, setDateFilter] = useState<
    "all" | "upcoming" | "past" | "today"
  >("all");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [filterAnimationKey, setFilterAnimationKey] = useState(0);

  // Fetch user's saved gigs
  const savedGigs = useQuery(api.controllers.gigs.getSavedGigs, {
    userId: user?._id,
  });

  // Mutation to remove from saved
  const unsaveGig = useMutation(api.controllers.gigs.unsaveGig);

  // Sort by saved date (newest first) with search and filters
  const filteredGigs = useMemo(() => {
    if (!savedGigs) return [];

    let filtered = [...savedGigs];

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

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((gig: any) => {
        const isAvailable = gig.isActive && !gig.isTaken;
        if (statusFilter === "available") return isAvailable;
        if (statusFilter === "booked") return gig.isTaken;
        return true;
      });
    }

    // Apply date filter
    if (dateFilter !== "all") {
      filtered = filtered.filter((gig: any) => {
        const dateStatus = getGigDateStatus(gig.date, gig.time);
        if (dateFilter === "upcoming") return !dateStatus.exactPast;
        if (dateFilter === "past") return dateStatus.exactPast;
        if (dateFilter === "today") return dateStatus.isToday;
        return true;
      });
    }

    // Sort by saved date (newest first)
    return filtered.sort((a, b) => {
      const dateA = a.savedAt || a.updatedAt || 0;
      const dateB = b.savedAt || b.updatedAt || 0;
      return dateB - dateA;
    });
  }, [savedGigs, searchTerm, statusFilter, dateFilter]);

  // Handle initial load animation
  useEffect(() => {
    if (savedGigs !== undefined) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [savedGigs]);

  // Trigger animation when filters change
  useEffect(() => {
    setFilterAnimationKey((prev) => prev + 1);
  }, [searchTerm, statusFilter, dateFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!savedGigs?.length) return null;

    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const dateStats = calculateGigDateStats(savedGigs);

    // Calculate recent saves (last 7 days)
    const recent = savedGigs.filter((g: any) => {
      const savedAt = g.savedAt || g.updatedAt;
      return savedAt && new Date(savedAt) >= last7Days;
    }).length;

    return {
      total: savedGigs.length,
      active: savedGigs.filter((g: any) => g.isActive && !g.isTaken).length,
      booked: savedGigs.filter((g: any) => g.isTaken).length,
      upcoming: dateStats.upcoming,
      past: dateStats.past,
      today: dateStats.today,
      recent: recent,
      bandGigs: savedGigs.filter((g: any) => g.isClientBand).length,
      regularGigs: savedGigs.filter((g: any) => !g.isClientBand).length,
    };
  }, [savedGigs]);

  // Format time since saved
  const timeSinceSaved = (savedAt: number) => {
    const now = new Date().getTime();
    const diff = now - savedAt;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  // Handle remove from saved
  const handleRemoveSaved = async (gigId: string) => {
    try {
      await unsaveGig({
        userId: user._id,
        gigId,
      });
      toast.success("Removed from saved");
    } catch (error) {
      toast.error("Failed to remove from saved");
      console.error(error);
    }
  };

  // Loading skeleton
  if (isInitialLoad && savedGigs === undefined) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-full" />
            <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
          </div>
          <div className="h-4 w-96 max-w-full bg-gray-200 animate-pulse rounded" />
        </div>

        {/* Skeleton stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i}>
              <div className="h-24 bg-gray-200 animate-pulse rounded-xl" />
            </div>
          ))}
        </div>

        {/* Skeleton filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="h-12 bg-gray-200 animate-pulse rounded" />
            </div>
          ))}
        </div>

        {/* Skeleton cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i}>
              <div className="h-64 bg-gray-200 animate-pulse rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Data loaded but no gigs
  if (!savedGigs || savedGigs.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Bookmark className="w-6 h-6 text-blue-500 fill-blue-500" />
            <h2 className="text-2xl font-bold">Saved Gigs</h2>
          </div>
          <p className={cn("text-muted-foreground", colors.textMuted)}>
            💾 Gigs you've saved for later viewing
          </p>
        </div>

        <Card className="text-center py-12">
          <CardContent>
            <AlertCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Saved Gigs Yet</h3>
            <p className="text-muted-foreground mb-4">
              Save gigs to review them later without losing track
            </p>
            <Button
              onClick={() => (window.location.href = "/gigs/explore")}
              variant="outline"
            >
              Explore Gigs to Save
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Bookmark className="w-6 h-6 text-blue-500 fill-blue-500" />
          <h2 className="text-2xl font-bold">Saved Gigs</h2>
        </div>
        <p className={cn("text-muted-foreground", colors.textMuted)}>
          💾 Gigs you've saved for later viewing
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key}>
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
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Input
            placeholder="Search saved gigs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>

        {/* Status filter */}
        <Select
          value={statusFilter}
          onValueChange={(value: any) => setStatusFilter(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available Only</SelectItem>
            <SelectItem value="booked">Booked Only</SelectItem>
          </SelectContent>
        </Select>

        {/* Date filter */}
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

        {/* Clear filters button */}
        {(searchTerm || statusFilter !== "all" || dateFilter !== "all") && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setDateFilter("all");
            }}
            className="w-full"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Saved Gigs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGigs.map((gig: any) => {
          const dateStatus = getGigDateStatus(gig.date, gig.time);
          const isAvailable = gig.isActive && !gig.isTaken;
          const savedAt = gig.savedAt || gig.updatedAt;

          return (
            <div key={gig._id}>
              <Card
                className={cn(
                  "h-full transition-all duration-200 relative hover:shadow-lg border-2",
                  !isAvailable && "opacity-90",
                  isDarkMode
                    ? isAvailable
                      ? "border-blue-700/30 hover:border-blue-600/50 bg-gray-900/50"
                      : "border-gray-700/30 hover:border-gray-600/50 bg-gray-900/30"
                    : isAvailable
                      ? "border-blue-200 hover:border-blue-300 bg-white"
                      : "border-gray-200 hover:border-gray-300 bg-gray-50/50",
                )}
              >
                {/* Bookmark indicator */}
                <div className="absolute top-4 right-4">
                  <Bookmark className="w-5 h-5 text-blue-500 fill-blue-500" />
                </div>

                {/* Saved time indicator */}
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
                    {timeSinceSaved(savedAt)}
                  </Badge>
                </div>

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

                <CardHeader className="pt-14">
                  <div className="flex justify-between items-start mb-2">
                    <Badge
                      className={cn(
                        isAvailable
                          ? isDarkMode
                            ? "bg-green-900/30 text-green-400 border-green-800"
                            : "bg-green-100 text-green-800 border-green-200"
                          : gig.isTaken
                            ? isDarkMode
                              ? "bg-blue-900/30 text-blue-400 border-blue-800"
                              : "bg-blue-100 text-blue-800 border-blue-200"
                            : isDarkMode
                              ? "bg-gray-800 text-gray-400 border-gray-700"
                              : "bg-gray-100 text-gray-800 border-gray-200",
                      )}
                    >
                      {isAvailable
                        ? "Available"
                        : gig.isTaken
                          ? "Booked"
                          : "Closed"}
                    </Badge>
                    <div>
                      {dateStatus.exactPast ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            isDarkMode
                              ? "bg-gray-800 text-gray-400 border-gray-700"
                              : "bg-gray-100 text-gray-800 border-gray-300",
                          )}
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {dateStatus.isToday ? "Completed" : "Past"}
                        </Badge>
                      ) : dateStatus.isToday ? (
                        <Badge
                          className={cn(
                            isDarkMode
                              ? "bg-green-900/30 text-green-400 border-green-800"
                              : "bg-green-100 text-green-800 border-green-200",
                          )}
                        >
                          <Calendar className="w-3 h-3 mr-1" />
                          Today
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className={cn(
                            isDarkMode
                              ? "bg-blue-900/30 text-blue-400 border-blue-800"
                              : "bg-blue-100 text-blue-800 border-blue-300",
                          )}
                        >
                          Upcoming
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardTitle
                    className={cn(
                      "text-lg font-semibold line-clamp-1",
                      isDarkMode ? "text-white" : "text-gray-900",
                    )}
                  >
                    {gig.title}
                  </CardTitle>

                  <CardDescription
                    className={cn(
                      "flex items-center text-sm mt-1",
                      isDarkMode ? "text-gray-400" : "text-gray-600",
                    )}
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatGigDate(gig.date, gig.time)}
                  </CardDescription>

                  {gig.time && (gig.time.start || gig.time.end) && (
                    <div
                      className={cn(
                        "text-xs mt-1",
                        isDarkMode ? "text-gray-500" : "text-gray-600",
                      )}
                    >
                      {gig.time.start &&
                        formatTimeWithDuration(
                          gig.time.start,
                          gig.time.durationFrom,
                        )}
                      {gig.time.end &&
                        ` - ${formatTimeWithDuration(gig.time.end, gig.time.durationTo)}`}
                    </div>
                  )}

                  {gig.isClientBand && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "mt-2 w-fit",
                        isDarkMode
                          ? "border-purple-800 text-purple-400 bg-purple-900/20"
                          : "border-purple-300 text-purple-700 bg-purple-50",
                      )}
                    >
                      <Users className="w-3 h-3 mr-1" />
                      Band Gig
                    </Badge>
                  )}
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
                        <span
                          className={cn(
                            "font-medium mr-2",
                            isDarkMode ? "text-gray-400" : "text-gray-700",
                          )}
                        >
                          Type:
                        </span>
                        <span
                          className={
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          }
                        >
                          {gig.bussinesscat}
                        </span>
                      </div>
                    )}

                    {gig.price > 0 && (
                      <div
                        className={cn(
                          "flex items-center justify-between text-sm p-2 rounded",
                          isDarkMode
                            ? "bg-gray-800/50 text-gray-300"
                            : "bg-gray-50 text-gray-700",
                        )}
                      >
                        <span className="font-medium">Price:</span>
                        <span className="font-bold">
                          {gig.currency || "KES"} {gig.price.toLocaleString()}
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
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "flex-1",
                          isDarkMode
                            ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                        )}
                        onClick={() =>
                          window.open(`/gigs/${gig._id}`, "_blank")
                        }
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "text-red-500 hover:text-red-700",
                          isDarkMode
                            ? "hover:bg-red-900/30"
                            : "hover:bg-red-50",
                        )}
                        onClick={() => handleRemoveSaved(gig._id)}
                      >
                        <BookmarkMinus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};
