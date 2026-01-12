// components/gigs/tabs/ShortlistTab.tsx
import React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, Eye, Bookmark, XCircle, ShoppingBag } from "lucide-react";
import { ChatIcon } from "@/components/chat/ChatIcon";
import { motion } from "framer-motion";

interface ShortlistTabProps {
  selectedGigData: any;
  filteredShortlist: any[];
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
  formatTime: (timestamp: number) => string;
}

export const ShortlistTab: React.FC<ShortlistTabProps> = ({
  selectedGigData,
  filteredShortlist,
  handleRemoveFromShortlist,
  handleViewProfile,
  handleBookMusician,
  formatTime,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Shortlisted Musicians</h3>
        <Badge className="bg-orange-100 text-orange-800">
          {filteredShortlist?.length || 0} Musicians
        </Badge>
      </div>

      {filteredShortlist && filteredShortlist.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShortlist.map((shortlistItem) => {
            const userData = selectedGigData.userDetails.get(
              shortlistItem.userId
            );
            if (!userData) return null;

            return (
              <motion.div
                key={shortlistItem.userId}
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-2 border-orange-200">
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12 border-2 border-orange-300">
                          <AvatarImage src={userData.picture} />
                          <AvatarFallback className="bg-gradient-to-r from-orange-400 to-red-400 text-white">
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
                            {shortlistItem.bandRole && (
                              <Badge variant="outline" className="text-xs">
                                {shortlistItem.bandRole}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">
                            Shortlisted{" "}
                            {formatTime(shortlistItem.shortlistedAt)}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                        <Bookmark className="w-3 h-3 mr-1" />
                        Shortlisted
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
                        <p className="text-xs text-gray-500">Rate</p>
                        <p className="font-semibold">
                          ${userData.rate?.baseRate || "Contact"}
                        </p>
                      </div>
                    </div>

                    {/* Notes */}
                    {shortlistItem.notes && (
                      <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
                        <p className="text-xs text-orange-800">
                          {shortlistItem.notes}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() =>
                            handleViewProfile(
                              selectedGigData.gig._id,
                              shortlistItem.userId
                            )
                          }
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Profile
                        </Button>
                        <ChatIcon
                          userId={shortlistItem.userId}
                          size="sm"
                          variant="cozy"
                          className="flex-1"
                          showText={true}
                          text="Chat"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          onClick={() =>
                            handleRemoveFromShortlist(
                              selectedGigData.gig._id,
                              shortlistItem.userId
                            )
                          }
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Remove
                        </Button>

                        <Button
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                          onClick={() =>
                            handleBookMusician(
                              shortlistItem.userId,
                              userData.firstname || userData.username
                            )
                          }
                        >
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          Book Now
                        </Button>
                      </div>
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
            <Bookmark className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Shortlist is empty</h3>
            <p className="text-gray-500 mb-4">
              Shortlist musicians from other tabs to compare and book them here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
