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
} from "lucide-react";
import { ChatIcon } from "@/components/chat/ChatIcon";
import { motion } from "framer-motion";
import clsx from "clsx";
import { GigWithApplicants, Applicant } from "@/types/bookings";

interface FullBandTabProps {
  selectedGigData: GigWithApplicants;
  filteredApplicants: Applicant[];
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
  handleBookMusician: (userId: Id<"users">, userName: string) => void;
  getStatusColor: (status: string) => string;
}

export const FullBandTab: React.FC<FullBandTabProps> = ({
  selectedGigData,
  filteredApplicants,
  handleAddToShortlist,
  handleRemoveFromShortlist,
  handleViewProfile,
  handleBookMusician,
  getStatusColor,
}) => {
  // Filter to only show bands (not individual musicians)
  const bandApplicants = filteredApplicants.filter(
    (applicant) => applicant.isBand || true // Adjust based on your data structure
  );

  // Check if there are existing band members
  const hasBandMembers =
    selectedGigData.gig.bookCount && selectedGigData.gig.bookCount.length > 0;

  return (
    <div className="space-y-4">
      {/* Band Members Summary - Show existing band lineup */}
      {hasBandMembers && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Current Band Lineup</h3>
          <div className="flex flex-wrap gap-2">
            {selectedGigData.gig.bookCount.map((member: any, index: number) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-purple-50 text-purple-800 border-purple-200"
              >
                {member.role}: {member.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {bandApplicants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bandApplicants.map((applicant) => {
            const bandData = selectedGigData.userDetails.get(applicant.userId);
            if (!bandData) return null;

            const isShortlisted = selectedGigData.shortlisted.some(
              (item: any) => item.userId === applicant.userId
            );

            return (
              <motion.div
                key={applicant.userId}
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-purple-100">
                  <CardContent className="p-4">
                    {/* Header with band indicator */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={bandData.picture} />
                          <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400">
                            <Users2 className="w-6 h-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">
                              {bandData.bandName ||
                                bandData.firstname ||
                                bandData.username}
                            </h4>
                            <Badge className="bg-purple-100 text-purple-800 text-xs">
                              🎵 Band
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            {bandData.roleType || "Band"}
                          </p>
                          {applicant.bandRole && (
                            <p className="text-xs text-purple-600 mt-1">
                              Applying as: {applicant.bandRole}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge
                        className={clsx(
                          "text-xs",
                          getStatusColor(applicant.status)
                        )}
                      >
                        {applicant.status.charAt(0).toUpperCase() +
                          applicant.status.slice(1)}
                      </Badge>
                    </div>

                    {/* Band-specific stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-500">Band Rating</p>
                        <p className="font-semibold flex items-center justify-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          {bandData.bandRating?.toFixed(1) ||
                            bandData.avgRating?.toFixed(1) ||
                            "4.5"}
                        </p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-500">Gigs Played</p>
                        <p className="font-semibold">
                          {bandData.bandGigsCount ||
                            bandData.completedGigsCount ||
                            0}
                        </p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-500">Members</p>
                        <p className="font-semibold">
                          {bandData.bandMembersCount || "Full"}
                        </p>
                      </div>
                    </div>

                    {/* Band description if available */}
                    {bandData.bandDescription && (
                      <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <p className="text-xs text-purple-800 line-clamp-2">
                          {bandData.bandDescription}
                        </p>
                      </div>
                    )}

                    {/* Actions for bands */}
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() =>
                            handleViewProfile(
                              selectedGigData.gig._id,
                              applicant.userId
                            )
                          }
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Band Profile
                        </Button>
                        <ChatIcon
                          userId={applicant.userId}
                          size="sm"
                          variant="cozy"
                          className="flex-1"
                          showText={false}
                        />
                        {isShortlisted ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="flex-1"
                            onClick={() =>
                              handleRemoveFromShortlist(
                                selectedGigData.gig._id,
                                applicant.userId
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
                                applicant.userId,
                                applicant.bandRole
                              )
                            }
                          >
                            <Bookmark className="w-4 h-4 mr-2" />
                            Shortlist Band
                          </Button>
                        )}
                      </div>

                      {/* Book Band button */}
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                        onClick={() =>
                          handleBookMusician(
                            applicant.userId,
                            bandData.bandName ||
                              bandData.firstname ||
                              bandData.username
                          )
                        }
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Book This Band
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Users2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Bands Available</h3>
            <p className="text-gray-500 mb-4">
              {hasBandMembers
                ? "This gig already has a full band lineup."
                : "No bands have booked this gig yet. Bands will appear here once they've booked."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
