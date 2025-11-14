"use client";
import React from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Users,
  DollarSign,
  Clock,
  MapPin,
  Music,
  CheckCircle,
  XCircle,
  Clock4,
  Users2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import GigLoader from "@/components/(main)/GigLoader";

export function GigInvites({ user }: { user: any }) {
  const { isLoading } = useCurrentUser();
  const router = useRouter();
  const { colors } = useThemeColors();

  if (isLoading) {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center",
          colors.background
        )}
      >
        <GigLoader
          size="md"
          color="border-purple-300"
          title="Loading Invites"
        />
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
          Please log in to view invitations
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen", colors.background)}>
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
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
              Back to Hub
            </Button>
            <div className="flex-1">
              <h1
                className={cn(
                  "text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
                )}
              >
                {user.isClient
                  ? "🎯 Sent Invitations"
                  : "🎵 Received Invitations"}
              </h1>
              <p className={cn("text-lg", colors.textMuted)}>
                {user.isClient
                  ? "Manage all your instant gig invitations to musicians"
                  : "Review and respond to gig invitations from clients"}
              </p>
            </div>
          </div>

          {/* Role Badge */}
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "px-3 py-1 rounded-full text-sm font-medium border",
                user.isMusician
                  ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                  : "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
              )}
            >
              {user.isMusician ? "🎵 Musician" : "🎯 Client"}
            </span>
            <div className={cn("h-4 w-px", colors.border)}></div>
            <span className={cn("text-sm", colors.textMuted)}>
              {user.isClient
                ? "You're inviting musicians"
                : "Clients are inviting you"}
            </span>
          </div>
        </div>

        {/* Main Content */}
        {user.isClient ? (
          <ClientInvitesOverview />
        ) : user.isMusician ? (
          <MusicianInvitesOverview />
        ) : (
          <Card className={cn("border", colors.card, colors.border)}>
            <CardContent className="p-8 text-center">
              <div className={cn("text-lg mb-4", colors.text)}>
                You need to be a client or musician to view invitations.
              </div>
              <Button
                onClick={() => router.push("/hub/gigs")}
                className={cn(
                  "bg-blue-500 hover:bg-blue-600",
                  colors.textInverted
                )}
              >
                Return to Gig Hub
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Status badge component with theme
const StatusBadge = ({ status }: { status: string }) => {
  const { colors } = useThemeColors();

  const statusConfig = {
    pending: {
      label: "Pending",
      icon: Clock4,
      className:
        "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
    },
    accepted: {
      label: "Accepted",
      icon: CheckCircle,
      className:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
    },
    declined: {
      label: "Declined",
      icon: XCircle,
      className:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
    },
    "deputy-suggested": {
      label: "Deputy Suggested",
      icon: Users2,
      className:
        "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border",
        config.className
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

// Loading skeleton for cards
const GigCardSkeleton = () => (
  <Card className="animate-pulse">
    <CardHeader>
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    </CardContent>
  </Card>
);

// Client-specific overview component
function ClientInvitesOverview() {
  const { user } = useCurrentUser();
  const { colors } = useThemeColors();
  const clientGigs = useQuery(
    api.controllers.instantGigs.getClientInstantGigs,
    {
      clientId: user?._id as any,
    }
  );

  if (clientGigs === undefined) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <GigCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {clientGigs.length > 0 && (
        <div
          className={cn(
            "grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl border",
            colors.card,
            colors.border
          )}
        >
          <div className="text-center">
            <div className={cn("text-2xl font-bold mb-1", colors.text)}>
              {clientGigs.length}
            </div>
            <div className={cn("text-sm", colors.textMuted)}>Total</div>
          </div>
          <div className="text-center">
            <div className={cn("text-2xl font-bold mb-1 text-yellow-600")}>
              {clientGigs.filter((g) => g.status === "pending").length}
            </div>
            <div className={cn("text-sm", colors.textMuted)}>Pending</div>
          </div>
          <div className="text-center">
            <div className={cn("text-2xl font-bold mb-1 text-green-600")}>
              {clientGigs.filter((g) => g.status === "accepted").length}
            </div>
            <div className={cn("text-sm", colors.textMuted)}>Accepted</div>
          </div>
          <div className="text-center">
            <div className={cn("text-2xl font-bold mb-1 text-blue-600")}>
              {clientGigs.filter((g) => g.status === "deputy-suggested").length}
            </div>
            <div className={cn("text-sm", colors.textMuted)}>Deputy</div>
          </div>
        </div>
      )}

      {/* Gig Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {clientGigs.map((gig) => (
          <Card
            key={gig._id}
            className={cn(
              "cursor-pointer border transition-all duration-300 hover:shadow-xl hover:scale-105 group",
              colors.card,
              colors.border,
              "hover:border-blue-300"
            )}
            onClick={() =>
              (window.location.href = `/hub/gigs/invites/${gig._id}`)
            }
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between mb-2">
                <CardTitle
                  className={cn(
                    "text-lg line-clamp-2 group-hover:text-blue-600 transition-colors",
                    colors.text
                  )}
                >
                  {gig.title}
                </CardTitle>
                <StatusBadge status={gig.status} />
              </div>
              <CardDescription className={cn("line-clamp-2", colors.textMuted)}>
                {gig.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className={cn("w-4 h-4", colors.textMuted)} />
                <span className={cn("text-sm", colors.text)}>
                  {gig.musicianName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className={cn("w-4 h-4", colors.textMuted)} />
                <span className={cn("text-sm", colors.text)}>{gig.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className={cn("w-4 h-4", colors.textMuted)} />
                <span className={cn("text-sm", colors.text)}>{gig.venue}</span>
              </div>
              <div className="flex items-center gap-2">
                <Music className={cn("w-4 h-4", colors.textMuted)} />
                <span className={cn("text-sm", colors.text)}>
                  {gig.gigType}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className={cn("w-4 h-4", colors.textMuted)} />
                <span className={cn("text-sm font-medium", colors.text)}>
                  {gig.budget}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {clientGigs.length === 0 && (
        <Card
          className={cn(
            "border-2 border-dashed text-center",
            colors.card,
            colors.border
          )}
        >
          <CardContent className="p-12">
            <div
              className={cn(
                "w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center",
                colors.backgroundMuted
              )}
            >
              <Users className={cn("w-10 h-10", colors.textMuted)} />
            </div>
            <h3 className={cn("text-xl font-semibold mb-3", colors.text)}>
              No Invitations Sent Yet
            </h3>
            <p className={cn("max-w-md mx-auto mb-6", colors.textMuted)}>
              Start inviting musicians to your gigs. Create instant gig
              invitations and connect with premium talent.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() =>
                  (window.location.href = "/hub/gigs?tab=urgent-gigs")
                }
                className={cn(
                  "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
                  colors.textInverted
                )}
              >
                Create First Invitation
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  (window.location.href = "/hub/gigs?tab=urgent-gigs")
                }
                className={cn(colors.border, colors.hoverBg)}
              >
                Browse Templates
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Musician-specific overview component
function MusicianInvitesOverview() {
  const { user } = useCurrentUser();
  const { colors } = useThemeColors();
  const musicianGigs = useQuery(
    api.controllers.instantGigs.getMusicianInstantGigs,
    {
      musicianId: user?._id as any,
    }
  );

  if (musicianGigs === undefined) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <GigCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {musicianGigs.length > 0 && (
        <div
          className={cn(
            "grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl border",
            colors.card,
            colors.border
          )}
        >
          <div className="text-center">
            <div className={cn("text-2xl font-bold mb-1", colors.text)}>
              {musicianGigs.length}
            </div>
            <div className={cn("text-sm", colors.textMuted)}>Total</div>
          </div>
          <div className="text-center">
            <div className={cn("text-2xl font-bold mb-1 text-yellow-600")}>
              {musicianGigs.filter((g) => g.status === "pending").length}
            </div>
            <div className={cn("text-sm", colors.textMuted)}>Pending</div>
          </div>
          <div className="text-center">
            <div className={cn("text-2xl font-bold mb-1 text-green-600")}>
              {musicianGigs.filter((g) => g.status === "accepted").length}
            </div>
            <div className={cn("text-sm", colors.textMuted)}>Accepted</div>
          </div>
          <div className="text-center">
            <div className={cn("text-2xl font-bold mb-1 text-blue-600")}>
              {
                musicianGigs.filter((g) => g.status === "deputy-suggested")
                  .length
              }
            </div>
            <div className={cn("text-sm", colors.textMuted)}>Deputy</div>
          </div>
        </div>
      )}

      {/* Gig Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {musicianGigs.map((gig) => (
          <Card
            key={gig._id}
            className={cn(
              "cursor-pointer border transition-all duration-300 hover:shadow-xl hover:scale-105 group",
              colors.card,
              colors.border,
              "hover:border-blue-300"
            )}
            onClick={() =>
              (window.location.href = `/hub/gigs/invites/${gig._id}`)
            }
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between mb-2">
                <CardTitle
                  className={cn(
                    "text-lg line-clamp-2 group-hover:text-blue-600 transition-colors",
                    colors.text
                  )}
                >
                  {gig.title}
                </CardTitle>
                <StatusBadge status={gig.status} />
              </div>
              <CardDescription className={cn("line-clamp-2", colors.textMuted)}>
                {gig.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className={cn("w-4 h-4", colors.textMuted)} />
                <span className={cn("text-sm", colors.text)}>
                  {gig.clientName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className={cn("w-4 h-4", colors.textMuted)} />
                <span className={cn("text-sm", colors.text)}>{gig.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className={cn("w-4 h-4", colors.textMuted)} />
                <span className={cn("text-sm", colors.text)}>{gig.venue}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className={cn("w-4 h-4", colors.textMuted)} />
                <span className={cn("text-sm", colors.text)}>
                  {gig.duration}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className={cn("w-4 h-4", colors.textMuted)} />
                <span className={cn("text-sm font-medium", colors.text)}>
                  {gig.budget}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {musicianGigs.length === 0 && (
        <Card
          className={cn(
            "border-2 border-dashed text-center",
            colors.card,
            colors.border
          )}
        >
          <CardContent className="p-12">
            <div
              className={cn(
                "w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center",
                colors.backgroundMuted
              )}
            >
              <Calendar className={cn("w-10 h-10", colors.textMuted)} />
            </div>
            <h3 className={cn("text-xl font-semibold mb-3", colors.text)}>
              No Invitations Received Yet
            </h3>
            <p className={cn("max-w-md mx-auto mb-6", colors.textMuted)}>
              Clients will send you invitations for gigs that match your
              profile. Keep your availability updated to receive more
              opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => (window.location.href = "/profile")}
                className={cn(
                  "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
                  colors.textInverted
                )}
              >
                Update Profile
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/hub/gigs?tab=all")}
                className={cn(colors.border, colors.hoverBg)}
              >
                Browse Available Gigs
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
