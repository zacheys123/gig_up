// components/gigs/tabs/RegularGigsTab.tsx
import React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, Eye, Bookmark, XCircle } from "lucide-react";
import { ChatIcon } from "@/components/chat/ChatIcon";
import { motion } from "framer-motion";
import clsx from "clsx";

interface RegularGigsTabProps {
  gigsWithApplicants: any[];
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
  formatTime: (timestamp: number) => string;
  getStatusColor: (status: string) => string;
}

export const RegularGigsTab: React.FC<RegularGigsTabProps> = ({
  selectedGigData,
  filteredApplicants,
  handleAddToShortlist,
  handleRemoveFromShortlist,
  handleViewProfile,
  getStatusColor,
}) => {
  return (
    <div className="space-y-4">
      {filteredApplicants && filteredApplicants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApplicants.map((applicant) => {
            const userData = selectedGigData.userDetails.get(applicant.userId);
            if (!userData) return null;

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
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={userData.picture} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-400 to-cyan-400">
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
                        <p className="text-xs text-gray-500">Gigs</p>
                        <p className="font-semibold">
                          {userData.completedGigsCount || 0}
                        </p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-500">Trust</p>
                        <p className="font-semibold">
                          {userData.trustScore || "90"}%
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
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() =>
                            handleAddToShortlist(
                              selectedGigData.gig._id,
                              applicant.userId
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
            <p className="text-gray-500">No applicants for regular gigs yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
