// app/hub/gigs/_components/InvolvedGigs.tsx

"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Filter,
  Search,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  User,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useThemeColors } from "@/hooks/useTheme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const InvolvedGigs = ({ user }: { user: any }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [viewFilter, setViewFilter] = useState("all");
  const { colors } = useThemeColors();

  // Fetch all gigs from Convex
  const allGigs = useQuery(api.controllers.gigs.getAllActiveGigs, {
    limit: 100,
  });

  // Fetch user's applications from Convex
  const userApplications = useQuery(api.controllers.gigs.getUserApplications, {
    userId: user?._id,
  });

  // Filter gigs based on user involvement
  const involvedGigs = useMemo(() => {
    if (!allGigs || !user) return [];

    const userId = user._id;

    return allGigs.filter((gig: any) => {
      // Check user involvement
      const isClient = gig.postedBy === userId;
      const isBookedMusician = gig.bookedBy === userId;
      const isInBookedUsers =
        Array.isArray(gig.bookedUsers) && gig.bookedUsers.includes(userId);

      // Check band involvement
      let isBookedInBand = false;
      let hasAppliedToBand = false;
      let appliedRole = "";

      if (gig.bandCategory && Array.isArray(gig.bandCategory)) {
        gig.bandCategory.forEach((role: any) => {
          if (
            Array.isArray(role.bookedUsers) &&
            role.bookedUsers.includes(userId)
          ) {
            isBookedInBand = true;
          }
          if (
            Array.isArray(role.applicants) &&
            role.applicants.includes(userId)
          ) {
            hasAppliedToBand = true;
            appliedRole = role.role;
          }
        });
      }

      // Check regular applications from userApplications
      const isInterested =
        Array.isArray(gig.interestedUsers) &&
        gig.interestedUsers.includes(userId);

      return (
        isClient ||
        isBookedMusician ||
        isInBookedUsers ||
        isBookedInBand ||
        hasAppliedToBand ||
        isInterested
      );
    });
  }, [allGigs, user]);

  // Apply additional filters
  const filteredGigs = useMemo(() => {
    if (!involvedGigs || involvedGigs.length === 0) return [];

    let filtered = [...involvedGigs];

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

    // Apply location filter
    if (locationFilter) {
      filtered = filtered.filter(
        (gig: any) =>
          gig.location &&
          gig.location.toLowerCase().includes(locationFilter.toLowerCase()),
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((gig: any) => gig.category === categoryFilter);
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter((gig: any) => {
        const gigDate = new Date(gig.date);
        switch (dateFilter) {
          case "upcoming":
            return gigDate > now;
          case "past":
            return gigDate < now;
          case "today":
            return gigDate.toDateString() === now.toDateString();
          default:
            return true;
        }
      });
    }

    // Apply view filter
    if (viewFilter !== "all" && user) {
      const userId = user._id;
      filtered = filtered.filter((gig: any) => {
        const isClient = gig.postedBy === userId;
        const isBookedMusician = gig.bookedBy === userId;
        const isInBookedUsers =
          Array.isArray(gig.bookedUsers) && gig.bookedUsers.includes(userId);

        let isBookedInBand = false;
        let hasAppliedToBand = false;

        if (gig.bandCategory) {
          gig.bandCategory.forEach((role: any) => {
            if (
              Array.isArray(role.bookedUsers) &&
              role.bookedUsers.includes(userId)
            ) {
              isBookedInBand = true;
            }
            if (
              Array.isArray(role.applicants) &&
              role.applicants.includes(userId)
            ) {
              hasAppliedToBand = true;
            }
          });
        }

        const isInterested =
          Array.isArray(gig.interestedUsers) &&
          gig.interestedUsers.includes(userId);

        switch (viewFilter) {
          case "posted":
            return isClient;
          case "booked":
            return isBookedMusician || isInBookedUsers || isBookedInBand;
          case "applied":
            return hasAppliedToBand || isInterested;
          default:
            return true;
        }
      });
    }

    // Sort by date (newest first)
    return filtered.sort(
      (a: any, b: any) =>
        new Date(b.date || b.createdAt).getTime() -
        new Date(a.date || a.createdAt).getTime(),
    );
  }, [
    involvedGigs,
    searchTerm,
    locationFilter,
    categoryFilter,
    dateFilter,
    viewFilter,
    user,
  ]);

  // Get user's role in a gig
  const getUserRoleInGig = (gig: any): { role: string; badgeColor: string } => {
    const userId = user._id;

    if (gig.postedBy === userId) {
      return {
        role: "Posted",
        badgeColor: "bg-blue-100 text-blue-800",
      };
    }

    if (gig.bookedBy === userId) {
      return {
        role: "Booked",
        badgeColor: "bg-green-100 text-green-800",
      };
    }

    if (Array.isArray(gig.bookedUsers) && gig.bookedUsers.includes(userId)) {
      return {
        role: "Band Member",
        badgeColor: "bg-purple-100 text-purple-800",
      };
    }

    if (gig.bandCategory && Array.isArray(gig.bandCategory)) {
      for (const role of gig.bandCategory) {
        if (
          Array.isArray(role.bookedUsers) &&
          role.bookedUsers.includes(userId)
        ) {
          return {
            role: `Band ${role.role}`,
            badgeColor: "bg-purple-100 text-purple-800",
          };
        }
        if (
          Array.isArray(role.applicants) &&
          role.applicants.includes(userId)
        ) {
          return {
            role: `Applied (${role.role})`,
            badgeColor: "bg-yellow-100 text-yellow-800",
          };
        }
      }
    }

    if (
      Array.isArray(gig.interestedUsers) &&
      gig.interestedUsers.includes(userId)
    ) {
      return {
        role: "Interested",
        badgeColor: "bg-yellow-100 text-yellow-800",
      };
    }

    return {
      role: "Involved",
      badgeColor: "bg-gray-100 text-gray-800",
    };
  };

  // Get gig status badge
  const getGigStatusBadge = (gig: any) => {
    const now = new Date();
    const gigDate = new Date(gig.date);

    if (gig.isTaken) {
      return <Badge className="bg-green-100 text-green-800">✅ Booked</Badge>;
    }

    if (gig.isPending) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">⏳ Pending</Badge>
      );
    }

    if (gigDate < now) {
      return <Badge className="bg-gray-100 text-gray-800">📅 Past</Badge>;
    }

    if (gigDate.toDateString() === now.toDateString()) {
      return <Badge className="bg-blue-100 text-blue-800">📅 Today</Badge>;
    }

    return <Badge className="bg-green-100 text-green-800">📅 Upcoming</Badge>;
  };

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
        <h2 className="text-2xl font-bold mb-2">My Involved Gigs</h2>
        <p className={cn("text-muted-foreground", colors.textMuted)}>
          Gigs where you're involved as a client, musician, or applicant
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search gigs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Location filter */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Location"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category filter */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="wedding">Wedding</SelectItem>
            <SelectItem value="corporate">Corporate</SelectItem>
            <SelectItem value="private">Private Party</SelectItem>
            <SelectItem value="festival">Festival</SelectItem>
          </SelectContent>
        </Select>

        {/* Date filter */}
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="past">Past</SelectItem>
          </SelectContent>
        </Select>

        {/* View filter */}
        <Select value={viewFilter} onValueChange={setViewFilter}>
          <SelectTrigger>
            <SelectValue placeholder="My Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="posted">Posted (Client)</SelectItem>
            <SelectItem value="booked">Booked (Musician)</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Involved
                </p>
                <p className="text-2xl font-bold">{involvedGigs.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  As Client
                </p>
                <p className="text-2xl font-bold">
                  {
                    involvedGigs.filter((g: any) => g.postedBy === user._id)
                      .length
                  }
                </p>
              </div>
              <Briefcase className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  As Musician
                </p>
                <p className="text-2xl font-bold">
                  {
                    involvedGigs.filter(
                      (g: any) =>
                        g.bookedBy === user._id ||
                        (Array.isArray(g.bookedUsers) &&
                          g.bookedUsers.includes(user._id)) ||
                        (g.bandCategory &&
                          g.bandCategory.some(
                            (r: any) =>
                              Array.isArray(r.bookedUsers) &&
                              r.bookedUsers.includes(user._id),
                          )),
                    ).length
                  }
                </p>
              </div>
              <User className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Applied To
                </p>
                <p className="text-2xl font-bold">
                  {
                    involvedGigs.filter(
                      (g: any) =>
                        (Array.isArray(g.interestedUsers) &&
                          g.interestedUsers.includes(user._id)) ||
                        (g.bandCategory &&
                          g.bandCategory.some(
                            (r: any) =>
                              Array.isArray(r.applicants) &&
                              r.applicants.includes(user._id),
                          )),
                    ).length
                  }
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gig List */}
      {filteredGigs.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Gigs Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || locationFilter || viewFilter !== "all"
                ? "Try adjusting your filters"
                : "You're not involved in any gigs yet"}
            </p>
            {!searchTerm && !locationFilter && viewFilter === "all" && (
              <Button
                onClick={() => (window.location.href = "/gigs/explore")}
                variant="outline"
              >
                Explore Available Gigs
              </Button>
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

            return (
              <motion.div
                key={gig._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className={cn(
                    "h-full hover:shadow-md transition-shadow",
                    isPast && "opacity-70",
                  )}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={userRole.badgeColor}>
                        {userRole.role}
                      </Badge>
                      {getGigStatusBadge(gig)}
                    </div>
                    <CardTitle className="text-lg font-semibold line-clamp-1">
                      {gig.title}
                    </CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-1" />
                      {gigDate.toLocaleDateString()} •{" "}
                      {gig.time?.start || "N/A"}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="line-clamp-1">
                          {gig.location || "Location not specified"}
                        </span>
                      </div>

                      {gig.bussinesscat && (
                        <div className="flex items-center text-sm">
                          <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
                          <span>{gig.bussinesscat}</span>
                        </div>
                      )}

                      {gig.price > 0 && (
                        <div className="flex items-center text-sm">
                          <span className="font-semibold">
                            {gig.currency || "KES"} {gig.price.toLocaleString()}
                          </span>
                          {gig.negotiable && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Negotiable
                            </Badge>
                          )}
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {gig.description || "No description provided"}
                      </p>

                      <div className="pt-4 flex justify-between items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            (window.location.href = `/gigs/${gig._id}`)
                          }
                        >
                          View Details
                        </Button>

                        {isPast && (
                          <Badge variant="outline" className="text-xs">
                            Completed
                          </Badge>
                        )}
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
        <h4 className="text-sm font-semibold mb-3">Role Legend</h4>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs">Posted (Client)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs">Booked (Musician)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-xs">Band Member</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs">Applied/Interested</span>
          </div>
        </div>
      </div>
    </div>
  );
};
