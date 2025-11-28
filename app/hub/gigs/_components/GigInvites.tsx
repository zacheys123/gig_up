"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useMutation, useQuery } from "convex/react";
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
  Zap,
  Star,
  Crown,
  AlertTriangle,
  CalendarDays,
  MessageCircle,
  Eye,
  MoreVertical,
  TrendingUp,
  Sparkles,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import GigLoader from "@/components/(main)/GigLoader";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-purple-50/10 to-pink-50/10" />

      <div className="relative container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
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
                "hover:scale-105"
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Hub
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
                      "text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-2"
                    )}
                  >
                    {user.isClient
                      ? "🎯 Sent Invitations"
                      : "🎵 Received Invitations"}
                  </h1>
                  <p className={cn("text-lg font-medium", colors.textMuted)}>
                    {user.isClient
                      ? "Manage your gig invitations and track responses"
                      : "Review opportunities and grow your career"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats & Role Badge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge
                variant={user.isMusician ? "success" : "default"}
                className="text-sm px-4 py-2 font-semibold shadow-sm"
              >
                {user.isMusician
                  ? "🎵 Professional Musician"
                  : "🎯 Event Client"}
              </Badge>
              <div className={cn("h-4 w-px", colors.border)} />
              <span className={cn("text-sm font-medium", colors.textMuted)}>
                {user.isClient
                  ? "You're inviting talent"
                  : "Clients are inviting you"}
              </span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "border-2 text-xs",
                  colors.border,
                  colors.hoverBg
                )}
              >
                <Eye className="w-3 h-3 mr-1" />
                View Tutorial
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs hover:shadow-lg transition-all"
              >
                <MessageCircle className="w-3 h-3 mr-1" />
                Get Help
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {user.isClient ? (
          <ClientInvitesOverview />
        ) : user.isMusician ? (
          <MusicianInvitesOverview />
        ) : (
          <EmptyState type="no-role" colors={colors} />
        )}
      </div>
    </div>
  );
}

// Enhanced Status Badge with Icons and Animations
const StatusBadge = ({
  status,
  gigDate,
}: {
  status: string;
  gigDate?: string;
}) => {
  const { colors } = useThemeColors();
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (gigDate && status === "pending") {
      const updateCountdown = () => {
        const gigTime = new Date(gigDate).getTime();
        const now = new Date().getTime();
        const difference = gigTime - now;

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          setTimeLeft(`${days}d ${hours}h`);
        } else {
          setTimeLeft("Expired");
        }
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 60000);
      return () => clearInterval(interval);
    }
  }, [gigDate, status]);

  const statusConfig = {
    pending: {
      label: timeLeft || "Pending Response",
      icon: Clock4,
      className: cn(
        "bg-orange-500/10 text-orange-700 border-orange-300",
        colors.border
      ),
      gradient: "from-orange-400 to-red-500",
      pulse: true,
    },
    accepted: {
      label: "Confirmed 🎉",
      icon: CheckCircle,
      className: cn(
        "bg-green-500/10 text-green-700 border-green-300",
        colors.border
      ),
      gradient: "from-green-400 to-emerald-500",
      pulse: false,
    },
    declined: {
      label: "Declined",
      icon: XCircle,
      className: cn("bg-red-500/10 text-red-700 border-red-300", colors.border),
      gradient: "from-red-400 to-rose-500",
      pulse: false,
    },
    "deputy-suggested": {
      label: "Deputy Available",
      icon: Users2,
      className: cn(
        "bg-blue-500/10 text-blue-700 border-blue-300",
        colors.border
      ),
      gradient: "from-blue-400 to-cyan-500",
      pulse: true,
    },
    expired: {
      label: "Expired ⏰",
      icon: AlertTriangle,
      className: cn(
        "bg-gray-500/10 text-gray-700 border-gray-300",
        colors.border
      ),
      gradient: "from-gray-400 to-slate-500",
      pulse: false,
    },
    cancelled: {
      label: "Cancelled",
      icon: XCircle,
      className: cn(
        "bg-gray-500/10 text-gray-700 border-gray-300",
        colors.border
      ),
      gradient: "from-gray-400 to-slate-500",
      pulse: false,
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;
  const isExpired = timeLeft === "Expired";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-300",
        config.className,
        config.pulse && "animate-pulse",
        isExpired && "grayscale"
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{config.label}</span>
      {timeLeft && timeLeft !== "Expired" && (
        <div
          className={cn(
            "w-2 h-2 rounded-full animate-ping",
            status === "pending" ? "bg-orange-400" : "bg-blue-400"
          )}
        />
      )}
    </div>
  );
};

const GigCard = ({ gig, isClient, colors, onEdit, onDelete, user }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const isDeputyGig = useMemo(() => {
    if (!user || !gig.bookingHistory) return false;

    return gig.bookingHistory.some(
      (entry: any) => entry.deputySuggestedId === user._id
    );
  }, [gig, user]);

  // Check if user is the original musician
  const isOriginalMusician = useMemo(() => {
    return gig.originalMusicianId === user?._id;
  }, [gig, user]);

  const status = useMemo(() => {
    if (gig.status === "pending") {
      const gigTime = new Date(gig.date).getTime();
      const now = new Date().getTime();
      return gigTime < now ? "expired" : "pending";
    }
    return gig.status;
  }, [gig.status, gig.date]);

  const getPriorityColor = (daysLeft: number) => {
    if (daysLeft < 1) return "bg-red-500";
    if (daysLeft < 3) return "bg-orange-500";
    if (daysLeft < 7) return "bg-yellow-500";
    return "bg-green-500";
  };

  const calculateUrgency = () => {
    if (status !== "pending") return null;

    const gigTime = new Date(gig.date).getTime();
    const now = new Date().getTime();
    const daysLeft = Math.ceil((gigTime - now) / (1000 * 60 * 60 * 24));

    return { daysLeft, color: getPriorityColor(daysLeft) };
  };

  const urgency = calculateUrgency();

  return (
    <>
      <Card
        className={cn(
          "group cursor-pointer border-0 transition-all duration-500 hover:shadow-2xl transform-gpu overflow-hidden",
          colors.card,
          "bg-gradient-to-br from-white to-gray-50/80",
          "hover:bg-gradient-to-br hover:from-white hover:to-orange-50/50",
          isHovered && "scale-[1.02] shadow-xl",
          "relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-orange-500/0 before:via-red-500/0 before:to-pink-500/0 before:transition-all before:duration-500 before:hover:from-orange-500/5 before:hover:via-red-500/5 before:hover:to-pink-500/5"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => (window.location.href = `/hub/gigs/invites/${gig._id}`)}
      >
        {isDeputyGig && (
          <div className="absolute top-4 left-4 z-20">
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 text-xs"
            >
              🎵 Deputy Role
            </Badge>
          </div>
        )}

        {/* Original musician badge */}
        {isOriginalMusician && gig.originalMusicianId && (
          <div className="absolute top-4 left-4 z-20">
            <Badge
              variant="secondary"
              className="bg-purple-100 text-purple-800 text-xs"
            >
              👑 Original Musician
            </Badge>
          </div>
        )}
        {/* Accent Border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500 transform origin-left transition-transform duration-500 group-hover:scale-x-100 scale-x-0" />
        {/* Status Ribbon */}
        <div className="absolute top-4 right-4 z-20">
          <StatusBadge status={status} gigDate={gig.date} />
        </div>
        <div className="absolute top-4 right-4 z-30">
          <ActionMenu
            gig={gig}
            isClient={isClient}
            onEdit={onEdit}
            onDelete={onDelete}
            colors={colors}
          />
        </div>

        {/* Urgency Indicator */}
        {urgency && (
          <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
            <div
              className={cn(
                "w-3 h-3 rounded-full animate-pulse shadow-lg",
                urgency.color
              )}
            />
            <span
              className={cn(
                "text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm border",
                colors.text,
                colors.backgroundMuted,
                colors.border
              )}
            >
              {urgency.daysLeft}d left
            </span>
          </div>
        )}
        {/* Rest of the GigCard content remains the same */}
        <CardHeader className="pb-4 relative z-10 pt-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0 pr-4">
              {/* Category Tag */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />
                <span
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wide",
                    colors.primary
                  )}
                >
                  {gig.gigType}
                </span>
              </div>

              {/* Title */}
              <CardTitle
                className={cn(
                  "text-xl font-bold line-clamp-2 transition-colors duration-300 mb-2",
                  colors.text,
                  "group-hover:text-orange-600"
                )}
              >
                {gig.title}
              </CardTitle>

              {/* Description */}
              <CardDescription
                className={cn(
                  "line-clamp-2 text-sm leading-relaxed",
                  colors.textMuted
                )}
              >
                {gig.description}
              </CardDescription>
            </div>
          </div>

          {/* Progress Bar for Urgency */}
          {urgency && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className={cn("font-medium", colors.textMuted)}>
                  Response Time
                </span>
                <span
                  className={cn(
                    "font-bold",
                    urgency.daysLeft < 3 ? "text-red-500" : "text-green-500"
                  )}
                >
                  {urgency.daysLeft} days remaining
                </span>
              </div>
              <div className="relative">
                <div
                  className={cn("h-2 rounded-full", colors.backgroundMuted)}
                />
                <div
                  className={cn(
                    "absolute top-0 left-0 h-2 rounded-full transition-all duration-1000",
                    urgency.daysLeft < 3
                      ? "bg-gradient-to-r from-red-500 to-orange-500"
                      : "bg-gradient-to-r from-green-500 to-emerald-500"
                  )}
                  style={{
                    width: `${Math.max(0, 100 - (urgency.daysLeft / 14) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4 relative z-10">
          {/* Gig Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all duration-300",
                colors.backgroundMuted,
                "group-hover:bg-white/80",
                "border border-transparent group-hover:border-orange-200"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  "bg-gradient-to-br from-blue-500 to-cyan-500"
                )}
              >
                <Users className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    "text-xs font-medium uppercase tracking-wide",
                    colors.textMuted
                  )}
                >
                  {isClient ? "Musician" : "Client"}
                </div>
                <div
                  className={cn("text-sm font-semibold truncate", colors.text)}
                >
                  {isClient ? gig.musicianName : gig.clientName}
                </div>
              </div>
            </div>

            <div
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all duration-300",
                colors.backgroundMuted,
                "group-hover:bg-white/80",
                "border border-transparent group-hover:border-green-200"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  "bg-gradient-to-br from-green-500 to-emerald-500"
                )}
              >
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    "text-xs font-medium uppercase tracking-wide",
                    colors.textMuted
                  )}
                >
                  Date
                </div>
                <div className={cn("text-sm font-semibold", colors.text)}>
                  {gig.date}
                </div>
              </div>
            </div>

            <div
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all duration-300",
                colors.backgroundMuted,
                "group-hover:bg-white/80",
                "border border-transparent group-hover:border-purple-200"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  "bg-gradient-to-br from-purple-500 to-pink-500"
                )}
              >
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    "text-xs font-medium uppercase tracking-wide",
                    colors.textMuted
                  )}
                >
                  Venue
                </div>
                <div
                  className={cn("text-sm font-semibold truncate", colors.text)}
                >
                  {gig.venue}
                </div>
              </div>
            </div>

            <div
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all duration-300",
                colors.backgroundMuted,
                "group-hover:bg-white/80",
                "border border-transparent group-hover:border-yellow-200"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  "bg-gradient-to-br from-yellow-500 to-amber-500"
                )}
              >
                <Music className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    "text-xs font-medium uppercase tracking-wide",
                    colors.textMuted
                  )}
                >
                  Type
                </div>
                <div className={cn("text-sm font-semibold", colors.text)}>
                  {gig.gigType}
                </div>
              </div>
            </div>
          </div>

          {/* Budget & Duration Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  "bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg"
                )}
              >
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <div
                  className={cn(
                    "text-xs font-medium uppercase tracking-wide",
                    colors.textMuted
                  )}
                >
                  Budget
                </div>
                <div className={cn("text-lg font-bold text-green-600")}>
                  {gig.budget}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  "bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg"
                )}
              >
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div className="text-right">
                <div
                  className={cn(
                    "text-xs font-medium uppercase tracking-wide",
                    colors.textMuted
                  )}
                >
                  Duration
                </div>
                <div className={cn("text-lg font-bold", colors.text)}>
                  {gig.duration}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            className={cn(
              "flex gap-3 pt-4 transition-all duration-300",
              isHovered
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            )}
          >
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

// Enhanced Loading Skeleton (unchanged)
const GigCardSkeleton = ({ colors }: { colors: any }) => (
  <Card
    className={cn(
      "animate-pulse border-0 overflow-hidden",
      colors.card,
      "bg-gradient-to-br from-white to-gray-50/80"
    )}
  >
    {/* Accent Border */}
    <div className="w-full h-1 bg-gray-200" />

    <CardHeader className="pb-4 pt-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div
              className={cn("w-2 h-2 rounded-full", colors.backgroundMuted)}
            ></div>
            <div
              className={cn("h-4 rounded w-20", colors.backgroundMuted)}
            ></div>
          </div>
          <div
            className={cn("h-6 rounded w-3/4", colors.backgroundMuted)}
          ></div>
          <div
            className={cn("h-4 rounded w-full", colors.backgroundMuted)}
          ></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className={cn("h-3 rounded w-16", colors.backgroundMuted)}></div>
          <div className={cn("h-3 rounded w-12", colors.backgroundMuted)}></div>
        </div>
        <div className={cn("h-2 rounded w-full", colors.backgroundMuted)}></div>
      </div>
    </CardHeader>

    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <div
              className={cn("w-10 h-10 rounded-lg", colors.backgroundMuted)}
            ></div>
            <div className="flex-1 space-y-2">
              <div
                className={cn("h-3 rounded w-12", colors.backgroundMuted)}
              ></div>
              <div
                className={cn("h-4 rounded w-16", colors.backgroundMuted)}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <div className="flex items-center gap-3">
          <div
            className={cn("w-12 h-12 rounded-xl", colors.backgroundMuted)}
          ></div>
          <div className="space-y-2">
            <div
              className={cn("h-3 rounded w-12", colors.backgroundMuted)}
            ></div>
            <div
              className={cn("h-5 rounded w-16", colors.backgroundMuted)}
            ></div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={cn("w-12 h-12 rounded-xl", colors.backgroundMuted)}
          ></div>
          <div className="space-y-2 text-right">
            <div
              className={cn("h-3 rounded w-12", colors.backgroundMuted)}
            ></div>
            <div
              className={cn("h-5 rounded w-16", colors.backgroundMuted)}
            ></div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Client-specific overview component
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

  const deleteGig = useMutation(api.controllers.instantGigs.deleteInstantGig);
  const updateGig = useMutation(api.controllers.instantGigs.updateInstantGig);

  const [gigToDelete, setGigToDelete] = useState<any>(null);
  const [gigToEdit, setGigToEdit] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const stats = useMemo(() => {
    if (!clientGigs) return null;
    return {
      total: clientGigs.length,
      pending: clientGigs.filter((g) => g.status === "pending").length,
      accepted: clientGigs.filter((g) => g.status === "accepted").length,
      declined: clientGigs.filter((g) => g.status === "declined").length,
      deputy: clientGigs.filter((g) => g.status === "deputy-suggested").length,
    };
  }, [clientGigs]);

  const handleDeleteGig = async () => {
    if (gigToDelete && user) {
      try {
        await deleteGig({
          gigId: gigToDelete._id,
          clientId: user._id,
        });
        setGigToDelete(null);
      } catch (error) {
        console.error("Failed to delete gig:", error);
      }
    }
  };

  const handleEditGig = async (gigId: string, updates: any) => {
    if (user) {
      try {
        await updateGig({
          gigId: gigId as any,
          clientId: user._id,
          updates,
        });
        setShowEditModal(false);
        setGigToEdit(null);
      } catch (error) {
        console.error("Failed to update gig:", error);
      }
    }
  };

  if (clientGigs === undefined) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <GigCardSkeleton key={i} colors={colors} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Stats Overview */}
      {stats && stats.total > 0 && (
        <div
          className={cn(
            "grid grid-cols-2 lg:grid-cols-5 gap-4 p-6 rounded-3xl border-2 backdrop-blur-sm",
            colors.card,
            colors.border,
            colors.backgroundSecondary
          )}
        >
          <StatCard
            label="Total Invites"
            value={stats.total}
            icon={Zap}
            color="orange"
            colors={colors}
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            icon={Clock4}
            color="yellow"
            colors={colors}
          />
          <StatCard
            label="Accepted"
            value={stats.accepted}
            icon={CheckCircle}
            color="green"
            colors={colors}
          />
          <StatCard
            label="Declined"
            value={stats.declined}
            icon={XCircle}
            color="red"
            colors={colors}
          />
          <StatCard
            label="Deputy"
            value={stats.deputy}
            icon={Users2}
            color="blue"
            colors={colors}
          />
        </div>
      )}

      {/* Gig Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {clientGigs.map((gig) => (
          <GigCard
            key={gig._id}
            gig={gig}
            isClient={true}
            colors={colors}
            onEdit={(gig: any) => {
              setGigToEdit(gig);
              setShowEditModal(true);
            }}
            onDelete={(gig: any) => setGigToDelete(gig)}
            user={user}
          />
        ))}
      </div>

      {/* Empty State */}
      {clientGigs.length === 0 && <EmptyState type="client" colors={colors} />}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        gig={gigToDelete}
        isOpen={!!gigToDelete}
        onClose={() => setGigToDelete(null)}
        onConfirm={handleDeleteGig}
        colors={colors}
      />

      {/* Edit Modal */}
      {gigToEdit && (
        <EditGigModal
          gig={gigToEdit}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setGigToEdit(null);
          }}
          onSave={handleEditGig}
          colors={colors}
        />
      )}
    </div>
  );
}

// Delete Confirmation Modal
const DeleteConfirmationModal = ({
  gig,
  isOpen,
  onClose,
  onConfirm,
  colors,
}: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={cn(
          "w-full max-w-md mx-4 rounded-2xl border-2 shadow-2xl p-6",
          colors.card,
          colors.border,
          "bg-white transform transition-all duration-200 scale-100"
        )}
      >
        {/* Header with icon */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className={cn("text-xl font-bold", colors.text)}>
              Delete Gig Invitation
            </h3>
            <p className={cn("text-sm mt-1", colors.textMuted)}>
              This action cannot be undone
            </p>
          </div>
        </div>

        {/* Gig info */}
        {gig && (
          <div
            className={cn(
              "mb-6 p-4 rounded-lg border",
              colors.border,
              colors.backgroundMuted
            )}
          >
            <p className={cn("font-semibold", colors.text)}>{gig.title}</p>
            <p className={cn("text-sm", colors.textMuted)}>
              {gig.date} • {gig.venue}
            </p>
            <p className={cn("text-sm", colors.textMuted)}>
              Invited: {gig.musicianName}
            </p>
          </div>
        )}

        <p className={cn("text-sm mb-6", colors.textMuted)}>
          Are you sure you want to delete this gig invitation? All data will be
          permanently removed.
        </p>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className={cn("flex-1 border-2", colors.border, colors.hoverBg)}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white border-2 border-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

// Action Menu Component
const ActionMenu = ({ gig, isClient, onEdit, onDelete, colors }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest(".action-menu-container")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative action-menu-container">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 w-8 p-0 rounded-lg backdrop-blur-sm",
          colors.hoverBg
        )}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <MoreVertical className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div
          className={cn(
            "absolute right-0 top-10 z-60 w-48 rounded-lg border shadow-lg py-1", // Increased to z-60
            colors.card,
            colors.border,
            "bg-white"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {isClient && gig.status === "pending" && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(gig);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors hover:bg-gray-100",
                  colors.text
                )}
              >
                <Edit className="w-4 h-4" />
                Edit Gig
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(gig);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors text-red-600 hover:bg-red-50"
                )}
              >
                <Trash2 className="w-4 h-4" />
                Delete Gig
              </button>
            </>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/hub/gigs/invites/${gig._id}`;
              setIsOpen(false);
            }}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors hover:bg-gray-100",
              colors.text
            )}
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
        </div>
      )}
    </div>
  );
};

// Edit Gig Modal Component
const EditGigModal = ({ gig, isOpen, onClose, onSave, colors }: any) => {
  const [formData, setFormData] = useState({
    title: gig.title,
    description: gig.description,
    date: gig.date,
    venue: gig.venue,
    budget: gig.budget,
    gigType: gig.gigType,
    duration: gig.duration,
    setlist: gig.setlist || "",
    fromTime: gig.fromTime || "",
  });

  const handleSave = () => {
    onSave(gig._id, formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={cn(
          "w-full max-w-2xl mx-4 rounded-2xl border shadow-2xl",
          colors.card,
          colors.border,
          "bg-white"
        )}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className={cn("text-2xl font-bold", colors.text)}>
            Edit Gig Details
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className={cn("h-8 w-8 p-0", colors.hoverBg)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={cn("text-sm font-medium", colors.text)}>
                Gig Title
              </label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter gig title"
              />
            </div>
            <div className="space-y-2">
              <label className={cn("text-sm font-medium", colors.text)}>
                Gig Type
              </label>
              <Select
                value={formData.gigType}
                onValueChange={(value) =>
                  setFormData({ ...formData, gigType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gig type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="corporate">Corporate Event</SelectItem>
                  <SelectItem value="private">Private Party</SelectItem>
                  <SelectItem value="concert">Concert</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className={cn("text-sm font-medium", colors.text)}>
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe the gig..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={cn("text-sm font-medium", colors.text)}>
                Date
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className={cn("text-sm font-medium", colors.text)}>
                Time
              </label>
              <Input
                type="time"
                value={formData.fromTime}
                onChange={(e) =>
                  setFormData({ ...formData, fromTime: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={cn("text-sm font-medium", colors.text)}>
              Venue
            </label>
            <Input
              value={formData.venue}
              onChange={(e) =>
                setFormData({ ...formData, venue: e.target.value })
              }
              placeholder="Enter venue address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={cn("text-sm font-medium", colors.text)}>
                Budget
              </label>
              <Input
                value={formData.budget}
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value })
                }
                placeholder="e.g., $500"
              />
            </div>
            <div className="space-y-2">
              <label className={cn("text-sm font-medium", colors.text)}>
                Duration
              </label>
              <Input
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                placeholder="e.g., 3 hours"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={cn("text-sm font-medium", colors.text)}>
              Setlist (Optional)
            </label>
            <Textarea
              value={formData.setlist}
              onChange={(e) =>
                setFormData({ ...formData, setlist: e.target.value })
              }
              placeholder="List songs or requirements..."
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className={cn("flex-1", colors.border, colors.hoverBg)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};
// Musician-specific overview component (unchanged)
function MusicianInvitesOverview() {
  const { user } = useCurrentUser();
  const { colors } = useThemeColors();
  // Get direct gigs
  const directGigs = useQuery(
    api.controllers.instantGigs.getDirectMusicianGigs,
    {
      musicianId: user?._id as any,
    }
  );

  // Get deputy gigs
  const deputyGigs = useQuery(
    api.controllers.instantGigs.getDeputyGigsForMusician,
    {
      musicianId: user?._id as any,
    }
  );
  const allGigs = useMemo(() => {
    const direct = directGigs || [];
    const deputy = deputyGigs || [];

    // Combine and remove duplicates
    const combined = [...direct];
    deputy.forEach((deputyGig) => {
      if (!combined.find((g) => g._id === deputyGig._id)) {
        combined.push(deputyGig);
      }
    });

    return combined;
  }, [directGigs, deputyGigs]);
  const stats = useMemo(() => {
    if (!allGigs) return null;
    return {
      total: allGigs.length,
      pending: allGigs.filter((g) => g.status === "pending").length,
      accepted: allGigs.filter((g) => g.status === "accepted").length,
      declined: allGigs.filter((g) => g.status === "declined").length,
      deputy: allGigs.filter((g) => g.status === "deputy-suggested").length,
    };
  }, [allGigs]);

  if (allGigs === undefined) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <GigCardSkeleton key={i} colors={colors} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Stats Overview */}
      {stats && stats.total > 0 && (
        <div
          className={cn(
            "grid grid-cols-2 lg:grid-cols-5 gap-4 p-6 rounded-3xl border-2 backdrop-blur-sm",
            colors.card,
            colors.border,
            colors.backgroundSecondary
          )}
        >
          <StatCard
            label="Opportunities"
            value={stats.total}
            icon={TrendingUp}
            color="orange"
            colors={colors}
          />
          <StatCard
            label="To Review"
            value={stats.pending}
            icon={Clock4}
            color="yellow"
            colors={colors}
          />
          <StatCard
            label="Confirmed"
            value={stats.accepted}
            icon={CheckCircle}
            color="green"
            colors={colors}
          />
          <StatCard
            label="Declined"
            value={stats.declined}
            icon={XCircle}
            color="red"
            colors={colors}
          />
          <StatCard
            label="Deputy"
            value={stats.deputy}
            icon={Users2}
            color="blue"
            colors={colors}
          />
        </div>
      )}

      {/* Gig Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {allGigs.map((gig) => (
          <GigCard key={gig._id} gig={gig} isClient={false} colors={colors} />
        ))}
      </div>

      {/* Empty State */}
      {allGigs.length === 0 && <EmptyState type="musician" colors={colors} />}
    </div>
  );
}

// Enhanced Stat Card Component (unchanged)
const StatCard = ({ label, value, icon: Icon, color, colors }: any) => {
  const colorConfig = {
    orange: "from-orange-500 to-red-500",
    green: "from-green-500 to-emerald-500",
    yellow: "from-yellow-500 to-amber-500",
    red: "from-red-500 to-rose-500",
    blue: "from-blue-500 to-cyan-500",
  };

  return (
    <div className="text-center group">
      <div
        className={cn(
          "w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
          `bg-gradient-to-br ${colorConfig[color as keyof typeof colorConfig]}`
        )}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className={cn("text-2xl font-bold mb-1", colors.text)}>{value}</div>
      <div className={cn("text-sm font-medium", colors.textMuted)}>{label}</div>
    </div>
  );
};

// Enhanced Empty State Component (unchanged)
const EmptyState = ({ type, colors }: { type: string; colors: any }) => {
  const config = {
    client: {
      icon: Crown,
      title: "No Invitations Sent Yet",
      description:
        "Start building your network by inviting talented musicians to your events. Create professional invitations that stand out.",
      primaryAction: "Create First Invitation",
      secondaryAction: "Browse Templates",
      gradient: "from-orange-500 to-red-600",
    },
    musician: {
      icon: Music,
      title: "No Invitations Received Yet",
      description:
        "Keep your profile updated and availability current to receive more gig opportunities. Great gigs are on their way!",
      primaryAction: "Update Profile",
      secondaryAction: "Browse Gigs",
      gradient: "from-orange-500 to-red-600",
    },
    "no-role": {
      icon: Users,
      title: "Complete Your Profile",
      description:
        "Set up your musician or client profile to start sending and receiving gig invitations.",
      primaryAction: "Setup Profile",
      secondaryAction: "Learn More",
      gradient: "from-gray-500 to-slate-600",
    },
  };

  const currentConfig = config[type as keyof typeof config];
  const Icon = currentConfig.icon;

  return (
    <Card
      className={cn(
        "border-2 border-dashed text-center backdrop-blur-sm",
        colors.card,
        colors.border,
        colors.backgroundSecondary
      )}
    >
      <CardContent className="p-12">
        <div
          className={cn(
            "w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center shadow-2xl",
            `bg-gradient-to-br ${currentConfig.gradient}`
          )}
        >
          <Icon className="w-10 h-10 text-white" />
        </div>
        <h3 className={cn("text-2xl font-bold mb-4", colors.text)}>
          {currentConfig.title}
        </h3>
        <p
          className={cn(
            "max-w-md mx-auto mb-8 text-lg leading-relaxed",
            colors.textMuted
          )}
        >
          {currentConfig.description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className={cn(
              "bg-gradient-to-r hover:shadow-xl transition-all duration-300",
              currentConfig.gradient,
              colors.textInverted
            )}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {currentConfig.primaryAction}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className={cn(
              "border-2 hover:shadow-lg transition-all duration-300",
              colors.border,
              colors.hoverBg
            )}
          >
            {currentConfig.secondaryAction}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
