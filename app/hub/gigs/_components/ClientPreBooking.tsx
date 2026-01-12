// components/gigs/ClientPreBooking.tsx (UPDATED - SIMPLIFIED)
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
  DollarSign as DollarSignIcon,
  History,
} from "lucide-react";

// Types
import {
  Applicant,
  ShortlistedUser,
  GigWithApplicants,
  GigTabType,
} from "@/types/bookings";
import { ShortlistTab } from "./booking/ShortlIstTab";
import { GigInfoCard } from "./booking/GigInfo";

import { BandRolesTab } from "./booking/BandGigWithRoleTab";
import { FullBandTab } from "./booking/FullBandGig";
import { HistoryTab } from "./booking/History";
import { RegularGigsTab } from "./booking/RegularGigsTab";

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
  } | null>(null);
  const [bookingPrice, setBookingPrice] = useState<number | "">("");

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

  // Effects and helper functions remain the same...
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
            return (
              gig.isClientBand &&
              (gig.bussinesscat?.toLowerCase().includes("band") ||
                (gig.bookCount && gig.bookCount.length > 0)) &&
              hasInterested &&
              isNotTaken
            );
          case "shortlist":
            return hasShortlisted && isNotTaken;
          default:
            return false;
        }
      })
      .map((gig) => {
        let applicants: Applicant[] = [];
        let shortlisted: ShortlistedUser[] = [];

        switch (activeGigTab) {
          case "regular":
            // Process regular gig applicants
            applicants = (gig.interestedUsers || []).map((userId) => {
              const statusHistory =
                gig.bookingHistory?.filter(
                  (entry) => entry.userId === userId
                ) || [];

              let status: Applicant["status"] = "pending";
              if (statusHistory.some((entry) => entry.status === "booked")) {
                status = "booked";
              } else if (
                gig.shortlistedUsers?.some((item) => item.userId === userId)
              ) {
                status = "shortlisted";
              } else if (
                statusHistory.some((entry) => entry.status === "rejected")
              ) {
                status = "rejected";
              } else if (
                statusHistory.some((entry) => entry.status === "viewed")
              ) {
                status = "viewed";
              }

              return {
                userId,
                appliedAt: gig.createdAt,
                status,
                gigId: gig._id,
              };
            });
            break;

          case "band-roles":
            // Process band role applicants
            if (gig.bandCategory) {
              gig.bandCategory.forEach((role, roleIndex) => {
                // Applicants for this role
                (role.applicants || []).forEach((userId) => {
                  const statusHistory =
                    gig.bookingHistory?.filter(
                      (entry) =>
                        entry.userId === userId &&
                        entry.bandRoleIndex === roleIndex
                    ) || [];

                  let status: Applicant["status"] = "pending";
                  if (
                    statusHistory.some((entry) => entry.status === "booked")
                  ) {
                    status = "booked";
                  } else if (
                    gig.shortlistedUsers?.some(
                      (item) =>
                        item.userId === userId &&
                        item.bandRoleIndex === roleIndex
                    )
                  ) {
                    status = "shortlisted";
                  }

                  applicants.push({
                    userId,
                    appliedAt: gig.createdAt,
                    status,
                    gigId: gig._id,
                    bandRole: role.role,
                    bandRoleIndex: roleIndex,
                  });
                });

                // Booked users for this role
                (role.bookedUsers || []).forEach((userId) => {
                  applicants.push({
                    userId,
                    appliedAt: gig.createdAt,
                    status: "booked",
                    gigId: gig._id,
                    bandRole: role.role,
                    bandRoleIndex: roleIndex,
                  });
                });
              });
            }
            break;

          case "full-band":
            // Process full band applicants
            applicants = (gig.interestedUsers || []).map((userId) => {
              const statusHistory =
                gig.bookingHistory?.filter(
                  (entry) => entry.userId === userId
                ) || [];

              let status: Applicant["status"] = "pending";
              if (statusHistory.some((entry) => entry.status === "booked")) {
                status = "booked";
              } else if (
                gig.shortlistedUsers?.some((item) => item.userId === userId)
              ) {
                status = "shortlisted";
              }

              return {
                userId,
                appliedAt: gig.createdAt,
                status,
                gigId: gig._id,
              };
            });

            // Include existing band members
            if (gig.bookCount) {
              gig.bookCount.forEach((member) => {
                applicants.push({
                  userId: member.userId,
                  appliedAt: member.joinedAt,
                  status: "booked",
                  gigId: gig._id,
                  bandRole: member.role,
                });
              });
            }
            break;
        }

        // Get shortlisted users for all gig types
        shortlisted = (gig.shortlistedUsers || []).map((item) => ({
          userId: item.userId,
          shortlistedAt: item.shortlistedAt,
          notes: item.notes,
          status: item.status,
          bandRole: item.bandRole,
          bandRoleIndex: item.bandRoleIndex,
        }));

        return {
          gig,
          applicants,
          shortlisted,
          userDetails: userMap,
        };
      })
      .filter((gigData) => {
        if (activeGigTab === "shortlist") {
          return gigData.shortlisted.length > 0;
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
      });
      toast.success("Added to shortlist!");
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

  // Single booking handler for ALL buttons
  const handleBookMusician = (userId: Id<"users">, userName: string) => {
    setSelectedMusician({ userId, userName });
    setBookingPrice("");
    setShowBookDialog(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedMusician || !selectedGig) {
      toast.error("No musician or gig selected");
      return;
    }

    try {
      // Determine source based on active tab
      let source: "interested" | "shortlisted" | "regular" = "interested";

      if (activeGigTab === "shortlist") {
        source = "shortlisted";
      } else if (activeGigTab === "regular") {
        source = "regular";
      } else {
        source = "interested"; // For band-roles and full-band
      }

      await bookMusician({
        gigId: selectedGig,
        musicianId: selectedMusician.userId,
        source: source,
        agreedPrice: bookingPrice ? Number(bookingPrice) : undefined,
        notes: `Booked from ${activeGigTab} tab`,
      });

      toast.success(`Booked ${selectedMusician.userName}!`);
      setShowBookDialog(false);
      processGigsWithApplicants(); // Refresh the list
    } catch (error: any) {
      console.error("Failed to book musician:", error);
      toast.error(error.message || "Failed to book musician");
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
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Pre-Booking Management
            </h1>
            <p className="text-gray-600 mt-2">
              Review, shortlist, and book musicians for your gigs
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1">
            {activeGigTab === "shortlist"
              ? gigsWithApplicants.reduce(
                  (acc, gig) => acc + gig.shortlisted.length,
                  0
                )
              : gigsWithApplicants.reduce(
                  (acc, gig) => acc + gig.applicants.length,
                  0
                )}{" "}
            Total
          </Badge>
        </div>

        {/* Stats Cards */}
        <StatsCards userGigs={userGigs || []} />
      </div>

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
                          g.gig.bussinesscat?.toLowerCase().includes("band")
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
                          Applicants ({filteredApplicants?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger
                          value="history"
                          className="flex items-center gap-2"
                        >
                          <History className="w-4 h-4" />
                          History
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="applicants">
                        {activeGigTab === "regular" && (
                          <RegularGigsTab
                            selectedGigData={selectedGigData}
                            filteredApplicants={filteredApplicants || []}
                            handleAddToShortlist={handleAddToShortlist}
                            handleRemoveFromShortlist={
                              handleRemoveFromShortlist
                            }
                            handleViewProfile={handleViewProfile}
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
                            getStatusColor={getStatusColor}
                            getRoleIcon={getRoleIcon}
                          />
                        )}
                        {activeGigTab === "full-band" && (
                          <FullBandTab
                            selectedGigData={selectedGigData}
                            filteredApplicants={filteredApplicants || []}
                            handleAddToShortlist={handleAddToShortlist}
                            handleRemoveFromShortlist={
                              handleRemoveFromShortlist
                            }
                            handleViewProfile={handleViewProfile}
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
            </div>
          ) : (
            // Empty state
            <Card className="text-center py-12">
              <CardContent>
                {/* ... same empty state content ... */}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Book Now Dialog */}
      <Dialog open={showBookDialog} onOpenChange={setShowBookDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book Musician</DialogTitle>
            <DialogDescription>
              Confirm booking for {selectedMusician?.userName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">{/* ... dialog content ... */}</div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowBookDialog(false)}
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
