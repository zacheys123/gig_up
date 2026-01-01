// components/gig/GigCard.tsx
import React, { useCallback, useEffect, useState } from "react";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

import { Ban, EyeIcon, Lock, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";
import { useCurrentUser } from "@/hooks/useCurrentUser";

import clsx from "clsx";

import { useMemo } from "react";
import { FaBookmark, FaHeart, FaRegBookmark, FaRegHeart } from "react-icons/fa";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Convex imports
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCancelGig } from "@/hooks/useCancelGig";
import { useUserStore } from "@/app/stores";
import { getConfirmState, useConfirmPayment } from "@/hooks/useConfirmPayment";
import {
  canStillBookThisWeekDetailed,
  formatViewCount,
  getGigConditions,
} from "@/gigHelper";
import GigDescription from "./GigDescription";
import { GigProps } from "@/types/gig";
import ButtonComponent from "./ButtonComponent";
import { useThemeColors } from "@/hooks/useTheme"; // Add this import

interface GigCardProps {
  gig: {
    _id: Id<"gigs">;
    _creationTime: number;
    postedBy: Id<"users">;
    bookedBy?: Id<"users">;
    title: string;
    description?: string;
    phone?: string;
    price?: number;
    category?: string;
    isActive: boolean;
    isPublic: boolean;
    tags: string[];
    requirements: string[];
    benefits: string[];
    bandCategory: string[];
    bussinesscat: string;
    location?: string;
    date: number;
    time: {
      start: string;
      end: string;
    };
    isTaken: boolean;
    isPending: boolean;
    viewCount: Id<"users">[];
    bookCount: Id<"users">[];
    font?: string;
    fontColor?: string;
    backgroundColor?: string;
    logo: string;
    gigtimeline?: string;
    otherTimeline?: string;
    day?: string;
    mcType?: string;
    mcLanguages?: string;
    djGenre?: string;
    djEquipment?: string;
    pricerange?: string;
    currency?: string;
    vocalistGenre: string[];
    scheduleDate?: number;
    schedulingProcedure?: string;
    paymentStatus?: "pending" | "paid" | "refunded";
    gigRating: number;
    negotiable?: boolean;
    depositRequired?: boolean;
    travelIncluded?: boolean;
    travelFee?: string;
    secret?: string;
    clientConfirmPayment?: any;
    musicianConfirmPayment?: any;
  };
  currentUserId?: Id<"users">;
}

const GigCard: React.FC<GigCardProps> = ({ gig }) => {
  const { userId } = useAuth();
  const { colors, isDarkMode } = useThemeColors(); // Add this
  const { user } = useCurrentUser();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    currentgig,
    setCurrentGig,
    loadingPostId,
    setLoadingPostId,
    setLastBookedGigId,
    setShowConfirmation,
    setShowConfetti,
    setShowPaymentConfirmation,
    paymentConfirmations,
    setConfirmedParty,
    setCanFinalize,
  } = useUserStore();

  // Convex mutations
  const saveGig = useMutation(api.controllers.gigs.saveGig);
  const unsaveGig = useMutation(api.controllers.gigs.unsaveGig);
  const favoriteGig = useMutation(api.controllers.gigs.favoriteGig);
  const unfavoriteGig = useMutation(api.controllers.gigs.unfavoriteGig);
  const bookGigMutation = useMutation(api.controllers.gigs.bookGig);
  const incrementView = useMutation(api.controllers.gigs.incrementViewCount);
  const deleteGig = useMutation(api.controllers.gigs.deleteGig);

  // Convex queries
  const currentUserData = useQuery(
    api.controllers.user.getCurrentUser,
    userId ? { clerkId: userId } : "skip"
  );

  const { isConfirming, isFinalizing, finalizePayment } = useConfirmPayment();

  const gigId = gig?._id;
  const confirmation = gigId ? paymentConfirmations[gigId] : undefined;
  const confirmedParty = confirmation?.confirmedParty ?? "none";
  const canFinalize = confirmation?.canFinalize ?? false;

  useEffect(() => {
    const storedState = getConfirmState(gig._id);
    setConfirmedParty(gig?._id, storedState.confirmedParty);
    setCanFinalize(gig?._id, storedState.canFinalize);
  }, [gig?._id, setConfirmedParty, setCanFinalize]);

  const [bookCount, setBookCount] = useState(gig.bookCount.length || 0);
  const [currviewCount, setCurrviewCount] = useState(0);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [bookLoading, setBookLoading] = useState(false);

  const myId = user?._id;
  const router = useRouter();

  const isClient = gig?.postedBy === myId;
  const needsClientConfirmation = gig?.isTaken && isClient;
  const paymentConfirmed = gig?.paymentStatus === "paid";

  // Add this state at the top of your component
  const [showGigDescription, setShowGigDescription] = useState(false);
  const [selectedGig, setSelectedGig] = useState<GigProps | null>(null);

  // Update the handleModal function
  const handleModal = async () => {
    try {
      if (gig?.postedBy === myId) {
        if (currviewCount > 3) {
          setIsDeleteModal(true);
          setCurrentGig(gig as any);
          return;
        }
        setCurrviewCount((prev) => prev + 1);
        setIsDeleteModal(true);
        setCurrentGig(gig as any);
        return;
      }

      // Increment view count using Convex
      if (user?._id) {
        await incrementView({
          gigId: gig._id,
          userId: user._id,
        });
      }

      // Open the GigDescription modal
      setSelectedGig(gig as any);
      setShowGigDescription(true);
    } catch (error) {
      console.error("Error adding view for gig", error);
      toast.error("Failed to update view count");
    }
  };

  // Update the favorite/save handlers to work with GigDescription
  const handleFavoriteClick = async (action: "add" | "remove") => {
    if (!userId || !myId) {
      toast.error("Please sign in to save favorites");
      return;
    }

    const previousState = isFavorite;
    setIsFavorite(action === "add");

    try {
      if (action === "add") {
        await favoriteGig({
          userId: myId,
          gigId: gig._id,
        });
        toast.success("Added to favorites");
      } else {
        await unfavoriteGig({
          userId: myId,
          gigId: gig._id,
        });
        toast.success("Removed from favorites");
      }
    } catch (error: any) {
      setIsFavorite(previousState);
      console.error("Error updating favorite:", error);
      toast.error(error.message || "Failed to update favorite");
    }
  };

  const handleSaveClick = async (action: "add" | "remove") => {
    if (!userId || !myId) {
      toast.error("Please sign in to save gigs");
      return;
    }

    try {
      if (action === "add") {
        await saveGig({
          userId: myId,
          gigId: gig._id,
        });
        setIsSaved(true);
        toast.success("Gig saved");
      } else {
        await unsaveGig({
          userId: myId,
          gigId: gig._id,
        });
        setIsSaved(false);
        toast.success("Gig unsaved");
      }
    } catch (error: any) {
      console.error("Error updating saved gig:", error);
      toast.error(error.message || "Failed to update saved gig");
    }
  };

  // Convex: Handle booking
  const handleBookGig = async () => {
    if (!userId || !myId) {
      toast.error("Please sign in to book gigs");
      return;
    }

    setBookLoading(true);
    try {
      await bookGigMutation({
        gigId: gig._id,
        userId: myId,
      });

      setBookCount((prev) => prev + 1);
      setLastBookedGigId(gig._id);
      setShowConfetti(true);

      setTimeout(() => {
        setShowConfetti(false);
        setShowConfirmation(true);
      }, 3000);

      toast.success("Successfully booked gig!");
    } catch (error: any) {
      console.error("Error booking gig:", error);
      toast.error(error.message || "Failed to book gig");
    } finally {
      setBookLoading(false);
    }
  };

  const handleEditBooked = async (id: string) => {
    router.push(`/execute/${id}`);
  };

  const handleBookedUsers = (id: string) => {
    router.push(`/pre_execute/${id}`);
  };

  const handleReviewModal = () => {
    router.push(`/execute/${gig._id}`);
  };

  useEffect(() => {
    setLoadingPostId("");
  }, [pathname, searchParams]);

  const handleNavigation = async (path: string) => {
    setLoadingPostId(gig?._id || "");
    try {
      await router.push(path);
    } finally {
      setLoadingPostId("");
    }
  };

  const existingSecret = localStorage.getItem("secret");
  const bookingStatus = canStillBookThisWeekDetailed(
    user as Doc<"users">,
    gig as any,
    myId
  );

  const classes = clsx(
    "h-8 px-4 text-sm font-medium rounded-lg transition-all duration-200",
    {
      [`${colors.primaryBg} ${colors.primaryBgHover} ${colors.textInverted} shadow-lg`]:
        bookingStatus.canBook && !bookLoading,
      [`${colors.disabledBg} ${colors.disabledText} cursor-not-allowed`]:
        !bookingStatus.canBook,
      "opacity-70 cursor-not-allowed": bookLoading,
    }
  );

  const {
    isCurrentWhoCreatedGig,
    isCurrentWhoBooked,
    canEditGig,
    formattedPrice,
    canPostAScheduledGig,
    allowedToBookGig,
    isProOnlyForFreeUser,
  } = useMemo(
    () => getGigConditions(gig as any, user as Doc<"users">, myId),
    [gig, user, myId, bookCount]
  );

  const [isFavorite, setIsFavorite] = useState(
    currentUserData?.favoriteGigs?.includes(gig._id) || false
  );
  const [isSaved, setIsSaved] = useState(
    currentUserData?.savedGigs?.includes(gig._id) || false
  );

  // Convex: Handle favorite
  const handleFavourite = useCallback(
    async (action: "add" | "remove") => {
      if (!userId || !myId) {
        toast.error("Please sign in to save favorites");
        return;
      }

      const previousState = isFavorite;
      setIsFavorite(action === "add");

      try {
        if (action === "add") {
          await favoriteGig({
            userId: myId,
            gigId: gig._id,
          });
          toast.success("Added to favorites");
        } else {
          await unfavoriteGig({
            userId: myId,
            gigId: gig._id,
          });
          toast.success("Removed from favorites");
        }
      } catch (error: any) {
        setIsFavorite(previousState);
        console.error("Error updating favorite:", error);
        toast.error(error.message || "Failed to update favorite");
      }
    },
    [favoriteGig, unfavoriteGig, gig._id, myId, userId, isFavorite]
  );

  // Convex: Handle save
  const handleSave = useCallback(
    async (action: "add" | "remove") => {
      if (!userId || !myId) {
        toast.error("Please sign in to save gigs");
        return;
      }

      try {
        if (action === "add") {
          await saveGig({
            userId: myId,
            gigId: gig._id,
          });
          setIsSaved(true);
          toast.success("Gig saved");
        } else {
          await unsaveGig({
            userId: myId,
            gigId: gig._id,
          });
          setIsSaved(false);
          toast.success("Gig unsaved");
        }
      } catch (error: any) {
        console.error("Error updating saved gig:", error);
        toast.error(error.message || "Failed to update saved gig");
      }
    },
    [saveGig, unsaveGig, gig._id, myId, userId]
  );

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelingGigId, setCancelingGigId] = useState<string | null>(null);
  const { cancelGig, isCanceling } = useCancelGig();

  const handleCancelClick = (gigId: string) => {
    setCancelingGigId(gigId);
    setShowCancelDialog(true);
    setCurrentGig(gig as any);
  };

  const handleConfirmCancel = async () => {
    if (!cancelingGigId || !cancelReason) return;

    try {
      await cancelGig(
        cancelingGigId,
        gig.bookedBy ? gig.bookedBy : "",
        cancelReason,
        isClient ? "client" : "musician"
      );
      setShowCancelDialog(false);
      setCancelReason("");
      setCancelingGigId(null);
    } catch (error) {
      console.error("Cancellation failed:", error);
    }
  };

  const handleFinalizePayment = async () => {
    if (!currentgig) return;

    await finalizePayment(
      gig._id,
      isClient ? "client" : "musician",
      "Confirmed payment, Finalized via app"
    );
  };

  // Format date and time
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`)
      .toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
      .toLowerCase();
  };

  // Get appropriate color based on gig category
  const getCategoryColor = (category?: string) => {
    if (!category) return colors.defaultPrimary;

    const categoryLower = category.toLowerCase();
    if (categoryLower.includes("vocalist")) return colors.vocalistPrimary;
    if (categoryLower.includes("dj")) return colors.djPrimary;
    if (categoryLower.includes("mc")) return colors.mcPrimary;
    if (categoryLower.includes("client")) return colors.clientPrimary;
    if (categoryLower.includes("musician")) return colors.musicianPrimary;
    if (categoryLower.includes("booker")) return colors.bookerPrimary;

    return colors.primary;
  };

  const categoryColor = getCategoryColor(gig?.category);

  return (
    <>
      <GigDescription
        gig={selectedGig}
        isOpen={showGigDescription}
        onClose={() => {
          setShowGigDescription(false);
          setSelectedGig(null);
        }}
        onBook={handleBookGig}
        onSave={() => handleSaveClick(isSaved ? "remove" : "add")}
        onFavorite={() => handleFavoriteClick(isFavorite ? "remove" : "add")}
        currentUserId={myId}
      />

      {isDeleteModal && (
        <DeleteModal
          setIsDeleteModal={setIsDeleteModal}
          currentGig={currentgig}
          deleteGig={deleteGig}
          userId={myId}
          colors={colors}
        />
      )}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`group relative ${colors.card} ${colors.cardBorder} backdrop-blur-sm 
    rounded-2xl p-4 mb-3 border transition-all duration-300 
    hover:shadow-xl ${colors.shadow} ${colors.hoverBg}`}
      >
        {/* Status Indicator Bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${
            gig?.isTaken
              ? "bg-green-500"
              : gig?.isPending
                ? "bg-yellow-500"
                : colors.gradientPrimary
          }`}
        />

        {/* Compact Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2 sm:gap-0">
          <div className="flex-1 min-w-0 pr-0 sm:pr-3">
            <div className="flex flex-col xs:flex-row xs:items-center gap-2 mb-1">
              <h3
                className={`text-base font-semibold ${colors.text} truncate group-hover:${colors.primary} transition-colors`}
              >
                {gig?.title}
              </h3>
              <div
                className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 w-fit ${
                  gig?.isTaken
                    ? "bg-green-500/20 text-green-300"
                    : gig?.isPending
                      ? "bg-yellow-500/20 text-yellow-300"
                      : `${colors.tagBg} ${colors.primary}`
                }`}
              >
                {gig?.isTaken
                  ? "Booked"
                  : gig?.isPending
                    ? "Pending"
                    : "Available"}
              </div>
            </div>

            <div
              className={`flex flex-wrap items-center gap-2 xs:gap-3 text-xs ${colors.textMuted}`}
            >
              <div className="flex items-center gap-1">
                <svg
                  className="w-3 h-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span
                  className={`truncate max-w-[120px] xs:max-w-[140px] sm:max-w-[160px] ${colors.text}`}
                >
                  {gig?.location || "Remote"}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <svg
                  className="w-3 h-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className={`whitespace-nowrap ${colors.text}`}>
                  {formatDate(gig?.date)} • {formatTime(gig?.time?.start)}
                </span>
              </div>
            </div>
          </div>

          {/* Price and Stats */}
          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 sm:gap-1">
            <div
              className={`text-lg font-bold ${colors.text} whitespace-nowrap`}
            >
              {gig?.price ? `$${gig.price}` : "Contact"}
              {gig?.negotiable && (
                <span
                  className={`text-xs font-normal ${colors.textMuted} ml-1`}
                >
                  (Negotiable)
                </span>
              )}
            </div>

            <div
              className={`flex items-center gap-2 text-xs ${colors.textMuted}`}
            >
              <div className="flex items-center gap-1">
                <EyeIcon className="w-3 h-3" />
                <span>{formatViewCount(gig?.viewCount?.length || 0)}</span>
              </div>
              <div className="flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                <span>{gig?.bookCount?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Avatar and Actions */}
        <div
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 border-t gap-3 sm:gap-0 ${colors.border}`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full overflow-hidden border-2 ${colors.border}`}
            >
              {gig?.logo ? (
                <img
                  src={gig.logo}
                  alt="gig-logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className={`w-full h-full ${colors.gradientPrimary} flex items-center justify-center`}
                >
                  <span className="text-xs font-bold text-white">👤</span>
                </div>
              )}
            </div>
            <span
              className={`text-xs ${colors.textMuted} truncate max-w-[100px] xs:max-w-[150px]`}
            >
              {currentUserData?.username?.split(" ")[0] || "User"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {/* Action Buttons */}
            {needsClientConfirmation && (
              <div className="flex gap-2">
                <ButtonComponent
                  variant="secondary"
                  classname={`${colors.successBg} ${colors.successText} hover:${colors.successBg} text-xs px-3 py-1 rounded-lg whitespace-nowrap border ${colors.successBorder}`}
                  onclick={() => {
                    setShowPaymentConfirmation(true);
                    setCurrentGig(gig as any);
                  }}
                  disabled={isConfirming || isFinalizing}
                  title={
                    isConfirming
                      ? "Confirming..."
                      : isFinalizing
                        ? "Finalizing..."
                        : "Confirm"
                  }
                />
                <ButtonComponent
                  variant="secondary"
                  classname={`${colors.destructiveBg} ${colors.destructive} hover:${colors.destructiveHover} text-xs px-3 py-1 rounded-lg whitespace-nowrap border ${colors.destructiveBg}`}
                  onclick={() => handleCancelClick(gig._id)}
                  disabled={isCanceling}
                  title={isCanceling ? "Canceling..." : "Cancel"}
                />
              </div>
            )}

            {isCurrentWhoCreatedGig && (
              <ButtonComponent
                variant="secondary"
                classname={`${colors.infoBg} ${colors.infoText} hover:${colors.hoverBg} text-xs px-3 py-1 rounded-lg whitespace-nowrap border ${colors.infoBorder}`}
                onclick={() => handleNavigation(`/pre_execute/${gig._id}`)}
                disabled={loadingPostId === gig._id}
                title={loadingPostId === gig._id ? "Opening..." : "View"}
              />
            )}

            {allowedToBookGig && !gig?.isTaken && (
              <ButtonComponent
                variant={bookingStatus.canBook ? "default" : "ghost"}
                classname={`${classes} whitespace-nowrap`}
                onclick={handleBookGig}
                disabled={!bookingStatus.canBook || bookLoading}
                loading={bookLoading}
              >
                {bookLoading ? "Processing..." : "Book Now"}
              </ButtonComponent>
            )}

            {/* Favorite and Save Buttons */}
            <div className="flex gap-1">
              <button
                onClick={() => handleFavourite(isFavorite ? "remove" : "add")}
                className={`p-1.5 rounded-lg transition-colors ${colors.buttonSecondaryBg} ${colors.hoverBg}`}
                title={
                  isFavorite ? "Remove from favorites" : "Add to favorites"
                }
              >
                {isFavorite ? (
                  <FaHeart className="w-4 h-4 text-red-500" />
                ) : (
                  <FaRegHeart className={`w-4 h-4 ${colors.textMuted}`} />
                )}
              </button>
              <button
                onClick={() => handleSave(isSaved ? "remove" : "add")}
                className={`p-1.5 rounded-lg transition-colors ${colors.buttonSecondaryBg} ${colors.hoverBg}`}
                title={isSaved ? "Remove from saved" : "Save for later"}
              >
                {isSaved ? (
                  <FaBookmark className="w-4 h-4 text-yellow-500" />
                ) : (
                  <FaRegBookmark className={`w-4 h-4 ${colors.textMuted}`} />
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleModal();
                }}
                className={`p-1.5 rounded-lg transition-colors ${colors.buttonSecondaryBg} ${colors.hoverBg}`}
                title="More options"
              >
                <PiDotsThreeVerticalBold
                  className={`w-4 h-4 ${colors.textMuted}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Tags */}
        {gig?.tags && gig.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {gig.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className={`px-2 py-0.5 text-xs rounded-full ${colors.tagBg} ${colors.tagText}`}
              >
                {tag}
              </span>
            ))}
            {gig.tags.length > 3 && (
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${colors.tagBg} ${colors.textMuted}`}
              >
                +{gig.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </motion.div>
      {/* Cancellation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent
          className={`max-w-md ${colors.background} ${colors.border}`}
        >
          <DialogHeader>
            <DialogTitle className={colors.text}>Cancel Booking</DialogTitle>
            <DialogDescription className={colors.textMuted}>
              Please provide a reason for cancellation
            </DialogDescription>
          </DialogHeader>

          <Input
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Reason for cancellation..."
            className={`${colors.backgroundMuted} ${colors.border} ${colors.text}`}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              className={`${colors.border} ${colors.textMuted}`}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={!cancelReason || isCanceling}
            >
              {isCanceling ? "Cancelling..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Delete Modal Component - Updated with theme
const DeleteModal = ({
  setIsDeleteModal,
  currentGig,
  deleteGig,
  userId,
  colors,
}: {
  setIsDeleteModal: (show: boolean) => void;
  currentGig: any;
  deleteGig: any;
  userId?: string;
  colors: any;
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [secret, setSecret] = useState("");

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret) {
      setError("Please enter the secret");
      return;
    }
    if (!userId) {
      setError("You must be logged in to delete gigs");
      return;
    }

    setDeleting(true);
    try {
      await deleteGig({
        gigId: currentGig?._id,
        userId: userId,
        secret: secret,
      });

      setSuccess("Gig deleted successfully");
      setTimeout(() => {
        setIsDeleteModal(false);
      }, 1500);
    } catch (error: any) {
      setError(error.message || "Failed to delete gig");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className={`relative w-full max-w-md ${colors.background} rounded-2xl p-6 ${colors.border} border`}
      >
        <button
          onClick={() => setIsDeleteModal(false)}
          className={`absolute right-4 top-4 p-1 rounded-lg ${colors.hoverBg}`}
        >
          <X className={`w-5 h-5 ${colors.textMuted}`} />
        </button>

        {!showConfirm ? (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>

            <h3 className={`text-lg font-semibold ${colors.text} mb-2`}>
              Delete Gig
            </h3>

            <p className={`${colors.textMuted} mb-6`}>
              Are you sure you want to delete "{currentGig?.title}"? This action
              cannot be undone.
            </p>

            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModal(false)}
                className={`${colors.border} ${colors.textMuted}`}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowConfirm(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleDelete}>
            <div className="text-center mb-6">
              <h3 className={`text-lg font-semibold ${colors.text} mb-2`}>
                Confirm Deletion
              </h3>
              <p className={colors.textMuted}>
                Enter your gig secret to confirm deletion
              </p>
            </div>

            <Input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter gig secret"
              className={`${colors.backgroundMuted} ${colors.border} ${colors.text} mb-4`}
            />

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            {success && (
              <p className="text-green-400 text-sm mb-4">{success}</p>
            )}

            <Button
              type="submit"
              variant="destructive"
              disabled={deleting || !secret}
              className="w-full"
            >
              {deleting ? "Deleting..." : "Confirm Deletion"}
            </Button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
};

export default GigCard;
