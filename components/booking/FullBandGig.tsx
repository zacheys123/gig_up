// components/gigs/tabs/FullBandTab.tsx
import React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Star,
  Eye,
  Bookmark,
  XCircle,
  Users2,
  ShoppingBag,
  Calendar,
  MapPin,
  Music,
} from "lucide-react";
import { ChatIcon } from "@/components/chat/ChatIcon";
import { motion } from "framer-motion";
import clsx from "clsx";
import { GigWithApplicants } from "@/types/bookings";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface FullBandTabProps {
  selectedGigData: GigWithApplicants;
  handleAddToShortlist: (
    gigId: Id<"gigs">,
    applicantId: Id<"users">,
    bandRole?: string,
    bandRoleIndex?: number
  ) => Promise<void>;
  handleRemoveFromShortlist: (
    gigId: Id<"gigs">,
    applicantId: Id<"users">,
    bandRoleIndex?: number
  ) => Promise<void>;
  handleViewProfile: (
    gigId: Id<"gigs">,
    applicantId: Id<"users">
  ) => Promise<void>;
  handleBookMusician: (
    userId: Id<"users">,
    userName: string,
    source?: "regular" | "band-role" | "full-band" | "shortlisted",
    bandId?: Id<"bands">,
    bandRoleIndex?: number
  ) => void;
  getStatusColor: (status: string) => string;
}

// Type for band application from bookCount array
type BandBookingEntry = {
  bandId: Id<"bands">;
  appliedAt: number;
  status: "applied" | "shortlisted" | "booked" | "rejected";
  appliedBy: Id<"users">;
  proposedFee?: number;
  notes?: string;
};

export const FullBandTab: React.FC<FullBandTabProps> = ({
  selectedGigData,
  handleAddToShortlist,
  handleRemoveFromShortlist,
  handleViewProfile,
  handleBookMusician,
  getStatusColor,
}) => {
  // Safely cast bookCount data
  const bookCountData = selectedGigData.gig.bookCount || [];
  const bandApplications: BandBookingEntry[] = Array.isArray(bookCountData)
    ? bookCountData
        .filter(
          (item: any) =>
            item &&
            typeof item === "object" &&
            "bandId" in item &&
            "appliedAt" in item &&
            "status" in item &&
            "appliedBy" in item
        )
        .map((item: any) => ({
          bandId: item.bandId as Id<"bands">,
          appliedAt: item.appliedAt,
          status: item.status,
          appliedBy: item.appliedBy as Id<"users">,
          proposedFee: item.proposedFee,
          notes: item.notes,
        }))
    : [];

  // Fetch band details
  const bandIds = bandApplications.map((app) => app.bandId);
  const bandDetails = useQuery(
    api.controllers.bands.getBandsByIds,
    bandIds.length > 0 ? { bandIds } : "skip"
  );

  // Fetch user details for band leaders and appliedBy users
  const userIds = React.useMemo(() => {
    const ids: Id<"users">[] = [];

    // Add appliedBy users from applications
    bandApplications.forEach((app) => {
      ids.push(app.appliedBy);
    });

    // Add band leaders from band details
    if (bandDetails) {
      bandDetails.forEach((band) => {
        if (band?.members) {
          const leader = band.members.find((m: any) => m.isLeader);
          if (leader?.userId) {
            ids.push(leader.userId);
          }
        }
      });
    }

    return [...new Set(ids)]; // Remove duplicates
  }, [bandApplications, bandDetails]);

  const userDetails = useQuery(
    api.controllers.user.getUsersByIds,
    userIds.length > 0 ? { userIds } : "skip"
  );

  // Create maps for easy lookup
  const bandDetailsMap = React.useMemo(() => {
    const map = new Map<Id<"bands">, any>();
    if (bandDetails) {
      bandDetails.forEach((band) => {
        if (band) {
          map.set(band._id, band);
        }
      });
    }
    return map;
  }, [bandDetails]);

  const userDetailsMap = React.useMemo(() => {
    const map = new Map<Id<"users">, any>();
    if (userDetails) {
      userDetails.forEach((user) => {
        if (user) {
          map.set(user._id, user);
        }
      });
    }
    return map;
  }, [userDetails]);

  // Get band leader for a band
  const getBandLeader = (bandData: any) => {
    if (!bandData?.members) return null;
    const leader = bandData.members.find((m: any) => m.isLeader);
    return leader ? userDetailsMap.get(leader.userId) || leader : null;
  };

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

  // Handle booking a band
  const handleBookBand = (
    bandApp: BandBookingEntry,
    bandData: any,
    bandLeader: any
  ) => {
    // For band booking, we need to book the band leader as the representative
    // and pass the bandId for full-band booking
    handleBookMusician(
      bandApp.appliedBy, // Use the person who applied for the band
      bandData?.name || "Band",
      "full-band", // Source type
      bandApp.bandId // Pass the bandId
    );
  };

  if (bandApplications.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Users2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Bands Have Applied</h3>
          <p className="text-gray-500 mb-4">
            No bands have applied to this gig yet. Bands will appear here once
            they apply.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Bands That Have Applied</h3>
        <p className="text-gray-600 text-sm">
          {bandApplications.length} band
          {bandApplications.length !== 1 ? "s" : ""} have applied to this gig
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bandApplications.map((bandApp) => {
          const bandData = bandDetailsMap.get(bandApp.bandId);
          const bandLeader = bandData ? getBandLeader(bandData) : null;
          const appliedByUser = userDetailsMap.get(bandApp.appliedBy);

          if (!bandData) {
            return (
              <Card key={bandApp.bandId} className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gray-100">
                        <Users2 className="w-6 h-6 text-gray-400" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">Loading band...</h4>
                      <Badge variant="outline" className="text-xs">
                        Applied: {formatDate(bandApp.appliedAt)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }

          return (
            <motion.div
              key={bandApp.bandId}
              whileHover={{ y: -4 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow border-purple-100">
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 border-2 border-purple-200">
                        <AvatarImage
                          src={bandData.bandImageUrl}
                          alt={bandData.name}
                        />
                        <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                          {bandData.name?.charAt(0) || (
                            <Users2 className="w-6 h-6" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-lg">
                            {bandData.name || "Unknown Band"}
                          </h4>
                          <Badge
                            className={clsx(
                              "text-xs",
                              getStatusColor(bandApp.status)
                            )}
                          >
                            {bandApp.status.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-500" />
                          <p className="text-sm text-gray-600">
                            {bandData.location || "Location not specified"}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-500" />
                          <p className="text-sm text-gray-600">
                            Applied: {formatDate(bandApp.appliedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Band info sections */}
                  {bandData.genre && bandData.genre.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Music className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Genres
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {bandData.genre
                          .slice(0, 3)
                          .map((g: string, i: number) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-xs"
                            >
                              {g}
                            </Badge>
                          ))}
                        {bandData.genre.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{bandData.genre.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Band stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 bg-gray-50 rounded-lg border">
                      <p className="text-xs text-gray-500 mb-1">Rating</p>
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <p className="font-semibold">
                          {bandData.bandRating?.average?.toFixed(1) || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg border">
                      <p className="text-xs text-gray-500 mb-1">Gigs</p>
                      <p className="font-semibold">{bandData.totalGigs || 0}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg border">
                      <p className="text-xs text-gray-500 mb-1">Members</p>
                      <p className="font-semibold">
                        {bandData.members?.length || 0}
                      </p>
                    </div>
                  </div>

                  {/* Proposed fee */}
                  {bandApp.proposedFee && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm font-semibold text-green-800">
                        Proposed Fee: ${bandApp.proposedFee.toLocaleString()}
                      </p>
                      {bandApp.notes && (
                        <p className="text-xs text-green-600 mt-1">
                          {bandApp.notes}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          if (bandLeader?._id || bandLeader?.userId) {
                            handleViewProfile(
                              selectedGigData.gig._id,
                              bandLeader._id || bandLeader.userId
                            );
                          }
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Band Profile
                      </Button>

                      {bandLeader && (
                        <ChatIcon
                          userId={bandLeader._id || bandLeader.userId}
                          size="sm"
                          variant="cozy"
                          className="flex-1"
                          showText={false}
                        />
                      )}

                      {bandApp.status === "shortlisted" ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="flex-1"
                          onClick={() =>
                            handleRemoveFromShortlist(
                              selectedGigData.gig._id,
                              bandApp.appliedBy
                            )
                          }
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                          onClick={() =>
                            handleAddToShortlist(
                              selectedGigData.gig._id,
                              bandApp.appliedBy
                            )
                          }
                          disabled={bandApp.status === "booked"}
                        >
                          <Bookmark className="w-4 h-4 mr-2" />
                          {bandApp.status === "booked" ? "Booked" : "Shortlist"}
                        </Button>
                      )}
                    </div>

                    {/* Book Band button - Now uses handleBookMusician */}
                    <Button
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                      onClick={() =>
                        handleBookBand(bandApp, bandData, bandLeader)
                      }
                      disabled={
                        bandApp.status === "booked" ||
                        selectedGigData.gig.isTaken
                      }
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      {bandApp.status === "booked"
                        ? "Already Booked"
                        : "Book This Band"}
                    </Button>
                  </div>

                  {/* Applied by info */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Applied by:{" "}
                      <span className="font-medium">
                        {appliedByUser?.firstname ||
                          appliedByUser?.username ||
                          "Unknown"}
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
