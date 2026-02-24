// components/gigs/MusicianPreBooking.tsx
import React, { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

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
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Icons
import {
  Search,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Users2,
  User,
  Bookmark,
  Clock,
  TrendingUp,
  Music,
  Award,
  CheckCircle,
  XCircle,
  MessageSquare,
  Star,
  ShoppingBag,
  Eye,
} from "lucide-react";

// Custom Components
import { ChatIcon } from "@/components/chat/ChatIcon";
import { useGigs } from "@/hooks/useAllGigs";
import { useCurrentUser } from "@/hooks/useCurrentUser";

import { useAllUsers } from "@/hooks/useAllUsers";
import { useThemeColors } from "@/hooks/useTheme";
import { MusicianPreBookingStats } from "./MusicianPreBookingStats";

// Types
type GigTabType = "regular" | "band-roles" | "full-band" | "shortlisted";

interface MusicianGigWithStatus {
  gig: any;
  status:
    | "applied"
    | "interested"
    | "shortlisted"
    | "booked"
    | "rejected"
    | "viewed"
    | "cancelled";
  appliedAt?: number;
  bandRole?: string;
  bandRoleIndex?: number;
  shortlistedAt?: number;
  notes?: string;
  clientDetails?: any;
}

interface MusicianPreBookingProps {
  user: any;
}

export const MusicianPreBooking: React.FC<MusicianPreBookingProps> = ({
  user,
}) => {
  const router = useRouter();
  const { userId } = useAuth();
  const { colors, isDarkMode } = useThemeColors(); // Use theme colors

  // State
  const [activeTab, setActiveTab] = useState<GigTabType>("regular");
  const [loading, setLoading] = useState(true);
  const [musicianGigs, setMusicianGigs] = useState<MusicianGigWithStatus[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGig, setSelectedGig] = useState<Id<"gigs"> | null>(null);

  // Queries
  const { gigs: allGigs } = useGigs();
  const { user: userData } = useCurrentUser();
  const { users: allUsers } = useAllUsers();

  // Process musician's gigs
  useEffect(() => {
    if (allGigs && userData && allUsers) {
      processMusicianGigs();
      setLoading(false);
    }
  }, [allGigs, userData, allUsers, activeTab]);

  const processMusicianGigs = () => {
    if (!allGigs || !userData || !allUsers) return;

    const userMap = new Map();
    allUsers.forEach((user) => {
      userMap.set(user._id, user);
    });

    const musicianGigsData: MusicianGigWithStatus[] = [];

    allGigs.forEach((gig) => {
      let status: MusicianGigWithStatus["status"] | null = null;
      let appliedAt: number | undefined;
      let bandRole: string | undefined;
      let bandRoleIndex: number | undefined;
      let shortlistedAt: number | undefined;
      let notes: string | undefined;

      // 1. Check regular gig interest - UPDATE THIS PART
      if (gig.interestedUsers && Array.isArray(gig.interestedUsers)) {
        // Convert both to strings for comparison
        const userInterested = gig.interestedUsers.some((userId: any) => {
          // Handle both string and Id object comparisons
          const userIdStr =
            typeof userId === "object" ? userId.toString() : userId;
          const currentUserIdStr = userData._id.toString();
          return userIdStr === currentUserIdStr;
        });

        if (userInterested) {
          status = "interested";
          appliedAt = gig.createdAt;
        }
      }

      // 2. Check band role applications - ALSO UPDATE
      if (gig.bandCategory && gig.isClientBand) {
        gig.bandCategory.forEach((role: any, index: number) => {
          if (role.applicants && Array.isArray(role.applicants)) {
            const appliedToRole = role.applicants.some((applicantId: any) => {
              const applicantIdStr =
                typeof applicantId === "object"
                  ? applicantId.toString()
                  : applicantId;
              const currentUserIdStr = userData._id.toString();
              return applicantIdStr === currentUserIdStr;
            });

            if (appliedToRole) {
              status = "applied";
              appliedAt = gig.createdAt;
              bandRole = role.role;
              bandRoleIndex = index;
            }
          }
        });
      }

      // 3. Check full-band applications
      if (gig.bookCount) {
        const bandApplication = gig.bookCount.find(
          (app: any) => app.appliedBy.toString() === userData._id.toString(),
        );
        if (bandApplication) {
          status = "applied";
          appliedAt = bandApplication.appliedAt;
        }
      }

      // 4. Check shortlisted status
      if (gig.shortlistedUsers) {
        const shortlistEntry = gig.shortlistedUsers.find(
          (item: any) => item.userId.toString() === userData._id.toString(),
        );
        if (shortlistEntry) {
          status = "shortlisted";
          shortlistedAt = shortlistEntry.shortlistedAt;
          notes = shortlistEntry.notes;
          bandRole = shortlistEntry.bandRole;
          bandRoleIndex = shortlistEntry.bandRoleIndex;
        }
      }

      // 5. Check booking history for status updates
      if (gig.bookingHistory) {
        gig.bookingHistory.forEach((entry: any) => {
          if (entry.userId.toString() === userData._id.toString()) {
            if (entry.status === "booked") status = "booked";
            if (entry.status === "rejected") status = "rejected";
            if (entry.status === "viewed") status = "viewed";
          }
        });
      }

      // 6. Check if actually booked
      if (gig.bookedBy && gig.bookedBy.toString() === userData._id.toString()) {
        status = "booked";
      }

      if (status) {
        const clientDetails = userMap.get(gig.postedBy);
        musicianGigsData.push({
          gig,
          status,
          appliedAt,
          bandRole,
          bandRoleIndex,
          shortlistedAt,
          notes,
          clientDetails,
        });
      }
    });

    // Filter based on active tab
    const filtered = musicianGigsData.filter((gigData) => {
      switch (activeTab) {
        case "regular":
          return !gigData.gig.isClientBand && gigData.status === "interested";
        case "band-roles":
          return (
            gigData.gig.isClientBand &&
            gigData.bandRole &&
            gigData.status === "applied"
          );
        case "full-band":
          return (
            gigData.gig.isClientBand &&
            !gigData.bandRole &&
            gigData.status === "applied"
          );
        case "shortlisted":
          return gigData.status === "shortlisted";
        default:
          return true;
      }
    });

    // Filter out booked/rejected gigs for pending applications
    const pendingGigs = filtered.filter((g) =>
      ["interested", "applied", "shortlisted", "viewed"].includes(g.status),
    );

    setMusicianGigs(pendingGigs);
    if (pendingGigs.length > 0 && !selectedGig) {
      setSelectedGig(pendingGigs[0].gig._id);
    }
  };

  // Get selected gig data
  const selectedGigData = selectedGig
    ? musicianGigs.find((g) => g.gig._id === selectedGig)
    : musicianGigs[0];

  // Calculate stats
  // Add this calculateStats function back to your component:

  const calculateStats = () => {
    if (!allGigs || !userData) return null;

    const stats = {
      regular: 0,
      bandRoles: 0,
      fullBand: 0,
      shortlisted: 0,
      totalPending: 0,
      bandsAsLeader: 0,
    };

    allGigs.forEach((gig: any) => {
      // Regular gig interest - UPDATE
      if (gig.interestedUsers && Array.isArray(gig.interestedUsers)) {
        const userInterested = gig.interestedUsers.some(
          (userId: any) => userId.toString() === userData._id.toString(),
        );
        if (userInterested) {
          stats.regular++;
          stats.totalPending++;
        }
      }

      // Band role applications - UPDATE
      if (gig.bandCategory) {
        const appliedToRole = gig.bandCategory.some((role: any) => {
          if (role.applicants && Array.isArray(role.applicants)) {
            return role.applicants.some(
              (applicantId: any) =>
                applicantId.toString() === userData._id.toString(),
            );
          }
          return false;
        });
        if (appliedToRole) {
          stats.bandRoles++;
          stats.totalPending++;
        }
      }

      // Full band applications - UPDATE
      if (gig.bookCount) {
        const userBandApplications = gig.bookCount.filter(
          (app: any) => app.appliedBy.toString() === userData._id.toString(),
        );
        if (userBandApplications.length > 0) {
          stats.fullBand += userBandApplications.length;
          stats.totalPending += userBandApplications.length;
          stats.bandsAsLeader += userBandApplications.length;
        }
      }

      // Shortlisted - UPDATE
      if (gig.shortlistedUsers) {
        const isShortlisted = gig.shortlistedUsers.some(
          (item: any) => item.userId.toString() === userData._id.toString(),
        );
        if (isShortlisted) {
          stats.shortlisted++;
        }
      }
    });

    return stats;
  };

  const stats = calculateStats();

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

  // Get status colors using theme
  const getStatusColor = (status: string) => {
    switch (status) {
      case "shortlisted":
        return isDarkMode
          ? "bg-green-900/20 text-green-200 border-green-800"
          : "bg-green-100 text-green-800 border-green-200";
      case "interested":
      case "applied":
        return isDarkMode
          ? "bg-blue-900/20 text-blue-200 border-blue-800"
          : "bg-blue-100 text-blue-800 border-blue-200";
      case "booked":
        return isDarkMode
          ? "bg-purple-900/20 text-purple-200 border-purple-800"
          : "bg-purple-100 text-purple-800 border-purple-200";
      case "rejected":
        return isDarkMode
          ? "bg-red-900/20 text-red-200 border-red-800"
          : "bg-red-100 text-red-800 border-red-200";
      case "viewed":
        return isDarkMode
          ? "bg-gray-800 text-gray-300 border-gray-700"
          : "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return isDarkMode
          ? "bg-yellow-900/20 text-yellow-200 border-yellow-800"
          : "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "interested":
        return "Shown Interest";
      case "applied":
        return "Applied";
      case "shortlisted":
        return "Shortlisted";
      case "booked":
        return "Booked";
      case "rejected":
        return "Not Selected";
      case "viewed":
        return "Profile Viewed";
      default:
        return status;
    }
  };

  // Handle actions
  const handleViewGig = (gigId: Id<"gigs">) => {
    window.open(`/gigs/${gigId}`, "_blank");
  };

  const handleContactClient = (clientId: Id<"users">) => {
    console.log("Contact client:", clientId);
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
    <div className={`p-4 md:p-6 space-y-6 ${colors.background} ${colors.text}`}>
      {/* Header with Stats */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral400">
              🎵 Your Gig Applications
            </h1>
            <p className="text-gray-600 mt-2">
              Track and manage your gig applications
            </p>
          </div>
        </div>

        <MusicianPreBookingStats
          allGigs={allGigs}
          userData={userData}
          activeTab={activeTab}
        />

        {/* Band Leader Status Card - Using indigo colors from your theme */}
        {stats && stats.bandsAsLeader > 0 && (
          <div
            className={`mt-4 p-4 rounded-lg border ${colors.border} ${colors.gradientSecondary}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${colors.infoBg}`}
              >
                <Users2 className={`w-6 h-6 ${colors.infoText}`} />
              </div>
              <div>
                <h4 className={`font-semibold ${colors.text}`}>
                  Band Leader Status
                </h4>
                <p className={`text-sm ${colors.textMuted}`}>
                  You have applied for{" "}
                  <span className={`font-bold ${colors.primary}`}>
                    {stats.bandsAsLeader} gig(s)
                  </span>{" "}
                  as a band leader
                </p>
              </div>
              <Badge className={`ml-auto ${colors.primaryBg} text-white`}>
                Band Leader
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <Card className={`${colors.card} ${colors.border}`}>
        <CardContent className="p-4">
          {/* 4-Tab Gig Type Selector */}

          <div className="mb-6">
            <Tabs
              value={activeTab}
              onValueChange={(v: any) => {
                setActiveTab(v);
                setSelectedGig(null);
                setSearchTerm("");
              }}
            >
              <TabsList
                className={`grid grid-cols-2 md:grid-cols-4 ${colors.backgroundSecondary}`}
              >
                <TabsTrigger
                  value="regular"
                  className="flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Regular Gigs</span>
                  {stats && (
                    <Badge variant="secondary" className="ml-2">
                      {stats.regular}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="band-roles"
                  className="flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Band Roles</span>
                  {stats && (
                    <Badge variant="secondary" className="ml-2">
                      {stats.bandRoles}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="full-band"
                  className="flex items-center gap-2"
                >
                  <Users2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Full Bands</span>
                  {stats && (
                    <Badge variant="secondary" className="ml-2">
                      {stats.fullBand}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="shortlisted"
                  className="flex items-center gap-2"
                >
                  <Bookmark className="w-4 h-4" />
                  <span className="hidden sm:inline">Shortlisted</span>
                  {stats && (
                    <Badge variant="secondary" className="ml-2">
                      {stats.shortlisted}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Gig Selection */}
          {musicianGigs.length > 0 ? (
            <div className="space-y-6">
              {/* Gig Selector and Search */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label
                    className={`text-sm font-medium mb-2 block ${colors.text}`}
                  >
                    Select Gig
                  </label>
                  <Select
                    value={selectedGig || ""}
                    onValueChange={(value) =>
                      setSelectedGig(
                        value === "" ? null : (value as Id<"gigs">),
                      )
                    }
                  >
                    <SelectTrigger className={colors.border}>
                      <SelectValue placeholder="Select a gig" />
                    </SelectTrigger>
                    <SelectContent
                      className={`${colors.card} ${colors.border}`}
                    >
                      {musicianGigs.map((gigData) => (
                        <SelectItem
                          key={gigData.gig._id}
                          value={gigData.gig._id}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">
                              {gigData.gig.title}
                            </span>
                            <Badge className={getStatusColor(gigData.status)}>
                              {getStatusText(gigData.status)}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <Search
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${colors.textMuted}`}
                    />
                    <Input
                      placeholder="Search gigs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-9 ${colors.border}`}
                    />
                  </div>
                </div>
              </div>

              {selectedGigData && (
                <div className="space-y-6">
                  {/* Gig Info Card */}
                  <Card className={`border-2 ${colors.border}`}>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Gig Details */}
                        <div className="md:col-span-2 space-y-4">
                          <div>
                            <h3
                              className={`text-xl font-bold ${colors.text} mb-2`}
                            >
                              {selectedGigData.gig.title}
                            </h3>
                            <div className="flex items-center gap-4">
                              <Badge
                                className={getStatusColor(
                                  selectedGigData.status,
                                )}
                              >
                                {getStatusText(selectedGigData.status)}
                              </Badge>
                              {selectedGigData.bandRole && (
                                <Badge variant="outline" className="text-sm">
                                  {selectedGigData.bandRole}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                              <Calendar
                                className={`w-5 h-5 ${colors.textMuted}`}
                              />
                              <div>
                                <p className={`text-sm ${colors.textMuted}`}>
                                  Date
                                </p>
                                <p className={`font-medium ${colors.text}`}>
                                  {formatDate(selectedGigData.gig.date)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin
                                className={`w-5 h-5 ${colors.textMuted}`}
                              />
                              <div>
                                <p className={`text-sm ${colors.textMuted}`}>
                                  Location
                                </p>
                                <p className={`font-medium ${colors.text}`}>
                                  {selectedGigData.gig.location ||
                                    "Not specified"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign
                                className={`w-5 h-5 ${colors.textMuted}`}
                              />
                              <div>
                                <p className={`text-sm ${colors.textMuted}`}>
                                  Price
                                </p>
                                <p className={`font-medium ${colors.text}`}>
                                  $
                                  {selectedGigData.gig.price?.toLocaleString() ||
                                    "Negotiable"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock
                                className={`w-5 h-5 ${colors.textMuted}`}
                              />
                              <div>
                                <p className={`text-sm ${colors.textMuted}`}>
                                  Applied
                                </p>
                                <p className={`font-medium ${colors.text}`}>
                                  {selectedGigData.appliedAt
                                    ? formatDate(selectedGigData.appliedAt)
                                    : "Recently"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Client Info */}
                        <div className="space-y-4">
                          <h4 className={`font-semibold ${colors.text}`}>
                            Client
                          </h4>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage
                                src={selectedGigData.clientDetails?.picture}
                              />
                              <AvatarFallback>
                                {selectedGigData.clientDetails?.firstname?.charAt(
                                  0,
                                ) || "C"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h5 className={`font-medium ${colors.text}`}>
                                {selectedGigData.clientDetails?.firstname ||
                                  selectedGigData.clientDetails?.username ||
                                  "Client"}
                              </h5>
                              <p className={`text-sm ${colors.textMuted}`}>
                                {selectedGigData.clientDetails?.roleType ||
                                  "Client"}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Button
                              size="sm"
                              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white"
                              onClick={() =>
                                handleViewGig(selectedGigData.gig._id)
                              }
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Gig
                            </Button>
                            <ChatIcon
                              userId={selectedGigData.gig.postedBy}
                              size="sm"
                              variant="cozy"
                              className="w-full"
                              showText={true}
                              text="Message Client"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Status Notes */}
                      {selectedGigData.notes && (
                        <div
                          className={`mt-6 p-4 rounded-lg ${colors.backgroundMuted}`}
                        >
                          <p className={`text-sm ${colors.text}`}>
                            <span className="font-semibold">Note:</span>{" "}
                            {selectedGigData.notes}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Application History */}
                  <Card className={`${colors.card} ${colors.border}`}>
                    <CardContent className="p-6">
                      <h4
                        className={`font-semibold text-lg mb-4 ${colors.text}`}
                      >
                        Application Timeline
                      </h4>
                      <div className="space-y-4">
                        {selectedGigData.appliedAt && (
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full ${colors.infoBg} flex items-center justify-center`}
                            >
                              <Clock className={`w-4 h-4 ${colors.infoText}`} />
                            </div>
                            <div>
                              <p className={`font-medium ${colors.text}`}>
                                Applied
                              </p>
                              <p className={`text-sm ${colors.textMuted}`}>
                                {formatDate(selectedGigData.appliedAt)} at{" "}
                                {formatTime(selectedGigData.appliedAt)}
                              </p>
                            </div>
                          </div>
                        )}

                        {selectedGigData.shortlistedAt && (
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full ${colors.successBg} flex items-center justify-center`}
                            >
                              <Bookmark
                                className={`w-4 h-4 ${colors.successText}`}
                              />
                            </div>
                            <div>
                              <p className={`font-medium ${colors.text}`}>
                                Shortlisted
                              </p>
                              <p className={`text-sm ${colors.textMuted}`}>
                                {formatDate(selectedGigData.shortlistedAt)} at{" "}
                                {formatTime(selectedGigData.shortlistedAt)}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Add booking history entries if available */}
                        {selectedGigData.gig.bookingHistory
                          ?.filter(
                            (entry: any) => entry.userId === userData?._id,
                          )
                          .map((entry: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-3"
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  entry.status === "booked"
                                    ? isDarkMode
                                      ? "bg-purple-900/20"
                                      : "bg-purple-100"
                                    : entry.status === "rejected"
                                      ? isDarkMode
                                        ? "bg-red-900/20"
                                        : "bg-red-100"
                                      : isDarkMode
                                        ? "bg-gray-800"
                                        : "bg-gray-100"
                                }`}
                              >
                                {entry.status === "booked" ? (
                                  <ShoppingBag
                                    className={`w-4 h-4 ${isDarkMode ? "text-purple-300" : "text-purple-600"}`}
                                  />
                                ) : entry.status === "rejected" ? (
                                  <XCircle
                                    className={`w-4 h-4 ${isDarkMode ? "text-red-300" : "text-red-600"}`}
                                  />
                                ) : (
                                  <Eye
                                    className={`w-4 h-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                                  />
                                )}
                              </div>
                              <div>
                                <p
                                  className={`font-medium capitalize ${colors.text}`}
                                >
                                  {entry.status}
                                </p>
                                <p className={`text-sm ${colors.textMuted}`}>
                                  {formatDate(entry.timestamp)} at{" "}
                                  {formatTime(entry.timestamp)}
                                </p>
                                {entry.notes && (
                                  <p
                                    className={`text-sm ${colors.textMuted} mt-1`}
                                  >
                                    {entry.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            // Empty state
            <Card
              className={`text-center py-12 ${colors.card} ${colors.border}`}
            >
              <CardContent>
                <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className={`text-xl font-semibold mb-2 ${colors.text}`}>
                  {activeTab === "regular"
                    ? "No Regular Gigs Applied"
                    : activeTab === "band-roles"
                      ? "No Band Role Applications"
                      : activeTab === "full-band"
                        ? "No Full Band Applications"
                        : "No Shortlisted Gigs"}
                </h3>
                <p className={`text-gray-500 mb-6 ${colors.textMuted}`}>
                  {activeTab === "regular"
                    ? "Browse regular gigs and show interest to see them here"
                    : activeTab === "band-roles"
                      ? "Apply to band roles to see your applications here"
                      : activeTab === "full-band"
                        ? "Apply to full band gigs to see your applications here"
                        : "You'll see gigs here when clients shortlist you"}
                </p>
                <Button
                  onClick={() => router.push("/gigs")}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
                >
                  Browse Gigs
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
