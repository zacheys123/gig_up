// components/gigs/GigDescription.tsx
import React, { useState } from "react";
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
    acceptInterestStartTime?: string | number | Date;
    acceptInterestEndTime?: string | number | Date;
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
// Interest Window Badge Component (integrated)
const InterestWindowBadge = ({
  gig,
}: {
  gig: NonNullable<GigDescriptionProps["gig"]>;
}) => {
  const status = getInterestWindowStatus(gig as myGig);

  if (!status.hasWindow) return null;

  // Parse the start date safely
  const startDate = gig.acceptInterestStartTime
    ? new Date(gig.acceptInterestStartTime)
    : null;

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

  const formatDate = (dateValue: string | number | Date | undefined) => {
    if (!dateValue) return "Not set";

    try {
      const date =
        typeof dateValue === "string"
          ? new Date(dateValue)
          : typeof dateValue === "number"
            ? new Date(dateValue)
            : dateValue;

      return date.toLocaleString();
    } catch (error) {
      return "Invalid date";
    }
  };

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

      {/* Countdown for not_open status */}
      {status.status === "not_open" && startDate && (
        <div className="flex items-center gap-2 mt-2">
          <div className="relative flex items-center justify-center h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400/60 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
          </div>
          <CountdownTimer
            targetDate={startDate}
            className="text-blue-400 font-bold"
          />
        </div>
      )}

      {/* Detailed dates - Responsive grid */}
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
  // Add this helper function
  const formatCountdown = (startTime: string | number | Date | undefined) => {
    if (!startTime) return "soon";
    const start = new Date(startTime).getTime();
    const now = Date.now();
    const days = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
    if (days > 30) return "in ${Math.floor(days / 30)} months";
    if (days > 7) return "in ${Math.floor(days / 7)} weeks";
    if (days > 1) return "in ${days} days";
    if (days === 1) return "tomorrow";
    return "soon";
  };
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
              isNotOpen && "relative", // Keep relative positioning for watermark
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Watermark for not-open gigs */}
            {isNotOpen && (
              <>
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
                  <div className="absolute -right-20 top-1/3 -translate-y-1/2 rotate-45">
                    <div className="bg-blue-500/20 text-blue-300 text-6xl font-bold whitespace-nowrap px-20 py-4 border-4 border-blue-500/30 backdrop-blur-sm">
                      COMING SOON
                    </div>
                  </div>
                  <div className="absolute -left-20 bottom-1/3 translate-y-1/2 -rotate-45">
                    <div className="bg-blue-500/20 text-blue-300 text-6xl font-bold whitespace-nowrap px-20 py-4 border-4 border-blue-500/30 backdrop-blur-sm">
                      NOT YET OPEN
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-blue-900/5 pointer-events-none z-10" />
              </>
            )}
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
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
                {/* Title and Price Row - Stack on mobile */}
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

                      {isNotOpen && (
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 ml-2">
                          <Clock className="w-3 h-3 mr-1" />
                          Opens {formatCountdown(gig.acceptInterestStartTime)}
                        </Badge>
                      )}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-1 truncate">
                          {gig.title}
                        </h2>

                        {/* Status badges - Wrap on mobile */}
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

                  {/* Price - Full width on mobile */}
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

                {/* Quick info grid - Responsive grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span className="truncate">{gig.location || "Remote"}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="truncate">{formatDate(gig.date)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {gig?.time && (
                      <span className="truncate">
                        {gig.time.start}
                        {gig.time.durationFrom
                          ? ` (${gig.time.durationFrom})`
                          : ""}
                        - {gig.time.end}
                        {gig.time.durationTo ? ` (${gig.time.durationTo})` : ""}
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
              {/* Interest Window Badge - Integrated component */}
              <InterestWindowBadge gig={gig} />

              {/* Stats row - Responsive grid */}
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

              {/* Description */}
              {gig.description && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    Description
                  </h3>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                    {gig.description}
                  </p>
                </div>
              )}

              {/* Requirements */}
              {gig.requirements && gig.requirements.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Requirements
                  </h3>
                  <div className="space-y-2">
                    {gig.requirements.map((req: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 text-gray-300"
                      >
                        <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {gig.benefits && gig.benefits.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Benefits
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {gig.benefits.map((benefit: string, index: number) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-colors"
                      >
                        <div className="flex items-center gap-2 text-gray-300">
                          <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                          <span>{benefit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specialization */}
              {(gig.mcType ||
                gig.djGenre ||
                (gig.vocalistGenre && gig.vocalistGenre.length > 0)) && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    {getSpecializationIcon()}
                    Specialization
                  </h3>
                  <div className="space-y-3">
                    {gig.mcType && (
                      <div className="flex flex-wrap items-center gap-2 text-gray-300">
                        <span className="font-medium">MC Type:</span>
                        <span>{gig.mcType}</span>
                      </div>
                    )}
                    {gig.mcLanguages && (
                      <div className="flex flex-wrap items-center gap-2 text-gray-300">
                        <span className="font-medium">Languages:</span>
                        <span>{gig.mcLanguages}</span>
                      </div>
                    )}
                    {gig.djGenre && (
                      <div className="flex flex-wrap items-center gap-2 text-gray-300">
                        <span className="font-medium">DJ Genre:</span>
                        <span>{gig.djGenre}</span>
                      </div>
                    )}
                    {gig.vocalistGenre && gig.vocalistGenre.length > 0 && (
                      <div>
                        <div className="font-medium text-gray-300 mb-2">
                          Vocalist Genres:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {gig.vocalistGenre.map(
                            (genre: string, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-1 rounded bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 text-sm border border-purple-500/30"
                              >
                                {genre}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              {gig.tags && gig.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-purple-500" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {gig.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 rounded-full bg-gray-800/50 text-gray-300 text-sm border border-gray-700 hover:border-gray-600 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Band Roles (if applicable) */}
              {gig.isClientBand &&
                gig.bandCategory &&
                gig.bandCategory.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-500" />
                      Available Roles
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {gig.bandCategory.map((role, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg border border-gray-200 dark:border-gray-800"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-white">
                              {role.role}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {role.filledSlots}/{role.maxSlots}
                            </Badge>
                          </div>
                          {role.description && (
                            <p className="text-sm text-gray-400 line-clamp-2">
                              {role.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Footer with action buttons - Only Save and Favorite */}
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
