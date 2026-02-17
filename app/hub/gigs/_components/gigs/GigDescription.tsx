// components/gigs/GigDescription.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Tag,
  Users,
  Star,
  CheckCircle,
  Music,
  Mic,
  Headphones,
  Globe,
  TrendingUp,
  UserCheck,
  Lock,
  Sparkles,
  Bookmark,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getInterestWindowStatus } from "@/utils";
import { CountdownTimer } from "./CountDown";

// Types (moved from AllGigs)
interface PerformingMember {
  userId: Id<"users">;
  name: string;
  role: string;
  instrument: string;
}

interface BandApplication {
  bandId: Id<"bands">;
  appliedAt: number;
  appliedBy: Id<"users">;
  performingMembers: PerformingMember[];
  status?: string;
  proposedFee?: number;
  notes?: string;
  bookedAt?: number;
  contractSigned?: boolean;
  agreedFee?: number;
  shortlistedAt?: number;
  shortlistNotes?: string;
}

interface BandRole {
  role: string;
  maxSlots: number;
  filledSlots: number;
  applicants: Id<"users">[];
  bookedUsers: Id<"users">[];
  requiredSkills?: string[];
  description?: string;
  isLocked?: boolean;
  price?: number;
  currency?: string;
  negotiable?: boolean;
  bookedPrice?: number;
}

export interface GigDescriptionProps {
  gig: {
    _id: Id<"gigs">;
    title: string;
    description?: string;
    location?: string;
    date: number;
    time: {
      start: string;
      end: string;
      durationFrom: string;
      durationTo: string;
    };
    price?: number;
    logo: string;
    postedBy: Id<"users">;
    isClientBand?: boolean;
    isTaken?: boolean;
    isPending?: boolean;
    isActive?: boolean;
    interestedUsers?: Id<"users">[];
    bookCount?: BandApplication[];
    maxSlots?: number;
    tags?: string[];
    category?: string;
    bussinesscat?: string;
    negotiable?: boolean;
    paymentStatus?: string;
    viewCount?: Id<"users">[];
    bookingHistory?: any[];
    acceptInterestStartTime?: number; // Changed to number for timestamp
    acceptInterestEndTime?: number;
    bandCategory?: BandRole[];
    createdAt: number;
    updatedAt: number;
    font?: string;
    fontColor?: string;
    backgroundColor?: string;
    fontFamily?: string;
    currency?: string;
    mcType?: string;
    mcLanguages?: string;
    djGenre?: string;
    vocalistGenre?: string[];
    requirements?: string[];
    benefits?: string[];
    appliedUsers?: Id<"users">[];
  } | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: Id<"users">;
  user?: any;
  isSaved?: boolean;
  isFavorite?: boolean;
  onSave?: () => Promise<void>;
  onFavorite?: () => Promise<void>;
}

type myGig = {
  acceptInterestStartTime?: number;
  acceptInterestEndTime?: number;
};

// Interest Window Badge Component with Countdown
// First, update the InterestWindowBadge component with proper time calculations
const InterestWindowBadge = ({
  gig,
}: {
  gig: NonNullable<GigDescriptionProps["gig"]>;
}) => {
  const status = getInterestWindowStatus(gig as myGig);
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });
  const [mounted, setMounted] = useState(false);

  // Parse the start date safely
  const startDate = gig.acceptInterestStartTime
    ? new Date(gig.acceptInterestStartTime)
    : null;
  const endDate = gig.acceptInterestEndTime
    ? new Date(gig.acceptInterestEndTime)
    : null;

  // Update countdown every second
  useEffect(() => {
    setMounted(true);

    if (status.status !== "not_open" || !startDate) {
      return;
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = startDate.getTime() - now;

      if (distance < 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0,
        });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        total: distance,
      });
    };

    // Update immediately
    updateCountdown();

    // Then update every second
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [status.status, startDate]);

  const getBadgeProps = () => {
    switch (status.status) {
      case "not_open":
        return {
          variant: "outline" as const,
          className:
            "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
          icon: Calendar,
        };
      case "closed":
        return {
          variant: "outline" as const,
          className:
            "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
          icon: Lock,
        };
      case "open":
        return {
          variant: "outline" as const,
          className:
            "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
          icon: Clock,
        };
      default:
        return {
          variant: "outline" as const,
          className: "bg-gray-50 text-gray-600 border-gray-200",
          icon: Clock,
        };
    }
  };

  const badgeProps = getBadgeProps();
  const Icon = badgeProps.icon;

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return "Not set";
    try {
      return new Date(timestamp).toLocaleString();
    } catch (error) {
      return "Invalid date";
    }
  };

  if (!status.hasWindow) return null;

  // Format number with leading zero
  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl border bg-gray-800/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          variant={badgeProps.variant}
          className={cn(
            "inline-flex items-center gap-1 text-sm font-medium px-3 py-1.5",
            badgeProps.className,
          )}
        >
          <Icon className="w-4 h-4" />
          <span>{status.message}</span>
        </Badge>
      </div>

      {/* Live Countdown with full breakdown */}
      {status.status === "not_open" && startDate && mounted && (
        <div className="relative overflow-hidden mt-2">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 animate-gradient-x" />

          {/* Main container */}
          <div className="relative p-4 rounded-xl border border-blue-500/30 bg-gray-900/80 backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-ping" />
                </div>
                <div>
                  <span className="text-sm font-medium text-blue-300">
                    Gig Closed Opens In
                  </span>
                  <p className="text-xs text-blue-400/70">Be ready to apply</p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="border-blue-500/30 bg-blue-500/10 text-blue-300"
              >
                <Calendar className="w-3 h-3 mr-1" />
                {startDate.toLocaleDateString()}
              </Badge>
            </div>

            {/* Countdown Grid */}
            <div className="grid grid-cols-4 gap-2 mb-4 z-50">
              {/* Days */}
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-mono">
                  {formatNumber(timeRemaining.days)}
                </div>
                <div className="text-xs text-blue-300/70 mt-1">Days</div>
              </div>

              {/* Hours */}
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-mono">
                  {formatNumber(timeRemaining.hours)}
                </div>
                <div className="text-xs text-blue-300/70 mt-1">Hours</div>
              </div>

              {/* Minutes */}
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-mono">
                  {formatNumber(timeRemaining.minutes)}
                </div>
                <div className="text-xs text-blue-300/70 mt-1">Minutes</div>
              </div>

              {/* Seconds */}
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-mono">
                  {formatNumber(timeRemaining.seconds)}
                </div>
                <div className="text-xs text-blue-300/70 mt-1">Seconds</div>
              </div>
            </div>

            {/* Progress Bar */}
            {timeRemaining.total > 0 && (
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-xs">
                  <span className="text-blue-300/70">Time remaining</span>
                  <span className="text-blue-300 font-mono">
                    {timeRemaining.days}d {timeRemaining.hours}h{" "}
                    {timeRemaining.minutes}m {timeRemaining.seconds}s
                  </span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{
                      duration: timeRemaining.total / 1000,
                      ease: "linear",
                    }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  />
                </div>
              </div>
            )}

            {/* Exact Time Footer */}
            <div className="flex items-center justify-between text-xs border-t border-blue-500/20 pt-3">
              <div className="flex items-center gap-2 text-blue-300/60">
                <Clock className="w-3 h-3" />
                <span>Opens exactly at:</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-purple-500/30 bg-purple-500/10 text-purple-300"
                >
                  {startDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-blue-500/30 bg-blue-500/10 text-blue-300"
                >
                  {startDate.toLocaleDateString()}
                </Badge>
              </div>
            </div>

            {/* Floating particles */}
            <div className="absolute -top-2 -right-2 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -bottom-2 -left-2 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-700" />
          </div>
        </div>
      )}

      {/* Detailed dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 text-sm">
        {gig.acceptInterestStartTime && (
          <div>
            <p className="text-gray-400">Opens</p>
            <p className="font-medium text-gray-200">
              {formatDate(gig.acceptInterestStartTime)}
            </p>
          </div>
        )}
        {gig.acceptInterestEndTime && (
          <div>
            <p className="text-gray-400">Closes</p>
            <p className="font-medium text-gray-200">
              {formatDate(gig.acceptInterestEndTime)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const GigDescription: React.FC<GigDescriptionProps> = ({
  gig,
  isOpen,
  onClose,
  currentUserId,
  user,
  isSaved: propIsSaved,
  isFavorite: propIsFavorite,
  onSave,
  onFavorite,
}) => {
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);

  // Convex mutations (fallback if not provided as props)
  const saveGigMutation = useMutation(api.controllers.gigs.saveGig);
  const favoriteGigMutation = useMutation(api.controllers.gigs.favoriteGig);
  const interestWindowStatus = getInterestWindowStatus(gig as myGig);
  const isNotOpen =
    interestWindowStatus.hasWindow &&
    interestWindowStatus.status === "not_open";

  if (!gig || !isOpen) return null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleSave = async () => {
    if (!currentUserId) {
      toast.error("Please sign in to save gigs");
      return;
    }

    if (onSave) {
      await onSave();
      return;
    }

    setLoading(true);
    try {
      await saveGigMutation({
        userId: currentUserId,
        gigId: gig._id,
      });
      toast.success(propIsSaved ? "Removed from saved" : "Gig saved!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save gig");
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!currentUserId) {
      toast.error("Please sign in to favorite gigs");
      return;
    }

    if (onFavorite) {
      await onFavorite();
      return;
    }

    setLoading(true);
    try {
      await favoriteGigMutation({
        userId: currentUserId,
        gigId: gig._id,
      });
      toast.success(
        propIsFavorite ? "Removed from favorites" : "Added to favorites!",
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to favorite gig");
    } finally {
      setLoading(false);
    }
  };

  const getSpecializationIcon = () => {
    if (gig.mcType) return <Mic className="w-4 h-4" />;
    if (gig.djGenre) return <Headphones className="w-4 h-4" />;
    if (gig.vocalistGenre?.length && gig.vocalistGenre.length > 0)
      return <Music className="w-4 h-4" />;
    return <Users className="w-4 h-4" />;
  };

  const calculateBookingStats = () => {
    const views = gig.viewCount?.length || 0;
    const bookings = gig.bookCount?.length || 0;
    const bookingRate = views > 0 ? ((bookings / views) * 100).toFixed(1) : "0";

    return {
      views,
      bookings,
      bookingRate,
      interested: gig.interestedUsers?.length || 0,
    };
  };

  const stats = calculateBookingStats();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className={cn(
              "relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700",
              isNotOpen && "relative",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Watermark for not-open gigs */}
            {/* Watermark for not-open gigs - Now at the bottom layer */}
            {isNotOpen && (
              <>
                {/* Background tint - lowest layer */}
                <div className="absolute inset-0 bg-blue-900/5 pointer-events-none z-0" />

                {/* Watermark text - just above background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                  <div className="absolute -right-20 top-1/3 -translate-y-1/2 rotate-45">
                    <div className="bg-blue-500/20 text-blue-300 text-6xl font-bold whitespace-nowrap px-20 py-4 border-4 border-blue-500/30 backdrop-blur-sm opacity-30">
                      NOT YET OPEN
                    </div>
                  </div>
                  <div className="absolute -left-20 bottom-1/3 translate-y-1/2 -rotate-45">
                    <div className="bg-blue-500/80 text-blue-300 text-6xl font-bold whitespace-nowrap px-20 py-4 border-4 border-blue-500/30 backdrop-blur-sm opacity-30">
                      COMING SOON
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-30 p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
            >
              <X className="w-5 h-5 text-gray-300" />
            </button>

            {/* Header with gradient */}
            <div className="relative p-4 md:p-6 border-b border-gray-700">
              <div
                className="absolute inset-0 rounded-t-2xl"
                style={{
                  background: gig.backgroundColor
                    ? gig.backgroundColor
                    : "linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)",
                }}
              />

              <div className="relative">
                {/* Title and Price Row */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      {/* Logo/Avatar */}
                      <Avatar className="w-12 h-12 rounded-lg border border-gray-600 flex-shrink-0">
                        {gig.logo ? (
                          <AvatarImage src={gig.logo} alt="Gig logo" />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                            {gig.title?.charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-1 truncate">
                          {gig.title}
                        </h2>

                        {/* Status badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge
                            className={cn(
                              "px-3 py-1 text-sm font-medium",
                              gig.isTaken
                                ? "bg-green-500/20 text-green-300 border-green-500/30"
                                : gig.isPending
                                  ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                                  : "bg-blue-500/20 text-blue-300 border-blue-500/30",
                            )}
                          >
                            {gig.isTaken
                              ? "Booked"
                              : gig.isPending
                                ? "Pending"
                                : "Available"}
                          </Badge>

                          {gig.category && (
                            <Badge
                              variant="outline"
                              className="border-gray-600 text-gray-300"
                            >
                              {gig.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="md:text-right flex-shrink-0">
                    <div className="text-2xl md:text-3xl font-bold text-white">
                      {gig.price
                        ? `${gig.currency || "$"}${gig.price.toLocaleString()}`
                        : "Contact for price"}
                    </div>
                    {gig.negotiable && (
                      <span className="text-sm text-gray-400">
                        (Negotiable)
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0 text-sm" />
                    <span className="truncate">{gig.location || "Remote"}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0 font-mono text-sm" />
                    <span className="truncate">{formatDate(gig.date)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {gig?.time && (
                      <span className="truncate font-mono text-sm">
                        {gig.time.start}
                        {gig.time.durationFrom} - {gig.time.end}
                        {gig.time.durationTo}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-gray-300">
                    <Globe className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span className="truncate">{gig.bussinesscat}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="p-4 md:p-6 space-y-6">
              {/* Interest Window Badge with Countdown */}
              <InterestWindowBadge gig={gig} />

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="text-sm text-gray-400">Views</div>
                    <div className="font-semibold">{stats.views}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <UserCheck className="w-4 h-4 text-green-400" />
                  <div>
                    <div className="text-sm text-gray-400">Bookings</div>
                    <div className="font-semibold">{stats.bookings}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <div>
                    <div className="text-sm text-gray-400">Booking Rate</div>
                    <div className="font-semibold">{stats.bookingRate}%</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-sm text-gray-400">Interested</div>
                    <div className="font-semibold">{stats.interested}</div>
                  </div>
                </div>
              </div>

              {/* Rest of your content sections (Description, Requirements, Benefits, etc.) remain the same */}
              {/* ... */}
            </div>

            {/* Footer with action buttons */}
            <div className="p-4 md:p-6 border-t border-gray-700 bg-gray-900/50">
              <div className="flex flex-col sm:flex-row gap-3 justify-end items-center">
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                    disabled={!userId || loading}
                    className="flex-1 sm:flex-none border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <Bookmark
                      className={`w-4 h-4 mr-2 ${propIsSaved ? "fill-yellow-500 text-yellow-500" : ""}`}
                    />
                    {propIsSaved ? "Saved" : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFavorite}
                    disabled={!userId || loading}
                    className="flex-1 sm:flex-none border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <Heart
                      className={`w-4 h-4 mr-2 ${propIsFavorite ? "fill-red-500 text-red-500" : ""}`}
                    />
                    {propIsFavorite ? "Favorited" : "Favorite"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 sm:flex-none border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GigDescription;
