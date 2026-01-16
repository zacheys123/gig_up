// components/gigs/ClientPreBooking.tsx (UPDATED VERSION)
import React, { useState, useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "lucide-react";

// Custom Components
import { ChatIcon } from "@/components/chat/ChatIcon";

// Tab Components
import { BandRolesTab } from "@/components/booking/BandGigWithRoleTab";

import { HistoryTab } from "@/components/booking/History";
import { RegularGigsTab } from "@/components/booking/RegularGigsTab";
import { StatsCards } from "@/components/booking/StatsCards";
// Types
import {
  Applicant,
  ShortlistedUser,
  GigWithApplicants,
  GigTabType,
} from "@/types/bookings";
import { ShortlistTab } from "@/components/booking/ShortlIstTab";
import { GigInfoCard } from "@/components/booking/GigInfo";
import { FullBandTab } from "@/components/booking/FullBandGig";
import { BookingOptionsSection } from "./BookingOptions";
import { PreBookingStats } from "./gigs/PreBookingStats";

interface ClientPreBookingProps {
  user: any;
}

export const ClientPreBooking: React.FC<ClientPreBookingProps> = ({ user }) => {
  const router = useRouter();
  const { userId } = useAuth();

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

  const getTotalApplicants = () => {
    if (!userGigs) return 0;

    switch (activeGigTab) {
      case "regular":
        return userGigs.reduce((total, gig) => {
          if (
            !gig.isClientBand &&
            gig.interestedUsers &&
            gig.interestedUsers.length > 0
          ) {
            return total + gig.interestedUsers.length;
          }
          return total;
        }, 0);

      case "band-roles":
        return userGigs.reduce((total, gig) => {
          if (gig.isClientBand && gig.bandCategory) {
            return (
              total +
              gig.bandCategory.reduce((roleTotal, role) => {
                return roleTotal + (role.applicants?.length || 0);
              }, 0)
            );
          }
          return total;
        }, 0);

      case "full-band":
        return userGigs.reduce((total, gig) => {
          if (gig.isClientBand && gig.bookCount) {
            return total + gig.bookCount.length;
          }
          return total;
        }, 0);

      case "shortlist":
        return userGigs.reduce((total, gig) => {
          if (gig.shortlistedUsers) {
            return total + gig.shortlistedUsers.length;
          }
          return total;
        }, 0);

      default:
        return 0;
    }
  };

  // Calculate total shortlisted users
  const getTotalShortlisted = () => {
    if (!userGigs) return 0;
    return userGigs.reduce((total, gig) => {
      return total + (gig.shortlistedUsers?.length || 0);
    }, 0);
  };
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

  // Queries
  const userGigs = useQuery(
    api.controllers.gigs.getGigsByUser,
    userId ? { clerkId: userId } : "skip"
  );

  const allUsers = useQuery(api.controllers.user.getAllUsers);

  // Effects
  useEffect(() => {
    if (userGigs && allUsers) {
      processGigsWithApplicants();
      setLoading(false);
    }
  }, [userGigs, allUsers, activeGigTab]);

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

        // Filter based on active tab
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
            // Show gigs that have band applications in bookCount
            return gig.isClientBand && hasBandApplications && isNotTaken;
          case "shortlist":
            return hasShortlisted && isNotTaken;
          default:
            return false;
        }
      })
      .map((gig) => {
        // Cast gig to avoid type errors
        const typedGig = gig as any;

        let applicants: Applicant[] = [];
        let shortlisted: ShortlistedUser[] = [];

        // Cast bookingHistory
        const bookingHistory = typedGig.bookingHistory || [];

        switch (activeGigTab) {
          case "regular":
            // Process regular gig applicants
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
            // Process band role applicants
            if (typedGig.bandCategory) {
              typedGig.bandCategory.forEach((role: any, roleIndex: number) => {
                // Applicants for this role
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

                // Booked users for this role
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

          case "full-band":
            // For full-band tab, we don't need individual applicants
            applicants = [];
            break;
        }

        // Get shortlisted users for all gig types
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
          // For full-band, check if gig has bookCount entries
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
    try {
      await removeFromShortlist({ gigId, applicantId });
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
      source: source || "regular", // Default to regular if not specified
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
      // Determine source based on what's selected
      let source: "regular" | "band-role" | "full-band" | "shortlisted" =
        selectedMusician?.source || "regular";

      // If we're in shortlist tab but the musician doesn't have source, set it
      if (activeGigTab === "shortlist" && !selectedMusician?.source) {
        source = "shortlisted";
      }

      // Prepare booking data
      const bookingData: any = {
        gigId: selectedGig,
        source: source,
        agreedPrice: bookingPrice ? Number(bookingPrice) : undefined,
        notes: `Booked from ${activeGigTab} tab`,
        clerkId: userId!,
      };

      // Add musicianId or bandId based on what's selected
      if (selectedMusician) {
        bookingData.musicianId = selectedMusician.userId;

        // Add bandId for full-band bookings
        if (
          selectedMusician.source === "full-band" &&
          selectedMusician.bandId
        ) {
          bookingData.bandId = selectedMusician.bandId;
        }

        // Add bandRoleIndex for band-role bookings
        if (
          selectedMusician.source === "band-role" &&
          selectedMusician.bandRoleIndex !== undefined
        ) {
          bookingData.bandRoleIndex = selectedMusician.bandRoleIndex;
        }
      } else if (selectedBand) {
        // Fallback for backward compatibility
        bookingData.source = "full-band";
        bookingData.musicianId = selectedBand.bandId; // This will need to be a userId, not bandId
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

  const handleRemove = async (gigId: Id<"gigs">, applicantId: Id<"users">) => {
    if (!confirm("Are you sure you want to remove this applicant?")) return;

    try {
      await removeApplicant({ gigId, applicantId });
      toast.success("Musician removed");
      processGigsWithApplicants();
    } catch (error) {
      console.error("Failed to remove applicant:", error);
      toast.error("Failed to remove");
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

  const getRoleIcon = (roleType: string) => {
    if (!roleType) return "🎵";
    const role = roleType.toLowerCase();
    if (role.includes("vocal")) return "🎤";
    if (role.includes("guitar")) return "🎸";
    if (role.includes("piano") || role.includes("keyboard")) return "🎹";
    if (role.includes("drum")) return "🥁";
    if (role.includes("bass")) return "🎸";
    if (role.includes("dj")) return "🎧";
    if (role.includes("mc")) return "🎤";
    return "🎵";
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

  // Empty state content
  const getEmptyStateIcon = () => {
    switch (activeGigTab) {
      case "shortlist":
        return (
          <BookmarkIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        );
      case "band-roles":
        return <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />;
      case "full-band":
        return <Users2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />;
      default:
        return <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />;
    }
  };

  const getEmptyStateMessage = () => {
    switch (activeGigTab) {
      case "shortlist":
        return {
          title: "No Shortlisted Gigs",
          description:
            "Shortlist musicians from other tabs to compare and book them here.",
        };
      case "band-roles":
        return {
          title: "No Band Roles with Applicants",
          description: "No band role applicants yet",
        };
      case "full-band":
        return {
          title: "No Bands Have Applied",
          description: "No bands have applied to this gig yet",
        };
      default:
        return {
          title: "No Regular Gigs with Applicants",
          description: "No applicants for regular gigs yet",
        };
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[300px] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <PreBookingStats userGigs={userGigs || []} activeTab={activeGigTab} />

      {/* Main Content */}
      <Card>
        <CardContent className="p-4">
          {/* 4-Tab Gig Type Selector */}
          <div className="mb-6">
            <Tabs
              value={activeGigTab}
              onValueChange={(v: any) => {
                setActiveGigTab(v);
                setSelectedGig(null);
                setSearchTerm("");
                setSelectedMusician(null);
                setSelectedBand(null);
              }}
            >
              <TabsList className="grid grid-cols-2 md:grid-cols-4">
                <TabsTrigger
                  value="regular"
                  className="flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Regular</span>
                  <Badge variant="secondary" className="ml-2">
                    {
                      gigsWithApplicants.filter((g) => !g.gig.isClientBand)
                        .length
                    }
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="band-roles"
                  className="flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Band Roles</span>
                  <Badge variant="secondary" className="ml-2">
                    {
                      gigsWithApplicants.filter(
                        (g) =>
                          g.gig.isClientBand &&
                          g.gig.bandCategory &&
                          g.gig.bandCategory.length > 0
                      ).length
                    }
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="full-band"
                  className="flex items-center gap-2"
                >
                  <Users2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Full Band</span>
                  <Badge variant="secondary" className="ml-2">
                    {
                      gigsWithApplicants.filter(
                        (g) =>
                          g.gig.isClientBand &&
                          g.gig.bookCount &&
                          g.gig.bookCount.length > 0
                      ).length
                    }
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="shortlist"
                  className="flex items-center gap-2"
                >
                  <Bookmark className="w-4 h-4" />
                  <span className="hidden sm:inline">Shortlist</span>
                  <Badge variant="secondary" className="ml-2">
                    {
                      gigsWithApplicants.filter((g) => g.shortlisted.length > 0)
                        .length
                    }
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Gig Selection */}
          {gigsWithApplicants.length > 0 ? (
            <div className="space-y-6">
              {/* Gig Selector and Search */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    Select Gig
                  </label>
                  <Select
                    value={selectedGig || ""}
                    onValueChange={(value) => {
                      setSelectedGig(
                        value === "" ? null : (value as Id<"gigs">)
                      );
                      setSelectedMusician(null);
                      setSelectedBand(null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a gig" />
                    </SelectTrigger>
                    <SelectContent>
                      {gigsWithApplicants.map((gigWithApps) => (
                        <SelectItem
                          key={gigWithApps.gig._id}
                          value={gigWithApps.gig._id}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">
                              {gigWithApps.gig.title}
                            </span>
                            <div className="flex gap-1">
                              {activeGigTab === "shortlist" ? (
                                <Badge className="bg-orange-100 text-orange-800">
                                  {gigWithApps.shortlisted.length}
                                </Badge>
                              ) : activeGigTab === "full-band" ? (
                                <Badge className="bg-purple-100 text-purple-800">
                                  {gigWithApps.gig.bookCount?.length || 0}
                                </Badge>
                              ) : (
                                <>
                                  <Badge className="bg-blue-100 text-blue-800">
                                    {gigWithApps.applicants.length}
                                  </Badge>
                                  <Badge className="bg-green-100 text-green-800">
                                    {gigWithApps.shortlisted.length}
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder={
                        activeGigTab === "shortlist"
                          ? "Search shortlisted musicians..."
                          : activeGigTab === "full-band"
                            ? "Search bands..."
                            : "Search musicians..."
                      }
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
              {selectedGigData && (
                <>
                  {/* Gig Info Card */}
                  <GigInfoCard
                    gig={selectedGigData.gig}
                    activeGigTab={activeGigTab}
                    applicantsCount={selectedGigData.applicants.length}
                    shortlistedCount={selectedGigData.shortlisted.length}
                    formatDate={formatDate}
                    getRoleIcon={getRoleIcon}
                  />

                  {/* Render Tab Content */}
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
                    >
                      <TabsList className="grid grid-cols-2 mb-6">
                        <TabsTrigger
                          value="applicants"
                          className="flex items-center gap-2"
                        >
                          <Users className="w-4 h-4" />
                          {activeGigTab === "full-band"
                            ? `Bands (${selectedGigData.gig.bookCount?.length || 0})`
                            : `Applicants (${filteredApplicants?.length || 0})`}
                        </TabsTrigger>
                        <TabsTrigger
                          value="history"
                          className="flex items-center gap-2"
                        >
                          <History className="w-4 h-4" />
                          History
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="applicants" className="space-y-4">
                        {activeGigTab === "regular" && (
                          <RegularGigsTab
                            selectedGigData={selectedGigData}
                            filteredApplicants={filteredApplicants || []}
                            handleAddToShortlist={handleAddToShortlist}
                            handleRemoveFromShortlist={
                              handleRemoveFromShortlist
                            }
                            handleViewProfile={handleViewProfile}
                            handleBookMusician={handleBookMusician}
                            getStatusColor={getStatusColor}
                          />
                        )}
                        {activeGigTab === "band-roles" && (
                          <BandRolesTab
                            selectedGigData={selectedGigData}
                            filteredApplicants={filteredApplicants || []}
                            handleAddToShortlist={handleAddToShortlist}
                            handleRemoveFromShortlist={
                              handleRemoveFromShortlist
                            }
                            handleViewProfile={handleViewProfile}
                            handleBookMusician={handleBookMusician}
                            getStatusColor={getStatusColor}
                            getRoleIcon={getRoleIcon}
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
                            handleBookMusician={handleBookMusician} // Pass the enhanced function
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
                </>
              )}

              {/* Band Booking Options Section - Only show for client-created band gigs */}
              {selectedGigData?.gig.isClientBand &&
                selectedGigData?.gig.bandCategory &&
                selectedGigData?.gig.bandCategory.length > 0 && (
                  <div className="mt-8 border-t pt-8">
                    <BookingOptionsSection
                      gigId={selectedGigData.gig._id}
                      clerkId={userId!}
                      gig={selectedGigData.gig}
                      musiciansCount={selectedGigData.gig.bandCategory.reduce(
                        (total, role) =>
                          total + (role.bookedUsers?.length || 0),
                        0
                      )}
                    />
                  </div>
                )}
            </div>
          ) : (
            // Empty state
            <Card className="text-center py-12">
              <CardContent>
                {getEmptyStateIcon()}
                <h3 className="text-xl font-semibold mb-2">
                  {getEmptyStateMessage().title}
                </h3>
                <p className="text-gray-500 mb-6">
                  {getEmptyStateMessage().description}
                </p>
                <Button
                  onClick={() => router.push("/hub/gigs")}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
                >
                  View Your Gigs
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

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
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-green-100 text-green-800">
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

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
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
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
