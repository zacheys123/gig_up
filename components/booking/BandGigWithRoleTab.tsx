// components/gigs/tabs/BandRolesTab.tsx
import React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, Eye, Bookmark, XCircle, Users } from "lucide-react";
import { ChatIcon } from "@/components/chat/ChatIcon";
import { motion } from "framer-motion";
import clsx from "clsx";

interface BandRolesTabProps {
  selectedGigData: any;
  filteredApplicants: any[];
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
  getStatusColor: (status: string) => string;
  getRoleIcon: (roleType: string) => string;
}

export const BandRolesTab: React.FC<BandRolesTabProps> = ({
  selectedGigData,
  filteredApplicants,
  handleAddToShortlist,
  handleRemoveFromShortlist,
  handleViewProfile,
  getStatusColor,
  getRoleIcon,
}) => {
  return (
    <div className="space-y-4">
      {/* Band Role Summary */}
      {selectedGigData.gig.bandCategory && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Band Roles Summary</h3>
          <div className="flex flex-wrap gap-2">
            {selectedGigData.gig.bandCategory.map(
              (role: any, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-sm bg-green-50 text-green-800 border-green-200"
                >
                  {getRoleIcon(role.role)} {role.role} (
                  {role.applicants?.length || 0}/{role.maxSlots})
                </Badge>
              )
            )}
          </div>
        </div>
      )}

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
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={userData.picture} />
                          <AvatarFallback className="bg-gradient-to-r from-green-400 to-emerald-400">
                            {userData.firstname?.charAt(0) ||
                              userData.username?.charAt(0) ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">
                            {userData.firstname || userData.username}
                          </h4>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-500">
                              {userData.roleType || "Musician"}
                            </p>
                            {applicant.bandRole && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                {getRoleIcon(applicant.bandRole)}{" "}
                                {applicant.bandRole}
                              </Badge>
                            )}
                          </div>
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

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-500">Rating</p>
                        <p className="font-semibold flex items-center justify-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          {userData.avgRating?.toFixed(1) || "4.5"}
                        </p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-500">Experience</p>
                        <p className="font-semibold">
                          {userData.experience || "Expert"}
                        </p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-500">Rate</p>
                        <p className="font-semibold">
                          ${userData.rate?.baseRate || "Contact"}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
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
