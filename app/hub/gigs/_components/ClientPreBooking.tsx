// components/gigs/ClientPreBooking.tsx (HORIZONTAL NAVIGATION VERSION)
import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// Icons
import {
  Search,
  Calendar,
  MapPin,
  DollarSign,
  ShoppingBag,
  Bookmark,
  Users,
  Users2,
  User,
  History,
  CheckCircle,
  Eye,
  Bookmark as BookmarkIcon,
  Star,
  XCircle,
  Clock,
  Music,
  Sparkles,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Filter,
  MoreVertical,
  Zap,
  Mic,
  Volume2,
  Briefcase,
  Target,
  Award,
  Edit,
  Archive,
  AlertCircle,
} from "lucide-react";

// Custom Components
import { ChatIcon } from "@/components/chat/ChatIcon";

// Tab Components
import { BandRolesTab } from "@/components/booking/BandGigWithRoleTab";
import { HistoryTab } from "@/components/booking/History";
import { RegularGigsTab } from "@/components/booking/RegularGigsTab";
// Types
import {
  Applicant,
  ShortlistedUser,
  GigWithApplicants,
  GigTabType,
} from "@/types/bookings";
import { ShortlistTab } from "@/components/booking/ShortlIstTab";
import { FullBandTab } from "@/components/booking/FullBandGig";
import { BookingOptionsSection } from "./BookingOptions";
import { PreBookingStats } from "./gigs/PreBookingStats";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, easeOut, easeInOut } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";

interface ClientPreBookingProps {
  user: any;
}

export const ClientPreBooking: React.FC<ClientPreBookingProps> = ({ user }) => {
  const router = useRouter();
  const { userId: authClerkId } = useAuth();
  const { colors, isDarkMode } = useThemeColors();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Tab states
  const [activeGigTab, setActiveGigTab] = useState<GigTabType>("regular");
  const [activeTab, setActiveTab] = useState<"applicants" | "history">(
    "applicants",
  );
  const [applicantView, setApplicantView] = useState<"active" | "history">(
    "active",
  );

  // Queries
  const userGigs = useQuery(
    api.controllers.gigs.getGigsByUser,
    user?.clerkId
      ? {
          clerkId: user?.clerkId,
          status: "all",
          gigType: "all",
        }
      : "skip",
  );

  const allUsers = useQuery(api.controllers.user.getAllUsers);

  // Mutations
  const addToShortlist = useMutation(api.controllers.prebooking.addToShortlist);
  const removeFromShortlist = useMutation(
    api.controllers.prebooking.removeFromShortlist,
  );
  const bookMusician = useMutation(api.controllers.prebooking.bookMusician);
  const removeApplicant = useMutation(
    api.controllers.prebooking.removeApplicant,
  );
  const markApplicantViewed = useMutation(
    api.controllers.prebooking.markApplicantViewed,
  );

  // State
  const [loading, setLoading] = useState(true);
  const [gigsWithApplicants, setGigsWithApplicants] = useState<
    GigWithApplicants[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGig, setSelectedGig] = useState<Id<"gigs"> | null>(null);
  const [showBookDialog, setShowBookDialog] = useState(false);
  const [selectedMusician, setSelectedMusician] = useState<{
    userId: Id<"users">;
    userName: string;
    source?: "regular" | "band-role" | "full-band" | "shortlisted";
    bandId?: Id<"bands">;
    bandRoleIndex?: number;
  } | null>(null);
  const [selectedBand, setSelectedBand] = useState<{
    bandId: Id<"bands">;
    bandName: string;
  } | null>(null);
  const [bookingPrice, setBookingPrice] = useState<number | "">("");

  // Get tab counts
  const getTabCounts = () => {
    if (!userGigs)
      return { regular: 0, bandRoles: 0, fullBand: 0, shortlist: 0 };

    const counts = {
      regular: 0,
      bandRoles: 0,
      fullBand: 0,
      shortlist: 0,
    };

    userGigs.forEach((gig) => {
      const typedGig = gig as any;

      if (typedGig.isTaken) return;

      if (!typedGig.isClientBand) {
        const hasInterested =
          typedGig.interestedUsers && typedGig.interestedUsers.length > 0;
        if (hasInterested) counts.regular++;
      }

      if (typedGig.isClientBand && typedGig.bandCategory) {
        const hasRoleApplicants = typedGig.bandCategory.some(
          (role: any) => role.applicants && role.applicants.length > 0,
        );
        if (hasRoleApplicants) counts.bandRoles++;
      }

      if (typedGig.isClientBand) {
        const hasBandApplications =
          typedGig.bookCount && typedGig.bookCount.length > 0;
        if (hasBandApplications) counts.fullBand++;
      }

      const hasShortlisted =
        typedGig.shortlistedUsers && typedGig.shortlistedUsers.length > 0;
      if (hasShortlisted) counts.shortlist++;
    });

    return counts;
  };

  const tabCounts = getTabCounts();

  // Process gigs with proper null checks
  const processGigsWithApplicants = () => {
    if (!userGigs || !allUsers) {
      console.log("No gigs or users data available");
      return;
    }

    console.log("Processing gigs:", userGigs.length);

    const userMap = new Map();
    allUsers.forEach((user) => {
      userMap.set(user._id, user);
    });

    const processedGigs = userGigs
      .filter((gig) => {
        const typedGig = gig as any;

        const interestedUsers = typedGig.interestedUsers || [];
        const shortlistedUsers = typedGig.shortlistedUsers || [];
        const bookCount = typedGig.bookCount || [];
        const bandCategory = typedGig.bandCategory || [];

        const hasInterested = interestedUsers.length > 0;
        const hasShortlisted = shortlistedUsers.length > 0;
        const hasBandApplications = bookCount.length > 0;
        const hasBandRoles = bandCategory.length > 0;
        const isNotTaken = !typedGig.isTaken;

        switch (activeGigTab) {
          case "regular":
            return !typedGig.isClientBand && hasInterested && isNotTaken;
          case "band-roles":
            return typedGig.isClientBand && hasBandRoles && isNotTaken;
          case "full-band":
            return typedGig.isClientBand && hasBandApplications && isNotTaken;
          case "shortlist":
            return hasShortlisted && isNotTaken;
          default:
            return false;
        }
      })
      .map((gig) => {
        const typedGig = gig as any;

        let applicants: Applicant[] = [];
        let shortlisted: ShortlistedUser[] = [];
        const bookingHistory = typedGig.bookingHistory || [];

        const interestedUsers = typedGig.interestedUsers || [];
        const shortlistedUsers = typedGig.shortlistedUsers || [];
        const bandCategory = typedGig.bandCategory || [];
        const bookCount = typedGig.bookCount || [];

        switch (activeGigTab) {
          case "regular":
            applicants = interestedUsers.map((userId: Id<"users">) => {
              const statusHistory = bookingHistory.filter(
                (entry: any) => entry.userId === userId,
              );

              let status: Applicant["status"] = "pending";

              const hasCancelled = statusHistory.some(
                (entry: any) => entry.status === "cancelled",
              );
              const hasRejected = statusHistory.some(
                (entry: any) => entry.status === "rejected",
              );

              if (hasCancelled) {
                status = "cancelled";
              } else if (hasRejected) {
                status = "rejected";
              } else {
                if (statusHistory.length > 0) {
                  const sortedHistory = [...statusHistory].sort(
                    (a, b) => (b.timestamp || 0) - (a.timestamp || 0),
                  );
                  const latestEntry = sortedHistory[0];

                  if (latestEntry.status === "booked") {
                    status = "booked";
                  } else if (
                    latestEntry.status === "updated" ||
                    latestEntry.status === "viewed"
                  ) {
                    status = "viewed";
                  }
                }

                if (status !== "booked") {
                  const isShortlisted = shortlistedUsers.some(
                    (item: any) => item.userId === userId,
                  );
                  if (isShortlisted) {
                    status = "shortlisted";
                  }
                }
              }

              return {
                userId,
                appliedAt: typedGig.createdAt,
                status,
                gigId: typedGig._id,
              };
            });
            break;

          case "band-roles":
            bandCategory.forEach((role: any, roleIndex: number) => {
              const roleApplicants = role.applicants || [];
              const roleBookedUsers = role.bookedUsers || [];

              roleApplicants.forEach((userId: Id<"users">) => {
                const statusHistory = bookingHistory.filter(
                  (entry: any) =>
                    entry.userId === userId &&
                    entry.bandRoleIndex === roleIndex,
                );

                let status: Applicant["status"] = "pending";

                const hasCancelled = statusHistory.some(
                  (entry: any) => entry.status === "cancelled",
                );
                const hasRejected = statusHistory.some(
                  (entry: any) => entry.status === "rejected",
                );

                if (hasCancelled) {
                  status = "cancelled";
                } else if (hasRejected) {
                  status = "rejected";
                } else {
                  if (statusHistory.length > 0) {
                    const sortedHistory = [...statusHistory].sort(
                      (a, b) => (b.timestamp || 0) - (a.timestamp || 0),
                    );
                    const latestEntry = sortedHistory[0];

                    if (latestEntry.status === "booked") {
                      status = "booked";
                    }
                  }

                  if (status !== "booked") {
                    const isShortlisted = shortlistedUsers.some(
                      (item: any) =>
                        item.userId === userId &&
                        item.bandRoleIndex === roleIndex,
                    );
                    if (isShortlisted) {
                      status = "shortlisted";
                    }
                  }
                }

                applicants.push({
                  userId,
                  appliedAt: typedGig.createdAt,
                  status,
                  gigId: typedGig._id,
                  bandRole: role.role,
                  bandRoleIndex: roleIndex,
                });
              });

              roleBookedUsers.forEach((userId: Id<"users">) => {
                const hasCancelled = bookingHistory.some(
                  (entry: any) =>
                    entry.userId === userId &&
                    entry.status === "cancelled" &&
                    entry.bandRoleIndex === roleIndex,
                );

                const hasRejected = bookingHistory.some(
                  (entry: any) =>
                    entry.userId === userId &&
                    entry.status === "rejected" &&
                    entry.bandRoleIndex === roleIndex,
                );

                let status: Applicant["status"] = "booked";

                if (hasCancelled) {
                  status = "cancelled";
                } else if (hasRejected) {
                  status = "rejected";
                }

                applicants.push({
                  userId,
                  appliedAt: typedGig.createdAt,
                  status,
                  gigId: typedGig._id,
                  bandRole: role.role,
                  bandRoleIndex: roleIndex,
                });
              });
            });
            break;

          case "full-band":
            bookCount.forEach((bandApplication: any) => {
              const bandId = bandApplication.bandId;

              const statusHistory = bookingHistory.filter(
                (entry: any) => entry.userId === bandId,
              );

              let status: Applicant["status"] = "pending";

              const hasCancelled = statusHistory.some(
                (entry: any) => entry.status === "cancelled",
              );
              const hasRejected = statusHistory.some(
                (entry: any) => entry.status === "rejected",
              );

              if (hasCancelled) {
                status = "cancelled";
              } else if (hasRejected) {
                status = "rejected";
              } else {
                if (statusHistory.length > 0) {
                  const sortedHistory = [...statusHistory].sort(
                    (a, b) => (b.timestamp || 0) - (a.timestamp || 0),
                  );
                  const latestEntry = sortedHistory[0];

                  if (latestEntry.status === "booked") {
                    status = "booked";
                  }
                }

                if (status !== "booked") {
                  const isShortlisted = shortlistedUsers.some(
                    (item: any) => item.userId === bandId,
                  );
                  if (isShortlisted) {
                    status = "shortlisted";
                  }
                }
              }

              applicants.push({
                userId: bandId,
                appliedAt: typedGig.createdAt,
                status,
                gigId: typedGig._id,
              });
            });
            break;
        }

        shortlisted = shortlistedUsers.map((item: any) => ({
          userId: item.userId,
          shortlistedAt: item.shortlistedAt,
          notes: item.notes,
          status: item.status || "active",
          bandRole: item.bandRole,
          bandRoleIndex: item.bandRoleIndex,
        }));

        return {
          gig: typedGig,
          applicants,
          shortlisted,
          userDetails: userMap,
        } as GigWithApplicants;
      })
      .filter((gigData) => {
        if (activeGigTab === "shortlist") {
          return gigData.shortlisted.length > 0;
        } else if (activeGigTab === "full-band") {
          return gigData.gig.bookCount && gigData.gig.bookCount.length > 0;
        }
        return gigData.applicants.length > 0;
      });

    console.log("Processed gigs:", processedGigs.length);
    setGigsWithApplicants(processedGigs);

    if (processedGigs.length > 0 && !selectedGig) {
      setSelectedGig(processedGigs[0].gig._id);
    }
  };

  // Handlers
  const handleAddToShortlist = async (
    gigId: Id<"gigs">,
    applicantId: Id<"users">,
    bandRole?: string,
    bandRoleIndex?: number,
  ) => {
    if (!user?.clerkId) {
      toast.error("Authentication required");
      return;
    }

    try {
      await addToShortlist({
        gigId,
        applicantId,
        notes: bandRole ? `Interested for ${bandRole} role` : undefined,
        clerkId: user?.clerkId,
        bandRole,
        bandRoleIndex,
      });
      toast.success(`Added to shortlist for ${bandRole || "gig"}!`);
      processGigsWithApplicants();
    } catch (error) {
      console.error("Failed to add to shortlist:", error);
      toast.error("Failed to add to shortlist");
    }
  };

  const handleRemoveFromShortlist = async (
    gigId: Id<"gigs">,
    applicantId: Id<"users">,
    bandRoleIndex?: number,
  ) => {
    if (!user?.clerkId) {
      toast.error("Authentication required");
      return;
    }

    try {
      await removeFromShortlist({
        gigId,
        applicantId,
        clerkId: user?.clerkId,
      });
      toast.success("Removed from shortlist");
      processGigsWithApplicants();
    } catch (error) {
      console.error("Failed to remove from shortlist:", error);
      toast.error("Failed to remove from shortlist");
    }
  };

  const handleBookMusician = (
    userId: Id<"users">,
    userName: string,
    source?: "regular" | "band-role" | "full-band" | "shortlisted",
    bandId?: Id<"bands">,
    bandRoleIndex?: number,
  ) => {
    setSelectedMusician({
      userId,
      userName,
      source: source || "regular",
      bandId,
      bandRoleIndex,
    });
    setSelectedBand(null);
    setBookingPrice("");
    setShowBookDialog(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedGig || !user?.clerkId) {
      toast.error("No gig selected or authentication required");
      return;
    }

    try {
      let source: "regular" | "band-role" | "full-band" | "shortlisted" =
        selectedMusician?.source || "regular";

      if (activeGigTab === "shortlist" && !selectedMusician?.source) {
        source = "shortlisted";
      }

      const bookingData: any = {
        gigId: selectedGig,
        source: source,
        agreedPrice: bookingPrice ? Number(bookingPrice) : undefined,
        notes: `Booked from ${activeGigTab} tab`,
        clerkId: user?.clerkId,
      };

      if (selectedMusician) {
        bookingData.musicianId = selectedMusician.userId;

        if (
          selectedMusician.source === "full-band" &&
          selectedMusician.bandId
        ) {
          bookingData.bandId = selectedMusician.bandId;
        }

        if (
          selectedMusician.source === "band-role" &&
          selectedMusician.bandRoleIndex !== undefined
        ) {
          bookingData.bandRoleIndex = selectedMusician.bandRoleIndex;
        }
      } else if (selectedBand) {
        bookingData.source = "full-band";
        bookingData.musicianId = selectedBand.bandId;
        bookingData.bandId = selectedBand.bandId;
      } else {
        toast.error("No musician or band selected");
        return;
      }

      await bookMusician(bookingData);

      toast.success(
        `Booked ${selectedMusician?.userName || selectedBand?.bandName || "Unknown"}!`,
      );

      setShowBookDialog(false);
      setSelectedMusician(null);
      setSelectedBand(null);
      processGigsWithApplicants();
    } catch (error: any) {
      console.error("Failed to book:", error);
      toast.error(error.message || "Failed to book");
    }
  };

  const handleViewProfile = async (
    gigId: Id<"gigs">,
    applicantId: Id<"users">,
  ) => {
    try {
      await markApplicantViewed({ gigId, applicantId });
      window.open(`/profile/${applicantId}`, "_blank");
    } catch (error) {
      console.error("Failed to mark as viewed:", error);
      window.open(`/profile/${applicantId}`, "_blank");
    }
  };

  useEffect(() => {
    if (userGigs !== undefined && allUsers !== undefined) {
      processGigsWithApplicants();
      setLoading(false);
    }
  }, [userGigs, allUsers, activeGigTab]);

  // Format helpers
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "shortlisted":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "viewed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "booked":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "updated":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  // Get gig icon based on category
  const getGigIcon = (gig: any) => {
    if (gig.isClientBand) {
      if (gig.bandCategory?.length > 0) {
        return <Users className="w-5 h-5 text-purple-500" />;
      }
      return <Users2 className="w-5 h-5 text-blue-500" />;
    }

    if (gig.bussinesscat === "mc") {
      return <Mic className="w-5 h-5 text-red-500" />;
    }
    if (gig.bussinesscat === "dj") {
      return <Volume2 className="w-5 h-5 text-pink-500" />;
    }
    if (gig.bussinesscat === "vocalist") {
      return <Music className="w-5 h-5 text-green-500" />;
    }
    if (gig.bussinesscat === "full") {
      return <Users className="w-5 h-5 text-orange-500" />;
    }

    return <Music className="w-5 h-5 text-orange-500" />;
  };

  const getGigCategoryLabel = (gig: any) => {
    if (gig.isClientBand) {
      if (gig.bandCategory?.length > 0) {
        return "Band Creation";
      }
      return "Full Band";
    }

    switch (gig.bussinesscat) {
      case "mc":
        return "MC";
      case "dj":
        return "DJ";
      case "vocalist":
        return "Vocalist";
      case "full":
        return "Full Band";
      case "personal":
        return "Individual";
      default:
        return "Gig";
    }
  };

  const getGigCategoryColor = (gig: any) => {
    if (gig.isClientBand) {
      if (gig.bandCategory?.length > 0) {
        return "bg-purple-100 text-purple-800 border-purple-200";
      }
      return "bg-blue-100 text-blue-800 border-blue-200";
    }

    switch (gig.bussinesscat) {
      case "mc":
        return "bg-red-100 text-red-800 border-red-200";
      case "dj":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "vocalist":
        return "bg-green-100 text-green-800 border-green-200";
      case "full":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "personal":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get selected gig data
  const selectedGigData = selectedGig
    ? gigsWithApplicants.find((g) => g.gig._id === selectedGig)
    : gigsWithApplicants[0];

  // Split applicants into active and history
  const activeApplicants =
    selectedGigData?.applicants.filter((applicant) => {
      return !["cancelled", "rejected"].includes(applicant.status);
    }) || [];

  const historyApplicants =
    selectedGigData?.applicants.filter((applicant) => {
      return ["cancelled", "rejected"].includes(applicant.status);
    }) || [];

  // Apply search filter
  const filterBySearch = (applicant: Applicant) => {
    if (!searchTerm) return true;
    const user = selectedGigData?.userDetails.get(applicant.userId);
    const term = searchTerm.toLowerCase();
    return (
      user?.firstname?.toLowerCase().includes(term) ||
      user?.username?.toLowerCase().includes(term) ||
      user?.roleType?.toLowerCase().includes(term) ||
      applicant.bandRole?.toLowerCase().includes(term)
    );
  };

  const filteredActiveApplicants = activeApplicants.filter(filterBySearch);
  const filteredHistoryApplicants = historyApplicants.filter(filterBySearch);
  const filteredShortlist =
    selectedGigData?.shortlisted.filter((shortlistItem) => {
      if (!searchTerm) return true;
      const user = selectedGigData.userDetails.get(shortlistItem.userId);
      const term = searchTerm.toLowerCase();
      return (
        user?.firstname?.toLowerCase().includes(term) ||
        user?.username?.toLowerCase().includes(term) ||
        user?.roleType?.toLowerCase().includes(term) ||
        shortlistItem.bandRole?.toLowerCase().includes(term)
      );
    }) || [];

  // Get applicant count for gig card
  const getGigApplicantCount = (gigData: GigWithApplicants) => {
    switch (activeGigTab) {
      case "shortlist":
        return gigData.shortlisted.length;
      case "full-band":
        return gigData.gig.bookCount?.length || 0;
      default:
        return gigData.applicants.length;
    }
  };

  // Get gig status color
  const getGigStatusColor = (gig: any) => {
    if (gig.isTaken) return "bg-red-100 text-red-800";
    if (gig.isPending) return "bg-yellow-100 text-yellow-800";
    if (gig.bookCount?.length > 0) return "bg-purple-100 text-purple-800";
    return "bg-green-100 text-green-800";
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: easeOut,
      },
    },
    hover: {
      y: -4,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: easeInOut,
      },
    },
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="space-y-6">
          <ScrollArea>
            <div className="flex gap-3 pb-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  className="h-32 w-64 rounded-xl flex-shrink-0"
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header Stats */}
      <PreBookingStats userGigs={userGigs || []} activeTab={activeGigTab} />

      {/* HORIZONTAL GIG NAVIGATION CARDS */}
      <div className="space-y-4">
        {/* Tabs for gig types */}
        <div className="flex items-center justify-between">
          <Tabs
            value={activeGigTab}
            onValueChange={(v: any) => {
              setActiveGigTab(v);
              setSelectedGig(null);
              setSearchTerm("");
              setApplicantView("active"); // Reset to active view when switching gig tabs
            }}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="regular" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Regular</span>
              </TabsTrigger>
              <TabsTrigger
                value="band-roles"
                className="flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                <span className="hidden sm:inline">Band Roles</span>
              </TabsTrigger>
              <TabsTrigger
                value="full-band"
                className="flex items-center gap-2"
              >
                <Users2 className="w-4 h-4" />
                <span className="hidden sm:inline">Full Band</span>
              </TabsTrigger>
              <TabsTrigger
                value="shortlist"
                className="flex items-center gap-2"
              >
                <Bookmark className="w-4 h-4" />
                <span className="hidden sm:inline">Shortlist</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search */}
          <div className="hidden md:block w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Horizontal Gig Cards */}
        {gigsWithApplicants.length > 0 ? (
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4">
              {gigsWithApplicants.map((gigData) => {
                const isSelected = selectedGig === gigData.gig._id;
                const applicantCount = getGigApplicantCount(gigData);

                return (
                  <motion.div
                    key={gigData.gig._id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedGig(gigData.gig._id)}
                    className="flex-shrink-0 w-64"
                  >
                    <Card
                      className={cn(
                        "cursor-pointer transition-all duration-300",
                        isSelected
                          ? "ring-2 ring-orange-500 shadow-xl"
                          : "shadow-md hover:shadow-lg",
                      )}
                    >
                      <CardContent className="p-5">
                        {!isSelected ? (
                          <div className="text-center">
                            <div className="text-3xl font-bold text-gray-800 mb-1">
                              {applicantCount}
                            </div>
                            <div className="text-xs uppercase tracking-wider text-gray-500 mb-3">
                              Applicants
                            </div>
                            <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                              {gigData.gig.title}
                            </h3>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="text-center border-b pb-3">
                              <div className="text-4xl font-bold text-orange-500">
                                {applicantCount}
                              </div>
                              <div className="text-xs uppercase tracking-wider text-gray-500">
                                Total Applicants
                              </div>
                            </div>

                            <div>
                              <h3 className="font-bold text-lg mb-2">
                                {gigData.gig.title}
                              </h3>

                              <div className="space-y-2 text-sm">
                                {gigData.gig.time?.start &&
                                  gigData.gig.time?.end && (
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4 text-gray-400" />
                                      <span>
                                        {gigData.gig.time.start}
                                        {gigData.gig.time.durationFrom} -{" "}
                                        {gigData.gig.time.end}
                                        {gigData.gig.time.durationTo}
                                      </span>
                                    </div>
                                  )}

                                {gigData.gig.location && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span className="truncate">
                                      {gigData.gig.location}
                                    </span>
                                  </div>
                                )}

                                {gigData?.gig?.price &&
                                  gigData?.gig?.price > 0 && (
                                    <div className="flex items-center gap-2 font-semibold text-green-600">
                                      <DollarSign className="w-4 h-4" />
                                      <span>${gigData.gig.price}</span>
                                    </div>
                                  )}
                              </div>
                            </div>

                            {gigData.shortlisted.length > 0 && (
                              <div className="flex items-center justify-between pt-2 border-t">
                                <span className="text-sm text-gray-600">
                                  Shortlisted
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="bg-green-100 text-green-700"
                                >
                                  {gigData.shortlisted.length}
                                </Badge>
                              </div>
                            )}

                            <Badge
                              className={cn(
                                "w-full justify-center",
                                gigData.gig.isTaken
                                  ? "bg-gray-100 text-gray-700"
                                  : "bg-orange-100 text-orange-700",
                              )}
                            >
                              {gigData.gig.isTaken ? "Booked" : "Active"}
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <Card className="text-center p-8">
            <CardContent className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
                <Sparkles className="w-8 h-8 text-gray-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">No Gigs Found</h3>
                <p className="text-gray-500 text-sm">
                  Share your gigs or check back later for applications.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* MAIN CONTENT AREA */}
      {selectedGigData ? (
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="space-y-6">
              {/* Gig Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {getGigIcon(selectedGigData.gig)}
                    <div>
                      <h1 className="text-xl md:text-2xl font-bold">
                        {selectedGigData.gig.title}
                      </h1>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge
                          className={getGigStatusColor(selectedGigData.gig)}
                        >
                          {selectedGigData.gig.isTaken ? "Booked" : "Active"}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {formatDate(selectedGigData.gig.date)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    router.push(
                      `/hub/gigs/client/edit/${selectedGigData.gig._id}`,
                    );
                  }}
                  className="flex items-center gap-2 border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                  <Edit className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit Gig</span>
                </Button>
              </div>

              {/* Gig Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Users className="w-5 h-5 text-blue-500" />
                    <span className="text-lg font-bold">
                      {activeApplicants.length}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Active
                  </span>
                </div>
                <div className="text-center p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Bookmark className="w-5 h-5 text-green-500" />
                    <span className="text-lg font-bold">
                      {selectedGigData.shortlisted.length}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Shortlisted
                  </span>
                </div>
                <div className="text-center p-3 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <DollarSign className="w-5 h-5 text-purple-500" />
                    <span className="text-lg font-bold">
                      ${selectedGigData.gig.price || "0"}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Budget
                  </span>
                </div>
                <div className="text-center p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Archive className="w-5 h-5 text-gray-500" />
                    <span className="text-lg font-bold">
                      {historyApplicants.length}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    History
                  </span>
                </div>
              </div>

              {/* Tab Content */}
              {activeGigTab === "shortlist" ? (
                <ShortlistTab
                  selectedGigData={selectedGigData}
                  filteredShortlist={filteredShortlist}
                  handleRemoveFromShortlist={handleRemoveFromShortlist}
                  handleViewProfile={handleViewProfile}
                  handleBookMusician={handleBookMusician}
                  formatTime={formatTime}
                />
              ) : (
                <Tabs
                  value={activeTab}
                  onValueChange={(v: any) => setActiveTab(v)}
                  className="mt-6"
                >
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="applicants" className="relative">
                      <Users className="w-4 h-4 mr-2" />
                      Applicants
                      {activeApplicants.length > 0 && (
                        <Badge className="ml-2 bg-blue-500 text-white text-xs px-1.5">
                          {activeApplicants.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="history" className="relative">
                      <History className="w-4 h-4 mr-2" />
                      History
                      {historyApplicants.length > 0 && (
                        <Badge className="ml-2 bg-gray-500 text-white text-xs px-1.5">
                          {historyApplicants.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="applicants" className="space-y-4">
                    {/* Applicant View Toggle */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant={
                            applicantView === "active" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setApplicantView("active")}
                          className={cn(
                            "text-xs",
                            applicantView === "active" && "bg-blue-600",
                          )}
                        >
                          <Users className="w-3 h-3 mr-1" />
                          Active ({filteredActiveApplicants.length})
                        </Button>
                        <Button
                          variant={
                            applicantView === "history" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setApplicantView("history")}
                          className={cn(
                            "text-xs",
                            applicantView === "history" && "bg-gray-600",
                          )}
                        >
                          <Archive className="w-3 h-3 mr-1" />
                          History ({filteredHistoryApplicants.length})
                        </Button>
                      </div>
                    </div>

                    {/* Content based on view */}
                    {applicantView === "active" ? (
                      <>
                        {activeGigTab === "regular" && (
                          <RegularGigsTab
                            selectedGigData={{
                              ...selectedGigData,
                              applicants: filteredActiveApplicants,
                            }}
                            filteredApplicants={filteredActiveApplicants}
                            handleAddToShortlist={handleAddToShortlist}
                            handleRemoveFromShortlist={
                              handleRemoveFromShortlist
                            }
                            handleViewProfile={handleViewProfile}
                            handleBookMusician={(
                              userId: Id<"users">,
                              userName: string,
                            ) =>
                              handleBookMusician(userId, userName, "regular")
                            }
                            getStatusColor={getStatusColor}
                          />
                        )}
                        {activeGigTab === "band-roles" && (
                          <BandRolesTab
                            selectedGigData={{
                              ...selectedGigData,
                              applicants: filteredActiveApplicants,
                            }}
                            filteredApplicants={filteredActiveApplicants}
                            clerkId={user?.clerkId!}
                          />
                        )}
                        {activeGigTab === "full-band" && (
                          <FullBandTab
                            selectedGigData={selectedGigData}
                            handleAddToShortlist={handleAddToShortlist}
                            handleRemoveFromShortlist={
                              handleRemoveFromShortlist
                            }
                            handleViewProfile={handleViewProfile}
                            handleBookMusician={handleBookMusician}
                            getStatusColor={getStatusColor}
                          />
                        )}
                      </>
                    ) : (
                      /* History View - Show cancelled/rejected applicants */
                      <div className="space-y-3">
                        {filteredHistoryApplicants.length > 0 ? (
                          filteredHistoryApplicants.map((applicant) => {
                            const userData = selectedGigData.userDetails.get(
                              applicant.userId,
                            );
                            if (!userData) return null;

                            return (
                              <Card
                                key={applicant.userId}
                                className="opacity-75 hover:opacity-100 transition-opacity"
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="w-10 h-10">
                                      <AvatarImage src={userData.picture} />
                                      <AvatarFallback>
                                        {userData.firstname?.charAt(0) || "U"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-medium">
                                          {userData.firstname}{" "}
                                          {userData.username}
                                        </h4>
                                        {applicant.bandRole && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {applicant.bandRole}
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge
                                          className={getStatusColor(
                                            applicant.status,
                                          )}
                                        >
                                          {applicant.status === "cancelled"
                                            ? "Cancelled"
                                            : "Rejected"}
                                        </Badge>
                                        <span className="text-xs text-gray-500">
                                          {formatDate(applicant.appliedAt)}
                                        </span>
                                      </div>
                                      {applicant.status === "cancelled" && (
                                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                          <AlertCircle className="w-3 h-3" />
                                          Booking was cancelled
                                        </p>
                                      )}
                                      {applicant.status === "rejected" && (
                                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                          <XCircle className="w-3 h-3" />
                                          Application was not accepted
                                        </p>
                                      )}
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        handleViewProfile(
                                          selectedGigData.gig._id,
                                          applicant.userId,
                                        )
                                      }
                                      className="flex-shrink-0"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Archive className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No cancelled or rejected applicants</p>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="history">
                    <HistoryTab
                      selectedGigData={selectedGigData}
                      formatTime={formatTime}
                      getStatusColor={getStatusColor}
                    />
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        // Empty State when no gig selected
        <Card className="text-center py-16">
          <CardContent className="space-y-6">
            <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20">
              <Target className="w-12 h-12 text-orange-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-3">Select a Gig</h3>
              <p className="text-gray-500 text-lg max-w-md mx-auto">
                Choose a gig from the cards above to view applicants and manage
                bookings.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Award className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium text-gray-600">
                {gigsWithApplicants.length} gigs available
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Book Now Dialog */}
      <Dialog open={showBookDialog} onOpenChange={setShowBookDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedBand ? "Book Band" : "Book Musician"}
            </DialogTitle>
            <DialogDescription>
              Confirm booking for{" "}
              {selectedBand?.bandName || selectedMusician?.userName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border-2 border-white shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                    {selectedBand?.bandName?.charAt(0) ||
                      selectedMusician?.userName?.charAt(0) ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">
                    {selectedBand?.bandName || selectedMusician?.userName}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {selectedBand ? "Band" : "Musician"} ready to book for{" "}
                    {selectedGigData?.gig.title}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Agreed Price (Optional)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="number"
                  placeholder="Enter agreed price"
                  value={bookingPrice}
                  onChange={(e) =>
                    setBookingPrice(
                      e.target.value ? Number(e.target.value) : "",
                    )
                  }
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Leave empty to use the gig's listed price
              </p>
            </div>

            <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Booking Confirmation
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {selectedBand
                      ? "The band members will receive notifications and can confirm the booking."
                      : "The musician will receive a notification and can confirm the booking."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowBookDialog(false);
                setSelectedMusician(null);
                setSelectedBand(null);
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmBooking}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Band Booking Options Section */}
      {selectedGigData?.gig.isClientBand &&
        selectedGigData?.gig.bandCategory &&
        selectedGigData?.gig.bandCategory.length > 0 && (
          <div className="mt-8 border-t pt-8">
            <BookingOptionsSection
              gigId={selectedGigData.gig._id}
              clerkId={user?.clerkId!}
              gig={selectedGigData.gig}
              musiciansCount={selectedGigData.gig.bandCategory.reduce(
                (total, role) => total + (role.bookedUsers?.length || 0),
                0,
              )}
            />
          </div>
        )}
    </div>
  );
};
