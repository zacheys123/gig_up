"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import {
  Search,
  Users,
  UserPlus,
  UserCheck,
  MapPin,
  Music,
  Building,
  Crown,
  Shield,
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { UserProps } from "@/types/userTypes";

export default function DiscoverPage() {
  const { user: currentUser } = useCurrentUser();
  const { colors, isDarkMode } = useThemeColors();

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    isMusician: undefined as boolean | undefined,
    city: "",
    instrument: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState<
    "all" | "musicians" | "clients" | "pro"
  >("all");

  // Search users with filters
  const searchResults = useQuery(
    api.controllers.user.searchUsers,
    searchQuery ||
      filters.city ||
      filters.instrument ||
      filters.isMusician !== undefined
      ? {
          query: searchQuery,
          isMusician: filters.isMusician,
          city: filters.city,
          instrument: filters.instrument,
          limit: 50,
        }
      : "skip"
  ) as UserProps[] | undefined;

  // Get all users if no search (for initial discovery)
  const allUsers = useQuery(api.controllers.user.getAllUsers) as
    | UserProps[]
    | undefined;

  const followUser = useMutation(api.controllers.user.followUser);

  const usersToDisplay =
    searchQuery ||
    filters.city ||
    filters.instrument ||
    filters.isMusician !== undefined
      ? searchResults
      : allUsers;

  // Filter out current user and add follow status
  const enhancedUsers = useMemo(() => {
    if (!usersToDisplay || !currentUser) return [];

    return usersToDisplay
      .filter((user) => user._id !== currentUser._id)
      .map((user) => {
        // Check if current user is following this user
        const isFollowing = currentUser.followings?.includes(user._id) || false;

        // CORRECTED: Check if current user has a pending request to this user
        const hasPendingRequest =
          user.isPrivate &&
          (user.pendingFollowRequests?.includes(currentUser._id) || false);

        return {
          ...user,
          isFollowing,
          hasPendingRequest,
          canFollow: !isFollowing && !hasPendingRequest,
          // Add computed counts for display
          followersCount: user.followers?.length || 0,
          followingsCount: user.followings?.length || 0,
        };
      });
  }, [usersToDisplay, currentUser]);

  // Group users by category for better organization
  const categorizedUsers = useMemo(() => {
    const musicians = enhancedUsers.filter((user) => user.isMusician);
    const clients = enhancedUsers.filter((user) => user.isClient);
    const proUsers = enhancedUsers.filter((user) => user.tier === "pro");

    // CORRECTED: followers is an array, so we check its length
    const popularUsers = enhancedUsers
      .filter((user) => (user.followers?.length || 0) > 10)
      .sort((a, b) => (b.followers?.length || 0) - (a.followers?.length || 0))
      .slice(0, 8);

    return { musicians, clients, proUsers, popularUsers, all: enhancedUsers };
  }, [enhancedUsers]);

  // Get users for current active category
  const usersForCategory = useMemo(() => {
    switch (activeCategory) {
      case "musicians":
        return categorizedUsers.musicians;
      case "clients":
        return categorizedUsers.clients;
      case "pro":
        return categorizedUsers.proUsers;
      default:
        return categorizedUsers.all;
    }
  }, [activeCategory, categorizedUsers]);

  const handleFollow = async (
    targetUserId: string,
    targetUsername: string,
    isPrivate: boolean
  ) => {
    if (!currentUser?.clerkId) {
      toast.error("Please log in to follow users");
      return;
    }

    try {
      const result = await followUser({
        userId: currentUser.clerkId,
        tId: targetUserId as any,
      });

      if (result.action === "followed") {
        toast.success(`You are now following ${targetUsername}`);
      } else if (result.action === "request_sent") {
        toast.success(`Follow request sent to ${targetUsername}`);
      } else if (result.action === "unfollowed") {
        toast.success(`Unfollowed ${targetUsername}`);
      } else if (result.action === "request_cancelled") {
        toast.success(`Cancelled follow request to ${targetUsername}`);
      }
    } catch (error) {
      console.error("Failed to follow user:", error);
      toast.error("Failed to follow user");
    }
  };

  const clearFilters = () => {
    setFilters({
      isMusician: undefined,
      city: "",
      instrument: "",
    });
    setSearchQuery("");
    setActiveCategory("all");
  };

  const hasActiveFilters =
    searchQuery ||
    filters.city ||
    filters.instrument ||
    filters.isMusician !== undefined ||
    activeCategory !== "all";

  // Category cards for quick filtering
  const categoryCards = [
    {
      id: "all" as const,
      title: "All Users",
      count: categorizedUsers.all.length,
      icon: Users,
      color: "bg-blue-500",
      description: "Discover all users",
    },
    {
      id: "musicians" as const,
      title: "Musicians",
      count: categorizedUsers.musicians.length,
      icon: Music,
      color: "bg-purple-500",
      description: "Find talented artists",
    },
    {
      id: "clients" as const,
      title: "Clients",
      count: categorizedUsers.clients.length,
      icon: Building,
      color: "bg-green-500",
      description: "Connect with event organizers",
    },
    {
      id: "pro" as const,
      title: "Pro Users",
      count: categorizedUsers.proUsers.length,
      icon: Crown,
      color: "bg-amber-500",
      description: "Verified professionals",
    },
  ];

  return (
    <div className={cn("min-h-screen pt-24 lg:pt-0", colors.background)}>
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4"
          >
            <div>
              <h1 className={cn("text-3xl font-bold mb-2", colors.text)}>
                Discover Users
              </h1>
              <p className={cn("text-lg", colors.textMuted)}>
                Find musicians, clients, and industry professionals
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn("text-sm", colors.border)}>
                {enhancedUsers.length} users
              </Badge>
            </div>
          </motion.div>

          {/* Category Cards */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            {categoryCards.map((category) => (
              <motion.div
                key={category.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "p-4 rounded-xl border cursor-pointer transition-all duration-200",
                  colors.card,
                  colors.border,
                  activeCategory === category.id && "ring-2 ring-blue-500"
                )}
                onClick={() => setActiveCategory(category.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <category.icon
                    className={`w-8 h-8 ${category.color} text-white p-1.5 rounded-lg`}
                  />
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </div>
                <h3 className={cn("font-semibold text-sm", colors.text)}>
                  {category.title}
                </h3>
                <p className={cn("text-xs", colors.textMuted)}>
                  {category.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

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
                  placeholder="Search by name, username, city, instrument..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-xl"
                />
              </div>

              {/* Filter Dropdown */}
              <DropdownMenu open={showFilters} onOpenChange={setShowFilters}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-xl gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                    {hasActiveFilters && (
                      <Badge className="ml-1 h-5 w-5 rounded-full p-0 bg-blue-500">
                        !
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-4">
                    <h4 className={cn("font-semibold mb-3", colors.text)}>
                      Filter Users
                    </h4>

                    {/* User Type Filter */}
                    <div className="space-y-2 mb-4">
                      <label className={cn("text-sm font-medium", colors.text)}>
                        User Type
                      </label>
                      <div className="flex gap-2">
                        <Button
                          variant={
                            filters.isMusician === true ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            setFilters((prev) => ({
                              ...prev,
                              isMusician:
                                prev.isMusician === true ? undefined : true,
                            }))
                          }
                          className="flex-1 gap-2"
                        >
                          <Music className="w-3 h-3" />
                          Musicians
                        </Button>
                        <Button
                          variant={
                            filters.isMusician === false ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            setFilters((prev) => ({
                              ...prev,
                              isMusician:
                                prev.isMusician === false ? undefined : false,
                            }))
                          }
                          className="flex-1 gap-2"
                        >
                          <Building className="w-3 h-3" />
                          Clients
                        </Button>
                      </div>
                    </div>

                    {/* City Filter */}
                    <div className="space-y-2 mb-4">
                      <label className={cn("text-sm font-medium", colors.text)}>
                        City
                      </label>
                      <Input
                        placeholder="Filter by city..."
                        value={filters.city}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                        className="rounded-lg"
                      />
                    </div>

                    {/* Instrument Filter */}
                    <div className="space-y-2">
                      <label className={cn("text-sm font-medium", colors.text)}>
                        Instrument
                      </label>
                      <Input
                        placeholder="Filter by instrument..."
                        value={filters.instrument}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            instrument: e.target.value,
                          }))
                        }
                        className="rounded-lg"
                      />
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  <div className="p-2">
                    <Button
                      variant="ghost"
                      onClick={clearFilters}
                      className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear All Filters
                    </Button>
                  </div>
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
                {filters.isMusician !== undefined && (
                  <Badge variant="secondary" className="gap-1">
                    Type: {filters.isMusician ? "Musicians" : "Clients"}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          isMusician: undefined,
                        }))
                      }
                    />
                  </Badge>
                )}
                {filters.city && (
                  <Badge variant="secondary" className="gap-1">
                    City: {filters.city}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, city: "" }))
                      }
                    />
                  </Badge>
                )}
                {filters.instrument && (
                  <Badge variant="secondary" className="gap-1">
                    Instrument: {filters.instrument}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, instrument: "" }))
                      }
                    />
                  </Badge>
                )}
                {activeCategory !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Category: {activeCategory}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setActiveCategory("all")}
                    />
                  </Badge>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Users Grid */}
        {usersForCategory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {usersForCategory.map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "rounded-xl border p-6 transition-all duration-300 hover:shadow-lg flex flex-col",
                    colors.card,
                    colors.border
                  )}
                >
                  {/* User Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {user.picture ? (
                          <img
                            src={user.picture}
                            alt={user.firstname || user.username}
                            className="rounded-xl object-cover wq-[48px] h-[48px]"
                          />
                        ) : (
                          <div
                            className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center",
                              colors.secondaryBackground
                            )}
                          >
                            <Users className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        {user.tier === "pro" && (
                          <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1">
                            <Crown className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3
                          className={cn("font-semibold truncate", colors.text)}
                        >
                          {user.firstname} {user.lastname}
                        </h3>
                        <p className={cn("text-sm truncate", colors.textMuted)}>
                          @{user.username}
                        </p>
                      </div>
                    </div>

                    {user.isPrivate && (
                      <Shield className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </div>

                  {/* User Badges */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    <Badge
                      variant={user.isMusician ? "default" : "secondary"}
                      className={cn(
                        "text-xs",
                        user.isMusician
                          ? "bg-purple-500 text-white"
                          : "bg-green-500 text-white"
                      )}
                    >
                      {user.isMusician ? "Musician" : "Client"}
                    </Badge>

                    {user.tier === "pro" && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-amber-500/20 text-amber-600 border-amber-500/30"
                      >
                        PRO
                      </Badge>
                    )}

                    {user.instrument && (
                      <Badge variant="outline" className="text-xs">
                        <Music className="w-2 h-2 mr-1" />
                        {user.instrument}
                      </Badge>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="space-y-2 mb-4 flex-1">
                    {user.city && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className={colors.textMuted}>{user.city}</span>
                      </div>
                    )}

                    {user.experience && (
                      <p className={cn("text-sm", colors.textMuted)}>
                        {user.experience}
                      </p>
                    )}

                    {user.talentbio && (
                      <p
                        className={cn("text-sm line-clamp-2", colors.textMuted)}
                      >
                        {user.talentbio}
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs mb-4">
                    <span className={colors.textMuted}>
                      {user.followersCount} followers
                    </span>
                    <span className={colors.textMuted}>
                      {user.followingsCount} following
                    </span>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() =>
                      handleFollow(
                        user._id,
                        user.firstname || user.username,
                        user.isPrivate || false
                      )
                    }
                    disabled={!user.canFollow}
                    variant={
                      user.isFollowing
                        ? "outline"
                        : user.hasPendingRequest
                          ? "secondary"
                          : "default"
                    }
                    className="w-full rounded-xl gap-2"
                    size="sm"
                  >
                    {user.isFollowing ? (
                      <>
                        <UserCheck className="w-4 h-4" />
                        Following
                      </>
                    ) : user.hasPendingRequest ? (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Requested
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Follow
                      </>
                    )}
                  </Button>
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
            <Search className="mx-auto text-gray-400 w-16 h-16 mb-4" />
            <h3 className={cn("text-2xl font-bold mb-4", colors.text)}>
              No Users Found
            </h3>
            <p
              className={cn("text-lg mb-8 max-w-md mx-auto", colors.textMuted)}
            >
              {hasActiveFilters
                ? "Try adjusting your search criteria or filters to find more users."
                : "Start by searching for users or exploring different categories."}
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
