"use client";
import React, { useState, useMemo } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useDeputies } from "@/hooks/useDeputies";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  DollarSign,
  MessageCircle,
  Check,
  X,
  Users2,
  User,
  ArrowLeft,
  Music,
  AlertCircle,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import GigLoader from "@/components/(main)/GigLoader";
// import { ChatIcon } from "@/components/chat/ChatIcon";

interface InvitesPageProps {
  params: Promise<{ gigId: string }>; // Change this line
}

export default function InvitesPage({ params }: InvitesPageProps) {
  const { user, isLoading: userLoading } = useCurrentUser();
  const router = useRouter();
  const { colors } = useThemeColors();
  const unwrappedParams = React.use(params);
  const gigId = unwrappedParams.gigId;

  if (userLoading) {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center",
          colors.background
        )}
      >
        <GigLoader color="border-purple-300" size="md" title="Loading..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center",
          colors.background
        )}
      >
        <div className={cn("text-xl", colors.text)}>
          Please log in to view this invitation
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen", colors.background)}>
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className={cn(
                "flex items-center gap-2 border transition-all duration-200 hover:shadow-md",
                colors.border,
                colors.hoverBg,
                "hover:border-blue-400"
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className={cn("text-3xl font-bold", colors.text)}>
                Gig Invitation
              </h1>
              <p className={cn("text-muted-foreground mt-2", colors.textMuted)}>
                {user.isClient
                  ? "Manage your gig invitation"
                  : "Review and respond to gig invitation"}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {user.isClient ? (
          <ClientGigView gigId={gigId} />
        ) : user.isMusician ? (
          <MusicianGigView gigId={gigId} />
        ) : (
          <Card className={cn("border", colors.card, colors.border)}>
            <CardContent className="p-6 text-center">
              <div className={cn("text-lg", colors.text)}>
                You need to be a client or musician to view invitations.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    pending: {
      label: "Pending",
      color:
        "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
    },
    accepted: {
      label: "Accepted",
      color:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
    },
    declined: {
      label: "Declined",
      color:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
    },
    "deputy-suggested": {
      label: "Deputy Suggested",
      color:
        "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
    },
    cancelled: {
      label: "Cancelled",
      color:
        "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800",
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <Badge className={cn("inline-flex items-center gap-1", config.color)}>
      {config.label}
    </Badge>
  );
};

// Client View Component
function ClientGigView({ gigId }: { gigId: string }) {
  const { user } = useCurrentUser();
  const { colors } = useThemeColors();

  const gig = useQuery(api.controllers.instantGigs.getInstantGigById, {
    gigId: gigId as Id<"instantgigs">,
  });
  const updateGigStatus = useMutation(
    api.controllers.instantGigs.updateInstantGigStatus
  );

  // Use the useDeputies hook to get musician's deputies
  const { myDeputies } = useDeputies(gig?.invitedMusicianId);
  const router = useRouter();
  const handleAcceptDeputy = async (deputyId: string, deputyName: string) => {
    try {
      // Update gig with new musician and status
      await updateGigStatus({
        gigId: gigId as any,
        status: "accepted",
        musicianId: deputyId as any,
        actionBy: "client",
        notes: `Accepted deputy: ${deputyName}`,
      });

      toast.success(`${deputyName} accepted as deputy for this gig`);
    } catch (error) {
      toast.error("Failed to accept deputy");
    }
  };

  const handleDeclineDeputy = async () => {
    try {
      // Mark gig as cancelled when client declines deputies
      await updateGigStatus({
        gigId: gigId as any,
        status: "cancelled",
        musicianId: gig?.invitedMusicianId as any,
        actionBy: "client",
        notes: "Declined all deputy suggestions",
      });
      toast.success("Deputy suggestions declined");
    } catch (error) {
      toast.error("Failed to decline deputies");
    }
  };

  if (!gig) {
    return (
      <Card className={cn("w-full", colors.card)}>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Gig Not Found</h3>
          <p className="text-muted-foreground mb-4">
            We couldn't find the gig you're looking for. It may have been
            cancelled or removed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={() => router.push("/hub/gigs")}>
              Browse Available Gigs
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter deputies that are bookable
  const availableDeputies = myDeputies.filter(
    (deputy) => deputy?.relationship?.canBeBooked !== false
  );

  // Get booking history for display
  const bookingHistory = gig.bookingHistory || [];

  return (
    <div className="space-y-6">
      {/* Gig Details */}
      <Card className={cn("w-full", colors.card)}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{gig.title}</CardTitle>
              <CardDescription>{gig.description}</CardDescription>
            </div>
            <StatusBadge status={gig.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Gig Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{gig.date}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{gig.duration}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{gig.venue}</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{gig.budget}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Music className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{gig.gigType}</span>
            </div>
          </div>

          {/* Current Musician Status */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">
              {gig.status === "deputy-suggested"
                ? "Original Musician"
                : gig.status === "accepted"
                  ? "Confirmed Musician"
                  : "Invited Musician"}
            </h4>
            <div className="flex items-center justify-evenly p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <User className="w-8 h-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">{gig.musicianName}</p>
                  <p className="text-sm text-muted-foreground">
                    {gig.status === "deputy-suggested"
                      ? "Suggested deputies instead"
                      : gig.status === "accepted"
                        ? "Confirmed for this gig"
                        : gig.status === "declined"
                          ? "Declined the invitation"
                          : "Waiting for response..."}
                  </p>
                </div>
              </div>

              {/* Uncomment if you want chat functionality */}
              {/* <ChatIcon
                userId={gig.invitedMusicianId as Id<"users">}
                size="sm"
                showText={true}
                variant="ghost"
                text={"Message"}
                showPulse={true}
                className="h-10 w-10 bg-green-100 text-green-600 hover:bg-green-200 w-full justify-center"
              /> */}
            </div>
          </div>

          {/* Deputy Suggestions Section */}
          {gig.status === "deputy-suggested" && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-4">
                <Users2 className="w-5 h-5 text-blue-500" />
                <h4 className="font-semibold">Deputy Suggestions</h4>
                <Badge variant="outline" className="ml-2">
                  {availableDeputies.length} available
                </Badge>
              </div>

              {availableDeputies.length > 0 ? (
                <div className="space-y-4">
                  {availableDeputies.map((deputy) => (
                    <Card
                      key={deputy?._id}
                      className={cn(
                        "border-l-4 border-l-blue-500",
                        colors.card
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <User className="w-10 h-10 text-muted-foreground" />
                            <div>
                              <p className="font-medium">
                                {deputy?.firstname} {deputy?.lastname}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{deputy?.relationship?.forMySkill}</span>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  <span>{deputy?.avgRating || "New"}</span>
                                </div>
                                {deputy?.backupCount &&
                                  deputy?.backupCount > 0 && (
                                    <>
                                      <span>•</span>
                                      <span>
                                        {deputy?.backupCount} backup gigs
                                      </span>
                                    </>
                                  )}
                              </div>
                              {deputy?.relationship?.note && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Note: {deputy?.relationship.note}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleAcceptDeputy(
                                  deputy?._id as Id<"users">,
                                  `${deputy?.firstname} ${deputy?.lastname}`
                                )
                              }
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                (window.location.href = `/profile/${deputy?._id}`)
                              }
                            >
                              View Profile
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Decline All Button */}
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="outline"
                      onClick={handleDeclineDeputy}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Decline All Suggestions
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 border-2 border-dashed rounded-lg bg-muted/20">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-50 flex items-center justify-center">
                    <Users2 className="w-8 h-8 text-amber-500" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">
                    No Deputies Available
                  </h4>
                  <p className="text-muted-foreground mb-4">
                    You don't have any deputies set up who can cover this gig
                    for you.
                  </p>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      🎵 <strong>Build your deputy network:</strong>
                    </p>
                    <div className="space-y-1 text-left max-w-md mx-auto">
                      <p>• Connect with other musicians in your area</p>
                      <p>
                        • Add trusted colleagues as deputies in your profile
                      </p>
                      <p>• Specify which gig types they can cover for you</p>
                    </div>
                  </div>
                  <Button
                    onClick={() =>
                      (window.location.href = "/profile?tab=deputies")
                    }
                    variant="outline"
                    className="mt-4"
                  >
                    <Users2 className="w-4 h-4 mr-2" />
                    Manage Deputies
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Booking History Section */}
          {bookingHistory.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Booking History</h4>
              <div className="space-y-2">
                {bookingHistory.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          entry.status === "accepted"
                            ? "bg-green-500"
                            : entry.status === "declined"
                              ? "bg-red-500"
                              : entry.status === "deputy-suggested"
                                ? "bg-blue-500"
                                : "bg-yellow-500"
                        )}
                      />
                      <div>
                        <p className="font-medium text-sm">
                          {entry.musicianName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.status} •{" "}
                          {new Date(entry.timestamp).toLocaleString()} • By{" "}
                          {entry.actionBy}
                        </p>
                        {entry.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {entry.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Setlist if available */}
          {gig.setlist && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Setlist/Special Requests</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {gig.setlist}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
// Musician View Component
function MusicianGigView({ gigId }: { gigId: string }) {
  const { user } = useCurrentUser();
  const { colors } = useThemeColors();

  const gig = useQuery(api.controllers.instantGigs.getInstantGigById, {
    gigId: gigId as Id<"instantgigs">,
  });

  const updateGigStatus = useMutation(
    api.controllers.instantGigs.updateInstantGigStatus
  );

  // Check if this mutation exists in your API
  const updateGigAvailability = useMutation(
    api.controllers.instantGigs.updateGigAvailability
  );

  // Use the useDeputies hook
  const { myDeputies, updateDeputySettings, isLoading } = useDeputies(
    user?._id
  );

  // In your MusicianGigView component
  const handleStatusUpdate = async (
    status: "accepted" | "declined" | "deputy-suggested",
    notes?: string,
    deputySuggestedId?: string
  ) => {
    if (!user) {
      toast.error("You must be logged in to update gig status");
      return;
    }

    try {
      await updateGigStatus({
        gigId: gigId as Id<"instantgigs">,
        status,
        musicianId: user._id,
        actionBy: "musician",
        notes,
        deputySuggestedId: deputySuggestedId as Id<"users">,
      });

      if (status === "accepted") {
        toast.success("Gig accepted successfully! 🎉");
      } else if (status === "declined") {
        toast.success("Gig declined");
      } else if (status === "deputy-suggested") {
        toast.success("Deputy suggestions sent to client");
      }
    } catch (error) {
      console.error("Error updating gig status:", error);
      toast.error("Failed to update gig status");
    }
  };

  const handleSuggestSpecificDeputy = async (
    deputyId: string,
    deputyName: string
  ) => {
    if (!user) {
      toast.error("You must be logged in to suggest deputies");
      return;
    }

    try {
      await updateGigStatus({
        gigId: gigId as Id<"instantgigs">,
        status: "deputy-suggested",
        musicianId: user._id,
        actionBy: "musician",
        notes: `Suggested deputy: ${deputyName}`,
        deputySuggestedId: deputyId as Id<"users">,
      });

      toast.success("Deputy suggested to client");
    } catch (error) {
      console.error("Error suggesting deputy:", error);
      toast.error("Failed to suggest deputy");
    }
  };

  const handleAvailabilityToggle = async (available: boolean) => {
    try {
      await updateGigAvailability({
        gigId: gigId as Id<"instantgigs">,
        musicianAvailability: available ? "available" : "notavailable",
        clerkId: user?.clerkId as string,
      });
      console.log(user?._id === gig?.invitedMusicianId);
      // Auto-decline if marking as unavailable and gig is still pending
      if (!available && gig?.status === "pending") {
        await updateGigStatus({
          gigId: gigId as Id<"instantgigs">,
          status: "declined",
          musicianId: user?._id as Id<"users">,
          actionBy: "system",
          notes: "Auto-declined due to unavailability",
        });
        toast.success("Gig declined due to unavailability");
      } else if (available) {
        toast.success("Marked as available for this gig");
      } else {
        toast.success("Marked as unavailable for this gig");
      }
    } catch (error) {
      console.error("Error updating availability:", error);
      toast.error("Failed to update availability");
    }
  };

  const handleUpdateDeputyBooking = async (
    deputyId: string,
    canBeBooked: boolean
  ) => {
    try {
      await updateDeputySettings(deputyId as Id<"users">, { canBeBooked });
      toast.success(
        `Deputy ${canBeBooked ? "enabled" : "disabled"} for bookings`
      );
    } catch (error) {
      toast.error("Failed to update deputy settings");
    }
  };

  if (!gig) {
    return (
      <Card className={cn("w-full", colors.card)}>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
            <Music className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Loading Gig Details</h3>
          <p className="text-muted-foreground">
            Fetching the latest information about this gig invitation...
          </p>
          <div className="mt-4 flex justify-center">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle cases where musicianAvailability might not be set yet
  const isAvailable = gig?.musicianAvailability === "available";
  const showDeputies = gig?.musicianAvailability === "notavailable";

  // If musicianAvailability is undefined, default to available for pending gigs
  const defaultAvailability =
    gig?.musicianAvailability === undefined && gig?.status === "pending";

  const availableDeputies = myDeputies.filter(
    (deputy) => deputy?.relationship?.canBeBooked !== false
  );

  return (
    <div className="space-y-6">
      {/* Gig Details */}
      <Card className={cn("w-full", colors.card)}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{gig.title}</CardTitle>
              <CardDescription>{gig.description}</CardDescription>
            </div>
            <StatusBadge status={gig.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Availability Toggle - ALWAYS SHOW FOR MUSICIANS */}

          <div className="flex items-center justify-between p-4 border-2 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg border">
                {isAvailable || defaultAvailability ? (
                  <Check className="w-6 h-6 text-green-600" strokeWidth={3} />
                ) : (
                  <X className="w-6 h-6 text-red-600" strokeWidth={3} />
                )}
              </div>
              <div>
                <p className="font-semibold text-lg">Gig Availability</p>
                <p className="text-sm text-muted-foreground">
                  {isAvailable || defaultAvailability
                    ? "You can accept this gig invitation"
                    : "You're not available - suggest deputies instead"}
                </p>
              </div>
            </div>

            <GigAvailabilitySwitchWithStatus
              checked={isAvailable || defaultAvailability}
              onCheckedChange={handleAvailabilityToggle}
              status={
                gig?.musicianAvailability as
                  | "available"
                  | "notavailable"
                  | "pending"
              }
              size="lg"
              showStatusText={false}
            />
          </div>

          {/* Client Information */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">From Client</h4>
            <div className="flex items-center justify-evenly p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <User className="w-8 h-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">{gig.clientName}</p>
                  <p className="text-sm text-muted-foreground">
                    Looking for musician
                  </p>
                </div>
              </div>
              {/* <ChatIcon
                userId={gig.clientId}
                size="sm"
                showText={true}
                variant="ghost"
                className="h-8 w-8 bg-blue-400 text-blue-900 hover:bg-blue-200 w-full justify-center"
                text={"Chat with Client"}
              /> */}
            </div>
          </div>

          {/* Gig Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Date</p>
                <p className="text-sm text-muted-foreground">{gig.date}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p className="text-sm text-muted-foreground">{gig.duration}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Venue</p>
                <p className="text-sm text-muted-foreground">{gig.venue}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Budget</p>
                <p className="text-sm text-muted-foreground">{gig.budget}</p>
              </div>
            </div>
          </div>

          {/* Setlist if available */}
          {gig.setlist && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Setlist/Special Requests</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {gig.setlist}
              </p>
            </div>
          )}

          {/* Action Buttons - Only show if available AND gig is pending */}
          {gig.status === "pending" && (isAvailable || defaultAvailability) && (
            <div className="flex flex-col gap-3 pt-4">
              <div className="flex gap-3">
                <Button
                  onClick={() => handleStatusUpdate("accepted")}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Accept Gig
                </Button>
                <Button
                  onClick={() => handleStatusUpdate("declined")}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Decline
                </Button>
              </div>

              {/* Deputy Suggestion Section - Show if musician has deputies */}
              {myDeputies.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users2 className="w-5 h-5 text-blue-500" />
                    <h4 className="font-semibold">Suggest a Deputy</h4>
                    <Badge variant="outline">
                      {availableDeputies.length} available
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-3">
                    {myDeputies.slice(0, 3).map((deputy) => (
                      <div
                        key={deputy?._id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <User className="w-8 h-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">
                              {deputy?.firstname} {deputy?.lastname}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {deputy?.relationship?.forMySkill}
                              {deputy?.avgRating &&
                                ` • ${deputy?.avgRating} ⭐`}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleSuggestSpecificDeputy(
                                deputy?._id as Id<"users">,
                                `${deputy?.firstname} ${deputy?.lastname}`
                              )
                            }
                            variant="outline"
                            disabled={isLoading(`update-${deputy?._id}`)}
                          >
                            {isLoading(`update-${deputy?._id}`)
                              ? "..."
                              : "Suggest"}
                          </Button>
                          <Switch
                            checked={
                              deputy?.relationship?.canBeBooked !== false
                            }
                            onCheckedChange={(checked) =>
                              handleUpdateDeputyBooking(
                                deputy?._id as Id<"users">,
                                checked
                              )
                            }
                            disabled={isLoading(`update-${deputy?._id}`)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleStatusUpdate("deputy-suggested")}
                    variant="outline"
                    className="w-full"
                  >
                    <Users2 className="w-4 h-4 mr-2" />
                    Suggest Any Available Deputy
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Show deputies section when marked as unavailable */}
          {showDeputies && gig.status === "pending" && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Users2 className="w-5 h-5 text-blue-500" />
                <h4 className="font-semibold">Available Deputies</h4>
                <Badge variant="outline">
                  {availableDeputies.length} available
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                Since you're not available, you can suggest deputies to the
                client.
              </p>

              {availableDeputies.length > 0 ? (
                <div className="space-y-3">
                  {availableDeputies.slice(0, 3).map((deputy) => (
                    <div
                      key={deputy?._id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <User className="w-8 h-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">
                            {deputy?.firstname} {deputy?.lastname}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {deputy?.relationship?.forMySkill}
                            {deputy?.avgRating && ` • ${deputy?.avgRating} ⭐`}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() =>
                          handleSuggestSpecificDeputy(
                            deputy?._id as Id<"users">,
                            `${deputy?.firstname} ${deputy?.lastname}`
                          )
                        }
                        variant="outline"
                      >
                        Suggest
                      </Button>
                    </div>
                  ))}

                  <Button
                    onClick={() => handleStatusUpdate("deputy-suggested")}
                    className="w-full"
                  >
                    <Users2 className="w-4 h-4 mr-2" />
                    Suggest All Available Deputies
                  </Button>
                </div>
              ) : (
                <div
                  className={cn(
                    "p-6 rounded-lg border text-center",
                    colors.border,
                    colors.card
                  )}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                    <Users2 className="w-8 h-8 text-blue-500" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">
                    No Deputies Available
                  </h4>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    The musician you invited doesn't have any deputies set up
                    for this type of gig, or their deputies are currently
                    unavailable.
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      💡 <strong>What you can do:</strong>
                    </p>
                    <ul className="space-y-1 text-left max-w-xs mx-auto">
                      <li>• Wait for the musician to suggest other options</li>
                      <li>
                        • Contact the musician directly to discuss alternatives
                      </li>
                      <li>• Consider inviting another musician for this gig</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status-specific messages */}
          {gig.status === "declined" && !isAvailable && (
            <div
              className={cn(
                "p-3 rounded-lg border",
                colors.warningBg,
                colors.border
              )}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <p className="text-sm">
                  You declined this gig because you're not available.
                </p>
              </div>
            </div>
          )}

          {gig.status === "deputy-suggested" && (
            <div
              className={cn(
                "p-3 rounded-lg border",
                colors.infoBg,
                colors.border
              )}
            >
              <div className="flex items-center gap-2">
                <Users2 className="w-4 h-4 text-blue-600" />
                <p className="text-sm">
                  You've suggested deputies for this gig. Waiting for client
                  response.
                </p>
              </div>
            </div>
          )}

          {gig.status === "accepted" && (
            <div
              className={cn(
                "p-3 rounded-lg border",
                "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
              )}
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <p className="text-sm text-green-800 dark:text-green-300">
                  You've accepted this gig! Get ready to perform.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export const GigAvailabilitySwitch: React.FC<GigAvailabilitySwitchProps> = ({
  checked,
  onCheckedChange,
  disabled = false,
  size = "md",
  showLabels = true,
}) => {
  const sizeClasses = {
    sm: "w-16 h-8",
    md: "w-20 h-10",
    lg: "w-24 h-12",
  };

  const knobSize = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const iconSize = {
    sm: 12,
    md: 16,
    lg: 20,
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex items-center rounded-full border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2",
        sizeClasses[size],
        checked
          ? "border-green-500 bg-green-500 focus:ring-green-200"
          : "border-red-500 bg-red-500 focus:ring-red-200",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer hover:shadow-md",
        "group"
      )}
    >
      {/* Knob */}
      <div
        className={cn(
          "absolute flex items-center justify-center rounded-full bg-white shadow-lg transition-all duration-300",
          knobSize[size],
          checked
            ? `translate-x-full ${size === "sm" ? "-translate-x-7" : size === "md" ? "-translate-x-9" : "-translate-x-11"}`
            : "translate-x-0.5",
          "group-hover:scale-105"
        )}
      >
        {checked ? (
          <Check
            className="text-green-600"
            size={iconSize[size]}
            strokeWidth={3}
          />
        ) : (
          <X className="text-red-600" size={iconSize[size]} strokeWidth={3} />
        )}
      </div>

      {/* Labels */}
      {showLabels && (
        <>
          <span
            className={cn(
              "absolute left-2 text-xs font-medium transition-opacity duration-200",
              checked ? "opacity-0" : "opacity-100 text-white"
            )}
          >
            No
          </span>
          <span
            className={cn(
              "absolute right-2 text-xs font-medium transition-opacity duration-200",
              checked ? "opacity-100 text-white" : "opacity-0"
            )}
          >
            Yes
          </span>
        </>
      )}
    </button>
  );
};

interface GigAvailabilitySwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
} // Enhanced version with status indicators
interface GigAvailabilitySwitchWithStatusProps
  extends GigAvailabilitySwitchProps {
  status?: "available" | "notavailable" | "pending";
  showStatusText?: boolean;
}
export const GigAvailabilitySwitchWithStatus: React.FC<
  GigAvailabilitySwitchWithStatusProps
> = ({
  checked,
  onCheckedChange,
  disabled = false,
  size = "md",
  showLabels = true,
  status,
  showStatusText = true,
}) => {
  const statusConfig = {
    available: {
      text: "Available",
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
    },
    notavailable: {
      text: "Not Available",
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
    },
    pending: {
      text: "Pending Response",
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
    },
  };

  const currentStatus = status || (checked ? "available" : "notavailable");
  const config = statusConfig[currentStatus];

  return (
    <div className="flex items-center gap-3">
      <GigAvailabilitySwitch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        size={size}
        showLabels={showLabels}
      />

      {showStatusText && (
        <div
          className={cn(
            "px-3 py-1 rounded-full text-sm font-medium border",
            config.bg,
            config.color,
            config.border
          )}
        >
          {config.text}
        </div>
      )}
    </div>
  );
};
