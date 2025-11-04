"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import {
  Users,
  UserCheck,
  UserMinus,
  MapPin,
  Music,
  Building,
  Crown,
  Search,
  Filter,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import FollowButton from "@/components/pages/FollowButton";

interface FollowingUser {
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
  isBooker: boolean;
  tier: string;
  talentbio?: string;
  followers: number;
  followings: number;
  lastActive?: number;
  isPrivate?: boolean;
  roleType?: string;
  experience?: string;
  mutualFollowers?: number;
}

export default function FollowingPage() {
  const { user: currentUser } = useCurrentUser();
  const { colors, isDarkMode } = useThemeColors();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "musicians" | "clients" | "bookers"
  >("all");

  // Get users that current user is following with details
  const followingUsers = useQuery(
    api.controllers.socials.getFollowingWithDetails,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  ) as FollowingUser[] | undefined;

  // const followUser = useMutation(api.controllers.user.followUser);

  // Filter and search users
  const filteredUsers = useMemo(() => {
    if (!followingUsers) return [];

    let filtered = followingUsers;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.firstname?.toLowerCase().includes(query) ||
          user.lastname?.toLowerCase().includes(query) ||
          user.username.toLowerCase().includes(query) ||
          user.city?.toLowerCase().includes(query) ||
          user.instrument?.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (filterType === "musicians") {
      filtered = filtered.filter((user) => user.isMusician);
    } else if (filterType === "clients") {
      filtered = filtered.filter((user) => user.isClient);
    } else if (filterType === "bookers") {
      filtered = filtered.filter((user) => user.isBooker);
    }

    return filtered;
  }, [followingUsers, searchQuery, filterType]);

  const clearFilters = () => {
    setSearchQuery("");
    setFilterType("all");
  };

  const hasActiveFilters = searchQuery || filterType !== "all";

  // Stats
  const stats = useMemo(() => {
    if (!followingUsers) return null;

    return {
      total: followingUsers.length,
      musicians: followingUsers.filter((user) => user.isMusician).length,
      clients: followingUsers.filter((user) => user.isClient).length,
      bookers: followingUsers.filter((user) => user.isBooker).length,
      proUsers: followingUsers.filter((user) => user.tier === "pro").length,
      mutualFollowers: followingUsers.filter(
        (user) => (user.mutualFollowers || 0) > 0
      ).length,
    };
  }, [followingUsers]);

  return (
    <div className={cn("min-h-screen pt-28 lg:pt-0", colors.background)}>
      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <h1 className={cn("text-3xl font-bold mb-2", colors.text)}>
                People You Follow
              </h1>
              <p className={cn("text-lg", colors.textMuted)}>
                Manage the accounts you're following
              </p>
            </div>

            {stats && (
              <div className="flex items-center gap-4 text-sm">
                <Badge variant="outline" className={cn(colors.border)}>
                  {stats.total} following
                </Badge>
              </div>
            )}
          </motion.div>

          {/* Stats Cards */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6"
            >
              <div
                className={cn(
                  "p-4 rounded-xl border text-center",
                  colors.card,
                  colors.border
                )}
              >
                <div className={cn("text-2xl font-bold mb-1", colors.text)}>
                  {stats.total}
                </div>
                <div className={cn("text-sm", colors.textMuted)}>Total</div>
              </div>

              <div
                className={cn(
                  "p-4 rounded-xl border text-center",
                  colors.card,
                  colors.border
                )}
              >
                <div
                  className={cn(
                    "text-2xl font-bold mb-1 text-purple-600",
                    isDarkMode && "text-purple-400"
                  )}
                >
                  {stats.musicians}
                </div>
                <div className={cn("text-sm", colors.textMuted)}>Musicians</div>
              </div>

              <div
                className={cn(
                  "p-4 rounded-xl border text-center",
                  colors.card,
                  colors.border
                )}
              >
                <div
                  className={cn(
                    "text-2xl font-bold mb-1 text-green-600",
                    isDarkMode && "text-green-400"
                  )}
                >
                  {stats.clients}
                </div>
                <div className={cn("text-sm", colors.textMuted)}>Clients</div>
              </div>
              <div
                className={cn(
                  "p-4 rounded-xl border text-center",
                  colors.card,
                  colors.border
                )}
              >
                <div
                  className={cn(
                    "text-2xl font-bold mb-1 text-green-600",
                    isDarkMode && "text-green-400"
                  )}
                >
                  {stats.bookers}
                </div>
                <div className={cn("text-sm", colors.textMuted)}>Bookers</div>
              </div>

              <div
                className={cn(
                  "p-4 rounded-xl border text-center",
                  colors.card,
                  colors.border
                )}
              >
                <div
                  className={cn(
                    "text-2xl font-bold mb-1 text-blue-600",
                    isDarkMode && "text-blue-400"
                  )}
                >
                  {stats.mutualFollowers}
                </div>
                <div className={cn("text-sm", colors.textMuted)}>Mutual</div>
              </div>
            </motion.div>
          )}

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "p-6 rounded-xl border mb-6",
              colors.card,
              colors.border
            )}
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search people you follow..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-xl"
                />
              </div>

              {/* Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-xl gap-2">
                    <Filter className="w-4 h-4" />
                    {filterType === "all"
                      ? "All Types"
                      : filterType === "musicians"
                        ? "Musicians Only"
                        : "Clients Only"}
                    {hasActiveFilters && (
                      <Badge className="ml-1 h-5 w-5 rounded-full p-0 bg-blue-500">
                        !
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuCheckboxItem
                    checked={filterType === "all"}
                    onCheckedChange={() => setFilterType("all")}
                  >
                    All Types
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterType === "musicians"}
                    onCheckedChange={() => setFilterType("musicians")}
                  >
                    Musicians Only
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterType === "clients"}
                    onCheckedChange={() => setFilterType("clients")}
                  >
                    Clients Only
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex flex-wrap gap-2 mt-4"
              >
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: "{searchQuery}"
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setSearchQuery("")}
                    />
                  </Badge>
                )}
                {filterType !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Type: {filterType === "musicians" ? "Musicians" : "Clients"}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setFilterType("all")}
                    />
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Clear All
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Users List */}
        {filteredUsers.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "rounded-xl border p-6 transition-all duration-300",
                    colors.card,
                    colors.border
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Avatar */}
                      <div className="relative">
                        {user.picture ? (
                          <img
                            src={user.picture}
                            alt={user.firstname || user.username}
                            className="rounded-2xl object-cover w-[64px] h-[64px]"
                          />
                        ) : (
                          <div
                            className={cn(
                              "w-16 h-16 rounded-2xl flex items-center justify-center",
                              colors.secondaryBackground
                            )}
                          >
                            <Users className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        {user.tier === "pro" && (
                          <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1">
                            <Crown className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>

                      {/* User Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3
                            className={cn("font-semibold text-lg", colors.text)}
                          >
                            {user.firstname} {user.lastname}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant={
                                user.isMusician
                                  ? "default"
                                  : user.isClient
                                    ? "secondary"
                                    : "destructive"
                              }
                              className={cn(
                                "text-xs",
                                user.isMusician
                                  ? "bg-purple-500 text-white"
                                  : user.isClient
                                    ? "bg-green-500 text-white"
                                    : "bg-purple-500 text-white"
                              )}
                            >
                              {user.isMusician
                                ? "Musician"
                                : user.isClient
                                  ? "Client"
                                  : "Booker/Manager"}
                            </Badge>
                            {user.tier === "pro" && (
                              <Badge
                                variant="outline"
                                className="bg-amber-500/20 text-amber-600 border-amber-500/30 text-xs"
                              >
                                PRO
                              </Badge>
                            )}
                            {user.mutualFollowers &&
                              user.mutualFollowers > 0 && (
                                <Badge
                                  variant="outline"
                                  className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs"
                                ></Badge>
                              )}
                          </div>
                        </div>

                        <p className={cn("text-sm mb-2", colors.textMuted)}>
                          @{user.username}
                        </p>

                        {/* Additional Info */}
                        <div className="flex items-center gap-4 text-sm">
                          {user.city && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span className={colors.textMuted}>
                                {user.city}
                              </span>
                            </div>
                          )}
                          {user.instrument && (
                            <div className="flex items-center gap-1">
                              <Music className="w-3 h-3 text-purple-500" />
                              <span className={colors.textMuted}>
                                {user.instrument}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs mt-2">
                          <span className={colors.textMuted}>
                            {user.followers} followers
                          </span>
                          <span className={colors.textMuted}>
                            {user.followings} following
                          </span>
                        </div>
                      </div>
                    </div>
                    <FollowButton
                      _id={user?._id}
                      variant="default"
                      size="sm"
                      className={cn(
                        "flex-1 rounded-lg transition-all duration-300",
                        colors.primaryBg,
                        colors.primaryBgHover,
                        "text-white font-semibold shadow-lg hover:shadow-xl",
                        "border-0 hover:scale-105"
                      )}
                    />
                  </div>

                  {/* Bio */}
                  {user.talentbio && (
                    <div className="mt-4 pt-4 border-t">
                      <p
                        className={cn(
                          "text-sm leading-relaxed",
                          colors.textMuted
                        )}
                      >
                        {user.talentbio}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "text-center py-16 rounded-xl border-2 border-dashed",
              colors.card,
              colors.border
            )}
          >
            <UserCheck className="mx-auto text-gray-400 w-16 h-16 mb-4" />
            <h3 className={cn("text-2xl font-bold mb-4", colors.text)}>
              {hasActiveFilters ? "No Matching Users" : "Not Following Anyone"}
            </h3>
            <p
              className={cn("text-lg mb-8 max-w-md mx-auto", colors.textMuted)}
            >
              {hasActiveFilters
                ? "No users match your current filters. Try adjusting your search criteria."
                : "Start following other users to see them here. Discover amazing musicians and clients!"}
            </p>
            {hasActiveFilters ? (
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            ) : (
              <Button
                onClick={() => (window.location.href = "/social/discover")}
                className="bg-gradient-to-r from-blue-500 to-purple-600"
              >
                Discover Users
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
