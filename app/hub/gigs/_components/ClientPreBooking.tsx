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
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";

interface ClientPreBookingProps {
  user: any;
}

export const ClientPreBooking: React.FC<ClientPreBookingProps> = ({ user }) => {
  const router = useRouter();
  const { userId: clerkId } = useAuth();
  const { colors, isDarkMode } = useThemeColors();
  const isMobile = useMediaQuery("(max-width: 768px)"); // 768px for mobile

  const userId = user?.clerkId || {};
  // Queries
  const userGigs = useQuery(
    api.controllers.gigs.getGigsByUser,
    clerkId ? { clerkId: clerkId } : "skip"
  );

  // State
  const [activeTab, setActiveTab] = useState<"applicants" | "history">(
    "applicants"
  );
  const [activeGigTab, setActiveGigTab] = useState<GigTabType>("regular");
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

      // Check if gig is not taken
      if (typedGig.isTaken) return;

      // Regular gigs count
      if (!typedGig.isClientBand) {
        const hasInterested =
          typedGig.interestedUsers && typedGig.interestedUsers.length > 0;
        if (hasInterested) counts.regular++;
      }

      // Band roles count
      if (typedGig.isClientBand && typedGig.bandCategory) {
        const hasRoleApplicants = typedGig.bandCategory.some(
          (role: any) => role.applicants && role.applicants.length > 0
        );
        if (hasRoleApplicants) counts.bandRoles++;
      }

      // Full band count
      if (typedGig.isClientBand) {
        const hasBandApplications =
          typedGig.bookCount && typedGig.bookCount.length > 0;
        if (hasBandApplications) counts.fullBand++;
      }

      // Shortlist count
      const hasShortlisted =
        typedGig.shortlistedUsers && typedGig.shortlistedUsers.length > 0;
      if (hasShortlisted) counts.shortlist++;
    });

    return counts;
  };

  const tabCounts = getTabCounts();
  const allUsers = useQuery(api.controllers.user.getAllUsers);

  // Mutations
  const addToShortlist = useMutation(api.controllers.prebooking.addToShortlist);
  const removeFromShortlist = useMutation(
    api.controllers.prebooking.removeFromShortlist
  );
  const bookMusician = useMutation(api.controllers.prebooking.bookMusician);
  const removeApplicant = useMutation(
    api.controllers.prebooking.removeApplicant
  );
  const markApplicantViewed = useMutation(
    api.controllers.prebooking.markApplicantViewed
  );

  // Effects
  useEffect(() => {
    if (userGigs && allUsers) {
      processGigsWithApplicants();
      setLoading(false);
    }
  }, [userGigs, allUsers, activeGigTab]);

  // Process gigs data
  const processGigsWithApplicants = () => {
    if (!userGigs || !allUsers) return;

    const userMap = new Map();
    allUsers.forEach((user) => {
      userMap.set(user._id, user);
    });

    const processedGigs = userGigs
      .filter((gig) => {
        const hasInterested =
          gig.interestedUsers && gig.interestedUsers.length > 0;
        const hasShortlisted =
          gig.shortlistedUsers && gig.shortlistedUsers.length > 0;
        const hasBandApplications = gig.bookCount && gig.bookCount.length > 0;
        const isNotTaken = !gig.isTaken;

        switch (activeGigTab) {
          case "regular":
            return !gig.isClientBand && hasInterested && isNotTaken;
          case "band-roles":
            if (!gig.isClientBand || !gig.bandCategory) return false;
            const hasRoleApplicants = gig.bandCategory.some(
              (role) => role.applicants && role.applicants.length > 0
            );
            return hasRoleApplicants && isNotTaken;
          case "full-band":
            return gig.isClientBand && hasBandApplications && isNotTaken;
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

        switch (activeGigTab) {
          case "regular":
            applicants = (typedGig.interestedUsers || []).map(
              (userId: Id<"users">) => {
                const statusHistory = bookingHistory.filter(
                  (entry: any) => entry.userId === userId
                );

                let status: Applicant["status"] = "pending";
                if (
                  statusHistory.some((entry: any) => entry.status === "booked")
                ) {
                  status = "booked";
                } else if (
                  typedGig.shortlistedUsers?.some(
                    (item: any) => item.userId === userId
                  )
                ) {
                  status = "shortlisted";
                } else if (
                  statusHistory.some(
                    (entry: any) => entry.status === "rejected"
                  )
                ) {
                  status = "rejected";
                } else if (
                  statusHistory.some(
                    (entry: any) =>
                      entry.status === "updated" || entry.status === "viewed"
                  )
                ) {
                  status = "viewed";
                }

                return {
                  userId,
                  appliedAt: typedGig.createdAt,
                  status,
                  gigId: typedGig._id,
                };
              }
            );
            break;

          case "band-roles":
            if (typedGig.bandCategory) {
              typedGig.bandCategory.forEach((role: any, roleIndex: number) => {
                (role.applicants || []).forEach((userId: Id<"users">) => {
                  const statusHistory = bookingHistory.filter(
                    (entry: any) =>
                      entry.userId === userId &&
                      entry.bandRoleIndex === roleIndex
                  );

                  let status: Applicant["status"] = "pending";
                  if (
                    statusHistory.some(
                      (entry: any) => entry.status === "booked"
                    )
                  ) {
                    status = "booked";
                  } else if (
                    typedGig.shortlistedUsers?.some(
                      (item: any) =>
                        item.userId === userId &&
                        item.bandRoleIndex === roleIndex
                    )
                  ) {
                    status = "shortlisted";
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

                (role.bookedUsers || []).forEach((userId: Id<"users">) => {
                  applicants.push({
                    userId,
                    appliedAt: typedGig.createdAt,
                    status: "booked",
                    gigId: typedGig._id,
                    bandRole: role.role,
                    bandRoleIndex: roleIndex,
                  });
                });
              });
            }
            break;
        }

        shortlisted = (typedGig.shortlistedUsers || []).map((item: any) => ({
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
        return gigData.applicants.length > 0 || gigData.shortlisted.length > 0;
      });

    setGigsWithApplicants(processedGigs);
    if (processedGigs.length > 0 && !selectedGig) {
      setSelectedGig(processedGigs[0].gig._id);
    }
  };

  // Action handlers
  const handleAddToShortlist = async (
    gigId: Id<"gigs">,
    applicantId: Id<"users">,
    bandRole?: string,
    bandRoleIndex?: number
  ) => {
    try {
      await addToShortlist({
        gigId,
        applicantId,
        notes: bandRole ? `Interested for ${bandRole} role` : undefined,
        clerkId: userId!,
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
    bandRoleIndex?: number
  ) => {
    if (!clerkId) {
      toast.error("Authentication required");
      return;
    }

    try {
      await removeFromShortlist({
        gigId,
        applicantId,
        clerkId,
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
    bandRoleIndex?: number
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
    if (!selectedGig) {
      toast.error("No gig selected");
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
        clerkId: userId!,
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
        `Booked ${selectedMusician?.userName || selectedBand?.bandName || "Unknown"}!`
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
    applicantId: Id<"users">
  ) => {
    try {
      await markApplicantViewed({ gigId, applicantId });
      window.open(`/profile/${applicantId}`, "_blank");
    } catch (error) {
      console.error("Failed to mark as viewed:", error);
      window.open(`/profile/${applicantId}`, "_blank");
    }
  };

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

    // Check for specific talent types
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

  // Filter functions
  const filteredApplicants = selectedGigData?.applicants.filter((applicant) => {
    if (!searchTerm) return true;
    const user = selectedGigData.userDetails.get(applicant.userId);
    const term = searchTerm.toLowerCase();
    return (
      user?.firstname?.toLowerCase().includes(term) ||
      user?.username?.toLowerCase().includes(term) ||
      user?.roleType?.toLowerCase().includes(term) ||
      applicant.bandRole?.toLowerCase().includes(term)
    );
  });

  const filteredShortlist = selectedGigData?.shortlisted.filter(
    (shortlistItem) => {
      if (!searchTerm) return true;
      const user = selectedGigData.userDetails.get(shortlistItem.userId);
      const term = searchTerm.toLowerCase();
      return (
        user?.firstname?.toLowerCase().includes(term) ||
        user?.username?.toLowerCase().includes(term) ||
        user?.roleType?.toLowerCase().includes(term) ||
        shortlistItem.bandRole?.toLowerCase().includes(term)
      );
    }
  );

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

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    hover: {
      y: -4,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="space-y-6">
          {/* Horizontal cards skeleton */}
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
                placeholder="Search gigs..."
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
              placeholder="Search gigs..."
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
                const shortlistedCount = gigData.shortlisted.length;
                const hasShortlisted = shortlistedCount > 0;
                const category = getGigCategoryLabel(gigData.gig);
                const categoryColor = getGigCategoryColor(gigData.gig);

                return (
                  <motion.div
                    key={gigData.gig._id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedGig(gigData.gig._id)}
                    className="flex-shrink-0 w-72 md:w-80"
                  >
                    <Card
                      className={cn(
                        "cursor-pointer transition-all duration-300 group h-full",
                        colors.border,
                        isSelected
                          ? "ring-2 ring-orange-500 shadow-xl"
                          : "shadow-md hover:shadow-lg",
                        "overflow-hidden"
                      )}
                    >
                      <CardContent className="p-4">
                        {/* Header with icon and category */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "p-2 rounded-lg",
                                isSelected
                                  ? "bg-gradient-to-r from-orange-500 to-amber-500"
                                  : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900"
                              )}
                            >
                              {getGigIcon(gigData.gig)}
                            </div>
                            <div>
                              <Badge
                                className={cn(
                                  "text-xs font-medium",
                                  categoryColor
                                )}
                              >
                                {category}
                              </Badge>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              getGigStatusColor(gigData.gig)
                            )}
                          >
                            {gigData.gig.isTaken ? "Booked" : "Active"}
                          </Badge>
                        </div>

                        {/* Gig Title */}
                        <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
                          {gigData.gig.title}
                        </h3>

                        {/* Stats row */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4 text-blue-500" />
                              <span className="font-semibold text-sm">
                                {applicantCount}
                              </span>
                              <span className="text-xs text-gray-500">
                                applied
                              </span>
                            </div>
                            {hasShortlisted && (
                              <div className="flex items-center gap-1">
                                <Bookmark className="w-4 h-4 text-green-500" />
                                <span className="font-semibold text-sm">
                                  {shortlistedCount}
                                </span>
                                <span className="text-xs text-gray-500">
                                  shortlisted
                                </span>
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                          )}
                        </div>

                        {/* Date and Location */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {formatDate(gigData.gig.date)}
                            </span>
                            {gigData.gig.time?.start && (
                              <>
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">
                                  {gigData.gig.time.start}
                                </span>
                              </>
                            )}
                          </div>
                          {gigData.gig.location && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600 truncate">
                                {gigData.gig.location.split(",")[0]}
                              </span>
                            </div>
                          )}
                          {gigData.gig.price && gigData.gig.price > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="w-4 h-4 text-green-500" />
                              <span className="font-semibold text-green-600">
                                ${gigData.gig.price}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Bottom gradient bar */}
                        <div
                          className={cn(
                            "absolute bottom-0 left-0 right-0 h-1 rounded-b-lg transition-all duration-300",
                            isSelected
                              ? "bg-gradient-to-r from-orange-500 to-amber-500"
                              : "bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-amber-400"
                          )}
                        />
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
                          {selectedGigData.gig.time?.start && (
                            <>
                              <Clock className="w-4 h-4 ml-2" />
                              {selectedGigData.gig.time.start}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gig Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Users className="w-5 h-5 text-blue-500" />
                    <span className="text-lg font-bold">
                      {selectedGigData.applicants.length}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Applicants
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
                <div className="text-center p-3 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <MapPin className="w-5 h-5 text-orange-500" />
                    <span className="text-lg font-bold truncate">
                      {selectedGigData.gig.location?.split(",")[0] || "Remote"}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Location
                  </span>
                </div>
              </div>

              {/* Tab Content */}
              {activeGigTab === "shortlist" ? (
                <ShortlistTab
                  selectedGigData={selectedGigData}
                  filteredShortlist={filteredShortlist || []}
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
                    <TabsTrigger value="applicants">
                      <Users className="w-4 h-4 mr-2" />
                      {activeGigTab === "full-band"
                        ? `Bands (${selectedGigData.gig.bookCount?.length || 0})`
                        : `Applicants (${filteredApplicants?.length || 0})`}
                    </TabsTrigger>
                    <TabsTrigger value="history">
                      <History className="w-4 h-4 mr-2" />
                      History
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="applicants" className="space-y-4">
                    {activeGigTab === "regular" && (
                      <RegularGigsTab
                        selectedGigData={selectedGigData}
                        filteredApplicants={filteredApplicants || []}
                        handleAddToShortlist={handleAddToShortlist}
                        handleRemoveFromShortlist={handleRemoveFromShortlist}
                        handleViewProfile={handleViewProfile}
                        handleBookMusician={handleBookMusician}
                        getStatusColor={getStatusColor}
                      />
                    )}
                    {activeGigTab === "band-roles" && (
                      <BandRolesTab
                        selectedGigData={selectedGigData}
                        filteredApplicants={filteredApplicants || []}
                        clerkId={clerkId!}
                      />
                    )}
                    {activeGigTab === "full-band" && (
                      <FullBandTab
                        selectedGigData={selectedGigData}
                        handleAddToShortlist={handleAddToShortlist}
                        handleRemoveFromShortlist={handleRemoveFromShortlist}
                        handleViewProfile={handleViewProfile}
                        handleBookMusician={handleBookMusician}
                        getStatusColor={getStatusColor}
                      />
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
                {gigsWithApplicants.length} gigs available •{" "}
                {gigsWithApplicants.reduce(
                  (acc, gig) => acc + gig.applicants.length,
                  0
                )}{" "}
                total applicants
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
                      e.target.value ? Number(e.target.value) : ""
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

      {/* Band Booking Options Section - Only show for client-created band gigs */}
      {selectedGigData?.gig.isClientBand &&
        selectedGigData?.gig.bandCategory &&
        selectedGigData?.gig.bandCategory.length > 0 && (
          <div className="mt-8 border-t pt-8">
            <BookingOptionsSection
              gigId={selectedGigData.gig._id}
              clerkId={clerkId!} // Use clerkId
              gig={selectedGigData.gig}
              musiciansCount={selectedGigData.gig.bandCategory.reduce(
                (total, role) => total + (role.bookedUsers?.length || 0),
                0
              )}
            />
          </div>
        )}
    </div>
  );
};
