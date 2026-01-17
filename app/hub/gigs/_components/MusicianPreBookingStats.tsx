// components/gigs/MusicianPreBookingStats.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useThemeColors } from "@/hooks/useTheme";
import { Id } from "@/convex/_generated/dataModel";

// Icons
import {
  Users,
  Users2,
  User,
  Bookmark,
  Clock,
  TrendingUp,
  Award,
  Star,
} from "lucide-react";

interface MusicianPreBookingStatsProps {
  allGigs: any[];
  userData: any;
  activeTab: "regular" | "band-roles" | "full-band" | "shortlisted";
}

export const MusicianPreBookingStats: React.FC<
  MusicianPreBookingStatsProps
> = ({ allGigs, userData, activeTab }) => {
  const { colors } = useThemeColors();

  if (!allGigs || !userData) return null;

  // Calculate stats
  const calculateStats = () => {
    const stats = {
      regular: 0,
      bandRoles: 0,
      fullBand: 0,
      shortlisted: 0,
      totalPending: 0,
      bandsAsLeader: 0,
      viewed: 0,
      booked: 0,
      rejected: 0,
    };

    allGigs.forEach((gig: any) => {
      // Check booking history for this user
      if (gig.bookingHistory) {
        gig.bookingHistory.forEach((entry: any) => {
          if (entry.userId === userData._id) {
            if (entry.status === "viewed") stats.viewed++;
            if (entry.status === "booked") stats.booked++;
            if (entry.status === "rejected") stats.rejected++;
          }
        });
      }

      // Regular gig interest
      if (gig.interestedUsers?.includes(userData._id)) {
        stats.regular++;
        stats.totalPending++;
      }

      // Band role applications
      if (gig.bandCategory) {
        const appliedToRole = gig.bandCategory.some((role: any) =>
          role.applicants?.includes(userData._id)
        );
        if (appliedToRole) {
          stats.bandRoles++;
          stats.totalPending++;
        }
      }

      // Full band applications - COUNT BANDS AS LEADER
      if (gig.bookCount) {
        const userBandApplications = gig.bookCount.filter(
          (app: any) => app.appliedBy === userData._id
        );
        if (userBandApplications.length > 0) {
          stats.fullBand += userBandApplications.length;
          stats.totalPending += userBandApplications.length;
          stats.bandsAsLeader += userBandApplications.length;
        }
      }

      // Shortlisted
      if (
        gig.shortlistedUsers?.some((item: any) => item.userId === userData._id)
      ) {
        stats.shortlisted++;
      }
    });

    return stats;
  };

  const stats = calculateStats();

  // Calculate success rate (booked vs total applications)
  const totalApplications = stats.regular + stats.bandRoles + stats.fullBand;
  const successRate =
    totalApplications > 0
      ? Math.round((stats.booked / totalApplications) * 100)
      : 0;

  // Get active tab count
  const getActiveTabCount = () => {
    switch (activeTab) {
      case "regular":
        return stats.regular;
      case "band-roles":
        return stats.bandRoles;
      case "full-band":
        return stats.fullBand;
      case "shortlisted":
        return stats.shortlisted;
      default:
        return 0;
    }
  };

  const activeTabCount = getActiveTabCount();

  return (
    <div className="space-y-4">
      {/* Main Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Total Applications */}
        <Card className={`${colors.card} ${colors.border}`}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${colors.textMuted} mb-1`}>Total Apps</p>
                <p className="text-lg font-bold text-orange-600">
                  {stats.totalPending}
                </p>
              </div>
              <TrendingUp className="w-6 h-6 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        {/* Regular Gigs */}
        <Card className={`${colors.card} ${colors.border}`}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${colors.textMuted} mb-1`}>Regular</p>
                <p className="text-lg font-bold text-blue-600">
                  {stats.regular}
                </p>
              </div>
              <User className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        {/* Band Roles */}
        <Card className={`${colors.card} ${colors.border}`}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${colors.textMuted} mb-1`}>Band Roles</p>
                <p className="text-lg font-bold text-purple-600">
                  {stats.bandRoles}
                </p>
              </div>
              <Users className="w-6 h-6 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        {/* Full Bands */}
        <Card className={`${colors.card} ${colors.border}`}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${colors.textMuted} mb-1`}>Full Bands</p>
                <p className="text-lg font-bold text-pink-600">
                  {stats.fullBand}
                </p>
              </div>
              <Users2 className="w-6 h-6 text-pink-400" />
            </div>
          </CardContent>
        </Card>

        {/* Shortlisted */}
        <Card className={`${colors.card} ${colors.border}`}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${colors.textMuted} mb-1`}>
                  Shortlisted
                </p>
                <p className="text-lg font-bold text-green-600">
                  {stats.shortlisted}
                </p>
              </div>
              <Bookmark className="w-6 h-6 text-green-400" />
            </div>
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card className={`${colors.card} ${colors.border}`}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${colors.textMuted} mb-1`}>
                  Success Rate
                </p>
                <p className="text-lg font-bold text-emerald-600">
                  {successRate}%
                </p>
              </div>
              <Award className="w-6 h-6 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats and Active Tab */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Active Tab Badge */}
        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1">
          {activeTab === "regular" && "🎵 Regular Gigs"}
          {activeTab === "band-roles" && "🎸 Band Roles"}
          {activeTab === "full-band" && "🎷 Full Bands"}
          {activeTab === "shortlisted" && "⭐ Shortlisted"}
          <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
            {activeTabCount} applications
          </span>
        </Badge>

        {/* Band Leader Stats */}
        {stats.bandsAsLeader > 0 && (
          <Badge
            variant="outline"
            className="border-indigo-300 text-indigo-700"
          >
            🎸 {stats.bandsAsLeader} as Band Leader
          </Badge>
        )}

        {/* Viewed Stats */}
        {stats.viewed > 0 && (
          <Badge variant="outline" className="border-blue-300 text-blue-700">
            👁️ {stats.viewed} profile views
          </Badge>
        )}

        {/* Booked Stats */}
        {stats.booked > 0 && (
          <Badge variant="outline" className="border-green-300 text-green-700">
            ✅ {stats.booked} booked
          </Badge>
        )}

        {/* Rejected Stats */}
        {stats.rejected > 0 && (
          <Badge variant="outline" className="border-red-300 text-red-700">
            ❌ {stats.rejected} not selected
          </Badge>
        )}
      </div>
    </div>
  );
};
