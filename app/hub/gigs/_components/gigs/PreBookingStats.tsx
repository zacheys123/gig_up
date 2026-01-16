// components/booking/PreBookingStats.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Bookmark, Users2, User, TrendingUp } from "lucide-react";

interface PreBookingStatsProps {
  userGigs: any[];
  activeTab: "regular" | "band-roles" | "full-band" | "shortlist";
}

export const PreBookingStats: React.FC<PreBookingStatsProps> = ({
  userGigs,
  activeTab,
}) => {
  // Calculate stats from raw data
  const stats = {
    regular: {
      count:
        userGigs?.reduce((total, gig) => {
          if (!gig.isClientBand && gig.interestedUsers) {
            return total + gig.interestedUsers.length;
          }
          return total;
        }, 0) || 0,
      pending:
        userGigs?.reduce((total, gig) => {
          if (!gig.isClientBand && gig.interestedUsers && !gig.isTaken) {
            return total + gig.interestedUsers.length;
          }
          return total;
        }, 0) || 0,
      activeGigs:
        userGigs?.filter((g) => !g.isClientBand && !g.isTaken).length || 0,
    },
    bandRoles: {
      count:
        userGigs?.reduce((total, gig) => {
          if (gig.isClientBand && gig.bandCategory) {
            return (
              total +
              gig.bandCategory.reduce((roleTotal: number, role: any) => {
                return roleTotal + (role.applicants?.length || 0);
              }, 0)
            );
          }
          return total;
        }, 0) || 0,
      pending:
        userGigs?.reduce((total, gig) => {
          if (gig.isClientBand && gig.bandCategory && !gig.isTaken) {
            return (
              total +
              gig.bandCategory.reduce((roleTotal: number, role: any) => {
                return roleTotal + (role.applicants?.length || 0);
              }, 0)
            );
          }
          return total;
        }, 0) || 0,
      activeGigs:
        userGigs?.filter((g) => g.isClientBand && g.bandCategory && !g.isTaken)
          .length || 0,
    },
    fullBand: {
      count:
        userGigs?.reduce((total, gig) => {
          if (gig.isClientBand && gig.bookCount) {
            return total + gig.bookCount.length;
          }
          return total;
        }, 0) || 0,
      pending:
        userGigs?.reduce((total, gig) => {
          if (gig.isClientBand && gig.bookCount && !gig.isTaken) {
            return total + gig.bookCount.length;
          }
          return total;
        }, 0) || 0,
      activeGigs:
        userGigs?.filter((g) => g.isClientBand && g.bookCount && !g.isTaken)
          .length || 0,
    },
    shortlist: {
      count:
        userGigs?.reduce((total, gig) => {
          return total + (gig.shortlistedUsers?.length || 0);
        }, 0) || 0,
      pending:
        userGigs?.reduce((total, gig) => {
          if (!gig.isTaken) {
            return total + (gig.shortlistedUsers?.length || 0);
          }
          return total;
        }, 0) || 0,
      activeGigs:
        userGigs?.filter((g) => g.shortlistedUsers?.length > 0 && !g.isTaken)
          .length || 0,
    },
  };

  const getActiveStats = () => {
    switch (activeTab) {
      case "regular":
        return stats.regular;
      case "band-roles":
        return stats.bandRoles;
      case "full-band":
        return stats.fullBand;
      case "shortlist":
        return stats.shortlist;
      default:
        return stats.regular;
    }
  };

  const activeStats = getActiveStats();

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Pre-Booking Management
          </h1>
          <p className="text-gray-600 mt-2">
            Review, shortlist, and book musicians for your gigs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="px-3 py-1 text-sm border-blue-200 bg-blue-50 text-blue-700"
          >
            {activeStats.activeGigs} Active Gigs
          </Badge>
          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 text-sm">
            {activeStats.count} Total
          </Badge>
          {activeStats.pending > 0 && (
            <Badge
              variant="secondary"
              className="px-3 py-1 text-sm bg-green-50 text-green-700 border-green-200"
            >
              {activeStats.pending} Pending
            </Badge>
          )}
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border border-blue-100 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 mb-1">Regular</p>
                <p className="text-2xl font-bold text-blue-800">
                  {stats.regular.count}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {stats.regular.activeGigs} active gigs
                </p>
              </div>
              <User className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-purple-100 bg-purple-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 mb-1">Band Roles</p>
                <p className="text-2xl font-bold text-purple-800">
                  {stats.bandRoles.count}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  {stats.bandRoles.activeGigs} active gigs
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-pink-100 bg-pink-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-pink-600 mb-1">Full Bands</p>
                <p className="text-2xl font-bold text-pink-800">
                  {stats.fullBand.count}
                </p>
                <p className="text-xs text-pink-600 mt-1">
                  {stats.fullBand.activeGigs} active gigs
                </p>
              </div>
              <Users2 className="w-8 h-8 text-pink-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-orange-100 bg-orange-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 mb-1">Shortlisted</p>
                <p className="text-2xl font-bold text-orange-800">
                  {stats.shortlist.count}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  {stats.shortlist.activeGigs} active gigs
                </p>
              </div>
              <Bookmark className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
