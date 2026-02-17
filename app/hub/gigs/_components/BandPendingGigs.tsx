// components/gigs/BandPendingGigs.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Icons
import {
  Search,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Users2,
  Music,
  Award,
  CheckCircle,
  XCircle,
  MessageSquare,
  Star,
  TrendingUp,
  Clock,
  Bookmark,
  User,
  Eye,
  FileText,
  Tag,
  ExternalLink,
  Send,
  Briefcase,
  Building,
} from "lucide-react";

// Custom Components
import { ChatIcon } from "@/components/chat/ChatIcon";
import { useGigs } from "@/hooks/useAllGigs";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAllUsers } from "@/hooks/useAllUsers";

// Types
type BandGigTabType = "all" | "pending" | "shortlisted" | "booked" | "rejected";

interface BandApplication {
  gig: any;
  application: any; // The bookCount entry
  bandId: Id<"bands">;
  bandDetails?: any;
  clientDetails?: any;
  status:
    | "applied"
    | "shortlisted"
    | "booked"
    | "rejected"
    | "pending_review"
    | "cancelled";
  appliedAt: number;
  appliedBy: Id<"users">;
  proposedFee?: number;
  notes?: string;
  shortlistedAt?: number;
  shortlistNotes?: string;
  bookedAt?: number;
  agreedFee?: number;
  performingMembers?: any[];
}

interface BandPendingGigsProps {
  user: any;
}

export const BandPendingGigs: React.FC<BandPendingGigsProps> = ({ user }) => {
  const router = useRouter();
  const { userId } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState<BandGigTabType>("all");
  const [loading, setLoading] = useState(true);
  const [bandApplications, setBandApplications] = useState<BandApplication[]>(
    [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplication, setSelectedApplication] =
    useState<BandApplication | null>(null);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [showFollowupDialog, setShowFollowupDialog] = useState(false);
  const [followupMessage, setFollowupMessage] = useState("");
  const [selectedBandFilter, setSelectedBandFilter] = useState<string>("all");

  // Queries
  const { gigs: allGigs } = useGigs();
  const { user: userData } = useCurrentUser();
  const { users: allUsers } = useAllUsers();

  // Get user's bands where they are leader (from bandLeaderOf field)
  const bandIds = useMemo(() => {
    if (!userData?.bandLeaderOf || userData.bandLeaderOf.length === 0)
      return [];
    return userData.bandLeaderOf;
  }, [userData?.bandLeaderOf]);

  // Query band details for bands user leads
  const bandDetailsList = useQuery(
    api.controllers.bands.getBandsByIds,
    bandIds.length > 0 ? { bandIds } : "skip",
  );

  // Process band applications
  useEffect(() => {
    if (allGigs && userData && allUsers && bandDetailsList) {
      processBandApplications();
      setLoading(false);
    }
  }, [allGigs, userData, allUsers, bandDetailsList, activeTab]);

  const processBandApplications = () => {
    if (!allGigs || !userData || !allUsers || !bandDetailsList) return;

    const userMap = new Map();
    allUsers.forEach((user) => {
      userMap.set(user._id, user);
    });

    const bandMap = new Map();
    bandDetailsList.forEach((band) => {
      if (band) bandMap.set(band._id, band);
    });

    const applications: BandApplication[] = [];

    allGigs.forEach((gig) => {
      // Skip gigs without band applications
      if (!gig.bookCount || gig.bookCount.length === 0) return;

      gig.bookCount.forEach((app: any) => {
        // Check if this application is from one of user's bands (from bandLeaderOf)
        const isUsersBand = bandIds.includes(app.bandId);

        if (isUsersBand) {
          const bandDetails = bandMap.get(app.bandId);
          const clientDetails = userMap.get(gig.postedBy);

          // Determine status
          let status: BandApplication["status"] = "applied";
          if (app.status === "shortlisted") status = "shortlisted";
          else if (app.status === "booked") status = "booked";
          else if (app.status === "rejected") status = "rejected";
          else if (app.status === "pending_review") status = "pending_review";

          applications.push({
            gig,
            application: app,
            bandId: app.bandId,
            bandDetails,
            clientDetails,
            status,
            appliedAt: app.appliedAt,
            appliedBy: app.appliedBy,
            proposedFee: app.proposedFee,
            notes: app.notes,
            shortlistedAt: app.shortlistedAt,
            shortlistNotes: app.shortlistNotes,
            bookedAt: app.bookedAt,
            agreedFee: app.agreedFee,
            performingMembers: app.performingMembers,
          });
        }
      });
    });

    // Sort by most recent
    applications.sort((a, b) => b.appliedAt - a.appliedAt);
    setBandApplications(applications);
  };

  // Filter applications based on active tab and search
  const filteredApplications = useMemo(() => {
    let filtered = bandApplications;

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter((app) => {
        switch (activeTab) {
          case "pending":
            return app.status === "applied" || app.status === "pending_review";
          case "shortlisted":
            return app.status === "shortlisted";
          case "booked":
            return app.status === "booked";
          case "rejected":
            return app.status === "rejected";
          default:
            return true;
        }
      });
    }

    // Filter by selected band
    if (selectedBandFilter !== "all") {
      filtered = filtered.filter((app) => app.bandId === selectedBandFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.gig.title.toLowerCase().includes(term) ||
          app.clientDetails?.firstname?.toLowerCase().includes(term) ||
          app.clientDetails?.username?.toLowerCase().includes(term) ||
          app.bandDetails?.name?.toLowerCase().includes(term),
      );
    }

    return filtered;
  }, [bandApplications, activeTab, selectedBandFilter, searchTerm]);

  // Calculate stats
  const stats = useMemo(() => {
    const stats = {
      total: bandApplications.length,
      pending: bandApplications.filter(
        (app) => app.status === "applied" || app.status === "pending_review",
      ).length,
      shortlisted: bandApplications.filter(
        (app) => app.status === "shortlisted",
      ).length,
      booked: bandApplications.filter((app) => app.status === "booked").length,
      rejected: bandApplications.filter((app) => app.status === "rejected")
        .length,
      bands: bandDetailsList?.length || 0,
    };
    return stats;
  }, [bandApplications, bandDetailsList]);

  // Get unique bands for filter
  const userBandsList = useMemo(() => {
    if (!bandDetailsList) return [];
    return bandDetailsList.filter((band) => band);
  }, [bandDetailsList]);

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

  const formatCurrency = (amount?: number) => {
    if (!amount) return "Negotiable";
    return `$${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "shortlisted":
        return "bg-green-100 text-green-800 border-green-200";
      case "applied":
      case "pending_review":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "booked":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "applied":
        return "Applied";
      case "pending_review":
        return "Under Review";
      case "shortlisted":
        return "Shortlisted";
      case "booked":
        return "Booked";
      case "rejected":
        return "Not Selected";
      default:
        return status;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "shortlisted":
        return <Bookmark className="w-4 h-4" />;
      case "booked":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Action handlers
  const handleViewGig = (gigId: Id<"gigs">) => {
    window.open(`/gigs/${gigId}`, "_blank");
  };

  const handleViewApplication = (application: BandApplication) => {
    setSelectedApplication(application);
    setShowApplicationDetails(true);
  };

  const handleSendFollowup = () => {
    if (!selectedApplication || !followupMessage.trim()) return;

    // Here you would implement the followup logic
    toast.success("Follow-up message sent!");
    setShowFollowupDialog(false);
    setFollowupMessage("");
  };

  const handleContactClient = (clientId: Id<"users">) => {
    // This would open a chat with the client
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

  // No bands check - FIXED TYPO HERE
  if (!userBandsList.length) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Building className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Bands Found</h3>
          <p className="text-gray-500 mb-6">
            You need to create or lead a band to view band applications.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => router.push("/bands/create")}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
            >
              Create Band
            </Button>
            <Button variant="outline" onClick={() => router.push("/bands")}>
              Browse Bands
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header with Stats */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              🎸 Band Applications
            </h1>
            <p className="text-gray-600 mt-2">
              Track applications from your bands
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="px-3 py-1 text-sm border-blue-200 bg-blue-50 text-blue-700"
            >
              {userBandsList.length} Band{userBandsList.length !== 1 ? "s" : ""}{" "}
              {/* FIXED TYPO HERE */}
            </Badge>
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1">
              {stats.total} Total Applications
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="border border-blue-100 bg-blue-50/50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 mb-1">Total</p>
                  <p className="text-lg font-bold text-blue-800">
                    {stats.total}
                  </p>
                </div>
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-blue-100 bg-blue-50/50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 mb-1">Pending</p>
                  <p className="text-lg font-bold text-blue-800">
                    {stats.pending}
                  </p>
                </div>
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-green-100 bg-green-50/50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 mb-1">Shortlisted</p>
                  <p className="text-lg font-bold text-green-800">
                    {stats.shortlisted}
                  </p>
                </div>
                <Bookmark className="w-6 h-6 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-purple-100 bg-purple-50/50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-purple-600 mb-1">Booked</p>
                  <p className="text-lg font-bold text-purple-800">
                    {stats.booked}
                  </p>
                </div>
                <CheckCircle className="w-6 h-6 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-red-100 bg-red-50/50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-red-600 mb-1">Rejected</p>
                  <p className="text-lg font-bold text-red-800">
                    {stats.rejected}
                  </p>
                </div>
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardContent className="p-4">
          {/* Controls */}
          <div className="space-y-4 mb-6">
            {/* Band Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">
                  Filter by Band
                </label>
                <Select
                  value={selectedBandFilter}
                  onValueChange={setSelectedBandFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Bands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Bands</SelectItem>
                    {userBandsList.map((band) => (
                      <SelectItem key={band._id} value={band._id}>
                        {band.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search gigs or clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            {/* Status Tabs */}
            <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
              <TabsList className="grid grid-cols-5">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span className="hidden sm:inline">All</span>
                  <Badge variant="secondary" className="ml-2">
                    {stats.total}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:inline">Pending</span>
                  <Badge variant="secondary" className="ml-2">
                    {stats.pending}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="shortlisted"
                  className="flex items-center gap-2"
                >
                  <Bookmark className="w-4 h-4" />
                  <span className="hidden sm:inline">Shortlisted</span>
                  <Badge variant="secondary" className="ml-2">
                    {stats.shortlisted}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="booked" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Booked</span>
                  <Badge variant="secondary" className="ml-2">
                    {stats.booked}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="rejected"
                  className="flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Rejected</span>
                  <Badge variant="secondary" className="ml-2">
                    {stats.rejected}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Applications List */}
          {filteredApplications.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredApplications.map((app) => (
                <Card
                  key={`${app.gig._id}-${app.bandId}`}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={app.bandDetails?.bandImageUrl} />
                            <AvatarFallback>
                              {app.bandDetails?.name?.charAt(0) || "B"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">
                              {app.bandDetails?.name || "Unknown Band"}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {app.clientDetails?.firstname ||
                                app.clientDetails?.username ||
                                "Client"}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(app.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(app.status)}
                            {getStatusText(app.status)}
                          </div>
                        </Badge>
                      </div>

                      {/* Gig Info */}
                      <div>
                        <h5 className="font-medium text-lg mb-2">
                          {app.gig.title}
                        </h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>{formatDate(app.gig.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>
                              {app.gig.location || "Location not specified"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <span>
                              {app.proposedFee
                                ? `$${app.proposedFee}`
                                : "Negotiable"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>Applied {formatDate(app.appliedAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Application Notes */}
                      {app.notes && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Your Note:</span>{" "}
                            {app.notes}
                          </p>
                        </div>
                      )}

                      {/* Client Response */}
                      {app.shortlistNotes && (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm text-green-700">
                            <span className="font-semibold">
                              Client Response:
                            </span>{" "}
                            {app.shortlistNotes}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleViewGig(app.gig._id)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Gig
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleViewApplication(app)}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                        <ChatIcon
                          userId={app.gig.postedBy}
                          size="sm"
                          variant="cozy"
                          className="flex-1"
                          showText={false}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // Empty state
            <Card className="text-center py-12">
              <CardContent>
                <Music className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {activeTab === "pending"
                    ? "No Pending Applications"
                    : activeTab === "shortlisted"
                      ? "No Shortlisted Applications"
                      : activeTab === "booked"
                        ? "No Booked Gigs"
                        : activeTab === "rejected"
                          ? "No Rejected Applications"
                          : "No Band Applications"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {activeTab === "pending"
                    ? "Your bands haven't applied to any gigs yet"
                    : activeTab === "shortlisted"
                      ? "None of your band applications have been shortlisted"
                      : activeTab === "booked"
                        ? "Your bands haven't been booked for any gigs yet"
                        : activeTab === "rejected"
                          ? "No rejected applications"
                          : "Start applying to gigs with your bands"}
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

      {/* Application Details Dialog */}
      {selectedApplication && (
        <Dialog
          open={showApplicationDetails}
          onOpenChange={setShowApplicationDetails}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>
                Full details of this band application
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Application Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Band</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={selectedApplication.bandDetails?.bandImageUrl}
                      />
                      <AvatarFallback>
                        {selectedApplication.bandDetails?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {selectedApplication.bandDetails?.name}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Client</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={selectedApplication.clientDetails?.picture}
                      />
                      <AvatarFallback>
                        {selectedApplication.clientDetails?.firstname?.charAt(
                          0,
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {selectedApplication.clientDetails?.firstname ||
                        selectedApplication.clientDetails?.username}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Status</Label>
                  <Badge className={getStatusColor(selectedApplication.status)}>
                    {getStatusText(selectedApplication.status)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Proposed Fee</Label>
                  <p className="font-medium">
                    {formatCurrency(selectedApplication.proposedFee)}
                  </p>
                </div>
              </div>

              {/* Gig Details */}
              <div>
                <Label className="text-sm text-gray-500">Gig Details</Label>
                <Card className="mt-2">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-lg mb-2">
                      {selectedApplication.gig.title}
                    </h4>
                    <p className="text-gray-600 mb-3">
                      {selectedApplication.gig.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{formatDate(selectedApplication.gig.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{selectedApplication.gig.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span>
                          Budget: $
                          {selectedApplication.gig.price?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>
                          Applied: {formatDate(selectedApplication.appliedAt)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Notes Section */}
              {(selectedApplication.notes ||
                selectedApplication.shortlistNotes) && (
                <div>
                  <Label className="text-sm text-gray-500">Notes</Label>
                  <div className="space-y-2 mt-2">
                    {selectedApplication.notes && (
                      <Card className="border border-blue-200">
                        <CardContent className="p-3">
                          <p className="text-sm">
                            <span className="font-semibold">Your Note:</span>{" "}
                            {selectedApplication.notes}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                    {selectedApplication.shortlistNotes && (
                      <Card className="border border-green-200">
                        <CardContent className="p-3">
                          <p className="text-sm">
                            <span className="font-semibold">
                              Client Response:
                            </span>{" "}
                            {selectedApplication.shortlistNotes}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <Label className="text-sm text-gray-500">
                  Application Timeline
                </Label>
                <div className="space-y-3 mt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Applied</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(selectedApplication.appliedAt)} at{" "}
                        {formatTime(selectedApplication.appliedAt)}
                      </p>
                    </div>
                  </div>
                  {selectedApplication.shortlistedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Bookmark className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Shortlisted</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(selectedApplication.shortlistedAt)} at{" "}
                          {formatTime(selectedApplication.shortlistedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedApplication.bookedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Booked</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(selectedApplication.bookedAt)} at{" "}
                          {formatTime(selectedApplication.bookedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setShowApplicationDetails(false)}
              >
                Close
              </Button>
              <Button
                variant="outline"
                onClick={() => handleViewGig(selectedApplication.gig._id)}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Gig
              </Button>
              {selectedApplication.status === "applied" && (
                <Button
                  onClick={() => {
                    setShowApplicationDetails(false);
                    setShowFollowupDialog(true);
                  }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Follow-up
                </Button>
              )}
              <ChatIcon
                userId={selectedApplication.gig.postedBy}
                size="sm"
                variant="cozy"
                className="flex-1"
                showText={true}
                text="Message Client"
              />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Follow-up Dialog */}
      <Dialog open={showFollowupDialog} onOpenChange={setShowFollowupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Follow-up Message</DialogTitle>
            <DialogDescription>
              Send a follow-up message to the client about your application
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="followup-message">Message</Label>
              <Textarea
                id="followup-message"
                placeholder="Hi, I wanted to follow up on our application..."
                value={followupMessage}
                onChange={(e) => setFollowupMessage(e.target.value)}
                className="mt-1 min-h-[100px]"
              />
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                Tip: Mention your band's strengths and why you're a good fit for
                this gig.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFollowupDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendFollowup}
              disabled={!followupMessage.trim()}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
