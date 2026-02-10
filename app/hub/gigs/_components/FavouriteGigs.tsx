// app/hub/gigs/_components/FavoriteGigs.tsx - ENHANCED WITH ANIMATIONS

"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Star,
  MapPin,
  Calendar,
  Users,
  X,
  ExternalLink,
  Clock,
  CheckCircle,
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
  formatTimeWithDuration,
  getGigDateStatus,
} from "../helper/getGigDateStatus";

// Define proper types for Framer Motion variants
import type { Variants } from "framer-motion";

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

export const FavoriteGigs = ({ user }: { user: any }) => {
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

  // Fetch user's favorite gigs
  const favoriteGigs = useQuery(api.controllers.gigs.getFavoriteGigs, {
    userId: user?._id,
  });

  // Mutation to remove from favorites
  const unfavoriteGig = useMutation(api.controllers.gigs.unfavoriteGig);

  // Filter and sort favorites
  const filteredGigs = useMemo(() => {
    if (!favoriteGigs) return [];

    let filtered = [...favoriteGigs];

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

    return filtered;
  }, [favoriteGigs, searchTerm, statusFilter, dateFilter]);

  // Handle initial load animation
  useEffect(() => {
    if (favoriteGigs !== undefined) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [favoriteGigs]);

  // Trigger animation when filters change
  useEffect(() => {
    setFilterAnimationKey((prev) => prev + 1);
  }, [searchTerm, statusFilter, dateFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!favoriteGigs?.length) return null;

    const dateStats = calculateGigDateStats(favoriteGigs);

    return {
      total: favoriteGigs.length,
      active: favoriteGigs.filter((g: any) => g.isActive && !g.isTaken).length,
      booked: favoriteGigs.filter((g: any) => g.isTaken).length,
      upcoming: dateStats.upcoming,
      past: dateStats.past,
      today: dateStats.today,
      bandGigs: favoriteGigs.filter((g: any) => g.isClientBand).length,
      regularGigs: favoriteGigs.filter((g: any) => !g.isClientBand).length,
    };
  }, [favoriteGigs]);

  // Handle remove from favorites
  const handleRemoveFavorite = async (gigId: string) => {
    try {
      await unfavoriteGig({
        userId: user._id,
        gigId,
      });
      toast.success("Removed from favorites");
    } catch (error) {
      toast.error("Failed to remove from favorites");
      console.error(error);
    }
  };

  // Loading skeleton
  if (isInitialLoad && favoriteGigs === undefined) {
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {[...Array(6)].map((_, i) => (
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
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
  if (!favoriteGigs || favoriteGigs.length === 0) {
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
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            <h2 className="text-2xl font-bold">Favorite Gigs</h2>
          </div>
          <p className={cn("text-muted-foreground", colors.textMuted)}>
            ⭐ Gigs you've starred for quick access
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Favorite Gigs Yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Star gigs you're interested in for quick access later
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => (window.location.href = "/gigs/explore")}
                  variant="outline"
                >
                  Explore Gigs to Favorite
                </Button>
              </motion.div>
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
          <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
          <h2 className="text-2xl font-bold">Favorite Gigs</h2>
        </div>
        <p className={cn("text-muted-foreground", colors.textMuted)}>
          ⭐ Gigs you've starred for quick access
        </p>
      </motion.div>

      {/* Stats */}
      {stats && (
        <motion.div
          key="stats"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {/* Search */}
        <div className="relative">
          <Input
            placeholder="Search favorite gigs..."
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
        <AnimatePresence>
          {(searchTerm || statusFilter !== "all" || dateFilter !== "all") && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Favorite Gigs List */}
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
            const isAvailable = gig.isActive && !gig.isTaken;
            const dateStatus = getGigDateStatus(gig.date, gig.time);

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
                    "h-full transition-all duration-200 relative",
                    !isAvailable && "opacity-90",
                    "hover:shadow-lg border-2",
                    isDarkMode
                      ? isAvailable
                        ? "border-yellow-600/30 hover:border-yellow-500/50 bg-gray-900/50"
                        : "border-gray-700/30 hover:border-gray-600/50 bg-gray-900/30"
                      : isAvailable
                        ? "border-yellow-200 hover:border-yellow-300 bg-white"
                        : "border-gray-200 hover:border-gray-300 bg-gray-50/50",
                  )}
                >
                  {/* Star indicator */}
                  <motion.div
                    className="absolute top-4 right-4"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 500, delay: 0.1 }}
                  >
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  </motion.div>

                  {/* Poster info */}
                  {gig.poster && (
                    <motion.div
                      className="absolute top-4 left-4"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <div className="flex items-center gap-2">
                        {gig.poster.picture && (
                          <motion.img
                            src={gig.poster.picture}
                            alt={gig.poster.firstname}
                            className={cn(
                              "w-6 h-6 rounded-full border-2",
                              isDarkMode ? "border-gray-800" : "border-white",
                            )}
                            whileHover={{ scale: 1.1 }}
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
                    </motion.div>
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
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
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
                            <Calendar className="w-3 h-3 mr-1" />
                            Upcoming
                          </Badge>
                        )}
                      </motion.div>
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
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
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
                      </motion.div>
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
                              isDarkMode ? "text-gray-300" : "text-gray-700"
                            }
                          >
                            {gig.bussinesscat}
                          </span>
                        </div>
                      )}

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
                          <span className="font-medium">Price:</span>
                          <span className="font-bold">
                            {gig.currency || "KES"} {gig.price.toLocaleString()}
                          </span>
                        </motion.div>
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
                              window.open(`/gigs/${gig._id}`, "_blank")
                            }
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "text-red-500 hover:text-red-700",
                              isDarkMode
                                ? "hover:bg-red-900/30"
                                : "hover:bg-red-50",
                            )}
                            onClick={() => handleRemoveFavorite(gig._id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
