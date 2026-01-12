// components/gigs/tabs/BandRolesTab.tsx
import React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, Eye, Bookmark, XCircle, Users, ShoppingBag } from "lucide-react";
import { ChatIcon } from "@/components/chat/ChatIcon";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Applicant, GigWithApplicants } from "@/types/bookings";
interface BandRolesTabProps {
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
  handleBookMusician: (userId: Id<"users">, userName: string) => void; // Add this
  getStatusColor: (status: string) => string;
  getRoleIcon: (roleType: string) => string;
}

export const BandRolesTab: React.FC<BandRolesTabProps> = ({
  selectedGigData,
  filteredApplicants,
  handleAddToShortlist,
  handleRemoveFromShortlist,
  handleViewProfile,
  handleBookMusician, // Add this
  getStatusColor,
  getRoleIcon,
}) => {
  // ... existing code ...

  // In the applicant card JSX, add the Book Now button:
  return (
    <div className="space-y-4">
      {filteredApplicants && filteredApplicants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApplicants.map((applicant) => {
            const userData = selectedGigData.userDetails.get(applicant.userId);
            if (!userData) return null;

            const isShortlisted = selectedGigData.shortlisted.some(
              (item: any) =>
                item.userId === applicant.userId &&
                item.bandRoleIndex === applicant.bandRoleIndex
            );

            return (
              <motion.div
                key={`${applicant.userId}-${applicant.bandRoleIndex}`}
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-green-100">
                  <CardContent className="p-4">
                    {/* ... existing header, stats, etc ... */}

                    {/* Actions - Updated to include Book Now */}
                    <div className="flex flex-col gap-2">
                      {/* Top row: Profile, Chat, Shortlist/Remove */}
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
                          Profile
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
                                applicant.userId,
                                applicant.bandRoleIndex
                              )
                            }
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() =>
                              handleAddToShortlist(
                                selectedGigData.gig._id,
                                applicant.userId,
                                applicant.bandRole,
                                applicant.bandRoleIndex
                              )
                            }
                          >
                            <Bookmark className="w-4 h-4 mr-2" />
                            Shortlist
                          </Button>
                        )}
                      </div>

                      {/* Bottom row: Book Now button */}
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                        onClick={() =>
                          handleBookMusician(
                            applicant.userId,
                            userData.firstname || userData.username
                          )
                        }
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Book Now
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
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No applicants found</h3>
            <p className="text-gray-500">No band role applicants yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
