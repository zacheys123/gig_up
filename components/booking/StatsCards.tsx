// components/gigs/StatsCards.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { User, Users, Users2, Bookmark } from "lucide-react";

interface StatsCardsProps {
  userGigs: any[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ userGigs }) => {
  const stats = {
    regularGigs:
      userGigs?.filter(
        (g) =>
          !g.isClientBand && g.interestedUsers && g.interestedUsers.length > 0,
      ).length || 0,
    bandRoles:
      userGigs?.filter(
        (g) =>
          g.isClientBand &&
          g.bandCategory &&
          g.bandCategory.some(
            (role: any) => role.applicants && role.applicants.length > 0,
          ),
      ).length || 0,
    fullBands:
      userGigs?.filter(
        (g) =>
          g.isClientBand &&
          (g.bussinesscat?.toLowerCase().includes("band") ||
            (g.bookCount && g.bookCount.length > 0)),
      ).length || 0,
    shortlisted: userGigs?.reduce((acc, gig) => {
      if ("shortlistedUsers" in gig && Array.isArray(gig.shortlistedUsers)) {
        return acc + gig.shortlistedUsers.length;
      }
      return acc;
    }, 0),
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Regular Gigs</p>
              <p className="text-xl font-bold">{stats.regularGigs}</p>
            </div>
            <User className="w-8 h-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Band Roles</p>
              <p className="text-xl font-bold">{stats.bandRoles}</p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Full Bands</p>
              <p className="text-xl font-bold">{stats.fullBands}</p>
            </div>
            <Users2 className="w-8 h-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Shortlisted</p>
              <p className="text-xl font-bold">{stats.shortlisted}</p>
            </div>
            <Bookmark className="w-8 h-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
