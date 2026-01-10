// components/gigs/MyGigs.tsx
"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";

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
} from "lucide-react";

// Components
import GigCard from "./gigs/GigCard";
import { useRouter } from "next/navigation";
import { useGigs } from "@/hooks/useAllGigs";
import clsx from "clsx";
export const MyGigs = ({ user }: { user: any }) => {
  const router = useRouter();
  const { colors, isDarkMode } = useThemeColors();

  // State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Get user's gigs
  const { gigs, isLoading } = useGigs(user?._id);

  // Filter gigs based on search and status
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
          gig.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      );
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

    // Sort gigs
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
  }, [gigs, searchQuery, statusFilter, sortBy]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!gigs) {
      return {
        total: 0,
        active: 0,
        completed: 0,
        pending: 0,
        totalEarnings: 0,
        averageRating: 0,
      };
    }

    const activeGigs = gigs.filter((gig) => gig.isActive && !gig.isTaken);
    const takenGigs = gigs.filter((gig) => gig.isTaken);
    const pendingGigs = gigs.filter((gig) => gig.isPending);
    const totalEarnings = gigs
      .filter((gig) => gig.paymentStatus === "paid")
      .reduce((sum, gig) => sum + (gig.price || 0), 0);
    const averageRating =
      gigs.length > 0
        ? gigs.reduce((sum, gig) => sum + (gig.gigRating || 0), 0) / gigs.length
        : 0;

    return {
      total: gigs.length,
      active: activeGigs.length,
      completed: takenGigs.length,
      pending: pendingGigs.length,
      totalEarnings,
      averageRating: parseFloat(averageRating.toFixed(1)),
    };
  }, [gigs]);

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

  const handleClearSearch = () => {
    setSearchQuery("");
    setStatusFilter("all");
    toast.info("Filters cleared");
  };

  // Loading skeleton
  if (isLoading.gigs) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>

        {/* Gig Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={clsx(
          "relative overflow-hidden rounded-2xl p-6 md:p-8 border shadow-sm",
          colors.background,
          colors.border
        )}
        style={{
          background: isDarkMode
            ? `linear-gradient(135deg, ${colors.cardBgStart}, ${colors.cardBgEnd})`
            : `linear-gradient(135deg, ${colors.cardBgStart}, ${colors.cardBgEnd})`,
        }}
      >
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
            <div className="space-y-2">
              <h1
                className={clsx(
                  "text-3xl md:text-4xl font-bold bg-clip-text text-transparent",
                  isDarkMode
                    ? "bg-gradient-to-r from-orange-400 to-red-400"
                    : "bg-gradient-to-r from-orange-600 to-red-600"
                )}
              >
                My Blueprint
              </h1>
              <p className={clsx("max-w-2xl", colors.textMuted)}>
                Manage and track all gigs you've posted as a client.
                {filteredGigs.length > 0 &&
                  ` ${filteredGigs.length} gig${filteredGigs.length === 1 ? "" : "s"} posted`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleCreateGig}
                size="sm"
                className={clsx(
                  "gap-2 text-white shadow-lg hover:shadow-xl transition-all duration-300",
                  colors.gradientPrimary
                )}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create New Gig</span>
                <span className="sm:hidden">New Gig</span>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            {[
              {
                value: stats.total,
                label: "Total Gigs",
                icon: Package,
                color: "blue",
                gradientFrom: isDarkMode ? "#3b82f6" : "#1d4ed8",
                gradientTo: isDarkMode ? "#60a5fa" : "#3b82f6",
              },
              {
                value: stats.active,
                label: "Active",
                icon: Zap,
                color: "green",
                gradientFrom: isDarkMode ? "#10b981" : "#047857",
                gradientTo: isDarkMode ? "#34d399" : "#10b981",
              },
              {
                value: stats.completed,
                label: "Completed",
                icon: CheckCircle,
                color: "emerald",
                gradientFrom: isDarkMode ? "#059669" : "#047857",
                gradientTo: isDarkMode ? "#10b981" : "#059669",
              },
              {
                value: stats.pending,
                label: "Pending",
                icon: Clock,
                color: "amber",
                gradientFrom: isDarkMode ? "#f59e0b" : "#b45309",
                gradientTo: isDarkMode ? "#fbbf24" : "#f59e0b",
              },
              {
                value: `$${stats.totalEarnings.toLocaleString()}`,
                label: "Total Earnings",
                icon: DollarSign,
                color: "purple",
                gradientFrom: isDarkMode ? "#8b5cf6" : "#6d28d9",
                gradientTo: isDarkMode ? "#a78bfa" : "#8b5cf6",
              },
              {
                value: `${stats.averageRating}/5`,
                label: "Avg. Rating",
                icon: Sparkles,
                color: "pink",
                gradientFrom: isDarkMode ? "#ec4899" : "#be185d",
                gradientTo: isDarkMode ? "#f472b6" : "#ec4899",
              },
            ].map((stat, index) => (
              <Card
                key={index}
                className={clsx("backdrop-blur-sm border", colors.cardBorder)}
                style={{
                  background: isDarkMode
                    ? `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))`
                    : `linear-gradient(135deg, rgba(0,0,0,0.02), rgba(0,0,0,0.05))`,
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={clsx("text-sm", colors.textMuted)}>
                        {stat.label}
                      </p>
                      <p
                        className={clsx(
                          "text-2xl font-bold",
                          isDarkMode ? "text-white" : "text-gray-900"
                        )}
                      >
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className="p-2 rounded-lg"
                      style={{
                        background: `linear-gradient(135deg, ${stat.gradientFrom}, ${stat.gradientTo})`,
                      }}
                    >
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search and Filter Bar */}
          <div className="space-y-4">
            <div className="relative">
              <Search
                className={clsx(
                  "absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5",
                  colors.textMuted
                )}
              />
              <Input
                placeholder="Search your gigs by title, description, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={clsx(
                  "pl-12 pr-12 h-12 rounded-xl backdrop-blur-sm text-lg",
                  colors.border,
                  colors.background
                )}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={clsx(
                    "absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full",
                    colors.hoverBg
                  )}
                >
                  <X className={clsx("w-4 h-4", colors.textMuted)} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className={clsx("w-[180px]", colors.border)}>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent
                  className={clsx(colors.background, colors.border)}
                >
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="taken">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className={clsx("w-[180px]", colors.border)}>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent
                  className={clsx(colors.background, colors.border)}
                >
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="ghost"
                size="sm"
                className={clsx("gap-2", colors.hoverBg)}
              >
                <RefreshCw
                  className={clsx("w-4 h-4", isRefreshing && "animate-spin")}
                />
                Refresh
              </Button>

              {(searchQuery || statusFilter !== "all") && (
                <Button
                  onClick={handleClearSearch}
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-red-500 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <span className={clsx("text-sm", colors.textMuted)}>View:</span>
            <Tabs
              value={viewMode}
              onValueChange={(v) => setViewMode(v as any)}
              className="w-auto"
            >
              <TabsList
                className={clsx(
                  "p-1",
                  isDarkMode ? "bg-gray-800" : "bg-gray-100"
                )}
              >
                <TabsTrigger
                  value="grid"
                  className={clsx(
                    "px-4 py-2 data-[state=active]:shadow-sm rounded-lg",
                    isDarkMode
                      ? "data-[state=active]:bg-gray-900"
                      : "data-[state=active]:bg-white"
                  )}
                >
                  <Grid3x3 className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger
                  value="list"
                  className={clsx(
                    "px-4 py-2 data-[state=active]:shadow-sm rounded-lg",
                    isDarkMode
                      ? "data-[state=active]:bg-gray-900"
                      : "data-[state=active]:bg-white"
                  )}
                >
                  <List className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className={clsx("text-sm", colors.textMuted)}>
            <span className={clsx("font-semibold", colors.text)}>
              {filteredGigs.length}
            </span>{" "}
            of{" "}
            <span className={clsx("font-semibold", colors.text)}>
              {gigs?.length || 0}
            </span>{" "}
            gigs
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={clsx("text-sm hidden sm:inline", colors.textMuted)}>
            Sort by:
          </span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className={clsx("w-[160px]", colors.border)}>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <SelectValue placeholder="Sort by" />
              </div>
            </SelectTrigger>
            <SelectContent className={clsx(colors.background, colors.border)}>
              <SelectItem value="newest">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  Newest First
                </div>
              </SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price-high">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3 h-3" />
                  Price: High to Low
                </div>
              </SelectItem>
              <SelectItem value="price-low">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3 h-3" />
                  Price: Low to High
                </div>
              </SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${viewMode}-${sortBy}-${statusFilter}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={clsx(
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
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
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center"
                    style={{
                      background: isDarkMode
                        ? "linear-gradient(135deg, #1f2937, #111827)"
                        : "linear-gradient(135deg, #f9fafb, #f3f4f6)",
                    }}
                  >
                    <Music
                      className={clsx(
                        "w-12 h-12",
                        isDarkMode ? "text-gray-600" : "text-gray-400"
                      )}
                    />
                  </div>
                  <div
                    className="absolute -top-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: isDarkMode
                        ? "linear-gradient(135deg, #fb923c, #f97316)"
                        : "linear-gradient(135deg, #f97316, #ea580c)",
                    }}
                  >
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <h3 className={clsx("text-2xl font-bold mb-3", colors.text)}>
                {searchQuery || statusFilter !== "all"
                  ? "No matching gigs found"
                  : "No gigs posted yet"}
              </h3>
              <p className={clsx("max-w-md mb-8", colors.textMuted)}>
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Start by creating your first gig to connect with amazing musicians!"}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                {(searchQuery || statusFilter !== "all") && (
                  <Button
                    onClick={handleClearSearch}
                    variant="outline"
                    className={clsx("gap-2", colors.border, colors.hoverBg)}
                  >
                    <X className="w-4 h-4" />
                    Clear Search & Filters
                  </Button>
                )}
                <Button
                  onClick={handleCreateGig}
                  className={clsx(
                    "gap-2 text-white shadow-lg hover:shadow-xl transition-all duration-300",
                    colors.gradientPrimary
                  )}
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Gig
                </Button>
              </div>
            </motion.div>
          ) : (
            filteredGigs.map((gig, index) => (
              <motion.div
                key={gig._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={viewMode === "list" ? "w-full" : ""}
                whileHover={{ scale: viewMode === "grid" ? 1.02 : 1 }}
              >
                <GigCard gig={gig} onClick={() => {}} showActions={true} />
              </motion.div>
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MyGigs;
