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
import { ChatIcon } from "@/components/chat/ChatIcon";

interface InvitesPageProps {
  params: {
    gigId: string;
  };
}

export default function InvitesPage({ params }: InvitesPageProps) {
  const { user, isLoading: userLoading } = useCurrentUser();
  const router = useRouter();
  const { colors } = useThemeColors();

  if (userLoading) {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center",
          colors.background
        )}
      >
        <div className={cn("animate-pulse text-lg", colors.text)}>
          Loading...
        </div>
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
          <ClientGigView gigId={params.gigId} />
        ) : user.isMusician ? (
          <MusicianGigView gigId={params.gigId} />
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

  const handleAcceptDeputy = async (deputyId: string, deputyName: string) => {
    try {
      // Update gig with new musician and status
      await updateGigStatus({
        gigId: gigId as any,
        status: "accepted",
        musicianId: deputyId as any,
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
      });
      toast.success("Deputy suggestions declined");
    } catch (error) {
      toast.error("Failed to decline deputies");
    }
  };

  if (!gig) {
    return (
      <Card className={cn("w-full", colors.card)}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Loading gig details...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter deputies that are bookable
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

          {/* Original Musician */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">
              {gig.status === "deputy-suggested"
                ? "Original Musician"
                : "Invited Musician"}
            </h4>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <User className="w-8 h-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">{gig.musicianName}</p>
                  <p className="text-sm text-muted-foreground">
                    {gig.status === "deputy-suggested"
                      ? "Suggested deputies instead"
                      : "Waiting for response..."}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">
                  {gig.status === "deputy-suggested"
                    ? "Original Musician"
                    : "Invited Musician"}
                </h4>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <User className="w-8 h-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{gig.musicianName}</p>
                      <p className="text-sm text-muted-foreground">
                        {gig.status === "deputy-suggested"
                          ? "Suggested deputies instead"
                          : "Waiting for response..."}
                      </p>
                    </div>
                  </div>
                  <ChatIcon
                    userId={gig.invitedMusicianId}
                    size="md"
                    showText={true}
                    text="Message"
                    variant="outline"
                  />
                </div>
              </div>
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
                                (window.location.href = `/profile`)
                              }
                            >
                              View Profile
                            </Button>
                            <ChatIcon
                              userId={deputy._id as Id<"users">}
                              size="sm"
                              showText={false}
                              variant="ghost"
                              className="h-8 w-8"
                            />
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
                <div
                  className={cn(
                    "p-4 rounded-lg border text-center",
                    colors.border
                  )}
                >
                  <p className="text-muted-foreground">
                    No deputies available for this gig
                  </p>
                </div>
              )}
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
  const updateAvailability = useMutation(
    api.controllers.musicians.updateAvailability
  );

  // Use the useDeputies hook
  const { myDeputies, updateDeputySettings, isLoading } = useDeputies(
    user?._id
  );

  const [isAvailable, setIsAvailable] = useState(
    user?.availability === "available"
  );

  const handleAvailabilityToggle = async (available: boolean) => {
    if (!user) return;

    try {
      await updateAvailability({
        musicianId: user._id,
        available: available ? "available" : "notavailable",
      });

      setIsAvailable(available);

      if (!available && gig?.status === "pending") {
        // Auto-decline gig if musician becomes unavailable
        await updateGigStatus({
          gigId: gigId as any,
          status: "declined",
          musicianId: user._id,
        });
        toast.success("Gig declined due to unavailability");
      }
    } catch (error) {
      toast.error("Failed to update availability");
    }
  };

  const handleStatusUpdate = async (
    status: "accepted" | "declined" | "deputy-suggested"
  ) => {
    if (!user) return;

    try {
      await updateGigStatus({
        gigId: gigId as any,
        status,
        musicianId: user._id,
      });

      if (status === "accepted") {
        toast.success("Gig accepted successfully");
      } else if (status === "declined") {
        toast.success("Gig declined");
      } else if (status === "deputy-suggested") {
        toast.success("Deputy suggestion sent to client");
      }
    } catch (error) {
      toast.error("Failed to update gig status");
    }
  };

  const handleSuggestSpecificDeputy = async (deputyId: string) => {
    if (!user) return;

    try {
      // First update gig status to deputy-suggested
      await updateGigStatus({
        gigId: gigId as any,
        status: "deputy-suggested",
        musicianId: user._id,
      });

      // You might want to create a separate mutation to link specific deputy to gig
      toast.success("Deputy suggested to client");
    } catch (error) {
      toast.error("Failed to suggest deputy");
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
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Loading gig details...
          </div>
        </CardContent>
      </Card>
    );
  }

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
          {/* Availability Toggle */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div
                className={cn(
                  "w-3 h-3 rounded-full",
                  isAvailable ? "bg-green-500" : "bg-red-500"
                )}
              />
              <div>
                <p className="font-medium">Availability Status</p>
                <p className="text-sm text-muted-foreground">
                  {isAvailable
                    ? "You're available for this gig"
                    : "You're not available"}
                </p>
              </div>
            </div>
            <Switch
              checked={isAvailable}
              onCheckedChange={handleAvailabilityToggle}
            />
          </div>

          {/* Client Information */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">From Client</h4>
            <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
              <User className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="font-medium">{gig.clientName}</p>
                <p className="text-sm text-muted-foreground">
                  Looking for musician
                </p>
              </div>
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

          {/* Action Buttons */}
          {gig.status === "pending" && isAvailable && (
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

              {/* Deputy Suggestion Section */}
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
                                deputy?._id as Id<"users">
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
        </CardContent>
      </Card>
    </div>
  );
}
