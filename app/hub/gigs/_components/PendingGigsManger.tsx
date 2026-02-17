// components/gigs/PendingGigsManager.tsx - Complete fixed version
import React, { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/useCurrentUser";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  Search,
  Calendar,
  MapPin,
  DollarSign,
  Music,
  Users,
  Briefcase,
  Clock,
  Eye,
  Heart,
  Star,
  TrendingUp,
  User as UserIcon,
  Users2,
  Mic,
  Volume2,
  CheckCircle,
  XCircle,
  Sparkles,
  Filter,
  History,
  Star as StarIcon,
  MessageSquare,
  FileText,
  MapPin as MapPinIcon,
  Tag,
  Grid,
  List,
  CalendarDays,
  Kanban,
} from "lucide-react";

import { filterUserApplications } from "@/utils";
import { useUserApplications } from "@/hooks/useAllGigs";

interface PendingGigsManagerProps {
  initialUser?: any;
}

type DisplayMode = "grid" | "timeline" | "list" | "calendar" | "kanban";
type GigStatus =
  | "interested"
  | "applied"
  | "shortlisted"
  | "completed"
  | "history";

export const PendingGigsManager: React.FC<PendingGigsManagerProps> = ({
  initialUser,
}) => {
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<GigStatus | "all">("all");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("timeline");

  const user = currentUser || initialUser;

  const { categorizedApplications, isLoading } = useUserApplications(user?._id);

  // Then use directly:
  const safeCategorizedApplications = useMemo(
    () => ({
      all: categorizedApplications.all || [],
      interested: categorizedApplications.interested || [],
      applied: categorizedApplications.applied || [],
      shortlisted: categorizedApplications.shortlisted || [],
      history: categorizedApplications.history || [],
    }),
    [categorizedApplications],
  );
  const filteredGigs = useMemo(() => {
    let gigs = [];

    switch (activeTab) {
      case "interested":
        gigs = safeCategorizedApplications.interested;
        break;
      case "applied":
        gigs = safeCategorizedApplications.applied;
        break;
      case "shortlisted":
        gigs = safeCategorizedApplications.shortlisted;
        break;
      case "completed":
      case "history":
        gigs = safeCategorizedApplications.history;
        break;
      default:
        gigs = safeCategorizedApplications.all;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      gigs = gigs.filter(
        (gig: any) =>
          gig.title?.toLowerCase().includes(query) ||
          gig.location?.toLowerCase().includes(query) ||
          gig.applicationDetails?.role?.toLowerCase().includes(query) ||
          gig.bussinesscat?.toLowerCase().includes(query) ||
          gig.applicationDetails?.status?.toLowerCase().includes(query),
      );
    }

    return gigs;
  }, [activeTab, searchQuery, safeCategorizedApplications]);

  const getStatusBadge = (gig: any) => {
    if (gig.isHistorical) {
      const status = gig.applicationDetails?.status || "completed";
      return {
        label: status.charAt(0).toUpperCase() + status.slice(1),
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: <History className="w-3 h-3 mr-1" />,
      };
    }

    const { userStatus, gigType, applicationDetails } = gig;

    const badges = {
      interested: {
        label: "Shown Interest",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <Heart className="w-3 h-3 mr-1" />,
      },
      applied: {
        label:
          gigType === "band-role"
            ? `Applied: ${applicationDetails?.role || "Role"}`
            : gigType === "full-band"
              ? "Applied with Band"
              : "Applied",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <Briefcase className="w-3 h-3 mr-1" />,
      },
      shortlisted: {
        label:
          gigType === "band-role"
            ? `Shortlisted: ${applicationDetails?.role || "Role"}`
            : gigType === "full-band"
              ? "Band Shortlisted"
              : "Shortlisted",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <Star className="w-3 h-3 mr-1" />,
      },
      completed: {
        label: "Completed",
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: <CheckCircle className="w-3 h-3 mr-1" />,
      },
    };

    return (
      badges[userStatus as keyof typeof badges] || {
        label: "Involved",
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: <UserIcon className="w-3 h-3 mr-1" />,
      }
    );
  };

  const getGigIcon = (gig: any) => {
    if (gig.isHistorical) {
      return <History className="w-5 h-5 text-gray-500" />;
    }

    if (gig.gigType === "full-band") {
      return <Users2 className="w-5 h-5 text-orange-500" />;
    }

    if (gig.gigType === "band-role") {
      const { applicationDetails } = gig;
      const role = applicationDetails?.role?.toLowerCase();

      const roleIconMap: Record<string, React.ReactNode> = {
        vocalist: <Mic className="w-5 h-5 text-pink-500" />,
        dj: <Volume2 className="w-5 h-5 text-purple-500" />,
        mc: <Mic className="w-5 h-5 text-red-500" />,
        guitar: <Music className="w-5 h-5 text-blue-500" />,
        drums: <Music className="w-5 h-5 text-amber-500" />,
        piano: <Music className="w-5 h-5 text-green-500" />,
        bass: <Music className="w-5 h-5 text-indigo-500" />,
        saxophone: <Music className="w-5 h-5 text-teal-500" />,
        trumpet: <Music className="w-5 h-5 text-yellow-500" />,
      };

      return (
        roleIconMap[role || ""] || (
          <Briefcase className="w-5 h-5 text-purple-500" />
        )
      );
    }

    switch (gig.bussinesscat) {
      case "mc":
        return <Mic className="w-5 h-5 text-red-500" />;
      case "dj":
        return <Volume2 className="w-5 h-5 text-purple-500" />;
      case "vocalist":
        return <Music className="w-5 h-5 text-green-500" />;
      case "full":
        return <Users className="w-5 h-5 text-orange-500" />;
      default:
        return <Briefcase className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatDate = (date: number) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatFullDate = (date: number) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function for price display
  const getPriceDisplay = (gig: any): { text: string; color: string } => {
    if (gig.price === undefined || gig.price === null) {
      return { text: "Negotiable", color: "text-gray-600" };
    }
    if (gig.price === 0) {
      return { text: "Free", color: "text-green-500" };
    }
    return { text: `$${gig.price}`, color: "text-green-600" };
  };

  const tabCounts = {
    all: safeCategorizedApplications.all.length,
    interested: safeCategorizedApplications.interested.length,
    applied: safeCategorizedApplications.applied.length,
    shortlisted: safeCategorizedApplications.shortlisted.length,
    history: safeCategorizedApplications.history.length,
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="space-y-4">
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (safeCategorizedApplications.all.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent className="space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 mb-6">
            <Sparkles className="w-10 h-10 text-gray-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">No Gig Applications Yet</h3>
            <p className="text-gray-500 mb-6">
              You haven't applied to or shown interest in any gigs yet.
            </p>
          </div>
          <Button
            onClick={() => router.push("/hub/gigs")}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Browse Available Gigs
          </Button>
        </CardContent>
      </Card>
    );
  }

  const renderGigsView = () => {
    switch (displayMode) {
      case "grid":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGigs.map((gig: any) => (
              <motion.div
                key={gig._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -4 }}
              >
                <Card
                  className={cn(
                    "h-full hover:shadow-lg transition-shadow cursor-pointer group",
                    gig.isHistorical &&
                      "bg-gradient-to-br from-gray-50 to-slate-50",
                  )}
                  onClick={() => router.push(`/gigs/${gig._id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-lg",
                            gig.isHistorical
                              ? "bg-gray-100"
                              : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-orange-100 group-hover:to-orange-200",
                          )}
                        >
                          {getGigIcon(gig)}
                        </div>
                        <div>
                          <h3 className="font-bold line-clamp-1">
                            {gig.title}
                          </h3>
                          <Badge
                            className={cn(
                              "text-xs mt-1",
                              getStatusBadge(gig).color,
                            )}
                          >
                            {getStatusBadge(gig).icon}
                            {getStatusBadge(gig).label}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {gig.isHistorical && gig.applicationDetails && (
                      <div className="mb-3 space-y-2">
                        <div className="text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Completed:</span>
                            <span className="text-gray-600">
                              {formatFullDate(
                                gig.applicationDetails.completedDate ||
                                  gig.date,
                              )}
                            </span>
                          </div>
                        </div>

                        {gig.applicationDetails.finalPrice && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">Final Price:</span>
                            <span className="font-bold text-green-600">
                              ${gig.applicationDetails.finalPrice}
                            </span>
                          </div>
                        )}

                        {gig.applicationDetails.rating && (
                          <div className="flex items-center gap-1">
                            <StarIcon className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm">
                              {gig.applicationDetails.rating}/5
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {!gig.isHistorical && gig.applicationDetails && (
                      <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                        {gig.applicationDetails.type === "band-role" && (
                          <div className="text-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                {gig.applicationDetails.role}
                              </span>
                              <span className="text-xs text-gray-500">
                                {gig.applicationDetails.roleSlots || "N/A"}{" "}
                                slots
                              </span>
                            </div>
                          </div>
                        )}

                        {gig.applicationDetails.type === "full-band" && (
                          <div className="text-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                {gig.applicationDetails.bandName}
                              </span>
                              <span className="text-xs text-gray-500">
                                {gig.applicationDetails.memberCount || 0}{" "}
                                members
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{formatDate(gig.date)}</span>
                        {gig.time?.start && !gig.isHistorical && (
                          <>
                            <Clock className="w-4 h-4 text-gray-400 ml-2" />
                            <span>{gig.time.start}</span>
                          </>
                        )}
                      </div>

                      {gig.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{gig.location}</span>
                        </div>
                      )}

                      {gig.price && gig.price > 0 && !gig.isHistorical && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span className="font-semibold">${gig.price}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/gigs/${gig._id}`);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>

                      {gig.isHistorical ? (
                        <>
                          {gig.applicationDetails?.rating && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                // View rating/feedback
                              }}
                            >
                              <StarIcon className="w-4 h-4 mr-2" />
                              Rating
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              // View invoice/receipt
                            }}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Receipt
                          </Button>
                        </>
                      ) : (
                        gig.userStatus === "interested" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle withdraw interest
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Withdraw
                          </Button>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        );

      case "list":
        return (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredGigs.map((gig: any) => (
                  <div
                    key={gig._id}
                    className="p-4 hover:bg-gray-50 cursor-pointer flex items-center gap-4"
                    onClick={() => router.push(`/gigs/${gig._id}`)}
                  >
                    <div className="flex-1 flex items-center gap-4">
                      {getGigIcon(gig)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{gig.title}</span>
                          <Badge
                            variant="outline"
                            className={getStatusBadge(gig).color}
                          >
                            {getStatusBadge(gig).label}
                          </Badge>
                          {gig.applicationDetails?.role && (
                            <Badge variant="secondary">
                              {gig.applicationDetails.role}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(gig.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {gig.location || "Location not specified"}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {gig.price ? `$${gig.price}` : "Negotiable"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/gigs/${gig._id}`);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle message
                        }}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case "kanban":
        return (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[
              {
                id: "interested",
                title: "Interested",
                icon: Heart,
                color: "blue",
              },
              {
                id: "applied",
                title: "Applied",
                icon: Briefcase,
                color: "yellow",
              },
              {
                id: "shortlisted",
                title: "Shortlisted",
                icon: Star,
                color: "green",
              },
              { id: "history", title: "History", icon: History, color: "gray" },
            ].map((column) => (
              <div key={column.id} className="flex-shrink-0 w-80">
                <Card>
                  <CardContent className="p-0">
                    <div
                      className={cn(
                        "p-4 border-b flex items-center gap-2",
                        column.color === "blue" && "bg-blue-50 border-blue-200",
                        column.color === "yellow" &&
                          "bg-yellow-50 border-yellow-200",
                        column.color === "green" &&
                          "bg-green-50 border-green-200",
                        column.color === "gray" && "bg-gray-50 border-gray-200",
                      )}
                    >
                      <column.icon
                        className={cn(
                          "w-5 h-5",
                          column.color === "blue" && "text-blue-600",
                          column.color === "yellow" && "text-yellow-600",
                          column.color === "green" && "text-green-600",
                          column.color === "gray" && "text-gray-600",
                        )}
                      />
                      <h3 className="font-bold">{column.title}</h3>
                      <Badge className="ml-auto">
                        {
                          filteredGigs.filter((gig: any) =>
                            column.id === "history"
                              ? gig.isHistorical
                              : gig.userStatus === column.id,
                          ).length
                        }
                      </Badge>
                    </div>

                    <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
                      {filteredGigs
                        .filter((gig: any) =>
                          column.id === "history"
                            ? gig.isHistorical
                            : gig.userStatus === column.id,
                        )
                        .map((gig: any) => (
                          <Card
                            key={gig._id}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => router.push(`/gigs/${gig._id}`)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start gap-2">
                                {getGigIcon(gig)}
                                <div className="flex-1">
                                  <p className="font-medium text-sm line-clamp-1">
                                    {gig.title}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatDate(gig.date)}
                                  </p>
                                  <div className="mt-1">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {gig.bussinesscat || "Gig"}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        );

      case "calendar":
        return (
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-bold text-lg">Calendar View</h3>
                <p className="text-gray-500">Organized by gig dates</p>
              </div>

              <div className="space-y-4">
                {filteredGigs
                  .sort(
                    (a: any, b: any) =>
                      new Date(a.date).getTime() - new Date(b.date).getTime(),
                  )
                  .map((gig: any) => (
                    <div
                      key={gig._id}
                      className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/gigs/${gig._id}`)}
                    >
                      <div className="text-center min-w-16">
                        <div className="text-sm font-bold">
                          {new Date(gig.date).getDate()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(gig.date).toLocaleDateString("en-US", {
                            month: "short",
                          })}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{gig.title}</span>
                          <Badge className={getStatusBadge(gig).color}>
                            {getStatusBadge(gig).label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {gig.time?.start || "Time TBD"}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPinIcon className="w-3 h-3" />
                            {gig.location || "Location TBD"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        );

      case "timeline":
      default:
        return (
          <div className="space-y-6">
            {filteredGigs.map((gig: any, index: number) => (
              <motion.div
                key={gig._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="relative overflow-hidden">
                  {index < filteredGigs.length - 1 && (
                    <div className="absolute left-8 top-14 bottom-0 w-0.5 bg-gray-200" />
                  )}

                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="relative">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            gig.isHistorical
                              ? "bg-gray-200"
                              : gig.userStatus === "shortlisted"
                                ? "bg-green-100 border-2 border-green-500"
                                : gig.userStatus === "applied"
                                  ? "bg-yellow-100 border-2 border-yellow-500"
                                  : "bg-blue-100 border-2 border-blue-500",
                          )}
                        >
                          {gig.isHistorical ? (
                            <CheckCircle className="w-4 h-4 text-gray-600" />
                          ) : gig.userStatus === "shortlisted" ? (
                            <Star className="w-4 h-4 text-green-600" />
                          ) : (
                            getGigIcon(gig)
                          )}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg">{gig.title}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <Badge className={getStatusBadge(gig).color}>
                                {getStatusBadge(gig).icon}
                                {getStatusBadge(gig).label}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {formatDate(gig.date)}
                              </span>
                            </div>
                          </div>
                          {gig.price !== undefined && gig.price !== null && (
                            <div className="flex items-center gap-1">
                              <DollarSign
                                className={cn(
                                  "w-5 h-5",
                                  gig.price === 0
                                    ? "text-gray-500"
                                    : "text-green-500",
                                )}
                              />
                              <span className="font-bold">
                                {gig.price === 0 ? "Free" : `$${gig.price}`}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {gig.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {gig.location}
                              </span>
                            )}
                            {gig.time?.start && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {gig.time.start}
                              </span>
                            )}
                          </div>

                          {gig.applicationDetails && (
                            <div className="text-sm">
                              {gig.applicationDetails.type === "band-role" && (
                                <div className="flex items-center gap-2">
                                  <Tag className="w-4 h-4 text-purple-500" />
                                  <span>
                                    Role: {gig.applicationDetails.role}
                                  </span>
                                </div>
                              )}
                              {gig.applicationDetails.type === "full-band" && (
                                <div className="flex items-center gap-2">
                                  <Users2 className="w-4 h-4 text-orange-500" />
                                  <span>
                                    Band: {gig.applicationDetails.bandName}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {!gig.isHistorical && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-sm">
                              {[
                                "Interested",
                                "Applied",
                                "Shortlisted",
                                "Booked",
                              ].map((step, i) => {
                                const statusIndex = [
                                  "interested",
                                  "applied",
                                  "shortlisted",
                                  "completed",
                                ].indexOf(gig.userStatus);
                                return (
                                  <div
                                    key={step}
                                    className="flex flex-col items-center"
                                  >
                                    <div
                                      className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                                        i <= statusIndex
                                          ? "bg-green-500 text-white"
                                          : "bg-gray-200 text-gray-600",
                                      )}
                                    >
                                      {i < statusIndex ? (
                                        <CheckCircle className="w-4 h-4" />
                                      ) : (
                                        <span>{i + 1}</span>
                                      )}
                                    </div>
                                    <span className="mt-1 text-xs">{step}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                `/hub/gigs/musician/${gig._id}/gig-info`,
                              );
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>

                          {!gig.isHistorical && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle message
                                }}
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Message
                              </Button>

                              {gig.userStatus === "interested" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle withdraw interest
                                  }}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Withdraw
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Gig Applications</h1>
          <p className="text-gray-500">
            Track all gigs you've applied to or shown interest in
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search gigs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
            <Button
              size="sm"
              variant={displayMode === "timeline" ? "secondary" : "ghost"}
              onClick={() => setDisplayMode("timeline")}
              className="h-8 px-3"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={displayMode === "grid" ? "secondary" : "ghost"}
              onClick={() => setDisplayMode("grid")}
              className="h-8 px-3"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={displayMode === "kanban" ? "secondary" : "ghost"}
              onClick={() => setDisplayMode("kanban")}
              className="h-8 px-3"
            >
              <Kanban className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={displayMode === "calendar" ? "secondary" : "ghost"}
              onClick={() => setDisplayMode("calendar")}
              className="h-8 px-3"
            >
              <CalendarDays className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Involved</p>
                <p className="text-2xl font-bold">{tabCounts.all}</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Interested</p>
                <p className="text-2xl font-bold">{tabCounts.interested}</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100">
                <Heart className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Applied</p>
                <p className="text-2xl font-bold">{tabCounts.applied}</p>
              </div>
              <div className="p-2 rounded-lg bg-yellow-100">
                <Briefcase className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Shortlisted</p>
                <p className="text-2xl font-bold">{tabCounts.shortlisted}</p>
              </div>
              <div className="p-2 rounded-lg bg-green-100">
                <Star className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">History</p>
                <p className="text-2xl font-bold">{tabCounts.history}</p>
              </div>
              <div className="p-2 rounded-lg bg-gray-100">
                <History className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "all" | GigStatus)}
      >
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="all">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">All</span>
              {tabCounts.all > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {tabCounts.all}
                </Badge>
              )}
            </div>
          </TabsTrigger>

          <TabsTrigger value="interested">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Interested</span>
              {tabCounts.interested > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {tabCounts.interested}
                </Badge>
              )}
            </div>
          </TabsTrigger>

          <TabsTrigger value="applied">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline">Applied</span>
              {tabCounts.applied > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {tabCounts.applied}
                </Badge>
              )}
            </div>
          </TabsTrigger>

          <TabsTrigger value="shortlisted">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Shortlisted</span>
              {tabCounts.shortlisted > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {tabCounts.shortlisted}
                </Badge>
              )}
            </div>
          </TabsTrigger>

          <TabsTrigger value="history">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
              {tabCounts.history > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {tabCounts.history}
                </Badge>
              )}
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredGigs.length > 0 ? (
            renderGigsView()
          ) : (
            <Card className="text-center py-12">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-gray-100">
                  <Search className="w-8 h-8 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">No gigs found</h3>
                  <p className="text-gray-500">
                    {searchQuery
                      ? `No gigs match "${searchQuery}"`
                      : `No gigs in "${activeTab}" category`}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
