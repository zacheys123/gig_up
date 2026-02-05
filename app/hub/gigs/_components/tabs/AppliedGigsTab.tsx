// components/gigs/tabs/AppliedGigsTab.tsx
import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Calendar,
  MapPin,
  DollarSign,
  Music,
  Users,
  Briefcase,
  Clock,
  TrendingUp,
  Eye,
  XCircle,
  Heart,
  CheckCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useThemeColors } from "@/hooks/useTheme";

interface AppliedGigsTabProps {
  user: any;
  allGigs: any[];
  stats: any;
}

export const AppliedGigsTab: React.FC<AppliedGigsTabProps> = ({
  user,
  allGigs,
  stats,
}) => {
  const router = useRouter();
  const { colors } = useThemeColors();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Filter and categorize user's applications
  const { regularGigs, bandRoleGigs, fullBandGigs } = useMemo(() => {
    const regular = [];
    const bandRoles = [];
    const fullBand = [];

    if (!allGigs || !user?._id) {
      return { regularGigs: [], bandRoleGigs: [], fullBandGigs: [] };
    }

    for (const gig of allGigs) {
      const userId = user._id;
      let hasApplied = false;
      let applicationType = "";
      let applicationStatus = "pending";

      // Check regular gig applications
      if (gig.interestedUsers?.includes(userId)) {
        hasApplied = true;
        applicationType = "regular";

        if (gig.shortlistedUsers?.some((su: any) => su.userId === userId)) {
          applicationStatus = "shortlisted";
        }
        if (gig.isTaken && gig.bookedUsers?.includes(userId)) {
          applicationStatus = "booked";
        }
        if (
          gig.bookingHistory?.some(
            (bh: any) => bh.userId === userId && bh.status === "rejected",
          )
        ) {
          applicationStatus = "rejected";
        }
      }

      // Check band role applications
      if (gig.bandCategory) {
        for (const role of gig.bandCategory) {
          if (role.applicants?.includes(userId)) {
            hasApplied = true;
            applicationType = "band-role";
            applicationStatus = "pending";

            if (
              gig.shortlistedUsers?.some(
                (su: any) =>
                  su.userId === userId &&
                  su.bandRoleIndex === gig.bandCategory.indexOf(role),
              )
            ) {
              applicationStatus = "shortlisted";
            }
            if (role.bookedUsers?.includes(userId)) {
              applicationStatus = "booked";
            }
            break;
          }
        }
      }

      // Check full band applications
      if (gig.bookCount?.some((band: any) => band.appliedBy === userId)) {
        hasApplied = true;
        applicationType = "full-band";
        applicationStatus = "pending";

        if (
          gig.shortlistedUsers?.some(
            (su: any) => su.userId === userId && su.bandApplication === true,
          )
        ) {
          applicationStatus = "shortlisted";
        }
        if (
          gig.isTaken &&
          gig.bookedBands?.some(
            (bb: any) => bb.bandId === user.bandLeaderOf?.[0],
          )
        ) {
          applicationStatus = "booked";
        }
      }

      if (hasApplied) {
        const gigWithStatus = {
          ...gig,
          applicationType,
          applicationStatus,
          appliedAt: gig.createdAt, // You might want to store actual application time
        };

        if (applicationType === "regular") {
          regular.push(gigWithStatus);
        } else if (applicationType === "band-role") {
          bandRoles.push(gigWithStatus);
        } else if (applicationType === "full-band") {
          fullBand.push(gigWithStatus);
        }
      }
    }

    return {
      regularGigs: regular,
      bandRoleGigs: bandRoles,
      fullBandGigs: fullBand,
    };
  }, [allGigs, user?._id]);

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "shortlisted":
        return "bg-green-100 text-green-800 border-green-200";
      case "booked":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  // Get application type icon
  const getApplicationIcon = (type: string) => {
    switch (type) {
      case "regular":
        return <Music className="w-4 h-4 text-blue-500" />;
      case "band-role":
        return <Briefcase className="w-4 h-4 text-purple-500" />;
      case "full-band":
        return <Users className="w-4 h-4 text-orange-500" />;
      default:
        return <Music className="w-4 h-4 text-gray-500" />;
    }
  };

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search gigs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs value={typeFilter} onValueChange={setTypeFilter}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="all">All Types</TabsTrigger>
            <TabsTrigger value="regular">Regular</TabsTrigger>
            <TabsTrigger value="band">Band</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
            <TabsTrigger value="booked">Booked</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Gigs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Regular Gigs */}
        {regularGigs.map((gig: any) => (
          <motion.div
            key={gig._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getApplicationIcon(gig.applicationType)}
                    <Badge className={getStatusColor(gig.applicationStatus)}>
                      {gig.applicationStatus}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Regular
                  </Badge>
                </div>

                <h3 className="font-bold text-lg mb-2 line-clamp-2">
                  {gig.title}
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{formatDate(gig.date)}</span>
                  </div>
                  {gig.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{gig.location}</span>
                    </div>
                  )}
                  {gig.price && gig.price > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="font-semibold">${gig.price}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/gigs/${gig._id}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      // Handle withdraw application
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Withdraw
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Show empty state */}
        {regularGigs.length === 0 &&
          bandRoleGigs.length === 0 &&
          fullBandGigs.length === 0 && (
            <Card className="col-span-full text-center py-12">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">No Applications</h3>
                  <p className="text-gray-500">
                    You haven't applied to any gigs yet. Start exploring
                    available gigs!
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/hub/gigs")}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Browse Gigs
                </Button>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
};
