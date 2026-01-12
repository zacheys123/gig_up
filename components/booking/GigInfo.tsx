// components/gigs/GigInfoCard.tsx
import React from "react";
import {
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Users2,
  Bookmark,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface GigInfoCardProps {
  gig: any;
  activeGigTab: string;
  applicantsCount: number;
  shortlistedCount: number;
  formatDate: (timestamp: number) => string;
  getRoleIcon: (roleType: string) => string;
}

export const GigInfoCard: React.FC<GigInfoCardProps> = ({
  gig,
  activeGigTab,
  applicantsCount,
  shortlistedCount,
  formatDate,
  getRoleIcon,
}) => {
  const getBorderColor = () => {
    switch (activeGigTab) {
      case "shortlist":
        return "border-l-orange-500";
      case "band-roles":
        return "border-l-green-500";
      case "full-band":
        return "border-l-purple-500";
      default:
        return "border-l-blue-500";
    }
  };

  return (
    <Card className={`border-l-4 ${getBorderColor()}`}>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold">{gig.title}</h3>
              {activeGigTab === "band-roles" && (
                <Badge className="bg-green-100 text-green-800">
                  Band Roles
                </Badge>
              )}
              {activeGigTab === "full-band" && (
                <Badge className="bg-purple-100 text-purple-800">
                  Full Band
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
              {gig.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{gig.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(gig.date)}</span>
              </div>
              {gig.price && (
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-600">
                    ${gig.price}
                  </span>
                </div>
              )}
            </div>
            {gig.bandCategory && activeGigTab === "band-roles" && (
              <div className="flex flex-wrap gap-2 mt-3">
                {gig.bandCategory.map((role: any, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {getRoleIcon(role.role)} {role.role} (
                    {role.applicants.length}/{role.maxSlots})
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              {activeGigTab === "shortlist" ? (
                <Badge className="bg-orange-500 text-white">
                  {shortlistedCount} Shortlisted
                </Badge>
              ) : (
                <>
                  <Badge className="bg-blue-500 text-white">
                    {applicantsCount} Applicants
                  </Badge>
                  <Badge className="bg-green-500 text-white">
                    {shortlistedCount} Shortlisted
                  </Badge>
                </>
              )}
            </div>
            {activeGigTab !== "shortlist" && (
              <div className="text-sm text-gray-500">
                Slots: {gig.interestedUsers?.length || 0}/{gig.maxSlots || 10}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
