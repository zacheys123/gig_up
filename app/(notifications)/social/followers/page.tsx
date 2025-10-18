// app/social/followers/page.tsx
"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  MapPin,
  Music,
  Building,
  Crown,
  UserCheck,
  MoreHorizontal,
  Filter,
  Sparkles,
  UserX,
  MessageCircle,
  Calendar,
  Shield,
  TrendingUp,
  Eye,
  Share2,
  Mail,
  Ban,
  Flag,
  BarChart3,
  Target,
  Zap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";

import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Id } from "@/convex/_generated/dataModel";

// Define the follower type based on our convex function
interface Follower {
  _id: string;
  clerkId: string;
  firstname?: string;
  lastname?: string;
  username: string;
  picture?: string;
  city?: string;
  instrument?: string;
  isMusician: boolean;
  isClient: boolean;
  tier: string;
  talentbio?: string;
  followers: number;
  followings: number;
  mutualFollowers?: number;
  lastActive?: number;
  isPrivate?: boolean;
  roleType?: string;
  experience?: string;
}

interface FollowersStats {
  total: number;
  musicians: number;
  clients: number;
  proUsers: number;
  mutualFollowers: number;
  growthThisWeek?: number;
  growthThisMonth?: number;
}

export default function FollowersPage() {
  const { user: currentUser, isLoading: userLoading } = useCurrentUser();
  const { colors, isDarkMode } = useThemeColors();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "musicians" | "clients">(
    "all"
  );
  const [sortBy, setSortBy] = useState<
    "recent" | "mutual" | "name" | "followers"
  >("recent");
  const [selectedFollower, setSelectedFollower] = useState<Follower | null>(
    null
  );
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [highlightedFollower, setHighlightedFollower] = useState<string | null>(
    null
  );
  const [advancedFilters, setAdvancedFilters] = useState({
    tier: null as "free" | "pro" | null,
    hasMutual: null as boolean | null,
    isPrivate: null as boolean | null,
  });

  // Mutations
  const removeFollower = useMutation(api.controllers.socials.removeFollower);

  // Fetch data using the new functions
  const followersData = useQuery(
    api.controllers.socials.getFollowersWithDetails,
    currentUser ? { userId: currentUser._id } : "skip"
  ) as Follower[] | undefined;

  // Fetch stats using the new function
  const followersStats = useQuery(
    api.controllers.socials.getFollowersStats,
    currentUser ? { userId: currentUser._id } : "skip"
  ) as FollowersStats | undefined;

  // Enhanced search with filters
  const searchResults = useQuery(
    api.controllers.socials.searchFollowers,
    currentUser
      ? {
          userId: currentUser._id,
          query: searchQuery,
          filters: {
            isMusician:
              filterType === "musicians"
                ? true
                : filterType === "clients"
                  ? false
                  : undefined,
            isClient:
              filterType === "clients"
                ? true
                : filterType === "musicians"
                  ? false
                  : undefined,
            tier: advancedFilters.tier || undefined,
            hasMutual: advancedFilters.hasMutual || undefined,
            isPrivate: advancedFilters.isPrivate || undefined,
          },
          sortBy: sortBy,
        }
      : "skip"
  ) as Follower[] | undefined;

  // Use search results if we have a query, otherwise use all followers
  const filteredFollowers =
    searchQuery || Object.values(advancedFilters).some((v) => v !== null)
      ? searchResults || []
      : followersData || [];

  const isLoading =
    userLoading || followersData === undefined || followersStats === undefined;

  // Check for query parameters from notifications
  useEffect(() => {
    const newFollower = searchParams.get("new");
    const followerId = searchParams.get("follower");

    if (newFollower === "true" && followerId) {
      setHighlightedFollower(followerId);

      // Auto-clear highlight after 8 seconds
      const timer = setTimeout(() => {
        setHighlightedFollower(null);
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Handle remove follower
  const handleRemoveFollower = async () => {
    if (!selectedFollower || !currentUser) return;

    try {
      await removeFollower({
        userId: currentUser.clerkId,
        followerId: selectedFollower._id as Id<"users">,
      });

      toast.success(`Removed ${selectedFollower.firstname} from followers`);
      setShowRemoveDialog(false);
      setSelectedFollower(null);
    } catch (error) {
      toast.error("Failed to remove follower");
      console.error("Error removing follower:", error);
    }
  };

  // Handle action menu
  const handleAction = (action: string, follower: Follower) => {
    setSelectedFollower(follower);

    switch (action) {
      case "message":
        router.push(`/messages?user=${follower.username}`);
        break;
      case "view-profile":
        router.push(`/profile/${follower.username}`);
        break;
      case "remove":
        setShowRemoveDialog(true);
        break;
      case "share":
        if (navigator.share) {
          navigator.share({
            title: `Check out ${follower.firstname}'s profile`,
            url: `${window.location.origin}/profile/${follower.username}`,
          });
        } else {
          navigator.clipboard.writeText(
            `${window.location.origin}/profile/${follower.username}`
          );
          toast.success("Profile link copied to clipboard");
        }
        break;
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setFilterType("all");
    setSortBy("recent");
    setAdvancedFilters({
      tier: null,
      hasMutual: null,
      isPrivate: null,
    });
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery ||
    filterType !== "all" ||
    Object.values(advancedFilters).some((v) => v !== null);

  // Enhanced stats calculations for display
  const displayStats = useMemo(() => {
    if (!followersStats) return null;

    const mutualPercentage =
      followersStats.total > 0
        ? Math.round(
            (followersStats.mutualFollowers / followersStats.total) * 100
          )
        : 0;

    const proPercentage =
      followersStats.total > 0
        ? Math.round((followersStats.proUsers / followersStats.total) * 100)
        : 0;

    return {
      ...followersStats,
      mutualPercentage,
      proPercentage,
      engagementScore: Math.round((mutualPercentage + proPercentage) / 2), // Simple engagement metric
    };
  }, [followersStats]);

  if (isLoading) {
    return (
      <div className={cn("min-h-screen py-8", colors.background)}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-16 h-16 rounded-2xl",
                  colors.secondaryBackground
                )}
              ></div>
              <div className="space-y-2">
                <div
                  className={cn(
                    "h-8 w-64 rounded-lg",
                    colors.secondaryBackground
                  )}
                ></div>
                <div
                  className={cn(
                    "h-4 w-48 rounded-lg",
                    colors.secondaryBackground
                  )}
                ></div>
              </div>
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={cn("h-20 rounded-2xl", colors.secondaryBackground)}
                ></div>
              ))}
            </div>

            {/* Follower Cards Skeleton */}
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={cn("h-32 rounded-2xl", colors.secondaryBackground)}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen py-8", colors.background)}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10",
                  "border-2",
                  isDarkMode ? "border-blue-400/20" : "border-blue-500/20",
                  "relative overflow-hidden"
                )}
              >
                <Users className="w-8 h-8 text-blue-500 relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
              </div>
              <div>
                <h1
                  className={cn(
                    "text-3xl md:text-4xl font-bold mb-2",
                    colors.text
                  )}
                >
                  Your Followers
                </h1>
                <p className={cn("text-lg", colors.textMuted)}>
                  {followersData?.length || 0} people following your journey
                  {highlightedFollower && " • New follower!"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => router.push("/social/following")}
                variant="outline"
                className="rounded-xl"
              >
                View Following
              </Button>
              <Button
                onClick={() => router.push("/social/follow-requests")}
                variant="outline"
                className="rounded-xl"
              >
                Follow Requests
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Stats Cards with Data from Convex */}
        {displayStats && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8"
          >
            <div
              className={cn(
                "rounded-2xl p-4 border-2 text-center",
                colors.card,
                "border-blue-500/20 bg-blue-500/5"
              )}
            >
              <p className={cn("text-2xl font-bold mb-1", colors.text)}>
                {displayStats.total}
              </p>
              <p className={cn("text-sm", colors.textMuted)}>Total</p>
            </div>
            <div
              className={cn(
                "rounded-2xl p-4 border-2 text-center",
                colors.card,
                "border-purple-500/20 bg-purple-500/5"
              )}
            >
              <p className={cn("text-2xl font-bold mb-1 text-purple-500")}>
                {displayStats.musicians}
              </p>
              <p className={cn("text-sm", colors.textMuted)}>Musicians</p>
            </div>
            <div
              className={cn(
                "rounded-2xl p-4 border-2 text-center",
                colors.card,
                "border-green-500/20 bg-green-500/5"
              )}
            >
              <p className={cn("text-2xl font-bold mb-1 text-green-500")}>
                {displayStats.clients}
              </p>
              <p className={cn("text-sm", colors.textMuted)}>Clients</p>
            </div>
            <div
              className={cn(
                "rounded-2xl p-4 border-2 text-center",
                colors.card,
                "border-amber-500/20 bg-amber-500/5"
              )}
            >
              <p className={cn("text-2xl font-bold mb-1 text-amber-500")}>
                {displayStats.proUsers}
              </p>
              <p className={cn("text-sm", colors.textMuted)}>Pro Users</p>
              <p className={cn("text-xs", colors.textMuted)}>
                {displayStats.proPercentage}%
              </p>
            </div>
            <div
              className={cn(
                "rounded-2xl p-4 border-2 text-center",
                colors.card,
                "border-indigo-500/20 bg-indigo-500/5"
              )}
            >
              <p className={cn("text-2xl font-bold mb-1 text-indigo-500")}>
                {displayStats.mutualFollowers}
              </p>
              <p className={cn("text-sm", colors.textMuted)}>Mutual</p>
              <p className={cn("text-xs", colors.textMuted)}>
                {displayStats.mutualPercentage}%
              </p>
            </div>
            <div
              className={cn(
                "rounded-2xl p-4 border-2 text-center",
                colors.card,
                "border-emerald-500/20 bg-emerald-500/5"
              )}
            >
              <p className={cn("text-2xl font-bold mb-1 text-emerald-500")}>
                {displayStats.engagementScore}
              </p>
              <p className={cn("text-sm", colors.textMuted)}>Engagement</p>
              <p className={cn("text-xs", colors.textMuted)}>Score</p>
            </div>
          </motion.div>
        )}

        {/* Enhanced Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "rounded-2xl p-6 mb-8 border-2",
            colors.card,
            colors.border
          )}
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search followers by name, username, location, or instrument..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "pl-12 pr-4 py-3 w-full rounded-xl text-lg",
                  colors.background,
                  colors.border,
                  colors.text,
                  "focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                )}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-xl gap-2">
                    <Filter className="w-4 h-4" />
                    Sort:{" "}
                    {sortBy === "recent"
                      ? "Recent"
                      : sortBy === "mutual"
                        ? "Mutual"
                        : sortBy === "followers"
                          ? "Popular"
                          : "Name"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortBy("recent")}>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Most Recent
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("mutual")}>
                    <Users className="w-4 h-4 mr-2" />
                    Most Mutual
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("followers")}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Most Followers
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("name")}>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Alphabetical
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex gap-2">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  onClick={() => setFilterType("all")}
                  className={cn(
                    "rounded-xl",
                    filterType === "all" &&
                      "bg-blue-500 text-white hover:bg-blue-600"
                  )}
                >
                  All
                </Button>
                <Button
                  variant={filterType === "musicians" ? "default" : "outline"}
                  onClick={() => setFilterType("musicians")}
                  className={cn(
                    "rounded-xl",
                    filterType === "musicians" &&
                      "bg-purple-500 text-white hover:bg-purple-600"
                  )}
                >
                  <Music className="w-4 h-4 mr-2" />
                  Musicians
                </Button>
                <Button
                  variant={filterType === "clients" ? "default" : "outline"}
                  onClick={() => setFilterType("clients")}
                  className={cn(
                    "rounded-xl",
                    filterType === "clients" &&
                      "bg-green-500 text-white hover:bg-green-600"
                  )}
                >
                  <Building className="w-4 h-4 mr-2" />
                  Clients
                </Button>
              </div>

              {/* Advanced Filters */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-xl gap-2">
                    <Target className="w-4 h-4" />
                    Filters
                    {Object.values(advancedFilters).some((v) => v !== null) && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-2">
                    <h4 className="text-sm font-semibold mb-2">
                      Advanced Filters
                    </h4>

                    <div className="space-y-3">
                      {/* Tier Filter */}
                      <div>
                        <label className="text-xs font-medium mb-1 block">
                          Tier
                        </label>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant={
                              advancedFilters.tier === null
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              setAdvancedFilters((prev) => ({
                                ...prev,
                                tier: null,
                              }))
                            }
                            className="flex-1 text-xs h-8"
                          >
                            All
                          </Button>
                          <Button
                            size="sm"
                            variant={
                              advancedFilters.tier === "free"
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              setAdvancedFilters((prev) => ({
                                ...prev,
                                tier: "free",
                              }))
                            }
                            className="flex-1 text-xs h-8"
                          >
                            Free
                          </Button>
                          <Button
                            size="sm"
                            variant={
                              advancedFilters.tier === "pro"
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              setAdvancedFilters((prev) => ({
                                ...prev,
                                tier: "pro",
                              }))
                            }
                            className="flex-1 text-xs h-8 bg-amber-500/20 text-amber-600 hover:bg-amber-500/30"
                          >
                            Pro
                          </Button>
                        </div>
                      </div>

                      {/* Mutual Followers Filter */}
                      <div>
                        <label className="text-xs font-medium mb-1 block">
                          Mutual Followers
                        </label>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant={
                              advancedFilters.hasMutual === null
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              setAdvancedFilters((prev) => ({
                                ...prev,
                                hasMutual: null,
                              }))
                            }
                            className="flex-1 text-xs h-8"
                          >
                            All
                          </Button>
                          <Button
                            size="sm"
                            variant={
                              advancedFilters.hasMutual === true
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              setAdvancedFilters((prev) => ({
                                ...prev,
                                hasMutual: true,
                              }))
                            }
                            className="flex-1 text-xs h-8"
                          >
                            Has Mutual
                          </Button>
                        </div>
                      </div>

                      {/* Privacy Filter */}
                      <div>
                        <label className="text-xs font-medium mb-1 block">
                          Account Type
                        </label>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant={
                              advancedFilters.isPrivate === null
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              setAdvancedFilters((prev) => ({
                                ...prev,
                                isPrivate: null,
                              }))
                            }
                            className="flex-1 text-xs h-8"
                          >
                            All
                          </Button>
                          <Button
                            size="sm"
                            variant={
                              advancedFilters.isPrivate === true
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              setAdvancedFilters((prev) => ({
                                ...prev,
                                isPrivate: true,
                              }))
                            }
                            className="flex-1 text-xs h-8"
                          >
                            <Shield className="w-3 h-3 mr-1" />
                            Private
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                      <>
                        <DropdownMenuSeparator className="my-2" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllFilters}
                          className="w-full text-xs h-8"
                        >
                          Clear All Filters
                        </Button>
                      </>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 pt-4 border-t flex flex-wrap gap-2 items-center"
            >
              <span className={cn("text-sm font-medium", colors.textMuted)}>
                Active filters:
              </span>

              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery("")}>✕</button>
                </Badge>
              )}

              {filterType !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Type: {filterType}
                  <button onClick={() => setFilterType("all")}>✕</button>
                </Badge>
              )}

              {advancedFilters.tier && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Tier: {advancedFilters.tier}
                  <button
                    onClick={() =>
                      setAdvancedFilters((prev) => ({ ...prev, tier: null }))
                    }
                  >
                    ✕
                  </button>
                </Badge>
              )}

              {advancedFilters.hasMutual !== null && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Mutual: {advancedFilters.hasMutual ? "Yes" : "No"}
                  <button
                    onClick={() =>
                      setAdvancedFilters((prev) => ({
                        ...prev,
                        hasMutual: null,
                      }))
                    }
                  >
                    ✕
                  </button>
                </Badge>
              )}

              {advancedFilters.isPrivate !== null && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Private: {advancedFilters.isPrivate ? "Yes" : "No"}
                  <button
                    onClick={() =>
                      setAdvancedFilters((prev) => ({
                        ...prev,
                        isPrivate: null,
                      }))
                    }
                  >
                    ✕
                  </button>
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="ml-auto text-xs h-6"
              >
                Clear All
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Enhanced Followers List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <AnimatePresence mode="wait">
            {filteredFollowers.length === 0 ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  "rounded-2xl p-12 text-center border-2",
                  colors.card,
                  colors.border
                )}
              >
                <Users
                  className={cn("w-20 h-20 mx-auto mb-6", colors.textMuted)}
                />
                <h3 className={cn("text-2xl font-bold mb-4", colors.text)}>
                  {hasActiveFilters
                    ? "No matching followers found"
                    : "Your follower community awaits"}
                </h3>
                <p
                  className={cn(
                    "text-lg mb-8 max-w-md mx-auto",
                    colors.textMuted
                  )}
                >
                  {hasActiveFilters
                    ? "Try adjusting your search terms or filters to find more followers."
                    : "Share your profile, post content, and engage with others to grow your network!"}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {hasActiveFilters ? (
                    <Button
                      onClick={clearAllFilters}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3"
                    >
                      Clear Filters
                    </Button>
                  ) : (
                    <>
                      <Button
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3"
                        onClick={() => router.push("/profile")}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Profile
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push("/discover")}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Discover Users
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div key="followers-list" className="space-y-4">
                {filteredFollowers.map((follower: Follower, index: number) => (
                  <motion.div
                    key={follower._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-xl",
                      colors.card,
                      colors.border,
                      "hover:border-blue-500/30 hover:scale-[1.02]",
                      highlightedFollower === follower._id &&
                        "ring-4 ring-green-500/30 bg-green-500/5 border-green-500/50"
                    )}
                  >
                    {/* New follower highlight badge */}
                    {highlightedFollower === follower._id && (
                      <div className="absolute -top-3 -right-3">
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-3 py-1 shadow-lg">
                          <Sparkles className="w-3 h-3 mr-1" />
                          New
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-start justify-between">
                      {/* User Info */}
                      <div className="flex items-start gap-4 flex-1">
                        {/* Enhanced Avatar */}
                        <Link href={`/profile/${follower.username}`}>
                          <div className="relative group">
                            <div
                              className={cn(
                                "w-20 h-20 rounded-2xl border-2 transition-all duration-300",
                                "group-hover:border-blue-500 group-hover:scale-105",
                                highlightedFollower === follower._id
                                  ? "border-green-500"
                                  : "border-transparent"
                              )}
                            >
                              {follower.picture ? (
                                <img
                                  src={follower.picture}
                                  alt={follower.username}
                                  className="rounded-2xl object-cover w-full h-full"
                                />
                              ) : (
                                <div
                                  className={cn(
                                    "w-full h-full rounded-2xl flex items-center justify-center",
                                    colors.secondaryBackground
                                  )}
                                >
                                  <UserCheck className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                            </div>

                            {/* Online status indicator */}
                            {follower.lastActive &&
                              Date.now() - follower.lastActive < 300000 && ( // 5 minutes
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                              )}

                            {follower.tier === "pro" && (
                              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full p-1.5 shadow-lg">
                                <Crown className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                        </Link>

                        {/* Enhanced User Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Link href={`/profile/${follower.username}`}>
                              <h3
                                className={cn(
                                  "font-bold text-xl hover:text-blue-500 transition-colors truncate",
                                  colors.text
                                )}
                              >
                                {follower.firstname} {follower.lastname}
                              </h3>
                            </Link>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                variant={
                                  follower.isMusician ? "default" : "secondary"
                                }
                                className={cn(
                                  "text-xs",
                                  follower.isMusician
                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                    : "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                )}
                              >
                                {follower.isMusician ? "Musician" : "Client"}
                              </Badge>
                              {follower.tier === "pro" && (
                                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">
                                  PRO
                                </Badge>
                              )}
                              {follower.isPrivate && (
                                <Badge
                                  variant="outline"
                                  className="text-xs border-gray-400"
                                >
                                  <Shield className="w-3 h-3 mr-1" />
                                  Private
                                </Badge>
                              )}
                              {/* Experience badge for musicians */}
                              {follower.isMusician && follower.experience && (
                                <Badge
                                  variant="outline"
                                  className="text-xs border-blue-400 text-blue-600"
                                >
                                  <Zap className="w-3 h-3 mr-1" />
                                  {follower.experience}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <p
                            className={cn(
                              "text-base mb-3 font-medium",
                              colors.textMuted
                            )}
                          >
                            @{follower.username}
                          </p>

                          {/* Enhanced Location and Instrument */}
                          <div className="flex items-center gap-4 text-sm mb-4">
                            {follower.city && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-blue-500" />
                                <span className={colors.text}>
                                  {follower.city}
                                </span>
                              </div>
                            )}
                            {follower.instrument && (
                              <div className="flex items-center gap-2">
                                <Music className="w-4 h-4 text-purple-500" />
                                <span className={colors.text}>
                                  {follower.instrument}
                                </span>
                              </div>
                            )}
                            {follower.roleType && (
                              <div className="flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-green-500" />
                                <span className={colors.text}>
                                  {follower.roleType}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Enhanced Stats */}
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4 text-blue-500" />
                              <span
                                className={cn("font-semibold", colors.text)}
                              >
                                {follower.followers}
                              </span>
                              <span className={colors.textMuted}>
                                followers
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <UserCheck className="w-4 h-4 text-green-500" />
                              <span
                                className={cn("font-semibold", colors.text)}
                              >
                                {follower.followings}
                              </span>
                              <span className={colors.textMuted}>
                                following
                              </span>
                            </div>
                            {follower.mutualFollowers &&
                              follower.mutualFollowers > 0 && (
                                <div className="flex items-center gap-1">
                                  <span className="text-blue-500 font-semibold">
                                    {follower.mutualFollowers} mutual
                                  </span>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Action Buttons */}
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleAction("message", follower)}
                          variant="outline"
                          size="sm"
                          className="rounded-xl gap-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Message
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-xl"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleAction("view-profile", follower)
                              }
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleAction("share", follower)}
                            >
                              <Share2 className="w-4 h-4 mr-2" />
                              Share Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleAction("remove", follower)}
                              className="text-red-600"
                            >
                              <UserX className="w-4 h-4 mr-2" />
                              Remove Follower
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Enhanced Bio */}
                    {follower.talentbio && (
                      <div className="mt-4 pt-4 border-t">
                        <p
                          className={cn(
                            "text-sm leading-relaxed",
                            colors.textMuted
                          )}
                        >
                          {follower.talentbio}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}{" "}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Enhanced Stats Footer */}
        {filteredFollowers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={cn(
              "rounded-2xl p-8 mt-12 border-2 text-center",
              colors.card,
              colors.border,
              "bg-gradient-to-br from-blue-500/5 to-purple-500/5"
            )}
          >
            <h4 className={cn("text-xl font-bold mb-6", colors.text)}>
              Follower Insights
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 text-sm">
              <div>
                <p className={cn("text-3xl font-bold mb-2", colors.text)}>
                  {followersData?.length || 0}
                </p>
                <p className={colors.textMuted}>Total Followers</p>
              </div>
              <div>
                <p className={cn("text-3xl font-bold mb-2 text-purple-500")}>
                  {followersData?.filter((f) => f.isMusician).length || 0}
                </p>
                <p className={colors.textMuted}>Musicians</p>
              </div>
              <div>
                <p className={cn("text-3xl font-bold mb-2 text-green-500")}>
                  {followersData?.filter((f) => f.isClient).length || 0}
                </p>
                <p className={colors.textMuted}>Clients</p>
              </div>
              <div>
                <p className={cn("text-3xl font-bold mb-2 text-amber-500")}>
                  {followersData?.filter((f) => f.tier === "pro").length || 0}
                </p>
                <p className={colors.textMuted}>Pro Users</p>
              </div>
              <div>
                <p className={cn("text-3xl font-bold mb-2 text-blue-500")}>
                  {followersData?.filter((f) => (f.mutualFollowers || 0) > 0)
                    .length || 0}
                </p>
                <p className={colors.textMuted}>Mutual Connections</p>
              </div>
            </div>

            {/* Additional Insights */}
            {displayStats && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <h5 className={cn("font-semibold mb-3", colors.text)}>
                    Engagement Overview
                  </h5>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={colors.textMuted}>Mutual Followers</span>
                      <span className={cn("font-semibold", colors.text)}>
                        {displayStats.mutualPercentage}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={colors.textMuted}>Pro Users</span>
                      <span className={cn("font-semibold", colors.text)}>
                        {displayStats.proPercentage}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={colors.textMuted}>Engagement Score</span>
                      <span className={cn("font-semibold text-emerald-500")}>
                        {displayStats.engagementScore}/100
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className={cn("font-semibold mb-3", colors.text)}>
                    Community Health
                  </h5>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={colors.textMuted}>Active Musicians</span>
                      <span className={cn("font-semibold text-purple-500")}>
                        {followersData?.filter(
                          (f) =>
                            f.isMusician &&
                            f.lastActive &&
                            Date.now() - f.lastActive < 604800000
                        ).length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={colors.textMuted}>Active Clients</span>
                      <span className={cn("font-semibold text-green-500")}>
                        {followersData?.filter(
                          (f) =>
                            f.isClient &&
                            f.lastActive &&
                            Date.now() - f.lastActive < 604800000
                        ).length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={colors.textMuted}>New This Week</span>
                      <span className={cn("font-semibold text-blue-500")}>
                        {followersData?.filter(
                          (f) =>
                            f.lastActive &&
                            Date.now() - f.lastActive < 604800000
                        ).length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Quick Actions Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={cn(
            "rounded-2xl p-6 mt-8 border-2",
            colors.card,
            colors.border
          )}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h4 className={cn("text-lg font-semibold mb-2", colors.text)}>
                Grow Your Community
              </h4>
              <p className={cn("text-sm", colors.textMuted)}>
                Connect with more musicians and clients to expand your network
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push("/discover")}
                variant="outline"
                className="rounded-xl gap-2"
              >
                <Eye className="w-4 h-4" />
                Discover Users
              </Button>
              <Button
                onClick={() => router.push("/profile")}
                className="rounded-xl gap-2 bg-gradient-to-r from-blue-500 to-purple-600"
              >
                <Share2 className="w-4 h-4" />
                Share Profile
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Remove Follower Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Follower</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedFollower?.firstname} from
              your followers? They won't be notified, but they won't be able to
              see your private content anymore.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRemoveDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveFollower}>
              <UserX className="w-4 h-4 mr-2" />
              Remove Follower
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
        }
        .custom-scrollbar:hover {
          scrollbar-color: auto;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
          margin: 4px 0;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          border-radius: 10px;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .scrollbar-light::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.3);
          border: 2px solid rgba(255, 255, 255, 0.8);
        }
        .scrollbar-light::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.5);
        }
        .scrollbar-dark::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border: 2px solid rgba(0, 0, 0, 0.3);
        }
        .scrollbar-dark::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
