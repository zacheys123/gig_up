// components/gig/GigDescription.tsx
import React from "react";
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
  Shield,
  Phone,
  Music,
  Mic,
  Headphones,
  Globe,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { GigProps } from "@/types/gig";

interface GigDescriptionProps {
  gig: GigProps | null;
  isOpen: boolean;
  onClose: () => void;
  onBook?: () => void;
  onSave?: () => void;
  onFavorite?: () => void;
  currentUserId?: Id<"users">;
}

const GigDescription: React.FC<GigDescriptionProps> = ({
  gig,
  isOpen,
  onClose,
  onBook,
  onSave,
  onFavorite,
  currentUserId,
}) => {
  const { userId } = useAuth();

  // Convex mutations
  const bookGig = useMutation(api.controllers.gigs.bookGig);
  const saveGigMutation = useMutation(api.controllers.gigs.saveGig);
  const favoriteGigMutation = useMutation(api.controllers.gigs.favoriteGig);

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

  const handleBook = async () => {
    if (!currentUserId) {
      toast.error("Please sign in to book gigs");
      return;
    }

    if (onBook) {
      onBook();
      return;
    }

    try {
      await bookGig({
        gigId: gig._id as Id<"gigs">,
        userId: currentUserId,
      });
      toast.success("Successfully booked this gig!");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to book gig");
    }
  };

  const handleSave = async () => {
    if (!currentUserId) {
      toast.error("Please sign in to save gigs");
      return;
    }

    if (onSave) {
      onSave();
      return;
    }

    try {
      await saveGigMutation({
        userId: currentUserId,
        gigId: gig._id,
      });
      toast.success("Gig saved!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save gig");
    }
  };

  const handleFavorite = async () => {
    if (!currentUserId) {
      toast.error("Please sign in to favorite gigs");
      return;
    }

    if (onFavorite) {
      onFavorite();
      return;
    }

    try {
      await favoriteGigMutation({
        userId: currentUserId,
        gigId: gig._id,
      });
      toast.success("Added to favorites!");
    } catch (error: any) {
      toast.error(error.message || "Failed to favorite gig");
    }
  };

  const getSpecializationIcon = () => {
    if (gig.mcType) return <Mic className="w-4 h-4" />;
    if (gig.djGenre) return <Headphones className="w-4 h-4" />;
    if (gig.vocalistGenre?.length > 0) return <Music className="w-4 h-4" />;
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
      applied: gig.appliedUsers?.length || 0,
    };
  };

  const stats = calculateBookingStats();

  return (
    <AnimatePresence>
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
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>

          {/* Header with gradient */}
          <div className="relative p-6 border-b border-gray-700">
            <div
              className="absolute inset-0 rounded-t-2xl"
              style={{
                background: gig.backgroundColor
                  ? gig.backgroundColor
                  : "linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)",
              }}
            />

            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    {/* Logo/Avatar */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-600 flex-shrink-0">
                      {gig.logo ? (
                        <img
                          src={gig.logo}
                          alt="Gig logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {gig.title && gig?.title.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-bold text-white mb-1 truncate">
                        {gig.title}
                      </h2>
                      <div className="flex items-center gap-2 mb-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            gig.isTaken
                              ? "bg-green-500/20 text-green-300"
                              : gig.isPending
                                ? "bg-yellow-500/20 text-yellow-300"
                                : "bg-blue-500/20 text-blue-300"
                          }`}
                        >
                          {gig.isTaken
                            ? "Booked"
                            : gig.isPending
                              ? "Pending"
                              : "Available"}
                        </span>

                        {gig.category && (
                          <span className="px-3 py-1 rounded-full bg-gray-700/50 text-gray-300 text-sm">
                            {gig.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-3xl font-bold text-white mb-1">
                    {gig.price
                      ? `${gig.currency || "$"}${gig.price.toLocaleString()}`
                      : "Contact for price"}
                  </div>
                  {gig.negotiable && (
                    <span className="text-sm text-gray-400">(Negotiable)</span>
                  )}
                </div>
              </div>

              {/* Quick info row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span className="truncate">{gig.location || "Remote"}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span>{formatDate(gig.date)}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span>
                    {formatTime(gig.time?.start || "00:00")} -{" "}
                    {formatTime(gig.time?.end || "23:59")}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-300">
                  <Globe className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>{gig.bussinesscat}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="p-6 space-y-6">
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

            {/* Description */}
            {gig.description && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-yellow-500" />
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
            {(gig.mcType || gig.djGenre || gig.vocalistGenre?.length > 0) && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  {getSpecializationIcon()}
                  Specialization
                </h3>
                <div className="space-y-3">
                  {gig.mcType && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="font-medium">MC Type:</span>
                      <span>{gig.mcType}</span>
                    </div>
                  )}
                  {gig.mcLanguages && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="font-medium">Languages:</span>
                      <span>{gig.mcLanguages}</span>
                    </div>
                  )}
                  {gig.djGenre && (
                    <div className="flex items-center gap-2 text-gray-300">
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
                          )
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
          </div>

          {/* Footer with action buttons */}
          <div className="p-6 border-t border-gray-700 bg-gray-900/50">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  disabled={!userId}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFavorite}
                  disabled={!userId}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Favorite
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Close
                </Button>

                {!gig.isTaken && !gig.isPending && (
                  <Button
                    onClick={handleBook}
                    disabled={!userId}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
                  >
                    {userId ? "Book This Gig" : "Sign in to Book"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GigDescription;
