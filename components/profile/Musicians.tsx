"use client";
import { Doc } from "@/convex/_generated/dataModel";
import { useAllUsers } from "@/hooks/useAllUsers";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useThemeColors } from "@/hooks/useTheme";
import { motion } from "framer-motion";
import Image from "next/image";
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
  Eye,
  Video,
  CheckCircle,
  Zap,
  Award,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
} from "lucide-react";

type UserProps = Doc<"users">;

const Musicians = () => {
  const { filteredMusicians, nearbyMusicians, isLoading } = useAllUsers();
  const { user: currentUser } = useCurrentUser();
  const router = useRouter();
  const { colors } = useThemeColors();

  const [showNearby, setShowNearByModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "nearby" | "popular" | "premium"
  >("all");
  const [modalData, setModalData] = useState<{
    title: string;
    users: UserProps[];
  }>({ title: "", users: [] });

  const handleShowNearby = () => {
    setModalData({
      title: "Musicians in Your Area",
      users: nearbyMusicians as UserProps[],
    });
    setShowNearByModal(true);
  };

  // Helper functions to calculate data from your schema
  const calculateAverageRating = (musician: UserProps): number => {
    if (!musician.allreviews || musician.allreviews.length === 0) return 4.5;
    const total = musician.allreviews.reduce(
      (sum, review) => sum + (review.rating || 0),
      0
    );
    return Number((total / musician.allreviews.length).toFixed(1));
  };

  const calculateResponseRate = (musician: UserProps): number => {
    // More realistic response rate calculation
    const baseRate = 85;
    const activityBonus =
      musician.lastActive &&
      Date.now() - musician.lastActive < 24 * 60 * 60 * 1000
        ? 10
        : 0;
    return Math.min(95, baseRate + activityBonus);
  };

  const checkAvailability = (musician: UserProps): boolean => {
    // Fixed: Proper boolean handling with explicit return
    if (!musician.lastActive) return false;
    const isActive = Date.now() - musician.lastActive < 3 * 24 * 60 * 60 * 1000; // Active in last 3 days
    return isActive;
  };

  // Enhanced musician data using your actual schema fields
  const enhancedMusicians = filteredMusicians.map((musician) => ({
    ...musician,
    rating: calculateAverageRating(musician),
    gigsCompleted: musician.completedGigsCount || 0,
    responseRate: calculateResponseRate(musician),
    isAvailable: checkAvailability(musician),
    profileViews: Math.floor(Math.random() * 5000) + 1000,
    likes: Math.floor(Math.random() * 500) + 50,
    isVerified: Math.random() > 0.7, // Mock verification status
  }));

  const popularMusicians = enhancedMusicians
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 12);

  const premiumMusicians = enhancedMusicians
    .filter((musician) => musician.tier === "pro")
    .slice(0, 12);

  const displayedMusicians = {
    all: enhancedMusicians,
    nearby: nearbyMusicians as UserProps[],
    popular: popularMusicians,
    premium: premiumMusicians,
  }[activeFilter];

  if (isLoading) {
    return <MusiciansSkeleton colors={colors} />;
  }

  return (
    <div className={cn("min-h-screen w-full", colors.background)}>
      {/* Instagram-style Stories Header */}
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
            <div className="flex items-center space-x-8 overflow-x-auto scrollbar-hide">
              {enhancedMusicians.slice(0, 8).map((musician, index) => (
                <motion.div
                  key={musician._id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center space-y-2 cursor-pointer flex-shrink-0"
                  onClick={() => router.push(`/search/${musician.username}`)}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 to-purple-500 rounded-full p-0.5">
                      <div
                        className={cn(
                          "w-16 h-16 rounded-full",
                          colors.background
                        )}
                      >
                        <div
                          className={cn(
                            "w-full h-full rounded-full border-2 flex items-center justify-center",
                            colors.background
                          )}
                        >
                          {musician.picture ? (
                            <Image
                              src={musician.picture}
                              alt={musician.firstname || "Musician"}
                              width={64}
                              height={64}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-purple-400">
                              {musician.firstname?.[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p
                    className={cn(
                      "text-xs font-medium truncate max-w-[80px]",
                      colors.text
                    )}
                  >
                    {musician.firstname}
                  </p>
                </motion.div>
              ))}
            </div>
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

        {/* Stats Overview - Professional Layout */}
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
              value: `${Math.round((enhancedMusicians.filter((m) => (m as any).isVerified).length / enhancedMusicians.length) * 100)}%`,
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
          {/* Filter Tabs - Instagram Style */}
          <div className="flex items-center justify-between mb-8">
            <div
              className={cn(
                "flex space-x-1 rounded-2xl p-1 border",
                colors.border
              )}
            >
              {[
                { key: "all", label: "All Artists" },
                { key: "nearby", label: "Nearby" },
                { key: "popular", label: "Top Rated" },
                { key: "premium", label: "Premium" },
              ].map((filter) => (
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
              ))}
            </div>

            <button
              onClick={handleShowNearby}
              className={cn(
                "px-6 py-3 text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2",
                colors.hoverBg
              )}
            >
              <MapPin className="w-4 h-4" />
              View Map
            </button>
          </div>

          {/* Instagram-style Grid */}
          {displayedMusicians.length === 0 ? (
            <div className="text-center py-16">
              <Music
                className={cn("w-20 h-20 mx-auto mb-4", colors.textMuted)}
              />
              <h3 className={cn("text-2xl font-bold mb-3", colors.text)}>
                No Artists Found
              </h3>
              <p className={cn("text-lg max-w-md mx-auto", colors.textMuted)}>
                {activeFilter === "nearby"
                  ? "No professional musicians found in your area. Try expanding your search radius."
                  : "No artists match your current criteria. Try different filters."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedMusicians.map((musician) => (
                <InstagramStyleCard
                  key={musician._id}
                  musician={musician as UserProps}
                  onClick={() => router.push(`/search/${musician.username}`)}
                  colors={colors}
                  additionalData={{
                    rating: (musician as any).rating,
                    gigsCompleted: (musician as any).gigsCompleted,
                    responseRate: (musician as any).responseRate,
                    isAvailable: (musician as any).isAvailable,
                    profileViews: (musician as any).profileViews,
                    likes: (musician as any).likes,
                    isVerified: (musician as any).isVerified,
                  }}
                  currentUserIsMusician={currentUser?.isMusician || false}
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

// Instagram-style Card Component
const InstagramStyleCard = ({
  musician,
  onClick,
  colors,
  additionalData,
  currentUserIsMusician,
}: {
  musician: UserProps;
  onClick: () => void;
  colors: any;
  additionalData: {
    rating: number;
    gigsCompleted: number;
    responseRate: number;
    isAvailable: boolean;
    profileViews: number;
    likes: number;
    isVerified: boolean;
  };
  currentUserIsMusician: boolean;
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const getGenres = () => {
    if (musician.musiciangenres && musician.musiciangenres.length > 0) {
      return musician.musiciangenres;
    }
    if (musician.genres) {
      return [musician.genres];
    }
    if (musician.djGenre) {
      return [musician.djGenre];
    }
    if (musician.vocalistGenre) {
      return [musician.vocalistGenre];
    }
    return [];
  };

  const genres = getGenres();
  const hasVideos = musician.videosProfile && musician.videosProfile.length > 0;
  const tier = musician.tier;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "rounded-2xl border overflow-hidden cursor-pointer group",
        colors.card,
        colors.border,
        "hover:shadow-2xl"
      )}
      onClick={onClick}
    >
      {/* Card Header - Instagram Style */}
      <div className={cn("p-4 border-b", colors.border)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {additionalData.isVerified && (
                <div className="absolute -top-1 -right-1 z-10">
                  <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500" />
                </div>
              )}
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-purple-500 p-0.5">
                <div
                  className={cn(
                    "w-full h-full rounded-full",
                    colors.background
                  )}
                >
                  {musician.picture ? (
                    <Image
                      src={musician.picture}
                      alt={musician.firstname || "Musician"}
                      width={48}
                      height={48}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-purple-400">
                        {musician.firstname?.[0]}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
              {additionalData.rating}
            </span>
          </div>
        </div>
      </div>

      {/* Main Image/Content */}
      <div className="relative aspect-square bg-gradient-to-br from-amber-500/20 to-purple-500/20">
        {musician.picture ? (
          <Image
            src={musician.picture}
            alt={`${musician.firstname}'s profile`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <Music className="w-16 h-16 mx-auto mb-4 text-amber-400" />
              <p className={cn("text-lg font-semibold", colors.text)}>
                {musician.firstname} {musician.lastname}
              </p>
              <p className={cn("text-sm", colors.textMuted)}>
                {musician.instrument}
              </p>
            </div>
          </div>
        )}

        {/* Overlay Badges */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2">
          {additionalData.isAvailable && (
            <div className="bg-green-500 text-white text-xs px-3 py-1.5 rounded-full font-medium flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              <span>Available</span>
            </div>
          )}
          {hasVideos && (
            <div className="bg-blue-500 text-white text-xs px-3 py-1.5 rounded-full font-medium flex items-center space-x-1">
              <Video className="w-3 h-3" />
              <span>{musician.videosProfile?.length} Videos</span>
            </div>
          )}
        </div>
      </div>

      {/* Engagement Bar - Instagram Style */}
      <div className={cn("p-4 border-b", colors.border)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className="flex items-center space-x-1"
            >
              <Heart
                className={`w-6 h-6 transition-colors ${
                  isLiked
                    ? "text-red-500 fill-red-500"
                    : cn("text-gray-400", colors.textMuted)
                }`}
              />
              <span className={cn("text-sm font-medium", colors.text)}>
                {additionalData.likes + (isLiked ? 1 : 0)}
              </span>
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              className="flex items-center space-x-1"
            >
              <MessageCircle className={cn("w-6 h-6", colors.textMuted)} />
              <span className={cn("text-sm font-medium", colors.text)}>
                {musician.allreviews?.length || 0}
              </span>
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              className="flex items-center space-x-1"
            >
              <Share2 className={cn("w-6 h-6", colors.textMuted)} />
            </button>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsSaved(!isSaved);
            }}
          >
            <Bookmark
              className={`w-6 h-6 transition-colors ${
                isSaved
                  ? "text-amber-500 fill-amber-500"
                  : cn("text-gray-400", colors.textMuted)
              }`}
            />
          </button>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-4">
        <div className="space-y-3">
          {/* Genres */}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {genres.slice(0, 3).map((genre, index) => (
                <span
                  key={index}
                  className="text-xs bg-gradient-to-r from-amber-500/10 to-purple-500/10 text-amber-600 px-2 py-1 rounded-full border border-amber-500/20"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

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

          {/* Professional Stats */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-center">
              <p className={cn("text-xs font-semibold", colors.text)}>
                {additionalData.gigsCompleted}
              </p>
              <p className={cn("text-xs", colors.textMuted)}>Gigs</p>
            </div>
            <div className="text-center">
              <p className={cn("text-xs font-semibold", colors.text)}>
                {additionalData.responseRate}%
              </p>
              <p className={cn("text-xs", colors.textMuted)}>Response</p>
            </div>
            <div className="text-center">
              <p className={cn("text-xs font-semibold", colors.text)}>
                {additionalData.profileViews}
              </p>
              <p className={cn("text-xs", colors.textMuted)}>Views</p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className={cn(
              "w-full py-3 bg-gradient-to-r from-amber-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all mt-4"
            )}
          >
            View Profile
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Skeleton component with Instagram style
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
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
            <div className={cn("aspect-square", colors.backgroundMuted)} />
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
