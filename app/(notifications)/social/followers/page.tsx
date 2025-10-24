// app/social/followers/page.tsx
"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

// Skeleton Components
import FollowersHeaderSkeleton from "../_components/skeletons/HeaderSkeleton";

import FollowersHeader from "../_components/FollowersHeader";
import FollowersStats from "../_components/FollowerSats";
import FollowersSearch from "../_components/FollowerSearch";
import EmptyFollowersState from "../_components/EmptyFollowerSate";
import FollowerCard from "../_components/FollowersCard";
import RemoveFollowerDialog from "../_components/RemoveFollowerDialog";
import FollowersStatsSkeleton from "../_components/skeletons/StatsSkeleton";
import FollowersSearchSkeleton from "../_components/skeletons/SearchSkeleton";
import FollowersGridSkeleton from "../_components/skeletons/GridSkeleton";
import { useChat } from "@/app/context/ChatContext";

// Actual Components

interface Follower {
  _id: any;
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

export default function FollowersPage() {
  const { user: currentUser, isLoading: userLoading } = useCurrentUser();
  const { colors } = useThemeColors();
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

  const removeFollower = useMutation(api.controllers.socials.removeFollower);

  const followersData = useQuery(
    api.controllers.socials.getFollowersWithDetails,
    currentUser ? { userId: currentUser._id } : "skip"
  ) as Follower[] | undefined;

  useEffect(() => {
    const newFollower = searchParams.get("new");
    const followerId = searchParams.get("follower");

    if (newFollower === "true" && followerId) {
      setHighlightedFollower(followerId);
      const timer = setTimeout(() => setHighlightedFollower(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

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

  const stats = {
    total: followersData?.length || 0,
    musicians: followersData?.filter((f) => f.isMusician).length || 0,
    clients: followersData?.filter((f) => f.isClient).length || 0,
    proUsers: followersData?.filter((f) => f.tier === "pro").length || 0,
  };

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

  const handleAction = (action: string, follower: Follower) => {
    setSelectedFollower(follower);
    switch (action) {
      case "view-profile":
        router.push(`/search/${follower.username}`);
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
      case "message":
        // Handle message action - this would open a chat
        toast.info(`Messaging ${follower.firstname}`);
        break;
    }
  };

  const isLoading = userLoading || followersData === undefined;

  if (isLoading) {
    return (
      <div className={cn("min-h-screen py-4 md:py-8", colors.background)}>
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
          <FollowersHeaderSkeleton colors={colors} />
          <FollowersStatsSkeleton colors={colors} />
          <FollowersSearchSkeleton colors={colors} />
          <FollowersGridSkeleton colors={colors} count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen py-4 md:py-8", colors.background)}>
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
        <FollowersHeader
          stats={stats}
          colors={colors}
          highlightedFollower={highlightedFollower}
          onViewFollowing={() => router.push("/social/following")}
          onDiscover={() => router.push("/discover")}
        />

        <FollowersStats stats={stats} colors={colors} />

        <FollowersSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterType={filterType}
          setFilterType={setFilterType}
          showMobileFilters={showMobileFilters}
          setShowMobileFilters={setShowMobileFilters}
          colors={colors}
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {filteredFollowers.length === 0 ? (
              <EmptyFollowersState
                searchQuery={searchQuery}
                colors={colors}
                onShareProfile={() => router.push("/profile")}
              />
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

      <RemoveFollowerDialog
        open={showRemoveDialog}
        onOpenChange={setShowRemoveDialog}
        follower={selectedFollower}
        onRemove={handleRemoveFollower}
        colors={colors}
      />
    </div>
  );
}
