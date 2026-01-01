import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Music,
  Filter,
  Search,
  RefreshCw,
  TrendingUp,
  MapPin,
  Grid3x3,
  List,
  SlidersHorizontal,
  Sparkles,
  Zap,
  Rocket,
  Star,
  Target,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useGigs } from "@/hooks/useAllGigs";
import GigCard from "./gigs/GigCard";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { GigProps } from "@/types/gig";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import GigDescription from "./gigs/GigDescription";

// components/gigs/AllGigs.tsx
export const AllGigs = ({ user }: { user: any }) => {
  const { gigs: userGigs, exploreGigs, isLoading } = useGigs(user?._id);
  const { colors } = useThemeColors();

  // State variables
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<
    "newest" | "popular" | "price-high" | "price-low"
  >("newest");
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [selectedTalentTypes, setSelectedTalentTypes] = useState<string[]>([]);

  // ADDED: State for GigDescription modal
  const [selectedGig, setSelectedGig] = useState<GigProps | null>(null);
  const [showGigDescription, setShowGigDescription] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isSavedMap, setIsSavedMap] = useState<Record<string, boolean>>({});
  const [isFavoriteMap, setIsFavoriteMap] = useState<Record<string, boolean>>(
    {}
  );

  // Talent types for filtering
  const talentTypes = [
    { id: "mc", label: "🎤 MC", icon: "🎤" },
    { id: "dj", label: "🎧 DJ", icon: "🎧" },
    { id: "vocalist", label: "🎵 Vocalist", icon: "🎵" },
    { id: "personal", label: "👤 Individual", icon: "👤" },
    { id: "full", label: "🎸 Full Band", icon: "🎸" },
    { id: "other", label: "🎭 Create Band", icon: "🎭" },
  ];

  // ADDED: Convex mutations (you'll need to import these)
  const saveGig = useMutation(api.controllers.gigs.saveGig);
  const unsaveGig = useMutation(api.controllers.gigs.unsaveGig);
  const favoriteGig = useMutation(api.controllers.gigs.favoriteGig);
  const unfavoriteGig = useMutation(api.controllers.gigs.unfavoriteGig);
  const bookGigMutation = useMutation(api.controllers.gigs.bookGig);

  // ADDED: Missing functions for GigDescription
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

      toast.success("Successfully booked the gig!");
      handleCloseGigDescription();
    } catch (error: any) {
      toast.error(error.message || "Failed to book gig");
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
        toast.success("Added to saved");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update saved status");
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
        toast.success("Added to favorites");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update favorite status");
    }
  };

  // Combine and process gigs
  const allGigs = useMemo(() => {
    return [...(userGigs || []), ...(exploreGigs || [])];
  }, [userGigs, exploreGigs]);

  // Filter and sort gigs
  const filteredGigs = useMemo(() => {
    let result = allGigs.filter((gig) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        gig.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gig.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gig.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gig.location?.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory =
        selectedCategory === "all" || gig.category === selectedCategory;

      // Location filter
      const matchesLocation =
        selectedLocation === "all" || gig.location === selectedLocation;

      // Active status filter
      const matchesStatus = !showOnlyActive || gig.isActive;

      // Talent type filter
      const matchesTalentType =
        selectedTalentTypes.length === 0 ||
        selectedTalentTypes.includes(gig.bussinesscat);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLocation &&
        matchesStatus &&
        matchesTalentType
      );
    });

    // Apply sorting
    result.sort((a, b) => {
      const priceA = a.price || 0;
      const priceB = b.price || 0;
      const viewsA = a.viewCount?.length || 0;
      const viewsB = b.viewCount?.length || 0;

      switch (sortBy) {
        case "newest":
          return (b.date || 0) - (a.date || 0);
        case "popular":
          return viewsB - viewsA;
        case "price-high":
          return priceB - priceA;
        case "price-low":
          return priceA - priceB;
        default:
          return (b.date || 0) - (a.date || 0);
      }
    });

    return result;
  }, [
    allGigs,
    searchQuery,
    selectedCategory,
    selectedLocation,
    showOnlyActive,
    selectedTalentTypes,
    sortBy,
  ]);

  // Extract unique categories and locations
  const categories = useMemo(() => {
    const unique = new Set<string>(["all"]);
    allGigs.forEach((gig) => gig.category && unique.add(gig.category));
    return Array.from(unique);
  }, [allGigs]);

  const locations = useMemo(() => {
    const unique = new Set<string>(["all"]);
    allGigs.forEach((gig) => gig.location && unique.add(gig.location));
    return Array.from(unique);
  }, [allGigs]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsRefreshing(false);
  };

  // Loading skeleton
  if (isLoading.gigs || isLoading.explore) {
    return (
      <div className="space-y-8">
        {/* Header skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
          <Skeleton className="h-14 w-full rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
        </div>

        {/* Gig cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-64 rounded-xl bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* GigDescription Modal */}
      <GigDescription
        gig={selectedGig}
        isOpen={showGigDescription}
        onClose={handleCloseGigDescription}
        onBook={handleBookGig}
        onSave={handleSaveGig}
        onFavorite={handleFavoriteGig}
        currentUserId={user?._id}
      />

      {/* Header Section - Simplified */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
              Available Gigs
            </h1>
            <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
              {filteredGigs.length} gigs • {userGigs?.length || 0} yours •{" "}
              {exploreGigs?.length || 0} public
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="gap-2"
              style={{
                borderColor: colors.border,
                color: colors.text,
              }}
            >
              <RefreshCw
                className={cn("w-4 h-4", isRefreshing && "animate-spin")}
              />
              Refresh
            </Button>

            <Button
              size="sm"
              className="gap-2"
              style={{
                backgroundColor: colors.primary,
                color: colors.primaryContrast,
              }}
            >
              <Zap className="w-4 h-4" />
              Post Gig
            </Button>
          </div>
        </div>

        {/* Search Bar - Simplified */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
            style={{ color: colors.textMuted }}
          />
          <Input
            placeholder="Search gigs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.background,
              color: colors.text,
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              style={{ color: colors.textMuted }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <div className="space-y-4">
        {/* View Mode and Sort */}
        <div className="flex items-center justify-between">
          <Tabs
            value={viewMode}
            onValueChange={(v) => setViewMode(v as any)}
            className="w-auto"
          >
            <TabsList
              className="p-1"
              style={{
                backgroundColor: colors.backgroundMuted,
                borderColor: colors.border,
              }}
            >
              <TabsTrigger
                value="grid"
                className="px-3 py-1 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
                style={{
                  color: colors.text,
                }}
              >
                <Grid3x3 className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger
                value="list"
                className="px-3 py-1 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
                style={{
                  color: colors.text,
                }}
              >
                <List className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-sm"
                style={{ color: colors.text }}
              >
                <TrendingUp className="w-4 h-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48"
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
              }}
            >
              <DropdownMenuItem
                onClick={() => setSortBy("newest")}
                style={{ color: colors.text }}
              >
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy("popular")}
                style={{ color: colors.text }}
              >
                Most Popular
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy("price-high")}
                style={{ color: colors.text }}
              >
                Price: High to Low
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy("price-low")}
                style={{ color: colors.text }}
              >
                Price: Low to High
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Category and Location Filters */}
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.background,
              color: colors.text,
            }}
          >
            <option value="all">All Categories</option>
            {categories.slice(1).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.background,
              color: colors.text,
            }}
          >
            <option value="all">All Locations</option>
            {locations.slice(1).map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>

          {/* Active Gig Toggle */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.background,
            }}
          >
            <Switch
              checked={showOnlyActive}
              onCheckedChange={setShowOnlyActive}
              style={{
                backgroundColor: showOnlyActive
                  ? colors.primary
                  : colors.border,
              }}
            />
            <span style={{ color: colors.text }}>Active Only</span>
          </div>
        </div>

        {/* Talent Type Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {talentTypes.map((talent) => (
            <button
              key={talent.id}
              onClick={() => {
                setSelectedTalentTypes((prev) =>
                  prev.includes(talent.id)
                    ? prev.filter((id) => id !== talent.id)
                    : [...prev, talent.id]
                );
              }}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm flex items-center gap-2 transition-all",
                selectedTalentTypes.includes(talent.id)
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                  : cn(
                      "border",
                      colors.border,
                      colors.hoverBg,
                      "hover:border-orange-500/50"
                    )
              )}
              style={{
                color: selectedTalentTypes.includes(talent.id)
                  ? colors.primaryContrast
                  : colors.text,
              }}
            >
              <span>{talent.icon}</span>
              <span>{talent.label.split(" ")[1]}</span>
              {selectedTalentTypes.includes(talent.id) && (
                <Star className="w-3 h-3 fill-current" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          )}
        >
          {filteredGigs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-full flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="mb-4">
                <Music
                  className="w-16 h-16"
                  style={{ color: colors.textMuted }}
                />
              </div>
              <h3
                className="text-xl font-bold mb-2"
                style={{ color: colors.text }}
              >
                No gigs found
              </h3>
              <p
                className="max-w-md mb-6 text-sm"
                style={{ color: colors.textMuted }}
              >
                {allGigs.length === 0
                  ? "Be the first to post a gig!"
                  : "Try adjusting your filters or search terms."}
              </p>
              <Button
                size="sm"
                className="gap-2"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.primaryContrast,
                }}
              >
                <Sparkles className="w-4 h-4" />
                Post First Gig
              </Button>
            </motion.div>
          ) : (
            filteredGigs.map((gig, index) => (
              <motion.div
                key={gig._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className={viewMode === "list" ? "w-full" : ""}
              >
                <GigCard gig={gig} />
              </motion.div>
            ))
          )}
        </motion.div>
      </AnimatePresence>

      {/* Stats Footer - Simplified */}
      {filteredGigs.length > 0 && (
        <div
          className="mt-8 pt-6 border-t text-sm text-center"
          style={{ borderColor: colors.border, color: colors.textMuted }}
        >
          Showing {filteredGigs.length} of {allGigs.length} gigs
        </div>
      )}

      {/* Fixed Post Button - Mobile */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <Button
          size="icon"
          className="rounded-full shadow-lg"
          style={{
            backgroundColor: colors.primary,
            color: colors.primaryContrast,
          }}
        >
          <Zap className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
