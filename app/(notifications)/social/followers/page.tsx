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
  UserX,
  MessageCircle,
  Eye,
  Share2,
  Sparkles,
  Filter,
  UserPlus,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
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
import FollowButton from "@/components/pages/FollowButton";

interface Follower {
  _id: Id<"users">;
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
}

// Responsive Components
const MobileFollowerCard = ({
  follower,
  colors,
  highlightedFollower,
  handleAction,
}: {
  follower: Follower;
  colors: any;
  highlightedFollower: string | null;
  handleAction: (action: string, follower: Follower) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "rounded-2xl p-4 border-2 transition-all duration-300",
      colors.card,
      colors.border,
      "hover:shadow-lg",
      highlightedFollower === follower._id &&
        cn("ring-2 ring-orange-400", colors.warningBg)
    )}
  >
    {/* New Follower Badge */}
    {highlightedFollower === follower._id && (
      <div className="absolute -top-2 -right-2">
        <Badge className={cn("gap-1 shadow-lg text-xs", colors.warning)}>
          <Sparkles className="w-3 h-3" />
          New
        </Badge>
      </div>
    )}

    <div className="flex items-start gap-3">
      {/* Avatar */}
      <Link href={`/profile/${follower.username}`}>
        <div className="relative">
          <div
            className={cn(
              "w-12 h-12 rounded-xl border-2",
              highlightedFollower === follower._id
                ? "border-orange-400"
                : colors.border
            )}
          >
            {follower.picture ? (
              <img
                src={follower.picture}
                alt={follower.username}
                className="rounded-xl object-cover w-full h-full"
              />
            ) : (
              <div
                className={cn(
                  "w-full h-full rounded-xl flex items-center justify-center",
                  colors.secondaryBackground
                )}
              >
                <UserCheck className="w-5 h-5 text-gray-400" />
              </div>
            )}
          </div>
          {follower.tier === "pro" && (
            <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full p-1">
              <Crown className="w-2 h-2 text-white" />
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0 flex-1">
            <Link href={`/profile/${follower.username}`}>
              <h3
                className={cn("font-semibold text-base truncate", colors.text)}
              >
                {follower.firstname} {follower.lastname}
              </h3>
            </Link>
            <p className={cn("text-sm truncate", colors.textMuted)}>
              @{follower.username}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className={cn("rounded-xl", colors.card)}
            >
              <DropdownMenuItem
                onClick={() => handleAction("view-profile", follower)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAction("message", follower)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleAction("remove", follower)}
                className="text-red-600"
              >
                <UserX className="w-4 h-4 mr-2" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge
            variant={follower.isMusician ? "default" : "secondary"}
            className={cn(
              "text-xs",
              follower.isMusician
                ? "bg-purple-500 text-white"
                : "bg-green-500 text-white"
            )}
          >
            {follower.isMusician ? "Musician" : "Client"}
          </Badge>

          {follower.city && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-blue-500" />
              <span className={cn("text-xs", colors.textMuted)}>
                {follower.city}
              </span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs">
            <span className={colors.textMuted}>
              {follower.followers} followers
            </span>
            {follower.mutualFollowers && follower.mutualFollowers > 0 && (
              <span className="text-blue-500 font-medium">
                {follower.mutualFollowers} mutual
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              onClick={() => handleAction("message", follower)}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <MessageCircle className="w-3 h-3" />
            </Button>
            <FollowButton
              _id={follower._id}
              variant="default"
              size="sm"
              className="h-8 px-3 text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

const TabletFollowerCard = ({
  follower,
  colors,
  highlightedFollower,
  handleAction,
}: {
  follower: Follower;
  colors: any;
  highlightedFollower: string | null;
  handleAction: (action: string, follower: Follower) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className={cn(
      "rounded-2xl p-5 border-2 transition-all duration-300 group",
      colors.card,
      colors.border,
      "hover:shadow-lg hover:scale-[1.02]",
      highlightedFollower === follower._id &&
        cn("ring-2 ring-orange-400 shadow-lg", colors.warningBg)
    )}
  >
    {highlightedFollower === follower._id && (
      <div className="absolute -top-2 -right-2">
        <Badge className={cn("gap-1 shadow-lg", colors.warning)}>
          <Sparkles className="w-3 h-3" />
          New
        </Badge>
      </div>
    )}

    <div className="flex items-start gap-4">
      <Link href={`/profile/${follower.username}`}>
        <div className="relative">
          <div
            className={cn(
              "w-16 h-16 rounded-2xl border-2 transition-all duration-300",
              "group-hover:border-orange-400",
              highlightedFollower === follower._id
                ? "border-orange-400"
                : colors.border
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
                <UserCheck className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
          {follower.tier === "pro" && (
            <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full p-1">
              <Crown className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0">
            <Link href={`/profile/${follower.username}`}>
              <h3
                className={cn(
                  "font-bold text-lg hover:text-orange-400 transition-colors truncate",
                  colors.text
                )}
              >
                {follower.firstname} {follower.lastname}
              </h3>
            </Link>
            <p className={cn("text-sm truncate", colors.textMuted)}>
              @{follower.username}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-xl">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className={cn("rounded-xl", colors.card)}
            >
              <DropdownMenuItem
                onClick={() => handleAction("view-profile", follower)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAction("message", follower)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleAction("remove", follower)}
                className="text-red-600"
              >
                <UserX className="w-4 h-4 mr-2" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <Badge
            variant={follower.isMusician ? "default" : "secondary"}
            className={cn(
              "text-xs",
              follower.isMusician
                ? "bg-purple-500 text-white"
                : "bg-green-500 text-white"
            )}
          >
            {follower.isMusician ? "Musician" : "Client"}
          </Badge>

          {follower.city && (
            <div className="flex items-center gap-1 text-sm">
              <MapPin className="w-3 h-3 text-blue-500" />
              <span className={colors.textMuted}>{follower.city}</span>
            </div>
          )}

          {follower.instrument && (
            <div className="flex items-center gap-1 text-sm">
              <Music className="w-3 h-3 text-purple-500" />
              <span className={colors.textMuted}>{follower.instrument}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <span className={cn("font-semibold", colors.text)}>
              {follower.followers} followers
            </span>
            {follower.mutualFollowers && follower.mutualFollowers > 0 && (
              <span className="text-blue-500 font-semibold">
                {follower.mutualFollowers} mutual
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleAction("message", follower)}
              variant="outline"
              size="sm"
              className="rounded-lg"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
            <FollowButton
              _id={follower._id}
              variant="default"
              size="sm"
              className="rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

const DesktopFollowerCard = ({
  follower,
  colors,
  highlightedFollower,
  handleAction,
}: {
  follower: Follower;
  colors: any;
  highlightedFollower: string | null;
  handleAction: (action: string, follower: Follower) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className={cn(
      "rounded-2xl p-6 border-2 transition-all duration-300 group",
      colors.card,
      colors.border,
      "hover:shadow-xl hover:scale-[1.02]",
      highlightedFollower === follower._id &&
        cn("ring-2 ring-orange-400 shadow-lg", colors.warningBg)
    )}
  >
    {highlightedFollower === follower._id && (
      <div className="absolute -top-2 -right-2">
        <Badge className={cn("gap-1 shadow-lg", colors.warning)}>
          <Sparkles className="w-3 h-3" />
          New
        </Badge>
      </div>
    )}

    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${follower.username}`}>
            <div className="relative group">
              <div
                className={cn(
                  "w-14 h-14 rounded-2xl border-2 transition-all duration-300",
                  "group-hover:border-orange-400 group-hover:scale-110",
                  highlightedFollower === follower._id
                    ? "border-orange-400"
                    : colors.border
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
                    <UserCheck className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>

              {follower.lastActive &&
                Date.now() - follower.lastActive < 300000 && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}

              {follower.tier === "pro" && (
                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full p-1 shadow-lg">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </Link>

          <div className="min-w-0">
            <Link href={`/profile/${follower.username}`}>
              <h3
                className={cn(
                  "font-bold text-lg hover:text-orange-400 transition-colors truncate",
                  colors.text
                )}
              >
                {follower.firstname} {follower.lastname}
              </h3>
            </Link>
            <p className={cn("text-sm truncate", colors.textMuted)}>
              @{follower.username}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-xl opacity-0 group-hover:opacity-100 transition-opacity",
                colors.hoverBg
              )}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className={cn("rounded-xl", colors.card)}
          >
            <DropdownMenuItem
              onClick={() => handleAction("view-profile", follower)}
              className={cn("rounded-lg", colors.hoverBg)}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAction("message", follower)}
              className={cn("rounded-lg", colors.hoverBg)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAction("share", follower)}
              className={cn("rounded-lg", colors.hoverBg)}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuSeparator className={colors.border} />
            <DropdownMenuItem
              onClick={() => handleAction("remove", follower)}
              className={cn("rounded-lg text-red-600", colors.destructiveHover)}
            >
              <UserX className="w-4 h-4 mr-2" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Badge
          variant={follower.isMusician ? "default" : "secondary"}
          className={cn(
            "text-xs",
            follower.isMusician
              ? "bg-purple-500 text-white"
              : "bg-green-500 text-white"
          )}
        >
          {follower.isMusician ? "Musician" : "Client"}
        </Badge>

        {follower.city && (
          <div className="flex items-center gap-1 text-sm">
            <MapPin className="w-3 h-3 text-blue-500" />
            <span className={colors.textMuted}>{follower.city}</span>
          </div>
        )}

        {follower.instrument && (
          <div className="flex items-center gap-1 text-sm">
            <Music className="w-3 h-3 text-purple-500" />
            <span className={colors.textMuted}>{follower.instrument}</span>
          </div>
        )}
      </div>

      {follower.talentbio && (
        <p className={cn("text-sm line-clamp-2 mb-4 flex-1", colors.textMuted)}>
          {follower.talentbio}
        </p>
      )}

      <div className="flex items-center justify-between pt-4 border-t mt-auto">
        <div className="flex items-center gap-4 text-xs">
          <span className={cn("font-semibold", colors.text)}>
            {follower.followers} followers
          </span>
          {follower.mutualFollowers && follower.mutualFollowers > 0 && (
            <span className={cn("text-blue-500 font-semibold")}>
              {follower.mutualFollowers} mutual
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleAction("message", follower)}
            variant="outline"
            size="sm"
            className={cn("rounded-lg border-2", colors.border)}
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
          <FollowButton
            _id={follower._id}
            variant="default"
            size="sm"
            className={cn(
              "rounded-lg",
              colors.primaryBg,
              colors.primaryBgHover
            )}
          />
        </div>
      </div>
    </div>
  </motion.div>
);

// Responsive Follower Card Renderer
const FollowerCard = ({
  follower,
  colors,
  highlightedFollower,
  handleAction,
  breakpoint,
}: {
  follower: Follower;
  colors: any;
  highlightedFollower: string | null;
  handleAction: (action: string, follower: Follower) => void;
  breakpoint: "mobile" | "tablet" | "desktop";
}) => {
  switch (breakpoint) {
    case "mobile":
      return (
        <MobileFollowerCard
          follower={follower}
          colors={colors}
          highlightedFollower={highlightedFollower}
          handleAction={handleAction}
        />
      );
    case "tablet":
      return (
        <TabletFollowerCard
          follower={follower}
          colors={colors}
          highlightedFollower={highlightedFollower}
          handleAction={handleAction}
        />
      );
    case "desktop":
      return (
        <DesktopFollowerCard
          follower={follower}
          colors={colors}
          highlightedFollower={highlightedFollower}
          handleAction={handleAction}
        />
      );
    default:
      return (
        <DesktopFollowerCard
          follower={follower}
          colors={colors}
          highlightedFollower={highlightedFollower}
          handleAction={handleAction}
        />
      );
  }
};

export default function FollowersPage() {
  const { user: currentUser, isLoading: userLoading } = useCurrentUser();
  const { colors, isDarkMode } = useThemeColors();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "musicians" | "clients">(
    "all"
  );
  const [selectedFollower, setSelectedFollower] = useState<Follower | null>(
    null
  );
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [highlightedFollower, setHighlightedFollower] = useState<string | null>(
    null
  );
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Mutations
  const removeFollower = useMutation(api.controllers.socials.removeFollower);

  // Fetch ALL followers of the current user
  const followersData = useQuery(
    api.controllers.socials.getFollowersWithDetails,
    currentUser ? { userId: currentUser._id } : "skip"
  ) as Follower[] | undefined;

  // Check for notification parameters
  useEffect(() => {
    const newFollower = searchParams.get("new");
    const followerId = searchParams.get("follower");

    if (newFollower === "true" && followerId) {
      setHighlightedFollower(followerId);
      const timer = setTimeout(() => setHighlightedFollower(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Filter followers based on search and filter type
  const filteredFollowers =
    followersData?.filter((follower) => {
      const matchesSearch =
        searchQuery === "" ||
        follower.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        follower.firstname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        follower.lastname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        follower.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        follower.instrument?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        filterType === "all" ||
        (filterType === "musicians" && follower.isMusician) ||
        (filterType === "clients" && follower.isClient);

      return matchesSearch && matchesFilter;
    }) || [];

  // Stats calculations
  const stats = {
    total: followersData?.length || 0,
    musicians: followersData?.filter((f) => f.isMusician).length || 0,
    clients: followersData?.filter((f) => f.isClient).length || 0,
    proUsers: followersData?.filter((f) => f.tier === "pro").length || 0,
  };

  // Handle remove follower
  const handleRemoveFollower = async () => {
    if (!selectedFollower || !currentUser) return;
    try {
      await removeFollower({
        userId: currentUser.clerkId,
        followerId: selectedFollower._id,
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

  const isLoading = userLoading || followersData === undefined;

  if (isLoading) {
    return (
      <div className={cn("min-h-screen pt-24 lg:pt-0", colors.background)}>
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
          {/* Responsive Skeleton */}
          <div className="animate-pulse mb-6 md:mb-8">
            <div className="flex items-center gap-3 md:gap-4">
              <div
                className={cn(
                  "w-12 h-12 md:w-16 md:h-16 rounded-2xl",
                  colors.secondaryBackground
                )}
              ></div>
              <div className="space-y-2 flex-1">
                <div
                  className={cn(
                    "h-6 md:h-8 rounded-lg",
                    colors.secondaryBackground
                  )}
                ></div>
                <div
                  className={cn(
                    "h-4 rounded-lg w-32 md:w-48",
                    colors.secondaryBackground
                  )}
                ></div>
              </div>
            </div>
          </div>

          {/* Responsive Skeleton Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-20 md:h-24 rounded-2xl",
                  colors.secondaryBackground
                )}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen py-4 md:py-8", colors.background)}>
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
        {/* Responsive Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 md:gap-6">
            <div className="flex items-center gap-3 md:gap-4">
              {/* Mobile: Smaller icon */}
              <div className="md:hidden">
                <div
                  className={cn(
                    "p-3 rounded-xl",
                    colors.gradientPrimary,
                    "shadow-lg"
                  )}
                >
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              {/* Tablet/Desktop: Larger icon */}
              <div className="hidden md:block">
                <div
                  className={cn(
                    "p-4 rounded-2xl",
                    colors.gradientPrimary,
                    "shadow-lg"
                  )}
                >
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1
                  className={cn(
                    "text-2xl md:text-3xl font-bold mb-1 md:mb-2",
                    colors.text
                  )}
                >
                  Your Followers
                </h1>
                <p className={cn("text-base md:text-lg", colors.textMuted)}>
                  {stats.total} people following your journey
                  {highlightedFollower && (
                    <span className="text-orange-400 ml-1 md:ml-2">• New!</span>
                  )}
                </p>
              </div>
            </div>

            {/* Responsive Buttons */}
            <div className="flex gap-2 md:gap-3">
              {/* Mobile: Icon buttons */}
              <div className="md:hidden flex gap-2">
                <Button
                  onClick={() => router.push("/social/following")}
                  variant="outline"
                  size="sm"
                  className={cn("rounded-xl border-2 h-10 px-3", colors.border)}
                >
                  <Users className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => router.push("/discover")}
                  size="sm"
                  className={cn(
                    "rounded-xl gap-1 h-10 px-3",
                    colors.primaryBg,
                    colors.primaryBgHover
                  )}
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>
              {/* Tablet/Desktop: Text buttons */}
              <div className="hidden md:flex gap-3">
                <Button
                  onClick={() => router.push("/social/following")}
                  variant="outline"
                  className={cn("rounded-xl border-2", colors.border)}
                >
                  View Following
                </Button>
                <Button
                  onClick={() => router.push("/discover")}
                  className={cn(
                    "rounded-xl gap-2",
                    colors.primaryBg,
                    colors.primaryBgHover
                  )}
                >
                  <UserPlus className="w-4 h-4" />
                  Find More
                </Button>
              </div>
            </div>
          </div>

          {/* Responsive Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-2 md:gap-4 mt-4 md:mt-6"
          >
            {[
              { value: stats.total, label: "Total", color: colors.primaryBg },
              {
                value: stats.musicians,
                label: "Musicians",
                color: "bg-purple-500",
              },
              { value: stats.clients, label: "Clients", color: "bg-green-500" },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className={cn(
                  "px-3 py-2 md:px-4 md:py-3 rounded-xl border-2 flex-1 min-w-[100px]",
                  colors.card,
                  colors.border,
                  "flex items-center gap-2 md:gap-3"
                )}
              >
                <div
                  className={cn(
                    "w-2 h-2 md:w-3 md:h-3 rounded-full",
                    stat.color
                  )}
                ></div>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-lg md:text-2xl font-bold truncate",
                      colors.text
                    )}
                  >
                    {stat.value}
                  </p>
                  <p
                    className={cn(
                      "text-xs md:text-sm truncate",
                      colors.textMuted
                    )}
                  >
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Responsive Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8 border-2 backdrop-blur-sm",
            colors.card,
            colors.border,
            "bg-opacity-50"
          )}
        >
          <div className="flex flex-col gap-4">
            {/* Search Input - Full width on mobile, flex on larger screens */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
              <Input
                type="text"
                placeholder="Search followers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "pl-10 pr-8 md:pl-12 md:pr-10 py-2 md:py-3 w-full rounded-lg md:rounded-xl text-base md:text-lg border-2",
                  colors.background,
                  colors.border,
                  colors.text,
                  "focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                )}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Mobile Filter Toggle */}
            <div className="md:hidden">
              <Button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                variant="outline"
                className="w-full justify-between rounded-lg"
              >
                <span>
                  Filter:{" "}
                  {filterType === "all"
                    ? "All"
                    : filterType === "musicians"
                      ? "Musicians"
                      : "Clients"}
                </span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    showMobileFilters && "rotate-180"
                  )}
                />
              </Button>

              <AnimatePresence>
                {showMobileFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 overflow-hidden"
                  >
                    <div className="flex gap-2 p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
                      {[
                        { key: "all", label: "All" },
                        { key: "musicians", label: "Musicians", icon: Music },
                        { key: "clients", label: "Clients", icon: Building },
                      ].map(({ key, label, icon: Icon }) => (
                        <button
                          key={key}
                          onClick={() => {
                            setFilterType(key as any);
                            setShowMobileFilters(false);
                          }}
                          className={cn(
                            "flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1",
                            filterType === key
                              ? key === "all"
                                ? cn("text-white shadow-sm", colors.primaryBg)
                                : key === "musicians"
                                  ? "bg-purple-500 text-white shadow-sm"
                                  : "bg-green-500 text-white shadow-sm"
                              : cn(colors.textMuted, colors.hoverBg)
                          )}
                        >
                          {Icon && <Icon className="w-3 h-3" />}
                          <span className="hidden xs:inline">{label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop Filter Tabs */}
            <div className="hidden md:flex gap-2 p-1 rounded-xl bg-gray-100 dark:bg-gray-200 w-fit">
              {[
                { key: "all", label: "All" },
                { key: "musicians", label: "Musicians", icon: Music },
                { key: "clients", label: "Clients", icon: Building },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setFilterType(key as any)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                    filterType === key
                      ? key === "all"
                        ? cn("text-white shadow-sm", colors.primaryBg)
                        : key === "musicians"
                          ? "bg-purple-500 text-white shadow-sm"
                          : "bg-green-500 text-white shadow-sm"
                      : cn(colors.textMuted, colors.hoverBg)
                  )}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Responsive Followers Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {filteredFollowers.length === 0 ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "rounded-xl md:rounded-2xl p-8 md:p-12 text-center border-2 border-dashed",
                  colors.card,
                  colors.border
                )}
              >
                <div
                  className={cn(
                    "w-16 h-16 md:w-24 md:h-24 rounded-full mx-auto mb-4 md:mb-6 flex items-center justify-center",
                    colors.secondaryBackground
                  )}
                >
                  <Users
                    className={cn("w-8 h-8 md:w-10 md:h-10", colors.textMuted)}
                  />
                </div>
                <h3
                  className={cn(
                    "text-xl md:text-2xl font-bold mb-3 md:mb-4",
                    colors.text
                  )}
                >
                  {searchQuery
                    ? "No matching followers"
                    : "Your community awaits"}
                </h3>
                <p
                  className={cn(
                    "text-sm md:text-lg mb-6 md:mb-8 max-w-md mx-auto",
                    colors.textMuted
                  )}
                >
                  {searchQuery
                    ? "Try adjusting your search terms to find more followers."
                    : "Share your profile and engage with others to grow your network!"}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => router.push("/profile")}
                    className={cn(
                      "rounded-xl gap-2",
                      colors.primaryBg,
                      colors.primaryBgHover
                    )}
                  >
                    <Share2 className="w-4 h-4" />
                    Share Your Profile
                  </Button>
                )}
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                {filteredFollowers.map((follower, index) => (
                  <FollowerCard
                    key={follower._id}
                    follower={follower}
                    colors={colors}
                    highlightedFollower={highlightedFollower}
                    handleAction={handleAction}
                    breakpoint={
                      typeof window !== "undefined"
                        ? window.innerWidth < 640
                          ? "mobile"
                          : window.innerWidth < 1024
                            ? "tablet"
                            : "desktop"
                        : "desktop"
                    }
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Remove Follower Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent
          className={cn(
            "rounded-xl md:rounded-2xl max-w-[95vw] md:max-w-md",
            colors.card
          )}
        >
          <DialogHeader>
            <DialogTitle className={cn(colors.text)}>
              Remove Follower
            </DialogTitle>
            <DialogDescription className={cn(colors.textMuted)}>
              Are you sure you want to remove {selectedFollower?.firstname} from
              your followers? They won't be notified, but they won't be able to
              see your private content anymore.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowRemoveDialog(false)}
              className={cn("rounded-xl border-2 flex-1", colors.border)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveFollower}
              className="rounded-xl flex-1"
            >
              <UserX className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
