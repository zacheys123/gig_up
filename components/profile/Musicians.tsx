"use client";
import { Doc } from "@/convex/_generated/dataModel";
import { useAllUsers } from "@/hooks/useAllUsers";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useThemeColors } from "@/hooks/useTheme";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import UserListModal from "../modals/UserList";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Music,
  Star,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle,
  Zap,
  Award,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCheckTrial } from "@/hooks/useCheckTrial";

type UserProps = Doc<"users">;

// Simple Card Component
const MusicianCard = React.memo(
  ({
    musician,
    onClick,
    colors,
  }: {
    musician: UserProps;
    onClick: () => void;
    colors: any;
  }) => {
    const calculateAverageRating = (musician: UserProps): number => {
      if (!musician.allreviews || musician?.allreviews?.length === 0)
        return 4.5;
      const total = musician?.allreviews.reduce(
        (sum, review) => sum + (review.rating || 0),
        0
      );
      return Number((total / musician?.allreviews?.length).toFixed(1));
    };

    const rating = calculateAverageRating(musician);
    const tier = musician.tier;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "rounded-2xl border overflow-hidden cursor-pointer group",
          colors.card,
          colors.border,
          "hover:shadow-lg"
        )}
        onClick={onClick}
      >
        {/* Card Header */}
        <div className={cn("p-4 border-b", colors.border)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12 border-2 border-background">
                <AvatarImage
                  src={musician.picture}
                  alt={musician.firstname || "Musician"}
                />
                <AvatarFallback className="bg-gradient-to-r from-amber-400 to-purple-400 text-white font-bold">
                  {musician.firstname?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className={cn("font-semibold", colors.text)}>
                    {musician.firstname} {musician.lastname}
                  </h3>
                  {tier === "pro" && (
                    <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                      PRO
                    </span>
                  )}
                </div>
                {musician.instrument && (
                  <p className={cn("text-sm", colors.textMuted)}>
                    {musician.instrument}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-amber-400 fill-current" />
              <span className={cn("text-sm font-semibold", colors.text)}>
                {rating}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4">
          <div className="space-y-3">
            {/* Location & Experience */}
            <div className="flex items-center justify-between text-sm">
              {musician.city && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span className={cn(colors.textMuted)}>{musician.city}</span>
                </div>
              )}
              {musician.experience && (
                <span className={cn("font-medium", colors.text)}>
                  {musician.experience}
                </span>
              )}
            </div>

            {/* Genres */}
            {musician.genres && (
              <div className="flex flex-wrap gap-1">
                <span className="text-xs bg-gradient-to-r from-amber-500/10 to-purple-500/10 text-amber-600 px-2 py-1 rounded-full border border-amber-500/20">
                  {musician.genres}
                </span>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className={cn(
                "w-full py-3 bg-gradient-to-r from-amber-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all mt-2 active:scale-95"
              )}
            >
              View Profile
            </button>
          </div>
        </div>
      </motion.div>
    );
  }
);

MusicianCard.displayName = "MusicianCard";

const Musicians = () => {
  const { filteredMusicians, nearbyMusicians, isLoading } = useAllUsers();
  const { user: currentUser } = useCurrentUser();
  const router = useRouter();
  const { colors } = useThemeColors();

  const [showNearby, setShowNearByModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "nearby" | "popular" | "premium"
  >("nearby");
  const [modalData, setModalData] = useState<{
    title: string;
    users: UserProps[];
  }>({ title: "", users: [] });

  const handleShowNearby = () => {
    // Fix for nearby musicians - ensure we're passing proper user objects
    const validNearbyUsers = (nearbyMusicians || []).filter(
      (user) => user && typeof user === "object" && user._id
    ) as UserProps[];

    setModalData({
      title: "Musicians in Your Area",
      users: validNearbyUsers,
    });
    setShowNearByModal(true);
  };

  // Helper functions to calculate data from your schema
  const calculateAverageRating = (musician: UserProps): number => {
    if (!musician.allreviews || musician?.allreviews?.length === 0) return 4.5;
    const total = musician?.allreviews.reduce(
      (sum, review) => sum + (review.rating || 0),
      0
    );
    return Number((total / musician?.allreviews?.length).toFixed(1));
  };

  // Enhanced musician data using your actual schema fields
  const enhancedMusicians = filteredMusicians.map((musician) => ({
    ...musician,
    rating: calculateAverageRating(musician),
  }));

  const popularMusicians = enhancedMusicians
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 12);

  const premiumMusicians = enhancedMusicians
    .filter((musician) => musician.tier === "pro")
    .slice(0, 12);

  // Fix for displayed musicians - ensure nearbyMusicians is properly handled
  const getDisplayedMusicians = () => {
    switch (activeFilter) {
      case "all":
        return enhancedMusicians;
      case "nearby":
        // Ensure nearbyMusicians is an array of proper user objects
        return (nearbyMusicians || []).filter(
          (user) => user && typeof user === "object" && user._id
        ) as UserProps[];
      case "popular":
        return popularMusicians;
      case "premium":
        return premiumMusicians;
      default:
        return enhancedMusicians;
    }
  };

  const displayedMusicians = getDisplayedMusicians();
  const { isInGracePeriod } = useCheckTrial();
  if (isLoading) {
    return <MusiciansSkeleton colors={colors} />;
  }

  return (
    <div className={cn("min-h-screen w-full", colors.background)}>
      {/* Simple Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "border-b sticky top-0 z-40 backdrop-blur-md",
          colors.border,
          colors.background
        )}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className={cn("text-2xl font-bold", colors.text)}>
              Professional Musicians
            </h1>
            <button
              onClick={handleShowNearby}
              className={cn(
                "px-4 py-2 text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2",
                colors.hoverBg
              )}
            >
              <MapPin className="w-4 h-4" />
              View Nearby
            </button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Professional Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Award className="w-8 h-8 text-amber-500 mr-3" />
            <h1
              className={cn(
                "text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-purple-600"
              )}
            >
              Professional Musicians
            </h1>
          </div>
          <p className={cn("text-xl max-w-2xl mx-auto mb-6", colors.textMuted)}>
            {currentUser?.isMusician
              ? "Connect with elite artists and grow your network"
              : "Book verified professionals for corporate events, weddings, and private functions"}
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {[
              {
                icon: CheckCircle,
                text: "Verified Profiles",
                color: "text-green-500",
              },
              { icon: Star, text: "Rated & Reviewed", color: "text-amber-500" },
              { icon: Zap, text: "Quick Response", color: "text-blue-500" },
              {
                icon: Award,
                text: "Professional Grade",
                color: "text-purple-500",
              },
            ].map((item, index) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
                className="flex items-center space-x-2"
              >
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span className={cn("text-sm font-medium", colors.text)}>
                  {item.text}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {[
            {
              icon: Users,
              label: "Active Artists",
              value: enhancedMusicians.length,
              trend: "+12%",
            },
            {
              icon: Star,
              label: "Avg. Rating",
              value: "4.8/5",
              trend: "Excellent",
            },
            {
              icon: CheckCircle,
              label: "Verified",
              value: `${Math.round((enhancedMusicians.filter((m) => m.tier === "pro").length / enhancedMusicians.length) * 100)}%`,
              trend: "Quality",
            },
            {
              icon: Zap,
              label: "Response Time",
              value: "< 2h",
              trend: "Fast",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className={cn(
                "rounded-2xl p-6 border-2 transition-all hover:scale-105",
                colors.card,
                colors.border,
                "hover:shadow-xl"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={cn(
                    "p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-purple-500/10"
                  )}
                >
                  <stat.icon className="w-6 h-6 text-amber-500" />
                </div>
                <span
                  className={cn(
                    "text-sm font-semibold px-2 py-1 rounded-full",
                    stat.trend === "Excellent" ||
                      stat.trend === "Quality" ||
                      stat.trend === "Fast"
                      ? "bg-green-500/20 text-green-600"
                      : "bg-blue-500/20 text-blue-600"
                  )}
                >
                  {stat.trend}
                </span>
              </div>
              <p className={cn("text-2xl font-bold mb-1", colors.text)}>
                {stat.value}
              </p>
              <p className={cn("text-sm", colors.textMuted)}>{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Filter Tabs */}
          <div className="flex items-center justify-between mb-8">
            <div
              className={cn(
                "flex space-x-1 rounded-2xl p-1 border",
                colors.border
              )}
            >
              {(() => {
                const filters =
                  isInGracePeriod || currentUser?.tier === "pro"
                    ? [
                        { key: "all", label: "All Artists" },
                        { key: "nearby", label: "Nearby" },
                        { key: "popular", label: "Top Rated" },
                        { key: "premium", label: "Premium" },
                      ]
                    : [
                        { key: "nearby", label: "Nearby" },
                        { key: "premium", label: "Premium" },
                      ];

                return filters.map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key as any)}
                    className={cn(
                      "px-6 py-3 rounded-xl text-sm font-semibold transition-all",
                      activeFilter === filter.key
                        ? "bg-gradient-to-r from-amber-500 to-purple-500 text-white shadow-lg"
                        : cn(colors.text, colors.hoverBg)
                    )}
                  >
                    {filter.label}
                  </button>
                ));
              })()}
            </div>
          </div>

          {/* Musicians Grid */}
          {displayedMusicians.length === 0 ? (
            <div className="text-center py-16">
              <Music
                className={cn("w-20 h-20 mx-auto mb-4", colors.textMuted)}
              />
              <h3 className={cn("text-2xl font-bold mb-3", colors.text)}>
                No Artists Found
              </h3>
              {/* <p className={cn("text-lg max-w-md mx-auto", colors.textMuted)}>
                {activeFilter === "nearby"
                  ? "No professional musicians found in your area. Try expanding your search radius."
                  : "No artists match your current criteria. Try different filters."}
              </p> */}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedMusicians.map((musician) => (
                <MusicianCard
                  key={musician._id}
                  musician={musician}
                  onClick={() => router.push(`/search/${musician.username}`)}
                  colors={colors}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Professional CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={cn(
            "rounded-3xl p-12 mt-16 text-center bg-gradient-to-br from-amber-500/5 via-purple-500/5 to-blue-500/5 border",
            colors.border
          )}
        >
          <div className="max-w-2xl mx-auto">
            <TrendingUp className={cn("w-16 h-16 mx-auto mb-6", colors.text)} />
            <h2 className={cn("text-3xl font-bold mb-4", colors.text)}>
              {currentUser?.isClient
                ? "Ready to Elevate Your Event?"
                : "Ready to Showcase Your Talent?"}
            </h2>
            <p className={cn("text-xl mb-8", colors.textMuted)}>
              {currentUser?.isClient
                ? "Join Fortune 500 companies and luxury venues that trust our professional musicians"
                : "Join our elite network of professional musicians performing for top clients worldwide"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {currentUser?.isMusician ? (
                <button
                  onClick={() => router.push("/profile/setup")}
                  className={cn(
                    "px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-2xl transition-all text-lg"
                  )}
                >
                  Apply as Professional
                </button>
              ) : (
                <button
                  onClick={() => router.push("/booking")}
                  className={cn(
                    "px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-2xl transition-all text-lg"
                  )}
                >
                  Book Professional Service
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <UserListModal
        isOpen={showNearby}
        onClose={() => setShowNearByModal(false)}
        title={modalData.title}
        users={modalData.users}
        dep="musician"
      />
    </div>
  );
};

// Skeleton component
const MusiciansSkeleton = ({ colors }: { colors: any }) => (
  <div className={cn("min-h-screen w-full", colors.background)}>
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="text-center mb-12">
        <div
          className={cn(
            "h-12 w-96 mx-auto rounded-2xl animate-pulse mb-4",
            colors.backgroundMuted
          )}
        />
        <div
          className={cn(
            "h-6 w-128 mx-auto rounded-2xl animate-pulse",
            colors.backgroundMuted
          )}
        />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "rounded-2xl p-6 animate-pulse",
              colors.backgroundMuted
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn("w-12 h-12 rounded-xl", colors.background)} />
              <div className={cn("w-16 h-6 rounded-full", colors.background)} />
            </div>
            <div className={cn("h-8 w-20 rounded mb-2", colors.background)} />
            <div className={cn("h-4 w-24 rounded", colors.background)} />
          </div>
        ))}
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={cn("rounded-2xl border animate-pulse", colors.border)}
          >
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full",
                      colors.backgroundMuted
                    )}
                  />
                  <div className="space-y-2">
                    <div
                      className={cn("h-4 w-24 rounded", colors.backgroundMuted)}
                    />
                    <div
                      className={cn("h-3 w-16 rounded", colors.backgroundMuted)}
                    />
                  </div>
                </div>
                <div
                  className={cn("h-4 w-8 rounded", colors.backgroundMuted)}
                />
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div
                className={cn("h-4 w-full rounded", colors.backgroundMuted)}
              />
              <div
                className={cn("h-3 w-3/4 rounded", colors.backgroundMuted)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Musicians;
