// app/hub/gigs/_components/BookedGigs.tsx - SHOW ONLY isTaken GIGS

"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  Users,
  Briefcase,
  User,
  CheckCircle,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useThemeColors } from "@/hooks/useTheme";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const BookedGigs = ({ user }: { user: any }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewFilter, setViewFilter] = useState<"all" | "client" | "musician">(
    "all",
  );
  const [dateFilter, setDateFilter] = useState<"all" | "upcoming" | "past">(
    "all",
  );
  const { colors } = useThemeColors();

  // Fetch all gigs from Convex
  const allGigs = useQuery(api.controllers.gigs.getAllActiveGigs, {
    limit: 100,
  });

  // Filter ONLY gigs that are isTaken AND user is involved
  const bookedGigs = useMemo(() => {
    if (!allGigs || !user) return [];

    const userId = user._id;

    // First, filter only isTaken gigs
    const takenGigs = allGigs.filter((gig: any) => gig.isTaken === true);

    // Then filter where user is involved
    return takenGigs.filter((gig: any) => {
      const isClient = gig.postedBy === userId;
      const isBookedMusician = gig.bookedBy === userId;
      const isInBookedUsers =
        Array.isArray(gig.bookedUsers) && gig.bookedUsers.includes(userId);

      // For band gigs, check if user is booked in any role
      let isBookedInBand = false;
      if (gig.bandCategory && Array.isArray(gig.bandCategory)) {
        isBookedInBand = gig.bandCategory.some(
          (role: any) =>
            Array.isArray(role.bookedUsers) &&
            role.bookedUsers.includes(userId),
        );
      }

      return isClient || isBookedMusician || isInBookedUsers || isBookedInBand;
    });
  }, [allGigs, user]);

  // Apply additional filters
  const filteredGigs = useMemo(() => {
    if (!bookedGigs || bookedGigs.length === 0) return [];

    let filtered = [...bookedGigs];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (gig: any) =>
          gig.title.toLowerCase().includes(term) ||
          gig.description.toLowerCase().includes(term) ||
          (gig.location && gig.location.toLowerCase().includes(term)),
      );
    }

    // Apply view filter (client vs musician)
    if (viewFilter !== "all" && user) {
      const userId = user._id;
      filtered = filtered.filter((gig: any) => {
        const isClient = gig.postedBy === userId;
        const isBookedMusician = gig.bookedBy === userId;
        const isInBookedUsers =
          Array.isArray(gig.bookedUsers) && gig.bookedUsers.includes(userId);

        let isBookedInBand = false;
        if (gig.bandCategory && Array.isArray(gig.bandCategory)) {
          isBookedInBand = gig.bandCategory.some(
            (role: any) =>
              Array.isArray(role.bookedUsers) &&
              role.bookedUsers.includes(userId),
          );
        }

        const isMusician =
          isBookedMusician || isInBookedUsers || isBookedInBand;

        if (viewFilter === "client") return isClient;
        if (viewFilter === "musician") return isMusician;
        return true;
      });
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter((gig: any) => {
        const gigDate = new Date(gig.date);
        if (dateFilter === "upcoming") return gigDate >= now;
        if (dateFilter === "past") return gigDate < now;
        return true;
      });
    }

    // Sort by date (upcoming first)
    return filtered.sort(
      (a: any, b: any) =>
        new Date(a.date || a.createdAt).getTime() -
        new Date(b.date || b.createdAt).getTime(),
    );
  }, [bookedGigs, searchTerm, viewFilter, dateFilter, user]);

  // Get user's role in a booked gig
  const getUserRoleInGig = (
    gig: any,
  ): { role: string; badgeColor: string; icon: React.ReactNode } => {
    const userId = user._id;

    if (gig.postedBy === userId) {
      return {
        role: "Client",
        badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <Briefcase className="w-4 h-4" />,
      };
    }

    if (gig.bookedBy === userId) {
      return {
        role: "Booked Musician",
        badgeColor: "bg-green-100 text-green-800 border-green-200",
        icon: <User className="w-4 h-4" />,
      };
    }

    if (Array.isArray(gig.bookedUsers) && gig.bookedUsers.includes(userId)) {
      return {
        role: "Band Member",
        badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
        icon: <Users className="w-4 h-4" />,
      };
    }

    // Check for band role booking
    if (gig.bandCategory && Array.isArray(gig.bandCategory)) {
      for (const role of gig.bandCategory) {
        if (
          Array.isArray(role.bookedUsers) &&
          role.bookedUsers.includes(userId)
        ) {
          return {
            role: `${role.role}`,
            badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
            icon: <Users className="w-4 h-4" />,
          };
        }
      }
    }

    return {
      role: "Booked",
      badgeColor: "bg-gray-100 text-gray-800 border-gray-200",
      icon: <CheckCircle className="w-4 h-4" />,
    };
  };

  // Get gig type
  const getGigType = (gig: any): string => {
    if (gig.isClientBand) {
      const bandRoles = gig.bandCategory?.length || 0;
      return `Band Gig (${bandRoles} roles)`;
    }
    return "Regular Gig";
  };

  // Calculate stats
  const stats = useMemo(() => {
    if (!bookedGigs.length) return null;

    const userId = user?._id;
    const now = new Date();

    const clientGigs = bookedGigs.filter(
      (g: any) => g.postedBy === userId,
    ).length;
    const musicianGigs = bookedGigs.filter((g: any) => {
      const isBookedMusician = g.bookedBy === userId;
      const isInBookedUsers =
        Array.isArray(g.bookedUsers) && g.bookedUsers.includes(userId);
      let isBookedInBand = false;
      if (g.bandCategory) {
        isBookedInBand = g.bandCategory.some(
          (r: any) =>
            Array.isArray(r.bookedUsers) && r.bookedUsers.includes(userId),
        );
      }
      return isBookedMusician || isInBookedUsers || isBookedInBand;
    }).length;

    const upcomingGigs = bookedGigs.filter(
      (g: any) => new Date(g.date) >= now,
    ).length;

    const pastGigs = bookedGigs.filter(
      (g: any) => new Date(g.date) < now,
    ).length;

    return {
      total: bookedGigs.length,
      client: clientGigs,
      musician: musicianGigs,
      upcoming: upcomingGigs,
      past: pastGigs,
      regularGigs: bookedGigs.filter((g: any) => !g.isClientBand).length,
      bandGigs: bookedGigs.filter((g: any) => g.isClientBand).length,
    };
  }, [bookedGigs, user]);

  // Loading state
  if (!allGigs || !user) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <h2 className="text-2xl font-bold">Booked Gigs</h2>
        </div>
        <p className={cn("text-muted-foreground", colors.textMuted)}>
          ✅ Successfully booked gigs where you're involved as a client or
          musician
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Booked
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  As Client
                </p>
                <p className="text-2xl font-bold">{stats.client}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  As Musician
                </p>
                <p className="text-2xl font-bold">{stats.musician}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Upcoming
                </p>
                <p className="text-2xl font-bold">{stats.upcoming}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Regular
                </p>
                <p className="text-2xl font-bold">{stats.regularGigs}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Band
                </p>
                <p className="text-2xl font-bold">{stats.bandGigs}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Input
            placeholder="Search booked gigs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>

        {/* Role filter */}
        <Select
          value={viewFilter}
          onValueChange={(value: any) => setViewFilter(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="client">Client Only</SelectItem>
            <SelectItem value="musician">Musician Only</SelectItem>
          </SelectContent>
        </Select>

        {/* Date filter */}
        <Select
          value={dateFilter}
          onValueChange={(value: any) => setDateFilter(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="past">Past</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Gig List */}
      {filteredGigs.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <CheckCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {bookedGigs.length === 0
                ? "No Booked Gigs Yet"
                : "No Gigs Match Filters"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {bookedGigs.length === 0
                ? "You haven't booked or been booked for any gigs yet"
                : "Try adjusting your filters to see more results"}
            </p>
            {bookedGigs.length === 0 && (
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => (window.location.href = "/gigs/explore")}
                  variant="outline"
                >
                  Explore Gigs
                </Button>
                <Button onClick={() => (window.location.href = "/gigs/create")}>
                  Create a Gig
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGigs.map((gig: any) => {
            const userRole = getUserRoleInGig(gig);
            const gigDate = new Date(gig.date);
            const now = new Date();
            const isPast = gigDate < now;
            const gigType = getGigType(gig);

            return (
              <motion.div
                key={gig._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className={cn(
                    "h-full hover:shadow-md transition-shadow border-2",
                    isPast ? "border-gray-200" : "border-green-200",
                  )}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge
                        className={cn(
                          userRole.badgeColor,
                          "flex items-center gap-1 border",
                        )}
                      >
                        {userRole.icon}
                        {userRole.role}
                      </Badge>

                      <Badge
                        variant={isPast ? "outline" : "default"}
                        className={
                          isPast
                            ? "bg-gray-100 text-gray-800"
                            : "bg-green-100 text-green-800"
                        }
                      >
                        {isPast ? "✅ Completed" : "📅 Upcoming"}
                      </Badge>
                    </div>

                    <CardTitle className="text-lg font-semibold line-clamp-1">
                      {gig.title}
                    </CardTitle>

                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      {gigDate.toLocaleDateString()} •{" "}
                      {gig.time?.start || "N/A"}
                    </div>

                    <Badge variant="outline" className="mt-2 w-fit">
                      {gigType}
                    </Badge>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {gig.location || "Location not specified"}
                        </span>
                      </div>

                      {gig.bussinesscat && (
                        <div className="flex items-center text-sm">
                          <Briefcase className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                          <span>{gig.bussinesscat}</span>
                        </div>
                      )}

                      {/* Show booked price */}
                      {gig.price > 0 && (
                        <div className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                          <span className="font-medium">Booked Price:</span>
                          <span className="font-bold">
                            {gig.currency || "KES"} {gig.price.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {/* Show booked users count for band gigs */}
                      {gig.isClientBand && gig.bandCategory && (
                        <div className="flex items-center text-sm">
                          <Users className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                          <span>
                            {gig.bandCategory.reduce(
                              (total: number, role: any) =>
                                total + (role.bookedUsers?.length || 0),
                              0,
                            )}{" "}
                            musicians booked
                          </span>
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground line-clamp-2 pt-2 border-t">
                        {gig.description || "No description provided"}
                      </p>

                      <div className="pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() =>
                            (window.location.href = `/gigs/${gig._id}`)
                          }
                        >
                          View Booking Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="mt-8 pt-6 border-t">
        <h4 className="text-sm font-semibold mb-3">Booking Status</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs">Client - You posted this gig</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs">Booked Musician - You were hired</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-xs">
              Band Member - Part of a band booking
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="border-2 border-green-200 w-3 h-3 rounded"></div>
            <span className="text-xs">Upcoming gig</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="border-2 border-gray-200 w-3 h-3 rounded"></div>
            <span className="text-xs">Completed gig</span>
          </div>
        </div>
      </div>
    </div>
  );
};
