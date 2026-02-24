"use client";
import React, { useState, useMemo, useEffect } from "react";
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
  Sparkles,
  Crown,
  Zap,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import GigLoader from "@/components/(main)/GigLoader";
import { ChatIcon } from "@/components/chat/ChatIcon";

interface InvitesPageProps {
  params: Promise<{ gigId: string }>;
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
          colors.background,
        )}
      >
        <GigLoader
          color="border-orange-300"
          size="md"
          title="Loading Invitation..."
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center",
          colors.background,
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
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/20 via-red-50/10 to-pink-50/10" />

      <div className="relative container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className={cn(
                "flex items-center gap-2 border-2 transition-all duration-300 hover:shadow-lg backdrop-blur-sm",
                colors.border,
                colors.hoverBg,
                "hover:scale-105",
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Invites
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                  {user.isClient ? (
                    <Crown className="w-6 h-6 text-white" />
                  ) : (
                    <Music className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h1
                    className={cn(
                      "text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-2",
                    )}
                  >
                    Gig Invitation
                  </h1>
                  <p className={cn("text-lg font-medium", colors.textMuted)}>
                    {user.isClient
                      ? "Manage your invitation details"
                      : "Review and respond to this opportunity"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Role Badge */}
          <div className="flex items-center gap-3">
            <Badge
              variant={user.isMusician ? "success" : "default"}
              className="text-sm px-4 py-2 font-semibold shadow-sm"
            >
              {user.isMusician ? "🎵 Professional Musician" : "🎯 Event Client"}
            </Badge>
            <div className={cn("h-4 w-px", colors.border)} />
            <span className={cn("text-sm font-medium", colors.textMuted)}>
              {user.isClient
                ? "You sent this invitation"
                : "You received this invitation"}
            </span>
          </div>
        </div>

        {/* Main Content */}
        {user.isClient ? (
          <ClientGigView gigId={gigId} />
        ) : user.isMusician ? (
          <MusicianGigView gigId={gigId} />
        ) : (
          <Card
            className={cn(
              "border-2 text-center backdrop-blur-sm",
              colors.card,
              colors.border,
              colors.backgroundSecondary,
            )}
          >
            <CardContent className="p-12">
              <div
                className={cn(
                  "w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center shadow-2xl bg-gradient-to-br from-gray-500 to-slate-600",
                )}
              >
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className={cn("text-xl font-bold mb-4", colors.text)}>
                Complete Your Profile
              </h3>
              <p
                className={cn(
                  "max-w-md mx-auto mb-8 text-lg leading-relaxed",
                  colors.textMuted,
                )}
              >
                Set up your musician or client profile to start sending and
                receiving gig invitations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-xl transition-all duration-300"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Setup Profile
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className={cn(
                    "border-2 hover:shadow-lg transition-all duration-300",
                    colors.border,
                    colors.hoverBg,
                  )}
                >
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Enhanced Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const { colors } = useThemeColors();

  const statusConfig = {
    pending: {
      label: "Pending Response",
      icon: Clock,
      className: cn(
        "bg-orange-500/10 text-orange-700 border-orange-300",
        colors.border,
      ),
    },
    accepted: {
      label: "Confirmed 🎉",
      icon: Check,
      className: cn(
        "bg-green-500/10 text-green-700 border-green-300",
        colors.border,
      ),
    },
    declined: {
      label: "Declined",
      icon: X,
      className: cn("bg-red-500/10 text-red-700 border-red-300", colors.border),
    },
    "deputy-suggested": {
      label: "Deputy Available",
      icon: Users2,
      className: cn(
        "bg-blue-500/10 text-blue-700 border-blue-300",
        colors.border,
      ),
    },
    cancelled: {
      label: "Cancelled",
      icon: X,
      className: cn(
        "bg-gray-500/10 text-gray-700 border-gray-300",
        colors.border,
      ),
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-300",
        config.className,
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{config.label}</span>
    </div>
  );
};

// Enhanced Client View Component
function ClientGigView({ gigId }: { gigId: string }) {
  const { user } = useCurrentUser();
  const { colors } = useThemeColors();

  const gig = useQuery(api.controllers.instantGigs.getInstantGigById, {
    gigId: gigId as Id<"instantgigs">,
  });
  const updateGigStatus = useMutation(
    api.controllers.instantGigs.updateInstantGigStatus,
  );

  const { myDeputies } = useDeputies(gig?.invitedMusicianId);
  const router = useRouter();

  const handleAcceptDeputy = async (deputyId: string, deputyName: string) => {
    try {
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
      <Card
        className={cn(
          "w-full border-2 text-center backdrop-blur-sm",
          colors.card,
          colors.border,
          colors.backgroundSecondary,
        )}
      >
        <CardContent className="p-12">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center shadow-2xl bg-gradient-to-br from-red-500 to-orange-600">
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
          <h3 className={cn("text-xl font-bold mb-4", colors.text)}>
            Gig Not Found
          </h3>
          <p
            className={cn(
              "max-w-md mx-auto mb-8 text-lg leading-relaxed",
              colors.textMuted,
            )}
          >
            We couldn't find the gig you're looking for. It may have been
            cancelled or removed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className={cn(
                "border-2 hover:shadow-lg transition-all duration-300",
                colors.border,
                colors.hoverBg,
              )}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button
              onClick={() => router.push("/hub/gigs")}
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-xl transition-all duration-300"
            >
              Browse Available Gigs
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const availableDeputies = myDeputies.filter(
    (deputy) => deputy?.relationship?.canBeBooked !== false,
  );
  const bookingHistory = gig.bookingHistory || [];

  return (
    <div className="space-y-6">
      {/* Gig Details Card */}
      <Card
        className={cn(
          "w-full border-0 transition-all duration-500 hover:shadow-2xl transform-gpu overflow-hidden backdrop-blur-sm",
          colors.card,
          "bg-gradient-to-br from-white to-gray-50/80",
        )}
      >
        {/* Accent Border */}
        <div className="w-full h-1 bg-gradient-to-r from-orange-500 to-red-500" />

        <CardHeader className="pb-4 pt-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />
                <span
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wide",
                    colors.primary,
                  )}
                >
                  {gig.gigType}
                </span>
              </div>
              <CardTitle className={cn("text-xl font-bold mb-2", colors.text)}>
                {gig.title}
              </CardTitle>
              <CardDescription
                className={cn("text-lg leading-relaxed", colors.textMuted)}
              >
                {gig.description}
              </CardDescription>
            </div>
            <StatusBadge status={gig.status} />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Gig Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: Calendar, label: "Date", value: gig.date },
              { icon: Clock, label: "Duration", value: gig.duration },
              { icon: MapPin, label: "Venue", value: gig.venue },
              { icon: DollarSign, label: "Budget", value: gig.budget },
              { icon: Music, label: "Type", value: gig.gigType },
            ].map((item, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all duration-300",
                  colors.backgroundMuted,
                  "group hover:bg-white/80 border border-transparent hover:border-orange-200",
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    "bg-gradient-to-br from-orange-500 to-red-500",
                  )}
                >
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      "text-xs font-medium uppercase tracking-wide",
                      colors.textMuted,
                    )}
                  >
                    {item.label}
                  </div>
                  <div className={cn("text-sm font-semibold", colors.text)}>
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Current Musician Status */}
          <div className="border-t border-gray-200 pt-6">
            <h4
              className={cn(
                "font-bold text-lg mb-4 flex items-center gap-2",
                colors.text,
              )}
            >
              <User className="w-5 h-5" />
              {gig.status === "deputy-suggested"
                ? "Musician & Deputy Status"
                : gig.status === "accepted" && gig.originalMusicianId
                  ? "Confirmed Deputy"
                  : "Musician Status"}
            </h4>

            {/* Original Musician Card */}
            {(gig.status === "deputy-suggested" || gig.originalMusicianId) && (
              <div
                className={cn(
                  "mb-4 p-4 rounded-xl border-2",
                  "bg-gradient-to-br from-gray-50 to-blue-50 border-blue-200",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        "bg-gradient-to-br from-gray-500 to-slate-500",
                      )}
                    >
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className={cn("font-semibold", colors.text)}>
                        {gig.originalMusicianName || gig.musicianName}
                      </p>
                      <p className={cn("text-sm", colors.textMuted)}>
                        Original Invited Musician •{" "}
                        {gig.status === "deputy-suggested"
                          ? "Suggested deputies"
                          : "Replaced by deputy"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-gray-100">
                    Original
                  </Badge>
                </div>
              </div>
            )}

            {/* Current Musician Card */}
            <div
              className={cn(
                "flex items-center justify-between p-4 rounded-xl transition-all duration-300",
                colors.backgroundMuted,
                "group hover:bg-white/80 border border-transparent hover:border-blue-200",
              )}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    gig.originalMusicianId
                      ? "bg-gradient-to-br from-green-500 to-emerald-500"
                      : "bg-gradient-to-br from-blue-500 to-cyan-500",
                    "shadow-lg",
                  )}
                >
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className={cn("text-sm", colors.textMuted)}>
                    {gig.status === "deputy-suggested"
                      ? "Reviewing deputy suggestions"
                      : gig.originalMusicianId
                        ? "Deputy confirmed for this gig"
                        : gig.status === "accepted"
                          ? "Confirmed for this gig"
                          : gig.status === "declined"
                            ? "Declined the invitation"
                            : "Waiting for response..."}
                  </p>
                  {gig.originalMusicianId && (
                    <p className={cn("text-xs mt-1", colors.textMuted)}>
                      🎵 Covering for {gig.originalMusicianName}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {gig.originalMusicianId && (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                    Deputy
                  </Badge>
                )}
                <ChatIcon
                  userId={gig.invitedMusicianId}
                  size="md"
                  variant="cozy"
                  showText={true}
                  text="Message"
                />
              </div>
            </div>
          </div>
          {/* Deputy Suggestions Section */}
          {gig.status === "deputy-suggested" && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    "bg-gradient-to-br from-blue-500 to-cyan-500",
                  )}
                >
                  <Users2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className={cn("font-bold text-lg", colors.text)}>
                    Deputy Suggestions
                  </h4>
                  <p className={cn("text-sm", colors.textMuted)}>
                    {availableDeputies.length} available deputies
                  </p>
                </div>
                <Badge className="ml-auto bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  {availableDeputies.length} available
                </Badge>
              </div>

              {availableDeputies.length > 0 ? (
                <div className="space-y-4">
                  {availableDeputies.map((deputy) => (
                    <Card
                      key={deputy?._id}
                      className={cn(
                        "border-0 transition-all duration-500 hover:shadow-xl transform-gpu overflow-hidden",
                        colors.card,
                        "bg-gradient-to-br from-white to-blue-50/50",
                        "border-l-4 border-l-blue-500",
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div
                              className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center",
                                "bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg",
                              )}
                            >
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p
                                className={cn("font-bold text-lg", colors.text)}
                              >
                                {deputy?.firstname} {deputy?.lastname}
                              </p>
                              <div className="flex items-center gap-3 text-sm">
                                <span className={cn(colors.textMuted)}>
                                  {deputy?.relationship?.forMySkill}
                                </span>
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                  <span
                                    className={cn("font-semibold", colors.text)}
                                  >
                                    {deputy?.avgRating || "New"}
                                  </span>
                                </div>
                                {deputy?.backupCount &&
                                  deputy?.backupCount > 0 && (
                                    <span
                                      className={cn(
                                        "text-sm",
                                        colors.textMuted,
                                      )}
                                    >
                                      {deputy?.backupCount} backup gigs
                                    </span>
                                  )}
                              </div>
                              {deputy?.relationship?.note && (
                                <p
                                  className={cn(
                                    "text-sm mt-2",
                                    colors.textMuted,
                                  )}
                                >
                                  📝 {deputy?.relationship.note}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleAcceptDeputy(
                                  deputy?._id as Id<"users">,
                                  `${deputy?.firstname} ${deputy?.lastname}`,
                                )
                              }
                              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-xl transition-all duration-300"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                (window.location.href = `/search/${deputy?.username}`)
                              }
                              className={cn(
                                "border-2 transition-all duration-300",
                                colors.border,
                                colors.hoverBg,
                              )}
                            >
                              View Profile
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Decline All Button */}
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={handleDeclineDeputy}
                      className={cn(
                        "border-2 text-red-600 border-red-300 hover:bg-red-50 transition-all duration-300",
                        colors.hoverBg,
                      )}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Decline All Suggestions
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className={cn(
                    "text-center p-8 border-2 border-dashed rounded-2xl",
                    colors.border,
                    colors.backgroundSecondary,
                  )}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg">
                    <Users2 className="w-8 h-8 text-white" />
                  </div>
                  <h4 className={cn("font-bold text-xl mb-3", colors.text)}>
                    No Deputies Available
                  </h4>
                  <p
                    className={cn(
                      "max-w-md mx-auto mb-6 text-lg leading-relaxed",
                      colors.textMuted,
                    )}
                  >
                    You don't have any deputies set up who can cover this gig
                    for you.
                  </p>
                  <div className="space-y-3 text-sm text-left max-w-md mx-auto mb-6">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-500" />
                      <span className={cn(colors.text)}>
                        Connect with other musicians in your area
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className={cn(colors.text)}>
                        Add trusted colleagues as deputies
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users2 className="w-4 h-4 text-blue-500" />
                      <span className={cn(colors.text)}>
                        Specify which gig types they can cover
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() =>
                      (window.location.href = "/profile?tab=deputies")
                    }
                    variant="outline"
                    className={cn(
                      "border-2 hover:shadow-lg transition-all duration-300",
                      colors.border,
                      colors.hoverBg,
                    )}
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
            <div className="border-t border-gray-200 pt-6">
              <h4
                className={cn(
                  "font-bold text-lg mb-4 flex items-center gap-2",
                  colors.text,
                )}
              >
                <Calendar className="w-5 h-5" />
                Booking History
              </h4>
              <div className="space-y-3">
                {bookingHistory.map((entry, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl transition-all duration-300",
                      colors.backgroundMuted,
                      "group hover:bg-white/80 border border-transparent hover:border-green-200",
                    )}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full",
                          entry.status === "accepted"
                            ? "bg-green-500"
                            : entry.status === "declined"
                              ? "bg-red-500"
                              : entry.status === "deputy-suggested"
                                ? "bg-blue-500"
                                : "bg-yellow-500",
                        )}
                      />
                      <div>
                        <p className={cn("font-semibold", colors.text)}>
                          {entry.musicianName}
                        </p>
                        <p className={cn("text-sm", colors.textMuted)}>
                          {entry.status} •{" "}
                          {new Date(entry.timestamp).toLocaleString()} • By{" "}
                          {entry.actionBy}
                        </p>
                        {entry.notes && (
                          <p className={cn("text-sm mt-1", colors.textMuted)}>
                            📝 {entry.notes}
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
            <div className="border-t border-gray-200 pt-6">
              <h4
                className={cn(
                  "font-bold text-lg mb-4 flex items-center gap-2",
                  colors.text,
                )}
              >
                <Music className="w-5 h-5" />
                Setlist & Special Requests
              </h4>
              <div
                className={cn(
                  "p-4 rounded-xl border-2",
                  colors.border,
                  colors.backgroundMuted,
                )}
              >
                <p className={cn("text-sm leading-relaxed", colors.text)}>
                  {gig.setlist}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Enhanced Musician View Component
function MusicianGigView({ gigId }: { gigId: string }) {
  const { user } = useCurrentUser();
  const { colors } = useThemeColors();

  const gig = useQuery(api.controllers.instantGigs.getInstantGigById, {
    gigId: gigId as Id<"instantgigs">,
  });

  const updateGigStatus = useMutation(
    api.controllers.instantGigs.updateInstantGigStatus,
  );

  const updateGigAvailability = useMutation(
    api.controllers.instantGigs.updateGigAvailability,
  );

  const { myDeputies, updateDeputySettings, isLoading } = useDeputies(
    user?._id,
  );
  const router = useRouter();
  useEffect(() => {
    if (gig?.status === "deputy-suggested") {
      router.back();
    }
  }, [gig?.status, router]); // Add proper dependencies
  const handleStatusUpdate = async (
    status: "accepted" | "declined" | "deputy-suggested",
    notes?: string,
    deputySuggestedId?: string,
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
    deputyName: string,
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

      if (!available && gig?.status === "pending") {
        await updateGigStatus({
          gigId: gigId as Id<"instantgigs">,
          status: "pending",
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
    canBeBooked: boolean,
  ) => {
    try {
      await updateDeputySettings(deputyId as Id<"users">, { canBeBooked });
      toast.success(
        `Deputy ${canBeBooked ? "enabled" : "disabled"} for bookings`,
      );
    } catch (error) {
      toast.error("Failed to update deputy settings");
    }
  };

  if (!gig) {
    return (
      <Card
        className={cn(
          "w-full border-2 text-center backdrop-blur-sm",
          colors.card,
          colors.border,
          colors.backgroundSecondary,
        )}
      >
        <CardContent className="p-12">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center shadow-2xl bg-gradient-to-br from-orange-500 to-red-600">
            <Music className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h3 className={cn("text-xl font-bold mb-4", colors.text)}>
            Loading Gig Details
          </h3>
          <p
            className={cn(
              "max-w-md mx-auto mb-8 text-lg leading-relaxed",
              colors.textMuted,
            )}
          >
            Fetching the latest information about this gig invitation...
          </p>
          <div className="flex justify-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const isAvailable = gig?.musicianAvailability === "available";
  const showDeputies = gig?.musicianAvailability === "notavailable";
  const defaultAvailability =
    gig?.musicianAvailability === undefined && gig?.status === "pending";

  const availableDeputies = myDeputies.filter(
    (deputy) => deputy?.relationship?.canBeBooked !== false,
  );
  const bookingHistory = gig.bookingHistory || [];
  console.log(bookingHistory);
  return (
    <div className="space-y-6">
      {/* Gig Details Card */}
      <Card
        className={cn(
          "w-full border-0 transition-all duration-500 hover:shadow-2xl transform-gpu overflow-hidden backdrop-blur-sm",
          colors.card,
          "bg-gradient-to-br from-white to-gray-50/80",
        )}
      >
        {/* Accent Border */}
        <div className="w-full h-1 bg-gradient-to-r from-orange-500 to-red-500" />

        <CardHeader className="pb-4 pt-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />
                <span
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wide",
                    colors.primary,
                  )}
                >
                  {gig.gigType}
                </span>
              </div>
              <CardTitle className={cn("text-xl font-bold mb-2", colors.text)}>
                {gig.title}
              </CardTitle>
              <CardDescription
                className={cn("text-lg leading-relaxed", colors.textMuted)}
              >
                {gig.description}
              </CardDescription>
            </div>
            <StatusBadge status={gig.status} />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Availability Section */}
          {gig?.status === "deputy-suggested" && (
            <div
              className={cn(
                "flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300",
                colors.border,
                "bg-gradient-to-br from-blue-50 to-purple-50",
                "hover:shadow-lg",
              )}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center shadow-lg",
                    isAvailable || defaultAvailability
                      ? "bg-gradient-to-br from-green-500 to-emerald-500"
                      : "bg-gradient-to-br from-red-500 to-rose-500",
                  )}
                >
                  {isAvailable || defaultAvailability ? (
                    <Check className="w-6 h-6 text-white" strokeWidth={3} />
                  ) : (
                    <X className="w-6 h-6 text-white" strokeWidth={3} />
                  )}
                </div>
                <div>
                  <p className={cn("font-bold text-xl", colors.text)}>
                    Gig Availability
                  </p>
                  <p className={cn("text-sm", colors.textMuted)}>
                    {isAvailable || defaultAvailability
                      ? "You can accept this gig invitation"
                      : "You're not available - suggest deputies instead"}
                  </p>
                </div>
              </div>
              {gig.status !== "deputy-suggested" && (
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
              )}
            </div>
          )}
          {/* Client Information */}
          <div className="border-t border-gray-200 pt-6">
            <h4
              className={cn(
                "font-bold text-lg mb-4 flex items-center gap-2",
                colors.text,
              )}
            >
              <User className="w-5 h-5" />
              From Client
            </h4>
            <div
              className={cn(
                "flex items-center justify-between p-4 rounded-xl transition-all duration-300",
                colors.backgroundMuted,
                "group hover:bg-white/80 border border-transparent hover:border-blue-200",
              )}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    "bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg",
                  )}
                >
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className={cn("font-bold text-lg", colors.text)}>
                    {gig.clientName}
                  </p>
                  <p className={cn("text-sm", colors.textMuted)}>
                    Looking for musician
                  </p>
                </div>
              </div>
              <ChatIcon
                userId={gig.clientId}
                size="md"
                variant="cozy"
                showText={true}
                text="Message"
              />
            </div>
          </div>

          {/* Gig Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: Calendar, label: "Date", value: gig.date },
              { icon: Clock, label: "Duration", value: gig.duration },
              { icon: MapPin, label: "Venue", value: gig.venue },
              { icon: DollarSign, label: "Budget", value: gig.budget },
            ].map((item, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all duration-300",
                  colors.backgroundMuted,
                  "group hover:bg-white/80 border border-transparent hover:border-orange-200",
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    "bg-gradient-to-br from-orange-500 to-red-500",
                  )}
                >
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      "text-xs font-medium uppercase tracking-wide",
                      colors.textMuted,
                    )}
                  >
                    {item.label}
                  </div>
                  <div className={cn("text-sm font-semibold", colors.text)}>
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Setlist if available */}
          {gig.setlist && (
            <div className="border-t border-gray-200 pt-6">
              <h4
                className={cn(
                  "font-bold text-lg mb-4 flex items-center gap-2",
                  colors.text,
                )}
              >
                <Music className="w-5 h-5" />
                Setlist & Special Requests
              </h4>
              <div
                className={cn(
                  "p-4 rounded-xl border-2",
                  colors.border,
                  colors.backgroundMuted,
                )}
              >
                <p className={cn("text-sm leading-relaxed", colors.text)}>
                  {gig.setlist}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {gig.status === "pending" && (isAvailable || defaultAvailability) && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleStatusUpdate("accepted")}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    size="lg"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Accept Gig
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate("declined")}
                    variant="outline"
                    className={cn(
                      "flex-1 border-2 hover:shadow-xl transition-all duration-300 transform hover:scale-105",
                      colors.border,
                      colors.hoverBg,
                    )}
                    size="lg"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Decline
                  </Button>
                </div>

                {/* Deputy Suggestion Section */}
                {myDeputies.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          "bg-gradient-to-br from-blue-500 to-cyan-500",
                        )}
                      >
                        <Users2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className={cn("font-bold text-lg", colors.text)}>
                          Suggest a Deputy
                        </h4>
                        <p className={cn("text-sm", colors.textMuted)}>
                          {availableDeputies.length} available deputies
                        </p>
                      </div>
                      <Badge className="ml-auto bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                        {availableDeputies.length} available
                      </Badge>
                    </div>

                    <div className="space-y-3 mb-4">
                      {myDeputies.slice(0, 3).map((deputy) => (
                        <div
                          key={deputy?._id}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-xl transition-all duration-300",
                            colors.backgroundMuted,
                            "group hover:bg-white/80 border border-transparent hover:border-purple-200",
                          )}
                        >
                          <div className="flex items-center space-x-4">
                            <div
                              className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center",
                                "bg-gradient-to-br from-purple-500 to-pink-500",
                              )}
                            >
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className={cn("font-semibold", colors.text)}>
                                {deputy?.firstname} {deputy?.lastname}
                              </p>
                              <p className={cn("text-sm", colors.textMuted)}>
                                {deputy?.relationship?.forMySkill}
                                {deputy?.avgRating &&
                                  ` • ${deputy?.avgRating} ⭐`}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleSuggestSpecificDeputy(
                                  deputy?._id as Id<"users">,
                                  `${deputy?.firstname} ${deputy?.lastname}`,
                                )
                              }
                              variant="outline"
                              disabled={isLoading(`update-${deputy?._id}`)}
                              className={cn(
                                "border-2 transition-all duration-300",
                                colors.border,
                                colors.hoverBg,
                              )}
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
                                  checked,
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
                      className={cn(
                        "w-full border-2 hover:shadow-lg transition-all duration-300",
                        colors.border,
                        colors.hoverBg,
                      )}
                    >
                      <Users2 className="w-4 h-4 mr-2" />
                      Suggest Any Available Deputy
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Show deputies section when marked as unavailable */}
          {showDeputies && gig.status === "pending" && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    "bg-gradient-to-br from-blue-500 to-cyan-500",
                  )}
                >
                  <Users2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className={cn("font-bold text-lg", colors.text)}>
                    Available Deputies
                  </h4>
                  <p className={cn("text-sm", colors.textMuted)}>
                    {availableDeputies.length} available for suggestion
                  </p>
                </div>
                <Badge className="ml-auto bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  {availableDeputies.length} available
                </Badge>
              </div>

              <p className={cn("text-sm mb-4", colors.textMuted)}>
                Since you're not available, you can suggest deputies to the
                client.
              </p>

              {availableDeputies.length > 0 ? (
                <div className="space-y-4">
                  {availableDeputies.slice(0, 3).map((deputy) => (
                    <div
                      key={deputy?._id}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl transition-all duration-300",
                        colors.backgroundMuted,
                        "group hover:bg-white/80 border border-transparent hover:border-purple-200",
                      )}
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            "bg-gradient-to-br from-purple-500 to-pink-500",
                          )}
                        >
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className={cn("font-semibold", colors.text)}>
                            {deputy?.firstname} {deputy?.lastname}
                          </p>
                          <p className={cn("text-sm", colors.textMuted)}>
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
                            `${deputy?.firstname} ${deputy?.lastname}`,
                          )
                        }
                        variant="outline"
                        className={cn(
                          "border-2 transition-all duration-300",
                          colors.border,
                          colors.hoverBg,
                        )}
                      >
                        Suggest
                      </Button>
                    </div>
                  ))}

                  <Button
                    onClick={() => handleStatusUpdate("deputy-suggested")}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-xl transition-all duration-300"
                  >
                    <Users2 className="w-4 h-4 mr-2" />
                    Suggest All Available Deputies
                  </Button>
                </div>
              ) : (
                <div
                  className={cn(
                    "p-6 rounded-xl border-2 text-center",
                    colors.border,
                    colors.backgroundSecondary,
                  )}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                    <Users2 className="w-8 h-8 text-white" />
                  </div>
                  <h4 className={cn("font-bold text-lg mb-2", colors.text)}>
                    No Deputies Available
                  </h4>
                  <p
                    className={cn(
                      "max-w-md mx-auto mb-4 text-sm",
                      colors.textMuted,
                    )}
                  >
                    You don't have any deputies set up for this type of gig, or
                    your deputies are currently unavailable.
                  </p>
                  <div className="space-y-2 text-sm text-left max-w-xs mx-auto mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-orange-500" />
                      <span className={cn(colors.text)}>
                        Wait for other options
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      <span className={cn(colors.text)}>
                        Contact the client directly
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-500" />
                      <span className={cn(colors.text)}>
                        Consider other opportunities
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status Messages */}
          {gig.status === "declined" && !isAvailable && (
            <div
              className={cn(
                "p-4 rounded-xl border-2",
                "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200",
              )}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <p className={cn("text-sm", colors.text)}>
                  You declined this gig because you're not available.
                </p>
              </div>
            </div>
          )}

          {gig.status === "deputy-suggested" && (
            <div
              className={cn(
                "p-4 rounded-xl border-2",
                "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200",
              )}
            >
              <div className="flex items-center gap-3">
                <Users2 className="w-5 h-5 text-blue-600" />
                <p className={cn("text-sm", colors.text)}>
                  You've suggested deputies for this gig. Waiting for client
                  response.
                </p>
              </div>
            </div>
          )}

          {gig.status === "accepted" && (
            <div
              className={cn(
                "p-4 rounded-xl border-2",
                "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200",
              )}
            >
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />

                <p className={cn("text-sm", colors.textMuted)}>
                  {gig?.originalMusicianId === user?._id
                    ? "You've accepted this gig! Get ready to perform. 🎉"
                    : bookingHistory[1]?.musicianId !== user?._id
                      ? "The deputy you provided was booked:->" +
                        " " +
                        bookingHistory[1]?.musicianName +
                        " was booked for this gig! 🎉"
                      : "You've been booked for this gig! Get ready to perform. 🎉"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Keep your existing GigAvailabilitySwitch and GigAvailabilitySwitchWithStatus components
// They are already well-styled and don't need changes

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
        "group",
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
          "group-hover:scale-105",
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
              checked ? "opacity-0" : "opacity-100 text-white",
            )}
          >
            No
          </span>
          <span
            className={cn(
              "absolute right-2 text-xs font-medium transition-opacity duration-200",
              checked ? "opacity-100 text-white" : "opacity-0",
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
}

interface GigAvailabilitySwitchWithStatusProps extends GigAvailabilitySwitchProps {
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
            config.border,
          )}
        >
          {config.text}
        </div>
      )}
    </div>
  );
};
